type PrimitiveParam = string | number | boolean;
type ApiParams = Record<string, PrimitiveParam | null | undefined>;

type ApiResponseError = {
    status: number;
    data: unknown;
};

export class ApiClientError extends Error {
    response?: ApiResponseError;
    type?: 'TIMEOUT_ERROR' | 'NETWORK_ERROR';
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
    body?: BodyInit | null;
    params?: ApiParams;
    // Legacy compatibility: some callers pass this as request option instead of 4th arg.
    isCritical?: boolean;
    _isRetryAttempt?: boolean;
};

const DEFAULT_API_BASE_URL = 'https://api.thock.site';

const getApiBaseUrl = (): string => {
    if (import.meta.env.DEV) return '';

    const configured = (import.meta.env.VITE_API_BASE_URL || '').trim();
    const fallback = DEFAULT_API_BASE_URL;
    const candidate = configured || fallback;

    try {
        const parsed = new URL(candidate);
        if (parsed.protocol !== 'https:') {
            console.warn('[apiClient] Non-HTTPS API base URL blocked in production. Falling back to default.');
            return fallback;
        }
        return parsed.origin;
    } catch {
        console.warn('[apiClient] Invalid API base URL. Falling back to default.');
        return fallback;
    }
};

const API_BASE_URL = getApiBaseUrl();
const AUTH_SKIP_REFRESH_PREFIXES = ['/api/v1/auth/login', '/api/v1/auth/refresh', '/api/v1/members/signup'];

class ApiClient {
    private baseURL: string;
    private isRefreshing: boolean;
    private failedQueue: Array<{ resolve: (token: string | null) => void; reject: (error: unknown) => void }>;

    constructor() {
        this.baseURL = API_BASE_URL;
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    private processQueue(error: unknown, token: string | null = null): void {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) reject(error);
            else resolve(token);
        });
        this.failedQueue = [];
    }

    private redirectToLogin(): void {
        window.location.replace('/login');
    }

    private buildUrl(endpoint: string, params?: ApiParams): string {
        if (!endpoint.startsWith('/')) {
            throw new Error('API endpoint must start with "/"');
        }

        if (endpoint.includes('://') || endpoint.startsWith('//')) {
            throw new Error('Absolute endpoint URL is not allowed');
        }

        let url = `${this.baseURL}${endpoint}`;
        if (!params) return url;

        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === null || value === undefined) return;
            queryParams.append(key, String(value));
        });

        const queryString = queryParams.toString();
        if (queryString) url += `?${queryString}`;
        return url;
    }

    private async refreshToken(): Promise<string> {
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        try {
            const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
                cache: 'no-store',
                referrerPolicy: 'strict-origin-when-cross-origin'
            });

            if (!response.ok) throw new Error('Token refresh failed');

            const data = (await response.json()) as { accessToken?: string };
            if (!data.accessToken) throw new Error('Invalid refresh token response');
            sessionStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        } catch (error) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            throw error;
        }
    }

    async request(endpoint: string, options: ApiRequestOptions = {}, isCritical = false): Promise<any> {
        const url = this.buildUrl(endpoint, options.params);
        const { _isRetryAttempt, params: _params, isCritical: _legacyCritical, ...requestInit } = options;

        const isFormData = requestInit.body instanceof FormData;
        const headers = new Headers(requestInit.headers || {});
        if (!isFormData && !headers.has('Content-Type')) {
            headers.set('Content-Type', 'application/json');
        }

        const token = sessionStorage.getItem('accessToken');
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        const config: RequestInit = {
            ...requestInit,
            headers,
            cache: requestInit.cache ?? 'no-store',
            referrerPolicy: requestInit.referrerPolicy ?? 'strict-origin-when-cross-origin'
        };

        try {
            if (import.meta.env.DEV) {
                console.log(`➡️ API 요청: ${config.method || 'GET'} ${url}`);
            }

            const response = await fetch(url, config);

            if (import.meta.env.DEV) {
                console.log(`⬅️ 응답 상태: ${response.status}`);
            }

            const shouldSkipRefresh = AUTH_SKIP_REFRESH_PREFIXES.some((prefix) => endpoint.startsWith(prefix));
            const isRetry = _isRetryAttempt === true;

            if (response.status === 401 && token && !shouldSkipRefresh && !isRetry && !isCritical) {
                if (this.isRefreshing) {
                    return new Promise<string | null>((resolve, reject) => {
                        this.failedQueue.push({ resolve, reject });
                    }).then(() => this.request(endpoint, { ...options, _isRetryAttempt: true }));
                }

                this.isRefreshing = true;
                try {
                    const newToken = await this.refreshToken();
                    this.processQueue(null, newToken);
                    return this.request(endpoint, { ...options, _isRetryAttempt: true });
                } catch (error) {
                    this.processQueue(error, null);
                    this.redirectToLogin();
                    throw error;
                } finally {
                    this.isRefreshing = false;
                }
            }

            if (response.status === 401 && isRetry) {
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                this.redirectToLogin();
                throw new Error('인증 실패: 다시 로그인해주세요.');
            }

            const text = response.status === 204 ? '' : await response.text();
            let data: unknown = null;

            if (text) {
                const contentType = response.headers.get('content-type') || '';
                if (contentType.includes('application/json')) {
                    try {
                        data = JSON.parse(text);
                    } catch {
                        throw new Error('서버 응답을 해석할 수 없습니다.');
                    }
                } else {
                    data = text;
                }
            }

            if (!response.ok) {
                const error = new ApiClientError(
                    (data as { message?: string })?.message || `HTTP error! status: ${response.status}`
                );
                error.response = { status: response.status, data };
                throw error;
            }

            return data;
        } catch (error) {
            const typedError = error as ApiClientError;
            if (!typedError.response) {
                if (typedError.name === 'AbortError') {
                    const timeoutError = new ApiClientError('요청 시간 초과');
                    timeoutError.type = 'TIMEOUT_ERROR';
                    throw timeoutError;
                }
                if (typedError.name === 'TypeError' && String(typedError.message).includes('fetch')) {
                    const networkError = new ApiClientError('서버 연결 실패');
                    networkError.type = 'NETWORK_ERROR';
                    throw networkError;
                }
            }
            throw typedError;
        }
    }

    get(endpoint: string, options: ApiRequestOptions = {}): Promise<any> {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint: string, data: unknown, options: ApiRequestOptions = {}, isCritical = false): Promise<any> {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        const resolvedCritical = isCritical || options.isCritical === true;
        return this.request(endpoint, { ...options, method: 'POST', body }, resolvedCritical);
    }

    put(endpoint: string, data: unknown, options: ApiRequestOptions = {}): Promise<any> {
        return this.request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) });
    }

    delete(endpoint: string, options: ApiRequestOptions = {}): Promise<any> {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    patch(endpoint: string, data: unknown, options: ApiRequestOptions = {}): Promise<any> {
        return this.request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(data) });
    }

    requestWithTimeout(endpoint: string, options: ApiRequestOptions = {}, timeout = 10_000): Promise<any> {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), timeout);
        return this.request(endpoint, { ...options, signal: controller.signal }).finally(() => window.clearTimeout(timeoutId));
    }
}

const apiClient = new ApiClient();
export default apiClient;

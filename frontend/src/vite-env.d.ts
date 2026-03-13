/// <reference types="vite/client" />

interface TossPaymentsInstance {
    requestPayment: (method: string, payload: Record<string, unknown>) => Promise<void>;
}

interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
}

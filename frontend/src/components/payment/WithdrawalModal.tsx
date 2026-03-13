import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import paymentApi from '../../services/api/paymentApi';

/**
 * Withdrawal Modal Component
 * Allows sellers to request withdrawal of their revenue.
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {number} availableAmount - The maximum amount available for withdrawal
 * @param {function} onSuccess - Callback function after successful withdrawal
 */
const WithdrawalModal = ({ isOpen, onClose, availableAmount, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        if (Number(value) > availableAmount) {
            setAmount(availableAmount);
        } else {
            setAmount(value);
        }
    };

    const handleWithdrawal = async () => {
        if (!amount || Number(amount) <= 0) {
            setError('출금할 금액을 올바르게 입력해주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await paymentApi.requestWithdrawal(Number(amount));
            // 백엔드 응답이 단순 문자열일 수 있으므로 확인
            // PaymentController: return ResponseEntity.ok().body(...) -> String

            alert('출금 신청이 완료되었습니다.');
            onSuccess?.();
            onClose();
            setAmount('');
        } catch (err) {
            console.error('출금 신청 실패:', err);
            const errorMessage = err.response?.data?.message || '출금 신청에 실패했습니다. 다시 시도해주세요.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Modal Content
    const modalContent = (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
        }}>
            <div
                style={{
                    width: '100%',
                    maxWidth: '450px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden',
                    transform: 'scale(1)',
                    transition: 'all 0.3s ease'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(to right, #f9fafb, #ffffff)'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>출금 신청</h3>
                    <button
                        onClick={onClose}
                        style={{
                            color: '#9ca3af',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Available Balance Display */}
                    <div style={{
                        backgroundColor: '#eff6ff',
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid #dbeafe'
                    }}>
                        <span style={{ fontSize: '0.875rem', color: '#2563eb', fontWeight: 500, display: 'block', marginBottom: '4px' }}>출금 가능 금액</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                            {availableAmount.toLocaleString()}원
                        </span>
                    </div>

                    {/* Amount Input */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>신청 금액</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={amount ? Number(amount).toLocaleString() : ''}
                                onChange={handleAmountChange}
                                placeholder="0"
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    paddingRight: '36px',
                                    fontSize: '1.125rem',
                                    fontWeight: 500,
                                    border: '1px solid #d1d5db',
                                    borderRadius: '12px',
                                    textAlign: 'right',
                                    outline: 'none',
                                    color: 'black'
                                }}
                            />
                            <span style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#6b7280',
                                fontWeight: 500
                            }}>원</span>
                        </div>
                        {error && (
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#ef4444',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                                onClick={() => setAmount(String(availableAmount))}
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: '#2563eb',
                                    backgroundColor: '#eff6ff',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                전액 선택
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    backgroundColor: '#f9fafb',
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: '1px solid #d1d5db',
                            color: '#374151',
                            fontWeight: 600,
                            backgroundColor: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        취소
                    </button>
                    <button
                        onClick={handleWithdrawal}
                        disabled={isLoading || !amount || Number(amount) <= 0}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            color: 'white',
                            border: 'none',
                            cursor: (isLoading || !amount || Number(amount) <= 0) ? 'not-allowed' : 'pointer',
                            background: (isLoading || !amount || Number(amount) <= 0)
                                ? '#9ca3af'
                                : 'linear-gradient(to right, #2563eb, #4f46e5)',
                            boxShadow: (isLoading || !amount || Number(amount) <= 0)
                                ? 'none'
                                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                    >
                        {isLoading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <svg className="animate-spin" style={{ height: '20px', width: '20px', color: 'white', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                처리 중...
                            </span>
                        ) : '출금 신청하기'}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default WithdrawalModal;

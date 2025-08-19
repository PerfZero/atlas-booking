'use client';

import { useState, useEffect } from 'react';
import styles from './KaspiPayment.module.css';

export default function KaspiPayment({ orderId, amount, tourId, userId, onSuccess, onError }) {
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [redirectUrl, setRedirectUrl] = useState(null);
    const [error, setError] = useState(null);

    const createPayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/kaspi/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_id: orderId,
                    amount: amount,
                    tour_id: tourId,
                    user_id: userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка создания платежа');
            }

            return data.tran_id;
        } catch (err) {
            setError(err.message);
            onError?.(err.message);
            return null;
        }
    };

    const generateQR = async (tranId) => {
        try {
            const response = await fetch('/api/kaspi/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tran_id: tranId,
                    generate_qr: true
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка генерации QR кода');
            }

            if (data.qr_code) {
                setQrCode(data.qr_code);
            }
            if (data.redirect_url) {
                setRedirectUrl(data.redirect_url);
            }

            return data;
        } catch (err) {
            setError(err.message);
            onError?.(err.message);
            return null;
        }
    };

    const handleKaspiPayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const tranId = await createPayment();
            if (!tranId) return;

            const qrData = await generateQR(tranId);
            if (!qrData) return;

            if (qrData.redirect_url) {
                window.location.href = qrData.redirect_url;
            }
        } catch (err) {
            setError(err.message);
            onError?.(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDirectRedirect = async () => {
        setLoading(true);
        setError(null);

        try {
            const tranId = await createPayment();
            if (!tranId) return;

            const response = await fetch('/api/kaspi/generate-qr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tran_id: tranId,
                    generate_qr: false
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Ошибка создания ссылки');
            }

            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            }
        } catch (err) {
            setError(err.message);
            onError?.(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.kaspiPayment}>
            <div className={styles.paymentInfo}>
                <h3>Оплата через Kaspi</h3>
                <div className={styles.orderDetails}>
                    <p><strong>Номер заказа:</strong> {orderId}</p>
                    <p><strong>Сумма:</strong> {amount.toLocaleString()} ₸</p>
                </div>
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {qrCode && (
                <div className={styles.qrSection}>
                    <h4>Отсканируйте QR код в приложении Kaspi</h4>
                    <div className={styles.qrCode}>
                        <img src={`data:image/png;base64,${qrCode}`} alt="QR код для оплаты" />
                    </div>
                    <p className={styles.qrHint}>
                        Откройте приложение Kaspi и отсканируйте QR код для оплаты
                    </p>
                </div>
            )}

            <div className={styles.buttons}>
                {!qrCode && (
                    <button 
                        className={styles.kaspiButton}
                        onClick={handleKaspiPayment}
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : 'Оплатить через Kaspi'}
                    </button>
                )}
                
                <button 
                    className={styles.directButton}
                    onClick={handleDirectRedirect}
                    disabled={loading}
                >
                    {loading ? 'Переход...' : 'Перейти в Kaspi'}
                </button>
            </div>

            <div className={styles.instructions}>
                <h4>Как оплатить:</h4>
                <ol>
                    <li>Нажмите кнопку "Оплатить через Kaspi"</li>
                    <li>Откроется приложение Kaspi с данными заказа</li>
                    <li>Подтвердите оплату в приложении</li>
                    <li>После успешной оплаты вы вернетесь на сайт</li>
                </ol>
            </div>
        </div>
    );
}


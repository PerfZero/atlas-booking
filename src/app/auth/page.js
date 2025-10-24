"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendSMS, verifyCode } from "../../lib/wordpress-api";
import { useAuth } from "../../contexts/AuthContext";
import BottomNavigation from "../components/BottomNavigation";
import styles from "./page.module.css";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [secondsLeft, setSecondsLeft] = useState(59);
  const [isLogin, setIsLogin] = useState(false);
  const [codeError, setCodeError] = useState(false);

  // Booking payload from tour page
  const bookingQuery = searchParams.get("booking") || "";
  const mode = searchParams.get("mode") || "";
  const bookingParams = useMemo(() => {
    try {
      const decoded = decodeURIComponent(bookingQuery);
      return new URLSearchParams(decoded);
    } catch {
      return new URLSearchParams();
    }
  }, [bookingQuery]);

  useEffect(() => {
    if (mode === 'login') {
      setIsLogin(true);
    } else if (mode === 'register') {
      setIsLogin(false);
    }
  }, [mode]);

  useEffect(() => {
    if (step !== "code") return;
    setSecondsLeft(59);
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const maskedPhone = useMemo(() => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 0) return "";
    const cc = `+${digits.slice(0, 1)}`;
    const p1 = digits.slice(1, 4);
    const p2 = digits.slice(4, 7);
    const p3 = digits.slice(7, 9);
    const p4 = digits.slice(9, 11);
    return [cc, p1 && ` ${p1}`, p2 && ` ${p2}`, p3 && ` ${p3}`, p4 && ` ${p4}`]
      .filter(Boolean)
      .join("");
  }, [phone]);

  const canSendCode = phone.replace(/\D/g, "").length >= 11;
  const canConfirm = code.every((c) => c.length === 1);

  const handleSendCode = async () => {
    if (!canSendCode) return;
    
    const cleanPhone = phone.replace(/\D/g, "");
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    
    try {
      const result = await sendSMS(cleanPhone, generatedCode);
      
      if (result.success) {
        setStep("code");
        setCodeError(false);
        // Сохраняем код для проверки (в реальном приложении это должно быть на сервере)
        sessionStorage.setItem('verificationCode', generatedCode);
        sessionStorage.setItem('verificationPhone', cleanPhone);
      } else {
        console.error('Ошибка отправки SMS:', result.error);
        alert('Ошибка отправки SMS. Попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Ошибка отправки SMS:', error);
      alert('Ошибка отправки SMS. Попробуйте еще раз.');
    }
  };

  const handleLogin = () => {
    setIsLogin(true);
  };

  const handleResend = () => {
    if (secondsLeft === 0) setSecondsLeft(59);
  };

  const handleConfirm = async () => {
    if (!canConfirm) return;
    
    const enteredCode = code.join('');
    const cleanPhone = phone.replace(/\D/g, "");
    const storedCode = sessionStorage.getItem('verificationCode');
    const storedPhone = sessionStorage.getItem('verificationPhone');
    
    // Проверяем, что номер телефона совпадает
    if (cleanPhone !== storedPhone) {
      setCodeError(true);
      return;
    }
    
    try {
      const result = await verifyCode(cleanPhone, enteredCode);
      
      if (result.success) {
        setCodeError(false);
        // Очищаем сохраненные данные
        sessionStorage.removeItem('verificationCode');
        sessionStorage.removeItem('verificationPhone');
        
        // Сохраняем данные пользователя
        const cleanPhone = phone.replace(/\D/g, "");
        const userData = {
          phone: cleanPhone,
          name: `Пользователь ${cleanPhone.slice(-4)}`,
          token: result.token,
          isLogin: isLogin
        };
        login(userData);
        
        // Проверяем, есть ли данные для бронирования
        if (bookingQuery) {
          // Перенаправляем на страницу бронирования с данными тура
          router.push(`/booking?${bookingQuery}`);
        } else {
          // Перенаправляем на профиль
          router.push('/profile');
        }
      } else {
        setCodeError(true);
      }
    } catch (error) {
      console.error('Ошибка проверки кода:', error);
      setCodeError(true);
    }
  };

  const handleCodeChange = (idx, value) => {
    const v = value.replace(/\D/g, "").slice(0, 1);
    const next = [...code];
    next[idx] = v;
    setCode(next);

    // Автоматический переход к следующему полю
    if (v && idx < 3) {
      const nextInput = document.querySelector(`input[data-index="${idx + 1}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleCodeKeyDown = (idx, e) => {
    // Обработка Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...code];
      
      // Если поле пустое, переходим к предыдущему полю и очищаем его
      if (!next[idx]) {
        if (idx > 0) {
          next[idx - 1] = '';
          setCode(next);
          const prevInput = document.querySelector(`input[data-index="${idx - 1}"]`);
          if (prevInput) prevInput.focus();
        }
      } else {
        // Если поле не пустое, просто очищаем его
        next[idx] = '';
        setCode(next);
      }
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, "").slice(0, 4);
    
    if (digits.length === 4) {
      const newCode = [...code];
      digits.split('').forEach((digit, idx) => {
        newCode[idx] = digit;
      });
      setCode(newCode);
      
      // Фокус на последнее поле
      const lastInput = document.querySelector(`input[data-index="3"]`);
      if (lastInput) lastInput.focus();
    }
  };

  return (
    <div className={styles.page}>
      {step === "phone" ? (
        <div className={styles.card}>
          <img src="/login.svg" alt="login" className={styles.loginImage} />
          <h1 className={styles.title}>Авторизация аккаунта Atlas</h1>
          <p className={styles.subtitle}>Чтобы продолжить бронирование, пожалуйста, авторизуйтесь</p>

          <input
            className={styles.input}
            placeholder="Введите свой номер телефона"
            value={maskedPhone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
          />


          <button onClick={handleSendCode} disabled={!canSendCode} className={styles.primaryButton}>
            Авторизоваться
          </button>
        </div>
      ) : (
        <div className={`${styles.card} ${styles.codeCard}`}>
          <h2 className={styles.codeTitle}>Мы отправили Вам СМС с кодом верификации на номер {maskedPhone || "+7 ___ ___ __ __"}</h2>
          <div className={styles.helperText}>Введите его ниже</div>

                                           <div className={styles.codeInputs}>
              {code.map((c, idx) => (
                               <input
                   key={idx}
                   data-index={idx}
                   value={c}
                   onChange={(e) => handleCodeChange(idx, e.target.value)}
                   onKeyDown={(e) => handleCodeKeyDown(idx, e)}
                   onPaste={handleCodePaste}
                   inputMode="numeric"
                   className={`${styles.codeInput} ${codeError ? styles.codeInputError : ''}`}
                   autoFocus={idx === 0}
                   placeholder="0"
                 />
              ))}
            </div>
            
            {codeError && (
              <div className={styles.errorMessage}>Неверный код</div>
            )}

          <div className={styles.resend}>
            Отправить код заново через 0:{String(secondsLeft).padStart(2, "0")} {secondsLeft === 0 && (
              <button onClick={handleResend} className={styles.resendButton}>Отправить</button>
            )}
          </div>

          <button onClick={handleConfirm} disabled={!canConfirm} className={styles.primaryButton}>
            Подтвердить
          </button>
        </div>
      )}
      <BottomNavigation />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPageContent />
    </Suspense>
  );
}



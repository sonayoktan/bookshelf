import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Loader2, MailCheck, BookHeart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../lib/supabase';

const MIN_PASSWORD_LENGTH = 6;

// Supabase auth error codes -> user-facing messages
const AUTH_ERROR_MESSAGES = {
  invalid_credentials: 'E-posta veya şifre hatalı.',
  user_already_exists: 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.',
  email_exists: 'Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene.',
  weak_password: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`,
  email_not_confirmed: 'E-posta adresin henüz doğrulanmamış. Gelen kutunu kontrol et.',
  email_address_invalid: 'Geçerli bir e-posta adresi gir.',
  over_email_send_rate_limit: 'Çok fazla deneme yapıldı. Biraz sonra tekrar dene.',
  over_request_rate_limit: 'Çok fazla deneme yapıldı. Biraz sonra tekrar dene.'
};

function getAuthErrorMessage(error) {
  return AUTH_ERROR_MESSAGES[error?.code] || 'Bir şeyler ters gitti. Lütfen tekrar dene.';
}

export default function AuthModal({ isOpen, initialMode = 'sign_in', reason = '', onClose }) {
  const [mode, setMode] = useState(initialMode); // 'sign_in' | 'sign_up'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage('');
      setIsConfirmationSent(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'sign_up' && password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(AUTH_ERROR_MESSAGES.weak_password);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'sign_in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`
          }
        });
        if (error) throw error;

        // No session means the project requires email confirmation
        if (data.session) {
          onClose();
        } else {
          setIsConfirmationSent(true);
        }
      }
      setPassword('');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignUp = mode === 'sign_up';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-pink-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-8 text-black dark:text-zinc-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-pink-200 dark:border-zinc-800 bg-pink-50/80 dark:bg-zinc-850/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#89CFF0]/25 text-sky-800 dark:text-sky-300 flex items-center justify-center">
                <BookHeart className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-black dark:text-zinc-100 font-serif">
                {isSignUp ? 'Kendi Rafını Oluştur' : 'Rafına Giriş Yap'}
              </h2>
            </div>
            <Button variant="ghost" size="iconSm" onClick={onClose} className="cursor-pointer">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {isConfirmationSent ? (
            <div className="p-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
                <MailCheck className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-serif font-bold mb-1">E-postanı kontrol et</h3>
              <p className="text-sm text-gray-700 dark:text-zinc-400 font-medium mb-6">
                <span className="font-bold text-black dark:text-zinc-200">{email}</span> adresine bir doğrulama bağlantısı gönderdik. Bağlantıya tıkladıktan sonra rafın hazır olacak.
              </p>
              <Button variant="babyblue" onClick={onClose} className="cursor-pointer">
                Tamam
              </Button>
            </div>
          ) : (
            <>
              {/* Mode Tabs */}
              <div className="flex border-b border-pink-200 dark:border-zinc-800 bg-pink-50/40 dark:bg-zinc-850/40 px-6 pt-2">
                <button
                  type="button"
                  onClick={() => switchMode('sign_in')}
                  className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    !isSignUp
                      ? 'border-[#89CFF0] text-sky-800 dark:text-sky-300'
                      : 'border-transparent text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Giriş Yap</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('sign_up')}
                  className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    isSignUp
                      ? 'border-[#89CFF0] text-sky-800 dark:text-sky-300'
                      : 'border-transparent text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Kayıt Ol</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {reason && (
                  <p className="text-xs font-medium text-gray-700 dark:text-zinc-300 bg-[#89CFF0]/15 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-900 rounded-xl px-3 py-2">
                    {reason}
                  </p>
                )}

                {isSignUp && (
                  <div className="space-y-1">
                    <label htmlFor="auth-display-name" className="text-xs font-bold text-black dark:text-zinc-200">
                      Adın
                    </label>
                    <Input
                      id="auth-display-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Rafında görünecek isim"
                      autoComplete="name"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label htmlFor="auth-email" className="text-xs font-bold text-black dark:text-zinc-200">
                    E-posta
                  </label>
                  <Input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                    autoFocus={!isSignUp}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="auth-password" className="text-xs font-bold text-black dark:text-zinc-200">
                    Şifre
                  </label>
                  <Input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isSignUp ? `En az ${MIN_PASSWORD_LENGTH} karakter` : '••••••'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    required
                  />
                </div>

                {errorMessage && (
                  <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">
                    {errorMessage}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="babyblue"
                  disabled={isSubmitting}
                  className="w-full gap-2 cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isSignUp ? 'Rafımı Oluştur' : 'Giriş Yap'}</span>
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

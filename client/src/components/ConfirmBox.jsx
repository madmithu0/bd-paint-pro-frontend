import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmBox({
  isOpen,
  onClose,
  onConfirm,
  title = 'Action Confirmation',
  message = 'Enter the security code below to confirm this action.',
  expectedCode = '',
  expirySeconds = 60,
  loading = false,
}) {
  const [inputCode, setInputCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(expirySeconds);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setInputCode('');
    setErrorMsg('');
    setSecondsLeft(expirySeconds);

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, expirySeconds]);

  const handleConfirmClick = () => {
    if (secondsLeft <= 0) {
      setErrorMsg('Confirmation code expired. Please close and try again.');
      return;
    }

    if (expectedCode && inputCode.trim() !== String(expectedCode).trim()) {
      setErrorMsg('Invalid confirmation code.');
      return;
    }

    setErrorMsg('');
    if (onConfirm) {
      onConfirm(inputCode.trim());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirmClick}
      title={title}
      confirmText="Yes, Confirm"
      cancelText="No, Cancel"
      confirmVariant="danger"
      loading={loading}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
          <ShieldAlert size={20} className="shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{message}</p>
        </div>

        {expectedCode && (
          <div className="text-center py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-slate-400 block">Confirmation Code</span>
            <span className="text-lg font-mono font-bold tracking-widest text-blue-600 dark:text-blue-400">
              {expectedCode}
            </span>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <label className="font-medium">Enter Code</label>
            <span className={secondsLeft <= 10 ? 'text-red-600 font-semibold' : 'text-gray-500'}>
              Expires in {secondsLeft}s
            </span>
          </div>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            disabled={secondsLeft <= 0 || loading}
            placeholder="Type confirmation code"
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-transparent text-center font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
          />
        </div>

        {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}
      </div>
    </Modal>
  );
}

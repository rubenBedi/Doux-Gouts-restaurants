/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound, X, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DEFAULT_ADMIN_PIN = '4646';

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsSuccess(false);
      setShake(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handlePinSubmit = (pinToTest: string) => {
    if (pinToTest === DEFAULT_ADMIN_PIN) {
      setIsSuccess(true);
      setError(null);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 400);
    } else {
      setError('Code PIN incorrect');
      setShake(true);
      setPin('');
      setTimeout(() => setShake(false), 500);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePinSubmit(pin);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(null);
      if (newPin.length === 4) {
        handlePinSubmit(newPin);
      }
    }
  };

  const handleDeleteDigit = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0,
          }}
          transition={{ duration: shake ? 0.4 : 0.2 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
          id="admin-pin-modal"
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 bg-gray-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fa8107] flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-black text-base uppercase tracking-tight">
                  Accès Restreint
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">
                  Espace Cuisine & Supervision
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              title="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col items-center text-center space-y-5">
            <div className="space-y-1">
              <div className="text-xs font-bold text-gray-600">
                Veuillez saisir votre code PIN secret
              </div>
              <div className="text-[11px] text-gray-400">
                Accès réservé au personnel en salle et en cuisine.
              </div>
            </div>

            {/* Hidden Input for direct keyboard typing */}
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(val);
                setError(null);
                if (val.length === 4) {
                  handlePinSubmit(val);
                }
              }}
              onKeyDown={handleKeyDown}
              className="opacity-0 absolute -z-10 w-0 h-0"
              autoFocus
            />

            {/* 4-digit circles/boxes */}
            <div 
              onClick={() => inputRef.current?.focus()}
              className="flex justify-center items-center gap-3 cursor-pointer py-2"
            >
              {[0, 1, 2, 3].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                      error
                        ? 'border-red-500 bg-red-50 text-red-600'
                        : isSuccess
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600'
                        : isFilled
                        ? 'border-[#fa8107] bg-orange-50 text-gray-900 scale-105 shadow-xs'
                        : 'border-gray-200 bg-gray-50 text-gray-300'
                    }`}
                  >
                    {isFilled ? '●' : ''}
                  </div>
                );
              })}
            </div>

            {/* Error or Success message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200"
              >
                <AlertCircle size={14} />
                <span>{error}</span>
              </motion.div>
            )}

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
              >
                <CheckCircle2 size={14} />
                <span>Code validé ! Ouverture...</span>
              </motion.div>
            )}

            {/* Numeric Keypad for fast touch on mobile or desktop */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeypadPress(digit)}
                  className="h-12 bg-gray-100 hover:bg-gray-200 active:bg-orange-100 text-gray-800 font-black text-lg rounded-2xl transition-colors shadow-xs"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClear}
                className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-xs uppercase rounded-2xl transition-colors"
                title="Effacer"
              >
                C
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="h-12 bg-gray-100 hover:bg-gray-200 active:bg-orange-100 text-gray-800 font-black text-lg rounded-2xl transition-colors shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDeleteDigit}
                className="h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm rounded-2xl transition-colors flex items-center justify-center"
                title="Supprimer"
              >
                ⌫
              </button>
            </div>

            {/* Submit Action Button */}
            <div className="w-full pt-2">
              <button
                type="button"
                onClick={() => handlePinSubmit(pin)}
                disabled={pin.length === 0}
                className="w-full bg-[#fa8107] hover:bg-[#e07306] disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                id="admin-pin-submit"
              >
                <KeyRound size={16} />
                <span>Valider le code</span>
              </button>
            </div>

            {/* Helper Hint */}
            <div className="bg-orange-50/70 border border-orange-200/60 rounded-xl p-2.5 w-full text-center">
              <p className="text-[10px] text-gray-500">
                💡 <span className="font-bold text-gray-700">Code PIN Espace Cuisine :</span> <span className="font-mono font-black text-[#fa8107] bg-white px-1.5 py-0.5 rounded border border-orange-200">4646</span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

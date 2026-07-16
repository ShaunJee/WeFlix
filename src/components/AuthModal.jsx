import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes,
  FaGoogle,
  FaSpinner,
  FaExclamationCircle,
} from 'react-icons/fa';
import { BiMoviePlay } from 'react-icons/bi';

import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const FIREBASE_ERRORS = {
  'auth/popup-closed-by-user':
    'Sign-in popup was closed. Please try again.',
  'auth/cancelled-popup-request':
    'Another sign-in popup is already open.',
  'auth/popup-blocked':
    'Popup was blocked by your browser. Please allow popups and try again.',
  'auth/network-request-failed':
    'Network error. Please check your connection.',
  'auth/unauthorized-domain':
    'This website is not authorized in Firebase. Please contact the administrator.',
};

const getFirebaseError = (err) => {
  const code = err?.code || '';
  return FIREBASE_ERRORS[code] || 'Something went wrong. Please try again.';
};

const saveUserToFirestore = async (user) => {
  await setDoc(
    doc(db, 'users', user.uid),
    {
      uid: user.uid,
      displayName: user.displayName || null,
      email: user.email,
      photoURL: user.photoURL || null,
      emailVerified: true,
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export default function AuthModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);

      await saveUserToFirestore(result.user);

      onClose();
    } catch (err) {
      setError(getFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300,
              }}
              className="w-full max-w-[400px] bg-[#0e1320] border border-white/10 rounded-3xl shadow-2xl shadow-black overflow-hidden pointer-events-auto"
            >
              <div className="p-8">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center">
                      <BiMoviePlay className="text-red-500 text-xl" />
                    </div>

                    <span className="text-xl font-black text-white tracking-tight">
                      We<span className="text-red-500">Flix</span>
                    </span>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-black text-white mb-3">
                    Welcome to WeFlix
                  </h2>

                  <p className="text-gray-400 leading-relaxed text-sm">
                    Sign in with your Google account to sync your Watchlist,
                    Continue Watching, and preferences across all your devices.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-start gap-2.5 mb-6 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3"
                    >
                      <FaExclamationCircle className="text-red-400 text-base shrink-0 mt-0.5" />

                      <p className="text-red-300 text-sm font-medium leading-snug">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-white hover:bg-gray-100 text-black font-bold transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      <FaGoogle className="text-red-500" />
                      Continue with Google
                    </>
                  )}
                </button>
                <p className="text-gray-500 text-xs text-center leading-relaxed mt-6">
                  By continuing, you agree to the{' '}
                  <span className="text-white font-medium">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-white font-medium">
                    Privacy Policy
                  </span>
                  .
                </p>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

'use client';

import React from 'react';
import { AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

const toastVariants = {
  success: {
    bg: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-500/90 dark:to-emerald-500/90',
    border: 'border-green-300 dark:border-green-400/50',
    text: 'text-green-900 dark:text-green-100',
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-200',
  },
  error: {
    bg: 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-500/90 dark:to-pink-500/90',
    border: 'border-red-300 dark:border-red-400/50',
    text: 'text-red-900 dark:text-red-100',
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-200',
  },
  info: {
    bg: 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-500/90 dark:to-cyan-500/90',
    border: 'border-blue-300 dark:border-blue-400/50',
    text: 'text-blue-900 dark:text-blue-100',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-200',
  },
  warning: {
    bg: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-500/90 dark:to-orange-500/90',
    border: 'border-yellow-300 dark:border-yellow-400/50',
    text: 'text-yellow-900 dark:text-yellow-100',
    icon: AlertCircle,
    iconColor: 'text-yellow-600 dark:text-yellow-200',
  },
};

export function Toast({ message, type = 'info', duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const variant = toastVariants[type];
  const Icon = variant.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 100, x: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed bottom-4 right-4 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${variant.bg} ${variant.border} ${variant.text} z-50 glow-effect`}
        >
          <motion.div
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon size={20} className={variant.iconColor} />
          </motion.div>
          <span className="text-sm font-semibold">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

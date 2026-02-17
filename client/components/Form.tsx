'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  rows?: number;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  options,
  rows,
}: FormFieldProps) {
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'textarea' ? (
        <motion.textarea
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 4}
          suppressHydrationWarning
          whileFocus={{ scale: 1.02 }}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-all duration-300 ${
            error
              ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-700 dark:focus:border-red-600'
              : 'border-slate-200 focus:border-orange-500 dark:border-gray-700 dark:focus:border-blue-500 bg-white dark:bg-gray-900 dark:text-white hover:border-slate-300 dark:hover:border-gray-600'
          }`}
        />
      ) : type === 'select' ? (
        <motion.select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          suppressHydrationWarning
          whileFocus={{ scale: 1.02 }}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-all duration-300 ${
            error
              ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-700 dark:focus:border-red-600'
              : 'border-slate-200 focus:border-orange-500 dark:border-gray-700 dark:focus:border-blue-500 bg-white dark:bg-gray-900 dark:text-white hover:border-slate-300 dark:hover:border-gray-600'
          }`}
        >
          <option value="">Select {label}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </motion.select>
      ) : (
        <motion.input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          suppressHydrationWarning
          whileFocus={{ scale: 1.02 }}
          className={`w-full px-4 py-3 rounded-2xl border-2 focus:outline-none transition-all duration-300 ${
            error
              ? 'border-red-300 focus:border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-700 dark:focus:border-red-600'
              : 'border-slate-200 focus:border-orange-500 dark:border-gray-700 dark:focus:border-blue-500 bg-white dark:bg-gray-900 dark:text-white hover:border-slate-300 dark:hover:border-gray-600'
          }`}
        />
      )}

      {error && (
        <motion.div
          className="flex items-start gap-2 text-red-600 dark:text-red-400 text-sm"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );
}

interface FormWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  submitLabel?: string;
  submitVariant?: 'primary' | 'secondary';
}

export function FormWrapper({
  title,
  description,
  children,
  onSubmit,
  isLoading,
  submitLabel = 'Submit',
  submitVariant = 'primary',
}: FormWrapperProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="space-y-2 mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-600 to-red-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-lg">{description}</p>
        )}
      </motion.div>

      {/* Fields */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
        className={`w-full py-3.5 rounded-2xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2.5 uppercase tracking-wide shadow-lg ${
          submitVariant === 'primary'
            ? 'bg-gradient-to-r from-orange-500 to-red-500 dark:from-blue-500 dark:to-purple-500 hover:shadow-xl hover:shadow-orange-500/50 dark:hover:shadow-blue-500/50 disabled:opacity-60'
            : 'bg-gradient-to-r from-slate-400 to-slate-500 dark:from-gray-700 dark:to-gray-800 text-white hover:shadow-lg dark:hover:shadow-gray-600/50'
        }`}
      >
        {isLoading ? (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            Loading...
          </motion.div>
        ) : (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Check size={20} />
            {submitLabel}
          </motion.div>
        )}
      </motion.button>
    </motion.form>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BackButton() {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  // Check if browser history exists
  useEffect(() => {
    // We can only truly know if there's history on the client side
    // Check if referrer exists or assume there's history after first pageload
    setCanGoBack(true);
  }, []);

  const handleBack = () => {
    // Attempt to go back, fallback to home if no history
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`
        inline-flex items-center gap-2 px-4 py-2 mb-6
        rounded-lg font-medium text-sm transition-all duration-300
        text-gray-700 hover:text-gray-900 hover:bg-gray-100
        dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800
        border border-gray-200 dark:border-gray-700
        hover:border-gray-300 dark:hover:border-gray-600
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
        dark:focus:ring-offset-gray-900
      `}
      aria-label="Go back"
    >
      <ChevronLeft size={18} />
      <span>Back</span>
    </button>
  );
}

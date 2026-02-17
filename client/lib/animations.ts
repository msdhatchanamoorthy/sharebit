import { Variants } from 'framer-motion';

// Container animations for staggered children
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Item animations for use within staggered containers
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

// Fade and slide variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export const slideInVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'backOut' },
  },
};

// Page transition animations
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

// Card hover animations
export const cardHoverVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -8,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

// Button hover animations
export const buttonHoverVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

// Loading spinner animation
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
};

// Pulse animation for badges
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: { duration: 2, repeat: Infinity },
  },
};

// Bounce animation
export const bounceVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Success checkmark animation
export const checkmarkVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 1],
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

// Error shake animation
export const shakeVariants: Variants = {
  animate: {
    x: [-10, 10, -10, 10, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

// Backdrop fade animation
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Modal animation
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.75,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.75,
    y: 20,
    transition: { duration: 0.2 },
  },
};

// Navbar menu item animation
export const navItemVariants = (index: number): Variants => ({
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.05,
      duration: 0.3,
    },
  },
});

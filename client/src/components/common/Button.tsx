/**
 * Button - Reusable button component with primary and secondary variants
 *
 * Features:
 * - Primary variant: Purple to pink gradient with white text
 * - Secondary variant: Gray background with dark text
 * - Support for disabled state
 * - Framer Motion hover/tap animations
 * - Responsive sizing
 */

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  /** Button content */
  children: ReactNode;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Whether the button takes full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, { base: string; hover: string; disabled: string }> = {
  primary: {
    base: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg',
    hover: 'hover:from-purple-700 hover:to-pink-700 hover:shadow-xl',
    disabled: 'from-gray-400 to-gray-500 cursor-not-allowed shadow-none',
  },
  secondary: {
    base: 'bg-gray-100 text-gray-800 border-2 border-gray-300',
    hover: 'hover:bg-gray-200 hover:border-gray-400',
    disabled: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-1.5 px-3 text-sm rounded-md',
  md: 'py-2 px-4 sm:py-2.5 sm:px-5 text-base sm:text-lg rounded-lg',
  lg: 'py-3 px-6 sm:py-4 sm:px-8 text-lg sm:text-xl lg:text-2xl rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const styles = variantStyles[variant];

    const baseClasses = `
      font-bold
      transition-colors duration-200
      focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2
      ${sizeStyles[size]}
      ${styles.base}
      ${isDisabled ? styles.disabled : styles.hover}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? {} : { scale: 1.02 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        disabled={isDisabled}
        className={baseClasses}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

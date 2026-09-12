import React from 'react';
import { DS } from '../../styles/designSystem';

export interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    icon?: React.ReactNode;
    loading?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    className = '',
    disabled,
    ...props
}) => {
    let variantClass = DS.button.primary;
    if (variant === 'secondary') variantClass = DS.button.secondary;
    if (variant === 'success') variantClass = DS.button.success;
    if (variant === 'danger') variantClass = DS.button.danger;
    if (variant === 'warning') variantClass = DS.button.warning;
    if (variant === 'ghost') variantClass = DS.button.ghost;
    if (variant === 'outline') variantClass = DS.button.outline;

    let sizeClass = DS.button.sizeMd;
    if (size === 'sm') sizeClass = DS.button.sizeSm;
    if (size === 'lg') sizeClass = DS.button.sizeLg;
    if (size === 'icon') sizeClass = DS.button.sizeIcon;

    return (
        <button
            {...props}
            disabled={disabled || loading}
            className={`${DS.button.base} ${sizeClass} ${variantClass} ${className}`}
        >
            {loading ? (
                <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
            ) : icon ? (
                <span className="shrink-0 flex items-center justify-center">{icon}</span>
            ) : null}
            {children}
        </button>
    );
};

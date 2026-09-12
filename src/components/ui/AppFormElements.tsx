import React from 'react';
import { DS } from '../../styles/designSystem';

export interface AppLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export const AppLabel: React.FC<AppLabelProps> = ({ children, required, className = '', ...props }) => (
    <label className={`${DS.form.label} ${required ? DS.form.labelRequired : ''} ${className}`} {...props}>
        {children}
    </label>
);

export interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
}

export const AppInput: React.FC<AppInputProps> = ({ error, helperText, icon, className = '', ...props }) => (
    <div className="w-full">
        <div className="relative flex items-center">
            {icon && (
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    {icon}
                </div>
            )}
            <input
                className={`${DS.form.input} ${icon ? 'pl-10' : ''} ${error ? '!border-rose-500 !ring-rose-500/20' : ''} ${className}`}
                {...props}
            />
        </div>
        {error ? (
            <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1 ml-0.5">{error}</p>
        ) : helperText ? (
            <p className={DS.form.helperText}>{helperText}</p>
        ) : null}
    </div>
);

export interface AppSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string;
    helperText?: string;
}

export const AppSelect: React.FC<AppSelectProps> = ({ error, helperText, children, className = '', ...props }) => (
    <div className="w-full">
        <select
            className={`${DS.form.select} ${error ? '!border-rose-500 !ring-rose-500/20' : ''} ${className}`}
            {...props}
        >
            {children}
        </select>
        {error ? (
            <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1 ml-0.5">{error}</p>
        ) : helperText ? (
            <p className={DS.form.helperText}>{helperText}</p>
        ) : null}
    </div>
);

export interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    helperText?: string;
}

export const AppTextarea: React.FC<AppTextareaProps> = ({ error, helperText, className = '', ...props }) => (
    <div className="w-full">
        <textarea
            className={`${DS.form.textarea} ${error ? '!border-rose-500 !ring-rose-500/20' : ''} ${className}`}
            {...props}
        />
        {error ? (
            <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1 ml-0.5">{error}</p>
        ) : helperText ? (
            <p className={DS.form.helperText}>{helperText}</p>
        ) : null}
    </div>
);

export interface AppFormFieldProps {
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    children: React.ReactNode;
    className?: string;
}

export const AppFormField: React.FC<AppFormFieldProps> = ({
    label,
    required,
    error,
    helperText,
    children,
    className = ''
}) => (
    <div className={`${DS.form.group} ${className}`}>
        {label && <AppLabel required={required}>{label}</AppLabel>}
        {children}
        {error ? (
            <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-1 ml-0.5">{error}</p>
        ) : helperText ? (
            <p className={DS.form.helperText}>{helperText}</p>
        ) : null}
    </div>
);

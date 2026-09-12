import React from 'react';
import { DS } from '../../styles/designSystem';

export interface AppTabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    badge?: string | number;
}

export interface AppTabsProps {
    tabs: AppTabItem[];
    activeTab: string;
    onChange: (tabId: string) => void;
    className?: string;
}

export const AppTabs: React.FC<AppTabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
    return (
        <div className={`${DS.tabs.container} ${className}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`${DS.tabs.tabBase} ${isActive ? DS.tabs.tabActive : DS.tabs.tabInactive}`}
                    >
                        {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                        <span>{tab.label}</span>
                        {tab.badge !== undefined && tab.badge !== null && (
                            <span
                                className={`ml-1 px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                                    isActive
                                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {tab.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

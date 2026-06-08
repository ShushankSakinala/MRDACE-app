import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info';
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'info' }) => {
    const getStyles = () => {
        switch (variant) {
            case 'success': return { background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' };
            case 'warning': return { background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
            case 'danger': return { background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
            default: return { background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' };
        }
    };

    return (
        <span style={{
            padding: '0.25rem 0.625rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.025em',
            ...getStyles()
        }}>
            {children}
        </span>
    );
};

export default Badge;

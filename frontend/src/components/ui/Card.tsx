import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    className?: string;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, title, subtitle, style }) => {
    return (
        <div
            style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow)',
                ...style
            }}
        >
            {(title || subtitle) && (
                <div style={{ marginBottom: '1.5rem' }}>
                    {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>{title}</h3>}
                    {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', margin: 0 }}>{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;

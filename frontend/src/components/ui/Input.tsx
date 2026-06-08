import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {label && <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>{label}</label>}
            <input
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-input)',
                    border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
                    color: 'var(--text-main)',
                    outline: 'none',
                    transition: 'all 0.2s',
                    fontSize: '1rem',
                    ...style
                }}
                {...props}
            />
            {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{error}</span>}
            <style>{`
        input:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2); }
      `}</style>
        </div>
    );
};

export default Input;

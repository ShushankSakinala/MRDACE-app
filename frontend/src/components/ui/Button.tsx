import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    fullWidth?: boolean;
    loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    loading = false,
    style,
    ...props
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'secondary':
                return { background: 'var(--border)', color: 'var(--text-main)' };
            case 'danger':
                return { background: 'var(--danger)', color: 'white' };
            case 'outline':
                return { background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' };
            case 'ghost':
                return { background: 'transparent', color: 'var(--text-muted)' };
            default:
                return { background: 'var(--primary)', color: 'var(--bg-dark)' };
        }
    };

    return (
        <button
            style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius)',
                fontWeight: '600',
                border: 'none',
                cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
                width: fullWidth ? '100%' : 'auto',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: props.disabled || loading ? 0.6 : 1,
                ...getVariantStyles(),
                ...style
            }}
            {...props}
        >
            {loading ? (
                <span style={{ display: 'inline-block', width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
            ) : children}
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: var(--shadow); }
        button:active:not(:disabled) { transform: translateY(0); filter: brightness(0.9); }
      `}</style>
        </button>
    );
};

export default Button;

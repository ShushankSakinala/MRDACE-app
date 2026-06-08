import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    gradient?: string;
    compact?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, gradient, compact }) => {
    return (
        <div style={{
            background: gradient || 'var(--bg-card)',
            border: gradient ? 'none' : `1px solid var(--border)`,
            borderRadius: 'var(--radius)',
            padding: compact ? '1rem 1.25rem' : '1.5rem',
            color: gradient ? 'white' : 'var(--text-main)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: gradient ? '0 10px 20px -5px rgba(0, 0, 0, 0.3)' : 'none',
            transition: 'transform 0.3s ease',
            cursor: 'default'
        }}
        onMouseEnter={(e) => gradient && (e.currentTarget.style.transform = 'translateY(-5px)')}
        onMouseLeave={(e) => gradient && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div>
                <p style={{ fontSize: compact ? '0.7rem' : '0.875rem', fontWeight: compact ? '700' : '500', opacity: 0.9, marginBottom: compact ? '0.25rem' : '0.5rem', color: gradient ? 'white' : 'var(--text-muted)' }}>{title}</p>
                <h3 style={{ fontSize: compact ? '1.5rem' : '2rem', fontWeight: '700', margin: 0 }}>{value}</h3>
            </div>
            <div style={{
                background: gradient ? 'rgba(255, 255, 255, 0.2)' : `${color}15`,
                borderRadius: compact ? '0.75rem' : '1rem',
                padding: compact ? '0.5rem' : '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: gradient ? 'white' : color
            }}>
                <Icon size={compact ? 20 : 32} />
            </div>
        </div>
    );
};


export default StatsCard;

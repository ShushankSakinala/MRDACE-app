import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Database,
    Info,
    Shield,
    RefreshCw
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    onRefresh?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle, onRefresh }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin-dashboard' },
        { label: 'Manage Users', icon: <Users size={18} />, path: '/manage-users' },
        { label: 'Audit Trail', icon: <Database size={18} />, path: '/audit-trail' },
        { label: 'System Info', icon: <Info size={18} />, path: '/system-info' }
    ];

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>{title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
                </div>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Admin Menu
                        </h3>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {menuItems.map(item => {
                                const active = location.pathname === item.path;
                                return (
                                    <button
                                        key={item.label}
                                        onClick={() => navigate(item.path)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            padding: '0.75rem 1rem',
                                            borderRadius: '0.5rem',
                                            background: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                            color: active ? 'var(--primary)' : 'var(--text-muted)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontWeight: active ? '600' : '400',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.05), rgba(74, 222, 128, 0.05))' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Security Status</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.875rem' }}>
                            <Shield size={16} /> <span>All systems secure</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Shield,
    LayoutDashboard,
    Upload,
    FileText,
    Database,
    LogOut,
    User as UserIcon,
    Menu,
    X
} from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        {
            label: 'Dashboard',
            path: user?.role === 'patient' ? '/patient-dashboard' : user?.role === 'doctor' ? '/doctor-dashboard' : '/admin-dashboard',
            icon: <LayoutDashboard size={20} />,
            roles: ['patient', 'doctor', 'admin']
        },
        {
            label: 'Upload Image',
            path: '/upload',
            icon: <Upload size={20} />,
            roles: ['patient', 'doctor', 'admin']
        },
        {
            label: 'View Records',
            path: '/records',
            icon: <FileText size={20} />,
            roles: ['patient', 'doctor', 'admin']
        },
        {
            label: 'Audit Logs',
            path: '/audit-logs',
            icon: <Database size={20} />,
            roles: ['admin']
        },
    ];

    const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-dark)' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '260px' : '80px',
                background: 'var(--bg-card)',
                borderRight: '1px solid var(--border)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                    <Shield color="var(--primary)" size={32} />
                    {isSidebarOpen && <span style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '1px' }}>MRDACE</span>}
                </div>

                <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {filteredNavItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: '0.75rem 1rem',
                                borderRadius: 'var(--radius)',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                background: isActive ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                            })}
                        >
                            {item.icon}
                            {isSidebarOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            width: '100%',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius)',
                            color: 'var(--danger)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            textAlign: 'left'
                        }}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '260px' : '80px',
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: '2rem'
            }}>
                <header style={{
                    marginBottom: '2rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-card)',
                    padding: '1rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)'
                }}>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user?.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role}</div>
                        </div>
                        <div style={{ background: 'var(--primary)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-dark)' }}>
                            <UserIcon size={20} />
                        </div>
                    </div>
                </header>

                <div className="animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;

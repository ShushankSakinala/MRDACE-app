import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserPlus, UserCheck, UserX, Shield, Trash2, Search, Filter, Info, RefreshCw } from 'lucide-react';

import AdminLayout from '../components/Admin/AdminLayout';
import StatsCard from '../components/Admin/StatsCard';

interface User {
    id: string;
    username: string;
    full_name: string;
    role: string;
    is_active: number;
    created_at?: string;
    email?: string;
}

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load user directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const activeCount = users.filter(u => u.is_active === 1).length;
    const inactiveCount = users.filter(u => u.is_active === 0).length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const regularCount = users.filter(u => u.role !== 'admin').length;

    return (
        <AdminLayout 
            title="Manage Users" 
            subtitle="Control user access and roles platform-wide"
            onRefresh={fetchUsers}
        >
            {/* Top Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                <StatsCard title="ACTIVE USERS" value={activeCount} icon={UserCheck} color="#3b82f6" compact />
                <StatsCard title="INACTIVE USERS" value={inactiveCount} icon={UserX} color="#f97316" compact />
                <StatsCard title="ADMINS" value={adminCount} icon={Shield} color="#ef4444" compact />
                <StatsCard title="REGULAR USERS" value={regularCount} icon={UserPlus} color="#10b981" compact />
            </div>

            {/* Actions Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button className="glass-morphism" style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: '1px solid var(--border)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1e293b' }}>
                    <Shield size={18} /> Create Admin
                </button>
                <button style={{ padding: '0.6rem 1.2rem', borderRadius: '0.5rem', border: 'none', background: 'linear-gradient(135deg, #f97316, #fb923c)', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserPlus size={18} /> Create User
                </button>
            </div>

            {/* Users Table */}
            <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            <th style={{ padding: '1rem' }}>USER</th>
                            <th style={{ padding: '1rem' }}>ROLE</th>
                            <th style={{ padding: '1rem' }}>CREATED AT</th>
                            <th style={{ padding: '1rem' }}>STATUS</th>
                            <th style={{ padding: '1rem' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                            <Search size={20} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{user.full_name || user.username}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.username}@test.com</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                                        <RefreshCw size={12} /> {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    {user.created_at ? new Date(user.created_at).toLocaleString() : '2026-03-24 10:00:00'}
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: user.is_active ? '#4ade80' : '#f87171', fontSize: '0.875rem', fontWeight: '600' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.is_active ? '#4ade80' : '#f87171' }}></div>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Filter size={18} /></button>
                                        <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Admin Guidelines */}
            <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Info size={20} color="var(--primary)" /> Admin Guidelines
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="glass-morphism" style={{ padding: '1.25rem', borderRadius: 'var(--radius)', borderLeft: '4px solid #f97316' }}>
                        <p style={{ fontSize: '0.875rem', color: '#fb923c', margin: 0 }}>Core admin accounts are protected and cannot be deactivated or deleted to ensure system stability.</p>
                    </div>
                    <div className="glass-morphism" style={{ padding: '1.25rem', borderRadius: 'var(--radius)', background: 'rgba(56, 189, 248, 0.05)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--primary)', margin: 0 }}>Self-deactivation is disabled. Please contact another administrator if you need to modify your own access.</p>
                    </div>
                    <div className="glass-morphism" style={{ padding: '1.25rem', borderRadius: 'var(--radius)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        <p style={{ fontSize: '0.875rem', color: '#f87171', margin: 0 }}>Deactivated users are immediately barred from accessing the platform and any API endpoints.</p>
                    </div>
                    <div className="glass-morphism" style={{ padding: '1.25rem', borderRadius: 'var(--radius)' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Every administrative action, including user status changes and deletions, is recorded in the immutable audit trail.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageUsers;

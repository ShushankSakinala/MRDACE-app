import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, LayoutDashboard, Database, Info, Filter, Search, RefreshCw } from 'lucide-react';

import AdminLayout from '../components/Admin/AdminLayout';

interface AuditLog {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    ip_address: string;
    resource_id?: string;
}

const AuditTrail: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('All Roles');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/logs', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data);
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const getEventBadge = (action: string) => {
        const variants: any = {
            'LOGIN': { bg: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', icon: <RefreshCw size={12} /> },
            'LOGOUT': { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', icon: <RefreshCw size={12} /> },
            'UPLOAD': { bg: 'rgba(56, 189, 248, 0.1)', color: 'var(--primary)', icon: <Database size={12} /> },
            'VIEW': { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', icon: <Database size={12} /> }
        };
        const v = variants[action] || { bg: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', icon: <Database size={12} /> };
        return (
            <span style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: '1rem', 
                background: v.bg, 
                color: v.color, 
                fontSize: '0.75rem', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                width: 'fit-content'
            }}>
                {v.icon} {action}
            </span>
        );
    };

    return (
        <AdminLayout 
            title="Audit Trail" 
            subtitle="Immutable record of all platform activities and administrative actions"
            onRefresh={fetchLogs}
        >
            {/* Filters */}
            <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', gap: '2rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>FILTER ROLE</label>
                    <select 
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                    >
                        <option>All Roles</option>
                        <option>Admin</option>
                        <option>Doctor</option>
                        <option>Patient</option>
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>SELECT NAME</label>
                    <select 
                        style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'white', outline: 'none' }}
                    >
                        <option>All Users</option>
                        {Array.from(new Set(logs.map(l => l.actor))).map(name => (
                            <option key={name}>{name}</option>
                        ))}
                    </select>
                </div>
                <button style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #f97316, #fb923c)', border: 'none', borderRadius: '0.5rem', color: 'white', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={18} /> Apply Filters
                </button>
            </div>

            {/* Logs Table */}
            <div className="glass-morphism" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                    <Database size={20} color="#f97316" /> Audit Log Entries
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
                            <th style={{ padding: '1rem' }}>TIMESTAMP</th>
                            <th style={{ padding: '1rem' }}>USER DETAILS</th>
                            <th style={{ padding: '1rem' }}>EVENT</th>
                            <th style={{ padding: '1rem' }}>IP ADDRESS</th>
                            <th style={{ padding: '1rem' }}>DETAILS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <div style={{ fontWeight: '700' }}>{log.actor}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.actor}@test.com</div>
                                    <div style={{ fontSize: '0.7rem', color: '#f97316', fontWeight: 'bold' }}>ADMIN</div>
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    {getEventBadge(log.action)}
                                </td>
                                <td style={{ padding: '1.25rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {log.ip_address}
                                </td>
                                <td style={{ padding: '1.25rem' }}>
                                    <button style={{ padding: '0.4rem 0.8rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Info size={14} /> Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AuditTrail;


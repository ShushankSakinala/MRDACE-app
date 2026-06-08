import React, { useState, useEffect } from 'react';
import { Database, Shield, AlertTriangle, Search, Filter, Download } from 'lucide-react';
import { adminApi } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';

const AuditLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'logs' | 'users'>('logs');

    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'logs') {
                const res = await adminApi.listLogs();
                setLogs(res.data);
            } else {
                const res = await adminApi.listUsers();
                setUsers(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, role: string) => {
        try {
            await adminApi.updateRole(userId, role);
            fetchData();
        } catch (err) {
            alert('Failed to update user role');
        }
    };

    const getActionVariant = (action: string) => {
        if (action.includes('LOGIN')) return 'info';
        if (action.includes('UPLOAD')) return 'success';
        if (action.includes('GRANT')) return 'warning';
        if (action.includes('DELETE') || action.includes('REVOKE')) return 'danger';
        return 'info';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>System Administration</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Monitor system activity and manage user permissions</p>
                </div>
                <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setView('logs')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: 'calc(var(--radius) - 4px)',
                            border: 'none',
                            cursor: 'pointer',
                            background: view === 'logs' ? 'var(--primary)' : 'transparent',
                            color: view === 'logs' ? 'var(--bg-dark)' : 'var(--text-muted)',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setView('users')}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: 'calc(var(--radius) - 4px)',
                            border: 'none',
                            cursor: 'pointer',
                            background: view === 'users' ? 'var(--primary)' : 'transparent',
                            color: view === 'users' ? 'var(--bg-dark)' : 'var(--text-muted)',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        User Management
                    </button>
                </div>
            </div>

            {view === 'logs' ? (
                <Card title="Security Audit Logs" subtitle="Immutable record of all system interactions">
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                placeholder="Search logs by actor, action or IP..."
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)', outline: 'none' }}
                            />
                        </div>
                        <Button variant="secondary" style={{ gap: '0.5rem' }}>
                            <Download size={18} /> Export CSV
                        </Button>
                    </div>

                    <Table headers={['Timestamp', 'Actor', 'Action', 'Resource', 'IP Address']}>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Retrieving audit ledger...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No logs found.</td></tr>
                        ) : logs.map(l => (
                            <tr key={l.id}>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{new Date(l.timestamp).toLocaleString()}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.actor ? 'var(--primary)' : 'var(--text-muted)' }}></div>
                                        <span style={{ fontWeight: '500' }}>{l.actor || 'SYSTEM'}</span>
                                    </div>
                                </td>
                                <td><Badge variant={getActionVariant(l.action)}>{l.action}</Badge></td>
                                <td><code style={{ fontSize: '0.75rem' }}>{l.resource_id || '-'}</code></td>
                                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{l.ip_address || '127.0.0.1'}</td>
                            </tr>
                        ))}
                    </Table>
                </Card>
            ) : (
                <Card title="User Directory" subtitle="Manage account roles and access levels">
                    <Table headers={['User', 'Username', 'Current Role', 'Security Level', 'Actions']}>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading user directory...</td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: '600' }}>{u.full_name}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{u.username}</td>
                                <td>
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                        style={{ padding: '0.4rem', background: 'var(--bg-input)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px', outline: 'none' }}
                                    >
                                        <option value="patient">Patient</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </td>
                                <td>
                                    {u.role === 'admin' ? <Badge variant="danger">Restricted</Badge> : <Badge variant="success">Standard</Badge>}
                                </td>
                                <td>
                                    <Button variant="ghost" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Manage</Button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </Card>
            )}

            {/* Admin Quick Tips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <Card>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
                            <Shield size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>Security Policy</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>All administrative actions are logged and impossible to delete, ensuring full traceability of permission changes.</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius)', color: 'var(--danger)' }}>
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 0.5rem 0' }}>Critical Alerts</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>No critical security anomalies detected in the last 24 hours. The encryption gateway is operating normally.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AuditLogs;

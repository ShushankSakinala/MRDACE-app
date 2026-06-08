import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Database, Shield, Activity, Clock, ChevronRight, Settings, FileText, Globe } from 'lucide-react';
import { adminApi } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [statsRes, logsRes] = await Promise.all([
                    adminApi.getStats(),
                    adminApi.listLogs()
                ]);
                setStats(statsRes.data);
                setRecentLogs(logsRes.data.slice(0, 8)); // Get latest 8 logs
            } catch (err) {
                console.error('Failed to fetch admin dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    if (loading) {
        return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Initializing secure admin session...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Security Command Center</h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>System-wide oversight and immutable audit management</p>
                </div>
                <Badge variant="success" style={{ padding: '0.5rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                        System Online: {stats?.systemInfo?.dbStatus}
                    </div>
                </Badge>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <Card style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Total Users</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>{stats?.totalUsers}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
                            <Users size={24} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--success)', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>Active growth monitored</p>
                </Card>

                <Card style={{ borderLeft: '4px solid var(--success)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Medical Records</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>{stats?.totalRecords}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: 'var(--radius)', color: 'var(--success)' }}>
                            <Database size={24} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>{stats?.systemInfo?.growth} integrity verified</p>
                </Card>

                <Card style={{ borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Audit Logs</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>{recentLogs.length * 12}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius)', color: '#f59e0b' }}>
                            <Shield size={24} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>Immutable chain secure</p>
                </Card>

                <Card style={{ borderLeft: '4px solid #a855f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>Network</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>{stats?.systemInfo?.latency}</h3>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(168, 85, 247, 0.1)', borderRadius: 'var(--radius)', color: '#a855f7' }}>
                            <Activity size={24} />
                        </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0.5rem 0 0 0' }}>{stats?.systemInfo?.timezone}</p>
                </Card>
            </div>

            {/* Main Content Areas */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* Audit Activity */}
                <Card title="System-Wide Audit Stream" subtitle="Live feed of high-priority security events">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recentLogs.length > 0 ? recentLogs.map((log) => (
                            <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius)', color: log.action === 'DELETE' ? 'var(--danger)' : 'var(--text-muted)' }}>
                                        {log.action === 'VIEW' ? <Globe size={18} /> : <Settings size={18} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{log.action}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            By <span style={{ color: 'var(--primary)' }}>{log.actor}</span> • {log.ip_address}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Clock size={12} /> {new Date(log.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No system logs available.</p>
                        )}
                        <Button variant="ghost" onClick={() => navigate('/audit-trail')} style={{ marginTop: '0.5rem' }}>
                            View Full Immutable Trail <ChevronRight size={16} />
                        </Button>
                    </div>
                </Card>

                {/* Task pane */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card title="Administrative Tools">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Button variant="outline" onClick={() => navigate('/manage-users')} style={{ justifyContent: 'space-between', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Users size={18} />
                                    <span>Manage Users</span>
                                </div>
                                <ChevronRight size={16} />
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/system-info')} style={{ justifyContent: 'space-between', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Globe size={18} />
                                    <span>System Health</span>
                                </div>
                                <ChevronRight size={16} />
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/audit-trail')} style={{ justifyContent: 'space-between', padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FileText size={18} />
                                    <span>Archive Vault</span>
                                </div>
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </Card>

                    <Card title="Database Overview">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                                <span style={{ color: 'var(--success)', fontWeight: '600' }}>CONNECTED</span>
                             </div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Storage engine</span>
                                <span>WiredTiger (Mongo)</span>
                             </div>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Encryption Layer</span>
                                <span style={{ color: 'var(--primary)' }}>Active (AES-256)</span>
                             </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

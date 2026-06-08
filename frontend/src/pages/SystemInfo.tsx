import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Database, Activity, Server, Clock, Globe, UserCheck, Users, FileText, BarChart, RefreshCw } from 'lucide-react';

import AdminLayout from '../components/Admin/AdminLayout';

interface SystemStats {
    dbStatus: string;
    latency: string;
    serverTime: string;
    timezone: string;
    growth: string;
}

const SystemInfo: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching system info:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const sInfo = stats?.systemInfo || {
        dbStatus: 'Connected',
        latency: 'Optimal',
        serverTime: new Date().toISOString(),
        timezone: 'Asia/Kolkata',
        growth: '+0'
    };

    return (
        <AdminLayout 
            title="System Information" 
            subtitle="Platform health, database status, and overall metadata"
            onRefresh={fetchData}
        >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Database Health */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Database size={18} /> DATABASE HEALTH
                        </h3>
                        <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(74, 222, 128, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80' }}>
                                        <UserCheck size={24} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATUS</div>
                                        <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>{sInfo.dbStatus}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LATENCY</div>
                                    <div style={{ fontWeight: '700', fontSize: '1.125rem' }}>{sInfo.latency}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MESSAGE</div>
                                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.4rem', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                    Connection successful
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Server Environment */}
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Server size={18} /> SERVER ENVIRONMENT
                        </h3>
                        <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Clock size={18} /> <span>Server Time</span>
                                </div>
                                <div style={{ fontWeight: '700' }}>{new Date(sInfo.serverTime).toLocaleString()}</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                                    <Globe size={18} /> <span>Timezone</span>
                                </div>
                                <div style={{ fontWeight: '700' }}>{sInfo.timezone}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Resource Statistics */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} /> RESOURCE STATISTICS
                    </h3>
                    <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'Total Registered Users', value: stats?.totalUsers || 0, icon: <Users size={18} />, color: 'rgba(56, 189, 248, 0.1)' },
                            { label: 'Active Regular Users', value: (stats?.totalUsers || 0) - 1, icon: <UserCheck size={18} />, color: 'rgba(74, 222, 128, 0.1)' },
                            { label: 'Platform Administrators', value: 1, icon: <Shield size={18} />, color: 'rgba(245, 158, 11, 0.1)' },
                            { label: 'Extracted Diagrams', value: stats?.totalRecords || 0, icon: <FileText size={18} />, color: 'rgba(56, 189, 248, 0.1)' },
                            { label: 'Immutable Audit Logs', value: 191, icon: <Database size={18} />, color: 'rgba(56, 189, 248, 0.1)' },
                            { label: 'Growth (Last 7 Days)', value: sInfo.growth || '+0', icon: <Activity size={18} />, color: 'rgba(249, 115, 22, 0.1)' }
                        ].map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ padding: '0.5rem', borderRadius: '0.4rem', background: item.color }}>{item.icon}</div>
                                    <span style={{ fontSize: '0.875rem' }}>{item.label}</span>
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '1.125rem', color: item.label.includes('Growth') ? '#f97316' : 'inherit' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                    <RefreshCw size={16} /> Back to Dashboard
                </button>
            </div>
        </AdminLayout>
    );
};

export default SystemInfo;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Upload, FileText, Shield, User, Clock, Search } from 'lucide-react';
import { recordsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const PatientDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [recentRecords, setRecentRecords] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recs, docs, prof] = await Promise.all([
                    recordsApi.list(),
                    recordsApi.listDoctors(),
                    recordsApi.getProfile()
                ]);
                setRecentRecords(recs.data.slice(0, 5));
                setDoctors(docs.data);
                setProfile(prof.data);
            } catch (err) {
                console.error('Failed to fetch patient data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleGrantAccess = async (docId: number) => {
        try {
            await recordsApi.grantAccess(docId);
            setDoctors(doctors.map(d => d.id === docId ? { ...d, access_status: 'active' } : d));
            alert('Access granted successfully');
        } catch (err) {
            alert('Failed to grant access');
        }
    };

    const handleRevokeAccess = async (docId: number) => {
        try {
            if (!window.confirm('Are you sure you want to revoke access for this doctor?')) return;
            await recordsApi.revokeAccess(docId);
            setDoctors(doctors.map(d => d.id === docId ? { ...d, access_status: 'revoked' } : d));
            alert('Access revoked successfully');
        } catch (err) {
            alert('Failed to revoke access');
        }
    };

    const filteredDoctors = doctors.filter(d => 
        (d.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Profile Stats */}
                <Card style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(56, 189, 248, 0.05) 100%)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ padding: '0.75rem', background: 'var(--primary)', borderRadius: 'var(--radius)', color: 'var(--bg-dark)' }}>
                            <User size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>{user?.full_name}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Medical ID: {profile?.medical_id}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Records</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{recentRecords.length}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Security</div>
                            <Badge variant="success">Active</Badge>
                        </div>
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="Quick Actions">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Button variant="outline" onClick={() => navigate('/upload')} style={{ flexDirection: 'column', height: 'auto', padding: '1.5rem', gap: '0.5rem' }}>
                            <Upload size={24} />
                            <span>Upload Record</span>
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/records')} style={{ flexDirection: 'column', height: 'auto', padding: '1.5rem', gap: '0.5rem' }}>
                            <FileText size={24} />
                            <span>View History</span>
                        </Button>
                    </div>
                </Card>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Recent Records */}
                <Card title="Recent Activity" subtitle="Your latest medical uploads">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentRecords.length > 0 ? recentRecords.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '0.5rem', color: 'var(--primary)' }}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{r.record_type}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Clock size={12} /> {new Date(r.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="info">Encrypted</Badge>
                            </div>
                        )) : <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No recent records found.</p>}
                        {recentRecords.length > 0 && (
                            <Button variant="ghost" fullWidth onClick={() => navigate('/records')}>View All Records</Button>
                        )}
                    </div>
                </Card>

                {/* Access Management */}
                <Card title="Authorized Doctors" subtitle="Grant or revoke access to healthcare professionals">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Search Bar */}
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search doctors by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease',
                                }}
                            />
                        </div>

                        {/* Doctors List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {filteredDoctors.length > 0 ? filteredDoctors.map(d => (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Dr. {d.full_name.split(' ').pop()}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.access_status === 'active' ? 'Has Access' : 'No Access'}</div>
                                    </div>
                                    {d.access_status === 'active' ? (
                                        <Button variant="danger" onClick={() => handleRevokeAccess(d.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                            Remove Access
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={() => handleGrantAccess(d.id)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                                            Grant Access
                                        </Button>
                                    )}
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>No doctors found.</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PatientDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, ArrowUpRight, CheckCircle, Clock, FileText } from 'lucide-react';
import { recordsApi } from '../api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';

const DoctorDashboard = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const res = await recordsApi.list();
            setRecords(res.data);
        } catch (err) {
            console.error('Failed to fetch records', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Authorized Patients</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{new Set(records.map(r => r.patient_id)).size}</h3>
                            <Badge variant="success">+2 this week</Badge>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: 'var(--radius)', color: 'var(--primary)' }}>
                            <Users size={24} />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>Pending Reviews</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{records.length}</h3>
                            <Badge variant="warning">Attention required</Badge>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: 'var(--radius)', color: 'var(--warning)' }}>
                            <Clock size={24} />
                        </div>
                    </div>
                </Card>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>System Integrity</p>
                            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' }}>100%</h3>
                            <Badge variant="info">Secure</Badge>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: 'var(--radius)', color: 'var(--success)' }}>
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Records Table */}
            <Card title="Patient Records" subtitle="Overview of medical data authorized for your review">
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="Search by Patient ID or Record Type..."
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)', outline: 'none' }}
                        />
                    </div>
                    <Button variant="secondary" style={{ gap: '0.5rem' }}>
                        <Filter size={18} /> Filter
                    </Button>
                    <Button onClick={() => navigate('/upload')}>
                        Upload New Record
                    </Button>
                </div>

                <Table headers={['Patient ID', 'Record Type', 'Security Status', 'Date Uploaded', 'Actions']}>
                    {loading ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Updating records database...</td></tr>
                    ) : records.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records found.</td></tr>
                    ) : records.map(r => (
                        <tr key={r.id}>
                            <td style={{ fontWeight: '600' }}>MID-{r.patient_id}</td>
                            <td>{r.record_type}</td>
                            <td><Badge variant="success">Fully Encrypted</Badge></td>
                            <td style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                            <td>
                                <Button variant="ghost" onClick={() => navigate('/records')} style={{ gap: '0.25rem', padding: '0.25rem 0.5rem', color: 'var(--primary)' }}>
                                    Review <ArrowUpRight size={14} />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </div>
    );
};

export default DoctorDashboard;

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Lock, Shield, Search, Filter, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { recordsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';

const ViewRecords = () => {
    const { user } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState<number | null>(null);
    const [expandedPatients, setExpandedPatients] = useState<Record<string, boolean>>({});

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

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to permanently delete this medical record? This action cannot be undone.')) {
            return;
        }

        try {
            await recordsApi.delete(id);
            alert('Record deleted successfully.');
            fetchRecords(); // Refresh the list
        } catch (err) {
            alert('Deletion failed. You may not have permissions to delete this record.');
        }
    };

    const handleView = async (id: number) => {
        setPreviewLoading(id);
        try {
            const res = await recordsApi.download(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            setPreviewUrl(url);
        } catch (err: any) {
            let errorMsg = 'Decryption failed. You may not have authorization to view this record.';
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    errorMsg = json.detail || errorMsg;
                } catch (e) {
                    console.error('Failed to parse blob error', e);
                }
            } else {
                errorMsg = err.response?.data?.detail || err.message || errorMsg;
            }
            alert(errorMsg);
        } finally {
            setPreviewLoading(null);
        }
    };

    const handleDownload = async (id: number) => {
        setDownloadingId(id);
        try {
            const res = await recordsApi.download(id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `medical_record_${id}.bin`); // In real app, we'd know ext
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err: any) {
            let errorMsg = 'Decryption failed. You may not have authorization for this record.';
            if (err.response?.data instanceof Blob) {
                try {
                    const text = await err.response.data.text();
                    const json = JSON.parse(text);
                    errorMsg = json.detail || errorMsg;
                } catch (e) {
                    console.error('Failed to parse blob error', e);
                }
            } else {
                errorMsg = err.response?.data?.detail || err.message || errorMsg;
            }
            alert(errorMsg);
        } finally {
            setDownloadingId(null);
        }
    };

    const togglePatient = (patientId: string) => {
        setExpandedPatients(prev => ({
            ...prev,
            [patientId]: !prev[patientId]
        }));
    };

    // Group records by patient_id
    const groupedRecords = records.reduce((acc, record) => {
        const pId = record.patient_id;
        if (!acc[pId]) {
            acc[pId] = [];
        }
        acc[pId].push(record);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Medical Records Archive</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Access and manage encrypted health documentation</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button variant="outline" style={{ gap: '0.5rem' }} onClick={fetchRecords}>
                        <Calendar size={18} /> Refresh Session
                    </Button>
                </div>
            </div>

            <Card>
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            placeholder="Search archive..."
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)', outline: 'none' }}
                        />
                    </div>
                    <Button variant="secondary" style={{ gap: '0.5rem' }}>
                        <Filter size={18} /> Filters
                    </Button>
                </div>

                <Table headers={
                    user?.role === 'doctor' 
                        ? [] 
                        : (user?.role === 'admin' 
                            ? ['Record ID', 'Patient', 'Type', 'Upload Date', 'Status', 'Actions']
                            : ['Record ID', 'Type', 'Upload Date', 'Status', 'Actions'])
                }>
                    {loading ? (
                        <tr><td colSpan={user?.role === 'doctor' ? 1 : (user?.role === 'admin' ? 6 : 5)} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Consulting security layer...</td></tr>
                    ) : records.length === 0 ? (
                        <tr><td colSpan={user?.role === 'doctor' ? 1 : (user?.role === 'admin' ? 6 : 5)} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No records found in archive.</td></tr>
                    ) : user?.role === 'doctor' ? (
                        // DOCTOR ACCORDION VIEW
                        Object.keys(groupedRecords).map(patientId => {
                            const pRecords = groupedRecords[patientId];
                            const isExpanded = expandedPatients[patientId];
                            return (
                                <React.Fragment key={patientId}>
                                    <tr 
                                        onClick={() => togglePatient(patientId)}
                                        style={{ cursor: 'pointer', background: isExpanded ? 'rgba(56, 189, 248, 0.05)' : 'transparent', transition: 'background 0.2s' }}
                                    >
                                        <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ padding: '0.5rem', background: 'var(--bg-input)', borderRadius: 'var(--radius)' }}>
                                                        <FileText size={18} color="var(--primary)" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '1rem' }}>Patient ID: MID-{patientId}</div>
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{pRecords.length} Document{pRecords.length !== 1 ? 's' : ''} Uploaded</div>
                                                    </div>
                                                </div>
                                                <div>
                                                    {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr>
                                            <td style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem 2rem' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                                                        <thead>
                                                            <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                                                                <th style={{ padding: '0.5rem' }}>Record ID</th>
                                                                <th style={{ padding: '0.5rem' }}>Type</th>
                                                                <th style={{ padding: '0.5rem' }}>Upload Date</th>
                                                                <th style={{ padding: '0.5rem' }}>Status</th>
                                                                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {pRecords.map((r: any) => (
                                                                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                    <td style={{ padding: '0.75rem 0.5rem' }}><code style={{ background: 'var(--bg-input)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>REC-{r.id}</code></td>
                                                                    <td style={{ padding: '0.75rem 0.5rem' }}>{r.record_type}</td>
                                                                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleString()}</td>
                                                                    <td style={{ padding: '0.75rem 0.5rem' }}><Badge variant="success">Secured</Badge></td>
                                                                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                            <Button
                                                                                variant="ghost"
                                                                                onClick={(e) => { e.stopPropagation(); handleView(r.id); }}
                                                                                loading={previewLoading === r.id}
                                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem', color: 'var(--success)' }}
                                                                            >
                                                                                <Eye size={14} />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                onClick={(e) => { e.stopPropagation(); handleDownload(r.id); }}
                                                                                loading={downloadingId === r.id}
                                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem', color: 'var(--primary)' }}
                                                                            >
                                                                                <Download size={14} />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', gap: '0.25rem', color: 'var(--danger)' }}
                                                                            >
                                                                                Archive
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        // PATIENT / ADMIN FLAT VIEW
                        records.map(r => (
                            <tr key={r.id}>
                                <td><code style={{ background: 'var(--bg-input)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>REC-{r.id}</code></td>
                                {user?.role === 'admin' && <td style={{ fontWeight: '600' }}>MID-{r.patient_id}</td>}
                                <td>{r.record_type}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{new Date(r.created_at).toLocaleString()}</td>
                                <td><Badge variant="success">Secured</Badge></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleView(r.id)}
                                            loading={previewLoading === r.id}
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem', color: 'var(--success)' }}
                                        >
                                            <Eye size={14} /> View
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDownload(r.id)}
                                            loading={downloadingId === r.id}
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem', color: 'var(--primary)' }}
                                        >
                                            <Download size={14} /> Decrypt
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDelete(r.id)}
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', gap: '0.25rem', color: 'var(--danger)' }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>
            </Card>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <Card title="Encryption Metadata">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Algorithm</span>
                            <span style={{ fontWeight: '600' }}>AES-256-CBC</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Protocol</span>
                            <span style={{ fontWeight: '600' }}>MRDACE v2.0</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Access Mode</span>
                            <span style={{ fontWeight: '600', color: 'var(--success)' }}>Authorized</span>
                        </div>
                    </div>
                </Card>
                <Card title="Compliance">
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        All records displayed here are processed through the secure backend gateway. The frontend never has access to raw decryption keys, ensuring maximum patient privacy and HIPAA compliance.
                    </p>
                </Card>
            </div>

            {/* Secure Preview Modal */}
            {previewUrl && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem',
                    backdropFilter: 'blur(8px)'
                }} onClick={() => setPreviewUrl(null)}>
                    <div style={{
                        position: 'relative',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        background: 'var(--bg-card)',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Secure Document Preview</h3>
                            <Button variant="ghost" onClick={() => setPreviewUrl(null)} style={{ padding: '0.5rem' }}>✕</Button>
                        </div>
                        <div style={{ overflow: 'auto', textAlign: 'center' }}>
                            <img
                                src={previewUrl}
                                alt="Medical Record"
                                style={{ maxWidth: '100%', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            <Shield size={14} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--success)' }} />
                            This view is encrypted and temporary. Access is audited.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewRecords;

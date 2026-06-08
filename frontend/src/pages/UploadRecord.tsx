import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { recordsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
const UploadRecord = () => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [recordType, setRecordType] = useState('Diagnostic Report');
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (user?.role === 'patient') {
            recordsApi.getProfile().then(res => {
                setProfile(res.data);
                setPatientId(res.data.id.toString());
            });
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setSuccess(false);
            setError('');
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !patientId) return;

        setLoading(true);
        setError('');
        try {
            // Restore secure backend upload flow (includes Encryption + IPFS + Blockchain)
            await recordsApi.upload(patientId, recordType, file);
            
            console.log("Secure upload completed via backend!");
            setSuccess(true);
            setFile(null);
            
            // Reset input manually
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err: any) {
            console.error('Upload Error:', err);
            const errMsg = err.response?.data?.detail || err.message || 'Upload failed. Ensure the backend is running.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Upload Medical Record</h1>
                <p style={{ color: 'var(--text-muted)' }}>Securely encrypt and store medical documentation</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {user?.role !== 'patient' ? (
                                <Input
                                    label="Patient ID (Internal)"
                                    placeholder="e.g. 5"
                                    value={patientId}
                                    onChange={(e) => setPatientId(e.target.value)}
                                    required
                                />
                            ) : (
                                <div style={{ padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Patient ID</label>
                                    <span style={{ fontWeight: '600' }}>#{profile?.medical_id || '...'}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Record Type</label>
                                <select
                                    value={recordType}
                                    onChange={(e) => setRecordType(e.target.value)}
                                    style={{ padding: '0.75rem 1rem', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-main)', outline: 'none' }}
                                >
                                    <option>Diagnostic Report</option>
                                    <option>Lab Results</option>
                                    <option>Prescription</option>
                                    <option>MRI / CT Scan</option>
                                    <option>Physician Note</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>Medical File (Image or Document)</label>
                                <div
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                    style={{
                                        padding: '3rem 2rem',
                                        border: '2px dashed var(--border)',
                                        borderRadius: 'var(--radius)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        background: file ? 'rgba(56, 189, 248, 0.05)' : 'transparent'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <input type="file" id="file-upload" hidden onChange={handleFileChange} />
                                    {file ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <FileText size={40} color="var(--primary)" />
                                            <span style={{ fontWeight: '600' }}>{file.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                            <Upload size={40} color="var(--text-muted)" />
                                            <span style={{ fontWeight: '600' }}>Click to select or drag and drop</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF, JPG, PNG (Max 1000MB)</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <Button type="submit" fullWidth disabled={!file || !patientId || loading} loading={loading}>
                                Encrypt & Upload to Secure Storage
                            </Button>
                        </div>
                    </Card>

                    {success && (
                        <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid var(--success)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--success)' }} className="animate-fade-in">
                            <CheckCircle size={20} />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Upload Successful</div>
                                <div style={{ fontSize: '0.875rem' }}>Your record has been encrypted and stored securely.</div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--danger)' }} className="animate-fade-in">
                            <AlertCircle size={20} />
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Upload Failed</div>
                                <div style={{ fontSize: '0.875rem' }}>{error}</div>
                            </div>
                        </div>
                    )}
                </form>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card title="Security Info">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Shield size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                                <p>Files are encrypted using AES-256 before leaving your browser.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Shield size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                                <p>Only authorized providers can decrypt and view these records.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Shield size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                                <p>Every access attempt is logged for audit purposes.</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Requirements">
                        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            <li>Clear, legible scans or photos</li>
                            <li>Include medical ID if possible</li>
                            <li>Maximum file size: 1000MB</li>
                            <li>Supported: PDF, PNG, JPG, JPEG</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UploadRecord;

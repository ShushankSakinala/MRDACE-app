import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, UserPlus, FileText, User } from 'lucide-react';
import { authApi } from '../api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        fullName: '',
        role: 'patient',
        doctorId: '',
        hospitalName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authApi.register({
                username: formData.username,
                password: formData.password,
                full_name: formData.fullName,
                role: formData.role,
                doctor_id: formData.role === 'doctor' ? (formData as any).doctorId : undefined,
                hospital_name: formData.role === 'doctor' ? (formData as any).hospitalName : undefined
            });
            alert('Account created successfully! Please log in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
            background: 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.1), transparent), radial-gradient(circle at bottom right, rgba(56, 189, 248, 0.05), transparent)'
        }}>
            <div style={{ width: '100%', maxWidth: '480px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '1.5rem', marginBottom: '1rem' }}>
                        <Shield size={40} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.25rem' }}>Create Secure Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Join the MRDACE network</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />

                        <Input
                            label="Username"
                            placeholder="johndoe123"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        {formData.role === 'doctor' && (
                            <>
                                <Input
                                    label="Doctor ID"
                                    placeholder="DOC-12345"
                                    value={formData.doctorId}
                                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Hospital Name"
                                    placeholder="City General Hospital"
                                    value={formData.hospitalName}
                                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                                    required
                                />
                            </>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>I am a</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: formData.role === 'patient' ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-input)',
                                        border: `1px solid ${formData.role === 'patient' ? 'var(--primary)' : 'var(--border)'}`,
                                        color: formData.role === 'patient' ? 'var(--primary)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <User size={18} /> Patient
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                                    style={{
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius)',
                                        background: formData.role === 'doctor' ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-input)',
                                        border: `1px solid ${formData.role === 'doctor' ? 'var(--primary)' : 'var(--border)'}`,
                                        color: formData.role === 'doctor' ? 'var(--primary)' : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <FileText size={18} /> Doctor
                                </button>
                            </div>
                        </div>

                        <Button type="submit" fullWidth loading={loading} style={{ marginTop: '0.5rem' }}>
                            Create Account
                        </Button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
                        <Link to="/login" style={{ fontWeight: '600' }}>Log in</Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Register;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User } from 'lucide-react';
import { authApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await authApi.login(username, password);
            await login(res.data.access_token);

            const role = res.data.user.role;
            if (role === 'admin') navigate('/admin-dashboard');
            else if (role === 'doctor') navigate('/doctor-dashboard');
            else navigate('/patient-dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid username or password');
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
            padding: '1rem',
            background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.1), transparent), radial-gradient(circle at bottom left, rgba(56, 189, 248, 0.05), transparent)'
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '1.5rem', marginBottom: '1rem' }}>
                        <Shield size={48} color="var(--primary)" />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>MRDACE</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Secure Medical Intelligence Architecture</p>
                </div>

                <Card title="Welcome Back" subtitle="Log in to access your secure medical portal">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {error && (
                            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius)', color: 'var(--danger)', fontSize: '0.875rem' }}>
                                {error}
                            </div>
                        )}
                        <Input
                            label="Username"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" fullWidth loading={loading}>
                            Secure Login
                        </Button>
                    </form>

                    <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
                        <Link to="/register" style={{ fontWeight: '600' }}>Create account</Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;

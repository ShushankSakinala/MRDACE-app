import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AuditLogs from './pages/AuditLogs';
import AdminDashboard from './pages/AdminDashboard';
import UploadRecord from './pages/UploadRecord';

import ViewRecords from './pages/ViewRecords';
import ManageUsers from './pages/ManageUsers';
import AuditTrail from './pages/AuditTrail';
import SystemInfo from './pages/SystemInfo';


// Global Styles
import './index.css';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes Wrapper */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        {/* Role-Specific Dashboards */}
                                        <Route
                                            path="/patient-dashboard"
                                            element={
                                                <ProtectedRoute allowedRoles={['patient']}>
                                                    <PatientDashboard />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/doctor-dashboard"
                                            element={
                                                <ProtectedRoute allowedRoles={['doctor']}>
                                                    <DoctorDashboard />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/admin-dashboard"
                                            element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <AdminDashboard />
                                                </ProtectedRoute>
                                            }
                                        />


                                        {/* Feature Pages */}
                                        <Route path="/upload" element={<UploadRecord />} />
                                        <Route path="/records" element={<ViewRecords />} />
                                        <Route
                                            path="/audit-logs"
                                            element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <AuditLogs />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/manage-users"
                                            element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <ManageUsers />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/audit-trail"
                                            element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <AuditTrail />
                                                </ProtectedRoute>
                                            }
                                        />
                                        <Route
                                            path="/system-info"
                                            element={
                                                <ProtectedRoute allowedRoles={['admin']}>
                                                    <SystemInfo />
                                                </ProtectedRoute>
                                            }
                                        />


                                        {/* Default Redirect based on role */}
                                        <Route path="/" element={<HomeRedirect />} />
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

// Helper to redirect "/" to the correct dashboard
const HomeRedirect = () => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;

    if (user.role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
    return <Navigate to="/patient-dashboard" replace />;
};

export default App;

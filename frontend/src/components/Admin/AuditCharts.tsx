import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const COLORS = ['#38bdf8', '#4ade80', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface AuditChartsProps {
    auditStats: { type: string; count: number }[];
    userActivity: { name: string; value: number }[];
    eventsOverTime: { date: string; count: number }[];
    topActiveUsers: { name: string; count: number }[];
}

const AuditCharts: React.FC<AuditChartsProps> = ({ auditStats, userActivity, eventsOverTime, topActiveUsers }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
            {/* Top Row: Type and Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Bar Chart: Events by Type */}
                <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--primary)' }}>📊</span> Events by Type
                    </h4>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={auditStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="type" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                                <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={35} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Activity Distribution */}
                <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--warning)' }}>🔘</span> Activity Distribution
                    </h4>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userActivity}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userActivity.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Time Series and Top Users */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                {/* Area Chart: Events Over Time */}
                <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--primary)' }}>📈</span> Events Over Time
                    </h4>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={eventsOverTime}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                                <Area type="monotone" dataKey="count" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Horizontal Bar Chart: Top 10 Active Users */}
                <div className="glass-morphism" style={{ padding: '1.5rem', borderRadius: 'var(--radius)' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#8b5cf6' }}>🏆</span> Top 10 Active Users
                    </h4>
                    <div style={{ height: '350px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topActiveUsers} layout="vertical" margin={{ left: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={25} label={{ position: 'right', fill: 'var(--text-muted)', fontSize: 10 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditCharts;


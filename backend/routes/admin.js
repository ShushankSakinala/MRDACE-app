const express = require('express');
const router = express.Router();
const { User, MedicalRecord, AuditLog } = require('../models/mongoModels');
const { authenticate, authorize } = require('../middleware/auth');
const AuditService = require('../services/auditService');

// Get Dashboard Stats
router.get('/stats', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalRecords = await MedicalRecord.countDocuments();
        const logs = await AuditLog.find().sort({ timestamp: -1 });
        const allUsers = await User.find();
        
        const totalDownloads = logs.filter(log => log.action === 'VIEW').length;

        // Group audit events by type
        const eventCounts = {};
        // Group audit events over time (daily frequency)
        const dayCounts = {};
        // Group activity by user
        const userActivityCounts = {};
        const userMap = {};
        allUsers.forEach(u => userMap[u._id.toString()] = u.username);
        // Also map by firebaseId for legacy data
        allUsers.forEach(u => { if (u.firebaseId) userMap[u.firebaseId] = u.username; });

        logs.forEach(log => {
            const action = log.action || 'unknown';
            const ts = log.timestamp;
            const uid = log.user_id;

            // Events by type
            eventCounts[action] = (eventCounts[action] || 0) + 1;

            // Events over time
            if (ts) {
                const date = ts.split('T')[0];
                dayCounts[date] = (dayCounts[date] || 0) + 1;
            }

            // Activity by user
            const username = userMap[uid] || 'Unknown';
            userActivityCounts[username] = (userActivityCounts[username] || 0) + 1;
        });

        const auditStats = Object.keys(eventCounts).map(type => ({ type, count: eventCounts[type] }));
        const eventsOverTime = Object.keys(dayCounts).sort().map(date => ({ date, count: dayCounts[date] }));
        const userActivity = Object.keys(userActivityCounts).sort().map(name => ({ name, value: userActivityCounts[name] }));
        const topActiveUsers = Object.keys(userActivityCounts)
            .map(name => ({ name, count: userActivityCounts[name] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.json({
            totalUsers,
            totalRecords,
            totalDownloads,
            auditStats,
            userActivity,
            eventsOverTime,
            topActiveUsers,
            systemInfo: {
                dbStatus: 'Connected (MongoDB)',
                latency: 'Optimal',
                serverTime: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                growth: '+5%'
            }
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ detail: 'Error fetching stats' });
    }
});

// List all users
router.get('/users', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const users = await User.find();
        const transformed = users.map(u => ({ id: u._id.toString(), username: u.username, full_name: u.full_name, role: u.role, is_active: u.is_active }));
        res.json(transformed);
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Error fetching users' });
    }
});

// Update user role
router.put('/users/:id/role', authenticate, authorize(['admin']), AuditService.middleware('UPDATE_ROLE'), async (req, res) => {
    const { role } = req.body;
    if (!role) {
        return res.status(400).json({ detail: 'Role is required' });
    }

    try {
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ detail: 'User role updated successfully' });
    } catch (err) {
        // Fallback for firebaseId
        try {
            await User.findOneAndUpdate({ firebaseId: req.params.id }, { role });
            res.json({ detail: 'User role updated successfully' });
        } catch (e2) {
             console.error(err);
             res.status(500).json({ detail: 'Error updating user role' });
        }
    }
});

// List all audit logs
router.get('/logs', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 });
        const allUsers = await User.find();
        
        const userMap = {};
        allUsers.forEach(u => userMap[u._id.toString()] = u.username);
        allUsers.forEach(u => { if (u.firebaseId) userMap[u.firebaseId] = u.username; });

        const enhancedLogs = logs.map(log => ({
            id: log._id.toString(),
            user_id: log.user_id,
            action: log.action,
            resource_id: log.resource_id,
            timestamp: log.timestamp,
            ip_address: log.ip_address,
            actor: userMap[log.user_id] || 'Unknown User'
        }));

        res.json(enhancedLogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ detail: 'Error fetching logs' });
    }
});

module.exports = router;

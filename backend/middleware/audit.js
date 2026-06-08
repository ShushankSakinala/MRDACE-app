const db = require('../utils/db');

/**
 * Middleware to log actions to the audit_logs table
 * @param {string} action - The action being performed (e.g., "VIEW", "UPLOAD", "LOGIN")
 * @returns {Function} Express middleware
 */
const auditLog = (action) => {
    return async (req, res, next) => {
        const originalSend = res.send;

        res.send = function (data) {
            const userId = req.user ? req.user.id : null;
            const resourceId = req.params.id || req.body.patient_id || null;
            const ipAddress = req.ip || req.connection.remoteAddress;

            // Log the action asynchronously
            db.execute(
                'INSERT INTO audit_logs (user_id, action, resource_id, timestamp, ip_address) VALUES (?, ?, ?, ?, ?)',
                [userId, action, resourceId, new Date().toISOString(), ipAddress]
            ).catch(err => console.error('Audit log error:', err));

            originalSend.apply(res, arguments);
        };

        next();
    };
};

module.exports = auditLog;

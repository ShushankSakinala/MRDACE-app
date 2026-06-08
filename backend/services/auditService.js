const { AuditLog: AuditLogModel } = require('../models/mongoModels');

class AuditService {
    /**
     * Log an action to the audit trail
     * @param {string} userId - ID of the user performing action
     * @param {string} action - Action name (e.g., LOGIN, UPLOAD)
     * @param {string} resourceId - ID of the affected resource
     * @param {string} ipAddress - Client IP address
     * @param {string} userName - (Optional) Name of the user
     */
    async log(userId, action, resourceId, ipAddress, userName = null) {
        try {
            let finalizedUserName = userName;
            
            // If username wasn't provided, try to fetch it once
            if (!finalizedUserName && userId && userId !== 'anonymous') {
                const { User: UserModel } = require('../models/mongoModels');
                const user = await UserModel.findById(userId);
                if (user) finalizedUserName = user.username;
            }

            await AuditLogModel.create({
                user_id: String(userId),
                user_name: finalizedUserName || 'unknown',
                action,
                resource_id: resourceId ? String(resourceId) : null,
                timestamp: new Date().toISOString(),
                ip_address: ipAddress || 'unknown'
            });
        } catch (err) {
            console.error('Audit service error (MongoDB):', err);
        }
    }

    /**
     * Middleware to automatically log route access
     * @param {string} action 
     */
    middleware(action) {
        return (req, res, next) => {
            const userId = req.user ? req.user.id : 'anonymous';
            const userName = req.user ? req.user.username : null;
            const resourceId = req.params.id || req.body.record_id || null;
            const ipAddress = req.ip || req.connection.remoteAddress;

            this.log(userId, action, resourceId, ipAddress, userName);
            next();
        };
    }

}

module.exports = new AuditService();

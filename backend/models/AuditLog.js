const { AuditLog: AuditLogModel, User: UserModel } = require('./mongoModels');

class AuditLogWrapper {
    async listAll() {
        try {
            // Find all audit logs from MongoDB, sort by timestamp descending
            const logs = await AuditLogModel.find({}).sort({ timestamp: -1 });
            
            // Fetch users to construct username mapping
            const users = await UserModel.find({});
            const userMap = {};
            users.forEach(u => {
                userMap[u._id.toString()] = u.username || u.email || 'Unknown User';
            });

            return logs.map(log => {
                const data = log.toObject();
                return {
                    id: log._id.toString(),
                    ...data,
                    actor: userMap[log.user_id] || log.user_name || 'Unknown User'
                };
            });
        } catch (error) {
            console.error('Error in AuditLogWrapper listAll:', error);
            return [];
        }
    }

    async findByUserId(userId) {
        try {
            const queryUserId = String(userId);
            // Query by user_id or userId
            const logs = await AuditLogModel.find({
                $or: [
                    { user_id: queryUserId },
                    { userId: queryUserId }
                ]
            }).sort({ timestamp: -1 });
            
            return logs.map(log => ({ id: log._id.toString(), ...log.toObject() }));
        } catch (error) {
            console.error('Error in AuditLogWrapper findByUserId:', error);
            return [];
        }
    }
}

module.exports = new AuditLogWrapper();

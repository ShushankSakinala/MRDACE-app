const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mrdace-jwt-secret';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ detail: 'Invalid or expired token' });
            }
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ detail: 'Authentication required' });
    }
};

const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    const normalizedRoles = roles.map(r => r.toLowerCase());

    return (req, res, next) => {
        if (normalizedRoles.length && !normalizedRoles.includes(req.user.role.toLowerCase())) {
            return res.status(403).json({ detail: 'Insufficient permissions' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };

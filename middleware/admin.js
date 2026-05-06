const db = require("../db");

function admin(req, res, next) {
    const user = db.prepare(`
        SELECT is_admin, banned FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
        return res.status(401).json({
            error: { code: "UNAUTHORIZED" }
        });
    }

    if (user.banned) {
        return res.status(403).json({
            error: { code: "BANNED", message: "User is banned" }
        });
    }

    if (!user.is_admin) {
        return res.status(403).json({
            error: { code: "FORBIDDEN", message: "Admin only" }
        });
    }

    next();
}

module.exports = admin;
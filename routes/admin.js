const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcrypt");

// all routes require auth + admin
router.use(auth, admin);

router.delete("/users/:id", (req, res) => {
    const id = parseInt(req.params.id);

    if (id === req.user.id) {
        return res.status(400).json({
            error: { code: "INVALID", message: "Cannot delete yourself" }
        });
    }

    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
    if (!user) {
        return res.status(404).json({
            error: { code: "NOT_FOUND", message: "User not found" }
        });
    }

    // delete related data
    db.prepare(`DELETE FROM posts WHERE user_id = ?`).run(id);
    db.prepare(`DELETE FROM likes WHERE user_id = ?`).run(id);
    db.prepare(`DELETE FROM follows WHERE follower_id = ? OR following_id = ?`).run(id, id);

    db.prepare(`DELETE FROM users WHERE id = ?`).run(id);

    res.json({ id, success: true });
});

// ban
router.post("/users/:id/ban", (req, res) => {
    const id = parseInt(req.params.id);

    if (id === req.user.id) {
        return res.status(400).json({
            error: { code: "INVALID", message: "Cannot ban yourself" }
        });
    }

    const result = db.prepare(`
        UPDATE users SET banned = 1 WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: { code: "NOT_FOUND" }
        });
    }

    res.json({ id, banned: true });
});

// unban
router.delete("/users/:id/ban", (req, res) => {
    const id = parseInt(req.params.id);

    const result = db.prepare(`
        UPDATE users SET banned = 0 WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: { code: "NOT_FOUND" }
        });
    }

    res.json({ id, banned: false });
});

// give admin
router.post("/users/:id/admin", (req, res) => {
    const id = parseInt(req.params.id);

    const result = db.prepare(`
        UPDATE users SET is_admin = 1 WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: { code: "NOT_FOUND" }
        });
    }

    res.json({ id, is_admin: true });
});

// remove admin
router.delete("/users/:id/admin", (req, res) => {
    const id = parseInt(req.params.id);

    // prevent removing last admin
    const adminCount = db.prepare(`
        SELECT COUNT(*) as count FROM users WHERE is_admin = 1
    `).get().count;

    if (adminCount <= 1) {
        return res.status(400).json({
            error: { code: "INVALID", message: "Cannot remove last admin" }
        });
    }

    const result = db.prepare(`
        UPDATE users SET is_admin = 0 WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: { code: "NOT_FOUND" }
        });
    }

    res.json({ id, is_admin: false });
});

// reset password
router.post("/users/:id/reset-password", (req, res) => {
    const id = parseInt(req.params.id);
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
        return res.status(400).json({
            error: { code: "INVALID_PASSWORD" }
        });
    }

    const hash = bcrypt.hashSync(new_password, 10);

    const result = db.prepare(`
        UPDATE users SET password_hash = ? WHERE id = ?
    `).run(hash, id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: { code: "NOT_FOUND" }
        });
    }

    res.json({ id, success: true });
});

// delete post
router.delete("/posts/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const result = db.prepare(`
        DELETE FROM posts WHERE id = ?
    `).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            error: { code: "NOT_FOUND" }
        });
    }

    res.json({ id, success: true });
});

// set description
router.post("/settings/description", (req, res) => {
    const { description } = req.body;

    if (!description) {
        return res.status(400).json({
            error: { code: "INVALID" }
        });
    }

    db.prepare(`
        INSERT INTO settings (key, value)
        VALUES ('description', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(description);

    res.json({ success: true });
});

// announcement
router.post("/announcements", (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({
            error: { code: "INVALID" }
        });
    }

    const result = db.prepare(`
        INSERT INTO announcements (content)
        VALUES (?)
    `).run(content);

    res.json({
        id: result.lastInsertRowid,
        success: true
    });
});

router.get("/announcements", (req, res) => {
    const list = db.prepare(`
        SELECT * FROM announcements ORDER BY id DESC
    `).all();

    res.json(list);
});

module.exports = router;
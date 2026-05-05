const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// get user
router.get("/:id", (req, res) => {
    const user = db.prepare(`
        SELECT 
        id, username, description, created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as posts,
        (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following
        FROM users
        WHERE id = ?
    `).get(req.params.id);

    res.json(user);
});

// followers
router.get("/:id/followers", (req, res) => {
    const followers = db.prepare(`
        SELECT u.id, u.username, u.description, f.rowid as since
        FROM follows f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?
    `).all(req.params.id);

    res.json({
        id: parseInt(req.params.id),
        count: followers.length,
        followers
    });
});

// following
router.get("/:id/following", (req, res) => {
    const following = db.prepare(`
        SELECT u.id, u.username, u.description, f.rowid as since
        FROM follows f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ?
    `).all(req.params.id);

    res.json({
        id: parseInt(req.params.id),
        count: following.length,
        following
    });
});

// follow
router.post("/:id/follow", auth, (req, res) => {
    db.prepare(`
        INSERT OR IGNORE INTO follows VALUES (?, ?)
    `).run(req.user.id, req.params.id);

    res.json({ id: parseInt(req.params.id), success: true });
});

// unfollow
router.delete("/:id/follow", auth, (req, res) => {
    db.prepare(`
        DELETE FROM follows WHERE follower_id = ? AND following_id = ?
    `).run(req.user.id, req.params.id);

    res.json({ id: parseInt(req.params.id), success: true });
});

module.exports = router;
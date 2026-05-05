const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// create
router.post("/", auth, (req, res) => {
    const result = db.prepare(`
        INSERT INTO posts (user_id, content)
        VALUES (?, ?)
    `).run(req.user.id, req.body.content);

    res.status(201).json({
        id: result.lastInsertRowid,
        success: true
    });
});

// get post
router.get("/:id", auth, (req, res) => {
    const post = db.prepare(`
        SELECT 
        p.id, p.content, p.created_at,
        u.id as author_id, u.username,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes,
        EXISTS(
            SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?
        ) as liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    `).get(req.user.id, req.params.id);

    res.json({
        id: post.id,
        content: post.content,
        author: {
            id: post.author_id,
            username: post.username
        },
        likes: post.likes,
        liked: !!post.liked,
        created_at: post.created_at
    });
});

// delete
router.delete("/:id", auth, (req, res) => {
    db.prepare(`DELETE FROM posts WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);

    res.json({ id: parseInt(req.params.id), success: true });
});

module.exports = router;
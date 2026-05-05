const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// timeline
router.get("/", auth, (req, res) => {
    const cursor = req.query.cursor || Number.MAX_SAFE_INTEGER;
    const limit = parseInt(req.query.limit) || 20;

    const posts = db.prepare(`
        SELECT 
        p.id, p.content, p.created_at,
        u.id as author_id, u.username,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes,
        EXISTS(
            SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?
        ) as liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id < ?
        AND (
        p.user_id = ?
        OR p.user_id IN (
            SELECT following_id FROM follows WHERE follower_id = ?
        )
        )
        ORDER BY p.id DESC
        LIMIT ?
    `).all(req.user.id, cursor, req.user.id, req.user.id, limit);

    const nextCursor = posts.length ? posts[posts.length - 1].id : null;

    res.json({
        data: posts.map(p => ({
        id: p.id,
        content: p.content,
        author: {
            id: p.author_id,
            username: p.username
        },
        likes: p.likes,
        liked: !!p.liked,
        created_at: p.created_at
        })),
        next_cursor: nextCursor
    });
});

module.exports = router;
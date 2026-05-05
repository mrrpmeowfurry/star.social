const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

// like
router.post("/:id/like", auth, (req, res) => {
    db.prepare(`INSERT OR IGNORE INTO likes VALUES (?, ?)`).run(req.user.id, req.params.id);

    res.json({
        id: parseInt(req.params.id),
        liked: true,
        success: true
    });
});

// unlike
router.delete("/:id/like", auth, (req, res) => {
    db.prepare(`DELETE FROM likes WHERE user_id = ? AND post_id = ?`).run(req.user.id, req.params.id);

    res.json({
        id: parseInt(req.params.id),
        success: true
    });
});

module.exports = router;
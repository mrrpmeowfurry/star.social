const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");

const SECRET = process.env.JWT_SECRET;;

// register
router.post("/register", (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({
        error: {
            code: "BAD_REQUEST",
            message: "Username, Email and Password are required."
        }
        });
    }

    const hash = bcrypt.hashSync(password, 10);

    try {
        const result = db.prepare(`
        INSERT INTO users (username, password_hash, email)
        VALUES (?, ?, ?)
        `).run(username, hash, email);

        res.status(201).json({
        id: result.lastInsertRowid,
        username,
        success: true
        });
    } catch (err) {
        if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return res.status(400).json({
            error: {
            code: "USER_OR_EMAIL_TAKEN",
            message: "User with this email or name already exists"
            }
        });
        }

        throw err;
    }
});

// login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    const user = db.prepare(`
        SELECT * FROM users WHERE username = ?
    `).get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" }
        });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: "7d" }
    );

    res.json({ token, success: true });
});

// me
router.get("/me", auth, (req, res) => {
    const user = db.prepare(`
        SELECT 
        id, username, description, email, created_at,
        (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as posts,
        (SELECT COUNT(*) FROM follows WHERE following_id = users.id) as followers,
        (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) as following
        FROM users
        WHERE id = ?
    `).get(req.user.id);

    res.json(user);
});

module.exports = router;
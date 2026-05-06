const express = require("express");
const os = require("os");
const db = require("./db");
const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/posts", require("./routes/likes")); // nested
app.use("/timeline", require("./routes/timeline"));
app.use("/admin", require("./routes/admin"));
app.get("/", (req, res) => {
    let dbStatus = "ok";

    try {
        db.prepare("SELECT 1").get();
    } catch {
        dbStatus = "error";
    }

    const counts = db.prepare(`
        SELECT
            (SELECT COUNT(*) FROM posts) as posts,
            (SELECT COUNT(*) FROM users) as users
    `).get();

    const description = db.prepare(`
        SELECT value FROM settings WHERE key = 'description'
    `).get();

    const announcement = db.prepare(`
        SELECT content, created_at 
        FROM announcements 
        ORDER BY id DESC 
        LIMIT 1
    `).get();

    res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        database: dbStatus,
        host: {
            hostname: os.hostname(),
            platform: os.platform(),
            arch: os.arch(),
            node: process.version
        },
        platform: {
            description: description,
            announcement: announcement,
            posts: counts.posts,
            users: counts.users
        },
        memory: {
            rss: process.memoryUsage().rss,
            heapUsed: process.memoryUsage().heapUsed,
            heapTotal: process.memoryUsage().heapTotal
        }
    });
});

app.listen(3000, () => {
    console.log(`running on http://localhost:3000`);
});
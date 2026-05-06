const express = require("express");
const os = require("os");
const db = require("./db");
const PORT = process.env.PORT
const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/posts", require("./routes/likes")); // nested
app.use("/timeline", require("./routes/timeline"));
app.get("/", (req, res) => {
    let dbStatus = "ok";

    try {
        db.prepare("SELECT 1").get();
    } catch {
        dbStatus = "error";
    }

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
        memory: {
        rss: process.memoryUsage().rss,
        heapUsed: process.memoryUsage().heapUsed,
        heapTotal: process.memoryUsage().heapTotal
        }
    });
});

app.listen(PORT, () => {
    console.log(`running on http://localhost:${PORT}`);
});
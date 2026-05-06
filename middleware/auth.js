const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
}

function auth(req, res, next) {
    const header = req.headers.authorization;

    // 1. Check header exists
    if (!header) {
        return res.status(401).json({
        error: {
            code: "UNAUTHORIZED",
            message: "Missing Authorization header"
        }
        });
    }

    // 2. Validate format: "Bearer <token>"
    const parts = header.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({
        error: {
            code: "INVALID_AUTH_FORMAT",
            message: "Authorization must be: Bearer <token>"
        }
        });
    }

    const token = parts[1];

    // 3. Verify token
    try {
        const decoded = jwt.verify(token, SECRET);

        // 4. Attach user to request
        req.user = {
        id: decoded.id,
        username: decoded.username
        };

        next();
    } catch (err) {
        return res.status(401).json({
        error: {
            code: "INVALID_TOKEN",
            message: "Token is invalid or expired"
        }
        });
    }
}

module.exports = auth;
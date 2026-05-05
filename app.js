const express = require("express");
const app = express();

app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));
app.use("/posts", require("./routes/likes")); // nested
app.use("/timeline", require("./routes/timeline"));

app.listen(3000, () => {
    console.log("running on http://localhost:3000");
});
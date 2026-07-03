const express = require("express");
const fs = require("fs");
const router = express.Router();

const DB_PATH = "./src/db/activity.json";

router.get("/", (req, res) => {
    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    res.json({
        slackStatus: data.current,
    });
});

module.exports = router;
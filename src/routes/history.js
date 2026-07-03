const express = require("express");
const fs = require("fs");
const router = express.Router();

const DB_PATH = "./src/db/activity.json";

router.get("/", (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = 5;

    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    const history = data.history;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    res.json({
        page,
        pageSize,
        total: history.length,
        entries: history.slice(start, end),
    })
});

module.exports = router;
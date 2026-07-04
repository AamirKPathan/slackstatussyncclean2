import express from "express";
import fs from "fs";

const router = express.Router();

router.get("/token", (req, res) => {
  const filePath = fs.realpathSync("./src/db/activity.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  res.json({ slackToken: data.slackToken });
});

export default router;
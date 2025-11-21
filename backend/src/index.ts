import express from "express";
import { createClient } from "redis";
import crypto from "crypto";

const app = express();
app.use(express.json());
const client = createClient();
client.connect();

app.post("/submit", async (req, res) => {
  const { problemId, userId, code, language } = req.body;
  const channel = "submission:" + crypto.randomUUID();
  try {
    await client.lPush(
      "submissions",
      JSON.stringify({ problemId, userId, code, language })
    );
    res.json({
      message: "Submission received",
    });
  } catch {
    res.json({
      message: "Submission failed",
    });
  }
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

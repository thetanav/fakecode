import express from "express";
import { createClient } from "redis";
import { nanoid } from "nanoid";
import { WebSocketServer } from "ws";
import { string } from "zod";

const app = express();
app.use(express.json());
const client = createClient();
async () => {
  await client.connect();
};

app.post("/submit", async (req, res) => {
  const { problemId, userId, code, language } = req.body;
  const subId = nanoid(12);
  try {
    await client.lPush(
      "sub",
      JSON.stringify({ problemId, code, language, subId })
    );
    res.json({
      message: "Submission received",
      submissionId: subId,
    });
  } catch {
    res.json({
      message: "Submission failed",
    });
  }
});

const server = app.listen(8080, () => {
  console.log("Server running on port 8080");
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws) => {
  ws.on("message", async (msg: { type: string; data: any }) => {
    switch (msg.type) {
      case "subscribe":
        const { subId } = msg.data;
        await client.pSubscribe("sub:*", (message) => {
          if (message.subId === subId) {
            ws.send(JSON.stringify({ status: message.status }));
          }
        });
        break;
      default:
        break;
    }
  });

  ws.send("connected");
});

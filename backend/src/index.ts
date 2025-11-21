import express from "express";
import { createClient } from "redis";
import { nanoid } from "nanoid";
import { WebSocketServer } from "ws";
// @ts-expect-error - cors types issue
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
const client = createClient();
const subscriberClient = createClient();

// Connect to Redis
(async () => {
  try {
    await client.connect();
    await subscriberClient.connect();
    console.log("Redis connected");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1);
  }
})();

app.post("/submit", async (req, res) => {
  const { problemId, userId, code, language } = req.body;
  const subId = nanoid(12);
  console.log("subId", subId);
  try {
    await client.lPush(
      "sub",
      JSON.stringify({ problemId, userId, code, language, subId })
    );
    res.json({
      message: "Submission received",
      submissionId: subId,
    });
  } catch (error) {
    console.log("error", error);
    res.json({
      message: "Submission failed",
      err: error,
    });
  }
});

const server = app.listen(8080, () => {
  console.log("Server running on port 8080");
});

const wss = new WebSocketServer({ server });

wss.on("connection", async (ws) => {
  const subscriptions = new Set<string>();

  ws.on("message", async (data) => {
    try {
      const msg = JSON.parse(data.toString());
      switch (msg.type) {
        case "subscribe":
          const { subId } = msg.data;
          if (!subId) {
            ws.send(JSON.stringify({ type: "error", data: "Missing subId" }));
            return;
          }
          const channel = `sub:${subId}`;
          if (!subscriptions.has(channel)) {
            await subscriberClient.subscribe(channel, (message) => {
              if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: "status", data: message }));
              }
            });
            subscriptions.add(channel);
            console.log(`Subscribed to channel: ${channel}`);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "error", data: String(error) }));
      }
    }
  });

  ws.on("close", async () => {
    // Unsubscribe from all channels when connection closes
    for (const channel of subscriptions) {
      try {
        await subscriberClient.unsubscribe(channel);
        console.log(`Unsubscribed from channel: ${channel}`);
      } catch (error) {
        console.error(`Error unsubscribing from ${channel}:`, error);
      }
    }
    subscriptions.clear();
  });

  ws.send(JSON.stringify({ type: "connected" }));
});

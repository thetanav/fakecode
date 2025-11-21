#!/usr/bin/env bun

/**
 * Test script for backend and worker flow
 * 
 * This script:
 * 1. Submits a test submission to the backend
 * 2. Connects via WebSocket
 * 3. Subscribes to status updates
 * 4. Verifies the status changes from PENDING to ACCEPTED
 * 
 * Usage:
 *   1. Make sure Redis is running: redis-server
 *   2. Start backend: cd backend && bun run dev
 *   3. Start worker: cd worker && bun run dev
 *   4. Run this test: bun test-flow.ts
 */

const BACKEND_URL = "http://localhost:8080";
const WS_URL = "ws://localhost:8080";

interface SubmissionResponse {
  message: string;
  submissionId: string;
}

interface StatusUpdate {
  type: string;
  data: string;
}

async function testFlow() {
  console.log("🧪 Starting backend and worker flow test...\n");

  // Step 1: Submit a test submission
  console.log("1️⃣  Submitting test submission...");
  const submissionData = {
    problemId: "test-problem-1",
    userId: "test-user-123",
    code: "console.log('Hello, World!');",
    language: "javascript",
  };

  try {
    const response = await fetch(`${BACKEND_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SubmissionResponse = await response.json();
    console.log(`   ✅ Submission received: ${result.submissionId}`);
    console.log(`   📝 Message: ${result.message}\n`);

    if (!result.submissionId) {
      throw new Error("No submissionId received");
    }

    const submissionId = result.submissionId;

    // Step 2: Connect via WebSocket and subscribe
    console.log("2️⃣  Connecting to WebSocket...");
    return new Promise<void>((resolve, reject) => {
      const ws = new globalThis.WebSocket(WS_URL);
      let subscribed = false;
      let statusReceived = false;
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("Test timeout: No status updates received within 5 seconds"));
      }, 5000);

      ws.addEventListener("open", () => {
        console.log("   ✅ WebSocket connected\n");
      });

      ws.addEventListener("message", (event) => {
        const data = event.data;
        try {
          const msg = JSON.parse(data.toString());
          
          if (msg.type === "connected") {
            console.log("3️⃣  Subscribing to status updates...");
            ws.send(
              JSON.stringify({
                type: "subscribe",
                data: { subId: submissionId },
              })
            );
            subscribed = true;
            console.log(`   ✅ Subscribed to submission: ${submissionId}\n`);
          } else if (msg.type === "status") {
            const statusData = JSON.parse(msg.data);
            console.log(`4️⃣  Status update received: ${statusData.status}`);
            
            if (statusData.status === "PENDING") {
              console.log("   ⏳ Status: PENDING (waiting for processing...)\n");
            } else if (statusData.status === "ACCEPTED") {
              console.log("   ✅ Status: ACCEPTED (processing complete!)\n");
              statusReceived = true;
              clearTimeout(timeout);
              ws.close();
              console.log("🎉 Test completed successfully!");
              resolve();
            } else {
              console.log(`   ℹ️  Status: ${statusData.status}\n`);
            }
          } else if (msg.type === "error") {
            console.error(`   ❌ Error: ${msg.data}`);
            clearTimeout(timeout);
            ws.close();
            reject(new Error(msg.data));
          }
        } catch (error) {
          console.error("   ❌ Error parsing message:", error);
        }
      });

      ws.addEventListener("error", (error) => {
        console.error("   ❌ WebSocket error:", error);
        clearTimeout(timeout);
        reject(error);
      });

      ws.addEventListener("close", () => {
        if (!statusReceived) {
          clearTimeout(timeout);
          if (!subscribed) {
            reject(new Error("WebSocket closed before subscription"));
          } else {
            reject(new Error("WebSocket closed before receiving ACCEPTED status"));
          }
        }
      });
    });
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testFlow()
  .then(() => {
    console.log("\n✅ All tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });


"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [problemId, setProblemId] = useState("");
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectWebSocket = (): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
      const wsUrl = "ws://localhost:8080";
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        setError(null);
        wsRef.current = websocket;
        resolve(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "connected") {
            console.log("WebSocket handshake complete");
          } else if (data.type === "status") {
            // Parse the data field which is a JSON string from Redis
            const statusData = JSON.parse(data.data);
            if (statusData.status) {
              setStatus(statusData.status);
              console.log("Status update:", statusData.status);
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      websocket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setConnected(false);
        reject(err);
      };

      websocket.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        wsRef.current = null;
        // Attempt to reconnect after 2 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!wsRef.current) {
            connectWebSocket().catch(console.error);
          }
        }, 2000);
      };
    });
  };

  useEffect(() => {
    // Auto-connect on mount
    connectWebSocket().catch((err) => {
      console.error("Failed to connect WebSocket:", err);
      setError("Failed to connect to WebSocket server");
    });

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setSubmissionId(null);
    setError(null);

    try {
      // Ensure WebSocket is connected
      let websocket = wsRef.current;
      if (!connected || !websocket || websocket.readyState !== WebSocket.OPEN) {
        try {
          websocket = await connectWebSocket();
        } catch (err) {
          setError("Failed to connect to WebSocket. Please try again.");
          setLoading(false);
          return;
        }
      }

      // Submit the code
      const response = await fetch("http://localhost:8080/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId,
          userId,
          code,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Submission response:", data);

      if (data.submissionId) {
        setSubmissionId(data.submissionId);
        setStatus("PENDING");

        // Subscribe to updates for this submission
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(
            JSON.stringify({
              type: "subscribe",
              data: { subId: data.submissionId },
            })
          );
          console.log("Subscribed to submission:", data.submissionId);
        } else {
          setError(
            "WebSocket not connected. Status updates may not be received."
          );
        }
      } else {
        setError(data.message || "Failed to get submission ID");
      }
    } catch (err) {
      console.error("Error submitting:", err);
      setError(err instanceof Error ? err.message : "Failed to submit code");
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Backend Test UI
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              WebSocket: {connected ? "Connected" : "Disconnected"}
            </span>
            {!connected && (
              <button
                onClick={() => connectWebSocket().catch(console.error)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Reconnect
              </button>
            )}
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem ID
              </label>
              <input
                type="text"
                value={problemId}
                onChange={(e) => setProblemId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., problem-1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., user-123"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="console.log('Hello, World!');"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {loading ? "Submitting..." : "Submit"}
            </button>
            {!connected && (
              <p className="text-sm text-yellow-600 text-center">
                ⚠️ WebSocket not connected. You can still submit, but status
                updates may not be received.
              </p>
            )}
          </div>
        </form>

        {(submissionId || status) && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Submission Status
            </h2>
            {submissionId && (
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">
                  Submission ID:{" "}
                </span>
                <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {submissionId}
                </span>
              </div>
            )}
            {status && (
              <div className="mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Status:{" "}
                </span>
                <span
                  className={`text-sm font-semibold px-2 py-1 rounded ${
                    status === "ACCEPTED"
                      ? "text-green-700 bg-green-100"
                      : status === "ERROR"
                      ? "text-red-700 bg-red-100"
                      : status === "PENDING"
                      ? "text-yellow-700 bg-yellow-100"
                      : "text-blue-700 bg-blue-100"
                  }`}>
                  {status}
                </span>
              </div>
            )}
            {submissionId && !status && (
              <div className="text-sm text-gray-500 italic">
                Waiting for status update...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

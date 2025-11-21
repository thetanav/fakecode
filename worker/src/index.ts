import { createClient } from "redis";

const client = createClient();

async function processSubmission(submission: string) {
  const { problemId, userId, code, language, subId } = JSON.parse(submission!);

  console.log(`Processing submission ${subId} for problemId ${problemId}...`);
  console.log(`Code: ${code}`);
  console.log(`Language: ${language}`);

  await client.publish(`sub:${subId}`, JSON.stringify({ status: "PENDING" }));

  // Here you would add your actual processing logic
  await new Promise((resolve) => setTimeout(resolve, 1000));

  await client.publish(`sub:${subId}`, JSON.stringify({ status: "ACCEPTED" }));
  console.log(`Submission ${subId} processed: ACCEPTED`);
}

async function main() {
  try {
    await client.connect();
    console.log("Worker connected to Redis");

    while (true) {
      try {
        const result = await client.brPop("sub", 0);
        if (result) {
          await processSubmission(result.element);
        }
      } catch (error) {
        console.error("Error processing submission:", error);
        // Wait a bit before retrying to avoid tight error loop
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error("Fatal error in worker:", error);
    process.exit(1);
  }
}

// Start the worker
main().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});

import { createClient } from "redis";

const client = createClient();

async function processSubmission(submission: string) {
  const { problemId, code, language } = JSON.parse(submission!);

  console.log(`Processing submission for problemId ${problemId}...`);
  console.log(`Code: ${code}`);
  console.log(`Language: ${language}`);
  // Here you would add your actual processing logic

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Finished processing submission for problemId ${problemId}.`);
  client.publish("problem_done", JSON.stringify({ problemId, status: "TLE" }));
}

async function main() {
  await client.connect();
  console.log("Worker connected to Redis");

  while (true) {
    try {
      const submissions = await client.brPop("submissions", 0);
      await processSubmission(submissions!.element);
    } catch (error) {
      console.error("Error processing submission:", error);
    }
  }
}

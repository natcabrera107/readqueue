// Inserts sample papers so the database/collection appears in MongoDB.
// Run once with:  npm run seed
import "dotenv/config";
import { connectDB, getDB } from "./models/db.js";

const samplePapers = [
  {
    listId: "demo",
    title: "Attention Is All You Need",
    authors: "Ashish Vaswani et al.",
    venue: "NeurIPS",
    year: 2017,
    tags: ["transformer", "attention"],
    status: "reading",
    comments: [
      { author: "Alice", text: "Classic paper.", createdAt: new Date() },
    ],
  },
  {
    listId: "demo",
    title: "Constitutional AI: Harmlessness from AI Feedback",
    authors: "Yuntao Bai et al.",
    venue: "arXiv",
    year: 2022,
    tags: ["safety", "alignment"],
    status: "to-read",
    comments: [],
  },
];

async function seed() {
  await connectDB();
  const papers = getDB().collection("papers");

  await papers.deleteMany({}); // start clean each run
  const result = await papers.insertMany(samplePapers);

  console.log(`Inserted ${result.insertedCount} papers into web_proj2.papers`);
  process.exit(0); // close the process (the DB client keeps it alive otherwise)
}

seed();

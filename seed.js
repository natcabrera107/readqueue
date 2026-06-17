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

//Insert sample data for books 

const sampleBooks = [
  {
    listId: "demo", 
    title: "The Pragmatic Programmer", 
    authors: "David Thomas",
    genre: "Software Engineering", 
    tags: ["pragmatic", "engineering"],
    order: 1,
    status: "to read", 
    comments: [],
  },
  {
    listId: "demo",
    title: "Clean Code",
    authors: "Robert C. Martin",
    genre: "Software Engineering",
    tags: ["clean code", "refactoring"],
    order: 2,
    status: "reading",
    comments: [],
  },
  {
    listId: "demo",
    title: "Designing Data-Intensive Applications",
    authors: "Martin Kleppmann",
    genre: "Systems",
    tags: ["databases", "distributed systems"],
    order: 3,
    status: "done",
    comments: [],
  }
]
const sampleComments = [
  {
    entryId: "demo",
    entryType: "book",
    author: "Sofia", 
    body: "Loved this book",
    createdAt: new Date(),
  },
  {
    entryId: "demo",
    entryType: "book",
    author: "Marcos",
    body: "Chapter 3 changed how I write functions.",
    createdAt: new Date(),
  },
]


async function seed() {
  await connectDB();

  const papers = getDB().collection("papers");
  await papers.deleteMany({}); // start clean each run
  const result = await papers.insertMany(samplePapers);
  console.log(`Inserted ${result.insertedCount} papers into web_proj2.papers`);

  const books = getDB().collection("books");
  await books.deleteMany({});
  
  const booksResult = await books.insertMany(sampleBooks);
  console.log(`Inserted ${booksResult.insertedCount} books`);

  const comments = getDB().collection("comments");
  await comments.deleteMany({});
  const commentsResult = await comments.insertMany(sampleComments);
  console.log(`Inserted ${commentsResult.insertedCount} comments`);


  process.exit(0); // close the process (the DB client keeps it alive otherwise)
}

seed();
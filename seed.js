import "dotenv/config";
import { connectDB, getDB } from "./models/db.js";

const COUNT = 500;

// Jiachen's paper generator
const topics = ["Attention Mechanisms", "Retrieval-Augmented Generation", "Diffusion Models", "Reinforcement Learning", "Graph Neural Networks", "Transformers", "Contrastive Learning", "Federated Learning", "Knowledge Distillation", "Self-Supervised Learning"];
const domains = ["Natural Language Processing", "Computer Vision", "Speech Recognition", "Recommendation Systems", "Robotics", "Healthcare"];
const lastNames = ["Vaswani", "Devlin", "Brown", "Lewis", "Bai", "Ouyang", "Radford", "He", "Kingma", "Goodfellow"];
const venues = ["NeurIPS", "ICML", "ICLR", "ACL", "CVPR", "EMNLP", "AAAI", "arXiv"];
const tagPool = ["transformer", "attention", "nlp", "vision", "rlhf", "alignment", "retrieval", "safety", "efficiency", "benchmark"];
const statuses = ["to-read", "reading", "done"];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function randomTags() {
  const n = 1 + Math.floor(Math.random() * 3);
  const tags = new Set();
  while (tags.size < n) tags.add(pick(tagPool));
  return [...tags];
}

function makePaper(i) {
  return {
    listId: "demo",
    title: `${pick(topics)} for ${pick(domains)} (#${i + 1})`,
    authors: `${pick(lastNames)} et al.`,
    venue: pick(venues),
    year: 2015 + Math.floor(Math.random() * 10),
    tags: randomTags(),
    status: pick(statuses),
    comments: [],
  };
}

// Nat's book generator
const bookTitles = ["Clean Architecture", "The Pragmatic Programmer", "Refactoring", "Design Patterns", "You Don't Know JS", "Eloquent JavaScript", "The Algorithm Design Manual", "Database Internals", "Site Reliability Engineering", "The Phoenix Project"];
const bookAuthors = ["Martin Fowler", "Robert Martin", "Kent Beck", "Marijn Haverbeke", "Kyle Simpson", "Steven Skiena", "Gene Kim", "Alex Xu"];
const genres = ["Software Engineering", "Systems", "Architecture", "Database", "JavaScript", "DevOps"];

function makeBook(i) {
  return {
    listId: "demo",
    title: `${pick(bookTitles)} Vol. ${i + 1}`,
    authors: pick(bookAuthors),
    genre: pick(genres),
    tags: randomTags(),
    order: i + 1,
    status: pick(statuses),
    comments: [],
  };
}

// sample list
const sampleList = {
  name: "CS5610 Reading List",
  description: "Books and papers for our web dev course",
  editToken: "demo-edit-token-secret",
  createdAt: new Date(),
};

// sample comments
const sampleComments = [
  { entryId: "demo", entryType: "book", author: "Sofia", body: "Loved this book", createdAt: new Date() },
  { entryId: "demo", entryType: "book", author: "Marcos", body: "Chapter 3 changed how I write functions.", createdAt: new Date() },
  { entryId: "demo", entryType: "paper", author: "Alice", body: "Classic paper.", createdAt: new Date() },
];

async function seed() {
  await connectDB();

  // lists
  const lists = getDB().collection("lists");
  await lists.deleteMany({});
  await lists.insertOne(sampleList);
  console.log("Inserted 1 list");

  // papers — 500 generated
  const papers = getDB().collection("papers");
  await papers.deleteMany({});
  const paperDocs = Array.from({ length: COUNT }, (_, i) => makePaper(i));
  const papersResult = await papers.insertMany(paperDocs);
  console.log(`Inserted ${papersResult.insertedCount} papers`);

  // books — 500 generated
  const books = getDB().collection("books");
  await books.deleteMany({});
  const bookDocs = Array.from({ length: COUNT }, (_, i) => makeBook(i));
  const booksResult = await books.insertMany(bookDocs);
  console.log(`Inserted ${booksResult.insertedCount} books`);

  // comments
  const comments = getDB().collection("comments");
  await comments.deleteMany({});
  const commentsResult = await comments.insertMany(sampleComments);
  console.log(`Inserted ${commentsResult.insertedCount} comments`);

  process.exit(0);
}

seed();
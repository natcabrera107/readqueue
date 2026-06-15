import { getDB } from "./db.js";
import { ObjectId } from "mongodb";

// All paper documents live in the "papers" collection.
const papers = () => getDB().collection("papers");

// READ — all papers (optionally only those in one list).
export async function getPapers(listId) {
  const query = listId ? { listId } : {};
  return papers().find(query).toArray();
}

// READ — one paper by id (its embedded comments come with it).
export async function getPaper(id) {
  return papers().findOne({ _id: new ObjectId(id) });
}

// CREATE — insert a new paper, starting with an empty comments array.
export async function createPaper(data) {
  const paper = {
    listId: data.listId ?? null,
    title: data.title ?? "",
    authors: data.authors ?? "",
    venue: data.venue ?? "",
    year: data.year ?? null,
    tags: data.tags ?? [],
    status: data.status ?? "to-read",
    comments: [],
  };
  const result = await papers().insertOne(paper);
  return { ...paper, _id: result.insertedId };
}

// UPDATE — overwrite the given fields (edit details or change status).
export async function updatePaper(id, data) {
  await papers().updateOne({ _id: new ObjectId(id) }, { $set: data });
  return getPaper(id);
}

// DELETE — remove a paper.
export async function deletePaper(id) {
  await papers().deleteOne({ _id: new ObjectId(id) });
}

// COMMENT — push a comment onto the paper's embedded comments array.
export async function addComment(id, { author, text }) {
  const comment = {
    _id: new ObjectId(),
    author,
    text,
    createdAt: new Date(),
  };
  await papers().updateOne(
    { _id: new ObjectId(id) },
    { $push: { comments: comment } }
  );
  return getPaper(id);
}

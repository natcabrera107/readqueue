import { getDB } from "./db.js"
import { ObjectId } from "mongodb";

const books = () => getDB().collection("books");

//Read books
export async function getBooks(listId) {
    const query = listId ? {listId} : {};
    return books().find(query).toArray();
}

// Read a single book getBook 
export async function getBook(id) {
    return books().findOne({ _id: new ObjectId(id) });
}

// createBook - make a document with defaults use ?? js nullish coalescing 
export async function createBook(data) {
    const book = {
        listId: data.listId ?? null, 
        title: data.title ?? "",
        authors: data.authors ?? "",
        genre: data.genre ?? "", 
        tags: data.tags ?? [],
        order: data.order ?? null,
        status: data.status ?? "to-read", 
        comments: [],
    };
    //.inserOne mongo driver method to insert a doc and to return 
    const result = await books().insertOne(book);
    return { ...book, _id: result.insertedId};
}
// Uses mongo driver method to update matching doc where id mataches 
export async function updateBook(id, data) {

    await books().updateOne(
        {_id: new ObjectId(id)},
        {$set: data}
    );

    return getBook(id);
}

//DELETE uses .deleteOne() mongo driver method 
export async function deleteBook(id) {
    await books().deleteOne(
        {_id: new ObjectId(id)}
    );
}

//ADD comment 
export async function addBookComment(id, {author, text}) {
    const comment = {
        _id: new ObjectId(),
        author, 
        text, 
        createdAt: new Date(), 
    };

    await books().updateOne(
        {_id: new ObjectId(id)},
        {$push: {comments: comment}}
    );

    return getBook(id);
}
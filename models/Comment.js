import { getDB } from "./db.js";

//All comments live in the comments collections 
const comments = () => getDB().collection("comments");

//Read all comments from an entry point 
export async function getComments(entryId) {
    return comments().find({entryId}).toArray();
}

//Create --insert a new comment 
export async function addComment(data) {
    const comment = {
        entryId: data.entryId, 
        entryType: data.entryType ?? "book", 
        author: data.author ?? "",
        body:  data.body ?? "", 
        createdAt: new Date(),
    };
    const result = await comments().insertOne(comment);
    return {...comment, _id: result.insertedId};
}


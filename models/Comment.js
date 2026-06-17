import { getDB } from "./db.js";

import { ObjectId } from 'mongodb';

export function getCommentsCollection() {
    return getDB().collection("comments");
}
import "dotenv/config";
import {MongoClient} from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

let db;

export async function connectDB() {
    await client.connect();
    db = client.db("readqueue");
    console.log("Connected to MongoDB");
}

export function getDB() {
    if (!db) {
        throw new Error("Database not connected or found");
    }
    return db;

}
import { getDB } from "./db.js";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";

//all list docs 

const lists = () => getDB().collection("lists"); 

export async function getList(id) {
    return lists().findOne({ _id: new ObjectId(id) });

}

export async function createList(data) {
    const list = {
        name: data.name ?? "", 
        description: data.description ?? "", 
        editToken:   randomUUID(),
        createdAt:   new Date(),
    };
    const result = await lists().insertOne(list);
    return { ...list, _id: result.insertedId};
}
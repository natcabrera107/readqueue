import {getDB} from "./db.js";
import { ObjectId } from 'mongodb';

//all list docs 

const lists = () => getDB().collection("lists"); 

export async function getList(id) {
    return lists().findOne({ _id: new objectId(id)});

}

export async function createList(data) {
    const list = {
        name: data.name ?? "", 
        description: data.description ?? "", 
        editToken:   crypto.randomUUID(),
        createdAt:   new Date(),
    };
    const result = await lists().insertOne(list);
    return { ...list, _id: result.insertId};
}
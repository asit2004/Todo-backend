import mongoose from "mongoose";
import { User } from "./User.js";

const TodoSchema = new mongoose.Schema({
    task: String,
    completed: {
        type: Boolean,
        default: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
})

export const Todo = mongoose.model('Todo', TodoSchema)

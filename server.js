import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import { User } from "./models/User.js";
import { Todo } from "./models/Todo.js";
import dotenv from "dotenv"
dotenv.config()
const app = express();
const PORT = process.env.PORT || 8080


app.use(express.json());
app.use(cors())

mongoose.connect (process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection failed:', err));

app.post("/add", async (req, res) => {
    const { name, email, password } = req.body
    console.log(req.body.email)
    if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required." });
    }
    try {
        console.log(req.body);
        const newUser = await new User({ name, Email: email, password })
        await newUser.save()
        res.json({ message: "signed up succesful", userid: newUser.id })
    } catch (err) {
        console.error("Error in POST /:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});


app.post("/addtodo", async (req, res) => {
    const { userid, task } = req.body
    console.log(req.body)
    if (!userid) {
        return res.status(400).json({ error: "User does not exist" });
    }
    try {
        console.log(req.body);
        const newTodo = await new Todo({ task, user: userid })

        await newTodo.save()
        res.json({ message: "Todo added",todo:newTodo })
    } catch (err) {
        console.error("Error in POST /:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

app.post("/signin", async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "Email and Password are required" });
    }
    try {
        const user = await User.findOne({ Email: email })
        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }
        if (user.password !== password) {
            return res.status(401).json({ error: "Password is incorrect" })
        }
        res.json({ message: "Signed in succesfully", userid: user._id })
    } catch (err) {
        console.error("Error in POST /signin:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

app.get("/gettodo", async (req, res) => {

    const userid = req.query.userid
    console.log(userid)
    if (!userid) {
        return res.status(400).json({ error: "User does not exist" });
    }
    try {
        const getTodo = await Todo.find({ user: userid }).sort({createdAt:-1})
        console.log(getTodo);
        res.json({ Todo: getTodo })
    } catch (err) {
        console.error("Error in POST /:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});


app.delete("/deletetask", async (req, res) => {

    const { userid, taskid } = req.query
    console.log(userid)
    if (!userid || !taskid) {
        return res.status(400).json({ error: "UserID and TaskID are required." });
    }
    try {
        const deletedTodo = await Todo.findOneAndDelete({ _id: taskid, user: userid })
        if (!deletedTodo) {
            return res.status(404).json({ error: "Task not found or unauthorised" })
        }
        res.json({ message: "Task deleted succesfully" })
    } catch (err) {
        console.error("Error in DELETE /deletetask:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});

app.put("/updatetask", async (req, res) => {
    const { userid, taskid, completed } = req.body;
    if (!userid || !taskid) {
        return res.status(400).json({ error: "UserID and TaskID are required." });
    }

    try {
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: taskid, user: userid },
            { completed },
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ error: "Task not found or unauthorized" });
        }

        res.json({ message: "Task updated successfully", updatedTodo });
    } catch (err) {
        console.error("Error in PUT /updatetask:", err);
        res.status(400).json({ error: "Internal server error", details: err.message });
    }
});

app.put("/edittask", async (req, res) => {
    const { userid, taskid,newText } = req.body

    if (!userid || !taskid ||!newText) {
        return res.status(400).json({ error: "UserId, TaskId and newText are required" });
    }
    try {
        const updatedTask = await Todo.findOneAndUpdate(
            {_id:taskid,user: userid},
            {task:newText},
            {new:true}
        )
        if (!updatedTask) {
            return res.status(404).json({ error: "Task not found" })
        }
        
        res.json({ message: "Task text updated succesfully", updatedTask })
    } catch (err) {
        console.error("Error in POST /edittask:", err);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
});


app.post("/logout", async (req, res) => {
    const { userid } = req.body
    if (!userid) {
        return res.status(400).json({ error: "UserID is required" })
    }
    try {
        const user = await User.findById(userid)
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        res.json({message:"Logged out succesfully"})
    } catch (err) {
        console.error("Error in POST /logout:",err);
        res.status(500).json({error:"Internal server error",details:err.message})
    }
}
)



app.listen(PORT, () => console.log(`Server running on ${PORT}`));

import Task from "../model/taskmodel.js";

// create a new task
export const createTask = async (req, res) => {
    try {
        const { title, description, priority, duedate, completed } = req.body;
        const task = new Task({
            title,
            description,
            priority,
            duedate,
            completed: completed === 'yes' || completed === true,
            owner: req.user.id
        });
        const saved = await task.save();
        res.status(201).json({ success: true, task: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// get all tasks for logged in user
export const getTask = async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// get single task by id
export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
        if (!task) return res.status(404).json({
            success: false,
            message: "task not found"
        });
        res.json({ success: true, task });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// update a task
export const updateTask = async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.completed !== undefined) {
            data.completed = data.completed === 'yes' || data.completed === true;
        }
        const updated = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            data,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({
            success: false, message: "task not found or not yours"
        });
        res.json({ success: true, task: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// delete a task
export const deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!deleted) return res.status(404).json({ success: false, message: "task not found or not yours" });
        res.json({ success: true, message: "task deleted" });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}
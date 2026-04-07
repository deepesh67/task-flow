import Task from "../model/taskmodel.js";
import userModel from "../model/userMODEL.js";

// ✅ Admin — Task banao aur kisi employee ko assign karo
export const createTask = async (req, res) => {
    try {
        // Sirf admin task bana sakta hai
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only admin can create tasks" });
        }

        const { title, description, priority, duedate, completed, assignedTo } = req.body;

        if (!assignedTo) {
            return res.status(400).json({ success: false, message: "Please assign task to an employee" });
        }

        const task = new Task({
            title,
            description,
            priority,
            duedate,
            completed: completed === 'yes' || completed === true,
            owner: req.user.id,
            assignedTo
        });

        const saved = await task.save();
        res.status(201).json({ success: true, task: saved });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ✅ Tasks fetch karo — Admin ko sab, Employee ko sirf apne
export const getTask = async (req, res) => {
    try {
        let tasks;
        if (req.user.role === 'admin') {
            // Admin — sab tasks dekhe with employee info
            tasks = await Task.find()
                .populate('assignedTo', 'name email')
                .populate('owner', 'name')
                .sort({ createdAt: -1 });
        } else {
            // Employee — sirf apne assigned tasks
            tasks = await Task.find({ assignedTo: req.user.id })
                .sort({ createdAt: -1 });
        }
        res.json({ success: true, tasks });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Single task by id
export const getTaskById = async (req, res) => {
    try {
        let task;
        if (req.user.role === 'admin') {
            task = await Task.findById(req.params.id).populate('assignedTo', 'name email');
        } else {
            task = await Task.findOne({ _id: req.params.id, assignedTo: req.user.id });
        }
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });
        res.json({ success: true, task });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ✅ Task update — Admin sab kuch badal sakta hai, Employee sirf complete kar sakta hai
export const updateTask = async (req, res) => {
    try {
        let updated;

        if (req.user.role === 'admin') {
            // Admin — sab kuch update kar sakta hai
            const data = { ...req.body };
            if (data.completed !== undefined) {
                data.completed = data.completed === 'yes' || data.completed === true;
            }
            updated = await Task.findByIdAndUpdate(
                req.params.id,
                data,
                { new: true, runValidators: true }
            );
        } else {
            // Employee — sirf completed status badal sakta hai
            const { completed } = req.body;
            updated = await Task.findOneAndUpdate(
                { _id: req.params.id, assignedTo: req.user.id },
                { completed: completed === 'yes' || completed === true },
                { new: true }
            );
        }

        if (!updated) return res.status(404).json({ success: false, message: "Task not found" });
        res.json({ success: true, task: updated });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ✅ Task delete — Sirf Admin
export const deleteTask = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Only admin can delete tasks" });
        }
        const deleted = await Task.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: "Task not found" });
        res.json({ success: true, message: "Task deleted" });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// ✅ Admin — Saare employees ki list
export const getEmployees = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const employees = await userModel.find({ role: 'employee' }).select('name email');
        res.json({ success: true, employees });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
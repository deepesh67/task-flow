import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { createTask, deleteTask, getTask, getTaskById, updateTask } from './../controllers/taskcontroller.js';

const taskrouter = express.Router();

// GET all tasks & POST new task
taskrouter.route('/gp')
    .get(authMiddleware, getTask)
    .post(authMiddleware, createTask);

// GET single, UPDATE, DELETE task by id
taskrouter.route('/gp/:id')
    .get(authMiddleware, getTaskById)
    .put(authMiddleware, updateTask)
    .delete(authMiddleware, deleteTask);

export default taskrouter;
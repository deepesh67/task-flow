import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js'

import userRouter from './routes/userRoute.js'
import taskrouter from './routes/taskroute.js'


const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB CONNECT
connectDB();

// routes
app.use("/api/user", userRouter);
app.use("/api/tasks", taskrouter);

app.get('/', (req, res) => {
    res.send('API WORKING');
})

app.listen(port, () => {
    console.log(`server started on http://localhost:${port}`);
})
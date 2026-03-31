import userModel from "../model/userMODEL.js"
import validator from "validator"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_JWT_secret_here';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

export async function registerUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "password must be atleast 8 characters" })
    }
    try {
        if (await userModel.findOne({ email })) {
            return res.status(400).json({ success: false, message: "user already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await userModel.create({ name, email, password: hashed });
        const token = createToken(user._id);

        res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "server error" });
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "email and password required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "invalid credential" });
        }
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: "invalid credential" });
        }

        const token = createToken(user._id);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "server error" });
    }
}

export async function getCurrentUser(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("name email");
        if (!user) {
            return res.status(400).json({ success: false, message: "user not found" });
        }
        res.json({ success: true, user })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "server error" });
    }
}

export async function updateProfile(req, res) {
    const { name, email } = req.body;

    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "valid name and email required" });
    }
    try {
        const exists = await userModel.findOne({ email, _id: { $ne: req.user.id } });

        if (exists) {
            return res.status(409).json({ success: false, message: "email already in use by another account" });
        }

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true, select: "name email" }
        );

        res.json({ success: true, user })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "server error" });
    }
}

export async function updatePassword(req, res) {
    const { currentpassword, newpassword } = req.body;

    if (!currentpassword || !newpassword || newpassword.length < 8) {
        return res.status(400).json({ success: false, message: "password invalid or too short" });
    }
    try {
        const user = await userModel.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" });
        }

        const match = await bcrypt.compare(currentpassword, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "current password incorrect" });
        }
        user.password = await bcrypt.hash(newpassword, 10);
        await user.save();
        res.json({ success: true, message: "password changed" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "server error" });
    }
}
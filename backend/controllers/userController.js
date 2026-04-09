import userModel from "../model/userMODEL.js"
import validator from "validator"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

const JWT_SECRET = process.env.JWT_SECRET || 'your_JWT_secret_here';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, name) => {
    await transporter.sendMail({
        from: `"Taskflow" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Taskflow OTP Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 30px; border: 1px solid #e9d5ff; border-radius: 16px;">
                <h2 style="color: #a855f7;">Hey ${name}! 👋</h2>
                <p style="color: #555;">Your OTP code for Taskflow signup is:</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a855f7; text-align: center; padding: 20px; background: #f3e8ff; border-radius: 12px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #888; font-size: 13px;">This OTP is valid for <strong>10 minutes</strong> only.</p>
                <p style="color: #888; font-size: 13px;">If you did not request this, please ignore this email.</p>
            </div>
        `
    });
};

export async function registerUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" })
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" })
    }
    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        if (existingUser && !existingUser.isVerified) {
            existingUser.name = name;
            existingUser.password = hashed;
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            await existingUser.save();
        } else {
            await userModel.create({ name, email, password: hashed, otp, otpExpiry, isVerified: false });
        }

        await sendOTPEmail(email, otp, name);
        res.status(201).json({ success: true, message: "OTP sent to your email", email });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function verifyOTP(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP required" });
    }
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "User already verified" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ success: false, message: "OTP expired, please signup again" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const token = createToken(user._id);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function resendOTP(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email required" });
    }
    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (user.isVerified) {
            return res.status(400).json({ success: false, message: "User already verified" });
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTPEmail(email, otp, user.name);
        res.json({ success: true, message: "OTP resent successfully" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function loginUser(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res.status(403).json({ success: false, message: "Please verify your email first" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function getCurrentUser(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("name email role");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function updateProfile(req, res) {
    const { name, email } = req.body;

    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Valid name and email required" });
    }
    try {
        const exists = await userModel.findOne({ email, _id: { $ne: req.user.id } });

        if (exists) {
            return res.status(409).json({ success: false, message: "Email already in use by another account" });
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
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function updatePassword(req, res) {
    const { currentpassword, newpassword } = req.body;

    if (!currentpassword || !newpassword || newpassword.length < 8) {
        return res.status(400).json({ success: false, message: "Password invalid or too short" });
    }
    try {
        const user = await userModel.findById(req.user.id).select("password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const match = await bcrypt.compare(currentpassword, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Current password incorrect" });
        }
        user.password = await bcrypt.hash(newpassword, 10);
        await user.save();
        res.json({ success: true, message: "Password changed" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// ✅ Forgot Password
export async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTPEmail(email, otp, user.name);
        res.json({ success: true, message: "OTP sent to your email" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// ✅ Reset Password
export async function resetPassword(req, res) {
    const { email, otp, newpassword } = req.body;
    if (!email || !otp || !newpassword) {
        return res.status(400).json({ success: false, message: "All fields required" });
    }
    if (newpassword.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
        if (new Date() > user.otpExpiry) return res.status(400).json({ success: false, message: "OTP expired" });

        user.password = await bcrypt.hash(newpassword, 10);
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ success: true, message: "Password reset successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// ✅ Admin — Create employee
export async function createEmployee(req, res) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields required" });
    }
    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const exists = await userModel.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await userModel.create({
            name, email,
            password: hashed,
            role: 'employee',
            isVerified: true
        });
        res.status(201).json({ success: true, message: "Employee created!", user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

// ✅ Admin — Delete employee
export async function deleteEmployee(req, res) {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const user = await userModel.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.role === 'admin') return res.status(403).json({ success: false, message: "Cannot delete admin" });

        await userModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Employee deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}
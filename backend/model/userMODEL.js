import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // ✅ Role add kiya — admin ya employee
    role: {
        type: String,
        enum: ['admin', 'employee'],
        default: 'employee'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    }
})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
import express from "express";
import { 
    getCurrentUser, 
    loginUser, 
    registerUser, 
    updatePassword, 
    updateProfile,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    createEmployee,
    deleteEmployee
} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js'

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/verify-otp', verifyOTP);
userRouter.post('/resend-otp', resendOTP);
userRouter.post('/login', loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

// ✅ Admin — Employee management
userRouter.post('/create-employee', authMiddleware, createEmployee);
userRouter.delete('/delete-employee/:id', authMiddleware, deleteEmployee);

userRouter.get('/me', authMiddleware, getCurrentUser);
userRouter.put('/profile', authMiddleware, updateProfile);
userRouter.put('/password', authMiddleware, updatePassword);

export default userRouter;
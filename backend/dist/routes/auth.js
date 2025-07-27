"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const auth_1 = require("../utils/auth");
const crypto_1 = __importDefault(require("crypto"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Validation middleware
const validateRegistration = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
    (0, express_validator_1.body)('phone').optional().trim(),
    (0, express_validator_1.body)('userType').optional().isIn(['PET_OWNER', 'PET_PILOT']).withMessage('Invalid user type'),
];
const validateLogin = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
// Register endpoint
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { email, password, firstName, lastName, phone, userType = 'PET_OWNER' } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }
        // Hash password
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                userType,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                userType: true,
                createdAt: true,
            }
        });
        // Generate tokens
        const tokens = (0, auth_1.generateTokens)({
            userId: user.id,
            email: user.email,
            userType: user.userType,
        });
        res.status(201).json({
            message: 'User registered successfully',
            user,
            tokens,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration'
        });
    }
});
// Login endpoint
router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { email, password } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Account disabled',
                message: 'Your account has been disabled. Please contact support.'
            });
        }
        // Verify password
        const isPasswordValid = await (0, auth_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }
        // Generate tokens
        const tokens = (0, auth_1.generateTokens)({
            userId: user.id,
            email: user.email,
            userType: user.userType,
        });
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
            tokens,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
});
// Refresh token endpoint
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required',
                message: 'Please provide a refresh token'
            });
        }
        // Verify refresh token
        const payload = (0, auth_1.verifyRefreshToken)(refreshToken);
        // Check if user still exists and is active
        const user = await prisma.user.findUnique({
            where: { id: payload.userId }
        });
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'Invalid refresh token',
                message: 'User not found or account disabled'
            });
        }
        // Generate new tokens
        const tokens = (0, auth_1.generateTokens)({
            userId: user.id,
            email: user.email,
            userType: user.userType,
        });
        res.json({
            message: 'Tokens refreshed successfully',
            tokens,
        });
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            error: 'Invalid refresh token',
            message: 'Please login again'
        });
    }
});
// Logout endpoint (in a real app, you might want to blacklist the token)
router.post('/logout', (req, res) => {
    res.json({
        message: 'Logged out successfully',
        note: 'Please remove tokens from client storage'
    });
});
// Forgot password endpoint
router.post('/forgot-password', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { email } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({
                message: 'If an account with that email exists, a password reset link has been sent'
            });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Save reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        // In a real implementation, you would send an email here
        // For now, we'll just log the token (remove in production!)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        // Create notification
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'Password Reset Requested',
                message: 'A password reset was requested for your account',
                type: 'SYSTEM_ALERT',
                data: {
                    resetToken,
                    requestedAt: new Date()
                }
            }
        });
        res.json({
            message: 'If an account with that email exists, a password reset link has been sent'
        });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            error: 'Request failed',
            message: 'An error occurred while processing your request'
        });
    }
});
// Reset password endpoint
router.post('/reset-password', [
    (0, express_validator_1.body)('token').notEmpty().withMessage('Reset token is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { token, password } = req.body;
        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired token',
                message: 'The reset token is invalid or has expired'
            });
        }
        // Hash new password
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
                updatedAt: new Date()
            }
        });
        // Create notification
        await prisma.notification.create({
            data: {
                userId: user.id,
                title: 'Password Reset Successful',
                message: 'Your password has been reset successfully',
                type: 'SYSTEM_ALERT',
                data: {
                    resetAt: new Date()
                }
            }
        });
        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                action: 'password_reset',
                details: {
                    resetAt: new Date()
                }
            }
        });
        res.json({
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            error: 'Reset failed',
            message: 'An error occurred while resetting your password'
        });
    }
});
// Change password endpoint (for authenticated users)
router.post('/change-password', [
    (0, express_validator_1.body)('currentPassword').notEmpty().withMessage('Current password is required'),
    (0, express_validator_1.body)('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { currentPassword, newPassword } = req.body;
        // This would need authentication middleware in a real implementation
        // For now, we'll return a placeholder response
        res.json({
            message: 'Change password functionality requires authentication middleware'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Change password failed',
            message: 'An error occurred while changing your password'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map
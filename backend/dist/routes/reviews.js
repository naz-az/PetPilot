"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const client_1 = require("@prisma/client");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Create a review
router.post('/', auth_1.authenticateToken, [
    (0, express_validator_1.body)('pilotId').notEmpty().withMessage('Pilot ID is required'),
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { pilotId, rating, comment } = req.body;
        // Check if user has already reviewed this pilot
        const existingReview = await prisma.review.findFirst({
            where: {
                reviewerId: req.user.userId,
                pilotId: pilotId
            }
        });
        if (existingReview) {
            return res.status(400).json({
                error: 'Review already exists',
                message: 'You have already reviewed this pilot'
            });
        }
        // Verify pilot exists
        const pilot = await prisma.user.findFirst({
            where: {
                id: pilotId,
                userType: 'PET_PILOT'
            },
            include: {
                pilotProfile: true
            }
        });
        if (!pilot || !pilot.pilotProfile) {
            return res.status(404).json({
                error: 'Pilot not found',
                message: 'The specified pilot does not exist'
            });
        }
        // Create the review
        const review = await prisma.review.create({
            data: {
                reviewerId: req.user.userId,
                pilotId,
                rating,
                comment: comment?.trim() || null,
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        });
        // Update pilot's average rating
        const avgRating = await prisma.review.aggregate({
            where: { pilotId },
            _avg: { rating: true },
            _count: true
        });
        await prisma.pilotProfile.update({
            where: { userId: pilotId },
            data: {
                rating: avgRating._avg.rating || 0,
            }
        });
        // Create notification for pilot
        await prisma.notification.create({
            data: {
                userId: pilotId,
                title: 'New Review',
                message: `You received a ${rating}-star review`,
                type: 'REVIEW_RECEIVED',
                data: {
                    reviewId: review.id,
                    rating,
                    reviewerId: req.user.userId
                }
            }
        });
        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: req.user.userId,
                action: 'review_created',
                details: {
                    reviewId: review.id,
                    pilotId,
                    rating
                }
            }
        });
        res.status(201).json({
            message: 'Review created successfully',
            review,
        });
    }
    catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({
            error: 'Failed to create review',
            message: 'An error occurred while creating the review'
        });
    }
});
// Get reviews for a pilot
router.get('/pilot/:pilotId', async (req, res) => {
    try {
        const { pilotId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const reviews = await prisma.review.findMany({
            where: { pilotId },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        });
        const totalReviews = await prisma.review.count({
            where: { pilotId }
        });
        const avgRating = await prisma.review.aggregate({
            where: { pilotId },
            _avg: { rating: true },
            _count: true
        });
        const ratingDistribution = await prisma.review.groupBy({
            by: ['rating'],
            where: { pilotId },
            _count: true,
        });
        res.json({
            message: 'Reviews retrieved successfully',
            reviews,
            stats: {
                averageRating: avgRating._avg.rating || 0,
                totalReviews: avgRating._count,
                ratingDistribution: ratingDistribution.reduce((acc, curr) => {
                    acc[curr.rating] = curr._count;
                    return acc;
                }, {})
            },
            pagination: {
                page,
                limit,
                total: totalReviews,
                pages: Math.ceil(totalReviews / limit),
            },
        });
    }
    catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({
            error: 'Failed to retrieve reviews',
            message: 'An error occurred while fetching reviews'
        });
    }
});
// Get reviews by the authenticated user
router.get('/my-reviews', auth_1.authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const reviews = await prisma.review.findMany({
            where: { reviewerId: req.user.userId },
            include: {
                pilot: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        pilotProfile: {
                            select: {
                                vehicleType: true,
                                rating: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
        });
        const totalReviews = await prisma.review.count({
            where: { reviewerId: req.user.userId }
        });
        res.json({
            message: 'Your reviews retrieved successfully',
            reviews,
            pagination: {
                page,
                limit,
                total: totalReviews,
                pages: Math.ceil(totalReviews / limit),
            },
        });
    }
    catch (error) {
        console.error('Get my reviews error:', error);
        res.status(500).json({
            error: 'Failed to retrieve your reviews',
            message: 'An error occurred while fetching your reviews'
        });
    }
});
// Update a review
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { id } = req.params;
        const { rating, comment } = req.body;
        // Check if review exists and belongs to user
        const existingReview = await prisma.review.findFirst({
            where: {
                id,
                reviewerId: req.user.userId
            }
        });
        if (!existingReview) {
            return res.status(404).json({
                error: 'Review not found',
                message: 'Review not found or you do not have permission to update it'
            });
        }
        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                rating,
                comment: comment?.trim() || null,
                updatedAt: new Date()
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                pilot: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });
        // Update pilot's average rating
        const avgRating = await prisma.review.aggregate({
            where: { pilotId: existingReview.pilotId },
            _avg: { rating: true }
        });
        await prisma.pilotProfile.update({
            where: { userId: existingReview.pilotId },
            data: {
                rating: avgRating._avg.rating || 0,
            }
        });
        res.json({
            message: 'Review updated successfully',
            review: updatedReview,
        });
    }
    catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({
            error: 'Failed to update review',
            message: 'An error occurred while updating the review'
        });
    }
});
// Delete a review
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if review exists and belongs to user
        const existingReview = await prisma.review.findFirst({
            where: {
                id,
                reviewerId: req.user.userId
            }
        });
        if (!existingReview) {
            return res.status(404).json({
                error: 'Review not found',
                message: 'Review not found or you do not have permission to delete it'
            });
        }
        await prisma.review.delete({
            where: { id }
        });
        // Update pilot's average rating
        const avgRating = await prisma.review.aggregate({
            where: { pilotId: existingReview.pilotId },
            _avg: { rating: true }
        });
        await prisma.pilotProfile.update({
            where: { userId: existingReview.pilotId },
            data: {
                rating: avgRating._avg.rating || 0,
            }
        });
        res.json({
            message: 'Review deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({
            error: 'Failed to delete review',
            message: 'An error occurred while deleting the review'
        });
    }
});
exports.default = router;
//# sourceMappingURL=reviews.js.map
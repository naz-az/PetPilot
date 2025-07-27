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
// Validation middleware for pet creation/update
const validatePet = [
    (0, express_validator_1.body)('name').trim().isLength({ min: 1 }).withMessage('Pet name is required'),
    (0, express_validator_1.body)('species').trim().isLength({ min: 1 }).withMessage('Species is required'),
    (0, express_validator_1.body)('breed').optional().trim(),
    (0, express_validator_1.body)('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive number'),
    (0, express_validator_1.body)('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
    (0, express_validator_1.body)('size').isIn(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']).withMessage('Invalid pet size'),
    (0, express_validator_1.body)('color').optional().trim(),
    (0, express_validator_1.body)('description').optional().trim(),
];
// Create a new pet
router.post('/', auth_1.authenticateToken, validatePet, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { name, species, breed, age, weight, size, color, description, photo } = req.body;
        const pet = await prisma.pet.create({
            data: {
                name,
                species,
                breed,
                age,
                weight,
                size,
                color,
                description,
                photo,
                ownerId: req.user.userId,
            }
        });
        res.status(201).json({
            message: 'Pet created successfully',
            pet,
        });
    }
    catch (error) {
        console.error('Create pet error:', error);
        res.status(500).json({
            error: 'Failed to create pet',
            message: 'An error occurred while creating the pet'
        });
    }
});
// Get all pets for the authenticated user
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const pets = await prisma.pet.findMany({
            where: {
                ownerId: req.user.userId,
                isActive: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            message: 'Pets retrieved successfully',
            pets,
            count: pets.length,
        });
    }
    catch (error) {
        console.error('Get pets error:', error);
        res.status(500).json({
            error: 'Failed to retrieve pets',
            message: 'An error occurred while fetching pets'
        });
    }
});
// Get a specific pet by ID
router.get('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await prisma.pet.findFirst({
            where: {
                id,
                ownerId: req.user.userId,
                isActive: true
            },
            include: {
                bookings: {
                    where: { status: { not: 'CANCELLED' } },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    include: {
                        pilot: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            }
                        }
                    }
                }
            }
        });
        if (!pet) {
            return res.status(404).json({
                error: 'Pet not found',
                message: 'Pet not found or you do not have permission to view it'
            });
        }
        res.json({
            message: 'Pet retrieved successfully',
            pet,
        });
    }
    catch (error) {
        console.error('Get pet error:', error);
        res.status(500).json({
            error: 'Failed to retrieve pet',
            message: 'An error occurred while fetching the pet'
        });
    }
});
// Update a pet
router.put('/:id', auth_1.authenticateToken, validatePet, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { id } = req.params;
        const { name, species, breed, age, weight, size, color, description, photo } = req.body;
        // Check if pet exists and belongs to user
        const existingPet = await prisma.pet.findFirst({
            where: {
                id,
                ownerId: req.user.userId,
                isActive: true
            }
        });
        if (!existingPet) {
            return res.status(404).json({
                error: 'Pet not found',
                message: 'Pet not found or you do not have permission to update it'
            });
        }
        const updatedPet = await prisma.pet.update({
            where: { id },
            data: {
                name,
                species,
                breed,
                age,
                weight,
                size,
                color,
                description,
                photo,
            }
        });
        res.json({
            message: 'Pet updated successfully',
            pet: updatedPet,
        });
    }
    catch (error) {
        console.error('Update pet error:', error);
        res.status(500).json({
            error: 'Failed to update pet',
            message: 'An error occurred while updating the pet'
        });
    }
});
// Delete a pet (soft delete)
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Check if pet exists and belongs to user
        const existingPet = await prisma.pet.findFirst({
            where: {
                id,
                ownerId: req.user.userId,
                isActive: true
            }
        });
        if (!existingPet) {
            return res.status(404).json({
                error: 'Pet not found',
                message: 'Pet not found or you do not have permission to delete it'
            });
        }
        // Check for active bookings
        const activeBookings = await prisma.booking.count({
            where: {
                petId: id,
                status: { in: ['PENDING', 'ACCEPTED', 'EN_ROUTE_TO_PICKUP', 'PET_PICKED_UP', 'EN_ROUTE_TO_DESTINATION'] }
            }
        });
        if (activeBookings > 0) {
            return res.status(400).json({
                error: 'Cannot delete pet',
                message: 'Pet has active bookings. Please complete or cancel them first.'
            });
        }
        // Soft delete the pet
        await prisma.pet.update({
            where: { id },
            data: { isActive: false }
        });
        res.json({
            message: 'Pet deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete pet error:', error);
        res.status(500).json({
            error: 'Failed to delete pet',
            message: 'An error occurred while deleting the pet'
        });
    }
});
exports.default = router;
//# sourceMappingURL=pets.js.map
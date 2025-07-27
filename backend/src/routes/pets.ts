import express, { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation middleware for pet creation/update
const validatePet = [
  body('name').trim().isLength({ min: 1 }).withMessage('Pet name is required'),
  body('species').trim().isLength({ min: 1 }).withMessage('Species is required'),
  body('breed').optional().trim(),
  body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive number'),
  body('weight').optional().isFloat({ min: 0 }).withMessage('Weight must be a positive number'),
  body('size').isIn(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']).withMessage('Invalid pet size'),
  body('color').optional().trim(),
  body('description').optional().trim(),
];

// Create a new pet
router.post('/', authenticateToken, validatePet, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
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
        ownerId: req.user!.userId,
      }
    });

    res.status(201).json({
      message: 'Pet created successfully',
      pet,
    });

  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ 
      error: 'Failed to create pet',
      message: 'An error occurred while creating the pet'
    });
  }
});

// Get all pets for the authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { 
        ownerId: req.user!.userId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      message: 'Pets retrieved successfully',
      pets,
      count: pets.length,
    });

  } catch (error) {
    console.error('Get pets error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve pets',
      message: 'An error occurred while fetching pets'
    });
  }
});

// Get a specific pet by ID
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const pet = await prisma.pet.findFirst({
      where: { 
        id,
        ownerId: req.user!.userId,
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

  } catch (error) {
    console.error('Get pet error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve pet',
      message: 'An error occurred while fetching the pet'
    });
  }
});

// Update a pet
router.put('/:id', authenticateToken, validatePet, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
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
        ownerId: req.user!.userId,
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

  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ 
      error: 'Failed to update pet',
      message: 'An error occurred while updating the pet'
    });
  }
});

// Delete a pet (soft delete)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if pet exists and belongs to user
    const existingPet = await prisma.pet.findFirst({
      where: { 
        id,
        ownerId: req.user!.userId,
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

  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ 
      error: 'Failed to delete pet',
      message: 'An error occurred while deleting the pet'
    });
  }
});

export default router;
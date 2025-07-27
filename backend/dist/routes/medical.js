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
// Get medical records for a pet
router.get('/pet/:petId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { petId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Verify pet belongs to user
        const pet = await prisma.pet.findFirst({
            where: {
                id: petId,
                ownerId: req.user.userId
            }
        });
        if (!pet) {
            return res.status(404).json({
                error: 'Pet not found',
                message: 'Pet not found or you do not have permission to view medical records'
            });
        }
        const medicalRecords = await prisma.medicalRecord.findMany({
            where: { petId },
            orderBy: { visitDate: 'desc' },
            skip: offset,
            take: limit,
        });
        const totalRecords = await prisma.medicalRecord.count({
            where: { petId }
        });
        res.json({
            message: 'Medical records retrieved successfully',
            medicalRecords,
            pagination: {
                page,
                limit,
                total: totalRecords,
                pages: Math.ceil(totalRecords / limit),
            },
        });
    }
    catch (error) {
        console.error('Get medical records error:', error);
        res.status(500).json({
            error: 'Failed to retrieve medical records',
            message: 'An error occurred while fetching medical records'
        });
    }
});
// Create a medical record
router.post('/pet/:petId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('visitDate').isISO8601().withMessage('Valid visit date is required'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('diagnosis').optional().trim().isLength({ max: 500 }).withMessage('Diagnosis must be less than 500 characters'),
    (0, express_validator_1.body)('treatment').optional().trim().isLength({ max: 500 }).withMessage('Treatment must be less than 500 characters'),
    (0, express_validator_1.body)('medications').optional().isArray().withMessage('Medications must be an array'),
    (0, express_validator_1.body)('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    (0, express_validator_1.body)('vetName').optional().trim().isLength({ max: 100 }).withMessage('Vet name must be less than 100 characters'),
    (0, express_validator_1.body)('vetClinic').optional().trim().isLength({ max: 200 }).withMessage('Vet clinic must be less than 200 characters'),
    (0, express_validator_1.body)('nextVisit').optional().isISO8601().withMessage('Next visit must be a valid date')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { petId } = req.params;
        const { title, description, diagnosis, treatment, medications = [], cost, vetName, vetClinic, visitDate, nextVisit } = req.body;
        // Verify pet belongs to user
        const pet = await prisma.pet.findFirst({
            where: {
                id: petId,
                ownerId: req.user.userId
            }
        });
        if (!pet) {
            return res.status(404).json({
                error: 'Pet not found',
                message: 'Pet not found or you do not have permission to add medical records'
            });
        }
        const medicalRecord = await prisma.medicalRecord.create({
            data: {
                petId,
                title: title.trim(),
                description: description?.trim(),
                diagnosis: diagnosis?.trim(),
                treatment: treatment?.trim(),
                medications,
                cost,
                vetName: vetName?.trim(),
                vetClinic: vetClinic?.trim(),
                visitDate: new Date(visitDate),
                nextVisit: nextVisit ? new Date(nextVisit) : null,
                documents: [] // For now, empty array
            }
        });
        // Update pet's last vet visit date
        await prisma.pet.update({
            where: { id: petId },
            data: {
                lastVetVisit: new Date(visitDate),
                nextVetVisit: nextVisit ? new Date(nextVisit) : undefined
            }
        });
        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: req.user.userId,
                action: 'medical_record_created',
                details: {
                    medicalRecordId: medicalRecord.id,
                    petId,
                    title
                }
            }
        });
        res.status(201).json({
            message: 'Medical record created successfully',
            medicalRecord,
        });
    }
    catch (error) {
        console.error('Create medical record error:', error);
        res.status(500).json({
            error: 'Failed to create medical record',
            message: 'An error occurred while creating the medical record'
        });
    }
});
// Update a medical record
router.put('/:id', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('visitDate').isISO8601().withMessage('Valid visit date is required'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('diagnosis').optional().trim().isLength({ max: 500 }).withMessage('Diagnosis must be less than 500 characters'),
    (0, express_validator_1.body)('treatment').optional().trim().isLength({ max: 500 }).withMessage('Treatment must be less than 500 characters'),
    (0, express_validator_1.body)('medications').optional().isArray().withMessage('Medications must be an array'),
    (0, express_validator_1.body)('cost').optional().isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
    (0, express_validator_1.body)('vetName').optional().trim().isLength({ max: 100 }).withMessage('Vet name must be less than 100 characters'),
    (0, express_validator_1.body)('vetClinic').optional().trim().isLength({ max: 200 }).withMessage('Vet clinic must be less than 200 characters'),
    (0, express_validator_1.body)('nextVisit').optional().isISO8601().withMessage('Next visit must be a valid date')
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
        const { title, description, diagnosis, treatment, medications, cost, vetName, vetClinic, visitDate, nextVisit } = req.body;
        // Verify medical record belongs to user's pet
        const medicalRecord = await prisma.medicalRecord.findFirst({
            where: {
                id,
                pet: {
                    ownerId: req.user.userId
                }
            }
        });
        if (!medicalRecord) {
            return res.status(404).json({
                error: 'Medical record not found',
                message: 'Medical record not found or you do not have permission to update it'
            });
        }
        const updatedRecord = await prisma.medicalRecord.update({
            where: { id },
            data: {
                title: title.trim(),
                description: description?.trim(),
                diagnosis: diagnosis?.trim(),
                treatment: treatment?.trim(),
                medications: medications || medicalRecord.medications,
                cost,
                vetName: vetName?.trim(),
                vetClinic: vetClinic?.trim(),
                visitDate: new Date(visitDate),
                nextVisit: nextVisit ? new Date(nextVisit) : null,
                updatedAt: new Date()
            }
        });
        res.json({
            message: 'Medical record updated successfully',
            medicalRecord: updatedRecord,
        });
    }
    catch (error) {
        console.error('Update medical record error:', error);
        res.status(500).json({
            error: 'Failed to update medical record',
            message: 'An error occurred while updating the medical record'
        });
    }
});
// Delete a medical record
router.delete('/:id', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        // Verify medical record belongs to user's pet
        const medicalRecord = await prisma.medicalRecord.findFirst({
            where: {
                id,
                pet: {
                    ownerId: req.user.userId
                }
            }
        });
        if (!medicalRecord) {
            return res.status(404).json({
                error: 'Medical record not found',
                message: 'Medical record not found or you do not have permission to delete it'
            });
        }
        await prisma.medicalRecord.delete({
            where: { id }
        });
        res.json({
            message: 'Medical record deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete medical record error:', error);
        res.status(500).json({
            error: 'Failed to delete medical record',
            message: 'An error occurred while deleting the medical record'
        });
    }
});
// Get vet appointments for a pet
router.get('/appointments/pet/:petId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { petId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        // Verify pet belongs to user
        const pet = await prisma.pet.findFirst({
            where: {
                id: petId,
                ownerId: req.user.userId
            }
        });
        if (!pet) {
            return res.status(404).json({
                error: 'Pet not found',
                message: 'Pet not found or you do not have permission to view appointments'
            });
        }
        const appointments = await prisma.vetAppointment.findMany({
            where: { petId },
            orderBy: { appointmentDate: 'asc' },
            skip: offset,
            take: limit,
        });
        const totalAppointments = await prisma.vetAppointment.count({
            where: { petId }
        });
        res.json({
            message: 'Vet appointments retrieved successfully',
            appointments,
            pagination: {
                page,
                limit,
                total: totalAppointments,
                pages: Math.ceil(totalAppointments / limit),
            },
        });
    }
    catch (error) {
        console.error('Get vet appointments error:', error);
        res.status(500).json({
            error: 'Failed to retrieve vet appointments',
            message: 'An error occurred while fetching vet appointments'
        });
    }
});
// Create a vet appointment
router.post('/appointments/pet/:petId', auth_1.authenticateToken, [
    (0, express_validator_1.body)('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
    (0, express_validator_1.body)('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
    (0, express_validator_1.body)('vetName').trim().isLength({ min: 1, max: 100 }).withMessage('Vet name is required and must be less than 100 characters'),
    (0, express_validator_1.body)('vetClinic').trim().isLength({ min: 1, max: 200 }).withMessage('Vet clinic is required and must be less than 200 characters'),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    (0, express_validator_1.body)('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    (0, express_validator_1.body)('vetPhone').optional().trim().isLength({ max: 20 }).withMessage('Vet phone must be less than 20 characters'),
    (0, express_validator_1.body)('address').optional().trim().isLength({ max: 300 }).withMessage('Address must be less than 300 characters'),
    (0, express_validator_1.body)('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        const { petId } = req.params;
        const { title, description, appointmentDate, duration, vetName, vetClinic, vetPhone, address, notes } = req.body;
        // Verify pet belongs to user
        const pet = await prisma.pet.findFirst({
            where: {
                id: petId,
                ownerId: req.user.userId
            }
        });
        if (!pet) {
            return res.status(404).json({
                error: 'Pet not found',
                message: 'Pet not found or you do not have permission to schedule appointments'
            });
        }
        const appointment = await prisma.vetAppointment.create({
            data: {
                petId,
                title: title.trim(),
                description: description?.trim(),
                appointmentDate: new Date(appointmentDate),
                duration,
                vetName: vetName.trim(),
                vetClinic: vetClinic.trim(),
                vetPhone: vetPhone?.trim(),
                address: address?.trim(),
                notes: notes?.trim(),
                status: 'SCHEDULED'
            }
        });
        // Create notification reminder (in a real app, you'd schedule this)
        await prisma.notification.create({
            data: {
                userId: req.user.userId,
                title: 'Vet Appointment Scheduled',
                message: `Appointment for ${pet.name} scheduled on ${new Date(appointmentDate).toLocaleDateString()}`,
                type: 'SYSTEM_ALERT',
                data: {
                    appointmentId: appointment.id,
                    petId,
                    appointmentDate
                }
            }
        });
        res.status(201).json({
            message: 'Vet appointment created successfully',
            appointment,
        });
    }
    catch (error) {
        console.error('Create vet appointment error:', error);
        res.status(500).json({
            error: 'Failed to create vet appointment',
            message: 'An error occurred while creating the vet appointment'
        });
    }
});
exports.default = router;
//# sourceMappingURL=medical.js.map
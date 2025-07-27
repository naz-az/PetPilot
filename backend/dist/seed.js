"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const auth_1 = require("./utils/auth");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    try {
        // Clean existing data
        console.log('🧹 Cleaning existing data...');
        await prisma.bookingMessage.deleteMany();
        await prisma.bookingTracking.deleteMany();
        await prisma.bookingService.deleteMany();
        await prisma.booking.deleteMany();
        await prisma.review.deleteMany();
        await prisma.favorite.deleteMany();
        await prisma.pilotService.deleteMany();
        await prisma.pilotAvailability.deleteMany();
        await prisma.pet.deleteMany();
        await prisma.pilotProfile.deleteMany();
        await prisma.service.deleteMany();
        await prisma.user.deleteMany();
        // Create Services
        console.log('🛠️ Creating services...');
        const services = await Promise.all([
            prisma.service.create({
                data: {
                    name: 'Pet Transport',
                    description: 'Safe and comfortable transportation for your pet',
                    category: 'Transport',
                    basePrice: 25.00,
                }
            }),
            prisma.service.create({
                data: {
                    name: 'Wait & Assist at Vet',
                    description: 'Stay with your pet during vet appointments',
                    category: 'Care',
                    basePrice: 15.00,
                }
            }),
            prisma.service.create({
                data: {
                    name: 'Pre-Travel Brushing',
                    description: 'Grooming and brushing before transport',
                    category: 'Grooming',
                    basePrice: 20.00,
                }
            }),
            prisma.service.create({
                data: {
                    name: '30-Minute Play & Feed',
                    description: 'Playtime and feeding session for your pet',
                    category: 'Care',
                    basePrice: 18.00,
                }
            }),
            prisma.service.create({
                data: {
                    name: 'Emergency Transport',
                    description: '24/7 emergency pet transportation',
                    category: 'Emergency',
                    basePrice: 50.00,
                }
            }),
        ]);
        // Create Pet Owners
        console.log('👥 Creating pet owners...');
        const petOwner1 = await prisma.user.create({
            data: {
                email: 'john.doe@example.com',
                password: await (0, auth_1.hashPassword)('password123'),
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1-555-0101',
                userType: client_1.UserType.PET_OWNER,
                isVerified: true,
            }
        });
        const petOwner2 = await prisma.user.create({
            data: {
                email: 'sarah.smith@example.com',
                password: await (0, auth_1.hashPassword)('password123'),
                firstName: 'Sarah',
                lastName: 'Smith',
                phone: '+1-555-0102',
                userType: client_1.UserType.PET_OWNER,
                isVerified: true,
            }
        });
        // Create Pet Pilots
        console.log('🚗 Creating pet pilots...');
        const pilot1 = await prisma.user.create({
            data: {
                email: 'mike.johnson@example.com',
                password: await (0, auth_1.hashPassword)('password123'),
                firstName: 'Mike',
                lastName: 'Johnson',
                phone: '+1-555-0201',
                userType: client_1.UserType.PET_PILOT,
                isVerified: true,
            }
        });
        const pilot2 = await prisma.user.create({
            data: {
                email: 'emma.wilson@example.com',
                password: await (0, auth_1.hashPassword)('password123'),
                firstName: 'Emma',
                lastName: 'Wilson',
                phone: '+1-555-0202',
                userType: client_1.UserType.PET_PILOT,
                isVerified: true,
            }
        });
        // Create Pilot Profiles
        console.log('📋 Creating pilot profiles...');
        const pilotProfile1 = await prisma.pilotProfile.create({
            data: {
                userId: pilot1.id,
                bio: 'Experienced pet handler with 5+ years of caring for animals. I love working with pets of all sizes!',
                experience: '5 years of professional pet care and transportation',
                vehicleType: 'SUV',
                vehicleModel: 'Honda CR-V 2022',
                licensePlate: 'PET-001',
                serviceRadius: 15.0,
                hourlyRate: 25.00,
                isVerified: true,
                rating: 4.8,
                completedTrips: 127,
            }
        });
        const pilotProfile2 = await prisma.pilotProfile.create({
            data: {
                userId: pilot2.id,
                bio: 'Certified veterinary assistant who provides gentle and caring transport for your furry friends.',
                experience: '3 years as veterinary assistant, 2 years pet transport',
                vehicleType: 'Van',
                vehicleModel: 'Ford Transit 2021',
                licensePlate: 'PET-002',
                serviceRadius: 20.0,
                hourlyRate: 30.00,
                isVerified: true,
                rating: 4.9,
                completedTrips: 89,
            }
        });
        // Create Pilot Services (link pilots with services they offer)
        console.log('🔗 Creating pilot services...');
        await Promise.all([
            // Pilot 1 services
            prisma.pilotService.create({
                data: {
                    pilotId: pilotProfile1.id,
                    serviceId: services[0].id, // Pet Transport
                    price: 25.00,
                }
            }),
            prisma.pilotService.create({
                data: {
                    pilotId: pilotProfile1.id,
                    serviceId: services[1].id, // Wait & Assist at Vet
                    price: 15.00,
                }
            }),
            prisma.pilotService.create({
                data: {
                    pilotId: pilotProfile1.id,
                    serviceId: services[3].id, // 30-Minute Play & Feed
                    price: 20.00,
                }
            }),
            // Pilot 2 services
            prisma.pilotService.create({
                data: {
                    pilotId: pilotProfile2.id,
                    serviceId: services[0].id, // Pet Transport
                    price: 30.00,
                }
            }),
            prisma.pilotService.create({
                data: {
                    pilotId: pilotProfile2.id,
                    serviceId: services[1].id, // Wait & Assist at Vet
                    price: 18.00,
                }
            }),
            prisma.pilotService.create({
                data: {
                    pilotId: pilotProfile2.id,
                    serviceId: services[2].id, // Pre-Travel Brushing
                    price: 22.00,
                }
            }),
            prisma.pilotService.create({
                data: {
                    pilotId: pilotProfile2.id,
                    serviceId: services[4].id, // Emergency Transport
                    price: 55.00,
                }
            }),
        ]);
        // Create Pilot Availability
        console.log('📅 Creating pilot availability...');
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
            await prisma.pilotAvailability.create({
                data: {
                    pilotId: pilotProfile1.id,
                    dayOfWeek,
                    startTime: '08:00',
                    endTime: '18:00',
                }
            });
            await prisma.pilotAvailability.create({
                data: {
                    pilotId: pilotProfile2.id,
                    dayOfWeek,
                    startTime: '06:00',
                    endTime: '22:00',
                }
            });
        }
        // Create Pets
        console.log('🐕 Creating pets...');
        const pet1 = await prisma.pet.create({
            data: {
                name: 'Buddy',
                species: 'Dog',
                breed: 'Golden Retriever',
                age: 4,
                weight: 30.5,
                size: client_1.PetSize.LARGE,
                color: 'Golden',
                description: 'Friendly and energetic dog who loves car rides!',
                ownerId: petOwner1.id,
            }
        });
        const pet2 = await prisma.pet.create({
            data: {
                name: 'Whiskers',
                species: 'Cat',
                breed: 'Persian',
                age: 2,
                weight: 4.2,
                size: client_1.PetSize.SMALL,
                color: 'White and Gray',
                description: 'Calm and gentle cat who prefers quiet environments.',
                ownerId: petOwner1.id,
            }
        });
        const pet3 = await prisma.pet.create({
            data: {
                name: 'Max',
                species: 'Dog',
                breed: 'German Shepherd',
                age: 6,
                weight: 35.0,
                size: client_1.PetSize.LARGE,
                color: 'Black and Tan',
                description: 'Well-trained police dog, very obedient.',
                ownerId: petOwner2.id,
            }
        });
        // Create Bookings
        console.log('📋 Creating bookings...');
        const booking1 = await prisma.booking.create({
            data: {
                petOwnerId: petOwner1.id,
                pilotId: pilot1.id,
                petId: pet1.id,
                pickupLocation: '123 Main St, New York, NY 10001',
                dropoffLocation: 'Happy Paws Veterinary Clinic, 456 Oak Ave, New York, NY 10002',
                pickupLat: 40.7128,
                pickupLng: -74.0060,
                dropoffLat: 40.7282,
                dropoffLng: -73.9942,
                scheduledTime: new Date('2024-02-01T14:00:00Z'),
                estimatedPrice: 35.00,
                finalPrice: 35.00,
                distance: 3.2,
                duration: 25,
                status: client_1.BookingStatus.COMPLETED,
                notes: 'Buddy is friendly but gets excited in the car. Please use the seat belt harness.',
            }
        });
        const booking2 = await prisma.booking.create({
            data: {
                petOwnerId: petOwner1.id,
                pilotId: pilot2.id,
                petId: pet2.id,
                pickupLocation: '123 Main St, New York, NY 10001',
                dropoffLocation: 'City Pet Grooming, 789 Pine St, New York, NY 10003',
                pickupLat: 40.7128,
                pickupLng: -74.0060,
                dropoffLat: 40.7505,
                dropoffLng: -73.9934,
                scheduledTime: new Date('2024-02-15T10:30:00Z'),
                estimatedPrice: 45.00,
                status: client_1.BookingStatus.EN_ROUTE_TO_PICKUP,
                notes: 'Whiskers is shy around strangers. Please speak softly and move slowly.',
            }
        });
        const booking3 = await prisma.booking.create({
            data: {
                petOwnerId: petOwner2.id,
                petId: pet3.id,
                pickupLocation: '789 Elm St, Brooklyn, NY 11201',
                dropoffLocation: 'Brooklyn Animal Hospital, 321 Court St, Brooklyn, NY 11201',
                pickupLat: 40.6892,
                pickupLng: -73.9442,
                dropoffLat: 40.6879,
                dropoffLng: -73.9441,
                scheduledTime: new Date('2024-02-20T16:00:00Z'),
                estimatedPrice: 28.00,
                status: client_1.BookingStatus.PENDING,
                notes: 'Max is very well-behaved and follows commands. Emergency vet visit.',
            }
        });
        // Add services to bookings
        console.log('🛠️ Adding services to bookings...');
        await Promise.all([
            prisma.bookingService.create({
                data: {
                    bookingId: booking1.id,
                    serviceId: services[0].id, // Pet Transport
                    price: 25.00,
                }
            }),
            prisma.bookingService.create({
                data: {
                    bookingId: booking1.id,
                    serviceId: services[1].id, // Wait & Assist at Vet
                    price: 15.00,
                }
            }),
            prisma.bookingService.create({
                data: {
                    bookingId: booking2.id,
                    serviceId: services[0].id, // Pet Transport
                    price: 30.00,
                }
            }),
            prisma.bookingService.create({
                data: {
                    bookingId: booking2.id,
                    serviceId: services[2].id, // Pre-Travel Brushing
                    price: 22.00,
                }
            }),
            prisma.bookingService.create({
                data: {
                    bookingId: booking3.id,
                    serviceId: services[4].id, // Emergency Transport
                    price: 55.00,
                }
            }),
        ]);
        // Create Reviews
        console.log('⭐ Creating reviews...');
        await Promise.all([
            prisma.review.create({
                data: {
                    reviewerId: petOwner1.id,
                    pilotId: pilot1.id,
                    rating: 5,
                    comment: 'Mike was fantastic! He handled Buddy with such care and kept me updated throughout the trip. Highly recommend!',
                }
            }),
            prisma.review.create({
                data: {
                    reviewerId: petOwner2.id,
                    pilotId: pilot2.id,
                    rating: 5,
                    comment: 'Emma is amazing with animals. She was gentle with Max and very professional. Will definitely book again!',
                }
            }),
        ]);
        // Create Favorites
        console.log('💝 Creating favorites...');
        await Promise.all([
            prisma.favorite.create({
                data: {
                    userId: petOwner1.id,
                    pilotId: pilot1.id,
                }
            }),
            prisma.favorite.create({
                data: {
                    userId: petOwner1.id,
                    pilotId: pilot2.id,
                }
            }),
        ]);
        // Create Booking Messages
        console.log('💬 Creating booking messages...');
        await Promise.all([
            prisma.bookingMessage.create({
                data: {
                    bookingId: booking2.id,
                    message: 'Hi! I\'m on my way to pick up Whiskers. ETA 10 minutes.',
                    isFromPilot: true,
                }
            }),
            prisma.bookingMessage.create({
                data: {
                    bookingId: booking2.id,
                    message: 'Great! Whiskers is ready and waiting by the door.',
                    isFromPilot: false,
                }
            }),
        ]);
        // Create Booking Tracking (for the active booking)
        console.log('📍 Creating booking tracking...');
        await prisma.bookingTracking.create({
            data: {
                bookingId: booking2.id,
                latitude: 40.7200,
                longitude: -74.0000,
            }
        });
        console.log('✅ Database seeded successfully!');
        console.log('\n🎯 Sample accounts created:');
        console.log('Pet Owners:');
        console.log('  📧 john.doe@example.com / password123');
        console.log('  📧 sarah.smith@example.com / password123');
        console.log('\nPet Pilots:');
        console.log('  📧 mike.johnson@example.com / password123');
        console.log('  📧 emma.wilson@example.com / password123');
        console.log('\n📊 Data Summary:');
        console.log(`  👥 Users: ${await prisma.user.count()}`);
        console.log(`  🐕 Pets: ${await prisma.pet.count()}`);
        console.log(`  🚗 Pilot Profiles: ${await prisma.pilotProfile.count()}`);
        console.log(`  🛠️ Services: ${await prisma.service.count()}`);
        console.log(`  📋 Bookings: ${await prisma.booking.count()}`);
        console.log(`  ⭐ Reviews: ${await prisma.review.count()}`);
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
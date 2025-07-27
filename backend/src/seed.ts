import { PrismaClient, UserType, PetSize, BookingStatus, PaymentStatus, NotificationType, AppointmentStatus } from '@prisma/client';
import { hashPassword } from './utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  try {
    // Clean existing data
    console.log('🧹 Cleaning existing data...');
    await prisma.weatherData.deleteMany();
    await prisma.vetAppointment.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.socialAccount.deleteMany();
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
        password: await hashPassword('password123'),
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        userType: UserType.PET_OWNER,
        isVerified: true,
        dateOfBirth: new Date('1990-05-15'),
        address: '123 Main St, New York, NY 10001',
        emergencyContact: 'Jane Doe - Wife - +1-555-0103',
        preferences: {
          notifications: true,
          emailUpdates: true,
          preferredCommunication: 'text'
        }
      }
    });

    const petOwner2 = await prisma.user.create({
      data: {
        email: 'sarah.smith@example.com',
        password: await hashPassword('password123'),
        firstName: 'Sarah',
        lastName: 'Smith',
        phone: '+1-555-0102',
        userType: UserType.PET_OWNER,
        isVerified: true,
        dateOfBirth: new Date('1985-08-22'),
        address: '789 Elm St, Brooklyn, NY 11201',
        emergencyContact: 'Mark Smith - Husband - +1-555-0104',
        preferences: {
          notifications: true,
          emailUpdates: false,
          preferredCommunication: 'email'
        }
      }
    });

    // Create Pet Pilots
    console.log('🚗 Creating pet pilots...');
    const pilot1 = await prisma.user.create({
      data: {
        email: 'mike.johnson@example.com',
        password: await hashPassword('password123'),
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1-555-0201',
        userType: UserType.PET_PILOT,
        isVerified: true,
        dateOfBirth: new Date('1988-12-10'),
        address: '456 Oak Ave, New York, NY 10002',
      }
    });

    const pilot2 = await prisma.user.create({
      data: {
        email: 'emma.wilson@example.com',
        password: await hashPassword('password123'),
        firstName: 'Emma',
        lastName: 'Wilson',
        phone: '+1-555-0202',
        userType: UserType.PET_PILOT,
        isVerified: true,
        dateOfBirth: new Date('1992-03-28'),
        address: '321 Court St, Brooklyn, NY 11201',
      }
    });

    // Create Social Accounts
    console.log('🔗 Creating social accounts...');
    await Promise.all([
      prisma.socialAccount.create({
        data: {
          userId: petOwner1.id,
          provider: 'google',
          providerId: 'google_123456789',
          email: 'john.doe@gmail.com',
          name: 'John Doe',
        }
      }),
      prisma.socialAccount.create({
        data: {
          userId: petOwner2.id,
          provider: 'facebook',
          providerId: 'facebook_987654321',
          email: 'sarah.smith@facebook.com',
          name: 'Sarah Smith',
        }
      }),
    ]);

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

    // Create Pilot Services
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

    // Create Pets with enhanced medical information
    console.log('🐕 Creating pets...');
    const pet1 = await prisma.pet.create({
      data: {
        name: 'Buddy',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 4,
        weight: 30.5,
        size: PetSize.LARGE,
        color: 'Golden',
        description: 'Friendly and energetic dog who loves car rides!',
        ownerId: petOwner1.id,
        microchipId: 'MC123456789',
        vaccinations: {
          rabies: { date: '2023-06-15', nextDue: '2024-06-15', clinic: 'Happy Paws Vet' },
          dhpp: { date: '2023-06-15', nextDue: '2024-06-15', clinic: 'Happy Paws Vet' }
        },
        allergies: ['Chicken', 'Pollen'],
        medications: ['Heartworm preventative'],
        vetContact: 'Dr. Sarah Johnson - Happy Paws Vet - +1-555-VET1',
        emergencyVet: 'Emergency Animal Hospital - +1-555-EMRG',
        medicalNotes: 'Prone to hip dysplasia, monitor joint health',
        lastVetVisit: new Date('2024-01-15'),
        nextVetVisit: new Date('2024-07-15'),
      }
    });

    const pet2 = await prisma.pet.create({
      data: {
        name: 'Whiskers',
        species: 'Cat',
        breed: 'Persian',
        age: 2,
        weight: 4.2,
        size: PetSize.SMALL,
        color: 'White and Gray',
        description: 'Calm and gentle cat who prefers quiet environments.',
        ownerId: petOwner1.id,
        microchipId: 'MC987654321',
        vaccinations: {
          fvrcp: { date: '2023-08-10', nextDue: '2024-08-10', clinic: 'Cat Care Clinic' },
          rabies: { date: '2023-08-10', nextDue: '2026-08-10', clinic: 'Cat Care Clinic' }
        },
        allergies: ['Dust'],
        medications: [],
        vetContact: 'Dr. Emily Chen - Cat Care Clinic - +1-555-CAT1',
        emergencyVet: 'Emergency Animal Hospital - +1-555-EMRG',
        medicalNotes: 'Sensitive to stress, requires gentle handling',
        lastVetVisit: new Date('2024-01-20'),
        nextVetVisit: new Date('2024-08-20'),
      }
    });

    const pet3 = await prisma.pet.create({
      data: {
        name: 'Max',
        species: 'Dog',
        breed: 'German Shepherd',
        age: 6,
        weight: 35.0,
        size: PetSize.LARGE,
        color: 'Black and Tan',
        description: 'Well-trained police dog, very obedient.',
        ownerId: petOwner2.id,
        microchipId: 'MC456789123',
        vaccinations: {
          rabies: { date: '2023-09-01', nextDue: '2024-09-01', clinic: 'Brooklyn Animal Hospital' },
          dhpp: { date: '2023-09-01', nextDue: '2024-09-01', clinic: 'Brooklyn Animal Hospital' }
        },
        allergies: [],
        medications: ['Joint supplement'],
        vetContact: 'Dr. Michael Torres - Brooklyn Animal Hospital - +1-555-BRK1',
        emergencyVet: 'Brooklyn Emergency Vet - +1-555-BRKEMRG',
        medicalNotes: 'Former working dog, excellent health record',
        lastVetVisit: new Date('2024-01-10'),
        nextVetVisit: new Date('2024-09-10'),
      }
    });

    // Create Medical Records
    console.log('🏥 Creating medical records...');
    await Promise.all([
      prisma.medicalRecord.create({
        data: {
          petId: pet1.id,
          title: 'Annual Checkup',
          description: 'Routine annual health examination',
          diagnosis: 'Healthy, mild hip dysplasia',
          treatment: 'Continue joint supplements, monitor activity',
          medications: ['Glucosamine supplement'],
          cost: 150.00,
          vetName: 'Dr. Sarah Johnson',
          vetClinic: 'Happy Paws Veterinary Clinic',
          visitDate: new Date('2024-01-15'),
          nextVisit: new Date('2024-07-15'),
          documents: []
        }
      }),
      prisma.medicalRecord.create({
        data: {
          petId: pet2.id,
          title: 'Vaccination Update',
          description: 'Annual vaccinations and health check',
          diagnosis: 'Healthy',
          treatment: 'Vaccinations administered',
          medications: [],
          cost: 120.00,
          vetName: 'Dr. Emily Chen',
          vetClinic: 'Cat Care Clinic',
          visitDate: new Date('2024-01-20'),
          nextVisit: new Date('2024-08-20'),
          documents: []
        }
      }),
      prisma.medicalRecord.create({
        data: {
          petId: pet3.id,
          title: 'Joint Assessment',
          description: 'Regular joint health monitoring for working dog',
          diagnosis: 'Good joint health, minor arthritis',
          treatment: 'Continue joint supplements, moderate exercise',
          medications: ['Joint supplement', 'Anti-inflammatory as needed'],
          cost: 200.00,
          vetName: 'Dr. Michael Torres',
          vetClinic: 'Brooklyn Animal Hospital',
          visitDate: new Date('2024-01-10'),
          nextVisit: new Date('2024-07-10'),
          documents: []
        }
      }),
    ]);

    // Create Vet Appointments
    console.log('📅 Creating vet appointments...');
    await Promise.all([
      prisma.vetAppointment.create({
        data: {
          petId: pet1.id,
          title: 'Annual Checkup',
          description: 'Yearly health examination and vaccinations',
          appointmentDate: new Date('2024-07-15T10:00:00Z'),
          duration: 60,
          status: AppointmentStatus.SCHEDULED,
          vetName: 'Dr. Sarah Johnson',
          vetClinic: 'Happy Paws Veterinary Clinic',
          vetPhone: '+1-555-VET1',
          address: '456 Oak Ave, New York, NY 10002',
          notes: 'Bring vaccination records',
          reminder: true
        }
      }),
      prisma.vetAppointment.create({
        data: {
          petId: pet2.id,
          title: 'Dental Cleaning',
          description: 'Professional dental cleaning and examination',
          appointmentDate: new Date('2024-03-15T14:00:00Z'),
          duration: 90,
          status: AppointmentStatus.SCHEDULED,
          vetName: 'Dr. Emily Chen',
          vetClinic: 'Cat Care Clinic',
          vetPhone: '+1-555-CAT1',
          address: '789 Pine St, New York, NY 10003',
          notes: 'Fasting required 12 hours before appointment',
          reminder: true
        }
      }),
    ]);

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
        status: BookingStatus.COMPLETED,
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
        status: BookingStatus.EN_ROUTE_TO_PICKUP,
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
        status: BookingStatus.PENDING,
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

    // Create Payments
    console.log('💳 Creating payments...');
    await Promise.all([
      prisma.payment.create({
        data: {
          userId: petOwner1.id,
          bookingId: booking1.id,
          amount: 35.00,
          currency: 'USD',
          status: PaymentStatus.COMPLETED,
          paymentMethod: 'card',
          paymentIntent: 'pi_1234567890_completed',
          processedAt: new Date('2024-02-01T14:30:00Z'),
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
      prisma.review.create({
        data: {
          reviewerId: petOwner1.id,
          pilotId: pilot2.id,
          rating: 4,
          comment: 'Emma did a great job with Whiskers. The service was professional and my cat seemed comfortable.',
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
          timestamp: new Date('2024-02-15T10:20:00Z'),
        }
      }),
      prisma.bookingMessage.create({
        data: {
          bookingId: booking2.id,
          message: 'Great! Whiskers is ready and waiting by the door.',
          isFromPilot: false,
          timestamp: new Date('2024-02-15T10:22:00Z'),
        }
      }),
      prisma.bookingMessage.create({
        data: {
          bookingId: booking2.id,
          message: 'Perfect! I\'m pulling up now. Blue van with PET-002 license plate.',
          isFromPilot: true,
          timestamp: new Date('2024-02-15T10:28:00Z'),
        }
      }),
    ]);

    // Create Booking Tracking
    console.log('📍 Creating booking tracking...');
    await prisma.bookingTracking.create({
      data: {
        bookingId: booking2.id,
        latitude: 40.7200,
        longitude: -74.0000,
        timestamp: new Date('2024-02-15T10:25:00Z'),
      }
    });

    // Create Notifications
    console.log('🔔 Creating notifications...');
    await Promise.all([
      prisma.notification.create({
        data: {
          userId: petOwner1.id,
          title: 'Booking Confirmed',
          message: 'Your pet transport booking has been confirmed for tomorrow',
          type: NotificationType.BOOKING_UPDATE,
          data: { bookingId: booking2.id },
          isRead: false,
        }
      }),
      prisma.notification.create({
        data: {
          userId: petOwner1.id,
          title: 'Payment Successful',
          message: 'Payment of $35.00 was processed successfully',
          type: NotificationType.PAYMENT_RECEIVED,
          data: { amount: 35.00, bookingId: booking1.id },
          isRead: true,
        }
      }),
      prisma.notification.create({
        data: {
          userId: pilot1.id,
          title: 'New Review',
          message: 'You received a 5-star review from John',
          type: NotificationType.REVIEW_RECEIVED,
          data: { rating: 5, reviewerId: petOwner1.id },
          isRead: false,
        }
      }),
      prisma.notification.create({
        data: {
          userId: petOwner1.id,
          title: 'Pilot Arrived',
          message: 'Emma has arrived for pickup',
          type: NotificationType.PILOT_ARRIVED,
          data: { bookingId: booking2.id, pilotId: pilot2.id },
          isRead: false,
        }
      }),
    ]);

    // Create Activity Logs
    console.log('📊 Creating activity logs...');
    await Promise.all([
      prisma.activityLog.create({
        data: {
          userId: petOwner1.id,
          action: 'booking_created',
          details: { bookingId: booking1.id, petName: 'Buddy' },
          timestamp: new Date('2024-02-01T13:45:00Z'),
        }
      }),
      prisma.activityLog.create({
        data: {
          userId: petOwner1.id,
          action: 'payment_completed',
          details: { paymentId: 'pay_1234567890', amount: 35.00, bookingId: booking1.id },
          timestamp: new Date('2024-02-01T14:30:00Z'),
        }
      }),
      prisma.activityLog.create({
        data: {
          userId: petOwner1.id,
          action: 'review_created',
          details: { reviewId: 'rev_1234567890', pilotId: pilot1.id, rating: 5 },
          timestamp: new Date('2024-02-01T15:00:00Z'),
        }
      }),
      prisma.activityLog.create({
        data: {
          userId: petOwner1.id,
          action: 'pet_created',
          details: { petId: pet1.id, petName: 'Buddy' },
          timestamp: new Date('2024-01-15T09:00:00Z'),
        }
      }),
      prisma.activityLog.create({
        data: {
          userId: petOwner1.id,
          action: 'medical_record_created',
          details: { medicalRecordId: 'med_1234567890', petId: pet1.id, title: 'Annual Checkup' },
          timestamp: new Date('2024-01-15T11:00:00Z'),
        }
      }),
    ]);

    // Create Weather Data
    console.log('🌤️ Creating weather data...');
    await Promise.all([
      prisma.weatherData.create({
        data: {
          location: 'New York, NY',
          temperature: 22.5,
          humidity: 65.0,
          description: 'Partly Cloudy',
          icon: '02d',
          windSpeed: 12.0,
          uvIndex: 6.0,
        }
      }),
      prisma.weatherData.create({
        data: {
          location: 'Brooklyn, NY',
          temperature: 21.0,
          humidity: 70.0,
          description: 'Sunny',
          icon: '01d',
          windSpeed: 8.0,
          uvIndex: 7.0,
        }
      }),
    ]);

    console.log('✅ Comprehensive database seed completed successfully!');
    console.log('\n🎯 Sample accounts created:');
    console.log('Pet Owners:');
    console.log('  📧 john.doe@example.com / password123');
    console.log('  📧 sarah.smith@example.com / password123');
    console.log('\nPet Pilots:');
    console.log('  📧 mike.johnson@example.com / password123');
    console.log('  📧 emma.wilson@example.com / password123');
    console.log('\n📊 Complete Data Summary:');
    console.log(`  👥 Users: ${await prisma.user.count()}`);
    console.log(`  🐕 Pets: ${await prisma.pet.count()}`);
    console.log(`  🚗 Pilot Profiles: ${await prisma.pilotProfile.count()}`);
    console.log(`  🛠️ Services: ${await prisma.service.count()}`);
    console.log(`  📋 Bookings: ${await prisma.booking.count()}`);
    console.log(`  ⭐ Reviews: ${await prisma.review.count()}`);
    console.log(`  💳 Payments: ${await prisma.payment.count()}`);
    console.log(`  🏥 Medical Records: ${await prisma.medicalRecord.count()}`);
    console.log(`  📅 Vet Appointments: ${await prisma.vetAppointment.count()}`);
    console.log(`  🔔 Notifications: ${await prisma.notification.count()}`);
    console.log(`  📊 Activity Logs: ${await prisma.activityLog.count()}`);
    console.log(`  🔗 Social Accounts: ${await prisma.socialAccount.count()}`);
    console.log(`  🌤️ Weather Data: ${await prisma.weatherData.count()}`);

  } catch (error) {
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
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  ScreenHeader,
  GlassCard,
  GlassButton,
  LoadingSpinner,
  MessagingModal,
} from '../components';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface Pilot {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distance: number;
  vehicleType: string;
  licensePlate: string;
  isAvailable: boolean;
  specialties: string[];
  pricePerMile: number;
  photo?: string;
  bio?: string;
  responseTime: string;
  completedTrips: number;
  yearsExperience: number;
  phone?: string;
  email?: string;
  certifications: string[];
  vehicleCapacity: number;
  vehicleFeatures: string[];
  availability: {
    days: string[];
    hours: string;
  };
  serviceAreas: string[];
  emergencyServices: boolean;
  petSizes: string[];
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  petType: string;
}

type PilotDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'PilotDetails'>;

export default function PilotDetailsScreen({ route, navigation }: PilotDetailsScreenProps) {
  const { pilotId } = route.params;
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'vehicle'>('overview');
  const [showMessaging, setShowMessaging] = useState(false);

  useEffect(() => {
    loadPilotDetails();
    loadReviews();
  }, [pilotId]);

  const loadPilotDetails = async () => {
    try {
      console.log('Loading pilot details for:', pilotId);
      // Mock pilot data - in real implementation, fetch from API
      const mockPilots: { [key: string]: Pilot } = {
        '1': {
          id: pilotId,
          name: 'Sarah Johnson',
          rating: 4.9,
          reviewCount: 127,
          distance: 2.3,
          vehicleType: '2022 Honda CR-V',
          licensePlate: 'PET-001',
          isAvailable: true,
          specialties: ['Cats', 'Small Dogs', 'Senior Pets'],
          pricePerMile: 2.50,
          photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b193?w=400&h=400&fit=crop&crop=face',
          bio: 'Experienced pet transport specialist with over 3 years of caring for animals during transport. I have a genuine love for animals and understand the importance of keeping them comfortable and safe during their journey.',
          responseTime: '< 5 min',
          completedTrips: 245,
          yearsExperience: 3,
          phone: '+1 (555) 123-4567',
          email: 'sarah.johnson@petpilot.com',
          certifications: ['Pet First Aid Certified', 'Professional Animal Handler', 'Safe Transport Certified'],
          vehicleCapacity: 4,
          vehicleFeatures: ['Climate Control', 'Safety Barriers', 'Non-slip Flooring', 'Emergency Kit'],
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            hours: '7:00 AM - 7:00 PM',
          },
          serviceAreas: ['Downtown', 'Westside', 'Northside'],
          emergencyServices: true,
          petSizes: ['Small', 'Medium'],
        },
        '2': {
          id: pilotId,
          name: 'Mike Thompson',
          rating: 4.7,
          reviewCount: 89,
          distance: 1.8,
          vehicleType: '2021 Toyota Sienna',
          licensePlate: 'PET-002',
          isAvailable: true,
          specialties: ['Large Dogs', 'Multiple Pets', 'Emergency Transport'],
          pricePerMile: 2.75,
          photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          bio: 'Former veterinary assistant specializing in safe transport of larger pets and emergency situations. My background in veterinary care gives me unique insights into pet health and safety during transport.',
          responseTime: '< 3 min',
          completedTrips: 189,
          yearsExperience: 5,
          phone: '+1 (555) 234-5678',
          email: 'mike.thompson@petpilot.com',
          certifications: ['Veterinary Assistant Certified', 'Emergency Animal Care', 'Large Animal Handling'],
          vehicleCapacity: 6,
          vehicleFeatures: ['Spacious Interior', 'Multiple Compartments', 'Medical Equipment', 'Backup Power'],
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
            hours: '6:00 AM - 8:00 PM',
          },
          serviceAreas: ['Downtown', 'Eastside', 'Southside'],
          emergencyServices: true,
          petSizes: ['Medium', 'Large', 'Extra Large'],
        },
        '3': {
          id: pilotId,
          name: 'Emily Chen',
          rating: 5.0,
          reviewCount: 203,
          distance: 4.1,
          vehicleType: '2023 Subaru Outback',
          licensePlate: 'PET-003',
          isAvailable: false,
          specialties: ['Exotic Pets', 'Medical Transport', 'Long Distance'],
          pricePerMile: 3.00,
          photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
          bio: 'Certified animal handler with expertise in exotic pet care and medical transport protocols. I specialize in working with unique animals and providing medical-grade transport services.',
          responseTime: '< 8 min',
          completedTrips: 312,
          yearsExperience: 7,
          phone: '+1 (555) 345-6789',
          email: 'emily.chen@petpilot.com',
          certifications: ['Exotic Animal Handler Certified', 'Medical Transport Specialist', 'Advanced Pet First Aid'],
          vehicleCapacity: 3,
          vehicleFeatures: ['Medical Equipment', 'Temperature Control', 'Specialized Containment', 'Emergency Kit'],
          availability: {
            days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            hours: '8:00 AM - 6:00 PM',
          },
          serviceAreas: ['Downtown', 'Midtown', 'Uptown'],
          emergencyServices: true,
          petSizes: ['Small', 'Medium', 'Large'],
        },
        '4': {
          id: pilotId,
          name: 'David Rodriguez',
          rating: 4.8,
          reviewCount: 156,
          distance: 3.2,
          vehicleType: '2020 Ford Transit',
          licensePlate: 'PET-004',
          isAvailable: true,
          specialties: ['Group Transport', 'Multiple Pets', 'Pet Events'],
          pricePerMile: 2.25,
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          bio: 'Spacious vehicle perfect for transporting multiple pets or larger groups to events and gatherings. I love working with families who have multiple pets.',
          responseTime: '< 10 min',
          completedTrips: 178,
          yearsExperience: 4,
          phone: '+1 (555) 456-7890',
          email: 'david.rodriguez@petpilot.com',
          certifications: ['Group Transport Certified', 'Pet Event Specialist', 'Multi-Pet Handler'],
          vehicleCapacity: 8,
          vehicleFeatures: ['Large Interior', 'Multiple Compartments', 'Easy Access', 'Safety Barriers'],
          availability: {
            days: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'],
            hours: '9:00 AM - 8:00 PM',
          },
          serviceAreas: ['Downtown', 'Westside', 'Eastside'],
          emergencyServices: false,
          petSizes: ['Small', 'Medium', 'Large', 'Extra Large'],
        },
        '5': {
          id: pilotId,
          name: 'Lisa Williams',
          rating: 4.6,
          reviewCount: 94,
          distance: 5.7,
          vehicleType: '2022 Mercedes Sprinter',
          licensePlate: 'PET-005',
          isAvailable: true,
          specialties: ['Luxury Transport', 'Show Dogs', 'Premium Service'],
          pricePerMile: 4.50,
          photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
          bio: 'Premium pet transport service for show animals and clients seeking luxury transportation. I provide white-glove service for your most precious companions.',
          responseTime: '< 15 min',
          completedTrips: 134,
          yearsExperience: 6,
          phone: '+1 (555) 567-8901',
          email: 'lisa.williams@petpilot.com',
          certifications: ['Luxury Service Certified', 'Show Animal Handler', 'Premium Care Specialist'],
          vehicleCapacity: 4,
          vehicleFeatures: ['Luxury Interior', 'Climate Control', 'Premium Sound System', 'Comfort Seating'],
          availability: {
            days: ['Tuesday', 'Thursday', 'Friday', 'Saturday'],
            hours: '10:00 AM - 6:00 PM',
          },
          serviceAreas: ['Uptown', 'Premium Districts', 'Show Venues'],
          emergencyServices: false,
          petSizes: ['Small', 'Medium', 'Large'],
        },
      };

      const mockPilot = mockPilots[pilotId] || {
        id: pilotId,
        name: 'Unknown Pilot',
        rating: 4.5,
        reviewCount: 0,
        distance: 5.0,
        vehicleType: 'Standard Vehicle',
        licensePlate: 'UNKNOWN',
        isAvailable: false,
        specialties: ['General Transport'],
        pricePerMile: 2.00,
        bio: 'Professional pet transport pilot.',
        responseTime: '< 10 min',
        completedTrips: 0,
        yearsExperience: 1,
        certifications: [],
        vehicleCapacity: 2,
        vehicleFeatures: [],
        availability: {
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          hours: '9:00 AM - 5:00 PM',
        },
        serviceAreas: ['Local Area'],
        emergencyServices: false,
        petSizes: ['Small', 'Medium'],
      };

      setPilot(mockPilot);
    } catch (error) {
      console.error('Error loading pilot details:', error);
      Alert.alert('Error', 'Failed to load pilot details.');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      // Mock reviews data
      const mockReviews: Review[] = [
        {
          id: '1',
          customerName: 'Jennifer L.',
          rating: 5,
          comment: 'Sarah was amazing with my elderly cat Luna. She was so gentle and kept me updated throughout the trip. Highly recommended!',
          date: '2024-02-15',
          petType: 'Cat',
        },
        {
          id: '2',
          customerName: 'David M.',
          rating: 5,
          comment: 'Professional service and great communication. My dog Max was comfortable the entire time.',
          date: '2024-02-10',
          petType: 'Dog',
        },
        {
          id: '3',
          customerName: 'Lisa K.',
          rating: 4,
          comment: 'Good service, arrived on time and handled my pet with care. Would use again.',
          date: '2024-02-08',
          petType: 'Dog',
        },
        {
          id: '4',
          customerName: 'Robert T.',
          rating: 5,
          comment: 'Emergency transport service was exceptional. Sarah responded quickly and got my pet to the vet safely.',
          date: '2024-02-05',
          petType: 'Cat',
        },
      ];

      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleCall = () => {
    if (pilot?.phone) {
      const phoneUrl = `tel:${pilot.phone}`;
      Linking.openURL(phoneUrl).catch(() => {
        Alert.alert('Error', 'Unable to make phone call');
      });
    } else {
      Alert.alert('Contact Info', 'Phone number not available');
    }
  };

  const handleMessage = () => {
    setShowMessaging(true);
  };

  const handleBook = () => {
    Alert.alert(
      'Book Transport',
      `Would you like to book ${pilot?.name} for pet transport? Rate: $${pilot?.pricePerMile}/mile`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            navigation.navigate('Home');
            Alert.alert('Booking Started', `Booking process initiated with ${pilot?.name}.`);
          }
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color={Colors.warning} />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color={Colors.warning} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color={Colors.textSecondary} />
      );
    }

    return stars;
  };

  const renderReview = (review: Review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.customerName}</Text>
          <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
        </View>
        <View style={styles.reviewRating}>
          {renderStars(review.rating)}
          <Text style={styles.petTypeText}>• {review.petType}</Text>
        </View>
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* About Section */}
      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>About {pilot?.name}</Text>
        <Text style={styles.bioText}>{pilot?.bio}</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>{pilot?.yearsExperience} years</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statValue}>{pilot?.completedTrips} trips</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={20} color={Colors.info} />
            <Text style={styles.statLabel}>Response</Text>
            <Text style={styles.statValue}>{pilot?.responseTime}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location" size={20} color={Colors.warning} />
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{pilot?.distance} mi</Text>
          </View>
        </View>
      </GlassCard>

      {/* Specialties */}
      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Specialties</Text>
        <View style={styles.specialtiesGrid}>
          {pilot?.specialties.map((specialty, index) => (
            <View key={index} style={styles.specialtyTag}>
              <Text style={styles.specialtyText}>{specialty}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Certifications */}
      {pilot?.certifications && pilot.certifications.length > 0 && (
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          {pilot.certifications.map((cert, index) => (
            <View key={index} style={styles.certificationItem}>
              <Ionicons name="ribbon" size={16} color={Colors.primary} />
              <Text style={styles.certificationText}>{cert}</Text>
            </View>
          ))}
        </GlassCard>
      )}

      {/* Availability */}
      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.availabilityInfo}>
          <View style={styles.availabilityItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.availabilityText}>
              {pilot?.availability.days.join(', ')}
            </Text>
          </View>
          <View style={styles.availabilityItem}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.availabilityText}>{pilot?.availability.hours}</Text>
          </View>
        </View>
      </GlassCard>

      {/* Service Areas */}
      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Service Areas</Text>
        <View style={styles.serviceAreas}>
          {pilot?.serviceAreas.map((area, index) => (
            <View key={index} style={styles.areaTag}>
              <Ionicons name="location-outline" size={14} color={Colors.primary} />
              <Text style={styles.areaText}>{area}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <GlassCard style={styles.section}>
        <View style={styles.reviewsSummary}>
          <View style={styles.ratingOverview}>
            <Text style={styles.overallRating}>{pilot?.rating}</Text>
            <View style={styles.starsContainer}>
              {pilot && renderStars(pilot.rating)}
            </View>
            <Text style={styles.reviewCount}>
              Based on {pilot?.reviewCount} reviews
            </Text>
          </View>
        </View>
      </GlassCard>

      {reviews.map(renderReview)}
    </View>
  );

  const renderVehicleTab = () => (
    <View style={styles.tabContent}>
      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleHeader}>
            <Ionicons name="car" size={24} color={Colors.primary} />
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleModel}>{pilot?.vehicleType}</Text>
              <Text style={styles.licensePlate}>License: {pilot?.licensePlate}</Text>
            </View>
          </View>
          
          <View style={styles.vehicleSpecs}>
            <View style={styles.specItem}>
              <Ionicons name="people" size={16} color={Colors.textSecondary} />
              <Text style={styles.specText}>Capacity: {pilot?.vehicleCapacity} pets</Text>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Vehicle Features */}
      {pilot?.vehicleFeatures && pilot.vehicleFeatures.length > 0 && (
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Features</Text>
          <View style={styles.featuresGrid}>
            {pilot.vehicleFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      )}

      {/* Pet Sizes */}
      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Supported Pet Sizes</Text>
        <View style={styles.petSizes}>
          {pilot?.petSizes.map((size, index) => (
            <View key={index} style={styles.sizeTag}>
              <Text style={styles.sizeText}>{size}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <LoadingSpinner />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!pilot) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <ScreenHeader
            title="Pilot Not Found"
            showBack
            onBack={() => navigation.goBack()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Pilot not found</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScreenHeader
          title={pilot.name}
          subtitle={`${pilot.vehicleType} • ${pilot.distance} mi away`}
          showBack
          onBack={() => navigation.goBack()}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Pilot Header */}
            <GlassCard style={styles.pilotHeader}>
              <View style={styles.pilotInfo}>
                <View style={styles.pilotAvatar}>
                  {pilot.photo ? (
                    <Image source={{ uri: pilot.photo }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person" size={32} color={Colors.primary} />
                  )}
                </View>
                
                <View style={styles.pilotDetails}>
                  <Text style={styles.pilotName}>{pilot.name}</Text>
                  <View style={styles.ratingContainer}>
                    {renderStars(pilot.rating)}
                    <Text style={styles.ratingText}>{pilot.rating}</Text>
                    <Text style={styles.reviewsText}>({pilot.reviewCount} reviews)</Text>
                  </View>
                  <Text style={styles.priceText}>${pilot.pricePerMile}/mile</Text>
                  
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: pilot.isAvailable ? Colors.success + '20' : Colors.error + '20' 
                    }]}>
                      <Ionicons 
                        name={pilot.isAvailable ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color={pilot.isAvailable ? Colors.success : Colors.error} 
                      />
                      <Text style={[styles.statusText, { 
                        color: pilot.isAvailable ? Colors.success : Colors.error 
                      }]}>
                        {pilot.isAvailable ? 'Available' : 'Busy'}
                      </Text>
                    </View>
                    
                    {pilot.emergencyServices && (
                      <View style={styles.emergencyBadge}>
                        <Ionicons name="medical" size={14} color={Colors.error} />
                        <Text style={styles.emergencyText}>Emergency</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </GlassCard>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <GlassButton
                title="Call"
                onPress={handleCall}
                variant="outline"
                style={styles.actionButton}
                disabled={!pilot.isAvailable}
              />
              <GlassButton
                title="Message"
                onPress={handleMessage}
                variant="outline"
                style={styles.actionButton}
                disabled={!pilot.isAvailable}
              />
              <GlassButton
                title="Book Now"
                onPress={handleBook}
                style={styles.bookButton}
                disabled={!pilot.isAvailable}
              />
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                onPress={() => setActiveTab('overview')}
              >
                <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
                onPress={() => setActiveTab('reviews')}
              >
                <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                  Reviews
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'vehicle' && styles.activeTab]}
                onPress={() => setActiveTab('vehicle')}
              >
                <Text style={[styles.tabText, activeTab === 'vehicle' && styles.activeTabText]}>
                  Vehicle
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'reviews' && renderReviewsTab()}
            {activeTab === 'vehicle' && renderVehicleTab()}
          </View>
        </ScrollView>

        {pilot && (
          <MessagingModal
            visible={showMessaging}
            onClose={() => setShowMessaging(false)}
            pilotName={pilot.name}
            bookingId="new-booking"
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  gradient: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },

  pilotHeader: {
    marginBottom: Layout.spacing.lg,
  },

  pilotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pilotAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.lg,
    borderWidth: 3,
    borderColor: Colors.primary,
  },

  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },

  pilotDetails: {
    flex: 1,
  },

  pilotName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  ratingText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    marginLeft: 6,
    fontWeight: Fonts.semibold,
  },

  reviewsText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  priceText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.primary,
    marginBottom: 8,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },

  statusText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.semibold,
    marginLeft: 4,
  },

  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.error + '20',
  },

  emergencyText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.semibold,
    color: Colors.error,
    marginLeft: 4,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },

  actionButton: {
    flex: 1,
  },

  bookButton: {
    flex: 2,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.lg,
    padding: 4,
    marginBottom: Layout.spacing.lg,
  },

  tab: {
    flex: 1,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    alignItems: 'center',
  },

  activeTab: {
    backgroundColor: Colors.primary,
  },

  tabText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    fontWeight: Fonts.mediumWeight,
  },

  activeTabText: {
    color: Colors.text,
    fontWeight: Fonts.semibold,
  },

  tabContent: {
    marginBottom: Layout.spacing.lg,
  },

  section: {
    marginBottom: Layout.spacing.lg,
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },

  bioText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Layout.spacing.lg,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.sm,
  },

  statLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
  },

  statValue: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginTop: 2,
  },

  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  specialtyTag: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },

  specialtyText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.primary,
    fontWeight: Fonts.mediumWeight,
  },

  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },

  certificationText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },

  availabilityInfo: {
    gap: Layout.spacing.sm,
  },

  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  availabilityText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },

  serviceAreas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  areaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  areaText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.text,
    marginLeft: 4,
  },

  reviewsSummary: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },

  ratingOverview: {
    alignItems: 'center',
  },

  overallRating: {
    fontFamily: Fonts.primary,
    fontSize: 48,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  starsContainer: {
    flexDirection: 'row',
    marginVertical: Layout.spacing.sm,
  },

  reviewCount: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },

  reviewCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },

  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },

  reviewerInfo: {
    flex: 1,
  },

  reviewerName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
  },

  reviewDate: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
  },

  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  petTypeText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  reviewComment: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    lineHeight: 20,
  },

  vehicleInfo: {
    marginBottom: Layout.spacing.lg,
  },

  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },

  vehicleDetails: {
    marginLeft: Layout.spacing.md,
  },

  vehicleModel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
  },

  licensePlate: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },

  vehicleSpecs: {
    gap: Layout.spacing.sm,
  },

  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  specText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },

  featuresGrid: {
    gap: Layout.spacing.sm,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  featureText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },

  petSizes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  sizeTag: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.radius.md,
    marginRight: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },

  sizeText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.success,
    fontWeight: Fonts.mediumWeight,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
  },

  errorText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
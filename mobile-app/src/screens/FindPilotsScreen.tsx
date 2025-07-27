import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenHeader,
  GlassCard,
  GlassButton,
  GlassInput,
  LoadingSpinner,
  EmptyState,
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
}

interface FindPilotsScreenProps {
  navigation: any;
}

export default function FindPilotsScreen({ navigation }: FindPilotsScreenProps) {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [filteredPilots, setFilteredPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [filterAvailable, setFilterAvailable] = useState(true);

  useEffect(() => {
    loadPilots();
  }, []);

  useEffect(() => {
    filterAndSortPilots();
  }, [pilots, searchQuery, sortBy, filterAvailable]);

  const loadPilots = async () => {
    try {
      // Mock pilot data - in real implementation, fetch from API
      const mockPilots: Pilot[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          rating: 4.9,
          reviewCount: 127,
          distance: 2.3,
          vehicleType: '2022 Honda CR-V',
          licensePlate: 'PET-001',
          isAvailable: true,
          specialties: ['Cats', 'Small Dogs', 'Senior Pets'],
          pricePerMile: 2.50,
          bio: 'Experienced pet transport specialist with over 3 years of caring for animals during transport.',
          responseTime: '< 5 min',
          completedTrips: 245,
        },
        {
          id: '2',
          name: 'Mike Thompson',
          rating: 4.7,
          reviewCount: 89,
          distance: 1.8,
          vehicleType: '2021 Toyota Sienna',
          licensePlate: 'PET-002',
          isAvailable: true,
          specialties: ['Large Dogs', 'Multiple Pets', 'Emergency Transport'],
          pricePerMile: 2.75,
          bio: 'Former veterinary assistant specializing in safe transport of larger pets and emergency situations.',
          responseTime: '< 3 min',
          completedTrips: 189,
        },
        {
          id: '3',
          name: 'Emily Chen',
          rating: 5.0,
          reviewCount: 203,
          distance: 4.1,
          vehicleType: '2023 Subaru Outback',
          licensePlate: 'PET-003',
          isAvailable: false,
          specialties: ['Exotic Pets', 'Medical Transport', 'Long Distance'],
          pricePerMile: 3.00,
          bio: 'Certified animal handler with expertise in exotic pet care and medical transport protocols.',
          responseTime: '< 8 min',
          completedTrips: 312,
        },
        {
          id: '4',
          name: 'David Rodriguez',
          rating: 4.8,
          reviewCount: 156,
          distance: 3.2,
          vehicleType: '2020 Ford Transit',
          licensePlate: 'PET-004',
          isAvailable: true,
          specialties: ['Group Transport', 'Multiple Pets', 'Pet Events'],
          pricePerMile: 2.25,
          bio: 'Spacious vehicle perfect for transporting multiple pets or larger groups to events and gatherings.',
          responseTime: '< 10 min',
          completedTrips: 178,
        },
        {
          id: '5',
          name: 'Lisa Williams',
          rating: 4.6,
          reviewCount: 94,
          distance: 5.7,
          vehicleType: '2022 Mercedes Sprinter',
          licensePlate: 'PET-005',
          isAvailable: true,
          specialties: ['Luxury Transport', 'Show Dogs', 'Premium Service'],
          pricePerMile: 4.50,
          bio: 'Premium pet transport service for show animals and clients seeking luxury transportation.',
          responseTime: '< 15 min',
          completedTrips: 134,
        },
      ];

      setPilots(mockPilots);
    } catch (error) {
      console.error('Error loading pilots:', error);
      Alert.alert('Error', 'Failed to load pilots');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPilots = () => {
    let filtered = [...pilots];

    // Filter by availability
    if (filterAvailable) {
      filtered = filtered.filter(pilot => pilot.isAvailable);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pilot => 
        pilot.name.toLowerCase().includes(query) ||
        pilot.specialties.some(specialty => specialty.toLowerCase().includes(query)) ||
        pilot.vehicleType.toLowerCase().includes(query)
      );
    }

    // Sort pilots
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'price':
          return a.pricePerMile - b.pricePerMile;
        default:
          return 0;
      }
    });

    setFilteredPilots(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPilots();
    setRefreshing(false);
  };

  const handleContactPilot = (pilot: Pilot) => {
    Alert.alert(
      `Contact ${pilot.name}`,
      'How would you like to contact this pilot?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Message', 
          onPress: () => Alert.alert('Message Sent', `Your message has been sent to ${pilot.name}. They will respond within ${pilot.responseTime}.`)
        },
        { 
          text: 'Call Now', 
          onPress: () => Alert.alert('Calling...', `Calling ${pilot.name}...`)
        },
      ]
    );
  };

  const handleBookPilot = (pilot: Pilot) => {
    Alert.alert(
      `Book ${pilot.name}`,
      `Would you like to book ${pilot.name} for pet transport? Rate: $${pilot.pricePerMile}/mile`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => {
            // Navigate to booking flow with selected pilot
            navigation.navigate('Bookings');
            Alert.alert('Booking Started', `Booking process initiated with ${pilot.name}. Please complete the booking details.`);
          }
        },
      ]
    );
  };

  const handleViewProfile = (pilot: Pilot) => {
    Alert.alert(
      pilot.name,
      `${pilot.bio}\n\nVehicle: ${pilot.vehicleType}\nCompleted Trips: ${pilot.completedTrips}\nResponse Time: ${pilot.responseTime}\nSpecialties: ${pilot.specialties.join(', ')}`,
      [
        { text: 'Close' },
        { text: 'Contact', onPress: () => handleContactPilot(pilot) },
        { text: 'Book', onPress: () => handleBookPilot(pilot) },
      ]
    );
  };

  const handleSortChange = () => {
    Alert.alert(
      'Sort Pilots',
      'Choose how to sort the pilot list:',
      [
        { text: 'By Distance', onPress: () => setSortBy('distance') },
        { text: 'By Rating', onPress: () => setSortBy('rating') },
        { text: 'By Price', onPress: () => setSortBy('price') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderPilot = (pilot: Pilot) => (
    <GlassCard key={pilot.id} style={styles.pilotCard}>
      <TouchableOpacity onPress={() => handleViewProfile(pilot)} activeOpacity={0.8}>
        <View style={styles.pilotHeader}>
          <View style={styles.pilotAvatar}>
            <Ionicons name="person" size={24} color={Colors.primary} />
          </View>
          <View style={styles.pilotInfo}>
            <Text style={styles.pilotName}>{pilot.name}</Text>
            <View style={styles.pilotRating}>
              <Ionicons name="star" size={16} color={Colors.warning} />
              <Text style={styles.ratingText}>{pilot.rating}</Text>
              <Text style={styles.reviewCount}>({pilot.reviewCount} reviews)</Text>
              {!pilot.isAvailable && (
                <View style={styles.unavailableBadge}>
                  <Text style={styles.unavailableText}>Busy</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.pilotDistance}>
            <Text style={styles.distanceText}>{pilot.distance} mi</Text>
            <Text style={styles.priceText}>${pilot.pricePerMile}/mi</Text>
          </View>
        </View>

        <View style={styles.pilotDetails}>
          <View style={styles.vehicleInfo}>
            <Ionicons name="car" size={16} color={Colors.textSecondary} />
            <Text style={styles.vehicleText}>{pilot.vehicleType}</Text>
            <Text style={styles.licensePlateText}>• {pilot.licensePlate}</Text>
          </View>
          
          <View style={styles.specialties}>
            {pilot.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
            {pilot.specialties.length > 3 && (
              <Text style={styles.moreSpecialties}>+{pilot.specialties.length - 3} more</Text>
            )}
          </View>

          <View style={styles.pilotStats}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
              <Text style={styles.statText}>{pilot.completedTrips} trips</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={14} color={Colors.info} />
              <Text style={styles.statText}>{pilot.responseTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.pilotActions}>
          <GlassButton
            title="Contact"
            onPress={() => handleContactPilot(pilot)}
            variant="outline"
            size="small"
            style={styles.contactButton}
            disabled={!pilot.isAvailable}
          />
          <GlassButton
            title="Book Now"
            onPress={() => handleBookPilot(pilot)}
            size="small"
            style={styles.bookButton}
            disabled={!pilot.isAvailable}
          />
        </View>
      </TouchableOpacity>
    </GlassCard>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScreenHeader
          title="Find Pilots"
          subtitle={`${filteredPilots.length} pilots near you`}
          showBack
          onBack={() => navigation.goBack()}
          rightAction={
            <TouchableOpacity onPress={handleSortChange} style={styles.sortButton}>
              <Ionicons name="filter" size={24} color={Colors.text} />
            </TouchableOpacity>
          }
        />

        <View style={styles.content}>
          <View style={styles.searchSection}>
            <GlassInput
              placeholder="Search by name, specialty, or vehicle..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              icon="search"
              style={styles.searchInput}
            />
            
            <View style={styles.filters}>
              <TouchableOpacity
                style={[styles.filterButton, filterAvailable && styles.activeFilterButton]}
                onPress={() => setFilterAvailable(!filterAvailable)}
              >
                <Ionicons
                  name={filterAvailable ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={16}
                  color={filterAvailable ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.filterText, filterAvailable && styles.activeFilterText]}>
                  Available Only
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.sortLabel}>
                Sorted by: {sortBy === 'distance' ? 'Distance' : sortBy === 'rating' ? 'Rating' : 'Price'}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
          >
            {filteredPilots.length > 0 ? (
              filteredPilots.map(renderPilot)
            ) : (
              <EmptyState
                icon="people-outline"
                title="No Pilots Found"
                subtitle={searchQuery ? "Try adjusting your search terms" : "No pilots available in your area right now"}
                buttonText="Refresh"
                onButtonPress={onRefresh}
              />
            )}
          </ScrollView>
        </View>
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

  content: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },

  searchSection: {
    marginBottom: Layout.spacing.lg,
  },

  searchInput: {
    marginBottom: Layout.spacing.md,
  },

  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  activeFilterButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },

  filterText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: Fonts.mediumWeight,
  },

  activeFilterText: {
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },

  sortLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Layout.spacing.xl,
  },

  pilotCard: {
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },

  pilotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },

  pilotAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  pilotInfo: {
    flex: 1,
  },

  pilotName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },

  pilotRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  ratingText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    marginLeft: 4,
    fontWeight: Fonts.semibold,
  },

  reviewCount: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  unavailableBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: Layout.spacing.sm,
  },

  unavailableText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.text,
    fontWeight: Fonts.bold,
  },

  pilotDistance: {
    alignItems: 'flex-end',
  },

  distanceText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    fontWeight: Fonts.semibold,
  },

  priceText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.primary,
    fontWeight: Fonts.bold,
  },

  pilotDetails: {
    marginBottom: Layout.spacing.lg,
  },

  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },

  vehicleText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 6,
  },

  licensePlateText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.sm,
  },

  specialtyTag: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },

  specialtyText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.primary,
    fontWeight: Fonts.mediumWeight,
  },

  moreSpecialties: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    alignSelf: 'center',
    fontStyle: 'italic',
  },

  pilotStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },

  statText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  pilotActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },

  contactButton: {
    flex: 1,
  },

  bookButton: {
    flex: 1,
  },
});
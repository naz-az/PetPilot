import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  ScreenHeader,
  ServiceCard,
  BookingCard,
  BookingFormModal,
  EmptyState,
  LoadingSpinner,
} from '../components';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';
import type { Service } from '../components/ServiceCard';
import type { Booking } from '../components/BookingCard';
import type { BookingFormData } from '../components/BookingFormModal';

interface Pet {
  id: string;
  name: string;
  species: string;
}

const MOCK_SERVICES: Service[] = [
  {
    id: '1',
    name: 'Pet Transport',
    description: 'Safe and comfortable transportation for your pet to any destination.',
    price: 25,
    duration: 30,
    icon: 'car-outline',
    category: 'Transport',
    available: true,
  },
  {
    id: '2',
    name: 'Vet Visit',
    description: 'Express transport to veterinary appointments with care.',
    price: 35,
    duration: 45,
    icon: 'medical-outline',
    category: 'Medical',
    available: true,
  },
  {
    id: '3',
    name: 'Grooming Service',
    description: 'Pick up and drop off service for pet grooming appointments.',
    price: 20,
    duration: 60,
    icon: 'cut-outline',
    category: 'Grooming',
    available: true,
  },
  {
    id: '4',
    name: 'Pet Daycare',
    description: 'Safe transport to and from your pet daycare facility.',
    price: 30,
    duration: 40,
    icon: 'home-outline',
    category: 'Daycare',
    available: false,
  },
  {
    id: '5',
    name: 'Emergency Transport',
    description: 'Priority emergency transportation for urgent situations.',
    price: 50,
    duration: 20,
    icon: 'flash-outline',
    category: 'Emergency',
    available: true,
  },
];

interface BookingsScreenProps {
  navigation: any;
}

export default function BookingsScreen({ navigation }: BookingsScreenProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'bookings'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading services and bookings data...');
      
      // Load services
      setServices(MOCK_SERVICES);
      
      // Load user's pets (mock data for now)
      const mockPets: Pet[] = [
        { id: '1', name: 'Buddy', species: 'Dog' },
        { id: '2', name: 'Whiskers', species: 'Cat' },
      ];
      setPets(mockPets);
      
      // Load user's bookings (mock data for now)
      const mockBookings: Booking[] = [
        {
          id: '1',
          serviceName: 'Vet Visit',
          petName: 'Buddy',
          date: '2024-01-15',
          time: '10:00 AM',
          status: 'confirmed',
          price: 35,
          pickupAddress: '123 Main St, City',
          dropoffAddress: 'Happy Paws Vet Clinic, 456 Oak Ave',
          notes: 'Annual checkup appointment',
        },
        {
          id: '2',
          serviceName: 'Pet Transport',
          petName: 'Whiskers',
          date: '2024-01-20',
          time: '2:30 PM',
          status: 'pending',
          price: 25,
          pickupAddress: '123 Main St, City',
          dropoffAddress: '789 Park Blvd, City',
        },
      ];
      setBookings(mockBookings);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleBookService = (service: Service) => {
    if (!service.available) {
      Alert.alert('Service Unavailable', 'This service is currently not available.');
      return;
    }
    
    if (pets.length === 0) {
      Alert.alert(
        'No Pets Found',
        'Please add a pet to your profile before booking a service.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedService(service);
    setBookingModalVisible(true);
  };

  const handleBookingSubmit = async (bookingData: BookingFormData) => {
    if (!selectedService) return;
    
    setBookingLoading(true);
    
    try {
      console.log('Submitting booking:', bookingData);
      
      // Create new booking
      const newBooking: Booking = {
        id: Date.now().toString(),
        serviceName: selectedService.name,
        petName: pets.find(p => p.id === bookingData.petId)?.name || 'Unknown Pet',
        date: bookingData.date,
        time: bookingData.time,
        status: 'pending',
        price: selectedService.price,
        pickupAddress: bookingData.pickupAddress,
        dropoffAddress: bookingData.dropoffAddress,
        notes: bookingData.notes,
      };
      
      // Add to bookings list
      setBookings(prev => [newBooking, ...prev]);
      
      // Close modal and switch to bookings tab
      setBookingModalVisible(false);
      setSelectedService(null);
      setActiveTab('bookings');
      
      Alert.alert(
        'Booking Confirmed',
        'Your booking has been submitted successfully. You will receive a confirmation shortly.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Error creating booking:', error);
      Alert.alert('Error', 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your ${booking.serviceName} booking?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Update booking status
            setBookings(prev =>
              prev.map(b =>
                b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
              )
            );
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
          },
        },
      ]
    );
  };

  const handleViewBookingDetails = (booking: Booking) => {
    console.log('👁️ Viewing booking details:', booking.id);
    navigation.navigate('BookingDetails', { bookingId: booking.id });
  };

  const renderTabButton = (tab: 'services' | 'bookings', title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? Colors.primary : Colors.textSecondary}
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderServices = () => (
    <View style={styles.tabContent}>
      {services.length > 0 ? (
        services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onBook={handleBookService}
          />
        ))
      ) : (
        <EmptyState
          icon="briefcase-outline"
          title="No Services Available"
          subtitle="Services will appear here when available"
        />
      )}
    </View>
  );

  const renderBookings = () => (
    <View style={styles.tabContent}>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onPress={handleViewBookingDetails}
            onCancel={handleCancelBooking}
          />
        ))
      ) : (
        <EmptyState
          icon="calendar-outline"
          title="No Bookings Yet"
          subtitle="Your bookings will appear here after you book a service"
          buttonText="Browse Services"
          onButtonPress={() => setActiveTab('services')}
        />
      )}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScreenHeader
          title="Services & Bookings"
          subtitle="Book pet transport services"
        />

        <View style={styles.tabContainer}>
          {renderTabButton('services', 'Services', 'briefcase-outline')}
          {renderTabButton('bookings', 'My Bookings', 'calendar-outline')}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {activeTab === 'services' ? renderServices() : renderBookings()}
        </ScrollView>

        <BookingFormModal
          visible={bookingModalVisible}
          onClose={() => {
            setBookingModalVisible(false);
            setSelectedService(null);
          }}
          onSubmit={handleBookingSubmit}
          service={selectedService}
          pets={pets}
          loading={bookingLoading}
        />
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

  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.borderRadius,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius - 4,
  },

  activeTabButton: {
    backgroundColor: Colors.primary + '20',
  },

  tabButtonText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 8,
    fontWeight: Fonts.mediumWeight,
  },

  activeTabButtonText: {
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },

  scrollView: {
    flex: 1,
  },

  tabContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
  },
});
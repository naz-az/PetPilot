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
  CalendarView,
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);

      const mockBookings: Booking[] = [
        {
          id: '1',
          serviceName: 'Vet Visit',
          petName: 'Buddy',
          date: today.toISOString().split('T')[0],
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
          date: tomorrow.toISOString().split('T')[0],
          time: '2:30 PM',
          status: 'pending',
          price: 25,
          pickupAddress: '123 Main St, City',
          dropoffAddress: '789 Park Blvd, City',
        },
        {
          id: '3',
          serviceName: 'Grooming Transport',
          petName: 'Buddy',
          date: nextWeek.toISOString().split('T')[0],
          time: '11:00 AM',
          status: 'confirmed',
          price: 30,
          pickupAddress: '123 Main St, City',
          dropoffAddress: 'Pet Spa & Grooming, 321 Elm St',
          notes: 'Monthly grooming session',
        },
        {
          id: '4',
          serviceName: 'Emergency Transport',
          petName: 'Whiskers',
          date: lastWeek.toISOString().split('T')[0],
          time: '3:15 PM',
          status: 'completed',
          price: 50,
          pickupAddress: '123 Main St, City',
          dropoffAddress: 'Emergency Vet Clinic, 555 Rush Ave',
          notes: 'Emergency visit - recovered well',
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

  // Calendar event conversion
  const getCalendarEvents = () => {
    return bookings.map(booking => ({
      id: booking.id,
      date: booking.date,
      title: `${booking.serviceName} - ${booking.petName}`,
      type: 'booking' as const,
      status: booking.status,
    }));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleEventPress = (event: any) => {
    const booking = bookings.find(b => b.id === event.id);
    if (booking) {
      navigation.navigate('BookingDetails', { bookingId: booking.id });
    }
  };

  const handleCancelBooking = (booking: Booking) => {
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      Alert.alert('Cannot Cancel', 'This booking cannot be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your ${booking.serviceName} booking for ${booking.petName}?\n\nDate: ${booking.date} at ${booking.time}`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Cancelling booking:', booking.id);
              
              // In a real app, make API call here:
              // await bookingAPI.cancel(booking.id);
              
              // Update booking status locally
              setBookings(prev =>
                prev.map(b =>
                  b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
                )
              );
              
              Alert.alert(
                'Booking Cancelled', 
                'Your booking has been cancelled successfully.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error cancelling booking:', error);
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
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

  const renderViewToggle = () => (
    <View style={styles.viewToggle}>
      <TouchableOpacity
        style={[styles.viewToggleButton, viewMode === 'list' && styles.activeViewToggleButton]}
        onPress={() => setViewMode('list')}
      >
        <Ionicons
          name="list-outline"
          size={18}
          color={viewMode === 'list' ? Colors.primary : Colors.textSecondary}
        />
        <Text style={[styles.viewToggleText, viewMode === 'list' && styles.activeViewToggleText]}>
          List
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewToggleButton, viewMode === 'calendar' && styles.activeViewToggleButton]}
        onPress={() => setViewMode('calendar')}
      >
        <Ionicons
          name="calendar-outline"
          size={18}
          color={viewMode === 'calendar' ? Colors.primary : Colors.textSecondary}
        />
        <Text style={[styles.viewToggleText, viewMode === 'calendar' && styles.activeViewToggleText]}>
          Calendar
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderBookings = () => (
    <View style={styles.tabContent}>
      {renderViewToggle()}
      
      {bookings.length > 0 ? (
        viewMode === 'list' ? (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onPress={handleViewBookingDetails}
              onCancel={handleCancelBooking}
            />
          ))
        ) : (
          <CalendarView
            events={getCalendarEvents()}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onEventPress={handleEventPress}
          />
        )
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

  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.md,
    padding: 4,
    marginBottom: Layout.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.radius.sm,
  },

  activeViewToggleButton: {
    backgroundColor: Colors.primary + '20',
  },

  viewToggleText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: Fonts.mediumWeight,
  },

  activeViewToggleText: {
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },
});
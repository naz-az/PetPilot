import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard, GlassButton } from '../components';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';
import { userAPI, petAPI, bookingAPI } from '../services/api';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('🏠 Loading home screen data...');
      
      // Get user from storage
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('👤 Current user:', parsedUser);
      }

      // Load pets
      try {
        const petsResponse = await petAPI.getAll();
        setPets(petsResponse.data.pets || []);
        console.log('🐕 Pets loaded:', petsResponse.data.pets?.length || 0);
      } catch (error) {
        console.log('⚠️ Could not load pets:', error);
        setPets([]);
      }

      // Load recent bookings
      try {
        const bookingsResponse = await bookingAPI.getAll({ limit: 5 });
        setRecentBookings(bookingsResponse.data.bookings || []);
        console.log('📋 Bookings loaded:', bookingsResponse.data.bookings?.length || 0);
      } catch (error) {
        console.log('⚠️ Could not load bookings:', error);
        setRecentBookings([]);
      }

    } catch (error) {
      console.error('❌ Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { id: '1', title: 'Book Transport', icon: 'car', color: Colors.primary },
    { id: '2', title: 'Schedule Service', icon: 'calendar', color: Colors.info },
    { id: '3', title: 'Find Pilots', icon: 'people', color: Colors.warning },
    { id: '4', title: 'Emergency', icon: 'medical', color: Colors.error },
  ];


  const handleQuickAction = (actionId: string, title: string) => {
    Alert.alert('Coming Soon', `${title} functionality will be available soon!`);
  };

  const handleBookingPress = (bookingId: string) => {
    Alert.alert('Booking Details', 'Booking details screen coming soon!');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
              console.log('🔓 User logged out');
              navigation.replace('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              navigation.replace('Login');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.userName}>
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </Text>
              {user?.userType && (
                <Text style={styles.userType}>
                  {user.userType === 'PET_OWNER' ? 'Pet Owner' : 'Pet Pilot'}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.profileButton}>
              <Ionicons name="person-circle" size={40} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* My Pets Section */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>My Pets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petCard,
                    selectedPet === pet.id && styles.petCardSelected
                  ]}
                  onPress={() => setSelectedPet(pet.id)}
                >
                  <Text style={styles.petIcon}>
                    {pet.species === 'Dog' ? '🐕' : pet.species === 'Cat' ? '🐱' : '🐾'}
                  </Text>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <Text style={styles.petBreed}>{pet.breed || pet.species}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addPetCard}>
                <Ionicons name="add-circle" size={30} color={Colors.primary} />
                <Text style={styles.addPetText}>Add Pet</Text>
              </TouchableOpacity>
            </ScrollView>
          </GlassCard>

          {/* Quick Actions */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionCard}
                  onPress={() => handleQuickAction(action.id, action.title)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                    <Ionicons name={action.icon as any} size={24} color={Colors.text} />
                  </View>
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Recent Bookings */}
          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            {recentBookings.length > 0 ? recentBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => handleBookingPress(booking.id)}
              >
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingType}>
                    {booking.pickupLocation} → {booking.dropoffLocation}
                  </Text>
                  <Text style={styles.bookingDetails}>
                    {booking.pilot ? `with ${booking.pilot.firstName} ${booking.pilot.lastName}` : 'Pilot TBD'} • {booking.pet?.name}
                  </Text>
                  <Text style={styles.bookingDate}>
                    {new Date(booking.scheduledTime).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.bookingStatus}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: booking.status === 'COMPLETED' ? Colors.success : Colors.warning }
                  ]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                </View>
              </TouchableOpacity>
            )) : (
              <Text style={styles.noDataText}>No recent bookings</Text>
            )}
          </GlassCard>

          {/* Emergency Contact */}
          <GlassCard style={styles.section}>
            <View style={styles.emergencyContainer}>
              <Ionicons name="medical" size={30} color={Colors.error} />
              <View style={styles.emergencyContent}>
                <Text style={styles.emergencyTitle}>24/7 Emergency Support</Text>
                <Text style={styles.emergencyText}>
                  Need immediate assistance for your pet?
                </Text>
              </View>
              <GlassButton
                title="Call Now"
                onPress={() => Alert.alert('Emergency', 'Calling emergency support...')}
                variant="outline"
                size="small"
              />
            </View>
          </GlassCard>
        </ScrollView>
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
  
  scrollContent: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  
  greeting: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },
  
  userName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },
  
  userType: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  
  profileButton: {
    padding: Layout.spacing.xs,
  },
  
  section: {
    marginBottom: Layout.spacing.lg,
  },
  
  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  
  seeAllText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.primary,
    fontWeight: Fonts.mediumWeight,
  },
  
  // Pet Cards
  petCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: Layout.spacing.md,
    marginRight: Layout.spacing.md,
    alignItems: 'center',
    minWidth: 100,
  },
  
  petCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.inputFocus,
  },
  
  petIcon: {
    fontSize: 30,
    marginBottom: Layout.spacing.xs,
  },
  
  petName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  
  petBreed: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  addPetCard: {
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderStyle: 'dashed',
    padding: Layout.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  
  addPetText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.primary,
    marginTop: Layout.spacing.xs,
  },
  
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  quickActionCard: {
    width: '48%',
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: Layout.spacing.md,
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.sm,
  },
  
  quickActionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: Fonts.mediumWeight,
  },
  
  // Booking Cards
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  
  bookingInfo: {
    flex: 1,
  },
  
  bookingType: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  
  bookingDetails: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  
  bookingDate: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textMuted,
  },
  
  bookingStatus: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  
  statusBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.radius.sm,
    marginBottom: Layout.spacing.xs,
  },
  
  statusText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.tiny,
    color: Colors.text,
    fontWeight: Fonts.semibold,
  },
  
  // Emergency Section
  emergencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  emergencyContent: {
    flex: 1,
    marginLeft: Layout.spacing.md,
    marginRight: Layout.spacing.md,
  },
  
  emergencyTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.medium,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  
  emergencyText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
  },
  
  noDataText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: Layout.spacing.lg,
  },
});
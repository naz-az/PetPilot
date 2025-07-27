import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
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
  ActionSheet,
  MessagingModal,
  ReviewModal,
} from '../components';
import type { Booking } from '../components/BookingCard';
import type { ActionSheetOption } from '../components/ActionSheet';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

type BookingDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingDetails'>;

interface ExtendedBooking extends Booking {
  pilotInfo?: {
    name: string;
    phone: string;
    rating: number;
    vehicle: string;
    licensePlate: string;
    avatar?: string;
  };
  trackingCode: string;
  estimatedDuration: number;
  totalDistance: number;
  specialInstructions?: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export default function BookingDetailsScreen({ route, navigation }: BookingDetailsScreenProps) {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<ExtendedBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [messagingModalVisible, setMessagingModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      console.log('Loading booking details for:', bookingId);
      
      // Mock booking data based on bookingId - replace with actual API call
      const mockBookings: { [key: string]: ExtendedBooking } = {
        '1': {
          id: '1',
          serviceName: 'Vet Visit',
          petName: 'Buddy',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM',
          status: 'confirmed',
          price: 35,
          pickupAddress: '123 Main St, City',
          dropoffAddress: 'Happy Paws Vet Clinic, 456 Oak Ave',
          notes: 'Annual checkup appointment',
          pilotInfo: {
            name: 'Sarah Johnson',
            phone: '+1 (555) 987-6543',
            rating: 4.8,
            vehicle: '2022 Honda CR-V',
            licensePlate: 'VET-123',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
          },
          trackingCode: 'PP-2024-001',
          estimatedDuration: 45,
          totalDistance: 8.2,
          specialInstructions: 'Pet carrier required for transport safety.',
          paymentMethod: 'Credit Card ending in 4567',
          paymentStatus: 'paid',
        },
        '2': {
          id: '2',
          serviceName: 'Pet Transport',
          petName: 'Whiskers',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          time: '2:30 PM',
          status: 'pending',
          price: 25,
          pickupAddress: '123 Main St, City',
          dropoffAddress: '789 Park Blvd, City',
          notes: 'Whiskers is very friendly but gets nervous in cars.',
          pilotInfo: {
            name: 'Mike Chen',
            phone: '+1 (555) 123-4567',
            rating: 4.9,
            vehicle: '2021 Toyota Prius',
            licensePlate: 'ECO-456',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          },
          trackingCode: 'PP-2024-002',
          estimatedDuration: 30,
          totalDistance: 5.7,
          specialInstructions: 'Keep music low, cat is sensitive to noise.',
          paymentMethod: 'Credit Card ending in 8901',
          paymentStatus: 'pending',
        },
        '3': {
          id: '3',
          serviceName: 'Grooming Transport',
          petName: 'Buddy',
          date: new Date(Date.now() + 604800000).toISOString().split('T')[0],
          time: '11:00 AM',
          status: 'confirmed',
          price: 30,
          pickupAddress: '123 Main St, City',
          dropoffAddress: 'Pet Spa & Grooming, 321 Elm St',
          notes: 'Monthly grooming session',
          pilotInfo: {
            name: 'Emily Rodriguez',
            phone: '+1 (555) 345-6789',
            rating: 4.7,
            vehicle: '2023 Honda Pilot',
            licensePlate: 'GROOM-789',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=400&h=400&fit=crop&crop=face',
          },
          trackingCode: 'PP-2024-003',
          estimatedDuration: 60,
          totalDistance: 12.1,
          specialInstructions: 'Buddy loves car rides, very well behaved.',
          paymentMethod: 'Credit Card ending in 2345',
          paymentStatus: 'paid',
        },
        '4': {
          id: '4',
          serviceName: 'Emergency Transport',
          petName: 'Whiskers',
          date: new Date(Date.now() - 604800000).toISOString().split('T')[0],
          time: '3:15 PM',
          status: 'completed',
          price: 50,
          pickupAddress: '123 Main St, City',
          dropoffAddress: 'Emergency Vet Clinic, 555 Rush Ave',
          notes: 'Emergency visit - recovered well',
          pilotInfo: {
            name: 'David Kim',
            phone: '+1 (555) 911-2468',
            rating: 5.0,
            vehicle: '2022 Ford Transit',
            licensePlate: 'EMRG-911',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
          },
          trackingCode: 'PP-2024-004',
          estimatedDuration: 20,
          totalDistance: 3.8,
          specialInstructions: 'Emergency transport - priority handling.',
          paymentMethod: 'Credit Card ending in 4567',
          paymentStatus: 'paid',
        },
      };

      const booking = mockBookings[bookingId];
      if (!booking) {
        setBooking(null);
        return;
      }
      
      setBooking(booking);
    } catch (error) {
      console.error('Error loading booking details:', error);
      Alert.alert('Error', 'Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return Colors.warning || '#FFA500';
      case 'confirmed':
        return Colors.primary;
      case 'in_progress':
        return Colors.info || '#007AFF';
      case 'completed':
        return Colors.success || '#34C759';
      case 'cancelled':
        return Colors.error || '#FF3B30';
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'in_progress':
        return 'car-outline';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const handleCallPilot = () => {
    if (booking?.pilotInfo?.phone) {
      Linking.openURL(`tel:${booking.pilotInfo.phone}`);
    }
  };

  const handleMessagePilot = () => {
    setMessagingModalVisible(true);
  };

  const handleTrackBooking = () => {
    Alert.alert('Real-time Tracking', 'Your pilot is currently en route. ETA: 15 minutes');
  };

  const handleCancelBooking = () => {
    if (!booking) return;
    
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      Alert.alert('Cannot Cancel', 'This booking cannot be cancelled.');
      return;
    }

    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel this ${booking.serviceName} booking?\n\nRefund: ${booking.paymentStatus === 'paid' ? 'Full refund will be processed' : 'No payment to refund'}`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Cancelling booking:', booking.id);
              
              // In real app, make API call:
              // await bookingAPI.cancel(booking.id);
              
              setBooking(prev => prev ? { 
                ...prev, 
                status: 'cancelled',
                paymentStatus: prev.paymentStatus === 'paid' ? 'refunded' : prev.paymentStatus 
              } : null);
              
              Alert.alert(
                'Booking Cancelled', 
                'Your booking has been cancelled successfully.' + 
                (booking.paymentStatus === 'paid' ? ' Refund will be processed within 3-5 business days.' : ''),
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

  const handleRebookService = () => {
    // Navigate back to main tabs (Bookings is within the tab navigator)
    navigation.navigate('Home');
  };

  const handleLeaveReview = () => {
    if (booking?.status === 'completed') {
      setReviewModalVisible(true);
    } else {
      Alert.alert('Review Not Available', 'You can only review completed bookings');
    }
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!booking?.pilotInfo) {
      throw new Error('Pilot information not available');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5 stars');
    }

    if (comment.trim().length < 10) {
      throw new Error('Please provide a more detailed review (at least 10 characters)');
    }

    try {
      console.log('Submitting review:', { 
        rating, 
        comment: comment.trim(), 
        pilotId: booking.pilotInfo.name,
        bookingId: booking.id 
      });
      
      // In real implementation, submit to API:
      // await reviewAPI.create({
      //   rating,
      //   comment: comment.trim(),
      //   pilotId: booking.pilotInfo.id,
      //   bookingId: booking.id
      // });
      
      Alert.alert(
        'Review Submitted', 
        'Thank you for your feedback! Your review helps improve our service.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  const handleRequestRefund = () => {
    Alert.alert(
      'Request Refund',
      'Are you sure you want to request a refund for this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Refund', 
          style: 'destructive',
          onPress: () => Alert.alert('Refund Requested', 'Your refund request has been submitted and will be processed within 3-5 business days.')
        }
      ]
    );
  };

  const actionSheetOptions: ActionSheetOption[] = [
    ...(booking?.status === 'confirmed' || booking?.status === 'in_progress'
      ? [
          {
            id: 'call',
            title: 'Call Pilot',
            icon: 'call' as keyof typeof Ionicons.glyphMap,
            onPress: handleCallPilot,
          },
          {
            id: 'message',
            title: 'Message Pilot',
            icon: 'chatbubble' as keyof typeof Ionicons.glyphMap,
            onPress: handleMessagePilot,
          },
          {
            id: 'track',
            title: 'Track Booking',
            icon: 'navigate' as keyof typeof Ionicons.glyphMap,
            onPress: handleTrackBooking,
          },
        ]
      : []),
    ...(booking?.status === 'completed'
      ? [
          {
            id: 'review',
            title: 'Leave Review',
            icon: 'star' as keyof typeof Ionicons.glyphMap,
            onPress: handleLeaveReview,
          },
          {
            id: 'book-again',
            title: 'Book Again',
            icon: 'repeat' as keyof typeof Ionicons.glyphMap,
            onPress: handleRebookService,
          },
        ]
      : []),
    ...(booking?.status === 'pending' || booking?.status === 'confirmed'
      ? [
          {
            id: 'cancel',
            title: 'Cancel Booking',
            icon: 'close' as keyof typeof Ionicons.glyphMap,
            onPress: handleCancelBooking,
            destructive: true,
          },
        ]
      : []),
    ...(booking?.status === 'cancelled' && booking?.paymentStatus === 'paid'
      ? [
          {
            id: 'refund',
            title: 'Request Refund',
            icon: 'card' as keyof typeof Ionicons.glyphMap,
            onPress: handleRequestRefund,
          },
        ]
      : []),
  ];

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

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <ScreenHeader
            title="Booking Not Found"
            showBack
            onBack={() => navigation.goBack()}
          />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Booking not found</Text>
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
          title="Booking Details"
          subtitle={`${booking.serviceName} • ${booking.petName}`}
          showBack
          onBack={() => navigation.goBack()}
          rightAction={
            <TouchableOpacity
              onPress={() => setActionSheetVisible(true)}
              style={styles.actionButton}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text} />
            </TouchableOpacity>
          }
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Status Card */}
            <GlassCard style={styles.section}>
              <View style={styles.statusHeader}>
                <View style={[styles.statusIcon, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                  <Ionicons
                    name={getStatusIcon(booking.status) as any}
                    size={24}
                    color={getStatusColor(booking.status)}
                  />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {booking.status.toUpperCase().replace('_', ' ')}
                  </Text>
                  <Text style={styles.trackingCode}>Tracking: {booking.trackingCode}</Text>
                </View>
              </View>
            </GlassCard>

            {/* Booking Information */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Trip Details</Text>
              
              <View style={styles.tripInfo}>
                <View style={styles.locationItem}>
                  <View style={styles.locationIcon}>
                    <Ionicons name="radio-button-on" size={16} color={Colors.primary} />
                  </View>
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationLabel}>Pickup</Text>
                    <Text style={styles.locationAddress}>{booking.pickupAddress}</Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.locationItem}>
                  <View style={styles.locationIcon}>
                    <Ionicons name="location" size={16} color={Colors.error || '#FF3B30'} />
                  </View>
                  <View style={styles.locationDetails}>
                    <Text style={styles.locationLabel}>Drop-off</Text>
                    <Text style={styles.locationAddress}>{booking.dropoffAddress}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tripStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Date & Time</Text>
                  <Text style={styles.statValue}>{booking.date} at {booking.time}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Duration</Text>
                  <Text style={styles.statValue}>{booking.estimatedDuration} min</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>{booking.totalDistance} miles</Text>
                </View>
              </View>
            </GlassCard>

            {/* Pilot Information */}
            {booking.pilotInfo && (
              <GlassCard style={styles.section}>
                <Text style={styles.sectionTitle}>Your Pilot</Text>
                
                <View style={styles.pilotInfo}>
                  <View style={styles.pilotHeader}>
                    <View style={styles.pilotAvatar}>
                      {booking.pilotInfo.avatar ? (
                        <Image source={{ uri: booking.pilotInfo.avatar }} style={styles.pilotAvatarImage} />
                      ) : (
                        <Ionicons name="person" size={24} color={Colors.primary} />
                      )}
                    </View>
                    <View style={styles.pilotDetails}>
                      <Text style={styles.pilotName}>{booking.pilotInfo.name}</Text>
                      <View style={styles.pilotRating}>
                        <Ionicons name="star" size={16} color={Colors.warning || '#FFA500'} />
                        <Text style={styles.ratingText}>{booking.pilotInfo.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.pilotActions}>
                      <TouchableOpacity style={styles.pilotActionButton} onPress={handleCallPilot}>
                        <Ionicons name="call" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.pilotActionButton} onPress={handleMessagePilot}>
                        <Ionicons name="chatbubble" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleLabel}>Vehicle</Text>
                    <Text style={styles.vehicleText}>
                      {booking.pilotInfo.vehicle} • {booking.pilotInfo.licensePlate}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            )}

            {/* Special Instructions */}
            {(booking.notes || booking.specialInstructions) && (
              <GlassCard style={styles.section}>
                <Text style={styles.sectionTitle}>Special Instructions</Text>
                
                {booking.notes && (
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionLabel}>Pet Notes</Text>
                    <Text style={styles.instructionText}>{booking.notes}</Text>
                  </View>
                )}
                
                {booking.specialInstructions && (
                  <View style={styles.instructionItem}>
                    <Text style={styles.instructionLabel}>Transport Instructions</Text>
                    <Text style={styles.instructionText}>{booking.specialInstructions}</Text>
                  </View>
                )}
              </GlassCard>
            )}

            {/* Payment Information */}
            <GlassCard style={styles.section}>
              <Text style={styles.sectionTitle}>Payment</Text>
              
              <View style={styles.paymentInfo}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Service Fee</Text>
                  <Text style={styles.paymentValue}>${booking.price}</Text>
                </View>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Payment Method</Text>
                  <Text style={styles.paymentValue}>{booking.paymentMethod}</Text>
                </View>
                <View style={[styles.paymentRow, styles.paymentTotal]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${booking.price}</Text>
                </View>
                
                <View style={styles.paymentStatus}>
                  <Ionicons
                    name={booking.paymentStatus === 'paid' ? 'checkmark-circle' : 'time'}
                    size={16}
                    color={booking.paymentStatus === 'paid' ? Colors.success || '#34C759' : Colors.warning || '#FFA500'}
                  />
                  <Text style={[
                    styles.paymentStatusText,
                    { color: booking.paymentStatus === 'paid' ? Colors.success || '#34C759' : Colors.warning || '#FFA500' }
                  ]}>
                    {booking.paymentStatus.toUpperCase()}
                  </Text>
                </View>
              </View>
            </GlassCard>

            {/* Action Buttons */}
            {booking.status === 'confirmed' && (
              <View style={styles.actionButtons}>
                <GlassButton
                  title="Track Booking"
                  onPress={handleTrackBooking}
                  style={styles.trackButton}
                />
                <GlassButton
                  title="Cancel"
                  onPress={handleCancelBooking}
                  variant="outline"
                  style={styles.cancelButton}
                />
              </View>
            )}

            {booking.status === 'completed' && (
              <View style={styles.actionButtons}>
                <GlassButton
                  title="Leave Review"
                  onPress={handleLeaveReview}
                  style={styles.reviewButton}
                />
                <GlassButton
                  title="Book Again"
                  onPress={handleRebookService}
                  variant="outline"
                  style={styles.rebookButton}
                />
              </View>
            )}
          </View>
        </ScrollView>

        <ActionSheet
          visible={actionSheetVisible}
          onClose={() => setActionSheetVisible(false)}
          options={actionSheetOptions}
        />

        <MessagingModal
          visible={messagingModalVisible}
          onClose={() => setMessagingModalVisible(false)}
          pilotName={booking.pilotInfo?.name || 'Pilot'}
          bookingId={booking.id}
        />

        <ReviewModal
          visible={reviewModalVisible}
          onClose={() => setReviewModalVisible(false)}
          pilotName={booking.pilotInfo?.name || 'Pilot'}
          pilotId={booking.pilotInfo?.name || 'pilot'}
          bookingId={booking.id}
          onSubmit={handleSubmitReview}
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

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xl,
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

  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  statusInfo: {
    flex: 1,
  },

  statusText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    marginBottom: 4,
  },

  trackingCode: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },

  tripInfo: {
    marginBottom: Layout.spacing.lg,
  },

  locationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  locationIcon: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    marginTop: 2,
  },

  locationDetails: {
    flex: 1,
  },

  locationLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  locationAddress: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    lineHeight: 20,
  },

  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.glassBorder,
    marginLeft: 11,
    marginVertical: Layout.spacing.sm,
  },

  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  statValue: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    fontWeight: Fonts.semibold,
    textAlign: 'center',
  },

  pilotInfo: {
    gap: Layout.spacing.md,
  },

  pilotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pilotAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },

  pilotAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  pilotDetails: {
    flex: 1,
  },

  pilotName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
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
  },

  pilotActions: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },

  pilotActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  vehicleInfo: {
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  vehicleLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  vehicleText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
  },

  instructionItem: {
    marginBottom: Layout.spacing.md,
  },

  instructionLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: Fonts.semibold,
  },

  instructionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    lineHeight: 20,
  },

  paymentInfo: {
    gap: Layout.spacing.md,
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },

  paymentValue: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    fontWeight: Fonts.semibold,
  },

  paymentTotal: {
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  totalLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.text,
    fontWeight: Fonts.bold,
  },

  totalValue: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.primary,
    fontWeight: Fonts.bold,
  },

  paymentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Layout.spacing.md,
  },

  paymentStatusText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.semibold,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },

  trackButton: {
    flex: 2,
  },

  cancelButton: {
    flex: 1,
  },

  reviewButton: {
    flex: 1,
  },

  rebookButton: {
    flex: 1,
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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export interface Booking {
  id: string;
  serviceName: string;
  petName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  pickupAddress: string;
  dropoffAddress: string;
  notes?: string;
}

interface BookingCardProps {
  booking: Booking;
  onPress?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

export default function BookingCard({ booking, onPress, onCancel }: BookingCardProps) {
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

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const canBeCancelled = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={() => onPress?.(booking)}
    >
      <BlurView intensity={20} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.serviceName}>{booking.serviceName}</Text>
              <Text style={styles.petName}>for {booking.petName}</Text>
            </View>
            
            <View style={[styles.statusBadge, { borderColor: getStatusColor(booking.status) }]}>
              <Ionicons 
                name={getStatusIcon(booking.status) as any} 
                size={16} 
                color={getStatusColor(booking.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                {formatStatus(booking.status)}
              </Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{booking.date} at {booking.time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText} numberOfLines={1}>
                {booking.pickupAddress}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="flag-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText} numberOfLines={1}>
                {booking.dropoffAddress}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.price}>${booking.price}</Text>
            
            {canBeCancelled && onCancel && (
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => onCancel(booking)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {booking.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  
  card: {
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  
  content: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.glass,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  
  headerLeft: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  
  serviceName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  
  petName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: Colors.backgroundCard,
  },
  
  statusText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.mediumWeight,
    marginLeft: 4,
  },
  
  details: {
    marginBottom: Layout.spacing.md,
  },
  
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  detailText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  price: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.primary,
  },
  
  cancelButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.error + '20' || '#FF3B3020',
    borderWidth: 1,
    borderColor: Colors.error || '#FF3B30',
  },
  
  cancelButtonText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.mediumWeight,
    color: Colors.error || '#FF3B30',
  },
  
  notesSection: {
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  
  notesLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  
  notesText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
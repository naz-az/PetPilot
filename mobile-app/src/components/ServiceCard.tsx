import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
  available: boolean;
}

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  const handleBookPress = () => {
    onBook(service);
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.8}
      onPress={handleBookPress}
      disabled={!service.available}
    >
      <BlurView intensity={20} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons 
                name={service.icon} 
                size={32} 
                color={service.available ? Colors.primary : Colors.textMuted} 
              />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.name, !service.available && styles.disabledText]}>
                {service.name}
              </Text>
              <Text style={styles.category}>{service.category}</Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, !service.available && styles.disabledText]}>
                ${service.price}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.description, !service.available && styles.disabledText]}>
            {service.description}
          </Text>
          
          <View style={styles.footer}>
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.duration}>{service.duration} min</Text>
            </View>
            
            <View style={[
              styles.statusBadge, 
              service.available ? styles.availableBadge : styles.unavailableBadge
            ]}>
              <Text style={[
                styles.statusText,
                service.available ? styles.availableText : styles.unavailableText
              ]}>
                {service.available ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
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
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  
  headerText: {
    flex: 1,
  },
  
  name: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 4,
  },
  
  category: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  priceContainer: {
    alignItems: 'flex-end',
  },
  
  price: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.primary,
  },
  
  description: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Layout.spacing.md,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  duration: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  
  statusBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  
  availableBadge: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  
  unavailableBadge: {
    backgroundColor: Colors.textMuted + '20',
    borderColor: Colors.textMuted,
  },
  
  statusText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.mediumWeight,
  },
  
  availableText: {
    color: Colors.primary,
  },
  
  unavailableText: {
    color: Colors.textMuted,
  },
  
  disabledText: {
    color: Colors.textMuted,
    opacity: 0.6,
  },
});
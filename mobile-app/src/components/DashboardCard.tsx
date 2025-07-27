import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onPress?: () => void;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function DashboardCard({
  title,
  subtitle,
  value,
  icon,
  iconColor = Colors.primary,
  onPress,
  trend,
  trendValue,
}: DashboardCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return Colors.success || '#34C759';
      case 'down':
        return Colors.error || '#FF3B30';
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <BlurView intensity={20} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            {onPress && (
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            )}
          </View>

          <View style={styles.body}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
          </View>

          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <Ionicons
                name={getTrendIcon() as any}
                size={16}
                color={getTrendColor()}
              />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
    marginVertical: Layout.spacing.xs,
  },

  card: {
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    height: 185, // Increased height for better visual presence
  },

  content: {
    padding: Layout.spacing.lg,
    backgroundColor: Colors.glass,
    flex: 1,
    justifyContent: 'space-between',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  body: {
    marginBottom: Layout.spacing.sm,
  },

  value: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xxl,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 2,
  },

  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
  },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.mediumWeight,
    marginLeft: 4,
  },
});
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface WeatherWidgetProps {
  onPress?: () => void;
}

export default function WeatherWidget({ onPress }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      // Mock weather data - in a real app, this would come from a weather API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const mockWeather: WeatherData = {
        temperature: 72,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        location: 'Current Location',
        icon: 'partly-sunny-outline',
      };
      
      setWeather(mockWeather);
    } catch (error) {
      console.error('Error loading weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp < 50) return Colors.info || '#007AFF';
    if (temp < 75) return Colors.primary;
    if (temp < 85) return Colors.warning || '#FFA500';
    return Colors.error || '#FF3B30';
  };

  const getPetSafetyMessage = (temp: number) => {
    if (temp < 32) return 'Too cold for most pets';
    if (temp < 45) return 'Cool weather - short walks';
    if (temp < 85) return 'Perfect weather for pets!';
    if (temp < 95) return 'Warm - keep walks short';
    return 'Too hot - avoid outdoor activities';
  };

  if (loading) {
    return (
      <BlurView intensity={20} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.loadingContainer}>
            <Ionicons name="cloud-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.loadingText}>Loading weather...</Text>
          </View>
        </View>
      </BlurView>
    );
  }

  if (!weather) {
    return (
      <BlurView intensity={20} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.errorText}>Weather unavailable</Text>
            <TouchableOpacity onPress={loadWeatherData} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    );
  }

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
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.location}>{weather.location}</Text>
            </View>
            {onPress && (
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            )}
          </View>

          <View style={styles.mainWeather}>
            <Ionicons
              name={weather.icon}
              size={48}
              color={getTemperatureColor(weather.temperature)}
            />
            <View style={styles.temperatureContainer}>
              <Text style={[styles.temperature, { color: getTemperatureColor(weather.temperature) }]}>
                {weather.temperature}°F
              </Text>
              <Text style={styles.condition}>{weather.condition}</Text>
            </View>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{weather.humidity}%</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="leaf-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{weather.windSpeed} mph</Text>
            </View>
          </View>

          <View style={styles.petSafety}>
            <Ionicons
              name="paw-outline"
              size={16}
              color={getTemperatureColor(weather.temperature)}
            />
            <Text style={[styles.safetyText, { color: getTemperatureColor(weather.temperature) }]}>
              {getPetSafetyMessage(weather.temperature)}
            </Text>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  location: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  mainWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },

  temperatureContainer: {
    marginLeft: Layout.spacing.md,
    flex: 1,
  },

  temperature: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xxl,
    fontWeight: Fonts.bold,
    marginBottom: 2,
  },

  condition: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  petSafety: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius - 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  safetyText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.mediumWeight,
    marginLeft: 6,
    flex: 1,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },

  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.sm,
  },

  errorContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },

  errorText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },

  retryButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    backgroundColor: Colors.primary + '20',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  retryText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.primary,
    fontWeight: Fonts.mediumWeight,
  },
});
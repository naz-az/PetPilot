import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { Modal } from './Modal';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed?: number;
  uvIndex?: number;
}

interface WeatherRecommendation {
  activity: string;
  reason: string;
  safety: 'good' | 'caution' | 'warning';
  tips: string[];
}

interface ForecastDay {
  date: string;
  temperature: {
    high: number;
    low: number;
  };
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  uvIndex: number;
  chanceOfRain: number;
}

interface EnhancedWeatherWidgetProps {
  onPress?: () => void;
  style?: ViewStyle;
}

export const EnhancedWeatherWidget: React.FC<EnhancedWeatherWidgetProps> = ({ 
  onPress, 
  style 
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [recommendations, setRecommendations] = useState<WeatherRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      // Mock weather data - in real implementation, fetch from API
      const mockWeather: WeatherData = {
        location: 'New York, NY',
        temperature: 22,
        humidity: 65,
        description: 'Partly Cloudy',
        icon: '02d',
        windSpeed: 12,
        uvIndex: 6,
      };

      const mockForecast: ForecastDay[] = [
        {
          date: new Date().toISOString().split('T')[0],
          temperature: { high: 24, low: 18 },
          humidity: 65,
          description: 'Partly Cloudy',
          icon: '02d',
          windSpeed: 12,
          uvIndex: 6,
          chanceOfRain: 20,
        },
        {
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          temperature: { high: 26, low: 20 },
          humidity: 70,
          description: 'Sunny',
          icon: '01d',
          windSpeed: 8,
          uvIndex: 8,
          chanceOfRain: 10,
        },
        {
          date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          temperature: { high: 19, low: 15 },
          humidity: 80,
          description: 'Light Rain',
          icon: '10d',
          windSpeed: 15,
          uvIndex: 3,
          chanceOfRain: 80,
        },
      ];

      const mockRecommendations: WeatherRecommendation[] = [
        {
          activity: 'Park Visit',
          reason: 'Perfect temperature for outdoor activities',
          safety: 'good',
          tips: ['Bring water for your pet', 'Consider a short walk in shade'],
        },
        {
          activity: 'Moderate Exercise',
          reason: 'Good weather conditions for pet exercise',
          safety: 'good',
          tips: ['Monitor your pet for overheating', 'Stay hydrated'],
        },
        {
          activity: 'UV Protection',
          reason: 'Moderate UV levels - protect from sun exposure',
          safety: 'caution',
          tips: ['Seek shade during peak hours', 'Protect paw pads from hot surfaces'],
        },
      ];

      setWeather(mockWeather);
      setForecast(mockForecast);
      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error loading weather data:', error);
      Alert.alert('Error', 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (iconCode: string) => {
    switch (iconCode) {
      case '01d': return 'sunny-outline';
      case '02d': return 'partly-sunny-outline';
      case '03d': return 'cloudy-outline';
      case '10d': return 'rainy-outline';
      case '01n': return 'moon-outline';
      default: return 'sunny-outline';
    }
  };

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'good': return Colors.success;
      case 'caution': return Colors.warning;
      case 'warning': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setShowDetails(true);
    }
  };

  const renderForecastDay = (day: ForecastDay, index: number) => (
    <View key={index} style={styles.forecastDay}>
      <Text style={styles.forecastDate}>
        {index === 0 ? 'Today' : formatDate(day.date)}
      </Text>
      <Ionicons 
        name={getWeatherIcon(day.icon) as any} 
        size={24} 
        color={Colors.primary} 
      />
      <Text style={styles.forecastTemp}>
        {Math.round(day.temperature.high)}°/{Math.round(day.temperature.low)}°
      </Text>
      <Text style={styles.forecastDesc}>{day.description}</Text>
      {day.chanceOfRain > 50 && (
        <View style={styles.rainChance}>
          <Ionicons name="water-outline" size={12} color={Colors.info} />
          <Text style={styles.rainText}>{day.chanceOfRain}%</Text>
        </View>
      )}
    </View>
  );

  const renderRecommendation = (rec: WeatherRecommendation, index: number) => (
    <View key={index} style={styles.recommendation}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationActivity}>{rec.activity}</Text>
        <View style={[styles.safetyBadge, { borderColor: getSafetyColor(rec.safety) }]}>
          <Text style={[styles.safetyText, { color: getSafetyColor(rec.safety) }]}>
            {rec.safety.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.recommendationReason}>{rec.reason}</Text>
      <View style={styles.tips}>
        {rec.tips.map((tip, tipIndex) => (
          <View key={tipIndex} style={styles.tip}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (!weather) {
    return (
      <GlassCard style={StyleSheet.flatten([styles.widgetContainer, style])}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cloudy-outline" size={24} color={Colors.textSecondary} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <GlassCard style={StyleSheet.flatten([styles.widgetContainer, style])}>
          <View style={styles.header}>
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.location}>{weather.location}</Text>
            </View>
            <TouchableOpacity onPress={() => loadWeatherData()} disabled={loading}>
              <Ionicons 
                name="refresh" 
                size={16} 
                color={loading ? Colors.textSecondary : Colors.primary} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.mainWeather}>
            <View style={styles.tempSection}>
              <Ionicons 
                name={getWeatherIcon(weather.icon) as any} 
                size={32} 
                color={Colors.primary} 
              />
              <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
            </View>
            <Text style={styles.description}>{weather.description}</Text>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="water-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{weather.humidity}%</Text>
            </View>
            {weather.windSpeed && (
              <View style={styles.detailItem}>
                <Ionicons name="flag-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{weather.windSpeed} km/h</Text>
              </View>
            )}
            {weather.uvIndex && (
              <View style={styles.detailItem}>
                <Ionicons name="sunny-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.detailText}>UV {weather.uvIndex}</Text>
              </View>
            )}
          </View>
        </GlassCard>
      </TouchableOpacity>

      <Modal visible={showDetails} onClose={() => setShowDetails(false)}>
        <View style={styles.container}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Weather Details</Text>
            <TouchableOpacity onPress={() => setShowDetails(false)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.currentWeatherDetail}>
              <Text style={styles.sectionTitle}>Current Weather</Text>
              <View style={styles.currentWeatherGrid}>
                <View style={styles.weatherStat}>
                  <Ionicons name="thermometer-outline" size={20} color={Colors.primary} />
                  <Text style={styles.statLabel}>Temperature</Text>
                  <Text style={styles.statValue}>{weather.temperature}°C</Text>
                </View>
                <View style={styles.weatherStat}>
                  <Ionicons name="water-outline" size={20} color={Colors.primary} />
                  <Text style={styles.statLabel}>Humidity</Text>
                  <Text style={styles.statValue}>{weather.humidity}%</Text>
                </View>
                {weather.windSpeed && (
                  <View style={styles.weatherStat}>
                    <Ionicons name="flag-outline" size={20} color={Colors.primary} />
                    <Text style={styles.statLabel}>Wind Speed</Text>
                    <Text style={styles.statValue}>{weather.windSpeed} km/h</Text>
                  </View>
                )}
                {weather.uvIndex && (
                  <View style={styles.weatherStat}>
                    <Ionicons name="sunny-outline" size={20} color={Colors.primary} />
                    <Text style={styles.statLabel}>UV Index</Text>
                    <Text style={styles.statValue}>{weather.uvIndex}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.forecastSection}>
              <Text style={styles.sectionTitle}>3-Day Forecast</Text>
              <View style={styles.forecastContainer}>
                {forecast.map(renderForecastDay)}
              </View>
            </View>

            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>Pet Activity Recommendations</Text>
              {recommendations.map(renderRecommendation)}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: Layout.window.height * 0.9,
  },

  widgetContainer: {
    padding: Layout.spacing.md,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
  },

  loadingText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.sm,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },

  locationInfo: {
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
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },

  tempSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },

  temperature: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xxl,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },

  description: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
  },

  details: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Layout.spacing.sm,
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

  // Modal styles  
  content: {
    maxHeight: Layout.window.height * 0.6,
  },

  scrollViewContent: {
    paddingBottom: Layout.spacing.xl,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },

  modalTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  closeButton: {
    padding: Layout.spacing.xs,
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },

  currentWeatherDetail: {
    marginBottom: Layout.spacing.xl,
  },

  currentWeatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  weatherStat: {
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
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginTop: 2,
  },

  forecastSection: {
    marginBottom: Layout.spacing.xl,
  },

  horizontalScroll: {
    flexGrow: 0,
  },

  forecastContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  forecastDay: {
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.md,
    marginBottom: Layout.spacing.sm,
    width: '32%',
  },

  forecastDate: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },

  forecastTemp: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginVertical: Layout.spacing.xs,
  },

  forecastDesc: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  rainChance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.xs,
  },

  rainText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.info,
    marginLeft: 2,
  },

  recommendationsSection: {
    marginBottom: Layout.spacing.lg,
  },

  recommendation: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.md,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },

  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },

  recommendationActivity: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    flex: 1,
  },

  safetyBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: Colors.background,
  },

  safetyText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.bold,
  },

  recommendationReason: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },

  tips: {
    marginTop: Layout.spacing.xs,
  },

  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  tipBullet: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.primary,
    marginRight: Layout.spacing.xs,
    marginTop: 2,
  },

  tipText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
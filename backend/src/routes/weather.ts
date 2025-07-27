import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Mock weather API function (in real implementation, you'd use OpenWeatherMap or similar)
const fetchWeatherData = async (location: string) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock weather data
  return {
    location,
    temperature: Math.round(Math.random() * 30 + 10), // 10-40°C
    humidity: Math.round(Math.random() * 40 + 40), // 40-80%
    description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'][Math.floor(Math.random() * 5)],
    icon: ['01d', '02d', '03d', '10d', '01n'][Math.floor(Math.random() * 5)],
    windSpeed: Math.round(Math.random() * 20 + 5), // 5-25 km/h
    uvIndex: Math.round(Math.random() * 10 + 1), // 1-11
    timestamp: new Date()
  };
};

// Get current weather for a location
router.get('/current', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const location = req.query.location as string || 'Toronto, ON'; // Default location

    if (!location) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Please provide a location parameter'
      });
    }

    // Check if we have recent cached weather data (within last hour)
    const cachedWeather = await prisma.weatherData.findFirst({
      where: {
        location,
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (cachedWeather) {
      return res.json({
        message: 'Weather data retrieved successfully',
        weather: cachedWeather,
        cached: true
      });
    }

    // Fetch fresh weather data
    const weatherData = await fetchWeatherData(location);

    // Save to database
    const savedWeather = await prisma.weatherData.create({
      data: weatherData
    });

    res.json({
      message: 'Weather data retrieved successfully',
      weather: savedWeather,
      cached: false
    });

  } catch (error) {
    console.error('Get weather error:', error);
    res.status(500).json({
      error: 'Failed to retrieve weather data',
      message: 'An error occurred while fetching weather information'
    });
  }
});

// Get weather forecast (mock 5-day forecast)
router.get('/forecast', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const location = req.query.location as string || 'Toronto, ON';

    if (!location) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Please provide a location parameter'
      });
    }

    // Generate 5-day forecast
    const forecast = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        temperature: {
          high: Math.round(Math.random() * 15 + 20), // 20-35°C
          low: Math.round(Math.random() * 10 + 5)    // 5-15°C
        },
        humidity: Math.round(Math.random() * 40 + 40),
        description: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Clear'][Math.floor(Math.random() * 5)],
        icon: ['01d', '02d', '03d', '10d', '01n'][Math.floor(Math.random() * 5)],
        windSpeed: Math.round(Math.random() * 20 + 5),
        uvIndex: Math.round(Math.random() * 10 + 1),
        chanceOfRain: Math.round(Math.random() * 100)
      });
    }

    res.json({
      message: 'Weather forecast retrieved successfully',
      location,
      forecast
    });

  } catch (error) {
    console.error('Get weather forecast error:', error);
    res.status(500).json({
      error: 'Failed to retrieve weather forecast',
      message: 'An error occurred while fetching weather forecast'
    });
  }
});

// Get weather recommendations for pet activities
router.get('/recommendations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const location = req.query.location as string || 'Toronto, ON';
    const petType = req.query.petType as string || 'dog';

    // Get current weather
    const weatherData = await fetchWeatherData(location);

    // Generate recommendations based on weather
    const recommendations = [];

    if (weatherData.temperature >= 20 && weatherData.temperature <= 25 && weatherData.description !== 'Light Rain') {
      recommendations.push({
        activity: 'Park Visit',
        reason: 'Perfect temperature for outdoor activities',
        safety: 'good',
        tips: ['Bring water for your pet', 'Consider a short walk in shade']
      });
    }

    if (weatherData.temperature > 25) {
      recommendations.push({
        activity: 'Indoor Activities',
        reason: 'Temperature may be too hot for extended outdoor exercise',
        safety: 'caution',
        tips: ['Keep pets hydrated', 'Avoid hot pavement', 'Exercise during cooler parts of the day']
      });
    }

    if (weatherData.temperature < 10) {
      recommendations.push({
        activity: 'Short Walks',
        reason: 'Cold weather - limit outdoor exposure',
        safety: 'caution',
        tips: ['Consider pet clothing for small dogs', 'Watch for signs of cold stress', 'Shorter outdoor sessions']
      });
    }

    if (weatherData.description === 'Light Rain') {
      recommendations.push({
        activity: 'Indoor Play',
        reason: 'Rainy weather - best to stay indoors',
        safety: 'good',
        tips: ['Indoor games and training', 'Mental stimulation activities']
      });
    }

    if (weatherData.uvIndex > 7) {
      recommendations.push({
        activity: 'Shaded Areas Only',
        reason: 'High UV index - protect from sun exposure',
        safety: 'caution',
        tips: ['Seek shade', 'Limit midday activities', 'Protect paw pads from hot surfaces']
      });
    }

    res.json({
      message: 'Weather recommendations retrieved successfully',
      weather: weatherData,
      petType,
      recommendations
    });

  } catch (error) {
    console.error('Get weather recommendations error:', error);
    res.status(500).json({
      error: 'Failed to retrieve weather recommendations',
      message: 'An error occurred while generating weather recommendations'
    });
  }
});

export default router;
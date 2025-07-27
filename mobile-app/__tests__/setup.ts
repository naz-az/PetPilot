import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock Expo modules
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({
    width: 375,
    height: 812,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((options) => options.ios),
}));

// Mock Keyboard
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: jest.fn(),
  removeAllListeners: jest.fn(),
  removeListener: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-netinfo/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
  addEventListener: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');

// Global test helpers
global.fetch = jest.fn();

// Mock setTimeout for testing
global.setTimeout = jest.fn((callback) => callback());

// Console suppression for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock database connection
jest.mock('sqlite3', () => ({
  Database: jest.fn().mockImplementation(() => ({
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
    close: jest.fn(),
    serialize: jest.fn(),
    parallelize: jest.fn(),
  })),
}));

// Mock services
jest.mock('../src/services/api', () => ({
  petAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  bookingAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
    reschedule: jest.fn(),
    updateStatus: jest.fn(),
  },
  userAPI: {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteAccount: jest.fn(),
  },
  reviewAPI: {
    create: jest.fn(),
    getByPilot: jest.fn(),
  },
}));

// Mock auth token
jest.mock('../src/services/auth', () => ({
  getAuthToken: jest.fn(() => Promise.resolve('mock-token')),
  setAuthToken: jest.fn(),
  removeAuthToken: jest.fn(),
  isAuthenticated: jest.fn(() => Promise.resolve(true)),
}));

// Set up global test environment
beforeEach(() => {
  jest.clearAllMocks();
});

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  address: '123 Main St',
  avatar: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockPet = (overrides = {}) => ({
  id: '1',
  user_id: '1',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  age: '3',
  weight: '65',
  size: 'Large',
  color: 'Golden',
  description: 'Friendly dog',
  photo: 'https://example.com/buddy.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockBooking = (overrides = {}) => ({
  id: '1',
  user_id: '1',
  pet_id: '1',
  service_name: 'Pet Transport',
  pet_name: 'Buddy',
  date: '2024-01-20',
  time: '10:00 AM',
  status: 'pending',
  price: 25,
  pickup_address: '123 Main St',
  dropoff_address: '456 Oak Ave',
  notes: 'Handle with care',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockMedicalRecord = (overrides = {}) => ({
  id: '1',
  pet_id: '1',
  title: 'Annual Checkup',
  description: 'Routine examination',
  diagnosis: 'Healthy',
  treatment: 'No treatment needed',
  medications: [],
  cost: 150,
  vet_name: 'Dr. Johnson',
  vet_clinic: 'Happy Paws Vet',
  visit_date: '2024-01-15',
  next_visit: '2024-07-15',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

export const createMockReview = (overrides = {}) => ({
  id: '1',
  booking_id: '1',
  user_id: '1',
  pilot_id: 'pilot-1',
  rating: 5,
  comment: 'Excellent service!',
  created_at: '2024-01-20T15:00:00Z',
  ...overrides,
});
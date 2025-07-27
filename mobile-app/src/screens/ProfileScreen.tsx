import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ScreenHeader,
  ProfileCard,
  SettingsItem,
  ProfileEditModal,
  LoadingSpinner,
} from '../components';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';
import type { UserProfile } from '../components/ProfileCard';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('Loading user profile...');
      
      // Get user data from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Create profile object with mock additional data
        const userProfile: UserProfile = {
          id: userData.id || '1',
          name: userData.name || 'John Doe',
          email: userData.email || 'john@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main Street, City, State 12345',
          avatar: undefined,
          joinDate: '2024-01-01',
          totalBookings: 12,
          totalPets: 2,
        };
        
        setProfile(userProfile);
      } else {
        // Fallback mock profile
        const mockProfile: UserProfile = {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          address: '123 Main Street, City, State 12345',
          avatar: undefined,
          joinDate: '2024-01-01',
          totalBookings: 12,
          totalPets: 2,
        };
        setProfile(mockProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  }, []);

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    setEditLoading(true);
    
    try {
      console.log('Saving profile:', updatedProfile);
      
      // Update AsyncStorage with new profile data
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const updatedUserData = {
          ...userData,
          name: updatedProfile.name,
          email: updatedProfile.email,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      }
      
      // Update local state
      setProfile(updatedProfile);
      setEditModalVisible(false);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = () => {
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
              await AsyncStorage.removeItem('userData');
              await AsyncStorage.removeItem('authToken');
              // Navigate back to login would go here
              Alert.alert('Logged Out', 'You have been logged out successfully.');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deletion',
              'Account deletion functionality will be implemented soon.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About PetPilot',
      'PetPilot v1.0.0\n\nSafe and reliable pet transportation services.\n\nBuilt with React Native and Expo.',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      'Need help? Contact us at:\n\nsupport@petpilot.com\n+1 (800) 123-PETS\n\nOr visit our FAQ at petpilot.com/help',
      [{ text: 'OK' }]
    );
  };

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

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={[Colors.background, Colors.backgroundSecondary]}
          style={styles.gradient}
        >
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Failed to load profile</Text>
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
          title="Profile"
          subtitle="Manage your account and preferences"
        />

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
          <View style={styles.content}>
            <ProfileCard profile={profile} onEdit={handleEditProfile} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <SettingsItem
                icon="notifications-outline"
                title="Push Notifications"
                subtitle="Receive booking updates and reminders"
                type="toggle"
                value={pushNotifications}
                onToggle={setPushNotifications}
              />
              <SettingsItem
                icon="mail-outline"
                title="Email Updates"
                subtitle="Get newsletters and service updates"
                type="toggle"
                value={emailUpdates}
                onToggle={setEmailUpdates}
              />
              <SettingsItem
                icon="location-outline"
                title="Location Tracking"
                subtitle="Allow location access for better service"
                type="toggle"
                value={locationTracking}
                onToggle={setLocationTracking}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <SettingsItem
                icon="card-outline"
                title="Payment Methods"
                subtitle="Manage your payment options"
                type="navigation"
                onPress={() => Alert.alert('Payment Methods', 'Manage your saved cards, payment history, and billing preferences.')}
              />
              <SettingsItem
                icon="shield-outline"
                title="Privacy & Security"
                subtitle="Manage your privacy settings"
                type="navigation"
                onPress={() => Alert.alert('Privacy & Security', 'Control your data privacy, security settings, and account protection options.')}
              />
              <SettingsItem
                icon="document-text-outline"
                title="Terms & Conditions"
                subtitle="Read our terms of service"
                type="navigation"
                onPress={() => Alert.alert('Terms & Conditions', 'View our terms of service, privacy policy, and user agreement.')}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <SettingsItem
                icon="help-circle-outline"
                title="Help & Support"
                subtitle="Get help and contact support"
                type="navigation"
                onPress={handleHelp}
              />
              <SettingsItem
                icon="information-circle-outline"
                title="About"
                subtitle="App version and information"
                type="navigation"
                onPress={handleAbout}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account Actions</Text>
              <SettingsItem
                icon="log-out-outline"
                title="Logout"
                subtitle="Sign out of your account"
                type="action"
                onPress={handleLogout}
              />
              <SettingsItem
                icon="trash-outline"
                title="Delete Account"
                subtitle="Permanently delete your account"
                type="action"
                danger
                onPress={handleDeleteAccount}
              />
            </View>
          </View>
        </ScrollView>

        <ProfileEditModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          onSave={handleSaveProfile}
          profile={profile}
          loading={editLoading}
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
    marginBottom: Layout.spacing.xl,
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: 4,
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
    color: Colors.error || Colors.textSecondary,
    textAlign: 'center',
  },
});
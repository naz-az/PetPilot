import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './Modal';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface PrivacySecurityModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacySecurityModal: React.FC<PrivacySecurityModalProps> = ({
  visible,
  onClose,
}) => {
  // Privacy Settings
  const [locationTracking, setLocationTracking] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Security Settings
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes

  const handlePrivacySettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'locationTracking':
        setLocationTracking(value);
        if (!value) {
          Alert.alert(
            'Location Tracking Disabled',
            'Disabling location tracking may affect the accuracy of pickup and drop-off services.',
            [{ text: 'OK' }]
          );
        }
        break;
      case 'dataSharing':
        setDataSharing(value);
        break;
      case 'analyticsOptIn':
        setAnalyticsOptIn(value);
        break;
      case 'marketingEmails':
        setMarketingEmails(value);
        break;
      case 'pushNotifications':
        setPushNotifications(value);
        break;
    }
  };

  const handleSecuritySettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case 'biometricLogin':
        setBiometricLogin(value);
        if (value) {
          Alert.alert(
            'Enable Biometric Login',
            'This will allow you to use fingerprint or face recognition to log into the app.',
            [
              { text: 'Cancel', onPress: () => setBiometricLogin(false) },
              { text: 'Enable', onPress: () => setBiometricLogin(true) }
            ]
          );
        }
        break;
      case 'twoFactorAuth':
        setTwoFactorAuth(value);
        if (value) {
          Alert.alert(
            'Enable Two-Factor Authentication',
            'This will add an extra layer of security to your account. You will receive a verification code via SMS or email.',
            [
              { text: 'Cancel', onPress: () => setTwoFactorAuth(false) },
              { text: 'Set Up', onPress: () => {
                // Navigate to 2FA setup
                Alert.alert('Coming Soon', '2FA setup will be available in the next update.');
                setTwoFactorAuth(false);
              }}
            ]
          );
        }
        break;
    }
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'You will be logged out and redirected to reset your password.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => {
          // In real implementation, trigger password reset flow
          Alert.alert('Success', 'Password reset link has been sent to your email.');
        }}
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Account', style: 'destructive', onPress: () => {
          Alert.alert(
            'Final Confirmation',
            'This will permanently delete all your data, pets, and booking history. Type "DELETE" to confirm.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'I understand', style: 'destructive', onPress: () => {
                // In real implementation, delete account
                Alert.alert('Account Deletion', 'Your account deletion request has been submitted. You will receive a confirmation email within 24 hours.');
              }}
            ]
          );
        }}
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Your data will be prepared and sent to your email address as a downloadable file. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          Alert.alert('Data Export Initiated', 'You will receive an email with your data export within 15 minutes.');
        }}
      ]
    );
  };

  const handleSessionTimeoutChange = () => {
    Alert.alert(
      'Session Timeout',
      'Choose how long you want to stay logged in when the app is inactive:',
      [
        { text: '15 minutes', onPress: () => setSessionTimeout(15) },
        { text: '30 minutes', onPress: () => setSessionTimeout(30) },
        { text: '1 hour', onPress: () => setSessionTimeout(60) },
        { text: '4 hours', onPress: () => setSessionTimeout(240) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const formatSessionTimeout = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy & Security</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Privacy Settings */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Location Tracking</Text>
                <Text style={styles.settingDescription}>
                  Allow the app to track your location for accurate pickup and drop-off
                </Text>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={(value) => handlePrivacySettingChange('locationTracking', value)}
                trackColor={{ false: Colors.backgroundCard, true: Colors.primary + '80' }}
                thumbColor={locationTracking ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Data Sharing with Partners</Text>
                <Text style={styles.settingDescription}>
                  Share anonymized usage data with our partner veterinarians and pet services
                </Text>
              </View>
              <Switch
                value={dataSharing}
                onValueChange={(value) => handlePrivacySettingChange('dataSharing', value)}
                trackColor={{ false: Colors.backgroundCard, true: Colors.primary + '80' }}
                thumbColor={dataSharing ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Analytics</Text>
                <Text style={styles.settingDescription}>
                  Help us improve the app by sharing anonymous usage analytics
                </Text>
              </View>
              <Switch
                value={analyticsOptIn}
                onValueChange={(value) => handlePrivacySettingChange('analyticsOptIn', value)}
                trackColor={{ false: Colors.backgroundCard, true: Colors.primary + '80' }}
                thumbColor={analyticsOptIn ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Marketing Communications</Text>
                <Text style={styles.settingDescription}>
                  Receive promotional emails about new features and special offers
                </Text>
              </View>
              <Switch
                value={marketingEmails}
                onValueChange={(value) => handlePrivacySettingChange('marketingEmails', value)}
                trackColor={{ false: Colors.backgroundCard, true: Colors.primary + '80' }}
                thumbColor={marketingEmails ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive notifications about bookings, updates, and important information
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={(value) => handlePrivacySettingChange('pushNotifications', value)}
                trackColor={{ false: Colors.backgroundCard, true: Colors.primary + '80' }}
                thumbColor={pushNotifications ? Colors.primary : Colors.textSecondary}
              />
            </View>
          </GlassCard>

          {/* Security Settings */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Security Settings</Text>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Biometric Login</Text>
                <Text style={styles.settingDescription}>
                  Use fingerprint or face recognition to log in
                </Text>
              </View>
              <Switch
                value={biometricLogin}
                onValueChange={(value) => handleSecuritySettingChange('biometricLogin', value)}
                trackColor={{ false: Colors.backgroundCard, true: Colors.primary + '80' }}
                thumbColor={biometricLogin ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>
                  Add an extra layer of security with SMS or email verification
                </Text>
              </View>
              <Switch
                value={twoFactorAuth}
                onValueChange={(value) => handleSecuritySettingChange('twoFactorAuth', value)}
                trackColor={{ false: Colors.backgroundCard, true: Colors.primary + '80' }}
                thumbColor={twoFactorAuth ? Colors.primary : Colors.textSecondary}
              />
            </View>

            <TouchableOpacity style={styles.actionItem} onPress={handleSessionTimeoutChange}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Session Timeout</Text>
                <Text style={styles.settingDescription}>
                  Automatically log out after inactivity: {formatSessionTimeout(sessionTimeout)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>
                  Update your account password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </GlassCard>

          {/* Data Management */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleDataExport}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Export My Data</Text>
                <Text style={styles.settingDescription}>
                  Download a copy of your personal data
                </Text>
              </View>
              <Ionicons name="download-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionItem, styles.dangerItem]} onPress={handleDeleteAccount}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
                <Text style={styles.settingDescription}>
                  Permanently delete your account and all data
                </Text>
              </View>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </GlassCard>

          {/* Information */}
          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>Learn More</Text>
            
            <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert('Privacy Policy', 'Our full privacy policy would be displayed here or opened in a web browser.')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingDescription}>
                  Read our complete privacy policy
                </Text>
              </View>
              <Ionicons name="open-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={() => Alert.alert('Terms of Service', 'Our terms of service would be displayed here or opened in a web browser.')}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingDescription}>
                  Review our terms and conditions
                </Text>
              </View>
              <Ionicons name="open-outline" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: Layout.window.height * 0.9,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  closeButton: {
    padding: Layout.spacing.xs,
  },

  content: {
    maxHeight: Layout.window.height * 0.6,
  },

  section: {
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },

  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },

  dangerItem: {
    borderBottomColor: Colors.error + '20',
  },

  settingInfo: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },

  settingTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 4,
  },

  settingDescription: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  dangerText: {
    color: Colors.error,
  },
});
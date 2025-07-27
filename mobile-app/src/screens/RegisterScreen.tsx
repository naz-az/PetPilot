import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { GlassButton, GlassInput } from '../components';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, email, phone, password, confirmPassword } = formData;
    
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement actual registration logic with API
      console.log('Registration attempt:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[Colors.background, Colors.backgroundSecondary]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backText}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>🐾</Text>
              </View>
              <Text style={styles.logoText}>PetPilot</Text>
              <Text style={styles.tagline}>Sign Up For Free</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.nameRow}>
                <GlassInput
                  placeholder="First Name"
                  value={formData.firstName}
                  onChangeText={(value) => handleInputChange('firstName', value)}
                  icon="person"
                  containerStyle={styles.nameInput}
                />
                <GlassInput
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChangeText={(value) => handleInputChange('lastName', value)}
                  icon="person"
                  containerStyle={styles.nameInput}
                />
              </View>

              <GlassInput
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail"
              />

              <GlassInput
                placeholder="Mobile Number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
                icon="call"
              />

              <GlassInput
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                isPassword
                icon="lock-closed"
              />

              <GlassInput
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                isPassword
                icon="lock-closed"
              />

              {/* Checkboxes */}
              <View style={styles.checkboxSection}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setAgreeToTerms(!agreeToTerms)}
                >
                  <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                    {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>
                    Keep Me Signed In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setEmailUpdates(!emailUpdates)}
                >
                  <View style={[styles.checkbox, emailUpdates && styles.checkboxChecked]}>
                    {emailUpdates && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxText}>
                    Email Me About Special Pricing
                  </Text>
                </TouchableOpacity>
              </View>

              <GlassButton
                title="Create Account"
                onPress={handleRegister}
                loading={loading}
                style={styles.registerButton}
              />
            </View>

            {/* Login Link */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.navigate('Login')}
                >
                  Login
                </Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  
  keyboardView: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  
  header: {
    marginBottom: Layout.spacing.lg,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  backText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: Fonts.bold,
  },
  
  logoSection: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  
  logoIcon: {
    fontSize: 30,
  },
  
  logoText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.xs,
  },
  
  tagline: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  formSection: {
    marginBottom: Layout.spacing.lg,
  },
  
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  nameInput: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  
  checkboxSection: {
    marginVertical: Layout.spacing.md,
  },
  
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Layout.spacing.xs,
  },
  
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.sm,
  },
  
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  
  checkmark: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: Fonts.bold,
  },
  
  checkboxText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    flex: 1,
  },
  
  registerButton: {
    marginTop: Layout.spacing.lg,
  },
  
  loginSection: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: Layout.spacing.lg,
  },
  
  loginText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  loginLink: {
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },
});
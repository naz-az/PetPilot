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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassButton, GlassInput, SocialButton } from '../components';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';
import { authAPI } from '../services/api';

interface LoginScreenProps {
  navigation: any;
}

// Quick login credentials
const QUICK_LOGIN_CREDENTIALS = {
  petOwners: [
    { email: 'john.doe@example.com', password: 'password123', label: 'John Doe (Pet Owner)' },
    { email: 'sarah.smith@example.com', password: 'password123', label: 'Sarah Smith (Pet Owner)' },
  ],
  petPilots: [
    { email: 'mike.johnson@example.com', password: 'password123', label: 'Mike Johnson (Pet Pilot)' },
    { email: 'emma.wilson@example.com', password: 'password123', label: 'Emma Wilson (Pet Pilot)' },
  ],
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    const emailToUse = loginEmail || email;
    const passwordToUse = loginPassword || password;
    
    if (!emailToUse || !passwordToUse) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Login attempt:', { email: emailToUse, password: passwordToUse });
      
      // Call the actual API
      const response = await authAPI.login({
        email: emailToUse,
        password: passwordToUse,
      });

      console.log('✅ Login successful:', response.data);

      // Store tokens and user data
      const { user, tokens } = response.data;
      await AsyncStorage.setItem('accessToken', tokens.accessToken);
      await AsyncStorage.setItem('refreshToken', tokens.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      console.log('💾 User data stored:', user);
      
      // Navigate to home on success
      navigation.replace('Home');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (credentials: { email: string; password: string; label: string }) => {
    setEmail(credentials.email);
    setPassword(credentials.password);
    handleLogin(credentials.email, credentials.password);
  };

  const handleSocialLogin = (provider: 'facebook' | 'google') => {
    // TODO: Implement social login
    Alert.alert('Coming Soon', `${provider} login will be available soon!`);
  };

  const handleForgotPassword = () => {
    Alert.alert('Forgot Password', 'Password reset functionality coming soon!');
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
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>🐾</Text>
              </View>
              <Text style={styles.logoText}>PetPilot</Text>
              <Text style={styles.tagline}>Your Pet's Journey Companion</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <GlassInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail"
              />

              <GlassInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
                icon="lock-closed"
              />

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Forgot Your Password?</Text>
              </TouchableOpacity>

              <GlassButton
                title="Login"
                onPress={() => handleLogin()}
                loading={loading}
                style={styles.loginButton}
              />
            </View>

            {/* Social Login Section */}
            <View style={styles.socialSection}>
              <Text style={styles.orText}>Or Continue With</Text>
              
              <View style={styles.socialButtons}>
                <SocialButton
                  provider="facebook"
                  onPress={() => handleSocialLogin('facebook')}
                  style={styles.socialButton}
                />
                <SocialButton
                  provider="google"
                  onPress={() => handleSocialLogin('google')}
                  style={styles.socialButton}
                />
              </View>
            </View>

            {/* Register Link */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>
                Don't have an account?{' '}
                <Text
                  style={styles.registerLink}
                  onPress={() => navigation.navigate('Register')}
                >
                  Sign Up
                </Text>
              </Text>
            </View>

            {/* Quick Login Section */}
            <View style={styles.quickLoginSection}>
              <Text style={styles.quickLoginTitle}>Quick Login (Demo)</Text>
              
              {/* Pet Owners */}
              <View style={styles.quickLoginGroup}>
                <Text style={styles.quickLoginGroupTitle}>Pet Owners</Text>
                {QUICK_LOGIN_CREDENTIALS.petOwners.map((credential, index) => (
                  <TouchableOpacity
                    key={`owner-${index}`}
                    style={styles.quickLoginButton}
                    onPress={() => handleQuickLogin(credential)}
                    disabled={loading}
                  >
                    <Text style={styles.quickLoginButtonText}>{credential.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Pet Pilots */}
              <View style={styles.quickLoginGroup}>
                <Text style={styles.quickLoginGroupTitle}>Pet Pilots</Text>
                {QUICK_LOGIN_CREDENTIALS.petPilots.map((credential, index) => (
                  <TouchableOpacity
                    key={`pilot-${index}`}
                    style={styles.quickLoginButton}
                    onPress={() => handleQuickLogin(credential)}
                    disabled={loading}
                  >
                    <Text style={styles.quickLoginButtonText}>{credential.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
    paddingVertical: Layout.spacing.xl,
  },
  
  logoSection: {
    alignItems: 'center',
    marginTop: Layout.spacing.xxl,
    marginBottom: Layout.spacing.xl,
  },
  
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  
  logoIcon: {
    fontSize: 40,
  },
  
  logoText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xxl,
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

  quickLoginSection: {
    marginTop: Layout.spacing.xl,
    marginBottom: Layout.spacing.lg,
  },

  quickLoginTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.lg,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },

  quickLoginGroup: {
    marginBottom: Layout.spacing.md,
  },

  quickLoginGroupTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.medium,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },

  quickLoginButton: {
    backgroundColor: Colors.glass,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Layout.borderRadius,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.xs,
  },

  quickLoginButtonText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    textAlign: 'center',
  },
  
  formSection: {
    marginBottom: Layout.spacing.xl,
  },
  
  forgotText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    marginTop: Layout.spacing.sm,
  },
  
  loginButton: {
    marginBottom: Layout.spacing.md,
  },
  
  socialSection: {
    marginBottom: Layout.spacing.xl,
  },
  
  orText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  socialButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  
  registerSection: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  
  registerText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  registerLink: {
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },
});
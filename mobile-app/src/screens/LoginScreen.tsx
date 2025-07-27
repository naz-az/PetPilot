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

            {/* Quick Login for Testing */}
            <View style={styles.quickLoginSection}>
              <Text style={styles.quickLoginTitle}>Quick Login (Testing)</Text>
              <View style={styles.quickLoginButtons}>
                <TouchableOpacity 
                  style={styles.quickLoginButton}
                  onPress={() => handleLogin('john.doe@example.com', 'password123')}
                >
                  <Text style={styles.quickLoginText}>John (Owner)</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.quickLoginButton}
                  onPress={() => handleLogin('mike.johnson@example.com', 'password123')}
                >
                  <Text style={styles.quickLoginText}>Mike (Pilot)</Text>
                </TouchableOpacity>
              </View>
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
  
  quickLoginSection: {
    marginBottom: Layout.spacing.lg,
  },
  
  quickLoginTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textMuted,
    textAlign: 'center' as const,
    marginBottom: Layout.spacing.md,
  },
  
  quickLoginButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  
  quickLoginButton: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    marginHorizontal: Layout.spacing.xs,
    alignItems: 'center' as const,
  },
  
  quickLoginText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    fontWeight: Fonts.mediumWeight,
  },
});
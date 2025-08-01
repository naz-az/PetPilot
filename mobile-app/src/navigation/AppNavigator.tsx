import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BottomTabNavigator from './BottomTabNavigator';
import PetDetailsScreen from '../screens/PetDetailsScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import FindPilotsScreen from '../screens/FindPilotsScreen';
import PilotDetailsScreen from '../screens/PilotDetailsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  PetDetails: { petId: string };
  BookingDetails: { bookingId: string };
  FindPilots: undefined;
  PilotDetails: { pilotId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Home" component={BottomTabNavigator} />
      <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="FindPilots" component={FindPilotsScreen} />
      <Stack.Screen name="PilotDetails" component={PilotDetailsScreen} />
    </Stack.Navigator>
  );
}
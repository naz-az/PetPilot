import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './Modal';
import { GlassInput } from './GlassInput';
import { GlassButton } from './GlassButton';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';
import { Service } from './ServiceCard';

interface Pet {
  id: string;
  name: string;
  species: string;
}

interface BookingFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingFormData) => void;
  service: Service | null;
  pets: Pet[];
  loading?: boolean;
}

export interface BookingFormData {
  serviceId: string;
  petId: string;
  date: string;
  time: string;
  notes: string;
  pickupAddress: string;
  dropoffAddress: string;
}

export default function BookingFormModal({
  visible,
  onClose,
  onSubmit,
  service,
  pets,
  loading = false,
}: BookingFormModalProps) {
  const [selectedPetId, setSelectedPetId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');

  useEffect(() => {
    if (visible && pets.length > 0) {
      setSelectedPetId(pets[0].id);
    }
  }, [visible, pets]);

  const resetForm = () => {
    setSelectedPetId(pets.length > 0 ? pets[0].id : '');
    setDate('');
    setTime('');
    setNotes('');
    setPickupAddress('');
    setDropoffAddress('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!service) return;

    if (!selectedPetId || !date || !time || !pickupAddress || !dropoffAddress) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    const bookingData: BookingFormData = {
      serviceId: service.id,
      petId: selectedPetId,
      date,
      time,
      notes,
      pickupAddress,
      dropoffAddress,
    };

    onSubmit(bookingData);
  };

  if (!service) return null;

  return (
    <Modal visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Service</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.serviceInfo}>
          <View style={styles.serviceHeader}>
            <Ionicons name={service.icon} size={24} color={Colors.primary} />
            <Text style={styles.serviceName}>{service.name}</Text>
          </View>
          <Text style={styles.servicePrice}>${service.price}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pet</Text>
          {pets.length > 0 ? (
            <View style={styles.petSelection}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petOption,
                    selectedPetId === pet.id && styles.selectedPetOption,
                  ]}
                  onPress={() => setSelectedPetId(pet.id)}
                >
                  <Text
                    style={[
                      styles.petOptionText,
                      selectedPetId === pet.id && styles.selectedPetOptionText,
                    ]}
                  >
                    {pet.name} ({pet.species})
                  </Text>
                  {selectedPetId === pet.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.noPetsText}>
              No pets found. Please add a pet first.
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <GlassInput
                placeholder="Date (MM/DD/YYYY)"
                value={date}
                onChangeText={setDate}
                autoCapitalize="none"
              />
            </View>
            <View style={styles.halfWidth}>
              <GlassInput
                placeholder="Time (HH:MM AM/PM)"
                value={time}
                onChangeText={setTime}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Addresses</Text>
          <GlassInput
            placeholder="Pickup Address *"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            multiline
            numberOfLines={2}
            style={styles.addressInput}
          />
          <GlassInput
            placeholder="Drop-off Address *"
            value={dropoffAddress}
            onChangeText={setDropoffAddress}
            multiline
            numberOfLines={2}
            style={styles.addressInput}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <GlassInput
            placeholder="Any special instructions or notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <GlassButton
          title="Cancel"
          onPress={handleClose}
          variant="secondary"
          style={styles.cancelButton}
        />
        <GlassButton
          title={loading ? 'Booking...' : 'Book Service'}
          onPress={handleSubmit}
          loading={loading}
          disabled={pets.length === 0 || loading}
          style={styles.submitButton}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.xl,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  content: {
    flex: 1,
    marginBottom: Layout.spacing.lg,
  },

  serviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Layout.spacing.lg,
  },

  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginLeft: Layout.spacing.sm,
  },

  servicePrice: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.primary,
  },

  section: {
    marginBottom: Layout.spacing.lg,
  },

  sectionTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },

  petSelection: {
    gap: Layout.spacing.sm,
  },

  petOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  selectedPetOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },

  petOptionText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
  },

  selectedPetOptionText: {
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },

  noPetsText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Layout.spacing.lg,
    fontStyle: 'italic',
  },

  row: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },

  halfWidth: {
    flex: 1,
  },

  addressInput: {
    marginBottom: Layout.spacing.md,
  },

  footer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
  },

  cancelButton: {
    flex: 1,
  },

  submitButton: {
    flex: 2,
  },
});
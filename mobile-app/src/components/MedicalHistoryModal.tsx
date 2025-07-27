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
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface MedicalRecord {
  id: string;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  medications: string[];
  cost?: number;
  vetName?: string;
  vetClinic?: string;
  visitDate: string;
  nextVisit?: string;
  documents: string[];
}

interface VetAppointment {
  id: string;
  title: string;
  description?: string;
  appointmentDate: string;
  duration?: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  vetName: string;
  vetClinic: string;
  vetPhone?: string;
  address?: string;
  notes?: string;
}

interface MedicalHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}

export const MedicalHistoryModal: React.FC<MedicalHistoryModalProps> = ({
  visible,
  onClose,
  petId,
  petName,
}) => {
  const [activeTab, setActiveTab] = useState<'records' | 'appointments'>('records');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<VetAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadMedicalData();
    }
  }, [visible, petId]);

  const loadMedicalData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockRecords: MedicalRecord[] = [
        {
          id: '1',
          title: 'Annual Checkup',
          description: 'Routine annual health examination',
          diagnosis: 'Healthy, mild hip dysplasia',
          treatment: 'Continue joint supplements, monitor activity',
          medications: ['Glucosamine supplement'],
          cost: 150.00,
          vetName: 'Dr. Sarah Johnson',
          vetClinic: 'Happy Paws Veterinary Clinic',
          visitDate: '2024-01-15',
          nextVisit: '2024-07-15',
          documents: [],
        },
        {
          id: '2',
          title: 'Vaccination Update',
          description: 'Annual vaccinations and health check',
          diagnosis: 'Healthy',
          treatment: 'Vaccinations administered',
          medications: [],
          cost: 120.00,
          vetName: 'Dr. Sarah Johnson',
          vetClinic: 'Happy Paws Veterinary Clinic',
          visitDate: '2023-06-15',
          nextVisit: '2024-06-15',
          documents: [],
        },
      ];

      const mockAppointments: VetAppointment[] = [
        {
          id: '1',
          title: 'Annual Checkup',
          description: 'Yearly health examination and vaccinations',
          appointmentDate: '2024-07-15T10:00:00Z',
          duration: 60,
          status: 'scheduled',
          vetName: 'Dr. Sarah Johnson',
          vetClinic: 'Happy Paws Veterinary Clinic',
          vetPhone: '+1-555-VET1',
          address: '456 Oak Ave, New York, NY 10002',
          notes: 'Bring vaccination records',
        },
        {
          id: '2',
          title: 'Dental Cleaning',
          description: 'Professional dental cleaning and examination',
          appointmentDate: '2024-03-15T14:00:00Z',
          duration: 90,
          status: 'completed',
          vetName: 'Dr. Emily Chen',
          vetClinic: 'Pet Dental Care',
          vetPhone: '+1-555-DEN1',
          address: '789 Pine St, New York, NY 10003',
          notes: 'Fasting required 12 hours before appointment',
        },
      ];

      setMedicalRecords(mockRecords);
      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error loading medical data:', error);
      Alert.alert('Error', 'Failed to load medical data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return Colors.warning;
      case 'confirmed': return Colors.primary;
      case 'in_progress': return Colors.info;
      case 'completed': return Colors.success;
      case 'cancelled': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const renderTabButton = (tab: 'records' | 'appointments', title: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={activeTab === tab ? Colors.primary : Colors.textSecondary}
      />
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderMedicalRecord = (record: MedicalRecord) => (
    <GlassCard key={record.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTitle}>{record.title}</Text>
        <Text style={styles.recordDate}>{formatDate(record.visitDate)}</Text>
      </View>

      {record.description && (
        <Text style={styles.recordDescription}>{record.description}</Text>
      )}

      <View style={styles.recordDetails}>
        {record.diagnosis && (
          <View style={styles.recordDetail}>
            <Text style={styles.detailLabel}>Diagnosis:</Text>
            <Text style={styles.detailText}>{record.diagnosis}</Text>
          </View>
        )}

        {record.treatment && (
          <View style={styles.recordDetail}>
            <Text style={styles.detailLabel}>Treatment:</Text>
            <Text style={styles.detailText}>{record.treatment}</Text>
          </View>
        )}

        {record.medications.length > 0 && (
          <View style={styles.recordDetail}>
            <Text style={styles.detailLabel}>Medications:</Text>
            <Text style={styles.detailText}>{record.medications.join(', ')}</Text>
          </View>
        )}
      </View>

      <View style={styles.recordFooter}>
        <View style={styles.vetInfo}>
          <Text style={styles.vetName}>{record.vetName}</Text>
          <Text style={styles.vetClinic}>{record.vetClinic}</Text>
        </View>
        {record.cost && (
          <Text style={styles.recordCost}>{formatCurrency(record.cost)}</Text>
        )}
      </View>
    </GlassCard>
  );

  const renderAppointment = (appointment: VetAppointment) => (
    <GlassCard key={appointment.id} style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTitle}>{appointment.title}</Text>
        <View style={[styles.statusBadge, { borderColor: getStatusColor(appointment.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Text>
        </View>
      </View>

      {appointment.description && (
        <Text style={styles.recordDescription}>{appointment.description}</Text>
      )}

      <View style={styles.appointmentDetails}>
        <View style={styles.appointmentDetail}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.appointmentDetailText}>
            {formatDate(appointment.appointmentDate)} at{' '}
            {new Date(appointment.appointmentDate).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>

        {appointment.duration && (
          <View style={styles.appointmentDetail}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentDetailText}>{appointment.duration} minutes</Text>
          </View>
        )}

        <View style={styles.appointmentDetail}>
          <Ionicons name="location-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.appointmentDetailText}>{appointment.address}</Text>
        </View>

        {appointment.vetPhone && (
          <View style={styles.appointmentDetail}>
            <Ionicons name="call-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.appointmentDetailText}>{appointment.vetPhone}</Text>
          </View>
        )}
      </View>

      {appointment.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      )}

      <View style={styles.recordFooter}>
        <View style={styles.vetInfo}>
          <Text style={styles.vetName}>{appointment.vetName}</Text>
          <Text style={styles.vetClinic}>{appointment.vetClinic}</Text>
        </View>
      </View>
    </GlassCard>
  );

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Medical History</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.petName}>{petName}</Text>

        <View style={styles.tabContainer}>
          {renderTabButton('records', 'Records', 'document-text-outline')}
          {renderTabButton('appointments', 'Appointments', 'calendar-outline')}
        </View>

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {activeTab === 'records' ? (
            medicalRecords.length > 0 ? (
              medicalRecords.map(renderMedicalRecord)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No medical records found</Text>
              </View>
            )
          ) : (
            appointments.length > 0 ? (
              appointments.map(renderAppointment)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No appointments scheduled</Text>
              </View>
            )
          )}
        </ScrollView>

        <View style={styles.footer}>
          <GlassButton
            title={activeTab === 'records' ? 'Add Record' : 'Schedule Appointment'}
            onPress={() => Alert.alert(
              activeTab === 'records' ? 'Add Medical Record' : 'Schedule Appointment',
              `${activeTab === 'records' ? 'Medical record management' : 'Appointment scheduling'} features will be available in the next update. You can currently view existing records and appointments.`
            )}
            style={styles.addButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: Layout.window.height * 0.9,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.md,
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

  petName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.semibold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },

  tabContainer: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.lg,
    backgroundColor: Colors.backgroundCard,
    borderRadius: Layout.radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
    borderRadius: Layout.radius.sm,
  },

  activeTabButton: {
    backgroundColor: Colors.primary + '20',
  },

  tabButtonText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: Fonts.mediumWeight,
  },

  activeTabButtonText: {
    color: Colors.primary,
    fontWeight: Fonts.semibold,
  },

  content: {
    flex: 1,
    maxHeight: 400,
  },

  contentContainer: {
    paddingBottom: Layout.spacing.lg,
  },

  recordCard: {
    marginBottom: Layout.spacing.md,
  },

  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },

  recordTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    flex: 1,
  },

  recordDate: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: Colors.backgroundCard,
  },

  statusText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.mediumWeight,
  },

  recordDescription: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.md,
  },

  recordDetails: {
    marginBottom: Layout.spacing.md,
  },

  recordDetail: {
    marginBottom: Layout.spacing.sm,
  },

  detailLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 2,
  },

  detailText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  appointmentDetails: {
    marginBottom: Layout.spacing.md,
  },

  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },

  appointmentDetailText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginLeft: Layout.spacing.xs,
    flex: 1,
  },

  notesSection: {
    marginBottom: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  notesLabel: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.semibold,
    color: Colors.text,
    marginBottom: 4,
  },

  notesText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  vetInfo: {
    flex: 1,
  },

  vetName: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
  },

  vetClinic: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
  },

  recordCost: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.primary,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.xl,
  },

  emptyStateText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },

  footer: {
    marginTop: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  addButton: {
    width: '100%',
  },
});
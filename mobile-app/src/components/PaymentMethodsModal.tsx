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
import { GlassInput } from './GlassInput';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  nickname?: string;
}

interface PaymentMethodsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaymentMethodsModal: React.FC<PaymentMethodsModalProps> = ({
  visible,
  onClose,
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    if (visible) {
      loadPaymentMethods();
    }
  }, [visible]);

  const loadPaymentMethods = async () => {
    try {
      // Mock payment methods - in real implementation, fetch from API
      const mockMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'credit',
          last4: '4567',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2027,
          isDefault: true,
          nickname: 'Primary Card',
        },
        {
          id: '2',
          type: 'debit',
          last4: '8901',
          brand: 'Mastercard',
          expiryMonth: 8,
          expiryYear: 2026,
          isDefault: false,
          nickname: 'Debit Card',
        },
        {
          id: '3',
          type: 'paypal',
          isDefault: false,
        },
      ];
      setPaymentMethods(mockMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      Alert.alert('Error', 'Failed to load payment methods');
    }
  };

  const getPaymentMethodIcon = (type: string, brand?: string) => {
    switch (type) {
      case 'credit':
      case 'debit':
        if (brand?.toLowerCase() === 'visa') return 'card';
        if (brand?.toLowerCase() === 'mastercard') return 'card';
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'apple_pay':
        return 'logo-apple';
      case 'google_pay':
        return 'logo-google';
      default:
        return 'card-outline';
    }
  };

  const getPaymentMethodColor = (type: string, brand?: string) => {
    switch (type) {
      case 'credit':
      case 'debit':
        if (brand?.toLowerCase() === 'visa') return '#1A1F71';
        if (brand?.toLowerCase() === 'mastercard') return '#EB001B';
        return Colors.primary;
      case 'paypal':
        return '#0070BA';
      case 'apple_pay':
        return '#000000';
      case 'google_pay':
        return '#4285F4';
      default:
        return Colors.primary;
    }
  };

  const handleSetDefault = async (methodId: string) => {
    try {
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method.id === methodId
        }))
      );
      Alert.alert('Success', 'Default payment method updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update default payment method');
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setPaymentMethods(prev => prev.filter(method => method.id !== methodId));
              Alert.alert('Success', 'Payment method removed');
            } catch (error) {
              Alert.alert('Error', 'Failed to remove payment method');
            }
          }
        }
      ]
    );
  };

  const handleAddCard = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Mock adding card - in real implementation, process with payment processor
      const newCard: PaymentMethod = {
        id: Date.now().toString(),
        type: 'credit',
        last4: cardNumber.slice(-4),
        brand: 'Visa', // Would be detected from card number
        expiryMonth: parseInt(expiryDate.split('/')[0]),
        expiryYear: parseInt('20' + expiryDate.split('/')[1]),
        isDefault: paymentMethods.length === 0,
        nickname: nickname || 'Card ending in ' + cardNumber.slice(-4),
      };

      setPaymentMethods(prev => [...prev, newCard]);
      
      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setNickname('');
      setShowAddCard(false);
      
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const renderPaymentMethod = (method: PaymentMethod) => (
    <GlassCard key={method.id} style={styles.paymentMethodCard}>
      <View style={styles.paymentMethodHeader}>
        <View style={styles.paymentMethodInfo}>
          <Ionicons
            name={getPaymentMethodIcon(method.type, method.brand) as any}
            size={24}
            color={getPaymentMethodColor(method.type, method.brand)}
          />
          <View style={styles.paymentMethodDetails}>
            <Text style={styles.paymentMethodTitle}>
              {method.nickname || `${method.brand} ending in ${method.last4}`}
            </Text>
            {method.last4 && (
              <Text style={styles.paymentMethodSubtitle}>
                {method.brand} •••• {method.last4} • {method.expiryMonth}/{method.expiryYear}
              </Text>
            )}
            {method.type === 'paypal' && (
              <Text style={styles.paymentMethodSubtitle}>PayPal Account</Text>
            )}
          </View>
        </View>
        
        <View style={styles.paymentMethodActions}>
          {method.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>DEFAULT</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // Show action sheet with options
              Alert.alert(
                'Payment Method Options',
                'What would you like to do?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  ...(method.isDefault ? [] : [{
                    text: 'Set as Default',
                    onPress: () => handleSetDefault(method.id)
                  }]),
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDeleteMethod(method.id)
                  }
                ]
              );
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Methods</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {paymentMethods.length > 0 ? (
            <View style={styles.paymentMethodsList}>
              {paymentMethods.map(renderPaymentMethod)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>No payment methods added</Text>
              <Text style={styles.emptyStateSubtext}>
                Add a payment method to book services easily
              </Text>
            </View>
          )}

          {showAddCard && (
            <GlassCard style={styles.addCardForm}>
              <Text style={styles.addCardTitle}>Add New Card</Text>
              
              <GlassInput
                placeholder="Card Number"
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="numeric"
                maxLength={19}
                style={styles.input}
              />
              
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <GlassInput
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <GlassInput
                    placeholder="CVV"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <GlassInput
                placeholder="Cardholder Name"
                value={cardholderName}
                onChangeText={setCardholderName}
                autoCapitalize="words"
                style={styles.input}
              />
              
              <GlassInput
                placeholder="Nickname (Optional)"
                value={nickname}
                onChangeText={setNickname}
                style={styles.input}
              />
              
              <View style={styles.addCardActions}>
                <GlassButton
                  title="Cancel"
                  onPress={() => setShowAddCard(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <GlassButton
                  title="Add Card"
                  onPress={handleAddCard}
                  loading={loading}
                  style={styles.addButton}
                />
              </View>
            </GlassCard>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <GlassButton
            title="Add Payment Method"
            onPress={() => setShowAddCard(true)}
            style={styles.addPaymentButton}
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
    flex: 1,
  },

  paymentMethodsList: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },

  paymentMethodCard: {
    padding: Layout.spacing.md,
  },

  paymentMethodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  paymentMethodDetails: {
    marginLeft: Layout.spacing.md,
    flex: 1,
  },

  paymentMethodTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    fontWeight: Fonts.semibold,
    color: Colors.text,
  },

  paymentMethodSubtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  paymentMethodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },

  defaultBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },

  defaultBadgeText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  actionButton: {
    padding: Layout.spacing.xs,
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

  emptyStateSubtext: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
    opacity: 0.7,
  },

  addCardForm: {
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },

  addCardTitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },

  input: {
    marginBottom: Layout.spacing.md,
  },

  row: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },

  halfWidth: {
    flex: 1,
  },

  addCardActions: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
  },

  cancelButton: {
    flex: 1,
  },

  addButton: {
    flex: 1,
  },

  footer: {
    marginTop: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  addPaymentButton: {
    width: '100%',
  },
});
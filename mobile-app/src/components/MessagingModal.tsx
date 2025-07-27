import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from './Modal';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { Layout } from '../constants/Layout';

interface Message {
  id: string;
  message: string;
  isFromPilot: boolean;
  timestamp: string;
}

interface MessagingModalProps {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  pilotName?: string;
  petName?: string;
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  visible,
  onClose,
  bookingId,
  pilotName = 'Pilot',
  petName = 'Pet',
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      loadMessages();
    }
  }, [visible, bookingId]);

  const loadMessages = async () => {
    try {
      // Mock messages - in real implementation, fetch from API
      const mockMessages: Message[] = [
        {
          id: '1',
          message: `Hi! I'm on my way to pick up ${petName}. ETA 10 minutes.`,
          isFromPilot: true,
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        },
        {
          id: '2',
          message: `Great! ${petName} is ready and waiting by the door.`,
          isFromPilot: false,
          timestamp: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
        },
        {
          id: '3',
          message: 'Perfect! I\'m pulling up now. Blue van with license plate PET-002.',
          isFromPilot: true,
          timestamp: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    try {
      // Mock sending message - in real implementation, send to API
      const message: Message = {
        id: Date.now().toString(),
        message: messageText,
        isFromPilot: false,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, message]);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Mock pilot response after delay
      setTimeout(() => {
        const pilotResponse: Message = {
          id: (Date.now() + 1).toString(),
          message: 'Message received! Thanks for the update.',
          isFromPilot: true,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, pilotResponse]);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isFromPilot ? styles.pilotMessage : styles.userMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          message.isFromPilot ? styles.pilotBubble : styles.userBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          message.isFromPilot ? styles.pilotText : styles.userText,
        ]}>
          {message.message}
        </Text>
        <Text style={[
          styles.timestamp,
          message.isFromPilot ? styles.pilotTimestamp : styles.userTimestamp,
        ]}>
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.pilotAvatar}>
              <Ionicons name="person" size={20} color={Colors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>{pilotName}</Text>
              <Text style={styles.subtitle}>Booking #{bookingId.slice(-6)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length > 0 ? (
              messages.map(renderMessage)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={48} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>No messages yet</Text>
                <Text style={styles.emptyStateSubtext}>Start a conversation with your pilot</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.textSecondary}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.sendButton, (!newMessage.trim() || loading) && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!newMessage.trim() || loading}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newMessage.trim() ? Colors.text : Colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    marginBottom: Layout.spacing.sm,
  },

  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pilotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.large,
    fontWeight: Fonts.bold,
    color: Colors.text,
  },

  subtitle: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  closeButton: {
    padding: Layout.spacing.xs,
  },

  chatContainer: {
    maxHeight: Layout.window.height * 0.6,
  },

  messagesContainer: {
    flex: 1,
    paddingHorizontal: Layout.spacing.xs,
  },

  messagesContent: {
    paddingVertical: Layout.spacing.sm,
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

  messageContainer: {
    marginBottom: Layout.spacing.md,
  },

  pilotMessage: {
    alignItems: 'flex-start',
  },

  userMessage: {
    alignItems: 'flex-end',
  },

  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: 16,
  },

  pilotBubble: {
    backgroundColor: Colors.backgroundCard,
    borderBottomLeftRadius: 4,
  },

  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },

  messageText: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    lineHeight: 20,
  },

  pilotText: {
    color: Colors.text,
  },

  userText: {
    color: Colors.text,
  },

  timestamp: {
    fontFamily: Fonts.primary,
    fontSize: Fonts.small,
    marginTop: 4,
  },

  pilotTimestamp: {
    color: Colors.textSecondary,
  },

  userTimestamp: {
    color: Colors.text,
    opacity: 0.8,
  },

  inputContainer: {
    paddingTop: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  textInput: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 20,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    marginRight: Layout.spacing.sm,
    fontFamily: Fonts.primary,
    fontSize: Fonts.regular,
    color: Colors.text,
    maxHeight: 100,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: Colors.backgroundCard,
  },
});
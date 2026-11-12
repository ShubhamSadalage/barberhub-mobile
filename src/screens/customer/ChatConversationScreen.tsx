import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { HubConnection } from '@microsoft/signalr';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '@/navigation/customerTypes';
import { chatApi } from '@/api/endpoints/social';
import { createHubConnection } from '@/realtime/signalr';
import { HUB_URLS } from '@/config/env';
import { useAuth } from '@/auth/AuthContext';
import type { ChatMessageDto } from '@/types/api';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatConversation'>;

export default function ChatConversationScreen({ route, navigation }: Props) {
  const { otherUserId, otherUserName } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const connectionRef = useRef<HubConnection | null>(null);
  const listRef = useRef<FlatList>(null);
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    navigation.setOptions({ title: otherUserName });
  }, [otherUserName]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const history = await chatApi.conversation(otherUserId);
      if (isMounted) {
        setMessages(history.messages);
        setLoading(false);
      }
    })();

    const connection = createHubConnection(HUB_URLS.chat);

    connection.on('ReceiveMessage', (msg: ChatMessageDto) => {
      if (msg.senderId === otherUserId) {
        setMessages((prev) => [...prev, msg]);
        connection.invoke('MarkRead', otherUserId).catch(() => {});
      }
    });
    connection.on('MessageSent', (msg: ChatMessageDto) => {
      setMessages((prev) => [...prev, msg]);
    });

    connection.start()
      .then(() => connection.invoke('MarkRead', otherUserId))
      .catch((err) => console.warn('Chat hub connect failed', err));

    connectionRef.current = connection;

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, [otherUserId]);

  function send() {
    const content = draft.trim();
    if (!content || !connectionRef.current) return;
    connectionRef.current.invoke('SendMessage', otherUserId, content).catch(() => {});
    setDraft('');
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    // Android draws edge-to-edge, so adjustResize no longer shrinks the window — pad on both platforms.
    <KeyboardAvoidingView style={styles.flex} behavior="padding" keyboardVerticalOffset={headerHeight}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const mine = item.senderId === user?.id;
          return (
            <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={mine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.content}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          placeholder="Type a message…"
          placeholderTextColor={colors.textSubtle}
          multiline
        />
        <Pressable onPress={send} style={({ pressed }) => [styles.sendButton, pressed && styles.sendButtonPressed]}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  bubbleRow: { marginBottom: 10, flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: borderRadius.md, paddingHorizontal: 15, paddingVertical: 10 },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
    ...shadows.primaryGlow,
  },
  bubbleTheirs: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  bubbleTextMine: { color: '#ffffff', fontSize: 14, lineHeight: 20 },
  bubbleTextTheirs: { color: colors.text, fontSize: 14, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    backgroundColor: colors.background,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.primaryGlow,
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
  sendButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});

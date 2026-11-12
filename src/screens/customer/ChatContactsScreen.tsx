import React from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '@/navigation/customerTypes';
import { chatApi } from '@/api/endpoints/social';
import { colors, shadows, borderRadius } from '@/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatContacts'>;

export default function ChatContactsScreen({ navigation }: Props) {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['chat-contacts'],
    queryFn: () => chatApi.contacts(),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={data ?? []}
      keyExtractor={(c) => c.userId}
      onRefresh={refetch}
      refreshing={isFetching}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>You can chat directly with barbers from their shop profiles.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => navigation.navigate('ChatConversation', { otherUserId: item.userId, otherUserName: item.fullName })}
        >
          {item.profileImageUrl ? (
            <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
            </View>
          )}
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.name}>{item.fullName}</Text>
            {item.lastMessage ? (
              <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
            ) : (
              <Text style={styles.lastMessageEmpty}>Tap to start messaging</Text>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
            {item.lastMessageAt && (
              <Text style={styles.time}>{format(new Date(item.lastMessageAt), 'HH:mm')}</Text>
            )}
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  emptyBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: borderRadius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  rowPressed: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primaryTint,
  },
  avatar: { width: 52, height: 52, borderRadius: borderRadius.full, backgroundColor: colors.primarySoft },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.primary },
  name: { fontWeight: '700', color: colors.text, fontSize: 15 },
  lastMessage: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  lastMessageEmpty: { color: colors.primary, fontSize: 12, marginTop: 3, fontStyle: 'italic' },
  time: { fontSize: 11, color: colors.textSubtle, fontWeight: '500' },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    ...shadows.primaryGlow,
  },
  unreadText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
});

import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { setActiveUser } from '@/src/state/slices/accountInfo';
import { useDispatch } from 'react-redux';
import { PlayMyJamProfile } from '@/constants/Types';
import { AI_DOCTOR } from '@/src/data/dummyDoctors';
import useMessageList, { ChatPreview } from '@/src/hooks/useMessageList';

export default function MessagesScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { chatPreviews, loading, refreshing, onRefresh, formatTime } = useMessageList();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter chat previews based on search query
  const filteredChatPreviews = useMemo(() => {
    if (!searchQuery.trim()) return chatPreviews;

    return chatPreviews.filter(chat =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chatPreviews, searchQuery]);

  // Navigate to chat screen
  const handleChatPress = useCallback((chatPreview: ChatPreview) => {
    // Special handling for AI doctor
    if (chatPreview.userId === 'ai-doctor') {
      dispatch(setActiveUser(AI_DOCTOR));
      router.push('/chat/chat');
      return;
    }

    // Use the complete user details fetched from getUserById
    if (chatPreview.userDetails) {
      // Set the complete user details as active user
      dispatch(setActiveUser(chatPreview.userDetails));
      router.push('/chat/chat');
    } else {
      // Fallback if userDetails is not available
      const fallbackUser: PlayMyJamProfile = {
        userId: chatPreview.userId,
        fname: chatPreview.name,
        avatar: chatPreview.avatar,
        isAI: chatPreview.isAI,
        isDoctor: false,
        deleted: false,
      };

      dispatch(setActiveUser(fallbackUser));
      router.push('/chat/chat');
    }
  }, [dispatch, router]);

  // Render chat item
  const renderChatItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
        {item.isAI && (
          <View style={styles.aiIndicator}>
            <Ionicons name="sparkles" size={12} color={colors.white} />
          </View>
        )}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.chatTime}>
            {formatTime(item.lastMessageTime)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={80} color="rgba(255, 255, 255, 0.3)" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No Results Found' : 'No Messages Yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? `No conversations found for "${searchQuery}"`
          : 'Start a conversation with a doctor or AI assistant'
        }
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.tertiary, colors.tertiary, colors.green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'Messages',
          headerTitleStyle: {
            fontFamily: 'fontBold',
            color: colors.white,
            fontSize: 20,
          },
          headerTintColor: colors.white,
        }}
      />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredChatPreviews}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.userId}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.white}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 100, // Space for header
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.white,
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.white,
  },
  aiIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 10,
  },
  unreadText: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'fontBold',
    color: colors.white,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.white,
    marginTop: 15,
  },
});

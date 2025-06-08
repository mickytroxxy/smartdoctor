import { Platform, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import React, { useCallback } from 'react'
import { Bubble, Day, GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat'
import useChat from "@/src/hooks/useChat";
import useAuth from "@/src/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from 'react-native-animatable';
import { colors } from "@/constants/Colors";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView, TouchableOpacity } from "react-native-gesture-handler";

export default function ChatScreen() {
  const {accountInfo, activeUser} = useAuth();
  const router = useRouter();
  const {messages, onSend, sendPhoto, isTyping, isOnline} = useChat();


  const renderBubble = useCallback((props: any) => {
    const isUser = props.position === 'right';
    const animationType = isUser ? 'fadeInRight' : 'fadeInLeft';

    return (
      <Animatable.View
        animation={animationType}
        duration={500}
        delay={300}
        useNativeDriver
      >
        <Bubble
          {...props}
          wrapperStyle={{
            right: {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 18,
              padding: 5,
              marginBottom: 2, // Reduced from 8 to 2
              marginTop: 2,    // Added to maintain consistent spacing
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderTopRightRadius: 0
            },
            left: {
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 18,
              padding: 5,
              marginBottom: 2, // Reduced from 8 to 2
              marginTop: 2,    // Added to maintain consistent spacing
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderBottomLeftRadius: 0
            },
          }}
          textStyle={{
            right: {
              color: colors.white,
              fontFamily: 'fontBold',
              fontSize: 12,
            },
            left: {
              color: colors.white,
              fontFamily: 'fontBold',
              fontSize: 12,
            },
          }}
        />
      </Animatable.View>
    );
  }, []);

  // Render send button with animation
  const renderSend = useCallback((props: any) => {
    return (
      <Send
        {...props}
        containerStyle={styles.sendContainer}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={styles.sendButton}
        >
          <Ionicons name="send" size={20} color={colors.white} />
        </Animatable.View>
      </Send>
    );
  }, []);

  // Render input toolbar with better styling
  const renderInputToolbar = useCallback((props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
        textInputStyle={styles.textInput}
      />
    );
  }, []);

  // Render day component - only show date once per day
  const renderDay = useCallback((props: any) => {
    return (
      <Animatable.View animation="fadeIn" duration={500}>
        <Day
          {...props}
          textStyle={styles.dayText}
          wrapperStyle={styles.dayContainer}
          dateFormat="MMMM D, YYYY"
        />
      </Animatable.View>
    );
  }, []);

  // Render footer with typing indicator
  const renderFooter = () => {
    if (isTyping) {
      return (
        <Animatable.View
          animation="fadeIn"
          style={styles.typingContainer}
          iterationCount={1}
          duration={500}
        >
          <Text style={styles.typingText}>
            {activeUser?.fname }is typing...
          </Text>
          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            duration={1000}
            style={styles.typingDot}
          />
          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            duration={1000}
            delay={250}
            style={styles.typingDot}
          />
          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            duration={1000}
            delay={500}
            style={styles.typingDot}
          />
        </Animatable.View>
      );
    }
    return null;
  };

  const renderActions = useCallback(() => (
    <TouchableOpacity onPress={sendPhoto} style={{ marginLeft: 8, marginBottom: 5 }}>
      <Ionicons name="image" size={28} color="#fff" />
    </TouchableOpacity>
  ), [sendPhoto]);

  return(
    <GestureHandlerRootView style={{flex:1,backgroundColor:colors.tertiary}}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <View>
              <Text style={styles.headerTitle}>{activeUser?.fname}</Text>
              <View style={styles.onlineStatusContainer}>
                <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? '#4CAF50' : '#757575' }]} />
                <Text style={styles.onlineStatusText}>{isOnline ? 'Online' : 'Offline'}</Text>
              </View>
            </View>
          ),
          headerTitleStyle: {
            fontFamily: 'fontBold',
            color: colors.white,
            fontSize: 20
          },
          headerRight: () => (
            <TouchableOpacity
              //style={styles.backButton}
              onPress={() => router.push(activeUser?.isAI ? '/AICall' : '/DoctorCall')}
            >
              <Ionicons name="call" size={24} color={colors.white} />
            </TouchableOpacity>
          ),
        }}
      />
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: accountInfo?.userId || 'user',
          name: accountInfo?.fname || 'You',
          avatar: accountInfo?.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
        }}
        renderBubble={renderBubble}
        renderSend={renderSend}
        renderInputToolbar={renderInputToolbar}
        renderDay={renderDay}
        renderFooter={renderFooter}
        alwaysShowSend
        scrollToBottom
        renderAvatar={null}
        showUserAvatar={false}
        showAvatarForEveryMessage={false}
        inverted={true}

        minInputToolbarHeight={60}
        dateFormat="MMMM D, YYYY"
        maxComposerHeight={100}
        bottomOffset={Platform.OS === 'ios' ? 10 : 0}
        messagesContainerStyle={{
          paddingBottom: 10,
        }}
        timeTextStyle={{
          right: { color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'fontLight' },
          left: { color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'fontLight' }
        }}
        listViewProps={{
          style: {
            backgroundColor: 'transparent',
          },
          contentContainerStyle: {
            paddingVertical: 10,
          },
          initialNumToRender: 10,
          windowSize: 10,
        }}
        renderActions={renderActions}
    />
    </GestureHandlerRootView>
  )  
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 60, // Add space for the header
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  onlineStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  onlineStatusText: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    fontFamily: 'fontLight',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputToolbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 24,
    marginHorizontal: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputPrimary: {
    alignItems: 'center',
  },
  textInput: {
    fontFamily: 'fontLight',
    fontSize: 16,
    color: colors.white,
    marginLeft: 5,
    marginRight: 5,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  dayContainer: {
    marginVertical: 10, // Reduced from 20 to 10
    paddingHorizontal: 15,
  },
  dayText: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    marginBottom: 10,
  },
  typingText: {
    color: colors.white,
    fontFamily: 'fontLight',
    fontSize: 12,
    marginRight: 5,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.white,
    marginHorizontal: 2,
  },
});
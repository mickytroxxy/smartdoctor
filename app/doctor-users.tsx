import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/Colors';
import UserManagement from '@/components/doctor/UserManagement';
import CreateUser from '@/components/doctor/CreateUser';
import useAuth from '@/src/hooks/useAuth';
import { PlayMyJamProfile } from '@/constants/Types';

const DoctorUsersScreen = () => {
  const { accountInfo } = useAuth();
  const [showCreateUser, setShowCreateUser] = useState(false);

  const handleCreateUser = () => {
    setShowCreateUser(true);
  };

  const handleUserCreated = (user: PlayMyJamProfile) => {
    setShowCreateUser(false);
    // The UserManagement component will refresh automatically
  };

  const handleCancelCreate = () => {
    setShowCreateUser(false);
  };

  // Only allow doctors to access this screen
  if (!accountInfo?.isDoctor) {
    return null;
  }

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
          headerTitle: 'Staff Management',
          headerTitleStyle: {
            fontFamily: 'fontBold',
            color: colors.white,
            fontSize: 18,
          },
          headerTintColor: colors.white,
        }}
      />

      <View style={styles.content}>
        <UserManagement onCreateUser={handleCreateUser} />
      </View>

      <Modal
        visible={showCreateUser}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelCreate}
      >
        <CreateUser
          onUserCreated={handleUserCreated}
          onCancel={handleCancelCreate}
        />
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    marginTop: 100, // Account for header
    backgroundColor: colors.faintGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
});

export default DoctorUsersScreen;

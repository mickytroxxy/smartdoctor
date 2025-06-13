import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { LinearButton } from '@/components/ui/Button';
import useAuth from '@/src/hooks/useAuth';
import { 
  getDoctorManagedUsers, 
  toggleUserActiveStatus, 
  deleteDoctorManagedUser 
} from '@/src/helpers/api';
import { PlayMyJamProfile } from '@/constants/Types';
import { showToast, sendWhatsAppLoginDetails } from '@/src/helpers/methods';

interface UserManagementProps {
  onCreateUser: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onCreateUser }) => {
  const { accountInfo } = useAuth();
  const [users, setUsers] = useState<PlayMyJamProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    if (!accountInfo?.userId) return;
    
    try {
      const managedUsers = await getDoctorManagedUsers(accountInfo.userId);
      setUsers(managedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accountInfo?.userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'disable' : 'enable';
    
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              const success = await toggleUserActiveStatus(userId, !currentStatus);
              if (success) {
                setUsers(prev => 
                  prev.map(user => 
                    user.userId === userId 
                      ? { ...user, isActive: !currentStatus }
                      : user
                  )
                );
                showToast(`User ${action}d successfully`);
              } else {
                showToast(`Failed to ${action} user`);
              }
            } catch (error) {
              console.error(`Error ${action}ing user:`, error);
              showToast(`Failed to ${action} user`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteDoctorManagedUser(userId);
              if (success) {
                setUsers(prev => prev.filter(user => user.userId !== userId));
                showToast('User deleted successfully');
              } else {
                showToast('Failed to delete user');
              }
            } catch (error) {
              console.error('Error deleting user:', error);
              showToast('Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleSendLogin = (user: PlayMyJamProfile) => {
    if (!user.phoneNumber || !user.doctorUserCode || !accountInfo?.userId) {
      showToast('Missing required information to send login details');
      return;
    }

    Alert.alert(
      'Send Login Details',
      `Send WhatsApp message with login details to ${user.fname}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            try {
              sendWhatsAppLoginDetails(
                user.phoneNumber || '',
                accountInfo.userId,
                user.doctorUserCode || '',
                user.fname || '',
                accountInfo.fname || 'Doctor'
              );
              showToast('WhatsApp message sent successfully');
            } catch (error) {
              console.error('Error sending WhatsApp message:', error);
              showToast('Failed to send WhatsApp message');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }: { item: PlayMyJamProfile }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.fname?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.fname}</Text>
            <Text style={styles.userRole}>{item.role || 'Staff'}</Text>
            <Text style={styles.userCode}>User ID: {item.userId}</Text>
            <Text style={styles.userPhone}>{item.phoneNumber}</Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: item.isActive ? colors.green : colors.tomato }
          ]}>
            <Text style={styles.statusText}>
              {item.isActive ? 'Active' : 'Disabled'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.sendLoginButton]}
          onPress={() => handleSendLogin(item)}
        >
          <Ionicons name="send" size={16} color={colors.white} />
          <Text style={styles.actionButtonText}>Send Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleStatus(item.userId || '', item.isActive || false)}
        >
          <Ionicons
            name={item.isActive ? 'pause-circle' : 'play-circle'}
            size={16}
            color={colors.white}
          />
          <Text style={styles.actionButtonText}>
            {item.isActive ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteUser(item.userId || '', item.fname || 'User')}
        >
          <Ionicons name="trash" size={16} color={colors.white} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={colors.grey} />
      <Text style={styles.emptyTitle}>No Staff Created</Text>
      <Text style={styles.emptySubtitle}>
        Create your first staff account to get started
      </Text>
      <TouchableOpacity style={styles.createFirstButton} onPress={onCreateUser}>
        <Text style={styles.createFirstButtonText}>Add First User</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Staff Members</Text>
          <Text style={styles.subtitle}>{users.length} staff created</Text>
        </View>

        <LinearButton
          handleBtnClick={onCreateUser}
          textInfo={{ text: 'Add User', color: colors.primary }}
          iconInfo={{ type: 'Ionicons', name: 'person-add', size: 20, color: colors.primary }}
          btnInfo={{ styles: styles.createButton }}
        />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.userId || ''}
        renderItem={renderUserItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={users.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.faintGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.faintGray,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'fontBold',
    color: colors.tertiary,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginTop: 4,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.faintGray,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.green,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  userCode: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.primary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  sendLoginButton: {
    backgroundColor: colors.green,
  },
  toggleButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.tomato,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createFirstButtonText: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.white,
  },
});

export default UserManagement;

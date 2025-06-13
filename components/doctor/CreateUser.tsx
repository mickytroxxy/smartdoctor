import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import TextArea from '@/components/ui/TextArea';
import { LinearButton } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import useAuth from '@/src/hooks/useAuth';
import { createDoctorManagedUser } from '@/src/helpers/api';
import { sendWhatsAppLoginDetails, showToast } from '@/src/helpers/methods';
import { PlayMyJamProfile } from '@/constants/Types';

interface CreateUserProps {
  onUserCreated: (user: PlayMyJamProfile) => void;
  onCancel: () => void;
}

const CreateUser: React.FC<CreateUserProps> = ({ onUserCreated, onCancel }) => {
  const { accountInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fname: '',
    phoneNumber: '',
    role: '',
  });

  const roleOptions = [
    { id: 'receptionist', label: 'Receptionist', selected: false },
    { id: 'assistant', label: 'Medical Assistant', selected: false },
    { id: 'nurse', label: 'Nurse', selected: false },
    { id: 'admin', label: 'Administrator', selected: false },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (item: any) => {
    setFormData(prev => ({
      ...prev,
      role: item.id
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.fname.trim()) {
      showToast('Please enter staff member name');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      showToast('Please enter phone number');
      return false;
    }
    if (formData.phoneNumber.length < 10) {
      showToast('Please enter a valid phone number');
      return false;
    }
    if (!formData.role) {
      showToast('Please select role');
      return false;
    }
    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userData: Partial<PlayMyJamProfile> = {
        fname: formData.fname.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        role: formData.role, // Store the role (receptionist, assistant, etc.)
        isDoctor: false,
        isAI: false,
        balance: 0,
      };

      const newUser = await createDoctorManagedUser(accountInfo?.userId || '', userData);
      
      if (newUser) {
        // Show success message with login details
        Alert.alert(
          'Staff Member Created Successfully',
          `Name: ${newUser.fname}\nRole: ${newUser.role}\nDoctor ID: ${accountInfo?.userId}\nUser ID: ${newUser.doctorUserCode}\n\nWould you like to send login details via WhatsApp?`,
          [
            {
              text: 'Skip',
              style: 'cancel',
              onPress: () => {
                showToast('Staff member created successfully');
                onUserCreated(newUser);
              }
            },
            {
              text: 'Send WhatsApp',
              onPress: () => {
                sendWhatsAppLoginDetails(
                  newUser.phoneNumber || '',
                  accountInfo?.userId || '',
                  newUser.doctorUserCode || '',
                  newUser.fname || '',
                  accountInfo?.fname || 'Doctor'
                );
                showToast('Staff member created and WhatsApp message sent');
                onUserCreated(newUser);
              }
            }
          ]
        );
      } else {
        showToast('Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showToast('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Ionicons name="person-add" size={24} color={colors.primary} />
        <Text style={styles.title}>Add New Staff Member</Text>
      </View>

      <View style={styles.form}>
        <TextArea
          attr={{
            icon: { name: 'person', type: 'Ionicons', color: colors.primary },
            placeholder: 'Full Name *',
            field: 'fname',
            value: formData.fname,
            handleChange: handleChange,
          }}
        />

        <TextArea
          attr={{
            icon: { name: 'call', type: 'Ionicons', color: colors.primary },
            placeholder: 'Phone Number *',
            field: 'phoneNumber',
            value: formData.phoneNumber,
            handleChange: handleChange,
            keyboardType: 'phone-pad',
          }}
        />

        <View style={styles.dropdownContainer}>
          <Dropdown
            itemList={roleOptions}
            onChange={handleRoleChange}
            placeholder="Select Role *"
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          A unique Doctor ID and User ID will be generated for this staff member.
          You can send these login details via WhatsApp after creation.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <LinearButton
          handleBtnClick={handleCreateUser}
          textInfo={{
            text: loading ? 'Creating...' : 'Add Staff Member',
            color: colors.primary
          }}
          iconInfo={{
            type: 'Ionicons',
            name: 'person-add',
            size: 20,
            color: colors.primary
          }}
          btnInfo={{
            styles: [styles.createButton, loading && styles.disabledButton]
          }}
        />

        <LinearButton
          handleBtnClick={onCancel}
          textInfo={{ text: 'Cancel', color: colors.primary }}
          iconInfo={{
            type: 'Ionicons',
            name: 'close',
            size: 20,
            color: colors.primary
          }}
          btnInfo={{ styles: styles.cancelButton }}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Creating staff account...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.faintGray,
  },
  title: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginLeft: 12,
  },
  form: {
    padding: 20,
  },
  dropdownContainer: {
    marginTop: 10,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.faintGray,
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginLeft: 8,
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginTop: 12,
  },
});

export default CreateUser;

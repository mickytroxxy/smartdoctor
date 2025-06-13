import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import TextArea from '@/components/ui/TextArea';
import { LinearButton } from '@/components/ui/Button';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import useAuth from '@/src/hooks/useAuth';
import { uploadFile, updateData } from '@/src/helpers/api';
import { showToast } from '@/src/helpers/methods';
import { useDispatch } from 'react-redux';
import { setAccountInfo } from '@/src/state/slices/accountInfo';

interface MedicalAidProps {
  onUpdate?: () => void;
}

const MedicalAid: React.FC<MedicalAidProps> = ({ onUpdate }) => {
  const { accountInfo } = useAuth();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    provider: accountInfo?.medicalAid?.provider || '',
    memberNumber: accountInfo?.medicalAid?.memberNumber || '',
  });
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      showToast('Error selecting document');
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedDocument({
          uri: result.assets[0].uri,
          name: 'medical_aid_card.jpg',
          type: 'image/jpeg',
          size: result.assets[0].fileSize || 0,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Error selecting image');
    }
  };

  const showDocumentPicker = () => {
    Alert.alert(
      'Select Medical Aid Document',
      'Choose how you want to upload your medical aid card',
      [
        { text: 'Camera Roll', onPress: pickImage },
        { text: 'Files', onPress: pickDocument },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.provider.trim() || !formData.memberNumber.trim()) {
      showToast('Please fill in all required fields');
      return;
    }

    if (!selectedDocument && !accountInfo?.medicalAid?.documentUrl) {
      showToast('Please upload your medical aid card');
      return;
    }

    setLoading(true);
    try {
      let documentUrl = accountInfo?.medicalAid?.documentUrl || '';

      // Upload new document if selected
      if (selectedDocument) {
        const uploadPath = `medical-aid-documents/${accountInfo?.userId}_${Date.now()}`;
        const uploadResult = await uploadFile(selectedDocument.uri, uploadPath);
        if (uploadResult) {
          documentUrl = uploadResult;
        } else {
          throw new Error('Failed to upload document');
        }
      }

      // Update user data
      const medicalAidData = {
        provider: formData.provider.trim(),
        memberNumber: formData.memberNumber.trim(),
        documentUrl,
        isVerified: false, // Will be verified by admin
        uploadedAt: Date.now(),
      };

      await updateData('users', accountInfo?.userId || '', {
        field: 'medicalAid',
        value: medicalAidData
      });

      // Update local account info
      dispatch(setAccountInfo({
        ...accountInfo,
        medicalAid: medicalAidData
      }));

      showToast('Medical aid information saved successfully');
      onUpdate?.();
    } catch (error) {
      console.error('Error saving medical aid:', error);
      showToast('Failed to save medical aid information');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    Alert.alert(
      'Remove Medical Aid',
      'Are you sure you want to remove your medical aid information?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await updateData('users', accountInfo?.userId || '', {
                field: 'medicalAid',
                value: null
              });

              // Update local account info
              dispatch(setAccountInfo({
                ...accountInfo,
                medicalAid: undefined
              }));

              setFormData({ provider: '', memberNumber: '' });
              setSelectedDocument(null);
              showToast('Medical aid information removed');
              onUpdate?.();
            } catch (error) {
              console.error('Error removing medical aid:', error);
              showToast('Failed to remove medical aid information');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="medical" size={24} color={colors.primary} />
        <Text style={styles.title}>Medical Aid Information</Text>
      </View>

      {accountInfo?.medicalAid?.isVerified && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.green} />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      )}

      <TextArea
        attr={{
          icon: { name: 'business', type: 'Ionicons', color: colors.primary },
          placeholder: 'Medical Aid Provider',
          field: 'provider',
          value: formData.provider,
          handleChange: handleChange,
        }}
      />

      <TextArea
        attr={{
          icon: { name: 'card', type: 'Ionicons', color: colors.primary },
          placeholder: 'Member Number',
          field: 'memberNumber',
          value: formData.memberNumber,
          handleChange: handleChange,
        }}
      />

      <View style={styles.documentSection}>
        <Text style={styles.documentLabel}>Medical Aid Card</Text>
        
        {(selectedDocument || accountInfo?.medicalAid?.documentUrl) ? (
          <View style={styles.documentPreview}>
            {selectedDocument?.uri && (
              <Image source={{ uri: selectedDocument.uri }} style={styles.documentImage} />
            )}
            <Text style={styles.documentName}>
              {selectedDocument?.name || 'Medical Aid Card'}
            </Text>
            <TouchableOpacity onPress={showDocumentPicker} style={styles.changeButton}>
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={showDocumentPicker} style={styles.uploadButton}>
            <Ionicons name="cloud-upload" size={24} color={colors.primary} />
            <Text style={styles.uploadText}>Upload Medical Aid Card</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <LinearButton
          handleBtnClick={handleSave}
          textInfo={{ text: loading ? 'Saving...' : 'Save Medical Aid', color: colors.primary }}
          iconInfo={{ type: 'Ionicons', name: 'save', size: 20, color: colors.primary }}
        />
        
        {accountInfo?.medicalAid && (
          <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Remove Medical Aid</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop:16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginLeft: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.faintGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.green,
    marginLeft: 4,
  },
  documentSection: {
    marginTop: 16,
  },
  documentLabel: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.primary,
    marginTop: 8,
  },
  documentPreview: {
    borderWidth: 1,
    borderColor: colors.faintGray,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  documentImage: {
    width: 100,
    height: 60,
    borderRadius: 4,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginBottom: 8,
  },
  changeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  changeButtonText: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  buttonContainer: {
    marginTop: 20,
  },
  removeButton: {
    marginTop: 12,
    padding: 12,
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tomato,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});

export default MedicalAid;

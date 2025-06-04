import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import useMedicalHistory from '@/src/hooks/useMedicalHistory';
import TextArea from '@/components/ui/TextArea';
import { LinearButton } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

export default function MedicalHistoryScreen() {
  const router = useRouter();
  const {
    medicalHistory,
    loading,
    saving,
    saveMedicalHistory,
    updateBasicInfo,
    isHistoryComplete,
  } = useMedicalHistory();

  const [activeTab, setActiveTab] = useState<'basic' | 'medical'>('basic');

  const handleSave = async () => {
    if (!medicalHistory) return;

    const success = await saveMedicalHistory(medicalHistory);
    if (success) {
      router.back();
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    if (!medicalHistory) return;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentObj = medicalHistory[parent as keyof typeof medicalHistory];
      if (typeof parentObj === 'object' && parentObj !== null) {
        updateBasicInfo({
          [parent]: {
            ...parentObj,
            [child]: value,
          },
        });
      }
    } else {
      updateBasicInfo({ [field]: value });
    }
  };

  if (false) {
    return (
      <LinearGradient
        colors={[colors.tertiary, colors.tertiary, colors.green]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading medical history...</Text>
        </View>
      </LinearGradient>
    );
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
          headerTitle: 'Medical History',
          headerTitleStyle: {
            fontFamily: 'fontBold',
            color: colors.white,
            fontSize: 20,
          },
          headerTintColor: colors.white,
        }}
      />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {/* Professional Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerIcon}>
            <Ionicons name="medical" size={32} color={colors.white} />
          </View>
          <Text style={styles.headerTitle}>Medical History</Text>
          <Text style={styles.headerSubtitle}>
            Keep your medical information up to date for better care
          </Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'basic' && styles.activeTab]}
            onPress={() => setActiveTab('basic')}
          >
            <Ionicons 
              name="person-circle" 
              size={20} 
              color={activeTab === 'basic' ? colors.white : 'rgba(255, 255, 255, 0.7)'} 
            />
            <Text style={[styles.tabText, activeTab === 'basic' && styles.activeTabText]}>
              Basic Info
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'medical' && styles.activeTab]}
            onPress={() => setActiveTab('medical')}
          >
            <Ionicons 
              name="medical" 
              size={20} 
              color={activeTab === 'medical' ? colors.white : 'rgba(255, 255, 255, 0.7)'} 
            />
            <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>
              Medical Info
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          {activeTab === 'basic' && (
            <View style={styles.formSection}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-circle" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                </View>
                
                <TextArea
                  attr={{
                    icon: { name: 'water', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Blood Type (e.g., A+, O-, B+)',
                    field: 'bloodType',
                    value: medicalHistory?.bloodType || '',
                    handleChange: handleFieldChange,
                  }}
                />

                <TextArea
                  attr={{
                    icon: { name: 'resize', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Height (e.g., 170 cm, 5\'8")',
                    field: 'height',
                    value: medicalHistory?.height || '',
                    handleChange: handleFieldChange,
                  }}
                />

                <TextArea
                  attr={{
                    icon: { name: 'fitness', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Weight (e.g., 70 kg, 154 lbs)',
                    field: 'weight',
                    value: medicalHistory?.weight || '',
                    handleChange: handleFieldChange,
                  }}
                />
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="call" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Emergency Contact</Text>
                </View>
                
                <TextArea
                  attr={{
                    icon: { name: 'person-add', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Emergency Contact Name',
                    field: 'emergencyContact.name',
                    value: medicalHistory?.emergencyContact.name || '',
                    handleChange: handleFieldChange,
                  }}
                />

                <TextArea
                  attr={{
                    icon: { name: 'call', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Emergency Contact Phone',
                    field: 'emergencyContact.phoneNumber',
                    value: medicalHistory?.emergencyContact.phoneNumber || '',
                    keyboardType: 'phone-pad',
                    handleChange: handleFieldChange,
                  }}
                />
              </View>
            </View>
          )}

          {activeTab === 'medical' && (
            <View style={styles.formSection}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="medical" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Medical Information</Text>
                </View>
                
                <TextArea
                  attr={{
                    icon: { name: 'medical', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Current medical conditions (e.g., Diabetes, Hypertension)',
                    field: 'currentConditions',
                    value: medicalHistory?.currentConditions || '',
                    multiline: true,
                    handleChange: handleFieldChange,
                  }}
                />

                <TextArea
                  attr={{
                    icon: { name: 'medical', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Current medications (e.g., Metformin 500mg twice daily)',
                    field: 'currentMedications',
                    value: medicalHistory?.currentMedications || '',
                    multiline: true,
                    handleChange: handleFieldChange,
                  }}
                />

                <TextArea
                  attr={{
                    icon: { name: 'warning', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Known allergies (e.g., Penicillin, Peanuts)',
                    field: 'allergies',
                    value: medicalHistory?.allergies || '',
                    multiline: true,
                    handleChange: handleFieldChange,
                  }}
                />

                <TextArea
                  attr={{
                    icon: { name: 'time', type: 'Ionicons', color: colors.primary, size: 20 },
                    placeholder: 'Previous surgeries or major medical history',
                    field: 'previousHistory',
                    value: medicalHistory?.previousHistory || '',
                    multiline: true,
                    handleChange: handleFieldChange,
                  }}
                />
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={24} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Lifestyle</Text>
                </View>
                
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Smoking Status</Text>
                  <Dropdown
                    itemList={[
                      { id: 'never', label: 'Never smoked', selected: medicalHistory?.lifestyle?.smoking === 'never' },
                      { id: 'former', label: 'Former smoker', selected: medicalHistory?.lifestyle?.smoking === 'former' },
                      { id: 'current', label: 'Current smoker', selected: medicalHistory?.lifestyle?.smoking === 'current' },
                    ]}
                    onChange={(item: any) => handleFieldChange('lifestyle.smoking', item.id)}
                    placeholder="Select smoking status"
                  />
                </View>

                <View style={[styles.dropdownContainer,{zIndex:-1}]}>
                  <Text style={styles.dropdownLabel}>Alcohol Consumption</Text>
                  <Dropdown
                    itemList={[
                      { id: 'never', label: 'Never drink', selected: medicalHistory?.lifestyle?.alcohol === 'never' },
                      { id: 'occasional', label: 'Occasional', selected: medicalHistory?.lifestyle?.alcohol === 'occasional' },
                      { id: 'regular', label: 'Regular', selected: medicalHistory?.lifestyle?.alcohol === 'regular' },
                    ]}
                    onChange={(item: any) => handleFieldChange('lifestyle.alcohol', item.id)}
                    placeholder="Select alcohol consumption"
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Save Button */}
        
      </KeyboardAvoidingView>
      <View style={styles.saveContainer}>
          <LinearButton
            textInfo={{
              text: saving ? 'Saving...' : 'Save Medical History',
              color: colors.green,
            }}
            iconInfo={{
              type: 'Ionicons',
              name: saving ? 'hourglass' : 'save',
              size: 20,
              color: colors.green,
            }}
            handleBtnClick={handleSave}
            disabled={saving}
          />

          {isHistoryComplete && (
            <View style={styles.completeIndicator}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.completeText}>Medical history is complete</Text>
            </View>
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
    paddingTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.white,
    marginTop: 15,
  },
  headerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 10,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'fontBold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
  },
  activeTabText: {
    color: colors.white,
    fontFamily: 'fontBold',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    paddingBottom: 20,
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: '#333',
    marginLeft: 12,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: '#333',
    marginBottom: 8,
  },
  saveContainer: {
    padding:20,
    marginBottom:30
  },
  savingButton: {
    opacity: 0.7,
  },
  completeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 10,
    padding: 12,
  },
  completeText: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: '#4CAF50',
    marginLeft: 8,
  },
});

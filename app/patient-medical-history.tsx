import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { MedicalHistory, Prescription } from '@/constants/Types';
import { getUserById } from '@/src/helpers/api';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/src/helpers/api';

export default function PatientMedicalHistoryScreen() {
  const { patientId, patientName } = useLocalSearchParams<{
    patientId: string;
    patientName: string;
  }>();

  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'history' | 'prescriptions'>('history');

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    if (!patientId) return;

    try {
      setLoading(true);

      // Fetch patient profile with medical history
      const patientProfile = await getUserById(patientId);
      if (patientProfile?.medicalHistory) {
        setMedicalHistory(patientProfile.medicalHistory);
      }

      // Fetch prescriptions for this patient
      const prescriptionsQuery = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );

      const prescriptionsSnapshot = await getDocs(prescriptionsQuery);
      const prescriptionsData = prescriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      })) as Prescription[];

      setPrescriptions(prescriptionsData);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.tertiary, colors.tertiary, colors.green]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading patient information...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderMedicalHistory = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {!medicalHistory ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical" size={48} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.emptyText}>No medical history available</Text>
          <Text style={styles.emptySubtext}>
            Patient hasn't completed their medical history
          </Text>
        </View>
      ) : (
        <>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.infoGrid}>
              {medicalHistory.bloodType && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Blood Type</Text>
                  <Text style={styles.infoValue}>{medicalHistory.bloodType}</Text>
                </View>
              )}
              {medicalHistory.height && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>{medicalHistory.height}</Text>
                </View>
              )}
              {medicalHistory.weight && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Weight</Text>
                  <Text style={styles.infoValue}>{medicalHistory.weight}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Emergency Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <View style={styles.contactCard}>
              <Text style={styles.contactName}>{medicalHistory.emergencyContact.name}</Text>
              <Text style={styles.contactPhone}>{medicalHistory.emergencyContact.phoneNumber}</Text>
            </View>
          </View>

          {/* Medical Information */}
          {medicalHistory.currentConditions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Medical Conditions</Text>
              <View style={styles.itemCard}>
                <Text style={styles.itemTitle}>{medicalHistory.currentConditions}</Text>
              </View>
            </View>
          )}

          {medicalHistory.currentMedications && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Current Medications</Text>
              <View style={styles.itemCard}>
                <Text style={styles.itemTitle}>{medicalHistory.currentMedications}</Text>
              </View>
            </View>
          )}

          {medicalHistory.allergies && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Known Allergies</Text>
              <View style={[styles.itemCard, styles.allergyCard]}>
                <Text style={styles.itemTitle}>{medicalHistory.allergies}</Text>
              </View>
            </View>
          )}

          {medicalHistory.previousHistory && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Previous Medical History</Text>
              <View style={styles.itemCard}>
                <Text style={styles.itemTitle}>{medicalHistory.previousHistory}</Text>
              </View>
            </View>
          )}

          {/* Lifestyle */}
          {medicalHistory.lifestyle && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lifestyle Information</Text>
              <View style={styles.lifestyleGrid}>
                {medicalHistory.lifestyle.smoking && (
                  <View style={styles.lifestyleItem}>
                    <Text style={styles.lifestyleLabel}>Smoking</Text>
                    <Text style={styles.lifestyleValue}>{medicalHistory.lifestyle.smoking}</Text>
                  </View>
                )}
                {medicalHistory.lifestyle.alcohol && (
                  <View style={styles.lifestyleItem}>
                    <Text style={styles.lifestyleLabel}>Alcohol</Text>
                    <Text style={styles.lifestyleValue}>{medicalHistory.lifestyle.alcohol}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  const renderPrescriptions = () => (
    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {prescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text" size={48} color="rgba(255, 255, 255, 0.5)" />
          <Text style={styles.emptyText}>No prescriptions found</Text>
          <Text style={styles.emptySubtext}>
            No prescriptions have been issued to this patient yet
          </Text>
        </View>
      ) : (
        prescriptions.map((prescription) => (
          <View key={prescription.id} style={styles.prescriptionCard}>
            <View style={styles.prescriptionHeader}>
              <Text style={styles.prescriptionDate}>
                {prescription.createdAt.toLocaleDateString()}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: prescription.collected ? '#4CAF50' : '#FF9800' }]}>
                <Text style={styles.statusText}>
                  {prescription.collected ? 'Collected' : 'Pending'}
                </Text>
              </View>
            </View>
            <Text style={styles.prescriptionDoctor}>
              Dr. {prescription.doctorName}
            </Text>
            <View style={styles.medicationsList}>
              {prescription.medications.map((med, index) => (
                <Text key={index} style={styles.medicationItem}>
                  • {med.name} - {med.dosage} ({med.instructions})
                </Text>
              ))}
            </View>
            {prescription.notes && (
              <Text style={styles.prescriptionNotes}>Notes: {prescription.notes}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
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
          headerTitle: `${patientName || 'Patient'} - Medical History`,
          headerTitleStyle: {
            fontFamily: 'fontBold',
            color: colors.white,
            fontSize: 18,
          },
          headerTintColor: colors.white,
        }}
      />

      <View style={styles.content}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
          >
            <Ionicons
              name="medical"
              size={20}
              color={activeTab === 'history' ? colors.white : 'rgba(255, 255, 255, 0.7)'}
            />
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              Medical History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'prescriptions' && styles.activeTab]}
            onPress={() => setActiveTab('prescriptions')}
          >
            <Ionicons
              name="document-text"
              size={20}
              color={activeTab === 'prescriptions' ? colors.white : 'rgba(255, 255, 255, 0.7)'}
            />
            <Text style={[styles.tabText, activeTab === 'prescriptions' && styles.activeTabText]}>
              Prescriptions ({prescriptions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'history' ? renderMedicalHistory() : renderPrescriptions()}
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
    paddingTop: 100,
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.white,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  contactCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  contactName: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 5,
  },
  contactRelation: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  contactPhone: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.primary,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  allergyCard: {
    borderColor: '#FF5722',
    borderWidth: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  itemNotes: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 5,
  },
  itemPurpose: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 3,
  },
  itemPrescriber: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.6)',
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
    textTransform: 'uppercase',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontFamily: 'fontBold',
    color: colors.white,
    textTransform: 'uppercase',
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lifestyleItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  lifestyleLabel: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 3,
  },
  lifestyleValue: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.white,
    textTransform: 'capitalize',
  },
  prescriptionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prescriptionDate: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  prescriptionDoctor: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  medicationsList: {
    marginBottom: 10,
  },
  medicationItem: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.white,
    marginBottom: 5,
  },
  prescriptionNotes: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 5,
  },
});

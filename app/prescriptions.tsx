import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { router } from 'expo-router';
import useAuth from '@/src/hooks/useAuth';
import usePrescriptions from '@/src/hooks/usePrescriptions';
import { formatDate, showToast } from '@/src/helpers/methods';
import { PrescriptionStatus } from '@/src/state/slices/prescriptionSlice';
import { Prescription, getUserById } from '@/src/helpers/api';
import { LinearButton } from '@/components/ui/Button';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useSecrets } from '@/src/hooks/useSecrets';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

interface PrescriptionCardProps {
  prescription: Prescription;
  onEdit?: (prescription: Prescription) => void;
  onDownload?: (prescriptionId: string) => void;
  isDoctor: boolean;
}

// Component to display a prescription card
const PrescriptionCard: React.FC<PrescriptionCardProps> = ({ prescription, onEdit, onDownload, isDoctor }) => {
  const [doctorDetails, setDoctorDetails] = React.useState<any>(null);
  const [patientDetails, setPatientDetails] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const {secrets} = useSecrets();
  const statusColors = {
    pending: colors.orange,
    collected: colors.green,
    cancelled: colors.tomato,
  };

  // Fetch doctor and patient details when component mounts
  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const [doctor, patient] = await Promise.all([
          getUserById(prescription.doctorId),
          getUserById(prescription.patientId)
        ]);
        setDoctorDetails(doctor);
        setPatientDetails(patient);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [prescription.doctorId, prescription.patientId]);

  const handleDownload = async () => {
    try {
      // Fetch doctor and patient details
      const doctorDetails = await getUserById(prescription.doctorId);
      const patientDetails = await getUserById(prescription.patientId);

      // Generate QR code URL using a free QR code API
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(secrets?.website + '/verify-prescription/' + prescription.id)}`;

      // Convert logo to base64 for embedding
      const logoAsset = Asset.fromModule(require('@/assets/images/logo.png'));
      await logoAsset.downloadAsync();
      const logoBase64 = await FileSystem.readAsStringAsync(logoAsset.localUri!, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const logoDataUri = `data:image/png;base64,${logoBase64}`;

      // Generate HTML content for the prescription
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                font-family: 'Helvetica';
                margin: 40px;
                position: relative;
              }
              h1 { color: ${colors.primary}; margin: 0; }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 30px;
                border-bottom: 2px solid ${colors.primary};
                padding-bottom: 20px;
              }
              .header-left { flex: 1; }
              .header-right {
                text-align: center;
                margin-left: 20px;
              }
              .qr-code {
                width: 150px;
                height: 150px;
                border: 1px solid #ddd;
                border-radius: 8px;
              }
              .qr-label {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
                text-align: center;
              }
              .section { margin-bottom: 20px; }
              .medication { margin-bottom: 10px; padding-left: 20px; }
              .footer { margin-top: 50px; text-align: center; color: #666; }
              .status { padding: 5px 10px; border-radius: 5px; display: inline-block; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: ${colors.faintGray}; }

              /* Watermark styles */
              .watermark {
                position: fixed;
                top: 75%;
                left: 75%;
                transform: translate(-50%, -50%) rotate(-45deg);
                opacity: 0.1;
                z-index: -1;
                pointer-events: none;
              }
              .watermark img {
                width: 220px;
                height: 220px;
                border-radius: 50px;
                object-fit: contain;
              }

              /* Additional watermark for multiple pages */
              @media print {
                .watermark {
                  position: fixed;
                  top: 75%;
                  left: 75%;
                  transform: translate(-50%, -50%) rotate(-45deg);
                  opacity: 0.08;
                  z-index: -1;
                }
              }
            </style>
          </head>
          <body>
            <!-- Watermark -->
            <div class="watermark">
              <img src="${logoDataUri}" alt="SmartDoctor Logo" />
            </div>

            <div class="header">
              <div class="header-left">
                <h1>Medical Prescription</h1>
                <p>Date: ${formatDate(prescription.createdAt)}</p>
                <p><strong>Prescription ID:</strong> ${prescription.id}</p>
                
                <div class="section">
                  <h3>Doctor Information</h3>
                  <p><strong>Name:</strong> Dr. ${doctorDetails?.fname || prescription.doctorName || 'Unknown'}</p>
                  <p><strong>Specialty:</strong> ${doctorDetails?.specialty || prescription.doctorSpecialty || 'General Practitioner'}</p>
                  ${doctorDetails?.practitionerNumber ? `<p><strong>Practice Number:</strong> ${doctorDetails.practitionerNumber}</p>` : ''}
                  ${doctorDetails?.address?.text ? `<p><strong>Address:</strong> ${doctorDetails.address.text}</p>` : ''}
                  ${doctorDetails?.phoneNumber ? `<p><strong>Phone:</strong> ${doctorDetails.phoneNumber}</p>` : ''}
                </div>
              </div>
              <div class="header-right">
                <img src="${qrCodeUrl}" alt="QR Code" class="qr-code" />
                <p class="qr-label">Scan for verification</p>
              </div>
            </div>

            <div class="section">
              <h3>Patient Information</h3>
              <p><strong>Name:</strong> ${patientDetails?.fname || prescription.patientName || 'Patient'}</p>
              ${patientDetails?.address?.text ? `<p><strong>Address:</strong> ${patientDetails.address.text}</p>` : ''}
              ${patientDetails?.phoneNumber ? `<p><strong>Phone:</strong> ${patientDetails.phoneNumber}</p>` : ''}
            </div>

            <div class="section">
              <h3>Medications</h3>
              <table>
                <tr>
                  <th>Name</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Notes</th>
                </tr>
                ${prescription.medications.map(med => `
                  <tr>
                    <td>${med.name}</td>
                    <td>${med.dosage}</td>
                    <td>${med.frequency}</td>
                    <td>${med.duration}</td>
                    <td>${med.notes || ''}</td>
                  </tr>
                `).join('')}
              </table>
            </div>

            <div class="section">
              <h3>Instructions</h3>
              <p>${prescription.instructions}</p>
            </div>

            <div class="section">
              <h3>Status</h3>
              <div class="status" style="background-color: ${statusColors[prescription.status || 'pending']}; color: white;">
                ${(prescription.status || 'pending').toUpperCase()}
              </div>
            </div>

            <div class="footer">
              <p>This is an electronic prescription generated by SmartDoctor App.</p>
              <p><em>Scan the QR code above to verify this prescription</em></p>
            </div>
          </body>
        </html>
      `;

      // Generate PDF file
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Share the PDF file
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Download Prescription',
        UTI: 'com.adobe.pdf',
      });

      onDownload && onDownload(prescription.id);
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      showToast('Failed to generate prescription PDF');
    }
  };

  return (
    <View style={styles.prescriptionCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dateText}>{formatDate(prescription.createdAt)}</Text>
          <Text style={styles.doctorName}>
            {isDoctor
              ? (patientDetails?.fname || prescription.patientName || 'Patient')
              : `Dr. ${doctorDetails?.fname || prescription.doctorName || 'Loading...'}`
            }
          </Text>
          {!isDoctor && (
            <Text style={styles.specialtyText}>
              {doctorDetails?.specialty || prescription.doctorSpecialty || 'General Practitioner'}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[prescription.status || 'pending'] }]}>
          <Text style={styles.statusText}>{(prescription.status || 'pending').toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.medicationsContainer}>
        <Text style={styles.sectionTitle}>Medications</Text>
        {prescription.medications.map((med, index) => (
          <View key={index} style={styles.medicationItem}>
            <Text style={styles.medicationName}>{med.name}</Text>
            <Text style={styles.medicationDetails}>
              {med.dosage} • {med.frequency} • {med.duration}
            </Text>
            {med.notes && <Text style={styles.medicationNotes}>{med.notes}</Text>}
          </View>
        ))}
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <Text style={styles.instructionsText}>{prescription.instructions}</Text>
      </View>

      <View style={styles.cardActions}>
        {/* {isDoctor && (
          <View style={styles.buttonWrapper}>
            <LinearButton
              btnInfo={{
                styles: { marginTop: 0, backgroundColor: colors.primary }
              }}
              textInfo={{
                text: 'Edit',
                color: colors.primary
              }}
              iconInfo={{
                type: 'Ionicons',
                name: 'create-outline',
                size: 16,
                color: colors.primary
              }}
              handleBtnClick={() => onEdit && onEdit(prescription)}
            />
          </View>
        )} */}

        <View style={styles.buttonWrapper}>
          <LinearButton
            btnInfo={{
              styles: { marginTop: 0, backgroundColor: colors.tertiary }
            }}
            textInfo={{
              text: 'Share',
              color: colors.primary
            }}
            iconInfo={{
              type: 'Ionicons',
              name: 'share-outline',
              size: 16,
              color: colors.primary
            }}
            handleBtnClick={handleDownload}
          />
        </View>
      </View>
    </View>
  );
};

export default function PrescriptionsScreen() {
  const { accountInfo } = useAuth();
  const {
    fetchPrescriptions,
    prescriptions,
    loading,
    updatePrescriptionStatus
  } = usePrescriptions();
  const [filter, setFilter] = useState('all');

  const isDoctor = accountInfo?.isDoctor || false;

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleEditPrescription = (prescription: Prescription) => {
    // Navigate to edit prescription screen or show modal
    showToast('Edit prescription functionality coming soon');
  };

  const handleDownloadPrescription = (prescriptionId: string) => {
    // Update prescription status to 'collected' if it's a patient
    if (!isDoctor && prescriptionId) {
      updatePrescriptionStatus(prescriptionId, 'collected');
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription: Prescription) => {
    if (filter === 'all') return true;
    return prescription.status === filter;
  });

  const renderFilterButton = (label: string, value: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.activeFilterButton
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.activeFilterButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={[colors.tertiary, colors.tertiary, colors.green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.filterContainer}>
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Pending', 'pending')}
          {renderFilterButton('Collected', 'collected')}
          {renderFilterButton('Cancelled', 'cancelled')}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        ) : filteredPrescriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.white} />
            <Text style={styles.emptyText}>No prescriptions found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPrescriptions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PrescriptionCard
                prescription={item}
                isDoctor={isDoctor}
                onEdit={handleEditPrescription}
                onDownload={handleDownloadPrescription}
              />
            )}
            contentContainerStyle={styles.prescriptionsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:20
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  backButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterButton: {
    backgroundColor: colors.white,
  },
  filterButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'fontLight',
  },
  activeFilterButtonText: {
    color: colors.primary,
    fontFamily: 'fontBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: colors.white,
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'fontLight',
  },
  prescriptionsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  prescriptionCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginTop: 4,
  },
  specialtyText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 5,
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: 'fontBold',
  },
  medicationsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.faintGray,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.primary,
    marginBottom: 8,
  },
  medicationItem: {
    marginBottom: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  medicationName: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.tertiary,
  },
  medicationDetails: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.tertiary,
  },
  medicationNotes: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
    fontStyle: 'italic',
    marginTop: 2,
  },
  instructionsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.faintGray,
    borderRadius: 10,
  },
  instructionsText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: colors.faintGray,
    paddingTop: 12,
    gap: 8,
  },
  buttonWrapper: {
    flex: 0,
    minWidth: 100,
  },
});

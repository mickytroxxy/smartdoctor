import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { Appointment } from '@/src/types/doctorTypes';
import { Prescription } from '@/src/helpers/api';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { currencyFormatter } from '@/src/helpers/methods';
import useAuth from '@/src/hooks/useAuth';
import { LinearButton } from '@/components/ui/Button';
import { useRouter } from 'expo-router';

interface AppointmentDetailsProps {
  visible: boolean;
  appointment: Appointment | null;
  prescriptions: Prescription[];
  onClose: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  onReschedule: () => void;
  onPrescribe: () => void;
  onInitiateCall: (userId: string) => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({
  visible,
  appointment,
  prescriptions,
  onClose,
  onUpdateStatus,
  onReschedule,
  onPrescribe,
  onInitiateCall,
}) => {
  const { accountInfo } = useAuth();
  const router = useRouter();
  const isDoctor = accountInfo?.isDoctor;

  // Format date for display
  const formatDateStr = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM dd, yyyy');
  };

  // Format time for display
  const formatTimeStr = (timeStr: string) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute);
    return format(date, 'h:mm a');
  };

  if (!appointment) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Appointment Details</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              {isDoctor ? (
                <>
                  <Text style={styles.detailLabel}>Patient</Text>
                  <Text style={styles.detailValue}>{appointment.patientName}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.detailLabel}>Doctor</Text>
                  <Text style={styles.detailValue}>Dr. {appointment.doctorName}</Text>
                  <Text style={styles.detailSubValue}>{appointment.doctorSpecialty}</Text>
                </>
              )}
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDateStr(appointment.date)} at {formatTimeStr(appointment.time)}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {appointment.type === 'surgery'
                  ? 'Surgery Visit'
                  : appointment.type === 'video'
                    ? 'Video Call'
                    : 'Home Visit'
                }
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Status</Text>
              <StatusBadge status={appointment.status} />
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Fee</Text>
              <Text style={styles.detailValue}>{currencyFormatter(appointment.fee)}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>
                {appointment.paymentMethod === 'medical_aid'
                  ? 'Medical Aid'
                  : appointment.paymentMethod === 'card'
                    ? 'Card Payment'
                    : 'Cash Payment'
                }
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Symptoms</Text>
              <Text style={styles.detailValue}>{appointment.symptoms || 'None provided'}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{appointment.notes || 'No notes'}</Text>
            </View>

            {/* Medical History Section - Only show for doctors when attached */}
            {isDoctor && appointment.medicalHistoryAttached && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Medical History</Text>
                <View style={styles.medicalHistoryContainer}>
                  <View style={styles.medicalHistoryInfo}>
                    <Ionicons name="medical" size={20} color={colors.primary} />
                    <Text style={styles.medicalHistoryText}>
                      Patient has shared their medical history
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.viewHistoryButton}
                    onPress={() => router.push({
                      pathname: '/patient-medical-history',
                      params: {
                        patientId: appointment.patientId,
                        patientName: appointment.patientName
                      }
                    })}
                  >
                    <Text style={styles.viewHistoryButtonText}>View History</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Show when medical history is not attached */}
            {isDoctor && !appointment.medicalHistoryAttached && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Medical History</Text>
                <View style={styles.medicalHistoryContainer}>
                  <View style={styles.medicalHistoryInfo}>
                    <Ionicons name="medical-outline" size={20} color={colors.grey} />
                    <Text style={styles.medicalHistoryTextDisabled}>
                      No medical history attached
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Medical Aid Details - Only show for doctors when payment method is medical aid */}
            {isDoctor && appointment.paymentMethod === 'medical_aid' && appointment.medicalAidDetails && (
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Medical Aid Details</Text>
                <View style={styles.medicalAidContainer}>
                  <View style={styles.medicalAidHeader}>
                    <Ionicons name="card" size={20} color={colors.green} />
                    <Text style={styles.medicalAidTitle}>
                      {appointment.medicalAidDetails.provider}
                    </Text>
                    {appointment.medicalAidDetails.isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.green} />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.medicalAidDetails}>
                    <Text style={styles.medicalAidLabel}>Member Number:</Text>
                    <Text style={styles.medicalAidValue}>
                      {appointment.medicalAidDetails.memberNumber}
                    </Text>
                  </View>

                  {appointment.medicalAidDetails.documentUrl && (
                    <TouchableOpacity
                      style={styles.viewDocumentButton}
                      onPress={() => {
                        // Open document viewer or download
                        console.log('View medical aid document:', appointment.medicalAidDetails?.documentUrl);
                      }}
                    >
                      <Ionicons name="document-text" size={16} color={colors.primary} />
                      <Text style={styles.viewDocumentText}>View Medical Aid Card</Text>
                    </TouchableOpacity>
                  )}

                  {!appointment.medicalAidDetails.isVerified && (
                    <View style={styles.unverifiedWarning}>
                      <Ionicons name="warning" size={16} color={colors.orange} />
                      <Text style={styles.unverifiedText}>
                        Medical aid not yet verified
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.actionButtonsContainer}>
              {isDoctor ? (
                // Doctor actions
                <>
                  {appointment.status === 'pending' && (
                    <View style={styles.actionButtonRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.green }]}
                        onPress={() => onUpdateStatus(appointment.id, 'confirmed')}
                      >
                        <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                        <Text style={styles.actionButtonText}>Confirm</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.tomato }]}
                        onPress={() => onUpdateStatus(appointment.id, 'cancelled')}
                      >
                        <Ionicons name="close-circle" size={20} color={colors.white} />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {appointment.status === 'confirmed' && (
                    <View style={styles.actionButtonRow}>
                      {appointment.type === 'video' && (
                        <TouchableOpacity
                          style={{justifyContent:'center',alignItems:'center'}}
                          onPress={() => onInitiateCall(appointment.patientId)}
                        >
                          <Ionicons name="videocam" size={40} color={colors.primary} />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.orange }]}
                        onPress={onReschedule}
                      >
                        <Ionicons name="calendar" size={20} color={colors.white} />
                        <Text style={styles.actionButtonText}>Reschedule</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.green }]}
                        onPress={() => onUpdateStatus(appointment.id, 'completed')}
                      >
                        <Ionicons name="checkmark-done" size={20} color={colors.white} />
                        <Text style={styles.actionButtonText}>Complete</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {appointment.status === 'completed' && (
                    <View style={styles.actionButtonRow}>
                      <LinearButton
                        btnInfo={{
                          styles: { marginTop: 0 }
                        }}
                        textInfo={{
                          text: 'Prescribe',
                          color: colors.tertiary
                        }}
                        iconInfo={{
                          type: 'Ionicons',
                          name: 'document-text',
                          size: 16,
                          color: colors.tertiary
                        }}
                        handleBtnClick={onPrescribe}
                      />
                    </View>
                  )}
                </>
              ) : (
                // Patient actions
                <>
                  {appointment.status === 'confirmed' && (
                    <View style={styles.actionButtonRow}>
                      {appointment.type === 'video' && (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: colors.primary }]}
                          onPress={() => onInitiateCall(appointment.doctorId)}
                        >
                          <Ionicons name="videocam" size={20} color={colors.white} />
                          <Text style={styles.actionButtonText}>Join Call</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.tomato }]}
                        onPress={() => onUpdateStatus(appointment.id, 'cancelled')}
                      >
                        <Ionicons name="close-circle" size={20} color={colors.white} />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Prescriptions */}
            {prescriptions.length > 0 && (
              <View style={styles.prescriptionsContainer}>
                <Text style={styles.sectionTitle}>Prescriptions</Text>
                {prescriptions.map((prescription) => (
                  <View key={prescription.id} style={styles.prescriptionCard}>
                    <Text style={styles.prescriptionDate}>
                      {format(new Date(prescription.createdAt), 'MMM dd, yyyy')}
                    </Text>

                    <Text style={styles.prescriptionTitle}>Medications:</Text>
                    {prescription.medications.map((med, i) => (
                      <View key={i} style={styles.medicationItem}>
                        <Text style={styles.medicationName}>{med.name}</Text>
                        <Text style={styles.medicationDetails}>
                          {med.dosage}, {med.frequency}, for {med.duration}
                        </Text>
                        {med.notes && <Text style={styles.medicationNotes}>{med.notes}</Text>}
                      </View>
                    ))}

                    <Text style={styles.prescriptionTitle}>Instructions:</Text>
                    <Text style={styles.prescriptionInstructions}>{prescription.instructions}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingBottom: 20, // Added padding at the bottom
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.faintGray,
    backgroundColor: colors.tertiary,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.white,
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  modalBody: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.faintGray,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.tertiary,
  },
  detailSubValue: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginTop: 2,
  },
  actionButtonsContainer: {
    marginTop: 20,
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: colors.faintGray,
    paddingTop: 20,
  },
  actionButtonRow: {
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontFamily: 'fontBold',
    fontSize: 14,
    color: colors.white,
    marginLeft: 6,
  },
  prescriptionsContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 12,
  },
  prescriptionCard: {
    backgroundColor: colors.faintGray,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.green,
  },
  prescriptionDate: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginBottom: 8,
  },
  prescriptionTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  medicationItem: {
    marginLeft: 8,
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.tertiary,
  },
  medicationDetails: {
    fontSize: 14,
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
  prescriptionInstructions: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginLeft: 8,
  },
  medicalHistoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicalHistoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicalHistoryText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginLeft: 8,
  },
  medicalHistoryTextDisabled: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginLeft: 8,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewHistoryButtonText: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.white,
    marginRight: 4,
  },
  medicalAidContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  medicalAidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicalAidTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.green,
    marginLeft: 8,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontFamily: 'fontBold',
    color: colors.green,
    marginLeft: 4,
  },
  medicalAidDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicalAidLabel: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginRight: 8,
  },
  medicalAidValue: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
  },
  viewDocumentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  viewDocumentText: {
    fontSize: 12,
    fontFamily: 'fontBold',
    color: colors.white,
    marginLeft: 4,
  },
  unverifiedWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  unverifiedText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.orange,
    marginLeft: 4,
  },
});

export default AppointmentDetails;

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { LinearButton } from '@/components/ui/Button';
import TextArea from '@/components/ui/TextArea';
import usePrescriptions from '@/src/hooks/usePrescriptions';
import { showToast } from '@/src/helpers/methods';

interface PrescribeModalProps {
  visible: boolean;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  onClose: () => void;
  onSave: () => void;
}

const PrescribeModal: React.FC<PrescribeModalProps> = ({
  visible,
  appointmentId,
  doctorId,
  patientId,
  onClose,
  onSave,
}) => {
  // Use our custom hook for prescriptions
  const prescriptions = usePrescriptions();

  // Initialize the form when the modal is opened
  useEffect(() => {
    if (visible) {
      prescriptions.initializePrescriptionForm(appointmentId, doctorId, patientId);
    }
  }, [visible, appointmentId, doctorId, patientId]);

  // Handle save button click
  const handleSave = () => {
    if (prescriptions.isValidPrescription()) {
      prescriptions.handleCreatePrescription();
      onSave();
    } else {
      showToast('Please fill in all medication fields and instructions');
    }
  };



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
            <Text style={styles.modalTitle}>Create Prescription</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Medications</Text>

            {prescriptions.form.medications.map((medication, index) => (
              <View key={index} style={styles.medicationContainer}>
                <View style={styles.medicationHeader}>
                  <Text style={styles.medicationTitle}>Medication {index + 1}</Text>
                  {prescriptions.form.medications.length > 1 && (
                    <TouchableOpacity
                      onPress={() => prescriptions.handleRemoveMedication(index)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash" size={20} color={colors.tomato} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextArea
                  attr={{
                    icon: {
                      name: "medkit",
                      type: "Ionicons",
                      color: colors.primary
                    },
                    placeholder: "Medication Name",
                    field: `name-${index}`,
                    value: medication.name,
                    multiline: false,
                    handleChange: (_field, value) => prescriptions.handleUpdateMedication(index, 'name', value)
                  }}
                  style={{ marginBottom: 12 }}
                />

                <TextArea
                  attr={{
                    icon: {
                      name: "flask",
                      type: "Ionicons",
                      color: colors.primary
                    },
                    placeholder: "Dosage (e.g., 500mg)",
                    field: `dosage-${index}`,
                    value: medication.dosage,
                    multiline: false,
                    handleChange: (_field, value) => prescriptions.handleUpdateMedication(index, 'dosage', value)
                  }}
                  style={{ marginBottom: 12 }}
                />

                <TextArea
                  attr={{
                    icon: {
                      name: "time",
                      type: "Ionicons",
                      color: colors.primary
                    },
                    placeholder: "Frequency (e.g., twice daily)",
                    field: `frequency-${index}`,
                    value: medication.frequency,
                    multiline: false,
                    handleChange: (_field, value) => prescriptions.handleUpdateMedication(index, 'frequency', value)
                  }}
                  style={{ marginBottom: 12 }}
                />

                <TextArea
                  attr={{
                    icon: {
                      name: "calendar",
                      type: "Ionicons",
                      color: colors.primary
                    },
                    placeholder: "Duration (e.g., 7 days)",
                    field: `duration-${index}`,
                    value: medication.duration,
                    multiline: false,
                    handleChange: (_field, value) => prescriptions.handleUpdateMedication(index, 'duration', value)
                  }}
                  style={{ marginBottom: 12 }}
                />

                <TextArea
                  attr={{
                    icon: {
                      name: 'create',
                      type: 'Ionicons',
                      color: colors.primary
                    },
                    placeholder: "Notes (optional)",
                    field: `notes-${index}`,
                    value: medication.notes || '',
                    multiline: true,
                    handleChange: (_field, value) => prescriptions.handleUpdateMedication(index, 'notes', value)
                  }}
                  style={{ marginBottom: 12 }}
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={prescriptions.handleAddMedication}
            >
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.addButtonText}>Add Medication</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Instructions</Text>
            <TextArea
              attr={{
                icon: {
                  name: 'document-text',
                  type: 'Ionicons',
                  color: colors.primary
                },
                placeholder: "General instructions for the patient",
                field: "instructions",
                value: prescriptions.form.instructions,
                multiline: true,
                handleChange: (_field, value) => prescriptions.handleUpdateInstructions(value)
              }}
              style={{ marginBottom: 12 }}
            />

            <View style={styles.buttonContainer}>

              <View style={styles.buttonWrapper}>
                <LinearButton
                  btnInfo={{
                    styles: { marginTop: 0 }
                  }}
                  textInfo={{
                    text: 'Save Prescription',
                    color: prescriptions.isValidPrescription() ? colors.tertiary : colors.grey
                  }}
                  iconInfo={{
                    type: 'Ionicons',
                    name: 'save-outline',
                    size: 16,
                    color: prescriptions.isValidPrescription() ? colors.tertiary : colors.grey
                  }}
                  handleBtnClick={handleSave}
                />
              </View>
            </View>
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
    maxHeight: '90%',
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
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 16,
  },
  medicationContainer: {
    backgroundColor: colors.faintGray,
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    letterSpacing: 0.5,
  },
  removeButton: {
    padding: 4,
  },

  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  addButtonText: {
    color: colors.white,
    fontFamily: 'fontBold',
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.faintGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'fontBold',
  },
});

export default PrescribeModal;

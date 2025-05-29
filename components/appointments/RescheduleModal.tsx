import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { LinearButton } from '@/components/ui/Button';

interface RescheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onReschedule: (date: Date) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  visible,
  onClose,
  onReschedule,
}) => {
  const [rescheduleDate, setRescheduleDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Handle date change
  const handleDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(rescheduleDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setRescheduleDate(newDate);
    }
  };

  // Handle time change
  const handleTimeChange = (_event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(rescheduleDate);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setRescheduleDate(newDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return format(date, 'MMMM dd, yyyy');
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
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
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.sectionTitle}>Select New Date & Time</Text>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerLabel}>Date</Text>
              <Text style={styles.datePickerValue}>{formatDate(rescheduleDate)}</Text>
              <Ionicons name="calendar" size={20} color={colors.primary} style={styles.datePickerIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.datePickerLabel}>Time</Text>
              <Text style={styles.datePickerValue}>{formatTime(rescheduleDate)}</Text>
              <Ionicons name="time" size={20} color={colors.primary} style={styles.datePickerIcon} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={rescheduleDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={rescheduleDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                minuteInterval={15}
              />
            )}

            <View style={styles.buttonContainer}>
              <View style={styles.buttonWrapper}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={[styles.modalButtonText, { color: colors.tertiary }]}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonWrapper}>
                <LinearButton
                  btnInfo={{
                    styles: { marginTop: 0 }
                  }}
                  textInfo={{
                    text: 'Reschedule',
                    color: colors.tertiary
                  }}
                  iconInfo={{
                    type: 'Ionicons',
                    name: 'calendar',
                    size: 16,
                    color: colors.tertiary
                  }}
                  handleBtnClick={() => onReschedule(rescheduleDate)}
                />
              </View>
            </View>
          </View>
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
  datePickerButton: {
    backgroundColor: colors.faintGray,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerLabel: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.primary,
    width: 50,
  },
  datePickerValue: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginLeft: 8,
  },
  datePickerIcon: {
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

export default RescheduleModal;

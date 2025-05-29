import { colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppointments from "@/src/hooks/useAppointments";
import { useState } from "react";
import { format } from "date-fns";
import useAuth from "@/src/hooks/useAuth";
// Import components from the new location
import {
  AppointmentCard,
  FilterTabs,
  AppointmentDetails,
  RescheduleModal,
  PrescribeModal
} from '@/components/appointments';

// StatusBadge component has been moved to components/appointments/StatusBadge.tsx

// AppointmentCard component has been moved to components/appointments/AppointmentCard.tsx

// FilterTabs component has been moved to components/appointments/FilterTabs.tsx

export default function AppointmentsScreen() {
  const router = useRouter();
  const { accountInfo } = useAuth();
  const {
    appointments,
    selectedAppointment,
    loading,
    filter,
    setFilter,
    prescriptions,
    handleSelectAppointment,
    handleUpdateStatus,
    handleReschedule,
    handleInitiateCall,
  } = useAppointments();

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Render appointment details modal using the new component
  const renderDetailsModal = () => (
    <AppointmentDetails
      visible={showDetailsModal}
      appointment={selectedAppointment}
      prescriptions={prescriptions}
      onClose={() => setShowDetailsModal(false)}
      onUpdateStatus={(id, status: any) => {
        handleUpdateStatus(id, status);
        setShowDetailsModal(false);
      }}
      onReschedule={() => {
        setShowDetailsModal(false);
        setShowRescheduleModal(true);
      }}
      onPrescribe={() => {
        setShowDetailsModal(false);
        setShowPrescriptionModal(true);
      }}
      onInitiateCall={(userId) => {
        setShowDetailsModal(false);
        handleInitiateCall(userId);
      }}
    />
  );

  // Render reschedule modal using the new component
  const renderRescheduleModal = () => (
    <RescheduleModal
      visible={showRescheduleModal}
      onClose={() => setShowRescheduleModal(false)}
      onReschedule={(newDate) => {
        const formattedDate = format(newDate, 'yyyy-MM-dd');
        const formattedTime = format(newDate, 'HH:mm');

        if (selectedAppointment) {
          handleReschedule(selectedAppointment.id, formattedDate, formattedTime);
          setShowRescheduleModal(false);
        }
      }}
    />
  );

  // Render prescription modal using the new component
  const renderPrescriptionModal = () => (
    <PrescribeModal
      visible={showPrescriptionModal}
      appointmentId={selectedAppointment?.id || ''}
      doctorId={selectedAppointment?.doctorId || ''}
      patientId={selectedAppointment?.patientId || ''}
      onClose={() => setShowPrescriptionModal(false)}
      onSave={() => {
        setShowPrescriptionModal(false);
      }}
    />
  );

  return (
    <LinearGradient
      colors={[colors.tertiary, colors.tertiary, colors.green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View>
          <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
        >
          <FilterTabs
            activeFilter={filter}
            onFilterChange={setFilter}
          />
        </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.white} />
            <Text style={styles.emptyText}>No appointments found</Text>
            <TouchableOpacity
              style={styles.findDoctorButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.findDoctorText}>Find a Doctor</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppointmentCard
                appointment={item}
                onPress={() => {
                  handleSelectAppointment(item);
                  setShowDetailsModal(true);
                }}
              />
            )}
            contentContainerStyle={styles.appointmentsList}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Modals */}
        {renderDetailsModal()}
        {renderRescheduleModal()}
        {renderPrescriptionModal()}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  backButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
  },
  filterScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingRight: 16,
    marginBottom: 8,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterTab: {
    backgroundColor: colors.white,
  },
  filterText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: 'fontLight',
  },
  activeFilterText: {
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
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'fontLight',
  },
  findDoctorButton: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  findDoctorText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: 'fontBold',
  },
  appointmentsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  appointmentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: '#333',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginBottom: 4,
  },
  appointmentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: '#666',
    marginLeft: 4,
  },
  detailIcon: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'fontBold',
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.faintGray,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.primary,
    marginLeft: 4,
  },
  feeText: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.primary,
  },

  // Modal styles
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
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
  datePickerButton: {
    backgroundColor: colors.faintGray,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  datePickerButtonText: {
    fontFamily: 'fontLight',
    fontSize: 16,
    color: colors.tertiary,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
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
    backgroundColor: colors.faintGray,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  modalButtonText: {
    fontFamily: 'fontBold',
    fontSize: 16,
    color: colors.tertiary,
  },

  // Prescription styles
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
});

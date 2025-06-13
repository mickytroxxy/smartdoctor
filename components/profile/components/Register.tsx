import { colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Image, FlatList, Modal } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import useAuth from "@/src/hooks/useAuth";
import * as Animatable from 'react-native-animatable';
import TextArea from "@/components/ui/TextArea";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { updateTable } from "@/src/helpers/api";
import { Dropdown, ItemListType } from "@/components/ui/Dropdown";
import { AddressButton, Button } from "@/components/ui/Button";
import { CustomSwitch } from "@/components/ui/Switch";
import { DoctorSpecialty, LocationType } from "@/constants/Types";
import { useSecrets } from "@/src/hooks/useSecrets";

export default function RegisterDocScreen({showDoctorDialog, setShowDoctorDialog}: {showDoctorDialog: boolean, setShowDoctorDialog: (v: boolean) => void}) {
  const {accountInfo, setAccountInfo } = useAuth();
  const [practitionerNumber, setPractitionerNumber] = useState('');
  const [specialty, setSpecialty] = useState<DoctorSpecialty | ''>('');
  const [experience, setExperience] = useState('');
  const [about, setAbout] = useState('');
  const [fees, setFees] = useState('');
  const [address, setAddress] = useState<LocationType | null>(null);
  const [supportsHomeVisit, setSupportsHomeVisit] = useState(false);
  const [homeVisitFee, setHomeVisitFee] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {secrets} = useSecrets();
  const specialtyItems: ItemListType[] = secrets?.DOCTOR_SPECIALTIES?.map(id => ({ id, label: id, selected: specialty === id }));

  const handleDoctorDialogClose = () => {
    setShowDoctorDialog(false);
    setPractitionerNumber('');
    setSpecialty('');
    setExperience('');
    setAbout('');
    setFees('');
  };

  const handleDoctorSubmit = () => {
    if (!practitionerNumber || !specialty || !experience || !about || !fees) {
      alert('Please fill in all fields');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmBecomingDoctor = async () => {
    if (!accountInfo?.userId) return;
    setIsSubmitting(true);
    try {
      if (!specialty) {
        alert('Please select a valid specialty');
        setIsSubmitting(false);
        return;
      }
      const doctorData = {
        ...accountInfo,
        isDoctor: true,
        specialty: specialty as DoctorSpecialty,
        practitionerNumber,
        experience: parseInt(experience),
        about,
        isVerified:false,
        fees: parseInt(fees),
        education: ["Medical School"],
        certifications: ["Medical License"],
        rating: { average: 5, count: 1 },
        supportsHomeVisit,
        homeVisitFee: supportsHomeVisit ? parseInt(homeVisitFee) || 0 : 0,
        address: address?.text || '',
        location: address ? {
          latitude: address.latitude,
          longitude: address.longitude
        } : undefined
      };
      const success = await updateTable('users', accountInfo.userId, doctorData);
      if (success) {
        setAccountInfo(doctorData as any);
        setShowConfirmDialog(false);
        setShowDoctorDialog(false);
        alert('Congratulations! You are now registered as a doctor.');
      } else {
        alert('Failed to update account. Please try again.');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{flex:1}}>
        <Modal
            visible={showDoctorDialog}
            transparent
            animationType="slide"
            onRequestClose={handleDoctorDialogClose}
        >
            <View style={styles.modalOverlay}>
                <Animatable.View
                    animation="slideInUp"
                    duration={500}
                    style={styles.modalContainer}
                >
                    <LinearGradient
                    colors={['#4568dc', '#3a3a6a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.modalHeader}
                    >
                    <Text style={styles.modalTitle}>Register as a Doctor</Text>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={handleDoctorDialogClose}
                    >
                        <Ionicons name="close" size={24} color={colors.white} />
                    </TouchableOpacity>
                    </LinearGradient>
                    <ScrollView style={styles.modalContent}>
                    <Text style={styles.modalSubtitle}>
                        Please provide your professional details to register as a healthcare provider
                    </Text>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Practitioner Number</Text>
                        <TextArea
                        attr={{
                            icon: { name: 'medical-outline', type: 'Ionicons', color: colors.grey },
                            placeholder: 'Enter your medical license number',
                            field: 'practitionerNumber',
                            value: practitionerNumber,
                            handleChange: (_, value) => setPractitionerNumber(value)
                        }}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Specialty</Text>
                        <View style={{ marginTop: 10 }}>
                        <Dropdown
                            onChange={(item) => setSpecialty(item.id as DoctorSpecialty)}
                            itemList={specialtyItems}
                            placeholder="Select Specialty"
                        />
                        </View>
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Years of Experience</Text>
                        <TextArea
                        attr={{
                            icon: { name: 'calendar', type: 'Ionicons', color: colors.grey },
                            placeholder: 'E.g. 5',
                            field: 'experience',
                            value: experience,
                            keyboardType: 'numeric',
                            handleChange: (_, value) => setExperience(value)
                        }}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>About</Text>
                        <TextArea
                        attr={{
                            icon: { name: 'information-circle-outline', type: 'Ionicons', color: colors.grey },
                            placeholder: 'Brief description of your practice and expertise',
                            field: 'about',
                            value: about,
                            multiline: true,
                            handleChange: (_, value) => setAbout(value)
                        }}
                        style={{ height: 120 }}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Consultation Fee (USD)</Text>
                        <TextArea
                        attr={{
                            icon: { name: 'dollar-sign', type: 'Feather', color: colors.grey },
                            placeholder: 'E.g. 100',
                            field: 'fees',
                            value: fees,
                            keyboardType: 'numeric',
                            handleChange: (_, value) => setFees(value)
                        }}
                        />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Practice Location</Text>
                        <AddressButton
                        placeholder="Enter your practice location"
                        handleBtnClick={(location: LocationType) => setAddress(location)}
                        />
                    </View>
                    <CustomSwitch
                        attr={{
                        title: "Support Home Visits",
                        value: supportsHomeVisit,
                        handleChange: () => setSupportsHomeVisit(!supportsHomeVisit)
                        }}
                    />
                    {supportsHomeVisit && (
                        <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Home Visit Fee (Additional USD)</Text>
                        <TextArea
                            attr={{
                            icon: { name: 'home', type: 'Ionicons', color: colors.grey },
                            placeholder: 'E.g. 50',
                            field: 'homeVisitFee',
                            value: homeVisitFee,
                            keyboardType: 'numeric',
                            handleChange: (_, value) => setHomeVisitFee(value)
                            }}
                        />
                        </View>
                    )}
                    <Button
                        btnInfo={{
                        styles: {
                            marginTop: 20,
                            marginBottom: 20,
                        }
                        }}
                        textInfo={{
                        text: "Submit Application",
                        color: colors.primary
                        }}
                        iconInfo={{
                        name: "check-circle",
                        type: "Feather",
                        size: 20,
                        color: colors.primary
                        }}
                        handleBtnClick={handleDoctorSubmit}
                    />
                    </ScrollView>
                </Animatable.View>
            </View>
        </Modal>
        <ConfirmDialog
            visible={showConfirmDialog}
            title="Confirm Registration"
            message="Are you sure you want to register as a doctor? This will convert your account to a healthcare provider account."
            confirmText={isSubmitting ? "Processing..." : "Yes, Register"}
            cancelText="Cancel"
            onConfirm={handleConfirmBecomingDoctor}
            onCancel={() => setShowConfirmDialog(false)}
            type="info"
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent background
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  profileCard: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  profileCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statGradient: {
    padding: 15,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'fontBold',
    color: colors.white,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  header: {
    paddingTop: 0,
    paddingBottom: 30,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    zIndex: 10,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontFamily: 'fontBold',
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    marginTop: -20,
  },
  findDoctorSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  findDoctorCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 0,
  },
  findDoctorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  findDoctorTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  findDoctorTitle: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 5,
  },
  findDoctorSubtitle: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 10,
  },
  findDoctorButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  findDoctorButtonText: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.primary,
  },
  doctorIconContainer: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.5,
    zIndex: 0,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.primary,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  doctorList: {
    paddingRight: 20,
  },
  doctorCard: {
    width: 280,
    marginRight: 15,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  doctorCardContent: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  doctorAvatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  doctorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.faintGray,
  },
  doctorAvatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorAvatarText: {
    fontSize: 24,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  aiIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.orange,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  doctorRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorRatingText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  chatButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  optionSubtitle: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginVertical: 20,
    letterSpacing: 0.5,
  },
  becomeDoctorCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  becomeDoctorGradient: {
    padding: 20,
    borderRadius:10
  },
  becomeDoctorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  becomeDoctorTextContainer: {
    flex: 1,
  },
  becomeDoctorTitle: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 8,
  },
  becomeDoctorSubtitle: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  becomeDoctorIconContainer: {
    marginLeft: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    backgroundColor: colors.tertiary,
    overflow: 'hidden',
    borderWidth: 1,
    paddingBottom:30,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
    marginBottom: 8,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.white,
  },
});
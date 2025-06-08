import React, { useState } from "react";
import { colors } from "@/constants/Colors";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import useDoctor from "@/src/hooks/useDoctor";
import { currencyFormatter, showToast } from "@/src/helpers/methods";
import useAuth from "@/src/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { LinearButton } from "@/components/ui/Button";
import { AppointmentType } from "@/constants/Types";
import { Dropdown } from "@/components/ui/Dropdown";
import useRating from "@/src/hooks/useRating";
import RatingModal from "@/components/modals/RatingModal";
import useMedicalHistory from "@/src/hooks/useMedicalHistory";
import { useRouter } from "expo-router";

// Appointment Type Selector Component
const AppointmentTypeSelector = ({
  selectedType,
  onSelect,
  supportsHomeVisit
}: {
  selectedType: AppointmentType;
  onSelect: (type: AppointmentType) => void;
  supportsHomeVisit: boolean;
}) => {
  // Use ES6 spread to conditionally add home visit option
  const baseTypes = [
    { type: 'surgery' as AppointmentType, label: 'Surgery Visit', icon: 'medical' },
    { type: 'video' as AppointmentType, label: 'Video Call', icon: 'videocam' },
  ];

  const types = supportsHomeVisit
    ? [...baseTypes, { type: 'home' as AppointmentType, label: 'Home Visit', icon: 'home' }]
    : baseTypes;

  return (
    <LinearGradient
      colors={["#fff", "#ffffff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 10}}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.typeSelector}>
          {types.map(item => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.typeItem,
                selectedType === item.type && styles.typeItemSelected,
              ]}
              onPress={() => onSelect(item.type)}
              activeOpacity={0.7}
            >
              <View style={styles.typeIconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={selectedType === item.type ? colors.white : colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.typeText,
                  selectedType === item.type && styles.typeTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

// Date Selector Component
const DateSelector = ({
  selectedDate,
  onSelect
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) => {
  // Generate next 7 days using ES6 Array.from
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);

    // Destructure day names array for cleaner code
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return {
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      day: dayNames[date.getDay()],
      dayNum: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
    };
  });

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateSelector}
      >
        {dates.map(item => (
          <TouchableOpacity
            key={item.date}
            style={[
              styles.dateItem,
              selectedDate === item.date && styles.dateItemSelected,
            ]}
            onPress={() => onSelect(item.date)}
            activeOpacity={0.7}
          >
            {/* Use array map for text elements to reduce repetition */}
            {[
              { style: styles.dateDay, text: item.day },
              { style: styles.dateDayNum, text: item.dayNum },
              { style: styles.dateMonth, text: item.month }
            ].map((textItem, index) => (
              <Text
                key={index}
                style={[
                  textItem.style,
                  selectedDate === item.date && styles.dateTextSelected,
                ]}
              >
                {textItem.text}
              </Text>
            ))}

            {selectedDate === item.date && (
              <View style={styles.dateSelectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};


// Time Selector Component
const TimeSelector = ({
  selectedTime,
  onSelect
}: {
  selectedTime: string;
  onSelect: (time: string) => void;
}) => {
  // Generate time slots from 9 AM to 5 PM using ES6 Array.from
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9;
    // Use template literals for string formatting
    return {
      time: `${hour.toString().padStart(2, '0')}:00`,
      label: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
      available: Math.random() > 0.3, // Randomly mark some slots as unavailable for demo
    };
  });

  // Helper function for icon color using arrow function
  const getIconColor = (isSelected: boolean, isAvailable: boolean) =>
    isSelected ? colors.white : (isAvailable ? colors.primary : colors.grey);

  return (
    <View style={styles.timeSelector}>
      {timeSlots.map(item => (
        <View
          key={item.time}
          style={styles.timeItemContainer}
        >
          <TouchableOpacity
            style={[
              styles.timeItem,
              selectedTime === item.time && styles.timeItemSelected,
              !item.available && styles.timeItemUnavailable,
            ]}
            onPress={() => item.available && onSelect(item.time)}
            activeOpacity={item.available ? 0.7 : 1}
            disabled={!item.available}
          >
            <View style={styles.timeIconContainer}>
              <Ionicons
                name={selectedTime === item.time ? "time" : "time-outline"}
                size={16}
                color={getIconColor(selectedTime === item.time, item.available)}
              />
            </View>
            <Text
              style={[
                styles.timeText,
                selectedTime === item.time && styles.timeTextSelected,
                !item.available && styles.timeTextUnavailable,
              ]}
            >
              {item.label}
            </Text>
            {!item.available && <Text style={styles.unavailableText}>Booked</Text>}
            {selectedTime === item.time && <View style={styles.timeSelectedIndicator} />}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 10,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.tomato,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'fontLight',
  },
  doctorHeader: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.faintGray,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 45,
    backgroundColor: colors.primary,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'fontBold',
    color: colors.white,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: 16,
  },
  doctorName: {
    fontSize: 24,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 8,
  },
  specialtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(72, 108, 167, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  doctorSpecialty: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.primary,
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginLeft: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.faintGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  tabIcon: {
    marginRight: 8,
  },
  activeTab: {
    // Style handled by indicator
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    right: '25%',
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
  },
  activeTabText: {
    color: colors.primary,
    fontFamily: 'fontBold',
  },
  aboutContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.faintGray,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    lineHeight: 24,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'fontLight',
    color: colors.tertiary,
    marginBottom: 4,
  },
  feeText: {
    fontSize: 18,
    fontFamily: 'fontBold',
    color: colors.green,
    marginBottom: 4,
  },
  bookingContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: colors.primary,
  },
  bookingTitle: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 12,
    marginTop: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(72, 108, 167, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    marginRight: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  typeItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.primary,
  },
  typeTextSelected: {
    color: colors.white,
    fontFamily: 'fontBold',
  },
  dateSelector: {
    paddingVertical: 0,
  },
  dateItem: {
    width: 70,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 7,
    borderWidth: 0.6,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    position: 'relative',
    overflow: 'hidden',
  },
  dateItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDay: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginBottom: 4,
  },
  dateDayNum: {
    fontSize: 24,
    fontFamily: 'fontBold',
    color: colors.tertiary,
    marginBottom: 4,
  },
  dateMonth: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
  },
  dateTextSelected: {
    color: colors.white,
  },
  dateSelectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  timeItemContainer: {
    width: '31%',
    marginRight: '2%',
    marginBottom: 12,
  },
  timeItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 0.6,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  timeIconContainer: {
    marginRight: 6,
  },
  timeItemSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeItemUnavailable: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    opacity: 0.7,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.tertiary,
  },
  timeTextSelected: {
    color: colors.white,
    fontFamily: 'fontBold',
  },
  timeTextUnavailable: {
    color: colors.grey,
  },
  unavailableText: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 8,
    fontFamily: 'fontBold',
    color: colors.tomato,
  },
  timeSelectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.white,
    borderRadius: 2,
  },
  bookButton: {
    marginTop: 30,
  },
  bookButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  bookButtonIcon: {
    marginRight: 10,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'fontBold',
  },
  rateButton: {
    marginTop: 20,
  },
  currentRatingContainer: {
    marginBottom: 15,
  },
  userRatingContainer: {
    backgroundColor: colors.faintGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  userRatingText: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.primary,
    marginBottom: 5,
  },
  userRatingComment: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginLeft: 8,
    flex: 1,
  },
  cannotRateText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  medicalHistorySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  medicalHistoryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  medicalHistoryInfo: {
    flex: 1,
    marginRight: 15,
  },
  medicalHistoryTitle: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.green,
    marginBottom: 4,
  },
  medicalHistorySubtitle: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.green,
  },
  completeHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  completeHistoryText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.primary,
    flex: 1,
    marginLeft: 10,
  },
  historyPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginTop: 10,
  },
  historyPreviewTitle: {
    fontSize: 14,
    fontFamily: 'fontBold',
    color: colors.primary,
    marginBottom: 8,
  },
  historyPreviewText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.primary,
    marginBottom: 4,
  },
  editHistoryButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  editHistoryText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export const DoctorProfile = () => {
  const { activeUser, accountInfo } = useAuth();
  const router = useRouter();

  // State declarations
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'book'>(activeUser?.isAI ? 'about' : 'book');
  const [attachMedicalHistory, setAttachMedicalHistory] = useState(false);

  // Medical history functionality
  const { medicalHistory, isHistoryComplete } = useMedicalHistory();

  const {
    doctor,
    error,
    appointmentDate,
    setAppointmentDate,
    appointmentTime,
    setAppointmentTime,
    appointmentType,
    setAppointmentType,
    paymentMethods,
    handlePaymentMethodChange,
    bookAppointmentCheckAsyc,
  } = useDoctor(activeUser?.userId || '', attachMedicalHistory);

  // Rating functionality
  const {
    canRate,
    userRating,
    allRatings,
    loading: ratingLoading,
    submitting,
    handleSubmitRating,
  } = useRating(doctor?.userId || '');

  // Define tabs using ES6 object literals
  const tabs = [
    { id: 'book', label: 'Book Appointment', icon: 'calendar' },
    { id: 'about', label: 'About', icon: 'information-circle' }
  ];

  // Use arrow function for event handler
  const handleRateDoctor = () => {
    if (canRate) {
      setShowRatingModal(true);
    } else {
      showToast('You can only rate doctors after completing an appointment');
    }
  };

  // Early return pattern for error handling
  if (error || !doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load doctor details</Text>
      </View>
    );
  }

  // Define section content for reuse
  const aboutContent = (
    <View style={styles.aboutContainer}>
      {[
        { title: 'About', content: doctor.about, style: styles.aboutText },
        { title: 'Practitioner Number', content: doctor.practitionerNumber, style: styles.aboutText },
        { title: 'Experience', content: `${doctor.experience} years`, style: styles.infoText },
        {
          title: 'Consultation Fee',
          content: currencyFormatter(doctor?.fees || '0'),
          style: styles.feeText,
          extra: doctor.supportsHomeVisit && (
            <Text style={styles.infoText}>
              Home Visit Fee: {currencyFormatter(doctor?.fees || '0' + doctor?.homeVisitFee || '0')}
            </Text>
          )
        }
      ].map((section, index) => (
        <View key={index} style={styles.infoSection}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={section.style}>{section.content}</Text>
          {section.extra}
        </View>
      ))}
    </View>
  );

  const bookingContent = (
    <View style={styles.bookingContainer}>
      {[
        {
          title: 'Select Appointment Type',
          component: (
            <AppointmentTypeSelector
              selectedType={appointmentType}
              onSelect={setAppointmentType}
              supportsHomeVisit={doctor.supportsHomeVisit as any}
            />
          )
        },
        {
          title: 'Select Date',
          component: (
            <DateSelector
              selectedDate={appointmentDate}
              onSelect={setAppointmentDate}
            />
          )
        },
        {
          title: 'Select Time',
          component: (
            <TimeSelector
              selectedTime={appointmentTime}
              onSelect={setAppointmentTime}
            />
          )
        },
        {
          title: 'Payment Method',
          component: (
            <Dropdown
              itemList={paymentMethods}
              onChange={handlePaymentMethodChange}
              placeholder="Select Payment Method"
            />
          )
        },
        {
          title: 'Medical History',
          component: (
            <View style={styles.medicalHistorySection}>
              <View style={styles.medicalHistoryToggle}>
                <View style={styles.medicalHistoryInfo}>
                  <Text style={styles.medicalHistoryTitle}>
                    Attach Medical History
                  </Text>
                  <Text style={styles.medicalHistorySubtitle}>
                    {isHistoryComplete
                      ? 'Share your medical history with the doctor'
                      : 'Complete your medical history first'
                    }
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setAttachMedicalHistory(!attachMedicalHistory)}>
                  <Switch
                  value={attachMedicalHistory}
                  onValueChange={setAttachMedicalHistory}
                  trackColor={{ false: colors.grey, true: colors.primary }}
                  thumbColor={attachMedicalHistory ? colors.white : colors.white}
                  disabled={!isHistoryComplete}
                />
                </TouchableOpacity>
              </View>

              {(!isHistoryComplete && attachMedicalHistory) && (
                <TouchableOpacity
                  style={styles.completeHistoryButton}
                  onPress={() => router.push('/medical-history')}
                >
                  <Ionicons name="medical" size={20} color={colors.primary} />
                  <Text style={styles.completeHistoryText}>
                    Complete Medical History
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}

              {attachMedicalHistory && isHistoryComplete && (
                <View style={styles.historyPreview}>
                  <Text style={styles.historyPreviewTitle}>
                    Medical History Summary
                  </Text>
                  <Text style={styles.historyPreviewText}>
                    • Medical conditions: {medicalHistory?.currentConditions ? 'Provided' : 'Not provided'}
                  </Text>
                  <Text style={styles.historyPreviewText}>
                    • Current medications: {medicalHistory?.currentMedications ? 'Provided' : 'Not provided'}
                  </Text>
                  <Text style={styles.historyPreviewText}>
                    • Known allergies: {medicalHistory?.allergies ? 'Provided' : 'Not provided'}
                  </Text>
                  <TouchableOpacity
                    style={styles.editHistoryButton}
                    onPress={() => router.push('/medical-history')}
                  >
                    <Text style={styles.editHistoryText}>Edit History</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )
        }
      ].map((section, index) => (
        <React.Fragment key={index}>
          <Text style={styles.bookingTitle}>{section.title}</Text>
          {section.component}
        </React.Fragment>
      ))}

      <View style={styles.bookButton}>
        <LinearButton
          handleBtnClick={bookAppointmentCheckAsyc}
          textInfo={{ text: "Book Appointment", color: colors.tertiary }}
          iconInfo={{ type: "Ionicons", name: "calendar-outline", size: 20, color: colors.tertiary }}
        />
      </View>
    </View>
  );

  // Rating section - Only show for patients
  const ratingSection = !accountInfo?.isDoctor && (
    <View style={[styles.aboutContainer, { marginTop: 20 }]}>
      <Text style={styles.sectionTitle}>Rate Doctor</Text>

      {/* Show current doctor rating */}
      <View style={styles.currentRatingContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FontAwesome
              key={star}
              name={
                doctor?.ratings && doctor.ratings.length > 0
                  ? (doctor.ratings.reduce((acc, curr) => acc + curr.rating, 0) / doctor.ratings.length) >= star
                    ? "star" : "star-o"
                  : "star-o"
              }
              size={20}
              color="#FFD700"
              style={{ marginRight: 2 }}
            />
          ))}
          <Text style={styles.ratingText}>
            {doctor?.ratings && doctor.ratings.length > 0
                    ? (doctor.ratings.reduce((acc, curr) => acc + curr.rating, 0) / doctor.ratings.length).toFixed(1)
                    : "0.0"} ({doctor?.ratings?.length || 0})
          </Text>
        </View>
      </View>

      {/* User's rating status */}
      {userRating && (
        <View style={styles.userRatingContainer}>
          <Text style={styles.userRatingText}>Your Rating:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome
                key={star}
                name={star <= userRating.rating ? "star" : "star-o"}
                size={16}
                color="#FFD700"
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={styles.userRatingComment}>"{userRating.message}"</Text>
          </View>
        </View>
      )}

      {/* Rating button */}
      <View style={styles.rateButton}>
        <LinearButton
          handleBtnClick={handleRateDoctor}
          textInfo={{
            text: userRating ? "Update Rating" : "Rate Doctor",
            color: canRate ? colors.tertiary : colors.grey
          }}
          iconInfo={{
            type: "FontAwesome",
            name: "star",
            size: 20,
            color: canRate ? colors.tertiary : colors.grey
          }}
          btnInfo={{
            styles: {
              backgroundColor: canRate ? colors.white : colors.faintGray,
              borderColor: canRate ? colors.tertiary : colors.grey,
              borderWidth: 1
            }
          }}
          disabled={!canRate}
        />
      </View>

      {!canRate && (
        <Text style={styles.cannotRateText}>
          Complete an appointment to rate this doctor
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!activeUser?.isAI &&
            <View style={styles.tabContainer}>
                {tabs.map(tab => (
                    <TouchableOpacity
                    key={tab.id}
                    style={[
                        styles.tab,
                        activeTab === tab.id && styles.activeTab
                    ]}
                    onPress={() => setActiveTab(tab.id as 'about' | 'book')}
                    activeOpacity={0.7}
                    >
                    <Ionicons
                        name={tab.icon as any}
                        size={20}
                        color={activeTab === tab.id ? colors.primary : colors.grey}
                        style={styles.tabIcon}
                    />
                    <Text
                        style={[
                        styles.tabText,
                        activeTab === tab.id && styles.activeTabText
                        ]}
                    >
                        {tab.label}
                    </Text>
                    {activeTab === tab.id && <View style={styles.activeTabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>
        }

        {activeTab === 'about' ? aboutContent : bookingContent}
        {ratingSection}
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleSubmitRating}
        doctorName={doctor?.fname || 'Doctor'}
        existingRating={userRating ? { rating: userRating.rating, message: userRating.message } : null}
        submitting={submitting}
      />
    </View>
  );
};
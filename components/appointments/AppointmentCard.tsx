import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/Colors';
import { Appointment } from '@/src/types/doctorTypes';
import StatusBadge from './StatusBadge';
import useAuth from '@/src/hooks/useAuth';
import { currencyFormatter } from '@/src/helpers/methods';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onPress }) => {
  const { accountInfo } = useAuth();
  const isDoctor = accountInfo?.isDoctor;
  
  // Determine which name to display based on user role
  const displayName = isDoctor ? appointment.patientName : appointment.doctorName;
  const displayInitial = displayName.charAt(0);
  const displaySpecialty = isDoctor ? "Patient" : appointment.doctorSpecialty;
  
  return (
    <TouchableOpacity
      style={styles.appointmentCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayInitial}</Text>
          </View>
        </View>
        <View style={styles.appointmentInfo}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.specialty}>{displaySpecialty}</Text>
          <View style={styles.appointmentDetails}>
            <Ionicons name="calendar" size={14} color={colors.grey} />
            <Text style={styles.detailText}>{appointment.date}</Text>
            <Ionicons name="time" size={14} color={colors.grey} style={styles.detailIcon} />
            <Text style={styles.detailText}>{appointment.time}</Text>
          </View>
        </View>
        <StatusBadge status={appointment.status} />
      </View>
      <View style={styles.appointmentFooter}>
        <View style={styles.leftFooter}>
          <View style={styles.typeContainer}>
            <Ionicons
              name={
                appointment.type === 'surgery'
                  ? 'medical'
                  : appointment.type === 'video'
                    ? 'videocam'
                    : 'home'
              }
              size={16}
              color={colors.primary}
            />
            <Text style={styles.typeText}>
              {appointment.type === 'surgery'
                ? 'Surgery Visit'
                : appointment.type === 'video'
                  ? 'Video Call'
                  : 'Home Visit'
              }
            </Text>
          </View>

          <View style={styles.paymentContainer}>
            <Ionicons
              name={
                appointment.paymentMethod === 'medical_aid'
                  ? 'medical'
                  : appointment.paymentMethod === 'card'
                    ? 'card'
                    : 'cash'
              }
              size={14}
              color={colors.grey}
            />
            <Text style={styles.paymentText}>
              {appointment.paymentMethod === 'medical_aid'
                ? 'Medical Aid'
                : appointment.paymentMethod === 'card'
                  ? 'Card'
                  : 'Cash'
              }
            </Text>
          </View>
        </View>

        <Text style={styles.feeText}>{currencyFormatter(appointment.fee)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  name: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
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
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.faintGray,
  },
  leftFooter: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeText: {
    fontSize: 14,
    fontFamily: 'fontLight',
    color: colors.primary,
    marginLeft: 4,
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 12,
    fontFamily: 'fontLight',
    color: colors.grey,
    marginLeft: 4,
  },
  feeText: {
    fontSize: 16,
    fontFamily: 'fontBold',
    color: colors.primary,
  },
});

export default AppointmentCard;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/Colors';
import { AppointmentStatus } from '@/src/types/doctorTypes';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'confirmed':
        return colors.green;
      case 'pending':
        return colors.orange;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.tomato;
      default:
        return colors.grey;
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: 'fontBold',
  },
});

export default StatusBadge;

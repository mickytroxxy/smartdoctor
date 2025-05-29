import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/Colors';
import { AppointmentStatus } from '@/src/types/doctorTypes';

interface FilterTabsProps {
  activeFilter: AppointmentStatus | 'all';
  onFilterChange: (filter: AppointmentStatus | 'all') => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ activeFilter, onFilterChange }) => {
  const filters: (AppointmentStatus | 'all')[] = [
    'all',
    'pending',
    'confirmed',
    'completed',
    'cancelled',
  ];

  return (
    <View style={styles.filterContainer}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterTab,
            activeFilter === filter ? styles.activeFilterTab : null,
          ]}
          onPress={() => onFilterChange(filter)}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === filter ? styles.activeFilterText : null,
            ]}
          >
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default FilterTabs;

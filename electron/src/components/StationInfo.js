import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const StationInfo = ({ station, wallet }) => {
  return (
    <View style={styles.container}>
      <View style={styles.infoItem}>
        <MaterialCommunityIcons name="flash" size={24} color="#FF9800" />
        <View>
          <Text style={styles.label}>Power Output</Text>
          <Text style={styles.value}>{station.power} PowerWatts</Text>
        </View>
      </View>

      <View style={styles.infoItem}>
        <MaterialCommunityIcons name="currency-usd" size={24} color="#4CAF50" />
        <View>
          <Text style={styles.label}>Price per Unit</Text>
          <Text style={styles.value}>{station.pricePerUnit} {wallet.currency}/hour</Text>
        </View>
      </View>

      {station.available ? (
        <View style={[styles.statusBadge, styles.availableBadge]}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.statusText}>Available</Text>
        </View>
      ) : (
        <View style={[styles.statusBadge, styles.occupiedBadge]}>
          <MaterialCommunityIcons name="close-circle" size={20} color="#F44336" />
          <Text style={styles.statusText}>Occupied</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 12,
  },
  value: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  availableBadge: {
    backgroundColor: '#E8F5E9',
  },
  occupiedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StationInfo;
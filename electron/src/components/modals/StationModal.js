import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StationInfo from '../StationInfo';

const StationModal = ({ 
  visible, 
  onClose, 
  station, 
  wallet,
  onNavigate,
  onReserve 
}) => {
  const calculateChargingTime = () => {
    return (wallet.balance / station?.pricePerUnit).toFixed(1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{station?.name}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <StationInfo station={station} wallet={wallet} />

          <View style={styles.maxTimeInfo}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#2196F3" />
            <View style={styles.timeTextContainer}>
              <Text style={styles.timeLabel}>Max Charging Time (Your Balance)</Text>
              <Text style={styles.timeValue}>{calculateChargingTime()} hours</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.navigateButton]}
              onPress={onNavigate}
            >
              <MaterialCommunityIcons name="navigation" size={22} color="#FFF" />
              <Text style={styles.actionButtonText}>Navigate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.reserveButton,
                !station?.available && styles.disabledButton
              ]}
              onPress={onReserve}
              disabled={!station?.available}
            >
              <MaterialCommunityIcons name="calendar-clock" size={22} color="#FFF" />
              <Text style={styles.actionButtonText}>Reserve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  maxTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  timeTextContainer: {
    marginLeft: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#757575',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 6,
  },
  navigateButton: {
    backgroundColor: '#2196F3',
  },
  reserveButton: {
    backgroundColor: '#FF9800',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    opacity: 0.7,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default StationModal;
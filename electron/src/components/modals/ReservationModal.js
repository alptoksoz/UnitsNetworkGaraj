import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ReservationModal = ({ 
  visible, 
  onClose, 
  station, 
  wallet, 
  onConfirm 
}) => {
  const [reservationTime, setReservationTime] = useState(1);
  
  const totalCost = reservationTime * station?.pricePerUnit;
  const hasEnoughFunds = wallet.balance >= totalCost;

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
            <Text style={styles.title}>Reserve Charging Time</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <Text style={styles.stationName}>{station?.name}</Text>

          <View style={styles.timeSelector}>
            <Text style={styles.label}>Charging Duration (hours)</Text>
            
            <View style={styles.timeControls}>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setReservationTime(Math.max(0.5, reservationTime - 0.5))}
              >
                <MaterialCommunityIcons name="minus" size={24} color="#333" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.timeInput}
                value={reservationTime.toString()}
                onChangeText={(text) => {
                  const value = parseFloat(text);
                  if (!isNaN(value) && value > 0) {
                    setReservationTime(value);
                  }
                }}
                keyboardType="numeric"
              />
              
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setReservationTime(reservationTime + 0.5)}
              >
                <MaterialCommunityIcons name="plus" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.costSummary}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Rate</Text>
              <Text style={styles.costValue}>
                {station?.pricePerUnit} {wallet.currency}/hour
              </Text>
            </View>
            
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Duration</Text>
              <Text style={styles.costValue}>{reservationTime} hours</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.costRow}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>
                {totalCost.toFixed(2)} {wallet.currency}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.confirmButton,
              !hasEnoughFunds && styles.disabledButton
            ]}
            onPress={() => onConfirm(reservationTime)}
            disabled={!hasEnoughFunds}
          >
            <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
          </TouchableOpacity>

          {!hasEnoughFunds && (
            <Text style={styles.errorText}>
              Insufficient funds. Please add more {wallet.currency} or reduce time.
            </Text>
          )}
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
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  stationName: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 24,
  },
  timeSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeInput: {
    width: 80,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
  },
  costSummary: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#757575',
  },
  costValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    opacity: 0.7,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ReservationModal;
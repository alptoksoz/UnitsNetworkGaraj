import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ActiveChargingScreen = () => {
  // Mock active charging sessions
  const [activeCharges, setActiveCharges] = useState([
    {
      id: '1',
      stationName: 'Kızılay Charging Station',
      power: 50,
      timeRemaining: 45,
      currentCost: 25.5,
      currentCharge: 35,
      maxCharge: 60,
      startTime: '14:30',
    }
  ]);

  // Mock reservations
  const [reservations, setReservations] = useState([
    {
      id: '1',
      stationName: 'Çankaya Charging Station',
      startTime: '16:00',
      timeUntilStart: 90,
      duration: 60,
    }
  ]);

  const handleStopCharging = (sessionId) => {
    Alert.alert(
      'Stop Charging',
      'Are you sure you want to stop this charging session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: () => {
            setActiveCharges(prev => prev.filter(charge => charge.id !== sessionId));
          },
        },
      ]
    );
  };

  const handleCancelReservation = (reservationId) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this reservation?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => {
            setReservations(prev => prev.filter(res => res.id !== reservationId));
          },
        },
      ]
    );
  };

  const renderActiveCharge = ({ item }) => (
    <View style={styles.chargeCard}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="ev-station" size={24} color="#2E7D32" />
        <Text style={styles.stationName}>{item.stationName}</Text>
      </View>

      <View style={styles.chargeInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="flash" size={20} color="#FF9800" />
            <View>
              <Text style={styles.infoLabel}>Power</Text>
              <Text style={styles.infoValue}>{item.power} PowerWatts</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#2196F3" />
            <View>
              <Text style={styles.infoLabel}>Remaining</Text>
              <Text style={styles.infoValue}>{item.timeRemaining} min</Text>
            </View>
          </View>
        </View>

        <View style={styles.chargeProgress}>
          <View style={styles.progressLabel}>
            <Text style={styles.progressText}>Charging Progress</Text>
            <Text style={styles.progressValue}>
              {item.currentCharge}/{item.maxCharge} kWh
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(item.currentCharge / item.maxCharge) * 100}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.costInfo}>
          <Text style={styles.costLabel}>Current Cost</Text>
          <Text style={styles.costValue}>{item.currentCost} EnergyToken</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.stopButton}
        onPress={() => handleStopCharging(item.id)}
      >
        <MaterialCommunityIcons name="stop-circle" size={24} color="#FFFFFF" />
        <Text style={styles.stopButtonText}>Stop Charging</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReservation = ({ item }) => (
    <View style={styles.reservationCard}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="calendar-clock" size={24} color="#FF9800" />
        <Text style={styles.stationName}>{item.stationName}</Text>
      </View>

      <View style={styles.reservationInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock" size={20} color="#2196F3" />
            <View>
              <Text style={styles.infoLabel}>Start Time</Text>
              <Text style={styles.infoValue}>{item.startTime}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="timer" size={20} color="#4CAF50" />
            <View>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{item.duration} min</Text>
            </View>
          </View>
        </View>

        <View style={styles.timeUntilStart}>
          <Text style={styles.timeUntilLabel}>Time until start:</Text>
          <Text style={styles.timeUntilValue}>{item.timeUntilStart} minutes</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={() => handleCancelReservation(item.id)}
      >
        <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.activeSection}>
        <Text style={styles.sectionTitle}>Active Charging Sessions</Text>
        {activeCharges.length > 0 ? (
          <FlatList
            data={activeCharges}
            renderItem={renderActiveCharge}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="battery-outline" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No active charging sessions</Text>
          </View>
        )}
      </View>

      <View style={styles.reservationSection}>
        <Text style={styles.sectionTitle}>Upcoming Reservations</Text>
        {reservations.length > 0 ? (
          <FlatList
            data={reservations}
            renderItem={renderReservation}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No upcoming reservations</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  activeSection: {
    flex: 1,
    marginBottom: 16,
  },
  reservationSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  chargeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 12,
  },
  chargeInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 8,
  },
  chargeProgress: {
    marginBottom: 16,
  },
  progressLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#757575',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  costInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#757575',
  },
  costValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reservationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reservationInfo: {
    marginBottom: 16,
  },
  timeUntilStart: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeUntilLabel: {
    fontSize: 14,
    color: '#2196F3',
  },
  timeUntilValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  cancelButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
  },
});

export default ActiveChargingScreen;
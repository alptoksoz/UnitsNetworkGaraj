import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TransactionHistoryScreen = () => {
  // Mock transaction data
  const transactions = [
    {
      id: '1',
      type: 'charge',
      stationName: 'Kızılay Station',
      amount: 25.5,
      date: '2025-02-15 14:30',
      duration: 60,
      power: 50
    },
    {
      id: '2',
      type: 'reservation',
      stationName: 'Çankaya Station',
      amount: 30.0,
      date: '2025-02-14 16:45',
      duration: 90
    },
    {
      id: '3',
      type: 'deposit',
      amount: 100.0,
      date: '2025-02-13 10:00'
    }
  ];

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionCard}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={
            item.type === 'charge' ? 'ev-station' : 
            item.type === 'reservation' ? 'calendar-clock' : 'wallet-plus'
          } 
          size={24} 
          color={item.type === 'deposit' ? '#4CAF50' : '#FF9800'} 
        />
      </View>

      <View style={styles.transactionInfo}>
        <View style={styles.headerRow}>
          <Text style={styles.stationName}>
            {item.type === 'deposit' ? 'Wallet Deposit' : item.stationName}
          </Text>
          <Text 
            style={[
              styles.amount,
              item.type === 'deposit' ? styles.depositAmount : styles.spendAmount
            ]}
          >
            {item.type === 'deposit' ? '+' : '-'}{item.amount} EnergyToken
          </Text>
        </View>

        <Text style={styles.date}>{item.date}</Text>

        {item.type !== 'deposit' && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#757575" />
              <Text style={styles.detailText}>{item.duration} min</Text>
            </View>

            {item.type === 'charge' && (
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="flash" size={16} color="#757575" />
                <Text style={styles.detailText}>{item.power} PowerWatts</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>
              {transactions
                .filter(t => t.type !== 'deposit')
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)} EnergyToken
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Charged</Text>
            <Text style={styles.statValue}>
              {transactions
                .filter(t => t.type === 'charge')
                .reduce((sum, t) => sum + t.duration, 0)} min
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  listContent: {
    padding: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  depositAmount: {
    color: '#4CAF50',
  },
  spendAmount: {
    color: '#FF9800',
  },
  date: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
  },
});

export default TransactionHistoryScreen;
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const WalletModal = ({ 
  visible, 
  onClose, 
  wallet,
  transactions,
  onDisconnect 
}) => {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(wallet.address);
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIconContainer}>
        <MaterialCommunityIcons 
          name={
            item.type === 'charge' ? 'ev-station' : 
            item.type === 'reservation' ? 'calendar-clock' : 'wallet-plus'
          } 
          size={22} 
          color={item.type === 'deposit' ? '#4CAF50' : '#FF9800'} 
        />
      </View>
      
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionTitle}>{item.stationName}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      
      <Text 
        style={[
          styles.transactionAmount,
          item.type === 'deposit' ? styles.depositAmount : styles.spendAmount
        ]}
      >
        {item.type === 'deposit' ? '+' : '-'}{item.amount} {wallet.currency}
      </Text>
    </View>
  );

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
            <Text style={styles.title}>Wallet Details</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceValue}>{wallet.balance.toFixed(2)}</Text>
            <Text style={styles.currencyText}>{wallet.currency}</Text>
          </View>

          <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <View style={styles.addressBox}>
              <Text style={styles.addressValue}>{wallet.address}</Text>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={copyToClipboard}
              >
                <MaterialCommunityIcons name="content-copy" size={20} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.transactionsSection}>
            <Text style={styles.transactionsLabel}>Recent Transactions</Text>
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={item => item.id}
              style={styles.transactionsList}
            />
          </View>

          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={onDisconnect}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#FFF" />
            <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
          </TouchableOpacity>
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
    maxHeight: '90%',
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
  balanceSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  currencyText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 4,
  },
  addressSection: {
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addressValue: {
    flex: 1,
    fontSize: 14,
    color: '#757575',
  },
  copyButton: {
    padding: 4,
  },
  transactionsSection: {
    flex: 1,
    marginBottom: 20,
  },
  transactionsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  transactionsList: {
    maxHeight: 300,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    color: '#333333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  depositAmount: {
    color: '#4CAF50',
  },
  spendAmount: {
    color: '#FF9800',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  disconnectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default WalletModal;
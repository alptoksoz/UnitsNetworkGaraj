import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const WalletHeader = ({ wallet, onPress }) => {
  const formatBalance = (balance) => {
    if (balance === null || balance === undefined) return '0.00';
    return typeof balance === 'number' ? balance.toFixed(2) : '0.00';
  };

  const formatAddress = (address) => {
    if (!address) return '...';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="wallet" size={22} color="#2E7D32" />
        <Text style={styles.balance}>
          {formatBalance(wallet?.balance)} {wallet?.currency || 'ETH'}
        </Text>
      </View>
      <Text style={styles.address}>{formatAddress(wallet?.address)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balance: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  address: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
});

export default WalletHeader;
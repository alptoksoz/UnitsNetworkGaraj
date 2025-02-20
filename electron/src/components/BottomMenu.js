// components/BottomMenu.js
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const BottomMenu = ({ onQRPress, onActivePress, onHistoryPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={onHistoryPress}>
        <MaterialCommunityIcons name="history" size={28} color="#2E7D32" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.qrButton} onPress={onQRPress}>
        <MaterialCommunityIcons name="qrcode-scan" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={onActivePress}>
        <MaterialCommunityIcons name="lightning-bolt" size={28} color="#2E7D32" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  qrButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default BottomMenu;
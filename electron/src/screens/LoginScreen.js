import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Animated,
  Easing,
  Alert,
  Modal,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const { connect, isConnected, wcUri, handleConnectionApproval, setWcUri } = useWallet();

  useEffect(() => {
    if (isConnected) {
      navigation.replace('MainApp');
    }
  }, [isConnected]);

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: false
    }).start();

    try {
      const { uri, approval } = await connect();
      if (approval) {
        await handleConnectionApproval(approval);
      }
    } catch (error) {
      console.error("Connection error:", error);
      Alert.alert(
        "Connection Error",
        "Failed to connect to wallet. Please try again."
      );
      setIsConnecting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/150x150' }} 
            style={styles.logo}
          />
          <Text style={styles.appName}>EcoCharge</Text>
          <Text style={styles.tagline}>Charge Smartly, Pay Crypto</Text>
        </View>
        
        <View style={styles.walletSection}>
          <View style={styles.walletCard}>
            <MaterialCommunityIcons 
              name="wallet-outline" 
              size={48} 
              color="#2E7D32" 
            />
            <Text style={styles.walletTitle}>Connect Your Crypto Wallet</Text>
            <Text style={styles.walletDescription}>
              Connect your MetaMask wallet to access charging stations and manage 
              payments securely with cryptocurrency.
            </Text>
            
            {isConnecting ? (
              <View style={styles.connectingContainer}>
                <View style={styles.progressContainer}>
                  <Animated.View 
                    style={[
                      styles.progressBar,
                      {
                        width: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.connectingText}>Connecting to wallet...</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.connectButton} 
                onPress={handleWalletConnect}
              >
                <Text style={styles.connectButtonText}>Connect MetaMask</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Modal */}
        <Modal
          visible={!!wcUri}
          transparent
          animationType="slide"
          onRequestClose={() => setWcUri(null)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Scan with MetaMask</Text>
              {wcUri && (
                <View style={styles.qrContainer}>
                  <QRCode
                    value={wcUri}
                    size={250}
                    backgroundColor="white"
                    color="#000000"
                  />
                </View>
              )}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setWcUri(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  walletSection: {
    flex: 1,
    justifyContent: 'center',
  },
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 16,
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  walletDescription: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  connectButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connectingContainer: {
    width: '100%',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2E7D32',
  },
  connectingText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  helpButton: {
    paddingVertical: 12,
  },
  helpButtonText: {
    color: '#2E7D32',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: width - 40,
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333333',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    marginTop: 20,
    padding: 14,
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default LoginScreen;
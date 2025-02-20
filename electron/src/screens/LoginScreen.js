import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Animated,
  Easing
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [progress] = useState(new Animated.Value(0));

  const handleWalletConnect = () => {
    setIsConnecting(true);
    
    // Animate progress bar
    Animated.timing(progress, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: false
    }).start(() => {
      // Mock wallet connection
      setTimeout(() => {
        navigation.replace('MainApp');
      }, 500);
    });
  };

  return (
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
            Connect your digital wallet to access charging stations and manage 
            payments securely.
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
              <Text style={styles.connectButtonText}>Connect Wallet</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity style={styles.helpButton}>
          <Text style={styles.helpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },

  header: {
    alignItems: 'center',
    marginTop: 60,
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
  },
  walletTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 12,
  },
  walletDescription: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
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
});

export default LoginScreen;
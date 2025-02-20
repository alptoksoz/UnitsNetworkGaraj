import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

import WalletHeader from '../components/WalletHeader';
import BottomMenu from '../components/BottomMenu';
import StationModal from '../components/modals/StationModal';
import ReservationModal from '../components/modals/ReservationModal';
import WalletModal from '../components/modals/WalletModal';
import QRScanner from '../components/QRScanner';

const MapScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationModalVisible, setStationModalVisible] = useState(false);
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [qrScannerVisible, setQRScannerVisible] = useState(false);

  // Mock wallet data
  const [wallet] = useState({
    address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    balance: 230.45,
    currency: 'EnergyToken'
  });

  // Mock charging stations data
  const stations = [
    { 
      id: 1, 
      name: 'Kızılay Charging Station', 
      lat: 39.92077, 
      lon: 32.85411, 
      power: 50, 
      pricePerUnit: 2.2, 
      available: true 
    },
    { 
      id: 2, 
      name: 'Çankaya Charging Station', 
      lat: 39.91077, 
      lon: 32.85211, 
      power: 30, 
      pricePerUnit: 1.8, 
      available: true 
    },
    { 
      id: 3, 
      name: 'Eryaman Charging Station', 
      lat: 39.97667, 
      lon: 32.67942, 
      power: 40, 
      pricePerUnit: 2.5, 
      available: false 
    }
  ];

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation(location.coords);
        } else {
          Alert.alert(
            "Location Permission",
            "Please enable location services to find charging stations near you."
          );
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setStationModalVisible(true);
  };

  const handleNavigation = async (station) => {
    if (!station) return;
    
    try {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lon}`;
      const supported = await Linking.canOpenURL(url);
  
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "Google Maps could not be opened."
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred while opening the map."
      );
    }
  };

  const handleQRScan = (data) => {
    try {
      setQRScannerVisible(false);
      // Handle QR scan data
      console.log('QR Data:', data);
      
      // Örnek QR data işleme
      if (data && data.stationId) {
        const station = stations.find(s => s.id === data.stationId);
        if (station) {
          handleStationSelect(station);
        } else {
          Alert.alert("Error", "Station not found");
        }
      }
    } catch (error) {
      Alert.alert("Error", "Invalid QR code data");
    }
  };

  const handleReservation = (time) => {
    if (!selectedStation) return;

    const cost = time * selectedStation.pricePerUnit;
    
    // Mock reservation işlemi
    Alert.alert(
      "Reservation Confirmed",
      `You have reserved ${selectedStation.name} for ${time} hours.\nTotal cost: ${cost} ${wallet.currency}`,
      [{ text: "OK", onPress: () => setReservationModalVisible(false) }]
    );
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: 39.92077,
          longitude: 32.85411,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {stations.map(station => (
          <Marker 
            key={station.id}
            coordinate={{ 
              latitude: station.lat, 
              longitude: station.lon 
            }}
            onPress={() => handleStationSelect(station)}
            pinColor={station.available ? '#2E7D32' : '#757575'}
            title={station.name}
            description={`${station.power} PowerWatts - ${station.available ? 'Available' : 'Occupied'}`}
          />
        ))}
      </MapView>

      <WalletHeader 
        wallet={wallet}
        onPress={() => setWalletModalVisible(true)}
      />

      <BottomMenu 
        onQRPress={() => setQRScannerVisible(true)}
        onActivePress={() => navigation.navigate('Active')}
        onHistoryPress={() => navigation.navigate('History')}
      />

      {selectedStation && (
        <StationModal
          visible={stationModalVisible}
          onClose={() => setStationModalVisible(false)}
          station={selectedStation}
          wallet={wallet}
          onNavigate={() => handleNavigation(selectedStation)}
          onReserve={() => {
            setStationModalVisible(false);
            setReservationModalVisible(true);
          }}
        />
      )}

      {selectedStation && (
        <ReservationModal
          visible={reservationModalVisible}
          onClose={() => setReservationModalVisible(false)}
          station={selectedStation}
          wallet={wallet}
          onConfirm={handleReservation}
        />
      )}

      <WalletModal
        visible={walletModalVisible}
        onClose={() => setWalletModalVisible(false)}
        wallet={wallet}
        transactions={[]} // Add mock transactions
        onDisconnect={() => navigation.replace('Login')}
      />

      {qrScannerVisible && (
        <QRScanner
          visible={qrScannerVisible}
          onClose={() => setQRScannerVisible(false)}
          onScanSuccess={handleQRScan}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapScreen;
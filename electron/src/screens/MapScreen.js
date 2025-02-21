import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Linking, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useWallet } from '../context/WalletContext';

import WalletHeader from '../components/WalletHeader';
import BottomMenu from '../components/BottomMenu';
import StationModal from '../components/modals/StationModal';
import ReservationModal from '../components/modals/ReservationModal';
import WalletModal from '../components/modals/WalletModal';
import QRScanner from '../components/QRScanner';

const MapScreen = ({ navigation }) => {
  const { address, balance } = useWallet();
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationModalVisible, setStationModalVisible] = useState(false);
  const [reservationModalVisible, setReservationModalVisible] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [qrScannerVisible, setQRScannerVisible] = useState(false);

  // Wallet data
  const [wallet, setWallet] = useState({
    address: address,
    balance: balance,
    currency: 'ETH'
  });

  // Local stations data
  const stations = [
    {
      id: "67b786c7eac1d7ec88f1aa47",
      name: "Tesla Supercharger - Istanbul",
      lat: 41.0082,
      lon: 28.9784,
      power: 150,
      pricePerUnit: 1.5,
      available: false,
      nextAvailableTime: "2025-02-21T03:00:00.000Z"
    },
    {
      id: "67b78754eac1d7ec88f1aa49",
      name: "EVgo - Istanbul",
      lat: 41.5082,
      lon: 28.2784,
      power: 150,
      pricePerUnit: 1.5,
      available: false,
      nextAvailableTime: "2025-02-21T22:00:00.000Z"
    },
    {
      id: "67b78768eac1d7ec88f1aa4b",
      name: "Alp - Istanbul",
      lat: 41.9082,
      lon: 28.9784,
      power: 150,
      pricePerUnit: 1.5,
      available: true,
      nextAvailableTime: null
    },
    {
      id: "67b788ceeac1d7ec88f1aa50",
      name: "Berat - Istanbul",
      lat: 41.9082,
      lon: 28.1784,
      power: 50,
      pricePerUnit: 0.5,
      available: true,
      nextAvailableTime: null
    },
    {
      id: "67b788e9eac1d7ec88f1aa52",
      name: "Enes - Istanbul",
      lat: 41.4082,
      lon: 28.2784,
      power: 250,
      pricePerUnit: 4.5,
      available: true,
      nextAvailableTime: null
    },
    {
      id: "67b8527ddea87375ad6e9901",
      name: "Test Charging Station",
      lat: 39.92077,
      lon: 32.85411,
      power: 50,
      pricePerUnit: 2.5,
      available: true,
      nextAvailableTime: null
    },
    {
      id: "67b85592bf7a23f03a253041",
      name: "Test Charging Station 2",
      lat: 39.92077,
      lon: 32.85411,
      power: 50,
      pricePerUnit: 2.5,
      available: true,
      nextAvailableTime: null
    }
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (address && balance) {
      setWallet({
        address: address,
        balance: balance,
        currency: 'ETH'
      });
    }
  }, [address, balance]);

  const requestLocationPermission = async () => {
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
  };

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
        Alert.alert("Error", "Google Maps could not be opened.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while opening the map.");
    }
  };

  const handleQRScan = (data) => {
    try {
      setQRScannerVisible(false);
      console.log('QR Data:', data);
      
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
          latitude: 41.0082,
          longitude: 28.9784,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5
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
            description={`${station.power}kW - ${station.available ? 'Available' : 'Occupied'}`}
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
        transactions={[]}
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
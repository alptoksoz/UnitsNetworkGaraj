import Camera from 'expo-camera';


import { useEffect, useState } from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';


const QRScanner = ({ visible, onClose, onScanSuccess }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      if (visible && hasPermission === null) {
        try {
          const { status } = await Camera.requestPermissionsAsync(); // Eğer hata alırsan bunu değiştir.
          setHasPermission(status === 'granted');
        } catch (error) {
          console.log("Kamera izni alınırken hata oluştu:", error);
          setHasPermission(false);
        }
      }
    })();
  }, [visible]);

  if (hasPermission === null) {
    return (
      <Modal visible={visible} animationType="slide">
        <View>
          <Text>Kamera izni isteniyor...</Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View>
          <Text>Kamera izni reddedildi. Lütfen ayarlardan izin verin.</Text>
          <TouchableOpacity onPress={onClose}>
            <Text>Kapat</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1 }}>
        <Camera
          style={{ flex: 1 }}
          onBarCodeScanned={({ data }) => {
            if (!scanned) {
              setScanned(true);
              onScanSuccess(data);
              setTimeout(() => {
                onClose();
                setScanned(false);
              }, 1500);
            }
          }}
        />
      </View>
    </Modal>
  );
};

export default QRScanner;

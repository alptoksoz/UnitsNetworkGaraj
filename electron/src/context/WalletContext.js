import 'react-native-get-random-values';
import React, { createContext, useContext, useState } from 'react';
import SignClient from '@walletconnect/sign-client';
import { ethers } from "ethers";
import { Platform, Linking } from 'react-native';

const WalletContext = createContext();

// Backend URL'sini platform'a göre ayarla
const BACKEND_URL = Platform.select({
   ios: 'http://localhost:5001',  // iOS simulator için
   android: 'http://10.0.2.2:5001',  // Android emulator için
 });
 
 // Backend API'yi test et
 const testBackendConnection = async () => {
   try {
     const response = await fetch(`${BACKEND_URL}/users/test`, {
       method: 'GET'
     });
     console.log('Backend bağlantı testi:', response.ok);
   } catch (error) {
     console.error('Backend bağlantı hatası:', error);
   }
 };
// RPC URL'lerini tanımla
const RPC_URLS = {
 1: 'https://mainnet.infura.io/v3/88e0cc732c674686867208e67149800d',  // Mainnet
 11155111: 'https://sepolia.infura.io/v3/88e0cc732c674686867208e67149800d'  // Sepolia testnet
};

// Global crypto polyfill
if (!global.crypto) {
 global.crypto = {
   getRandomValues: (array) => array.map(() => Math.floor(Math.random() * 256))
 };
}

export function WalletProvider({ children }) {
 const [signClient, setSignClient] = useState(null);
 const [address, setAddress] = useState(null);
 const [balance, setBalance] = useState(null);
 const [session, setSession] = useState(null);
 const [wcUri, setWcUri] = useState(null);
 const [chainId, setChainId] = useState(11155111); // Default to Sepolia testnet

 const initializeClient = async () => {
   try {
     const client = await SignClient.init({
       projectId: 'cc1559615980ab9d97972b5ac3da6e81',
       metadata: {
         name: 'EcoCharge',
         description: 'EV Charging Station App',
         url: 'https://ecocharge.com',
         icons: ['https://ecocharge.com/icon.png']
       }
     });
     setSignClient(client);
     return client;
   } catch (error) {
     console.error('Failed to initialize client:', error);
     throw error;
   }
 };

 const connect = async () => {
   try {
     let client = signClient;
     if (!client) {
       client = await initializeClient();
     }

     const { uri, approval } = await client.connect({
       requiredNamespaces: {
         eip155: {
           methods: ['eth_sendTransaction', 'eth_signTransaction', 'eth_sign'],
           chains: [`eip155:${chainId}`], // Kullanılacak chain ID
           events: ['chainChanged', 'accountsChanged']
         }
       }
     });

     if (uri) {
       setWcUri(uri);
       return { uri, approval };
     }

   } catch (error) {
     console.error('Connection error:', error);
     throw error;
   }
 };

 const handleConnectionApproval = async (approval) => {
   try {
     const sessionData = await approval();
     setSession(sessionData);
     
     const accounts = sessionData.namespaces.eip155.accounts;
     const userAddress = accounts[0].split(':')[2];
     
     setAddress(userAddress);
     await updateBalance(userAddress);
     await updateBackendUser(userAddress);

     setWcUri(null);
     return true;
   } catch (error) {
     console.error('Approval error:', error);
     throw error;
   }
 };

 const updateBalance = async (userAddress) => {
   try {
     const provider = new ethers.providers.JsonRpcProvider(RPC_URLS[chainId]);
     const balance = await provider.getBalance(userAddress);
     setBalance(ethers.utils.formatEther(balance));
   } catch (error) {
     console.error('Balance update error:', error);
   }
 };

 const disconnect = async () => {
   try {
     if (session && signClient) {
       await signClient.disconnect({
         topic: session.topic,
         reason: {
           code: 6000,
           message: 'User disconnected'
         }
       });
     }
     setSession(null);
     setAddress(null);
     setBalance(null);
     setWcUri(null);
   } catch (error) {
     console.error('Disconnect error:', error);
   }
 };

 const updateBackendUser = async (address, balance) => {
   try {
     // Önce kullanıcıyı kaydet
     const registerResponse = await fetch(`${BACKEND_URL}/users/register`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         walletAddress: address,
         name: `User-${address.slice(0, 6)}`,
         email: `${address.slice(0, 6)}@example.com`,
         password: 'wallet-auth',
         balance: balance || 0
       })
     });
 
     if (!registerResponse.ok) {
       throw new Error('Registration failed');
     }
 
     const registerData = await registerResponse.json();
     console.log('User registered:', registerData);
 
     // Sonra wallet bilgilerini güncelle
     const updateResponse = await fetch(`${BACKEND_URL}/users/update-wallet`, {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({
         walletAddress: address,
         balance: balance || 0
       })
     });
 
     if (!updateResponse.ok) {
       throw new Error('Wallet update failed');
     }
 
     const updateData = await updateResponse.json();
     console.log('Wallet updated:', updateData);
 
     return updateData;
   } catch (error) {
     console.error('Backend update error:', error);
   }
 };

 return (
   <WalletContext.Provider
     value={{
       address,
       balance,
       chainId,
       isConnected: !!session,
       connect,
       disconnect,
       wcUri,
       handleConnectionApproval,
       setWcUri,
       signClient,  // Ekleyin
       session      // Ekleyin
     }}
   >
     {children}
   </WalletContext.Provider>
 );
}

export function useWallet() {
 const context = useContext(WalletContext);
 if (!context) {
   throw new Error('useWallet must be used within a WalletProvider');
 }
 return context;
}
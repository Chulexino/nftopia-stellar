import React from 'react';
import { View, Text, TouchableOpacity, Share, Alert, StyleSheet, AccessibilityInfo } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import { useWallet } from '../context/WalletContext';
import { useNetwork } from '../context/NetworkContext';

export default function HomeScreen(){
  const { activeWallet } = useWallet();
  const { network } = useNetwork();
  const address = activeWallet?.publicKey ?? '';
  const copy = async () => {
    try { await Clipboard.setStringAsync(address); Alert.alert('Copied', 'Address copied to clipboard'); }
    catch { Alert.alert('Copy failed', 'Clipboard unavailable'); }
  };
  const share = async () => {
    try { await Share.share({ message: address }); }
    catch { Alert.alert('Share failed', 'Share sheet unavailable'); }
  };
  if (!address) return <View style={styles.center}><Text>No active wallet</Text></View>;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive</Text>
      <Text style={styles.wallet}>{activeWallet?.name ?? 'Wallet'}</Text>
      <TouchableOpacity
        accessibilityLabel={`QR code for ${address}`}
        onPress={() => AccessibilityInfo.announceForAccessibility(`Your Stellar address is ${address}`)}
      >
        <QRCode value={address} size={200} />
      </TouchableOpacity>
      <Text selectable style={styles.address}>{address}</Text>
      <View style={[styles.badge, { backgroundColor: network === 'testnet' ? '#e67e22' : '#2ecc71' }]}>
        <Text style={styles.badgeText}>{network === 'testnet' ? 'TESTNET' : 'MAINNET'}</Text>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={copy}><Text style={styles.buttonText}>Copy</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={share}><Text style={styles.buttonText}>Share</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  wallet: { fontSize: 18, marginBottom: 16 },
  address: { fontSize: 14, textAlign: 'center', marginVertical: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 16 },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', marginTop: 12 },
  button: { backgroundColor: '#2c3e50', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginHorizontal: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

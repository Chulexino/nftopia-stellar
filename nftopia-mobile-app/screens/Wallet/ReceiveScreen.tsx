import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { useWalletStore } from '@/stores/walletStore';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';

export default function ReceiveScreen() {
  const activeWallet = useWalletStore((state) => state.activeWallet);
  const network = useWalletStore((state) => state.network);
  const [copied, setCopied] = useState(false);

  const publicKey = activeWallet?.publicKey ?? '';

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await Clipboard.setStringAsync(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      Alert.alert('Copied', 'Address copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Could not copy address');
    }
  };

  const handleShare = async () => {
    if (!publicKey) return;
    try {
      await Share.share({
        message: publicKey,
        title: 'My Stellar Address',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share address');
    }
  };

  const isTestnet = network === 'TESTNET';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} accessibilityViewIsModal>
        <Text style={styles.screenTitle}>Receive</Text>
        {activeWallet?.name ? (
          <Text style={styles.walletName}>{activeWallet.name}</Text>
        ) : null}

        <View style={[styles.networkBadge, isTestnet ? styles.testnetBadge : styles.mainnetBadge]}>
          <Text style={styles.networkText}>{isTestnet ? 'TESTNET' : 'MAINNET'}</Text>
        </View>

        <View style={styles.qrContainer}>
          {publicKey ? (
            <QRCode
              value={publicKey}
              size={200}
              backgroundColor="white"
              color="black"
              accessibilityLabel={`QQ code for wallet address ${publicKey}`}
            />
          ) : (
            <Text style={styles.noWalletText}>No active wallet</Text>
          )}
        </View>

        <Text style={styles.addressLabel}>Your Stellar Address</Text>
        <View style={styles.addressBox}>
          <Text style={styles.addressText} selectable>
            {publicKey || 'No address available'}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.copyButton,
            ]}
            onPress={handleCopy}
            disabled={!publicKey}
            accessibilityRole="button"
            accessibilityLabel="Copy wallet address"
          >
            <Text style={styles.actionButtonText}>{copied ? 'Copied!' : 'Copy Address'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.shareButton,
            ]}
            onPress={handleShare}
            disabled={!publicKey}
            accessibilityRole="button"
            accessibilityLabel="Share wallet address"
          >
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  walletName: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  networkBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  testnetBadge: { backgroundColor: '#FFEAA7' },
  mainnetBadge: { backgroundColor: '#D4EFDF' },
  networkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  noWalletText: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  addressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  addressBox: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    width: '100%',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    width: '100%',
    justifyContent: 'space-around',
  },
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    minWidth: 140,
    alignItems: 'center',
  },
  copyButton: {
    backgroundColor: colors.info,
  },
  shareButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
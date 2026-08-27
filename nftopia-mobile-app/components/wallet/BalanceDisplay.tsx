import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/constants/theme';
import { TokenBalance } from '@/src/services/stellar/balance.service';

interface BalanceDisplayProps {
  xlmBalance: string | null;
  tokenBalances: TokenBalance[];
  isLoading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  publicKey?: string;
  onReceive?: () => void;
}

export default function BalanceDisplay({
  xlmBalance,
  tokenBalances,
  isLoading,
  error,
  onRefresh,
  publicKey,
  onReceive,
}: BalanceDisplayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Balances</Text>
        {onRefresh && (
          <TouchableOpacity onPress={onRefresh} disabled={isLoading}>
            <Text style={styles.refreshText}>{isLoading ? 'Refreshing...' : 'Refresh'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {publicKey ? (
        <View style={styles.publicKeyRow}>
          <Text style={styles.publicKey} numberOfLines={1}>
            {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
          </Text>
          {onReceive && (
            <TouchableOpacity onPress={onReceive} style={styles.receiveButton} accessibilityRole="button" accessibilityLabel="Receive funds">
              <Text style={styles.receiveButtonText}>Receive</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {isLoading && !xlmBalance ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : (
        <>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>XLM</Text>
            <Text style={styles.balanceValue}>
              {xlmBalance !== null ? parseFloat(xlmBalance).toFixed(4) : '--'}
            </Text>
          </View>

          {tokenBalances.map((token, index) => (
            <View key={`${token.asset_code}-${token.asset_issuer}-${index}`} style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>{token.asset_code}</Text>
              <Text style={styles.balanceValue}>
                {parseFloat(token.balance).toFixed(4)}
              </Text>
            </View>
          ))}

         {(!tokenBalances || tokenBalances.length === 0) && xlmBalance !== null && (
            <Text style={styles.noTokens}>No token balances</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  refreshText: {
    fontSize: 14,
    color: colors.info,
    fontWeight: '500',
  },
  publicKeyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  publicKey: {
    fontSize: 12,
    color: colors.textTertiary,
    fontFamily: 'monospace',
    flexShrink: 1,
    marginRight: spacing.sm,
  },
  receiveButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.info,
    borderRadius: borderRadius.sm,
  },
  receiveButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'monospace',
  },
  noTokens: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  errorBox: {
    backgroundColor: colors.errorBackground,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
  },
});
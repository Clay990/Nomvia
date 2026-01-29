import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from "@expo/vector-icons";
import { useTheme } from '../../context/ThemeContext';

interface StatsGridProps {
  snapshots: any[];
}

const StatsGrid: React.FC<StatsGridProps> = ({ snapshots }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  return (
    <View style={styles.statsGrid}>
        {snapshots && snapshots.map((snap: any, i: number) => (
            <View key={i} style={styles.statItem} accessibilityLabel={`Stat: ${snap.label}`}>
                <View style={styles.statIconBox}>
                    <Feather name={snap.icon as any} size={20} color={colors.text} />
                </View>
                <Text style={styles.statLabel}>{snap.label}</Text>
            </View>
        ))}
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  statsGrid: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     backgroundColor: colors.card,
     padding: 16,
     borderRadius: 16,
     marginBottom: 20,
     borderWidth: 1,
     borderColor: colors.border,
  },
  statItem: { alignItems: 'center', gap: 6 },
  statIconBox: { 
      width: 40, height: 40, borderRadius: 20, 
      backgroundColor: isDark ? '#2C2C2E' : colors.secondary, 
      justifyContent: 'center', alignItems: 'center' 
  },
  statLabel: { fontSize: 11, fontWeight: '600', color: colors.subtext },
});

export default StatsGrid;
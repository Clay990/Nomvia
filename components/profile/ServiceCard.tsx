import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { account, databases, APPWRITE_DB_ID, APPWRITE_COLLECTION_USERS } from '../../app/_appwrite'; 
import { useTheme } from '../../context/ThemeContext';

interface ServiceCardProps {
  initialIsHelper: boolean;
  builder: any;
  skills: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ initialIsHelper, builder, skills }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);

  const [isHappyToHelp, setIsHappyToHelp] = useState(initialIsHelper);

  const handleHelperToggle = async (value: boolean) => {
      setIsHappyToHelp(value);
      try {
          const user = await account.get();
          await databases.updateDocument(
              APPWRITE_DB_ID,
              APPWRITE_COLLECTION_USERS,
              user.$id,
              { isHelper: value }
          );
      } catch (error) {
          console.error("Failed to update helper status:", error);
          setIsHappyToHelp(!value);
      }
  };

  return (
    <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
            <View style={styles.serviceIcon}>
                    <MaterialCommunityIcons name="hammer-wrench" size={20} color={colors.text} />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.serviceTitle}>Skills & Services</Text>
                <Text style={styles.serviceSub}>Open to work / help</Text>
            </View>
            <Switch
                value={isHappyToHelp}
                onValueChange={handleHelperToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFF"
                accessibilityLabel="Toggle helper status"
                accessibilityRole="switch"
            />
        </View>
        <View style={styles.divider} />
        <View style={styles.serviceDetails}>
                <Text style={styles.specLabel}>SPECIALTY</Text>
                <Text style={styles.specText}>{builder?.specialty || "General"}</Text>
                <View style={styles.skillsRow}>
                {skills && skills.map((skill: string) => (
                    <Text key={skill} style={styles.skillSimple}>• {skill}</Text>
                ))}
                {(!skills || skills.length === 0) && (
                    <Text style={styles.skillSimple}>No skills listed yet.</Text>
                )}
                </View>
        </View>
    </View>
  );
};

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  serviceCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      marginBottom: 30,
      borderWidth: 1,
      borderColor: colors.border,
  },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  serviceIcon: { 
      width: 40, height: 40, borderRadius: 12, 
      backgroundColor: isDark ? '#2C2C2E' : colors.secondary, 
      justifyContent: 'center', alignItems: 'center' 
  },
  serviceTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  serviceSub: { color: colors.subtext, fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  serviceDetails: {},
  specLabel: { fontSize: 10, color: colors.subtext, fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
  specText: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skillSimple: { color: colors.subtext, fontSize: 13 },
});

export default ServiceCard;
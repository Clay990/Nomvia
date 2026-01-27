import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { account, databases, APPWRITE_DB_ID, APPWRITE_COLLECTION_USERS } from '../../app/_appwrite'; // Adjusted path

interface ServiceCardProps {
  initialIsHelper: boolean;
  builder: any;
  skills: string[];
}

const ServiceCard: React.FC<ServiceCardProps> = ({ initialIsHelper, builder, skills }) => {
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
          // Ideally show a toast or alert here, but keeping it simple for component
      }
  };

  return (
    <View style={styles.serviceCard}>
        <View style={styles.serviceHeader}>
            <View style={styles.serviceIcon}>
                    <MaterialCommunityIcons name="hammer-wrench" size={20} color="#FFF" />
            </View>
            <View style={{flex: 1}}>
                <Text style={styles.serviceTitle}>Skills & Services</Text>
                <Text style={styles.serviceSub}>Open to work / help</Text>
            </View>
            <Switch
                value={isHappyToHelp}
                onValueChange={handleHelperToggle}
                trackColor={{ false: "#E5E7EB", true: "#111" }}
                thumbColor="#FFF"
                accessibilityLabel="Toggle helper status"
                accessibilityRole="switch"
            />
        </View>
        <View style={styles.divider} />
        <View style={styles.serviceDetails}>
                <Text style={styles.specLabel}>SPECIALTY</Text>
                <Text style={styles.specText}>{builder.specialty}</Text>
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

const styles = StyleSheet.create({
  serviceCard: {
      backgroundColor: '#1F2937',
      borderRadius: 20,
      padding: 20,
      marginBottom: 30
  },
  serviceHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  serviceIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center' },
  serviceTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  serviceSub: { color: '#9CA3AF', fontSize: 12 },
  divider: { height: 1, backgroundColor: '#374151', marginBottom: 16 },
  serviceDetails: {},
  specLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginBottom: 4, letterSpacing: 1 },
  specText: { color: '#FFF', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skillSimple: { color: '#D1D5DB', fontSize: 13 },
});

export default ServiceCard;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SafetyBanner from './SafetyBanner';

interface Job {
  id: string;
  name: string;
  desc: string;
  dist: string;
  image: string;
  urgency?: 'low' | 'high' | 'critical';
  offer?: string;
}

interface JobListProps {
  jobs: Job[];
  colors: any;
  onChat: (id: string) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, colors, onChat }) => {
  if (jobs.length === 0) return null;

  const styles = getStyles(colors);

  const getUrgencyColor = (urgency?: string) => {
      if (urgency === 'critical') return '#EF4444';
      if (urgency === 'high') return '#F59E0B';
      return '#3B82F6';
  };

  return (
    <>
      <SafetyBanner colors={colors} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nearby Requests</Text>
      </View>
      <Text style={styles.sectionSub}>People who need a hand right now.</Text>
      <View style={styles.verticalList}>
        {jobs.map((job) => (
          <TouchableOpacity key={job.id} style={styles.jobCard}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: job.image }} style={styles.jobImage} />
                <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(job.urgency) }]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={12} color="#FFF" />
                </View>
            </View>
            
            <View style={styles.jobContent}>
              <View style={styles.rowBetween}>
                <Text style={styles.jobName}>{job.name}</Text>
                <Text style={[styles.urgencyText, { color: getUrgencyColor(job.urgency) }]}>
                    {job.urgency?.toUpperCase() || 'NORMAL'}
                </Text>
              </View>
              <Text style={styles.jobDesc} numberOfLines={2}>{job.desc}</Text>
              <View style={styles.distRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MaterialCommunityIcons name="map-marker" size={12} color={colors.subtext} />
                    <Text style={styles.distText}>{job.dist}</Text>
                </View>
                {job.offer && (
                    <View style={styles.offerBadge}>
                        <Text style={styles.offerText}>{job.offer}</Text>
                    </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.msgBtn} onPress={() => onChat(job.id)}>
              <MaterialCommunityIcons name="hand-heart" size={20} color={colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginTop: 20 
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  sectionSub: { paddingHorizontal: 24, fontSize: 13, color: colors.subtext, marginTop: 4, marginBottom: 16 },
  verticalList: { paddingHorizontal: 24, gap: 12 },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageContainer: { position: 'relative', marginRight: 12 },
  jobImage: { width: 50, height: 50, borderRadius: 12 },
  urgencyBadge: { 
      position: 'absolute', top: -4, right: -4, 
      width: 18, height: 18, borderRadius: 9, 
      justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.card 
  },
  jobContent: { flex: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  jobName: { fontSize: 16, fontWeight: '700', color: colors.text },
  urgencyText: { fontSize: 10, fontWeight: '800' },
  jobDesc: { fontSize: 13, color: colors.subtext, marginBottom: 6 },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  distText: { fontSize: 12, color: colors.subtext },
  offerBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  offerText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  msgBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JobList;

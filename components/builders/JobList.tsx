import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import SafetyBanner from './SafetyBanner';

interface Job {
  id: string;
  ownerId?: string;
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

  const getUrgencyIcon = (urgency?: string) => {
      if (urgency === 'critical') return 'alert-decagram';
      if (urgency === 'high') return 'clock-alert';
      return 'hand-heart';
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
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.cardHeader}>
                <Image source={{ uri: job.image }} style={styles.jobImage} />
                <View style={styles.headerContent}>
                    <Text style={styles.jobName}>{job.name}</Text>
                    <View style={styles.metaRow}>
                        <View style={[styles.urgencyTag, { backgroundColor: getUrgencyColor(job.urgency) + '20' }]}>
                            <MaterialCommunityIcons name={getUrgencyIcon(job.urgency) as any} size={12} color={getUrgencyColor(job.urgency)} />
                            <Text style={[styles.urgencyText, { color: getUrgencyColor(job.urgency) }]}>
                                {job.urgency?.toUpperCase() || 'NORMAL'}
                            </Text>
                        </View>
                        <View style={styles.dotSeparator} />
                        <Text style={styles.distText}>{job.dist}</Text>
                    </View>
                </View>
                {job.offer && (
                    <View style={styles.offerBadge}>
                        <Text style={styles.offerText}>{job.offer}</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.jobDesc} numberOfLines={2}>{job.desc}</Text>
            
            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.detailsBtn} onPress={() => console.log('View Details')}>
                    <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyBtn} onPress={() => onChat(job.ownerId || job.id)}>
                    <Text style={styles.applyBtnText}>I Can Help</Text>
                    <MaterialCommunityIcons name="arrow-right" size={16} color="#FFF" />
                </TouchableOpacity>
            </View>
          </View>
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
  verticalList: { paddingHorizontal: 24, gap: 16 },
  jobCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  jobImage: { width: 48, height: 48, borderRadius: 12, backgroundColor: colors.secondary },
  headerContent: { flex: 1, justifyContent: 'center' },
  jobName: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  urgencyTag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  urgencyText: { fontSize: 10, fontWeight: '800' },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.subtext },
  distText: { fontSize: 12, color: colors.subtext },
  offerBadge: { 
      backgroundColor: '#ECFDF5', 
      paddingHorizontal: 8, 
      paddingVertical: 4, 
      borderRadius: 8, 
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: '#A7F3D0'
  },
  offerText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  jobDesc: { fontSize: 14, color: colors.subtext, lineHeight: 20, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', gap: 12 },
  detailsBtn: { 
      flex: 1, 
      paddingVertical: 10, 
      borderRadius: 12, 
      borderWidth: 1, 
      borderColor: colors.border, 
      alignItems: 'center',
      backgroundColor: colors.background 
  },
  detailsBtnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  applyBtn: { 
      flex: 2, 
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10, 
      borderRadius: 12, 
      backgroundColor: colors.primary,
  },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
});

export default JobList;

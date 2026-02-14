import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Snackbar } from 'react-native-paper';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { PostsService } from './services/posts';
import { events } from './utils/events';

type CampfirePostType = 'meetup' | 'discussion' | 'qa' | 'resource';

export default function CreateCampfirePostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  const [postType, setPostType] = useState<CampfirePostType>('discussion');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [group, setGroup] = useState(params.initialGroup ? (params.initialGroup as string) : '');
  const [location, setLocation] = useState('');
  const [time, setTime] = useState('');
  const [link, setLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const [showPoll, setShowPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false; 
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true, 
        aspect: [4, 3], 
        quality: 0.7,
      });
      if (!result.canceled) {
        setImageLoading(true);
        setTimeout(() => {
            setSelectedImage(result.assets[0].uri);
            setImageLoading(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 500);
      }
    } catch (e) { 
        setSnackbarMessage("Could not pick image.");
        setSnackbarVisible(true);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      setSnackbarMessage("Please add a title and description.");
      setSnackbarVisible(true);
      return;
    }

    if (postType === 'meetup' && (!location.trim() || !time.trim())) {
        setSnackbarMessage("Please add a location and time for the meetup.");
        setSnackbarVisible(true);
        return;
    }

    if (postType === 'resource' && !link.trim()) {
        setSnackbarMessage("Please add a link or location for the resource.");
        setSnackbarVisible(true);
        return;
    }

    let formattedLink = link.trim();
    if (postType === 'resource' && formattedLink) {
        if (!formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
            formattedLink = `https://${formattedLink}`;
        }
        if (!isValidUrl(formattedLink)) {
            setSnackbarMessage("Please enter a valid URL (e.g. https://example.com)");
            setSnackbarVisible(true);
            return;
        }
    }

    if (showPoll && (pollOptions[0].trim() === '' || pollOptions[1].trim() === '')) {
        setSnackbarMessage("Please provide at least two options for the poll.");
        setSnackbarVisible(true);
        return;
    }

    setIsSubmitting(true);

    try {
        let tag = 'FORUM';
        if (group) {
            tag = group.toUpperCase();
        } else {
            if (postType === 'meetup') tag = 'MEETUP';
            else if (postType === 'qa') tag = 'Q&A';
            else if (postType === 'resource') tag = 'RESOURCE';
            else tag = 'FORUM';
        }

        let finalContent = content;
        if (showPoll) {
            const pollData = {
                options: pollOptions.map(opt => ({ text: opt, votes: 0 }))
            };
            finalContent += `\n\n///POLL///${JSON.stringify(pollData)}`;
        }

        await PostsService.createPost({
            type: postType,
            title: title,
            content: finalContent,
            tag: tag,
            location: location,
            meetupTime: time,
            link: formattedLink || undefined, 
            image: selectedImage || undefined,
            privacy: params.isPrivate === 'true' ? 'private' : 'public',
            circleId: params.circleId ? (params.circleId as string) : undefined
        });

        events.emit('post_created');
        setSnackbarMessage("Posted! Your post is now live.");
        setSnackbarVisible(true);
        setTimeout(() => {
            router.back();
        }, 1500);
    } catch (e) {
        console.error(e);
        setSnackbarMessage("Failed to post. Please try again.");
        setSnackbarVisible(true);
    } finally {
        setIsSubmitting(false);
    }
  };

  const updatePollOption = (text: string, index: number) => {
      const newOptions = [...pollOptions];
      newOptions[index] = text;
      setPollOptions(newOptions);
  };

  const TypeButton = ({ type, icon, label }: { type: CampfirePostType, icon: any, label: string }) => (
      <TouchableOpacity 
          style={[styles.typeBtn, postType === type && { backgroundColor: colors.text, borderColor: colors.text }]} 
          onPress={() => { Haptics.selectionAsync(); setPostType(type); }}
      >
          <MaterialCommunityIcons name={icon} size={20} color={postType === type ? colors.background : colors.subtext} />
          <Text style={[styles.typeText, { color: postType === type ? colors.background : colors.subtext }]}>{label}</Text>
      </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: colors.background }]}>
       <Stack.Screen 
        options={{
          headerShown: true,
          title: "New Campfire Post",
          headerTitleAlign: 'center',
          headerTitleStyle: { fontFamily: 'YoungSerif_400Regular', fontSize: 18 },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
                onPress={handlePost}
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.5 : 1 }}
            >
                {isSubmitting ? <ActivityIndicator size="small" color={colors.text} /> : <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 16 }}>Post</Text>}
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.typeSelector}>
            <View style={styles.typeRow}>
                <TypeButton type="discussion" icon="comment-text-outline" label="Discussion" />
                <TypeButton type="meetup" icon="campfire" label="Meetup" />
            </View>
            <View style={styles.typeRow}>
                <TypeButton type="qa" icon="help-circle-outline" label="Q&A" />
                <TypeButton type="resource" icon="map-marker-star" label="Resource" />
            </View>
        </View>

        <View style={[styles.formSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: colors.subtext }]}>
                {postType === 'qa' ? "YOUR QUESTION" : "TITLE"}
            </Text>
            <TextInput 
                style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]} 
                placeholder={
                    postType === 'meetup' ? "Event Name (e.g. Sunset Bonfire)" : 
                    postType === 'qa' ? "What do you want to ask?" :
                    postType === 'resource' ? "Resource Name (e.g. Free Water)" :
                    "Topic (e.g. Best Solar Kits?)"
                }
                placeholderTextColor={colors.subtext}
                value={title}
                onChangeText={setTitle}
            />

            {postType === 'discussion' && (
                <>
                    <Text style={[styles.label, { color: colors.subtext, marginTop: 16 }]}>GROUP / CATEGORY</Text>
                    <TextInput 
                        style={[
                            styles.input, 
                            { color: colors.text, borderBottomColor: colors.border },
                            params.initialGroup ? { opacity: 0.6, backgroundColor: isDark ? '#333' : '#F3F4F6' } : {}
                        ]} 
                        placeholder="e.g. Van Builders, Solo Travelers..."
                        placeholderTextColor={colors.subtext}
                        value={group}
                        onChangeText={setGroup}
                        editable={!params.initialGroup}
                    />
                </>
            )}

            {postType === 'meetup' && (
                <>
                    <Text style={[styles.label, { color: colors.subtext, marginTop: 16 }]}>LOCATION</Text>
                    <TextInput 
                        style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]} 
                        placeholder="e.g. Old Manali Bridge"
                        placeholderTextColor={colors.subtext}
                        value={location}
                        onChangeText={setLocation}
                    />

                    <Text style={[styles.label, { color: colors.subtext, marginTop: 16 }]}>TIME</Text>
                    <TextInput 
                        style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]} 
                        placeholder="e.g. Tomorrow at 6 PM"
                        placeholderTextColor={colors.subtext}
                        value={time}
                        onChangeText={setTime}
                    />
                </>
            )}

            {postType === 'resource' && (
                <>
                    <Text style={[styles.label, { color: colors.subtext, marginTop: 16 }]}>LINK / LOCATION</Text>
                    <TextInput 
                        style={[styles.input, { color: colors.text, borderBottomColor: colors.border }]} 
                        placeholder="https://... or Google Maps Link"
                        placeholderTextColor={colors.subtext}
                        value={link}
                        onChangeText={setLink}
                        autoCapitalize="none"
                    />
                </>
            )}

            <Text style={[styles.label, { color: colors.subtext, marginTop: 16 }]}>DETAILS</Text>
            <TextInput 
                style={[styles.input, { color: colors.text, borderBottomColor: 'transparent', minHeight: 100, textAlignVertical: 'top' }]} 
                placeholder="Share more details..."
                placeholderTextColor={colors.subtext}
                multiline
                value={content}
                onChangeText={setContent}
            />
        </View>

        <Text style={[styles.label, { color: colors.subtext, marginTop: 24, marginBottom: 8 }]}>MEDIA & INTERACTION</Text>
        
        <TouchableOpacity onPress={pickImage} style={[styles.mediaBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
             {imageLoading ? (
                 <ActivityIndicator color={colors.primary} />
             ) : selectedImage ? (
                 <View style={{ width: '100%', aspectRatio: 16/9, borderRadius: 12, overflow: 'hidden' }}>
                     <Image source={{ uri: selectedImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                     <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 }}>
                         <MaterialCommunityIcons name="refresh" size={16} color="#FFF" />
                     </View>
                 </View>
             ) : (
                 <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                     <MaterialCommunityIcons name="image-plus" size={24} color={colors.primary} />
                     <Text style={{ color: colors.text, fontWeight: '600' }}>Add Photo</Text>
                 </View>
             )}
        </TouchableOpacity>

        <View style={{ marginTop: 12 }}>
            <TouchableOpacity 
                onPress={() => { Haptics.selectionAsync(); setShowPoll(!showPoll); }} 
                style={[styles.mediaBtn, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' }]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                     <MaterialCommunityIcons name="poll" size={24} color={colors.primary} />
                     <Text style={{ color: colors.text, fontWeight: '600' }}>Create Poll</Text>
                </View>
                <MaterialCommunityIcons name={showPoll ? "chevron-up" : "chevron-down"} size={20} color={colors.subtext} />
            </TouchableOpacity>
            
            {showPoll && (
                <View style={[styles.pollBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={{ color: colors.subtext, fontSize: 12, marginBottom: 8 }}>Ask the community to vote.</Text>
                    <TextInput 
                        style={[styles.pollInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                        placeholder="Option 1"
                        placeholderTextColor={colors.subtext}
                        value={pollOptions[0]}
                        onChangeText={(t) => updatePollOption(t, 0)}
                    />
                    <TextInput 
                        style={[styles.pollInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginTop: 8 }]}
                        placeholder="Option 2"
                        placeholderTextColor={colors.subtext}
                        value={pollOptions[1]}
                        onChangeText={(t) => updatePollOption(t, 1)}
                    />
                </View>
            )}
        </View>
        
        <View style={{ marginTop: 32, paddingHorizontal: 8, paddingBottom: 50 }}>
            <Text style={{ color: colors.subtext, fontSize: 12, textAlign: 'center' }}>
                {postType === 'meetup' 
                    ? "Meetups are public. Ensure you meet in safe, well-lit areas." 
                    : postType === 'qa' ? "Asking good questions helps everyone learn."
                    : "Keep discussions respectful and helpful to the community."}
            </Text>
        </View>

      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: colors.text, marginBottom: 20 }}
      >
        <Text style={{ color: colors.background, fontWeight: '600' }}>{snackbarMessage}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  typeSelector: { gap: 12, marginBottom: 24 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  typeText: { fontWeight: '700', fontSize: 14 },
  formSection: { padding: 20, borderRadius: 20, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  input: { fontSize: 16, paddingVertical: 8, borderBottomWidth: 1 },
  mediaBtn: { padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pollBox: { marginTop: 8, padding: 16, borderRadius: 16, borderWidth: 1 },
  pollInput: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 }
});

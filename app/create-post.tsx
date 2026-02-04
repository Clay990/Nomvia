import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import PostCard from '../components/PostCard';
import { useTheme } from '../context/ThemeContext';
import { PostsService } from './services/posts';
import { Post } from './types';
import { events } from './utils/events';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DRAFT_KEY = 'create_post_draft';
const MAX_CHARS = 5000;

const POPULAR_TAGS = ['VAN LIFE', 'SOLO FEMALE', 'CONVOY', 'HELP NEEDED', 'CAMPGROUND', 'WILD CAMPING'];
const MOCK_LOCATIONS = ['Manali, India', 'Leh, Ladakh', 'Goa, India', 'Varkala, Kerala', 'Rishikesh, Uttarakhand'];
const PROFANITY_LIST = ['hate', 'violence', 'spam'];

const TEMPLATES = [
  { label: 'Morning View', type: 'image', content: 'Waking up to this view! ☕️🌲 #MorningVibes', tag: 'WILD CAMPING' },
  { label: 'Convoy Call', type: 'map', content: 'Heading out tomorrow morning. Anyone else going this way? Looking for travel buddies!', tag: 'CONVOY' },
  { label: 'Mechanic Help', type: 'none', content: 'Does anyone know a good mechanic near here? My solar setup is acting up.', tag: 'HELP NEEDED' },
  { label: 'Work Spot', type: 'image', content: 'Found this amazing cafe with great WiFi and power outlets. Perfect for deep work!', tag: 'DIGITAL NOMAD' },
];

type PostType = 'none' | 'map' | 'image';

interface FormErrors {
  content?: string;
  from?: string;
  to?: string;
  image?: string;
}

const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const Toast = ({ message, visible, onDismiss }: { message: string, visible: boolean, onDismiss: () => void }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(2000),
                Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
            ]).start(() => onDismiss());
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

export default function CreatePostScreen() {
  const router = useRouter();
  const { colors: themeColors, isDark: isSystemDark } = useTheme();

  const [postType, setPostType] = useState<PostType>('none');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('');
  const [locationFrom, setLocationFrom] = useState('');
  const [locationTo, setLocationTo] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [totalKm, setTotalKm] = useState('');
  const [completedKm, setCompletedKm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [privacy, setPrivacy] = useState<'public' | 'friends'>('public');
  const [isSensitive, setIsSensitive] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [addToCalendar, setAddToCalendar] = useState(false);

  const [userProfile, setUserProfile] = useState<any>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [lastState, setLastState] = useState<any>(null);

  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState<'from' | 'to' | null>(null);

  const debouncedContent = useDebounce(content, 1000);
  const debouncedTag = useDebounce(tag, 1000);

  const contentInputRef = useRef<TextInput>(null);
  const tagInputRef = useRef<TextInput>(null);
  const fromInputRef = useRef<TextInput>(null);
  const toInputRef = useRef<TextInput>(null);

  useEffect(() => { 
      loadDraft(); 
      loadUserProfile();
  }, []);

  useEffect(() => {
    if (draftLoaded) saveDraft(); 
  }, [debouncedContent, debouncedTag, postType, locationFrom, locationTo, isLive, totalKm, completedKm, selectedImage, isScheduled, privacy, isSensitive]);

  useEffect(() => {
     if (Object.keys(touched).length > 0) validate(false);
  }, [content, locationFrom, locationTo, touched]);

  const showNotification = (msg: string) => {
      setToastMsg(msg);
      setShowToast(true);
  };

  const loadUserProfile = async () => {
      try {
          const cached = await AsyncStorage.getItem('cached_user_profile');
          if (cached) {
              setUserProfile(JSON.parse(cached));
          }
      } catch (e) {
          console.log("Failed to load user profile for preview");
      }
  };

  const loadDraft = async () => {
    try {
      const savedDraft = await AsyncStorage.getItem(DRAFT_KEY);
      if (savedDraft) {
        const data = JSON.parse(savedDraft);
        setPostType(data.postType || 'none');
        setContent(data.content || '');
        setTag(data.tag || '');
        setLocationFrom(data.locationFrom || '');
        setLocationTo(data.locationTo || '');
        setIsLive(data.isLive || false);
        setTotalKm(data.totalKm || '');
        setCompletedKm(data.completedKm || '');
        setSelectedImage(data.selectedImage || null);
        setIsScheduled(data.isScheduled || false);
        setPrivacy(data.privacy || 'public');
        setIsSensitive(data.isSensitive || false);
        
        if (data.content || data.locationFrom) {
             showNotification("Draft restored");
        }
      }
    } catch (e) {
      console.log('Failed to load draft');
    } finally {
      setDraftLoaded(true);
    }
  };

  const saveDraft = async () => {
    const data = {
      postType, content, tag, locationFrom, locationTo, isLive, totalKm, completedKm, selectedImage, isScheduled, privacy, isSensitive
    };
    try {
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {}
  };
  
  const handleClearForm = () => {
      setLastState({ postType, content, tag, locationFrom, locationTo, isLive, totalKm, completedKm, selectedImage, privacy, isSensitive });
      setContent(''); setTag(''); setLocationFrom(''); setLocationTo(''); setSelectedImage(null); setIsLive(false); setTotalKm(''); setCompletedKm('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Form Cleared", "Would you like to undo?", [{ text: "No", style: 'cancel' }, { text: "Undo", onPress: handleUndo }]);
  };

  const handleUndo = () => {
      if (lastState) {
          setPostType(lastState.postType); setContent(lastState.content); setTag(lastState.tag); setLocationFrom(lastState.locationFrom);
          setLocationTo(lastState.locationTo); setIsLive(lastState.isLive); setTotalKm(lastState.totalKm); setCompletedKm(lastState.completedKm);
          setSelectedImage(lastState.selectedImage); setPrivacy(lastState.privacy); setIsSensitive(lastState.isSensitive);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
  };

  const applyTemplate = (template: any) => {
    Haptics.selectionAsync();
    setPostType(template.type as PostType);
    setContent(template.content);
    setTag(template.tag);
  };

  const handleCurrentLocation = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert("Use Current Location", "Use 'Old Manali, HP'?", [{ text: "Cancel", style: "cancel" }, { text: "Use", onPress: () => setLocationFrom("Old Manali, HP") }]);
  };

  const handleVoiceInput = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert("Voice Input", "Please use the microphone button on your keyboard.");
      contentInputRef.current?.focus();
  };

  const clearDraft = async () => {
    try { await AsyncStorage.removeItem(DRAFT_KEY); } catch (e) {}
  };

  const changePostType = (type: PostType) => {
    if (postType !== type) {
        Haptics.selectionAsync();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setPostType(type);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true, aspect: [4, 3], quality: 0.7,
      });
      if (!result.canceled) {
        setImageLoading(true);
        setTimeout(() => {
            setSelectedImage(result.assets[0].uri);
            if (postType === 'none') changePostType('image');
            setErrors(prev => ({ ...prev, image: undefined }));
            setImageLoading(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            AccessibilityInfo.announceForAccessibility("Image selected successfully");
        }, 500);
      }
    } catch (e) { Alert.alert("Error", "Could not pick image."); }
  };

  const validate = (updateState = true): boolean => {
    const newErrors: FormErrors = {};
    if (touched.content || !updateState) {
        if (!content.trim()) newErrors.content = "Please write something.";
        else if (content.length > MAX_CHARS) newErrors.content = "Content too long.";
    }
    if (postType === 'map') {
      if ((touched.from || !updateState) && !locationFrom.trim()) newErrors.from = "Start location required.";
      if ((touched.to || !updateState) && !locationTo.trim()) newErrors.to = "Destination required.";
    }
    if (updateState) setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const checkForDuplicates = async () => {
      const lastPost = await AsyncStorage.getItem('last_post_hash');
      return lastPost === `${content}-${locationFrom}`;
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setTouched({ content: true, from: true, to: true });
    if (!validate()) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Alert.alert("Incomplete Post", "Check errors."); return; }
    if (PROFANITY_LIST.some(word => content.toLowerCase().includes(word))) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); Alert.alert("Content Warning", "Inappropriate language."); return; }
    if (await checkForDuplicates()) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); Alert.alert("Duplicate Post", "Already posted."); return; }

    setIsSubmitting(true);
    
    const postPayload: Partial<Post> = {
        type: postType,
        content: content,
        tag: tag,
        from: locationFrom,
        to: locationTo,
        isLive: isLive,
        totalKm: totalKm ? Number(totalKm) : 0,
        completedKm: completedKm ? Number(completedKm) : 0,
        image: selectedImage || undefined,
        privacy: privacy,
        isSensitive: isSensitive,
        userId: 'current_user'
    };

    try {
        await PostsService.createPost(postPayload);
        
        await clearDraft();
        await AsyncStorage.setItem('last_post_hash', `${content}-${locationFrom}`);
        
        events.emit('post_created');
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", isScheduled ? "Post scheduled!" : "Published!");
        router.back();
    } catch (e) {
        setIsSubmitting(false);
        console.error(e);
        Alert.alert("Error", "Failed to post. Please try again.");
    }
  };

  const insertText = (textToInsert: string) => {
    Haptics.selectionAsync();
    setContent(prev => prev + textToInsert);
  };
  
  const handleBlur = (field: string) => {
      setTouched(prev => ({ ...prev, [field]: true }));
      if (field === 'tag') setShowTagSuggestions(false);
      if (field === 'from' || field === 'to') setShowLocationSuggestions(null);
  };

  const calculateProgress = () => {
    let filled = 0; let total = 1;
    if (content.trim()) filled++;
    if (postType === 'map') { total += 2; if (locationFrom.trim()) filled++; if (locationTo.trim()) filled++; }
    return { percent: (filled / total) * 100, missing: total - filled };
  };

  const { percent: progressPercent, missing: missingFields } = calculateProgress();

  const bgStyle = { backgroundColor: themeColors.background };
  const cardStyle = { backgroundColor: themeColors.card, borderColor: themeColors.border };
  const textStyle = { color: themeColors.text };
  const subtextStyle = { color: themeColors.subtext };
  const errorTextStyle = { color: themeColors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 };
  const errorBorderStyle = { borderColor: themeColors.danger, borderWidth: 1 };
  const charLimitStyle = content.length > MAX_CHARS ? { color: themeColors.danger } : { color: themeColors.subtext };

  const previewPost: Post = {
    $id: 'preview',
    $collectionId: 'preview',
    $databaseId: 'preview',
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString(),
    userId: userProfile?.$id || 'current_user',
    type: postType,
    content: content || "Your post content will appear here...",
    image: selectedImage || undefined,
    mediaUrls: selectedImage ? [selectedImage] : [],
    tag: tag,
    from: locationFrom,
    to: locationTo,
    isLive: isLive,
    totalKm: totalKm ? Number(totalKm) : 0,
    completedKm: completedKm ? Number(completedKm) : 0,
    user_name: userProfile?.name || 'You',
    user_avatar: userProfile?.avatar,
    timestamp: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
    mutualConnections: 0,
    isSensitive: isSensitive,
    privacy: privacy
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, bgStyle]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "Create Post",
          headerTitleAlign: 'center',
          headerTitleStyle: { fontFamily: 'YoungSerif_400Regular', fontSize: 18 },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
              <Text style={{ color: themeColors.primary, fontSize: 16, fontWeight: '600', opacity: isSubmitting ? 0.5 : 1 }}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <TouchableOpacity onPress={handleClearForm}>
                     <MaterialCommunityIcons name="delete-sweep-outline" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={handleSave}
                    disabled={isSubmitting}
                    style={{ backgroundColor: isSubmitting ? themeColors.border : themeColors.text, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', gap: 6, alignItems: 'center' }}
                >
                {isSubmitting && <ActivityIndicator size="small" color={themeColors.background} />}
                <Text style={{ color: themeColors.background, fontWeight: '700', fontSize: 14 }}>{isSubmitting ? (isScheduled ? "Scheduling..." : "Posting...") : (isScheduled ? "Schedule" : "Post")}</Text>
                </TouchableOpacity>
            </View>
          ),
          headerStyle: { backgroundColor: themeColors.background },
          headerShadowVisible: false,
        }}
      />

      <Toast message={toastMsg} visible={showToast} onDismiss={() => setShowToast(false)} />

      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: themeColors.subtext }}>COMPLETION</Text>
            <Text style={{ fontSize: 10, fontWeight: '700', color: missingFields > 0 ? themeColors.danger : themeColors.primary }}>{missingFields > 0 ? `${missingFields} fields missing` : 'Ready to post!'}</Text>
          </View>
          <View style={{ height: 6, backgroundColor: themeColors.border, width: '100%', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: missingFields > 0 ? themeColors.subtext : themeColors.primary, width: `${progressPercent}%` }} />
          </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>        
        <View style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionLabel, subtextStyle]}>QUICK TEMPLATES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {TEMPLATES.map((tmpl, index) => (
                    <TouchableOpacity key={index} style={[styles.templateChip, { backgroundColor: themeColors.card, borderColor: themeColors.border }]} onPress={() => applyTemplate(tmpl)}>
                        <Text style={{ color: themeColors.text, fontSize: 12, fontWeight: '600' }}>{tmpl.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {showInstructions && (
            <View style={[styles.instructionBox, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                     <Text style={[styles.instructionTitle, textStyle]}>What kind of post is this?</Text>
                     <TouchableOpacity onPress={() => setShowInstructions(false)}><MaterialCommunityIcons name="close" size={16} color={themeColors.subtext} /></TouchableOpacity>
                </View>
                <Text style={{ color: themeColors.subtext, fontSize: 13, lineHeight: 18 }}>• <Text style={{ fontWeight: '700' }}>Thought:</Text> Status update.{'\n'}• <Text style={{ fontWeight: '700' }}>Route:</Text> Share journey plans.{'\n'}• <Text style={{ fontWeight: '700' }}>Media:</Text> Share photos.</Text>
            </View>
        )}

        <View style={styles.typeSelectorContainer}>
          <TypeOption icon="text-box-outline" label="Thought" active={postType === 'none'} onPress={() => changePostType('none')} colors={themeColors} />
          <TypeOption icon="map-marker-path" label="Route" active={postType === 'map'} onPress={() => changePostType('map')} colors={themeColors} />
          <TypeOption icon="image-outline" label="Media" active={postType === 'image'} onPress={() => changePostType('image')} colors={themeColors} />
        </View>

        <View style={styles.divider} />

        <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[styles.sectionLabel, subtextStyle]}>CONTENT</Text>
                <TouchableOpacity onPress={handleVoiceInput}><MaterialCommunityIcons name="microphone" size={16} color={themeColors.primary} /></TouchableOpacity>
            </View>
            <View style={[styles.section, cardStyle, errors.content ? errorBorderStyle : {}]}>
            <TextInput ref={contentInputRef} style={[styles.mainInput, textStyle]} placeholder="What's on your mind? Share your journey..." placeholderTextColor={themeColors.subtext} multiline value={content} onBlur={() => handleBlur('content')} onChangeText={(text) => { setContent(text); if (errors.content) setErrors(prev => ({ ...prev, content: undefined })); }} />
            <View style={styles.richTextBar}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity onPress={() => insertText('**')}><MaterialCommunityIcons name="format-bold" size={20} color={themeColors.subtext} /></TouchableOpacity>
                    <TouchableOpacity onPress={() => insertText('_')}><MaterialCommunityIcons name="format-italic" size={20} color={themeColors.subtext} /></TouchableOpacity>
                </View>
                <Text style={[{ fontSize: 12 }, charLimitStyle]}>{content.length}/{MAX_CHARS}</Text>
            </View>
            </View>
            {errors.content && <Text style={errorTextStyle}>{errors.content}</Text>}
        </View>

        {(postType === 'image' || selectedImage) && (
          <View>
             <Text style={[styles.sectionLabel, subtextStyle, { marginTop: 16 }]}>MEDIA</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imageUploadArea}>
              {selectedImage ? ( <Image source={{ uri: selectedImage }} style={styles.uploadedImage} /> ) : ( <View style={[styles.uploadPlaceholder, { borderColor: themeColors.border }]}>{imageLoading ? ( <ActivityIndicator size="large" color={themeColors.primary} /> ) : ( <><MaterialCommunityIcons name="camera-plus" size={32} color={themeColors.subtext} /><Text style={{ color: themeColors.subtext, marginTop: 8 }}>Add Photo</Text></> )}</View> )}
              {selectedImage && !imageLoading && ( <TouchableOpacity style={styles.removeImageBtn} onPress={() => setSelectedImage(null)}><MaterialCommunityIcons name="close" size={16} color="#FFF" /></TouchableOpacity> )}
            </TouchableOpacity>
          </View>
        )}



        {postType === 'map' && (
          <View style={[styles.routeContainer, { zIndex: 9 }]}>
             <View style={styles.divider} />
             <Text style={[styles.sectionLabel, subtextStyle]}>ROUTE DETAILS</Text>
             
            <View style={[styles.section, cardStyle, { paddingVertical: 0 }]}>
              <View style={[styles.inputRow, { borderBottomWidth: 1, borderBottomColor: themeColors.border, paddingHorizontal: 0, borderWidth: 0 }]}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={themeColors.primary} /><TextInput ref={fromInputRef} style={[styles.rowInput, textStyle]} placeholder="From: Manali" placeholderTextColor={themeColors.subtext} value={locationFrom} onFocus={() => setShowLocationSuggestions('from')} onBlur={() => handleBlur('from')} onChangeText={(text) => { setLocationFrom(text); if (errors.from) setErrors(prev => ({ ...prev, from: undefined })); }} returnKeyType="next" onSubmitEditing={() => toInputRef.current?.focus()} /><TouchableOpacity onPress={handleCurrentLocation} style={{ padding: 4 }}><MaterialCommunityIcons name="crosshairs-gps" size={20} color={themeColors.primary} /></TouchableOpacity>
              </View>
              {showLocationSuggestions === 'from' && ( <LocationSuggestions query={locationFrom} onSelect={(loc: string) => { setLocationFrom(loc); setShowLocationSuggestions(null); toInputRef.current?.focus(); }} colors={themeColors} /> )}
              {errors.from && <Text style={[errorTextStyle, { marginBottom: 8 }]}>{errors.from}</Text>}

              <View style={[styles.inputRow, { paddingHorizontal: 0, borderWidth: 0 }]}>
                <MaterialCommunityIcons name="map-marker-check" size={20} color={themeColors.primary} /><TextInput ref={toInputRef} style={[styles.rowInput, textStyle]} placeholder="To: Leh" placeholderTextColor={themeColors.subtext} value={locationTo} onFocus={() => setShowLocationSuggestions('to')} onBlur={() => handleBlur('to')} onChangeText={(text) => { setLocationTo(text); if (errors.to) setErrors(prev => ({ ...prev, to: undefined })); }} />
              </View>
              {showLocationSuggestions === 'to' && ( <LocationSuggestions query={locationTo} onSelect={(loc: string) => { setLocationTo(loc); setShowLocationSuggestions(null); }} colors={themeColors} /> )}
               {errors.to && <Text style={[errorTextStyle, { marginBottom: 8 }]}>{errors.to}</Text>}
            </View>
            
            {locationTo.length > 2 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, paddingHorizontal: 4 }}>
                    <MaterialCommunityIcons name="weather-partly-cloudy" size={16} color={themeColors.subtext} />
                    <Text style={{ fontSize: 12, color: themeColors.subtext }}>Weather in {locationTo}: 12°C, Light Rain</Text>
                </View>
            )}

            <View style={[styles.toggleRow, cardStyle]}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.toggleTitle, textStyle]}>Live Journey Tracking</Text>
                     <TouchableOpacity onPress={() => Alert.alert("Live Tracking", "Enable this to show a progress bar.")}><MaterialCommunityIcons name="information-outline" size={16} color={themeColors.subtext} /></TouchableOpacity>
                </View>
                <Text style={{ color: themeColors.subtext, fontSize: 12 }}>Show progress bar on feed</Text>
              </View>
              <Switch value={isLive} onValueChange={(val) => { Haptics.selectionAsync(); setIsLive(val); }} trackColor={{ false: themeColors.border, true: themeColors.primary }} />
            </View>

            {isLive && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.section, cardStyle, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, subtextStyle]}>Total km</Text>
                  <TextInput style={[styles.metricInput, textStyle]} placeholder="0" placeholderTextColor={themeColors.subtext} keyboardType="numeric" value={totalKm} onChangeText={setTotalKm} />
                </View>
                <View style={[styles.section, cardStyle, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, subtextStyle]}>Done km</Text>
                  <TextInput style={[styles.metricInput, textStyle]} placeholder="0" placeholderTextColor={themeColors.subtext} keyboardType="numeric" value={completedKm} onChangeText={setCompletedKm} />
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.divider} />
        
        <View style={{ marginBottom: 24 }}>
             <Text style={[styles.sectionLabel, subtextStyle]}>PRIVACY & SETTINGS</Text>
             <View style={[styles.section, cardStyle, { paddingVertical: 0 }]}>
                 <View style={[styles.toggleRow, { borderWidth: 0, paddingHorizontal: 0, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: themeColors.border }]}>
                     <View>
                         <Text style={[styles.toggleTitle, textStyle, { fontSize: 15 }]}>Visibility</Text>
                         <Text style={{ color: themeColors.subtext, fontSize: 12 }}>Who can see this post</Text>
                     </View>
                     <View style={{ flexDirection: 'row', gap: 8 }}>
                         <TouchableOpacity onPress={() => setPrivacy('public')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: privacy === 'public' ? themeColors.text : themeColors.border }}>
                             <Text style={{ color: privacy === 'public' ? themeColors.background : themeColors.subtext, fontSize: 12, fontWeight: '700' }}>Public</Text>
                         </TouchableOpacity>
                         <TouchableOpacity onPress={() => setPrivacy('friends')} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: privacy === 'friends' ? themeColors.text : themeColors.border }}>
                             <Text style={{ color: privacy === 'friends' ? themeColors.background : themeColors.subtext, fontSize: 12, fontWeight: '700' }}>Friends</Text>
                         </TouchableOpacity>
                     </View>
                 </View>
                 
                 {/* <View style={[styles.toggleRow, { borderWidth: 0, paddingHorizontal: 0, paddingVertical: 12 }]}>
                     <View>
                         <Text style={[styles.toggleTitle, textStyle, { fontSize: 15 }]}>Sensitive Content</Text>
                         <Text style={{ color: themeColors.subtext, fontSize: 12 }}>Hide media behind a warning</Text>
                     </View>
                     <Switch value={isSensitive} onValueChange={setIsSensitive} trackColor={{ false: themeColors.border, true: themeColors.primary }} />
                 </View> */}
             </View>
        </View>

        {/* <View style={{ marginBottom: 8 }}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.sectionLabel, subtextStyle, { marginBottom: 0 }]}>SCHEDULE POST</Text>
                <Switch value={isScheduled} onValueChange={(val) => { Haptics.selectionAsync(); setIsScheduled(val); }} trackColor={{ false: themeColors.border, true: themeColors.primary }} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
             </View>
             {isScheduled && (
                 <View style={[styles.section, cardStyle, { padding: 12 }]}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                         <Text style={{ color: themeColors.text }}>Date & Time</Text>
                         <TouchableOpacity onPress={() => Alert.alert("Date Picker", "Mock Picker")} style={{ backgroundColor: themeColors.border, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}><Text style={{ color: themeColors.text, fontWeight: '600' }}>Tomorrow, 9:00 AM</Text></TouchableOpacity>
                     </View>
                     
                     
                     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: themeColors.border }}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                             <MaterialCommunityIcons name="calendar-sync" size={18} color={themeColors.subtext} />
                             <Text style={{ color: themeColors.subtext, fontSize: 13 }}>Add to Calendar</Text>
                         </View>
                         <Switch value={addToCalendar} onValueChange={setAddToCalendar} trackColor={{ false: themeColors.border, true: themeColors.primary }} />
                     </View>
                 </View>
             )}
        </View> */}

        <View style={styles.divider} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={[styles.sectionHeader, subtextStyle, { marginBottom: 0 }]}>LIVE PREVIEW</Text>
        </View>
        
        <View>
          <PostCard post={previewPost} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LocationSuggestions({ query, onSelect, colors }: any) {
    if (!query) return null;
    const matches = MOCK_LOCATIONS.filter(l => l.toLowerCase().includes(query.toLowerCase()));
    if (matches.length === 0) return null;
    return ( <View style={[styles.suggestionsBox, { backgroundColor: colors.card, borderColor: colors.border, position: 'relative', marginTop: 0, marginBottom: 8 }]}>{matches.map((loc, index) => ( <TouchableOpacity key={index} style={[styles.suggestionItem, { borderBottomColor: colors.border }]} onPress={() => onSelect(loc)}><MaterialCommunityIcons name="map-marker" size={14} color={colors.subtext} /><Text style={{ color: colors.text, marginLeft: 8 }}>{loc}</Text></TouchableOpacity> ))}</View> );
}

function TypeOption({ icon, label, active, onPress, colors }: any) {
  return ( <TouchableOpacity onPress={onPress} style={[styles.typeOption, { backgroundColor: active ? colors.text : colors.card, borderColor: active ? colors.text : colors.border }]}><MaterialCommunityIcons name={icon} size={20} color={active ? colors.background : colors.subtext} /><Text style={{ color: active ? colors.background : colors.subtext, fontSize: 12, fontWeight: '600' }}>{label}</Text></TouchableOpacity> );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16 },
  toast: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#323232', padding: 12, borderRadius: 8, zIndex: 1000, alignItems: 'center' },
  toastText: { color: '#FFF', fontWeight: '600' },
  instructionBox: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  instructionTitle: { fontWeight: '700', fontSize: 14 },
  typeSelectorContainer: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  typeOption: { flex: 1, height: 40, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  section: { padding: 16, borderRadius: 16, borderWidth: 1 },
  mainInput: { fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  richTextBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  imageUploadArea: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', position: 'relative', justifyContent: 'center', alignItems: 'center' },
  uploadPlaceholder: { flex: 1, width: '100%', borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
  uploadedImage: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 },
  removeImageBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 16, borderWidth: 1, borderColor: 'transparent', gap: 12 },
  rowInput: { flex: 1, fontSize: 15 },
  suggestionsBox: { position: 'absolute', top: 60, left: 0, right: 0, borderRadius: 12, borderWidth: 1, elevation: 5, zIndex: 100, overflow: 'hidden' },
  suggestionItem: { padding: 12, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center' },
  routeContainer: { },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginTop: 16 },
  toggleTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  metricInput: { fontSize: 18, fontWeight: '700' },
  sectionHeader: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 },
  previewContainer: { padding: 16, borderRadius: 16, borderWidth: 1, opacity: 0.9 },
  cardInner: { },
  previewTag: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  previewTagText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  templateChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 4 }
});

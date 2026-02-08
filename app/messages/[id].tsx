import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { ChatService } from "../../app/services/chat";
import { DatingService, DatingProfile } from "../../app/services/dating";
import { Message } from "../../app/types";
import { format } from "date-fns";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const partnerId = id as string;
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors, isDark);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [partner, setPartner] = useState<DatingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (user && partnerId) {
        loadData();
    }
  }, [user, partnerId]);

  useEffect(() => {
      if (user && partnerId) {
          const unsub = ChatService.subscribeToDirectMessages(user.$id, partnerId, (newMsg) => {
              setMessages(prev => {
                  if (prev.find(m => m.$id === newMsg.$id)) return prev;
                  return [...prev, newMsg];
              });
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          });
          return () => {
              if (unsub) unsub();
          };
      }
  }, [user, partnerId]);

  const loadData = async () => {
      try {
          const [profile, msgs] = await Promise.all([
              DatingService.getUserProfile(partnerId),
              ChatService.getDirectMessages(user!.$id, partnerId)
          ]);
          setPartner(profile);
          setMessages(msgs);
          setLoading(false);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
      } catch (error) {
          console.error("Failed to load chat data", error);
          setLoading(false);
      }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;
    
    const content = inputText.trim();
    setInputText(""); 

    try {
        await ChatService.sendMessage({
            receiverId: partnerId,
            content: content
        });
        // The subscription will add the message to the list usually, 
        // but we can optimistic update if we want. 
        // For now rely on subscription/fetch or simple reload if needed.
        // Actually subscription catches our own messages too if backend reflects them.
    } catch (error) {
        console.error("Failed to send", error);
        setInputText(content);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.userId === user?.$id;
    return (
        <View style={[
        styles.messageBubble,
        isMe ? styles.myBubble : styles.theirBubble
        ]}>
        <Text style={[
            styles.messageText,
            isMe ? styles.myText : styles.theirText
        ]}>{item.content}</Text>
        <Text style={[
            styles.timeText,
            isMe ? styles.myTime : styles.theirTime
        ]}>{format(new Date(item.createdAt), 'p')}</Text>
        </View>
    );
  };

  if (loading) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={colors.primary} />
          </View>
      );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
            <Text style={styles.headerName}>{partner?.name || "Nomad"}</Text>
            <Text style={styles.headerStatus}>{partner?.location || "Online"}</Text>
        </View>
        <TouchableOpacity>
          <Feather name="more-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.$id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachBtn}>
            <Feather name="plus" size={24} color={colors.subtext} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.subtext}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Feather name="send" size={20} color={isDark ? "#000" : "#FFF"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { padding: 8, marginRight: 8 },
  headerTitleContainer: { flex: 1 },
  headerName: { fontSize: 16, fontWeight: '700', color: colors.text },
  headerStatus: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 20 },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myText: { color: isDark ? '#000' : '#FFF' },
  theirText: { color: colors.text },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  myTime: { color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)' },
  theirTime: { color: colors.subtext },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 30, 
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  attachBtn: { padding: 8 },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
});

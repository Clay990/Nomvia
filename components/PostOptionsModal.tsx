import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, TouchableWithoutFeedback, Dimensions, Platform, Share } from 'react-native';
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

interface PostOptionsModalProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (option: 'share' | 'report' | 'block') => void;
}

const { height } = Dimensions.get('window');

export default function PostOptionsModal({ visible, onClose, onSelect }: PostOptionsModalProps) {
    const { colors, isDark } = useTheme();
    const slideAnim = useRef(new Animated.Value(height)).current;
    const [showModal, setShowModal] = useState(visible);

    useEffect(() => {
        if (visible) {
            setShowModal(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                damping: 20,
                stiffness: 90
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 250,
                useNativeDriver: true
            }).start(() => setShowModal(false));
        }
    }, [visible]);

    if (!showModal) return null;

    const handleOption = (option: 'share' | 'report' | 'block') => {
        Haptics.selectionAsync();
        onSelect(option);
    };

    return (
        <Modal
            transparent
            visible={showModal}
            onRequestClose={onClose}
            animationType="none"
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                     <Animated.View style={[styles.dimmer, { opacity: 1 }]} />
                </View>
            </TouchableWithoutFeedback>

            <Animated.View 
                style={[
                    styles.sheet, 
                    { 
                        backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                        transform: [{ translateY: slideAnim }],
                        paddingBottom: Platform.OS === 'ios' ? 40 : 24
                    }
                ]}
            >
                <View style={styles.handleContainer}>
                    <View style={[styles.handle, { backgroundColor: isDark ? '#333' : '#E5E5EA' }]} />
                </View>

                {/* Grid Actions */}
                <View style={styles.gridContainer}>
                    <TouchableOpacity style={styles.gridItem} onPress={() => handleOption('share')}>
                        <View style={[styles.gridIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Feather name="share" size={24} color={colors.text} />
                        </View>
                        <Text style={[styles.gridLabel, { color: colors.text }]}>Share</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridItem} onPress={() => {}}>
                         <View style={[styles.gridIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Feather name="bookmark" size={24} color={colors.text} />
                        </View>
                        <Text style={[styles.gridLabel, { color: colors.text }]}>Save</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridItem} onPress={() => {}}>
                         <View style={[styles.gridIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Feather name="link" size={24} color={colors.text} />
                        </View>
                        <Text style={[styles.gridLabel, { color: colors.text }]}>Link</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.gridItem} onPress={() => {}}>
                         <View style={[styles.gridIcon, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                            <Feather name="maximize" size={24} color={colors.text} />
                        </View>
                        <Text style={[styles.gridLabel, { color: colors.text }]}>View</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? '#333' : '#F2F2F7' }]} />

                {/* List Actions */}
                <View style={styles.listContainer}>
                    <TouchableOpacity 
                        style={styles.listItem} 
                        onPress={() => handleOption('block')}
                    >
                         <Feather name="slash" size={20} color={colors.text} />
                         <Text style={[styles.listText, { color: colors.text }]}>Not Interested</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.listItem} 
                        onPress={() => {}}
                    >
                         <Feather name="user-minus" size={20} color={colors.text} />
                         <Text style={[styles.listText, { color: colors.text }]}>Unfollow User</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.listItem} 
                        onPress={() => handleOption('report')}
                    >
                         <Feather name="flag" size={20} color={colors.danger} />
                         <Text style={[styles.listText, { color: colors.danger }]}>Report Content</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.cancelButton, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]} 
                    onPress={onClose}
                >
                    <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    dimmer: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 16,
        paddingBottom: 40, 
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    handleContainer: {
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 8,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    gridItem: {
        alignItems: 'center',
        gap: 8,
    },
    gridIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 8,
    },
    listContainer: {
        marginBottom: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    listText: {
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        paddingVertical: 16,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '700',
    }
});
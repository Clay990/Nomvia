import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useTheme } from '../../context/ThemeContext';

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSubmit: () => void;
}

export default function SearchBar({ searchQuery, setSearchQuery, onSubmit }: SearchBarProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name="search" size={18} color={colors.subtext} />
                <TextInput 
                     style={{ flex: 1, color: colors.text, marginLeft: 8 }}
                     placeholder="Search routes, people..."
                     placeholderTextColor={colors.subtext}
                     value={searchQuery}
                     onChangeText={setSearchQuery}
                     onSubmitEditing={onSubmit}
                     returnKeyType="search"
                     autoFocus
                     accessibilityLabel="Search posts"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => { setSearchQuery(''); onSubmit(); }}>
                        <MaterialCommunityIcons name="close-circle" size={16} color={colors.subtext} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
    },
});

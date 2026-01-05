import axios from 'axios';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://192.168.1.10:3000/api';

export default function PlaySelection() {
  const [stacks, setStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode } = useLocalSearchParams();
  const dark = isDarkMode === 'true';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const theme = {
    bg: dark ? '#121212' : '#FFFFFF',
    text: dark ? '#FFFFFF' : '#000000',
    card: dark ? '#1E1E1E' : '#F2F2F2',
    border: dark ? '#333' : '#000',
  };

  const getStacks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stacks`);
      setStacks(response.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { getStacks(); }, []));

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top + 20 }]}>
      <StatusBar barStyle={dark ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>← BACK</Text></TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Choose a Stack</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {loading ? <ActivityIndicator size="large" color="#BB86FC" /> : stacks.map((stack) => (
          <TouchableOpacity 
            key={stack._id}
            style={[styles.stackItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: `/game/${stack._id}`, params: { isDarkMode: isDarkMode.toString() } } as any)}
          >
            <Text style={[styles.stackName, { color: theme.text }]}>{stack.name}</Text>
            <Text style={{ color: '#BB86FC', fontWeight: 'bold' }}>{stack.cards?.length || 0} Cards</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { color: '#BB86FC', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: '900' },
  stackItem: { padding: 25, borderRadius: 15, borderWidth: 2, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stackName: { fontSize: 18, fontWeight: '800' },
});
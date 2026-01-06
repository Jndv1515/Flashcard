import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'http://192.168.1.10:3000/api'; 

export default function HomeScreen() {
  const router = useRouter();
  const [stacks, setStacks] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const getStacks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stacks`);
      setStacks(res.data);
    } catch (e) { console.error(e); }
  };

  useFocusEffect(useCallback(() => { getStacks(); }, []));

  const handleLongPress = (id: string, name: string) => {
    Alert.alert("Delete Stack", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await axios.delete(`${API_BASE_URL}/stacks/${id}`);
          getStacks();
      }}
    ]);
  };

  const filteredStacks = stacks.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.topRow}>
          <Text style={styles.headerTitle}>My Library</Text>
          {/* Secret "?" Button remains for Pomodoro access */}
          <TouchableOpacity style={styles.qBtn} onPress={() => router.push('/secret')}>
            <Text style={styles.qText}>?</Text>
          </TouchableOpacity>
        </View>
        <TextInput 
          style={styles.searchBar} 
          placeholder="Search subjects..." 
          placeholderTextColor="#666" 
          value={search} 
          onChangeText={setSearch} 
        />
      </View>

      <FlatList 
        data={filteredStacks} 
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.stackCard}
            onPress={() => router.push({ pathname: `/study/${item._id}`, params: { name: item.name } } as any)}
            onLongPress={() => handleLongPress(item._id, item.name)}
          >
            <Text style={styles.stackName}>{item.name}</Text>
            <Text style={styles.cardCount}>{item.cards?.length || 0} CARDS</Text>
          </TouchableOpacity>
        )}
      />

      {/* 🚀 SIMPLIFIED + BUTTON: Just the + inside the purple circle */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create-stack')}>
        <Text style={styles.plusSign}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 15 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { color: '#FFFFFF', fontSize: 32, fontWeight: 'bold' },
  qBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  qText: { color: '#BB86FC', fontSize: 18, fontWeight: 'bold' },
  searchBar: { backgroundColor: '#161616', color: '#FFF', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#222' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 100 },
  stackCard: { flex: 1, height: 140, margin: 8, backgroundColor: '#161616', borderRadius: 24, padding: 20, justifyContent: 'center', borderWidth: 1, borderColor: '#222' },
  stackName: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  cardCount: { color: '#666', fontSize: 10, marginTop: 8, fontWeight: 'bold', textAlign: 'center' },
  
  fab: { 
    position: 'absolute', 
    bottom: 35, 
    right: 30, 
    backgroundColor: '#BB86FC', 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  plusSign: { color: '#FFF', fontSize: 36, fontWeight: '300', marginTop: -4 }
});
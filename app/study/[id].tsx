import axios from 'axios';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'http://192.168.1.10:3000/api';

export default function StudyScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [stackName, setStackName] = useState('');

  const fetchStack = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stacks/${id}`);
      setCards(res.data.cards || []);
      setStackName(res.data.name); 
    } catch (e) { console.error(e); }
  };

  useFocusEffect(useCallback(() => { fetchStack(); }, [id]));

  const deleteCard = (cardId: string) => {
    Alert.alert("Delete", "Remove this card?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          const updatedCards = cards.filter(c => c._id !== cardId);
          await axios.put(`${API_BASE_URL}/stacks/${id}`, { cards: updatedCards });
          setCards(updatedCards);
      }}
    ]);
  };

  const handlePlayMode = (mode: 'study' | 'exam') => {
    if (cards.length === 0) {
      Alert.alert("Empty Stack", "You need at least 1 card to play.");
      return;
    }
    if (mode === 'exam' && cards.length < 4) {
      Alert.alert("Exam Mode", "You need at least 4 cards for multiple choice.");
      return;
    }
    router.push({ pathname: `/game/${id}`, params: { mode } } as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backCircle}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{stackName || "Loading..."}</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.btnPlay} onPress={() => handlePlayMode('study')}><Text style={styles.btnText}>PLAY</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnExam} onPress={() => handlePlayMode('exam')}><Text style={styles.btnText}>EXAM</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btnAdd} onPress={() => router.push({ pathname: `/study/add-card`, params: { stackId: id } } as any)}><Text style={[styles.btnText, { color: '#FFF' }]}>ADD</Text></TouchableOpacity>
      </View>

      <FlatList 
        data={cards} 
        keyExtractor={(item) => item._id} 
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{item.front}</Text>
              <Text style={{ color: '#BB86FC' }}>{item.back}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteCard(item._id)}>
               {/* 🚀 Ensure delete.png exists in assets folder */}
               <Image source={require('../../assets/delete.png')} style={{ width: 22, height: 22, tintColor: '#FF5252' }} />
            </TouchableOpacity>
          </View>
        )} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 20 },
  header: { flexDirection: 'row', marginTop: 50, marginBottom: 20, gap: 15, alignItems: 'center' },
  backCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#161616', justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  title: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  btnPlay: { flex: 1, height: 55, backgroundColor: '#BB86FC', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnExam: { flex: 1, height: 55, backgroundColor: '#03DAC6', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnAdd: { flex: 1, height: 55, backgroundColor: '#1A1A1A', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontWeight: 'bold', fontSize: 12, color: '#000' },
  cardItem: { backgroundColor: '#161616', padding: 20, borderRadius: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
});
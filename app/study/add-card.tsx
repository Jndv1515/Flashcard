import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'http://192.168.1.10:3000/api';

export default function AddCardScreen() {
  const { stackId } = useLocalSearchParams();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    if (!front.trim() || !back.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/stacks/${stackId}/cards`, { front, back });
      setFront(''); 
      setBack('');
      
      setShowToast(true);
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
      ]).start(() => setShowToast(false));
    } catch (e) { console.error(e); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {showToast && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <Text style={styles.toastText}>Added!</Text>
        </Animated.View>
      )}

      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← DONE</Text>
      </TouchableOpacity>

      <Text style={styles.header}>New Flashcard</Text>

      <TextInput style={styles.input} value={front} onChangeText={setFront} placeholder="Question..." placeholderTextColor="#444" multiline />
      <TextInput style={styles.input} value={back} onChangeText={setBack} placeholder="Answer..." placeholderTextColor="#444" multiline />

      <TouchableOpacity style={styles.btn} onPress={handleAdd}>
        <Text style={styles.btnText}>ADD CARD</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 30, justifyContent: 'center' },
  toast: { position: 'absolute', top: 80, alignSelf: 'center', backgroundColor: '#39FF14', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  toastText: { color: '#000', fontWeight: 'bold' },
  backBtn: { position: 'absolute', top: 60, left: 30 },
  backText: { color: '#BB86FC', fontWeight: 'bold' },
  header: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#161616', color: '#FFF', padding: 20, borderRadius: 15, marginBottom: 20, minHeight: 120, textAlignVertical: 'top' },
  btn: { backgroundColor: '#BB86FC', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#000', fontWeight: 'bold' }
});
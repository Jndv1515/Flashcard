import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  BackHandler, Keyboard,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text,
  TextInput, TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const API_BASE_URL = 'http://192.168.1.10:3000/api'; 

export default function CreateStackScreen() {
  const [name, setName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const backAction = () => {
      
      if (Keyboard.isVisible()) {
        Keyboard.dismiss();
      } else {
        router.replace('/');
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/stacks`, { name });
      router.replace('/'); 
    } catch (e) { console.error(e); }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>← CANCEL</Text>
          </TouchableOpacity>

          <Text style={styles.header}>New Stack</Text>

          <TextInput
            style={styles.input}
            placeholder="Stack Name (e.g. Science)"
            placeholderTextColor="#444"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnText}>CREATE STACK</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  inner: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#0A0A0A' },
  cancelBtn: { position: 'absolute', top: 60, left: 30 },
  cancelText: { color: '#BB86FC', fontWeight: 'bold' },
  header: { color: '#FFF', fontSize: 42, fontWeight: 'bold', marginBottom: 40 },
  input: { backgroundColor: '#161616', color: '#FFF', padding: 20, borderRadius: 15, fontSize: 18, marginBottom: 20 },
  createBtn: { backgroundColor: '#BB86FC', padding: 20, borderRadius: 15, alignItems: 'center' },
  createBtnText: { color: '#000', fontWeight: 'bold' }
});
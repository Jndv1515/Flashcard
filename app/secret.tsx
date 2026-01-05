import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const TOTAL_TIME = 5 * 60; 
const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SecretScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(TOTAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // 🚀 FIXED AUDIO SETUP
  useEffect(() => {
    async function setupAudio() {
      try {
        // This forces audio to play even if the phone is on silent mode
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          interruptionModeIOS: 1, // DoNotMix
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1, // DoNotMix
          playThroughEarpieceAndroid: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          require('../assets/bgm/odyssey.mp3'),
          { shouldPlay: false, isLooping: true, volume: 1.0 }
        );
        soundRef.current = sound;
      } catch (e) {
        console.error("AUDIO LOAD ERROR: Check if assets/bgm/odyssey.mp3 exists and restart with -c");
      }
    }
    setupAudio();
    return () => { if (soundRef.current) soundRef.current.unloadAsync(); };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      if (soundRef.current) soundRef.current.stopAsync();
      Vibration.vibrate([0, 500, 200, 500]);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!isActive) {
      if (soundRef.current) {
        await soundRef.current.playAsync(); // 🚀 Force play
      }
    } else {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
    }
    setIsActive(!isActive);
  };

  const progressOffset = CIRCUMFERENCE - (seconds / TOTAL_TIME) * CIRCUMFERENCE;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
        <Text style={styles.backT}>← EXIT</Text>
      </TouchableOpacity>

      <View style={styles.timerWrapper}>
        <Svg width={300} height={300} style={styles.svg}>
          <Circle cx="150" cy="150" r={RADIUS} stroke="#161616" strokeWidth="10" fill="transparent" />
          <Circle
            cx="150" cy="150" r={RADIUS}
            stroke="#BB86FC" strokeWidth="10" fill="transparent"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            transform="rotate(-90 150 150)"
          />
        </Svg>
        <View style={styles.textOverlay}>
          <Text style={styles.timerText}>{Math.floor(seconds/60)}:{seconds%60 < 10 ? '0':''}{seconds%60}</Text>
          <Text style={styles.status}>{isActive ? "FOCUSING" : "PAUSED"}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.playBtn, {borderColor: isActive ? '#03DAC6' : '#BB86FC'}]} 
        onPress={toggleTimer}
      >
        <Text style={styles.playIcon}>{isActive ? "⏸" : "▶"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 60, left: 30 },
  backT: { color: '#BB86FC', fontWeight: 'bold' },
  timerWrapper: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center', marginBottom: 50 },
  svg: { position: 'absolute' },
  textOverlay: { alignItems: 'center' },
  timerText: { color: '#FFF', fontSize: 70, fontWeight: '100' },
  status: { color: '#03DAC6', letterSpacing: 5, fontWeight: 'bold', fontSize: 10, marginTop: 5 },
  playBtn: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  playIcon: { color: '#FFF', fontSize: 24 }
});
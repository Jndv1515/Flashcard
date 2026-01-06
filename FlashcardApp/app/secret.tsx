import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, Vibration, View } from 'react-native';

const TOTAL_TIME = 5 * 60; 
const RADIUS = 120;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function SecretScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(TOTAL_TIME);
  const [isActive, setIsActive] = useState(false);

  // 1. Setup the player using the lifecycle-managed hook
  const player = useAudioPlayer(require('../assets/bgm/odyssey.mp3'));

  useEffect(() => {
    player.loop = true;
    
    return () => {
      // 🚀 THE FIX: Check if player exists and pause before unmounting
      if (player) {
        player.pause();
      }
    };
  }, [player]);

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      if (player) player.pause(); 
      Vibration.vibrate([0, 500, 200, 500]);
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const toggleTimer = () => {
    // Safety check to ensure player is ready
    if (!player) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isActive) {
      player.pause();
    } else {
      player.play();
    }
    setIsActive(!isActive);
  };

  const progressOffset = CIRCUMFERENCE - (seconds / TOTAL_TIME) * CIRCUMFERENCE;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.backBtn}>
        <Text style={styles.backT}>← EXIT</Text>
      </TouchableOpacity>
      {/* ... rest of your UI code ... */}
    </View>
  );
}
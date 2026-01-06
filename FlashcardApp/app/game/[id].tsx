import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const API_BASE_URL = 'http://192.168.1.10:3000/api';

export default function GameScreen() {
  const { id, name, mode } = useLocalSearchParams();
  const router = useRouter();
  const [cards, setCards] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  
  
  const [sessionScore, setSessionScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [missStreak, setMissStreak] = useState(0);
  const [seconds, setSeconds] = useState(0); 
  const [popupText, setPopupText] = useState('');
  const [isGreen, setIsGreen] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    axios.get(`${API_BASE_URL}/stacks/${id}`).then(res => {
      const deck = [...res.data.cards].sort(() => Math.random() - 0.5);
      setCards(deck);
      if (mode === 'exam') generateOptions(deck, 0);
    });

    
    const timerInterval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [id]);

  const triggerFeedback = (text: string, green: boolean) => {
    setPopupText(text);
    setIsGreen(green);
    fadeAnim.setValue(0);
    shakeAnim.setValue(0);

    if (green) {
      
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, delay: 300, useNativeDriver: true })
      ]).start();
    } else {
      
      Animated.parallel([
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, delay: 400, useNativeDriver: true })
        ])
      ]).start();
    }
  };

  const getCorrectMsg = (count: number) => {
    if (count === 1) return "Nice!";
    if (count === 2) return "Good Job!";
    if (count === 3) return "Very Good!";
    if (count === 4) return "Fantastic!";
    return "Genius!!!";
  };

  const getMissMsg = (count: number) => {
    if (count === 1) return "Bad";
    if (count === 2) return "Come on man..";
    if (count === 3) return "Really?";
    return "You're Guessing..";
  };

  const generateOptions = (all: any[], cur: number) => {
    const correct = all[cur].back;
    const distractors = all.filter((_, i) => i !== cur).map(c => c.back).sort(() => Math.random() - 0.5).slice(0, 3);
    setOptions([correct, ...distractors].sort(() => Math.random() - 0.5));
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleNext = (isCorrect: boolean) => {
    const newScore = isCorrect ? sessionScore + 1 : sessionScore;
    setSessionScore(newScore);

    if (isCorrect) {
      const newStreak = correctStreak + 1;
      setCorrectStreak(newStreak);
      setMissStreak(0);
      triggerFeedback(getCorrectMsg(newStreak), true);
    } else {
      const newMiss = missStreak + 1;
      setMissStreak(newMiss);
      setCorrectStreak(0);
      triggerFeedback(getMissMsg(newMiss), false);
    }

    if (index < cards.length - 1) {
      setTimeout(() => {
        setIndex(index + 1);
        setFlipped(false);
        if (mode === 'exam') generateOptions(cards, index + 1);
      }, 600);
    } else {
      
      setTimeout(() => {
        Alert.alert(
          "Set Complete!", 
          `Score: ${newScore} / ${cards.length}\nTime: ${formatTime(seconds)}`, 
          [{ text: "Done", onPress: () => router.replace(`/study/${id}` as any) }]
        );
      }, 800);
    }
  };

  if (cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/**/}
      <Animated.View style={[styles.popup, { 
          opacity: fadeAnim, 
          transform: [
            { scale: isGreen ? fadeAnim.interpolate({inputRange:[0,1], outputRange:[0.9, 1.2]}) : 1 },
            { translateX: shakeAnim }
          ] 
      }]}>
        <Text style={[styles.popText, { color: isGreen ? '#39FF14' : '#FF0000' }]}>{popupText}</Text>
      </Animated.View>

      <View style={styles.header}>
        <Text style={styles.timerText}>⏱️ {formatTime(seconds)}</Text>
        <Text style={styles.progressText}>{index + 1} / {cards.length}</Text>
      </View>

      <View style={styles.content}>
        {mode === 'exam' ? (
          <View>
            <Text style={styles.qText}>{cards[index].front}</Text>
            <View style={styles.optionsBox}>
              {options.map((opt, i) => (
                <TouchableOpacity key={i} style={styles.optBtn} onPress={() => handleNext(opt === cards[index].back)}>
                  <Text style={styles.optText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View>
            <TouchableOpacity activeOpacity={0.9} style={[styles.card, {borderColor: flipped ? '#03DAC6' : '#BB86FC'}]} onPress={() => setFlipped(!flipped)}>
              <View style={[styles.badge, { backgroundColor: flipped ? '#03DAC6' : '#BB86FC' }]}><Text style={styles.badgeText}>{flipped ? "ANSWER" : "QUESTION"}</Text></View>
              <Text style={styles.cardText}>{flipped ? cards[index].back : cards[index].front}</Text>
            </TouchableOpacity>
            {flipped && (
              <View style={styles.masteryRow}>
                <TouchableOpacity style={[styles.mBtn, {backgroundColor: '#FF0000'}]} onPress={() => handleNext(false)}><Text style={styles.mText}>MISS</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.mBtn, {backgroundColor: '#39FF14'}]} onPress={() => handleNext(true)}><Text style={styles.mText}>GOT IT!</Text></TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 25 },
  popup: { position: 'absolute', top: '18%', alignSelf: 'center', zIndex: 100 },
  popText: { fontSize: 24, fontWeight: '900', textAlign: 'center' }, // Reduced size
  header: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 },
  timerText: { color: '#BB86FC', fontWeight: 'bold' },
  progressText: { color: '#666', fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center' },
  qText: { color: '#FFF', fontSize: 26, textAlign: 'center', marginBottom: 40, fontWeight: 'bold' },
  optionsBox: { gap: 12 },
  optBtn: { backgroundColor: '#161616', padding: 22, borderRadius: 18, borderWidth: 1, borderColor: '#333' },
  optText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
  card: { height: 400, backgroundColor: '#161616', borderRadius: 30, justifyContent: 'center', alignItems: 'center', borderWidth: 2, padding: 30 },
  badge: { position: 'absolute', top: 20, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { color: '#000', fontSize: 10, fontWeight: '900' },
  cardText: { color: '#FFF', fontSize: 24, textAlign: 'center', fontWeight: 'bold' },
  masteryRow: { flexDirection: 'row', gap: 12, marginTop: 25 },
  mBtn: { flex: 1, height: 65, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  mText: { fontWeight: '900', color: '#000' }
});
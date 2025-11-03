// screens/components/AudioPlayer.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';

// פונקציית עזר להמרת מילישניות לדקות:שניות
function formatTime(millis) {
  if (isNaN(millis) || millis < 0) return '00:00';
  const totalSeconds = millis / 1000;
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const AudioPlayer = ({ 
  track, 
  isPlaying, 
  isLoading,
  position, 
  duration,
  onPlayPause, 
  onSeek, 
  onNext, 
  onPrevious 
}) => {
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#007AFF" style={{ marginBottom: 10 }}/>
      ) : (
        <Text style={styles.trackTitle}>{track.fileName}</Text>
      )}

      <Slider
        style={styles.slider}
        value={position}
        maximumValue={duration}
        minimumValue={0}
        onSlidingComplete={onSeek}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#007AFF"
      />
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={onPrevious} disabled={isLoading}>
          <Text style={styles.controlButton}>⏮️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onPlayPause} disabled={isLoading}>
          <Text style={styles.playPauseButton}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onNext} disabled={isLoading}>
          <Text style={styles.controlButton}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', padding: 10, backgroundColor: '#f8f8f8', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  trackTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 10, minHeight: 20 },
  slider: { width: '100%', height: 40 },
  timeContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 },
  timeText: { fontSize: 12, color: '#888' },
  controlsContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 10 },
  controlButton: { fontSize: 24 },
  playPauseButton: { fontSize: 32 },
});
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
  State,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';

// פונקציית עזר להמרת שניות לדקות:שניות
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// מקבל את הפונקציה onPlayPause מהקומפוננטה האב
export const AudioPlayer = ({ track, onPlayPause, isActive }) => {
  const { state: playbackState } = usePlaybackState();
  const { position, duration } = useProgress();

  const isPlaying =
    isActive &&
    (playbackState === State.Playing || playbackState === State.Buffering);

  const onSeek = (value) => {
    TrackPlayer.seekTo(value);
  };

  const onNext = () => {
    TrackPlayer.skipToNext();
  };

  const onPrevious = () => {
    TrackPlayer.skipToPrevious();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.trackTitle}>{track.title}</Text>

      {/* סרגל התקדמות (Slider) */}
      <Slider
        style={styles.slider}
        value={isActive ? position : 0}
        maximumValue={isActive ? duration : 1}
        minimumValue={0}
        onSlidingComplete={onSeek}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#d3d3d3"
        thumbTintColor="#007AFF"
      />

      {/* זמנים */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(isActive ? position : 0)}</Text>
        <Text style={styles.timeText}>{formatTime(isActive ? duration : 0)}</Text>
      </View>

      {/* כפתורי ניווט */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={onPrevious}>
          <Text style={styles.controlButton}>⏮️</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onPlayPause}>
          <Text style={styles.playPauseButton}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNext}>
          <Text style={styles.controlButton}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#888',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  controlButton: {
    fontSize: 24,
  },
  playPauseButton: {
    fontSize: 32,
  },
});
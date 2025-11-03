// services/playbackService.js
import TrackPlayer, {
  Event,
  RepeatMode,
} from 'react-native-track-player';

// פונקציה זו מגדירה את האירועים שהנגן מאזין להם
export async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

  // אופציונלי: עצור את הנגינה כשהמשתמש סוגר את האפליקציה
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.destroy();
  });
}
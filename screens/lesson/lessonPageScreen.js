import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllFiles, getTasks, markTaskCompleted } from '../../utils/api';
import YoutubeIframe from 'react-native-youtube-iframe';
import Pdf from 'react-native-pdf';
// 1. ייבוא הנגן החדש ורכיבי הספרייה
import TrackPlayer, {
  usePlaybackState,
  State,
  Capability,
} from 'react-native-track-player';
import { AudioPlayer } from '../components/AudioPlayer'; // 2. ייבוא הרכיב שיצרנו

// --- פונקציות עזר (ללא שינוי) ---
const getFileIcon = (fileType) => { /* ... (כמו קודם) ... */ };
function getYouTubeVideoId(url) { /* ... (כמו קודם) ... */ }

// פונקציית אתחול חד-פעמית לנגן
async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });
  } catch (e) {
    console.error('Error setting up TrackPlayer', e);
  }
}

export default function LessonPageScreen({ navigation, route }) {
    const [filesWithTasks, setFilesWithTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isManager, setIsManager] = useState(false);
    
    // 3. State חדש כדי לדעת איזה שיר פעיל
    const [activeTrackId, setActiveTrackId] = useState(null);
    const { state: playbackState } = usePlaybackState();

    // 4. הסרנו את ה-State הישן של האודיו
    // const [sound, setSound] = useState(null);
    // const [isPlaying, setIsPlaying] = useState(false);
    // const [loadingAudio, setLoadingAudio] = useState(false);
    
    const [failedFileIds, setFailedFileIds] = useState(new Set());
    const { lesson, class: classParams } = route.params;

    const setupScreen = useCallback(async () => {
        try {
            setLoading(true);
            await setupPlayer(); // 5. קריאה לאתחול הנגן
            
            const userIdPromise = AsyncStorage.getItem('userId');
            const filesPromise = getAllFiles(lesson._id);
            // ... (קוד בדיקת מנהל ומשתמש נשאר זהה) ...
            const [currentUserId, filesResponse] = await Promise.all([userIdPromise, filesPromise]);
            setUserId(currentUserId);

            let isUserManager = false;
            if (currentUserId) {
                const managers = classParams.managers || [];
                isUserManager = managers.includes(currentUserId);
                setIsManager(isUserManager);
            } else {
                setIsManager(false);
            }
            // ... (קוד טעינת משימות נשאר זהה) ...
            const files = filesResponse.data;
            const filesAndTasksPromises = files.map(async (file) => {
                try {
                    const tasksResponse = await getTasks(file._id);
                    let tasks = tasksResponse.data;

                    if (!isUserManager && currentUserId) {
                        tasks = tasks.filter(task =>
                            !task.assignedTo ||
                            task.assignedTo.length === 0 ||
                            task.assignedTo.includes(currentUserId)
                        );
                    }
                    return { file, tasks };
                } catch (taskError) {
                    console.error(`Error loading tasks for file ${file._id}:`, taskError);
                    return { file, tasks: [] };
                }
            });

            const combinedData = await Promise.all(filesAndTasksPromises);
            setFilesWithTasks(combinedData);

            // 6. 💡 הוספת כל קבצי האודיו לפלייליסט
            const audioTracks = combinedData
              .filter(item => item.file.fileType === 'audio')
              .map(item => ({
                id: item.file._id,
                url: item.file.fileUrl,
                title: item.file.fileName,
                artist: classParams.title, // שם הכיתה כאמן
              }));
            
            await TrackPlayer.reset(); // נקה רשימה קודמת
            await TrackPlayer.add(audioTracks); // הוסף את הרשימה החדשה

        } catch (err) {
            console.error('❌ Error loading lesson data:', err.message);
            Alert.alert('שגיאה', 'לא ניתן לטעון את נתוני השיעור.');
        } finally {
            setLoading(false);
        }
    }, [lesson._id, classParams.managers, classParams.title]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', setupScreen);
        setupScreen();

        // 7. ניקוי הנגן ביציאה מהמסך
        return () => {
          TrackPlayer.reset();
        };
    }, [navigation, setupScreen]);

    // --- פונקציות handleOpenFile ו- handleToggleTaskCompletion (ללא שינוי) ---
    const handleOpenFile = async (url) => { /* ... (כמו קודם) ... */ };
    const handleToggleTaskCompletion = useCallback(async (task) => { /* ... (כמו קודם) ... */ }, [userId]);
    
    // 8. 💡 פונקציית ניגון חדשה
    const togglePlayPause = async (track) => {
      const isCurrentTrack = (await TrackPlayer.getActiveTrack())?.id === track.id;
      
      if (isCurrentTrack && (playbackState === State.Playing || playbackState === State.Buffering)) {
        await TrackPlayer.pause();
      } else {
        // אם זה לא השיר הנוכחי, קפוץ אליו
        if (!isCurrentTrack) {
          await TrackPlayer.skip(track.id);
        }
        await TrackPlayer.play();
        setActiveTrackId(track.id); // עדכון השיר הפעיל
      }
    };
    
    const renderTaskItem = ({ item: task }) => {
        // 9. 💡 עדכון קטן: הוספנו את רכיב סימון המשימה
        const isCompleted = task.completedBy.includes(userId);
        return (
          <TouchableOpacity
            style={styles.taskItem}
            onPress={() => handleToggleTaskCompletion(task)}
          >
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View
              style={[
                styles.taskCheckbox,
                isCompleted && styles.taskCheckboxCompleted,
              ]}
            >
              {isCompleted && <Text style={styles.taskCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        );
      };

    const renderFileItem = ({ item }) => {
        const file = item.file;
        const tasksToShow = item.tasks || [];
        const videoId = file.fileType === 'video' ? getYouTubeVideoId(file.fileUrl) : null;
        const screenWidth = Dimensions.get('window').width;

        const renderTasks = (headerText) => (
            tasksToShow.length > 0 && (
                <View style={styles.tasksList}>
                    <Text style={styles.tasksHeader}>{headerText}</Text>
                    <FlatList
                        data={tasksToShow}
                        keyExtractor={(task) => task._id}
                        renderItem={renderTaskItem}
                        scrollEnabled={false}
                    />
                </View>
            )
        );

        // ... (קוד רנדור עבור fallback, וידאו, תמונה ו-PDF נשאר זהה) ...
        const renderFallbackLink = () => { /* ... (כמו קודם) ... */ };
        if (failedFileIds.has(file._id)) { /* ... (כמו קודם) ... */ }
        if (videoId) { /* ... (כמו קודם) ... */ }
        else if (file.fileType === 'image') { /* ... (כמו קודם) ... */ }
        else if (file.fileType === 'pdf') { /* ... (כמו קודם) ... */ }

        // 10. 💡 עדכון הרנדור של אודיו
        else if (file.fileType === 'audio') {
            const isActive = activeTrackId === file._id;
            return (
                <View style={styles.fileContainer}>
                    {/* אנחנו תמיד נציג את הנגן. 
                      הנגן עצמו ידע אם להציג התקדמות או לא.
                    */}
                    <AudioPlayer
                      track={{
                        id: file._id,
                        url: file.fileUrl,
                        title: file.fileName,
                        artist: classParams.title,
                      }}
                      isActive={isActive}
                      onPlayPause={() => togglePlayPause(file)}
                    />
                    {renderTasks('משימות לקובץ שמע:')}
                </View>
            );
        }
        else {
            // ... (קוד רנדור לקבצים אחרים נשאר זהה) ...
            return ( /* ... (כמו קודם) ... */ );
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />
    }

    const filteredFilesToShow = filesWithTasks;

    return (
        <View style={styles.container}>
            {/* ... (קוד ה-JSX הראשי נשאר זהה) ... */}
            <Text style={styles.title}>{lesson.title}</Text>
            <Text style={styles.subtitle}>שיעור ב: {classParams.title}</Text>
            {isManager && ( /* ... (כמו קודם) ... */ )}
            <FlatList
                data={filteredFilesToShow}
                keyExtractor={(item) => item.file._id}
                renderItem={renderFileItem}
                ListEmptyComponent={<Text style={styles.emptyText}>עדיין אין קבצים או משימות רלוונטיות לשיעור זה</Text>}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
}

// --- הסטיילים (ללא שינוי, מלבד הוספת הסטיילים של סימון המשימה) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f7f6'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 16,
  },
  adminButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  adminButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  fileHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e9ecef',
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  fileDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 2,
  },
  fileLinkIcon: {
    fontSize: 18,
    color: '#007bff',
    marginLeft: 10,
  },
  fileTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#e9ecef',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#e9ecef',
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#e0e0e0',
  },
  pdfPreview: {
    height: 500,
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
  },
  // הסרנו את playButton ו- playButtonText
  tasksList: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tasksHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 10,
    textAlign: 'right',
  },
  taskItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    marginRight: 10,
    textAlign: 'right',
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  taskCheckboxCompleted: {
    backgroundColor: '#007bff',
  },
  taskCheckmark: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 40
  }
});
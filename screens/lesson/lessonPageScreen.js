import React, { useEffect, useState, useCallback, useRef } from 'react';
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
// 1. החזרנו את expo-audio
import { Audio } from 'expo-audio'; 
// 2. ייבוא הנגן החדש שיצרנו
import { AudioPlayer } from '../components/AudioPlayer';

// --- פונקציות עזר (ללא שינוי) ---
const getFileIcon = (fileType) => {
    switch (fileType) {
        case 'image': return '🖼️';
        case 'audio': return '🎵';
        case 'pdf': return '📄';
        case 'doc': return '📝';
        default: return '📁';
    }
};
function getYouTubeVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// 3. הגדרת מצב האודיו ברקע (חשוב!)
async function setupAudioMode() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true, // מאפשר ניגון ברקע
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  } catch (e) {
    console.error('Failed to set audio mode', e);
  }
}

export default function LessonPageScreen({ navigation, route }) {
    const [filesWithTasks, setFilesWithTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isManager, setIsManager] = useState(false);
    const [failedFileIds, setFailedFileIds] = useState(new Set());
    const { lesson, class: classParams } = route.params;

    // 4. --- State חדש לניהול אודיו ---
    const soundObject = useRef(null); // שימוש ב-ref כדי לשמור את אובייקט הסאונד
    const [audioFiles, setAudioFiles] = useState([]); // רשימה מסוננת רק של קבצי אודיו
    const [currentTrack, setCurrentTrack] = useState(null); // הקובץ שמתנגן עכשיו
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [audioPosition, setAudioPosition] = useState(0);
    const [audioDuration, setAudioDuration] = useState(1); // מתחילים ב-1 למנוע חלוקה ב-0

    // 5. פונקציית העדכון של הנגן
    const onPlaybackStatusUpdate = (status) => {
        if (!status.isLoaded) {
            if (status.error) {
                console.error(`Error loading audio: ${status.error}`);
                Alert.alert('שגיאה', 'לא ניתן לנגן את קובץ השמע.');
            }
            return;
        }
        setAudioPosition(status.positionMillis || 0);
        setAudioDuration(status.durationMillis || 1);
        setIsPlaying(status.isPlaying);
        
        // כשהשיר מסיים לנגן
        if (status.didJustFinish && !status.isLooping) {
            handleNext();
        }
    };

    // 6. --- פונקציות ניהול נגן חדשות ---
    
    // טוען ומנגן שיר
    const playAudio = async (track) => {
        setIsLoadingAudio(true);
        try {
            // אם שיר אחר מתנגן, נקה אותו
            if (soundObject.current) {
                await soundObject.current.unloadAsync();
            }
            
            const { sound } = await Audio.Sound.createAsync(
                { uri: track.fileUrl },
                { shouldPlay: true }, // נגן מיד
                onPlaybackStatusUpdate // פונקציית העדכון
            );
            soundObject.current = sound;
            setCurrentTrack(track);

        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('שגיאה', 'לא ניתן לנגן קובץ שמע זה.');
            setFailedFileIds(prev => new Set(prev).add(track._id));
        } finally {
            setIsLoadingAudio(false);
        }
    };

    // מפעיל או עוצר שיר
    const handlePlayPause = async () => {
        if (!soundObject.current) {
            // אם כלום לא מתנגן, נגן את השיר הראשון ברשימה
            if (audioFiles.length > 0) {
                playAudio(audioFiles[0].file);
            }
            return;
        }

        if (isPlaying) {
            await soundObject.current.pauseAsync();
        } else {
            await soundObject.current.playAsync();
        }
    };

    // קפיצה לשיר הבא
    const handleNext = () => {
        if (!currentTrack || audioFiles.length === 0) return;
        const currentIndex = audioFiles.findIndex(item => item.file._id === currentTrack._id);
        const nextIndex = (currentIndex + 1) % audioFiles.length; // חוזר להתחלה
        playAudio(audioFiles[nextIndex].file);
    };

    // קפיצה לשיר הקודם
    const handlePrevious = () => {
        if (!currentTrack || audioFiles.length === 0) return;
        const currentIndex = audioFiles.findIndex(item => item.file._id === currentTrack._id);
        const prevIndex = (currentIndex - 1 + audioFiles.length) % audioFiles.length; // חוזר לסוף
        playAudio(audioFiles[prevIndex].file);
    };

    // גרירת הסליידר
    const handleSeek = async (value) => {
        if (soundObject.current) {
            await soundObject.current.setPositionAsync(value);
        }
    };

    // --- טעינת נתוני המסך ---
    const setupScreen = useCallback(async () => {
        try {
            setLoading(true);
            await setupAudioMode(); // קריאה להגדרת אודיו
            
            const userIdPromise = AsyncStorage.getItem('userId');
            const filesPromise = getAllFiles(lesson._id);
            
            const [currentUserId, filesResponse] = await Promise.all([userIdPromise, filesPromise]);
            setUserId(currentUserId);
            
            // ... (קוד בדיקת מנהל נשאר זהה) ...
            let isUserManager = false;
            if (currentUserId) {
                const managers = classParams.managers || [];
                isUserManager = managers.includes(currentUserId);
                setIsManager(isUserManager);
            } else {
                setIsManager(false);
            }

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
            
            // 7. שמירת רשימת האודיו ב-state
            const audioTracks = combinedData.filter(item => item.file.fileType === 'audio');
            setAudioFiles(audioTracks);

        } catch (err) {
            console.error('❌ Error loading lesson data:', err.message);
            Alert.alert('שגיאה', 'לא ניתן לטעון את נתוני השיעור.');
        } finally {
            setLoading(false);
        }
    }, [lesson._id, classParams.managers]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', setupScreen);
        setupScreen();

        // 8. ניקוי הסאונד ביציאה מהמסך
        return () => {
          if (soundObject.current) {
            soundObject.current.unloadAsync();
          }
        };
    }, [navigation, setupScreen]);

    // --- פונקציות פתיחת קובץ וסימון משימה (ללא שינוי) ---
    const handleOpenFile = async (url) => { /* ... (כמו קודם) ... */ };
    const handleToggleTaskCompletion = useCallback(async (task) => { /* ... (כמו קודם) ... */ }, [userId]);
    const renderTaskItem = ({ item: task }) => { /* ... (כמו קודם) ... */ };

    // --- פונקציית הרינדור הראשית ---
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

        const renderFallbackLink = () => { /* ... (כמו קודם) ... */ };
        if (failedFileIds.has(file._id)) { return renderFallbackLink(); }
        if (videoId) { /* ... (כמו קודם) ... */ }
        else if (file.fileType === 'image') { /* ... (כמו קודם) ... */ }
        else if (file.fileType === 'pdf') { /* ... (כמו קודם) ... */ }

        // 9. 💡 עדכון הרנדור של אודיו
        else if (file.fileType === 'audio') {
            // נציג נגן רק אם זה השיר הפעיל
            const isActive = currentTrack?._id === file._id;
            
            return (
                <View style={styles.fileContainer}>
                    {/* אם זה השיר הפעיל, הצג את הנגן המלא */}
                    {isActive ? (
                        <AudioPlayer
                            track={file}
                            isPlaying={isPlaying}
                            isLoading={isLoadingAudio}
                            position={audioPosition}
                            duration={audioDuration}
                            onPlayPause={handlePlayPause}
                            onSeek={handleSeek}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                        />
                    ) : (
                        // אם זה שיר אחר, הצג רק כפתור נגן
                        <View style={styles.fileHeader}>
                            <Text style={styles.fileIcon}>🎵</Text>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName}>{file.fileName}</Text>
                            </View>
                            <TouchableOpacity onPress={() => playAudio(file)} style={styles.playButton} disabled={isLoadingAudio}>
                                <Text style={styles.playButtonText}>▶️ נגן</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {renderTasks('משימות לקובץ שמע:')}
                </View>
            );
        }
        else {
             // ... (כמו קודם) ... קוד שחזור הלינק
            return ( 
                <View style={styles.fileContainer}>
                    <TouchableOpacity style={styles.fileHeader} onPress={() => handleOpenFile(file.fileUrl)}>
                        <Text style={styles.fileIcon}>{getFileIcon(file.fileType)}</Text>
                        <View style={styles.fileInfo}>
                            <Text style={styles.fileName}>{file.fileName}</Text>
                            {file.description && <Text style={styles.fileDescription}>{file.description}</Text>}
                        </View>
                        <Text style={styles.fileLinkIcon}>🔗</Text>
                    </TouchableOpacity>
                    {renderTasks('משימות לקובץ:')}
                </View>
            );
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
            {isManager && (
              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => navigation.navigate('AdminLesson', { lesson: lesson ,classParams: classParams})}
              >
                <Text style={styles.adminButtonText}>⚙️ ניהול שיעור</Text>
              </TouchableOpacity>
            )}
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

// 10. 💡 הוספנו סטייל לכפתור הנגן החדש
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f7f6' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginBottom: 16 },
  adminButton: { backgroundColor: '#6c757d', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  adminButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  fileContainer: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' },
  fileHeader: { flexDirection: 'row-reverse', alignItems: 'center', padding: 16, backgroundColor: '#e9ecef' },
  fileIcon: { fontSize: 24, marginRight: 12 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'right' },
  fileDescription: { fontSize: 14, color: '#6c757d', textAlign: 'right', marginTop: 2 },
  fileLinkIcon: { fontSize: 18, color: '#007bff', marginLeft: 10 },
  fileTitle: { fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'right', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#e9ecef' },
  videoTitle: { fontSize: 18, fontWeight: '600', color: '#333', textAlign: 'right', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, backgroundColor: '#e9ecef' },
  imagePreview: { width: '100%', aspectRatio: 16/9, backgroundColor: '#e0e0e0' },
  pdfPreview: { height: 500, backgroundColor: '#e0e0e0', alignSelf: 'center' },
  playButton: { backgroundColor: '#007bff', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginLeft: 10, minWidth: 80, alignItems: 'center' },
  playButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  tasksList: { padding: 16, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  tasksHeader: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 10, textAlign: 'right' },
  taskItem: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  taskTitle: { fontSize: 16, color: '#333', flex: 1, marginRight: 10, textAlign: 'right' },
  taskCheckbox: { width: 24, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#007bff', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  taskCheckboxCompleted: { backgroundColor: '#007bff' },
  taskCheckmark: { color: '#ffffff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 40 }
});
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
import { getAllFiles, getTasks, updateTask, markTaskCompleted } from '../../utils/api';
import YoutubeIframe from 'react-native-youtube-iframe';
import Pdf from 'react-native-pdf';
import { Audio } from 'expo-audio';

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


export default function LessonPageScreen({ navigation, route }) {
    const [filesWithTasks, setFilesWithTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [isManager, setIsManager] = useState(false);
    
    // 2. State חדש לאודיו ושגיאות
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loadingAudio, setLoadingAudio] = useState(false);
    const [failedFileIds, setFailedFileIds] = useState(new Set());

    const { lesson, class: classParams } = route.params;

    const setupScreen = useCallback(async () => {
        try {
            setLoading(true);
            const userIdPromise = AsyncStorage.getItem('userId');
            const filesPromise = getAllFiles(lesson._id);

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
        return unsubscribe;
    }, [navigation, setupScreen]);

    // 3. ניקוי נגן האודיו ביציאה מהמסך
    useEffect(() => {
        return sound
            ? () => {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);


    const handleOpenFile = async (url) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Alert.alert('שגיאה', `לא ניתן לפתוח את הקישור: ${url}`);
        }
    };

    const handleToggleTaskCompletion = useCallback(async (task) => {
        if (!userId) return;
        const isCompleted = task.completedBy.includes(userId);

        if (!isCompleted) {
            try {
                await markTaskCompleted(task._id);
                let updatedCompletedBy = [...task.completedBy, userId];
                setFilesWithTasks(currentData =>
                    currentData.map(fileItem => ({
                        ...fileItem,
                        tasks: fileItem.tasks.map(t =>
                            t._id === task._id ? { ...t, completedBy: updatedCompletedBy } : t
                        )
                    }))
                );
            } catch (error) {
                console.error('שגיאה בסימון משימה:', error);
                Alert.alert('שגיאה', 'לא ניתן היה לסמן את המשימה כבוצעה.');
            }
        } else {
             Alert.alert("מידע", "ביטול סימון משימה עדיין לא נתמך.");
        }
    }, [userId]);
    
    // 4. פונקציית אודיו חדשה
    const playAudio = async (url) => {
        setLoadingAudio(true);
        try {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                if (sound) {
                    await sound.playAsync();
                    setIsPlaying(true);
                } else {
                    const { sound: newSound } = await Audio.Sound.createAsync(
                       { uri: url },
                       { shouldPlay: true }
                    );
                    newSound.setOnPlaybackStatusUpdate((status) => {
                        if (status.didJustFinish) {
                            setIsPlaying(false);
                        }
                    });
                    setSound(newSound);
                    setIsPlaying(true);
                }
            }
        } catch (e) {
            console.log(`cannot play the sound file`, e);
            Alert.alert('שגיאה', 'לא ניתן לנגן את קובץ השמע.');
            setFailedFileIds(prev => new Set(prev).add(url)); // הוספת ID ייחודי (ה-URL)
        } finally {
            setLoadingAudio(false);
        }
    };
    
    const renderTaskItem = ({ item: task }) => { /* ... (ללא שינוי) ... */ };

    // 5. פונקציית רינדור מעודכנת
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

        const renderFallbackLink = () => (
             <View style={styles.fileContainer}>
                <TouchableOpacity style={styles.fileHeader} onPress={() => handleOpenFile(file.fileUrl)}>
                    <Text style={styles.fileIcon}>{getFileIcon(file.fileType)}</Text>
                    <View style={styles.fileInfo}>
                        <Text style={styles.fileName}>{file.fileName}</Text>
                        <Text style={styles.fileDescription}>הקובץ לא נטען. לחץ לפתיחה בדפדפן.</Text>
                    </View>
                    <Text style={styles.fileLinkIcon}>🔗</Text>
                </TouchableOpacity>
                {renderTasks('משימות לקובץ:')}
            </View>
        );

        if (failedFileIds.has(file._id)) {
            return renderFallbackLink();
        }

        if (videoId) {
            return (
                <View style={styles.fileContainer}>
                    <Text style={styles.videoTitle}>{file.fileName}</Text>
                    <YoutubeIframe
                        height={230}
                        videoId={videoId}
                        onChangeState={event => console.log('Video State:', event)}
                        onError={() => setFailedFileIds(prev => new Set(prev).add(file._id))}
                        webViewStyle={{ opacity: 0.99 }}
                    />
                    {renderTasks('משימות לסרטון:')}
                </View>
            );
        } else if (file.fileType === 'image') {
            return (
                <View style={styles.fileContainer}>
                    <Text style={styles.fileTitle}>{file.fileName}</Text>
                    <Image
                      source={{ uri: file.fileUrl }}
                      style={styles.imagePreview}
                      resizeMode="contain"
                      onError={() => setFailedFileIds(prev => new Set(prev).add(file._id))}
                    />
                    {renderTasks('משימות לתמונה:')}
                </View>
            );
        } else if (file.fileType === 'pdf') {
            const pdfSource = { uri: file.fileUrl, cache: true };
            return (
                <View style={styles.fileContainer}>
                     <Text style={styles.fileTitle}>{file.fileName}</Text>
                     <Pdf
                        trustAllCerts={false}
                        source={pdfSource}
                        onLoadComplete={(numberOfPages,filePath) => {
                            console.log(`מספר עמודים: ${numberOfPages}`);
                        }}
                        onError={() => setFailedFileIds(prev => new Set(prev).add(file._id))}
                        style={[styles.pdfPreview, {width: screenWidth - 32 }]}
                        />
                     {renderTasks('משימות ל-PDF:')}
                </View>
            );
        } else if (file.fileType === 'audio') {
            return (
                <View style={styles.fileContainer}>
                    <View style={styles.fileHeader}>
                        <Text style={styles.fileIcon}>{getFileIcon(file.fileType)}</Text>
                        <View style={styles.fileInfo}>
                            <Text style={styles.fileName}>{file.fileName}</Text>
                            {file.description && <Text style={styles.fileDescription}>{file.description}</Text>}
                        </View>
                        <TouchableOpacity onPress={() => playAudio(file.fileUrl)} style={styles.playButton} disabled={loadingAudio}>
                             <Text style={styles.playButtonText}>
                                {loadingAudio ? 'טוען...' : (isPlaying ? '⏸️ השהה' : '▶️ נגן')}
                             </Text>
                        </TouchableOpacity>
                    </View>
                    {renderTasks('משימות לקובץ שמע:')}
                </View>
            );
        }
        else {
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

// 6. הסטיילים נשארים כמעט זהים (רק עדכון כפתור הנגינה)
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
    playButton: {
        backgroundColor: '#007bff',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginLeft: 10,
        minWidth: 80, // רוחב מינימלי לכפתור
        alignItems: 'center',
    },
    playButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
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
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView // שימוש ב-ScrollView כדי לאפשר גלילה של כל התוכן
} from 'react-native';
import { getAllFiles, getTasks, deleteTask } from '../../utils/api'; 

// פונקציית אייקון קובץ (כמו קודם)
const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image': return '🖼️';
    case 'video': return '▶️';
    case 'audio': return '🎵';
    case 'pdf': return '📄';
    case 'doc': return '📝';
    default: return '📁';
  }
};

export default function ManageTasksScreen({ navigation, route }) {
  const { lessonId ,classParams} = route.params;
  const [filesWithTasks, setFilesWithTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const filesResponse = await getAllFiles(lessonId);
      const files = filesResponse.data;
      
      const filesAndTasksPromises = files.map(async (file) => {
        try {
          const tasksResponse = await getTasks(file._id);
          return { file, tasks: tasksResponse.data };
        } catch (taskError) {
          console.error(`שגיאה בטעינת משימות עבור קובץ ${file._id}:`, taskError);
          return { file, tasks: [] };
        }
      });
      
      const combinedData = await Promise.all(filesAndTasksPromises);
      setFilesWithTasks(combinedData);

    } catch (err) {
      console.error('❌ שגיאה בטעינת נתונים:', err.message);
      Alert.alert('שגיאה', 'לא ניתן לטעון את נתוני השיעור.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    // טעינה ראשונית ורענון בעת חזרה למסך
    const unsubscribe = navigation.addListener('focus', fetchData);
    fetchData();
    return unsubscribe;
  }, [navigation, fetchData]);

  const handleDeleteTask = (task) => {
    Alert.alert(
      "מחיקת משימה",
      `האם למחוק את המשימה "${task.title}"?`,
      [
        { text: "ביטול", style: "cancel" },
        { 
          text: "מחק", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteTask(task._id);
              // רענון הנתונים מהשרת לאחר מחיקה
              fetchData(); 
            } catch (error) {
              console.error("שגיאה במחיקת משימה:", error);
              Alert.alert("שגיאה", "לא ניתן היה למחוק את המשימה.");
            }
          } 
        }
      ]
    );
  };

  // פונקציית רינדור למשימה עם כפתורי ניהול
  const renderTaskItem = (task, fileId) => (
    <View key={task._id} style={styles.taskItem}>
       <Text style={styles.taskTitle}>{task.title}</Text>
       <View style={styles.actionButtons}>
          <TouchableOpacity 
             style={styles.iconButton}
             onPress={() => navigation.navigate('EditTask', { task: task, classParams: classParams })}
          >
             <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
             style={[styles.iconButton, styles.deleteButton]}
             onPress={() => handleDeleteTask(task)}
          >
             <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
       </View>
    </View>
  );

  // פונקציית רינדור לקובץ + המשימות שלו + כפתור הוספת משימה
  const renderFileSection = (item) => (
    <View style={styles.fileSectionCard} key={item.file._id}>
        <View style={styles.fileHeader}>
            <Text style={styles.fileIcon}>{getFileIcon(item.file.fileType)}</Text>
            <Text style={styles.fileName}>{item.file.fileName}</Text>
        </View>

        {item.tasks.length > 0 ? (
            item.tasks.map(task => renderTaskItem(task, item.file._id))
        ) : (
            <Text style={styles.noTasksText}>אין משימות לקובץ זה</Text>
        )}
        
        {/* כפתור הוספת משימה לקובץ זה */}
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => navigation.navigate('AddTask', { fileId: item.file._id, classParams: classParams })}
        >
          <Text style={styles.addTaskButtonText}>➕ הוסף משימה לקובץ זה</Text>
        </TouchableOpacity>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ניהול משימות</Text>
      
      {filesWithTasks.length > 0 ? (
          filesWithTasks.map(renderFileSection)
      ) : (
          <Text style={styles.emptyText}>אין קבצים בשיעור זה להוספת משימות</Text>
      )}
    </ScrollView>
  );
}

// סטיילים מותאמים
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f4f7f6' },
    title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#333' },
    loader: { flex: 1, justifyContent: 'center' },
    fileSectionCard: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, overflow: 'hidden' },
    fileHeader: { flexDirection: 'row-reverse', alignItems: 'center', padding: 16, backgroundColor: '#e9ecef' },
    fileIcon: { fontSize: 20, marginRight: 10 },
    fileName: { fontSize: 17, fontWeight: '600', color: '#333', textAlign: 'right' },
    noTasksText: { fontSize: 15, color: '#888', textAlign: 'center', padding: 16 },
    taskItem: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    taskTitle: { fontSize: 16, color: '#333', flex: 1, marginRight: 10, textAlign: 'right' },
    actionButtons: { flexDirection: 'row', gap: 10, marginLeft: 10 },
    iconButton: { padding: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
    deleteButton: { backgroundColor: '#ffebee' },
    iconText: { fontSize: 18 },
    addTaskButton: { backgroundColor: '#e7f3ff', padding: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#d0e0ff' },
    addTaskButtonText: { color: '#0056b3', fontSize: 15, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 40 },
});
import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { getAllFiles, deleteFile } from '../../utils/api'; 

const getFileIcon = (fileType) => { /* ... פונקציה כמו קודם ... */ };

export default function ManageFilesScreen({ navigation, route }) {
  const { lessonId } = route.params;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllFiles(lessonId);
      setFiles(response.data);
    } catch (error) {
      console.error("שגיאה בטעינת קבצים:", error);
      Alert.alert("שגיאה", "לא ניתן לטעון את רשימת הקבצים.");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    // טעינה ראשונית ורענון בעת חזרה למסך
    const unsubscribe = navigation.addListener('focus', fetchFiles);
    fetchFiles();
    return unsubscribe;
  }, [navigation, fetchFiles]);

  const handleDeleteFile = (file) => {
    Alert.alert(
      "מחיקת קובץ",
      `האם למחוק את הקובץ "${file.fileName}"?`,
      [
        { text: "ביטול", style: "cancel" },
        { 
          text: "מחק", 
          style: "destructive", 
          onPress: async () => {
            try {
              await deleteFile(file._id);
              setFiles(currentFiles => currentFiles.filter(f => f._id !== file._id));
            } catch (error) {
              console.error("שגיאה במחיקת קובץ:", error);
              Alert.alert("שגיאה", "לא ניתן היה למחוק את הקובץ.");
            }
          } 
        }
      ]
    );
  };

  const renderFileItem = ({ item }) => (
    <View style={styles.card}>
       <Text style={styles.fileIcon}>{getFileIcon(item.fileType)}</Text>
       <View style={styles.fileInfo}>
          <Text style={styles.fileName}>{item.fileName}</Text>
          {item.description && <Text style={styles.fileDescription}>{item.description}</Text>}
       </View>
       <View style={styles.actionButtons}>
          <TouchableOpacity 
             style={styles.iconButton}
             onPress={() => navigation.navigate('EditFile', { file: item })}
          >
             <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity 
             style={[styles.iconButton, styles.deleteButton]}
             onPress={() => handleDeleteFile(item)}
          >
             <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
       </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ניהול קבצים</Text>
      <FlatList
        data={files}
        keyExtractor={(item) => item._id}
        renderItem={renderFileItem}
        ListEmptyComponent={<Text style={styles.emptyText}>אין קבצים בשיעור זה</Text>}
      />
    </View>
  );
}

// סטיילים דומים למסכי רשימות קודמים
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f4f7f6' },
    title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#333' },
    loader: { flex: 1, justifyContent: 'center' },
    card: { backgroundColor: '#ffffff', borderRadius: 12, marginBottom: 12, flexDirection: 'row-reverse', alignItems: 'center', padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    fileIcon: { fontSize: 24, marginRight: 12 },
    fileInfo: { flex: 1 },
    fileName: { fontSize: 17, fontWeight: '600', color: '#333', textAlign: 'right' },
    fileDescription: { fontSize: 14, color: '#6c757d', textAlign: 'right', marginTop: 2 },
    actionButtons: { flexDirection: 'row', gap: 10, marginLeft: 10 },
    iconButton: { padding: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
    deleteButton: { backgroundColor: '#ffebee' }, // רקע אדמדם למחיקה
    iconText: { fontSize: 18 },
    emptyText: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 40 },
});
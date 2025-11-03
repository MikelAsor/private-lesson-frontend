import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  FlatList, // 1. ייבוא
  ScrollView 
} from 'react-native';
// 2. ייבוא getUsers
import { updateTask, getUsers } from '../../utils/api'; 

export default function EditTaskScreen({ navigation, route }) {
  const { task, classParams } = route.params; // 3. קבלת classParams
  const [title, setTitle] = useState(task.title);
  const [loading, setLoading] = useState(false);
  const [usersInClass, setUsersInClass] = useState([]); // 4. משתמשי כיתה
  // 5. אתחול עם המשתמשים המשויכים כרגע
  const [selectedUserIds, setSelectedUserIds] = useState(task.assignedTo || []); 
  const [usersLoading, setUsersLoading] = useState(true);

  // 6. useEffect לטעינת משתמשים
  useEffect(() => {
    const fetchClassUsers = async () => {
      try {
        const memberIds = classParams.members || [];
        if (memberIds.length === 0) {
          setUsersInClass([]);
          setUsersLoading(false);
          return;
        }
        const response = await getUsers();
        const allUsers = response.data;
        const filteredUsers = allUsers.filter(user => memberIds.includes(user._id));
        setUsersInClass(filteredUsers);
      } catch (error) {
        console.error("שגיאה בטעינת משתמשי כיתה:", error);
      } finally {
        setUsersLoading(false);
      }
    };
    fetchClassUsers();
  }, [classParams.members]);

  const handleUpdateTask = async () => {
    if (!title.trim()) {
      Alert.alert('שגיאה', 'יש למלא את שם המשימה.');
      return;
    }

    setLoading(true);
    try {
      const updatedData = { 
          // לא נשנה את fileId, completedBy וכו' מכאן
          title: title, 
          assignedTo: selectedUserIds // 7. עדכון השיוך
      }; 
      
      await updateTask(task._id, updatedData); 
      Alert.alert('הצלחה', 'המשימה עודכנה בהצלחה!');
      navigation.goBack(); 
    } catch (error) {
      console.error('שגיאה בעדכון משימה:', error);
      Alert.alert('שגיאה', 'לא ניתן היה לעדכן את המשימה.');
    } finally {
      setLoading(false);
    }
  };

  // 8. פונקציית בחירה (זהה לקודם)
  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  // 9. פונקציית רינדור למשתמש (זהה לקודם)
  const renderUserItem = ({ item }) => {
    const isSelected = selectedUserIds.includes(item._id);
    return (
      <TouchableOpacity 
        style={[styles.userItem, isSelected && styles.userSelected]} 
        onPress={() => toggleUserSelection(item._id)}
      >
        <Text style={styles.userText}>{item.userName || item.name}</Text>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>עריכת משימה</Text>

      <TextInput
        style={styles.input}
        placeholder="שם המשימה *"
        value={title}
        onChangeText={setTitle}
      />

      {/* 10. הצגת רשימת המשתמשים */}
      <Text style={styles.label}>שייך למשתמשים:</Text>
      {usersLoading ? (
          <ActivityIndicator />
      ) : usersInClass.length > 0 ? (
          <FlatList
              data={usersInClass}
              renderItem={renderUserItem}
              keyExtractor={(item) => item._id}
              style={styles.userList}
              scrollEnabled={false}
          />
      ) : (
          <Text style={styles.noUsersText}>אין משתמשים בכיתה לשיוך.</Text>
      )}
     
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader}/>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleUpdateTask}>
            <Text style={styles.buttonText}>שמור שינויים</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// 11. הסטיילים זהים ל-AddTaskScreen
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f7f6' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#333' },
  input: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 16, marginBottom: 20, textAlign: 'right' },
  label: { fontSize: 16, color: '#555', marginBottom: 8, textAlign: 'right'},
  userList: { marginBottom: 20, maxHeight: 200, borderColor: '#e0e0e0', borderWidth: 1, borderRadius: 12, backgroundColor: '#ffffff'},
  userItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  userSelected: { backgroundColor: '#d3e5ff' },
  userText: { fontSize: 16 },
  checkmark: { fontSize: 16, color: '#007AFF', fontWeight: 'bold' },
  noUsersText: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 }
});
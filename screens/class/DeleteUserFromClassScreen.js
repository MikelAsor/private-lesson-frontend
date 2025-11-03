import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
// ⬇️ ייבוא הפונקציה הרלוונטית למחיקת משתמש
import { getUsers, removeUserFromClass } from '../../utils/api'; 

// ⬇️ שם הקומפוננטה שונה
export default function DeleteUserFromClassScreen({ navigation, route }) { 
    const [users, setUsers] = useState([]); // זו תהיה רשימת המשתמשים בכיתה
    const [loading, setLoading] = useState(true); 
    const [selectedUsersId, setSelectedUsersId] = useState([]);
    
    const { class: classParams } = route.params; 

    useEffect(() => {
        const fetchClassMembers = async () => { // ⬅️ שם הפונקציה שונה
          try {
            // 1. קח את רשימת ה-ID של חברי הכיתה
            const memberIds = classParams.members || []; // ⬅️ שונה ל-members
            
            // 2. קח את כל המשתמשים
            const response = await getUsers();
            const allUsers = response.data;

            // 3. סנן את כל המשתמשים כדי להציג רק את מי שחבר בכיתה
            const filteredMembers = allUsers.filter(user => 
                memberIds.includes(user._id)
            );
            
            setUsers(filteredMembers); // ⬅️ שמור את חברי הכיתה בלבד
    
          } catch (err) {
            console.error('❌ שגיאה בטעינת רשימות:', err.message);
          } finally {
            setLoading(false);
          }
        };
    
        fetchClassMembers();
    }, [classParams.members]); // ⬅️ שונה ל-members

    const handleUserPress = (userId) => {
        setSelectedUsersId((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    // ⬇️ שם הפונקציה שונה
    const handleDeleteUser = async () => {
        try {
            await Promise.all(
                // ⬇️ קריאה לפונקציית ה-API הנכונה
                selectedUsersId.map((userId) => removeUserFromClass(classParams._id, userId))
            );
            navigation.goBack();
        } catch (error) {
            console.error('Error deleting users:', error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                מחק משתמשים מהכיתה
            </Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item._id} 
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleUserPress(item._id)}
                        style={[
                            styles.userItem,
                            selectedUsersId.includes(item._id) 
                                ? styles.userSelected 
                                : styles.userNotSelected
                        ]}
                    >
                        <Text style={styles.userText}>{item.userName || item.name}</Text>
                    </TouchableOpacity>
                )}
                // ⬇️ טקסט ריק שונה
                ListEmptyComponent={<Text style={styles.emptyText}>אין משתמשים בכיתה זו</Text>}
            />
            
            <Button 
                // ⬇️ טקסט כפתור שונה
                title="מחק משתמשים נבחרים" 
                onPress={handleDeleteUser} // ⬅️ קורא לפונקציה הנכונה
                disabled={selectedUsersId.length === 0}
                color="#F44336" 
            />
        </View>
    );
}

// ... הסטיילים זהים לקובץ הקודם ...
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    userItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderRadius: 8,
        marginBottom: 8
    },
    userSelected: {
        backgroundColor: '#ffebee', 
        borderColor: '#F44336',
        borderWidth: 1
    },
    userNotSelected: {
        backgroundColor: '#f8f9fa' 
    },
    userText: {
        fontSize: 18
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#666',
        marginTop: 20
    }
});
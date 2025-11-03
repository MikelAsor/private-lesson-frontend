import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button, // ⬅️ נוסף
  StyleSheet, // ⬅️ נוסף
  ActivityIndicator // ⬅️ נוסף
} from 'react-native';
import { getUsers, addUserToClass } from '../../utils/api'; // ⬅️ שם הפונקציה כבר היה תקין

// ⬅️ הייבוא הכפול של TouchableOpacity נמחק

export default function AddUserToClassScreen({ navigation, route }) { // ⬅️ נוסף route
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // ⬅️ נוסף
    const [selectedUsersId, setSelectedUsersId] = useState([]);
    
    // ⬇️ תיקון: קבלת הפרמטר מה-route
    const { class: classParams } = route.params; 

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsers();
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false); // ⬅️ נוסף
            }
        };
        fetchUsers();
    }, []);

    const handleUserPress = (userId) => {
        setSelectedUsersId((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAddUsers = async () => {
        try {
             await Promise.all(
                // ⬇️ תוקן לשימוש ב-classParams._id
                selectedUsersId.map((userId) => addUserToClass(classParams._id, userId))
            );
            navigation.goBack();
        } catch (error) {
            console.error('Error adding users to class:', error);
        }
   };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                הוסף משתמשים לכיתה
            </Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item._id} // ⬅️ תוקן
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleUserPress(item._id)}
                        style={[
                            styles.userItem,
                            // ⬇️ עיצוב הבחירה תוקן
                            selectedUsersId.includes(item._id) 
                                ? styles.userSelected 
                                : styles.userNotSelected
                        ]}
                    >
                        <Text style={styles.userText}>{item.userName }</Text>
                    </TouchableOpacity>
                )}
            />
            
            <Button 
                title="הוסף משתמשים נבחרים" 
                onPress={handleAddUsers} 
                disabled={selectedUsersId.length === 0} // ⬅️ הכפתור מבוטל אם לא נבחר כלום
            />
        </View>
    );
}

// ⬇️ הוספת סטיילים לעיצוב נקי
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
        backgroundColor: '#d3e5ff', // ⬅️ צבע כחול בהיר לבחירה
        borderColor: '#007bff',
        borderWidth: 1
    },
    userNotSelected: {
        backgroundColor: '#f8f9fa' // ⬅️ צבע אפור בהיר
    },
    userText: {
        fontSize: 18
    }
});
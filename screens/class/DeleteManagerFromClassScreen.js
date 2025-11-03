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
import { getUsers, removeManagerFromClass } from '../../utils/api'; 

// ⬇️ שם הקומפוננטה שונה
export default function DeleteManagerFromClassScreen({ navigation, route }) { 
    const [managers, setManagers] = useState([]); // זו תהיה רשימת המנהלים בכיתה
    const [loading, setLoading] = useState(true); 
    const [selectedManagersId, setSelectedManagersId] = useState([]);
    
    const { class: classParams } = route.params; 

    useEffect(() => {
        const fetchClassManagers = async () => { // ⬅️ שם הפונקציה שונה
          try {
            // 1. קח את רשימת ה-ID של חברי הכיתה
            const managerIds = classParams.managers || []; // ⬅️ שונה ל-managers
            
            // 2. קח את כל המשתמשים
            const response = await getUsers();
            const allUsers = response.data;

            // 3. סנן את כל המשתמשים כדי להציג רק את מי שחבר בכיתה
            const filteredManagers = allUsers.filter(user => 
                managerIds.includes(user._id)
            );

            setManagers(filteredManagers); // ⬅️ שמור את המנהלים בכיתה בלבד

          } catch (err) {
            console.error('❌ שגיאה בטעינת רשימות:', err.message);
          } finally {
            setLoading(false);
          }
        };

        fetchClassManagers();
    }, [classParams.managers]); // ⬅️ שונה ל-managers

    const handleManagerPress = (managerId) => {
        setSelectedManagersId((prev) =>
            prev.includes(managerId)
                ? prev.filter((id) => id !== managerId)
                : [...prev, managerId]
        );
    };

    // ⬇️ שם הפונקציה שונה
    const handleDeleteManager = async () => {
        try {
            await Promise.all(
                // ⬇️ קריאה לפונקציית ה-API הנכונה
                selectedManagersId.map((managerId) => removeManagerFromClass(classParams._id, managerId))
            );
            navigation.goBack();
        } catch (error) {
            console.error('Error deleting managers:', error);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                מחק מנהלים מהכיתה
            </Text>
            <FlatList
                data={managers}
                keyExtractor={(item) => item._id} 
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => handleManagerPress(item._id)}
                        style={[
                            styles.userItem,
                            selectedManagersId.includes(item._id) 
                                ? styles.userSelected 
                                : styles.userNotSelected
                        ]}
                    >
                        <Text style={styles.userText}>{item.userName}</Text>
                    </TouchableOpacity>
                )}
                // ⬇️ טקסט ריק שונה
                ListEmptyComponent={<Text style={styles.emptyText}>אין מנהלים בכיתה זו</Text>}
            />
            
            <Button 
                // ⬇️ טקסט כפתור שונה
                title="מחק מנהלים נבחרים" 
                onPress={handleDeleteManager} // ⬅️ קורא לפונקציה הנכונה
                disabled={selectedManagersId.length === 0}
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
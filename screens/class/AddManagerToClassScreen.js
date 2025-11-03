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
import { getUsers, addManagerToClass } from '../../utils/api'; 



export default function AddManagerToClassScreen({ navigation, route }) { 
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [selectedUsersId, setSelectedUsersId] = useState([]);

    const { class: classParams } = route.params;

    useEffect(() => {
         const fetchUsers = async () => {
           try {
                const response = await getUsers();
                setUsers(response.data);
              } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false); 
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

    const handleAddManager = async () => {
        try {
            await Promise.all(
                selectedUsersId.map((userId) => addManagerToClass(classParams._id, userId))
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
                הוסף מנהלים לכיתה
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
                        
                        <Text style={styles.userText}>{item.userName}</Text>
                    </TouchableOpacity>
                )}
            />
            <Button 
                title="הוסף מנהלים נבחרים" 
                onPress={handleAddManager} 
                disabled={selectedUsersId.length === 0} 
            />
        </View>
    );
}


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
        backgroundColor: '#d3e5ff', 
        borderColor: '#007bff',
        borderWidth: 1
    },
    userNotSelected: {
        backgroundColor: '#f8f9fa' 
    },
    userText: {
        fontSize: 18
    }
});
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
// אנו צריכים רק את getUsers כדי לסנן את רשימת החברים
import { getUsers } from '../../utils/api'; 

export default function ClassStudentsScreen({ navigation, route }) { 
    const [students, setStudents] = useState([]); // רשימת התלמידים
    const [loading, setLoading] = useState(true); 
    
    // נקבל את כל פרטי הכיתה
    const { class: classParams } = route.params; 

    useEffect(() => {
        const fetchClassMembers = async () => {
          try {
            // 1. קח את רשימת ה-ID של חברי הכיתה
            const memberIds = classParams.members || []; 
            
            // 2. קח את כל המשתמשים
            const response = await getUsers();
            const allUsers = response.data;

            // 3. סנן את כל המשתמשים כדי להציג רק את מי שחבר בכיתה
            const filteredMembers = allUsers.filter(user => 
                memberIds.includes(user._id)
            );
            
            setStudents(filteredMembers); // שמור את חברי הכיתה
    
          } catch (err) {
            console.error('❌ שגיאה בטעינת תלמידים:', err.message);
          } finally {
            setLoading(false);
          }
        };
    
        fetchClassMembers();
    }, [classParams.members]);

    // פונקציה שתטפל בלחיצה על תלמיד
    const handleStudentPress = (student) => {
      console.log('נלחץ על תלמיד:', student.userName);
      // TODO: בעתיד, נווט מכאן למסך הסטטיסטיקות
      // navigation.navigate('StudentStatsScreen', { student: student, classId: classParams._id });
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />
    }

    // פונקציית הרינדור של כל פריט
    const renderStudentItem = ({ item }) => (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => handleStudentPress(item)}
      >
        {/* אפשר להוסיף כאן תמונת פרופיל בעתיד */}
        <Text style={styles.cardText}>{item.userName}</Text>
        <Text style={styles.cardText}>{item.firstName}</Text>
        <Text style={styles.cardText}>{item.lastName}</Text>
        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                התלמידים ב-{classParams.title}
            </Text>
            <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate('ClassStats', { class: classParams })}
            >
                <Text style={styles.createButtonText}>קבלת סטטיסטיקות</Text>
            </TouchableOpacity>
            <FlatList
                data={students}
                keyExtractor={(item) => item._id} 
                renderItem={renderStudentItem}
                ListEmptyComponent={<Text style={styles.emptyText}>עדיין אין תלמידים בכיתה זו</Text>}
            />
        </View>
    );
}

// עיצוב נקי ומודרני
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
        marginBottom: 24,
        textAlign: 'center',
        color: '#333'
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    cardText: {
        fontSize: 18,
        flex: 1, // גורם לשם למלא את כל המקום
        fontWeight: '500',
        color: '#333',
        textAlign: 'right',
    },
    cardArrow: {
        fontSize: 24,
        color: '#b0b0b0', // חץ אפור
        marginLeft: 10,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 40
    },
    createButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

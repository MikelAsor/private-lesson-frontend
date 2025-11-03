import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  getLessonsForClass,
  deleteLesson, 
} from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LessonScreen({ navigation, route }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isManager, setIsManager] = useState(false);
  const { class: classParams } = route.params;
  
  useEffect(() => {
    const setupScreen = async () => {
      try {
        setLoading(true); 
        
        const lessonsPromise = getLessonsForClass(classParams._id);
        const managerCheckPromise = checkManagerStatus();
        
        const [lessonsResponse] = await Promise.all([lessonsPromise, managerCheckPromise]);
        
        setLessons(lessonsResponse.data);

      } catch (err) {
        console.error('❌ שגיאה בטעינת שיעורים:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const checkManagerStatus = async () => {
      try {
        const currentUserId = await AsyncStorage.getItem('userId'); 
        
        if (currentUserId) {
          const managers = classParams.managers || [];
          const isManaging = managers.includes(currentUserId);
          setIsManager(isManaging);
        } else {
          setIsManager(false);
        }
      } catch (e) {
        console.error("שגיאה בבדיקת הרשאת מנהל:", e);
        setIsManager(false);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      setupScreen();
    });

    setupScreen();

    return unsubscribe;
  }, [navigation, classParams]);

  const handleDeleteLesson = async (lessonId) => {
    Alert.alert('מחיקת שיעור', 'האם אתה בטוח שברצונך למחוק את השיעור?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLesson(lessonId);
            setLessons((prev) => prev.filter((lesson) => lesson._id !== lessonId));
          } catch (err) {
            console.error('❌ שגיאה במחיקה:', err.message);
          }
        },
      },
    ]);
  };

  const renderLessonItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() =>
          navigation.navigate('LessonPage', {
            lesson: item,
            class: classParams,
          })
        }>
        <Text style={styles.cardText}>{item.title}</Text>
        {item.description && (
          <Text style={styles.cardDescription}>{item.description}</Text>
        )}
      </TouchableOpacity>
      
      {isManager && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() =>
              navigation.navigate('EditLesson', {
                lessonId: item._id,
                title: item.title,
                description: item.description,
                ClassId: classParams._id,
              })
            }>
            <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => handleDeleteLesson(item._id)}
          >
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) return <ActivityIndicator size="large" style={styles.loader} />;

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>שיעורים ב: {classParams.title}</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="חיפוש שיעור..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
            
      <FlatList
        data={filteredLessons}
        keyExtractor={(item) => item._id}
        renderItem={renderLessonItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>עדיין אין שיעורים בכיתה זו</Text>}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f7f6',
  },
  loader: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'right',
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
    borderRightWidth: 4,
    borderRightColor: '#28a745',
  },
  cardText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  iconText: {
    fontSize: 18,
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
    marginBottom: 20,
  }
});
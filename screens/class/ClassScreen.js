// screens/class/ClassScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView, 
  Alert,
} from 'react-native';
import {
  getClassesForUser,
  getClassesForManager,
  getPublicClasses,   
  addUserToClass,     
} from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export default function ClassScreen({ navigation, route }) {
  const [allClasses, setAllClasses] = useState([]);
  const [publicClasses, setPublicClasses] = useState([]); 
  const [managedClassIds, setManagedClassIds] = useState(new Set());
  const [userId, setUserId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });

    const fetchData = async () => {
      try {
        setLoading(true);
     
        const currentUserId = await AsyncStorage.getItem('userId');
        setUserId(currentUserId);

       
        const managerPromise = getClassesForManager();
        const userPromise = getClassesForUser();
        const publicPromise = getPublicClasses();

        const [managerRes, userRes, publicRes] = await Promise.all([
          managerPromise,
          userPromise,
          publicPromise,
        ]);

        const managerClasses = managerRes.data;
        const userClasses = userRes.data;
        const publicClassesData = publicRes.data;

      
        const managerIds = new Set(managerClasses.map(cls => cls._id));

        const filteredUserClasses = userClasses.filter(
          (userClass) => !managerIds.has(userClass._id)
        );
        const myClasses = [...managerClasses, ...filteredUserClasses];
        setAllClasses(myClasses);
        setManagedClassIds(managerIds);
        const myClassIds = new Set(myClasses.map(cls => cls._id));
        const discoverableClasses = publicClassesData.filter(
          (publicClass) => !myClassIds.has(publicClass._id)
        );
        setPublicClasses(discoverableClasses);

      } catch (err) {
        console.error('❌ שגיאה בטעינת רשימות:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    return unsubscribe;
  }, [navigation]);

 
  const handleJoinClass = async (classToJoin) => {
    if (!userId) {
      Alert.alert('שגיאה', 'לא ניתן לזהות משתמש');
      return;
    }
    try {
      await addUserToClass(classToJoin._id, userId);
      Alert.alert('הצלחה', `הצטרפת לכיתה "${classToJoin.title}"!`);
      setPublicClasses(prev => prev.filter(cls => cls._id !== classToJoin._id));
      
      setAllClasses(prev => [...prev, classToJoin]);

    } catch (err) {
      console.error('❌ שגיאה בהצטרפות לכיתה:', err.message);
      Alert.alert('שגיאה', 'לא ניתן היה להצטרף לכיתה');
    }
  };



  
  const renderClassItem = ({ item }) => {
    const isManager = managedClassIds.has(item._id);

    return (
      <View style={[styles.card, isManager ? styles.managerCard : styles.userCard]}>
       
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() =>
            navigation.navigate('Lessons', {
              class: item,
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
                navigation.navigate('AdminClass', {
                  class: item,
                })
              }>
              <Text style={styles.iconText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  
 
  const renderPublicClassItem = ({ item }) => {
    return (
      <View style={[styles.card, styles.publicCard]}>
        <View style={{ flex: 1, paddingLeft: 10 }}>
          <Text style={styles.cardText}>{item.title}</Text>
          {item.description && ( 
            <Text style={styles.cardDescription}>{item.description}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => handleJoinClass(item)}
        >
          <Text style={styles.joinButtonText}>הצטרף</Text>
        </TouchableOpacity>
      </View>
    );
  };


  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  

  const filteredClasses = allClasses.filter((cls) =>
    cls.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPublicClasses = publicClasses.filter((cls) =>
    cls.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>הכיתות</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="חיפוש כיתה..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('AddClass')}
      >
        <Text style={styles.createButtonText}>➕ יצירת כיתה חדשה</Text>
      </TouchableOpacity>

    
      <Text style={styles.sectionTitle}>הכיתות שלי</Text>
      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item._id}
        renderItem={renderClassItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>עדיין לא הצטרפת לאף כיתה</Text>}
        scrollEnabled={false} 
      />


      <Text style={styles.sectionTitle}>גלה כיתות חדשות</Text>
      <FlatList
        data={filteredPublicClasses}
        keyExtractor={(item) => item._id}
        renderItem={renderPublicClassItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>לא נמצאו כיתות ציבוריות חדשות</Text>}
        scrollEnabled={false}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f7f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 22, 
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
    marginTop: 20, 
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 4,
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
  managerCard: {
    borderRightWidth: 4,
    borderRightColor: '#007AFF',
  },
  userCard: {
    borderRightWidth: 4,
    borderRightColor: '#6c757d',
  },
  publicCard: {
    borderRightWidth: 4,
    borderRightColor: '#28a745', 
    justifyContent: 'space-between', 
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
  joinButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
    marginBottom: 20,
  }
});
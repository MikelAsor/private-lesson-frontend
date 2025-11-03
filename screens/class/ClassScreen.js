import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  getClassesForUser,
  getClassesForManager,
} from '../../utils/api';

export default function ClassScreen({ navigation, route }) {
  const [allClasses, setAllClasses] = useState([]);
  const [managedClassIds, setManagedClassIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchRoleAndClasses();
    });

    const fetchRoleAndClasses = async () => {
      try {
        const manager = (await getClassesForManager()).data;
        const user = (await getClassesForUser()).data;
        
        const filteredUser = user.filter(
          (userClass) => !manager.some((managedClass) => managedClass._id === userClass._id)
        );
        
        setAllClasses([...manager, ...filteredUser]);
        
        setManagedClassIds(new Set(manager.map(cls => cls._id)));

      } catch (err) {
        console.error('❌ שגיאה בטעינת רשימות:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndClasses();
    
    return unsubscribe;
  }, [navigation]);
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
  


  if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
  
  const filteredClasses = allClasses.filter((cls) =>
    cls.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>הכיתות שלי</Text>
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

      <FlatList
        data={filteredClasses}
        keyExtractor={(item) => item._id}
        renderItem={renderClassItem}
        ListEmptyComponent={<Text style={styles.emptyListText}>לא נמצאו כיתות</Text>}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}

// ⬇️ --- הוספנו סטייל חדש --- ⬇️
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
    fontSize: 20,
    fontWeight: '600',
    color: '#555',
    marginBottom: 12,
    marginTop: 16,
    textAlign: 'right',
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
  cardText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  // הסטייל החדש לתיאור
  cardDescription: {
    fontSize: 14,
    color: '#6c757d', // צבע אפור
    textAlign: 'right',
    marginTop: 4, // רווח קטן מהכותרת
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
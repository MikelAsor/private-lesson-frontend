import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert 
} from 'react-native';
import { deleteClass } from '../../utils/api'; 

export default function ClassAdminScreen({ navigation, route }) { 
  const { class: classParams } = route.params;
  
  const handleDeleteClass = async () => {
    Alert.alert(
      'מחיקת כיתה', 
      `האם אתה בטוח שברצונך למחוק את הכיתה "${classParams.title}"?`, 
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClass(classParams._id);
              navigation.navigate('Classes'); 
            } catch (err) {
              console.error('❌ שגיאה במחיקה:', err.message);
              Alert.alert('שגיאה', 'לא ניתן היה למחוק את הכיתה.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}> 
      <Text style={styles.title}>ניהול כיתה: {classParams.title}</Text>
      
      <View style={styles.gridContainer}>

        <TouchableOpacity 
          style={[styles.card, styles.studentsCard]} 
          onPress={() => navigation.navigate('ClassStudents', { class: classParams })}
        >
          <Text style={styles.cardIcon}>👨‍🎓</Text>
          <Text style={styles.cardText}>צפייה בתלמידים</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.lessonCard]}
          onPress={() => navigation.navigate('AddLesson', { 
            classId: classParams._id 
          })}
        >
          <Text style={styles.cardIcon}>📚</Text>
          <Text style={styles.cardText}>הוספת שיעור חדש</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.editCard]} 
          onPress={() => navigation.navigate('EditClass', { 
            classId: classParams._id,
            currentTitle: classParams.title,
            description: classParams.description
          })}
        >
          <Text style={styles.cardIcon}>✏️</Text>
          <Text style={styles.cardText}>עריכת פרטי כיתה</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, styles.deleteCard]}
          onPress={handleDeleteClass}
        >
          <Text style={styles.cardIcon}>🗑️</Text>
          <Text style={styles.cardText}>מחיקת כיתה</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.addCard]} 
          onPress={() => navigation.navigate('AddManager', { class: classParams })}
        >
          <Text style={styles.cardIcon}>➕</Text>
          <Text style={styles.cardText}>הוספת מנהל</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.removeCard]} 
          onPress={() => navigation.navigate('DeleteManager', { class: classParams })}
        >
          <Text style={styles.cardIcon}>➖</Text>
          <Text style={styles.cardText}>מחיקת מנהל</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.addCard]} 
          onPress={() => navigation.navigate('AddStudent', { class: classParams })}
        >
          <Text style={styles.cardIcon}>➕</Text>
          <Text style={styles.cardText}>הוספת תלמיד</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.removeCard]} 
          onPress={() => navigation.navigate('DeleteStudent', { class: classParams })}
        >
          <Text style={styles.cardIcon}>➖</Text>
          <Text style={styles.cardText}>מחיקת תלמיד</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: '#f4f7f6' 
  },
  title: {
    fontSize: 26, // גודל כמו במסך שיעורים
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333'
  },
  gridContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
  },
  card: {
    width: '48%', 
    backgroundColor: '#ffffff', 
    padding: 20,
    borderRadius: 12, // רדיוס כמו בכרטיסים האחרים
    marginBottom: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 150, 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3, // צל כמו בכרטיסים האחרים
  },
  studentsCard: {
    borderColor: '#17a2b8', 
    borderWidth: 1,
  },
  editCard: {
    borderColor: '#FFC107', 
    borderWidth: 1,
  },
  deleteCard: {
    borderColor: '#F44336', 
    borderWidth: 2, 
    backgroundColor: '#fff8f8' 
  },
  lessonCard: {
    borderColor: '#2196F3', 
    borderWidth: 1,
  },
  addCard: {
    borderColor: '#4CAF50', 
    borderWidth: 1,
  },
  removeCard: {
    borderColor: '#F44336', 
    borderWidth: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16, // גודל כמו בכרטיסים בדף הניהול הקודם
    fontWeight: '600', 
    color: '#333',
    textAlign: 'center',
  },
});
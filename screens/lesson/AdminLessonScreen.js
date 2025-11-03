import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Alert 
} from 'react-native';
// ייבא פונקציות API רלוונטיות בעתיד

export default function AdminLessonScreen({ navigation, route }) { 
  const { lesson } = route.params;
  const classParams = route.params.classParams; // מקבלים את פרטי השיעור
  
  // פונקציות לטיפול בלחיצות (ימולאו בהמשך)
  const handleAddFile = () => {
    navigation.navigate('AddFile', { lessonId: lesson._id }); 
  };

  const handleManageFiles = () => {
    // נווט למסך שמציג רשימת קבצים עם אפשרויות עריכה/מחיקה
    navigation.navigate('ManageFiles', { lessonId: lesson._id }); 
  };

  const handleManageTasks = () => {
    // נווט למסך שמציג קבצים, ואז משימות עם אפשרויות עריכה/מחיקה
    navigation.navigate('ManageTasks', { lessonId: lesson._id,classParams: classParams }); 
  };

  const handleAssignTasks = () => {
    // מסך מורכב יותר, אולי נתחיל עם ניהול כללי
    Alert.alert("בקרוב", "אפשרות לשיוך משימות למשתמשים תתווסף בהמשך");
  };


  return (
    <ScrollView style={styles.container}> 
      <Text style={styles.title}>ניהול שיעור: {lesson.title}</Text>
      
      <View style={styles.gridContainer}>

        {/* --- הוספת קובץ --- */}
        <TouchableOpacity 
          style={[styles.card, styles.addCard]} 
          onPress={handleAddFile}
        >
          <Text style={styles.cardIcon}>➕📄</Text>
          <Text style={styles.cardText}>הוספת קובץ חדש</Text>
        </TouchableOpacity>

        {/* --- ניהול קבצים קיימים --- */}
        <TouchableOpacity 
          style={[styles.card, styles.editCard]} 
          onPress={handleManageFiles}
        >
          <Text style={styles.cardIcon}>✏️📄</Text>
          <Text style={styles.cardText}>עריכה/מחיקת קבצים</Text>
        </TouchableOpacity>


        {/* --- ניהול משימות --- */}
        <TouchableOpacity 
          style={[styles.card, styles.editCard]} 
          onPress={handleManageTasks}
        >
          <Text style={styles.cardIcon}>✏️✅</Text>
          <Text style={styles.cardText}>ניהול משימות</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.card, styles.statsCard]} // סטייל חדש
          onPress={() => navigation.navigate('LessonStats', { 
              lesson: lesson, 
              classParams: classParams 
          })}
        >
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardText}>סטטיסטיקות שיעור</Text>
        </TouchableOpacity>


      </View>
    </ScrollView>
  );
}

// סטיילים דומים למסך ניהול כיתה
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: '#f4f7f6' 
  },
  title: {
    fontSize: 26,
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
    borderRadius: 12, 
    marginBottom: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: 150, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  addCard: {
    borderColor: '#4CAF50', 
    borderWidth: 1,
  },
  editCard: {
    borderColor: '#FFC107', 
    borderWidth: 1,
  },
  assignCard: {
    borderColor: '#17a2b8',
    borderWidth: 1,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600', 
    color: '#333',
    textAlign: 'center',
  },
});
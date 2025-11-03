import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
// נצטרך לייבא פונקציות API רבות
import { getUsers, getLessonsForClass, getAllFiles, getTasks } from '../../utils/api'; 

export default function ClassStatsScreen({ navigation, route }) { 
    const { class: classParams } = route.params; 
    
    const [students, setStudents] = useState([]); // רשימת תלמידים בכיתה
    const [tasksData, setTasksData] = useState([]); // רשימה מאורגנת של כל המשימות בכיתה
    const [loading, setLoading] = useState(true); 

    // פונקציה מורכבת לשליפת כל הנתונים הנדרשים
    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            const memberIds = classParams.members || [];
            
            // 1. קבלת פרטי התלמידים
            const usersResponse = await getUsers();
            const allUsers = usersResponse.data;
            const classStudents = allUsers.filter(user => memberIds.includes(user._id));
            setStudents(classStudents);

            // 2. קבלת כל השיעורים בכיתה
            const lessonsResponse = await getLessonsForClass(classParams._id);
            const lessons = lessonsResponse.data;
            
            // 3. קבלת כל הקבצים מכל השיעורים
            const filesPromises = lessons.map(lesson => getAllFiles(lesson._id));
            const filesResponses = await Promise.all(filesPromises);
            const allFiles = filesResponses.flatMap(res => res.data); // מערך שטוח של כל הקבצים

            // 4. קבלת כל המשימות מכל הקבצים
            const tasksPromises = allFiles.map(file => getTasks(file._id));
            const tasksResponses = await Promise.all(tasksPromises);
            const allTasks = tasksResponses.flatMap(res => res.data); // מערך שטוח של כל המשימות בכיתה
            
            // שמירת המשימות ב-state (נארגן אותן אח"כ ב-JSX)
            setTasksData(allTasks);

        } catch (err) {
            console.error('❌ שגיאה בטעינת נתוני סטטיסטיקה:', err.message);
            // אפשר להוסיף Alert
        } finally {
            setLoading(false);
        }
    }, [classParams]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // פונקציית רינדור למשימה בתוך הכרטיס של התלמיד
    const renderTaskStatItem = (task, studentId) => {
        const isCompleted = task.completedBy?.includes(studentId);
        return (
            <View key={task._id} style={styles.taskItem}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={[styles.taskStatus, isCompleted ? styles.completed : styles.notCompleted]}>
                    {isCompleted ? '✓ בוצע' : '✗ לא בוצע'}
                </Text>
            </View>
        );
    };

    // פונקציית רינדור לכרטיס של כל תלמיד
    const renderStudentStats = ({ item: student }) => {
        // סינון המשימות הרלוונטיות לתלמיד זה
        const relevantTasks = tasksData.filter(task => 
            !task.assignedTo || 
            task.assignedTo.length === 0 || 
            task.assignedTo.includes(student._id)
        );

        return (
            <View style={styles.studentCard}>
                <Text style={styles.studentName}>{student.userName || student.name}</Text>
                {relevantTasks.length > 0 ? (
                    relevantTasks.map(task => renderTaskStatItem(task, student._id))
                ) : (
                    <Text style={styles.noTasksText}>אין משימות משויכות לתלמיד זה</Text>
                )}
            </View>
        );
    };


    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>סטטיסטיקות כיתה: {classParams.title}</Text>
            
            {students.length > 0 ? (
                <FlatList
                    data={students}
                    renderItem={renderStudentStats}
                    keyExtractor={(student) => student._id}
                    scrollEnabled={false} // מכיוון שה-ScrollView החיצוני גולל
                />
            ) : (
                <Text style={styles.emptyText}>אין תלמידים בכיתה להצגת סטטיסטיקה</Text>
            )}
        </ScrollView>
    );
}

// סטיילים
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
        textAlign: 'center',
        marginBottom: 24,
        color: '#333'
    },
    studentCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    studentName: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'right',
        marginBottom: 10,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        color: '#007AFF' // צבע שם התלמיד
    },
    taskItem: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    taskTitle: {
        fontSize: 15,
        color: '#333',
        flex: 1, // לתת לטקסט להתפרס
        marginRight: 8,
        textAlign: 'right',
    },
    taskStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    completed: {
        color: '#28a745', // ירוק
    },
    notCompleted: {
        color: '#dc3545', // אדום
    },
    noTasksText: {
        fontSize: 14,
        color: '#888',
        textAlign: 'center',
        paddingVertical: 10,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 40
    }
});
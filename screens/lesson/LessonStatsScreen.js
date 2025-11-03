import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView 
} from 'react-native';
// נצטרך פחות פונקציות API הפעם
import { getUsers, getAllFiles, getTasks } from '../../utils/api'; 

export default function LessonStatsScreen({ navigation, route }) { 
    // קבלת פרטי השיעור והכיתה
    const { lesson, classParams } = route.params; 
    
    const [students, setStudents] = useState([]); 
    const [tasksData, setTasksData] = useState([]); 
    const [loading, setLoading] = useState(true); 

    const fetchLessonData = useCallback(async () => {
        try {
            setLoading(true);
            const memberIds = classParams.members || [];
            
            // 1. קבלת פרטי התלמידים בכיתה
            const usersResponse = await getUsers();
            const allUsers = usersResponse.data;
            const classStudents = allUsers.filter(user => memberIds.includes(user._id));
            setStudents(classStudents);

            // 2. קבלת כל הקבצים *רק* מהשיעור הנוכחי
            const filesResponse = await getAllFiles(lesson._id); 
            const lessonFiles = filesResponse.data;

            // 3. קבלת כל המשימות *רק* מהקבצים של השיעור
            const tasksPromises = lessonFiles.map(file => getTasks(file._id));
            const tasksResponses = await Promise.all(tasksPromises);
            const lessonTasks = tasksResponses.flatMap(res => res.data); 
            
            setTasksData(lessonTasks); // שמירת המשימות של השיעור

        } catch (err) {
            console.error('❌ שגיאה בטעינת נתוני סטטיסטיקת שיעור:', err.message);
        } finally {
            setLoading(false);
        }
    }, [lesson._id, classParams.members]);

    useEffect(() => {
        fetchLessonData();
    }, [fetchLessonData]);

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

    const renderStudentStats = ({ item: student }) => {
        // סינון המשימות הרלוונטיות לתלמיד זה (מתוך המשימות של השיעור)
        const relevantTasks = tasksData.filter(task => 
            !task.assignedTo || 
            task.assignedTo.length === 0 || 
            task.assignedTo.includes(student._id)
        );

        const completedTasksCount = relevantTasks.filter(task => 
            task.completedBy?.includes(student._id)
        ).length;

        const totalRelevantTasks = relevantTasks.length;
        const completionPercentage = totalRelevantTasks > 0 
            ? Math.round((completedTasksCount / totalRelevantTasks) * 100) 
            : 0; 

        return (
            <View style={styles.studentCard}>
                <View style={styles.studentHeader}>
                    <Text style={styles.studentName}>{student.userName || student.name}</Text>
                    <Text style={styles.percentageText}>
                        {completionPercentage}% ({completedTasksCount}/{totalRelevantTasks})
                    </Text>
                </View>
                {totalRelevantTasks > 0 ? (
                    // הצג רק את המשימות הרלוונטיות לתלמיד
                    relevantTasks.map(task => renderTaskStatItem(task, student._id)) 
                ) : (
                    <Text style={styles.noTasksText}>אין משימות משויכות לתלמיד זה בשיעור</Text>
                )}
            </View>
        );
    };


    if (loading) {
        return <ActivityIndicator size="large" style={styles.loader} />
    }

    return (
        <ScrollView style={styles.container}>
            {/* כותרת מותאמת לשיעור */}
            <Text style={styles.title}>סטטיסטיקות שיעור: {lesson.title}</Text> 
            <Text style={styles.subtitle}>כיתה: {classParams.title}</Text> 
            
            {students.length > 0 ? (
                <FlatList
                    data={students}
                    renderItem={renderStudentStats}
                    keyExtractor={(student) => student._id}
                    scrollEnabled={false} 
                />
            ) : (
                <Text style={styles.emptyText}>אין תלמידים בכיתה להצגת סטטיסטיקה</Text>
            )}
        </ScrollView>
    );
}

// סטיילים (זהים ל-ClassStatsScreen, הוספתי רק subtitle)
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
        color: '#333'
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 24,
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
    studentHeader: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    studentName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#007AFF' 
    },
    percentageText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
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
        flex: 1, 
        marginRight: 8,
        textAlign: 'right',
    },
    taskStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    completed: {
        color: '#28a745', 
    },
    notCompleted: {
        color: '#dc3545', 
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
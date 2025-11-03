// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';

// 🔑 מסכי התחברות ורישום
import LoginScreen from './screens/user/LoginScreen';
import RegisterScreen from './screens/user/RegisterScreen';

// 📋 class
import ClassScreen from './screens/class/ClassScreen';
import AddClassScreen from './screens/class/AddClassScreen';
import EditClassScreen from './screens/class/EditClassScreen';
import AdminClassScreen from './screens/class/AdminClassScreen';
import AddManagerToClassScreen from './screens/class/AddManagerToClassScreen';
import DeleteManagerFromClassScreen from './screens/class/DeleteManagerFromClassScreen';
import AddUserToClassScreen from './screens/class/AddUserToClassScreen';
import DeleteUserFromClassScreen from './screens/class/DeleteUserFromClassScreen';
import ClassStudentsScreen from './screens/class/ClassStudentsScreen';
import ClassStatsScreen from './screens/class/ClassStatsScreen';
//lessons
import LessonScreen from './screens/lesson/LessonScreen';
import AddLessonScreen from './screens/lesson/AddLessonScreen';
import EditLessonScreen from './screens/lesson/EditLessonScreen';
import LessonPageScreen from './screens/lesson/lessonPageScreen';
import AdminLessonScreen from './screens/lesson/AdminLessonScreen';
import LessonStatsScreen from './screens/lesson/LessonStatsScreen';
// קבצים
import ManageFilesScreen from './screens/file/ManageFilesScreen';
import AddFileScreen from './screens/file/AddFileScreen';
import EditFileScreen from './screens/file/EditFileScreen';
// 📁 רשימות ומשימות
import ManageTasksScreen from './screens/task/ManageTasksScreen';
import AddTaskScreen from './screens/task/AddTaskScreen';
import EditTaskScreen from './screens/task/EditTaskScreen';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* 🔐 התחברות ורישום */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'התחברות' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'רישום' }}
        />
        {/* 🏫 כיתות */}
        <Stack.Screen
          name="Classes"
          component={ClassScreen}
          options={{ title: 'כיתות' }}
        />
        <Stack.Screen
          name="AddClass"
          component={AddClassScreen}
          options={{ title: 'הוספת כיתה' }}
        />
        <Stack.Screen
          name="EditClass"
          component={EditClassScreen}
          options={{ title: 'עריכת כיתה' }}
        />
        <Stack.Screen
          name="AdminClass"
          component={AdminClassScreen}
          options={{ title: 'ניהול כיתה' }}
        />
        <Stack.Screen
          name="AddManager"
          component={AddManagerToClassScreen}
          options={{ title: 'הוספת מנהל לכיתה' }}
        />
        <Stack.Screen
          name="DeleteManager"
          component={DeleteManagerFromClassScreen}
          options={{ title: 'מחיקת מנהל מהכיתה' }}
        />
        <Stack.Screen
          name="AddStudent"
          component={AddUserToClassScreen}
          options={{ title: 'הוספת תלמיד לכיתה' }}
        />
        <Stack.Screen
          name="DeleteStudent"
          component={DeleteUserFromClassScreen}
          options={{ title: 'מחיקת תלמיד מהכיתה' }}
        />
        <Stack.Screen
          name="ClassStudents"
          component={ClassStudentsScreen}
          options={{ title: 'תלמידי הכיתה' }}
        />
        <Stack.Screen
          name="ClassStats"
          component={ClassStatsScreen}
          options={{ title: 'סטטיסטיקות כיתה' }}
        />
        {/* שיעור */}
        <Stack.Screen
          name="Lessons"
          component={LessonScreen}
          options={{ title: 'שיעורים' }}
        />
        <Stack.Screen
          name="AddLesson"
          component={AddLessonScreen}
          options={{ title: 'הוספת שיעור' }}
        />
        <Stack.Screen
          name="EditLesson"
          component={EditLessonScreen}
          options={{ title: 'עריכת שיעור' }}
        />
        <Stack.Screen
          name="LessonPage"
          component={LessonPageScreen}
          options={{ title: 'פרטי שיעור' }}
        />
        <Stack.Screen
          name="AdminLesson"
          component={AdminLessonScreen}
          options={{ title: 'ניהול שיעור' }}
        />
        <Stack.Screen
          name="LessonStats"
          component={LessonStatsScreen}
          options={{ title: 'סטטיסטיקות שיעור' }}
        />
       {/* קבצים */}
        <Stack.Screen
            name="ManageFiles"
            component={ManageFilesScreen}
            options={{ title: 'ניהול קבצים' }}
        />
        <Stack.Screen
            name="AddFile"
            component={AddFileScreen}
            options={{ title: 'הוספת קובץ' }}
        />
        <Stack.Screen
            name="EditFile"
            component={EditFileScreen}
            options={{ title: 'עריכת קובץ' }}
        />
        {/* משימות */}
        <Stack.Screen
            name="ManageTasks"
            component={ManageTasksScreen}
            options={{ title: 'ניהול משימות' }}
        />
        <Stack.Screen
            name="AddTask"
            component={AddTaskScreen}
            options={{ title: 'הוספת משימה' }}
        />
        <Stack.Screen
            name="EditTask"
            component={EditTaskScreen}
            options={{ title: 'עריכת משימה' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
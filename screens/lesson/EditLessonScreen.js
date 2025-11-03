// screens/EditLessonScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import {  updateLesson } from '../../utils/api';
import { useRoute } from '@react-navigation/native';

export default function EditLessonScreen({  navigation ,route }) {
 
  const { lessonId, title, description ,classId} = route.params;   
  const [newTitle, setNewTitle] = useState(title);
  const [desc, setDesc] = useState(description);
  const handleUpdate = async () => {
    if (!newTitle.trim()) {
      Alert.alert('יש להזין שם כיתה');
      return;
    }
    try {
      await updateLesson(lessonId, { ClassId: classId, title: newTitle, description: desc });
      navigation.goBack();
    } catch (err) {
      console.error('שגיאה בעדכון שיעור:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>עריכת השיעור:</Text>
      <TextInput
        style={styles.input}
        value={newTitle}
        onChangeText={setNewTitle}
        placeholder="שם השיעור"
      />
      <TextInput
        style={styles.input}
        value={desc}
        onChangeText={setDesc}
        placeholder="תיאור השיעור"
      />
      <Button title="שמור שינויים" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
});
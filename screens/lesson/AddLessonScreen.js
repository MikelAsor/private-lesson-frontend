// screens/AddListScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { createLesson } from '../../utils/api';

export default function AddLessonScreen({ navigation, route }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const ClassId = route.params.class._id;

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('נא להזין שם שיעור');
      return;
    }

    try {
      await createLesson({ title, description, ClassId });
      navigation.goBack(); 
    } catch (err) {
      console.error('❌ שגיאה בהוספת השיעור:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>שם השיעור:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="לדוגמה: מתמטיקה"
      />
      <Text style={styles.label}>תיאור השיעור:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="לדוגמה: שיעור מספר 1"
      />
      <Button title="שמור שיעור" onPress={handleSubmit} />
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
// screens/AddListScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { createClass } from '../../utils/api';

export default function AddClassScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('נא להזין שם כיתה');
      return;
    }

    try {
      await createClass({ title, description });
      navigation.goBack(); 
    } catch (err) {
      console.error('❌ שגיאה בהוספת רשימה:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>שם הכיתה:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="לדוגמה: מתמטיקה"
      />
      <Text style={styles.label}>תיאור הכיתה:</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="לדוגמה: שיעורי מתמטיקה לכיתה ח'"
      />
      <Button title="שמור כיתה" onPress={handleSubmit} />
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
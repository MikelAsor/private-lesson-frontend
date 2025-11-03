// screens/EditListScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { updateClass } from '../../utils/api';
import { useRoute } from '@react-navigation/native';

export default function EditClassScreen({  navigation }) {
    const route = useRoute();
  const { classId, currentTitle, description } = route.params;   
  const [title, setTitle] = useState(currentTitle);
  const [desc, setDesc] = useState(description);

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('יש להזין שם כיתה');
      return;
    }
    try {
      await updateClass(classId, { title, description: desc });
      navigation.goBack();
    } catch (err) {
      console.error('שגיאה בעדכון כיתה:', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>עריכת כיתה:</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="שם הכיתה"
      />
      <TextInput
        style={styles.input}
        value={desc}
        onChangeText={setDesc}
        placeholder="תיאור הכיתה"
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
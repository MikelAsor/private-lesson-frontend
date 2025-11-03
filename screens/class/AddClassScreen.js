// screens/class/AddClassScreen.js
import React, { useState } from 'react';
import { 
    View, 
    TextInput, 
    Button, 
    Text, 
    StyleSheet, 
    Alert,
    Switch 
} from 'react-native';
import { createClass } from '../../utils/api';

export default function AddClassScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false); 

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('נא להזין שם כיתה');
      return;
    }

    try {
      await createClass({ 
          title, 
          description, 
          isPublic 
      });
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
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>כיתה ציבורית? (כל אחד יוכל לראות)</Text>
        <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isPublic ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={setIsPublic} 
            value={isPublic} 
        />
      </View>

      <Button title="שמור כיתה" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  label: { fontSize: 18, marginBottom: 12, textAlign: 'right' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'right', 
  },
 
  switchContainer: {
    flexDirection: 'row-reverse', 
    alignItems: 'center',
    justifyContent: 'space-between', 
    marginBottom: 24,
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1, 
    marginRight: 10, 
    textAlign: 'right',
  },
});
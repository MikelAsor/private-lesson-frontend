import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity, // הוספנו
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView 
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // רכיב לבחירת סוג קובץ
import { uploadFile } from '../../utils/api'; // הפונקציה להעלאת קובץ

export default function AddFileScreen({ navigation, route }) {
  const { lessonId } = route.params; // ID של השיעור אליו נוסיף קובץ

  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [fileType, setFileType] = useState('doc'); // ערך ברירת מחדל
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddFile = async () => {
    if (!fileName.trim() || !fileUrl.trim()) {
      Alert.alert('שגיאה', 'יש למלא שם קובץ וקישור.');
      return;
    }

    // ולידציה בסיסית של URL (אפשר לשפר)
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
       Alert.alert('שגיאה', 'הקישור חייב להתחיל ב-http:// או https://');
       return;
    }

    setLoading(true);
    try {
      const fileData = {
        fileName,
        fileUrl,
        fileType,
        lessonId,
        description,
      };
      await uploadFile(fileData);
      Alert.alert('הצלחה', 'הקובץ נוסף בהצלחה!');
      navigation.goBack(); // חזרה למסך הקודם (ניהול שיעור)
    } catch (error) {
      console.error('שגיאה בהוספת קובץ:', error);
      Alert.alert('שגיאה', 'לא ניתן היה להוסיף את הקובץ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>הוספת קובץ חדש</Text>

      <TextInput
        style={styles.input}
        placeholder="שם הקובץ *"
        value={fileName}
        onChangeText={setFileName}
      />
      <TextInput
        style={styles.input}
        placeholder="קישור (URL) לקובץ *"
        value={fileUrl}
        onChangeText={setFileUrl}
        keyboardType="url" // מקלדת מתאימה ל-URL
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, styles.textArea]} // סטייל לשדה תיאור
        placeholder="תיאור (אופציונלי)"
        value={description}
        onChangeText={setDescription}
        multiline // מאפשר מספר שורות
      />

      <Text style={styles.label}>בחר סוג קובץ:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={fileType}
          style={styles.picker}
          onValueChange={(itemValue) => setFileType(itemValue)}
        >
          <Picker.Item label="מסמך (doc)" value="doc" />
          <Picker.Item label="PDF" value="pdf" />
          <Picker.Item label="תמונה (image)" value="image" />
          <Picker.Item label="וידאו (video)" value="video" />
          <Picker.Item label="שמע (audio)" value="audio" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleAddFile}>
            <Text style={styles.buttonText}>הוסף קובץ</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4f7f6',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100, // גובה מינימלי לתיאור
    textAlignVertical: 'top', // התחלת טקסט מלמעלה
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    textAlign: 'right',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    overflow: 'hidden', // חשוב לפינות ב-Android
  },
  picker: {
    // הסטייל כאן מינימלי כי Picker מתנהג שונה בפלטפורמות
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
      marginTop: 20,
  }
});

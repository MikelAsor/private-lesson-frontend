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
import { Picker } from '@react-native-picker/picker';
import { updateFile } from '../../utils/api';

export default function EditFileScreen({ navigation, route }) {
  const { file } = route.params; // הקובץ המלא לעריכה

  // אתחול ה-state עם הערכים הנוכחיים של הקובץ
  const [fileName, setFileName] = useState(file.fileName);
  const [fileUrl, setFileUrl] = useState(file.fileUrl);
  const [fileType, setFileType] = useState(file.fileType);
  const [description, setDescription] = useState(file.description || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateFile = async () => {
    if (!fileName.trim() || !fileUrl.trim()) {
      Alert.alert('שגיאה', 'יש למלא שם קובץ וקישור.');
      return;
    }
     if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
       Alert.alert('שגיאה', 'הקישור חייב להתחיל ב-http:// או https://');
       return;
    }

    setLoading(true);
    try {
      const updatedData = {
        fileName,
        fileUrl,
        fileType,
        description,
        lessonId: file.lessonId // חשוב לשלוח גם את lessonId
      };
      await updateFile(file._id, updatedData); // שלח ID ונתונים מעודכנים
      Alert.alert('הצלחה', 'הקובץ עודכן בהצלחה!');
      navigation.goBack(); // חזרה לרשימת הקבצים
    } catch (error) {
      console.error('שגיאה בעדכון קובץ:', error);
      Alert.alert('שגיאה', 'לא ניתן היה לעדכן את הקובץ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>עריכת קובץ</Text>

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
        keyboardType="url"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="תיאור (אופציונלי)"
        value={description}
        onChangeText={setDescription}
        multiline
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
        <ActivityIndicator size="large" style={styles.loader}/>
      ) : (
         <TouchableOpacity style={styles.button} onPress={handleUpdateFile}>
            <Text style={styles.buttonText}>שמור שינויים</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// סטיילים זהים ל-AddFileScreen
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f7f6' },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, color: '#333' },
  input: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', fontSize: 16, marginBottom: 16, textAlign: 'right' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  label: { fontSize: 16, color: '#555', marginBottom: 8, textAlign: 'right' },
  pickerContainer: { backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', marginBottom: 20, overflow: 'hidden' },
  picker: {},
  button: { backgroundColor: '#007AFF', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 }
});
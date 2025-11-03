import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { register } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const userData = {
        firstName,
        lastName,
        email,
        password,
        userName,
        phoneNumber
      };
  
  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !userName || !phoneNumber) {
      Alert.alert('נא למלא את כל השדות');
      return;
    }

    try {
      setLoading(true);
      
      
      const res = await register(userData);
      const { user } = res.data;

      Alert.alert('נרשמת בהצלחה!', 'אנא התחבר כעת');
      navigation.replace('Login');
    } catch (err) {
      Alert.alert('שגיאה ברישום', err.message );
      console.log(userData)
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>רישום משתמש חדש</Text>

      <TextInput
        style={styles.input}
        placeholder="שם פרטי"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="שם משפחה"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="אימייל"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="שם משתמש"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="מספר טלפון"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="סיסמה"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="רישום" onPress={handleRegister} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  label: { fontSize: 16, marginTop: 12 },
  picker: {
    borderWidth: 1,
    borderColor: '#cccccc',
    marginBottom: 20,
  },
});
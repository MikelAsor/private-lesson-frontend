import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { login } from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('נא להזין כתובת אימייל וסיסמה');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      Alert.alert('התחברת בהצלחה!');
      const { token, user } = res.data;
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userId', user._id);
      navigation.replace('Classes');
      
    } catch (err) {
      Alert.alert('שגיאה בהתחברות', 'פרטי התחברות שגויים');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>התחברות</Text>

      <TextInput
        style={styles.input}
        placeholder="כתובת אימייל"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="סיסמה (לפחות 8 תווים)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="התחבר" onPress={handleLogin} />
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>אין לך חשבון? הירשם כאן</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007aff',
    fontSize: 16,
  },
});
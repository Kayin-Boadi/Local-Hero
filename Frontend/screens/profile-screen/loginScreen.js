import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import { router } from 'expo-router';

export default function LoginScreen() {
  const { login, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState(null);
  const [passShow, setPassShow] = useState(false);

  const handleLogin = async () => {
    try {
      setError(null);
      await login(email, password);
      router.replace('/profile'); 
    } catch {
      setError('Login failed');
    }
  };

  const handleSignUp = async () => {
    try {
      setError(null);
      await signUp(email, password, username, 'https://i.imgur.com/N6fJJKB.png'); // avatarUrl empty for MVP
      router.replace('/profile'); 
    } catch {
      setError('Signup failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Image
          source={require('../../assets/images/AnimeBibleLogo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>{isSigningUp ? 'Sign Up' : 'Log In'}</Text>

        {isSigningUp && (
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passShow}
            style={styles.input}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setPassShow((v) => !v)}
            style={{ position: 'absolute', right: 12, top: 14 }}
          >
            <Text style={{ color: '#888', fontSize: 16 }}>
              {passShow ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <Text style={{ color: 'red', marginBottom: 10, marginTop: 10 }}>
            {error}
          </Text>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={isSigningUp ? handleSignUp : handleLogin}
        >
          <Text style={styles.buttonText}>{isSigningUp ? 'Sign Up' : 'Log In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsSigningUp((v) => !v)}
          style={{ marginTop: 10 }}
        >
          <Text style={{ color: '#007AFF', fontWeight: '600' }}>
            {isSigningUp
              ? 'Already have an account? Log In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#111827',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  button: {
    width: '100%',
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f9fafb',
    fontSize: 16,
    fontWeight: '600',
  },
};

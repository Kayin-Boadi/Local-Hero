// screens/CreateQuestScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '../../utils/authContext';
import api from '../../utils/api';

export default function CreateQuestScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [difficulties, setDifficulties] = useState('');

  const handleSubmit = async () => {
    if (!title || !categories || !user?.id) {
      return Alert.alert('Missing Info', 'Title and categories are required.');
    }

    try {
      await api.post('/api/quests', {
        title,
        description,
        categories,
        difficulties: difficulties.split(',').map(s => s.trim()),
        requesterId: user.id,
      });

      Alert.alert('Success', 'Quest created!');
      router.back();
    } catch (err) {
      console.error('Create quest error', err);
      Alert.alert('Error', 'Failed to create quest.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Create New Quest</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Categories (e.g. Environment)" value={categories} onChangeText={setCategories} />
      <TextInput style={styles.input} placeholder="Difficulties (comma separated)" value={difficulties} onChangeText={setDifficulties} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit Quest</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    padding: 12, marginBottom: 12
  },
  button: {
    backgroundColor: '#111827', padding: 14, borderRadius: 10, alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});

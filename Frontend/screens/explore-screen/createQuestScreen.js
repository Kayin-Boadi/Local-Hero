import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, Switch, ScrollView
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../../utils/authContext';
import api from '../../utils/api';
import { router } from 'expo-router';

const CATEGORY_TAGS = ['strength', 'intelligence', 'agility', 'endurance'];

const DIFFICULTY_OPTIONS = {
  strength: ['light', 'medium', 'heavy'],
  intelligence: ['easy', 'moderate', 'hard'],
  agility: ['small', 'medium', 'large'],
  endurance: ['short', 'medium', 'long'],
};


export default function CreateQuestScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [toggles, setToggles] = useState({
    photo_required: false,
    repeatable: false,
    availability: false,
  });
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to create quests.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = loc.coords;

      setLocation({
        latitude: parseFloat(latitude.toFixed(3)),
        longitude: parseFloat(longitude.toFixed(3)),
      });
    })();
  }, []);

  const handleSubmit = async () => {
    if (!title || !category || !user?.id || !location) {
      return Alert.alert('Missing Info', 'All fields and location are required.');
    }

    try {
      await api.post('/api/quests/create', {
        title,
        description,
        categories: [category],
        difficulties: { [category]: difficulty },
        requesterId: user.id,
        latitude: location.latitude,
        longitude: location.longitude,
        ...toggles,
      });

      Alert.alert('Success', 'Quest created!');
      router.back();
    } catch (err) {
      console.error('Create quest error', err);
      Alert.alert('Error', 'Failed to create quest.');
    }
  };
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.heading}>Create New Quest</Text>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.tagContainer}>
          {CATEGORY_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => {
                setCategory(tag);
                setDifficulty('');
              }}
              style={[
                styles.tag,
                category === tag && styles.tagSelected
              ]}
            >
              <Text style={{ color: category === tag ? '#fff' : '#333' }}>{capitalize(tag)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {category ? (
          <>
            <Text style={styles.label}>Difficulty ({category})</Text>
            <View style={styles.tagContainer}>
              {DIFFICULTY_OPTIONS[category].map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setDifficulty(tag)}
                  style={[
                    styles.tag,
                    difficulty === tag && styles.tagSelected
                  ]}
                >
                  <Text style={{ color: difficulty === tag ? '#fff' : '#333' }}>{capitalize(tag)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        {/* Toggles */}
        {[
          { label: 'Photo Required', key: 'photo_required' },
          { label: 'Repeatable Quest', key: 'repeatable' },
          { label: 'Available Immediately', key: 'availability' },
        ].map(({ label, key }) => (
          <View style={styles.toggleRow} key={key}>
            <Text style={styles.toggleLabel}>{label}</Text>
            <Switch
              value={toggles[key]}
              onValueChange={(val) => setToggles({ ...toggles, [key]: val })}
            />
          </View>
        ))}

        {/* Map Preview */}
        <Text style={styles.label}>Approximate Location</Text>
        <View style={styles.mapContainer}>
          {location && (
            <MapView
              style={{ flex: 1 }}
              region={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker coordinate={location} />
            </MapView>
          )}
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Quest</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 10,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  tagSelected: {
    backgroundColor: '#4CAF50',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 15,
  },
  mapContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
};

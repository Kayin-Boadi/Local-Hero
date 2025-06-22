import React, { useState, useEffect } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, Pressable, Alert, StyleSheet,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../../utils/api';

export default function PendingQuestScreen({ quest, onComplete }) {
  const [region, setRegion] = useState(null);

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (e) {
        console.warn('Failed to get location', e);
      }
    };
    getUserLocation();
  }, []);

  const withdrawFromQuest = async () => {
    try {
      const res = await api.post('/api/quests/withdraw', {
        heroId: quest.heroId,     // or quest.heroId or user.id if you still have it
        questId: quest.quests.id, // keep your quest id access here
      });

      if (res.data.success) {
        Alert.alert('Withdrawn', 'You have withdrawn from the quest.');
        onComplete();  // tell ExploreScreen to clear pendingQuest and show normal UI
      } else {
        Alert.alert('Error', res.data.error || 'Failed to withdraw.');
      }
    } catch (err) {
      console.error('Withdraw error', err);
      Alert.alert('Error', 'An error occurred.');
    }
  };

  if (!quest || !region) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text>Loading quest...</Text>
      </SafeAreaView>
    );
  }

  const difficulty = (() => {
    try {
      const parsed = typeof quest.difficulty === 'string' ? JSON.parse(quest.difficulty) : quest.difficulty;
      return Object.values(parsed || {}).map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
    } catch {
      return 'Unknown';
    }
  })();

  const category = (quest.category || []).map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(', ');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.card}>
          <Text style={styles.title}>{quest.title}</Text>
          <Text style={styles.status}>Status: {quest.status}</Text>
          <Text style={styles.meta}>Category: {category || 'Misc'}</Text>
          <Text style={styles.meta}>Difficulty: {difficulty}</Text>
          <Text style={styles.description}>{quest.description}</Text>

          <Pressable onPress={withdrawFromQuest} style={styles.withdrawButton}>
            <Text style={styles.withdrawText}>Withdraw from Quest</Text>
          </Pressable>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Marker
              coordinate={{ latitude: region.latitude, longitude: region.longitude }}
              title={quest.title}
            />
          </MapView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    marginTop: 12,
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
  },
  withdrawButton: {
    marginTop: 18,
    backgroundColor: '#FF5C5C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 250,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

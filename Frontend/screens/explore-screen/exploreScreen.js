import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../utils/authContext';
import api from '../../utils/api';
import { router } from 'expo-router';
import PendingQuestScreen from './pendingQuestScreen';

const { height } = Dimensions.get('window');

export default function ExploreScreen() {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [pendingQuest, setPendingQuest] = useState(null);
  const [region, setRegion] = useState({
    latitude: 43.6532,
    longitude: -79.3832,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const { user } = useAuth();
  const mapRef = useRef(null);

  useEffect(() => {
    const initializeMap = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    };

    initializeMap();
  }, []);

  const reverseGeocode = async (lat, lng) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      return results?.[0]?.city || 'Unknown City';
    } catch {
      return 'Unknown City';
    }
  };


  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const res = await api.get('/api/quests/open');
        const questData = res.data.data || [];
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        const parsed = questData.map((q) => {
          return {
            _id: q.id,
            title: q.title,
            username: q.username || 'Unknown',
            description: q.description,
            category: q.category?.map(capitalize).join(', ') || 'Misc',
            difficulty: (() => {
              try {
                const parsed = typeof q.difficulty === 'string' ? JSON.parse(q.difficulty) : q.difficulty;
                // parsed is an object like { intelligence: "hard" }
                const values = Object.values(parsed || {});
                // Take all values, capitalize them, join by comma (in case multiple)
                return values.map(v => v.charAt(0).toUpperCase() + v.slice(1)).join(', ');
              } catch (e) {
                return 'Unknown';
              }
            })(),
            latitude: q.latitude,
            longitude: q.longitude,
          };
        });

        setQuests(parsed);
      } catch (err) {
        console.error('Failed to load quests', err);
      }
    };

    fetchQuests();
  }, []);

  useEffect(() => {
    const checkPendingQuest = async () => {
      if (!user?.id) return;
      try {
        const res = await api.get(`/api/quests/pending/hero/${user.id}`);
        setPendingQuest(res.data.data);
      } catch (err) {
        console.error(err, err.response?.data || err.message || err);
      }
    };

    checkPendingQuest();
  }, [user]);

  const panToQuest = async (quest) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: quest.latitude,
        longitude: quest.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }

    const city = await reverseGeocode(quest.latitude, quest.longitude);
    setSelectedQuest({ ...quest, city });
  };

  const offerHelp = async (questId) => {
    try {
      if (!user?.id) {
        return;
      }

      const res = await api.post('api/quests/offer', {
        heroId: user.id,
        questId,
      });

      if (res.data.success) {
        setSelectedQuest(null);
      } else {

      }
    } catch (err) {
      console.error('Offer error', err);
      console.error('Offer error', err.response?.data || err.message || err);

    }
  };


  useEffect(() => {
    if (!user) {
      router.replace('/profile');
    } 
  }, [user]);

  if (pendingQuest) {
    return <PendingQuestScreen quest={pendingQuest} onComplete={() => setPendingQuest(null)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity
            onPress={() => router.push('/routes/exploreRoute/createQuest')}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: 10,
              backgroundColor: '#fff',
              borderRadius: 24,
              padding: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 5,
            }}
            >
            <Ionicons name="add" size={28} color="#111" />
        </TouchableOpacity>

        <MapView ref={mapRef} style={styles.map} region={region}>
          {quests.map((quest) => (
            <Marker
              key={quest._id}
              coordinate={{ latitude: quest.latitude, longitude: quest.longitude }}
              title={quest.title}
              description={quest.category}
              onCalloutPress={() => panToQuest(quest)}
              onPress={() => panToQuest(quest)}
            />
          ))}
        </MapView>

        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Task List</Text>
          <FlatList
            data={quests}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => panToQuest(item)}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>

      {/* Modal Prompt */}
      <Modal
        visible={!!selectedQuest}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedQuest(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{selectedQuest?.title}</Text>
            <Text style={styles.modalSub}>Posted by: {selectedQuest?.username}</Text>
            <Text style={styles.modalCategory}>Category: {selectedQuest?.category}</Text>
            <Text style={styles.modalCategory}>Difficulty: {selectedQuest?.difficulty}</Text>
            <Text style={styles.modalText}>Approx. Location: {selectedQuest?.city}</Text>
            <Text style={styles.modalText}>{selectedQuest?.description}</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => offerHelp(selectedQuest._id)}
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setSelectedQuest(null)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  map: {
    height: height * 0.45,
    width: '100%',
  },
  feedContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  cardCategory: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalCategory: {
    fontSize: 16,
    color: '#777',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

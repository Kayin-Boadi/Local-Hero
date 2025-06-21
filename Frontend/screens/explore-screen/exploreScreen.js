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
import api from '../../utils/api';

const { height } = Dimensions.get('window');

export default function ExploreScreen() {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [region, setRegion] = useState({
    latitude: 43.6532,
    longitude: -79.3832,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const mapRef = useRef(null);

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        // const res = await api.get('/api/tasks');
        // const data = res.data;
        const data = [
          {
            _id: '1',
            title: 'Clean the community park',
            category: 'Environment',
            latitude: 43.6542,
            longitude: -79.3802,
          },
          {
            _id: '2',
            title: 'Distribute flyers for fundraiser',
            category: 'Event',
            latitude: 43.6522,
            longitude: -79.3872,
          },
          {
            _id: '3',
            title: 'Grocery run for elderly',
            category: 'Errand',
            latitude: 43.6515,
            longitude: -79.382,
          },
        ];
        setQuests(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchQuests();
  }, []);

  const panToQuest = (quest) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: quest.latitude,
          longitude: quest.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
    setSelectedQuest(quest);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
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
            <Text style={styles.modalCategory}>{selectedQuest?.category}</Text>
            <Text style={styles.modalText}>
              Approx. Location: {selectedQuest?.latitude.toFixed(4)}, {selectedQuest?.longitude.toFixed(4)}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => {
                  // accept quest logic here
                  setSelectedQuest(null);
                }}
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

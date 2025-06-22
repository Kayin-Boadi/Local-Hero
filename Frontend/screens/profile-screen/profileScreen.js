import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../utils/authContext';
import ProgressBar from 'react-native-progress/Bar'; // make sure to install this or substitute your progress bar
import LoginScreen from './loginScreen'; // your login form component
import api from '../../utils/api.js';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [postedJobs, setPostedJobs] = useState([]);

  const fetchPostedJobs = async () => {
    try {
      const res = await api.get(`/api/quests/posted/${user.id}`);
      const allJobs = res.data.data || [];
      const activeJobs = allJobs.filter(job => job.status !== 'completed');
      setPostedJobs(activeJobs);
    } catch (err) {
      console.error('Error fetching posted jobs:', err.message);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPostedJobs();
    }
  }, [user?.id]);

  const handleConfirmJob = async (jobId) => {
    try {
      Alert.alert('Confirm Job', `Mark job ${jobId} as completed?`, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const res = await api.post('/api/quests/complete', {
              questId: jobId,
              heroId: user.id, // or use assigned_hero_id if this is the requester
            });

            if (res.data.success) {
              Alert.alert('Quest marked as complete');
              // Refresh the job list
              fetchPostedJobs(); // Make sure this function is in scope
            } else {
              Alert.alert('Error', res.data.error || 'Failed to complete quest');
            }
          },
        },
      ]);
    } catch (err) {
      console.error('Error completing quest:', err.message);
      Alert.alert('Error', 'Something went wrong.');
    }
  };



  const handleDenyJob = (jobId) => {
    Alert.alert('Deny Completion', `Mark job ${jobId} as incomplete?`);
    // TODO: Call API to deny completion  
  };

  if (!user) {
     return <LoginScreen />;
  }

  const data = [
    { type: 'profile' },
    { type: 'section', title: 'Your Posted Jobs' },
    ...postedJobs.map(job => ({ type: 'job', ...job })),
    { type: 'section', title: 'Account Settings' },
    { type: 'settings' },
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'profile') {
      return (
        <View style={styles.profileContainer}>
          <Image source={{ uri: user.profilePic || 'https://i.imgur.com/N6fJJKB.png' }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Level {user.level}</Text>
            </View>
            <ProgressBar
              progress={user.xp / 100}
              width={null}
              height={12}
              borderRadius={8}
              color="#4CAF50"
              unfilledColor="#eee"
              borderWidth={0}
              style={styles.progressBar}
            />
          </View>
        </View>
      );
    }

    if (item.type === 'section') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }

    if (item.type === 'job') {
      return (
        <View style={styles.jobCard}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text>Status: {item.status}</Text>
          {item.status === 'pending' && (
            <View style={styles.jobActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirmJob(item.id)}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.denyButton} onPress={() => handleDenyJob(item.id)}>
                <Text style={styles.buttonText}>Deny</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    if (item.type === 'settings') {
      return (
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingsButton} onPress={logout}>
            <Text style={styles.settingsButtonText}>Logout</Text>
          </TouchableOpacity>
          {/* Add more account settings buttons here */}
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item, index) => `${item.type}-${item.id || index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  levelBadgeText: {
    color: '#222',
    fontWeight: '700',
    fontSize: 14,
  },
  progressBar: {
    marginTop: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  jobCard: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  jobActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  denyButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  settingsContainer: {
    marginTop: 12,
  },
  settingsButton: {
    backgroundColor: '#555',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingsButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

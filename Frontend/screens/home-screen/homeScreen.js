import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import { useAuth } from '../../utils/authContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuth();

  const [completedTasks, setCompletedTasks] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);

  useEffect(() => {
    setCompletedTasks([
      { id: '1', title: 'Cleaned up river trail' },
      { id: '2', title: 'Helped build donation stand' },
    ]);

    setUrgentTasks([
      { id: 'u1', title: 'Setup for food bank event' },
      { id: 'u2', title: 'Last-minute help for shelter drive' },
    ]);
  }, []);

  const combinedList = [
    { type: 'profile' },
    { type: 'section', title: 'Completed Tasks' },
    ...completedTasks.map((task) => ({ ...task, type: 'completed' })),
    { type: 'section', title: 'Urgent Tasks' },
    ...urgentTasks.map((task) => ({ ...task, type: 'urgent' })),
  ];

  if (!user) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>
    </SafeAreaView>
  );
}


  const renderItem = ({ item }) => {
    if (item.type === 'profile') {
      return (
        <View style={styles.profileContainer}>
          <Image source={{ uri: user?.avatar_url || 'https://i.imgur.com/N6fJJKB.png' }} style={styles.avatar} />
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

    if (item.type === 'completed') {
      return (
        <View style={styles.card}>
          <Text style={styles.cardText}>{item.title}</Text>
        </View>
      );
    }

    if (item.type === 'urgent') {
      return (
        <View style={styles.urgentCard}>
          <Text style={styles.urgentText}>{item.title}</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/AnimeBibleLogo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Local Hero</Text>
        </View>
      </View>

      {/* Content */}
      <FlatList
        data={combinedList}
        keyExtractor={(item, index) => item.id || item.title || `section-${index}`}
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
  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e2e2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 60, // add extra space near the bottom
    marginTop: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  avatar: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: (width * 0.3) / 2,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  level: {
    fontSize: 17,
    color: '#555',
    marginBottom: 8,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFD700', // Gold-style background
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
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 15,
    color: '#333',
  },
  urgentCard: {
    backgroundColor: '#ffe6e6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  urgentText: {
    color: '#b22222',
    fontWeight: '600',
    fontSize: 15,
  },
});


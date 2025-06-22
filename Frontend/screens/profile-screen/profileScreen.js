import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../utils/authContext';
import LoginScreen from './loginScreen'; // your login form component

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  // If no user logged in, show the login screen
  if (!user) {
    return <LoginScreen />;
  }

  // Otherwise show profile info
  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profilePic || 'https://i.imgur.com/N6fJJKB.png' }} style={styles.avatar} />
      <Text style={styles.username}>{user.username}</Text>
      <Text style={styles.level}>Level {user.level}</Text>

      {/* Add more profile details here as you like */}

      <Button title="Logout" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
  },
  level: {
    fontSize: 18,
    marginTop: 8,
    color: '#555',
  },
});

import React from 'react';
import { Stack } from 'expo-router';
import PendingQuestScreen from '../../../screens/explore-screen/pendingQuestScreen';

export default function CreateQuestPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Current Quest',
          headerBackTitle: 'Back',
        }}
      />
      <PendingQuestScreen />
    </>
  );
}

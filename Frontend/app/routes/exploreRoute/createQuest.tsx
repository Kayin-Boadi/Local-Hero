import React from 'react';
import { Stack } from 'expo-router';
import CreateQuestScreen from '../../../screens/explore-screen/createQuestScreen';

export default function CreateQuestPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Quest',
          headerBackTitle: 'Back',
        }}
      />
      <CreateQuestScreen />
    </>
  );
}

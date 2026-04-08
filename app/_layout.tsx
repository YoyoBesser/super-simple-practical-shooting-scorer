import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#111' },
          headerTintColor: '#fff',
          contentStyle: { backgroundColor: '#1a1a1a' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Stages' }} />
        <Stack.Screen name="stage/new" options={{ title: 'New Stage' }} />
        <Stack.Screen name="stage/[id]" options={{ title: 'Score Entry' }} />
      </Stack>
    </>
  )
}

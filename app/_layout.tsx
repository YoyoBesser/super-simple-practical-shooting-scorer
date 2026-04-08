import { useEffect } from 'react'
import { Platform } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return
    // Match app background so zooming out shows dark borders, not white
    document.documentElement.style.backgroundColor = '#1a1a1a'
    document.body.style.backgroundColor = '#1a1a1a'
    // position:fixed prevents the browser auto-scrolling to a focused input,
    // which causes the layout to "jump" on mobile when the keyboard appears
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
    // Tighten viewport: prevent pinch-zoom, fill notched screens
    const vp = document.querySelector('meta[name="viewport"]')
    if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
    // Prevent pinch-zoom on iOS WebKit via gesture events
    const preventZoom = (e: Event) => e.preventDefault()
    document.addEventListener('gesturestart', preventZoom)
    return () => document.removeEventListener('gesturestart', preventZoom)
  }, [])

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

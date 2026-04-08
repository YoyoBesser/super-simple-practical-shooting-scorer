import { useState, useRef } from 'react'
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../../store/useStore'

export default function NewStageScreen() {
  const router = useRouter()
  const addStage = useStore((s) => s.addStage)
  const [name, setName] = useState('')
  const [numTargets, setNumTargets] = useState('')
  const [shotsPerTarget, setShotsPerTarget] = useState('2')
  const targetsRef = useRef<TextInput>(null)
  const shotsRef = useRef<TextInput>(null)

  function handleCreate() {
    const trimmed = name.trim()
    const targets = parseInt(numTargets, 10)
    const shots = parseInt(shotsPerTarget, 10)
    if (!trimmed || isNaN(targets) || targets < 1 || isNaN(shots) || shots < 1) return
    const id = addStage(trimmed, targets, shots)
    router.replace(`/stage/${id}`)
  }

  const valid =
    name.trim().length > 0 &&
    parseInt(numTargets, 10) >= 1 &&
    parseInt(shotsPerTarget, 10) >= 1

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={s.form}>
        <Text style={s.label}>Stage Name</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Stage 1 — El Presidente"
          placeholderTextColor="#555"
          value={name}
          onChangeText={setName}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={() => targetsRef.current?.focus()}
        />

        <Text style={[s.label, { marginTop: 20 }]}>Number of Targets</Text>
        <TextInput
          ref={targetsRef}
          style={s.input}
          placeholder="e.g. 6"
          placeholderTextColor="#555"
          value={numTargets}
          onChangeText={setNumTargets}
          keyboardType="number-pad"
          returnKeyType="next"
          onSubmitEditing={() => shotsRef.current?.focus()}
        />

        <Text style={[s.label, { marginTop: 20 }]}>Shots per Target</Text>
        <TextInput
          ref={shotsRef}
          style={s.input}
          placeholder="e.g. 2"
          placeholderTextColor="#555"
          value={shotsPerTarget}
          onChangeText={setShotsPerTarget}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={handleCreate}
        />

        <Pressable
          style={[s.button, !valid && s.buttonDisabled]}
          onPress={handleCreate}
          disabled={!valid}
        >
          <Text style={s.buttonText}>Create Stage</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 24, gap: 8 },
  label: { color: '#aaa', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 18,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    marginTop: 32,
    backgroundColor: '#e63946',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#444' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
})

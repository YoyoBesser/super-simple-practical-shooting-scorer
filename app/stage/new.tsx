import { useState, useRef } from 'react'
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../../store/useStore'

export default function NewStageScreen() {
  const router = useRouter()
  const addStage = useStore((s) => s.addStage)
  const [name, setName] = useState('')
  const [numTargets, setNumTargets] = useState('')
  const [shotsPerTarget, setShotsPerTarget] = useState('2')
  const [customShots, setCustomShots] = useState(false)
  const [perTargetShots, setPerTargetShots] = useState<string[]>([])
  const targetsRef = useRef<TextInput>(null)
  const shotsRef = useRef<TextInput>(null)

  function handleNumTargetsChange(val: string) {
    setNumTargets(val)
    if (customShots) {
      const n = parseInt(val, 10)
      if (!isNaN(n) && n >= 1) {
        setPerTargetShots((prev) => {
          const defaultShot = shotsPerTarget || '2'
          const next = [...prev]
          while (next.length < n) next.push(defaultShot)
          return next.slice(0, n)
        })
      } else {
        setPerTargetShots([])
      }
    }
  }

  function handleToggleCustom() {
    if (!customShots) {
      const n = parseInt(numTargets, 10)
      const defaultShot = shotsPerTarget || '2'
      setPerTargetShots(isNaN(n) || n < 1 ? [] : Array(n).fill(defaultShot))
    }
    setCustomShots((prev) => !prev)
  }

  function setPerTargetShot(index: number, val: string) {
    setPerTargetShots((prev) => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  function handleCreate() {
    const trimmed = name.trim()
    const targets = parseInt(numTargets, 10)
    if (!trimmed || isNaN(targets) || targets < 1) return

    if (customShots) {
      const shotsList = perTargetShots.map((s) => parseInt(s, 10))
      if (shotsList.length !== targets || shotsList.some((s) => isNaN(s) || s < 1)) return
      const id = addStage(trimmed, targets, shotsList[0], shotsList)
      router.replace(`/stage/${id}`)
    } else {
      const shots = parseInt(shotsPerTarget, 10)
      if (isNaN(shots) || shots < 1) return
      const id = addStage(trimmed, targets, shots)
      router.replace(`/stage/${id}`)
    }
  }

  const numTargetsParsed = parseInt(numTargets, 10)
  const validCustom = customShots
    ? perTargetShots.length === numTargetsParsed &&
      perTargetShots.every((s) => parseInt(s, 10) >= 1)
    : parseInt(shotsPerTarget, 10) >= 1

  const valid = name.trim().length > 0 && numTargetsParsed >= 1 && validCustom

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={s.form} keyboardShouldPersistTaps="handled">
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
          onChangeText={handleNumTargetsChange}
          keyboardType="number-pad"
          returnKeyType="next"
          onSubmitEditing={() => shotsRef.current?.focus()}
        />

        {/* Shots per target — uniform or custom */}
        <View style={s.shotsHeader}>
          <Text style={s.label}>Shots per Target</Text>
          <Pressable style={[s.toggleBtn, customShots && s.toggleBtnOn]} onPress={handleToggleCustom}>
            <Text style={[s.toggleBtnText, customShots && s.toggleBtnTextOn]}>
              Custom
            </Text>
          </Pressable>
        </View>

        {customShots ? (
          <View style={s.customGrid}>
            {perTargetShots.map((val, i) => (
              <View key={i} style={s.customRow}>
                <Text style={s.customLabel}>T{i + 1}</Text>
                <TextInput
                  style={[s.input, s.customInput]}
                  placeholder="shots"
                  placeholderTextColor="#555"
                  value={val}
                  onChangeText={(v) => setPerTargetShot(i, v)}
                  keyboardType="number-pad"
                  returnKeyType={i === perTargetShots.length - 1 ? 'done' : 'next'}
                  onSubmitEditing={i === perTargetShots.length - 1 ? handleCreate : undefined}
                />
              </View>
            ))}
            {perTargetShots.length === 0 && (
              <Text style={s.customEmpty}>Enter number of targets first</Text>
            )}
          </View>
        ) : (
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
        )}

        <Pressable
          style={[s.button, !valid && s.buttonDisabled]}
          onPress={handleCreate}
          disabled={!valid}
        >
          <Text style={s.buttonText}>Create Stage</Text>
        </Pressable>
      </ScrollView>
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

  shotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 0,
  },
  toggleBtn: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  toggleBtnOn: {
    borderColor: '#e63946',
    backgroundColor: '#3a1a1a',
  },
  toggleBtnText: { color: '#666', fontSize: 13, fontWeight: '600' },
  toggleBtnTextOn: { color: '#e63946' },

  customGrid: { gap: 8 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customLabel: { color: '#888', fontSize: 14, fontWeight: '700', width: 28 },
  customInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
  customEmpty: { color: '#444', fontSize: 14, fontStyle: 'italic' },

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

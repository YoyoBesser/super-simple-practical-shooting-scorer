import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, SectionList,
} from 'react-native'
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useStore } from '../../store/useStore'
import {
  computeHitFactor, computePoints, getShotsForTarget, totalExpectedShots,
  type Hits, type ShooterScore, type Category, CATEGORIES,
} from '../../store/types'

type HitKey = keyof Hits

const HIT_BUTTONS: { key: HitKey; label: string; color: string }[] = [
  { key: 'A', label: 'A', color: '#2ecc71' },
  { key: 'C', label: 'C', color: '#f39c12' },
  { key: 'D', label: 'D', color: '#e74c3c' },
  { key: 'NSM', label: 'NS/M', color: '#8e44ad' },
]

const HIT_COLOR: Record<HitKey, string> = {
  A: '#2ecc71',
  C: '#f39c12',
  D: '#e74c3c',
  NSM: '#8e44ad',
}

function sequenceToHits(seq: HitKey[]): Hits {
  return seq.reduce(
    (acc, key) => ({ ...acc, [key]: acc[key] + 1 }),
    { A: 0, C: 0, D: 0, NSM: 0 } as Hits
  )
}

function hitsToSequence(hits: Hits): HitKey[] {
  return [
    ...Array(hits.A).fill('A' as HitKey),
    ...Array(hits.C).fill('C' as HitKey),
    ...Array(hits.D).fill('D' as HitKey),
    ...Array(hits.NSM).fill('NSM' as HitKey),
  ]
}

export default function StageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const navigation = useNavigation()
  const stage = useStore((s) => s.stages.find((st) => st.id === id))
  const addScore = useStore((s) => s.addScore)
  const deleteScore = useStore((s) => s.deleteScore)
  const updateScore = useStore((s) => s.updateScore)

  const router = useRouter()
  const [shooterName, setShooterName] = useState('')
  const [time, setTime] = useState('')
  const [sequence, setSequence] = useState<HitKey[]>([])
  const [category, setCategory] = useState<Category>('Production')
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null)
  const timeRef = useRef<TextInput>(null)

  useEffect(() => {
    if (!stage) return
    navigation.setOptions({
      title: stage.name,
      headerLeft: () => (
        <Pressable onPress={() => router.push('/')} style={s.backBtn}>
          <Text style={s.backBtnText}>‹ Stages</Text>
        </Pressable>
      ),
    })
  }, [stage?.name])

  if (!stage) {
    return (
      <View style={s.center}>
        <Text style={s.empty}>Stage not found.</Text>
      </View>
    )
  }

  const totalExpected =
    Number.isFinite(stage.numTargets) && Number.isFinite(stage.shotsPerTarget) && stage.numTargets > 0
      ? totalExpectedShots(stage)
      : null

  function addHit(key: HitKey) {
    setSequence((seq) => [...seq, key])
  }

  function backspace() {
    setSequence((seq) => seq.slice(0, -1))
  }

  function resetForm() {
    setShooterName('')
    setTime('')
    setSequence([])
    setCategory('Production')
    setEditingScoreId(null)
  }

  function loadForEdit(item: ShooterScore) {
    setEditingScoreId(item.id)
    setShooterName(item.shooterName)
    setTime(String(item.time))
    setSequence(hitsToSequence(item.hits))
    setCategory(item.category ?? 'Production')
  }

  function handleSave() {
    const name = shooterName.trim()
    const t = parseFloat(time.replace(/[; ]/g, '.'))
    if (!name || isNaN(t) || t <= 0) return
    const hits = sequenceToHits(sequence)
    if (editingScoreId) {
      updateScore(id, editingScoreId, { shooterName: name, time: t, hits, category })
    } else {
      addScore(id, { shooterName: name, time: t, hits, category })
    }
    resetForm()
  }

  const hits = sequenceToHits(sequence)
  const points = computePoints(hits)
  const parsedTime = parseFloat(time.replace(/[; ]/g, '.'))
  const hf = !isNaN(parsedTime) && parsedTime > 0 ? computeHitFactor(hits, parsedTime) : null
  const canSave = shooterName.trim().length > 0 && !isNaN(parsedTime) && parsedTime > 0

  const counterColor =
    totalExpected == null ? '#888' :
    sequence.length === totalExpected ? '#2ecc71' :
    sequence.length > totalExpected ? '#e63946' : '#888'

  // Build SectionList sections: one per non-empty category, sorted by HF within each
  const sections = CATEGORIES.flatMap((cat) => {
    const catScores = stage.scores
      .filter((sc) => (sc.category ?? 'Production') === cat)
      .sort((a, b) => computeHitFactor(b.hits, b.time) - computeHitFactor(a.hits, a.time))
    return catScores.length > 0 ? [{ title: cat, data: catScores }] : []
  })

  const totalScores = stage.scores.length

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ── Entry panel (fixed, never scrolls) ── */}
      <View style={s.panel}>
        <View style={s.inputRow}>
          <TextInput
            style={[s.input, { flex: 2 }]}
            placeholder="Shooter name"
            placeholderTextColor="#555"
            value={shooterName}
            onChangeText={setShooterName}
            returnKeyType="next"
            onSubmitEditing={() => timeRef.current?.focus()}
          />
          <TextInput
            ref={timeRef}
            style={[s.input, { flex: 1 }]}
            placeholder="Time"
            placeholderTextColor="#555"
            value={time}
            onChangeText={setTime}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />
        </View>

        {/* Category selector */}
        <View style={s.categoryRow}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[s.catBtn, category === cat && s.catBtnActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[s.catBtnText, category === cat && s.catBtnTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.hitRow}>
          {HIT_BUTTONS.map(({ key, label, color }) => (
            <Pressable
              key={key}
              style={({ pressed }) => [s.hitBtn, { backgroundColor: color }, pressed && s.pressed]}
              onPress={() => addHit(key)}
            >
              <Text style={s.hitBtnLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={s.previewText}>
          {sequence.length} hit{sequence.length !== 1 ? 's' : ''} · {points} pts
          {hf !== null ? `  ·  HF ${hf.toFixed(2)}` : ''}
        </Text>

        <View style={s.tapeBox}>
          <View style={s.tapeMain}>
            {totalExpected != null && stage.numTargets > 0
              ? (() => {
                  const groups: HitKey[][] = []
                  let offset = 0
                  for (let i = 0; i < stage.numTargets; i++) {
                    const count = getShotsForTarget(stage, i)
                    groups.push(sequence.slice(offset, offset + count))
                    offset += count
                  }
                  if (sequence.length > totalExpected) {
                    groups.push(sequence.slice(totalExpected))
                  }
                  return (
                    <View style={s.groupsRow}>
                      {groups.map((grp, gi) => {
                        const expected = gi < stage.numTargets ? getShotsForTarget(stage, gi) : 0
                        const borderColor =
                          grp.length === 0 ? '#333' :
                          grp.length < expected ? '#f39c12' : '#2ecc71'
                        return (
                          <View key={gi} style={[s.targetGroup, { borderColor }]}>
                            {grp.length === 0
                              ? Array.from({ length: expected }).map((_, si) => (
                                  <Text key={si} style={s.groupPlaceholder}>·</Text>
                                ))
                              : grp.map((key, ki) => (
                                  <Text key={ki} style={[s.tapeLetter, { color: HIT_COLOR[key] }]}>
                                    {key === 'NSM' ? 'M' : key}
                                  </Text>
                                ))
                            }
                          </View>
                        )
                      })}
                    </View>
                  )
                })()
              : (
                <View style={s.tapeLetters}>
                  {sequence.length === 0
                    ? <Text style={s.tapePlaceholder}>tap buttons to record hits…</Text>
                    : sequence.map((key, i) => (
                        <Text key={i} style={[s.tapeLetter, { color: HIT_COLOR[key] }]}>
                          {key === 'NSM' ? 'M' : key}
                        </Text>
                      ))
                  }
                </View>
              )
            }
            <Text style={[s.counter, { color: counterColor }]}>
              {sequence.length}{totalExpected != null ? ` / ${totalExpected}` : ''}
            </Text>
          </View>
          <Pressable
            style={[s.backspaceBtn, sequence.length === 0 && s.backspaceBtnDisabled]}
            onPress={backspace}
            disabled={sequence.length === 0}
          >
            <Text style={s.backspaceBtnText}>⌫</Text>
          </Pressable>
        </View>

        <View style={s.saveRow}>
          {editingScoreId && (
            <Pressable style={s.cancelBtn} onPress={resetForm}>
              <Text style={s.cancelBtnText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable style={[s.saveBtn, !canSave && s.saveBtnDisabled, editingScoreId ? { flex: 1 } : {}]} onPress={handleSave} disabled={!canSave}>
            <Text style={s.saveBtnText}>{editingScoreId ? 'Update Score' : 'Save Score'}</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Results (fills remaining space, scrolls internally) ── */}
      {totalScores > 0 && (
        <View style={s.results}>
          <Text style={s.listHeader}>
            Results — {totalScores} shooter{totalScores !== 1 ? 's' : ''}
          </Text>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            style={{ flex: 1 }}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) => (
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{section.title}</Text>
                <Text style={s.sectionCount}>{section.data.length}</Text>
              </View>
            )}
            renderItem={({ item, index }: { item: ShooterScore; index: number }) => {
              const scoreHf = computeHitFactor(item.hits, item.time)
              const pts = computePoints(item.hits)
              return (
                <Pressable
                  style={[s.scoreRow, editingScoreId === item.id && s.scoreRowEditing]}
                  onPress={() => loadForEdit(item)}
                  onLongPress={() => deleteScore(id, item.id)}
                >
                  <Text style={s.rank}>#{index + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.scoreName}>{item.shooterName}</Text>
                    <Text style={s.scoreDetail}>
                      {item.time.toFixed(2)}s · {pts} pts · A{item.hits.A} C{item.hits.C} D{item.hits.D} M{item.hits.NSM}
                    </Text>
                  </View>
                  <Text style={s.hfValue}>{scoreHf.toFixed(2)}</Text>
                </Pressable>
              )
            }}
            ListFooterComponent={<Text style={s.listHint}>Tap to edit · Long-press to delete</Text>}
          />
        </View>
      )}

    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#666', fontSize: 16 },

  // Entry panel — never scrolls, fixed at top
  panel: { padding: 16, paddingBottom: 0 },

  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    fontSize: 17,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  catBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  catBtnActive: { borderColor: '#e63946', backgroundColor: '#3a1a1a' },
  catBtnText: { color: '#555', fontSize: 13, fontWeight: '600' },
  catBtnTextActive: { color: '#e63946' },

  hitRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  hitBtn: {
    flex: 1,
    height: 72,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: { opacity: 0.75 },
  hitBtnLabel: { color: '#fff', fontSize: 24, fontWeight: '800' },

  previewText: { color: '#aaa', fontSize: 14, marginBottom: 8 },

  tapeBox: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tapeMain: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  tapeLetters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    minHeight: 28,
    marginBottom: 6,
  },
  tapePlaceholder: { color: '#444', fontSize: 13 },
  tapeLetter: { fontSize: 20, fontWeight: '800', lineHeight: 24 },
  counter: { fontSize: 17, fontWeight: '700' },
  groupsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  targetGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 3,
    minWidth: 28,
  },
  groupPlaceholder: { color: '#444', fontSize: 18, lineHeight: 24 },
  backspaceBtn: {
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
  },
  backspaceBtnDisabled: { opacity: 0.3 },
  backspaceBtnText: { color: '#fff', fontSize: 22 },

  saveRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#e63946',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { backgroundColor: '#444' },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cancelBtn: {
    backgroundColor: '#3a3a3a',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { color: '#aaa', fontSize: 16, fontWeight: '600' },

  // Results — fills remaining space
  results: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  listHeader: { color: '#888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  sectionTitle: { color: '#666', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  sectionCount: { color: '#555', fontSize: 11 },
  scoreRow: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  scoreRowEditing: {
    borderWidth: 1,
    borderColor: '#e63946',
  },
  rank: { color: '#555', fontSize: 13, width: 22 },
  scoreName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  scoreDetail: { color: '#888', fontSize: 11, marginTop: 2 },
  hfValue: { color: '#e63946', fontSize: 20, fontWeight: '700' },
  listHint: { color: '#444', fontSize: 11, textAlign: 'center', marginTop: 4, marginBottom: 8 },

  backBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  backBtnText: { color: '#fff', fontSize: 17 },
})

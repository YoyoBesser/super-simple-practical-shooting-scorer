import { useState } from 'react'
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../store/useStore'
import type { Stage } from '../store/types'
import { COMMIT_HASH, BUILD_TIME } from '../constants/version'

export default function HomeScreen() {
  const router = useRouter()
  const stages = useStore((s) => s.stages)
  const deleteStage = useStore((s) => s.deleteStage)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <View style={s.container}>
      <FlatList
        data={stages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={stages.length === 0 ? s.emptyContainer : s.list}
        ListEmptyComponent={
          <Text style={s.empty}>No stages yet.{'\n'}Tap + to create one.</Text>
        }
        renderItem={({ item }: { item: Stage }) =>
          confirmingId === item.id ? (
            <View style={s.confirmRow}>
              <Text style={s.confirmText}>Delete "{item.name}"?</Text>
              <View style={s.confirmBtns}>
                <Pressable style={s.confirmNo} onPress={() => setConfirmingId(null)}>
                  <Text style={s.confirmNoText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={s.confirmYes}
                  onPress={() => { deleteStage(item.id); setConfirmingId(null) }}
                >
                  <Text style={s.confirmYesText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={s.row}>
              <Pressable
                style={({ pressed }: { pressed: boolean }) => [s.rowMain, pressed && s.pressed]}
                onPress={() => router.push(`/stage/${item.id}`)}
              >
                <View>
                  <Text style={s.stageName}>{item.name}</Text>
                  <Text style={s.stageSub}>
                    {item.numTargets} target{item.numTargets !== 1 ? 's' : ''} · {item.scores.length} score{item.scores.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Text style={s.arrow}>›</Text>
              </Pressable>
              <Pressable style={s.deleteBtn} onPress={() => setConfirmingId(item.id)}>
                <Text style={s.deleteBtnText}>✕</Text>
              </Pressable>
            </View>
          )
        }
      />
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        <Pressable style={s.fab} onPress={() => router.push('/stage/new')}>
          <Text style={s.fabText}>+</Text>
        </Pressable>
        <Text style={s.version}>
          {COMMIT_HASH}{BUILD_TIME ? `  ·  ${BUILD_TIME}` : ''}
        </Text>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#666', fontSize: 18, textAlign: 'center', lineHeight: 30 },

  row: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  rowMain: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: { opacity: 0.7 },
  stageName: { color: '#fff', fontSize: 18, fontWeight: '600' },
  stageSub: { color: '#888', fontSize: 13, marginTop: 3 },
  arrow: { color: '#555', fontSize: 24 },
  deleteBtn: {
    backgroundColor: '#3a1a1a',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: { color: '#e63946', fontSize: 18 },

  confirmRow: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 14,
    gap: 10,
  },
  confirmText: { color: '#fff', fontSize: 15 },
  confirmBtns: { flexDirection: 'row', gap: 10 },
  confirmNo: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmNoText: { color: '#aaa', fontSize: 15, fontWeight: '600' },
  confirmYes: {
    flex: 1,
    backgroundColor: '#e63946',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmYesText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e63946',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 36 },
  version: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#333',
    fontSize: 11,
  },
})

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Stage, ShooterScore } from './types'

type State = {
  stages: Stage[]
  addStage: (name: string, numTargets: number, shotsPerTarget: number) => string
  deleteStage: (id: string) => void
  addScore: (stageId: string, score: Omit<ShooterScore, 'id'>) => void
  deleteScore: (stageId: string, scoreId: string) => void
  updateScore: (stageId: string, scoreId: string, score: Omit<ShooterScore, 'id'>) => void
}

function uuid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      stages: [],

      addStage: (name, numTargets, shotsPerTarget) => {
        const id = uuid()
        set((s) => ({
          stages: [...s.stages, { id, name, numTargets, shotsPerTarget, scores: [] }],
        }))
        return id
      },

      deleteStage: (id) =>
        set((s) => ({ stages: s.stages.filter((st) => st.id !== id) })),

      addScore: (stageId, score) =>
        set((s) => ({
          stages: s.stages.map((st) =>
            st.id === stageId
              ? { ...st, scores: [...st.scores, { ...score, id: uuid() }] }
              : st
          ),
        })),

      deleteScore: (stageId, scoreId) =>
        set((s) => ({
          stages: s.stages.map((st) =>
            st.id === stageId
              ? { ...st, scores: st.scores.filter((sc) => sc.id !== scoreId) }
              : st
          ),
        })),

      updateScore: (stageId, scoreId, score) =>
        set((s) => ({
          stages: s.stages.map((st) =>
            st.id === stageId
              ? {
                  ...st,
                  scores: st.scores.map((sc) =>
                    sc.id === scoreId ? { ...score, id: scoreId } : sc
                  ),
                }
              : st
          ),
        })),
    }),
    {
      name: 'scorer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

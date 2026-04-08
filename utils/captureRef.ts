import type { Component } from 'react'

// Web stub — captureRef is not used on web (html-to-image handles it instead)
export async function captureRef(
  _target: number | Component | { current: unknown } | null,
  _options?: object
): Promise<string> {
  throw new Error('captureRef is not available on web')
}

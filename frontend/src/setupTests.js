import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Slim jest shim via Proxy: provides jest.fn/spyOn/etc. but intentionally hides
// isFakeTimers, getTimerCount, and _isMockFunction so that @testing-library/dom
// does NOT mistakenly detect "fake timers active" and call vi.advanceTimersByTime
// on every waitFor poll (which throws "Timers are not mocked").
const HIDDEN_TIMER_PROPS = new Set(['isFakeTimers', 'getTimerCount', '_isMockFunction'])
globalThis.jest = new Proxy(vi, {
  get(target, prop) {
    if (HIDDEN_TIMER_PROPS.has(prop)) return undefined
    if (prop === 'advanceTimersByTime') {
      return (ms) => { try { vi.advanceTimersByTime(ms) } catch (_) {} }
    }
    const val = target[prop]
    return typeof val === 'function' ? val.bind(target) : val
  },
})

// jsdom 24 + Vitest 2 has a --localstorage-file bug that breaks localStorage.
// Provide a proper in-memory implementation.
const makeStorage = () => {
  let store = {}
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null },
    setItem(key, value) { store[key] = String(value) },
    removeItem(key) { delete store[key] },
    clear() { store = {} },
    get length() { return Object.keys(store).length },
    key(i) { return Object.keys(store)[i] ?? null },
  }
}

Object.defineProperty(window, 'localStorage', { value: makeStorage(), writable: true })
Object.defineProperty(window, 'sessionStorage', { value: makeStorage(), writable: true })

// In Vitest's jsdom environment global and window are separate objects.
// When a test does `const realSetTimeout = global.setTimeout.bind(global)`,
// the result is jsdom's window.setTimeout called with this=global (not window),
// which can break jsdom's timer implementation and prevent React from flushing
// state updates. Fix: make global.setTimeout a context-independent wrapper.
const _nativeSetTimeout = window.setTimeout.bind(window)
const _nativeClearTimeout = window.clearTimeout.bind(window)
global.setTimeout = function vitestSetTimeoutShim(cb, delay) { return _nativeSetTimeout(cb, delay) }
global.clearTimeout = function vitestClearTimeoutShim(id) { return _nativeClearTimeout(id) }

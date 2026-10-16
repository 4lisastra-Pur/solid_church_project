// src/lib/stores/theme.ts
import { createSignal } from 'solid-js'
import { isServer } from 'solid-js/web'

export type ThemeMode = 'light' | 'dark' | 'system' // 'system' = follow the device setting

export const THEME_STORAGE_KEY = 'theme'

// What the user picked. Starts as 'system' on both server and client so the first
// render always matches (no hydration mismatch); initTheme() syncs it right after mount.
const [theme, setThemeSignal] = createSignal<ThemeMode>('system')

// What is actually shown right now ('system' resolved to light or dark).
const [resolvedTheme, setResolvedTheme] = createSignal<'light' | 'dark'>('light')

export { theme, resolvedTheme }

const isMode = (value: unknown): value is ThemeMode =>
    value === 'light' || value === 'dark' || value === 'system'

// Puts the .dark class on <html> (what Tailwind's `dark:` variant looks at)
// and sets color-scheme so scrollbars / form controls follow the theme too.
function apply(mode: ThemeMode) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = mode === 'dark' || (mode === 'system' && prefersDark)

    const root = document.documentElement
    root.classList.toggle('dark', dark)
    root.style.colorScheme = dark ? 'dark' : 'light'
    setResolvedTheme(dark ? 'dark' : 'light')
}

let initialized = false

// Call once on the client (ThemeToggle does it in onMount). Safe to call many times.
export function initTheme() {
    if (isServer || initialized) return
    initialized = true

    let stored: string | null = null
    try {
        stored = localStorage.getItem(THEME_STORAGE_KEY)
    } catch { /* storage blocked: fall back to 'system' */ }

    const mode: ThemeMode = isMode(stored) ? stored : 'system'
    setThemeSignal(mode)
    apply(mode)

    // Device switched between light and dark while we're on 'system'
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme() === 'system') apply('system')
    })

    // Theme changed in another tab
    window.addEventListener('storage', (e) => {
        if (e.key === THEME_STORAGE_KEY && isMode(e.newValue)) {
            setThemeSignal(e.newValue)
            apply(e.newValue)
        }
    })
}

export function setTheme(mode: ThemeMode) {
    setThemeSignal(mode)
    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode)
    } catch { /* storage blocked: still works for this session */ }
    if (!isServer) apply(mode)
}

// Optional but recommended: run this in the <head> BEFORE the app renders,
// so a reload doesn't flash light mode for dark-mode users.
// Same logic as apply() above, as a plain string.
export const themeInitScript = `(function(){try{var m=localStorage.getItem('${THEME_STORAGE_KEY}')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light'}catch(e){}})()`
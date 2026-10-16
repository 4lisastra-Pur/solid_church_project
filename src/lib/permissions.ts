// Client side of the access system. This is for the EXPERIENCE only (hide / redirect).
// The real protection is has_access(...) inside every RPC in the database.
import { createSignal } from 'solid-js'
import type { Component } from 'solid-js'
import { redirect } from '@tanstack/solid-router'
import { supabase } from '~/lib/supabase'

// ---------------------------------------------------------------------------
// Data: one RPC returns every fn_name the logged-in user may use
// ---------------------------------------------------------------------------
const getMyPermissions = async (): Promise<string[]> => {
    const { data, error } = await supabase.rpc('my_permissions')
    if (error) throw new Error(error.message)
    return (data ?? []).map((row) => row.fn_name)
}

// ---------------------------------------------------------------------------
// Store: loaded once, kept in memory
// ---------------------------------------------------------------------------
const [perms, setPerms] = createSignal<Set<string> | null>(null)
let loading: Promise<Set<string>> | null = null

export const loadPermissions = () =>
(loading ??= getMyPermissions()
    .then((list) => {
        const s = new Set(list)
        setPerms(s)
        return s
    })
    .catch((e) => {
        loading = null // allow a retry
        throw e
    }))

// call on logout, and after an admin changes access
export const clearPermissions = () => {
    loading = null
    setPerms(null)
}

// reactive: use inside JSX (<Show when={can('access_list_post')}>) or inside memos
export const can = (fn?: string) => (!fn ? true : (perms()?.has(fn) ?? false))

// ---------------------------------------------------------------------------
// Route guard: use in createFileRoute({ beforeLoad: () => requirePermission('access_list_get') })
// ---------------------------------------------------------------------------
export const requirePermission = async (fn: string) => {
    let set: Set<string>
    try {
        set = await loadPermissions()
    } catch {
        throw redirect({ to: '/login' }) // not logged in (or the RPC failed)
    }
    if (!set.has(fn)) throw redirect({ to: '/dashboard/no-access' }) // this page must exist
}

// ---------------------------------------------------------------------------
// Menu: hide what the user can't open. Put `fn` on each nav entry
// (the same fn_name the page's main RPC uses). No `fn` = always visible.
// A group with no visible children disappears.
// ---------------------------------------------------------------------------
export type NavChild = { title: string; href: string; fn?: string }
export type NavItem = {
    title: string
    href: string
    icon: Component<{ class?: string }>
    fn?: string
    children?: NavChild[]
}

export function filterNav(items: NavItem[]): NavItem[] {
    return items.flatMap((item) => {
        if (item.children) {
            const kids = item.children.filter((c) => can(c.fn))
            return kids.length > 0 ? [{ ...item, children: kids }] : []
        }
        return can(item.fn) ? [item] : []
    })
}

// ---------------------------------------------------------------------------
// USAGE
//
// 1) After login:   await loadPermissions()   (before showing the layout)
//    On logout:     clearPermissions(); await supabase.auth.signOut()
//
// 2) Route:         beforeLoad: () => requirePermission('access_list_get')
//
// 3) Button:        <Show when={can('access_list_post')}> <Button>Edit</Button> </Show>
//
// 4) Sidebar:       <For each={filterNav(section.items)}> ... </For>
//
// 5) After the access dialog saves (accessListDialog.tsx onSuccess), the current user's
//    own permissions may have changed:
//        clearPermissions(); loadPermissions()
// ---------------------------------------------------------------------------
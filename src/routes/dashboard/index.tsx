import type { Session } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, onMount, Show } from 'solid-js'
import { Button } from '~/components/ui/button'
import { getCurrentSession, signOut } from '~/data/supabase/authentication'
import { useNavigate } from "@tanstack/solid-router"

export const Route = createFileRoute('/dashboard/')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const [session, setSession] = createSignal<Session | null>(null)
    const [loading, setLoading] = createSignal(true)

    onMount(async () => {
        const s = await getCurrentSession()
        setSession(s)
        setLoading(false)
    })
    const handleSignOut = async () => {
        try {
            await signOut()
            navigate({ to: '/' })   // or '/', whichever you want after logout
        } catch (err) {
            console.error(err)
        }
    }



    return (
        <Show when={!loading()} fallback={<p>Loading…</p>}>
            <Show when={session()} fallback={<p>Not signed in</p>}>
                {(s) => (
                    <div>
                        User ID: {s().user.id}{' '}
                        <Button onClick={handleSignOut}>SignOut</Button>
                    </div>
                )}
            </Show>
        </Show>

    )
}

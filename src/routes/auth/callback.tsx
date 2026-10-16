import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createSignal, onMount, Show } from 'solid-js'
import { AuthShell, ErrorNote } from '~/components/page/authShell'
import { complateGmailSignIn } from '~/data/supabase/authentication'

export const Route = createFileRoute('/auth/callback')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

  onMount(async () => {
    try {
      const session = await complateGmailSignIn()
      if (session) {
        navigate({ to: '/dashboard' })
      } else {
        setErrorMsg('No session found after Google sign-in.')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Sign-in failed')
    }
  })
  return (
    <AuthShell>
      <Show
        when={errorMsg()}
        fallback={
          <div class="flex items-center gap-4" role="status">
            <span
              class="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-teal-800 motion-reduce:animate-none"
              aria-hidden="true"
            />
            <div>
              <h1 class="text-lg font-semibold">Signing you in…</h1>
              <p class="text-sm text-slate-600">Linking your Gmail to your church record.</p>
            </div>
          </div>
        }
      >
        <h1 class="text-2xl font-semibold tracking-tight">Couldn't finish signing in</h1>
        <div class="mt-4">
          <ErrorNote message={errorMsg()} />
        </div>
        <Link
          to="/singin"
          class="mt-6 inline-block font-medium text-teal-800 hover:underline"
        >
          Back to sign in
        </Link>
      </Show>
    </AuthShell>
  )
}

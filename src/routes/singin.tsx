import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'
import { AuthShell, ErrorNote, Field, GmailButton, OrDivider, PrimaryButton } from '~/components/page/authShell'
import { signInGmail, signInPassword } from '~/data/supabase/authentication'

export const Route = createFileRoute('/singin')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const [nij, setNij] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [loading, setLoading] = createSignal(false)
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null)
    const [gmailLoading, setGmailLoading] = createSignal(false)

    const handlePasswordSignIn = async (e: Event) => {
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)
        try {
            await signInPassword({ nij: nij(), password: password() })
            navigate({ to: '/dashboard' })
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Sign in failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGmailSignIn = async () => {
        if (gmailLoading()) return
        setGmailLoading(true)
        setErrorMsg(null)
        try {
            await signInGmail()
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Gmail sign in failed')
        } finally {
            setGmailLoading(false)
        }
    }

    return (
        <AuthShell>
            <h1 class="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p class="mt-2 text-slate-600">Use your NIJ and password, or continue with Gmail.</p>

            <form onSubmit={handlePasswordSignIn} class="mt-8 space-y-5">
                <Field id="nij" label="NIJ" value={nij()} onInput={setNij} autocomplete="username" />
                <Field
                    id="password"
                    label="Password"
                    type="password"
                    value={password()}
                    onInput={setPassword}
                    autocomplete="current-password"
                />
                <ErrorNote message={errorMsg()} />
                <PrimaryButton loading={loading()} label="Sign in" loadingLabel="Signing in…" />
            </form>

            <OrDivider />
            <GmailButton disabled={gmailLoading()} onClick={handleGmailSignIn} />

            <p class="mt-8 text-center text-sm text-slate-600">
                No account yet?{' '}
                <Link to="/singup" class="font-medium text-teal-800 hover:underline">
                    Sign up
                </Link>
            </p>
        </AuthShell>
    )
}

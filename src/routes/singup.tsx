import { createFileRoute, Link, useNavigate } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'
import { AuthShell, ErrorNote, Field, PrimaryButton } from '~/components/page/authShell'
import { signUpPassword } from '~/data/supabase/authentication'

export const Route = createFileRoute('/singup')({
    component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate()
    const [nij, setNij] = createSignal('')
    const [password, setPassword] = createSignal('')
    const [loading, setLoading] = createSignal(false)
    const [errorMsg, setErrorMsg] = createSignal<string | null>(null)

    const handlePasswordSignUp = async (e: Event) => {
        e.preventDefault()
        setErrorMsg(null)
        setLoading(true)
        try {
            await signUpPassword({ nij: nij(), password: password() })
            navigate({ to: '/dashboard' })
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Sign up failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell>
            <h1 class="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p class="mt-2 text-slate-600">
                Your NIJ links this login to your church record. Choose a password or use Gmail.
            </p>

            <form onSubmit={handlePasswordSignUp} class="mt-8 space-y-5">
                <Field id="nij" label="NIJ" value={nij()} onInput={setNij} autocomplete="username" />
                <Field
                    id="password"
                    label="Password"
                    type="password"
                    value={password()}
                    onInput={setPassword}
                    autocomplete="new-password"
                />
                <ErrorNote message={errorMsg()} />
                <PrimaryButton loading={loading()} label="Sign up" loadingLabel="Creating account…" />
            </form>


            <p class="mt-8 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/singin" class="font-medium text-teal-800 hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthShell>
    )
}

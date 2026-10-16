import { Show, type JSX } from 'solid-js'

/** Two-panel page layout: brand panel on the left (desktop only), content on the right. */
export function AuthShell(props: { children: JSX.Element }) {
    return (
        <main class="grid min-h-screen bg-white text-slate-900 lg:grid-cols-[5fr_6fr]">
            <aside class="hidden flex-col justify-between bg-teal-900 p-12 text-teal-50 lg:flex">
                <span class="text-lg font-semibold tracking-tight">Church Members</span>
                <div class="max-w-sm">
                    <h2 class="text-3xl font-semibold leading-snug">
                        Your records and access, in one place.
                    </h2>
                    <p class="mt-4 text-teal-200">
                        Sign in with your NIJ to view your details and manage how you log in.
                    </p>
                </div>
                <span class="text-sm text-teal-300">Need help? Ask your church administrator.</span>
            </aside>

            <section class="flex items-center justify-center px-6 py-12">
                <div class="w-full max-w-sm">{props.children}</div>
            </section>
        </main>
    )
}

export function Field(props: {
    id: string
    label: string
    type?: string
    value: string
    onInput: (value: string) => void
    autocomplete?: string
}) {
    return (
        <div>
            <label for={props.id} class="block text-sm font-medium text-slate-700">
                {props.label}
            </label>
            <input
                id={props.id}
                type={props.type ?? 'text'}
                value={props.value}
                autocomplete={props.autocomplete}
                required
                onInput={(e) => props.onInput(e.currentTarget.value)}
                class="mt-1.5 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-700/25"
            />
        </div>
    )
}

export function ErrorNote(props: { message: string | null }) {
    return (
        <Show when={props.message}>
            <p
                role="alert"
                class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
                {props.message}
            </p>
        </Show>
    )
}

export function PrimaryButton(props: { loading: boolean; label: string; loadingLabel: string }) {
    return (
        <button
            type="submit"
            disabled={props.loading}
            class="w-full rounded-md bg-teal-800 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {props.loading ? props.loadingLabel : props.label}
        </button>
    )
}

export function GmailButton(props: { onClick: () => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            onClick={props.onClick}
            disabled={props.disabled}
            class="flex w-full items-center justify-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
        >
            <svg viewBox="0 0 48 48" class="h-5 w-5" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
                <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z" />
                <path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.800 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z" />
            </svg>
            Continue with Gmail
        </button>
    )
}

export function OrDivider() {
    return (
        <div class="relative my-6" role="separator">
            <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-slate-200" />
            </div>
            <div class="relative flex justify-center">
                <span class="bg-white px-3 text-sm text-slate-500">or</span>
            </div>
        </div>
    )
}
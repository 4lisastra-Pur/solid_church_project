import { Link } from '@tanstack/solid-router'

export function NotFound() {
    return (
        <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center text-slate-900">
            <p class="text-sm font-semibold tracking-widest text-teal-800">404</p>
            <h1 class="text-3xl font-semibold tracking-tight">Page not found</h1>
            <p class="max-w-sm text-slate-600">
                The page you're looking for doesn't exist or may have moved.
            </p>
            <Link
                to="/"
                class="mt-2 rounded-md bg-teal-800 px-4 py-2.5 font-medium text-white shadow-sm transition hover:bg-teal-900"
            >
                Back to home
            </Link>
        </main>
    )
}
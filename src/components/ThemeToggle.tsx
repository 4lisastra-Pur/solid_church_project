
import { onMount, Show } from 'solid-js'
import { Check, Monitor, Moon, Sun } from 'lucide-solid'

import { Button } from '~/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

import { cn } from '~/lib/utils'
import { initTheme, setTheme, theme } from '~/lib/stores/theme'
import type { ThemeMode } from '~/lib/stores/theme'

const OPTIONS: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'Device default', icon: Monitor },
]

// Standalone: no provider needed. Drop <ThemeToggle /> anywhere.
export default function ThemeToggle(props: { class?: string }) {
    onMount(initTheme)

    return (
        <DropdownMenu placement='bottom-end'>
            <DropdownMenuTrigger
                as={Button<'button'>}
                variant='ghost'
                size='icon'
                class={cn('relative rounded-2xl m-1', props.class)}
                aria-label='Change theme'
            >
                {/* Both icons are always rendered and swapped with CSS (`dark:`), not JS state,
            so the button is correct on the very first paint and never mismatches on hydration. */}
                <Sun class='size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
                <Moon class='absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
                {OPTIONS.map((option) => (
                    <DropdownMenuItem
                        class='flex items-center gap-2'
                        onSelect={() => setTheme(option.mode)}
                    >
                        <option.icon class='size-4' />
                        <span>{option.label}</span>
                        <Show when={theme() === option.mode}>
                            <Check class='ml-auto size-4' />
                        </Show>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
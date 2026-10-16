import { createSignal } from "solid-js";

export function createDialogController<M extends Record<string, unknown>>() {
    const [type, setType] = createSignal<keyof M | null>(null)
    const [data, setData] = createSignal<unknown>(undefined)
    const [isOpen, setOpen] = createSignal<boolean>(false)

    return {
        // to open the right dialog exp:
        // dialogs.open('delete', row)   |   dialogs.open('add')
        open<K extends keyof M>(
            dialog: K,
            ...args: undefined extends M[K] ? [payload?: M[K]] : [payload: M[K]]
        ) {
            setType(() => dialog)
            setData(() => args[0])
            setOpen(true)
        },
        close: () => setOpen(false),
        setOpen, // pass to <Dialog onOpenChange>

        // <Dialog open={dialogs.isOpenFor('delete')}>
        isOpenFor: (dialog: keyof M) => isOpen() && type() === dialog,

        // On close we only flip `isOpen`. `type` and `data` stay, so the dialog keeps its
        // content while the close animation plays instead of flashing empty.
        payload: <K extends keyof M>(dialog: K) =>
            type() === dialog ? (data() as M[K]) : undefined,
    }
}

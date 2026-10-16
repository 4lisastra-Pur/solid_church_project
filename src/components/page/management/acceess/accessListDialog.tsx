import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query"
import { Check, TriangleAlert, X } from "lucide-solid"
import { createMemo, createSignal, For, Show } from "solid-js"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Callout, CalloutContent, CalloutTitle } from "~/components/ui/callout"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { TextField, TextFieldInput } from "~/components/ui/text-field"
import { deleteAccessList, postAccessList } from "~/data/supabase/management/access/accessList"
import { getAccessDetailCb } from "~/data/supabase/management/access/accessDetail"
import { btnBack, btnCancel, btnConfirm } from "~/data/type/dialog"
import { createDialogController } from "~/hooks/dialogController"
import type { AccessList } from "~/data/type/access"
import type { cbOption } from "~/data/type/showData"

export type AccessListDialogMap = {
    mutate: AccessList // edit the details of one access
    viewDetail: AccessList // read-only list of every detail
}

export function CreateAccessListDialog() {
    const dialogs = createDialogController<AccessListDialogMap>()
    const queryClient = useQueryClient()

    // --- State ---
    const [target, setTarget] = createSignal<AccessList | null>(null)
    const [selected, setSelected] = createSignal<cbOption[]>([]) // working copy
    const [search, setSearch] = createSignal('')
    const [step, setStep] = createSignal<'form' | 'confirm'>('form')

    // --- Options for the picker (only fetched while the edit dialog is open) ---
    const optionsQuery = useQuery(() => ({
        queryKey: ['accessDetailOptions'],
        queryFn: getAccessDetailCb,
        enabled: dialogs.isOpenFor('mutate'),
        staleTime: 60_000,
    }))
    const options = () => optionsQuery.data ?? []

    const filteredOptions = createMemo(() => {
        const q = search().trim().toLowerCase()
        return q ? options().filter((o) => o.name.toLowerCase().includes(q)) : options()
    })

    // --- Selection ---
    const isSelected = (id: number) => selected().some((s) => s.id === id)
    const toggleOption = (option: cbOption) =>
        setSelected((prev) =>
            prev.some((s) => s.id === option.id)
                ? prev.filter((s) => s.id !== option.id)
                : [...prev, option],
        )
    const removeOption = (id: number) => setSelected((prev) => prev.filter((s) => s.id !== id))

    // --- Diff: working copy vs what is in the database ---
    const original = createMemo<cbOption[]>(() =>
        (target()?.access_list ?? []).map((i) => ({
            id: i.access_detail_id,
            name: i.access_detail_name,
        })),
    )
    const toAdd = createMemo(() => selected().filter((s) => !original().some((o) => o.id === s.id)))
    const toDelete = createMemo(() => original().filter((o) => !selected().some((s) => s.id === o.id)))
    const hasChanges = () => toAdd().length > 0 || toDelete().length > 0

    // --- Commit: one RPC per direction (your SQL takes arrays). Retry is safe:
    // deleting rows that are already gone affects 0 rows. ---
    const mutateAccessList = useMutation(() => ({
        mutationFn: async (vars: { idAccess: number; add: number[]; remove: number[] }) => {
            if (vars.remove.length > 0) {
                await deleteAccessList({ idAccess: vars.idAccess, idAccessDetail: vars.remove })
            }
            if (vars.add.length > 0) {
                await postAccessList({ idAccess: vars.idAccess, idAccessDetail: vars.add })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getAccessList'] })
            dialogs.close()
        },
    }))

    // --- Handlers ---
    const handleNext = () => {
        if (hasChanges()) setStep('confirm')
    }
    const handleBack = () => setStep('form')
    const handleCancel = () => dialogs.close()
    const handleConfirm = () => {
        const row = target()
        if (!row || !hasChanges()) return
        mutateAccessList.mutate({
            idAccess: row.access_id,
            add: toAdd().map((i) => i.id),
            remove: toDelete().map((i) => i.id),
        })
    }

    // --- Open functions ---
    const openMutate = (row: AccessList) => {
        mutateAccessList.reset()
        setSearch('')
        setStep('form')
        setTarget(row)
        setSelected(
            row.access_list.map((i) => ({ id: i.access_detail_id, name: i.access_detail_name })),
        )
        dialogs.open('mutate', row)
    }
    const openViewDetail = (row: AccessList) => {
        dialogs.open('viewDetail', row)
    }

    return {
        dialogs,
        openMutate,
        openViewDetail,
        form: {
            target,
            selected,
            search,
            setSearch,
            step,
            isSelected,
            toggleOption,
            removeOption,
            filteredOptions,
            toAdd,
            toDelete,
            hasChanges,
        },
        optionsQuery,
        mutation: mutateAccessList,
        handlers: { handleNext, handleBack, handleCancel, handleConfirm },
    }
}
export type AccessListDialogController = ReturnType<typeof CreateAccessListDialog>

// ---------------------------------------------------------------------------
function ViewDetailDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    row?: AccessList
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{props.row?.access_name}</DialogTitle>
                    <DialogDescription>
                        {props.row?.access_list.length ?? 0} access detail
                    </DialogDescription>
                </DialogHeader>
                <div class='flex max-h-64 flex-wrap gap-1 overflow-y-auto'>
                    <For each={props.row?.access_list ?? []}>
                        {(item) => <Badge variant='secondary'>{item.access_detail_name}</Badge>}
                    </For>
                </div>
                <DialogFooter>
                    <Button onClick={() => props.onOpenChange(false)} class={btnBack}>
                        Back
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function MutateDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    controller: AccessListDialogController
}) {
    const c = props.controller
    const { target, selected, search, setSearch, step, isSelected, toggleOption, removeOption, filteredOptions, toAdd, toDelete, hasChanges } = c.form
    const { handleNext, handleBack, handleCancel, handleConfirm } = c.handlers
    const mutation = c.mutation
    const optionsQuery = c.optionsQuery

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage access detail: {target()?.access_name}</DialogTitle>
                    <DialogDescription>
                        <Show
                            when={step() === 'confirm'}
                            fallback='Pick the access detail this access should have. Nothing is saved until you confirm.'
                        >
                            Check the changes before saving.
                        </Show>
                    </DialogDescription>
                </DialogHeader>

                <Show
                    when={step() === 'confirm'}
                    fallback={
                        <div class='flex flex-col gap-3'>
                            {/* Currently selected */}
                            <div class='flex min-h-10 max-h-28 flex-wrap items-center gap-1 overflow-y-auto rounded-lg border border-border p-2'>
                                <Show
                                    when={selected().length > 0}
                                    fallback={
                                        <span class='text-xs text-muted-foreground'>
                                            No access detail selected.
                                        </span>
                                    }
                                >
                                    <For each={selected()}>
                                        {(item) => (
                                            <Badge variant='secondary' class='gap-1 pr-1'>
                                                {item.name}
                                                <button
                                                    type='button'
                                                    class='rounded-full p-0.5 hover:bg-black/10'
                                                    aria-label={`Remove ${item.name}`}
                                                    onClick={() => removeOption(item.id)}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </Badge>
                                        )}
                                    </For>
                                </Show>
                            </div>

                            {/* Search + list */}
                            <TextField value={search()} onChange={setSearch}>
                                <TextFieldInput placeholder='Search access detail' />
                            </TextField>
                            <div class='max-h-52 overflow-y-auto rounded-lg border border-border'>
                                <Show
                                    when={!optionsQuery.isPending}
                                    fallback={
                                        <div class='p-3 text-sm text-muted-foreground'>
                                            Loading access detail...
                                        </div>
                                    }
                                >
                                    <Show
                                        when={!optionsQuery.isError}
                                        fallback={
                                            <div class='flex items-center justify-between gap-2 p-3 text-sm text-rose-500'>
                                                <span>Could not load the access detail list.</span>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => optionsQuery.refetch()}
                                                >
                                                    Retry
                                                </Button>
                                            </div>
                                        }
                                    >
                                        <Show
                                            when={filteredOptions().length > 0}
                                            fallback={
                                                <div class='p-3 text-sm text-muted-foreground'>
                                                    No access detail found.
                                                </div>
                                            }
                                        >
                                            <For each={filteredOptions()}>
                                                {(option) => (
                                                    <button
                                                        type='button'
                                                        class='flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted'
                                                        onClick={() => toggleOption(option)}
                                                    >
                                                        <span class='min-w-0 break-words'>{option.name}</span>
                                                        <Show when={isSelected(option.id)}>
                                                            <Check size={16} class='shrink-0 text-green-500' />
                                                        </Show>
                                                    </button>
                                                )}
                                            </For>
                                        </Show>
                                    </Show>
                                </Show>
                            </div>
                        </div>
                    }
                >
                    <div class='flex flex-col gap-3 text-sm'>
                        <Show when={toAdd().length > 0}>
                            <div>
                                <p class='mb-1 font-semibold text-green-500'>Adding</p>
                                <div class='flex max-h-28 flex-col gap-0.5 overflow-y-auto text-muted-foreground'>
                                    <For each={toAdd()}>{(item) => <span>+ {item.name}</span>}</For>
                                </div>
                            </div>
                        </Show>
                        <Show when={toDelete().length > 0}>
                            <div>
                                <p class='mb-1 font-semibold text-rose-500'>Removing</p>
                                <div class='flex max-h-28 flex-col gap-0.5 overflow-y-auto text-muted-foreground'>
                                    <For each={toDelete()}>{(item) => <span>- {item.name}</span>}</For>
                                </div>
                            </div>
                        </Show>
                        <Show when={mutation.isError}>
                            <Callout>
                                <TriangleAlert color='red' />
                                <CalloutTitle>Error</CalloutTitle>
                                <CalloutContent>
                                    {(mutation.error as Error)?.message ?? 'Failed to save changes.'} Press
                                    Confirm to try again.
                                </CalloutContent>
                            </Callout>
                        </Show>
                    </div>
                </Show>

                <DialogFooter>
                    <Show
                        when={step() === 'confirm'}
                        fallback={
                            <div class='flex gap-2'>
                                <Button onClick={handleCancel} class={btnCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleNext} class={btnConfirm} disabled={!hasChanges()}>
                                    Continue
                                </Button>
                            </div>
                        }
                    >
                        <div class='flex gap-2'>
                            <Button onClick={handleBack} class={btnBack} disabled={mutation.isPending}>
                                Back
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                class={btnConfirm}
                                disabled={mutation.isPending || !hasChanges()}
                            >
                                {mutation.isPending ? 'Saving...' : 'Confirm'}
                            </Button>
                        </div>
                    </Show>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function AccessListDialogs(props: { controller: AccessListDialogController }) {
    const d = props.controller.dialogs

    return (
        <>
            <ViewDetailDialog
                open={d.isOpenFor('viewDetail')}
                onOpenChange={d.setOpen}
                row={d.payload('viewDetail')}
            />
            <MutateDialog
                open={d.isOpenFor('mutate')}
                onOpenChange={d.setOpen}
                controller={props.controller}
            />
        </>
    )
}


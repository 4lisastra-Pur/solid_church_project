import { Item } from "@kobalte/core/dropdown-menu"
import { useMutation, useQuery, useQueryClient } from "@tanstack/solid-query"
import { createMemo, createSignal, For, Show } from "solid-js"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { getAccessCb } from "~/data/supabase/management/access/access"
import { deleteAccessUser, postAccessUser } from "~/data/supabase/management/access/accessUser"
import { btnBack, btnCancel, btnConfirm } from "~/data/type/dialog"
import { createDialogController } from "~/hooks/dialogController"

import type { AccessListDialogController } from "./accessListDialog"
import { TextField, TextFieldInput } from "~/components/ui/text-field"
import { Check, TriangleAlert, X } from "lucide-solid"
import { Callout, CalloutContent, CalloutTitle } from "~/components/ui/callout"
import type { AccessUser } from "~/data/type/access"
import type { cbOption } from "~/data/type/showData"

export type AccessUserDialogMap = {
    Mutate: AccessUser
    ViewDetail: AccessUser
    GuestDetail: AccessUser
}

export function CreateAccessUserDialog() {
    const dialogs = createDialogController<AccessUserDialogMap>()
    const queryClient = useQueryClient()

    // -- State --
    const [target, setTarget] = createSignal<AccessUser | null>(null)
    const [selected, setSelected] = createSignal<cbOption[]>([]) // as copy
    const [search, setSearch] = createSignal('')
    const [step, setStep] = createSignal<'form' | 'confirm'>('form')

    // -- Oprion for the picker (only open while dialog edit open)
    const optionsQuery = useQuery(() => ({
        queryKey: ['accessOptions'],
        queryFn: getAccessCb,
        enabled: dialogs.isOpenFor('Mutate'),
        setTime: 60_000,
    }))
    const options = () => optionsQuery.data ?? []

    const filteredOptions = createMemo(() => {
        const q = search().trim().toLocaleLowerCase()
        return q ? options().filter((o) => o.name.toLocaleLowerCase().includes(q)) : options()
    })

    // -- Selection --
    const isSelected = (id: number) =>
        selected().some((s) => s.id === id)
    const toggleOption = (option: cbOption) =>
        setSelected((prev) =>
            prev.some((s) => s.id === option.id)
                ? prev.filter((s) => s.id !== option.id)
                : [...prev, option]
        )
    const removeOption = (id: number) =>
        setSelected((prev) => prev.filter((s) => s.id !== id))

    // -- Diff: working copy vs what in database
    const original = createMemo<cbOption[]>(() =>
        (target()?.user_access ?? []).map((i) => ({
            id: i.access_id,
            name: i.access_name,
        }))
    )
    const toAdd = createMemo(() =>
        selected().filter((s) =>
            !original().some((o) =>
                o.id === s.id
            )
        )
    )
    const toDelete = createMemo(() =>
        original().filter((o) =>
            !selected().some((s) =>
                s.id === o.id
            )
        )
    )
    const hasChanges = () => toAdd().length > 0 || toDelete().length > 0

    // -- COMIT: take array data per one RPC
    // if row alredy gone delete it affect 0 row
    const mutateAccessUser = useMutation(() => ({
        mutationFn: async (vars: { idUser: number; add: number[]; remove: number[] }) => {
            if (vars.remove.length > 0) {
                await deleteAccessUser({
                    idUser: vars.idUser,
                    idAccess: vars.remove,
                })
            }
            if (vars.add.length > 0) {
                await postAccessUser({
                    idUser: vars.idUser,
                    idAccess: vars.add
                })
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['getAccessUser'] })
            dialogs.close()
        }
    }))

    // -- handleres --
    const handleNext = () => {
        if (hasChanges()) setStep('confirm')
    }
    const handleBack = () => setStep('form')
    const handleCancel = () => dialogs.close()
    const handleConfirm = () => {
        const row = target()
        if (!row || !hasChanges()) return
        mutateAccessUser.mutate({
            idUser: row.user_id,
            add: toAdd().map((i) => i.id),
            remove: toDelete().map((i) => i.id),
        })
    }

    // -- Open Functions --
    const openMutate = (row: AccessUser) => {
        mutateAccessUser.reset()
        setSearch('')
        setStep('form')
        setTarget(row)
        setSelected(
            row.user_access.map((i) => ({
                id: i.access_id,
                name: i.access_name
            }))
        )
        dialogs.open('Mutate', row)
    }

    const openViewDetail = (row: AccessUser) => {
        dialogs.open('ViewDetail', row)
    }
    const openViewGuest = (row: AccessUser) => {
        dialogs.open('GuestDetail', row)
    }

    return {
        dialogs,
        openMutate,
        openViewDetail,
        openViewGuest,
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
            hasChanges
        },
        optionsQuery,
        mutation: mutateAccessUser,
        handlers: {
            handleNext,
            handleBack,
            handleCancel,
            handleConfirm
        }
    }
}
export type AccessUserDialogController = ReturnType<typeof CreateAccessUserDialog>

// ---------------------------------------------------------------------------------------------
function ViewDetailDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    row?: AccessUser
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle class="flex flex-row items-center">
                        <Show when={props.row?.user_call_sign}>
                            <span class="text-black">[ {props.row?.user_call_sign} ]</span>
                        </Show>
                        <span class="text-gray-600 text-lg"> {props.row?.user_full_name}</span>
                    </DialogTitle>
                    <DialogDescription>
                        has {props.row?.user_access.length ?? 0} Access
                    </DialogDescription>
                </DialogHeader>
                <div class='flex max-h-64 flex-wrap gap-1 overflow-y-auto'>
                    <For each={props.row?.user_access}>
                        {(item) => <Badge variant='secondary'>{item.access_name}</Badge>}
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

function ViewGuestDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    row?: AccessUser
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle class="flex flex-row items-center">
                        <Show
                            when={props.row?.user_call_sign}
                        >
                            <span class="text-black">[ {props.row?.user_call_sign} ]</span>
                        </Show>
                        <span class="text-gray-600 text-lg"> {props.row?.user_full_name}</span>
                    </DialogTitle>
                    <DialogDescription>
                        dari  {props.row?.user_guest_from}
                    </DialogDescription>
                </DialogHeader>
                <div class='flex max-h-64 flex-wrap gap-1 overflow-y-auto'>
                    {props.row?.user_guest_description}
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
    controller: AccessUserDialogController
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
                    <DialogTitle>
                        Manage User Access:
                        <Show
                            when={target()?.user_call_sign}>
                            <span class="text-black">[ {target()?.user_call_sign} ]</span>
                        </Show>
                        <span class="text-gray-600 text-lg"> {target()?.user_full_name}</span>
                    </DialogTitle>
                    <DialogDescription>
                        <Show
                            when={step() === 'confirm'}
                            fallback='Pick the access this User should have. Nothing is saved until you confirm.'
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
                                            No access selected.
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
                                <TextFieldInput placeholder='Search access' />
                            </TextField>
                            <div class='max-h-52 overflow-y-auto rounded-lg border border-border'>
                                <Show
                                    when={!optionsQuery.isPending}
                                    fallback={
                                        <div class='p-3 text-sm text-muted-foreground'>
                                            Loading Access...
                                        </div>
                                    }
                                >
                                    <Show
                                        when={!optionsQuery.isError}
                                        fallback={
                                            <div class='flex items-center justify-between gap-2 p-3 text-sm text-rose-500'>
                                                <span>Could not load the access.</span>
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
                                                    No access found.
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


export default function AccessUserDialogs(props: { controller: AccessUserDialogController }) {
    const d = props.controller.dialogs

    return (
        <>
            <ViewDetailDialog
                open={d.isOpenFor('ViewDetail')}
                onOpenChange={d.setOpen}
                row={d.payload('ViewDetail')}
            />
            <ViewGuestDialog
                open={d.isOpenFor('GuestDetail')}
                onOpenChange={d.setOpen}
                row={d.payload('GuestDetail')}
            />
            <MutateDialog
                open={d.isOpenFor('Mutate')}
                onOpenChange={d.setOpen}
                controller={props.controller}
            />

        </>
    )
}

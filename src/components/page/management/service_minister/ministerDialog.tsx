import { useMutation, useQueryClient } from "@tanstack/solid-query"
import { TriangleAlert } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { Button } from "~/components/ui/button"
import { Callout, CalloutContent, CalloutTitle } from "~/components/ui/callout"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { TextField, TextFieldInput, TextFieldLabel, TextFieldTextArea } from "~/components/ui/text-field"
import { deleteMinister, diActiveMinister, patchMinister, postMinister } from "~/data/supabase/management/service_minister/minister"
import { btnBack, btnCancel, btnConfirm } from "~/data/type/dialog"
import type { Minister, MinisterUpdate } from "~/data/type/service_minister"
import { createDialogController } from "~/hooks/dialogController"

export type MinisterDialogMap = {
    post: undefined
    patch: Minister
    viewDesc: Minister
    diActive: Minister
    delete: Minister
}

export function CreateMinisterDialog() {
    const dialogs = createDialogController<MinisterDialogMap>()
    const queryClient = useQueryClient()

    // --- Dialog Component --
    const [target, setTarget] = createSignal<Minister | null>(null)
    const [name, setName] = createSignal('')
    const [description, setDescription] = createSignal('')
    const [step, setStep] = createSignal<'form' | 'confirm'>('form')

    // -- For Update dialog only --
    const nameChanged = () => target() !== null && name() !== target()!.name
    const descriptionChanged = () =>
        target() !== null && (description() || '') !== (target()!.description ?? '')
    const hasChanges = () => nameChanged() || descriptionChanged()

    // --- Function Dialog Component ---
    const resetForm = () => {
        setName('')
        setDescription('')
        setTarget(null)
        setStep('form')
    }
    const onSaved = () => {
        queryClient.invalidateQueries({ queryKey: ['getMinister'] })
        resetForm()
        dialogs.close()
    }

    // --- Mutations ---
    const postMutation = useMutation(() => ({
        mutationFn: postMinister,
        onSuccess: onSaved,
    }))
    const patchMutation = useMutation(() => ({
        mutationFn: (vars: { id: number; changes: MinisterUpdate }) =>
            patchMinister(vars.id, vars.changes),
        onSuccess: onSaved,
    }))
    const diActiveMutation = useMutation(() => ({
        mutationFn: (vars: { id: number; active: boolean }) =>
            diActiveMinister(vars.id, vars.active),
        onSuccess: onSaved,
    }))
    const deleteMutation = useMutation(() => ({
        mutationFn: deleteMinister,
        onSuccess: onSaved,
    }))

    // --- Handlers Button ---
    const handleNext = (e: SubmitEvent) => {
        e.preventDefault()
        if (!name().trim()) return
        setStep('confirm')
    }
    const handleBack = () => setStep('form')
    const handleCancel = () => {
        resetForm()
        dialogs.close()
    }
    const handleConfirm = () => {
        const editing = target()
        if (editing) {
            patchMutation.mutate({ id: editing.id, changes: { name: name(), description: description() } })
        } else {
            postMutation.mutate({ name: name(), description: description() })
        }
    }

    // -- Open Function --
    const openAdd = () => {
        resetForm()
        dialogs.open('post')
        setStep('form')
    }
    const openPatch = (row: Minister) => {
        resetForm()
        dialogs.open('patch', row)
        setStep('form')
        setTarget(row)
        setName(row.name)
        setDescription(row.description ?? '-')
    }
    const openViewDesc = (row: Minister) => {
        resetForm()
        dialogs.open('viewDesc', row)
    }
    const openDiActive = (row: Minister) => {
        resetForm()
        dialogs.open('diActive', row)
    }
    const openDelete = (row: Minister) => {
        resetForm()
        dialogs.open('delete', row)
    }

    return {
        dialogs,
        openAdd,
        openPatch,
        openViewDesc,
        openDiActive,
        openDelete,
        form: {
            name,
            setName,
            description,
            setDescription,
            step,
            target, // for patch only
            nameChanged, // for patch only
            descriptionChanged,// for patch only
            hasChanges,// for patch only
        },
        mutations: {
            postMutation,
            patchMutation,
            diActiveMutation,
            deleteMutation
        },
        handlers: {
            handleNext,
            handleCancel,
            handleConfirm,
            handleBack,
        }
    }
}
export type MinisterDialogsController = ReturnType<typeof CreateMinisterDialog>

function ViewDescriptionDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    row?: Minister
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader class="flex items-center">
                    <DialogTitle>{props.row?.name}</DialogTitle>
                </DialogHeader>
                <div class='max-h-[4.5rem] min-w-0  whitespace-pre-wrap break-words'>
                    {props.row?.description || '-'}
                </div>
                <DialogFooter>
                    <div class='flex gap-2'>
                        <Button onClick={() => props.onOpenChange(false)} class={btnBack}>
                            Back
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
function UpsertDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    isEdit: boolean
    controller: MinisterDialogsController
}) {
    const { name, setName, description, setDescription, step, target, nameChanged, descriptionChanged, hasChanges } = props.controller.form
    const { postMutation, patchMutation } = props.controller.mutations
    const { handleNext, handleBack, handleCancel, handleConfirm } = props.controller.handlers

    const mutation = () => (props.isEdit ? patchMutation : postMutation)
    const canConfirm = () => (props.isEdit ? hasChanges() : true)

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {props.isEdit ?
                            'Edit Minister' :
                            'Add Minister'
                        }
                    </DialogTitle>
                </DialogHeader>
                <Show
                    when={step() === 'confirm'}
                    fallback={
                        <>
                            <DialogDescription>
                                Fill up form below
                            </DialogDescription>
                            <form
                                id='minister-form'
                                onSubmit={handleNext}
                                class='flex flex-col gap-4 py-2'
                            >
                                <TextField value={name()} onChange={setName}>
                                    <TextFieldLabel class="mb-1">Name</TextFieldLabel>
                                    <TextFieldInput placeholder='Minister name' required />
                                </TextField>

                                <TextField value={description()} onChange={setDescription}>
                                    <TextFieldLabel class="mb-1">Description</TextFieldLabel>
                                    <TextFieldTextArea placeholder='What this minister description' />
                                </TextField>
                            </form>
                        </>
                    }
                >
                    <>
                        <DialogDescription>Check the details before saving.</DialogDescription>
                        <div class='flex flex-col gap-2 py-2 text-left text-sm'>
                            <div class='grid grid-cols-[100px_10px_1fr] items-start'>
                                <span class='font-semibold'>Name</span>
                                <span class='font-semibold'>:</span>
                                {
                                    props.isEdit && nameChanged() ? (
                                        <div class='flex min-w-0 flex-col gap-0.5 break-normal'>
                                            <span class='text-muted-foreground line-through'>{target()?.name}</span>
                                            <span class='font-semibold text-orange-500'>{name()}</span>
                                        </div>
                                    ) : (
                                        <span class='min-w-0 break-normal'>{name()}</span>
                                    )
                                }
                            </div>
                            <div class='grid grid-cols-[100px_10px_1fr] items-start'>
                                <span class='font-semibold'>Description</span>
                                <span class='font-semibold'>:</span>
                                {
                                    props.isEdit && descriptionChanged() ? (
                                        <div class='flex max-h-[12rem] min-w-0 flex-col gap-0.5  whitespace-pre-wrap break-words'>
                                            <span class='text-muted-foreground line-through overflow-y-auto'>{target()?.description || '-'}</span>
                                            <span class='font-semibold text-orange-500 overflow-y-auto'>{description() || '-'}</span>
                                        </div>
                                    ) : (
                                        <div class='max-h-[4.5rem] min-w-0  whitespace-pre-wrap break-words'>
                                            {description() || '-'}
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <Show when={props.isEdit && !hasChanges()}>
                            <Callout>
                                <TriangleAlert color='orange' />
                                <CalloutTitle>No changes</CalloutTitle>
                                <CalloutContent>Nothing was changed from the original.</CalloutContent>
                            </Callout>
                        </Show>
                        <Show when={mutation().isError}>
                            <Callout>
                                <TriangleAlert color='red' />
                                <CalloutTitle>Error</CalloutTitle>
                                <CalloutContent>
                                    {(mutation().error as Error)?.message ?? `Failed to ${props.isEdit ? 'Edit' : 'Add'} Minister!`}
                                </CalloutContent>
                            </Callout>
                        </Show>
                    </>
                </Show>
                <DialogFooter>
                    <Show
                        when={step() === 'confirm'}
                        fallback={
                            <div class='flex gap-2'>
                                <Button onClick={handleCancel} class={btnCancel}>Cancel</Button>
                                <Button type='submit' form='minister-form' class={btnConfirm}>Continue</Button>
                            </div>
                        }
                    >
                        <div class='flex gap-2'>
                            <Button onClick={handleBack} class={btnBack} disabled={mutation().isPending}>Back</Button>
                            <Button onClick={handleConfirm} class={btnConfirm} disabled={mutation().isPending || !canConfirm()}>
                                {mutation().isPending ? 'Saving...' : 'Confirm'}
                            </Button>
                        </div>
                    </Show>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ConfirmDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmLabel: string
    isPending: boolean
    isError: boolean
    errorMessage?: string
    onConfirm: () => void
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{props.title}</DialogTitle>
                    <DialogDescription>{props.description}</DialogDescription>
                </DialogHeader>
                <Show when={props.isError}>
                    <Callout>
                        <TriangleAlert color='red' />
                        <CalloutTitle>Error</CalloutTitle>
                        <CalloutContent>{props.errorMessage ?? 'Something went wrong.'}</CalloutContent>
                    </Callout>
                </Show>
                <DialogFooter>
                    <div class='flex gap-2'>
                        <Button onClick={() => props.onOpenChange(false)} class={btnCancel} disabled={props.isPending}>
                            Cancel
                        </Button>
                        <Button onClick={props.onConfirm} class={btnConfirm} disabled={props.isPending}>
                            {props.isPending ? 'Saving...' : props.confirmLabel}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function MinisterDialog(props: {
    controller: MinisterDialogsController
}) {
    const d = props.controller.dialogs
    const { diActiveMutation, deleteMutation } = props.controller.mutations

    return (<>
        <ViewDescriptionDialog
            open={d.isOpenFor('viewDesc')}
            onOpenChange={d.setOpen}
            row={d.payload('viewDesc')}
        />
        <UpsertDialog
            open={d.isOpenFor('post') || d.isOpenFor('patch')}
            onOpenChange={d.setOpen}
            isEdit={d.isOpenFor('patch')}
            controller={props.controller}
        />
        <ConfirmDialog
            open={d.isOpenFor('diActive')}
            onOpenChange={d.setOpen}
            title={`${d.payload('diActive')?.active ? 'Disable' : 'Activate'} ${d.payload('diActive')?.name ?? ''}?`}
            description={
                d.payload('diActive')?.active
                    ? 'Users with this Minister will lose it until you activate it again.'
                    : 'This minister will become available to users again.'
            }
            confirmLabel={d.payload('diActive')?.active ? 'Disable' : 'Activate'}
            isPending={diActiveMutation.isPending}
            isError={diActiveMutation.isError}
            errorMessage={(diActiveMutation.error as Error)?.message}
            onConfirm={() => {
                const row = d.payload('diActive')
                if (row) diActiveMutation.mutate({ id: row.id, active: !row.active })
            }}
        />
        <ConfirmDialog
            open={d.isOpenFor('delete')}
            onOpenChange={d.setOpen}
            title={`Delete ${d.payload('delete')?.name ?? ''}?`}
            description='This action cannot be undone. This will permanently delete this minister data.'
            confirmLabel='Delete'
            isPending={deleteMutation.isPending}
            isError={deleteMutation.isError}
            errorMessage={(deleteMutation.error as Error)?.message}
            onConfirm={() => {
                const row = d.payload('delete')
                if (row) deleteMutation.mutate(row.id)
            }}
        />
    </>)
}
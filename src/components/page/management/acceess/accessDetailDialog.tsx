import { useQueryClient } from "@tanstack/solid-query"
import { createSignal } from "solid-js"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { createDialogController } from "~/hooks/dialogController"
import { btnBack } from "~/data/type/dialog"
import type { AccessDetail } from "~/data/type/access"

export type AccessDetailDialogMap = {
    viewDesc: AccessDetail
    viewSql: AccessDetail
}

export function CreateAccessDetailDialog() {
    const dialogs = createDialogController<AccessDetailDialogMap>()
    const queryClient = useQueryClient()

    // -- Dialog Componen --
    const [name, setName] = createSignal('')
    const [description, setDescription] = createSignal('')
    const [viewSql, setViewSql] = createSignal('')

    // -- Function Dialog --
    const resetForm = () => {
        setName('')
        setDescription('')
        setViewSql('')
    }

    // -- Open Function --
    const openViewDesc = (row: AccessDetail) => {
        resetForm()
        dialogs.open('viewDesc', row)
    }
    const openViewSql = (row: AccessDetail) => {
        resetForm()
        dialogs.open('viewSql', row)
    }

    return {
        dialogs,
        openViewDesc,
        openViewSql
    }
}

export type AccessDetailDialogController = ReturnType<typeof CreateAccessDetailDialog>

function ViewDescriptionDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    row?: AccessDetail
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader class="flex items-center">
                    <DialogTitle>Description of {props.row?.name}</DialogTitle>
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

function ViewSqlDialog(props: {
    open: boolean
    onOpenChange: (open: boolean) => void
    row?: AccessDetail
}) {
    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogHeader class="flex items-center">
                    <DialogTitle>SQL Detail of {props.row?.name}</DialogTitle>
                </DialogHeader>
                <div class='max-h-[17rem] min-w-0 overflow-y-auto  whitespace-pre-wrap break-words'>
                    {props.row?.pseudo_code || '-'}
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

export default function AccessDetailDialog(
    props: {
        controller: AccessDetailDialogController
    }
) {
    const d = props.controller.dialogs

    return (
        <>
            <ViewDescriptionDialog
                open={d.isOpenFor('viewDesc')}
                onOpenChange={d.setOpen}
                row={d.payload('viewDesc')}
            />
            <ViewSqlDialog
                open={d.isOpenFor('viewSql')}
                onOpenChange={d.setOpen}
                row={d.payload('viewSql')}
            />
        </>
    )
}
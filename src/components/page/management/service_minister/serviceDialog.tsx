import { useQueryClient } from "@tanstack/solid-query"
import { createSignal } from "solid-js"
import type { Service } from "~/data/type/service_minister"
import { createDialogController } from "~/hooks/dialogController"

export type ServiceDialogMap = {
    post: undefined
    patch: Service
    viewDesc: Service
    diActive: Service
    delete: Service
}

export function CreateServiceDialog() {
    const dialogs = createDialogController<ServiceDialogMap>()
    const queryClient = useQueryClient()

    // --- Dialog Component --
    const [target, setTarget] = createSignal<Service | null>(null)
    const [name, setName] = createSignal('')
    const [description, setDescription] = createSignal('')
    const [scheduleDay, setScheduleDay] = createSignal('')
    const [scheduleTime, setScheduleTime] = createSignal('')
    const [step, setStep] = createSignal<'form' | 'confirm'>('form')

    // -- For Update dialog only --
    // --- Function Dialog Component ---
    // --- Mutations ---
    // --- Handlers Button ---
    // -- Open Function --

    return {}
}
export type ServiceDialogsController = ReturnType<typeof CreateServiceDialog>

function a() { }

export default function ServiceDialog() {
    return (<>


    </>)
}
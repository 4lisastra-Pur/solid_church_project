import { supabase } from "~/lib/supabase"
import { limit_getDataFromDatabase, type GetSearchParams } from "~/data/type/showData"

import type { cbOptionService, Service, ServicePost, ServiceUpdate } from "~/data/type/service_minister"

// TODO: replace with real auth identity once login exists (e.g. supabase.auth.getUser())
const getCreateIdentity = async (): Promise<number> => {
    return 0
}
const identity = await getCreateIdentity()
const ACTION_FAIL = 'Action Fail'
const toError = (message?: string) => new Error(message || ACTION_FAIL)

export const getServiceCb = async (): Promise<cbOptionService[]> => {
    const { data, error } = await supabase.rpc('service_get_cb', {
        p_create_identity: identity,
    })

    if (error) throw toError(error.message)
    return data as Pick<Service, 'id' | 'name' | 'worship_scedule_day' | 'worship_scedule_time'>[]
}

export const getService = async ({
    search = '',
    pageParam = 0,
    active = null,
}: GetSearchParams): Promise<Service[]> => {
    const limit = limit_getDataFromDatabase
    const from = pageParam * limit
    const to = from + limit - 1

    const { data, error } = await supabase.rpc('service_get', {
        p_search: (search || null) as string,
        p_from: from,
        p_to: to,
        p_active: active as boolean,
        p_create_identity: identity,
    })

    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Service[]
}

export const postService = async (payload: ServicePost): Promise<Service> => {
    const { data, error } = await supabase.rpc('service_post', {
        p_payload: payload,
        p_create_identity: identity,
    })
    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Service
}

export const patchService = async (id: number, payload: ServiceUpdate): Promise<Service> => {
    const { data, error } = await supabase.rpc('service_patch', {
        p_id: id,
        p_payload: payload,
        p_create_identity: identity
    })
    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Service
}

export const diActiveService = async (id: number, active: boolean): Promise<Service> => {
    const { data, error } = await supabase.rpc('service_diactive', {
        p_id: id,
        p_active: active,
        p_create_identity: identity

    })
    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Service
}

export const deleteService = async (id: number): Promise<void> => {
    const { error } = await supabase.rpc('service_delete', {
        p_id: id,
        p_create_identity: identity
    })
    if (error) throw toError(error.message) || ACTION_FAIL
}




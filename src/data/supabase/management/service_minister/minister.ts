import { supabase } from "~/lib/supabase"
import { limit_getDataFromDatabase, type cbOption, type GetSearchParams } from "~/data/type/showData"
import type { Minister, MinisterPost, MinisterUpdate } from "~/data/type/service_minister"

// TODO: replace with real auth identity once login exists (e.g. supabase.auth.getUser())
const getCreateIdentity = async (): Promise<number> => {
    return 1
}
const identity = await getCreateIdentity()
const ACTION_FAIL = 'Action Fail'
const toError = (message?: string) => new Error(message || ACTION_FAIL)

export const getMinisterCb = async (): Promise<cbOption[]> => {
    const { data, error } = await supabase.rpc('minister_get_cb', {
        p_create_identity: identity,
    })

    if (error) throw toError(error.message)
    return data as Pick<Minister, 'id' | 'name'>[]
}

export const getMinister = async ({
    search = '',
    pageParam = 0,
    active = null,
}: GetSearchParams): Promise<Minister[]> => {
    const limit = limit_getDataFromDatabase
    const from = pageParam * limit
    const to = from + limit - 1

    const { data, error } = await supabase.rpc('minister_get', {
        p_search: (search || null) as string,
        p_from: from,
        p_to: to,
        p_active: active as boolean,
        p_create_identity: identity,
    })

    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Minister[]
}

export const postMinister = async (payload: MinisterPost): Promise<Minister> => {
    const { data, error } = await supabase.rpc('minister_post', {
        p_payload: payload,
        p_create_identity: identity,
    })
    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Minister
}

export const patchMinister = async (id: number, payload: MinisterUpdate): Promise<Minister> => {
    const { data, error } = await supabase.rpc('minister_patch', {
        p_id: id,
        p_payload: payload,
        p_create_identity: identity
    })
    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Minister
}

export const diActiveMinister = async (id: number, active: boolean): Promise<Minister> => {
    const { data, error } = await supabase.rpc('minister_diactive', {
        p_id: id,
        p_active: active,
        p_create_identity: identity

    })
    if (error) throw toError(error.message) || ACTION_FAIL
    return data as Minister
}

export const deleteMinister = async (id: number): Promise<void> => {
    const { error } = await supabase.rpc('minister_delete', {
        p_id: id,
        p_create_identity: identity
    })
    if (error) throw toError(error.message) || ACTION_FAIL
}




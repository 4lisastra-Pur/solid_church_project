import { supabase } from "~/lib/supabase"
import { limit_getDataFromDatabase, type cbOption, type GetSearchParams } from "~/data/type/showData"
import type { Access, AccessPost, AccessUpdate } from "~/data/type/access"

// TODO: replace with real auth identity once login exists (e.g. supabase.auth.getUser())
const getCreateIdentity = async (): Promise<number> => {
    return 0
}
const ACTION_FAIL = new Error('Action Fail')


export const getAccess = async ({
    search = '',
    pageParam = 0,
    active = null,
}: GetSearchParams): Promise<Access[]> => {
    const identity = await getCreateIdentity()
    const limit = limit_getDataFromDatabase
    const from = pageParam * limit
    const to = from + limit - 1


    const { data, error } = await supabase.rpc('access_get', {
        p_search: (search || null) as string,
        p_from: from,
        p_to: to,
        p_active: active as boolean,
        p_create_identity: identity,
    })

    if (error) throw ACTION_FAIL
    return data as Access[]
}

export const getAccessCb = async (): Promise<cbOption[]> => {
    const identity = await getCreateIdentity()

    const { data, error } = await supabase.rpc('access_get_cb', {
        p_create_identity: identity,
    })

    if (error) throw ACTION_FAIL

    return data as Pick<Access, 'id' | 'name'>[]
}

export const postAccess = async (payload: AccessPost): Promise<Access> => {
    const identity = await getCreateIdentity()
    const { data, error } = await supabase.rpc('access_post', {
        p_payload: payload,
        p_create_identity: identity,
    })
    if (error) throw ACTION_FAIL
    return data as Access
}

export const patchAccess = async (id: number, payload: AccessUpdate): Promise<Access> => {
    const identity = await getCreateIdentity()

    const { data, error } = await supabase.rpc('access_patch', {
        p_id: id,
        p_payload: payload,
        p_create_identity: identity
    })
    if (error) throw ACTION_FAIL
    return data as Access
}

export const diActiveAccess = async (id: number, active: boolean): Promise<Access> => {
    const identity = await getCreateIdentity()

    const { data, error } = await supabase.rpc('access_diactive', {
        p_id: id,
        p_active: active,
        p_create_identity: identity

    })

    if (error) throw ACTION_FAIL

    return data as Access
}

export const deleteAccess = async (id: number): Promise<void> => {
    const identity = await getCreateIdentity()

    const { error } = await supabase.rpc('access_delete', {
        p_id: id,
        p_create_identity: identity
    })
    if (error) throw ACTION_FAIL
}




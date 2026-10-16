import { supabase } from "~/lib/supabase"
import { limit_getDataFromDatabase, type GetSearchParams } from "~/data/type/showData"
import type { AccessList, AccessListMutate } from "~/data/type/access"

// TODO: replace with real auth identity once login exists (e.g. supabase.auth.getUser())
const getCreateIdentity = async (): Promise<number> => {
    return 0
}
const identity = await getCreateIdentity()
const ACTION_FAIL = 'Action Fail'
const toError = (message?: string) => new Error(message || ACTION_FAIL)

export const getAccessList = async ({
    search = '',
    pageParam = 0,
}: GetSearchParams): Promise<AccessList[]> => {
    const limit = limit_getDataFromDatabase
    const from = pageParam * limit
    const to = from + limit - 1

    const { data, error } = await supabase.rpc('access_list_get', {
        p_search: (search || null) as string,
        p_from: from,
        p_to: to,
        p_create_identity: identity,
    })

    if (error) throw toError(error.message) || ACTION_FAIL
    return (data ?? []).map((row) => row.result as unknown as AccessList)
}

export const postAccessList = async (
    data: AccessListMutate
): Promise<void> => {
    const { error } = await supabase.rpc('access_list_post', {
        p_access: data.idAccess,
        p_access_detail: data.idAccessDetail,
        p_create_identity: identity
    })
    if (error) throw new Error(error.message) || ACTION_FAIL
}

export const deleteAccessList = async (
    data: AccessListMutate
): Promise<void> => {
    const { error } = await supabase.rpc('access_list_delete', {
        p_access: data.idAccess,
        p_access_detail: data.idAccessDetail,
        p_create_identity: identity
    })
    if (error) throw new Error(error.message) || ACTION_FAIL
}
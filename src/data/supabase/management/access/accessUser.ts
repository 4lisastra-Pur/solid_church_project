
import { limit_getDataFromDatabase, type GetSearchParams } from "~/data/type/showData"
import { supabase } from "~/lib/supabase"
import type { AccessUser, AccessUserMutate } from "~/data/type/access"

const getCreateIdentity = async (): Promise<number> => {
    return 0
}

const identity = await getCreateIdentity()
const ACTION_FAIL = 'ACTION_FAIL'
const toError = (message?: string) => new Error(message || ACTION_FAIL)

export const getAccessUser = async ({
    search = '',
    pageParam = 0,
}: GetSearchParams): Promise<AccessUser[]> => {
    const limit = limit_getDataFromDatabase
    const from = pageParam * limit
    const to = from + limit - 1

    const { data, error } = await supabase.rpc('access_user_get', {
        p_search: (search || null) as string,
        p_from: from,
        p_to: to,
        p_create_identity: identity,
    })

    if (error) throw toError(error.message)
    return (data ?? []).map((row) => row.result as unknown as AccessUser)
}

export const postAccessUser = async (
    data: AccessUserMutate
): Promise<void> => {
    const { error } = await supabase.rpc('access_user_post', {
        p_user: data.idUser,
        p_access: data.idAccess,
        p_create_identity: identity
    })
    if (error) throw new Error(error.message) || ACTION_FAIL
}

export const deleteAccessUser = async (
    data: AccessUserMutate
): Promise<void> => {
    const { error } = await supabase.rpc('access_user_delete', {
        p_user: data.idUser,
        p_access: data.idAccess,
        p_create_identity: identity
    })
    if (error) throw new Error(error.message) || ACTION_FAIL
}


import type { Session } from "@supabase/supabase-js"
import { supabase } from "~/lib/supabase"


// -- preparing data --
type UserPassAuth = {
    nij: string
    password: string
}
const emailFromNij = (nij: string) => `${nij}@church.com`
const getActiveUserId = async (nij: string): Promise<{ id: number; fullName: string }> => {
    const { data, error } = await supabase
        .from('church_user')
        .select('id, active, full_name')
        .eq('nij', nij)
        .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw new Error('NIJ not registered')
    if (!data.active) throw new Error('Your NIJ is not active')
    return { id: data.id, fullName: data.full_name }
}


// -- SING UP --
export const signUpPassword = async (user: UserPassAuth): Promise<void> => {
    // 1. must be a registered, active NIJ before anything else happens
    const { id: churchUserId, fullName } = await getActiveUserId(user.nij)

    // 2. create the login
    const { data, error } = await supabase.auth.signUp({
        email: emailFromNij(user.nij),
        password: user.password,
        options: {
            data: {
                display_name: fullName,
            }
        }
    })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('No user returned from SignUp')

    // 3. link this login (uid) to the church member (user_id)
    const { error: linkError } = await supabase
        .from('church_user_account')
        .insert({
            user_id: churchUserId,
            uid: data.user.id,
            create_id: 0,
        })

    if (linkError) throw new Error(linkError.message)
}

// -- SING IN --
export const signInPassword = async (user: UserPassAuth): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
        email: emailFromNij(user.nij),
        password: user.password,
    })
    if (error) throw new Error(error.message)
}

export const signInGmail = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
                prompt: 'select_account'
            }
        },
    })
    if (error) throw new Error('Fail to SignIn with Gmail')
}

export const complateGmailSignIn = async (): Promise<Session | null> => {
    // 1. finish reading the session Google/Supabase just created
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new Error(error.message)
    if (!data.session) throw new Error('No session found after Google sign-in.')

    const session = data.session
    const email = session.user.email

    if (!email) {
        await supabase.auth.signOut()
        throw new Error('Google account has no email')
    }

    // 2. check this email is expected in church_user_account
    const { data: account, error: lookupError } = await supabase
        .from('church_user_account')
        .select('id')
        .eq('email', email)
        .maybeSingle()

    if (lookupError) throw new Error(lookupError.message)

    if (!account) {
        await supabase.auth.signOut()
        throw new Error('User not Registered')
    }

    // 3. attach this login's uid to that row
    const { error: updateError } = await supabase
        .from('church_user_account')
        .update({ uid: session.user.id })
        .eq('id', account.id)

    if (updateError) {
        await supabase.auth.signOut()
        throw new Error(updateError.message)
    }
    return session
}

export const getCurrentSession = async (): Promise<Session | null> => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
}

export const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error('Fail to SignOut')
}

// export const completeGmailLink = async (): Promise<Session | null> => {
//     // 1. did Supabase/Google send back an error?
//     const params = new URLSearchParams(window.location.search)
//     const oauthError = params.get('error_description')
//     if (oauthError) throw new Error(oauthError)

//     // 2. getSession waits for the client to finish the code exchange
//     const { data, error } = await supabase.auth.getSession()
//     if (error) throw new Error(error.message)
//     if (!data.session) throw new Error('No session found after Google sign-in.')

//     // 3. is this login linked to a church member?
//     const { data: member, error: rpcError } = await supabase.rpc('whoami')
//     console.log('google uid:', data.session.user.id)
//     if (rpcError) throw new Error(rpcError.message)
//     if (!member?.length) {
//         await supabase.auth.signOut()
//         throw new Error('This Google account is not linked to a church member.')
//     }

//     localStorage.removeItem(PENDING_NIJ_KEY)
//     return data.session
// }

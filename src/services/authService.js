import { supabase } from "../lib/SupabaseClient";

export async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    return data.user;
}

export async function logout() {
    await supabase.auth.signOut();
}

export async function getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
}

export async function getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
}

// Check user role (super_admin, admin, agent, worker, borrower)
export async function getUserRole() {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_id', user.id)
        .single();

    if (error) return null;

    return data.role;
}
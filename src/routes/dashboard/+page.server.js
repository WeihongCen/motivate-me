import { redirect } from '@sveltejs/kit';

export const actions = {
    signout: async ({ request, locals: { supabase } }) => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error(error);
            redirect(303, '/auth/error');
        } else {
            redirect(303, '/');
        }
    },
}

export const load = async ({ locals: { supabase, user } }) => {
    try {
        if (user) {
            let response = await supabase
                .from('profiles')
                .select('id, username, avatar_url, occupation')
                .eq('id', user.id);
            return { username: response.data[0].username, occupation: response.data[0].occupation };
        } else {
            return { username: null, occupation: null };
        }
    } catch (error) {
        console.log(error.message);
        return { username: null, occupation: null };
    }
};
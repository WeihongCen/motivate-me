import { redirect } from '@sveltejs/kit';

export const actions = {
    signOut: async ({ request, locals: { supabase } }) => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error(error);
            redirect(303, '/auth/error');
        } else {
            redirect(303, '/auth');
        }
    },
}
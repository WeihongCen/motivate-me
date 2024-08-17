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

export const load = async ({ locals: { supabase } }) => {
    let response = await fetch(`/api/getProfile`, {
        method: "GET"
    })
        .then(res => res.json());
    let username = response.userData.username;
    let occupation = response.userData.occupation;

    return { username, occupation };
};
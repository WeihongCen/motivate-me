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
    if (!user) {
        redirect(303, '/login');  // Redirect to login if no user
    }

    try {
        let response = await supabase
            .from('profiles')
            .select('id, username, avatar_url, occupation')
            .eq('id', user.id)
            .single();

        if (response.error) throw response.error;

        let username = response.data.username;
        if (!username) {
            // If no username, use the first part of the email
            username = user.email.split('@')[0];
            // Update the profile with this username
            await supabase
                .from('profiles')
                .update({ username })
                .eq('id', user.id);
        }

        return { 
            user,
            username,  // This is the actual username, not the email
            occupation: response.data.occupation,
            avatar_url: response.data.avatar_url
        };
    } catch (error) {
        console.error('Error loading user data:', error);
        // Even in case of error, provide the username (not email)
        return { 
            user,
            username: user.email.split('@')[0],  // Fallback to email username if error
            occupation: null,
            avatar_url: null
        };
    }
};
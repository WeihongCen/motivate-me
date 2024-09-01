import { redirect } from '@sveltejs/kit';

export const load = async ({ locals: { supabase, user } }) => {
    if (!user) {
        redirect(303, '/login');
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
            username = user.email.split('@')[0];
            await supabase
                .from('profiles')
                .update({ username })
                .eq('id', user.id);
        }

        return { 
            user,
            username,
            occupation: response.data.occupation,
            avatar_url: response.data.avatar_url
        };
    } catch (error) {
        console.error('Error loading user data:', error);
        return { 
            user,
            username: user.email.split('@')[0],
            occupation: null,
            avatar_url: null
        };
    }
};
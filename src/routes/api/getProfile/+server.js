import { json } from '@sveltejs/kit';

export const GET = async ({ request, locals: { supabase, user } }) => {
    try {
        let response;
        if (user) {
            response = await supabase
                .from('profiles')
                .select('id, username, avatar_url, occupation')
                .eq('id', user.id);
        } else {
            response = null;
        }
        return json({ userData: response.data[0] });
    } catch (error) {
        console.log(error.message);
        throw new Error("Failed to update profile.");
    }
}
import { json } from '@sveltejs/kit';

export const POST = async ({ request, locals: { supabase } }) => {
    try {
        const { id, username, occupation } = await request.json();
        await supabase
            .from('profiles')
            .update({ 
                username: username,
                occupation: occupation,
            })
            .eq('id', id);
        return json({ status: "success" });
    } catch (error) {
        console.log(error.message);
        throw new Error("Failed to update profile.");
    }
}
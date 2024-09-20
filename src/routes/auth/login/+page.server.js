import { redirect } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const actions = {
    login: async ({ request, locals: { supabase }, url }) => {
        const provider = url.searchParams.get("provider");
        if (provider) {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider
            });
            if (error) {
                console.error(error);
                redirect(303, '/auth/login?error=Incorrect%20username%20or%20password');
            } else {
                redirect(303, data.url);
            }
        }

        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error(error);
            redirect(303, '/auth/login?error=Incorrect%20username%20or%20password');
        } else {
            redirect(303, '/dashboard');
        }
    },
}
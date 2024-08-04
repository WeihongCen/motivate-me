import { redirect } from '@sveltejs/kit';

export const actions = {
    signup: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');
        const username = formData.get('username');

        const { error } = await supabase.auth.signUp({ 
            email: email, 
            password: password ,
            options: {
                data: {
                    email: email,
                    username: username,
                }
            }
        });
        if (error) {
            console.error(error);
            redirect(303, '/auth/error');
        } else {
            redirect(303, '/auth');
        }
    },
    login: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            console.error(error);
            redirect(303, '/auth/error');
        } else {
            redirect(303, '/dashboard');
        }
    },
}
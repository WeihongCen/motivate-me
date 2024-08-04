import { redirect } from '@sveltejs/kit';

export const actions = {
    signup: async ({ request, locals: { supabase } }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        const { error } = await supabase.auth.signUp({ 
            email: email, 
            password: password,
            options: {
                data: {
                    email: email,
                }
            }
        });
        if (error) {
            console.error("Sign up error: " + error);
            redirect(303, '/auth/signup?error=An%20error%20occurred');
        } else {
            redirect(303, '/auth/signup?message=A%20confirmation%20email%20has%20been%20sent%20to%20your%20email.');
        }
    },
}
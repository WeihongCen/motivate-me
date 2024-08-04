import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js'
import { 
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_KEY
} from '$env/static/public';

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);

export const POST = async ({ request }) => {
    try {
        const { email } = await request.json();
        
        if (search === "") {
            const { data, error } = await supabase.rpc('get_random_templates')
            return json(data);
        } else {
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: search,
                encoding_format: "float",
            });
            const { data, error } = await supabase
                .rpc('get_relevant_templates', {search_embedding: embedding.data[0].embedding})
            return json(data);
        }
    } catch (error) {
        console.log(error.message);
        throw new Error("Failed to get meme templates.");
    }
}
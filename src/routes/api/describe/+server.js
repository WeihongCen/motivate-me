import { json } from '@sveltejs/kit';
import Anthropic from "@anthropic-ai/sdk";
import { 
    ANTHROPIC_API_KEY,
} from '$env/static/private';

const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});


export const POST = async ({ request }) => {
    try {
        const msg = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 100,
            temperature: 0,
            system: "You will be analyzing a desktop screenshot to describe what the user is doing in under 20 words.",
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": "<base64_encoded_image>"
                            }
                        }
                    ]
                }
            ]
        });

        
    } catch (error) {
        console.log(error.message);
        return json({ error: error.message }, { status: 400 });
    }
}
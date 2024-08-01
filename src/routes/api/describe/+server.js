import { json } from '@sveltejs/kit';
import Anthropic from "@anthropic-ai/sdk";
import { 
    ANTHROPIC_API_KEY,
} from '$env/static/private';

const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});

function getBase64Data(base64Url) {
    // Extract the MIME type from the data URL
    const mimeType = base64Url.match(/^data:(.*);base64,/)[1];
    const imageData = base64Url.replace(/^data:image\/[a-z]+;base64,/, '');
    return { mimeType, imageData };
}

export const POST = async ({ request }) => {
    try {
        const { snapshots } = await request.json();
        const { mimeType, imageData } = getBase64Data(base64URL);
        const res = await anthropic.messages.create({
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
                                "media_type": mimeType,
                                "data": imageData
                            }
                        }
                    ]
                }
            ]
        });
        console.log(res);
        return json(res.content[0].text);
        
    } catch (error) {
        console.log(error.message);
        return json({ error: error.message }, { status: 400 });
    }
}
import { json } from '@sveltejs/kit';
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { 
    ANTHROPIC_API_KEY,
    OPENAI_API_KEY,
} from '$env/static/private';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
});

function getBase64Data(base64Url) {
    // Extract the MIME type from the data URL
    const mimeType = base64Url.match(/^data:(.*);base64,/)[1];
    const imageData = base64Url.replace(/^data:image\/[a-z]+;base64,/, '');
    return { mimeType, imageData };
}

async function anthropicModel(prompt, imageURL, mostFrequentTitle) {
    const { mimeType, imageData } = getBase64Data(imageURL);
    const res = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        temperature: 0,
        messages: [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": mimeType,
                            "data": imageData
                        }
                    },
                    {
                        "type": "text",
                        "text": mostFrequentTitle
                    }
                ]
            }
        ]
    });
    return json(JSON.parse(res.content[0].text));
}

export const POST = async ({ request, locals: { supabase, user } }) => {
    try {
        const { focusedWindowTitle, focusedWindowScreenshot } = await request.json();
        let occupation = "";
        if (user) {
            let response = await supabase
                .from('profiles')
                .select('id, username, avatar_url, occupation')
                .eq('id', user.id);
            occupation = response.data[0].occupation;
        }

        const prompt = `
            Describe what the user is doing using a screenshot and the name of the window.  
            Be specific and don't preface with "The user is".
            In addition, determine if the user is productive or not based on their occupation.

            Window name: ${focusedWindowTitle}
            User occupation: ${occupation}

            Return in JSON format.

            Example response:
            { "productive": true, "description": "Writing and editing JavaScript code. Working on a function that generates a JSON response based on user input and occupation." }
            `;
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { 
                    role: "user", 
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: focusedWindowScreenshot,
                                detail: "low"
                            }
                        },
                    ]
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 300,
        });
        return json(response.choices[0].message.content);
    } catch (error) {
        console.log(error.message);
        return json({ error: error.message }, { status: 400 });
    }
}
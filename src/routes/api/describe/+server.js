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

function findMostFrequentWindowSnapshot(data) {
    const windowTitleCount = {};
    const latestURL = {};

    // Iterate through the data to count frequencies and store the latest URL
    data.forEach(item => {
        const { 
            focusedWindowTitle,
            focusedWindowIcon,
            base64URL,
            startTime,
            endTime,
        } = item;

        // Update the count for each title
        if (windowTitleCount[focusedWindowTitle]) {
            windowTitleCount[focusedWindowTitle]++;
        } else {
            windowTitleCount[focusedWindowTitle] = 1;
        }

        // Update the latest URL for the current title
        latestURL[focusedWindowTitle] = base64URL;
    });
    let mostFrequentTitle = null;
    let maxCount = 0;
    for (const title in windowTitleCount) {
        if (windowTitleCount[title] > maxCount) {
            maxCount = windowTitleCount[title];
            mostFrequentTitle = title;
        }
    }

    // Get the latest URL for the most frequent title
    const resultURL = latestURL[mostFrequentTitle];

    return { mostFrequentTitle, resultURL };
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

export const POST = async ({ request }) => {
    try {
        const { snapshots, occupation } = await request.json();
        const { mostFrequentTitle, resultURL } = findMostFrequentWindowSnapshot(snapshots);
        let prompt = `
            Describe what the user is doing using a screenshot and the name of the window.
            Keep your answer concise.
            In addition, determine if the user is productive or not based on their occupation.

            User occupation: ${occupation}

            Return in JSON format: { "productive": "true", "description": "short description" }
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
                                url: resultURL,
                                detail: "low"
                            }
                        },
                        {
                            type: "text",
                            text: mostFrequentTitle
                        },
                    ]
                },
            ],
            response_format: { type: "json_object" },
            max_tokens: 200,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.log(error.message);
        return json({ error: error.message }, { status: 400 });
    }
}
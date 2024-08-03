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

function findMostFrequentWindowSnapshot(data) {
    const windowTitleCount = {};
    const latestURL = {};

    // Iterate through the data to count frequencies and store the latest URL
    data.forEach(item => {
        const { focusedWindowTitle, base64URL } = item;

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

export const POST = async ({ request }) => {
    try {
        const { snapshots } = await request.json();
        const { mostFrequentTitle, resultURL } = findMostFrequentWindowSnapshot(snapshots)

        const { mimeType, imageData } = getBase64Data(resultURL);
        const res = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 100,
            temperature: 0,
            system: `
            Describe what the user is doing using a screenshot and the name of the window.
            Keep your answer concise.
            `,
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
                        },
                        {
                            "type": "text",
                            "text": mostFrequentTitle
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
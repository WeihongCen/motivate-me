import { json } from '@sveltejs/kit';
import { jwtVerify } from "jose";
import { HIGHLIGHT_JWT_SIGNING_KEY } from '$env/static/private';

export const POST = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = authHeader.replace('Bearer ', '');
        await jwtVerify(token, new TextEncoder().encode(HIGHLIGHT_JWT_SIGNING_KEY));
        return json({ status: "success" });
    } catch (error) {
        console.log(error.message);
        return json({ status: "failure" });
    }
}
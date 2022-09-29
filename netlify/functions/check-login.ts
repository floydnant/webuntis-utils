import { handleRequest } from 'netlify/http-helpers';
import { loginUntis, parseCredentials } from 'netlify/webuntis/auth';

export const handler = handleRequest(async (event) => {
    const credentials = parseCredentials(event.body);

    return await loginUntis(credentials, async () => ({
        message: 'Login successful',
    }));
});

import { HttpError } from 'netlify/http-helpers';
import WebUntisType from 'webuntis';
const WebUntis = require('webuntis');

export interface UntisCredentials {
    school: string;
    username: string;
    password: string;
    serverUrl: string;
}

export const parseCredentials = (body: any) => {
    const credentials: UntisCredentials = JSON.parse(body || '{}');

    if (!credentials.username)
        throw new HttpError(400, 'You must provide a username');
    if (!credentials.password)
        throw new HttpError(400, 'You must provide a password');
    if (!credentials.school)
        throw new HttpError(400, 'You must provide a schoolname');
    if (!credentials.serverUrl)
        throw new HttpError(400, 'You must provide a server url');

    return credentials;
};

export const loginUntis = async <T>(
    { school, username, password, serverUrl }: UntisCredentials,
    callback: (untis: WebUntisType) => Promise<T>
) => {
    const untis = new WebUntis(
        school,
        username,
        password,
        serverUrl
    ) as WebUntisType;

    try {
        await untis.login();
        const result = await callback(untis);
        untis.logout();

        return result;
    } catch (err) {
        const error = err as Error;

        if (/bad credentials/.test(error.message))
            throw new HttpError(401, 'Username or password is incorrect');

        if (/invalid schoolname/.test(error.message))
            throw new HttpError(400, 'Schoolname is invalid');

        if (/getaddrinfo ENOTFOUND/.test(error.message))
            throw new HttpError(400, 'Server url is invalid');

        // check again if server url is invalid // we probably won't need this, but let's keep it for now
        // const isServerUrlValid = await axios
        //     .get(`https://${credentials.serverUrl.replace(/https?:\/\//, '')}`)
        //     .then(() => true)
        //     .catch(() => false);
        // if (!isServerUrlValid)
        //     throw new HttpError(406, 'Server url is invalid');

        console.error(error);

        throw new HttpError(500, 'Something unexpected went wrong');
    }
};

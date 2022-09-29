import { Handler } from '@netlify/functions';
import { Context } from '@netlify/functions/dist/function/context';
import { Event } from '@netlify/functions/dist/function/event';
import { Response } from '@netlify/functions/dist/function/response';

export class HttpError {
    constructor(public statusCode: number, message: string) {
        this.body = JSON.stringify({
            statusCode,
            message,
        });
    }
    body: string;
    headers = {
        'Content-Type': 'application/json',
    };
}

export const handleReponse = async (responseData: () => Promise<Response>) => {
    try {
        const res = await responseData();
        return {
            statusCode: 200,
            body: JSON.stringify(res),
            headers: {
                'Content-Type': 'application/json',
            },
        };
    } catch (err) {
        if (err instanceof HttpError) return err;

        console.error(err);
        return new HttpError(500, 'Internal Server Error');
    }
};

export const handleRequest = (
    handler: (event: Event, context: Context) => any
): Handler => {
    return (event, context) =>
        handleReponse(async () => handler(event, context));
};

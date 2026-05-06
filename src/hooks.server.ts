import { jwtVerify } from 'jose';
import type { Handle } from '@sveltejs/kit';
import { error } from 'node:console';
import { PRIVATE_JWT_KEY } from '$env/static/private'
import { PUBLIC_API_URL } from '$env/static/public'

const JWT_SECRET = new TextEncoder().encode(PRIVATE_JWT_KEY);


export const handle: Handle = async ({ event, resolve }) => {
    const accessToken = event.cookies.get('access_token');
    const refreshToken = event.cookies.get('refresh_token');

    event.locals.auth_data = null;
    if (accessToken) {
        try {
            const { payload } = await jwtVerify(accessToken, JWT_SECRET, {
                issuer: 'srd-lab-creative'
            });

            event.locals.auth_data = {
                user_id: payload.user_id as string,
                role: payload.role as 'ADMIN' | 'USER'
            };
        } catch (err) {
            console.log(err)
        }
    }

    if (!event.locals.auth_data && refreshToken) {
        try {
            console.warn("MINTA REFRES SESSION KE SERVER")
            const response = await fetch(`${PUBLIC_API_URL}/auth/refresh-session`, {
                headers: {
                    cookie: event.request.headers.get('cookie') ?? ''
                }
            });

            if (response.status === 200) {
                const resData = await response.json();
                const authData = resData.data;

                event.cookies.set('access_token', authData.access_token, {
                    path: '/',
                    httpOnly: true,
                    sameSite: 'lax',
                    secure: false,
                });

                const { payload } = await jwtVerify(authData.access_token, JWT_SECRET, {
                    issuer: 'srd-lab-creative'
                });

                event.locals.auth_data = {
                    user_id: payload.user_id as string,
                    role: payload.role as 'ADMIN' | 'USER'
                };
                console.log("YESSS UDAH BERHASIL SET COOKIE")
            }
        } catch (err) {
            event.locals.auth_data = null;
            console.log(err)

        }
    }






    return resolve(event);
};
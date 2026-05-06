import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_API_URL } from "$env/static/public"

export const GET: RequestHandler = async ({ cookies, fetch }) => {
	const accessToken = cookies.get('access_token');

	if (!accessToken) {
		throw redirect(302, '/login');
	}

	try {
		const res = await fetch(`${PUBLIC_API_URL}/user/my-profile`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json'
			}
		});

		const raw = await res.text();

		let data: any;
		try {
			data = raw ? JSON.parse(raw) : null;
		} catch {
			data = { error: raw || 'Invalid JSON response' };
		}

		if (!res.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					error: data?.error ?? data ?? 'Unknown error'
				}),
				{
					status: res.status,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				data: data?.data ?? data ?? null
			}),
			{
				headers: { 'Content-Type': 'application/json' }
			}
		);

	} catch (err) {
		console.error('MY PROFILE ERROR:', err);

		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

export const PATCH: RequestHandler = async ({ cookies, fetch, request }) => {
	const accessToken = cookies.get("access_token");

	if (!accessToken) {
		throw redirect(302, "/login");
	}

	try {
		const body = await request.json();

		const res = await fetch(`${PUBLIC_API_URL}/user/update-my-profile`, {
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json"
			},
			body: JSON.stringify(body)
		});

		let data: any;
		try {
			data = await res.json();
		} catch {
			data = { error: await res.text() };
		}

		if (!res.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					error: data.error ?? data
				}),
				{
					status: res.status,
					headers: { "Content-Type": "application/json" }
				}
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: "Profile updated successfully",
				data: data?.data ?? null
			}),
			{
				headers: { "Content-Type": "application/json" }
			}
		);
	} catch (err) {
		return new Response(
			JSON.stringify({
				success: false,
				error: "Internal server error"
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" }
			}
		);
	}
};
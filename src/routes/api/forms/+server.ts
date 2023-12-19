import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	let res = await fetch('http://localhost:8000/forms', {
		method: 'GET',
		headers: {
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Headers': '*'
		}
	});

	return res;
}

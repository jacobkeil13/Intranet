import { db } from "$lib/server/database";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  let res = await fetch("https://tup-ofa.forest.usf.edu/finaid/fivenine?apiKey=API_KEY", {
    method: "GET",
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*'
    }
  });

  // If the response isn't ok (like a 404 or 500 status), throw an error
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  return res;  // Return the parsed data
}
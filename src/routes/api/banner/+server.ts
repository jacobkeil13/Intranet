import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  let res = await fetch("https://tup-ofa.forest.usf.edu/banner/get_user?uid=" + url.searchParams.get("uid"), {
    method: "GET",
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    }
  });
  
  return res;
}

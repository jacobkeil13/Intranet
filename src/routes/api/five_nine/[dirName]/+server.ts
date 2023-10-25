import { db } from "$lib/server/database";
import { json } from "@sveltejs/kit";

export async function GET({ params }) {
  let res = await fetch("https://tup-ofa.forest.usf.edu/finaid/fivenine/" + params.dirName + "?apiKey=API_KEY", {
    method: "GET",
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
    }
  });
  
  return res;
}

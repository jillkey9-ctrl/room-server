import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const rooms = new Map();

const handler = async (req) => {
  const url = new URL(req.url);
  
  if (url.pathname === "/create" && req.method === "POST") {
    const body = await req.json();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    rooms.set(code, {
      ip: body.ip,
      time: Date.now()
    });
    setTimeout(() => rooms.delete(code), 60000);
    return new Response(JSON.stringify({ code }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  
  if (url.pathname === "/join" && req.method === "POST") {
    const body = await req.json();
    const room = rooms.get(body.code);
    if (room) {
      rooms.delete(body.code);
      return new Response(JSON.stringify({ ip: room.ip }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Room not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  return new Response("Not found", { status: 404 });
};

serve(handler, { port: 8000 });

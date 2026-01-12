import { serve } from "bun";
import index from "./index.html";

const server = serve({
    routes: {
        "/placeholder.webp": new Response(Bun.file("public/placeholder.webp")),
        "/placeholder.png": new Response(Bun.file("public/placeholder.png")),
        "/*": index,
    },
    development: process.env.NODE_ENV !== "production" && {
        hmr: true,
        console: true,
    },
});

console.log(`Server running at ${server.url}`);

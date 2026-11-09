// Static asset worker for Freebuff Sites.
// The Vite build output lives in ./dist and is served by env.ASSETS; spa:true in
// the manifest gives client-side routing fallback to index.html.
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    const url = new URL(request.url);
    // Fall back to the SPA shell for extensionless paths only.
    if (url.pathname.includes('.')) return response;

    const shell = new URL('/index.html', url);
    return env.ASSETS.fetch(new Request(shell.toString(), request));
  },
};

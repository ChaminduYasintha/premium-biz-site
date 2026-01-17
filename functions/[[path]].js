/**
 * Cloudflare Pages Function to handle catch-all routing for property detail pages
 * This ensures all /property/* paths are served by the same page
 * 
 * The function intercepts requests to /property/{uuid} and rewrites them to /property/index/index.html
 * The browser URL stays the same, so client-side JavaScript can extract the property ID
 */
export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Check if this is a property detail page (UUID pattern)
  // Match pattern: /property/{uuid} where uuid is 36 characters with hyphens (standard UUID format)
  const propertyMatch = pathname.match(/^\/property\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i);
  
  if (propertyMatch) {
    // This is a property detail page with a UUID
    // Rewrite the request to serve /property/index/index.html
    // The original URL is preserved in the browser, so client-side JS can read it
    url.pathname = '/property/index/index.html';
    
    // Create a new request with the rewritten path
    const rewrittenRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Continue processing with the rewritten request
    // This will serve the /property/index/index.html file
    return context.next(rewrittenRequest);
  }

  // For all other paths, continue normally
  return context.next();
}


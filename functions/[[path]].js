/**
 * Cloudflare Pages Function to handle catch-all routing for property detail pages
 * This ensures all /property/* paths are served by the same page
 * 
 * The function rewrites requests to /property/* (except /property/index) 
 * to serve /property/index.html, which then uses client-side JavaScript
 * to extract the property ID from the original URL and load the data.
 */
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Check if this is a property detail page (not index or placeholder)
  const isPropertyDetail = pathname.startsWith('/property/') && 
                          pathname !== '/property/index' && 
                          pathname !== '/property/placeholder' &&
                          pathname !== '/property/index.html' &&
                          !pathname.endsWith('.html');

  if (isPropertyDetail) {
    // Rewrite the URL to serve /property/index.html
    // The browser URL stays the same, so client-side JS can read the property ID
    url.pathname = '/property/index.html';
    
    // Create a new request with the rewritten path
    const rewrittenRequest = new Request(url, context.request);
    
    // Continue processing with the rewritten request
    return context.next(rewrittenRequest);
  }

  // For all other paths, continue normally
  return context.next();
}


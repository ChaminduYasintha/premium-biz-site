import type { MiddlewareHandler } from 'astro';

// Simple authentication middleware for admin routes
export const onRequest: MiddlewareHandler = async ({ url, cookies, redirect }, next) => {
    // Check if accessing admin routes
    if (url.pathname.startsWith('/admin')) {
        // Allow login page
        if (url.pathname === '/admin/login') {
            return next();
        }

        // Check authentication
        const authToken = cookies.get('admin_auth')?.value;
        const adminPassword = import.meta.env.ADMIN_PASSWORD || 'admin123';

        if (authToken !== adminPassword) {
            return redirect('/admin/login');
        }
    }

    return next();
};

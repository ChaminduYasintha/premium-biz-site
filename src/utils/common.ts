/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove non-word chars
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/--+/g, '-') // Replace multiple - with single -
        .trim();
}

/**
 * Converts a Google Drive "Open ID" link to an optimized Cloudinary Fetch URL
 */
export function getOptimizedImage(driveUrl: string, cloudName: string): string {
    if (!driveUrl || !cloudName) {
        return "/placeholder.jpg"; // Fallback image
    }

    // Extract ID from various Google Drive URL formats
    let fileId = "";

    if (driveUrl.includes("open?id=")) {
        const match = driveUrl.match(/[?&]id=([^&]+)/);
        fileId = match ? match[1] : "";
    }
    else if (driveUrl.includes("/file/d/")) {
        const match = driveUrl.match(/\/file\/d\/([^/]+)/);
        fileId = match ? match[1] : "";
    }
    else if (driveUrl.includes("uc?id=")) {
        const match = driveUrl.match(/[?&]id=([^&]+)/);
        fileId = match ? match[1] : "";
    } else {
        fileId = driveUrl;
    }

    if (!fileId) {
        return "/placeholder.jpg";
    }

    const driveDirectUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,w_600/${encodeURIComponent(driveDirectUrl)}`;

    return cloudinaryUrl;
}

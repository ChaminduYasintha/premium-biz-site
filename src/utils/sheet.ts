export interface SheetItem {
    id?: string;
    name?: string;
    subtitle?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    category?: string;
    featured?: string;
    date?: string;
}

export interface Service {
    title?: string;
    duration?: string;
    price?: string;
    description?: string;
    icon?: string;
    imageUrl?: string;
    features?: string;
}

export interface Testimonial {
    name?: string;
    role?: string;
    company?: string;
    rating?: string;
    content?: string;
    avatarUrl?: string;
}

export interface PortfolioItem {
    title?: string;
    client?: string;
    link?: string;
    tags?: string;
    category?: string;
    imageUrl?: string;
    description?: string;
}

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
    if (!driveUrl) {
        return "/placeholder.jpg"; // Fallback image
    }

    // DEBUG LOG: See what image URL we are processing
    console.log(`🖼️ Processing image: ${driveUrl} (Cloud: ${cloudName})`);

    // 1. Handle standard URLs (e.g. Unsplash, other hosting) that are NOT Google Drive
    const isDrive = driveUrl.includes("drive.google.com") || driveUrl.includes("open?id=") || driveUrl.includes("/file/d/") || driveUrl.includes("uc?id=");

    if (!isDrive && (driveUrl.startsWith("http://") || driveUrl.startsWith("https://"))) {
        // If Cloudinary is configured, use it to optimize the external image
        if (cloudName) {
            const finalUrl = `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,w_600/${encodeURIComponent(driveUrl)}`;
            return finalUrl;
        }
        return driveUrl; // Return raw URL if no Cloudinary
    }

    // 2. Handle Google Drive URLs
    // Extract ID from various Google Drive URL formats
    let fileId = "";

    if (driveUrl.includes("open?id=") || driveUrl.includes("uc?id=") || driveUrl.includes("uc?export=")) {
        // Handles: open?id=XXX, uc?id=XXX, uc?export=view&id=XXX
        const match = driveUrl.match(/[?\&]id=([^\&]+)/);
        fileId = match ? match[1] : "";
    }
    else if (driveUrl.includes("/file/d/")) {
        const match = driveUrl.match(/\/file\/d\/([^/]+)/);
        fileId = match ? match[1] : "";
    } else {
        // Assume it's a direct ID if it doesn't look like a URL
        // But if it was a URL it would have been caught by check #1
        fileId = driveUrl;
    }

    if (!fileId) {
        return "/placeholder.jpg";
    }

    // Google Drive direct link
    const driveDirectUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

    if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,w_600/${encodeURIComponent(driveDirectUrl)}`;
    }

    return driveDirectUrl;
}

/**
 * Parse a single CSV line, respecting quoted fields
 */
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

/**
 * Generic CSV parser
 */
function parseGenericCSV<T>(csvText: string, fieldMapping: Record<string, keyof T>): T[] {
    const lines = csvText.split(/\r?\n/);

    if (lines.length < 2) {
        console.warn("CSV has no data rows");
        return [];
    }

    const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
    const items: T[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        if (values.length === 0 || values.every(v => !v.trim())) continue;

        const item: any = {};

        headers.forEach((header, index) => {
            const value = values[index]?.trim() || '';
            const normalizedHeader = header.replace(/\s+/g, '').toLowerCase();

            // Check if this header maps to any field
            const mappedKey = fieldMapping[normalizedHeader];

            if (mappedKey && value) {
                item[mappedKey] = value;
            }
        });

        // Only add if item has at least one field
        if (Object.keys(item).length > 0) {
            items.push(item as T);
        }
    }

    return items;
}

export function parseCSV(csvText: string): SheetItem[] {
    const fieldMapping: Record<string, keyof SheetItem> = {
        'name': 'name',
        'title': 'name', // Added to support "Title" column header
        'productname': 'name',
        'product': 'name',
        'subtitle': 'subtitle',
        'tagline': 'subtitle',
        'description': 'description',
        'productdescription': 'description',
        'desc': 'description',
        'details': 'description',
        'price': 'price',
        'cost': 'price',
        'amount': 'price',
        'imageurl': 'imageUrl',
        'image': 'imageUrl',
        'imagelink': 'imageUrl',
        'img': 'imageUrl',
        'photo': 'imageUrl',
        'picture': 'imageUrl',
        'category': 'category',
        'type': 'category',
        'group': 'category',
        'tag': 'category',
        'id': 'id',
        'productid': 'id',
        'sku': 'id'
    };

    const items = parseGenericCSV<SheetItem>(csvText, fieldMapping);

    // Filter and process items
    return items
        .filter(item => {
            const hasValidName = item.name && item.name.length > 0 && !item.name.match(/^https?:\/\//) && !item.name.match(/^\d+$/);
            return hasValidName;
        })
        .map(item => {
            if (!item.id && item.name) {
                item.id = generateSlug(item.name);
            }
            return item;
        });
}

export function parseServicesCSV(csvText: string): Service[] {
    const fieldMapping: Record<string, keyof Service> = {
        'title': 'title',
        'servicetitle': 'title',
        'name': 'title',
        'duration': 'duration',
        'time': 'duration',
        'price': 'price',
        'cost': 'price',
        'description': 'description',
        'desc': 'description',
        'details': 'description',
        'servicedetails': 'description',
        'icon': 'icon',
        'iconpath': 'icon',
        'imageurl': 'imageUrl',
        'image': 'imageUrl',
        'imagelink': 'imageUrl',
        'img': 'imageUrl',
        'photo': 'imageUrl',
        'features': 'features',
        'feature': 'features',
    };

    return parseGenericCSV<Service>(csvText, fieldMapping);
}

export function parseTestimonialsCSV(csvText: string): Testimonial[] {
    const fieldMapping: Record<string, keyof Testimonial> = {
        'name': 'name',
        'clientname': 'name',
        'customer': 'name',
        'role': 'role',
        'position': 'role',
        'job': 'role',
        'title': 'role',
        'company': 'company',
        'organization': 'company',
        'rating': 'rating',
        'stars': 'rating',
        'score': 'rating',
        'content': 'content',
        'quote': 'content',
        'review': 'content',
        'testimonial': 'content',
        'message': 'content',
        'avatarurl': 'avatarUrl',
        'avatar': 'avatarUrl',
        'imageurl': 'avatarUrl',
        'image': 'avatarUrl',
        'photo': 'avatarUrl',
    };

    return parseGenericCSV<Testimonial>(csvText, fieldMapping);
}

export function parsePortfolioCSV(csvText: string): PortfolioItem[] {
    const fieldMapping: Record<string, keyof PortfolioItem> = {
        'title': 'title',
        'projecttitle': 'title',
        'name': 'title',
        'client': 'client',
        'clientname': 'client',
        'link': 'link',
        'url': 'link',
        'projecturl': 'link',
        'tags': 'tags',
        'tag': 'tags',
        'category': 'category',
        'type': 'category',
        'imageurl': 'imageUrl',
        'image': 'imageUrl',
        'imagelink': 'imageUrl',
        'img': 'imageUrl',
        'photo': 'imageUrl',
        'description': 'description',
        'desc': 'description',
        'details': 'description',
        'casestudy': 'description',
    };

    return parseGenericCSV<PortfolioItem>(csvText, fieldMapping);
}

export async function fetchProducts(csvUrl: string): Promise<SheetItem[]> {
    if (!csvUrl) return [];
    console.log(`🌐 [fetchProducts] Fetching from: ${csvUrl}`);
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        console.log(`✅ [fetchProducts] Received ${csvText.length} bytes. Preview: ${csvText.substring(0, 100).replace(/\n/g, '\\n')}...`);
        const items = parseCSV(csvText);
        if (items.length > 0) {
            console.log("🔍 [fetchProducts] First item parsed:", JSON.stringify(items[0], null, 2));
        } else {
            console.warn("⚠️ [fetchProducts] No items parsed! Check CSV headers.");
        }
        return items;
    } catch (error) {
        console.error("Error fetching Products data:", error);
        return [];
    }
}

export async function fetchServices(csvUrl: string): Promise<Service[]> {
    if (!csvUrl) return [];
    console.log(`🌐 [fetchServices] Fetching from: ${csvUrl}`);
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        console.log(`✅ [fetchServices] Received ${csvText.length} bytes.`);
        return parseServicesCSV(csvText);
    } catch (error) {
        console.error("Error fetching Services data:", error);
        return [];
    }
}

export async function fetchTestimonials(csvUrl: string): Promise<Testimonial[]> {
    if (!csvUrl) return [];
    console.log(`🌐 [fetchTestimonials] Fetching from: ${csvUrl}`);
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        console.log(`✅ [fetchTestimonials] Received ${csvText.length} bytes.`);
        return parseTestimonialsCSV(csvText);
    } catch (error) {
        console.error("Error fetching Testimonials data:", error);
        return [];
    }
}

export async function fetchPortfolio(csvUrl: string): Promise<PortfolioItem[]> {
    if (!csvUrl) return [];
    console.log(`🌐 [fetchPortfolio] Fetching from: ${csvUrl}`);
    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        console.log(`✅ [fetchPortfolio] Received ${csvText.length} bytes.`);
        return parsePortfolioCSV(csvText);
    } catch (error) {
        console.error("Error fetching Portfolio data:", error);
        return [];
    }
}

// ============================================
// UNIVERSAL CONTENT (ONE CSV FOR EVERYTHING)
// ============================================

/**
 * Universal content row that can be any type
 */
interface UniversalContent {
    type?: string;       // "Product", "Service", "Testimonial", "Portfolio"
    name?: string;       // Used by Products, Testimonials
    title?: string;      // Used by Services, Portfolio
    description?: string;
    content?: string;    // Used by Testimonials (review)
    review?: string;     // Alias for content
    price?: string;
    imageUrl?: string;
    photo?: string;      // Alias for imageUrl
    image?: string;      // Alias for imageUrl
    category?: string;
    role?: string;       // Used by Testimonials
    features?: string;   // Used by Services
    id?: string;
}

/**
 * Parse universal CSV with Type column
 */
function parseUniversalCSV(csvText: string): UniversalContent[] {
    const fieldMapping: Record<string, keyof UniversalContent> = {
        'type': 'type',
        'contenttype': 'type',
        'section': 'type',
        'kind': 'type',
        'name': 'name',
        'title': 'title',
        'productname': 'name',
        'description': 'description',
        'desc': 'description',
        'details': 'description',
        'content': 'content',
        'review': 'review',
        'testimonial': 'content',
        'message': 'content',
        'price': 'price',
        'cost': 'price',
        'imageurl': 'imageUrl',
        'image': 'image',
        'img': 'imageUrl',
        'photo': 'photo',
        'picture': 'imageUrl',
        'category': 'category',
        'tag': 'category',
        'group': 'category',
        'role': 'role',
        'position': 'role',
        'features': 'features',
        'feature': 'features',
        'id': 'id',
    };

    return parseGenericCSV<UniversalContent>(csvText, fieldMapping);
}

function toProduct(item: UniversalContent): SheetItem {
    const product: SheetItem = {
        id: item.id || generateSlug(item.name || item.title || 'product'),
        name: item.name || item.title,
        description: item.description,
        price: item.price,
        imageUrl: item.imageUrl || item.image || item.photo,
        category: item.category,
    };
    return product;
}

function toService(item: UniversalContent): Service {
    return {
        title: item.title || item.name,
        description: item.description,
        imageUrl: item.imageUrl || item.image || item.photo,
        features: item.features,
    };
}

function toTestimonial(item: UniversalContent): Testimonial {
    return {
        name: item.name || item.title,
        role: item.role,
        content: item.content || item.review || item.description,
        avatarUrl: item.imageUrl || item.image || item.photo,
    };
}

function toPortfolio(item: UniversalContent): PortfolioItem {
    return {
        title: item.title || item.name,
        category: item.category,
        imageUrl: item.imageUrl || item.image || item.photo,
        description: item.description,
    };
}

export async function fetchContentByType(csvUrl: string, contentType: 'product' | 'service' | 'testimonial' | 'portfolio'): Promise<SheetItem[] | Service[] | Testimonial[] | PortfolioItem[]> {
    if (!csvUrl) return [];

    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvText = await response.text();
        const allContent = parseUniversalCSV(csvText);

        // Filter by type (case-insensitive)
        const typeFiltered = allContent.filter(item =>
            item.type &&
            item.type.toLowerCase().startsWith(contentType)
        );

        // Convert to appropriate type
        switch (contentType) {
            case 'product':
                return typeFiltered
                    .map(toProduct)
                    .filter(p => p.name && p.name.length > 2);
            case 'service':
                return typeFiltered.map(toService).filter(s => s.title);
            case 'testimonial':
                return typeFiltered.map(toTestimonial).filter(t => t.name && t.content);
            case 'portfolio':
                return typeFiltered.map(toPortfolio).filter(p => p.title);
            default:
                return [];
        }
    } catch (error) {
        console.error(`Error fetching ${contentType} data:`, error);
        return [];
    }
}

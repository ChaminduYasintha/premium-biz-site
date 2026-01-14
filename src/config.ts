export const APP_CONFIG = {
    site: {
        title: "Premium Imports", // Default title, can be updated
        description: "Premium Quality, Island-wide Delivery",
        baseUrl: import.meta.env.SITE || "http://localhost:4321",
    },
    contact: {
        whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER || "+94771234567",
        whatsappMessage: "Hi, I'd like to know more about your services.",
    },
    images: {
        cloudinaryCloudName: import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME || "",
        placeholder: "/placeholder.jpg",
    }
};

export const SEO_CONFIG = {
    title: "Premium Imports | Elevate Your Lifestyle",
    description: "Discover our curated collection of high-quality products. We locate and secure the highest quality products from trusted manufacturers worldwide.",
};

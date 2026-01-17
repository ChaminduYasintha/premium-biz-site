
import { supabase, DATABASE_CONFIG } from '../lib/supabase';

// State
let editingPropertyId: string | number | null = null;

// ...

// UPDATE

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth First
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) return;

    console.log('🚀 Initializing admin panel...');
    setupEventListeners();
    testSupabaseConnection();
    loadProperties();
});

async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        console.warn("⚠️ No active session, redirecting to login...");
        window.location.href = "/admin/login";
        return false;
    }
    return true;
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Form submission
    const form = document.getElementById('propertyForm');
    if (form) form.addEventListener('submit', handleFormSubmit);

    // File input preview
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);

    // Plan file input preview
    const planInput = document.getElementById('property_plan');
    if (planInput) planInput.addEventListener('change', handlePlanFileSelect);

    // View properties button
    const viewBtn = document.getElementById('viewPropertiesBtn');
    if (viewBtn) viewBtn.addEventListener('click', loadProperties);

    // Hide properties button
    const hideBtn = document.getElementById('hidePropertiesBtn');
    if (hideBtn) hideBtn.addEventListener('click', hidePropertiesList);

    // Cancel edit button
    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await supabase.auth.signOut();
            window.location.href = "/admin/login";
        });
    }

    // Event Delegation for Edit/Delete buttons
    const propertiesContainer = document.getElementById('propertiesContainer');
    if (propertiesContainer) {
        propertiesContainer.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;

            // Handle Edit Button Click
            const editBtn = target.closest('.btn-edit') as HTMLElement;
            if (editBtn && editBtn.dataset.id) {
                console.log('✏️ Edit clicked for ID:', editBtn.dataset.id);
                editProperty(editBtn.dataset.id);
            }

            // Handle Delete Button Click
            const deleteBtn = target.closest('.btn-delete') as HTMLElement;
            if (deleteBtn && deleteBtn.dataset.id) {
                console.log('🗑️ Delete clicked for ID:', deleteBtn.dataset.id);
                const id = deleteBtn.dataset.id;
                const title = deleteBtn.dataset.title || 'Property';
                confirmDelete(id, title);
            }
        });
    }
}

// ============================================
// FILE HANDLING
// ============================================

function handlePlanFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
        const fileName = document.getElementById('planFileName');
        if (fileName) fileName.textContent = file.name;

        // Show preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('planPreview');
                const previewPlan = document.getElementById('previewPlan') as HTMLImageElement;
                if (previewPlan && e.target?.result) {
                    previewPlan.src = e.target.result as string;
                }
                if (preview) preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            // For PDFs, just show the filename
            const preview = document.getElementById('planPreview');
            if (preview) preview.classList.add('hidden');
        }
    }
}

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    const fileNameSpan = document.getElementById('fileName');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg') as HTMLImageElement;

    if (file) {
        // Update file name
        if (fileNameSpan) fileNameSpan.textContent = file.name;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImg && e.target?.result) {
                previewImg.src = e.target.result as string;
                preview?.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(file);
    }
}

// ============================================
// FORM SUBMISSION (CREATE & UPDATE)
// ============================================

async function handleFormSubmit(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    // Get form data
    const formData = new FormData(form);
    const title = formData.get('title') as string;
    const price = formData.get('price') as string;
    const city = formData.get('city') as string;
    const description = formData.get('description') as string;
    const propertyType = formData.get('property_type') as string;
    const listingType = formData.get('listing_type') as string;
    const featured = formData.get('featured') === 'on';
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const areaSqft = formData.get('area_sqft') as string;
    const features = formData.get('features') as string;
    const youtubeUrl = formData.get('youtube_url') as string;
    const facebookUrl = formData.get('facebook_url') as string;
    const view360Url = formData.get('view_360_url') as string;
    const imageFile = formData.get('image') as File;
    const planFile = formData.get('property_plan') as File;

    // Show loading state
    setLoadingState(true);

    try {
        let imageUrl: string | undefined;
        let planUrl: string | undefined;

        // If editing and no new image selected, keep the old image
        if (editingPropertyId && (!imageFile || imageFile.size === 0)) {
            // Get existing property data
            const { data } = await supabase
                .from(DATABASE_CONFIG.tableName)
                .select('image_url, plan_url')
                .eq('id', editingPropertyId)
                .single();
            if (data) {
                imageUrl = data.image_url;
                planUrl = data.plan_url;
            }
        } else {
            // Validate image for new property
            if (!imageFile || imageFile.size === 0) {
                showToast('Please select an image', 'error');
                setLoadingState(false);
                return;
            }
            // Upload new image
            imageUrl = await uploadImage(imageFile);
        }

        // Handle plan file upload
        if (planFile && planFile.size > 0) {
            planUrl = await uploadImage(planFile, 'property-plans');
        } else if (editingPropertyId && !planUrl) {
            // Keep existing plan if editing and no new file
            const { data } = await supabase
                .from(DATABASE_CONFIG.tableName)
                .select('plan_url')
                .eq('id', editingPropertyId)
                .single();
            if (data) planUrl = data.plan_url;
        }

        const propertyData: any = {
            title,
            price: parseInt(price),
            city,
            description,
            property_type: propertyType,
            listing_type: listingType,
            featured: featured,
            image_url: imageUrl
        };

        // Add property details if provided
        if (bedrooms) propertyData.bedrooms = parseInt(bedrooms);
        if (bathrooms) propertyData.bathrooms = parseInt(bathrooms);
        if (areaSqft) propertyData.area_sqft = parseInt(areaSqft);
        if (features) propertyData.features = features.trim();

        // Add optional fields only if they have values
        if (youtubeUrl) propertyData.youtube_url = youtubeUrl;
        if (facebookUrl) propertyData.facebook_url = facebookUrl;
        if (view360Url) propertyData.view_360_url = view360Url;
        if (planUrl) propertyData.plan_url = planUrl;

        if (editingPropertyId) {
            // UPDATE existing property
            await updateProperty(editingPropertyId, propertyData);
            showToast('Property updated successfully! ✅', 'success');
            cancelEdit();
        } else {
            // CREATE new property
            await insertProperty(propertyData);
            showToast('Property added successfully! 🎉', 'success');
        }

        // Reset form
        form.reset();
        const fileName = document.getElementById('fileName');
        if (fileName) fileName.textContent = 'Choose an image file';
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) imagePreview.classList.add('hidden');
        const planFileName = document.getElementById('planFileName');
        if (planFileName) planFileName.textContent = 'Choose floor plan (image or PDF)';
        const planPreview = document.getElementById('planPreview');
        if (planPreview) planPreview.classList.add('hidden');

        // Refresh properties list
        loadProperties();

    } catch (error: any) {
        console.error('Error:', error);
        showToast(error.message || 'Failed to save property', 'error');
    } finally {
        setLoadingState(false);
    }
}

// ============================================
// CRUD OPERATIONS
// ============================================

// CREATE
async function insertProperty(propertyData: any) {
    console.log('💾 Inserting property:', propertyData);

    const { data, error } = await supabase
        .from(DATABASE_CONFIG.tableName)
        .insert([propertyData])
        .select();

    if (error) {
        console.error('Insert error:', error);
        throw new Error(`Database insert failed: ${error.message}`);
    }

    console.log('✅ Property inserted:', data);
    return data;
}

// READ
async function loadProperties() {
    const propertiesList = document.getElementById('propertiesList');
    const container = document.getElementById('propertiesContainer');

    if (!propertiesList || !container) return;

    // Show loading
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">Loading properties...</div>';
    propertiesList.style.display = 'block';

    try {
        const { data, error } = await supabase
            .from(DATABASE_CONFIG.tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">No properties found. Add your first property above!</div>';
            return;
        }

        // Render properties with EDIT and DELETE buttons
        // IMPORTANT: Using data-attributes instead of onclick handlers to avoid scope issues
        container.innerHTML = data.map((property: any) => {
            const propertyTypeLabel = property.property_type ? property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1) : '';
            const listingTypeLabel = property.listing_type === 'rent' ? 'Rent' : property.listing_type === 'sale' ? 'Sale' : '';
            const featuredBadge = property.featured ? '<span style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">⭐ Featured</span>' : '';
            return `
            <div class="property-card">
                <img src="${property.image_url}" alt="${property.title}" loading="lazy">
                <div class="property-card-content">
                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap;">
                        ${propertyTypeLabel ? `<span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${propertyTypeLabel}</span>` : ''}
                        ${listingTypeLabel ? `<span style="background: ${property.listing_type === 'rent' ? '#dbeafe' : '#d1fae5'}; color: ${property.listing_type === 'rent' ? '#1e40af' : '#065f46'}; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${listingTypeLabel}</span>` : ''}
                        ${featuredBadge}
                    </div>
                    <h3>${property.title}</h3>
                    <div class="price">LKR ${formatPrice(property.price)}${property.listing_type === 'rent' ? '/mo' : ''}</div>
                    <span class="city">📍 ${property.city}</span>
                    ${(property.bedrooms || property.bathrooms || property.area_sqft) ? `
                    <div style="display: flex; gap: 12px; margin: 8px 0; flex-wrap: wrap; font-size: 13px; color: #64748b;">
                        ${property.bedrooms ? `<span>🛏️ ${property.bedrooms} Bed</span>` : ''}
                        ${property.bathrooms ? `<span>🚿 ${property.bathrooms} Bath</span>` : ''}
                        ${property.area_sqft ? `<span>📐 ${property.area_sqft.toLocaleString()} sqft</span>` : ''}
                    </div>
                    ` : ''}
                    ${property.features ? `
                    <div style="margin: 8px 0;">
                        <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Features:</div>
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                            ${property.features.split(',').slice(0, 3).map((f: string) => f.trim()).filter((f: string) => f).map((feature: string) => `
                                <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${feature}</span>
                            `).join('')}
                            ${property.features.split(',').length > 3 ? `<span style="color: #64748b; font-size: 11px;">+${property.features.split(',').length - 3} more</span>` : ''}
                        </div>
                    </div>
                    ` : ''}
                    <p class="description">${property.description || 'No description provided'}</p>
                    
                    <div class="property-actions">
                        <button type="button" class="btn-edit" data-id="${property.id}">
                            <span>✏️</span> Edit
                        </button>
                        <button type="button" class="btn-delete" data-id="${property.id}" data-title="${property.title.replace(/"/g, '&quot;')}">
                            <span>🗑️</span> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        console.log(`✅ Loaded ${data.length} properties`);

    } catch (error: any) {
        console.error('Load error:', error);
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #ef4444;">Error loading properties: ${error.message}</div>`;
    }
}

// UPDATE
async function editProperty(id: string | number) {
    try {
        console.log('📝 Fetching property for edit:', id);
        // Fetch property data
        const { data, error } = await supabase
            .from(DATABASE_CONFIG.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Populate form
        (document.getElementById('title') as HTMLInputElement).value = data.title;
        (document.getElementById('price') as HTMLInputElement).value = data.price;
        (document.getElementById('city') as HTMLInputElement).value = data.city;
        (document.getElementById('description') as HTMLTextAreaElement).value = data.description || '';
        (document.getElementById('property_type') as HTMLSelectElement).value = data.property_type || '';
        (document.getElementById('listing_type') as HTMLSelectElement).value = data.listing_type || '';
        (document.getElementById('featured') as HTMLInputElement).checked = data.featured || false;
        (document.getElementById('bedrooms') as HTMLInputElement).value = data.bedrooms || '';
        (document.getElementById('bathrooms') as HTMLInputElement).value = data.bathrooms || '';
        (document.getElementById('area_sqft') as HTMLInputElement).value = data.area_sqft || '';
        (document.getElementById('features') as HTMLInputElement).value = data.features || '';
        (document.getElementById('youtube_url') as HTMLInputElement).value = data.youtube_url || '';
        (document.getElementById('facebook_url') as HTMLInputElement).value = data.facebook_url || '';
        (document.getElementById('view_360_url') as HTMLInputElement).value = data.view_360_url || '';

        // Show current image preview
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg') as HTMLImageElement;
        if (previewImg) previewImg.src = data.image_url;
        if (preview) preview.classList.remove('hidden');

        // Show current plan preview if exists
        if (data.plan_url) {
            const planPreview = document.getElementById('planPreview');
            const previewPlan = document.getElementById('previewPlan') as HTMLImageElement;
            if (previewPlan) previewPlan.src = data.plan_url;
            if (planPreview) planPreview.classList.remove('hidden');
        }

        // Update form UI for editing mode
        editingPropertyId = id;
        const cardTitle = document.querySelector('.card h2');
        if (cardTitle) cardTitle.textContent = 'Edit Property';

        const cardDesc = document.querySelector('.card-description');
        if (cardDesc) cardDesc.textContent = 'Update the details of this property';

        const submitText = document.getElementById('submitText');
        if (submitText) submitText.textContent = 'Update Property';

        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) cancelBtn.style.display = 'inline-block';

        const imageInput = document.getElementById('image');
        if (imageInput) imageInput.removeAttribute('required');

        // Scroll to form
        document.querySelector('.card')?.scrollIntoView({ behavior: 'smooth' });

        showToast('Edit mode activated. Update the form and click "Update Property"', 'info');

    } catch (error) {
        console.error('Edit error:', error);
        showToast('Failed to load property for editing', 'error');
    }
}

async function updateProperty(id: string | number, propertyData: any) {
    console.log('📝 Updating property:', id, propertyData);

    const { data, error } = await supabase
        .from(DATABASE_CONFIG.tableName)
        .update(propertyData)
        .eq('id', id)
        .select();

    if (error) {
        console.error('Update error:', error);
        throw new Error(`Database update failed: ${error.message}`);
    }

    console.log('✅ Property updated:', data);
    return data;
}

function cancelEdit() {
    editingPropertyId = null;

    const cardTitle = document.querySelector('.card h2');
    if (cardTitle) cardTitle.textContent = 'Add New Property';

    const cardDesc = document.querySelector('.card-description');
    if (cardDesc) cardDesc.textContent = 'Fill in the details below to add a new property listing';

    const submitText = document.getElementById('submitText');
    if (submitText) submitText.textContent = 'Save Property';

    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';

    const imageInput = document.getElementById('image');
    if (imageInput) imageInput.setAttribute('required', 'required');

    (document.getElementById('propertyForm') as HTMLFormElement)?.reset();

    const fileName = document.getElementById('fileName');
    if (fileName) fileName.textContent = 'Choose an image file';

    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.classList.add('hidden');

    const planFileName = document.getElementById('planFileName');
    if (planFileName) planFileName.textContent = 'Choose floor plan (image or PDF)';
    const planPreview = document.getElementById('planPreview');
    if (planPreview) planPreview.classList.add('hidden');
}

// DELETE
function confirmDelete(id: string | number, title: string) {
    if (confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone!`)) {
        deleteProperty(id);
    }
}

async function deleteProperty(id: string | number) {
    try {
        // Delete from database
        const { error } = await supabase
            .from(DATABASE_CONFIG.tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('Property deleted successfully! 🗑️', 'success');
        loadProperties(); // Refresh list

    } catch (error: any) {
        console.error('Delete error:', error);
        showToast('Failed to delete property: ' + error.message, 'error');
    }
}



// ============================================
// IMAGE UPLOAD
// ============================================

async function uploadImage(file: File, bucketName?: string) {
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const bucket = bucketName || DATABASE_CONFIG.bucketName;

    console.log(`📤 Uploading image: ${fileName} to bucket: ${bucket}`);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error(`Image upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from(DATABASE_CONFIG.bucketName)
        .getPublicUrl(fileName);

    console.log('✅ Image uploaded:', publicUrl);
    return publicUrl;
}

function hidePropertiesList() {
    const list = document.getElementById('propertiesList');
    if (list) list.style.display = 'none';
}

async function testSupabaseConnection() {
    try {
        const { error } = await supabase
            .from(DATABASE_CONFIG.tableName)
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.warn('⚠️ Database connection test failed:', error.message);
            console.warn('Make sure you have created the "properties" table!');
        } else {
            console.log('✅ Database connection successful');
        }
    } catch (error) {
        console.warn('⚠️ Connection test failed:', error);
    }
}

// ============================================
// UI HELPERS
// ============================================

function setLoadingState(loading: boolean) {
    const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement | null;
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('loadingSpinner');

    if (submitBtn) submitBtn.disabled = loading;

    if (loading) {
        if (submitText) submitText.textContent = editingPropertyId ? 'Updating...' : 'Uploading...';
        if (spinner) spinner.classList.remove('hidden');
    } else {
        if (submitText) submitText.textContent = editingPropertyId ? 'Update Property' : 'Save Property';
        if (spinner) spinner.classList.add('hidden');
    }
}

function showToast(message: string, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (toastMessage) toastMessage.textContent = message;
    if (toast) {
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 4000);
    }
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-LK').format(price);
}

function closeSetupModal() {
    const modal = document.getElementById('setupModal');
    if (modal) modal.classList.add('hidden');
}

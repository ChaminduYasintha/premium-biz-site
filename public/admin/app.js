// ============================================
// SUPABASE ADMIN PANEL - FULL CRUD OPERATIONS
// ============================================

// Only initialize if not already defined
if (typeof window.adminSupabase === 'undefined') {
    window.adminSupabase = null;
}
if (typeof window.editingPropertyId === 'undefined') {
    window.editingPropertyId = null;
}

var supabase = window.adminSupabase;
var editingPropertyId = window.editingPropertyId;

// ============================================
// INITIALIZATION
// ============================================

function initializeApp() {
    console.log('🚀 Initializing admin panel...');

    // Check if Supabase library is loaded
    if (!window.supabase) {
        console.error('❌ Supabase library not loaded. Check your internet connection.');
        showSetupModal();
        return;
    }

    // Check if config is valid
    if (!validateConfig()) {
        showSetupModal();
        return;
    }

    // Initialize Supabase client only if not already initialized
    if (!supabase) {
        try {
            supabase = window.supabase.createClient(
                window.SUPABASE_CONFIG.url,
                window.SUPABASE_CONFIG.anonKey
            );
            window.adminSupabase = supabase;
            console.log('✅ Supabase client initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            showToast('Failed to connect to Supabase. Check your configuration.', 'error');
            return;
        }
    }

    // Setup event listeners
    setupEventListeners();

    // Test connection
    testSupabaseConnection();

    // Auto-load properties on start
    loadProperties();
}

// Wait for Supabase library to load with retries
function waitForSupabase(retries = 0, maxRetries = 10) {
    if (window.supabase) {
        console.log('✅ Supabase library loaded successfully');
        console.log('📦 Supabase object:', window.supabase);
        initializeApp();
    } else if (retries < maxRetries) {
        if (retries === 0) {
            console.log(`⏳ Waiting for Supabase library to load...`);
        }
        setTimeout(() => waitForSupabase(retries + 1, maxRetries), 100);
    } else {
        console.error('❌ Failed to load Supabase library after multiple attempts');
        console.error('🔍 window.supabase is:', window.supabase);
        console.error('🔍 Check browser console Network tab for script loading errors');
        showSetupModal();
    }
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM ready, waiting for Supabase library...');
    waitForSupabase();
});

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Form submission
    const form = document.getElementById('propertyForm');
    form.addEventListener('submit', handleFormSubmit);

    // File input preview
    const fileInput = document.getElementById('image');
    fileInput.addEventListener('change', handleFileSelect);

    // View properties button
    const viewBtn = document.getElementById('viewPropertiesBtn');
    viewBtn.addEventListener('click', loadProperties);

    // Hide properties button
    const hideBtn = document.getElementById('hidePropertiesBtn');
    hideBtn.addEventListener('click', hidePropertiesList);

    // Cancel edit button
    const cancelBtn = document.getElementById('cancelEditBtn');
    cancelBtn.addEventListener('click', cancelEdit);
}

// ============================================
// FILE HANDLING
// ============================================

function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileNameSpan = document.getElementById('fileName');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (file) {
        // Update file name
        fileNameSpan.textContent = file.name;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// ============================================
// FORM SUBMISSION (CREATE & UPDATE)
// ============================================

async function handleFormSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const price = formData.get('price');
    const city = formData.get('city');
    const description = formData.get('description');
    const imageFile = formData.get('image');

    // Show loading state
    setLoadingState(true);

    try {
        let imageUrl;

        // If editing and no new image selected, keep the old image
        if (editingPropertyId && (!imageFile || imageFile.size === 0)) {
            // Get existing property data
            const { data } = await supabase
                .from(window.DATABASE_CONFIG.tableName)
                .select('image_url')
                .eq('id', editingPropertyId)
                .single();
            imageUrl = data.image_url;
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

        const propertyData = {
            title,
            price: parseInt(price),
            city,
            description,
            image_url: imageUrl
        };

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
        event.target.reset();
        document.getElementById('fileName').textContent = 'Choose an image file';
        document.getElementById('imagePreview').classList.add('hidden');

        // Refresh properties list
        loadProperties();

    } catch (error) {
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
async function insertProperty(propertyData) {
    console.log('💾 Inserting property:', propertyData);

    const { data, error } = await supabase
        .from(window.DATABASE_CONFIG.tableName)
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

    // Show loading
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">Loading properties...</div>';
    propertiesList.style.display = 'block';

    try {
        const { data, error } = await supabase
            .from(window.DATABASE_CONFIG.tableName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">No properties found. Add your first property above!</div>';
            return;
        }

        // Render properties with EDIT and DELETE buttons
        container.innerHTML = data.map(property => `
            <div class="property-card">
                <img src="${property.image_url}" alt="${property.title}" loading="lazy">
                <div class="property-card-content">
                    <h3>${property.title}</h3>
                    <div class="price">LKR ${formatPrice(property.price)}</div>
                    <span class="city">📍 ${property.city}</span>
                    <p class="description">${property.description || 'No description provided'}</p>
                    
                    <div class="property-actions">
                        <button onclick="editProperty(${property.id})" class="btn-edit">
                            <span>✏️</span> Edit
                        </button>
                        <button onclick="confirmDelete(${property.id}, '${property.title.replace(/'/g, "\\'")}' )" class="btn-delete">
                            <span>🗑️</span> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        console.log(`✅ Loaded ${data.length} properties`);

    } catch (error) {
        console.error('Load error:', error);
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #ef4444;">Error loading properties: ${error.message}</div>`;
    }
}

// UPDATE
async function editProperty(id) {
    try {
        // Fetch property data
        const { data, error } = await supabase
            .from(window.DATABASE_CONFIG.tableName)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Populate form
        document.getElementById('title').value = data.title;
        document.getElementById('price').value = data.price;
        document.getElementById('city').value = data.city;
        document.getElementById('description').value = data.description || '';

        // Show current image preview
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        previewImg.src = data.image_url;
        preview.classList.remove('hidden');

        // Update form UI for editing mode
        editingPropertyId = id;
        document.querySelector('.card h2').textContent = 'Edit Property';
        document.querySelector('.card-description').textContent = 'Update the details of this property';
        document.getElementById('submitText').textContent = 'Update Property';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        document.getElementById('image').removeAttribute('required');

        // Scroll to form
        document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });

        showToast('Edit mode activated. Update the form and click "Update Property"', 'info');

    } catch (error) {
        console.error('Edit error:', error);
        showToast('Failed to load property for editing', 'error');
    }
}

async function updateProperty(id, propertyData) {
    console.log('📝 Updating property:', id, propertyData);

    const { data, error } = await supabase
        .from(window.DATABASE_CONFIG.tableName)
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
    document.querySelector('.card h2').textContent = 'Add New Property';
    document.querySelector('.card-description').textContent = 'Fill in the details below to add a new property listing';
    document.getElementById('submitText').textContent = 'Save Property';
    document.getElementById('cancelEditBtn').style.display = 'none';
    document.getElementById('image').setAttribute('required', 'required');
    document.getElementById('propertyForm').reset();
    document.getElementById('fileName').textContent = 'Choose an image file';
    document.getElementById('imagePreview').classList.add('hidden');
}

// DELETE
function confirmDelete(id, title) {
    if (confirm(`Are you sure you want to delete "${title}"?\n\nThis action cannot be undone!`)) {
        deleteProperty(id);
    }
}

async function deleteProperty(id) {
    try {
        // Optional: Delete the image from storage first
        // Get the property to find the image URL
        const { data: property } = await supabase
            .from(window.DATABASE_CONFIG.tableName)
            .select('image_url')
            .eq('id', id)
            .single();

        // Delete from database
        const { error } = await supabase
            .from(window.DATABASE_CONFIG.tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        showToast('Property deleted successfully! 🗑️', 'success');
        loadProperties(); // Refresh list

    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete property: ' + error.message, 'error');
    }
}

// ============================================
// IMAGE UPLOAD
// ============================================

async function uploadImage(file) {
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    console.log(`📤 Uploading image: ${fileName}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from(window.DATABASE_CONFIG.bucketName)
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
        .from(window.DATABASE_CONFIG.bucketName)
        .getPublicUrl(fileName);

    console.log('✅ Image uploaded:', publicUrl);
    return publicUrl;
}

function hidePropertiesList() {
    document.getElementById('propertiesList').style.display = 'none';
}

async function testSupabaseConnection() {
    try {
        const { data, error } = await supabase
            .from(window.DATABASE_CONFIG.tableName)
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

function setLoadingState(loading) {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const spinner = document.getElementById('loadingSpinner');

    submitBtn.disabled = loading;

    if (loading) {
        submitText.textContent = editingPropertyId ? 'Updating...' : 'Uploading...';
        spinner.classList.remove('hidden');
    } else {
        submitText.textContent = editingPropertyId ? 'Update Property' : 'Save Property';
        spinner.classList.add('hidden');
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}

function showSetupModal() {
    const modal = document.getElementById('setupModal');
    modal.classList.remove('hidden');
}

function closeSetupModal() {
    const modal = document.getElementById('setupModal');
    modal.classList.add('hidden');
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-LK').format(price);
}

// Make functions globally available
window.closeSetupModal = closeSetupModal;
window.editProperty = editProperty;
window.confirmDelete = confirmDelete;

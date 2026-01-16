// ============================================
// SUPABASE ADMIN PANEL - CLIENT-SIDE APP
// ============================================

let supabaseClient = null

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if config is valid
    if (!validateConfig()) {
        showSetupModal()
        return
    }

    // Initialize Supabase client
    try {
        supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        )
        console.log('✅ Supabase client initialized')
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error)
        showToast('Failed to connect to supabaseClient. Check your configuration.', 'error')
        return
    }

    // Setup event listeners
    setupEventListeners()

    // Test connection
    testSupabaseConnection()
})

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Form submission
    const form = document.getElementById('propertyForm')
    form.addEventListener('submit', handleFormSubmit)

    // File input preview
    const fileInput = document.getElementById('image')
    fileInput.addEventListener('change', handleFileSelect)

    // View properties button
    const viewBtn = document.getElementById('viewPropertiesBtn')
    viewBtn.addEventListener('click', loadProperties)

    // Hide properties button
    const hideBtn = document.getElementById('hidePropertiesBtn')
    hideBtn.addEventListener('click', hidePropertiesList)
}

// ============================================
// FILE HANDLING
// ============================================

function handleFileSelect(event) {
    const file = event.target.files[0]
    const fileNameSpan = document.getElementById('fileName')
    const preview = document.getElementById('imagePreview')
    const previewImg = document.getElementById('previewImg')

    if (file) {
        // Update file name
        fileNameSpan.textContent = file.name

        // Show preview
        const reader = new FileReader()
        reader.onload = (e) => {
            previewImg.src = e.target.result
            preview.classList.remove('hidden')
        }
        reader.readAsDataURL(file)
    }
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleFormSubmit(event) {
    event.preventDefault()

    // Get form data
    const formData = new FormData(event.target)
    const title = formData.get('title')
    const price = formData.get('price')
    const city = formData.get('city')
    const description = formData.get('description')
    const imageFile = formData.get('image')

    // Validate
    if (!imageFile || imageFile.size === 0) {
        showToast('Please select an image', 'error')
        return
    }

    // Show loading state
    setLoadingState(true)

    try {
        // Step 1: Upload image to Supabase Storage
        const imageUrl = await uploadImage(imageFile)

        // Step 2: Insert property data into database
        await insertProperty({
            title,
            price: parseInt(price),
            city,
            description,
            image_url: imageUrl
        })

        // Success!
        showToast('Property added successfully! 🎉', 'success')

        // Reset form
        event.target.reset()
        document.getElementById('fileName').textContent = 'Choose an image file'
        document.getElementById('imagePreview').classList.add('hidden')

        // Refresh properties list if visible
        const propertiesList = document.getElementById('propertiesList')
        if (propertiesList.style.display !== 'none') {
            loadProperties()
        }

    } catch (error) {
        console.error('Error:', error)
        showToast(error.message || 'Failed to add property', 'error')
    } finally {
        setLoadingState(false)
    }
}

// ============================================
// SUPABASE OPERATIONS
// ============================================

async function uploadImage(file) {
    // Create unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    console.log(`📤 Uploading image: ${fileName}`)

    // Upload to Supabase Storage
    const { data, error } = await supabaseClient.storage
        .from(DATABASE_CONFIG.bucketName)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        })

    if (error) {
        console.error('Upload error:', error)
        throw new Error(`Image upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
        .from(DATABASE_CONFIG.bucketName)
        .getPublicUrl(fileName)

    console.log('✅ Image uploaded:', publicUrl)
    return publicUrl
}

async function insertProperty(propertyData) {
    console.log('💾 Inserting property:', propertyData)

    const { data, error } = await supabaseClient
        .from(DATABASE_CONFIG.tableName)
        .insert([propertyData])
        .select()

    if (error) {
        console.error('Insert error:', error)
        throw new Error(`Database insert failed: ${error.message}`)
    }

    console.log('✅ Property inserted:', data)
    return data
}

async function loadProperties() {
    const propertiesList = document.getElementById('propertiesList')
    const container = document.getElementById('propertiesContainer')

    // Show loading
    container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">Loading properties...</div>'
    propertiesList.style.display = 'block'

    try {
        const { data, error } = await supabaseClient
            .from(DATABASE_CONFIG.tableName)
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #6b7280;">No properties found. Add your first property above!</div>'
            return
        }

        // Render properties
        container.innerHTML = data.map(property => `
            <div class="property-card">
                <img src="${property.image_url}" alt="${property.title}" loading="lazy">
                <div class="property-card-content">
                    <h3>${property.title}</h3>
                    <div class="price">LKR ${formatPrice(property.price)}</div>
                    <span class="city">📍 ${property.city}</span>
                    <p class="description">${property.description || 'No description provided'}</p>
                </div>
            </div>
        `).join('')

        console.log(`✅ Loaded ${data.length} properties`)

    } catch (error) {
        console.error('Load error:', error)
        container.innerHTML = `<div style="text-align: center; padding: 2rem; color: #ef4444;">Error loading properties: ${error.message}</div>`
    }
}

function hidePropertiesList() {
    document.getElementById('propertiesList').style.display = 'none'
}

async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient
            .from(DATABASE_CONFIG.tableName)
            .select('count', { count: 'exact', head: true })

        if (error) {
            console.warn('⚠️ Database connection test failed:', error.message)
            console.warn('Make sure you have created the "properties" table!')
        } else {
            console.log('✅ Database connection successful')
        }
    } catch (error) {
        console.warn('⚠️ Connection test failed:', error)
    }
}

// ============================================
// UI HELPERS
// ============================================

function setLoadingState(loading) {
    const submitBtn = document.getElementById('submitBtn')
    const submitText = document.getElementById('submitText')
    const spinner = document.getElementById('loadingSpinner')

    submitBtn.disabled = loading

    if (loading) {
        submitText.textContent = 'Uploading...'
        spinner.classList.remove('hidden')
    } else {
        submitText.textContent = 'Save Property'
        spinner.classList.add('hidden')
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast')
    const toastMessage = document.getElementById('toastMessage')

    toastMessage.textContent = message
    toast.className = `toast ${type}`
    toast.classList.remove('hidden')

    setTimeout(() => {
        toast.classList.add('hidden')
    }, 4000)
}

function showSetupModal() {
    const modal = document.getElementById('setupModal')
    modal.classList.remove('hidden')
}

function closeSetupModal() {
    const modal = document.getElementById('setupModal')
    modal.classList.add('hidden')
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-LK').format(price)
}

// Make closeSetupModal available globally for onclick
window.closeSetupModal = closeSetupModal


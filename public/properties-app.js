// ============================================
// CONFIGURATION
// ============================================
const SUPABASE_URL = 'https://eajauzeclxsyqdxutilb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhamF1emVjbHhzeXFkeHV0aWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MDY3NDQsImV4cCI6MjA4NDA4Mjc0NH0.xqQzeibNLGAjIJxFtzSV2v3SLxPtEwuKK6vLCyzAYA8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// STATE MANAGEMENT
// ============================================
let allProperties = [];
let filteredProperties = [];
let comparisonList = [];

const filters = {
    search: '',
    minPrice: null,
    maxPrice: null,
    city: '',
    propertyTypes: [],
    bedrooms: 'any',
    bathrooms: 'any',
    amenities: [],
    sortBy: 'newest'
};

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    // Filters
    searchInput: document.getElementById('searchInput'),
    minPriceInput: document.getElementById('minPrice'),
    maxPriceInput: document.getElementById('maxPrice'),
    priceSlider: document.getElementById('priceSlider'),
    cityFilter: document.getElementById('cityFilter'),
    sortBy: document.getElementById('sortBy'),
    clearFilters: document.getElementById('clearFilters'),
    toggleFilters: document.getElementById('toggleFilters'),
    filterSidebar: document.getElementById('filterSidebar'),

    // Property type checkboxes
    propertyTypeCheckboxes: document.querySelectorAll('input[name="propertyType"]'),

    // Bedroom/Bathroom buttons
    bedroomBtns: document.querySelectorAll('[data-bedrooms]'),
    bathroomBtns: document.querySelectorAll('[data-bathrooms]'),

    // Amenity checkboxes
    amenityCheckboxes: document.querySelectorAll('input[name="amenity"]'),

    // Results
    propertiesGrid: document.getElementById('propertiesGrid'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    resultsCount: document.getElementById('resultsCount'),

    // Comparison
    compareBtn: document.getElementById('compareBtn'),
    compareCount: document.getElementById('compareCount'),
    comparisonPanel: document.getElementById('comparisonPanel'),
    comparisonOverlay: document.getElementById('comparisonOverlay'),
    closeComparison: document.getElementById('closeComparison'),
    comparisonGrid: document.getElementById('comparisonGrid'),
    comparisonEmpty: document.getElementById('comparisonEmpty'),

    // Modal
    propertyModal: document.getElementById('propertyModal'),
    modalOverlay: document.getElementById('modalOverlay'),
    closeModal: document.getElementById('closeModal'),
    modalBody: document.getElementById('modalBody'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    await loadProperties();
    setupEventListeners();
    applyFilters();
}

// ============================================
// DATA LOADING
// ============================================
async function loadProperties() {
    try {
        elements.loadingState.style.display = 'flex';
        elements.propertiesGrid.classList.add('hidden');
        elements.emptyState.classList.add('hidden');

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allProperties = data || [];
        filteredProperties = [...allProperties];

        console.log(`Loaded ${allProperties.length} properties from Supabase`);

        elements.loadingState.style.display = 'none';

    } catch (error) {
        console.error('Error loading properties:', error);
        elements.loadingState.style.display = 'none';
        showToast('Error loading properties. Please try again.', 'error');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Search
    elements.searchInput.addEventListener('input', debounce((e) => {
        filters.search = e.target.value.toLowerCase();
        applyFilters();
    }, 300));

    // Price inputs
    elements.minPriceInput.addEventListener('input', debounce((e) => {
        filters.minPrice = e.target.value ? parseFloat(e.target.value) : null;
        applyFilters();
    }, 300));

    elements.maxPriceInput.addEventListener('input', debounce((e) => {
        filters.maxPrice = e.target.value ? parseFloat(e.target.value) : null;
        applyFilters();
    }, 300));

    elements.priceSlider.addEventListener('input', debounce((e) => {
        filters.maxPrice = parseFloat(e.target.value);
        elements.maxPriceInput.value = filters.maxPrice;
        applyFilters();
    }, 300));

    // City filter
    elements.cityFilter.addEventListener('change', (e) => {
        filters.city = e.target.value;
        applyFilters();
    });

    // Property type checkboxes
    elements.propertyTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            filters.propertyTypes = Array.from(elements.propertyTypeCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            applyFilters();
        });
    });

    // Bedroom buttons
    elements.bedroomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.bedroomBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filters.bedrooms = btn.dataset.bedrooms;
            applyFilters();
        });
    });

    // Bathroom buttons
    elements.bathroomBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.bathroomBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filters.bathrooms = btn.dataset.bathrooms;
            applyFilters();
        });
    });

    // Amenity checkboxes
    elements.amenityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            filters.amenities = Array.from(elements.amenityCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            applyFilters();
        });
    });

    // Sort
    elements.sortBy.addEventListener('change', (e) => {
        filters.sortBy = e.target.value;
        applyFilters();
    });

    // Clear filters
    elements.clearFilters.addEventListener('click', clearAllFilters);

    // Toggle filters (mobile)
    if (elements.toggleFilters) {
        elements.toggleFilters.addEventListener('click', () => {
            elements.filterSidebar.classList.toggle('active');
        });
    }

    // Comparison
    elements.compareBtn.addEventListener('click', openComparisonPanel);
    elements.closeComparison.addEventListener('click', closeComparisonPanel);
    elements.comparisonOverlay.addEventListener('click', closeComparisonPanel);

    // Modal
    elements.closeModal.addEventListener('click', closeModal);
    elements.modalOverlay.addEventListener('click', closeModal);

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeComparisonPanel();
        }
    });
}

// ============================================
// FILTERING
// ============================================
function applyFilters() {
    let results = [...allProperties];

    // Search filter
    if (filters.search) {
        results = results.filter(property =>
            property.title.toLowerCase().includes(filters.search) ||
            (property.description && property.description.toLowerCase().includes(filters.search)) ||
            property.city.toLowerCase().includes(filters.search)
        );
    }

    // Price filter
    if (filters.minPrice !== null) {
        results = results.filter(property => property.price >= filters.minPrice);
    }
    if (filters.maxPrice !== null) {
        results = results.filter(property => property.price <= filters.maxPrice);
    }

    // City filter
    if (filters.city) {
        results = results.filter(property => property.city === filters.city);
    }

    // Property type filter
    if (filters.propertyTypes.length > 0) {
        results = results.filter(property => {
            // Check if title contains any of the selected types
            return filters.propertyTypes.some(type =>
                property.title.toLowerCase().includes(type.toLowerCase())
            );
        });
    }

    // Bedrooms filter
    if (filters.bedrooms !== 'any') {
        const minBedrooms = parseInt(filters.bedrooms);
        results = results.filter(property => {
            // Extract bedroom count from title or description
            const bedroomMatch = property.title.match(/(\d+)\s*(bed|bedroom)/i) ||
                (property.description && property.description.match(/(\d+)\s*(bed|bedroom)/i));
            if (bedroomMatch) {
                return parseInt(bedroomMatch[1]) >= minBedrooms;
            }
            return false;
        });
    }

    // Bathrooms filter
    if (filters.bathrooms !== 'any') {
        const minBathrooms = parseInt(filters.bathrooms);
        results = results.filter(property => {
            // Extract bathroom count from title or description
            const bathroomMatch = property.title.match(/(\d+)\s*(bath|bathroom)/i) ||
                (property.description && property.description.match(/(\d+)\s*(bath|bathroom)/i));
            if (bathroomMatch) {
                return parseInt(bathroomMatch[1]) >= minBathrooms;
            }
            return false;
        });
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
        results = results.filter(property => {
            const text = `${property.title} ${property.description || ''}`.toLowerCase();
            return filters.amenities.every(amenity =>
                text.includes(amenity.toLowerCase())
            );
        });
    }

    // Sort
    results = sortProperties(results);

    filteredProperties = results;
    renderProperties();
    updateResultsCount();
}

function sortProperties(properties) {
    const sorted = [...properties];

    switch (filters.sortBy) {
        case 'newest':
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'oldest':
            return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        default:
            return sorted;
    }
}

function clearAllFilters() {
    // Reset filter state
    filters.search = '';
    filters.minPrice = null;
    filters.maxPrice = null;
    filters.city = '';
    filters.propertyTypes = [];
    filters.bedrooms = 'any';
    filters.bathrooms = 'any';
    filters.amenities = [];
    filters.sortBy = 'newest';

    // Reset UI
    elements.searchInput.value = '';
    elements.minPriceInput.value = '';
    elements.maxPriceInput.value = '';
    elements.priceSlider.value = elements.priceSlider.max;
    elements.cityFilter.value = '';
    elements.sortBy.value = 'newest';

    // Uncheck all checkboxes
    elements.propertyTypeCheckboxes.forEach(cb => cb.checked = false);
    elements.amenityCheckboxes.forEach(cb => cb.checked = false);

    // Reset bedroom/bathroom buttons
    elements.bedroomBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.bedrooms === 'any') {
            btn.classList.add('active');
        }
    });
    elements.bathroomBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.bathrooms === 'any') {
            btn.classList.add('active');
        }
    });

    applyFilters();
    showToast('Filters cleared', 'success');
}

// ============================================
// RENDERING
// ============================================
function renderProperties() {
    if (filteredProperties.length === 0) {
        elements.propertiesGrid.classList.add('hidden');
        elements.emptyState.classList.remove('hidden');
        return;
    }

    elements.emptyState.classList.add('hidden');
    elements.propertiesGrid.classList.remove('hidden');

    elements.propertiesGrid.innerHTML = filteredProperties.map(property =>
        createPropertyCard(property)
    ).join('');

    // Add event listeners to cards
    document.querySelectorAll('.property-card').forEach(card => {
        const propertyId = card.dataset.propertyId;
        const property = allProperties.find(p => p.id == propertyId);

        // View details on card click (except on buttons)
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn')) {
                openPropertyModal(property);
            }
        });

        // Compare button
        const compareBtn = card.querySelector('.compare-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleComparison(property);
            });
        }
    });
}

function createPropertyCard(property) {
    const isInComparison = comparisonList.some(p => p.id === property.id);
    const formattedPrice = formatPrice(property.price);

    return `
        <div class="property-card" data-property-id="${property.id}">
            <div class="property-image-wrapper">
                <img 
                    src="${property.image_url}" 
                    alt="${property.title}"
                    class="property-image"
                    loading="lazy"
                >
                <div class="property-overlay">
                    <div class="property-price">
                        ${formattedPrice}
                        <div class="property-price-label">LKR</div>
                    </div>
                    <div class="property-actions">
                        <button class="action-btn compare-btn ${isInComparison ? 'active' : ''}" title="Compare">
                            ⚖️
                        </button>
                    </div>
                </div>
            </div>
            <div class="property-body">
                <span class="property-city">${property.city}</span>
                <h3 class="property-title">${property.title}</h3>
                <p class="property-description">${property.description || 'No description available'}</p>
                <div class="property-features">
                    ${extractFeatures(property)}
                </div>
            </div>
        </div>
    `;
}

function extractFeatures(property) {
    const features = [];
    const text = `${property.title} ${property.description || ''}`;

    // Extract bedrooms
    const bedroomMatch = text.match(/(\d+)\s*(bed|bedroom)/i);
    if (bedroomMatch) {
        features.push(`
            <div class="feature">
                <span class="feature-icon">🛏️</span>
                <span>${bedroomMatch[1]} Beds</span>
            </div>
        `);
    }

    // Extract bathrooms
    const bathroomMatch = text.match(/(\d+)\s*(bath|bathroom)/i);
    if (bathroomMatch) {
        features.push(`
            <div class="feature">
                <span class="feature-icon">🚿</span>
                <span>${bathroomMatch[1]} Baths</span>
            </div>
        `);
    }

    // Extract area/sqft
    const areaMatch = text.match(/(\d+[\d,]*)\s*(sq\.?\s?ft|sqft|square\s?feet)/i);
    if (areaMatch) {
        features.push(`
            <div class="feature">
                <span class="feature-icon">📐</span>
                <span>${areaMatch[1]} sqft</span>
            </div>
        `);
    }

    // If no features found, add a generic one
    if (features.length === 0) {
        features.push(`
            <div class="feature">
                <span class="feature-icon">🏠</span>
                <span>Premium Property</span>
            </div>
        `);
    }

    return features.join('');
}

function updateResultsCount() {
    elements.resultsCount.textContent = filteredProperties.length;
}

// ============================================
// COMPARISON FEATURE
// ============================================
function toggleComparison(property) {
    const index = comparisonList.findIndex(p => p.id === property.id);

    if (index > -1) {
        // Remove from comparison
        comparisonList.splice(index, 1);
        showToast('Property removed from comparison', 'success');
    } else {
        // Add to comparison (max 3)
        if (comparisonList.length >= 3) {
            showToast('You can compare up to 3 properties', 'warning');
            return;
        }
        comparisonList.push(property);
        showToast('Property added to comparison', 'success');
    }

    updateCompareButton();
    renderProperties(); // Re-render to update button states
}

function updateCompareButton() {
    elements.compareCount.textContent = comparisonList.length;
}

function openComparisonPanel() {
    if (comparisonList.length === 0) {
        showToast('Add properties to compare first', 'warning');
        return;
    }

    elements.comparisonPanel.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    renderComparison();
}

function closeComparisonPanel() {
    elements.comparisonPanel.classList.add('hidden');
    document.body.style.overflow = '';
}

function renderComparison() {
    if (comparisonList.length === 0) {
        elements.comparisonGrid.style.display = 'none';
        elements.comparisonEmpty.style.display = 'block';
        return;
    }

    elements.comparisonEmpty.style.display = 'none';
    elements.comparisonGrid.style.display = 'grid';

    elements.comparisonGrid.innerHTML = comparisonList.map(property =>
        createComparisonCard(property)
    ).join('');

    // Add remove button listeners
    document.querySelectorAll('.comparison-card-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const propertyId = parseInt(btn.dataset.propertyId);
            const property = comparisonList.find(p => p.id === propertyId);
            toggleComparison(property);
            renderComparison();
        });
    });
}

function createComparisonCard(property) {
    const text = `${property.title} ${property.description || ''}`;

    // Extract features
    const bedroomMatch = text.match(/(\d+)\s*(bed|bedroom)/i);
    const bathroomMatch = text.match(/(\d+)\s*(bath|bathroom)/i);
    const areaMatch = text.match(/(\d+[\d,]*)\s*(sq\.?\s?ft|sqft|square\s?feet)/i);

    return `
        <div class="comparison-card">
            <button class="comparison-card-remove" data-property-id="${property.id}">
                ✕
            </button>
            <div class="comparison-card-image">
                <img src="${property.image_url}" alt="${property.title}">
            </div>
            <div class="comparison-card-body">
                <h3 class="comparison-card-title">${property.title}</h3>
                
                <div class="comparison-row">
                    <span class="comparison-label">Price</span>
                    <span class="comparison-value">${formatPrice(property.price)} LKR</span>
                </div>
                
                <div class="comparison-row">
                    <span class="comparison-label">City</span>
                    <span class="comparison-value">${property.city}</span>
                </div>
                
                ${bedroomMatch ? `
                    <div class="comparison-row">
                        <span class="comparison-label">Bedrooms</span>
                        <span class="comparison-value">${bedroomMatch[1]}</span>
                    </div>
                ` : ''}
                
                ${bathroomMatch ? `
                    <div class="comparison-row">
                        <span class="comparison-label">Bathrooms</span>
                        <span class="comparison-value">${bathroomMatch[1]}</span>
                    </div>
                ` : ''}
                
                ${areaMatch ? `
                    <div class="comparison-row">
                        <span class="comparison-label">Area</span>
                        <span class="comparison-value">${areaMatch[1]} sqft</span>
                    </div>
                ` : ''}
                
                <div class="comparison-row">
                    <span class="comparison-label">Added</span>
                    <span class="comparison-value">${formatDate(property.created_at)}</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// PROPERTY MODAL
// ============================================
function openPropertyModal(property) {
    elements.propertyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const text = `${property.title} ${property.description || ''}`;
    const bedroomMatch = text.match(/(\d+)\s*(bed|bedroom)/i);
    const bathroomMatch = text.match(/(\d+)\s*(bath|bathroom)/i);
    const areaMatch = text.match(/(\d+[\d,]*)\s*(sq\.?\s?ft|sqft|square\s?feet)/i);

    elements.modalBody.innerHTML = `
        <div class="modal-hero-image">
            <img src="${property.image_url}" alt="${property.title}">
        </div>
        
        <h1 class="modal-title">${property.title}</h1>
        <p class="modal-subtitle">📍 ${property.city}</p>
        
        <div class="modal-price">${formatPrice(property.price)} LKR</div>
        
        ${property.description ? `
            <div class="modal-description">
                ${property.description}
            </div>
        ` : ''}
        
        <div class="modal-features-grid">
            ${bedroomMatch ? `
                <div class="modal-feature">
                    <span class="modal-feature-icon">🛏️</span>
                    <div class="modal-feature-info">
                        <div class="modal-feature-label">Bedrooms</div>
                        <div class="modal-feature-value">${bedroomMatch[1]}</div>
                    </div>
                </div>
            ` : ''}
            
            ${bathroomMatch ? `
                <div class="modal-feature">
                    <span class="modal-feature-icon">🚿</span>
                    <div class="modal-feature-info">
                        <div class="modal-feature-label">Bathrooms</div>
                        <div class="modal-feature-value">${bathroomMatch[1]}</div>
                    </div>
                </div>
            ` : ''}
            
            ${areaMatch ? `
                <div class="modal-feature">
                    <span class="modal-feature-icon">📐</span>
                    <div class="modal-feature-info">
                        <div class="modal-feature-label">Area</div>
                        <div class="modal-feature-value">${areaMatch[1]} sqft</div>
                    </div>
                </div>
            ` : ''}
            
            <div class="modal-feature">
                <span class="modal-feature-icon">📅</span>
                <div class="modal-feature-info">
                    <div class="modal-feature-label">Listed Date</div>
                    <div class="modal-feature-value">${formatDate(property.created_at)}</div>
                </div>
            </div>
        </div>
    `;
}

function closeModal() {
    elements.propertyModal.classList.add('hidden');
    document.body.style.overflow = '';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    if (price >= 10000000) {
        return (price / 10000000).toFixed(1) + 'M';
    } else if (price >= 100000) {
        return (price / 100000).toFixed(1) + 'L';
    } else {
        return price.toLocaleString('en-US');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showToast(message, type = 'success') {
    elements.toast.className = `toast ${type}`;
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');

    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, 3000);
}

// ============================================
// START APPLICATION
// ============================================
document.addEventListener('DOMContentLoaded', init);

// ============================================
// PROPERTIES CLIENT-SIDE COMPONENT
// ============================================
// This script loads properties from Supabase on the client-side

(function () {
    'use strict';

    // Supabase Configuration
    const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
    const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';
    const WHATSAPP_NUMBER = window.ENV?.WHATSAPP_NUMBER || '+94771234567';

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase credentials not found. Properties section will not load.');
        return;
    }

    // Initialize Supabase client
    const { createClient } = window.supabase;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('✅ Properties component initialized');

    /**
     * Format price with commas
     */
    function formatPrice(price) {
        return new Intl.NumberFormat('en-LK').format(price);
    }

    /**
     * Fetch properties from Supabase
     */
    async function fetchProperties() {
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error fetching properties:', error.message);
                return [];
            }

            console.log(`✅ Fetched ${data?.length || 0} properties from Supabase`);
            return data || [];
        } catch (error) {
            console.error('❌ Unexpected error:', error);
            return [];
        }
    }

    /**
     * Render a single property card
     */
    function renderPropertyCard(property) {
        return `
      <div class="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-stone-100 hover:border-amber-200 hover:-translate-y-2">
        <!-- Property Image -->
        <div class="relative overflow-hidden aspect-[16/10] bg-stone-100">
          <img 
            src="${property.image_url}"
            alt="${property.title}"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          
          <!-- Location Badge -->
          <div class="absolute top-4 left-4 backdrop-blur-md bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
            <span class="text-sm font-semibold text-stone-800">${property.city}</span>
          </div>

          <!-- Price Badge -->
          <div class="absolute bottom-4 right-4 backdrop-blur-md bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full shadow-xl font-bold">
            LKR ${formatPrice(property.price)}
          </div>
        </div>

        <!-- Property Details -->
        <div class="p-6">
          <h3 class="text-xl font-bold text-stone-900 mb-3 group-hover:text-amber-600 transition-colors line-clamp-2">
            ${property.title}
          </h3>
          
          <p class="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-4">
            ${property.description || `Beautiful property in ${property.city}`}
          </p>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4 border-t border-stone-100">
            <a 
              href="https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`I'm interested in: ${property.title} - LKR ${formatPrice(property.price)}`)}"
              target="_blank"
              class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group/btn"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span class="group-hover/btn:translate-x-0.5 transition-transform">Inquire</span>
            </a>
            
            <button class="bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-700 p-2.5 rounded-xl transition-all duration-300 hover:scale-110" title="Save property">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Render all properties
     */
    async function renderProperties() {
        const container = document.getElementById('properties-grid');
        const section = document.getElementById('properties-section');

        if (!container || !section) {
            console.warn('⚠️ Properties container not found in DOM');
            return;
        }

        // Show loading state
        container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <div class="inline-block p-6 bg-amber-50 rounded-full mb-4 animate-pulse">
          <svg class="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <p class="text-stone-600 font-medium">Loading properties...</p>
      </div>
    `;

        // Fetch properties
        const properties = await fetchProperties();

        if (properties.length === 0) {
            // Hide section if no properties
            section.style.display = 'none';
            return;
        }

        // Show section
        section.style.display = 'block';

        // Render property cards
        container.innerHTML = properties.map(renderPropertyCard).join('');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderProperties);
    } else {
        renderProperties();
    }

    // Expose refresh function globally
    window.refreshProperties = renderProperties;
})();

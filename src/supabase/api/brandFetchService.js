/**
 * Brandfetch API Service
 * Fetches company information including logo, colors, and brand details
 */

const BRANDFETCH_API_BASE = 'https://api.brandfetch.io/v2'
const BRANDFETCH_API_KEY = import.meta.env.VITE_BRANDFETCH_API_KEY

const brandfetchService = {
  /**
   * Fetch company brand information from website URL
   * @param {string} websiteUrl - Company website URL
   * @returns {Promise<Object>} Brand information
   */
  async fetchBrandInfo(websiteUrl) {
    try {
      // Clean and format the URL
      const domain = this.extractDomain(websiteUrl)
      
      console.log('Fetching brand info for:', domain)

      const response = await fetch(`${BRANDFETCH_API_BASE}/brands/${domain}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BRANDFETCH_API_KEY}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Brand not found. Please check the website URL.')
        }
        throw new Error(`Failed to fetch brand information: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform the data into a usable format
      return this.transformBrandData(data)
    } catch (error) {
      console.error('Brandfetch API error:', error)
      throw {
        error: error.message || 'Failed to fetch brand information',
        statusCode: error.statusCode || 400
      }
    }
  },

  /**
   * Extract domain from URL
   * @param {string} url - Full website URL
   * @returns {string} Domain name
   */
  extractDomain(url) {
    try {
      // Add protocol if missing
      let formattedUrl = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = 'https://' + url
      }

      const urlObj = new URL(formattedUrl)
      // Remove 'www.' if present
      return urlObj.hostname.replace(/^www\./, '')
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
    }
  },

  /**
   * Transform Brandfetch API response to application format
   * @param {Object} brandData - Raw Brandfetch data
   * @returns {Object} Transformed brand data
   */
  transformBrandData(brandData) {
    const transformed = {
      // Basic Info
      name: brandData.name || '',
      domain: brandData.domain || '',
      description: brandData.description || '',
      
      // Logo
      logo: this.extractLogo(brandData.logos),
      
      // Colors
      colors: this.extractColors(brandData.colors),
      
      // Fonts
      fonts: this.extractFonts(brandData.fonts),
      
      // Social Links
      socialLinks: this.extractSocialLinks(brandData.links),
      
      // Industry/Category
      industry: brandData.company?.industry || brandData.industry || '',
      
      // Additional company info
      companyInfo: {
        founded: brandData.company?.founded || null,
        employees: brandData.company?.employees || null,
        location: brandData.company?.location || null
      },
      
      // Raw data for reference
      rawData: brandData
    }

    return transformed
  },

  /**
   * Extract best logo from logos array
   * @param {Array} logos - Array of logo objects
   * @returns {Object} Best logo with multiple formats
   */
  extractLogo(logos) {
    if (!logos || logos.length === 0) {
      return null
    }

    const logo = {
      primary: null,
      icon: null,
      symbol: null,
      wordmark: null
    }

    // Find different logo types
    logos.forEach(logoGroup => {
      if (logoGroup.type === 'logo' && logoGroup.formats && logoGroup.formats.length > 0) {
        // Prefer PNG, then SVG
        const pngLogo = logoGroup.formats.find(f => f.format === 'png')
        const svgLogo = logoGroup.formats.find(f => f.format === 'svg')
        logo.primary = (pngLogo || svgLogo)?.src || logoGroup.formats[0]?.src
      }
      
      if (logoGroup.type === 'icon' && logoGroup.formats && logoGroup.formats.length > 0) {
        const pngIcon = logoGroup.formats.find(f => f.format === 'png')
        const svgIcon = logoGroup.formats.find(f => f.format === 'svg')
        logo.icon = (pngIcon || svgIcon)?.src || logoGroup.formats[0]?.src
      }

      if (logoGroup.type === 'symbol' && logoGroup.formats && logoGroup.formats.length > 0) {
        logo.symbol = logoGroup.formats[0]?.src
      }

      if (logoGroup.type === 'wordmark' && logoGroup.formats && logoGroup.formats.length > 0) {
        logo.wordmark = logoGroup.formats[0]?.src
      }
    })

    return logo
  },

  /**
   * Extract brand colors
   * @param {Array} colors - Array of color objects
   * @returns {Object} Color palette
   */
  extractColors(colors) {
    if (!colors || colors.length === 0) {
      return {
        primary: '#20B2AA',
        secondary: '#15B79E',
        accent: null,
        palette: []
      }
    }

    const palette = colors.map(color => ({
      hex: color.hex || color,
      type: color.type || 'unknown',
      brightness: color.brightness || null
    }))

    return {
      primary: palette[0]?.hex || '#20B2AA',
      secondary: palette[1]?.hex || '#15B79E',
      accent: palette[2]?.hex || null,
      palette: palette
    }
  },

  /**
   * Extract brand fonts
   * @param {Array} fonts - Array of font objects
   * @returns {Array} Font list
   */
  extractFonts(fonts) {
    if (!fonts || fonts.length === 0) {
      return []
    }

    return fonts.map(font => ({
      name: font.name || font,
      type: font.type || 'unknown',
      origin: font.origin || null,
      weight: font.weight || null
    }))
  },

  /**
   * Extract social media links
   * @param {Array} links - Array of link objects
   * @returns {Object} Social links organized by platform
   */
  extractSocialLinks(links) {
    if (!links || links.length === 0) {
      return {}
    }

    const socialLinks = {}
    
    links.forEach(link => {
      if (link.name && link.url) {
        socialLinks[link.name.toLowerCase()] = link.url
      }
    })

    return socialLinks
  },

  /**
   * Search for brands (alternative endpoint)
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of matching brands
   */
  async searchBrands(query) {
    try {
      const response = await fetch(`${BRANDFETCH_API_BASE}/search/${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BRANDFETCH_API_KEY}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Brandfetch search error:', error)
      throw {
        error: error.message || 'Brand search failed',
        statusCode: error.statusCode || 400
      }
    }
  }
}

export default brandfetchService
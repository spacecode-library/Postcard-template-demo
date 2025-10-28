/**
 * Pricing Configuration and Utilities
 * Central location for all pricing-related constants and calculations
 */

// Pricing Constants
export const PRICING = {
  PRICE_PER_POSTCARD: 3.00,  // $3.00 per postcard as specified
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',

  // Minimum and maximum quantities (if needed)
  MIN_POSTCARDS: 1,
  MAX_POSTCARDS: 10000,

  // Discount tiers (optional - for future use)
  DISCOUNT_TIERS: [
    { min: 100, max: 499, discount: 0 },      // No discount
    { min: 500, max: 999, discount: 0.05 },   // 5% discount
    { min: 1000, max: 4999, discount: 0.10 }, // 10% discount
    { min: 5000, max: Infinity, discount: 0.15 } // 15% discount
  ]
};

/**
 * Calculate total cost for postcards
 * @param {number} postcardCount - Number of postcards to send
 * @param {boolean} applyDiscounts - Whether to apply volume discounts (default: false)
 * @returns {Object} Pricing breakdown
 */
export function calculatePostcardCost(postcardCount, applyDiscounts = false) {
  if (!postcardCount || postcardCount < 1) {
    return {
      count: 0,
      basePrice: PRICING.PRICE_PER_POSTCARD,
      subtotal: 0,
      discount: 0,
      discountPercent: 0,
      total: 0,
      perPostcard: PRICING.PRICE_PER_POSTCARD
    };
  }

  const subtotal = postcardCount * PRICING.PRICE_PER_POSTCARD;
  let discount = 0;
  let discountPercent = 0;

  // Apply volume discounts if enabled
  if (applyDiscounts) {
    const tier = PRICING.DISCOUNT_TIERS.find(
      t => postcardCount >= t.min && postcardCount <= t.max
    );

    if (tier && tier.discount > 0) {
      discountPercent = tier.discount;
      discount = subtotal * discountPercent;
    }
  }

  const total = subtotal - discount;

  return {
    count: postcardCount,
    basePrice: PRICING.PRICE_PER_POSTCARD,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    discountPercent: discountPercent,
    total: Number(total.toFixed(2)),
    perPostcard: Number((total / postcardCount).toFixed(2))
  };
}

/**
 * Format price for display
 * @param {number} amount - Amount to format
 * @param {boolean} includeCurrency - Whether to include currency symbol (default: true)
 * @returns {string} Formatted price
 */
export function formatPrice(amount, includeCurrency = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeCurrency ? `${PRICING.CURRENCY_SYMBOL}0.00` : '0.00';
  }

  const formatted = Number(amount).toFixed(2);
  return includeCurrency ? `${PRICING.CURRENCY_SYMBOL}${formatted}` : formatted;
}

/**
 * Convert dollars to cents for Stripe
 * Stripe requires amounts in cents (smallest currency unit)
 * @param {number} dollars - Amount in dollars
 * @returns {number} Amount in cents
 */
export function dollarsToCents(dollars) {
  if (!dollars || isNaN(dollars)) return 0;
  return Math.round(dollars * 100);
}

/**
 * Convert cents to dollars from Stripe
 * @param {number} cents - Amount in cents
 * @returns {number} Amount in dollars
 */
export function centsToDollars(cents) {
  if (!cents || isNaN(cents)) return 0;
  return Number((cents / 100).toFixed(2));
}

/**
 * Get discount tier info for a given quantity
 * @param {number} quantity - Number of postcards
 * @returns {Object|null} Tier information or null if no discount
 */
export function getDiscountTier(quantity) {
  if (!quantity || quantity < 1) return null;

  const tier = PRICING.DISCOUNT_TIERS.find(
    t => quantity >= t.min && quantity <= t.max
  );

  if (!tier || tier.discount === 0) return null;

  return {
    minQuantity: tier.min,
    maxQuantity: tier.max === Infinity ? null : tier.max,
    discountPercent: tier.discount * 100, // Convert to percentage
    discountDecimal: tier.discount
  };
}

/**
 * Calculate cost range for a min-max quantity
 * Useful for displaying estimates
 * @param {number} minQuantity - Minimum quantity
 * @param {number} maxQuantity - Maximum quantity
 * @returns {Object} Price range
 */
export function calculatePriceRange(minQuantity, maxQuantity) {
  const minCost = calculatePostcardCost(minQuantity);
  const maxCost = calculatePostcardCost(maxQuantity);

  return {
    min: minCost.total,
    max: maxCost.total,
    minFormatted: formatPrice(minCost.total),
    maxFormatted: formatPrice(maxCost.total)
  };
}

export default {
  PRICING,
  calculatePostcardCost,
  formatPrice,
  dollarsToCents,
  centsToDollars,
  getDiscountTier,
  calculatePriceRange
};

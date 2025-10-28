// src/services/newmover.service.js

import { supabase } from "../integration/client"
import { parseMultipleZipCodes, isValidZipCode } from "../../utils/zipCode"

const MELISSA_API_URL = 'https://dataretriever.melissadata.net/web/V1/NewMovers/doLookup'
const MELISSA_CUSTOMER_ID = import.meta.env.VITE_MELISSA_CUSTOMER_ID || 'k1QaFUgJ-EgAmdhd6lEhRF**'

/**
 * Helper function to handle Supabase errors
 */
function handleSupabaseError(error) {
  if (error) {
    throw error
  }
}

export const newMoverService = {
  /**
   * Fetch new movers from Melissa API
   */
  async fetchFromMelissa(zipCodes, page = 1) {
    try {
      const response = await fetch(MELISSA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          customerid: MELISSA_CUSTOMER_ID,
          includes: {
            zips: zipCodes.map(zip => ({ zip }))
          },
          columns: [
            'fullname',
            'melissaaddresskey',
            'AddressLine',
            'MoveEffectiveDate',
            'PhoneNumber',
            'city',
            'PreviousAddressLine',
            'PreviousZIPCode',
            'state'
          ],
          pagination: { page }
        })
      })

      if (!response.ok) {
        throw new Error(`Melissa API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching from Melissa API:', error)
      throw error
    }
  },

  /**
   * Transform Melissa API data to Supabase format
   * Note: Melissa API returns field names exactly as requested in the 'columns' array
   */
  transformMelissaData(melissaResults, searchedZipCode) {
    return melissaResults.map(mover => {
      // Log first mover to see actual field names returned by API
      if (melissaResults.indexOf(mover) === 0) {
        console.log('📋 Sample Melissa API response fields:', Object.keys(mover));
      }

      return {
        melissa_address_key: mover.melissaaddresskey || mover.MelissaAddressKey,
        full_name: mover.fullname || mover.FullName,
        address_line: mover.AddressLine,
        city: mover.city || mover.City,
        state: mover.state || mover.State,
        zip_code: searchedZipCode,
        previous_address_line: mover.PreviousAddressLine || null,
        previous_zip_code: mover.PreviousZIPCode || null,
        phone_number: mover.PhoneNumber || null,
        move_effective_date: mover.MoveEffectiveDate ? new Date(mover.MoveEffectiveDate).toISOString() : null,
      };
    });
  },

  /**
   * Save new movers to Supabase
   */
  async saveToSupabase(moversData) {
    try {
      console.log('Attempting to save', moversData.length, 'records to Supabase')

      // Validate data before inserting
      const invalidRecords = moversData.filter(record => !record.melissa_address_key);
      if (invalidRecords.length > 0) {
        console.error('⚠️ Found', invalidRecords.length, 'records with missing melissa_address_key');
        console.error('📋 Sample invalid record:', invalidRecords[0]);

        // Filter out invalid records
        const validRecords = moversData.filter(record => record.melissa_address_key);
        console.log('✅ Proceeding with', validRecords.length, 'valid records');

        if (validRecords.length === 0) {
          console.error('❌ No valid records to insert');
          return null;
        }

        moversData = validRecords;
      }

      const { data, error } = await supabase
        .from('newmover')
        .insert(moversData)
        .select('*')

      if (error) {
        console.error('Supabase insert error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }

      console.log('Successfully inserted', data?.length || 0, 'records')
      return data
    } catch (error) {
      console.error('Error saving to Supabase:', error.message || error)
      return null
    }
  },

  /**
   * Fetch from Melissa API and save to Supabase in one operation
   * Now supports ZIP code ranges and multiple formats
   * @param {Array|string} zipCodes - Array of ZIP codes or string with ranges (e.g., "10001-10005, 10010")
   * @param {number} page - Page number for pagination
   * @returns {Promise<Object>} Result with saved data and count
   */
  async fetchAndSave(zipCodes, page = 1) {
    try {
      // Parse and validate ZIP codes (supports ranges)
      let processedZipCodes = [];

      if (typeof zipCodes === 'string') {
        // If string input, parse it (supports ranges like "10001-10005")
        const parsed = parseMultipleZipCodes(zipCodes);

        if (parsed.errors && parsed.errors.length > 0) {
          console.warn('ZIP code parsing errors:', parsed.errors);
        }

        if (!parsed.zipCodes || parsed.zipCodes.length === 0) {
          throw new Error('No valid ZIP codes provided. Please check your input.');
        }

        processedZipCodes = parsed.zipCodes;
      } else if (Array.isArray(zipCodes)) {
        // If array, validate each ZIP code
        processedZipCodes = zipCodes.filter(zip => {
          const isValid = isValidZipCode(zip);
          if (!isValid) {
            console.warn('Invalid ZIP code skipped:', zip);
          }
          return isValid;
        });

        if (processedZipCodes.length === 0) {
          throw new Error('No valid ZIP codes provided');
        }
      } else {
        throw new Error('Please provide ZIP codes as an array or string');
      }

      console.log(`Processing ${processedZipCodes.length} ZIP codes:`, processedZipCodes);

      // Fetch from Melissa API
      const melissaData = await this.fetchFromMelissa(processedZipCodes, page)

      if (!melissaData.Results || melissaData.Results.length === 0) {
        return {
          success: true,
          message: 'No new movers found for the specified zip codes',
          saved: 0,
          count: 0,
          zipCodes: processedZipCodes,
          zipCodeCount: processedZipCodes.length,
          data: []
        }
      }

      // Transform data for each zip code
      const allTransformedData = []
      processedZipCodes.forEach(zipCode => {
        const transformed = this.transformMelissaData(melissaData.Results, zipCode)
        allTransformedData.push(...transformed)
      })

      // Log sample transformed record for debugging
      if (allTransformedData.length > 0) {
        console.log('📋 Sample transformed record:', allTransformedData[0]);
      }

      // Save to Supabase
      const savedData = await this.saveToSupabase(allTransformedData)

      // Check if save was successful
      if (!savedData || !Array.isArray(savedData)) {
        console.error('Failed to save new movers to Supabase');
        return {
          success: false,
          message: 'Failed to save new mover records to database',
          saved: 0,
          count: 0,
          zipCodes: processedZipCodes,
          zipCodeCount: processedZipCodes.length,
          data: []
        };
      }

      console.log(`Successfully saved ${savedData.length} new movers across ${processedZipCodes.length} ZIP codes`)

      return {
        success: true,
        message: `Successfully saved ${savedData.length} new mover records`,
        saved: savedData.length,
        count: savedData.length,
        zipCodes: processedZipCodes,
        zipCodeCount: processedZipCodes.length,
        data: savedData
      }
    } catch (error) {
      console.error('Error in fetchAndSave:', error)
      throw error
    }
  },

  /**
   * Get new movers from Supabase with filters
   */
  async getNewMovers(filters = {}) {
    try {
      const {
        zipCode,
        city,
        state,
        startDate,
        endDate,
        page = 1,
        limit = 50
      } = filters

      let query = supabase
        .from('newmover')
        .select('*', { count: 'exact' })

      // Apply filters
      if (zipCode) query = query.eq('zip_code', zipCode)
      if (city) query = query.ilike('city', `%${city}%`)
      if (state) query = query.eq('state', state)
      if (startDate) query = query.gte('move_effective_date', startDate)
      if (endDate) query = query.lte('move_effective_date', endDate)

      // Pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)

      // Order by most recent
      query = query.order('move_effective_date', { ascending: false })

      const { data, error, count } = await query

      handleSupabaseError(error)

      return {
        success: true,
        data: data || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error getting new movers:', error)
      throw error
    }
  },

  /**
   * Get a single new mover by ID
   */
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('newmover')
        .select('*')
        .eq('id', id)
        .single()

      handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error getting new mover by ID:', error)
      throw error
    }
  },

  /**
   * Get multiple new movers by IDs
   * @param {Array<string>} ids - Array of new mover IDs
   * @returns {Promise<Object>} New movers data
   */
  async getByIds(ids) {
    try {
      if (!ids || ids.length === 0) {
        return {
          success: true,
          data: [],
          count: 0
        };
      }

      const { data, error } = await supabase
        .from('newmover')
        .select('*')
        .in('id', ids)
        .order('move_effective_date', { ascending: false });

      handleSupabaseError(error);

      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      };
    } catch (error) {
      console.error('Error getting new movers by IDs:', error);
      throw error;
    }
  },

  /**
   * Get new movers for a specific campaign (by ZIP codes)
   * @param {Array<string>} zipCodes - Array of ZIP codes
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Object>} New movers data
   */
  async getByCampaignZipCodes(zipCodes, limit = 100) {
    try {
      if (!zipCodes || zipCodes.length === 0) {
        return {
          success: true,
          data: [],
          count: 0
        };
      }

      const { data, error, count } = await supabase
        .from('newmover')
        .select('*', { count: 'exact' })
        .in('zip_code', zipCodes)
        .order('move_effective_date', { ascending: false })
        .limit(limit);

      handleSupabaseError(error);

      return {
        success: true,
        data: data || [],
        count: count || 0,
        totalCount: count || 0
      };
    } catch (error) {
      console.error('Error getting new movers by campaign ZIP codes:', error);
      throw error;
    }
  },

  /**
   * Update a new mover record
   */
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('newmover')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error updating new mover:', error)
      throw error
    }
  },

  /**
   * Delete a new mover record
   */
  async delete(id) {
    try {
      const { error } = await supabase
        .from('newmover')
        .delete()
        .eq('id', id)

      handleSupabaseError(error)
      return { success: true, message: 'New mover deleted successfully' }
    } catch (error) {
      console.error('Error deleting new mover:', error)
      throw error
    }
  },

  /**
   * Mark new mover as contacted
   */
  async markContacted(id, campaignId = null) {
    try {
      const updates = {
        contacted: true,
        contacted_at: new Date().toISOString()
      }

      if (campaignId) {
        updates.campaign_id = campaignId
      }

      return await this.update(id, updates)
    } catch (error) {
      console.error('Error marking new mover as contacted:', error)
      throw error
    }
  },

  /**
   * Validate ZIP codes and check data availability
   * Does NOT fetch full data, just checks if data exists
   * @param {Array} zipCodes - Array of ZIP codes to validate
   * @returns {Promise<Object>} Validation results with status per ZIP
   */
  async validateZipCodes(zipCodes) {
    try {
      // Parse and validate ZIP codes if string input
      let processedZipCodes = [];

      if (typeof zipCodes === 'string') {
        const parsed = parseMultipleZipCodes(zipCodes);
        if (!parsed.zipCodes || parsed.zipCodes.length === 0) {
          throw new Error('No valid ZIP codes provided');
        }
        processedZipCodes = parsed.zipCodes;
      } else if (Array.isArray(zipCodes)) {
        processedZipCodes = zipCodes.filter(zip => isValidZipCode(zip));
      } else {
        throw new Error('Please provide ZIP codes as an array or string');
      }

      console.log(`Validating ${processedZipCodes.length} ZIP codes...`);

      // Check each ZIP code for data availability in Supabase
      const validationResults = await Promise.all(
        processedZipCodes.map(async (zipCode) => {
          const { count, error } = await supabase
            .from('newmover')
            .select('*', { count: 'exact', head: true })
            .eq('zip_code', zipCode);

          return {
            zipCode,
            isValid: true,
            hasData: !error && count > 0,
            dataCount: count || 0
          };
        })
      );

      const zipsWithData = validationResults.filter(r => r.hasData);
      const zipsWithoutData = validationResults.filter(r => !r.hasData);

      return {
        success: true,
        totalZipCodes: processedZipCodes.length,
        zipsWithData: zipsWithData.length,
        zipsWithoutData: zipsWithoutData.length,
        results: validationResults,
        flatRate: 3.00 // Current flat rate per postcard
      };
    } catch (error) {
      console.error('Error validating ZIP codes:', error);
      throw error;
    }
  },

  /**
   * Get statistics
   */
  async getStatistics(filters = {}) {
    try {
      const { zipCode, startDate, endDate } = filters

      let query = supabase
        .from('newmover')
        .select('*', { count: 'exact', head: true })

      if (zipCode) query = query.eq('zip_code', zipCode)
      if (startDate) query = query.gte('move_effective_date', startDate)
      if (endDate) query = query.lte('move_effective_date', endDate)

      const { count, error } = await query
      handleSupabaseError(error)

      // Get count by city
      let cityQuery = supabase
        .from('newmover')
        .select('city')

      if (zipCode) cityQuery = cityQuery.eq('zip_code', zipCode)
      if (startDate) cityQuery = cityQuery.gte('move_effective_date', startDate)
      if (endDate) cityQuery = cityQuery.lte('move_effective_date', endDate)

      const { data: cityData, error: cityError } = await cityQuery
      handleSupabaseError(cityError)

      // Count by city
      const byCity = cityData.reduce((acc, item) => {
        acc[item.city] = (acc[item.city] || 0) + 1
        return acc
      }, {})

      return {
        success: true,
        statistics: {
          totalNewMovers: count || 0,
          byCity: Object.entries(byCity).map(([city, count]) => ({
            city,
            count
          }))
        }
      }
    } catch (error) {
      console.error('Error getting statistics:', error)
      throw error
    }
  }
}

export default newMoverService
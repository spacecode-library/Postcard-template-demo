// src/services/newmover.service.js

import { supabase } from "../integration/client"

const MELISSA_API_URL = 'https://dataretriever.melissadata.net/web/V1/NewMovers/doLookup'
const MELISSA_CUSTOMER_ID = import.meta.env.VITE_MELISSA_CUSTOMER_ID || 'k1QaFUgJ-EgAmdhd6lEhRF**'

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
   */
  transformMelissaData(melissaResults, searchedZipCode) {
    return melissaResults.map(mover => ({
      melissa_address_key: mover.MelissaAddressKey,
      full_name: mover.FullName,
      address_line: mover.AddressLine,
      city: mover.City,
      state: mover.State,
      zip_code: searchedZipCode,
      previous_address_line: mover.PreviousAddressLine || null,
      previous_zip_code: mover.PreviousZIPCode || null,
      phone_number: mover.PhoneNumber || null,
      move_effective_date: mover.MoveEffectiveDate ? new Date(mover.MoveEffectiveDate).toISOString() : null,
    }))
  },

  /**
   * Save new movers to Supabase
   */
  async saveToSupabase(moversData) {
    try {
      const { data, error } = await supabase
        .from('newmover')
        .insert(moversData)
        .select()
    //   const { data, error } = await supabase
    //     .from('newmover')
    //     .upsert(moversData, {
    //       onConflict: 'melissa_address_key',
    //       ignoreDuplicates: false
    //     })
    //     .select()

    //   handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error saving to Supabase:', error)
      throw error
    }
  },

  /**
   * Fetch from Melissa API and save to Supabase in one operation
   */
  async fetchAndSave(zipCodes, page = 1) {
    try {
      // Validate zip codes
      if (!Array.isArray(zipCodes) || zipCodes.length === 0) {
        throw new Error('Please provide at least one zip code')
      }

      // Fetch from Melissa API
      const melissaData = await this.fetchFromMelissa(zipCodes, page)

      if (!melissaData.Results || melissaData.Results.length === 0) {
        return {
          success: true,
          message: 'No new movers found for the specified zip codes',
          saved: 0,
          data: []
        }
      }

      // Transform data for each zip code
      const allTransformedData = []
      zipCodes.forEach(zipCode => {
        const transformed = this.transformMelissaData(melissaData.Results, zipCode)
        allTransformedData.push(...transformed)
      })

      // Save to Supabase
      const savedData = await this.saveToSupabase(allTransformedData)
      console.log("all transormed data",allTransformedData)
      return {
        success: true,
        // message: `Successfully saved ${savedData.length} new mover records`,
        // saved: savedData.length,
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
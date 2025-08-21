import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '../../../services/auth.service'
import ProgressSidebar from '../components/ProgressSidebar'
import '../onboarding.css'

const companySchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Please select an industry'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
})

const industries = [
  'Technology',
  'Healthcare',
  'Retail',
  'Restaurant',
  'Real Estate',
  'Financial Services',
  'Education',
  'Manufacturing',
  'Construction',
  'Other',
]

const CompanyInfo = ({ currentStep, onboardingData, updateOnboardingData, onNext, onBack }) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: onboardingData.companyInfo?.name || onboardingData.enrichedData?.companyName || '',
      industry: onboardingData.companyInfo?.industry || onboardingData.enrichedData?.industry || '',
      addressLine1: onboardingData.companyInfo?.addressLine1 || '',
      addressLine2: onboardingData.companyInfo?.addressLine2 || '',
      city: onboardingData.companyInfo?.city || '',
      state: onboardingData.companyInfo?.state || '',
      zipCode: onboardingData.companyInfo?.zipCode || '',
    },
  })

  // Pre-fill with enriched data if available
  useEffect(() => {
    if (onboardingData.enrichedData) {
      if (onboardingData.enrichedData.companyName) {
        setValue('name', onboardingData.enrichedData.companyName)
      }
      if (onboardingData.enrichedData.industry) {
        setValue('industry', onboardingData.enrichedData.industry)
      }
    }
  }, [onboardingData.enrichedData, setValue])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Save company info
      const companyData = {
        name: data.name,
        website: onboardingData.website,
        industry: data.industry,
        address: {
          line1: data.addressLine1,
          line2: data.addressLine2 || '',
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
        },
      }

      const response = await authService.setupCompany(companyData)
      updateOnboardingData('companyInfo', response.data.company)
      toast.success('Company information saved!')
      onNext()
    } catch (error) {
      toast.error('Failed to save company information')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-logo">
        <span>Postcard</span>
      </div>

      <ProgressSidebar currentStep={currentStep} />
      
      <div className="vertical-divider" />
      
      <main className="onboarding-main">
        <nav className="onboarding-nav">
          <button className="back-button" onClick={onBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </nav>

        <div className="onboarding-content">
          <div className="content-header">
            <h1 className="content-title">Tell us about your company</h1>
            <p className="content-subtitle">
              We'll use this information to personalize your postcards and ensure accurate delivery.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="onboarding-form">
            <div className="form-group">
              <div className="form-label">
                <span>Company Name</span>
                <span className="required">*</span>
              </div>
              <input
                type="text"
                placeholder="Your Company Name"
                {...register('name')}
                className={`form-input ${errors.name ? 'error' : ''}`}
              />
              {errors.name && (
                <p className="error-message">{errors.name.message}</p>
              )}
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Industry</span>
                <span className="required">*</span>
              </div>
              <select
                {...register('industry')}
                className={`form-input ${errors.industry ? 'error' : ''}`}
              >
                <option value="">Select your industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
              {errors.industry && (
                <p className="error-message">{errors.industry.message}</p>
              )}
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Address Line 1</span>
                <span className="required">*</span>
              </div>
              <input
                type="text"
                placeholder="123 Main Street"
                {...register('addressLine1')}
                className={`form-input ${errors.addressLine1 ? 'error' : ''}`}
              />
              {errors.addressLine1 && (
                <p className="error-message">{errors.addressLine1.message}</p>
              )}
            </div>

            <div className="form-group">
              <div className="form-label">
                <span>Address Line 2</span>
              </div>
              <input
                type="text"
                placeholder="Suite 100 (optional)"
                {...register('addressLine2')}
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <div className="form-label">
                  <span>City</span>
                  <span className="required">*</span>
                </div>
                <input
                  type="text"
                  placeholder="San Francisco"
                  {...register('city')}
                  className={`form-input ${errors.city ? 'error' : ''}`}
                />
                {errors.city && (
                  <p className="error-message">{errors.city.message}</p>
                )}
              </div>

              <div className="form-group" style={{ width: '120px' }}>
                <div className="form-label">
                  <span>State</span>
                  <span className="required">*</span>
                </div>
                <input
                  type="text"
                  placeholder="CA"
                  {...register('state')}
                  className={`form-input ${errors.state ? 'error' : ''}`}
                />
                {errors.state && (
                  <p className="error-message">{errors.state.message}</p>
                )}
              </div>

              <div className="form-group" style={{ width: '140px' }}>
                <div className="form-label">
                  <span>ZIP Code</span>
                  <span className="required">*</span>
                </div>
                <input
                  type="text"
                  placeholder="94105"
                  {...register('zipCode')}
                  className={`form-input ${errors.zipCode ? 'error' : ''}`}
                />
                {errors.zipCode && (
                  <p className="error-message">{errors.zipCode.message}</p>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Next'}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default CompanyInfo
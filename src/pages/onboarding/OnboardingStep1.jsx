import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import authService from '../../services/auth.service'
import toast from 'react-hot-toast'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import ProgressSidebar from './components/ProgressSidebar'
import './onboarding.css'

const urlSchema = z.object({
  website: z.string().url('Please enter a valid URL (e.g., https://example.com)'),
})

const OnboardingStep1 = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isEnriching, setIsEnriching] = useState(false)
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      website: '',
    },
  })

  const websiteValue = watch('website')

  const handleEnrich = async () => {
    if (!websiteValue) {
      toast.error('Please enter a website URL first')
      return
    }

    setIsEnriching(true)
    try {
      const response = await authService.enrichCompany(websiteValue)
      toast.success('Company information retrieved!')
      // Store enriched data for next step
      sessionStorage.setItem('enrichedData', JSON.stringify(response.data))
    } catch (error) {
      toast.error('Failed to retrieve company information')
    } finally {
      setIsEnriching(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // Store the website URL for the next step
      sessionStorage.setItem('companyWebsite', data.website)
      navigate('/onboarding/step2')
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/login')
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-logo">
        <span>Logo</span>
      </div>

      <ProgressSidebar currentStep={1} />
      
      <div className="vertical-divider" />
      
      <main className="onboarding-main">
        <nav className="onboarding-nav">
          <button className="back-button" onClick={handleBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </nav>

        <div className="onboarding-content">
          <div className="content-header">
            <h1 className="content-title">What is your business website URL?</h1>
            <p className="content-subtitle">
              We will generate some postcard ideas with this.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="onboarding-form">
            <div className="form-group">
              <div className="form-label">
                <span>Website</span>
                <span className="required">*</span>
              </div>
              <div className="input-wrapper">
                <input
                  type="url"
                  placeholder="https://www.example.com"
                  {...register('website')}
                  className={`form-input ${errors.website ? 'error' : ''}`}
                />
                {errors.website && (
                  <p className="error-message">{errors.website.message}</p>
                )}
              </div>
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="secondary-button"
                onClick={handleEnrich}
                disabled={!websiteValue || isEnriching}
              >
                {isEnriching ? 'Retrieving...' : 'Auto-fill company info'}
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={isLoading}
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default OnboardingStep1
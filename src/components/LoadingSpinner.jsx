import './LoadingSpinner.css'

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const spinner = (
    <div className={`loading-spinner ${size}`}>
      <div className="spinner-circle"></div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="loading-overlay">
        {spinner}
      </div>
    )
  }

  return spinner
}

export default LoadingSpinner
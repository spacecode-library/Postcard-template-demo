import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, Send, CalendarClock } from 'lucide-react';
import ProcessLayout from '../../components/process/ProcessLayout';
import toast from 'react-hot-toast';

const BlastStep4 = () => {
  const navigate = useNavigate();
  const [blastData, setBlastData] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('now'); // 'now' or 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const totalSteps = 5;

  useEffect(() => {
    // Load blast data from sessionStorage
    const savedBlastData = sessionStorage.getItem('blastData');
    if (!savedBlastData) {
      toast.error('Session expired. Please start over.');
      navigate('/blast/step1');
      return;
    }

    const data = JSON.parse(savedBlastData);
    setBlastData(data);

    // Set minimum date/time to now
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const minDate = tomorrow.toISOString().split('T')[0];
    setScheduledDate(minDate);
    setScheduledTime('09:00');
  }, [navigate]);

  const handleBack = () => {
    navigate('/blast/step3');
  };

  const handleDeliveryOptionChange = (option) => {
    setDeliveryOption(option);
  };

  const handleContinue = () => {
    // Validate scheduled delivery
    if (deliveryOption === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        toast.error('Please select a date and time for scheduled delivery');
        return;
      }

      // Validate that the scheduled time is in the future
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();

      if (scheduledDateTime <= now) {
        toast.error('Scheduled time must be in the future');
        return;
      }
    }

    // Save scheduling data
    const updatedBlastData = {
      ...blastData,
      step: 4,
      deliveryOption,
      scheduledDate: deliveryOption === 'scheduled' ? scheduledDate : null,
      scheduledTime: deliveryOption === 'scheduled' ? scheduledTime : null,
      scheduledDateTime: deliveryOption === 'scheduled' ? `${scheduledDate}T${scheduledTime}` : null
    };

    sessionStorage.setItem('blastData', JSON.stringify(updatedBlastData));
    navigate('/blast/step5');
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // Max 3 months in future
    return maxDate.toISOString().split('T')[0];
  };

  if (!blastData) {
    return (
      <ProcessLayout currentStep={4} totalSteps={totalSteps} showFooter={false}>
        <div className="blast-loading">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <h2>Loading...</h2>
          </div>
        </div>
      </ProcessLayout>
    );
  }

  return (
    <ProcessLayout
      currentStep={4}
      totalSteps={totalSteps}
      footerMessage={deliveryOption === 'now'
        ? 'Your blast will be sent immediately after confirmation'
        : 'Your blast will be sent at the scheduled time'}
      onContinue={handleContinue}
      onSkip={() => navigate('/history')}
      skipText="Cancel"
    >
      <motion.button
        className="process-back-button"
        onClick={handleBack}
        whileHover={{ scale: 1.02, x: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <ChevronLeft size={18} />
        Back
      </motion.button>

      <h1 className="process-title">Schedule Delivery</h1>
      <p className="process-subtitle">
        Choose when you want to send your blast to new movers
      </p>

        <div className="schedule-options">
          {/* Send Now Option */}
          <motion.div
            className={`schedule-option ${deliveryOption === 'now' ? 'selected' : ''}`}
            onClick={() => handleDeliveryOptionChange('now')}
            whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="option-icon send-now">
              <Send size={32} />
            </div>
            <div className="option-content">
              <h3>Send Now</h3>
              <p>Your blast will be sent immediately after confirmation</p>
            </div>
            {deliveryOption === 'now' && (
              <motion.div
                layoutId="checkmark"
                className="checkmark-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <svg
                  className="checkmark-icon"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </motion.div>
            )}
          </motion.div>

          {/* Schedule for Later Option */}
          <motion.div
            className={`schedule-option ${deliveryOption === 'scheduled' ? 'selected' : ''}`}
            onClick={() => handleDeliveryOptionChange('scheduled')}
            whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0, 0, 0, 0.12)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="option-icon schedule-later">
              <CalendarClock size={32} />
            </div>
            <div className="option-content">
              <h3>Schedule for Later</h3>
              <p>Choose a specific date and time to send your blast</p>
            </div>
            {deliveryOption === 'scheduled' && (
              <motion.div
                layoutId="checkmark"
                className="checkmark-badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <svg
                  className="checkmark-icon"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Date/Time Picker for Scheduled Delivery */}
        {deliveryOption === 'scheduled' && (
          <motion.div
            className="datetime-picker-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="datetime-title">Select Date & Time</h3>

            <div className="datetime-inputs">
              <div className="input-group">
                <label htmlFor="scheduled-date">
                  <Calendar size={18} />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  id="scheduled-date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="datetime-input"
                />
              </div>

              <div className="input-group">
                <label htmlFor="scheduled-time">
                  <Clock size={18} />
                  <span>Time</span>
                </label>
                <input
                  type="time"
                  id="scheduled-time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="datetime-input"
                />
              </div>
            </div>

            <div className="datetime-info">
              <div className="info-icon">ℹ️</div>
              <div className="info-text">
                <strong>Note:</strong> Your blast will be queued and sent at the scheduled time.
                You can reschedule or cancel anytime before the send time.
              </div>
            </div>
          </motion.div>
        )}

      <style jsx>{`
        .blast-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 300px);
          width: 100%;
        }

        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e2e8f0;
          border-top-color: #20B2AA;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-content h2 {
          color: #2d3748;
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }

        .schedule-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 32px;
          margin-bottom: 32px;
        }

        .schedule-option {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 28px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .schedule-option.selected {
          border-color: #20B2AA;
          box-shadow: 0 0 0 3px rgba(32, 178, 170, 0.1);
          background: linear-gradient(135deg, rgba(230, 255, 250, 0.3) 0%, rgba(255, 255, 255, 1) 100%);
        }

        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 12px;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .option-icon.send-now {
          background: linear-gradient(135deg, #20B2AA 0%, #17a097 100%);
          color: white;
        }

        .option-icon.schedule-later {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
        }

        .schedule-option.selected .option-icon {
          transform: scale(1.05);
        }

        .option-content {
          flex: 1;
        }

        .option-content h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
        }

        .option-content p {
          margin: 0;
          font-size: 14px;
          color: #718096;
          line-height: 1.5;
        }

        .checkmark-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 28px;
          height: 28px;
          background: #20B2AA;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(32, 178, 170, 0.3);
        }

        .checkmark-icon {
          width: 16px;
          height: 16px;
          color: white;
        }

        .datetime-picker-section {
          background: linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%);
          border: 2px solid #3B82F6;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
          margin-bottom: 24px;
        }

        .datetime-title {
          margin: 0 0 20px 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e40af;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .datetime-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #2d3748;
        }

        .datetime-input {
          padding: 12px 16px;
          font-size: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .datetime-input:hover {
          border-color: #cbd5e0;
        }

        .datetime-input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .datetime-info {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
          border: 1px solid #DBEAFE;
        }

        .info-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .info-text {
          font-size: 13px;
          color: #4b5563;
          line-height: 1.6;
        }

        .info-text strong {
          color: #1e40af;
        }

        @media (max-width: 768px) {
          .datetime-inputs {
            grid-template-columns: 1fr;
          }

          .schedule-option {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }

          .checkmark-badge {
            top: 12px;
            right: 12px;
            width: 24px;
            height: 24px;
          }

          .checkmark-icon {
            width: 14px;
            height: 14px;
          }

          .datetime-picker-section {
            padding: 20px;
          }
        }
      `}</style>
    </ProcessLayout>
  );
};

export default BlastStep4;

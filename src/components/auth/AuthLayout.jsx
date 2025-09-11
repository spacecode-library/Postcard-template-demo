import React from 'react';
import './AuthLayout.css';

const AuthLayout = ({ children, testimonial }) => {
  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-content-wrapper">
          {children}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-image-container">
          <img 
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1374&q=80"
            alt="Professional woman"
            className="auth-background-image"
          />
          <div className="testimonial-card">
            <p className="testimonial-text">
              "{testimonial.text}"
            </p>
            <div className="testimonial-footer">
              <div className="testimonial-author">
                <h3 className="author-name">{testimonial.author}</h3>
                <p className="author-title">{testimonial.title}</p>
                <p className="author-company">{testimonial.company}</p>
              </div>
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
            </div>
            <div className="testimonial-navigation">
              <button className="nav-arrow nav-arrow-left">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="nav-arrow nav-arrow-right">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
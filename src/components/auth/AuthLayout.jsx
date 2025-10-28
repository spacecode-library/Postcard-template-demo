import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
                <ChevronLeft size={20} />
              </button>
              <button className="nav-arrow nav-arrow-right">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
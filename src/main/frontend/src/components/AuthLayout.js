import React from 'react';
import './AuthLayout.css';

export default function AuthLayout({ children, imageSrc = null, title = 'My Plate',
                                        imageFit = 'contain', imagePosition = 'center',
}) {
  const hasHero = !!imageSrc;

  return (
    <div className="auth-wrap">
      <div className={`auth-grid ${hasHero ? '' : 'no-hero'}`}>
        {hasHero && (
          <div className="auth-hero" style={{ '--fit': imageFit, '--pos': imagePosition }}>
            <img src={imageSrc} alt="login hero" />
        </div>
        )}

        <div className="auth-panel">
          <div className="brand">
            <span className="brand-mark">🍽</span>
            <span className="brand-text">{title}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
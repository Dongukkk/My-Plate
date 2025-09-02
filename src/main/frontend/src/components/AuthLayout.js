import React from 'react';
import './AuthLayout.css';

export default function AuthLayout({
  children,
  imageSrc = null,
  title = 'My Plate',
  imageFit = 'contain',
  imagePosition = 'center',
}) {
  const hasHero = !!imageSrc;

  return (
    <div className="lp-auth-wrap">
      <div className={`lp-auth-grid ${hasHero ? '' : 'no-hero'}`}>
        {hasHero && (
          <div
            className="lp-auth-hero"
            style={{ '--fit': imageFit, '--pos': imagePosition }}
          >
            <img src={imageSrc} alt="login hero" />
          </div>
        )}

        <div className="lp-auth-panel">
          <div className="lp-auth-brand">
            <span className="lp-auth-brand-mark">🍽</span>
            <span className="lp-auth-brand-text">{title}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
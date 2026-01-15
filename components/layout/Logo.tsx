
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 512 512" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Upper Left Segment - Represents Structure/Finance - Solid Block */}
    <path d="M224 32L64 128V320L224 416V224L320 168L224 112V32Z" fillOpacity="0.95" />
    
    {/* Lower Right Segment - Represents Flow/Life - Slightly Transparent for depth */}
    <path d="M288 480L448 384V192L288 96V288L192 344L288 400V480Z" fillOpacity="0.75" />
    
    {/* Central Connection Core - The AI/Intelligence Layer */}
    <path d="M256 192L224 224L256 256L288 224L256 192Z" fill="#FFF" fillOpacity="0.9" />
    <path d="M256 192L224 224L256 256L288 224L256 192Z" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

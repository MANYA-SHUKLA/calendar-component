'use client';

import React from 'react';

export const FloatingShapes: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large floating circles */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl animate-float-reverse"></div>
      
      {/* Medium floating shapes */}
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-400/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-blue-400/8 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Small floating shapes */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-xl animate-float-reverse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
      <div className="absolute bottom-1/4 left-1/2 w-36 h-36 bg-cyan-400/12 rounded-full blur-xl animate-float-slow" style={{ animationDelay: '5s' }}></div>
      
      {/* Geometric shapes */}
      <div className="absolute top-10 right-10 w-32 h-32 border-2 border-blue-500/20 rotate-45 animate-float" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 border-2 border-cyan-500/20 rotate-45 animate-float-reverse" style={{ animationDelay: '2.5s' }}></div>
      <div className="absolute top-1/2 right-10 w-28 h-28 border-2 border-blue-400/15 rotate-45 animate-float-slow" style={{ animationDelay: '4.5s' }}></div>
      
      {/* Glowing orbs */}
      <div className="absolute top-20 right-1/3 w-20 h-20 bg-cyan-400/20 rounded-full blur-md animate-pulse-glow"></div>
      <div className="absolute bottom-32 left-1/4 w-16 h-16 bg-blue-500/20 rounded-full blur-md animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-3/4 right-1/4 w-18 h-18 bg-cyan-500/25 rounded-full blur-md animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};


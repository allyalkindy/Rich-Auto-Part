"use client";

import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export function Loader({ fullScreen = false, message }: LoaderProps) {
  const Container = ({ children }: { children: React.ReactNode }) => (
    <div className={fullScreen ? 'min-h-screen flex items-center justify-center' : 'py-8 flex items-center justify-center'}>
      <div className="text-center">
        {children}
      </div>
    </div>
  );

  return (
    <Container>
      <div className="relative inline-flex">
        <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary-400 via-pink-400 to-primary-600 animate-spin-slow" />
        <div className="absolute inset-[6px] bg-white rounded-full" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 border-l-pink-400 animate-spin" />
      </div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </Container>
  );
}

export default Loader;



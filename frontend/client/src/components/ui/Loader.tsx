import React from 'react';

interface LoaderProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'fullscreen';
}

export const Loader: React.FC<LoaderProps> = ({ 
  text = 'Loading', 
  size = 'md', 
  variant = 'default' 
}) => {
  // Map size to dimensions
  const sizeClasses = {
    sm: 'scale-75',
    md: 'scale-100',
    lg: 'scale-125'
  };

  // Fullscreen wrapper if needed
  const Wrapper = variant === 'fullscreen' 
    ? ({ children }: { children: React.ReactNode }) => (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
          {children}
        </div>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div className="inline-block">{children}</div>
      );

  return (
    <Wrapper>
      <div 
        id="wifi-loader" 
        className={`${sizeClasses[size]} origin-center`}
      >
        <svg className="circle-outer" viewBox="0 0 86 86">
          <circle className="back" cx={43} cy={43} r={40} />
          <circle className="front" cx={43} cy={43} r={40} />
          <circle className="new" cx={43} cy={43} r={40} />
        </svg>
        <svg className="circle-middle" viewBox="0 0 60 60">
          <circle className="back" cx={30} cy={30} r={27} />
          <circle className="front" cx={30} cy={30} r={27} />
        </svg>
        <svg className="circle-inner" viewBox="0 0 34 34">
          <circle className="back" cx={17} cy={17} r={14} />
          <circle className="front" cx={17} cy={17} r={14} />
        </svg>
        <div className="text" data-text={text}>
          <span>{text}</span>
        </div>
      </div>
    </Wrapper>
  );
};
import React from 'react';

interface ClockProps extends React.SVGProps<SVGSVGElement> {
  filled?: boolean;
}

export function Clock({ filled = false, ...props }: ClockProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width || 24}
      height={props.height || 24}
      viewBox='0 0 24 24'
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={2}
      strokeLinecap='round'
      strokeLinejoin='round'
      className={`lucide lucide-clock-icon ${filled ? 'lucide-clock-filled' : 'lucide-clock'}`}
      {...props}
    >
      {filled ? (
        // Filled version
        <path d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 12.59L10 12V7h2v4.17l2.59 1.42Z' />
      ) : (
        // Outline version
        <>
          <circle cx='12' cy='12' r='10' />
          <path d='M12 6v6l4 2' />
        </>
      )}
    </svg>
  );
}

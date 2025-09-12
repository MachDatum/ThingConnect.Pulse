import type { ComponentPropsWithoutRef } from 'react';

export const Help = (props: ComponentPropsWithoutRef<'svg'>) => {
  const maskId = `help-mask-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
      {...props}
    >
      <g transform='scale(1.09) translate(-1,-1)'>
        <defs>
          <mask id={maskId} maskUnits='userSpaceOnUse' x='0' y='0' width='24' height='24'>
            <circle cx='12' cy='12' r='10' fill='white' />
            <path
              d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3'
              stroke='black'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
            <path
              d='M12 17h.01'
              stroke='black'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              fill='none'
            />
          </mask>
        </defs>
        <rect x='0' y='0' width='24' height='24' fill='currentColor' mask={`url(#${maskId})`} />
      </g>
    </svg>
  );
};

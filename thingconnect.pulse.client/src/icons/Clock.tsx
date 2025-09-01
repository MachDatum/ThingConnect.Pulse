import React from 'react';

export function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width || 24}
      height={props.height || 24}
      viewBox='0 0 24 24'
      fill='currentColor'
      {...props}
    >
      <path d='M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-.75 5.5a.75.75 0 0 1 1.5 0v4.25l3.5 2.1a.75.75 0 0 1-.75 1.3l-4-2.4a.75.75 0 0 1-.375-.65V7.5Z' />
    </svg>
  );
}

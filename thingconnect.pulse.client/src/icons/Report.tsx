import React from 'react';

export function Report(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={props.width || 24}
      height={props.height || 24}
      viewBox='0 0 24 24'
      fill='currentColor'
      {...props}
    >
      <path d='M6 2.75A1.75 1.75 0 0 1 7.75 1h5.879a1.75 1.75 0 0 1 1.238.513l3.62 3.62c.328.328.513.773.513 1.238V21.25A1.75 1.75 0 0 1 17.25 23h-9.5A1.75 1.75 0 0 1 6 21.25V2.75Zm3 9.75a.75.75 0 0 0-1.5 0v5a.75.75 0 0 0 1.5 0v-5Zm3.75-2.5a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V10.75a.75.75 0 0 1 .75-.75Zm3 4a.75.75 0 0 0-1.5 0v3.25a.75.75 0 0 0 1.5 0V14Z' />
    </svg>
  );
}

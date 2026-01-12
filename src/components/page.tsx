import React from 'react';

export const Page = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
    ({ children, className = '' }, ref) => (
        <div className={`w-full h-full overflow-hidden ${className}`} ref={ref}>
            {children}
        </div>
    )
);

Page.displayName = 'Page';

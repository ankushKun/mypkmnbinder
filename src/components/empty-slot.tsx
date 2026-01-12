import { cn } from '@/lib';
import React from 'react';

export const EmptySlot: React.FC<{ onClick: () => void; addable?: boolean }> = ({ onClick, addable }) => (
    <button
        className={cn(
            "card-aspect h-full w-auto max-w-full justify-self-center relative rounded-lg overflow-hidden bg-white/3 border-2 border-white/8 flex items-center justify-center transition-all duration-200 group",
            addable ? "hover:bg-white/6 hover:border-white/15 cursor-pointer" : "pointer-events-none"
        )}
        onClick={onClick}
        disabled={!addable}
    >
        {addable && <span className="text-3xl font-light text-white/20 transition-all duration-200 group-hover:text-white/50 group-hover:scale-120">
            +
        </span>}
    </button>
);

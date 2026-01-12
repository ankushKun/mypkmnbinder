import React from 'react';

export const EmptySlot: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        className="card-aspect h-full w-auto max-w-full justify-self-center relative rounded-lg overflow-hidden bg-white/3 border-2 border-white/8 cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/[0.06] hover:border-white/15 group"
        onClick={onClick}
    >
        <span className="text-3xl font-light text-white/20 transition-all duration-200 group-hover:text-white/50 group-hover:scale-120">
            +
        </span>
    </button>
);

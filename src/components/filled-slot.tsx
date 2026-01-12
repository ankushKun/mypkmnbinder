import React, { useState, useRef } from 'react';
import type { PokemonCard } from '../types';

interface FilledSlotProps {
    card: PokemonCard;
    onRemove: () => void;
    onClick: (rect: DOMRect) => void;
    isHidden: boolean;
}

export const FilledSlot: React.FC<FilledSlotProps> = ({ card, onRemove, onClick, isHidden }) => {
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            onClick(rect);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`card-aspect h-full cursor-pointer w-auto max-w-full justify-self-center relative rounded overflow-hidden bg-card-placeholder card-shine shadow-lg group ${isHidden ? 'invisible' : ''}`}
            onClick={handleClick}
        >
            <img
                src={card.imageUrl}
                alt={card.name}
                loading='lazy'
                className={`w-full h-full object-cover block drop-shadow-md transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
            />
        </div>
    );
};

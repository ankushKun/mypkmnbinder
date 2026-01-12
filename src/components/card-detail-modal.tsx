import React, { useEffect, useState } from 'react';
import type { PokemonCard } from '../types';

interface CardDetailModalProps {
    card: PokemonCard | null;
    isOpen: boolean;
    onClose: () => void;
    onRemove: () => void;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
    card,
    isOpen,
    onClose,
    onRemove,
}) => {
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Small delay to ensure the slide-out animation on the card starts first
            const timer = setTimeout(() => {
                setIsAnimatingIn(true);
            }, 150);
            return () => clearTimeout(timer);
        } else {
            setIsAnimatingIn(false);
        }
    }, [isOpen]);

    if (!isOpen || !card) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleRemove = () => {
        onRemove();
        onClose();
    };

    return (
        <div
            className={`fixed inset-0 bg-black/80 backdrop-blur-lg z-[1000] flex items-center justify-center p-5 transition-opacity duration-300 ${
                isAnimatingIn ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleBackdropClick}
        >
            <div
                className={`bg-[#1e1e2e] rounded-2xl border border-white/10 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden transform transition-transform duration-500 ease-out ${
                    isAnimatingIn ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white">{card.name}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center hover:bg-white/20 hover:text-white transition-all duration-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Card image */}
                <div className="p-6 flex justify-center">
                    <div className="card-aspect w-64 max-w-full rounded-lg overflow-hidden shadow-2xl card-shine">
                        <img
                            src={card.imageUrl}
                            alt={card.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Card details */}
                <div className="px-6 pb-4 space-y-3">
                    {card.set && (
                        <div className="flex items-center gap-2">
                            <span className="text-white/50 text-sm">Set:</span>
                            <span className="text-white text-sm">{card.set}</span>
                        </div>
                    )}
                    {card.rarity && (
                        <div className="flex items-center gap-2">
                            <span className="text-white/50 text-sm">Rarity:</span>
                            <span className="text-white text-sm capitalize">{card.rarity}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-white/50 text-sm">ID:</span>
                        <span className="text-white/70 text-xs font-mono">{card.id}</span>
                    </div>
                </div>

                {/* Remove button */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleRemove}
                        className="w-full py-3 px-4 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 hover:text-red-300 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                        Remove from Binder
                    </button>
                </div>
            </div>
        </div>
    );
};

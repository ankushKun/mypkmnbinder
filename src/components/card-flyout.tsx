import React, { useEffect, useState, useRef } from 'react';
import type { PokemonCard } from '../types';

type AnimationDirection = 'out' | 'in';
type AnimationPhase = 'idle' | 'starting' | 'animating' | 'done';

interface CardFlyoutProps {
    card: PokemonCard | null;
    sourceRect: DOMRect | null;
    direction: AnimationDirection;
    isActive: boolean;
    onAnimationComplete: () => void;
}

export const CardFlyout: React.FC<CardFlyoutProps> = ({
    card,
    sourceRect,
    direction,
    isActive,
    onAnimationComplete,
}) => {
    const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
    const hasTriggeredComplete = useRef(false);
    const savedCard = useRef<PokemonCard | null>(null);
    const savedRect = useRef<DOMRect | null>(null);

    // Save card and rect when starting animation
    useEffect(() => {
        if (isActive && card && sourceRect) {
            savedCard.current = card;
            savedRect.current = sourceRect;
        }
    }, [isActive, card, sourceRect]);

    useEffect(() => {
        if (isActive && savedRect.current && savedCard.current) {
            hasTriggeredComplete.current = false;
            // Start immediately
            setAnimationPhase('starting');
            // Begin animation on next frame
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimationPhase('animating');
                });
            });

            // Complete after animation duration
            const timer = setTimeout(() => {
                if (!hasTriggeredComplete.current) {
                    hasTriggeredComplete.current = true;
                    setAnimationPhase('done');
                    onAnimationComplete();
                }
            }, 500);

            return () => clearTimeout(timer);
        } else if (!isActive) {
            setAnimationPhase('idle');
        }
    }, [isActive, direction, onAnimationComplete]);

    const currentCard = savedCard.current || card;
    const currentRect = savedRect.current || sourceRect;

    if (!currentRect || !currentCard || animationPhase === 'idle' || animationPhase === 'done') {
        return null;
    }

    // For "out": start at position, end off screen
    // For "in": start off screen, end at position
    const isAnimating = animationPhase === 'animating';

    let transform: string;
    let opacity: number;

    if (direction === 'out') {
        transform = isAnimating ? 'translateY(-150vh) scale(0.8)' : 'translateY(0) scale(1)';
        opacity = isAnimating ? 0 : 1;
    } else {
        // direction === 'in'
        transform = isAnimating ? 'translateY(0) scale(1)' : 'translateY(-150vh) scale(0.8)';
        opacity = isAnimating ? 1 : 0;
    }

    return (
        <div
            className="fixed pointer-events-none z-[999] card-shine rounded-lg overflow-hidden shadow-2xl"
            style={{
                left: currentRect.left,
                top: currentRect.top,
                width: currentRect.width,
                height: currentRect.height,
                transform,
                opacity,
                transition: 'transform 500ms ease-in-out, opacity 500ms ease-in-out',
            }}
        >
            <img
                src={currentCard.imageUrl}
                alt={currentCard.name}
                className="w-full h-full object-cover"
            />
        </div>
    );
};

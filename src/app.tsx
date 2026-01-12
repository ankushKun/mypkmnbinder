import HTMLFlipBook from 'react-pageflip';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { type PokemonCard, type CardSlot } from './types';
import { Page } from './components/page';
import { AddCardModal } from './components/add-card-modal';
import { CardDetailModal } from './components/card-detail-modal';
import { CardFlyout } from './components/card-flyout';
import { EmptySlot } from './components/empty-slot';
import { FilledSlot } from './components/filled-slot';
import { Edit } from 'lucide-react';

export default function App() {
    const bookRef = useRef<any>(null);
    const totalSlots = 72; // 8 pages x 9 cards each
    const cardsPerPage = 9;

    const [slots, setSlots] = useState<CardSlot[]>(() => {
        const saved = localStorage.getItem('binder-slots');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse binder slots', e);
            }
        }
        return Array.from({ length: totalSlots }, (_, i) => ({
            id: `slot-${i}`,
            card: null,
        }));
    });

    useEffect(() => {
        localStorage.setItem('binder-slots', JSON.stringify(slots));
    }, [slots]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (bookRef.current) {
                bookRef.current.pageFlip().flip(1);
            }
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

    // Card detail modal state
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailSlotIndex, setDetailSlotIndex] = useState<number | null>(null);
    const [flyoutActive, setFlyoutActive] = useState(false);
    const [flyoutDirection, setFlyoutDirection] = useState<'out' | 'in'>('out');
    const [flyoutRect, setFlyoutRect] = useState<DOMRect | null>(null);

    const handleSlotClick = useCallback((index: number) => {
        setSelectedSlotIndex(index);
        setModalOpen(true);
    }, []);

    const handleAddCard = useCallback((card: PokemonCard) => {
        if (selectedSlotIndex !== null) {
            setSlots((prev) => {
                const newSlots = [...prev];
                const existingSlot = newSlots[selectedSlotIndex];
                if (existingSlot) {
                    newSlots[selectedSlotIndex] = { ...existingSlot, card };
                }
                return newSlots;
            });
        }
    }, [selectedSlotIndex]);

    const handleRemoveCard = useCallback((index: number) => {
        setSlots((prev) => {
            const newSlots = [...prev];
            const slot = newSlots[index];
            if (slot) {
                newSlots[index] = { ...slot, card: null };
            }
            return newSlots;
        });
    }, []);

    const handleFilledSlotClick = useCallback((index: number, rect: DOMRect) => {
        setDetailSlotIndex(index);
        setFlyoutRect(rect);
        setFlyoutDirection('out');
        setFlyoutActive(true);
    }, []);

    const handleFlyoutComplete = useCallback(() => {
        if (flyoutDirection === 'out') {
            setDetailModalOpen(true);
            setFlyoutActive(false);
        } else {
            // Fly-in complete, clean up everything
            setFlyoutActive(false);
            setFlyoutRect(null);
            setDetailSlotIndex(null);
        }
    }, [flyoutDirection]);

    const closeDetailModal = useCallback(() => {
        setDetailModalOpen(false);
        // Start fly-back animation
        setFlyoutDirection('in');
        setFlyoutActive(true);
    }, []);

    const handleRemoveFromDetail = useCallback(() => {
        if (detailSlotIndex !== null) {
            handleRemoveCard(detailSlotIndex);
        }
    }, [detailSlotIndex, handleRemoveCard]);

    const closeModal = useCallback(() => {
        setModalOpen(false);
        setSelectedSlotIndex(null);
    }, []);

    // Split slots into pages
    const pages: CardSlot[][] = [];
    for (let i = 0; i < slots.length; i += cardsPerPage) {
        pages.push(slots.slice(i, i + cardsPerPage));
    }

    const nextPage = () => bookRef.current?.pageFlip().flipNext();
    const prevPage = () => bookRef.current?.pageFlip().flipPrev();

    return (
        <div className="w-screen h-screen flex items-center justify-center relative p-5 md:p-2.5">
            {/* Previous Button */}
            {/* <button
                className="absolute top-1/2 -translate-y-1/2 left-5 md:left-2.5 sm:left-1.5 w-12 h-12 md:w-10 md:h-10 sm:w-9 sm:h-9 border-none rounded-full bg-white/10 text-white/70 text-3xl md:text-2xl sm:text-xl cursor-pointer transition-all duration-200 z-50 flex items-center justify-center backdrop-blur-lg hover:bg-white/20 hover:text-white hover:scale-110"
                onClick={prevPage}
                aria-label="Previous page"
            >
                ‹
            </button> */}

            <button className='absolute left-2 top-2 bg-white/20 backdrop-blur p-2 rounded-full hover:bg-white/30 cursor-pointer'>
                <Edit className='w-4 h-4 text-white' />
            </button>

            <HTMLFlipBook
                ref={bookRef}
                width={500}
                height={650}
                size="stretch"
                minWidth={300}
                maxWidth={800}
                minHeight={400}
                maxHeight={1000}
                showCover={true}
                autoSize={true}
                className="max-w-[calc(100vw-160px)] md:max-w-[calc(100vw-100px)] sm:max-w-[calc(100vw-80px)] max-h-[calc(100vh-40px)] drop-shadow-2xl"
                style={{}}
                startPage={0}
                drawShadow={true}
                flippingTime={500}
                usePortrait={false}
                startZIndex={0}
                maxShadowOpacity={0.5}
                mobileScrollSupport={true}
                clickEventForward={true}
                useMouseEvents={true}
                swipeDistance={30}
                showPageCorners={true}
                disableFlipByClick={true}
            >
                {/* Front Cover */}
                <Page className="bg-linear-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden rounded-r-2xl rounded-l-sm">
                    <div className="cover-texture" />
                    <input
                        type="text"
                        className="absolute bottom-10 left-10 sm:bottom-5 sm:left-5 text-2xl sm:text-base font-extrabold text-black/25 tracking-widest uppercase bg-transparent border-none outline-none placeholder:text-black/25"
                        placeholder="My PKMN BINDER"
                    />
                </Page>

                {/* Inside Front Cover */}
                <Page className="bg-neutral-900 rounded-l-2xl">
                    <div />
                </Page>

                {/* Card Pages */}
                {pages.map((pageSlots, pageIndex) => (
                    <Page
                        key={pageIndex}
                        className={`bg-neutral-900 ${pageIndex % 2 === 0 ? 'rounded-r-2xl' : 'rounded-l-2xl'}`}
                    >
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-3 md:gap-2 sm:gap-1.5 p-5 md:p-3 sm:p-2">
                            {pageSlots.map((slot, slotIndex) => {
                                const globalIndex = pageIndex * cardsPerPage + slotIndex;
                                return slot.card ? (
                                    <FilledSlot
                                        key={slot.id}
                                        card={slot.card}
                                        onRemove={() => handleRemoveCard(globalIndex)}
                                        onClick={(rect) => handleFilledSlotClick(globalIndex, rect)}
                                        isHidden={detailSlotIndex === globalIndex && (flyoutActive || detailModalOpen)}
                                    />
                                ) : (
                                    <EmptySlot
                                        key={slot.id}
                                        onClick={() => handleSlotClick(globalIndex)}
                                    />
                                );
                            })}
                        </div>
                    </Page>
                ))}

                {/* Inside Back Cover */}
                <Page className="bg-neutral-900 rounded-r-2xl">
                    <div />
                </Page>

                {/* Back Cover */}
                <Page className="bg-linear-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden rounded-l-2xl rounded-r-sm">
                    <div className="cover-texture" />
                </Page>
            </HTMLFlipBook>

            {/* Next Button */}
            {/* <button
                className="absolute top-1/2 -translate-y-1/2 right-5 md:right-2.5 sm:right-1.5 w-12 h-12 md:w-10 md:h-10 sm:w-9 sm:h-9 border-none rounded-full bg-white/10 text-white/70 text-3xl md:text-2xl sm:text-xl cursor-pointer transition-all duration-200 z-50 flex items-center justify-center backdrop-blur-lg hover:bg-white/20 hover:text-white hover:scale-110"
                onClick={nextPage}
                aria-label="Next page"
            >
                ›
            </button> */}

            <AddCardModal
                isOpen={modalOpen}
                onClose={closeModal}
                onAddCard={handleAddCard}
            />

            <CardDetailModal
                card={detailSlotIndex !== null ? slots[detailSlotIndex]?.card ?? null : null}
                isOpen={detailModalOpen}
                onClose={closeDetailModal}
                onRemove={handleRemoveFromDetail}
            />

            <CardFlyout
                card={detailSlotIndex !== null ? slots[detailSlotIndex]?.card ?? null : null}
                sourceRect={flyoutRect}
                direction={flyoutDirection}
                isActive={flyoutActive}
                onAnimationComplete={handleFlyoutComplete}
            />
        </div>
    );
}

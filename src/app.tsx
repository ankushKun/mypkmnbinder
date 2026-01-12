import HTMLFlipBook from 'react-pageflip';
import React, { useState, useRef, useCallback, useEffect, type KeyboardEvent, type TouchEvent } from 'react';
import { type PokemonCard, type CardSlot } from './types';
import { Page } from './components/page';
import { AddCardModal } from './components/add-card-modal';
import { CardDetailModal } from './components/card-detail-modal';
import { CardFlyout } from './components/card-flyout';
import { EmptySlot } from './components/empty-slot';
import { FilledSlot } from './components/filled-slot';
import { ArrowLeft, ArrowRight, Check, Circle, Edit } from 'lucide-react';
import { cn } from './lib';

const AVAILABLE_COLORS = {
    yellow: {
        class: "from-amber-600 via-yellow-700 to-yellow-800"
    },
    black: {
        class: "bg-black/90 from-black/60 to-black/90"
    }
}

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

    const [editingCards, setEditingCards] = useState<boolean>(() => {
        const saved = localStorage.getItem('binder-editing-cards');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to parse binder editing cards', e);
            }
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem('binder-slots', JSON.stringify(slots));
    }, [slots]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (bookRef.current) {
                nextPage()
            }
        }, 500);
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

    // Binder translation state
    const [binderX, setBinderX] = useState(() => (typeof window !== 'undefined' && window.innerWidth >= 640 ? 0 : -145));
    const dragStartRef = useRef<number | null>(null);
    const startBinderXRef = useRef<number>(-145);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        const target = e.target as HTMLElement;
        const isContainer = target === containerRef.current;
        const isHandle = target.classList.contains('binder-drag-handle');

        if (!isContainer && !isHandle) return;

        dragStartRef.current = e.touches[0]!.clientX;
        startBinderXRef.current = binderX;
    }, [binderX]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (dragStartRef.current === null) return;
        const delta = e.touches[0]!.clientX - dragStartRef.current;
        const newX = Math.max(-145, Math.min(145, startBinderXRef.current + delta));
        setBinderX(newX);
    }, []);

    const handleTouchEnd = useCallback(() => {
        dragStartRef.current = null;
    }, []);

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

    useEffect(() => {
        function keydown(e: globalThis.KeyboardEvent) {
            // Don't trigger if user is typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === 'ArrowRight') {
                bookRef.current?.pageFlip().flipNext();
            } else if (e.key === 'ArrowLeft') {
                bookRef.current?.pageFlip().flipPrev();
            }
        }

        // bind arrow keys to next and prev page flips
        window.addEventListener("keydown", keydown)
        return () => {
            window.removeEventListener("keydown", keydown)
        }
    }, [])

    // Split slots into pages
    const pages: CardSlot[][] = [];
    for (let i = 0; i < slots.length; i += cardsPerPage) {
        pages.push(slots.slice(i, i + cardsPerPage));
    }

    const nextPage = () => bookRef.current?.pageFlip().flipNext();
    const prevPage = () => bookRef.current?.pageFlip().flipPrev();

    return (
        <div
            ref={containerRef}
            className="w-screen h-screen max-w-[100vw] max-h-screen flex items-center justify-center relative p-28 overflow-clip touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >

            <button
                onClick={() => { setEditingCards(!editingCards); localStorage.setItem("binder-editing-cards", JSON.stringify(!editingCards)) }}
                className={cn('absolute right-4 top-4 backdrop-blur p-2 rounded-full hover:bg-white/30 cursor-pointer', editingCards ? 'bg-green-300/20' : 'bg-white/20')}>
                {editingCards ? <Check className='w-4 h-4 text-green-400' /> : <Edit className='w-4 h-4 text-white' />}
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
                style={{ transform: `translateX(${binderX}px)` }}
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
                <Page className={cn("bg-linear-to-br overflow-hidden rounded-r-2xl rounded-l-sm", AVAILABLE_COLORS.yellow.class)}>
                    <div className="cover-texture" />
                    <div className="cover-stitching rounded-r-xl rounded-l-md" />
                    <input
                        type="text"
                        className="absolute bottom-8 left-10 sm:bottom-12 sm:left-14 text-base sm:text-3xl font-extrabold text-black/25 tracking-widest uppercase bg-transparent border-none outline-none placeholder:text-black/25"
                        placeholder="My PKMN BINDER"
                    />
                </Page>

                {/* Inside Front Cover */}
                <Page className="bg-neutral-900 rounded-l-2xl relative">
                    <div className="page-texture" />
                    {/* Spine Handle (Right edge for Left page) */}
                    <div
                        className="binder-drag-handle absolute top-0 right-0 w-8 h-full z-50 cursor-grab active:cursor-grabbing touch-none"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
                </Page>

                {/* Card Pages */}
                {pages.map((pageSlots, pageIndex) => (
                    <Page
                        key={pageIndex}
                        className={`bg-neutral-900 border-black/5 ${pageIndex % 2 === 0 ? 'rounded-r-2xl border-l' : 'rounded-l-2xl border-r'} relative`}
                    >
                        <div className="page-texture" />
                        {/* Spine Handle */}
                        <div
                            className={cn(
                                "binder-drag-handle absolute top-0 w-8 h-full z-50 cursor-grab active:cursor-grabbing touch-none",
                                pageIndex % 2 === 0 ? "left-0" : "right-0"
                            )}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3  relative z-10 items-start justify-evenly gap-4 gap-x-0 p-4 px-4 m-0">
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
                                        addable={editingCards}
                                    />
                                );
                            })}
                        </div>
                    </Page>
                ))}

                {/* Inside Back Cover */}
                <Page className="bg-neutral-900 rounded-r-2xl relative">
                    <div className="page-texture" />
                    {/* Spine Handle (Left edge for Right page) */}
                    <div
                        className="binder-drag-handle absolute top-0 left-0 w-8 h-full z-50 cursor-grab active:cursor-grabbing touch-none"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
                </Page>

                {/* Back Cover */}
                <Page className={cn("bg-linear-to-br relative overflow-hidden rounded-l-2xl rounded-r-sm", AVAILABLE_COLORS.yellow.class)}>
                    <div className="cover-texture" />
                    <div className="cover-stitching rounded-l-xl rounded-r-md" />
                </Page>
            </HTMLFlipBook>

            {binderX == -145 && <div className='absolute sm:invisible bottom-20 text-white flex items-center justify-center gap-4 font-light text-sm opacity-25 pointer-events-none'><ArrowLeft strokeWidth={1} />slide here<ArrowRight strokeWidth={1} /></div>}

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

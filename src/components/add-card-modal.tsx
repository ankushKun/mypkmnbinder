import React, { useState, useRef } from 'react';
import { Query } from '@tcgdex/sdk';
import type { PokemonCard } from '../types';
import { tcgdex, getTcgdexImageUrl } from '../lib/tcgdex';

const SearchResultItem: React.FC<{ card: any; onClick: (card: any) => void }> = ({ card, onClick }) => {
    const [isLoading, setIsLoading] = useState(true);
    const imgSrc = getTcgdexImageUrl(card, 'low', 'webp')!;

    return (
        <div
            className="flex flex-col gap-1 cursor-pointer"
            onClick={() => onClick(card)}
            title={card.name}
        >
            <div className="aspect-[2.5/3.5] rounded-md overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl relative bg-card-placeholder">
                <img
                    src={imgSrc}
                    alt={card.name}
                    loading="lazy"
                    className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                />
            </div>
            <div className="text-center text-[11px] text-gray-400 truncate">
                {card.name}
            </div>
        </div>
    );
};

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCard: (card: PokemonCard) => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard }) => {
    const [activeTab, setActiveTab] = useState<'url' | 'upload' | 'search'>('search');
    const [urlInput, setUrlInput] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const results = await tcgdex.card.list(
                Query.create().contains('name', searchQuery)
            );

            // Fetch more results since we'll filter some out
            const limitedResults = results.slice(0, 40);

            // Fetch full card details to get image URLs
            const detailedResults = await Promise.all(
                limitedResults.map(async (resume: any) => {
                    // If we already have an image, use it
                    if (resume.image) return resume;

                    // Try to get full card details
                    try {
                        if (typeof resume.getCard === 'function') {
                            return await resume.getCard();
                        }
                        if (resume.id) {
                            return await tcgdex.card.get(resume.id);
                        }
                    } catch {
                        // Fall back to resume data
                    }
                    return resume;
                })
            );

            // Filter out cards without images and limit to 20
            const cardsWithImages = detailedResults
                .filter(card => getTcgdexImageUrl(card, 'low', 'webp') !== null)
                .slice(0, 20);

            setSearchResults(cardsWithImages);
        } catch (error) {
            console.error('Error searching cards:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            const newCard: PokemonCard = {
                id: `custom-${Date.now()}`,
                name: 'Custom Card',
                imageUrl: urlInput.trim(),
            };
            onAddCard(newCard);
            setUrlInput('');
            onClose();
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                setPreviewUrl(dataUrl);
            };
            reader.readAsDataURL(file);
        }
    };

    const confirmUpload = () => {
        if (previewUrl) {
            const newCard: PokemonCard = {
                id: `upload-${Date.now()}`,
                name: 'Uploaded Card',
                imageUrl: previewUrl,
            };
            onAddCard(newCard);
            setPreviewUrl(null);
            onClose();
        }
    };

    const handleSelectFromSearch = (tcgCard: any) => {
        // Try high quality PNG first, then fall back
        let imageUrl = getTcgdexImageUrl(tcgCard, 'low', 'png');

        if (!imageUrl) {
            // Try webp as fallback
            imageUrl = getTcgdexImageUrl(tcgCard, 'low', 'webp');
        }

        if (!imageUrl) {
            // Last resort placeholder
            imageUrl = 'https://placehold.co/245x342?text=No+Image';
        }

        const newCard: PokemonCard = {
            id: tcgCard.id || `tcg-${Date.now()}`,
            name: tcgCard.name || 'Unknown Card',
            imageUrl: imageUrl,
            rarity: tcgCard.rarity?.toLowerCase() as any,
            set: tcgCard.set?.name
        };

        onAddCard(newCard);
        onClose();
    };

    const handleClose = () => {
        setUrlInput('');
        setPreviewUrl(null);
        setSearchQuery('');
        setSearchResults([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-1000 p-5"
            onClick={handleClose}
        >
            <div
                className="bg-[#1e1e2e] rounded-2xl w-full max-w-150 max-h-[80vh] md:max-h-[90vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-4 right-4 w-9 h-9 border-none rounded-full bg-white/10 text-white/70 text-2xl cursor-pointer flex items-center justify-center transition-all duration-200 z-10 hover:bg-white/20 hover:text-white"
                    onClick={handleClose}
                >
                    x
                </button>

                {/* Tabs */}
                <div className="flex border-b border-white/10 px-4 pt-4">
                    {(['search', 'url', 'upload'] as const).map((tab) => (
                        <button
                            key={tab}
                            className={`px-6 py-3 border-none bg-transparent text-sm font-semibold cursor-pointer transition-all duration-200 relative capitalize
                                ${activeTab === tab ? 'text-white' : 'text-white/50 hover:text-white/80'}
                            `}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-red-600 rounded-t" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Search Pokemon (e.g. Pikachu)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-[15px] outline-none transition-all duration-200 placeholder:text-white/30 focus:border-white/25 focus:bg-white/[0.08]"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    autoFocus
                                />
                                <button
                                    className="px-7 py-3.5 bg-linear-to-br from-red-600 to-red-700 border-none rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30 disabled:opacity-50"
                                    onClick={handleSearch}
                                    disabled={isSearching}
                                >
                                    {isSearching ? '...' : 'Search'}
                                </button>
                            </div>

                            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 md:gap-2 min-h-[200px]">
                                {isSearching ? (
                                    <div className="col-span-full text-center text-gray-400">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map((card) => (
                                        <SearchResultItem
                                            key={card.id || Math.random()}
                                            card={card}
                                            onClick={handleSelectFromSearch}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full text-center text-gray-500">
                                        {searchQuery ? 'No cards found.' : 'Enter a name to search.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* URL Tab */}
                    {activeTab === 'url' && (
                        <div className="flex flex-col gap-4">
                            <input
                                type="text"
                                placeholder="Enter image URL..."
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white text-[15px] outline-none transition-all duration-200 placeholder:text-white/30 focus:border-white/25 focus:bg-white/[0.08]"
                                onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                            />
                            <button
                                className="px-7 py-3.5 bg-gradient-to-br from-red-600 to-red-700 border-none rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30"
                                onClick={handleUrlSubmit}
                            >
                                Add Card
                            </button>
                        </div>
                    )}

                    {/* Upload Tab */}
                    {activeTab === 'upload' && (
                        <div className="flex flex-col items-center">
                            {previewUrl ? (
                                <div className="flex flex-col items-center gap-5">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-[200px] max-h-[280px] rounded-lg shadow-xl"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            className="px-7 py-3.5 bg-gradient-to-br from-red-600 to-red-700 border-none rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30"
                                            onClick={confirmUpload}
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            className="px-7 py-3.5 bg-white/10 border-none rounded-xl text-white text-[15px] font-semibold cursor-pointer transition-all duration-200 hover:bg-white/15"
                                            onClick={() => setPreviewUrl(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className="w-full py-15 px-10 border-2 border-dashed border-white/15 rounded-xl flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 hover:border-white/30 hover:bg-white/[0.03]"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                    <div className="text-5xl">📁</div>
                                    <p className="text-white/50 text-sm">Click to upload an image</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

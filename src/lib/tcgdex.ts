import TCGdex from '@tcgdex/sdk';

export const tcgdex = new TCGdex('en');

export const getTcgdexImageUrl = (card: any, quality: 'low' | 'high', extension: 'webp' | 'png'): string | null => {
    // 1. Try the card's image property directly (most reliable)
    if (card.image) {
        // TCGdex returns image base URL, append quality and extension
        return `${card.image}/${quality}.${extension}`;
    }

    // 2. Try SDK methods
    if (typeof card.getImageUrl === 'function') {
        try {
            const url = card.getImageUrl(quality, extension);
            if (url && !url.includes('undefined')) return url;
        } catch { /* ignore */ }
    }
    
    if (typeof card.getImageURL === 'function') {
        try {
            const url = card.getImageURL(quality, extension);
            if (url && !url.includes('undefined')) return url;
        } catch { /* ignore */ }
    }

    // 3. Try manual construction from card data
    // Format: https://assets.tcgdex.net/en/{seriesId}/{setId}/{localId}/{quality}.{extension}
    try {
        const setId = card.set?.id;
        const localId = card.localId;
        const seriesId = card.set?.series?.id || card.series?.id;

        if (setId && localId && seriesId) {
            return `https://assets.tcgdex.net/en/${seriesId}/${setId}/${localId}/${quality}.${extension}`;
        }
    } catch { /* ignore */ }

    // 4. Try images object (different API format)
    if (card.images) {
        const url = quality === 'high' ? card.images.large : card.images.small;
        if (url) return url;
    }

    return null;
};

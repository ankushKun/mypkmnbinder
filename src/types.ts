export interface PokemonCard {
    id: string;
    name: string;
    imageUrl: string;
    rarity?: 'common' | 'uncommon' | 'rare' | 'holo' | 'ultra-rare';
    set?: string;
}

export interface CardSlot {
    id: string;
    card: PokemonCard | null;
}

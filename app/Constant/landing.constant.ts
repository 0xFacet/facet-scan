export interface IHero {
    firstTitle: string;
    badge: string;
    secondTitle: string;
    description: string;
}

export interface IButton {
    create: string;
    learn: string;
}

export const HERO: IHero = {
    firstTitle: "The future of",
    badge: "decentralized",
    secondTitle: "processing is here",
    description: "Revolutionizing computation with Dumb Contracts"
}

export const BUTTON: IButton = {
    create: "Create Now",
    learn: "Learn More"
}
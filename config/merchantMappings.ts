export interface MerchantMapping {
    keywords: string[];
    category: string;
    subCategory?: string;
}

export const MERCHANT_MAPPINGS: MerchantMapping[] = [
    // ALIMENTACIÓN
    { keywords: ['MERCADONA', 'CARREFOUR', 'LIDL', 'ALDI', 'DIA ', 'AHORRAMAS', 'CONSUM', 'EROSKI', 'SUPERCOR', 'HIPERCOR'], category: 'Alimentación' },

    // RESTAURACIÓN
    { keywords: ['RESTAURANTE', 'BAR ', 'CAFETERIA', 'MC DONALD', 'BURGER KING', 'KFC', 'STARBUCKS', 'GLOVO', 'JUST EAT', 'UBER EATS'], category: 'Comida y Bebida', subCategory: 'Restaurantes' },

    // TRANSPORTE Y COMBUSTIBLE
    { keywords: ['REPSOL', 'CEPSA', 'BP ', 'SHELL', 'GASOLINERA', 'ESTACION SERV', 'GALP', 'PETROL', 'UBER', 'CABIFY', 'RENFE', 'METRO '], category: 'Transporte', subCategory: 'Gasolina' },

    // HOGAR
    { keywords: ['IKEA', 'LEROY MERLIN', 'BAUHAUS', 'CONFORAMA', 'ZARA HOME', 'H&M HOME', 'ENDESA', 'IBERDROLA', 'NATURGY', 'TELEFONICA', 'MOVISTAR', 'ORANGE', 'VODAFONE'], category: 'Vivienda', subCategory: 'Suministros' },

    // SALUD
    { keywords: ['FARMACIA', 'OPTICA', 'DENTAL', 'FISIO', 'HOSPITAL', 'CLINICA', 'SANITAS', 'ADESLAS', 'MAPFRE SALUD'], category: 'Salud' },

    // OCIO Y SUSCRIPCIONES
    { keywords: ['NETFLIX', 'SPOTIFY', 'DISNEY PLUS', 'AMAZON PRIME', 'HBO ', 'APPLE.COM/BILL', 'GOOGLE *', 'PLAYSTATION', 'NINTENDO', 'STEAM'], category: 'Ocio', subCategory: 'Suscripciones' },

    // COMPRAS GENERALES
    { keywords: ['AMAZON', 'EL CORTE INGLES', 'ZARA', 'H&M', 'DECATHLON', 'MEDIA MARKT', 'WORTEN', 'PC COMPONENTES'], category: 'Compras' },

    // EDUCACIÓN
    { keywords: ['COLEGIO', 'UNIVERSIDAD', 'CURSO', 'ACADEMIA', 'UDEMY', 'COURSERA'], category: 'Educación' }
];

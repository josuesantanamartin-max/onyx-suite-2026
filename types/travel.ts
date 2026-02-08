export interface Flight {
    id: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    airline: string;
    flightNumber: string;
    price: number;
    bookingUrl?: string;
}

export interface Accommodation {
    id: string;
    name: string;
    address: string;
    checkIn: string;
    checkOut: string;
    price: number;
    bookingUrl?: string;
}

export interface ItineraryItem {
    id: string;
    time: string;
    activity: string;
    location?: string;
    type: 'ACTIVITY' | 'FOOD' | 'TRANSPORT';
}

export interface Trip {
    id: string;
    destination: string;
    country: string;
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    status: 'UPCOMING' | 'CURRENT' | 'COMPLETED';
    image: string;
    flights?: Flight[];
    accommodations?: Accommodation[];
    itinerary: ItineraryItem[];
    checklist?: { id: string; task: string; completed: boolean }[];
    linkedGoalId?: string;
}

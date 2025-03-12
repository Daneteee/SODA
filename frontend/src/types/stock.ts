// Interfaz para los datos que recibimos de Finnhub
export interface FinnhubTrade {
    data: {
    c: string[]; // Códigos de condición
    p: number;   // Precio
    s: string;   // Símbolo
    t: number;   // Timestamp (milisegundos)
    v: number;   // Volumen
    }[];
    type: string;
}

// Interfaz para nuestro estado de stocks
export interface Stock {
    symbol: string;       // Símbolo de la acción (Ej: AAPL, TSLA)
    name: string;         // Nombre de la empresa (Ej: Apple Inc.)
    price: number;        // Precio actual
    previousPrice: number | null; // Precio anterior (opcional)
    priceChange: number;  // Cambio porcentual del precio
    volume: number;       // Volumen de transacciones
    lastUpdate: string;   // Última actualización en formato string
    conditions: string[]; // Condiciones del mercado
}

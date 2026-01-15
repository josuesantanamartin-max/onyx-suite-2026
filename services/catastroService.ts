/**
 * Catastro Service
 * 
 * Provides integration with the Spanish Cadastre (Catastro) API
 * to fetch non-protected property data using cadastral reference.
 * 
 * API Documentation: https://ovc.catastro.meh.es/
 */

export interface CadastralData {
    referencia: string;
    superficie?: number;        // m² built surface
    añoConstruccion?: number;
    uso?: string;              // Residential, Industrial, etc.
    localizacion?: {
        bloque?: string;
        escalera?: string;
        planta?: string;
        puerta?: string;
    };
    lastUpdated?: string;      // ISO date of last query
}

export interface CatastroResponse {
    success: boolean;
    data?: CadastralData;
    error?: string;
}

/**
 * Validates Spanish cadastral reference format
 * Format: 14 digits + 2 letters + 4 digits + 1 letter (20 chars total)
 * Example: 9872023VH5797S0001WX
 */
export const isValidCadastralReference = (ref: string): boolean => {
    const regex = /^[0-9]{14}[A-Z]{2}[0-9]{4}[A-Z]$/;
    return regex.test(ref.toUpperCase().replace(/\s/g, ''));
};

/**
 * Fetches cadastral data from the official Catastro API
 * 
 * @param referencia - 20-character cadastral reference
 * @returns Promise with cadastral data or error
 */
export const fetchCadastralData = async (referencia: string): Promise<CatastroResponse> => {
    try {
        // Validate format
        const cleanRef = referencia.toUpperCase().replace(/\s/g, '');
        if (!isValidCadastralReference(cleanRef)) {
            return {
                success: false,
                error: 'Formato de referencia catastral inválido. Debe tener 20 caracteres (14 dígitos + 2 letras + 4 dígitos + 1 letra).'
            };
        }

        // Extract province and municipality codes from reference
        const provincia = cleanRef.substring(0, 2);
        const municipio = cleanRef.substring(2, 5);

        // Build API endpoint
        const endpoint = `https://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/Consulta_DNPRC`;
        const params = new URLSearchParams({
            Provincia: provincia,
            Municipio: municipio,
            RC: cleanRef
        });

        const response = await fetch(`${endpoint}?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/xml',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();

        // Parse XML response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Check for API errors
        const errorNode = xmlDoc.querySelector('err');
        if (errorNode) {
            const errorDesc = errorNode.querySelector('des')?.textContent || 'Error desconocido';
            return {
                success: false,
                error: `Error del Catastro: ${errorDesc}`
            };
        }

        // Extract data from XML
        const biNode = xmlDoc.querySelector('bi');
        if (!biNode) {
            return {
                success: false,
                error: 'No se encontraron datos para esta referencia catastral.'
            };
        }

        const superficie = biNode.querySelector('sfc')?.textContent;
        const ano = biNode.querySelector('ant')?.textContent;
        const uso = biNode.querySelector('luso')?.textContent;
        const bloque = biNode.querySelector('loin > locs > lous > lourb > dir > bq')?.textContent;
        const escalera = biNode.querySelector('loin > locs > lous > lourb > dir > es')?.textContent;
        const planta = biNode.querySelector('loin > locs > lous > lourb > dir > pt')?.textContent;
        const puerta = biNode.querySelector('loin > locs > lous > lourb > dir > pu')?.textContent;

        const cadastralData: CadastralData = {
            referencia: cleanRef,
            superficie: superficie ? parseFloat(superficie) : undefined,
            añoConstruccion: ano ? parseInt(ano) : undefined,
            uso: uso || undefined,
            localizacion: (bloque || escalera || planta || puerta) ? {
                bloque: bloque || undefined,
                escalera: escalera || undefined,
                planta: planta || undefined,
                puerta: puerta || undefined,
            } : undefined,
            lastUpdated: new Date().toISOString(),
        };

        return {
            success: true,
            data: cadastralData
        };

    } catch (error) {
        console.error('Error fetching cadastral data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al conectar con el servicio del Catastro. Por favor, inténtalo de nuevo.'
        };
    }
};

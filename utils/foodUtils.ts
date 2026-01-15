
export const INGREDIENT_CATEGORY_MAP: Record<string, string> = {
    // Dairy
    'leche': 'Dairy', 'yogur': 'Dairy', 'queso': 'Dairy', 'mantequilla': 'Dairy', 'nata': 'Dairy',
    'huevos': 'Dairy', 'egg': 'Dairy', 'milk': 'Dairy', 'cheese': 'Dairy', 'yogurt': 'Dairy',
    'parmesano': 'Dairy', 'mozzarella': 'Dairy', 'cheddar': 'Dairy',

    // Vegetables
    'tomate': 'Vegetables', 'cebolla': 'Vegetables', 'ajo': 'Vegetables', 'zanahoria': 'Vegetables',
    'pimiento': 'Vegetables', 'lechuga': 'Vegetables', 'spinach': 'Vegetables', 'patata': 'Vegetables',
    'calabacin': 'Vegetables', 'berenjena': 'Vegetables', 'pepino': 'Vegetables', 'aguacate': 'Vegetables',
    'brócoli': 'Vegetables', 'coliflor': 'Vegetables', 'champiñones': 'Vegetables', 'setas': 'Vegetables',
    'cilantro': 'Vegetables', 'perejil': 'Vegetables', 'albahaca': 'Vegetables',

    // Fruits
    'manzana': 'Fruits', 'plátano': 'Fruits', 'naranja': 'Fruits', 'limón': 'Fruits', 'fresa': 'Fruits',
    'arándano': 'Fruits', 'uva': 'Fruits', 'pera': 'Fruits', 'piña': 'Fruits', 'kiwi': 'Fruits',
    'mango': 'Fruits', 'lima': 'Fruits',

    // Meat & Fish
    'pollo': 'Meat', 'ternera': 'Meat', 'cerdo': 'Meat', 'carne': 'Meat', 'bacon': 'Meat',
    'salmón': 'Meat', 'atún': 'Meat', 'merluza': 'Meat', 'gamba': 'Meat', 'pescado': 'Meat',
    'jamón': 'Meat', 'pavo': 'Meat', 'salchicha': 'Meat',

    // Pantry
    'arroz': 'Pantry', 'pasta': 'Pantry', 'pan': 'Pantry', 'harina': 'Pantry', 'azúcar': 'Pantry',
    'sal': 'Pantry', 'pimienta': 'Pantry', 'aceite': 'Pantry', 'vinagre': 'Pantry', 'lentejas': 'Pantry',
    'garbanzos': 'Pantry', 'judías': 'Pantry', 'cereales': 'Pantry', 'avena': 'Pantry', 'chocolate': 'Pantry',
    'café': 'Pantry', 'té': 'Pantry', 'miel': 'Pantry', 'frutos secos': 'Pantry', 'galletas': 'Pantry',
    'tomate frito': 'Pantry', 'salsa': 'Pantry', 'mayonesa': 'Pantry',

    // Frozen
    'hielo': 'Frozen', 'guisantes congelados': 'Frozen', 'helado': 'Frozen',

    // Spices
    'orégano': 'Spices', 'tomillo': 'Spices', 'romero': 'Spices', 'comino': 'Spices', 'pimentón': 'Spices',
    'canela': 'Spices', 'curry': 'Spices', 'jengibre': 'Spices',
};

export const getIngredientCategory = (name: string): string => {
    const lowerName = name.toLowerCase();

    // Check exact matches
    if (INGREDIENT_CATEGORY_MAP[lowerName]) {
        return INGREDIENT_CATEGORY_MAP[lowerName];
    }

    // Check partial matches or "ends with" (e.g. "Salsa de Soja" -> "Salsa")
    for (const [key, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
        if (lowerName.includes(key)) {
            return category;
        }
    }

    // Heuristics
    if (lowerName.includes('congelad')) return 'Frozen';
    if (lowerName.includes('helado')) return 'Frozen';
    if (lowerName.includes('salsa')) return 'Pantry';

    return 'Other'; // Default
};

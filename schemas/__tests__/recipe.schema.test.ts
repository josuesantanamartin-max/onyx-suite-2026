import { describe, it, expect } from 'vitest';
import { recipeSchema, validateRecipe } from '../recipe.schema';

describe('Recipe Schema', () => {
    describe('Recetas Válidas', () => {
        it('debe validar una receta completa', () => {
            const validRecipe = {
                name: 'Paella Valenciana',
                prepTime: 60,
                calories: 450,
                tags: ['español', 'arroz', 'mariscos'],
                rating: 4.5,
                baseServings: 4,
                image: 'https://example.com/paella.jpg',
                courseType: 'MAIN',
                ingredients: [
                    { name: 'Arroz', quantity: 400, unit: 'g' },
                    { name: 'Gambas', quantity: 200, unit: 'g' },
                    { name: 'Azafrán', quantity: 1, unit: 'pizca' },
                ],
                instructions: [
                    'Calentar el aceite en la paellera',
                    'Añadir el arroz y sofreír',
                    'Agregar el caldo y cocinar 18 minutos',
                ],
            };

            const result = validateRecipe(validRecipe);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.name).toBe('Paella Valenciana');
                expect(result.data.ingredients).toHaveLength(3);
                expect(result.data.instructions).toHaveLength(3);
            }
        });

        it('debe validar receta con campos mínimos', () => {
            const minimalRecipe = {
                name: 'Tostada',
                prepTime: 5,
                calories: 100,
                tags: ['desayuno'],
                baseServings: 1,
                ingredients: [
                    { name: 'Pan', quantity: 1, unit: 'rebanada' },
                ],
                instructions: [
                    'Tostar el pan',
                ],
            };

            const result = validateRecipe(minimalRecipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta sin imagen', () => {
            const recipe = {
                name: 'Ensalada Simple',
                prepTime: 10,
                calories: 150,
                tags: ['saludable'],
                baseServings: 2,
                ingredients: [
                    { name: 'Lechuga', quantity: 200, unit: 'g' },
                ],
                instructions: [
                    'Lavar y cortar la lechuga',
                ],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta con rating 0', () => {
            const recipe = {
                name: 'Receta Nueva',
                prepTime: 30,
                calories: 200,
                tags: ['nuevo'],
                rating: 0,
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: [
                    'Preparar ingrediente',
                ],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta con 0 calorías', () => {
            const recipe = {
                name: 'Agua con Limón',
                prepTime: 2,
                calories: 0,
                tags: ['bebida'],
                baseServings: 1,
                ingredients: [
                    { name: 'Agua', quantity: 250, unit: 'ml' },
                    { name: 'Limón', quantity: 0.5, unit: 'unidad' },
                ],
                instructions: [
                    'Mezclar agua con jugo de limón',
                ],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar todos los tipos de plato', () => {
            const courseTypes = ['STARTER', 'MAIN', 'DESSERT', 'SIDE', 'DRINK'];

            courseTypes.forEach(courseType => {
                const recipe: any = {
                    name: `Receta ${courseType}`,
                    prepTime: 30,
                    calories: 200,
                    tags: ['test'],
                    baseServings: 2,
                    courseType,
                    ingredients: [
                        { name: 'Ingrediente', quantity: 100, unit: 'g' },
                    ],
                    instructions: [
                        'Preparar',
                    ],
                };

                const result = validateRecipe(recipe);
                expect(result.success).toBe(true);
            });
        });
    });

    describe('Recetas Inválidas', () => {
        it('debe rechazar nombre vacío', () => {
            const invalidRecipe = {
                name: '',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('cannot be empty');
            }
        });

        it('debe rechazar nombre mayor a 200 caracteres', () => {
            const invalidRecipe = {
                name: 'a'.repeat(201),
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than 200');
            }
        });

        it('debe rechazar tiempo de preparación 0', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 0,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('greater than 0');
            }
        });

        it('debe rechazar tiempo de preparación negativo', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: -10,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar tiempo de preparación mayor a 24 horas', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 1441, // Más de 24 horas
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than 24 hours');
            }
        });

        it('debe rechazar tiempo de preparación decimal', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30.5,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('integer');
            }
        });

        it('debe rechazar calorías negativas', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: -100,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('non-negative');
            }
        });

        it('debe rechazar calorías decimales', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200.5,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar array de tags vacío', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: [],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('At least one tag');
            }
        });

        it('debe rechazar más de 10 tags', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: Array(11).fill('tag'),
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Maximum 10 tags');
            }
        });

        it('debe rechazar rating negativo', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                rating: -1,
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('between 0 and 5');
            }
        });

        it('debe rechazar rating mayor a 5', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                rating: 6,
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar porciones base 0', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 0,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar porciones base mayor a 100', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 101,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar URL de imagen inválida', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                image: 'not-a-url',
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('valid URL');
            }
        });

        it('debe rechazar array de ingredientes vacío', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('At least one ingredient');
            }
        });

        it('debe rechazar más de 50 ingredientes', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: Array(51).fill({ name: 'Ingrediente', quantity: 100, unit: 'g' }),
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Maximum 50 ingredients');
            }
        });

        it('debe rechazar array de instrucciones vacío', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: [],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('At least one instruction');
            }
        });

        it('debe rechazar más de 50 instrucciones', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: Array(51).fill('Paso'),
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('Maximum 50 instructions');
            }
        });

        it('debe rechazar instrucción vacía', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: [''],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar instrucción mayor a 500 caracteres', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['a'.repeat(501)],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0].message).toContain('less than 500');
            }
        });
    });

    describe('Validación de Ingredientes', () => {
        it('debe rechazar ingrediente con nombre vacío', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: '', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar ingrediente con cantidad 0', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Sal', quantity: 0, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar ingrediente con cantidad negativa', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Azúcar', quantity: -50, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe rechazar ingrediente con unidad vacía', () => {
            const invalidRecipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Harina', quantity: 200, unit: '' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(invalidRecipe);

            expect(result.success).toBe(false);
        });

        it('debe validar ingredientes con cantidades decimales', () => {
            const recipe = {
                name: 'Receta',
                prepTime: 30,
                calories: 200,
                tags: ['test'],
                baseServings: 2,
                ingredients: [
                    { name: 'Aceite', quantity: 2.5, unit: 'cucharadas' },
                    { name: 'Sal', quantity: 0.5, unit: 'cucharadita' },
                ],
                instructions: ['Mezclar'],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });
    });

    describe('Casos Extremos', () => {
        it('debe validar receta con 1440 minutos de preparación (24 horas exactas)', () => {
            const recipe = {
                name: 'Caldo de Huesos',
                prepTime: 1440,
                calories: 50,
                tags: ['lento'],
                baseServings: 8,
                ingredients: [
                    { name: 'Huesos', quantity: 1000, unit: 'g' },
                ],
                instructions: ['Cocinar a fuego lento 24 horas'],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta con 10 tags exactos', () => {
            const recipe = {
                name: 'Receta Compleja',
                prepTime: 60,
                calories: 300,
                tags: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
                baseServings: 4,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: ['Preparar'],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta con 50 ingredientes exactos', () => {
            const recipe = {
                name: 'Receta Muy Compleja',
                prepTime: 120,
                calories: 500,
                tags: ['complejo'],
                baseServings: 10,
                ingredients: Array(50).fill({ name: 'Ingrediente', quantity: 10, unit: 'g' }),
                instructions: ['Preparar todo'],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta con 50 instrucciones exactas', () => {
            const recipe = {
                name: 'Receta Detallada',
                prepTime: 180,
                calories: 400,
                tags: ['detallado'],
                baseServings: 6,
                ingredients: [
                    { name: 'Ingrediente', quantity: 100, unit: 'g' },
                ],
                instructions: Array(50).fill('Paso detallado'),
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta con rating 5', () => {
            const recipe = {
                name: 'Receta Perfecta',
                prepTime: 45,
                calories: 350,
                tags: ['excelente'],
                rating: 5,
                baseServings: 4,
                ingredients: [
                    { name: 'Ingrediente Premium', quantity: 200, unit: 'g' },
                ],
                instructions: ['Preparar con cuidado'],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });

        it('debe validar receta con 100 porciones base', () => {
            const recipe = {
                name: 'Receta para Evento',
                prepTime: 240,
                calories: 250,
                tags: ['evento'],
                baseServings: 100,
                ingredients: [
                    { name: 'Ingrediente', quantity: 10000, unit: 'g' },
                ],
                instructions: ['Preparar en grandes cantidades'],
            };

            const result = validateRecipe(recipe);

            expect(result.success).toBe(true);
        });
    });
});

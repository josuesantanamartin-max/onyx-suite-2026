import { CategoryStructure, DashboardWidget, AutomationRule, DashboardLayout } from './types';

// --- PURE CONSTANTS ---

export const INITIAL_CATEGORIES: CategoryStructure[] = [
  { id: 'cat_1', type: 'EXPENSE', name: 'Vivienda', subCategories: ['Alquiler', 'Hipoteca', 'Comunidad', 'Mantenimiento', 'Seguro Hogar', 'Muebles y Decoración', 'Impuestos', 'Jardín'] },
  { id: 'cat_2', type: 'EXPENSE', name: 'Alimentación', subCategories: ['Supermercado', 'Restaurantes', 'Cafetería', 'Comida a Domicilio', 'Bebidas', 'Comedor Escolar'] },
  { id: 'cat_3', type: 'EXPENSE', name: 'Transporte', subCategories: ['Gasolina', 'Transporte Público', 'Mantenimiento', 'Parking', 'Seguro Vehículo', 'Taxi/VTC', 'Peajes', 'ITV'] },
  { id: 'cat_4', type: 'EXPENSE', name: 'Servicios', subCategories: ['Luz', 'Agua', 'Gas', 'Internet', 'Móvil', 'Streaming', 'Software', 'Limpieza', 'Seguridad'] },
  { id: 'cat_5', type: 'EXPENSE', name: 'Ocio', subCategories: ['Cine y Eventos', 'Viajes', 'Suscripciones', 'Deportes', 'Hobbies', 'Libros', 'Salidas Nocturnas'] },
  { id: 'cat_6', type: 'EXPENSE', name: 'Salud', subCategories: ['Médico', 'Farmacia', 'Gimnasio', 'Dentista', 'Psicólogo', 'Óptica', 'Seguro Salud'] },
  { id: 'cat_7', type: 'EXPENSE', name: 'Compras', subCategories: ['Ropa', 'Calzado', 'Electrónica', 'Accesorios', 'Hogar'] },
  { id: 'cat_8', type: 'EXPENSE', name: 'Educación', subCategories: ['Matrícula', 'Cursos y Formación', 'Material Escolar', 'Libros de Texto', 'Clases Particulares'] },
  { id: 'cat_9', type: 'EXPENSE', name: 'Cuidado Personal', subCategories: ['Peluquería', 'Estética', 'Cosmética', 'Masajes'] },
  { id: 'cat_10', type: 'EXPENSE', name: 'Mascotas', subCategories: ['Comida', 'Veterinario', 'Accesorios', 'Higiene'] },
  { id: 'cat_11', type: 'EXPENSE', name: 'Familia', subCategories: ['Cuidado Infantil', 'Juguetes', 'Ayuda Familiar', 'Paga Semanal'] },
  { id: 'cat_12', type: 'EXPENSE', name: 'Deudas', subCategories: ['Préstamo Personal', 'Tarjeta de Crédito', 'Intereses'] },
  { id: 'cat_13', type: 'EXPENSE', name: 'Ahorro', subCategories: ['Fondo Emergencia', 'Inversión', 'Hucha Virtual', 'Plan de Viaje'] },
  { id: 'cat_14', type: 'EXPENSE', name: 'Transferencia', subCategories: ['Entre Cuentas', 'Liquidación Tarjeta', 'Aportación Inversión', 'Bizum / Envío dinero'] },
  { id: 'cat_15', type: 'EXPENSE', name: 'Otros', subCategories: ['Donaciones', 'Multas', 'Tasas', 'Bancarios', 'Sin Clasificar'] },
  { id: 'cat_16', type: 'INCOME', name: 'Trabajo', subCategories: ['Salario', 'Bonus', 'Horas Extra', 'Comisiones', 'Dietas'] },
  { id: 'cat_17', type: 'INCOME', name: 'Negocios', subCategories: ['Ventas', 'Servicios', 'Consultoría'] },
  { id: 'cat_18', type: 'INCOME', name: 'Inversiones', subCategories: ['Dividendos', 'Intereses', 'Alquileres', 'Ganancias Capital', 'Criptomonedas'] },
  { id: 'cat_19', type: 'INCOME', name: 'Extraordinarios', subCategories: ['Devolución Compra', 'Regalos', 'Venta Segunda Mano', 'Premios', 'Herencias', 'Devolución Impuestos'] },
  { id: 'cat_20', type: 'INCOME', name: 'Ayudas', subCategories: ['Becas', 'Subvenciones', 'Prestaciones', 'Pensiones'] },
  { id: 'cat_21', type: 'INCOME', name: 'Transferencia', subCategories: ['Desde otra cuenta', 'Reintegro Ahorros'] },
];

export const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: 'NET_WORTH', visible: true, order: 1 },
  { id: 'MONTHLY_FLOW', visible: true, order: 2 },
  { id: 'FINANCIAL_HEALTH', visible: true, order: 3 },
  { id: 'UPCOMING_PAYMENTS', visible: true, order: 4 },
  { id: 'CATEGORY_CHART', visible: true, order: 5 },
  { id: 'TIMELINE_EVOLUTION', visible: true, order: 6 },
  { id: 'EXPLORER', visible: true, order: 7 },
  { id: 'ACTIVE_GOALS', visible: true, order: 8 },
  { id: 'ACTIVE_DEBTS', visible: true, order: 9 },
  { id: 'MONTHLY_GOALS', visible: true, order: 10 },
  { id: 'SPENDING_FORECAST', visible: true, order: 11 },
  { id: 'PROJECTION_WIDGET', visible: true, order: 12 },
  { id: 'ANNUAL_COMPARISON', visible: false, order: 13 },
  { id: 'SHOPPING_LIST', visible: true, order: 14 },
  { id: 'TODAY_MENU', visible: true, order: 15 },
  { id: 'FAMILY_AGENDA', visible: true, order: 16 },
  { id: 'RECIPE_FAVORITES', visible: true, order: 17 },
  { id: 'WEEKLY_PLAN', visible: true, order: 18 },
  { id: 'UPCOMING_TRIPS', visible: true, order: 19 },
  { id: 'FAMILY_TASKS', visible: true, order: 20 },
  { id: 'CRITICAL_INVENTORY', visible: true, order: 21 },
  { id: 'BUDGET_STATUS', visible: true, order: 22 },
];

export const DEFAULT_RULES: AutomationRule[] = [
  { id: 'rule_1', name: 'Alerta Gasto Alto (>200€)', trigger: 'TRANSACTION_OVER_AMOUNT', threshold: 200, action: 'SEND_ALERT', isActive: true },
  { id: 'rule_2', name: 'Categoría Viaje Automática', trigger: 'TRIP_CREATED', action: 'CREATE_CATEGORY_FOR_TRIP', isActive: true },
];

export const DEFAULT_LAYOUTS: DashboardLayout[] = [
  {
    id: 'default',
    name: 'Vista Ejecutiva',
    description: 'Vista rápida de métricas clave',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      { i: 'NET_WORTH', x: 0, y: 0, w: 6, h: 2, minW: 4, minH: 2, visible: true },
      { i: 'MONTHLY_FLOW', x: 6, y: 0, w: 6, h: 2, minW: 4, minH: 2, visible: true },
      { i: 'CATEGORY_CHART', x: 0, y: 2, w: 12, h: 3, minW: 6, minH: 2, visible: true },
      { i: 'ACTIVE_GOALS', x: 0, y: 5, w: 6, h: 2, minW: 4, minH: 2, visible: true },
      { i: 'ACTIVE_DEBTS', x: 6, y: 5, w: 6, h: 2, minW: 4, minH: 2, visible: true },
    ],
  },
  {
    id: 'detailed',
    name: 'Vista Detallada',
    description: 'Análisis profundo con todos los widgets',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      { i: 'NET_WORTH', x: 0, y: 0, w: 3, h: 2, visible: true },
      { i: 'MONTHLY_FLOW', x: 3, y: 0, w: 3, h: 2, visible: true },
      { i: 'ACTIVE_GOALS', x: 6, y: 0, w: 3, h: 2, visible: true },
      { i: 'ACTIVE_DEBTS', x: 9, y: 0, w: 3, h: 2, visible: true },
      { i: 'TIMELINE_EVOLUTION', x: 0, y: 2, w: 12, h: 3, visible: true },
      { i: 'CATEGORY_CHART', x: 0, y: 5, w: 6, h: 3, visible: true },
      { i: 'SPENDING_FORECAST', x: 6, y: 5, w: 6, h: 3, visible: true },
      { i: 'RECENT_TRANSACTIONS', x: 0, y: 8, w: 12, h: 2, visible: true },
    ],
  },
  {
    id: 'minimal',
    name: 'Vista Minimalista',
    description: 'Solo lo esencial',
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    widgets: [
      { i: 'NET_WORTH', x: 0, y: 0, w: 12, h: 3, visible: true },
      { i: 'MONTHLY_FLOW', x: 0, y: 3, w: 6, h: 2, visible: true },
      { i: 'CATEGORY_CHART', x: 6, y: 3, w: 6, h: 2, visible: true },
    ],
  },
];

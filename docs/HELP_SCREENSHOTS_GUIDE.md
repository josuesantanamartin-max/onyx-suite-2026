# Guía: Cómo Agregar Screenshots a los Artículos de Ayuda

Esta guía explica cómo capturar y agregar screenshots reales de tu aplicación a los artículos del Centro de Ayuda.

## 📸 Paso 1: Capturar Screenshots

### Herramientas Recomendadas
- **Windows**: Snipping Tool (Win + Shift + S) o ShareX
- **Mac**: Cmd + Shift + 4
- **Extensión de navegador**: Awesome Screenshot, Nimbus Screenshot

### Mejores Prácticas
1. **Resolución**: Captura en alta resolución (mínimo 1920x1080)
2. **Limpieza**: Oculta información personal/sensible
3. **Contexto**: Incluye suficiente interfaz para entender el contexto
4. **Consistencia**: Usa el mismo tema (claro/oscuro) en todas
5. **Formato**: Guarda como PNG para mejor calidad

---

## 📂 Paso 2: Organizar Screenshots

### Estructura de Carpetas
Crea la siguiente estructura en tu proyecto:

```
public/
└── help-screenshots/
    ├── csv-import-step1.png
    ├── csv-import-step2.png
    ├── csv-import-step3.png
    ├── budget-form.png
    ├── budget-progress.png
    ├── weekly-planner.png
    ├── ai-recipe-generator.png
    ├── dashboard-edit-mode.png
    ├── widget-gallery.png
    ├── privacy-panel.png
    ├── onboarding-welcome.png
    └── dashboard-overview.png
```

### Convención de Nombres
- Usa nombres descriptivos en inglés
- Usa guiones para separar palabras
- Incluye el paso si es una secuencia (step1, step2, etc.)
- Mantén nombres cortos pero claros

---

## 🎯 Paso 3: Screenshots Necesarios

### Artículo: "Importar Transacciones CSV"
**3 screenshots:**
1. `csv-import-step1.png` - Zona de arrastre de archivos
2. `csv-import-step2.png` - Vista previa con mapeo de columnas
3. `csv-import-step3.png` - Confirmación de importación exitosa

**Cómo capturar:**
- Ve a Finanzas → Transacciones → Importar CSV
- Captura cada paso del proceso
- Asegúrate de mostrar datos de ejemplo claros

---

### Artículo: "Crear Presupuestos"
**2 screenshots:**
1. `budget-form.png` - Formulario de creación
2. `budget-progress.png` - Vista de progreso con barras

**Cómo capturar:**
- Ve a Finanzas → Presupuestos → Nuevo Presupuesto
- Captura el formulario completo
- Captura la vista de lista con varios presupuestos mostrando progreso

---

### Artículo: "Planificación de Comidas"
**2 screenshots:**
1. `weekly-planner.png` - Calendario semanal con recetas
2. `ai-recipe-generator.png` - Interfaz de generación con IA

**Cómo capturar:**
- Ve a Vida → Cocina → Plan Semanal
- Arrastra algunas recetas al calendario antes de capturar
- Captura el modal de generación de recetas con IA

---

### Artículo: "Personalizar Dashboard"
**2 screenshots:**
1. `dashboard-edit-mode.png` - Dashboard en modo edición
2. `widget-gallery.png` - Galería de widgets disponibles

**Cómo capturar:**
- Activa el modo edición del dashboard
- Captura mostrando las guías de arrastre
- Abre la galería de widgets y captura

---

### Artículo: "Configuración de Privacidad"
**1 screenshot:**
1. `privacy-panel.png` - Panel completo de privacidad

**Cómo capturar:**
- Ve a Configuración → Privacidad
- Captura todo el panel con todas las opciones visibles

---

### Artículo: "Primeros Pasos"
**2 screenshots:**
1. `onboarding-welcome.png` - Primera pantalla del onboarding
2. `dashboard-overview.png` - Dashboard principal completo

**Cómo capturar:**
- Crea una cuenta nueva para capturar el onboarding
- Captura el dashboard con datos de ejemplo

---

## 🔧 Paso 4: Optimizar Imágenes

### Herramientas de Optimización
- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim** (Mac)

### Objetivos
- Reducir tamaño de archivo sin perder calidad
- Objetivo: < 200KB por imagen
- Mantener legibilidad del texto

---

## ✅ Paso 5: Verificar Implementación

### Checklist
- [ ] Todas las imágenes están en `public/help-screenshots/`
- [ ] Los nombres coinciden con los definidos en `helpArticleImages.ts`
- [ ] Las imágenes son claras y legibles
- [ ] No hay información sensible visible
- [ ] El tamaño de archivo es razonable
- [ ] Las imágenes se ven bien en tema claro y oscuro

### Probar en la App
1. Abre el Centro de Ayuda
2. Navega a cada artículo con imágenes
3. Verifica que las imágenes se cargan correctamente
4. Prueba la navegación del carrusel (si hay múltiples imágenes)
5. Verifica que las leyendas se muestran correctamente

---

## 🎨 Consejos de Diseño

### Para Mejores Screenshots
1. **Usa datos realistas**: No uses "Lorem Ipsum" o datos obviamente falsos
2. **Muestra el estado correcto**: Captura en el momento exacto del proceso
3. **Resalta elementos clave**: Usa flechas o resaltados si es necesario
4. **Mantén consistencia**: Mismo zoom, mismo tema en todas
5. **Evita desorden**: Cierra notificaciones o popups innecesarios

### Edición Opcional
Si quieres mejorar las screenshots:
- Añade flechas o círculos para resaltar elementos clave
- Difumina información sensible
- Añade números de paso si es una secuencia
- Usa herramientas como Snagit o Skitch

---

## 🔄 Actualizar Screenshots

Cuando actualices la UI de la app:
1. Identifica qué screenshots quedaron obsoletos
2. Recaptura solo las necesarias
3. Mantén los mismos nombres de archivo
4. Optimiza las nuevas imágenes
5. Verifica que todo se ve bien

---

## 📝 Notas Adicionales

### Fallback Automático
Si una imagen no se encuentra, el componente `ArticleImageGallery` mostrará automáticamente un placeholder gris con el texto "Screenshot Placeholder".

### Agregar Más Imágenes
Para agregar imágenes a otros artículos:

1. Edita `data/helpArticleImages.ts`
2. Agrega un nuevo entry en el objeto `articleImages`:
```typescript
'article-id': [
    {
        src: '/help-screenshots/nombre-imagen.png',
        alt: {
            ES: 'Descripción en español',
            EN: 'Description in English',
            FR: 'Description en français'
        },
        caption: {
            ES: 'Leyenda en español',
            EN: 'Caption in English',
            FR: 'Légende en français'
        }
    }
]
```

### Soporte Multi-idioma
Actualmente las imágenes son las mismas para todos los idiomas, pero las descripciones (alt) y leyendas (caption) están traducidas.

Si necesitas imágenes diferentes por idioma (ej: con texto en la UI), puedes modificar la estructura para soportar rutas diferentes por idioma.

---

## ✨ Resultado Final

Una vez agregadas todas las screenshots, los usuarios verán:
- Imágenes claras de cada proceso
- Carrusel navegable si hay múltiples imágenes
- Leyendas explicativas en su idioma
- Fallback automático si falta alguna imagen
- Experiencia visual mejorada en el Centro de Ayuda

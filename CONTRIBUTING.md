# 🤝 Guía de Contribución - Onyx Suite 2026

¡Gracias por tu interés en contribuir a Onyx Suite! Esta guía te ayudará a empezar.

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Estándares de Código](#estándares-de-código)
5. [Proceso de Pull Request](#proceso-de-pull-request)
6. [Reportar Bugs](#reportar-bugs)
7. [Sugerir Funcionalidades](#sugerir-funcionalidades)
8. [Estructura del Proyecto](#estructura-del-proyecto)

---

## 📜 Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de edad, tamaño corporal, discapacidad, etnia, identidad de género, nivel de experiencia, nacionalidad, apariencia personal, raza, religión o identidad y orientación sexual.

### Comportamiento Esperado

- Usar lenguaje acogedor e inclusivo
- Respetar diferentes puntos de vista y experiencias
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

### Comportamiento Inaceptable

- Uso de lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes/despectivos
- Acoso público o privado
- Publicar información privada de otros sin permiso
- Conducta que razonablemente se considere inapropiada

---

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

Aceptamos varios tipos de contribuciones:

- 🐛 **Reportar bugs**
- ✨ **Sugerir nuevas funcionalidades**
- 📝 **Mejorar documentación**
- 🎨 **Mejorar UI/UX**
- 🧪 **Agregar tests**
- 🔧 **Corregir bugs**
- ⚡ **Optimizar rendimiento**
- 🌍 **Agregar traducciones**

---

## 💻 Configuración del Entorno

### Prerequisitos

- **Node.js** 18+ y npm 9+
- **Git** 2.0+
- **Cuenta de Supabase** (para desarrollo)
- **Editor**: VS Code recomendado

### Instalación

1. **Fork el repositorio**
   ```bash
   # En GitHub, haz click en "Fork"
   ```

2. **Clonar tu fork**
   ```bash
   git clone https://github.com/TU-USUARIO/onyx-suite-2026.git
   cd onyx-suite-2026
   ```

3. **Agregar upstream**
   ```bash
   git remote add upstream https://github.com/onyxsuite/onyx-suite-2026.git
   ```

4. **Instalar dependencias**
   ```bash
   npm install
   ```

5. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local`:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   VITE_OPENAI_API_KEY=tu_openai_key (opcional)
   ```

6. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```
   
   Abre http://localhost:5173

### Verificar Instalación

```bash
# Ejecutar tests
npm run test

# Ejecutar linter
npm run lint

# Ejecutar type checking
npm run type-check
```

---

## 📏 Estándares de Código

### TypeScript

- **Tipado estricto**: Evita `any`, usa tipos específicos
- **Interfaces sobre types**: Para objetos
- **Naming conventions**:
  - PascalCase para componentes y tipos
  - camelCase para variables y funciones
  - UPPER_CASE para constantes

```typescript
// ✅ Bien
interface UserProfile {
    id: string;
    name: string;
    email: string;
}

const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    // ...
};

// ❌ Mal
const fetch_user = async (id: any) => {
    // ...
};
```

### React

- **Componentes funcionales**: Usa hooks, no clases
- **Props typing**: Siempre tipea las props
- **Destructuring**: Destructura props en la firma

```typescript
// ✅ Bien
interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
    return <button onClick={onClick}>{label}</button>;
};

// ❌ Mal
export const Button = (props: any) => {
    return <button onClick={props.onClick}>{props.label}</button>;
};
```

### Hooks Personalizados

- Prefijo `use`
- Retornar objeto con propiedades nombradas

```typescript
// ✅ Bien
export const useTransactions = (filters: Filters) => {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    // ...
    
    return { data, loading, error, refetch };
};

// ❌ Mal
export const getTransactions = () => {
    // ...
    return [data, loading]; // Array dificulta saber qué es qué
};
```

### Styling

- **TailwindCSS**: Preferido para estilos
- **Clases condicionales**: Usa `clsx` o similar
- **Responsive**: Mobile-first

```typescript
import clsx from 'clsx';

<div className={clsx(
    'px-4 py-2 rounded-lg',
    variant === 'primary' && 'bg-blue-600 text-white',
    variant === 'secondary' && 'bg-gray-200 text-gray-800',
    disabled && 'opacity-50 cursor-not-allowed'
)}>
```

### Comentarios

- **JSDoc** para funciones públicas
- Comentarios para lógica compleja
- No comentes lo obvio

```typescript
/**
 * Calcula el balance total de todas las cuentas del usuario
 * @param accounts - Array de cuentas bancarias
 * @param currency - Moneda objetivo para conversión
 * @returns Balance total en la moneda especificada
 */
export const calculateTotalBalance = (
    accounts: Account[],
    currency: Currency
): number => {
    // Convertir cada cuenta a la moneda objetivo y sumar
    return accounts.reduce((total, account) => {
        const converted = convertCurrency(account.balance, account.currency, currency);
        return total + converted;
    }, 0);
};
```

### Tests

- **Vitest** para unit tests
- **Testing Library** para componentes
- Cobertura mínima: 60%

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
    it('renders with label', () => {
        render(<Button label="Click me" onClick={() => {}} />);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });
    
    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button label="Click" onClick={handleClick} />);
        screen.getByText('Click').click();
        expect(handleClick).toHaveBeenCalledOnce();
    });
});
```

---

## 🔄 Proceso de Pull Request

### 1. Crear una rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear rama feature
git checkout -b feature/nombre-descriptivo

# O rama bugfix
git checkout -b fix/descripcion-del-bug
```

### 2. Hacer cambios

- Commits pequeños y atómicos
- Mensajes descriptivos
- Seguir [Conventional Commits](https://www.conventionalcommits.org/)

```bash
# Formato de commits
<type>(<scope>): <description>

# Ejemplos
feat(finance): add CSV import validation
fix(dashboard): resolve widget rendering issue
docs(readme): update installation instructions
test(transactions): add unit tests for filtering
refactor(hooks): extract common logic to useAsync
```

**Types:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, sin cambios de código
- `refactor`: Refactorización de código
- `test`: Agregar o modificar tests
- `chore`: Tareas de mantenimiento

### 3. Ejecutar verificaciones

```bash
# Linter
npm run lint

# Type checking
npm run type-check

# Tests
npm run test

# Build
npm run build
```

### 4. Push y crear PR

```bash
git push origin feature/nombre-descriptivo
```

En GitHub:
1. Ve a tu fork
2. Click en "Compare & pull request"
3. Completa el template de PR
4. Asigna reviewers (opcional)
5. Agrega labels apropiados

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado self-review
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests
- [ ] Todos los tests pasan
- [ ] He actualizado el CHANGELOG
```

### 5. Code Review

- Responde a comentarios constructivamente
- Realiza cambios solicitados
- Mantén la conversación profesional
- Agradece el feedback

### 6. Merge

Una vez aprobado:
- Squash commits si es necesario
- El maintainer hará el merge
- Elimina tu rama después del merge

```bash
git branch -d feature/nombre-descriptivo
git push origin --delete feature/nombre-descriptivo
```

---

## 🐛 Reportar Bugs

### Antes de reportar

1. **Busca issues existentes**: Puede que ya esté reportado
2. **Verifica que sea un bug**: No una feature request
3. **Prueba en la última versión**: Puede estar resuelto

### Crear Issue

Usa el template de bug report:

```markdown
**Descripción del bug**
Descripción clara y concisa del problema

**Pasos para reproducir**
1. Ve a '...'
2. Haz click en '...'
3. Scroll hasta '...'
4. Ver error

**Comportamiento esperado**
Qué debería pasar

**Comportamiento actual**
Qué pasa realmente

**Capturas de pantalla**
Si aplica, agrega capturas

**Entorno**
- OS: [e.g. Windows 11]
- Navegador: [e.g. Chrome 120]
- Versión: [e.g. 1.0.0]

**Información adicional**
Cualquier otro contexto relevante
```

### Severidad

Etiqueta tu issue:
- 🔴 **Critical**: App no funciona, pérdida de datos
- 🟠 **High**: Funcionalidad importante rota
- 🟡 **Medium**: Bug molesto pero hay workaround
- 🟢 **Low**: Problema cosmético o menor

---

## ✨ Sugerir Funcionalidades

### Template de Feature Request

```markdown
**¿Tu feature request está relacionada a un problema?**
Descripción clara del problema. Ej: "Siempre me frustra cuando [...]"

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase

**Describe alternativas que has considerado**
Otras soluciones o features que has considerado

**Contexto adicional**
Capturas, mockups, o cualquier otro contexto

**¿Estarías dispuesto a implementarla?**
- [ ] Sí, puedo enviar un PR
- [ ] Necesitaría ayuda
- [ ] Solo sugiero la idea
```

### Discusión

- Las feature requests se discuten primero
- Pueden ser rechazadas si no alinean con la visión
- Participa en la discusión constructivamente

---

## 📁 Estructura del Proyecto

```
onyx-suite-2026/
├── src/
│   ├── components/          # Componentes React
│   │   ├── common/         # Componentes reutilizables
│   │   ├── dashboard/      # Widgets del dashboard
│   │   ├── features/       # Features específicos
│   │   ├── layout/         # Layouts
│   │   └── pages/          # Páginas completas
│   ├── hooks/              # Custom hooks
│   ├── services/           # Lógica de negocio y APIs
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript types
│   ├── utils/              # Utilidades
│   ├── schemas/            # Zod schemas
│   ├── constants/          # Constantes
│   └── data/               # Datos estáticos
├── public/                 # Assets estáticos
├── docs/                   # Documentación
├── tests/                  # Tests
└── scripts/                # Scripts de utilidad
```

### Dónde agregar tu código

- **Nuevo componente UI**: `src/components/common/`
- **Feature específico**: `src/components/features/[module]/`
- **Custom hook**: `src/hooks/`
- **Servicio/API**: `src/services/`
- **Tipo TypeScript**: `src/types/`
- **Utilidad**: `src/utils/`
- **Test**: Junto al archivo que prueba con `.test.ts(x)`

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI mode
npm run test:ui
```

### Escribir Tests

```typescript
// Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
    it('renders correctly', () => {
        render(<Button label="Test" onClick={() => {}} />);
        expect(screen.getByText('Test')).toBeInTheDocument();
    });
    
    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button label="Click" onClick={handleClick} />);
        
        fireEvent.click(screen.getByText('Click'));
        expect(handleClick).toHaveBeenCalledOnce();
    });
    
    it('applies variant styles', () => {
        const { container } = render(
            <Button label="Primary" onClick={() => {}} variant="primary" />
        );
        expect(container.firstChild).toHaveClass('bg-blue-600');
    });
});
```

---

## 🌍 Internacionalización

### Agregar Traducciones

1. Edita `src/constants/translations.ts`
2. Agrega tu texto en ES, EN, FR

```typescript
export const TEXTS = {
    ES: {
        welcome: 'Bienvenido',
        // ...
    },
    EN: {
        welcome: 'Welcome',
        // ...
    },
    FR: {
        welcome: 'Bienvenue',
        // ...
    }
};
```

3. Usa en componentes:

```typescript
const { language } = useUserStore();
const t = TEXTS[language];

<h1>{t.welcome}</h1>
```

---

## 📝 Documentación

### Actualizar Docs

Si tu cambio afecta:
- **Funcionalidad de usuario**: Actualiza `docs/USER_GUIDE.md`
- **Arquitectura**: Actualiza `docs/ARCHITECTURE.md`
- **API**: Actualiza `docs/API.md` (cuando exista)
- **Troubleshooting**: Actualiza `docs/TROUBLESHOOTING.md`

### Changelog

Actualiza `CHANGELOG.md` con tus cambios:

```markdown
## [Unreleased]

### Added
- Nueva funcionalidad X (#123)

### Fixed
- Corrección de bug Y (#124)

### Changed
- Mejora en Z (#125)
```

---

## 🏆 Reconocimiento

Los contribuidores son reconocidos en:
- `CONTRIBUTORS.md`
- Release notes
- Página de créditos en la app

---

## 📞 Ayuda

¿Necesitas ayuda?

- **Discord**: [discord.gg/onyxsuite](https://discord.gg/onyxsuite)
- **Email**: dev@onyxsuite.com
- **Discussions**: GitHub Discussions

---

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia del proyecto (MIT).

---

**¡Gracias por contribuir a Onyx Suite! 🎉**

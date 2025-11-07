# 🔗 Repository Integration Feature

Esta guía explica cómo funciona la nueva funcionalidad de integración con repositorios.

## Funcionalidad

Cuando un usuario está autenticado, puede:

1. **Seleccionar una organización/usuario** de su cuenta
2. **Buscar repositorios** por nombre
3. **Seleccionar un repositorio** para analizar
4. **Ver commits automáticamente** sin copiar/pegar comandos

## Arquitectura

### Provider Pattern (Patrón Strategy)

Creamos una abstracción escalable para soportar múltiples plataformas Git:

```
BaseProvider (Interfaz)
├── GitHubProvider
├── GitLabProvider
└── BitbucketProvider
```

### Métodos Implementados

Cada provider implementa:

```javascript
// Obtener usuario actual
getCurrentUser()

// Obtener organizaciones
getOrganizations()

// Listar repositorios
getRepositories(owner)

// Buscar repositorios
searchRepositories(query, owner)

// Obtener commits
getCommits(owner, repo, { since, until, branch })
```

## Flujo de Uso

### 1. Usuario No Logueado
- Ve el comando git log para copiar
- Pega manualmente el output
- Procesa localmente

### 2. Usuario Logueado
- Ve un selector de organización/repositorio
- Selecciona org (opcional)
- Busca/selecciona repositorio
- Los commits se obtienen automáticamente vía API
- Se procesan y muestran igual que el flujo manual

## API Endpoints

### GET /api/repos/organizations
Obtiene las organizaciones del usuario + el usuario mismo.

**Response:**
```json
[
  {
    "id": "123",
    "name": "John Doe",
    "login": "johndoe",
    "isUser": true
  },
  {
    "id": "456",
    "name": "Acme Corp",
    "login": "acme",
    "avatarUrl": "https://..."
  }
]
```

### GET /api/repos/list?owner=acme&search=api
Obtiene repositorios del owner, opcionalmente filtrando por búsqueda.

**Response:**
```json
[
  {
    "id": "789",
    "name": "api-service",
    "fullName": "acme/api-service",
    "defaultBranch": "main",
    "description": "Main API service",
    "isPrivate": false,
    "owner": "acme"
  }
]
```

### GET /api/repos/commits?owner=acme&repo=api-service&since=2024-01-01
Obtiene commits del repositorio.

**Parámetros:**
- `owner` (required): Owner del repo
- `repo` (required): Nombre del repo
- `since` (optional): Fecha desde (ISO string)
- `until` (optional): Fecha hasta (ISO string)
- `branch` (optional): Branch específico

**Response:**
```json
[
  {
    "hash": "abc1234",
    "author": "John Doe",
    "email": "john@example.com",
    "date": "2024-01-15T10:30:00Z",
    "message": "feat: add new feature"
  }
]
```

## Componentes UI

### RepositorySelector
Componente principal que maneja la selección de repos.

**Props:**
- `onSelectRepository(repoInfo)`: Callback cuando se selecciona un repo

**Features:**
- Carga automática de organizaciones
- Búsqueda de repositorios en tiempo real
- UI scroll con lista de repos
- Muestra repos privados con 🔒
- Loading states

### Integración en Page
```javascript
{session ? (
  <RepositorySelector onSelectRepository={handleSelectRepository} />
) : (
  <GitCommandDisplay /> // Manual input
)}
```

## Ejemplo de Uso del Provider

```javascript
import { ProviderFactory } from '@/services/providers/ProviderFactory'

// Crear instancia del provider correcto
const provider = ProviderFactory.createProvider('github', accessToken)

// Obtener repos
const repos = await provider.getRepositories('myorg')

// Buscar repos
const searchResults = await provider.searchRepositories('api', 'myorg')

// Obtener commits
const commits = await provider.getCommits('myorg', 'myrepo', {
  since: '2024-01-01',
  until: '2024-12-31',
  branch: 'main'
})
```

## Agregar un Nuevo Provider

1. **Crear el Provider**:
```javascript
// src/services/providers/NewProvider.js
import { BaseProvider } from './BaseProvider'

export class NewProvider extends BaseProvider {
  constructor(accessToken) {
    super(accessToken)
    this.baseURL = 'https://api.newprovider.com'
  }

  async getCurrentUser() {
    // Implementación
  }

  // ... implementar otros métodos
}
```

2. **Agregar al Factory**:
```javascript
// src/services/providers/ProviderFactory.js
import { NewProvider } from './NewProvider'

export class ProviderFactory {
  static createProvider(providerName, accessToken) {
    switch (providerName) {
      case 'newprovider':
        return new NewProvider(accessToken)
      // ...
    }
  }
}
```

3. **Configurar Auth**:
```javascript
// src/auth.js
import NewProviderAuth from 'next-auth/providers/newprovider'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    NewProviderAuth({
      clientId: process.env.NEWPROVIDER_CLIENT_ID,
      clientSecret: process.env.NEWPROVIDER_CLIENT_SECRET,
    }),
    // ...
  ],
})
```

## Pruebas

Para probar la funcionalidad:

1. Loguéate con cualquier provider
2. Deberías ver el RepositorySelector
3. Verás tu usuario + organizaciones como botones
4. Selecciona una organización
5. Busca un repositorio
6. Selecciónalo
7. Los commits deberían cargarse automáticamente
8. Procésalos como de costumbre

## Troubleshooting

**"Failed to fetch organizations"**
→ Verifica que el access token tenga los scopes correctos

**"Failed to fetch repositories"**
→ Verifica que el usuario tenga acceso a repos de esa org

**"Failed to fetch commits"**
→ Verifica que el repositorio exista y sea accesible

**"Unauthorized"**
→ La sesión expiró, vuelve a autenticarte

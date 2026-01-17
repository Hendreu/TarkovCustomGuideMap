# Tarkov Maps - Rotas da Aplicação

## 📋 Páginas (Frontend)

### Páginas Públicas
- **`/`** - Página inicial (Home)
  - Arquivo: `app/page.tsx`
  - Descrição: Lista todos os mapas disponíveis do Tarkov

- **`/map/[id]`** - Visualização interativa do mapa
  - Arquivo: `app/map/[id]/page.tsx`
  - Parâmetros: `id` (customs, woods, interchange, shoreline)
  - Descrição: Mapa interativo com pins de loot, bosses, extrações e keys

### Páginas de Administração
- **`/admin`** - Login administrativo
  - Arquivo: `app/admin/page.tsx`
  - Descrição: Tela de login para acessar o painel admin

- **`/admin/dashboard`** - Dashboard administrativo
  - Arquivo: `app/admin/dashboard/page.tsx`
  - Descrição: Gerenciamento de pins e keys (CRUD completo)
  - Requer: Autenticação com token `tarkov_admin_token`

---

## 🔌 API Routes (Backend)

### Autenticação
- **`POST /api/auth/login`**
  - Arquivo: `app/api/auth/login/route.ts`
  - Body: `{ password: string }`
  - Response: `{ token: string }`
  - Descrição: Autentica usuário admin e retorna token

### Pins (Marcadores de Mapa)

#### Obter pins de um mapa específico
- **`GET /api/pins/[mapId]`**
  - Arquivo: `app/api/pins/[mapId]/route.ts`
  - Parâmetros: `mapId` (customs, woods, etc.)
  - Response: `{ pins: Pin[] }`
  - Auth: Público
  - Descrição: Retorna todos os pins de um mapa específico

#### Gerenciamento de pins (Admin)
- **`GET /api/pins`**
  - Arquivo: `app/api/pins/route.ts`
  - Response: `{ pins: Pin[] }`
  - Auth: Requer Bearer token
  - Descrição: Retorna todos os pins de todos os mapas

- **`POST /api/pins`**
  - Arquivo: `app/api/pins/route.ts`
  - Body: `PinData` (veja estrutura abaixo)
  - Response: `{ success: true, pinId: string }`
  - Auth: Requer Bearer token
  - Descrição: Cria um novo pin

- **`PATCH /api/pins?id={pinId}`**
  - Arquivo: `app/api/pins/route.ts`
  - Query: `id` (ID do pin)
  - Body: `Partial<PinData>`
  - Response: `{ success: true }`
  - Auth: Requer Bearer token
  - Descrição: Atualiza um pin existente

- **`DELETE /api/pins?id={pinId}`**
  - Arquivo: `app/api/pins/route.ts`
  - Query: `id` (ID do pin)
  - Response: `{ success: true }`
  - Auth: Requer Bearer token
  - Descrição: Deleta um pin

### Keys (Chaves de Mapa)

#### Obter keys de um mapa específico
- **`GET /api/keys/[mapId]`**
  - Arquivo: `app/api/keys/[mapId]/route.ts`
  - Parâmetros: `mapId` (customs, woods, etc.)
  - Response: `{ keys: KeyData[] }`
  - Auth: Público
  - Descrição: Retorna todas as chaves de um mapa específico

#### Gerenciamento de keys (Admin)
- **`GET /api/keys`**
  - Arquivo: `app/api/keys/route.ts`
  - Response: `{ keys: KeyData[] }`
  - Auth: Requer Bearer token
  - Descrição: Retorna todas as chaves de todos os mapas

- **`POST /api/keys`**
  - Arquivo: `app/api/keys/route.ts`
  - Body: `KeyData` (veja estrutura abaixo)
  - Response: `{ success: true, keyId: string }`
  - Auth: Requer Bearer token
  - Descrição: Cria uma nova chave

- **`PATCH /api/keys?id={keyId}`**
  - Arquivo: `app/api/keys/route.ts`
  - Query: `id` (ID da key)
  - Body: `Partial<KeyData>`
  - Response: `{ success: true }`
  - Auth: Requer Bearer token
  - Descrição: Atualiza uma chave existente

- **`DELETE /api/keys?id={keyId}`**
  - Arquivo: `app/api/keys/route.ts`
  - Query: `id` (ID da key)
  - Response: `{ success: true }`
  - Auth: Requer Bearer token
  - Descrição: Deleta uma chave

---

## 📦 Estruturas de Dados

### PinData (Comum a todos os pins)
```typescript
{
  id: string;              // Gerado automaticamente: custom-{timestamp}
  map_id: string;          // customs | woods | interchange | shoreline
  type: 'loot' | 'boss' | 'extract';
  name: string;
  x: number;               // Posição X (0-100%)
  y: number;               // Posição Y (0-100%)
  description?: string;
}
```

### Pin tipo "loot"
```typescript
{
  ...PinData,
  type: 'loot',
  loot_type: 'weapon' | 'medical' | 'tech' | 'valuables' | 'food';
  quality: 'high' | 'medium' | 'low';
}
```

### Pin tipo "boss"
```typescript
{
  ...PinData,
  type: 'boss',
  boss_name: string;       // Nome do boss
  spawn_chance: number;    // 0-100
  guards: number;          // Quantidade de guardas
}
```

### Pin tipo "extract"
```typescript
{
  ...PinData,
  type: 'extract',
  requirements?: string;    // Requisitos para usar (ex: "Needs key")
  always_available: boolean;
  pmc: boolean;            // Disponível para PMCs
  scav_only: boolean;      // Disponível apenas para Scavs
}
```

### KeyData
```typescript
{
  id: string;              // Gerado automaticamente: key-{timestamp}
  map_id: string;          // customs | woods | interchange | shoreline
  name: string;            // Nome da chave
  location: string;        // Onde encontrar a chave
  uses: number;            // -1 para ilimitado
  worth: 'high' | 'medium' | 'low';
  unlocks: string;         // O que a chave abre
  x?: number;              // Posição X no mapa (opcional)
  y?: number;              // Posição Y no mapa (opcional)
}
```

---

## 🔐 Autenticação

### Token de Admin
- Armazenado em: `localStorage.tarkov_admin_token`
- Formato: Bearer token (senha: `alisucksbutwehelp`)
- Header: `Authorization: Bearer alisucksbutwehelp`

### Endpoints Protegidos
Todos os endpoints de escrita (POST, PATCH, DELETE) em `/api/pins` e `/api/keys` requerem autenticação.

---

## 🗺️ IDs de Mapas Disponíveis

1. **customs** - Customs
2. **woods** - Woods
3. **interchange** - Interchange
4. **shoreline** - Shoreline

---

## 📁 Estrutura de Arquivos

```
app/
├── page.tsx                          # Home page
├── layout.tsx                        # Layout raiz
├── map/
│   └── [id]/
│       └── page.tsx                  # Página do mapa interativo
├── admin/
│   ├── page.tsx                      # Login admin
│   └── dashboard/
│       └── page.tsx                  # Dashboard admin
├── api/
│   ├── auth/
│   │   └── login/
│   │       └── route.ts              # POST /api/auth/login
│   ├── pins/
│   │   ├── route.ts                  # GET, POST, PATCH, DELETE /api/pins
│   │   └── [mapId]/
│   │       └── route.ts              # GET /api/pins/[mapId]
│   └── keys/
│       ├── route.ts                  # GET, POST, PATCH, DELETE /api/keys
│       └── [mapId]/
│           └── route.ts              # GET /api/keys/[mapId]
├── components/
│   ├── InteractiveMap.tsx            # Componente do mapa interativo
│   └── AdminMapEditor.tsx            # Editor de mapa (colocar pins)
├── data/
│   └── maps.ts                       # Dados dos mapas
└── types/
    └── map.ts                        # Tipos TypeScript

lib/
├── db.ts                             # Configuração do banco SQLite
├── pins.ts                           # Funções de gerenciamento de pins
└── auth.ts                           # Funções de autenticação

public/
└── maps/
    ├── Customs.png                   # 1573x804px
    ├── Woods.png                     # 1573x804px
    ├── Interchange.png               # 1573x804px
    └── Shoreline.png                 # 1573x804px
```

---

## 🎯 Fluxo de Uso

### Usuário Normal
1. Acessa `/` para ver lista de mapas
2. Clica em um mapa para ir para `/map/[id]`
3. Visualiza o mapa interativo com pins de loot, bosses, extrações e keys
4. Pode filtrar por tipo de marcador
5. Clica em pins para ver detalhes

### Administrador
1. Acessa `/admin` e faz login
2. É redirecionado para `/admin/dashboard`
3. Pode adicionar, editar e deletar pins e keys
4. Usa o map editor para posicionar pins visualmente
5. Gerencia todos os mapas em uma única interface

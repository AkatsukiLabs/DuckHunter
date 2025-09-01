/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_NODE_URL?: string
  readonly VITE_PUBLIC_TORII?: string
  readonly VITE_PUBLIC_WORLD_ADDRESS?: string
  readonly VITE_PUBLIC_GAME_CONTRACT?: string
  readonly VITE_PUBLIC_MASTER_ADDRESS?: string
  readonly VITE_PUBLIC_MASTER_PRIVATE_KEY?: string
  readonly VITE_CAVOS_APP_ID?: string
  readonly VITE_CAVOS_ORG_SECRET?: string
  readonly VITE_CAVOS_DEFAULT_NETWORK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
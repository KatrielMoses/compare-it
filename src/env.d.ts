/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL?: string;
}

// Ensure the ImportMeta interface has an env property
interface ImportMeta {
    readonly env: ImportMetaEnv;
} 
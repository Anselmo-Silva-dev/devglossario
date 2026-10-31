# DevGlossário

App Android (React Native + Expo SDK 52 + TypeScript + SQLite), 100% offline.

## Compilar o APK só com o GitHub (sem computador)
1. Cria um repositório no GitHub e envia estes ficheiros (pelo site: *Add file → Upload files*; inclui a pasta `.github`).
2. Abre o separador **Actions → Build APK → Run workflow**.
3. Quando terminar (~10–20 min), abre a execução e descarrega o artifact **DevGlossario-apk** (ZIP com `app-release.apk`).
4. No Android: extrai o ZIP, abre o APK e permite instalar de fontes desconhecidas.

O workflow faz: Node 20 → `npm install` → `tsc --noEmit` → `expo prebuild` → `gradlew assembleRelease`.
O APK sai assinado com a chave de debug (serve para instalar e testar, não para a Play Store).

## Adicionar termos
Edita `src/db/seed.ts`, acrescenta termos em `TERMS` e aumenta `SEED_VERSION`. Os novos entram na próxima abertura, sem apagar favoritos nem progresso.

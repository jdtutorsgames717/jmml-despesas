# JMML - Estoque Doméstico

Sistema simples de controle de estoque doméstico (React + Tailwind CSS), com persistência no **localStorage**.

## Requisitos
- Node.js (LTS recomendado)

## Rodar o projeto

```bash
npm install
npm run dev
```

## Sincronização entre dispositivos (Supabase)

Para acessar de **vários dispositivos** e permitir **compartilhamento por “casa/grupo”**, o app suporta Supabase (Auth + Postgres).

### 1) Criar projeto no Supabase
- Crie um projeto no Supabase
- Vá em **SQL Editor** e execute o arquivo:
  - `supabase_schema.sql`

### 2) Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto (não comite esse arquivo) com:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Use o `.env.example` como guia (sem valores reais).

### 3) Usar o app
- Abra o app e crie uma conta (e-mail + senha)
- Crie uma “Casa” (grupo) ou entre com um **código de convite**
- A partir daí, o estoque sincroniza entre dispositivos e usuários do mesmo grupo

## Funcionalidades
- **Dashboard**: total de itens, itens com estoque baixo (quantidade atual < 2) e itens monitorados.
- **Lista de itens** (responsiva): nome, categoria, local, quantidade atual, mínimo desejado e validade.
- **Ações rápidas**: botões de `+` e `−` na lista para ajustar a quantidade.
- **Filtros e busca**: pesquisar por nome e filtrar por categoria; opção de “Apenas monitorados”.
- **Cadastro/Edição**: validade obrigatória, categorias padrão e campos extras (local e observação).
 - **Lista de compras**: lista gerada com base em estoque baixo, com opção de copiar e imprimir.

# CLAUDE.md — Atlas

Este documento é a referência central para qualquer pessoa ou agente de IA (Claude, Cursor Agent, etc.) que for trabalhar no repositório Atlas. Ele descreve a visão do produto, a arquitetura atual, o processo oficial de desenvolvimento e as regras que devem ser seguidas em qualquer nova implementação.

## 1. Visão do Projeto

O Atlas é uma aplicação web de organização financeira pessoal. O objetivo é oferecer a usuários finais uma forma simples e confiável de acompanhar receitas, despesas e saldo, evoluindo progressivamente de um MVP funcional para um produto completo, seguro e escalável.

O projeto é desenvolvido de forma incremental, em sprints, com cada etapa documentada em `roadmap/` e validada por lint e build antes de ser considerada concluída.

## 2. Objetivo do Produto

- Permitir que o usuário se cadastre e faça login de forma seguro.
- Permitir o registro de receitas e despesas, com visualização de saldo consolidado.
- Evoluir para incluir categorização, metas financeiras, relatórios e integrações futuras.
- Manter uma base de código simples, tipada e sustentável, que suporte crescimento de funcionalidades sem reescredas constantes.

## 3. Arquitetura Atual

- **Estrutura**: monorepo, com o front-end em `apps/web` (React + TypeScript + Vite).
- **Roteamento**: `react-router-dom` (`BrowserRouter` configurado em `main.tsx`; rotas declarativas em `App.tsx`).
- **Autenticação**: Supabase Auth (`@supabase/supabase-js`), com sessão gerenciada via `AuthContext`/`useAuth` (`src/contexts`, `src/hooks`) e rotas protegidas por `ProtectedRoute.tsx`.
- **Formulários**: `react-hook-form` + `zod` (`src/validations`), com tipos centralizados em `src/types`.
- **Cliente de API externo**: `src/lib/supabase.ts` (client único, configurado via variáveis de ambiente do Vite).
- **Estado**: local por componente (`useState`); ainda sem gerenciador de estado global nem persistência de dados financeiros em backend (previsto no roadmap).
- **Estilo**: CSS puro por componente, sem design system consolidado ainda.

A descrição completa e atualizada da arquitetura vive em [`roadmap/arquitetura.md`](./roadmap/arquitetura.md) — este documento deve ser a fonte detalhada; este `CLAUDE.md` mantém apenas um resumo de alto nível.

## 4. Tecnologias Utilizadas

| Categoria | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| UI | React 19 |
| Build / Dev server | Vite |
| Roteamento | react-router-dom |
| Formulários e validação | react-hook-form + zod |
| Backend / Auth / Dados | Supabase (`@supabase/supabase-js`) |
| Lint | ESLint + typescript-eslint |
| Estilo | CSS puro |

## 5. Processo Oficial de Desenvolvimento

1. Todo trabalho é organizado em **Sprints**, documentadas em `roadmap/sprint-0X.md`, com objetivos e critérios de aceite claros antes da implementação.
2. Antes de qualquer implementação, **ler o projeto inteiro** relevante à mudança (código, roadmap e este `CLAUDE.md`).
3. Implementar apenas o escopo definido para a sprint em andamento — evitar expandir escopo sem necessidade comprovada.
4. Ao final de toda implementação, executar obrigatoriamente:
   - `npm run lint`
   - `npm run build`
   Corrigindo automaticamente qualquer erro encontrado antes de considerar a tarefa concluída.
5. Registrar as alterações relevantes em [`roadmap/changelog.md`](./roadmap/changelog.md).
6. Manter o [`roadmap/backlog.md`](./roadmap/backlog.md) atualizado conforme novas dívidas técnicas ou funcionalidades futuras forem identificadas.
7. Nunca introduzir credenciais reais ou fictícias diretamente no código — variáveis sensíveis sempre via `.env`/`.env.local` (nunca versionados).

## 6. Regras Gerais para Futuras Implementações

- **Não alterar funcionalidades fora do escopo solicitado.** Se uma alteração parecer necessária mas estiver fora do pedido, ela deve ser reportada como recomendação, não implementada silenciosamente.
- **TypeScript estrito**: nenhum erro de tipo é aceitável no build final (`tsc -b`).
- **Sem chaves ou credenciais fictícias**: integrações externas (como Supabase) só devem ser configuradas com credenciais reais fornecidas pelo usuário, nunca com placeholders que simulem funcionamento real.
- **Formulários** devem usar `react-hook-form` + `zod`, com schemas isolados em `src/validations` e tipos derivados em `src/types`.
- **Autenticação e sessão** devem sempre passar por `AuthContext`/`useAuth` — nunca reintroduzir mecanismos paralelos (como flags em `localStorage`) para controlar acesso.
- **Componentes de contexto React** (`createContext`) devem ficar em arquivo separado do componente `Provider`, para preservar o Fast Refresh do Vite (ver `src/hooks/useAuth.ts` vs. `src/contexts/AuthContext.tsx` como padrão de referência).
- **Nenhuma implementação é considerada concluída sem `npm run lint` e `npm run build` passando sem erros.**
- **Documentação viva**: qualquer sprint concluída deve ser refletida em `roadmap/` (changelog, sprint correspondente e, se necessário, arquitetura/backlog).

## 7. Princípios Norteadores

- **Simplicidade antes de escala**: resolver o problema atual da forma mais simples e correta possível; escalar apenas quando houver necessidade real.
- **Transparência técnica**: dívidas técnicas e limitações conhecidas devem ser documentadas, nunca escondidas.
- **Segurança por padrão**: nenhuma credencial real ou fictícia deve ser exposta no código-fonte; autenticação e dados sensíveis sempre tratados com o mínimo de confiança implícita.
- **Consistência incremental**: cada sprint deve deixar o projeto em um estado estável, validado e melhor documentado do que estava antes.
- **Rastreabilidade de decisões**: toda decisão relevante de produto ou arquitetura deve poder ser encontrada em `roadmap/` ou neste `CLAUDE.md`.

## 8. Referências

- **PRD (Documento de Requisitos do Produto)**: ainda não formalizado como arquivo único no repositório. Até sua criação em `roadmap/prd.md`, os requisitos de produto são expressos através dos objetivos de cada sprint (`roadmap/sprint-0X.md`) e das decisões registradas neste documento.
- **Roadmap**: ver pasta [`roadmap/`](./roadmap/) — contém `arquitetura.md`, `backlog.md`, `changelog.md` e as sprints (`sprint-01.md` em diante).
- **Princípios Norteadores**: seção 7 deste documento é a referência oficial; qualquer atualização relevante nos princípios deve ser refletida aqui.

---

> Este arquivo deve ser mantido atualizado a cada mudança estrutural relevante no projeto. Ele é a primeira leitura obrigatória antes de qualquer nova implementação no Atlas.

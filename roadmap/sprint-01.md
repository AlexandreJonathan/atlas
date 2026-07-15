# Sprint 01 — Roteamento e Navegação com React Router

## Status: ✅ Concluída

## 1. Objetivo

Substituir a navegação baseada em estado local (`useState`) do `App.tsx` por um sistema de roteamento real utilizando `react-router-dom`, estabelecendo a base de navegação da aplicação e o mecanismo inicial de proteção de rotas autenticadas.

## 2. Contexto

Na versão inicial do Atlas, a navegação entre as telas de Login, Cadastro e Dashboard era controlada por uma variável de estado (`tela`) manipulada com `setTela`, dentro de `App.tsx`. Essa abordagem não escalava, não permitia URLs diretas para cada tela, não suportava histórico de navegação do navegador (botão voltar/avançar) e misturava responsabilidades de roteamento com lógica de componente.

## 3. O que foi implementado

### 3.1 Dependências
- Instalação de `react-router-dom` (^7.18.1) em `apps/web`.

### 3.2 Configuração de roteamento
- `main.tsx`: adicionado `BrowserRouter` envolvendo o componente `<App />`, estabelecendo o contexto de roteamento para toda a aplicação.
- `App.tsx`: removida por completo a navegação baseada em `useState`; implementadas rotas declarativas com `<Routes>` e `<Route>`.

### 3.3 Mapa de rotas

| Rota         | Componente   | Acesso     |
|--------------|--------------|------------|
| `/`          | Redirect → `/dashboard` | Público |
| `/login`     | `Login`      | Público    |
| `/cadastro`  | `Register`   | Público    |
| `/dashboard` | `Dashboard`  | Protegido  |

### 3.4 Proteção de rotas
- Criado `ProtectedRoute.tsx`: componente que verifica a existência da chave `atlas_auth` no `localStorage` e redireciona para `/login` (via `<Navigate replace />`) caso o usuário não esteja autenticado.
- Aplicado `ProtectedRoute` na rota `/dashboard`.

### 3.5 Adaptação dos componentes
- **`Login.tsx`**: removidas as props `irParaCadastro` e `entrar` (antes recebidas de `App.tsx`). Substituídas por:
  - `useNavigate()` para redirecionar ao `/dashboard` após o clique em "Entrar".
  - Gravação da chave `atlas_auth` no `localStorage` para simular autenticação.
  - `<Link to="/cadastro">` para navegação ao cadastro.
- **`Register.tsx`**: removida a prop `voltarLogin`. Substituída por `<Link to="/login">` para retornar à tela de login.
- **`Dashboard.tsx`**: mantido sem alterações funcionais. Único ajuste foi a remoção do setter `setDespesas` não utilizado, para eliminar erro de lint (`@typescript-eslint/no-unused-vars`).

### 3.6 Correções de qualidade
- Corrigido erro de ESLint em `Dashboard.tsx`.
- Validada a ausência de erros de TypeScript em todo o projeto.

## 4. Critérios de Aceite

- [x] `App.tsx` não possui nenhuma referência a `useState` para controle de navegação.
- [x] `react-router-dom` instalado e listado em `package.json`.
- [x] `BrowserRouter` configurado em `main.tsx`.
- [x] `ProtectedRoute.tsx` criado e aplicado à rota `/dashboard`.
- [x] `Login.tsx` e `Register.tsx` adaptados para usar `react-router-dom` (`useNavigate`/`Link`) em vez de callbacks via props.
- [x] `Dashboard.tsx` mantido sem alterações de comportamento.
- [x] `npm run lint` executa sem erros.
- [x] `npm run build` executa sem erros.

## 5. Validações Executadas

```
npm run lint  → ✅ sem erros
npm run build → ✅ build de produção concluído com sucesso
```

## 6. Limitações e Dívidas Técnicas

- A autenticação via `localStorage` (`atlas_auth`) é uma solução temporária e não segura para produção — não há validação de credenciais nem backend real. Deve ser substituída em sprint futura (ver `backlog.md`, seção "Autenticação e Segurança").
- Não há tratamento de logout.
- Não há testes automatizados cobrindo as novas rotas.

## 7. Referências

- `roadmap/arquitetura.md` — arquitetura atual detalhada.
- `roadmap/changelog.md` — registro consolidado das alterações.
- `roadmap/backlog.md` — itens pendentes derivados desta sprint.

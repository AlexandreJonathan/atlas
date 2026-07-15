# Sprint 02 — Autenticação Real e Backend de Sessão

## Status: 📋 Planejada

## 1. Objetivo

Substituir o mecanismo de autenticação simulado (baseado em `localStorage`) por uma solução real e segura, com backend dedicado, validação de credenciais e emissão de tokens de sessão.

## 2. Escopo Proposto

- Criar API de autenticação (registro e login de usuários).
- Persistir usuários em banco de dados (ex: PostgreSQL ou SQLite para desenvolvimento).
- Implementar hash de senha (bcrypt/argon2) no backend.
- Emitir e validar tokens JWT (access token + refresh token).
- Adaptar `Login.tsx` e `Register.tsx` para consumir a nova API.
- Adaptar `ProtectedRoute.tsx` para validar o token real em vez da flag `atlas_auth`.
- Implementar logout funcional (invalidação/limpeza de token).
- Adicionar validação de formulário (e-mail válido, senha forte, confirmação de senha).

## 3. Critérios de Aceite

- [ ] Existe uma API de autenticação com endpoints de registro e login.
- [ ] Senhas de usuários são armazenadas com hash seguro (nunca em texto plano).
- [ ] `Login.tsx` autentica o usuário via chamada real à API, exibindo erro em caso de credenciais inválidas.
- [ ] `Register.tsx` cria um novo usuário via chamada real à API, exibindo erro em caso de e-mail já cadastrado ou dados inválidos.
- [ ] `ProtectedRoute.tsx` valida a sessão/token do usuário, não mais dependendo de uma flag simples em `localStorage`.
- [ ] Existe uma ação de logout acessível, que limpa a sessão do usuário e redireciona para `/login`.
- [ ] Tokens possuem expiração e mecanismo de renovação (refresh).
- [ ] `npm run lint` e `npm run build` executam sem erros.
- [ ] Não há regressão nas rotas e componentes implementados na Sprint 01.

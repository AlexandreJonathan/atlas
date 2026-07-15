# Sprint 06 — Alpha Readiness

## Status: ✅ Concluída

## 1. Objetivo

Preparar a Atlas para seu primeiro Alpha privado, implementando todas as funcionalidades identificadas como bloqueantes na Auditoria de Produto realizada previamente (ver `roadmap/changelog.md`, seção "[Auditoria de Produto]"): recuperação de senha, fluxo de confirmação de e-mail, responsividade completa, onboarding guiado no primeiro acesso e preparação de deploy.

## 2. Escopo Implementado

### 2.1 Recuperação de senha

- Fluxo completo via Supabase Auth (`resetPasswordForEmail` + `updateUser`), sem backend próprio.
- `ForgotPassword.tsx` (`/esqueci-senha`): formulário de e-mail; mensagem de sucesso idêntica independentemente de o e-mail existir ou não na base (evita enumeração de usuários).
- `ResetPassword.tsx` (`/redefinir-senha`): detecta a sessão de recuperação (`onAuthStateChange` com evento `PASSWORD_RECOVERY`, com fallback via `getSession()` e timeout de 4s), trata explicitamente o estado de link inválido/expirado, e permite definir uma nova senha com confirmação.
- `src/validations/forgotPasswordSchema.ts` e `src/validations/resetPasswordSchema.ts` (com `.refine` para confirmação de senha).
- Link "Esqueceu sua senha?" adicionado em `Login.tsx`.

### 2.2 Fluxo de confirmação de e-mail

- `Register.tsx`: após `signUp`, verifica se `data.session` existe. Se existir (confirmação de e-mail desabilitada no projeto), loga o usuário direto; se não existir, exibe uma tela dedicada "Confirme seu e-mail" com o endereço cadastrado e um botão para reenviar o e-mail de confirmação (`supabase.auth.resend`), em vez de silenciosamente mandar para `/login` (comportamento anterior).
- `Login.tsx`: quando o erro de login é especificamente "e-mail não confirmado", exibe um botão para reenviar a confirmação, sem o usuário precisar voltar ao cadastro.
- `src/lib/authErrors.ts`: nova constante exportada `MENSAGEM_EMAIL_NAO_CONFIRMADO` (evita comparar strings mágicas na UI) e novas mensagens amigáveis mapeadas (senha igual à anterior, link expirado/inválido, limite de tentativas por segurança, sessão ausente).

### 2.3 Onboarding Inteligente

- Nova tabela `onboarding_status` (Supabase, RLS) — guarda o passo atual (1 a 6) e a data de conclusão por usuário (`supabase/migrations/20260714100000_create_onboarding_status_table.sql`).
- `src/services/onboardingService.ts` e `src/hooks/useOnboarding.ts`: buscam/persistem o progresso; **estratégia de backfill** — usuários que já tinham um perfil financeiro configurado antes desta sprint (Sprint 5 ou anterior) são automaticamente marcados como "onboarding concluído" no primeiro carregamento, sem precisar refazer o fluxo.
- `src/components/onboarding/`: `OnboardingWizard.tsx` (orquestrador) + `WelcomeStep`, `IncomeStep`, `ReserveStep`, `FixedExpensesStep`, `FirstGoalStep`, `FinishStep`.
  - Passos 1 (boas-vindas) e 6 (finalizar) são informativos/resumo.
  - Passos 2 (renda) e 3 (reserva mínima) são obrigatórios para avançar (validados com os mesmos schemas usados no restante da aplicação) — só são persistidos em `financial_profiles` quando o passo 3 é confirmado, em uma única chamada.
  - Passos 4 (despesas fixas) e 5 (primeira meta) permitem adicionar quantos itens quiser (reaproveitando `useFixedExpenses`/`useGoals` já carregados no `Dashboard.tsx`) e podem ser concluídos sem cadastrar nada.
  - O progresso (passo atual) é persistido a cada avanço, permitindo retomar exatamente de onde o usuário parou em uma sessão futura.
  - Botão "Pular por agora": oculta o wizard **apenas na sessão atual** (estado local do `Dashboard.tsx`, não persistido) — no próximo acesso, o onboarding volta a ser exibido a partir do passo salvo, até ser efetivamente concluído.
- `Dashboard.tsx`: passou a chamar `useOnboarding` e a decidir entre exibir o wizard ou o Dashboard completo, com um estado de carregamento explícito antes dessa decisão (evita mostrar o Dashboard "piscando" por trás do wizard).

### 2.4 Responsividade completa (320px–1920px)

- `App.css`: `.login-card` (Login/Cadastro/Esqueci senha/Redefinir senha) passou de largura fixa (420px) para `width: min(420px, 92vw)`, com ajustes de padding/tipografia em telas ≤480px.
- `Dashboard.css`: novo bloco de media queries (≤600px e ≤480px) ajustando padding do Dashboard, largura dos cards, padding dos modais/painéis, e empilhando verticalmente ações, aportes de metas e contas a pagar em telas muito estreitas. `.acoes` e `.movimentacao` passaram a ter `flex-wrap`.
- `components/onboarding/OnboardingWizard.css`: construído responsivo desde o início (`width: min(560px, 100%)`, ações em coluna ≤480px).
- Revisão cobriu Login, Cadastro, telas de recuperação de senha, onboarding, Dashboard, todos os painéis (`RecommendationsPanel`, `FinancialSummaryCards`, `PlanningPanel`, `UpcomingBillsPanel`, `GoalsPanel`, `FixedExpensesPanel`), listas (`TransactionsList`, `BillsList`, `GoalsList`, `FixedExpensesList`) e todos os modais.

### 2.5 Preparação para Deploy

- `docs/deploy.md`: guia completo cobrindo migrações a aplicar, configuração de Auth no Supabase (Site URL, Redirect URLs — crítico para o link de redefinição de senha funcionar em produção, decisão sobre exigir confirmação de e-mail), variáveis de ambiente, build, hospedagem recomendada (Vercel/Netlify com fallback de SPA) e um checklist de deploy dedicado ao Alpha privado.

## 3. Critérios de Aceite

- [x] Usuário pode solicitar redefinição de senha por e-mail e definir uma nova senha através de um link real do Supabase Auth.
- [x] Link de redefinição inválido/expirado é tratado com uma mensagem clara, não com uma tela quebrada.
- [x] Cadastro informa claramente quando a confirmação de e-mail é necessária, com opção de reenvio; login também oferece reenvio quando o erro for especificamente "e-mail não confirmado".
- [x] Login, Cadastro, telas de senha, Dashboard, painéis, listas e modais permanecem usáveis (sem overflow horizontal ou elementos cortados) entre 320px e 1920px de largura.
- [x] Primeiro acesso apresenta um fluxo guiado de 6 passos (boas-vindas → renda → reserva → despesas fixas → primeira meta → conclusão), com progresso salvo no Supabase.
- [x] Usuário que já concluiu o onboarding nunca mais o vê; usuários que já tinham dados configurados antes desta sprint não são forçados a refazer o fluxo (backfill).
- [x] Checklist de deploy documentado, cobrindo migrações, configuração de Auth, variáveis de ambiente e hospedagem.
- [x] `npm run lint` e `npm run build` executam sem erros.
- [x] Não há regressão nas funcionalidades das sprints anteriores.

## 4. Como Aplicar a Migração

A migração SQL (`20260714100000_create_onboarding_status_table.sql`) precisa ser aplicada manualmente, seguindo o mesmo processo das sprints anteriores (Supabase Dashboard → SQL Editor, ou `supabase db push`). Ver `docs/deploy.md` para o checklist completo, incluindo a configuração adicional de Auth (Site URL/Redirect URLs) necessária para o fluxo de redefinição de senha funcionar fora do ambiente local.

## 5. Auto Code Review

- Corrigido erro de lint `react-hooks/set-state-in-effect` em `ResetPassword.tsx` (chamada de `setState` direta no corpo do efeito quando o Supabase não está configurado), usando o mesmo padrão (`Promise.resolve().then(...)`) já estabelecido em outros hooks/componentes do projeto.
- Ajustado `Dashboard.tsx` para não renderizar o Dashboard completo "por baixo" do wizard de onboarding enquanto o status ainda está sendo carregado — um estado de carregamento explícito é exibido primeiro, evitando um flash de conteúdo.
- Validações dos passos 2 e 3 do onboarding reaproveitam o `financialProfileSchema` já existente (via `.pick()`), em vez de duplicar as regras de validação de renda/reserva mínima.
- **Revisão adicional (Missão "Alpha Ready")**: adicionado `aria-label` em todos os campos de `Login.tsx`/`Register.tsx` (único ponto da aplicação ainda dependendo só de `placeholder`); RLS, segurança, responsividade, tipagem e duplicação verificados em todo o escopo desta sprint sem novos problemas encontrados (ver `roadmap/changelog.md`, "[Sprint 6 — Auto Code Review]").
- `npm run lint` e `npm run build` executados com sucesso após as correções.

## 6. Itens Adiados

- **Testes automatizados** (unitários/E2E) — permanece no backlog; o checklist de deploy (`docs/deploy.md`) depende de verificação manual por enquanto.
- **Monitoramento de erros em produção** (Sentry ou similar) — recomendado no checklist de deploy, mas não implementado nesta sprint (fora do escopo solicitado).
- **Paginação nas listagens** (transações/contas/metas/despesas fixas) — aceitável para o volume inicial de um Alpha privado, registrado no backlog para revisão futura.
- **Edição de movimentações/contas/despesas fixas** — mesma limitação de sprints anteriores, não fazia parte do escopo desta sprint.

# Sprint 11 — Microinterações Premium (Missão 12)

## Status: ✅ Concluída

## 1. Objetivo

Implementar a camada de microinterações premium da Atlas — som, animações, toasts, contadores e feedback visual — **desacoplada** em `src/lib/microinteractions`, sem alterar regras de negócio, Supabase, Pluggy ou rotas.

## 2. Arquitetura

```
UI / eventos de domínio
        ↓
triggerMicrointeraction(event, options)
        ↓
som | money rain | glow | sync | toast | haptic
```

- API pública estável: `triggerMicrointeraction` (compatível com Sprint 8).
- `ToastHost` montado no `AppShell`.
- Ponte `startOpenFinanceMicrointeractionBridge` escuta Pix local (`onPixReceived`) sem I/O externo.
- Respeita `prefers-reduced-motion` e preferência de som (`localStorage`).

## 3. Escopo implementado

| Recurso | Detalhe |
|---|---|
| Som de dinheiro | Web Audio API sintético (`money_in`, `celebration`, `bank_connected`) |
| Chuva de dinheiro | Overlay DOM + CSS (`transform`/`opacity`, GPU) |
| Contador animado | `AnimatedNumber` via rAF (sem re-render por frame) |
| Glow | Classe `atlas-mi-glow` no Hero / cards quando saldo sobe |
| Sync bancos | Spin no ícone + evento `bank_sync` |
| Toasts | success / error / warning / info |
| Conectar banco | `bank_connected` (som + rain + toast + pop) |
| Intelligence / Timeline | stagger CSS (`atlas-mi-intel-enter`, `atlas-mi-timeline-enter`) |

### Eventos

`celebration` · `success` · `error` · `warning` · `info` · `tap` · `money_in` · `bank_connected` · `bank_sync`

## 4. Integrações (somente feedback)

- Home: receita → `money_in`; despesa/conta → `success`; meta → `celebration`
- WealthHero: `AnimatedNumber` + glow se saldo aumentar
- Hub Open Finance: sync animado + contadores
- Conectar bancos: `bank_connected` / `error`
- Atlas Intelligence + Bills Timeline: animações de entrada

## 5. Fora de escopo

- Alteração de hooks/services/engines, schema, auth, Pluggy HTTP, rotas

## 6. Validação

- [x] `npm run lint`
- [x] `npm run build`

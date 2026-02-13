

# Corrigir Workflow: Animacao Apenas Quando Agente Activo

## Problema

O workflow mostra estados coloridos (verde "OK", roxo "A processar", vermelho "Erro") mesmo quando o agente ja terminou. Isto acontece porque a funcao `computeNodeStatuses` trata logs com `status: 'info'` como "running" sem verificar se o agente ja concluiu (`agent_complete`).

Dados reais da base de dados confirmam: o ultimo `agent_start` foi as 09:10:02 e o `agent_complete` as 09:10:23 — o agente esta PARADO, mas o workflow mostra nos activos.

## Solucao

### Logica corrigida em `useWorkflowStatus.ts`

A funcao `computeNodeStatuses` passa a verificar se existe um `agent_complete` DEPOIS do ultimo `agent_start`. Se sim, o agente terminou e todos os nos ficam `idle` (neutro/cinza).

```text
Agente PARADO (agent_complete existe apos agent_start):
  ( RSS )----( Normalizar )----( IA Reform. )----( Validar )----( Concluido )
  [Espera]     [Espera]          [Espera]         [Espera]       [Espera]
  (tudo cinza, sem animacao)

Agente A TRABALHAR (agent_start sem agent_complete):
  ( RSS )----( Normalizar )----( IA Reform. )----( Validar )----( Concluido )
   [OK]         [OK]           [A processar]      [Espera]       [Espera]
  (verde)     (verde)          (azul pulsante)    (cinza)        (cinza)
```

### Alteracoes concretas

**Ficheiro: `src/admin/hooks/useWorkflowStatus.ts`**

Modificar `computeNodeStatuses`:

1. Encontrar o indice do ultimo `agent_start` nos logs (ordenados DESC)
2. Verificar se existe `agent_complete` num indice MENOR (mais recente) que o `agent_start`
3. Se `agent_complete` existe antes do `agent_start`: agente terminou, retornar todos os nos como `idle`
4. Se nao existe `agent_complete`: agente esta a trabalhar, calcular estados normalmente MAS corrigir a logica de `running` vs `success`:
   - Um no so e `running` se tem logs `info` E nao tem logs `success` posteriores dentro do mesmo no
   - Um no e `success` se o ultimo log relevante tem `status: 'success'`
   - Um no e `error` se tem qualquer log com `status: 'error'`

Corrigir tambem `isAgentRunning`: usar a mesma verificacao (agent_complete vs agent_start) em vez de depender dos estados dos nos.

**Ficheiro: `src/admin/components/pipeline/WorkflowStrip.tsx`**

Sem alteracoes estruturais. O componente ja reage correctamente aos estados — o problema esta apenas nos dados que recebe. Quando todos os nos forem `idle`, o componente ja mostra tudo em cinza neutro e sem animacao.

## Ficheiros a modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/admin/hooks/useWorkflowStatus.ts` | Corrigir `computeNodeStatuses` para detectar agente parado e corrigir logica de running vs success |

## Resultado esperado

- Agente parado: todos os nos cinza, badge "Pronto", zero animacoes
- Agente a trabalhar: nos iluminam-se sequencialmente conforme os logs chegam via realtime, no activo pulsa em azul, concluidos ficam verdes, erros ficam vermelhos
- Ao recarregar a pagina: se o agente esta parado, tudo neutro; se esta a meio de execucao, mostra o estado real


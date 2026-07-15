// Utilitários mínimos de data (sem dependência externa como date-fns/dayjs,
// alinhado ao princípio de simplicidade do CLAUDE.md). Datas são tratadas
// sempre como "YYYY-MM-DD" (calendário local do usuário, sem hora/timezone),
// o mesmo formato devolvido pela coluna `date` do Postgres/Supabase.

function pad(numero: number): string {
  return String(numero).padStart(2, "0");
}

function paraISO(data: Date): string {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

export function getTodayISO(): string {
  return paraISO(new Date());
}

export function addDaysISO(dataISO: string, dias: number): string {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  data.setDate(data.getDate() + dias);
  return paraISO(data);
}

function getUltimoDiaDoMes(ano: number, mesNum: number): number {
  // Dia 0 do mês seguinte é sempre o último dia do mês atual.
  return new Date(ano, mesNum, 0).getDate();
}

// Dias restantes no mês corrente, incluindo o próprio dia informado
// (usado para dividir o saldo disponível em um "quanto posso gastar hoje").
export function getDiasRestantesNoMes(dataISO: string = getTodayISO()): number {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  const ultimoDia = getUltimoDiaDoMes(ano, mes);
  return Math.max(1, ultimoDia - dia + 1);
}

// Meses restantes até uma data-alvo (mínimo 1, para nunca dividir por zero
// ao calcular o aporte mensal necessário para uma meta).
export function getMesesRestantes(dataAlvoISO: string, hojeISO: string = getTodayISO()): number {
  const [anoAlvo, mesAlvo] = dataAlvoISO.split("-").map(Number);
  const [anoHoje, mesHoje] = hojeISO.split("-").map(Number);
  const diferenca = (anoAlvo - anoHoje) * 12 + (mesAlvo - mesHoje);
  return Math.max(1, diferenca);
}

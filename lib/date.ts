// Utilidad central para forzar la zona horaria correcta de Ecuador
// Evita los bugs de zona horaria UTC que ocurren en servidores de Vercel (EE.UU)

export const TIMEZONE = "America/Guayaquil";

/**
 * Retorna la fecha actual en Ecuador en formato 'YYYY-MM-DD'
 * Útil para registro de visitas y base de datos
 */
export function getEcuadorDateString(): string {
  // 'en-CA' produce formato 'YYYY-MM-DD' nativamente
  return new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/**
 * Retorna el mes y día en Ecuador en formato '-MM-DD'
 * Útil para buscar cumpleaños (ej: '-12-31')
 */
export function getEcuadorMonthDay(): string {
  const dateStr = getEcuadorDateString(); // YYYY-MM-DD
  return dateStr.slice(4); // returns '-MM-DD'
}

/**
 * Retorna la fecha de hace N días en Ecuador en formato 'YYYY-MM-DD'
 * Útil para calcular clientes en riesgo
 */
export function getEcuadorDateStringDaysAgo(days: number): string {
  const d = new Date();
  // We offset the internal UTC time roughly by the target timezone offset before subtracting days
  // Actually, standard Date manipulation combined with toLocaleDateString works best:
  // Since Ecuador is UTC-5, we can just subtract days from the local date
  const ecuadorDateStr = getEcuadorDateString(); // YYYY-MM-DD
  const [year, month, day] = ecuadorDateStr.split('-').map(Number);
  
  // Create a Date object representing midnight in local time
  const targetDate = new Date(year, month - 1, day);
  targetDate.setDate(targetDate.getDate() - days);
  
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dStr = String(targetDate.getDate()).padStart(2, '0');
  
  return `${y}-${m}-${dStr}`;
}

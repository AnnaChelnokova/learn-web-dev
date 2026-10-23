// ==========================================================================
// ДАННЫЕ СЛОТОВ И «СЕРВЕРА» (BARBER & CO)
// ==========================================================================

export const SERVER_DATA = {
  today: { day: 12, month: 9, year: 2026 },
  defaultDay: 15,
  defaultMonth: 9,
  defaultYear: 2026,
  defaultTime: "14:00",
};

// Слоты для нечётных дней (13, 15, 17 октября)
export const SLOTS_ODD_DAY = [
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
];

// Слоты для чётных дней (12, 14, 18 октября)
export const SLOTS_EVEN_DAY = [
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "12:00", available: false },
  { time: "13:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
];

// Стартовые слоты по умолчанию (на 15 октября)
export const DEFAULT_SLOTS = SLOTS_ODD_DAY;

// Имитация получения слотов на конкретную дату
export function getSlotsForDay(day, month, year) {
  // Альтернативный сценарий из макета Figma: 16 октября все слоты заняты
  if (day === 16 && month === 9 && year === 2026) {
    return [];
  }
  return day % 2 === 0 ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;
}

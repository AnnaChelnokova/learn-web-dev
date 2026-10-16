// «База данных» сервера для BARBER & CO
//
// Содержит:
//   - today — «сегодня» по мнению сервера ({ day: 12, month: 9, year: 2026 });
//   - defaultDay — день, выбранный по умолчанию (15 октября 2026);
//   - slotsEvenDay / slotsOddDay — два набора слотов в соответствии с макетом.

export const database = {
  // «Сегодня» — 12 октября 2026 года
  today: {
    day: 12,
    month: 9,
    year: 2026,
    defaultDay: 15,
  },

  // Слоты для чётных дней (12, 14, 18 октября)
  slotsEvenDay: [
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: false },
    { time: "13:00", available: true },
    { time: "14:00", available: false },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
  ],

  // Слоты для нечётных дней (13, 15, 17 октября)
  slotsOddDay: [
    { time: "10:00", available: true },
    { time: "11:00", available: false },
    { time: "12:00", available: true },
    { time: "13:00", available: false },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true },
  ],
};
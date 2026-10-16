// ============================================================
// 1. ДАННЫЕ (СЛОТЫ, «СЕГОДНЯ»)
// ============================================================
//
// В реальном приложении эти данные приходят с сервера через API.
// Сейчас мы моделируем ответ сервера в виде констант.
// Месяцы в JavaScript 0-индексные: 0 = Январь, 9 = Октябрь.

// Дата «сегодня» — 12 октября 2026 года
const SERVER_DATA = {
  today: { day: 12, month: 9, year: 2026 },
};

// Слоты для нечётных дней (например, 13, 15, 17 октября)
const SLOTS_ODD_DAY = [
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: false },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
];

// Слоты для чётных дней (например, 12, 14, 18 октября)
const SLOTS_EVEN_DAY = [
  { time: "10:00", available: true },
  { time: "11:00", available: true },
  { time: "12:00", available: false },
  { time: "13:00", available: true },
  { time: "14:00", available: false },
  { time: "15:00", available: true },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
];

// Функция имитации запроса слотов с сервера на конкретный день
function getSlotsForDay(day, month, year) {
  // Альтернативный сценарий из макета Figma: 16 октября все слоты заняты
  if (day === 16 && month === 9 && year === 2026) {
    return [];
  }
  // Для остальных дней возвращаем разный набор по чётности дня
  return day % 2 === 0 ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;
}

// ============================================================
// 2. СОСТОЯНИЕ (МЕСЯЦ, ДЕНЬ, ВРЕМЯ)
// ============================================================
//
// Состояние интерфейса, которое меняется по действиям пользователя.
// По умолчанию при открытии страницы выбран день 15 октября 2026 и слот 14:00.
const BOOKING_STATE = {
  currentMonth: 9,      // Отображаемый месяц в календаре (Октябрь)
  currentYear: 2026,    // Отображаемый год в календаре
  selectedDay: 15,      // Выбранное число
  selectedMonth: 9,     // Месяц выбранного числа
  selectedYear: 2026,   // Год выбранного числа
  selectedTime: "14:00" // Выбранный слот времени
};

// ============================================================
// 3. ЧИСТЫЕ ФУНКЦИИ (ДЛЯ РАБОТЫ С ДАТАМИ)
// ============================================================
//
// Чистые функции не зависят от DOM и внешнего окружения.
// Принимают параметры и возвращают результат.

const MONTHS_NOMINATIVE = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

const MONTHS_GENITIVE = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря"
];

const DAYS_OF_WEEK = [
  "Воскресенье", "Понедельник", "Вторник", "Среда",
  "Четверг", "Пятница", "Суббота"
];

// Сравнение двух дат: возвращает -1 (раньше), 0 (равны), 1 (позже)
function compareDates(date1, date2) {
  const d1 = new Date(date1.year, date1.month, date1.day);
  const d2 = new Date(date2.year, date2.month, date2.day);
  if (d1 < d2) return -1;
  if (d1 > d2) return 1;
  return 0;
}

// Проверка: можно ли выбрать дату (дни раньше «сегодня» недоступны)
function isDateSelectable(day, month, year) {
  const today = SERVER_DATA.today;
  return compareDates({ day: day, month: month, year: year }, today) >= 0;
}

// Построение сетки дней месяца (включая «хвосты» соседних месяцев)
function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  // Дни предыдущего месяца
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLastDay - i, otherMonth: true });
  }

  // Дни текущего месяца
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, otherMonth: false });
  }

  // Дни следующего месяца для завершения строк (кратность 7)
  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    cells.push({ day: nextDay, otherMonth: true });
    nextDay++;
  }

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// ============================================================
// 4. ОТРИСОВКА И ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================================

// Отрисовка календаря на текущий месяц
function renderCalendar() {
  const monthTitleEl = document.querySelector(".calendar-card__month");
  const calendarGrid = document.querySelector(".calendar-days-grid");

  if (!monthTitleEl || !calendarGrid) return;

  const year = BOOKING_STATE.currentYear;
  const month = BOOKING_STATE.currentMonth;

  // Обновление заголовка: «Октябрь 2026»
  monthTitleEl.textContent = MONTHS_NOMINATIVE[month] + " " + year;

  const weeks = buildCalendarGrid(year, month);
  const today = SERVER_DATA.today;

  let html = "";

  weeks.forEach(function (week) {
    week.forEach(function (cell) {
      let classes = "day-cell";
      let disabledAttr = "";

      if (cell.otherMonth) {
        classes += " other-month";
        disabledAttr = " disabled";
      } else {
        const isToday =
          cell.day === today.day &&
          month === today.month &&
          year === today.year;
        if (isToday) classes += " today";

        const isSelected =
          cell.day === BOOKING_STATE.selectedDay &&
          month === BOOKING_STATE.selectedMonth &&
          year === BOOKING_STATE.selectedYear;
        if (isSelected) classes += " selected";

        const selectable = isDateSelectable(cell.day, month, year);
        if (!selectable) {
          classes += " disabled";
          disabledAttr = " disabled";
        }
      }

      html +=
        '<button type="button" class="' +
        classes +
        '"' +
        disabledAttr +
        ' data-day="' +
        cell.day +
        '" data-other="' +
        cell.otherMonth +
        '">' +
        cell.day +
        "</button>";
    });
  });

  calendarGrid.innerHTML = html;

  // Навешиваем обработчики клика заново после каждой перерисовки
  const dayButtons = calendarGrid.querySelectorAll(
    ".day-cell:not(.other-month):not(.disabled)"
  );
  dayButtons.forEach(function (btn) {
    btn.addEventListener("click", onDayClick);
  });
}

// Обработчик клика по дню в календаре
function onDayClick(event) {
  const cell = event.currentTarget;
  const day = parseInt(cell.dataset.day, 10);

  BOOKING_STATE.selectedDay = day;
  BOOKING_STATE.selectedMonth = BOOKING_STATE.currentMonth;
  BOOKING_STATE.selectedYear = BOOKING_STATE.currentYear;

  // Сбрасываем выбранное время при переключении на другой день
  BOOKING_STATE.selectedTime = null;

  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
}

// Отрисовка слотов времени
function renderTimeSlots() {
  const timeGrid = document.querySelector(".time-slots-grid");
  const timeTitleEl = document.querySelector(".time-card__title");

  if (!timeGrid) return;

  const day = BOOKING_STATE.selectedDay;
  const month = BOOKING_STATE.selectedMonth;
  const year = BOOKING_STATE.selectedYear;

  // Обновляем заголовок карточки времени: «Доступное время • 15 октября»
  if (timeTitleEl) {
    timeTitleEl.innerHTML =
      "Доступное время &bull; " + day + " " + MONTHS_GENITIVE[month];
  }

  const slots = getSlotsForDay(day, month, year);

  // Если слотов нет (альтернативный сценарий)
  if (!slots || slots.length === 0) {
    timeGrid.innerHTML =
      '<div class="time-slots-empty" style="grid-column: 1 / -1; text-align: center; padding: 40px 16px; color: var(--color-text-muted); font-size: 15px; background: #F9FAFB; border-radius: var(--radius-md); border: 1px dashed var(--color-border);">' +
      "В этот день нет свободных слотов для записи" +
      "</div>";
    return;
  }

  let html = "";
  slots.forEach(function (slot) {
    let classes = "time-slot";
    let disabledAttr = "";
    let iconHtml = "";

    if (!slot.available) {
      classes += " unavailable";
      disabledAttr = " disabled";
      iconHtml = ' <span class="time-slot__icon" aria-hidden="true">&times;</span>';
    } else if (slot.time === BOOKING_STATE.selectedTime) {
      classes += " selected";
    }

    html +=
      '<button type="button" class="' +
      classes +
      '"' +
      disabledAttr +
      ' data-time="' +
      slot.time +
      '">' +
      '<span class="time-slot__time">' +
      slot.time +
      "</span>" +
      iconHtml +
      "</button>";
  });

  timeGrid.innerHTML = html;

  // Навешиваем обработчики только на доступные слоты
  const availableSlots = timeGrid.querySelectorAll(
    ".time-slot:not(.unavailable)"
  );
  availableSlots.forEach(function (btn) {
    btn.addEventListener("click", onTimeSlotClick);
  });
}

// Обработчик клика по слоту времени
function onTimeSlotClick(event) {
  const slotBtn = event.currentTarget;
  const time = slotBtn.dataset.time;

  BOOKING_STATE.selectedTime = time;

  renderTimeSlots();
  updateBottomBar();
}

// Обновление нижней панели с выбранной датой и временем
function updateBottomBar() {
  const summaryValueEl = document.querySelector(".summary-bar__value");
  if (!summaryValueEl) return;

  const day = BOOKING_STATE.selectedDay;
  const month = BOOKING_STATE.selectedMonth;
  const year = BOOKING_STATE.selectedYear;

  const dateObj = new Date(year, month, day);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  const monthName = MONTHS_GENITIVE[month];

  const timePart = BOOKING_STATE.selectedTime
    ? BOOKING_STATE.selectedTime
    : "время не выбрано";

  summaryValueEl.textContent =
    dayName + ", " + day + " " + monthName + " " + year + " • " + timePart;
}

// Настройка перелистывания месяцев стрелками «‹» и «›»
function setupMonthNavigation() {
  const prevBtn = document.querySelector(".calendar-nav-prev");
  const nextBtn = document.querySelector(".calendar-nav-next");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      BOOKING_STATE.currentMonth -= 1;
      if (BOOKING_STATE.currentMonth < 0) {
        BOOKING_STATE.currentMonth = 11;
        BOOKING_STATE.currentYear -= 1;
      }
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      BOOKING_STATE.currentMonth += 1;
      if (BOOKING_STATE.currentMonth > 11) {
        BOOKING_STATE.currentMonth = 0;
        BOOKING_STATE.currentYear += 1;
      }
      renderCalendar();
    });
  }
}

// Настройка кнопки продолжения записи
function setupContinueButton() {
  const continueBtn = document.querySelector(".summary-bar__btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function (event) {
      if (!BOOKING_STATE.selectedTime) {
        event.preventDefault();
        alert("Пожалуйста, выберите удобное время для записи.");
        return;
      }
      try {
        localStorage.setItem(
          "barber-booking",
          JSON.stringify({
            day: BOOKING_STATE.selectedDay,
            month: BOOKING_STATE.selectedMonth,
            year: BOOKING_STATE.selectedYear,
            time: BOOKING_STATE.selectedTime,
          })
        );
      } catch (e) {}
    });
  }
}

// ============================================================
// 5. ИНИЦИАЛИЗАЦИЯ
// ============================================================

function init() {
  renderCalendar();
  renderTimeSlots();
  updateBottomBar();
  setupMonthNavigation();
  setupContinueButton();
}

// Запуск инициализации после построения DOM дерева
document.addEventListener("DOMContentLoaded", function () {
  init();
});

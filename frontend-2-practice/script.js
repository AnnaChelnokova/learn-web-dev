// ============================================================
// 1. ДАННЫЕ (СЛОТЫ, «СЕГОДНЯ») — BARBER & CO
// ============================================================
//
// В реальном приложении эти данные приходят с сервера через API.
// Сейчас мы моделируем ответ сервера в виде констант.
// Месяцы в JavaScript 0-индексные: 0 = Январь, 9 = Октябрь.

// Текущая актуальная дата («сегодня») формируется динамически через new Date()
const realNow = new Date();
const SERVER_DATA = {
  today: {
    day: realNow.getDate(),
    month: realNow.getMonth(),
    year: realNow.getFullYear(),
  },
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
  return day % 2 === 0 ? SLOTS_EVEN_DAY : SLOTS_ODD_DAY;
}

// Находим первый свободный слот для актуальной даты
const initialTodaySlots = getSlotsForDay(
  SERVER_DATA.today.day,
  SERVER_DATA.today.month,
  SERVER_DATA.today.year
);
const firstAvailableTodaySlot = initialTodaySlots.find(function (s) {
  return s.available;
});

// ============================================================
// 2. СОСТОЯНИЕ (МЕСЯЦ, ДЕНЬ, ВРЕМЯ)
// ============================================================
//
// Состояние интерфейса, которое меняется по действиям пользователя.
// Инициализируется актуальной доступной датой и первым свободным слотом.
const BOOKING_STATE = {
  currentMonth: SERVER_DATA.today.month, // Отображаемый месяц в календаре
  currentYear: SERVER_DATA.today.year, // Отображаемый год в календаре
  selectedDay: SERVER_DATA.today.day, // Выбранный день (актуальная дата)
  selectedMonth: SERVER_DATA.today.month, // Месяц выбранного дня
  selectedYear: SERVER_DATA.today.year, // Год выбранного дня
  selectedTime: firstAvailableTodaySlot ? firstAvailableTodaySlot.time : null, // Выбранный слот времени
};

// ============================================================
// 3. ЧИСТЫЕ ФУНКЦИИ (ДЛЯ РАБОТЫ С ДАТАМИ)
// ============================================================

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

  // Дни следующего месяца
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

// Отрисовка календаря
function renderCalendar() {
  const monthTitleEl = document.querySelector(".calendar-card__month");
  const calendarGrid = document.querySelector(".calendar-days-grid");

  if (!monthTitleEl || !calendarGrid) return;

  const year = BOOKING_STATE.currentYear;
  const month = BOOKING_STATE.currentMonth;

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

        // Проверяем выбранный день по числу, месяцу и году
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

  // Сбрасываем выбранное время при переключении даты
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

  if (!day || month === null || year === null) {
    if (timeTitleEl) timeTitleEl.textContent = "Доступное время";
    timeGrid.innerHTML =
      '<div class="time-slots-empty">' +
      "Выберите день в календаре для просмотра слотов" +
      "</div>";
    return;
  }

  if (timeTitleEl) {
    timeTitleEl.innerHTML =
      "Доступное время &bull; " + day + " " + MONTHS_GENITIVE[month];
  }

  const slots = getSlotsForDay(day, month, year);

  if (!slots || slots.length === 0) {
    timeGrid.innerHTML =
      '<div class="time-slots-empty">' +
      "В этот день нет свободных слотов для записи" +
      "</div>";
    return;
  }

  let html = "";
  slots.forEach(function (slot) {
    let classes = "time-slot";
    let disabledAttr = "";
    let extraHtml = "";

    if (!slot.available) {
      classes += " unavailable";
      disabledAttr = " disabled";
      extraHtml = ' <span class="time-slot__label">(Занято)</span>';
    } else if (slot.time === BOOKING_STATE.selectedTime) {
      classes += " selected";
      extraHtml = ' <span class="time-slot__icon" aria-hidden="true">&#10003;</span>';
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
      extraHtml +
      "</button>";
  });

  timeGrid.innerHTML = html;

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

// Обновление нижней панели
function updateBottomBar() {
  const summaryValueEl = document.querySelector(".summary-bar__value");
  if (!summaryValueEl) return;

  const day = BOOKING_STATE.selectedDay;
  const month = BOOKING_STATE.selectedMonth;
  const year = BOOKING_STATE.selectedYear;

  if (!day || month === null || year === null) {
    summaryValueEl.textContent = "Выберите дату и время для записи";
    return;
  }

  const dateObj = new Date(year, month, day);
  const dayName = DAYS_OF_WEEK[dateObj.getDay()];
  const monthName = MONTHS_GENITIVE[month];

  const timePart = BOOKING_STATE.selectedTime
    ? BOOKING_STATE.selectedTime
    : "время не выбрано";

  summaryValueEl.textContent =
    dayName + ", " + day + " " + monthName + " " + year + " • " + timePart;
}

// Переключение месяцев
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
      // При смене месяца сбрасываем день и время, согласуя интерфейс
      BOOKING_STATE.selectedDay = null;
      BOOKING_STATE.selectedTime = null;
      renderCalendar();
      renderTimeSlots();
      updateBottomBar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      BOOKING_STATE.currentMonth += 1;
      if (BOOKING_STATE.currentMonth > 11) {
        BOOKING_STATE.currentMonth = 0;
        BOOKING_STATE.currentYear += 1;
      }
      // При смене месяца сбрасываем день и время, согласуя интерфейс
      BOOKING_STATE.selectedDay = null;
      BOOKING_STATE.selectedTime = null;
      renderCalendar();
      renderTimeSlots();
      updateBottomBar();
    });
  }
}

// Отображение модального окна подтверждения
function showBookingConfirmation(data) {
  const modal = document.getElementById("confirmation-modal");
  const detailsEl = document.getElementById("modal-details");
  const monthName = MONTHS_GENITIVE[data.month];

  if (detailsEl) {
    detailsEl.innerHTML =
      '<div class="booking-modal__item"><strong>Мастер:</strong> ' + data.master + "</div>" +
      '<div class="booking-modal__item"><strong>Услуга:</strong> ' + data.service + "</div>" +
      '<div class="booking-modal__item"><strong>Дата:</strong> ' + data.day + " " + monthName + " " + data.year + "</div>" +
      '<div class="booking-modal__item"><strong>Время:</strong> ' + data.time + "</div>";
  }

  if (modal) {
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  } else {
    alert(
      "Запись успешно оформлена!\n\n" +
      "Мастер: " + data.master + "\n" +
      "Услуга: " + data.service + "\n" +
      "Дата: " + data.day + " " + monthName + " " + data.year + "\n" +
      "Время: " + data.time
    );
  }
}

// Настройка кнопки продолжения записи
function setupContinueButton() {
  const continueBtn = document.querySelector(".summary-bar__btn");
  if (continueBtn) {
    continueBtn.addEventListener("click", function (event) {
      event.preventDefault();

      // 1. Проверка наличия выбранной даты
      if (
        !BOOKING_STATE.selectedDay ||
        BOOKING_STATE.selectedMonth === null ||
        BOOKING_STATE.selectedYear === null
      ) {
        alert("Пожалуйста, выберите дату для записи в календаре.");
        return;
      }

      // 2. Проверка доступности даты (не раньше «сегодня»)
      if (
        !isDateSelectable(
          BOOKING_STATE.selectedDay,
          BOOKING_STATE.selectedMonth,
          BOOKING_STATE.selectedYear
        )
      ) {
        alert("Выбранная дата недоступна для записи (уже прошла).");
        return;
      }

      // 3. Проверка выбранного времени
      if (!BOOKING_STATE.selectedTime) {
        alert("Пожалуйста, выберите удобное время для записи.");
        return;
      }

      // 4. Проверка доступности слота
      const slots = getSlotsForDay(
        BOOKING_STATE.selectedDay,
        BOOKING_STATE.selectedMonth,
        BOOKING_STATE.selectedYear
      );
      const chosenSlot = slots.find(function (s) {
        return s.time === BOOKING_STATE.selectedTime;
      });

      if (!chosenSlot || !chosenSlot.available) {
        alert("Выбранное время недоступно для записи. Пожалуйста, выберите другой слот.");
        return;
      }

      const bookingData = {
        master: "Алексей Смирнов",
        service: "Мужская стрижка + Моделирование бороды",
        day: BOOKING_STATE.selectedDay,
        month: BOOKING_STATE.selectedMonth,
        year: BOOKING_STATE.selectedYear,
        time: BOOKING_STATE.selectedTime,
        timestamp: new Date().toISOString(),
      };

      try {
        localStorage.setItem("barber-booking", JSON.stringify(bookingData));
      } catch (e) {}

      // Показываем подтверждение
      showBookingConfirmation(bookingData);
    });
  }

  // Закрытие модального окна
  const closeBtn = document.getElementById("modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      const modal = document.getElementById("confirmation-modal");
      if (modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
      }
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

document.addEventListener("DOMContentLoaded", function () {
  init();
});

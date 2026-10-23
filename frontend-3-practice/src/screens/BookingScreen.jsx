import { useState } from "react";
import Calendar from "../components/booking/Calendar";
import TimeSlots from "../components/booking/TimeSlots";
import BookingBottomBar from "../components/booking/BookingBottomBar";
import { SERVER_DATA, DEFAULT_SLOTS, getSlotsForDay } from "../data/slots";
import { MONTHS_GENITIVE } from "../data/date";

function BookingScreen() {
  const today = SERVER_DATA.today;

  // ==========================================================================
  // Состояние страницы
  // ==========================================================================
  const [currentMonth, setCurrentMonth] = useState(SERVER_DATA.defaultMonth);
  const [currentYear, setCurrentYear] = useState(SERVER_DATA.defaultYear);
  const [selectedDay, setSelectedDay] = useState(SERVER_DATA.defaultDay);
  const [selectedMonth, setSelectedMonth] = useState(SERVER_DATA.defaultMonth);
  const [selectedYear, setSelectedYear] = useState(SERVER_DATA.defaultYear);
  const [selectedTime, setSelectedTime] = useState(SERVER_DATA.defaultTime);
  const [slots, setSlots] = useState(DEFAULT_SLOTS);

  // ==========================================================================
  // Обработчики событий
  // ==========================================================================

  // Клик по числу в календаре: меняет день, сбрасывает время, загружает слоты
  function handleDayClick(day) {
    setSelectedDay(day);
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedTime(null);
    setSlots(getSlotsForDay(day, currentMonth, currentYear));
  }

  // Клик по слоту времени: выбирает время
  function handleTimeClick(time) {
    setSelectedTime(time);
  }

  // Навигация по месяцам: назад (сбрасываем день, время и слоты для согласованности)
  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
    setSelectedTime(null);
    setSlots([]);
  }

  // Навигация по месяцам: вперед (сбрасываем день, время и слоты для согласованности)
  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
    setSelectedTime(null);
    setSlots([]);
  }

  // Кнопка «Продолжить» в нижней плашке
  function handleContinue() {
    if (!selectedDay) {
      alert("Пожалуйста, выберите дату для записи.");
      return;
    }
    if (!selectedTime) {
      alert("Пожалуйста, выберите удобное время для записи.");
      return;
    }
    try {
      localStorage.setItem(
        "barber-booking",
        JSON.stringify({
          day: selectedDay,
          month: currentMonth,
          year: currentYear,
          time: selectedTime,
        })
      );
      const monthName = MONTHS_GENITIVE[currentMonth];
      alert(`Запись сохранена: ${selectedDay} ${monthName} ${currentYear} в ${selectedTime}`);
    } catch (e) {}
  }

  return (
    <main className="main-content">
      <div className="container">
        {/* Заголовок страницы и кнопка Назад */}
        <div className="page-header">
          <a
            href="#"
            className="back-link"
            onClick={function (e) {
              e.preventDefault();
            }}
          >
            <span className="back-link__icon" aria-hidden="true">
              &larr;
            </span>
            <span>Назад</span>
          </a>
          <div className="page-header__content">
            <h1 className="page-header__title">Выберите дату и время</h1>
            <p className="page-header__subtitle">
              Мастер: Алексей Смирнов &bull; Услуга: Мужская стрижка +
              Моделирование бороды
            </p>
          </div>
        </div>

        {/* Сетка выбора даты и времени (две колонки) */}
        <div className="booking-grid">
          <Calendar
            year={currentYear}
            month={currentMonth}
            selectedDay={selectedDay}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            today={today}
            onDayClick={handleDayClick}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />

          <TimeSlots
            slots={slots}
            selectedDay={selectedDay}
            month={currentMonth}
            selectedTime={selectedTime}
            onTimeClick={handleTimeClick}
          />
        </div>

        {/* Нижняя панель с выбранным временем */}
        <BookingBottomBar
          day={selectedDay}
          month={currentMonth}
          year={currentYear}
          selectedTime={selectedTime}
          onContinue={handleContinue}
        />
      </div>
    </main>
  );
}

export default BookingScreen;

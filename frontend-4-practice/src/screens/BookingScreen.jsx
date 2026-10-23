import { useState, useEffect } from "react";
import Calendar from "../components/booking/Calendar";
import TimeSlots from "../components/booking/TimeSlots";
import BookingBottomBar from "../components/booking/BookingBottomBar";
import { LoadingState, EmptyState } from "../components/common/LoadingState";
import { fetchToday, fetchSlots } from "../api";
import { MONTHS_GENITIVE } from "../data/date";

function BookingScreen() {
  // ==========================================================================
  // Состояния загрузки данных с сервера (today и слоты)
  // ==========================================================================
  const [today, setToday] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);
  const [errorToday, setErrorToday] = useState(null);

  // Выбранный месяц, год, число и время
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Слоты времени
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorSlots, setErrorSlots] = useState(null);

  // ==========================================================================
  // 1. Загрузка «сегодня» при открытии страницы
  // ==========================================================================
  useEffect(() => {
    let isCurrent = true;

    async function loadToday() {
      try {
        setLoadingToday(true);
        setErrorToday(null);
        const data = await fetchToday();

        if (!isCurrent) return;

        setToday(data);
        setCurrentMonth(data.month);
        setCurrentYear(data.year);
        // Выбираем стартовый день (defaultDay, если передан в объекте, иначе data.day)
        const initialDay = data.defaultDay || data.day;
        setSelectedDay(initialDay);
        setSelectedMonth(data.month);
        setSelectedYear(data.year);
      } catch (err) {
        if (!isCurrent) return;
        setErrorToday(err.message || "Ошибка при получении данных с сервера");
      } finally {
        if (isCurrent) {
          setLoadingToday(false);
        }
      }
    }

    loadToday();

    return () => {
      isCurrent = false;
    };
  }, []);

  // ==========================================================================
  // 2. Загрузка слотов при смене дня (с защитой от гонок race condition)
  // ==========================================================================
  useEffect(() => {
    if (!selectedDay || currentMonth === null || currentYear === null) {
      setSlots([]);
      return;
    }

    let isCurrent = true;

    async function loadSlots() {
      try {
        setLoadingSlots(true);
        setErrorSlots(null);

        const response = await fetchSlots({
          day: selectedDay,
          month: currentMonth,
          year: currentYear,
        });

        // Защита от race condition: проверяем, что ответ соответствует текущей выбранной дате
        if (
          isCurrent &&
          response.date &&
          response.date.day === selectedDay &&
          response.date.month === currentMonth &&
          response.date.year === currentYear
        ) {
          setSlots(response.slots || []);
        }
      } catch (err) {
        if (isCurrent) {
          setErrorSlots(err.message || "Ошибка загрузки слотов времени");
        }
      } finally {
        if (isCurrent) {
          setLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      isCurrent = false;
    };
  }, [selectedDay, currentMonth, currentYear]);

  // ==========================================================================
  // Обработчики пользовательских действий
  // ==========================================================================

  // Клик по дню в календаре: меняем дату, сбрасываем время (слоты подгрузит useEffect)
  function handleDayClick(day) {
    setSelectedDay(day);
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedTime(null);
  }

  // Клик по слоту времени
  function handleTimeClick(time) {
    setSelectedTime(time);
  }

  // Перелистывание месяца назад (сбрасываем день, время и слоты для согласованности)
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

  // Перелистывание месяца вперед (сбрасываем день, время и слоты для согласованности)
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

  // Кнопка продолжения записи
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

  // Сценарий 1: Первичная загрузка «сегодня»
  if (loadingToday) {
    return (
      <main className="main-content">
        <div className="container">
          <LoadingState message="Загрузка..." />
        </div>
      </main>
    );
  }

  // Сценарий 3: Ошибка при загрузке «сегодня»
  if (errorToday) {
    return (
      <main className="main-content">
        <div className="container">
          <EmptyState message={`Ошибка: ${errorToday}`} />
        </div>
      </main>
    );
  }

  // Основной рендер при успешной загрузке today
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
            loading={loadingSlots}
            error={errorSlots}
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

import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";

function Calendar({
  year,
  month,
  selectedDay,
  selectedMonth,
  selectedYear,
  today,
  onDayClick,
  onPrevMonth,
  onNextMonth,
}) {
  return (
    <section className="calendar-card" aria-label="Выбор даты записи">
      <CalendarHeader
        year={year}
        month={month}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      <CalendarGrid
        year={year}
        month={month}
        selectedDay={selectedDay}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        today={today}
        onDayClick={onDayClick}
      />
    </section>
  );
}

export default Calendar;

import { buildCalendarGrid, isDateSelectable } from "../../data/date";

function CalendarGrid({
  year,
  month,
  selectedDay,
  selectedMonth,
  selectedYear,
  today,
  onDayClick,
}) {
  const weeks = buildCalendarGrid(year, month);

  return (
    <>
      {/* Заголовки дней недели */}
      <div className="calendar-weekdays" aria-hidden="true">
        <span className="calendar-weekday">Пн</span>
        <span className="calendar-weekday">Вт</span>
        <span className="calendar-weekday">Ср</span>
        <span className="calendar-weekday">Чт</span>
        <span className="calendar-weekday">Пт</span>
        <span className="calendar-weekday">Сб</span>
        <span className="calendar-weekday">Вс</span>
      </div>

      {/* Сетка чисел месяца */}
      <div className="calendar-days-grid" role="grid" aria-label="Дни месяца">
        {weeks.map(function (week, weekIndex) {
          return (
            <div className="week-row" key={weekIndex}>
              {week.map(function (cell, cellIndex) {
                let classes = "day-cell";
                const isSelectable = !cell.otherMonth && isDateSelectable(cell.day, month, year, today);

                if (cell.otherMonth) {
                  classes += " other-month";
                } else {
                  const isToday =
                    cell.day === today.day &&
                    month === today.month &&
                    year === today.year;
                  if (isToday) classes += " today";

                  const isSelected =
                    selectedDay !== null &&
                    cell.day === selectedDay &&
                    (selectedMonth === undefined || month === selectedMonth) &&
                    (selectedYear === undefined || year === selectedYear);
                  if (isSelected) classes += " selected";

                  if (!isSelectable) {
                    classes += " disabled";
                  }
                }

                function handleClick() {
                  if (isSelectable) {
                    onDayClick(cell.day);
                  }
                }

                return (
                  <button
                    type="button"
                    className={classes}
                    key={cellIndex}
                    disabled={!isSelectable}
                    data-day={cell.day}
                    onClick={handleClick}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default CalendarGrid;

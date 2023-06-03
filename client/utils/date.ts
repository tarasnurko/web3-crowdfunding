export const getMinMaxDeadline = () => {
  const currentDate = new Date();

  const minDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() + 1
  );

  const maxDate = new Date(
    minDate.getFullYear(),
    minDate.getMonth(),
    currentDate.getDate() + 30
  );

  const minYear = minDate.getFullYear();
  const minMonth = String(minDate.getMonth() + 1).padStart(2, "0");
  const minDay = String(minDate.getDate()).padStart(2, "0");

  const maxYear = maxDate.getFullYear();
  const maxMonth = String(maxDate.getMonth() + 1).padStart(2, "0");
  const maxDay = String(maxDate.getDate()).padStart(2, "0");

  const minDateString = `${minYear}-${minMonth}-${minDay}`;
  const maxDateString = `${maxYear}-${maxMonth}-${maxDay}`;

  return {
    minDate,
    maxDate,
    minDateString,
    maxDateString,
  };
};

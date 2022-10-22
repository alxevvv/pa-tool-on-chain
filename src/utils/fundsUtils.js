import dayjs from "dayjs";
import camelToWords from "./camelToWords";

export function fundStatus(fund) {
  const now = dayjs();
  const startDate = dayjs(fund.startDate);
  const endDate = dayjs(fund.endDate);

  if (endDate.isBefore(now)) {
    return "past";
  } else if (startDate.isBefore(now) && endDate.isAfter(now)) {
    return "current";
  } else {
    return "upcoming";
  }
}

export function fundCurrentStages(fund) {
  const now = dayjs();
  const actions = [];

  const rangeNames = Object.keys(fund)
    .filter((key) => key.endsWith("StartDate"))
    .map((key) => key.replace("StartDate", ""));

  rangeNames.forEach((rangeName) => {
    const startDate = dayjs(fund[rangeName + "StartDate"]);
    const endDate = dayjs(fund[rangeName + "EndDate"]);

    if (startDate.isBefore(now) && endDate.isAfter(now)) {
      actions.push(camelToWords(rangeName));
    }
  });

  return actions;
}

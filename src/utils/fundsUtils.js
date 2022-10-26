import dayjs from "dayjs";
import camelToWords from "./camelToWords";

export function fundActivityPeriod(fund) {
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
  const stages = [];

  const stageNames = Object.keys(fund)
    .filter((key) => !!fund[key] && key.endsWith("StartDate"))
    .map((key) => key.replace("StartDate", ""));

  stageNames.forEach((stageName) => {
    const startDate = dayjs(fund[stageName + "StartDate"]);
    const endDate = dayjs(fund[stageName + "EndDate"]);

    if (startDate.isBefore(now) && endDate.isAfter(now)) {
      stages.push(camelToWords(stageName));
    }
  });

  return stages;
}

export function fundQaStageIsDisabled(fund) {
  return !fund.communityQualityAssuranceStage;
}

export function fundPaRegistrationIsOpened(fund) {
  const now = dayjs();
  const startDate = dayjs(fund.qaRegistrationStartDate);
  const endDate = dayjs(fund.qaRegistrationEndDate);
  return startDate.isBefore(now) && endDate.isAfter(now);
}

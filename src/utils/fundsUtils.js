import dayjs from "dayjs";
import camelToWords from "./camelToWords";

export function isCurrentStage(fund, stageName) {
  const now = dayjs();
  const startDate = dayjs(fund[`${stageName}StartDate`]);
  const endDate = dayjs(fund[`${stageName}EndDate`]);
  return startDate.isBefore(now) && endDate.isAfter(now);
}

export function isCurrentOrUpcomingStage(fund, stageName) {
  const now = dayjs();
  const endDate = dayjs(fund[`${stageName}EndDate`]);
  return endDate.isAfter(now);
}

export function isUpcomingStage(fund, stageName) {
  const now = dayjs();
  const startDate = dayjs(fund[`${stageName}StartDate`]);
  return startDate.isAfter(now);
}

export function isPastStage(fund, stageName) {
  const now = dayjs();
  const endDate = dayjs(fund[`${stageName}EndDate`]);
  return endDate.isBefore(now);
}

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
  const stages = [];

  const stageNames = Object.keys(fund)
    .filter((key) => !!fund[key] && key.endsWith("StartDate"))
    .map((key) => key.replace("StartDate", ""));

  stageNames.forEach((stageName) => {
    if (isCurrentStage(fund, stageName)) {
      stages.push(camelToWords(stageName));
    }
  });

  return stages;
}

export function fundQaStageIsDisabled(fund) {
  return !fund.communityQualityAssuranceStage;
}

export function fundPaRegistrationIsOpened(fund) {
  return !fundQaStageIsDisabled(fund) && isCurrentStage(fund, "qaRegistration");
}

export function assessmentCreationIsOpened(fund) {
  return !fundQaStageIsDisabled(fund) && isCurrentOrUpcomingStage(fund, "assessmentSubmission");
}

export function assessmentSubmissionIsOpened(fund) {
  return !fundQaStageIsDisabled(fund) && isCurrentStage(fund, "assessmentSubmission");
}

export function assessmentPublishingIsOpened(fund) {
  return !fundQaStageIsDisabled(fund) && isCurrentStage(fund, "assessmentPublishing");
}

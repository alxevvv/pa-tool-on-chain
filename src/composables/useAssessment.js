import dayjs from "dayjs";
import { computed } from "vue";
import { useProposalsStore } from "@/stores/proposalsStore";
import { useAssessmentsStore } from "@/stores/assessmentsStore";

export default function useAssessment(proposalId) {
  const proposalsStore = useProposalsStore();
  const assessmentsStore = useAssessmentsStore();

  const proposal = computed(() => proposalsStore.getById(proposalId));
  const assessment = computed(() => assessmentsStore.getByProposalId(proposalId));

  const completion = computed(() => {
    const fieldsNames = ["rate1", "rate2", "rate3", "note1", "note2", "note3"];
    const filledFieldsCount = fieldsNames.reduce((acc, cur) => (assessment.value[cur] ? acc + 1 : acc), 0);
    return Math.floor((100 * filledFieldsCount) / fieldsNames.length);
  });

  const isCompleted = computed(() => completion.value === 100);

  const savedAtVerbose = computed(() => {
    if (!assessment.value.lastUpdate) {
      return "Not saved";
    } else {
      const diff = dayjs(assessment.value.lastUpdate).unix() - dayjs.utc().unix();
      return `Saved ${dayjs.duration(diff, "seconds").humanize(true)}`;
    }
  });

  return {
    proposalId,

    proposal,
    assessment,

    completion,
    isCompleted,
    savedAtVerbose,
  };
}

import { createWebHashHistory, createRouter } from "vue-router";
import PageHome from "@/views/PageHome.vue";
import PagePAStatus from "@/views/PagePAStatus.vue";
import PageFunds from "@/views/PageFunds.vue";
import PageFundGenesis from "@/views/PageFundGenesis.vue";
import PageProposal from "@/views/PageProposal.vue";
import PageProposalsList from "@/views/PageProposalsList.vue";
import PageAssessmentsMy from "@/views/PageAssessmentsMy.vue";
import PageAssessmentsExample from "@/views/PageAssessmentsExample.vue";
import PageAssessmentSubmissions from "@/views/PageAssessmentSubmissions.vue";
import PageAssessmentPublications from "@/views/PageAssessmentPublications.vue";
import PageNotFound from "@/views/PageNotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: PageHome,
  },

  {
    path: "/pa-status",
    name: "PAStatus",
    component: PagePAStatus,
  },
  {
    path: "/funds",
    name: "Funds",
    component: PageFunds,
  },
  {
    path: "/fund/:hash",
    name: "FundGenesis",
    component: PageFundGenesis,
  },

  {
    path: "/proposals",
    name: "Proposals",
    component: PageProposalsList,
  },
  {
    path: "/proposal/:id",
    name: "Proposal",
    component: PageProposal,
  },

  {
    path: "/assessments/my",
    name: "AssessmentsMy",
    component: PageAssessmentsMy,
  },
  {
    path: "/assessments/submissions",
    name: "AssessmentSubmissions",
    component: PageAssessmentSubmissions,
  },
  {
    path: "/assessments/publications",
    name: "AssessmentPublications",
    component: PageAssessmentPublications,
  },
  {
    path: "/assessments/example",
    name: "AssessmentsExample",
    component: PageAssessmentsExample,
  },

  {
    path: "/:catchAll(.*)",
    component: PageNotFound,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;

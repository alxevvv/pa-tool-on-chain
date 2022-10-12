<template>
  <div class="your-assessments">
    <div class="content">
      <p class="title">
        {{ headerText }}
      </p>
      <!-- <p class="subtitle">
        {{subheaderText}} <span class="is-size-6">[Including blanks]</span>
      </p>
      <b-message>
      This page collects all the proposals that you assessed <b>within the pa-tool</b> and could be used to keep your assessments organized.<br /><br />
        Remember that you have to <b>copy-paste</b> each assessment in <b>IdeaScale</b> to officially submit them.<br /><br />
        This tool uses localStorage and cookies to store the progress of your work.<br />
        If you're using a setup where cookies are cleared at every browser launch, be careful because you may lose your work! You should export (download) the file, and re-import it every time or add a exception to your browser's settings.<br />
      </b-message> -->
    </div>
    <div class="content" v-if="assessedProposals.length === 0">
      <p class="subtitle">
        Import a backup
      </p>
      <b-field class="file is-primary">
        <b-upload v-on:input="readFile" drag-drop expanded accept=".csv">
          <section class="section">
            <div class="content has-text-centered">
              <p>
                <b-icon icon="upload" size="is-large" v-if="!csv"></b-icon>
              </p>
              <p>Drop your file here or click to upload</p>
            </div>
          </section>
        </b-upload>
      </b-field>
    </div>
    <div class="content" v-else>
      <b-table
        ref="assessmentsTable"
        :data="tableData"
        checkable
        :checked-rows.sync="checkedRows"
        :is-row-checkable="row => row.completion === 100"
      >
        <b-table-column label="Title" v-slot="props">
          <b-button tag="router-link" type="is-ghost" :to="`/proposal/${props.row.id}`">
            {{ props.row.title }}
          </b-button>
        </b-table-column>
        <b-table-column label="Completion" v-slot="props">
          <b-progress
            type="is-info"
            class="complete-progress mt-2"
            :value="props.row.completion"
            size="is-small"
            show-value
          >
          </b-progress>
        </b-table-column>
        <b-table-column label="Submitted" v-slot="props">
          <b-tag :type="props.row.submitted ? 'is-success' : 'is-danger'">
            {{ props.row.submitted ? "Yes" : "No" }}
          </b-tag>
        </b-table-column>
        <b-table-column label="Published" v-slot="props">
          <b-tag :type="props.row.published ? 'is-success' : 'is-danger'">
            {{ props.row.published ? "Yes" : "No" }}
          </b-tag>
        </b-table-column>
      </b-table>
    </div>
    <div class="content buttons">
      <b-button
        icon-left="upload"
        type="is-primary"
        :disabled="!checkedRows.length"
        :loading="$store.state.wallet.isSendingTx"
        @click="submitCheckedAssessments"
        >Submit checked</b-button
      >
      <b-button
        icon-left="publish"
        type="is-primary"
        :disabled="!unpublishedAssessments.length"
        :loading="$store.state.wallet.isSendingTx"
        @click="publishAssessments"
        >Publish</b-button
      >
    </div>
    <div class="content">
      <b-message class="buttons" v-if="assessedProposals.length > 0">
        <b-button icon-left="download" type="is-primary is-light" @click="exportAssessments"
          >Export assessments</b-button
        >
        <b-button icon-left="delete" type="is-danger is-light" @click="confirmClear"
          >Clear local database</b-button
        >
      </b-message>
    </div>
  </div>
</template>

<script>
import sjcl from "sjcl";
import { mapGetters } from "vuex";
import proposals from "@/assets/data/f9/proposals.json";
import csvHeaders from "@/assets/data/import-csv-headers.json";

import { assessmentsSubmissionList } from "@/cardanoDB/assessmentsSubmissionList";
import { txsOutputsList } from "@/cardanoDB/txsOutputsList";
import uploadToIPFS from "@/ipfs/addFiles";
import downloadCsv from "@/utils/export-csv";
import pick from "@/utils/pick";

function getAssessmentCompletion(proposal) {
  const reducer = (previousValue, currentValue) => previousValue + currentValue;
  let texts = ["note_1", "note_2", "note_3"].map(el => (proposal[el].length > 0 ? 1 : 0)).reduce(reducer);
  let ratings = ["rate_1", "rate_2", "rate_3"].map(el => (proposal[el] > 0 ? 1 : 0)).reduce(reducer);
  return parseInt((100 * (texts + ratings)) / 6);
}

export default {
  name: "Assessed",
  components: {},
  data() {
    return {
      proposals: proposals,
      assessed: [],
      csv: null,
      csvHeaders: csvHeaders,
      goalAssPerProposal: 5,
      checkedRows: [],
    };
  },
  computed: {
    ...mapGetters("assessments", ["ids", "indexed", "assessedCount"]),
    ...mapGetters("filters", ["totalCount", "totalProposals"]),
    assessedProposals() {
      return this.proposals
        .filter(p => this.ids.indexOf(p.id) > -1)
        .map(p => {
          return { ...p, ...this.indexed[p.id] };
        });
    },
    headerText() {
      return `My Assessments (${this.assessedCount}/${this.totalProposals})`;
    },
    subheaderText() {
      return `Total assessments submitted in IdeaScale (${this.totalCount}/${this.proposals.length *
        this.goalAssPerProposal})`;
    },
    tableData() {
      return this.assessedProposals.map(proposal => {
        return {
          id: proposal.id,
          title: proposal.title,
          completion: getAssessmentCompletion(proposal),
          submitted: this.$store.state.assessments.assessedSubmittedProposalsId.includes(proposal.id),
          published: this.$store.state.assessments.assessedPublishedProposalsId.includes(proposal.id),
        };
      });
    },
    unpublishedAssessments() {
      const submittedAssessments = this.$store.state.assessments.assessedSubmittedProposalsId;
      const publishedAssessments = this.$store.state.assessments.assessedPublishedProposalsId;
      return submittedAssessments.filter(proposalId => !publishedAssessments.includes(proposalId));
    },
  },
  methods: {
    importCsv() {
      if (this.csv) {
        if (this.csv.data) {
          this.$store.commit("assessments/setAssessments", this.csv.data);
        }
      }
    },
    readFile(file) {
      this.$papa.parse(file, {
        header: true,
        complete: this.onComplete,
        transform: this.transformData,
        transformHeader: this.transformHeader,
        skipEmptyLines: true,
      });
    },
    onComplete(results) {
      results.data = results.data.map(el => {
        return pick(el, Object.keys(this.csvHeaders));
      });
      this.csv = results;
      this.importCsv();
    },
    transformData(value, col) {
      if (this.csvHeaders[col]) {
        if (this.csvHeaders[col].type === "integer") {
          return parseInt(value);
        }
        if (this.csvHeaders[col].type === "boolean") {
          return parseInt(value) > 0;
        }
        if (this.csvHeaders[col].type === "array") {
          return value.split(",");
        }
        if (this.csvHeaders[col].type === "string") {
          return value;
        }
      } else {
        return value;
      }
    },
    transformHeader(header) {
      const newHeaders = {};
      Object.keys(this.csvHeaders).forEach(h => {
        newHeaders[this.csvHeaders[h].label] = h;
      });
      if (newHeaders[header]) {
        return newHeaders[header];
      }
      return header;
    },
    clear() {
      this.$store.commit("assessments/resetState");
    },
    confirmClear() {
      this.$buefy.dialog.confirm({
        title: "Clear database",
        message:
          "Are you sure you want to <b>clear</b> the local database? This action cannot be undone and you will lose your work.",
        confirmText: "Clear Database",
        type: "is-danger",
        hasIcon: true,
        onConfirm: () => {
          this.clear();
          this.$buefy.notification.open({
            message: "Database cleared!",
            type: "is-primary",
            position: "is-bottom-right",
          });
        },
      });
    },
    exportAssessments() {
      const localAssessments = this.assessedProposals;
      downloadCsv(localAssessments);
    },
    async submitCheckedAssessments() {
      // filter out already submitted assessments
      const rowsToSubmit = this.checkedRows.filter(row => {
        return !this.$store.state.assessments.assessedSubmittedProposalsId.includes(row.id);
      });

      // return if there are no assessments to submit
      if (!rowsToSubmit.length) {
        this.$buefy.notification.open({
          message: "All selected assessments have already been submitted",
          type: "is-warning",
          position: "is-top",
          duration: 4000,
        });
        return;
      }

      // create assessments submission array
      const submittingAssessments = rowsToSubmit.map(row => {
        const assessment = this.indexed[row.id];
        return {
          proposal_id: assessment.id,
          note_1: assessment.note_1,
          note_2: assessment.note_2,
          note_3: assessment.note_3,
          rate_1: assessment.rate_1,
          rate_2: assessment.rate_2,
          rate_3: assessment.rate_3,
        };
      });

      // encode assessments submission array
      const submittingAssessmentsString = JSON.stringify(submittingAssessments);
      const submittingAssessmentsBitArray = sjcl.hash.sha256.hash(submittingAssessmentsString);
      const submittingAssessmentsHash = sjcl.codec.hex.fromBits(submittingAssessmentsBitArray);
      const submittingAssessmentsProposalsId = submittingAssessments.map(({ proposal_id }) => proposal_id);

      // create submission payload
      const submissionPayload = {
        action: "assessmentsSubmission",
        fundHash: this.$store.state.funds.selectedFund.json.fundHash,
        hashAlg: "sha256",
        assessmentsHash: submittingAssessmentsHash,
        proposalsId: submittingAssessmentsProposalsId,
      };

      try {
        // send transaction
        const txSendingResult = await this.$store.dispatch("wallet/sendTxMetadata", {
          metadataKey: process.env.VUE_APP_METADATA_KEY,
          metadataValue: submissionPayload,
        });

        // uncheck table rows
        this.checkedRows = [];

        // add ids of assessed proposals
        this.$store.commit("assessments/addAssessedSubmittedProposalsId", submittingAssessmentsProposalsId);

        // show success notification
        this.$buefy.notification.open({
          message: `Transaction sent. Hash: ${txSendingResult}`,
          type: "is-success",
          position: "is-top",
          duration: 7500,
        });
      } catch (err) {
        // show notification on error
        this.$buefy.notification.open({
          message: `Transaction sending error: ${err}`,
          type: "is-danger",
          position: "is-top",
          duration: 7500,
        });
      }
    },
    async publishAssessments() {
      const unpublishedAssessments = this.unpublishedAssessments;

      const walletStakeAddress = this.$store.state.wallet.walletStakeAddressBech32;
      const fundHash = this.$store.state.funds.selectedFund.json.fundHash;

      const assessmentsSubmissions = await assessmentsSubmissionList(fundHash);
      const assessmentsSubmissionsTxsId = assessmentsSubmissions.map(({ tx_id }) => tx_id);

      const txsOutputs = await txsOutputsList(assessmentsSubmissionsTxsId);
      const myTxIds = Array.from(
        new Set(
          txsOutputs.reduce((acc, cur) => {
            if (cur.stake_address.view === walletStakeAddress) {
              acc.push(cur.tx_id);
            }
            return acc;
          }, []),
        ),
      );

      const myAssessmentsSubmissions = assessmentsSubmissions.filter(({ tx_id }) => {
        return myTxIds.includes(tx_id);
      });

      const assessedAndSubmittedProposalGroups = myAssessmentsSubmissions.reduce((acc, cur) => {
        if (cur.json.proposalsId.every(id => unpublishedAssessments.includes(id))) {
          acc.push(cur.json);
        }
        return acc;
      }, []);

      for (const submitToPublish of assessedAndSubmittedProposalGroups) {
        const assessments = submitToPublish.proposalsId.map(id => {
          const assessment = this.indexed[id];
          return {
            proposal_id: assessment.id,
            note_1: assessment.note_1,
            note_2: assessment.note_2,
            note_3: assessment.note_3,
            rate_1: assessment.rate_1,
            rate_2: assessment.rate_2,
            rate_3: assessment.rate_3,
          };
        });

        const assessmentsFiles = assessments.map(json => {
          const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
          return new File([blob], `${json.proposal_id}.json`);
        });

        const publicationCID = await uploadToIPFS(assessmentsFiles, true);

        const publicationPayload = {
          action: "assessmentsPublication",
          fundHash: submitToPublish.fundHash,
          proposalsId: submitToPublish.proposalsId,
          assessmentsHash: submitToPublish.assessmentsHash,
          assessmentsCID: publicationCID,
        };

        try {
          // send transaction
          const txSendingResult = await this.$store.dispatch("wallet/sendTxMetadata", {
            metadataKey: process.env.VUE_APP_METADATA_KEY,
            metadataValue: publicationPayload,
          });

          // add ids of assessed proposals
          this.$store.commit("assessments/addAssessedPublishedProposalsId", publicationPayload.proposalsId);

          // show success notification
          this.$buefy.notification.open({
            message: `Transaction sent. Hash: ${txSendingResult}`,
            type: "is-success",
            position: "is-top",
            duration: 7500,
          });
        } catch (err) {
          // show notification on error
          this.$buefy.notification.open({
            message: `Transaction sending error: ${err}`,
            type: "is-danger",
            position: "is-top",
            duration: 7500,
          });
        }
      }
    },
  },
  mounted() {},
};
</script>

<style scoped lang="scss"></style>

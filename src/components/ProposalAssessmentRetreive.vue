<template>
  <div>
    <h5 class="title is-5">
      Assessment
    </h5>
    <div v-if="isLoading">
      <div class="mb-4 columns is-multiline">
        <div class="column is-12"><b-skeleton animated width="100px"></b-skeleton></div>
        <div class="column is-2">
          <b-skeleton animated height="60px"></b-skeleton>
        </div>
        <div class="column is-10">
          <b-skeleton animated height="160px"></b-skeleton>
        </div>
      </div>
      <div class="mb-4 columns is-multiline">
        <div class="column is-2">
          <b-skeleton animated height="60px"></b-skeleton>
        </div>
        <div class="column is-10">
          <b-skeleton animated height="160px"></b-skeleton>
        </div>
      </div>
      <div class="mb-4 columns is-multiline">
        <div class="column is-2">
          <b-skeleton animated height="60px"></b-skeleton>
        </div>
        <div class="column is-10">
          <b-skeleton animated height="160px"></b-skeleton>
        </div>
      </div>
      <b-skeleton animated height="40px" width="235px"></b-skeleton>
    </div>
    <div v-if="assessment">
      <div class="criterium mb-4 columns is-multiline">
        <div class="column is-12">Rating: {{ rating }}</div>
        <div class="column is-2">
          <b-field label="Rating for Impact:">
            <b-rate disabled v-model="assessment.rate_1"></b-rate>
          </b-field>
        </div>
        <div class="column is-10 is-relative">
          <b-field label="Rationale for Impact:">
            <b-input disabled type="textarea" v-model="assessment.note_1"></b-input>
          </b-field>
        </div>
      </div>
      <div class="criterium mb-4 columns is-multiline">
        <div class="column is-2">
          <b-field label="Rating for Feasibility:">
            <b-rate disabled v-model="assessment.rate_2"></b-rate>
          </b-field>
        </div>
        <div class="column is-10 is-relative">
          <b-field label="Rationale for Feasibility:">
            <b-input disabled type="textarea" v-model="assessment.note_2"></b-input>
          </b-field>
        </div>
      </div>
      <div class="criterium mb-4 columns is-multiline">
        <div class="column is-2">
          <b-field label="Rating for Clarity/Auditability:">
            <b-rate disabled v-model="assessment.rate_3"></b-rate>
          </b-field>
        </div>
        <div class="column is-10 is-relative">
          <b-field label="Rationale for Clarity/Auditability:">
            <b-input disabled type="textarea" v-model="assessment.note_3"></b-input>
          </b-field>
        </div>
      </div>
      <b-button
        tag="a"
        type="is-info"
        target="_blank"
        :href="`https://ipfs.io/ipfs/${ipfsCid}`"
        icon-left="open-in-new"
        >Open assessment at IPFS</b-button
      >
    </div>
  </div>
</template>

<script>
import retreiveFromIPFS from "@/ipfs/retreiveFile";

export default {
  name: "ProposalAssessmentRetreive",

  props: {
    proposalId: {
      type: Number,
      required: true,
    },

    ipfsCid: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      assessment: null,
      isLoading: true,
      error: "",
    };
  },

  computed: {
    rating() {
      if (!this.assessment) {
        return null;
      } else {
        return ((this.assessment.rate_1 + this.assessment.rate_2 + this.assessment.rate_3) / 3).toPrecision(
          3,
        );
      }
    },
  },

  methods: {
    async load() {
      try {
        const response = await retreiveFromIPFS(this.ipfsCid);
        const json = await response.json();
        this.assessment = json.find(({ proposal_id }) => proposal_id === this.proposalId) || null;
      } catch (err) {
        this.error = err.toString();
      } finally {
        this.isLoading = false;
      }
    },
  },

  mounted() {
    this.load();
  },
};
</script>

<template>
  <div>
    <h5 class="title is-5">
      Review
    </h5>
    <div v-if="isLoading">
      <b-field>
        <b-skeleton animated height="72px" width="142px"></b-skeleton>
      </b-field>
      <b-field>
        <b-skeleton animated height="160px" width="100%"></b-skeleton>
      </b-field>
      <br />
      <b-skeleton animated height="40px" width="235px"></b-skeleton>
    </div>
    <div v-if="review">
      <b-field label="Categorization">
        <b-select placeholder="Select a Criteria" v-model="categorization">
          <option v-for="option in categorizationOptions" :value="option.id" :key="option.id" disabled>
            {{ option.title }}
          </option>
        </b-select>
      </b-field>
      <b-field label="Feedback (optional)">
        <b-input type="textarea" v-model="feedback" disabled></b-input>
      </b-field>
      <br />
      <b-button
        tag="a"
        type="is-info"
        target="_blank"
        :href="`https://ipfs.io/ipfs/${ipfsCid}`"
        icon-left="open-in-new"
        >Open review at IPFS</b-button
      >
    </div>
  </div>
</template>

<script>
import retreiveFromIPFS from "@/ipfs/retreiveFile";

export default {
  name: "AssessmentReviewRetreive",

  props: {
    assessmentId: {
      type: String,
      required: true,
    },

    ipfsCid: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      review: null,
      isLoading: true,
      error: "",
      categorizationOptions: [
        { id: 1, title: "Excellent" },
        { id: 2, title: "Good" },
        { id: 3, title: "Filtered Out" },
      ],
    };
  },

  computed: {
    categorization() {
      return this.review.categorization;
    },

    feedback() {
      return this.review.feedback;
    },
  },

  methods: {
    async load() {
      try {
        const response = await retreiveFromIPFS(this.ipfsCid);
        const json = await response.json();
        this.review = json.find(({ assessmentId }) => assessmentId === this.assessmentId) || null;
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

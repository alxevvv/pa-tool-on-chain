<template>
  <div class="section container">
    <h1 class="title">
      My Assessments
    </h1>
  </div>
</template>

<script setup>
import { useAssessmentsStore } from "@/stores/assessmentsStore";

const assessmentsStore = useAssessmentsStore();
</script>

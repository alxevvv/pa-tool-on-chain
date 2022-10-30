<template>
  <div class="criterium mb-4 columns is-multiline">
    <div class="column is-12">
      <h5 class="title is-5">
        {{ props.criterium.question }}
      </h5>
    </div>

    <div class="column is-2">
      <div class="field">
        <label class="label">Rating for {{ props.criterium.title }}</label>
        <div class="control">
          <label class="radio">
            <input
              type="radio"
              :name="`rate${props.criterium.c_id}`"
            >
            1
          </label>
          <label class="radio">
            <input
              type="radio"
              :name="`rate${props.criterium.c_id}`"
            >
            2
          </label>
          <label class="radio">
            <input
              type="radio"
              :name="`rate${props.criterium.c_id}`"
            >
            3
          </label>
          <label class="radio">
            <input
              type="radio"
              :name="`rate${props.criterium.c_id}`"
            >
            4
          </label>
          <label class="radio">
            <input
              type="radio"
              :name="`rate${props.criterium.c_id}`"
            >
            5
          </label>
        </div>
      </div>
    </div>

    <div class="column is-10">
      <div class="field">
        <label class="label">Rationale for {{ props.criterium.title }}</label>
        <div class="control">
          <textarea class="textarea" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  criterium: {
    type: Object,
    required: true,
  },
});
</script>

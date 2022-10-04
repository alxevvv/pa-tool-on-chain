<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Fund Genesis JSON</p>
      <button type="button" class="delete" @click="$emit('close')" />
    </header>
    <section class="modal-card-body">
      <pre>{{ fund }}</pre>
    </section>
    <footer class="modal-card-foot">
      <b-button label="OK" @click="$emit('close')" />
    </footer>
  </div>
</template>

<script>
export default {
  computed: {
    fund() {
      return this.$store.state.funds.selectedFund;
    },
  },
};
</script>

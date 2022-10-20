<template>
  <div :class="containerClasses">
    <div
      class="modal-background"
      @click="$emit('close')"
    />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          {{ props.title }}
        </p>
        <button
          class="delete"
          aria-label="close"
          @click="$emit('close')"
        />
      </header>
      <section class="modal-card-body">
        <slot />
      </section>
      <footer class="modal-card-foot">
        <slot name="footer">
          <button
            class="button is-primary"
            @click="$emit('close')"
          >
            OK
          </button>
        </slot>
      </footer>
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      @click="$emit('close')"
    />
  </div>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "Modal",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close"]);

const containerClasses = computed(() => {
  const classes = ["modal"];
  if (props.isActive) {
    classes.push("is-active");
  }
  return classes;
});

const htmlTag = document.querySelector("html");

function escListener({ key }) {
  if (key === "Escape") {
    emit("close");
  }
}

watch(() => props.isActive, (isActive) => {
  if (isActive) {
    htmlTag.classList.add("is-clipped");
    document.addEventListener("keyup", escListener);
  } else {
    htmlTag.classList.remove("is-clipped");
    document.removeEventListener("keyup", escListener);
  }
});
</script>

<template>
  <div class="b-rate field">
    <label class="label">{{ props.labelText }}</label>
    <div class="control">
      <span
        v-for="(_, i) in Array(props.maxValue)"
        :key="i"
        :class="iconClasses"
        @mouseenter="displayedValue = i + 1"
        @mouseleave="displayedValue = props.modelValue"
        @click="setValue(i + 1)"
      >
        <i
          :class="displayedValue <= i ? props.iconEmpty : props.iconFilled"
        />
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  maxValue: {
    type: Number,
    default: 5,
  },
  labelText: {
    type: String,
    default: "",
  },
  iconClass: {
    type: String,
    default: "has-text-warning",
  },
  iconEmpty: {
    type: String,
    default: "far fa-star",
  },
  iconFilled: {
    type: String,
    default: "fas fa-star",
  },
  modelValue: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:modelValue"]);

const iconClasses = computed(() => {
  const classes = ["icon"];
  if (props.iconClass) {
    classes.push(props.iconClass);
  }
  return classes;
});

const displayedValue = ref(props.modelValue);

function setValue(value) {
  if (props.modelValue === value) {
    emit("update:modelValue", 0);
  } else {
    emit("update:modelValue", value);
  }
}
</script>

<style scoped>
.icon {
  cursor: pointer;
}
</style>

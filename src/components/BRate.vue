<template>
  <div class="b-rate field">
    <label class="label">{{ props.labelText }}</label>
    <div class="control">
      <span
        v-for="(_, i) in Array(props.maxValue)"
        :key="i"
        :class="iconClasses"
        @mouseenter="onMouseEnter(i)"
        @mouseleave="onMouseLeave()"
        @click="setValue(i)"
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
  readonly: {
    type: Boolean,
    default: false,
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
  if (props.readonly) {
    classes.push("read-only");
  }
  return classes;
});

const displayedValue = ref(props.modelValue);

function onMouseEnter(i) {
  if (!props.readonly) {
    displayedValue.value = i + 1;
  }
}

function onMouseLeave() {
  if (!props.readonly) {
    displayedValue.value = props.modelValue;
  }
}

function setValue(i) {
  if (!props.readonly) {
    if (props.modelValue === i + 1) {
      emit("update:modelValue", 0);
    } else {
      emit("update:modelValue", i + 1);
    }
  }
}
</script>

<style scoped>
.icon:not(.read-only) {
  cursor: pointer;
}
</style>

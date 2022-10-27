<template>
  <div :class="dropdownClasses">
    <div class="control is-expanded has-icons-right">
      <div
        ref="inputRef"
        :value="modelValue"
        :class="inputClasses"
        @click="showDropdown"
      >
        <span
          v-for="item in selectedItems"
          :key="item.id"
          class="tag is-primary mr-2"
        >{{ item.title }} <button
          class="delete is-small"
          @click="removeItem(item.id)"
        /></span>
        <input
          v-model="filterItems"
          type="text"
          class="filter-items-input"
          @keydown="onFilterItemsKeydown"
        >
      </div>
      <span
        v-if="props.icon"
        class="icon is-small is-right"
      ><i :class="props.icon" /></span>
    </div>
    <div
      id="dropdown-menu"
      class="dropdown-menu"
      role="menu"
    >
      <div class="dropdown-content">
        <a
          v-for="item in filteredItems"
          :key="item.id"
          ref="dropdownItemRefs"
          :class="`dropdown-item${selectedItemIds.includes(item.id) ? ' is-active' : ''}`"
          @click="addItem(item.id)"
        >{{ item.title }}</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  icon: {
    type: String,
    default: "",
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const isDropdownActive = ref(false);
const selectedItems = ref([]);
const filterItems = ref("");

const inputRef = ref(null);
const dropdownItemRefs = ref([]);

const dropdownClasses = computed(() => {
  const classes = ["dropdown"];
  if (isDropdownActive.value) {
    classes.push("is-active");
  }
  return classes;
});

const inputClasses = computed(() => {
  const classes = ["input"];
  if (isDropdownActive.value) {
    classes.push("is-focused");
  }
  return classes;
});

const selectedItemIds = computed(() => selectedItems.value.map(({ id }) => id));

const filteredItems = computed(() => {
  if (!filterItems.value) {
    return props.items;
  } else {
    return props.items.filter(({ title }) => title.toLowerCase().includes(filterItems.value));
  }
});

function showDropdown() {
  isDropdownActive.value = true;
  document.addEventListener("click", hideDropdown);
}

function hideDropdown(e) {
  if (
    !!e && (
      e.target === inputRef.value
      || inputRef.value?.contains(e.target)
      || dropdownItemRefs.value.find(item => e.target === item)
    )
  ) {
    return;
  }
  document.removeEventListener("click", hideDropdown);
  isDropdownActive.value = false;
}

function addItem(id) {
  if (selectedItemIds.value.includes(id)) {
    return;
  }
  const itemToAdd = props.items.find(item => item.id === id);
  if (itemToAdd) {
    selectedItems.value.push(itemToAdd);
  }
}

function removeItem(id) {
  const indexToRemove = selectedItems.value.findIndex(item => item.id === id);
  if (indexToRemove !== -1) {
    selectedItems.value.splice(indexToRemove, 1);
  }
}

function onFilterItemsKeydown(e) {
  if (e.key === "Escape") {
    hideDropdown();
  } else if (e.key === "Backspace" && filterItems.value === "" && selectedItems.value.length) {
    selectedItems.value.pop();
  }
}

watch(selectedItems.value, (items) => {
  emit("update:modelValue", items);
});
</script>

<style scoped>
.filter-items-input {
  border: none;
  outline: none;
}
</style>

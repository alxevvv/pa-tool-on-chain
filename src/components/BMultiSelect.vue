<template>
  <div :class="dropdownClasses">
    <div :class="controlClasses">
      <div
        ref="inputRef"
        :class="inputClasses"
        @click="showDropdown"
      >
        <template v-if="selectedItems.length">
          <span
            v-for="item in selectedItems"
            :key="item.id"
            class="tag is-primary"
          >{{ item.title }} <button
            class="delete is-small"
            @click="removeItem(item.id)"
          /></span>
        </template>
        <span
          v-else-if="emptyItem"
          class="tag is-primary"
        >
          {{ emptyItem }}
        </span>
        <input
          ref="filterInputRef"
          v-model="filterItems"
          type="text"
          class="filter-items-input"
          :placeholder="placeholder"
          @keydown="onFilterItemsKeydown"
        >
      </div>
      <span
        v-if="clearable"
        class="icon is-small is-right clear-items-icon"
        @click="clearItems"
      ><i class="fas fa-times" /></span>
    </div>
    <div
      class="dropdown-menu"
      role="menu"
    >
      <div
        v-if="filteredItems.length"
        class="dropdown-content"
      >
        <a
          v-for="item in filteredItems"
          :key="item.id"
          ref="dropdownItemRefs"
          :class="`dropdown-item${selectedItemIds.includes(item.id) ? ' is-active' : ''}`"
          @click="addItem(item.id)"
        >{{ item.title }}</a>
      </div>
      <div
        v-else
        class="dropdown-content"
      >
        <span
          class="dropdown-item no-items"
          @click="filterItems = ''"
        >There are no items</span>
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
  clearable: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
  emptyItem: {
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
const filterInputRef = ref(null);
const dropdownItemRefs = ref([]);

const dropdownClasses = computed(() => {
  const classes = ["multi-select dropdown"];
  if (isDropdownActive.value) {
    classes.push("is-active");
  }
  if (props.fullWidth) {
    classes.push("full-width");
  }
  return classes;
});

const controlClasses = computed(() => {
  const classes = ["control", "is-expanded"];
  if (clearable.value) {
    classes.push("has-icons-right");
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

const clearable = computed(() => props.clearable && selectedItems.value.length);

const filteredItems = computed(() => {
  if (!filterItems.value) {
    return props.items;
  } else {
    return props.items.filter(({ title }) => title.toLowerCase().includes(filterItems.value));
  }
});

function showDropdown() {
  isDropdownActive.value = true;
  filterInputRef.value.focus();
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

function clearItems() {
  selectedItems.value = [];
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

.multi-select.full-width,

.multi-select.full-width > .control,

.multi-select.full-width > .dropdown-menu {
  width: 100%;
}

.multi-select .input {
  display: flex;
  flex-flow: row wrap;
  height: auto;
  padding: .4em;
  gap: .4em;
}

.multi-select .has-icons-right .input {
  padding-right: .2.5em;
}

.multi-select .input input {
  flex-grow: 1;
  height: 1.7em;
  font-size: 1rem;
}
.multi-select .input input::placeholder {
  color: hsl(0, 0%, 77%);
}

.no-items {
  cursor: default;
}

.multi-select .control.has-icons-right .clear-items-icon {
  pointer-events: all;
  cursor: pointer;
}
</style>

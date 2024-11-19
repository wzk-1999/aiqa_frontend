<template>
  <q-item
    clickable
    tag="a"
    :href="props.link"
    :class="props.isActive ? 'bg-grey-12 rounded-borders' : ''"
  >
    <q-item-section v-if="props.icon" avatar>
      <q-icon
        :name="props.icon"
        :class="props.isActive ? 'text-primary' : ''"
      />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ props.title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup>
defineOptions({
  name: "RecentChat",
});

const props = defineProps({
  title: {
    type: String,
    required: true,
  },

  link: {
    type: String,
    default: "#",
  },

  icon: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});
</script>

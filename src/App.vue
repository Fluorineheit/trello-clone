<script setup lang="ts">
import { reactive, ref } from 'vue';
import draggable from 'vuedraggable';
import ModalDialog from './components/ModalDialog.vue';
import type { List } from './types';

const isModalOpen = ref(false)

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const lists = reactive<List[]>([
  {
    id: 1,
    title: 'To Do',
    cards: [
      { id: 1, title: 'Tugas 1', description: 'Deskripsi tugas 1' },
      { id: 2, title: 'Tugas 6', description: 'Deskripsi tugas 1' },
    ],
  },
  {
    id: 2,
    title: 'In Progress',
    cards: [
      { id: 3, title: 'Tugas 2', description: 'Deskripsi tugas 2' },
    ],
  },
  {
    id: 3,
    title: 'Done',
    cards: [
      { id: 4, title: 'Tugas 3', description: 'Deskripsi tugas 3' },
    ],
  },
])

</script>

<template>
  <main class="p-5 font-sans">
    <div class="flex gap-5 py-5 overflow-x-auto">
      <div :key="list.id" v-for="list in lists" class="bg-gray-100 p-5 rounded-lg min-w-[250px] flex flex-col">
        <h2 class="font-medium text-md text-gray-500">{{ list.title }}</h2>
        <draggable group="cards" :list="list.cards" item-key="id" :animation="200" class="flex flex-col">
          <template #item="{ element }">
            <div class="bg-white p-3 my-2 rounded cursor-pointer">
              <span class="text-md font-medium">{{ element.title }}</span>
              <p class="text-sm text-gray-500">{{ element.description }}</p>
            </div>
          </template>
        </draggable>

        <button @click="openModal"
          class="w-full p-2 rounded cursor-pointer text-sm font-medium text-gray-500 hover:bg-gray-200 text-left">
          + Add Card
        </button>
      </div>
    </div>
    <ModalDialog :isOpen="isModalOpen" @close="closeModal" />
  </main>
</template>

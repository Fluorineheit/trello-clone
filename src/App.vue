<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import draggable from 'vuedraggable'
import ModalDialog from './components/ModalDialog.vue'
import type { Card, List } from './types'

const lists = reactive<List[]>([
  {
    id: 1,
    title: 'To Do',
    cards: [
      { id: 1, title: 'Tugas 1', description: 'Deskripsi tugas 1' },
      { id: 2, title: 'Tugas 6', description: 'Deskripsi tugas 1' },
      { id: 3, title: 'Tugas 1', description: 'Deskripsi tugas 1' },
      { id: 4, title: 'Tugas 6', description: 'Deskripsi tugas 1' },
      { id: 5, title: 'Tugas 1', description: 'Deskripsi tugas 1' },
      { id: 6, title: 'Tugas 6', description: 'Deskripsi tugas 1' },
    ],
  },
  {
    id: 2,
    title: 'In Progress',
    cards: [{ id: 7, title: 'Tugas 2', description: 'Deskripsi tugas 2' }],
  },
  {
    id: 3,
    title: 'Done',
    cards: [{ id: 8, title: 'Tugas 3', description: 'Deskripsi tugas 3' }],
  },
])

const isModalOpen = ref(false)
const editingCard = ref<Card | null>(null)
const editinglistIndex = ref<number | null>(null)

const modalMode = computed(() => {
  return editingCard.value === null ? 'add' : 'edit'
})

const openModal = (listIndex: number, card?: Card) => {
  editinglistIndex.value = listIndex
  editingCard.value = card === undefined ? null : card
  isModalOpen.value = true
}

const saveCard = (card: Card) => {
  if (editinglistIndex.value === null) {
    return
  }

  if (modalMode.value === 'add') {
    // adding
    const newId = Math.max(...lists.flatMap(list => list.cards.map(c => c.id)))
    lists[editinglistIndex.value].cards.push({...card, id: newId})
  } else {
    // editing
    const cardIndex = lists[editinglistIndex.value].cards.findIndex(
      (cardOnList) => cardOnList.id === card.id,
    )

    if (cardIndex !== -1){
      lists[editinglistIndex.value].cards[cardIndex] = card
    }
  }

  closeModal()
}

const closeModal = () => {
  isModalOpen.value = false
  editingCard.value = null
  editinglistIndex.value = null
}
</script>

<template>
  <main class="p-5 font-sans">
    <div class="flex gap-5 py-5 overflow-x-auto">
      <div
        :key="list.id"
        v-for="(list, listIndex) in lists"
        class="bg-gray-100 p-5 rounded-lg max-h-[95vh] min-w-[250px] flex flex-col"
        :style="{ minHeight: `${Math.max(250, list.cards.length * 90)}px` }"
      >
        <h2 class="font-medium text-md text-gray-500">{{ list.title }}</h2>
        <draggable
          group="cards"
          :list="list.cards"
          item-key="id"
          :animation="200"
          class="flex flex-col h-[100%] overflow-y-auto bor"
        >
          <template #item="{ element }">
            <div @click="openModal(listIndex, element)" class="bg-white p-3 my-2 rounded cursor-pointer">
              <span class="text-md font-medium">{{ element.title }}</span>
              <p class="text-sm text-gray-500">{{ element.description }}</p>
            </div>
          </template>
        </draggable>

        <button
          @click="openModal(listIndex)"
          class="w-full p-2 rounded cursor-pointer text-sm font-medium text-gray-500 hover:bg-gray-200 text-left"
        >
          + Add Card
        </button>
      </div>
    </div>
    <ModalDialog :isOpen="isModalOpen" :card="editingCard" :mode="modalMode" @close="closeModal" @save="saveCard" />
  </main>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import ModalDialog from './components/ModalDialog.vue'
import { useBoardStore } from './stores/boardStores'
// import type { Card, List } from './types'


const boardStore = useBoardStore()

// const lists = reactive<List[]>([
//   {
//     id: 1,
//     title: 'To Do',
//     cards: [
//       { id: 1, title: 'Tugas 1', description: 'Deskripsi tugas 1' },
//       { id: 2, title: 'Tugas 6', description: 'Deskripsi tugas 1' },
//       { id: 3, title: 'Tugas 1', description: 'Deskripsi tugas 1' },
//       { id: 4, title: 'Tugas 6', description: 'Deskripsi tugas 1' },
//       { id: 5, title: 'Tugas 1', description: 'Deskripsi tugas 1' },
//       { id: 6, title: 'Tugas 6', description: 'Deskripsi tugas 1' },
//     ],
//   },
//   {
//     id: 2,
//     title: 'In Progress',
//     cards: [{ id: 7, title: 'Tugas 2', description: 'Deskripsi tugas 2' }],
//   },
//   {
//     id: 3,
//     title: 'Done',
//     cards: [{ id: 8, title: 'Tugas 3', description: 'Deskripsi tugas 3' }],
//   },
// ])

// const isModalOpen = ref(false)
// const editinglistIndex = ref<number | null>(null)
// const editingCardIndex = ref<number | null>(null)

// const editingCard = computed(()=>{
//   if(editinglistIndex.value === null || editingCardIndex.value === null){
//     return null
//   }
//   const list =  boardStore.lists.find(l => l.id === editinglistIndex.value)
//   return list?.cards.find(c => c.id === editingCardIndex.value) || null
// })

// const modalMode = computed(() => {
//   return editingCardIndex.value === null ? 'add' : 'edit'
// })

// const openModal = (listIndex: number, cardIndex?: number) => {
//   editinglistIndex.value = listIndex
//   editingCardIndex.value = cardIndex === undefined ? null : cardIndex
//   isModalOpen.value = true
// }

// const saveCard = (card: Card) => {
//   if (editinglistIndex.value === null) {
//     return
//   }

//   if (modalMode.value === 'add') {
//     // adding
//     const newId = Math.max(...lists.flatMap(list => list.cards.map(c => c.id)))
//     lists[editinglistIndex.value].cards.push({ ...card, id: newId })
//   } else {
//     // editing
//     const cardIndex = lists[editinglistIndex.value].cards.findIndex(
//       (cardOnList) => cardOnList.id === card.id,
//     )

//     if (cardIndex !== -1) {
//       lists[editinglistIndex.value].cards[cardIndex] = card
//     }
//   }

//   closeModal()
// }

// const closeModal = () => {
//   isModalOpen.value = false
//   editingCardIndex.value = null
//   editinglistIndex.value = null
// }

// const handleCardUpdate = (updatedCard: Card) => {
//   if (editinglistIndex.value === null) return;
//   const list = lists[editinglistIndex.value];
//   const cardIndex = list.cards.findIndex(card => card.id === updatedCard.id);

//   if (cardIndex !== -1) {
//     list.cards[cardIndex] = updatedCard;

//     editingCard.value = updatedCard;
//   }

// }

</script>

<template>
  <main class="p-5 font-sans bg-[url(../bg.webp)] bg-cover bg-center min-h-screen ">
    <div class="flex gap-5 py-5 overflow-x-auto">
      <div :key="list.id" v-for="list in boardStore.lists"
        class="bg-gray-100 p-5 rounded-lg max-h-[87vh] w-[280px] flex flex-col">
        <h2 class="font-medium text-md text-gray-500">{{ list.title }}</h2>
        <draggable group="cards" :list="list.cards" item-key="id" :animation="200"
          class="flex flex-col h-[100%] overflow-y-auto bor">
          <template #item="{ element }">
            <div @click="boardStore.openModal(list.id, element.id)" class="bg-white p-3 my-2 rounded cursor-pointer break-all"
              :style="{ backgroundColor: element.color }">
              <span class="text-md font-medium">{{ element.title }}</span>
              <p class="text-sm text-gray-500">{{ element.description.length > 60 ? element.description.substring(0, 60) +
                '...' : element.description }}</p>
            </div>
          </template>
        </draggable>

        <button @click="boardStore.openModal(list.id)"
          class="w-full p-2 rounded cursor-pointer text-sm font-medium text-gray-500 hover:bg-gray-200 text-left">
          + Add Card
        </button>
      </div>
    </div>
    <ModalDialog :isOpen="boardStore.isModalOpen" :card="boardStore.editingCard" :mode="boardStore.modalMode" @close="boardStore.closeModal()"/>
  </main>
</template>

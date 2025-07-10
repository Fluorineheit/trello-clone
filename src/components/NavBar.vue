<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import { useBoardStore } from '@/stores/boardStores';
import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue';

const boardStore = useBoardStore();
const searchPanel = ref(null)

onClickOutside(searchPanel, ()=>{
  boardStore.searchQuery = ''
})

</script>

<template>
  <nav class="w-full py-2 px-5 bg-white flex items-center justify-between fixed">
    <div class="font-bold text-xl">Trello Clone</div>
    <form class="max-w-md w-[40%] mx-auto">
      <label for="card-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"></label>
      <div class="relative" ref="searchPanel">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search class="w-5 h-5 text-gray-500" />
        </div>
        <input v-model="boardStore.searchQuery" type="text"
          class="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg"
          placeholder="Card search..." required />
        <!-- dropdown -->
        <div v-if="boardStore.searchQuery">
        <template v-if="boardStore.searchCards.length > 0">
          <div class="absolute w-full bg-white mt-1 p-2 flex flex-col  rounded-lg text-gray-900 border border-gray-300">
            <div v-for="result in boardStore.searchCards" :key="result.card.id"
              @click="boardStore.openModal(result.listId, result.card.id); boardStore.searchQuery = ''"
              class="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
              {{ result.card.title }}
            </div>
          </div>
        </template>
        <div v-else class="absolute w-full bg-white mt-1 p-2 flex flex-col  rounded-lg text-gray-900 border border-gray-300">
          No results found.
        </div>
        </div>
      </div>
    </form>
    <div>
    </div>
  </nav>
</template>

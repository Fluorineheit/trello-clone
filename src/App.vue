<script setup lang="ts">
import draggable from 'vuedraggable'
import ModalDialog from './components/ModalDialog.vue'
import NavBar from './components/NavBar.vue'
import { useBoardStore } from './stores/boardStores'
import { Clock } from 'lucide-vue-next'
import { dateFormat } from './utils/dateFormat'

const boardStore = useBoardStore()

</script>

<template>
  <NavBar />
  <main class="p-5 font-sans bg-[url(../bg.webp)] bg-cover bg-center min-h-screen">
    <div class="flex gap-5 py-5 overflow-x-auto mt-10">
      <div :key="list.id" v-for="list in boardStore.lists"
        class="bg-gray-100 p-5 rounded-lg max-h-[90vh] w-[280px] flex flex-col">
        <h2 class="font-medium text-md text-gray-500">{{ list.title }}</h2>
        <draggable group="cards" :list="list.cards" item-key="id" :animation="200"
          class="flex flex-col h-[100%] overflow-y-auto bor">
          <template #item="{ element }">
            <div @click="boardStore.openModal(list.id, element.id)"
              class="bg-white p-3 my-2 rounded cursor-pointer break-all" :style="{ backgroundColor: element.color }">
              <div class="flex flex-wrap flex-row gap-2">
                <span v-for="labelId in element.labelIds" :key="labelId"
                  class="flex flex-wrap text-sm rounded font-medium text-gray-800 p-1 gap-1 mb-2 "
                  :style="{ backgroundColor: boardStore.labels.find(l => l.id === labelId)?.color }">
                  {{boardStore.labels.find(l => l.id === labelId)?.name}}
                </span>
              </div>
              <span class="text-md font-medium text-gray-600">{{ element.title }}</span>
              <p class="text-sm text-gray-400">{{ element.description.length > 60 ? element.description.substring(0, 60)
                +
                '...' : element.description }}</p>
              <div v-if="element.dueDate"
                class="flex w-fit flex-row items-center gap-2 text-sm text-gray-800 mt-1 bg-gray-200 p-1 rounded"
                :class="{
                  'bg-red-200 text-red-700': new Date(element.dueDate) <= new Date()
                }">
                <Clock class="w-4 h-4" />
                <span>{{ dateFormat(new Date(element.dueDate), 'd-m') }}</span>
              </div>
            </div>
          </template>
        </draggable>

        <button @click="boardStore.openModal(list.id)"
          class="w-full p-2 rounded cursor-pointer text-sm font-medium text-gray-500 hover:bg-gray-200 text-left">
          + Add Card
        </button>
      </div>
    </div>
    <ModalDialog :isOpen="boardStore.isModalOpen" :card="boardStore.editingCard" :mode="boardStore.modalMode"
      @close="boardStore.closeModal()" />
  </main>
</template>

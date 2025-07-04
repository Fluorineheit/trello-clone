<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { onClickOutside } from '@vueuse/core';
import type { Card } from '@/types';
import { Clock, Palette } from 'lucide-vue-next';
import { useBoardStore } from '@/stores/boardStores';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { dateFormat } from '@/utils/dateFormat';

const boardStore = useBoardStore()
const localCard = ref<Partial<Card>>({})
const localDescription = ref('')

// State for modal and form
const titleTextarea = ref<HTMLTextAreaElement | null>(null)
const isDatePickerOpen = ref(false)
const isColorPickerOpen = ref(false)
const datePickerPanel = ref(null)
const colorPickerPanel = ref(null)
const targetModal = ref<HTMLDivElement | null>(null)
const targetCardModal = ref<HTMLDivElement | null>(null)
const { activate, deactivate } = useFocusTrap(targetModal)
const stopClickOutside = ref<(() => void) | undefined>();
import type { DatePickerInstance } from "@vuepic/vue-datepicker"
const datePickerRef = ref<DatePickerInstance>(null);
const previousTitle = ref('')

// State for sidepanel
onClickOutside(datePickerPanel, () => isDatePickerOpen.value = false)
onClickOutside(colorPickerPanel, () => isColorPickerOpen.value = false)

const colors = [
  { name: 'Yellow', hex: '#fefcbf', class: 'bg-yellow-200' },
  { name: 'Green', hex: '#bbf7d0', class: 'bg-green-200' },
  { name: 'Blue', hex: '#bfdbfe', class: 'bg-blue-200' },
  { name: 'Red', hex: '#fecaca', class: 'bg-red-200' },
  { name: 'White', hex: '#ffffff', class: 'bg-white border' },
  {name: 'black', hex: '#172b4d', class: 'bg-[#172b4d]'}
];


function saveChanges() {
  if (!localCard.value.title && previousTitle.value) {
    localCard.value.title = previousTitle.value;
  }

  if (boardStore.editingCard) {
    boardStore.updateCard({ id: boardStore.editingCard.id, title:localCard.value.title, description: localCard.value.description, color: localCard.value.color, dueDate: localCard.value.dueDate });
    console.log(localCard.value.dueDate);
  } else {
    if (localCard.value.title) {
      boardStore.addCard(localCard.value as Card);
    }
  }
  boardStore.closeModal();
}

// function manualSave(){
//   if (boardStore.editingCard) {
//     boardStore.updateCard({ id: boardStore.editingCard.id, description: localDescription.value });
//   } else {
//     boardStore.addCard({ ...localCard.value, description: localDescription.value } as Card);
//   }
//   console.log('Manual save:', localCard.value);
//   boardStore.closeModal();
// }

watch(() => boardStore.isModalOpen, async (isOpen) => {
  if (isOpen) {
    localDescription.value = boardStore.editingCard?.description || '';
    if (boardStore.modalMode === 'edit' && boardStore.editingCard) {
      // localCard.value = {...boardStore.editingCard}
      localCard.value = JSON.parse(JSON.stringify(boardStore.editingCard));
      previousTitle.value = boardStore.editingCard.title;
    } else {
        localCard.value = {
        id: 0,
        title: '',
        description: '',
        color: '#ffffff'
      }
      previousTitle.value = '';
    }
    nextTick(() => {
      titleTextarea.value?.focus();
      activate();

      stopClickOutside.value = onClickOutside(targetCardModal, () => {
        saveChanges();
      });
    });
  } else {
    deactivate()
    if (stopClickOutside.value) {
      stopClickOutside.value()
      stopClickOutside.value = undefined
      isDatePickerOpen.value = false;
    }
  }
})

watch(isDatePickerOpen, (isOpen) => {
  if (!datePickerPanel.value) return;
  console.log('datepicker value:', localCard.value.dueDate);
  if (isOpen) {
    nextTick(() => {
      datePickerRef.value?.openMenu();
    })
  } else {
    datePickerRef.value?.closeMenu();
  }
});

</script>

<template>
  <div ref="targetModal" v-if="boardStore.isModalOpen" @keydown.esc="saveChanges"
    class="fixed inset-0 bg-black/30 flex items-center justify-center">
    <div ref="targetCardModal" class="bg-white p-5 rounded max-w-md w-full">
      <!-- title -->
      <textarea v-model="localCard.title"
        @input="boardStore.editingCard && boardStore.updateCard({ id: boardStore.editingCard.id, title: ($event.target as HTMLTextAreaElement).value })"
        ref="titleTextarea" placeholder="Title" rows="1"
        class="w-full p-2 mb-2 rounded font-medium text-lg focus:outline-none resize-none overflow-hidden">
      </textarea>
      <div class="flex flex-row justify-start align-middle items-center mb-2 gap-2">
        <button v-if="localCard.dueDate" @click="isDatePickerOpen = !isDatePickerOpen">
          <!-- <div v-if="isDatePickerOpen"> -->
            <VueDatePicker teleport-center :action-row="{ showNow: true, showCancel: false }" now-button-label="Current" :format="dateFormat" ref="datePickerRef" :clearable="false" v-model="localCard.dueDate" class="w-full"/>
          <!-- </div> -->
        </button>
        <div>c</div>
      </div>
      <div class="flex flex-row justify-between items-top mb-4 gap-4">
        <div class="w-2/3 flex flex-col gap-4">
          <!-- desc -->
          <!-- <textarea v-model="localCard.description" placeholder="Description" rows="5"
            class="w-full p-2 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          </textarea> -->
          <textarea v-model="localCard.description" placeholder="Description"
            class="w-full p-2 my-2 border rounded resize-none min-h-20"></textarea>

          <!-- <div class="flex justify-end gap-2">
            <button @click="saveChanges"
              class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700">
              {{ boardStore.modalMode === 'add' ? 'Add Card' : 'Save' }}
            </button>
          </div> -->
        </div>

        <!-- right -->
        <div class="w-1/3">
          <div class="flex flex-col gap-2">
            <!-- color -->
            <div class="relative" ref="colorPickerPanel">
              <button @click="isColorPickerOpen = !isColorPickerOpen"
                class="w-full bg-gray-200 hover:bg-gray-300 rounded text-left flex items-center p-2">
                <div class="flex-1 flex items-center gap-2">
                  <Palette class="w-5 h-5" />
                  Color
                </div>
                <span class="w-8 h-6 bg-amber-200 justify-self-end"
                  :style="{ backgroundColor: localCard.color || '#ffffff' }"></span>
              </button>
              <div v-if="isColorPickerOpen" class="absolute z-10 w-full mt-1 bg-white p-2 border rounded shadow-lg">
                <div v-for="color in colors" :key="color.hex"
                  @click="localCard.color = color.hex; isColorPickerOpen = false"
                  class="p-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer rounded"
                  :class="{ 'bg-gray-200': localCard?.color === color.hex }">
                  <div class="w-8 h-6 rounded" :class="color.class"></div>
                  <span>{{ color.name }}</span>
                </div>
              </div>
            </div>

            <!-- dates -->
            <div v-if="!localCard.dueDate" class="relative" ref="datePickerPanel">
              <button @click="isDatePickerOpen = !isDatePickerOpen"
                class="w-full bg-gray-200 hover:bg-gray-300 p-2 rounded text-left flex items-center gap-2">
                <Clock class="w-5 h-5" />
                Dates
              </button>
              <div v-if="isDatePickerOpen" class="absolute z-10 w-full mt-1 bg-white p-2 border rounded shadow-lg">
                <!-- <input type="date" v-model="localCard.dueDate" class="w-full p-2 border rounded" /> -->
                <VueDatePicker :action-row="{ showNow: true, showCancel: false }" now-button-label="Current" :format="dateFormat" ref="datePickerRef" v-model="localCard.dueDate" class="w-full mt-2"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

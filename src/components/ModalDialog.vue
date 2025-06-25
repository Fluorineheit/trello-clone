<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { onClickOutside } from '@vueuse/core';
import type { Card } from '@/types';
import { useTextareaAutosize } from '@vueuse/core'
import { Clock, Palette } from 'lucide-vue-next';
// import { isDate } from 'util/types';

const props = defineProps<{
  isOpen: boolean,
  card: Card | null,
  mode: 'add' | 'edit'
}>()

const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'save', card: Card): void,
  (e: 'update:card', card: Card): void
}>()

// State for modal and form
// const titleInput = ref<HTMLInputElement | null>(null)
const targetModal = ref<HTMLDivElement | null>(null)
const targetCardModal = ref<HTMLDivElement | null>(null)
const localCard = ref<Card>({
  id: 0,
  title: '',
  description: '',
  color: '#ffffff',
})

// Title auto size
const { textarea: titleTextarea, input: titleInput } = useTextareaAutosize({
  input: computed({
    get: () => localCard.value.title,
    set: (val) => { localCard.value.title = val; },
  }),
});

// desc auto size
const {textarea: descTextArea, input: descInput} = useTextareaAutosize({
  input: computed({
    get: () => localCard.value.description,
    set: (val) => {localCard.value.description = val; },
  })
})

// State for sidepanel
const isDatePickerOpen = ref(false)
const isColorPickerOpen = ref(false)
const datePickerPanel = ref(null)
const colorPickerPanel = ref(null)

onClickOutside(datePickerPanel, () => isDatePickerOpen.value = false)
onClickOutside(colorPickerPanel, () => isColorPickerOpen.value = false)

const colors = [
  { name: 'Yellow', hex: '#fefcbf', class: 'bg-yellow-200' },
  { name: 'Green', hex: '#bbf7d0', class: 'bg-green-200' },
  { name: 'Blue', hex: '#bfdbfe', class: 'bg-blue-200' },
  { name: 'Red', hex: '#fecaca', class: 'bg-red-200' },
  { name: 'White', hex: '#ffffff', class: 'bg-white border' },
];

const { activate, deactivate } = useFocusTrap(targetModal)
const stopClickOutside = ref<(() => void) | undefined>()


watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    if (props.card) {
      localCard.value = { ...props.card }
    } else {
      localCard.value = {
        id: 0,
        title: '',
        description: '',
        color: '#ffffff',
      }
    }
    nextTick(() => {
      titleTextarea.value?.focus()
      activate()
      stopClickOutside.value = onClickOutside(targetCardModal, () => {
        emit('close')
      })
    })
  } else {
    deactivate()
    isDatePickerOpen.value = false
    isColorPickerOpen.value = false
    if (stopClickOutside.value) {
      stopClickOutside.value()
      stopClickOutside.value = undefined
    }
  }
},{ immediate: true })

function updateCardProperty(property: keyof Card, value: string){
  if (props.card){
    const updatedCard = {...props.card, [property]: value}
    emit('update:card', updatedCard)
  }
}

</script>

<template>
  <div ref="targetModal" v-if="isOpen" @keydown.esc="emit('close')"
    class="fixed inset-0 bg-black/30 flex items-center justify-center">
    <div ref="targetCardModal" class="bg-white p-5 rounded max-w-md w-full">
      <!-- title -->
      <textarea v-model="titleInput"  @input="updateCardProperty('title',($event.target as HTMLTextAreaElement).value)" ref="titleTextarea" placeholder="Title" rows="1"
        class="w-full p-2 mb-2 rounded font-medium text-lg focus:outline-none  resize-none overflow-hidden"></textarea>
      <div class="flex flex-row justify-between items-top mb-4 gap-4">
        <div class="w-2/3 flex flex-col gap-4">
          <!-- desc -->
          <!-- <textarea v-model="localCard.description" placeholder="Description" rows="5"
            class="w-full p-2 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
          </textarea> -->

          <textarea
            v-model="descInput"
            ref="descTextArea"
            placeholder="Description"
            class="w-full p-2 my-2 border rounded resize-none min-h-20 max-h-100"
            :style="{overflowY: 'auto'}"
          ></textarea>

          <div class="flex justify-end gap-2">

            <button @click="emit('save', localCard)"
              class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700">
              {{ mode === 'add' ? 'Add Card' : 'Save Changes' }}
            </button>
          </div>
        </div>
        <div class="w-1/3">
          <div class="flex flex-col gap-2">
            <div class="relative" ref="colorPickerPanel">
              <button @click="isColorPickerOpen = !isColorPickerOpen"
                class="w-full bg-gray-100 hover:bg-gray-200 rounded text-left flex items-center p-2">
                <div class="flex-1 flex items-center gap-2">
                  <Palette class="w-5 h-5"/>
                  Color
                </div>
                <span class="w-8 h-6 bg-amber-200 justify-self-end" :style="{backgroundColor: card?.color || '#ffffff'}"></span>
              </button>
              <div v-if="isColorPickerOpen" class="absolute z-10 w-full mt-1 bg-white p-2 border rounded shadow-lg">
                <div v-for="color in colors" :key="color.hex"
                  @click="updateCardProperty('color', color.hex); isColorPickerOpen = false"
                  class="p-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer rounded"
                  :class="{ 'bg-gray-200': card?.color === color.hex }">
                  <div class="w-8 h-6 rounded" :class="color.class"></div>
                  <span>{{ color.name }}</span>
                </div>
              </div>
            </div>

            <div class="relative" ref="datePickerPanel">
              <button @click="isDatePickerOpen = !isDatePickerOpen"
                class="w-full bg-gray-100 hover:bg-gray-200 p-2 rounded text-left flex items-center gap-2">
                <Clock class="w-5 h-5" />
                Dates
              </button>
              <div v-if="isDatePickerOpen" class="absolute z-10 w-full mt-1 bg-white p-2 border rounded shadow-lg">
                <input type="date" v-model="localCard.dueDate" class="w-full p-2 border rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

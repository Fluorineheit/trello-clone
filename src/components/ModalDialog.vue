<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { onClickOutside } from '@vueuse/core';
import type { Card } from '@/types';

const props = defineProps<{
  isOpen: boolean,
  card: Card | null,
  mode: 'add' | 'edit'
}>()
const emit = defineEmits<{
  (e: 'close'): void,
  (e: 'save', card: Card): void
}>()

const titleInput = ref<HTMLInputElement | null>(null)
const targetModal = ref<HTMLDivElement | null>(null)
const targetCardModal = ref<HTMLDivElement | null>(null)
const localCard = ref<Card>({
  id: 0,
  title: '',
  description: ''
})
const {activate, deactivate} = useFocusTrap(targetModal)
const stopClickOutside = ref<(() => void) | undefined>()

watch(()=>props.card, (newCard) =>{
  if(newCard){
    localCard.value = {...newCard}
  } else {
    localCard.value = {
      id: 0,
      title: '',
      description: ''
    }
  }
},{ immediate: true })

watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    titleInput.value?.focus()
    activate()
    stopClickOutside.value = onClickOutside(targetCardModal, () => {
      console.log('clicked outside')
      emit('close')
      deactivate()
    })
  } else {
    deactivate()
    if (stopClickOutside.value) {
      stopClickOutside.value()
      stopClickOutside.value = undefined
    }
  }
})
</script>

<template>
  <div ref="targetModal" v-if="isOpen" @keydown.esc="emit('close')" class="fixed inset-0 bg-black/30 flex items-center justify-center">
    <div ref="targetCardModal" class="bg-white p-5 rounded max-w-md w-full">
      <h2 class="font-medium text-lg">{{ mode === 'add' ? 'Add new card' : 'Edit card' }}</h2>
      <input v-model="localCard.title" type="text" ref="titleInput"  placeholder="Title" class="w-full p-2 my-2 border rounded" />
      <textarea v-model="localCard.description" placeholder="Description" class="w-full p-2 my-2 border rounded"></textarea>
      <div class="flex justify-end gap-2">
        <button @click="emit('close')" class="text-red-500 p-2 rounded hover:bg-gray-200">
          Cancel
        </button>
        <button @click="emit('save', localCard)" class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700">
          {{ mode === 'add' ? 'Add Card' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

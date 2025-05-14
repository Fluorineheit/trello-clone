<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { onClickOutside } from '@vueuse/core';

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const titleInput = ref<HTMLInputElement | null>(null)
const targetModal = ref<HTMLDivElement | null>(null)
const targetCardModal = ref<HTMLDivElement | null>(null)
const {activate, deactivate} = useFocusTrap(targetModal)
const stopClickOutside = ref<(() => void) | undefined>()

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
      <h2 class="font-medium text-lg">Add new Card</h2>
      <input type="text" ref="titleInput"  placeholder="Title" class="w-full p-2 my-2 border rounded" />
      <textarea placeholder="Description" class="w-full p-2 my-2 border rounded"></textarea>
      <div class="flex justify-end gap-2">
        <button @click="emit('close')" class="text-red-500 p-2 rounded hover:bg-gray-200">
          Cancel
        </button>
        <button  class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

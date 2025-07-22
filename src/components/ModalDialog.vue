<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';
import type { Card, Label } from '@/types';
import { AlignLeft, ChevronLeftIcon, Clock, Palette, Pencil, Tag, User } from 'lucide-vue-next';
import { useBoardStore } from '@/stores/boardStores';
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { dateFormat } from '@/utils/dateFormat';

// main state
const localCard = ref<Partial<Card>>({})

// ref for ui
const titleTextarea = ref<HTMLTextAreaElement | null>(null)
const targetModal = ref<HTMLDivElement | null>(null)
const targetCardModal = ref<HTMLDivElement | null>(null)
const { activate, deactivate } = useFocusTrap(targetModal)

const labelSearchQuery = ref('')
const boardStore = useBoardStore()
const isDatePickerOpen = ref(false)
const isColorPickerOpen = ref(false)
const datePickerPanel = ref(null)
const colorPickerPanel = ref(null)
const stopClickOutside = ref<(() => void) | undefined>();
import type { DatePickerInstance } from "@vuepic/vue-datepicker"
const datePickerRef = ref<DatePickerInstance>(null);
const previousTitle = ref('')


// state for pop ups
const isLabelsPanelOpen = ref(false)
const labelsPickerPanel = ref(null)
onClickOutside(labelsPickerPanel, () => {
  if (isLabelsPanelOpen.value) {
    if (localCard.value.id) {
      boardStore.updateCard({
        id: localCard.value.id,
        labelIds: localCard.value.labelIds
      })
    }
  }
  isLabelsPanelOpen.value = false
})

const isLabelsOverflowing = ref(false)
const labelModal = ref<HTMLElement | null>(null)

const checkLabelsOverflow = () => {
  if (labelModal.value) {
    const viewportHeight = window.innerHeight
    const modalHeight = labelModal.value.getBoundingClientRect()
    isLabelsOverflowing.value = modalHeight.bottom >= viewportHeight - 40
    console.log(viewportHeight, modalHeight, isLabelsOverflowing.value)
  }
}

watch(() => isLabelsPanelOpen.value, async (val) => {
  if (val) {
    console.log("we de best")
    await nextTick()
    checkLabelsOverflow()
  }
})

// State for the Labels Panel
const labelPanelView = ref<'list' | 'create' | 'edit'>('list')
const editingLabelId = ref<number | null>(null);
const newLabel = ref<{ name: string, color: string }>({ name: '', color: '' })
const labelColors = [
  // Row 1
  { name: 'Dark Green', hex: '#17594A' },
  { name: 'Olive', hex: '#7A6000' },
  { name: 'Brown', hex: '#A04A00' },
  { name: 'Dark Red', hex: '#7A2323' },
  { name: 'Dark Purple', hex: '#3E2A5B' },
  // Row 2
  { name: 'Teal', hex: '#2AA889' },
  { name: 'Yellow', hex: '#E3B505' },
  { name: 'Peach', hex: '#FFA361' },
  { name: 'Coral', hex: '#FF6F61' },
  { name: 'Lavender', hex: '#A393E6' },
  // Row 3
  { name: 'Navy', hex: '#0B3C5D' },
  { name: 'Steel Blue', hex: '#276678' },
  { name: 'Olive Green', hex: '#4E944F' },
  { name: 'Plum', hex: '#6C3483' },
  { name: 'Slate', hex: '#5D6D7E' },
  // Row 4
  { name: 'Bright Blue', hex: '#1565C0' },
  { name: 'Sky Blue', hex: '#1E90FF' },
  { name: 'Grass Green', hex: '#7BB661' },
  { name: 'Dark Magenta', hex: '#8E44AD' },
  { name: 'Gray', hex: '#7B8D8E' },
  // Row 5
  { name: 'Light Blue', hex: '#5DADE2' },
  { name: 'Aqua', hex: '#76D7C4' },
  { name: 'Light Green', hex: '#A9DFBF' },
  { name: 'Lime', hex: '#B4DF6A' },
  { name: 'Light Gray', hex: '#AAB7B8' },
]

// function for labels
function openCrateLabelView() {
  const usedColor = new Set(boardStore.labels.map(label => label.color));

  const firstAvailableColor = labelColors.find(color => !usedColor.has(color.hex))

  newLabel.value = {
    name: '',
    color: (firstAvailableColor || labelColors[0]).hex,
  }

  labelPanelView.value = 'create'
}

function openEditLabelView(label: Label) {
  editingLabelId.value = label.id;
  newLabel.value = { name: label.name, color: label.color };
  labelPanelView.value = 'edit';
}

const filteredLabels = computed(() => {
  if (!labelSearchQuery.value) {
    return boardStore.labels
  }

  const found = boardStore.labels.find(label => label.name === labelSearchQuery.value.toLowerCase())
  return found ? [found] : []
})

function handleLabelSave() {
  if (!newLabel.value.color) {
    alert('Please select a color.');
    return;
  }

  if (editingLabelId.value !== null) {
    boardStore.updateLabel({
      id: editingLabelId.value,
      name: newLabel.value.name,
      color: newLabel.value.color,
    });
  } else {
    const isDuplicate = boardStore.labels.some(
      (label) =>
        label.name === newLabel.value.name &&
        label.color === newLabel.value.color
    )

    if (!isDuplicate) {
      boardStore.createlabel(newLabel.value);
    }
  }

  labelPanelView.value = 'list';
  editingLabelId.value = null;
  newLabel.value = { name: '', color: '' };
}

// desc
const descriptionDrafts = ref<Record<number, string>>({});

function handleSaveDescription() {
  if (boardStore.editingCard) {
    boardStore.updateCard({
      id: boardStore.editingCard.id,
      description: currentDescriptionDrafts.value
    });
  }
}

function handleCancelDescription(){
  if(boardStore.editingCard){
    currentDescriptionDrafts.value = boardStore.editingCard.description
  }
}

const currentDescriptionDrafts = computed({
  get(){
    if(!boardStore.editingCard) return '';
    return descriptionDrafts.value[boardStore.editingCard.id] ?? boardStore.editingCard.description;
  },

  set(value){
    if(!boardStore.editingCard) return '';
    return descriptionDrafts.value[boardStore.editingCard.id] = value;
  }
})

// comments
const editingCommentId = ref<number | null>(null)
const editingCommentText = ref('')
const commentDrafts = ref<Record<number, string>>({})

function handleSaveComment() {
  if (currentCommentDraft.value.trim() && boardStore.editingCard) {
    boardStore.addComment({
      cardId: boardStore.editingCard.id,
      text: currentCommentDraft.value
    })
  }

  currentCommentDraft.value = ''
}

function startEditComment(comment: { id: number; cardId: number; text: string; time: string }) {
  console.log(comment.id)
  editingCommentId.value = comment.id;
  editingCommentText.value = comment.text;
}

function handleUpdateComment(){
  console.log("haha")
  if (editingCommentId.value === null) {
    return;
  }

  boardStore.editComment(editingCommentId.value, editingCommentText.value)

  editingCommentId.value = null;
  editingCommentText.value = '';
}

const currentCommentDraft = computed({
  get(){
    if(!boardStore.editingCard) return '';
    return commentDrafts.value[boardStore.editingCard.id] || ''
  },

  set(value){
    if(!boardStore.editingCard) return '';
    commentDrafts.value[boardStore.editingCard.id] = value
  }
})

// Watcher to initialize the main modal state when it opens
watch(() => boardStore.isModalOpen, async (isOpen) => {
  if (isOpen) {
    if(boardStore.editingCard && descriptionDrafts.value[boardStore.editingCard.id] === undefined){
      descriptionDrafts.value[boardStore.editingCard.id] = boardStore.editingCard.description;
    }
    if (boardStore.modalMode === 'edit' && boardStore.editingCard) {
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

function saveChanges() {
  if (!localCard.value.title && previousTitle.value) {
    localCard.value.title = previousTitle.value;
  }

  if (boardStore.editingCard) {
    boardStore.updateCard({ id: boardStore.editingCard.id, title: localCard.value.title, color: localCard.value.color, dueDate: localCard.value.dueDate });
  } else {
    if (localCard.value.title) {
      boardStore.addCard(localCard.value as Card);
    }
  }
  boardStore.closeModal();
}

function toggleLabel(labelId: number) {
  const labelIds = localCard.value.labelIds || [];
  if (labelIds.includes(labelId)) {
    localCard.value.labelIds = labelIds.filter(id => id !== labelId);
  } else {
    localCard.value.labelIds = [...labelIds, labelId];
  }
}

// State for sidepanel
onClickOutside(datePickerPanel, () => isDatePickerOpen.value = false)
onClickOutside(colorPickerPanel, () => isColorPickerOpen.value = false)

const colors = [
  { name: 'Yellow', hex: '#fefcbf', class: 'bg-yellow-200' },
  { name: 'Green', hex: '#bbf7d0', class: 'bg-green-200' },
  { name: 'Blue', hex: '#bfdbfe', class: 'bg-blue-200' },
  { name: 'Red', hex: '#fecaca', class: 'bg-red-200' },
  { name: 'White', hex: '#ffffff', class: 'bg-white border' },
];

watch(isDatePickerOpen, (isOpen) => {
  if (!datePickerPanel.value) return;
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
    <div ref="targetCardModal" class="bg-white p-5 rounded max-w-5xl h-[80vh] justify-between w-full flex flex-row ">
      <!-- left -->
      <div class="w-2/3 flex flex-col gap-2 h-full overflow-y-auto overflow-x-hidden pr-4">
        <!-- title -->
        <textarea v-model="localCard.title"
          ref="titleTextarea" placeholder="Title"
          class="field-sizing-content min-h-fit resize-none p-2 m-1 rounded font-medium text-3xl focus:outline-3 focus:outline-blue-400">
        </textarea>

        <div class="flex flex-row justify-start align-middle items-center mb-2 gap-2">
          <!-- datepicker if true -->
          <button v-if="localCard.dueDate" @click="isDatePickerOpen = !isDatePickerOpen">
            <VueDatePicker teleport-center :action-row="{ showNow: true, showCancel: false }" now-button-label="Current"
              :format="dateFormat" ref="datePickerRef" :clearable="false" v-model="localCard.dueDate" class="w-full" />
          </button>
          <div class="flex flex-row gap-2">
            <!-- color -->
            <div class="relative" ref="colorPickerPanel">
              <button @click="isColorPickerOpen = !isColorPickerOpen"
                class="w-full bg-gray-200 hover:bg-gray-300 rounded text-left flex items-center p-2">
                <div class="flex-1 flex items-center gap-2">
                  <Palette class="w-5 h-5" />
                  Color
                </div>
                <span class="w-8 h-6 ml-2 bg-amber-200 justify-self-end"
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
                <VueDatePicker :action-row="{ showNow: true, showCancel: false }" now-button-label="Current"
                  :format="dateFormat" ref="datePickerRef" v-model="localCard.dueDate" class="w-full mt-2" />
              </div>
            </div>

            <!-- labels -->
            <div class="relative" ref="labelsPickerPanel">
              <button @click="isLabelsPanelOpen = !isLabelsPanelOpen"
                class="w-full max-h-[450px] bg-gray-200 hover:bg-gray-300 p-2 rounded text-left flex items-center gap-2">
                <Tag class="w-5 h-5" />Labels
              </button>

              <div ref="labelModal" v-if="isLabelsPanelOpen"
                class="absolute  z-10 max-h-100 w-80 bg-white p-4 overflow-y-auto border rounded shadow-lg mt-auto mb-4">
                <div v-if="labelPanelView === 'list'">
                  <input class="block w-full p-1 text-sm text-gray-900 border-2 mb-2 border-gray-500 " type="text"
                    v-model="labelSearchQuery">
                  <div v-for="label in filteredLabels" :key="label.id"
                    class="flex flex-row items-center justify-between my-2 gap-2 cursor-pointer">
                    <label class="flex w-full items-center gap-2 cursor-pointer p-1 rounded">
                      <input class="w-5 h-5" type="checkbox" :checked="localCard.labelIds?.includes(label.id)"
                        @change='toggleLabel(label.id)'>
                      <div class="w-full h-9 rounded" :style="{ backgroundColor: label.color }">
                        <span class="m-2 text-gray-700 font-medium items-center align-middle text-center">
                          {{ label.name }}
                        </span>

                        <!-- bikin label color bisa di scroll oke -->
                      </div>
                    </label>
                    <button class="hover:bg-gray-200 p-2 cursor-pointer" @click="openEditLabelView(label)">
                      <Pencil class="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    class="w-full h-full p-2 text-gray-800 cursor-pointer font-medium rounded bg-blue-400 hover:bg-blue-500 mt-2"
                    @click="openCrateLabelView()">
                    Create new label
                  </button>
                </div>
                <div v-else>
                  <button class="mb-2 cursor-pointer"
                    @click="labelPanelView = 'list'; newLabel = ({ name: '', color: '' })">
                    <ChevronLeftIcon class="w-5 h-5" />
                  </button>
                  <input class="block w-full p-1 text-sm text-gray-900 border-2 mb-2 border-gray-500 " type="text"
                    v-model="newLabel.name">
                  <div class="grid grid-cols-5 gap-2 cursor-pointer">
                    <div v-for="labelColor in labelColors" :key="labelColor.hex"
                      class="flex place-content-center cursor-pointer ">
                      <span @click="newLabel.color = labelColor.hex" class="w-full h-8 rounded cursor-pointer"
                        :style="{ backgroundColor: labelColor.hex }"
                        :class="{ 'ring-2 ring-offset-2 ring-blue-500': newLabel.color === labelColor.hex }">
                      </span>
                    </div>
                  </div>
                </div>
                <button v-if="labelPanelView !== 'list'"
                  class="w-20 h-full p-2 text-gray-800 cursor-pointer font-medium rounded bg-blue-400 hover:bg-blue-500 mt-2"
                  @click="handleLabelSave()">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="(localCard.labelIds && localCard.labelIds.length > 0)">
          <div class="flex flex-row items-center gap-2">
            <AlignLeft class="w-5 h-5 text-center text-gray-700" />
            <span class="font-medium text-gray-700">Labels</span>
          </div>
          <div class="flex flex-row gap-2 my-2 ">
            <div v-for="label in filteredLabels" :key="label.id">
              <span class="w-full h-9 rounded py-1 px-2 text-gray-700 font-medium align-middle text-center"
                :style="{ backgroundColor: label.color }">
                {{ label.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- desc -->
        <div class="w-2/3 flex flex-col">
          <div class="flex flex-row items-center gap-2 ">
            <AlignLeft class="w-5 h-5 text-center text-gray-700" />
            <span class="font-medium text-gray-700">Description</span>
          </div>
          <textarea v-model="currentDescriptionDrafts" placeholder="Description"
            class="w-full p-2 my-2 border rounded resize-none field-sizing-content min-h-32">
          </textarea>
          <div class="flex flex-row gap-2" v-if="currentDescriptionDrafts !== boardStore.editingCard?.description">
            <button @click="handleSaveDescription()"
              class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700">
              Save
            </button>
            <button class="p-2 rounded cursor-pointer hover:bg-gray-200" @click="handleCancelDescription()">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- right -->
      <div class="w-1/3 flex-1 flex-row h-full overflow-y-auto overflow-x-hidden pr-4">
        <!-- comments -->
        <div class="justify-between items-top mb-4 gap-4">
          <textarea v-model="currentCommentDraft" placeholder="Comments"
            class="whitespace-pre-wrap border-2 focus:border-blue-400 field-sizing-content w-full p-2 my-2 rounded resize-none min-h-20 focus:outline-2 focus:outline-blue-400">
          </textarea>
          <div v-if="currentCommentDraft" class="flex flex-row gap-2">
            <button @click="handleSaveComment()"
              class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              :disabled="!currentCommentDraft.trim()">
              Save
            </button>
            <button class="p-2 rounded cursor-pointer hover:bg-gray-200" @click="currentCommentDraft = ''">
              Cancel
            </button>
          </div>
        </div>
        <div v-if="boardStore.editingCard">
          <div v-for="comments in boardStore.getCommentsByCardId(boardStore.editingCard.id)" :key="comments.id"
            class="flex flex-row gap-2 mb-5">
            <div class="h-full rounded-full border-2 border-gray-300 ">
              <User class="w-6 h-6" />
            </div>
            <div class="flex flex-col gap-1">
              <div>
                <span class="mr-2"> Usernamdwwwwwwwwwwe </span>
                <span class="text-sm font-medium text-pretty"> {{ dateFormat(new Date(comments.time), 'd-m-y') }} </span>
              </div>
              <div  v-if="editingCommentId === comments.id">
                <textarea class="w-full p-2 my-2 border rounded resize-none min-h-20 h-40 max-h-90" v-model="editingCommentText"></textarea>
                <button class="bg-blue-500 text-white p-2 rounded cursor-pointer hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed" :disabled="!editingCommentText.trim()" @click="handleUpdateComment">Save</button>
                <button class="ml-2 cursor-pointer hover:bg-gray-100 p-2" @click="editingCommentId = null">cancel</button>
              </div>
              <div v-else>
                <span class="whitespace-pre-wrap"> {{ comments.text }} </span>
                <div class="flex flex-row gap-2">
                  <span>React</span>
                  <span class="cursor-pointer underline" @click="startEditComment(comments)">Edit</span>
                  <span>Delete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

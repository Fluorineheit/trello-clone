import { defineStore } from 'pinia'
import type { List, Card } from '@/types'

export const useBoardStore = defineStore('board', {
  state: () => ({
    lists: [
      {
        id: 1,
        title: 'To Do',
        cards: [
          { id: 1, title: 'Tugas 1', description: 'Deskripsi tugas 1', color: '#ffffff' },
          { id: 2, title: 'Tugas 6', description: 'Deskripsi tugas 1', color: '#ffffff' },
        ],
      },
      {
        id: 2,
        title: 'In Progress',
        cards: [{ id: 7, title: 'Tugas 2', description: 'Deskripsi tugas 2', color: '#ffffff' }],
      },
      {
        id: 3,
        title: 'Done',
        cards: [{ id: 8, title: 'Tugas 3', description: 'Deskripsi tugas 3', color: '#ffffff' }],
      },
    ] as List[],

    isModalOpen: false,
    editingCardIndex: null as number | null,
    editingListIndex: null as number | null,
  }),

  getters: {
    editingCard(state): Card | null {
      if (state.editingCardIndex === null || state.editingListIndex === null) {
        return null
      }
      const list = state.lists.find((l) => l.id === state.editingListIndex)
      return list?.cards.find((c) => c.id === state.editingCardIndex) || null
    },

    modalMode(state): 'add' | 'edit' {
      return state.editingCardIndex !== null ? 'edit' : 'add'
    },
  },

  actions: {
    openModal(listId: number, cardId?: number) {
      this.isModalOpen = true
      this.editingListIndex = listId
      this.editingCardIndex = cardId ?? null
    },

    closeModal() {
      this.isModalOpen = false
      this.editingListIndex = null
      this.editingCardIndex = null
    },

    updateCard(cardData: Partial<Card>) {
      if (!cardData.id) return

      for (const list of this.lists) {
        const cardIndex = list.cards.findIndex((c) => c.id === cardData.id)

        if (cardIndex !== -1) {
          list.cards[cardIndex] = { ...list.cards[cardIndex], ...cardData }
          return
        }
      }
    },

    addCard(newCard: Card) {
      if (!this.editingListIndex) return

      const list = this.lists.find((l) => l.id === this.editingListIndex)
      if (list) {
        const newId = Math.max(0, ...this.lists.flatMap((l) => l.cards.map((c) => c.id))) + 1
        list.cards.push({ ...newCard, id: newId })
      }
    },
  },
})

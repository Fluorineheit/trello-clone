import { defineStore } from 'pinia'
import type { List, Card, Label, Comments } from '@/types'


export const useBoardStore = defineStore('board', {
  state: () => ({
    lists: [
      {
        id: 1,
        title: 'To Do',
        cards: [
          { id: 1, title: 'Tugas 1', description: 'Deskripsi tugas 1', color:'#fefcbf', labelIds: [2, 3], dueDate: '2023-10-01T14:30:00' },
          { id: 2, title: 'Tugas 6', description: 'Deskripsi tugas 1',  labelIds: [2, 3] },
        ],
      },
      {
        id: 2,
        title: 'In Progress',
        cards: [{ id: 7, title: 'Tugas 2', description: 'Deskripsi tugas 2', labelIds: [2, 3] }],
      },
      {
        id: 3,
        title: 'Done',
        cards: [{ id: 8, title: 'Tugas 3', description: 'Deskripsi tugas 3' }],
      },
    ] as List[],

    searchQuery: '',

    comments: [
      { id: 1, cardId: 1, text: 'ijdiawnd keren amat bosss', time: '2023-10-01T14:30:00', },
      { id: 2, cardId: 2, text: 'ijdiawnd keren amat bosss niceee', time: '2025-06-01T14:30:00', },
    ] as Comments[],

    labels: [
      { id: 1, name: 'Feature', color: '#bfdbfe' },
      { id: 2, name: 'Bug', color: '#fecaca' },
      { id: 3, name: 'Urgent', color: '#fefcbf' },
    ] as Label[],

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

    searchCards(state): {card: Card, listId: number}[] {
      if(!state.searchQuery) {
        return []
      }
      const query = state.searchQuery.toLowerCase()
      return state.lists.flatMap(list =>
        list.cards
          .filter((card) => card.title.toLowerCase().includes(query))
          .map((card) => ({
            card: card,
            listId: list.id
          }))
      )
    },

    getCommentsByCardId: (state) => (cardId: number): Comments[] => {
      return state.comments.filter(comment => comment.cardId === cardId)
    },

    getCommentCountByCardId: (state) => (cardId: number): number => {
      return state.comments.filter(comment => comment.cardId === cardId).length
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

    assignLabelToCard(cardId: number, labelId: number){
      for(const list of this.lists){
        const card = list.cards.find(c => c.id === cardId)
        if (card) {
          if(!card.labelIds?.includes(labelId)){
            card.labelIds = [];
          } else {
            card.labelIds?.push(labelId)
          }
          return
        }
      }
    },

    // unassignedLabelFromCard(cardId: number, labelId: number){
    //   for(const list of this.lists){
    //     const card = list.cards.find(c => c.id === cardId)
    //     if (card && Array.isArray(card.labelIds)) {
    //       const index = card.labelIds.indexOf(labelId)
    //         if (index !== -1) {
    //           card.labelIds.splice(index, 1)
    //         }
    //         return
    //     }
    //   }
    // },

    createlabel(labelData: { name: string, color: string }){
      const existingIds = this.labels.map(l=>l.id)

      const highestId = Math.max(0, ...existingIds)

      const newLabel = {
        id: highestId + 1,
        name: labelData.name,
        color: labelData.color
      }

      this.labels.push(newLabel)
    },

    updateLabel(updatedLabels: Label){
      const index = this.labels.findIndex(l => l.id === updatedLabels.id)
      if(index !== -1){
        this.labels[index] = updatedLabels;
      }
    },

    addComment(commentsData: {cardId: number, text: string}){
      const newDate = new Date().toISOString()
      const newId = Math.max(0, ...this.comments.map((l) => l.id)) + 1
      const newComments = {
        id: newId,
        cardId: commentsData.cardId,
        text: commentsData.text,
        time: newDate,
      }

      this.comments.push(newComments)
    },

    editComment(commentId: number, newText: string){
      const commentToUpdate = this.comments.find(comment => comment.id === commentId)

      if(commentToUpdate){
        commentToUpdate.text = newText
      }
    },

  },
})

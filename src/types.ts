export interface Card {
  id: number
  title: string
  description: string
  color?: string,
  dueDate?: string,
}

export interface List {
  id: number;
  title: string;
  cards: Card[]
}

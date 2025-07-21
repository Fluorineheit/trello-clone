export interface Card {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  labelIds?: number[];
  color: string;
}

export interface Comments {
  id: number;
  cardId: number;
  text: string;
  time: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface List {
  id: number;
  title: string;
  cards: Card[];
}

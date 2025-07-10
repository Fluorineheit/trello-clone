export interface Card {
  id: number;
  title: string;
  description: string;
  dueDate?: string;
  labelIds?: number[];
  color: string;
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

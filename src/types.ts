export type Id = string | number;

export type Column = {
  id: Id;
  title: string;
  sort: number;
};

export type Task = {
  id: Id;
  sectionId: Id;
  content: string;
  sort: number;
};

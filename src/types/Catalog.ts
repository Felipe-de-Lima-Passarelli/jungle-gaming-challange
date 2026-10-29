export type CatalogToolbarProps = {
  tab: string;
  onChangeTab: (tab: string) => void;
  sort: string;
  onChangeSort: (sort: string) => void;
  query: string;
  onChangeQuery: (query: string) => void;
  category: string;
  onClearCategory: () => void;
  resultCount: number;
};

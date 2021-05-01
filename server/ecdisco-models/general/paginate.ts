export class Paginate {
  currentPage: number;
  pageSize: number;
  total: number;

  lastRowValue: unknown;
  sorting: { [key: string]: 1 | -1 };
}

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/product-search/product-search').then(
        (m) => m.ProductSearch,
      ),
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta predeterminada
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  // Ruta para la página principal
  { path: 'main', loadComponent: ()=> import('./main/main.page').then(m => m.MainPage)},
  // Ruta para la lista de productos
  {
    path: 'product-list',
    loadComponent: () => import('./product-list/product-list.page').then( m => m.ProductListPage)
  },
  // Ruta de fallback para manejar rutas no existentes
  { path: '**', redirectTo: '' }

];

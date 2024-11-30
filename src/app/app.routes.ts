import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Ruta predeterminada
  { path: '', redirectTo: 'login', pathMatch: 'full' },

   // Ruta para la página de login
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  
  // Ruta para la lista de productos
  { 
    path: 'product-list', 
    loadComponent: () => import('./product-list/product-list.page').then(m => m.ProductListPage), 
    canActivate: [AuthGuard],  // Asegúrate de que el guardia de autenticación se use correctamente
  },
  
  // Ruta de fallback para manejar rutas no existentes
  { path: '**', redirectTo: 'login' },  // Opcional: redirige a 'login' si no existe la ruta
];
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface User {
  id?: string; // MockAPI asigna un ID automáticamente
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = '/mockapi/v1/usuarios';
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

  // Obtener el estado de autenticación
  isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  // Registrar un nuevo usuario
  async register(user: User): Promise<void> {
    try {
      await firstValueFrom(this.http.post<User>(this.apiUrl, user));
      this.router.navigate(['/login']); // Redirige al login tras el registro
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw error;
    }
  }

  // Iniciar sesión
  async login(email: string, password: string): Promise<void> {
    try {
      //const url = `${this.apiUrl}?email=${email}&password=${password}`;
      const url = `/mockapi/v1/usuarios?email=${email}&password=${password}`;
      console.log('Request URL:', url); // Verifica la URL generada
      const users = await firstValueFrom(this.http.get<User[]>(url));
  
      // Si se encuentran usuarios
      if (users && users.length > 0) {
        this.loggedIn.next(true);
        localStorage.setItem('user', JSON.stringify(users[0])); // Guarda el usuario en el localStorage
        this.router.navigate(['/product-list']); // Redirige al dashboard tras iniciar sesión
      } else {
        throw new Error('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  }
  

  // Cerrar sesión
  logout(): void {
    this.loggedIn.next(false);
    localStorage.removeItem('user'); // Elimina el usuario del localStorage
    this.router.navigate(['/login']);
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    return !!user; // Retorna true si hay un usuario almacenado, false de lo contrario
  }

  // Verificar si hay un usuario autenticado al cargar la app
  checkAuthentication(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
  }
}

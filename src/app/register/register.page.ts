import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule],
})
export class RegisterPage {
  nombre = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {}

  // Función para registrar el nuevo usuario
  async register() {
    // Validación de los campos
    if (!this.nombre || !this.email || !this.password) {
      const alert = await this.alertController.create({
        header: 'Campos incompletos',
        message: 'Por favor completa todos los campos.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    // Crear el objeto de usuario
    const user: User = {
      nombre: this.nombre,  // Asignar el nombre
      email: this.email,    // Asignar el email
      password: this.password // Asignar la contraseña
    };

    try {
      // Llamar al servicio de autenticación para registrar el usuario
      await this.authService.register(user);
      const alert = await this.alertController.create({
        header: 'Registro exitoso',
        message: 'Usuario registrado correctamente. Por favor, inicia sesión.',
        buttons: ['OK']
      });
      await alert.present();
      this.router.navigate(['/login']);
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo registrar el usuario. Inténtalo nuevamente.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonTitle, IonToolbar, IonGrid, IonCard, IonRow, IonCol, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonThumbnail, IonListHeader, AlertController, IonButton, IonIcon, IonFab, IonFabButton, IonModal } from '@ionic/angular/standalone';
import { Product, ProductsService } from '../services/products.service';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { add } from 'ionicons/icons';
import { ModalController } from '@ionic/angular';
import { ProductDetailModalComponent } from '../components/product-detail-modal/product-detail-modal.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Storage } from '@capacitor/storage';
import { isPlatform } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonTitle, IonToolbar, IonGrid, IonCard, IonRow, IonCol, CommonModule, FormsModule, IonButtons, IonMenuButton, IonList, IonItem, IonLabel, IonThumbnail, IonListHeader, IonButton, IonIcon, IonFab, IonFabButton, IonModal, ProductDetailModalComponent],
  providers: [ModalController],
})
export class ProductListPage implements OnInit {
  products: Product[] = [];
  isModalOpen = false;
  currentProduct: Product | null = null;
  productImage: string | null = null;

  productsService = inject(ProductsService);
  alertController = inject(AlertController);
  modalController = inject(ModalController);
  authService = inject(AuthService);
  router = inject(Router);

  // Modal controlador
  modal: HTMLIonModalElement | null = null;

  async ngOnInit() {
    addIcons({ add });
  
    // Cargar los productos desde el almacenamiento local
    //const storedProducts = await this.loadProductsFromStorage();
    //if (storedProducts.length > 0) {
    //  this.products = storedProducts;
    //} else {
      // Si no hay productos guardados, obténlos desde el servicio o servidor
     // const response = await this.productsService.getAll();
     // this.products = response.results;
    //}
  //}

  // Cargar los productos desde la API
  const response = await this.productsService.getAll();
  this.products = response.results;
}
  
  // Función para cargar productos desde el almacenamiento local
  async loadProductsFromStorage(): Promise<Product[]> {
    const keys = await Storage.keys(); // Obtener todas las claves del almacenamiento local
    const products: Product[] = [];
  
    // Recorrer todas las claves y cargar los productos
    for (const key of keys.keys) {
      if (key.startsWith('product_')) {
        const { value } = await Storage.get({ key });
        if (value) {
          products.push(JSON.parse(value)); // Convertir el valor de JSON a objeto
        }
      }
    }
  
    return products;
  }
  

  async viewProduct(product: Product) {
    // Crear y presentar el modal
    const modal = await this.modalController.create({
      component: ProductDetailModalComponent,
      componentProps: { product }  // Pasa el producto como prop
    });

    // Presenta el modal
    await modal.present();

    // Maneja la acción cuando el modal se cierre
    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('Modal cerrado', data);
    }
    if (data?.deletedProduct) {
      // Si se eliminó un producto, actualiza la lista
      this.products = this.products.filter(p => p.id !== data.deletedProduct.id);
      console.log('Producto eliminado:', data.deletedProduct);
    }
  }

  async addProduct() {
    const alert = await this.alertController.create({
      header: 'Agregar nuevo producto',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nombre del producto' },
        { name: 'description', type: 'textarea', placeholder: 'Descripción' },
        { name: 'price', type: 'number', placeholder: 'Precio' },
        { name: 'category', type: 'text', placeholder: 'Categoría' },
        { 
          name: 'image', 
          type: 'text', 
          placeholder: 'Ruta de la imagen', 
          value: this.productImage || 'assets/polera.webp' 
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            return true; // Permite cerrar el alerta.
          },
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            // Validación de los campos requeridos
            if (!data.name || !data.price || !data.category) {
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Por favor completa todos los campos obligatorios.',
                buttons: ['OK'],
              });
              await errorAlert.present();
              return false; // Mantén el alerta abierto.
            }
  
            // Crear un nuevo producto con los datos del formulario
            const newProduct: Product = {
              id: '', // Esto lo maneja la API
              name: data.name,
              description: data.description,
              price: parseFloat(data.price),
              category: data.category,
              image: data.image, // Usamos la imagen proporcionada por el usuario
              active: true, // Marcado como activo por defecto
            };
  
            try {
              // Llamar al servicio para crear el producto
              const createdProduct = await this.productsService.createProduct(newProduct);
              console.log('Producto creado:', createdProduct);
              // Si la creación fue exitosa, añade el producto a la lista
              this.products.unshift(createdProduct);
            } catch (error) {
              console.error('Error al crear el producto:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Hubo un problema al crear el producto. Intenta nuevamente.',
                buttons: ['OK'],
              });
              await errorAlert.present();
            }
  
            return true; // Cierra el alerta
          },
        },
      ],
    });
  
    await alert.present();
  }

  async deleteProduct(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            // Eliminar del almacenamiento local
            await Storage.remove({ key: 'product_' + id });
  
            // Eliminar del servidor o base de datos
            try {
              await this.productsService.deleteProduct(id);
              console.log('Producto eliminado del servidor');
              // Eliminar de la lista local
              this.products = this.products.filter(product => product.id !== id);
            } catch (error) {
              console.error('Error al eliminar el producto del servidor:', error);
              const errorAlert = await this.alertController.create({
                header: 'Error',
                message: 'Hubo un problema al eliminar el producto. Intenta nuevamente.',
                buttons: ['OK'],
              });
              await errorAlert.present();
            }
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  async editProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Editar producto',
      inputs: [
        { name: 'name', type: 'textarea', placeholder: 'Nombre', value: product.name },
        { name: 'description', type: 'textarea', placeholder: 'Descripción', value: product.description },
        { name: 'price', type: 'number', placeholder: 'Precio', value: product.price },
        { name: 'category', type: 'text', placeholder: 'Categoría', value: product.category },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            const updatedProduct = { ...product, ...data };
  
            // Actualizar el producto en el almacenamiento local
            await Storage.set({
              key: 'product_' + updatedProduct.id,
              value: JSON.stringify(updatedProduct),
            });
  
            // Actualizar el producto en la lista de productos
            this.products = this.products.map(p => p.id === product.id ? updatedProduct : p);
          },
        },
      ],
    });
  
    await alert.present();
  }
  
  trackByProductId(index: number, product: Product) {
    return product.id;
  }

  async openEditProductModal(product: Product) {
    const modal = await this.modalController.create({
      component: ProductDetailModalComponent,
      componentProps: { product: product }, // Pasa el producto al modal
    });
  
    // Escuchar el evento edit
    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.editedProduct) {
        // Aquí puedes manejar la edición del producto
        const editedProduct = result.data.editedProduct;
        console.log('Producto editado:', editedProduct);
        // Aquí puedes actualizar el producto en la lista o hacer lo que sea necesario
      }
    });
  
    await modal.present();
  }

  // Método para cerrar sesión
  logout(): void {
    this.authService.logout();  // Llama al método logout del AuthService
    this.router.navigate(['/login']);  // Redirige al login
  }

  takePicture() {
    Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,  // Use URI to get the file path
      source: CameraSource.Camera,  // Use the camera to take the picture
    }).then((image) => {
      console.log('Imagen tomada:', image);
      // Ensure productImage is either a valid string or null
      this.productImage = image.webPath ?? null;  // Use null if image.webPath is undefined
    }).catch((err) => {
      console.error('Error al tomar la foto:', err);
    });
  }
}


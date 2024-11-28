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

  productsService = inject(ProductsService);
  alertController = inject(AlertController);
  modalController = inject(ModalController);

  // Modal controlador
  modal: HTMLIonModalElement | null = null;

  async ngOnInit() {
    // Registra los iconos, incluyendo el icono 'add' que utilizarás para el botón de agregar
    addIcons({ add });
    // Cargar los productos
    const response = await this.productsService.getAll();
    this.products = response.results;
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
      this.products = this.products.filter(p => p._id !== data.deletedProduct._id);
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
  
            // Selección de imagen (galería o cámara)
            let image: string | undefined;
            try {
              // Usamos Camera.getPhoto() para obtener la imagen de la cámara o la galería
              const imageResult = await Camera.getPhoto({
                quality: 100,
                source: CameraSource.Prompt, // Permite al usuario elegir entre la galería o la cámara
                correctOrientation: true,
                resultType: CameraResultType.DataUrl, // Obtiene la imagen como una URL en base64
              });
  
              image = imageResult.dataUrl; // Almacenamos la imagen en base64
            } catch (error) {
              console.error('Error al seleccionar imagen:', error);
              // Si no se selecciona imagen, asigna una predeterminada
              image = 'assets/default-image.png';
            }
  
            // Crear un nuevo producto con los datos del formulario y la imagen seleccionada
            const newProduct: Product = {
              _id: Date.now().toString(),
              name: data.name,
              description: data.description,
              price: parseFloat(data.price),
              category: data.category,
              image: image || 'assets/default-image.png', // Usar imagen seleccionada o predeterminada
              active: true, // Marcado como activo por defecto
            };
  
            // Guardar el producto utilizando el servicio
            const createdProduct = await this.productsService.createProduct(newProduct);
            this.products.unshift(createdProduct);  // Añadir el nuevo producto al inicio de la lista
  
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
            // Llamar al servicio para eliminar el producto
            await this.productsService.deleteProduct(id);
            // Actualizar la lista de productos en la vista
            this.products = this.products.filter(product => product._id !== id);
          }
        }
      ]
    });

    await alert.present();
  }

  async editProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Editar producto',
      inputs: [
        {
          name: 'name',
          type: 'textarea',
          placeholder: 'Nombre',
          value: product.name
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción',
          value: product.description
        },
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio',
          value: product.price
        },
        {
          name: 'category',
          type: 'text',
          placeholder: 'Categoría',
          value: product.category
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            const updatedProduct = { ...product, ...data };
            // Actualiza el producto en el servicio
            const updated = await this.productsService.updateProduct(updatedProduct);
            // Actualiza el producto en la lista
            this.products = this.products.map(p => p._id === product._id ? updated : p);
          }
        }
      ]
    });

    await alert.present();
  }

  trackByProductId(index: number, product: Product) {
    return product._id;
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
  
}


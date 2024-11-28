import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import {
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { Product } from '../../services/products.service';
import { EditProductModalComponent } from '../edit-product-modal/edit-product-modal.component';


@Component({
  selector: 'app-product-detail-modal',
  templateUrl: './product-detail-modal.component.html',
  styleUrls: ['./product-detail-modal.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonContent,
    IonToolbar,
    IonTitle,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonButtons,
  ],
})
export class ProductDetailModalComponent {
  @Input() product?: Product;
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();

  constructor(private modalController: ModalController) {
    addIcons({ close });
  }

  // Método para cerrar el modal
  close() {
    this.modalController.dismiss();
  }

   // Método para abrir el modal de edición
   async openEditModal() {
    const modal = await this.modalController.create({
      component: EditProductModalComponent,
      componentProps: {
        product: this.product,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data.data?.editedProduct) {
        // Cuando se recibe el producto editado, emítelo
        this.edit.emit(data.data.editedProduct);
      }
    });

    return await modal.present();
  }

  // Método para eliminar el producto
  deleteProduct() {
    this.delete.emit(this.product); // Emitimos el producto para eliminarlo
    this.modalController.dismiss({ deletedProduct: this.product });
  }
}

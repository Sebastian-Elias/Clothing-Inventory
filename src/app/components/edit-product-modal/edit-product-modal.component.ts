import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Product } from '../../services/products.service'; 
import { FormsModule } from '@angular/forms'; 
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonIcon,
  IonInput,
  IonTextarea,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-edit-product-modal',
  templateUrl: './edit-product-modal.component.html',
  styleUrls: ['./edit-product-modal.component.scss'],
  standalone: true, // Componente independiente
  imports: [
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButtons,
    IonIcon,
    IonInput,
    IonTextarea,
  ],
})
export class EditProductModalComponent {
  @Input() product: Product = {
    _id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    active: true,
  };
  @Output() updatedProduct = new EventEmitter<Product>();

  constructor(private modalController: ModalController) {}

  save() {
    if (this.product) {
      this.updatedProduct.emit(this.product);
      this.close();
    }
  }

  close() {
    this.modalController.dismiss();
  }
}


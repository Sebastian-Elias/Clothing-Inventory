import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  active: boolean;
}

type ApiResponse = { page: number, per_page: number, total: number, total_pages: number, results: Product[]}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  httpClient = inject(HttpClient);

  // Define la propiedad apiUrl para la URL base de la API
  private apiUrl = 'http://localhost:8100/api/products';

  // Método para obtener todos los productos
  getAll(): Promise<ApiResponse>{
    return firstValueFrom(
      this.httpClient.get<ApiResponse>(this.apiUrl)
    )
  }

  createProduct(newProduct: Product): Promise<Product> {
    return firstValueFrom(
      this.httpClient.post<Product>('http://localhost:8100/api/products', newProduct)
    );
  }
  

  // Método para eliminar un producto por su id
  deleteProduct(id: string): Promise<void> {
    return firstValueFrom(
      this.httpClient.delete<void>(`${this.apiUrl}/${id}`)
    );
  }

  // Nuevo método para actualizar un producto
  updateProduct(product: Product): Promise<Product> {
    return firstValueFrom(
      this.httpClient.put<Product>(`${this.apiUrl}/${product._id}`, product)
    );
  }
}

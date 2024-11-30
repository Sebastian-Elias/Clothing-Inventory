import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Product {
  id: string;
  _id?: string;
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
  private apiUrl = '/api/products';
  private api2Url = 'https://674929505801f51535932201.mockapi.io/api/v1/productos';
  // Método para obtener productos de MockAPI
  getProductsFromApi2(): Promise<Product[]> {
    return firstValueFrom(this.httpClient.get<Product[]>(this.api2Url));
  }

  // Puedes agregar métodos para crear, actualizar y eliminar de MockAPI si es necesario
  createProductInApi2(newProduct: Product): Promise<Product> {
    return firstValueFrom(this.httpClient.post<Product>(this.api2Url, newProduct));
  }


  // Método para obtener todos los productos
 // getAll(): Promise<ApiResponse>{
  //  return firstValueFrom(
  //    this.httpClient.get<ApiResponse>(this.apiUrl)
  //  )
  //}
  getAll(): Promise<ApiResponse> {
    return firstValueFrom(
      this.httpClient.get<ApiResponse>(this.apiUrl).pipe(
        map(response => {
          // Convertimos _id a id si es necesario
          const products = response.results.map(product => ({
            ...product,
            id: product._id || product.id // Usamos _id si existe, sino usamos id
          }));
          return { ...response, results: products }; // Actualizamos el resultado con la lista de productos mapeada
        })
      )
    );
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
      this.httpClient.put<Product>(`${this.apiUrl}/${product.id}`, product)
    );
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable, EMPTY, combineLatest, Subscription } from 'rxjs';
import { tap, catchError, startWith, count, flatMap, map, debounceTime, filter, mergeAll } from 'rxjs/operators';

import { Product } from '../product.interface';
import { ProductService } from '../product.service';
import { FavouriteService } from '../favourite.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  title: string = 'Products';
  selectedProduct: Product;
  products$: Observable<Product[]>;
  mostExpensiveProduct$: Observable<Product>;
  productsNumber$: Observable<number>;
  errorMessage;

  // Pagination
  pageSize = 5;
  start = 0;
  end = this.pageSize;
  currentPage = 1;
  productsToLoad = this.pageSize * 2; // Pour pagination serveur

  previousPage() {
    this.start -= this.pageSize;
    this.end -= this.pageSize;
    this.currentPage--;
    this.selectedProduct = null;
  }

  nextPage() {
    this.start += this.pageSize;
    this.end += this.pageSize;
    this.currentPage++;
    this.selectedProduct = null;
  }

  onSelect(product: Product) {
    this.selectedProduct = product;
    this.router.navigateByUrl('/products/' + product.id);
  }

  get favourites(): number {
    return this.favouriteService.getFavouritesNb();
  }

  constructor(
    private productService: ProductService,
    private favouriteService: FavouriteService,
    private router: Router) {
  }

  loadMore() {
    let take: number = this.productsToLoad;
    let skip: number = this.end;

    this.productService.initProducts(skip, take);
  }

  ngOnInit(): void {
    // Self url navigation will refresh the page ('Refresh List' button)
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    // Liste des produits
    this.products$ = this
                      .productService
                      .products$;

    // Nombre de produits
    this.productsNumber$ = this
                              .products$
                              .pipe(
                                map(product => product.length),
                                // mergeAll(),
                                // count(p => true),
                                startWith(0)
                              );
    // Produit le plus chere
    this.mostExpensiveProduct$ = this
                                  .productService
                                  .mostExpensiveProduct$;    
  }

  refresh() {
    this.productService.initProducts();
    this.router.navigateByUrl('/products'); // Self route navigation
  }  
}

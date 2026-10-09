import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';


export enum Relationship {
  Wife = 1,
  Husband = 2,
  Father = 3,
  Mother = 4,
  Son = 5,
  Daughter = 6,
  Brother = 7,
  Sister = 8,
  FatherInLaw = 9,
  MotherInLaw = 10,
  BrotherInLaw = 11,
  SisterInLaw = 12,
  Grandfather = 13,
  Grandmother = 14,
  Grandson = 15,
  Granddaughter = 16,
  Uncle = 17,
  Aunt = 18,
  Cousin = 19,
  Nephew = 20,
  Niece = 21,
  LegalGuardian = 22,
  Partner = 23
}

export function enumToDropdown<T extends object>(
  enumObj: T
): { id: number; name: string }[] {
  return Object.keys(enumObj)
    .filter(key => isNaN(Number(key))) // remove reverse numeric keys
    .map(key => ({
      id: (enumObj as any)[key],
      name: key
        .replace(/([A-Z])/g, ' $1')     // split camel case
        .replace(/^./, c => c.toUpperCase())
        .replace(' In Law', '-in-Law')  // fix formatting
    }));
}

@Injectable({
  providedIn: 'root'
})
export class APIService {

  baseUrl: string;

  private configUpdateSubject = new Subject<void>();
  configUpdate$ = this.configUpdateSubject.asObservable();

  private productList = new BehaviorSubject<any[]>([]);
  productList$ = this.productList.asObservable();
  
  constructor(private http: HttpClient) {
      this.baseUrl = environment.apiUrl;
      
  }

// get = (queryString: string, endpoint: string) => {
//   const token = localStorage.getItem('token'); // Make sure token is saved here
//     const headers = new HttpHeaders({
//       Authorization: `Bearer ${token}`
//     });
//   return this.http.get(`${this.baseUrl}/${endpoint}${queryString}`, { headers });

// }

  get = (queryString: string, endpoint: string) => this.http.get(`${this.baseUrl}/${endpoint}${queryString}`);

  post = (data: any, endpoint: string) => this.http.post(`${this.baseUrl}/${endpoint}`, data);

  put = (data: any, endpoint: string) => this.http.put(`${this.baseUrl}/${endpoint}`, data);

  patch = (data: any, endpoint: string) => this.http.patch(`${this.baseUrl}/${endpoint}`, data);

  delete = (endpoint: string) => this.http.delete(`${this.baseUrl}/${endpoint}`);

  edit = (userId: string, data: any) => this.http.put(`${this.baseUrl}/${userId}`, data);

  uploadFile = (file: any) => this.http.post(`${this.baseUrl}/upload/file`, file);
  uploadMultiFile = (file: any) => this.http.post(`${this.baseUrl}/upload/files`, file);

  // Shared product list update karna
  setProductList(data: any[]) {
    this.productList.next(data);
  }

  // Ek naya product list me add karna
  addToProductList(product: any) {
    const current = this.productList.value;
    this.productList.next([...current, product]);
  }
  
}

import { Injectable, inject } from '@angular/core';
import { APIService } from './api.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    access_token?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly api = inject(APIService);
  private readonly tokenKey = 'access_token';

  login(credentials: LoginCredentials) {
    return this.api.post<LoginResponse>(credentials, 'auth/login');
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  saveUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }


  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(this.tokenKey)?.trim());
  }

  logout = () => {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
  };
}

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loading = inject(LoadingService);
  const token = localStorage.getItem('access_token')?.trim();
 const skipLoading = request.url.endsWith('loan/user/calculator/calculate');

  if (!skipLoading) {
    loading.show();
  }

  const authenticatedRequest = token && !request.url.endsWith('/auth/login')
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

 return next(authenticatedRequest).pipe(
    finalize(() => {
      if (!skipLoading) {
        loading.hide();
      }
    })
  );
};

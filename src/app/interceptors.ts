import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router'
 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

import { AuthService } from './shared/auth.service'
 
@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
 
  constructor(
    private _inj: Injector,
    private _router: Router
  ) {}
 
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).do((event: HttpEvent<any>) => {}, (error: any) => {
      if (error instanceof HttpErrorResponse) {
        // Intercept 401s everywhere except for the login page where we already have messaging going on for that
        if( (error.status === 401) && (this._router.url != '/login') ) {
          this._inj.get(AuthService).showLoginRequiredModal.next(true)
        }
      }
    });
  }
}
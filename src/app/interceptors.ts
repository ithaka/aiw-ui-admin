import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
 
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

import { AuthService } from './shared/auth.service'
 
@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
 
  constructor(
    // public errorHandler : ErrorHandler,
    private _inj: Injector
  ) {}
 
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).do((event: HttpEvent<any>) => {}, (error: any) => {
      if (error instanceof HttpErrorResponse) {
        // this.errorHandler.handleError(err);
        console.error("caught you thief", error)
        if(error.status === 401) {
          this._inj.get(AuthService).showLoginRequiredModal.next(true)
        }
      }
    });
  }
}
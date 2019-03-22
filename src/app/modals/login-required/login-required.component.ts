import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { Locker } from 'angular2-locker'

import { AuthService } from './../../shared/auth.service'

@Component({
  selector: 'ang-login-required-modal',
  templateUrl: 'login-required.component.pug'
})
export class LoginRequiredModal implements OnInit {
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()
  private _storage: Locker

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private location: Location,
    locker: Locker
  ) { 
    this._storage = locker.useDriver(Locker.DRIVERS.LOCAL)
   }

  ngOnInit() {
  }

  /**
   * Set aside our current/intended path so the user can return
   */
  stashThenRoute(routeValue: string) {
    this._storage.set('stashedRoute', this.location.path(false));
    this._router.navigate([routeValue])
  }
}

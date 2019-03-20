import { Component, OnInit } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Locker } from 'angular2-locker'

import { AuthService, PrimaryUser, iPrimaryUser } from './../shared'

@Component({
  selector: 'ang-login-page',
  templateUrl: 'login-page.component.pug',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPage implements OnInit {
  private loginForm: FormGroup
  private formSubmitted: boolean = false
  private messages: {
    unauthorized?: boolean,
    serviceError?: boolean,
    lostPassword?: boolean
  } = {}
  private _storage: Locker

  constructor(
    _fb: FormBuilder,
    private _auth: AuthService,
    private _router: Router,
    locker: Locker
  ) {
    this._storage = locker.useDriver(Locker.DRIVERS.LOCAL)
    this.loginForm = _fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    })
  }

  ngOnInit() { }

  submitLogin(loginForm: FormGroup) {
    this.messages = {} // reset object that displays messages
    if (loginForm.invalid) { return }

    this._auth.login(loginForm.value.username, loginForm.value.password)
      .take(1)
      .subscribe((res) => {
        this._auth.resetIdleWatcher();
        this._auth.user = new PrimaryUser({
          email: res.email,
          firstname: res.firstname,
          lastname: res.lastname
        })
        let stashedRoute = this._storage.get('stashedRoute')
        if (stashedRoute && typeof(stashedRoute) == 'string') {
          // We do not want to navigate to the page we are already on
          if (stashedRoute.indexOf('login') > -1) {
            this._router.navigate(['/home']);
          } else {
            this._router.navigateByUrl(stashedRoute);
          }
          this._storage.remove('stashedRoute')
        } else {
          this._router.navigate(['/home']);
        }

      }, (err) => {
        switch (err.status) {
          case 401:
            this.messages.unauthorized = true
            break
          case 422:
            this.messages.lostPassword = true
          case 400: // we shouldn't let the client submit a request and get a 400
          case 500:
          default:
            this.messages.serviceError = true
            console.error(err)
        }
      })
  }
}
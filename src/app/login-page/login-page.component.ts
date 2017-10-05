import { Component, OnInit } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { Router } from '@angular/router'

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
    serviceError?: boolean
  } = {}

  constructor(
    _fb: FormBuilder,
    private _auth: AuthService,
    private _router: Router
  ) {
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
        this._router.navigate(['/home'])
      }, (err) => {
        switch (err.status) {
          case 401:
            this.messages.unauthorized = true
            break
          case 400: // we shouldn't let the client submit a request and get a 400
          case 500:
          default:
            this.messages.serviceError = true
            console.error(err)
        }
      })
  }
}
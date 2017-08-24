import { Component, OnInit } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

import { AuthService } from './../shared'

@Component({
  selector: 'ang-login-page',
  templateUrl: 'login-page.component.pug',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPage implements OnInit {
  private loginForm: FormGroup

  constructor(
    _fb: FormBuilder,
    private _auth: AuthService
  ) {
    this.loginForm = _fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    })
  }

  ngOnInit() { }

  submitLogin(loginForm: FormGroup) {
    console.log("value:", loginForm.value)
    this._auth.login(loginForm.value.username, loginForm.value.password)
      .take(1)
      .subscribe((res) => {
        console.log(res)
      }, (err) => {
        console.error(err)
      })
  }
}
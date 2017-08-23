import { Component, OnInit } from '@angular/core'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

@Component({
  selector: 'ang-login-page',
  templateUrl: 'login-page.component.pug',
  styleUrls: ['./login-page.component.scss']
})

export class LoginPage implements OnInit {
  private loginForm: FormGroup

  constructor(
    _fb: FormBuilder
  ) {
    this.loginForm = _fb.group({
      email: [null, Validators.required],
      password: [null, Validators.required]
    })
  }

  ngOnInit() { }

  submitLogin(loginForm: FormGroup) {

  }
}
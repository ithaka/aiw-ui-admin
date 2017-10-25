import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

import { PrimaryUser, AuthService } from './../shared'

@Component({
  selector: 'ang-institution-page',
  templateUrl: 'institution-page.component.pug',
  styleUrls: ['./institution-page.component.scss']
})

export class InstitutionPage implements OnInit {

  private institution: any = {};

  private manageInstForm: FormGroup
  private formSubmitted: boolean = false
  private messages: {
    unauthorized?: boolean,
    invalid?: boolean,
    serviceError?: boolean
  } = {}

  constructor(
    _fb: FormBuilder,
    private _auth: AuthService,
    private _router: Router
  ) {
    this.manageInstForm = _fb.group({
      pwd: [null, Validators.required],
      cpwd: [null, Validators.required],
      admin_name: [null, Validators.required],
      admin_email: [null, Validators.required],
      admin_phone: [null, Validators.required]
    })
  }

  ngOnInit() { 
    this.loadInstitutionDetails();
  }

  
  private loadInstitutionDetails(): void{
    this._auth.getInstitution().take(1)
      .subscribe( (res) => {
        this.institution = res

        // Setting form values
        this.manageInstForm.controls['pwd'].setValue(this.institution.institution.default_user_pwd)
        let contact = this.institution.institutionContact[0]
        if (contact) {
          this.manageInstForm.controls['admin_name'].setValue(contact.name)
          this.manageInstForm.controls['admin_email'].setValue(contact.email)
          this.manageInstForm.controls['admin_phone'].setValue(contact.phone)
        }
      }, (err) => {
        // this.messages.serviceError = true
      })
  }

  private updateInstitutionalDetails(): void{
    this.messages = {} // reset object that displays messages
    if (this.manageInstForm.invalid) {
      this.messages.invalid = true
      return
    }

    this._auth.updateInst(this.manageInstForm)
      .take(1)
      .subscribe((res) => {
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
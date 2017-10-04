import { Component, OnInit } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

import { AuthService, UsersService } from '../../shared'

@Component({
  selector: 'ang-register-modal',
  templateUrl: 'register-modal.component.pug'
})

export class RegisterModal implements OnInit {
  private emailRegExp: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

  private messages: {
    success?: boolean
  } = {}
  private invalidEmails: string[] = []
  private submitted: boolean = false

  // the institution's default password
  private password: string
  // the institution's id
  private institutionId: string
  // the portal the user will be given access to
  private portal: string

  private registerForm: FormGroup

  constructor(
    private activeModal: NgbActiveModal,
    private _users: UsersService,
    private _auth: AuthService,
    _fb: FormBuilder
  ) {
    this.registerForm = _fb.group({
      // init emails as empty array and run validators, along with custom validator
      //  rl-tag-input has an allowedTagsPattern property, but it wasn't working so I had to add custom validator
      emails: [[], Validators.compose([Validators.required, this.emailsValidator])],
      emailText: [null, Validators.required]
    })
  }

  ngOnInit() {
    this._auth.getInstitution().take(1).subscribe(
      (res) => {
        res.institution.
      }, (err) => {

      }
    )
  }

  /** 
   * Validates email against the same regex used on the server
   * @returns object with list of invalid emails
   */
  private emailsValidator(control: FormControl): any {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    let invalidEmails = []

    control.value.forEach(email => {
      if (!emailRe.test(email)) {
        invalidEmails.push(email)
      }
    })

    return invalidEmails.length > 0 ? { invalidEmails: invalidEmails } : null
  }

  /**
   * Handles submission of the registration form
   * @param value value of the registration form
   */
  private onSubmit(value: { emails: string[], emailText: string }): void {
    // tell the form that the user tried submitting the form
    this.submitted = true
    // don't go past this point if the form is not yet valid
    if (this.registerForm.invalid) { return }

    let users = []
    value.emails.forEach((email) => {
      users.push({
        email: email
      })
    })

    this._users.registerUsers(users)
      .take(1)
      .subscribe((res) => {
        console.log(res)
      }, (err) => {
        console.error(err)
      })
  }

  /**
   * Handles the output of the tag input when the tag is not allowed
   * @param email the email that is now allowed
   */
  private disallowTag(email: string): void {
    if (email != "" && this.invalidEmails.indexOf(email) < 0) {
      this.invalidEmails.push(email)
    }
  }

  private dismissEmailError(email: string): void {
    let loc = this.invalidEmails.indexOf(email)
    if (loc > -1) {
      this.invalidEmails.splice(loc, 1)
    }
  }
}
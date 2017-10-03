import { Component, OnInit } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

@Component({
  selector: 'ang-register-modal',
  templateUrl: 'register-modal.component.pug'
})

export class RegisterModal implements OnInit {
  private emailRegExp: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

  private messages: {
  } = {}
  private invalidEmails: string[] = []
  private submitted: boolean = false

  private registerForm: FormGroup

  constructor(
    private activeModal: NgbActiveModal,
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
  private onSubmit(value: any): void {
    console.log(value)
    // don't go past this point if the form is not yet valid
    if (this.registerForm.invalid) { console.log(this.messages); console.log(this.registerForm.controls['emails'].errors); return }

    this.submitted = true
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
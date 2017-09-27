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
    invalidEmails?: string[]
  } = {}

  private registerForm: FormGroup

  constructor(
    private activeModal: NgbActiveModal,
    _fb: FormBuilder
  ) {
    this.registerForm = _fb.group({
      // init emails as empty array and run validators, along with custom validator
      //  rl-tag-input has an allowedTagsPattern property, but it wasn't working so I had to add custom validator
      emails: [[], Validators.compose([Validators.required, Validators.minLength(1), this.emailsValidator])]
    })
  }

  ngOnInit() {
  }

  /** 
   * Validates email against the same regex used on the server
   * @returns error which should be assigned to the email input
   */
  private emailsValidator(control: FormControl): any {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    let error = null // will remain null if no error
    this.messages.invalidEmails = [] // set to empty array so it is up to date

    control.value.forEach(email => {
      if (emailRe.test(email)) {
        error = { 'emailListInvalid': true }
        this.messages.invalidEmails.push(email)
      }
    })

    return error
  }
}
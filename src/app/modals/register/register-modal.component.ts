import { Component, OnInit } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'
import { DatePipe } from '@angular/common'

import { AuthService, UsersService } from '../../shared'

@Component({
  selector: 'ang-register-modal',
  templateUrl: 'register-modal.component.pug'
})

export class RegisterModal implements OnInit {
  private emailRegExp: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

  private messages: {
    successfullyRegisteredUsers?: string[], // array of emails for successful registrations
    userRegistrationErrors?: { email: string, type: string }[], // the string array of emails for which there were errors
    serviceError?: boolean
  } = {}
  private invalidEmails: string[] = []
  private submitted: boolean = false

  // the institution's default password
  private password: string
  // the institution's id
  private institutionId: string

  private registerForm: FormGroup

  constructor(
    private activeModal: NgbActiveModal,
    private _users: UsersService,
    private _auth: AuthService,
    private _date: DatePipe,
    _fb: FormBuilder
  ) {
    this.registerForm = _fb.group({
      // init emails as empty array and run validators, along with custom validator
      //  rl-tag-input has an allowedTagsPattern property, but it wasn't working so I had to add custom validator
      emails: [[], Validators.compose([Validators.required, this.emailsValidator])]
    })
  }

  ngOnInit() {
    this._auth.getInstitution().take(1).subscribe(
      (res) => {
        this.institutionId = res.institution.id
        this.password = res.institution.default_user_pwd
      }, (err) => {
        console.error(err)
      }
    )
  }

  /**
   * Validates email against the same regex used on the server
   * @returns object with list of invalid emails
   */
  private emailsValidator(control: FormControl): any {
    let emailRe: RegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,16})+$/
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
  private onSubmit(value: { emails: string[] }): void {
    this.messages = {}
    // tell the form that the user tried submitting the form
    this.submitted = true
    // don't go past this point if the form is not yet valid
    if (this.registerForm.invalid) { return }

    let users = []
    value.emails.forEach((email) => {
      users.push({
        email: email,
        password: this.password
      })
    })

    this._users.registerUsers(users)
      .take(1)
      .subscribe((res) => {

        // go through each user and collate the data into number of successes and a list of failed emails to display
        res.users.forEach((user) => {
          if (!user.status) { // the registration failed
            if (!this.messages.userRegistrationErrors) { this.messages.userRegistrationErrors = [] }

            // unfortunately the only information returned by the service about the error is a string, so decide
            //  which error to show based on that string
            // the type is used to signal the i18n file which error to display
            if (user.accountStatus.indexOf("ERR_USER_EXISTS") > -1) {
              this.messages.userRegistrationErrors.push({ email: user.email, type: "ACCOUNT_ALREADY_EXISTS" })
            } else {
              this.messages.userRegistrationErrors.push({ email: user.email, type: "GENERIC_ERROR" })
            }
          } else {
            if (!this.messages.successfullyRegisteredUsers) { this.messages.successfullyRegisteredUsers = [] }
            this.messages.successfullyRegisteredUsers.push(user.email)

            // Contruct & push the new user object to users observable
            let newUser = {
              'active': user.profile['active'],
              'status': user.profile['active'] ? 'Active' : 'Archive',
              'createdate': this._date.transform( user.account['createTime'].replace(' ', 'T') ),
              'email': user.email,
              'institutionid': user.profile['institutionId'],
              'profileid': user.profile['profileId'],
              'roles': user.profile['roles'],
              'ssenabled': user.profile['ssEnabled'],
              'ssValue': user.profile['ssEnabled'] ? '<img src="/assets/img/checkMark.gif" class="tickIcon">' : '',
              'timelastaccessed': this._date.transform( user.profile['timeLastAccessed'].replace(' ', 'T') ),
              'userid': user.profile['userId']
            }

            this._users.updatedUser.next( newUser )
          }
        })

        // after successful registration, reset the form
        this.registerForm.controls['emails'].setValue([])
        this.submitted = false
      }, (err) => {
        console.error(err)
        this.messages.serviceError = true
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

  /**
   * Cycles through list of erred emails and removes the passed email
   * @param email the email for which the error was dismissed
   */
  private dismissEmailError(email: string): void {
    let loc = this.invalidEmails.indexOf(email)
    if (loc > -1) {
      this.invalidEmails.splice(loc, 1)
    }
  }
}

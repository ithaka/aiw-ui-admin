import { Component, OnInit, Input } from '@angular/core'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { formGroupNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name'
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms'

import { UserDetails, UserUpdate, UsersService } from '../../shared'

@Component({
  selector: 'ang-user-details-modal',
  templateUrl: 'user-details-modal.component.pug',
  styleUrls: ['./user-details-modal.component.scss']
})

export class UserDetailsModal implements OnInit {
  @Input() user: UserDetails
  @Input() name: string

  private permissionsForm: FormGroup
  private messages: {
    archiveError?: boolean,
    archiveSuccess?: boolean,
    permissionsError?: boolean,
    permissionsSuccess?: boolean
  } = {}
  private submitted: boolean

  constructor(
    private activeModal: NgbActiveModal,
    private _users: UsersService,
    _fb: FormBuilder
  ) {
    this.permissionsForm = _fb.group({
      ssEnabled: null,
      optInEmail: null,
      optInSurvey: null,
      ssAdmin: null,
      hasAdminPriv: null
    })
  }

  ngOnInit() { }

  private onSubmit(update: UserUpdate) {
    // reset all service messages
    this.messages = {}
    // tell the form that it's submitted
    this.submitted = true

    // the update object requires a user id in order to send it
    update.profileId = this.user.profileId
    if (this.permissionsForm.invalid) {
      return
    }

    this._users.updateUser(update.profileId, update)
      .take(1)
      .subscribe((res) => {
        this.messages.permissionsSuccess = true
      }, (err) => {
        console.error(err)
        this.messages.permissionsError = true
      })
  }

  /**
   * Makes the call to the service to archive the user and handles updating the ui accordingly
   */
  private archiveUser(): void {
    this._users.archiveUser(this.user.profileId, !this.user.archivedUser)
      .take(1)
      .subscribe((res) => {
        this.user.archivedUser = !this.user.archivedUser
      }, (err) => {
        console.error(err)
        this.messages.archiveError = true
      })
  }
}
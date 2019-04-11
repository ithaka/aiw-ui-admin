import { Component, OnInit, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'ang-lost-pwd-modal',
  templateUrl: 'lost-pwd.component.pug'
})
export class LostPwdModal implements OnInit {
  @Output()
  closeModal: EventEmitter<any> = new EventEmitter()

  constructor() {}

  ngOnInit() {}

  public proccedToArtstor(): void{
    window.open('https://library.artstor.org/', '_blank')
  }
}

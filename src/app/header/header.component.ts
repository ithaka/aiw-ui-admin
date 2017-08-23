import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'ang-main-header',
  templateUrl: 'header.component.pug',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  @Input() showUserPanel = true

  constructor() { }

  ngOnInit() { }
}
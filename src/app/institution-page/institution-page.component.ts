import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

import { AuthService } from './../shared'

@Component({
  selector: 'ang-institution-page',
  templateUrl: 'institution-page.component.pug',
  styleUrls: ['./institution-page.component.scss']
})

export class InstitutionPage implements OnInit {

  constructor(
    private _auth: AuthService,
    private _router: Router
  ) {

  }

  ngOnInit() { 
    this.loadInstitutionDetails();
  }

  
  private loadInstitutionDetails(): void{
    this._auth.getInstitution().subscribe( (res) => {
      console.log(res);
    });
  }

}
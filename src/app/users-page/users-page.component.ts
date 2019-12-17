import { Component, OnDestroy, OnInit, Renderer2, Inject, ComponentFactoryResolver } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table'
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Subscription } from 'rxjs/Subscription'
import { Angular2Csv } from 'angular2-csv/Angular2-csv'
import * as moment from 'moment'

import { AuthService, UsersService, UserDetails } from './../shared'
import { UserDetailsModal, RegisterModal } from './../modals'

import { DOCUMENT } from '@angular/platform-browser';
@Component({
  selector: 'ang-users-page',
  templateUrl: 'users-page.component.pug',
  styleUrls: ['./users-page.component.scss']
})

export class UsersPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []

  private messages: {
    unauthorized?: boolean,
    serviceError?: boolean
  } = {}
  private adminUser = this.getAdminUser( this._auth )
  private users:Array<any> = []
  private columns:Array<any> = [
    { title: 'Email', name: 'email', filtering: { filterString: '', placeholder: 'Filter by email', columnName: 'email' }, className: ['cell-cls'] },
    { title: 'Last Log-in Date', name: 'timelastaccessed', filtering: { filterString: '', placeholder: 'Filter by Last Login', columnName: 'timelastaccessed' }, className: ['cell-cls'] },
    { title: 'Status', name: 'status',  className: ['cell-cls'] },
    { title: 'Forum Access', name: 'ssValue', className: ['cell-cls'] }
  ]

  public rows:Array<any> = []

  public page:any = {
    page: 1,
    itemsPerPage: 100
  }
  public maxSize:number = 5
  public numPages:number = 1
  public length:number = 0

  public config:any = {
    paging: true,
    sorting: {columns: this.columns},
    className: ['table-striped', 'table-bordered']
  }

  public usersLoading:boolean = false;

  constructor(
    private _auth: AuthService,
    private _users: UsersService,
    private _modal: NgbModal,
    private _router: Router,
    private route: ActivatedRoute,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document
  ) {
    // if the user is requesting a user's details in the url, go ahead and open the user details modal
    if (this.route.snapshot.queryParams.user) {
      this._modal.open(UserDetailsModal)
    }
  }

  ngOnInit():void {
	    // Script needs to be initiated on init in order to run the the Feedback Widget
      const s = this.renderer2.createElement('script');
      const isLocal = process.env.ENV === "development";

      s.type = 'text/javascript';
      s.src = `${isLocal ? "http://localhost:4200" : ""}/fetch-widget/feedback.js`
      s.text = ``;
      this.renderer2.appendChild(this._document.body, s);
  
    this.loadUsers()
    
    // Subscribe for updatedUser to update the users list
    this._users.updatedUser.subscribe( (updatedUser) => {
      // If the user exists then update the user object else push the user object in users array
      let updated: boolean = false

      let matchedUser = this.users.find( user => (user.email === updatedUser.email) || (user.userid === updatedUser.userid) );

      if( matchedUser ){
        matchedUser.active = updatedUser.active
        matchedUser.status = updatedUser.status
        matchedUser.ssenabled = updatedUser.ssenabled
        matchedUser.ssValue = updatedUser.ssValue
        matchedUser.timelastaccessed = updatedUser.timelastaccessed

        updated = true
      }

      if(!updated){
        this.users.push(updatedUser)
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe()
    })
  }

  private loadUsers(): void{
    this.usersLoading = true

    this._users.getAllUsers().take(1).subscribe( (res) => {
      this.users = res
      this.length = this.users.length
      this.onChangeTable(this.config)

      this.messages.unauthorized = false
      this.messages.serviceError = false

      this.usersLoading = false
      
    }, (err) => {
      switch (err.status) {
        case 401:
          this.messages.unauthorized = true
          break
        default:
          this.messages.serviceError = true
          console.error(err)
      }

      this.usersLoading = false
    })
  }

  public changePage(page:any, data:Array<any> = this.users):Array<any> {
    let start = (page.page - 1) * page.itemsPerPage
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length
    return data.slice(start, end)
  }

  public changeSort(data:any, config:any):any {
    // back out if there is no sorting to be done
    if (!config.sorting) {
      return data
    }

    let columns: any[] = this.config.sorting.columns || []
    let columnName:string
    let sort:string

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort) {
        columnName = columns[i].name
        sort = columns[i].sort
      }
    }

    if (!columnName) {
      return data
    }

    // variable to determine whether to sort the column as a date or a simple type
    //  note if there's a place this is likely to fail, it could be here. moment falls back to the js Date functions
    //  in many cases, so it's possible that this mis-detects the date sorting (although altering the column name to
    //  something that doesn't pass this test should fix that)
    let isDate: boolean = false
    if (moment(data[0][columnName]).isValid()) {
      isDate = true
    }

    if (isDate) {
      // date sorting
      return data.sort((previous, current) => {
        if (moment(previous[columnName]).isAfter(moment(current[columnName]))) {
          return sort === 'desc' ? -1 : 1
        } else if (moment(previous[columnName]).isBefore(moment(current[columnName]))) {
          return sort === 'asc' ? -1 : 1
        }
        return 0
      })
    } else {
      // simple sorting
      return data.sort((previous, current) => {
        if (previous[columnName] > current[columnName]) {
          return sort === 'desc' ? -1 : 1
        } else if (previous[columnName] < current[columnName]) {
          return sort === 'asc' ? -1 : 1
        }
        return 0
      })
    }
  }

  public changeFilter(data:any, config:any):any {
    let filteredData:Array<any> = data
    this.columns.forEach((column:any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item:any) => {
          if (!item[column.name]) { return false } // some corrupted data exists so we'll basically filter it out
          return item[column.name].match(column.filtering.filterString)
        })
      }
    })

    if (!config.filtering) {
      return filteredData
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item:any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString))
    }

    let tempArray:Array<any> = []
    filteredData.forEach((item:any) => {
      let flag = false
      this.columns.forEach((column:any) => {
        if (item[column.name].toString().match(this.config.filtering.filterString)) {
          flag = true
        }
      })
      if (flag) {
        tempArray.push(item)
      }
    })
    filteredData = tempArray

    return filteredData
  }

  public getAdminUser(user) {
    this._auth.getInstitution().subscribe( res => {
      if(res){
        return this.adminUser = res.institution
      }
    })

    return this.adminUser
  }

  public onChangeTable(config:any, page:any = this.page):any {
    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering)
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting)
    }

    let filteredData = this.changeFilter(this.users, this.config)
    let sortedData = this.changeSort(filteredData, this.config)
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData
    this.length = sortedData.length

    this.numPages = Math.ceil(this.length / page.itemsPerPage)
  }

  public onCellClick(data: any): void {
    this._router.navigate([], { queryParams: { user: data.row.profileid } })
    // this uses the NgBootstrap modal service
    this._modal.open(UserDetailsModal)
  }

  private openRegisterModal(): void {
    this._modal.open(RegisterModal)
  }

  private exportCSV(type: string): void{
    let options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      useBom: true
    }

    let filteredData = this.changeFilter(this.users, this.config)

    let csvArray = []
    let headerRow = {
      'email': 'Email',
      'timelastaccessed': 'Last Log-in Date',
      'status': 'Status',
      'ssenabled': 'Forum Access'
    }
    csvArray.push(headerRow)

    for(let data of filteredData){
      let obj = {
        'email': data.email,
        'timelastaccessed': data.timelastaccessed,
        'status': data.status,
        'ssenabled': data.ssenabled
      }
      csvArray.push(obj)
    }

    new Angular2Csv(csvArray, 'institutional-users', options)
  }
}

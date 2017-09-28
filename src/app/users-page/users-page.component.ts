import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Subscription } from 'rxjs/Subscription'

import { AuthService, UsersService, UserDetails } from './../shared'
import { UserDetailsModal } from './../modals'

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
  private users:Array<any> = []
  private columns:Array<any> = [
    { title: 'Email', name: 'email', filtering: { filterString: '', placeholder: 'Filter by email', columnName: 'email' }, className: ['cell-cls'] },
    { title: 'Registration Date', name: 'createdate', filtering: { filterString: '', placeholder: 'Filter by Registration', columnName: 'createdate' }, className: ['cell-cls'] },
    { title: 'Last Log-in Date', name: 'timelastaccessed', filtering: { filterString: '', placeholder: 'Filter by Last Login', columnName: 'timelastaccessed' }, className: ['cell-cls'] },
    { title: 'Status', name: 'status', filtering: { filterString: '', placeholder: 'Filter by Status', columnName: 'status' }, className: ['cell-cls'] },
    { title: 'Shared Shelf Acces', name: 'ssValue', className: ['cell-cls'] }
  ]
  
  public rows:Array<any> = []

  public page:number = 1
  public itemsPerPage:number = 100
  public maxSize:number = 50
  public numPages:number = 1
  public length:number = 0

  public config:any = {
    paging: true,
    sorting: {columns: this.columns},
    className: ['table-striped', 'table-bordered']
  }

  constructor(
    private _auth: AuthService,
    private _users: UsersService,
    private _modal: NgbModal,
    private _router: Router,
    private route: ActivatedRoute
  ) {
    // if the user is requesting a user's details in the url, go ahead and open the user details modal
    if (this.route.snapshot.queryParams.user) {
      this._modal.open(UserDetailsModal)
    }
  }
  
  ngOnInit():void {
    this.loadUsers()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe()
    })
  }

  private loadUsers(): void{
    this._users.getAllUsers().subscribe( (res) => {
      if(res){
        this.users = res;
        this.length = this.users.length;
        this.onChangeTable(this.config);

        this.messages.unauthorized = false
        this.messages.serviceError = false
      }
    }, (err) => {
      switch (err.status) {
        case 401:
          this.messages.unauthorized = true
          break
        default:
          this.messages.serviceError = true
          console.error(err)
      }
    })
  }

  public changePage(page:any, data:Array<any> = this.users):Array<any> {
    let start = (page.page - 1) * page.itemsPerPage
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length
    return data.slice(start, end)
  }

  public changeSort(data:any, config:any):any {
    if (!config.sorting) {
      return data
    }

    let columns = this.config.sorting.columns || []
    let columnName:string = void 0
    let sort:string = void 0

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name
        sort = columns[i].sort
      }
    }

    if (!columnName) {
      return data
    }

    // simple sorting
    return data.sort((previous:any, current:any) => {
      if (previous[columnName] > current[columnName]) {
        return sort === 'desc' ? -1 : 1
      } else if (previous[columnName] < current[columnName]) {
        return sort === 'asc' ? -1 : 1
      }
      return 0
    })
  }

  public changeFilter(data:any, config:any):any {
    let filteredData:Array<any> = data
    this.columns.forEach((column:any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item:any) => {
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

  public onChangeTable(config:any, page:any = {page: this.page, itemsPerPage: this.itemsPerPage}):any {
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
  }

  public onCellClick(data: any): any {
    this._router.navigate([], { queryParams: { user: data.row.profileid } })
    // this uses the NgBootstrap modal service
    this._modal.open(UserDetailsModal)
  }
}
import { Component, OnInit } from '@angular/core'
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'

import { AuthService, UsersService, UserDetails } from './../shared'
import { UserDetailsModal } from './../modals'

@Component({
  selector: 'ang-users-page',
  templateUrl: 'users-page.component.pug',
  styleUrls: ['./users-page.component.scss']
})

export class UsersPage implements OnInit {
  private users: Array<any> = []
  private columns:Array<any> = [
    { title: 'Email', name: 'email', filtering: { filterString: '', placeholder: 'Filter by email' } },
    { title: 'Registration Date', name: 'createdate' },
    { title: 'Last Log-in Date', name: 'timelastaccessed' },
    { title: 'Shared Shelf Acces', name: 'ssenabled', filtering: {filterString: '', placeholder: 'Filter by SSA'}}
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
    filtering: {filterString: ''},
    className: ['table-striped', 'table-bordered']
  }

  constructor(
    private _auth: AuthService,
    private _users: UsersService,
    private _modal: NgbModal
  ) {
    
  }
  
  public ngOnInit():void {
    this.loadUsers()
  }

  private loadUsers(): void{
    this._users.getUsers().subscribe( (res) => {
      if(res){
        this.users = res
        this.length = this.users.length
        this.onChangeTable(this.config)
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

    // let filteredData = this.changeFilter(this.users, this.config)
    let sortedData = this.changeSort(this.users, this.config)
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData
    this.length = sortedData.length
  }

  public onCellClick(data: any): any {
    // this uses the NgBootstrap modal service
    let userModal = this._modal.open(UserDetailsModal)
    this._users.getUserDetails(data.row.profileid) // yes this profileId has a lowercase 'i'
      .take(1)
      .subscribe(
        (res) => {
          // inject the received user into the component's Input
          userModal.componentInstance.user = res
        },
        (err) => { console.error(err) }
      )
  }
}
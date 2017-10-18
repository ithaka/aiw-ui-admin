import { Routes } from '@angular/router'

import { HomeComponent } from './home'
import { LoginPage } from './login-page/login-page.component'
import { NoContentComponent } from './no-content'
import { SettingsPage } from './settings-page/settings-page.component'
import { UsersPage } from './users-page/users-page.component'
import { InstitutionPage } from './institution-page/institution-page.component'

import { DataResolver } from './app.resolver'
import { AuthService } from './shared'

export const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent, canActivate: [AuthService] },
  { path: 'login', component: LoginPage },
  { path: 'settings', component: SettingsPage, canActivate: [AuthService] },
  { path: 'users', component: UsersPage, canActivate: [AuthService] },
  { path: 'institution', component: InstitutionPage, canActivate: [AuthService] },
  { path: '**', component: NoContentComponent }
]
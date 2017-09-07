import { Routes } from '@angular/router'

import { HomeComponent } from './home'
import { LoginPage } from './login-page/login-page.component'
import { NoContentComponent } from './no-content'
import { RegisterPage } from './register-page/register-page.component'
import { SettingsPage } from './settings-page/settings-page.component'
import { UsersPage } from './users-page/users-page.component'
import { InstitutionPage } from './institution-page/institution-page.component'

import { DataResolver } from './app.resolver'
import { AuthService } from './shared'

export const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent, canActivate: [AuthService] },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'settings', component: SettingsPage },
  { path: 'users', component: UsersPage },
  { path: 'institution', component: InstitutionPage },
  { path: '**', component: NoContentComponent }
]
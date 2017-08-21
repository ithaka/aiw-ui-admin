import { Routes } from '@angular/router'
import { HomeComponent } from './home'
import { AboutComponent } from './about'
import { NoContentComponent } from './no-content'
import { RegisterPage } from './register-page/register-page.component'
import { SettingsPage } from './settings-page/settings-page.component'
import { UsersPage } from './users-page/users-page.component'

import { DataResolver } from './app.resolver'

export const ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterPage },
  { path: 'settings', component: SettingsPage },
  { path: 'users', component: UsersPage },
  { path: '**', component: NoContentComponent },
]

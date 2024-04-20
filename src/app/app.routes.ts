import { Routes } from '@angular/router';
import { HomePageComponent } from './components/pages/home-page/home-page.component';

/**
 * Contains the definition of the app routes in use and their target components
 *
 * @type {Routes}
 */
export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home'
    },
    {
        path: 'home',
        component: HomePageComponent
    },
    {
        path: 'home/:searchTerm',
        component: HomePageComponent
    }
];

import angular from 'angular';
import uirouter from 'angular-ui-router';

import routing from './routes';
import HomeController from './controllers/home.controller';

export default angular.module('app.home', [uirouter])
  .config(routing)
  .controller('HomeController', HomeController)
  .name;
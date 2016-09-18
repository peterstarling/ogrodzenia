import angular from 'angular';
import uirouter from 'angular-ui-router';
import API from '../../services/API';

import routing from './routes';

import GalleryListController from './controllers/gallery.list.controller';
import GalleryCreateController from './controllers/gallery.create.controller';

export default angular.module('app.gallery', [uirouter, API])
  .config(routing)
  .controller('GalleryListController', GalleryListController)
  .controller('GalleryCreateController', GalleryCreateController)
  .name;
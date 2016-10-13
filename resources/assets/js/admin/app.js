import angular from 'angular';
import routing from './config/routing';
import http from './config/http';

import HomeModule from './modules/home/';
import GalleryModule from './modules/gallery/'

var modules = [HomeModule, GalleryModule];

var app = angular
    .module('app', modules)
    .config(routing)
    .config(http);


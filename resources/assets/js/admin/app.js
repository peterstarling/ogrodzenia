import angular from 'angular';
import routing from './config/routing';

import HomeModule from './modules/home/';
import GalleryModule from './modules/gallery/'

var modules = [HomeModule, GalleryModule];

var app = angular
    .module('app', modules)
    .config(routing);


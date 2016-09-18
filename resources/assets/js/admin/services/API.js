import angular from 'angular';
import ngResource from 'angular-resource';

class API {

	constructor($resource) {

		const resources = {};
		const url = 'http://ogrodzenia.dev/api'


		resources.gallery = $resource(url + '/gallery/:id');

		return resources;
  	}

}

export default angular.module('services.API', [ngResource])
  .service('API', API)
  .name;
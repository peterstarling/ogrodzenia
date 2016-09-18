// import API from '../../../services/API';

export default class GalleryListController {

    constructor(API) {
        this.message = 'helloooo';

        API.gallery.query().$promise.then(function (response) {
        	console.log(response);
        });
    }

}

GalleryListController.$inject = ['API'];

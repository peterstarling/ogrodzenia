// import API from '../../../services/API';

export default class GalleryListController {

    constructor(API) {
        this.message = 'helloooo';

        API.gallery.get().$promise.then(function (response) {
        	console.log(response.data);
        });
    }

}

GalleryListController.$inject = ['API'];

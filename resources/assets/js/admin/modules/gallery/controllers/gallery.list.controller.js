export default class GalleryListController {

	galleries = [];

    constructor(API) {
        this.message = 'helloooo';

        API.gallery.get().$promise.then((response) => {
        	this.galleries = response.data;
        });
    }

}
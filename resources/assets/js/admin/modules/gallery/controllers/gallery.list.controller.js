export default class GalleryListController {

	galleries = [];

    newGallery = {};

    constructor(API) {
    	this.API = API;

    	this.loadGallery();
    }

    loadGallery() {
    	this.API.gallery.get().$promise.then((response) => {
        	this.galleries = response.data;
        });
    }

    onSubmitNew() {
        console.log('yo');
        this.API.gallery.save({}, this.newGallery).$promise.then((response) => {
            this.loadGallery();
            this.newGallery = {};
        });
    }

    onDeleteGallery(galleryId)
    {
        this.API.gallery.delete({id: galleryId}).$promise.then((response) => {
            this.loadGallery();
        });
    }
}
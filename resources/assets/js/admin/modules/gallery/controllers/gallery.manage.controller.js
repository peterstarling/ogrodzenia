export default class GalleryManageController {
	gallery = {}
	files = []
	title = ''
	progress = null
	
    constructor(API, Upload, $stateParams) {
    	this.API = API;
    	this.loadGallery($stateParams.gallery_id);
    	this.Upload = Upload;
    }

    loadGallery(galleryId) {
    	this.API.gallery.get({id: galleryId}).$promise.then((response) => {
    		this.gallery = response.data;
    	});
    }

    onSubmitPhoto() {
    	this.Upload.upload({
            url: `${window.api_url}/gallery/${this.gallery.id}/photos` ,
            data: {photo: this.file, 'title': this.title},
            headers: {Authorization: `Bearer: ${window.access_token}`}
        }).then((resp) => {
            console.log('Success ' + resp.config.data.photo.name + 'uploaded. Response: ' + resp.data);
            this.file = null;
            this.progress = null;
            this.title = null;
            this.loadGallery(this.gallery.id);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, (evt) => {
            this.progress = parseInt(100.0 * evt.loaded / evt.total);
        });
    }

    onSetDefaultPhoto(photoId) {
    	this.API.gallery.update({id:this.gallery.id}, {default_photo:photoId}).$promise
    	.then((response) => {
    		this.loadGallery(this.gallery.id);
    	});
    }

    onDeletePhoto(photoId) {
    	this.API.photos.delete({galleryId:this.gallery.id, photoId:photoId}).$promise
    	.then((response) => {
    		this.loadGallery(this.gallery.id);
    	});
    }
}

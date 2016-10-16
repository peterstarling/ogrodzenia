routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
	const galleryAbstractState = {
		abstract: true,
		name: 'gallery',
		url: '/gallery',
		'template': '<ui-view></ui-view>'
	};

	$stateProvider.state(galleryAbstractState);
  	
  $stateProvider.state({
  	name: 'gallery.list',
  	parent: galleryAbstractState,
  	url: '/list',
  	template: require('./views/gallery.list.html'),
  	controller: 'GalleryListController',
  	controllerAs: '$controller'
	});

	$stateProvider.state({
  	name: 'gallery.create',
  	parent: galleryAbstractState,
  	url: '/create',
  	template: require('./views/gallery.create.html'),
  	controller: 'GalleryCreateController',
  	controllerAs: '$controller'
	});

  $stateProvider.state({
    name: 'gallery.manage',
    parent: galleryAbstractState,
    url: '/manage/{gallery_id}',
    template: require('./views/gallery.manage.html'),
    controller: 'GalleryManageController',
    controllerAs: '$controller'
  })
}
routes.$inject = ['$stateProvider'];

export default function routes($stateProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      template: require('./views/home.html'),
      controller: 'HomeController',
      controllerAs: 'home'
    });
}
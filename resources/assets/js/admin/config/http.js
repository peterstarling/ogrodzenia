http.$inject = ['$httpProvider'];

export default function http($httpProvider) {
	$httpProvider.interceptors.push(() => {
		return {
			'request': function(config) {
		    	config.headers.Authorization = 'Bearer: ' + window.access_token;

		    	return config;
		    }
		}
	});
}
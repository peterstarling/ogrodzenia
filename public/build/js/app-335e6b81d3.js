(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @license AngularJS v1.5.8
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular) {'use strict';

var $resourceMinErr = angular.$$minErr('$resource');

// Helper functions and regex to lookup a dotted path on an object
// stopping at undefined/null.  The path must be composed of ASCII
// identifiers (just like $parse)
var MEMBER_NAME_REGEX = /^(\.[a-zA-Z_$@][0-9a-zA-Z_$@]*)+$/;

function isValidDottedPath(path) {
  return (path != null && path !== '' && path !== 'hasOwnProperty' &&
      MEMBER_NAME_REGEX.test('.' + path));
}

function lookupDottedPath(obj, path) {
  if (!isValidDottedPath(path)) {
    throw $resourceMinErr('badmember', 'Dotted member path "@{0}" is invalid.', path);
  }
  var keys = path.split('.');
  for (var i = 0, ii = keys.length; i < ii && angular.isDefined(obj); i++) {
    var key = keys[i];
    obj = (obj !== null) ? obj[key] : undefined;
  }
  return obj;
}

/**
 * Create a shallow copy of an object and clear other fields from the destination
 */
function shallowClearAndCopy(src, dst) {
  dst = dst || {};

  angular.forEach(dst, function(value, key) {
    delete dst[key];
  });

  for (var key in src) {
    if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
      dst[key] = src[key];
    }
  }

  return dst;
}

/**
 * @ngdoc module
 * @name ngResource
 * @description
 *
 * # ngResource
 *
 * The `ngResource` module provides interaction support with RESTful services
 * via the $resource service.
 *
 *
 * <div doc-module-components="ngResource"></div>
 *
 * See {@link ngResource.$resourceProvider} and {@link ngResource.$resource} for usage.
 */

/**
 * @ngdoc provider
 * @name $resourceProvider
 *
 * @description
 *
 * Use `$resourceProvider` to change the default behavior of the {@link ngResource.$resource}
 * service.
 *
 * ## Dependencies
 * Requires the {@link ngResource } module to be installed.
 *
 */

/**
 * @ngdoc service
 * @name $resource
 * @requires $http
 * @requires ng.$log
 * @requires $q
 * @requires ng.$timeout
 *
 * @description
 * A factory which creates a resource object that lets you interact with
 * [RESTful](http://en.wikipedia.org/wiki/Representational_State_Transfer) server-side data sources.
 *
 * The returned resource object has action methods which provide high-level behaviors without
 * the need to interact with the low level {@link ng.$http $http} service.
 *
 * Requires the {@link ngResource `ngResource`} module to be installed.
 *
 * By default, trailing slashes will be stripped from the calculated URLs,
 * which can pose problems with server backends that do not expect that
 * behavior.  This can be disabled by configuring the `$resourceProvider` like
 * this:
 *
 * ```js
     app.config(['$resourceProvider', function($resourceProvider) {
       // Don't strip trailing slashes from calculated URLs
       $resourceProvider.defaults.stripTrailingSlashes = false;
     }]);
 * ```
 *
 * @param {string} url A parameterized URL template with parameters prefixed by `:` as in
 *   `/user/:username`. If you are using a URL with a port number (e.g.
 *   `http://example.com:8080/api`), it will be respected.
 *
 *   If you are using a url with a suffix, just add the suffix, like this:
 *   `$resource('http://example.com/resource.json')` or `$resource('http://example.com/:id.json')`
 *   or even `$resource('http://example.com/resource/:resource_id.:format')`
 *   If the parameter before the suffix is empty, :resource_id in this case, then the `/.` will be
 *   collapsed down to a single `.`.  If you need this sequence to appear and not collapse then you
 *   can escape it with `/\.`.
 *
 * @param {Object=} paramDefaults Default values for `url` parameters. These can be overridden in
 *   `actions` methods. If a parameter value is a function, it will be called every time
 *   a param value needs to be obtained for a request (unless the param was overridden). The function
 *   will be passed the current data value as an argument.
 *
 *   Each key value in the parameter object is first bound to url template if present and then any
 *   excess keys are appended to the url search query after the `?`.
 *
 *   Given a template `/path/:verb` and parameter `{verb:'greet', salutation:'Hello'}` results in
 *   URL `/path/greet?salutation=Hello`.
 *
 *   If the parameter value is prefixed with `@`, then the value for that parameter will be
 *   extracted from the corresponding property on the `data` object (provided when calling a
 *   "non-GET" action method).
 *   For example, if the `defaultParam` object is `{someParam: '@someProp'}` then the value of
 *   `someParam` will be `data.someProp`.
 *   Note that the parameter will be ignored, when calling a "GET" action method (i.e. an action
 *   method that does not accept a request body)
 *
 * @param {Object.<Object>=} actions Hash with declaration of custom actions that should extend
 *   the default set of resource actions. The declaration should be created in the format of {@link
 *   ng.$http#usage $http.config}:
 *
 *       {action1: {method:?, params:?, isArray:?, headers:?, ...},
 *        action2: {method:?, params:?, isArray:?, headers:?, ...},
 *        ...}
 *
 *   Where:
 *
 *   - **`action`** – {string} – The name of action. This name becomes the name of the method on
 *     your resource object.
 *   - **`method`** – {string} – Case insensitive HTTP method (e.g. `GET`, `POST`, `PUT`,
 *     `DELETE`, `JSONP`, etc).
 *   - **`params`** – {Object=} – Optional set of pre-bound parameters for this action. If any of
 *     the parameter value is a function, it will be called every time when a param value needs to
 *     be obtained for a request (unless the param was overridden). The function will be passed the
 *     current data value as an argument.
 *   - **`url`** – {string} – action specific `url` override. The url templating is supported just
 *     like for the resource-level urls.
 *   - **`isArray`** – {boolean=} – If true then the returned object for this action is an array,
 *     see `returns` section.
 *   - **`transformRequest`** –
 *     `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     request body and headers and returns its transformed (typically serialized) version.
 *     By default, transformRequest will contain one function that checks if the request data is
 *     an object and serializes to using `angular.toJson`. To prevent this behavior, set
 *     `transformRequest` to an empty array: `transformRequest: []`
 *   - **`transformResponse`** –
 *     `{function(data, headersGetter)|Array.<function(data, headersGetter)>}` –
 *     transform function or an array of such functions. The transform function takes the http
 *     response body and headers and returns its transformed (typically deserialized) version.
 *     By default, transformResponse will contain one function that checks if the response looks
 *     like a JSON string and deserializes it using `angular.fromJson`. To prevent this behavior,
 *     set `transformResponse` to an empty array: `transformResponse: []`
 *   - **`cache`** – `{boolean|Cache}` – If true, a default $http cache will be used to cache the
 *     GET request, otherwise if a cache instance built with
 *     {@link ng.$cacheFactory $cacheFactory}, this cache will be used for
 *     caching.
 *   - **`timeout`** – `{number}` – timeout in milliseconds.<br />
 *     **Note:** In contrast to {@link ng.$http#usage $http.config}, {@link ng.$q promises} are
 *     **not** supported in $resource, because the same value would be used for multiple requests.
 *     If you are looking for a way to cancel requests, you should use the `cancellable` option.
 *   - **`cancellable`** – `{boolean}` – if set to true, the request made by a "non-instance" call
 *     will be cancelled (if not already completed) by calling `$cancelRequest()` on the call's
 *     return value. Calling `$cancelRequest()` for a non-cancellable or an already
 *     completed/cancelled request will have no effect.<br />
 *   - **`withCredentials`** - `{boolean}` - whether to set the `withCredentials` flag on the
 *     XHR object. See
 *     [requests with credentials](https://developer.mozilla.org/en/http_access_control#section_5)
 *     for more information.
 *   - **`responseType`** - `{string}` - see
 *     [requestType](https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#responseType).
 *   - **`interceptor`** - `{Object=}` - The interceptor object has two optional methods -
 *     `response` and `responseError`. Both `response` and `responseError` interceptors get called
 *     with `http response` object. See {@link ng.$http $http interceptors}.
 *
 * @param {Object} options Hash with custom settings that should extend the
 *   default `$resourceProvider` behavior.  The supported options are:
 *
 *   - **`stripTrailingSlashes`** – {boolean} – If true then the trailing
 *   slashes from any calculated URL will be stripped. (Defaults to true.)
 *   - **`cancellable`** – {boolean} – If true, the request made by a "non-instance" call will be
 *   cancelled (if not already completed) by calling `$cancelRequest()` on the call's return value.
 *   This can be overwritten per action. (Defaults to false.)
 *
 * @returns {Object} A resource "class" object with methods for the default set of resource actions
 *   optionally extended with custom `actions`. The default set contains these actions:
 *   ```js
 *   { 'get':    {method:'GET'},
 *     'save':   {method:'POST'},
 *     'query':  {method:'GET', isArray:true},
 *     'remove': {method:'DELETE'},
 *     'delete': {method:'DELETE'} };
 *   ```
 *
 *   Calling these methods invoke an {@link ng.$http} with the specified http method,
 *   destination and parameters. When the data is returned from the server then the object is an
 *   instance of the resource class. The actions `save`, `remove` and `delete` are available on it
 *   as  methods with the `$` prefix. This allows you to easily perform CRUD operations (create,
 *   read, update, delete) on server-side data like this:
 *   ```js
 *   var User = $resource('/user/:userId', {userId:'@id'});
 *   var user = User.get({userId:123}, function() {
 *     user.abc = true;
 *     user.$save();
 *   });
 *   ```
 *
 *   It is important to realize that invoking a $resource object method immediately returns an
 *   empty reference (object or array depending on `isArray`). Once the data is returned from the
 *   server the existing reference is populated with the actual data. This is a useful trick since
 *   usually the resource is assigned to a model which is then rendered by the view. Having an empty
 *   object results in no rendering, once the data arrives from the server then the object is
 *   populated with the data and the view automatically re-renders itself showing the new data. This
 *   means that in most cases one never has to write a callback function for the action methods.
 *
 *   The action methods on the class object or instance object can be invoked with the following
 *   parameters:
 *
 *   - HTTP GET "class" actions: `Resource.action([parameters], [success], [error])`
 *   - non-GET "class" actions: `Resource.action([parameters], postData, [success], [error])`
 *   - non-GET instance actions:  `instance.$action([parameters], [success], [error])`
 *
 *
 *   Success callback is called with (value, responseHeaders) arguments, where the value is
 *   the populated resource instance or collection object. The error callback is called
 *   with (httpResponse) argument.
 *
 *   Class actions return empty instance (with additional properties below).
 *   Instance actions return promise of the action.
 *
 *   The Resource instances and collections have these additional properties:
 *
 *   - `$promise`: the {@link ng.$q promise} of the original server interaction that created this
 *     instance or collection.
 *
 *     On success, the promise is resolved with the same resource instance or collection object,
 *     updated with data from server. This makes it easy to use in
 *     {@link ngRoute.$routeProvider resolve section of $routeProvider.when()} to defer view
 *     rendering until the resource(s) are loaded.
 *
 *     On failure, the promise is rejected with the {@link ng.$http http response} object, without
 *     the `resource` property.
 *
 *     If an interceptor object was provided, the promise will instead be resolved with the value
 *     returned by the interceptor.
 *
 *   - `$resolved`: `true` after first server interaction is completed (either with success or
 *      rejection), `false` before that. Knowing if the Resource has been resolved is useful in
 *      data-binding.
 *
 *   The Resource instances and collections have these additional methods:
 *
 *   - `$cancelRequest`: If there is a cancellable, pending request related to the instance or
 *      collection, calling this method will abort the request.
 *
 *   The Resource instances have these additional methods:
 *
 *   - `toJSON`: It returns a simple object without any of the extra properties added as part of
 *     the Resource API. This object can be serialized through {@link angular.toJson} safely
 *     without attaching Angular-specific fields. Notice that `JSON.stringify` (and
 *     `angular.toJson`) automatically use this method when serializing a Resource instance
 *     (see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior)).
 *
 * @example
 *
 * # Credit card resource
 *
 * ```js
     // Define CreditCard class
     var CreditCard = $resource('/user/:userId/card/:cardId',
      {userId:123, cardId:'@id'}, {
       charge: {method:'POST', params:{charge:true}}
      });

     // We can retrieve a collection from the server
     var cards = CreditCard.query(function() {
       // GET: /user/123/card
       // server returns: [ {id:456, number:'1234', name:'Smith'} ];

       var card = cards[0];
       // each item is an instance of CreditCard
       expect(card instanceof CreditCard).toEqual(true);
       card.name = "J. Smith";
       // non GET methods are mapped onto the instances
       card.$save();
       // POST: /user/123/card/456 {id:456, number:'1234', name:'J. Smith'}
       // server returns: {id:456, number:'1234', name: 'J. Smith'};

       // our custom method is mapped as well.
       card.$charge({amount:9.99});
       // POST: /user/123/card/456?amount=9.99&charge=true {id:456, number:'1234', name:'J. Smith'}
     });

     // we can create an instance as well
     var newCard = new CreditCard({number:'0123'});
     newCard.name = "Mike Smith";
     newCard.$save();
     // POST: /user/123/card {number:'0123', name:'Mike Smith'}
     // server returns: {id:789, number:'0123', name: 'Mike Smith'};
     expect(newCard.id).toEqual(789);
 * ```
 *
 * The object returned from this function execution is a resource "class" which has "static" method
 * for each action in the definition.
 *
 * Calling these methods invoke `$http` on the `url` template with the given `method`, `params` and
 * `headers`.
 *
 * @example
 *
 * # User resource
 *
 * When the data is returned from the server then the object is an instance of the resource type and
 * all of the non-GET methods are available with `$` prefix. This allows you to easily support CRUD
 * operations (create, read, update, delete) on server-side data.

   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(user) {
       user.abc = true;
       user.$save();
     });
   ```
 *
 * It's worth noting that the success callback for `get`, `query` and other methods gets passed
 * in the response that came from the server as well as $http header getter function, so one
 * could rewrite the above example and get access to http headers as:
 *
   ```js
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123}, function(user, getResponseHeaders){
       user.abc = true;
       user.$save(function(user, putResponseHeaders) {
         //user => saved user object
         //putResponseHeaders => $http header getter
       });
     });
   ```
 *
 * You can also access the raw `$http` promise via the `$promise` property on the object returned
 *
   ```
     var User = $resource('/user/:userId', {userId:'@id'});
     User.get({userId:123})
         .$promise.then(function(user) {
           $scope.user = user;
         });
   ```
 *
 * @example
 *
 * # Creating a custom 'PUT' request
 *
 * In this example we create a custom method on our resource to make a PUT request
 * ```js
 *    var app = angular.module('app', ['ngResource', 'ngRoute']);
 *
 *    // Some APIs expect a PUT request in the format URL/object/ID
 *    // Here we are creating an 'update' method
 *    app.factory('Notes', ['$resource', function($resource) {
 *    return $resource('/notes/:id', null,
 *        {
 *            'update': { method:'PUT' }
 *        });
 *    }]);
 *
 *    // In our controller we get the ID from the URL using ngRoute and $routeParams
 *    // We pass in $routeParams and our Notes factory along with $scope
 *    app.controller('NotesCtrl', ['$scope', '$routeParams', 'Notes',
                                      function($scope, $routeParams, Notes) {
 *    // First get a note object from the factory
 *    var note = Notes.get({ id:$routeParams.id });
 *    $id = note.id;
 *
 *    // Now call update passing in the ID first then the object you are updating
 *    Notes.update({ id:$id }, note);
 *
 *    // This will PUT /notes/ID with the note object in the request payload
 *    }]);
 * ```
 *
 * @example
 *
 * # Cancelling requests
 *
 * If an action's configuration specifies that it is cancellable, you can cancel the request related
 * to an instance or collection (as long as it is a result of a "non-instance" call):
 *
   ```js
     // ...defining the `Hotel` resource...
     var Hotel = $resource('/api/hotel/:id', {id: '@id'}, {
       // Let's make the `query()` method cancellable
       query: {method: 'get', isArray: true, cancellable: true}
     });

     // ...somewhere in the PlanVacationController...
     ...
     this.onDestinationChanged = function onDestinationChanged(destination) {
       // We don't care about any pending request for hotels
       // in a different destination any more
       this.availableHotels.$cancelRequest();

       // Let's query for hotels in '<destination>'
       // (calls: /api/hotel?location=<destination>)
       this.availableHotels = Hotel.query({location: destination});
     };
   ```
 *
 */
angular.module('ngResource', ['ng']).
  provider('$resource', function() {
    var PROTOCOL_AND_DOMAIN_REGEX = /^https?:\/\/[^\/]*/;
    var provider = this;

    /**
     * @ngdoc property
     * @name $resourceProvider#defaults
     * @description
     * Object containing default options used when creating `$resource` instances.
     *
     * The default values satisfy a wide range of usecases, but you may choose to overwrite any of
     * them to further customize your instances. The available properties are:
     *
     * - **stripTrailingSlashes** – `{boolean}` – If true, then the trailing slashes from any
     *   calculated URL will be stripped.<br />
     *   (Defaults to true.)
     * - **cancellable** – `{boolean}` – If true, the request made by a "non-instance" call will be
     *   cancelled (if not already completed) by calling `$cancelRequest()` on the call's return
     *   value. For more details, see {@link ngResource.$resource}. This can be overwritten per
     *   resource class or action.<br />
     *   (Defaults to false.)
     * - **actions** - `{Object.<Object>}` - A hash with default actions declarations. Actions are
     *   high-level methods corresponding to RESTful actions/methods on resources. An action may
     *   specify what HTTP method to use, what URL to hit, if the return value will be a single
     *   object or a collection (array) of objects etc. For more details, see
     *   {@link ngResource.$resource}. The actions can also be enhanced or overwritten per resource
     *   class.<br />
     *   The default actions are:
     *   ```js
     *   {
     *     get: {method: 'GET'},
     *     save: {method: 'POST'},
     *     query: {method: 'GET', isArray: true},
     *     remove: {method: 'DELETE'},
     *     delete: {method: 'DELETE'}
     *   }
     *   ```
     *
     * #### Example
     *
     * For example, you can specify a new `update` action that uses the `PUT` HTTP verb:
     *
     * ```js
     *   angular.
     *     module('myApp').
     *     config(['resourceProvider', function ($resourceProvider) {
     *       $resourceProvider.defaults.actions.update = {
     *         method: 'PUT'
     *       };
     *     });
     * ```
     *
     * Or you can even overwrite the whole `actions` list and specify your own:
     *
     * ```js
     *   angular.
     *     module('myApp').
     *     config(['resourceProvider', function ($resourceProvider) {
     *       $resourceProvider.defaults.actions = {
     *         create: {method: 'POST'}
     *         get:    {method: 'GET'},
     *         getAll: {method: 'GET', isArray:true},
     *         update: {method: 'PUT'},
     *         delete: {method: 'DELETE'}
     *       };
     *     });
     * ```
     *
     */
    this.defaults = {
      // Strip slashes by default
      stripTrailingSlashes: true,

      // Make non-instance requests cancellable (via `$cancelRequest()`)
      cancellable: false,

      // Default actions configuration
      actions: {
        'get': {method: 'GET'},
        'save': {method: 'POST'},
        'query': {method: 'GET', isArray: true},
        'remove': {method: 'DELETE'},
        'delete': {method: 'DELETE'}
      }
    };

    this.$get = ['$http', '$log', '$q', '$timeout', function($http, $log, $q, $timeout) {

      var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction;

      /**
       * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
       * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set
       * (pchar) allowed in path segments:
       *    segment       = *pchar
       *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
       *    pct-encoded   = "%" HEXDIG HEXDIG
       *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
       *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
       *                     / "*" / "+" / "," / ";" / "="
       */
      function encodeUriSegment(val) {
        return encodeUriQuery(val, true).
          replace(/%26/gi, '&').
          replace(/%3D/gi, '=').
          replace(/%2B/gi, '+');
      }


      /**
       * This method is intended for encoding *key* or *value* parts of query component. We need a
       * custom method because encodeURIComponent is too aggressive and encodes stuff that doesn't
       * have to be encoded per http://tools.ietf.org/html/rfc3986:
       *    query       = *( pchar / "/" / "?" )
       *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
       *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
       *    pct-encoded   = "%" HEXDIG HEXDIG
       *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
       *                     / "*" / "+" / "," / ";" / "="
       */
      function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
          replace(/%40/gi, '@').
          replace(/%3A/gi, ':').
          replace(/%24/g, '$').
          replace(/%2C/gi, ',').
          replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
      }

      function Route(template, defaults) {
        this.template = template;
        this.defaults = extend({}, provider.defaults, defaults);
        this.urlParams = {};
      }

      Route.prototype = {
        setUrlParams: function(config, params, actionUrl) {
          var self = this,
            url = actionUrl || self.template,
            val,
            encodedVal,
            protocolAndDomain = '';

          var urlParams = self.urlParams = {};
          forEach(url.split(/\W/), function(param) {
            if (param === 'hasOwnProperty') {
              throw $resourceMinErr('badname', "hasOwnProperty is not a valid parameter name.");
            }
            if (!(new RegExp("^\\d+$").test(param)) && param &&
              (new RegExp("(^|[^\\\\]):" + param + "(\\W|$)").test(url))) {
              urlParams[param] = {
                isQueryParamValue: (new RegExp("\\?.*=:" + param + "(?:\\W|$)")).test(url)
              };
            }
          });
          url = url.replace(/\\:/g, ':');
          url = url.replace(PROTOCOL_AND_DOMAIN_REGEX, function(match) {
            protocolAndDomain = match;
            return '';
          });

          params = params || {};
          forEach(self.urlParams, function(paramInfo, urlParam) {
            val = params.hasOwnProperty(urlParam) ? params[urlParam] : self.defaults[urlParam];
            if (angular.isDefined(val) && val !== null) {
              if (paramInfo.isQueryParamValue) {
                encodedVal = encodeUriQuery(val, true);
              } else {
                encodedVal = encodeUriSegment(val);
              }
              url = url.replace(new RegExp(":" + urlParam + "(\\W|$)", "g"), function(match, p1) {
                return encodedVal + p1;
              });
            } else {
              url = url.replace(new RegExp("(\/?):" + urlParam + "(\\W|$)", "g"), function(match,
                  leadingSlashes, tail) {
                if (tail.charAt(0) == '/') {
                  return tail;
                } else {
                  return leadingSlashes + tail;
                }
              });
            }
          });

          // strip trailing slashes and set the url (unless this behavior is specifically disabled)
          if (self.defaults.stripTrailingSlashes) {
            url = url.replace(/\/+$/, '') || '/';
          }

          // then replace collapse `/.` if found in the last URL path segment before the query
          // E.g. `http://url.com/id./format?q=x` becomes `http://url.com/id.format?q=x`
          url = url.replace(/\/\.(?=\w+($|\?))/, '.');
          // replace escaped `/\.` with `/.`
          config.url = protocolAndDomain + url.replace(/\/\\\./, '/.');


          // set params - delegate param encoding to $http
          forEach(params, function(value, key) {
            if (!self.urlParams[key]) {
              config.params = config.params || {};
              config.params[key] = value;
            }
          });
        }
      };


      function resourceFactory(url, paramDefaults, actions, options) {
        var route = new Route(url, options);

        actions = extend({}, provider.defaults.actions, actions);

        function extractParams(data, actionParams) {
          var ids = {};
          actionParams = extend({}, paramDefaults, actionParams);
          forEach(actionParams, function(value, key) {
            if (isFunction(value)) { value = value(data); }
            ids[key] = value && value.charAt && value.charAt(0) == '@' ?
              lookupDottedPath(data, value.substr(1)) : value;
          });
          return ids;
        }

        function defaultResponseInterceptor(response) {
          return response.resource;
        }

        function Resource(value) {
          shallowClearAndCopy(value || {}, this);
        }

        Resource.prototype.toJSON = function() {
          var data = extend({}, this);
          delete data.$promise;
          delete data.$resolved;
          return data;
        };

        forEach(actions, function(action, name) {
          var hasBody = /^(POST|PUT|PATCH)$/i.test(action.method);
          var numericTimeout = action.timeout;
          var cancellable = angular.isDefined(action.cancellable) ? action.cancellable :
              (options && angular.isDefined(options.cancellable)) ? options.cancellable :
              provider.defaults.cancellable;

          if (numericTimeout && !angular.isNumber(numericTimeout)) {
            $log.debug('ngResource:\n' +
                       '  Only numeric values are allowed as `timeout`.\n' +
                       '  Promises are not supported in $resource, because the same value would ' +
                       'be used for multiple requests. If you are looking for a way to cancel ' +
                       'requests, you should use the `cancellable` option.');
            delete action.timeout;
            numericTimeout = null;
          }

          Resource[name] = function(a1, a2, a3, a4) {
            var params = {}, data, success, error;

            /* jshint -W086 */ /* (purposefully fall through case statements) */
            switch (arguments.length) {
              case 4:
                error = a4;
                success = a3;
              //fallthrough
              case 3:
              case 2:
                if (isFunction(a2)) {
                  if (isFunction(a1)) {
                    success = a1;
                    error = a2;
                    break;
                  }

                  success = a2;
                  error = a3;
                  //fallthrough
                } else {
                  params = a1;
                  data = a2;
                  success = a3;
                  break;
                }
              case 1:
                if (isFunction(a1)) success = a1;
                else if (hasBody) data = a1;
                else params = a1;
                break;
              case 0: break;
              default:
                throw $resourceMinErr('badargs',
                  "Expected up to 4 arguments [params, data, success, error], got {0} arguments",
                  arguments.length);
            }
            /* jshint +W086 */ /* (purposefully fall through case statements) */

            var isInstanceCall = this instanceof Resource;
            var value = isInstanceCall ? data : (action.isArray ? [] : new Resource(data));
            var httpConfig = {};
            var responseInterceptor = action.interceptor && action.interceptor.response ||
              defaultResponseInterceptor;
            var responseErrorInterceptor = action.interceptor && action.interceptor.responseError ||
              undefined;
            var timeoutDeferred;
            var numericTimeoutPromise;

            forEach(action, function(value, key) {
              switch (key) {
                default:
                  httpConfig[key] = copy(value);
                  break;
                case 'params':
                case 'isArray':
                case 'interceptor':
                case 'cancellable':
                  break;
              }
            });

            if (!isInstanceCall && cancellable) {
              timeoutDeferred = $q.defer();
              httpConfig.timeout = timeoutDeferred.promise;

              if (numericTimeout) {
                numericTimeoutPromise = $timeout(timeoutDeferred.resolve, numericTimeout);
              }
            }

            if (hasBody) httpConfig.data = data;
            route.setUrlParams(httpConfig,
              extend({}, extractParams(data, action.params || {}), params),
              action.url);

            var promise = $http(httpConfig).then(function(response) {
              var data = response.data;

              if (data) {
                // Need to convert action.isArray to boolean in case it is undefined
                // jshint -W018
                if (angular.isArray(data) !== (!!action.isArray)) {
                  throw $resourceMinErr('badcfg',
                      'Error in resource configuration for action `{0}`. Expected response to ' +
                      'contain an {1} but got an {2} (Request: {3} {4})', name, action.isArray ? 'array' : 'object',
                    angular.isArray(data) ? 'array' : 'object', httpConfig.method, httpConfig.url);
                }
                // jshint +W018
                if (action.isArray) {
                  value.length = 0;
                  forEach(data, function(item) {
                    if (typeof item === "object") {
                      value.push(new Resource(item));
                    } else {
                      // Valid JSON values may be string literals, and these should not be converted
                      // into objects. These items will not have access to the Resource prototype
                      // methods, but unfortunately there
                      value.push(item);
                    }
                  });
                } else {
                  var promise = value.$promise;     // Save the promise
                  shallowClearAndCopy(data, value);
                  value.$promise = promise;         // Restore the promise
                }
              }
              response.resource = value;

              return response;
            }, function(response) {
              (error || noop)(response);
              return $q.reject(response);
            });

            promise['finally'](function() {
              value.$resolved = true;
              if (!isInstanceCall && cancellable) {
                value.$cancelRequest = angular.noop;
                $timeout.cancel(numericTimeoutPromise);
                timeoutDeferred = numericTimeoutPromise = httpConfig.timeout = null;
              }
            });

            promise = promise.then(
              function(response) {
                var value = responseInterceptor(response);
                (success || noop)(value, response.headers);
                return value;
              },
              responseErrorInterceptor);

            if (!isInstanceCall) {
              // we are creating instance / collection
              // - set the initial promise
              // - return the instance / collection
              value.$promise = promise;
              value.$resolved = false;
              if (cancellable) value.$cancelRequest = timeoutDeferred.resolve;

              return value;
            }

            // instance call
            return promise;
          };


          Resource.prototype['$' + name] = function(params, success, error) {
            if (isFunction(params)) {
              error = success; success = params; params = {};
            }
            var result = Resource[name].call(this, params, this, success, error);
            return result.$promise || result;
          };
        });

        Resource.bind = function(additionalParamDefaults) {
          return resourceFactory(url, extend({}, paramDefaults, additionalParamDefaults), actions);
        };

        return Resource;
      }

      return resourceFactory;
    }];
  });


})(window, window.angular);

},{}],2:[function(require,module,exports){
require('./angular-resource');
module.exports = 'ngResource';

},{"./angular-resource":1}],3:[function(require,module,exports){
/**
 * State-based routing for AngularJS
 * @version v0.3.1
 * @link http://angular-ui.github.com/
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

/* commonjs package manager support (eg componentjs) */
if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
  module.exports = 'ui.router';
}

(function (window, angular, undefined) {
/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy,
    toJson = angular.toJson;

function inherit(parent, extra) {
  return extend(new (extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
  forEach(arguments, function(obj) {
    if (obj !== dst) {
      forEach(obj, function(value, key) {
        if (!dst.hasOwnProperty(key)) dst[key] = value;
      });
    }
  });
  return dst;
}

/**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
function ancestors(first, second) {
  var path = [];

  for (var n in first.path) {
    if (first.path[n] !== second.path[n]) break;
    path.push(first.path[n]);
  }
  return path;
}

/**
 * IE8-safe wrapper for `Object.keys()`.
 *
 * @param {Object} object A JavaScript object.
 * @return {Array} Returns the keys of the object as an array.
 */
function objectKeys(object) {
  if (Object.keys) {
    return Object.keys(object);
  }
  var result = [];

  forEach(object, function(val, key) {
    result.push(key);
  });
  return result;
}

/**
 * IE8-safe wrapper for `Array.prototype.indexOf()`.
 *
 * @param {Array} array A JavaScript array.
 * @param {*} value A value to search the array for.
 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
 */
function indexOf(array, value) {
  if (Array.prototype.indexOf) {
    return array.indexOf(value, Number(arguments[2]) || 0);
  }
  var len = array.length >>> 0, from = Number(arguments[2]) || 0;
  from = (from < 0) ? Math.ceil(from) : Math.floor(from);

  if (from < 0) from += len;

  for (; from < len; from++) {
    if (from in array && array[from] === value) return from;
  }
  return -1;
}

/**
 * Merges a set of parameters with all parameters inherited between the common parents of the
 * current state and a given destination state.
 *
 * @param {Object} currentParams The value of the current state parameters ($stateParams).
 * @param {Object} newParams The set of parameters which will be composited with inherited params.
 * @param {Object} $current Internal definition of object representing the current state.
 * @param {Object} $to Internal definition of object representing state to transition to.
 */
function inheritParams(currentParams, newParams, $current, $to) {
  var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

  for (var i in parents) {
    if (!parents[i] || !parents[i].params) continue;
    parentParams = objectKeys(parents[i].params);
    if (!parentParams.length) continue;

    for (var j in parentParams) {
      if (indexOf(inheritList, parentParams[j]) >= 0) continue;
      inheritList.push(parentParams[j]);
      inherited[parentParams[j]] = currentParams[parentParams[j]];
    }
  }
  return extend({}, inherited, newParams);
}

/**
 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
 *
 * @param {Object} a The first object.
 * @param {Object} b The second object.
 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
 *                     it defaults to the list of keys in `a`.
 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
 */
function equalForKeys(a, b, keys) {
  if (!keys) {
    keys = [];
    for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
  }

  for (var i=0; i<keys.length; i++) {
    var k = keys[i];
    if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
  }
  return true;
}

/**
 * Returns the subset of an object, based on a list of keys.
 *
 * @param {Array} keys
 * @param {Object} values
 * @return {Boolean} Returns a subset of `values`.
 */
function filterByKeys(keys, values) {
  var filtered = {};

  forEach(keys, function (name) {
    filtered[name] = values[name];
  });
  return filtered;
}

// like _.indexBy
// when you know that your index values will be unique, or you want last-one-in to win
function indexBy(array, propName) {
  var result = {};
  forEach(array, function(item) {
    result[item[propName]] = item;
  });
  return result;
}

// extracted from underscore.js
// Return a copy of the object only containing the whitelisted properties.
function pick(obj) {
  var copy = {};
  var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
  forEach(keys, function(key) {
    if (key in obj) copy[key] = obj[key];
  });
  return copy;
}

// extracted from underscore.js
// Return a copy of the object omitting the blacklisted properties.
function omit(obj) {
  var copy = {};
  var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
  for (var key in obj) {
    if (indexOf(keys, key) == -1) copy[key] = obj[key];
  }
  return copy;
}

function pluck(collection, key) {
  var result = isArray(collection) ? [] : {};

  forEach(collection, function(val, i) {
    result[i] = isFunction(key) ? key(val) : val[key];
  });
  return result;
}

function filter(collection, callback) {
  var array = isArray(collection);
  var result = array ? [] : {};
  forEach(collection, function(val, i) {
    if (callback(val, i)) {
      result[array ? result.length : i] = val;
    }
  });
  return result;
}

function map(collection, callback) {
  var result = isArray(collection) ? [] : {};

  forEach(collection, function(val, i) {
    result[i] = callback(val, i);
  });
  return result;
}

/**
 * @ngdoc overview
 * @name ui.router.util
 *
 * @description
 * # ui.router.util sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 *
 */
angular.module('ui.router.util', ['ng']);

/**
 * @ngdoc overview
 * @name ui.router.router
 * 
 * @requires ui.router.util
 *
 * @description
 * # ui.router.router sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 */
angular.module('ui.router.router', ['ui.router.util']);

/**
 * @ngdoc overview
 * @name ui.router.state
 * 
 * @requires ui.router.router
 * @requires ui.router.util
 *
 * @description
 * # ui.router.state sub-module
 *
 * This module is a dependency of the main ui.router module. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 * 
 */
angular.module('ui.router.state', ['ui.router.router', 'ui.router.util']);

/**
 * @ngdoc overview
 * @name ui.router
 *
 * @requires ui.router.state
 *
 * @description
 * # ui.router
 * 
 * ## The main module for ui.router 
 * There are several sub-modules included with the ui.router module, however only this module is needed
 * as a dependency within your angular app. The other modules are for organization purposes. 
 *
 * The modules are:
 * * ui.router - the main "umbrella" module
 * * ui.router.router - 
 * 
 * *You'll need to include **only** this module as the dependency within your angular app.*
 * 
 * <pre>
 * <!doctype html>
 * <html ng-app="myApp">
 * <head>
 *   <script src="js/angular.js"></script>
 *   <!-- Include the ui-router script -->
 *   <script src="js/angular-ui-router.min.js"></script>
 *   <script>
 *     // ...and add 'ui.router' as a dependency
 *     var myApp = angular.module('myApp', ['ui.router']);
 *   </script>
 * </head>
 * <body>
 * </body>
 * </html>
 * </pre>
 */
angular.module('ui.router', ['ui.router.state']);

angular.module('ui.router.compat', ['ui.router']);

/**
 * @ngdoc object
 * @name ui.router.util.$resolve
 *
 * @requires $q
 * @requires $injector
 *
 * @description
 * Manages resolution of (acyclic) graphs of promises.
 */
$Resolve.$inject = ['$q', '$injector'];
function $Resolve(  $q,    $injector) {
  
  var VISIT_IN_PROGRESS = 1,
      VISIT_DONE = 2,
      NOTHING = {},
      NO_DEPENDENCIES = [],
      NO_LOCALS = NOTHING,
      NO_PARENT = extend($q.when(NOTHING), { $$promises: NOTHING, $$values: NOTHING });
  

  /**
   * @ngdoc function
   * @name ui.router.util.$resolve#study
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Studies a set of invocables that are likely to be used multiple times.
   * <pre>
   * $resolve.study(invocables)(locals, parent, self)
   * </pre>
   * is equivalent to
   * <pre>
   * $resolve.resolve(invocables, locals, parent, self)
   * </pre>
   * but the former is more efficient (in fact `resolve` just calls `study` 
   * internally).
   *
   * @param {object} invocables Invocable objects
   * @return {function} a function to pass in locals, parent and self
   */
  this.study = function (invocables) {
    if (!isObject(invocables)) throw new Error("'invocables' must be an object");
    var invocableKeys = objectKeys(invocables || {});
    
    // Perform a topological sort of invocables to build an ordered plan
    var plan = [], cycle = [], visited = {};
    function visit(value, key) {
      if (visited[key] === VISIT_DONE) return;
      
      cycle.push(key);
      if (visited[key] === VISIT_IN_PROGRESS) {
        cycle.splice(0, indexOf(cycle, key));
        throw new Error("Cyclic dependency: " + cycle.join(" -> "));
      }
      visited[key] = VISIT_IN_PROGRESS;
      
      if (isString(value)) {
        plan.push(key, [ function() { return $injector.get(value); }], NO_DEPENDENCIES);
      } else {
        var params = $injector.annotate(value);
        forEach(params, function (param) {
          if (param !== key && invocables.hasOwnProperty(param)) visit(invocables[param], param);
        });
        plan.push(key, value, params);
      }
      
      cycle.pop();
      visited[key] = VISIT_DONE;
    }
    forEach(invocables, visit);
    invocables = cycle = visited = null; // plan is all that's required
    
    function isResolve(value) {
      return isObject(value) && value.then && value.$$promises;
    }
    
    return function (locals, parent, self) {
      if (isResolve(locals) && self === undefined) {
        self = parent; parent = locals; locals = null;
      }
      if (!locals) locals = NO_LOCALS;
      else if (!isObject(locals)) {
        throw new Error("'locals' must be an object");
      }       
      if (!parent) parent = NO_PARENT;
      else if (!isResolve(parent)) {
        throw new Error("'parent' must be a promise returned by $resolve.resolve()");
      }
      
      // To complete the overall resolution, we have to wait for the parent
      // promise and for the promise for each invokable in our plan.
      var resolution = $q.defer(),
          result = resolution.promise,
          promises = result.$$promises = {},
          values = extend({}, locals),
          wait = 1 + plan.length/3,
          merged = false;
          
      function done() {
        // Merge parent values we haven't got yet and publish our own $$values
        if (!--wait) {
          if (!merged) merge(values, parent.$$values); 
          result.$$values = values;
          result.$$promises = result.$$promises || true; // keep for isResolve()
          delete result.$$inheritedValues;
          resolution.resolve(values);
        }
      }
      
      function fail(reason) {
        result.$$failure = reason;
        resolution.reject(reason);
      }

      // Short-circuit if parent has already failed
      if (isDefined(parent.$$failure)) {
        fail(parent.$$failure);
        return result;
      }
      
      if (parent.$$inheritedValues) {
        merge(values, omit(parent.$$inheritedValues, invocableKeys));
      }

      // Merge parent values if the parent has already resolved, or merge
      // parent promises and wait if the parent resolve is still in progress.
      extend(promises, parent.$$promises);
      if (parent.$$values) {
        merged = merge(values, omit(parent.$$values, invocableKeys));
        result.$$inheritedValues = omit(parent.$$values, invocableKeys);
        done();
      } else {
        if (parent.$$inheritedValues) {
          result.$$inheritedValues = omit(parent.$$inheritedValues, invocableKeys);
        }        
        parent.then(done, fail);
      }
      
      // Process each invocable in the plan, but ignore any where a local of the same name exists.
      for (var i=0, ii=plan.length; i<ii; i+=3) {
        if (locals.hasOwnProperty(plan[i])) done();
        else invoke(plan[i], plan[i+1], plan[i+2]);
      }
      
      function invoke(key, invocable, params) {
        // Create a deferred for this invocation. Failures will propagate to the resolution as well.
        var invocation = $q.defer(), waitParams = 0;
        function onfailure(reason) {
          invocation.reject(reason);
          fail(reason);
        }
        // Wait for any parameter that we have a promise for (either from parent or from this
        // resolve; in that case study() will have made sure it's ordered before us in the plan).
        forEach(params, function (dep) {
          if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
            waitParams++;
            promises[dep].then(function (result) {
              values[dep] = result;
              if (!(--waitParams)) proceed();
            }, onfailure);
          }
        });
        if (!waitParams) proceed();
        function proceed() {
          if (isDefined(result.$$failure)) return;
          try {
            invocation.resolve($injector.invoke(invocable, self, values));
            invocation.promise.then(function (result) {
              values[key] = result;
              done();
            }, onfailure);
          } catch (e) {
            onfailure(e);
          }
        }
        // Publish promise synchronously; invocations further down in the plan may depend on it.
        promises[key] = invocation.promise;
      }
      
      return result;
    };
  };
  
  /**
   * @ngdoc function
   * @name ui.router.util.$resolve#resolve
   * @methodOf ui.router.util.$resolve
   *
   * @description
   * Resolves a set of invocables. An invocable is a function to be invoked via 
   * `$injector.invoke()`, and can have an arbitrary number of dependencies. 
   * An invocable can either return a value directly,
   * or a `$q` promise. If a promise is returned it will be resolved and the 
   * resulting value will be used instead. Dependencies of invocables are resolved 
   * (in this order of precedence)
   *
   * - from the specified `locals`
   * - from another invocable that is part of this `$resolve` call
   * - from an invocable that is inherited from a `parent` call to `$resolve` 
   *   (or recursively
   * - from any ancestor `$resolve` of that parent).
   *
   * The return value of `$resolve` is a promise for an object that contains 
   * (in this order of precedence)
   *
   * - any `locals` (if specified)
   * - the resolved return values of all injectables
   * - any values inherited from a `parent` call to `$resolve` (if specified)
   *
   * The promise will resolve after the `parent` promise (if any) and all promises 
   * returned by injectables have been resolved. If any invocable 
   * (or `$injector.invoke`) throws an exception, or if a promise returned by an 
   * invocable is rejected, the `$resolve` promise is immediately rejected with the 
   * same error. A rejection of a `parent` promise (if specified) will likewise be 
   * propagated immediately. Once the `$resolve` promise has been rejected, no 
   * further invocables will be called.
   * 
   * Cyclic dependencies between invocables are not permitted and will cause `$resolve`
   * to throw an error. As a special case, an injectable can depend on a parameter 
   * with the same name as the injectable, which will be fulfilled from the `parent` 
   * injectable of the same name. This allows inherited values to be decorated. 
   * Note that in this case any other injectable in the same `$resolve` with the same
   * dependency would see the decorated value, not the inherited value.
   *
   * Note that missing dependencies -- unlike cyclic dependencies -- will cause an 
   * (asynchronous) rejection of the `$resolve` promise rather than a (synchronous) 
   * exception.
   *
   * Invocables are invoked eagerly as soon as all dependencies are available. 
   * This is true even for dependencies inherited from a `parent` call to `$resolve`.
   *
   * As a special case, an invocable can be a string, in which case it is taken to 
   * be a service name to be passed to `$injector.get()`. This is supported primarily 
   * for backwards-compatibility with the `resolve` property of `$routeProvider` 
   * routes.
   *
   * @param {object} invocables functions to invoke or 
   * `$injector` services to fetch.
   * @param {object} locals  values to make available to the injectables
   * @param {object} parent  a promise returned by another call to `$resolve`.
   * @param {object} self  the `this` for the invoked methods
   * @return {object} Promise for an object that contains the resolved return value
   * of all invocables, as well as any inherited and local values.
   */
  this.resolve = function (invocables, locals, parent, self) {
    return this.study(invocables)(locals, parent, self);
  };
}

angular.module('ui.router.util').service('$resolve', $Resolve);


/**
 * @ngdoc object
 * @name ui.router.util.$templateFactory
 *
 * @requires $http
 * @requires $templateCache
 * @requires $injector
 *
 * @description
 * Service. Manages loading of templates.
 */
$TemplateFactory.$inject = ['$http', '$templateCache', '$injector'];
function $TemplateFactory(  $http,   $templateCache,   $injector) {

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromConfig
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a configuration object. 
   *
   * @param {object} config Configuration object for which to load a template. 
   * The following properties are search in the specified order, and the first one 
   * that is defined is used to create the template:
   *
   * @param {string|object} config.template html string template or function to 
   * load via {@link ui.router.util.$templateFactory#fromString fromString}.
   * @param {string|object} config.templateUrl url to load or a function returning 
   * the url to load via {@link ui.router.util.$templateFactory#fromUrl fromUrl}.
   * @param {Function} config.templateProvider function to invoke via 
   * {@link ui.router.util.$templateFactory#fromProvider fromProvider}.
   * @param {object} params  Parameters to pass to the template function.
   * @param {object} locals Locals to pass to `invoke` if the template is loaded 
   * via a `templateProvider`. Defaults to `{ params: params }`.
   *
   * @return {string|object}  The template html as a string, or a promise for 
   * that string,or `null` if no template is configured.
   */
  this.fromConfig = function (config, params, locals) {
    return (
      isDefined(config.template) ? this.fromString(config.template, params) :
      isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
      isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) :
      null
    );
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromString
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template from a string or a function returning a string.
   *
   * @param {string|object} template html template as a string or function that 
   * returns an html template as a string.
   * @param {object} params Parameters to pass to the template function.
   *
   * @return {string|object} The template html as a string, or a promise for that 
   * string.
   */
  this.fromString = function (template, params) {
    return isFunction(template) ? template(params) : template;
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromUrl
   * @methodOf ui.router.util.$templateFactory
   * 
   * @description
   * Loads a template from the a URL via `$http` and `$templateCache`.
   *
   * @param {string|Function} url url of the template to load, or a function 
   * that returns a url.
   * @param {Object} params Parameters to pass to the url function.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
  this.fromUrl = function (url, params) {
    if (isFunction(url)) url = url(params);
    if (url == null) return null;
    else return $http
        .get(url, { cache: $templateCache, headers: { Accept: 'text/html' }})
        .then(function(response) { return response.data; });
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$templateFactory#fromProvider
   * @methodOf ui.router.util.$templateFactory
   *
   * @description
   * Creates a template by invoking an injectable provider function.
   *
   * @param {Function} provider Function to invoke via `$injector.invoke`
   * @param {Object} params Parameters for the template.
   * @param {Object} locals Locals to pass to `invoke`. Defaults to 
   * `{ params: params }`.
   * @return {string|Promise.<string>} The template html as a string, or a promise 
   * for that string.
   */
  this.fromProvider = function (provider, params, locals) {
    return $injector.invoke(provider, null, locals || { params: params });
  };
}

angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);

var $$UMFP; // reference to $UrlMatcherFactoryProvider

/**
 * @ngdoc object
 * @name ui.router.util.type:UrlMatcher
 *
 * @description
 * Matches URLs against patterns and extracts named parameters from the path or the search
 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
 * do not influence whether or not a URL is matched, but their values are passed through into
 * the matched parameters returned by {@link ui.router.util.type:UrlMatcher#methods_exec exec}.
 *
 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
 * syntax, which optionally allows a regular expression for the parameter to be specified:
 *
 * * `':'` name - colon placeholder
 * * `'*'` name - catch-all placeholder
 * * `'{' name '}'` - curly placeholder
 * * `'{' name ':' regexp|type '}'` - curly placeholder with regexp or type name. Should the
 *   regexp itself contain curly braces, they must be in matched pairs or escaped with a backslash.
 *
 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
 * must be unique within the pattern (across both path and search parameters). For colon
 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
 * number of characters other than '/'. For catch-all placeholders the path parameter matches
 * any number of characters.
 *
 * Examples:
 *
 * * `'/hello/'` - Matches only if the path is exactly '/hello/'. There is no special treatment for
 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
 * * `'/user/:id'` - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
 * * `'/user/{id}'` - Same as the previous example, but using curly brace syntax.
 * * `'/user/{id:[^/]*}'` - Same as the previous example.
 * * `'/user/{id:[0-9a-fA-F]{1,8}}'` - Similar to the previous example, but only matches if the id
 *   parameter consists of 1 to 8 hex digits.
 * * `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
 *   path into the parameter 'path'.
 * * `'/files/*path'` - ditto.
 * * `'/calendar/{start:date}'` - Matches "/calendar/2014-11-12" (because the pattern defined
 *   in the built-in  `date` Type matches `2014-11-12`) and provides a Date object in $stateParams.start
 *
 * @param {string} pattern  The pattern to compile into a matcher.
 * @param {Object} config  A configuration object hash:
 * @param {Object=} parentMatcher Used to concatenate the pattern/config onto
 *   an existing UrlMatcher
 *
 * * `caseInsensitive` - `true` if URL matching should be case insensitive, otherwise `false`, the default value (for backward compatibility) is `false`.
 * * `strict` - `false` if matching against a URL with a trailing slash should be treated as equivalent to a URL without a trailing slash, the default value is `true`.
 *
 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
 *   URL matching this matcher (i.e. any string for which {@link ui.router.util.type:UrlMatcher#methods_exec exec()} returns
 *   non-null) will start with this prefix.
 *
 * @property {string} source  The pattern that was passed into the constructor
 *
 * @property {string} sourcePath  The path portion of the source property
 *
 * @property {string} sourceSearch  The search portion of the source property
 *
 * @property {string} regex  The constructed regex that will be used to match against the url when
 *   it is time to determine which url will match.
 *
 * @returns {Object}  New `UrlMatcher` object
 */
function UrlMatcher(pattern, config, parentMatcher) {
  config = extend({ params: {} }, isObject(config) ? config : {});

  // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
  //   '*' name
  //   ':' name
  //   '{' name '}'
  //   '{' name ':' regexp '}'
  // The regular expression is somewhat complicated due to the need to allow curly braces
  // inside the regular expression. The placeholder regexp breaks down as follows:
  //    ([:*])([\w\[\]]+)              - classic placeholder ($1 / $2) (search version has - for snake-case)
  //    \{([\w\[\]]+)(?:\:\s*( ... ))?\}  - curly brace placeholder ($3) with optional regexp/type ... ($4) (search version has - for snake-case
  //    (?: ... | ... | ... )+         - the regexp consists of any number of atoms, an atom being either
  //    [^{}\\]+                       - anything other than curly braces or backslash
  //    \\.                            - a backslash escape
  //    \{(?:[^{}\\]+|\\.)*\}          - a matched set of curly braces containing other atoms
  var placeholder       = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
      searchPlaceholder = /([:]?)([\w\[\].-]+)|\{([\w\[\].-]+)(?:\:\s*((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
      compiled = '^', last = 0, m,
      segments = this.segments = [],
      parentParams = parentMatcher ? parentMatcher.params : {},
      params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(),
      paramNames = [];

  function addParameter(id, type, config, location) {
    paramNames.push(id);
    if (parentParams[id]) return parentParams[id];
    if (!/^\w+([-.]+\w+)*(?:\[\])?$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
    if (params[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
    params[id] = new $$UMFP.Param(id, type, config, location);
    return params[id];
  }

  function quoteRegExp(string, pattern, squash, optional) {
    var surroundPattern = ['',''], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
    if (!pattern) return result;
    switch(squash) {
      case false: surroundPattern = ['(', ')' + (optional ? "?" : "")]; break;
      case true:
        result = result.replace(/\/$/, '');
        surroundPattern = ['(?:\/(', ')|\/)?'];
      break;
      default:    surroundPattern = ['(' + squash + "|", ')?']; break;
    }
    return result + surroundPattern[0] + pattern + surroundPattern[1];
  }

  this.source = pattern;

  // Split into static segments separated by path parameter placeholders.
  // The number of segments is always 1 more than the number of parameters.
  function matchDetails(m, isSearch) {
    var id, regexp, segment, type, cfg, arrayMode;
    id          = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
    cfg         = config.params[id];
    segment     = pattern.substring(last, m.index);
    regexp      = isSearch ? m[4] : m[4] || (m[1] == '*' ? '.*' : null);

    if (regexp) {
      type      = $$UMFP.type(regexp) || inherit($$UMFP.type("string"), { pattern: new RegExp(regexp, config.caseInsensitive ? 'i' : undefined) });
    }

    return {
      id: id, regexp: regexp, segment: segment, type: type, cfg: cfg
    };
  }

  var p, param, segment;
  while ((m = placeholder.exec(pattern))) {
    p = matchDetails(m, false);
    if (p.segment.indexOf('?') >= 0) break; // we're into the search part

    param = addParameter(p.id, p.type, p.cfg, "path");
    compiled += quoteRegExp(p.segment, param.type.pattern.source, param.squash, param.isOptional);
    segments.push(p.segment);
    last = placeholder.lastIndex;
  }
  segment = pattern.substring(last);

  // Find any search parameter names and remove them from the last segment
  var i = segment.indexOf('?');

  if (i >= 0) {
    var search = this.sourceSearch = segment.substring(i);
    segment = segment.substring(0, i);
    this.sourcePath = pattern.substring(0, last + i);

    if (search.length > 0) {
      last = 0;
      while ((m = searchPlaceholder.exec(search))) {
        p = matchDetails(m, true);
        param = addParameter(p.id, p.type, p.cfg, "search");
        last = placeholder.lastIndex;
        // check if ?&
      }
    }
  } else {
    this.sourcePath = pattern;
    this.sourceSearch = '';
  }

  compiled += quoteRegExp(segment) + (config.strict === false ? '\/?' : '') + '$';
  segments.push(segment);

  this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
  this.prefix = segments[0];
  this.$$paramNames = paramNames;
}

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#concat
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns a new matcher for a pattern constructed by appending the path part and adding the
 * search parameters of the specified pattern to this pattern. The current pattern is not
 * modified. This can be understood as creating a pattern for URLs that are relative to (or
 * suffixes of) the current pattern.
 *
 * @example
 * The following two matchers are equivalent:
 * <pre>
 * new UrlMatcher('/user/{id}?q').concat('/details?date');
 * new UrlMatcher('/user/{id}/details?q&date');
 * </pre>
 *
 * @param {string} pattern  The pattern to append.
 * @param {Object} config  An object hash of the configuration for the matcher.
 * @returns {UrlMatcher}  A matcher for the concatenated pattern.
 */
UrlMatcher.prototype.concat = function (pattern, config) {
  // Because order of search parameters is irrelevant, we can add our own search
  // parameters to the end of the new pattern. Parse the new pattern by itself
  // and then join the bits together, but it's much easier to do this on a string level.
  var defaultConfig = {
    caseInsensitive: $$UMFP.caseInsensitive(),
    strict: $$UMFP.strictMode(),
    squash: $$UMFP.defaultSquashPolicy()
  };
  return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, extend(defaultConfig, config), this);
};

UrlMatcher.prototype.toString = function () {
  return this.source;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#exec
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Tests the specified path against this matcher, and returns an object containing the captured
 * parameter values, or null if the path does not match. The returned object contains the values
 * of any search parameters that are mentioned in the pattern, but their value may be null if
 * they are not present in `searchParams`. This means that search parameters are always treated
 * as optional.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', {
 *   x: '1', q: 'hello'
 * });
 * // returns { id: 'bob', q: 'hello', r: null }
 * </pre>
 *
 * @param {string} path  The URL path to match, e.g. `$location.path()`.
 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
 * @returns {Object}  The captured parameter values.
 */
UrlMatcher.prototype.exec = function (path, searchParams) {
  var m = this.regexp.exec(path);
  if (!m) return null;
  searchParams = searchParams || {};

  var paramNames = this.parameters(), nTotal = paramNames.length,
    nPath = this.segments.length - 1,
    values = {}, i, j, cfg, paramName;

  if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

  function decodePathArray(string) {
    function reverseString(str) { return str.split("").reverse().join(""); }
    function unquoteDashes(str) { return str.replace(/\\-/g, "-"); }

    var split = reverseString(string).split(/-(?!\\)/);
    var allReversed = map(split, reverseString);
    return map(allReversed, unquoteDashes).reverse();
  }

  var param, paramVal;
  for (i = 0; i < nPath; i++) {
    paramName = paramNames[i];
    param = this.params[paramName];
    paramVal = m[i+1];
    // if the param value matches a pre-replace pair, replace the value before decoding.
    for (j = 0; j < param.replace.length; j++) {
      if (param.replace[j].from === paramVal) paramVal = param.replace[j].to;
    }
    if (paramVal && param.array === true) paramVal = decodePathArray(paramVal);
    if (isDefined(paramVal)) paramVal = param.type.decode(paramVal);
    values[paramName] = param.value(paramVal);
  }
  for (/**/; i < nTotal; i++) {
    paramName = paramNames[i];
    values[paramName] = this.params[paramName].value(searchParams[paramName]);
    param = this.params[paramName];
    paramVal = searchParams[paramName];
    for (j = 0; j < param.replace.length; j++) {
      if (param.replace[j].from === paramVal) paramVal = param.replace[j].to;
    }
    if (isDefined(paramVal)) paramVal = param.type.decode(paramVal);
    values[paramName] = param.value(paramVal);
  }

  return values;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#parameters
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns the names of all path and search parameters of this pattern in an unspecified order.
 *
 * @returns {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
 *    pattern has no parameters, an empty array is returned.
 */
UrlMatcher.prototype.parameters = function (param) {
  if (!isDefined(param)) return this.$$paramNames;
  return this.params[param] || null;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#validates
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Checks an object hash of parameters to validate their correctness according to the parameter
 * types of this `UrlMatcher`.
 *
 * @param {Object} params The object hash of parameters to validate.
 * @returns {boolean} Returns `true` if `params` validates, otherwise `false`.
 */
UrlMatcher.prototype.validates = function (params) {
  return this.params.$$validates(params);
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#format
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Creates a URL that matches this pattern by substituting the specified values
 * for the path and search parameters. Null values for path parameters are
 * treated as empty strings.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
 * // returns '/user/bob?q=yes'
 * </pre>
 *
 * @param {Object} values  the values to substitute for the parameters in this pattern.
 * @returns {string}  the formatted URL (path and optionally search part).
 */
UrlMatcher.prototype.format = function (values) {
  values = values || {};
  var segments = this.segments, params = this.parameters(), paramset = this.params;
  if (!this.validates(values)) return null;

  var i, search = false, nPath = segments.length - 1, nTotal = params.length, result = segments[0];

  function encodeDashes(str) { // Replace dashes with encoded "\-"
    return encodeURIComponent(str).replace(/-/g, function(c) { return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase(); });
  }

  for (i = 0; i < nTotal; i++) {
    var isPathParam = i < nPath;
    var name = params[i], param = paramset[name], value = param.value(values[name]);
    var isDefaultValue = param.isOptional && param.type.equals(param.value(), value);
    var squash = isDefaultValue ? param.squash : false;
    var encoded = param.type.encode(value);

    if (isPathParam) {
      var nextSegment = segments[i + 1];
      var isFinalPathParam = i + 1 === nPath;

      if (squash === false) {
        if (encoded != null) {
          if (isArray(encoded)) {
            result += map(encoded, encodeDashes).join("-");
          } else {
            result += encodeURIComponent(encoded);
          }
        }
        result += nextSegment;
      } else if (squash === true) {
        var capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
        result += nextSegment.match(capture)[1];
      } else if (isString(squash)) {
        result += squash + nextSegment;
      }

      if (isFinalPathParam && param.squash === true && result.slice(-1) === '/') result = result.slice(0, -1);
    } else {
      if (encoded == null || (isDefaultValue && squash !== false)) continue;
      if (!isArray(encoded)) encoded = [ encoded ];
      if (encoded.length === 0) continue;
      encoded = map(encoded, encodeURIComponent).join('&' + name + '=');
      result += (search ? '&' : '?') + (name + '=' + encoded);
      search = true;
    }
  }

  return result;
};

/**
 * @ngdoc object
 * @name ui.router.util.type:Type
 *
 * @description
 * Implements an interface to define custom parameter types that can be decoded from and encoded to
 * string parameters matched in a URL. Used by {@link ui.router.util.type:UrlMatcher `UrlMatcher`}
 * objects when matching or formatting URLs, or comparing or validating parameter values.
 *
 * See {@link ui.router.util.$urlMatcherFactory#methods_type `$urlMatcherFactory#type()`} for more
 * information on registering custom types.
 *
 * @param {Object} config  A configuration object which contains the custom type definition.  The object's
 *        properties will override the default methods and/or pattern in `Type`'s public interface.
 * @example
 * <pre>
 * {
 *   decode: function(val) { return parseInt(val, 10); },
 *   encode: function(val) { return val && val.toString(); },
 *   equals: function(a, b) { return this.is(a) && a === b; },
 *   is: function(val) { return angular.isNumber(val) isFinite(val) && val % 1 === 0; },
 *   pattern: /\d+/
 * }
 * </pre>
 *
 * @property {RegExp} pattern The regular expression pattern used to match values of this type when
 *           coming from a substring of a URL.
 *
 * @returns {Object}  Returns a new `Type` object.
 */
function Type(config) {
  extend(this, config);
}

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#is
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Detects whether a value is of a particular type. Accepts a native (decoded) value
 * and determines whether it matches the current `Type` object.
 *
 * @param {*} val  The value to check.
 * @param {string} key  Optional. If the type check is happening in the context of a specific
 *        {@link ui.router.util.type:UrlMatcher `UrlMatcher`} object, this is the name of the
 *        parameter in which `val` is stored. Can be used for meta-programming of `Type` objects.
 * @returns {Boolean}  Returns `true` if the value matches the type, otherwise `false`.
 */
Type.prototype.is = function(val, key) {
  return true;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#encode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Encodes a custom/native type value to a string that can be embedded in a URL. Note that the
 * return value does *not* need to be URL-safe (i.e. passed through `encodeURIComponent()`), it
 * only needs to be a representation of `val` that has been coerced to a string.
 *
 * @param {*} val  The value to encode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {string}  Returns a string representation of `val` that can be encoded in a URL.
 */
Type.prototype.encode = function(val, key) {
  return val;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#decode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Converts a parameter value (from URL string or transition param) to a custom/native value.
 *
 * @param {string} val  The URL parameter value to decode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {*}  Returns a custom representation of the URL parameter value.
 */
Type.prototype.decode = function(val, key) {
  return val;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#equals
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Determines whether two decoded values are equivalent.
 *
 * @param {*} a  A value to compare against.
 * @param {*} b  A value to compare against.
 * @returns {Boolean}  Returns `true` if the values are equivalent/equal, otherwise `false`.
 */
Type.prototype.equals = function(a, b) {
  return a == b;
};

Type.prototype.$subPattern = function() {
  var sub = this.pattern.toString();
  return sub.substr(1, sub.length - 2);
};

Type.prototype.pattern = /.*/;

Type.prototype.toString = function() { return "{Type:" + this.name + "}"; };

/** Given an encoded string, or a decoded object, returns a decoded object */
Type.prototype.$normalize = function(val) {
  return this.is(val) ? val : this.decode(val);
};

/*
 * Wraps an existing custom Type as an array of Type, depending on 'mode'.
 * e.g.:
 * - urlmatcher pattern "/path?{queryParam[]:int}"
 * - url: "/path?queryParam=1&queryParam=2
 * - $stateParams.queryParam will be [1, 2]
 * if `mode` is "auto", then
 * - url: "/path?queryParam=1 will create $stateParams.queryParam: 1
 * - url: "/path?queryParam=1&queryParam=2 will create $stateParams.queryParam: [1, 2]
 */
Type.prototype.$asArray = function(mode, isSearch) {
  if (!mode) return this;
  if (mode === "auto" && !isSearch) throw new Error("'auto' array mode is for query parameters only");

  function ArrayType(type, mode) {
    function bindTo(type, callbackName) {
      return function() {
        return type[callbackName].apply(type, arguments);
      };
    }

    // Wrap non-array value as array
    function arrayWrap(val) { return isArray(val) ? val : (isDefined(val) ? [ val ] : []); }
    // Unwrap array value for "auto" mode. Return undefined for empty array.
    function arrayUnwrap(val) {
      switch(val.length) {
        case 0: return undefined;
        case 1: return mode === "auto" ? val[0] : val;
        default: return val;
      }
    }
    function falsey(val) { return !val; }

    // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
    function arrayHandler(callback, allTruthyMode) {
      return function handleArray(val) {
        if (isArray(val) && val.length === 0) return val;
        val = arrayWrap(val);
        var result = map(val, callback);
        if (allTruthyMode === true)
          return filter(result, falsey).length === 0;
        return arrayUnwrap(result);
      };
    }

    // Wraps type (.equals) functions to operate on each value of an array
    function arrayEqualsHandler(callback) {
      return function handleArray(val1, val2) {
        var left = arrayWrap(val1), right = arrayWrap(val2);
        if (left.length !== right.length) return false;
        for (var i = 0; i < left.length; i++) {
          if (!callback(left[i], right[i])) return false;
        }
        return true;
      };
    }

    this.encode = arrayHandler(bindTo(type, 'encode'));
    this.decode = arrayHandler(bindTo(type, 'decode'));
    this.is     = arrayHandler(bindTo(type, 'is'), true);
    this.equals = arrayEqualsHandler(bindTo(type, 'equals'));
    this.pattern = type.pattern;
    this.$normalize = arrayHandler(bindTo(type, '$normalize'));
    this.name = type.name;
    this.$arrayMode = mode;
  }

  return new ArrayType(this, mode);
};



/**
 * @ngdoc object
 * @name ui.router.util.$urlMatcherFactory
 *
 * @description
 * Factory for {@link ui.router.util.type:UrlMatcher `UrlMatcher`} instances. The factory
 * is also available to providers under the name `$urlMatcherFactoryProvider`.
 */
function $UrlMatcherFactory() {
  $$UMFP = this;

  var isCaseInsensitive = false, isStrictMode = true, defaultSquashPolicy = false;

  // Use tildes to pre-encode slashes.
  // If the slashes are simply URLEncoded, the browser can choose to pre-decode them,
  // and bidirectional encoding/decoding fails.
  // Tilde was chosen because it's not a RFC 3986 section 2.2 Reserved Character
  function valToString(val) { return val != null ? val.toString().replace(/~/g, "~~").replace(/\//g, "~2F") : val; }
  function valFromString(val) { return val != null ? val.toString().replace(/~2F/g, "/").replace(/~~/g, "~") : val; }

  var $types = {}, enqueue = true, typeQueue = [], injector, defaultTypes = {
    "string": {
      encode: valToString,
      decode: valFromString,
      // TODO: in 1.0, make string .is() return false if value is undefined/null by default.
      // In 0.2.x, string params are optional by default for backwards compat
      is: function(val) { return val == null || !isDefined(val) || typeof val === "string"; },
      pattern: /[^/]*/
    },
    "int": {
      encode: valToString,
      decode: function(val) { return parseInt(val, 10); },
      is: function(val) { return isDefined(val) && this.decode(val.toString()) === val; },
      pattern: /\d+/
    },
    "bool": {
      encode: function(val) { return val ? 1 : 0; },
      decode: function(val) { return parseInt(val, 10) !== 0; },
      is: function(val) { return val === true || val === false; },
      pattern: /0|1/
    },
    "date": {
      encode: function (val) {
        if (!this.is(val))
          return undefined;
        return [ val.getFullYear(),
          ('0' + (val.getMonth() + 1)).slice(-2),
          ('0' + val.getDate()).slice(-2)
        ].join("-");
      },
      decode: function (val) {
        if (this.is(val)) return val;
        var match = this.capture.exec(val);
        return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
      },
      is: function(val) { return val instanceof Date && !isNaN(val.valueOf()); },
      equals: function (a, b) { return this.is(a) && this.is(b) && a.toISOString() === b.toISOString(); },
      pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
      capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
    },
    "json": {
      encode: angular.toJson,
      decode: angular.fromJson,
      is: angular.isObject,
      equals: angular.equals,
      pattern: /[^/]*/
    },
    "any": { // does not encode/decode
      encode: angular.identity,
      decode: angular.identity,
      equals: angular.equals,
      pattern: /.*/
    }
  };

  function getDefaultConfig() {
    return {
      strict: isStrictMode,
      caseInsensitive: isCaseInsensitive
    };
  }

  function isInjectable(value) {
    return (isFunction(value) || (isArray(value) && isFunction(value[value.length - 1])));
  }

  /**
   * [Internal] Get the default value of a parameter, which may be an injectable function.
   */
  $UrlMatcherFactory.$$getDefaultValue = function(config) {
    if (!isInjectable(config.value)) return config.value;
    if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
    return injector.invoke(config.value);
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#caseInsensitive
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Defines whether URL matching should be case sensitive (the default behavior), or not.
   *
   * @param {boolean} value `false` to match URL in a case sensitive manner; otherwise `true`;
   * @returns {boolean} the current value of caseInsensitive
   */
  this.caseInsensitive = function(value) {
    if (isDefined(value))
      isCaseInsensitive = value;
    return isCaseInsensitive;
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#strictMode
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Defines whether URLs should match trailing slashes, or not (the default behavior).
   *
   * @param {boolean=} value `false` to match trailing slashes in URLs, otherwise `true`.
   * @returns {boolean} the current value of strictMode
   */
  this.strictMode = function(value) {
    if (isDefined(value))
      isStrictMode = value;
    return isStrictMode;
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#defaultSquashPolicy
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Sets the default behavior when generating or matching URLs with default parameter values.
   *
   * @param {string} value A string that defines the default parameter URL squashing behavior.
   *    `nosquash`: When generating an href with a default parameter value, do not squash the parameter value from the URL
   *    `slash`: When generating an href with a default parameter value, squash (remove) the parameter value, and, if the
   *             parameter is surrounded by slashes, squash (remove) one slash from the URL
   *    any other string, e.g. "~": When generating an href with a default parameter value, squash (remove)
   *             the parameter value from the URL and replace it with this string.
   */
  this.defaultSquashPolicy = function(value) {
    if (!isDefined(value)) return defaultSquashPolicy;
    if (value !== true && value !== false && !isString(value))
      throw new Error("Invalid squash policy: " + value + ". Valid policies: false, true, arbitrary-string");
    defaultSquashPolicy = value;
    return value;
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#compile
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Creates a {@link ui.router.util.type:UrlMatcher `UrlMatcher`} for the specified pattern.
   *
   * @param {string} pattern  The URL pattern.
   * @param {Object} config  The config object hash.
   * @returns {UrlMatcher}  The UrlMatcher.
   */
  this.compile = function (pattern, config) {
    return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#isMatcher
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Returns true if the specified object is a `UrlMatcher`, or false otherwise.
   *
   * @param {Object} object  The object to perform the type check against.
   * @returns {Boolean}  Returns `true` if the object matches the `UrlMatcher` interface, by
   *          implementing all the same methods.
   */
  this.isMatcher = function (o) {
    if (!isObject(o)) return false;
    var result = true;

    forEach(UrlMatcher.prototype, function(val, name) {
      if (isFunction(val)) {
        result = result && (isDefined(o[name]) && isFunction(o[name]));
      }
    });
    return result;
  };

  /**
   * @ngdoc function
   * @name ui.router.util.$urlMatcherFactory#type
   * @methodOf ui.router.util.$urlMatcherFactory
   *
   * @description
   * Registers a custom {@link ui.router.util.type:Type `Type`} object that can be used to
   * generate URLs with typed parameters.
   *
   * @param {string} name  The type name.
   * @param {Object|Function} definition   The type definition. See
   *        {@link ui.router.util.type:Type `Type`} for information on the values accepted.
   * @param {Object|Function} definitionFn (optional) A function that is injected before the app
   *        runtime starts.  The result of this function is merged into the existing `definition`.
   *        See {@link ui.router.util.type:Type `Type`} for information on the values accepted.
   *
   * @returns {Object}  Returns `$urlMatcherFactoryProvider`.
   *
   * @example
   * This is a simple example of a custom type that encodes and decodes items from an
   * array, using the array index as the URL-encoded value:
   *
   * <pre>
   * var list = ['John', 'Paul', 'George', 'Ringo'];
   *
   * $urlMatcherFactoryProvider.type('listItem', {
   *   encode: function(item) {
   *     // Represent the list item in the URL using its corresponding index
   *     return list.indexOf(item);
   *   },
   *   decode: function(item) {
   *     // Look up the list item by index
   *     return list[parseInt(item, 10)];
   *   },
   *   is: function(item) {
   *     // Ensure the item is valid by checking to see that it appears
   *     // in the list
   *     return list.indexOf(item) > -1;
   *   }
   * });
   *
   * $stateProvider.state('list', {
   *   url: "/list/{item:listItem}",
   *   controller: function($scope, $stateParams) {
   *     console.log($stateParams.item);
   *   }
   * });
   *
   * // ...
   *
   * // Changes URL to '/list/3', logs "Ringo" to the console
   * $state.go('list', { item: "Ringo" });
   * </pre>
   *
   * This is a more complex example of a type that relies on dependency injection to
   * interact with services, and uses the parameter name from the URL to infer how to
   * handle encoding and decoding parameter values:
   *
   * <pre>
   * // Defines a custom type that gets a value from a service,
   * // where each service gets different types of values from
   * // a backend API:
   * $urlMatcherFactoryProvider.type('dbObject', {}, function(Users, Posts) {
   *
   *   // Matches up services to URL parameter names
   *   var services = {
   *     user: Users,
   *     post: Posts
   *   };
   *
   *   return {
   *     encode: function(object) {
   *       // Represent the object in the URL using its unique ID
   *       return object.id;
   *     },
   *     decode: function(value, key) {
   *       // Look up the object by ID, using the parameter
   *       // name (key) to call the correct service
   *       return services[key].findById(value);
   *     },
   *     is: function(object, key) {
   *       // Check that object is a valid dbObject
   *       return angular.isObject(object) && object.id && services[key];
   *     }
   *     equals: function(a, b) {
   *       // Check the equality of decoded objects by comparing
   *       // their unique IDs
   *       return a.id === b.id;
   *     }
   *   };
   * });
   *
   * // In a config() block, you can then attach URLs with
   * // type-annotated parameters:
   * $stateProvider.state('users', {
   *   url: "/users",
   *   // ...
   * }).state('users.item', {
   *   url: "/{user:dbObject}",
   *   controller: function($scope, $stateParams) {
   *     // $stateParams.user will now be an object returned from
   *     // the Users service
   *   },
   *   // ...
   * });
   * </pre>
   */
  this.type = function (name, definition, definitionFn) {
    if (!isDefined(definition)) return $types[name];
    if ($types.hasOwnProperty(name)) throw new Error("A type named '" + name + "' has already been defined.");

    $types[name] = new Type(extend({ name: name }, definition));
    if (definitionFn) {
      typeQueue.push({ name: name, def: definitionFn });
      if (!enqueue) flushTypeQueue();
    }
    return this;
  };

  // `flushTypeQueue()` waits until `$urlMatcherFactory` is injected before invoking the queued `definitionFn`s
  function flushTypeQueue() {
    while(typeQueue.length) {
      var type = typeQueue.shift();
      if (type.pattern) throw new Error("You cannot override a type's .pattern at runtime.");
      angular.extend($types[type.name], injector.invoke(type.def));
    }
  }

  // Register default types. Store them in the prototype of $types.
  forEach(defaultTypes, function(type, name) { $types[name] = new Type(extend({name: name}, type)); });
  $types = inherit($types, {});

  /* No need to document $get, since it returns this */
  this.$get = ['$injector', function ($injector) {
    injector = $injector;
    enqueue = false;
    flushTypeQueue();

    forEach(defaultTypes, function(type, name) {
      if (!$types[name]) $types[name] = new Type(type);
    });
    return this;
  }];

  this.Param = function Param(id, type, config, location) {
    var self = this;
    config = unwrapShorthand(config);
    type = getType(config, type, location);
    var arrayMode = getArrayMode();
    type = arrayMode ? type.$asArray(arrayMode, location === "search") : type;
    if (type.name === "string" && !arrayMode && location === "path" && config.value === undefined)
      config.value = ""; // for 0.2.x; in 0.3.0+ do not automatically default to ""
    var isOptional = config.value !== undefined;
    var squash = getSquashPolicy(config, isOptional);
    var replace = getReplace(config, arrayMode, isOptional, squash);

    function unwrapShorthand(config) {
      var keys = isObject(config) ? objectKeys(config) : [];
      var isShorthand = indexOf(keys, "value") === -1 && indexOf(keys, "type") === -1 &&
                        indexOf(keys, "squash") === -1 && indexOf(keys, "array") === -1;
      if (isShorthand) config = { value: config };
      config.$$fn = isInjectable(config.value) ? config.value : function () { return config.value; };
      return config;
    }

    function getType(config, urlType, location) {
      if (config.type && urlType) throw new Error("Param '"+id+"' has two type configurations.");
      if (urlType) return urlType;
      if (!config.type) return (location === "config" ? $types.any : $types.string);

      if (angular.isString(config.type))
        return $types[config.type];
      if (config.type instanceof Type)
        return config.type;
      return new Type(config.type);
    }

    // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
    function getArrayMode() {
      var arrayDefaults = { array: (location === "search" ? "auto" : false) };
      var arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};
      return extend(arrayDefaults, arrayParamNomenclature, config).array;
    }

    /**
     * returns false, true, or the squash value to indicate the "default parameter url squash policy".
     */
    function getSquashPolicy(config, isOptional) {
      var squash = config.squash;
      if (!isOptional || squash === false) return false;
      if (!isDefined(squash) || squash == null) return defaultSquashPolicy;
      if (squash === true || isString(squash)) return squash;
      throw new Error("Invalid squash policy: '" + squash + "'. Valid policies: false, true, or arbitrary string");
    }

    function getReplace(config, arrayMode, isOptional, squash) {
      var replace, configuredKeys, defaultPolicy = [
        { from: "",   to: (isOptional || arrayMode ? undefined : "") },
        { from: null, to: (isOptional || arrayMode ? undefined : "") }
      ];
      replace = isArray(config.replace) ? config.replace : [];
      if (isString(squash))
        replace.push({ from: squash, to: undefined });
      configuredKeys = map(replace, function(item) { return item.from; } );
      return filter(defaultPolicy, function(item) { return indexOf(configuredKeys, item.from) === -1; }).concat(replace);
    }

    /**
     * [Internal] Get the default value of a parameter, which may be an injectable function.
     */
    function $$getDefaultValue() {
      if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
      var defaultValue = injector.invoke(config.$$fn);
      if (defaultValue !== null && defaultValue !== undefined && !self.type.is(defaultValue))
        throw new Error("Default value (" + defaultValue + ") for parameter '" + self.id + "' is not an instance of Type (" + self.type.name + ")");
      return defaultValue;
    }

    /**
     * [Internal] Gets the decoded representation of a value if the value is defined, otherwise, returns the
     * default value, which may be the result of an injectable function.
     */
    function $value(value) {
      function hasReplaceVal(val) { return function(obj) { return obj.from === val; }; }
      function $replace(value) {
        var replacement = map(filter(self.replace, hasReplaceVal(value)), function(obj) { return obj.to; });
        return replacement.length ? replacement[0] : value;
      }
      value = $replace(value);
      return !isDefined(value) ? $$getDefaultValue() : self.type.$normalize(value);
    }

    function toString() { return "{Param:" + id + " " + type + " squash: '" + squash + "' optional: " + isOptional + "}"; }

    extend(this, {
      id: id,
      type: type,
      location: location,
      array: arrayMode,
      squash: squash,
      replace: replace,
      isOptional: isOptional,
      value: $value,
      dynamic: undefined,
      config: config,
      toString: toString
    });
  };

  function ParamSet(params) {
    extend(this, params || {});
  }

  ParamSet.prototype = {
    $$new: function() {
      return inherit(this, extend(new ParamSet(), { $$parent: this}));
    },
    $$keys: function () {
      var keys = [], chain = [], parent = this,
        ignore = objectKeys(ParamSet.prototype);
      while (parent) { chain.push(parent); parent = parent.$$parent; }
      chain.reverse();
      forEach(chain, function(paramset) {
        forEach(objectKeys(paramset), function(key) {
            if (indexOf(keys, key) === -1 && indexOf(ignore, key) === -1) keys.push(key);
        });
      });
      return keys;
    },
    $$values: function(paramValues) {
      var values = {}, self = this;
      forEach(self.$$keys(), function(key) {
        values[key] = self[key].value(paramValues && paramValues[key]);
      });
      return values;
    },
    $$equals: function(paramValues1, paramValues2) {
      var equal = true, self = this;
      forEach(self.$$keys(), function(key) {
        var left = paramValues1 && paramValues1[key], right = paramValues2 && paramValues2[key];
        if (!self[key].type.equals(left, right)) equal = false;
      });
      return equal;
    },
    $$validates: function $$validate(paramValues) {
      var keys = this.$$keys(), i, param, rawVal, normalized, encoded;
      for (i = 0; i < keys.length; i++) {
        param = this[keys[i]];
        rawVal = paramValues[keys[i]];
        if ((rawVal === undefined || rawVal === null) && param.isOptional)
          break; // There was no parameter value, but the param is optional
        normalized = param.type.$normalize(rawVal);
        if (!param.type.is(normalized))
          return false; // The value was not of the correct Type, and could not be decoded to the correct Type
        encoded = param.type.encode(normalized);
        if (angular.isString(encoded) && !param.type.pattern.exec(encoded))
          return false; // The value was of the correct type, but when encoded, did not match the Type's regexp
      }
      return true;
    },
    $$parent: undefined
  };

  this.ParamSet = ParamSet;
}

// Register as a provider so it's available to other providers
angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);
angular.module('ui.router.util').run(['$urlMatcherFactory', function($urlMatcherFactory) { }]);

/**
 * @ngdoc object
 * @name ui.router.router.$urlRouterProvider
 *
 * @requires ui.router.util.$urlMatcherFactoryProvider
 * @requires $locationProvider
 *
 * @description
 * `$urlRouterProvider` has the responsibility of watching `$location`. 
 * When `$location` changes it runs through a list of rules one by one until a 
 * match is found. `$urlRouterProvider` is used behind the scenes anytime you specify 
 * a url in a state configuration. All urls are compiled into a UrlMatcher object.
 *
 * There are several methods on `$urlRouterProvider` that make it useful to use directly
 * in your module config.
 */
$UrlRouterProvider.$inject = ['$locationProvider', '$urlMatcherFactoryProvider'];
function $UrlRouterProvider(   $locationProvider,   $urlMatcherFactory) {
  var rules = [], otherwise = null, interceptDeferred = false, listener;

  // Returns a string that is a prefix of all strings matching the RegExp
  function regExpPrefix(re) {
    var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
    return (prefix != null) ? prefix[1].replace(/\\(.)/g, "$1") : '';
  }

  // Interpolates matched values into a String.replace()-style pattern
  function interpolate(pattern, match) {
    return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
      return match[what === '$' ? 0 : Number(what)];
    });
  }

  /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#rule
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines rules that are used by `$urlRouterProvider` to find matches for
   * specific URLs.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // Here's an example of how you might allow case insensitive urls
   *   $urlRouterProvider.rule(function ($injector, $location) {
   *     var path = $location.path(),
   *         normalized = path.toLowerCase();
   *
   *     if (path !== normalized) {
   *       return normalized;
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {function} rule Handler function that takes `$injector` and `$location`
   * services as arguments. You can use them to return a valid path as a string.
   *
   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
   */
  this.rule = function (rule) {
    if (!isFunction(rule)) throw new Error("'rule' must be a function");
    rules.push(rule);
    return this;
  };

  /**
   * @ngdoc object
   * @name ui.router.router.$urlRouterProvider#otherwise
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Defines a path that is used when an invalid route is requested.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   // if the path doesn't match any of the urls you configured
   *   // otherwise will take care of routing the user to the
   *   // specified url
   *   $urlRouterProvider.otherwise('/index');
   *
   *   // Example of using function rule as param
   *   $urlRouterProvider.otherwise(function ($injector, $location) {
   *     return '/a/valid/url';
   *   });
   * });
   * </pre>
   *
   * @param {string|function} rule The url path you want to redirect to or a function 
   * rule that returns the url path. The function version is passed two params: 
   * `$injector` and `$location` services, and must return a url string.
   *
   * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
   */
  this.otherwise = function (rule) {
    if (isString(rule)) {
      var redirect = rule;
      rule = function () { return redirect; };
    }
    else if (!isFunction(rule)) throw new Error("'rule' must be a function");
    otherwise = rule;
    return this;
  };


  function handleIfMatch($injector, handler, match) {
    if (!match) return false;
    var result = $injector.invoke(handler, handler, { $match: match });
    return isDefined(result) ? result : true;
  }

  /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#when
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Registers a handler for a given url matching. 
   * 
   * If the handler is a string, it is
   * treated as a redirect, and is interpolated according to the syntax of match
   * (i.e. like `String.replace()` for `RegExp`, or like a `UrlMatcher` pattern otherwise).
   *
   * If the handler is a function, it is injectable. It gets invoked if `$location`
   * matches. You have the option of inject the match object as `$match`.
   *
   * The handler can return
   *
   * - **falsy** to indicate that the rule didn't match after all, then `$urlRouter`
   *   will continue trying to find another one that matches.
   * - **string** which is treated as a redirect and passed to `$location.url()`
   * - **void** or any **truthy** value tells `$urlRouter` that the url was handled.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *   $urlRouterProvider.when($state.url, function ($match, $stateParams) {
   *     if ($state.$current.navigable !== state ||
   *         !equalForKeys($match, $stateParams) {
   *      $state.transitionTo(state, $match, false);
   *     }
   *   });
   * });
   * </pre>
   *
   * @param {string|object} what The incoming path that you want to redirect.
   * @param {string|function} handler The path you want to redirect your user to.
   */
  this.when = function (what, handler) {
    var redirect, handlerIsString = isString(handler);
    if (isString(what)) what = $urlMatcherFactory.compile(what);

    if (!handlerIsString && !isFunction(handler) && !isArray(handler))
      throw new Error("invalid 'handler' in when()");

    var strategies = {
      matcher: function (what, handler) {
        if (handlerIsString) {
          redirect = $urlMatcherFactory.compile(handler);
          handler = ['$match', function ($match) { return redirect.format($match); }];
        }
        return extend(function ($injector, $location) {
          return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
        }, {
          prefix: isString(what.prefix) ? what.prefix : ''
        });
      },
      regex: function (what, handler) {
        if (what.global || what.sticky) throw new Error("when() RegExp must not be global or sticky");

        if (handlerIsString) {
          redirect = handler;
          handler = ['$match', function ($match) { return interpolate(redirect, $match); }];
        }
        return extend(function ($injector, $location) {
          return handleIfMatch($injector, handler, what.exec($location.path()));
        }, {
          prefix: regExpPrefix(what)
        });
      }
    };

    var check = { matcher: $urlMatcherFactory.isMatcher(what), regex: what instanceof RegExp };

    for (var n in check) {
      if (check[n]) return this.rule(strategies[n](what, handler));
    }

    throw new Error("invalid 'what' in when()");
  };

  /**
   * @ngdoc function
   * @name ui.router.router.$urlRouterProvider#deferIntercept
   * @methodOf ui.router.router.$urlRouterProvider
   *
   * @description
   * Disables (or enables) deferring location change interception.
   *
   * If you wish to customize the behavior of syncing the URL (for example, if you wish to
   * defer a transition but maintain the current URL), call this method at configuration time.
   * Then, at run time, call `$urlRouter.listen()` after you have configured your own
   * `$locationChangeSuccess` event handler.
   *
   * @example
   * <pre>
   * var app = angular.module('app', ['ui.router.router']);
   *
   * app.config(function ($urlRouterProvider) {
   *
   *   // Prevent $urlRouter from automatically intercepting URL changes;
   *   // this allows you to configure custom behavior in between
   *   // location changes and route synchronization:
   *   $urlRouterProvider.deferIntercept();
   *
   * }).run(function ($rootScope, $urlRouter, UserService) {
   *
   *   $rootScope.$on('$locationChangeSuccess', function(e) {
   *     // UserService is an example service for managing user state
   *     if (UserService.isLoggedIn()) return;
   *
   *     // Prevent $urlRouter's default handler from firing
   *     e.preventDefault();
   *
   *     UserService.handleLogin().then(function() {
   *       // Once the user has logged in, sync the current URL
   *       // to the router:
   *       $urlRouter.sync();
   *     });
   *   });
   *
   *   // Configures $urlRouter's listener *after* your custom listener
   *   $urlRouter.listen();
   * });
   * </pre>
   *
   * @param {boolean} defer Indicates whether to defer location change interception. Passing
            no parameter is equivalent to `true`.
   */
  this.deferIntercept = function (defer) {
    if (defer === undefined) defer = true;
    interceptDeferred = defer;
  };

  /**
   * @ngdoc object
   * @name ui.router.router.$urlRouter
   *
   * @requires $location
   * @requires $rootScope
   * @requires $injector
   * @requires $browser
   *
   * @description
   *
   */
  this.$get = $get;
  $get.$inject = ['$location', '$rootScope', '$injector', '$browser', '$sniffer'];
  function $get(   $location,   $rootScope,   $injector,   $browser,   $sniffer) {

    var baseHref = $browser.baseHref(), location = $location.url(), lastPushedUrl;

    function appendBasePath(url, isHtml5, absolute) {
      if (baseHref === '/') return url;
      if (isHtml5) return baseHref.slice(0, -1) + url;
      if (absolute) return baseHref.slice(1) + url;
      return url;
    }

    // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
    function update(evt) {
      if (evt && evt.defaultPrevented) return;
      var ignoreUpdate = lastPushedUrl && $location.url() === lastPushedUrl;
      lastPushedUrl = undefined;
      // TODO: Re-implement this in 1.0 for https://github.com/angular-ui/ui-router/issues/1573
      //if (ignoreUpdate) return true;

      function check(rule) {
        var handled = rule($injector, $location);

        if (!handled) return false;
        if (isString(handled)) $location.replace().url(handled);
        return true;
      }
      var n = rules.length, i;

      for (i = 0; i < n; i++) {
        if (check(rules[i])) return;
      }
      // always check otherwise last to allow dynamic updates to the set of rules
      if (otherwise) check(otherwise);
    }

    function listen() {
      listener = listener || $rootScope.$on('$locationChangeSuccess', update);
      return listener;
    }

    if (!interceptDeferred) listen();

    return {
      /**
       * @ngdoc function
       * @name ui.router.router.$urlRouter#sync
       * @methodOf ui.router.router.$urlRouter
       *
       * @description
       * Triggers an update; the same update that happens when the address bar url changes, aka `$locationChangeSuccess`.
       * This method is useful when you need to use `preventDefault()` on the `$locationChangeSuccess` event,
       * perform some custom logic (route protection, auth, config, redirection, etc) and then finally proceed
       * with the transition by calling `$urlRouter.sync()`.
       *
       * @example
       * <pre>
       * angular.module('app', ['ui.router'])
       *   .run(function($rootScope, $urlRouter) {
       *     $rootScope.$on('$locationChangeSuccess', function(evt) {
       *       // Halt state change from even starting
       *       evt.preventDefault();
       *       // Perform custom logic
       *       var meetsRequirement = ...
       *       // Continue with the update and state transition if logic allows
       *       if (meetsRequirement) $urlRouter.sync();
       *     });
       * });
       * </pre>
       */
      sync: function() {
        update();
      },

      listen: function() {
        return listen();
      },

      update: function(read) {
        if (read) {
          location = $location.url();
          return;
        }
        if ($location.url() === location) return;

        $location.url(location);
        $location.replace();
      },

      push: function(urlMatcher, params, options) {
         var url = urlMatcher.format(params || {});

        // Handle the special hash param, if needed
        if (url !== null && params && params['#']) {
            url += '#' + params['#'];
        }

        $location.url(url);
        lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined;
        if (options && options.replace) $location.replace();
      },

      /**
       * @ngdoc function
       * @name ui.router.router.$urlRouter#href
       * @methodOf ui.router.router.$urlRouter
       *
       * @description
       * A URL generation method that returns the compiled URL for a given
       * {@link ui.router.util.type:UrlMatcher `UrlMatcher`}, populated with the provided parameters.
       *
       * @example
       * <pre>
       * $bob = $urlRouter.href(new UrlMatcher("/about/:person"), {
       *   person: "bob"
       * });
       * // $bob == "/about/bob";
       * </pre>
       *
       * @param {UrlMatcher} urlMatcher The `UrlMatcher` object which is used as the template of the URL to generate.
       * @param {object=} params An object of parameter values to fill the matcher's required parameters.
       * @param {object=} options Options object. The options are:
       *
       * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
       *
       * @returns {string} Returns the fully compiled URL, or `null` if `params` fail validation against `urlMatcher`
       */
      href: function(urlMatcher, params, options) {
        if (!urlMatcher.validates(params)) return null;

        var isHtml5 = $locationProvider.html5Mode();
        if (angular.isObject(isHtml5)) {
          isHtml5 = isHtml5.enabled;
        }

        isHtml5 = isHtml5 && $sniffer.history;
        
        var url = urlMatcher.format(params);
        options = options || {};

        if (!isHtml5 && url !== null) {
          url = "#" + $locationProvider.hashPrefix() + url;
        }

        // Handle special hash param, if needed
        if (url !== null && params && params['#']) {
          url += '#' + params['#'];
        }

        url = appendBasePath(url, isHtml5, options.absolute);

        if (!options.absolute || !url) {
          return url;
        }

        var slash = (!isHtml5 && url ? '/' : ''), port = $location.port();
        port = (port === 80 || port === 443 ? '' : ':' + port);

        return [$location.protocol(), '://', $location.host(), port, slash, url].join('');
      }
    };
  }
}

angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);

/**
 * @ngdoc object
 * @name ui.router.state.$stateProvider
 *
 * @requires ui.router.router.$urlRouterProvider
 * @requires ui.router.util.$urlMatcherFactoryProvider
 *
 * @description
 * The new `$stateProvider` works similar to Angular's v1 router, but it focuses purely
 * on state.
 *
 * A state corresponds to a "place" in the application in terms of the overall UI and
 * navigation. A state describes (via the controller / template / view properties) what
 * the UI looks like and does at that place.
 *
 * States often have things in common, and the primary way of factoring out these
 * commonalities in this model is via the state hierarchy, i.e. parent/child states aka
 * nested states.
 *
 * The `$stateProvider` provides interfaces to declare these states for your app.
 */
$StateProvider.$inject = ['$urlRouterProvider', '$urlMatcherFactoryProvider'];
function $StateProvider(   $urlRouterProvider,   $urlMatcherFactory) {

  var root, states = {}, $state, queue = {}, abstractKey = 'abstract';

  // Builds state properties from definition passed to registerState()
  var stateBuilder = {

    // Derive parent state from a hierarchical name only if 'parent' is not explicitly defined.
    // state.children = [];
    // if (parent) parent.children.push(state);
    parent: function(state) {
      if (isDefined(state.parent) && state.parent) return findState(state.parent);
      // regex matches any valid composite state name
      // would match "contact.list" but not "contacts"
      var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
      return compositeName ? findState(compositeName[1]) : root;
    },

    // inherit 'data' from parent and override by own values (if any)
    data: function(state) {
      if (state.parent && state.parent.data) {
        state.data = state.self.data = inherit(state.parent.data, state.data);
      }
      return state.data;
    },

    // Build a URLMatcher if necessary, either via a relative or absolute URL
    url: function(state) {
      var url = state.url, config = { params: state.params || {} };

      if (isString(url)) {
        if (url.charAt(0) == '^') return $urlMatcherFactory.compile(url.substring(1), config);
        return (state.parent.navigable || root).url.concat(url, config);
      }

      if (!url || $urlMatcherFactory.isMatcher(url)) return url;
      throw new Error("Invalid url '" + url + "' in state '" + state + "'");
    },

    // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
    navigable: function(state) {
      return state.url ? state : (state.parent ? state.parent.navigable : null);
    },

    // Own parameters for this state. state.url.params is already built at this point. Create and add non-url params
    ownParams: function(state) {
      var params = state.url && state.url.params || new $$UMFP.ParamSet();
      forEach(state.params || {}, function(config, id) {
        if (!params[id]) params[id] = new $$UMFP.Param(id, null, config, "config");
      });
      return params;
    },

    // Derive parameters for this state and ensure they're a super-set of parent's parameters
    params: function(state) {
      var ownParams = pick(state.ownParams, state.ownParams.$$keys());
      return state.parent && state.parent.params ? extend(state.parent.params.$$new(), ownParams) : new $$UMFP.ParamSet();
    },

    // If there is no explicit multi-view configuration, make one up so we don't have
    // to handle both cases in the view directive later. Note that having an explicit
    // 'views' property will mean the default unnamed view properties are ignored. This
    // is also a good time to resolve view names to absolute names, so everything is a
    // straight lookup at link time.
    views: function(state) {
      var views = {};

      forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
        if (name.indexOf('@') < 0) name += '@' + state.parent.name;
        view.resolveAs = view.resolveAs || state.resolveAs || '$resolve';
        views[name] = view;
      });
      return views;
    },

    // Keep a full path from the root down to this state as this is needed for state activation.
    path: function(state) {
      return state.parent ? state.parent.path.concat(state) : []; // exclude root from path
    },

    // Speed up $state.contains() as it's used a lot
    includes: function(state) {
      var includes = state.parent ? extend({}, state.parent.includes) : {};
      includes[state.name] = true;
      return includes;
    },

    $delegates: {}
  };

  function isRelative(stateName) {
    return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
  }

  function findState(stateOrName, base) {
    if (!stateOrName) return undefined;

    var isStr = isString(stateOrName),
        name  = isStr ? stateOrName : stateOrName.name,
        path  = isRelative(name);

    if (path) {
      if (!base) throw new Error("No reference point given for path '"  + name + "'");
      base = findState(base);
      
      var rel = name.split("."), i = 0, pathLength = rel.length, current = base;

      for (; i < pathLength; i++) {
        if (rel[i] === "" && i === 0) {
          current = base;
          continue;
        }
        if (rel[i] === "^") {
          if (!current.parent) throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
          current = current.parent;
          continue;
        }
        break;
      }
      rel = rel.slice(i).join(".");
      name = current.name + (current.name && rel ? "." : "") + rel;
    }
    var state = states[name];

    if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
      return state;
    }
    return undefined;
  }

  function queueState(parentName, state) {
    if (!queue[parentName]) {
      queue[parentName] = [];
    }
    queue[parentName].push(state);
  }

  function flushQueuedChildren(parentName) {
    var queued = queue[parentName] || [];
    while(queued.length) {
      registerState(queued.shift());
    }
  }

  function registerState(state) {
    // Wrap a new object around the state so we can store our private details easily.
    state = inherit(state, {
      self: state,
      resolve: state.resolve || {},
      toString: function() { return this.name; }
    });

    var name = state.name;
    if (!isString(name) || name.indexOf('@') >= 0) throw new Error("State must have a valid name");
    if (states.hasOwnProperty(name)) throw new Error("State '" + name + "' is already defined");

    // Get parent name
    var parentName = (name.indexOf('.') !== -1) ? name.substring(0, name.lastIndexOf('.'))
        : (isString(state.parent)) ? state.parent
        : (isObject(state.parent) && isString(state.parent.name)) ? state.parent.name
        : '';

    // If parent is not registered yet, add state to queue and register later
    if (parentName && !states[parentName]) {
      return queueState(parentName, state.self);
    }

    for (var key in stateBuilder) {
      if (isFunction(stateBuilder[key])) state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
    }
    states[name] = state;

    // Register the state in the global state list and with $urlRouter if necessary.
    if (!state[abstractKey] && state.url) {
      $urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
        if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
          $state.transitionTo(state, $match, { inherit: true, location: false });
        }
      }]);
    }

    // Register any queued children
    flushQueuedChildren(name);

    return state;
  }

  // Checks text to see if it looks like a glob.
  function isGlob (text) {
    return text.indexOf('*') > -1;
  }

  // Returns true if glob matches current $state name.
  function doesStateMatchGlob (glob) {
    var globSegments = glob.split('.'),
        segments = $state.$current.name.split('.');

    //match single stars
    for (var i = 0, l = globSegments.length; i < l; i++) {
      if (globSegments[i] === '*') {
        segments[i] = '*';
      }
    }

    //match greedy starts
    if (globSegments[0] === '**') {
       segments = segments.slice(indexOf(segments, globSegments[1]));
       segments.unshift('**');
    }
    //match greedy ends
    if (globSegments[globSegments.length - 1] === '**') {
       segments.splice(indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
       segments.push('**');
    }

    if (globSegments.length != segments.length) {
      return false;
    }

    return segments.join('') === globSegments.join('');
  }


  // Implicit root state that is always active
  root = registerState({
    name: '',
    url: '^',
    views: null,
    'abstract': true
  });
  root.navigable = null;


  /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#decorator
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Allows you to extend (carefully) or override (at your own peril) the 
   * `stateBuilder` object used internally by `$stateProvider`. This can be used 
   * to add custom functionality to ui-router, for example inferring templateUrl 
   * based on the state name.
   *
   * When passing only a name, it returns the current (original or decorated) builder
   * function that matches `name`.
   *
   * The builder functions that can be decorated are listed below. Though not all
   * necessarily have a good use case for decoration, that is up to you to decide.
   *
   * In addition, users can attach custom decorators, which will generate new 
   * properties within the state's internal definition. There is currently no clear 
   * use-case for this beyond accessing internal states (i.e. $state.$current), 
   * however, expect this to become increasingly relevant as we introduce additional 
   * meta-programming features.
   *
   * **Warning**: Decorators should not be interdependent because the order of 
   * execution of the builder functions in non-deterministic. Builder functions 
   * should only be dependent on the state definition object and super function.
   *
   *
   * Existing builder functions and current return values:
   *
   * - **parent** `{object}` - returns the parent state object.
   * - **data** `{object}` - returns state data, including any inherited data that is not
   *   overridden by own values (if any).
   * - **url** `{object}` - returns a {@link ui.router.util.type:UrlMatcher UrlMatcher}
   *   or `null`.
   * - **navigable** `{object}` - returns closest ancestor state that has a URL (aka is 
   *   navigable).
   * - **params** `{object}` - returns an array of state params that are ensured to 
   *   be a super-set of parent's params.
   * - **views** `{object}` - returns a views object where each key is an absolute view 
   *   name (i.e. "viewName@stateName") and each value is the config object 
   *   (template, controller) for the view. Even when you don't use the views object 
   *   explicitly on a state config, one is still created for you internally.
   *   So by decorating this builder function you have access to decorating template 
   *   and controller properties.
   * - **ownParams** `{object}` - returns an array of params that belong to the state, 
   *   not including any params defined by ancestor states.
   * - **path** `{string}` - returns the full path from the root down to this state. 
   *   Needed for state activation.
   * - **includes** `{object}` - returns an object that includes every state that 
   *   would pass a `$state.includes()` test.
   *
   * @example
   * <pre>
   * // Override the internal 'views' builder with a function that takes the state
   * // definition, and a reference to the internal function being overridden:
   * $stateProvider.decorator('views', function (state, parent) {
   *   var result = {},
   *       views = parent(state);
   *
   *   angular.forEach(views, function (config, name) {
   *     var autoName = (state.name + '.' + name).replace('.', '/');
   *     config.templateUrl = config.templateUrl || '/partials/' + autoName + '.html';
   *     result[name] = config;
   *   });
   *   return result;
   * });
   *
   * $stateProvider.state('home', {
   *   views: {
   *     'contact.list': { controller: 'ListController' },
   *     'contact.item': { controller: 'ItemController' }
   *   }
   * });
   *
   * // ...
   *
   * $state.go('home');
   * // Auto-populates list and item views with /partials/home/contact/list.html,
   * // and /partials/home/contact/item.html, respectively.
   * </pre>
   *
   * @param {string} name The name of the builder function to decorate. 
   * @param {object} func A function that is responsible for decorating the original 
   * builder function. The function receives two parameters:
   *
   *   - `{object}` - state - The state config object.
   *   - `{object}` - super - The original builder function.
   *
   * @return {object} $stateProvider - $stateProvider instance
   */
  this.decorator = decorator;
  function decorator(name, func) {
    /*jshint validthis: true */
    if (isString(name) && !isDefined(func)) {
      return stateBuilder[name];
    }
    if (!isFunction(func) || !isString(name)) {
      return this;
    }
    if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
      stateBuilder.$delegates[name] = stateBuilder[name];
    }
    stateBuilder[name] = func;
    return this;
  }

  /**
   * @ngdoc function
   * @name ui.router.state.$stateProvider#state
   * @methodOf ui.router.state.$stateProvider
   *
   * @description
   * Registers a state configuration under a given state name. The stateConfig object
   * has the following acceptable properties.
   *
   * @param {string} name A unique state name, e.g. "home", "about", "contacts".
   * To create a parent/child state use a dot, e.g. "about.sales", "home.newest".
   * @param {object} stateConfig State configuration object.
   * @param {string|function=} stateConfig.template
   * <a id='template'></a>
   *   html template as a string or a function that returns
   *   an html template as a string which should be used by the uiView directives. This property 
   *   takes precedence over templateUrl.
   *   
   *   If `template` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
   *     applying the current state
   *
   * <pre>template:
   *   "<h1>inline template definition</h1>" +
   *   "<div ui-view></div>"</pre>
   * <pre>template: function(params) {
   *       return "<h1>generated template</h1>"; }</pre>
   * </div>
   *
   * @param {string|function=} stateConfig.templateUrl
   * <a id='templateUrl'></a>
   *
   *   path or function that returns a path to an html
   *   template that should be used by uiView.
   *   
   *   If `templateUrl` is a function, it will be called with the following parameters:
   *
   *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by 
   *     applying the current state
   *
   * <pre>templateUrl: "home.html"</pre>
   * <pre>templateUrl: function(params) {
   *     return myTemplates[params.pageId]; }</pre>
   *
   * @param {function=} stateConfig.templateProvider
   * <a id='templateProvider'></a>
   *    Provider function that returns HTML content string.
   * <pre> templateProvider:
   *       function(MyTemplateService, params) {
   *         return MyTemplateService.getTemplate(params.pageId);
   *       }</pre>
   *
   * @param {string|function=} stateConfig.controller
   * <a id='controller'></a>
   *
   *  Controller fn that should be associated with newly
   *   related scope or the name of a registered controller if passed as a string.
   *   Optionally, the ControllerAs may be declared here.
   * <pre>controller: "MyRegisteredController"</pre>
   * <pre>controller:
   *     "MyRegisteredController as fooCtrl"}</pre>
   * <pre>controller: function($scope, MyService) {
   *     $scope.data = MyService.getData(); }</pre>
   *
   * @param {function=} stateConfig.controllerProvider
   * <a id='controllerProvider'></a>
   *
   * Injectable provider function that returns the actual controller or string.
   * <pre>controllerProvider:
   *   function(MyResolveData) {
   *     if (MyResolveData.foo)
   *       return "FooCtrl"
   *     else if (MyResolveData.bar)
   *       return "BarCtrl";
   *     else return function($scope) {
   *       $scope.baz = "Qux";
   *     }
   *   }</pre>
   *
   * @param {string=} stateConfig.controllerAs
   * <a id='controllerAs'></a>
   * 
   * A controller alias name. If present the controller will be
   *   published to scope under the controllerAs name.
   * <pre>controllerAs: "myCtrl"</pre>
   *
   * @param {string|object=} stateConfig.parent
   * <a id='parent'></a>
   * Optionally specifies the parent state of this state.
   *
   * <pre>parent: 'parentState'</pre>
   * <pre>parent: parentState // JS variable</pre>
   *
   * @param {object=} stateConfig.resolve
   * <a id='resolve'></a>
   *
   * An optional map&lt;string, function&gt; of dependencies which
   *   should be injected into the controller. If any of these dependencies are promises, 
   *   the router will wait for them all to be resolved before the controller is instantiated.
   *   If all the promises are resolved successfully, the $stateChangeSuccess event is fired
   *   and the values of the resolved promises are injected into any controllers that reference them.
   *   If any  of the promises are rejected the $stateChangeError event is fired.
   *
   *   The map object is:
   *   
   *   - key - {string}: name of dependency to be injected into controller
   *   - factory - {string|function}: If string then it is alias for service. Otherwise if function, 
   *     it is injected and return value it treated as dependency. If result is a promise, it is 
   *     resolved before its value is injected into controller.
   *
   * <pre>resolve: {
   *     myResolve1:
   *       function($http, $stateParams) {
   *         return $http.get("/api/foos/"+stateParams.fooID);
   *       }
   *     }</pre>
   *
   * @param {string=} stateConfig.url
   * <a id='url'></a>
   *
   *   A url fragment with optional parameters. When a state is navigated or
   *   transitioned to, the `$stateParams` service will be populated with any 
   *   parameters that were passed.
   *
   *   (See {@link ui.router.util.type:UrlMatcher UrlMatcher} `UrlMatcher`} for
   *   more details on acceptable patterns )
   *
   * examples:
   * <pre>url: "/home"
   * url: "/users/:userid"
   * url: "/books/{bookid:[a-zA-Z_-]}"
   * url: "/books/{categoryid:int}"
   * url: "/books/{publishername:string}/{categoryid:int}"
   * url: "/messages?before&after"
   * url: "/messages?{before:date}&{after:date}"
   * url: "/messages/:mailboxid?{before:date}&{after:date}"
   * </pre>
   *
   * @param {object=} stateConfig.views
   * <a id='views'></a>
   * an optional map&lt;string, object&gt; which defined multiple views, or targets views
   * manually/explicitly.
   *
   * Examples:
   *
   * Targets three named `ui-view`s in the parent state's template
   * <pre>views: {
   *     header: {
   *       controller: "headerCtrl",
   *       templateUrl: "header.html"
   *     }, body: {
   *       controller: "bodyCtrl",
   *       templateUrl: "body.html"
   *     }, footer: {
   *       controller: "footCtrl",
   *       templateUrl: "footer.html"
   *     }
   *   }</pre>
   *
   * Targets named `ui-view="header"` from grandparent state 'top''s template, and named `ui-view="body" from parent state's template.
   * <pre>views: {
   *     'header@top': {
   *       controller: "msgHeaderCtrl",
   *       templateUrl: "msgHeader.html"
   *     }, 'body': {
   *       controller: "messagesCtrl",
   *       templateUrl: "messages.html"
   *     }
   *   }</pre>
   *
   * @param {boolean=} [stateConfig.abstract=false]
   * <a id='abstract'></a>
   * An abstract state will never be directly activated,
   *   but can provide inherited properties to its common children states.
   * <pre>abstract: true</pre>
   *
   * @param {function=} stateConfig.onEnter
   * <a id='onEnter'></a>
   *
   * Callback function for when a state is entered. Good way
   *   to trigger an action or dispatch an event, such as opening a dialog.
   * If minifying your scripts, make sure to explicitly annotate this function,
   * because it won't be automatically annotated by your build tools.
   *
   * <pre>onEnter: function(MyService, $stateParams) {
   *     MyService.foo($stateParams.myParam);
   * }</pre>
   *
   * @param {function=} stateConfig.onExit
   * <a id='onExit'></a>
   *
   * Callback function for when a state is exited. Good way to
   *   trigger an action or dispatch an event, such as opening a dialog.
   * If minifying your scripts, make sure to explicitly annotate this function,
   * because it won't be automatically annotated by your build tools.
   *
   * <pre>onExit: function(MyService, $stateParams) {
   *     MyService.cleanup($stateParams.myParam);
   * }</pre>
   *
   * @param {boolean=} [stateConfig.reloadOnSearch=true]
   * <a id='reloadOnSearch'></a>
   *
   * If `false`, will not retrigger the same state
   *   just because a search/query parameter has changed (via $location.search() or $location.hash()). 
   *   Useful for when you'd like to modify $location.search() without triggering a reload.
   * <pre>reloadOnSearch: false</pre>
   *
   * @param {object=} stateConfig.data
   * <a id='data'></a>
   *
   * Arbitrary data object, useful for custom configuration.  The parent state's `data` is
   *   prototypally inherited.  In other words, adding a data property to a state adds it to
   *   the entire subtree via prototypal inheritance.
   *
   * <pre>data: {
   *     requiredRole: 'foo'
   * } </pre>
   *
   * @param {object=} stateConfig.params
   * <a id='params'></a>
   *
   * A map which optionally configures parameters declared in the `url`, or
   *   defines additional non-url parameters.  For each parameter being
   *   configured, add a configuration object keyed to the name of the parameter.
   *
   *   Each parameter configuration object may contain the following properties:
   *
   *   - ** value ** - {object|function=}: specifies the default value for this
   *     parameter.  This implicitly sets this parameter as optional.
   *
   *     When UI-Router routes to a state and no value is
   *     specified for this parameter in the URL or transition, the
   *     default value will be used instead.  If `value` is a function,
   *     it will be injected and invoked, and the return value used.
   *
   *     *Note*: `undefined` is treated as "no default value" while `null`
   *     is treated as "the default value is `null`".
   *
   *     *Shorthand*: If you only need to configure the default value of the
   *     parameter, you may use a shorthand syntax.   In the **`params`**
   *     map, instead mapping the param name to a full parameter configuration
   *     object, simply set map it to the default parameter value, e.g.:
   *
   * <pre>// define a parameter's default value
   * params: {
   *     param1: { value: "defaultValue" }
   * }
   * // shorthand default values
   * params: {
   *     param1: "defaultValue",
   *     param2: "param2Default"
   * }</pre>
   *
   *   - ** array ** - {boolean=}: *(default: false)* If true, the param value will be
   *     treated as an array of values.  If you specified a Type, the value will be
   *     treated as an array of the specified Type.  Note: query parameter values
   *     default to a special `"auto"` mode.
   *
   *     For query parameters in `"auto"` mode, if multiple  values for a single parameter
   *     are present in the URL (e.g.: `/foo?bar=1&bar=2&bar=3`) then the values
   *     are mapped to an array (e.g.: `{ foo: [ '1', '2', '3' ] }`).  However, if
   *     only one value is present (e.g.: `/foo?bar=1`) then the value is treated as single
   *     value (e.g.: `{ foo: '1' }`).
   *
   * <pre>params: {
   *     param1: { array: true }
   * }</pre>
   *
   *   - ** squash ** - {bool|string=}: `squash` configures how a default parameter value is represented in the URL when
   *     the current parameter value is the same as the default value. If `squash` is not set, it uses the
   *     configured default squash policy.
   *     (See {@link ui.router.util.$urlMatcherFactory#methods_defaultSquashPolicy `defaultSquashPolicy()`})
   *
   *   There are three squash settings:
   *
   *     - false: The parameter's default value is not squashed.  It is encoded and included in the URL
   *     - true: The parameter's default value is omitted from the URL.  If the parameter is preceeded and followed
   *       by slashes in the state's `url` declaration, then one of those slashes are omitted.
   *       This can allow for cleaner looking URLs.
   *     - `"<arbitrary string>"`: The parameter's default value is replaced with an arbitrary placeholder of  your choice.
   *
   * <pre>params: {
   *     param1: {
   *       value: "defaultId",
   *       squash: true
   * } }
   * // squash "defaultValue" to "~"
   * params: {
   *     param1: {
   *       value: "defaultValue",
   *       squash: "~"
   * } }
   * </pre>
   *
   *
   * @example
   * <pre>
   * // Some state name examples
   *
   * // stateName can be a single top-level name (must be unique).
   * $stateProvider.state("home", {});
   *
   * // Or it can be a nested state name. This state is a child of the
   * // above "home" state.
   * $stateProvider.state("home.newest", {});
   *
   * // Nest states as deeply as needed.
   * $stateProvider.state("home.newest.abc.xyz.inception", {});
   *
   * // state() returns $stateProvider, so you can chain state declarations.
   * $stateProvider
   *   .state("home", {})
   *   .state("about", {})
   *   .state("contacts", {});
   * </pre>
   *
   */
  this.state = state;
  function state(name, definition) {
    /*jshint validthis: true */
    if (isObject(name)) definition = name;
    else definition.name = name;
    registerState(definition);
    return this;
  }

  /**
   * @ngdoc object
   * @name ui.router.state.$state
   *
   * @requires $rootScope
   * @requires $q
   * @requires ui.router.state.$view
   * @requires $injector
   * @requires ui.router.util.$resolve
   * @requires ui.router.state.$stateParams
   * @requires ui.router.router.$urlRouter
   *
   * @property {object} params A param object, e.g. {sectionId: section.id)}, that 
   * you'd like to test against the current active state.
   * @property {object} current A reference to the state's config object. However 
   * you passed it in. Useful for accessing custom data.
   * @property {object} transition Currently pending transition. A promise that'll 
   * resolve or reject.
   *
   * @description
   * `$state` service is responsible for representing states as well as transitioning
   * between them. It also provides interfaces to ask for current state or even states
   * you're coming from.
   */
  this.$get = $get;
  $get.$inject = ['$rootScope', '$q', '$view', '$injector', '$resolve', '$stateParams', '$urlRouter', '$location', '$urlMatcherFactory'];
  function $get(   $rootScope,   $q,   $view,   $injector,   $resolve,   $stateParams,   $urlRouter,   $location,   $urlMatcherFactory) {

    var TransitionSuperseded = $q.reject(new Error('transition superseded'));
    var TransitionPrevented = $q.reject(new Error('transition prevented'));
    var TransitionAborted = $q.reject(new Error('transition aborted'));
    var TransitionFailed = $q.reject(new Error('transition failed'));

    // Handles the case where a state which is the target of a transition is not found, and the user
    // can optionally retry or defer the transition
    function handleRedirect(redirect, state, params, options) {
      /**
       * @ngdoc event
       * @name ui.router.state.$state#$stateNotFound
       * @eventOf ui.router.state.$state
       * @eventType broadcast on root scope
       * @description
       * Fired when a requested state **cannot be found** using the provided state name during transition.
       * The event is broadcast allowing any handlers a single chance to deal with the error (usually by
       * lazy-loading the unfound state). A special `unfoundState` object is passed to the listener handler,
       * you can see its three properties in the example. You can use `event.preventDefault()` to abort the
       * transition and the promise returned from `go` will be rejected with a `'transition aborted'` value.
       *
       * @param {Object} event Event object.
       * @param {Object} unfoundState Unfound State information. Contains: `to, toParams, options` properties.
       * @param {State} fromState Current state object.
       * @param {Object} fromParams Current state params.
       *
       * @example
       *
       * <pre>
       * // somewhere, assume lazy.state has not been defined
       * $state.go("lazy.state", {a:1, b:2}, {inherit:false});
       *
       * // somewhere else
       * $scope.$on('$stateNotFound',
       * function(event, unfoundState, fromState, fromParams){
       *     console.log(unfoundState.to); // "lazy.state"
       *     console.log(unfoundState.toParams); // {a:1, b:2}
       *     console.log(unfoundState.options); // {inherit:false} + default options
       * })
       * </pre>
       */
      var evt = $rootScope.$broadcast('$stateNotFound', redirect, state, params);

      if (evt.defaultPrevented) {
        $urlRouter.update();
        return TransitionAborted;
      }

      if (!evt.retry) {
        return null;
      }

      // Allow the handler to return a promise to defer state lookup retry
      if (options.$retry) {
        $urlRouter.update();
        return TransitionFailed;
      }
      var retryTransition = $state.transition = $q.when(evt.retry);

      retryTransition.then(function() {
        if (retryTransition !== $state.transition) return TransitionSuperseded;
        redirect.options.$retry = true;
        return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
      }, function() {
        return TransitionAborted;
      });
      $urlRouter.update();

      return retryTransition;
    }

    root.locals = { resolve: null, globals: { $stateParams: {} } };

    $state = {
      params: {},
      current: root.self,
      $current: root,
      transition: null
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#reload
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method that force reloads the current state. All resolves are re-resolved,
     * controllers reinstantiated, and events re-fired.
     *
     * @example
     * <pre>
     * var app angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.reload = function(){
     *     $state.reload();
     *   }
     * });
     * </pre>
     *
     * `reload()` is just an alias for:
     * <pre>
     * $state.transitionTo($state.current, $stateParams, { 
     *   reload: true, inherit: false, notify: true
     * });
     * </pre>
     *
     * @param {string=|object=} state - A state name or a state object, which is the root of the resolves to be re-resolved.
     * @example
     * <pre>
     * //assuming app application consists of 3 states: 'contacts', 'contacts.detail', 'contacts.detail.item' 
     * //and current state is 'contacts.detail.item'
     * var app angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.reload = function(){
     *     //will reload 'contact.detail' and 'contact.detail.item' states
     *     $state.reload('contact.detail');
     *   }
     * });
     * </pre>
     *
     * `reload()` is just an alias for:
     * <pre>
     * $state.transitionTo($state.current, $stateParams, { 
     *   reload: true, inherit: false, notify: true
     * });
     * </pre>

     * @returns {promise} A promise representing the state of the new transition. See
     * {@link ui.router.state.$state#methods_go $state.go}.
     */
    $state.reload = function reload(state) {
      return $state.transitionTo($state.current, $stateParams, { reload: state || true, inherit: false, notify: true});
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#go
     * @methodOf ui.router.state.$state
     *
     * @description
     * Convenience method for transitioning to a new state. `$state.go` calls 
     * `$state.transitionTo` internally but automatically sets options to 
     * `{ location: true, inherit: true, relative: $state.$current, notify: true }`. 
     * This allows you to easily use an absolute or relative to path and specify 
     * only the parameters you'd like to update (while letting unspecified parameters 
     * inherit from the currently active ancestor states).
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.go('contact.detail');
     *   };
     * });
     * </pre>
     * <img src='../ngdoc_assets/StateGoExamples.png'/>
     *
     * @param {string} to Absolute state name or relative state path. Some examples:
     *
     * - `$state.go('contact.detail')` - will go to the `contact.detail` state
     * - `$state.go('^')` - will go to a parent state
     * - `$state.go('^.sibling')` - will go to a sibling state
     * - `$state.go('.child.grandchild')` - will go to grandchild state
     *
     * @param {object=} params A map of the parameters that will be sent to the state, 
     * will populate $stateParams. Any parameters that are not specified will be inherited from currently 
     * defined parameters. Only parameters specified in the state definition can be overridden, new 
     * parameters will be ignored. This allows, for example, going to a sibling state that shares parameters
     * specified in a parent state. Parameter inheritance only works between common ancestor states, I.e.
     * transitioning to a sibling will get you the parameters for all parents, transitioning to a child
     * will get you all current parameters, etc.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false|string|object}, If `true` will force transition even if no state or params
     *    have changed.  It will reload the resolves and views of the current state and parent states.
     *    If `reload` is a string (or state object), the state object is fetched (by name, or object reference); and \
     *    the transition reloads the resolves and views for that matched state, and all its children states.
     *
     * @returns {promise} A promise representing the state of the new transition.
     *
     * Possible success values:
     *
     * - $state.current
     *
     * <br/>Possible rejection values:
     *
     * - 'transition superseded' - when a newer transition has been started after this one
     * - 'transition prevented' - when `event.preventDefault()` has been called in a `$stateChangeStart` listener
     * - 'transition aborted' - when `event.preventDefault()` has been called in a `$stateNotFound` listener or
     *   when a `$stateNotFound` `event.retry` promise errors.
     * - 'transition failed' - when a state has been unsuccessfully found after 2 tries.
     * - *resolve error* - when an error has occurred with a `resolve`
     *
     */
    $state.go = function go(to, params, options) {
      return $state.transitionTo(to, params, extend({ inherit: true, relative: $state.$current }, options));
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#transitionTo
     * @methodOf ui.router.state.$state
     *
     * @description
     * Low-level method for transitioning to a new state. {@link ui.router.state.$state#methods_go $state.go}
     * uses `transitionTo` internally. `$state.go` is recommended in most situations.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router']);
     *
     * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.transitionTo('contact.detail');
     *   };
     * });
     * </pre>
     *
     * @param {string} to State name.
     * @param {object=} toParams A map of the parameters that will be sent to the state,
     * will populate $stateParams.
     * @param {object=} options Options object. The options are:
     *
     * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
     *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
     * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
     * - **`reload`** (v0.2.5) - {boolean=false|string=|object=}, If `true` will force transition even if the state or params 
     *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
     *    use this when you want to force a reload when *everything* is the same, including search params.
     *    if String, then will reload the state with the name given in reload, and any children.
     *    if Object, then a stateObj is expected, will reload the state found in stateObj, and any children.
     *
     * @returns {promise} A promise representing the state of the new transition. See
     * {@link ui.router.state.$state#methods_go $state.go}.
     */
    $state.transitionTo = function transitionTo(to, toParams, options) {
      toParams = toParams || {};
      options = extend({
        location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
      }, options || {});

      var from = $state.$current, fromParams = $state.params, fromPath = from.path;
      var evt, toState = findState(to, options.relative);

      // Store the hash param for later (since it will be stripped out by various methods)
      var hash = toParams['#'];

      if (!isDefined(toState)) {
        var redirect = { to: to, toParams: toParams, options: options };
        var redirectResult = handleRedirect(redirect, from.self, fromParams, options);

        if (redirectResult) {
          return redirectResult;
        }

        // Always retry once if the $stateNotFound was not prevented
        // (handles either redirect changed or state lazy-definition)
        to = redirect.to;
        toParams = redirect.toParams;
        options = redirect.options;
        toState = findState(to, options.relative);

        if (!isDefined(toState)) {
          if (!options.relative) throw new Error("No such state '" + to + "'");
          throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
        }
      }
      if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
      if (options.inherit) toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
      if (!toState.params.$$validates(toParams)) return TransitionFailed;

      toParams = toState.params.$$values(toParams);
      to = toState;

      var toPath = to.path;

      // Starting from the root of the path, keep all levels that haven't changed
      var keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];

      if (!options.reload) {
        while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
          locals = toLocals[keep] = state.locals;
          keep++;
          state = toPath[keep];
        }
      } else if (isString(options.reload) || isObject(options.reload)) {
        if (isObject(options.reload) && !options.reload.name) {
          throw new Error('Invalid reload state object');
        }
        
        var reloadState = options.reload === true ? fromPath[0] : findState(options.reload);
        if (options.reload && !reloadState) {
          throw new Error("No such reload state '" + (isString(options.reload) ? options.reload : options.reload.name) + "'");
        }

        while (state && state === fromPath[keep] && state !== reloadState) {
          locals = toLocals[keep] = state.locals;
          keep++;
          state = toPath[keep];
        }
      }

      // If we're going to the same state and all locals are kept, we've got nothing to do.
      // But clear 'transition', as we still want to cancel any other pending transitions.
      // TODO: We may not want to bump 'transition' if we're called from a location change
      // that we've initiated ourselves, because we might accidentally abort a legitimate
      // transition initiated from code?
      if (shouldSkipReload(to, toParams, from, fromParams, locals, options)) {
        if (hash) toParams['#'] = hash;
        $state.params = toParams;
        copy($state.params, $stateParams);
        copy(filterByKeys(to.params.$$keys(), $stateParams), to.locals.globals.$stateParams);
        if (options.location && to.navigable && to.navigable.url) {
          $urlRouter.push(to.navigable.url, toParams, {
            $$avoidResync: true, replace: options.location === 'replace'
          });
          $urlRouter.update(true);
        }
        $state.transition = null;
        return $q.when($state.current);
      }

      // Filter parameters before we pass them to event handlers etc.
      toParams = filterByKeys(to.params.$$keys(), toParams || {});
      
      // Re-add the saved hash before we start returning things or broadcasting $stateChangeStart
      if (hash) toParams['#'] = hash;
      
      // Broadcast start event and cancel the transition if requested
      if (options.notify) {
        /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeStart
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when the state transition **begins**. You can use `event.preventDefault()`
         * to prevent the transition from happening and then the transition promise will be
         * rejected with a `'transition prevented'` value.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         *
         * @example
         *
         * <pre>
         * $rootScope.$on('$stateChangeStart',
         * function(event, toState, toParams, fromState, fromParams){
         *     event.preventDefault();
         *     // transitionTo() promise will be rejected with
         *     // a 'transition prevented' error
         * })
         * </pre>
         */
        if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams, options).defaultPrevented) {
          $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
          //Don't update and resync url if there's been a new transition started. see issue #2238, #600
          if ($state.transition == null) $urlRouter.update();
          return TransitionPrevented;
        }
      }

      // Resolve locals for the remaining states, but don't update any global state just
      // yet -- if anything fails to resolve the current state needs to remain untouched.
      // We also set up an inheritance chain for the locals here. This allows the view directive
      // to quickly look up the correct definition for each view in the current state. Even
      // though we create the locals object itself outside resolveState(), it is initially
      // empty and gets filled asynchronously. We need to keep track of the promise for the
      // (fully resolved) current locals, and pass this down the chain.
      var resolved = $q.when(locals);

      for (var l = keep; l < toPath.length; l++, state = toPath[l]) {
        locals = toLocals[l] = inherit(locals);
        resolved = resolveState(state, toParams, state === to, resolved, locals, options);
      }

      // Once everything is resolved, we are ready to perform the actual transition
      // and return a promise for the new state. We also keep track of what the
      // current promise is, so that we can detect overlapping transitions and
      // keep only the outcome of the last transition.
      var transition = $state.transition = resolved.then(function () {
        var l, entering, exiting;

        if ($state.transition !== transition) return TransitionSuperseded;

        // Exit 'from' states not kept
        for (l = fromPath.length - 1; l >= keep; l--) {
          exiting = fromPath[l];
          if (exiting.self.onExit) {
            $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
          }
          exiting.locals = null;
        }

        // Enter 'to' states not kept
        for (l = keep; l < toPath.length; l++) {
          entering = toPath[l];
          entering.locals = toLocals[l];
          if (entering.self.onEnter) {
            $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
          }
        }

        // Run it again, to catch any transitions in callbacks
        if ($state.transition !== transition) return TransitionSuperseded;

        // Update globals in $state
        $state.$current = to;
        $state.current = to.self;
        $state.params = toParams;
        copy($state.params, $stateParams);
        $state.transition = null;

        if (options.location && to.navigable) {
          $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
            $$avoidResync: true, replace: options.location === 'replace'
          });
        }

        if (options.notify) {
        /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeSuccess
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired once the state transition is **complete**.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         */
          $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
        }
        $urlRouter.update(true);

        return $state.current;
      }).then(null, function (error) {
        if ($state.transition !== transition) return TransitionSuperseded;

        $state.transition = null;
        /**
         * @ngdoc event
         * @name ui.router.state.$state#$stateChangeError
         * @eventOf ui.router.state.$state
         * @eventType broadcast on root scope
         * @description
         * Fired when an **error occurs** during transition. It's important to note that if you
         * have any errors in your resolve functions (javascript errors, non-existent services, etc)
         * they will not throw traditionally. You must listen for this $stateChangeError event to
         * catch **ALL** errors.
         *
         * @param {Object} event Event object.
         * @param {State} toState The state being transitioned to.
         * @param {Object} toParams The params supplied to the `toState`.
         * @param {State} fromState The current state, pre-transition.
         * @param {Object} fromParams The params supplied to the `fromState`.
         * @param {Error} error The resolve error object.
         */
        evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);

        if (!evt.defaultPrevented) {
            $urlRouter.update();
        }

        return $q.reject(error);
      });

      return transition;
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#is
     * @methodOf ui.router.state.$state
     *
     * @description
     * Similar to {@link ui.router.state.$state#methods_includes $state.includes},
     * but only checks for the full state name. If params is supplied then it will be
     * tested for strict equality against the current active params object, so all params
     * must match with none missing and no extras.
     *
     * @example
     * <pre>
     * $state.$current.name = 'contacts.details.item';
     *
     * // absolute name
     * $state.is('contact.details.item'); // returns true
     * $state.is(contactDetailItemStateObject); // returns true
     *
     * // relative name (. and ^), typically from a template
     * // E.g. from the 'contacts.details' template
     * <div ng-class="{highlighted: $state.is('.item')}">Item</div>
     * </pre>
     *
     * @param {string|object} stateOrName The state name (absolute or relative) or state object you'd like to check.
     * @param {object=} params A param object, e.g. `{sectionId: section.id}`, that you'd like
     * to test against the current active state.
     * @param {object=} options An options object.  The options are:
     *
     * - **`relative`** - {string|object} -  If `stateOrName` is a relative state name and `options.relative` is set, .is will
     * test relative to `options.relative` state (or name).
     *
     * @returns {boolean} Returns true if it is the state.
     */
    $state.is = function is(stateOrName, params, options) {
      options = extend({ relative: $state.$current }, options || {});
      var state = findState(stateOrName, options.relative);

      if (!isDefined(state)) { return undefined; }
      if ($state.$current !== state) { return false; }
      return params ? equalForKeys(state.params.$$values(params), $stateParams) : true;
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#includes
     * @methodOf ui.router.state.$state
     *
     * @description
     * A method to determine if the current active state is equal to or is the child of the
     * state stateName. If any params are passed then they will be tested for a match as well.
     * Not all the parameters need to be passed, just the ones you'd like to test for equality.
     *
     * @example
     * Partial and relative names
     * <pre>
     * $state.$current.name = 'contacts.details.item';
     *
     * // Using partial names
     * $state.includes("contacts"); // returns true
     * $state.includes("contacts.details"); // returns true
     * $state.includes("contacts.details.item"); // returns true
     * $state.includes("contacts.list"); // returns false
     * $state.includes("about"); // returns false
     *
     * // Using relative names (. and ^), typically from a template
     * // E.g. from the 'contacts.details' template
     * <div ng-class="{highlighted: $state.includes('.item')}">Item</div>
     * </pre>
     *
     * Basic globbing patterns
     * <pre>
     * $state.$current.name = 'contacts.details.item.url';
     *
     * $state.includes("*.details.*.*"); // returns true
     * $state.includes("*.details.**"); // returns true
     * $state.includes("**.item.**"); // returns true
     * $state.includes("*.details.item.url"); // returns true
     * $state.includes("*.details.*.url"); // returns true
     * $state.includes("*.details.*"); // returns false
     * $state.includes("item.**"); // returns false
     * </pre>
     *
     * @param {string} stateOrName A partial name, relative name, or glob pattern
     * to be searched for within the current state name.
     * @param {object=} params A param object, e.g. `{sectionId: section.id}`,
     * that you'd like to test against the current active state.
     * @param {object=} options An options object.  The options are:
     *
     * - **`relative`** - {string|object=} -  If `stateOrName` is a relative state reference and `options.relative` is set,
     * .includes will test relative to `options.relative` state (or name).
     *
     * @returns {boolean} Returns true if it does include the state
     */
    $state.includes = function includes(stateOrName, params, options) {
      options = extend({ relative: $state.$current }, options || {});
      if (isString(stateOrName) && isGlob(stateOrName)) {
        if (!doesStateMatchGlob(stateOrName)) {
          return false;
        }
        stateOrName = $state.$current.name;
      }

      var state = findState(stateOrName, options.relative);
      if (!isDefined(state)) { return undefined; }
      if (!isDefined($state.$current.includes[state.name])) { return false; }
      return params ? equalForKeys(state.params.$$values(params), $stateParams, objectKeys(params)) : true;
    };


    /**
     * @ngdoc function
     * @name ui.router.state.$state#href
     * @methodOf ui.router.state.$state
     *
     * @description
     * A url generation method that returns the compiled url for the given state populated with the given params.
     *
     * @example
     * <pre>
     * expect($state.href("about.person", { person: "bob" })).toEqual("/about/bob");
     * </pre>
     *
     * @param {string|object} stateOrName The state name or state object you'd like to generate a url from.
     * @param {object=} params An object of parameter values to fill the state's required parameters.
     * @param {object=} options Options object. The options are:
     *
     * - **`lossy`** - {boolean=true} -  If true, and if there is no url associated with the state provided in the
     *    first parameter, then the constructed href url will be built from the first navigable ancestor (aka
     *    ancestor with a valid url).
     * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
     * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'), 
     *    defines which state to be relative from.
     * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
     * 
     * @returns {string} compiled state url
     */
    $state.href = function href(stateOrName, params, options) {
      options = extend({
        lossy:    true,
        inherit:  true,
        absolute: false,
        relative: $state.$current
      }, options || {});

      var state = findState(stateOrName, options.relative);

      if (!isDefined(state)) return null;
      if (options.inherit) params = inheritParams($stateParams, params || {}, $state.$current, state);
      
      var nav = (state && options.lossy) ? state.navigable : state;

      if (!nav || nav.url === undefined || nav.url === null) {
        return null;
      }
      return $urlRouter.href(nav.url, filterByKeys(state.params.$$keys().concat('#'), params || {}), {
        absolute: options.absolute
      });
    };

    /**
     * @ngdoc function
     * @name ui.router.state.$state#get
     * @methodOf ui.router.state.$state
     *
     * @description
     * Returns the state configuration object for any specific state or all states.
     *
     * @param {string|object=} stateOrName (absolute or relative) If provided, will only get the config for
     * the requested state. If not provided, returns an array of ALL state configs.
     * @param {string|object=} context When stateOrName is a relative state reference, the state will be retrieved relative to context.
     * @returns {Object|Array} State configuration object or array of all objects.
     */
    $state.get = function (stateOrName, context) {
      if (arguments.length === 0) return map(objectKeys(states), function(name) { return states[name].self; });
      var state = findState(stateOrName, context || $state.$current);
      return (state && state.self) ? state.self : null;
    };

    function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
      // Make a restricted $stateParams with only the parameters that apply to this state if
      // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
      // we also need $stateParams to be available for any $injector calls we make during the
      // dependency resolution process.
      var $stateParams = (paramsAreFiltered) ? params : filterByKeys(state.params.$$keys(), params);
      var locals = { $stateParams: $stateParams };

      // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
      // We're also including $stateParams in this; that way the parameters are restricted
      // to the set that should be visible to the state, and are independent of when we update
      // the global $state and $stateParams values.
      dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
      var promises = [dst.resolve.then(function (globals) {
        dst.globals = globals;
      })];
      if (inherited) promises.push(inherited);

      function resolveViews() {
        var viewsPromises = [];

        // Resolve template and dependencies for all views.
        forEach(state.views, function (view, name) {
          var injectables = (view.resolve && view.resolve !== state.resolve ? view.resolve : {});
          injectables.$template = [ function () {
            return $view.load(name, { view: view, locals: dst.globals, params: $stateParams, notify: options.notify }) || '';
          }];

          viewsPromises.push($resolve.resolve(injectables, dst.globals, dst.resolve, state).then(function (result) {
            // References to the controller (only instantiated at link time)
            if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
              var injectLocals = angular.extend({}, injectables, dst.globals);
              result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
            } else {
              result.$$controller = view.controller;
            }
            // Provide access to the state itself for internal use
            result.$$state = state;
            result.$$controllerAs = view.controllerAs;
            result.$$resolveAs = view.resolveAs;
            dst[name] = result;
          }));
        });

        return $q.all(viewsPromises).then(function(){
          return dst.globals;
        });
      }

      // Wait for all the promises and then return the activation object
      return $q.all(promises).then(resolveViews).then(function (values) {
        return dst;
      });
    }

    return $state;
  }

  function shouldSkipReload(to, toParams, from, fromParams, locals, options) {
    // Return true if there are no differences in non-search (path/object) params, false if there are differences
    function nonSearchParamsEqual(fromAndToState, fromParams, toParams) {
      // Identify whether all the parameters that differ between `fromParams` and `toParams` were search params.
      function notSearchParam(key) {
        return fromAndToState.params[key].location != "search";
      }
      var nonQueryParamKeys = fromAndToState.params.$$keys().filter(notSearchParam);
      var nonQueryParams = pick.apply({}, [fromAndToState.params].concat(nonQueryParamKeys));
      var nonQueryParamSet = new $$UMFP.ParamSet(nonQueryParams);
      return nonQueryParamSet.$$equals(fromParams, toParams);
    }

    // If reload was not explicitly requested
    // and we're transitioning to the same state we're already in
    // and    the locals didn't change
    //     or they changed in a way that doesn't merit reloading
    //        (reloadOnParams:false, or reloadOnSearch.false and only search params changed)
    // Then return true.
    if (!options.reload && to === from &&
      (locals === from.locals || (to.self.reloadOnSearch === false && nonSearchParamsEqual(from, fromParams, toParams)))) {
      return true;
    }
  }
}

angular.module('ui.router.state')
  .factory('$stateParams', function () { return {}; })
  .constant("$state.runtime", { autoinject: true })
  .provider('$state', $StateProvider)
  // Inject $state to initialize when entering runtime. #2574
  .run(['$injector', function ($injector) {
    // Allow tests (stateSpec.js) to turn this off by defining this constant
    if ($injector.get("$state.runtime").autoinject) {
      $injector.get('$state');
    }
  }]);


$ViewProvider.$inject = [];
function $ViewProvider() {

  this.$get = $get;
  /**
   * @ngdoc object
   * @name ui.router.state.$view
   *
   * @requires ui.router.util.$templateFactory
   * @requires $rootScope
   *
   * @description
   *
   */
  $get.$inject = ['$rootScope', '$templateFactory'];
  function $get(   $rootScope,   $templateFactory) {
    return {
      // $view.load('full.viewName', { template: ..., controller: ..., resolve: ..., async: false, params: ... })
      /**
       * @ngdoc function
       * @name ui.router.state.$view#load
       * @methodOf ui.router.state.$view
       *
       * @description
       *
       * @param {string} name name
       * @param {object} options option object.
       */
      load: function load(name, options) {
        var result, defaults = {
          template: null, controller: null, view: null, locals: null, notify: true, async: true, params: {}
        };
        options = extend(defaults, options);

        if (options.view) {
          result = $templateFactory.fromConfig(options.view, options.params, options.locals);
        }
        return result;
      }
    };
  }
}

angular.module('ui.router.state').provider('$view', $ViewProvider);

/**
 * @ngdoc object
 * @name ui.router.state.$uiViewScrollProvider
 *
 * @description
 * Provider that returns the {@link ui.router.state.$uiViewScroll} service function.
 */
function $ViewScrollProvider() {

  var useAnchorScroll = false;

  /**
   * @ngdoc function
   * @name ui.router.state.$uiViewScrollProvider#useAnchorScroll
   * @methodOf ui.router.state.$uiViewScrollProvider
   *
   * @description
   * Reverts back to using the core [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll) service for
   * scrolling based on the url anchor.
   */
  this.useAnchorScroll = function () {
    useAnchorScroll = true;
  };

  /**
   * @ngdoc object
   * @name ui.router.state.$uiViewScroll
   *
   * @requires $anchorScroll
   * @requires $timeout
   *
   * @description
   * When called with a jqLite element, it scrolls the element into view (after a
   * `$timeout` so the DOM has time to refresh).
   *
   * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
   * this can be enabled by calling {@link ui.router.state.$uiViewScrollProvider#methods_useAnchorScroll `$uiViewScrollProvider.useAnchorScroll()`}.
   */
  this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
    if (useAnchorScroll) {
      return $anchorScroll;
    }

    return function ($element) {
      return $timeout(function () {
        $element[0].scrollIntoView();
      }, 0, false);
    };
  }];
}

angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-view
 *
 * @requires ui.router.state.$state
 * @requires $compile
 * @requires $controller
 * @requires $injector
 * @requires ui.router.state.$uiViewScroll
 * @requires $document
 *
 * @restrict ECA
 *
 * @description
 * The ui-view directive tells $state where to place your templates.
 *
 * @param {string=} name A view name. The name should be unique amongst the other views in the
 * same state. You can have views of the same name that live in different states.
 *
 * @param {string=} autoscroll It allows you to set the scroll behavior of the browser window
 * when a view is populated. By default, $anchorScroll is overridden by ui-router's custom scroll
 * service, {@link ui.router.state.$uiViewScroll}. This custom service let's you
 * scroll ui-view elements into view when they are populated during a state activation.
 *
 * *Note: To revert back to old [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll)
 * functionality, call `$uiViewScrollProvider.useAnchorScroll()`.*
 *
 * @param {string=} onload Expression to evaluate whenever the view updates.
 *
 * @example
 * A view can be unnamed or named.
 * <pre>
 * <!-- Unnamed -->
 * <div ui-view></div>
 *
 * <!-- Named -->
 * <div ui-view="viewName"></div>
 * </pre>
 *
 * You can only have one unnamed view within any template (or root html). If you are only using a
 * single view and it is unnamed then you can populate it like so:
 * <pre>
 * <div ui-view></div>
 * $stateProvider.state("home", {
 *   template: "<h1>HELLO!</h1>"
 * })
 * </pre>
 *
 * The above is a convenient shortcut equivalent to specifying your view explicitly with the {@link ui.router.state.$stateProvider#methods_state `views`}
 * config property, by name, in this case an empty name:
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 *
 * But typically you'll only use the views property if you name your view or have more than one view
 * in the same template. There's not really a compelling reason to name a view if its the only one,
 * but you could if you wanted, like so:
 * <pre>
 * <div ui-view="main"></div>
 * </pre>
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "main": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }    
 * })
 * </pre>
 *
 * Really though, you'll use views to set up multiple views:
 * <pre>
 * <div ui-view></div>
 * <div ui-view="chart"></div>
 * <div ui-view="data"></div>
 * </pre>
 *
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     },
 *     "chart": {
 *       template: "<chart_thing/>"
 *     },
 *     "data": {
 *       template: "<data_thing/>"
 *     }
 *   }    
 * })
 * </pre>
 *
 * Examples for `autoscroll`:
 *
 * <pre>
 * <!-- If autoscroll present with no expression,
 *      then scroll ui-view into view -->
 * <ui-view autoscroll/>
 *
 * <!-- If autoscroll present with valid expression,
 *      then scroll ui-view into view if expression evaluates to true -->
 * <ui-view autoscroll='true'/>
 * <ui-view autoscroll='false'/>
 * <ui-view autoscroll='scopeVariable'/>
 * </pre>
 *
 * Resolve data:
 *
 * The resolved data from the state's `resolve` block is placed on the scope as `$resolve` (this
 * can be customized using [[ViewDeclaration.resolveAs]]).  This can be then accessed from the template.
 *
 * Note that when `controllerAs` is being used, `$resolve` is set on the controller instance *after* the
 * controller is instantiated.  The `$onInit()` hook can be used to perform initialization code which
 * depends on `$resolve` data.
 *
 * Example usage of $resolve in a view template
 * <pre>
 * $stateProvider.state('home', {
 *   template: '<my-component user="$resolve.user"></my-component>',
 *   resolve: {
 *     user: function(UserService) { return UserService.fetchUser(); }
 *   }
 * });
 * </pre>
 */
$ViewDirective.$inject = ['$state', '$injector', '$uiViewScroll', '$interpolate', '$q'];
function $ViewDirective(   $state,   $injector,   $uiViewScroll,   $interpolate,   $q) {

  function getService() {
    return ($injector.has) ? function(service) {
      return $injector.has(service) ? $injector.get(service) : null;
    } : function(service) {
      try {
        return $injector.get(service);
      } catch (e) {
        return null;
      }
    };
  }

  var service = getService(),
      $animator = service('$animator'),
      $animate = service('$animate');

  // Returns a set of DOM manipulation functions based on which Angular version
  // it should use
  function getRenderer(attrs, scope) {
    var statics = function() {
      return {
        enter: function (element, target, cb) { target.after(element); cb(); },
        leave: function (element, cb) { element.remove(); cb(); }
      };
    };

    if ($animate) {
      return {
        enter: function(element, target, cb) {
          if (angular.version.minor > 2) {
            $animate.enter(element, null, target).then(cb);
          } else {
            $animate.enter(element, null, target, cb);
          }
        },
        leave: function(element, cb) {
          if (angular.version.minor > 2) {
            $animate.leave(element).then(cb);
          } else {
            $animate.leave(element, cb);
          }
        }
      };
    }

    if ($animator) {
      var animate = $animator && $animator(scope, attrs);

      return {
        enter: function(element, target, cb) {animate.enter(element, null, target); cb(); },
        leave: function(element, cb) { animate.leave(element); cb(); }
      };
    }

    return statics();
  }

  var directive = {
    restrict: 'ECA',
    terminal: true,
    priority: 400,
    transclude: 'element',
    compile: function (tElement, tAttrs, $transclude) {
      return function (scope, $element, attrs) {
        var previousEl, currentEl, currentScope, latestLocals,
            onloadExp     = attrs.onload || '',
            autoScrollExp = attrs.autoscroll,
            renderer      = getRenderer(attrs, scope),
            inherited     = $element.inheritedData('$uiView');

        scope.$on('$stateChangeSuccess', function() {
          updateView(false);
        });

        updateView(true);

        function cleanupLastView() {
          if (previousEl) {
            previousEl.remove();
            previousEl = null;
          }

          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }

          if (currentEl) {
            var $uiViewData = currentEl.data('$uiViewAnim');
            renderer.leave(currentEl, function() {
              $uiViewData.$$animLeave.resolve();
              previousEl = null;
            });

            previousEl = currentEl;
            currentEl = null;
          }
        }

        function updateView(firstTime) {
          var newScope,
              name            = getUiViewName(scope, attrs, $element, $interpolate),
              previousLocals  = name && $state.$current && $state.$current.locals[name];

          if (!firstTime && previousLocals === latestLocals) return; // nothing to do
          newScope = scope.$new();
          latestLocals = $state.$current.locals[name];

          /**
           * @ngdoc event
           * @name ui.router.state.directive:ui-view#$viewContentLoading
           * @eventOf ui.router.state.directive:ui-view
           * @eventType emits on ui-view directive scope
           * @description
           *
           * Fired once the view **begins loading**, *before* the DOM is rendered.
           *
           * @param {Object} event Event object.
           * @param {string} viewName Name of the view.
           */
          newScope.$emit('$viewContentLoading', name);

          var clone = $transclude(newScope, function(clone) {
            var animEnter = $q.defer(), animLeave = $q.defer();
            var viewAnimData = {
              $animEnter: animEnter.promise,
              $animLeave: animLeave.promise,
              $$animLeave: animLeave
            };

            clone.data('$uiViewAnim', viewAnimData);
            renderer.enter(clone, $element, function onUiViewEnter() {
              animEnter.resolve();
              if(currentScope) {
                currentScope.$emit('$viewContentAnimationEnded');
              }

              if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                $uiViewScroll(clone);
              }
            });
            cleanupLastView();
          });

          currentEl = clone;
          currentScope = newScope;
          /**
           * @ngdoc event
           * @name ui.router.state.directive:ui-view#$viewContentLoaded
           * @eventOf ui.router.state.directive:ui-view
           * @eventType emits on ui-view directive scope
           * @description
           * Fired once the view is **loaded**, *after* the DOM is rendered.
           *
           * @param {Object} event Event object.
           * @param {string} viewName Name of the view.
           */
          currentScope.$emit('$viewContentLoaded', name);
          currentScope.$eval(onloadExp);
        }
      };
    }
  };

  return directive;
}

$ViewDirectiveFill.$inject = ['$compile', '$controller', '$state', '$interpolate'];
function $ViewDirectiveFill (  $compile,   $controller,   $state,   $interpolate) {
  return {
    restrict: 'ECA',
    priority: -400,
    compile: function (tElement) {
      var initial = tElement.html();
      return function (scope, $element, attrs) {
        var current = $state.$current,
            name = getUiViewName(scope, attrs, $element, $interpolate),
            locals  = current && current.locals[name];

        if (! locals) {
          return;
        }

        $element.data('$uiView', { name: name, state: locals.$$state });
        $element.html(locals.$template ? locals.$template : initial);

        var resolveData = angular.extend({}, locals);
        scope[locals.$$resolveAs] = resolveData;

        var link = $compile($element.contents());

        if (locals.$$controller) {
          locals.$scope = scope;
          locals.$element = $element;
          var controller = $controller(locals.$$controller, locals);
          if (locals.$$controllerAs) {
            scope[locals.$$controllerAs] = controller;
            scope[locals.$$controllerAs][locals.$$resolveAs] = resolveData;
          }
          if (isFunction(controller.$onInit)) controller.$onInit();
          $element.data('$ngControllerController', controller);
          $element.children().data('$ngControllerController', controller);
        }

        link(scope);
      };
    }
  };
}

/**
 * Shared ui-view code for both directives:
 * Given scope, element, and its attributes, return the view's name
 */
function getUiViewName(scope, attrs, element, $interpolate) {
  var name = $interpolate(attrs.uiView || attrs.name || '')(scope);
  var uiViewCreatedBy = element.inheritedData('$uiView');
  return name.indexOf('@') >= 0 ?  name :  (name + '@' + (uiViewCreatedBy ? uiViewCreatedBy.state.name : ''));
}

angular.module('ui.router.state').directive('uiView', $ViewDirective);
angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);

function parseStateRef(ref, current) {
  var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
  if (preparsed) ref = current + '(' + preparsed[1] + ')';
  parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
  if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
  return { state: parsed[1], paramExpr: parsed[3] || null };
}

function stateContext(el) {
  var stateData = el.parent().inheritedData('$uiView');

  if (stateData && stateData.state && stateData.state.name) {
    return stateData.state;
  }
}

function getTypeInfo(el) {
  // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
  var isSvg = Object.prototype.toString.call(el.prop('href')) === '[object SVGAnimatedString]';
  var isForm = el[0].nodeName === "FORM";

  return {
    attr: isForm ? "action" : (isSvg ? 'xlink:href' : 'href'),
    isAnchor: el.prop("tagName").toUpperCase() === "A",
    clickable: !isForm
  };
}

function clickHook(el, $state, $timeout, type, current) {
  return function(e) {
    var button = e.which || e.button, target = current();

    if (!(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || el.attr('target'))) {
      // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
      var transition = $timeout(function() {
        $state.go(target.state, target.params, target.options);
      });
      e.preventDefault();

      // if the state has no URL, ignore one preventDefault from the <a> directive.
      var ignorePreventDefaultCount = type.isAnchor && !target.href ? 1: 0;

      e.preventDefault = function() {
        if (ignorePreventDefaultCount-- <= 0) $timeout.cancel(transition);
      };
    }
  };
}

function defaultOpts(el, $state) {
  return { relative: stateContext(el) || $state.$current, inherit: true };
}

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref
 *
 * @requires ui.router.state.$state
 * @requires $timeout
 *
 * @restrict A
 *
 * @description
 * A directive that binds a link (`<a>` tag) to a state. If the state has an associated
 * URL, the directive will automatically generate & update the `href` attribute via
 * the {@link ui.router.state.$state#methods_href $state.href()} method. Clicking
 * the link will trigger a state transition with optional parameters.
 *
 * Also middle-clicking, right-clicking, and ctrl-clicking on the link will be
 * handled natively by the browser.
 *
 * You can also use relative state paths within ui-sref, just like the relative
 * paths passed to `$state.go()`. You just need to be aware that the path is relative
 * to the state that the link lives in, in other words the state that loaded the
 * template containing the link.
 *
 * You can specify options to pass to {@link ui.router.state.$state#methods_go $state.go()}
 * using the `ui-sref-opts` attribute. Options are restricted to `location`, `inherit`,
 * and `reload`.
 *
 * @example
 * Here's an example of how you'd use ui-sref and how it would compile. If you have the
 * following template:
 * <pre>
 * <a ui-sref="home">Home</a> | <a ui-sref="about">About</a> | <a ui-sref="{page: 2}">Next page</a>
 *
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a ui-sref="contacts.detail({ id: contact.id })">{{ contact.name }}</a>
 *     </li>
 * </ul>
 * </pre>
 *
 * Then the compiled html would be (assuming Html5Mode is off and current state is contacts):
 * <pre>
 * <a href="#/home" ui-sref="home">Home</a> | <a href="#/about" ui-sref="about">About</a> | <a href="#/contacts?page=2" ui-sref="{page: 2}">Next page</a>
 *
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/1" ui-sref="contacts.detail({ id: contact.id })">Joe</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/2" ui-sref="contacts.detail({ id: contact.id })">Alice</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/3" ui-sref="contacts.detail({ id: contact.id })">Bob</a>
 *     </li>
 * </ul>
 *
 * <a ui-sref="home" ui-sref-opts="{reload: true}">Home</a>
 * </pre>
 *
 * @param {string} ui-sref 'stateName' can be any valid absolute or relative state
 * @param {Object} ui-sref-opts options to pass to {@link ui.router.state.$state#methods_go $state.go()}
 */
$StateRefDirective.$inject = ['$state', '$timeout'];
function $StateRefDirective($state, $timeout) {
  return {
    restrict: 'A',
    require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
    link: function(scope, element, attrs, uiSrefActive) {
      var ref    = parseStateRef(attrs.uiSref, $state.current.name);
      var def    = { state: ref.state, href: null, params: null };
      var type   = getTypeInfo(element);
      var active = uiSrefActive[1] || uiSrefActive[0];
      var unlinkInfoFn = null;
      var hookFn;

      def.options = extend(defaultOpts(element, $state), attrs.uiSrefOpts ? scope.$eval(attrs.uiSrefOpts) : {});

      var update = function(val) {
        if (val) def.params = angular.copy(val);
        def.href = $state.href(ref.state, def.params, def.options);

        if (unlinkInfoFn) unlinkInfoFn();
        if (active) unlinkInfoFn = active.$$addStateInfo(ref.state, def.params);
        if (def.href !== null) attrs.$set(type.attr, def.href);
      };

      if (ref.paramExpr) {
        scope.$watch(ref.paramExpr, function(val) { if (val !== def.params) update(val); }, true);
        def.params = angular.copy(scope.$eval(ref.paramExpr));
      }
      update();

      if (!type.clickable) return;
      hookFn = clickHook(element, $state, $timeout, type, function() { return def; });
      element.bind("click", hookFn);
      scope.$on('$destroy', function() {
        element.unbind("click", hookFn);
      });
    }
  };
}

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-state
 *
 * @requires ui.router.state.uiSref
 *
 * @restrict A
 *
 * @description
 * Much like ui-sref, but will accept named $scope properties to evaluate for a state definition,
 * params and override options.
 *
 * @param {string} ui-state 'stateName' can be any valid absolute or relative state
 * @param {Object} ui-state-params params to pass to {@link ui.router.state.$state#methods_href $state.href()}
 * @param {Object} ui-state-opts options to pass to {@link ui.router.state.$state#methods_go $state.go()}
 */
$StateRefDynamicDirective.$inject = ['$state', '$timeout'];
function $StateRefDynamicDirective($state, $timeout) {
  return {
    restrict: 'A',
    require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
    link: function(scope, element, attrs, uiSrefActive) {
      var type   = getTypeInfo(element);
      var active = uiSrefActive[1] || uiSrefActive[0];
      var group  = [attrs.uiState, attrs.uiStateParams || null, attrs.uiStateOpts || null];
      var watch  = '[' + group.map(function(val) { return val || 'null'; }).join(', ') + ']';
      var def    = { state: null, params: null, options: null, href: null };
      var unlinkInfoFn = null;
      var hookFn;

      function runStateRefLink (group) {
        def.state = group[0]; def.params = group[1]; def.options = group[2];
        def.href = $state.href(def.state, def.params, def.options);

        if (unlinkInfoFn) unlinkInfoFn();
        if (active) unlinkInfoFn = active.$$addStateInfo(def.state, def.params);
        if (def.href) attrs.$set(type.attr, def.href);
      }

      scope.$watch(watch, runStateRefLink, true);
      runStateRefLink(scope.$eval(watch));

      if (!type.clickable) return;
      hookFn = clickHook(element, $state, $timeout, type, function() { return def; });
      element.bind("click", hookFn);
      scope.$on('$destroy', function() {
        element.unbind("click", hookFn);
      });
    }
  };
}


/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * A directive working alongside ui-sref to add classes to an element when the
 * related ui-sref directive's state is active, and removing them when it is inactive.
 * The primary use-case is to simplify the special appearance of navigation menus
 * relying on `ui-sref`, by having the "active" state's menu button appear different,
 * distinguishing it from the inactive menu items.
 *
 * ui-sref-active can live on the same element as ui-sref or on a parent element. The first
 * ui-sref-active found at the same level or above the ui-sref will be used.
 *
 * Will activate when the ui-sref's target state or any child state is active. If you
 * need to activate only when the ui-sref target state is active and *not* any of
 * it's children, then you will use
 * {@link ui.router.state.directive:ui-sref-active-eq ui-sref-active-eq}
 *
 * @example
 * Given the following template:
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item">
 *     <a href ui-sref="app.user({user: 'bilbobaggins'})">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 *
 * When the app state is "app.user" (or any children states), and contains the state parameter "user" with value "bilbobaggins",
 * the resulting HTML will appear as (note the 'active' class):
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item active">
 *     <a ui-sref="app.user({user: 'bilbobaggins'})" href="/users/bilbobaggins">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 * The class name is interpolated **once** during the directives link time (any further changes to the
 * interpolated value are ignored).
 *
 * Multiple classes may be specified in a space-separated format:
 * <pre>
 * <ul>
 *   <li ui-sref-active='class1 class2 class3'>
 *     <a ui-sref="app.user">link</a>
 *   </li>
 * </ul>
 * </pre>
 *
 * It is also possible to pass ui-sref-active an expression that evaluates
 * to an object hash, whose keys represent active class names and whose
 * values represent the respective state names/globs.
 * ui-sref-active will match if the current active state **includes** any of
 * the specified state names/globs, even the abstract ones.
 *
 * @Example
 * Given the following template, with "admin" being an abstract state:
 * <pre>
 * <div ui-sref-active="{'active': 'admin.*'}">
 *   <a ui-sref-active="active" ui-sref="admin.roles">Roles</a>
 * </div>
 * </pre>
 *
 * When the current state is "admin.roles" the "active" class will be applied
 * to both the <div> and <a> elements. It is important to note that the state
 * names/globs passed to ui-sref-active shadow the state provided by ui-sref.
 */

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active-eq
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * The same as {@link ui.router.state.directive:ui-sref-active ui-sref-active} but will only activate
 * when the exact target state used in the `ui-sref` is active; no child states.
 *
 */
$StateRefActiveDirective.$inject = ['$state', '$stateParams', '$interpolate'];
function $StateRefActiveDirective($state, $stateParams, $interpolate) {
  return  {
    restrict: "A",
    controller: ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
      var states = [], activeClasses = {}, activeEqClass, uiSrefActive;

      // There probably isn't much point in $observing this
      // uiSrefActive and uiSrefActiveEq share the same directive object with some
      // slight difference in logic routing
      activeEqClass = $interpolate($attrs.uiSrefActiveEq || '', false)($scope);

      try {
        uiSrefActive = $scope.$eval($attrs.uiSrefActive);
      } catch (e) {
        // Do nothing. uiSrefActive is not a valid expression.
        // Fall back to using $interpolate below
      }
      uiSrefActive = uiSrefActive || $interpolate($attrs.uiSrefActive || '', false)($scope);
      if (isObject(uiSrefActive)) {
        forEach(uiSrefActive, function(stateOrName, activeClass) {
          if (isString(stateOrName)) {
            var ref = parseStateRef(stateOrName, $state.current.name);
            addState(ref.state, $scope.$eval(ref.paramExpr), activeClass);
          }
        });
      }

      // Allow uiSref to communicate with uiSrefActive[Equals]
      this.$$addStateInfo = function (newState, newParams) {
        // we already got an explicit state provided by ui-sref-active, so we
        // shadow the one that comes from ui-sref
        if (isObject(uiSrefActive) && states.length > 0) {
          return;
        }
        var deregister = addState(newState, newParams, uiSrefActive);
        update();
        return deregister;
      };

      $scope.$on('$stateChangeSuccess', update);

      function addState(stateName, stateParams, activeClass) {
        var state = $state.get(stateName, stateContext($element));
        var stateHash = createStateHash(stateName, stateParams);

        var stateInfo = {
          state: state || { name: stateName },
          params: stateParams,
          hash: stateHash
        };

        states.push(stateInfo);
        activeClasses[stateHash] = activeClass;

        return function removeState() {
          var idx = states.indexOf(stateInfo);
          if (idx !== -1) states.splice(idx, 1);
        };
      }

      /**
       * @param {string} state
       * @param {Object|string} [params]
       * @return {string}
       */
      function createStateHash(state, params) {
        if (!isString(state)) {
          throw new Error('state should be a string');
        }
        if (isObject(params)) {
          return state + toJson(params);
        }
        params = $scope.$eval(params);
        if (isObject(params)) {
          return state + toJson(params);
        }
        return state;
      }

      // Update route state
      function update() {
        for (var i = 0; i < states.length; i++) {
          if (anyMatch(states[i].state, states[i].params)) {
            addClass($element, activeClasses[states[i].hash]);
          } else {
            removeClass($element, activeClasses[states[i].hash]);
          }

          if (exactMatch(states[i].state, states[i].params)) {
            addClass($element, activeEqClass);
          } else {
            removeClass($element, activeEqClass);
          }
        }
      }

      function addClass(el, className) { $timeout(function () { el.addClass(className); }); }
      function removeClass(el, className) { el.removeClass(className); }
      function anyMatch(state, params) { return $state.includes(state.name, params); }
      function exactMatch(state, params) { return $state.is(state.name, params); }

      update();
    }]
  };
}

angular.module('ui.router.state')
  .directive('uiSref', $StateRefDirective)
  .directive('uiSrefActive', $StateRefActiveDirective)
  .directive('uiSrefActiveEq', $StateRefActiveDirective)
  .directive('uiState', $StateRefDynamicDirective);

/**
 * @ngdoc filter
 * @name ui.router.state.filter:isState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_is $state.is("stateName")}.
 */
$IsStateFilter.$inject = ['$state'];
function $IsStateFilter($state) {
  var isFilter = function (state, params) {
    return $state.is(state, params);
  };
  isFilter.$stateful = true;
  return isFilter;
}

/**
 * @ngdoc filter
 * @name ui.router.state.filter:includedByState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
 */
$IncludedByStateFilter.$inject = ['$state'];
function $IncludedByStateFilter($state) {
  var includesFilter = function (state, params, options) {
    return $state.includes(state, params, options);
  };
  includesFilter.$stateful = true;
  return  includesFilter;
}

angular.module('ui.router.state')
  .filter('isState', $IsStateFilter)
  .filter('includedByState', $IncludedByStateFilter);
})(window, window.angular);
},{}],4:[function(require,module,exports){
/**!
 * AngularJS file upload directives and services. Supports: file upload/drop/paste, resume, cancel/abort,
 * progress, resize, thumbnail, preview, validation and CORS
 * FileAPI Flash shim for old browsers not supporting FormData
 * @author  Danial  <danial.farid@gmail.com>
 * @version 12.2.12
 */

(function () {
  /** @namespace FileAPI.noContentTimeout */

  function patchXHR(fnName, newFn) {
    window.XMLHttpRequest.prototype[fnName] = newFn(window.XMLHttpRequest.prototype[fnName]);
  }

  function redefineProp(xhr, prop, fn) {
    try {
      Object.defineProperty(xhr, prop, {get: fn});
    } catch (e) {/*ignore*/
    }
  }

  if (!window.FileAPI) {
    window.FileAPI = {};
  }

  if (!window.XMLHttpRequest) {
    throw 'AJAX is not supported. XMLHttpRequest is not defined.';
  }

  FileAPI.shouldLoad = !window.FormData || FileAPI.forceLoad;
  if (FileAPI.shouldLoad) {
    var initializeUploadListener = function (xhr) {
      if (!xhr.__listeners) {
        if (!xhr.upload) xhr.upload = {};
        xhr.__listeners = [];
        var origAddEventListener = xhr.upload.addEventListener;
        xhr.upload.addEventListener = function (t, fn) {
          xhr.__listeners[t] = fn;
          if (origAddEventListener) origAddEventListener.apply(this, arguments);
        };
      }
    };

    patchXHR('open', function (orig) {
      return function (m, url, b) {
        initializeUploadListener(this);
        this.__url = url;
        try {
          orig.apply(this, [m, url, b]);
        } catch (e) {
          if (e.message.indexOf('Access is denied') > -1) {
            this.__origError = e;
            orig.apply(this, [m, '_fix_for_ie_crossdomain__', b]);
          }
        }
      };
    });

    patchXHR('getResponseHeader', function (orig) {
      return function (h) {
        return this.__fileApiXHR && this.__fileApiXHR.getResponseHeader ? this.__fileApiXHR.getResponseHeader(h) : (orig == null ? null : orig.apply(this, [h]));
      };
    });

    patchXHR('getAllResponseHeaders', function (orig) {
      return function () {
        return this.__fileApiXHR && this.__fileApiXHR.getAllResponseHeaders ? this.__fileApiXHR.getAllResponseHeaders() : (orig == null ? null : orig.apply(this));
      };
    });

    patchXHR('abort', function (orig) {
      return function () {
        return this.__fileApiXHR && this.__fileApiXHR.abort ? this.__fileApiXHR.abort() : (orig == null ? null : orig.apply(this));
      };
    });

    patchXHR('setRequestHeader', function (orig) {
      return function (header, value) {
        if (header === '__setXHR_') {
          initializeUploadListener(this);
          var val = value(this);
          // fix for angular < 1.2.0
          if (val instanceof Function) {
            val(this);
          }
        } else {
          this.__requestHeaders = this.__requestHeaders || {};
          this.__requestHeaders[header] = value;
          orig.apply(this, arguments);
        }
      };
    });

    patchXHR('send', function (orig) {
      return function () {
        var xhr = this;
        if (arguments[0] && arguments[0].__isFileAPIShim) {
          var formData = arguments[0];
          var config = {
            url: xhr.__url,
            jsonp: false, //removes the callback form param
            cache: true, //removes the ?fileapiXXX in the url
            complete: function (err, fileApiXHR) {
              if (err && angular.isString(err) && err.indexOf('#2174') !== -1) {
                // this error seems to be fine the file is being uploaded properly.
                err = null;
              }
              xhr.__completed = true;
              if (!err && xhr.__listeners.load)
                xhr.__listeners.load({
                  type: 'load',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (!err && xhr.__listeners.loadend)
                xhr.__listeners.loadend({
                  type: 'loadend',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (err === 'abort' && xhr.__listeners.abort)
                xhr.__listeners.abort({
                  type: 'abort',
                  loaded: xhr.__loaded,
                  total: xhr.__total,
                  target: xhr,
                  lengthComputable: true
                });
              if (fileApiXHR.status !== undefined) redefineProp(xhr, 'status', function () {
                return (fileApiXHR.status === 0 && err && err !== 'abort') ? 500 : fileApiXHR.status;
              });
              if (fileApiXHR.statusText !== undefined) redefineProp(xhr, 'statusText', function () {
                return fileApiXHR.statusText;
              });
              redefineProp(xhr, 'readyState', function () {
                return 4;
              });
              if (fileApiXHR.response !== undefined) redefineProp(xhr, 'response', function () {
                return fileApiXHR.response;
              });
              var resp = fileApiXHR.responseText || (err && fileApiXHR.status === 0 && err !== 'abort' ? err : undefined);
              redefineProp(xhr, 'responseText', function () {
                return resp;
              });
              redefineProp(xhr, 'response', function () {
                return resp;
              });
              if (err) redefineProp(xhr, 'err', function () {
                return err;
              });
              xhr.__fileApiXHR = fileApiXHR;
              if (xhr.onreadystatechange) xhr.onreadystatechange();
              if (xhr.onload) xhr.onload();
            },
            progress: function (e) {
              e.target = xhr;
              if (xhr.__listeners.progress) xhr.__listeners.progress(e);
              xhr.__total = e.total;
              xhr.__loaded = e.loaded;
              if (e.total === e.loaded) {
                // fix flash issue that doesn't call complete if there is no response text from the server
                var _this = this;
                setTimeout(function () {
                  if (!xhr.__completed) {
                    xhr.getAllResponseHeaders = function () {
                    };
                    _this.complete(null, {status: 204, statusText: 'No Content'});
                  }
                }, FileAPI.noContentTimeout || 10000);
              }
            },
            headers: xhr.__requestHeaders
          };
          config.data = {};
          config.files = {};
          for (var i = 0; i < formData.data.length; i++) {
            var item = formData.data[i];
            if (item.val != null && item.val.name != null && item.val.size != null && item.val.type != null) {
              config.files[item.key] = item.val;
            } else {
              config.data[item.key] = item.val;
            }
          }

          setTimeout(function () {
            if (!FileAPI.hasFlash) {
              throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
            }
            xhr.__fileApiXHR = FileAPI.upload(config);
          }, 1);
        } else {
          if (this.__origError) {
            throw this.__origError;
          }
          orig.apply(xhr, arguments);
        }
      };
    });
    window.XMLHttpRequest.__isFileAPIShim = true;
    window.FormData = FormData = function () {
      return {
        append: function (key, val, name) {
          if (val.__isFileAPIBlobShim) {
            val = val.data[0];
          }
          this.data.push({
            key: key,
            val: val,
            name: name
          });
        },
        data: [],
        __isFileAPIShim: true
      };
    };

    window.Blob = Blob = function (b) {
      return {
        data: b,
        __isFileAPIBlobShim: true
      };
    };
  }

})();

(function () {
  /** @namespace FileAPI.forceLoad */
  /** @namespace window.FileAPI.jsUrl */
  /** @namespace window.FileAPI.jsPath */

  function isInputTypeFile(elem) {
    return elem[0].tagName.toLowerCase() === 'input' && elem.attr('type') && elem.attr('type').toLowerCase() === 'file';
  }

  function hasFlash() {
    try {
      var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (fo) return true;
    } catch (e) {
      if (navigator.mimeTypes['application/x-shockwave-flash'] !== undefined) return true;
    }
    return false;
  }

  function getOffset(obj) {
    var left = 0, top = 0;

    if (window.jQuery) {
      return jQuery(obj).offset();
    }

    if (obj.offsetParent) {
      do {
        left += (obj.offsetLeft - obj.scrollLeft);
        top += (obj.offsetTop - obj.scrollTop);
        obj = obj.offsetParent;
      } while (obj);
    }
    return {
      left: left,
      top: top
    };
  }

  if (FileAPI.shouldLoad) {
    FileAPI.hasFlash = hasFlash();

    //load FileAPI
    if (FileAPI.forceLoad) {
      FileAPI.html5 = false;
    }

    if (!FileAPI.upload) {
      var jsUrl, basePath, script = document.createElement('script'), allScripts = document.getElementsByTagName('script'), i, index, src;
      if (window.FileAPI.jsUrl) {
        jsUrl = window.FileAPI.jsUrl;
      } else if (window.FileAPI.jsPath) {
        basePath = window.FileAPI.jsPath;
      } else {
        for (i = 0; i < allScripts.length; i++) {
          src = allScripts[i].src;
          index = src.search(/\/ng\-file\-upload[\-a-zA-z0-9\.]*\.js/);
          if (index > -1) {
            basePath = src.substring(0, index + 1);
            break;
          }
        }
      }

      if (FileAPI.staticPath == null) FileAPI.staticPath = basePath;
      script.setAttribute('src', jsUrl || basePath + 'FileAPI.min.js');
      document.getElementsByTagName('head')[0].appendChild(script);
    }

    FileAPI.ngfFixIE = function (elem, fileElem, changeFn) {
      if (!hasFlash()) {
        throw 'Adode Flash Player need to be installed. To check ahead use "FileAPI.hasFlash"';
      }
      var fixInputStyle = function () {
        var label = fileElem.parent();
        if (elem.attr('disabled')) {
          if (label) label.removeClass('js-fileapi-wrapper');
        } else {
          if (!fileElem.attr('__ngf_flash_')) {
            fileElem.unbind('change');
            fileElem.unbind('click');
            fileElem.bind('change', function (evt) {
              fileApiChangeFn.apply(this, [evt]);
              changeFn.apply(this, [evt]);
            });
            fileElem.attr('__ngf_flash_', 'true');
          }
          label.addClass('js-fileapi-wrapper');
          if (!isInputTypeFile(elem)) {
            label.css('position', 'absolute')
              .css('top', getOffset(elem[0]).top + 'px').css('left', getOffset(elem[0]).left + 'px')
              .css('width', elem[0].offsetWidth + 'px').css('height', elem[0].offsetHeight + 'px')
              .css('filter', 'alpha(opacity=0)').css('display', elem.css('display'))
              .css('overflow', 'hidden').css('z-index', '900000')
              .css('visibility', 'visible');
            fileElem.css('width', elem[0].offsetWidth + 'px').css('height', elem[0].offsetHeight + 'px')
              .css('position', 'absolute').css('top', '0px').css('left', '0px');
          }
        }
      };

      elem.bind('mouseenter', fixInputStyle);

      var fileApiChangeFn = function (evt) {
        var files = FileAPI.getFiles(evt);
        //just a double check for #233
        for (var i = 0; i < files.length; i++) {
          if (files[i].size === undefined) files[i].size = 0;
          if (files[i].name === undefined) files[i].name = 'file';
          if (files[i].type === undefined) files[i].type = 'undefined';
        }
        if (!evt.target) {
          evt.target = {};
        }
        evt.target.files = files;
        // if evt.target.files is not writable use helper field
        if (evt.target.files !== files) {
          evt.__files_ = files;
        }
        (evt.__files_ || evt.target.files).item = function (i) {
          return (evt.__files_ || evt.target.files)[i] || null;
        };
      };
    };

    FileAPI.disableFileInput = function (elem, disable) {
      if (disable) {
        elem.removeClass('js-fileapi-wrapper');
      } else {
        elem.addClass('js-fileapi-wrapper');
      }
    };
  }
})();

if (!window.FileReader) {
  window.FileReader = function () {
    var _this = this, loadStarted = false;
    this.listeners = {};
    this.addEventListener = function (type, fn) {
      _this.listeners[type] = _this.listeners[type] || [];
      _this.listeners[type].push(fn);
    };
    this.removeEventListener = function (type, fn) {
      if (_this.listeners[type]) _this.listeners[type].splice(_this.listeners[type].indexOf(fn), 1);
    };
    this.dispatchEvent = function (evt) {
      var list = _this.listeners[evt.type];
      if (list) {
        for (var i = 0; i < list.length; i++) {
          list[i].call(_this, evt);
        }
      }
    };
    this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

    var constructEvent = function (type, evt) {
      var e = {type: type, target: _this, loaded: evt.loaded, total: evt.total, error: evt.error};
      if (evt.result != null) e.target.result = evt.result;
      return e;
    };
    var listener = function (evt) {
      if (!loadStarted) {
        loadStarted = true;
        if (_this.onloadstart) _this.onloadstart(constructEvent('loadstart', evt));
      }
      var e;
      if (evt.type === 'load') {
        if (_this.onloadend) _this.onloadend(constructEvent('loadend', evt));
        e = constructEvent('load', evt);
        if (_this.onload) _this.onload(e);
        _this.dispatchEvent(e);
      } else if (evt.type === 'progress') {
        e = constructEvent('progress', evt);
        if (_this.onprogress) _this.onprogress(e);
        _this.dispatchEvent(e);
      } else {
        e = constructEvent('error', evt);
        if (_this.onerror) _this.onerror(e);
        _this.dispatchEvent(e);
      }
    };
    this.readAsDataURL = function (file) {
      FileAPI.readAsDataURL(file, listener);
    };
    this.readAsText = function (file) {
      FileAPI.readAsText(file, listener);
    };
  };
}

/**!
 * AngularJS file upload directives and services. Supoorts: file upload/drop/paste, resume, cancel/abort,
 * progress, resize, thumbnail, preview, validation and CORS
 * @author  Danial  <danial.farid@gmail.com>
 * @version 12.2.12
 */

if (window.XMLHttpRequest && !(window.FileAPI && FileAPI.shouldLoad)) {
  window.XMLHttpRequest.prototype.setRequestHeader = (function (orig) {
    return function (header, value) {
      if (header === '__setXHR_') {
        var val = value(this);
        // fix for angular < 1.2.0
        if (val instanceof Function) {
          val(this);
        }
      } else {
        orig.apply(this, arguments);
      }
    };
  })(window.XMLHttpRequest.prototype.setRequestHeader);
}

var ngFileUpload = angular.module('ngFileUpload', []);

ngFileUpload.version = '12.2.12';

ngFileUpload.service('UploadBase', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
  var upload = this;
  upload.promisesCount = 0;

  this.isResumeSupported = function () {
    return window.Blob && window.Blob.prototype.slice;
  };

  var resumeSupported = this.isResumeSupported();

  function sendHttp(config) {
    config.method = config.method || 'POST';
    config.headers = config.headers || {};

    var deferred = config._deferred = config._deferred || $q.defer();
    var promise = deferred.promise;

    function notifyProgress(e) {
      if (deferred.notify) {
        deferred.notify(e);
      }
      if (promise.progressFunc) {
        $timeout(function () {
          promise.progressFunc(e);
        });
      }
    }

    function getNotifyEvent(n) {
      if (config._start != null && resumeSupported) {
        return {
          loaded: n.loaded + config._start,
          total: (config._file && config._file.size) || n.total,
          type: n.type, config: config,
          lengthComputable: true, target: n.target
        };
      } else {
        return n;
      }
    }

    if (!config.disableProgress) {
      config.headers.__setXHR_ = function () {
        return function (xhr) {
          if (!xhr || !xhr.upload || !xhr.upload.addEventListener) return;
          config.__XHR = xhr;
          if (config.xhrFn) config.xhrFn(xhr);
          xhr.upload.addEventListener('progress', function (e) {
            e.config = config;
            notifyProgress(getNotifyEvent(e));
          }, false);
          //fix for firefox not firing upload progress end, also IE8-9
          xhr.upload.addEventListener('load', function (e) {
            if (e.lengthComputable) {
              e.config = config;
              notifyProgress(getNotifyEvent(e));
            }
          }, false);
        };
      };
    }

    function uploadWithAngular() {
      $http(config).then(function (r) {
          if (resumeSupported && config._chunkSize && !config._finished && config._file) {
            var fileSize = config._file && config._file.size || 0;
            notifyProgress({
                loaded: Math.min(config._end, fileSize),
                total: fileSize,
                config: config,
                type: 'progress'
              }
            );
            upload.upload(config, true);
          } else {
            if (config._finished) delete config._finished;
            deferred.resolve(r);
          }
        }, function (e) {
          deferred.reject(e);
        }, function (n) {
          deferred.notify(n);
        }
      );
    }

    if (!resumeSupported) {
      uploadWithAngular();
    } else if (config._chunkSize && config._end && !config._finished) {
      config._start = config._end;
      config._end += config._chunkSize;
      uploadWithAngular();
    } else if (config.resumeSizeUrl) {
      $http.get(config.resumeSizeUrl).then(function (resp) {
        if (config.resumeSizeResponseReader) {
          config._start = config.resumeSizeResponseReader(resp.data);
        } else {
          config._start = parseInt((resp.data.size == null ? resp.data : resp.data.size).toString());
        }
        if (config._chunkSize) {
          config._end = config._start + config._chunkSize;
        }
        uploadWithAngular();
      }, function (e) {
        throw e;
      });
    } else if (config.resumeSize) {
      config.resumeSize().then(function (size) {
        config._start = size;
        if (config._chunkSize) {
          config._end = config._start + config._chunkSize;
        }
        uploadWithAngular();
      }, function (e) {
        throw e;
      });
    } else {
      if (config._chunkSize) {
        config._start = 0;
        config._end = config._start + config._chunkSize;
      }
      uploadWithAngular();
    }


    promise.success = function (fn) {
      promise.then(function (response) {
        fn(response.data, response.status, response.headers, config);
      });
      return promise;
    };

    promise.error = function (fn) {
      promise.then(null, function (response) {
        fn(response.data, response.status, response.headers, config);
      });
      return promise;
    };

    promise.progress = function (fn) {
      promise.progressFunc = fn;
      promise.then(null, null, function (n) {
        fn(n);
      });
      return promise;
    };
    promise.abort = promise.pause = function () {
      if (config.__XHR) {
        $timeout(function () {
          config.__XHR.abort();
        });
      }
      return promise;
    };
    promise.xhr = function (fn) {
      config.xhrFn = (function (origXhrFn) {
        return function () {
          if (origXhrFn) origXhrFn.apply(promise, arguments);
          fn.apply(promise, arguments);
        };
      })(config.xhrFn);
      return promise;
    };

    upload.promisesCount++;
    if (promise['finally'] && promise['finally'] instanceof Function) {
      promise['finally'](function () {
        upload.promisesCount--;
      });
    }
    return promise;
  }

  this.isUploadInProgress = function () {
    return upload.promisesCount > 0;
  };

  this.rename = function (file, name) {
    file.ngfName = name;
    return file;
  };

  this.jsonBlob = function (val) {
    if (val != null && !angular.isString(val)) {
      val = JSON.stringify(val);
    }
    var blob = new window.Blob([val], {type: 'application/json'});
    blob._ngfBlob = true;
    return blob;
  };

  this.json = function (val) {
    return angular.toJson(val);
  };

  function copy(obj) {
    var clone = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = obj[key];
      }
    }
    return clone;
  }

  this.isFile = function (file) {
    return file != null && (file instanceof window.Blob || (file.flashId && file.name && file.size));
  };

  this.upload = function (config, internal) {
    function toResumeFile(file, formData) {
      if (file._ngfBlob) return file;
      config._file = config._file || file;
      if (config._start != null && resumeSupported) {
        if (config._end && config._end >= file.size) {
          config._finished = true;
          config._end = file.size;
        }
        var slice = file.slice(config._start, config._end || file.size);
        slice.name = file.name;
        slice.ngfName = file.ngfName;
        if (config._chunkSize) {
          formData.append('_chunkSize', config._chunkSize);
          formData.append('_currentChunkSize', config._end - config._start);
          formData.append('_chunkNumber', Math.floor(config._start / config._chunkSize));
          formData.append('_totalSize', config._file.size);
        }
        return slice;
      }
      return file;
    }

    function addFieldToFormData(formData, val, key) {
      if (val !== undefined) {
        if (angular.isDate(val)) {
          val = val.toISOString();
        }
        if (angular.isString(val)) {
          formData.append(key, val);
        } else if (upload.isFile(val)) {
          var file = toResumeFile(val, formData);
          var split = key.split(',');
          if (split[1]) {
            file.ngfName = split[1].replace(/^\s+|\s+$/g, '');
            key = split[0];
          }
          config._fileKey = config._fileKey || key;
          formData.append(key, file, file.ngfName || file.name);
        } else {
          if (angular.isObject(val)) {
            if (val.$$ngfCircularDetection) throw 'ngFileUpload: Circular reference in config.data. Make sure specified data for Upload.upload() has no circular reference: ' + key;

            val.$$ngfCircularDetection = true;
            try {
              for (var k in val) {
                if (val.hasOwnProperty(k) && k !== '$$ngfCircularDetection') {
                  var objectKey = config.objectKey == null ? '[i]' : config.objectKey;
                  if (val.length && parseInt(k) > -1) {
                    objectKey = config.arrayKey == null ? objectKey : config.arrayKey;
                  }
                  addFieldToFormData(formData, val[k], key + objectKey.replace(/[ik]/g, k));
                }
              }
            } finally {
              delete val.$$ngfCircularDetection;
            }
          } else {
            formData.append(key, val);
          }
        }
      }
    }

    function digestConfig() {
      config._chunkSize = upload.translateScalars(config.resumeChunkSize);
      config._chunkSize = config._chunkSize ? parseInt(config._chunkSize.toString()) : null;

      config.headers = config.headers || {};
      config.headers['Content-Type'] = undefined;
      config.transformRequest = config.transformRequest ?
        (angular.isArray(config.transformRequest) ?
          config.transformRequest : [config.transformRequest]) : [];
      config.transformRequest.push(function (data) {
        var formData = new window.FormData(), key;
        data = data || config.fields || {};
        if (config.file) {
          data.file = config.file;
        }
        for (key in data) {
          if (data.hasOwnProperty(key)) {
            var val = data[key];
            if (config.formDataAppender) {
              config.formDataAppender(formData, key, val);
            } else {
              addFieldToFormData(formData, val, key);
            }
          }
        }

        return formData;
      });
    }

    if (!internal) config = copy(config);
    if (!config._isDigested) {
      config._isDigested = true;
      digestConfig();
    }

    return sendHttp(config);
  };

  this.http = function (config) {
    config = copy(config);
    config.transformRequest = config.transformRequest || function (data) {
        if ((window.ArrayBuffer && data instanceof window.ArrayBuffer) || data instanceof window.Blob) {
          return data;
        }
        return $http.defaults.transformRequest[0].apply(this, arguments);
      };
    config._chunkSize = upload.translateScalars(config.resumeChunkSize);
    config._chunkSize = config._chunkSize ? parseInt(config._chunkSize.toString()) : null;

    return sendHttp(config);
  };

  this.translateScalars = function (str) {
    if (angular.isString(str)) {
      if (str.search(/kb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1024);
      } else if (str.search(/mb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1048576);
      } else if (str.search(/gb/i) === str.length - 2) {
        return parseFloat(str.substring(0, str.length - 2) * 1073741824);
      } else if (str.search(/b/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1));
      } else if (str.search(/s/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1));
      } else if (str.search(/m/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1) * 60);
      } else if (str.search(/h/i) === str.length - 1) {
        return parseFloat(str.substring(0, str.length - 1) * 3600);
      }
    }
    return str;
  };

  this.urlToBlob = function(url) {
    var defer = $q.defer();
    $http({url: url, method: 'get', responseType: 'arraybuffer'}).then(function (resp) {
      var arrayBufferView = new Uint8Array(resp.data);
      var type = resp.headers('content-type') || 'image/WebP';
      var blob = new window.Blob([arrayBufferView], {type: type});
      var matches = url.match(/.*\/(.+?)(\?.*)?$/);
      if (matches.length > 1) {
        blob.name = matches[1];
      }
      defer.resolve(blob);
    }, function (e) {
      defer.reject(e);
    });
    return defer.promise;
  };

  this.setDefaults = function (defaults) {
    this.defaults = defaults || {};
  };

  this.defaults = {};
  this.version = ngFileUpload.version;
}

]);

ngFileUpload.service('Upload', ['$parse', '$timeout', '$compile', '$q', 'UploadExif', function ($parse, $timeout, $compile, $q, UploadExif) {
  var upload = UploadExif;
  upload.getAttrWithDefaults = function (attr, name) {
    if (attr[name] != null) return attr[name];
    var def = upload.defaults[name];
    return (def == null ? def : (angular.isString(def) ? def : JSON.stringify(def)));
  };

  upload.attrGetter = function (name, attr, scope, params) {
    var attrVal = this.getAttrWithDefaults(attr, name);
    if (scope) {
      try {
        if (params) {
          return $parse(attrVal)(scope, params);
        } else {
          return $parse(attrVal)(scope);
        }
      } catch (e) {
        // hangle string value without single qoute
        if (name.search(/min|max|pattern/i)) {
          return attrVal;
        } else {
          throw e;
        }
      }
    } else {
      return attrVal;
    }
  };

  upload.shouldUpdateOn = function (type, attr, scope) {
    var modelOptions = upload.attrGetter('ngfModelOptions', attr, scope);
    if (modelOptions && modelOptions.updateOn) {
      return modelOptions.updateOn.split(' ').indexOf(type) > -1;
    }
    return true;
  };

  upload.emptyPromise = function () {
    var d = $q.defer();
    var args = arguments;
    $timeout(function () {
      d.resolve.apply(d, args);
    });
    return d.promise;
  };

  upload.rejectPromise = function () {
    var d = $q.defer();
    var args = arguments;
    $timeout(function () {
      d.reject.apply(d, args);
    });
    return d.promise;
  };

  upload.happyPromise = function (promise, data) {
    var d = $q.defer();
    promise.then(function (result) {
      d.resolve(result);
    }, function (error) {
      $timeout(function () {
        throw error;
      });
      d.resolve(data);
    });
    return d.promise;
  };

  function applyExifRotations(files, attr, scope) {
    var promises = [upload.emptyPromise()];
    angular.forEach(files, function (f, i) {
      if (f.type.indexOf('image/jpeg') === 0 && upload.attrGetter('ngfFixOrientation', attr, scope, {$file: f})) {
        promises.push(upload.happyPromise(upload.applyExifRotation(f), f).then(function (fixedFile) {
          files.splice(i, 1, fixedFile);
        }));
      }
    });
    return $q.all(promises);
  }

  function resizeFile(files, attr, scope, ngModel) {
    var resizeVal = upload.attrGetter('ngfResize', attr, scope);
    if (!resizeVal || !upload.isResizeSupported() || !files.length) return upload.emptyPromise();
    if (resizeVal instanceof Function) {
      var defer = $q.defer();
      return resizeVal(files).then(function (p) {
        resizeWithParams(p, files, attr, scope, ngModel).then(function (r) {
          defer.resolve(r);
        }, function (e) {
          defer.reject(e);
        });
      }, function (e) {
        defer.reject(e);
      });
    } else {
      return resizeWithParams(resizeVal, files, attr, scope, ngModel);
    }
  }

  function resizeWithParams(params, files, attr, scope, ngModel) {
    var promises = [upload.emptyPromise()];

    function handleFile(f, i) {
      if (f.type.indexOf('image') === 0) {
        if (params.pattern && !upload.validatePattern(f, params.pattern)) return;
        params.resizeIf = function (width, height) {
          return upload.attrGetter('ngfResizeIf', attr, scope,
            {$width: width, $height: height, $file: f});
        };
        var promise = upload.resize(f, params);
        promises.push(promise);
        promise.then(function (resizedFile) {
          files.splice(i, 1, resizedFile);
        }, function (e) {
          f.$error = 'resize';
          (f.$errorMessages = (f.$errorMessages || {})).resize = true;
          f.$errorParam = (e ? (e.message ? e.message : e) + ': ' : '') + (f && f.name);
          ngModel.$ngfValidations.push({name: 'resize', valid: false});
          upload.applyModelValidation(ngModel, files);
        });
      }
    }

    for (var i = 0; i < files.length; i++) {
      handleFile(files[i], i);
    }
    return $q.all(promises);
  }

  upload.updateModel = function (ngModel, attr, scope, fileChange, files, evt, noDelay) {
    function update(files, invalidFiles, newFiles, dupFiles, isSingleModel) {
      attr.$$ngfPrevValidFiles = files;
      attr.$$ngfPrevInvalidFiles = invalidFiles;
      var file = files && files.length ? files[0] : null;
      var invalidFile = invalidFiles && invalidFiles.length ? invalidFiles[0] : null;

      if (ngModel) {
        upload.applyModelValidation(ngModel, files);
        ngModel.$setViewValue(isSingleModel ? file : files);
      }

      if (fileChange) {
        $parse(fileChange)(scope, {
          $files: files,
          $file: file,
          $newFiles: newFiles,
          $duplicateFiles: dupFiles,
          $invalidFiles: invalidFiles,
          $invalidFile: invalidFile,
          $event: evt
        });
      }

      var invalidModel = upload.attrGetter('ngfModelInvalid', attr);
      if (invalidModel) {
        $timeout(function () {
          $parse(invalidModel).assign(scope, isSingleModel ? invalidFile : invalidFiles);
        });
      }
      $timeout(function () {
        // scope apply changes
      });
    }

    var allNewFiles, dupFiles = [], prevValidFiles, prevInvalidFiles,
      invalids = [], valids = [];

    function removeDuplicates() {
      function equals(f1, f2) {
        return f1.name === f2.name && (f1.$ngfOrigSize || f1.size) === (f2.$ngfOrigSize || f2.size) &&
          f1.type === f2.type;
      }

      function isInPrevFiles(f) {
        var j;
        for (j = 0; j < prevValidFiles.length; j++) {
          if (equals(f, prevValidFiles[j])) {
            return true;
          }
        }
        for (j = 0; j < prevInvalidFiles.length; j++) {
          if (equals(f, prevInvalidFiles[j])) {
            return true;
          }
        }
        return false;
      }

      if (files) {
        allNewFiles = [];
        dupFiles = [];
        for (var i = 0; i < files.length; i++) {
          if (isInPrevFiles(files[i])) {
            dupFiles.push(files[i]);
          } else {
            allNewFiles.push(files[i]);
          }
        }
      }
    }

    function toArray(v) {
      return angular.isArray(v) ? v : [v];
    }

    function resizeAndUpdate() {
      function updateModel() {
        $timeout(function () {
          update(keep ? prevValidFiles.concat(valids) : valids,
            keep ? prevInvalidFiles.concat(invalids) : invalids,
            files, dupFiles, isSingleModel);
        }, options && options.debounce ? options.debounce.change || options.debounce : 0);
      }

      var resizingFiles = validateAfterResize ? allNewFiles : valids;
      resizeFile(resizingFiles, attr, scope, ngModel).then(function () {
        if (validateAfterResize) {
          upload.validate(allNewFiles, keep ? prevValidFiles.length : 0, ngModel, attr, scope)
            .then(function (validationResult) {
              valids = validationResult.validsFiles;
              invalids = validationResult.invalidsFiles;
              updateModel();
            });
        } else {
          updateModel();
        }
      }, function () {
        for (var i = 0; i < resizingFiles.length; i++) {
          var f = resizingFiles[i];
          if (f.$error === 'resize') {
            var index = valids.indexOf(f);
            if (index > -1) {
              valids.splice(index, 1);
              invalids.push(f);
            }
            updateModel();
          }
        }
      });
    }

    prevValidFiles = attr.$$ngfPrevValidFiles || [];
    prevInvalidFiles = attr.$$ngfPrevInvalidFiles || [];
    if (ngModel && ngModel.$modelValue) {
      prevValidFiles = toArray(ngModel.$modelValue);
    }

    var keep = upload.attrGetter('ngfKeep', attr, scope);
    allNewFiles = (files || []).slice(0);
    if (keep === 'distinct' || upload.attrGetter('ngfKeepDistinct', attr, scope) === true) {
      removeDuplicates(attr, scope);
    }

    var isSingleModel = !keep && !upload.attrGetter('ngfMultiple', attr, scope) && !upload.attrGetter('multiple', attr);

    if (keep && !allNewFiles.length) return;

    upload.attrGetter('ngfBeforeModelChange', attr, scope, {
      $files: files,
      $file: files && files.length ? files[0] : null,
      $newFiles: allNewFiles,
      $duplicateFiles: dupFiles,
      $event: evt
    });

    var validateAfterResize = upload.attrGetter('ngfValidateAfterResize', attr, scope);

    var options = upload.attrGetter('ngfModelOptions', attr, scope);
    upload.validate(allNewFiles, keep ? prevValidFiles.length : 0, ngModel, attr, scope)
      .then(function (validationResult) {
      if (noDelay) {
        update(allNewFiles, [], files, dupFiles, isSingleModel);
      } else {
        if ((!options || !options.allowInvalid) && !validateAfterResize) {
          valids = validationResult.validFiles;
          invalids = validationResult.invalidFiles;
        } else {
          valids = allNewFiles;
        }
        if (upload.attrGetter('ngfFixOrientation', attr, scope) && upload.isExifSupported()) {
          applyExifRotations(valids, attr, scope).then(function () {
            resizeAndUpdate();
          });
        } else {
          resizeAndUpdate();
        }
      }
    });
  };

  return upload;
}]);

ngFileUpload.directive('ngfSelect', ['$parse', '$timeout', '$compile', 'Upload', function ($parse, $timeout, $compile, Upload) {
  var generatedElems = [];

  function isDelayedClickSupported(ua) {
    // fix for android native browser < 4.4 and safari windows
    var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
    if (m && m.length > 2) {
      var v = Upload.defaults.androidFixMinorVersion || 4;
      return parseInt(m[1]) < 4 || (parseInt(m[1]) === v && parseInt(m[2]) < v);
    }

    // safari on windows
    return ua.indexOf('Chrome') === -1 && /.*Windows.*Safari.*/.test(ua);
  }

  function linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile, upload) {
    /** @namespace attr.ngfSelect */
    /** @namespace attr.ngfChange */
    /** @namespace attr.ngModel */
    /** @namespace attr.ngfModelOptions */
    /** @namespace attr.ngfMultiple */
    /** @namespace attr.ngfCapture */
    /** @namespace attr.ngfValidate */
    /** @namespace attr.ngfKeep */
    var attrGetter = function (name, scope) {
      return upload.attrGetter(name, attr, scope);
    };

    function isInputTypeFile() {
      return elem[0].tagName.toLowerCase() === 'input' && attr.type && attr.type.toLowerCase() === 'file';
    }

    function fileChangeAttr() {
      return attrGetter('ngfChange') || attrGetter('ngfSelect');
    }

    function changeFn(evt) {
      if (upload.shouldUpdateOn('change', attr, scope)) {
        var fileList = evt.__files_ || (evt.target && evt.target.files), files = [];
        /* Handle duplicate call in  IE11 */
        if (!fileList) return;
        for (var i = 0; i < fileList.length; i++) {
          files.push(fileList[i]);
        }
        upload.updateModel(ngModel, attr, scope, fileChangeAttr(),
          files.length ? files : null, evt);
      }
    }

    upload.registerModelChangeValidator(ngModel, attr, scope);

    var unwatches = [];
    if (attrGetter('ngfMultiple')) {
      unwatches.push(scope.$watch(attrGetter('ngfMultiple'), function () {
        fileElem.attr('multiple', attrGetter('ngfMultiple', scope));
      }));
    }
    if (attrGetter('ngfCapture')) {
      unwatches.push(scope.$watch(attrGetter('ngfCapture'), function () {
        fileElem.attr('capture', attrGetter('ngfCapture', scope));
      }));
    }
    if (attrGetter('ngfAccept')) {
      unwatches.push(scope.$watch(attrGetter('ngfAccept'), function () {
        fileElem.attr('accept', attrGetter('ngfAccept', scope));
      }));
    }
    unwatches.push(attr.$observe('accept', function () {
      fileElem.attr('accept', attrGetter('accept'));
    }));
    function bindAttrToFileInput(fileElem, label) {
      function updateId(val) {
        fileElem.attr('id', 'ngf-' + val);
        label.attr('id', 'ngf-label-' + val);
      }

      for (var i = 0; i < elem[0].attributes.length; i++) {
        var attribute = elem[0].attributes[i];
        if (attribute.name !== 'type' && attribute.name !== 'class' && attribute.name !== 'style') {
          if (attribute.name === 'id') {
            updateId(attribute.value);
            unwatches.push(attr.$observe('id', updateId));
          } else {
            fileElem.attr(attribute.name, (!attribute.value && (attribute.name === 'required' ||
            attribute.name === 'multiple')) ? attribute.name : attribute.value);
          }
        }
      }
    }

    function createFileInput() {
      if (isInputTypeFile()) {
        return elem;
      }

      var fileElem = angular.element('<input type="file">');

      var label = angular.element('<label>upload</label>');
      label.css('visibility', 'hidden').css('position', 'absolute').css('overflow', 'hidden')
        .css('width', '0px').css('height', '0px').css('border', 'none')
        .css('margin', '0px').css('padding', '0px').attr('tabindex', '-1');
      bindAttrToFileInput(fileElem, label);

      generatedElems.push({el: elem, ref: label});

      document.body.appendChild(label.append(fileElem)[0]);

      return fileElem;
    }

    function clickHandler(evt) {
      if (elem.attr('disabled')) return false;
      if (attrGetter('ngfSelectDisabled', scope)) return;

      var r = detectSwipe(evt);
      // prevent the click if it is a swipe
      if (r != null) return r;

      resetModel(evt);

      // fix for md when the element is removed from the DOM and added back #460
      try {
        if (!isInputTypeFile() && !document.body.contains(fileElem[0])) {
          generatedElems.push({el: elem, ref: fileElem.parent()});
          document.body.appendChild(fileElem.parent()[0]);
          fileElem.bind('change', changeFn);
        }
      } catch (e) {/*ignore*/
      }

      if (isDelayedClickSupported(navigator.userAgent)) {
        setTimeout(function () {
          fileElem[0].click();
        }, 0);
      } else {
        fileElem[0].click();
      }

      return false;
    }


    var initialTouchStartY = 0;
    var initialTouchStartX = 0;

    function detectSwipe(evt) {
      var touches = evt.changedTouches || (evt.originalEvent && evt.originalEvent.changedTouches);
      if (touches) {
        if (evt.type === 'touchstart') {
          initialTouchStartX = touches[0].clientX;
          initialTouchStartY = touches[0].clientY;
          return true; // don't block event default
        } else {
          // prevent scroll from triggering event
          if (evt.type === 'touchend') {
            var currentX = touches[0].clientX;
            var currentY = touches[0].clientY;
            if ((Math.abs(currentX - initialTouchStartX) > 20) ||
              (Math.abs(currentY - initialTouchStartY) > 20)) {
              evt.stopPropagation();
              evt.preventDefault();
              return false;
            }
          }
          return true;
        }
      }
    }

    var fileElem = elem;

    function resetModel(evt) {
      if (upload.shouldUpdateOn('click', attr, scope) && fileElem.val()) {
        fileElem.val(null);
        upload.updateModel(ngModel, attr, scope, fileChangeAttr(), null, evt, true);
      }
    }

    if (!isInputTypeFile()) {
      fileElem = createFileInput();
    }
    fileElem.bind('change', changeFn);

    if (!isInputTypeFile()) {
      elem.bind('click touchstart touchend', clickHandler);
    } else {
      elem.bind('click', resetModel);
    }

    function ie10SameFileSelectFix(evt) {
      if (fileElem && !fileElem.attr('__ngf_ie10_Fix_')) {
        if (!fileElem[0].parentNode) {
          fileElem = null;
          return;
        }
        evt.preventDefault();
        evt.stopPropagation();
        fileElem.unbind('click');
        var clone = fileElem.clone();
        fileElem.replaceWith(clone);
        fileElem = clone;
        fileElem.attr('__ngf_ie10_Fix_', 'true');
        fileElem.bind('change', changeFn);
        fileElem.bind('click', ie10SameFileSelectFix);
        fileElem[0].click();
        return false;
      } else {
        fileElem.removeAttr('__ngf_ie10_Fix_');
      }
    }

    if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
      fileElem.bind('click', ie10SameFileSelectFix);
    }

    if (ngModel) ngModel.$formatters.push(function (val) {
      if (val == null || val.length === 0) {
        if (fileElem.val()) {
          fileElem.val(null);
        }
      }
      return val;
    });

    scope.$on('$destroy', function () {
      if (!isInputTypeFile()) fileElem.parent().remove();
      angular.forEach(unwatches, function (unwatch) {
        unwatch();
      });
    });

    $timeout(function () {
      for (var i = 0; i < generatedElems.length; i++) {
        var g = generatedElems[i];
        if (!document.body.contains(g.el[0])) {
          generatedElems.splice(i, 1);
          g.ref.remove();
        }
      }
    });

    if (window.FileAPI && window.FileAPI.ngfFixIE) {
      window.FileAPI.ngfFixIE(elem, fileElem, changeFn);
    }
  }

  return {
    restrict: 'AEC',
    require: '?ngModel',
    link: function (scope, elem, attr, ngModel) {
      linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile, Upload);
    }
  };
}]);

(function () {

  ngFileUpload.service('UploadDataUrl', ['UploadBase', '$timeout', '$q', function (UploadBase, $timeout, $q) {
    var upload = UploadBase;
    upload.base64DataUrl = function (file) {
      if (angular.isArray(file)) {
        var d = $q.defer(), count = 0;
        angular.forEach(file, function (f) {
          upload.dataUrl(f, true)['finally'](function () {
            count++;
            if (count === file.length) {
              var urls = [];
              angular.forEach(file, function (ff) {
                urls.push(ff.$ngfDataUrl);
              });
              d.resolve(urls, file);
            }
          });
        });
        return d.promise;
      } else {
        return upload.dataUrl(file, true);
      }
    };
    upload.dataUrl = function (file, disallowObjectUrl) {
      if (!file) return upload.emptyPromise(file, file);
      if ((disallowObjectUrl && file.$ngfDataUrl != null) || (!disallowObjectUrl && file.$ngfBlobUrl != null)) {
        return upload.emptyPromise(disallowObjectUrl ? file.$ngfDataUrl : file.$ngfBlobUrl, file);
      }
      var p = disallowObjectUrl ? file.$$ngfDataUrlPromise : file.$$ngfBlobUrlPromise;
      if (p) return p;

      var deferred = $q.defer();
      $timeout(function () {
        if (window.FileReader && file &&
          (!window.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) &&
          (!window.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000)) {
          //prefer URL.createObjectURL for handling refrences to files of all sizes
          //since it doesn´t build a large string in memory
          var URL = window.URL || window.webkitURL;
          if (URL && URL.createObjectURL && !disallowObjectUrl) {
            var url;
            try {
              url = URL.createObjectURL(file);
            } catch (e) {
              $timeout(function () {
                file.$ngfBlobUrl = '';
                deferred.reject();
              });
              return;
            }
            $timeout(function () {
              file.$ngfBlobUrl = url;
              if (url) {
                deferred.resolve(url, file);
                upload.blobUrls = upload.blobUrls || [];
                upload.blobUrlsTotalSize = upload.blobUrlsTotalSize || 0;
                upload.blobUrls.push({url: url, size: file.size});
                upload.blobUrlsTotalSize += file.size || 0;
                var maxMemory = upload.defaults.blobUrlsMaxMemory || 268435456;
                var maxLength = upload.defaults.blobUrlsMaxQueueSize || 200;
                while ((upload.blobUrlsTotalSize > maxMemory || upload.blobUrls.length > maxLength) && upload.blobUrls.length > 1) {
                  var obj = upload.blobUrls.splice(0, 1)[0];
                  URL.revokeObjectURL(obj.url);
                  upload.blobUrlsTotalSize -= obj.size;
                }
              }
            });
          } else {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
              $timeout(function () {
                file.$ngfDataUrl = e.target.result;
                deferred.resolve(e.target.result, file);
                $timeout(function () {
                  delete file.$ngfDataUrl;
                }, 1000);
              });
            };
            fileReader.onerror = function () {
              $timeout(function () {
                file.$ngfDataUrl = '';
                deferred.reject();
              });
            };
            fileReader.readAsDataURL(file);
          }
        } else {
          $timeout(function () {
            file[disallowObjectUrl ? '$ngfDataUrl' : '$ngfBlobUrl'] = '';
            deferred.reject();
          });
        }
      });

      if (disallowObjectUrl) {
        p = file.$$ngfDataUrlPromise = deferred.promise;
      } else {
        p = file.$$ngfBlobUrlPromise = deferred.promise;
      }
      p['finally'](function () {
        delete file[disallowObjectUrl ? '$$ngfDataUrlPromise' : '$$ngfBlobUrlPromise'];
      });
      return p;
    };
    return upload;
  }]);

  function getTagType(el) {
    if (el.tagName.toLowerCase() === 'img') return 'image';
    if (el.tagName.toLowerCase() === 'audio') return 'audio';
    if (el.tagName.toLowerCase() === 'video') return 'video';
    return /./;
  }

  function linkFileDirective(Upload, $timeout, scope, elem, attr, directiveName, resizeParams, isBackground) {
    function constructDataUrl(file) {
      var disallowObjectUrl = Upload.attrGetter('ngfNoObjectUrl', attr, scope);
      Upload.dataUrl(file, disallowObjectUrl)['finally'](function () {
        $timeout(function () {
          var src = (disallowObjectUrl ? file.$ngfDataUrl : file.$ngfBlobUrl) || file.$ngfDataUrl;
          if (isBackground) {
            elem.css('background-image', 'url(\'' + (src || '') + '\')');
          } else {
            elem.attr('src', src);
          }
          if (src) {
            elem.removeClass('ng-hide');
          } else {
            elem.addClass('ng-hide');
          }
        });
      });
    }

    $timeout(function () {
      var unwatch = scope.$watch(attr[directiveName], function (file) {
        var size = resizeParams;
        if (directiveName === 'ngfThumbnail') {
          if (!size) {
            size = {width: elem[0].naturalWidth || elem[0].clientWidth,
              height: elem[0].naturalHeight || elem[0].clientHeight};
          }
          if (size.width === 0 && window.getComputedStyle) {
            var style = getComputedStyle(elem[0]);
            size = {
              width: parseInt(style.width.slice(0, -2)),
              height: parseInt(style.height.slice(0, -2))
            };
          }
        }

        if (angular.isString(file)) {
          elem.removeClass('ng-hide');
          if (isBackground) {
            return elem.css('background-image', 'url(\'' + file + '\')');
          } else {
            return elem.attr('src', file);
          }
        }
        if (file && file.type && file.type.search(getTagType(elem[0])) === 0 &&
          (!isBackground || file.type.indexOf('image') === 0)) {
          if (size && Upload.isResizeSupported()) {
            size.resizeIf = function (width, height) {
              return Upload.attrGetter('ngfResizeIf', attr, scope,
                {$width: width, $height: height, $file: file});
            };
            Upload.resize(file, size).then(
              function (f) {
                constructDataUrl(f);
              }, function (e) {
                throw e;
              }
            );
          } else {
            constructDataUrl(file);
          }
        } else {
          elem.addClass('ng-hide');
        }
      });

      scope.$on('$destroy', function () {
        unwatch();
      });
    });
  }


  /** @namespace attr.ngfSrc */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfSrc', ['Upload', '$timeout', function (Upload, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        linkFileDirective(Upload, $timeout, scope, elem, attr, 'ngfSrc',
          Upload.attrGetter('ngfResize', attr, scope), false);
      }
    };
  }]);

  /** @namespace attr.ngfBackground */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfBackground', ['Upload', '$timeout', function (Upload, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        linkFileDirective(Upload, $timeout, scope, elem, attr, 'ngfBackground',
          Upload.attrGetter('ngfResize', attr, scope), true);
      }
    };
  }]);

  /** @namespace attr.ngfThumbnail */
  /** @namespace attr.ngfAsBackground */
  /** @namespace attr.ngfSize */
  /** @namespace attr.ngfNoObjectUrl */
  ngFileUpload.directive('ngfThumbnail', ['Upload', '$timeout', function (Upload, $timeout) {
    return {
      restrict: 'AE',
      link: function (scope, elem, attr) {
        var size = Upload.attrGetter('ngfSize', attr, scope);
        linkFileDirective(Upload, $timeout, scope, elem, attr, 'ngfThumbnail', size,
          Upload.attrGetter('ngfAsBackground', attr, scope));
      }
    };
  }]);

  ngFileUpload.config(['$compileProvider', function ($compileProvider) {
    if ($compileProvider.imgSrcSanitizationWhitelist) $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|webcal|local|file|data|blob):/);
    if ($compileProvider.aHrefSanitizationWhitelist) $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|webcal|local|file|data|blob):/);
  }]);

  ngFileUpload.filter('ngfDataUrl', ['UploadDataUrl', '$sce', function (UploadDataUrl, $sce) {
    return function (file, disallowObjectUrl, trustedUrl) {
      if (angular.isString(file)) {
        return $sce.trustAsResourceUrl(file);
      }
      var src = file && ((disallowObjectUrl ? file.$ngfDataUrl : file.$ngfBlobUrl) || file.$ngfDataUrl);
      if (file && !src) {
        if (!file.$ngfDataUrlFilterInProgress && angular.isObject(file)) {
          file.$ngfDataUrlFilterInProgress = true;
          UploadDataUrl.dataUrl(file, disallowObjectUrl);
        }
        return '';
      }
      if (file) delete file.$ngfDataUrlFilterInProgress;
      return (file && src ? (trustedUrl ? $sce.trustAsResourceUrl(src) : src) : file) || '';
    };
  }]);

})();

ngFileUpload.service('UploadValidate', ['UploadDataUrl', '$q', '$timeout', function (UploadDataUrl, $q, $timeout) {
  var upload = UploadDataUrl;

  function globStringToRegex(str) {
    var regexp = '', excludes = [];
    if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
      regexp = str.substring(1, str.length - 1);
    } else {
      var split = str.split(',');
      if (split.length > 1) {
        for (var i = 0; i < split.length; i++) {
          var r = globStringToRegex(split[i]);
          if (r.regexp) {
            regexp += '(' + r.regexp + ')';
            if (i < split.length - 1) {
              regexp += '|';
            }
          } else {
            excludes = excludes.concat(r.excludes);
          }
        }
      } else {
        if (str.indexOf('!') === 0) {
          excludes.push('^((?!' + globStringToRegex(str.substring(1)).regexp + ').)*$');
        } else {
          if (str.indexOf('.') === 0) {
            str = '*' + str;
          }
          regexp = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g'), '\\$&') + '$';
          regexp = regexp.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
        }
      }
    }
    return {regexp: regexp, excludes: excludes};
  }

  upload.validatePattern = function (file, val) {
    if (!val) {
      return true;
    }
    var pattern = globStringToRegex(val), valid = true;
    if (pattern.regexp && pattern.regexp.length) {
      var regexp = new RegExp(pattern.regexp, 'i');
      valid = (file.type != null && regexp.test(file.type)) ||
        (file.name != null && regexp.test(file.name));
    }
    var len = pattern.excludes.length;
    while (len--) {
      var exclude = new RegExp(pattern.excludes[len], 'i');
      valid = valid && (file.type == null || exclude.test(file.type)) &&
        (file.name == null || exclude.test(file.name));
    }
    return valid;
  };

  upload.ratioToFloat = function (val) {
    var r = val.toString(), xIndex = r.search(/[x:]/i);
    if (xIndex > -1) {
      r = parseFloat(r.substring(0, xIndex)) / parseFloat(r.substring(xIndex + 1));
    } else {
      r = parseFloat(r);
    }
    return r;
  };

  upload.registerModelChangeValidator = function (ngModel, attr, scope) {
    if (ngModel) {
      ngModel.$formatters.push(function (files) {
        if (ngModel.$dirty) {
          var filesArray = files;
          if (files && !angular.isArray(files)) {
            filesArray = [files];
          }
          upload.validate(filesArray, 0, ngModel, attr, scope).then(function () {
            upload.applyModelValidation(ngModel, filesArray);
          });
        }
        return files;
      });
    }
  };

  function markModelAsDirty(ngModel, files) {
    if (files != null && !ngModel.$dirty) {
      if (ngModel.$setDirty) {
        ngModel.$setDirty();
      } else {
        ngModel.$dirty = true;
      }
    }
  }

  upload.applyModelValidation = function (ngModel, files) {
    markModelAsDirty(ngModel, files);
    angular.forEach(ngModel.$ngfValidations, function (validation) {
      ngModel.$setValidity(validation.name, validation.valid);
    });
  };

  upload.getValidationAttr = function (attr, scope, name, validationName, file) {
    var dName = 'ngf' + name[0].toUpperCase() + name.substr(1);
    var val = upload.attrGetter(dName, attr, scope, {$file: file});
    if (val == null) {
      val = upload.attrGetter('ngfValidate', attr, scope, {$file: file});
      if (val) {
        var split = (validationName || name).split('.');
        val = val[split[0]];
        if (split.length > 1) {
          val = val && val[split[1]];
        }
      }
    }
    return val;
  };

  upload.validate = function (files, prevLength, ngModel, attr, scope) {
    ngModel = ngModel || {};
    ngModel.$ngfValidations = ngModel.$ngfValidations || [];

    angular.forEach(ngModel.$ngfValidations, function (v) {
      v.valid = true;
    });

    var attrGetter = function (name, params) {
      return upload.attrGetter(name, attr, scope, params);
    };

    var ignoredErrors = (upload.attrGetter('ngfIgnoreInvalid', attr, scope) || '').split(' ');
    var runAllValidation = upload.attrGetter('ngfRunAllValidations', attr, scope);

    if (files == null || files.length === 0) {
      return upload.emptyPromise({'validFiles': files, 'invalidFiles': []});
    }

    files = files.length === undefined ? [files] : files.slice(0);
    var invalidFiles = [];

    function validateSync(name, validationName, fn) {
      if (files) {
        var i = files.length, valid = null;
        while (i--) {
          var file = files[i];
          if (file) {
            var val = upload.getValidationAttr(attr, scope, name, validationName, file);
            if (val != null) {
              if (!fn(file, val, i)) {
                if (ignoredErrors.indexOf(name) === -1) {
                  file.$error = name;
                  (file.$errorMessages = (file.$errorMessages || {}))[name] = true;
                  file.$errorParam = val;
                  if (invalidFiles.indexOf(file) === -1) {
                    invalidFiles.push(file);
                  }
                  if (!runAllValidation) {
                    files.splice(i, 1);
                  }
                  valid = false;
                } else {
                  files.splice(i, 1);
                }
              }
            }
          }
        }
        if (valid !== null) {
          ngModel.$ngfValidations.push({name: name, valid: valid});
        }
      }
    }

    validateSync('pattern', null, upload.validatePattern);
    validateSync('minSize', 'size.min', function (file, val) {
      return file.size + 0.1 >= upload.translateScalars(val);
    });
    validateSync('maxSize', 'size.max', function (file, val) {
      return file.size - 0.1 <= upload.translateScalars(val);
    });
    var totalSize = 0;
    validateSync('maxTotalSize', null, function (file, val) {
      totalSize += file.size;
      if (totalSize > upload.translateScalars(val)) {
        files.splice(0, files.length);
        return false;
      }
      return true;
    });

    validateSync('validateFn', null, function (file, r) {
      return r === true || r === null || r === '';
    });

    if (!files.length) {
      return upload.emptyPromise({'validFiles': [], 'invalidFiles': invalidFiles});
    }

    function validateAsync(name, validationName, type, asyncFn, fn) {
      function resolveResult(defer, file, val) {
        function resolveInternal(fn) {
          if (fn()) {
            if (ignoredErrors.indexOf(name) === -1) {
              file.$error = name;
              (file.$errorMessages = (file.$errorMessages || {}))[name] = true;
              file.$errorParam = val;
              if (invalidFiles.indexOf(file) === -1) {
                invalidFiles.push(file);
              }
              if (!runAllValidation) {
                var i = files.indexOf(file);
                if (i > -1) files.splice(i, 1);
              }
              defer.resolve(false);
            } else {
              var j = files.indexOf(file);
              if (j > -1) files.splice(j, 1);
              defer.resolve(true);
            }
          } else {
            defer.resolve(true);
          }
        }

        if (val != null) {
          asyncFn(file, val).then(function (d) {
            resolveInternal(function () {
              return !fn(d, val);
            });
          }, function () {
            resolveInternal(function () {
              return attrGetter('ngfValidateForce', {$file: file});
            });
          });
        } else {
          defer.resolve(true);
        }
      }

      var promises = [upload.emptyPromise(true)];
      if (files) {
        files = files.length === undefined ? [files] : files;
        angular.forEach(files, function (file) {
          var defer = $q.defer();
          promises.push(defer.promise);
          if (type && (file.type == null || file.type.search(type) !== 0)) {
            defer.resolve(true);
            return;
          }
          if (name === 'dimensions' && upload.attrGetter('ngfDimensions', attr) != null) {
            upload.imageDimensions(file).then(function (d) {
              resolveResult(defer, file,
                attrGetter('ngfDimensions', {$file: file, $width: d.width, $height: d.height}));
            }, function () {
              defer.resolve(false);
            });
          } else if (name === 'duration' && upload.attrGetter('ngfDuration', attr) != null) {
            upload.mediaDuration(file).then(function (d) {
              resolveResult(defer, file,
                attrGetter('ngfDuration', {$file: file, $duration: d}));
            }, function () {
              defer.resolve(false);
            });
          } else {
            resolveResult(defer, file,
              upload.getValidationAttr(attr, scope, name, validationName, file));
          }
        });
      }
      var deffer = $q.defer();
      $q.all(promises).then(function (values) {
        var isValid = true;
        for (var i = 0; i < values.length; i++) {
          if (!values[i]) {
            isValid = false;
            break;
          }
        }
        ngModel.$ngfValidations.push({name: name, valid: isValid});
        deffer.resolve(isValid);
      });
      return deffer.promise;
    }

    var deffer = $q.defer();
    var promises = [];

    promises.push(validateAsync('maxHeight', 'height.max', /image/,
      this.imageDimensions, function (d, val) {
        return d.height <= val;
      }));
    promises.push(validateAsync('minHeight', 'height.min', /image/,
      this.imageDimensions, function (d, val) {
        return d.height >= val;
      }));
    promises.push(validateAsync('maxWidth', 'width.max', /image/,
      this.imageDimensions, function (d, val) {
        return d.width <= val;
      }));
    promises.push(validateAsync('minWidth', 'width.min', /image/,
      this.imageDimensions, function (d, val) {
        return d.width >= val;
      }));
    promises.push(validateAsync('dimensions', null, /image/,
      function (file, val) {
        return upload.emptyPromise(val);
      }, function (r) {
        return r;
      }));
    promises.push(validateAsync('ratio', null, /image/,
      this.imageDimensions, function (d, val) {
        var split = val.toString().split(','), valid = false;
        for (var i = 0; i < split.length; i++) {
          if (Math.abs((d.width / d.height) - upload.ratioToFloat(split[i])) < 0.01) {
            valid = true;
          }
        }
        return valid;
      }));
    promises.push(validateAsync('maxRatio', 'ratio.max', /image/,
      this.imageDimensions, function (d, val) {
        return (d.width / d.height) - upload.ratioToFloat(val) < 0.0001;
      }));
    promises.push(validateAsync('minRatio', 'ratio.min', /image/,
      this.imageDimensions, function (d, val) {
        return (d.width / d.height) - upload.ratioToFloat(val) > -0.0001;
      }));
    promises.push(validateAsync('maxDuration', 'duration.max', /audio|video/,
      this.mediaDuration, function (d, val) {
        return d <= upload.translateScalars(val);
      }));
    promises.push(validateAsync('minDuration', 'duration.min', /audio|video/,
      this.mediaDuration, function (d, val) {
        return d >= upload.translateScalars(val);
      }));
    promises.push(validateAsync('duration', null, /audio|video/,
      function (file, val) {
        return upload.emptyPromise(val);
      }, function (r) {
        return r;
      }));

    promises.push(validateAsync('validateAsyncFn', null, null,
      function (file, val) {
        return val;
      }, function (r) {
        return r === true || r === null || r === '';
      }));

    $q.all(promises).then(function () {

      if (runAllValidation) {
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          if (file.$error) {
            files.splice(i--, 1);
          }
        }
      }

      runAllValidation = false;
      validateSync('maxFiles', null, function (file, val, i) {
        return prevLength + i < val;
      });

      deffer.resolve({'validFiles': files, 'invalidFiles': invalidFiles});
    });
    return deffer.promise;
  };

  upload.imageDimensions = function (file) {
    if (file.$ngfWidth && file.$ngfHeight) {
      var d = $q.defer();
      $timeout(function () {
        d.resolve({width: file.$ngfWidth, height: file.$ngfHeight});
      });
      return d.promise;
    }
    if (file.$ngfDimensionPromise) return file.$ngfDimensionPromise;

    var deferred = $q.defer();
    $timeout(function () {
      if (file.type.indexOf('image') !== 0) {
        deferred.reject('not image');
        return;
      }
      upload.dataUrl(file).then(function (dataUrl) {
        var img = angular.element('<img>').attr('src', dataUrl)
          .css('visibility', 'hidden').css('position', 'fixed')
          .css('max-width', 'none !important').css('max-height', 'none !important');

        function success() {
          var width = img[0].naturalWidth || img[0].clientWidth;
          var height = img[0].naturalHeight || img[0].clientHeight;
          img.remove();
          file.$ngfWidth = width;
          file.$ngfHeight = height;
          deferred.resolve({width: width, height: height});
        }

        function error() {
          img.remove();
          deferred.reject('load error');
        }

        img.on('load', success);
        img.on('error', error);

        var secondsCounter = 0;
        function checkLoadErrorInCaseOfNoCallback() {
          $timeout(function () {
            if (img[0].parentNode) {
              if (img[0].clientWidth) {
                success();
              } else if (secondsCounter++ > 10) {
                error();
              } else {
                checkLoadErrorInCaseOfNoCallback();
              }
            }
          }, 1000);
        }

        checkLoadErrorInCaseOfNoCallback();

        angular.element(document.getElementsByTagName('body')[0]).append(img);
      }, function () {
        deferred.reject('load error');
      });
    });

    file.$ngfDimensionPromise = deferred.promise;
    file.$ngfDimensionPromise['finally'](function () {
      delete file.$ngfDimensionPromise;
    });
    return file.$ngfDimensionPromise;
  };

  upload.mediaDuration = function (file) {
    if (file.$ngfDuration) {
      var d = $q.defer();
      $timeout(function () {
        d.resolve(file.$ngfDuration);
      });
      return d.promise;
    }
    if (file.$ngfDurationPromise) return file.$ngfDurationPromise;

    var deferred = $q.defer();
    $timeout(function () {
      if (file.type.indexOf('audio') !== 0 && file.type.indexOf('video') !== 0) {
        deferred.reject('not media');
        return;
      }
      upload.dataUrl(file).then(function (dataUrl) {
        var el = angular.element(file.type.indexOf('audio') === 0 ? '<audio>' : '<video>')
          .attr('src', dataUrl).css('visibility', 'none').css('position', 'fixed');

        function success() {
          var duration = el[0].duration;
          file.$ngfDuration = duration;
          el.remove();
          deferred.resolve(duration);
        }

        function error() {
          el.remove();
          deferred.reject('load error');
        }

        el.on('loadedmetadata', success);
        el.on('error', error);
        var count = 0;

        function checkLoadError() {
          $timeout(function () {
            if (el[0].parentNode) {
              if (el[0].duration) {
                success();
              } else if (count > 10) {
                error();
              } else {
                checkLoadError();
              }
            }
          }, 1000);
        }

        checkLoadError();

        angular.element(document.body).append(el);
      }, function () {
        deferred.reject('load error');
      });
    });

    file.$ngfDurationPromise = deferred.promise;
    file.$ngfDurationPromise['finally'](function () {
      delete file.$ngfDurationPromise;
    });
    return file.$ngfDurationPromise;
  };
  return upload;
}
]);

ngFileUpload.service('UploadResize', ['UploadValidate', '$q', function (UploadValidate, $q) {
  var upload = UploadValidate;

  /**
   * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
   * images to fit into a certain area.
   * Source:  http://stackoverflow.com/a/14731922
   *
   * @param {Number} srcWidth Source area width
   * @param {Number} srcHeight Source area height
   * @param {Number} maxWidth Nestable area maximum available width
   * @param {Number} maxHeight Nestable area maximum available height
   * @return {Object} { width, height }
   */
  var calculateAspectRatioFit = function (srcWidth, srcHeight, maxWidth, maxHeight, centerCrop) {
    var ratio = centerCrop ? Math.max(maxWidth / srcWidth, maxHeight / srcHeight) :
      Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
      width: srcWidth * ratio, height: srcHeight * ratio,
      marginX: srcWidth * ratio - maxWidth, marginY: srcHeight * ratio - maxHeight
    };
  };

  // Extracted from https://github.com/romelgomez/angular-firebase-image-upload/blob/master/app/scripts/fileUpload.js#L89
  var resize = function (imagen, width, height, quality, type, ratio, centerCrop, resizeIf) {
    var deferred = $q.defer();
    var canvasElement = document.createElement('canvas');
    var imageElement = document.createElement('img');
    imageElement.setAttribute('style', 'visibility:hidden;position:fixed;z-index:-100000');
    document.body.appendChild(imageElement);

    imageElement.onload = function () {
      var imgWidth = imageElement.width, imgHeight = imageElement.height;
      imageElement.parentNode.removeChild(imageElement);
      if (resizeIf != null && resizeIf(imgWidth, imgHeight) === false) {
        deferred.reject('resizeIf');
        return;
      }
      try {
        if (ratio) {
          var ratioFloat = upload.ratioToFloat(ratio);
          var imgRatio = imgWidth / imgHeight;
          if (imgRatio < ratioFloat) {
            width = imgWidth;
            height = width / ratioFloat;
          } else {
            height = imgHeight;
            width = height * ratioFloat;
          }
        }
        if (!width) {
          width = imgWidth;
        }
        if (!height) {
          height = imgHeight;
        }
        var dimensions = calculateAspectRatioFit(imgWidth, imgHeight, width, height, centerCrop);
        canvasElement.width = Math.min(dimensions.width, width);
        canvasElement.height = Math.min(dimensions.height, height);
        var context = canvasElement.getContext('2d');
        context.drawImage(imageElement,
          Math.min(0, -dimensions.marginX / 2), Math.min(0, -dimensions.marginY / 2),
          dimensions.width, dimensions.height);
        deferred.resolve(canvasElement.toDataURL(type || 'image/WebP', quality || 0.934));
      } catch (e) {
        deferred.reject(e);
      }
    };
    imageElement.onerror = function () {
      imageElement.parentNode.removeChild(imageElement);
      deferred.reject();
    };
    imageElement.src = imagen;
    return deferred.promise;
  };

  upload.dataUrltoBlob = function (dataurl, name, origSize) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    var blob = new window.Blob([u8arr], {type: mime});
    blob.name = name;
    blob.$ngfOrigSize = origSize;
    return blob;
  };

  upload.isResizeSupported = function () {
    var elem = document.createElement('canvas');
    return window.atob && elem.getContext && elem.getContext('2d') && window.Blob;
  };

  if (upload.isResizeSupported()) {
    // add name getter to the blob constructor prototype
    Object.defineProperty(window.Blob.prototype, 'name', {
      get: function () {
        return this.$ngfName;
      },
      set: function (v) {
        this.$ngfName = v;
      },
      configurable: true
    });
  }

  upload.resize = function (file, options) {
    if (file.type.indexOf('image') !== 0) return upload.emptyPromise(file);

    var deferred = $q.defer();
    upload.dataUrl(file, true).then(function (url) {
      resize(url, options.width, options.height, options.quality, options.type || file.type,
        options.ratio, options.centerCrop, options.resizeIf)
        .then(function (dataUrl) {
          if (file.type === 'image/jpeg' && options.restoreExif !== false) {
            try {
              dataUrl = upload.restoreExif(url, dataUrl);
            } catch (e) {
              setTimeout(function () {throw e;}, 1);
            }
          }
          try {
            var blob = upload.dataUrltoBlob(dataUrl, file.name, file.size);
            deferred.resolve(blob);
          } catch (e) {
            deferred.reject(e);
          }
        }, function (r) {
          if (r === 'resizeIf') {
            deferred.resolve(file);
          }
          deferred.reject(r);
        });
    }, function (e) {
      deferred.reject(e);
    });
    return deferred.promise;
  };

  return upload;
}]);

(function () {
  ngFileUpload.directive('ngfDrop', ['$parse', '$timeout', '$window', 'Upload', '$http', '$q',
    function ($parse, $timeout, $window, Upload, $http, $q) {
      return {
        restrict: 'AEC',
        require: '?ngModel',
        link: function (scope, elem, attr, ngModel) {
          linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $window, Upload, $http, $q);
        }
      };
    }]);

  ngFileUpload.directive('ngfNoFileDrop', function () {
    return function (scope, elem) {
      if (dropAvailable()) elem.css('display', 'none');
    };
  });

  ngFileUpload.directive('ngfDropAvailable', ['$parse', '$timeout', 'Upload', function ($parse, $timeout, Upload) {
    return function (scope, elem, attr) {
      if (dropAvailable()) {
        var model = $parse(Upload.attrGetter('ngfDropAvailable', attr));
        $timeout(function () {
          model(scope);
          if (model.assign) {
            model.assign(scope, true);
          }
        });
      }
    };
  }]);

  function linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $window, upload, $http, $q) {
    var available = dropAvailable();

    var attrGetter = function (name, scope, params) {
      return upload.attrGetter(name, attr, scope, params);
    };

    if (attrGetter('dropAvailable')) {
      $timeout(function () {
        if (scope[attrGetter('dropAvailable')]) {
          scope[attrGetter('dropAvailable')].value = available;
        } else {
          scope[attrGetter('dropAvailable')] = available;
        }
      });
    }
    if (!available) {
      if (attrGetter('ngfHideOnDropNotAvailable', scope) === true) {
        elem.css('display', 'none');
      }
      return;
    }

    function isDisabled() {
      return elem.attr('disabled') || attrGetter('ngfDropDisabled', scope);
    }

    if (attrGetter('ngfSelect') == null) {
      upload.registerModelChangeValidator(ngModel, attr, scope);
    }

    var leaveTimeout = null;
    var stopPropagation = $parse(attrGetter('ngfStopPropagation'));
    var dragOverDelay = 1;
    var actualDragOverClass;

    elem[0].addEventListener('dragover', function (evt) {
      if (isDisabled() || !upload.shouldUpdateOn('drop', attr, scope)) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
      // handling dragover events from the Chrome download bar
      if (navigator.userAgent.indexOf('Chrome') > -1) {
        var b = evt.dataTransfer.effectAllowed;
        evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
      }
      $timeout.cancel(leaveTimeout);
      if (!actualDragOverClass) {
        actualDragOverClass = 'C';
        calculateDragOverClass(scope, attr, evt, function (clazz) {
          actualDragOverClass = clazz;
          elem.addClass(actualDragOverClass);
          attrGetter('ngfDrag', scope, {$isDragging: true, $class: actualDragOverClass, $event: evt});
        });
      }
    }, false);
    elem[0].addEventListener('dragenter', function (evt) {
      if (isDisabled() || !upload.shouldUpdateOn('drop', attr, scope)) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
    }, false);
    elem[0].addEventListener('dragleave', function (evt) {
      if (isDisabled() || !upload.shouldUpdateOn('drop', attr, scope)) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
      leaveTimeout = $timeout(function () {
        if (actualDragOverClass) elem.removeClass(actualDragOverClass);
        actualDragOverClass = null;
        attrGetter('ngfDrag', scope, {$isDragging: false, $event: evt});
      }, dragOverDelay || 100);
    }, false);
    elem[0].addEventListener('drop', function (evt) {
      if (isDisabled() || !upload.shouldUpdateOn('drop', attr, scope)) return;
      evt.preventDefault();
      if (stopPropagation(scope)) evt.stopPropagation();
      if (actualDragOverClass) elem.removeClass(actualDragOverClass);
      actualDragOverClass = null;
      var items = evt.dataTransfer.items;
      var html;
      try {
        html = evt.dataTransfer && evt.dataTransfer.getData && evt.dataTransfer.getData('text/html');
      } catch (e) {/* Fix IE11 that throw error calling getData */
      }

      extractFiles(items, evt.dataTransfer.files, attrGetter('ngfAllowDir', scope) !== false,
        attrGetter('multiple') || attrGetter('ngfMultiple', scope)).then(function (files) {
        if (files.length) {
          updateModel(files, evt);
        } else {
          extractFilesFromHtml('dropUrl', html).then(function (files) {
            updateModel(files, evt);
          });
        }
      });
    }, false);
    elem[0].addEventListener('paste', function (evt) {
      if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 &&
        attrGetter('ngfEnableFirefoxPaste', scope)) {
        evt.preventDefault();
      }
      if (isDisabled() || !upload.shouldUpdateOn('paste', attr, scope)) return;
      var files = [];
      var clipboard = evt.clipboardData || evt.originalEvent.clipboardData;
      if (clipboard && clipboard.items) {
        for (var k = 0; k < clipboard.items.length; k++) {
          if (clipboard.items[k].type.indexOf('image') !== -1) {
            files.push(clipboard.items[k].getAsFile());
          }
        }
      }
      if (files.length) {
        updateModel(files, evt);
      } else {
        extractFilesFromHtml('pasteUrl', clipboard).then(function (files) {
          updateModel(files, evt);
        });
      }
    }, false);

    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 &&
      attrGetter('ngfEnableFirefoxPaste', scope)) {
      elem.attr('contenteditable', true);
      elem.on('keypress', function (e) {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
        }
      });
    }

    function updateModel(files, evt) {
      upload.updateModel(ngModel, attr, scope, attrGetter('ngfChange') || attrGetter('ngfDrop'), files, evt);
    }

    function extractFilesFromHtml(updateOn, html) {
      if (!upload.shouldUpdateOn(updateOn, attr, scope) || typeof html !== 'string') return upload.rejectPromise([]);
      var urls = [];
      html.replace(/<(img src|img [^>]* src) *=\"([^\"]*)\"/gi, function (m, n, src) {
        urls.push(src);
      });
      var promises = [], files = [];
      if (urls.length) {
        angular.forEach(urls, function (url) {
          promises.push(upload.urlToBlob(url).then(function (blob) {
            files.push(blob);
          }));
        });
        var defer = $q.defer();
        $q.all(promises).then(function () {
          defer.resolve(files);
        }, function (e) {
          defer.reject(e);
        });
        return defer.promise;
      }
      return upload.emptyPromise();
    }

    function calculateDragOverClass(scope, attr, evt, callback) {
      var obj = attrGetter('ngfDragOverClass', scope, {$event: evt}), dClass = 'dragover';
      if (angular.isString(obj)) {
        dClass = obj;
      } else if (obj) {
        if (obj.delay) dragOverDelay = obj.delay;
        if (obj.accept || obj.reject) {
          var items = evt.dataTransfer.items;
          if (items == null || !items.length) {
            dClass = obj.accept;
          } else {
            var pattern = obj.pattern || attrGetter('ngfPattern', scope, {$event: evt});
            var len = items.length;
            while (len--) {
              if (!upload.validatePattern(items[len], pattern)) {
                dClass = obj.reject;
                break;
              } else {
                dClass = obj.accept;
              }
            }
          }
        }
      }
      callback(dClass);
    }

    function extractFiles(items, fileList, allowDir, multiple) {
      var maxFiles = upload.getValidationAttr(attr, scope, 'maxFiles');
      if (maxFiles == null) {
        maxFiles = Number.MAX_VALUE;
      }
      var maxTotalSize = upload.getValidationAttr(attr, scope, 'maxTotalSize');
      if (maxTotalSize == null) {
        maxTotalSize = Number.MAX_VALUE;
      }
      var includeDir = attrGetter('ngfIncludeDir', scope);
      var files = [], totalSize = 0;

      function traverseFileTree(entry, path) {
        var defer = $q.defer();
        if (entry != null) {
          if (entry.isDirectory) {
            var promises = [upload.emptyPromise()];
            if (includeDir) {
              var file = {type: 'directory'};
              file.name = file.path = (path || '') + entry.name;
              files.push(file);
            }
            var dirReader = entry.createReader();
            var entries = [];
            var readEntries = function () {
              dirReader.readEntries(function (results) {
                try {
                  if (!results.length) {
                    angular.forEach(entries.slice(0), function (e) {
                      if (files.length <= maxFiles && totalSize <= maxTotalSize) {
                        promises.push(traverseFileTree(e, (path ? path : '') + entry.name + '/'));
                      }
                    });
                    $q.all(promises).then(function () {
                      defer.resolve();
                    }, function (e) {
                      defer.reject(e);
                    });
                  } else {
                    entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                    readEntries();
                  }
                } catch (e) {
                  defer.reject(e);
                }
              }, function (e) {
                defer.reject(e);
              });
            };
            readEntries();
          } else {
            entry.file(function (file) {
              try {
                file.path = (path ? path : '') + file.name;
                if (includeDir) {
                  file = upload.rename(file, file.path);
                }
                files.push(file);
                totalSize += file.size;
                defer.resolve();
              } catch (e) {
                defer.reject(e);
              }
            }, function (e) {
              defer.reject(e);
            });
          }
        }
        return defer.promise;
      }

      var promises = [upload.emptyPromise()];

      if (items && items.length > 0 && $window.location.protocol !== 'file:') {
        for (var i = 0; i < items.length; i++) {
          if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory) {
            var entry = items[i].webkitGetAsEntry();
            if (entry.isDirectory && !allowDir) {
              continue;
            }
            if (entry != null) {
              promises.push(traverseFileTree(entry));
            }
          } else {
            var f = items[i].getAsFile();
            if (f != null) {
              files.push(f);
              totalSize += f.size;
            }
          }
          if (files.length > maxFiles || totalSize > maxTotalSize ||
            (!multiple && files.length > 0)) break;
        }
      } else {
        if (fileList != null) {
          for (var j = 0; j < fileList.length; j++) {
            var file = fileList.item(j);
            if (file.type || file.size > 0) {
              files.push(file);
              totalSize += file.size;
            }
            if (files.length > maxFiles || totalSize > maxTotalSize ||
              (!multiple && files.length > 0)) break;
          }
        }
      }

      var defer = $q.defer();
      $q.all(promises).then(function () {
        if (!multiple && !includeDir && files.length) {
          var i = 0;
          while (files[i] && files[i].type === 'directory') i++;
          defer.resolve([files[i]]);
        } else {
          defer.resolve(files);
        }
      }, function (e) {
        defer.reject(e);
      });

      return defer.promise;
    }
  }

  function dropAvailable() {
    var div = document.createElement('div');
    return ('draggable' in div) && ('ondrop' in div) && !/Edge\/12./i.test(navigator.userAgent);
  }

})();

// customized version of https://github.com/exif-js/exif-js
ngFileUpload.service('UploadExif', ['UploadResize', '$q', function (UploadResize, $q) {
  var upload = UploadResize;

  upload.isExifSupported = function () {
    return window.FileReader && new FileReader().readAsArrayBuffer && upload.isResizeSupported();
  };

  function applyTransform(ctx, orientation, width, height) {
    switch (orientation) {
      case 2:
        return ctx.transform(-1, 0, 0, 1, width, 0);
      case 3:
        return ctx.transform(-1, 0, 0, -1, width, height);
      case 4:
        return ctx.transform(1, 0, 0, -1, 0, height);
      case 5:
        return ctx.transform(0, 1, 1, 0, 0, 0);
      case 6:
        return ctx.transform(0, 1, -1, 0, height, 0);
      case 7:
        return ctx.transform(0, -1, -1, 0, height, width);
      case 8:
        return ctx.transform(0, -1, 1, 0, 0, width);
    }
  }

  upload.readOrientation = function (file) {
    var defer = $q.defer();
    var reader = new FileReader();
    var slicedFile = file.slice ? file.slice(0, 64 * 1024) : file;
    reader.readAsArrayBuffer(slicedFile);
    reader.onerror = function (e) {
      return defer.reject(e);
    };
    reader.onload = function (e) {
      var result = {orientation: 1};
      var view = new DataView(this.result);
      if (view.getUint16(0, false) !== 0xFFD8) return defer.resolve(result);

      var length = view.byteLength,
        offset = 2;
      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xFFE1) {
          if (view.getUint32(offset += 2, false) !== 0x45786966) return defer.resolve(result);

          var little = view.getUint16(offset += 6, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;
          for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
              var orientation = view.getUint16(offset + (i * 12) + 8, little);
              if (orientation >= 2 && orientation <= 8) {
                view.setUint16(offset + (i * 12) + 8, 1, little);
                result.fixedArrayBuffer = e.target.result;
              }
              result.orientation = orientation;
              return defer.resolve(result);
            }
        } else if ((marker & 0xFF00) !== 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      return defer.resolve(result);
    };
    return defer.promise;
  };

  function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  upload.applyExifRotation = function (file) {
    if (file.type.indexOf('image/jpeg') !== 0) {
      return upload.emptyPromise(file);
    }

    var deferred = $q.defer();
    upload.readOrientation(file).then(function (result) {
      if (result.orientation < 2 || result.orientation > 8) {
        return deferred.resolve(file);
      }
      upload.dataUrl(file, true).then(function (url) {
        var canvas = document.createElement('canvas');
        var img = document.createElement('img');

        img.onload = function () {
          try {
            canvas.width = result.orientation > 4 ? img.height : img.width;
            canvas.height = result.orientation > 4 ? img.width : img.height;
            var ctx = canvas.getContext('2d');
            applyTransform(ctx, result.orientation, img.width, img.height);
            ctx.drawImage(img, 0, 0);
            var dataUrl = canvas.toDataURL(file.type || 'image/WebP', 0.934);
            dataUrl = upload.restoreExif(arrayBufferToBase64(result.fixedArrayBuffer), dataUrl);
            var blob = upload.dataUrltoBlob(dataUrl, file.name);
            deferred.resolve(blob);
          } catch (e) {
            return deferred.reject(e);
          }
        };
        img.onerror = function () {
          deferred.reject();
        };
        img.src = url;
      }, function (e) {
        deferred.reject(e);
      });
    }, function (e) {
      deferred.reject(e);
    });
    return deferred.promise;
  };

  upload.restoreExif = function (orig, resized) {
    var ExifRestorer = {};

    ExifRestorer.KEY_STR = 'ABCDEFGHIJKLMNOP' +
      'QRSTUVWXYZabcdef' +
      'ghijklmnopqrstuv' +
      'wxyz0123456789+/' +
      '=';

    ExifRestorer.encode64 = function (input) {
      var output = '',
        chr1, chr2, chr3 = '',
        enc1, enc2, enc3, enc4 = '',
        i = 0;

      do {
        chr1 = input[i++];
        chr2 = input[i++];
        chr3 = input[i++];

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }

        output = output +
          this.KEY_STR.charAt(enc1) +
          this.KEY_STR.charAt(enc2) +
          this.KEY_STR.charAt(enc3) +
          this.KEY_STR.charAt(enc4);
        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';
      } while (i < input.length);

      return output;
    };

    ExifRestorer.restore = function (origFileBase64, resizedFileBase64) {
      if (origFileBase64.match('data:image/jpeg;base64,')) {
        origFileBase64 = origFileBase64.replace('data:image/jpeg;base64,', '');
      }

      var rawImage = this.decode64(origFileBase64);
      var segments = this.slice2Segments(rawImage);

      var image = this.exifManipulation(resizedFileBase64, segments);

      return 'data:image/jpeg;base64,' + this.encode64(image);
    };


    ExifRestorer.exifManipulation = function (resizedFileBase64, segments) {
      var exifArray = this.getExifArray(segments),
        newImageArray = this.insertExif(resizedFileBase64, exifArray);
      return new Uint8Array(newImageArray);
    };


    ExifRestorer.getExifArray = function (segments) {
      var seg;
      for (var x = 0; x < segments.length; x++) {
        seg = segments[x];
        if (seg[0] === 255 & seg[1] === 225) //(ff e1)
        {
          return seg;
        }
      }
      return [];
    };


    ExifRestorer.insertExif = function (resizedFileBase64, exifArray) {
      var imageData = resizedFileBase64.replace('data:image/jpeg;base64,', ''),
        buf = this.decode64(imageData),
        separatePoint = buf.indexOf(255, 3),
        mae = buf.slice(0, separatePoint),
        ato = buf.slice(separatePoint),
        array = mae;

      array = array.concat(exifArray);
      array = array.concat(ato);
      return array;
    };


    ExifRestorer.slice2Segments = function (rawImageArray) {
      var head = 0,
        segments = [];

      while (1) {
        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 218) {
          break;
        }
        if (rawImageArray[head] === 255 & rawImageArray[head + 1] === 216) {
          head += 2;
        }
        else {
          var length = rawImageArray[head + 2] * 256 + rawImageArray[head + 3],
            endPoint = head + length + 2,
            seg = rawImageArray.slice(head, endPoint);
          segments.push(seg);
          head = endPoint;
        }
        if (head > rawImageArray.length) {
          break;
        }
      }

      return segments;
    };


    ExifRestorer.decode64 = function (input) {
      var chr1, chr2, chr3 = '',
        enc1, enc2, enc3, enc4 = '',
        i = 0,
        buf = [];

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
        console.log('There were invalid base64 characters in the input text.\n' +
          'Valid base64 characters are A-Z, a-z, 0-9, ' + ', ' / ',and "="\n' +
          'Expect errors in decoding.');
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

      do {
        enc1 = this.KEY_STR.indexOf(input.charAt(i++));
        enc2 = this.KEY_STR.indexOf(input.charAt(i++));
        enc3 = this.KEY_STR.indexOf(input.charAt(i++));
        enc4 = this.KEY_STR.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        buf.push(chr1);

        if (enc3 !== 64) {
          buf.push(chr2);
        }
        if (enc4 !== 64) {
          buf.push(chr3);
        }

        chr1 = chr2 = chr3 = '';
        enc1 = enc2 = enc3 = enc4 = '';

      } while (i < input.length);

      return buf;
    };

    return ExifRestorer.restore(orig, resized);  //<= EXIF
  };

  return upload;
}]);


},{}],5:[function(require,module,exports){
require('./dist/ng-file-upload-all');
module.exports = 'ngFileUpload';
},{"./dist/ng-file-upload-all":4}],6:[function(require,module,exports){
(function (global){
'use strict';

var _angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var _angular2 = _interopRequireDefault(_angular);

var _routing = require('./config/routing');

var _routing2 = _interopRequireDefault(_routing);

var _http = require('./config/http');

var _http2 = _interopRequireDefault(_http);

var _home = require('./modules/home/');

var _home2 = _interopRequireDefault(_home);

var _gallery = require('./modules/gallery/');

var _gallery2 = _interopRequireDefault(_gallery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var modules = [_home2.default, _gallery2.default];

var app = _angular2.default.module('app', modules).config(_routing2.default).config(_http2.default);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./config/http":7,"./config/routing":8,"./modules/gallery/":12,"./modules/home/":18}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = http;
http.$inject = ['$httpProvider'];

function http($httpProvider) {
	$httpProvider.interceptors.push(function () {
		return {
			'request': function request(config) {
				config.headers.Authorization = 'Bearer: ' + window.access_token;

				return config;
			}
		};
	});
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routing;
routing.$inject = ['$urlRouterProvider', '$locationProvider'];

function routing($urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
}

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GalleryCreateController = function GalleryCreateController($scope) {
    _classCallCheck(this, GalleryCreateController);

    $scope.message = 'create new gallery';
};

exports.default = GalleryCreateController;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GalleryListController = function () {
    function GalleryListController(API) {
        _classCallCheck(this, GalleryListController);

        this.galleries = [];
        this.newGallery = {};

        this.API = API;

        this.loadGallery();
    }

    _createClass(GalleryListController, [{
        key: "loadGallery",
        value: function loadGallery() {
            var _this = this;

            this.API.gallery.get().$promise.then(function (response) {
                _this.galleries = response.data;
            });
        }
    }, {
        key: "onSubmitNew",
        value: function onSubmitNew() {
            var _this2 = this;

            this.API.gallery.save({}, this.newGallery).$promise.then(function (response) {
                _this2.loadGallery();
                _this2.newGallery = {};
            });
        }
    }, {
        key: "onDeleteGallery",
        value: function onDeleteGallery(galleryId) {
            var _this3 = this;

            this.API.gallery.delete({ id: galleryId }).$promise.then(function (response) {
                _this3.loadGallery();
            });
        }
    }]);

    return GalleryListController;
}();

exports.default = GalleryListController;

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GalleryManageController = function () {
    function GalleryManageController(API, Upload, $stateParams) {
        _classCallCheck(this, GalleryManageController);

        this.gallery = {};
        this.files = [];
        this.title = '';
        this.progress = null;

        this.API = API;
        this.loadGallery($stateParams.gallery_id);
        this.Upload = Upload;
    }

    _createClass(GalleryManageController, [{
        key: 'loadGallery',
        value: function loadGallery(galleryId) {
            var _this = this;

            this.API.gallery.get({ id: galleryId }).$promise.then(function (response) {
                _this.gallery = response.data;
            });
        }
    }, {
        key: 'onSubmitPhoto',
        value: function onSubmitPhoto() {
            var _this2 = this;

            this.Upload.upload({
                url: window.api_url + '/gallery/' + this.gallery.id + '/photos',
                data: { photo: this.file, 'title': this.title },
                headers: { Authorization: 'Bearer: ' + window.access_token }
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.photo.name + 'uploaded. Response: ' + resp.data);
                _this2.file = null;
                _this2.progress = null;
                _this2.title = null;
                _this2.loadGallery(_this2.gallery.id);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                _this2.progress = parseInt(100.0 * evt.loaded / evt.total);
            });
        }
    }, {
        key: 'onSetDefaultPhoto',
        value: function onSetDefaultPhoto(photoId) {
            var _this3 = this;

            this.API.gallery.update({ id: this.gallery.id }, { default_photo: photoId }).$promise.then(function (response) {
                _this3.loadGallery(_this3.gallery.id);
            });
        }
    }, {
        key: 'onDeletePhoto',
        value: function onDeletePhoto(photoId) {
            var _this4 = this;

            this.API.photos.delete({ galleryId: this.gallery.id, photoId: photoId }).$promise.then(function (response) {
                _this4.loadGallery(_this4.gallery.id);
            });
        }
    }]);

    return GalleryManageController;
}();

exports.default = GalleryManageController;

},{}],12:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var _angular2 = _interopRequireDefault(_angular);

var _angularUiRouter = require('angular-ui-router');

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _API = require('../../services/API');

var _API2 = _interopRequireDefault(_API);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _ngFileUpload = require('ng-file-upload');

var _ngFileUpload2 = _interopRequireDefault(_ngFileUpload);

var _galleryList = require('./controllers/gallery.list.controller');

var _galleryList2 = _interopRequireDefault(_galleryList);

var _galleryCreate = require('./controllers/gallery.create.controller');

var _galleryCreate2 = _interopRequireDefault(_galleryCreate);

var _galleryManage = require('./controllers/gallery.manage.controller');

var _galleryManage2 = _interopRequireDefault(_galleryManage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _angular2.default.module('app.gallery', [_angularUiRouter2.default, _API2.default, _ngFileUpload2.default]).config(_routes2.default).controller('GalleryListController', _galleryList2.default).controller('GalleryCreateController', _galleryCreate2.default).controller('GalleryManageController', _galleryManage2.default).name;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../services/API":21,"./controllers/gallery.create.controller":9,"./controllers/gallery.list.controller":10,"./controllers/gallery.manage.controller":11,"./routes":13,"angular-ui-router":3,"ng-file-upload":5}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routes;
routes.$inject = ['$stateProvider'];

function routes($stateProvider) {
  var galleryAbstractState = {
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
  });
}

},{"./views/gallery.create.html":14,"./views/gallery.list.html":15,"./views/gallery.manage.html":16}],14:[function(require,module,exports){
module.exports = "<h1>{{$controller.message}}</h1>stwórz nową";

},{}],15:[function(require,module,exports){
module.exports = "<section class=content-header><h1>Realizacje <small>Panel zarządzania</small></h1><ol class=breadcrumb><li><a href=\"/\"><i class=\"fa fa-dashboard\"></i> Strona główna</a></li><li class=active>Realizacje</li></ol></section><section class=content><div class=row><ul class=timeline><li ng-repeat=\"gallery in $controller.galleries track by gallery.id\"><i class=\"fa fa-camera\" ng-class=\"{ 'bg-red': gallery.category == 1, \n                    'bg-blue': gallery.category == 2 }\"></i><div class=timeline-item><span class=time><i class=\"fa fa-clock-o\"></i> {{ gallery.created_at }}</span><h3 class=timeline-header><a ui-sref=\"gallery.manage({gallery_id: gallery.id})\" ng-bind=gallery.name></a> {{ gallery.category == 1 ? '(prywatne)' : '(dla firm)'}} {{ gallery.description | limitTo: 40 }}{{gallery.description.length > 40 ? '...' : ''}} <a ui-sref=\"gallery.manage({gallery_id: gallery.id})\"><i class=\"fa fa-edit\"></i></a> <a ng-click=$controller.onDeleteGallery(gallery.id)><i class=\"fa fa-remove red\"></i></a></h3><div><img ng-repeat=\"photo in gallery.photos track by photo.id\" ng-src={{photo.path.mini}} class=margin></div></div></li></ul></div><div class=row><div class=col-md-6><div class=\"box box-primary\"><form role=form ng-submit=$controller.onSubmitNew()><div class=\"box-header with-border\"><h3 class=box-title>Stwórz nową realizację</h3></div><div class=box-body><div class=form-group><label for=title>Tytuł galerii</label><input class=form-control id=title placeholder=\"Wpisz tytuł\" ng-model=$controller.newGallery.name></div><div class=form-group><label for=category>Kategoria</label><select class=form-control id=category placeholder=\"wybierz kategorię\" ng-model=$controller.newGallery.category><option value=1>prywatna</option><option value=2>dla firm</option></select></div><div class=form-group><textarea class=form-control ng-model=$controller.newGallery.description placeholder=\"Podaj opis realizacji\">\n                                \n                            </textarea></div></div><div class=box-footer><button type=submit class=\"btn btn-primary\">Dodaj</button></div></form></div></div></div></section>";

},{}],16:[function(require,module,exports){
module.exports = "<section class=content-header><h1 ng-bind=$controller.gallery.name></h1><ol class=breadcrumb><li><a ui-sref=home><i class=\"fa fa-dashboard\"></i> Strona główna</a></li><li><a ui-sref=gallery.list>Realizacje</a></li><li class=active>{{ $controller.gallery.name }}</li></ol></section><section class=content><div class=box><div class=\"box-header with-border\"><h3 class=box-title>Zarządzaj galerią</h3></div><div class=box-body><div class=\"box-tools pull-right\"><button type=button class=\"btn btn-box-tool\" data-widget=collapse data-toggle=tooltip title=edytuj><i class=\"fa fa-edit\"></i></button></div><div id=description ng-bind=$controller.gallery.description></div></div><div class=box-footer><div id=photos class=row><div ng-repeat=\"photo in $controller.gallery.photos track by photo.id\" class=\"col-lg-4 col-md-6 col-xs-6 thumb text-center\" style=\"height: 250px\" ng-class=\"$controller.gallery.default_photo === photo.id ? 'default' : ''\"><div class=photo-element><img ng-src={{photo.path.mini}}><br><a ng-click=$controller.onDeletePhoto(photo.id) href=#><i class=\"fa fa-remove\" title=usuń></i></a> <a ng-click=$controller.onSetDefaultPhoto(photo.id) href=# ng-show=\"$controller.gallery.default_photo !== photo.id\"><i class=\"fa fa-check-square-o\" title=\"ustaw jako domyślne\"></i></a></div><br><span ng-bind=photo.title></span></div></div></div></div><div class=row><div class=col-md-6><form role=form ng-submit=$controller.onSubmitPhoto()><div class=\"box box-primary\"><div class=\"box-header with-border\"><h3 class=box-title>Dodaj zdjęcie</h3></div><div class=box-body><div class=form-group><label for=title>Tytuł zdjęcia</label><input class=form-control id=title placeholder=\"Wpisz tytuł\" ng-model=$controller.title></div><div class=form-group id=file-uploader ngf-drop ng-model=$controller.file ngf-drag-over-class=\"'file-over'\" ngf-multiple=false ngf-pattern=\"'image/*'\" ngf-max-size=30MB ngf-accept=\"'image/*'\"><label for=photo>File input</label><input type=file class=button ngf-select ng-model=$controller.file name=file ngf-pattern=\"'image/*'\" ngf-accept=\"'image/*'\" ngf-max-size=30MB ngf-min-height=100> Select</div><p class=help-block>Wybierz zdjęcie (max 3 Mb).</p><img class=thumb style=\"max-width: 350px\" ngf-thumbnail=$controller.file></div><div class=box-footer><div class=\"progress progress-sm\" ng-show=$controller.progress><div class=\"progress-bar progress-bar-danger progress-bar-striped\" role=progressbar aria-valuenow={{$controller.progress}} aria-valuemin=0 aria-valuemax=100 style=\"width: {{$controller.progress}}%\"><span class=sr-only>{{$controller.progress}}%</span></div></div><button type=submit class=\"btn btn-primary\">Dodaj</button></div></div></form></div></div></section><style>#file-uploader {\n}\n#file-uploader.file-over {\n\tborder: 1px dashed gray;\n}\n#file-uploader img {\n\tmax-width: 350px;\n\tmax-height: 250px;\n}\n\ndiv#photos div.default img {\n\tborder: 2px solid green;\n}\n\ndiv.photo-element {\n\tposition: relative;\n\tdisplay: inline-block;\n}\ndiv.photo-element i {\n\tcolor: #000;\n}\n\ndiv.photo-element i.fa-remove {\n\tposition: absolute;\n\ttop: 5px;\n\tright: 5px;\n}\n\ndiv.photo-element i.fa-check-square-o {\n\tposition: absolute;\n\ttop: 5px;\n\tright: 25px;\n}\n\ndiv.photo-element i.fa-remove:hover {\n\tcolor: red;\n}\n\ndiv.photo-element i.fa-check-square-o:hover {\n\tcolor: #4aad3b;\n}</style>";

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HomeController = function HomeController($scope) {
    _classCallCheck(this, HomeController);

    $scope.message = 'welcome home';
};

exports.default = HomeController;

},{}],18:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var _angular2 = _interopRequireDefault(_angular);

var _angularUiRouter = require('angular-ui-router');

var _angularUiRouter2 = _interopRequireDefault(_angularUiRouter);

var _routes = require('./routes');

var _routes2 = _interopRequireDefault(_routes);

var _home = require('./controllers/home.controller');

var _home2 = _interopRequireDefault(_home);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _angular2.default.module('app.home', [_angularUiRouter2.default]).config(_routes2.default).controller('HomeController', _home2.default).name;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./controllers/home.controller":17,"./routes":19,"angular-ui-router":3}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = routes;
routes.$inject = ['$stateProvider'];

function routes($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    template: require('./views/home.html'),
    controller: 'HomeController',
    controllerAs: 'home'
  });
}

},{"./views/home.html":20}],20:[function(require,module,exports){
module.exports = "<section class=content-header><h1>Dashboard <small>Control panel</small></h1><ol class=breadcrumb><li><a href=#><i class=\"fa fa-dashboard\"></i> Home</a></li><li class=active>Dashboard</li></ol></section><section class=content><div class=row><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-aqua\"><div class=inner><h3>150</h3><p>New Orders</p></div><div class=icon><i class=\"ion ion-bag\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-green\"><div class=inner><h3>53<sup style=\"font-size: 20px\">%</sup></h3><p>Bounce Rate</p></div><div class=icon><i class=\"ion ion-stats-bars\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-yellow\"><div class=inner><h3>44</h3><p>User Registrations</p></div><div class=icon><i class=\"ion ion-person-add\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-red\"><div class=inner><h3>65</h3><p>Unique Visitors</p></div><div class=icon><i class=\"ion ion-pie-graph\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div></div><div class=row><section class=\"col-lg-7 connectedSortable\"><div class=nav-tabs-custom><ul class=\"nav nav-tabs pull-right\"><li class=active><a href=#revenue-chart data-toggle=tab>Area</a></li><li><a href=#sales-chart data-toggle=tab>Donut</a></li><li class=\"pull-left header\"><i class=\"fa fa-inbox\"></i> Sales</li></ul><div class=\"tab-content no-padding\"><div class=\"chart tab-pane active\" id=revenue-chart style=\"position: relative; height: 300px\"></div><div class=\"chart tab-pane\" id=sales-chart style=\"position: relative; height: 300px\"></div></div></div><div class=\"box box-success\"><div class=box-header><i class=\"fa fa-comments-o\"></i><h3 class=box-title>Chat</h3><div class=\"box-tools pull-right\" data-toggle=tooltip title=Status><div class=btn-group data-toggle=btn-toggle><button type=button class=\"btn btn-default btn-sm active\"><i class=\"fa fa-square text-green\"></i></button> <button type=button class=\"btn btn-default btn-sm\"><i class=\"fa fa-square text-red\"></i></button></div></div></div><div class=\"box-body chat\" id=chat-box><div class=item><img src=dist/img/user4-128x128.jpg alt=\"user image\" class=online><p class=message><a href=# class=name><small class=\"text-muted pull-right\"><i class=\"fa fa-clock-o\"></i> 2:15</small> Mike Doe</a> I would like to meet you to discuss the latest news about the arrival of the new theme. They say it is going to be one the best themes on the market</p><div class=attachment><h4>Attachments:</h4><p class=filename>Theme-thumbnail-image.jpg</p><div class=pull-right><button type=button class=\"btn btn-primary btn-sm btn-flat\">Open</button></div></div></div><div class=item><img src=dist/img/user3-128x128.jpg alt=\"user image\" class=offline><p class=message><a href=# class=name><small class=\"text-muted pull-right\"><i class=\"fa fa-clock-o\"></i> 5:15</small> Alexander Pierce</a> I would like to meet you to discuss the latest news about the arrival of the new theme. They say it is going to be one the best themes on the market</p></div><div class=item><img src=dist/img/user2-160x160.jpg alt=\"user image\" class=offline><p class=message><a href=# class=name><small class=\"text-muted pull-right\"><i class=\"fa fa-clock-o\"></i> 5:30</small> Susan Doe</a> I would like to meet you to discuss the latest news about the arrival of the new theme. They say it is going to be one the best themes on the market</p></div></div><div class=box-footer><div class=input-group><input class=form-control placeholder=\"Type message...\"><div class=input-group-btn><button type=button class=\"btn btn-success\"><i class=\"fa fa-plus\"></i></button></div></div></div></div><div class=\"box box-primary\"><div class=box-header><i class=\"ion ion-clipboard\"></i><h3 class=box-title>To Do List</h3><div class=\"box-tools pull-right\"><ul class=\"pagination pagination-sm inline\"><li><a href=#>&laquo;</a></li><li><a href=#>1</a></li><li><a href=#>2</a></li><li><a href=#>3</a></li><li><a href=#>&raquo;</a></li></ul></div></div><div class=box-body><ul class=todo-list><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Design a nice theme</span> <small class=\"label label-danger\"><i class=\"fa fa-clock-o\"></i> 2 mins</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Make the theme responsive</span> <small class=\"label label-info\"><i class=\"fa fa-clock-o\"></i> 4 hours</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Let theme shine like a star</span> <small class=\"label label-warning\"><i class=\"fa fa-clock-o\"></i> 1 day</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Let theme shine like a star</span> <small class=\"label label-success\"><i class=\"fa fa-clock-o\"></i> 3 days</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Check your messages and notifications</span> <small class=\"label label-primary\"><i class=\"fa fa-clock-o\"></i> 1 week</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Let theme shine like a star</span> <small class=\"label label-default\"><i class=\"fa fa-clock-o\"></i> 1 month</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li></ul></div><div class=\"box-footer clearfix no-border\"><button type=button class=\"btn btn-default pull-right\"><i class=\"fa fa-plus\"></i> Add item</button></div></div><div class=\"box box-info\"><div class=box-header><i class=\"fa fa-envelope\"></i><h3 class=box-title>Quick Email</h3><div class=\"pull-right box-tools\"><button type=button class=\"btn btn-info btn-sm\" data-widget=remove data-toggle=tooltip title=Remove><i class=\"fa fa-times\"></i></button></div></div><div class=box-body><form action=# method=post><div class=form-group><input type=email class=form-control name=emailto placeholder=\"Email to:\"></div><div class=form-group><input type=text class=form-control name=subject placeholder=Subject></div><div><textarea class=textarea placeholder=Message style=\"width: 100%; height: 125px; font-size: 14px; line-height: 18px; border: 1px solid #dddddd; padding: 10px\"></textarea></div></form></div><div class=\"box-footer clearfix\"><button type=button class=\"pull-right btn btn-default\" id=sendEmail>Send <i class=\"fa fa-arrow-circle-right\"></i></button></div></div></section><section class=\"col-lg-5 connectedSortable\"><div class=\"box box-solid bg-light-blue-gradient\"><div class=box-header><div class=\"pull-right box-tools\"><button type=button class=\"btn btn-primary btn-sm daterange pull-right\" data-toggle=tooltip title=\"Date range\"><i class=\"fa fa-calendar\"></i></button> <button type=button class=\"btn btn-primary btn-sm pull-right\" data-widget=collapse data-toggle=tooltip title=Collapse style=\"margin-right: 5px\"><i class=\"fa fa-minus\"></i></button></div><i class=\"fa fa-map-marker\"></i><h3 class=box-title>Visitors</h3></div><div class=box-body><div id=world-map style=\"height: 250px; width: 100%\"></div></div><div class=\"box-footer no-border\"><div class=row><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><div id=sparkline-1></div><div class=knob-label>Visitors</div></div><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><div id=sparkline-2></div><div class=knob-label>Online</div></div><div class=\"col-xs-4 text-center\"><div id=sparkline-3></div><div class=knob-label>Exists</div></div></div></div></div><div class=\"box box-solid bg-teal-gradient\"><div class=box-header><i class=\"fa fa-th\"></i><h3 class=box-title>Sales Graph</h3><div class=\"box-tools pull-right\"><button type=button class=\"btn bg-teal btn-sm\" data-widget=collapse><i class=\"fa fa-minus\"></i></button> <button type=button class=\"btn bg-teal btn-sm\" data-widget=remove><i class=\"fa fa-times\"></i></button></div></div><div class=\"box-body border-radius-none\"><div class=chart id=line-chart style=\"height: 250px\"></div></div><div class=\"box-footer no-border\"><div class=row><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><input type=text class=knob data-readonly=true value=20 data-width=60 data-height=60 data-fgcolor=#39CCCC><div class=knob-label>Mail-Orders</div></div><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><input type=text class=knob data-readonly=true value=50 data-width=60 data-height=60 data-fgcolor=#39CCCC><div class=knob-label>Online</div></div><div class=\"col-xs-4 text-center\"><input type=text class=knob data-readonly=true value=30 data-width=60 data-height=60 data-fgcolor=#39CCCC><div class=knob-label>In-Store</div></div></div></div></div><div class=\"box box-solid bg-green-gradient\"><div class=box-header><i class=\"fa fa-calendar\"></i><h3 class=box-title>Calendar</h3><div class=\"pull-right box-tools\"><div class=btn-group><button type=button class=\"btn btn-success btn-sm dropdown-toggle\" data-toggle=dropdown><i class=\"fa fa-bars\"></i></button><ul class=\"dropdown-menu pull-right\" role=menu><li><a href=#>Add new event</a></li><li><a href=#>Clear events</a></li><li class=divider></li><li><a href=#>View calendar</a></li></ul></div><button type=button class=\"btn btn-success btn-sm\" data-widget=collapse><i class=\"fa fa-minus\"></i></button> <button type=button class=\"btn btn-success btn-sm\" data-widget=remove><i class=\"fa fa-times\"></i></button></div></div><div class=\"box-body no-padding\"><div id=calendar style=\"width: 100%\"></div></div><div class=\"box-footer text-black\"><div class=row><div class=col-sm-6><div class=clearfix><span class=pull-left>Task #1</span> <small class=pull-right>90%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 90%\"></div></div><div class=clearfix><span class=pull-left>Task #2</span> <small class=pull-right>70%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 70%\"></div></div></div><div class=col-sm-6><div class=clearfix><span class=pull-left>Task #3</span> <small class=pull-right>60%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 60%\"></div></div><div class=clearfix><span class=pull-left>Task #4</span> <small class=pull-right>40%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 40%\"></div></div></div></div></div></div></section></div></section>";

},{}],21:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var _angular2 = _interopRequireDefault(_angular);

var _angularResource = require('angular-resource');

var _angularResource2 = _interopRequireDefault(_angularResource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var API = function API($resource) {
	_classCallCheck(this, API);

	var resources = {};
	var url = window.api_url;

	resources.gallery = $resource(url + '/gallery/:id', null, {
		'update': { method: 'PUT' }
	});

	resources.photos = $resource(url + '/gallery/:galleryId/photos/:photoId');

	return resources;
};

exports.default = _angular2.default.module('services.API', [_angularResource2.default]).service('API', API).name;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"angular-resource":2}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1yZXNvdXJjZS9hbmd1bGFyLXJlc291cmNlLmpzIiwibm9kZV9tb2R1bGVzL2FuZ3VsYXItcmVzb3VyY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci11aS1yb3V0ZXIvcmVsZWFzZS9hbmd1bGFyLXVpLXJvdXRlci5qcyIsIm5vZGVfbW9kdWxlcy9uZy1maWxlLXVwbG9hZC9kaXN0L25nLWZpbGUtdXBsb2FkLWFsbC5qcyIsIm5vZGVfbW9kdWxlcy9uZy1maWxlLXVwbG9hZC9pbmRleC5qcyIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vYXBwLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9jb25maWcvaHR0cC5qcyIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vY29uZmlnL3JvdXRpbmcuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS9jb250cm9sbGVycy9nYWxsZXJ5LmNyZWF0ZS5jb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvY29udHJvbGxlcnMvZ2FsbGVyeS5saXN0LmNvbnRyb2xsZXIuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS9jb250cm9sbGVycy9nYWxsZXJ5Lm1hbmFnZS5jb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvaW5kZXguanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS9yb3V0ZXMuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS92aWV3cy9nYWxsZXJ5LmNyZWF0ZS5odG1sIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvdmlld3MvZ2FsbGVyeS5saXN0Lmh0bWwiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS92aWV3cy9nYWxsZXJ5Lm1hbmFnZS5odG1sIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2hvbWUvY29udHJvbGxlcnMvaG9tZS5jb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2hvbWUvaW5kZXguanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvaG9tZS9yb3V0ZXMuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvaG9tZS92aWV3cy9ob21lLmh0bWwiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL3NlcnZpY2VzL0FQSS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvMUJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3gxRkE7QUFDQTs7Ozs7QUNEQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFJLFVBQVUsbUNBQWQ7O0FBRUEsSUFBSSxNQUFNLGtCQUNMLE1BREssQ0FDRSxLQURGLEVBQ1MsT0FEVCxFQUVMLE1BRkssb0JBR0wsTUFISyxnQkFBVjs7Ozs7Ozs7OztrQkNQd0IsSTtBQUZ4QixLQUFLLE9BQUwsR0FBZSxDQUFDLGVBQUQsQ0FBZjs7QUFFZSxTQUFTLElBQVQsQ0FBYyxhQUFkLEVBQTZCO0FBQzNDLGVBQWMsWUFBZCxDQUEyQixJQUEzQixDQUFnQyxZQUFNO0FBQ3JDLFNBQU87QUFDTixjQUFXLGlCQUFTLE1BQVQsRUFBaUI7QUFDeEIsV0FBTyxPQUFQLENBQWUsYUFBZixHQUErQixhQUFhLE9BQU8sWUFBbkQ7O0FBRUEsV0FBTyxNQUFQO0FBQ0E7QUFMRSxHQUFQO0FBT0EsRUFSRDtBQVNBOzs7Ozs7OztrQkNWdUIsTztBQUZ4QixRQUFRLE9BQVIsR0FBa0IsQ0FBQyxvQkFBRCxFQUF1QixtQkFBdkIsQ0FBbEI7O0FBRWUsU0FBUyxPQUFULENBQWlCLGtCQUFqQixFQUFxQyxpQkFBckMsRUFBd0Q7QUFDckUsb0JBQWtCLFNBQWxCLENBQTRCLElBQTVCO0FBQ0EscUJBQW1CLFNBQW5CLENBQTZCLEdBQTdCO0FBQ0Q7Ozs7Ozs7Ozs7O0lDTG9CLHVCLEdBRWpCLGlDQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFDaEIsV0FBTyxPQUFQLEdBQWlCLG9CQUFqQjtBQUNILEM7O2tCQUpnQix1Qjs7Ozs7Ozs7Ozs7OztJQ0FBLHFCO0FBTWpCLG1DQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFBQSxhQUpwQixTQUlvQixHQUpSLEVBSVE7QUFBQSxhQUZqQixVQUVpQixHQUZKLEVBRUk7O0FBQ2hCLGFBQUssR0FBTCxHQUFXLEdBQVg7O0FBRUEsYUFBSyxXQUFMO0FBQ0E7Ozs7c0NBRWE7QUFBQTs7QUFDYixpQkFBSyxHQUFMLENBQVMsT0FBVCxDQUFpQixHQUFqQixHQUF1QixRQUF2QixDQUFnQyxJQUFoQyxDQUFxQyxVQUFDLFFBQUQsRUFBYztBQUMvQyxzQkFBSyxTQUFMLEdBQWlCLFNBQVMsSUFBMUI7QUFDQSxhQUZKO0FBR0E7OztzQ0FFYTtBQUFBOztBQUNWLGlCQUFLLEdBQUwsQ0FBUyxPQUFULENBQWlCLElBQWpCLENBQXNCLEVBQXRCLEVBQTBCLEtBQUssVUFBL0IsRUFBMkMsUUFBM0MsQ0FBb0QsSUFBcEQsQ0FBeUQsVUFBQyxRQUFELEVBQWM7QUFDbkUsdUJBQUssV0FBTDtBQUNBLHVCQUFLLFVBQUwsR0FBa0IsRUFBbEI7QUFDSCxhQUhEO0FBSUg7Ozt3Q0FFZSxTLEVBQ2hCO0FBQUE7O0FBQ0ksaUJBQUssR0FBTCxDQUFTLE9BQVQsQ0FBaUIsTUFBakIsQ0FBd0IsRUFBQyxJQUFJLFNBQUwsRUFBeEIsRUFBeUMsUUFBekMsQ0FBa0QsSUFBbEQsQ0FBdUQsVUFBQyxRQUFELEVBQWM7QUFDakUsdUJBQUssV0FBTDtBQUNILGFBRkQ7QUFHSDs7Ozs7O2tCQTlCZ0IscUI7Ozs7Ozs7Ozs7Ozs7SUNBQSx1QjtBQU1qQixxQ0FBWSxHQUFaLEVBQWlCLE1BQWpCLEVBQXlCLFlBQXpCLEVBQXVDO0FBQUE7O0FBQUEsYUFMMUMsT0FLMEMsR0FMaEMsRUFLZ0M7QUFBQSxhQUoxQyxLQUkwQyxHQUpsQyxFQUlrQztBQUFBLGFBSDFDLEtBRzBDLEdBSGxDLEVBR2tDO0FBQUEsYUFGMUMsUUFFMEMsR0FGL0IsSUFFK0I7O0FBQ3RDLGFBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxhQUFLLFdBQUwsQ0FBaUIsYUFBYSxVQUE5QjtBQUNBLGFBQUssTUFBTCxHQUFjLE1BQWQ7QUFDQTs7OztvQ0FFVyxTLEVBQVc7QUFBQTs7QUFDdEIsaUJBQUssR0FBTCxDQUFTLE9BQVQsQ0FBaUIsR0FBakIsQ0FBcUIsRUFBQyxJQUFJLFNBQUwsRUFBckIsRUFBc0MsUUFBdEMsQ0FBK0MsSUFBL0MsQ0FBb0QsVUFBQyxRQUFELEVBQWM7QUFDakUsc0JBQUssT0FBTCxHQUFlLFNBQVMsSUFBeEI7QUFDQSxhQUZEO0FBR0E7Ozt3Q0FFZTtBQUFBOztBQUNmLGlCQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CO0FBQ1oscUJBQVEsT0FBTyxPQUFmLGlCQUFrQyxLQUFLLE9BQUwsQ0FBYSxFQUEvQyxZQURZO0FBRVosc0JBQU0sRUFBQyxPQUFPLEtBQUssSUFBYixFQUFtQixTQUFTLEtBQUssS0FBakMsRUFGTTtBQUdaLHlCQUFTLEVBQUMsNEJBQTBCLE9BQU8sWUFBbEM7QUFIRyxhQUFuQixFQUlNLElBSk4sQ0FJVyxVQUFDLElBQUQsRUFBVTtBQUNkLHdCQUFRLEdBQVIsQ0FBWSxhQUFhLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsS0FBakIsQ0FBdUIsSUFBcEMsR0FBMkMsc0JBQTNDLEdBQW9FLEtBQUssSUFBckY7QUFDQSx1QkFBSyxJQUFMLEdBQVksSUFBWjtBQUNBLHVCQUFLLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSx1QkFBSyxLQUFMLEdBQWEsSUFBYjtBQUNBLHVCQUFLLFdBQUwsQ0FBaUIsT0FBSyxPQUFMLENBQWEsRUFBOUI7QUFDSCxhQVZKLEVBVU0sVUFBVSxJQUFWLEVBQWdCO0FBQ2Ysd0JBQVEsR0FBUixDQUFZLG1CQUFtQixLQUFLLE1BQXBDO0FBQ0gsYUFaSixFQVlNLFVBQUMsR0FBRCxFQUFTO0FBQ1IsdUJBQUssUUFBTCxHQUFnQixTQUFTLFFBQVEsSUFBSSxNQUFaLEdBQXFCLElBQUksS0FBbEMsQ0FBaEI7QUFDSCxhQWRKO0FBZUE7OzswQ0FFaUIsTyxFQUFTO0FBQUE7O0FBQzFCLGlCQUFLLEdBQUwsQ0FBUyxPQUFULENBQWlCLE1BQWpCLENBQXdCLEVBQUMsSUFBRyxLQUFLLE9BQUwsQ0FBYSxFQUFqQixFQUF4QixFQUE4QyxFQUFDLGVBQWMsT0FBZixFQUE5QyxFQUF1RSxRQUF2RSxDQUNDLElBREQsQ0FDTSxVQUFDLFFBQUQsRUFBYztBQUNuQix1QkFBSyxXQUFMLENBQWlCLE9BQUssT0FBTCxDQUFhLEVBQTlCO0FBQ0EsYUFIRDtBQUlBOzs7c0NBRWEsTyxFQUFTO0FBQUE7O0FBQ3RCLGlCQUFLLEdBQUwsQ0FBUyxNQUFULENBQWdCLE1BQWhCLENBQXVCLEVBQUMsV0FBVSxLQUFLLE9BQUwsQ0FBYSxFQUF4QixFQUE0QixTQUFRLE9BQXBDLEVBQXZCLEVBQXFFLFFBQXJFLENBQ0MsSUFERCxDQUNNLFVBQUMsUUFBRCxFQUFjO0FBQ25CLHVCQUFLLFdBQUwsQ0FBaUIsT0FBSyxPQUFMLENBQWEsRUFBOUI7QUFDQSxhQUhEO0FBSUE7Ozs7OztrQkFoRGdCLHVCOzs7Ozs7Ozs7O0FDQXJCOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFHQTs7OztBQUNBOzs7O0FBQ0E7Ozs7OztrQkFFZSxrQkFBUSxNQUFSLENBQWUsYUFBZixFQUE4QixrRUFBOUIsRUFDYixNQURhLG1CQUViLFVBRmEsQ0FFRix1QkFGRSx5QkFHYixVQUhhLENBR0YseUJBSEUsMkJBSWIsVUFKYSxDQUlGLHlCQUpFLDJCQUtiLEk7Ozs7Ozs7Ozs7a0JDZHNCLE07QUFGeEIsT0FBTyxPQUFQLEdBQWlCLENBQUMsZ0JBQUQsQ0FBakI7O0FBRWUsU0FBUyxNQUFULENBQWdCLGNBQWhCLEVBQWdDO0FBQzlDLE1BQU0sdUJBQXVCO0FBQzVCLGNBQVUsSUFEa0I7QUFFNUIsVUFBTSxTQUZzQjtBQUc1QixTQUFLLFVBSHVCO0FBSTVCLGdCQUFZO0FBSmdCLEdBQTdCOztBQU9BLGlCQUFlLEtBQWYsQ0FBcUIsb0JBQXJCOztBQUVDLGlCQUFlLEtBQWYsQ0FBcUI7QUFDcEIsVUFBTSxjQURjO0FBRXBCLFlBQVEsb0JBRlk7QUFHcEIsU0FBSyxPQUhlO0FBSXBCLGNBQVUsUUFBUSwyQkFBUixDQUpVO0FBS3BCLGdCQUFZLHVCQUxRO0FBTXBCLGtCQUFjO0FBTk0sR0FBckI7O0FBU0QsaUJBQWUsS0FBZixDQUFxQjtBQUNuQixVQUFNLGdCQURhO0FBRW5CLFlBQVEsb0JBRlc7QUFHbkIsU0FBSyxTQUhjO0FBSW5CLGNBQVUsUUFBUSw2QkFBUixDQUpTO0FBS25CLGdCQUFZLHlCQUxPO0FBTW5CLGtCQUFjO0FBTkssR0FBckI7O0FBU0MsaUJBQWUsS0FBZixDQUFxQjtBQUNuQixVQUFNLGdCQURhO0FBRW5CLFlBQVEsb0JBRlc7QUFHbkIsU0FBSyxzQkFIYztBQUluQixjQUFVLFFBQVEsNkJBQVIsQ0FKUztBQUtuQixnQkFBWSx5QkFMTztBQU1uQixrQkFBYztBQU5LLEdBQXJCO0FBUUQ7OztBQ3RDRDtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTs7Ozs7Ozs7OztJQ0RxQixjLEdBRWpCLHdCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFDaEIsV0FBTyxPQUFQLEdBQWlCLGNBQWpCO0FBQ0gsQzs7a0JBSmdCLGM7Ozs7Ozs7Ozs7QUNBckI7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7OztrQkFFZSxrQkFBUSxNQUFSLENBQWUsVUFBZixFQUEyQiwyQkFBM0IsRUFDWixNQURZLG1CQUVaLFVBRlksQ0FFRCxnQkFGQyxrQkFHWixJOzs7Ozs7Ozs7O2tCQ1BxQixNO0FBRnhCLE9BQU8sT0FBUCxHQUFpQixDQUFDLGdCQUFELENBQWpCOztBQUVlLFNBQVMsTUFBVCxDQUFnQixjQUFoQixFQUFnQztBQUM3QyxpQkFDRyxLQURILENBQ1MsTUFEVCxFQUNpQjtBQUNiLFNBQUssR0FEUTtBQUViLGNBQVUsUUFBUSxtQkFBUixDQUZHO0FBR2IsZ0JBQVksZ0JBSEM7QUFJYixrQkFBYztBQUpELEdBRGpCO0FBT0Q7OztBQ1ZEO0FBQ0E7Ozs7Ozs7OztBQ0RBOzs7O0FBQ0E7Ozs7Ozs7O0lBRU0sRyxHQUVMLGFBQVksU0FBWixFQUF1QjtBQUFBOztBQUV0QixLQUFNLFlBQVksRUFBbEI7QUFDQSxLQUFNLE1BQU0sT0FBTyxPQUFuQjs7QUFHQSxXQUFVLE9BQVYsR0FBb0IsVUFBVSxNQUFNLGNBQWhCLEVBQWdDLElBQWhDLEVBQXNDO0FBQ25ELFlBQVUsRUFBRSxRQUFPLEtBQVQ7QUFEeUMsRUFBdEMsQ0FBcEI7O0FBSUEsV0FBVSxNQUFWLEdBQW1CLFVBQVUsTUFBTSxxQ0FBaEIsQ0FBbkI7O0FBRUEsUUFBTyxTQUFQO0FBQ0UsQzs7a0JBSVcsa0JBQVEsTUFBUixDQUFlLGNBQWYsRUFBK0IsMkJBQS9CLEVBQ1osT0FEWSxDQUNKLEtBREksRUFDRyxHQURILEVBRVosSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJKUyB2MS41LjhcbiAqIChjKSAyMDEwLTIwMTYgR29vZ2xlLCBJbmMuIGh0dHA6Ly9hbmd1bGFyanMub3JnXG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgYW5ndWxhcikgeyd1c2Ugc3RyaWN0JztcblxudmFyICRyZXNvdXJjZU1pbkVyciA9IGFuZ3VsYXIuJCRtaW5FcnIoJyRyZXNvdXJjZScpO1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25zIGFuZCByZWdleCB0byBsb29rdXAgYSBkb3R0ZWQgcGF0aCBvbiBhbiBvYmplY3Rcbi8vIHN0b3BwaW5nIGF0IHVuZGVmaW5lZC9udWxsLiAgVGhlIHBhdGggbXVzdCBiZSBjb21wb3NlZCBvZiBBU0NJSVxuLy8gaWRlbnRpZmllcnMgKGp1c3QgbGlrZSAkcGFyc2UpXG52YXIgTUVNQkVSX05BTUVfUkVHRVggPSAvXihcXC5bYS16QS1aXyRAXVswLTlhLXpBLVpfJEBdKikrJC87XG5cbmZ1bmN0aW9uIGlzVmFsaWREb3R0ZWRQYXRoKHBhdGgpIHtcbiAgcmV0dXJuIChwYXRoICE9IG51bGwgJiYgcGF0aCAhPT0gJycgJiYgcGF0aCAhPT0gJ2hhc093blByb3BlcnR5JyAmJlxuICAgICAgTUVNQkVSX05BTUVfUkVHRVgudGVzdCgnLicgKyBwYXRoKSk7XG59XG5cbmZ1bmN0aW9uIGxvb2t1cERvdHRlZFBhdGgob2JqLCBwYXRoKSB7XG4gIGlmICghaXNWYWxpZERvdHRlZFBhdGgocGF0aCkpIHtcbiAgICB0aHJvdyAkcmVzb3VyY2VNaW5FcnIoJ2JhZG1lbWJlcicsICdEb3R0ZWQgbWVtYmVyIHBhdGggXCJAezB9XCIgaXMgaW52YWxpZC4nLCBwYXRoKTtcbiAgfVxuICB2YXIga2V5cyA9IHBhdGguc3BsaXQoJy4nKTtcbiAgZm9yICh2YXIgaSA9IDAsIGlpID0ga2V5cy5sZW5ndGg7IGkgPCBpaSAmJiBhbmd1bGFyLmlzRGVmaW5lZChvYmopOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICBvYmogPSAob2JqICE9PSBudWxsKSA/IG9ialtrZXldIDogdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogQ3JlYXRlIGEgc2hhbGxvdyBjb3B5IG9mIGFuIG9iamVjdCBhbmQgY2xlYXIgb3RoZXIgZmllbGRzIGZyb20gdGhlIGRlc3RpbmF0aW9uXG4gKi9cbmZ1bmN0aW9uIHNoYWxsb3dDbGVhckFuZENvcHkoc3JjLCBkc3QpIHtcbiAgZHN0ID0gZHN0IHx8IHt9O1xuXG4gIGFuZ3VsYXIuZm9yRWFjaChkc3QsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICBkZWxldGUgZHN0W2tleV07XG4gIH0pO1xuXG4gIGZvciAodmFyIGtleSBpbiBzcmMpIHtcbiAgICBpZiAoc3JjLmhhc093blByb3BlcnR5KGtleSkgJiYgIShrZXkuY2hhckF0KDApID09PSAnJCcgJiYga2V5LmNoYXJBdCgxKSA9PT0gJyQnKSkge1xuICAgICAgZHN0W2tleV0gPSBzcmNba2V5XTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZHN0O1xufVxuXG4vKipcbiAqIEBuZ2RvYyBtb2R1bGVcbiAqIEBuYW1lIG5nUmVzb3VyY2VcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqICMgbmdSZXNvdXJjZVxuICpcbiAqIFRoZSBgbmdSZXNvdXJjZWAgbW9kdWxlIHByb3ZpZGVzIGludGVyYWN0aW9uIHN1cHBvcnQgd2l0aCBSRVNUZnVsIHNlcnZpY2VzXG4gKiB2aWEgdGhlICRyZXNvdXJjZSBzZXJ2aWNlLlxuICpcbiAqXG4gKiA8ZGl2IGRvYy1tb2R1bGUtY29tcG9uZW50cz1cIm5nUmVzb3VyY2VcIj48L2Rpdj5cbiAqXG4gKiBTZWUge0BsaW5rIG5nUmVzb3VyY2UuJHJlc291cmNlUHJvdmlkZXJ9IGFuZCB7QGxpbmsgbmdSZXNvdXJjZS4kcmVzb3VyY2V9IGZvciB1c2FnZS5cbiAqL1xuXG4vKipcbiAqIEBuZ2RvYyBwcm92aWRlclxuICogQG5hbWUgJHJlc291cmNlUHJvdmlkZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBVc2UgYCRyZXNvdXJjZVByb3ZpZGVyYCB0byBjaGFuZ2UgdGhlIGRlZmF1bHQgYmVoYXZpb3Igb2YgdGhlIHtAbGluayBuZ1Jlc291cmNlLiRyZXNvdXJjZX1cbiAqIHNlcnZpY2UuXG4gKlxuICogIyMgRGVwZW5kZW5jaWVzXG4gKiBSZXF1aXJlcyB0aGUge0BsaW5rIG5nUmVzb3VyY2UgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxuICpcbiAqL1xuXG4vKipcbiAqIEBuZ2RvYyBzZXJ2aWNlXG4gKiBAbmFtZSAkcmVzb3VyY2VcbiAqIEByZXF1aXJlcyAkaHR0cFxuICogQHJlcXVpcmVzIG5nLiRsb2dcbiAqIEByZXF1aXJlcyAkcVxuICogQHJlcXVpcmVzIG5nLiR0aW1lb3V0XG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIGZhY3Rvcnkgd2hpY2ggY3JlYXRlcyBhIHJlc291cmNlIG9iamVjdCB0aGF0IGxldHMgeW91IGludGVyYWN0IHdpdGhcbiAqIFtSRVNUZnVsXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1JlcHJlc2VudGF0aW9uYWxfU3RhdGVfVHJhbnNmZXIpIHNlcnZlci1zaWRlIGRhdGEgc291cmNlcy5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgcmVzb3VyY2Ugb2JqZWN0IGhhcyBhY3Rpb24gbWV0aG9kcyB3aGljaCBwcm92aWRlIGhpZ2gtbGV2ZWwgYmVoYXZpb3JzIHdpdGhvdXRcbiAqIHRoZSBuZWVkIHRvIGludGVyYWN0IHdpdGggdGhlIGxvdyBsZXZlbCB7QGxpbmsgbmcuJGh0dHAgJGh0dHB9IHNlcnZpY2UuXG4gKlxuICogUmVxdWlyZXMgdGhlIHtAbGluayBuZ1Jlc291cmNlIGBuZ1Jlc291cmNlYH0gbW9kdWxlIHRvIGJlIGluc3RhbGxlZC5cbiAqXG4gKiBCeSBkZWZhdWx0LCB0cmFpbGluZyBzbGFzaGVzIHdpbGwgYmUgc3RyaXBwZWQgZnJvbSB0aGUgY2FsY3VsYXRlZCBVUkxzLFxuICogd2hpY2ggY2FuIHBvc2UgcHJvYmxlbXMgd2l0aCBzZXJ2ZXIgYmFja2VuZHMgdGhhdCBkbyBub3QgZXhwZWN0IHRoYXRcbiAqIGJlaGF2aW9yLiAgVGhpcyBjYW4gYmUgZGlzYWJsZWQgYnkgY29uZmlndXJpbmcgdGhlIGAkcmVzb3VyY2VQcm92aWRlcmAgbGlrZVxuICogdGhpczpcbiAqXG4gKiBgYGBqc1xuICAgICBhcHAuY29uZmlnKFsnJHJlc291cmNlUHJvdmlkZXInLCBmdW5jdGlvbigkcmVzb3VyY2VQcm92aWRlcikge1xuICAgICAgIC8vIERvbid0IHN0cmlwIHRyYWlsaW5nIHNsYXNoZXMgZnJvbSBjYWxjdWxhdGVkIFVSTHNcbiAgICAgICAkcmVzb3VyY2VQcm92aWRlci5kZWZhdWx0cy5zdHJpcFRyYWlsaW5nU2xhc2hlcyA9IGZhbHNlO1xuICAgICB9XSk7XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsIEEgcGFyYW1ldGVyaXplZCBVUkwgdGVtcGxhdGUgd2l0aCBwYXJhbWV0ZXJzIHByZWZpeGVkIGJ5IGA6YCBhcyBpblxuICogICBgL3VzZXIvOnVzZXJuYW1lYC4gSWYgeW91IGFyZSB1c2luZyBhIFVSTCB3aXRoIGEgcG9ydCBudW1iZXIgKGUuZy5cbiAqICAgYGh0dHA6Ly9leGFtcGxlLmNvbTo4MDgwL2FwaWApLCBpdCB3aWxsIGJlIHJlc3BlY3RlZC5cbiAqXG4gKiAgIElmIHlvdSBhcmUgdXNpbmcgYSB1cmwgd2l0aCBhIHN1ZmZpeCwganVzdCBhZGQgdGhlIHN1ZmZpeCwgbGlrZSB0aGlzOlxuICogICBgJHJlc291cmNlKCdodHRwOi8vZXhhbXBsZS5jb20vcmVzb3VyY2UuanNvbicpYCBvciBgJHJlc291cmNlKCdodHRwOi8vZXhhbXBsZS5jb20vOmlkLmpzb24nKWBcbiAqICAgb3IgZXZlbiBgJHJlc291cmNlKCdodHRwOi8vZXhhbXBsZS5jb20vcmVzb3VyY2UvOnJlc291cmNlX2lkLjpmb3JtYXQnKWBcbiAqICAgSWYgdGhlIHBhcmFtZXRlciBiZWZvcmUgdGhlIHN1ZmZpeCBpcyBlbXB0eSwgOnJlc291cmNlX2lkIGluIHRoaXMgY2FzZSwgdGhlbiB0aGUgYC8uYCB3aWxsIGJlXG4gKiAgIGNvbGxhcHNlZCBkb3duIHRvIGEgc2luZ2xlIGAuYC4gIElmIHlvdSBuZWVkIHRoaXMgc2VxdWVuY2UgdG8gYXBwZWFyIGFuZCBub3QgY29sbGFwc2UgdGhlbiB5b3VcbiAqICAgY2FuIGVzY2FwZSBpdCB3aXRoIGAvXFwuYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdD19IHBhcmFtRGVmYXVsdHMgRGVmYXVsdCB2YWx1ZXMgZm9yIGB1cmxgIHBhcmFtZXRlcnMuIFRoZXNlIGNhbiBiZSBvdmVycmlkZGVuIGluXG4gKiAgIGBhY3Rpb25zYCBtZXRob2RzLiBJZiBhIHBhcmFtZXRlciB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCBldmVyeSB0aW1lXG4gKiAgIGEgcGFyYW0gdmFsdWUgbmVlZHMgdG8gYmUgb2J0YWluZWQgZm9yIGEgcmVxdWVzdCAodW5sZXNzIHRoZSBwYXJhbSB3YXMgb3ZlcnJpZGRlbikuIFRoZSBmdW5jdGlvblxuICogICB3aWxsIGJlIHBhc3NlZCB0aGUgY3VycmVudCBkYXRhIHZhbHVlIGFzIGFuIGFyZ3VtZW50LlxuICpcbiAqICAgRWFjaCBrZXkgdmFsdWUgaW4gdGhlIHBhcmFtZXRlciBvYmplY3QgaXMgZmlyc3QgYm91bmQgdG8gdXJsIHRlbXBsYXRlIGlmIHByZXNlbnQgYW5kIHRoZW4gYW55XG4gKiAgIGV4Y2VzcyBrZXlzIGFyZSBhcHBlbmRlZCB0byB0aGUgdXJsIHNlYXJjaCBxdWVyeSBhZnRlciB0aGUgYD9gLlxuICpcbiAqICAgR2l2ZW4gYSB0ZW1wbGF0ZSBgL3BhdGgvOnZlcmJgIGFuZCBwYXJhbWV0ZXIgYHt2ZXJiOidncmVldCcsIHNhbHV0YXRpb246J0hlbGxvJ31gIHJlc3VsdHMgaW5cbiAqICAgVVJMIGAvcGF0aC9ncmVldD9zYWx1dGF0aW9uPUhlbGxvYC5cbiAqXG4gKiAgIElmIHRoZSBwYXJhbWV0ZXIgdmFsdWUgaXMgcHJlZml4ZWQgd2l0aCBgQGAsIHRoZW4gdGhlIHZhbHVlIGZvciB0aGF0IHBhcmFtZXRlciB3aWxsIGJlXG4gKiAgIGV4dHJhY3RlZCBmcm9tIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IG9uIHRoZSBgZGF0YWAgb2JqZWN0IChwcm92aWRlZCB3aGVuIGNhbGxpbmcgYVxuICogICBcIm5vbi1HRVRcIiBhY3Rpb24gbWV0aG9kKS5cbiAqICAgRm9yIGV4YW1wbGUsIGlmIHRoZSBgZGVmYXVsdFBhcmFtYCBvYmplY3QgaXMgYHtzb21lUGFyYW06ICdAc29tZVByb3AnfWAgdGhlbiB0aGUgdmFsdWUgb2ZcbiAqICAgYHNvbWVQYXJhbWAgd2lsbCBiZSBgZGF0YS5zb21lUHJvcGAuXG4gKiAgIE5vdGUgdGhhdCB0aGUgcGFyYW1ldGVyIHdpbGwgYmUgaWdub3JlZCwgd2hlbiBjYWxsaW5nIGEgXCJHRVRcIiBhY3Rpb24gbWV0aG9kIChpLmUuIGFuIGFjdGlvblxuICogICBtZXRob2QgdGhhdCBkb2VzIG5vdCBhY2NlcHQgYSByZXF1ZXN0IGJvZHkpXG4gKlxuICogQHBhcmFtIHtPYmplY3QuPE9iamVjdD49fSBhY3Rpb25zIEhhc2ggd2l0aCBkZWNsYXJhdGlvbiBvZiBjdXN0b20gYWN0aW9ucyB0aGF0IHNob3VsZCBleHRlbmRcbiAqICAgdGhlIGRlZmF1bHQgc2V0IG9mIHJlc291cmNlIGFjdGlvbnMuIFRoZSBkZWNsYXJhdGlvbiBzaG91bGQgYmUgY3JlYXRlZCBpbiB0aGUgZm9ybWF0IG9mIHtAbGlua1xuICogICBuZy4kaHR0cCN1c2FnZSAkaHR0cC5jb25maWd9OlxuICpcbiAqICAgICAgIHthY3Rpb24xOiB7bWV0aG9kOj8sIHBhcmFtczo/LCBpc0FycmF5Oj8sIGhlYWRlcnM6PywgLi4ufSxcbiAqICAgICAgICBhY3Rpb24yOiB7bWV0aG9kOj8sIHBhcmFtczo/LCBpc0FycmF5Oj8sIGhlYWRlcnM6PywgLi4ufSxcbiAqICAgICAgICAuLi59XG4gKlxuICogICBXaGVyZTpcbiAqXG4gKiAgIC0gKipgYWN0aW9uYCoqIOKAkyB7c3RyaW5nfSDigJMgVGhlIG5hbWUgb2YgYWN0aW9uLiBUaGlzIG5hbWUgYmVjb21lcyB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kIG9uXG4gKiAgICAgeW91ciByZXNvdXJjZSBvYmplY3QuXG4gKiAgIC0gKipgbWV0aG9kYCoqIOKAkyB7c3RyaW5nfSDigJMgQ2FzZSBpbnNlbnNpdGl2ZSBIVFRQIG1ldGhvZCAoZS5nLiBgR0VUYCwgYFBPU1RgLCBgUFVUYCxcbiAqICAgICBgREVMRVRFYCwgYEpTT05QYCwgZXRjKS5cbiAqICAgLSAqKmBwYXJhbXNgKiog4oCTIHtPYmplY3Q9fSDigJMgT3B0aW9uYWwgc2V0IG9mIHByZS1ib3VuZCBwYXJhbWV0ZXJzIGZvciB0aGlzIGFjdGlvbi4gSWYgYW55IG9mXG4gKiAgICAgdGhlIHBhcmFtZXRlciB2YWx1ZSBpcyBhIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCBldmVyeSB0aW1lIHdoZW4gYSBwYXJhbSB2YWx1ZSBuZWVkcyB0b1xuICogICAgIGJlIG9idGFpbmVkIGZvciBhIHJlcXVlc3QgKHVubGVzcyB0aGUgcGFyYW0gd2FzIG92ZXJyaWRkZW4pLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBwYXNzZWQgdGhlXG4gKiAgICAgY3VycmVudCBkYXRhIHZhbHVlIGFzIGFuIGFyZ3VtZW50LlxuICogICAtICoqYHVybGAqKiDigJMge3N0cmluZ30g4oCTIGFjdGlvbiBzcGVjaWZpYyBgdXJsYCBvdmVycmlkZS4gVGhlIHVybCB0ZW1wbGF0aW5nIGlzIHN1cHBvcnRlZCBqdXN0XG4gKiAgICAgbGlrZSBmb3IgdGhlIHJlc291cmNlLWxldmVsIHVybHMuXG4gKiAgIC0gKipgaXNBcnJheWAqKiDigJMge2Jvb2xlYW49fSDigJMgSWYgdHJ1ZSB0aGVuIHRoZSByZXR1cm5lZCBvYmplY3QgZm9yIHRoaXMgYWN0aW9uIGlzIGFuIGFycmF5LFxuICogICAgIHNlZSBgcmV0dXJuc2Agc2VjdGlvbi5cbiAqICAgLSAqKmB0cmFuc2Zvcm1SZXF1ZXN0YCoqIOKAk1xuICogICAgIGB7ZnVuY3Rpb24oZGF0YSwgaGVhZGVyc0dldHRlcil8QXJyYXkuPGZ1bmN0aW9uKGRhdGEsIGhlYWRlcnNHZXR0ZXIpPn1gIOKAk1xuICogICAgIHRyYW5zZm9ybSBmdW5jdGlvbiBvciBhbiBhcnJheSBvZiBzdWNoIGZ1bmN0aW9ucy4gVGhlIHRyYW5zZm9ybSBmdW5jdGlvbiB0YWtlcyB0aGUgaHR0cFxuICogICAgIHJlcXVlc3QgYm9keSBhbmQgaGVhZGVycyBhbmQgcmV0dXJucyBpdHMgdHJhbnNmb3JtZWQgKHR5cGljYWxseSBzZXJpYWxpemVkKSB2ZXJzaW9uLlxuICogICAgIEJ5IGRlZmF1bHQsIHRyYW5zZm9ybVJlcXVlc3Qgd2lsbCBjb250YWluIG9uZSBmdW5jdGlvbiB0aGF0IGNoZWNrcyBpZiB0aGUgcmVxdWVzdCBkYXRhIGlzXG4gKiAgICAgYW4gb2JqZWN0IGFuZCBzZXJpYWxpemVzIHRvIHVzaW5nIGBhbmd1bGFyLnRvSnNvbmAuIFRvIHByZXZlbnQgdGhpcyBiZWhhdmlvciwgc2V0XG4gKiAgICAgYHRyYW5zZm9ybVJlcXVlc3RgIHRvIGFuIGVtcHR5IGFycmF5OiBgdHJhbnNmb3JtUmVxdWVzdDogW11gXG4gKiAgIC0gKipgdHJhbnNmb3JtUmVzcG9uc2VgKiog4oCTXG4gKiAgICAgYHtmdW5jdGlvbihkYXRhLCBoZWFkZXJzR2V0dGVyKXxBcnJheS48ZnVuY3Rpb24oZGF0YSwgaGVhZGVyc0dldHRlcik+fWAg4oCTXG4gKiAgICAgdHJhbnNmb3JtIGZ1bmN0aW9uIG9yIGFuIGFycmF5IG9mIHN1Y2ggZnVuY3Rpb25zLiBUaGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHRha2VzIHRoZSBodHRwXG4gKiAgICAgcmVzcG9uc2UgYm9keSBhbmQgaGVhZGVycyBhbmQgcmV0dXJucyBpdHMgdHJhbnNmb3JtZWQgKHR5cGljYWxseSBkZXNlcmlhbGl6ZWQpIHZlcnNpb24uXG4gKiAgICAgQnkgZGVmYXVsdCwgdHJhbnNmb3JtUmVzcG9uc2Ugd2lsbCBjb250YWluIG9uZSBmdW5jdGlvbiB0aGF0IGNoZWNrcyBpZiB0aGUgcmVzcG9uc2UgbG9va3NcbiAqICAgICBsaWtlIGEgSlNPTiBzdHJpbmcgYW5kIGRlc2VyaWFsaXplcyBpdCB1c2luZyBgYW5ndWxhci5mcm9tSnNvbmAuIFRvIHByZXZlbnQgdGhpcyBiZWhhdmlvcixcbiAqICAgICBzZXQgYHRyYW5zZm9ybVJlc3BvbnNlYCB0byBhbiBlbXB0eSBhcnJheTogYHRyYW5zZm9ybVJlc3BvbnNlOiBbXWBcbiAqICAgLSAqKmBjYWNoZWAqKiDigJMgYHtib29sZWFufENhY2hlfWAg4oCTIElmIHRydWUsIGEgZGVmYXVsdCAkaHR0cCBjYWNoZSB3aWxsIGJlIHVzZWQgdG8gY2FjaGUgdGhlXG4gKiAgICAgR0VUIHJlcXVlc3QsIG90aGVyd2lzZSBpZiBhIGNhY2hlIGluc3RhbmNlIGJ1aWx0IHdpdGhcbiAqICAgICB7QGxpbmsgbmcuJGNhY2hlRmFjdG9yeSAkY2FjaGVGYWN0b3J5fSwgdGhpcyBjYWNoZSB3aWxsIGJlIHVzZWQgZm9yXG4gKiAgICAgY2FjaGluZy5cbiAqICAgLSAqKmB0aW1lb3V0YCoqIOKAkyBge251bWJlcn1gIOKAkyB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcy48YnIgLz5cbiAqICAgICAqKk5vdGU6KiogSW4gY29udHJhc3QgdG8ge0BsaW5rIG5nLiRodHRwI3VzYWdlICRodHRwLmNvbmZpZ30sIHtAbGluayBuZy4kcSBwcm9taXNlc30gYXJlXG4gKiAgICAgKipub3QqKiBzdXBwb3J0ZWQgaW4gJHJlc291cmNlLCBiZWNhdXNlIHRoZSBzYW1lIHZhbHVlIHdvdWxkIGJlIHVzZWQgZm9yIG11bHRpcGxlIHJlcXVlc3RzLlxuICogICAgIElmIHlvdSBhcmUgbG9va2luZyBmb3IgYSB3YXkgdG8gY2FuY2VsIHJlcXVlc3RzLCB5b3Ugc2hvdWxkIHVzZSB0aGUgYGNhbmNlbGxhYmxlYCBvcHRpb24uXG4gKiAgIC0gKipgY2FuY2VsbGFibGVgKiog4oCTIGB7Ym9vbGVhbn1gIOKAkyBpZiBzZXQgdG8gdHJ1ZSwgdGhlIHJlcXVlc3QgbWFkZSBieSBhIFwibm9uLWluc3RhbmNlXCIgY2FsbFxuICogICAgIHdpbGwgYmUgY2FuY2VsbGVkIChpZiBub3QgYWxyZWFkeSBjb21wbGV0ZWQpIGJ5IGNhbGxpbmcgYCRjYW5jZWxSZXF1ZXN0KClgIG9uIHRoZSBjYWxsJ3NcbiAqICAgICByZXR1cm4gdmFsdWUuIENhbGxpbmcgYCRjYW5jZWxSZXF1ZXN0KClgIGZvciBhIG5vbi1jYW5jZWxsYWJsZSBvciBhbiBhbHJlYWR5XG4gKiAgICAgY29tcGxldGVkL2NhbmNlbGxlZCByZXF1ZXN0IHdpbGwgaGF2ZSBubyBlZmZlY3QuPGJyIC8+XG4gKiAgIC0gKipgd2l0aENyZWRlbnRpYWxzYCoqIC0gYHtib29sZWFufWAgLSB3aGV0aGVyIHRvIHNldCB0aGUgYHdpdGhDcmVkZW50aWFsc2AgZmxhZyBvbiB0aGVcbiAqICAgICBYSFIgb2JqZWN0LiBTZWVcbiAqICAgICBbcmVxdWVzdHMgd2l0aCBjcmVkZW50aWFsc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vaHR0cF9hY2Nlc3NfY29udHJvbCNzZWN0aW9uXzUpXG4gKiAgICAgZm9yIG1vcmUgaW5mb3JtYXRpb24uXG4gKiAgIC0gKipgcmVzcG9uc2VUeXBlYCoqIC0gYHtzdHJpbmd9YCAtIHNlZVxuICogICAgIFtyZXF1ZXN0VHlwZV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9ET00vWE1MSHR0cFJlcXVlc3QjcmVzcG9uc2VUeXBlKS5cbiAqICAgLSAqKmBpbnRlcmNlcHRvcmAqKiAtIGB7T2JqZWN0PX1gIC0gVGhlIGludGVyY2VwdG9yIG9iamVjdCBoYXMgdHdvIG9wdGlvbmFsIG1ldGhvZHMgLVxuICogICAgIGByZXNwb25zZWAgYW5kIGByZXNwb25zZUVycm9yYC4gQm90aCBgcmVzcG9uc2VgIGFuZCBgcmVzcG9uc2VFcnJvcmAgaW50ZXJjZXB0b3JzIGdldCBjYWxsZWRcbiAqICAgICB3aXRoIGBodHRwIHJlc3BvbnNlYCBvYmplY3QuIFNlZSB7QGxpbmsgbmcuJGh0dHAgJGh0dHAgaW50ZXJjZXB0b3JzfS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBIYXNoIHdpdGggY3VzdG9tIHNldHRpbmdzIHRoYXQgc2hvdWxkIGV4dGVuZCB0aGVcbiAqICAgZGVmYXVsdCBgJHJlc291cmNlUHJvdmlkZXJgIGJlaGF2aW9yLiAgVGhlIHN1cHBvcnRlZCBvcHRpb25zIGFyZTpcbiAqXG4gKiAgIC0gKipgc3RyaXBUcmFpbGluZ1NsYXNoZXNgKiog4oCTIHtib29sZWFufSDigJMgSWYgdHJ1ZSB0aGVuIHRoZSB0cmFpbGluZ1xuICogICBzbGFzaGVzIGZyb20gYW55IGNhbGN1bGF0ZWQgVVJMIHdpbGwgYmUgc3RyaXBwZWQuIChEZWZhdWx0cyB0byB0cnVlLilcbiAqICAgLSAqKmBjYW5jZWxsYWJsZWAqKiDigJMge2Jvb2xlYW59IOKAkyBJZiB0cnVlLCB0aGUgcmVxdWVzdCBtYWRlIGJ5IGEgXCJub24taW5zdGFuY2VcIiBjYWxsIHdpbGwgYmVcbiAqICAgY2FuY2VsbGVkIChpZiBub3QgYWxyZWFkeSBjb21wbGV0ZWQpIGJ5IGNhbGxpbmcgYCRjYW5jZWxSZXF1ZXN0KClgIG9uIHRoZSBjYWxsJ3MgcmV0dXJuIHZhbHVlLlxuICogICBUaGlzIGNhbiBiZSBvdmVyd3JpdHRlbiBwZXIgYWN0aW9uLiAoRGVmYXVsdHMgdG8gZmFsc2UuKVxuICpcbiAqIEByZXR1cm5zIHtPYmplY3R9IEEgcmVzb3VyY2UgXCJjbGFzc1wiIG9iamVjdCB3aXRoIG1ldGhvZHMgZm9yIHRoZSBkZWZhdWx0IHNldCBvZiByZXNvdXJjZSBhY3Rpb25zXG4gKiAgIG9wdGlvbmFsbHkgZXh0ZW5kZWQgd2l0aCBjdXN0b20gYGFjdGlvbnNgLiBUaGUgZGVmYXVsdCBzZXQgY29udGFpbnMgdGhlc2UgYWN0aW9uczpcbiAqICAgYGBganNcbiAqICAgeyAnZ2V0JzogICAge21ldGhvZDonR0VUJ30sXG4gKiAgICAgJ3NhdmUnOiAgIHttZXRob2Q6J1BPU1QnfSxcbiAqICAgICAncXVlcnknOiAge21ldGhvZDonR0VUJywgaXNBcnJheTp0cnVlfSxcbiAqICAgICAncmVtb3ZlJzoge21ldGhvZDonREVMRVRFJ30sXG4gKiAgICAgJ2RlbGV0ZSc6IHttZXRob2Q6J0RFTEVURSd9IH07XG4gKiAgIGBgYFxuICpcbiAqICAgQ2FsbGluZyB0aGVzZSBtZXRob2RzIGludm9rZSBhbiB7QGxpbmsgbmcuJGh0dHB9IHdpdGggdGhlIHNwZWNpZmllZCBodHRwIG1ldGhvZCxcbiAqICAgZGVzdGluYXRpb24gYW5kIHBhcmFtZXRlcnMuIFdoZW4gdGhlIGRhdGEgaXMgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmVyIHRoZW4gdGhlIG9iamVjdCBpcyBhblxuICogICBpbnN0YW5jZSBvZiB0aGUgcmVzb3VyY2UgY2xhc3MuIFRoZSBhY3Rpb25zIGBzYXZlYCwgYHJlbW92ZWAgYW5kIGBkZWxldGVgIGFyZSBhdmFpbGFibGUgb24gaXRcbiAqICAgYXMgIG1ldGhvZHMgd2l0aCB0aGUgYCRgIHByZWZpeC4gVGhpcyBhbGxvd3MgeW91IHRvIGVhc2lseSBwZXJmb3JtIENSVUQgb3BlcmF0aW9ucyAoY3JlYXRlLFxuICogICByZWFkLCB1cGRhdGUsIGRlbGV0ZSkgb24gc2VydmVyLXNpZGUgZGF0YSBsaWtlIHRoaXM6XG4gKiAgIGBgYGpzXG4gKiAgIHZhciBVc2VyID0gJHJlc291cmNlKCcvdXNlci86dXNlcklkJywge3VzZXJJZDonQGlkJ30pO1xuICogICB2YXIgdXNlciA9IFVzZXIuZ2V0KHt1c2VySWQ6MTIzfSwgZnVuY3Rpb24oKSB7XG4gKiAgICAgdXNlci5hYmMgPSB0cnVlO1xuICogICAgIHVzZXIuJHNhdmUoKTtcbiAqICAgfSk7XG4gKiAgIGBgYFxuICpcbiAqICAgSXQgaXMgaW1wb3J0YW50IHRvIHJlYWxpemUgdGhhdCBpbnZva2luZyBhICRyZXNvdXJjZSBvYmplY3QgbWV0aG9kIGltbWVkaWF0ZWx5IHJldHVybnMgYW5cbiAqICAgZW1wdHkgcmVmZXJlbmNlIChvYmplY3Qgb3IgYXJyYXkgZGVwZW5kaW5nIG9uIGBpc0FycmF5YCkuIE9uY2UgdGhlIGRhdGEgaXMgcmV0dXJuZWQgZnJvbSB0aGVcbiAqICAgc2VydmVyIHRoZSBleGlzdGluZyByZWZlcmVuY2UgaXMgcG9wdWxhdGVkIHdpdGggdGhlIGFjdHVhbCBkYXRhLiBUaGlzIGlzIGEgdXNlZnVsIHRyaWNrIHNpbmNlXG4gKiAgIHVzdWFsbHkgdGhlIHJlc291cmNlIGlzIGFzc2lnbmVkIHRvIGEgbW9kZWwgd2hpY2ggaXMgdGhlbiByZW5kZXJlZCBieSB0aGUgdmlldy4gSGF2aW5nIGFuIGVtcHR5XG4gKiAgIG9iamVjdCByZXN1bHRzIGluIG5vIHJlbmRlcmluZywgb25jZSB0aGUgZGF0YSBhcnJpdmVzIGZyb20gdGhlIHNlcnZlciB0aGVuIHRoZSBvYmplY3QgaXNcbiAqICAgcG9wdWxhdGVkIHdpdGggdGhlIGRhdGEgYW5kIHRoZSB2aWV3IGF1dG9tYXRpY2FsbHkgcmUtcmVuZGVycyBpdHNlbGYgc2hvd2luZyB0aGUgbmV3IGRhdGEuIFRoaXNcbiAqICAgbWVhbnMgdGhhdCBpbiBtb3N0IGNhc2VzIG9uZSBuZXZlciBoYXMgdG8gd3JpdGUgYSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgdGhlIGFjdGlvbiBtZXRob2RzLlxuICpcbiAqICAgVGhlIGFjdGlvbiBtZXRob2RzIG9uIHRoZSBjbGFzcyBvYmplY3Qgb3IgaW5zdGFuY2Ugb2JqZWN0IGNhbiBiZSBpbnZva2VkIHdpdGggdGhlIGZvbGxvd2luZ1xuICogICBwYXJhbWV0ZXJzOlxuICpcbiAqICAgLSBIVFRQIEdFVCBcImNsYXNzXCIgYWN0aW9uczogYFJlc291cmNlLmFjdGlvbihbcGFyYW1ldGVyc10sIFtzdWNjZXNzXSwgW2Vycm9yXSlgXG4gKiAgIC0gbm9uLUdFVCBcImNsYXNzXCIgYWN0aW9uczogYFJlc291cmNlLmFjdGlvbihbcGFyYW1ldGVyc10sIHBvc3REYXRhLCBbc3VjY2Vzc10sIFtlcnJvcl0pYFxuICogICAtIG5vbi1HRVQgaW5zdGFuY2UgYWN0aW9uczogIGBpbnN0YW5jZS4kYWN0aW9uKFtwYXJhbWV0ZXJzXSwgW3N1Y2Nlc3NdLCBbZXJyb3JdKWBcbiAqXG4gKlxuICogICBTdWNjZXNzIGNhbGxiYWNrIGlzIGNhbGxlZCB3aXRoICh2YWx1ZSwgcmVzcG9uc2VIZWFkZXJzKSBhcmd1bWVudHMsIHdoZXJlIHRoZSB2YWx1ZSBpc1xuICogICB0aGUgcG9wdWxhdGVkIHJlc291cmNlIGluc3RhbmNlIG9yIGNvbGxlY3Rpb24gb2JqZWN0LiBUaGUgZXJyb3IgY2FsbGJhY2sgaXMgY2FsbGVkXG4gKiAgIHdpdGggKGh0dHBSZXNwb25zZSkgYXJndW1lbnQuXG4gKlxuICogICBDbGFzcyBhY3Rpb25zIHJldHVybiBlbXB0eSBpbnN0YW5jZSAod2l0aCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYmVsb3cpLlxuICogICBJbnN0YW5jZSBhY3Rpb25zIHJldHVybiBwcm9taXNlIG9mIHRoZSBhY3Rpb24uXG4gKlxuICogICBUaGUgUmVzb3VyY2UgaW5zdGFuY2VzIGFuZCBjb2xsZWN0aW9ucyBoYXZlIHRoZXNlIGFkZGl0aW9uYWwgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYCRwcm9taXNlYDogdGhlIHtAbGluayBuZy4kcSBwcm9taXNlfSBvZiB0aGUgb3JpZ2luYWwgc2VydmVyIGludGVyYWN0aW9uIHRoYXQgY3JlYXRlZCB0aGlzXG4gKiAgICAgaW5zdGFuY2Ugb3IgY29sbGVjdGlvbi5cbiAqXG4gKiAgICAgT24gc3VjY2VzcywgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgc2FtZSByZXNvdXJjZSBpbnN0YW5jZSBvciBjb2xsZWN0aW9uIG9iamVjdCxcbiAqICAgICB1cGRhdGVkIHdpdGggZGF0YSBmcm9tIHNlcnZlci4gVGhpcyBtYWtlcyBpdCBlYXN5IHRvIHVzZSBpblxuICogICAgIHtAbGluayBuZ1JvdXRlLiRyb3V0ZVByb3ZpZGVyIHJlc29sdmUgc2VjdGlvbiBvZiAkcm91dGVQcm92aWRlci53aGVuKCl9IHRvIGRlZmVyIHZpZXdcbiAqICAgICByZW5kZXJpbmcgdW50aWwgdGhlIHJlc291cmNlKHMpIGFyZSBsb2FkZWQuXG4gKlxuICogICAgIE9uIGZhaWx1cmUsIHRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdpdGggdGhlIHtAbGluayBuZy4kaHR0cCBodHRwIHJlc3BvbnNlfSBvYmplY3QsIHdpdGhvdXRcbiAqICAgICB0aGUgYHJlc291cmNlYCBwcm9wZXJ0eS5cbiAqXG4gKiAgICAgSWYgYW4gaW50ZXJjZXB0b3Igb2JqZWN0IHdhcyBwcm92aWRlZCwgdGhlIHByb21pc2Ugd2lsbCBpbnN0ZWFkIGJlIHJlc29sdmVkIHdpdGggdGhlIHZhbHVlXG4gKiAgICAgcmV0dXJuZWQgYnkgdGhlIGludGVyY2VwdG9yLlxuICpcbiAqICAgLSBgJHJlc29sdmVkYDogYHRydWVgIGFmdGVyIGZpcnN0IHNlcnZlciBpbnRlcmFjdGlvbiBpcyBjb21wbGV0ZWQgKGVpdGhlciB3aXRoIHN1Y2Nlc3Mgb3JcbiAqICAgICAgcmVqZWN0aW9uKSwgYGZhbHNlYCBiZWZvcmUgdGhhdC4gS25vd2luZyBpZiB0aGUgUmVzb3VyY2UgaGFzIGJlZW4gcmVzb2x2ZWQgaXMgdXNlZnVsIGluXG4gKiAgICAgIGRhdGEtYmluZGluZy5cbiAqXG4gKiAgIFRoZSBSZXNvdXJjZSBpbnN0YW5jZXMgYW5kIGNvbGxlY3Rpb25zIGhhdmUgdGhlc2UgYWRkaXRpb25hbCBtZXRob2RzOlxuICpcbiAqICAgLSBgJGNhbmNlbFJlcXVlc3RgOiBJZiB0aGVyZSBpcyBhIGNhbmNlbGxhYmxlLCBwZW5kaW5nIHJlcXVlc3QgcmVsYXRlZCB0byB0aGUgaW5zdGFuY2Ugb3JcbiAqICAgICAgY29sbGVjdGlvbiwgY2FsbGluZyB0aGlzIG1ldGhvZCB3aWxsIGFib3J0IHRoZSByZXF1ZXN0LlxuICpcbiAqICAgVGhlIFJlc291cmNlIGluc3RhbmNlcyBoYXZlIHRoZXNlIGFkZGl0aW9uYWwgbWV0aG9kczpcbiAqXG4gKiAgIC0gYHRvSlNPTmA6IEl0IHJldHVybnMgYSBzaW1wbGUgb2JqZWN0IHdpdGhvdXQgYW55IG9mIHRoZSBleHRyYSBwcm9wZXJ0aWVzIGFkZGVkIGFzIHBhcnQgb2ZcbiAqICAgICB0aGUgUmVzb3VyY2UgQVBJLiBUaGlzIG9iamVjdCBjYW4gYmUgc2VyaWFsaXplZCB0aHJvdWdoIHtAbGluayBhbmd1bGFyLnRvSnNvbn0gc2FmZWx5XG4gKiAgICAgd2l0aG91dCBhdHRhY2hpbmcgQW5ndWxhci1zcGVjaWZpYyBmaWVsZHMuIE5vdGljZSB0aGF0IGBKU09OLnN0cmluZ2lmeWAgKGFuZFxuICogICAgIGBhbmd1bGFyLnRvSnNvbmApIGF1dG9tYXRpY2FsbHkgdXNlIHRoaXMgbWV0aG9kIHdoZW4gc2VyaWFsaXppbmcgYSBSZXNvdXJjZSBpbnN0YW5jZVxuICogICAgIChzZWUgW01ETl0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnkjdG9KU09OKClfYmVoYXZpb3IpKS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICMgQ3JlZGl0IGNhcmQgcmVzb3VyY2VcbiAqXG4gKiBgYGBqc1xuICAgICAvLyBEZWZpbmUgQ3JlZGl0Q2FyZCBjbGFzc1xuICAgICB2YXIgQ3JlZGl0Q2FyZCA9ICRyZXNvdXJjZSgnL3VzZXIvOnVzZXJJZC9jYXJkLzpjYXJkSWQnLFxuICAgICAge3VzZXJJZDoxMjMsIGNhcmRJZDonQGlkJ30sIHtcbiAgICAgICBjaGFyZ2U6IHttZXRob2Q6J1BPU1QnLCBwYXJhbXM6e2NoYXJnZTp0cnVlfX1cbiAgICAgIH0pO1xuXG4gICAgIC8vIFdlIGNhbiByZXRyaWV2ZSBhIGNvbGxlY3Rpb24gZnJvbSB0aGUgc2VydmVyXG4gICAgIHZhciBjYXJkcyA9IENyZWRpdENhcmQucXVlcnkoZnVuY3Rpb24oKSB7XG4gICAgICAgLy8gR0VUOiAvdXNlci8xMjMvY2FyZFxuICAgICAgIC8vIHNlcnZlciByZXR1cm5zOiBbIHtpZDo0NTYsIG51bWJlcjonMTIzNCcsIG5hbWU6J1NtaXRoJ30gXTtcblxuICAgICAgIHZhciBjYXJkID0gY2FyZHNbMF07XG4gICAgICAgLy8gZWFjaCBpdGVtIGlzIGFuIGluc3RhbmNlIG9mIENyZWRpdENhcmRcbiAgICAgICBleHBlY3QoY2FyZCBpbnN0YW5jZW9mIENyZWRpdENhcmQpLnRvRXF1YWwodHJ1ZSk7XG4gICAgICAgY2FyZC5uYW1lID0gXCJKLiBTbWl0aFwiO1xuICAgICAgIC8vIG5vbiBHRVQgbWV0aG9kcyBhcmUgbWFwcGVkIG9udG8gdGhlIGluc3RhbmNlc1xuICAgICAgIGNhcmQuJHNhdmUoKTtcbiAgICAgICAvLyBQT1NUOiAvdXNlci8xMjMvY2FyZC80NTYge2lkOjQ1NiwgbnVtYmVyOicxMjM0JywgbmFtZTonSi4gU21pdGgnfVxuICAgICAgIC8vIHNlcnZlciByZXR1cm5zOiB7aWQ6NDU2LCBudW1iZXI6JzEyMzQnLCBuYW1lOiAnSi4gU21pdGgnfTtcblxuICAgICAgIC8vIG91ciBjdXN0b20gbWV0aG9kIGlzIG1hcHBlZCBhcyB3ZWxsLlxuICAgICAgIGNhcmQuJGNoYXJnZSh7YW1vdW50OjkuOTl9KTtcbiAgICAgICAvLyBQT1NUOiAvdXNlci8xMjMvY2FyZC80NTY/YW1vdW50PTkuOTkmY2hhcmdlPXRydWUge2lkOjQ1NiwgbnVtYmVyOicxMjM0JywgbmFtZTonSi4gU21pdGgnfVxuICAgICB9KTtcblxuICAgICAvLyB3ZSBjYW4gY3JlYXRlIGFuIGluc3RhbmNlIGFzIHdlbGxcbiAgICAgdmFyIG5ld0NhcmQgPSBuZXcgQ3JlZGl0Q2FyZCh7bnVtYmVyOicwMTIzJ30pO1xuICAgICBuZXdDYXJkLm5hbWUgPSBcIk1pa2UgU21pdGhcIjtcbiAgICAgbmV3Q2FyZC4kc2F2ZSgpO1xuICAgICAvLyBQT1NUOiAvdXNlci8xMjMvY2FyZCB7bnVtYmVyOicwMTIzJywgbmFtZTonTWlrZSBTbWl0aCd9XG4gICAgIC8vIHNlcnZlciByZXR1cm5zOiB7aWQ6Nzg5LCBudW1iZXI6JzAxMjMnLCBuYW1lOiAnTWlrZSBTbWl0aCd9O1xuICAgICBleHBlY3QobmV3Q2FyZC5pZCkudG9FcXVhbCg3ODkpO1xuICogYGBgXG4gKlxuICogVGhlIG9iamVjdCByZXR1cm5lZCBmcm9tIHRoaXMgZnVuY3Rpb24gZXhlY3V0aW9uIGlzIGEgcmVzb3VyY2UgXCJjbGFzc1wiIHdoaWNoIGhhcyBcInN0YXRpY1wiIG1ldGhvZFxuICogZm9yIGVhY2ggYWN0aW9uIGluIHRoZSBkZWZpbml0aW9uLlxuICpcbiAqIENhbGxpbmcgdGhlc2UgbWV0aG9kcyBpbnZva2UgYCRodHRwYCBvbiB0aGUgYHVybGAgdGVtcGxhdGUgd2l0aCB0aGUgZ2l2ZW4gYG1ldGhvZGAsIGBwYXJhbXNgIGFuZFxuICogYGhlYWRlcnNgLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogIyBVc2VyIHJlc291cmNlXG4gKlxuICogV2hlbiB0aGUgZGF0YSBpcyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgdGhlbiB0aGUgb2JqZWN0IGlzIGFuIGluc3RhbmNlIG9mIHRoZSByZXNvdXJjZSB0eXBlIGFuZFxuICogYWxsIG9mIHRoZSBub24tR0VUIG1ldGhvZHMgYXJlIGF2YWlsYWJsZSB3aXRoIGAkYCBwcmVmaXguIFRoaXMgYWxsb3dzIHlvdSB0byBlYXNpbHkgc3VwcG9ydCBDUlVEXG4gKiBvcGVyYXRpb25zIChjcmVhdGUsIHJlYWQsIHVwZGF0ZSwgZGVsZXRlKSBvbiBzZXJ2ZXItc2lkZSBkYXRhLlxuXG4gICBgYGBqc1xuICAgICB2YXIgVXNlciA9ICRyZXNvdXJjZSgnL3VzZXIvOnVzZXJJZCcsIHt1c2VySWQ6J0BpZCd9KTtcbiAgICAgVXNlci5nZXQoe3VzZXJJZDoxMjN9LCBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgdXNlci5hYmMgPSB0cnVlO1xuICAgICAgIHVzZXIuJHNhdmUoKTtcbiAgICAgfSk7XG4gICBgYGBcbiAqXG4gKiBJdCdzIHdvcnRoIG5vdGluZyB0aGF0IHRoZSBzdWNjZXNzIGNhbGxiYWNrIGZvciBgZ2V0YCwgYHF1ZXJ5YCBhbmQgb3RoZXIgbWV0aG9kcyBnZXRzIHBhc3NlZFxuICogaW4gdGhlIHJlc3BvbnNlIHRoYXQgY2FtZSBmcm9tIHRoZSBzZXJ2ZXIgYXMgd2VsbCBhcyAkaHR0cCBoZWFkZXIgZ2V0dGVyIGZ1bmN0aW9uLCBzbyBvbmVcbiAqIGNvdWxkIHJld3JpdGUgdGhlIGFib3ZlIGV4YW1wbGUgYW5kIGdldCBhY2Nlc3MgdG8gaHR0cCBoZWFkZXJzIGFzOlxuICpcbiAgIGBgYGpzXG4gICAgIHZhciBVc2VyID0gJHJlc291cmNlKCcvdXNlci86dXNlcklkJywge3VzZXJJZDonQGlkJ30pO1xuICAgICBVc2VyLmdldCh7dXNlcklkOjEyM30sIGZ1bmN0aW9uKHVzZXIsIGdldFJlc3BvbnNlSGVhZGVycyl7XG4gICAgICAgdXNlci5hYmMgPSB0cnVlO1xuICAgICAgIHVzZXIuJHNhdmUoZnVuY3Rpb24odXNlciwgcHV0UmVzcG9uc2VIZWFkZXJzKSB7XG4gICAgICAgICAvL3VzZXIgPT4gc2F2ZWQgdXNlciBvYmplY3RcbiAgICAgICAgIC8vcHV0UmVzcG9uc2VIZWFkZXJzID0+ICRodHRwIGhlYWRlciBnZXR0ZXJcbiAgICAgICB9KTtcbiAgICAgfSk7XG4gICBgYGBcbiAqXG4gKiBZb3UgY2FuIGFsc28gYWNjZXNzIHRoZSByYXcgYCRodHRwYCBwcm9taXNlIHZpYSB0aGUgYCRwcm9taXNlYCBwcm9wZXJ0eSBvbiB0aGUgb2JqZWN0IHJldHVybmVkXG4gKlxuICAgYGBgXG4gICAgIHZhciBVc2VyID0gJHJlc291cmNlKCcvdXNlci86dXNlcklkJywge3VzZXJJZDonQGlkJ30pO1xuICAgICBVc2VyLmdldCh7dXNlcklkOjEyM30pXG4gICAgICAgICAuJHByb21pc2UudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICRzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgIH0pO1xuICAgYGBgXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAjIENyZWF0aW5nIGEgY3VzdG9tICdQVVQnIHJlcXVlc3RcbiAqXG4gKiBJbiB0aGlzIGV4YW1wbGUgd2UgY3JlYXRlIGEgY3VzdG9tIG1ldGhvZCBvbiBvdXIgcmVzb3VyY2UgdG8gbWFrZSBhIFBVVCByZXF1ZXN0XG4gKiBgYGBqc1xuICogICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ25nUmVzb3VyY2UnLCAnbmdSb3V0ZSddKTtcbiAqXG4gKiAgICAvLyBTb21lIEFQSXMgZXhwZWN0IGEgUFVUIHJlcXVlc3QgaW4gdGhlIGZvcm1hdCBVUkwvb2JqZWN0L0lEXG4gKiAgICAvLyBIZXJlIHdlIGFyZSBjcmVhdGluZyBhbiAndXBkYXRlJyBtZXRob2RcbiAqICAgIGFwcC5mYWN0b3J5KCdOb3RlcycsIFsnJHJlc291cmNlJywgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gKiAgICByZXR1cm4gJHJlc291cmNlKCcvbm90ZXMvOmlkJywgbnVsbCxcbiAqICAgICAgICB7XG4gKiAgICAgICAgICAgICd1cGRhdGUnOiB7IG1ldGhvZDonUFVUJyB9XG4gKiAgICAgICAgfSk7XG4gKiAgICB9XSk7XG4gKlxuICogICAgLy8gSW4gb3VyIGNvbnRyb2xsZXIgd2UgZ2V0IHRoZSBJRCBmcm9tIHRoZSBVUkwgdXNpbmcgbmdSb3V0ZSBhbmQgJHJvdXRlUGFyYW1zXG4gKiAgICAvLyBXZSBwYXNzIGluICRyb3V0ZVBhcmFtcyBhbmQgb3VyIE5vdGVzIGZhY3RvcnkgYWxvbmcgd2l0aCAkc2NvcGVcbiAqICAgIGFwcC5jb250cm9sbGVyKCdOb3Rlc0N0cmwnLCBbJyRzY29wZScsICckcm91dGVQYXJhbXMnLCAnTm90ZXMnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigkc2NvcGUsICRyb3V0ZVBhcmFtcywgTm90ZXMpIHtcbiAqICAgIC8vIEZpcnN0IGdldCBhIG5vdGUgb2JqZWN0IGZyb20gdGhlIGZhY3RvcnlcbiAqICAgIHZhciBub3RlID0gTm90ZXMuZ2V0KHsgaWQ6JHJvdXRlUGFyYW1zLmlkIH0pO1xuICogICAgJGlkID0gbm90ZS5pZDtcbiAqXG4gKiAgICAvLyBOb3cgY2FsbCB1cGRhdGUgcGFzc2luZyBpbiB0aGUgSUQgZmlyc3QgdGhlbiB0aGUgb2JqZWN0IHlvdSBhcmUgdXBkYXRpbmdcbiAqICAgIE5vdGVzLnVwZGF0ZSh7IGlkOiRpZCB9LCBub3RlKTtcbiAqXG4gKiAgICAvLyBUaGlzIHdpbGwgUFVUIC9ub3Rlcy9JRCB3aXRoIHRoZSBub3RlIG9iamVjdCBpbiB0aGUgcmVxdWVzdCBwYXlsb2FkXG4gKiAgICB9XSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICMgQ2FuY2VsbGluZyByZXF1ZXN0c1xuICpcbiAqIElmIGFuIGFjdGlvbidzIGNvbmZpZ3VyYXRpb24gc3BlY2lmaWVzIHRoYXQgaXQgaXMgY2FuY2VsbGFibGUsIHlvdSBjYW4gY2FuY2VsIHRoZSByZXF1ZXN0IHJlbGF0ZWRcbiAqIHRvIGFuIGluc3RhbmNlIG9yIGNvbGxlY3Rpb24gKGFzIGxvbmcgYXMgaXQgaXMgYSByZXN1bHQgb2YgYSBcIm5vbi1pbnN0YW5jZVwiIGNhbGwpOlxuICpcbiAgIGBgYGpzXG4gICAgIC8vIC4uLmRlZmluaW5nIHRoZSBgSG90ZWxgIHJlc291cmNlLi4uXG4gICAgIHZhciBIb3RlbCA9ICRyZXNvdXJjZSgnL2FwaS9ob3RlbC86aWQnLCB7aWQ6ICdAaWQnfSwge1xuICAgICAgIC8vIExldCdzIG1ha2UgdGhlIGBxdWVyeSgpYCBtZXRob2QgY2FuY2VsbGFibGVcbiAgICAgICBxdWVyeToge21ldGhvZDogJ2dldCcsIGlzQXJyYXk6IHRydWUsIGNhbmNlbGxhYmxlOiB0cnVlfVxuICAgICB9KTtcblxuICAgICAvLyAuLi5zb21ld2hlcmUgaW4gdGhlIFBsYW5WYWNhdGlvbkNvbnRyb2xsZXIuLi5cbiAgICAgLi4uXG4gICAgIHRoaXMub25EZXN0aW5hdGlvbkNoYW5nZWQgPSBmdW5jdGlvbiBvbkRlc3RpbmF0aW9uQ2hhbmdlZChkZXN0aW5hdGlvbikge1xuICAgICAgIC8vIFdlIGRvbid0IGNhcmUgYWJvdXQgYW55IHBlbmRpbmcgcmVxdWVzdCBmb3IgaG90ZWxzXG4gICAgICAgLy8gaW4gYSBkaWZmZXJlbnQgZGVzdGluYXRpb24gYW55IG1vcmVcbiAgICAgICB0aGlzLmF2YWlsYWJsZUhvdGVscy4kY2FuY2VsUmVxdWVzdCgpO1xuXG4gICAgICAgLy8gTGV0J3MgcXVlcnkgZm9yIGhvdGVscyBpbiAnPGRlc3RpbmF0aW9uPidcbiAgICAgICAvLyAoY2FsbHM6IC9hcGkvaG90ZWw/bG9jYXRpb249PGRlc3RpbmF0aW9uPilcbiAgICAgICB0aGlzLmF2YWlsYWJsZUhvdGVscyA9IEhvdGVsLnF1ZXJ5KHtsb2NhdGlvbjogZGVzdGluYXRpb259KTtcbiAgICAgfTtcbiAgIGBgYFxuICpcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ25nUmVzb3VyY2UnLCBbJ25nJ10pLlxuICBwcm92aWRlcignJHJlc291cmNlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIFBST1RPQ09MX0FORF9ET01BSU5fUkVHRVggPSAvXmh0dHBzPzpcXC9cXC9bXlxcL10qLztcbiAgICB2YXIgcHJvdmlkZXIgPSB0aGlzO1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIHByb3BlcnR5XG4gICAgICogQG5hbWUgJHJlc291cmNlUHJvdmlkZXIjZGVmYXVsdHNcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBPYmplY3QgY29udGFpbmluZyBkZWZhdWx0IG9wdGlvbnMgdXNlZCB3aGVuIGNyZWF0aW5nIGAkcmVzb3VyY2VgIGluc3RhbmNlcy5cbiAgICAgKlxuICAgICAqIFRoZSBkZWZhdWx0IHZhbHVlcyBzYXRpc2Z5IGEgd2lkZSByYW5nZSBvZiB1c2VjYXNlcywgYnV0IHlvdSBtYXkgY2hvb3NlIHRvIG92ZXJ3cml0ZSBhbnkgb2ZcbiAgICAgKiB0aGVtIHRvIGZ1cnRoZXIgY3VzdG9taXplIHlvdXIgaW5zdGFuY2VzLiBUaGUgYXZhaWxhYmxlIHByb3BlcnRpZXMgYXJlOlxuICAgICAqXG4gICAgICogLSAqKnN0cmlwVHJhaWxpbmdTbGFzaGVzKiog4oCTIGB7Ym9vbGVhbn1gIOKAkyBJZiB0cnVlLCB0aGVuIHRoZSB0cmFpbGluZyBzbGFzaGVzIGZyb20gYW55XG4gICAgICogICBjYWxjdWxhdGVkIFVSTCB3aWxsIGJlIHN0cmlwcGVkLjxiciAvPlxuICAgICAqICAgKERlZmF1bHRzIHRvIHRydWUuKVxuICAgICAqIC0gKipjYW5jZWxsYWJsZSoqIOKAkyBge2Jvb2xlYW59YCDigJMgSWYgdHJ1ZSwgdGhlIHJlcXVlc3QgbWFkZSBieSBhIFwibm9uLWluc3RhbmNlXCIgY2FsbCB3aWxsIGJlXG4gICAgICogICBjYW5jZWxsZWQgKGlmIG5vdCBhbHJlYWR5IGNvbXBsZXRlZCkgYnkgY2FsbGluZyBgJGNhbmNlbFJlcXVlc3QoKWAgb24gdGhlIGNhbGwncyByZXR1cm5cbiAgICAgKiAgIHZhbHVlLiBGb3IgbW9yZSBkZXRhaWxzLCBzZWUge0BsaW5rIG5nUmVzb3VyY2UuJHJlc291cmNlfS4gVGhpcyBjYW4gYmUgb3ZlcndyaXR0ZW4gcGVyXG4gICAgICogICByZXNvdXJjZSBjbGFzcyBvciBhY3Rpb24uPGJyIC8+XG4gICAgICogICAoRGVmYXVsdHMgdG8gZmFsc2UuKVxuICAgICAqIC0gKiphY3Rpb25zKiogLSBge09iamVjdC48T2JqZWN0Pn1gIC0gQSBoYXNoIHdpdGggZGVmYXVsdCBhY3Rpb25zIGRlY2xhcmF0aW9ucy4gQWN0aW9ucyBhcmVcbiAgICAgKiAgIGhpZ2gtbGV2ZWwgbWV0aG9kcyBjb3JyZXNwb25kaW5nIHRvIFJFU1RmdWwgYWN0aW9ucy9tZXRob2RzIG9uIHJlc291cmNlcy4gQW4gYWN0aW9uIG1heVxuICAgICAqICAgc3BlY2lmeSB3aGF0IEhUVFAgbWV0aG9kIHRvIHVzZSwgd2hhdCBVUkwgdG8gaGl0LCBpZiB0aGUgcmV0dXJuIHZhbHVlIHdpbGwgYmUgYSBzaW5nbGVcbiAgICAgKiAgIG9iamVjdCBvciBhIGNvbGxlY3Rpb24gKGFycmF5KSBvZiBvYmplY3RzIGV0Yy4gRm9yIG1vcmUgZGV0YWlscywgc2VlXG4gICAgICogICB7QGxpbmsgbmdSZXNvdXJjZS4kcmVzb3VyY2V9LiBUaGUgYWN0aW9ucyBjYW4gYWxzbyBiZSBlbmhhbmNlZCBvciBvdmVyd3JpdHRlbiBwZXIgcmVzb3VyY2VcbiAgICAgKiAgIGNsYXNzLjxiciAvPlxuICAgICAqICAgVGhlIGRlZmF1bHQgYWN0aW9ucyBhcmU6XG4gICAgICogICBgYGBqc1xuICAgICAqICAge1xuICAgICAqICAgICBnZXQ6IHttZXRob2Q6ICdHRVQnfSxcbiAgICAgKiAgICAgc2F2ZToge21ldGhvZDogJ1BPU1QnfSxcbiAgICAgKiAgICAgcXVlcnk6IHttZXRob2Q6ICdHRVQnLCBpc0FycmF5OiB0cnVlfSxcbiAgICAgKiAgICAgcmVtb3ZlOiB7bWV0aG9kOiAnREVMRVRFJ30sXG4gICAgICogICAgIGRlbGV0ZToge21ldGhvZDogJ0RFTEVURSd9XG4gICAgICogICB9XG4gICAgICogICBgYGBcbiAgICAgKlxuICAgICAqICMjIyMgRXhhbXBsZVxuICAgICAqXG4gICAgICogRm9yIGV4YW1wbGUsIHlvdSBjYW4gc3BlY2lmeSBhIG5ldyBgdXBkYXRlYCBhY3Rpb24gdGhhdCB1c2VzIHRoZSBgUFVUYCBIVFRQIHZlcmI6XG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqICAgYW5ndWxhci5cbiAgICAgKiAgICAgbW9kdWxlKCdteUFwcCcpLlxuICAgICAqICAgICBjb25maWcoWydyZXNvdXJjZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRyZXNvdXJjZVByb3ZpZGVyKSB7XG4gICAgICogICAgICAgJHJlc291cmNlUHJvdmlkZXIuZGVmYXVsdHMuYWN0aW9ucy51cGRhdGUgPSB7XG4gICAgICogICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICogICAgICAgfTtcbiAgICAgKiAgICAgfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBPciB5b3UgY2FuIGV2ZW4gb3ZlcndyaXRlIHRoZSB3aG9sZSBgYWN0aW9uc2AgbGlzdCBhbmQgc3BlY2lmeSB5b3VyIG93bjpcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogICBhbmd1bGFyLlxuICAgICAqICAgICBtb2R1bGUoJ215QXBwJykuXG4gICAgICogICAgIGNvbmZpZyhbJ3Jlc291cmNlUHJvdmlkZXInLCBmdW5jdGlvbiAoJHJlc291cmNlUHJvdmlkZXIpIHtcbiAgICAgKiAgICAgICAkcmVzb3VyY2VQcm92aWRlci5kZWZhdWx0cy5hY3Rpb25zID0ge1xuICAgICAqICAgICAgICAgY3JlYXRlOiB7bWV0aG9kOiAnUE9TVCd9XG4gICAgICogICAgICAgICBnZXQ6ICAgIHttZXRob2Q6ICdHRVQnfSxcbiAgICAgKiAgICAgICAgIGdldEFsbDoge21ldGhvZDogJ0dFVCcsIGlzQXJyYXk6dHJ1ZX0sXG4gICAgICogICAgICAgICB1cGRhdGU6IHttZXRob2Q6ICdQVVQnfSxcbiAgICAgKiAgICAgICAgIGRlbGV0ZToge21ldGhvZDogJ0RFTEVURSd9XG4gICAgICogICAgICAgfTtcbiAgICAgKiAgICAgfSk7XG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKi9cbiAgICB0aGlzLmRlZmF1bHRzID0ge1xuICAgICAgLy8gU3RyaXAgc2xhc2hlcyBieSBkZWZhdWx0XG4gICAgICBzdHJpcFRyYWlsaW5nU2xhc2hlczogdHJ1ZSxcblxuICAgICAgLy8gTWFrZSBub24taW5zdGFuY2UgcmVxdWVzdHMgY2FuY2VsbGFibGUgKHZpYSBgJGNhbmNlbFJlcXVlc3QoKWApXG4gICAgICBjYW5jZWxsYWJsZTogZmFsc2UsXG5cbiAgICAgIC8vIERlZmF1bHQgYWN0aW9ucyBjb25maWd1cmF0aW9uXG4gICAgICBhY3Rpb25zOiB7XG4gICAgICAgICdnZXQnOiB7bWV0aG9kOiAnR0VUJ30sXG4gICAgICAgICdzYXZlJzoge21ldGhvZDogJ1BPU1QnfSxcbiAgICAgICAgJ3F1ZXJ5Jzoge21ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IHRydWV9LFxuICAgICAgICAncmVtb3ZlJzoge21ldGhvZDogJ0RFTEVURSd9LFxuICAgICAgICAnZGVsZXRlJzoge21ldGhvZDogJ0RFTEVURSd9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuJGdldCA9IFsnJGh0dHAnLCAnJGxvZycsICckcScsICckdGltZW91dCcsIGZ1bmN0aW9uKCRodHRwLCAkbG9nLCAkcSwgJHRpbWVvdXQpIHtcblxuICAgICAgdmFyIG5vb3AgPSBhbmd1bGFyLm5vb3AsXG4gICAgICAgIGZvckVhY2ggPSBhbmd1bGFyLmZvckVhY2gsXG4gICAgICAgIGV4dGVuZCA9IGFuZ3VsYXIuZXh0ZW5kLFxuICAgICAgICBjb3B5ID0gYW5ndWxhci5jb3B5LFxuICAgICAgICBpc0Z1bmN0aW9uID0gYW5ndWxhci5pc0Z1bmN0aW9uO1xuXG4gICAgICAvKipcbiAgICAgICAqIFdlIG5lZWQgb3VyIGN1c3RvbSBtZXRob2QgYmVjYXVzZSBlbmNvZGVVUklDb21wb25lbnQgaXMgdG9vIGFnZ3Jlc3NpdmUgYW5kIGRvZXNuJ3QgZm9sbG93XG4gICAgICAgKiBodHRwOi8vd3d3LmlldGYub3JnL3JmYy9yZmMzOTg2LnR4dCB3aXRoIHJlZ2FyZHMgdG8gdGhlIGNoYXJhY3RlciBzZXRcbiAgICAgICAqIChwY2hhcikgYWxsb3dlZCBpbiBwYXRoIHNlZ21lbnRzOlxuICAgICAgICogICAgc2VnbWVudCAgICAgICA9ICpwY2hhclxuICAgICAgICogICAgcGNoYXIgICAgICAgICA9IHVucmVzZXJ2ZWQgLyBwY3QtZW5jb2RlZCAvIHN1Yi1kZWxpbXMgLyBcIjpcIiAvIFwiQFwiXG4gICAgICAgKiAgICBwY3QtZW5jb2RlZCAgID0gXCIlXCIgSEVYRElHIEhFWERJR1xuICAgICAgICogICAgdW5yZXNlcnZlZCAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIlxuICAgICAgICogICAgc3ViLWRlbGltcyAgICA9IFwiIVwiIC8gXCIkXCIgLyBcIiZcIiAvIFwiJ1wiIC8gXCIoXCIgLyBcIilcIlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAvIFwiKlwiIC8gXCIrXCIgLyBcIixcIiAvIFwiO1wiIC8gXCI9XCJcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gZW5jb2RlVXJpU2VnbWVudCh2YWwpIHtcbiAgICAgICAgcmV0dXJuIGVuY29kZVVyaVF1ZXJ5KHZhbCwgdHJ1ZSkuXG4gICAgICAgICAgcmVwbGFjZSgvJTI2L2dpLCAnJicpLlxuICAgICAgICAgIHJlcGxhY2UoLyUzRC9naSwgJz0nKS5cbiAgICAgICAgICByZXBsYWNlKC8lMkIvZ2ksICcrJyk7XG4gICAgICB9XG5cblxuICAgICAgLyoqXG4gICAgICAgKiBUaGlzIG1ldGhvZCBpcyBpbnRlbmRlZCBmb3IgZW5jb2RpbmcgKmtleSogb3IgKnZhbHVlKiBwYXJ0cyBvZiBxdWVyeSBjb21wb25lbnQuIFdlIG5lZWQgYVxuICAgICAgICogY3VzdG9tIG1ldGhvZCBiZWNhdXNlIGVuY29kZVVSSUNvbXBvbmVudCBpcyB0b28gYWdncmVzc2l2ZSBhbmQgZW5jb2RlcyBzdHVmZiB0aGF0IGRvZXNuJ3RcbiAgICAgICAqIGhhdmUgdG8gYmUgZW5jb2RlZCBwZXIgaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NjpcbiAgICAgICAqICAgIHF1ZXJ5ICAgICAgID0gKiggcGNoYXIgLyBcIi9cIiAvIFwiP1wiIClcbiAgICAgICAqICAgIHBjaGFyICAgICAgICAgPSB1bnJlc2VydmVkIC8gcGN0LWVuY29kZWQgLyBzdWItZGVsaW1zIC8gXCI6XCIgLyBcIkBcIlxuICAgICAgICogICAgdW5yZXNlcnZlZCAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIlxuICAgICAgICogICAgcGN0LWVuY29kZWQgICA9IFwiJVwiIEhFWERJRyBIRVhESUdcbiAgICAgICAqICAgIHN1Yi1kZWxpbXMgICAgPSBcIiFcIiAvIFwiJFwiIC8gXCImXCIgLyBcIidcIiAvIFwiKFwiIC8gXCIpXCJcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgLyBcIipcIiAvIFwiK1wiIC8gXCIsXCIgLyBcIjtcIiAvIFwiPVwiXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGVuY29kZVVyaVF1ZXJ5KHZhbCwgcGN0RW5jb2RlU3BhY2VzKSB7XG4gICAgICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQodmFsKS5cbiAgICAgICAgICByZXBsYWNlKC8lNDAvZ2ksICdAJykuXG4gICAgICAgICAgcmVwbGFjZSgvJTNBL2dpLCAnOicpLlxuICAgICAgICAgIHJlcGxhY2UoLyUyNC9nLCAnJCcpLlxuICAgICAgICAgIHJlcGxhY2UoLyUyQy9naSwgJywnKS5cbiAgICAgICAgICByZXBsYWNlKC8lMjAvZywgKHBjdEVuY29kZVNwYWNlcyA/ICclMjAnIDogJysnKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIFJvdXRlKHRlbXBsYXRlLCBkZWZhdWx0cykge1xuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgIHRoaXMuZGVmYXVsdHMgPSBleHRlbmQoe30sIHByb3ZpZGVyLmRlZmF1bHRzLCBkZWZhdWx0cyk7XG4gICAgICAgIHRoaXMudXJsUGFyYW1zID0ge307XG4gICAgICB9XG5cbiAgICAgIFJvdXRlLnByb3RvdHlwZSA9IHtcbiAgICAgICAgc2V0VXJsUGFyYW1zOiBmdW5jdGlvbihjb25maWcsIHBhcmFtcywgYWN0aW9uVXJsKSB7XG4gICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgICAgdXJsID0gYWN0aW9uVXJsIHx8IHNlbGYudGVtcGxhdGUsXG4gICAgICAgICAgICB2YWwsXG4gICAgICAgICAgICBlbmNvZGVkVmFsLFxuICAgICAgICAgICAgcHJvdG9jb2xBbmREb21haW4gPSAnJztcblxuICAgICAgICAgIHZhciB1cmxQYXJhbXMgPSBzZWxmLnVybFBhcmFtcyA9IHt9O1xuICAgICAgICAgIGZvckVhY2godXJsLnNwbGl0KC9cXFcvKSwgZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgICAgICAgIGlmIChwYXJhbSA9PT0gJ2hhc093blByb3BlcnR5Jykge1xuICAgICAgICAgICAgICB0aHJvdyAkcmVzb3VyY2VNaW5FcnIoJ2JhZG5hbWUnLCBcImhhc093blByb3BlcnR5IGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlciBuYW1lLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghKG5ldyBSZWdFeHAoXCJeXFxcXGQrJFwiKS50ZXN0KHBhcmFtKSkgJiYgcGFyYW0gJiZcbiAgICAgICAgICAgICAgKG5ldyBSZWdFeHAoXCIoXnxbXlxcXFxcXFxcXSk6XCIgKyBwYXJhbSArIFwiKFxcXFxXfCQpXCIpLnRlc3QodXJsKSkpIHtcbiAgICAgICAgICAgICAgdXJsUGFyYW1zW3BhcmFtXSA9IHtcbiAgICAgICAgICAgICAgICBpc1F1ZXJ5UGFyYW1WYWx1ZTogKG5ldyBSZWdFeHAoXCJcXFxcPy4qPTpcIiArIHBhcmFtICsgXCIoPzpcXFxcV3wkKVwiKSkudGVzdCh1cmwpXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoL1xcXFw6L2csICc6Jyk7XG4gICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoUFJPVE9DT0xfQU5EX0RPTUFJTl9SRUdFWCwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgICAgIHByb3RvY29sQW5kRG9tYWluID0gbWF0Y2g7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBwYXJhbXMgPSBwYXJhbXMgfHwge307XG4gICAgICAgICAgZm9yRWFjaChzZWxmLnVybFBhcmFtcywgZnVuY3Rpb24ocGFyYW1JbmZvLCB1cmxQYXJhbSkge1xuICAgICAgICAgICAgdmFsID0gcGFyYW1zLmhhc093blByb3BlcnR5KHVybFBhcmFtKSA/IHBhcmFtc1t1cmxQYXJhbV0gOiBzZWxmLmRlZmF1bHRzW3VybFBhcmFtXTtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh2YWwpICYmIHZhbCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICBpZiAocGFyYW1JbmZvLmlzUXVlcnlQYXJhbVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZW5jb2RlZFZhbCA9IGVuY29kZVVyaVF1ZXJ5KHZhbCwgdHJ1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZW5jb2RlZFZhbCA9IGVuY29kZVVyaVNlZ21lbnQodmFsKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShuZXcgUmVnRXhwKFwiOlwiICsgdXJsUGFyYW0gKyBcIihcXFxcV3wkKVwiLCBcImdcIiksIGZ1bmN0aW9uKG1hdGNoLCBwMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGVkVmFsICsgcDE7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobmV3IFJlZ0V4cChcIihcXC8/KTpcIiArIHVybFBhcmFtICsgXCIoXFxcXFd8JClcIiwgXCJnXCIpLCBmdW5jdGlvbihtYXRjaCxcbiAgICAgICAgICAgICAgICAgIGxlYWRpbmdTbGFzaGVzLCB0YWlsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhaWwuY2hhckF0KDApID09ICcvJykge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhaWw7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBsZWFkaW5nU2xhc2hlcyArIHRhaWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIC8vIHN0cmlwIHRyYWlsaW5nIHNsYXNoZXMgYW5kIHNldCB0aGUgdXJsICh1bmxlc3MgdGhpcyBiZWhhdmlvciBpcyBzcGVjaWZpY2FsbHkgZGlzYWJsZWQpXG4gICAgICAgICAgaWYgKHNlbGYuZGVmYXVsdHMuc3RyaXBUcmFpbGluZ1NsYXNoZXMpIHtcbiAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKC9cXC8rJC8sICcnKSB8fCAnLyc7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gdGhlbiByZXBsYWNlIGNvbGxhcHNlIGAvLmAgaWYgZm91bmQgaW4gdGhlIGxhc3QgVVJMIHBhdGggc2VnbWVudCBiZWZvcmUgdGhlIHF1ZXJ5XG4gICAgICAgICAgLy8gRS5nLiBgaHR0cDovL3VybC5jb20vaWQuL2Zvcm1hdD9xPXhgIGJlY29tZXMgYGh0dHA6Ly91cmwuY29tL2lkLmZvcm1hdD9xPXhgXG4gICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoL1xcL1xcLig/PVxcdysoJHxcXD8pKS8sICcuJyk7XG4gICAgICAgICAgLy8gcmVwbGFjZSBlc2NhcGVkIGAvXFwuYCB3aXRoIGAvLmBcbiAgICAgICAgICBjb25maWcudXJsID0gcHJvdG9jb2xBbmREb21haW4gKyB1cmwucmVwbGFjZSgvXFwvXFxcXFxcLi8sICcvLicpO1xuXG5cbiAgICAgICAgICAvLyBzZXQgcGFyYW1zIC0gZGVsZWdhdGUgcGFyYW0gZW5jb2RpbmcgdG8gJGh0dHBcbiAgICAgICAgICBmb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgaWYgKCFzZWxmLnVybFBhcmFtc1trZXldKSB7XG4gICAgICAgICAgICAgIGNvbmZpZy5wYXJhbXMgPSBjb25maWcucGFyYW1zIHx8IHt9O1xuICAgICAgICAgICAgICBjb25maWcucGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuXG4gICAgICBmdW5jdGlvbiByZXNvdXJjZUZhY3RvcnkodXJsLCBwYXJhbURlZmF1bHRzLCBhY3Rpb25zLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciByb3V0ZSA9IG5ldyBSb3V0ZSh1cmwsIG9wdGlvbnMpO1xuXG4gICAgICAgIGFjdGlvbnMgPSBleHRlbmQoe30sIHByb3ZpZGVyLmRlZmF1bHRzLmFjdGlvbnMsIGFjdGlvbnMpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXMoZGF0YSwgYWN0aW9uUGFyYW1zKSB7XG4gICAgICAgICAgdmFyIGlkcyA9IHt9O1xuICAgICAgICAgIGFjdGlvblBhcmFtcyA9IGV4dGVuZCh7fSwgcGFyYW1EZWZhdWx0cywgYWN0aW9uUGFyYW1zKTtcbiAgICAgICAgICBmb3JFYWNoKGFjdGlvblBhcmFtcywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7IHZhbHVlID0gdmFsdWUoZGF0YSk7IH1cbiAgICAgICAgICAgIGlkc1trZXldID0gdmFsdWUgJiYgdmFsdWUuY2hhckF0ICYmIHZhbHVlLmNoYXJBdCgwKSA9PSAnQCcgP1xuICAgICAgICAgICAgICBsb29rdXBEb3R0ZWRQYXRoKGRhdGEsIHZhbHVlLnN1YnN0cigxKSkgOiB2YWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gaWRzO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZGVmYXVsdFJlc3BvbnNlSW50ZXJjZXB0b3IocmVzcG9uc2UpIHtcbiAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucmVzb3VyY2U7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBSZXNvdXJjZSh2YWx1ZSkge1xuICAgICAgICAgIHNoYWxsb3dDbGVhckFuZENvcHkodmFsdWUgfHwge30sIHRoaXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgUmVzb3VyY2UucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBkYXRhID0gZXh0ZW5kKHt9LCB0aGlzKTtcbiAgICAgICAgICBkZWxldGUgZGF0YS4kcHJvbWlzZTtcbiAgICAgICAgICBkZWxldGUgZGF0YS4kcmVzb2x2ZWQ7XG4gICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH07XG5cbiAgICAgICAgZm9yRWFjaChhY3Rpb25zLCBmdW5jdGlvbihhY3Rpb24sIG5hbWUpIHtcbiAgICAgICAgICB2YXIgaGFzQm9keSA9IC9eKFBPU1R8UFVUfFBBVENIKSQvaS50ZXN0KGFjdGlvbi5tZXRob2QpO1xuICAgICAgICAgIHZhciBudW1lcmljVGltZW91dCA9IGFjdGlvbi50aW1lb3V0O1xuICAgICAgICAgIHZhciBjYW5jZWxsYWJsZSA9IGFuZ3VsYXIuaXNEZWZpbmVkKGFjdGlvbi5jYW5jZWxsYWJsZSkgPyBhY3Rpb24uY2FuY2VsbGFibGUgOlxuICAgICAgICAgICAgICAob3B0aW9ucyAmJiBhbmd1bGFyLmlzRGVmaW5lZChvcHRpb25zLmNhbmNlbGxhYmxlKSkgPyBvcHRpb25zLmNhbmNlbGxhYmxlIDpcbiAgICAgICAgICAgICAgcHJvdmlkZXIuZGVmYXVsdHMuY2FuY2VsbGFibGU7XG5cbiAgICAgICAgICBpZiAobnVtZXJpY1RpbWVvdXQgJiYgIWFuZ3VsYXIuaXNOdW1iZXIobnVtZXJpY1RpbWVvdXQpKSB7XG4gICAgICAgICAgICAkbG9nLmRlYnVnKCduZ1Jlc291cmNlOlxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAnICBPbmx5IG51bWVyaWMgdmFsdWVzIGFyZSBhbGxvd2VkIGFzIGB0aW1lb3V0YC5cXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyAgUHJvbWlzZXMgYXJlIG5vdCBzdXBwb3J0ZWQgaW4gJHJlc291cmNlLCBiZWNhdXNlIHRoZSBzYW1lIHZhbHVlIHdvdWxkICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAnYmUgdXNlZCBmb3IgbXVsdGlwbGUgcmVxdWVzdHMuIElmIHlvdSBhcmUgbG9va2luZyBmb3IgYSB3YXkgdG8gY2FuY2VsICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAncmVxdWVzdHMsIHlvdSBzaG91bGQgdXNlIHRoZSBgY2FuY2VsbGFibGVgIG9wdGlvbi4nKTtcbiAgICAgICAgICAgIGRlbGV0ZSBhY3Rpb24udGltZW91dDtcbiAgICAgICAgICAgIG51bWVyaWNUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBSZXNvdXJjZVtuYW1lXSA9IGZ1bmN0aW9uKGExLCBhMiwgYTMsIGE0KSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1zID0ge30sIGRhdGEsIHN1Y2Nlc3MsIGVycm9yO1xuXG4gICAgICAgICAgICAvKiBqc2hpbnQgLVcwODYgKi8gLyogKHB1cnBvc2VmdWxseSBmYWxsIHRocm91Z2ggY2FzZSBzdGF0ZW1lbnRzKSAqL1xuICAgICAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICBlcnJvciA9IGE0O1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBhMztcbiAgICAgICAgICAgICAgLy9mYWxsdGhyb3VnaFxuICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihhMikpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKGExKSkge1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzID0gYTE7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yID0gYTI7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzID0gYTI7XG4gICAgICAgICAgICAgICAgICBlcnJvciA9IGEzO1xuICAgICAgICAgICAgICAgICAgLy9mYWxsdGhyb3VnaFxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwYXJhbXMgPSBhMTtcbiAgICAgICAgICAgICAgICAgIGRhdGEgPSBhMjtcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBhMztcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKGExKSkgc3VjY2VzcyA9IGExO1xuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGhhc0JvZHkpIGRhdGEgPSBhMTtcbiAgICAgICAgICAgICAgICBlbHNlIHBhcmFtcyA9IGExO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlIDA6IGJyZWFrO1xuICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93ICRyZXNvdXJjZU1pbkVycignYmFkYXJncycsXG4gICAgICAgICAgICAgICAgICBcIkV4cGVjdGVkIHVwIHRvIDQgYXJndW1lbnRzIFtwYXJhbXMsIGRhdGEsIHN1Y2Nlc3MsIGVycm9yXSwgZ290IHswfSBhcmd1bWVudHNcIixcbiAgICAgICAgICAgICAgICAgIGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoganNoaW50ICtXMDg2ICovIC8qIChwdXJwb3NlZnVsbHkgZmFsbCB0aHJvdWdoIGNhc2Ugc3RhdGVtZW50cykgKi9cblxuICAgICAgICAgICAgdmFyIGlzSW5zdGFuY2VDYWxsID0gdGhpcyBpbnN0YW5jZW9mIFJlc291cmNlO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gaXNJbnN0YW5jZUNhbGwgPyBkYXRhIDogKGFjdGlvbi5pc0FycmF5ID8gW10gOiBuZXcgUmVzb3VyY2UoZGF0YSkpO1xuICAgICAgICAgICAgdmFyIGh0dHBDb25maWcgPSB7fTtcbiAgICAgICAgICAgIHZhciByZXNwb25zZUludGVyY2VwdG9yID0gYWN0aW9uLmludGVyY2VwdG9yICYmIGFjdGlvbi5pbnRlcmNlcHRvci5yZXNwb25zZSB8fFxuICAgICAgICAgICAgICBkZWZhdWx0UmVzcG9uc2VJbnRlcmNlcHRvcjtcbiAgICAgICAgICAgIHZhciByZXNwb25zZUVycm9ySW50ZXJjZXB0b3IgPSBhY3Rpb24uaW50ZXJjZXB0b3IgJiYgYWN0aW9uLmludGVyY2VwdG9yLnJlc3BvbnNlRXJyb3IgfHxcbiAgICAgICAgICAgICAgdW5kZWZpbmVkO1xuICAgICAgICAgICAgdmFyIHRpbWVvdXREZWZlcnJlZDtcbiAgICAgICAgICAgIHZhciBudW1lcmljVGltZW91dFByb21pc2U7XG5cbiAgICAgICAgICAgIGZvckVhY2goYWN0aW9uLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgIGh0dHBDb25maWdba2V5XSA9IGNvcHkodmFsdWUpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncGFyYW1zJzpcbiAgICAgICAgICAgICAgICBjYXNlICdpc0FycmF5JzpcbiAgICAgICAgICAgICAgICBjYXNlICdpbnRlcmNlcHRvcic6XG4gICAgICAgICAgICAgICAgY2FzZSAnY2FuY2VsbGFibGUnOlxuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIWlzSW5zdGFuY2VDYWxsICYmIGNhbmNlbGxhYmxlKSB7XG4gICAgICAgICAgICAgIHRpbWVvdXREZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICAgIGh0dHBDb25maWcudGltZW91dCA9IHRpbWVvdXREZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAgIGlmIChudW1lcmljVGltZW91dCkge1xuICAgICAgICAgICAgICAgIG51bWVyaWNUaW1lb3V0UHJvbWlzZSA9ICR0aW1lb3V0KHRpbWVvdXREZWZlcnJlZC5yZXNvbHZlLCBudW1lcmljVGltZW91dCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhhc0JvZHkpIGh0dHBDb25maWcuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICByb3V0ZS5zZXRVcmxQYXJhbXMoaHR0cENvbmZpZyxcbiAgICAgICAgICAgICAgZXh0ZW5kKHt9LCBleHRyYWN0UGFyYW1zKGRhdGEsIGFjdGlvbi5wYXJhbXMgfHwge30pLCBwYXJhbXMpLFxuICAgICAgICAgICAgICBhY3Rpb24udXJsKTtcblxuICAgICAgICAgICAgdmFyIHByb21pc2UgPSAkaHR0cChodHRwQ29uZmlnKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcblxuICAgICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gY29udmVydCBhY3Rpb24uaXNBcnJheSB0byBib29sZWFuIGluIGNhc2UgaXQgaXMgdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgLy8ganNoaW50IC1XMDE4XG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShkYXRhKSAhPT0gKCEhYWN0aW9uLmlzQXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyAkcmVzb3VyY2VNaW5FcnIoJ2JhZGNmZycsXG4gICAgICAgICAgICAgICAgICAgICAgJ0Vycm9yIGluIHJlc291cmNlIGNvbmZpZ3VyYXRpb24gZm9yIGFjdGlvbiBgezB9YC4gRXhwZWN0ZWQgcmVzcG9uc2UgdG8gJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2NvbnRhaW4gYW4gezF9IGJ1dCBnb3QgYW4gezJ9IChSZXF1ZXN0OiB7M30gezR9KScsIG5hbWUsIGFjdGlvbi5pc0FycmF5ID8gJ2FycmF5JyA6ICdvYmplY3QnLFxuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmlzQXJyYXkoZGF0YSkgPyAnYXJyYXknIDogJ29iamVjdCcsIGh0dHBDb25maWcubWV0aG9kLCBodHRwQ29uZmlnLnVybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGpzaGludCArVzAxOFxuICAgICAgICAgICAgICAgIGlmIChhY3Rpb24uaXNBcnJheSkge1xuICAgICAgICAgICAgICAgICAgdmFsdWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgIGZvckVhY2goZGF0YSwgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5wdXNoKG5ldyBSZXNvdXJjZShpdGVtKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gVmFsaWQgSlNPTiB2YWx1ZXMgbWF5IGJlIHN0cmluZyBsaXRlcmFscywgYW5kIHRoZXNlIHNob3VsZCBub3QgYmUgY29udmVydGVkXG4gICAgICAgICAgICAgICAgICAgICAgLy8gaW50byBvYmplY3RzLiBUaGVzZSBpdGVtcyB3aWxsIG5vdCBoYXZlIGFjY2VzcyB0byB0aGUgUmVzb3VyY2UgcHJvdG90eXBlXG4gICAgICAgICAgICAgICAgICAgICAgLy8gbWV0aG9kcywgYnV0IHVuZm9ydHVuYXRlbHkgdGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSB2YWx1ZS4kcHJvbWlzZTsgICAgIC8vIFNhdmUgdGhlIHByb21pc2VcbiAgICAgICAgICAgICAgICAgIHNoYWxsb3dDbGVhckFuZENvcHkoZGF0YSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgdmFsdWUuJHByb21pc2UgPSBwcm9taXNlOyAgICAgICAgIC8vIFJlc3RvcmUgdGhlIHByb21pc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmVzcG9uc2UucmVzb3VyY2UgPSB2YWx1ZTtcblxuICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAoZXJyb3IgfHwgbm9vcCkocmVzcG9uc2UpO1xuICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwcm9taXNlWydmaW5hbGx5J10oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhbHVlLiRyZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGlmICghaXNJbnN0YW5jZUNhbGwgJiYgY2FuY2VsbGFibGUpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZS4kY2FuY2VsUmVxdWVzdCA9IGFuZ3VsYXIubm9vcDtcbiAgICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwobnVtZXJpY1RpbWVvdXRQcm9taXNlKTtcbiAgICAgICAgICAgICAgICB0aW1lb3V0RGVmZXJyZWQgPSBudW1lcmljVGltZW91dFByb21pc2UgPSBodHRwQ29uZmlnLnRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSByZXNwb25zZUludGVyY2VwdG9yKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAoc3VjY2VzcyB8fCBub29wKSh2YWx1ZSwgcmVzcG9uc2UuaGVhZGVycyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICByZXNwb25zZUVycm9ySW50ZXJjZXB0b3IpO1xuXG4gICAgICAgICAgICBpZiAoIWlzSW5zdGFuY2VDYWxsKSB7XG4gICAgICAgICAgICAgIC8vIHdlIGFyZSBjcmVhdGluZyBpbnN0YW5jZSAvIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgLy8gLSBzZXQgdGhlIGluaXRpYWwgcHJvbWlzZVxuICAgICAgICAgICAgICAvLyAtIHJldHVybiB0aGUgaW5zdGFuY2UgLyBjb2xsZWN0aW9uXG4gICAgICAgICAgICAgIHZhbHVlLiRwcm9taXNlID0gcHJvbWlzZTtcbiAgICAgICAgICAgICAgdmFsdWUuJHJlc29sdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmIChjYW5jZWxsYWJsZSkgdmFsdWUuJGNhbmNlbFJlcXVlc3QgPSB0aW1lb3V0RGVmZXJyZWQucmVzb2x2ZTtcblxuICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGluc3RhbmNlIGNhbGxcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICAgIH07XG5cblxuICAgICAgICAgIFJlc291cmNlLnByb3RvdHlwZVsnJCcgKyBuYW1lXSA9IGZ1bmN0aW9uKHBhcmFtcywgc3VjY2VzcywgZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHBhcmFtcykpIHtcbiAgICAgICAgICAgICAgZXJyb3IgPSBzdWNjZXNzOyBzdWNjZXNzID0gcGFyYW1zOyBwYXJhbXMgPSB7fTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBSZXNvdXJjZVtuYW1lXS5jYWxsKHRoaXMsIHBhcmFtcywgdGhpcywgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC4kcHJvbWlzZSB8fCByZXN1bHQ7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgUmVzb3VyY2UuYmluZCA9IGZ1bmN0aW9uKGFkZGl0aW9uYWxQYXJhbURlZmF1bHRzKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc291cmNlRmFjdG9yeSh1cmwsIGV4dGVuZCh7fSwgcGFyYW1EZWZhdWx0cywgYWRkaXRpb25hbFBhcmFtRGVmYXVsdHMpLCBhY3Rpb25zKTtcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gUmVzb3VyY2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXNvdXJjZUZhY3Rvcnk7XG4gICAgfV07XG4gIH0pO1xuXG5cbn0pKHdpbmRvdywgd2luZG93LmFuZ3VsYXIpO1xuIiwicmVxdWlyZSgnLi9hbmd1bGFyLXJlc291cmNlJyk7XG5tb2R1bGUuZXhwb3J0cyA9ICduZ1Jlc291cmNlJztcbiIsIi8qKlxuICogU3RhdGUtYmFzZWQgcm91dGluZyBmb3IgQW5ndWxhckpTXG4gKiBAdmVyc2lvbiB2MC4zLjFcbiAqIEBsaW5rIGh0dHA6Ly9hbmd1bGFyLXVpLmdpdGh1Yi5jb20vXG4gKiBAbGljZW5zZSBNSVQgTGljZW5zZSwgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuXG4vKiBjb21tb25qcyBwYWNrYWdlIG1hbmFnZXIgc3VwcG9ydCAoZWcgY29tcG9uZW50anMpICovXG5pZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgZXhwb3J0cyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cyA9PT0gZXhwb3J0cyl7XG4gIG1vZHVsZS5leHBvcnRzID0gJ3VpLnJvdXRlcic7XG59XG5cbihmdW5jdGlvbiAod2luZG93LCBhbmd1bGFyLCB1bmRlZmluZWQpIHtcbi8qanNoaW50IGdsb2JhbHN0cmljdDp0cnVlKi9cbi8qZ2xvYmFsIGFuZ3VsYXI6ZmFsc2UqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNEZWZpbmVkID0gYW5ndWxhci5pc0RlZmluZWQsXG4gICAgaXNGdW5jdGlvbiA9IGFuZ3VsYXIuaXNGdW5jdGlvbixcbiAgICBpc1N0cmluZyA9IGFuZ3VsYXIuaXNTdHJpbmcsXG4gICAgaXNPYmplY3QgPSBhbmd1bGFyLmlzT2JqZWN0LFxuICAgIGlzQXJyYXkgPSBhbmd1bGFyLmlzQXJyYXksXG4gICAgZm9yRWFjaCA9IGFuZ3VsYXIuZm9yRWFjaCxcbiAgICBleHRlbmQgPSBhbmd1bGFyLmV4dGVuZCxcbiAgICBjb3B5ID0gYW5ndWxhci5jb3B5LFxuICAgIHRvSnNvbiA9IGFuZ3VsYXIudG9Kc29uO1xuXG5mdW5jdGlvbiBpbmhlcml0KHBhcmVudCwgZXh0cmEpIHtcbiAgcmV0dXJuIGV4dGVuZChuZXcgKGV4dGVuZChmdW5jdGlvbigpIHt9LCB7IHByb3RvdHlwZTogcGFyZW50IH0pKSgpLCBleHRyYSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlKGRzdCkge1xuICBmb3JFYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiAhPT0gZHN0KSB7XG4gICAgICBmb3JFYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICBpZiAoIWRzdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBkc3Rba2V5XSA9IHZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGRzdDtcbn1cblxuLyoqXG4gKiBGaW5kcyB0aGUgY29tbW9uIGFuY2VzdG9yIHBhdGggYmV0d2VlbiB0d28gc3RhdGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBmaXJzdCBUaGUgZmlyc3Qgc3RhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gc2Vjb25kIFRoZSBzZWNvbmQgc3RhdGUuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBzdGF0ZSBuYW1lcyBpbiBkZXNjZW5kaW5nIG9yZGVyLCBub3QgaW5jbHVkaW5nIHRoZSByb290LlxuICovXG5mdW5jdGlvbiBhbmNlc3RvcnMoZmlyc3QsIHNlY29uZCkge1xuICB2YXIgcGF0aCA9IFtdO1xuXG4gIGZvciAodmFyIG4gaW4gZmlyc3QucGF0aCkge1xuICAgIGlmIChmaXJzdC5wYXRoW25dICE9PSBzZWNvbmQucGF0aFtuXSkgYnJlYWs7XG4gICAgcGF0aC5wdXNoKGZpcnN0LnBhdGhbbl0pO1xuICB9XG4gIHJldHVybiBwYXRoO1xufVxuXG4vKipcbiAqIElFOC1zYWZlIHdyYXBwZXIgZm9yIGBPYmplY3Qua2V5cygpYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IEEgSmF2YVNjcmlwdCBvYmplY3QuXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyB0aGUga2V5cyBvZiB0aGUgb2JqZWN0IGFzIGFuIGFycmF5LlxuICovXG5mdW5jdGlvbiBvYmplY3RLZXlzKG9iamVjdCkge1xuICBpZiAoT2JqZWN0LmtleXMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG5cbiAgZm9yRWFjaChvYmplY3QsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XG4gICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogSUU4LXNhZmUgd3JhcHBlciBmb3IgYEFycmF5LnByb3RvdHlwZS5pbmRleE9mKClgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEEgSmF2YVNjcmlwdCBhcnJheS5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgQSB2YWx1ZSB0byBzZWFyY2ggdGhlIGFycmF5IGZvci5cbiAqIEByZXR1cm4ge051bWJlcn0gUmV0dXJucyB0aGUgYXJyYXkgaW5kZXggdmFsdWUgb2YgYHZhbHVlYCwgb3IgYC0xYCBpZiBub3QgcHJlc2VudC5cbiAqL1xuZnVuY3Rpb24gaW5kZXhPZihhcnJheSwgdmFsdWUpIHtcbiAgaWYgKEFycmF5LnByb3RvdHlwZS5pbmRleE9mKSB7XG4gICAgcmV0dXJuIGFycmF5LmluZGV4T2YodmFsdWUsIE51bWJlcihhcmd1bWVudHNbMl0pIHx8IDApO1xuICB9XG4gIHZhciBsZW4gPSBhcnJheS5sZW5ndGggPj4+IDAsIGZyb20gPSBOdW1iZXIoYXJndW1lbnRzWzJdKSB8fCAwO1xuICBmcm9tID0gKGZyb20gPCAwKSA/IE1hdGguY2VpbChmcm9tKSA6IE1hdGguZmxvb3IoZnJvbSk7XG5cbiAgaWYgKGZyb20gPCAwKSBmcm9tICs9IGxlbjtcblxuICBmb3IgKDsgZnJvbSA8IGxlbjsgZnJvbSsrKSB7XG4gICAgaWYgKGZyb20gaW4gYXJyYXkgJiYgYXJyYXlbZnJvbV0gPT09IHZhbHVlKSByZXR1cm4gZnJvbTtcbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbi8qKlxuICogTWVyZ2VzIGEgc2V0IG9mIHBhcmFtZXRlcnMgd2l0aCBhbGwgcGFyYW1ldGVycyBpbmhlcml0ZWQgYmV0d2VlbiB0aGUgY29tbW9uIHBhcmVudHMgb2YgdGhlXG4gKiBjdXJyZW50IHN0YXRlIGFuZCBhIGdpdmVuIGRlc3RpbmF0aW9uIHN0YXRlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdXJyZW50UGFyYW1zIFRoZSB2YWx1ZSBvZiB0aGUgY3VycmVudCBzdGF0ZSBwYXJhbWV0ZXJzICgkc3RhdGVQYXJhbXMpLlxuICogQHBhcmFtIHtPYmplY3R9IG5ld1BhcmFtcyBUaGUgc2V0IG9mIHBhcmFtZXRlcnMgd2hpY2ggd2lsbCBiZSBjb21wb3NpdGVkIHdpdGggaW5oZXJpdGVkIHBhcmFtcy5cbiAqIEBwYXJhbSB7T2JqZWN0fSAkY3VycmVudCBJbnRlcm5hbCBkZWZpbml0aW9uIG9mIG9iamVjdCByZXByZXNlbnRpbmcgdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBAcGFyYW0ge09iamVjdH0gJHRvIEludGVybmFsIGRlZmluaXRpb24gb2Ygb2JqZWN0IHJlcHJlc2VudGluZyBzdGF0ZSB0byB0cmFuc2l0aW9uIHRvLlxuICovXG5mdW5jdGlvbiBpbmhlcml0UGFyYW1zKGN1cnJlbnRQYXJhbXMsIG5ld1BhcmFtcywgJGN1cnJlbnQsICR0bykge1xuICB2YXIgcGFyZW50cyA9IGFuY2VzdG9ycygkY3VycmVudCwgJHRvKSwgcGFyZW50UGFyYW1zLCBpbmhlcml0ZWQgPSB7fSwgaW5oZXJpdExpc3QgPSBbXTtcblxuICBmb3IgKHZhciBpIGluIHBhcmVudHMpIHtcbiAgICBpZiAoIXBhcmVudHNbaV0gfHwgIXBhcmVudHNbaV0ucGFyYW1zKSBjb250aW51ZTtcbiAgICBwYXJlbnRQYXJhbXMgPSBvYmplY3RLZXlzKHBhcmVudHNbaV0ucGFyYW1zKTtcbiAgICBpZiAoIXBhcmVudFBhcmFtcy5sZW5ndGgpIGNvbnRpbnVlO1xuXG4gICAgZm9yICh2YXIgaiBpbiBwYXJlbnRQYXJhbXMpIHtcbiAgICAgIGlmIChpbmRleE9mKGluaGVyaXRMaXN0LCBwYXJlbnRQYXJhbXNbal0pID49IDApIGNvbnRpbnVlO1xuICAgICAgaW5oZXJpdExpc3QucHVzaChwYXJlbnRQYXJhbXNbal0pO1xuICAgICAgaW5oZXJpdGVkW3BhcmVudFBhcmFtc1tqXV0gPSBjdXJyZW50UGFyYW1zW3BhcmVudFBhcmFtc1tqXV07XG4gICAgfVxuICB9XG4gIHJldHVybiBleHRlbmQoe30sIGluaGVyaXRlZCwgbmV3UGFyYW1zKTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIG5vbi1zdHJpY3QgY29tcGFyaXNvbiBvZiB0aGUgc3Vic2V0IG9mIHR3byBvYmplY3RzLCBkZWZpbmVkIGJ5IGEgbGlzdCBvZiBrZXlzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBmaXJzdCBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gYiBUaGUgc2Vjb25kIG9iamVjdC5cbiAqIEBwYXJhbSB7QXJyYXl9IGtleXMgVGhlIGxpc3Qgb2Yga2V5cyB3aXRoaW4gZWFjaCBvYmplY3QgdG8gY29tcGFyZS4gSWYgdGhlIGxpc3QgaXMgZW1wdHkgb3Igbm90IHNwZWNpZmllZCxcbiAqICAgICAgICAgICAgICAgICAgICAgaXQgZGVmYXVsdHMgdG8gdGhlIGxpc3Qgb2Yga2V5cyBpbiBgYWAuXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUga2V5cyBtYXRjaCwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGVxdWFsRm9yS2V5cyhhLCBiLCBrZXlzKSB7XG4gIGlmICgha2V5cykge1xuICAgIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBuIGluIGEpIGtleXMucHVzaChuKTsgLy8gVXNlZCBpbnN0ZWFkIG9mIE9iamVjdC5rZXlzKCkgZm9yIElFOCBjb21wYXRpYmlsaXR5XG4gIH1cblxuICBmb3IgKHZhciBpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrID0ga2V5c1tpXTtcbiAgICBpZiAoYVtrXSAhPSBiW2tdKSByZXR1cm4gZmFsc2U7IC8vIE5vdCAnPT09JywgdmFsdWVzIGFyZW4ndCBuZWNlc3NhcmlseSBub3JtYWxpemVkXG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc3Vic2V0IG9mIGFuIG9iamVjdCwgYmFzZWQgb24gYSBsaXN0IG9mIGtleXMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0ga2V5c1xuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlc1xuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyBhIHN1YnNldCBvZiBgdmFsdWVzYC5cbiAqL1xuZnVuY3Rpb24gZmlsdGVyQnlLZXlzKGtleXMsIHZhbHVlcykge1xuICB2YXIgZmlsdGVyZWQgPSB7fTtcblxuICBmb3JFYWNoKGtleXMsIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgZmlsdGVyZWRbbmFtZV0gPSB2YWx1ZXNbbmFtZV07XG4gIH0pO1xuICByZXR1cm4gZmlsdGVyZWQ7XG59XG5cbi8vIGxpa2UgXy5pbmRleEJ5XG4vLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUsIG9yIHlvdSB3YW50IGxhc3Qtb25lLWluIHRvIHdpblxuZnVuY3Rpb24gaW5kZXhCeShhcnJheSwgcHJvcE5hbWUpIHtcbiAgdmFyIHJlc3VsdCA9IHt9O1xuICBmb3JFYWNoKGFycmF5LCBmdW5jdGlvbihpdGVtKSB7XG4gICAgcmVzdWx0W2l0ZW1bcHJvcE5hbWVdXSA9IGl0ZW07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBleHRyYWN0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzXG4vLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuZnVuY3Rpb24gcGljayhvYmopIHtcbiAgdmFyIGNvcHkgPSB7fTtcbiAgdmFyIGtleXMgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KEFycmF5LnByb3RvdHlwZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIGZvckVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKGtleSBpbiBvYmopIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICB9KTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbi8vIGV4dHJhY3RlZCBmcm9tIHVuZGVyc2NvcmUuanNcbi8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbWl0dGluZyB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbmZ1bmN0aW9uIG9taXQob2JqKSB7XG4gIHZhciBjb3B5ID0ge307XG4gIHZhciBrZXlzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShBcnJheS5wcm90b3R5cGUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGluZGV4T2Yoa2V5cywga2V5KSA9PSAtMSkgY29weVtrZXldID0gb2JqW2tleV07XG4gIH1cbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHBsdWNrKGNvbGxlY3Rpb24sIGtleSkge1xuICB2YXIgcmVzdWx0ID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IFtdIDoge307XG5cbiAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWwsIGkpIHtcbiAgICByZXN1bHRbaV0gPSBpc0Z1bmN0aW9uKGtleSkgPyBrZXkodmFsKSA6IHZhbFtrZXldO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gZmlsdGVyKGNvbGxlY3Rpb24sIGNhbGxiYWNrKSB7XG4gIHZhciBhcnJheSA9IGlzQXJyYXkoY29sbGVjdGlvbik7XG4gIHZhciByZXN1bHQgPSBhcnJheSA/IFtdIDoge307XG4gIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsLCBpKSB7XG4gICAgaWYgKGNhbGxiYWNrKHZhbCwgaSkpIHtcbiAgICAgIHJlc3VsdFthcnJheSA/IHJlc3VsdC5sZW5ndGggOiBpXSA9IHZhbDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtYXAoY29sbGVjdGlvbiwgY2FsbGJhY2spIHtcbiAgdmFyIHJlc3VsdCA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBbXSA6IHt9O1xuXG4gIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsLCBpKSB7XG4gICAgcmVzdWx0W2ldID0gY2FsbGJhY2sodmFsLCBpKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogQG5nZG9jIG92ZXJ2aWV3XG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogIyB1aS5yb3V0ZXIudXRpbCBzdWItbW9kdWxlXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYSBkZXBlbmRlbmN5IG9mIG90aGVyIHN1Yi1tb2R1bGVzLiBEbyBub3QgaW5jbHVkZSB0aGlzIG1vZHVsZSBhcyBhIGRlcGVuZGVuY3lcbiAqIGluIHlvdXIgYW5ndWxhciBhcHAgKHVzZSB7QGxpbmsgdWkucm91dGVyfSBtb2R1bGUgaW5zdGVhZCkuXG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnV0aWwnLCBbJ25nJ10pO1xuXG4vKipcbiAqIEBuZ2RvYyBvdmVydmlld1xuICogQG5hbWUgdWkucm91dGVyLnJvdXRlclxuICogXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnV0aWxcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqICMgdWkucm91dGVyLnJvdXRlciBzdWItbW9kdWxlXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYSBkZXBlbmRlbmN5IG9mIG90aGVyIHN1Yi1tb2R1bGVzLiBEbyBub3QgaW5jbHVkZSB0aGlzIG1vZHVsZSBhcyBhIGRlcGVuZGVuY3lcbiAqIGluIHlvdXIgYW5ndWxhciBhcHAgKHVzZSB7QGxpbmsgdWkucm91dGVyfSBtb2R1bGUgaW5zdGVhZCkuXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIucm91dGVyJywgWyd1aS5yb3V0ZXIudXRpbCddKTtcblxuLyoqXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZVxuICogXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnJvdXRlclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiAjIHVpLnJvdXRlci5zdGF0ZSBzdWItbW9kdWxlXG4gKlxuICogVGhpcyBtb2R1bGUgaXMgYSBkZXBlbmRlbmN5IG9mIHRoZSBtYWluIHVpLnJvdXRlciBtb2R1bGUuIERvIG5vdCBpbmNsdWRlIHRoaXMgbW9kdWxlIGFzIGEgZGVwZW5kZW5jeVxuICogaW4geW91ciBhbmd1bGFyIGFwcCAodXNlIHtAbGluayB1aS5yb3V0ZXJ9IG1vZHVsZSBpbnN0ZWFkKS5cbiAqIFxuICovXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJywgWyd1aS5yb3V0ZXIucm91dGVyJywgJ3VpLnJvdXRlci51dGlsJ10pO1xuXG4vKipcbiAqIEBuZ2RvYyBvdmVydmlld1xuICogQG5hbWUgdWkucm91dGVyXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogIyB1aS5yb3V0ZXJcbiAqIFxuICogIyMgVGhlIG1haW4gbW9kdWxlIGZvciB1aS5yb3V0ZXIgXG4gKiBUaGVyZSBhcmUgc2V2ZXJhbCBzdWItbW9kdWxlcyBpbmNsdWRlZCB3aXRoIHRoZSB1aS5yb3V0ZXIgbW9kdWxlLCBob3dldmVyIG9ubHkgdGhpcyBtb2R1bGUgaXMgbmVlZGVkXG4gKiBhcyBhIGRlcGVuZGVuY3kgd2l0aGluIHlvdXIgYW5ndWxhciBhcHAuIFRoZSBvdGhlciBtb2R1bGVzIGFyZSBmb3Igb3JnYW5pemF0aW9uIHB1cnBvc2VzLiBcbiAqXG4gKiBUaGUgbW9kdWxlcyBhcmU6XG4gKiAqIHVpLnJvdXRlciAtIHRoZSBtYWluIFwidW1icmVsbGFcIiBtb2R1bGVcbiAqICogdWkucm91dGVyLnJvdXRlciAtIFxuICogXG4gKiAqWW91J2xsIG5lZWQgdG8gaW5jbHVkZSAqKm9ubHkqKiB0aGlzIG1vZHVsZSBhcyB0aGUgZGVwZW5kZW5jeSB3aXRoaW4geW91ciBhbmd1bGFyIGFwcC4qXG4gKiBcbiAqIDxwcmU+XG4gKiA8IWRvY3R5cGUgaHRtbD5cbiAqIDxodG1sIG5nLWFwcD1cIm15QXBwXCI+XG4gKiA8aGVhZD5cbiAqICAgPHNjcmlwdCBzcmM9XCJqcy9hbmd1bGFyLmpzXCI+PC9zY3JpcHQ+XG4gKiAgIDwhLS0gSW5jbHVkZSB0aGUgdWktcm91dGVyIHNjcmlwdCAtLT5cbiAqICAgPHNjcmlwdCBzcmM9XCJqcy9hbmd1bGFyLXVpLXJvdXRlci5taW4uanNcIj48L3NjcmlwdD5cbiAqICAgPHNjcmlwdD5cbiAqICAgICAvLyAuLi5hbmQgYWRkICd1aS5yb3V0ZXInIGFzIGEgZGVwZW5kZW5jeVxuICogICAgIHZhciBteUFwcCA9IGFuZ3VsYXIubW9kdWxlKCdteUFwcCcsIFsndWkucm91dGVyJ10pO1xuICogICA8L3NjcmlwdD5cbiAqIDwvaGVhZD5cbiAqIDxib2R5PlxuICogPC9ib2R5PlxuICogPC9odG1sPlxuICogPC9wcmU+XG4gKi9cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXInLCBbJ3VpLnJvdXRlci5zdGF0ZSddKTtcblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5jb21wYXQnLCBbJ3VpLnJvdXRlciddKTtcblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kcmVzb2x2ZVxuICpcbiAqIEByZXF1aXJlcyAkcVxuICogQHJlcXVpcmVzICRpbmplY3RvclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogTWFuYWdlcyByZXNvbHV0aW9uIG9mIChhY3ljbGljKSBncmFwaHMgb2YgcHJvbWlzZXMuXG4gKi9cbiRSZXNvbHZlLiRpbmplY3QgPSBbJyRxJywgJyRpbmplY3RvciddO1xuZnVuY3Rpb24gJFJlc29sdmUoICAkcSwgICAgJGluamVjdG9yKSB7XG4gIFxuICB2YXIgVklTSVRfSU5fUFJPR1JFU1MgPSAxLFxuICAgICAgVklTSVRfRE9ORSA9IDIsXG4gICAgICBOT1RISU5HID0ge30sXG4gICAgICBOT19ERVBFTkRFTkNJRVMgPSBbXSxcbiAgICAgIE5PX0xPQ0FMUyA9IE5PVEhJTkcsXG4gICAgICBOT19QQVJFTlQgPSBleHRlbmQoJHEud2hlbihOT1RISU5HKSwgeyAkJHByb21pc2VzOiBOT1RISU5HLCAkJHZhbHVlczogTk9USElORyB9KTtcbiAgXG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kcmVzb2x2ZSNzdHVkeVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHJlc29sdmVcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFN0dWRpZXMgYSBzZXQgb2YgaW52b2NhYmxlcyB0aGF0IGFyZSBsaWtlbHkgdG8gYmUgdXNlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICogPHByZT5cbiAgICogJHJlc29sdmUuc3R1ZHkoaW52b2NhYmxlcykobG9jYWxzLCBwYXJlbnQsIHNlbGYpXG4gICAqIDwvcHJlPlxuICAgKiBpcyBlcXVpdmFsZW50IHRvXG4gICAqIDxwcmU+XG4gICAqICRyZXNvbHZlLnJlc29sdmUoaW52b2NhYmxlcywgbG9jYWxzLCBwYXJlbnQsIHNlbGYpXG4gICAqIDwvcHJlPlxuICAgKiBidXQgdGhlIGZvcm1lciBpcyBtb3JlIGVmZmljaWVudCAoaW4gZmFjdCBgcmVzb2x2ZWAganVzdCBjYWxscyBgc3R1ZHlgIFxuICAgKiBpbnRlcm5hbGx5KS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGludm9jYWJsZXMgSW52b2NhYmxlIG9iamVjdHNcbiAgICogQHJldHVybiB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdG8gcGFzcyBpbiBsb2NhbHMsIHBhcmVudCBhbmQgc2VsZlxuICAgKi9cbiAgdGhpcy5zdHVkeSA9IGZ1bmN0aW9uIChpbnZvY2FibGVzKSB7XG4gICAgaWYgKCFpc09iamVjdChpbnZvY2FibGVzKSkgdGhyb3cgbmV3IEVycm9yKFwiJ2ludm9jYWJsZXMnIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xuICAgIHZhciBpbnZvY2FibGVLZXlzID0gb2JqZWN0S2V5cyhpbnZvY2FibGVzIHx8IHt9KTtcbiAgICBcbiAgICAvLyBQZXJmb3JtIGEgdG9wb2xvZ2ljYWwgc29ydCBvZiBpbnZvY2FibGVzIHRvIGJ1aWxkIGFuIG9yZGVyZWQgcGxhblxuICAgIHZhciBwbGFuID0gW10sIGN5Y2xlID0gW10sIHZpc2l0ZWQgPSB7fTtcbiAgICBmdW5jdGlvbiB2aXNpdCh2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAodmlzaXRlZFtrZXldID09PSBWSVNJVF9ET05FKSByZXR1cm47XG4gICAgICBcbiAgICAgIGN5Y2xlLnB1c2goa2V5KTtcbiAgICAgIGlmICh2aXNpdGVkW2tleV0gPT09IFZJU0lUX0lOX1BST0dSRVNTKSB7XG4gICAgICAgIGN5Y2xlLnNwbGljZSgwLCBpbmRleE9mKGN5Y2xlLCBrZXkpKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ3ljbGljIGRlcGVuZGVuY3k6IFwiICsgY3ljbGUuam9pbihcIiAtPiBcIikpO1xuICAgICAgfVxuICAgICAgdmlzaXRlZFtrZXldID0gVklTSVRfSU5fUFJPR1JFU1M7XG4gICAgICBcbiAgICAgIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgcGxhbi5wdXNoKGtleSwgWyBmdW5jdGlvbigpIHsgcmV0dXJuICRpbmplY3Rvci5nZXQodmFsdWUpOyB9XSwgTk9fREVQRU5ERU5DSUVTKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSAkaW5qZWN0b3IuYW5ub3RhdGUodmFsdWUpO1xuICAgICAgICBmb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gKHBhcmFtKSB7XG4gICAgICAgICAgaWYgKHBhcmFtICE9PSBrZXkgJiYgaW52b2NhYmxlcy5oYXNPd25Qcm9wZXJ0eShwYXJhbSkpIHZpc2l0KGludm9jYWJsZXNbcGFyYW1dLCBwYXJhbSk7XG4gICAgICAgIH0pO1xuICAgICAgICBwbGFuLnB1c2goa2V5LCB2YWx1ZSwgcGFyYW1zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgY3ljbGUucG9wKCk7XG4gICAgICB2aXNpdGVkW2tleV0gPSBWSVNJVF9ET05FO1xuICAgIH1cbiAgICBmb3JFYWNoKGludm9jYWJsZXMsIHZpc2l0KTtcbiAgICBpbnZvY2FibGVzID0gY3ljbGUgPSB2aXNpdGVkID0gbnVsbDsgLy8gcGxhbiBpcyBhbGwgdGhhdCdzIHJlcXVpcmVkXG4gICAgXG4gICAgZnVuY3Rpb24gaXNSZXNvbHZlKHZhbHVlKSB7XG4gICAgICByZXR1cm4gaXNPYmplY3QodmFsdWUpICYmIHZhbHVlLnRoZW4gJiYgdmFsdWUuJCRwcm9taXNlcztcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChsb2NhbHMsIHBhcmVudCwgc2VsZikge1xuICAgICAgaWYgKGlzUmVzb2x2ZShsb2NhbHMpICYmIHNlbGYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZWxmID0gcGFyZW50OyBwYXJlbnQgPSBsb2NhbHM7IGxvY2FscyA9IG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoIWxvY2FscykgbG9jYWxzID0gTk9fTE9DQUxTO1xuICAgICAgZWxzZSBpZiAoIWlzT2JqZWN0KGxvY2FscykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ2xvY2FscycgbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gICAgICB9ICAgICAgIFxuICAgICAgaWYgKCFwYXJlbnQpIHBhcmVudCA9IE5PX1BBUkVOVDtcbiAgICAgIGVsc2UgaWYgKCFpc1Jlc29sdmUocGFyZW50KSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIncGFyZW50JyBtdXN0IGJlIGEgcHJvbWlzZSByZXR1cm5lZCBieSAkcmVzb2x2ZS5yZXNvbHZlKClcIik7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFRvIGNvbXBsZXRlIHRoZSBvdmVyYWxsIHJlc29sdXRpb24sIHdlIGhhdmUgdG8gd2FpdCBmb3IgdGhlIHBhcmVudFxuICAgICAgLy8gcHJvbWlzZSBhbmQgZm9yIHRoZSBwcm9taXNlIGZvciBlYWNoIGludm9rYWJsZSBpbiBvdXIgcGxhbi5cbiAgICAgIHZhciByZXNvbHV0aW9uID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICByZXN1bHQgPSByZXNvbHV0aW9uLnByb21pc2UsXG4gICAgICAgICAgcHJvbWlzZXMgPSByZXN1bHQuJCRwcm9taXNlcyA9IHt9LFxuICAgICAgICAgIHZhbHVlcyA9IGV4dGVuZCh7fSwgbG9jYWxzKSxcbiAgICAgICAgICB3YWl0ID0gMSArIHBsYW4ubGVuZ3RoLzMsXG4gICAgICAgICAgbWVyZ2VkID0gZmFsc2U7XG4gICAgICAgICAgXG4gICAgICBmdW5jdGlvbiBkb25lKCkge1xuICAgICAgICAvLyBNZXJnZSBwYXJlbnQgdmFsdWVzIHdlIGhhdmVuJ3QgZ290IHlldCBhbmQgcHVibGlzaCBvdXIgb3duICQkdmFsdWVzXG4gICAgICAgIGlmICghLS13YWl0KSB7XG4gICAgICAgICAgaWYgKCFtZXJnZWQpIG1lcmdlKHZhbHVlcywgcGFyZW50LiQkdmFsdWVzKTsgXG4gICAgICAgICAgcmVzdWx0LiQkdmFsdWVzID0gdmFsdWVzO1xuICAgICAgICAgIHJlc3VsdC4kJHByb21pc2VzID0gcmVzdWx0LiQkcHJvbWlzZXMgfHwgdHJ1ZTsgLy8ga2VlcCBmb3IgaXNSZXNvbHZlKClcbiAgICAgICAgICBkZWxldGUgcmVzdWx0LiQkaW5oZXJpdGVkVmFsdWVzO1xuICAgICAgICAgIHJlc29sdXRpb24ucmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIGZhaWwocmVhc29uKSB7XG4gICAgICAgIHJlc3VsdC4kJGZhaWx1cmUgPSByZWFzb247XG4gICAgICAgIHJlc29sdXRpb24ucmVqZWN0KHJlYXNvbik7XG4gICAgICB9XG5cbiAgICAgIC8vIFNob3J0LWNpcmN1aXQgaWYgcGFyZW50IGhhcyBhbHJlYWR5IGZhaWxlZFxuICAgICAgaWYgKGlzRGVmaW5lZChwYXJlbnQuJCRmYWlsdXJlKSkge1xuICAgICAgICBmYWlsKHBhcmVudC4kJGZhaWx1cmUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAocGFyZW50LiQkaW5oZXJpdGVkVmFsdWVzKSB7XG4gICAgICAgIG1lcmdlKHZhbHVlcywgb21pdChwYXJlbnQuJCRpbmhlcml0ZWRWYWx1ZXMsIGludm9jYWJsZUtleXMpKTtcbiAgICAgIH1cblxuICAgICAgLy8gTWVyZ2UgcGFyZW50IHZhbHVlcyBpZiB0aGUgcGFyZW50IGhhcyBhbHJlYWR5IHJlc29sdmVkLCBvciBtZXJnZVxuICAgICAgLy8gcGFyZW50IHByb21pc2VzIGFuZCB3YWl0IGlmIHRoZSBwYXJlbnQgcmVzb2x2ZSBpcyBzdGlsbCBpbiBwcm9ncmVzcy5cbiAgICAgIGV4dGVuZChwcm9taXNlcywgcGFyZW50LiQkcHJvbWlzZXMpO1xuICAgICAgaWYgKHBhcmVudC4kJHZhbHVlcykge1xuICAgICAgICBtZXJnZWQgPSBtZXJnZSh2YWx1ZXMsIG9taXQocGFyZW50LiQkdmFsdWVzLCBpbnZvY2FibGVLZXlzKSk7XG4gICAgICAgIHJlc3VsdC4kJGluaGVyaXRlZFZhbHVlcyA9IG9taXQocGFyZW50LiQkdmFsdWVzLCBpbnZvY2FibGVLZXlzKTtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHBhcmVudC4kJGluaGVyaXRlZFZhbHVlcykge1xuICAgICAgICAgIHJlc3VsdC4kJGluaGVyaXRlZFZhbHVlcyA9IG9taXQocGFyZW50LiQkaW5oZXJpdGVkVmFsdWVzLCBpbnZvY2FibGVLZXlzKTtcbiAgICAgICAgfSAgICAgICAgXG4gICAgICAgIHBhcmVudC50aGVuKGRvbmUsIGZhaWwpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBQcm9jZXNzIGVhY2ggaW52b2NhYmxlIGluIHRoZSBwbGFuLCBidXQgaWdub3JlIGFueSB3aGVyZSBhIGxvY2FsIG9mIHRoZSBzYW1lIG5hbWUgZXhpc3RzLlxuICAgICAgZm9yICh2YXIgaT0wLCBpaT1wbGFuLmxlbmd0aDsgaTxpaTsgaSs9Mykge1xuICAgICAgICBpZiAobG9jYWxzLmhhc093blByb3BlcnR5KHBsYW5baV0pKSBkb25lKCk7XG4gICAgICAgIGVsc2UgaW52b2tlKHBsYW5baV0sIHBsYW5baSsxXSwgcGxhbltpKzJdKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gaW52b2tlKGtleSwgaW52b2NhYmxlLCBwYXJhbXMpIHtcbiAgICAgICAgLy8gQ3JlYXRlIGEgZGVmZXJyZWQgZm9yIHRoaXMgaW52b2NhdGlvbi4gRmFpbHVyZXMgd2lsbCBwcm9wYWdhdGUgdG8gdGhlIHJlc29sdXRpb24gYXMgd2VsbC5cbiAgICAgICAgdmFyIGludm9jYXRpb24gPSAkcS5kZWZlcigpLCB3YWl0UGFyYW1zID0gMDtcbiAgICAgICAgZnVuY3Rpb24gb25mYWlsdXJlKHJlYXNvbikge1xuICAgICAgICAgIGludm9jYXRpb24ucmVqZWN0KHJlYXNvbik7XG4gICAgICAgICAgZmFpbChyZWFzb24pO1xuICAgICAgICB9XG4gICAgICAgIC8vIFdhaXQgZm9yIGFueSBwYXJhbWV0ZXIgdGhhdCB3ZSBoYXZlIGEgcHJvbWlzZSBmb3IgKGVpdGhlciBmcm9tIHBhcmVudCBvciBmcm9tIHRoaXNcbiAgICAgICAgLy8gcmVzb2x2ZTsgaW4gdGhhdCBjYXNlIHN0dWR5KCkgd2lsbCBoYXZlIG1hZGUgc3VyZSBpdCdzIG9yZGVyZWQgYmVmb3JlIHVzIGluIHRoZSBwbGFuKS5cbiAgICAgICAgZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIChkZXApIHtcbiAgICAgICAgICBpZiAocHJvbWlzZXMuaGFzT3duUHJvcGVydHkoZGVwKSAmJiAhbG9jYWxzLmhhc093blByb3BlcnR5KGRlcCkpIHtcbiAgICAgICAgICAgIHdhaXRQYXJhbXMrKztcbiAgICAgICAgICAgIHByb21pc2VzW2RlcF0udGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHZhbHVlc1tkZXBdID0gcmVzdWx0O1xuICAgICAgICAgICAgICBpZiAoISgtLXdhaXRQYXJhbXMpKSBwcm9jZWVkKCk7XG4gICAgICAgICAgICB9LCBvbmZhaWx1cmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghd2FpdFBhcmFtcykgcHJvY2VlZCgpO1xuICAgICAgICBmdW5jdGlvbiBwcm9jZWVkKCkge1xuICAgICAgICAgIGlmIChpc0RlZmluZWQocmVzdWx0LiQkZmFpbHVyZSkpIHJldHVybjtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaW52b2NhdGlvbi5yZXNvbHZlKCRpbmplY3Rvci5pbnZva2UoaW52b2NhYmxlLCBzZWxmLCB2YWx1ZXMpKTtcbiAgICAgICAgICAgIGludm9jYXRpb24ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgdmFsdWVzW2tleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgIH0sIG9uZmFpbHVyZSk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgb25mYWlsdXJlKGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBQdWJsaXNoIHByb21pc2Ugc3luY2hyb25vdXNseTsgaW52b2NhdGlvbnMgZnVydGhlciBkb3duIGluIHRoZSBwbGFuIG1heSBkZXBlbmQgb24gaXQuXG4gICAgICAgIHByb21pc2VzW2tleV0gPSBpbnZvY2F0aW9uLnByb21pc2U7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcbiAgXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHJlc29sdmUjcmVzb2x2ZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHJlc29sdmVcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlc29sdmVzIGEgc2V0IG9mIGludm9jYWJsZXMuIEFuIGludm9jYWJsZSBpcyBhIGZ1bmN0aW9uIHRvIGJlIGludm9rZWQgdmlhIFxuICAgKiBgJGluamVjdG9yLmludm9rZSgpYCwgYW5kIGNhbiBoYXZlIGFuIGFyYml0cmFyeSBudW1iZXIgb2YgZGVwZW5kZW5jaWVzLiBcbiAgICogQW4gaW52b2NhYmxlIGNhbiBlaXRoZXIgcmV0dXJuIGEgdmFsdWUgZGlyZWN0bHksXG4gICAqIG9yIGEgYCRxYCBwcm9taXNlLiBJZiBhIHByb21pc2UgaXMgcmV0dXJuZWQgaXQgd2lsbCBiZSByZXNvbHZlZCBhbmQgdGhlIFxuICAgKiByZXN1bHRpbmcgdmFsdWUgd2lsbCBiZSB1c2VkIGluc3RlYWQuIERlcGVuZGVuY2llcyBvZiBpbnZvY2FibGVzIGFyZSByZXNvbHZlZCBcbiAgICogKGluIHRoaXMgb3JkZXIgb2YgcHJlY2VkZW5jZSlcbiAgICpcbiAgICogLSBmcm9tIHRoZSBzcGVjaWZpZWQgYGxvY2Fsc2BcbiAgICogLSBmcm9tIGFub3RoZXIgaW52b2NhYmxlIHRoYXQgaXMgcGFydCBvZiB0aGlzIGAkcmVzb2x2ZWAgY2FsbFxuICAgKiAtIGZyb20gYW4gaW52b2NhYmxlIHRoYXQgaXMgaW5oZXJpdGVkIGZyb20gYSBgcGFyZW50YCBjYWxsIHRvIGAkcmVzb2x2ZWAgXG4gICAqICAgKG9yIHJlY3Vyc2l2ZWx5XG4gICAqIC0gZnJvbSBhbnkgYW5jZXN0b3IgYCRyZXNvbHZlYCBvZiB0aGF0IHBhcmVudCkuXG4gICAqXG4gICAqIFRoZSByZXR1cm4gdmFsdWUgb2YgYCRyZXNvbHZlYCBpcyBhIHByb21pc2UgZm9yIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIFxuICAgKiAoaW4gdGhpcyBvcmRlciBvZiBwcmVjZWRlbmNlKVxuICAgKlxuICAgKiAtIGFueSBgbG9jYWxzYCAoaWYgc3BlY2lmaWVkKVxuICAgKiAtIHRoZSByZXNvbHZlZCByZXR1cm4gdmFsdWVzIG9mIGFsbCBpbmplY3RhYmxlc1xuICAgKiAtIGFueSB2YWx1ZXMgaW5oZXJpdGVkIGZyb20gYSBgcGFyZW50YCBjYWxsIHRvIGAkcmVzb2x2ZWAgKGlmIHNwZWNpZmllZClcbiAgICpcbiAgICogVGhlIHByb21pc2Ugd2lsbCByZXNvbHZlIGFmdGVyIHRoZSBgcGFyZW50YCBwcm9taXNlIChpZiBhbnkpIGFuZCBhbGwgcHJvbWlzZXMgXG4gICAqIHJldHVybmVkIGJ5IGluamVjdGFibGVzIGhhdmUgYmVlbiByZXNvbHZlZC4gSWYgYW55IGludm9jYWJsZSBcbiAgICogKG9yIGAkaW5qZWN0b3IuaW52b2tlYCkgdGhyb3dzIGFuIGV4Y2VwdGlvbiwgb3IgaWYgYSBwcm9taXNlIHJldHVybmVkIGJ5IGFuIFxuICAgKiBpbnZvY2FibGUgaXMgcmVqZWN0ZWQsIHRoZSBgJHJlc29sdmVgIHByb21pc2UgaXMgaW1tZWRpYXRlbHkgcmVqZWN0ZWQgd2l0aCB0aGUgXG4gICAqIHNhbWUgZXJyb3IuIEEgcmVqZWN0aW9uIG9mIGEgYHBhcmVudGAgcHJvbWlzZSAoaWYgc3BlY2lmaWVkKSB3aWxsIGxpa2V3aXNlIGJlIFxuICAgKiBwcm9wYWdhdGVkIGltbWVkaWF0ZWx5LiBPbmNlIHRoZSBgJHJlc29sdmVgIHByb21pc2UgaGFzIGJlZW4gcmVqZWN0ZWQsIG5vIFxuICAgKiBmdXJ0aGVyIGludm9jYWJsZXMgd2lsbCBiZSBjYWxsZWQuXG4gICAqIFxuICAgKiBDeWNsaWMgZGVwZW5kZW5jaWVzIGJldHdlZW4gaW52b2NhYmxlcyBhcmUgbm90IHBlcm1pdHRlZCBhbmQgd2lsbCBjYXVzZSBgJHJlc29sdmVgXG4gICAqIHRvIHRocm93IGFuIGVycm9yLiBBcyBhIHNwZWNpYWwgY2FzZSwgYW4gaW5qZWN0YWJsZSBjYW4gZGVwZW5kIG9uIGEgcGFyYW1ldGVyIFxuICAgKiB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgdGhlIGluamVjdGFibGUsIHdoaWNoIHdpbGwgYmUgZnVsZmlsbGVkIGZyb20gdGhlIGBwYXJlbnRgIFxuICAgKiBpbmplY3RhYmxlIG9mIHRoZSBzYW1lIG5hbWUuIFRoaXMgYWxsb3dzIGluaGVyaXRlZCB2YWx1ZXMgdG8gYmUgZGVjb3JhdGVkLiBcbiAgICogTm90ZSB0aGF0IGluIHRoaXMgY2FzZSBhbnkgb3RoZXIgaW5qZWN0YWJsZSBpbiB0aGUgc2FtZSBgJHJlc29sdmVgIHdpdGggdGhlIHNhbWVcbiAgICogZGVwZW5kZW5jeSB3b3VsZCBzZWUgdGhlIGRlY29yYXRlZCB2YWx1ZSwgbm90IHRoZSBpbmhlcml0ZWQgdmFsdWUuXG4gICAqXG4gICAqIE5vdGUgdGhhdCBtaXNzaW5nIGRlcGVuZGVuY2llcyAtLSB1bmxpa2UgY3ljbGljIGRlcGVuZGVuY2llcyAtLSB3aWxsIGNhdXNlIGFuIFxuICAgKiAoYXN5bmNocm9ub3VzKSByZWplY3Rpb24gb2YgdGhlIGAkcmVzb2x2ZWAgcHJvbWlzZSByYXRoZXIgdGhhbiBhIChzeW5jaHJvbm91cykgXG4gICAqIGV4Y2VwdGlvbi5cbiAgICpcbiAgICogSW52b2NhYmxlcyBhcmUgaW52b2tlZCBlYWdlcmx5IGFzIHNvb24gYXMgYWxsIGRlcGVuZGVuY2llcyBhcmUgYXZhaWxhYmxlLiBcbiAgICogVGhpcyBpcyB0cnVlIGV2ZW4gZm9yIGRlcGVuZGVuY2llcyBpbmhlcml0ZWQgZnJvbSBhIGBwYXJlbnRgIGNhbGwgdG8gYCRyZXNvbHZlYC5cbiAgICpcbiAgICogQXMgYSBzcGVjaWFsIGNhc2UsIGFuIGludm9jYWJsZSBjYW4gYmUgYSBzdHJpbmcsIGluIHdoaWNoIGNhc2UgaXQgaXMgdGFrZW4gdG8gXG4gICAqIGJlIGEgc2VydmljZSBuYW1lIHRvIGJlIHBhc3NlZCB0byBgJGluamVjdG9yLmdldCgpYC4gVGhpcyBpcyBzdXBwb3J0ZWQgcHJpbWFyaWx5IFxuICAgKiBmb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgd2l0aCB0aGUgYHJlc29sdmVgIHByb3BlcnR5IG9mIGAkcm91dGVQcm92aWRlcmAgXG4gICAqIHJvdXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGludm9jYWJsZXMgZnVuY3Rpb25zIHRvIGludm9rZSBvciBcbiAgICogYCRpbmplY3RvcmAgc2VydmljZXMgdG8gZmV0Y2guXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBsb2NhbHMgIHZhbHVlcyB0byBtYWtlIGF2YWlsYWJsZSB0byB0aGUgaW5qZWN0YWJsZXNcbiAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudCAgYSBwcm9taXNlIHJldHVybmVkIGJ5IGFub3RoZXIgY2FsbCB0byBgJHJlc29sdmVgLlxuICAgKiBAcGFyYW0ge29iamVjdH0gc2VsZiAgdGhlIGB0aGlzYCBmb3IgdGhlIGludm9rZWQgbWV0aG9kc1xuICAgKiBAcmV0dXJuIHtvYmplY3R9IFByb21pc2UgZm9yIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSByZXNvbHZlZCByZXR1cm4gdmFsdWVcbiAgICogb2YgYWxsIGludm9jYWJsZXMsIGFzIHdlbGwgYXMgYW55IGluaGVyaXRlZCBhbmQgbG9jYWwgdmFsdWVzLlxuICAgKi9cbiAgdGhpcy5yZXNvbHZlID0gZnVuY3Rpb24gKGludm9jYWJsZXMsIGxvY2FscywgcGFyZW50LCBzZWxmKSB7XG4gICAgcmV0dXJuIHRoaXMuc3R1ZHkoaW52b2NhYmxlcykobG9jYWxzLCBwYXJlbnQsIHNlbGYpO1xuICB9O1xufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnV0aWwnKS5zZXJ2aWNlKCckcmVzb2x2ZScsICRSZXNvbHZlKTtcblxuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcbiAqXG4gKiBAcmVxdWlyZXMgJGh0dHBcbiAqIEByZXF1aXJlcyAkdGVtcGxhdGVDYWNoZVxuICogQHJlcXVpcmVzICRpbmplY3RvclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogU2VydmljZS4gTWFuYWdlcyBsb2FkaW5nIG9mIHRlbXBsYXRlcy5cbiAqL1xuJFRlbXBsYXRlRmFjdG9yeS4kaW5qZWN0ID0gWyckaHR0cCcsICckdGVtcGxhdGVDYWNoZScsICckaW5qZWN0b3InXTtcbmZ1bmN0aW9uICRUZW1wbGF0ZUZhY3RvcnkoICAkaHR0cCwgICAkdGVtcGxhdGVDYWNoZSwgICAkaW5qZWN0b3IpIHtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbUNvbmZpZ1xuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ3JlYXRlcyBhIHRlbXBsYXRlIGZyb20gYSBjb25maWd1cmF0aW9uIG9iamVjdC4gXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgQ29uZmlndXJhdGlvbiBvYmplY3QgZm9yIHdoaWNoIHRvIGxvYWQgYSB0ZW1wbGF0ZS4gXG4gICAqIFRoZSBmb2xsb3dpbmcgcHJvcGVydGllcyBhcmUgc2VhcmNoIGluIHRoZSBzcGVjaWZpZWQgb3JkZXIsIGFuZCB0aGUgZmlyc3Qgb25lIFxuICAgKiB0aGF0IGlzIGRlZmluZWQgaXMgdXNlZCB0byBjcmVhdGUgdGhlIHRlbXBsYXRlOlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IGNvbmZpZy50ZW1wbGF0ZSBodG1sIHN0cmluZyB0ZW1wbGF0ZSBvciBmdW5jdGlvbiB0byBcbiAgICogbG9hZCB2aWEge0BsaW5rIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVN0cmluZyBmcm9tU3RyaW5nfS5cbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBjb25maWcudGVtcGxhdGVVcmwgdXJsIHRvIGxvYWQgb3IgYSBmdW5jdGlvbiByZXR1cm5pbmcgXG4gICAqIHRoZSB1cmwgdG8gbG9hZCB2aWEge0BsaW5rIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVVybCBmcm9tVXJsfS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY29uZmlnLnRlbXBsYXRlUHJvdmlkZXIgZnVuY3Rpb24gdG8gaW52b2tlIHZpYSBcbiAgICoge0BsaW5rIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVByb3ZpZGVyIGZyb21Qcm92aWRlcn0uXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgIFBhcmFtZXRlcnMgdG8gcGFzcyB0byB0aGUgdGVtcGxhdGUgZnVuY3Rpb24uXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBsb2NhbHMgTG9jYWxzIHRvIHBhc3MgdG8gYGludm9rZWAgaWYgdGhlIHRlbXBsYXRlIGlzIGxvYWRlZCBcbiAgICogdmlhIGEgYHRlbXBsYXRlUHJvdmlkZXJgLiBEZWZhdWx0cyB0byBgeyBwYXJhbXM6IHBhcmFtcyB9YC5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfG9iamVjdH0gIFRoZSB0ZW1wbGF0ZSBodG1sIGFzIGEgc3RyaW5nLCBvciBhIHByb21pc2UgZm9yIFxuICAgKiB0aGF0IHN0cmluZyxvciBgbnVsbGAgaWYgbm8gdGVtcGxhdGUgaXMgY29uZmlndXJlZC5cbiAgICovXG4gIHRoaXMuZnJvbUNvbmZpZyA9IGZ1bmN0aW9uIChjb25maWcsIHBhcmFtcywgbG9jYWxzKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIGlzRGVmaW5lZChjb25maWcudGVtcGxhdGUpID8gdGhpcy5mcm9tU3RyaW5nKGNvbmZpZy50ZW1wbGF0ZSwgcGFyYW1zKSA6XG4gICAgICBpc0RlZmluZWQoY29uZmlnLnRlbXBsYXRlVXJsKSA/IHRoaXMuZnJvbVVybChjb25maWcudGVtcGxhdGVVcmwsIHBhcmFtcykgOlxuICAgICAgaXNEZWZpbmVkKGNvbmZpZy50ZW1wbGF0ZVByb3ZpZGVyKSA/IHRoaXMuZnJvbVByb3ZpZGVyKGNvbmZpZy50ZW1wbGF0ZVByb3ZpZGVyLCBwYXJhbXMsIGxvY2FscykgOlxuICAgICAgbnVsbFxuICAgICk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21TdHJpbmdcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIENyZWF0ZXMgYSB0ZW1wbGF0ZSBmcm9tIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb24gcmV0dXJuaW5nIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHRlbXBsYXRlIGh0bWwgdGVtcGxhdGUgYXMgYSBzdHJpbmcgb3IgZnVuY3Rpb24gdGhhdCBcbiAgICogcmV0dXJucyBhbiBodG1sIHRlbXBsYXRlIGFzIGEgc3RyaW5nLlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIFBhcmFtZXRlcnMgdG8gcGFzcyB0byB0aGUgdGVtcGxhdGUgZnVuY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ3xvYmplY3R9IFRoZSB0ZW1wbGF0ZSBodG1sIGFzIGEgc3RyaW5nLCBvciBhIHByb21pc2UgZm9yIHRoYXQgXG4gICAqIHN0cmluZy5cbiAgICovXG4gIHRoaXMuZnJvbVN0cmluZyA9IGZ1bmN0aW9uICh0ZW1wbGF0ZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuIGlzRnVuY3Rpb24odGVtcGxhdGUpID8gdGVtcGxhdGUocGFyYW1zKSA6IHRlbXBsYXRlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tVXJsXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XG4gICAqIFxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogTG9hZHMgYSB0ZW1wbGF0ZSBmcm9tIHRoZSBhIFVSTCB2aWEgYCRodHRwYCBhbmQgYCR0ZW1wbGF0ZUNhY2hlYC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8RnVuY3Rpb259IHVybCB1cmwgb2YgdGhlIHRlbXBsYXRlIHRvIGxvYWQsIG9yIGEgZnVuY3Rpb24gXG4gICAqIHRoYXQgcmV0dXJucyBhIHVybC5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBQYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGhlIHVybCBmdW5jdGlvbi5cbiAgICogQHJldHVybiB7c3RyaW5nfFByb21pc2UuPHN0cmluZz59IFRoZSB0ZW1wbGF0ZSBodG1sIGFzIGEgc3RyaW5nLCBvciBhIHByb21pc2UgXG4gICAqIGZvciB0aGF0IHN0cmluZy5cbiAgICovXG4gIHRoaXMuZnJvbVVybCA9IGZ1bmN0aW9uICh1cmwsIHBhcmFtcykge1xuICAgIGlmIChpc0Z1bmN0aW9uKHVybCkpIHVybCA9IHVybChwYXJhbXMpO1xuICAgIGlmICh1cmwgPT0gbnVsbCkgcmV0dXJuIG51bGw7XG4gICAgZWxzZSByZXR1cm4gJGh0dHBcbiAgICAgICAgLmdldCh1cmwsIHsgY2FjaGU6ICR0ZW1wbGF0ZUNhY2hlLCBoZWFkZXJzOiB7IEFjY2VwdDogJ3RleHQvaHRtbCcgfX0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7IHJldHVybiByZXNwb25zZS5kYXRhOyB9KTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVByb3ZpZGVyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBDcmVhdGVzIGEgdGVtcGxhdGUgYnkgaW52b2tpbmcgYW4gaW5qZWN0YWJsZSBwcm92aWRlciBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcHJvdmlkZXIgRnVuY3Rpb24gdG8gaW52b2tlIHZpYSBgJGluamVjdG9yLmludm9rZWBcbiAgICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBQYXJhbWV0ZXJzIGZvciB0aGUgdGVtcGxhdGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBsb2NhbHMgTG9jYWxzIHRvIHBhc3MgdG8gYGludm9rZWAuIERlZmF1bHRzIHRvIFxuICAgKiBgeyBwYXJhbXM6IHBhcmFtcyB9YC5cbiAgICogQHJldHVybiB7c3RyaW5nfFByb21pc2UuPHN0cmluZz59IFRoZSB0ZW1wbGF0ZSBodG1sIGFzIGEgc3RyaW5nLCBvciBhIHByb21pc2UgXG4gICAqIGZvciB0aGF0IHN0cmluZy5cbiAgICovXG4gIHRoaXMuZnJvbVByb3ZpZGVyID0gZnVuY3Rpb24gKHByb3ZpZGVyLCBwYXJhbXMsIGxvY2Fscykge1xuICAgIHJldHVybiAkaW5qZWN0b3IuaW52b2tlKHByb3ZpZGVyLCBudWxsLCBsb2NhbHMgfHwgeyBwYXJhbXM6IHBhcmFtcyB9KTtcbiAgfTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJykuc2VydmljZSgnJHRlbXBsYXRlRmFjdG9yeScsICRUZW1wbGF0ZUZhY3RvcnkpO1xuXG52YXIgJCRVTUZQOyAvLyByZWZlcmVuY2UgdG8gJFVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJcblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIE1hdGNoZXMgVVJMcyBhZ2FpbnN0IHBhdHRlcm5zIGFuZCBleHRyYWN0cyBuYW1lZCBwYXJhbWV0ZXJzIGZyb20gdGhlIHBhdGggb3IgdGhlIHNlYXJjaFxuICogcGFydCBvZiB0aGUgVVJMLiBBIFVSTCBwYXR0ZXJuIGNvbnNpc3RzIG9mIGEgcGF0aCBwYXR0ZXJuLCBvcHRpb25hbGx5IGZvbGxvd2VkIGJ5ICc/JyBhbmQgYSBsaXN0XG4gKiBvZiBzZWFyY2ggcGFyYW1ldGVycy4gTXVsdGlwbGUgc2VhcmNoIHBhcmFtZXRlciBuYW1lcyBhcmUgc2VwYXJhdGVkIGJ5ICcmJy4gU2VhcmNoIHBhcmFtZXRlcnNcbiAqIGRvIG5vdCBpbmZsdWVuY2Ugd2hldGhlciBvciBub3QgYSBVUkwgaXMgbWF0Y2hlZCwgYnV0IHRoZWlyIHZhbHVlcyBhcmUgcGFzc2VkIHRocm91Z2ggaW50b1xuICogdGhlIG1hdGNoZWQgcGFyYW1ldGVycyByZXR1cm5lZCBieSB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI21ldGhvZHNfZXhlYyBleGVjfS5cbiAqXG4gKiBQYXRoIHBhcmFtZXRlciBwbGFjZWhvbGRlcnMgY2FuIGJlIHNwZWNpZmllZCB1c2luZyBzaW1wbGUgY29sb24vY2F0Y2gtYWxsIHN5bnRheCBvciBjdXJseSBicmFjZVxuICogc3ludGF4LCB3aGljaCBvcHRpb25hbGx5IGFsbG93cyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgdGhlIHBhcmFtZXRlciB0byBiZSBzcGVjaWZpZWQ6XG4gKlxuICogKiBgJzonYCBuYW1lIC0gY29sb24gcGxhY2Vob2xkZXJcbiAqICogYCcqJ2AgbmFtZSAtIGNhdGNoLWFsbCBwbGFjZWhvbGRlclxuICogKiBgJ3snIG5hbWUgJ30nYCAtIGN1cmx5IHBsYWNlaG9sZGVyXG4gKiAqIGAneycgbmFtZSAnOicgcmVnZXhwfHR5cGUgJ30nYCAtIGN1cmx5IHBsYWNlaG9sZGVyIHdpdGggcmVnZXhwIG9yIHR5cGUgbmFtZS4gU2hvdWxkIHRoZVxuICogICByZWdleHAgaXRzZWxmIGNvbnRhaW4gY3VybHkgYnJhY2VzLCB0aGV5IG11c3QgYmUgaW4gbWF0Y2hlZCBwYWlycyBvciBlc2NhcGVkIHdpdGggYSBiYWNrc2xhc2guXG4gKlxuICogUGFyYW1ldGVyIG5hbWVzIG1heSBjb250YWluIG9ubHkgd29yZCBjaGFyYWN0ZXJzIChsYXRpbiBsZXR0ZXJzLCBkaWdpdHMsIGFuZCB1bmRlcnNjb3JlKSBhbmRcbiAqIG11c3QgYmUgdW5pcXVlIHdpdGhpbiB0aGUgcGF0dGVybiAoYWNyb3NzIGJvdGggcGF0aCBhbmQgc2VhcmNoIHBhcmFtZXRlcnMpLiBGb3IgY29sb25cbiAqIHBsYWNlaG9sZGVycyBvciBjdXJseSBwbGFjZWhvbGRlcnMgd2l0aG91dCBhbiBleHBsaWNpdCByZWdleHAsIGEgcGF0aCBwYXJhbWV0ZXIgbWF0Y2hlcyBhbnlcbiAqIG51bWJlciBvZiBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gJy8nLiBGb3IgY2F0Y2gtYWxsIHBsYWNlaG9sZGVycyB0aGUgcGF0aCBwYXJhbWV0ZXIgbWF0Y2hlc1xuICogYW55IG51bWJlciBvZiBjaGFyYWN0ZXJzLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICogYCcvaGVsbG8vJ2AgLSBNYXRjaGVzIG9ubHkgaWYgdGhlIHBhdGggaXMgZXhhY3RseSAnL2hlbGxvLycuIFRoZXJlIGlzIG5vIHNwZWNpYWwgdHJlYXRtZW50IGZvclxuICogICB0cmFpbGluZyBzbGFzaGVzLCBhbmQgcGF0dGVybnMgaGF2ZSB0byBtYXRjaCB0aGUgZW50aXJlIHBhdGgsIG5vdCBqdXN0IGEgcHJlZml4LlxuICogKiBgJy91c2VyLzppZCdgIC0gTWF0Y2hlcyAnL3VzZXIvYm9iJyBvciAnL3VzZXIvMTIzNCEhIScgb3IgZXZlbiAnL3VzZXIvJyBidXQgbm90ICcvdXNlcicgb3JcbiAqICAgJy91c2VyL2JvYi9kZXRhaWxzJy4gVGhlIHNlY29uZCBwYXRoIHNlZ21lbnQgd2lsbCBiZSBjYXB0dXJlZCBhcyB0aGUgcGFyYW1ldGVyICdpZCcuXG4gKiAqIGAnL3VzZXIve2lkfSdgIC0gU2FtZSBhcyB0aGUgcHJldmlvdXMgZXhhbXBsZSwgYnV0IHVzaW5nIGN1cmx5IGJyYWNlIHN5bnRheC5cbiAqICogYCcvdXNlci97aWQ6W14vXSp9J2AgLSBTYW1lIGFzIHRoZSBwcmV2aW91cyBleGFtcGxlLlxuICogKiBgJy91c2VyL3tpZDpbMC05YS1mQS1GXXsxLDh9fSdgIC0gU2ltaWxhciB0byB0aGUgcHJldmlvdXMgZXhhbXBsZSwgYnV0IG9ubHkgbWF0Y2hlcyBpZiB0aGUgaWRcbiAqICAgcGFyYW1ldGVyIGNvbnNpc3RzIG9mIDEgdG8gOCBoZXggZGlnaXRzLlxuICogKiBgJy9maWxlcy97cGF0aDouKn0nYCAtIE1hdGNoZXMgYW55IFVSTCBzdGFydGluZyB3aXRoICcvZmlsZXMvJyBhbmQgY2FwdHVyZXMgdGhlIHJlc3Qgb2YgdGhlXG4gKiAgIHBhdGggaW50byB0aGUgcGFyYW1ldGVyICdwYXRoJy5cbiAqICogYCcvZmlsZXMvKnBhdGgnYCAtIGRpdHRvLlxuICogKiBgJy9jYWxlbmRhci97c3RhcnQ6ZGF0ZX0nYCAtIE1hdGNoZXMgXCIvY2FsZW5kYXIvMjAxNC0xMS0xMlwiIChiZWNhdXNlIHRoZSBwYXR0ZXJuIGRlZmluZWRcbiAqICAgaW4gdGhlIGJ1aWx0LWluICBgZGF0ZWAgVHlwZSBtYXRjaGVzIGAyMDE0LTExLTEyYCkgYW5kIHByb3ZpZGVzIGEgRGF0ZSBvYmplY3QgaW4gJHN0YXRlUGFyYW1zLnN0YXJ0XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm4gIFRoZSBwYXR0ZXJuIHRvIGNvbXBpbGUgaW50byBhIG1hdGNoZXIuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnICBBIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGhhc2g6XG4gKiBAcGFyYW0ge09iamVjdD19IHBhcmVudE1hdGNoZXIgVXNlZCB0byBjb25jYXRlbmF0ZSB0aGUgcGF0dGVybi9jb25maWcgb250b1xuICogICBhbiBleGlzdGluZyBVcmxNYXRjaGVyXG4gKlxuICogKiBgY2FzZUluc2Vuc2l0aXZlYCAtIGB0cnVlYCBpZiBVUkwgbWF0Y2hpbmcgc2hvdWxkIGJlIGNhc2UgaW5zZW5zaXRpdmUsIG90aGVyd2lzZSBgZmFsc2VgLCB0aGUgZGVmYXVsdCB2YWx1ZSAoZm9yIGJhY2t3YXJkIGNvbXBhdGliaWxpdHkpIGlzIGBmYWxzZWAuXG4gKiAqIGBzdHJpY3RgIC0gYGZhbHNlYCBpZiBtYXRjaGluZyBhZ2FpbnN0IGEgVVJMIHdpdGggYSB0cmFpbGluZyBzbGFzaCBzaG91bGQgYmUgdHJlYXRlZCBhcyBlcXVpdmFsZW50IHRvIGEgVVJMIHdpdGhvdXQgYSB0cmFpbGluZyBzbGFzaCwgdGhlIGRlZmF1bHQgdmFsdWUgaXMgYHRydWVgLlxuICpcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBwcmVmaXggIEEgc3RhdGljIHByZWZpeCBvZiB0aGlzIHBhdHRlcm4uIFRoZSBtYXRjaGVyIGd1YXJhbnRlZXMgdGhhdCBhbnlcbiAqICAgVVJMIG1hdGNoaW5nIHRoaXMgbWF0Y2hlciAoaS5lLiBhbnkgc3RyaW5nIGZvciB3aGljaCB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI21ldGhvZHNfZXhlYyBleGVjKCl9IHJldHVybnNcbiAqICAgbm9uLW51bGwpIHdpbGwgc3RhcnQgd2l0aCB0aGlzIHByZWZpeC5cbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc291cmNlICBUaGUgcGF0dGVybiB0aGF0IHdhcyBwYXNzZWQgaW50byB0aGUgY29uc3RydWN0b3JcbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc291cmNlUGF0aCAgVGhlIHBhdGggcG9ydGlvbiBvZiB0aGUgc291cmNlIHByb3BlcnR5XG4gKlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNvdXJjZVNlYXJjaCAgVGhlIHNlYXJjaCBwb3J0aW9uIG9mIHRoZSBzb3VyY2UgcHJvcGVydHlcbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcmVnZXggIFRoZSBjb25zdHJ1Y3RlZCByZWdleCB0aGF0IHdpbGwgYmUgdXNlZCB0byBtYXRjaCBhZ2FpbnN0IHRoZSB1cmwgd2hlblxuICogICBpdCBpcyB0aW1lIHRvIGRldGVybWluZSB3aGljaCB1cmwgd2lsbCBtYXRjaC5cbiAqXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAgTmV3IGBVcmxNYXRjaGVyYCBvYmplY3RcbiAqL1xuZnVuY3Rpb24gVXJsTWF0Y2hlcihwYXR0ZXJuLCBjb25maWcsIHBhcmVudE1hdGNoZXIpIHtcbiAgY29uZmlnID0gZXh0ZW5kKHsgcGFyYW1zOiB7fSB9LCBpc09iamVjdChjb25maWcpID8gY29uZmlnIDoge30pO1xuXG4gIC8vIEZpbmQgYWxsIHBsYWNlaG9sZGVycyBhbmQgY3JlYXRlIGEgY29tcGlsZWQgcGF0dGVybiwgdXNpbmcgZWl0aGVyIGNsYXNzaWMgb3IgY3VybHkgc3ludGF4OlxuICAvLyAgICcqJyBuYW1lXG4gIC8vICAgJzonIG5hbWVcbiAgLy8gICAneycgbmFtZSAnfSdcbiAgLy8gICAneycgbmFtZSAnOicgcmVnZXhwICd9J1xuICAvLyBUaGUgcmVndWxhciBleHByZXNzaW9uIGlzIHNvbWV3aGF0IGNvbXBsaWNhdGVkIGR1ZSB0byB0aGUgbmVlZCB0byBhbGxvdyBjdXJseSBicmFjZXNcbiAgLy8gaW5zaWRlIHRoZSByZWd1bGFyIGV4cHJlc3Npb24uIFRoZSBwbGFjZWhvbGRlciByZWdleHAgYnJlYWtzIGRvd24gYXMgZm9sbG93czpcbiAgLy8gICAgKFs6Kl0pKFtcXHdcXFtcXF1dKykgICAgICAgICAgICAgIC0gY2xhc3NpYyBwbGFjZWhvbGRlciAoJDEgLyAkMikgKHNlYXJjaCB2ZXJzaW9uIGhhcyAtIGZvciBzbmFrZS1jYXNlKVxuICAvLyAgICBcXHsoW1xcd1xcW1xcXV0rKSg/OlxcOlxccyooIC4uLiApKT9cXH0gIC0gY3VybHkgYnJhY2UgcGxhY2Vob2xkZXIgKCQzKSB3aXRoIG9wdGlvbmFsIHJlZ2V4cC90eXBlIC4uLiAoJDQpIChzZWFyY2ggdmVyc2lvbiBoYXMgLSBmb3Igc25ha2UtY2FzZVxuICAvLyAgICAoPzogLi4uIHwgLi4uIHwgLi4uICkrICAgICAgICAgLSB0aGUgcmVnZXhwIGNvbnNpc3RzIG9mIGFueSBudW1iZXIgb2YgYXRvbXMsIGFuIGF0b20gYmVpbmcgZWl0aGVyXG4gIC8vICAgIFtee31cXFxcXSsgICAgICAgICAgICAgICAgICAgICAgIC0gYW55dGhpbmcgb3RoZXIgdGhhbiBjdXJseSBicmFjZXMgb3IgYmFja3NsYXNoXG4gIC8vICAgIFxcXFwuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gYSBiYWNrc2xhc2ggZXNjYXBlXG4gIC8vICAgIFxceyg/Oltee31cXFxcXSt8XFxcXC4pKlxcfSAgICAgICAgICAtIGEgbWF0Y2hlZCBzZXQgb2YgY3VybHkgYnJhY2VzIGNvbnRhaW5pbmcgb3RoZXIgYXRvbXNcbiAgdmFyIHBsYWNlaG9sZGVyICAgICAgID0gLyhbOipdKShbXFx3XFxbXFxdXSspfFxceyhbXFx3XFxbXFxdXSspKD86XFw6XFxzKigoPzpbXnt9XFxcXF0rfFxcXFwufFxceyg/Oltee31cXFxcXSt8XFxcXC4pKlxcfSkrKSk/XFx9L2csXG4gICAgICBzZWFyY2hQbGFjZWhvbGRlciA9IC8oWzpdPykoW1xcd1xcW1xcXS4tXSspfFxceyhbXFx3XFxbXFxdLi1dKykoPzpcXDpcXHMqKCg/Oltee31cXFxcXSt8XFxcXC58XFx7KD86W157fVxcXFxdK3xcXFxcLikqXFx9KSspKT9cXH0vZyxcbiAgICAgIGNvbXBpbGVkID0gJ14nLCBsYXN0ID0gMCwgbSxcbiAgICAgIHNlZ21lbnRzID0gdGhpcy5zZWdtZW50cyA9IFtdLFxuICAgICAgcGFyZW50UGFyYW1zID0gcGFyZW50TWF0Y2hlciA/IHBhcmVudE1hdGNoZXIucGFyYW1zIDoge30sXG4gICAgICBwYXJhbXMgPSB0aGlzLnBhcmFtcyA9IHBhcmVudE1hdGNoZXIgPyBwYXJlbnRNYXRjaGVyLnBhcmFtcy4kJG5ldygpIDogbmV3ICQkVU1GUC5QYXJhbVNldCgpLFxuICAgICAgcGFyYW1OYW1lcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIGFkZFBhcmFtZXRlcihpZCwgdHlwZSwgY29uZmlnLCBsb2NhdGlvbikge1xuICAgIHBhcmFtTmFtZXMucHVzaChpZCk7XG4gICAgaWYgKHBhcmVudFBhcmFtc1tpZF0pIHJldHVybiBwYXJlbnRQYXJhbXNbaWRdO1xuICAgIGlmICghL15cXHcrKFstLl0rXFx3KykqKD86XFxbXFxdKT8kLy50ZXN0KGlkKSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJhbWV0ZXIgbmFtZSAnXCIgKyBpZCArIFwiJyBpbiBwYXR0ZXJuICdcIiArIHBhdHRlcm4gKyBcIidcIik7XG4gICAgaWYgKHBhcmFtc1tpZF0pIHRocm93IG5ldyBFcnJvcihcIkR1cGxpY2F0ZSBwYXJhbWV0ZXIgbmFtZSAnXCIgKyBpZCArIFwiJyBpbiBwYXR0ZXJuICdcIiArIHBhdHRlcm4gKyBcIidcIik7XG4gICAgcGFyYW1zW2lkXSA9IG5ldyAkJFVNRlAuUGFyYW0oaWQsIHR5cGUsIGNvbmZpZywgbG9jYXRpb24pO1xuICAgIHJldHVybiBwYXJhbXNbaWRdO1xuICB9XG5cbiAgZnVuY3Rpb24gcXVvdGVSZWdFeHAoc3RyaW5nLCBwYXR0ZXJuLCBzcXVhc2gsIG9wdGlvbmFsKSB7XG4gICAgdmFyIHN1cnJvdW5kUGF0dGVybiA9IFsnJywnJ10sIHJlc3VsdCA9IHN0cmluZy5yZXBsYWNlKC9bXFxcXFxcW1xcXVxcXiQqKz8uKCl8e31dL2csIFwiXFxcXCQmXCIpO1xuICAgIGlmICghcGF0dGVybikgcmV0dXJuIHJlc3VsdDtcbiAgICBzd2l0Y2goc3F1YXNoKSB7XG4gICAgICBjYXNlIGZhbHNlOiBzdXJyb3VuZFBhdHRlcm4gPSBbJygnLCAnKScgKyAob3B0aW9uYWwgPyBcIj9cIiA6IFwiXCIpXTsgYnJlYWs7XG4gICAgICBjYXNlIHRydWU6XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9cXC8kLywgJycpO1xuICAgICAgICBzdXJyb3VuZFBhdHRlcm4gPSBbJyg/OlxcLygnLCAnKXxcXC8pPyddO1xuICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OiAgICBzdXJyb3VuZFBhdHRlcm4gPSBbJygnICsgc3F1YXNoICsgXCJ8XCIsICcpPyddOyBicmVhaztcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdCArIHN1cnJvdW5kUGF0dGVyblswXSArIHBhdHRlcm4gKyBzdXJyb3VuZFBhdHRlcm5bMV07XG4gIH1cblxuICB0aGlzLnNvdXJjZSA9IHBhdHRlcm47XG5cbiAgLy8gU3BsaXQgaW50byBzdGF0aWMgc2VnbWVudHMgc2VwYXJhdGVkIGJ5IHBhdGggcGFyYW1ldGVyIHBsYWNlaG9sZGVycy5cbiAgLy8gVGhlIG51bWJlciBvZiBzZWdtZW50cyBpcyBhbHdheXMgMSBtb3JlIHRoYW4gdGhlIG51bWJlciBvZiBwYXJhbWV0ZXJzLlxuICBmdW5jdGlvbiBtYXRjaERldGFpbHMobSwgaXNTZWFyY2gpIHtcbiAgICB2YXIgaWQsIHJlZ2V4cCwgc2VnbWVudCwgdHlwZSwgY2ZnLCBhcnJheU1vZGU7XG4gICAgaWQgICAgICAgICAgPSBtWzJdIHx8IG1bM107IC8vIElFWzc4XSByZXR1cm5zICcnIGZvciB1bm1hdGNoZWQgZ3JvdXBzIGluc3RlYWQgb2YgbnVsbFxuICAgIGNmZyAgICAgICAgID0gY29uZmlnLnBhcmFtc1tpZF07XG4gICAgc2VnbWVudCAgICAgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0LCBtLmluZGV4KTtcbiAgICByZWdleHAgICAgICA9IGlzU2VhcmNoID8gbVs0XSA6IG1bNF0gfHwgKG1bMV0gPT0gJyonID8gJy4qJyA6IG51bGwpO1xuXG4gICAgaWYgKHJlZ2V4cCkge1xuICAgICAgdHlwZSAgICAgID0gJCRVTUZQLnR5cGUocmVnZXhwKSB8fCBpbmhlcml0KCQkVU1GUC50eXBlKFwic3RyaW5nXCIpLCB7IHBhdHRlcm46IG5ldyBSZWdFeHAocmVnZXhwLCBjb25maWcuY2FzZUluc2Vuc2l0aXZlID8gJ2knIDogdW5kZWZpbmVkKSB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGlkLCByZWdleHA6IHJlZ2V4cCwgc2VnbWVudDogc2VnbWVudCwgdHlwZTogdHlwZSwgY2ZnOiBjZmdcbiAgICB9O1xuICB9XG5cbiAgdmFyIHAsIHBhcmFtLCBzZWdtZW50O1xuICB3aGlsZSAoKG0gPSBwbGFjZWhvbGRlci5leGVjKHBhdHRlcm4pKSkge1xuICAgIHAgPSBtYXRjaERldGFpbHMobSwgZmFsc2UpO1xuICAgIGlmIChwLnNlZ21lbnQuaW5kZXhPZignPycpID49IDApIGJyZWFrOyAvLyB3ZSdyZSBpbnRvIHRoZSBzZWFyY2ggcGFydFxuXG4gICAgcGFyYW0gPSBhZGRQYXJhbWV0ZXIocC5pZCwgcC50eXBlLCBwLmNmZywgXCJwYXRoXCIpO1xuICAgIGNvbXBpbGVkICs9IHF1b3RlUmVnRXhwKHAuc2VnbWVudCwgcGFyYW0udHlwZS5wYXR0ZXJuLnNvdXJjZSwgcGFyYW0uc3F1YXNoLCBwYXJhbS5pc09wdGlvbmFsKTtcbiAgICBzZWdtZW50cy5wdXNoKHAuc2VnbWVudCk7XG4gICAgbGFzdCA9IHBsYWNlaG9sZGVyLmxhc3RJbmRleDtcbiAgfVxuICBzZWdtZW50ID0gcGF0dGVybi5zdWJzdHJpbmcobGFzdCk7XG5cbiAgLy8gRmluZCBhbnkgc2VhcmNoIHBhcmFtZXRlciBuYW1lcyBhbmQgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgbGFzdCBzZWdtZW50XG4gIHZhciBpID0gc2VnbWVudC5pbmRleE9mKCc/Jyk7XG5cbiAgaWYgKGkgPj0gMCkge1xuICAgIHZhciBzZWFyY2ggPSB0aGlzLnNvdXJjZVNlYXJjaCA9IHNlZ21lbnQuc3Vic3RyaW5nKGkpO1xuICAgIHNlZ21lbnQgPSBzZWdtZW50LnN1YnN0cmluZygwLCBpKTtcbiAgICB0aGlzLnNvdXJjZVBhdGggPSBwYXR0ZXJuLnN1YnN0cmluZygwLCBsYXN0ICsgaSk7XG5cbiAgICBpZiAoc2VhcmNoLmxlbmd0aCA+IDApIHtcbiAgICAgIGxhc3QgPSAwO1xuICAgICAgd2hpbGUgKChtID0gc2VhcmNoUGxhY2Vob2xkZXIuZXhlYyhzZWFyY2gpKSkge1xuICAgICAgICBwID0gbWF0Y2hEZXRhaWxzKG0sIHRydWUpO1xuICAgICAgICBwYXJhbSA9IGFkZFBhcmFtZXRlcihwLmlkLCBwLnR5cGUsIHAuY2ZnLCBcInNlYXJjaFwiKTtcbiAgICAgICAgbGFzdCA9IHBsYWNlaG9sZGVyLmxhc3RJbmRleDtcbiAgICAgICAgLy8gY2hlY2sgaWYgPyZcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zb3VyY2VQYXRoID0gcGF0dGVybjtcbiAgICB0aGlzLnNvdXJjZVNlYXJjaCA9ICcnO1xuICB9XG5cbiAgY29tcGlsZWQgKz0gcXVvdGVSZWdFeHAoc2VnbWVudCkgKyAoY29uZmlnLnN0cmljdCA9PT0gZmFsc2UgPyAnXFwvPycgOiAnJykgKyAnJCc7XG4gIHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG5cbiAgdGhpcy5yZWdleHAgPSBuZXcgUmVnRXhwKGNvbXBpbGVkLCBjb25maWcuY2FzZUluc2Vuc2l0aXZlID8gJ2knIDogdW5kZWZpbmVkKTtcbiAgdGhpcy5wcmVmaXggPSBzZWdtZW50c1swXTtcbiAgdGhpcy4kJHBhcmFtTmFtZXMgPSBwYXJhbU5hbWVzO1xufVxuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI2NvbmNhdFxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUmV0dXJucyBhIG5ldyBtYXRjaGVyIGZvciBhIHBhdHRlcm4gY29uc3RydWN0ZWQgYnkgYXBwZW5kaW5nIHRoZSBwYXRoIHBhcnQgYW5kIGFkZGluZyB0aGVcbiAqIHNlYXJjaCBwYXJhbWV0ZXJzIG9mIHRoZSBzcGVjaWZpZWQgcGF0dGVybiB0byB0aGlzIHBhdHRlcm4uIFRoZSBjdXJyZW50IHBhdHRlcm4gaXMgbm90XG4gKiBtb2RpZmllZC4gVGhpcyBjYW4gYmUgdW5kZXJzdG9vZCBhcyBjcmVhdGluZyBhIHBhdHRlcm4gZm9yIFVSTHMgdGhhdCBhcmUgcmVsYXRpdmUgdG8gKG9yXG4gKiBzdWZmaXhlcyBvZikgdGhlIGN1cnJlbnQgcGF0dGVybi5cbiAqXG4gKiBAZXhhbXBsZVxuICogVGhlIGZvbGxvd2luZyB0d28gbWF0Y2hlcnMgYXJlIGVxdWl2YWxlbnQ6XG4gKiA8cHJlPlxuICogbmV3IFVybE1hdGNoZXIoJy91c2VyL3tpZH0/cScpLmNvbmNhdCgnL2RldGFpbHM/ZGF0ZScpO1xuICogbmV3IFVybE1hdGNoZXIoJy91c2VyL3tpZH0vZGV0YWlscz9xJmRhdGUnKTtcbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuICBUaGUgcGF0dGVybiB0byBhcHBlbmQuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnICBBbiBvYmplY3QgaGFzaCBvZiB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIG1hdGNoZXIuXG4gKiBAcmV0dXJucyB7VXJsTWF0Y2hlcn0gIEEgbWF0Y2hlciBmb3IgdGhlIGNvbmNhdGVuYXRlZCBwYXR0ZXJuLlxuICovXG5VcmxNYXRjaGVyLnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbiAocGF0dGVybiwgY29uZmlnKSB7XG4gIC8vIEJlY2F1c2Ugb3JkZXIgb2Ygc2VhcmNoIHBhcmFtZXRlcnMgaXMgaXJyZWxldmFudCwgd2UgY2FuIGFkZCBvdXIgb3duIHNlYXJjaFxuICAvLyBwYXJhbWV0ZXJzIHRvIHRoZSBlbmQgb2YgdGhlIG5ldyBwYXR0ZXJuLiBQYXJzZSB0aGUgbmV3IHBhdHRlcm4gYnkgaXRzZWxmXG4gIC8vIGFuZCB0aGVuIGpvaW4gdGhlIGJpdHMgdG9nZXRoZXIsIGJ1dCBpdCdzIG11Y2ggZWFzaWVyIHRvIGRvIHRoaXMgb24gYSBzdHJpbmcgbGV2ZWwuXG4gIHZhciBkZWZhdWx0Q29uZmlnID0ge1xuICAgIGNhc2VJbnNlbnNpdGl2ZTogJCRVTUZQLmNhc2VJbnNlbnNpdGl2ZSgpLFxuICAgIHN0cmljdDogJCRVTUZQLnN0cmljdE1vZGUoKSxcbiAgICBzcXVhc2g6ICQkVU1GUC5kZWZhdWx0U3F1YXNoUG9saWN5KClcbiAgfTtcbiAgcmV0dXJuIG5ldyBVcmxNYXRjaGVyKHRoaXMuc291cmNlUGF0aCArIHBhdHRlcm4gKyB0aGlzLnNvdXJjZVNlYXJjaCwgZXh0ZW5kKGRlZmF1bHRDb25maWcsIGNvbmZpZyksIHRoaXMpO1xufTtcblxuVXJsTWF0Y2hlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnNvdXJjZTtcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIjZXhlY1xuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGVzdHMgdGhlIHNwZWNpZmllZCBwYXRoIGFnYWluc3QgdGhpcyBtYXRjaGVyLCBhbmQgcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgY2FwdHVyZWRcbiAqIHBhcmFtZXRlciB2YWx1ZXMsIG9yIG51bGwgaWYgdGhlIHBhdGggZG9lcyBub3QgbWF0Y2guIFRoZSByZXR1cm5lZCBvYmplY3QgY29udGFpbnMgdGhlIHZhbHVlc1xuICogb2YgYW55IHNlYXJjaCBwYXJhbWV0ZXJzIHRoYXQgYXJlIG1lbnRpb25lZCBpbiB0aGUgcGF0dGVybiwgYnV0IHRoZWlyIHZhbHVlIG1heSBiZSBudWxsIGlmXG4gKiB0aGV5IGFyZSBub3QgcHJlc2VudCBpbiBgc2VhcmNoUGFyYW1zYC4gVGhpcyBtZWFucyB0aGF0IHNlYXJjaCBwYXJhbWV0ZXJzIGFyZSBhbHdheXMgdHJlYXRlZFxuICogYXMgb3B0aW9uYWwuXG4gKlxuICogQGV4YW1wbGVcbiAqIDxwcmU+XG4gKiBuZXcgVXJsTWF0Y2hlcignL3VzZXIve2lkfT9xJnInKS5leGVjKCcvdXNlci9ib2InLCB7XG4gKiAgIHg6ICcxJywgcTogJ2hlbGxvJ1xuICogfSk7XG4gKiAvLyByZXR1cm5zIHsgaWQ6ICdib2InLCBxOiAnaGVsbG8nLCByOiBudWxsIH1cbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoICBUaGUgVVJMIHBhdGggdG8gbWF0Y2gsIGUuZy4gYCRsb2NhdGlvbi5wYXRoKClgLlxuICogQHBhcmFtIHtPYmplY3R9IHNlYXJjaFBhcmFtcyAgVVJMIHNlYXJjaCBwYXJhbWV0ZXJzLCBlLmcuIGAkbG9jYXRpb24uc2VhcmNoKClgLlxuICogQHJldHVybnMge09iamVjdH0gIFRoZSBjYXB0dXJlZCBwYXJhbWV0ZXIgdmFsdWVzLlxuICovXG5VcmxNYXRjaGVyLnByb3RvdHlwZS5leGVjID0gZnVuY3Rpb24gKHBhdGgsIHNlYXJjaFBhcmFtcykge1xuICB2YXIgbSA9IHRoaXMucmVnZXhwLmV4ZWMocGF0aCk7XG4gIGlmICghbSkgcmV0dXJuIG51bGw7XG4gIHNlYXJjaFBhcmFtcyA9IHNlYXJjaFBhcmFtcyB8fCB7fTtcblxuICB2YXIgcGFyYW1OYW1lcyA9IHRoaXMucGFyYW1ldGVycygpLCBuVG90YWwgPSBwYXJhbU5hbWVzLmxlbmd0aCxcbiAgICBuUGF0aCA9IHRoaXMuc2VnbWVudHMubGVuZ3RoIC0gMSxcbiAgICB2YWx1ZXMgPSB7fSwgaSwgaiwgY2ZnLCBwYXJhbU5hbWU7XG5cbiAgaWYgKG5QYXRoICE9PSBtLmxlbmd0aCAtIDEpIHRocm93IG5ldyBFcnJvcihcIlVuYmFsYW5jZWQgY2FwdHVyZSBncm91cCBpbiByb3V0ZSAnXCIgKyB0aGlzLnNvdXJjZSArIFwiJ1wiKTtcblxuICBmdW5jdGlvbiBkZWNvZGVQYXRoQXJyYXkoc3RyaW5nKSB7XG4gICAgZnVuY3Rpb24gcmV2ZXJzZVN0cmluZyhzdHIpIHsgcmV0dXJuIHN0ci5zcGxpdChcIlwiKS5yZXZlcnNlKCkuam9pbihcIlwiKTsgfVxuICAgIGZ1bmN0aW9uIHVucXVvdGVEYXNoZXMoc3RyKSB7IHJldHVybiBzdHIucmVwbGFjZSgvXFxcXC0vZywgXCItXCIpOyB9XG5cbiAgICB2YXIgc3BsaXQgPSByZXZlcnNlU3RyaW5nKHN0cmluZykuc3BsaXQoLy0oPyFcXFxcKS8pO1xuICAgIHZhciBhbGxSZXZlcnNlZCA9IG1hcChzcGxpdCwgcmV2ZXJzZVN0cmluZyk7XG4gICAgcmV0dXJuIG1hcChhbGxSZXZlcnNlZCwgdW5xdW90ZURhc2hlcykucmV2ZXJzZSgpO1xuICB9XG5cbiAgdmFyIHBhcmFtLCBwYXJhbVZhbDtcbiAgZm9yIChpID0gMDsgaSA8IG5QYXRoOyBpKyspIHtcbiAgICBwYXJhbU5hbWUgPSBwYXJhbU5hbWVzW2ldO1xuICAgIHBhcmFtID0gdGhpcy5wYXJhbXNbcGFyYW1OYW1lXTtcbiAgICBwYXJhbVZhbCA9IG1baSsxXTtcbiAgICAvLyBpZiB0aGUgcGFyYW0gdmFsdWUgbWF0Y2hlcyBhIHByZS1yZXBsYWNlIHBhaXIsIHJlcGxhY2UgdGhlIHZhbHVlIGJlZm9yZSBkZWNvZGluZy5cbiAgICBmb3IgKGogPSAwOyBqIDwgcGFyYW0ucmVwbGFjZS5sZW5ndGg7IGorKykge1xuICAgICAgaWYgKHBhcmFtLnJlcGxhY2Vbal0uZnJvbSA9PT0gcGFyYW1WYWwpIHBhcmFtVmFsID0gcGFyYW0ucmVwbGFjZVtqXS50bztcbiAgICB9XG4gICAgaWYgKHBhcmFtVmFsICYmIHBhcmFtLmFycmF5ID09PSB0cnVlKSBwYXJhbVZhbCA9IGRlY29kZVBhdGhBcnJheShwYXJhbVZhbCk7XG4gICAgaWYgKGlzRGVmaW5lZChwYXJhbVZhbCkpIHBhcmFtVmFsID0gcGFyYW0udHlwZS5kZWNvZGUocGFyYW1WYWwpO1xuICAgIHZhbHVlc1twYXJhbU5hbWVdID0gcGFyYW0udmFsdWUocGFyYW1WYWwpO1xuICB9XG4gIGZvciAoLyoqLzsgaSA8IG5Ub3RhbDsgaSsrKSB7XG4gICAgcGFyYW1OYW1lID0gcGFyYW1OYW1lc1tpXTtcbiAgICB2YWx1ZXNbcGFyYW1OYW1lXSA9IHRoaXMucGFyYW1zW3BhcmFtTmFtZV0udmFsdWUoc2VhcmNoUGFyYW1zW3BhcmFtTmFtZV0pO1xuICAgIHBhcmFtID0gdGhpcy5wYXJhbXNbcGFyYW1OYW1lXTtcbiAgICBwYXJhbVZhbCA9IHNlYXJjaFBhcmFtc1twYXJhbU5hbWVdO1xuICAgIGZvciAoaiA9IDA7IGogPCBwYXJhbS5yZXBsYWNlLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZiAocGFyYW0ucmVwbGFjZVtqXS5mcm9tID09PSBwYXJhbVZhbCkgcGFyYW1WYWwgPSBwYXJhbS5yZXBsYWNlW2pdLnRvO1xuICAgIH1cbiAgICBpZiAoaXNEZWZpbmVkKHBhcmFtVmFsKSkgcGFyYW1WYWwgPSBwYXJhbS50eXBlLmRlY29kZShwYXJhbVZhbCk7XG4gICAgdmFsdWVzW3BhcmFtTmFtZV0gPSBwYXJhbS52YWx1ZShwYXJhbVZhbCk7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNwYXJhbWV0ZXJzXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBSZXR1cm5zIHRoZSBuYW1lcyBvZiBhbGwgcGF0aCBhbmQgc2VhcmNoIHBhcmFtZXRlcnMgb2YgdGhpcyBwYXR0ZXJuIGluIGFuIHVuc3BlY2lmaWVkIG9yZGVyLlxuICpcbiAqIEByZXR1cm5zIHtBcnJheS48c3RyaW5nPn0gIEFuIGFycmF5IG9mIHBhcmFtZXRlciBuYW1lcy4gTXVzdCBiZSB0cmVhdGVkIGFzIHJlYWQtb25seS4gSWYgdGhlXG4gKiAgICBwYXR0ZXJuIGhhcyBubyBwYXJhbWV0ZXJzLCBhbiBlbXB0eSBhcnJheSBpcyByZXR1cm5lZC5cbiAqL1xuVXJsTWF0Y2hlci5wcm90b3R5cGUucGFyYW1ldGVycyA9IGZ1bmN0aW9uIChwYXJhbSkge1xuICBpZiAoIWlzRGVmaW5lZChwYXJhbSkpIHJldHVybiB0aGlzLiQkcGFyYW1OYW1lcztcbiAgcmV0dXJuIHRoaXMucGFyYW1zW3BhcmFtXSB8fCBudWxsO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciN2YWxpZGF0ZXNcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENoZWNrcyBhbiBvYmplY3QgaGFzaCBvZiBwYXJhbWV0ZXJzIHRvIHZhbGlkYXRlIHRoZWlyIGNvcnJlY3RuZXNzIGFjY29yZGluZyB0byB0aGUgcGFyYW1ldGVyXG4gKiB0eXBlcyBvZiB0aGlzIGBVcmxNYXRjaGVyYC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIFRoZSBvYmplY3QgaGFzaCBvZiBwYXJhbWV0ZXJzIHRvIHZhbGlkYXRlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBwYXJhbXNgIHZhbGlkYXRlcywgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKi9cblVybE1hdGNoZXIucHJvdG90eXBlLnZhbGlkYXRlcyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgcmV0dXJuIHRoaXMucGFyYW1zLiQkdmFsaWRhdGVzKHBhcmFtcyk7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI2Zvcm1hdFxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQ3JlYXRlcyBhIFVSTCB0aGF0IG1hdGNoZXMgdGhpcyBwYXR0ZXJuIGJ5IHN1YnN0aXR1dGluZyB0aGUgc3BlY2lmaWVkIHZhbHVlc1xuICogZm9yIHRoZSBwYXRoIGFuZCBzZWFyY2ggcGFyYW1ldGVycy4gTnVsbCB2YWx1ZXMgZm9yIHBhdGggcGFyYW1ldGVycyBhcmVcbiAqIHRyZWF0ZWQgYXMgZW1wdHkgc3RyaW5ncy5cbiAqXG4gKiBAZXhhbXBsZVxuICogPHByZT5cbiAqIG5ldyBVcmxNYXRjaGVyKCcvdXNlci97aWR9P3EnKS5mb3JtYXQoeyBpZDonYm9iJywgcToneWVzJyB9KTtcbiAqIC8vIHJldHVybnMgJy91c2VyL2JvYj9xPXllcydcbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZXMgIHRoZSB2YWx1ZXMgdG8gc3Vic3RpdHV0ZSBmb3IgdGhlIHBhcmFtZXRlcnMgaW4gdGhpcyBwYXR0ZXJuLlxuICogQHJldHVybnMge3N0cmluZ30gIHRoZSBmb3JtYXR0ZWQgVVJMIChwYXRoIGFuZCBvcHRpb25hbGx5IHNlYXJjaCBwYXJ0KS5cbiAqL1xuVXJsTWF0Y2hlci5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICB2YWx1ZXMgPSB2YWx1ZXMgfHwge307XG4gIHZhciBzZWdtZW50cyA9IHRoaXMuc2VnbWVudHMsIHBhcmFtcyA9IHRoaXMucGFyYW1ldGVycygpLCBwYXJhbXNldCA9IHRoaXMucGFyYW1zO1xuICBpZiAoIXRoaXMudmFsaWRhdGVzKHZhbHVlcykpIHJldHVybiBudWxsO1xuXG4gIHZhciBpLCBzZWFyY2ggPSBmYWxzZSwgblBhdGggPSBzZWdtZW50cy5sZW5ndGggLSAxLCBuVG90YWwgPSBwYXJhbXMubGVuZ3RoLCByZXN1bHQgPSBzZWdtZW50c1swXTtcblxuICBmdW5jdGlvbiBlbmNvZGVEYXNoZXMoc3RyKSB7IC8vIFJlcGxhY2UgZGFzaGVzIHdpdGggZW5jb2RlZCBcIlxcLVwiXG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHIpLnJlcGxhY2UoLy0vZywgZnVuY3Rpb24oYykgeyByZXR1cm4gJyU1QyUnICsgYy5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpOyB9KTtcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBuVG90YWw7IGkrKykge1xuICAgIHZhciBpc1BhdGhQYXJhbSA9IGkgPCBuUGF0aDtcbiAgICB2YXIgbmFtZSA9IHBhcmFtc1tpXSwgcGFyYW0gPSBwYXJhbXNldFtuYW1lXSwgdmFsdWUgPSBwYXJhbS52YWx1ZSh2YWx1ZXNbbmFtZV0pO1xuICAgIHZhciBpc0RlZmF1bHRWYWx1ZSA9IHBhcmFtLmlzT3B0aW9uYWwgJiYgcGFyYW0udHlwZS5lcXVhbHMocGFyYW0udmFsdWUoKSwgdmFsdWUpO1xuICAgIHZhciBzcXVhc2ggPSBpc0RlZmF1bHRWYWx1ZSA/IHBhcmFtLnNxdWFzaCA6IGZhbHNlO1xuICAgIHZhciBlbmNvZGVkID0gcGFyYW0udHlwZS5lbmNvZGUodmFsdWUpO1xuXG4gICAgaWYgKGlzUGF0aFBhcmFtKSB7XG4gICAgICB2YXIgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tpICsgMV07XG4gICAgICB2YXIgaXNGaW5hbFBhdGhQYXJhbSA9IGkgKyAxID09PSBuUGF0aDtcblxuICAgICAgaWYgKHNxdWFzaCA9PT0gZmFsc2UpIHtcbiAgICAgICAgaWYgKGVuY29kZWQgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChpc0FycmF5KGVuY29kZWQpKSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gbWFwKGVuY29kZWQsIGVuY29kZURhc2hlcykuam9pbihcIi1cIik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBlbmNvZGVVUklDb21wb25lbnQoZW5jb2RlZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCArPSBuZXh0U2VnbWVudDtcbiAgICAgIH0gZWxzZSBpZiAoc3F1YXNoID09PSB0cnVlKSB7XG4gICAgICAgIHZhciBjYXB0dXJlID0gcmVzdWx0Lm1hdGNoKC9cXC8kLykgPyAvXFwvPyguKikvIDogLyguKikvO1xuICAgICAgICByZXN1bHQgKz0gbmV4dFNlZ21lbnQubWF0Y2goY2FwdHVyZSlbMV07XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKHNxdWFzaCkpIHtcbiAgICAgICAgcmVzdWx0ICs9IHNxdWFzaCArIG5leHRTZWdtZW50O1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNGaW5hbFBhdGhQYXJhbSAmJiBwYXJhbS5zcXVhc2ggPT09IHRydWUgJiYgcmVzdWx0LnNsaWNlKC0xKSA9PT0gJy8nKSByZXN1bHQgPSByZXN1bHQuc2xpY2UoMCwgLTEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZW5jb2RlZCA9PSBudWxsIHx8IChpc0RlZmF1bHRWYWx1ZSAmJiBzcXVhc2ggIT09IGZhbHNlKSkgY29udGludWU7XG4gICAgICBpZiAoIWlzQXJyYXkoZW5jb2RlZCkpIGVuY29kZWQgPSBbIGVuY29kZWQgXTtcbiAgICAgIGlmIChlbmNvZGVkLmxlbmd0aCA9PT0gMCkgY29udGludWU7XG4gICAgICBlbmNvZGVkID0gbWFwKGVuY29kZWQsIGVuY29kZVVSSUNvbXBvbmVudCkuam9pbignJicgKyBuYW1lICsgJz0nKTtcbiAgICAgIHJlc3VsdCArPSAoc2VhcmNoID8gJyYnIDogJz8nKSArIChuYW1lICsgJz0nICsgZW5jb2RlZCk7XG4gICAgICBzZWFyY2ggPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogSW1wbGVtZW50cyBhbiBpbnRlcmZhY2UgdG8gZGVmaW5lIGN1c3RvbSBwYXJhbWV0ZXIgdHlwZXMgdGhhdCBjYW4gYmUgZGVjb2RlZCBmcm9tIGFuZCBlbmNvZGVkIHRvXG4gKiBzdHJpbmcgcGFyYW1ldGVycyBtYXRjaGVkIGluIGEgVVJMLiBVc2VkIGJ5IHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfVxuICogb2JqZWN0cyB3aGVuIG1hdGNoaW5nIG9yIGZvcm1hdHRpbmcgVVJMcywgb3IgY29tcGFyaW5nIG9yIHZhbGlkYXRpbmcgcGFyYW1ldGVyIHZhbHVlcy5cbiAqXG4gKiBTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNtZXRob2RzX3R5cGUgYCR1cmxNYXRjaGVyRmFjdG9yeSN0eXBlKClgfSBmb3IgbW9yZVxuICogaW5mb3JtYXRpb24gb24gcmVnaXN0ZXJpbmcgY3VzdG9tIHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgIEEgY29uZmlndXJhdGlvbiBvYmplY3Qgd2hpY2ggY29udGFpbnMgdGhlIGN1c3RvbSB0eXBlIGRlZmluaXRpb24uICBUaGUgb2JqZWN0J3NcbiAqICAgICAgICBwcm9wZXJ0aWVzIHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgbWV0aG9kcyBhbmQvb3IgcGF0dGVybiBpbiBgVHlwZWAncyBwdWJsaWMgaW50ZXJmYWNlLlxuICogQGV4YW1wbGVcbiAqIDxwcmU+XG4gKiB7XG4gKiAgIGRlY29kZTogZnVuY3Rpb24odmFsKSB7IHJldHVybiBwYXJzZUludCh2YWwsIDEwKTsgfSxcbiAqICAgZW5jb2RlOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCAmJiB2YWwudG9TdHJpbmcoKTsgfSxcbiAqICAgZXF1YWxzOiBmdW5jdGlvbihhLCBiKSB7IHJldHVybiB0aGlzLmlzKGEpICYmIGEgPT09IGI7IH0sXG4gKiAgIGlzOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIGFuZ3VsYXIuaXNOdW1iZXIodmFsKSBpc0Zpbml0ZSh2YWwpICYmIHZhbCAlIDEgPT09IDA7IH0sXG4gKiAgIHBhdHRlcm46IC9cXGQrL1xuICogfVxuICogPC9wcmU+XG4gKlxuICogQHByb3BlcnR5IHtSZWdFeHB9IHBhdHRlcm4gVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBwYXR0ZXJuIHVzZWQgdG8gbWF0Y2ggdmFsdWVzIG9mIHRoaXMgdHlwZSB3aGVuXG4gKiAgICAgICAgICAgY29taW5nIGZyb20gYSBzdWJzdHJpbmcgb2YgYSBVUkwuXG4gKlxuICogQHJldHVybnMge09iamVjdH0gIFJldHVybnMgYSBuZXcgYFR5cGVgIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gVHlwZShjb25maWcpIHtcbiAgZXh0ZW5kKHRoaXMsIGNvbmZpZyk7XG59XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUjaXNcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIERldGVjdHMgd2hldGhlciBhIHZhbHVlIGlzIG9mIGEgcGFydGljdWxhciB0eXBlLiBBY2NlcHRzIGEgbmF0aXZlIChkZWNvZGVkKSB2YWx1ZVxuICogYW5kIGRldGVybWluZXMgd2hldGhlciBpdCBtYXRjaGVzIHRoZSBjdXJyZW50IGBUeXBlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHsqfSB2YWwgIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgIE9wdGlvbmFsLiBJZiB0aGUgdHlwZSBjaGVjayBpcyBoYXBwZW5pbmcgaW4gdGhlIGNvbnRleHQgb2YgYSBzcGVjaWZpY1xuICogICAgICAgIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfSBvYmplY3QsIHRoaXMgaXMgdGhlIG5hbWUgb2YgdGhlXG4gKiAgICAgICAgcGFyYW1ldGVyIGluIHdoaWNoIGB2YWxgIGlzIHN0b3JlZC4gQ2FuIGJlIHVzZWQgZm9yIG1ldGEtcHJvZ3JhbW1pbmcgb2YgYFR5cGVgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gIFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZSBtYXRjaGVzIHRoZSB0eXBlLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqL1xuVHlwZS5wcm90b3R5cGUuaXMgPSBmdW5jdGlvbih2YWwsIGtleSkge1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUjZW5jb2RlXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBFbmNvZGVzIGEgY3VzdG9tL25hdGl2ZSB0eXBlIHZhbHVlIHRvIGEgc3RyaW5nIHRoYXQgY2FuIGJlIGVtYmVkZGVkIGluIGEgVVJMLiBOb3RlIHRoYXQgdGhlXG4gKiByZXR1cm4gdmFsdWUgZG9lcyAqbm90KiBuZWVkIHRvIGJlIFVSTC1zYWZlIChpLmUuIHBhc3NlZCB0aHJvdWdoIGBlbmNvZGVVUklDb21wb25lbnQoKWApLCBpdFxuICogb25seSBuZWVkcyB0byBiZSBhIHJlcHJlc2VudGF0aW9uIG9mIGB2YWxgIHRoYXQgaGFzIGJlZW4gY29lcmNlZCB0byBhIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbCAgVGhlIHZhbHVlIHRvIGVuY29kZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgaW4gd2hpY2ggYHZhbGAgaXMgc3RvcmVkLiBDYW4gYmUgdXNlZCBmb3JcbiAqICAgICAgICBtZXRhLXByb2dyYW1taW5nIG9mIGBUeXBlYCBvYmplY3RzLlxuICogQHJldHVybnMge3N0cmluZ30gIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYHZhbGAgdGhhdCBjYW4gYmUgZW5jb2RlZCBpbiBhIFVSTC5cbiAqL1xuVHlwZS5wcm90b3R5cGUuZW5jb2RlID0gZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgcmV0dXJuIHZhbDtcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUjZGVjb2RlXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDb252ZXJ0cyBhIHBhcmFtZXRlciB2YWx1ZSAoZnJvbSBVUkwgc3RyaW5nIG9yIHRyYW5zaXRpb24gcGFyYW0pIHRvIGEgY3VzdG9tL25hdGl2ZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdmFsICBUaGUgVVJMIHBhcmFtZXRlciB2YWx1ZSB0byBkZWNvZGUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5ICBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIGluIHdoaWNoIGB2YWxgIGlzIHN0b3JlZC4gQ2FuIGJlIHVzZWQgZm9yXG4gKiAgICAgICAgbWV0YS1wcm9ncmFtbWluZyBvZiBgVHlwZWAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHsqfSAgUmV0dXJucyBhIGN1c3RvbSByZXByZXNlbnRhdGlvbiBvZiB0aGUgVVJMIHBhcmFtZXRlciB2YWx1ZS5cbiAqL1xuVHlwZS5wcm90b3R5cGUuZGVjb2RlID0gZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgcmV0dXJuIHZhbDtcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUjZXF1YWxzXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdHdvIGRlY29kZWQgdmFsdWVzIGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBwYXJhbSB7Kn0gYSAgQSB2YWx1ZSB0byBjb21wYXJlIGFnYWluc3QuXG4gKiBAcGFyYW0geyp9IGIgIEEgdmFsdWUgdG8gY29tcGFyZSBhZ2FpbnN0LlxuICogQHJldHVybnMge0Jvb2xlYW59ICBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50L2VxdWFsLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqL1xuVHlwZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9PSBiO1xufTtcblxuVHlwZS5wcm90b3R5cGUuJHN1YlBhdHRlcm4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN1YiA9IHRoaXMucGF0dGVybi50b1N0cmluZygpO1xuICByZXR1cm4gc3ViLnN1YnN0cigxLCBzdWIubGVuZ3RoIC0gMik7XG59O1xuXG5UeXBlLnByb3RvdHlwZS5wYXR0ZXJuID0gLy4qLztcblxuVHlwZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIFwie1R5cGU6XCIgKyB0aGlzLm5hbWUgKyBcIn1cIjsgfTtcblxuLyoqIEdpdmVuIGFuIGVuY29kZWQgc3RyaW5nLCBvciBhIGRlY29kZWQgb2JqZWN0LCByZXR1cm5zIGEgZGVjb2RlZCBvYmplY3QgKi9cblR5cGUucHJvdG90eXBlLiRub3JtYWxpemUgPSBmdW5jdGlvbih2YWwpIHtcbiAgcmV0dXJuIHRoaXMuaXModmFsKSA/IHZhbCA6IHRoaXMuZGVjb2RlKHZhbCk7XG59O1xuXG4vKlxuICogV3JhcHMgYW4gZXhpc3RpbmcgY3VzdG9tIFR5cGUgYXMgYW4gYXJyYXkgb2YgVHlwZSwgZGVwZW5kaW5nIG9uICdtb2RlJy5cbiAqIGUuZy46XG4gKiAtIHVybG1hdGNoZXIgcGF0dGVybiBcIi9wYXRoP3txdWVyeVBhcmFtW106aW50fVwiXG4gKiAtIHVybDogXCIvcGF0aD9xdWVyeVBhcmFtPTEmcXVlcnlQYXJhbT0yXG4gKiAtICRzdGF0ZVBhcmFtcy5xdWVyeVBhcmFtIHdpbGwgYmUgWzEsIDJdXG4gKiBpZiBgbW9kZWAgaXMgXCJhdXRvXCIsIHRoZW5cbiAqIC0gdXJsOiBcIi9wYXRoP3F1ZXJ5UGFyYW09MSB3aWxsIGNyZWF0ZSAkc3RhdGVQYXJhbXMucXVlcnlQYXJhbTogMVxuICogLSB1cmw6IFwiL3BhdGg/cXVlcnlQYXJhbT0xJnF1ZXJ5UGFyYW09MiB3aWxsIGNyZWF0ZSAkc3RhdGVQYXJhbXMucXVlcnlQYXJhbTogWzEsIDJdXG4gKi9cblR5cGUucHJvdG90eXBlLiRhc0FycmF5ID0gZnVuY3Rpb24obW9kZSwgaXNTZWFyY2gpIHtcbiAgaWYgKCFtb2RlKSByZXR1cm4gdGhpcztcbiAgaWYgKG1vZGUgPT09IFwiYXV0b1wiICYmICFpc1NlYXJjaCkgdGhyb3cgbmV3IEVycm9yKFwiJ2F1dG8nIGFycmF5IG1vZGUgaXMgZm9yIHF1ZXJ5IHBhcmFtZXRlcnMgb25seVwiKTtcblxuICBmdW5jdGlvbiBBcnJheVR5cGUodHlwZSwgbW9kZSkge1xuICAgIGZ1bmN0aW9uIGJpbmRUbyh0eXBlLCBjYWxsYmFja05hbWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVbY2FsbGJhY2tOYW1lXS5hcHBseSh0eXBlLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBXcmFwIG5vbi1hcnJheSB2YWx1ZSBhcyBhcnJheVxuICAgIGZ1bmN0aW9uIGFycmF5V3JhcCh2YWwpIHsgcmV0dXJuIGlzQXJyYXkodmFsKSA/IHZhbCA6IChpc0RlZmluZWQodmFsKSA/IFsgdmFsIF0gOiBbXSk7IH1cbiAgICAvLyBVbndyYXAgYXJyYXkgdmFsdWUgZm9yIFwiYXV0b1wiIG1vZGUuIFJldHVybiB1bmRlZmluZWQgZm9yIGVtcHR5IGFycmF5LlxuICAgIGZ1bmN0aW9uIGFycmF5VW53cmFwKHZhbCkge1xuICAgICAgc3dpdGNoKHZhbC5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAwOiByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICBjYXNlIDE6IHJldHVybiBtb2RlID09PSBcImF1dG9cIiA/IHZhbFswXSA6IHZhbDtcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIHZhbDtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZmFsc2V5KHZhbCkgeyByZXR1cm4gIXZhbDsgfVxuXG4gICAgLy8gV3JhcHMgdHlwZSAoLmlzLy5lbmNvZGUvLmRlY29kZSkgZnVuY3Rpb25zIHRvIG9wZXJhdGUgb24gZWFjaCB2YWx1ZSBvZiBhbiBhcnJheVxuICAgIGZ1bmN0aW9uIGFycmF5SGFuZGxlcihjYWxsYmFjaywgYWxsVHJ1dGh5TW9kZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZUFycmF5KHZhbCkge1xuICAgICAgICBpZiAoaXNBcnJheSh2YWwpICYmIHZhbC5sZW5ndGggPT09IDApIHJldHVybiB2YWw7XG4gICAgICAgIHZhbCA9IGFycmF5V3JhcCh2YWwpO1xuICAgICAgICB2YXIgcmVzdWx0ID0gbWFwKHZhbCwgY2FsbGJhY2spO1xuICAgICAgICBpZiAoYWxsVHJ1dGh5TW9kZSA9PT0gdHJ1ZSlcbiAgICAgICAgICByZXR1cm4gZmlsdGVyKHJlc3VsdCwgZmFsc2V5KS5sZW5ndGggPT09IDA7XG4gICAgICAgIHJldHVybiBhcnJheVVud3JhcChyZXN1bHQpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBXcmFwcyB0eXBlICguZXF1YWxzKSBmdW5jdGlvbnMgdG8gb3BlcmF0ZSBvbiBlYWNoIHZhbHVlIG9mIGFuIGFycmF5XG4gICAgZnVuY3Rpb24gYXJyYXlFcXVhbHNIYW5kbGVyKGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaGFuZGxlQXJyYXkodmFsMSwgdmFsMikge1xuICAgICAgICB2YXIgbGVmdCA9IGFycmF5V3JhcCh2YWwxKSwgcmlnaHQgPSBhcnJheVdyYXAodmFsMik7XG4gICAgICAgIGlmIChsZWZ0Lmxlbmd0aCAhPT0gcmlnaHQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVmdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICghY2FsbGJhY2sobGVmdFtpXSwgcmlnaHRbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuZW5jb2RlID0gYXJyYXlIYW5kbGVyKGJpbmRUbyh0eXBlLCAnZW5jb2RlJykpO1xuICAgIHRoaXMuZGVjb2RlID0gYXJyYXlIYW5kbGVyKGJpbmRUbyh0eXBlLCAnZGVjb2RlJykpO1xuICAgIHRoaXMuaXMgICAgID0gYXJyYXlIYW5kbGVyKGJpbmRUbyh0eXBlLCAnaXMnKSwgdHJ1ZSk7XG4gICAgdGhpcy5lcXVhbHMgPSBhcnJheUVxdWFsc0hhbmRsZXIoYmluZFRvKHR5cGUsICdlcXVhbHMnKSk7XG4gICAgdGhpcy5wYXR0ZXJuID0gdHlwZS5wYXR0ZXJuO1xuICAgIHRoaXMuJG5vcm1hbGl6ZSA9IGFycmF5SGFuZGxlcihiaW5kVG8odHlwZSwgJyRub3JtYWxpemUnKSk7XG4gICAgdGhpcy5uYW1lID0gdHlwZS5uYW1lO1xuICAgIHRoaXMuJGFycmF5TW9kZSA9IG1vZGU7XG4gIH1cblxuICByZXR1cm4gbmV3IEFycmF5VHlwZSh0aGlzLCBtb2RlKTtcbn07XG5cblxuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRmFjdG9yeSBmb3Ige0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBgVXJsTWF0Y2hlcmB9IGluc3RhbmNlcy4gVGhlIGZhY3RvcnlcbiAqIGlzIGFsc28gYXZhaWxhYmxlIHRvIHByb3ZpZGVycyB1bmRlciB0aGUgbmFtZSBgJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJgLlxuICovXG5mdW5jdGlvbiAkVXJsTWF0Y2hlckZhY3RvcnkoKSB7XG4gICQkVU1GUCA9IHRoaXM7XG5cbiAgdmFyIGlzQ2FzZUluc2Vuc2l0aXZlID0gZmFsc2UsIGlzU3RyaWN0TW9kZSA9IHRydWUsIGRlZmF1bHRTcXVhc2hQb2xpY3kgPSBmYWxzZTtcblxuICAvLyBVc2UgdGlsZGVzIHRvIHByZS1lbmNvZGUgc2xhc2hlcy5cbiAgLy8gSWYgdGhlIHNsYXNoZXMgYXJlIHNpbXBseSBVUkxFbmNvZGVkLCB0aGUgYnJvd3NlciBjYW4gY2hvb3NlIHRvIHByZS1kZWNvZGUgdGhlbSxcbiAgLy8gYW5kIGJpZGlyZWN0aW9uYWwgZW5jb2RpbmcvZGVjb2RpbmcgZmFpbHMuXG4gIC8vIFRpbGRlIHdhcyBjaG9zZW4gYmVjYXVzZSBpdCdzIG5vdCBhIFJGQyAzOTg2IHNlY3Rpb24gMi4yIFJlc2VydmVkIENoYXJhY3RlclxuICBmdW5jdGlvbiB2YWxUb1N0cmluZyh2YWwpIHsgcmV0dXJuIHZhbCAhPSBudWxsID8gdmFsLnRvU3RyaW5nKCkucmVwbGFjZSgvfi9nLCBcIn5+XCIpLnJlcGxhY2UoL1xcLy9nLCBcIn4yRlwiKSA6IHZhbDsgfVxuICBmdW5jdGlvbiB2YWxGcm9tU3RyaW5nKHZhbCkgeyByZXR1cm4gdmFsICE9IG51bGwgPyB2YWwudG9TdHJpbmcoKS5yZXBsYWNlKC9+MkYvZywgXCIvXCIpLnJlcGxhY2UoL35+L2csIFwiflwiKSA6IHZhbDsgfVxuXG4gIHZhciAkdHlwZXMgPSB7fSwgZW5xdWV1ZSA9IHRydWUsIHR5cGVRdWV1ZSA9IFtdLCBpbmplY3RvciwgZGVmYXVsdFR5cGVzID0ge1xuICAgIFwic3RyaW5nXCI6IHtcbiAgICAgIGVuY29kZTogdmFsVG9TdHJpbmcsXG4gICAgICBkZWNvZGU6IHZhbEZyb21TdHJpbmcsXG4gICAgICAvLyBUT0RPOiBpbiAxLjAsIG1ha2Ugc3RyaW5nIC5pcygpIHJldHVybiBmYWxzZSBpZiB2YWx1ZSBpcyB1bmRlZmluZWQvbnVsbCBieSBkZWZhdWx0LlxuICAgICAgLy8gSW4gMC4yLngsIHN0cmluZyBwYXJhbXMgYXJlIG9wdGlvbmFsIGJ5IGRlZmF1bHQgZm9yIGJhY2t3YXJkcyBjb21wYXRcbiAgICAgIGlzOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCA9PSBudWxsIHx8ICFpc0RlZmluZWQodmFsKSB8fCB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiOyB9LFxuICAgICAgcGF0dGVybjogL1teL10qL1xuICAgIH0sXG4gICAgXCJpbnRcIjoge1xuICAgICAgZW5jb2RlOiB2YWxUb1N0cmluZyxcbiAgICAgIGRlY29kZTogZnVuY3Rpb24odmFsKSB7IHJldHVybiBwYXJzZUludCh2YWwsIDEwKTsgfSxcbiAgICAgIGlzOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIGlzRGVmaW5lZCh2YWwpICYmIHRoaXMuZGVjb2RlKHZhbC50b1N0cmluZygpKSA9PT0gdmFsOyB9LFxuICAgICAgcGF0dGVybjogL1xcZCsvXG4gICAgfSxcbiAgICBcImJvb2xcIjoge1xuICAgICAgZW5jb2RlOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCA/IDEgOiAwOyB9LFxuICAgICAgZGVjb2RlOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApICE9PSAwOyB9LFxuICAgICAgaXM6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gdmFsID09PSB0cnVlIHx8IHZhbCA9PT0gZmFsc2U7IH0sXG4gICAgICBwYXR0ZXJuOiAvMHwxL1xuICAgIH0sXG4gICAgXCJkYXRlXCI6IHtcbiAgICAgIGVuY29kZTogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBpZiAoIXRoaXMuaXModmFsKSlcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICByZXR1cm4gWyB2YWwuZ2V0RnVsbFllYXIoKSxcbiAgICAgICAgICAoJzAnICsgKHZhbC5nZXRNb250aCgpICsgMSkpLnNsaWNlKC0yKSxcbiAgICAgICAgICAoJzAnICsgdmFsLmdldERhdGUoKSkuc2xpY2UoLTIpXG4gICAgICAgIF0uam9pbihcIi1cIik7XG4gICAgICB9LFxuICAgICAgZGVjb2RlOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIGlmICh0aGlzLmlzKHZhbCkpIHJldHVybiB2YWw7XG4gICAgICAgIHZhciBtYXRjaCA9IHRoaXMuY2FwdHVyZS5leGVjKHZhbCk7XG4gICAgICAgIHJldHVybiBtYXRjaCA/IG5ldyBEYXRlKG1hdGNoWzFdLCBtYXRjaFsyXSAtIDEsIG1hdGNoWzNdKSA6IHVuZGVmaW5lZDtcbiAgICAgIH0sXG4gICAgICBpczogZnVuY3Rpb24odmFsKSB7IHJldHVybiB2YWwgaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTih2YWwudmFsdWVPZigpKTsgfSxcbiAgICAgIGVxdWFsczogZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIHRoaXMuaXMoYSkgJiYgdGhpcy5pcyhiKSAmJiBhLnRvSVNPU3RyaW5nKCkgPT09IGIudG9JU09TdHJpbmcoKTsgfSxcbiAgICAgIHBhdHRlcm46IC9bMC05XXs0fS0oPzowWzEtOV18MVswLTJdKS0oPzowWzEtOV18WzEtMl1bMC05XXwzWzAtMV0pLyxcbiAgICAgIGNhcHR1cmU6IC8oWzAtOV17NH0pLSgwWzEtOV18MVswLTJdKS0oMFsxLTldfFsxLTJdWzAtOV18M1swLTFdKS9cbiAgICB9LFxuICAgIFwianNvblwiOiB7XG4gICAgICBlbmNvZGU6IGFuZ3VsYXIudG9Kc29uLFxuICAgICAgZGVjb2RlOiBhbmd1bGFyLmZyb21Kc29uLFxuICAgICAgaXM6IGFuZ3VsYXIuaXNPYmplY3QsXG4gICAgICBlcXVhbHM6IGFuZ3VsYXIuZXF1YWxzLFxuICAgICAgcGF0dGVybjogL1teL10qL1xuICAgIH0sXG4gICAgXCJhbnlcIjogeyAvLyBkb2VzIG5vdCBlbmNvZGUvZGVjb2RlXG4gICAgICBlbmNvZGU6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICBkZWNvZGU6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICBlcXVhbHM6IGFuZ3VsYXIuZXF1YWxzLFxuICAgICAgcGF0dGVybjogLy4qL1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBnZXREZWZhdWx0Q29uZmlnKCkge1xuICAgIHJldHVybiB7XG4gICAgICBzdHJpY3Q6IGlzU3RyaWN0TW9kZSxcbiAgICAgIGNhc2VJbnNlbnNpdGl2ZTogaXNDYXNlSW5zZW5zaXRpdmVcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gaXNJbmplY3RhYmxlKHZhbHVlKSB7XG4gICAgcmV0dXJuIChpc0Z1bmN0aW9uKHZhbHVlKSB8fCAoaXNBcnJheSh2YWx1ZSkgJiYgaXNGdW5jdGlvbih2YWx1ZVt2YWx1ZS5sZW5ndGggLSAxXSkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBbSW50ZXJuYWxdIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBhIHBhcmFtZXRlciwgd2hpY2ggbWF5IGJlIGFuIGluamVjdGFibGUgZnVuY3Rpb24uXG4gICAqL1xuICAkVXJsTWF0Y2hlckZhY3RvcnkuJCRnZXREZWZhdWx0VmFsdWUgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICBpZiAoIWlzSW5qZWN0YWJsZShjb25maWcudmFsdWUpKSByZXR1cm4gY29uZmlnLnZhbHVlO1xuICAgIGlmICghaW5qZWN0b3IpIHRocm93IG5ldyBFcnJvcihcIkluamVjdGFibGUgZnVuY3Rpb25zIGNhbm5vdCBiZSBjYWxsZWQgYXQgY29uZmlndXJhdGlvbiB0aW1lXCIpO1xuICAgIHJldHVybiBpbmplY3Rvci5pbnZva2UoY29uZmlnLnZhbHVlKTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNjYXNlSW5zZW5zaXRpdmVcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogRGVmaW5lcyB3aGV0aGVyIFVSTCBtYXRjaGluZyBzaG91bGQgYmUgY2FzZSBzZW5zaXRpdmUgKHRoZSBkZWZhdWx0IGJlaGF2aW9yKSwgb3Igbm90LlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIGBmYWxzZWAgdG8gbWF0Y2ggVVJMIGluIGEgY2FzZSBzZW5zaXRpdmUgbWFubmVyOyBvdGhlcndpc2UgYHRydWVgO1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdGhlIGN1cnJlbnQgdmFsdWUgb2YgY2FzZUluc2Vuc2l0aXZlXG4gICAqL1xuICB0aGlzLmNhc2VJbnNlbnNpdGl2ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKGlzRGVmaW5lZCh2YWx1ZSkpXG4gICAgICBpc0Nhc2VJbnNlbnNpdGl2ZSA9IHZhbHVlO1xuICAgIHJldHVybiBpc0Nhc2VJbnNlbnNpdGl2ZTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNzdHJpY3RNb2RlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIERlZmluZXMgd2hldGhlciBVUkxzIHNob3VsZCBtYXRjaCB0cmFpbGluZyBzbGFzaGVzLCBvciBub3QgKHRoZSBkZWZhdWx0IGJlaGF2aW9yKS5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdmFsdWUgYGZhbHNlYCB0byBtYXRjaCB0cmFpbGluZyBzbGFzaGVzIGluIFVSTHMsIG90aGVyd2lzZSBgdHJ1ZWAuXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0aGUgY3VycmVudCB2YWx1ZSBvZiBzdHJpY3RNb2RlXG4gICAqL1xuICB0aGlzLnN0cmljdE1vZGUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmIChpc0RlZmluZWQodmFsdWUpKVxuICAgICAgaXNTdHJpY3RNb2RlID0gdmFsdWU7XG4gICAgcmV0dXJuIGlzU3RyaWN0TW9kZTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNkZWZhdWx0U3F1YXNoUG9saWN5XG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFNldHMgdGhlIGRlZmF1bHQgYmVoYXZpb3Igd2hlbiBnZW5lcmF0aW5nIG9yIG1hdGNoaW5nIFVSTHMgd2l0aCBkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBBIHN0cmluZyB0aGF0IGRlZmluZXMgdGhlIGRlZmF1bHQgcGFyYW1ldGVyIFVSTCBzcXVhc2hpbmcgYmVoYXZpb3IuXG4gICAqICAgIGBub3NxdWFzaGA6IFdoZW4gZ2VuZXJhdGluZyBhbiBocmVmIHdpdGggYSBkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZSwgZG8gbm90IHNxdWFzaCB0aGUgcGFyYW1ldGVyIHZhbHVlIGZyb20gdGhlIFVSTFxuICAgKiAgICBgc2xhc2hgOiBXaGVuIGdlbmVyYXRpbmcgYW4gaHJlZiB3aXRoIGEgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUsIHNxdWFzaCAocmVtb3ZlKSB0aGUgcGFyYW1ldGVyIHZhbHVlLCBhbmQsIGlmIHRoZVxuICAgKiAgICAgICAgICAgICBwYXJhbWV0ZXIgaXMgc3Vycm91bmRlZCBieSBzbGFzaGVzLCBzcXVhc2ggKHJlbW92ZSkgb25lIHNsYXNoIGZyb20gdGhlIFVSTFxuICAgKiAgICBhbnkgb3RoZXIgc3RyaW5nLCBlLmcuIFwiflwiOiBXaGVuIGdlbmVyYXRpbmcgYW4gaHJlZiB3aXRoIGEgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUsIHNxdWFzaCAocmVtb3ZlKVxuICAgKiAgICAgICAgICAgICB0aGUgcGFyYW1ldGVyIHZhbHVlIGZyb20gdGhlIFVSTCBhbmQgcmVwbGFjZSBpdCB3aXRoIHRoaXMgc3RyaW5nLlxuICAgKi9cbiAgdGhpcy5kZWZhdWx0U3F1YXNoUG9saWN5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHJldHVybiBkZWZhdWx0U3F1YXNoUG9saWN5O1xuICAgIGlmICh2YWx1ZSAhPT0gdHJ1ZSAmJiB2YWx1ZSAhPT0gZmFsc2UgJiYgIWlzU3RyaW5nKHZhbHVlKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3F1YXNoIHBvbGljeTogXCIgKyB2YWx1ZSArIFwiLiBWYWxpZCBwb2xpY2llczogZmFsc2UsIHRydWUsIGFyYml0cmFyeS1zdHJpbmdcIik7XG4gICAgZGVmYXVsdFNxdWFzaFBvbGljeSA9IHZhbHVlO1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNjb21waWxlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIENyZWF0ZXMgYSB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIGBVcmxNYXRjaGVyYH0gZm9yIHRoZSBzcGVjaWZpZWQgcGF0dGVybi5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm4gIFRoZSBVUkwgcGF0dGVybi5cbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAgVGhlIGNvbmZpZyBvYmplY3QgaGFzaC5cbiAgICogQHJldHVybnMge1VybE1hdGNoZXJ9ICBUaGUgVXJsTWF0Y2hlci5cbiAgICovXG4gIHRoaXMuY29tcGlsZSA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBjb25maWcpIHtcbiAgICByZXR1cm4gbmV3IFVybE1hdGNoZXIocGF0dGVybiwgZXh0ZW5kKGdldERlZmF1bHRDb25maWcoKSwgY29uZmlnKSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnkjaXNNYXRjaGVyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3BlY2lmaWVkIG9iamVjdCBpcyBhIGBVcmxNYXRjaGVyYCwgb3IgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0ICBUaGUgb2JqZWN0IHRvIHBlcmZvcm0gdGhlIHR5cGUgY2hlY2sgYWdhaW5zdC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59ICBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgb2JqZWN0IG1hdGNoZXMgdGhlIGBVcmxNYXRjaGVyYCBpbnRlcmZhY2UsIGJ5XG4gICAqICAgICAgICAgIGltcGxlbWVudGluZyBhbGwgdGhlIHNhbWUgbWV0aG9kcy5cbiAgICovXG4gIHRoaXMuaXNNYXRjaGVyID0gZnVuY3Rpb24gKG8pIHtcbiAgICBpZiAoIWlzT2JqZWN0KG8pKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG5cbiAgICBmb3JFYWNoKFVybE1hdGNoZXIucHJvdG90eXBlLCBmdW5jdGlvbih2YWwsIG5hbWUpIHtcbiAgICAgIGlmIChpc0Z1bmN0aW9uKHZhbCkpIHtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICYmIChpc0RlZmluZWQob1tuYW1lXSkgJiYgaXNGdW5jdGlvbihvW25hbWVdKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSN0eXBlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlZ2lzdGVycyBhIGN1c3RvbSB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlIGBUeXBlYH0gb2JqZWN0IHRoYXQgY2FuIGJlIHVzZWQgdG9cbiAgICogZ2VuZXJhdGUgVVJMcyB3aXRoIHR5cGVkIHBhcmFtZXRlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lICBUaGUgdHlwZSBuYW1lLlxuICAgKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gZGVmaW5pdGlvbiAgIFRoZSB0eXBlIGRlZmluaXRpb24uIFNlZVxuICAgKiAgICAgICAge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSBgVHlwZWB9IGZvciBpbmZvcm1hdGlvbiBvbiB0aGUgdmFsdWVzIGFjY2VwdGVkLlxuICAgKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gZGVmaW5pdGlvbkZuIChvcHRpb25hbCkgQSBmdW5jdGlvbiB0aGF0IGlzIGluamVjdGVkIGJlZm9yZSB0aGUgYXBwXG4gICAqICAgICAgICBydW50aW1lIHN0YXJ0cy4gIFRoZSByZXN1bHQgb2YgdGhpcyBmdW5jdGlvbiBpcyBtZXJnZWQgaW50byB0aGUgZXhpc3RpbmcgYGRlZmluaXRpb25gLlxuICAgKiAgICAgICAgU2VlIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUgYFR5cGVgfSBmb3IgaW5mb3JtYXRpb24gb24gdGhlIHZhbHVlcyBhY2NlcHRlZC5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gIFJldHVybnMgYCR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyYC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogVGhpcyBpcyBhIHNpbXBsZSBleGFtcGxlIG9mIGEgY3VzdG9tIHR5cGUgdGhhdCBlbmNvZGVzIGFuZCBkZWNvZGVzIGl0ZW1zIGZyb20gYW5cbiAgICogYXJyYXksIHVzaW5nIHRoZSBhcnJheSBpbmRleCBhcyB0aGUgVVJMLWVuY29kZWQgdmFsdWU6XG4gICAqXG4gICAqIDxwcmU+XG4gICAqIHZhciBsaXN0ID0gWydKb2huJywgJ1BhdWwnLCAnR2VvcmdlJywgJ1JpbmdvJ107XG4gICAqXG4gICAqICR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyLnR5cGUoJ2xpc3RJdGVtJywge1xuICAgKiAgIGVuY29kZTogZnVuY3Rpb24oaXRlbSkge1xuICAgKiAgICAgLy8gUmVwcmVzZW50IHRoZSBsaXN0IGl0ZW0gaW4gdGhlIFVSTCB1c2luZyBpdHMgY29ycmVzcG9uZGluZyBpbmRleFxuICAgKiAgICAgcmV0dXJuIGxpc3QuaW5kZXhPZihpdGVtKTtcbiAgICogICB9LFxuICAgKiAgIGRlY29kZTogZnVuY3Rpb24oaXRlbSkge1xuICAgKiAgICAgLy8gTG9vayB1cCB0aGUgbGlzdCBpdGVtIGJ5IGluZGV4XG4gICAqICAgICByZXR1cm4gbGlzdFtwYXJzZUludChpdGVtLCAxMCldO1xuICAgKiAgIH0sXG4gICAqICAgaXM6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICogICAgIC8vIEVuc3VyZSB0aGUgaXRlbSBpcyB2YWxpZCBieSBjaGVja2luZyB0byBzZWUgdGhhdCBpdCBhcHBlYXJzXG4gICAqICAgICAvLyBpbiB0aGUgbGlzdFxuICAgKiAgICAgcmV0dXJuIGxpc3QuaW5kZXhPZihpdGVtKSA+IC0xO1xuICAgKiAgIH1cbiAgICogfSk7XG4gICAqXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsaXN0Jywge1xuICAgKiAgIHVybDogXCIvbGlzdC97aXRlbTpsaXN0SXRlbX1cIixcbiAgICogICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcykge1xuICAgKiAgICAgY29uc29sZS5sb2coJHN0YXRlUGFyYW1zLml0ZW0pO1xuICAgKiAgIH1cbiAgICogfSk7XG4gICAqXG4gICAqIC8vIC4uLlxuICAgKlxuICAgKiAvLyBDaGFuZ2VzIFVSTCB0byAnL2xpc3QvMycsIGxvZ3MgXCJSaW5nb1wiIHRvIHRoZSBjb25zb2xlXG4gICAqICRzdGF0ZS5nbygnbGlzdCcsIHsgaXRlbTogXCJSaW5nb1wiIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogVGhpcyBpcyBhIG1vcmUgY29tcGxleCBleGFtcGxlIG9mIGEgdHlwZSB0aGF0IHJlbGllcyBvbiBkZXBlbmRlbmN5IGluamVjdGlvbiB0b1xuICAgKiBpbnRlcmFjdCB3aXRoIHNlcnZpY2VzLCBhbmQgdXNlcyB0aGUgcGFyYW1ldGVyIG5hbWUgZnJvbSB0aGUgVVJMIHRvIGluZmVyIGhvdyB0b1xuICAgKiBoYW5kbGUgZW5jb2RpbmcgYW5kIGRlY29kaW5nIHBhcmFtZXRlciB2YWx1ZXM6XG4gICAqXG4gICAqIDxwcmU+XG4gICAqIC8vIERlZmluZXMgYSBjdXN0b20gdHlwZSB0aGF0IGdldHMgYSB2YWx1ZSBmcm9tIGEgc2VydmljZSxcbiAgICogLy8gd2hlcmUgZWFjaCBzZXJ2aWNlIGdldHMgZGlmZmVyZW50IHR5cGVzIG9mIHZhbHVlcyBmcm9tXG4gICAqIC8vIGEgYmFja2VuZCBBUEk6XG4gICAqICR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyLnR5cGUoJ2RiT2JqZWN0Jywge30sIGZ1bmN0aW9uKFVzZXJzLCBQb3N0cykge1xuICAgKlxuICAgKiAgIC8vIE1hdGNoZXMgdXAgc2VydmljZXMgdG8gVVJMIHBhcmFtZXRlciBuYW1lc1xuICAgKiAgIHZhciBzZXJ2aWNlcyA9IHtcbiAgICogICAgIHVzZXI6IFVzZXJzLFxuICAgKiAgICAgcG9zdDogUG9zdHNcbiAgICogICB9O1xuICAgKlxuICAgKiAgIHJldHVybiB7XG4gICAqICAgICBlbmNvZGU6IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgKiAgICAgICAvLyBSZXByZXNlbnQgdGhlIG9iamVjdCBpbiB0aGUgVVJMIHVzaW5nIGl0cyB1bmlxdWUgSURcbiAgICogICAgICAgcmV0dXJuIG9iamVjdC5pZDtcbiAgICogICAgIH0sXG4gICAqICAgICBkZWNvZGU6IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICogICAgICAgLy8gTG9vayB1cCB0aGUgb2JqZWN0IGJ5IElELCB1c2luZyB0aGUgcGFyYW1ldGVyXG4gICAqICAgICAgIC8vIG5hbWUgKGtleSkgdG8gY2FsbCB0aGUgY29ycmVjdCBzZXJ2aWNlXG4gICAqICAgICAgIHJldHVybiBzZXJ2aWNlc1trZXldLmZpbmRCeUlkKHZhbHVlKTtcbiAgICogICAgIH0sXG4gICAqICAgICBpczogZnVuY3Rpb24ob2JqZWN0LCBrZXkpIHtcbiAgICogICAgICAgLy8gQ2hlY2sgdGhhdCBvYmplY3QgaXMgYSB2YWxpZCBkYk9iamVjdFxuICAgKiAgICAgICByZXR1cm4gYW5ndWxhci5pc09iamVjdChvYmplY3QpICYmIG9iamVjdC5pZCAmJiBzZXJ2aWNlc1trZXldO1xuICAgKiAgICAgfVxuICAgKiAgICAgZXF1YWxzOiBmdW5jdGlvbihhLCBiKSB7XG4gICAqICAgICAgIC8vIENoZWNrIHRoZSBlcXVhbGl0eSBvZiBkZWNvZGVkIG9iamVjdHMgYnkgY29tcGFyaW5nXG4gICAqICAgICAgIC8vIHRoZWlyIHVuaXF1ZSBJRHNcbiAgICogICAgICAgcmV0dXJuIGEuaWQgPT09IGIuaWQ7XG4gICAqICAgICB9XG4gICAqICAgfTtcbiAgICogfSk7XG4gICAqXG4gICAqIC8vIEluIGEgY29uZmlnKCkgYmxvY2ssIHlvdSBjYW4gdGhlbiBhdHRhY2ggVVJMcyB3aXRoXG4gICAqIC8vIHR5cGUtYW5ub3RhdGVkIHBhcmFtZXRlcnM6XG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd1c2VycycsIHtcbiAgICogICB1cmw6IFwiL3VzZXJzXCIsXG4gICAqICAgLy8gLi4uXG4gICAqIH0pLnN0YXRlKCd1c2Vycy5pdGVtJywge1xuICAgKiAgIHVybDogXCIve3VzZXI6ZGJPYmplY3R9XCIsXG4gICAqICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICogICAgIC8vICRzdGF0ZVBhcmFtcy51c2VyIHdpbGwgbm93IGJlIGFuIG9iamVjdCByZXR1cm5lZCBmcm9tXG4gICAqICAgICAvLyB0aGUgVXNlcnMgc2VydmljZVxuICAgKiAgIH0sXG4gICAqICAgLy8gLi4uXG4gICAqIH0pO1xuICAgKiA8L3ByZT5cbiAgICovXG4gIHRoaXMudHlwZSA9IGZ1bmN0aW9uIChuYW1lLCBkZWZpbml0aW9uLCBkZWZpbml0aW9uRm4pIHtcbiAgICBpZiAoIWlzRGVmaW5lZChkZWZpbml0aW9uKSkgcmV0dXJuICR0eXBlc1tuYW1lXTtcbiAgICBpZiAoJHR5cGVzLmhhc093blByb3BlcnR5KG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJBIHR5cGUgbmFtZWQgJ1wiICsgbmFtZSArIFwiJyBoYXMgYWxyZWFkeSBiZWVuIGRlZmluZWQuXCIpO1xuXG4gICAgJHR5cGVzW25hbWVdID0gbmV3IFR5cGUoZXh0ZW5kKHsgbmFtZTogbmFtZSB9LCBkZWZpbml0aW9uKSk7XG4gICAgaWYgKGRlZmluaXRpb25Gbikge1xuICAgICAgdHlwZVF1ZXVlLnB1c2goeyBuYW1lOiBuYW1lLCBkZWY6IGRlZmluaXRpb25GbiB9KTtcbiAgICAgIGlmICghZW5xdWV1ZSkgZmx1c2hUeXBlUXVldWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gYGZsdXNoVHlwZVF1ZXVlKClgIHdhaXRzIHVudGlsIGAkdXJsTWF0Y2hlckZhY3RvcnlgIGlzIGluamVjdGVkIGJlZm9yZSBpbnZva2luZyB0aGUgcXVldWVkIGBkZWZpbml0aW9uRm5gc1xuICBmdW5jdGlvbiBmbHVzaFR5cGVRdWV1ZSgpIHtcbiAgICB3aGlsZSh0eXBlUXVldWUubGVuZ3RoKSB7XG4gICAgICB2YXIgdHlwZSA9IHR5cGVRdWV1ZS5zaGlmdCgpO1xuICAgICAgaWYgKHR5cGUucGF0dGVybikgdGhyb3cgbmV3IEVycm9yKFwiWW91IGNhbm5vdCBvdmVycmlkZSBhIHR5cGUncyAucGF0dGVybiBhdCBydW50aW1lLlwiKTtcbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKCR0eXBlc1t0eXBlLm5hbWVdLCBpbmplY3Rvci5pbnZva2UodHlwZS5kZWYpKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZWdpc3RlciBkZWZhdWx0IHR5cGVzLiBTdG9yZSB0aGVtIGluIHRoZSBwcm90b3R5cGUgb2YgJHR5cGVzLlxuICBmb3JFYWNoKGRlZmF1bHRUeXBlcywgZnVuY3Rpb24odHlwZSwgbmFtZSkgeyAkdHlwZXNbbmFtZV0gPSBuZXcgVHlwZShleHRlbmQoe25hbWU6IG5hbWV9LCB0eXBlKSk7IH0pO1xuICAkdHlwZXMgPSBpbmhlcml0KCR0eXBlcywge30pO1xuXG4gIC8qIE5vIG5lZWQgdG8gZG9jdW1lbnQgJGdldCwgc2luY2UgaXQgcmV0dXJucyB0aGlzICovXG4gIHRoaXMuJGdldCA9IFsnJGluamVjdG9yJywgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgIGluamVjdG9yID0gJGluamVjdG9yO1xuICAgIGVucXVldWUgPSBmYWxzZTtcbiAgICBmbHVzaFR5cGVRdWV1ZSgpO1xuXG4gICAgZm9yRWFjaChkZWZhdWx0VHlwZXMsIGZ1bmN0aW9uKHR5cGUsIG5hbWUpIHtcbiAgICAgIGlmICghJHR5cGVzW25hbWVdKSAkdHlwZXNbbmFtZV0gPSBuZXcgVHlwZSh0eXBlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfV07XG5cbiAgdGhpcy5QYXJhbSA9IGZ1bmN0aW9uIFBhcmFtKGlkLCB0eXBlLCBjb25maWcsIGxvY2F0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGNvbmZpZyA9IHVud3JhcFNob3J0aGFuZChjb25maWcpO1xuICAgIHR5cGUgPSBnZXRUeXBlKGNvbmZpZywgdHlwZSwgbG9jYXRpb24pO1xuICAgIHZhciBhcnJheU1vZGUgPSBnZXRBcnJheU1vZGUoKTtcbiAgICB0eXBlID0gYXJyYXlNb2RlID8gdHlwZS4kYXNBcnJheShhcnJheU1vZGUsIGxvY2F0aW9uID09PSBcInNlYXJjaFwiKSA6IHR5cGU7XG4gICAgaWYgKHR5cGUubmFtZSA9PT0gXCJzdHJpbmdcIiAmJiAhYXJyYXlNb2RlICYmIGxvY2F0aW9uID09PSBcInBhdGhcIiAmJiBjb25maWcudmFsdWUgPT09IHVuZGVmaW5lZClcbiAgICAgIGNvbmZpZy52YWx1ZSA9IFwiXCI7IC8vIGZvciAwLjIueDsgaW4gMC4zLjArIGRvIG5vdCBhdXRvbWF0aWNhbGx5IGRlZmF1bHQgdG8gXCJcIlxuICAgIHZhciBpc09wdGlvbmFsID0gY29uZmlnLnZhbHVlICE9PSB1bmRlZmluZWQ7XG4gICAgdmFyIHNxdWFzaCA9IGdldFNxdWFzaFBvbGljeShjb25maWcsIGlzT3B0aW9uYWwpO1xuICAgIHZhciByZXBsYWNlID0gZ2V0UmVwbGFjZShjb25maWcsIGFycmF5TW9kZSwgaXNPcHRpb25hbCwgc3F1YXNoKTtcblxuICAgIGZ1bmN0aW9uIHVud3JhcFNob3J0aGFuZChjb25maWcpIHtcbiAgICAgIHZhciBrZXlzID0gaXNPYmplY3QoY29uZmlnKSA/IG9iamVjdEtleXMoY29uZmlnKSA6IFtdO1xuICAgICAgdmFyIGlzU2hvcnRoYW5kID0gaW5kZXhPZihrZXlzLCBcInZhbHVlXCIpID09PSAtMSAmJiBpbmRleE9mKGtleXMsIFwidHlwZVwiKSA9PT0gLTEgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4T2Yoa2V5cywgXCJzcXVhc2hcIikgPT09IC0xICYmIGluZGV4T2Yoa2V5cywgXCJhcnJheVwiKSA9PT0gLTE7XG4gICAgICBpZiAoaXNTaG9ydGhhbmQpIGNvbmZpZyA9IHsgdmFsdWU6IGNvbmZpZyB9O1xuICAgICAgY29uZmlnLiQkZm4gPSBpc0luamVjdGFibGUoY29uZmlnLnZhbHVlKSA/IGNvbmZpZy52YWx1ZSA6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbmZpZy52YWx1ZTsgfTtcbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0VHlwZShjb25maWcsIHVybFR5cGUsIGxvY2F0aW9uKSB7XG4gICAgICBpZiAoY29uZmlnLnR5cGUgJiYgdXJsVHlwZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW0gJ1wiK2lkK1wiJyBoYXMgdHdvIHR5cGUgY29uZmlndXJhdGlvbnMuXCIpO1xuICAgICAgaWYgKHVybFR5cGUpIHJldHVybiB1cmxUeXBlO1xuICAgICAgaWYgKCFjb25maWcudHlwZSkgcmV0dXJuIChsb2NhdGlvbiA9PT0gXCJjb25maWdcIiA/ICR0eXBlcy5hbnkgOiAkdHlwZXMuc3RyaW5nKTtcblxuICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoY29uZmlnLnR5cGUpKVxuICAgICAgICByZXR1cm4gJHR5cGVzW2NvbmZpZy50eXBlXTtcbiAgICAgIGlmIChjb25maWcudHlwZSBpbnN0YW5jZW9mIFR5cGUpXG4gICAgICAgIHJldHVybiBjb25maWcudHlwZTtcbiAgICAgIHJldHVybiBuZXcgVHlwZShjb25maWcudHlwZSk7XG4gICAgfVxuXG4gICAgLy8gYXJyYXkgY29uZmlnOiBwYXJhbSBuYW1lIChwYXJhbVtdKSBvdmVycmlkZXMgZGVmYXVsdCBzZXR0aW5ncy4gIGV4cGxpY2l0IGNvbmZpZyBvdmVycmlkZXMgcGFyYW0gbmFtZS5cbiAgICBmdW5jdGlvbiBnZXRBcnJheU1vZGUoKSB7XG4gICAgICB2YXIgYXJyYXlEZWZhdWx0cyA9IHsgYXJyYXk6IChsb2NhdGlvbiA9PT0gXCJzZWFyY2hcIiA/IFwiYXV0b1wiIDogZmFsc2UpIH07XG4gICAgICB2YXIgYXJyYXlQYXJhbU5vbWVuY2xhdHVyZSA9IGlkLm1hdGNoKC9cXFtcXF0kLykgPyB7IGFycmF5OiB0cnVlIH0gOiB7fTtcbiAgICAgIHJldHVybiBleHRlbmQoYXJyYXlEZWZhdWx0cywgYXJyYXlQYXJhbU5vbWVuY2xhdHVyZSwgY29uZmlnKS5hcnJheTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGZhbHNlLCB0cnVlLCBvciB0aGUgc3F1YXNoIHZhbHVlIHRvIGluZGljYXRlIHRoZSBcImRlZmF1bHQgcGFyYW1ldGVyIHVybCBzcXVhc2ggcG9saWN5XCIuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0U3F1YXNoUG9saWN5KGNvbmZpZywgaXNPcHRpb25hbCkge1xuICAgICAgdmFyIHNxdWFzaCA9IGNvbmZpZy5zcXVhc2g7XG4gICAgICBpZiAoIWlzT3B0aW9uYWwgfHwgc3F1YXNoID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKCFpc0RlZmluZWQoc3F1YXNoKSB8fCBzcXVhc2ggPT0gbnVsbCkgcmV0dXJuIGRlZmF1bHRTcXVhc2hQb2xpY3k7XG4gICAgICBpZiAoc3F1YXNoID09PSB0cnVlIHx8IGlzU3RyaW5nKHNxdWFzaCkpIHJldHVybiBzcXVhc2g7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHNxdWFzaCBwb2xpY3k6ICdcIiArIHNxdWFzaCArIFwiJy4gVmFsaWQgcG9saWNpZXM6IGZhbHNlLCB0cnVlLCBvciBhcmJpdHJhcnkgc3RyaW5nXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJlcGxhY2UoY29uZmlnLCBhcnJheU1vZGUsIGlzT3B0aW9uYWwsIHNxdWFzaCkge1xuICAgICAgdmFyIHJlcGxhY2UsIGNvbmZpZ3VyZWRLZXlzLCBkZWZhdWx0UG9saWN5ID0gW1xuICAgICAgICB7IGZyb206IFwiXCIsICAgdG86IChpc09wdGlvbmFsIHx8IGFycmF5TW9kZSA/IHVuZGVmaW5lZCA6IFwiXCIpIH0sXG4gICAgICAgIHsgZnJvbTogbnVsbCwgdG86IChpc09wdGlvbmFsIHx8IGFycmF5TW9kZSA/IHVuZGVmaW5lZCA6IFwiXCIpIH1cbiAgICAgIF07XG4gICAgICByZXBsYWNlID0gaXNBcnJheShjb25maWcucmVwbGFjZSkgPyBjb25maWcucmVwbGFjZSA6IFtdO1xuICAgICAgaWYgKGlzU3RyaW5nKHNxdWFzaCkpXG4gICAgICAgIHJlcGxhY2UucHVzaCh7IGZyb206IHNxdWFzaCwgdG86IHVuZGVmaW5lZCB9KTtcbiAgICAgIGNvbmZpZ3VyZWRLZXlzID0gbWFwKHJlcGxhY2UsIGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGl0ZW0uZnJvbTsgfSApO1xuICAgICAgcmV0dXJuIGZpbHRlcihkZWZhdWx0UG9saWN5LCBmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpbmRleE9mKGNvbmZpZ3VyZWRLZXlzLCBpdGVtLmZyb20pID09PSAtMTsgfSkuY29uY2F0KHJlcGxhY2UpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFtJbnRlcm5hbF0gR2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGEgcGFyYW1ldGVyLCB3aGljaCBtYXkgYmUgYW4gaW5qZWN0YWJsZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiAkJGdldERlZmF1bHRWYWx1ZSgpIHtcbiAgICAgIGlmICghaW5qZWN0b3IpIHRocm93IG5ldyBFcnJvcihcIkluamVjdGFibGUgZnVuY3Rpb25zIGNhbm5vdCBiZSBjYWxsZWQgYXQgY29uZmlndXJhdGlvbiB0aW1lXCIpO1xuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGluamVjdG9yLmludm9rZShjb25maWcuJCRmbik7XG4gICAgICBpZiAoZGVmYXVsdFZhbHVlICE9PSBudWxsICYmIGRlZmF1bHRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmICFzZWxmLnR5cGUuaXMoZGVmYXVsdFZhbHVlKSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRGVmYXVsdCB2YWx1ZSAoXCIgKyBkZWZhdWx0VmFsdWUgKyBcIikgZm9yIHBhcmFtZXRlciAnXCIgKyBzZWxmLmlkICsgXCInIGlzIG5vdCBhbiBpbnN0YW5jZSBvZiBUeXBlIChcIiArIHNlbGYudHlwZS5uYW1lICsgXCIpXCIpO1xuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBbSW50ZXJuYWxdIEdldHMgdGhlIGRlY29kZWQgcmVwcmVzZW50YXRpb24gb2YgYSB2YWx1ZSBpZiB0aGUgdmFsdWUgaXMgZGVmaW5lZCwgb3RoZXJ3aXNlLCByZXR1cm5zIHRoZVxuICAgICAqIGRlZmF1bHQgdmFsdWUsIHdoaWNoIG1heSBiZSB0aGUgcmVzdWx0IG9mIGFuIGluamVjdGFibGUgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gJHZhbHVlKHZhbHVlKSB7XG4gICAgICBmdW5jdGlvbiBoYXNSZXBsYWNlVmFsKHZhbCkgeyByZXR1cm4gZnVuY3Rpb24ob2JqKSB7IHJldHVybiBvYmouZnJvbSA9PT0gdmFsOyB9OyB9XG4gICAgICBmdW5jdGlvbiAkcmVwbGFjZSh2YWx1ZSkge1xuICAgICAgICB2YXIgcmVwbGFjZW1lbnQgPSBtYXAoZmlsdGVyKHNlbGYucmVwbGFjZSwgaGFzUmVwbGFjZVZhbCh2YWx1ZSkpLCBmdW5jdGlvbihvYmopIHsgcmV0dXJuIG9iai50bzsgfSk7XG4gICAgICAgIHJldHVybiByZXBsYWNlbWVudC5sZW5ndGggPyByZXBsYWNlbWVudFswXSA6IHZhbHVlO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSAkcmVwbGFjZSh2YWx1ZSk7XG4gICAgICByZXR1cm4gIWlzRGVmaW5lZCh2YWx1ZSkgPyAkJGdldERlZmF1bHRWYWx1ZSgpIDogc2VsZi50eXBlLiRub3JtYWxpemUodmFsdWUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvU3RyaW5nKCkgeyByZXR1cm4gXCJ7UGFyYW06XCIgKyBpZCArIFwiIFwiICsgdHlwZSArIFwiIHNxdWFzaDogJ1wiICsgc3F1YXNoICsgXCInIG9wdGlvbmFsOiBcIiArIGlzT3B0aW9uYWwgKyBcIn1cIjsgfVxuXG4gICAgZXh0ZW5kKHRoaXMsIHtcbiAgICAgIGlkOiBpZCxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBsb2NhdGlvbjogbG9jYXRpb24sXG4gICAgICBhcnJheTogYXJyYXlNb2RlLFxuICAgICAgc3F1YXNoOiBzcXVhc2gsXG4gICAgICByZXBsYWNlOiByZXBsYWNlLFxuICAgICAgaXNPcHRpb25hbDogaXNPcHRpb25hbCxcbiAgICAgIHZhbHVlOiAkdmFsdWUsXG4gICAgICBkeW5hbWljOiB1bmRlZmluZWQsXG4gICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgIHRvU3RyaW5nOiB0b1N0cmluZ1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFBhcmFtU2V0KHBhcmFtcykge1xuICAgIGV4dGVuZCh0aGlzLCBwYXJhbXMgfHwge30pO1xuICB9XG5cbiAgUGFyYW1TZXQucHJvdG90eXBlID0ge1xuICAgICQkbmV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBpbmhlcml0KHRoaXMsIGV4dGVuZChuZXcgUGFyYW1TZXQoKSwgeyAkJHBhcmVudDogdGhpc30pKTtcbiAgICB9LFxuICAgICQka2V5czogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGtleXMgPSBbXSwgY2hhaW4gPSBbXSwgcGFyZW50ID0gdGhpcyxcbiAgICAgICAgaWdub3JlID0gb2JqZWN0S2V5cyhQYXJhbVNldC5wcm90b3R5cGUpO1xuICAgICAgd2hpbGUgKHBhcmVudCkgeyBjaGFpbi5wdXNoKHBhcmVudCk7IHBhcmVudCA9IHBhcmVudC4kJHBhcmVudDsgfVxuICAgICAgY2hhaW4ucmV2ZXJzZSgpO1xuICAgICAgZm9yRWFjaChjaGFpbiwgZnVuY3Rpb24ocGFyYW1zZXQpIHtcbiAgICAgICAgZm9yRWFjaChvYmplY3RLZXlzKHBhcmFtc2V0KSwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgICAgICBpZiAoaW5kZXhPZihrZXlzLCBrZXkpID09PSAtMSAmJiBpbmRleE9mKGlnbm9yZSwga2V5KSA9PT0gLTEpIGtleXMucHVzaChrZXkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGtleXM7XG4gICAgfSxcbiAgICAkJHZhbHVlczogZnVuY3Rpb24ocGFyYW1WYWx1ZXMpIHtcbiAgICAgIHZhciB2YWx1ZXMgPSB7fSwgc2VsZiA9IHRoaXM7XG4gICAgICBmb3JFYWNoKHNlbGYuJCRrZXlzKCksIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICB2YWx1ZXNba2V5XSA9IHNlbGZba2V5XS52YWx1ZShwYXJhbVZhbHVlcyAmJiBwYXJhbVZhbHVlc1trZXldKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9LFxuICAgICQkZXF1YWxzOiBmdW5jdGlvbihwYXJhbVZhbHVlczEsIHBhcmFtVmFsdWVzMikge1xuICAgICAgdmFyIGVxdWFsID0gdHJ1ZSwgc2VsZiA9IHRoaXM7XG4gICAgICBmb3JFYWNoKHNlbGYuJCRrZXlzKCksIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICB2YXIgbGVmdCA9IHBhcmFtVmFsdWVzMSAmJiBwYXJhbVZhbHVlczFba2V5XSwgcmlnaHQgPSBwYXJhbVZhbHVlczIgJiYgcGFyYW1WYWx1ZXMyW2tleV07XG4gICAgICAgIGlmICghc2VsZltrZXldLnR5cGUuZXF1YWxzKGxlZnQsIHJpZ2h0KSkgZXF1YWwgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVxdWFsO1xuICAgIH0sXG4gICAgJCR2YWxpZGF0ZXM6IGZ1bmN0aW9uICQkdmFsaWRhdGUocGFyYW1WYWx1ZXMpIHtcbiAgICAgIHZhciBrZXlzID0gdGhpcy4kJGtleXMoKSwgaSwgcGFyYW0sIHJhd1ZhbCwgbm9ybWFsaXplZCwgZW5jb2RlZDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhcmFtID0gdGhpc1trZXlzW2ldXTtcbiAgICAgICAgcmF3VmFsID0gcGFyYW1WYWx1ZXNba2V5c1tpXV07XG4gICAgICAgIGlmICgocmF3VmFsID09PSB1bmRlZmluZWQgfHwgcmF3VmFsID09PSBudWxsKSAmJiBwYXJhbS5pc09wdGlvbmFsKVxuICAgICAgICAgIGJyZWFrOyAvLyBUaGVyZSB3YXMgbm8gcGFyYW1ldGVyIHZhbHVlLCBidXQgdGhlIHBhcmFtIGlzIG9wdGlvbmFsXG4gICAgICAgIG5vcm1hbGl6ZWQgPSBwYXJhbS50eXBlLiRub3JtYWxpemUocmF3VmFsKTtcbiAgICAgICAgaWYgKCFwYXJhbS50eXBlLmlzKG5vcm1hbGl6ZWQpKVxuICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gVGhlIHZhbHVlIHdhcyBub3Qgb2YgdGhlIGNvcnJlY3QgVHlwZSwgYW5kIGNvdWxkIG5vdCBiZSBkZWNvZGVkIHRvIHRoZSBjb3JyZWN0IFR5cGVcbiAgICAgICAgZW5jb2RlZCA9IHBhcmFtLnR5cGUuZW5jb2RlKG5vcm1hbGl6ZWQpO1xuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhlbmNvZGVkKSAmJiAhcGFyYW0udHlwZS5wYXR0ZXJuLmV4ZWMoZW5jb2RlZCkpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUaGUgdmFsdWUgd2FzIG9mIHRoZSBjb3JyZWN0IHR5cGUsIGJ1dCB3aGVuIGVuY29kZWQsIGRpZCBub3QgbWF0Y2ggdGhlIFR5cGUncyByZWdleHBcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgJCRwYXJlbnQ6IHVuZGVmaW5lZFxuICB9O1xuXG4gIHRoaXMuUGFyYW1TZXQgPSBQYXJhbVNldDtcbn1cblxuLy8gUmVnaXN0ZXIgYXMgYSBwcm92aWRlciBzbyBpdCdzIGF2YWlsYWJsZSB0byBvdGhlciBwcm92aWRlcnNcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIudXRpbCcpLnByb3ZpZGVyKCckdXJsTWF0Y2hlckZhY3RvcnknLCAkVXJsTWF0Y2hlckZhY3RvcnkpO1xuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJykucnVuKFsnJHVybE1hdGNoZXJGYWN0b3J5JywgZnVuY3Rpb24oJHVybE1hdGNoZXJGYWN0b3J5KSB7IH1dKTtcblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlclxuICogQHJlcXVpcmVzICRsb2NhdGlvblByb3ZpZGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBgJHVybFJvdXRlclByb3ZpZGVyYCBoYXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHdhdGNoaW5nIGAkbG9jYXRpb25gLiBcbiAqIFdoZW4gYCRsb2NhdGlvbmAgY2hhbmdlcyBpdCBydW5zIHRocm91Z2ggYSBsaXN0IG9mIHJ1bGVzIG9uZSBieSBvbmUgdW50aWwgYSBcbiAqIG1hdGNoIGlzIGZvdW5kLiBgJHVybFJvdXRlclByb3ZpZGVyYCBpcyB1c2VkIGJlaGluZCB0aGUgc2NlbmVzIGFueXRpbWUgeW91IHNwZWNpZnkgXG4gKiBhIHVybCBpbiBhIHN0YXRlIGNvbmZpZ3VyYXRpb24uIEFsbCB1cmxzIGFyZSBjb21waWxlZCBpbnRvIGEgVXJsTWF0Y2hlciBvYmplY3QuXG4gKlxuICogVGhlcmUgYXJlIHNldmVyYWwgbWV0aG9kcyBvbiBgJHVybFJvdXRlclByb3ZpZGVyYCB0aGF0IG1ha2UgaXQgdXNlZnVsIHRvIHVzZSBkaXJlY3RseVxuICogaW4geW91ciBtb2R1bGUgY29uZmlnLlxuICovXG4kVXJsUm91dGVyUHJvdmlkZXIuJGluamVjdCA9IFsnJGxvY2F0aW9uUHJvdmlkZXInLCAnJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXInXTtcbmZ1bmN0aW9uICRVcmxSb3V0ZXJQcm92aWRlciggICAkbG9jYXRpb25Qcm92aWRlciwgICAkdXJsTWF0Y2hlckZhY3RvcnkpIHtcbiAgdmFyIHJ1bGVzID0gW10sIG90aGVyd2lzZSA9IG51bGwsIGludGVyY2VwdERlZmVycmVkID0gZmFsc2UsIGxpc3RlbmVyO1xuXG4gIC8vIFJldHVybnMgYSBzdHJpbmcgdGhhdCBpcyBhIHByZWZpeCBvZiBhbGwgc3RyaW5ncyBtYXRjaGluZyB0aGUgUmVnRXhwXG4gIGZ1bmN0aW9uIHJlZ0V4cFByZWZpeChyZSkge1xuICAgIHZhciBwcmVmaXggPSAvXlxcXigoPzpcXFxcW15hLXpBLVowLTldfFteXFxcXFxcW1xcXVxcXiQqKz8uKCl8e31dKykqKS8uZXhlYyhyZS5zb3VyY2UpO1xuICAgIHJldHVybiAocHJlZml4ICE9IG51bGwpID8gcHJlZml4WzFdLnJlcGxhY2UoL1xcXFwoLikvZywgXCIkMVwiKSA6ICcnO1xuICB9XG5cbiAgLy8gSW50ZXJwb2xhdGVzIG1hdGNoZWQgdmFsdWVzIGludG8gYSBTdHJpbmcucmVwbGFjZSgpLXN0eWxlIHBhdHRlcm5cbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUocGF0dGVybiwgbWF0Y2gpIHtcbiAgICByZXR1cm4gcGF0dGVybi5yZXBsYWNlKC9cXCQoXFwkfFxcZHsxLDJ9KS8sIGZ1bmN0aW9uIChtLCB3aGF0KSB7XG4gICAgICByZXR1cm4gbWF0Y2hbd2hhdCA9PT0gJyQnID8gMCA6IE51bWJlcih3aGF0KV07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyI3J1bGVcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBEZWZpbmVzIHJ1bGVzIHRoYXQgYXJlIHVzZWQgYnkgYCR1cmxSb3V0ZXJQcm92aWRlcmAgdG8gZmluZCBtYXRjaGVzIGZvclxuICAgKiBzcGVjaWZpYyBVUkxzLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiA8cHJlPlxuICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyLnJvdXRlciddKTtcbiAgICpcbiAgICogYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAqICAgLy8gSGVyZSdzIGFuIGV4YW1wbGUgb2YgaG93IHlvdSBtaWdodCBhbGxvdyBjYXNlIGluc2Vuc2l0aXZlIHVybHNcbiAgICogICAkdXJsUm91dGVyUHJvdmlkZXIucnVsZShmdW5jdGlvbiAoJGluamVjdG9yLCAkbG9jYXRpb24pIHtcbiAgICogICAgIHZhciBwYXRoID0gJGxvY2F0aW9uLnBhdGgoKSxcbiAgICogICAgICAgICBub3JtYWxpemVkID0gcGF0aC50b0xvd2VyQ2FzZSgpO1xuICAgKlxuICAgKiAgICAgaWYgKHBhdGggIT09IG5vcm1hbGl6ZWQpIHtcbiAgICogICAgICAgcmV0dXJuIG5vcm1hbGl6ZWQ7XG4gICAqICAgICB9XG4gICAqICAgfSk7XG4gICAqIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gcnVsZSBIYW5kbGVyIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYCRpbmplY3RvcmAgYW5kIGAkbG9jYXRpb25gXG4gICAqIHNlcnZpY2VzIGFzIGFyZ3VtZW50cy4gWW91IGNhbiB1c2UgdGhlbSB0byByZXR1cm4gYSB2YWxpZCBwYXRoIGFzIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGAkdXJsUm91dGVyUHJvdmlkZXJgIC0gYCR1cmxSb3V0ZXJQcm92aWRlcmAgaW5zdGFuY2VcbiAgICovXG4gIHRoaXMucnVsZSA9IGZ1bmN0aW9uIChydWxlKSB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uKHJ1bGUpKSB0aHJvdyBuZXcgRXJyb3IoXCIncnVsZScgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgIHJ1bGVzLnB1c2gocnVsZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBvYmplY3RcbiAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXIjb3RoZXJ3aXNlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogRGVmaW5lcyBhIHBhdGggdGhhdCBpcyB1c2VkIHdoZW4gYW4gaW52YWxpZCByb3V0ZSBpcyByZXF1ZXN0ZWQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIDxwcmU+XG4gICAqIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXIucm91dGVyJ10pO1xuICAgKlxuICAgKiBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICogICAvLyBpZiB0aGUgcGF0aCBkb2Vzbid0IG1hdGNoIGFueSBvZiB0aGUgdXJscyB5b3UgY29uZmlndXJlZFxuICAgKiAgIC8vIG90aGVyd2lzZSB3aWxsIHRha2UgY2FyZSBvZiByb3V0aW5nIHRoZSB1c2VyIHRvIHRoZVxuICAgKiAgIC8vIHNwZWNpZmllZCB1cmxcbiAgICogICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvaW5kZXgnKTtcbiAgICpcbiAgICogICAvLyBFeGFtcGxlIG9mIHVzaW5nIGZ1bmN0aW9uIHJ1bGUgYXMgcGFyYW1cbiAgICogICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKGZ1bmN0aW9uICgkaW5qZWN0b3IsICRsb2NhdGlvbikge1xuICAgKiAgICAgcmV0dXJuICcvYS92YWxpZC91cmwnO1xuICAgKiAgIH0pO1xuICAgKiB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBydWxlIFRoZSB1cmwgcGF0aCB5b3Ugd2FudCB0byByZWRpcmVjdCB0byBvciBhIGZ1bmN0aW9uIFxuICAgKiBydWxlIHRoYXQgcmV0dXJucyB0aGUgdXJsIHBhdGguIFRoZSBmdW5jdGlvbiB2ZXJzaW9uIGlzIHBhc3NlZCB0d28gcGFyYW1zOiBcbiAgICogYCRpbmplY3RvcmAgYW5kIGAkbG9jYXRpb25gIHNlcnZpY2VzLCBhbmQgbXVzdCByZXR1cm4gYSB1cmwgc3RyaW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9IGAkdXJsUm91dGVyUHJvdmlkZXJgIC0gYCR1cmxSb3V0ZXJQcm92aWRlcmAgaW5zdGFuY2VcbiAgICovXG4gIHRoaXMub3RoZXJ3aXNlID0gZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICBpZiAoaXNTdHJpbmcocnVsZSkpIHtcbiAgICAgIHZhciByZWRpcmVjdCA9IHJ1bGU7XG4gICAgICBydWxlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVkaXJlY3Q7IH07XG4gICAgfVxuICAgIGVsc2UgaWYgKCFpc0Z1bmN0aW9uKHJ1bGUpKSB0aHJvdyBuZXcgRXJyb3IoXCIncnVsZScgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgIG90aGVyd2lzZSA9IHJ1bGU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cblxuICBmdW5jdGlvbiBoYW5kbGVJZk1hdGNoKCRpbmplY3RvciwgaGFuZGxlciwgbWF0Y2gpIHtcbiAgICBpZiAoIW1hdGNoKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIHJlc3VsdCA9ICRpbmplY3Rvci5pbnZva2UoaGFuZGxlciwgaGFuZGxlciwgeyAkbWF0Y2g6IG1hdGNoIH0pO1xuICAgIHJldHVybiBpc0RlZmluZWQocmVzdWx0KSA/IHJlc3VsdCA6IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyI3doZW5cbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZWdpc3RlcnMgYSBoYW5kbGVyIGZvciBhIGdpdmVuIHVybCBtYXRjaGluZy4gXG4gICAqIFxuICAgKiBJZiB0aGUgaGFuZGxlciBpcyBhIHN0cmluZywgaXQgaXNcbiAgICogdHJlYXRlZCBhcyBhIHJlZGlyZWN0LCBhbmQgaXMgaW50ZXJwb2xhdGVkIGFjY29yZGluZyB0byB0aGUgc3ludGF4IG9mIG1hdGNoXG4gICAqIChpLmUuIGxpa2UgYFN0cmluZy5yZXBsYWNlKClgIGZvciBgUmVnRXhwYCwgb3IgbGlrZSBhIGBVcmxNYXRjaGVyYCBwYXR0ZXJuIG90aGVyd2lzZSkuXG4gICAqXG4gICAqIElmIHRoZSBoYW5kbGVyIGlzIGEgZnVuY3Rpb24sIGl0IGlzIGluamVjdGFibGUuIEl0IGdldHMgaW52b2tlZCBpZiBgJGxvY2F0aW9uYFxuICAgKiBtYXRjaGVzLiBZb3UgaGF2ZSB0aGUgb3B0aW9uIG9mIGluamVjdCB0aGUgbWF0Y2ggb2JqZWN0IGFzIGAkbWF0Y2hgLlxuICAgKlxuICAgKiBUaGUgaGFuZGxlciBjYW4gcmV0dXJuXG4gICAqXG4gICAqIC0gKipmYWxzeSoqIHRvIGluZGljYXRlIHRoYXQgdGhlIHJ1bGUgZGlkbid0IG1hdGNoIGFmdGVyIGFsbCwgdGhlbiBgJHVybFJvdXRlcmBcbiAgICogICB3aWxsIGNvbnRpbnVlIHRyeWluZyB0byBmaW5kIGFub3RoZXIgb25lIHRoYXQgbWF0Y2hlcy5cbiAgICogLSAqKnN0cmluZyoqIHdoaWNoIGlzIHRyZWF0ZWQgYXMgYSByZWRpcmVjdCBhbmQgcGFzc2VkIHRvIGAkbG9jYXRpb24udXJsKClgXG4gICAqIC0gKip2b2lkKiogb3IgYW55ICoqdHJ1dGh5KiogdmFsdWUgdGVsbHMgYCR1cmxSb3V0ZXJgIHRoYXQgdGhlIHVybCB3YXMgaGFuZGxlZC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogPHByZT5cbiAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlci5yb3V0ZXInXSk7XG4gICAqXG4gICAqIGFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci53aGVuKCRzdGF0ZS51cmwsIGZ1bmN0aW9uICgkbWF0Y2gsICRzdGF0ZVBhcmFtcykge1xuICAgKiAgICAgaWYgKCRzdGF0ZS4kY3VycmVudC5uYXZpZ2FibGUgIT09IHN0YXRlIHx8XG4gICAqICAgICAgICAgIWVxdWFsRm9yS2V5cygkbWF0Y2gsICRzdGF0ZVBhcmFtcykge1xuICAgKiAgICAgICRzdGF0ZS50cmFuc2l0aW9uVG8oc3RhdGUsICRtYXRjaCwgZmFsc2UpO1xuICAgKiAgICAgfVxuICAgKiAgIH0pO1xuICAgKiB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gd2hhdCBUaGUgaW5jb21pbmcgcGF0aCB0aGF0IHlvdSB3YW50IHRvIHJlZGlyZWN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gaGFuZGxlciBUaGUgcGF0aCB5b3Ugd2FudCB0byByZWRpcmVjdCB5b3VyIHVzZXIgdG8uXG4gICAqL1xuICB0aGlzLndoZW4gPSBmdW5jdGlvbiAod2hhdCwgaGFuZGxlcikge1xuICAgIHZhciByZWRpcmVjdCwgaGFuZGxlcklzU3RyaW5nID0gaXNTdHJpbmcoaGFuZGxlcik7XG4gICAgaWYgKGlzU3RyaW5nKHdoYXQpKSB3aGF0ID0gJHVybE1hdGNoZXJGYWN0b3J5LmNvbXBpbGUod2hhdCk7XG5cbiAgICBpZiAoIWhhbmRsZXJJc1N0cmluZyAmJiAhaXNGdW5jdGlvbihoYW5kbGVyKSAmJiAhaXNBcnJheShoYW5kbGVyKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgJ2hhbmRsZXInIGluIHdoZW4oKVwiKTtcblxuICAgIHZhciBzdHJhdGVnaWVzID0ge1xuICAgICAgbWF0Y2hlcjogZnVuY3Rpb24gKHdoYXQsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKGhhbmRsZXJJc1N0cmluZykge1xuICAgICAgICAgIHJlZGlyZWN0ID0gJHVybE1hdGNoZXJGYWN0b3J5LmNvbXBpbGUoaGFuZGxlcik7XG4gICAgICAgICAgaGFuZGxlciA9IFsnJG1hdGNoJywgZnVuY3Rpb24gKCRtYXRjaCkgeyByZXR1cm4gcmVkaXJlY3QuZm9ybWF0KCRtYXRjaCk7IH1dO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleHRlbmQoZnVuY3Rpb24gKCRpbmplY3RvciwgJGxvY2F0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGhhbmRsZUlmTWF0Y2goJGluamVjdG9yLCBoYW5kbGVyLCB3aGF0LmV4ZWMoJGxvY2F0aW9uLnBhdGgoKSwgJGxvY2F0aW9uLnNlYXJjaCgpKSk7XG4gICAgICAgIH0sIHtcbiAgICAgICAgICBwcmVmaXg6IGlzU3RyaW5nKHdoYXQucHJlZml4KSA/IHdoYXQucHJlZml4IDogJydcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgcmVnZXg6IGZ1bmN0aW9uICh3aGF0LCBoYW5kbGVyKSB7XG4gICAgICAgIGlmICh3aGF0Lmdsb2JhbCB8fCB3aGF0LnN0aWNreSkgdGhyb3cgbmV3IEVycm9yKFwid2hlbigpIFJlZ0V4cCBtdXN0IG5vdCBiZSBnbG9iYWwgb3Igc3RpY2t5XCIpO1xuXG4gICAgICAgIGlmIChoYW5kbGVySXNTdHJpbmcpIHtcbiAgICAgICAgICByZWRpcmVjdCA9IGhhbmRsZXI7XG4gICAgICAgICAgaGFuZGxlciA9IFsnJG1hdGNoJywgZnVuY3Rpb24gKCRtYXRjaCkgeyByZXR1cm4gaW50ZXJwb2xhdGUocmVkaXJlY3QsICRtYXRjaCk7IH1dO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleHRlbmQoZnVuY3Rpb24gKCRpbmplY3RvciwgJGxvY2F0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIGhhbmRsZUlmTWF0Y2goJGluamVjdG9yLCBoYW5kbGVyLCB3aGF0LmV4ZWMoJGxvY2F0aW9uLnBhdGgoKSkpO1xuICAgICAgICB9LCB7XG4gICAgICAgICAgcHJlZml4OiByZWdFeHBQcmVmaXgod2hhdClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHZhciBjaGVjayA9IHsgbWF0Y2hlcjogJHVybE1hdGNoZXJGYWN0b3J5LmlzTWF0Y2hlcih3aGF0KSwgcmVnZXg6IHdoYXQgaW5zdGFuY2VvZiBSZWdFeHAgfTtcblxuICAgIGZvciAodmFyIG4gaW4gY2hlY2spIHtcbiAgICAgIGlmIChjaGVja1tuXSkgcmV0dXJuIHRoaXMucnVsZShzdHJhdGVnaWVzW25dKHdoYXQsIGhhbmRsZXIpKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkICd3aGF0JyBpbiB3aGVuKClcIik7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlciNkZWZlckludGVyY2VwdFxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIERpc2FibGVzIChvciBlbmFibGVzKSBkZWZlcnJpbmcgbG9jYXRpb24gY2hhbmdlIGludGVyY2VwdGlvbi5cbiAgICpcbiAgICogSWYgeW91IHdpc2ggdG8gY3VzdG9taXplIHRoZSBiZWhhdmlvciBvZiBzeW5jaW5nIHRoZSBVUkwgKGZvciBleGFtcGxlLCBpZiB5b3Ugd2lzaCB0b1xuICAgKiBkZWZlciBhIHRyYW5zaXRpb24gYnV0IG1haW50YWluIHRoZSBjdXJyZW50IFVSTCksIGNhbGwgdGhpcyBtZXRob2QgYXQgY29uZmlndXJhdGlvbiB0aW1lLlxuICAgKiBUaGVuLCBhdCBydW4gdGltZSwgY2FsbCBgJHVybFJvdXRlci5saXN0ZW4oKWAgYWZ0ZXIgeW91IGhhdmUgY29uZmlndXJlZCB5b3VyIG93blxuICAgKiBgJGxvY2F0aW9uQ2hhbmdlU3VjY2Vzc2AgZXZlbnQgaGFuZGxlci5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogPHByZT5cbiAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlci5yb3V0ZXInXSk7XG4gICAqXG4gICAqIGFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgKlxuICAgKiAgIC8vIFByZXZlbnQgJHVybFJvdXRlciBmcm9tIGF1dG9tYXRpY2FsbHkgaW50ZXJjZXB0aW5nIFVSTCBjaGFuZ2VzO1xuICAgKiAgIC8vIHRoaXMgYWxsb3dzIHlvdSB0byBjb25maWd1cmUgY3VzdG9tIGJlaGF2aW9yIGluIGJldHdlZW5cbiAgICogICAvLyBsb2NhdGlvbiBjaGFuZ2VzIGFuZCByb3V0ZSBzeW5jaHJvbml6YXRpb246XG4gICAqICAgJHVybFJvdXRlclByb3ZpZGVyLmRlZmVySW50ZXJjZXB0KCk7XG4gICAqXG4gICAqIH0pLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHVybFJvdXRlciwgVXNlclNlcnZpY2UpIHtcbiAgICpcbiAgICogICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICogICAgIC8vIFVzZXJTZXJ2aWNlIGlzIGFuIGV4YW1wbGUgc2VydmljZSBmb3IgbWFuYWdpbmcgdXNlciBzdGF0ZVxuICAgKiAgICAgaWYgKFVzZXJTZXJ2aWNlLmlzTG9nZ2VkSW4oKSkgcmV0dXJuO1xuICAgKlxuICAgKiAgICAgLy8gUHJldmVudCAkdXJsUm91dGVyJ3MgZGVmYXVsdCBoYW5kbGVyIGZyb20gZmlyaW5nXG4gICAqICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAqXG4gICAqICAgICBVc2VyU2VydmljZS5oYW5kbGVMb2dpbigpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAqICAgICAgIC8vIE9uY2UgdGhlIHVzZXIgaGFzIGxvZ2dlZCBpbiwgc3luYyB0aGUgY3VycmVudCBVUkxcbiAgICogICAgICAgLy8gdG8gdGhlIHJvdXRlcjpcbiAgICogICAgICAgJHVybFJvdXRlci5zeW5jKCk7XG4gICAqICAgICB9KTtcbiAgICogICB9KTtcbiAgICpcbiAgICogICAvLyBDb25maWd1cmVzICR1cmxSb3V0ZXIncyBsaXN0ZW5lciAqYWZ0ZXIqIHlvdXIgY3VzdG9tIGxpc3RlbmVyXG4gICAqICAgJHVybFJvdXRlci5saXN0ZW4oKTtcbiAgICogfSk7XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGRlZmVyIEluZGljYXRlcyB3aGV0aGVyIHRvIGRlZmVyIGxvY2F0aW9uIGNoYW5nZSBpbnRlcmNlcHRpb24uIFBhc3NpbmdcbiAgICAgICAgICAgIG5vIHBhcmFtZXRlciBpcyBlcXVpdmFsZW50IHRvIGB0cnVlYC5cbiAgICovXG4gIHRoaXMuZGVmZXJJbnRlcmNlcHQgPSBmdW5jdGlvbiAoZGVmZXIpIHtcbiAgICBpZiAoZGVmZXIgPT09IHVuZGVmaW5lZCkgZGVmZXIgPSB0cnVlO1xuICAgIGludGVyY2VwdERlZmVycmVkID0gZGVmZXI7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBvYmplY3RcbiAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyXG4gICAqXG4gICAqIEByZXF1aXJlcyAkbG9jYXRpb25cbiAgICogQHJlcXVpcmVzICRyb290U2NvcGVcbiAgICogQHJlcXVpcmVzICRpbmplY3RvclxuICAgKiBAcmVxdWlyZXMgJGJyb3dzZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqXG4gICAqL1xuICB0aGlzLiRnZXQgPSAkZ2V0O1xuICAkZ2V0LiRpbmplY3QgPSBbJyRsb2NhdGlvbicsICckcm9vdFNjb3BlJywgJyRpbmplY3RvcicsICckYnJvd3NlcicsICckc25pZmZlciddO1xuICBmdW5jdGlvbiAkZ2V0KCAgICRsb2NhdGlvbiwgICAkcm9vdFNjb3BlLCAgICRpbmplY3RvciwgICAkYnJvd3NlciwgICAkc25pZmZlcikge1xuXG4gICAgdmFyIGJhc2VIcmVmID0gJGJyb3dzZXIuYmFzZUhyZWYoKSwgbG9jYXRpb24gPSAkbG9jYXRpb24udXJsKCksIGxhc3RQdXNoZWRVcmw7XG5cbiAgICBmdW5jdGlvbiBhcHBlbmRCYXNlUGF0aCh1cmwsIGlzSHRtbDUsIGFic29sdXRlKSB7XG4gICAgICBpZiAoYmFzZUhyZWYgPT09ICcvJykgcmV0dXJuIHVybDtcbiAgICAgIGlmIChpc0h0bWw1KSByZXR1cm4gYmFzZUhyZWYuc2xpY2UoMCwgLTEpICsgdXJsO1xuICAgICAgaWYgKGFic29sdXRlKSByZXR1cm4gYmFzZUhyZWYuc2xpY2UoMSkgKyB1cmw7XG4gICAgICByZXR1cm4gdXJsO1xuICAgIH1cblxuICAgIC8vIFRPRE86IE9wdGltaXplIGdyb3VwcyBvZiBydWxlcyB3aXRoIG5vbi1lbXB0eSBwcmVmaXggaW50byBzb21lIHNvcnQgb2YgZGVjaXNpb24gdHJlZVxuICAgIGZ1bmN0aW9uIHVwZGF0ZShldnQpIHtcbiAgICAgIGlmIChldnQgJiYgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcbiAgICAgIHZhciBpZ25vcmVVcGRhdGUgPSBsYXN0UHVzaGVkVXJsICYmICRsb2NhdGlvbi51cmwoKSA9PT0gbGFzdFB1c2hlZFVybDtcbiAgICAgIGxhc3RQdXNoZWRVcmwgPSB1bmRlZmluZWQ7XG4gICAgICAvLyBUT0RPOiBSZS1pbXBsZW1lbnQgdGhpcyBpbiAxLjAgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyLXVpL3VpLXJvdXRlci9pc3N1ZXMvMTU3M1xuICAgICAgLy9pZiAoaWdub3JlVXBkYXRlKSByZXR1cm4gdHJ1ZTtcblxuICAgICAgZnVuY3Rpb24gY2hlY2socnVsZSkge1xuICAgICAgICB2YXIgaGFuZGxlZCA9IHJ1bGUoJGluamVjdG9yLCAkbG9jYXRpb24pO1xuXG4gICAgICAgIGlmICghaGFuZGxlZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoaXNTdHJpbmcoaGFuZGxlZCkpICRsb2NhdGlvbi5yZXBsYWNlKCkudXJsKGhhbmRsZWQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBuID0gcnVsZXMubGVuZ3RoLCBpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIGlmIChjaGVjayhydWxlc1tpXSkpIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGFsd2F5cyBjaGVjayBvdGhlcndpc2UgbGFzdCB0byBhbGxvdyBkeW5hbWljIHVwZGF0ZXMgdG8gdGhlIHNldCBvZiBydWxlc1xuICAgICAgaWYgKG90aGVyd2lzZSkgY2hlY2sob3RoZXJ3aXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaXN0ZW4oKSB7XG4gICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyIHx8ICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgdXBkYXRlKTtcbiAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICB9XG5cbiAgICBpZiAoIWludGVyY2VwdERlZmVycmVkKSBsaXN0ZW4oKTtcblxuICAgIHJldHVybiB7XG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyI3N5bmNcbiAgICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIFRyaWdnZXJzIGFuIHVwZGF0ZTsgdGhlIHNhbWUgdXBkYXRlIHRoYXQgaGFwcGVucyB3aGVuIHRoZSBhZGRyZXNzIGJhciB1cmwgY2hhbmdlcywgYWthIGAkbG9jYXRpb25DaGFuZ2VTdWNjZXNzYC5cbiAgICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWZ1bCB3aGVuIHlvdSBuZWVkIHRvIHVzZSBgcHJldmVudERlZmF1bHQoKWAgb24gdGhlIGAkbG9jYXRpb25DaGFuZ2VTdWNjZXNzYCBldmVudCxcbiAgICAgICAqIHBlcmZvcm0gc29tZSBjdXN0b20gbG9naWMgKHJvdXRlIHByb3RlY3Rpb24sIGF1dGgsIGNvbmZpZywgcmVkaXJlY3Rpb24sIGV0YykgYW5kIHRoZW4gZmluYWxseSBwcm9jZWVkXG4gICAgICAgKiB3aXRoIHRoZSB0cmFuc2l0aW9uIGJ5IGNhbGxpbmcgYCR1cmxSb3V0ZXIuc3luYygpYC5cbiAgICAgICAqXG4gICAgICAgKiBAZXhhbXBsZVxuICAgICAgICogPHByZT5cbiAgICAgICAqIGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlciddKVxuICAgICAgICogICAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICR1cmxSb3V0ZXIpIHtcbiAgICAgICAqICAgICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKGV2dCkge1xuICAgICAgICogICAgICAgLy8gSGFsdCBzdGF0ZSBjaGFuZ2UgZnJvbSBldmVuIHN0YXJ0aW5nXG4gICAgICAgKiAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAqICAgICAgIC8vIFBlcmZvcm0gY3VzdG9tIGxvZ2ljXG4gICAgICAgKiAgICAgICB2YXIgbWVldHNSZXF1aXJlbWVudCA9IC4uLlxuICAgICAgICogICAgICAgLy8gQ29udGludWUgd2l0aCB0aGUgdXBkYXRlIGFuZCBzdGF0ZSB0cmFuc2l0aW9uIGlmIGxvZ2ljIGFsbG93c1xuICAgICAgICogICAgICAgaWYgKG1lZXRzUmVxdWlyZW1lbnQpICR1cmxSb3V0ZXIuc3luYygpO1xuICAgICAgICogICAgIH0pO1xuICAgICAgICogfSk7XG4gICAgICAgKiA8L3ByZT5cbiAgICAgICAqL1xuICAgICAgc3luYzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgfSxcblxuICAgICAgbGlzdGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbigpO1xuICAgICAgfSxcblxuICAgICAgdXBkYXRlOiBmdW5jdGlvbihyZWFkKSB7XG4gICAgICAgIGlmIChyZWFkKSB7XG4gICAgICAgICAgbG9jYXRpb24gPSAkbG9jYXRpb24udXJsKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkbG9jYXRpb24udXJsKCkgPT09IGxvY2F0aW9uKSByZXR1cm47XG5cbiAgICAgICAgJGxvY2F0aW9uLnVybChsb2NhdGlvbik7XG4gICAgICAgICRsb2NhdGlvbi5yZXBsYWNlKCk7XG4gICAgICB9LFxuXG4gICAgICBwdXNoOiBmdW5jdGlvbih1cmxNYXRjaGVyLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgIHZhciB1cmwgPSB1cmxNYXRjaGVyLmZvcm1hdChwYXJhbXMgfHwge30pO1xuXG4gICAgICAgIC8vIEhhbmRsZSB0aGUgc3BlY2lhbCBoYXNoIHBhcmFtLCBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHVybCAhPT0gbnVsbCAmJiBwYXJhbXMgJiYgcGFyYW1zWycjJ10pIHtcbiAgICAgICAgICAgIHVybCArPSAnIycgKyBwYXJhbXNbJyMnXTtcbiAgICAgICAgfVxuXG4gICAgICAgICRsb2NhdGlvbi51cmwodXJsKTtcbiAgICAgICAgbGFzdFB1c2hlZFVybCA9IG9wdGlvbnMgJiYgb3B0aW9ucy4kJGF2b2lkUmVzeW5jID8gJGxvY2F0aW9uLnVybCgpIDogdW5kZWZpbmVkO1xuICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnJlcGxhY2UpICRsb2NhdGlvbi5yZXBsYWNlKCk7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyI2hyZWZcbiAgICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIEEgVVJMIGdlbmVyYXRpb24gbWV0aG9kIHRoYXQgcmV0dXJucyB0aGUgY29tcGlsZWQgVVJMIGZvciBhIGdpdmVuXG4gICAgICAgKiB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIGBVcmxNYXRjaGVyYH0sIHBvcHVsYXRlZCB3aXRoIHRoZSBwcm92aWRlZCBwYXJhbWV0ZXJzLlxuICAgICAgICpcbiAgICAgICAqIEBleGFtcGxlXG4gICAgICAgKiA8cHJlPlxuICAgICAgICogJGJvYiA9ICR1cmxSb3V0ZXIuaHJlZihuZXcgVXJsTWF0Y2hlcihcIi9hYm91dC86cGVyc29uXCIpLCB7XG4gICAgICAgKiAgIHBlcnNvbjogXCJib2JcIlxuICAgICAgICogfSk7XG4gICAgICAgKiAvLyAkYm9iID09IFwiL2Fib3V0L2JvYlwiO1xuICAgICAgICogPC9wcmU+XG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtVcmxNYXRjaGVyfSB1cmxNYXRjaGVyIFRoZSBgVXJsTWF0Y2hlcmAgb2JqZWN0IHdoaWNoIGlzIHVzZWQgYXMgdGhlIHRlbXBsYXRlIG9mIHRoZSBVUkwgdG8gZ2VuZXJhdGUuXG4gICAgICAgKiBAcGFyYW0ge29iamVjdD19IHBhcmFtcyBBbiBvYmplY3Qgb2YgcGFyYW1ldGVyIHZhbHVlcyB0byBmaWxsIHRoZSBtYXRjaGVyJ3MgcmVxdWlyZWQgcGFyYW1ldGVycy5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0aW9ucyBPcHRpb25zIG9iamVjdC4gVGhlIG9wdGlvbnMgYXJlOlxuICAgICAgICpcbiAgICAgICAqIC0gKipgYWJzb2x1dGVgKiogLSB7Ym9vbGVhbj1mYWxzZX0sICBJZiB0cnVlIHdpbGwgZ2VuZXJhdGUgYW4gYWJzb2x1dGUgdXJsLCBlLmcuIFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9mdWxsdXJsXCIuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgZnVsbHkgY29tcGlsZWQgVVJMLCBvciBgbnVsbGAgaWYgYHBhcmFtc2AgZmFpbCB2YWxpZGF0aW9uIGFnYWluc3QgYHVybE1hdGNoZXJgXG4gICAgICAgKi9cbiAgICAgIGhyZWY6IGZ1bmN0aW9uKHVybE1hdGNoZXIsIHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgICBpZiAoIXVybE1hdGNoZXIudmFsaWRhdGVzKHBhcmFtcykpIHJldHVybiBudWxsO1xuXG4gICAgICAgIHZhciBpc0h0bWw1ID0gJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKCk7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KGlzSHRtbDUpKSB7XG4gICAgICAgICAgaXNIdG1sNSA9IGlzSHRtbDUuZW5hYmxlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlzSHRtbDUgPSBpc0h0bWw1ICYmICRzbmlmZmVyLmhpc3Rvcnk7XG4gICAgICAgIFxuICAgICAgICB2YXIgdXJsID0gdXJsTWF0Y2hlci5mb3JtYXQocGFyYW1zKTtcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgICAgaWYgKCFpc0h0bWw1ICYmIHVybCAhPT0gbnVsbCkge1xuICAgICAgICAgIHVybCA9IFwiI1wiICsgJGxvY2F0aW9uUHJvdmlkZXIuaGFzaFByZWZpeCgpICsgdXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSGFuZGxlIHNwZWNpYWwgaGFzaCBwYXJhbSwgaWYgbmVlZGVkXG4gICAgICAgIGlmICh1cmwgIT09IG51bGwgJiYgcGFyYW1zICYmIHBhcmFtc1snIyddKSB7XG4gICAgICAgICAgdXJsICs9ICcjJyArIHBhcmFtc1snIyddO1xuICAgICAgICB9XG5cbiAgICAgICAgdXJsID0gYXBwZW5kQmFzZVBhdGgodXJsLCBpc0h0bWw1LCBvcHRpb25zLmFic29sdXRlKTtcblxuICAgICAgICBpZiAoIW9wdGlvbnMuYWJzb2x1dGUgfHwgIXVybCkge1xuICAgICAgICAgIHJldHVybiB1cmw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2xhc2ggPSAoIWlzSHRtbDUgJiYgdXJsID8gJy8nIDogJycpLCBwb3J0ID0gJGxvY2F0aW9uLnBvcnQoKTtcbiAgICAgICAgcG9ydCA9IChwb3J0ID09PSA4MCB8fCBwb3J0ID09PSA0NDMgPyAnJyA6ICc6JyArIHBvcnQpO1xuXG4gICAgICAgIHJldHVybiBbJGxvY2F0aW9uLnByb3RvY29sKCksICc6Ly8nLCAkbG9jYXRpb24uaG9zdCgpLCBwb3J0LCBzbGFzaCwgdXJsXS5qb2luKCcnKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIucm91dGVyJykucHJvdmlkZXIoJyR1cmxSb3V0ZXInLCAkVXJsUm91dGVyUHJvdmlkZXIpO1xuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQcm92aWRlclxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgbmV3IGAkc3RhdGVQcm92aWRlcmAgd29ya3Mgc2ltaWxhciB0byBBbmd1bGFyJ3MgdjEgcm91dGVyLCBidXQgaXQgZm9jdXNlcyBwdXJlbHlcbiAqIG9uIHN0YXRlLlxuICpcbiAqIEEgc3RhdGUgY29ycmVzcG9uZHMgdG8gYSBcInBsYWNlXCIgaW4gdGhlIGFwcGxpY2F0aW9uIGluIHRlcm1zIG9mIHRoZSBvdmVyYWxsIFVJIGFuZFxuICogbmF2aWdhdGlvbi4gQSBzdGF0ZSBkZXNjcmliZXMgKHZpYSB0aGUgY29udHJvbGxlciAvIHRlbXBsYXRlIC8gdmlldyBwcm9wZXJ0aWVzKSB3aGF0XG4gKiB0aGUgVUkgbG9va3MgbGlrZSBhbmQgZG9lcyBhdCB0aGF0IHBsYWNlLlxuICpcbiAqIFN0YXRlcyBvZnRlbiBoYXZlIHRoaW5ncyBpbiBjb21tb24sIGFuZCB0aGUgcHJpbWFyeSB3YXkgb2YgZmFjdG9yaW5nIG91dCB0aGVzZVxuICogY29tbW9uYWxpdGllcyBpbiB0aGlzIG1vZGVsIGlzIHZpYSB0aGUgc3RhdGUgaGllcmFyY2h5LCBpLmUuIHBhcmVudC9jaGlsZCBzdGF0ZXMgYWthXG4gKiBuZXN0ZWQgc3RhdGVzLlxuICpcbiAqIFRoZSBgJHN0YXRlUHJvdmlkZXJgIHByb3ZpZGVzIGludGVyZmFjZXMgdG8gZGVjbGFyZSB0aGVzZSBzdGF0ZXMgZm9yIHlvdXIgYXBwLlxuICovXG4kU3RhdGVQcm92aWRlci4kaW5qZWN0ID0gWyckdXJsUm91dGVyUHJvdmlkZXInLCAnJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXInXTtcbmZ1bmN0aW9uICRTdGF0ZVByb3ZpZGVyKCAgICR1cmxSb3V0ZXJQcm92aWRlciwgICAkdXJsTWF0Y2hlckZhY3RvcnkpIHtcblxuICB2YXIgcm9vdCwgc3RhdGVzID0ge30sICRzdGF0ZSwgcXVldWUgPSB7fSwgYWJzdHJhY3RLZXkgPSAnYWJzdHJhY3QnO1xuXG4gIC8vIEJ1aWxkcyBzdGF0ZSBwcm9wZXJ0aWVzIGZyb20gZGVmaW5pdGlvbiBwYXNzZWQgdG8gcmVnaXN0ZXJTdGF0ZSgpXG4gIHZhciBzdGF0ZUJ1aWxkZXIgPSB7XG5cbiAgICAvLyBEZXJpdmUgcGFyZW50IHN0YXRlIGZyb20gYSBoaWVyYXJjaGljYWwgbmFtZSBvbmx5IGlmICdwYXJlbnQnIGlzIG5vdCBleHBsaWNpdGx5IGRlZmluZWQuXG4gICAgLy8gc3RhdGUuY2hpbGRyZW4gPSBbXTtcbiAgICAvLyBpZiAocGFyZW50KSBwYXJlbnQuY2hpbGRyZW4ucHVzaChzdGF0ZSk7XG4gICAgcGFyZW50OiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKGlzRGVmaW5lZChzdGF0ZS5wYXJlbnQpICYmIHN0YXRlLnBhcmVudCkgcmV0dXJuIGZpbmRTdGF0ZShzdGF0ZS5wYXJlbnQpO1xuICAgICAgLy8gcmVnZXggbWF0Y2hlcyBhbnkgdmFsaWQgY29tcG9zaXRlIHN0YXRlIG5hbWVcbiAgICAgIC8vIHdvdWxkIG1hdGNoIFwiY29udGFjdC5saXN0XCIgYnV0IG5vdCBcImNvbnRhY3RzXCJcbiAgICAgIHZhciBjb21wb3NpdGVOYW1lID0gL14oLispXFwuW14uXSskLy5leGVjKHN0YXRlLm5hbWUpO1xuICAgICAgcmV0dXJuIGNvbXBvc2l0ZU5hbWUgPyBmaW5kU3RhdGUoY29tcG9zaXRlTmFtZVsxXSkgOiByb290O1xuICAgIH0sXG5cbiAgICAvLyBpbmhlcml0ICdkYXRhJyBmcm9tIHBhcmVudCBhbmQgb3ZlcnJpZGUgYnkgb3duIHZhbHVlcyAoaWYgYW55KVxuICAgIGRhdGE6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICBpZiAoc3RhdGUucGFyZW50ICYmIHN0YXRlLnBhcmVudC5kYXRhKSB7XG4gICAgICAgIHN0YXRlLmRhdGEgPSBzdGF0ZS5zZWxmLmRhdGEgPSBpbmhlcml0KHN0YXRlLnBhcmVudC5kYXRhLCBzdGF0ZS5kYXRhKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdGF0ZS5kYXRhO1xuICAgIH0sXG5cbiAgICAvLyBCdWlsZCBhIFVSTE1hdGNoZXIgaWYgbmVjZXNzYXJ5LCBlaXRoZXIgdmlhIGEgcmVsYXRpdmUgb3IgYWJzb2x1dGUgVVJMXG4gICAgdXJsOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdmFyIHVybCA9IHN0YXRlLnVybCwgY29uZmlnID0geyBwYXJhbXM6IHN0YXRlLnBhcmFtcyB8fCB7fSB9O1xuXG4gICAgICBpZiAoaXNTdHJpbmcodXJsKSkge1xuICAgICAgICBpZiAodXJsLmNoYXJBdCgwKSA9PSAnXicpIHJldHVybiAkdXJsTWF0Y2hlckZhY3RvcnkuY29tcGlsZSh1cmwuc3Vic3RyaW5nKDEpLCBjb25maWcpO1xuICAgICAgICByZXR1cm4gKHN0YXRlLnBhcmVudC5uYXZpZ2FibGUgfHwgcm9vdCkudXJsLmNvbmNhdCh1cmwsIGNvbmZpZyk7XG4gICAgICB9XG5cbiAgICAgIGlmICghdXJsIHx8ICR1cmxNYXRjaGVyRmFjdG9yeS5pc01hdGNoZXIodXJsKSkgcmV0dXJuIHVybDtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdXJsICdcIiArIHVybCArIFwiJyBpbiBzdGF0ZSAnXCIgKyBzdGF0ZSArIFwiJ1wiKTtcbiAgICB9LFxuXG4gICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgY2xvc2VzdCBhbmNlc3RvciBzdGF0ZSB0aGF0IGhhcyBhIFVSTCAoaS5lLiBpcyBuYXZpZ2FibGUpXG4gICAgbmF2aWdhYmxlOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgcmV0dXJuIHN0YXRlLnVybCA/IHN0YXRlIDogKHN0YXRlLnBhcmVudCA/IHN0YXRlLnBhcmVudC5uYXZpZ2FibGUgOiBudWxsKTtcbiAgICB9LFxuXG4gICAgLy8gT3duIHBhcmFtZXRlcnMgZm9yIHRoaXMgc3RhdGUuIHN0YXRlLnVybC5wYXJhbXMgaXMgYWxyZWFkeSBidWlsdCBhdCB0aGlzIHBvaW50LiBDcmVhdGUgYW5kIGFkZCBub24tdXJsIHBhcmFtc1xuICAgIG93blBhcmFtczogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHZhciBwYXJhbXMgPSBzdGF0ZS51cmwgJiYgc3RhdGUudXJsLnBhcmFtcyB8fCBuZXcgJCRVTUZQLlBhcmFtU2V0KCk7XG4gICAgICBmb3JFYWNoKHN0YXRlLnBhcmFtcyB8fCB7fSwgZnVuY3Rpb24oY29uZmlnLCBpZCkge1xuICAgICAgICBpZiAoIXBhcmFtc1tpZF0pIHBhcmFtc1tpZF0gPSBuZXcgJCRVTUZQLlBhcmFtKGlkLCBudWxsLCBjb25maWcsIFwiY29uZmlnXCIpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH0sXG5cbiAgICAvLyBEZXJpdmUgcGFyYW1ldGVycyBmb3IgdGhpcyBzdGF0ZSBhbmQgZW5zdXJlIHRoZXkncmUgYSBzdXBlci1zZXQgb2YgcGFyZW50J3MgcGFyYW1ldGVyc1xuICAgIHBhcmFtczogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHZhciBvd25QYXJhbXMgPSBwaWNrKHN0YXRlLm93blBhcmFtcywgc3RhdGUub3duUGFyYW1zLiQka2V5cygpKTtcbiAgICAgIHJldHVybiBzdGF0ZS5wYXJlbnQgJiYgc3RhdGUucGFyZW50LnBhcmFtcyA/IGV4dGVuZChzdGF0ZS5wYXJlbnQucGFyYW1zLiQkbmV3KCksIG93blBhcmFtcykgOiBuZXcgJCRVTUZQLlBhcmFtU2V0KCk7XG4gICAgfSxcblxuICAgIC8vIElmIHRoZXJlIGlzIG5vIGV4cGxpY2l0IG11bHRpLXZpZXcgY29uZmlndXJhdGlvbiwgbWFrZSBvbmUgdXAgc28gd2UgZG9uJ3QgaGF2ZVxuICAgIC8vIHRvIGhhbmRsZSBib3RoIGNhc2VzIGluIHRoZSB2aWV3IGRpcmVjdGl2ZSBsYXRlci4gTm90ZSB0aGF0IGhhdmluZyBhbiBleHBsaWNpdFxuICAgIC8vICd2aWV3cycgcHJvcGVydHkgd2lsbCBtZWFuIHRoZSBkZWZhdWx0IHVubmFtZWQgdmlldyBwcm9wZXJ0aWVzIGFyZSBpZ25vcmVkLiBUaGlzXG4gICAgLy8gaXMgYWxzbyBhIGdvb2QgdGltZSB0byByZXNvbHZlIHZpZXcgbmFtZXMgdG8gYWJzb2x1dGUgbmFtZXMsIHNvIGV2ZXJ5dGhpbmcgaXMgYVxuICAgIC8vIHN0cmFpZ2h0IGxvb2t1cCBhdCBsaW5rIHRpbWUuXG4gICAgdmlld3M6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICB2YXIgdmlld3MgPSB7fTtcblxuICAgICAgZm9yRWFjaChpc0RlZmluZWQoc3RhdGUudmlld3MpID8gc3RhdGUudmlld3MgOiB7ICcnOiBzdGF0ZSB9LCBmdW5jdGlvbiAodmlldywgbmFtZSkge1xuICAgICAgICBpZiAobmFtZS5pbmRleE9mKCdAJykgPCAwKSBuYW1lICs9ICdAJyArIHN0YXRlLnBhcmVudC5uYW1lO1xuICAgICAgICB2aWV3LnJlc29sdmVBcyA9IHZpZXcucmVzb2x2ZUFzIHx8IHN0YXRlLnJlc29sdmVBcyB8fCAnJHJlc29sdmUnO1xuICAgICAgICB2aWV3c1tuYW1lXSA9IHZpZXc7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB2aWV3cztcbiAgICB9LFxuXG4gICAgLy8gS2VlcCBhIGZ1bGwgcGF0aCBmcm9tIHRoZSByb290IGRvd24gdG8gdGhpcyBzdGF0ZSBhcyB0aGlzIGlzIG5lZWRlZCBmb3Igc3RhdGUgYWN0aXZhdGlvbi5cbiAgICBwYXRoOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgcmV0dXJuIHN0YXRlLnBhcmVudCA/IHN0YXRlLnBhcmVudC5wYXRoLmNvbmNhdChzdGF0ZSkgOiBbXTsgLy8gZXhjbHVkZSByb290IGZyb20gcGF0aFxuICAgIH0sXG5cbiAgICAvLyBTcGVlZCB1cCAkc3RhdGUuY29udGFpbnMoKSBhcyBpdCdzIHVzZWQgYSBsb3RcbiAgICBpbmNsdWRlczogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHZhciBpbmNsdWRlcyA9IHN0YXRlLnBhcmVudCA/IGV4dGVuZCh7fSwgc3RhdGUucGFyZW50LmluY2x1ZGVzKSA6IHt9O1xuICAgICAgaW5jbHVkZXNbc3RhdGUubmFtZV0gPSB0cnVlO1xuICAgICAgcmV0dXJuIGluY2x1ZGVzO1xuICAgIH0sXG5cbiAgICAkZGVsZWdhdGVzOiB7fVxuICB9O1xuXG4gIGZ1bmN0aW9uIGlzUmVsYXRpdmUoc3RhdGVOYW1lKSB7XG4gICAgcmV0dXJuIHN0YXRlTmFtZS5pbmRleE9mKFwiLlwiKSA9PT0gMCB8fCBzdGF0ZU5hbWUuaW5kZXhPZihcIl5cIikgPT09IDA7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIGJhc2UpIHtcbiAgICBpZiAoIXN0YXRlT3JOYW1lKSByZXR1cm4gdW5kZWZpbmVkO1xuXG4gICAgdmFyIGlzU3RyID0gaXNTdHJpbmcoc3RhdGVPck5hbWUpLFxuICAgICAgICBuYW1lICA9IGlzU3RyID8gc3RhdGVPck5hbWUgOiBzdGF0ZU9yTmFtZS5uYW1lLFxuICAgICAgICBwYXRoICA9IGlzUmVsYXRpdmUobmFtZSk7XG5cbiAgICBpZiAocGF0aCkge1xuICAgICAgaWYgKCFiYXNlKSB0aHJvdyBuZXcgRXJyb3IoXCJObyByZWZlcmVuY2UgcG9pbnQgZ2l2ZW4gZm9yIHBhdGggJ1wiICArIG5hbWUgKyBcIidcIik7XG4gICAgICBiYXNlID0gZmluZFN0YXRlKGJhc2UpO1xuICAgICAgXG4gICAgICB2YXIgcmVsID0gbmFtZS5zcGxpdChcIi5cIiksIGkgPSAwLCBwYXRoTGVuZ3RoID0gcmVsLmxlbmd0aCwgY3VycmVudCA9IGJhc2U7XG5cbiAgICAgIGZvciAoOyBpIDwgcGF0aExlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyZWxbaV0gPT09IFwiXCIgJiYgaSA9PT0gMCkge1xuICAgICAgICAgIGN1cnJlbnQgPSBiYXNlO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZWxbaV0gPT09IFwiXlwiKSB7XG4gICAgICAgICAgaWYgKCFjdXJyZW50LnBhcmVudCkgdGhyb3cgbmV3IEVycm9yKFwiUGF0aCAnXCIgKyBuYW1lICsgXCInIG5vdCB2YWxpZCBmb3Igc3RhdGUgJ1wiICsgYmFzZS5uYW1lICsgXCInXCIpO1xuICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHJlbCA9IHJlbC5zbGljZShpKS5qb2luKFwiLlwiKTtcbiAgICAgIG5hbWUgPSBjdXJyZW50Lm5hbWUgKyAoY3VycmVudC5uYW1lICYmIHJlbCA/IFwiLlwiIDogXCJcIikgKyByZWw7XG4gICAgfVxuICAgIHZhciBzdGF0ZSA9IHN0YXRlc1tuYW1lXTtcblxuICAgIGlmIChzdGF0ZSAmJiAoaXNTdHIgfHwgKCFpc1N0ciAmJiAoc3RhdGUgPT09IHN0YXRlT3JOYW1lIHx8IHN0YXRlLnNlbGYgPT09IHN0YXRlT3JOYW1lKSkpKSB7XG4gICAgICByZXR1cm4gc3RhdGU7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBxdWV1ZVN0YXRlKHBhcmVudE5hbWUsIHN0YXRlKSB7XG4gICAgaWYgKCFxdWV1ZVtwYXJlbnROYW1lXSkge1xuICAgICAgcXVldWVbcGFyZW50TmFtZV0gPSBbXTtcbiAgICB9XG4gICAgcXVldWVbcGFyZW50TmFtZV0ucHVzaChzdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaFF1ZXVlZENoaWxkcmVuKHBhcmVudE5hbWUpIHtcbiAgICB2YXIgcXVldWVkID0gcXVldWVbcGFyZW50TmFtZV0gfHwgW107XG4gICAgd2hpbGUocXVldWVkLmxlbmd0aCkge1xuICAgICAgcmVnaXN0ZXJTdGF0ZShxdWV1ZWQuc2hpZnQoKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVnaXN0ZXJTdGF0ZShzdGF0ZSkge1xuICAgIC8vIFdyYXAgYSBuZXcgb2JqZWN0IGFyb3VuZCB0aGUgc3RhdGUgc28gd2UgY2FuIHN0b3JlIG91ciBwcml2YXRlIGRldGFpbHMgZWFzaWx5LlxuICAgIHN0YXRlID0gaW5oZXJpdChzdGF0ZSwge1xuICAgICAgc2VsZjogc3RhdGUsXG4gICAgICByZXNvbHZlOiBzdGF0ZS5yZXNvbHZlIHx8IHt9LFxuICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5uYW1lOyB9XG4gICAgfSk7XG5cbiAgICB2YXIgbmFtZSA9IHN0YXRlLm5hbWU7XG4gICAgaWYgKCFpc1N0cmluZyhuYW1lKSB8fCBuYW1lLmluZGV4T2YoJ0AnKSA+PSAwKSB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSBtdXN0IGhhdmUgYSB2YWxpZCBuYW1lXCIpO1xuICAgIGlmIChzdGF0ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHRocm93IG5ldyBFcnJvcihcIlN0YXRlICdcIiArIG5hbWUgKyBcIicgaXMgYWxyZWFkeSBkZWZpbmVkXCIpO1xuXG4gICAgLy8gR2V0IHBhcmVudCBuYW1lXG4gICAgdmFyIHBhcmVudE5hbWUgPSAobmFtZS5pbmRleE9mKCcuJykgIT09IC0xKSA/IG5hbWUuc3Vic3RyaW5nKDAsIG5hbWUubGFzdEluZGV4T2YoJy4nKSlcbiAgICAgICAgOiAoaXNTdHJpbmcoc3RhdGUucGFyZW50KSkgPyBzdGF0ZS5wYXJlbnRcbiAgICAgICAgOiAoaXNPYmplY3Qoc3RhdGUucGFyZW50KSAmJiBpc1N0cmluZyhzdGF0ZS5wYXJlbnQubmFtZSkpID8gc3RhdGUucGFyZW50Lm5hbWVcbiAgICAgICAgOiAnJztcblxuICAgIC8vIElmIHBhcmVudCBpcyBub3QgcmVnaXN0ZXJlZCB5ZXQsIGFkZCBzdGF0ZSB0byBxdWV1ZSBhbmQgcmVnaXN0ZXIgbGF0ZXJcbiAgICBpZiAocGFyZW50TmFtZSAmJiAhc3RhdGVzW3BhcmVudE5hbWVdKSB7XG4gICAgICByZXR1cm4gcXVldWVTdGF0ZShwYXJlbnROYW1lLCBzdGF0ZS5zZWxmKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc3RhdGVCdWlsZGVyKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbihzdGF0ZUJ1aWxkZXJba2V5XSkpIHN0YXRlW2tleV0gPSBzdGF0ZUJ1aWxkZXJba2V5XShzdGF0ZSwgc3RhdGVCdWlsZGVyLiRkZWxlZ2F0ZXNba2V5XSk7XG4gICAgfVxuICAgIHN0YXRlc1tuYW1lXSA9IHN0YXRlO1xuXG4gICAgLy8gUmVnaXN0ZXIgdGhlIHN0YXRlIGluIHRoZSBnbG9iYWwgc3RhdGUgbGlzdCBhbmQgd2l0aCAkdXJsUm91dGVyIGlmIG5lY2Vzc2FyeS5cbiAgICBpZiAoIXN0YXRlW2Fic3RyYWN0S2V5XSAmJiBzdGF0ZS51cmwpIHtcbiAgICAgICR1cmxSb3V0ZXJQcm92aWRlci53aGVuKHN0YXRlLnVybCwgWyckbWF0Y2gnLCAnJHN0YXRlUGFyYW1zJywgZnVuY3Rpb24gKCRtYXRjaCwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgIGlmICgkc3RhdGUuJGN1cnJlbnQubmF2aWdhYmxlICE9IHN0YXRlIHx8ICFlcXVhbEZvcktleXMoJG1hdGNoLCAkc3RhdGVQYXJhbXMpKSB7XG4gICAgICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbyhzdGF0ZSwgJG1hdGNoLCB7IGluaGVyaXQ6IHRydWUsIGxvY2F0aW9uOiBmYWxzZSB9KTtcbiAgICAgICAgfVxuICAgICAgfV0pO1xuICAgIH1cblxuICAgIC8vIFJlZ2lzdGVyIGFueSBxdWV1ZWQgY2hpbGRyZW5cbiAgICBmbHVzaFF1ZXVlZENoaWxkcmVuKG5hbWUpO1xuXG4gICAgcmV0dXJuIHN0YXRlO1xuICB9XG5cbiAgLy8gQ2hlY2tzIHRleHQgdG8gc2VlIGlmIGl0IGxvb2tzIGxpa2UgYSBnbG9iLlxuICBmdW5jdGlvbiBpc0dsb2IgKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5pbmRleE9mKCcqJykgPiAtMTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdHJ1ZSBpZiBnbG9iIG1hdGNoZXMgY3VycmVudCAkc3RhdGUgbmFtZS5cbiAgZnVuY3Rpb24gZG9lc1N0YXRlTWF0Y2hHbG9iIChnbG9iKSB7XG4gICAgdmFyIGdsb2JTZWdtZW50cyA9IGdsb2Iuc3BsaXQoJy4nKSxcbiAgICAgICAgc2VnbWVudHMgPSAkc3RhdGUuJGN1cnJlbnQubmFtZS5zcGxpdCgnLicpO1xuXG4gICAgLy9tYXRjaCBzaW5nbGUgc3RhcnNcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGdsb2JTZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmIChnbG9iU2VnbWVudHNbaV0gPT09ICcqJykge1xuICAgICAgICBzZWdtZW50c1tpXSA9ICcqJztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL21hdGNoIGdyZWVkeSBzdGFydHNcbiAgICBpZiAoZ2xvYlNlZ21lbnRzWzBdID09PSAnKionKSB7XG4gICAgICAgc2VnbWVudHMgPSBzZWdtZW50cy5zbGljZShpbmRleE9mKHNlZ21lbnRzLCBnbG9iU2VnbWVudHNbMV0pKTtcbiAgICAgICBzZWdtZW50cy51bnNoaWZ0KCcqKicpO1xuICAgIH1cbiAgICAvL21hdGNoIGdyZWVkeSBlbmRzXG4gICAgaWYgKGdsb2JTZWdtZW50c1tnbG9iU2VnbWVudHMubGVuZ3RoIC0gMV0gPT09ICcqKicpIHtcbiAgICAgICBzZWdtZW50cy5zcGxpY2UoaW5kZXhPZihzZWdtZW50cywgZ2xvYlNlZ21lbnRzW2dsb2JTZWdtZW50cy5sZW5ndGggLSAyXSkgKyAxLCBOdW1iZXIuTUFYX1ZBTFVFKTtcbiAgICAgICBzZWdtZW50cy5wdXNoKCcqKicpO1xuICAgIH1cblxuICAgIGlmIChnbG9iU2VnbWVudHMubGVuZ3RoICE9IHNlZ21lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBzZWdtZW50cy5qb2luKCcnKSA9PT0gZ2xvYlNlZ21lbnRzLmpvaW4oJycpO1xuICB9XG5cblxuICAvLyBJbXBsaWNpdCByb290IHN0YXRlIHRoYXQgaXMgYWx3YXlzIGFjdGl2ZVxuICByb290ID0gcmVnaXN0ZXJTdGF0ZSh7XG4gICAgbmFtZTogJycsXG4gICAgdXJsOiAnXicsXG4gICAgdmlld3M6IG51bGwsXG4gICAgJ2Fic3RyYWN0JzogdHJ1ZVxuICB9KTtcbiAgcm9vdC5uYXZpZ2FibGUgPSBudWxsO1xuXG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXIjZGVjb3JhdG9yXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIEFsbG93cyB5b3UgdG8gZXh0ZW5kIChjYXJlZnVsbHkpIG9yIG92ZXJyaWRlIChhdCB5b3VyIG93biBwZXJpbCkgdGhlIFxuICAgKiBgc3RhdGVCdWlsZGVyYCBvYmplY3QgdXNlZCBpbnRlcm5hbGx5IGJ5IGAkc3RhdGVQcm92aWRlcmAuIFRoaXMgY2FuIGJlIHVzZWQgXG4gICAqIHRvIGFkZCBjdXN0b20gZnVuY3Rpb25hbGl0eSB0byB1aS1yb3V0ZXIsIGZvciBleGFtcGxlIGluZmVycmluZyB0ZW1wbGF0ZVVybCBcbiAgICogYmFzZWQgb24gdGhlIHN0YXRlIG5hbWUuXG4gICAqXG4gICAqIFdoZW4gcGFzc2luZyBvbmx5IGEgbmFtZSwgaXQgcmV0dXJucyB0aGUgY3VycmVudCAob3JpZ2luYWwgb3IgZGVjb3JhdGVkKSBidWlsZGVyXG4gICAqIGZ1bmN0aW9uIHRoYXQgbWF0Y2hlcyBgbmFtZWAuXG4gICAqXG4gICAqIFRoZSBidWlsZGVyIGZ1bmN0aW9ucyB0aGF0IGNhbiBiZSBkZWNvcmF0ZWQgYXJlIGxpc3RlZCBiZWxvdy4gVGhvdWdoIG5vdCBhbGxcbiAgICogbmVjZXNzYXJpbHkgaGF2ZSBhIGdvb2QgdXNlIGNhc2UgZm9yIGRlY29yYXRpb24sIHRoYXQgaXMgdXAgdG8geW91IHRvIGRlY2lkZS5cbiAgICpcbiAgICogSW4gYWRkaXRpb24sIHVzZXJzIGNhbiBhdHRhY2ggY3VzdG9tIGRlY29yYXRvcnMsIHdoaWNoIHdpbGwgZ2VuZXJhdGUgbmV3IFxuICAgKiBwcm9wZXJ0aWVzIHdpdGhpbiB0aGUgc3RhdGUncyBpbnRlcm5hbCBkZWZpbml0aW9uLiBUaGVyZSBpcyBjdXJyZW50bHkgbm8gY2xlYXIgXG4gICAqIHVzZS1jYXNlIGZvciB0aGlzIGJleW9uZCBhY2Nlc3NpbmcgaW50ZXJuYWwgc3RhdGVzIChpLmUuICRzdGF0ZS4kY3VycmVudCksIFxuICAgKiBob3dldmVyLCBleHBlY3QgdGhpcyB0byBiZWNvbWUgaW5jcmVhc2luZ2x5IHJlbGV2YW50IGFzIHdlIGludHJvZHVjZSBhZGRpdGlvbmFsIFxuICAgKiBtZXRhLXByb2dyYW1taW5nIGZlYXR1cmVzLlxuICAgKlxuICAgKiAqKldhcm5pbmcqKjogRGVjb3JhdG9ycyBzaG91bGQgbm90IGJlIGludGVyZGVwZW5kZW50IGJlY2F1c2UgdGhlIG9yZGVyIG9mIFxuICAgKiBleGVjdXRpb24gb2YgdGhlIGJ1aWxkZXIgZnVuY3Rpb25zIGluIG5vbi1kZXRlcm1pbmlzdGljLiBCdWlsZGVyIGZ1bmN0aW9ucyBcbiAgICogc2hvdWxkIG9ubHkgYmUgZGVwZW5kZW50IG9uIHRoZSBzdGF0ZSBkZWZpbml0aW9uIG9iamVjdCBhbmQgc3VwZXIgZnVuY3Rpb24uXG4gICAqXG4gICAqXG4gICAqIEV4aXN0aW5nIGJ1aWxkZXIgZnVuY3Rpb25zIGFuZCBjdXJyZW50IHJldHVybiB2YWx1ZXM6XG4gICAqXG4gICAqIC0gKipwYXJlbnQqKiBge29iamVjdH1gIC0gcmV0dXJucyB0aGUgcGFyZW50IHN0YXRlIG9iamVjdC5cbiAgICogLSAqKmRhdGEqKiBge29iamVjdH1gIC0gcmV0dXJucyBzdGF0ZSBkYXRhLCBpbmNsdWRpbmcgYW55IGluaGVyaXRlZCBkYXRhIHRoYXQgaXMgbm90XG4gICAqICAgb3ZlcnJpZGRlbiBieSBvd24gdmFsdWVzIChpZiBhbnkpLlxuICAgKiAtICoqdXJsKiogYHtvYmplY3R9YCAtIHJldHVybnMgYSB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIFVybE1hdGNoZXJ9XG4gICAqICAgb3IgYG51bGxgLlxuICAgKiAtICoqbmF2aWdhYmxlKiogYHtvYmplY3R9YCAtIHJldHVybnMgY2xvc2VzdCBhbmNlc3RvciBzdGF0ZSB0aGF0IGhhcyBhIFVSTCAoYWthIGlzIFxuICAgKiAgIG5hdmlnYWJsZSkuXG4gICAqIC0gKipwYXJhbXMqKiBge29iamVjdH1gIC0gcmV0dXJucyBhbiBhcnJheSBvZiBzdGF0ZSBwYXJhbXMgdGhhdCBhcmUgZW5zdXJlZCB0byBcbiAgICogICBiZSBhIHN1cGVyLXNldCBvZiBwYXJlbnQncyBwYXJhbXMuXG4gICAqIC0gKip2aWV3cyoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGEgdmlld3Mgb2JqZWN0IHdoZXJlIGVhY2gga2V5IGlzIGFuIGFic29sdXRlIHZpZXcgXG4gICAqICAgbmFtZSAoaS5lLiBcInZpZXdOYW1lQHN0YXRlTmFtZVwiKSBhbmQgZWFjaCB2YWx1ZSBpcyB0aGUgY29uZmlnIG9iamVjdCBcbiAgICogICAodGVtcGxhdGUsIGNvbnRyb2xsZXIpIGZvciB0aGUgdmlldy4gRXZlbiB3aGVuIHlvdSBkb24ndCB1c2UgdGhlIHZpZXdzIG9iamVjdCBcbiAgICogICBleHBsaWNpdGx5IG9uIGEgc3RhdGUgY29uZmlnLCBvbmUgaXMgc3RpbGwgY3JlYXRlZCBmb3IgeW91IGludGVybmFsbHkuXG4gICAqICAgU28gYnkgZGVjb3JhdGluZyB0aGlzIGJ1aWxkZXIgZnVuY3Rpb24geW91IGhhdmUgYWNjZXNzIHRvIGRlY29yYXRpbmcgdGVtcGxhdGUgXG4gICAqICAgYW5kIGNvbnRyb2xsZXIgcHJvcGVydGllcy5cbiAgICogLSAqKm93blBhcmFtcyoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGFuIGFycmF5IG9mIHBhcmFtcyB0aGF0IGJlbG9uZyB0byB0aGUgc3RhdGUsIFxuICAgKiAgIG5vdCBpbmNsdWRpbmcgYW55IHBhcmFtcyBkZWZpbmVkIGJ5IGFuY2VzdG9yIHN0YXRlcy5cbiAgICogLSAqKnBhdGgqKiBge3N0cmluZ31gIC0gcmV0dXJucyB0aGUgZnVsbCBwYXRoIGZyb20gdGhlIHJvb3QgZG93biB0byB0aGlzIHN0YXRlLiBcbiAgICogICBOZWVkZWQgZm9yIHN0YXRlIGFjdGl2YXRpb24uXG4gICAqIC0gKippbmNsdWRlcyoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGFuIG9iamVjdCB0aGF0IGluY2x1ZGVzIGV2ZXJ5IHN0YXRlIHRoYXQgXG4gICAqICAgd291bGQgcGFzcyBhIGAkc3RhdGUuaW5jbHVkZXMoKWAgdGVzdC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogPHByZT5cbiAgICogLy8gT3ZlcnJpZGUgdGhlIGludGVybmFsICd2aWV3cycgYnVpbGRlciB3aXRoIGEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgc3RhdGVcbiAgICogLy8gZGVmaW5pdGlvbiwgYW5kIGEgcmVmZXJlbmNlIHRvIHRoZSBpbnRlcm5hbCBmdW5jdGlvbiBiZWluZyBvdmVycmlkZGVuOlxuICAgKiAkc3RhdGVQcm92aWRlci5kZWNvcmF0b3IoJ3ZpZXdzJywgZnVuY3Rpb24gKHN0YXRlLCBwYXJlbnQpIHtcbiAgICogICB2YXIgcmVzdWx0ID0ge30sXG4gICAqICAgICAgIHZpZXdzID0gcGFyZW50KHN0YXRlKTtcbiAgICpcbiAgICogICBhbmd1bGFyLmZvckVhY2godmlld3MsIGZ1bmN0aW9uIChjb25maWcsIG5hbWUpIHtcbiAgICogICAgIHZhciBhdXRvTmFtZSA9IChzdGF0ZS5uYW1lICsgJy4nICsgbmFtZSkucmVwbGFjZSgnLicsICcvJyk7XG4gICAqICAgICBjb25maWcudGVtcGxhdGVVcmwgPSBjb25maWcudGVtcGxhdGVVcmwgfHwgJy9wYXJ0aWFscy8nICsgYXV0b05hbWUgKyAnLmh0bWwnO1xuICAgKiAgICAgcmVzdWx0W25hbWVdID0gY29uZmlnO1xuICAgKiAgIH0pO1xuICAgKiAgIHJldHVybiByZXN1bHQ7XG4gICAqIH0pO1xuICAgKlxuICAgKiAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICogICB2aWV3czoge1xuICAgKiAgICAgJ2NvbnRhY3QubGlzdCc6IHsgY29udHJvbGxlcjogJ0xpc3RDb250cm9sbGVyJyB9LFxuICAgKiAgICAgJ2NvbnRhY3QuaXRlbSc6IHsgY29udHJvbGxlcjogJ0l0ZW1Db250cm9sbGVyJyB9XG4gICAqICAgfVxuICAgKiB9KTtcbiAgICpcbiAgICogLy8gLi4uXG4gICAqXG4gICAqICRzdGF0ZS5nbygnaG9tZScpO1xuICAgKiAvLyBBdXRvLXBvcHVsYXRlcyBsaXN0IGFuZCBpdGVtIHZpZXdzIHdpdGggL3BhcnRpYWxzL2hvbWUvY29udGFjdC9saXN0Lmh0bWwsXG4gICAqIC8vIGFuZCAvcGFydGlhbHMvaG9tZS9jb250YWN0L2l0ZW0uaHRtbCwgcmVzcGVjdGl2ZWx5LlxuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGJ1aWxkZXIgZnVuY3Rpb24gdG8gZGVjb3JhdGUuIFxuICAgKiBAcGFyYW0ge29iamVjdH0gZnVuYyBBIGZ1bmN0aW9uIHRoYXQgaXMgcmVzcG9uc2libGUgZm9yIGRlY29yYXRpbmcgdGhlIG9yaWdpbmFsIFxuICAgKiBidWlsZGVyIGZ1bmN0aW9uLiBUaGUgZnVuY3Rpb24gcmVjZWl2ZXMgdHdvIHBhcmFtZXRlcnM6XG4gICAqXG4gICAqICAgLSBge29iamVjdH1gIC0gc3RhdGUgLSBUaGUgc3RhdGUgY29uZmlnIG9iamVjdC5cbiAgICogICAtIGB7b2JqZWN0fWAgLSBzdXBlciAtIFRoZSBvcmlnaW5hbCBidWlsZGVyIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtvYmplY3R9ICRzdGF0ZVByb3ZpZGVyIC0gJHN0YXRlUHJvdmlkZXIgaW5zdGFuY2VcbiAgICovXG4gIHRoaXMuZGVjb3JhdG9yID0gZGVjb3JhdG9yO1xuICBmdW5jdGlvbiBkZWNvcmF0b3IobmFtZSwgZnVuYykge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSAqL1xuICAgIGlmIChpc1N0cmluZyhuYW1lKSAmJiAhaXNEZWZpbmVkKGZ1bmMpKSB7XG4gICAgICByZXR1cm4gc3RhdGVCdWlsZGVyW25hbWVdO1xuICAgIH1cbiAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykgfHwgIWlzU3RyaW5nKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKHN0YXRlQnVpbGRlcltuYW1lXSAmJiAhc3RhdGVCdWlsZGVyLiRkZWxlZ2F0ZXNbbmFtZV0pIHtcbiAgICAgIHN0YXRlQnVpbGRlci4kZGVsZWdhdGVzW25hbWVdID0gc3RhdGVCdWlsZGVyW25hbWVdO1xuICAgIH1cbiAgICBzdGF0ZUJ1aWxkZXJbbmFtZV0gPSBmdW5jO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXIjc3RhdGVcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVnaXN0ZXJzIGEgc3RhdGUgY29uZmlndXJhdGlvbiB1bmRlciBhIGdpdmVuIHN0YXRlIG5hbWUuIFRoZSBzdGF0ZUNvbmZpZyBvYmplY3RcbiAgICogaGFzIHRoZSBmb2xsb3dpbmcgYWNjZXB0YWJsZSBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBBIHVuaXF1ZSBzdGF0ZSBuYW1lLCBlLmcuIFwiaG9tZVwiLCBcImFib3V0XCIsIFwiY29udGFjdHNcIi5cbiAgICogVG8gY3JlYXRlIGEgcGFyZW50L2NoaWxkIHN0YXRlIHVzZSBhIGRvdCwgZS5nLiBcImFib3V0LnNhbGVzXCIsIFwiaG9tZS5uZXdlc3RcIi5cbiAgICogQHBhcmFtIHtvYmplY3R9IHN0YXRlQ29uZmlnIFN0YXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0LlxuICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbj19IHN0YXRlQ29uZmlnLnRlbXBsYXRlXG4gICAqIDxhIGlkPSd0ZW1wbGF0ZSc+PC9hPlxuICAgKiAgIGh0bWwgdGVtcGxhdGUgYXMgYSBzdHJpbmcgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnNcbiAgICogICBhbiBodG1sIHRlbXBsYXRlIGFzIGEgc3RyaW5nIHdoaWNoIHNob3VsZCBiZSB1c2VkIGJ5IHRoZSB1aVZpZXcgZGlyZWN0aXZlcy4gVGhpcyBwcm9wZXJ0eSBcbiAgICogICB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgdGVtcGxhdGVVcmwuXG4gICAqICAgXG4gICAqICAgSWYgYHRlbXBsYXRlYCBpcyBhIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICpcbiAgICogICAtIHthcnJheS4mbHQ7b2JqZWN0Jmd0O30gLSBzdGF0ZSBwYXJhbWV0ZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBjdXJyZW50ICRsb2NhdGlvbi5wYXRoKCkgYnlcbiAgICogICAgIGFwcGx5aW5nIHRoZSBjdXJyZW50IHN0YXRlXG4gICAqXG4gICAqIDxwcmU+dGVtcGxhdGU6XG4gICAqICAgXCI8aDE+aW5saW5lIHRlbXBsYXRlIGRlZmluaXRpb248L2gxPlwiICtcbiAgICogICBcIjxkaXYgdWktdmlldz48L2Rpdj5cIjwvcHJlPlxuICAgKiA8cHJlPnRlbXBsYXRlOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICogICAgICAgcmV0dXJuIFwiPGgxPmdlbmVyYXRlZCB0ZW1wbGF0ZTwvaDE+XCI7IH08L3ByZT5cbiAgICogPC9kaXY+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9uPX0gc3RhdGVDb25maWcudGVtcGxhdGVVcmxcbiAgICogPGEgaWQ9J3RlbXBsYXRlVXJsJz48L2E+XG4gICAqXG4gICAqICAgcGF0aCBvciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBwYXRoIHRvIGFuIGh0bWxcbiAgICogICB0ZW1wbGF0ZSB0aGF0IHNob3VsZCBiZSB1c2VkIGJ5IHVpVmlldy5cbiAgICogICBcbiAgICogICBJZiBgdGVtcGxhdGVVcmxgIGlzIGEgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgKlxuICAgKiAgIC0ge2FycmF5LiZsdDtvYmplY3QmZ3Q7fSAtIHN0YXRlIHBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIGN1cnJlbnQgJGxvY2F0aW9uLnBhdGgoKSBieSBcbiAgICogICAgIGFwcGx5aW5nIHRoZSBjdXJyZW50IHN0YXRlXG4gICAqXG4gICAqIDxwcmU+dGVtcGxhdGVVcmw6IFwiaG9tZS5odG1sXCI8L3ByZT5cbiAgICogPHByZT50ZW1wbGF0ZVVybDogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAqICAgICByZXR1cm4gbXlUZW1wbGF0ZXNbcGFyYW1zLnBhZ2VJZF07IH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbj19IHN0YXRlQ29uZmlnLnRlbXBsYXRlUHJvdmlkZXJcbiAgICogPGEgaWQ9J3RlbXBsYXRlUHJvdmlkZXInPjwvYT5cbiAgICogICAgUHJvdmlkZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIEhUTUwgY29udGVudCBzdHJpbmcuXG4gICAqIDxwcmU+IHRlbXBsYXRlUHJvdmlkZXI6XG4gICAqICAgICAgIGZ1bmN0aW9uKE15VGVtcGxhdGVTZXJ2aWNlLCBwYXJhbXMpIHtcbiAgICogICAgICAgICByZXR1cm4gTXlUZW1wbGF0ZVNlcnZpY2UuZ2V0VGVtcGxhdGUocGFyYW1zLnBhZ2VJZCk7XG4gICAqICAgICAgIH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy5jb250cm9sbGVyXG4gICAqIDxhIGlkPSdjb250cm9sbGVyJz48L2E+XG4gICAqXG4gICAqICBDb250cm9sbGVyIGZuIHRoYXQgc2hvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCBuZXdseVxuICAgKiAgIHJlbGF0ZWQgc2NvcGUgb3IgdGhlIG5hbWUgb2YgYSByZWdpc3RlcmVkIGNvbnRyb2xsZXIgaWYgcGFzc2VkIGFzIGEgc3RyaW5nLlxuICAgKiAgIE9wdGlvbmFsbHksIHRoZSBDb250cm9sbGVyQXMgbWF5IGJlIGRlY2xhcmVkIGhlcmUuXG4gICAqIDxwcmU+Y29udHJvbGxlcjogXCJNeVJlZ2lzdGVyZWRDb250cm9sbGVyXCI8L3ByZT5cbiAgICogPHByZT5jb250cm9sbGVyOlxuICAgKiAgICAgXCJNeVJlZ2lzdGVyZWRDb250cm9sbGVyIGFzIGZvb0N0cmxcIn08L3ByZT5cbiAgICogPHByZT5jb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIE15U2VydmljZSkge1xuICAgKiAgICAgJHNjb3BlLmRhdGEgPSBNeVNlcnZpY2UuZ2V0RGF0YSgpOyB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy5jb250cm9sbGVyUHJvdmlkZXJcbiAgICogPGEgaWQ9J2NvbnRyb2xsZXJQcm92aWRlcic+PC9hPlxuICAgKlxuICAgKiBJbmplY3RhYmxlIHByb3ZpZGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWN0dWFsIGNvbnRyb2xsZXIgb3Igc3RyaW5nLlxuICAgKiA8cHJlPmNvbnRyb2xsZXJQcm92aWRlcjpcbiAgICogICBmdW5jdGlvbihNeVJlc29sdmVEYXRhKSB7XG4gICAqICAgICBpZiAoTXlSZXNvbHZlRGF0YS5mb28pXG4gICAqICAgICAgIHJldHVybiBcIkZvb0N0cmxcIlxuICAgKiAgICAgZWxzZSBpZiAoTXlSZXNvbHZlRGF0YS5iYXIpXG4gICAqICAgICAgIHJldHVybiBcIkJhckN0cmxcIjtcbiAgICogICAgIGVsc2UgcmV0dXJuIGZ1bmN0aW9uKCRzY29wZSkge1xuICAgKiAgICAgICAkc2NvcGUuYmF6ID0gXCJRdXhcIjtcbiAgICogICAgIH1cbiAgICogICB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc3RhdGVDb25maWcuY29udHJvbGxlckFzXG4gICAqIDxhIGlkPSdjb250cm9sbGVyQXMnPjwvYT5cbiAgICogXG4gICAqIEEgY29udHJvbGxlciBhbGlhcyBuYW1lLiBJZiBwcmVzZW50IHRoZSBjb250cm9sbGVyIHdpbGwgYmVcbiAgICogICBwdWJsaXNoZWQgdG8gc2NvcGUgdW5kZXIgdGhlIGNvbnRyb2xsZXJBcyBuYW1lLlxuICAgKiA8cHJlPmNvbnRyb2xsZXJBczogXCJteUN0cmxcIjwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3Q9fSBzdGF0ZUNvbmZpZy5wYXJlbnRcbiAgICogPGEgaWQ9J3BhcmVudCc+PC9hPlxuICAgKiBPcHRpb25hbGx5IHNwZWNpZmllcyB0aGUgcGFyZW50IHN0YXRlIG9mIHRoaXMgc3RhdGUuXG4gICAqXG4gICAqIDxwcmU+cGFyZW50OiAncGFyZW50U3RhdGUnPC9wcmU+XG4gICAqIDxwcmU+cGFyZW50OiBwYXJlbnRTdGF0ZSAvLyBKUyB2YXJpYWJsZTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdD19IHN0YXRlQ29uZmlnLnJlc29sdmVcbiAgICogPGEgaWQ9J3Jlc29sdmUnPjwvYT5cbiAgICpcbiAgICogQW4gb3B0aW9uYWwgbWFwJmx0O3N0cmluZywgZnVuY3Rpb24mZ3Q7IG9mIGRlcGVuZGVuY2llcyB3aGljaFxuICAgKiAgIHNob3VsZCBiZSBpbmplY3RlZCBpbnRvIHRoZSBjb250cm9sbGVyLiBJZiBhbnkgb2YgdGhlc2UgZGVwZW5kZW5jaWVzIGFyZSBwcm9taXNlcywgXG4gICAqICAgdGhlIHJvdXRlciB3aWxsIHdhaXQgZm9yIHRoZW0gYWxsIHRvIGJlIHJlc29sdmVkIGJlZm9yZSB0aGUgY29udHJvbGxlciBpcyBpbnN0YW50aWF0ZWQuXG4gICAqICAgSWYgYWxsIHRoZSBwcm9taXNlcyBhcmUgcmVzb2x2ZWQgc3VjY2Vzc2Z1bGx5LCB0aGUgJHN0YXRlQ2hhbmdlU3VjY2VzcyBldmVudCBpcyBmaXJlZFxuICAgKiAgIGFuZCB0aGUgdmFsdWVzIG9mIHRoZSByZXNvbHZlZCBwcm9taXNlcyBhcmUgaW5qZWN0ZWQgaW50byBhbnkgY29udHJvbGxlcnMgdGhhdCByZWZlcmVuY2UgdGhlbS5cbiAgICogICBJZiBhbnkgIG9mIHRoZSBwcm9taXNlcyBhcmUgcmVqZWN0ZWQgdGhlICRzdGF0ZUNoYW5nZUVycm9yIGV2ZW50IGlzIGZpcmVkLlxuICAgKlxuICAgKiAgIFRoZSBtYXAgb2JqZWN0IGlzOlxuICAgKiAgIFxuICAgKiAgIC0ga2V5IC0ge3N0cmluZ306IG5hbWUgb2YgZGVwZW5kZW5jeSB0byBiZSBpbmplY3RlZCBpbnRvIGNvbnRyb2xsZXJcbiAgICogICAtIGZhY3RvcnkgLSB7c3RyaW5nfGZ1bmN0aW9ufTogSWYgc3RyaW5nIHRoZW4gaXQgaXMgYWxpYXMgZm9yIHNlcnZpY2UuIE90aGVyd2lzZSBpZiBmdW5jdGlvbiwgXG4gICAqICAgICBpdCBpcyBpbmplY3RlZCBhbmQgcmV0dXJuIHZhbHVlIGl0IHRyZWF0ZWQgYXMgZGVwZW5kZW5jeS4gSWYgcmVzdWx0IGlzIGEgcHJvbWlzZSwgaXQgaXMgXG4gICAqICAgICByZXNvbHZlZCBiZWZvcmUgaXRzIHZhbHVlIGlzIGluamVjdGVkIGludG8gY29udHJvbGxlci5cbiAgICpcbiAgICogPHByZT5yZXNvbHZlOiB7XG4gICAqICAgICBteVJlc29sdmUxOlxuICAgKiAgICAgICBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG4gICAqICAgICAgICAgcmV0dXJuICRodHRwLmdldChcIi9hcGkvZm9vcy9cIitzdGF0ZVBhcmFtcy5mb29JRCk7XG4gICAqICAgICAgIH1cbiAgICogICAgIH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBzdGF0ZUNvbmZpZy51cmxcbiAgICogPGEgaWQ9J3VybCc+PC9hPlxuICAgKlxuICAgKiAgIEEgdXJsIGZyYWdtZW50IHdpdGggb3B0aW9uYWwgcGFyYW1ldGVycy4gV2hlbiBhIHN0YXRlIGlzIG5hdmlnYXRlZCBvclxuICAgKiAgIHRyYW5zaXRpb25lZCB0bywgdGhlIGAkc3RhdGVQYXJhbXNgIHNlcnZpY2Ugd2lsbCBiZSBwb3B1bGF0ZWQgd2l0aCBhbnkgXG4gICAqICAgcGFyYW1ldGVycyB0aGF0IHdlcmUgcGFzc2VkLlxuICAgKlxuICAgKiAgIChTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBVcmxNYXRjaGVyfSBgVXJsTWF0Y2hlcmB9IGZvclxuICAgKiAgIG1vcmUgZGV0YWlscyBvbiBhY2NlcHRhYmxlIHBhdHRlcm5zIClcbiAgICpcbiAgICogZXhhbXBsZXM6XG4gICAqIDxwcmU+dXJsOiBcIi9ob21lXCJcbiAgICogdXJsOiBcIi91c2Vycy86dXNlcmlkXCJcbiAgICogdXJsOiBcIi9ib29rcy97Ym9va2lkOlthLXpBLVpfLV19XCJcbiAgICogdXJsOiBcIi9ib29rcy97Y2F0ZWdvcnlpZDppbnR9XCJcbiAgICogdXJsOiBcIi9ib29rcy97cHVibGlzaGVybmFtZTpzdHJpbmd9L3tjYXRlZ29yeWlkOmludH1cIlxuICAgKiB1cmw6IFwiL21lc3NhZ2VzP2JlZm9yZSZhZnRlclwiXG4gICAqIHVybDogXCIvbWVzc2FnZXM/e2JlZm9yZTpkYXRlfSZ7YWZ0ZXI6ZGF0ZX1cIlxuICAgKiB1cmw6IFwiL21lc3NhZ2VzLzptYWlsYm94aWQ/e2JlZm9yZTpkYXRlfSZ7YWZ0ZXI6ZGF0ZX1cIlxuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3Q9fSBzdGF0ZUNvbmZpZy52aWV3c1xuICAgKiA8YSBpZD0ndmlld3MnPjwvYT5cbiAgICogYW4gb3B0aW9uYWwgbWFwJmx0O3N0cmluZywgb2JqZWN0Jmd0OyB3aGljaCBkZWZpbmVkIG11bHRpcGxlIHZpZXdzLCBvciB0YXJnZXRzIHZpZXdzXG4gICAqIG1hbnVhbGx5L2V4cGxpY2l0bHkuXG4gICAqXG4gICAqIEV4YW1wbGVzOlxuICAgKlxuICAgKiBUYXJnZXRzIHRocmVlIG5hbWVkIGB1aS12aWV3YHMgaW4gdGhlIHBhcmVudCBzdGF0ZSdzIHRlbXBsYXRlXG4gICAqIDxwcmU+dmlld3M6IHtcbiAgICogICAgIGhlYWRlcjoge1xuICAgKiAgICAgICBjb250cm9sbGVyOiBcImhlYWRlckN0cmxcIixcbiAgICogICAgICAgdGVtcGxhdGVVcmw6IFwiaGVhZGVyLmh0bWxcIlxuICAgKiAgICAgfSwgYm9keToge1xuICAgKiAgICAgICBjb250cm9sbGVyOiBcImJvZHlDdHJsXCIsXG4gICAqICAgICAgIHRlbXBsYXRlVXJsOiBcImJvZHkuaHRtbFwiXG4gICAqICAgICB9LCBmb290ZXI6IHtcbiAgICogICAgICAgY29udHJvbGxlcjogXCJmb290Q3RybFwiLFxuICAgKiAgICAgICB0ZW1wbGF0ZVVybDogXCJmb290ZXIuaHRtbFwiXG4gICAqICAgICB9XG4gICAqICAgfTwvcHJlPlxuICAgKlxuICAgKiBUYXJnZXRzIG5hbWVkIGB1aS12aWV3PVwiaGVhZGVyXCJgIGZyb20gZ3JhbmRwYXJlbnQgc3RhdGUgJ3RvcCcncyB0ZW1wbGF0ZSwgYW5kIG5hbWVkIGB1aS12aWV3PVwiYm9keVwiIGZyb20gcGFyZW50IHN0YXRlJ3MgdGVtcGxhdGUuXG4gICAqIDxwcmU+dmlld3M6IHtcbiAgICogICAgICdoZWFkZXJAdG9wJzoge1xuICAgKiAgICAgICBjb250cm9sbGVyOiBcIm1zZ0hlYWRlckN0cmxcIixcbiAgICogICAgICAgdGVtcGxhdGVVcmw6IFwibXNnSGVhZGVyLmh0bWxcIlxuICAgKiAgICAgfSwgJ2JvZHknOiB7XG4gICAqICAgICAgIGNvbnRyb2xsZXI6IFwibWVzc2FnZXNDdHJsXCIsXG4gICAqICAgICAgIHRlbXBsYXRlVXJsOiBcIm1lc3NhZ2VzLmh0bWxcIlxuICAgKiAgICAgfVxuICAgKiAgIH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFuPX0gW3N0YXRlQ29uZmlnLmFic3RyYWN0PWZhbHNlXVxuICAgKiA8YSBpZD0nYWJzdHJhY3QnPjwvYT5cbiAgICogQW4gYWJzdHJhY3Qgc3RhdGUgd2lsbCBuZXZlciBiZSBkaXJlY3RseSBhY3RpdmF0ZWQsXG4gICAqICAgYnV0IGNhbiBwcm92aWRlIGluaGVyaXRlZCBwcm9wZXJ0aWVzIHRvIGl0cyBjb21tb24gY2hpbGRyZW4gc3RhdGVzLlxuICAgKiA8cHJlPmFic3RyYWN0OiB0cnVlPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy5vbkVudGVyXG4gICAqIDxhIGlkPSdvbkVudGVyJz48L2E+XG4gICAqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciB3aGVuIGEgc3RhdGUgaXMgZW50ZXJlZC4gR29vZCB3YXlcbiAgICogICB0byB0cmlnZ2VyIGFuIGFjdGlvbiBvciBkaXNwYXRjaCBhbiBldmVudCwgc3VjaCBhcyBvcGVuaW5nIGEgZGlhbG9nLlxuICAgKiBJZiBtaW5pZnlpbmcgeW91ciBzY3JpcHRzLCBtYWtlIHN1cmUgdG8gZXhwbGljaXRseSBhbm5vdGF0ZSB0aGlzIGZ1bmN0aW9uLFxuICAgKiBiZWNhdXNlIGl0IHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgYW5ub3RhdGVkIGJ5IHlvdXIgYnVpbGQgdG9vbHMuXG4gICAqXG4gICAqIDxwcmU+b25FbnRlcjogZnVuY3Rpb24oTXlTZXJ2aWNlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICogICAgIE15U2VydmljZS5mb28oJHN0YXRlUGFyYW1zLm15UGFyYW0pO1xuICAgKiB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy5vbkV4aXRcbiAgICogPGEgaWQ9J29uRXhpdCc+PC9hPlxuICAgKlxuICAgKiBDYWxsYmFjayBmdW5jdGlvbiBmb3Igd2hlbiBhIHN0YXRlIGlzIGV4aXRlZC4gR29vZCB3YXkgdG9cbiAgICogICB0cmlnZ2VyIGFuIGFjdGlvbiBvciBkaXNwYXRjaCBhbiBldmVudCwgc3VjaCBhcyBvcGVuaW5nIGEgZGlhbG9nLlxuICAgKiBJZiBtaW5pZnlpbmcgeW91ciBzY3JpcHRzLCBtYWtlIHN1cmUgdG8gZXhwbGljaXRseSBhbm5vdGF0ZSB0aGlzIGZ1bmN0aW9uLFxuICAgKiBiZWNhdXNlIGl0IHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgYW5ub3RhdGVkIGJ5IHlvdXIgYnVpbGQgdG9vbHMuXG4gICAqXG4gICAqIDxwcmU+b25FeGl0OiBmdW5jdGlvbihNeVNlcnZpY2UsICRzdGF0ZVBhcmFtcykge1xuICAgKiAgICAgTXlTZXJ2aWNlLmNsZWFudXAoJHN0YXRlUGFyYW1zLm15UGFyYW0pO1xuICAgKiB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtzdGF0ZUNvbmZpZy5yZWxvYWRPblNlYXJjaD10cnVlXVxuICAgKiA8YSBpZD0ncmVsb2FkT25TZWFyY2gnPjwvYT5cbiAgICpcbiAgICogSWYgYGZhbHNlYCwgd2lsbCBub3QgcmV0cmlnZ2VyIHRoZSBzYW1lIHN0YXRlXG4gICAqICAganVzdCBiZWNhdXNlIGEgc2VhcmNoL3F1ZXJ5IHBhcmFtZXRlciBoYXMgY2hhbmdlZCAodmlhICRsb2NhdGlvbi5zZWFyY2goKSBvciAkbG9jYXRpb24uaGFzaCgpKS4gXG4gICAqICAgVXNlZnVsIGZvciB3aGVuIHlvdSdkIGxpa2UgdG8gbW9kaWZ5ICRsb2NhdGlvbi5zZWFyY2goKSB3aXRob3V0IHRyaWdnZXJpbmcgYSByZWxvYWQuXG4gICAqIDxwcmU+cmVsb2FkT25TZWFyY2g6IGZhbHNlPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0PX0gc3RhdGVDb25maWcuZGF0YVxuICAgKiA8YSBpZD0nZGF0YSc+PC9hPlxuICAgKlxuICAgKiBBcmJpdHJhcnkgZGF0YSBvYmplY3QsIHVzZWZ1bCBmb3IgY3VzdG9tIGNvbmZpZ3VyYXRpb24uICBUaGUgcGFyZW50IHN0YXRlJ3MgYGRhdGFgIGlzXG4gICAqICAgcHJvdG90eXBhbGx5IGluaGVyaXRlZC4gIEluIG90aGVyIHdvcmRzLCBhZGRpbmcgYSBkYXRhIHByb3BlcnR5IHRvIGEgc3RhdGUgYWRkcyBpdCB0b1xuICAgKiAgIHRoZSBlbnRpcmUgc3VidHJlZSB2aWEgcHJvdG90eXBhbCBpbmhlcml0YW5jZS5cbiAgICpcbiAgICogPHByZT5kYXRhOiB7XG4gICAqICAgICByZXF1aXJlZFJvbGU6ICdmb28nXG4gICAqIH0gPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0PX0gc3RhdGVDb25maWcucGFyYW1zXG4gICAqIDxhIGlkPSdwYXJhbXMnPjwvYT5cbiAgICpcbiAgICogQSBtYXAgd2hpY2ggb3B0aW9uYWxseSBjb25maWd1cmVzIHBhcmFtZXRlcnMgZGVjbGFyZWQgaW4gdGhlIGB1cmxgLCBvclxuICAgKiAgIGRlZmluZXMgYWRkaXRpb25hbCBub24tdXJsIHBhcmFtZXRlcnMuICBGb3IgZWFjaCBwYXJhbWV0ZXIgYmVpbmdcbiAgICogICBjb25maWd1cmVkLCBhZGQgYSBjb25maWd1cmF0aW9uIG9iamVjdCBrZXllZCB0byB0aGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxuICAgKlxuICAgKiAgIEVhY2ggcGFyYW1ldGVyIGNvbmZpZ3VyYXRpb24gb2JqZWN0IG1heSBjb250YWluIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICpcbiAgICogICAtICoqIHZhbHVlICoqIC0ge29iamVjdHxmdW5jdGlvbj19OiBzcGVjaWZpZXMgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoaXNcbiAgICogICAgIHBhcmFtZXRlci4gIFRoaXMgaW1wbGljaXRseSBzZXRzIHRoaXMgcGFyYW1ldGVyIGFzIG9wdGlvbmFsLlxuICAgKlxuICAgKiAgICAgV2hlbiBVSS1Sb3V0ZXIgcm91dGVzIHRvIGEgc3RhdGUgYW5kIG5vIHZhbHVlIGlzXG4gICAqICAgICBzcGVjaWZpZWQgZm9yIHRoaXMgcGFyYW1ldGVyIGluIHRoZSBVUkwgb3IgdHJhbnNpdGlvbiwgdGhlXG4gICAqICAgICBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBpbnN0ZWFkLiAgSWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLFxuICAgKiAgICAgaXQgd2lsbCBiZSBpbmplY3RlZCBhbmQgaW52b2tlZCwgYW5kIHRoZSByZXR1cm4gdmFsdWUgdXNlZC5cbiAgICpcbiAgICogICAgICpOb3RlKjogYHVuZGVmaW5lZGAgaXMgdHJlYXRlZCBhcyBcIm5vIGRlZmF1bHQgdmFsdWVcIiB3aGlsZSBgbnVsbGBcbiAgICogICAgIGlzIHRyZWF0ZWQgYXMgXCJ0aGUgZGVmYXVsdCB2YWx1ZSBpcyBgbnVsbGBcIi5cbiAgICpcbiAgICogICAgICpTaG9ydGhhbmQqOiBJZiB5b3Ugb25seSBuZWVkIHRvIGNvbmZpZ3VyZSB0aGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGVcbiAgICogICAgIHBhcmFtZXRlciwgeW91IG1heSB1c2UgYSBzaG9ydGhhbmQgc3ludGF4LiAgIEluIHRoZSAqKmBwYXJhbXNgKipcbiAgICogICAgIG1hcCwgaW5zdGVhZCBtYXBwaW5nIHRoZSBwYXJhbSBuYW1lIHRvIGEgZnVsbCBwYXJhbWV0ZXIgY29uZmlndXJhdGlvblxuICAgKiAgICAgb2JqZWN0LCBzaW1wbHkgc2V0IG1hcCBpdCB0byB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUsIGUuZy46XG4gICAqXG4gICAqIDxwcmU+Ly8gZGVmaW5lIGEgcGFyYW1ldGVyJ3MgZGVmYXVsdCB2YWx1ZVxuICAgKiBwYXJhbXM6IHtcbiAgICogICAgIHBhcmFtMTogeyB2YWx1ZTogXCJkZWZhdWx0VmFsdWVcIiB9XG4gICAqIH1cbiAgICogLy8gc2hvcnRoYW5kIGRlZmF1bHQgdmFsdWVzXG4gICAqIHBhcmFtczoge1xuICAgKiAgICAgcGFyYW0xOiBcImRlZmF1bHRWYWx1ZVwiLFxuICAgKiAgICAgcGFyYW0yOiBcInBhcmFtMkRlZmF1bHRcIlxuICAgKiB9PC9wcmU+XG4gICAqXG4gICAqICAgLSAqKiBhcnJheSAqKiAtIHtib29sZWFuPX06ICooZGVmYXVsdDogZmFsc2UpKiBJZiB0cnVlLCB0aGUgcGFyYW0gdmFsdWUgd2lsbCBiZVxuICAgKiAgICAgdHJlYXRlZCBhcyBhbiBhcnJheSBvZiB2YWx1ZXMuICBJZiB5b3Ugc3BlY2lmaWVkIGEgVHlwZSwgdGhlIHZhbHVlIHdpbGwgYmVcbiAgICogICAgIHRyZWF0ZWQgYXMgYW4gYXJyYXkgb2YgdGhlIHNwZWNpZmllZCBUeXBlLiAgTm90ZTogcXVlcnkgcGFyYW1ldGVyIHZhbHVlc1xuICAgKiAgICAgZGVmYXVsdCB0byBhIHNwZWNpYWwgYFwiYXV0b1wiYCBtb2RlLlxuICAgKlxuICAgKiAgICAgRm9yIHF1ZXJ5IHBhcmFtZXRlcnMgaW4gYFwiYXV0b1wiYCBtb2RlLCBpZiBtdWx0aXBsZSAgdmFsdWVzIGZvciBhIHNpbmdsZSBwYXJhbWV0ZXJcbiAgICogICAgIGFyZSBwcmVzZW50IGluIHRoZSBVUkwgKGUuZy46IGAvZm9vP2Jhcj0xJmJhcj0yJmJhcj0zYCkgdGhlbiB0aGUgdmFsdWVzXG4gICAqICAgICBhcmUgbWFwcGVkIHRvIGFuIGFycmF5IChlLmcuOiBgeyBmb286IFsgJzEnLCAnMicsICczJyBdIH1gKS4gIEhvd2V2ZXIsIGlmXG4gICAqICAgICBvbmx5IG9uZSB2YWx1ZSBpcyBwcmVzZW50IChlLmcuOiBgL2Zvbz9iYXI9MWApIHRoZW4gdGhlIHZhbHVlIGlzIHRyZWF0ZWQgYXMgc2luZ2xlXG4gICAqICAgICB2YWx1ZSAoZS5nLjogYHsgZm9vOiAnMScgfWApLlxuICAgKlxuICAgKiA8cHJlPnBhcmFtczoge1xuICAgKiAgICAgcGFyYW0xOiB7IGFycmF5OiB0cnVlIH1cbiAgICogfTwvcHJlPlxuICAgKlxuICAgKiAgIC0gKiogc3F1YXNoICoqIC0ge2Jvb2x8c3RyaW5nPX06IGBzcXVhc2hgIGNvbmZpZ3VyZXMgaG93IGEgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUgaXMgcmVwcmVzZW50ZWQgaW4gdGhlIFVSTCB3aGVuXG4gICAqICAgICB0aGUgY3VycmVudCBwYXJhbWV0ZXIgdmFsdWUgaXMgdGhlIHNhbWUgYXMgdGhlIGRlZmF1bHQgdmFsdWUuIElmIGBzcXVhc2hgIGlzIG5vdCBzZXQsIGl0IHVzZXMgdGhlXG4gICAqICAgICBjb25maWd1cmVkIGRlZmF1bHQgc3F1YXNoIHBvbGljeS5cbiAgICogICAgIChTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNtZXRob2RzX2RlZmF1bHRTcXVhc2hQb2xpY3kgYGRlZmF1bHRTcXVhc2hQb2xpY3koKWB9KVxuICAgKlxuICAgKiAgIFRoZXJlIGFyZSB0aHJlZSBzcXVhc2ggc2V0dGluZ3M6XG4gICAqXG4gICAqICAgICAtIGZhbHNlOiBUaGUgcGFyYW1ldGVyJ3MgZGVmYXVsdCB2YWx1ZSBpcyBub3Qgc3F1YXNoZWQuICBJdCBpcyBlbmNvZGVkIGFuZCBpbmNsdWRlZCBpbiB0aGUgVVJMXG4gICAqICAgICAtIHRydWU6IFRoZSBwYXJhbWV0ZXIncyBkZWZhdWx0IHZhbHVlIGlzIG9taXR0ZWQgZnJvbSB0aGUgVVJMLiAgSWYgdGhlIHBhcmFtZXRlciBpcyBwcmVjZWVkZWQgYW5kIGZvbGxvd2VkXG4gICAqICAgICAgIGJ5IHNsYXNoZXMgaW4gdGhlIHN0YXRlJ3MgYHVybGAgZGVjbGFyYXRpb24sIHRoZW4gb25lIG9mIHRob3NlIHNsYXNoZXMgYXJlIG9taXR0ZWQuXG4gICAqICAgICAgIFRoaXMgY2FuIGFsbG93IGZvciBjbGVhbmVyIGxvb2tpbmcgVVJMcy5cbiAgICogICAgIC0gYFwiPGFyYml0cmFyeSBzdHJpbmc+XCJgOiBUaGUgcGFyYW1ldGVyJ3MgZGVmYXVsdCB2YWx1ZSBpcyByZXBsYWNlZCB3aXRoIGFuIGFyYml0cmFyeSBwbGFjZWhvbGRlciBvZiAgeW91ciBjaG9pY2UuXG4gICAqXG4gICAqIDxwcmU+cGFyYW1zOiB7XG4gICAqICAgICBwYXJhbTE6IHtcbiAgICogICAgICAgdmFsdWU6IFwiZGVmYXVsdElkXCIsXG4gICAqICAgICAgIHNxdWFzaDogdHJ1ZVxuICAgKiB9IH1cbiAgICogLy8gc3F1YXNoIFwiZGVmYXVsdFZhbHVlXCIgdG8gXCJ+XCJcbiAgICogcGFyYW1zOiB7XG4gICAqICAgICBwYXJhbTE6IHtcbiAgICogICAgICAgdmFsdWU6IFwiZGVmYXVsdFZhbHVlXCIsXG4gICAqICAgICAgIHNxdWFzaDogXCJ+XCJcbiAgICogfSB9XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiA8cHJlPlxuICAgKiAvLyBTb21lIHN0YXRlIG5hbWUgZXhhbXBsZXNcbiAgICpcbiAgICogLy8gc3RhdGVOYW1lIGNhbiBiZSBhIHNpbmdsZSB0b3AtbGV2ZWwgbmFtZSAobXVzdCBiZSB1bmlxdWUpLlxuICAgKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge30pO1xuICAgKlxuICAgKiAvLyBPciBpdCBjYW4gYmUgYSBuZXN0ZWQgc3RhdGUgbmFtZS4gVGhpcyBzdGF0ZSBpcyBhIGNoaWxkIG9mIHRoZVxuICAgKiAvLyBhYm92ZSBcImhvbWVcIiBzdGF0ZS5cbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lLm5ld2VzdFwiLCB7fSk7XG4gICAqXG4gICAqIC8vIE5lc3Qgc3RhdGVzIGFzIGRlZXBseSBhcyBuZWVkZWQuXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZS5uZXdlc3QuYWJjLnh5ei5pbmNlcHRpb25cIiwge30pO1xuICAgKlxuICAgKiAvLyBzdGF0ZSgpIHJldHVybnMgJHN0YXRlUHJvdmlkZXIsIHNvIHlvdSBjYW4gY2hhaW4gc3RhdGUgZGVjbGFyYXRpb25zLlxuICAgKiAkc3RhdGVQcm92aWRlclxuICAgKiAgIC5zdGF0ZShcImhvbWVcIiwge30pXG4gICAqICAgLnN0YXRlKFwiYWJvdXRcIiwge30pXG4gICAqICAgLnN0YXRlKFwiY29udGFjdHNcIiwge30pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICovXG4gIHRoaXMuc3RhdGUgPSBzdGF0ZTtcbiAgZnVuY3Rpb24gc3RhdGUobmFtZSwgZGVmaW5pdGlvbikge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSAqL1xuICAgIGlmIChpc09iamVjdChuYW1lKSkgZGVmaW5pdGlvbiA9IG5hbWU7XG4gICAgZWxzZSBkZWZpbml0aW9uLm5hbWUgPSBuYW1lO1xuICAgIHJlZ2lzdGVyU3RhdGUoZGVmaW5pdGlvbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQG5nZG9jIG9iamVjdFxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAqXG4gICAqIEByZXF1aXJlcyAkcm9vdFNjb3BlXG4gICAqIEByZXF1aXJlcyAkcVxuICAgKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiR2aWV3XG4gICAqIEByZXF1aXJlcyAkaW5qZWN0b3JcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsLiRyZXNvbHZlXG4gICAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUGFyYW1zXG4gICAqIEByZXF1aXJlcyB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJcbiAgICpcbiAgICogQHByb3BlcnR5IHtvYmplY3R9IHBhcmFtcyBBIHBhcmFtIG9iamVjdCwgZS5nLiB7c2VjdGlvbklkOiBzZWN0aW9uLmlkKX0sIHRoYXQgXG4gICAqIHlvdSdkIGxpa2UgdG8gdGVzdCBhZ2FpbnN0IHRoZSBjdXJyZW50IGFjdGl2ZSBzdGF0ZS5cbiAgICogQHByb3BlcnR5IHtvYmplY3R9IGN1cnJlbnQgQSByZWZlcmVuY2UgdG8gdGhlIHN0YXRlJ3MgY29uZmlnIG9iamVjdC4gSG93ZXZlciBcbiAgICogeW91IHBhc3NlZCBpdCBpbi4gVXNlZnVsIGZvciBhY2Nlc3NpbmcgY3VzdG9tIGRhdGEuXG4gICAqIEBwcm9wZXJ0eSB7b2JqZWN0fSB0cmFuc2l0aW9uIEN1cnJlbnRseSBwZW5kaW5nIHRyYW5zaXRpb24uIEEgcHJvbWlzZSB0aGF0J2xsIFxuICAgKiByZXNvbHZlIG9yIHJlamVjdC5cbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIGAkc3RhdGVgIHNlcnZpY2UgaXMgcmVzcG9uc2libGUgZm9yIHJlcHJlc2VudGluZyBzdGF0ZXMgYXMgd2VsbCBhcyB0cmFuc2l0aW9uaW5nXG4gICAqIGJldHdlZW4gdGhlbS4gSXQgYWxzbyBwcm92aWRlcyBpbnRlcmZhY2VzIHRvIGFzayBmb3IgY3VycmVudCBzdGF0ZSBvciBldmVuIHN0YXRlc1xuICAgKiB5b3UncmUgY29taW5nIGZyb20uXG4gICAqL1xuICB0aGlzLiRnZXQgPSAkZ2V0O1xuICAkZ2V0LiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHEnLCAnJHZpZXcnLCAnJGluamVjdG9yJywgJyRyZXNvbHZlJywgJyRzdGF0ZVBhcmFtcycsICckdXJsUm91dGVyJywgJyRsb2NhdGlvbicsICckdXJsTWF0Y2hlckZhY3RvcnknXTtcbiAgZnVuY3Rpb24gJGdldCggICAkcm9vdFNjb3BlLCAgICRxLCAgICR2aWV3LCAgICRpbmplY3RvciwgICAkcmVzb2x2ZSwgICAkc3RhdGVQYXJhbXMsICAgJHVybFJvdXRlciwgICAkbG9jYXRpb24sICAgJHVybE1hdGNoZXJGYWN0b3J5KSB7XG5cbiAgICB2YXIgVHJhbnNpdGlvblN1cGVyc2VkZWQgPSAkcS5yZWplY3QobmV3IEVycm9yKCd0cmFuc2l0aW9uIHN1cGVyc2VkZWQnKSk7XG4gICAgdmFyIFRyYW5zaXRpb25QcmV2ZW50ZWQgPSAkcS5yZWplY3QobmV3IEVycm9yKCd0cmFuc2l0aW9uIHByZXZlbnRlZCcpKTtcbiAgICB2YXIgVHJhbnNpdGlvbkFib3J0ZWQgPSAkcS5yZWplY3QobmV3IEVycm9yKCd0cmFuc2l0aW9uIGFib3J0ZWQnKSk7XG4gICAgdmFyIFRyYW5zaXRpb25GYWlsZWQgPSAkcS5yZWplY3QobmV3IEVycm9yKCd0cmFuc2l0aW9uIGZhaWxlZCcpKTtcblxuICAgIC8vIEhhbmRsZXMgdGhlIGNhc2Ugd2hlcmUgYSBzdGF0ZSB3aGljaCBpcyB0aGUgdGFyZ2V0IG9mIGEgdHJhbnNpdGlvbiBpcyBub3QgZm91bmQsIGFuZCB0aGUgdXNlclxuICAgIC8vIGNhbiBvcHRpb25hbGx5IHJldHJ5IG9yIGRlZmVyIHRoZSB0cmFuc2l0aW9uXG4gICAgZnVuY3Rpb24gaGFuZGxlUmVkaXJlY3QocmVkaXJlY3QsIHN0YXRlLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGV2ZW50XG4gICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlIyRzdGF0ZU5vdEZvdW5kXG4gICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqIEZpcmVkIHdoZW4gYSByZXF1ZXN0ZWQgc3RhdGUgKipjYW5ub3QgYmUgZm91bmQqKiB1c2luZyB0aGUgcHJvdmlkZWQgc3RhdGUgbmFtZSBkdXJpbmcgdHJhbnNpdGlvbi5cbiAgICAgICAqIFRoZSBldmVudCBpcyBicm9hZGNhc3QgYWxsb3dpbmcgYW55IGhhbmRsZXJzIGEgc2luZ2xlIGNoYW5jZSB0byBkZWFsIHdpdGggdGhlIGVycm9yICh1c3VhbGx5IGJ5XG4gICAgICAgKiBsYXp5LWxvYWRpbmcgdGhlIHVuZm91bmQgc3RhdGUpLiBBIHNwZWNpYWwgYHVuZm91bmRTdGF0ZWAgb2JqZWN0IGlzIHBhc3NlZCB0byB0aGUgbGlzdGVuZXIgaGFuZGxlcixcbiAgICAgICAqIHlvdSBjYW4gc2VlIGl0cyB0aHJlZSBwcm9wZXJ0aWVzIGluIHRoZSBleGFtcGxlLiBZb3UgY2FuIHVzZSBgZXZlbnQucHJldmVudERlZmF1bHQoKWAgdG8gYWJvcnQgdGhlXG4gICAgICAgKiB0cmFuc2l0aW9uIGFuZCB0aGUgcHJvbWlzZSByZXR1cm5lZCBmcm9tIGBnb2Agd2lsbCBiZSByZWplY3RlZCB3aXRoIGEgYCd0cmFuc2l0aW9uIGFib3J0ZWQnYCB2YWx1ZS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgb2JqZWN0LlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IHVuZm91bmRTdGF0ZSBVbmZvdW5kIFN0YXRlIGluZm9ybWF0aW9uLiBDb250YWluczogYHRvLCB0b1BhcmFtcywgb3B0aW9uc2AgcHJvcGVydGllcy5cbiAgICAgICAqIEBwYXJhbSB7U3RhdGV9IGZyb21TdGF0ZSBDdXJyZW50IHN0YXRlIG9iamVjdC5cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBmcm9tUGFyYW1zIEN1cnJlbnQgc3RhdGUgcGFyYW1zLlxuICAgICAgICpcbiAgICAgICAqIEBleGFtcGxlXG4gICAgICAgKlxuICAgICAgICogPHByZT5cbiAgICAgICAqIC8vIHNvbWV3aGVyZSwgYXNzdW1lIGxhenkuc3RhdGUgaGFzIG5vdCBiZWVuIGRlZmluZWRcbiAgICAgICAqICRzdGF0ZS5nbyhcImxhenkuc3RhdGVcIiwge2E6MSwgYjoyfSwge2luaGVyaXQ6ZmFsc2V9KTtcbiAgICAgICAqXG4gICAgICAgKiAvLyBzb21ld2hlcmUgZWxzZVxuICAgICAgICogJHNjb3BlLiRvbignJHN0YXRlTm90Rm91bmQnLFxuICAgICAgICogZnVuY3Rpb24oZXZlbnQsIHVuZm91bmRTdGF0ZSwgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKXtcbiAgICAgICAqICAgICBjb25zb2xlLmxvZyh1bmZvdW5kU3RhdGUudG8pOyAvLyBcImxhenkuc3RhdGVcIlxuICAgICAgICogICAgIGNvbnNvbGUubG9nKHVuZm91bmRTdGF0ZS50b1BhcmFtcyk7IC8vIHthOjEsIGI6Mn1cbiAgICAgICAqICAgICBjb25zb2xlLmxvZyh1bmZvdW5kU3RhdGUub3B0aW9ucyk7IC8vIHtpbmhlcml0OmZhbHNlfSArIGRlZmF1bHQgb3B0aW9uc1xuICAgICAgICogfSlcbiAgICAgICAqIDwvcHJlPlxuICAgICAgICovXG4gICAgICB2YXIgZXZ0ID0gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVOb3RGb3VuZCcsIHJlZGlyZWN0LCBzdGF0ZSwgcGFyYW1zKTtcblxuICAgICAgaWYgKGV2dC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICR1cmxSb3V0ZXIudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiBUcmFuc2l0aW9uQWJvcnRlZDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFldnQucmV0cnkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIEFsbG93IHRoZSBoYW5kbGVyIHRvIHJldHVybiBhIHByb21pc2UgdG8gZGVmZXIgc3RhdGUgbG9va3VwIHJldHJ5XG4gICAgICBpZiAob3B0aW9ucy4kcmV0cnkpIHtcbiAgICAgICAgJHVybFJvdXRlci51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25GYWlsZWQ7XG4gICAgICB9XG4gICAgICB2YXIgcmV0cnlUcmFuc2l0aW9uID0gJHN0YXRlLnRyYW5zaXRpb24gPSAkcS53aGVuKGV2dC5yZXRyeSk7XG5cbiAgICAgIHJldHJ5VHJhbnNpdGlvbi50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmV0cnlUcmFuc2l0aW9uICE9PSAkc3RhdGUudHJhbnNpdGlvbikgcmV0dXJuIFRyYW5zaXRpb25TdXBlcnNlZGVkO1xuICAgICAgICByZWRpcmVjdC5vcHRpb25zLiRyZXRyeSA9IHRydWU7XG4gICAgICAgIHJldHVybiAkc3RhdGUudHJhbnNpdGlvblRvKHJlZGlyZWN0LnRvLCByZWRpcmVjdC50b1BhcmFtcywgcmVkaXJlY3Qub3B0aW9ucyk7XG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25BYm9ydGVkO1xuICAgICAgfSk7XG4gICAgICAkdXJsUm91dGVyLnVwZGF0ZSgpO1xuXG4gICAgICByZXR1cm4gcmV0cnlUcmFuc2l0aW9uO1xuICAgIH1cblxuICAgIHJvb3QubG9jYWxzID0geyByZXNvbHZlOiBudWxsLCBnbG9iYWxzOiB7ICRzdGF0ZVBhcmFtczoge30gfSB9O1xuXG4gICAgJHN0YXRlID0ge1xuICAgICAgcGFyYW1zOiB7fSxcbiAgICAgIGN1cnJlbnQ6IHJvb3Quc2VsZixcbiAgICAgICRjdXJyZW50OiByb290LFxuICAgICAgdHJhbnNpdGlvbjogbnVsbFxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI3JlbG9hZFxuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBBIG1ldGhvZCB0aGF0IGZvcmNlIHJlbG9hZHMgdGhlIGN1cnJlbnQgc3RhdGUuIEFsbCByZXNvbHZlcyBhcmUgcmUtcmVzb2x2ZWQsXG4gICAgICogY29udHJvbGxlcnMgcmVpbnN0YW50aWF0ZWQsIGFuZCBldmVudHMgcmUtZmlyZWQuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIDxwcmU+XG4gICAgICogdmFyIGFwcCBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXInXSk7XG4gICAgICpcbiAgICAgKiBhcHAuY29udHJvbGxlcignY3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSkge1xuICAgICAqICAgJHNjb3BlLnJlbG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICogICAgICRzdGF0ZS5yZWxvYWQoKTtcbiAgICAgKiAgIH1cbiAgICAgKiB9KTtcbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIGByZWxvYWQoKWAgaXMganVzdCBhbiBhbGlhcyBmb3I6XG4gICAgICogPHByZT5cbiAgICAgKiAkc3RhdGUudHJhbnNpdGlvblRvKCRzdGF0ZS5jdXJyZW50LCAkc3RhdGVQYXJhbXMsIHsgXG4gICAgICogICByZWxvYWQ6IHRydWUsIGluaGVyaXQ6IGZhbHNlLCBub3RpZnk6IHRydWVcbiAgICAgKiB9KTtcbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nPXxvYmplY3Q9fSBzdGF0ZSAtIEEgc3RhdGUgbmFtZSBvciBhIHN0YXRlIG9iamVjdCwgd2hpY2ggaXMgdGhlIHJvb3Qgb2YgdGhlIHJlc29sdmVzIHRvIGJlIHJlLXJlc29sdmVkLlxuICAgICAqIEBleGFtcGxlXG4gICAgICogPHByZT5cbiAgICAgKiAvL2Fzc3VtaW5nIGFwcCBhcHBsaWNhdGlvbiBjb25zaXN0cyBvZiAzIHN0YXRlczogJ2NvbnRhY3RzJywgJ2NvbnRhY3RzLmRldGFpbCcsICdjb250YWN0cy5kZXRhaWwuaXRlbScgXG4gICAgICogLy9hbmQgY3VycmVudCBzdGF0ZSBpcyAnY29udGFjdHMuZGV0YWlsLml0ZW0nXG4gICAgICogdmFyIGFwcCBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXInXSk7XG4gICAgICpcbiAgICAgKiBhcHAuY29udHJvbGxlcignY3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSkge1xuICAgICAqICAgJHNjb3BlLnJlbG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICogICAgIC8vd2lsbCByZWxvYWQgJ2NvbnRhY3QuZGV0YWlsJyBhbmQgJ2NvbnRhY3QuZGV0YWlsLml0ZW0nIHN0YXRlc1xuICAgICAqICAgICAkc3RhdGUucmVsb2FkKCdjb250YWN0LmRldGFpbCcpO1xuICAgICAqICAgfVxuICAgICAqIH0pO1xuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogYHJlbG9hZCgpYCBpcyBqdXN0IGFuIGFsaWFzIGZvcjpcbiAgICAgKiA8cHJlPlxuICAgICAqICRzdGF0ZS50cmFuc2l0aW9uVG8oJHN0YXRlLmN1cnJlbnQsICRzdGF0ZVBhcmFtcywgeyBcbiAgICAgKiAgIHJlbG9hZDogdHJ1ZSwgaW5oZXJpdDogZmFsc2UsIG5vdGlmeTogdHJ1ZVxuICAgICAqIH0pO1xuICAgICAqIDwvcHJlPlxuXG4gICAgICogQHJldHVybnMge3Byb21pc2V9IEEgcHJvbWlzZSByZXByZXNlbnRpbmcgdGhlIHN0YXRlIG9mIHRoZSBuZXcgdHJhbnNpdGlvbi4gU2VlXG4gICAgICoge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19nbyAkc3RhdGUuZ299LlxuICAgICAqL1xuICAgICRzdGF0ZS5yZWxvYWQgPSBmdW5jdGlvbiByZWxvYWQoc3RhdGUpIHtcbiAgICAgIHJldHVybiAkc3RhdGUudHJhbnNpdGlvblRvKCRzdGF0ZS5jdXJyZW50LCAkc3RhdGVQYXJhbXMsIHsgcmVsb2FkOiBzdGF0ZSB8fCB0cnVlLCBpbmhlcml0OiBmYWxzZSwgbm90aWZ5OiB0cnVlfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjZ29cbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogQ29udmVuaWVuY2UgbWV0aG9kIGZvciB0cmFuc2l0aW9uaW5nIHRvIGEgbmV3IHN0YXRlLiBgJHN0YXRlLmdvYCBjYWxscyBcbiAgICAgKiBgJHN0YXRlLnRyYW5zaXRpb25Ub2AgaW50ZXJuYWxseSBidXQgYXV0b21hdGljYWxseSBzZXRzIG9wdGlvbnMgdG8gXG4gICAgICogYHsgbG9jYXRpb246IHRydWUsIGluaGVyaXQ6IHRydWUsIHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnQsIG5vdGlmeTogdHJ1ZSB9YC4gXG4gICAgICogVGhpcyBhbGxvd3MgeW91IHRvIGVhc2lseSB1c2UgYW4gYWJzb2x1dGUgb3IgcmVsYXRpdmUgdG8gcGF0aCBhbmQgc3BlY2lmeSBcbiAgICAgKiBvbmx5IHRoZSBwYXJhbWV0ZXJzIHlvdSdkIGxpa2UgdG8gdXBkYXRlICh3aGlsZSBsZXR0aW5nIHVuc3BlY2lmaWVkIHBhcmFtZXRlcnMgXG4gICAgICogaW5oZXJpdCBmcm9tIHRoZSBjdXJyZW50bHkgYWN0aXZlIGFuY2VzdG9yIHN0YXRlcykuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIDxwcmU+XG4gICAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlciddKTtcbiAgICAgKlxuICAgICAqIGFwcC5jb250cm9sbGVyKCdjdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XG4gICAgICogICAkc2NvcGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICogICAgICRzdGF0ZS5nbygnY29udGFjdC5kZXRhaWwnKTtcbiAgICAgKiAgIH07XG4gICAgICogfSk7XG4gICAgICogPC9wcmU+XG4gICAgICogPGltZyBzcmM9Jy4uL25nZG9jX2Fzc2V0cy9TdGF0ZUdvRXhhbXBsZXMucG5nJy8+XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdG8gQWJzb2x1dGUgc3RhdGUgbmFtZSBvciByZWxhdGl2ZSBzdGF0ZSBwYXRoLiBTb21lIGV4YW1wbGVzOlxuICAgICAqXG4gICAgICogLSBgJHN0YXRlLmdvKCdjb250YWN0LmRldGFpbCcpYCAtIHdpbGwgZ28gdG8gdGhlIGBjb250YWN0LmRldGFpbGAgc3RhdGVcbiAgICAgKiAtIGAkc3RhdGUuZ28oJ14nKWAgLSB3aWxsIGdvIHRvIGEgcGFyZW50IHN0YXRlXG4gICAgICogLSBgJHN0YXRlLmdvKCdeLnNpYmxpbmcnKWAgLSB3aWxsIGdvIHRvIGEgc2libGluZyBzdGF0ZVxuICAgICAqIC0gYCRzdGF0ZS5nbygnLmNoaWxkLmdyYW5kY2hpbGQnKWAgLSB3aWxsIGdvIHRvIGdyYW5kY2hpbGQgc3RhdGVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gcGFyYW1zIEEgbWFwIG9mIHRoZSBwYXJhbWV0ZXJzIHRoYXQgd2lsbCBiZSBzZW50IHRvIHRoZSBzdGF0ZSwgXG4gICAgICogd2lsbCBwb3B1bGF0ZSAkc3RhdGVQYXJhbXMuIEFueSBwYXJhbWV0ZXJzIHRoYXQgYXJlIG5vdCBzcGVjaWZpZWQgd2lsbCBiZSBpbmhlcml0ZWQgZnJvbSBjdXJyZW50bHkgXG4gICAgICogZGVmaW5lZCBwYXJhbWV0ZXJzLiBPbmx5IHBhcmFtZXRlcnMgc3BlY2lmaWVkIGluIHRoZSBzdGF0ZSBkZWZpbml0aW9uIGNhbiBiZSBvdmVycmlkZGVuLCBuZXcgXG4gICAgICogcGFyYW1ldGVycyB3aWxsIGJlIGlnbm9yZWQuIFRoaXMgYWxsb3dzLCBmb3IgZXhhbXBsZSwgZ29pbmcgdG8gYSBzaWJsaW5nIHN0YXRlIHRoYXQgc2hhcmVzIHBhcmFtZXRlcnNcbiAgICAgKiBzcGVjaWZpZWQgaW4gYSBwYXJlbnQgc3RhdGUuIFBhcmFtZXRlciBpbmhlcml0YW5jZSBvbmx5IHdvcmtzIGJldHdlZW4gY29tbW9uIGFuY2VzdG9yIHN0YXRlcywgSS5lLlxuICAgICAqIHRyYW5zaXRpb25pbmcgdG8gYSBzaWJsaW5nIHdpbGwgZ2V0IHlvdSB0aGUgcGFyYW1ldGVycyBmb3IgYWxsIHBhcmVudHMsIHRyYW5zaXRpb25pbmcgdG8gYSBjaGlsZFxuICAgICAqIHdpbGwgZ2V0IHlvdSBhbGwgY3VycmVudCBwYXJhbWV0ZXJzLCBldGMuXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICpcbiAgICAgKiAtICoqYGxvY2F0aW9uYCoqIC0ge2Jvb2xlYW49dHJ1ZXxzdHJpbmc9fSAtIElmIGB0cnVlYCB3aWxsIHVwZGF0ZSB0aGUgdXJsIGluIHRoZSBsb2NhdGlvbiBiYXIsIGlmIGBmYWxzZWBcbiAgICAgKiAgICB3aWxsIG5vdC4gSWYgc3RyaW5nLCBtdXN0IGJlIGBcInJlcGxhY2VcImAsIHdoaWNoIHdpbGwgdXBkYXRlIHVybCBhbmQgYWxzbyByZXBsYWNlIGxhc3QgaGlzdG9yeSByZWNvcmQuXG4gICAgICogLSAqKmBpbmhlcml0YCoqIC0ge2Jvb2xlYW49dHJ1ZX0sIElmIGB0cnVlYCB3aWxsIGluaGVyaXQgdXJsIHBhcmFtZXRlcnMgZnJvbSBjdXJyZW50IHVybC5cbiAgICAgKiAtICoqYHJlbGF0aXZlYCoqIC0ge29iamVjdD0kc3RhdGUuJGN1cnJlbnR9LCBXaGVuIHRyYW5zaXRpb25pbmcgd2l0aCByZWxhdGl2ZSBwYXRoIChlLmcgJ14nKSwgXG4gICAgICogICAgZGVmaW5lcyB3aGljaCBzdGF0ZSB0byBiZSByZWxhdGl2ZSBmcm9tLlxuICAgICAqIC0gKipgbm90aWZ5YCoqIC0ge2Jvb2xlYW49dHJ1ZX0sIElmIGB0cnVlYCB3aWxsIGJyb2FkY2FzdCAkc3RhdGVDaGFuZ2VTdGFydCBhbmQgJHN0YXRlQ2hhbmdlU3VjY2VzcyBldmVudHMuXG4gICAgICogLSAqKmByZWxvYWRgKiogKHYwLjIuNSkgLSB7Ym9vbGVhbj1mYWxzZXxzdHJpbmd8b2JqZWN0fSwgSWYgYHRydWVgIHdpbGwgZm9yY2UgdHJhbnNpdGlvbiBldmVuIGlmIG5vIHN0YXRlIG9yIHBhcmFtc1xuICAgICAqICAgIGhhdmUgY2hhbmdlZC4gIEl0IHdpbGwgcmVsb2FkIHRoZSByZXNvbHZlcyBhbmQgdmlld3Mgb2YgdGhlIGN1cnJlbnQgc3RhdGUgYW5kIHBhcmVudCBzdGF0ZXMuXG4gICAgICogICAgSWYgYHJlbG9hZGAgaXMgYSBzdHJpbmcgKG9yIHN0YXRlIG9iamVjdCksIHRoZSBzdGF0ZSBvYmplY3QgaXMgZmV0Y2hlZCAoYnkgbmFtZSwgb3Igb2JqZWN0IHJlZmVyZW5jZSk7IGFuZCBcXFxuICAgICAqICAgIHRoZSB0cmFuc2l0aW9uIHJlbG9hZHMgdGhlIHJlc29sdmVzIGFuZCB2aWV3cyBmb3IgdGhhdCBtYXRjaGVkIHN0YXRlLCBhbmQgYWxsIGl0cyBjaGlsZHJlbiBzdGF0ZXMuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7cHJvbWlzZX0gQSBwcm9taXNlIHJlcHJlc2VudGluZyB0aGUgc3RhdGUgb2YgdGhlIG5ldyB0cmFuc2l0aW9uLlxuICAgICAqXG4gICAgICogUG9zc2libGUgc3VjY2VzcyB2YWx1ZXM6XG4gICAgICpcbiAgICAgKiAtICRzdGF0ZS5jdXJyZW50XG4gICAgICpcbiAgICAgKiA8YnIvPlBvc3NpYmxlIHJlamVjdGlvbiB2YWx1ZXM6XG4gICAgICpcbiAgICAgKiAtICd0cmFuc2l0aW9uIHN1cGVyc2VkZWQnIC0gd2hlbiBhIG5ld2VyIHRyYW5zaXRpb24gaGFzIGJlZW4gc3RhcnRlZCBhZnRlciB0aGlzIG9uZVxuICAgICAqIC0gJ3RyYW5zaXRpb24gcHJldmVudGVkJyAtIHdoZW4gYGV2ZW50LnByZXZlbnREZWZhdWx0KClgIGhhcyBiZWVuIGNhbGxlZCBpbiBhIGAkc3RhdGVDaGFuZ2VTdGFydGAgbGlzdGVuZXJcbiAgICAgKiAtICd0cmFuc2l0aW9uIGFib3J0ZWQnIC0gd2hlbiBgZXZlbnQucHJldmVudERlZmF1bHQoKWAgaGFzIGJlZW4gY2FsbGVkIGluIGEgYCRzdGF0ZU5vdEZvdW5kYCBsaXN0ZW5lciBvclxuICAgICAqICAgd2hlbiBhIGAkc3RhdGVOb3RGb3VuZGAgYGV2ZW50LnJldHJ5YCBwcm9taXNlIGVycm9ycy5cbiAgICAgKiAtICd0cmFuc2l0aW9uIGZhaWxlZCcgLSB3aGVuIGEgc3RhdGUgaGFzIGJlZW4gdW5zdWNjZXNzZnVsbHkgZm91bmQgYWZ0ZXIgMiB0cmllcy5cbiAgICAgKiAtICpyZXNvbHZlIGVycm9yKiAtIHdoZW4gYW4gZXJyb3IgaGFzIG9jY3VycmVkIHdpdGggYSBgcmVzb2x2ZWBcbiAgICAgKlxuICAgICAqL1xuICAgICRzdGF0ZS5nbyA9IGZ1bmN0aW9uIGdvKHRvLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgIHJldHVybiAkc3RhdGUudHJhbnNpdGlvblRvKHRvLCBwYXJhbXMsIGV4dGVuZCh7IGluaGVyaXQ6IHRydWUsIHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnQgfSwgb3B0aW9ucykpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI3RyYW5zaXRpb25Ub1xuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBMb3ctbGV2ZWwgbWV0aG9kIGZvciB0cmFuc2l0aW9uaW5nIHRvIGEgbmV3IHN0YXRlLiB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nb31cbiAgICAgKiB1c2VzIGB0cmFuc2l0aW9uVG9gIGludGVybmFsbHkuIGAkc3RhdGUuZ29gIGlzIHJlY29tbWVuZGVkIGluIG1vc3Qgc2l0dWF0aW9ucy5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogPHByZT5cbiAgICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJ10pO1xuICAgICAqXG4gICAgICogYXBwLmNvbnRyb2xsZXIoJ2N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUpIHtcbiAgICAgKiAgICRzY29wZS5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgKiAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnY29udGFjdC5kZXRhaWwnKTtcbiAgICAgKiAgIH07XG4gICAgICogfSk7XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdG8gU3RhdGUgbmFtZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IHRvUGFyYW1zIEEgbWFwIG9mIHRoZSBwYXJhbWV0ZXJzIHRoYXQgd2lsbCBiZSBzZW50IHRvIHRoZSBzdGF0ZSxcbiAgICAgKiB3aWxsIHBvcHVsYXRlICRzdGF0ZVBhcmFtcy5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IG9wdGlvbnMgT3B0aW9ucyBvYmplY3QuIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgKlxuICAgICAqIC0gKipgbG9jYXRpb25gKiogLSB7Ym9vbGVhbj10cnVlfHN0cmluZz19IC0gSWYgYHRydWVgIHdpbGwgdXBkYXRlIHRoZSB1cmwgaW4gdGhlIGxvY2F0aW9uIGJhciwgaWYgYGZhbHNlYFxuICAgICAqICAgIHdpbGwgbm90LiBJZiBzdHJpbmcsIG11c3QgYmUgYFwicmVwbGFjZVwiYCwgd2hpY2ggd2lsbCB1cGRhdGUgdXJsIGFuZCBhbHNvIHJlcGxhY2UgbGFzdCBoaXN0b3J5IHJlY29yZC5cbiAgICAgKiAtICoqYGluaGVyaXRgKiogLSB7Ym9vbGVhbj1mYWxzZX0sIElmIGB0cnVlYCB3aWxsIGluaGVyaXQgdXJsIHBhcmFtZXRlcnMgZnJvbSBjdXJyZW50IHVybC5cbiAgICAgKiAtICoqYHJlbGF0aXZlYCoqIC0ge29iamVjdD19LCBXaGVuIHRyYW5zaXRpb25pbmcgd2l0aCByZWxhdGl2ZSBwYXRoIChlLmcgJ14nKSwgXG4gICAgICogICAgZGVmaW5lcyB3aGljaCBzdGF0ZSB0byBiZSByZWxhdGl2ZSBmcm9tLlxuICAgICAqIC0gKipgbm90aWZ5YCoqIC0ge2Jvb2xlYW49dHJ1ZX0sIElmIGB0cnVlYCB3aWxsIGJyb2FkY2FzdCAkc3RhdGVDaGFuZ2VTdGFydCBhbmQgJHN0YXRlQ2hhbmdlU3VjY2VzcyBldmVudHMuXG4gICAgICogLSAqKmByZWxvYWRgKiogKHYwLjIuNSkgLSB7Ym9vbGVhbj1mYWxzZXxzdHJpbmc9fG9iamVjdD19LCBJZiBgdHJ1ZWAgd2lsbCBmb3JjZSB0cmFuc2l0aW9uIGV2ZW4gaWYgdGhlIHN0YXRlIG9yIHBhcmFtcyBcbiAgICAgKiAgICBoYXZlIG5vdCBjaGFuZ2VkLCBha2EgYSByZWxvYWQgb2YgdGhlIHNhbWUgc3RhdGUuIEl0IGRpZmZlcnMgZnJvbSByZWxvYWRPblNlYXJjaCBiZWNhdXNlIHlvdSdkXG4gICAgICogICAgdXNlIHRoaXMgd2hlbiB5b3Ugd2FudCB0byBmb3JjZSBhIHJlbG9hZCB3aGVuICpldmVyeXRoaW5nKiBpcyB0aGUgc2FtZSwgaW5jbHVkaW5nIHNlYXJjaCBwYXJhbXMuXG4gICAgICogICAgaWYgU3RyaW5nLCB0aGVuIHdpbGwgcmVsb2FkIHRoZSBzdGF0ZSB3aXRoIHRoZSBuYW1lIGdpdmVuIGluIHJlbG9hZCwgYW5kIGFueSBjaGlsZHJlbi5cbiAgICAgKiAgICBpZiBPYmplY3QsIHRoZW4gYSBzdGF0ZU9iaiBpcyBleHBlY3RlZCwgd2lsbCByZWxvYWQgdGhlIHN0YXRlIGZvdW5kIGluIHN0YXRlT2JqLCBhbmQgYW55IGNoaWxkcmVuLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3Byb21pc2V9IEEgcHJvbWlzZSByZXByZXNlbnRpbmcgdGhlIHN0YXRlIG9mIHRoZSBuZXcgdHJhbnNpdGlvbi4gU2VlXG4gICAgICoge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19nbyAkc3RhdGUuZ299LlxuICAgICAqL1xuICAgICRzdGF0ZS50cmFuc2l0aW9uVG8gPSBmdW5jdGlvbiB0cmFuc2l0aW9uVG8odG8sIHRvUGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICB0b1BhcmFtcyA9IHRvUGFyYW1zIHx8IHt9O1xuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7XG4gICAgICAgIGxvY2F0aW9uOiB0cnVlLCBpbmhlcml0OiBmYWxzZSwgcmVsYXRpdmU6IG51bGwsIG5vdGlmeTogdHJ1ZSwgcmVsb2FkOiBmYWxzZSwgJHJldHJ5OiBmYWxzZVxuICAgICAgfSwgb3B0aW9ucyB8fCB7fSk7XG5cbiAgICAgIHZhciBmcm9tID0gJHN0YXRlLiRjdXJyZW50LCBmcm9tUGFyYW1zID0gJHN0YXRlLnBhcmFtcywgZnJvbVBhdGggPSBmcm9tLnBhdGg7XG4gICAgICB2YXIgZXZ0LCB0b1N0YXRlID0gZmluZFN0YXRlKHRvLCBvcHRpb25zLnJlbGF0aXZlKTtcblxuICAgICAgLy8gU3RvcmUgdGhlIGhhc2ggcGFyYW0gZm9yIGxhdGVyIChzaW5jZSBpdCB3aWxsIGJlIHN0cmlwcGVkIG91dCBieSB2YXJpb3VzIG1ldGhvZHMpXG4gICAgICB2YXIgaGFzaCA9IHRvUGFyYW1zWycjJ107XG5cbiAgICAgIGlmICghaXNEZWZpbmVkKHRvU3RhdGUpKSB7XG4gICAgICAgIHZhciByZWRpcmVjdCA9IHsgdG86IHRvLCB0b1BhcmFtczogdG9QYXJhbXMsIG9wdGlvbnM6IG9wdGlvbnMgfTtcbiAgICAgICAgdmFyIHJlZGlyZWN0UmVzdWx0ID0gaGFuZGxlUmVkaXJlY3QocmVkaXJlY3QsIGZyb20uc2VsZiwgZnJvbVBhcmFtcywgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHJlZGlyZWN0UmVzdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHJlZGlyZWN0UmVzdWx0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQWx3YXlzIHJldHJ5IG9uY2UgaWYgdGhlICRzdGF0ZU5vdEZvdW5kIHdhcyBub3QgcHJldmVudGVkXG4gICAgICAgIC8vIChoYW5kbGVzIGVpdGhlciByZWRpcmVjdCBjaGFuZ2VkIG9yIHN0YXRlIGxhenktZGVmaW5pdGlvbilcbiAgICAgICAgdG8gPSByZWRpcmVjdC50bztcbiAgICAgICAgdG9QYXJhbXMgPSByZWRpcmVjdC50b1BhcmFtcztcbiAgICAgICAgb3B0aW9ucyA9IHJlZGlyZWN0Lm9wdGlvbnM7XG4gICAgICAgIHRvU3RhdGUgPSBmaW5kU3RhdGUodG8sIG9wdGlvbnMucmVsYXRpdmUpO1xuXG4gICAgICAgIGlmICghaXNEZWZpbmVkKHRvU3RhdGUpKSB7XG4gICAgICAgICAgaWYgKCFvcHRpb25zLnJlbGF0aXZlKSB0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWNoIHN0YXRlICdcIiArIHRvICsgXCInXCIpO1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCByZXNvbHZlICdcIiArIHRvICsgXCInIGZyb20gc3RhdGUgJ1wiICsgb3B0aW9ucy5yZWxhdGl2ZSArIFwiJ1wiKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRvU3RhdGVbYWJzdHJhY3RLZXldKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgdHJhbnNpdGlvbiB0byBhYnN0cmFjdCBzdGF0ZSAnXCIgKyB0byArIFwiJ1wiKTtcbiAgICAgIGlmIChvcHRpb25zLmluaGVyaXQpIHRvUGFyYW1zID0gaW5oZXJpdFBhcmFtcygkc3RhdGVQYXJhbXMsIHRvUGFyYW1zIHx8IHt9LCAkc3RhdGUuJGN1cnJlbnQsIHRvU3RhdGUpO1xuICAgICAgaWYgKCF0b1N0YXRlLnBhcmFtcy4kJHZhbGlkYXRlcyh0b1BhcmFtcykpIHJldHVybiBUcmFuc2l0aW9uRmFpbGVkO1xuXG4gICAgICB0b1BhcmFtcyA9IHRvU3RhdGUucGFyYW1zLiQkdmFsdWVzKHRvUGFyYW1zKTtcbiAgICAgIHRvID0gdG9TdGF0ZTtcblxuICAgICAgdmFyIHRvUGF0aCA9IHRvLnBhdGg7XG5cbiAgICAgIC8vIFN0YXJ0aW5nIGZyb20gdGhlIHJvb3Qgb2YgdGhlIHBhdGgsIGtlZXAgYWxsIGxldmVscyB0aGF0IGhhdmVuJ3QgY2hhbmdlZFxuICAgICAgdmFyIGtlZXAgPSAwLCBzdGF0ZSA9IHRvUGF0aFtrZWVwXSwgbG9jYWxzID0gcm9vdC5sb2NhbHMsIHRvTG9jYWxzID0gW107XG5cbiAgICAgIGlmICghb3B0aW9ucy5yZWxvYWQpIHtcbiAgICAgICAgd2hpbGUgKHN0YXRlICYmIHN0YXRlID09PSBmcm9tUGF0aFtrZWVwXSAmJiBzdGF0ZS5vd25QYXJhbXMuJCRlcXVhbHModG9QYXJhbXMsIGZyb21QYXJhbXMpKSB7XG4gICAgICAgICAgbG9jYWxzID0gdG9Mb2NhbHNba2VlcF0gPSBzdGF0ZS5sb2NhbHM7XG4gICAgICAgICAga2VlcCsrO1xuICAgICAgICAgIHN0YXRlID0gdG9QYXRoW2tlZXBdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKG9wdGlvbnMucmVsb2FkKSB8fCBpc09iamVjdChvcHRpb25zLnJlbG9hZCkpIHtcbiAgICAgICAgaWYgKGlzT2JqZWN0KG9wdGlvbnMucmVsb2FkKSAmJiAhb3B0aW9ucy5yZWxvYWQubmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCByZWxvYWQgc3RhdGUgb2JqZWN0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHZhciByZWxvYWRTdGF0ZSA9IG9wdGlvbnMucmVsb2FkID09PSB0cnVlID8gZnJvbVBhdGhbMF0gOiBmaW5kU3RhdGUob3B0aW9ucy5yZWxvYWQpO1xuICAgICAgICBpZiAob3B0aW9ucy5yZWxvYWQgJiYgIXJlbG9hZFN0YXRlKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm8gc3VjaCByZWxvYWQgc3RhdGUgJ1wiICsgKGlzU3RyaW5nKG9wdGlvbnMucmVsb2FkKSA/IG9wdGlvbnMucmVsb2FkIDogb3B0aW9ucy5yZWxvYWQubmFtZSkgKyBcIidcIik7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoc3RhdGUgJiYgc3RhdGUgPT09IGZyb21QYXRoW2tlZXBdICYmIHN0YXRlICE9PSByZWxvYWRTdGF0ZSkge1xuICAgICAgICAgIGxvY2FscyA9IHRvTG9jYWxzW2tlZXBdID0gc3RhdGUubG9jYWxzO1xuICAgICAgICAgIGtlZXArKztcbiAgICAgICAgICBzdGF0ZSA9IHRvUGF0aFtrZWVwXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSdyZSBnb2luZyB0byB0aGUgc2FtZSBzdGF0ZSBhbmQgYWxsIGxvY2FscyBhcmUga2VwdCwgd2UndmUgZ290IG5vdGhpbmcgdG8gZG8uXG4gICAgICAvLyBCdXQgY2xlYXIgJ3RyYW5zaXRpb24nLCBhcyB3ZSBzdGlsbCB3YW50IHRvIGNhbmNlbCBhbnkgb3RoZXIgcGVuZGluZyB0cmFuc2l0aW9ucy5cbiAgICAgIC8vIFRPRE86IFdlIG1heSBub3Qgd2FudCB0byBidW1wICd0cmFuc2l0aW9uJyBpZiB3ZSdyZSBjYWxsZWQgZnJvbSBhIGxvY2F0aW9uIGNoYW5nZVxuICAgICAgLy8gdGhhdCB3ZSd2ZSBpbml0aWF0ZWQgb3Vyc2VsdmVzLCBiZWNhdXNlIHdlIG1pZ2h0IGFjY2lkZW50YWxseSBhYm9ydCBhIGxlZ2l0aW1hdGVcbiAgICAgIC8vIHRyYW5zaXRpb24gaW5pdGlhdGVkIGZyb20gY29kZT9cbiAgICAgIGlmIChzaG91bGRTa2lwUmVsb2FkKHRvLCB0b1BhcmFtcywgZnJvbSwgZnJvbVBhcmFtcywgbG9jYWxzLCBvcHRpb25zKSkge1xuICAgICAgICBpZiAoaGFzaCkgdG9QYXJhbXNbJyMnXSA9IGhhc2g7XG4gICAgICAgICRzdGF0ZS5wYXJhbXMgPSB0b1BhcmFtcztcbiAgICAgICAgY29weSgkc3RhdGUucGFyYW1zLCAkc3RhdGVQYXJhbXMpO1xuICAgICAgICBjb3B5KGZpbHRlckJ5S2V5cyh0by5wYXJhbXMuJCRrZXlzKCksICRzdGF0ZVBhcmFtcyksIHRvLmxvY2Fscy5nbG9iYWxzLiRzdGF0ZVBhcmFtcyk7XG4gICAgICAgIGlmIChvcHRpb25zLmxvY2F0aW9uICYmIHRvLm5hdmlnYWJsZSAmJiB0by5uYXZpZ2FibGUudXJsKSB7XG4gICAgICAgICAgJHVybFJvdXRlci5wdXNoKHRvLm5hdmlnYWJsZS51cmwsIHRvUGFyYW1zLCB7XG4gICAgICAgICAgICAkJGF2b2lkUmVzeW5jOiB0cnVlLCByZXBsYWNlOiBvcHRpb25zLmxvY2F0aW9uID09PSAncmVwbGFjZSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICAkc3RhdGUudHJhbnNpdGlvbiA9IG51bGw7XG4gICAgICAgIHJldHVybiAkcS53aGVuKCRzdGF0ZS5jdXJyZW50KTtcbiAgICAgIH1cblxuICAgICAgLy8gRmlsdGVyIHBhcmFtZXRlcnMgYmVmb3JlIHdlIHBhc3MgdGhlbSB0byBldmVudCBoYW5kbGVycyBldGMuXG4gICAgICB0b1BhcmFtcyA9IGZpbHRlckJ5S2V5cyh0by5wYXJhbXMuJCRrZXlzKCksIHRvUGFyYW1zIHx8IHt9KTtcbiAgICAgIFxuICAgICAgLy8gUmUtYWRkIHRoZSBzYXZlZCBoYXNoIGJlZm9yZSB3ZSBzdGFydCByZXR1cm5pbmcgdGhpbmdzIG9yIGJyb2FkY2FzdGluZyAkc3RhdGVDaGFuZ2VTdGFydFxuICAgICAgaWYgKGhhc2gpIHRvUGFyYW1zWycjJ10gPSBoYXNoO1xuICAgICAgXG4gICAgICAvLyBCcm9hZGNhc3Qgc3RhcnQgZXZlbnQgYW5kIGNhbmNlbCB0aGUgdHJhbnNpdGlvbiBpZiByZXF1ZXN0ZWRcbiAgICAgIGlmIChvcHRpb25zLm5vdGlmeSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQG5nZG9jIGV2ZW50XG4gICAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjJHN0YXRlQ2hhbmdlU3RhcnRcbiAgICAgICAgICogQGV2ZW50T2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXG4gICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgKiBGaXJlZCB3aGVuIHRoZSBzdGF0ZSB0cmFuc2l0aW9uICoqYmVnaW5zKiouIFlvdSBjYW4gdXNlIGBldmVudC5wcmV2ZW50RGVmYXVsdCgpYFxuICAgICAgICAgKiB0byBwcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGZyb20gaGFwcGVuaW5nIGFuZCB0aGVuIHRoZSB0cmFuc2l0aW9uIHByb21pc2Ugd2lsbCBiZVxuICAgICAgICAgKiByZWplY3RlZCB3aXRoIGEgYCd0cmFuc2l0aW9uIHByZXZlbnRlZCdgIHZhbHVlLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0ge1N0YXRlfSB0b1N0YXRlIFRoZSBzdGF0ZSBiZWluZyB0cmFuc2l0aW9uZWQgdG8uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b1BhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgdG9TdGF0ZWAuXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IGZyb21TdGF0ZSBUaGUgY3VycmVudCBzdGF0ZSwgcHJlLXRyYW5zaXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBmcm9tUGFyYW1zIFRoZSBwYXJhbXMgc3VwcGxpZWQgdG8gdGhlIGBmcm9tU3RhdGVgLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAZXhhbXBsZVxuICAgICAgICAgKlxuICAgICAgICAgKiA8cHJlPlxuICAgICAgICAgKiAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLFxuICAgICAgICAgKiBmdW5jdGlvbihldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyl7XG4gICAgICAgICAqICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgKiAgICAgLy8gdHJhbnNpdGlvblRvKCkgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGhcbiAgICAgICAgICogICAgIC8vIGEgJ3RyYW5zaXRpb24gcHJldmVudGVkJyBlcnJvclxuICAgICAgICAgKiB9KVxuICAgICAgICAgKiA8L3ByZT5cbiAgICAgICAgICovXG4gICAgICAgIGlmICgkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRzdGF0ZUNoYW5nZVN0YXJ0JywgdG8uc2VsZiwgdG9QYXJhbXMsIGZyb20uc2VsZiwgZnJvbVBhcmFtcywgb3B0aW9ucykuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHN0YXRlQ2hhbmdlQ2FuY2VsJywgdG8uc2VsZiwgdG9QYXJhbXMsIGZyb20uc2VsZiwgZnJvbVBhcmFtcyk7XG4gICAgICAgICAgLy9Eb24ndCB1cGRhdGUgYW5kIHJlc3luYyB1cmwgaWYgdGhlcmUncyBiZWVuIGEgbmV3IHRyYW5zaXRpb24gc3RhcnRlZC4gc2VlIGlzc3VlICMyMjM4LCAjNjAwXG4gICAgICAgICAgaWYgKCRzdGF0ZS50cmFuc2l0aW9uID09IG51bGwpICR1cmxSb3V0ZXIudXBkYXRlKCk7XG4gICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25QcmV2ZW50ZWQ7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVzb2x2ZSBsb2NhbHMgZm9yIHRoZSByZW1haW5pbmcgc3RhdGVzLCBidXQgZG9uJ3QgdXBkYXRlIGFueSBnbG9iYWwgc3RhdGUganVzdFxuICAgICAgLy8geWV0IC0tIGlmIGFueXRoaW5nIGZhaWxzIHRvIHJlc29sdmUgdGhlIGN1cnJlbnQgc3RhdGUgbmVlZHMgdG8gcmVtYWluIHVudG91Y2hlZC5cbiAgICAgIC8vIFdlIGFsc28gc2V0IHVwIGFuIGluaGVyaXRhbmNlIGNoYWluIGZvciB0aGUgbG9jYWxzIGhlcmUuIFRoaXMgYWxsb3dzIHRoZSB2aWV3IGRpcmVjdGl2ZVxuICAgICAgLy8gdG8gcXVpY2tseSBsb29rIHVwIHRoZSBjb3JyZWN0IGRlZmluaXRpb24gZm9yIGVhY2ggdmlldyBpbiB0aGUgY3VycmVudCBzdGF0ZS4gRXZlblxuICAgICAgLy8gdGhvdWdoIHdlIGNyZWF0ZSB0aGUgbG9jYWxzIG9iamVjdCBpdHNlbGYgb3V0c2lkZSByZXNvbHZlU3RhdGUoKSwgaXQgaXMgaW5pdGlhbGx5XG4gICAgICAvLyBlbXB0eSBhbmQgZ2V0cyBmaWxsZWQgYXN5bmNocm9ub3VzbHkuIFdlIG5lZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgcHJvbWlzZSBmb3IgdGhlXG4gICAgICAvLyAoZnVsbHkgcmVzb2x2ZWQpIGN1cnJlbnQgbG9jYWxzLCBhbmQgcGFzcyB0aGlzIGRvd24gdGhlIGNoYWluLlxuICAgICAgdmFyIHJlc29sdmVkID0gJHEud2hlbihsb2NhbHMpO1xuXG4gICAgICBmb3IgKHZhciBsID0ga2VlcDsgbCA8IHRvUGF0aC5sZW5ndGg7IGwrKywgc3RhdGUgPSB0b1BhdGhbbF0pIHtcbiAgICAgICAgbG9jYWxzID0gdG9Mb2NhbHNbbF0gPSBpbmhlcml0KGxvY2Fscyk7XG4gICAgICAgIHJlc29sdmVkID0gcmVzb2x2ZVN0YXRlKHN0YXRlLCB0b1BhcmFtcywgc3RhdGUgPT09IHRvLCByZXNvbHZlZCwgbG9jYWxzLCBvcHRpb25zKTtcbiAgICAgIH1cblxuICAgICAgLy8gT25jZSBldmVyeXRoaW5nIGlzIHJlc29sdmVkLCB3ZSBhcmUgcmVhZHkgdG8gcGVyZm9ybSB0aGUgYWN0dWFsIHRyYW5zaXRpb25cbiAgICAgIC8vIGFuZCByZXR1cm4gYSBwcm9taXNlIGZvciB0aGUgbmV3IHN0YXRlLiBXZSBhbHNvIGtlZXAgdHJhY2sgb2Ygd2hhdCB0aGVcbiAgICAgIC8vIGN1cnJlbnQgcHJvbWlzZSBpcywgc28gdGhhdCB3ZSBjYW4gZGV0ZWN0IG92ZXJsYXBwaW5nIHRyYW5zaXRpb25zIGFuZFxuICAgICAgLy8ga2VlcCBvbmx5IHRoZSBvdXRjb21lIG9mIHRoZSBsYXN0IHRyYW5zaXRpb24uXG4gICAgICB2YXIgdHJhbnNpdGlvbiA9ICRzdGF0ZS50cmFuc2l0aW9uID0gcmVzb2x2ZWQudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsLCBlbnRlcmluZywgZXhpdGluZztcblxuICAgICAgICBpZiAoJHN0YXRlLnRyYW5zaXRpb24gIT09IHRyYW5zaXRpb24pIHJldHVybiBUcmFuc2l0aW9uU3VwZXJzZWRlZDtcblxuICAgICAgICAvLyBFeGl0ICdmcm9tJyBzdGF0ZXMgbm90IGtlcHRcbiAgICAgICAgZm9yIChsID0gZnJvbVBhdGgubGVuZ3RoIC0gMTsgbCA+PSBrZWVwOyBsLS0pIHtcbiAgICAgICAgICBleGl0aW5nID0gZnJvbVBhdGhbbF07XG4gICAgICAgICAgaWYgKGV4aXRpbmcuc2VsZi5vbkV4aXQpIHtcbiAgICAgICAgICAgICRpbmplY3Rvci5pbnZva2UoZXhpdGluZy5zZWxmLm9uRXhpdCwgZXhpdGluZy5zZWxmLCBleGl0aW5nLmxvY2Fscy5nbG9iYWxzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXhpdGluZy5sb2NhbHMgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW50ZXIgJ3RvJyBzdGF0ZXMgbm90IGtlcHRcbiAgICAgICAgZm9yIChsID0ga2VlcDsgbCA8IHRvUGF0aC5sZW5ndGg7IGwrKykge1xuICAgICAgICAgIGVudGVyaW5nID0gdG9QYXRoW2xdO1xuICAgICAgICAgIGVudGVyaW5nLmxvY2FscyA9IHRvTG9jYWxzW2xdO1xuICAgICAgICAgIGlmIChlbnRlcmluZy5zZWxmLm9uRW50ZXIpIHtcbiAgICAgICAgICAgICRpbmplY3Rvci5pbnZva2UoZW50ZXJpbmcuc2VsZi5vbkVudGVyLCBlbnRlcmluZy5zZWxmLCBlbnRlcmluZy5sb2NhbHMuZ2xvYmFscyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUnVuIGl0IGFnYWluLCB0byBjYXRjaCBhbnkgdHJhbnNpdGlvbnMgaW4gY2FsbGJhY2tzXG4gICAgICAgIGlmICgkc3RhdGUudHJhbnNpdGlvbiAhPT0gdHJhbnNpdGlvbikgcmV0dXJuIFRyYW5zaXRpb25TdXBlcnNlZGVkO1xuXG4gICAgICAgIC8vIFVwZGF0ZSBnbG9iYWxzIGluICRzdGF0ZVxuICAgICAgICAkc3RhdGUuJGN1cnJlbnQgPSB0bztcbiAgICAgICAgJHN0YXRlLmN1cnJlbnQgPSB0by5zZWxmO1xuICAgICAgICAkc3RhdGUucGFyYW1zID0gdG9QYXJhbXM7XG4gICAgICAgIGNvcHkoJHN0YXRlLnBhcmFtcywgJHN0YXRlUGFyYW1zKTtcbiAgICAgICAgJHN0YXRlLnRyYW5zaXRpb24gPSBudWxsO1xuXG4gICAgICAgIGlmIChvcHRpb25zLmxvY2F0aW9uICYmIHRvLm5hdmlnYWJsZSkge1xuICAgICAgICAgICR1cmxSb3V0ZXIucHVzaCh0by5uYXZpZ2FibGUudXJsLCB0by5uYXZpZ2FibGUubG9jYWxzLmdsb2JhbHMuJHN0YXRlUGFyYW1zLCB7XG4gICAgICAgICAgICAkJGF2b2lkUmVzeW5jOiB0cnVlLCByZXBsYWNlOiBvcHRpb25zLmxvY2F0aW9uID09PSAncmVwbGFjZSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb25zLm5vdGlmeSkge1xuICAgICAgICAvKipcbiAgICAgICAgICogQG5nZG9jIGV2ZW50XG4gICAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjJHN0YXRlQ2hhbmdlU3VjY2Vzc1xuICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICAgICAqIEBldmVudFR5cGUgYnJvYWRjYXN0IG9uIHJvb3Qgc2NvcGVcbiAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAqIEZpcmVkIG9uY2UgdGhlIHN0YXRlIHRyYW5zaXRpb24gaXMgKipjb21wbGV0ZSoqLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0ge1N0YXRlfSB0b1N0YXRlIFRoZSBzdGF0ZSBiZWluZyB0cmFuc2l0aW9uZWQgdG8uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b1BhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgdG9TdGF0ZWAuXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IGZyb21TdGF0ZSBUaGUgY3VycmVudCBzdGF0ZSwgcHJlLXRyYW5zaXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBmcm9tUGFyYW1zIFRoZSBwYXJhbXMgc3VwcGxpZWQgdG8gdGhlIGBmcm9tU3RhdGVgLlxuICAgICAgICAgKi9cbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCB0by5zZWxmLCB0b1BhcmFtcywgZnJvbS5zZWxmLCBmcm9tUGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSh0cnVlKTtcblxuICAgICAgICByZXR1cm4gJHN0YXRlLmN1cnJlbnQ7XG4gICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBpZiAoJHN0YXRlLnRyYW5zaXRpb24gIT09IHRyYW5zaXRpb24pIHJldHVybiBUcmFuc2l0aW9uU3VwZXJzZWRlZDtcblxuICAgICAgICAkc3RhdGUudHJhbnNpdGlvbiA9IG51bGw7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbmdkb2MgZXZlbnRcbiAgICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSMkc3RhdGVDaGFuZ2VFcnJvclxuICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICAgICAqIEBldmVudFR5cGUgYnJvYWRjYXN0IG9uIHJvb3Qgc2NvcGVcbiAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYW4gKiplcnJvciBvY2N1cnMqKiBkdXJpbmcgdHJhbnNpdGlvbi4gSXQncyBpbXBvcnRhbnQgdG8gbm90ZSB0aGF0IGlmIHlvdVxuICAgICAgICAgKiBoYXZlIGFueSBlcnJvcnMgaW4geW91ciByZXNvbHZlIGZ1bmN0aW9ucyAoamF2YXNjcmlwdCBlcnJvcnMsIG5vbi1leGlzdGVudCBzZXJ2aWNlcywgZXRjKVxuICAgICAgICAgKiB0aGV5IHdpbGwgbm90IHRocm93IHRyYWRpdGlvbmFsbHkuIFlvdSBtdXN0IGxpc3RlbiBmb3IgdGhpcyAkc3RhdGVDaGFuZ2VFcnJvciBldmVudCB0b1xuICAgICAgICAgKiBjYXRjaCAqKkFMTCoqIGVycm9ycy5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gdG9TdGF0ZSBUaGUgc3RhdGUgYmVpbmcgdHJhbnNpdGlvbmVkIHRvLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdG9QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYHRvU3RhdGVgLlxuICAgICAgICAgKiBAcGFyYW0ge1N0YXRlfSBmcm9tU3RhdGUgVGhlIGN1cnJlbnQgc3RhdGUsIHByZS10cmFuc2l0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZnJvbVBhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgZnJvbVN0YXRlYC5cbiAgICAgICAgICogQHBhcmFtIHtFcnJvcn0gZXJyb3IgVGhlIHJlc29sdmUgZXJyb3Igb2JqZWN0LlxuICAgICAgICAgKi9cbiAgICAgICAgZXZ0ID0gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVDaGFuZ2VFcnJvcicsIHRvLnNlbGYsIHRvUGFyYW1zLCBmcm9tLnNlbGYsIGZyb21QYXJhbXMsIGVycm9yKTtcblxuICAgICAgICBpZiAoIWV2dC5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHRyYW5zaXRpb247XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjaXNcbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogU2ltaWxhciB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2luY2x1ZGVzICRzdGF0ZS5pbmNsdWRlc30sXG4gICAgICogYnV0IG9ubHkgY2hlY2tzIGZvciB0aGUgZnVsbCBzdGF0ZSBuYW1lLiBJZiBwYXJhbXMgaXMgc3VwcGxpZWQgdGhlbiBpdCB3aWxsIGJlXG4gICAgICogdGVzdGVkIGZvciBzdHJpY3QgZXF1YWxpdHkgYWdhaW5zdCB0aGUgY3VycmVudCBhY3RpdmUgcGFyYW1zIG9iamVjdCwgc28gYWxsIHBhcmFtc1xuICAgICAqIG11c3QgbWF0Y2ggd2l0aCBub25lIG1pc3NpbmcgYW5kIG5vIGV4dHJhcy5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogPHByZT5cbiAgICAgKiAkc3RhdGUuJGN1cnJlbnQubmFtZSA9ICdjb250YWN0cy5kZXRhaWxzLml0ZW0nO1xuICAgICAqXG4gICAgICogLy8gYWJzb2x1dGUgbmFtZVxuICAgICAqICRzdGF0ZS5pcygnY29udGFjdC5kZXRhaWxzLml0ZW0nKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmlzKGNvbnRhY3REZXRhaWxJdGVtU3RhdGVPYmplY3QpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKlxuICAgICAqIC8vIHJlbGF0aXZlIG5hbWUgKC4gYW5kIF4pLCB0eXBpY2FsbHkgZnJvbSBhIHRlbXBsYXRlXG4gICAgICogLy8gRS5nLiBmcm9tIHRoZSAnY29udGFjdHMuZGV0YWlscycgdGVtcGxhdGVcbiAgICAgKiA8ZGl2IG5nLWNsYXNzPVwie2hpZ2hsaWdodGVkOiAkc3RhdGUuaXMoJy5pdGVtJyl9XCI+SXRlbTwvZGl2PlxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBzdGF0ZU9yTmFtZSBUaGUgc3RhdGUgbmFtZSAoYWJzb2x1dGUgb3IgcmVsYXRpdmUpIG9yIHN0YXRlIG9iamVjdCB5b3UnZCBsaWtlIHRvIGNoZWNrLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gcGFyYW1zIEEgcGFyYW0gb2JqZWN0LCBlLmcuIGB7c2VjdGlvbklkOiBzZWN0aW9uLmlkfWAsIHRoYXQgeW91J2QgbGlrZVxuICAgICAqIHRvIHRlc3QgYWdhaW5zdCB0aGUgY3VycmVudCBhY3RpdmUgc3RhdGUuXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0LiAgVGhlIG9wdGlvbnMgYXJlOlxuICAgICAqXG4gICAgICogLSAqKmByZWxhdGl2ZWAqKiAtIHtzdHJpbmd8b2JqZWN0fSAtICBJZiBgc3RhdGVPck5hbWVgIGlzIGEgcmVsYXRpdmUgc3RhdGUgbmFtZSBhbmQgYG9wdGlvbnMucmVsYXRpdmVgIGlzIHNldCwgLmlzIHdpbGxcbiAgICAgKiB0ZXN0IHJlbGF0aXZlIHRvIGBvcHRpb25zLnJlbGF0aXZlYCBzdGF0ZSAob3IgbmFtZSkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGl0IGlzIHRoZSBzdGF0ZS5cbiAgICAgKi9cbiAgICAkc3RhdGUuaXMgPSBmdW5jdGlvbiBpcyhzdGF0ZU9yTmFtZSwgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHsgcmVsYXRpdmU6ICRzdGF0ZS4kY3VycmVudCB9LCBvcHRpb25zIHx8IHt9KTtcbiAgICAgIHZhciBzdGF0ZSA9IGZpbmRTdGF0ZShzdGF0ZU9yTmFtZSwgb3B0aW9ucy5yZWxhdGl2ZSk7XG5cbiAgICAgIGlmICghaXNEZWZpbmVkKHN0YXRlKSkgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICBpZiAoJHN0YXRlLiRjdXJyZW50ICE9PSBzdGF0ZSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgIHJldHVybiBwYXJhbXMgPyBlcXVhbEZvcktleXMoc3RhdGUucGFyYW1zLiQkdmFsdWVzKHBhcmFtcyksICRzdGF0ZVBhcmFtcykgOiB0cnVlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI2luY2x1ZGVzXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIEEgbWV0aG9kIHRvIGRldGVybWluZSBpZiB0aGUgY3VycmVudCBhY3RpdmUgc3RhdGUgaXMgZXF1YWwgdG8gb3IgaXMgdGhlIGNoaWxkIG9mIHRoZVxuICAgICAqIHN0YXRlIHN0YXRlTmFtZS4gSWYgYW55IHBhcmFtcyBhcmUgcGFzc2VkIHRoZW4gdGhleSB3aWxsIGJlIHRlc3RlZCBmb3IgYSBtYXRjaCBhcyB3ZWxsLlxuICAgICAqIE5vdCBhbGwgdGhlIHBhcmFtZXRlcnMgbmVlZCB0byBiZSBwYXNzZWQsIGp1c3QgdGhlIG9uZXMgeW91J2QgbGlrZSB0byB0ZXN0IGZvciBlcXVhbGl0eS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogUGFydGlhbCBhbmQgcmVsYXRpdmUgbmFtZXNcbiAgICAgKiA8cHJlPlxuICAgICAqICRzdGF0ZS4kY3VycmVudC5uYW1lID0gJ2NvbnRhY3RzLmRldGFpbHMuaXRlbSc7XG4gICAgICpcbiAgICAgKiAvLyBVc2luZyBwYXJ0aWFsIG5hbWVzXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiY29udGFjdHNcIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImNvbnRhY3RzLmRldGFpbHNcIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImNvbnRhY3RzLmRldGFpbHMuaXRlbVwiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiY29udGFjdHMubGlzdFwiKTsgLy8gcmV0dXJucyBmYWxzZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImFib3V0XCIpOyAvLyByZXR1cm5zIGZhbHNlXG4gICAgICpcbiAgICAgKiAvLyBVc2luZyByZWxhdGl2ZSBuYW1lcyAoLiBhbmQgXiksIHR5cGljYWxseSBmcm9tIGEgdGVtcGxhdGVcbiAgICAgKiAvLyBFLmcuIGZyb20gdGhlICdjb250YWN0cy5kZXRhaWxzJyB0ZW1wbGF0ZVxuICAgICAqIDxkaXYgbmctY2xhc3M9XCJ7aGlnaGxpZ2h0ZWQ6ICRzdGF0ZS5pbmNsdWRlcygnLml0ZW0nKX1cIj5JdGVtPC9kaXY+XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBCYXNpYyBnbG9iYmluZyBwYXR0ZXJuc1xuICAgICAqIDxwcmU+XG4gICAgICogJHN0YXRlLiRjdXJyZW50Lm5hbWUgPSAnY29udGFjdHMuZGV0YWlscy5pdGVtLnVybCc7XG4gICAgICpcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqLmRldGFpbHMuKi4qXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqLmRldGFpbHMuKipcIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIioqLml0ZW0uKipcIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIiouZGV0YWlscy5pdGVtLnVybFwiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKi5kZXRhaWxzLioudXJsXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqLmRldGFpbHMuKlwiKTsgLy8gcmV0dXJucyBmYWxzZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIml0ZW0uKipcIik7IC8vIHJldHVybnMgZmFsc2VcbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZU9yTmFtZSBBIHBhcnRpYWwgbmFtZSwgcmVsYXRpdmUgbmFtZSwgb3IgZ2xvYiBwYXR0ZXJuXG4gICAgICogdG8gYmUgc2VhcmNoZWQgZm9yIHdpdGhpbiB0aGUgY3VycmVudCBzdGF0ZSBuYW1lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gcGFyYW1zIEEgcGFyYW0gb2JqZWN0LCBlLmcuIGB7c2VjdGlvbklkOiBzZWN0aW9uLmlkfWAsXG4gICAgICogdGhhdCB5b3UnZCBsaWtlIHRvIHRlc3QgYWdhaW5zdCB0aGUgY3VycmVudCBhY3RpdmUgc3RhdGUuXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0LiAgVGhlIG9wdGlvbnMgYXJlOlxuICAgICAqXG4gICAgICogLSAqKmByZWxhdGl2ZWAqKiAtIHtzdHJpbmd8b2JqZWN0PX0gLSAgSWYgYHN0YXRlT3JOYW1lYCBpcyBhIHJlbGF0aXZlIHN0YXRlIHJlZmVyZW5jZSBhbmQgYG9wdGlvbnMucmVsYXRpdmVgIGlzIHNldCxcbiAgICAgKiAuaW5jbHVkZXMgd2lsbCB0ZXN0IHJlbGF0aXZlIHRvIGBvcHRpb25zLnJlbGF0aXZlYCBzdGF0ZSAob3IgbmFtZSkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIGl0IGRvZXMgaW5jbHVkZSB0aGUgc3RhdGVcbiAgICAgKi9cbiAgICAkc3RhdGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyhzdGF0ZU9yTmFtZSwgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHsgcmVsYXRpdmU6ICRzdGF0ZS4kY3VycmVudCB9LCBvcHRpb25zIHx8IHt9KTtcbiAgICAgIGlmIChpc1N0cmluZyhzdGF0ZU9yTmFtZSkgJiYgaXNHbG9iKHN0YXRlT3JOYW1lKSkge1xuICAgICAgICBpZiAoIWRvZXNTdGF0ZU1hdGNoR2xvYihzdGF0ZU9yTmFtZSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdGVPck5hbWUgPSAkc3RhdGUuJGN1cnJlbnQubmFtZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN0YXRlID0gZmluZFN0YXRlKHN0YXRlT3JOYW1lLCBvcHRpb25zLnJlbGF0aXZlKTtcbiAgICAgIGlmICghaXNEZWZpbmVkKHN0YXRlKSkgeyByZXR1cm4gdW5kZWZpbmVkOyB9XG4gICAgICBpZiAoIWlzRGVmaW5lZCgkc3RhdGUuJGN1cnJlbnQuaW5jbHVkZXNbc3RhdGUubmFtZV0pKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgcmV0dXJuIHBhcmFtcyA/IGVxdWFsRm9yS2V5cyhzdGF0ZS5wYXJhbXMuJCR2YWx1ZXMocGFyYW1zKSwgJHN0YXRlUGFyYW1zLCBvYmplY3RLZXlzKHBhcmFtcykpIDogdHJ1ZTtcbiAgICB9O1xuXG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI2hyZWZcbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogQSB1cmwgZ2VuZXJhdGlvbiBtZXRob2QgdGhhdCByZXR1cm5zIHRoZSBjb21waWxlZCB1cmwgZm9yIHRoZSBnaXZlbiBzdGF0ZSBwb3B1bGF0ZWQgd2l0aCB0aGUgZ2l2ZW4gcGFyYW1zLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiA8cHJlPlxuICAgICAqIGV4cGVjdCgkc3RhdGUuaHJlZihcImFib3V0LnBlcnNvblwiLCB7IHBlcnNvbjogXCJib2JcIiB9KSkudG9FcXVhbChcIi9hYm91dC9ib2JcIik7XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHN0YXRlT3JOYW1lIFRoZSBzdGF0ZSBuYW1lIG9yIHN0YXRlIG9iamVjdCB5b3UnZCBsaWtlIHRvIGdlbmVyYXRlIGEgdXJsIGZyb20uXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQW4gb2JqZWN0IG9mIHBhcmFtZXRlciB2YWx1ZXMgdG8gZmlsbCB0aGUgc3RhdGUncyByZXF1aXJlZCBwYXJhbWV0ZXJzLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0aW9ucyBPcHRpb25zIG9iamVjdC4gVGhlIG9wdGlvbnMgYXJlOlxuICAgICAqXG4gICAgICogLSAqKmBsb3NzeWAqKiAtIHtib29sZWFuPXRydWV9IC0gIElmIHRydWUsIGFuZCBpZiB0aGVyZSBpcyBubyB1cmwgYXNzb2NpYXRlZCB3aXRoIHRoZSBzdGF0ZSBwcm92aWRlZCBpbiB0aGVcbiAgICAgKiAgICBmaXJzdCBwYXJhbWV0ZXIsIHRoZW4gdGhlIGNvbnN0cnVjdGVkIGhyZWYgdXJsIHdpbGwgYmUgYnVpbHQgZnJvbSB0aGUgZmlyc3QgbmF2aWdhYmxlIGFuY2VzdG9yIChha2FcbiAgICAgKiAgICBhbmNlc3RvciB3aXRoIGEgdmFsaWQgdXJsKS5cbiAgICAgKiAtICoqYGluaGVyaXRgKiogLSB7Ym9vbGVhbj10cnVlfSwgSWYgYHRydWVgIHdpbGwgaW5oZXJpdCB1cmwgcGFyYW1ldGVycyBmcm9tIGN1cnJlbnQgdXJsLlxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7b2JqZWN0PSRzdGF0ZS4kY3VycmVudH0sIFdoZW4gdHJhbnNpdGlvbmluZyB3aXRoIHJlbGF0aXZlIHBhdGggKGUuZyAnXicpLCBcbiAgICAgKiAgICBkZWZpbmVzIHdoaWNoIHN0YXRlIHRvIGJlIHJlbGF0aXZlIGZyb20uXG4gICAgICogLSAqKmBhYnNvbHV0ZWAqKiAtIHtib29sZWFuPWZhbHNlfSwgIElmIHRydWUgd2lsbCBnZW5lcmF0ZSBhbiBhYnNvbHV0ZSB1cmwsIGUuZy4gXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL2Z1bGx1cmxcIi5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb21waWxlZCBzdGF0ZSB1cmxcbiAgICAgKi9cbiAgICAkc3RhdGUuaHJlZiA9IGZ1bmN0aW9uIGhyZWYoc3RhdGVPck5hbWUsIHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7XG4gICAgICAgIGxvc3N5OiAgICB0cnVlLFxuICAgICAgICBpbmhlcml0OiAgdHJ1ZSxcbiAgICAgICAgYWJzb2x1dGU6IGZhbHNlLFxuICAgICAgICByZWxhdGl2ZTogJHN0YXRlLiRjdXJyZW50XG4gICAgICB9LCBvcHRpb25zIHx8IHt9KTtcblxuICAgICAgdmFyIHN0YXRlID0gZmluZFN0YXRlKHN0YXRlT3JOYW1lLCBvcHRpb25zLnJlbGF0aXZlKTtcblxuICAgICAgaWYgKCFpc0RlZmluZWQoc3RhdGUpKSByZXR1cm4gbnVsbDtcbiAgICAgIGlmIChvcHRpb25zLmluaGVyaXQpIHBhcmFtcyA9IGluaGVyaXRQYXJhbXMoJHN0YXRlUGFyYW1zLCBwYXJhbXMgfHwge30sICRzdGF0ZS4kY3VycmVudCwgc3RhdGUpO1xuICAgICAgXG4gICAgICB2YXIgbmF2ID0gKHN0YXRlICYmIG9wdGlvbnMubG9zc3kpID8gc3RhdGUubmF2aWdhYmxlIDogc3RhdGU7XG5cbiAgICAgIGlmICghbmF2IHx8IG5hdi51cmwgPT09IHVuZGVmaW5lZCB8fCBuYXYudXJsID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuICR1cmxSb3V0ZXIuaHJlZihuYXYudXJsLCBmaWx0ZXJCeUtleXMoc3RhdGUucGFyYW1zLiQka2V5cygpLmNvbmNhdCgnIycpLCBwYXJhbXMgfHwge30pLCB7XG4gICAgICAgIGFic29sdXRlOiBvcHRpb25zLmFic29sdXRlXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNnZXRcbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogUmV0dXJucyB0aGUgc3RhdGUgY29uZmlndXJhdGlvbiBvYmplY3QgZm9yIGFueSBzcGVjaWZpYyBzdGF0ZSBvciBhbGwgc3RhdGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0PX0gc3RhdGVPck5hbWUgKGFic29sdXRlIG9yIHJlbGF0aXZlKSBJZiBwcm92aWRlZCwgd2lsbCBvbmx5IGdldCB0aGUgY29uZmlnIGZvclxuICAgICAqIHRoZSByZXF1ZXN0ZWQgc3RhdGUuIElmIG5vdCBwcm92aWRlZCwgcmV0dXJucyBhbiBhcnJheSBvZiBBTEwgc3RhdGUgY29uZmlncy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3Q9fSBjb250ZXh0IFdoZW4gc3RhdGVPck5hbWUgaXMgYSByZWxhdGl2ZSBzdGF0ZSByZWZlcmVuY2UsIHRoZSBzdGF0ZSB3aWxsIGJlIHJldHJpZXZlZCByZWxhdGl2ZSB0byBjb250ZXh0LlxuICAgICAqIEByZXR1cm5zIHtPYmplY3R8QXJyYXl9IFN0YXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIGFycmF5IG9mIGFsbCBvYmplY3RzLlxuICAgICAqL1xuICAgICRzdGF0ZS5nZXQgPSBmdW5jdGlvbiAoc3RhdGVPck5hbWUsIGNvbnRleHQpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gbWFwKG9iamVjdEtleXMoc3RhdGVzKSwgZnVuY3Rpb24obmFtZSkgeyByZXR1cm4gc3RhdGVzW25hbWVdLnNlbGY7IH0pO1xuICAgICAgdmFyIHN0YXRlID0gZmluZFN0YXRlKHN0YXRlT3JOYW1lLCBjb250ZXh0IHx8ICRzdGF0ZS4kY3VycmVudCk7XG4gICAgICByZXR1cm4gKHN0YXRlICYmIHN0YXRlLnNlbGYpID8gc3RhdGUuc2VsZiA6IG51bGw7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHJlc29sdmVTdGF0ZShzdGF0ZSwgcGFyYW1zLCBwYXJhbXNBcmVGaWx0ZXJlZCwgaW5oZXJpdGVkLCBkc3QsIG9wdGlvbnMpIHtcbiAgICAgIC8vIE1ha2UgYSByZXN0cmljdGVkICRzdGF0ZVBhcmFtcyB3aXRoIG9ubHkgdGhlIHBhcmFtZXRlcnMgdGhhdCBhcHBseSB0byB0aGlzIHN0YXRlIGlmXG4gICAgICAvLyBuZWNlc3NhcnkuIEluIGFkZGl0aW9uIHRvIGJlaW5nIGF2YWlsYWJsZSB0byB0aGUgY29udHJvbGxlciBhbmQgb25FbnRlci9vbkV4aXQgY2FsbGJhY2tzLFxuICAgICAgLy8gd2UgYWxzbyBuZWVkICRzdGF0ZVBhcmFtcyB0byBiZSBhdmFpbGFibGUgZm9yIGFueSAkaW5qZWN0b3IgY2FsbHMgd2UgbWFrZSBkdXJpbmcgdGhlXG4gICAgICAvLyBkZXBlbmRlbmN5IHJlc29sdXRpb24gcHJvY2Vzcy5cbiAgICAgIHZhciAkc3RhdGVQYXJhbXMgPSAocGFyYW1zQXJlRmlsdGVyZWQpID8gcGFyYW1zIDogZmlsdGVyQnlLZXlzKHN0YXRlLnBhcmFtcy4kJGtleXMoKSwgcGFyYW1zKTtcbiAgICAgIHZhciBsb2NhbHMgPSB7ICRzdGF0ZVBhcmFtczogJHN0YXRlUGFyYW1zIH07XG5cbiAgICAgIC8vIFJlc29sdmUgJ2dsb2JhbCcgZGVwZW5kZW5jaWVzIGZvciB0aGUgc3RhdGUsIGkuZS4gdGhvc2Ugbm90IHNwZWNpZmljIHRvIGEgdmlldy5cbiAgICAgIC8vIFdlJ3JlIGFsc28gaW5jbHVkaW5nICRzdGF0ZVBhcmFtcyBpbiB0aGlzOyB0aGF0IHdheSB0aGUgcGFyYW1ldGVycyBhcmUgcmVzdHJpY3RlZFxuICAgICAgLy8gdG8gdGhlIHNldCB0aGF0IHNob3VsZCBiZSB2aXNpYmxlIHRvIHRoZSBzdGF0ZSwgYW5kIGFyZSBpbmRlcGVuZGVudCBvZiB3aGVuIHdlIHVwZGF0ZVxuICAgICAgLy8gdGhlIGdsb2JhbCAkc3RhdGUgYW5kICRzdGF0ZVBhcmFtcyB2YWx1ZXMuXG4gICAgICBkc3QucmVzb2x2ZSA9ICRyZXNvbHZlLnJlc29sdmUoc3RhdGUucmVzb2x2ZSwgbG9jYWxzLCBkc3QucmVzb2x2ZSwgc3RhdGUpO1xuICAgICAgdmFyIHByb21pc2VzID0gW2RzdC5yZXNvbHZlLnRoZW4oZnVuY3Rpb24gKGdsb2JhbHMpIHtcbiAgICAgICAgZHN0Lmdsb2JhbHMgPSBnbG9iYWxzO1xuICAgICAgfSldO1xuICAgICAgaWYgKGluaGVyaXRlZCkgcHJvbWlzZXMucHVzaChpbmhlcml0ZWQpO1xuXG4gICAgICBmdW5jdGlvbiByZXNvbHZlVmlld3MoKSB7XG4gICAgICAgIHZhciB2aWV3c1Byb21pc2VzID0gW107XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0ZW1wbGF0ZSBhbmQgZGVwZW5kZW5jaWVzIGZvciBhbGwgdmlld3MuXG4gICAgICAgIGZvckVhY2goc3RhdGUudmlld3MsIGZ1bmN0aW9uICh2aWV3LCBuYW1lKSB7XG4gICAgICAgICAgdmFyIGluamVjdGFibGVzID0gKHZpZXcucmVzb2x2ZSAmJiB2aWV3LnJlc29sdmUgIT09IHN0YXRlLnJlc29sdmUgPyB2aWV3LnJlc29sdmUgOiB7fSk7XG4gICAgICAgICAgaW5qZWN0YWJsZXMuJHRlbXBsYXRlID0gWyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJHZpZXcubG9hZChuYW1lLCB7IHZpZXc6IHZpZXcsIGxvY2FsczogZHN0Lmdsb2JhbHMsIHBhcmFtczogJHN0YXRlUGFyYW1zLCBub3RpZnk6IG9wdGlvbnMubm90aWZ5IH0pIHx8ICcnO1xuICAgICAgICAgIH1dO1xuXG4gICAgICAgICAgdmlld3NQcm9taXNlcy5wdXNoKCRyZXNvbHZlLnJlc29sdmUoaW5qZWN0YWJsZXMsIGRzdC5nbG9iYWxzLCBkc3QucmVzb2x2ZSwgc3RhdGUpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgLy8gUmVmZXJlbmNlcyB0byB0aGUgY29udHJvbGxlciAob25seSBpbnN0YW50aWF0ZWQgYXQgbGluayB0aW1lKVxuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24odmlldy5jb250cm9sbGVyUHJvdmlkZXIpIHx8IGlzQXJyYXkodmlldy5jb250cm9sbGVyUHJvdmlkZXIpKSB7XG4gICAgICAgICAgICAgIHZhciBpbmplY3RMb2NhbHMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgaW5qZWN0YWJsZXMsIGRzdC5nbG9iYWxzKTtcbiAgICAgICAgICAgICAgcmVzdWx0LiQkY29udHJvbGxlciA9ICRpbmplY3Rvci5pbnZva2Uodmlldy5jb250cm9sbGVyUHJvdmlkZXIsIG51bGwsIGluamVjdExvY2Fscyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXN1bHQuJCRjb250cm9sbGVyID0gdmlldy5jb250cm9sbGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUHJvdmlkZSBhY2Nlc3MgdG8gdGhlIHN0YXRlIGl0c2VsZiBmb3IgaW50ZXJuYWwgdXNlXG4gICAgICAgICAgICByZXN1bHQuJCRzdGF0ZSA9IHN0YXRlO1xuICAgICAgICAgICAgcmVzdWx0LiQkY29udHJvbGxlckFzID0gdmlldy5jb250cm9sbGVyQXM7XG4gICAgICAgICAgICByZXN1bHQuJCRyZXNvbHZlQXMgPSB2aWV3LnJlc29sdmVBcztcbiAgICAgICAgICAgIGRzdFtuYW1lXSA9IHJlc3VsdDtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiAkcS5hbGwodmlld3NQcm9taXNlcykudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgIHJldHVybiBkc3QuZ2xvYmFscztcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdhaXQgZm9yIGFsbCB0aGUgcHJvbWlzZXMgYW5kIHRoZW4gcmV0dXJuIHRoZSBhY3RpdmF0aW9uIG9iamVjdFxuICAgICAgcmV0dXJuICRxLmFsbChwcm9taXNlcykudGhlbihyZXNvbHZlVmlld3MpLnRoZW4oZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICByZXR1cm4gZHN0O1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRzdGF0ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3VsZFNraXBSZWxvYWQodG8sIHRvUGFyYW1zLCBmcm9tLCBmcm9tUGFyYW1zLCBsb2NhbHMsIG9wdGlvbnMpIHtcbiAgICAvLyBSZXR1cm4gdHJ1ZSBpZiB0aGVyZSBhcmUgbm8gZGlmZmVyZW5jZXMgaW4gbm9uLXNlYXJjaCAocGF0aC9vYmplY3QpIHBhcmFtcywgZmFsc2UgaWYgdGhlcmUgYXJlIGRpZmZlcmVuY2VzXG4gICAgZnVuY3Rpb24gbm9uU2VhcmNoUGFyYW1zRXF1YWwoZnJvbUFuZFRvU3RhdGUsIGZyb21QYXJhbXMsIHRvUGFyYW1zKSB7XG4gICAgICAvLyBJZGVudGlmeSB3aGV0aGVyIGFsbCB0aGUgcGFyYW1ldGVycyB0aGF0IGRpZmZlciBiZXR3ZWVuIGBmcm9tUGFyYW1zYCBhbmQgYHRvUGFyYW1zYCB3ZXJlIHNlYXJjaCBwYXJhbXMuXG4gICAgICBmdW5jdGlvbiBub3RTZWFyY2hQYXJhbShrZXkpIHtcbiAgICAgICAgcmV0dXJuIGZyb21BbmRUb1N0YXRlLnBhcmFtc1trZXldLmxvY2F0aW9uICE9IFwic2VhcmNoXCI7XG4gICAgICB9XG4gICAgICB2YXIgbm9uUXVlcnlQYXJhbUtleXMgPSBmcm9tQW5kVG9TdGF0ZS5wYXJhbXMuJCRrZXlzKCkuZmlsdGVyKG5vdFNlYXJjaFBhcmFtKTtcbiAgICAgIHZhciBub25RdWVyeVBhcmFtcyA9IHBpY2suYXBwbHkoe30sIFtmcm9tQW5kVG9TdGF0ZS5wYXJhbXNdLmNvbmNhdChub25RdWVyeVBhcmFtS2V5cykpO1xuICAgICAgdmFyIG5vblF1ZXJ5UGFyYW1TZXQgPSBuZXcgJCRVTUZQLlBhcmFtU2V0KG5vblF1ZXJ5UGFyYW1zKTtcbiAgICAgIHJldHVybiBub25RdWVyeVBhcmFtU2V0LiQkZXF1YWxzKGZyb21QYXJhbXMsIHRvUGFyYW1zKTtcbiAgICB9XG5cbiAgICAvLyBJZiByZWxvYWQgd2FzIG5vdCBleHBsaWNpdGx5IHJlcXVlc3RlZFxuICAgIC8vIGFuZCB3ZSdyZSB0cmFuc2l0aW9uaW5nIHRvIHRoZSBzYW1lIHN0YXRlIHdlJ3JlIGFscmVhZHkgaW5cbiAgICAvLyBhbmQgICAgdGhlIGxvY2FscyBkaWRuJ3QgY2hhbmdlXG4gICAgLy8gICAgIG9yIHRoZXkgY2hhbmdlZCBpbiBhIHdheSB0aGF0IGRvZXNuJ3QgbWVyaXQgcmVsb2FkaW5nXG4gICAgLy8gICAgICAgIChyZWxvYWRPblBhcmFtczpmYWxzZSwgb3IgcmVsb2FkT25TZWFyY2guZmFsc2UgYW5kIG9ubHkgc2VhcmNoIHBhcmFtcyBjaGFuZ2VkKVxuICAgIC8vIFRoZW4gcmV0dXJuIHRydWUuXG4gICAgaWYgKCFvcHRpb25zLnJlbG9hZCAmJiB0byA9PT0gZnJvbSAmJlxuICAgICAgKGxvY2FscyA9PT0gZnJvbS5sb2NhbHMgfHwgKHRvLnNlbGYucmVsb2FkT25TZWFyY2ggPT09IGZhbHNlICYmIG5vblNlYXJjaFBhcmFtc0VxdWFsKGZyb20sIGZyb21QYXJhbXMsIHRvUGFyYW1zKSkpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScpXG4gIC5mYWN0b3J5KCckc3RhdGVQYXJhbXMnLCBmdW5jdGlvbiAoKSB7IHJldHVybiB7fTsgfSlcbiAgLmNvbnN0YW50KFwiJHN0YXRlLnJ1bnRpbWVcIiwgeyBhdXRvaW5qZWN0OiB0cnVlIH0pXG4gIC5wcm92aWRlcignJHN0YXRlJywgJFN0YXRlUHJvdmlkZXIpXG4gIC8vIEluamVjdCAkc3RhdGUgdG8gaW5pdGlhbGl6ZSB3aGVuIGVudGVyaW5nIHJ1bnRpbWUuICMyNTc0XG4gIC5ydW4oWyckaW5qZWN0b3InLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgLy8gQWxsb3cgdGVzdHMgKHN0YXRlU3BlYy5qcykgdG8gdHVybiB0aGlzIG9mZiBieSBkZWZpbmluZyB0aGlzIGNvbnN0YW50XG4gICAgaWYgKCRpbmplY3Rvci5nZXQoXCIkc3RhdGUucnVudGltZVwiKS5hdXRvaW5qZWN0KSB7XG4gICAgICAkaW5qZWN0b3IuZ2V0KCckc3RhdGUnKTtcbiAgICB9XG4gIH1dKTtcblxuXG4kVmlld1Byb3ZpZGVyLiRpbmplY3QgPSBbXTtcbmZ1bmN0aW9uICRWaWV3UHJvdmlkZXIoKSB7XG5cbiAgdGhpcy4kZ2V0ID0gJGdldDtcbiAgLyoqXG4gICAqIEBuZ2RvYyBvYmplY3RcbiAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiR2aWV3XG4gICAqXG4gICAqIEByZXF1aXJlcyB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XG4gICAqIEByZXF1aXJlcyAkcm9vdFNjb3BlXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKlxuICAgKi9cbiAgJGdldC4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyR0ZW1wbGF0ZUZhY3RvcnknXTtcbiAgZnVuY3Rpb24gJGdldCggICAkcm9vdFNjb3BlLCAgICR0ZW1wbGF0ZUZhY3RvcnkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLy8gJHZpZXcubG9hZCgnZnVsbC52aWV3TmFtZScsIHsgdGVtcGxhdGU6IC4uLiwgY29udHJvbGxlcjogLi4uLCByZXNvbHZlOiAuLi4sIGFzeW5jOiBmYWxzZSwgcGFyYW1zOiAuLi4gfSlcbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHZpZXcjbG9hZFxuICAgICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kdmlld1xuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWVcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIG9wdGlvbiBvYmplY3QuXG4gICAgICAgKi9cbiAgICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQobmFtZSwgb3B0aW9ucykge1xuICAgICAgICB2YXIgcmVzdWx0LCBkZWZhdWx0cyA9IHtcbiAgICAgICAgICB0ZW1wbGF0ZTogbnVsbCwgY29udHJvbGxlcjogbnVsbCwgdmlldzogbnVsbCwgbG9jYWxzOiBudWxsLCBub3RpZnk6IHRydWUsIGFzeW5jOiB0cnVlLCBwYXJhbXM6IHt9XG4gICAgICAgIH07XG4gICAgICAgIG9wdGlvbnMgPSBleHRlbmQoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmIChvcHRpb25zLnZpZXcpIHtcbiAgICAgICAgICByZXN1bHQgPSAkdGVtcGxhdGVGYWN0b3J5LmZyb21Db25maWcob3B0aW9ucy52aWV3LCBvcHRpb25zLnBhcmFtcywgb3B0aW9ucy5sb2NhbHMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJykucHJvdmlkZXIoJyR2aWV3JywgJFZpZXdQcm92aWRlcik7XG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGxQcm92aWRlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUHJvdmlkZXIgdGhhdCByZXR1cm5zIHRoZSB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGx9IHNlcnZpY2UgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uICRWaWV3U2Nyb2xsUHJvdmlkZXIoKSB7XG5cbiAgdmFyIHVzZUFuY2hvclNjcm9sbCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGxQcm92aWRlciN1c2VBbmNob3JTY3JvbGxcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJldmVydHMgYmFjayB0byB1c2luZyB0aGUgY29yZSBbYCRhbmNob3JTY3JvbGxgXShodHRwOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy4kYW5jaG9yU2Nyb2xsKSBzZXJ2aWNlIGZvclxuICAgKiBzY3JvbGxpbmcgYmFzZWQgb24gdGhlIHVybCBhbmNob3IuXG4gICAqL1xuICB0aGlzLnVzZUFuY2hvclNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB1c2VBbmNob3JTY3JvbGwgPSB0cnVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2Mgb2JqZWN0XG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsXG4gICAqXG4gICAqIEByZXF1aXJlcyAkYW5jaG9yU2Nyb2xsXG4gICAqIEByZXF1aXJlcyAkdGltZW91dFxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogV2hlbiBjYWxsZWQgd2l0aCBhIGpxTGl0ZSBlbGVtZW50LCBpdCBzY3JvbGxzIHRoZSBlbGVtZW50IGludG8gdmlldyAoYWZ0ZXIgYVxuICAgKiBgJHRpbWVvdXRgIHNvIHRoZSBET00gaGFzIHRpbWUgdG8gcmVmcmVzaCkuXG4gICAqXG4gICAqIElmIHlvdSBwcmVmZXIgdG8gcmVseSBvbiBgJGFuY2hvclNjcm9sbGAgdG8gc2Nyb2xsIHRoZSB2aWV3IHRvIHRoZSBhbmNob3IsXG4gICAqIHRoaXMgY2FuIGJlIGVuYWJsZWQgYnkgY2FsbGluZyB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGxQcm92aWRlciNtZXRob2RzX3VzZUFuY2hvclNjcm9sbCBgJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpYH0uXG4gICAqL1xuICB0aGlzLiRnZXQgPSBbJyRhbmNob3JTY3JvbGwnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJGFuY2hvclNjcm9sbCwgJHRpbWVvdXQpIHtcbiAgICBpZiAodXNlQW5jaG9yU2Nyb2xsKSB7XG4gICAgICByZXR1cm4gJGFuY2hvclNjcm9sbDtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKCRlbGVtZW50KSB7XG4gICAgICByZXR1cm4gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAkZWxlbWVudFswXS5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgfSwgMCwgZmFsc2UpO1xuICAgIH07XG4gIH1dO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJykucHJvdmlkZXIoJyR1aVZpZXdTY3JvbGwnLCAkVmlld1Njcm9sbFByb3ZpZGVyKTtcblxuLyoqXG4gKiBAbmdkb2MgZGlyZWN0aXZlXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXZpZXdcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICogQHJlcXVpcmVzICRjb21waWxlXG4gKiBAcmVxdWlyZXMgJGNvbnRyb2xsZXJcbiAqIEByZXF1aXJlcyAkaW5qZWN0b3JcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFxuICogQHJlcXVpcmVzICRkb2N1bWVudFxuICpcbiAqIEByZXN0cmljdCBFQ0FcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSB1aS12aWV3IGRpcmVjdGl2ZSB0ZWxscyAkc3RhdGUgd2hlcmUgdG8gcGxhY2UgeW91ciB0ZW1wbGF0ZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmc9fSBuYW1lIEEgdmlldyBuYW1lLiBUaGUgbmFtZSBzaG91bGQgYmUgdW5pcXVlIGFtb25nc3QgdGhlIG90aGVyIHZpZXdzIGluIHRoZVxuICogc2FtZSBzdGF0ZS4gWW91IGNhbiBoYXZlIHZpZXdzIG9mIHRoZSBzYW1lIG5hbWUgdGhhdCBsaXZlIGluIGRpZmZlcmVudCBzdGF0ZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmc9fSBhdXRvc2Nyb2xsIEl0IGFsbG93cyB5b3UgdG8gc2V0IHRoZSBzY3JvbGwgYmVoYXZpb3Igb2YgdGhlIGJyb3dzZXIgd2luZG93XG4gKiB3aGVuIGEgdmlldyBpcyBwb3B1bGF0ZWQuIEJ5IGRlZmF1bHQsICRhbmNob3JTY3JvbGwgaXMgb3ZlcnJpZGRlbiBieSB1aS1yb3V0ZXIncyBjdXN0b20gc2Nyb2xsXG4gKiBzZXJ2aWNlLCB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGx9LiBUaGlzIGN1c3RvbSBzZXJ2aWNlIGxldCdzIHlvdVxuICogc2Nyb2xsIHVpLXZpZXcgZWxlbWVudHMgaW50byB2aWV3IHdoZW4gdGhleSBhcmUgcG9wdWxhdGVkIGR1cmluZyBhIHN0YXRlIGFjdGl2YXRpb24uXG4gKlxuICogKk5vdGU6IFRvIHJldmVydCBiYWNrIHRvIG9sZCBbYCRhbmNob3JTY3JvbGxgXShodHRwOi8vZG9jcy5hbmd1bGFyanMub3JnL2FwaS9uZy4kYW5jaG9yU2Nyb2xsKVxuICogZnVuY3Rpb25hbGl0eSwgY2FsbCBgJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpYC4qXG4gKlxuICogQHBhcmFtIHtzdHJpbmc9fSBvbmxvYWQgRXhwcmVzc2lvbiB0byBldmFsdWF0ZSB3aGVuZXZlciB0aGUgdmlldyB1cGRhdGVzLlxuICpcbiAqIEBleGFtcGxlXG4gKiBBIHZpZXcgY2FuIGJlIHVubmFtZWQgb3IgbmFtZWQuXG4gKiA8cHJlPlxuICogPCEtLSBVbm5hbWVkIC0tPlxuICogPGRpdiB1aS12aWV3PjwvZGl2PlxuICpcbiAqIDwhLS0gTmFtZWQgLS0+XG4gKiA8ZGl2IHVpLXZpZXc9XCJ2aWV3TmFtZVwiPjwvZGl2PlxuICogPC9wcmU+XG4gKlxuICogWW91IGNhbiBvbmx5IGhhdmUgb25lIHVubmFtZWQgdmlldyB3aXRoaW4gYW55IHRlbXBsYXRlIChvciByb290IGh0bWwpLiBJZiB5b3UgYXJlIG9ubHkgdXNpbmcgYVxuICogc2luZ2xlIHZpZXcgYW5kIGl0IGlzIHVubmFtZWQgdGhlbiB5b3UgY2FuIHBvcHVsYXRlIGl0IGxpa2Ugc286XG4gKiA8cHJlPlxuICogPGRpdiB1aS12aWV3PjwvZGl2PlxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcbiAqICAgdGVtcGxhdGU6IFwiPGgxPkhFTExPITwvaDE+XCJcbiAqIH0pXG4gKiA8L3ByZT5cbiAqXG4gKiBUaGUgYWJvdmUgaXMgYSBjb252ZW5pZW50IHNob3J0Y3V0IGVxdWl2YWxlbnQgdG8gc3BlY2lmeWluZyB5b3VyIHZpZXcgZXhwbGljaXRseSB3aXRoIHRoZSB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyI21ldGhvZHNfc3RhdGUgYHZpZXdzYH1cbiAqIGNvbmZpZyBwcm9wZXJ0eSwgYnkgbmFtZSwgaW4gdGhpcyBjYXNlIGFuIGVtcHR5IG5hbWU6XG4gKiA8cHJlPlxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcbiAqICAgdmlld3M6IHtcbiAqICAgICBcIlwiOiB7XG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxuICogICAgIH1cbiAqICAgfSAgICBcbiAqIH0pXG4gKiA8L3ByZT5cbiAqXG4gKiBCdXQgdHlwaWNhbGx5IHlvdSdsbCBvbmx5IHVzZSB0aGUgdmlld3MgcHJvcGVydHkgaWYgeW91IG5hbWUgeW91ciB2aWV3IG9yIGhhdmUgbW9yZSB0aGFuIG9uZSB2aWV3XG4gKiBpbiB0aGUgc2FtZSB0ZW1wbGF0ZS4gVGhlcmUncyBub3QgcmVhbGx5IGEgY29tcGVsbGluZyByZWFzb24gdG8gbmFtZSBhIHZpZXcgaWYgaXRzIHRoZSBvbmx5IG9uZSxcbiAqIGJ1dCB5b3UgY291bGQgaWYgeW91IHdhbnRlZCwgbGlrZSBzbzpcbiAqIDxwcmU+XG4gKiA8ZGl2IHVpLXZpZXc9XCJtYWluXCI+PC9kaXY+XG4gKiA8L3ByZT5cbiAqIDxwcmU+XG4gKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge1xuICogICB2aWV3czoge1xuICogICAgIFwibWFpblwiOiB7XG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxuICogICAgIH1cbiAqICAgfSAgICBcbiAqIH0pXG4gKiA8L3ByZT5cbiAqXG4gKiBSZWFsbHkgdGhvdWdoLCB5b3UnbGwgdXNlIHZpZXdzIHRvIHNldCB1cCBtdWx0aXBsZSB2aWV3czpcbiAqIDxwcmU+XG4gKiA8ZGl2IHVpLXZpZXc+PC9kaXY+XG4gKiA8ZGl2IHVpLXZpZXc9XCJjaGFydFwiPjwvZGl2PlxuICogPGRpdiB1aS12aWV3PVwiZGF0YVwiPjwvZGl2PlxuICogPC9wcmU+XG4gKlxuICogPHByZT5cbiAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZVwiLCB7XG4gKiAgIHZpZXdzOiB7XG4gKiAgICAgXCJcIjoge1xuICogICAgICAgdGVtcGxhdGU6IFwiPGgxPkhFTExPITwvaDE+XCJcbiAqICAgICB9LFxuICogICAgIFwiY2hhcnRcIjoge1xuICogICAgICAgdGVtcGxhdGU6IFwiPGNoYXJ0X3RoaW5nLz5cIlxuICogICAgIH0sXG4gKiAgICAgXCJkYXRhXCI6IHtcbiAqICAgICAgIHRlbXBsYXRlOiBcIjxkYXRhX3RoaW5nLz5cIlxuICogICAgIH1cbiAqICAgfSAgICBcbiAqIH0pXG4gKiA8L3ByZT5cbiAqXG4gKiBFeGFtcGxlcyBmb3IgYGF1dG9zY3JvbGxgOlxuICpcbiAqIDxwcmU+XG4gKiA8IS0tIElmIGF1dG9zY3JvbGwgcHJlc2VudCB3aXRoIG5vIGV4cHJlc3Npb24sXG4gKiAgICAgIHRoZW4gc2Nyb2xsIHVpLXZpZXcgaW50byB2aWV3IC0tPlxuICogPHVpLXZpZXcgYXV0b3Njcm9sbC8+XG4gKlxuICogPCEtLSBJZiBhdXRvc2Nyb2xsIHByZXNlbnQgd2l0aCB2YWxpZCBleHByZXNzaW9uLFxuICogICAgICB0aGVuIHNjcm9sbCB1aS12aWV3IGludG8gdmlldyBpZiBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0cnVlIC0tPlxuICogPHVpLXZpZXcgYXV0b3Njcm9sbD0ndHJ1ZScvPlxuICogPHVpLXZpZXcgYXV0b3Njcm9sbD0nZmFsc2UnLz5cbiAqIDx1aS12aWV3IGF1dG9zY3JvbGw9J3Njb3BlVmFyaWFibGUnLz5cbiAqIDwvcHJlPlxuICpcbiAqIFJlc29sdmUgZGF0YTpcbiAqXG4gKiBUaGUgcmVzb2x2ZWQgZGF0YSBmcm9tIHRoZSBzdGF0ZSdzIGByZXNvbHZlYCBibG9jayBpcyBwbGFjZWQgb24gdGhlIHNjb3BlIGFzIGAkcmVzb2x2ZWAgKHRoaXNcbiAqIGNhbiBiZSBjdXN0b21pemVkIHVzaW5nIFtbVmlld0RlY2xhcmF0aW9uLnJlc29sdmVBc11dKS4gIFRoaXMgY2FuIGJlIHRoZW4gYWNjZXNzZWQgZnJvbSB0aGUgdGVtcGxhdGUuXG4gKlxuICogTm90ZSB0aGF0IHdoZW4gYGNvbnRyb2xsZXJBc2AgaXMgYmVpbmcgdXNlZCwgYCRyZXNvbHZlYCBpcyBzZXQgb24gdGhlIGNvbnRyb2xsZXIgaW5zdGFuY2UgKmFmdGVyKiB0aGVcbiAqIGNvbnRyb2xsZXIgaXMgaW5zdGFudGlhdGVkLiAgVGhlIGAkb25Jbml0KClgIGhvb2sgY2FuIGJlIHVzZWQgdG8gcGVyZm9ybSBpbml0aWFsaXphdGlvbiBjb2RlIHdoaWNoXG4gKiBkZXBlbmRzIG9uIGAkcmVzb2x2ZWAgZGF0YS5cbiAqXG4gKiBFeGFtcGxlIHVzYWdlIG9mICRyZXNvbHZlIGluIGEgdmlldyB0ZW1wbGF0ZVxuICogPHByZT5cbiAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICogICB0ZW1wbGF0ZTogJzxteS1jb21wb25lbnQgdXNlcj1cIiRyZXNvbHZlLnVzZXJcIj48L215LWNvbXBvbmVudD4nLFxuICogICByZXNvbHZlOiB7XG4gKiAgICAgdXNlcjogZnVuY3Rpb24oVXNlclNlcnZpY2UpIHsgcmV0dXJuIFVzZXJTZXJ2aWNlLmZldGNoVXNlcigpOyB9XG4gKiAgIH1cbiAqIH0pO1xuICogPC9wcmU+XG4gKi9cbiRWaWV3RGlyZWN0aXZlLiRpbmplY3QgPSBbJyRzdGF0ZScsICckaW5qZWN0b3InLCAnJHVpVmlld1Njcm9sbCcsICckaW50ZXJwb2xhdGUnLCAnJHEnXTtcbmZ1bmN0aW9uICRWaWV3RGlyZWN0aXZlKCAgICRzdGF0ZSwgICAkaW5qZWN0b3IsICAgJHVpVmlld1Njcm9sbCwgICAkaW50ZXJwb2xhdGUsICAgJHEpIHtcblxuICBmdW5jdGlvbiBnZXRTZXJ2aWNlKCkge1xuICAgIHJldHVybiAoJGluamVjdG9yLmhhcykgPyBmdW5jdGlvbihzZXJ2aWNlKSB7XG4gICAgICByZXR1cm4gJGluamVjdG9yLmhhcyhzZXJ2aWNlKSA/ICRpbmplY3Rvci5nZXQoc2VydmljZSkgOiBudWxsO1xuICAgIH0gOiBmdW5jdGlvbihzZXJ2aWNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldChzZXJ2aWNlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIHZhciBzZXJ2aWNlID0gZ2V0U2VydmljZSgpLFxuICAgICAgJGFuaW1hdG9yID0gc2VydmljZSgnJGFuaW1hdG9yJyksXG4gICAgICAkYW5pbWF0ZSA9IHNlcnZpY2UoJyRhbmltYXRlJyk7XG5cbiAgLy8gUmV0dXJucyBhIHNldCBvZiBET00gbWFuaXB1bGF0aW9uIGZ1bmN0aW9ucyBiYXNlZCBvbiB3aGljaCBBbmd1bGFyIHZlcnNpb25cbiAgLy8gaXQgc2hvdWxkIHVzZVxuICBmdW5jdGlvbiBnZXRSZW5kZXJlcihhdHRycywgc2NvcGUpIHtcbiAgICB2YXIgc3RhdGljcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZW50ZXI6IGZ1bmN0aW9uIChlbGVtZW50LCB0YXJnZXQsIGNiKSB7IHRhcmdldC5hZnRlcihlbGVtZW50KTsgY2IoKTsgfSxcbiAgICAgICAgbGVhdmU6IGZ1bmN0aW9uIChlbGVtZW50LCBjYikgeyBlbGVtZW50LnJlbW92ZSgpOyBjYigpOyB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBpZiAoJGFuaW1hdGUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVudGVyOiBmdW5jdGlvbihlbGVtZW50LCB0YXJnZXQsIGNiKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIudmVyc2lvbi5taW5vciA+IDIpIHtcbiAgICAgICAgICAgICRhbmltYXRlLmVudGVyKGVsZW1lbnQsIG51bGwsIHRhcmdldCkudGhlbihjYik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRhbmltYXRlLmVudGVyKGVsZW1lbnQsIG51bGwsIHRhcmdldCwgY2IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGVhdmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGNiKSB7XG4gICAgICAgICAgaWYgKGFuZ3VsYXIudmVyc2lvbi5taW5vciA+IDIpIHtcbiAgICAgICAgICAgICRhbmltYXRlLmxlYXZlKGVsZW1lbnQpLnRoZW4oY2IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkYW5pbWF0ZS5sZWF2ZShlbGVtZW50LCBjYik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICgkYW5pbWF0b3IpIHtcbiAgICAgIHZhciBhbmltYXRlID0gJGFuaW1hdG9yICYmICRhbmltYXRvcihzY29wZSwgYXR0cnMpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbnRlcjogZnVuY3Rpb24oZWxlbWVudCwgdGFyZ2V0LCBjYikge2FuaW1hdGUuZW50ZXIoZWxlbWVudCwgbnVsbCwgdGFyZ2V0KTsgY2IoKTsgfSxcbiAgICAgICAgbGVhdmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGNiKSB7IGFuaW1hdGUubGVhdmUoZWxlbWVudCk7IGNiKCk7IH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0YXRpY3MoKTtcbiAgfVxuXG4gIHZhciBkaXJlY3RpdmUgPSB7XG4gICAgcmVzdHJpY3Q6ICdFQ0EnLFxuICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgIHByaW9yaXR5OiA0MDAsXG4gICAgdHJhbnNjbHVkZTogJ2VsZW1lbnQnLFxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCwgdEF0dHJzLCAkdHJhbnNjbHVkZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgJGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIHZhciBwcmV2aW91c0VsLCBjdXJyZW50RWwsIGN1cnJlbnRTY29wZSwgbGF0ZXN0TG9jYWxzLFxuICAgICAgICAgICAgb25sb2FkRXhwICAgICA9IGF0dHJzLm9ubG9hZCB8fCAnJyxcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFeHAgPSBhdHRycy5hdXRvc2Nyb2xsLFxuICAgICAgICAgICAgcmVuZGVyZXIgICAgICA9IGdldFJlbmRlcmVyKGF0dHJzLCBzY29wZSksXG4gICAgICAgICAgICBpbmhlcml0ZWQgICAgID0gJGVsZW1lbnQuaW5oZXJpdGVkRGF0YSgnJHVpVmlldycpO1xuXG4gICAgICAgIHNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHVwZGF0ZVZpZXcoZmFsc2UpO1xuICAgICAgICB9KTtcblxuICAgICAgICB1cGRhdGVWaWV3KHRydWUpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFudXBMYXN0VmlldygpIHtcbiAgICAgICAgICBpZiAocHJldmlvdXNFbCkge1xuICAgICAgICAgICAgcHJldmlvdXNFbC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHByZXZpb3VzRWwgPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjdXJyZW50U2NvcGUpIHtcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZS4kZGVzdHJveSgpO1xuICAgICAgICAgICAgY3VycmVudFNjb3BlID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY3VycmVudEVsKSB7XG4gICAgICAgICAgICB2YXIgJHVpVmlld0RhdGEgPSBjdXJyZW50RWwuZGF0YSgnJHVpVmlld0FuaW0nKTtcbiAgICAgICAgICAgIHJlbmRlcmVyLmxlYXZlKGN1cnJlbnRFbCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICR1aVZpZXdEYXRhLiQkYW5pbUxlYXZlLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgcHJldmlvdXNFbCA9IG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcHJldmlvdXNFbCA9IGN1cnJlbnRFbDtcbiAgICAgICAgICAgIGN1cnJlbnRFbCA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlVmlldyhmaXJzdFRpbWUpIHtcbiAgICAgICAgICB2YXIgbmV3U2NvcGUsXG4gICAgICAgICAgICAgIG5hbWUgICAgICAgICAgICA9IGdldFVpVmlld05hbWUoc2NvcGUsIGF0dHJzLCAkZWxlbWVudCwgJGludGVycG9sYXRlKSxcbiAgICAgICAgICAgICAgcHJldmlvdXNMb2NhbHMgID0gbmFtZSAmJiAkc3RhdGUuJGN1cnJlbnQgJiYgJHN0YXRlLiRjdXJyZW50LmxvY2Fsc1tuYW1lXTtcblxuICAgICAgICAgIGlmICghZmlyc3RUaW1lICYmIHByZXZpb3VzTG9jYWxzID09PSBsYXRlc3RMb2NhbHMpIHJldHVybjsgLy8gbm90aGluZyB0byBkb1xuICAgICAgICAgIG5ld1Njb3BlID0gc2NvcGUuJG5ldygpO1xuICAgICAgICAgIGxhdGVzdExvY2FscyA9ICRzdGF0ZS4kY3VycmVudC5sb2NhbHNbbmFtZV07XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBAbmdkb2MgZXZlbnRcbiAgICAgICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXZpZXcjJHZpZXdDb250ZW50TG9hZGluZ1xuICAgICAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktdmlld1xuICAgICAgICAgICAqIEBldmVudFR5cGUgZW1pdHMgb24gdWktdmlldyBkaXJlY3RpdmUgc2NvcGVcbiAgICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIEZpcmVkIG9uY2UgdGhlIHZpZXcgKipiZWdpbnMgbG9hZGluZyoqLCAqYmVmb3JlKiB0aGUgRE9NIGlzIHJlbmRlcmVkLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IG9iamVjdC5cbiAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmlld05hbWUgTmFtZSBvZiB0aGUgdmlldy5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBuZXdTY29wZS4kZW1pdCgnJHZpZXdDb250ZW50TG9hZGluZycsIG5hbWUpO1xuXG4gICAgICAgICAgdmFyIGNsb25lID0gJHRyYW5zY2x1ZGUobmV3U2NvcGUsIGZ1bmN0aW9uKGNsb25lKSB7XG4gICAgICAgICAgICB2YXIgYW5pbUVudGVyID0gJHEuZGVmZXIoKSwgYW5pbUxlYXZlID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgIHZhciB2aWV3QW5pbURhdGEgPSB7XG4gICAgICAgICAgICAgICRhbmltRW50ZXI6IGFuaW1FbnRlci5wcm9taXNlLFxuICAgICAgICAgICAgICAkYW5pbUxlYXZlOiBhbmltTGVhdmUucHJvbWlzZSxcbiAgICAgICAgICAgICAgJCRhbmltTGVhdmU6IGFuaW1MZWF2ZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2xvbmUuZGF0YSgnJHVpVmlld0FuaW0nLCB2aWV3QW5pbURhdGEpO1xuICAgICAgICAgICAgcmVuZGVyZXIuZW50ZXIoY2xvbmUsICRlbGVtZW50LCBmdW5jdGlvbiBvblVpVmlld0VudGVyKCkge1xuICAgICAgICAgICAgICBhbmltRW50ZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICBpZihjdXJyZW50U2NvcGUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50U2NvcGUuJGVtaXQoJyR2aWV3Q29udGVudEFuaW1hdGlvbkVuZGVkJyk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXV0b1Njcm9sbEV4cCkgJiYgIWF1dG9TY3JvbGxFeHAgfHwgc2NvcGUuJGV2YWwoYXV0b1Njcm9sbEV4cCkpIHtcbiAgICAgICAgICAgICAgICAkdWlWaWV3U2Nyb2xsKGNsb25lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjbGVhbnVwTGFzdFZpZXcoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGN1cnJlbnRFbCA9IGNsb25lO1xuICAgICAgICAgIGN1cnJlbnRTY29wZSA9IG5ld1Njb3BlO1xuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktdmlldyMkdmlld0NvbnRlbnRMb2FkZWRcbiAgICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXZpZXdcbiAgICAgICAgICAgKiBAZXZlbnRUeXBlIGVtaXRzIG9uIHVpLXZpZXcgZGlyZWN0aXZlIHNjb3BlXG4gICAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAgICogRmlyZWQgb25jZSB0aGUgdmlldyBpcyAqKmxvYWRlZCoqLCAqYWZ0ZXIqIHRoZSBET00gaXMgcmVuZGVyZWQuXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgb2JqZWN0LlxuICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2aWV3TmFtZSBOYW1lIG9mIHRoZSB2aWV3LlxuICAgICAgICAgICAqL1xuICAgICAgICAgIGN1cnJlbnRTY29wZS4kZW1pdCgnJHZpZXdDb250ZW50TG9hZGVkJywgbmFtZSk7XG4gICAgICAgICAgY3VycmVudFNjb3BlLiRldmFsKG9ubG9hZEV4cCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBkaXJlY3RpdmU7XG59XG5cbiRWaWV3RGlyZWN0aXZlRmlsbC4kaW5qZWN0ID0gWyckY29tcGlsZScsICckY29udHJvbGxlcicsICckc3RhdGUnLCAnJGludGVycG9sYXRlJ107XG5mdW5jdGlvbiAkVmlld0RpcmVjdGl2ZUZpbGwgKCAgJGNvbXBpbGUsICAgJGNvbnRyb2xsZXIsICAgJHN0YXRlLCAgICRpbnRlcnBvbGF0ZSkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRUNBJyxcbiAgICBwcmlvcml0eTogLTQwMCxcbiAgICBjb21waWxlOiBmdW5jdGlvbiAodEVsZW1lbnQpIHtcbiAgICAgIHZhciBpbml0aWFsID0gdEVsZW1lbnQuaHRtbCgpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgJGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gJHN0YXRlLiRjdXJyZW50LFxuICAgICAgICAgICAgbmFtZSA9IGdldFVpVmlld05hbWUoc2NvcGUsIGF0dHJzLCAkZWxlbWVudCwgJGludGVycG9sYXRlKSxcbiAgICAgICAgICAgIGxvY2FscyAgPSBjdXJyZW50ICYmIGN1cnJlbnQubG9jYWxzW25hbWVdO1xuXG4gICAgICAgIGlmICghIGxvY2Fscykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRlbGVtZW50LmRhdGEoJyR1aVZpZXcnLCB7IG5hbWU6IG5hbWUsIHN0YXRlOiBsb2NhbHMuJCRzdGF0ZSB9KTtcbiAgICAgICAgJGVsZW1lbnQuaHRtbChsb2NhbHMuJHRlbXBsYXRlID8gbG9jYWxzLiR0ZW1wbGF0ZSA6IGluaXRpYWwpO1xuXG4gICAgICAgIHZhciByZXNvbHZlRGF0YSA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBsb2NhbHMpO1xuICAgICAgICBzY29wZVtsb2NhbHMuJCRyZXNvbHZlQXNdID0gcmVzb2x2ZURhdGE7XG5cbiAgICAgICAgdmFyIGxpbmsgPSAkY29tcGlsZSgkZWxlbWVudC5jb250ZW50cygpKTtcblxuICAgICAgICBpZiAobG9jYWxzLiQkY29udHJvbGxlcikge1xuICAgICAgICAgIGxvY2Fscy4kc2NvcGUgPSBzY29wZTtcbiAgICAgICAgICBsb2NhbHMuJGVsZW1lbnQgPSAkZWxlbWVudDtcbiAgICAgICAgICB2YXIgY29udHJvbGxlciA9ICRjb250cm9sbGVyKGxvY2Fscy4kJGNvbnRyb2xsZXIsIGxvY2Fscyk7XG4gICAgICAgICAgaWYgKGxvY2Fscy4kJGNvbnRyb2xsZXJBcykge1xuICAgICAgICAgICAgc2NvcGVbbG9jYWxzLiQkY29udHJvbGxlckFzXSA9IGNvbnRyb2xsZXI7XG4gICAgICAgICAgICBzY29wZVtsb2NhbHMuJCRjb250cm9sbGVyQXNdW2xvY2Fscy4kJHJlc29sdmVBc10gPSByZXNvbHZlRGF0YTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzRnVuY3Rpb24oY29udHJvbGxlci4kb25Jbml0KSkgY29udHJvbGxlci4kb25Jbml0KCk7XG4gICAgICAgICAgJGVsZW1lbnQuZGF0YSgnJG5nQ29udHJvbGxlckNvbnRyb2xsZXInLCBjb250cm9sbGVyKTtcbiAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbigpLmRhdGEoJyRuZ0NvbnRyb2xsZXJDb250cm9sbGVyJywgY29udHJvbGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBsaW5rKHNjb3BlKTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIFNoYXJlZCB1aS12aWV3IGNvZGUgZm9yIGJvdGggZGlyZWN0aXZlczpcbiAqIEdpdmVuIHNjb3BlLCBlbGVtZW50LCBhbmQgaXRzIGF0dHJpYnV0ZXMsIHJldHVybiB0aGUgdmlldydzIG5hbWVcbiAqL1xuZnVuY3Rpb24gZ2V0VWlWaWV3TmFtZShzY29wZSwgYXR0cnMsIGVsZW1lbnQsICRpbnRlcnBvbGF0ZSkge1xuICB2YXIgbmFtZSA9ICRpbnRlcnBvbGF0ZShhdHRycy51aVZpZXcgfHwgYXR0cnMubmFtZSB8fCAnJykoc2NvcGUpO1xuICB2YXIgdWlWaWV3Q3JlYXRlZEJ5ID0gZWxlbWVudC5pbmhlcml0ZWREYXRhKCckdWlWaWV3Jyk7XG4gIHJldHVybiBuYW1lLmluZGV4T2YoJ0AnKSA+PSAwID8gIG5hbWUgOiAgKG5hbWUgKyAnQCcgKyAodWlWaWV3Q3JlYXRlZEJ5ID8gdWlWaWV3Q3JlYXRlZEJ5LnN0YXRlLm5hbWUgOiAnJykpO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJykuZGlyZWN0aXZlKCd1aVZpZXcnLCAkVmlld0RpcmVjdGl2ZSk7XG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJykuZGlyZWN0aXZlKCd1aVZpZXcnLCAkVmlld0RpcmVjdGl2ZUZpbGwpO1xuXG5mdW5jdGlvbiBwYXJzZVN0YXRlUmVmKHJlZiwgY3VycmVudCkge1xuICB2YXIgcHJlcGFyc2VkID0gcmVmLm1hdGNoKC9eXFxzKih7W159XSp9KVxccyokLyksIHBhcnNlZDtcbiAgaWYgKHByZXBhcnNlZCkgcmVmID0gY3VycmVudCArICcoJyArIHByZXBhcnNlZFsxXSArICcpJztcbiAgcGFyc2VkID0gcmVmLnJlcGxhY2UoL1xcbi9nLCBcIiBcIikubWF0Y2goL14oW14oXSs/KVxccyooXFwoKC4qKVxcKSk/JC8pO1xuICBpZiAoIXBhcnNlZCB8fCBwYXJzZWQubGVuZ3RoICE9PSA0KSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHN0YXRlIHJlZiAnXCIgKyByZWYgKyBcIidcIik7XG4gIHJldHVybiB7IHN0YXRlOiBwYXJzZWRbMV0sIHBhcmFtRXhwcjogcGFyc2VkWzNdIHx8IG51bGwgfTtcbn1cblxuZnVuY3Rpb24gc3RhdGVDb250ZXh0KGVsKSB7XG4gIHZhciBzdGF0ZURhdGEgPSBlbC5wYXJlbnQoKS5pbmhlcml0ZWREYXRhKCckdWlWaWV3Jyk7XG5cbiAgaWYgKHN0YXRlRGF0YSAmJiBzdGF0ZURhdGEuc3RhdGUgJiYgc3RhdGVEYXRhLnN0YXRlLm5hbWUpIHtcbiAgICByZXR1cm4gc3RhdGVEYXRhLnN0YXRlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFR5cGVJbmZvKGVsKSB7XG4gIC8vIFNWR0FFbGVtZW50IGRvZXMgbm90IHVzZSB0aGUgaHJlZiBhdHRyaWJ1dGUsIGJ1dCByYXRoZXIgdGhlICd4bGlua0hyZWYnIGF0dHJpYnV0ZS5cbiAgdmFyIGlzU3ZnID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVsLnByb3AoJ2hyZWYnKSkgPT09ICdbb2JqZWN0IFNWR0FuaW1hdGVkU3RyaW5nXSc7XG4gIHZhciBpc0Zvcm0gPSBlbFswXS5ub2RlTmFtZSA9PT0gXCJGT1JNXCI7XG5cbiAgcmV0dXJuIHtcbiAgICBhdHRyOiBpc0Zvcm0gPyBcImFjdGlvblwiIDogKGlzU3ZnID8gJ3hsaW5rOmhyZWYnIDogJ2hyZWYnKSxcbiAgICBpc0FuY2hvcjogZWwucHJvcChcInRhZ05hbWVcIikudG9VcHBlckNhc2UoKSA9PT0gXCJBXCIsXG4gICAgY2xpY2thYmxlOiAhaXNGb3JtXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsaWNrSG9vayhlbCwgJHN0YXRlLCAkdGltZW91dCwgdHlwZSwgY3VycmVudCkge1xuICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgIHZhciBidXR0b24gPSBlLndoaWNoIHx8IGUuYnV0dG9uLCB0YXJnZXQgPSBjdXJyZW50KCk7XG5cbiAgICBpZiAoIShidXR0b24gPiAxIHx8IGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS5zaGlmdEtleSB8fCBlbC5hdHRyKCd0YXJnZXQnKSkpIHtcbiAgICAgIC8vIEhBQ0s6IFRoaXMgaXMgdG8gYWxsb3cgbmctY2xpY2tzIHRvIGJlIHByb2Nlc3NlZCBiZWZvcmUgdGhlIHRyYW5zaXRpb24gaXMgaW5pdGlhdGVkOlxuICAgICAgdmFyIHRyYW5zaXRpb24gPSAkdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHN0YXRlLmdvKHRhcmdldC5zdGF0ZSwgdGFyZ2V0LnBhcmFtcywgdGFyZ2V0Lm9wdGlvbnMpO1xuICAgICAgfSk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIC8vIGlmIHRoZSBzdGF0ZSBoYXMgbm8gVVJMLCBpZ25vcmUgb25lIHByZXZlbnREZWZhdWx0IGZyb20gdGhlIDxhPiBkaXJlY3RpdmUuXG4gICAgICB2YXIgaWdub3JlUHJldmVudERlZmF1bHRDb3VudCA9IHR5cGUuaXNBbmNob3IgJiYgIXRhcmdldC5ocmVmID8gMTogMDtcblxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaWdub3JlUHJldmVudERlZmF1bHRDb3VudC0tIDw9IDApICR0aW1lb3V0LmNhbmNlbCh0cmFuc2l0aW9uKTtcbiAgICAgIH07XG4gICAgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0T3B0cyhlbCwgJHN0YXRlKSB7XG4gIHJldHVybiB7IHJlbGF0aXZlOiBzdGF0ZUNvbnRleHQoZWwpIHx8ICRzdGF0ZS4kY3VycmVudCwgaW5oZXJpdDogdHJ1ZSB9O1xufVxuXG4vKipcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZlxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gKiBAcmVxdWlyZXMgJHRpbWVvdXRcbiAqXG4gKiBAcmVzdHJpY3QgQVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQSBkaXJlY3RpdmUgdGhhdCBiaW5kcyBhIGxpbmsgKGA8YT5gIHRhZykgdG8gYSBzdGF0ZS4gSWYgdGhlIHN0YXRlIGhhcyBhbiBhc3NvY2lhdGVkXG4gKiBVUkwsIHRoZSBkaXJlY3RpdmUgd2lsbCBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlICYgdXBkYXRlIHRoZSBgaHJlZmAgYXR0cmlidXRlIHZpYVxuICogdGhlIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfaHJlZiAkc3RhdGUuaHJlZigpfSBtZXRob2QuIENsaWNraW5nXG4gKiB0aGUgbGluayB3aWxsIHRyaWdnZXIgYSBzdGF0ZSB0cmFuc2l0aW9uIHdpdGggb3B0aW9uYWwgcGFyYW1ldGVycy5cbiAqXG4gKiBBbHNvIG1pZGRsZS1jbGlja2luZywgcmlnaHQtY2xpY2tpbmcsIGFuZCBjdHJsLWNsaWNraW5nIG9uIHRoZSBsaW5rIHdpbGwgYmVcbiAqIGhhbmRsZWQgbmF0aXZlbHkgYnkgdGhlIGJyb3dzZXIuXG4gKlxuICogWW91IGNhbiBhbHNvIHVzZSByZWxhdGl2ZSBzdGF0ZSBwYXRocyB3aXRoaW4gdWktc3JlZiwganVzdCBsaWtlIHRoZSByZWxhdGl2ZVxuICogcGF0aHMgcGFzc2VkIHRvIGAkc3RhdGUuZ28oKWAuIFlvdSBqdXN0IG5lZWQgdG8gYmUgYXdhcmUgdGhhdCB0aGUgcGF0aCBpcyByZWxhdGl2ZVxuICogdG8gdGhlIHN0YXRlIHRoYXQgdGhlIGxpbmsgbGl2ZXMgaW4sIGluIG90aGVyIHdvcmRzIHRoZSBzdGF0ZSB0aGF0IGxvYWRlZCB0aGVcbiAqIHRlbXBsYXRlIGNvbnRhaW5pbmcgdGhlIGxpbmsuXG4gKlxuICogWW91IGNhbiBzcGVjaWZ5IG9wdGlvbnMgdG8gcGFzcyB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nbygpfVxuICogdXNpbmcgdGhlIGB1aS1zcmVmLW9wdHNgIGF0dHJpYnV0ZS4gT3B0aW9ucyBhcmUgcmVzdHJpY3RlZCB0byBgbG9jYXRpb25gLCBgaW5oZXJpdGAsXG4gKiBhbmQgYHJlbG9hZGAuXG4gKlxuICogQGV4YW1wbGVcbiAqIEhlcmUncyBhbiBleGFtcGxlIG9mIGhvdyB5b3UnZCB1c2UgdWktc3JlZiBhbmQgaG93IGl0IHdvdWxkIGNvbXBpbGUuIElmIHlvdSBoYXZlIHRoZVxuICogZm9sbG93aW5nIHRlbXBsYXRlOlxuICogPHByZT5cbiAqIDxhIHVpLXNyZWY9XCJob21lXCI+SG9tZTwvYT4gfCA8YSB1aS1zcmVmPVwiYWJvdXRcIj5BYm91dDwvYT4gfCA8YSB1aS1zcmVmPVwie3BhZ2U6IDJ9XCI+TmV4dCBwYWdlPC9hPlxuICpcbiAqIDx1bD5cbiAqICAgICA8bGkgbmctcmVwZWF0PVwiY29udGFjdCBpbiBjb250YWN0c1wiPlxuICogICAgICAgICA8YSB1aS1zcmVmPVwiY29udGFjdHMuZGV0YWlsKHsgaWQ6IGNvbnRhY3QuaWQgfSlcIj57eyBjb250YWN0Lm5hbWUgfX08L2E+XG4gKiAgICAgPC9saT5cbiAqIDwvdWw+XG4gKiA8L3ByZT5cbiAqXG4gKiBUaGVuIHRoZSBjb21waWxlZCBodG1sIHdvdWxkIGJlIChhc3N1bWluZyBIdG1sNU1vZGUgaXMgb2ZmIGFuZCBjdXJyZW50IHN0YXRlIGlzIGNvbnRhY3RzKTpcbiAqIDxwcmU+XG4gKiA8YSBocmVmPVwiIy9ob21lXCIgdWktc3JlZj1cImhvbWVcIj5Ib21lPC9hPiB8IDxhIGhyZWY9XCIjL2Fib3V0XCIgdWktc3JlZj1cImFib3V0XCI+QWJvdXQ8L2E+IHwgPGEgaHJlZj1cIiMvY29udGFjdHM/cGFnZT0yXCIgdWktc3JlZj1cIntwYWdlOiAyfVwiPk5leHQgcGFnZTwvYT5cbiAqXG4gKiA8dWw+XG4gKiAgICAgPGxpIG5nLXJlcGVhdD1cImNvbnRhY3QgaW4gY29udGFjdHNcIj5cbiAqICAgICAgICAgPGEgaHJlZj1cIiMvY29udGFjdHMvMVwiIHVpLXNyZWY9XCJjb250YWN0cy5kZXRhaWwoeyBpZDogY29udGFjdC5pZCB9KVwiPkpvZTwvYT5cbiAqICAgICA8L2xpPlxuICogICAgIDxsaSBuZy1yZXBlYXQ9XCJjb250YWN0IGluIGNvbnRhY3RzXCI+XG4gKiAgICAgICAgIDxhIGhyZWY9XCIjL2NvbnRhY3RzLzJcIiB1aS1zcmVmPVwiY29udGFjdHMuZGV0YWlsKHsgaWQ6IGNvbnRhY3QuaWQgfSlcIj5BbGljZTwvYT5cbiAqICAgICA8L2xpPlxuICogICAgIDxsaSBuZy1yZXBlYXQ9XCJjb250YWN0IGluIGNvbnRhY3RzXCI+XG4gKiAgICAgICAgIDxhIGhyZWY9XCIjL2NvbnRhY3RzLzNcIiB1aS1zcmVmPVwiY29udGFjdHMuZGV0YWlsKHsgaWQ6IGNvbnRhY3QuaWQgfSlcIj5Cb2I8L2E+XG4gKiAgICAgPC9saT5cbiAqIDwvdWw+XG4gKlxuICogPGEgdWktc3JlZj1cImhvbWVcIiB1aS1zcmVmLW9wdHM9XCJ7cmVsb2FkOiB0cnVlfVwiPkhvbWU8L2E+XG4gKiA8L3ByZT5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdWktc3JlZiAnc3RhdGVOYW1lJyBjYW4gYmUgYW55IHZhbGlkIGFic29sdXRlIG9yIHJlbGF0aXZlIHN0YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gdWktc3JlZi1vcHRzIG9wdGlvbnMgdG8gcGFzcyB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nbygpfVxuICovXG4kU3RhdGVSZWZEaXJlY3RpdmUuJGluamVjdCA9IFsnJHN0YXRlJywgJyR0aW1lb3V0J107XG5mdW5jdGlvbiAkU3RhdGVSZWZEaXJlY3RpdmUoJHN0YXRlLCAkdGltZW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgcmVxdWlyZTogWyc/XnVpU3JlZkFjdGl2ZScsICc/XnVpU3JlZkFjdGl2ZUVxJ10sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCB1aVNyZWZBY3RpdmUpIHtcbiAgICAgIHZhciByZWYgICAgPSBwYXJzZVN0YXRlUmVmKGF0dHJzLnVpU3JlZiwgJHN0YXRlLmN1cnJlbnQubmFtZSk7XG4gICAgICB2YXIgZGVmICAgID0geyBzdGF0ZTogcmVmLnN0YXRlLCBocmVmOiBudWxsLCBwYXJhbXM6IG51bGwgfTtcbiAgICAgIHZhciB0eXBlICAgPSBnZXRUeXBlSW5mbyhlbGVtZW50KTtcbiAgICAgIHZhciBhY3RpdmUgPSB1aVNyZWZBY3RpdmVbMV0gfHwgdWlTcmVmQWN0aXZlWzBdO1xuICAgICAgdmFyIHVubGlua0luZm9GbiA9IG51bGw7XG4gICAgICB2YXIgaG9va0ZuO1xuXG4gICAgICBkZWYub3B0aW9ucyA9IGV4dGVuZChkZWZhdWx0T3B0cyhlbGVtZW50LCAkc3RhdGUpLCBhdHRycy51aVNyZWZPcHRzID8gc2NvcGUuJGV2YWwoYXR0cnMudWlTcmVmT3B0cykgOiB7fSk7XG5cbiAgICAgIHZhciB1cGRhdGUgPSBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgaWYgKHZhbCkgZGVmLnBhcmFtcyA9IGFuZ3VsYXIuY29weSh2YWwpO1xuICAgICAgICBkZWYuaHJlZiA9ICRzdGF0ZS5ocmVmKHJlZi5zdGF0ZSwgZGVmLnBhcmFtcywgZGVmLm9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh1bmxpbmtJbmZvRm4pIHVubGlua0luZm9GbigpO1xuICAgICAgICBpZiAoYWN0aXZlKSB1bmxpbmtJbmZvRm4gPSBhY3RpdmUuJCRhZGRTdGF0ZUluZm8ocmVmLnN0YXRlLCBkZWYucGFyYW1zKTtcbiAgICAgICAgaWYgKGRlZi5ocmVmICE9PSBudWxsKSBhdHRycy4kc2V0KHR5cGUuYXR0ciwgZGVmLmhyZWYpO1xuICAgICAgfTtcblxuICAgICAgaWYgKHJlZi5wYXJhbUV4cHIpIHtcbiAgICAgICAgc2NvcGUuJHdhdGNoKHJlZi5wYXJhbUV4cHIsIGZ1bmN0aW9uKHZhbCkgeyBpZiAodmFsICE9PSBkZWYucGFyYW1zKSB1cGRhdGUodmFsKTsgfSwgdHJ1ZSk7XG4gICAgICAgIGRlZi5wYXJhbXMgPSBhbmd1bGFyLmNvcHkoc2NvcGUuJGV2YWwocmVmLnBhcmFtRXhwcikpO1xuICAgICAgfVxuICAgICAgdXBkYXRlKCk7XG5cbiAgICAgIGlmICghdHlwZS5jbGlja2FibGUpIHJldHVybjtcbiAgICAgIGhvb2tGbiA9IGNsaWNrSG9vayhlbGVtZW50LCAkc3RhdGUsICR0aW1lb3V0LCB0eXBlLCBmdW5jdGlvbigpIHsgcmV0dXJuIGRlZjsgfSk7XG4gICAgICBlbGVtZW50LmJpbmQoXCJjbGlja1wiLCBob29rRm4pO1xuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBlbGVtZW50LnVuYmluZChcImNsaWNrXCIsIGhvb2tGbik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zdGF0ZVxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUudWlTcmVmXG4gKlxuICogQHJlc3RyaWN0IEFcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIE11Y2ggbGlrZSB1aS1zcmVmLCBidXQgd2lsbCBhY2NlcHQgbmFtZWQgJHNjb3BlIHByb3BlcnRpZXMgdG8gZXZhbHVhdGUgZm9yIGEgc3RhdGUgZGVmaW5pdGlvbixcbiAqIHBhcmFtcyBhbmQgb3ZlcnJpZGUgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdWktc3RhdGUgJ3N0YXRlTmFtZScgY2FuIGJlIGFueSB2YWxpZCBhYnNvbHV0ZSBvciByZWxhdGl2ZSBzdGF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHVpLXN0YXRlLXBhcmFtcyBwYXJhbXMgdG8gcGFzcyB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2hyZWYgJHN0YXRlLmhyZWYoKX1cbiAqIEBwYXJhbSB7T2JqZWN0fSB1aS1zdGF0ZS1vcHRzIG9wdGlvbnMgdG8gcGFzcyB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nbygpfVxuICovXG4kU3RhdGVSZWZEeW5hbWljRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRzdGF0ZScsICckdGltZW91dCddO1xuZnVuY3Rpb24gJFN0YXRlUmVmRHluYW1pY0RpcmVjdGl2ZSgkc3RhdGUsICR0aW1lb3V0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICByZXF1aXJlOiBbJz9edWlTcmVmQWN0aXZlJywgJz9edWlTcmVmQWN0aXZlRXEnXSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHVpU3JlZkFjdGl2ZSkge1xuICAgICAgdmFyIHR5cGUgICA9IGdldFR5cGVJbmZvKGVsZW1lbnQpO1xuICAgICAgdmFyIGFjdGl2ZSA9IHVpU3JlZkFjdGl2ZVsxXSB8fCB1aVNyZWZBY3RpdmVbMF07XG4gICAgICB2YXIgZ3JvdXAgID0gW2F0dHJzLnVpU3RhdGUsIGF0dHJzLnVpU3RhdGVQYXJhbXMgfHwgbnVsbCwgYXR0cnMudWlTdGF0ZU9wdHMgfHwgbnVsbF07XG4gICAgICB2YXIgd2F0Y2ggID0gJ1snICsgZ3JvdXAubWFwKGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gdmFsIHx8ICdudWxsJzsgfSkuam9pbignLCAnKSArICddJztcbiAgICAgIHZhciBkZWYgICAgPSB7IHN0YXRlOiBudWxsLCBwYXJhbXM6IG51bGwsIG9wdGlvbnM6IG51bGwsIGhyZWY6IG51bGwgfTtcbiAgICAgIHZhciB1bmxpbmtJbmZvRm4gPSBudWxsO1xuICAgICAgdmFyIGhvb2tGbjtcblxuICAgICAgZnVuY3Rpb24gcnVuU3RhdGVSZWZMaW5rIChncm91cCkge1xuICAgICAgICBkZWYuc3RhdGUgPSBncm91cFswXTsgZGVmLnBhcmFtcyA9IGdyb3VwWzFdOyBkZWYub3B0aW9ucyA9IGdyb3VwWzJdO1xuICAgICAgICBkZWYuaHJlZiA9ICRzdGF0ZS5ocmVmKGRlZi5zdGF0ZSwgZGVmLnBhcmFtcywgZGVmLm9wdGlvbnMpO1xuXG4gICAgICAgIGlmICh1bmxpbmtJbmZvRm4pIHVubGlua0luZm9GbigpO1xuICAgICAgICBpZiAoYWN0aXZlKSB1bmxpbmtJbmZvRm4gPSBhY3RpdmUuJCRhZGRTdGF0ZUluZm8oZGVmLnN0YXRlLCBkZWYucGFyYW1zKTtcbiAgICAgICAgaWYgKGRlZi5ocmVmKSBhdHRycy4kc2V0KHR5cGUuYXR0ciwgZGVmLmhyZWYpO1xuICAgICAgfVxuXG4gICAgICBzY29wZS4kd2F0Y2god2F0Y2gsIHJ1blN0YXRlUmVmTGluaywgdHJ1ZSk7XG4gICAgICBydW5TdGF0ZVJlZkxpbmsoc2NvcGUuJGV2YWwod2F0Y2gpKTtcblxuICAgICAgaWYgKCF0eXBlLmNsaWNrYWJsZSkgcmV0dXJuO1xuICAgICAgaG9va0ZuID0gY2xpY2tIb29rKGVsZW1lbnQsICRzdGF0ZSwgJHRpbWVvdXQsIHR5cGUsIGZ1bmN0aW9uKCkgeyByZXR1cm4gZGVmOyB9KTtcbiAgICAgIGVsZW1lbnQuYmluZChcImNsaWNrXCIsIGhvb2tGbik7XG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGVsZW1lbnQudW5iaW5kKFwiY2xpY2tcIiwgaG9va0ZuKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cblxuXG4vKipcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZi1hY3RpdmVcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQYXJhbXNcbiAqIEByZXF1aXJlcyAkaW50ZXJwb2xhdGVcbiAqXG4gKiBAcmVzdHJpY3QgQVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQSBkaXJlY3RpdmUgd29ya2luZyBhbG9uZ3NpZGUgdWktc3JlZiB0byBhZGQgY2xhc3NlcyB0byBhbiBlbGVtZW50IHdoZW4gdGhlXG4gKiByZWxhdGVkIHVpLXNyZWYgZGlyZWN0aXZlJ3Mgc3RhdGUgaXMgYWN0aXZlLCBhbmQgcmVtb3ZpbmcgdGhlbSB3aGVuIGl0IGlzIGluYWN0aXZlLlxuICogVGhlIHByaW1hcnkgdXNlLWNhc2UgaXMgdG8gc2ltcGxpZnkgdGhlIHNwZWNpYWwgYXBwZWFyYW5jZSBvZiBuYXZpZ2F0aW9uIG1lbnVzXG4gKiByZWx5aW5nIG9uIGB1aS1zcmVmYCwgYnkgaGF2aW5nIHRoZSBcImFjdGl2ZVwiIHN0YXRlJ3MgbWVudSBidXR0b24gYXBwZWFyIGRpZmZlcmVudCxcbiAqIGRpc3Rpbmd1aXNoaW5nIGl0IGZyb20gdGhlIGluYWN0aXZlIG1lbnUgaXRlbXMuXG4gKlxuICogdWktc3JlZi1hY3RpdmUgY2FuIGxpdmUgb24gdGhlIHNhbWUgZWxlbWVudCBhcyB1aS1zcmVmIG9yIG9uIGEgcGFyZW50IGVsZW1lbnQuIFRoZSBmaXJzdFxuICogdWktc3JlZi1hY3RpdmUgZm91bmQgYXQgdGhlIHNhbWUgbGV2ZWwgb3IgYWJvdmUgdGhlIHVpLXNyZWYgd2lsbCBiZSB1c2VkLlxuICpcbiAqIFdpbGwgYWN0aXZhdGUgd2hlbiB0aGUgdWktc3JlZidzIHRhcmdldCBzdGF0ZSBvciBhbnkgY2hpbGQgc3RhdGUgaXMgYWN0aXZlLiBJZiB5b3VcbiAqIG5lZWQgdG8gYWN0aXZhdGUgb25seSB3aGVuIHRoZSB1aS1zcmVmIHRhcmdldCBzdGF0ZSBpcyBhY3RpdmUgYW5kICpub3QqIGFueSBvZlxuICogaXQncyBjaGlsZHJlbiwgdGhlbiB5b3Ugd2lsbCB1c2VcbiAqIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXNyZWYtYWN0aXZlLWVxIHVpLXNyZWYtYWN0aXZlLWVxfVxuICpcbiAqIEBleGFtcGxlXG4gKiBHaXZlbiB0aGUgZm9sbG93aW5nIHRlbXBsYXRlOlxuICogPHByZT5cbiAqIDx1bD5cbiAqICAgPGxpIHVpLXNyZWYtYWN0aXZlPVwiYWN0aXZlXCIgY2xhc3M9XCJpdGVtXCI+XG4gKiAgICAgPGEgaHJlZiB1aS1zcmVmPVwiYXBwLnVzZXIoe3VzZXI6ICdiaWxib2JhZ2dpbnMnfSlcIj5AYmlsYm9iYWdnaW5zPC9hPlxuICogICA8L2xpPlxuICogPC91bD5cbiAqIDwvcHJlPlxuICpcbiAqXG4gKiBXaGVuIHRoZSBhcHAgc3RhdGUgaXMgXCJhcHAudXNlclwiIChvciBhbnkgY2hpbGRyZW4gc3RhdGVzKSwgYW5kIGNvbnRhaW5zIHRoZSBzdGF0ZSBwYXJhbWV0ZXIgXCJ1c2VyXCIgd2l0aCB2YWx1ZSBcImJpbGJvYmFnZ2luc1wiLFxuICogdGhlIHJlc3VsdGluZyBIVE1MIHdpbGwgYXBwZWFyIGFzIChub3RlIHRoZSAnYWN0aXZlJyBjbGFzcyk6XG4gKiA8cHJlPlxuICogPHVsPlxuICogICA8bGkgdWktc3JlZi1hY3RpdmU9XCJhY3RpdmVcIiBjbGFzcz1cIml0ZW0gYWN0aXZlXCI+XG4gKiAgICAgPGEgdWktc3JlZj1cImFwcC51c2VyKHt1c2VyOiAnYmlsYm9iYWdnaW5zJ30pXCIgaHJlZj1cIi91c2Vycy9iaWxib2JhZ2dpbnNcIj5AYmlsYm9iYWdnaW5zPC9hPlxuICogICA8L2xpPlxuICogPC91bD5cbiAqIDwvcHJlPlxuICpcbiAqIFRoZSBjbGFzcyBuYW1lIGlzIGludGVycG9sYXRlZCAqKm9uY2UqKiBkdXJpbmcgdGhlIGRpcmVjdGl2ZXMgbGluayB0aW1lIChhbnkgZnVydGhlciBjaGFuZ2VzIHRvIHRoZVxuICogaW50ZXJwb2xhdGVkIHZhbHVlIGFyZSBpZ25vcmVkKS5cbiAqXG4gKiBNdWx0aXBsZSBjbGFzc2VzIG1heSBiZSBzcGVjaWZpZWQgaW4gYSBzcGFjZS1zZXBhcmF0ZWQgZm9ybWF0OlxuICogPHByZT5cbiAqIDx1bD5cbiAqICAgPGxpIHVpLXNyZWYtYWN0aXZlPSdjbGFzczEgY2xhc3MyIGNsYXNzMyc+XG4gKiAgICAgPGEgdWktc3JlZj1cImFwcC51c2VyXCI+bGluazwvYT5cbiAqICAgPC9saT5cbiAqIDwvdWw+XG4gKiA8L3ByZT5cbiAqXG4gKiBJdCBpcyBhbHNvIHBvc3NpYmxlIHRvIHBhc3MgdWktc3JlZi1hY3RpdmUgYW4gZXhwcmVzc2lvbiB0aGF0IGV2YWx1YXRlc1xuICogdG8gYW4gb2JqZWN0IGhhc2gsIHdob3NlIGtleXMgcmVwcmVzZW50IGFjdGl2ZSBjbGFzcyBuYW1lcyBhbmQgd2hvc2VcbiAqIHZhbHVlcyByZXByZXNlbnQgdGhlIHJlc3BlY3RpdmUgc3RhdGUgbmFtZXMvZ2xvYnMuXG4gKiB1aS1zcmVmLWFjdGl2ZSB3aWxsIG1hdGNoIGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBzdGF0ZSAqKmluY2x1ZGVzKiogYW55IG9mXG4gKiB0aGUgc3BlY2lmaWVkIHN0YXRlIG5hbWVzL2dsb2JzLCBldmVuIHRoZSBhYnN0cmFjdCBvbmVzLlxuICpcbiAqIEBFeGFtcGxlXG4gKiBHaXZlbiB0aGUgZm9sbG93aW5nIHRlbXBsYXRlLCB3aXRoIFwiYWRtaW5cIiBiZWluZyBhbiBhYnN0cmFjdCBzdGF0ZTpcbiAqIDxwcmU+XG4gKiA8ZGl2IHVpLXNyZWYtYWN0aXZlPVwieydhY3RpdmUnOiAnYWRtaW4uKid9XCI+XG4gKiAgIDxhIHVpLXNyZWYtYWN0aXZlPVwiYWN0aXZlXCIgdWktc3JlZj1cImFkbWluLnJvbGVzXCI+Um9sZXM8L2E+XG4gKiA8L2Rpdj5cbiAqIDwvcHJlPlxuICpcbiAqIFdoZW4gdGhlIGN1cnJlbnQgc3RhdGUgaXMgXCJhZG1pbi5yb2xlc1wiIHRoZSBcImFjdGl2ZVwiIGNsYXNzIHdpbGwgYmUgYXBwbGllZFxuICogdG8gYm90aCB0aGUgPGRpdj4gYW5kIDxhPiBlbGVtZW50cy4gSXQgaXMgaW1wb3J0YW50IHRvIG5vdGUgdGhhdCB0aGUgc3RhdGVcbiAqIG5hbWVzL2dsb2JzIHBhc3NlZCB0byB1aS1zcmVmLWFjdGl2ZSBzaGFkb3cgdGhlIHN0YXRlIHByb3ZpZGVkIGJ5IHVpLXNyZWYuXG4gKi9cblxuLyoqXG4gKiBAbmdkb2MgZGlyZWN0aXZlXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXNyZWYtYWN0aXZlLWVxXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUGFyYW1zXG4gKiBAcmVxdWlyZXMgJGludGVycG9sYXRlXG4gKlxuICogQHJlc3RyaWN0IEFcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBzYW1lIGFzIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXNyZWYtYWN0aXZlIHVpLXNyZWYtYWN0aXZlfSBidXQgd2lsbCBvbmx5IGFjdGl2YXRlXG4gKiB3aGVuIHRoZSBleGFjdCB0YXJnZXQgc3RhdGUgdXNlZCBpbiB0aGUgYHVpLXNyZWZgIGlzIGFjdGl2ZTsgbm8gY2hpbGQgc3RhdGVzLlxuICpcbiAqL1xuJFN0YXRlUmVmQWN0aXZlRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRzdGF0ZScsICckc3RhdGVQYXJhbXMnLCAnJGludGVycG9sYXRlJ107XG5mdW5jdGlvbiAkU3RhdGVSZWZBY3RpdmVEaXJlY3RpdmUoJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRpbnRlcnBvbGF0ZSkge1xuICByZXR1cm4gIHtcbiAgICByZXN0cmljdDogXCJBXCIsXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycywgJHRpbWVvdXQpIHtcbiAgICAgIHZhciBzdGF0ZXMgPSBbXSwgYWN0aXZlQ2xhc3NlcyA9IHt9LCBhY3RpdmVFcUNsYXNzLCB1aVNyZWZBY3RpdmU7XG5cbiAgICAgIC8vIFRoZXJlIHByb2JhYmx5IGlzbid0IG11Y2ggcG9pbnQgaW4gJG9ic2VydmluZyB0aGlzXG4gICAgICAvLyB1aVNyZWZBY3RpdmUgYW5kIHVpU3JlZkFjdGl2ZUVxIHNoYXJlIHRoZSBzYW1lIGRpcmVjdGl2ZSBvYmplY3Qgd2l0aCBzb21lXG4gICAgICAvLyBzbGlnaHQgZGlmZmVyZW5jZSBpbiBsb2dpYyByb3V0aW5nXG4gICAgICBhY3RpdmVFcUNsYXNzID0gJGludGVycG9sYXRlKCRhdHRycy51aVNyZWZBY3RpdmVFcSB8fCAnJywgZmFsc2UpKCRzY29wZSk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHVpU3JlZkFjdGl2ZSA9ICRzY29wZS4kZXZhbCgkYXR0cnMudWlTcmVmQWN0aXZlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gRG8gbm90aGluZy4gdWlTcmVmQWN0aXZlIGlzIG5vdCBhIHZhbGlkIGV4cHJlc3Npb24uXG4gICAgICAgIC8vIEZhbGwgYmFjayB0byB1c2luZyAkaW50ZXJwb2xhdGUgYmVsb3dcbiAgICAgIH1cbiAgICAgIHVpU3JlZkFjdGl2ZSA9IHVpU3JlZkFjdGl2ZSB8fCAkaW50ZXJwb2xhdGUoJGF0dHJzLnVpU3JlZkFjdGl2ZSB8fCAnJywgZmFsc2UpKCRzY29wZSk7XG4gICAgICBpZiAoaXNPYmplY3QodWlTcmVmQWN0aXZlKSkge1xuICAgICAgICBmb3JFYWNoKHVpU3JlZkFjdGl2ZSwgZnVuY3Rpb24oc3RhdGVPck5hbWUsIGFjdGl2ZUNsYXNzKSB7XG4gICAgICAgICAgaWYgKGlzU3RyaW5nKHN0YXRlT3JOYW1lKSkge1xuICAgICAgICAgICAgdmFyIHJlZiA9IHBhcnNlU3RhdGVSZWYoc3RhdGVPck5hbWUsICRzdGF0ZS5jdXJyZW50Lm5hbWUpO1xuICAgICAgICAgICAgYWRkU3RhdGUocmVmLnN0YXRlLCAkc2NvcGUuJGV2YWwocmVmLnBhcmFtRXhwciksIGFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBbGxvdyB1aVNyZWYgdG8gY29tbXVuaWNhdGUgd2l0aCB1aVNyZWZBY3RpdmVbRXF1YWxzXVxuICAgICAgdGhpcy4kJGFkZFN0YXRlSW5mbyA9IGZ1bmN0aW9uIChuZXdTdGF0ZSwgbmV3UGFyYW1zKSB7XG4gICAgICAgIC8vIHdlIGFscmVhZHkgZ290IGFuIGV4cGxpY2l0IHN0YXRlIHByb3ZpZGVkIGJ5IHVpLXNyZWYtYWN0aXZlLCBzbyB3ZVxuICAgICAgICAvLyBzaGFkb3cgdGhlIG9uZSB0aGF0IGNvbWVzIGZyb20gdWktc3JlZlxuICAgICAgICBpZiAoaXNPYmplY3QodWlTcmVmQWN0aXZlKSAmJiBzdGF0ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGVyZWdpc3RlciA9IGFkZFN0YXRlKG5ld1N0YXRlLCBuZXdQYXJhbXMsIHVpU3JlZkFjdGl2ZSk7XG4gICAgICAgIHVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gZGVyZWdpc3RlcjtcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCB1cGRhdGUpO1xuXG4gICAgICBmdW5jdGlvbiBhZGRTdGF0ZShzdGF0ZU5hbWUsIHN0YXRlUGFyYW1zLCBhY3RpdmVDbGFzcykge1xuICAgICAgICB2YXIgc3RhdGUgPSAkc3RhdGUuZ2V0KHN0YXRlTmFtZSwgc3RhdGVDb250ZXh0KCRlbGVtZW50KSk7XG4gICAgICAgIHZhciBzdGF0ZUhhc2ggPSBjcmVhdGVTdGF0ZUhhc2goc3RhdGVOYW1lLCBzdGF0ZVBhcmFtcyk7XG5cbiAgICAgICAgdmFyIHN0YXRlSW5mbyA9IHtcbiAgICAgICAgICBzdGF0ZTogc3RhdGUgfHwgeyBuYW1lOiBzdGF0ZU5hbWUgfSxcbiAgICAgICAgICBwYXJhbXM6IHN0YXRlUGFyYW1zLFxuICAgICAgICAgIGhhc2g6IHN0YXRlSGFzaFxuICAgICAgICB9O1xuXG4gICAgICAgIHN0YXRlcy5wdXNoKHN0YXRlSW5mbyk7XG4gICAgICAgIGFjdGl2ZUNsYXNzZXNbc3RhdGVIYXNoXSA9IGFjdGl2ZUNsYXNzO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiByZW1vdmVTdGF0ZSgpIHtcbiAgICAgICAgICB2YXIgaWR4ID0gc3RhdGVzLmluZGV4T2Yoc3RhdGVJbmZvKTtcbiAgICAgICAgICBpZiAoaWR4ICE9PSAtMSkgc3RhdGVzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0ZVxuICAgICAgICogQHBhcmFtIHtPYmplY3R8c3RyaW5nfSBbcGFyYW1zXVxuICAgICAgICogQHJldHVybiB7c3RyaW5nfVxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBjcmVhdGVTdGF0ZUhhc2goc3RhdGUsIHBhcmFtcykge1xuICAgICAgICBpZiAoIWlzU3RyaW5nKHN0YXRlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignc3RhdGUgc2hvdWxkIGJlIGEgc3RyaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzT2JqZWN0KHBhcmFtcykpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUgKyB0b0pzb24ocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICBwYXJhbXMgPSAkc2NvcGUuJGV2YWwocGFyYW1zKTtcbiAgICAgICAgaWYgKGlzT2JqZWN0KHBhcmFtcykpIHtcbiAgICAgICAgICByZXR1cm4gc3RhdGUgKyB0b0pzb24ocGFyYW1zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RhdGU7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSByb3V0ZSBzdGF0ZVxuICAgICAgZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChhbnlNYXRjaChzdGF0ZXNbaV0uc3RhdGUsIHN0YXRlc1tpXS5wYXJhbXMpKSB7XG4gICAgICAgICAgICBhZGRDbGFzcygkZWxlbWVudCwgYWN0aXZlQ2xhc3Nlc1tzdGF0ZXNbaV0uaGFzaF0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW1vdmVDbGFzcygkZWxlbWVudCwgYWN0aXZlQ2xhc3Nlc1tzdGF0ZXNbaV0uaGFzaF0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChleGFjdE1hdGNoKHN0YXRlc1tpXS5zdGF0ZSwgc3RhdGVzW2ldLnBhcmFtcykpIHtcbiAgICAgICAgICAgIGFkZENsYXNzKCRlbGVtZW50LCBhY3RpdmVFcUNsYXNzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoJGVsZW1lbnQsIGFjdGl2ZUVxQ2xhc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBhZGRDbGFzcyhlbCwgY2xhc3NOYW1lKSB7ICR0aW1lb3V0KGZ1bmN0aW9uICgpIHsgZWwuYWRkQ2xhc3MoY2xhc3NOYW1lKTsgfSk7IH1cbiAgICAgIGZ1bmN0aW9uIHJlbW92ZUNsYXNzKGVsLCBjbGFzc05hbWUpIHsgZWwucmVtb3ZlQ2xhc3MoY2xhc3NOYW1lKTsgfVxuICAgICAgZnVuY3Rpb24gYW55TWF0Y2goc3RhdGUsIHBhcmFtcykgeyByZXR1cm4gJHN0YXRlLmluY2x1ZGVzKHN0YXRlLm5hbWUsIHBhcmFtcyk7IH1cbiAgICAgIGZ1bmN0aW9uIGV4YWN0TWF0Y2goc3RhdGUsIHBhcmFtcykgeyByZXR1cm4gJHN0YXRlLmlzKHN0YXRlLm5hbWUsIHBhcmFtcyk7IH1cblxuICAgICAgdXBkYXRlKCk7XG4gICAgfV1cbiAgfTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScpXG4gIC5kaXJlY3RpdmUoJ3VpU3JlZicsICRTdGF0ZVJlZkRpcmVjdGl2ZSlcbiAgLmRpcmVjdGl2ZSgndWlTcmVmQWN0aXZlJywgJFN0YXRlUmVmQWN0aXZlRGlyZWN0aXZlKVxuICAuZGlyZWN0aXZlKCd1aVNyZWZBY3RpdmVFcScsICRTdGF0ZVJlZkFjdGl2ZURpcmVjdGl2ZSlcbiAgLmRpcmVjdGl2ZSgndWlTdGF0ZScsICRTdGF0ZVJlZkR5bmFtaWNEaXJlY3RpdmUpO1xuXG4vKipcbiAqIEBuZ2RvYyBmaWx0ZXJcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5maWx0ZXI6aXNTdGF0ZVxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUcmFuc2xhdGVzIHRvIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfaXMgJHN0YXRlLmlzKFwic3RhdGVOYW1lXCIpfS5cbiAqL1xuJElzU3RhdGVGaWx0ZXIuJGluamVjdCA9IFsnJHN0YXRlJ107XG5mdW5jdGlvbiAkSXNTdGF0ZUZpbHRlcigkc3RhdGUpIHtcbiAgdmFyIGlzRmlsdGVyID0gZnVuY3Rpb24gKHN0YXRlLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gJHN0YXRlLmlzKHN0YXRlLCBwYXJhbXMpO1xuICB9O1xuICBpc0ZpbHRlci4kc3RhdGVmdWwgPSB0cnVlO1xuICByZXR1cm4gaXNGaWx0ZXI7XG59XG5cbi8qKlxuICogQG5nZG9jIGZpbHRlclxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmZpbHRlcjppbmNsdWRlZEJ5U3RhdGVcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVHJhbnNsYXRlcyB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2luY2x1ZGVzICRzdGF0ZS5pbmNsdWRlcygnZnVsbE9yUGFydGlhbFN0YXRlTmFtZScpfS5cbiAqL1xuJEluY2x1ZGVkQnlTdGF0ZUZpbHRlci4kaW5qZWN0ID0gWyckc3RhdGUnXTtcbmZ1bmN0aW9uICRJbmNsdWRlZEJ5U3RhdGVGaWx0ZXIoJHN0YXRlKSB7XG4gIHZhciBpbmNsdWRlc0ZpbHRlciA9IGZ1bmN0aW9uIChzdGF0ZSwgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuICRzdGF0ZS5pbmNsdWRlcyhzdGF0ZSwgcGFyYW1zLCBvcHRpb25zKTtcbiAgfTtcbiAgaW5jbHVkZXNGaWx0ZXIuJHN0YXRlZnVsID0gdHJ1ZTtcbiAgcmV0dXJuICBpbmNsdWRlc0ZpbHRlcjtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScpXG4gIC5maWx0ZXIoJ2lzU3RhdGUnLCAkSXNTdGF0ZUZpbHRlcilcbiAgLmZpbHRlcignaW5jbHVkZWRCeVN0YXRlJywgJEluY2x1ZGVkQnlTdGF0ZUZpbHRlcik7XG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTsiLCIvKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQgZGlyZWN0aXZlcyBhbmQgc2VydmljZXMuIFN1cHBvcnRzOiBmaWxlIHVwbG9hZC9kcm9wL3Bhc3RlLCByZXN1bWUsIGNhbmNlbC9hYm9ydCxcbiAqIHByb2dyZXNzLCByZXNpemUsIHRodW1ibmFpbCwgcHJldmlldywgdmFsaWRhdGlvbiBhbmQgQ09SU1xuICogRmlsZUFQSSBGbGFzaCBzaGltIGZvciBvbGQgYnJvd3NlcnMgbm90IHN1cHBvcnRpbmcgRm9ybURhdGFcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxMi4yLjEyXG4gKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgLyoqIEBuYW1lc3BhY2UgRmlsZUFQSS5ub0NvbnRlbnRUaW1lb3V0ICovXG5cbiAgZnVuY3Rpb24gcGF0Y2hYSFIoZm5OYW1lLCBuZXdGbikge1xuICAgIHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSA9IG5ld0ZuKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGVbZm5OYW1lXSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWRlZmluZVByb3AoeGhyLCBwcm9wLCBmbikge1xuICAgIHRyeSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoeGhyLCBwcm9wLCB7Z2V0OiBmbn0pO1xuICAgIH0gY2F0Y2ggKGUpIHsvKmlnbm9yZSovXG4gICAgfVxuICB9XG5cbiAgaWYgKCF3aW5kb3cuRmlsZUFQSSkge1xuICAgIHdpbmRvdy5GaWxlQVBJID0ge307XG4gIH1cblxuICBpZiAoIXdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgIHRocm93ICdBSkFYIGlzIG5vdCBzdXBwb3J0ZWQuIFhNTEh0dHBSZXF1ZXN0IGlzIG5vdCBkZWZpbmVkLic7XG4gIH1cblxuICBGaWxlQVBJLnNob3VsZExvYWQgPSAhd2luZG93LkZvcm1EYXRhIHx8IEZpbGVBUEkuZm9yY2VMb2FkO1xuICBpZiAoRmlsZUFQSS5zaG91bGRMb2FkKSB7XG4gICAgdmFyIGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lciA9IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgIGlmICgheGhyLl9fbGlzdGVuZXJzKSB7XG4gICAgICAgIGlmICgheGhyLnVwbG9hZCkgeGhyLnVwbG9hZCA9IHt9O1xuICAgICAgICB4aHIuX19saXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgdmFyIG9yaWdBZGRFdmVudExpc3RlbmVyID0geGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyO1xuICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAodCwgZm4pIHtcbiAgICAgICAgICB4aHIuX19saXN0ZW5lcnNbdF0gPSBmbjtcbiAgICAgICAgICBpZiAob3JpZ0FkZEV2ZW50TGlzdGVuZXIpIG9yaWdBZGRFdmVudExpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHBhdGNoWEhSKCdvcGVuJywgZnVuY3Rpb24gKG9yaWcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAobSwgdXJsLCBiKSB7XG4gICAgICAgIGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcbiAgICAgICAgdGhpcy5fX3VybCA9IHVybDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBvcmlnLmFwcGx5KHRoaXMsIFttLCB1cmwsIGJdKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChlLm1lc3NhZ2UuaW5kZXhPZignQWNjZXNzIGlzIGRlbmllZCcpID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMuX19vcmlnRXJyb3IgPSBlO1xuICAgICAgICAgICAgb3JpZy5hcHBseSh0aGlzLCBbbSwgJ19maXhfZm9yX2llX2Nyb3NzZG9tYWluX18nLCBiXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcGF0Y2hYSFIoJ2dldFJlc3BvbnNlSGVhZGVyJywgZnVuY3Rpb24gKG9yaWcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoaCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2ZpbGVBcGlYSFIgJiYgdGhpcy5fX2ZpbGVBcGlYSFIuZ2V0UmVzcG9uc2VIZWFkZXIgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlcihoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzLCBbaF0pKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBwYXRjaFhIUignZ2V0QWxsUmVzcG9uc2VIZWFkZXJzJywgZnVuY3Rpb24gKG9yaWcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPyB0aGlzLl9fZmlsZUFwaVhIUi5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcGF0Y2hYSFIoJ2Fib3J0JywgZnVuY3Rpb24gKG9yaWcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5hYm9ydCA/IHRoaXMuX19maWxlQXBpWEhSLmFib3J0KCkgOiAob3JpZyA9PSBudWxsID8gbnVsbCA6IG9yaWcuYXBwbHkodGhpcykpO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHBhdGNoWEhSKCdzZXRSZXF1ZXN0SGVhZGVyJywgZnVuY3Rpb24gKG9yaWcpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoaGVhZGVyLCB2YWx1ZSkge1xuICAgICAgICBpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuICAgICAgICAgIGluaXRpYWxpemVVcGxvYWRMaXN0ZW5lcih0aGlzKTtcbiAgICAgICAgICB2YXIgdmFsID0gdmFsdWUodGhpcyk7XG4gICAgICAgICAgLy8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcbiAgICAgICAgICBpZiAodmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgICAgICAgIHZhbCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fX3JlcXVlc3RIZWFkZXJzID0gdGhpcy5fX3JlcXVlc3RIZWFkZXJzIHx8IHt9O1xuICAgICAgICAgIHRoaXMuX19yZXF1ZXN0SGVhZGVyc1toZWFkZXJdID0gdmFsdWU7XG4gICAgICAgICAgb3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcGF0Y2hYSFIoJ3NlbmQnLCBmdW5jdGlvbiAob3JpZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHhociA9IHRoaXM7XG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0gJiYgYXJndW1lbnRzWzBdLl9faXNGaWxlQVBJU2hpbSkge1xuICAgICAgICAgIHZhciBmb3JtRGF0YSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICAgICAgdXJsOiB4aHIuX191cmwsXG4gICAgICAgICAgICBqc29ucDogZmFsc2UsIC8vcmVtb3ZlcyB0aGUgY2FsbGJhY2sgZm9ybSBwYXJhbVxuICAgICAgICAgICAgY2FjaGU6IHRydWUsIC8vcmVtb3ZlcyB0aGUgP2ZpbGVhcGlYWFggaW4gdGhlIHVybFxuICAgICAgICAgICAgY29tcGxldGU6IGZ1bmN0aW9uIChlcnIsIGZpbGVBcGlYSFIpIHtcbiAgICAgICAgICAgICAgaWYgKGVyciAmJiBhbmd1bGFyLmlzU3RyaW5nKGVycikgJiYgZXJyLmluZGV4T2YoJyMyMTc0JykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBlcnJvciBzZWVtcyB0byBiZSBmaW5lIHRoZSBmaWxlIGlzIGJlaW5nIHVwbG9hZGVkIHByb3Blcmx5LlxuICAgICAgICAgICAgICAgIGVyciA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgeGhyLl9fY29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzLmxvYWQpXG4gICAgICAgICAgICAgICAgeGhyLl9fbGlzdGVuZXJzLmxvYWQoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvYWQnLFxuICAgICAgICAgICAgICAgICAgbG9hZGVkOiB4aHIuX19sb2FkZWQsXG4gICAgICAgICAgICAgICAgICB0b3RhbDogeGhyLl9fdG90YWwsXG4gICAgICAgICAgICAgICAgICB0YXJnZXQ6IHhocixcbiAgICAgICAgICAgICAgICAgIGxlbmd0aENvbXB1dGFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgeGhyLl9fbGlzdGVuZXJzLmxvYWRlbmQpXG4gICAgICAgICAgICAgICAgeGhyLl9fbGlzdGVuZXJzLmxvYWRlbmQoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ2xvYWRlbmQnLFxuICAgICAgICAgICAgICAgICAgbG9hZGVkOiB4aHIuX19sb2FkZWQsXG4gICAgICAgICAgICAgICAgICB0b3RhbDogeGhyLl9fdG90YWwsXG4gICAgICAgICAgICAgICAgICB0YXJnZXQ6IHhocixcbiAgICAgICAgICAgICAgICAgIGxlbmd0aENvbXB1dGFibGU6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGVyciA9PT0gJ2Fib3J0JyAmJiB4aHIuX19saXN0ZW5lcnMuYWJvcnQpXG4gICAgICAgICAgICAgICAgeGhyLl9fbGlzdGVuZXJzLmFib3J0KHtcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICdhYm9ydCcsXG4gICAgICAgICAgICAgICAgICBsb2FkZWQ6IHhoci5fX2xvYWRlZCxcbiAgICAgICAgICAgICAgICAgIHRvdGFsOiB4aHIuX190b3RhbCxcbiAgICAgICAgICAgICAgICAgIHRhcmdldDogeGhyLFxuICAgICAgICAgICAgICAgICAgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoZmlsZUFwaVhIUi5zdGF0dXMgIT09IHVuZGVmaW5lZCkgcmVkZWZpbmVQcm9wKHhociwgJ3N0YXR1cycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGZpbGVBcGlYSFIuc3RhdHVzID09PSAwICYmIGVyciAmJiBlcnIgIT09ICdhYm9ydCcpID8gNTAwIDogZmlsZUFwaVhIUi5zdGF0dXM7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoZmlsZUFwaVhIUi5zdGF0dXNUZXh0ICE9PSB1bmRlZmluZWQpIHJlZGVmaW5lUHJvcCh4aHIsICdzdGF0dXNUZXh0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlQXBpWEhSLnN0YXR1c1RleHQ7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZWRlZmluZVByb3AoeGhyLCAncmVhZHlTdGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChmaWxlQXBpWEhSLnJlc3BvbnNlICE9PSB1bmRlZmluZWQpIHJlZGVmaW5lUHJvcCh4aHIsICdyZXNwb25zZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsZUFwaVhIUi5yZXNwb25zZTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHZhciByZXNwID0gZmlsZUFwaVhIUi5yZXNwb25zZVRleHQgfHwgKGVyciAmJiBmaWxlQXBpWEhSLnN0YXR1cyA9PT0gMCAmJiBlcnIgIT09ICdhYm9ydCcgPyBlcnIgOiB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICByZWRlZmluZVByb3AoeGhyLCAncmVzcG9uc2VUZXh0JywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgcmVkZWZpbmVQcm9wKHhociwgJ3Jlc3BvbnNlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGVycikgcmVkZWZpbmVQcm9wKHhociwgJ2VycicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgeGhyLl9fZmlsZUFwaVhIUiA9IGZpbGVBcGlYSFI7XG4gICAgICAgICAgICAgIGlmICh4aHIub25yZWFkeXN0YXRlY2hhbmdlKSB4aHIub25yZWFkeXN0YXRlY2hhbmdlKCk7XG4gICAgICAgICAgICAgIGlmICh4aHIub25sb2FkKSB4aHIub25sb2FkKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIGUudGFyZ2V0ID0geGhyO1xuICAgICAgICAgICAgICBpZiAoeGhyLl9fbGlzdGVuZXJzLnByb2dyZXNzKSB4aHIuX19saXN0ZW5lcnMucHJvZ3Jlc3MoZSk7XG4gICAgICAgICAgICAgIHhoci5fX3RvdGFsID0gZS50b3RhbDtcbiAgICAgICAgICAgICAgeGhyLl9fbG9hZGVkID0gZS5sb2FkZWQ7XG4gICAgICAgICAgICAgIGlmIChlLnRvdGFsID09PSBlLmxvYWRlZCkge1xuICAgICAgICAgICAgICAgIC8vIGZpeCBmbGFzaCBpc3N1ZSB0aGF0IGRvZXNuJ3QgY2FsbCBjb21wbGV0ZSBpZiB0aGVyZSBpcyBubyByZXNwb25zZSB0ZXh0IGZyb20gdGhlIHNlcnZlclxuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoIXhoci5fX2NvbXBsZXRlZCkge1xuICAgICAgICAgICAgICAgICAgICB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5jb21wbGV0ZShudWxsLCB7c3RhdHVzOiAyMDQsIHN0YXR1c1RleHQ6ICdObyBDb250ZW50J30pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIEZpbGVBUEkubm9Db250ZW50VGltZW91dCB8fCAxMDAwMCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBoZWFkZXJzOiB4aHIuX19yZXF1ZXN0SGVhZGVyc1xuICAgICAgICAgIH07XG4gICAgICAgICAgY29uZmlnLmRhdGEgPSB7fTtcbiAgICAgICAgICBjb25maWcuZmlsZXMgPSB7fTtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZvcm1EYXRhLmRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gZm9ybURhdGEuZGF0YVtpXTtcbiAgICAgICAgICAgIGlmIChpdGVtLnZhbCAhPSBudWxsICYmIGl0ZW0udmFsLm5hbWUgIT0gbnVsbCAmJiBpdGVtLnZhbC5zaXplICE9IG51bGwgJiYgaXRlbS52YWwudHlwZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGNvbmZpZy5maWxlc1tpdGVtLmtleV0gPSBpdGVtLnZhbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNvbmZpZy5kYXRhW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKCFGaWxlQVBJLmhhc0ZsYXNoKSB7XG4gICAgICAgICAgICAgIHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB4aHIuX19maWxlQXBpWEhSID0gRmlsZUFQSS51cGxvYWQoY29uZmlnKTtcbiAgICAgICAgICB9LCAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5fX29yaWdFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgdGhpcy5fX29yaWdFcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3JpZy5hcHBseSh4aHIsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gICAgd2luZG93LlhNTEh0dHBSZXF1ZXN0Ll9faXNGaWxlQVBJU2hpbSA9IHRydWU7XG4gICAgd2luZG93LkZvcm1EYXRhID0gRm9ybURhdGEgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhcHBlbmQ6IGZ1bmN0aW9uIChrZXksIHZhbCwgbmFtZSkge1xuICAgICAgICAgIGlmICh2YWwuX19pc0ZpbGVBUElCbG9iU2hpbSkge1xuICAgICAgICAgICAgdmFsID0gdmFsLmRhdGFbMF07XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZGF0YS5wdXNoKHtcbiAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgdmFsOiB2YWwsXG4gICAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGRhdGE6IFtdLFxuICAgICAgICBfX2lzRmlsZUFQSVNoaW06IHRydWVcbiAgICAgIH07XG4gICAgfTtcblxuICAgIHdpbmRvdy5CbG9iID0gQmxvYiA9IGZ1bmN0aW9uIChiKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBiLFxuICAgICAgICBfX2lzRmlsZUFQSUJsb2JTaGltOiB0cnVlXG4gICAgICB9O1xuICAgIH07XG4gIH1cblxufSkoKTtcblxuKGZ1bmN0aW9uICgpIHtcbiAgLyoqIEBuYW1lc3BhY2UgRmlsZUFQSS5mb3JjZUxvYWQgKi9cbiAgLyoqIEBuYW1lc3BhY2Ugd2luZG93LkZpbGVBUEkuanNVcmwgKi9cbiAgLyoqIEBuYW1lc3BhY2Ugd2luZG93LkZpbGVBUEkuanNQYXRoICovXG5cbiAgZnVuY3Rpb24gaXNJbnB1dFR5cGVGaWxlKGVsZW0pIHtcbiAgICByZXR1cm4gZWxlbVswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbnB1dCcgJiYgZWxlbS5hdHRyKCd0eXBlJykgJiYgZWxlbS5hdHRyKCd0eXBlJykudG9Mb3dlckNhc2UoKSA9PT0gJ2ZpbGUnO1xuICB9XG5cbiAgZnVuY3Rpb24gaGFzRmxhc2goKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciBmbyA9IG5ldyBBY3RpdmVYT2JqZWN0KCdTaG9ja3dhdmVGbGFzaC5TaG9ja3dhdmVGbGFzaCcpO1xuICAgICAgaWYgKGZvKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAobmF2aWdhdG9yLm1pbWVUeXBlc1snYXBwbGljYXRpb24veC1zaG9ja3dhdmUtZmxhc2gnXSAhPT0gdW5kZWZpbmVkKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0T2Zmc2V0KG9iaikge1xuICAgIHZhciBsZWZ0ID0gMCwgdG9wID0gMDtcblxuICAgIGlmICh3aW5kb3cualF1ZXJ5KSB7XG4gICAgICByZXR1cm4galF1ZXJ5KG9iaikub2Zmc2V0KCk7XG4gICAgfVxuXG4gICAgaWYgKG9iai5vZmZzZXRQYXJlbnQpIHtcbiAgICAgIGRvIHtcbiAgICAgICAgbGVmdCArPSAob2JqLm9mZnNldExlZnQgLSBvYmouc2Nyb2xsTGVmdCk7XG4gICAgICAgIHRvcCArPSAob2JqLm9mZnNldFRvcCAtIG9iai5zY3JvbGxUb3ApO1xuICAgICAgICBvYmogPSBvYmoub2Zmc2V0UGFyZW50O1xuICAgICAgfSB3aGlsZSAob2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICB0b3A6IHRvcFxuICAgIH07XG4gIH1cblxuICBpZiAoRmlsZUFQSS5zaG91bGRMb2FkKSB7XG4gICAgRmlsZUFQSS5oYXNGbGFzaCA9IGhhc0ZsYXNoKCk7XG5cbiAgICAvL2xvYWQgRmlsZUFQSVxuICAgIGlmIChGaWxlQVBJLmZvcmNlTG9hZCkge1xuICAgICAgRmlsZUFQSS5odG1sNSA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghRmlsZUFQSS51cGxvYWQpIHtcbiAgICAgIHZhciBqc1VybCwgYmFzZVBhdGgsIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpLCBhbGxTY3JpcHRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpLCBpLCBpbmRleCwgc3JjO1xuICAgICAgaWYgKHdpbmRvdy5GaWxlQVBJLmpzVXJsKSB7XG4gICAgICAgIGpzVXJsID0gd2luZG93LkZpbGVBUEkuanNVcmw7XG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5GaWxlQVBJLmpzUGF0aCkge1xuICAgICAgICBiYXNlUGF0aCA9IHdpbmRvdy5GaWxlQVBJLmpzUGF0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBhbGxTY3JpcHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc3JjID0gYWxsU2NyaXB0c1tpXS5zcmM7XG4gICAgICAgICAgaW5kZXggPSBzcmMuc2VhcmNoKC9cXC9uZ1xcLWZpbGVcXC11cGxvYWRbXFwtYS16QS16MC05XFwuXSpcXC5qcy8pO1xuICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICBiYXNlUGF0aCA9IHNyYy5zdWJzdHJpbmcoMCwgaW5kZXggKyAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoRmlsZUFQSS5zdGF0aWNQYXRoID09IG51bGwpIEZpbGVBUEkuc3RhdGljUGF0aCA9IGJhc2VQYXRoO1xuICAgICAgc2NyaXB0LnNldEF0dHJpYnV0ZSgnc3JjJywganNVcmwgfHwgYmFzZVBhdGggKyAnRmlsZUFQSS5taW4uanMnKTtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICB9XG5cbiAgICBGaWxlQVBJLm5nZkZpeElFID0gZnVuY3Rpb24gKGVsZW0sIGZpbGVFbGVtLCBjaGFuZ2VGbikge1xuICAgICAgaWYgKCFoYXNGbGFzaCgpKSB7XG4gICAgICAgIHRocm93ICdBZG9kZSBGbGFzaCBQbGF5ZXIgbmVlZCB0byBiZSBpbnN0YWxsZWQuIFRvIGNoZWNrIGFoZWFkIHVzZSBcIkZpbGVBUEkuaGFzRmxhc2hcIic7XG4gICAgICB9XG4gICAgICB2YXIgZml4SW5wdXRTdHlsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxhYmVsID0gZmlsZUVsZW0ucGFyZW50KCk7XG4gICAgICAgIGlmIChlbGVtLmF0dHIoJ2Rpc2FibGVkJykpIHtcbiAgICAgICAgICBpZiAobGFiZWwpIGxhYmVsLnJlbW92ZUNsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoIWZpbGVFbGVtLmF0dHIoJ19fbmdmX2ZsYXNoXycpKSB7XG4gICAgICAgICAgICBmaWxlRWxlbS51bmJpbmQoJ2NoYW5nZScpO1xuICAgICAgICAgICAgZmlsZUVsZW0udW5iaW5kKCdjbGljaycpO1xuICAgICAgICAgICAgZmlsZUVsZW0uYmluZCgnY2hhbmdlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgICBmaWxlQXBpQ2hhbmdlRm4uYXBwbHkodGhpcywgW2V2dF0pO1xuICAgICAgICAgICAgICBjaGFuZ2VGbi5hcHBseSh0aGlzLCBbZXZ0XSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZpbGVFbGVtLmF0dHIoJ19fbmdmX2ZsYXNoXycsICd0cnVlJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxhYmVsLmFkZENsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcbiAgICAgICAgICBpZiAoIWlzSW5wdXRUeXBlRmlsZShlbGVtKSkge1xuICAgICAgICAgICAgbGFiZWwuY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpXG4gICAgICAgICAgICAgIC5jc3MoJ3RvcCcsIGdldE9mZnNldChlbGVtWzBdKS50b3AgKyAncHgnKS5jc3MoJ2xlZnQnLCBnZXRPZmZzZXQoZWxlbVswXSkubGVmdCArICdweCcpXG4gICAgICAgICAgICAgIC5jc3MoJ3dpZHRoJywgZWxlbVswXS5vZmZzZXRXaWR0aCArICdweCcpLmNzcygnaGVpZ2h0JywgZWxlbVswXS5vZmZzZXRIZWlnaHQgKyAncHgnKVxuICAgICAgICAgICAgICAuY3NzKCdmaWx0ZXInLCAnYWxwaGEob3BhY2l0eT0wKScpLmNzcygnZGlzcGxheScsIGVsZW0uY3NzKCdkaXNwbGF5JykpXG4gICAgICAgICAgICAgIC5jc3MoJ292ZXJmbG93JywgJ2hpZGRlbicpLmNzcygnei1pbmRleCcsICc5MDAwMDAnKVxuICAgICAgICAgICAgICAuY3NzKCd2aXNpYmlsaXR5JywgJ3Zpc2libGUnKTtcbiAgICAgICAgICAgIGZpbGVFbGVtLmNzcygnd2lkdGgnLCBlbGVtWzBdLm9mZnNldFdpZHRoICsgJ3B4JykuY3NzKCdoZWlnaHQnLCBlbGVtWzBdLm9mZnNldEhlaWdodCArICdweCcpXG4gICAgICAgICAgICAgIC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJykuY3NzKCd0b3AnLCAnMHB4JykuY3NzKCdsZWZ0JywgJzBweCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZWxlbS5iaW5kKCdtb3VzZWVudGVyJywgZml4SW5wdXRTdHlsZSk7XG5cbiAgICAgIHZhciBmaWxlQXBpQ2hhbmdlRm4gPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIHZhciBmaWxlcyA9IEZpbGVBUEkuZ2V0RmlsZXMoZXZ0KTtcbiAgICAgICAgLy9qdXN0IGEgZG91YmxlIGNoZWNrIGZvciAjMjMzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoZmlsZXNbaV0uc2l6ZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5zaXplID0gMDtcbiAgICAgICAgICBpZiAoZmlsZXNbaV0ubmFtZSA9PT0gdW5kZWZpbmVkKSBmaWxlc1tpXS5uYW1lID0gJ2ZpbGUnO1xuICAgICAgICAgIGlmIChmaWxlc1tpXS50eXBlID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnR5cGUgPSAndW5kZWZpbmVkJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWV2dC50YXJnZXQpIHtcbiAgICAgICAgICBldnQudGFyZ2V0ID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZXZ0LnRhcmdldC5maWxlcyA9IGZpbGVzO1xuICAgICAgICAvLyBpZiBldnQudGFyZ2V0LmZpbGVzIGlzIG5vdCB3cml0YWJsZSB1c2UgaGVscGVyIGZpZWxkXG4gICAgICAgIGlmIChldnQudGFyZ2V0LmZpbGVzICE9PSBmaWxlcykge1xuICAgICAgICAgIGV2dC5fX2ZpbGVzXyA9IGZpbGVzO1xuICAgICAgICB9XG4gICAgICAgIChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcykuaXRlbSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgcmV0dXJuIChldnQuX19maWxlc18gfHwgZXZ0LnRhcmdldC5maWxlcylbaV0gfHwgbnVsbDtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIEZpbGVBUEkuZGlzYWJsZUZpbGVJbnB1dCA9IGZ1bmN0aW9uIChlbGVtLCBkaXNhYmxlKSB7XG4gICAgICBpZiAoZGlzYWJsZSkge1xuICAgICAgICBlbGVtLnJlbW92ZUNsYXNzKCdqcy1maWxlYXBpLXdyYXBwZXInKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsZW0uYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn0pKCk7XG5cbmlmICghd2luZG93LkZpbGVSZWFkZXIpIHtcbiAgd2luZG93LkZpbGVSZWFkZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcywgbG9hZFN0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBmbikge1xuICAgICAgX3RoaXMubGlzdGVuZXJzW3R5cGVdID0gX3RoaXMubGlzdGVuZXJzW3R5cGVdIHx8IFtdO1xuICAgICAgX3RoaXMubGlzdGVuZXJzW3R5cGVdLnB1c2goZm4pO1xuICAgIH07XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgICBpZiAoX3RoaXMubGlzdGVuZXJzW3R5cGVdKSBfdGhpcy5saXN0ZW5lcnNbdHlwZV0uc3BsaWNlKF90aGlzLmxpc3RlbmVyc1t0eXBlXS5pbmRleE9mKGZuKSwgMSk7XG4gICAgfTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICB2YXIgbGlzdCA9IF90aGlzLmxpc3RlbmVyc1tldnQudHlwZV07XG4gICAgICBpZiAobGlzdCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBsaXN0W2ldLmNhbGwoX3RoaXMsIGV2dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMub25hYm9ydCA9IHRoaXMub25lcnJvciA9IHRoaXMub25sb2FkID0gdGhpcy5vbmxvYWRzdGFydCA9IHRoaXMub25sb2FkZW5kID0gdGhpcy5vbnByb2dyZXNzID0gbnVsbDtcblxuICAgIHZhciBjb25zdHJ1Y3RFdmVudCA9IGZ1bmN0aW9uICh0eXBlLCBldnQpIHtcbiAgICAgIHZhciBlID0ge3R5cGU6IHR5cGUsIHRhcmdldDogX3RoaXMsIGxvYWRlZDogZXZ0LmxvYWRlZCwgdG90YWw6IGV2dC50b3RhbCwgZXJyb3I6IGV2dC5lcnJvcn07XG4gICAgICBpZiAoZXZ0LnJlc3VsdCAhPSBudWxsKSBlLnRhcmdldC5yZXN1bHQgPSBldnQucmVzdWx0O1xuICAgICAgcmV0dXJuIGU7XG4gICAgfTtcbiAgICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICBpZiAoIWxvYWRTdGFydGVkKSB7XG4gICAgICAgIGxvYWRTdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgaWYgKF90aGlzLm9ubG9hZHN0YXJ0KSBfdGhpcy5vbmxvYWRzdGFydChjb25zdHJ1Y3RFdmVudCgnbG9hZHN0YXJ0JywgZXZ0KSk7XG4gICAgICB9XG4gICAgICB2YXIgZTtcbiAgICAgIGlmIChldnQudHlwZSA9PT0gJ2xvYWQnKSB7XG4gICAgICAgIGlmIChfdGhpcy5vbmxvYWRlbmQpIF90aGlzLm9ubG9hZGVuZChjb25zdHJ1Y3RFdmVudCgnbG9hZGVuZCcsIGV2dCkpO1xuICAgICAgICBlID0gY29uc3RydWN0RXZlbnQoJ2xvYWQnLCBldnQpO1xuICAgICAgICBpZiAoX3RoaXMub25sb2FkKSBfdGhpcy5vbmxvYWQoZSk7XG4gICAgICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgICB9IGVsc2UgaWYgKGV2dC50eXBlID09PSAncHJvZ3Jlc3MnKSB7XG4gICAgICAgIGUgPSBjb25zdHJ1Y3RFdmVudCgncHJvZ3Jlc3MnLCBldnQpO1xuICAgICAgICBpZiAoX3RoaXMub25wcm9ncmVzcykgX3RoaXMub25wcm9ncmVzcyhlKTtcbiAgICAgICAgX3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGUgPSBjb25zdHJ1Y3RFdmVudCgnZXJyb3InLCBldnQpO1xuICAgICAgICBpZiAoX3RoaXMub25lcnJvcikgX3RoaXMub25lcnJvcihlKTtcbiAgICAgICAgX3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMucmVhZEFzRGF0YVVSTCA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICBGaWxlQVBJLnJlYWRBc0RhdGFVUkwoZmlsZSwgbGlzdGVuZXIpO1xuICAgIH07XG4gICAgdGhpcy5yZWFkQXNUZXh0ID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIEZpbGVBUEkucmVhZEFzVGV4dChmaWxlLCBsaXN0ZW5lcik7XG4gICAgfTtcbiAgfTtcbn1cblxuLyoqIVxuICogQW5ndWxhckpTIGZpbGUgdXBsb2FkIGRpcmVjdGl2ZXMgYW5kIHNlcnZpY2VzLiBTdXBvb3J0czogZmlsZSB1cGxvYWQvZHJvcC9wYXN0ZSwgcmVzdW1lLCBjYW5jZWwvYWJvcnQsXG4gKiBwcm9ncmVzcywgcmVzaXplLCB0aHVtYm5haWwsIHByZXZpZXcsIHZhbGlkYXRpb24gYW5kIENPUlNcbiAqIEBhdXRob3IgIERhbmlhbCAgPGRhbmlhbC5mYXJpZEBnbWFpbC5jb20+XG4gKiBAdmVyc2lvbiAxMi4yLjEyXG4gKi9cblxuaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCAmJiAhKHdpbmRvdy5GaWxlQVBJICYmIEZpbGVBUEkuc2hvdWxkTG9hZCkpIHtcbiAgd2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZXRSZXF1ZXN0SGVhZGVyID0gKGZ1bmN0aW9uIChvcmlnKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChoZWFkZXIsIHZhbHVlKSB7XG4gICAgICBpZiAoaGVhZGVyID09PSAnX19zZXRYSFJfJykge1xuICAgICAgICB2YXIgdmFsID0gdmFsdWUodGhpcyk7XG4gICAgICAgIC8vIGZpeCBmb3IgYW5ndWxhciA8IDEuMi4wXG4gICAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICAgIHZhbCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3JpZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUuc2V0UmVxdWVzdEhlYWRlcik7XG59XG5cbnZhciBuZ0ZpbGVVcGxvYWQgPSBhbmd1bGFyLm1vZHVsZSgnbmdGaWxlVXBsb2FkJywgW10pO1xuXG5uZ0ZpbGVVcGxvYWQudmVyc2lvbiA9ICcxMi4yLjEyJztcblxubmdGaWxlVXBsb2FkLnNlcnZpY2UoJ1VwbG9hZEJhc2UnLCBbJyRodHRwJywgJyRxJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCRodHRwLCAkcSwgJHRpbWVvdXQpIHtcbiAgdmFyIHVwbG9hZCA9IHRoaXM7XG4gIHVwbG9hZC5wcm9taXNlc0NvdW50ID0gMDtcblxuICB0aGlzLmlzUmVzdW1lU3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB3aW5kb3cuQmxvYiAmJiB3aW5kb3cuQmxvYi5wcm90b3R5cGUuc2xpY2U7XG4gIH07XG5cbiAgdmFyIHJlc3VtZVN1cHBvcnRlZCA9IHRoaXMuaXNSZXN1bWVTdXBwb3J0ZWQoKTtcblxuICBmdW5jdGlvbiBzZW5kSHR0cChjb25maWcpIHtcbiAgICBjb25maWcubWV0aG9kID0gY29uZmlnLm1ldGhvZCB8fCAnUE9TVCc7XG4gICAgY29uZmlnLmhlYWRlcnMgPSBjb25maWcuaGVhZGVycyB8fCB7fTtcblxuICAgIHZhciBkZWZlcnJlZCA9IGNvbmZpZy5fZGVmZXJyZWQgPSBjb25maWcuX2RlZmVycmVkIHx8ICRxLmRlZmVyKCk7XG4gICAgdmFyIHByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgZnVuY3Rpb24gbm90aWZ5UHJvZ3Jlc3MoZSkge1xuICAgICAgaWYgKGRlZmVycmVkLm5vdGlmeSkge1xuICAgICAgICBkZWZlcnJlZC5ub3RpZnkoZSk7XG4gICAgICB9XG4gICAgICBpZiAocHJvbWlzZS5wcm9ncmVzc0Z1bmMpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHByb21pc2UucHJvZ3Jlc3NGdW5jKGUpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXROb3RpZnlFdmVudChuKSB7XG4gICAgICBpZiAoY29uZmlnLl9zdGFydCAhPSBudWxsICYmIHJlc3VtZVN1cHBvcnRlZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvYWRlZDogbi5sb2FkZWQgKyBjb25maWcuX3N0YXJ0LFxuICAgICAgICAgIHRvdGFsOiAoY29uZmlnLl9maWxlICYmIGNvbmZpZy5fZmlsZS5zaXplKSB8fCBuLnRvdGFsLFxuICAgICAgICAgIHR5cGU6IG4udHlwZSwgY29uZmlnOiBjb25maWcsXG4gICAgICAgICAgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZSwgdGFyZ2V0OiBuLnRhcmdldFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG47XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFjb25maWcuZGlzYWJsZVByb2dyZXNzKSB7XG4gICAgICBjb25maWcuaGVhZGVycy5fX3NldFhIUl8gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgaWYgKCF4aHIgfHwgIXhoci51cGxvYWQgfHwgIXhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcikgcmV0dXJuO1xuICAgICAgICAgIGNvbmZpZy5fX1hIUiA9IHhocjtcbiAgICAgICAgICBpZiAoY29uZmlnLnhockZuKSBjb25maWcueGhyRm4oeGhyKTtcbiAgICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAgICAgbm90aWZ5UHJvZ3Jlc3MoZ2V0Tm90aWZ5RXZlbnQoZSkpO1xuICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgICAvL2ZpeCBmb3IgZmlyZWZveCBub3QgZmlyaW5nIHVwbG9hZCBwcm9ncmVzcyBlbmQsIGFsc28gSUU4LTlcbiAgICAgICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgICAgICBlLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgICAgICAgbm90aWZ5UHJvZ3Jlc3MoZ2V0Tm90aWZ5RXZlbnQoZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIGZhbHNlKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBsb2FkV2l0aEFuZ3VsYXIoKSB7XG4gICAgICAkaHR0cChjb25maWcpLnRoZW4oZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICBpZiAocmVzdW1lU3VwcG9ydGVkICYmIGNvbmZpZy5fY2h1bmtTaXplICYmICFjb25maWcuX2ZpbmlzaGVkICYmIGNvbmZpZy5fZmlsZSkge1xuICAgICAgICAgICAgdmFyIGZpbGVTaXplID0gY29uZmlnLl9maWxlICYmIGNvbmZpZy5fZmlsZS5zaXplIHx8IDA7XG4gICAgICAgICAgICBub3RpZnlQcm9ncmVzcyh7XG4gICAgICAgICAgICAgICAgbG9hZGVkOiBNYXRoLm1pbihjb25maWcuX2VuZCwgZmlsZVNpemUpLFxuICAgICAgICAgICAgICAgIHRvdGFsOiBmaWxlU2l6ZSxcbiAgICAgICAgICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgICAgICAgICB0eXBlOiAncHJvZ3Jlc3MnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB1cGxvYWQudXBsb2FkKGNvbmZpZywgdHJ1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb25maWcuX2ZpbmlzaGVkKSBkZWxldGUgY29uZmlnLl9maW5pc2hlZDtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocik7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgICBkZWZlcnJlZC5ub3RpZnkobik7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXN1bWVTdXBwb3J0ZWQpIHtcbiAgICAgIHVwbG9hZFdpdGhBbmd1bGFyKCk7XG4gICAgfSBlbHNlIGlmIChjb25maWcuX2NodW5rU2l6ZSAmJiBjb25maWcuX2VuZCAmJiAhY29uZmlnLl9maW5pc2hlZCkge1xuICAgICAgY29uZmlnLl9zdGFydCA9IGNvbmZpZy5fZW5kO1xuICAgICAgY29uZmlnLl9lbmQgKz0gY29uZmlnLl9jaHVua1NpemU7XG4gICAgICB1cGxvYWRXaXRoQW5ndWxhcigpO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnLnJlc3VtZVNpemVVcmwpIHtcbiAgICAgICRodHRwLmdldChjb25maWcucmVzdW1lU2l6ZVVybCkudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgICBpZiAoY29uZmlnLnJlc3VtZVNpemVSZXNwb25zZVJlYWRlcikge1xuICAgICAgICAgIGNvbmZpZy5fc3RhcnQgPSBjb25maWcucmVzdW1lU2l6ZVJlc3BvbnNlUmVhZGVyKHJlc3AuZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uZmlnLl9zdGFydCA9IHBhcnNlSW50KChyZXNwLmRhdGEuc2l6ZSA9PSBudWxsID8gcmVzcC5kYXRhIDogcmVzcC5kYXRhLnNpemUpLnRvU3RyaW5nKCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWcuX2NodW5rU2l6ZSkge1xuICAgICAgICAgIGNvbmZpZy5fZW5kID0gY29uZmlnLl9zdGFydCArIGNvbmZpZy5fY2h1bmtTaXplO1xuICAgICAgICB9XG4gICAgICAgIHVwbG9hZFdpdGhBbmd1bGFyKCk7XG4gICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjb25maWcucmVzdW1lU2l6ZSkge1xuICAgICAgY29uZmlnLnJlc3VtZVNpemUoKS50aGVuKGZ1bmN0aW9uIChzaXplKSB7XG4gICAgICAgIGNvbmZpZy5fc3RhcnQgPSBzaXplO1xuICAgICAgICBpZiAoY29uZmlnLl9jaHVua1NpemUpIHtcbiAgICAgICAgICBjb25maWcuX2VuZCA9IGNvbmZpZy5fc3RhcnQgKyBjb25maWcuX2NodW5rU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICB1cGxvYWRXaXRoQW5ndWxhcigpO1xuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY29uZmlnLl9jaHVua1NpemUpIHtcbiAgICAgICAgY29uZmlnLl9zdGFydCA9IDA7XG4gICAgICAgIGNvbmZpZy5fZW5kID0gY29uZmlnLl9zdGFydCArIGNvbmZpZy5fY2h1bmtTaXplO1xuICAgICAgfVxuICAgICAgdXBsb2FkV2l0aEFuZ3VsYXIoKTtcbiAgICB9XG5cblxuICAgIHByb21pc2Uuc3VjY2VzcyA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBmbihyZXNwb25zZS5kYXRhLCByZXNwb25zZS5zdGF0dXMsIHJlc3BvbnNlLmhlYWRlcnMsIGNvbmZpZyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG5cbiAgICBwcm9taXNlLmVycm9yID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICBwcm9taXNlLnRoZW4obnVsbCwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHByb21pc2UucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHByb21pc2UucHJvZ3Jlc3NGdW5jID0gZm47XG4gICAgICBwcm9taXNlLnRoZW4obnVsbCwgbnVsbCwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgZm4obik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG4gICAgcHJvbWlzZS5hYm9ydCA9IHByb21pc2UucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoY29uZmlnLl9fWEhSKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBjb25maWcuX19YSFIuYWJvcnQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuICAgIHByb21pc2UueGhyID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICBjb25maWcueGhyRm4gPSAoZnVuY3Rpb24gKG9yaWdYaHJGbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChvcmlnWGhyRm4pIG9yaWdYaHJGbi5hcHBseShwcm9taXNlLCBhcmd1bWVudHMpO1xuICAgICAgICAgIGZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgICB9KShjb25maWcueGhyRm4pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHVwbG9hZC5wcm9taXNlc0NvdW50Kys7XG4gICAgaWYgKHByb21pc2VbJ2ZpbmFsbHknXSAmJiBwcm9taXNlWydmaW5hbGx5J10gaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcHJvbWlzZVsnZmluYWxseSddKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdXBsb2FkLnByb21pc2VzQ291bnQtLTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIHRoaXMuaXNVcGxvYWRJblByb2dyZXNzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB1cGxvYWQucHJvbWlzZXNDb3VudCA+IDA7XG4gIH07XG5cbiAgdGhpcy5yZW5hbWUgPSBmdW5jdGlvbiAoZmlsZSwgbmFtZSkge1xuICAgIGZpbGUubmdmTmFtZSA9IG5hbWU7XG4gICAgcmV0dXJuIGZpbGU7XG4gIH07XG5cbiAgdGhpcy5qc29uQmxvYiA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAodmFsICE9IG51bGwgJiYgIWFuZ3VsYXIuaXNTdHJpbmcodmFsKSkge1xuICAgICAgdmFsID0gSlNPTi5zdHJpbmdpZnkodmFsKTtcbiAgICB9XG4gICAgdmFyIGJsb2IgPSBuZXcgd2luZG93LkJsb2IoW3ZhbF0sIHt0eXBlOiAnYXBwbGljYXRpb24vanNvbid9KTtcbiAgICBibG9iLl9uZ2ZCbG9iID0gdHJ1ZTtcbiAgICByZXR1cm4gYmxvYjtcbiAgfTtcblxuICB0aGlzLmpzb24gPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgcmV0dXJuIGFuZ3VsYXIudG9Kc29uKHZhbCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gY29weShvYmopIHtcbiAgICB2YXIgY2xvbmUgPSB7fTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgY2xvbmVba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICB0aGlzLmlzRmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgcmV0dXJuIGZpbGUgIT0gbnVsbCAmJiAoZmlsZSBpbnN0YW5jZW9mIHdpbmRvdy5CbG9iIHx8IChmaWxlLmZsYXNoSWQgJiYgZmlsZS5uYW1lICYmIGZpbGUuc2l6ZSkpO1xuICB9O1xuXG4gIHRoaXMudXBsb2FkID0gZnVuY3Rpb24gKGNvbmZpZywgaW50ZXJuYWwpIHtcbiAgICBmdW5jdGlvbiB0b1Jlc3VtZUZpbGUoZmlsZSwgZm9ybURhdGEpIHtcbiAgICAgIGlmIChmaWxlLl9uZ2ZCbG9iKSByZXR1cm4gZmlsZTtcbiAgICAgIGNvbmZpZy5fZmlsZSA9IGNvbmZpZy5fZmlsZSB8fCBmaWxlO1xuICAgICAgaWYgKGNvbmZpZy5fc3RhcnQgIT0gbnVsbCAmJiByZXN1bWVTdXBwb3J0ZWQpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5fZW5kICYmIGNvbmZpZy5fZW5kID49IGZpbGUuc2l6ZSkge1xuICAgICAgICAgIGNvbmZpZy5fZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgIGNvbmZpZy5fZW5kID0gZmlsZS5zaXplO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzbGljZSA9IGZpbGUuc2xpY2UoY29uZmlnLl9zdGFydCwgY29uZmlnLl9lbmQgfHwgZmlsZS5zaXplKTtcbiAgICAgICAgc2xpY2UubmFtZSA9IGZpbGUubmFtZTtcbiAgICAgICAgc2xpY2UubmdmTmFtZSA9IGZpbGUubmdmTmFtZTtcbiAgICAgICAgaWYgKGNvbmZpZy5fY2h1bmtTaXplKSB7XG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdfY2h1bmtTaXplJywgY29uZmlnLl9jaHVua1NpemUpO1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnX2N1cnJlbnRDaHVua1NpemUnLCBjb25maWcuX2VuZCAtIGNvbmZpZy5fc3RhcnQpO1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnX2NodW5rTnVtYmVyJywgTWF0aC5mbG9vcihjb25maWcuX3N0YXJ0IC8gY29uZmlnLl9jaHVua1NpemUpKTtcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ190b3RhbFNpemUnLCBjb25maWcuX2ZpbGUuc2l6ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNsaWNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZpbGU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkRmllbGRUb0Zvcm1EYXRhKGZvcm1EYXRhLCB2YWwsIGtleSkge1xuICAgICAgaWYgKHZhbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGF0ZSh2YWwpKSB7XG4gICAgICAgICAgdmFsID0gdmFsLnRvSVNPU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcodmFsKSkge1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChrZXksIHZhbCk7XG4gICAgICAgIH0gZWxzZSBpZiAodXBsb2FkLmlzRmlsZSh2YWwpKSB7XG4gICAgICAgICAgdmFyIGZpbGUgPSB0b1Jlc3VtZUZpbGUodmFsLCBmb3JtRGF0YSk7XG4gICAgICAgICAgdmFyIHNwbGl0ID0ga2V5LnNwbGl0KCcsJyk7XG4gICAgICAgICAgaWYgKHNwbGl0WzFdKSB7XG4gICAgICAgICAgICBmaWxlLm5nZk5hbWUgPSBzcGxpdFsxXS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJyk7XG4gICAgICAgICAgICBrZXkgPSBzcGxpdFswXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uZmlnLl9maWxlS2V5ID0gY29uZmlnLl9maWxlS2V5IHx8IGtleTtcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoa2V5LCBmaWxlLCBmaWxlLm5nZk5hbWUgfHwgZmlsZS5uYW1lKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdCh2YWwpKSB7XG4gICAgICAgICAgICBpZiAodmFsLiQkbmdmQ2lyY3VsYXJEZXRlY3Rpb24pIHRocm93ICduZ0ZpbGVVcGxvYWQ6IENpcmN1bGFyIHJlZmVyZW5jZSBpbiBjb25maWcuZGF0YS4gTWFrZSBzdXJlIHNwZWNpZmllZCBkYXRhIGZvciBVcGxvYWQudXBsb2FkKCkgaGFzIG5vIGNpcmN1bGFyIHJlZmVyZW5jZTogJyArIGtleTtcblxuICAgICAgICAgICAgdmFsLiQkbmdmQ2lyY3VsYXJEZXRlY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiB2YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsLmhhc093blByb3BlcnR5KGspICYmIGsgIT09ICckJG5nZkNpcmN1bGFyRGV0ZWN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdEtleSA9IGNvbmZpZy5vYmplY3RLZXkgPT0gbnVsbCA/ICdbaV0nIDogY29uZmlnLm9iamVjdEtleTtcbiAgICAgICAgICAgICAgICAgIGlmICh2YWwubGVuZ3RoICYmIHBhcnNlSW50KGspID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0S2V5ID0gY29uZmlnLmFycmF5S2V5ID09IG51bGwgPyBvYmplY3RLZXkgOiBjb25maWcuYXJyYXlLZXk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBhZGRGaWVsZFRvRm9ybURhdGEoZm9ybURhdGEsIHZhbFtrXSwga2V5ICsgb2JqZWN0S2V5LnJlcGxhY2UoL1tpa10vZywgaykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgZGVsZXRlIHZhbC4kJG5nZkNpcmN1bGFyRGV0ZWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoa2V5LCB2YWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpZ2VzdENvbmZpZygpIHtcbiAgICAgIGNvbmZpZy5fY2h1bmtTaXplID0gdXBsb2FkLnRyYW5zbGF0ZVNjYWxhcnMoY29uZmlnLnJlc3VtZUNodW5rU2l6ZSk7XG4gICAgICBjb25maWcuX2NodW5rU2l6ZSA9IGNvbmZpZy5fY2h1bmtTaXplID8gcGFyc2VJbnQoY29uZmlnLl9jaHVua1NpemUudG9TdHJpbmcoKSkgOiBudWxsO1xuXG4gICAgICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuICAgICAgY29uZmlnLmhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gdW5kZWZpbmVkO1xuICAgICAgY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgPSBjb25maWcudHJhbnNmb3JtUmVxdWVzdCA/XG4gICAgICAgIChhbmd1bGFyLmlzQXJyYXkoY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QpID9cbiAgICAgICAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdCA6IFtjb25maWcudHJhbnNmb3JtUmVxdWVzdF0pIDogW107XG4gICAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdC5wdXNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHZhciBmb3JtRGF0YSA9IG5ldyB3aW5kb3cuRm9ybURhdGEoKSwga2V5O1xuICAgICAgICBkYXRhID0gZGF0YSB8fCBjb25maWcuZmllbGRzIHx8IHt9O1xuICAgICAgICBpZiAoY29uZmlnLmZpbGUpIHtcbiAgICAgICAgICBkYXRhLmZpbGUgPSBjb25maWcuZmlsZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgdmFyIHZhbCA9IGRhdGFba2V5XTtcbiAgICAgICAgICAgIGlmIChjb25maWcuZm9ybURhdGFBcHBlbmRlcikge1xuICAgICAgICAgICAgICBjb25maWcuZm9ybURhdGFBcHBlbmRlcihmb3JtRGF0YSwga2V5LCB2YWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYWRkRmllbGRUb0Zvcm1EYXRhKGZvcm1EYXRhLCB2YWwsIGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm1EYXRhO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFpbnRlcm5hbCkgY29uZmlnID0gY29weShjb25maWcpO1xuICAgIGlmICghY29uZmlnLl9pc0RpZ2VzdGVkKSB7XG4gICAgICBjb25maWcuX2lzRGlnZXN0ZWQgPSB0cnVlO1xuICAgICAgZGlnZXN0Q29uZmlnKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG4gIH07XG5cbiAgdGhpcy5odHRwID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIGNvbmZpZyA9IGNvcHkoY29uZmlnKTtcbiAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IHx8IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGlmICgod2luZG93LkFycmF5QnVmZmVyICYmIGRhdGEgaW5zdGFuY2VvZiB3aW5kb3cuQXJyYXlCdWZmZXIpIHx8IGRhdGEgaW5zdGFuY2VvZiB3aW5kb3cuQmxvYikge1xuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkaHR0cC5kZWZhdWx0cy50cmFuc2Zvcm1SZXF1ZXN0WzBdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIGNvbmZpZy5fY2h1bmtTaXplID0gdXBsb2FkLnRyYW5zbGF0ZVNjYWxhcnMoY29uZmlnLnJlc3VtZUNodW5rU2l6ZSk7XG4gICAgY29uZmlnLl9jaHVua1NpemUgPSBjb25maWcuX2NodW5rU2l6ZSA/IHBhcnNlSW50KGNvbmZpZy5fY2h1bmtTaXplLnRvU3RyaW5nKCkpIDogbnVsbDtcblxuICAgIHJldHVybiBzZW5kSHR0cChjb25maWcpO1xuICB9O1xuXG4gIHRoaXMudHJhbnNsYXRlU2NhbGFycyA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhzdHIpKSB7XG4gICAgICBpZiAoc3RyLnNlYXJjaCgva2IvaSkgPT09IHN0ci5sZW5ndGggLSAyKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDIpICogMTAyNCk7XG4gICAgICB9IGVsc2UgaWYgKHN0ci5zZWFyY2goL21iL2kpID09PSBzdHIubGVuZ3RoIC0gMikge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGggLSAyKSAqIDEwNDg1NzYpO1xuICAgICAgfSBlbHNlIGlmIChzdHIuc2VhcmNoKC9nYi9pKSA9PT0gc3RyLmxlbmd0aCAtIDIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyLnN1YnN0cmluZygwLCBzdHIubGVuZ3RoIC0gMikgKiAxMDczNzQxODI0KTtcbiAgICAgIH0gZWxzZSBpZiAoc3RyLnNlYXJjaCgvYi9pKSA9PT0gc3RyLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyLnN1YnN0cmluZygwLCBzdHIubGVuZ3RoIC0gMSkpO1xuICAgICAgfSBlbHNlIGlmIChzdHIuc2VhcmNoKC9zL2kpID09PSBzdHIubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGggLSAxKSk7XG4gICAgICB9IGVsc2UgaWYgKHN0ci5zZWFyY2goL20vaSkgPT09IHN0ci5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDEpICogNjApO1xuICAgICAgfSBlbHNlIGlmIChzdHIuc2VhcmNoKC9oL2kpID09PSBzdHIubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGggLSAxKSAqIDM2MDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3RyO1xuICB9O1xuXG4gIHRoaXMudXJsVG9CbG9iID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICAkaHR0cCh7dXJsOiB1cmwsIG1ldGhvZDogJ2dldCcsIHJlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJ30pLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgIHZhciBhcnJheUJ1ZmZlclZpZXcgPSBuZXcgVWludDhBcnJheShyZXNwLmRhdGEpO1xuICAgICAgdmFyIHR5cGUgPSByZXNwLmhlYWRlcnMoJ2NvbnRlbnQtdHlwZScpIHx8ICdpbWFnZS9XZWJQJztcbiAgICAgIHZhciBibG9iID0gbmV3IHdpbmRvdy5CbG9iKFthcnJheUJ1ZmZlclZpZXddLCB7dHlwZTogdHlwZX0pO1xuICAgICAgdmFyIG1hdGNoZXMgPSB1cmwubWF0Y2goLy4qXFwvKC4rPykoXFw/LiopPyQvKTtcbiAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgYmxvYi5uYW1lID0gbWF0Y2hlc1sxXTtcbiAgICAgIH1cbiAgICAgIGRlZmVyLnJlc29sdmUoYmxvYik7XG4gICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGRlZmVyLnJlamVjdChlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgfTtcblxuICB0aGlzLnNldERlZmF1bHRzID0gZnVuY3Rpb24gKGRlZmF1bHRzKSB7XG4gICAgdGhpcy5kZWZhdWx0cyA9IGRlZmF1bHRzIHx8IHt9O1xuICB9O1xuXG4gIHRoaXMuZGVmYXVsdHMgPSB7fTtcbiAgdGhpcy52ZXJzaW9uID0gbmdGaWxlVXBsb2FkLnZlcnNpb247XG59XG5cbl0pO1xuXG5uZ0ZpbGVVcGxvYWQuc2VydmljZSgnVXBsb2FkJywgWyckcGFyc2UnLCAnJHRpbWVvdXQnLCAnJGNvbXBpbGUnLCAnJHEnLCAnVXBsb2FkRXhpZicsIGZ1bmN0aW9uICgkcGFyc2UsICR0aW1lb3V0LCAkY29tcGlsZSwgJHEsIFVwbG9hZEV4aWYpIHtcbiAgdmFyIHVwbG9hZCA9IFVwbG9hZEV4aWY7XG4gIHVwbG9hZC5nZXRBdHRyV2l0aERlZmF1bHRzID0gZnVuY3Rpb24gKGF0dHIsIG5hbWUpIHtcbiAgICBpZiAoYXR0cltuYW1lXSAhPSBudWxsKSByZXR1cm4gYXR0cltuYW1lXTtcbiAgICB2YXIgZGVmID0gdXBsb2FkLmRlZmF1bHRzW25hbWVdO1xuICAgIHJldHVybiAoZGVmID09IG51bGwgPyBkZWYgOiAoYW5ndWxhci5pc1N0cmluZyhkZWYpID8gZGVmIDogSlNPTi5zdHJpbmdpZnkoZGVmKSkpO1xuICB9O1xuXG4gIHVwbG9hZC5hdHRyR2V0dGVyID0gZnVuY3Rpb24gKG5hbWUsIGF0dHIsIHNjb3BlLCBwYXJhbXMpIHtcbiAgICB2YXIgYXR0clZhbCA9IHRoaXMuZ2V0QXR0cldpdGhEZWZhdWx0cyhhdHRyLCBuYW1lKTtcbiAgICBpZiAoc2NvcGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChwYXJhbXMpIHtcbiAgICAgICAgICByZXR1cm4gJHBhcnNlKGF0dHJWYWwpKHNjb3BlLCBwYXJhbXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiAkcGFyc2UoYXR0clZhbCkoc2NvcGUpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGhhbmdsZSBzdHJpbmcgdmFsdWUgd2l0aG91dCBzaW5nbGUgcW91dGVcbiAgICAgICAgaWYgKG5hbWUuc2VhcmNoKC9taW58bWF4fHBhdHRlcm4vaSkpIHtcbiAgICAgICAgICByZXR1cm4gYXR0clZhbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhdHRyVmFsO1xuICAgIH1cbiAgfTtcblxuICB1cGxvYWQuc2hvdWxkVXBkYXRlT24gPSBmdW5jdGlvbiAodHlwZSwgYXR0ciwgc2NvcGUpIHtcbiAgICB2YXIgbW9kZWxPcHRpb25zID0gdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZk1vZGVsT3B0aW9ucycsIGF0dHIsIHNjb3BlKTtcbiAgICBpZiAobW9kZWxPcHRpb25zICYmIG1vZGVsT3B0aW9ucy51cGRhdGVPbikge1xuICAgICAgcmV0dXJuIG1vZGVsT3B0aW9ucy51cGRhdGVPbi5zcGxpdCgnICcpLmluZGV4T2YodHlwZSkgPiAtMTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgdXBsb2FkLmVtcHR5UHJvbWlzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZCA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgZC5yZXNvbHZlLmFwcGx5KGQsIGFyZ3MpO1xuICAgIH0pO1xuICAgIHJldHVybiBkLnByb21pc2U7XG4gIH07XG5cbiAgdXBsb2FkLnJlamVjdFByb21pc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGQgPSAkcS5kZWZlcigpO1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGQucmVqZWN0LmFwcGx5KGQsIGFyZ3MpO1xuICAgIH0pO1xuICAgIHJldHVybiBkLnByb21pc2U7XG4gIH07XG5cbiAgdXBsb2FkLmhhcHB5UHJvbWlzZSA9IGZ1bmN0aW9uIChwcm9taXNlLCBkYXRhKSB7XG4gICAgdmFyIGQgPSAkcS5kZWZlcigpO1xuICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICBkLnJlc29sdmUocmVzdWx0KTtcbiAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9KTtcbiAgICAgIGQucmVzb2x2ZShkYXRhKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZC5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGFwcGx5RXhpZlJvdGF0aW9ucyhmaWxlcywgYXR0ciwgc2NvcGUpIHtcbiAgICB2YXIgcHJvbWlzZXMgPSBbdXBsb2FkLmVtcHR5UHJvbWlzZSgpXTtcbiAgICBhbmd1bGFyLmZvckVhY2goZmlsZXMsIGZ1bmN0aW9uIChmLCBpKSB7XG4gICAgICBpZiAoZi50eXBlLmluZGV4T2YoJ2ltYWdlL2pwZWcnKSA9PT0gMCAmJiB1cGxvYWQuYXR0ckdldHRlcignbmdmRml4T3JpZW50YXRpb24nLCBhdHRyLCBzY29wZSwgeyRmaWxlOiBmfSkpIHtcbiAgICAgICAgcHJvbWlzZXMucHVzaCh1cGxvYWQuaGFwcHlQcm9taXNlKHVwbG9hZC5hcHBseUV4aWZSb3RhdGlvbihmKSwgZikudGhlbihmdW5jdGlvbiAoZml4ZWRGaWxlKSB7XG4gICAgICAgICAgZmlsZXMuc3BsaWNlKGksIDEsIGZpeGVkRmlsZSk7XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gJHEuYWxsKHByb21pc2VzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc2l6ZUZpbGUoZmlsZXMsIGF0dHIsIHNjb3BlLCBuZ01vZGVsKSB7XG4gICAgdmFyIHJlc2l6ZVZhbCA9IHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZSZXNpemUnLCBhdHRyLCBzY29wZSk7XG4gICAgaWYgKCFyZXNpemVWYWwgfHwgIXVwbG9hZC5pc1Jlc2l6ZVN1cHBvcnRlZCgpIHx8ICFmaWxlcy5sZW5ndGgpIHJldHVybiB1cGxvYWQuZW1wdHlQcm9taXNlKCk7XG4gICAgaWYgKHJlc2l6ZVZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgICAgcmV0dXJuIHJlc2l6ZVZhbChmaWxlcykudGhlbihmdW5jdGlvbiAocCkge1xuICAgICAgICByZXNpemVXaXRoUGFyYW1zKHAsIGZpbGVzLCBhdHRyLCBzY29wZSwgbmdNb2RlbCkudGhlbihmdW5jdGlvbiAocikge1xuICAgICAgICAgIGRlZmVyLnJlc29sdmUocik7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGRlZmVyLnJlamVjdChlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzaXplV2l0aFBhcmFtcyhyZXNpemVWYWwsIGZpbGVzLCBhdHRyLCBzY29wZSwgbmdNb2RlbCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVzaXplV2l0aFBhcmFtcyhwYXJhbXMsIGZpbGVzLCBhdHRyLCBzY29wZSwgbmdNb2RlbCkge1xuICAgIHZhciBwcm9taXNlcyA9IFt1cGxvYWQuZW1wdHlQcm9taXNlKCldO1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlRmlsZShmLCBpKSB7XG4gICAgICBpZiAoZi50eXBlLmluZGV4T2YoJ2ltYWdlJykgPT09IDApIHtcbiAgICAgICAgaWYgKHBhcmFtcy5wYXR0ZXJuICYmICF1cGxvYWQudmFsaWRhdGVQYXR0ZXJuKGYsIHBhcmFtcy5wYXR0ZXJuKSkgcmV0dXJuO1xuICAgICAgICBwYXJhbXMucmVzaXplSWYgPSBmdW5jdGlvbiAod2lkdGgsIGhlaWdodCkge1xuICAgICAgICAgIHJldHVybiB1cGxvYWQuYXR0ckdldHRlcignbmdmUmVzaXplSWYnLCBhdHRyLCBzY29wZSxcbiAgICAgICAgICAgIHskd2lkdGg6IHdpZHRoLCAkaGVpZ2h0OiBoZWlnaHQsICRmaWxlOiBmfSk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBwcm9taXNlID0gdXBsb2FkLnJlc2l6ZShmLCBwYXJhbXMpO1xuICAgICAgICBwcm9taXNlcy5wdXNoKHByb21pc2UpO1xuICAgICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc2l6ZWRGaWxlKSB7XG4gICAgICAgICAgZmlsZXMuc3BsaWNlKGksIDEsIHJlc2l6ZWRGaWxlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBmLiRlcnJvciA9ICdyZXNpemUnO1xuICAgICAgICAgIChmLiRlcnJvck1lc3NhZ2VzID0gKGYuJGVycm9yTWVzc2FnZXMgfHwge30pKS5yZXNpemUgPSB0cnVlO1xuICAgICAgICAgIGYuJGVycm9yUGFyYW0gPSAoZSA/IChlLm1lc3NhZ2UgPyBlLm1lc3NhZ2UgOiBlKSArICc6ICcgOiAnJykgKyAoZiAmJiBmLm5hbWUpO1xuICAgICAgICAgIG5nTW9kZWwuJG5nZlZhbGlkYXRpb25zLnB1c2goe25hbWU6ICdyZXNpemUnLCB2YWxpZDogZmFsc2V9KTtcbiAgICAgICAgICB1cGxvYWQuYXBwbHlNb2RlbFZhbGlkYXRpb24obmdNb2RlbCwgZmlsZXMpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBoYW5kbGVGaWxlKGZpbGVzW2ldLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuICRxLmFsbChwcm9taXNlcyk7XG4gIH1cblxuICB1cGxvYWQudXBkYXRlTW9kZWwgPSBmdW5jdGlvbiAobmdNb2RlbCwgYXR0ciwgc2NvcGUsIGZpbGVDaGFuZ2UsIGZpbGVzLCBldnQsIG5vRGVsYXkpIHtcbiAgICBmdW5jdGlvbiB1cGRhdGUoZmlsZXMsIGludmFsaWRGaWxlcywgbmV3RmlsZXMsIGR1cEZpbGVzLCBpc1NpbmdsZU1vZGVsKSB7XG4gICAgICBhdHRyLiQkbmdmUHJldlZhbGlkRmlsZXMgPSBmaWxlcztcbiAgICAgIGF0dHIuJCRuZ2ZQcmV2SW52YWxpZEZpbGVzID0gaW52YWxpZEZpbGVzO1xuICAgICAgdmFyIGZpbGUgPSBmaWxlcyAmJiBmaWxlcy5sZW5ndGggPyBmaWxlc1swXSA6IG51bGw7XG4gICAgICB2YXIgaW52YWxpZEZpbGUgPSBpbnZhbGlkRmlsZXMgJiYgaW52YWxpZEZpbGVzLmxlbmd0aCA/IGludmFsaWRGaWxlc1swXSA6IG51bGw7XG5cbiAgICAgIGlmIChuZ01vZGVsKSB7XG4gICAgICAgIHVwbG9hZC5hcHBseU1vZGVsVmFsaWRhdGlvbihuZ01vZGVsLCBmaWxlcyk7XG4gICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZShpc1NpbmdsZU1vZGVsID8gZmlsZSA6IGZpbGVzKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpbGVDaGFuZ2UpIHtcbiAgICAgICAgJHBhcnNlKGZpbGVDaGFuZ2UpKHNjb3BlLCB7XG4gICAgICAgICAgJGZpbGVzOiBmaWxlcyxcbiAgICAgICAgICAkZmlsZTogZmlsZSxcbiAgICAgICAgICAkbmV3RmlsZXM6IG5ld0ZpbGVzLFxuICAgICAgICAgICRkdXBsaWNhdGVGaWxlczogZHVwRmlsZXMsXG4gICAgICAgICAgJGludmFsaWRGaWxlczogaW52YWxpZEZpbGVzLFxuICAgICAgICAgICRpbnZhbGlkRmlsZTogaW52YWxpZEZpbGUsXG4gICAgICAgICAgJGV2ZW50OiBldnRcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBpbnZhbGlkTW9kZWwgPSB1cGxvYWQuYXR0ckdldHRlcignbmdmTW9kZWxJbnZhbGlkJywgYXR0cik7XG4gICAgICBpZiAoaW52YWxpZE1vZGVsKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkcGFyc2UoaW52YWxpZE1vZGVsKS5hc3NpZ24oc2NvcGUsIGlzU2luZ2xlTW9kZWwgPyBpbnZhbGlkRmlsZSA6IGludmFsaWRGaWxlcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBzY29wZSBhcHBseSBjaGFuZ2VzXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgYWxsTmV3RmlsZXMsIGR1cEZpbGVzID0gW10sIHByZXZWYWxpZEZpbGVzLCBwcmV2SW52YWxpZEZpbGVzLFxuICAgICAgaW52YWxpZHMgPSBbXSwgdmFsaWRzID0gW107XG5cbiAgICBmdW5jdGlvbiByZW1vdmVEdXBsaWNhdGVzKCkge1xuICAgICAgZnVuY3Rpb24gZXF1YWxzKGYxLCBmMikge1xuICAgICAgICByZXR1cm4gZjEubmFtZSA9PT0gZjIubmFtZSAmJiAoZjEuJG5nZk9yaWdTaXplIHx8IGYxLnNpemUpID09PSAoZjIuJG5nZk9yaWdTaXplIHx8IGYyLnNpemUpICYmXG4gICAgICAgICAgZjEudHlwZSA9PT0gZjIudHlwZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaXNJblByZXZGaWxlcyhmKSB7XG4gICAgICAgIHZhciBqO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgcHJldlZhbGlkRmlsZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoZXF1YWxzKGYsIHByZXZWYWxpZEZpbGVzW2pdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBwcmV2SW52YWxpZEZpbGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgaWYgKGVxdWFscyhmLCBwcmV2SW52YWxpZEZpbGVzW2pdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaWYgKGZpbGVzKSB7XG4gICAgICAgIGFsbE5ld0ZpbGVzID0gW107XG4gICAgICAgIGR1cEZpbGVzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaXNJblByZXZGaWxlcyhmaWxlc1tpXSkpIHtcbiAgICAgICAgICAgIGR1cEZpbGVzLnB1c2goZmlsZXNbaV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbGxOZXdGaWxlcy5wdXNoKGZpbGVzW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b0FycmF5KHYpIHtcbiAgICAgIHJldHVybiBhbmd1bGFyLmlzQXJyYXkodikgPyB2IDogW3ZdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2l6ZUFuZFVwZGF0ZSgpIHtcbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZU1vZGVsKCkge1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdXBkYXRlKGtlZXAgPyBwcmV2VmFsaWRGaWxlcy5jb25jYXQodmFsaWRzKSA6IHZhbGlkcyxcbiAgICAgICAgICAgIGtlZXAgPyBwcmV2SW52YWxpZEZpbGVzLmNvbmNhdChpbnZhbGlkcykgOiBpbnZhbGlkcyxcbiAgICAgICAgICAgIGZpbGVzLCBkdXBGaWxlcywgaXNTaW5nbGVNb2RlbCk7XG4gICAgICAgIH0sIG9wdGlvbnMgJiYgb3B0aW9ucy5kZWJvdW5jZSA/IG9wdGlvbnMuZGVib3VuY2UuY2hhbmdlIHx8IG9wdGlvbnMuZGVib3VuY2UgOiAwKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlc2l6aW5nRmlsZXMgPSB2YWxpZGF0ZUFmdGVyUmVzaXplID8gYWxsTmV3RmlsZXMgOiB2YWxpZHM7XG4gICAgICByZXNpemVGaWxlKHJlc2l6aW5nRmlsZXMsIGF0dHIsIHNjb3BlLCBuZ01vZGVsKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHZhbGlkYXRlQWZ0ZXJSZXNpemUpIHtcbiAgICAgICAgICB1cGxvYWQudmFsaWRhdGUoYWxsTmV3RmlsZXMsIGtlZXAgPyBwcmV2VmFsaWRGaWxlcy5sZW5ndGggOiAwLCBuZ01vZGVsLCBhdHRyLCBzY29wZSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICh2YWxpZGF0aW9uUmVzdWx0KSB7XG4gICAgICAgICAgICAgIHZhbGlkcyA9IHZhbGlkYXRpb25SZXN1bHQudmFsaWRzRmlsZXM7XG4gICAgICAgICAgICAgIGludmFsaWRzID0gdmFsaWRhdGlvblJlc3VsdC5pbnZhbGlkc0ZpbGVzO1xuICAgICAgICAgICAgICB1cGRhdGVNb2RlbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXBkYXRlTW9kZWwoKTtcbiAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc2l6aW5nRmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgZiA9IHJlc2l6aW5nRmlsZXNbaV07XG4gICAgICAgICAgaWYgKGYuJGVycm9yID09PSAncmVzaXplJykge1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gdmFsaWRzLmluZGV4T2YoZik7XG4gICAgICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgICB2YWxpZHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgaW52YWxpZHMucHVzaChmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVwZGF0ZU1vZGVsKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBwcmV2VmFsaWRGaWxlcyA9IGF0dHIuJCRuZ2ZQcmV2VmFsaWRGaWxlcyB8fCBbXTtcbiAgICBwcmV2SW52YWxpZEZpbGVzID0gYXR0ci4kJG5nZlByZXZJbnZhbGlkRmlsZXMgfHwgW107XG4gICAgaWYgKG5nTW9kZWwgJiYgbmdNb2RlbC4kbW9kZWxWYWx1ZSkge1xuICAgICAgcHJldlZhbGlkRmlsZXMgPSB0b0FycmF5KG5nTW9kZWwuJG1vZGVsVmFsdWUpO1xuICAgIH1cblxuICAgIHZhciBrZWVwID0gdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZktlZXAnLCBhdHRyLCBzY29wZSk7XG4gICAgYWxsTmV3RmlsZXMgPSAoZmlsZXMgfHwgW10pLnNsaWNlKDApO1xuICAgIGlmIChrZWVwID09PSAnZGlzdGluY3QnIHx8IHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZLZWVwRGlzdGluY3QnLCBhdHRyLCBzY29wZSkgPT09IHRydWUpIHtcbiAgICAgIHJlbW92ZUR1cGxpY2F0ZXMoYXR0ciwgc2NvcGUpO1xuICAgIH1cblxuICAgIHZhciBpc1NpbmdsZU1vZGVsID0gIWtlZXAgJiYgIXVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZNdWx0aXBsZScsIGF0dHIsIHNjb3BlKSAmJiAhdXBsb2FkLmF0dHJHZXR0ZXIoJ211bHRpcGxlJywgYXR0cik7XG5cbiAgICBpZiAoa2VlcCAmJiAhYWxsTmV3RmlsZXMubGVuZ3RoKSByZXR1cm47XG5cbiAgICB1cGxvYWQuYXR0ckdldHRlcignbmdmQmVmb3JlTW9kZWxDaGFuZ2UnLCBhdHRyLCBzY29wZSwge1xuICAgICAgJGZpbGVzOiBmaWxlcyxcbiAgICAgICRmaWxlOiBmaWxlcyAmJiBmaWxlcy5sZW5ndGggPyBmaWxlc1swXSA6IG51bGwsXG4gICAgICAkbmV3RmlsZXM6IGFsbE5ld0ZpbGVzLFxuICAgICAgJGR1cGxpY2F0ZUZpbGVzOiBkdXBGaWxlcyxcbiAgICAgICRldmVudDogZXZ0XG4gICAgfSk7XG5cbiAgICB2YXIgdmFsaWRhdGVBZnRlclJlc2l6ZSA9IHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZWYWxpZGF0ZUFmdGVyUmVzaXplJywgYXR0ciwgc2NvcGUpO1xuXG4gICAgdmFyIG9wdGlvbnMgPSB1cGxvYWQuYXR0ckdldHRlcignbmdmTW9kZWxPcHRpb25zJywgYXR0ciwgc2NvcGUpO1xuICAgIHVwbG9hZC52YWxpZGF0ZShhbGxOZXdGaWxlcywga2VlcCA/IHByZXZWYWxpZEZpbGVzLmxlbmd0aCA6IDAsIG5nTW9kZWwsIGF0dHIsIHNjb3BlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICAgIGlmIChub0RlbGF5KSB7XG4gICAgICAgIHVwZGF0ZShhbGxOZXdGaWxlcywgW10sIGZpbGVzLCBkdXBGaWxlcywgaXNTaW5nbGVNb2RlbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoKCFvcHRpb25zIHx8ICFvcHRpb25zLmFsbG93SW52YWxpZCkgJiYgIXZhbGlkYXRlQWZ0ZXJSZXNpemUpIHtcbiAgICAgICAgICB2YWxpZHMgPSB2YWxpZGF0aW9uUmVzdWx0LnZhbGlkRmlsZXM7XG4gICAgICAgICAgaW52YWxpZHMgPSB2YWxpZGF0aW9uUmVzdWx0LmludmFsaWRGaWxlcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YWxpZHMgPSBhbGxOZXdGaWxlcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodXBsb2FkLmF0dHJHZXR0ZXIoJ25nZkZpeE9yaWVudGF0aW9uJywgYXR0ciwgc2NvcGUpICYmIHVwbG9hZC5pc0V4aWZTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgIGFwcGx5RXhpZlJvdGF0aW9ucyh2YWxpZHMsIGF0dHIsIHNjb3BlKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc2l6ZUFuZFVwZGF0ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc2l6ZUFuZFVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIHVwbG9hZDtcbn1dKTtcblxubmdGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdmU2VsZWN0JywgWyckcGFyc2UnLCAnJHRpbWVvdXQnLCAnJGNvbXBpbGUnLCAnVXBsb2FkJywgZnVuY3Rpb24gKCRwYXJzZSwgJHRpbWVvdXQsICRjb21waWxlLCBVcGxvYWQpIHtcbiAgdmFyIGdlbmVyYXRlZEVsZW1zID0gW107XG5cbiAgZnVuY3Rpb24gaXNEZWxheWVkQ2xpY2tTdXBwb3J0ZWQodWEpIHtcbiAgICAvLyBmaXggZm9yIGFuZHJvaWQgbmF0aXZlIGJyb3dzZXIgPCA0LjQgYW5kIHNhZmFyaSB3aW5kb3dzXG4gICAgdmFyIG0gPSB1YS5tYXRjaCgvQW5kcm9pZFteXFxkXSooXFxkKylcXC4oXFxkKykvKTtcbiAgICBpZiAobSAmJiBtLmxlbmd0aCA+IDIpIHtcbiAgICAgIHZhciB2ID0gVXBsb2FkLmRlZmF1bHRzLmFuZHJvaWRGaXhNaW5vclZlcnNpb24gfHwgNDtcbiAgICAgIHJldHVybiBwYXJzZUludChtWzFdKSA8IDQgfHwgKHBhcnNlSW50KG1bMV0pID09PSB2ICYmIHBhcnNlSW50KG1bMl0pIDwgdik7XG4gICAgfVxuXG4gICAgLy8gc2FmYXJpIG9uIHdpbmRvd3NcbiAgICByZXR1cm4gdWEuaW5kZXhPZignQ2hyb21lJykgPT09IC0xICYmIC8uKldpbmRvd3MuKlNhZmFyaS4qLy50ZXN0KHVhKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmtGaWxlU2VsZWN0KHNjb3BlLCBlbGVtLCBhdHRyLCBuZ01vZGVsLCAkcGFyc2UsICR0aW1lb3V0LCAkY29tcGlsZSwgdXBsb2FkKSB7XG4gICAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZTZWxlY3QgKi9cbiAgICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZkNoYW5nZSAqL1xuICAgIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdNb2RlbCAqL1xuICAgIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmTW9kZWxPcHRpb25zICovXG4gICAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZNdWx0aXBsZSAqL1xuICAgIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmQ2FwdHVyZSAqL1xuICAgIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmVmFsaWRhdGUgKi9cbiAgICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZktlZXAgKi9cbiAgICB2YXIgYXR0ckdldHRlciA9IGZ1bmN0aW9uIChuYW1lLCBzY29wZSkge1xuICAgICAgcmV0dXJuIHVwbG9hZC5hdHRyR2V0dGVyKG5hbWUsIGF0dHIsIHNjb3BlKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaXNJbnB1dFR5cGVGaWxlKCkge1xuICAgICAgcmV0dXJuIGVsZW1bMF0udGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW5wdXQnICYmIGF0dHIudHlwZSAmJiBhdHRyLnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2ZpbGUnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbGVDaGFuZ2VBdHRyKCkge1xuICAgICAgcmV0dXJuIGF0dHJHZXR0ZXIoJ25nZkNoYW5nZScpIHx8IGF0dHJHZXR0ZXIoJ25nZlNlbGVjdCcpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNoYW5nZUZuKGV2dCkge1xuICAgICAgaWYgKHVwbG9hZC5zaG91bGRVcGRhdGVPbignY2hhbmdlJywgYXR0ciwgc2NvcGUpKSB7XG4gICAgICAgIHZhciBmaWxlTGlzdCA9IGV2dC5fX2ZpbGVzXyB8fCAoZXZ0LnRhcmdldCAmJiBldnQudGFyZ2V0LmZpbGVzKSwgZmlsZXMgPSBbXTtcbiAgICAgICAgLyogSGFuZGxlIGR1cGxpY2F0ZSBjYWxsIGluICBJRTExICovXG4gICAgICAgIGlmICghZmlsZUxpc3QpIHJldHVybjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGZpbGVzLnB1c2goZmlsZUxpc3RbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHVwbG9hZC51cGRhdGVNb2RlbChuZ01vZGVsLCBhdHRyLCBzY29wZSwgZmlsZUNoYW5nZUF0dHIoKSxcbiAgICAgICAgICBmaWxlcy5sZW5ndGggPyBmaWxlcyA6IG51bGwsIGV2dCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdXBsb2FkLnJlZ2lzdGVyTW9kZWxDaGFuZ2VWYWxpZGF0b3IobmdNb2RlbCwgYXR0ciwgc2NvcGUpO1xuXG4gICAgdmFyIHVud2F0Y2hlcyA9IFtdO1xuICAgIGlmIChhdHRyR2V0dGVyKCduZ2ZNdWx0aXBsZScpKSB7XG4gICAgICB1bndhdGNoZXMucHVzaChzY29wZS4kd2F0Y2goYXR0ckdldHRlcignbmdmTXVsdGlwbGUnKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBmaWxlRWxlbS5hdHRyKCdtdWx0aXBsZScsIGF0dHJHZXR0ZXIoJ25nZk11bHRpcGxlJywgc2NvcGUpKTtcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgaWYgKGF0dHJHZXR0ZXIoJ25nZkNhcHR1cmUnKSkge1xuICAgICAgdW53YXRjaGVzLnB1c2goc2NvcGUuJHdhdGNoKGF0dHJHZXR0ZXIoJ25nZkNhcHR1cmUnKSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBmaWxlRWxlbS5hdHRyKCdjYXB0dXJlJywgYXR0ckdldHRlcignbmdmQ2FwdHVyZScsIHNjb3BlKSk7XG4gICAgICB9KSk7XG4gICAgfVxuICAgIGlmIChhdHRyR2V0dGVyKCduZ2ZBY2NlcHQnKSkge1xuICAgICAgdW53YXRjaGVzLnB1c2goc2NvcGUuJHdhdGNoKGF0dHJHZXR0ZXIoJ25nZkFjY2VwdCcpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZpbGVFbGVtLmF0dHIoJ2FjY2VwdCcsIGF0dHJHZXR0ZXIoJ25nZkFjY2VwdCcsIHNjb3BlKSk7XG4gICAgICB9KSk7XG4gICAgfVxuICAgIHVud2F0Y2hlcy5wdXNoKGF0dHIuJG9ic2VydmUoJ2FjY2VwdCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGZpbGVFbGVtLmF0dHIoJ2FjY2VwdCcsIGF0dHJHZXR0ZXIoJ2FjY2VwdCcpKTtcbiAgICB9KSk7XG4gICAgZnVuY3Rpb24gYmluZEF0dHJUb0ZpbGVJbnB1dChmaWxlRWxlbSwgbGFiZWwpIHtcbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZUlkKHZhbCkge1xuICAgICAgICBmaWxlRWxlbS5hdHRyKCdpZCcsICduZ2YtJyArIHZhbCk7XG4gICAgICAgIGxhYmVsLmF0dHIoJ2lkJywgJ25nZi1sYWJlbC0nICsgdmFsKTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtWzBdLmF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGF0dHJpYnV0ZSA9IGVsZW1bMF0uYXR0cmlidXRlc1tpXTtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZS5uYW1lICE9PSAndHlwZScgJiYgYXR0cmlidXRlLm5hbWUgIT09ICdjbGFzcycgJiYgYXR0cmlidXRlLm5hbWUgIT09ICdzdHlsZScpIHtcbiAgICAgICAgICBpZiAoYXR0cmlidXRlLm5hbWUgPT09ICdpZCcpIHtcbiAgICAgICAgICAgIHVwZGF0ZUlkKGF0dHJpYnV0ZS52YWx1ZSk7XG4gICAgICAgICAgICB1bndhdGNoZXMucHVzaChhdHRyLiRvYnNlcnZlKCdpZCcsIHVwZGF0ZUlkKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZpbGVFbGVtLmF0dHIoYXR0cmlidXRlLm5hbWUsICghYXR0cmlidXRlLnZhbHVlICYmIChhdHRyaWJ1dGUubmFtZSA9PT0gJ3JlcXVpcmVkJyB8fFxuICAgICAgICAgICAgYXR0cmlidXRlLm5hbWUgPT09ICdtdWx0aXBsZScpKSA/IGF0dHJpYnV0ZS5uYW1lIDogYXR0cmlidXRlLnZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVGaWxlSW5wdXQoKSB7XG4gICAgICBpZiAoaXNJbnB1dFR5cGVGaWxlKCkpIHtcbiAgICAgICAgcmV0dXJuIGVsZW07XG4gICAgICB9XG5cbiAgICAgIHZhciBmaWxlRWxlbSA9IGFuZ3VsYXIuZWxlbWVudCgnPGlucHV0IHR5cGU9XCJmaWxlXCI+Jyk7XG5cbiAgICAgIHZhciBsYWJlbCA9IGFuZ3VsYXIuZWxlbWVudCgnPGxhYmVsPnVwbG9hZDwvbGFiZWw+Jyk7XG4gICAgICBsYWJlbC5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuY3NzKCdwb3NpdGlvbicsICdhYnNvbHV0ZScpLmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJylcbiAgICAgICAgLmNzcygnd2lkdGgnLCAnMHB4JykuY3NzKCdoZWlnaHQnLCAnMHB4JykuY3NzKCdib3JkZXInLCAnbm9uZScpXG4gICAgICAgIC5jc3MoJ21hcmdpbicsICcwcHgnKS5jc3MoJ3BhZGRpbmcnLCAnMHB4JykuYXR0cigndGFiaW5kZXgnLCAnLTEnKTtcbiAgICAgIGJpbmRBdHRyVG9GaWxlSW5wdXQoZmlsZUVsZW0sIGxhYmVsKTtcblxuICAgICAgZ2VuZXJhdGVkRWxlbXMucHVzaCh7ZWw6IGVsZW0sIHJlZjogbGFiZWx9KTtcblxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsYWJlbC5hcHBlbmQoZmlsZUVsZW0pWzBdKTtcblxuICAgICAgcmV0dXJuIGZpbGVFbGVtO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsaWNrSGFuZGxlcihldnQpIHtcbiAgICAgIGlmIChlbGVtLmF0dHIoJ2Rpc2FibGVkJykpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmIChhdHRyR2V0dGVyKCduZ2ZTZWxlY3REaXNhYmxlZCcsIHNjb3BlKSkgcmV0dXJuO1xuXG4gICAgICB2YXIgciA9IGRldGVjdFN3aXBlKGV2dCk7XG4gICAgICAvLyBwcmV2ZW50IHRoZSBjbGljayBpZiBpdCBpcyBhIHN3aXBlXG4gICAgICBpZiAociAhPSBudWxsKSByZXR1cm4gcjtcblxuICAgICAgcmVzZXRNb2RlbChldnQpO1xuXG4gICAgICAvLyBmaXggZm9yIG1kIHdoZW4gdGhlIGVsZW1lbnQgaXMgcmVtb3ZlZCBmcm9tIHRoZSBET00gYW5kIGFkZGVkIGJhY2sgIzQ2MFxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFpc0lucHV0VHlwZUZpbGUoKSAmJiAhZG9jdW1lbnQuYm9keS5jb250YWlucyhmaWxlRWxlbVswXSkpIHtcbiAgICAgICAgICBnZW5lcmF0ZWRFbGVtcy5wdXNoKHtlbDogZWxlbSwgcmVmOiBmaWxlRWxlbS5wYXJlbnQoKX0pO1xuICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZmlsZUVsZW0ucGFyZW50KClbMF0pO1xuICAgICAgICAgIGZpbGVFbGVtLmJpbmQoJ2NoYW5nZScsIGNoYW5nZUZuKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkgey8qaWdub3JlKi9cbiAgICAgIH1cblxuICAgICAgaWYgKGlzRGVsYXllZENsaWNrU3VwcG9ydGVkKG5hdmlnYXRvci51c2VyQWdlbnQpKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZpbGVFbGVtWzBdLmNsaWNrKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlsZUVsZW1bMF0uY2xpY2soKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuXG4gICAgdmFyIGluaXRpYWxUb3VjaFN0YXJ0WSA9IDA7XG4gICAgdmFyIGluaXRpYWxUb3VjaFN0YXJ0WCA9IDA7XG5cbiAgICBmdW5jdGlvbiBkZXRlY3RTd2lwZShldnQpIHtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZ0LmNoYW5nZWRUb3VjaGVzIHx8IChldnQub3JpZ2luYWxFdmVudCAmJiBldnQub3JpZ2luYWxFdmVudC5jaGFuZ2VkVG91Y2hlcyk7XG4gICAgICBpZiAodG91Y2hlcykge1xuICAgICAgICBpZiAoZXZ0LnR5cGUgPT09ICd0b3VjaHN0YXJ0Jykge1xuICAgICAgICAgIGluaXRpYWxUb3VjaFN0YXJ0WCA9IHRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgICBpbml0aWFsVG91Y2hTdGFydFkgPSB0b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7IC8vIGRvbid0IGJsb2NrIGV2ZW50IGRlZmF1bHRcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBwcmV2ZW50IHNjcm9sbCBmcm9tIHRyaWdnZXJpbmcgZXZlbnRcbiAgICAgICAgICBpZiAoZXZ0LnR5cGUgPT09ICd0b3VjaGVuZCcpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50WCA9IHRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgICAgIHZhciBjdXJyZW50WSA9IHRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICAgIGlmICgoTWF0aC5hYnMoY3VycmVudFggLSBpbml0aWFsVG91Y2hTdGFydFgpID4gMjApIHx8XG4gICAgICAgICAgICAgIChNYXRoLmFicyhjdXJyZW50WSAtIGluaXRpYWxUb3VjaFN0YXJ0WSkgPiAyMCkpIHtcbiAgICAgICAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBmaWxlRWxlbSA9IGVsZW07XG5cbiAgICBmdW5jdGlvbiByZXNldE1vZGVsKGV2dCkge1xuICAgICAgaWYgKHVwbG9hZC5zaG91bGRVcGRhdGVPbignY2xpY2snLCBhdHRyLCBzY29wZSkgJiYgZmlsZUVsZW0udmFsKCkpIHtcbiAgICAgICAgZmlsZUVsZW0udmFsKG51bGwpO1xuICAgICAgICB1cGxvYWQudXBkYXRlTW9kZWwobmdNb2RlbCwgYXR0ciwgc2NvcGUsIGZpbGVDaGFuZ2VBdHRyKCksIG51bGwsIGV2dCwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFpc0lucHV0VHlwZUZpbGUoKSkge1xuICAgICAgZmlsZUVsZW0gPSBjcmVhdGVGaWxlSW5wdXQoKTtcbiAgICB9XG4gICAgZmlsZUVsZW0uYmluZCgnY2hhbmdlJywgY2hhbmdlRm4pO1xuXG4gICAgaWYgKCFpc0lucHV0VHlwZUZpbGUoKSkge1xuICAgICAgZWxlbS5iaW5kKCdjbGljayB0b3VjaHN0YXJ0IHRvdWNoZW5kJywgY2xpY2tIYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbS5iaW5kKCdjbGljaycsIHJlc2V0TW9kZWwpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGllMTBTYW1lRmlsZVNlbGVjdEZpeChldnQpIHtcbiAgICAgIGlmIChmaWxlRWxlbSAmJiAhZmlsZUVsZW0uYXR0cignX19uZ2ZfaWUxMF9GaXhfJykpIHtcbiAgICAgICAgaWYgKCFmaWxlRWxlbVswXS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgZmlsZUVsZW0gPSBudWxsO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBmaWxlRWxlbS51bmJpbmQoJ2NsaWNrJyk7XG4gICAgICAgIHZhciBjbG9uZSA9IGZpbGVFbGVtLmNsb25lKCk7XG4gICAgICAgIGZpbGVFbGVtLnJlcGxhY2VXaXRoKGNsb25lKTtcbiAgICAgICAgZmlsZUVsZW0gPSBjbG9uZTtcbiAgICAgICAgZmlsZUVsZW0uYXR0cignX19uZ2ZfaWUxMF9GaXhfJywgJ3RydWUnKTtcbiAgICAgICAgZmlsZUVsZW0uYmluZCgnY2hhbmdlJywgY2hhbmdlRm4pO1xuICAgICAgICBmaWxlRWxlbS5iaW5kKCdjbGljaycsIGllMTBTYW1lRmlsZVNlbGVjdEZpeCk7XG4gICAgICAgIGZpbGVFbGVtWzBdLmNsaWNrKCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbGVFbGVtLnJlbW92ZUF0dHIoJ19fbmdmX2llMTBfRml4XycpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChuYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKCdNU0lFIDEwJykgIT09IC0xKSB7XG4gICAgICBmaWxlRWxlbS5iaW5kKCdjbGljaycsIGllMTBTYW1lRmlsZVNlbGVjdEZpeCk7XG4gICAgfVxuXG4gICAgaWYgKG5nTW9kZWwpIG5nTW9kZWwuJGZvcm1hdHRlcnMucHVzaChmdW5jdGlvbiAodmFsKSB7XG4gICAgICBpZiAodmFsID09IG51bGwgfHwgdmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBpZiAoZmlsZUVsZW0udmFsKCkpIHtcbiAgICAgICAgICBmaWxlRWxlbS52YWwobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWw7XG4gICAgfSk7XG5cbiAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFpc0lucHV0VHlwZUZpbGUoKSkgZmlsZUVsZW0ucGFyZW50KCkucmVtb3ZlKCk7XG4gICAgICBhbmd1bGFyLmZvckVhY2godW53YXRjaGVzLCBmdW5jdGlvbiAodW53YXRjaCkge1xuICAgICAgICB1bndhdGNoKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2VuZXJhdGVkRWxlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGcgPSBnZW5lcmF0ZWRFbGVtc1tpXTtcbiAgICAgICAgaWYgKCFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGcuZWxbMF0pKSB7XG4gICAgICAgICAgZ2VuZXJhdGVkRWxlbXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGcucmVmLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAod2luZG93LkZpbGVBUEkgJiYgd2luZG93LkZpbGVBUEkubmdmRml4SUUpIHtcbiAgICAgIHdpbmRvdy5GaWxlQVBJLm5nZkZpeElFKGVsZW0sIGZpbGVFbGVtLCBjaGFuZ2VGbik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0FFQycsXG4gICAgcmVxdWlyZTogJz9uZ01vZGVsJyxcbiAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIG5nTW9kZWwpIHtcbiAgICAgIGxpbmtGaWxlU2VsZWN0KHNjb3BlLCBlbGVtLCBhdHRyLCBuZ01vZGVsLCAkcGFyc2UsICR0aW1lb3V0LCAkY29tcGlsZSwgVXBsb2FkKTtcbiAgICB9XG4gIH07XG59XSk7XG5cbihmdW5jdGlvbiAoKSB7XG5cbiAgbmdGaWxlVXBsb2FkLnNlcnZpY2UoJ1VwbG9hZERhdGFVcmwnLCBbJ1VwbG9hZEJhc2UnLCAnJHRpbWVvdXQnLCAnJHEnLCBmdW5jdGlvbiAoVXBsb2FkQmFzZSwgJHRpbWVvdXQsICRxKSB7XG4gICAgdmFyIHVwbG9hZCA9IFVwbG9hZEJhc2U7XG4gICAgdXBsb2FkLmJhc2U2NERhdGFVcmwgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShmaWxlKSkge1xuICAgICAgICB2YXIgZCA9ICRxLmRlZmVyKCksIGNvdW50ID0gMDtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbGUsIGZ1bmN0aW9uIChmKSB7XG4gICAgICAgICAgdXBsb2FkLmRhdGFVcmwoZiwgdHJ1ZSlbJ2ZpbmFsbHknXShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgaWYgKGNvdW50ID09PSBmaWxlLmxlbmd0aCkge1xuICAgICAgICAgICAgICB2YXIgdXJscyA9IFtdO1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlsZSwgZnVuY3Rpb24gKGZmKSB7XG4gICAgICAgICAgICAgICAgdXJscy5wdXNoKGZmLiRuZ2ZEYXRhVXJsKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGQucmVzb2x2ZSh1cmxzLCBmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkLnByb21pc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdXBsb2FkLmRhdGFVcmwoZmlsZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB1cGxvYWQuZGF0YVVybCA9IGZ1bmN0aW9uIChmaWxlLCBkaXNhbGxvd09iamVjdFVybCkge1xuICAgICAgaWYgKCFmaWxlKSByZXR1cm4gdXBsb2FkLmVtcHR5UHJvbWlzZShmaWxlLCBmaWxlKTtcbiAgICAgIGlmICgoZGlzYWxsb3dPYmplY3RVcmwgJiYgZmlsZS4kbmdmRGF0YVVybCAhPSBudWxsKSB8fCAoIWRpc2FsbG93T2JqZWN0VXJsICYmIGZpbGUuJG5nZkJsb2JVcmwgIT0gbnVsbCkpIHtcbiAgICAgICAgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2UoZGlzYWxsb3dPYmplY3RVcmwgPyBmaWxlLiRuZ2ZEYXRhVXJsIDogZmlsZS4kbmdmQmxvYlVybCwgZmlsZSk7XG4gICAgICB9XG4gICAgICB2YXIgcCA9IGRpc2FsbG93T2JqZWN0VXJsID8gZmlsZS4kJG5nZkRhdGFVcmxQcm9taXNlIDogZmlsZS4kJG5nZkJsb2JVcmxQcm9taXNlO1xuICAgICAgaWYgKHApIHJldHVybiBwO1xuXG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAod2luZG93LkZpbGVSZWFkZXIgJiYgZmlsZSAmJlxuICAgICAgICAgICghd2luZG93LkZpbGVBUEkgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNU0lFIDgnKSA9PT0gLTEgfHwgZmlsZS5zaXplIDwgMjAwMDApICYmXG4gICAgICAgICAgKCF3aW5kb3cuRmlsZUFQSSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUgOScpID09PSAtMSB8fCBmaWxlLnNpemUgPCA0MDAwMDAwKSkge1xuICAgICAgICAgIC8vcHJlZmVyIFVSTC5jcmVhdGVPYmplY3RVUkwgZm9yIGhhbmRsaW5nIHJlZnJlbmNlcyB0byBmaWxlcyBvZiBhbGwgc2l6ZXNcbiAgICAgICAgICAvL3NpbmNlIGl0IGRvZXNuwrR0IGJ1aWxkIGEgbGFyZ2Ugc3RyaW5nIGluIG1lbW9yeVxuICAgICAgICAgIHZhciBVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkw7XG4gICAgICAgICAgaWYgKFVSTCAmJiBVUkwuY3JlYXRlT2JqZWN0VVJMICYmICFkaXNhbGxvd09iamVjdFVybCkge1xuICAgICAgICAgICAgdmFyIHVybDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmaWxlLiRuZ2ZCbG9iVXJsID0gJyc7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGZpbGUuJG5nZkJsb2JVcmwgPSB1cmw7XG4gICAgICAgICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHVybCwgZmlsZSk7XG4gICAgICAgICAgICAgICAgdXBsb2FkLmJsb2JVcmxzID0gdXBsb2FkLmJsb2JVcmxzIHx8IFtdO1xuICAgICAgICAgICAgICAgIHVwbG9hZC5ibG9iVXJsc1RvdGFsU2l6ZSA9IHVwbG9hZC5ibG9iVXJsc1RvdGFsU2l6ZSB8fCAwO1xuICAgICAgICAgICAgICAgIHVwbG9hZC5ibG9iVXJscy5wdXNoKHt1cmw6IHVybCwgc2l6ZTogZmlsZS5zaXplfSk7XG4gICAgICAgICAgICAgICAgdXBsb2FkLmJsb2JVcmxzVG90YWxTaXplICs9IGZpbGUuc2l6ZSB8fCAwO1xuICAgICAgICAgICAgICAgIHZhciBtYXhNZW1vcnkgPSB1cGxvYWQuZGVmYXVsdHMuYmxvYlVybHNNYXhNZW1vcnkgfHwgMjY4NDM1NDU2O1xuICAgICAgICAgICAgICAgIHZhciBtYXhMZW5ndGggPSB1cGxvYWQuZGVmYXVsdHMuYmxvYlVybHNNYXhRdWV1ZVNpemUgfHwgMjAwO1xuICAgICAgICAgICAgICAgIHdoaWxlICgodXBsb2FkLmJsb2JVcmxzVG90YWxTaXplID4gbWF4TWVtb3J5IHx8IHVwbG9hZC5ibG9iVXJscy5sZW5ndGggPiBtYXhMZW5ndGgpICYmIHVwbG9hZC5ibG9iVXJscy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgb2JqID0gdXBsb2FkLmJsb2JVcmxzLnNwbGljZSgwLCAxKVswXTtcbiAgICAgICAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwob2JqLnVybCk7XG4gICAgICAgICAgICAgICAgICB1cGxvYWQuYmxvYlVybHNUb3RhbFNpemUgLT0gb2JqLnNpemU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZmlsZS4kbmdmRGF0YVVybCA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGUudGFyZ2V0LnJlc3VsdCwgZmlsZSk7XG4gICAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgZGVsZXRlIGZpbGUuJG5nZkRhdGFVcmw7XG4gICAgICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZpbGVSZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZpbGUuJG5nZkRhdGFVcmwgPSAnJztcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBmaWxlW2Rpc2FsbG93T2JqZWN0VXJsID8gJyRuZ2ZEYXRhVXJsJyA6ICckbmdmQmxvYlVybCddID0gJyc7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChkaXNhbGxvd09iamVjdFVybCkge1xuICAgICAgICBwID0gZmlsZS4kJG5nZkRhdGFVcmxQcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHAgPSBmaWxlLiQkbmdmQmxvYlVybFByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfVxuICAgICAgcFsnZmluYWxseSddKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVsZXRlIGZpbGVbZGlzYWxsb3dPYmplY3RVcmwgPyAnJCRuZ2ZEYXRhVXJsUHJvbWlzZScgOiAnJCRuZ2ZCbG9iVXJsUHJvbWlzZSddO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcDtcbiAgICB9O1xuICAgIHJldHVybiB1cGxvYWQ7XG4gIH1dKTtcblxuICBmdW5jdGlvbiBnZXRUYWdUeXBlKGVsKSB7XG4gICAgaWYgKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2ltZycpIHJldHVybiAnaW1hZ2UnO1xuICAgIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdhdWRpbycpIHJldHVybiAnYXVkaW8nO1xuICAgIGlmIChlbC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd2aWRlbycpIHJldHVybiAndmlkZW8nO1xuICAgIHJldHVybiAvLi87XG4gIH1cblxuICBmdW5jdGlvbiBsaW5rRmlsZURpcmVjdGl2ZShVcGxvYWQsICR0aW1lb3V0LCBzY29wZSwgZWxlbSwgYXR0ciwgZGlyZWN0aXZlTmFtZSwgcmVzaXplUGFyYW1zLCBpc0JhY2tncm91bmQpIHtcbiAgICBmdW5jdGlvbiBjb25zdHJ1Y3REYXRhVXJsKGZpbGUpIHtcbiAgICAgIHZhciBkaXNhbGxvd09iamVjdFVybCA9IFVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZOb09iamVjdFVybCcsIGF0dHIsIHNjb3BlKTtcbiAgICAgIFVwbG9hZC5kYXRhVXJsKGZpbGUsIGRpc2FsbG93T2JqZWN0VXJsKVsnZmluYWxseSddKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHZhciBzcmMgPSAoZGlzYWxsb3dPYmplY3RVcmwgPyBmaWxlLiRuZ2ZEYXRhVXJsIDogZmlsZS4kbmdmQmxvYlVybCkgfHwgZmlsZS4kbmdmRGF0YVVybDtcbiAgICAgICAgICBpZiAoaXNCYWNrZ3JvdW5kKSB7XG4gICAgICAgICAgICBlbGVtLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoXFwnJyArIChzcmMgfHwgJycpICsgJ1xcJyknKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbS5hdHRyKCdzcmMnLCBzcmMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc3JjKSB7XG4gICAgICAgICAgICBlbGVtLnJlbW92ZUNsYXNzKCduZy1oaWRlJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW0uYWRkQ2xhc3MoJ25nLWhpZGUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHVud2F0Y2ggPSBzY29wZS4kd2F0Y2goYXR0cltkaXJlY3RpdmVOYW1lXSwgZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgdmFyIHNpemUgPSByZXNpemVQYXJhbXM7XG4gICAgICAgIGlmIChkaXJlY3RpdmVOYW1lID09PSAnbmdmVGh1bWJuYWlsJykge1xuICAgICAgICAgIGlmICghc2l6ZSkge1xuICAgICAgICAgICAgc2l6ZSA9IHt3aWR0aDogZWxlbVswXS5uYXR1cmFsV2lkdGggfHwgZWxlbVswXS5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgaGVpZ2h0OiBlbGVtWzBdLm5hdHVyYWxIZWlnaHQgfHwgZWxlbVswXS5jbGllbnRIZWlnaHR9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2l6ZS53aWR0aCA9PT0gMCAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSkge1xuICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtWzBdKTtcbiAgICAgICAgICAgIHNpemUgPSB7XG4gICAgICAgICAgICAgIHdpZHRoOiBwYXJzZUludChzdHlsZS53aWR0aC5zbGljZSgwLCAtMikpLFxuICAgICAgICAgICAgICBoZWlnaHQ6IHBhcnNlSW50KHN0eWxlLmhlaWdodC5zbGljZSgwLCAtMikpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGZpbGUpKSB7XG4gICAgICAgICAgZWxlbS5yZW1vdmVDbGFzcygnbmctaGlkZScpO1xuICAgICAgICAgIGlmIChpc0JhY2tncm91bmQpIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmNzcygnYmFja2dyb3VuZC1pbWFnZScsICd1cmwoXFwnJyArIGZpbGUgKyAnXFwnKScpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZWxlbS5hdHRyKCdzcmMnLCBmaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbGUgJiYgZmlsZS50eXBlICYmIGZpbGUudHlwZS5zZWFyY2goZ2V0VGFnVHlwZShlbGVtWzBdKSkgPT09IDAgJiZcbiAgICAgICAgICAoIWlzQmFja2dyb3VuZCB8fCBmaWxlLnR5cGUuaW5kZXhPZignaW1hZ2UnKSA9PT0gMCkpIHtcbiAgICAgICAgICBpZiAoc2l6ZSAmJiBVcGxvYWQuaXNSZXNpemVTdXBwb3J0ZWQoKSkge1xuICAgICAgICAgICAgc2l6ZS5yZXNpemVJZiA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBVcGxvYWQuYXR0ckdldHRlcignbmdmUmVzaXplSWYnLCBhdHRyLCBzY29wZSxcbiAgICAgICAgICAgICAgICB7JHdpZHRoOiB3aWR0aCwgJGhlaWdodDogaGVpZ2h0LCAkZmlsZTogZmlsZX0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIFVwbG9hZC5yZXNpemUoZmlsZSwgc2l6ZSkudGhlbihcbiAgICAgICAgICAgICAgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgICAgICBjb25zdHJ1Y3REYXRhVXJsKGYpO1xuICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0cnVjdERhdGFVcmwoZmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsZW0uYWRkQ2xhc3MoJ25nLWhpZGUnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHVud2F0Y2goKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cblxuICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZlNyYyAqL1xuICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZk5vT2JqZWN0VXJsICovXG4gIG5nRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nZlNyYycsIFsnVXBsb2FkJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKFVwbG9hZCwgJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIpIHtcbiAgICAgICAgbGlua0ZpbGVEaXJlY3RpdmUoVXBsb2FkLCAkdGltZW91dCwgc2NvcGUsIGVsZW0sIGF0dHIsICduZ2ZTcmMnLFxuICAgICAgICAgIFVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZSZXNpemUnLCBhdHRyLCBzY29wZSksIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSk7XG5cbiAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZCYWNrZ3JvdW5kICovXG4gIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmTm9PYmplY3RVcmwgKi9cbiAgbmdGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdmQmFja2dyb3VuZCcsIFsnVXBsb2FkJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKFVwbG9hZCwgJHRpbWVvdXQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIpIHtcbiAgICAgICAgbGlua0ZpbGVEaXJlY3RpdmUoVXBsb2FkLCAkdGltZW91dCwgc2NvcGUsIGVsZW0sIGF0dHIsICduZ2ZCYWNrZ3JvdW5kJyxcbiAgICAgICAgICBVcGxvYWQuYXR0ckdldHRlcignbmdmUmVzaXplJywgYXR0ciwgc2NvcGUpLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSk7XG5cbiAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZUaHVtYm5haWwgKi9cbiAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZBc0JhY2tncm91bmQgKi9cbiAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZTaXplICovXG4gIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmTm9PYmplY3RVcmwgKi9cbiAgbmdGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdmVGh1bWJuYWlsJywgWydVcGxvYWQnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoVXBsb2FkLCAkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICB2YXIgc2l6ZSA9IFVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZTaXplJywgYXR0ciwgc2NvcGUpO1xuICAgICAgICBsaW5rRmlsZURpcmVjdGl2ZShVcGxvYWQsICR0aW1lb3V0LCBzY29wZSwgZWxlbSwgYXR0ciwgJ25nZlRodW1ibmFpbCcsIHNpemUsXG4gICAgICAgICAgVXBsb2FkLmF0dHJHZXR0ZXIoJ25nZkFzQmFja2dyb3VuZCcsIGF0dHIsIHNjb3BlKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfV0pO1xuXG4gIG5nRmlsZVVwbG9hZC5jb25maWcoWyckY29tcGlsZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRjb21waWxlUHJvdmlkZXIpIHtcbiAgICBpZiAoJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QpICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3x0ZWx8d2ViY2FsfGxvY2FsfGZpbGV8ZGF0YXxibG9iKTovKTtcbiAgICBpZiAoJGNvbXBpbGVQcm92aWRlci5hSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCkgJGNvbXBpbGVQcm92aWRlci5hSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxtYWlsdG98dGVsfHdlYmNhbHxsb2NhbHxmaWxlfGRhdGF8YmxvYik6Lyk7XG4gIH1dKTtcblxuICBuZ0ZpbGVVcGxvYWQuZmlsdGVyKCduZ2ZEYXRhVXJsJywgWydVcGxvYWREYXRhVXJsJywgJyRzY2UnLCBmdW5jdGlvbiAoVXBsb2FkRGF0YVVybCwgJHNjZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZmlsZSwgZGlzYWxsb3dPYmplY3RVcmwsIHRydXN0ZWRVcmwpIHtcbiAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGZpbGUpKSB7XG4gICAgICAgIHJldHVybiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChmaWxlKTtcbiAgICAgIH1cbiAgICAgIHZhciBzcmMgPSBmaWxlICYmICgoZGlzYWxsb3dPYmplY3RVcmwgPyBmaWxlLiRuZ2ZEYXRhVXJsIDogZmlsZS4kbmdmQmxvYlVybCkgfHwgZmlsZS4kbmdmRGF0YVVybCk7XG4gICAgICBpZiAoZmlsZSAmJiAhc3JjKSB7XG4gICAgICAgIGlmICghZmlsZS4kbmdmRGF0YVVybEZpbHRlckluUHJvZ3Jlc3MgJiYgYW5ndWxhci5pc09iamVjdChmaWxlKSkge1xuICAgICAgICAgIGZpbGUuJG5nZkRhdGFVcmxGaWx0ZXJJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgICBVcGxvYWREYXRhVXJsLmRhdGFVcmwoZmlsZSwgZGlzYWxsb3dPYmplY3RVcmwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICAgIGlmIChmaWxlKSBkZWxldGUgZmlsZS4kbmdmRGF0YVVybEZpbHRlckluUHJvZ3Jlc3M7XG4gICAgICByZXR1cm4gKGZpbGUgJiYgc3JjID8gKHRydXN0ZWRVcmwgPyAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChzcmMpIDogc3JjKSA6IGZpbGUpIHx8ICcnO1xuICAgIH07XG4gIH1dKTtcblxufSkoKTtcblxubmdGaWxlVXBsb2FkLnNlcnZpY2UoJ1VwbG9hZFZhbGlkYXRlJywgWydVcGxvYWREYXRhVXJsJywgJyRxJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKFVwbG9hZERhdGFVcmwsICRxLCAkdGltZW91dCkge1xuICB2YXIgdXBsb2FkID0gVXBsb2FkRGF0YVVybDtcblxuICBmdW5jdGlvbiBnbG9iU3RyaW5nVG9SZWdleChzdHIpIHtcbiAgICB2YXIgcmVnZXhwID0gJycsIGV4Y2x1ZGVzID0gW107XG4gICAgaWYgKHN0ci5sZW5ndGggPiAyICYmIHN0clswXSA9PT0gJy8nICYmIHN0cltzdHIubGVuZ3RoIC0gMV0gPT09ICcvJykge1xuICAgICAgcmVnZXhwID0gc3RyLnN1YnN0cmluZygxLCBzdHIubGVuZ3RoIC0gMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBzcGxpdCA9IHN0ci5zcGxpdCgnLCcpO1xuICAgICAgaWYgKHNwbGl0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciByID0gZ2xvYlN0cmluZ1RvUmVnZXgoc3BsaXRbaV0pO1xuICAgICAgICAgIGlmIChyLnJlZ2V4cCkge1xuICAgICAgICAgICAgcmVnZXhwICs9ICcoJyArIHIucmVnZXhwICsgJyknO1xuICAgICAgICAgICAgaWYgKGkgPCBzcGxpdC5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgIHJlZ2V4cCArPSAnfCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4Y2x1ZGVzID0gZXhjbHVkZXMuY29uY2F0KHIuZXhjbHVkZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHN0ci5pbmRleE9mKCchJykgPT09IDApIHtcbiAgICAgICAgICBleGNsdWRlcy5wdXNoKCdeKCg/IScgKyBnbG9iU3RyaW5nVG9SZWdleChzdHIuc3Vic3RyaW5nKDEpKS5yZWdleHAgKyAnKS4pKiQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc3RyLmluZGV4T2YoJy4nKSA9PT0gMCkge1xuICAgICAgICAgICAgc3RyID0gJyonICsgc3RyO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZWdleHAgPSAnXicgKyBzdHIucmVwbGFjZShuZXcgUmVnRXhwKCdbLlxcXFxcXFxcKyo/XFxcXFtcXFxcXlxcXFxdJCgpe309ITw+fDpcXFxcLV0nLCAnZycpLCAnXFxcXCQmJykgKyAnJCc7XG4gICAgICAgICAgcmVnZXhwID0gcmVnZXhwLnJlcGxhY2UoL1xcXFxcXCovZywgJy4qJykucmVwbGFjZSgvXFxcXFxcPy9nLCAnLicpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7cmVnZXhwOiByZWdleHAsIGV4Y2x1ZGVzOiBleGNsdWRlc307XG4gIH1cblxuICB1cGxvYWQudmFsaWRhdGVQYXR0ZXJuID0gZnVuY3Rpb24gKGZpbGUsIHZhbCkge1xuICAgIGlmICghdmFsKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIHBhdHRlcm4gPSBnbG9iU3RyaW5nVG9SZWdleCh2YWwpLCB2YWxpZCA9IHRydWU7XG4gICAgaWYgKHBhdHRlcm4ucmVnZXhwICYmIHBhdHRlcm4ucmVnZXhwLmxlbmd0aCkge1xuICAgICAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAocGF0dGVybi5yZWdleHAsICdpJyk7XG4gICAgICB2YWxpZCA9IChmaWxlLnR5cGUgIT0gbnVsbCAmJiByZWdleHAudGVzdChmaWxlLnR5cGUpKSB8fFxuICAgICAgICAoZmlsZS5uYW1lICE9IG51bGwgJiYgcmVnZXhwLnRlc3QoZmlsZS5uYW1lKSk7XG4gICAgfVxuICAgIHZhciBsZW4gPSBwYXR0ZXJuLmV4Y2x1ZGVzLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgIHZhciBleGNsdWRlID0gbmV3IFJlZ0V4cChwYXR0ZXJuLmV4Y2x1ZGVzW2xlbl0sICdpJyk7XG4gICAgICB2YWxpZCA9IHZhbGlkICYmIChmaWxlLnR5cGUgPT0gbnVsbCB8fCBleGNsdWRlLnRlc3QoZmlsZS50eXBlKSkgJiZcbiAgICAgICAgKGZpbGUubmFtZSA9PSBudWxsIHx8IGV4Y2x1ZGUudGVzdChmaWxlLm5hbWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkO1xuICB9O1xuXG4gIHVwbG9hZC5yYXRpb1RvRmxvYXQgPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgdmFyIHIgPSB2YWwudG9TdHJpbmcoKSwgeEluZGV4ID0gci5zZWFyY2goL1t4Ol0vaSk7XG4gICAgaWYgKHhJbmRleCA+IC0xKSB7XG4gICAgICByID0gcGFyc2VGbG9hdChyLnN1YnN0cmluZygwLCB4SW5kZXgpKSAvIHBhcnNlRmxvYXQoci5zdWJzdHJpbmcoeEluZGV4ICsgMSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByID0gcGFyc2VGbG9hdChyKTtcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH07XG5cbiAgdXBsb2FkLnJlZ2lzdGVyTW9kZWxDaGFuZ2VWYWxpZGF0b3IgPSBmdW5jdGlvbiAobmdNb2RlbCwgYXR0ciwgc2NvcGUpIHtcbiAgICBpZiAobmdNb2RlbCkge1xuICAgICAgbmdNb2RlbC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uIChmaWxlcykge1xuICAgICAgICBpZiAobmdNb2RlbC4kZGlydHkpIHtcbiAgICAgICAgICB2YXIgZmlsZXNBcnJheSA9IGZpbGVzO1xuICAgICAgICAgIGlmIChmaWxlcyAmJiAhYW5ndWxhci5pc0FycmF5KGZpbGVzKSkge1xuICAgICAgICAgICAgZmlsZXNBcnJheSA9IFtmaWxlc107XG4gICAgICAgICAgfVxuICAgICAgICAgIHVwbG9hZC52YWxpZGF0ZShmaWxlc0FycmF5LCAwLCBuZ01vZGVsLCBhdHRyLCBzY29wZSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB1cGxvYWQuYXBwbHlNb2RlbFZhbGlkYXRpb24obmdNb2RlbCwgZmlsZXNBcnJheSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbGVzO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIG1hcmtNb2RlbEFzRGlydHkobmdNb2RlbCwgZmlsZXMpIHtcbiAgICBpZiAoZmlsZXMgIT0gbnVsbCAmJiAhbmdNb2RlbC4kZGlydHkpIHtcbiAgICAgIGlmIChuZ01vZGVsLiRzZXREaXJ0eSkge1xuICAgICAgICBuZ01vZGVsLiRzZXREaXJ0eSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmdNb2RlbC4kZGlydHkgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwbG9hZC5hcHBseU1vZGVsVmFsaWRhdGlvbiA9IGZ1bmN0aW9uIChuZ01vZGVsLCBmaWxlcykge1xuICAgIG1hcmtNb2RlbEFzRGlydHkobmdNb2RlbCwgZmlsZXMpO1xuICAgIGFuZ3VsYXIuZm9yRWFjaChuZ01vZGVsLiRuZ2ZWYWxpZGF0aW9ucywgZnVuY3Rpb24gKHZhbGlkYXRpb24pIHtcbiAgICAgIG5nTW9kZWwuJHNldFZhbGlkaXR5KHZhbGlkYXRpb24ubmFtZSwgdmFsaWRhdGlvbi52YWxpZCk7XG4gICAgfSk7XG4gIH07XG5cbiAgdXBsb2FkLmdldFZhbGlkYXRpb25BdHRyID0gZnVuY3Rpb24gKGF0dHIsIHNjb3BlLCBuYW1lLCB2YWxpZGF0aW9uTmFtZSwgZmlsZSkge1xuICAgIHZhciBkTmFtZSA9ICduZ2YnICsgbmFtZVswXS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zdWJzdHIoMSk7XG4gICAgdmFyIHZhbCA9IHVwbG9hZC5hdHRyR2V0dGVyKGROYW1lLCBhdHRyLCBzY29wZSwgeyRmaWxlOiBmaWxlfSk7XG4gICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICB2YWwgPSB1cGxvYWQuYXR0ckdldHRlcignbmdmVmFsaWRhdGUnLCBhdHRyLCBzY29wZSwgeyRmaWxlOiBmaWxlfSk7XG4gICAgICBpZiAodmFsKSB7XG4gICAgICAgIHZhciBzcGxpdCA9ICh2YWxpZGF0aW9uTmFtZSB8fCBuYW1lKS5zcGxpdCgnLicpO1xuICAgICAgICB2YWwgPSB2YWxbc3BsaXRbMF1dO1xuICAgICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHZhbCA9IHZhbCAmJiB2YWxbc3BsaXRbMV1dO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2YWw7XG4gIH07XG5cbiAgdXBsb2FkLnZhbGlkYXRlID0gZnVuY3Rpb24gKGZpbGVzLCBwcmV2TGVuZ3RoLCBuZ01vZGVsLCBhdHRyLCBzY29wZSkge1xuICAgIG5nTW9kZWwgPSBuZ01vZGVsIHx8IHt9O1xuICAgIG5nTW9kZWwuJG5nZlZhbGlkYXRpb25zID0gbmdNb2RlbC4kbmdmVmFsaWRhdGlvbnMgfHwgW107XG5cbiAgICBhbmd1bGFyLmZvckVhY2gobmdNb2RlbC4kbmdmVmFsaWRhdGlvbnMsIGZ1bmN0aW9uICh2KSB7XG4gICAgICB2LnZhbGlkID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHZhciBhdHRyR2V0dGVyID0gZnVuY3Rpb24gKG5hbWUsIHBhcmFtcykge1xuICAgICAgcmV0dXJuIHVwbG9hZC5hdHRyR2V0dGVyKG5hbWUsIGF0dHIsIHNjb3BlLCBwYXJhbXMpO1xuICAgIH07XG5cbiAgICB2YXIgaWdub3JlZEVycm9ycyA9ICh1cGxvYWQuYXR0ckdldHRlcignbmdmSWdub3JlSW52YWxpZCcsIGF0dHIsIHNjb3BlKSB8fCAnJykuc3BsaXQoJyAnKTtcbiAgICB2YXIgcnVuQWxsVmFsaWRhdGlvbiA9IHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZSdW5BbGxWYWxpZGF0aW9ucycsIGF0dHIsIHNjb3BlKTtcblxuICAgIGlmIChmaWxlcyA9PSBudWxsIHx8IGZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2Uoeyd2YWxpZEZpbGVzJzogZmlsZXMsICdpbnZhbGlkRmlsZXMnOiBbXX0pO1xuICAgIH1cblxuICAgIGZpbGVzID0gZmlsZXMubGVuZ3RoID09PSB1bmRlZmluZWQgPyBbZmlsZXNdIDogZmlsZXMuc2xpY2UoMCk7XG4gICAgdmFyIGludmFsaWRGaWxlcyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVTeW5jKG5hbWUsIHZhbGlkYXRpb25OYW1lLCBmbikge1xuICAgICAgaWYgKGZpbGVzKSB7XG4gICAgICAgIHZhciBpID0gZmlsZXMubGVuZ3RoLCB2YWxpZCA9IG51bGw7XG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICB2YXIgZmlsZSA9IGZpbGVzW2ldO1xuICAgICAgICAgIGlmIChmaWxlKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gdXBsb2FkLmdldFZhbGlkYXRpb25BdHRyKGF0dHIsIHNjb3BlLCBuYW1lLCB2YWxpZGF0aW9uTmFtZSwgZmlsZSk7XG4gICAgICAgICAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgaWYgKCFmbihmaWxlLCB2YWwsIGkpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlnbm9yZWRFcnJvcnMuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgIGZpbGUuJGVycm9yID0gbmFtZTtcbiAgICAgICAgICAgICAgICAgIChmaWxlLiRlcnJvck1lc3NhZ2VzID0gKGZpbGUuJGVycm9yTWVzc2FnZXMgfHwge30pKVtuYW1lXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBmaWxlLiRlcnJvclBhcmFtID0gdmFsO1xuICAgICAgICAgICAgICAgICAgaWYgKGludmFsaWRGaWxlcy5pbmRleE9mKGZpbGUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBpbnZhbGlkRmlsZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmICghcnVuQWxsVmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBmaWxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB2YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBmaWxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh2YWxpZCAhPT0gbnVsbCkge1xuICAgICAgICAgIG5nTW9kZWwuJG5nZlZhbGlkYXRpb25zLnB1c2goe25hbWU6IG5hbWUsIHZhbGlkOiB2YWxpZH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsaWRhdGVTeW5jKCdwYXR0ZXJuJywgbnVsbCwgdXBsb2FkLnZhbGlkYXRlUGF0dGVybik7XG4gICAgdmFsaWRhdGVTeW5jKCdtaW5TaXplJywgJ3NpemUubWluJywgZnVuY3Rpb24gKGZpbGUsIHZhbCkge1xuICAgICAgcmV0dXJuIGZpbGUuc2l6ZSArIDAuMSA+PSB1cGxvYWQudHJhbnNsYXRlU2NhbGFycyh2YWwpO1xuICAgIH0pO1xuICAgIHZhbGlkYXRlU3luYygnbWF4U2l6ZScsICdzaXplLm1heCcsIGZ1bmN0aW9uIChmaWxlLCB2YWwpIHtcbiAgICAgIHJldHVybiBmaWxlLnNpemUgLSAwLjEgPD0gdXBsb2FkLnRyYW5zbGF0ZVNjYWxhcnModmFsKTtcbiAgICB9KTtcbiAgICB2YXIgdG90YWxTaXplID0gMDtcbiAgICB2YWxpZGF0ZVN5bmMoJ21heFRvdGFsU2l6ZScsIG51bGwsIGZ1bmN0aW9uIChmaWxlLCB2YWwpIHtcbiAgICAgIHRvdGFsU2l6ZSArPSBmaWxlLnNpemU7XG4gICAgICBpZiAodG90YWxTaXplID4gdXBsb2FkLnRyYW5zbGF0ZVNjYWxhcnModmFsKSkge1xuICAgICAgICBmaWxlcy5zcGxpY2UoMCwgZmlsZXMubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICB2YWxpZGF0ZVN5bmMoJ3ZhbGlkYXRlRm4nLCBudWxsLCBmdW5jdGlvbiAoZmlsZSwgcikge1xuICAgICAgcmV0dXJuIHIgPT09IHRydWUgfHwgciA9PT0gbnVsbCB8fCByID09PSAnJztcbiAgICB9KTtcblxuICAgIGlmICghZmlsZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdXBsb2FkLmVtcHR5UHJvbWlzZSh7J3ZhbGlkRmlsZXMnOiBbXSwgJ2ludmFsaWRGaWxlcyc6IGludmFsaWRGaWxlc30pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHZhbGlkYXRlQXN5bmMobmFtZSwgdmFsaWRhdGlvbk5hbWUsIHR5cGUsIGFzeW5jRm4sIGZuKSB7XG4gICAgICBmdW5jdGlvbiByZXNvbHZlUmVzdWx0KGRlZmVyLCBmaWxlLCB2YWwpIHtcbiAgICAgICAgZnVuY3Rpb24gcmVzb2x2ZUludGVybmFsKGZuKSB7XG4gICAgICAgICAgaWYgKGZuKCkpIHtcbiAgICAgICAgICAgIGlmIChpZ25vcmVkRXJyb3JzLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgIGZpbGUuJGVycm9yID0gbmFtZTtcbiAgICAgICAgICAgICAgKGZpbGUuJGVycm9yTWVzc2FnZXMgPSAoZmlsZS4kZXJyb3JNZXNzYWdlcyB8fCB7fSkpW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgZmlsZS4kZXJyb3JQYXJhbSA9IHZhbDtcbiAgICAgICAgICAgICAgaWYgKGludmFsaWRGaWxlcy5pbmRleE9mKGZpbGUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGludmFsaWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICghcnVuQWxsVmFsaWRhdGlvbikge1xuICAgICAgICAgICAgICAgIHZhciBpID0gZmlsZXMuaW5kZXhPZihmaWxlKTtcbiAgICAgICAgICAgICAgICBpZiAoaSA+IC0xKSBmaWxlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXIgaiA9IGZpbGVzLmluZGV4T2YoZmlsZSk7XG4gICAgICAgICAgICAgIGlmIChqID4gLTEpIGZpbGVzLnNwbGljZShqLCAxKTtcbiAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsICE9IG51bGwpIHtcbiAgICAgICAgICBhc3luY0ZuKGZpbGUsIHZhbCkudGhlbihmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgcmVzb2x2ZUludGVybmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICFmbihkLCB2YWwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVzb2x2ZUludGVybmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGF0dHJHZXR0ZXIoJ25nZlZhbGlkYXRlRm9yY2UnLCB7JGZpbGU6IGZpbGV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVyLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2VzID0gW3VwbG9hZC5lbXB0eVByb21pc2UodHJ1ZSldO1xuICAgICAgaWYgKGZpbGVzKSB7XG4gICAgICAgIGZpbGVzID0gZmlsZXMubGVuZ3RoID09PSB1bmRlZmluZWQgPyBbZmlsZXNdIDogZmlsZXM7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWxlcywgZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIHByb21pc2VzLnB1c2goZGVmZXIucHJvbWlzZSk7XG4gICAgICAgICAgaWYgKHR5cGUgJiYgKGZpbGUudHlwZSA9PSBudWxsIHx8IGZpbGUudHlwZS5zZWFyY2godHlwZSkgIT09IDApKSB7XG4gICAgICAgICAgICBkZWZlci5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobmFtZSA9PT0gJ2RpbWVuc2lvbnMnICYmIHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZEaW1lbnNpb25zJywgYXR0cikgIT0gbnVsbCkge1xuICAgICAgICAgICAgdXBsb2FkLmltYWdlRGltZW5zaW9ucyhmaWxlKS50aGVuKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIHJlc29sdmVSZXN1bHQoZGVmZXIsIGZpbGUsXG4gICAgICAgICAgICAgICAgYXR0ckdldHRlcignbmdmRGltZW5zaW9ucycsIHskZmlsZTogZmlsZSwgJHdpZHRoOiBkLndpZHRoLCAkaGVpZ2h0OiBkLmhlaWdodH0pKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKG5hbWUgPT09ICdkdXJhdGlvbicgJiYgdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZkR1cmF0aW9uJywgYXR0cikgIT0gbnVsbCkge1xuICAgICAgICAgICAgdXBsb2FkLm1lZGlhRHVyYXRpb24oZmlsZSkudGhlbihmdW5jdGlvbiAoZCkge1xuICAgICAgICAgICAgICByZXNvbHZlUmVzdWx0KGRlZmVyLCBmaWxlLFxuICAgICAgICAgICAgICAgIGF0dHJHZXR0ZXIoJ25nZkR1cmF0aW9uJywgeyRmaWxlOiBmaWxlLCAkZHVyYXRpb246IGR9KSk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGRlZmVyLnJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc29sdmVSZXN1bHQoZGVmZXIsIGZpbGUsXG4gICAgICAgICAgICAgIHVwbG9hZC5nZXRWYWxpZGF0aW9uQXR0cihhdHRyLCBzY29wZSwgbmFtZSwgdmFsaWRhdGlvbk5hbWUsIGZpbGUpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgdmFyIGRlZmZlciA9ICRxLmRlZmVyKCk7XG4gICAgICAkcS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKHZhbHVlcykge1xuICAgICAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCF2YWx1ZXNbaV0pIHtcbiAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBuZ01vZGVsLiRuZ2ZWYWxpZGF0aW9ucy5wdXNoKHtuYW1lOiBuYW1lLCB2YWxpZDogaXNWYWxpZH0pO1xuICAgICAgICBkZWZmZXIucmVzb2x2ZShpc1ZhbGlkKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGRlZmZlci5wcm9taXNlO1xuICAgIH1cblxuICAgIHZhciBkZWZmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciBwcm9taXNlcyA9IFtdO1xuXG4gICAgcHJvbWlzZXMucHVzaCh2YWxpZGF0ZUFzeW5jKCdtYXhIZWlnaHQnLCAnaGVpZ2h0Lm1heCcsIC9pbWFnZS8sXG4gICAgICB0aGlzLmltYWdlRGltZW5zaW9ucywgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gZC5oZWlnaHQgPD0gdmFsO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygnbWluSGVpZ2h0JywgJ2hlaWdodC5taW4nLCAvaW1hZ2UvLFxuICAgICAgdGhpcy5pbWFnZURpbWVuc2lvbnMsIGZ1bmN0aW9uIChkLCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIGQuaGVpZ2h0ID49IHZhbDtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ21heFdpZHRoJywgJ3dpZHRoLm1heCcsIC9pbWFnZS8sXG4gICAgICB0aGlzLmltYWdlRGltZW5zaW9ucywgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gZC53aWR0aCA8PSB2YWw7XG4gICAgICB9KSk7XG4gICAgcHJvbWlzZXMucHVzaCh2YWxpZGF0ZUFzeW5jKCdtaW5XaWR0aCcsICd3aWR0aC5taW4nLCAvaW1hZ2UvLFxuICAgICAgdGhpcy5pbWFnZURpbWVuc2lvbnMsIGZ1bmN0aW9uIChkLCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIGQud2lkdGggPj0gdmFsO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygnZGltZW5zaW9ucycsIG51bGwsIC9pbWFnZS8sXG4gICAgICBmdW5jdGlvbiAoZmlsZSwgdmFsKSB7XG4gICAgICAgIHJldHVybiB1cGxvYWQuZW1wdHlQcm9taXNlKHZhbCk7XG4gICAgICB9LCBmdW5jdGlvbiAocikge1xuICAgICAgICByZXR1cm4gcjtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ3JhdGlvJywgbnVsbCwgL2ltYWdlLyxcbiAgICAgIHRoaXMuaW1hZ2VEaW1lbnNpb25zLCBmdW5jdGlvbiAoZCwgdmFsKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IHZhbC50b1N0cmluZygpLnNwbGl0KCcsJyksIHZhbGlkID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BsaXQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoTWF0aC5hYnMoKGQud2lkdGggLyBkLmhlaWdodCkgLSB1cGxvYWQucmF0aW9Ub0Zsb2F0KHNwbGl0W2ldKSkgPCAwLjAxKSB7XG4gICAgICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWxpZDtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ21heFJhdGlvJywgJ3JhdGlvLm1heCcsIC9pbWFnZS8sXG4gICAgICB0aGlzLmltYWdlRGltZW5zaW9ucywgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gKGQud2lkdGggLyBkLmhlaWdodCkgLSB1cGxvYWQucmF0aW9Ub0Zsb2F0KHZhbCkgPCAwLjAwMDE7XG4gICAgICB9KSk7XG4gICAgcHJvbWlzZXMucHVzaCh2YWxpZGF0ZUFzeW5jKCdtaW5SYXRpbycsICdyYXRpby5taW4nLCAvaW1hZ2UvLFxuICAgICAgdGhpcy5pbWFnZURpbWVuc2lvbnMsIGZ1bmN0aW9uIChkLCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIChkLndpZHRoIC8gZC5oZWlnaHQpIC0gdXBsb2FkLnJhdGlvVG9GbG9hdCh2YWwpID4gLTAuMDAwMTtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ21heER1cmF0aW9uJywgJ2R1cmF0aW9uLm1heCcsIC9hdWRpb3x2aWRlby8sXG4gICAgICB0aGlzLm1lZGlhRHVyYXRpb24sIGZ1bmN0aW9uIChkLCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIGQgPD0gdXBsb2FkLnRyYW5zbGF0ZVNjYWxhcnModmFsKTtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ21pbkR1cmF0aW9uJywgJ2R1cmF0aW9uLm1pbicsIC9hdWRpb3x2aWRlby8sXG4gICAgICB0aGlzLm1lZGlhRHVyYXRpb24sIGZ1bmN0aW9uIChkLCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIGQgPj0gdXBsb2FkLnRyYW5zbGF0ZVNjYWxhcnModmFsKTtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ2R1cmF0aW9uJywgbnVsbCwgL2F1ZGlvfHZpZGVvLyxcbiAgICAgIGZ1bmN0aW9uIChmaWxlLCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2UodmFsKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgIHJldHVybiByO1xuICAgICAgfSkpO1xuXG4gICAgcHJvbWlzZXMucHVzaCh2YWxpZGF0ZUFzeW5jKCd2YWxpZGF0ZUFzeW5jRm4nLCBudWxsLCBudWxsLFxuICAgICAgZnVuY3Rpb24gKGZpbGUsIHZhbCkge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgfSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgcmV0dXJuIHIgPT09IHRydWUgfHwgciA9PT0gbnVsbCB8fCByID09PSAnJztcbiAgICAgIH0pKTtcblxuICAgICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICAgIGlmIChydW5BbGxWYWxpZGF0aW9uKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgZmlsZSA9IGZpbGVzW2ldO1xuICAgICAgICAgIGlmIChmaWxlLiRlcnJvcikge1xuICAgICAgICAgICAgZmlsZXMuc3BsaWNlKGktLSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJ1bkFsbFZhbGlkYXRpb24gPSBmYWxzZTtcbiAgICAgIHZhbGlkYXRlU3luYygnbWF4RmlsZXMnLCBudWxsLCBmdW5jdGlvbiAoZmlsZSwgdmFsLCBpKSB7XG4gICAgICAgIHJldHVybiBwcmV2TGVuZ3RoICsgaSA8IHZhbDtcbiAgICAgIH0pO1xuXG4gICAgICBkZWZmZXIucmVzb2x2ZSh7J3ZhbGlkRmlsZXMnOiBmaWxlcywgJ2ludmFsaWRGaWxlcyc6IGludmFsaWRGaWxlc30pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZmZXIucHJvbWlzZTtcbiAgfTtcblxuICB1cGxvYWQuaW1hZ2VEaW1lbnNpb25zID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICBpZiAoZmlsZS4kbmdmV2lkdGggJiYgZmlsZS4kbmdmSGVpZ2h0KSB7XG4gICAgICB2YXIgZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGQucmVzb2x2ZSh7d2lkdGg6IGZpbGUuJG5nZldpZHRoLCBoZWlnaHQ6IGZpbGUuJG5nZkhlaWdodH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZC5wcm9taXNlO1xuICAgIH1cbiAgICBpZiAoZmlsZS4kbmdmRGltZW5zaW9uUHJvbWlzZSkgcmV0dXJuIGZpbGUuJG5nZkRpbWVuc2lvblByb21pc2U7XG5cbiAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChmaWxlLnR5cGUuaW5kZXhPZignaW1hZ2UnKSAhPT0gMCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ25vdCBpbWFnZScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB1cGxvYWQuZGF0YVVybChmaWxlKS50aGVuKGZ1bmN0aW9uIChkYXRhVXJsKSB7XG4gICAgICAgIHZhciBpbWcgPSBhbmd1bGFyLmVsZW1lbnQoJzxpbWc+JykuYXR0cignc3JjJywgZGF0YVVybClcbiAgICAgICAgICAuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpLmNzcygncG9zaXRpb24nLCAnZml4ZWQnKVxuICAgICAgICAgIC5jc3MoJ21heC13aWR0aCcsICdub25lICFpbXBvcnRhbnQnKS5jc3MoJ21heC1oZWlnaHQnLCAnbm9uZSAhaW1wb3J0YW50Jyk7XG5cbiAgICAgICAgZnVuY3Rpb24gc3VjY2VzcygpIHtcbiAgICAgICAgICB2YXIgd2lkdGggPSBpbWdbMF0ubmF0dXJhbFdpZHRoIHx8IGltZ1swXS5jbGllbnRXaWR0aDtcbiAgICAgICAgICB2YXIgaGVpZ2h0ID0gaW1nWzBdLm5hdHVyYWxIZWlnaHQgfHwgaW1nWzBdLmNsaWVudEhlaWdodDtcbiAgICAgICAgICBpbWcucmVtb3ZlKCk7XG4gICAgICAgICAgZmlsZS4kbmdmV2lkdGggPSB3aWR0aDtcbiAgICAgICAgICBmaWxlLiRuZ2ZIZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZXJyb3IoKSB7XG4gICAgICAgICAgaW1nLnJlbW92ZSgpO1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgnbG9hZCBlcnJvcicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaW1nLm9uKCdsb2FkJywgc3VjY2Vzcyk7XG4gICAgICAgIGltZy5vbignZXJyb3InLCBlcnJvcik7XG5cbiAgICAgICAgdmFyIHNlY29uZHNDb3VudGVyID0gMDtcbiAgICAgICAgZnVuY3Rpb24gY2hlY2tMb2FkRXJyb3JJbkNhc2VPZk5vQ2FsbGJhY2soKSB7XG4gICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGltZ1swXS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgIGlmIChpbWdbMF0uY2xpZW50V2lkdGgpIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzKCk7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoc2Vjb25kc0NvdW50ZXIrKyA+IDEwKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGVja0xvYWRFcnJvckluQ2FzZU9mTm9DYWxsYmFjaygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGVja0xvYWRFcnJvckluQ2FzZU9mTm9DYWxsYmFjaygpO1xuXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYm9keScpWzBdKS5hcHBlbmQoaW1nKTtcbiAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdsb2FkIGVycm9yJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZpbGUuJG5nZkRpbWVuc2lvblByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuICAgIGZpbGUuJG5nZkRpbWVuc2lvblByb21pc2VbJ2ZpbmFsbHknXShmdW5jdGlvbiAoKSB7XG4gICAgICBkZWxldGUgZmlsZS4kbmdmRGltZW5zaW9uUHJvbWlzZTtcbiAgICB9KTtcbiAgICByZXR1cm4gZmlsZS4kbmdmRGltZW5zaW9uUHJvbWlzZTtcbiAgfTtcblxuICB1cGxvYWQubWVkaWFEdXJhdGlvbiA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgaWYgKGZpbGUuJG5nZkR1cmF0aW9uKSB7XG4gICAgICB2YXIgZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGQucmVzb2x2ZShmaWxlLiRuZ2ZEdXJhdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkLnByb21pc2U7XG4gICAgfVxuICAgIGlmIChmaWxlLiRuZ2ZEdXJhdGlvblByb21pc2UpIHJldHVybiBmaWxlLiRuZ2ZEdXJhdGlvblByb21pc2U7XG5cbiAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChmaWxlLnR5cGUuaW5kZXhPZignYXVkaW8nKSAhPT0gMCAmJiBmaWxlLnR5cGUuaW5kZXhPZigndmlkZW8nKSAhPT0gMCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ25vdCBtZWRpYScpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB1cGxvYWQuZGF0YVVybChmaWxlKS50aGVuKGZ1bmN0aW9uIChkYXRhVXJsKSB7XG4gICAgICAgIHZhciBlbCA9IGFuZ3VsYXIuZWxlbWVudChmaWxlLnR5cGUuaW5kZXhPZignYXVkaW8nKSA9PT0gMCA/ICc8YXVkaW8+JyA6ICc8dmlkZW8+JylcbiAgICAgICAgICAuYXR0cignc3JjJywgZGF0YVVybCkuY3NzKCd2aXNpYmlsaXR5JywgJ25vbmUnKS5jc3MoJ3Bvc2l0aW9uJywgJ2ZpeGVkJyk7XG5cbiAgICAgICAgZnVuY3Rpb24gc3VjY2VzcygpIHtcbiAgICAgICAgICB2YXIgZHVyYXRpb24gPSBlbFswXS5kdXJhdGlvbjtcbiAgICAgICAgICBmaWxlLiRuZ2ZEdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgICAgIGVsLnJlbW92ZSgpO1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZHVyYXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZXJyb3IoKSB7XG4gICAgICAgICAgZWwucmVtb3ZlKCk7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdsb2FkIGVycm9yJyk7XG4gICAgICAgIH1cblxuICAgICAgICBlbC5vbignbG9hZGVkbWV0YWRhdGEnLCBzdWNjZXNzKTtcbiAgICAgICAgZWwub24oJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB2YXIgY291bnQgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNoZWNrTG9hZEVycm9yKCkge1xuICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChlbFswXS5wYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgIGlmIChlbFswXS5kdXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb3VudCA+IDEwKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjaGVja0xvYWRFcnJvcigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICBjaGVja0xvYWRFcnJvcigpO1xuXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5ib2R5KS5hcHBlbmQoZWwpO1xuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2xvYWQgZXJyb3InKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmlsZS4kbmdmRHVyYXRpb25Qcm9taXNlID0gZGVmZXJyZWQucHJvbWlzZTtcbiAgICBmaWxlLiRuZ2ZEdXJhdGlvblByb21pc2VbJ2ZpbmFsbHknXShmdW5jdGlvbiAoKSB7XG4gICAgICBkZWxldGUgZmlsZS4kbmdmRHVyYXRpb25Qcm9taXNlO1xuICAgIH0pO1xuICAgIHJldHVybiBmaWxlLiRuZ2ZEdXJhdGlvblByb21pc2U7XG4gIH07XG4gIHJldHVybiB1cGxvYWQ7XG59XG5dKTtcblxubmdGaWxlVXBsb2FkLnNlcnZpY2UoJ1VwbG9hZFJlc2l6ZScsIFsnVXBsb2FkVmFsaWRhdGUnLCAnJHEnLCBmdW5jdGlvbiAoVXBsb2FkVmFsaWRhdGUsICRxKSB7XG4gIHZhciB1cGxvYWQgPSBVcGxvYWRWYWxpZGF0ZTtcblxuICAvKipcbiAgICogQ29uc2VydmUgYXNwZWN0IHJhdGlvIG9mIHRoZSBvcmlnaW5hbCByZWdpb24uIFVzZWZ1bCB3aGVuIHNocmlua2luZy9lbmxhcmdpbmdcbiAgICogaW1hZ2VzIHRvIGZpdCBpbnRvIGEgY2VydGFpbiBhcmVhLlxuICAgKiBTb3VyY2U6ICBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDczMTkyMlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gc3JjV2lkdGggU291cmNlIGFyZWEgd2lkdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHNyY0hlaWdodCBTb3VyY2UgYXJlYSBoZWlnaHRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG1heFdpZHRoIE5lc3RhYmxlIGFyZWEgbWF4aW11bSBhdmFpbGFibGUgd2lkdGhcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG1heEhlaWdodCBOZXN0YWJsZSBhcmVhIG1heGltdW0gYXZhaWxhYmxlIGhlaWdodFxuICAgKiBAcmV0dXJuIHtPYmplY3R9IHsgd2lkdGgsIGhlaWdodCB9XG4gICAqL1xuICB2YXIgY2FsY3VsYXRlQXNwZWN0UmF0aW9GaXQgPSBmdW5jdGlvbiAoc3JjV2lkdGgsIHNyY0hlaWdodCwgbWF4V2lkdGgsIG1heEhlaWdodCwgY2VudGVyQ3JvcCkge1xuICAgIHZhciByYXRpbyA9IGNlbnRlckNyb3AgPyBNYXRoLm1heChtYXhXaWR0aCAvIHNyY1dpZHRoLCBtYXhIZWlnaHQgLyBzcmNIZWlnaHQpIDpcbiAgICAgIE1hdGgubWluKG1heFdpZHRoIC8gc3JjV2lkdGgsIG1heEhlaWdodCAvIHNyY0hlaWdodCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpZHRoOiBzcmNXaWR0aCAqIHJhdGlvLCBoZWlnaHQ6IHNyY0hlaWdodCAqIHJhdGlvLFxuICAgICAgbWFyZ2luWDogc3JjV2lkdGggKiByYXRpbyAtIG1heFdpZHRoLCBtYXJnaW5ZOiBzcmNIZWlnaHQgKiByYXRpbyAtIG1heEhlaWdodFxuICAgIH07XG4gIH07XG5cbiAgLy8gRXh0cmFjdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3JvbWVsZ29tZXovYW5ndWxhci1maXJlYmFzZS1pbWFnZS11cGxvYWQvYmxvYi9tYXN0ZXIvYXBwL3NjcmlwdHMvZmlsZVVwbG9hZC5qcyNMODlcbiAgdmFyIHJlc2l6ZSA9IGZ1bmN0aW9uIChpbWFnZW4sIHdpZHRoLCBoZWlnaHQsIHF1YWxpdHksIHR5cGUsIHJhdGlvLCBjZW50ZXJDcm9wLCByZXNpemVJZikge1xuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIGNhbnZhc0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB2YXIgaW1hZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgaW1hZ2VFbGVtZW50LnNldEF0dHJpYnV0ZSgnc3R5bGUnLCAndmlzaWJpbGl0eTpoaWRkZW47cG9zaXRpb246Zml4ZWQ7ei1pbmRleDotMTAwMDAwJyk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChpbWFnZUVsZW1lbnQpO1xuXG4gICAgaW1hZ2VFbGVtZW50Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpbWdXaWR0aCA9IGltYWdlRWxlbWVudC53aWR0aCwgaW1nSGVpZ2h0ID0gaW1hZ2VFbGVtZW50LmhlaWdodDtcbiAgICAgIGltYWdlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGltYWdlRWxlbWVudCk7XG4gICAgICBpZiAocmVzaXplSWYgIT0gbnVsbCAmJiByZXNpemVJZihpbWdXaWR0aCwgaW1nSGVpZ2h0KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdyZXNpemVJZicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICBpZiAocmF0aW8pIHtcbiAgICAgICAgICB2YXIgcmF0aW9GbG9hdCA9IHVwbG9hZC5yYXRpb1RvRmxvYXQocmF0aW8pO1xuICAgICAgICAgIHZhciBpbWdSYXRpbyA9IGltZ1dpZHRoIC8gaW1nSGVpZ2h0O1xuICAgICAgICAgIGlmIChpbWdSYXRpbyA8IHJhdGlvRmxvYXQpIHtcbiAgICAgICAgICAgIHdpZHRoID0gaW1nV2lkdGg7XG4gICAgICAgICAgICBoZWlnaHQgPSB3aWR0aCAvIHJhdGlvRmxvYXQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGhlaWdodCA9IGltZ0hlaWdodDtcbiAgICAgICAgICAgIHdpZHRoID0gaGVpZ2h0ICogcmF0aW9GbG9hdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF3aWR0aCkge1xuICAgICAgICAgIHdpZHRoID0gaW1nV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoZWlnaHQpIHtcbiAgICAgICAgICBoZWlnaHQgPSBpbWdIZWlnaHQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpbWVuc2lvbnMgPSBjYWxjdWxhdGVBc3BlY3RSYXRpb0ZpdChpbWdXaWR0aCwgaW1nSGVpZ2h0LCB3aWR0aCwgaGVpZ2h0LCBjZW50ZXJDcm9wKTtcbiAgICAgICAgY2FudmFzRWxlbWVudC53aWR0aCA9IE1hdGgubWluKGRpbWVuc2lvbnMud2lkdGgsIHdpZHRoKTtcbiAgICAgICAgY2FudmFzRWxlbWVudC5oZWlnaHQgPSBNYXRoLm1pbihkaW1lbnNpb25zLmhlaWdodCwgaGVpZ2h0KTtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBjYW52YXNFbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGltYWdlRWxlbWVudCxcbiAgICAgICAgICBNYXRoLm1pbigwLCAtZGltZW5zaW9ucy5tYXJnaW5YIC8gMiksIE1hdGgubWluKDAsIC1kaW1lbnNpb25zLm1hcmdpblkgLyAyKSxcbiAgICAgICAgICBkaW1lbnNpb25zLndpZHRoLCBkaW1lbnNpb25zLmhlaWdodCk7XG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2FudmFzRWxlbWVudC50b0RhdGFVUkwodHlwZSB8fCAnaW1hZ2UvV2ViUCcsIHF1YWxpdHkgfHwgMC45MzQpKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgaW1hZ2VFbGVtZW50Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpbWFnZUVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpbWFnZUVsZW1lbnQpO1xuICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgfTtcbiAgICBpbWFnZUVsZW1lbnQuc3JjID0gaW1hZ2VuO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG4gIHVwbG9hZC5kYXRhVXJsdG9CbG9iID0gZnVuY3Rpb24gKGRhdGF1cmwsIG5hbWUsIG9yaWdTaXplKSB7XG4gICAgdmFyIGFyciA9IGRhdGF1cmwuc3BsaXQoJywnKSwgbWltZSA9IGFyclswXS5tYXRjaCgvOiguKj8pOy8pWzFdLFxuICAgICAgYnN0ciA9IGF0b2IoYXJyWzFdKSwgbiA9IGJzdHIubGVuZ3RoLCB1OGFyciA9IG5ldyBVaW50OEFycmF5KG4pO1xuICAgIHdoaWxlIChuLS0pIHtcbiAgICAgIHU4YXJyW25dID0gYnN0ci5jaGFyQ29kZUF0KG4pO1xuICAgIH1cbiAgICB2YXIgYmxvYiA9IG5ldyB3aW5kb3cuQmxvYihbdThhcnJdLCB7dHlwZTogbWltZX0pO1xuICAgIGJsb2IubmFtZSA9IG5hbWU7XG4gICAgYmxvYi4kbmdmT3JpZ1NpemUgPSBvcmlnU2l6ZTtcbiAgICByZXR1cm4gYmxvYjtcbiAgfTtcblxuICB1cGxvYWQuaXNSZXNpemVTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICByZXR1cm4gd2luZG93LmF0b2IgJiYgZWxlbS5nZXRDb250ZXh0ICYmIGVsZW0uZ2V0Q29udGV4dCgnMmQnKSAmJiB3aW5kb3cuQmxvYjtcbiAgfTtcblxuICBpZiAodXBsb2FkLmlzUmVzaXplU3VwcG9ydGVkKCkpIHtcbiAgICAvLyBhZGQgbmFtZSBnZXR0ZXIgdG8gdGhlIGJsb2IgY29uc3RydWN0b3IgcHJvdG90eXBlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdpbmRvdy5CbG9iLnByb3RvdHlwZSwgJ25hbWUnLCB7XG4gICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJG5nZk5hbWU7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiAodikge1xuICAgICAgICB0aGlzLiRuZ2ZOYW1lID0gdjtcbiAgICAgIH0sXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwbG9hZC5yZXNpemUgPSBmdW5jdGlvbiAoZmlsZSwgb3B0aW9ucykge1xuICAgIGlmIChmaWxlLnR5cGUuaW5kZXhPZignaW1hZ2UnKSAhPT0gMCkgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2UoZmlsZSk7XG5cbiAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIHVwbG9hZC5kYXRhVXJsKGZpbGUsIHRydWUpLnRoZW4oZnVuY3Rpb24gKHVybCkge1xuICAgICAgcmVzaXplKHVybCwgb3B0aW9ucy53aWR0aCwgb3B0aW9ucy5oZWlnaHQsIG9wdGlvbnMucXVhbGl0eSwgb3B0aW9ucy50eXBlIHx8IGZpbGUudHlwZSxcbiAgICAgICAgb3B0aW9ucy5yYXRpbywgb3B0aW9ucy5jZW50ZXJDcm9wLCBvcHRpb25zLnJlc2l6ZUlmKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YVVybCkge1xuICAgICAgICAgIGlmIChmaWxlLnR5cGUgPT09ICdpbWFnZS9qcGVnJyAmJiBvcHRpb25zLnJlc3RvcmVFeGlmICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZGF0YVVybCA9IHVwbG9hZC5yZXN0b3JlRXhpZih1cmwsIGRhdGFVcmwpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHt0aHJvdyBlO30sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIGJsb2IgPSB1cGxvYWQuZGF0YVVybHRvQmxvYihkYXRhVXJsLCBmaWxlLm5hbWUsIGZpbGUuc2l6ZSk7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJsb2IpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgaWYgKHIgPT09ICdyZXNpemVJZicpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChyKTtcbiAgICAgICAgfSk7XG4gICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfTtcblxuICByZXR1cm4gdXBsb2FkO1xufV0pO1xuXG4oZnVuY3Rpb24gKCkge1xuICBuZ0ZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ2ZEcm9wJywgWyckcGFyc2UnLCAnJHRpbWVvdXQnLCAnJHdpbmRvdycsICdVcGxvYWQnLCAnJGh0dHAnLCAnJHEnLFxuICAgIGZ1bmN0aW9uICgkcGFyc2UsICR0aW1lb3V0LCAkd2luZG93LCBVcGxvYWQsICRodHRwLCAkcSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBRUMnLFxuICAgICAgICByZXF1aXJlOiAnP25nTW9kZWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIsIG5nTW9kZWwpIHtcbiAgICAgICAgICBsaW5rRHJvcChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCwgJHBhcnNlLCAkdGltZW91dCwgJHdpbmRvdywgVXBsb2FkLCAkaHR0cCwgJHEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1dKTtcblxuICBuZ0ZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ2ZOb0ZpbGVEcm9wJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0pIHtcbiAgICAgIGlmIChkcm9wQXZhaWxhYmxlKCkpIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICB9O1xuICB9KTtcblxuICBuZ0ZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ2ZEcm9wQXZhaWxhYmxlJywgWyckcGFyc2UnLCAnJHRpbWVvdXQnLCAnVXBsb2FkJywgZnVuY3Rpb24gKCRwYXJzZSwgJHRpbWVvdXQsIFVwbG9hZCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoc2NvcGUsIGVsZW0sIGF0dHIpIHtcbiAgICAgIGlmIChkcm9wQXZhaWxhYmxlKCkpIHtcbiAgICAgICAgdmFyIG1vZGVsID0gJHBhcnNlKFVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZEcm9wQXZhaWxhYmxlJywgYXR0cikpO1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbW9kZWwoc2NvcGUpO1xuICAgICAgICAgIGlmIChtb2RlbC5hc3NpZ24pIHtcbiAgICAgICAgICAgIG1vZGVsLmFzc2lnbihzY29wZSwgdHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSk7XG5cbiAgZnVuY3Rpb24gbGlua0Ryb3Aoc2NvcGUsIGVsZW0sIGF0dHIsIG5nTW9kZWwsICRwYXJzZSwgJHRpbWVvdXQsICR3aW5kb3csIHVwbG9hZCwgJGh0dHAsICRxKSB7XG4gICAgdmFyIGF2YWlsYWJsZSA9IGRyb3BBdmFpbGFibGUoKTtcblxuICAgIHZhciBhdHRyR2V0dGVyID0gZnVuY3Rpb24gKG5hbWUsIHNjb3BlLCBwYXJhbXMpIHtcbiAgICAgIHJldHVybiB1cGxvYWQuYXR0ckdldHRlcihuYW1lLCBhdHRyLCBzY29wZSwgcGFyYW1zKTtcbiAgICB9O1xuXG4gICAgaWYgKGF0dHJHZXR0ZXIoJ2Ryb3BBdmFpbGFibGUnKSkge1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoc2NvcGVbYXR0ckdldHRlcignZHJvcEF2YWlsYWJsZScpXSkge1xuICAgICAgICAgIHNjb3BlW2F0dHJHZXR0ZXIoJ2Ryb3BBdmFpbGFibGUnKV0udmFsdWUgPSBhdmFpbGFibGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2NvcGVbYXR0ckdldHRlcignZHJvcEF2YWlsYWJsZScpXSA9IGF2YWlsYWJsZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICghYXZhaWxhYmxlKSB7XG4gICAgICBpZiAoYXR0ckdldHRlcignbmdmSGlkZU9uRHJvcE5vdEF2YWlsYWJsZScsIHNjb3BlKSA9PT0gdHJ1ZSkge1xuICAgICAgICBlbGVtLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEaXNhYmxlZCgpIHtcbiAgICAgIHJldHVybiBlbGVtLmF0dHIoJ2Rpc2FibGVkJykgfHwgYXR0ckdldHRlcignbmdmRHJvcERpc2FibGVkJywgc2NvcGUpO1xuICAgIH1cblxuICAgIGlmIChhdHRyR2V0dGVyKCduZ2ZTZWxlY3QnKSA9PSBudWxsKSB7XG4gICAgICB1cGxvYWQucmVnaXN0ZXJNb2RlbENoYW5nZVZhbGlkYXRvcihuZ01vZGVsLCBhdHRyLCBzY29wZSk7XG4gICAgfVxuXG4gICAgdmFyIGxlYXZlVGltZW91dCA9IG51bGw7XG4gICAgdmFyIHN0b3BQcm9wYWdhdGlvbiA9ICRwYXJzZShhdHRyR2V0dGVyKCduZ2ZTdG9wUHJvcGFnYXRpb24nKSk7XG4gICAgdmFyIGRyYWdPdmVyRGVsYXkgPSAxO1xuICAgIHZhciBhY3R1YWxEcmFnT3ZlckNsYXNzO1xuXG4gICAgZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKCdkcmFnb3ZlcicsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgIGlmIChpc0Rpc2FibGVkKCkgfHwgIXVwbG9hZC5zaG91bGRVcGRhdGVPbignZHJvcCcsIGF0dHIsIHNjb3BlKSkgcmV0dXJuO1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAoc3RvcFByb3BhZ2F0aW9uKHNjb3BlKSkgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgLy8gaGFuZGxpbmcgZHJhZ292ZXIgZXZlbnRzIGZyb20gdGhlIENocm9tZSBkb3dubG9hZCBiYXJcbiAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Nocm9tZScpID4gLTEpIHtcbiAgICAgICAgdmFyIGIgPSBldnQuZGF0YVRyYW5zZmVyLmVmZmVjdEFsbG93ZWQ7XG4gICAgICAgIGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICgnbW92ZScgPT09IGIgfHwgJ2xpbmtNb3ZlJyA9PT0gYikgPyAnbW92ZScgOiAnY29weSc7XG4gICAgICB9XG4gICAgICAkdGltZW91dC5jYW5jZWwobGVhdmVUaW1lb3V0KTtcbiAgICAgIGlmICghYWN0dWFsRHJhZ092ZXJDbGFzcykge1xuICAgICAgICBhY3R1YWxEcmFnT3ZlckNsYXNzID0gJ0MnO1xuICAgICAgICBjYWxjdWxhdGVEcmFnT3ZlckNsYXNzKHNjb3BlLCBhdHRyLCBldnQsIGZ1bmN0aW9uIChjbGF6eikge1xuICAgICAgICAgIGFjdHVhbERyYWdPdmVyQ2xhc3MgPSBjbGF6ejtcbiAgICAgICAgICBlbGVtLmFkZENsYXNzKGFjdHVhbERyYWdPdmVyQ2xhc3MpO1xuICAgICAgICAgIGF0dHJHZXR0ZXIoJ25nZkRyYWcnLCBzY29wZSwgeyRpc0RyYWdnaW5nOiB0cnVlLCAkY2xhc3M6IGFjdHVhbERyYWdPdmVyQ2xhc3MsICRldmVudDogZXZ0fSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIGZhbHNlKTtcbiAgICBlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdlbnRlcicsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgIGlmIChpc0Rpc2FibGVkKCkgfHwgIXVwbG9hZC5zaG91bGRVcGRhdGVPbignZHJvcCcsIGF0dHIsIHNjb3BlKSkgcmV0dXJuO1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAoc3RvcFByb3BhZ2F0aW9uKHNjb3BlKSkgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0sIGZhbHNlKTtcbiAgICBlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgIGlmIChpc0Rpc2FibGVkKCkgfHwgIXVwbG9hZC5zaG91bGRVcGRhdGVPbignZHJvcCcsIGF0dHIsIHNjb3BlKSkgcmV0dXJuO1xuICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAoc3RvcFByb3BhZ2F0aW9uKHNjb3BlKSkgZXZ0LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgbGVhdmVUaW1lb3V0ID0gJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoYWN0dWFsRHJhZ092ZXJDbGFzcykgZWxlbS5yZW1vdmVDbGFzcyhhY3R1YWxEcmFnT3ZlckNsYXNzKTtcbiAgICAgICAgYWN0dWFsRHJhZ092ZXJDbGFzcyA9IG51bGw7XG4gICAgICAgIGF0dHJHZXR0ZXIoJ25nZkRyYWcnLCBzY29wZSwgeyRpc0RyYWdnaW5nOiBmYWxzZSwgJGV2ZW50OiBldnR9KTtcbiAgICAgIH0sIGRyYWdPdmVyRGVsYXkgfHwgMTAwKTtcbiAgICB9LCBmYWxzZSk7XG4gICAgZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKCdkcm9wJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgaWYgKGlzRGlzYWJsZWQoKSB8fCAhdXBsb2FkLnNob3VsZFVwZGF0ZU9uKCdkcm9wJywgYXR0ciwgc2NvcGUpKSByZXR1cm47XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChzdG9wUHJvcGFnYXRpb24oc2NvcGUpKSBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBpZiAoYWN0dWFsRHJhZ092ZXJDbGFzcykgZWxlbS5yZW1vdmVDbGFzcyhhY3R1YWxEcmFnT3ZlckNsYXNzKTtcbiAgICAgIGFjdHVhbERyYWdPdmVyQ2xhc3MgPSBudWxsO1xuICAgICAgdmFyIGl0ZW1zID0gZXZ0LmRhdGFUcmFuc2Zlci5pdGVtcztcbiAgICAgIHZhciBodG1sO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaHRtbCA9IGV2dC5kYXRhVHJhbnNmZXIgJiYgZXZ0LmRhdGFUcmFuc2Zlci5nZXREYXRhICYmIGV2dC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgndGV4dC9odG1sJyk7XG4gICAgICB9IGNhdGNoIChlKSB7LyogRml4IElFMTEgdGhhdCB0aHJvdyBlcnJvciBjYWxsaW5nIGdldERhdGEgKi9cbiAgICAgIH1cblxuICAgICAgZXh0cmFjdEZpbGVzKGl0ZW1zLCBldnQuZGF0YVRyYW5zZmVyLmZpbGVzLCBhdHRyR2V0dGVyKCduZ2ZBbGxvd0RpcicsIHNjb3BlKSAhPT0gZmFsc2UsXG4gICAgICAgIGF0dHJHZXR0ZXIoJ211bHRpcGxlJykgfHwgYXR0ckdldHRlcignbmdmTXVsdGlwbGUnLCBzY29wZSkpLnRoZW4oZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgIGlmIChmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB1cGRhdGVNb2RlbChmaWxlcywgZXZ0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHRyYWN0RmlsZXNGcm9tSHRtbCgnZHJvcFVybCcsIGh0bWwpLnRoZW4oZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgICAgICB1cGRhdGVNb2RlbChmaWxlcywgZXZ0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgZmFsc2UpO1xuICAgIGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcigncGFzdGUnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2ZpcmVmb3gnKSA+IC0xICYmXG4gICAgICAgIGF0dHJHZXR0ZXIoJ25nZkVuYWJsZUZpcmVmb3hQYXN0ZScsIHNjb3BlKSkge1xuICAgICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICAgIGlmIChpc0Rpc2FibGVkKCkgfHwgIXVwbG9hZC5zaG91bGRVcGRhdGVPbigncGFzdGUnLCBhdHRyLCBzY29wZSkpIHJldHVybjtcbiAgICAgIHZhciBmaWxlcyA9IFtdO1xuICAgICAgdmFyIGNsaXBib2FyZCA9IGV2dC5jbGlwYm9hcmREYXRhIHx8IGV2dC5vcmlnaW5hbEV2ZW50LmNsaXBib2FyZERhdGE7XG4gICAgICBpZiAoY2xpcGJvYXJkICYmIGNsaXBib2FyZC5pdGVtcykge1xuICAgICAgICBmb3IgKHZhciBrID0gMDsgayA8IGNsaXBib2FyZC5pdGVtcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgIGlmIChjbGlwYm9hcmQuaXRlbXNba10udHlwZS5pbmRleE9mKCdpbWFnZScpICE9PSAtMSkge1xuICAgICAgICAgICAgZmlsZXMucHVzaChjbGlwYm9hcmQuaXRlbXNba10uZ2V0QXNGaWxlKCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZpbGVzLmxlbmd0aCkge1xuICAgICAgICB1cGRhdGVNb2RlbChmaWxlcywgZXZ0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4dHJhY3RGaWxlc0Zyb21IdG1sKCdwYXN0ZVVybCcsIGNsaXBib2FyZCkudGhlbihmdW5jdGlvbiAoZmlsZXMpIHtcbiAgICAgICAgICB1cGRhdGVNb2RlbChmaWxlcywgZXZ0KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgZmFsc2UpO1xuXG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKCdmaXJlZm94JykgPiAtMSAmJlxuICAgICAgYXR0ckdldHRlcignbmdmRW5hYmxlRmlyZWZveFBhc3RlJywgc2NvcGUpKSB7XG4gICAgICBlbGVtLmF0dHIoJ2NvbnRlbnRlZGl0YWJsZScsIHRydWUpO1xuICAgICAgZWxlbS5vbigna2V5cHJlc3MnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoIWUubWV0YUtleSAmJiAhZS5jdHJsS2V5KSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGRhdGVNb2RlbChmaWxlcywgZXZ0KSB7XG4gICAgICB1cGxvYWQudXBkYXRlTW9kZWwobmdNb2RlbCwgYXR0ciwgc2NvcGUsIGF0dHJHZXR0ZXIoJ25nZkNoYW5nZScpIHx8IGF0dHJHZXR0ZXIoJ25nZkRyb3AnKSwgZmlsZXMsIGV2dCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdEZpbGVzRnJvbUh0bWwodXBkYXRlT24sIGh0bWwpIHtcbiAgICAgIGlmICghdXBsb2FkLnNob3VsZFVwZGF0ZU9uKHVwZGF0ZU9uLCBhdHRyLCBzY29wZSkgfHwgdHlwZW9mIGh0bWwgIT09ICdzdHJpbmcnKSByZXR1cm4gdXBsb2FkLnJlamVjdFByb21pc2UoW10pO1xuICAgICAgdmFyIHVybHMgPSBbXTtcbiAgICAgIGh0bWwucmVwbGFjZSgvPChpbWcgc3JjfGltZyBbXj5dKiBzcmMpICo9XFxcIihbXlxcXCJdKilcXFwiL2dpLCBmdW5jdGlvbiAobSwgbiwgc3JjKSB7XG4gICAgICAgIHVybHMucHVzaChzcmMpO1xuICAgICAgfSk7XG4gICAgICB2YXIgcHJvbWlzZXMgPSBbXSwgZmlsZXMgPSBbXTtcbiAgICAgIGlmICh1cmxzLmxlbmd0aCkge1xuICAgICAgICBhbmd1bGFyLmZvckVhY2godXJscywgZnVuY3Rpb24gKHVybCkge1xuICAgICAgICAgIHByb21pc2VzLnB1c2godXBsb2FkLnVybFRvQmxvYih1cmwpLnRoZW4oZnVuY3Rpb24gKGJsb2IpIHtcbiAgICAgICAgICAgIGZpbGVzLnB1c2goYmxvYik7XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICAgICAgJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBkZWZlci5yZXNvbHZlKGZpbGVzKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBkZWZlci5yZWplY3QoZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB1cGxvYWQuZW1wdHlQcm9taXNlKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsY3VsYXRlRHJhZ092ZXJDbGFzcyhzY29wZSwgYXR0ciwgZXZ0LCBjYWxsYmFjaykge1xuICAgICAgdmFyIG9iaiA9IGF0dHJHZXR0ZXIoJ25nZkRyYWdPdmVyQ2xhc3MnLCBzY29wZSwgeyRldmVudDogZXZ0fSksIGRDbGFzcyA9ICdkcmFnb3Zlcic7XG4gICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhvYmopKSB7XG4gICAgICAgIGRDbGFzcyA9IG9iajtcbiAgICAgIH0gZWxzZSBpZiAob2JqKSB7XG4gICAgICAgIGlmIChvYmouZGVsYXkpIGRyYWdPdmVyRGVsYXkgPSBvYmouZGVsYXk7XG4gICAgICAgIGlmIChvYmouYWNjZXB0IHx8IG9iai5yZWplY3QpIHtcbiAgICAgICAgICB2YXIgaXRlbXMgPSBldnQuZGF0YVRyYW5zZmVyLml0ZW1zO1xuICAgICAgICAgIGlmIChpdGVtcyA9PSBudWxsIHx8ICFpdGVtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRDbGFzcyA9IG9iai5hY2NlcHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBwYXR0ZXJuID0gb2JqLnBhdHRlcm4gfHwgYXR0ckdldHRlcignbmdmUGF0dGVybicsIHNjb3BlLCB7JGV2ZW50OiBldnR9KTtcbiAgICAgICAgICAgIHZhciBsZW4gPSBpdGVtcy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgaWYgKCF1cGxvYWQudmFsaWRhdGVQYXR0ZXJuKGl0ZW1zW2xlbl0sIHBhdHRlcm4pKSB7XG4gICAgICAgICAgICAgICAgZENsYXNzID0gb2JqLnJlamVjdDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkQ2xhc3MgPSBvYmouYWNjZXB0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjYWxsYmFjayhkQ2xhc3MpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4dHJhY3RGaWxlcyhpdGVtcywgZmlsZUxpc3QsIGFsbG93RGlyLCBtdWx0aXBsZSkge1xuICAgICAgdmFyIG1heEZpbGVzID0gdXBsb2FkLmdldFZhbGlkYXRpb25BdHRyKGF0dHIsIHNjb3BlLCAnbWF4RmlsZXMnKTtcbiAgICAgIGlmIChtYXhGaWxlcyA9PSBudWxsKSB7XG4gICAgICAgIG1heEZpbGVzID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICAgIH1cbiAgICAgIHZhciBtYXhUb3RhbFNpemUgPSB1cGxvYWQuZ2V0VmFsaWRhdGlvbkF0dHIoYXR0ciwgc2NvcGUsICdtYXhUb3RhbFNpemUnKTtcbiAgICAgIGlmIChtYXhUb3RhbFNpemUgPT0gbnVsbCkge1xuICAgICAgICBtYXhUb3RhbFNpemUgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgfVxuICAgICAgdmFyIGluY2x1ZGVEaXIgPSBhdHRyR2V0dGVyKCduZ2ZJbmNsdWRlRGlyJywgc2NvcGUpO1xuICAgICAgdmFyIGZpbGVzID0gW10sIHRvdGFsU2l6ZSA9IDA7XG5cbiAgICAgIGZ1bmN0aW9uIHRyYXZlcnNlRmlsZVRyZWUoZW50cnksIHBhdGgpIHtcbiAgICAgICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICAgICAgaWYgKGVudHJ5ICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIHZhciBwcm9taXNlcyA9IFt1cGxvYWQuZW1wdHlQcm9taXNlKCldO1xuICAgICAgICAgICAgaWYgKGluY2x1ZGVEaXIpIHtcbiAgICAgICAgICAgICAgdmFyIGZpbGUgPSB7dHlwZTogJ2RpcmVjdG9yeSd9O1xuICAgICAgICAgICAgICBmaWxlLm5hbWUgPSBmaWxlLnBhdGggPSAocGF0aCB8fCAnJykgKyBlbnRyeS5uYW1lO1xuICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRpclJlYWRlciA9IGVudHJ5LmNyZWF0ZVJlYWRlcigpO1xuICAgICAgICAgICAgdmFyIGVudHJpZXMgPSBbXTtcbiAgICAgICAgICAgIHZhciByZWFkRW50cmllcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZGlyUmVhZGVyLnJlYWRFbnRyaWVzKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGlmICghcmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGVudHJpZXMuc2xpY2UoMCksIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA8PSBtYXhGaWxlcyAmJiB0b3RhbFNpemUgPD0gbWF4VG90YWxTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYXZlcnNlRmlsZVRyZWUoZSwgKHBhdGggPyBwYXRoIDogJycpICsgZW50cnkubmFtZSArICcvJykpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbnRyaWVzID0gZW50cmllcy5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwocmVzdWx0cyB8fCBbXSwgMCkpO1xuICAgICAgICAgICAgICAgICAgICByZWFkRW50cmllcygpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZWFkRW50cmllcygpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbnRyeS5maWxlKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZmlsZS5wYXRoID0gKHBhdGggPyBwYXRoIDogJycpICsgZmlsZS5uYW1lO1xuICAgICAgICAgICAgICAgIGlmIChpbmNsdWRlRGlyKSB7XG4gICAgICAgICAgICAgICAgICBmaWxlID0gdXBsb2FkLnJlbmFtZShmaWxlLCBmaWxlLnBhdGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICAgIHRvdGFsU2l6ZSArPSBmaWxlLnNpemU7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICBkZWZlci5yZWplY3QoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlcyA9IFt1cGxvYWQuZW1wdHlQcm9taXNlKCldO1xuXG4gICAgICBpZiAoaXRlbXMgJiYgaXRlbXMubGVuZ3RoID4gMCAmJiAkd2luZG93LmxvY2F0aW9uLnByb3RvY29sICE9PSAnZmlsZTonKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSAmJiBpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCkgJiYgaXRlbXNbaV0ud2Via2l0R2V0QXNFbnRyeSgpLmlzRGlyZWN0b3J5KSB7XG4gICAgICAgICAgICB2YXIgZW50cnkgPSBpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCk7XG4gICAgICAgICAgICBpZiAoZW50cnkuaXNEaXJlY3RvcnkgJiYgIWFsbG93RGlyKSB7XG4gICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVudHJ5ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgcHJvbWlzZXMucHVzaCh0cmF2ZXJzZUZpbGVUcmVlKGVudHJ5KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBmID0gaXRlbXNbaV0uZ2V0QXNGaWxlKCk7XG4gICAgICAgICAgICBpZiAoZiAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIGZpbGVzLnB1c2goZik7XG4gICAgICAgICAgICAgIHRvdGFsU2l6ZSArPSBmLnNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChmaWxlcy5sZW5ndGggPiBtYXhGaWxlcyB8fCB0b3RhbFNpemUgPiBtYXhUb3RhbFNpemUgfHxcbiAgICAgICAgICAgICghbXVsdGlwbGUgJiYgZmlsZXMubGVuZ3RoID4gMCkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZmlsZUxpc3QgIT0gbnVsbCkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZmlsZUxpc3QubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBmaWxlID0gZmlsZUxpc3QuaXRlbShqKTtcbiAgICAgICAgICAgIGlmIChmaWxlLnR5cGUgfHwgZmlsZS5zaXplID4gMCkge1xuICAgICAgICAgICAgICBmaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICB0b3RhbFNpemUgKz0gZmlsZS5zaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IG1heEZpbGVzIHx8IHRvdGFsU2l6ZSA+IG1heFRvdGFsU2l6ZSB8fFxuICAgICAgICAgICAgICAoIW11bHRpcGxlICYmIGZpbGVzLmxlbmd0aCA+IDApKSBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICAgICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghbXVsdGlwbGUgJiYgIWluY2x1ZGVEaXIgJiYgZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgIHdoaWxlIChmaWxlc1tpXSAmJiBmaWxlc1tpXS50eXBlID09PSAnZGlyZWN0b3J5JykgaSsrO1xuICAgICAgICAgIGRlZmVyLnJlc29sdmUoW2ZpbGVzW2ldXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXIucmVzb2x2ZShmaWxlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGRlZmVyLnJlamVjdChlKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkcm9wQXZhaWxhYmxlKCkge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICByZXR1cm4gKCdkcmFnZ2FibGUnIGluIGRpdikgJiYgKCdvbmRyb3AnIGluIGRpdikgJiYgIS9FZGdlXFwvMTIuL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgfVxuXG59KSgpO1xuXG4vLyBjdXN0b21pemVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2V4aWYtanMvZXhpZi1qc1xubmdGaWxlVXBsb2FkLnNlcnZpY2UoJ1VwbG9hZEV4aWYnLCBbJ1VwbG9hZFJlc2l6ZScsICckcScsIGZ1bmN0aW9uIChVcGxvYWRSZXNpemUsICRxKSB7XG4gIHZhciB1cGxvYWQgPSBVcGxvYWRSZXNpemU7XG5cbiAgdXBsb2FkLmlzRXhpZlN1cHBvcnRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gd2luZG93LkZpbGVSZWFkZXIgJiYgbmV3IEZpbGVSZWFkZXIoKS5yZWFkQXNBcnJheUJ1ZmZlciAmJiB1cGxvYWQuaXNSZXNpemVTdXBwb3J0ZWQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBhcHBseVRyYW5zZm9ybShjdHgsIG9yaWVudGF0aW9uLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgc3dpdGNoIChvcmllbnRhdGlvbikge1xuICAgICAgY2FzZSAyOlxuICAgICAgICByZXR1cm4gY3R4LnRyYW5zZm9ybSgtMSwgMCwgMCwgMSwgd2lkdGgsIDApO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gY3R4LnRyYW5zZm9ybSgtMSwgMCwgMCwgLTEsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgY2FzZSA0OlxuICAgICAgICByZXR1cm4gY3R4LnRyYW5zZm9ybSgxLCAwLCAwLCAtMSwgMCwgaGVpZ2h0KTtcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgcmV0dXJuIGN0eC50cmFuc2Zvcm0oMCwgMSwgMSwgMCwgMCwgMCk7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIHJldHVybiBjdHgudHJhbnNmb3JtKDAsIDEsIC0xLCAwLCBoZWlnaHQsIDApO1xuICAgICAgY2FzZSA3OlxuICAgICAgICByZXR1cm4gY3R4LnRyYW5zZm9ybSgwLCAtMSwgLTEsIDAsIGhlaWdodCwgd2lkdGgpO1xuICAgICAgY2FzZSA4OlxuICAgICAgICByZXR1cm4gY3R4LnRyYW5zZm9ybSgwLCAtMSwgMSwgMCwgMCwgd2lkdGgpO1xuICAgIH1cbiAgfVxuXG4gIHVwbG9hZC5yZWFkT3JpZW50YXRpb24gPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgdmFyIHNsaWNlZEZpbGUgPSBmaWxlLnNsaWNlID8gZmlsZS5zbGljZSgwLCA2NCAqIDEwMjQpIDogZmlsZTtcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoc2xpY2VkRmlsZSk7XG4gICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgcmV0dXJuIGRlZmVyLnJlamVjdChlKTtcbiAgICB9O1xuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIHJlc3VsdCA9IHtvcmllbnRhdGlvbjogMX07XG4gICAgICB2YXIgdmlldyA9IG5ldyBEYXRhVmlldyh0aGlzLnJlc3VsdCk7XG4gICAgICBpZiAodmlldy5nZXRVaW50MTYoMCwgZmFsc2UpICE9PSAweEZGRDgpIHJldHVybiBkZWZlci5yZXNvbHZlKHJlc3VsdCk7XG5cbiAgICAgIHZhciBsZW5ndGggPSB2aWV3LmJ5dGVMZW5ndGgsXG4gICAgICAgIG9mZnNldCA9IDI7XG4gICAgICB3aGlsZSAob2Zmc2V0IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBtYXJrZXIgPSB2aWV3LmdldFVpbnQxNihvZmZzZXQsIGZhbHNlKTtcbiAgICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICAgIGlmIChtYXJrZXIgPT09IDB4RkZFMSkge1xuICAgICAgICAgIGlmICh2aWV3LmdldFVpbnQzMihvZmZzZXQgKz0gMiwgZmFsc2UpICE9PSAweDQ1Nzg2OTY2KSByZXR1cm4gZGVmZXIucmVzb2x2ZShyZXN1bHQpO1xuXG4gICAgICAgICAgdmFyIGxpdHRsZSA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCArPSA2LCBmYWxzZSkgPT09IDB4NDk0OTtcbiAgICAgICAgICBvZmZzZXQgKz0gdmlldy5nZXRVaW50MzIob2Zmc2V0ICsgNCwgbGl0dGxlKTtcbiAgICAgICAgICB2YXIgdGFncyA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCwgbGl0dGxlKTtcbiAgICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRhZ3M7IGkrKylcbiAgICAgICAgICAgIGlmICh2aWV3LmdldFVpbnQxNihvZmZzZXQgKyAoaSAqIDEyKSwgbGl0dGxlKSA9PT0gMHgwMTEyKSB7XG4gICAgICAgICAgICAgIHZhciBvcmllbnRhdGlvbiA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCArIChpICogMTIpICsgOCwgbGl0dGxlKTtcbiAgICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID49IDIgJiYgb3JpZW50YXRpb24gPD0gOCkge1xuICAgICAgICAgICAgICAgIHZpZXcuc2V0VWludDE2KG9mZnNldCArIChpICogMTIpICsgOCwgMSwgbGl0dGxlKTtcbiAgICAgICAgICAgICAgICByZXN1bHQuZml4ZWRBcnJheUJ1ZmZlciA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXN1bHQub3JpZW50YXRpb24gPSBvcmllbnRhdGlvbjtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICgobWFya2VyICYgMHhGRjAwKSAhPT0gMHhGRjAwKSBicmVhaztcbiAgICAgICAgZWxzZSBvZmZzZXQgKz0gdmlldy5nZXRVaW50MTYob2Zmc2V0LCBmYWxzZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXIucmVzb2x2ZShyZXN1bHQpO1xuICAgIH07XG4gICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0Jhc2U2NChidWZmZXIpIHtcbiAgICB2YXIgYmluYXJ5ID0gJyc7XG4gICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICB2YXIgbGVuID0gYnl0ZXMuYnl0ZUxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiB3aW5kb3cuYnRvYShiaW5hcnkpO1xuICB9XG5cbiAgdXBsb2FkLmFwcGx5RXhpZlJvdGF0aW9uID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICBpZiAoZmlsZS50eXBlLmluZGV4T2YoJ2ltYWdlL2pwZWcnKSAhPT0gMCkge1xuICAgICAgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2UoZmlsZSk7XG4gICAgfVxuXG4gICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICB1cGxvYWQucmVhZE9yaWVudGF0aW9uKGZpbGUpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgaWYgKHJlc3VsdC5vcmllbnRhdGlvbiA8IDIgfHwgcmVzdWx0Lm9yaWVudGF0aW9uID4gOCkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICAgIH1cbiAgICAgIHVwbG9hZC5kYXRhVXJsKGZpbGUsIHRydWUpLnRoZW4oZnVuY3Rpb24gKHVybCkge1xuICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHZhciBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICBpbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSByZXN1bHQub3JpZW50YXRpb24gPiA0ID8gaW1nLmhlaWdodCA6IGltZy53aWR0aDtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSByZXN1bHQub3JpZW50YXRpb24gPiA0ID8gaW1nLndpZHRoIDogaW1nLmhlaWdodDtcbiAgICAgICAgICAgIHZhciBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgIGFwcGx5VHJhbnNmb3JtKGN0eCwgcmVzdWx0Lm9yaWVudGF0aW9uLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICAgICAgICAgICAgdmFyIGRhdGFVcmwgPSBjYW52YXMudG9EYXRhVVJMKGZpbGUudHlwZSB8fCAnaW1hZ2UvV2ViUCcsIDAuOTM0KTtcbiAgICAgICAgICAgIGRhdGFVcmwgPSB1cGxvYWQucmVzdG9yZUV4aWYoYXJyYXlCdWZmZXJUb0Jhc2U2NChyZXN1bHQuZml4ZWRBcnJheUJ1ZmZlciksIGRhdGFVcmwpO1xuICAgICAgICAgICAgdmFyIGJsb2IgPSB1cGxvYWQuZGF0YVVybHRvQmxvYihkYXRhVXJsLCBmaWxlLm5hbWUpO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShibG9iKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgaW1nLm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgIH07XG4gICAgICAgIGltZy5zcmMgPSB1cmw7XG4gICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG4gIHVwbG9hZC5yZXN0b3JlRXhpZiA9IGZ1bmN0aW9uIChvcmlnLCByZXNpemVkKSB7XG4gICAgdmFyIEV4aWZSZXN0b3JlciA9IHt9O1xuXG4gICAgRXhpZlJlc3RvcmVyLktFWV9TVFIgPSAnQUJDREVGR0hJSktMTU5PUCcgK1xuICAgICAgJ1FSU1RVVldYWVphYmNkZWYnICtcbiAgICAgICdnaGlqa2xtbm9wcXJzdHV2JyArXG4gICAgICAnd3h5ejAxMjM0NTY3ODkrLycgK1xuICAgICAgJz0nO1xuXG4gICAgRXhpZlJlc3RvcmVyLmVuY29kZTY0ID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICB2YXIgb3V0cHV0ID0gJycsXG4gICAgICAgIGNocjEsIGNocjIsIGNocjMgPSAnJyxcbiAgICAgICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCA9ICcnLFxuICAgICAgICBpID0gMDtcblxuICAgICAgZG8ge1xuICAgICAgICBjaHIxID0gaW5wdXRbaSsrXTtcbiAgICAgICAgY2hyMiA9IGlucHV0W2krK107XG4gICAgICAgIGNocjMgPSBpbnB1dFtpKytdO1xuXG4gICAgICAgIGVuYzEgPSBjaHIxID4+IDI7XG4gICAgICAgIGVuYzIgPSAoKGNocjEgJiAzKSA8PCA0KSB8IChjaHIyID4+IDQpO1xuICAgICAgICBlbmMzID0gKChjaHIyICYgMTUpIDw8IDIpIHwgKGNocjMgPj4gNik7XG4gICAgICAgIGVuYzQgPSBjaHIzICYgNjM7XG5cbiAgICAgICAgaWYgKGlzTmFOKGNocjIpKSB7XG4gICAgICAgICAgZW5jMyA9IGVuYzQgPSA2NDtcbiAgICAgICAgfSBlbHNlIGlmIChpc05hTihjaHIzKSkge1xuICAgICAgICAgIGVuYzQgPSA2NDtcbiAgICAgICAgfVxuXG4gICAgICAgIG91dHB1dCA9IG91dHB1dCArXG4gICAgICAgICAgdGhpcy5LRVlfU1RSLmNoYXJBdChlbmMxKSArXG4gICAgICAgICAgdGhpcy5LRVlfU1RSLmNoYXJBdChlbmMyKSArXG4gICAgICAgICAgdGhpcy5LRVlfU1RSLmNoYXJBdChlbmMzKSArXG4gICAgICAgICAgdGhpcy5LRVlfU1RSLmNoYXJBdChlbmM0KTtcbiAgICAgICAgY2hyMSA9IGNocjIgPSBjaHIzID0gJyc7XG4gICAgICAgIGVuYzEgPSBlbmMyID0gZW5jMyA9IGVuYzQgPSAnJztcbiAgICAgIH0gd2hpbGUgKGkgPCBpbnB1dC5sZW5ndGgpO1xuXG4gICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG5cbiAgICBFeGlmUmVzdG9yZXIucmVzdG9yZSA9IGZ1bmN0aW9uIChvcmlnRmlsZUJhc2U2NCwgcmVzaXplZEZpbGVCYXNlNjQpIHtcbiAgICAgIGlmIChvcmlnRmlsZUJhc2U2NC5tYXRjaCgnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwnKSkge1xuICAgICAgICBvcmlnRmlsZUJhc2U2NCA9IG9yaWdGaWxlQmFzZTY0LnJlcGxhY2UoJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJywgJycpO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmF3SW1hZ2UgPSB0aGlzLmRlY29kZTY0KG9yaWdGaWxlQmFzZTY0KTtcbiAgICAgIHZhciBzZWdtZW50cyA9IHRoaXMuc2xpY2UyU2VnbWVudHMocmF3SW1hZ2UpO1xuXG4gICAgICB2YXIgaW1hZ2UgPSB0aGlzLmV4aWZNYW5pcHVsYXRpb24ocmVzaXplZEZpbGVCYXNlNjQsIHNlZ21lbnRzKTtcblxuICAgICAgcmV0dXJuICdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcgKyB0aGlzLmVuY29kZTY0KGltYWdlKTtcbiAgICB9O1xuXG5cbiAgICBFeGlmUmVzdG9yZXIuZXhpZk1hbmlwdWxhdGlvbiA9IGZ1bmN0aW9uIChyZXNpemVkRmlsZUJhc2U2NCwgc2VnbWVudHMpIHtcbiAgICAgIHZhciBleGlmQXJyYXkgPSB0aGlzLmdldEV4aWZBcnJheShzZWdtZW50cyksXG4gICAgICAgIG5ld0ltYWdlQXJyYXkgPSB0aGlzLmluc2VydEV4aWYocmVzaXplZEZpbGVCYXNlNjQsIGV4aWZBcnJheSk7XG4gICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkobmV3SW1hZ2VBcnJheSk7XG4gICAgfTtcblxuXG4gICAgRXhpZlJlc3RvcmVyLmdldEV4aWZBcnJheSA9IGZ1bmN0aW9uIChzZWdtZW50cykge1xuICAgICAgdmFyIHNlZztcbiAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgc2VnbWVudHMubGVuZ3RoOyB4KyspIHtcbiAgICAgICAgc2VnID0gc2VnbWVudHNbeF07XG4gICAgICAgIGlmIChzZWdbMF0gPT09IDI1NSAmIHNlZ1sxXSA9PT0gMjI1KSAvLyhmZiBlMSlcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiBzZWc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBbXTtcbiAgICB9O1xuXG5cbiAgICBFeGlmUmVzdG9yZXIuaW5zZXJ0RXhpZiA9IGZ1bmN0aW9uIChyZXNpemVkRmlsZUJhc2U2NCwgZXhpZkFycmF5KSB7XG4gICAgICB2YXIgaW1hZ2VEYXRhID0gcmVzaXplZEZpbGVCYXNlNjQucmVwbGFjZSgnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwnLCAnJyksXG4gICAgICAgIGJ1ZiA9IHRoaXMuZGVjb2RlNjQoaW1hZ2VEYXRhKSxcbiAgICAgICAgc2VwYXJhdGVQb2ludCA9IGJ1Zi5pbmRleE9mKDI1NSwgMyksXG4gICAgICAgIG1hZSA9IGJ1Zi5zbGljZSgwLCBzZXBhcmF0ZVBvaW50KSxcbiAgICAgICAgYXRvID0gYnVmLnNsaWNlKHNlcGFyYXRlUG9pbnQpLFxuICAgICAgICBhcnJheSA9IG1hZTtcblxuICAgICAgYXJyYXkgPSBhcnJheS5jb25jYXQoZXhpZkFycmF5KTtcbiAgICAgIGFycmF5ID0gYXJyYXkuY29uY2F0KGF0byk7XG4gICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcblxuXG4gICAgRXhpZlJlc3RvcmVyLnNsaWNlMlNlZ21lbnRzID0gZnVuY3Rpb24gKHJhd0ltYWdlQXJyYXkpIHtcbiAgICAgIHZhciBoZWFkID0gMCxcbiAgICAgICAgc2VnbWVudHMgPSBbXTtcblxuICAgICAgd2hpbGUgKDEpIHtcbiAgICAgICAgaWYgKHJhd0ltYWdlQXJyYXlbaGVhZF0gPT09IDI1NSAmIHJhd0ltYWdlQXJyYXlbaGVhZCArIDFdID09PSAyMTgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAocmF3SW1hZ2VBcnJheVtoZWFkXSA9PT0gMjU1ICYgcmF3SW1hZ2VBcnJheVtoZWFkICsgMV0gPT09IDIxNikge1xuICAgICAgICAgIGhlYWQgKz0gMjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2YXIgbGVuZ3RoID0gcmF3SW1hZ2VBcnJheVtoZWFkICsgMl0gKiAyNTYgKyByYXdJbWFnZUFycmF5W2hlYWQgKyAzXSxcbiAgICAgICAgICAgIGVuZFBvaW50ID0gaGVhZCArIGxlbmd0aCArIDIsXG4gICAgICAgICAgICBzZWcgPSByYXdJbWFnZUFycmF5LnNsaWNlKGhlYWQsIGVuZFBvaW50KTtcbiAgICAgICAgICBzZWdtZW50cy5wdXNoKHNlZyk7XG4gICAgICAgICAgaGVhZCA9IGVuZFBvaW50O1xuICAgICAgICB9XG4gICAgICAgIGlmIChoZWFkID4gcmF3SW1hZ2VBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VnbWVudHM7XG4gICAgfTtcblxuXG4gICAgRXhpZlJlc3RvcmVyLmRlY29kZTY0ID0gZnVuY3Rpb24gKGlucHV0KSB7XG4gICAgICB2YXIgY2hyMSwgY2hyMiwgY2hyMyA9ICcnLFxuICAgICAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0ID0gJycsXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBidWYgPSBbXTtcblxuICAgICAgLy8gcmVtb3ZlIGFsbCBjaGFyYWN0ZXJzIHRoYXQgYXJlIG5vdCBBLVosIGEteiwgMC05LCArLCAvLCBvciA9XG4gICAgICB2YXIgYmFzZTY0dGVzdCA9IC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZztcbiAgICAgIGlmIChiYXNlNjR0ZXN0LmV4ZWMoaW5wdXQpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdUaGVyZSB3ZXJlIGludmFsaWQgYmFzZTY0IGNoYXJhY3RlcnMgaW4gdGhlIGlucHV0IHRleHQuXFxuJyArXG4gICAgICAgICAgJ1ZhbGlkIGJhc2U2NCBjaGFyYWN0ZXJzIGFyZSBBLVosIGEteiwgMC05LCAnICsgJywgJyAvICcsYW5kIFwiPVwiXFxuJyArXG4gICAgICAgICAgJ0V4cGVjdCBlcnJvcnMgaW4gZGVjb2RpbmcuJyk7XG4gICAgICB9XG4gICAgICBpbnB1dCA9IGlucHV0LnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXFw9XS9nLCAnJyk7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgZW5jMSA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgZW5jMiA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgZW5jMyA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcbiAgICAgICAgZW5jNCA9IHRoaXMuS0VZX1NUUi5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTtcblxuICAgICAgICBjaHIxID0gKGVuYzEgPDwgMikgfCAoZW5jMiA+PiA0KTtcbiAgICAgICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgICAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xuXG4gICAgICAgIGJ1Zi5wdXNoKGNocjEpO1xuXG4gICAgICAgIGlmIChlbmMzICE9PSA2NCkge1xuICAgICAgICAgIGJ1Zi5wdXNoKGNocjIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbmM0ICE9PSA2NCkge1xuICAgICAgICAgIGJ1Zi5wdXNoKGNocjMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2hyMSA9IGNocjIgPSBjaHIzID0gJyc7XG4gICAgICAgIGVuYzEgPSBlbmMyID0gZW5jMyA9IGVuYzQgPSAnJztcblxuICAgICAgfSB3aGlsZSAoaSA8IGlucHV0Lmxlbmd0aCk7XG5cbiAgICAgIHJldHVybiBidWY7XG4gICAgfTtcblxuICAgIHJldHVybiBFeGlmUmVzdG9yZXIucmVzdG9yZShvcmlnLCByZXNpemVkKTsgIC8vPD0gRVhJRlxuICB9O1xuXG4gIHJldHVybiB1cGxvYWQ7XG59XSk7XG5cbiIsInJlcXVpcmUoJy4vZGlzdC9uZy1maWxlLXVwbG9hZC1hbGwnKTtcbm1vZHVsZS5leHBvcnRzID0gJ25nRmlsZVVwbG9hZCc7IiwiaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG5pbXBvcnQgcm91dGluZyBmcm9tICcuL2NvbmZpZy9yb3V0aW5nJztcbmltcG9ydCBodHRwIGZyb20gJy4vY29uZmlnL2h0dHAnO1xuXG5pbXBvcnQgSG9tZU1vZHVsZSBmcm9tICcuL21vZHVsZXMvaG9tZS8nO1xuaW1wb3J0IEdhbGxlcnlNb2R1bGUgZnJvbSAnLi9tb2R1bGVzL2dhbGxlcnkvJ1xuXG52YXIgbW9kdWxlcyA9IFtIb21lTW9kdWxlLCBHYWxsZXJ5TW9kdWxlXTtcblxudmFyIGFwcCA9IGFuZ3VsYXJcbiAgICAubW9kdWxlKCdhcHAnLCBtb2R1bGVzKVxuICAgIC5jb25maWcocm91dGluZylcbiAgICAuY29uZmlnKGh0dHApO1xuXG4iLCJodHRwLiRpbmplY3QgPSBbJyRodHRwUHJvdmlkZXInXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaHR0cCgkaHR0cFByb3ZpZGVyKSB7XG5cdCRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goKCkgPT4ge1xuXHRcdHJldHVybiB7XG5cdFx0XHQncmVxdWVzdCc6IGZ1bmN0aW9uKGNvbmZpZykge1xuXHRcdCAgICBcdGNvbmZpZy5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSAnQmVhcmVyOiAnICsgd2luZG93LmFjY2Vzc190b2tlbjtcblxuXHRcdCAgICBcdHJldHVybiBjb25maWc7XG5cdFx0ICAgIH1cblx0XHR9XG5cdH0pO1xufSIsInJvdXRpbmcuJGluamVjdCA9IFsnJHVybFJvdXRlclByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJvdXRpbmcoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBHYWxsZXJ5Q3JlYXRlQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcigkc2NvcGUpIHtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSAnY3JlYXRlIG5ldyBnYWxsZXJ5JztcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbGxlcnlMaXN0Q29udHJvbGxlciB7XG5cblx0Z2FsbGVyaWVzID0gW107XG5cbiAgICBuZXdHYWxsZXJ5ID0ge307XG5cbiAgICBjb25zdHJ1Y3RvcihBUEkpIHtcbiAgICBcdHRoaXMuQVBJID0gQVBJO1xuXG4gICAgXHR0aGlzLmxvYWRHYWxsZXJ5KCk7XG4gICAgfVxuXG4gICAgbG9hZEdhbGxlcnkoKSB7XG4gICAgXHR0aGlzLkFQSS5nYWxsZXJ5LmdldCgpLiRwcm9taXNlLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIFx0dGhpcy5nYWxsZXJpZXMgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblN1Ym1pdE5ldygpIHtcbiAgICAgICAgdGhpcy5BUEkuZ2FsbGVyeS5zYXZlKHt9LCB0aGlzLm5ld0dhbGxlcnkpLiRwcm9taXNlLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvYWRHYWxsZXJ5KCk7XG4gICAgICAgICAgICB0aGlzLm5ld0dhbGxlcnkgPSB7fTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25EZWxldGVHYWxsZXJ5KGdhbGxlcnlJZClcbiAgICB7XG4gICAgICAgIHRoaXMuQVBJLmdhbGxlcnkuZGVsZXRlKHtpZDogZ2FsbGVyeUlkfSkuJHByb21pc2UudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9hZEdhbGxlcnkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbGxlcnlNYW5hZ2VDb250cm9sbGVyIHtcblx0Z2FsbGVyeSA9IHt9XG5cdGZpbGVzID0gW11cblx0dGl0bGUgPSAnJ1xuXHRwcm9ncmVzcyA9IG51bGxcblx0XG4gICAgY29uc3RydWN0b3IoQVBJLCBVcGxvYWQsICRzdGF0ZVBhcmFtcykge1xuICAgIFx0dGhpcy5BUEkgPSBBUEk7XG4gICAgXHR0aGlzLmxvYWRHYWxsZXJ5KCRzdGF0ZVBhcmFtcy5nYWxsZXJ5X2lkKTtcbiAgICBcdHRoaXMuVXBsb2FkID0gVXBsb2FkO1xuICAgIH1cblxuICAgIGxvYWRHYWxsZXJ5KGdhbGxlcnlJZCkge1xuICAgIFx0dGhpcy5BUEkuZ2FsbGVyeS5nZXQoe2lkOiBnYWxsZXJ5SWR9KS4kcHJvbWlzZS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgIFx0XHR0aGlzLmdhbGxlcnkgPSByZXNwb25zZS5kYXRhO1xuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgb25TdWJtaXRQaG90bygpIHtcbiAgICBcdHRoaXMuVXBsb2FkLnVwbG9hZCh7XG4gICAgICAgICAgICB1cmw6IGAke3dpbmRvdy5hcGlfdXJsfS9nYWxsZXJ5LyR7dGhpcy5nYWxsZXJ5LmlkfS9waG90b3NgICxcbiAgICAgICAgICAgIGRhdGE6IHtwaG90bzogdGhpcy5maWxlLCAndGl0bGUnOiB0aGlzLnRpdGxlfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtBdXRob3JpemF0aW9uOiBgQmVhcmVyOiAke3dpbmRvdy5hY2Nlc3NfdG9rZW59YH1cbiAgICAgICAgfSkudGhlbigocmVzcCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1N1Y2Nlc3MgJyArIHJlc3AuY29uZmlnLmRhdGEucGhvdG8ubmFtZSArICd1cGxvYWRlZC4gUmVzcG9uc2U6ICcgKyByZXNwLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5maWxlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy50aXRsZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmxvYWRHYWxsZXJ5KHRoaXMuZ2FsbGVyeS5pZCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igc3RhdHVzOiAnICsgcmVzcC5zdGF0dXMpO1xuICAgICAgICB9LCAoZXZ0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzID0gcGFyc2VJbnQoMTAwLjAgKiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25TZXREZWZhdWx0UGhvdG8ocGhvdG9JZCkge1xuICAgIFx0dGhpcy5BUEkuZ2FsbGVyeS51cGRhdGUoe2lkOnRoaXMuZ2FsbGVyeS5pZH0sIHtkZWZhdWx0X3Bob3RvOnBob3RvSWR9KS4kcHJvbWlzZVxuICAgIFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgXHRcdHRoaXMubG9hZEdhbGxlcnkodGhpcy5nYWxsZXJ5LmlkKTtcbiAgICBcdH0pO1xuICAgIH1cblxuICAgIG9uRGVsZXRlUGhvdG8ocGhvdG9JZCkge1xuICAgIFx0dGhpcy5BUEkucGhvdG9zLmRlbGV0ZSh7Z2FsbGVyeUlkOnRoaXMuZ2FsbGVyeS5pZCwgcGhvdG9JZDpwaG90b0lkfSkuJHByb21pc2VcbiAgICBcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgIFx0XHR0aGlzLmxvYWRHYWxsZXJ5KHRoaXMuZ2FsbGVyeS5pZCk7XG4gICAgXHR9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbmltcG9ydCB1aXJvdXRlciBmcm9tICdhbmd1bGFyLXVpLXJvdXRlcic7XG5pbXBvcnQgQVBJIGZyb20gJy4uLy4uL3NlcnZpY2VzL0FQSSc7XG5pbXBvcnQgcm91dGluZyBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgbmdGaWxlVXBsb2FkIGZyb20gJ25nLWZpbGUtdXBsb2FkJztcblxuXG5pbXBvcnQgR2FsbGVyeUxpc3RDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvZ2FsbGVyeS5saXN0LmNvbnRyb2xsZXInO1xuaW1wb3J0IEdhbGxlcnlDcmVhdGVDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvZ2FsbGVyeS5jcmVhdGUuY29udHJvbGxlcic7XG5pbXBvcnQgR2FsbGVyeU1hbmFnZUNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9nYWxsZXJ5Lm1hbmFnZS5jb250cm9sbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgYW5ndWxhci5tb2R1bGUoJ2FwcC5nYWxsZXJ5JywgW3Vpcm91dGVyLCBBUEksIG5nRmlsZVVwbG9hZF0pXG5cdC5jb25maWcocm91dGluZylcblx0LmNvbnRyb2xsZXIoJ0dhbGxlcnlMaXN0Q29udHJvbGxlcicsIEdhbGxlcnlMaXN0Q29udHJvbGxlcilcblx0LmNvbnRyb2xsZXIoJ0dhbGxlcnlDcmVhdGVDb250cm9sbGVyJywgR2FsbGVyeUNyZWF0ZUNvbnRyb2xsZXIpXG5cdC5jb250cm9sbGVyKCdHYWxsZXJ5TWFuYWdlQ29udHJvbGxlcicsIEdhbGxlcnlNYW5hZ2VDb250cm9sbGVyKVxuXHQubmFtZTsiLCJyb3V0ZXMuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGVzKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdGNvbnN0IGdhbGxlcnlBYnN0cmFjdFN0YXRlID0ge1xuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdG5hbWU6ICdnYWxsZXJ5Jyxcblx0XHR1cmw6ICcvZ2FsbGVyeScsXG5cdFx0J3RlbXBsYXRlJzogJzx1aS12aWV3PjwvdWktdmlldz4nXG5cdH07XG5cblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoZ2FsbGVyeUFic3RyYWN0U3RhdGUpO1xuICBcdFxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSh7XG4gIFx0bmFtZTogJ2dhbGxlcnkubGlzdCcsXG4gIFx0cGFyZW50OiBnYWxsZXJ5QWJzdHJhY3RTdGF0ZSxcbiAgXHR1cmw6ICcvbGlzdCcsXG4gIFx0dGVtcGxhdGU6IHJlcXVpcmUoJy4vdmlld3MvZ2FsbGVyeS5saXN0Lmh0bWwnKSxcbiAgXHRjb250cm9sbGVyOiAnR2FsbGVyeUxpc3RDb250cm9sbGVyJyxcbiAgXHRjb250cm9sbGVyQXM6ICckY29udHJvbGxlcidcblx0fSk7XG5cblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoe1xuICBcdG5hbWU6ICdnYWxsZXJ5LmNyZWF0ZScsXG4gIFx0cGFyZW50OiBnYWxsZXJ5QWJzdHJhY3RTdGF0ZSxcbiAgXHR1cmw6ICcvY3JlYXRlJyxcbiAgXHR0ZW1wbGF0ZTogcmVxdWlyZSgnLi92aWV3cy9nYWxsZXJ5LmNyZWF0ZS5odG1sJyksXG4gIFx0Y29udHJvbGxlcjogJ0dhbGxlcnlDcmVhdGVDb250cm9sbGVyJyxcbiAgXHRjb250cm9sbGVyQXM6ICckY29udHJvbGxlcidcblx0fSk7XG5cbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoe1xuICAgIG5hbWU6ICdnYWxsZXJ5Lm1hbmFnZScsXG4gICAgcGFyZW50OiBnYWxsZXJ5QWJzdHJhY3RTdGF0ZSxcbiAgICB1cmw6ICcvbWFuYWdlL3tnYWxsZXJ5X2lkfScsXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdmlld3MvZ2FsbGVyeS5tYW5hZ2UuaHRtbCcpLFxuICAgIGNvbnRyb2xsZXI6ICdHYWxsZXJ5TWFuYWdlQ29udHJvbGxlcicsXG4gICAgY29udHJvbGxlckFzOiAnJGNvbnRyb2xsZXInXG4gIH0pXG59IiwibW9kdWxlLmV4cG9ydHMgPSBcIjxoMT57eyRjb250cm9sbGVyLm1lc3NhZ2V9fTwvaDE+c3R3w7NyeiBub3fEhVwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzZWN0aW9uIGNsYXNzPWNvbnRlbnQtaGVhZGVyPjxoMT5SZWFsaXphY2plIDxzbWFsbD5QYW5lbCB6YXJ6xIVkemFuaWE8L3NtYWxsPjwvaDE+PG9sIGNsYXNzPWJyZWFkY3J1bWI+PGxpPjxhIGhyZWY9XFxcIi9cXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1kYXNoYm9hcmRcXFwiPjwvaT4gU3Ryb25hIGfFgsOzd25hPC9hPjwvbGk+PGxpIGNsYXNzPWFjdGl2ZT5SZWFsaXphY2plPC9saT48L29sPjwvc2VjdGlvbj48c2VjdGlvbiBjbGFzcz1jb250ZW50PjxkaXYgY2xhc3M9cm93Pjx1bCBjbGFzcz10aW1lbGluZT48bGkgbmctcmVwZWF0PVxcXCJnYWxsZXJ5IGluICRjb250cm9sbGVyLmdhbGxlcmllcyB0cmFjayBieSBnYWxsZXJ5LmlkXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2FtZXJhXFxcIiBuZy1jbGFzcz1cXFwieyAnYmctcmVkJzogZ2FsbGVyeS5jYXRlZ29yeSA9PSAxLCBcXG4gICAgICAgICAgICAgICAgICAgICdiZy1ibHVlJzogZ2FsbGVyeS5jYXRlZ29yeSA9PSAyIH1cXFwiPjwvaT48ZGl2IGNsYXNzPXRpbWVsaW5lLWl0ZW0+PHNwYW4gY2xhc3M9dGltZT48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiB7eyBnYWxsZXJ5LmNyZWF0ZWRfYXQgfX08L3NwYW4+PGgzIGNsYXNzPXRpbWVsaW5lLWhlYWRlcj48YSB1aS1zcmVmPVxcXCJnYWxsZXJ5Lm1hbmFnZSh7Z2FsbGVyeV9pZDogZ2FsbGVyeS5pZH0pXFxcIiBuZy1iaW5kPWdhbGxlcnkubmFtZT48L2E+IHt7IGdhbGxlcnkuY2F0ZWdvcnkgPT0gMSA/ICcocHJ5d2F0bmUpJyA6ICcoZGxhIGZpcm0pJ319IHt7IGdhbGxlcnkuZGVzY3JpcHRpb24gfCBsaW1pdFRvOiA0MCB9fXt7Z2FsbGVyeS5kZXNjcmlwdGlvbi5sZW5ndGggPiA0MCA/ICcuLi4nIDogJyd9fSA8YSB1aS1zcmVmPVxcXCJnYWxsZXJ5Lm1hbmFnZSh7Z2FsbGVyeV9pZDogZ2FsbGVyeS5pZH0pXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtZWRpdFxcXCI+PC9pPjwvYT4gPGEgbmctY2xpY2s9JGNvbnRyb2xsZXIub25EZWxldGVHYWxsZXJ5KGdhbGxlcnkuaWQpPjxpIGNsYXNzPVxcXCJmYSBmYS1yZW1vdmUgcmVkXFxcIj48L2k+PC9hPjwvaDM+PGRpdj48aW1nIG5nLXJlcGVhdD1cXFwicGhvdG8gaW4gZ2FsbGVyeS5waG90b3MgdHJhY2sgYnkgcGhvdG8uaWRcXFwiIG5nLXNyYz17e3Bob3RvLnBhdGgubWluaX19IGNsYXNzPW1hcmdpbj48L2Rpdj48L2Rpdj48L2xpPjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1yb3c+PGRpdiBjbGFzcz1jb2wtbWQtNj48ZGl2IGNsYXNzPVxcXCJib3ggYm94LXByaW1hcnlcXFwiPjxmb3JtIHJvbGU9Zm9ybSBuZy1zdWJtaXQ9JGNvbnRyb2xsZXIub25TdWJtaXROZXcoKT48ZGl2IGNsYXNzPVxcXCJib3gtaGVhZGVyIHdpdGgtYm9yZGVyXFxcIj48aDMgY2xhc3M9Ym94LXRpdGxlPlN0d8Ozcnogbm93xIUgcmVhbGl6YWNqxJk8L2gzPjwvZGl2PjxkaXYgY2xhc3M9Ym94LWJvZHk+PGRpdiBjbGFzcz1mb3JtLWdyb3VwPjxsYWJlbCBmb3I9dGl0bGU+VHl0dcWCIGdhbGVyaWk8L2xhYmVsPjxpbnB1dCBjbGFzcz1mb3JtLWNvbnRyb2wgaWQ9dGl0bGUgcGxhY2Vob2xkZXI9XFxcIldwaXN6IHR5dHXFglxcXCIgbmctbW9kZWw9JGNvbnRyb2xsZXIubmV3R2FsbGVyeS5uYW1lPjwvZGl2PjxkaXYgY2xhc3M9Zm9ybS1ncm91cD48bGFiZWwgZm9yPWNhdGVnb3J5PkthdGVnb3JpYTwvbGFiZWw+PHNlbGVjdCBjbGFzcz1mb3JtLWNvbnRyb2wgaWQ9Y2F0ZWdvcnkgcGxhY2Vob2xkZXI9XFxcInd5Ymllcnoga2F0ZWdvcmnEmVxcXCIgbmctbW9kZWw9JGNvbnRyb2xsZXIubmV3R2FsbGVyeS5jYXRlZ29yeT48b3B0aW9uIHZhbHVlPTE+cHJ5d2F0bmE8L29wdGlvbj48b3B0aW9uIHZhbHVlPTI+ZGxhIGZpcm08L29wdGlvbj48L3NlbGVjdD48L2Rpdj48ZGl2IGNsYXNzPWZvcm0tZ3JvdXA+PHRleHRhcmVhIGNsYXNzPWZvcm0tY29udHJvbCBuZy1tb2RlbD0kY29udHJvbGxlci5uZXdHYWxsZXJ5LmRlc2NyaXB0aW9uIHBsYWNlaG9sZGVyPVxcXCJQb2RhaiBvcGlzIHJlYWxpemFjamlcXFwiPlxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGV4dGFyZWE+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1ib3gtZm9vdGVyPjxidXR0b24gdHlwZT1zdWJtaXQgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeVxcXCI+RG9kYWo8L2J1dHRvbj48L2Rpdj48L2Zvcm0+PC9kaXY+PC9kaXY+PC9kaXY+PC9zZWN0aW9uPlwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzZWN0aW9uIGNsYXNzPWNvbnRlbnQtaGVhZGVyPjxoMSBuZy1iaW5kPSRjb250cm9sbGVyLmdhbGxlcnkubmFtZT48L2gxPjxvbCBjbGFzcz1icmVhZGNydW1iPjxsaT48YSB1aS1zcmVmPWhvbWU+PGkgY2xhc3M9XFxcImZhIGZhLWRhc2hib2FyZFxcXCI+PC9pPiBTdHJvbmEgZ8WCw7N3bmE8L2E+PC9saT48bGk+PGEgdWktc3JlZj1nYWxsZXJ5Lmxpc3Q+UmVhbGl6YWNqZTwvYT48L2xpPjxsaSBjbGFzcz1hY3RpdmU+e3sgJGNvbnRyb2xsZXIuZ2FsbGVyeS5uYW1lIH19PC9saT48L29sPjwvc2VjdGlvbj48c2VjdGlvbiBjbGFzcz1jb250ZW50PjxkaXYgY2xhc3M9Ym94PjxkaXYgY2xhc3M9XFxcImJveC1oZWFkZXIgd2l0aC1ib3JkZXJcXFwiPjxoMyBjbGFzcz1ib3gtdGl0bGU+WmFyesSFZHphaiBnYWxlcmnEhTwvaDM+PC9kaXY+PGRpdiBjbGFzcz1ib3gtYm9keT48ZGl2IGNsYXNzPVxcXCJib3gtdG9vbHMgcHVsbC1yaWdodFxcXCI+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1ib3gtdG9vbFxcXCIgZGF0YS13aWRnZXQ9Y29sbGFwc2UgZGF0YS10b2dnbGU9dG9vbHRpcCB0aXRsZT1lZHl0dWo+PGkgY2xhc3M9XFxcImZhIGZhLWVkaXRcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48ZGl2IGlkPWRlc2NyaXB0aW9uIG5nLWJpbmQ9JGNvbnRyb2xsZXIuZ2FsbGVyeS5kZXNjcmlwdGlvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWJveC1mb290ZXI+PGRpdiBpZD1waG90b3MgY2xhc3M9cm93PjxkaXYgbmctcmVwZWF0PVxcXCJwaG90byBpbiAkY29udHJvbGxlci5nYWxsZXJ5LnBob3RvcyB0cmFjayBieSBwaG90by5pZFxcXCIgY2xhc3M9XFxcImNvbC1sZy00IGNvbC1tZC02IGNvbC14cy02IHRodW1iIHRleHQtY2VudGVyXFxcIiBzdHlsZT1cXFwiaGVpZ2h0OiAyNTBweFxcXCIgbmctY2xhc3M9XFxcIiRjb250cm9sbGVyLmdhbGxlcnkuZGVmYXVsdF9waG90byA9PT0gcGhvdG8uaWQgPyAnZGVmYXVsdCcgOiAnJ1xcXCI+PGRpdiBjbGFzcz1waG90by1lbGVtZW50PjxpbWcgbmctc3JjPXt7cGhvdG8ucGF0aC5taW5pfX0+PGJyPjxhIG5nLWNsaWNrPSRjb250cm9sbGVyLm9uRGVsZXRlUGhvdG8ocGhvdG8uaWQpIGhyZWY9Iz48aSBjbGFzcz1cXFwiZmEgZmEtcmVtb3ZlXFxcIiB0aXRsZT11c3XFhD48L2k+PC9hPiA8YSBuZy1jbGljaz0kY29udHJvbGxlci5vblNldERlZmF1bHRQaG90byhwaG90by5pZCkgaHJlZj0jIG5nLXNob3c9XFxcIiRjb250cm9sbGVyLmdhbGxlcnkuZGVmYXVsdF9waG90byAhPT0gcGhvdG8uaWRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jaGVjay1zcXVhcmUtb1xcXCIgdGl0bGU9XFxcInVzdGF3IGpha28gZG9tecWbbG5lXFxcIj48L2k+PC9hPjwvZGl2Pjxicj48c3BhbiBuZy1iaW5kPXBob3RvLnRpdGxlPjwvc3Bhbj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPXJvdz48ZGl2IGNsYXNzPWNvbC1tZC02Pjxmb3JtIHJvbGU9Zm9ybSBuZy1zdWJtaXQ9JGNvbnRyb2xsZXIub25TdWJtaXRQaG90bygpPjxkaXYgY2xhc3M9XFxcImJveCBib3gtcHJpbWFyeVxcXCI+PGRpdiBjbGFzcz1cXFwiYm94LWhlYWRlciB3aXRoLWJvcmRlclxcXCI+PGgzIGNsYXNzPWJveC10aXRsZT5Eb2RhaiB6ZGrEmWNpZTwvaDM+PC9kaXY+PGRpdiBjbGFzcz1ib3gtYm9keT48ZGl2IGNsYXNzPWZvcm0tZ3JvdXA+PGxhYmVsIGZvcj10aXRsZT5UeXR1xYIgemRqxJljaWE8L2xhYmVsPjxpbnB1dCBjbGFzcz1mb3JtLWNvbnRyb2wgaWQ9dGl0bGUgcGxhY2Vob2xkZXI9XFxcIldwaXN6IHR5dHXFglxcXCIgbmctbW9kZWw9JGNvbnRyb2xsZXIudGl0bGU+PC9kaXY+PGRpdiBjbGFzcz1mb3JtLWdyb3VwIGlkPWZpbGUtdXBsb2FkZXIgbmdmLWRyb3AgbmctbW9kZWw9JGNvbnRyb2xsZXIuZmlsZSBuZ2YtZHJhZy1vdmVyLWNsYXNzPVxcXCInZmlsZS1vdmVyJ1xcXCIgbmdmLW11bHRpcGxlPWZhbHNlIG5nZi1wYXR0ZXJuPVxcXCInaW1hZ2UvKidcXFwiIG5nZi1tYXgtc2l6ZT0zME1CIG5nZi1hY2NlcHQ9XFxcIidpbWFnZS8qJ1xcXCI+PGxhYmVsIGZvcj1waG90bz5GaWxlIGlucHV0PC9sYWJlbD48aW5wdXQgdHlwZT1maWxlIGNsYXNzPWJ1dHRvbiBuZ2Ytc2VsZWN0IG5nLW1vZGVsPSRjb250cm9sbGVyLmZpbGUgbmFtZT1maWxlIG5nZi1wYXR0ZXJuPVxcXCInaW1hZ2UvKidcXFwiIG5nZi1hY2NlcHQ9XFxcIidpbWFnZS8qJ1xcXCIgbmdmLW1heC1zaXplPTMwTUIgbmdmLW1pbi1oZWlnaHQ9MTAwPiBTZWxlY3Q8L2Rpdj48cCBjbGFzcz1oZWxwLWJsb2NrPld5YmllcnogemRqxJljaWUgKG1heCAzIE1iKS48L3A+PGltZyBjbGFzcz10aHVtYiBzdHlsZT1cXFwibWF4LXdpZHRoOiAzNTBweFxcXCIgbmdmLXRodW1ibmFpbD0kY29udHJvbGxlci5maWxlPjwvZGl2PjxkaXYgY2xhc3M9Ym94LWZvb3Rlcj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyBwcm9ncmVzcy1zbVxcXCIgbmctc2hvdz0kY29udHJvbGxlci5wcm9ncmVzcz48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLWRhbmdlciBwcm9ncmVzcy1iYXItc3RyaXBlZFxcXCIgcm9sZT1wcm9ncmVzc2JhciBhcmlhLXZhbHVlbm93PXt7JGNvbnRyb2xsZXIucHJvZ3Jlc3N9fSBhcmlhLXZhbHVlbWluPTAgYXJpYS12YWx1ZW1heD0xMDAgc3R5bGU9XFxcIndpZHRoOiB7eyRjb250cm9sbGVyLnByb2dyZXNzfX0lXFxcIj48c3BhbiBjbGFzcz1zci1vbmx5Pnt7JGNvbnRyb2xsZXIucHJvZ3Jlc3N9fSU8L3NwYW4+PC9kaXY+PC9kaXY+PGJ1dHRvbiB0eXBlPXN1Ym1pdCBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5XFxcIj5Eb2RhajwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZm9ybT48L2Rpdj48L2Rpdj48L3NlY3Rpb24+PHN0eWxlPiNmaWxlLXVwbG9hZGVyIHtcXG59XFxuI2ZpbGUtdXBsb2FkZXIuZmlsZS1vdmVyIHtcXG5cXHRib3JkZXI6IDFweCBkYXNoZWQgZ3JheTtcXG59XFxuI2ZpbGUtdXBsb2FkZXIgaW1nIHtcXG5cXHRtYXgtd2lkdGg6IDM1MHB4O1xcblxcdG1heC1oZWlnaHQ6IDI1MHB4O1xcbn1cXG5cXG5kaXYjcGhvdG9zIGRpdi5kZWZhdWx0IGltZyB7XFxuXFx0Ym9yZGVyOiAycHggc29saWQgZ3JlZW47XFxufVxcblxcbmRpdi5waG90by1lbGVtZW50IHtcXG5cXHRwb3NpdGlvbjogcmVsYXRpdmU7XFxuXFx0ZGlzcGxheTogaW5saW5lLWJsb2NrO1xcbn1cXG5kaXYucGhvdG8tZWxlbWVudCBpIHtcXG5cXHRjb2xvcjogIzAwMDtcXG59XFxuXFxuZGl2LnBob3RvLWVsZW1lbnQgaS5mYS1yZW1vdmUge1xcblxcdHBvc2l0aW9uOiBhYnNvbHV0ZTtcXG5cXHR0b3A6IDVweDtcXG5cXHRyaWdodDogNXB4O1xcbn1cXG5cXG5kaXYucGhvdG8tZWxlbWVudCBpLmZhLWNoZWNrLXNxdWFyZS1vIHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDI1cHg7XFxufVxcblxcbmRpdi5waG90by1lbGVtZW50IGkuZmEtcmVtb3ZlOmhvdmVyIHtcXG5cXHRjb2xvcjogcmVkO1xcbn1cXG5cXG5kaXYucGhvdG8tZWxlbWVudCBpLmZhLWNoZWNrLXNxdWFyZS1vOmhvdmVyIHtcXG5cXHRjb2xvcjogIzRhYWQzYjtcXG59PC9zdHlsZT5cIjtcbiIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEhvbWVDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCRzY29wZSkge1xuICAgICAgICAkc2NvcGUubWVzc2FnZSA9ICd3ZWxjb21lIGhvbWUnO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG5pbXBvcnQgdWlyb3V0ZXIgZnJvbSAnYW5ndWxhci11aS1yb3V0ZXInO1xuXG5pbXBvcnQgcm91dGluZyBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgSG9tZUNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9ob21lLmNvbnRyb2xsZXInO1xuXG5leHBvcnQgZGVmYXVsdCBhbmd1bGFyLm1vZHVsZSgnYXBwLmhvbWUnLCBbdWlyb3V0ZXJdKVxuICAuY29uZmlnKHJvdXRpbmcpXG4gIC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIEhvbWVDb250cm9sbGVyKVxuICAubmFtZTsiLCJyb3V0ZXMuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGVzKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdob21lJywge1xuICAgICAgdXJsOiAnLycsXG4gICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi92aWV3cy9ob21lLmh0bWwnKSxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcicsXG4gICAgICBjb250cm9sbGVyQXM6ICdob21lJ1xuICAgIH0pO1xufSIsIm1vZHVsZS5leHBvcnRzID0gXCI8c2VjdGlvbiBjbGFzcz1jb250ZW50LWhlYWRlcj48aDE+RGFzaGJvYXJkIDxzbWFsbD5Db250cm9sIHBhbmVsPC9zbWFsbD48L2gxPjxvbCBjbGFzcz1icmVhZGNydW1iPjxsaT48YSBocmVmPSM+PGkgY2xhc3M9XFxcImZhIGZhLWRhc2hib2FyZFxcXCI+PC9pPiBIb21lPC9hPjwvbGk+PGxpIGNsYXNzPWFjdGl2ZT5EYXNoYm9hcmQ8L2xpPjwvb2w+PC9zZWN0aW9uPjxzZWN0aW9uIGNsYXNzPWNvbnRlbnQ+PGRpdiBjbGFzcz1yb3c+PGRpdiBjbGFzcz1cXFwiY29sLWxnLTMgY29sLXhzLTZcXFwiPjxkaXYgY2xhc3M9XFxcInNtYWxsLWJveCBiZy1hcXVhXFxcIj48ZGl2IGNsYXNzPWlubmVyPjxoMz4xNTA8L2gzPjxwPk5ldyBPcmRlcnM8L3A+PC9kaXY+PGRpdiBjbGFzcz1pY29uPjxpIGNsYXNzPVxcXCJpb24gaW9uLWJhZ1xcXCI+PC9pPjwvZGl2PjxhIGhyZWY9IyBjbGFzcz1zbWFsbC1ib3gtZm9vdGVyPk1vcmUgaW5mbyA8aSBjbGFzcz1cXFwiZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0XFxcIj48L2k+PC9hPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImNvbC1sZy0zIGNvbC14cy02XFxcIj48ZGl2IGNsYXNzPVxcXCJzbWFsbC1ib3ggYmctZ3JlZW5cXFwiPjxkaXYgY2xhc3M9aW5uZXI+PGgzPjUzPHN1cCBzdHlsZT1cXFwiZm9udC1zaXplOiAyMHB4XFxcIj4lPC9zdXA+PC9oMz48cD5Cb3VuY2UgUmF0ZTwvcD48L2Rpdj48ZGl2IGNsYXNzPWljb24+PGkgY2xhc3M9XFxcImlvbiBpb24tc3RhdHMtYmFyc1xcXCI+PC9pPjwvZGl2PjxhIGhyZWY9IyBjbGFzcz1zbWFsbC1ib3gtZm9vdGVyPk1vcmUgaW5mbyA8aSBjbGFzcz1cXFwiZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0XFxcIj48L2k+PC9hPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImNvbC1sZy0zIGNvbC14cy02XFxcIj48ZGl2IGNsYXNzPVxcXCJzbWFsbC1ib3ggYmcteWVsbG93XFxcIj48ZGl2IGNsYXNzPWlubmVyPjxoMz40NDwvaDM+PHA+VXNlciBSZWdpc3RyYXRpb25zPC9wPjwvZGl2PjxkaXYgY2xhc3M9aWNvbj48aSBjbGFzcz1cXFwiaW9uIGlvbi1wZXJzb24tYWRkXFxcIj48L2k+PC9kaXY+PGEgaHJlZj0jIGNsYXNzPXNtYWxsLWJveC1mb290ZXI+TW9yZSBpbmZvIDxpIGNsYXNzPVxcXCJmYSBmYS1hcnJvdy1jaXJjbGUtcmlnaHRcXFwiPjwvaT48L2E+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY29sLWxnLTMgY29sLXhzLTZcXFwiPjxkaXYgY2xhc3M9XFxcInNtYWxsLWJveCBiZy1yZWRcXFwiPjxkaXYgY2xhc3M9aW5uZXI+PGgzPjY1PC9oMz48cD5VbmlxdWUgVmlzaXRvcnM8L3A+PC9kaXY+PGRpdiBjbGFzcz1pY29uPjxpIGNsYXNzPVxcXCJpb24gaW9uLXBpZS1ncmFwaFxcXCI+PC9pPjwvZGl2PjxhIGhyZWY9IyBjbGFzcz1zbWFsbC1ib3gtZm9vdGVyPk1vcmUgaW5mbyA8aSBjbGFzcz1cXFwiZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0XFxcIj48L2k+PC9hPjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9cm93PjxzZWN0aW9uIGNsYXNzPVxcXCJjb2wtbGctNyBjb25uZWN0ZWRTb3J0YWJsZVxcXCI+PGRpdiBjbGFzcz1uYXYtdGFicy1jdXN0b20+PHVsIGNsYXNzPVxcXCJuYXYgbmF2LXRhYnMgcHVsbC1yaWdodFxcXCI+PGxpIGNsYXNzPWFjdGl2ZT48YSBocmVmPSNyZXZlbnVlLWNoYXJ0IGRhdGEtdG9nZ2xlPXRhYj5BcmVhPC9hPjwvbGk+PGxpPjxhIGhyZWY9I3NhbGVzLWNoYXJ0IGRhdGEtdG9nZ2xlPXRhYj5Eb251dDwvYT48L2xpPjxsaSBjbGFzcz1cXFwicHVsbC1sZWZ0IGhlYWRlclxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWluYm94XFxcIj48L2k+IFNhbGVzPC9saT48L3VsPjxkaXYgY2xhc3M9XFxcInRhYi1jb250ZW50IG5vLXBhZGRpbmdcXFwiPjxkaXYgY2xhc3M9XFxcImNoYXJ0IHRhYi1wYW5lIGFjdGl2ZVxcXCIgaWQ9cmV2ZW51ZS1jaGFydCBzdHlsZT1cXFwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6IDMwMHB4XFxcIj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjaGFydCB0YWItcGFuZVxcXCIgaWQ9c2FsZXMtY2hhcnQgc3R5bGU9XFxcInBvc2l0aW9uOiByZWxhdGl2ZTsgaGVpZ2h0OiAzMDBweFxcXCI+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94IGJveC1zdWNjZXNzXFxcIj48ZGl2IGNsYXNzPWJveC1oZWFkZXI+PGkgY2xhc3M9XFxcImZhIGZhLWNvbW1lbnRzLW9cXFwiPjwvaT48aDMgY2xhc3M9Ym94LXRpdGxlPkNoYXQ8L2gzPjxkaXYgY2xhc3M9XFxcImJveC10b29scyBwdWxsLXJpZ2h0XFxcIiBkYXRhLXRvZ2dsZT10b29sdGlwIHRpdGxlPVN0YXR1cz48ZGl2IGNsYXNzPWJ0bi1ncm91cCBkYXRhLXRvZ2dsZT1idG4tdG9nZ2xlPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBidG4tc20gYWN0aXZlXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtc3F1YXJlIHRleHQtZ3JlZW5cXFwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXNxdWFyZSB0ZXh0LXJlZFxcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1ib2R5IGNoYXRcXFwiIGlkPWNoYXQtYm94PjxkaXYgY2xhc3M9aXRlbT48aW1nIHNyYz1kaXN0L2ltZy91c2VyNC0xMjh4MTI4LmpwZyBhbHQ9XFxcInVzZXIgaW1hZ2VcXFwiIGNsYXNzPW9ubGluZT48cCBjbGFzcz1tZXNzYWdlPjxhIGhyZWY9IyBjbGFzcz1uYW1lPjxzbWFsbCBjbGFzcz1cXFwidGV4dC1tdXRlZCBwdWxsLXJpZ2h0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiAyOjE1PC9zbWFsbD4gTWlrZSBEb2U8L2E+IEkgd291bGQgbGlrZSB0byBtZWV0IHlvdSB0byBkaXNjdXNzIHRoZSBsYXRlc3QgbmV3cyBhYm91dCB0aGUgYXJyaXZhbCBvZiB0aGUgbmV3IHRoZW1lLiBUaGV5IHNheSBpdCBpcyBnb2luZyB0byBiZSBvbmUgdGhlIGJlc3QgdGhlbWVzIG9uIHRoZSBtYXJrZXQ8L3A+PGRpdiBjbGFzcz1hdHRhY2htZW50PjxoND5BdHRhY2htZW50czo8L2g0PjxwIGNsYXNzPWZpbGVuYW1lPlRoZW1lLXRodW1ibmFpbC1pbWFnZS5qcGc8L3A+PGRpdiBjbGFzcz1wdWxsLXJpZ2h0PjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gYnRuLWZsYXRcXFwiPk9wZW48L2J1dHRvbj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWl0ZW0+PGltZyBzcmM9ZGlzdC9pbWcvdXNlcjMtMTI4eDEyOC5qcGcgYWx0PVxcXCJ1c2VyIGltYWdlXFxcIiBjbGFzcz1vZmZsaW5lPjxwIGNsYXNzPW1lc3NhZ2U+PGEgaHJlZj0jIGNsYXNzPW5hbWU+PHNtYWxsIGNsYXNzPVxcXCJ0ZXh0LW11dGVkIHB1bGwtcmlnaHRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDU6MTU8L3NtYWxsPiBBbGV4YW5kZXIgUGllcmNlPC9hPiBJIHdvdWxkIGxpa2UgdG8gbWVldCB5b3UgdG8gZGlzY3VzcyB0aGUgbGF0ZXN0IG5ld3MgYWJvdXQgdGhlIGFycml2YWwgb2YgdGhlIG5ldyB0aGVtZS4gVGhleSBzYXkgaXQgaXMgZ29pbmcgdG8gYmUgb25lIHRoZSBiZXN0IHRoZW1lcyBvbiB0aGUgbWFya2V0PC9wPjwvZGl2PjxkaXYgY2xhc3M9aXRlbT48aW1nIHNyYz1kaXN0L2ltZy91c2VyMi0xNjB4MTYwLmpwZyBhbHQ9XFxcInVzZXIgaW1hZ2VcXFwiIGNsYXNzPW9mZmxpbmU+PHAgY2xhc3M9bWVzc2FnZT48YSBocmVmPSMgY2xhc3M9bmFtZT48c21hbGwgY2xhc3M9XFxcInRleHQtbXV0ZWQgcHVsbC1yaWdodFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gNTozMDwvc21hbGw+IFN1c2FuIERvZTwvYT4gSSB3b3VsZCBsaWtlIHRvIG1lZXQgeW91IHRvIGRpc2N1c3MgdGhlIGxhdGVzdCBuZXdzIGFib3V0IHRoZSBhcnJpdmFsIG9mIHRoZSBuZXcgdGhlbWUuIFRoZXkgc2F5IGl0IGlzIGdvaW5nIHRvIGJlIG9uZSB0aGUgYmVzdCB0aGVtZXMgb24gdGhlIG1hcmtldDwvcD48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWJveC1mb290ZXI+PGRpdiBjbGFzcz1pbnB1dC1ncm91cD48aW5wdXQgY2xhc3M9Zm9ybS1jb250cm9sIHBsYWNlaG9sZGVyPVxcXCJUeXBlIG1lc3NhZ2UuLi5cXFwiPjxkaXYgY2xhc3M9aW5wdXQtZ3JvdXAtYnRuPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tc3VjY2Vzc1xcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXBsdXNcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3ggYm94LXByaW1hcnlcXFwiPjxkaXYgY2xhc3M9Ym94LWhlYWRlcj48aSBjbGFzcz1cXFwiaW9uIGlvbi1jbGlwYm9hcmRcXFwiPjwvaT48aDMgY2xhc3M9Ym94LXRpdGxlPlRvIERvIExpc3Q8L2gzPjxkaXYgY2xhc3M9XFxcImJveC10b29scyBwdWxsLXJpZ2h0XFxcIj48dWwgY2xhc3M9XFxcInBhZ2luYXRpb24gcGFnaW5hdGlvbi1zbSBpbmxpbmVcXFwiPjxsaT48YSBocmVmPSM+JmxhcXVvOzwvYT48L2xpPjxsaT48YSBocmVmPSM+MTwvYT48L2xpPjxsaT48YSBocmVmPSM+MjwvYT48L2xpPjxsaT48YSBocmVmPSM+MzwvYT48L2xpPjxsaT48YSBocmVmPSM+JnJhcXVvOzwvYT48L2xpPjwvdWw+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1ib3gtYm9keT48dWwgY2xhc3M9dG9kby1saXN0PjxsaT48c3BhbiBjbGFzcz1oYW5kbGU+PGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT48L3NwYW4+IDxpbnB1dCB0eXBlPWNoZWNrYm94IHZhbHVlPVxcXCJcXFwiPiA8c3BhbiBjbGFzcz10ZXh0PkRlc2lnbiBhIG5pY2UgdGhlbWU8L3NwYW4+IDxzbWFsbCBjbGFzcz1cXFwibGFiZWwgbGFiZWwtZGFuZ2VyXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiAyIG1pbnM8L3NtYWxsPjxkaXYgY2xhc3M9dG9vbHM+PGkgY2xhc3M9XFxcImZhIGZhLWVkaXRcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLXRyYXNoLW9cXFwiPjwvaT48L2Rpdj48L2xpPjxsaT48c3BhbiBjbGFzcz1oYW5kbGU+PGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT48L3NwYW4+IDxpbnB1dCB0eXBlPWNoZWNrYm94IHZhbHVlPVxcXCJcXFwiPiA8c3BhbiBjbGFzcz10ZXh0Pk1ha2UgdGhlIHRoZW1lIHJlc3BvbnNpdmU8L3NwYW4+IDxzbWFsbCBjbGFzcz1cXFwibGFiZWwgbGFiZWwtaW5mb1xcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gNCBob3Vyczwvc21hbGw+PGRpdiBjbGFzcz10b29scz48aSBjbGFzcz1cXFwiZmEgZmEtZWRpdFxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtdHJhc2gtb1xcXCI+PC9pPjwvZGl2PjwvbGk+PGxpPjxzcGFuIGNsYXNzPWhhbmRsZT48aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPjwvc3Bhbj4gPGlucHV0IHR5cGU9Y2hlY2tib3ggdmFsdWU9XFxcIlxcXCI+IDxzcGFuIGNsYXNzPXRleHQ+TGV0IHRoZW1lIHNoaW5lIGxpa2UgYSBzdGFyPC9zcGFuPiA8c21hbGwgY2xhc3M9XFxcImxhYmVsIGxhYmVsLXdhcm5pbmdcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDEgZGF5PC9zbWFsbD48ZGl2IGNsYXNzPXRvb2xzPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS10cmFzaC1vXFxcIj48L2k+PC9kaXY+PC9saT48bGk+PHNwYW4gY2xhc3M9aGFuZGxlPjxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+PC9zcGFuPiA8aW5wdXQgdHlwZT1jaGVja2JveCB2YWx1ZT1cXFwiXFxcIj4gPHNwYW4gY2xhc3M9dGV4dD5MZXQgdGhlbWUgc2hpbmUgbGlrZSBhIHN0YXI8L3NwYW4+IDxzbWFsbCBjbGFzcz1cXFwibGFiZWwgbGFiZWwtc3VjY2Vzc1xcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gMyBkYXlzPC9zbWFsbD48ZGl2IGNsYXNzPXRvb2xzPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS10cmFzaC1vXFxcIj48L2k+PC9kaXY+PC9saT48bGk+PHNwYW4gY2xhc3M9aGFuZGxlPjxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+PC9zcGFuPiA8aW5wdXQgdHlwZT1jaGVja2JveCB2YWx1ZT1cXFwiXFxcIj4gPHNwYW4gY2xhc3M9dGV4dD5DaGVjayB5b3VyIG1lc3NhZ2VzIGFuZCBub3RpZmljYXRpb25zPC9zcGFuPiA8c21hbGwgY2xhc3M9XFxcImxhYmVsIGxhYmVsLXByaW1hcnlcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDEgd2Vlazwvc21hbGw+PGRpdiBjbGFzcz10b29scz48aSBjbGFzcz1cXFwiZmEgZmEtZWRpdFxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtdHJhc2gtb1xcXCI+PC9pPjwvZGl2PjwvbGk+PGxpPjxzcGFuIGNsYXNzPWhhbmRsZT48aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPjwvc3Bhbj4gPGlucHV0IHR5cGU9Y2hlY2tib3ggdmFsdWU9XFxcIlxcXCI+IDxzcGFuIGNsYXNzPXRleHQ+TGV0IHRoZW1lIHNoaW5lIGxpa2UgYSBzdGFyPC9zcGFuPiA8c21hbGwgY2xhc3M9XFxcImxhYmVsIGxhYmVsLWRlZmF1bHRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDEgbW9udGg8L3NtYWxsPjxkaXYgY2xhc3M9dG9vbHM+PGkgY2xhc3M9XFxcImZhIGZhLWVkaXRcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLXRyYXNoLW9cXFwiPjwvaT48L2Rpdj48L2xpPjwvdWw+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWZvb3RlciBjbGVhcmZpeCBuby1ib3JkZXJcXFwiPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBwdWxsLXJpZ2h0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtcGx1c1xcXCI+PC9pPiBBZGQgaXRlbTwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveCBib3gtaW5mb1xcXCI+PGRpdiBjbGFzcz1ib3gtaGVhZGVyPjxpIGNsYXNzPVxcXCJmYSBmYS1lbnZlbG9wZVxcXCI+PC9pPjxoMyBjbGFzcz1ib3gtdGl0bGU+UXVpY2sgRW1haWw8L2gzPjxkaXYgY2xhc3M9XFxcInB1bGwtcmlnaHQgYm94LXRvb2xzXFxcIj48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWluZm8gYnRuLXNtXFxcIiBkYXRhLXdpZGdldD1yZW1vdmUgZGF0YS10b2dnbGU9dG9vbHRpcCB0aXRsZT1SZW1vdmU+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzXFxcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1ib3gtYm9keT48Zm9ybSBhY3Rpb249IyBtZXRob2Q9cG9zdD48ZGl2IGNsYXNzPWZvcm0tZ3JvdXA+PGlucHV0IHR5cGU9ZW1haWwgY2xhc3M9Zm9ybS1jb250cm9sIG5hbWU9ZW1haWx0byBwbGFjZWhvbGRlcj1cXFwiRW1haWwgdG86XFxcIj48L2Rpdj48ZGl2IGNsYXNzPWZvcm0tZ3JvdXA+PGlucHV0IHR5cGU9dGV4dCBjbGFzcz1mb3JtLWNvbnRyb2wgbmFtZT1zdWJqZWN0IHBsYWNlaG9sZGVyPVN1YmplY3Q+PC9kaXY+PGRpdj48dGV4dGFyZWEgY2xhc3M9dGV4dGFyZWEgcGxhY2Vob2xkZXI9TWVzc2FnZSBzdHlsZT1cXFwid2lkdGg6IDEwMCU7IGhlaWdodDogMTI1cHg7IGZvbnQtc2l6ZTogMTRweDsgbGluZS1oZWlnaHQ6IDE4cHg7IGJvcmRlcjogMXB4IHNvbGlkICNkZGRkZGQ7IHBhZGRpbmc6IDEwcHhcXFwiPjwvdGV4dGFyZWE+PC9kaXY+PC9mb3JtPjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1mb290ZXIgY2xlYXJmaXhcXFwiPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcInB1bGwtcmlnaHQgYnRuIGJ0bi1kZWZhdWx0XFxcIiBpZD1zZW5kRW1haWw+U2VuZCA8aSBjbGFzcz1cXFwiZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0XFxcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PC9zZWN0aW9uPjxzZWN0aW9uIGNsYXNzPVxcXCJjb2wtbGctNSBjb25uZWN0ZWRTb3J0YWJsZVxcXCI+PGRpdiBjbGFzcz1cXFwiYm94IGJveC1zb2xpZCBiZy1saWdodC1ibHVlLWdyYWRpZW50XFxcIj48ZGl2IGNsYXNzPWJveC1oZWFkZXI+PGRpdiBjbGFzcz1cXFwicHVsbC1yaWdodCBib3gtdG9vbHNcXFwiPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gZGF0ZXJhbmdlIHB1bGwtcmlnaHRcXFwiIGRhdGEtdG9nZ2xlPXRvb2x0aXAgdGl0bGU9XFxcIkRhdGUgcmFuZ2VcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jYWxlbmRhclxcXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIHB1bGwtcmlnaHRcXFwiIGRhdGEtd2lkZ2V0PWNvbGxhcHNlIGRhdGEtdG9nZ2xlPXRvb2x0aXAgdGl0bGU9Q29sbGFwc2Ugc3R5bGU9XFxcIm1hcmdpbi1yaWdodDogNXB4XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtbWludXNcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48aSBjbGFzcz1cXFwiZmEgZmEtbWFwLW1hcmtlclxcXCI+PC9pPjxoMyBjbGFzcz1ib3gtdGl0bGU+VmlzaXRvcnM8L2gzPjwvZGl2PjxkaXYgY2xhc3M9Ym94LWJvZHk+PGRpdiBpZD13b3JsZC1tYXAgc3R5bGU9XFxcImhlaWdodDogMjUwcHg7IHdpZHRoOiAxMDAlXFxcIj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtZm9vdGVyIG5vLWJvcmRlclxcXCI+PGRpdiBjbGFzcz1yb3c+PGRpdiBjbGFzcz1cXFwiY29sLXhzLTQgdGV4dC1jZW50ZXJcXFwiIHN0eWxlPVxcXCJib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZjRmNGY0XFxcIj48ZGl2IGlkPXNwYXJrbGluZS0xPjwvZGl2PjxkaXYgY2xhc3M9a25vYi1sYWJlbD5WaXNpdG9yczwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImNvbC14cy00IHRleHQtY2VudGVyXFxcIiBzdHlsZT1cXFwiYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2Y0ZjRmNFxcXCI+PGRpdiBpZD1zcGFya2xpbmUtMj48L2Rpdj48ZGl2IGNsYXNzPWtub2ItbGFiZWw+T25saW5lPC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY29sLXhzLTQgdGV4dC1jZW50ZXJcXFwiPjxkaXYgaWQ9c3BhcmtsaW5lLTM+PC9kaXY+PGRpdiBjbGFzcz1rbm9iLWxhYmVsPkV4aXN0czwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveCBib3gtc29saWQgYmctdGVhbC1ncmFkaWVudFxcXCI+PGRpdiBjbGFzcz1ib3gtaGVhZGVyPjxpIGNsYXNzPVxcXCJmYSBmYS10aFxcXCI+PC9pPjxoMyBjbGFzcz1ib3gtdGl0bGU+U2FsZXMgR3JhcGg8L2gzPjxkaXYgY2xhc3M9XFxcImJveC10b29scyBwdWxsLXJpZ2h0XFxcIj48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYmctdGVhbCBidG4tc21cXFwiIGRhdGEtd2lkZ2V0PWNvbGxhcHNlPjxpIGNsYXNzPVxcXCJmYSBmYS1taW51c1xcXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYmctdGVhbCBidG4tc21cXFwiIGRhdGEtd2lkZ2V0PXJlbW92ZT48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXNcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtYm9keSBib3JkZXItcmFkaXVzLW5vbmVcXFwiPjxkaXYgY2xhc3M9Y2hhcnQgaWQ9bGluZS1jaGFydCBzdHlsZT1cXFwiaGVpZ2h0OiAyNTBweFxcXCI+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWZvb3RlciBuby1ib3JkZXJcXFwiPjxkaXYgY2xhc3M9cm93PjxkaXYgY2xhc3M9XFxcImNvbC14cy00IHRleHQtY2VudGVyXFxcIiBzdHlsZT1cXFwiYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2Y0ZjRmNFxcXCI+PGlucHV0IHR5cGU9dGV4dCBjbGFzcz1rbm9iIGRhdGEtcmVhZG9ubHk9dHJ1ZSB2YWx1ZT0yMCBkYXRhLXdpZHRoPTYwIGRhdGEtaGVpZ2h0PTYwIGRhdGEtZmdjb2xvcj0jMzlDQ0NDPjxkaXYgY2xhc3M9a25vYi1sYWJlbD5NYWlsLU9yZGVyczwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImNvbC14cy00IHRleHQtY2VudGVyXFxcIiBzdHlsZT1cXFwiYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2Y0ZjRmNFxcXCI+PGlucHV0IHR5cGU9dGV4dCBjbGFzcz1rbm9iIGRhdGEtcmVhZG9ubHk9dHJ1ZSB2YWx1ZT01MCBkYXRhLXdpZHRoPTYwIGRhdGEtaGVpZ2h0PTYwIGRhdGEtZmdjb2xvcj0jMzlDQ0NDPjxkaXYgY2xhc3M9a25vYi1sYWJlbD5PbmxpbmU8L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjb2wteHMtNCB0ZXh0LWNlbnRlclxcXCI+PGlucHV0IHR5cGU9dGV4dCBjbGFzcz1rbm9iIGRhdGEtcmVhZG9ubHk9dHJ1ZSB2YWx1ZT0zMCBkYXRhLXdpZHRoPTYwIGRhdGEtaGVpZ2h0PTYwIGRhdGEtZmdjb2xvcj0jMzlDQ0NDPjxkaXYgY2xhc3M9a25vYi1sYWJlbD5Jbi1TdG9yZTwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveCBib3gtc29saWQgYmctZ3JlZW4tZ3JhZGllbnRcXFwiPjxkaXYgY2xhc3M9Ym94LWhlYWRlcj48aSBjbGFzcz1cXFwiZmEgZmEtY2FsZW5kYXJcXFwiPjwvaT48aDMgY2xhc3M9Ym94LXRpdGxlPkNhbGVuZGFyPC9oMz48ZGl2IGNsYXNzPVxcXCJwdWxsLXJpZ2h0IGJveC10b29sc1xcXCI+PGRpdiBjbGFzcz1idG4tZ3JvdXA+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzIGJ0bi1zbSBkcm9wZG93bi10b2dnbGVcXFwiIGRhdGEtdG9nZ2xlPWRyb3Bkb3duPjxpIGNsYXNzPVxcXCJmYSBmYS1iYXJzXFxcIj48L2k+PC9idXR0b24+PHVsIGNsYXNzPVxcXCJkcm9wZG93bi1tZW51IHB1bGwtcmlnaHRcXFwiIHJvbGU9bWVudT48bGk+PGEgaHJlZj0jPkFkZCBuZXcgZXZlbnQ8L2E+PC9saT48bGk+PGEgaHJlZj0jPkNsZWFyIGV2ZW50czwvYT48L2xpPjxsaSBjbGFzcz1kaXZpZGVyPjwvbGk+PGxpPjxhIGhyZWY9Iz5WaWV3IGNhbGVuZGFyPC9hPjwvbGk+PC91bD48L2Rpdj48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3MgYnRuLXNtXFxcIiBkYXRhLXdpZGdldD1jb2xsYXBzZT48aSBjbGFzcz1cXFwiZmEgZmEtbWludXNcXFwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzIGJ0bi1zbVxcXCIgZGF0YS13aWRnZXQ9cmVtb3ZlPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lc1xcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1ib2R5IG5vLXBhZGRpbmdcXFwiPjxkaXYgaWQ9Y2FsZW5kYXIgc3R5bGU9XFxcIndpZHRoOiAxMDAlXFxcIj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtZm9vdGVyIHRleHQtYmxhY2tcXFwiPjxkaXYgY2xhc3M9cm93PjxkaXYgY2xhc3M9Y29sLXNtLTY+PGRpdiBjbGFzcz1jbGVhcmZpeD48c3BhbiBjbGFzcz1wdWxsLWxlZnQ+VGFzayAjMTwvc3Bhbj4gPHNtYWxsIGNsYXNzPXB1bGwtcmlnaHQ+OTAlPC9zbWFsbD48L2Rpdj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyB4c1xcXCI+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1ncmVlblxcXCIgc3R5bGU9XFxcIndpZHRoOiA5MCVcXFwiPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9Y2xlYXJmaXg+PHNwYW4gY2xhc3M9cHVsbC1sZWZ0PlRhc2sgIzI8L3NwYW4+IDxzbWFsbCBjbGFzcz1wdWxsLXJpZ2h0PjcwJTwvc21hbGw+PC9kaXY+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgeHNcXFwiPjxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItZ3JlZW5cXFwiIHN0eWxlPVxcXCJ3aWR0aDogNzAlXFxcIj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWNvbC1zbS02PjxkaXYgY2xhc3M9Y2xlYXJmaXg+PHNwYW4gY2xhc3M9cHVsbC1sZWZ0PlRhc2sgIzM8L3NwYW4+IDxzbWFsbCBjbGFzcz1wdWxsLXJpZ2h0PjYwJTwvc21hbGw+PC9kaXY+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgeHNcXFwiPjxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItZ3JlZW5cXFwiIHN0eWxlPVxcXCJ3aWR0aDogNjAlXFxcIj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWNsZWFyZml4PjxzcGFuIGNsYXNzPXB1bGwtbGVmdD5UYXNrICM0PC9zcGFuPiA8c21hbGwgY2xhc3M9cHVsbC1yaWdodD40MCU8L3NtYWxsPjwvZGl2PjxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHhzXFxcIj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLWdyZWVuXFxcIiBzdHlsZT1cXFwid2lkdGg6IDQwJVxcXCI+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9zZWN0aW9uPjwvZGl2Pjwvc2VjdGlvbj5cIjtcbiIsImltcG9ydCBhbmd1bGFyIGZyb20gJ2FuZ3VsYXInO1xuaW1wb3J0IG5nUmVzb3VyY2UgZnJvbSAnYW5ndWxhci1yZXNvdXJjZSc7XG5cbmNsYXNzIEFQSSB7XG5cblx0Y29uc3RydWN0b3IoJHJlc291cmNlKSB7XG5cblx0XHRjb25zdCByZXNvdXJjZXMgPSB7fTtcblx0XHRjb25zdCB1cmwgPSB3aW5kb3cuYXBpX3VybDtcblxuXG5cdFx0cmVzb3VyY2VzLmdhbGxlcnkgPSAkcmVzb3VyY2UodXJsICsgJy9nYWxsZXJ5LzppZCcsIG51bGwsIHtcblx0ICAgICAgICAndXBkYXRlJzogeyBtZXRob2Q6J1BVVCcgfVxuXHQgICAgfSk7XG5cblx0XHRyZXNvdXJjZXMucGhvdG9zID0gJHJlc291cmNlKHVybCArICcvZ2FsbGVyeS86Z2FsbGVyeUlkL3Bob3Rvcy86cGhvdG9JZCcpO1xuXG5cdFx0cmV0dXJuIHJlc291cmNlcztcbiAgXHR9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgYW5ndWxhci5tb2R1bGUoJ3NlcnZpY2VzLkFQSScsIFtuZ1Jlc291cmNlXSlcbiAgLnNlcnZpY2UoJ0FQSScsIEFQSSlcbiAgLm5hbWU7Il19

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
(function (global){
'use strict';

var _angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var _angular2 = _interopRequireDefault(_angular);

var _routing = require('./config/routing');

var _routing2 = _interopRequireDefault(_routing);

var _home = require('./modules/home/');

var _home2 = _interopRequireDefault(_home);

var _gallery = require('./modules/gallery/');

var _gallery2 = _interopRequireDefault(_gallery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var modules = [_home2.default, _gallery2.default];

var app = _angular2.default.module('app', modules).config(_routing2.default);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./config/routing":5,"./modules/gallery/":8,"./modules/home/":13}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import API from '../../../services/API';

var GalleryListController = function GalleryListController(API) {
    _classCallCheck(this, GalleryListController);

    this.message = 'helloooo';

    API.gallery.query().$promise.then(function (response) {
        console.log(response);
    });
};

exports.default = GalleryListController;


GalleryListController.$inject = ['API'];

},{}],8:[function(require,module,exports){
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

var _galleryList = require('./controllers/gallery.list.controller');

var _galleryList2 = _interopRequireDefault(_galleryList);

var _galleryCreate = require('./controllers/gallery.create.controller');

var _galleryCreate2 = _interopRequireDefault(_galleryCreate);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _angular2.default.module('app.gallery', [_angularUiRouter2.default, _API2.default]).config(_routes2.default).controller('GalleryListController', _galleryList2.default).controller('GalleryCreateController', _galleryCreate2.default).name;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../services/API":16,"./controllers/gallery.create.controller":6,"./controllers/gallery.list.controller":7,"./routes":9,"angular-ui-router":3}],9:[function(require,module,exports){
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
}

},{"./views/gallery.create.html":10,"./views/gallery.list.html":11}],10:[function(require,module,exports){
module.exports = "<h1>{{$controller.message}}</h1>stwórz nową";

},{}],11:[function(require,module,exports){
module.exports = "<h1>{{$controller.message}}</h1>lista galerii";

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{"./controllers/home.controller":12,"./routes":14,"angular-ui-router":3}],14:[function(require,module,exports){
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

},{"./views/home.html":15}],15:[function(require,module,exports){
module.exports = "<section class=content-header><h1>Dashboard <small>Control panel</small></h1><ol class=breadcrumb><li><a href=#><i class=\"fa fa-dashboard\"></i> Home</a></li><li class=active>Dashboard</li></ol></section><section class=content><div class=row><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-aqua\"><div class=inner><h3>150</h3><p>New Orders</p></div><div class=icon><i class=\"ion ion-bag\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-green\"><div class=inner><h3>53<sup style=\"font-size: 20px\">%</sup></h3><p>Bounce Rate</p></div><div class=icon><i class=\"ion ion-stats-bars\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-yellow\"><div class=inner><h3>44</h3><p>User Registrations</p></div><div class=icon><i class=\"ion ion-person-add\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div><div class=\"col-lg-3 col-xs-6\"><div class=\"small-box bg-red\"><div class=inner><h3>65</h3><p>Unique Visitors</p></div><div class=icon><i class=\"ion ion-pie-graph\"></i></div><a href=# class=small-box-footer>More info <i class=\"fa fa-arrow-circle-right\"></i></a></div></div></div><div class=row><section class=\"col-lg-7 connectedSortable\"><div class=nav-tabs-custom><ul class=\"nav nav-tabs pull-right\"><li class=active><a href=#revenue-chart data-toggle=tab>Area</a></li><li><a href=#sales-chart data-toggle=tab>Donut</a></li><li class=\"pull-left header\"><i class=\"fa fa-inbox\"></i> Sales</li></ul><div class=\"tab-content no-padding\"><div class=\"chart tab-pane active\" id=revenue-chart style=\"position: relative; height: 300px\"></div><div class=\"chart tab-pane\" id=sales-chart style=\"position: relative; height: 300px\"></div></div></div><div class=\"box box-success\"><div class=box-header><i class=\"fa fa-comments-o\"></i><h3 class=box-title>Chat</h3><div class=\"box-tools pull-right\" data-toggle=tooltip title=Status><div class=btn-group data-toggle=btn-toggle><button type=button class=\"btn btn-default btn-sm active\"><i class=\"fa fa-square text-green\"></i></button> <button type=button class=\"btn btn-default btn-sm\"><i class=\"fa fa-square text-red\"></i></button></div></div></div><div class=\"box-body chat\" id=chat-box><div class=item><img src=dist/img/user4-128x128.jpg alt=\"user image\" class=online><p class=message><a href=# class=name><small class=\"text-muted pull-right\"><i class=\"fa fa-clock-o\"></i> 2:15</small> Mike Doe</a> I would like to meet you to discuss the latest news about the arrival of the new theme. They say it is going to be one the best themes on the market</p><div class=attachment><h4>Attachments:</h4><p class=filename>Theme-thumbnail-image.jpg</p><div class=pull-right><button type=button class=\"btn btn-primary btn-sm btn-flat\">Open</button></div></div></div><div class=item><img src=dist/img/user3-128x128.jpg alt=\"user image\" class=offline><p class=message><a href=# class=name><small class=\"text-muted pull-right\"><i class=\"fa fa-clock-o\"></i> 5:15</small> Alexander Pierce</a> I would like to meet you to discuss the latest news about the arrival of the new theme. They say it is going to be one the best themes on the market</p></div><div class=item><img src=dist/img/user2-160x160.jpg alt=\"user image\" class=offline><p class=message><a href=# class=name><small class=\"text-muted pull-right\"><i class=\"fa fa-clock-o\"></i> 5:30</small> Susan Doe</a> I would like to meet you to discuss the latest news about the arrival of the new theme. They say it is going to be one the best themes on the market</p></div></div><div class=box-footer><div class=input-group><input class=form-control placeholder=\"Type message...\"><div class=input-group-btn><button type=button class=\"btn btn-success\"><i class=\"fa fa-plus\"></i></button></div></div></div></div><div class=\"box box-primary\"><div class=box-header><i class=\"ion ion-clipboard\"></i><h3 class=box-title>To Do List</h3><div class=\"box-tools pull-right\"><ul class=\"pagination pagination-sm inline\"><li><a href=#>&laquo;</a></li><li><a href=#>1</a></li><li><a href=#>2</a></li><li><a href=#>3</a></li><li><a href=#>&raquo;</a></li></ul></div></div><div class=box-body><ul class=todo-list><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Design a nice theme</span> <small class=\"label label-danger\"><i class=\"fa fa-clock-o\"></i> 2 mins</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Make the theme responsive</span> <small class=\"label label-info\"><i class=\"fa fa-clock-o\"></i> 4 hours</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Let theme shine like a star</span> <small class=\"label label-warning\"><i class=\"fa fa-clock-o\"></i> 1 day</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Let theme shine like a star</span> <small class=\"label label-success\"><i class=\"fa fa-clock-o\"></i> 3 days</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Check your messages and notifications</span> <small class=\"label label-primary\"><i class=\"fa fa-clock-o\"></i> 1 week</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li><li><span class=handle><i class=\"fa fa-ellipsis-v\"></i> <i class=\"fa fa-ellipsis-v\"></i></span> <input type=checkbox value=\"\"> <span class=text>Let theme shine like a star</span> <small class=\"label label-default\"><i class=\"fa fa-clock-o\"></i> 1 month</small><div class=tools><i class=\"fa fa-edit\"></i> <i class=\"fa fa-trash-o\"></i></div></li></ul></div><div class=\"box-footer clearfix no-border\"><button type=button class=\"btn btn-default pull-right\"><i class=\"fa fa-plus\"></i> Add item</button></div></div><div class=\"box box-info\"><div class=box-header><i class=\"fa fa-envelope\"></i><h3 class=box-title>Quick Email</h3><div class=\"pull-right box-tools\"><button type=button class=\"btn btn-info btn-sm\" data-widget=remove data-toggle=tooltip title=Remove><i class=\"fa fa-times\"></i></button></div></div><div class=box-body><form action=# method=post><div class=form-group><input type=email class=form-control name=emailto placeholder=\"Email to:\"></div><div class=form-group><input type=text class=form-control name=subject placeholder=Subject></div><div><textarea class=textarea placeholder=Message style=\"width: 100%; height: 125px; font-size: 14px; line-height: 18px; border: 1px solid #dddddd; padding: 10px\"></textarea></div></form></div><div class=\"box-footer clearfix\"><button type=button class=\"pull-right btn btn-default\" id=sendEmail>Send <i class=\"fa fa-arrow-circle-right\"></i></button></div></div></section><section class=\"col-lg-5 connectedSortable\"><div class=\"box box-solid bg-light-blue-gradient\"><div class=box-header><div class=\"pull-right box-tools\"><button type=button class=\"btn btn-primary btn-sm daterange pull-right\" data-toggle=tooltip title=\"Date range\"><i class=\"fa fa-calendar\"></i></button> <button type=button class=\"btn btn-primary btn-sm pull-right\" data-widget=collapse data-toggle=tooltip title=Collapse style=\"margin-right: 5px\"><i class=\"fa fa-minus\"></i></button></div><i class=\"fa fa-map-marker\"></i><h3 class=box-title>Visitors</h3></div><div class=box-body><div id=world-map style=\"height: 250px; width: 100%\"></div></div><div class=\"box-footer no-border\"><div class=row><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><div id=sparkline-1></div><div class=knob-label>Visitors</div></div><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><div id=sparkline-2></div><div class=knob-label>Online</div></div><div class=\"col-xs-4 text-center\"><div id=sparkline-3></div><div class=knob-label>Exists</div></div></div></div></div><div class=\"box box-solid bg-teal-gradient\"><div class=box-header><i class=\"fa fa-th\"></i><h3 class=box-title>Sales Graph</h3><div class=\"box-tools pull-right\"><button type=button class=\"btn bg-teal btn-sm\" data-widget=collapse><i class=\"fa fa-minus\"></i></button> <button type=button class=\"btn bg-teal btn-sm\" data-widget=remove><i class=\"fa fa-times\"></i></button></div></div><div class=\"box-body border-radius-none\"><div class=chart id=line-chart style=\"height: 250px\"></div></div><div class=\"box-footer no-border\"><div class=row><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><input type=text class=knob data-readonly=true value=20 data-width=60 data-height=60 data-fgcolor=#39CCCC><div class=knob-label>Mail-Orders</div></div><div class=\"col-xs-4 text-center\" style=\"border-right: 1px solid #f4f4f4\"><input type=text class=knob data-readonly=true value=50 data-width=60 data-height=60 data-fgcolor=#39CCCC><div class=knob-label>Online</div></div><div class=\"col-xs-4 text-center\"><input type=text class=knob data-readonly=true value=30 data-width=60 data-height=60 data-fgcolor=#39CCCC><div class=knob-label>In-Store</div></div></div></div></div><div class=\"box box-solid bg-green-gradient\"><div class=box-header><i class=\"fa fa-calendar\"></i><h3 class=box-title>Calendar</h3><div class=\"pull-right box-tools\"><div class=btn-group><button type=button class=\"btn btn-success btn-sm dropdown-toggle\" data-toggle=dropdown><i class=\"fa fa-bars\"></i></button><ul class=\"dropdown-menu pull-right\" role=menu><li><a href=#>Add new event</a></li><li><a href=#>Clear events</a></li><li class=divider></li><li><a href=#>View calendar</a></li></ul></div><button type=button class=\"btn btn-success btn-sm\" data-widget=collapse><i class=\"fa fa-minus\"></i></button> <button type=button class=\"btn btn-success btn-sm\" data-widget=remove><i class=\"fa fa-times\"></i></button></div></div><div class=\"box-body no-padding\"><div id=calendar style=\"width: 100%\"></div></div><div class=\"box-footer text-black\"><div class=row><div class=col-sm-6><div class=clearfix><span class=pull-left>Task #1</span> <small class=pull-right>90%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 90%\"></div></div><div class=clearfix><span class=pull-left>Task #2</span> <small class=pull-right>70%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 70%\"></div></div></div><div class=col-sm-6><div class=clearfix><span class=pull-left>Task #3</span> <small class=pull-right>60%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 60%\"></div></div><div class=clearfix><span class=pull-left>Task #4</span> <small class=pull-right>40%</small></div><div class=\"progress xs\"><div class=\"progress-bar progress-bar-green\" style=\"width: 40%\"></div></div></div></div></div></div></section></div></section>";

},{}],16:[function(require,module,exports){
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
	var url = 'http://ogrodzenia.dev/api';

	resources.gallery = $resource(url + '/gallery/:id');

	return resources;
};

exports.default = _angular2.default.module('services.API', [_angularResource2.default]).service('API', API).name;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"angular-resource":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1yZXNvdXJjZS9hbmd1bGFyLXJlc291cmNlLmpzIiwibm9kZV9tb2R1bGVzL2FuZ3VsYXItcmVzb3VyY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci11aS1yb3V0ZXIvcmVsZWFzZS9hbmd1bGFyLXVpLXJvdXRlci5qcyIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vYXBwLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9jb25maWcvcm91dGluZy5qcyIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vbW9kdWxlcy9nYWxsZXJ5L2NvbnRyb2xsZXJzL2dhbGxlcnkuY3JlYXRlLmNvbnRyb2xsZXIuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS9jb250cm9sbGVycy9nYWxsZXJ5Lmxpc3QuY29udHJvbGxlci5qcyIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vbW9kdWxlcy9nYWxsZXJ5L2luZGV4LmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvcm91dGVzLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvdmlld3MvZ2FsbGVyeS5jcmVhdGUuaHRtbCIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vbW9kdWxlcy9nYWxsZXJ5L3ZpZXdzL2dhbGxlcnkubGlzdC5odG1sIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2hvbWUvY29udHJvbGxlcnMvaG9tZS5jb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2hvbWUvaW5kZXguanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvaG9tZS9yb3V0ZXMuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvaG9tZS92aWV3cy9ob21lLmh0bWwiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL3NlcnZpY2VzL0FQSS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvMUJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMvOUlBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFJLFVBQVUsbUNBQWQ7O0FBRUEsSUFBSSxNQUFNLGtCQUNMLE1BREssQ0FDRSxLQURGLEVBQ1MsT0FEVCxFQUVMLE1BRkssbUJBQVY7Ozs7Ozs7Ozs7a0JDTndCLE87QUFGeEIsUUFBUSxPQUFSLEdBQWtCLENBQUMsb0JBQUQsRUFBdUIsbUJBQXZCLENBQWxCOztBQUVlLFNBQVMsT0FBVCxDQUFpQixrQkFBakIsRUFBcUMsaUJBQXJDLEVBQXdEO0FBQ3JFLG9CQUFrQixTQUFsQixDQUE0QixJQUE1QjtBQUNBLHFCQUFtQixTQUFuQixDQUE2QixHQUE3QjtBQUNEOzs7Ozs7Ozs7OztJQ0xvQix1QixHQUVqQixpQ0FBWSxNQUFaLEVBQW9CO0FBQUE7O0FBQ2hCLFdBQU8sT0FBUCxHQUFpQixvQkFBakI7QUFDSCxDOztrQkFKZ0IsdUI7Ozs7Ozs7Ozs7O0FDQXJCOztJQUVxQixxQixHQUVqQiwrQkFBWSxHQUFaLEVBQWlCO0FBQUE7O0FBQ2IsU0FBSyxPQUFMLEdBQWUsVUFBZjs7QUFFQSxRQUFJLE9BQUosQ0FBWSxLQUFaLEdBQW9CLFFBQXBCLENBQTZCLElBQTdCLENBQWtDLFVBQVUsUUFBVixFQUFvQjtBQUNyRCxnQkFBUSxHQUFSLENBQVksUUFBWjtBQUNBLEtBRkQ7QUFHSCxDOztrQkFSZ0IscUI7OztBQVlyQixzQkFBc0IsT0FBdEIsR0FBZ0MsQ0FBQyxLQUFELENBQWhDOzs7Ozs7Ozs7O0FDZEE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7a0JBRWUsa0JBQVEsTUFBUixDQUFlLGFBQWYsRUFBOEIsMENBQTlCLEVBQ1osTUFEWSxtQkFFWixVQUZZLENBRUQsdUJBRkMseUJBR1osVUFIWSxDQUdELHlCQUhDLDJCQUlaLEk7Ozs7Ozs7Ozs7a0JDWHFCLE07QUFGeEIsT0FBTyxPQUFQLEdBQWlCLENBQUMsZ0JBQUQsQ0FBakI7O0FBRWUsU0FBUyxNQUFULENBQWdCLGNBQWhCLEVBQWdDO0FBQzlDLE1BQU0sdUJBQXVCO0FBQzVCLGNBQVUsSUFEa0I7QUFFNUIsVUFBTSxTQUZzQjtBQUc1QixTQUFLLFVBSHVCO0FBSTVCLGdCQUFZO0FBSmdCLEdBQTdCOztBQU9BLGlCQUFlLEtBQWYsQ0FBcUIsb0JBQXJCOztBQUVFLGlCQUFlLEtBQWYsQ0FBcUI7QUFDbkIsVUFBTSxjQURhO0FBRW5CLFlBQVEsb0JBRlc7QUFHakIsU0FBSyxPQUhZO0FBSWpCLGNBQVUsUUFBUSwyQkFBUixDQUpPO0FBS2pCLGdCQUFZLHVCQUxLO0FBTWpCLGtCQUFjO0FBTkcsR0FBckI7O0FBU0YsaUJBQWUsS0FBZixDQUFxQjtBQUNqQixVQUFNLGdCQURXO0FBRWpCLFlBQVEsb0JBRlM7QUFHZixTQUFLLFNBSFU7QUFJZixjQUFVLFFBQVEsNkJBQVIsQ0FKSztBQUtmLGdCQUFZLHlCQUxHO0FBTWYsa0JBQWM7QUFOQyxHQUFyQjtBQVFBOzs7QUM3QkQ7QUFDQTs7QUNEQTtBQUNBOzs7Ozs7Ozs7O0lDRHFCLGMsR0FFakIsd0JBQVksTUFBWixFQUFvQjtBQUFBOztBQUNoQixXQUFPLE9BQVAsR0FBaUIsY0FBakI7QUFDSCxDOztrQkFKZ0IsYzs7Ozs7Ozs7OztBQ0FyQjs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7Ozs7O2tCQUVlLGtCQUFRLE1BQVIsQ0FBZSxVQUFmLEVBQTJCLDJCQUEzQixFQUNaLE1BRFksbUJBRVosVUFGWSxDQUVELGdCQUZDLGtCQUdaLEk7Ozs7Ozs7Ozs7a0JDUHFCLE07QUFGeEIsT0FBTyxPQUFQLEdBQWlCLENBQUMsZ0JBQUQsQ0FBakI7O0FBRWUsU0FBUyxNQUFULENBQWdCLGNBQWhCLEVBQWdDO0FBQzdDLGlCQUNHLEtBREgsQ0FDUyxNQURULEVBQ2lCO0FBQ2IsU0FBSyxHQURRO0FBRWIsY0FBVSxRQUFRLG1CQUFSLENBRkc7QUFHYixnQkFBWSxnQkFIQztBQUliLGtCQUFjO0FBSkQsR0FEakI7QUFPRDs7O0FDVkQ7QUFDQTs7Ozs7Ozs7O0FDREE7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSxHLEdBRUwsYUFBWSxTQUFaLEVBQXVCO0FBQUE7O0FBRXRCLEtBQU0sWUFBWSxFQUFsQjtBQUNBLEtBQU0sTUFBTSwyQkFBWjs7QUFHQSxXQUFVLE9BQVYsR0FBb0IsVUFBVSxNQUFNLGNBQWhCLENBQXBCOztBQUVBLFFBQU8sU0FBUDtBQUNFLEM7O2tCQUlXLGtCQUFRLE1BQVIsQ0FBZSxjQUFmLEVBQStCLDJCQUEvQixFQUNaLE9BRFksQ0FDSixLQURJLEVBQ0csR0FESCxFQUVaLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBAbGljZW5zZSBBbmd1bGFySlMgdjEuNS44XG4gKiAoYykgMjAxMC0yMDE2IEdvb2dsZSwgSW5jLiBodHRwOi8vYW5ndWxhcmpzLm9yZ1xuICogTGljZW5zZTogTUlUXG4gKi9cbihmdW5jdGlvbih3aW5kb3csIGFuZ3VsYXIpIHsndXNlIHN0cmljdCc7XG5cbnZhciAkcmVzb3VyY2VNaW5FcnIgPSBhbmd1bGFyLiQkbWluRXJyKCckcmVzb3VyY2UnKTtcblxuLy8gSGVscGVyIGZ1bmN0aW9ucyBhbmQgcmVnZXggdG8gbG9va3VwIGEgZG90dGVkIHBhdGggb24gYW4gb2JqZWN0XG4vLyBzdG9wcGluZyBhdCB1bmRlZmluZWQvbnVsbC4gIFRoZSBwYXRoIG11c3QgYmUgY29tcG9zZWQgb2YgQVNDSUlcbi8vIGlkZW50aWZpZXJzIChqdXN0IGxpa2UgJHBhcnNlKVxudmFyIE1FTUJFUl9OQU1FX1JFR0VYID0gL14oXFwuW2EtekEtWl8kQF1bMC05YS16QS1aXyRAXSopKyQvO1xuXG5mdW5jdGlvbiBpc1ZhbGlkRG90dGVkUGF0aChwYXRoKSB7XG4gIHJldHVybiAocGF0aCAhPSBudWxsICYmIHBhdGggIT09ICcnICYmIHBhdGggIT09ICdoYXNPd25Qcm9wZXJ0eScgJiZcbiAgICAgIE1FTUJFUl9OQU1FX1JFR0VYLnRlc3QoJy4nICsgcGF0aCkpO1xufVxuXG5mdW5jdGlvbiBsb29rdXBEb3R0ZWRQYXRoKG9iaiwgcGF0aCkge1xuICBpZiAoIWlzVmFsaWREb3R0ZWRQYXRoKHBhdGgpKSB7XG4gICAgdGhyb3cgJHJlc291cmNlTWluRXJyKCdiYWRtZW1iZXInLCAnRG90dGVkIG1lbWJlciBwYXRoIFwiQHswfVwiIGlzIGludmFsaWQuJywgcGF0aCk7XG4gIH1cbiAgdmFyIGtleXMgPSBwYXRoLnNwbGl0KCcuJyk7XG4gIGZvciAodmFyIGkgPSAwLCBpaSA9IGtleXMubGVuZ3RoOyBpIDwgaWkgJiYgYW5ndWxhci5pc0RlZmluZWQob2JqKTsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgb2JqID0gKG9iaiAhPT0gbnVsbCkgPyBvYmpba2V5XSA6IHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHNoYWxsb3cgY29weSBvZiBhbiBvYmplY3QgYW5kIGNsZWFyIG90aGVyIGZpZWxkcyBmcm9tIHRoZSBkZXN0aW5hdGlvblxuICovXG5mdW5jdGlvbiBzaGFsbG93Q2xlYXJBbmRDb3B5KHNyYywgZHN0KSB7XG4gIGRzdCA9IGRzdCB8fCB7fTtcblxuICBhbmd1bGFyLmZvckVhY2goZHN0LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgZGVsZXRlIGRzdFtrZXldO1xuICB9KTtcblxuICBmb3IgKHZhciBrZXkgaW4gc3JjKSB7XG4gICAgaWYgKHNyYy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmICEoa2V5LmNoYXJBdCgwKSA9PT0gJyQnICYmIGtleS5jaGFyQXQoMSkgPT09ICckJykpIHtcbiAgICAgIGRzdFtrZXldID0gc3JjW2tleV07XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRzdDtcbn1cblxuLyoqXG4gKiBAbmdkb2MgbW9kdWxlXG4gKiBAbmFtZSBuZ1Jlc291cmNlXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiAjIG5nUmVzb3VyY2VcbiAqXG4gKiBUaGUgYG5nUmVzb3VyY2VgIG1vZHVsZSBwcm92aWRlcyBpbnRlcmFjdGlvbiBzdXBwb3J0IHdpdGggUkVTVGZ1bCBzZXJ2aWNlc1xuICogdmlhIHRoZSAkcmVzb3VyY2Ugc2VydmljZS5cbiAqXG4gKlxuICogPGRpdiBkb2MtbW9kdWxlLWNvbXBvbmVudHM9XCJuZ1Jlc291cmNlXCI+PC9kaXY+XG4gKlxuICogU2VlIHtAbGluayBuZ1Jlc291cmNlLiRyZXNvdXJjZVByb3ZpZGVyfSBhbmQge0BsaW5rIG5nUmVzb3VyY2UuJHJlc291cmNlfSBmb3IgdXNhZ2UuXG4gKi9cblxuLyoqXG4gKiBAbmdkb2MgcHJvdmlkZXJcbiAqIEBuYW1lICRyZXNvdXJjZVByb3ZpZGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVXNlIGAkcmVzb3VyY2VQcm92aWRlcmAgdG8gY2hhbmdlIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIHRoZSB7QGxpbmsgbmdSZXNvdXJjZS4kcmVzb3VyY2V9XG4gKiBzZXJ2aWNlLlxuICpcbiAqICMjIERlcGVuZGVuY2llc1xuICogUmVxdWlyZXMgdGhlIHtAbGluayBuZ1Jlc291cmNlIH0gbW9kdWxlIHRvIGJlIGluc3RhbGxlZC5cbiAqXG4gKi9cblxuLyoqXG4gKiBAbmdkb2Mgc2VydmljZVxuICogQG5hbWUgJHJlc291cmNlXG4gKiBAcmVxdWlyZXMgJGh0dHBcbiAqIEByZXF1aXJlcyBuZy4kbG9nXG4gKiBAcmVxdWlyZXMgJHFcbiAqIEByZXF1aXJlcyBuZy4kdGltZW91dFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQSBmYWN0b3J5IHdoaWNoIGNyZWF0ZXMgYSByZXNvdXJjZSBvYmplY3QgdGhhdCBsZXRzIHlvdSBpbnRlcmFjdCB3aXRoXG4gKiBbUkVTVGZ1bF0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9SZXByZXNlbnRhdGlvbmFsX1N0YXRlX1RyYW5zZmVyKSBzZXJ2ZXItc2lkZSBkYXRhIHNvdXJjZXMuXG4gKlxuICogVGhlIHJldHVybmVkIHJlc291cmNlIG9iamVjdCBoYXMgYWN0aW9uIG1ldGhvZHMgd2hpY2ggcHJvdmlkZSBoaWdoLWxldmVsIGJlaGF2aW9ycyB3aXRob3V0XG4gKiB0aGUgbmVlZCB0byBpbnRlcmFjdCB3aXRoIHRoZSBsb3cgbGV2ZWwge0BsaW5rIG5nLiRodHRwICRodHRwfSBzZXJ2aWNlLlxuICpcbiAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdSZXNvdXJjZSBgbmdSZXNvdXJjZWB9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXG4gKlxuICogQnkgZGVmYXVsdCwgdHJhaWxpbmcgc2xhc2hlcyB3aWxsIGJlIHN0cmlwcGVkIGZyb20gdGhlIGNhbGN1bGF0ZWQgVVJMcyxcbiAqIHdoaWNoIGNhbiBwb3NlIHByb2JsZW1zIHdpdGggc2VydmVyIGJhY2tlbmRzIHRoYXQgZG8gbm90IGV4cGVjdCB0aGF0XG4gKiBiZWhhdmlvci4gIFRoaXMgY2FuIGJlIGRpc2FibGVkIGJ5IGNvbmZpZ3VyaW5nIHRoZSBgJHJlc291cmNlUHJvdmlkZXJgIGxpa2VcbiAqIHRoaXM6XG4gKlxuICogYGBganNcbiAgICAgYXBwLmNvbmZpZyhbJyRyZXNvdXJjZVByb3ZpZGVyJywgZnVuY3Rpb24oJHJlc291cmNlUHJvdmlkZXIpIHtcbiAgICAgICAvLyBEb24ndCBzdHJpcCB0cmFpbGluZyBzbGFzaGVzIGZyb20gY2FsY3VsYXRlZCBVUkxzXG4gICAgICAgJHJlc291cmNlUHJvdmlkZXIuZGVmYXVsdHMuc3RyaXBUcmFpbGluZ1NsYXNoZXMgPSBmYWxzZTtcbiAgICAgfV0pO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybCBBIHBhcmFtZXRlcml6ZWQgVVJMIHRlbXBsYXRlIHdpdGggcGFyYW1ldGVycyBwcmVmaXhlZCBieSBgOmAgYXMgaW5cbiAqICAgYC91c2VyLzp1c2VybmFtZWAuIElmIHlvdSBhcmUgdXNpbmcgYSBVUkwgd2l0aCBhIHBvcnQgbnVtYmVyIChlLmcuXG4gKiAgIGBodHRwOi8vZXhhbXBsZS5jb206ODA4MC9hcGlgKSwgaXQgd2lsbCBiZSByZXNwZWN0ZWQuXG4gKlxuICogICBJZiB5b3UgYXJlIHVzaW5nIGEgdXJsIHdpdGggYSBzdWZmaXgsIGp1c3QgYWRkIHRoZSBzdWZmaXgsIGxpa2UgdGhpczpcbiAqICAgYCRyZXNvdXJjZSgnaHR0cDovL2V4YW1wbGUuY29tL3Jlc291cmNlLmpzb24nKWAgb3IgYCRyZXNvdXJjZSgnaHR0cDovL2V4YW1wbGUuY29tLzppZC5qc29uJylgXG4gKiAgIG9yIGV2ZW4gYCRyZXNvdXJjZSgnaHR0cDovL2V4YW1wbGUuY29tL3Jlc291cmNlLzpyZXNvdXJjZV9pZC46Zm9ybWF0JylgXG4gKiAgIElmIHRoZSBwYXJhbWV0ZXIgYmVmb3JlIHRoZSBzdWZmaXggaXMgZW1wdHksIDpyZXNvdXJjZV9pZCBpbiB0aGlzIGNhc2UsIHRoZW4gdGhlIGAvLmAgd2lsbCBiZVxuICogICBjb2xsYXBzZWQgZG93biB0byBhIHNpbmdsZSBgLmAuICBJZiB5b3UgbmVlZCB0aGlzIHNlcXVlbmNlIHRvIGFwcGVhciBhbmQgbm90IGNvbGxhcHNlIHRoZW4geW91XG4gKiAgIGNhbiBlc2NhcGUgaXQgd2l0aCBgL1xcLmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3Q9fSBwYXJhbURlZmF1bHRzIERlZmF1bHQgdmFsdWVzIGZvciBgdXJsYCBwYXJhbWV0ZXJzLiBUaGVzZSBjYW4gYmUgb3ZlcnJpZGRlbiBpblxuICogICBgYWN0aW9uc2AgbWV0aG9kcy4gSWYgYSBwYXJhbWV0ZXIgdmFsdWUgaXMgYSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgZXZlcnkgdGltZVxuICogICBhIHBhcmFtIHZhbHVlIG5lZWRzIHRvIGJlIG9idGFpbmVkIGZvciBhIHJlcXVlc3QgKHVubGVzcyB0aGUgcGFyYW0gd2FzIG92ZXJyaWRkZW4pLiBUaGUgZnVuY3Rpb25cbiAqICAgd2lsbCBiZSBwYXNzZWQgdGhlIGN1cnJlbnQgZGF0YSB2YWx1ZSBhcyBhbiBhcmd1bWVudC5cbiAqXG4gKiAgIEVhY2gga2V5IHZhbHVlIGluIHRoZSBwYXJhbWV0ZXIgb2JqZWN0IGlzIGZpcnN0IGJvdW5kIHRvIHVybCB0ZW1wbGF0ZSBpZiBwcmVzZW50IGFuZCB0aGVuIGFueVxuICogICBleGNlc3Mga2V5cyBhcmUgYXBwZW5kZWQgdG8gdGhlIHVybCBzZWFyY2ggcXVlcnkgYWZ0ZXIgdGhlIGA/YC5cbiAqXG4gKiAgIEdpdmVuIGEgdGVtcGxhdGUgYC9wYXRoLzp2ZXJiYCBhbmQgcGFyYW1ldGVyIGB7dmVyYjonZ3JlZXQnLCBzYWx1dGF0aW9uOidIZWxsbyd9YCByZXN1bHRzIGluXG4gKiAgIFVSTCBgL3BhdGgvZ3JlZXQ/c2FsdXRhdGlvbj1IZWxsb2AuXG4gKlxuICogICBJZiB0aGUgcGFyYW1ldGVyIHZhbHVlIGlzIHByZWZpeGVkIHdpdGggYEBgLCB0aGVuIHRoZSB2YWx1ZSBmb3IgdGhhdCBwYXJhbWV0ZXIgd2lsbCBiZVxuICogICBleHRyYWN0ZWQgZnJvbSB0aGUgY29ycmVzcG9uZGluZyBwcm9wZXJ0eSBvbiB0aGUgYGRhdGFgIG9iamVjdCAocHJvdmlkZWQgd2hlbiBjYWxsaW5nIGFcbiAqICAgXCJub24tR0VUXCIgYWN0aW9uIG1ldGhvZCkuXG4gKiAgIEZvciBleGFtcGxlLCBpZiB0aGUgYGRlZmF1bHRQYXJhbWAgb2JqZWN0IGlzIGB7c29tZVBhcmFtOiAnQHNvbWVQcm9wJ31gIHRoZW4gdGhlIHZhbHVlIG9mXG4gKiAgIGBzb21lUGFyYW1gIHdpbGwgYmUgYGRhdGEuc29tZVByb3BgLlxuICogICBOb3RlIHRoYXQgdGhlIHBhcmFtZXRlciB3aWxsIGJlIGlnbm9yZWQsIHdoZW4gY2FsbGluZyBhIFwiR0VUXCIgYWN0aW9uIG1ldGhvZCAoaS5lLiBhbiBhY3Rpb25cbiAqICAgbWV0aG9kIHRoYXQgZG9lcyBub3QgYWNjZXB0IGEgcmVxdWVzdCBib2R5KVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0LjxPYmplY3Q+PX0gYWN0aW9ucyBIYXNoIHdpdGggZGVjbGFyYXRpb24gb2YgY3VzdG9tIGFjdGlvbnMgdGhhdCBzaG91bGQgZXh0ZW5kXG4gKiAgIHRoZSBkZWZhdWx0IHNldCBvZiByZXNvdXJjZSBhY3Rpb25zLiBUaGUgZGVjbGFyYXRpb24gc2hvdWxkIGJlIGNyZWF0ZWQgaW4gdGhlIGZvcm1hdCBvZiB7QGxpbmtcbiAqICAgbmcuJGh0dHAjdXNhZ2UgJGh0dHAuY29uZmlnfTpcbiAqXG4gKiAgICAgICB7YWN0aW9uMToge21ldGhvZDo/LCBwYXJhbXM6PywgaXNBcnJheTo/LCBoZWFkZXJzOj8sIC4uLn0sXG4gKiAgICAgICAgYWN0aW9uMjoge21ldGhvZDo/LCBwYXJhbXM6PywgaXNBcnJheTo/LCBoZWFkZXJzOj8sIC4uLn0sXG4gKiAgICAgICAgLi4ufVxuICpcbiAqICAgV2hlcmU6XG4gKlxuICogICAtICoqYGFjdGlvbmAqKiDigJMge3N0cmluZ30g4oCTIFRoZSBuYW1lIG9mIGFjdGlvbi4gVGhpcyBuYW1lIGJlY29tZXMgdGhlIG5hbWUgb2YgdGhlIG1ldGhvZCBvblxuICogICAgIHlvdXIgcmVzb3VyY2Ugb2JqZWN0LlxuICogICAtICoqYG1ldGhvZGAqKiDigJMge3N0cmluZ30g4oCTIENhc2UgaW5zZW5zaXRpdmUgSFRUUCBtZXRob2QgKGUuZy4gYEdFVGAsIGBQT1NUYCwgYFBVVGAsXG4gKiAgICAgYERFTEVURWAsIGBKU09OUGAsIGV0YykuXG4gKiAgIC0gKipgcGFyYW1zYCoqIOKAkyB7T2JqZWN0PX0g4oCTIE9wdGlvbmFsIHNldCBvZiBwcmUtYm91bmQgcGFyYW1ldGVycyBmb3IgdGhpcyBhY3Rpb24uIElmIGFueSBvZlxuICogICAgIHRoZSBwYXJhbWV0ZXIgdmFsdWUgaXMgYSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgZXZlcnkgdGltZSB3aGVuIGEgcGFyYW0gdmFsdWUgbmVlZHMgdG9cbiAqICAgICBiZSBvYnRhaW5lZCBmb3IgYSByZXF1ZXN0ICh1bmxlc3MgdGhlIHBhcmFtIHdhcyBvdmVycmlkZGVuKS4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgcGFzc2VkIHRoZVxuICogICAgIGN1cnJlbnQgZGF0YSB2YWx1ZSBhcyBhbiBhcmd1bWVudC5cbiAqICAgLSAqKmB1cmxgKiog4oCTIHtzdHJpbmd9IOKAkyBhY3Rpb24gc3BlY2lmaWMgYHVybGAgb3ZlcnJpZGUuIFRoZSB1cmwgdGVtcGxhdGluZyBpcyBzdXBwb3J0ZWQganVzdFxuICogICAgIGxpa2UgZm9yIHRoZSByZXNvdXJjZS1sZXZlbCB1cmxzLlxuICogICAtICoqYGlzQXJyYXlgKiog4oCTIHtib29sZWFuPX0g4oCTIElmIHRydWUgdGhlbiB0aGUgcmV0dXJuZWQgb2JqZWN0IGZvciB0aGlzIGFjdGlvbiBpcyBhbiBhcnJheSxcbiAqICAgICBzZWUgYHJldHVybnNgIHNlY3Rpb24uXG4gKiAgIC0gKipgdHJhbnNmb3JtUmVxdWVzdGAqKiDigJNcbiAqICAgICBge2Z1bmN0aW9uKGRhdGEsIGhlYWRlcnNHZXR0ZXIpfEFycmF5LjxmdW5jdGlvbihkYXRhLCBoZWFkZXJzR2V0dGVyKT59YCDigJNcbiAqICAgICB0cmFuc2Zvcm0gZnVuY3Rpb24gb3IgYW4gYXJyYXkgb2Ygc3VjaCBmdW5jdGlvbnMuIFRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gdGFrZXMgdGhlIGh0dHBcbiAqICAgICByZXF1ZXN0IGJvZHkgYW5kIGhlYWRlcnMgYW5kIHJldHVybnMgaXRzIHRyYW5zZm9ybWVkICh0eXBpY2FsbHkgc2VyaWFsaXplZCkgdmVyc2lvbi5cbiAqICAgICBCeSBkZWZhdWx0LCB0cmFuc2Zvcm1SZXF1ZXN0IHdpbGwgY29udGFpbiBvbmUgZnVuY3Rpb24gdGhhdCBjaGVja3MgaWYgdGhlIHJlcXVlc3QgZGF0YSBpc1xuICogICAgIGFuIG9iamVjdCBhbmQgc2VyaWFsaXplcyB0byB1c2luZyBgYW5ndWxhci50b0pzb25gLiBUbyBwcmV2ZW50IHRoaXMgYmVoYXZpb3IsIHNldFxuICogICAgIGB0cmFuc2Zvcm1SZXF1ZXN0YCB0byBhbiBlbXB0eSBhcnJheTogYHRyYW5zZm9ybVJlcXVlc3Q6IFtdYFxuICogICAtICoqYHRyYW5zZm9ybVJlc3BvbnNlYCoqIOKAk1xuICogICAgIGB7ZnVuY3Rpb24oZGF0YSwgaGVhZGVyc0dldHRlcil8QXJyYXkuPGZ1bmN0aW9uKGRhdGEsIGhlYWRlcnNHZXR0ZXIpPn1gIOKAk1xuICogICAgIHRyYW5zZm9ybSBmdW5jdGlvbiBvciBhbiBhcnJheSBvZiBzdWNoIGZ1bmN0aW9ucy4gVGhlIHRyYW5zZm9ybSBmdW5jdGlvbiB0YWtlcyB0aGUgaHR0cFxuICogICAgIHJlc3BvbnNlIGJvZHkgYW5kIGhlYWRlcnMgYW5kIHJldHVybnMgaXRzIHRyYW5zZm9ybWVkICh0eXBpY2FsbHkgZGVzZXJpYWxpemVkKSB2ZXJzaW9uLlxuICogICAgIEJ5IGRlZmF1bHQsIHRyYW5zZm9ybVJlc3BvbnNlIHdpbGwgY29udGFpbiBvbmUgZnVuY3Rpb24gdGhhdCBjaGVja3MgaWYgdGhlIHJlc3BvbnNlIGxvb2tzXG4gKiAgICAgbGlrZSBhIEpTT04gc3RyaW5nIGFuZCBkZXNlcmlhbGl6ZXMgaXQgdXNpbmcgYGFuZ3VsYXIuZnJvbUpzb25gLiBUbyBwcmV2ZW50IHRoaXMgYmVoYXZpb3IsXG4gKiAgICAgc2V0IGB0cmFuc2Zvcm1SZXNwb25zZWAgdG8gYW4gZW1wdHkgYXJyYXk6IGB0cmFuc2Zvcm1SZXNwb25zZTogW11gXG4gKiAgIC0gKipgY2FjaGVgKiog4oCTIGB7Ym9vbGVhbnxDYWNoZX1gIOKAkyBJZiB0cnVlLCBhIGRlZmF1bHQgJGh0dHAgY2FjaGUgd2lsbCBiZSB1c2VkIHRvIGNhY2hlIHRoZVxuICogICAgIEdFVCByZXF1ZXN0LCBvdGhlcndpc2UgaWYgYSBjYWNoZSBpbnN0YW5jZSBidWlsdCB3aXRoXG4gKiAgICAge0BsaW5rIG5nLiRjYWNoZUZhY3RvcnkgJGNhY2hlRmFjdG9yeX0sIHRoaXMgY2FjaGUgd2lsbCBiZSB1c2VkIGZvclxuICogICAgIGNhY2hpbmcuXG4gKiAgIC0gKipgdGltZW91dGAqKiDigJMgYHtudW1iZXJ9YCDigJMgdGltZW91dCBpbiBtaWxsaXNlY29uZHMuPGJyIC8+XG4gKiAgICAgKipOb3RlOioqIEluIGNvbnRyYXN0IHRvIHtAbGluayBuZy4kaHR0cCN1c2FnZSAkaHR0cC5jb25maWd9LCB7QGxpbmsgbmcuJHEgcHJvbWlzZXN9IGFyZVxuICogICAgICoqbm90Kiogc3VwcG9ydGVkIGluICRyZXNvdXJjZSwgYmVjYXVzZSB0aGUgc2FtZSB2YWx1ZSB3b3VsZCBiZSB1c2VkIGZvciBtdWx0aXBsZSByZXF1ZXN0cy5cbiAqICAgICBJZiB5b3UgYXJlIGxvb2tpbmcgZm9yIGEgd2F5IHRvIGNhbmNlbCByZXF1ZXN0cywgeW91IHNob3VsZCB1c2UgdGhlIGBjYW5jZWxsYWJsZWAgb3B0aW9uLlxuICogICAtICoqYGNhbmNlbGxhYmxlYCoqIOKAkyBge2Jvb2xlYW59YCDigJMgaWYgc2V0IHRvIHRydWUsIHRoZSByZXF1ZXN0IG1hZGUgYnkgYSBcIm5vbi1pbnN0YW5jZVwiIGNhbGxcbiAqICAgICB3aWxsIGJlIGNhbmNlbGxlZCAoaWYgbm90IGFscmVhZHkgY29tcGxldGVkKSBieSBjYWxsaW5nIGAkY2FuY2VsUmVxdWVzdCgpYCBvbiB0aGUgY2FsbCdzXG4gKiAgICAgcmV0dXJuIHZhbHVlLiBDYWxsaW5nIGAkY2FuY2VsUmVxdWVzdCgpYCBmb3IgYSBub24tY2FuY2VsbGFibGUgb3IgYW4gYWxyZWFkeVxuICogICAgIGNvbXBsZXRlZC9jYW5jZWxsZWQgcmVxdWVzdCB3aWxsIGhhdmUgbm8gZWZmZWN0LjxiciAvPlxuICogICAtICoqYHdpdGhDcmVkZW50aWFsc2AqKiAtIGB7Ym9vbGVhbn1gIC0gd2hldGhlciB0byBzZXQgdGhlIGB3aXRoQ3JlZGVudGlhbHNgIGZsYWcgb24gdGhlXG4gKiAgICAgWEhSIG9iamVjdC4gU2VlXG4gKiAgICAgW3JlcXVlc3RzIHdpdGggY3JlZGVudGlhbHNdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL2h0dHBfYWNjZXNzX2NvbnRyb2wjc2VjdGlvbl81KVxuICogICAgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICogICAtICoqYHJlc3BvbnNlVHlwZWAqKiAtIGB7c3RyaW5nfWAgLSBzZWVcbiAqICAgICBbcmVxdWVzdFR5cGVdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvRE9NL1hNTEh0dHBSZXF1ZXN0I3Jlc3BvbnNlVHlwZSkuXG4gKiAgIC0gKipgaW50ZXJjZXB0b3JgKiogLSBge09iamVjdD19YCAtIFRoZSBpbnRlcmNlcHRvciBvYmplY3QgaGFzIHR3byBvcHRpb25hbCBtZXRob2RzIC1cbiAqICAgICBgcmVzcG9uc2VgIGFuZCBgcmVzcG9uc2VFcnJvcmAuIEJvdGggYHJlc3BvbnNlYCBhbmQgYHJlc3BvbnNlRXJyb3JgIGludGVyY2VwdG9ycyBnZXQgY2FsbGVkXG4gKiAgICAgd2l0aCBgaHR0cCByZXNwb25zZWAgb2JqZWN0LiBTZWUge0BsaW5rIG5nLiRodHRwICRodHRwIGludGVyY2VwdG9yc30uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgSGFzaCB3aXRoIGN1c3RvbSBzZXR0aW5ncyB0aGF0IHNob3VsZCBleHRlbmQgdGhlXG4gKiAgIGRlZmF1bHQgYCRyZXNvdXJjZVByb3ZpZGVyYCBiZWhhdmlvci4gIFRoZSBzdXBwb3J0ZWQgb3B0aW9ucyBhcmU6XG4gKlxuICogICAtICoqYHN0cmlwVHJhaWxpbmdTbGFzaGVzYCoqIOKAkyB7Ym9vbGVhbn0g4oCTIElmIHRydWUgdGhlbiB0aGUgdHJhaWxpbmdcbiAqICAgc2xhc2hlcyBmcm9tIGFueSBjYWxjdWxhdGVkIFVSTCB3aWxsIGJlIHN0cmlwcGVkLiAoRGVmYXVsdHMgdG8gdHJ1ZS4pXG4gKiAgIC0gKipgY2FuY2VsbGFibGVgKiog4oCTIHtib29sZWFufSDigJMgSWYgdHJ1ZSwgdGhlIHJlcXVlc3QgbWFkZSBieSBhIFwibm9uLWluc3RhbmNlXCIgY2FsbCB3aWxsIGJlXG4gKiAgIGNhbmNlbGxlZCAoaWYgbm90IGFscmVhZHkgY29tcGxldGVkKSBieSBjYWxsaW5nIGAkY2FuY2VsUmVxdWVzdCgpYCBvbiB0aGUgY2FsbCdzIHJldHVybiB2YWx1ZS5cbiAqICAgVGhpcyBjYW4gYmUgb3ZlcndyaXR0ZW4gcGVyIGFjdGlvbi4gKERlZmF1bHRzIHRvIGZhbHNlLilcbiAqXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBBIHJlc291cmNlIFwiY2xhc3NcIiBvYmplY3Qgd2l0aCBtZXRob2RzIGZvciB0aGUgZGVmYXVsdCBzZXQgb2YgcmVzb3VyY2UgYWN0aW9uc1xuICogICBvcHRpb25hbGx5IGV4dGVuZGVkIHdpdGggY3VzdG9tIGBhY3Rpb25zYC4gVGhlIGRlZmF1bHQgc2V0IGNvbnRhaW5zIHRoZXNlIGFjdGlvbnM6XG4gKiAgIGBgYGpzXG4gKiAgIHsgJ2dldCc6ICAgIHttZXRob2Q6J0dFVCd9LFxuICogICAgICdzYXZlJzogICB7bWV0aG9kOidQT1NUJ30sXG4gKiAgICAgJ3F1ZXJ5JzogIHttZXRob2Q6J0dFVCcsIGlzQXJyYXk6dHJ1ZX0sXG4gKiAgICAgJ3JlbW92ZSc6IHttZXRob2Q6J0RFTEVURSd9LFxuICogICAgICdkZWxldGUnOiB7bWV0aG9kOidERUxFVEUnfSB9O1xuICogICBgYGBcbiAqXG4gKiAgIENhbGxpbmcgdGhlc2UgbWV0aG9kcyBpbnZva2UgYW4ge0BsaW5rIG5nLiRodHRwfSB3aXRoIHRoZSBzcGVjaWZpZWQgaHR0cCBtZXRob2QsXG4gKiAgIGRlc3RpbmF0aW9uIGFuZCBwYXJhbWV0ZXJzLiBXaGVuIHRoZSBkYXRhIGlzIHJldHVybmVkIGZyb20gdGhlIHNlcnZlciB0aGVuIHRoZSBvYmplY3QgaXMgYW5cbiAqICAgaW5zdGFuY2Ugb2YgdGhlIHJlc291cmNlIGNsYXNzLiBUaGUgYWN0aW9ucyBgc2F2ZWAsIGByZW1vdmVgIGFuZCBgZGVsZXRlYCBhcmUgYXZhaWxhYmxlIG9uIGl0XG4gKiAgIGFzICBtZXRob2RzIHdpdGggdGhlIGAkYCBwcmVmaXguIFRoaXMgYWxsb3dzIHlvdSB0byBlYXNpbHkgcGVyZm9ybSBDUlVEIG9wZXJhdGlvbnMgKGNyZWF0ZSxcbiAqICAgcmVhZCwgdXBkYXRlLCBkZWxldGUpIG9uIHNlcnZlci1zaWRlIGRhdGEgbGlrZSB0aGlzOlxuICogICBgYGBqc1xuICogICB2YXIgVXNlciA9ICRyZXNvdXJjZSgnL3VzZXIvOnVzZXJJZCcsIHt1c2VySWQ6J0BpZCd9KTtcbiAqICAgdmFyIHVzZXIgPSBVc2VyLmdldCh7dXNlcklkOjEyM30sIGZ1bmN0aW9uKCkge1xuICogICAgIHVzZXIuYWJjID0gdHJ1ZTtcbiAqICAgICB1c2VyLiRzYXZlKCk7XG4gKiAgIH0pO1xuICogICBgYGBcbiAqXG4gKiAgIEl0IGlzIGltcG9ydGFudCB0byByZWFsaXplIHRoYXQgaW52b2tpbmcgYSAkcmVzb3VyY2Ugb2JqZWN0IG1ldGhvZCBpbW1lZGlhdGVseSByZXR1cm5zIGFuXG4gKiAgIGVtcHR5IHJlZmVyZW5jZSAob2JqZWN0IG9yIGFycmF5IGRlcGVuZGluZyBvbiBgaXNBcnJheWApLiBPbmNlIHRoZSBkYXRhIGlzIHJldHVybmVkIGZyb20gdGhlXG4gKiAgIHNlcnZlciB0aGUgZXhpc3RpbmcgcmVmZXJlbmNlIGlzIHBvcHVsYXRlZCB3aXRoIHRoZSBhY3R1YWwgZGF0YS4gVGhpcyBpcyBhIHVzZWZ1bCB0cmljayBzaW5jZVxuICogICB1c3VhbGx5IHRoZSByZXNvdXJjZSBpcyBhc3NpZ25lZCB0byBhIG1vZGVsIHdoaWNoIGlzIHRoZW4gcmVuZGVyZWQgYnkgdGhlIHZpZXcuIEhhdmluZyBhbiBlbXB0eVxuICogICBvYmplY3QgcmVzdWx0cyBpbiBubyByZW5kZXJpbmcsIG9uY2UgdGhlIGRhdGEgYXJyaXZlcyBmcm9tIHRoZSBzZXJ2ZXIgdGhlbiB0aGUgb2JqZWN0IGlzXG4gKiAgIHBvcHVsYXRlZCB3aXRoIHRoZSBkYXRhIGFuZCB0aGUgdmlldyBhdXRvbWF0aWNhbGx5IHJlLXJlbmRlcnMgaXRzZWxmIHNob3dpbmcgdGhlIG5ldyBkYXRhLiBUaGlzXG4gKiAgIG1lYW5zIHRoYXQgaW4gbW9zdCBjYXNlcyBvbmUgbmV2ZXIgaGFzIHRvIHdyaXRlIGEgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSBhY3Rpb24gbWV0aG9kcy5cbiAqXG4gKiAgIFRoZSBhY3Rpb24gbWV0aG9kcyBvbiB0aGUgY2xhc3Mgb2JqZWN0IG9yIGluc3RhbmNlIG9iamVjdCBjYW4gYmUgaW52b2tlZCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAqICAgcGFyYW1ldGVyczpcbiAqXG4gKiAgIC0gSFRUUCBHRVQgXCJjbGFzc1wiIGFjdGlvbnM6IGBSZXNvdXJjZS5hY3Rpb24oW3BhcmFtZXRlcnNdLCBbc3VjY2Vzc10sIFtlcnJvcl0pYFxuICogICAtIG5vbi1HRVQgXCJjbGFzc1wiIGFjdGlvbnM6IGBSZXNvdXJjZS5hY3Rpb24oW3BhcmFtZXRlcnNdLCBwb3N0RGF0YSwgW3N1Y2Nlc3NdLCBbZXJyb3JdKWBcbiAqICAgLSBub24tR0VUIGluc3RhbmNlIGFjdGlvbnM6ICBgaW5zdGFuY2UuJGFjdGlvbihbcGFyYW1ldGVyc10sIFtzdWNjZXNzXSwgW2Vycm9yXSlgXG4gKlxuICpcbiAqICAgU3VjY2VzcyBjYWxsYmFjayBpcyBjYWxsZWQgd2l0aCAodmFsdWUsIHJlc3BvbnNlSGVhZGVycykgYXJndW1lbnRzLCB3aGVyZSB0aGUgdmFsdWUgaXNcbiAqICAgdGhlIHBvcHVsYXRlZCByZXNvdXJjZSBpbnN0YW5jZSBvciBjb2xsZWN0aW9uIG9iamVjdC4gVGhlIGVycm9yIGNhbGxiYWNrIGlzIGNhbGxlZFxuICogICB3aXRoIChodHRwUmVzcG9uc2UpIGFyZ3VtZW50LlxuICpcbiAqICAgQ2xhc3MgYWN0aW9ucyByZXR1cm4gZW1wdHkgaW5zdGFuY2UgKHdpdGggYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGJlbG93KS5cbiAqICAgSW5zdGFuY2UgYWN0aW9ucyByZXR1cm4gcHJvbWlzZSBvZiB0aGUgYWN0aW9uLlxuICpcbiAqICAgVGhlIFJlc291cmNlIGluc3RhbmNlcyBhbmQgY29sbGVjdGlvbnMgaGF2ZSB0aGVzZSBhZGRpdGlvbmFsIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGAkcHJvbWlzZWA6IHRoZSB7QGxpbmsgbmcuJHEgcHJvbWlzZX0gb2YgdGhlIG9yaWdpbmFsIHNlcnZlciBpbnRlcmFjdGlvbiB0aGF0IGNyZWF0ZWQgdGhpc1xuICogICAgIGluc3RhbmNlIG9yIGNvbGxlY3Rpb24uXG4gKlxuICogICAgIE9uIHN1Y2Nlc3MsIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHNhbWUgcmVzb3VyY2UgaW5zdGFuY2Ugb3IgY29sbGVjdGlvbiBvYmplY3QsXG4gKiAgICAgdXBkYXRlZCB3aXRoIGRhdGEgZnJvbSBzZXJ2ZXIuIFRoaXMgbWFrZXMgaXQgZWFzeSB0byB1c2UgaW5cbiAqICAgICB7QGxpbmsgbmdSb3V0ZS4kcm91dGVQcm92aWRlciByZXNvbHZlIHNlY3Rpb24gb2YgJHJvdXRlUHJvdmlkZXIud2hlbigpfSB0byBkZWZlciB2aWV3XG4gKiAgICAgcmVuZGVyaW5nIHVudGlsIHRoZSByZXNvdXJjZShzKSBhcmUgbG9hZGVkLlxuICpcbiAqICAgICBPbiBmYWlsdXJlLCB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCB3aXRoIHRoZSB7QGxpbmsgbmcuJGh0dHAgaHR0cCByZXNwb25zZX0gb2JqZWN0LCB3aXRob3V0XG4gKiAgICAgdGhlIGByZXNvdXJjZWAgcHJvcGVydHkuXG4gKlxuICogICAgIElmIGFuIGludGVyY2VwdG9yIG9iamVjdCB3YXMgcHJvdmlkZWQsIHRoZSBwcm9taXNlIHdpbGwgaW5zdGVhZCBiZSByZXNvbHZlZCB3aXRoIHRoZSB2YWx1ZVxuICogICAgIHJldHVybmVkIGJ5IHRoZSBpbnRlcmNlcHRvci5cbiAqXG4gKiAgIC0gYCRyZXNvbHZlZGA6IGB0cnVlYCBhZnRlciBmaXJzdCBzZXJ2ZXIgaW50ZXJhY3Rpb24gaXMgY29tcGxldGVkIChlaXRoZXIgd2l0aCBzdWNjZXNzIG9yXG4gKiAgICAgIHJlamVjdGlvbiksIGBmYWxzZWAgYmVmb3JlIHRoYXQuIEtub3dpbmcgaWYgdGhlIFJlc291cmNlIGhhcyBiZWVuIHJlc29sdmVkIGlzIHVzZWZ1bCBpblxuICogICAgICBkYXRhLWJpbmRpbmcuXG4gKlxuICogICBUaGUgUmVzb3VyY2UgaW5zdGFuY2VzIGFuZCBjb2xsZWN0aW9ucyBoYXZlIHRoZXNlIGFkZGl0aW9uYWwgbWV0aG9kczpcbiAqXG4gKiAgIC0gYCRjYW5jZWxSZXF1ZXN0YDogSWYgdGhlcmUgaXMgYSBjYW5jZWxsYWJsZSwgcGVuZGluZyByZXF1ZXN0IHJlbGF0ZWQgdG8gdGhlIGluc3RhbmNlIG9yXG4gKiAgICAgIGNvbGxlY3Rpb24sIGNhbGxpbmcgdGhpcyBtZXRob2Qgd2lsbCBhYm9ydCB0aGUgcmVxdWVzdC5cbiAqXG4gKiAgIFRoZSBSZXNvdXJjZSBpbnN0YW5jZXMgaGF2ZSB0aGVzZSBhZGRpdGlvbmFsIG1ldGhvZHM6XG4gKlxuICogICAtIGB0b0pTT05gOiBJdCByZXR1cm5zIGEgc2ltcGxlIG9iamVjdCB3aXRob3V0IGFueSBvZiB0aGUgZXh0cmEgcHJvcGVydGllcyBhZGRlZCBhcyBwYXJ0IG9mXG4gKiAgICAgdGhlIFJlc291cmNlIEFQSS4gVGhpcyBvYmplY3QgY2FuIGJlIHNlcmlhbGl6ZWQgdGhyb3VnaCB7QGxpbmsgYW5ndWxhci50b0pzb259IHNhZmVseVxuICogICAgIHdpdGhvdXQgYXR0YWNoaW5nIEFuZ3VsYXItc3BlY2lmaWMgZmllbGRzLiBOb3RpY2UgdGhhdCBgSlNPTi5zdHJpbmdpZnlgIChhbmRcbiAqICAgICBgYW5ndWxhci50b0pzb25gKSBhdXRvbWF0aWNhbGx5IHVzZSB0aGlzIG1ldGhvZCB3aGVuIHNlcmlhbGl6aW5nIGEgUmVzb3VyY2UgaW5zdGFuY2VcbiAqICAgICAoc2VlIFtNRE5dKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5I3RvSlNPTigpX2JlaGF2aW9yKSkuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAjIENyZWRpdCBjYXJkIHJlc291cmNlXG4gKlxuICogYGBganNcbiAgICAgLy8gRGVmaW5lIENyZWRpdENhcmQgY2xhc3NcbiAgICAgdmFyIENyZWRpdENhcmQgPSAkcmVzb3VyY2UoJy91c2VyLzp1c2VySWQvY2FyZC86Y2FyZElkJyxcbiAgICAgIHt1c2VySWQ6MTIzLCBjYXJkSWQ6J0BpZCd9LCB7XG4gICAgICAgY2hhcmdlOiB7bWV0aG9kOidQT1NUJywgcGFyYW1zOntjaGFyZ2U6dHJ1ZX19XG4gICAgICB9KTtcblxuICAgICAvLyBXZSBjYW4gcmV0cmlldmUgYSBjb2xsZWN0aW9uIGZyb20gdGhlIHNlcnZlclxuICAgICB2YXIgY2FyZHMgPSBDcmVkaXRDYXJkLnF1ZXJ5KGZ1bmN0aW9uKCkge1xuICAgICAgIC8vIEdFVDogL3VzZXIvMTIzL2NhcmRcbiAgICAgICAvLyBzZXJ2ZXIgcmV0dXJuczogWyB7aWQ6NDU2LCBudW1iZXI6JzEyMzQnLCBuYW1lOidTbWl0aCd9IF07XG5cbiAgICAgICB2YXIgY2FyZCA9IGNhcmRzWzBdO1xuICAgICAgIC8vIGVhY2ggaXRlbSBpcyBhbiBpbnN0YW5jZSBvZiBDcmVkaXRDYXJkXG4gICAgICAgZXhwZWN0KGNhcmQgaW5zdGFuY2VvZiBDcmVkaXRDYXJkKS50b0VxdWFsKHRydWUpO1xuICAgICAgIGNhcmQubmFtZSA9IFwiSi4gU21pdGhcIjtcbiAgICAgICAvLyBub24gR0VUIG1ldGhvZHMgYXJlIG1hcHBlZCBvbnRvIHRoZSBpbnN0YW5jZXNcbiAgICAgICBjYXJkLiRzYXZlKCk7XG4gICAgICAgLy8gUE9TVDogL3VzZXIvMTIzL2NhcmQvNDU2IHtpZDo0NTYsIG51bWJlcjonMTIzNCcsIG5hbWU6J0ouIFNtaXRoJ31cbiAgICAgICAvLyBzZXJ2ZXIgcmV0dXJuczoge2lkOjQ1NiwgbnVtYmVyOicxMjM0JywgbmFtZTogJ0ouIFNtaXRoJ307XG5cbiAgICAgICAvLyBvdXIgY3VzdG9tIG1ldGhvZCBpcyBtYXBwZWQgYXMgd2VsbC5cbiAgICAgICBjYXJkLiRjaGFyZ2Uoe2Ftb3VudDo5Ljk5fSk7XG4gICAgICAgLy8gUE9TVDogL3VzZXIvMTIzL2NhcmQvNDU2P2Ftb3VudD05Ljk5JmNoYXJnZT10cnVlIHtpZDo0NTYsIG51bWJlcjonMTIzNCcsIG5hbWU6J0ouIFNtaXRoJ31cbiAgICAgfSk7XG5cbiAgICAgLy8gd2UgY2FuIGNyZWF0ZSBhbiBpbnN0YW5jZSBhcyB3ZWxsXG4gICAgIHZhciBuZXdDYXJkID0gbmV3IENyZWRpdENhcmQoe251bWJlcjonMDEyMyd9KTtcbiAgICAgbmV3Q2FyZC5uYW1lID0gXCJNaWtlIFNtaXRoXCI7XG4gICAgIG5ld0NhcmQuJHNhdmUoKTtcbiAgICAgLy8gUE9TVDogL3VzZXIvMTIzL2NhcmQge251bWJlcjonMDEyMycsIG5hbWU6J01pa2UgU21pdGgnfVxuICAgICAvLyBzZXJ2ZXIgcmV0dXJuczoge2lkOjc4OSwgbnVtYmVyOicwMTIzJywgbmFtZTogJ01pa2UgU21pdGgnfTtcbiAgICAgZXhwZWN0KG5ld0NhcmQuaWQpLnRvRXF1YWwoNzg5KTtcbiAqIGBgYFxuICpcbiAqIFRoZSBvYmplY3QgcmV0dXJuZWQgZnJvbSB0aGlzIGZ1bmN0aW9uIGV4ZWN1dGlvbiBpcyBhIHJlc291cmNlIFwiY2xhc3NcIiB3aGljaCBoYXMgXCJzdGF0aWNcIiBtZXRob2RcbiAqIGZvciBlYWNoIGFjdGlvbiBpbiB0aGUgZGVmaW5pdGlvbi5cbiAqXG4gKiBDYWxsaW5nIHRoZXNlIG1ldGhvZHMgaW52b2tlIGAkaHR0cGAgb24gdGhlIGB1cmxgIHRlbXBsYXRlIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgLCBgcGFyYW1zYCBhbmRcbiAqIGBoZWFkZXJzYC5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICMgVXNlciByZXNvdXJjZVxuICpcbiAqIFdoZW4gdGhlIGRhdGEgaXMgcmV0dXJuZWQgZnJvbSB0aGUgc2VydmVyIHRoZW4gdGhlIG9iamVjdCBpcyBhbiBpbnN0YW5jZSBvZiB0aGUgcmVzb3VyY2UgdHlwZSBhbmRcbiAqIGFsbCBvZiB0aGUgbm9uLUdFVCBtZXRob2RzIGFyZSBhdmFpbGFibGUgd2l0aCBgJGAgcHJlZml4LiBUaGlzIGFsbG93cyB5b3UgdG8gZWFzaWx5IHN1cHBvcnQgQ1JVRFxuICogb3BlcmF0aW9ucyAoY3JlYXRlLCByZWFkLCB1cGRhdGUsIGRlbGV0ZSkgb24gc2VydmVyLXNpZGUgZGF0YS5cblxuICAgYGBganNcbiAgICAgdmFyIFVzZXIgPSAkcmVzb3VyY2UoJy91c2VyLzp1c2VySWQnLCB7dXNlcklkOidAaWQnfSk7XG4gICAgIFVzZXIuZ2V0KHt1c2VySWQ6MTIzfSwgZnVuY3Rpb24odXNlcikge1xuICAgICAgIHVzZXIuYWJjID0gdHJ1ZTtcbiAgICAgICB1c2VyLiRzYXZlKCk7XG4gICAgIH0pO1xuICAgYGBgXG4gKlxuICogSXQncyB3b3J0aCBub3RpbmcgdGhhdCB0aGUgc3VjY2VzcyBjYWxsYmFjayBmb3IgYGdldGAsIGBxdWVyeWAgYW5kIG90aGVyIG1ldGhvZHMgZ2V0cyBwYXNzZWRcbiAqIGluIHRoZSByZXNwb25zZSB0aGF0IGNhbWUgZnJvbSB0aGUgc2VydmVyIGFzIHdlbGwgYXMgJGh0dHAgaGVhZGVyIGdldHRlciBmdW5jdGlvbiwgc28gb25lXG4gKiBjb3VsZCByZXdyaXRlIHRoZSBhYm92ZSBleGFtcGxlIGFuZCBnZXQgYWNjZXNzIHRvIGh0dHAgaGVhZGVycyBhczpcbiAqXG4gICBgYGBqc1xuICAgICB2YXIgVXNlciA9ICRyZXNvdXJjZSgnL3VzZXIvOnVzZXJJZCcsIHt1c2VySWQ6J0BpZCd9KTtcbiAgICAgVXNlci5nZXQoe3VzZXJJZDoxMjN9LCBmdW5jdGlvbih1c2VyLCBnZXRSZXNwb25zZUhlYWRlcnMpe1xuICAgICAgIHVzZXIuYWJjID0gdHJ1ZTtcbiAgICAgICB1c2VyLiRzYXZlKGZ1bmN0aW9uKHVzZXIsIHB1dFJlc3BvbnNlSGVhZGVycykge1xuICAgICAgICAgLy91c2VyID0+IHNhdmVkIHVzZXIgb2JqZWN0XG4gICAgICAgICAvL3B1dFJlc3BvbnNlSGVhZGVycyA9PiAkaHR0cCBoZWFkZXIgZ2V0dGVyXG4gICAgICAgfSk7XG4gICAgIH0pO1xuICAgYGBgXG4gKlxuICogWW91IGNhbiBhbHNvIGFjY2VzcyB0aGUgcmF3IGAkaHR0cGAgcHJvbWlzZSB2aWEgdGhlIGAkcHJvbWlzZWAgcHJvcGVydHkgb24gdGhlIG9iamVjdCByZXR1cm5lZFxuICpcbiAgIGBgYFxuICAgICB2YXIgVXNlciA9ICRyZXNvdXJjZSgnL3VzZXIvOnVzZXJJZCcsIHt1c2VySWQ6J0BpZCd9KTtcbiAgICAgVXNlci5nZXQoe3VzZXJJZDoxMjN9KVxuICAgICAgICAgLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAkc2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICB9KTtcbiAgIGBgYFxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogIyBDcmVhdGluZyBhIGN1c3RvbSAnUFVUJyByZXF1ZXN0XG4gKlxuICogSW4gdGhpcyBleGFtcGxlIHdlIGNyZWF0ZSBhIGN1c3RvbSBtZXRob2Qgb24gb3VyIHJlc291cmNlIHRvIG1ha2UgYSBQVVQgcmVxdWVzdFxuICogYGBganNcbiAqICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyduZ1Jlc291cmNlJywgJ25nUm91dGUnXSk7XG4gKlxuICogICAgLy8gU29tZSBBUElzIGV4cGVjdCBhIFBVVCByZXF1ZXN0IGluIHRoZSBmb3JtYXQgVVJML29iamVjdC9JRFxuICogICAgLy8gSGVyZSB3ZSBhcmUgY3JlYXRpbmcgYW4gJ3VwZGF0ZScgbWV0aG9kXG4gKiAgICBhcHAuZmFjdG9yeSgnTm90ZXMnLCBbJyRyZXNvdXJjZScsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICogICAgcmV0dXJuICRyZXNvdXJjZSgnL25vdGVzLzppZCcsIG51bGwsXG4gKiAgICAgICAge1xuICogICAgICAgICAgICAndXBkYXRlJzogeyBtZXRob2Q6J1BVVCcgfVxuICogICAgICAgIH0pO1xuICogICAgfV0pO1xuICpcbiAqICAgIC8vIEluIG91ciBjb250cm9sbGVyIHdlIGdldCB0aGUgSUQgZnJvbSB0aGUgVVJMIHVzaW5nIG5nUm91dGUgYW5kICRyb3V0ZVBhcmFtc1xuICogICAgLy8gV2UgcGFzcyBpbiAkcm91dGVQYXJhbXMgYW5kIG91ciBOb3RlcyBmYWN0b3J5IGFsb25nIHdpdGggJHNjb3BlXG4gKiAgICBhcHAuY29udHJvbGxlcignTm90ZXNDdHJsJywgWyckc2NvcGUnLCAnJHJvdXRlUGFyYW1zJywgJ05vdGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMsIE5vdGVzKSB7XG4gKiAgICAvLyBGaXJzdCBnZXQgYSBub3RlIG9iamVjdCBmcm9tIHRoZSBmYWN0b3J5XG4gKiAgICB2YXIgbm90ZSA9IE5vdGVzLmdldCh7IGlkOiRyb3V0ZVBhcmFtcy5pZCB9KTtcbiAqICAgICRpZCA9IG5vdGUuaWQ7XG4gKlxuICogICAgLy8gTm93IGNhbGwgdXBkYXRlIHBhc3NpbmcgaW4gdGhlIElEIGZpcnN0IHRoZW4gdGhlIG9iamVjdCB5b3UgYXJlIHVwZGF0aW5nXG4gKiAgICBOb3Rlcy51cGRhdGUoeyBpZDokaWQgfSwgbm90ZSk7XG4gKlxuICogICAgLy8gVGhpcyB3aWxsIFBVVCAvbm90ZXMvSUQgd2l0aCB0aGUgbm90ZSBvYmplY3QgaW4gdGhlIHJlcXVlc3QgcGF5bG9hZFxuICogICAgfV0pO1xuICogYGBgXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAjIENhbmNlbGxpbmcgcmVxdWVzdHNcbiAqXG4gKiBJZiBhbiBhY3Rpb24ncyBjb25maWd1cmF0aW9uIHNwZWNpZmllcyB0aGF0IGl0IGlzIGNhbmNlbGxhYmxlLCB5b3UgY2FuIGNhbmNlbCB0aGUgcmVxdWVzdCByZWxhdGVkXG4gKiB0byBhbiBpbnN0YW5jZSBvciBjb2xsZWN0aW9uIChhcyBsb25nIGFzIGl0IGlzIGEgcmVzdWx0IG9mIGEgXCJub24taW5zdGFuY2VcIiBjYWxsKTpcbiAqXG4gICBgYGBqc1xuICAgICAvLyAuLi5kZWZpbmluZyB0aGUgYEhvdGVsYCByZXNvdXJjZS4uLlxuICAgICB2YXIgSG90ZWwgPSAkcmVzb3VyY2UoJy9hcGkvaG90ZWwvOmlkJywge2lkOiAnQGlkJ30sIHtcbiAgICAgICAvLyBMZXQncyBtYWtlIHRoZSBgcXVlcnkoKWAgbWV0aG9kIGNhbmNlbGxhYmxlXG4gICAgICAgcXVlcnk6IHttZXRob2Q6ICdnZXQnLCBpc0FycmF5OiB0cnVlLCBjYW5jZWxsYWJsZTogdHJ1ZX1cbiAgICAgfSk7XG5cbiAgICAgLy8gLi4uc29tZXdoZXJlIGluIHRoZSBQbGFuVmFjYXRpb25Db250cm9sbGVyLi4uXG4gICAgIC4uLlxuICAgICB0aGlzLm9uRGVzdGluYXRpb25DaGFuZ2VkID0gZnVuY3Rpb24gb25EZXN0aW5hdGlvbkNoYW5nZWQoZGVzdGluYXRpb24pIHtcbiAgICAgICAvLyBXZSBkb24ndCBjYXJlIGFib3V0IGFueSBwZW5kaW5nIHJlcXVlc3QgZm9yIGhvdGVsc1xuICAgICAgIC8vIGluIGEgZGlmZmVyZW50IGRlc3RpbmF0aW9uIGFueSBtb3JlXG4gICAgICAgdGhpcy5hdmFpbGFibGVIb3RlbHMuJGNhbmNlbFJlcXVlc3QoKTtcblxuICAgICAgIC8vIExldCdzIHF1ZXJ5IGZvciBob3RlbHMgaW4gJzxkZXN0aW5hdGlvbj4nXG4gICAgICAgLy8gKGNhbGxzOiAvYXBpL2hvdGVsP2xvY2F0aW9uPTxkZXN0aW5hdGlvbj4pXG4gICAgICAgdGhpcy5hdmFpbGFibGVIb3RlbHMgPSBIb3RlbC5xdWVyeSh7bG9jYXRpb246IGRlc3RpbmF0aW9ufSk7XG4gICAgIH07XG4gICBgYGBcbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCduZ1Jlc291cmNlJywgWyduZyddKS5cbiAgcHJvdmlkZXIoJyRyZXNvdXJjZScsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBQUk9UT0NPTF9BTkRfRE9NQUlOX1JFR0VYID0gL15odHRwcz86XFwvXFwvW15cXC9dKi87XG4gICAgdmFyIHByb3ZpZGVyID0gdGhpcztcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBwcm9wZXJ0eVxuICAgICAqIEBuYW1lICRyZXNvdXJjZVByb3ZpZGVyI2RlZmF1bHRzXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogT2JqZWN0IGNvbnRhaW5pbmcgZGVmYXVsdCBvcHRpb25zIHVzZWQgd2hlbiBjcmVhdGluZyBgJHJlc291cmNlYCBpbnN0YW5jZXMuXG4gICAgICpcbiAgICAgKiBUaGUgZGVmYXVsdCB2YWx1ZXMgc2F0aXNmeSBhIHdpZGUgcmFuZ2Ugb2YgdXNlY2FzZXMsIGJ1dCB5b3UgbWF5IGNob29zZSB0byBvdmVyd3JpdGUgYW55IG9mXG4gICAgICogdGhlbSB0byBmdXJ0aGVyIGN1c3RvbWl6ZSB5b3VyIGluc3RhbmNlcy4gVGhlIGF2YWlsYWJsZSBwcm9wZXJ0aWVzIGFyZTpcbiAgICAgKlxuICAgICAqIC0gKipzdHJpcFRyYWlsaW5nU2xhc2hlcyoqIOKAkyBge2Jvb2xlYW59YCDigJMgSWYgdHJ1ZSwgdGhlbiB0aGUgdHJhaWxpbmcgc2xhc2hlcyBmcm9tIGFueVxuICAgICAqICAgY2FsY3VsYXRlZCBVUkwgd2lsbCBiZSBzdHJpcHBlZC48YnIgLz5cbiAgICAgKiAgIChEZWZhdWx0cyB0byB0cnVlLilcbiAgICAgKiAtICoqY2FuY2VsbGFibGUqKiDigJMgYHtib29sZWFufWAg4oCTIElmIHRydWUsIHRoZSByZXF1ZXN0IG1hZGUgYnkgYSBcIm5vbi1pbnN0YW5jZVwiIGNhbGwgd2lsbCBiZVxuICAgICAqICAgY2FuY2VsbGVkIChpZiBub3QgYWxyZWFkeSBjb21wbGV0ZWQpIGJ5IGNhbGxpbmcgYCRjYW5jZWxSZXF1ZXN0KClgIG9uIHRoZSBjYWxsJ3MgcmV0dXJuXG4gICAgICogICB2YWx1ZS4gRm9yIG1vcmUgZGV0YWlscywgc2VlIHtAbGluayBuZ1Jlc291cmNlLiRyZXNvdXJjZX0uIFRoaXMgY2FuIGJlIG92ZXJ3cml0dGVuIHBlclxuICAgICAqICAgcmVzb3VyY2UgY2xhc3Mgb3IgYWN0aW9uLjxiciAvPlxuICAgICAqICAgKERlZmF1bHRzIHRvIGZhbHNlLilcbiAgICAgKiAtICoqYWN0aW9ucyoqIC0gYHtPYmplY3QuPE9iamVjdD59YCAtIEEgaGFzaCB3aXRoIGRlZmF1bHQgYWN0aW9ucyBkZWNsYXJhdGlvbnMuIEFjdGlvbnMgYXJlXG4gICAgICogICBoaWdoLWxldmVsIG1ldGhvZHMgY29ycmVzcG9uZGluZyB0byBSRVNUZnVsIGFjdGlvbnMvbWV0aG9kcyBvbiByZXNvdXJjZXMuIEFuIGFjdGlvbiBtYXlcbiAgICAgKiAgIHNwZWNpZnkgd2hhdCBIVFRQIG1ldGhvZCB0byB1c2UsIHdoYXQgVVJMIHRvIGhpdCwgaWYgdGhlIHJldHVybiB2YWx1ZSB3aWxsIGJlIGEgc2luZ2xlXG4gICAgICogICBvYmplY3Qgb3IgYSBjb2xsZWN0aW9uIChhcnJheSkgb2Ygb2JqZWN0cyBldGMuIEZvciBtb3JlIGRldGFpbHMsIHNlZVxuICAgICAqICAge0BsaW5rIG5nUmVzb3VyY2UuJHJlc291cmNlfS4gVGhlIGFjdGlvbnMgY2FuIGFsc28gYmUgZW5oYW5jZWQgb3Igb3ZlcndyaXR0ZW4gcGVyIHJlc291cmNlXG4gICAgICogICBjbGFzcy48YnIgLz5cbiAgICAgKiAgIFRoZSBkZWZhdWx0IGFjdGlvbnMgYXJlOlxuICAgICAqICAgYGBganNcbiAgICAgKiAgIHtcbiAgICAgKiAgICAgZ2V0OiB7bWV0aG9kOiAnR0VUJ30sXG4gICAgICogICAgIHNhdmU6IHttZXRob2Q6ICdQT1NUJ30sXG4gICAgICogICAgIHF1ZXJ5OiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXG4gICAgICogICAgIHJlbW92ZToge21ldGhvZDogJ0RFTEVURSd9LFxuICAgICAqICAgICBkZWxldGU6IHttZXRob2Q6ICdERUxFVEUnfVxuICAgICAqICAgfVxuICAgICAqICAgYGBgXG4gICAgICpcbiAgICAgKiAjIyMjIEV4YW1wbGVcbiAgICAgKlxuICAgICAqIEZvciBleGFtcGxlLCB5b3UgY2FuIHNwZWNpZnkgYSBuZXcgYHVwZGF0ZWAgYWN0aW9uIHRoYXQgdXNlcyB0aGUgYFBVVGAgSFRUUCB2ZXJiOlxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiAgIGFuZ3VsYXIuXG4gICAgICogICAgIG1vZHVsZSgnbXlBcHAnKS5cbiAgICAgKiAgICAgY29uZmlnKFsncmVzb3VyY2VQcm92aWRlcicsIGZ1bmN0aW9uICgkcmVzb3VyY2VQcm92aWRlcikge1xuICAgICAqICAgICAgICRyZXNvdXJjZVByb3ZpZGVyLmRlZmF1bHRzLmFjdGlvbnMudXBkYXRlID0ge1xuICAgICAqICAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAqICAgICAgIH07XG4gICAgICogICAgIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogT3IgeW91IGNhbiBldmVuIG92ZXJ3cml0ZSB0aGUgd2hvbGUgYGFjdGlvbnNgIGxpc3QgYW5kIHNwZWNpZnkgeW91ciBvd246XG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqICAgYW5ndWxhci5cbiAgICAgKiAgICAgbW9kdWxlKCdteUFwcCcpLlxuICAgICAqICAgICBjb25maWcoWydyZXNvdXJjZVByb3ZpZGVyJywgZnVuY3Rpb24gKCRyZXNvdXJjZVByb3ZpZGVyKSB7XG4gICAgICogICAgICAgJHJlc291cmNlUHJvdmlkZXIuZGVmYXVsdHMuYWN0aW9ucyA9IHtcbiAgICAgKiAgICAgICAgIGNyZWF0ZToge21ldGhvZDogJ1BPU1QnfVxuICAgICAqICAgICAgICAgZ2V0OiAgICB7bWV0aG9kOiAnR0VUJ30sXG4gICAgICogICAgICAgICBnZXRBbGw6IHttZXRob2Q6ICdHRVQnLCBpc0FycmF5OnRydWV9LFxuICAgICAqICAgICAgICAgdXBkYXRlOiB7bWV0aG9kOiAnUFVUJ30sXG4gICAgICogICAgICAgICBkZWxldGU6IHttZXRob2Q6ICdERUxFVEUnfVxuICAgICAqICAgICAgIH07XG4gICAgICogICAgIH0pO1xuICAgICAqIGBgYFxuICAgICAqXG4gICAgICovXG4gICAgdGhpcy5kZWZhdWx0cyA9IHtcbiAgICAgIC8vIFN0cmlwIHNsYXNoZXMgYnkgZGVmYXVsdFxuICAgICAgc3RyaXBUcmFpbGluZ1NsYXNoZXM6IHRydWUsXG5cbiAgICAgIC8vIE1ha2Ugbm9uLWluc3RhbmNlIHJlcXVlc3RzIGNhbmNlbGxhYmxlICh2aWEgYCRjYW5jZWxSZXF1ZXN0KClgKVxuICAgICAgY2FuY2VsbGFibGU6IGZhbHNlLFxuXG4gICAgICAvLyBEZWZhdWx0IGFjdGlvbnMgY29uZmlndXJhdGlvblxuICAgICAgYWN0aW9uczoge1xuICAgICAgICAnZ2V0Jzoge21ldGhvZDogJ0dFVCd9LFxuICAgICAgICAnc2F2ZSc6IHttZXRob2Q6ICdQT1NUJ30sXG4gICAgICAgICdxdWVyeSc6IHttZXRob2Q6ICdHRVQnLCBpc0FycmF5OiB0cnVlfSxcbiAgICAgICAgJ3JlbW92ZSc6IHttZXRob2Q6ICdERUxFVEUnfSxcbiAgICAgICAgJ2RlbGV0ZSc6IHttZXRob2Q6ICdERUxFVEUnfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLiRnZXQgPSBbJyRodHRwJywgJyRsb2cnLCAnJHEnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbigkaHR0cCwgJGxvZywgJHEsICR0aW1lb3V0KSB7XG5cbiAgICAgIHZhciBub29wID0gYW5ndWxhci5ub29wLFxuICAgICAgICBmb3JFYWNoID0gYW5ndWxhci5mb3JFYWNoLFxuICAgICAgICBleHRlbmQgPSBhbmd1bGFyLmV4dGVuZCxcbiAgICAgICAgY29weSA9IGFuZ3VsYXIuY29weSxcbiAgICAgICAgaXNGdW5jdGlvbiA9IGFuZ3VsYXIuaXNGdW5jdGlvbjtcblxuICAgICAgLyoqXG4gICAgICAgKiBXZSBuZWVkIG91ciBjdXN0b20gbWV0aG9kIGJlY2F1c2UgZW5jb2RlVVJJQ29tcG9uZW50IGlzIHRvbyBhZ2dyZXNzaXZlIGFuZCBkb2Vzbid0IGZvbGxvd1xuICAgICAgICogaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzk4Ni50eHQgd2l0aCByZWdhcmRzIHRvIHRoZSBjaGFyYWN0ZXIgc2V0XG4gICAgICAgKiAocGNoYXIpIGFsbG93ZWQgaW4gcGF0aCBzZWdtZW50czpcbiAgICAgICAqICAgIHNlZ21lbnQgICAgICAgPSAqcGNoYXJcbiAgICAgICAqICAgIHBjaGFyICAgICAgICAgPSB1bnJlc2VydmVkIC8gcGN0LWVuY29kZWQgLyBzdWItZGVsaW1zIC8gXCI6XCIgLyBcIkBcIlxuICAgICAgICogICAgcGN0LWVuY29kZWQgICA9IFwiJVwiIEhFWERJRyBIRVhESUdcbiAgICAgICAqICAgIHVucmVzZXJ2ZWQgICAgPSBBTFBIQSAvIERJR0lUIC8gXCItXCIgLyBcIi5cIiAvIFwiX1wiIC8gXCJ+XCJcbiAgICAgICAqICAgIHN1Yi1kZWxpbXMgICAgPSBcIiFcIiAvIFwiJFwiIC8gXCImXCIgLyBcIidcIiAvIFwiKFwiIC8gXCIpXCJcbiAgICAgICAqICAgICAgICAgICAgICAgICAgICAgLyBcIipcIiAvIFwiK1wiIC8gXCIsXCIgLyBcIjtcIiAvIFwiPVwiXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGVuY29kZVVyaVNlZ21lbnQodmFsKSB7XG4gICAgICAgIHJldHVybiBlbmNvZGVVcmlRdWVyeSh2YWwsIHRydWUpLlxuICAgICAgICAgIHJlcGxhY2UoLyUyNi9naSwgJyYnKS5cbiAgICAgICAgICByZXBsYWNlKC8lM0QvZ2ksICc9JykuXG4gICAgICAgICAgcmVwbGFjZSgvJTJCL2dpLCAnKycpO1xuICAgICAgfVxuXG5cbiAgICAgIC8qKlxuICAgICAgICogVGhpcyBtZXRob2QgaXMgaW50ZW5kZWQgZm9yIGVuY29kaW5nICprZXkqIG9yICp2YWx1ZSogcGFydHMgb2YgcXVlcnkgY29tcG9uZW50LiBXZSBuZWVkIGFcbiAgICAgICAqIGN1c3RvbSBtZXRob2QgYmVjYXVzZSBlbmNvZGVVUklDb21wb25lbnQgaXMgdG9vIGFnZ3Jlc3NpdmUgYW5kIGVuY29kZXMgc3R1ZmYgdGhhdCBkb2Vzbid0XG4gICAgICAgKiBoYXZlIHRvIGJlIGVuY29kZWQgcGVyIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODY6XG4gICAgICAgKiAgICBxdWVyeSAgICAgICA9ICooIHBjaGFyIC8gXCIvXCIgLyBcIj9cIiApXG4gICAgICAgKiAgICBwY2hhciAgICAgICAgID0gdW5yZXNlcnZlZCAvIHBjdC1lbmNvZGVkIC8gc3ViLWRlbGltcyAvIFwiOlwiIC8gXCJAXCJcbiAgICAgICAqICAgIHVucmVzZXJ2ZWQgICAgPSBBTFBIQSAvIERJR0lUIC8gXCItXCIgLyBcIi5cIiAvIFwiX1wiIC8gXCJ+XCJcbiAgICAgICAqICAgIHBjdC1lbmNvZGVkICAgPSBcIiVcIiBIRVhESUcgSEVYRElHXG4gICAgICAgKiAgICBzdWItZGVsaW1zICAgID0gXCIhXCIgLyBcIiRcIiAvIFwiJlwiIC8gXCInXCIgLyBcIihcIiAvIFwiKVwiXG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgIC8gXCIqXCIgLyBcIitcIiAvIFwiLFwiIC8gXCI7XCIgLyBcIj1cIlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBlbmNvZGVVcmlRdWVyeSh2YWwsIHBjdEVuY29kZVNwYWNlcykge1xuICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHZhbCkuXG4gICAgICAgICAgcmVwbGFjZSgvJTQwL2dpLCAnQCcpLlxuICAgICAgICAgIHJlcGxhY2UoLyUzQS9naSwgJzonKS5cbiAgICAgICAgICByZXBsYWNlKC8lMjQvZywgJyQnKS5cbiAgICAgICAgICByZXBsYWNlKC8lMkMvZ2ksICcsJykuXG4gICAgICAgICAgcmVwbGFjZSgvJTIwL2csIChwY3RFbmNvZGVTcGFjZXMgPyAnJTIwJyA6ICcrJykpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBSb3V0ZSh0ZW1wbGF0ZSwgZGVmYXVsdHMpIHtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICB0aGlzLmRlZmF1bHRzID0gZXh0ZW5kKHt9LCBwcm92aWRlci5kZWZhdWx0cywgZGVmYXVsdHMpO1xuICAgICAgICB0aGlzLnVybFBhcmFtcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICBSb3V0ZS5wcm90b3R5cGUgPSB7XG4gICAgICAgIHNldFVybFBhcmFtczogZnVuY3Rpb24oY29uZmlnLCBwYXJhbXMsIGFjdGlvblVybCkge1xuICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgICAgIHVybCA9IGFjdGlvblVybCB8fCBzZWxmLnRlbXBsYXRlLFxuICAgICAgICAgICAgdmFsLFxuICAgICAgICAgICAgZW5jb2RlZFZhbCxcbiAgICAgICAgICAgIHByb3RvY29sQW5kRG9tYWluID0gJyc7XG5cbiAgICAgICAgICB2YXIgdXJsUGFyYW1zID0gc2VsZi51cmxQYXJhbXMgPSB7fTtcbiAgICAgICAgICBmb3JFYWNoKHVybC5zcGxpdCgvXFxXLyksIGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICAgICAgICBpZiAocGFyYW0gPT09ICdoYXNPd25Qcm9wZXJ0eScpIHtcbiAgICAgICAgICAgICAgdGhyb3cgJHJlc291cmNlTWluRXJyKCdiYWRuYW1lJywgXCJoYXNPd25Qcm9wZXJ0eSBpcyBub3QgYSB2YWxpZCBwYXJhbWV0ZXIgbmFtZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIShuZXcgUmVnRXhwKFwiXlxcXFxkKyRcIikudGVzdChwYXJhbSkpICYmIHBhcmFtICYmXG4gICAgICAgICAgICAgIChuZXcgUmVnRXhwKFwiKF58W15cXFxcXFxcXF0pOlwiICsgcGFyYW0gKyBcIihcXFxcV3wkKVwiKS50ZXN0KHVybCkpKSB7XG4gICAgICAgICAgICAgIHVybFBhcmFtc1twYXJhbV0gPSB7XG4gICAgICAgICAgICAgICAgaXNRdWVyeVBhcmFtVmFsdWU6IChuZXcgUmVnRXhwKFwiXFxcXD8uKj06XCIgKyBwYXJhbSArIFwiKD86XFxcXFd8JClcIikpLnRlc3QodXJsKVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKC9cXFxcOi9nLCAnOicpO1xuICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKFBST1RPQ09MX0FORF9ET01BSU5fUkVHRVgsIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgICAgICBwcm90b2NvbEFuZERvbWFpbiA9IG1hdGNoO1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcGFyYW1zID0gcGFyYW1zIHx8IHt9O1xuICAgICAgICAgIGZvckVhY2goc2VsZi51cmxQYXJhbXMsIGZ1bmN0aW9uKHBhcmFtSW5mbywgdXJsUGFyYW0pIHtcbiAgICAgICAgICAgIHZhbCA9IHBhcmFtcy5oYXNPd25Qcm9wZXJ0eSh1cmxQYXJhbSkgPyBwYXJhbXNbdXJsUGFyYW1dIDogc2VsZi5kZWZhdWx0c1t1cmxQYXJhbV07XG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodmFsKSAmJiB2YWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgaWYgKHBhcmFtSW5mby5pc1F1ZXJ5UGFyYW1WYWx1ZSkge1xuICAgICAgICAgICAgICAgIGVuY29kZWRWYWwgPSBlbmNvZGVVcmlRdWVyeSh2YWwsIHRydWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVuY29kZWRWYWwgPSBlbmNvZGVVcmlTZWdtZW50KHZhbCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UobmV3IFJlZ0V4cChcIjpcIiArIHVybFBhcmFtICsgXCIoXFxcXFd8JClcIiwgXCJnXCIpLCBmdW5jdGlvbihtYXRjaCwgcDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlZFZhbCArIHAxO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoXFwvPyk6XCIgKyB1cmxQYXJhbSArIFwiKFxcXFxXfCQpXCIsIFwiZ1wiKSwgZnVuY3Rpb24obWF0Y2gsXG4gICAgICAgICAgICAgICAgICBsZWFkaW5nU2xhc2hlcywgdGFpbCkge1xuICAgICAgICAgICAgICAgIGlmICh0YWlsLmNoYXJBdCgwKSA9PSAnLycpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0YWlsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gbGVhZGluZ1NsYXNoZXMgKyB0YWlsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBzdHJpcCB0cmFpbGluZyBzbGFzaGVzIGFuZCBzZXQgdGhlIHVybCAodW5sZXNzIHRoaXMgYmVoYXZpb3IgaXMgc3BlY2lmaWNhbGx5IGRpc2FibGVkKVxuICAgICAgICAgIGlmIChzZWxmLmRlZmF1bHRzLnN0cmlwVHJhaWxpbmdTbGFzaGVzKSB7XG4gICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgvXFwvKyQvLCAnJykgfHwgJy8nO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHRoZW4gcmVwbGFjZSBjb2xsYXBzZSBgLy5gIGlmIGZvdW5kIGluIHRoZSBsYXN0IFVSTCBwYXRoIHNlZ21lbnQgYmVmb3JlIHRoZSBxdWVyeVxuICAgICAgICAgIC8vIEUuZy4gYGh0dHA6Ly91cmwuY29tL2lkLi9mb3JtYXQ/cT14YCBiZWNvbWVzIGBodHRwOi8vdXJsLmNvbS9pZC5mb3JtYXQ/cT14YFxuICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKC9cXC9cXC4oPz1cXHcrKCR8XFw/KSkvLCAnLicpO1xuICAgICAgICAgIC8vIHJlcGxhY2UgZXNjYXBlZCBgL1xcLmAgd2l0aCBgLy5gXG4gICAgICAgICAgY29uZmlnLnVybCA9IHByb3RvY29sQW5kRG9tYWluICsgdXJsLnJlcGxhY2UoL1xcL1xcXFxcXC4vLCAnLy4nKTtcblxuXG4gICAgICAgICAgLy8gc2V0IHBhcmFtcyAtIGRlbGVnYXRlIHBhcmFtIGVuY29kaW5nIHRvICRodHRwXG4gICAgICAgICAgZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGlmICghc2VsZi51cmxQYXJhbXNba2V5XSkge1xuICAgICAgICAgICAgICBjb25maWcucGFyYW1zID0gY29uZmlnLnBhcmFtcyB8fCB7fTtcbiAgICAgICAgICAgICAgY29uZmlnLnBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cblxuICAgICAgZnVuY3Rpb24gcmVzb3VyY2VGYWN0b3J5KHVybCwgcGFyYW1EZWZhdWx0cywgYWN0aW9ucywgb3B0aW9ucykge1xuICAgICAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUodXJsLCBvcHRpb25zKTtcblxuICAgICAgICBhY3Rpb25zID0gZXh0ZW5kKHt9LCBwcm92aWRlci5kZWZhdWx0cy5hY3Rpb25zLCBhY3Rpb25zKTtcblxuICAgICAgICBmdW5jdGlvbiBleHRyYWN0UGFyYW1zKGRhdGEsIGFjdGlvblBhcmFtcykge1xuICAgICAgICAgIHZhciBpZHMgPSB7fTtcbiAgICAgICAgICBhY3Rpb25QYXJhbXMgPSBleHRlbmQoe30sIHBhcmFtRGVmYXVsdHMsIGFjdGlvblBhcmFtcyk7XG4gICAgICAgICAgZm9yRWFjaChhY3Rpb25QYXJhbXMsIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkgeyB2YWx1ZSA9IHZhbHVlKGRhdGEpOyB9XG4gICAgICAgICAgICBpZHNba2V5XSA9IHZhbHVlICYmIHZhbHVlLmNoYXJBdCAmJiB2YWx1ZS5jaGFyQXQoMCkgPT0gJ0AnID9cbiAgICAgICAgICAgICAgbG9va3VwRG90dGVkUGF0aChkYXRhLCB2YWx1ZS5zdWJzdHIoMSkpIDogdmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGlkcztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGRlZmF1bHRSZXNwb25zZUludGVyY2VwdG9yKHJlc3BvbnNlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlc291cmNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gUmVzb3VyY2UodmFsdWUpIHtcbiAgICAgICAgICBzaGFsbG93Q2xlYXJBbmRDb3B5KHZhbHVlIHx8IHt9LCB0aGlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIFJlc291cmNlLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IGV4dGVuZCh7fSwgdGhpcyk7XG4gICAgICAgICAgZGVsZXRlIGRhdGEuJHByb21pc2U7XG4gICAgICAgICAgZGVsZXRlIGRhdGEuJHJlc29sdmVkO1xuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZvckVhY2goYWN0aW9ucywgZnVuY3Rpb24oYWN0aW9uLCBuYW1lKSB7XG4gICAgICAgICAgdmFyIGhhc0JvZHkgPSAvXihQT1NUfFBVVHxQQVRDSCkkL2kudGVzdChhY3Rpb24ubWV0aG9kKTtcbiAgICAgICAgICB2YXIgbnVtZXJpY1RpbWVvdXQgPSBhY3Rpb24udGltZW91dDtcbiAgICAgICAgICB2YXIgY2FuY2VsbGFibGUgPSBhbmd1bGFyLmlzRGVmaW5lZChhY3Rpb24uY2FuY2VsbGFibGUpID8gYWN0aW9uLmNhbmNlbGxhYmxlIDpcbiAgICAgICAgICAgICAgKG9wdGlvbnMgJiYgYW5ndWxhci5pc0RlZmluZWQob3B0aW9ucy5jYW5jZWxsYWJsZSkpID8gb3B0aW9ucy5jYW5jZWxsYWJsZSA6XG4gICAgICAgICAgICAgIHByb3ZpZGVyLmRlZmF1bHRzLmNhbmNlbGxhYmxlO1xuXG4gICAgICAgICAgaWYgKG51bWVyaWNUaW1lb3V0ICYmICFhbmd1bGFyLmlzTnVtYmVyKG51bWVyaWNUaW1lb3V0KSkge1xuICAgICAgICAgICAgJGxvZy5kZWJ1ZygnbmdSZXNvdXJjZTpcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyAgT25seSBudW1lcmljIHZhbHVlcyBhcmUgYWxsb3dlZCBhcyBgdGltZW91dGAuXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICcgIFByb21pc2VzIGFyZSBub3Qgc3VwcG9ydGVkIGluICRyZXNvdXJjZSwgYmVjYXVzZSB0aGUgc2FtZSB2YWx1ZSB3b3VsZCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgJ2JlIHVzZWQgZm9yIG11bHRpcGxlIHJlcXVlc3RzLiBJZiB5b3UgYXJlIGxvb2tpbmcgZm9yIGEgd2F5IHRvIGNhbmNlbCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgJ3JlcXVlc3RzLCB5b3Ugc2hvdWxkIHVzZSB0aGUgYGNhbmNlbGxhYmxlYCBvcHRpb24uJyk7XG4gICAgICAgICAgICBkZWxldGUgYWN0aW9uLnRpbWVvdXQ7XG4gICAgICAgICAgICBudW1lcmljVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgUmVzb3VyY2VbbmFtZV0gPSBmdW5jdGlvbihhMSwgYTIsIGEzLCBhNCkge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHt9LCBkYXRhLCBzdWNjZXNzLCBlcnJvcjtcblxuICAgICAgICAgICAgLyoganNoaW50IC1XMDg2ICovIC8qIChwdXJwb3NlZnVsbHkgZmFsbCB0aHJvdWdoIGNhc2Ugc3RhdGVtZW50cykgKi9cbiAgICAgICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBhNDtcbiAgICAgICAgICAgICAgICBzdWNjZXNzID0gYTM7XG4gICAgICAgICAgICAgIC8vZmFsbHRocm91Z2hcbiAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oYTIpKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihhMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IGExO1xuICAgICAgICAgICAgICAgICAgICBlcnJvciA9IGEyO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IGEyO1xuICAgICAgICAgICAgICAgICAgZXJyb3IgPSBhMztcbiAgICAgICAgICAgICAgICAgIC8vZmFsbHRocm91Z2hcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcGFyYW1zID0gYTE7XG4gICAgICAgICAgICAgICAgICBkYXRhID0gYTI7XG4gICAgICAgICAgICAgICAgICBzdWNjZXNzID0gYTM7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihhMSkpIHN1Y2Nlc3MgPSBhMTtcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChoYXNCb2R5KSBkYXRhID0gYTE7XG4gICAgICAgICAgICAgICAgZWxzZSBwYXJhbXMgPSBhMTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAwOiBicmVhaztcbiAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aHJvdyAkcmVzb3VyY2VNaW5FcnIoJ2JhZGFyZ3MnLFxuICAgICAgICAgICAgICAgICAgXCJFeHBlY3RlZCB1cCB0byA0IGFyZ3VtZW50cyBbcGFyYW1zLCBkYXRhLCBzdWNjZXNzLCBlcnJvcl0sIGdvdCB7MH0gYXJndW1lbnRzXCIsXG4gICAgICAgICAgICAgICAgICBhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGpzaGludCArVzA4NiAqLyAvKiAocHVycG9zZWZ1bGx5IGZhbGwgdGhyb3VnaCBjYXNlIHN0YXRlbWVudHMpICovXG5cbiAgICAgICAgICAgIHZhciBpc0luc3RhbmNlQ2FsbCA9IHRoaXMgaW5zdGFuY2VvZiBSZXNvdXJjZTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGlzSW5zdGFuY2VDYWxsID8gZGF0YSA6IChhY3Rpb24uaXNBcnJheSA/IFtdIDogbmV3IFJlc291cmNlKGRhdGEpKTtcbiAgICAgICAgICAgIHZhciBodHRwQ29uZmlnID0ge307XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2VJbnRlcmNlcHRvciA9IGFjdGlvbi5pbnRlcmNlcHRvciAmJiBhY3Rpb24uaW50ZXJjZXB0b3IucmVzcG9uc2UgfHxcbiAgICAgICAgICAgICAgZGVmYXVsdFJlc3BvbnNlSW50ZXJjZXB0b3I7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2VFcnJvckludGVyY2VwdG9yID0gYWN0aW9uLmludGVyY2VwdG9yICYmIGFjdGlvbi5pbnRlcmNlcHRvci5yZXNwb25zZUVycm9yIHx8XG4gICAgICAgICAgICAgIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIHZhciB0aW1lb3V0RGVmZXJyZWQ7XG4gICAgICAgICAgICB2YXIgbnVtZXJpY1RpbWVvdXRQcm9taXNlO1xuXG4gICAgICAgICAgICBmb3JFYWNoKGFjdGlvbiwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICBodHRwQ29uZmlnW2tleV0gPSBjb3B5KHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3BhcmFtcyc6XG4gICAgICAgICAgICAgICAgY2FzZSAnaXNBcnJheSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnaW50ZXJjZXB0b3InOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2NhbmNlbGxhYmxlJzpcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKCFpc0luc3RhbmNlQ2FsbCAmJiBjYW5jZWxsYWJsZSkge1xuICAgICAgICAgICAgICB0aW1lb3V0RGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgICBodHRwQ29uZmlnLnRpbWVvdXQgPSB0aW1lb3V0RGVmZXJyZWQucHJvbWlzZTtcblxuICAgICAgICAgICAgICBpZiAobnVtZXJpY1RpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICBudW1lcmljVGltZW91dFByb21pc2UgPSAkdGltZW91dCh0aW1lb3V0RGVmZXJyZWQucmVzb2x2ZSwgbnVtZXJpY1RpbWVvdXQpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoYXNCb2R5KSBodHRwQ29uZmlnLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgcm91dGUuc2V0VXJsUGFyYW1zKGh0dHBDb25maWcsXG4gICAgICAgICAgICAgIGV4dGVuZCh7fSwgZXh0cmFjdFBhcmFtcyhkYXRhLCBhY3Rpb24ucGFyYW1zIHx8IHt9KSwgcGFyYW1zKSxcbiAgICAgICAgICAgICAgYWN0aW9uLnVybCk7XG5cbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gJGh0dHAoaHR0cENvbmZpZykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG5cbiAgICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNvbnZlcnQgYWN0aW9uLmlzQXJyYXkgdG8gYm9vbGVhbiBpbiBjYXNlIGl0IGlzIHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIC8vIGpzaGludCAtVzAxOFxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoZGF0YSkgIT09ICghIWFjdGlvbi5pc0FycmF5KSkge1xuICAgICAgICAgICAgICAgICAgdGhyb3cgJHJlc291cmNlTWluRXJyKCdiYWRjZmcnLFxuICAgICAgICAgICAgICAgICAgICAgICdFcnJvciBpbiByZXNvdXJjZSBjb25maWd1cmF0aW9uIGZvciBhY3Rpb24gYHswfWAuIEV4cGVjdGVkIHJlc3BvbnNlIHRvICcgK1xuICAgICAgICAgICAgICAgICAgICAgICdjb250YWluIGFuIHsxfSBidXQgZ290IGFuIHsyfSAoUmVxdWVzdDogezN9IHs0fSknLCBuYW1lLCBhY3Rpb24uaXNBcnJheSA/ICdhcnJheScgOiAnb2JqZWN0JyxcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5pc0FycmF5KGRhdGEpID8gJ2FycmF5JyA6ICdvYmplY3QnLCBodHRwQ29uZmlnLm1ldGhvZCwgaHR0cENvbmZpZy51cmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBqc2hpbnQgK1cwMThcbiAgICAgICAgICAgICAgICBpZiAoYWN0aW9uLmlzQXJyYXkpIHtcbiAgICAgICAgICAgICAgICAgIHZhbHVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgICBmb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpdGVtID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUucHVzaChuZXcgUmVzb3VyY2UoaXRlbSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIFZhbGlkIEpTT04gdmFsdWVzIG1heSBiZSBzdHJpbmcgbGl0ZXJhbHMsIGFuZCB0aGVzZSBzaG91bGQgbm90IGJlIGNvbnZlcnRlZFxuICAgICAgICAgICAgICAgICAgICAgIC8vIGludG8gb2JqZWN0cy4gVGhlc2UgaXRlbXMgd2lsbCBub3QgaGF2ZSBhY2Nlc3MgdG8gdGhlIFJlc291cmNlIHByb3RvdHlwZVxuICAgICAgICAgICAgICAgICAgICAgIC8vIG1ldGhvZHMsIGJ1dCB1bmZvcnR1bmF0ZWx5IHRoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgdmFsdWUucHVzaChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHZhciBwcm9taXNlID0gdmFsdWUuJHByb21pc2U7ICAgICAvLyBTYXZlIHRoZSBwcm9taXNlXG4gICAgICAgICAgICAgICAgICBzaGFsbG93Q2xlYXJBbmRDb3B5KGRhdGEsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgIHZhbHVlLiRwcm9taXNlID0gcHJvbWlzZTsgICAgICAgICAvLyBSZXN0b3JlIHRoZSBwcm9taXNlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc3BvbnNlLnJlc291cmNlID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgKGVycm9yIHx8IG5vb3ApKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcHJvbWlzZVsnZmluYWxseSddKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YWx1ZS4kcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBpZiAoIWlzSW5zdGFuY2VDYWxsICYmIGNhbmNlbGxhYmxlKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUuJGNhbmNlbFJlcXVlc3QgPSBhbmd1bGFyLm5vb3A7XG4gICAgICAgICAgICAgICAgJHRpbWVvdXQuY2FuY2VsKG51bWVyaWNUaW1lb3V0UHJvbWlzZSk7XG4gICAgICAgICAgICAgICAgdGltZW91dERlZmVycmVkID0gbnVtZXJpY1RpbWVvdXRQcm9taXNlID0gaHR0cENvbmZpZy50aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oXG4gICAgICAgICAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcmVzcG9uc2VJbnRlcmNlcHRvcihyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgKHN1Y2Nlc3MgfHwgbm9vcCkodmFsdWUsIHJlc3BvbnNlLmhlYWRlcnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgcmVzcG9uc2VFcnJvckludGVyY2VwdG9yKTtcblxuICAgICAgICAgICAgaWYgKCFpc0luc3RhbmNlQ2FsbCkge1xuICAgICAgICAgICAgICAvLyB3ZSBhcmUgY3JlYXRpbmcgaW5zdGFuY2UgLyBjb2xsZWN0aW9uXG4gICAgICAgICAgICAgIC8vIC0gc2V0IHRoZSBpbml0aWFsIHByb21pc2VcbiAgICAgICAgICAgICAgLy8gLSByZXR1cm4gdGhlIGluc3RhbmNlIC8gY29sbGVjdGlvblxuICAgICAgICAgICAgICB2YWx1ZS4kcHJvbWlzZSA9IHByb21pc2U7XG4gICAgICAgICAgICAgIHZhbHVlLiRyZXNvbHZlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICBpZiAoY2FuY2VsbGFibGUpIHZhbHVlLiRjYW5jZWxSZXF1ZXN0ID0gdGltZW91dERlZmVycmVkLnJlc29sdmU7XG5cbiAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpbnN0YW5jZSBjYWxsXG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICBSZXNvdXJjZS5wcm90b3R5cGVbJyQnICsgbmFtZV0gPSBmdW5jdGlvbihwYXJhbXMsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbihwYXJhbXMpKSB7XG4gICAgICAgICAgICAgIGVycm9yID0gc3VjY2Vzczsgc3VjY2VzcyA9IHBhcmFtczsgcGFyYW1zID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gUmVzb3VyY2VbbmFtZV0uY2FsbCh0aGlzLCBwYXJhbXMsIHRoaXMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQuJHByb21pc2UgfHwgcmVzdWx0O1xuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFJlc291cmNlLmJpbmQgPSBmdW5jdGlvbihhZGRpdGlvbmFsUGFyYW1EZWZhdWx0cykge1xuICAgICAgICAgIHJldHVybiByZXNvdXJjZUZhY3RvcnkodXJsLCBleHRlbmQoe30sIHBhcmFtRGVmYXVsdHMsIGFkZGl0aW9uYWxQYXJhbURlZmF1bHRzKSwgYWN0aW9ucyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIFJlc291cmNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzb3VyY2VGYWN0b3J5O1xuICAgIH1dO1xuICB9KTtcblxuXG59KSh3aW5kb3csIHdpbmRvdy5hbmd1bGFyKTtcbiIsInJlcXVpcmUoJy4vYW5ndWxhci1yZXNvdXJjZScpO1xubW9kdWxlLmV4cG9ydHMgPSAnbmdSZXNvdXJjZSc7XG4iLCIvKipcbiAqIFN0YXRlLWJhc2VkIHJvdXRpbmcgZm9yIEFuZ3VsYXJKU1xuICogQHZlcnNpb24gdjAuMy4xXG4gKiBAbGluayBodHRwOi8vYW5ndWxhci11aS5naXRodWIuY29tL1xuICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UsIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyogY29tbW9uanMgcGFja2FnZSBtYW5hZ2VyIHN1cHBvcnQgKGVnIGNvbXBvbmVudGpzKSAqL1xuaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIGV4cG9ydHMgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMgPT09IGV4cG9ydHMpe1xuICBtb2R1bGUuZXhwb3J0cyA9ICd1aS5yb3V0ZXInO1xufVxuXG4oZnVuY3Rpb24gKHdpbmRvdywgYW5ndWxhciwgdW5kZWZpbmVkKSB7XG4vKmpzaGludCBnbG9iYWxzdHJpY3Q6dHJ1ZSovXG4vKmdsb2JhbCBhbmd1bGFyOmZhbHNlKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIGlzRGVmaW5lZCA9IGFuZ3VsYXIuaXNEZWZpbmVkLFxuICAgIGlzRnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24sXG4gICAgaXNTdHJpbmcgPSBhbmd1bGFyLmlzU3RyaW5nLFxuICAgIGlzT2JqZWN0ID0gYW5ndWxhci5pc09iamVjdCxcbiAgICBpc0FycmF5ID0gYW5ndWxhci5pc0FycmF5LFxuICAgIGZvckVhY2ggPSBhbmd1bGFyLmZvckVhY2gsXG4gICAgZXh0ZW5kID0gYW5ndWxhci5leHRlbmQsXG4gICAgY29weSA9IGFuZ3VsYXIuY29weSxcbiAgICB0b0pzb24gPSBhbmd1bGFyLnRvSnNvbjtcblxuZnVuY3Rpb24gaW5oZXJpdChwYXJlbnQsIGV4dHJhKSB7XG4gIHJldHVybiBleHRlbmQobmV3IChleHRlbmQoZnVuY3Rpb24oKSB7fSwgeyBwcm90b3R5cGU6IHBhcmVudCB9KSkoKSwgZXh0cmEpO1xufVxuXG5mdW5jdGlvbiBtZXJnZShkc3QpIHtcbiAgZm9yRWFjaChhcmd1bWVudHMsIGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogIT09IGRzdCkge1xuICAgICAgZm9yRWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKCFkc3QuaGFzT3duUHJvcGVydHkoa2V5KSkgZHN0W2tleV0gPSB2YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBkc3Q7XG59XG5cbi8qKlxuICogRmluZHMgdGhlIGNvbW1vbiBhbmNlc3RvciBwYXRoIGJldHdlZW4gdHdvIHN0YXRlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZmlyc3QgVGhlIGZpcnN0IHN0YXRlLlxuICogQHBhcmFtIHtPYmplY3R9IHNlY29uZCBUaGUgc2Vjb25kIHN0YXRlLlxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgYW4gYXJyYXkgb2Ygc3RhdGUgbmFtZXMgaW4gZGVzY2VuZGluZyBvcmRlciwgbm90IGluY2x1ZGluZyB0aGUgcm9vdC5cbiAqL1xuZnVuY3Rpb24gYW5jZXN0b3JzKGZpcnN0LCBzZWNvbmQpIHtcbiAgdmFyIHBhdGggPSBbXTtcblxuICBmb3IgKHZhciBuIGluIGZpcnN0LnBhdGgpIHtcbiAgICBpZiAoZmlyc3QucGF0aFtuXSAhPT0gc2Vjb25kLnBhdGhbbl0pIGJyZWFrO1xuICAgIHBhdGgucHVzaChmaXJzdC5wYXRoW25dKTtcbiAgfVxuICByZXR1cm4gcGF0aDtcbn1cblxuLyoqXG4gKiBJRTgtc2FmZSB3cmFwcGVyIGZvciBgT2JqZWN0LmtleXMoKWAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBBIEphdmFTY3JpcHQgb2JqZWN0LlxuICogQHJldHVybiB7QXJyYXl9IFJldHVybnMgdGhlIGtleXMgb2YgdGhlIG9iamVjdCBhcyBhbiBhcnJheS5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0S2V5cyhvYmplY3QpIHtcbiAgaWYgKE9iamVjdC5rZXlzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuXG4gIGZvckVhY2gob2JqZWN0LCBmdW5jdGlvbih2YWwsIGtleSkge1xuICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIElFOC1zYWZlIHdyYXBwZXIgZm9yIGBBcnJheS5wcm90b3R5cGUuaW5kZXhPZigpYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBBIEphdmFTY3JpcHQgYXJyYXkuXG4gKiBAcGFyYW0geyp9IHZhbHVlIEEgdmFsdWUgdG8gc2VhcmNoIHRoZSBhcnJheSBmb3IuXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFJldHVybnMgdGhlIGFycmF5IGluZGV4IHZhbHVlIG9mIGB2YWx1ZWAsIG9yIGAtMWAgaWYgbm90IHByZXNlbnQuXG4gKi9cbmZ1bmN0aW9uIGluZGV4T2YoYXJyYXksIHZhbHVlKSB7XG4gIGlmIChBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuICAgIHJldHVybiBhcnJheS5pbmRleE9mKHZhbHVlLCBOdW1iZXIoYXJndW1lbnRzWzJdKSB8fCAwKTtcbiAgfVxuICB2YXIgbGVuID0gYXJyYXkubGVuZ3RoID4+PiAwLCBmcm9tID0gTnVtYmVyKGFyZ3VtZW50c1syXSkgfHwgMDtcbiAgZnJvbSA9IChmcm9tIDwgMCkgPyBNYXRoLmNlaWwoZnJvbSkgOiBNYXRoLmZsb29yKGZyb20pO1xuXG4gIGlmIChmcm9tIDwgMCkgZnJvbSArPSBsZW47XG5cbiAgZm9yICg7IGZyb20gPCBsZW47IGZyb20rKykge1xuICAgIGlmIChmcm9tIGluIGFycmF5ICYmIGFycmF5W2Zyb21dID09PSB2YWx1ZSkgcmV0dXJuIGZyb207XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIE1lcmdlcyBhIHNldCBvZiBwYXJhbWV0ZXJzIHdpdGggYWxsIHBhcmFtZXRlcnMgaW5oZXJpdGVkIGJldHdlZW4gdGhlIGNvbW1vbiBwYXJlbnRzIG9mIHRoZVxuICogY3VycmVudCBzdGF0ZSBhbmQgYSBnaXZlbiBkZXN0aW5hdGlvbiBzdGF0ZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY3VycmVudFBhcmFtcyBUaGUgdmFsdWUgb2YgdGhlIGN1cnJlbnQgc3RhdGUgcGFyYW1ldGVycyAoJHN0YXRlUGFyYW1zKS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBuZXdQYXJhbXMgVGhlIHNldCBvZiBwYXJhbWV0ZXJzIHdoaWNoIHdpbGwgYmUgY29tcG9zaXRlZCB3aXRoIGluaGVyaXRlZCBwYXJhbXMuXG4gKiBAcGFyYW0ge09iamVjdH0gJGN1cnJlbnQgSW50ZXJuYWwgZGVmaW5pdGlvbiBvZiBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBjdXJyZW50IHN0YXRlLlxuICogQHBhcmFtIHtPYmplY3R9ICR0byBJbnRlcm5hbCBkZWZpbml0aW9uIG9mIG9iamVjdCByZXByZXNlbnRpbmcgc3RhdGUgdG8gdHJhbnNpdGlvbiB0by5cbiAqL1xuZnVuY3Rpb24gaW5oZXJpdFBhcmFtcyhjdXJyZW50UGFyYW1zLCBuZXdQYXJhbXMsICRjdXJyZW50LCAkdG8pIHtcbiAgdmFyIHBhcmVudHMgPSBhbmNlc3RvcnMoJGN1cnJlbnQsICR0byksIHBhcmVudFBhcmFtcywgaW5oZXJpdGVkID0ge30sIGluaGVyaXRMaXN0ID0gW107XG5cbiAgZm9yICh2YXIgaSBpbiBwYXJlbnRzKSB7XG4gICAgaWYgKCFwYXJlbnRzW2ldIHx8ICFwYXJlbnRzW2ldLnBhcmFtcykgY29udGludWU7XG4gICAgcGFyZW50UGFyYW1zID0gb2JqZWN0S2V5cyhwYXJlbnRzW2ldLnBhcmFtcyk7XG4gICAgaWYgKCFwYXJlbnRQYXJhbXMubGVuZ3RoKSBjb250aW51ZTtcblxuICAgIGZvciAodmFyIGogaW4gcGFyZW50UGFyYW1zKSB7XG4gICAgICBpZiAoaW5kZXhPZihpbmhlcml0TGlzdCwgcGFyZW50UGFyYW1zW2pdKSA+PSAwKSBjb250aW51ZTtcbiAgICAgIGluaGVyaXRMaXN0LnB1c2gocGFyZW50UGFyYW1zW2pdKTtcbiAgICAgIGluaGVyaXRlZFtwYXJlbnRQYXJhbXNbal1dID0gY3VycmVudFBhcmFtc1twYXJlbnRQYXJhbXNbal1dO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZXh0ZW5kKHt9LCBpbmhlcml0ZWQsIG5ld1BhcmFtcyk7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBub24tc3RyaWN0IGNvbXBhcmlzb24gb2YgdGhlIHN1YnNldCBvZiB0d28gb2JqZWN0cywgZGVmaW5lZCBieSBhIGxpc3Qgb2Yga2V5cy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gYSBUaGUgZmlyc3Qgb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IGIgVGhlIHNlY29uZCBvYmplY3QuXG4gKiBAcGFyYW0ge0FycmF5fSBrZXlzIFRoZSBsaXN0IG9mIGtleXMgd2l0aGluIGVhY2ggb2JqZWN0IHRvIGNvbXBhcmUuIElmIHRoZSBsaXN0IGlzIGVtcHR5IG9yIG5vdCBzcGVjaWZpZWQsXG4gKiAgICAgICAgICAgICAgICAgICAgIGl0IGRlZmF1bHRzIHRvIHRoZSBsaXN0IG9mIGtleXMgaW4gYGFgLlxuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGtleXMgbWF0Y2gsIG90aGVyd2lzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBlcXVhbEZvcktleXMoYSwgYiwga2V5cykge1xuICBpZiAoIWtleXMpIHtcbiAgICBrZXlzID0gW107XG4gICAgZm9yICh2YXIgbiBpbiBhKSBrZXlzLnB1c2gobik7IC8vIFVzZWQgaW5zdGVhZCBvZiBPYmplY3Qua2V5cygpIGZvciBJRTggY29tcGF0aWJpbGl0eVxuICB9XG5cbiAgZm9yICh2YXIgaT0wOyBpPGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgayA9IGtleXNbaV07XG4gICAgaWYgKGFba10gIT0gYltrXSkgcmV0dXJuIGZhbHNlOyAvLyBOb3QgJz09PScsIHZhbHVlcyBhcmVuJ3QgbmVjZXNzYXJpbHkgbm9ybWFsaXplZFxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHN1YnNldCBvZiBhbiBvYmplY3QsIGJhc2VkIG9uIGEgbGlzdCBvZiBrZXlzLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGtleXNcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZXNcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgYSBzdWJzZXQgb2YgYHZhbHVlc2AuXG4gKi9cbmZ1bmN0aW9uIGZpbHRlckJ5S2V5cyhrZXlzLCB2YWx1ZXMpIHtcbiAgdmFyIGZpbHRlcmVkID0ge307XG5cbiAgZm9yRWFjaChrZXlzLCBmdW5jdGlvbiAobmFtZSkge1xuICAgIGZpbHRlcmVkW25hbWVdID0gdmFsdWVzW25hbWVdO1xuICB9KTtcbiAgcmV0dXJuIGZpbHRlcmVkO1xufVxuXG4vLyBsaWtlIF8uaW5kZXhCeVxuLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLCBvciB5b3Ugd2FudCBsYXN0LW9uZS1pbiB0byB3aW5cbmZ1bmN0aW9uIGluZGV4QnkoYXJyYXksIHByb3BOYW1lKSB7XG4gIHZhciByZXN1bHQgPSB7fTtcbiAgZm9yRWFjaChhcnJheSwgZnVuY3Rpb24oaXRlbSkge1xuICAgIHJlc3VsdFtpdGVtW3Byb3BOYW1lXV0gPSBpdGVtO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gZXh0cmFjdGVkIGZyb20gdW5kZXJzY29yZS5qc1xuLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbmZ1bmN0aW9uIHBpY2sob2JqKSB7XG4gIHZhciBjb3B5ID0ge307XG4gIHZhciBrZXlzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShBcnJheS5wcm90b3R5cGUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICBmb3JFYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChrZXkgaW4gb2JqKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgfSk7XG4gIHJldHVybiBjb3B5O1xufVxuXG4vLyBleHRyYWN0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzXG4vLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb21pdHRpbmcgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG5mdW5jdGlvbiBvbWl0KG9iaikge1xuICB2YXIgY29weSA9IHt9O1xuICB2YXIga2V5cyA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoQXJyYXkucHJvdG90eXBlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChpbmRleE9mKGtleXMsIGtleSkgPT0gLTEpIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICB9XG4gIHJldHVybiBjb3B5O1xufVxuXG5mdW5jdGlvbiBwbHVjayhjb2xsZWN0aW9uLCBrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBbXSA6IHt9O1xuXG4gIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsLCBpKSB7XG4gICAgcmVzdWx0W2ldID0gaXNGdW5jdGlvbihrZXkpID8ga2V5KHZhbCkgOiB2YWxba2V5XTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGZpbHRlcihjb2xsZWN0aW9uLCBjYWxsYmFjaykge1xuICB2YXIgYXJyYXkgPSBpc0FycmF5KGNvbGxlY3Rpb24pO1xuICB2YXIgcmVzdWx0ID0gYXJyYXkgPyBbXSA6IHt9O1xuICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgIGlmIChjYWxsYmFjayh2YWwsIGkpKSB7XG4gICAgICByZXN1bHRbYXJyYXkgPyByZXN1bHQubGVuZ3RoIDogaV0gPSB2YWw7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbWFwKGNvbGxlY3Rpb24sIGNhbGxiYWNrKSB7XG4gIHZhciByZXN1bHQgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gW10gOiB7fTtcblxuICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgIHJlc3VsdFtpXSA9IGNhbGxiYWNrKHZhbCwgaSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEBuZ2RvYyBvdmVydmlld1xuICogQG5hbWUgdWkucm91dGVyLnV0aWxcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqICMgdWkucm91dGVyLnV0aWwgc3ViLW1vZHVsZVxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGEgZGVwZW5kZW5jeSBvZiBvdGhlciBzdWItbW9kdWxlcy4gRG8gbm90IGluY2x1ZGUgdGhpcyBtb2R1bGUgYXMgYSBkZXBlbmRlbmN5XG4gKiBpbiB5b3VyIGFuZ3VsYXIgYXBwICh1c2Uge0BsaW5rIHVpLnJvdXRlcn0gbW9kdWxlIGluc3RlYWQpLlxuICpcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJywgWyduZyddKTtcblxuLyoqXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcbiAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXJcbiAqIFxuICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiAjIHVpLnJvdXRlci5yb3V0ZXIgc3ViLW1vZHVsZVxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGEgZGVwZW5kZW5jeSBvZiBvdGhlciBzdWItbW9kdWxlcy4gRG8gbm90IGluY2x1ZGUgdGhpcyBtb2R1bGUgYXMgYSBkZXBlbmRlbmN5XG4gKiBpbiB5b3VyIGFuZ3VsYXIgYXBwICh1c2Uge0BsaW5rIHVpLnJvdXRlcn0gbW9kdWxlIGluc3RlYWQpLlxuICovXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnJvdXRlcicsIFsndWkucm91dGVyLnV0aWwnXSk7XG5cbi8qKlxuICogQG5nZG9jIG92ZXJ2aWV3XG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGVcbiAqIFxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5yb3V0ZXJcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIudXRpbFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogIyB1aS5yb3V0ZXIuc3RhdGUgc3ViLW1vZHVsZVxuICpcbiAqIFRoaXMgbW9kdWxlIGlzIGEgZGVwZW5kZW5jeSBvZiB0aGUgbWFpbiB1aS5yb3V0ZXIgbW9kdWxlLiBEbyBub3QgaW5jbHVkZSB0aGlzIG1vZHVsZSBhcyBhIGRlcGVuZGVuY3lcbiAqIGluIHlvdXIgYW5ndWxhciBhcHAgKHVzZSB7QGxpbmsgdWkucm91dGVyfSBtb2R1bGUgaW5zdGVhZCkuXG4gKiBcbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScsIFsndWkucm91dGVyLnJvdXRlcicsICd1aS5yb3V0ZXIudXRpbCddKTtcblxuLyoqXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcbiAqIEBuYW1lIHVpLnJvdXRlclxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqICMgdWkucm91dGVyXG4gKiBcbiAqICMjIFRoZSBtYWluIG1vZHVsZSBmb3IgdWkucm91dGVyIFxuICogVGhlcmUgYXJlIHNldmVyYWwgc3ViLW1vZHVsZXMgaW5jbHVkZWQgd2l0aCB0aGUgdWkucm91dGVyIG1vZHVsZSwgaG93ZXZlciBvbmx5IHRoaXMgbW9kdWxlIGlzIG5lZWRlZFxuICogYXMgYSBkZXBlbmRlbmN5IHdpdGhpbiB5b3VyIGFuZ3VsYXIgYXBwLiBUaGUgb3RoZXIgbW9kdWxlcyBhcmUgZm9yIG9yZ2FuaXphdGlvbiBwdXJwb3Nlcy4gXG4gKlxuICogVGhlIG1vZHVsZXMgYXJlOlxuICogKiB1aS5yb3V0ZXIgLSB0aGUgbWFpbiBcInVtYnJlbGxhXCIgbW9kdWxlXG4gKiAqIHVpLnJvdXRlci5yb3V0ZXIgLSBcbiAqIFxuICogKllvdSdsbCBuZWVkIHRvIGluY2x1ZGUgKipvbmx5KiogdGhpcyBtb2R1bGUgYXMgdGhlIGRlcGVuZGVuY3kgd2l0aGluIHlvdXIgYW5ndWxhciBhcHAuKlxuICogXG4gKiA8cHJlPlxuICogPCFkb2N0eXBlIGh0bWw+XG4gKiA8aHRtbCBuZy1hcHA9XCJteUFwcFwiPlxuICogPGhlYWQ+XG4gKiAgIDxzY3JpcHQgc3JjPVwianMvYW5ndWxhci5qc1wiPjwvc2NyaXB0PlxuICogICA8IS0tIEluY2x1ZGUgdGhlIHVpLXJvdXRlciBzY3JpcHQgLS0+XG4gKiAgIDxzY3JpcHQgc3JjPVwianMvYW5ndWxhci11aS1yb3V0ZXIubWluLmpzXCI+PC9zY3JpcHQ+XG4gKiAgIDxzY3JpcHQ+XG4gKiAgICAgLy8gLi4uYW5kIGFkZCAndWkucm91dGVyJyBhcyBhIGRlcGVuZGVuY3lcbiAqICAgICB2YXIgbXlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnbXlBcHAnLCBbJ3VpLnJvdXRlciddKTtcbiAqICAgPC9zY3JpcHQ+XG4gKiA8L2hlYWQ+XG4gKiA8Ym9keT5cbiAqIDwvYm9keT5cbiAqIDwvaHRtbD5cbiAqIDwvcHJlPlxuICovXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyJywgWyd1aS5yb3V0ZXIuc3RhdGUnXSk7XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuY29tcGF0JywgWyd1aS5yb3V0ZXInXSk7XG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHJlc29sdmVcbiAqXG4gKiBAcmVxdWlyZXMgJHFcbiAqIEByZXF1aXJlcyAkaW5qZWN0b3JcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIE1hbmFnZXMgcmVzb2x1dGlvbiBvZiAoYWN5Y2xpYykgZ3JhcGhzIG9mIHByb21pc2VzLlxuICovXG4kUmVzb2x2ZS4kaW5qZWN0ID0gWyckcScsICckaW5qZWN0b3InXTtcbmZ1bmN0aW9uICRSZXNvbHZlKCAgJHEsICAgICRpbmplY3Rvcikge1xuICBcbiAgdmFyIFZJU0lUX0lOX1BST0dSRVNTID0gMSxcbiAgICAgIFZJU0lUX0RPTkUgPSAyLFxuICAgICAgTk9USElORyA9IHt9LFxuICAgICAgTk9fREVQRU5ERU5DSUVTID0gW10sXG4gICAgICBOT19MT0NBTFMgPSBOT1RISU5HLFxuICAgICAgTk9fUEFSRU5UID0gZXh0ZW5kKCRxLndoZW4oTk9USElORyksIHsgJCRwcm9taXNlczogTk9USElORywgJCR2YWx1ZXM6IE5PVEhJTkcgfSk7XG4gIFxuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHJlc29sdmUjc3R1ZHlcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiRyZXNvbHZlXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTdHVkaWVzIGEgc2V0IG9mIGludm9jYWJsZXMgdGhhdCBhcmUgbGlrZWx5IHRvIGJlIHVzZWQgbXVsdGlwbGUgdGltZXMuXG4gICAqIDxwcmU+XG4gICAqICRyZXNvbHZlLnN0dWR5KGludm9jYWJsZXMpKGxvY2FscywgcGFyZW50LCBzZWxmKVxuICAgKiA8L3ByZT5cbiAgICogaXMgZXF1aXZhbGVudCB0b1xuICAgKiA8cHJlPlxuICAgKiAkcmVzb2x2ZS5yZXNvbHZlKGludm9jYWJsZXMsIGxvY2FscywgcGFyZW50LCBzZWxmKVxuICAgKiA8L3ByZT5cbiAgICogYnV0IHRoZSBmb3JtZXIgaXMgbW9yZSBlZmZpY2llbnQgKGluIGZhY3QgYHJlc29sdmVgIGp1c3QgY2FsbHMgYHN0dWR5YCBcbiAgICogaW50ZXJuYWxseSkuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBpbnZvY2FibGVzIEludm9jYWJsZSBvYmplY3RzXG4gICAqIEByZXR1cm4ge2Z1bmN0aW9ufSBhIGZ1bmN0aW9uIHRvIHBhc3MgaW4gbG9jYWxzLCBwYXJlbnQgYW5kIHNlbGZcbiAgICovXG4gIHRoaXMuc3R1ZHkgPSBmdW5jdGlvbiAoaW52b2NhYmxlcykge1xuICAgIGlmICghaXNPYmplY3QoaW52b2NhYmxlcykpIHRocm93IG5ldyBFcnJvcihcIidpbnZvY2FibGVzJyBtdXN0IGJlIGFuIG9iamVjdFwiKTtcbiAgICB2YXIgaW52b2NhYmxlS2V5cyA9IG9iamVjdEtleXMoaW52b2NhYmxlcyB8fCB7fSk7XG4gICAgXG4gICAgLy8gUGVyZm9ybSBhIHRvcG9sb2dpY2FsIHNvcnQgb2YgaW52b2NhYmxlcyB0byBidWlsZCBhbiBvcmRlcmVkIHBsYW5cbiAgICB2YXIgcGxhbiA9IFtdLCBjeWNsZSA9IFtdLCB2aXNpdGVkID0ge307XG4gICAgZnVuY3Rpb24gdmlzaXQodmFsdWUsIGtleSkge1xuICAgICAgaWYgKHZpc2l0ZWRba2V5XSA9PT0gVklTSVRfRE9ORSkgcmV0dXJuO1xuICAgICAgXG4gICAgICBjeWNsZS5wdXNoKGtleSk7XG4gICAgICBpZiAodmlzaXRlZFtrZXldID09PSBWSVNJVF9JTl9QUk9HUkVTUykge1xuICAgICAgICBjeWNsZS5zcGxpY2UoMCwgaW5kZXhPZihjeWNsZSwga2V5KSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN5Y2xpYyBkZXBlbmRlbmN5OiBcIiArIGN5Y2xlLmpvaW4oXCIgLT4gXCIpKTtcbiAgICAgIH1cbiAgICAgIHZpc2l0ZWRba2V5XSA9IFZJU0lUX0lOX1BST0dSRVNTO1xuICAgICAgXG4gICAgICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIHBsYW4ucHVzaChrZXksIFsgZnVuY3Rpb24oKSB7IHJldHVybiAkaW5qZWN0b3IuZ2V0KHZhbHVlKTsgfV0sIE5PX0RFUEVOREVOQ0lFUyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcGFyYW1zID0gJGluamVjdG9yLmFubm90YXRlKHZhbHVlKTtcbiAgICAgICAgZm9yRWFjaChwYXJhbXMsIGZ1bmN0aW9uIChwYXJhbSkge1xuICAgICAgICAgIGlmIChwYXJhbSAhPT0ga2V5ICYmIGludm9jYWJsZXMuaGFzT3duUHJvcGVydHkocGFyYW0pKSB2aXNpdChpbnZvY2FibGVzW3BhcmFtXSwgcGFyYW0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcGxhbi5wdXNoKGtleSwgdmFsdWUsIHBhcmFtcyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGN5Y2xlLnBvcCgpO1xuICAgICAgdmlzaXRlZFtrZXldID0gVklTSVRfRE9ORTtcbiAgICB9XG4gICAgZm9yRWFjaChpbnZvY2FibGVzLCB2aXNpdCk7XG4gICAgaW52b2NhYmxlcyA9IGN5Y2xlID0gdmlzaXRlZCA9IG51bGw7IC8vIHBsYW4gaXMgYWxsIHRoYXQncyByZXF1aXJlZFxuICAgIFxuICAgIGZ1bmN0aW9uIGlzUmVzb2x2ZSh2YWx1ZSkge1xuICAgICAgcmV0dXJuIGlzT2JqZWN0KHZhbHVlKSAmJiB2YWx1ZS50aGVuICYmIHZhbHVlLiQkcHJvbWlzZXM7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbiAobG9jYWxzLCBwYXJlbnQsIHNlbGYpIHtcbiAgICAgIGlmIChpc1Jlc29sdmUobG9jYWxzKSAmJiBzZWxmID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgc2VsZiA9IHBhcmVudDsgcGFyZW50ID0gbG9jYWxzOyBsb2NhbHMgPSBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKCFsb2NhbHMpIGxvY2FscyA9IE5PX0xPQ0FMUztcbiAgICAgIGVsc2UgaWYgKCFpc09iamVjdChsb2NhbHMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIidsb2NhbHMnIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xuICAgICAgfSAgICAgICBcbiAgICAgIGlmICghcGFyZW50KSBwYXJlbnQgPSBOT19QQVJFTlQ7XG4gICAgICBlbHNlIGlmICghaXNSZXNvbHZlKHBhcmVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3BhcmVudCcgbXVzdCBiZSBhIHByb21pc2UgcmV0dXJuZWQgYnkgJHJlc29sdmUucmVzb2x2ZSgpXCIpO1xuICAgICAgfVxuICAgICAgXG4gICAgICAvLyBUbyBjb21wbGV0ZSB0aGUgb3ZlcmFsbCByZXNvbHV0aW9uLCB3ZSBoYXZlIHRvIHdhaXQgZm9yIHRoZSBwYXJlbnRcbiAgICAgIC8vIHByb21pc2UgYW5kIGZvciB0aGUgcHJvbWlzZSBmb3IgZWFjaCBpbnZva2FibGUgaW4gb3VyIHBsYW4uXG4gICAgICB2YXIgcmVzb2x1dGlvbiA9ICRxLmRlZmVyKCksXG4gICAgICAgICAgcmVzdWx0ID0gcmVzb2x1dGlvbi5wcm9taXNlLFxuICAgICAgICAgIHByb21pc2VzID0gcmVzdWx0LiQkcHJvbWlzZXMgPSB7fSxcbiAgICAgICAgICB2YWx1ZXMgPSBleHRlbmQoe30sIGxvY2FscyksXG4gICAgICAgICAgd2FpdCA9IDEgKyBwbGFuLmxlbmd0aC8zLFxuICAgICAgICAgIG1lcmdlZCA9IGZhbHNlO1xuICAgICAgICAgIFxuICAgICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgICAgLy8gTWVyZ2UgcGFyZW50IHZhbHVlcyB3ZSBoYXZlbid0IGdvdCB5ZXQgYW5kIHB1Ymxpc2ggb3VyIG93biAkJHZhbHVlc1xuICAgICAgICBpZiAoIS0td2FpdCkge1xuICAgICAgICAgIGlmICghbWVyZ2VkKSBtZXJnZSh2YWx1ZXMsIHBhcmVudC4kJHZhbHVlcyk7IFxuICAgICAgICAgIHJlc3VsdC4kJHZhbHVlcyA9IHZhbHVlcztcbiAgICAgICAgICByZXN1bHQuJCRwcm9taXNlcyA9IHJlc3VsdC4kJHByb21pc2VzIHx8IHRydWU7IC8vIGtlZXAgZm9yIGlzUmVzb2x2ZSgpXG4gICAgICAgICAgZGVsZXRlIHJlc3VsdC4kJGluaGVyaXRlZFZhbHVlcztcbiAgICAgICAgICByZXNvbHV0aW9uLnJlc29sdmUodmFsdWVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiBmYWlsKHJlYXNvbikge1xuICAgICAgICByZXN1bHQuJCRmYWlsdXJlID0gcmVhc29uO1xuICAgICAgICByZXNvbHV0aW9uLnJlamVjdChyZWFzb24pO1xuICAgICAgfVxuXG4gICAgICAvLyBTaG9ydC1jaXJjdWl0IGlmIHBhcmVudCBoYXMgYWxyZWFkeSBmYWlsZWRcbiAgICAgIGlmIChpc0RlZmluZWQocGFyZW50LiQkZmFpbHVyZSkpIHtcbiAgICAgICAgZmFpbChwYXJlbnQuJCRmYWlsdXJlKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKHBhcmVudC4kJGluaGVyaXRlZFZhbHVlcykge1xuICAgICAgICBtZXJnZSh2YWx1ZXMsIG9taXQocGFyZW50LiQkaW5oZXJpdGVkVmFsdWVzLCBpbnZvY2FibGVLZXlzKSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1lcmdlIHBhcmVudCB2YWx1ZXMgaWYgdGhlIHBhcmVudCBoYXMgYWxyZWFkeSByZXNvbHZlZCwgb3IgbWVyZ2VcbiAgICAgIC8vIHBhcmVudCBwcm9taXNlcyBhbmQgd2FpdCBpZiB0aGUgcGFyZW50IHJlc29sdmUgaXMgc3RpbGwgaW4gcHJvZ3Jlc3MuXG4gICAgICBleHRlbmQocHJvbWlzZXMsIHBhcmVudC4kJHByb21pc2VzKTtcbiAgICAgIGlmIChwYXJlbnQuJCR2YWx1ZXMpIHtcbiAgICAgICAgbWVyZ2VkID0gbWVyZ2UodmFsdWVzLCBvbWl0KHBhcmVudC4kJHZhbHVlcywgaW52b2NhYmxlS2V5cykpO1xuICAgICAgICByZXN1bHQuJCRpbmhlcml0ZWRWYWx1ZXMgPSBvbWl0KHBhcmVudC4kJHZhbHVlcywgaW52b2NhYmxlS2V5cyk7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChwYXJlbnQuJCRpbmhlcml0ZWRWYWx1ZXMpIHtcbiAgICAgICAgICByZXN1bHQuJCRpbmhlcml0ZWRWYWx1ZXMgPSBvbWl0KHBhcmVudC4kJGluaGVyaXRlZFZhbHVlcywgaW52b2NhYmxlS2V5cyk7XG4gICAgICAgIH0gICAgICAgIFxuICAgICAgICBwYXJlbnQudGhlbihkb25lLCBmYWlsKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gUHJvY2VzcyBlYWNoIGludm9jYWJsZSBpbiB0aGUgcGxhbiwgYnV0IGlnbm9yZSBhbnkgd2hlcmUgYSBsb2NhbCBvZiB0aGUgc2FtZSBuYW1lIGV4aXN0cy5cbiAgICAgIGZvciAodmFyIGk9MCwgaWk9cGxhbi5sZW5ndGg7IGk8aWk7IGkrPTMpIHtcbiAgICAgICAgaWYgKGxvY2Fscy5oYXNPd25Qcm9wZXJ0eShwbGFuW2ldKSkgZG9uZSgpO1xuICAgICAgICBlbHNlIGludm9rZShwbGFuW2ldLCBwbGFuW2krMV0sIHBsYW5baSsyXSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGZ1bmN0aW9uIGludm9rZShrZXksIGludm9jYWJsZSwgcGFyYW1zKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhIGRlZmVycmVkIGZvciB0aGlzIGludm9jYXRpb24uIEZhaWx1cmVzIHdpbGwgcHJvcGFnYXRlIHRvIHRoZSByZXNvbHV0aW9uIGFzIHdlbGwuXG4gICAgICAgIHZhciBpbnZvY2F0aW9uID0gJHEuZGVmZXIoKSwgd2FpdFBhcmFtcyA9IDA7XG4gICAgICAgIGZ1bmN0aW9uIG9uZmFpbHVyZShyZWFzb24pIHtcbiAgICAgICAgICBpbnZvY2F0aW9uLnJlamVjdChyZWFzb24pO1xuICAgICAgICAgIGZhaWwocmVhc29uKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBXYWl0IGZvciBhbnkgcGFyYW1ldGVyIHRoYXQgd2UgaGF2ZSBhIHByb21pc2UgZm9yIChlaXRoZXIgZnJvbSBwYXJlbnQgb3IgZnJvbSB0aGlzXG4gICAgICAgIC8vIHJlc29sdmU7IGluIHRoYXQgY2FzZSBzdHVkeSgpIHdpbGwgaGF2ZSBtYWRlIHN1cmUgaXQncyBvcmRlcmVkIGJlZm9yZSB1cyBpbiB0aGUgcGxhbikuXG4gICAgICAgIGZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiAoZGVwKSB7XG4gICAgICAgICAgaWYgKHByb21pc2VzLmhhc093blByb3BlcnR5KGRlcCkgJiYgIWxvY2Fscy5oYXNPd25Qcm9wZXJ0eShkZXApKSB7XG4gICAgICAgICAgICB3YWl0UGFyYW1zKys7XG4gICAgICAgICAgICBwcm9taXNlc1tkZXBdLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICB2YWx1ZXNbZGVwXSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgaWYgKCEoLS13YWl0UGFyYW1zKSkgcHJvY2VlZCgpO1xuICAgICAgICAgICAgfSwgb25mYWlsdXJlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXdhaXRQYXJhbXMpIHByb2NlZWQoKTtcbiAgICAgICAgZnVuY3Rpb24gcHJvY2VlZCgpIHtcbiAgICAgICAgICBpZiAoaXNEZWZpbmVkKHJlc3VsdC4kJGZhaWx1cmUpKSByZXR1cm47XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGludm9jYXRpb24ucmVzb2x2ZSgkaW5qZWN0b3IuaW52b2tlKGludm9jYWJsZSwgc2VsZiwgdmFsdWVzKSk7XG4gICAgICAgICAgICBpbnZvY2F0aW9uLnByb21pc2UudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgIHZhbHVlc1trZXldID0gcmVzdWx0O1xuICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9LCBvbmZhaWx1cmUpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIG9uZmFpbHVyZShlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gUHVibGlzaCBwcm9taXNlIHN5bmNocm9ub3VzbHk7IGludm9jYXRpb25zIGZ1cnRoZXIgZG93biBpbiB0aGUgcGxhbiBtYXkgZGVwZW5kIG9uIGl0LlxuICAgICAgICBwcm9taXNlc1trZXldID0gaW52b2NhdGlvbi5wcm9taXNlO1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG4gIFxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiRyZXNvbHZlI3Jlc29sdmVcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiRyZXNvbHZlXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZXNvbHZlcyBhIHNldCBvZiBpbnZvY2FibGVzLiBBbiBpbnZvY2FibGUgaXMgYSBmdW5jdGlvbiB0byBiZSBpbnZva2VkIHZpYSBcbiAgICogYCRpbmplY3Rvci5pbnZva2UoKWAsIGFuZCBjYW4gaGF2ZSBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIGRlcGVuZGVuY2llcy4gXG4gICAqIEFuIGludm9jYWJsZSBjYW4gZWl0aGVyIHJldHVybiBhIHZhbHVlIGRpcmVjdGx5LFxuICAgKiBvciBhIGAkcWAgcHJvbWlzZS4gSWYgYSBwcm9taXNlIGlzIHJldHVybmVkIGl0IHdpbGwgYmUgcmVzb2x2ZWQgYW5kIHRoZSBcbiAgICogcmVzdWx0aW5nIHZhbHVlIHdpbGwgYmUgdXNlZCBpbnN0ZWFkLiBEZXBlbmRlbmNpZXMgb2YgaW52b2NhYmxlcyBhcmUgcmVzb2x2ZWQgXG4gICAqIChpbiB0aGlzIG9yZGVyIG9mIHByZWNlZGVuY2UpXG4gICAqXG4gICAqIC0gZnJvbSB0aGUgc3BlY2lmaWVkIGBsb2NhbHNgXG4gICAqIC0gZnJvbSBhbm90aGVyIGludm9jYWJsZSB0aGF0IGlzIHBhcnQgb2YgdGhpcyBgJHJlc29sdmVgIGNhbGxcbiAgICogLSBmcm9tIGFuIGludm9jYWJsZSB0aGF0IGlzIGluaGVyaXRlZCBmcm9tIGEgYHBhcmVudGAgY2FsbCB0byBgJHJlc29sdmVgIFxuICAgKiAgIChvciByZWN1cnNpdmVseVxuICAgKiAtIGZyb20gYW55IGFuY2VzdG9yIGAkcmVzb2x2ZWAgb2YgdGhhdCBwYXJlbnQpLlxuICAgKlxuICAgKiBUaGUgcmV0dXJuIHZhbHVlIG9mIGAkcmVzb2x2ZWAgaXMgYSBwcm9taXNlIGZvciBhbiBvYmplY3QgdGhhdCBjb250YWlucyBcbiAgICogKGluIHRoaXMgb3JkZXIgb2YgcHJlY2VkZW5jZSlcbiAgICpcbiAgICogLSBhbnkgYGxvY2Fsc2AgKGlmIHNwZWNpZmllZClcbiAgICogLSB0aGUgcmVzb2x2ZWQgcmV0dXJuIHZhbHVlcyBvZiBhbGwgaW5qZWN0YWJsZXNcbiAgICogLSBhbnkgdmFsdWVzIGluaGVyaXRlZCBmcm9tIGEgYHBhcmVudGAgY2FsbCB0byBgJHJlc29sdmVgIChpZiBzcGVjaWZpZWQpXG4gICAqXG4gICAqIFRoZSBwcm9taXNlIHdpbGwgcmVzb2x2ZSBhZnRlciB0aGUgYHBhcmVudGAgcHJvbWlzZSAoaWYgYW55KSBhbmQgYWxsIHByb21pc2VzIFxuICAgKiByZXR1cm5lZCBieSBpbmplY3RhYmxlcyBoYXZlIGJlZW4gcmVzb2x2ZWQuIElmIGFueSBpbnZvY2FibGUgXG4gICAqIChvciBgJGluamVjdG9yLmludm9rZWApIHRocm93cyBhbiBleGNlcHRpb24sIG9yIGlmIGEgcHJvbWlzZSByZXR1cm5lZCBieSBhbiBcbiAgICogaW52b2NhYmxlIGlzIHJlamVjdGVkLCB0aGUgYCRyZXNvbHZlYCBwcm9taXNlIGlzIGltbWVkaWF0ZWx5IHJlamVjdGVkIHdpdGggdGhlIFxuICAgKiBzYW1lIGVycm9yLiBBIHJlamVjdGlvbiBvZiBhIGBwYXJlbnRgIHByb21pc2UgKGlmIHNwZWNpZmllZCkgd2lsbCBsaWtld2lzZSBiZSBcbiAgICogcHJvcGFnYXRlZCBpbW1lZGlhdGVseS4gT25jZSB0aGUgYCRyZXNvbHZlYCBwcm9taXNlIGhhcyBiZWVuIHJlamVjdGVkLCBubyBcbiAgICogZnVydGhlciBpbnZvY2FibGVzIHdpbGwgYmUgY2FsbGVkLlxuICAgKiBcbiAgICogQ3ljbGljIGRlcGVuZGVuY2llcyBiZXR3ZWVuIGludm9jYWJsZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYW5kIHdpbGwgY2F1c2UgYCRyZXNvbHZlYFxuICAgKiB0byB0aHJvdyBhbiBlcnJvci4gQXMgYSBzcGVjaWFsIGNhc2UsIGFuIGluamVjdGFibGUgY2FuIGRlcGVuZCBvbiBhIHBhcmFtZXRlciBcbiAgICogd2l0aCB0aGUgc2FtZSBuYW1lIGFzIHRoZSBpbmplY3RhYmxlLCB3aGljaCB3aWxsIGJlIGZ1bGZpbGxlZCBmcm9tIHRoZSBgcGFyZW50YCBcbiAgICogaW5qZWN0YWJsZSBvZiB0aGUgc2FtZSBuYW1lLiBUaGlzIGFsbG93cyBpbmhlcml0ZWQgdmFsdWVzIHRvIGJlIGRlY29yYXRlZC4gXG4gICAqIE5vdGUgdGhhdCBpbiB0aGlzIGNhc2UgYW55IG90aGVyIGluamVjdGFibGUgaW4gdGhlIHNhbWUgYCRyZXNvbHZlYCB3aXRoIHRoZSBzYW1lXG4gICAqIGRlcGVuZGVuY3kgd291bGQgc2VlIHRoZSBkZWNvcmF0ZWQgdmFsdWUsIG5vdCB0aGUgaW5oZXJpdGVkIHZhbHVlLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgbWlzc2luZyBkZXBlbmRlbmNpZXMgLS0gdW5saWtlIGN5Y2xpYyBkZXBlbmRlbmNpZXMgLS0gd2lsbCBjYXVzZSBhbiBcbiAgICogKGFzeW5jaHJvbm91cykgcmVqZWN0aW9uIG9mIHRoZSBgJHJlc29sdmVgIHByb21pc2UgcmF0aGVyIHRoYW4gYSAoc3luY2hyb25vdXMpIFxuICAgKiBleGNlcHRpb24uXG4gICAqXG4gICAqIEludm9jYWJsZXMgYXJlIGludm9rZWQgZWFnZXJseSBhcyBzb29uIGFzIGFsbCBkZXBlbmRlbmNpZXMgYXJlIGF2YWlsYWJsZS4gXG4gICAqIFRoaXMgaXMgdHJ1ZSBldmVuIGZvciBkZXBlbmRlbmNpZXMgaW5oZXJpdGVkIGZyb20gYSBgcGFyZW50YCBjYWxsIHRvIGAkcmVzb2x2ZWAuXG4gICAqXG4gICAqIEFzIGEgc3BlY2lhbCBjYXNlLCBhbiBpbnZvY2FibGUgY2FuIGJlIGEgc3RyaW5nLCBpbiB3aGljaCBjYXNlIGl0IGlzIHRha2VuIHRvIFxuICAgKiBiZSBhIHNlcnZpY2UgbmFtZSB0byBiZSBwYXNzZWQgdG8gYCRpbmplY3Rvci5nZXQoKWAuIFRoaXMgaXMgc3VwcG9ydGVkIHByaW1hcmlseSBcbiAgICogZm9yIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IHdpdGggdGhlIGByZXNvbHZlYCBwcm9wZXJ0eSBvZiBgJHJvdXRlUHJvdmlkZXJgIFxuICAgKiByb3V0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBpbnZvY2FibGVzIGZ1bmN0aW9ucyB0byBpbnZva2Ugb3IgXG4gICAqIGAkaW5qZWN0b3JgIHNlcnZpY2VzIHRvIGZldGNoLlxuICAgKiBAcGFyYW0ge29iamVjdH0gbG9jYWxzICB2YWx1ZXMgdG8gbWFrZSBhdmFpbGFibGUgdG8gdGhlIGluamVjdGFibGVzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJlbnQgIGEgcHJvbWlzZSByZXR1cm5lZCBieSBhbm90aGVyIGNhbGwgdG8gYCRyZXNvbHZlYC5cbiAgICogQHBhcmFtIHtvYmplY3R9IHNlbGYgIHRoZSBgdGhpc2AgZm9yIHRoZSBpbnZva2VkIG1ldGhvZHNcbiAgICogQHJldHVybiB7b2JqZWN0fSBQcm9taXNlIGZvciBhbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVzb2x2ZWQgcmV0dXJuIHZhbHVlXG4gICAqIG9mIGFsbCBpbnZvY2FibGVzLCBhcyB3ZWxsIGFzIGFueSBpbmhlcml0ZWQgYW5kIGxvY2FsIHZhbHVlcy5cbiAgICovXG4gIHRoaXMucmVzb2x2ZSA9IGZ1bmN0aW9uIChpbnZvY2FibGVzLCBsb2NhbHMsIHBhcmVudCwgc2VsZikge1xuICAgIHJldHVybiB0aGlzLnN0dWR5KGludm9jYWJsZXMpKGxvY2FscywgcGFyZW50LCBzZWxmKTtcbiAgfTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJykuc2VydmljZSgnJHJlc29sdmUnLCAkUmVzb2x2ZSk7XG5cblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XG4gKlxuICogQHJlcXVpcmVzICRodHRwXG4gKiBAcmVxdWlyZXMgJHRlbXBsYXRlQ2FjaGVcbiAqIEByZXF1aXJlcyAkaW5qZWN0b3JcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFNlcnZpY2UuIE1hbmFnZXMgbG9hZGluZyBvZiB0ZW1wbGF0ZXMuXG4gKi9cbiRUZW1wbGF0ZUZhY3RvcnkuJGluamVjdCA9IFsnJGh0dHAnLCAnJHRlbXBsYXRlQ2FjaGUnLCAnJGluamVjdG9yJ107XG5mdW5jdGlvbiAkVGVtcGxhdGVGYWN0b3J5KCAgJGh0dHAsICAgJHRlbXBsYXRlQ2FjaGUsICAgJGluamVjdG9yKSB7XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21Db25maWdcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIENyZWF0ZXMgYSB0ZW1wbGF0ZSBmcm9tIGEgY29uZmlndXJhdGlvbiBvYmplY3QuIFxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIENvbmZpZ3VyYXRpb24gb2JqZWN0IGZvciB3aGljaCB0byBsb2FkIGEgdGVtcGxhdGUuIFxuICAgKiBUaGUgZm9sbG93aW5nIHByb3BlcnRpZXMgYXJlIHNlYXJjaCBpbiB0aGUgc3BlY2lmaWVkIG9yZGVyLCBhbmQgdGhlIGZpcnN0IG9uZSBcbiAgICogdGhhdCBpcyBkZWZpbmVkIGlzIHVzZWQgdG8gY3JlYXRlIHRoZSB0ZW1wbGF0ZTpcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBjb25maWcudGVtcGxhdGUgaHRtbCBzdHJpbmcgdGVtcGxhdGUgb3IgZnVuY3Rpb24gdG8gXG4gICAqIGxvYWQgdmlhIHtAbGluayB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21TdHJpbmcgZnJvbVN0cmluZ30uXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gY29uZmlnLnRlbXBsYXRlVXJsIHVybCB0byBsb2FkIG9yIGEgZnVuY3Rpb24gcmV0dXJuaW5nIFxuICAgKiB0aGUgdXJsIHRvIGxvYWQgdmlhIHtAbGluayB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21VcmwgZnJvbVVybH0uXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbmZpZy50ZW1wbGF0ZVByb3ZpZGVyIGZ1bmN0aW9uIHRvIGludm9rZSB2aWEgXG4gICAqIHtAbGluayB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21Qcm92aWRlciBmcm9tUHJvdmlkZXJ9LlxuICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zICBQYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGhlIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICAgKiBAcGFyYW0ge29iamVjdH0gbG9jYWxzIExvY2FscyB0byBwYXNzIHRvIGBpbnZva2VgIGlmIHRoZSB0ZW1wbGF0ZSBpcyBsb2FkZWQgXG4gICAqIHZpYSBhIGB0ZW1wbGF0ZVByb3ZpZGVyYC4gRGVmYXVsdHMgdG8gYHsgcGFyYW1zOiBwYXJhbXMgfWAuXG4gICAqXG4gICAqIEByZXR1cm4ge3N0cmluZ3xvYmplY3R9ICBUaGUgdGVtcGxhdGUgaHRtbCBhcyBhIHN0cmluZywgb3IgYSBwcm9taXNlIGZvciBcbiAgICogdGhhdCBzdHJpbmcsb3IgYG51bGxgIGlmIG5vIHRlbXBsYXRlIGlzIGNvbmZpZ3VyZWQuXG4gICAqL1xuICB0aGlzLmZyb21Db25maWcgPSBmdW5jdGlvbiAoY29uZmlnLCBwYXJhbXMsIGxvY2Fscykge1xuICAgIHJldHVybiAoXG4gICAgICBpc0RlZmluZWQoY29uZmlnLnRlbXBsYXRlKSA/IHRoaXMuZnJvbVN0cmluZyhjb25maWcudGVtcGxhdGUsIHBhcmFtcykgOlxuICAgICAgaXNEZWZpbmVkKGNvbmZpZy50ZW1wbGF0ZVVybCkgPyB0aGlzLmZyb21VcmwoY29uZmlnLnRlbXBsYXRlVXJsLCBwYXJhbXMpIDpcbiAgICAgIGlzRGVmaW5lZChjb25maWcudGVtcGxhdGVQcm92aWRlcikgPyB0aGlzLmZyb21Qcm92aWRlcihjb25maWcudGVtcGxhdGVQcm92aWRlciwgcGFyYW1zLCBsb2NhbHMpIDpcbiAgICAgIG51bGxcbiAgICApO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tU3RyaW5nXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBDcmVhdGVzIGEgdGVtcGxhdGUgZnJvbSBhIHN0cmluZyBvciBhIGZ1bmN0aW9uIHJldHVybmluZyBhIHN0cmluZy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSB0ZW1wbGF0ZSBodG1sIHRlbXBsYXRlIGFzIGEgc3RyaW5nIG9yIGZ1bmN0aW9uIHRoYXQgXG4gICAqIHJldHVybnMgYW4gaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZy5cbiAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyBQYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGhlIHRlbXBsYXRlIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd8b2JqZWN0fSBUaGUgdGVtcGxhdGUgaHRtbCBhcyBhIHN0cmluZywgb3IgYSBwcm9taXNlIGZvciB0aGF0IFxuICAgKiBzdHJpbmcuXG4gICAqL1xuICB0aGlzLmZyb21TdHJpbmcgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHBhcmFtcykge1xuICAgIHJldHVybiBpc0Z1bmN0aW9uKHRlbXBsYXRlKSA/IHRlbXBsYXRlKHBhcmFtcykgOiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVVybFxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeVxuICAgKiBcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIExvYWRzIGEgdGVtcGxhdGUgZnJvbSB0aGUgYSBVUkwgdmlhIGAkaHR0cGAgYW5kIGAkdGVtcGxhdGVDYWNoZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSB1cmwgdXJsIG9mIHRoZSB0ZW1wbGF0ZSB0byBsb2FkLCBvciBhIGZ1bmN0aW9uIFxuICAgKiB0aGF0IHJldHVybnMgYSB1cmwuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgUGFyYW1ldGVycyB0byBwYXNzIHRvIHRoZSB1cmwgZnVuY3Rpb24uXG4gICAqIEByZXR1cm4ge3N0cmluZ3xQcm9taXNlLjxzdHJpbmc+fSBUaGUgdGVtcGxhdGUgaHRtbCBhcyBhIHN0cmluZywgb3IgYSBwcm9taXNlIFxuICAgKiBmb3IgdGhhdCBzdHJpbmcuXG4gICAqL1xuICB0aGlzLmZyb21VcmwgPSBmdW5jdGlvbiAodXJsLCBwYXJhbXMpIHtcbiAgICBpZiAoaXNGdW5jdGlvbih1cmwpKSB1cmwgPSB1cmwocGFyYW1zKTtcbiAgICBpZiAodXJsID09IG51bGwpIHJldHVybiBudWxsO1xuICAgIGVsc2UgcmV0dXJuICRodHRwXG4gICAgICAgIC5nZXQodXJsLCB7IGNhY2hlOiAkdGVtcGxhdGVDYWNoZSwgaGVhZGVyczogeyBBY2NlcHQ6ICd0ZXh0L2h0bWwnIH19KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkgeyByZXR1cm4gcmVzcG9uc2UuZGF0YTsgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21Qcm92aWRlclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ3JlYXRlcyBhIHRlbXBsYXRlIGJ5IGludm9raW5nIGFuIGluamVjdGFibGUgcHJvdmlkZXIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IHByb3ZpZGVyIEZ1bmN0aW9uIHRvIGludm9rZSB2aWEgYCRpbmplY3Rvci5pbnZva2VgXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgUGFyYW1ldGVycyBmb3IgdGhlIHRlbXBsYXRlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzIExvY2FscyB0byBwYXNzIHRvIGBpbnZva2VgLiBEZWZhdWx0cyB0byBcbiAgICogYHsgcGFyYW1zOiBwYXJhbXMgfWAuXG4gICAqIEByZXR1cm4ge3N0cmluZ3xQcm9taXNlLjxzdHJpbmc+fSBUaGUgdGVtcGxhdGUgaHRtbCBhcyBhIHN0cmluZywgb3IgYSBwcm9taXNlIFxuICAgKiBmb3IgdGhhdCBzdHJpbmcuXG4gICAqL1xuICB0aGlzLmZyb21Qcm92aWRlciA9IGZ1bmN0aW9uIChwcm92aWRlciwgcGFyYW1zLCBsb2NhbHMpIHtcbiAgICByZXR1cm4gJGluamVjdG9yLmludm9rZShwcm92aWRlciwgbnVsbCwgbG9jYWxzIHx8IHsgcGFyYW1zOiBwYXJhbXMgfSk7XG4gIH07XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIudXRpbCcpLnNlcnZpY2UoJyR0ZW1wbGF0ZUZhY3RvcnknLCAkVGVtcGxhdGVGYWN0b3J5KTtcblxudmFyICQkVU1GUDsgLy8gcmVmZXJlbmNlIHRvICRVcmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyXG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBNYXRjaGVzIFVSTHMgYWdhaW5zdCBwYXR0ZXJucyBhbmQgZXh0cmFjdHMgbmFtZWQgcGFyYW1ldGVycyBmcm9tIHRoZSBwYXRoIG9yIHRoZSBzZWFyY2hcbiAqIHBhcnQgb2YgdGhlIFVSTC4gQSBVUkwgcGF0dGVybiBjb25zaXN0cyBvZiBhIHBhdGggcGF0dGVybiwgb3B0aW9uYWxseSBmb2xsb3dlZCBieSAnPycgYW5kIGEgbGlzdFxuICogb2Ygc2VhcmNoIHBhcmFtZXRlcnMuIE11bHRpcGxlIHNlYXJjaCBwYXJhbWV0ZXIgbmFtZXMgYXJlIHNlcGFyYXRlZCBieSAnJicuIFNlYXJjaCBwYXJhbWV0ZXJzXG4gKiBkbyBub3QgaW5mbHVlbmNlIHdoZXRoZXIgb3Igbm90IGEgVVJMIGlzIG1hdGNoZWQsIGJ1dCB0aGVpciB2YWx1ZXMgYXJlIHBhc3NlZCB0aHJvdWdoIGludG9cbiAqIHRoZSBtYXRjaGVkIHBhcmFtZXRlcnMgcmV0dXJuZWQgYnkge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNtZXRob2RzX2V4ZWMgZXhlY30uXG4gKlxuICogUGF0aCBwYXJhbWV0ZXIgcGxhY2Vob2xkZXJzIGNhbiBiZSBzcGVjaWZpZWQgdXNpbmcgc2ltcGxlIGNvbG9uL2NhdGNoLWFsbCBzeW50YXggb3IgY3VybHkgYnJhY2VcbiAqIHN5bnRheCwgd2hpY2ggb3B0aW9uYWxseSBhbGxvd3MgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIHRoZSBwYXJhbWV0ZXIgdG8gYmUgc3BlY2lmaWVkOlxuICpcbiAqICogYCc6J2AgbmFtZSAtIGNvbG9uIHBsYWNlaG9sZGVyXG4gKiAqIGAnKidgIG5hbWUgLSBjYXRjaC1hbGwgcGxhY2Vob2xkZXJcbiAqICogYCd7JyBuYW1lICd9J2AgLSBjdXJseSBwbGFjZWhvbGRlclxuICogKiBgJ3snIG5hbWUgJzonIHJlZ2V4cHx0eXBlICd9J2AgLSBjdXJseSBwbGFjZWhvbGRlciB3aXRoIHJlZ2V4cCBvciB0eXBlIG5hbWUuIFNob3VsZCB0aGVcbiAqICAgcmVnZXhwIGl0c2VsZiBjb250YWluIGN1cmx5IGJyYWNlcywgdGhleSBtdXN0IGJlIGluIG1hdGNoZWQgcGFpcnMgb3IgZXNjYXBlZCB3aXRoIGEgYmFja3NsYXNoLlxuICpcbiAqIFBhcmFtZXRlciBuYW1lcyBtYXkgY29udGFpbiBvbmx5IHdvcmQgY2hhcmFjdGVycyAobGF0aW4gbGV0dGVycywgZGlnaXRzLCBhbmQgdW5kZXJzY29yZSkgYW5kXG4gKiBtdXN0IGJlIHVuaXF1ZSB3aXRoaW4gdGhlIHBhdHRlcm4gKGFjcm9zcyBib3RoIHBhdGggYW5kIHNlYXJjaCBwYXJhbWV0ZXJzKS4gRm9yIGNvbG9uXG4gKiBwbGFjZWhvbGRlcnMgb3IgY3VybHkgcGxhY2Vob2xkZXJzIHdpdGhvdXQgYW4gZXhwbGljaXQgcmVnZXhwLCBhIHBhdGggcGFyYW1ldGVyIG1hdGNoZXMgYW55XG4gKiBudW1iZXIgb2YgY2hhcmFjdGVycyBvdGhlciB0aGFuICcvJy4gRm9yIGNhdGNoLWFsbCBwbGFjZWhvbGRlcnMgdGhlIHBhdGggcGFyYW1ldGVyIG1hdGNoZXNcbiAqIGFueSBudW1iZXIgb2YgY2hhcmFjdGVycy5cbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAqIGAnL2hlbGxvLydgIC0gTWF0Y2hlcyBvbmx5IGlmIHRoZSBwYXRoIGlzIGV4YWN0bHkgJy9oZWxsby8nLiBUaGVyZSBpcyBubyBzcGVjaWFsIHRyZWF0bWVudCBmb3JcbiAqICAgdHJhaWxpbmcgc2xhc2hlcywgYW5kIHBhdHRlcm5zIGhhdmUgdG8gbWF0Y2ggdGhlIGVudGlyZSBwYXRoLCBub3QganVzdCBhIHByZWZpeC5cbiAqICogYCcvdXNlci86aWQnYCAtIE1hdGNoZXMgJy91c2VyL2JvYicgb3IgJy91c2VyLzEyMzQhISEnIG9yIGV2ZW4gJy91c2VyLycgYnV0IG5vdCAnL3VzZXInIG9yXG4gKiAgICcvdXNlci9ib2IvZGV0YWlscycuIFRoZSBzZWNvbmQgcGF0aCBzZWdtZW50IHdpbGwgYmUgY2FwdHVyZWQgYXMgdGhlIHBhcmFtZXRlciAnaWQnLlxuICogKiBgJy91c2VyL3tpZH0nYCAtIFNhbWUgYXMgdGhlIHByZXZpb3VzIGV4YW1wbGUsIGJ1dCB1c2luZyBjdXJseSBicmFjZSBzeW50YXguXG4gKiAqIGAnL3VzZXIve2lkOlteL10qfSdgIC0gU2FtZSBhcyB0aGUgcHJldmlvdXMgZXhhbXBsZS5cbiAqICogYCcvdXNlci97aWQ6WzAtOWEtZkEtRl17MSw4fX0nYCAtIFNpbWlsYXIgdG8gdGhlIHByZXZpb3VzIGV4YW1wbGUsIGJ1dCBvbmx5IG1hdGNoZXMgaWYgdGhlIGlkXG4gKiAgIHBhcmFtZXRlciBjb25zaXN0cyBvZiAxIHRvIDggaGV4IGRpZ2l0cy5cbiAqICogYCcvZmlsZXMve3BhdGg6Lip9J2AgLSBNYXRjaGVzIGFueSBVUkwgc3RhcnRpbmcgd2l0aCAnL2ZpbGVzLycgYW5kIGNhcHR1cmVzIHRoZSByZXN0IG9mIHRoZVxuICogICBwYXRoIGludG8gdGhlIHBhcmFtZXRlciAncGF0aCcuXG4gKiAqIGAnL2ZpbGVzLypwYXRoJ2AgLSBkaXR0by5cbiAqICogYCcvY2FsZW5kYXIve3N0YXJ0OmRhdGV9J2AgLSBNYXRjaGVzIFwiL2NhbGVuZGFyLzIwMTQtMTEtMTJcIiAoYmVjYXVzZSB0aGUgcGF0dGVybiBkZWZpbmVkXG4gKiAgIGluIHRoZSBidWlsdC1pbiAgYGRhdGVgIFR5cGUgbWF0Y2hlcyBgMjAxNC0xMS0xMmApIGFuZCBwcm92aWRlcyBhIERhdGUgb2JqZWN0IGluICRzdGF0ZVBhcmFtcy5zdGFydFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuICBUaGUgcGF0dGVybiB0byBjb21waWxlIGludG8gYSBtYXRjaGVyLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAgQSBjb25maWd1cmF0aW9uIG9iamVjdCBoYXNoOlxuICogQHBhcmFtIHtPYmplY3Q9fSBwYXJlbnRNYXRjaGVyIFVzZWQgdG8gY29uY2F0ZW5hdGUgdGhlIHBhdHRlcm4vY29uZmlnIG9udG9cbiAqICAgYW4gZXhpc3RpbmcgVXJsTWF0Y2hlclxuICpcbiAqICogYGNhc2VJbnNlbnNpdGl2ZWAgLSBgdHJ1ZWAgaWYgVVJMIG1hdGNoaW5nIHNob3VsZCBiZSBjYXNlIGluc2Vuc2l0aXZlLCBvdGhlcndpc2UgYGZhbHNlYCwgdGhlIGRlZmF1bHQgdmFsdWUgKGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5KSBpcyBgZmFsc2VgLlxuICogKiBgc3RyaWN0YCAtIGBmYWxzZWAgaWYgbWF0Y2hpbmcgYWdhaW5zdCBhIFVSTCB3aXRoIGEgdHJhaWxpbmcgc2xhc2ggc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZXF1aXZhbGVudCB0byBhIFVSTCB3aXRob3V0IGEgdHJhaWxpbmcgc2xhc2gsIHRoZSBkZWZhdWx0IHZhbHVlIGlzIGB0cnVlYC5cbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZ30gcHJlZml4ICBBIHN0YXRpYyBwcmVmaXggb2YgdGhpcyBwYXR0ZXJuLiBUaGUgbWF0Y2hlciBndWFyYW50ZWVzIHRoYXQgYW55XG4gKiAgIFVSTCBtYXRjaGluZyB0aGlzIG1hdGNoZXIgKGkuZS4gYW55IHN0cmluZyBmb3Igd2hpY2gge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNtZXRob2RzX2V4ZWMgZXhlYygpfSByZXR1cm5zXG4gKiAgIG5vbi1udWxsKSB3aWxsIHN0YXJ0IHdpdGggdGhpcyBwcmVmaXguXG4gKlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNvdXJjZSAgVGhlIHBhdHRlcm4gdGhhdCB3YXMgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yXG4gKlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNvdXJjZVBhdGggIFRoZSBwYXRoIHBvcnRpb24gb2YgdGhlIHNvdXJjZSBwcm9wZXJ0eVxuICpcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzb3VyY2VTZWFyY2ggIFRoZSBzZWFyY2ggcG9ydGlvbiBvZiB0aGUgc291cmNlIHByb3BlcnR5XG4gKlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHJlZ2V4ICBUaGUgY29uc3RydWN0ZWQgcmVnZXggdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWF0Y2ggYWdhaW5zdCB0aGUgdXJsIHdoZW5cbiAqICAgaXQgaXMgdGltZSB0byBkZXRlcm1pbmUgd2hpY2ggdXJsIHdpbGwgbWF0Y2guXG4gKlxuICogQHJldHVybnMge09iamVjdH0gIE5ldyBgVXJsTWF0Y2hlcmAgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIFVybE1hdGNoZXIocGF0dGVybiwgY29uZmlnLCBwYXJlbnRNYXRjaGVyKSB7XG4gIGNvbmZpZyA9IGV4dGVuZCh7IHBhcmFtczoge30gfSwgaXNPYmplY3QoY29uZmlnKSA/IGNvbmZpZyA6IHt9KTtcblxuICAvLyBGaW5kIGFsbCBwbGFjZWhvbGRlcnMgYW5kIGNyZWF0ZSBhIGNvbXBpbGVkIHBhdHRlcm4sIHVzaW5nIGVpdGhlciBjbGFzc2ljIG9yIGN1cmx5IHN5bnRheDpcbiAgLy8gICAnKicgbmFtZVxuICAvLyAgICc6JyBuYW1lXG4gIC8vICAgJ3snIG5hbWUgJ30nXG4gIC8vICAgJ3snIG5hbWUgJzonIHJlZ2V4cCAnfSdcbiAgLy8gVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBpcyBzb21ld2hhdCBjb21wbGljYXRlZCBkdWUgdG8gdGhlIG5lZWQgdG8gYWxsb3cgY3VybHkgYnJhY2VzXG4gIC8vIGluc2lkZSB0aGUgcmVndWxhciBleHByZXNzaW9uLiBUaGUgcGxhY2Vob2xkZXIgcmVnZXhwIGJyZWFrcyBkb3duIGFzIGZvbGxvd3M6XG4gIC8vICAgIChbOipdKShbXFx3XFxbXFxdXSspICAgICAgICAgICAgICAtIGNsYXNzaWMgcGxhY2Vob2xkZXIgKCQxIC8gJDIpIChzZWFyY2ggdmVyc2lvbiBoYXMgLSBmb3Igc25ha2UtY2FzZSlcbiAgLy8gICAgXFx7KFtcXHdcXFtcXF1dKykoPzpcXDpcXHMqKCAuLi4gKSk/XFx9ICAtIGN1cmx5IGJyYWNlIHBsYWNlaG9sZGVyICgkMykgd2l0aCBvcHRpb25hbCByZWdleHAvdHlwZSAuLi4gKCQ0KSAoc2VhcmNoIHZlcnNpb24gaGFzIC0gZm9yIHNuYWtlLWNhc2VcbiAgLy8gICAgKD86IC4uLiB8IC4uLiB8IC4uLiApKyAgICAgICAgIC0gdGhlIHJlZ2V4cCBjb25zaXN0cyBvZiBhbnkgbnVtYmVyIG9mIGF0b21zLCBhbiBhdG9tIGJlaW5nIGVpdGhlclxuICAvLyAgICBbXnt9XFxcXF0rICAgICAgICAgICAgICAgICAgICAgICAtIGFueXRoaW5nIG90aGVyIHRoYW4gY3VybHkgYnJhY2VzIG9yIGJhY2tzbGFzaFxuICAvLyAgICBcXFxcLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIGEgYmFja3NsYXNoIGVzY2FwZVxuICAvLyAgICBcXHsoPzpbXnt9XFxcXF0rfFxcXFwuKSpcXH0gICAgICAgICAgLSBhIG1hdGNoZWQgc2V0IG9mIGN1cmx5IGJyYWNlcyBjb250YWluaW5nIG90aGVyIGF0b21zXG4gIHZhciBwbGFjZWhvbGRlciAgICAgICA9IC8oWzoqXSkoW1xcd1xcW1xcXV0rKXxcXHsoW1xcd1xcW1xcXV0rKSg/OlxcOlxccyooKD86W157fVxcXFxdK3xcXFxcLnxcXHsoPzpbXnt9XFxcXF0rfFxcXFwuKSpcXH0pKykpP1xcfS9nLFxuICAgICAgc2VhcmNoUGxhY2Vob2xkZXIgPSAvKFs6XT8pKFtcXHdcXFtcXF0uLV0rKXxcXHsoW1xcd1xcW1xcXS4tXSspKD86XFw6XFxzKigoPzpbXnt9XFxcXF0rfFxcXFwufFxceyg/Oltee31cXFxcXSt8XFxcXC4pKlxcfSkrKSk/XFx9L2csXG4gICAgICBjb21waWxlZCA9ICdeJywgbGFzdCA9IDAsIG0sXG4gICAgICBzZWdtZW50cyA9IHRoaXMuc2VnbWVudHMgPSBbXSxcbiAgICAgIHBhcmVudFBhcmFtcyA9IHBhcmVudE1hdGNoZXIgPyBwYXJlbnRNYXRjaGVyLnBhcmFtcyA6IHt9LFxuICAgICAgcGFyYW1zID0gdGhpcy5wYXJhbXMgPSBwYXJlbnRNYXRjaGVyID8gcGFyZW50TWF0Y2hlci5wYXJhbXMuJCRuZXcoKSA6IG5ldyAkJFVNRlAuUGFyYW1TZXQoKSxcbiAgICAgIHBhcmFtTmFtZXMgPSBbXTtcblxuICBmdW5jdGlvbiBhZGRQYXJhbWV0ZXIoaWQsIHR5cGUsIGNvbmZpZywgbG9jYXRpb24pIHtcbiAgICBwYXJhbU5hbWVzLnB1c2goaWQpO1xuICAgIGlmIChwYXJlbnRQYXJhbXNbaWRdKSByZXR1cm4gcGFyZW50UGFyYW1zW2lkXTtcbiAgICBpZiAoIS9eXFx3KyhbLS5dK1xcdyspKig/OlxcW1xcXSk/JC8udGVzdChpZCkpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgcGFyYW1ldGVyIG5hbWUgJ1wiICsgaWQgKyBcIicgaW4gcGF0dGVybiAnXCIgKyBwYXR0ZXJuICsgXCInXCIpO1xuICAgIGlmIChwYXJhbXNbaWRdKSB0aHJvdyBuZXcgRXJyb3IoXCJEdXBsaWNhdGUgcGFyYW1ldGVyIG5hbWUgJ1wiICsgaWQgKyBcIicgaW4gcGF0dGVybiAnXCIgKyBwYXR0ZXJuICsgXCInXCIpO1xuICAgIHBhcmFtc1tpZF0gPSBuZXcgJCRVTUZQLlBhcmFtKGlkLCB0eXBlLCBjb25maWcsIGxvY2F0aW9uKTtcbiAgICByZXR1cm4gcGFyYW1zW2lkXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHF1b3RlUmVnRXhwKHN0cmluZywgcGF0dGVybiwgc3F1YXNoLCBvcHRpb25hbCkge1xuICAgIHZhciBzdXJyb3VuZFBhdHRlcm4gPSBbJycsJyddLCByZXN1bHQgPSBzdHJpbmcucmVwbGFjZSgvW1xcXFxcXFtcXF1cXF4kKis/LigpfHt9XS9nLCBcIlxcXFwkJlwiKTtcbiAgICBpZiAoIXBhdHRlcm4pIHJldHVybiByZXN1bHQ7XG4gICAgc3dpdGNoKHNxdWFzaCkge1xuICAgICAgY2FzZSBmYWxzZTogc3Vycm91bmRQYXR0ZXJuID0gWycoJywgJyknICsgKG9wdGlvbmFsID8gXCI/XCIgOiBcIlwiKV07IGJyZWFrO1xuICAgICAgY2FzZSB0cnVlOlxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvXFwvJC8sICcnKTtcbiAgICAgICAgc3Vycm91bmRQYXR0ZXJuID0gWycoPzpcXC8oJywgJyl8XFwvKT8nXTtcbiAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDogICAgc3Vycm91bmRQYXR0ZXJuID0gWycoJyArIHNxdWFzaCArIFwifFwiLCAnKT8nXTsgYnJlYWs7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQgKyBzdXJyb3VuZFBhdHRlcm5bMF0gKyBwYXR0ZXJuICsgc3Vycm91bmRQYXR0ZXJuWzFdO1xuICB9XG5cbiAgdGhpcy5zb3VyY2UgPSBwYXR0ZXJuO1xuXG4gIC8vIFNwbGl0IGludG8gc3RhdGljIHNlZ21lbnRzIHNlcGFyYXRlZCBieSBwYXRoIHBhcmFtZXRlciBwbGFjZWhvbGRlcnMuXG4gIC8vIFRoZSBudW1iZXIgb2Ygc2VnbWVudHMgaXMgYWx3YXlzIDEgbW9yZSB0aGFuIHRoZSBudW1iZXIgb2YgcGFyYW1ldGVycy5cbiAgZnVuY3Rpb24gbWF0Y2hEZXRhaWxzKG0sIGlzU2VhcmNoKSB7XG4gICAgdmFyIGlkLCByZWdleHAsIHNlZ21lbnQsIHR5cGUsIGNmZywgYXJyYXlNb2RlO1xuICAgIGlkICAgICAgICAgID0gbVsyXSB8fCBtWzNdOyAvLyBJRVs3OF0gcmV0dXJucyAnJyBmb3IgdW5tYXRjaGVkIGdyb3VwcyBpbnN0ZWFkIG9mIG51bGxcbiAgICBjZmcgICAgICAgICA9IGNvbmZpZy5wYXJhbXNbaWRdO1xuICAgIHNlZ21lbnQgICAgID0gcGF0dGVybi5zdWJzdHJpbmcobGFzdCwgbS5pbmRleCk7XG4gICAgcmVnZXhwICAgICAgPSBpc1NlYXJjaCA/IG1bNF0gOiBtWzRdIHx8IChtWzFdID09ICcqJyA/ICcuKicgOiBudWxsKTtcblxuICAgIGlmIChyZWdleHApIHtcbiAgICAgIHR5cGUgICAgICA9ICQkVU1GUC50eXBlKHJlZ2V4cCkgfHwgaW5oZXJpdCgkJFVNRlAudHlwZShcInN0cmluZ1wiKSwgeyBwYXR0ZXJuOiBuZXcgUmVnRXhwKHJlZ2V4cCwgY29uZmlnLmNhc2VJbnNlbnNpdGl2ZSA/ICdpJyA6IHVuZGVmaW5lZCkgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBpZCwgcmVnZXhwOiByZWdleHAsIHNlZ21lbnQ6IHNlZ21lbnQsIHR5cGU6IHR5cGUsIGNmZzogY2ZnXG4gICAgfTtcbiAgfVxuXG4gIHZhciBwLCBwYXJhbSwgc2VnbWVudDtcbiAgd2hpbGUgKChtID0gcGxhY2Vob2xkZXIuZXhlYyhwYXR0ZXJuKSkpIHtcbiAgICBwID0gbWF0Y2hEZXRhaWxzKG0sIGZhbHNlKTtcbiAgICBpZiAocC5zZWdtZW50LmluZGV4T2YoJz8nKSA+PSAwKSBicmVhazsgLy8gd2UncmUgaW50byB0aGUgc2VhcmNoIHBhcnRcblxuICAgIHBhcmFtID0gYWRkUGFyYW1ldGVyKHAuaWQsIHAudHlwZSwgcC5jZmcsIFwicGF0aFwiKTtcbiAgICBjb21waWxlZCArPSBxdW90ZVJlZ0V4cChwLnNlZ21lbnQsIHBhcmFtLnR5cGUucGF0dGVybi5zb3VyY2UsIHBhcmFtLnNxdWFzaCwgcGFyYW0uaXNPcHRpb25hbCk7XG4gICAgc2VnbWVudHMucHVzaChwLnNlZ21lbnQpO1xuICAgIGxhc3QgPSBwbGFjZWhvbGRlci5sYXN0SW5kZXg7XG4gIH1cbiAgc2VnbWVudCA9IHBhdHRlcm4uc3Vic3RyaW5nKGxhc3QpO1xuXG4gIC8vIEZpbmQgYW55IHNlYXJjaCBwYXJhbWV0ZXIgbmFtZXMgYW5kIHJlbW92ZSB0aGVtIGZyb20gdGhlIGxhc3Qgc2VnbWVudFxuICB2YXIgaSA9IHNlZ21lbnQuaW5kZXhPZignPycpO1xuXG4gIGlmIChpID49IDApIHtcbiAgICB2YXIgc2VhcmNoID0gdGhpcy5zb3VyY2VTZWFyY2ggPSBzZWdtZW50LnN1YnN0cmluZyhpKTtcbiAgICBzZWdtZW50ID0gc2VnbWVudC5zdWJzdHJpbmcoMCwgaSk7XG4gICAgdGhpcy5zb3VyY2VQYXRoID0gcGF0dGVybi5zdWJzdHJpbmcoMCwgbGFzdCArIGkpO1xuXG4gICAgaWYgKHNlYXJjaC5sZW5ndGggPiAwKSB7XG4gICAgICBsYXN0ID0gMDtcbiAgICAgIHdoaWxlICgobSA9IHNlYXJjaFBsYWNlaG9sZGVyLmV4ZWMoc2VhcmNoKSkpIHtcbiAgICAgICAgcCA9IG1hdGNoRGV0YWlscyhtLCB0cnVlKTtcbiAgICAgICAgcGFyYW0gPSBhZGRQYXJhbWV0ZXIocC5pZCwgcC50eXBlLCBwLmNmZywgXCJzZWFyY2hcIik7XG4gICAgICAgIGxhc3QgPSBwbGFjZWhvbGRlci5sYXN0SW5kZXg7XG4gICAgICAgIC8vIGNoZWNrIGlmID8mXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRoaXMuc291cmNlUGF0aCA9IHBhdHRlcm47XG4gICAgdGhpcy5zb3VyY2VTZWFyY2ggPSAnJztcbiAgfVxuXG4gIGNvbXBpbGVkICs9IHF1b3RlUmVnRXhwKHNlZ21lbnQpICsgKGNvbmZpZy5zdHJpY3QgPT09IGZhbHNlID8gJ1xcLz8nIDogJycpICsgJyQnO1xuICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuXG4gIHRoaXMucmVnZXhwID0gbmV3IFJlZ0V4cChjb21waWxlZCwgY29uZmlnLmNhc2VJbnNlbnNpdGl2ZSA/ICdpJyA6IHVuZGVmaW5lZCk7XG4gIHRoaXMucHJlZml4ID0gc2VnbWVudHNbMF07XG4gIHRoaXMuJCRwYXJhbU5hbWVzID0gcGFyYW1OYW1lcztcbn1cblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNjb25jYXRcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFJldHVybnMgYSBuZXcgbWF0Y2hlciBmb3IgYSBwYXR0ZXJuIGNvbnN0cnVjdGVkIGJ5IGFwcGVuZGluZyB0aGUgcGF0aCBwYXJ0IGFuZCBhZGRpbmcgdGhlXG4gKiBzZWFyY2ggcGFyYW1ldGVycyBvZiB0aGUgc3BlY2lmaWVkIHBhdHRlcm4gdG8gdGhpcyBwYXR0ZXJuLiBUaGUgY3VycmVudCBwYXR0ZXJuIGlzIG5vdFxuICogbW9kaWZpZWQuIFRoaXMgY2FuIGJlIHVuZGVyc3Rvb2QgYXMgY3JlYXRpbmcgYSBwYXR0ZXJuIGZvciBVUkxzIHRoYXQgYXJlIHJlbGF0aXZlIHRvIChvclxuICogc3VmZml4ZXMgb2YpIHRoZSBjdXJyZW50IHBhdHRlcm4uXG4gKlxuICogQGV4YW1wbGVcbiAqIFRoZSBmb2xsb3dpbmcgdHdvIG1hdGNoZXJzIGFyZSBlcXVpdmFsZW50OlxuICogPHByZT5cbiAqIG5ldyBVcmxNYXRjaGVyKCcvdXNlci97aWR9P3EnKS5jb25jYXQoJy9kZXRhaWxzP2RhdGUnKTtcbiAqIG5ldyBVcmxNYXRjaGVyKCcvdXNlci97aWR9L2RldGFpbHM/cSZkYXRlJyk7XG4gKiA8L3ByZT5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiAgVGhlIHBhdHRlcm4gdG8gYXBwZW5kLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAgQW4gb2JqZWN0IGhhc2ggb2YgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBtYXRjaGVyLlxuICogQHJldHVybnMge1VybE1hdGNoZXJ9ICBBIG1hdGNoZXIgZm9yIHRoZSBjb25jYXRlbmF0ZWQgcGF0dGVybi5cbiAqL1xuVXJsTWF0Y2hlci5wcm90b3R5cGUuY29uY2F0ID0gZnVuY3Rpb24gKHBhdHRlcm4sIGNvbmZpZykge1xuICAvLyBCZWNhdXNlIG9yZGVyIG9mIHNlYXJjaCBwYXJhbWV0ZXJzIGlzIGlycmVsZXZhbnQsIHdlIGNhbiBhZGQgb3VyIG93biBzZWFyY2hcbiAgLy8gcGFyYW1ldGVycyB0byB0aGUgZW5kIG9mIHRoZSBuZXcgcGF0dGVybi4gUGFyc2UgdGhlIG5ldyBwYXR0ZXJuIGJ5IGl0c2VsZlxuICAvLyBhbmQgdGhlbiBqb2luIHRoZSBiaXRzIHRvZ2V0aGVyLCBidXQgaXQncyBtdWNoIGVhc2llciB0byBkbyB0aGlzIG9uIGEgc3RyaW5nIGxldmVsLlxuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcbiAgICBjYXNlSW5zZW5zaXRpdmU6ICQkVU1GUC5jYXNlSW5zZW5zaXRpdmUoKSxcbiAgICBzdHJpY3Q6ICQkVU1GUC5zdHJpY3RNb2RlKCksXG4gICAgc3F1YXNoOiAkJFVNRlAuZGVmYXVsdFNxdWFzaFBvbGljeSgpXG4gIH07XG4gIHJldHVybiBuZXcgVXJsTWF0Y2hlcih0aGlzLnNvdXJjZVBhdGggKyBwYXR0ZXJuICsgdGhpcy5zb3VyY2VTZWFyY2gsIGV4dGVuZChkZWZhdWx0Q29uZmlnLCBjb25maWcpLCB0aGlzKTtcbn07XG5cblVybE1hdGNoZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy5zb3VyY2U7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI2V4ZWNcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRlc3RzIHRoZSBzcGVjaWZpZWQgcGF0aCBhZ2FpbnN0IHRoaXMgbWF0Y2hlciwgYW5kIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNhcHR1cmVkXG4gKiBwYXJhbWV0ZXIgdmFsdWVzLCBvciBudWxsIGlmIHRoZSBwYXRoIGRvZXMgbm90IG1hdGNoLiBUaGUgcmV0dXJuZWQgb2JqZWN0IGNvbnRhaW5zIHRoZSB2YWx1ZXNcbiAqIG9mIGFueSBzZWFyY2ggcGFyYW1ldGVycyB0aGF0IGFyZSBtZW50aW9uZWQgaW4gdGhlIHBhdHRlcm4sIGJ1dCB0aGVpciB2YWx1ZSBtYXkgYmUgbnVsbCBpZlxuICogdGhleSBhcmUgbm90IHByZXNlbnQgaW4gYHNlYXJjaFBhcmFtc2AuIFRoaXMgbWVhbnMgdGhhdCBzZWFyY2ggcGFyYW1ldGVycyBhcmUgYWx3YXlzIHRyZWF0ZWRcbiAqIGFzIG9wdGlvbmFsLlxuICpcbiAqIEBleGFtcGxlXG4gKiA8cHJlPlxuICogbmV3IFVybE1hdGNoZXIoJy91c2VyL3tpZH0/cSZyJykuZXhlYygnL3VzZXIvYm9iJywge1xuICogICB4OiAnMScsIHE6ICdoZWxsbydcbiAqIH0pO1xuICogLy8gcmV0dXJucyB7IGlkOiAnYm9iJywgcTogJ2hlbGxvJywgcjogbnVsbCB9XG4gKiA8L3ByZT5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCAgVGhlIFVSTCBwYXRoIHRvIG1hdGNoLCBlLmcuIGAkbG9jYXRpb24ucGF0aCgpYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzZWFyY2hQYXJhbXMgIFVSTCBzZWFyY2ggcGFyYW1ldGVycywgZS5nLiBgJGxvY2F0aW9uLnNlYXJjaCgpYC5cbiAqIEByZXR1cm5zIHtPYmplY3R9ICBUaGUgY2FwdHVyZWQgcGFyYW1ldGVyIHZhbHVlcy5cbiAqL1xuVXJsTWF0Y2hlci5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uIChwYXRoLCBzZWFyY2hQYXJhbXMpIHtcbiAgdmFyIG0gPSB0aGlzLnJlZ2V4cC5leGVjKHBhdGgpO1xuICBpZiAoIW0pIHJldHVybiBudWxsO1xuICBzZWFyY2hQYXJhbXMgPSBzZWFyY2hQYXJhbXMgfHwge307XG5cbiAgdmFyIHBhcmFtTmFtZXMgPSB0aGlzLnBhcmFtZXRlcnMoKSwgblRvdGFsID0gcGFyYW1OYW1lcy5sZW5ndGgsXG4gICAgblBhdGggPSB0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDEsXG4gICAgdmFsdWVzID0ge30sIGksIGosIGNmZywgcGFyYW1OYW1lO1xuXG4gIGlmIChuUGF0aCAhPT0gbS5sZW5ndGggLSAxKSB0aHJvdyBuZXcgRXJyb3IoXCJVbmJhbGFuY2VkIGNhcHR1cmUgZ3JvdXAgaW4gcm91dGUgJ1wiICsgdGhpcy5zb3VyY2UgKyBcIidcIik7XG5cbiAgZnVuY3Rpb24gZGVjb2RlUGF0aEFycmF5KHN0cmluZykge1xuICAgIGZ1bmN0aW9uIHJldmVyc2VTdHJpbmcoc3RyKSB7IHJldHVybiBzdHIuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7IH1cbiAgICBmdW5jdGlvbiB1bnF1b3RlRGFzaGVzKHN0cikgeyByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwtL2csIFwiLVwiKTsgfVxuXG4gICAgdmFyIHNwbGl0ID0gcmV2ZXJzZVN0cmluZyhzdHJpbmcpLnNwbGl0KC8tKD8hXFxcXCkvKTtcbiAgICB2YXIgYWxsUmV2ZXJzZWQgPSBtYXAoc3BsaXQsIHJldmVyc2VTdHJpbmcpO1xuICAgIHJldHVybiBtYXAoYWxsUmV2ZXJzZWQsIHVucXVvdGVEYXNoZXMpLnJldmVyc2UoKTtcbiAgfVxuXG4gIHZhciBwYXJhbSwgcGFyYW1WYWw7XG4gIGZvciAoaSA9IDA7IGkgPCBuUGF0aDsgaSsrKSB7XG4gICAgcGFyYW1OYW1lID0gcGFyYW1OYW1lc1tpXTtcbiAgICBwYXJhbSA9IHRoaXMucGFyYW1zW3BhcmFtTmFtZV07XG4gICAgcGFyYW1WYWwgPSBtW2krMV07XG4gICAgLy8gaWYgdGhlIHBhcmFtIHZhbHVlIG1hdGNoZXMgYSBwcmUtcmVwbGFjZSBwYWlyLCByZXBsYWNlIHRoZSB2YWx1ZSBiZWZvcmUgZGVjb2RpbmcuXG4gICAgZm9yIChqID0gMDsgaiA8IHBhcmFtLnJlcGxhY2UubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChwYXJhbS5yZXBsYWNlW2pdLmZyb20gPT09IHBhcmFtVmFsKSBwYXJhbVZhbCA9IHBhcmFtLnJlcGxhY2Vbal0udG87XG4gICAgfVxuICAgIGlmIChwYXJhbVZhbCAmJiBwYXJhbS5hcnJheSA9PT0gdHJ1ZSkgcGFyYW1WYWwgPSBkZWNvZGVQYXRoQXJyYXkocGFyYW1WYWwpO1xuICAgIGlmIChpc0RlZmluZWQocGFyYW1WYWwpKSBwYXJhbVZhbCA9IHBhcmFtLnR5cGUuZGVjb2RlKHBhcmFtVmFsKTtcbiAgICB2YWx1ZXNbcGFyYW1OYW1lXSA9IHBhcmFtLnZhbHVlKHBhcmFtVmFsKTtcbiAgfVxuICBmb3IgKC8qKi87IGkgPCBuVG90YWw7IGkrKykge1xuICAgIHBhcmFtTmFtZSA9IHBhcmFtTmFtZXNbaV07XG4gICAgdmFsdWVzW3BhcmFtTmFtZV0gPSB0aGlzLnBhcmFtc1twYXJhbU5hbWVdLnZhbHVlKHNlYXJjaFBhcmFtc1twYXJhbU5hbWVdKTtcbiAgICBwYXJhbSA9IHRoaXMucGFyYW1zW3BhcmFtTmFtZV07XG4gICAgcGFyYW1WYWwgPSBzZWFyY2hQYXJhbXNbcGFyYW1OYW1lXTtcbiAgICBmb3IgKGogPSAwOyBqIDwgcGFyYW0ucmVwbGFjZS5sZW5ndGg7IGorKykge1xuICAgICAgaWYgKHBhcmFtLnJlcGxhY2Vbal0uZnJvbSA9PT0gcGFyYW1WYWwpIHBhcmFtVmFsID0gcGFyYW0ucmVwbGFjZVtqXS50bztcbiAgICB9XG4gICAgaWYgKGlzRGVmaW5lZChwYXJhbVZhbCkpIHBhcmFtVmFsID0gcGFyYW0udHlwZS5kZWNvZGUocGFyYW1WYWwpO1xuICAgIHZhbHVlc1twYXJhbU5hbWVdID0gcGFyYW0udmFsdWUocGFyYW1WYWwpO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIjcGFyYW1ldGVyc1xuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogUmV0dXJucyB0aGUgbmFtZXMgb2YgYWxsIHBhdGggYW5kIHNlYXJjaCBwYXJhbWV0ZXJzIG9mIHRoaXMgcGF0dGVybiBpbiBhbiB1bnNwZWNpZmllZCBvcmRlci5cbiAqXG4gKiBAcmV0dXJucyB7QXJyYXkuPHN0cmluZz59ICBBbiBhcnJheSBvZiBwYXJhbWV0ZXIgbmFtZXMuIE11c3QgYmUgdHJlYXRlZCBhcyByZWFkLW9ubHkuIElmIHRoZVxuICogICAgcGF0dGVybiBoYXMgbm8gcGFyYW1ldGVycywgYW4gZW1wdHkgYXJyYXkgaXMgcmV0dXJuZWQuXG4gKi9cblVybE1hdGNoZXIucHJvdG90eXBlLnBhcmFtZXRlcnMgPSBmdW5jdGlvbiAocGFyYW0pIHtcbiAgaWYgKCFpc0RlZmluZWQocGFyYW0pKSByZXR1cm4gdGhpcy4kJHBhcmFtTmFtZXM7XG4gIHJldHVybiB0aGlzLnBhcmFtc1twYXJhbV0gfHwgbnVsbDtcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIjdmFsaWRhdGVzXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDaGVja3MgYW4gb2JqZWN0IGhhc2ggb2YgcGFyYW1ldGVycyB0byB2YWxpZGF0ZSB0aGVpciBjb3JyZWN0bmVzcyBhY2NvcmRpbmcgdG8gdGhlIHBhcmFtZXRlclxuICogdHlwZXMgb2YgdGhpcyBgVXJsTWF0Y2hlcmAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhcmFtcyBUaGUgb2JqZWN0IGhhc2ggb2YgcGFyYW1ldGVycyB0byB2YWxpZGF0ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgcGFyYW1zYCB2YWxpZGF0ZXMsIG90aGVyd2lzZSBgZmFsc2VgLlxuICovXG5VcmxNYXRjaGVyLnByb3RvdHlwZS52YWxpZGF0ZXMgPSBmdW5jdGlvbiAocGFyYW1zKSB7XG4gIHJldHVybiB0aGlzLnBhcmFtcy4kJHZhbGlkYXRlcyhwYXJhbXMpO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNmb3JtYXRcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENyZWF0ZXMgYSBVUkwgdGhhdCBtYXRjaGVzIHRoaXMgcGF0dGVybiBieSBzdWJzdGl0dXRpbmcgdGhlIHNwZWNpZmllZCB2YWx1ZXNcbiAqIGZvciB0aGUgcGF0aCBhbmQgc2VhcmNoIHBhcmFtZXRlcnMuIE51bGwgdmFsdWVzIGZvciBwYXRoIHBhcmFtZXRlcnMgYXJlXG4gKiB0cmVhdGVkIGFzIGVtcHR5IHN0cmluZ3MuXG4gKlxuICogQGV4YW1wbGVcbiAqIDxwcmU+XG4gKiBuZXcgVXJsTWF0Y2hlcignL3VzZXIve2lkfT9xJykuZm9ybWF0KHsgaWQ6J2JvYicsIHE6J3llcycgfSk7XG4gKiAvLyByZXR1cm5zICcvdXNlci9ib2I/cT15ZXMnXG4gKiA8L3ByZT5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVzICB0aGUgdmFsdWVzIHRvIHN1YnN0aXR1dGUgZm9yIHRoZSBwYXJhbWV0ZXJzIGluIHRoaXMgcGF0dGVybi5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICB0aGUgZm9ybWF0dGVkIFVSTCAocGF0aCBhbmQgb3B0aW9uYWxseSBzZWFyY2ggcGFydCkuXG4gKi9cblVybE1hdGNoZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgdmFsdWVzID0gdmFsdWVzIHx8IHt9O1xuICB2YXIgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzLCBwYXJhbXMgPSB0aGlzLnBhcmFtZXRlcnMoKSwgcGFyYW1zZXQgPSB0aGlzLnBhcmFtcztcbiAgaWYgKCF0aGlzLnZhbGlkYXRlcyh2YWx1ZXMpKSByZXR1cm4gbnVsbDtcblxuICB2YXIgaSwgc2VhcmNoID0gZmFsc2UsIG5QYXRoID0gc2VnbWVudHMubGVuZ3RoIC0gMSwgblRvdGFsID0gcGFyYW1zLmxlbmd0aCwgcmVzdWx0ID0gc2VnbWVudHNbMF07XG5cbiAgZnVuY3Rpb24gZW5jb2RlRGFzaGVzKHN0cikgeyAvLyBSZXBsYWNlIGRhc2hlcyB3aXRoIGVuY29kZWQgXCJcXC1cIlxuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoc3RyKS5yZXBsYWNlKC8tL2csIGZ1bmN0aW9uKGMpIHsgcmV0dXJuICclNUMlJyArIGMuY2hhckNvZGVBdCgwKS50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTsgfSk7XG4gIH1cblxuICBmb3IgKGkgPSAwOyBpIDwgblRvdGFsOyBpKyspIHtcbiAgICB2YXIgaXNQYXRoUGFyYW0gPSBpIDwgblBhdGg7XG4gICAgdmFyIG5hbWUgPSBwYXJhbXNbaV0sIHBhcmFtID0gcGFyYW1zZXRbbmFtZV0sIHZhbHVlID0gcGFyYW0udmFsdWUodmFsdWVzW25hbWVdKTtcbiAgICB2YXIgaXNEZWZhdWx0VmFsdWUgPSBwYXJhbS5pc09wdGlvbmFsICYmIHBhcmFtLnR5cGUuZXF1YWxzKHBhcmFtLnZhbHVlKCksIHZhbHVlKTtcbiAgICB2YXIgc3F1YXNoID0gaXNEZWZhdWx0VmFsdWUgPyBwYXJhbS5zcXVhc2ggOiBmYWxzZTtcbiAgICB2YXIgZW5jb2RlZCA9IHBhcmFtLnR5cGUuZW5jb2RlKHZhbHVlKTtcblxuICAgIGlmIChpc1BhdGhQYXJhbSkge1xuICAgICAgdmFyIG5leHRTZWdtZW50ID0gc2VnbWVudHNbaSArIDFdO1xuICAgICAgdmFyIGlzRmluYWxQYXRoUGFyYW0gPSBpICsgMSA9PT0gblBhdGg7XG5cbiAgICAgIGlmIChzcXVhc2ggPT09IGZhbHNlKSB7XG4gICAgICAgIGlmIChlbmNvZGVkICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAoaXNBcnJheShlbmNvZGVkKSkge1xuICAgICAgICAgICAgcmVzdWx0ICs9IG1hcChlbmNvZGVkLCBlbmNvZGVEYXNoZXMpLmpvaW4oXCItXCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gZW5jb2RlVVJJQ29tcG9uZW50KGVuY29kZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgKz0gbmV4dFNlZ21lbnQ7XG4gICAgICB9IGVsc2UgaWYgKHNxdWFzaCA9PT0gdHJ1ZSkge1xuICAgICAgICB2YXIgY2FwdHVyZSA9IHJlc3VsdC5tYXRjaCgvXFwvJC8pID8gL1xcLz8oLiopLyA6IC8oLiopLztcbiAgICAgICAgcmVzdWx0ICs9IG5leHRTZWdtZW50Lm1hdGNoKGNhcHR1cmUpWzFdO1xuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZyhzcXVhc2gpKSB7XG4gICAgICAgIHJlc3VsdCArPSBzcXVhc2ggKyBuZXh0U2VnbWVudDtcbiAgICAgIH1cblxuICAgICAgaWYgKGlzRmluYWxQYXRoUGFyYW0gJiYgcGFyYW0uc3F1YXNoID09PSB0cnVlICYmIHJlc3VsdC5zbGljZSgtMSkgPT09ICcvJykgcmVzdWx0ID0gcmVzdWx0LnNsaWNlKDAsIC0xKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGVuY29kZWQgPT0gbnVsbCB8fCAoaXNEZWZhdWx0VmFsdWUgJiYgc3F1YXNoICE9PSBmYWxzZSkpIGNvbnRpbnVlO1xuICAgICAgaWYgKCFpc0FycmF5KGVuY29kZWQpKSBlbmNvZGVkID0gWyBlbmNvZGVkIF07XG4gICAgICBpZiAoZW5jb2RlZC5sZW5ndGggPT09IDApIGNvbnRpbnVlO1xuICAgICAgZW5jb2RlZCA9IG1hcChlbmNvZGVkLCBlbmNvZGVVUklDb21wb25lbnQpLmpvaW4oJyYnICsgbmFtZSArICc9Jyk7XG4gICAgICByZXN1bHQgKz0gKHNlYXJjaCA/ICcmJyA6ICc/JykgKyAobmFtZSArICc9JyArIGVuY29kZWQpO1xuICAgICAgc2VhcmNoID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEltcGxlbWVudHMgYW4gaW50ZXJmYWNlIHRvIGRlZmluZSBjdXN0b20gcGFyYW1ldGVyIHR5cGVzIHRoYXQgY2FuIGJlIGRlY29kZWQgZnJvbSBhbmQgZW5jb2RlZCB0b1xuICogc3RyaW5nIHBhcmFtZXRlcnMgbWF0Y2hlZCBpbiBhIFVSTC4gVXNlZCBieSB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIGBVcmxNYXRjaGVyYH1cbiAqIG9iamVjdHMgd2hlbiBtYXRjaGluZyBvciBmb3JtYXR0aW5nIFVSTHMsIG9yIGNvbXBhcmluZyBvciB2YWxpZGF0aW5nIHBhcmFtZXRlciB2YWx1ZXMuXG4gKlxuICogU2VlIHtAbGluayB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnkjbWV0aG9kc190eXBlIGAkdXJsTWF0Y2hlckZhY3RvcnkjdHlwZSgpYH0gZm9yIG1vcmVcbiAqIGluZm9ybWF0aW9uIG9uIHJlZ2lzdGVyaW5nIGN1c3RvbSB0eXBlcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnICBBIGNvbmZpZ3VyYXRpb24gb2JqZWN0IHdoaWNoIGNvbnRhaW5zIHRoZSBjdXN0b20gdHlwZSBkZWZpbml0aW9uLiAgVGhlIG9iamVjdCdzXG4gKiAgICAgICAgcHJvcGVydGllcyB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG1ldGhvZHMgYW5kL29yIHBhdHRlcm4gaW4gYFR5cGVgJ3MgcHVibGljIGludGVyZmFjZS5cbiAqIEBleGFtcGxlXG4gKiA8cHJlPlxuICoge1xuICogICBkZWNvZGU6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCk7IH0sXG4gKiAgIGVuY29kZTogZnVuY3Rpb24odmFsKSB7IHJldHVybiB2YWwgJiYgdmFsLnRvU3RyaW5nKCk7IH0sXG4gKiAgIGVxdWFsczogZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gdGhpcy5pcyhhKSAmJiBhID09PSBiOyB9LFxuICogICBpczogZnVuY3Rpb24odmFsKSB7IHJldHVybiBhbmd1bGFyLmlzTnVtYmVyKHZhbCkgaXNGaW5pdGUodmFsKSAmJiB2YWwgJSAxID09PSAwOyB9LFxuICogICBwYXR0ZXJuOiAvXFxkKy9cbiAqIH1cbiAqIDwvcHJlPlxuICpcbiAqIEBwcm9wZXJ0eSB7UmVnRXhwfSBwYXR0ZXJuIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gcGF0dGVybiB1c2VkIHRvIG1hdGNoIHZhbHVlcyBvZiB0aGlzIHR5cGUgd2hlblxuICogICAgICAgICAgIGNvbWluZyBmcm9tIGEgc3Vic3RyaW5nIG9mIGEgVVJMLlxuICpcbiAqIEByZXR1cm5zIHtPYmplY3R9ICBSZXR1cm5zIGEgbmV3IGBUeXBlYCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIFR5cGUoY29uZmlnKSB7XG4gIGV4dGVuZCh0aGlzLCBjb25maWcpO1xufVxuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlI2lzXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBEZXRlY3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyBvZiBhIHBhcnRpY3VsYXIgdHlwZS4gQWNjZXB0cyBhIG5hdGl2ZSAoZGVjb2RlZCkgdmFsdWVcbiAqIGFuZCBkZXRlcm1pbmVzIHdoZXRoZXIgaXQgbWF0Y2hlcyB0aGUgY3VycmVudCBgVHlwZWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsICBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5ICBPcHRpb25hbC4gSWYgdGhlIHR5cGUgY2hlY2sgaXMgaGFwcGVuaW5nIGluIHRoZSBjb250ZXh0IG9mIGEgc3BlY2lmaWNcbiAqICAgICAgICB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIGBVcmxNYXRjaGVyYH0gb2JqZWN0LCB0aGlzIGlzIHRoZSBuYW1lIG9mIHRoZVxuICogICAgICAgIHBhcmFtZXRlciBpbiB3aGljaCBgdmFsYCBpcyBzdG9yZWQuIENhbiBiZSB1c2VkIGZvciBtZXRhLXByb2dyYW1taW5nIG9mIGBUeXBlYCBvYmplY3RzLlxuICogQHJldHVybnMge0Jvb2xlYW59ICBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyB0aGUgdHlwZSwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKi9cblR5cGUucHJvdG90eXBlLmlzID0gZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlI2VuY29kZVxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRW5jb2RlcyBhIGN1c3RvbS9uYXRpdmUgdHlwZSB2YWx1ZSB0byBhIHN0cmluZyB0aGF0IGNhbiBiZSBlbWJlZGRlZCBpbiBhIFVSTC4gTm90ZSB0aGF0IHRoZVxuICogcmV0dXJuIHZhbHVlIGRvZXMgKm5vdCogbmVlZCB0byBiZSBVUkwtc2FmZSAoaS5lLiBwYXNzZWQgdGhyb3VnaCBgZW5jb2RlVVJJQ29tcG9uZW50KClgKSwgaXRcbiAqIG9ubHkgbmVlZHMgdG8gYmUgYSByZXByZXNlbnRhdGlvbiBvZiBgdmFsYCB0aGF0IGhhcyBiZWVuIGNvZXJjZWQgdG8gYSBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHsqfSB2YWwgIFRoZSB2YWx1ZSB0byBlbmNvZGUuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5ICBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIGluIHdoaWNoIGB2YWxgIGlzIHN0b3JlZC4gQ2FuIGJlIHVzZWQgZm9yXG4gKiAgICAgICAgbWV0YS1wcm9ncmFtbWluZyBvZiBgVHlwZWAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtzdHJpbmd9ICBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGB2YWxgIHRoYXQgY2FuIGJlIGVuY29kZWQgaW4gYSBVUkwuXG4gKi9cblR5cGUucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKHZhbCwga2V5KSB7XG4gIHJldHVybiB2YWw7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlI2RlY29kZVxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQ29udmVydHMgYSBwYXJhbWV0ZXIgdmFsdWUgKGZyb20gVVJMIHN0cmluZyBvciB0cmFuc2l0aW9uIHBhcmFtKSB0byBhIGN1c3RvbS9uYXRpdmUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHZhbCAgVGhlIFVSTCBwYXJhbWV0ZXIgdmFsdWUgdG8gZGVjb2RlLlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSAgVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciBpbiB3aGljaCBgdmFsYCBpcyBzdG9yZWQuIENhbiBiZSB1c2VkIGZvclxuICogICAgICAgIG1ldGEtcHJvZ3JhbW1pbmcgb2YgYFR5cGVgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7Kn0gIFJldHVybnMgYSBjdXN0b20gcmVwcmVzZW50YXRpb24gb2YgdGhlIFVSTCBwYXJhbWV0ZXIgdmFsdWUuXG4gKi9cblR5cGUucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uKHZhbCwga2V5KSB7XG4gIHJldHVybiB2YWw7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlI2VxdWFsc1xuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHR3byBkZWNvZGVkIHZhbHVlcyBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0geyp9IGEgIEEgdmFsdWUgdG8gY29tcGFyZSBhZ2FpbnN0LlxuICogQHBhcmFtIHsqfSBiICBBIHZhbHVlIHRvIGNvbXBhcmUgYWdhaW5zdC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAgUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudC9lcXVhbCwgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gKi9cblR5cGUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEgPT0gYjtcbn07XG5cblR5cGUucHJvdG90eXBlLiRzdWJQYXR0ZXJuID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdWIgPSB0aGlzLnBhdHRlcm4udG9TdHJpbmcoKTtcbiAgcmV0dXJuIHN1Yi5zdWJzdHIoMSwgc3ViLmxlbmd0aCAtIDIpO1xufTtcblxuVHlwZS5wcm90b3R5cGUucGF0dGVybiA9IC8uKi87XG5cblR5cGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBcIntUeXBlOlwiICsgdGhpcy5uYW1lICsgXCJ9XCI7IH07XG5cbi8qKiBHaXZlbiBhbiBlbmNvZGVkIHN0cmluZywgb3IgYSBkZWNvZGVkIG9iamVjdCwgcmV0dXJucyBhIGRlY29kZWQgb2JqZWN0ICovXG5UeXBlLnByb3RvdHlwZS4kbm9ybWFsaXplID0gZnVuY3Rpb24odmFsKSB7XG4gIHJldHVybiB0aGlzLmlzKHZhbCkgPyB2YWwgOiB0aGlzLmRlY29kZSh2YWwpO1xufTtcblxuLypcbiAqIFdyYXBzIGFuIGV4aXN0aW5nIGN1c3RvbSBUeXBlIGFzIGFuIGFycmF5IG9mIFR5cGUsIGRlcGVuZGluZyBvbiAnbW9kZScuXG4gKiBlLmcuOlxuICogLSB1cmxtYXRjaGVyIHBhdHRlcm4gXCIvcGF0aD97cXVlcnlQYXJhbVtdOmludH1cIlxuICogLSB1cmw6IFwiL3BhdGg/cXVlcnlQYXJhbT0xJnF1ZXJ5UGFyYW09MlxuICogLSAkc3RhdGVQYXJhbXMucXVlcnlQYXJhbSB3aWxsIGJlIFsxLCAyXVxuICogaWYgYG1vZGVgIGlzIFwiYXV0b1wiLCB0aGVuXG4gKiAtIHVybDogXCIvcGF0aD9xdWVyeVBhcmFtPTEgd2lsbCBjcmVhdGUgJHN0YXRlUGFyYW1zLnF1ZXJ5UGFyYW06IDFcbiAqIC0gdXJsOiBcIi9wYXRoP3F1ZXJ5UGFyYW09MSZxdWVyeVBhcmFtPTIgd2lsbCBjcmVhdGUgJHN0YXRlUGFyYW1zLnF1ZXJ5UGFyYW06IFsxLCAyXVxuICovXG5UeXBlLnByb3RvdHlwZS4kYXNBcnJheSA9IGZ1bmN0aW9uKG1vZGUsIGlzU2VhcmNoKSB7XG4gIGlmICghbW9kZSkgcmV0dXJuIHRoaXM7XG4gIGlmIChtb2RlID09PSBcImF1dG9cIiAmJiAhaXNTZWFyY2gpIHRocm93IG5ldyBFcnJvcihcIidhdXRvJyBhcnJheSBtb2RlIGlzIGZvciBxdWVyeSBwYXJhbWV0ZXJzIG9ubHlcIik7XG5cbiAgZnVuY3Rpb24gQXJyYXlUeXBlKHR5cGUsIG1vZGUpIHtcbiAgICBmdW5jdGlvbiBiaW5kVG8odHlwZSwgY2FsbGJhY2tOYW1lKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0eXBlW2NhbGxiYWNrTmFtZV0uYXBwbHkodHlwZSwgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gV3JhcCBub24tYXJyYXkgdmFsdWUgYXMgYXJyYXlcbiAgICBmdW5jdGlvbiBhcnJheVdyYXAodmFsKSB7IHJldHVybiBpc0FycmF5KHZhbCkgPyB2YWwgOiAoaXNEZWZpbmVkKHZhbCkgPyBbIHZhbCBdIDogW10pOyB9XG4gICAgLy8gVW53cmFwIGFycmF5IHZhbHVlIGZvciBcImF1dG9cIiBtb2RlLiBSZXR1cm4gdW5kZWZpbmVkIGZvciBlbXB0eSBhcnJheS5cbiAgICBmdW5jdGlvbiBhcnJheVVud3JhcCh2YWwpIHtcbiAgICAgIHN3aXRjaCh2YWwubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMDogcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gbW9kZSA9PT0gXCJhdXRvXCIgPyB2YWxbMF0gOiB2YWw7XG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiB2YWw7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGZhbHNleSh2YWwpIHsgcmV0dXJuICF2YWw7IH1cblxuICAgIC8vIFdyYXBzIHR5cGUgKC5pcy8uZW5jb2RlLy5kZWNvZGUpIGZ1bmN0aW9ucyB0byBvcGVyYXRlIG9uIGVhY2ggdmFsdWUgb2YgYW4gYXJyYXlcbiAgICBmdW5jdGlvbiBhcnJheUhhbmRsZXIoY2FsbGJhY2ssIGFsbFRydXRoeU1vZGUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBoYW5kbGVBcnJheSh2YWwpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkodmFsKSAmJiB2YWwubGVuZ3RoID09PSAwKSByZXR1cm4gdmFsO1xuICAgICAgICB2YWwgPSBhcnJheVdyYXAodmFsKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1hcCh2YWwsIGNhbGxiYWNrKTtcbiAgICAgICAgaWYgKGFsbFRydXRoeU1vZGUgPT09IHRydWUpXG4gICAgICAgICAgcmV0dXJuIGZpbHRlcihyZXN1bHQsIGZhbHNleSkubGVuZ3RoID09PSAwO1xuICAgICAgICByZXR1cm4gYXJyYXlVbndyYXAocmVzdWx0KTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gV3JhcHMgdHlwZSAoLmVxdWFscykgZnVuY3Rpb25zIHRvIG9wZXJhdGUgb24gZWFjaCB2YWx1ZSBvZiBhbiBhcnJheVxuICAgIGZ1bmN0aW9uIGFycmF5RXF1YWxzSGFuZGxlcihjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZUFycmF5KHZhbDEsIHZhbDIpIHtcbiAgICAgICAgdmFyIGxlZnQgPSBhcnJheVdyYXAodmFsMSksIHJpZ2h0ID0gYXJyYXlXcmFwKHZhbDIpO1xuICAgICAgICBpZiAobGVmdC5sZW5ndGggIT09IHJpZ2h0Lmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlZnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoIWNhbGxiYWNrKGxlZnRbaV0sIHJpZ2h0W2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICB0aGlzLmVuY29kZSA9IGFycmF5SGFuZGxlcihiaW5kVG8odHlwZSwgJ2VuY29kZScpKTtcbiAgICB0aGlzLmRlY29kZSA9IGFycmF5SGFuZGxlcihiaW5kVG8odHlwZSwgJ2RlY29kZScpKTtcbiAgICB0aGlzLmlzICAgICA9IGFycmF5SGFuZGxlcihiaW5kVG8odHlwZSwgJ2lzJyksIHRydWUpO1xuICAgIHRoaXMuZXF1YWxzID0gYXJyYXlFcXVhbHNIYW5kbGVyKGJpbmRUbyh0eXBlLCAnZXF1YWxzJykpO1xuICAgIHRoaXMucGF0dGVybiA9IHR5cGUucGF0dGVybjtcbiAgICB0aGlzLiRub3JtYWxpemUgPSBhcnJheUhhbmRsZXIoYmluZFRvKHR5cGUsICckbm9ybWFsaXplJykpO1xuICAgIHRoaXMubmFtZSA9IHR5cGUubmFtZTtcbiAgICB0aGlzLiRhcnJheU1vZGUgPSBtb2RlO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBBcnJheVR5cGUodGhpcywgbW9kZSk7XG59O1xuXG5cblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEZhY3RvcnkgZm9yIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfSBpbnN0YW5jZXMuIFRoZSBmYWN0b3J5XG4gKiBpcyBhbHNvIGF2YWlsYWJsZSB0byBwcm92aWRlcnMgdW5kZXIgdGhlIG5hbWUgYCR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyYC5cbiAqL1xuZnVuY3Rpb24gJFVybE1hdGNoZXJGYWN0b3J5KCkge1xuICAkJFVNRlAgPSB0aGlzO1xuXG4gIHZhciBpc0Nhc2VJbnNlbnNpdGl2ZSA9IGZhbHNlLCBpc1N0cmljdE1vZGUgPSB0cnVlLCBkZWZhdWx0U3F1YXNoUG9saWN5ID0gZmFsc2U7XG5cbiAgLy8gVXNlIHRpbGRlcyB0byBwcmUtZW5jb2RlIHNsYXNoZXMuXG4gIC8vIElmIHRoZSBzbGFzaGVzIGFyZSBzaW1wbHkgVVJMRW5jb2RlZCwgdGhlIGJyb3dzZXIgY2FuIGNob29zZSB0byBwcmUtZGVjb2RlIHRoZW0sXG4gIC8vIGFuZCBiaWRpcmVjdGlvbmFsIGVuY29kaW5nL2RlY29kaW5nIGZhaWxzLlxuICAvLyBUaWxkZSB3YXMgY2hvc2VuIGJlY2F1c2UgaXQncyBub3QgYSBSRkMgMzk4NiBzZWN0aW9uIDIuMiBSZXNlcnZlZCBDaGFyYWN0ZXJcbiAgZnVuY3Rpb24gdmFsVG9TdHJpbmcodmFsKSB7IHJldHVybiB2YWwgIT0gbnVsbCA/IHZhbC50b1N0cmluZygpLnJlcGxhY2UoL34vZywgXCJ+flwiKS5yZXBsYWNlKC9cXC8vZywgXCJ+MkZcIikgOiB2YWw7IH1cbiAgZnVuY3Rpb24gdmFsRnJvbVN0cmluZyh2YWwpIHsgcmV0dXJuIHZhbCAhPSBudWxsID8gdmFsLnRvU3RyaW5nKCkucmVwbGFjZSgvfjJGL2csIFwiL1wiKS5yZXBsYWNlKC9+fi9nLCBcIn5cIikgOiB2YWw7IH1cblxuICB2YXIgJHR5cGVzID0ge30sIGVucXVldWUgPSB0cnVlLCB0eXBlUXVldWUgPSBbXSwgaW5qZWN0b3IsIGRlZmF1bHRUeXBlcyA9IHtcbiAgICBcInN0cmluZ1wiOiB7XG4gICAgICBlbmNvZGU6IHZhbFRvU3RyaW5nLFxuICAgICAgZGVjb2RlOiB2YWxGcm9tU3RyaW5nLFxuICAgICAgLy8gVE9ETzogaW4gMS4wLCBtYWtlIHN0cmluZyAuaXMoKSByZXR1cm4gZmFsc2UgaWYgdmFsdWUgaXMgdW5kZWZpbmVkL251bGwgYnkgZGVmYXVsdC5cbiAgICAgIC8vIEluIDAuMi54LCBzdHJpbmcgcGFyYW1zIGFyZSBvcHRpb25hbCBieSBkZWZhdWx0IGZvciBiYWNrd2FyZHMgY29tcGF0XG4gICAgICBpczogZnVuY3Rpb24odmFsKSB7IHJldHVybiB2YWwgPT0gbnVsbCB8fCAhaXNEZWZpbmVkKHZhbCkgfHwgdHlwZW9mIHZhbCA9PT0gXCJzdHJpbmdcIjsgfSxcbiAgICAgIHBhdHRlcm46IC9bXi9dKi9cbiAgICB9LFxuICAgIFwiaW50XCI6IHtcbiAgICAgIGVuY29kZTogdmFsVG9TdHJpbmcsXG4gICAgICBkZWNvZGU6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCk7IH0sXG4gICAgICBpczogZnVuY3Rpb24odmFsKSB7IHJldHVybiBpc0RlZmluZWQodmFsKSAmJiB0aGlzLmRlY29kZSh2YWwudG9TdHJpbmcoKSkgPT09IHZhbDsgfSxcbiAgICAgIHBhdHRlcm46IC9cXGQrL1xuICAgIH0sXG4gICAgXCJib29sXCI6IHtcbiAgICAgIGVuY29kZTogZnVuY3Rpb24odmFsKSB7IHJldHVybiB2YWwgPyAxIDogMDsgfSxcbiAgICAgIGRlY29kZTogZnVuY3Rpb24odmFsKSB7IHJldHVybiBwYXJzZUludCh2YWwsIDEwKSAhPT0gMDsgfSxcbiAgICAgIGlzOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCA9PT0gdHJ1ZSB8fCB2YWwgPT09IGZhbHNlOyB9LFxuICAgICAgcGF0dGVybjogLzB8MS9cbiAgICB9LFxuICAgIFwiZGF0ZVwiOiB7XG4gICAgICBlbmNvZGU6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzKHZhbCkpXG4gICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuIFsgdmFsLmdldEZ1bGxZZWFyKCksXG4gICAgICAgICAgKCcwJyArICh2YWwuZ2V0TW9udGgoKSArIDEpKS5zbGljZSgtMiksXG4gICAgICAgICAgKCcwJyArIHZhbC5nZXREYXRlKCkpLnNsaWNlKC0yKVxuICAgICAgICBdLmpvaW4oXCItXCIpO1xuICAgICAgfSxcbiAgICAgIGRlY29kZTogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICBpZiAodGhpcy5pcyh2YWwpKSByZXR1cm4gdmFsO1xuICAgICAgICB2YXIgbWF0Y2ggPSB0aGlzLmNhcHR1cmUuZXhlYyh2YWwpO1xuICAgICAgICByZXR1cm4gbWF0Y2ggPyBuZXcgRGF0ZShtYXRjaFsxXSwgbWF0Y2hbMl0gLSAxLCBtYXRjaFszXSkgOiB1bmRlZmluZWQ7XG4gICAgICB9LFxuICAgICAgaXM6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gdmFsIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4odmFsLnZhbHVlT2YoKSk7IH0sXG4gICAgICBlcXVhbHM6IGZ1bmN0aW9uIChhLCBiKSB7IHJldHVybiB0aGlzLmlzKGEpICYmIHRoaXMuaXMoYikgJiYgYS50b0lTT1N0cmluZygpID09PSBiLnRvSVNPU3RyaW5nKCk7IH0sXG4gICAgICBwYXR0ZXJuOiAvWzAtOV17NH0tKD86MFsxLTldfDFbMC0yXSktKD86MFsxLTldfFsxLTJdWzAtOV18M1swLTFdKS8sXG4gICAgICBjYXB0dXJlOiAvKFswLTldezR9KS0oMFsxLTldfDFbMC0yXSktKDBbMS05XXxbMS0yXVswLTldfDNbMC0xXSkvXG4gICAgfSxcbiAgICBcImpzb25cIjoge1xuICAgICAgZW5jb2RlOiBhbmd1bGFyLnRvSnNvbixcbiAgICAgIGRlY29kZTogYW5ndWxhci5mcm9tSnNvbixcbiAgICAgIGlzOiBhbmd1bGFyLmlzT2JqZWN0LFxuICAgICAgZXF1YWxzOiBhbmd1bGFyLmVxdWFscyxcbiAgICAgIHBhdHRlcm46IC9bXi9dKi9cbiAgICB9LFxuICAgIFwiYW55XCI6IHsgLy8gZG9lcyBub3QgZW5jb2RlL2RlY29kZVxuICAgICAgZW5jb2RlOiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgZGVjb2RlOiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgZXF1YWxzOiBhbmd1bGFyLmVxdWFscyxcbiAgICAgIHBhdHRlcm46IC8uKi9cbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0RGVmYXVsdENvbmZpZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RyaWN0OiBpc1N0cmljdE1vZGUsXG4gICAgICBjYXNlSW5zZW5zaXRpdmU6IGlzQ2FzZUluc2Vuc2l0aXZlXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzSW5qZWN0YWJsZSh2YWx1ZSkge1xuICAgIHJldHVybiAoaXNGdW5jdGlvbih2YWx1ZSkgfHwgKGlzQXJyYXkodmFsdWUpICYmIGlzRnVuY3Rpb24odmFsdWVbdmFsdWUubGVuZ3RoIC0gMV0pKSk7XG4gIH1cblxuICAvKipcbiAgICogW0ludGVybmFsXSBHZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgYSBwYXJhbWV0ZXIsIHdoaWNoIG1heSBiZSBhbiBpbmplY3RhYmxlIGZ1bmN0aW9uLlxuICAgKi9cbiAgJFVybE1hdGNoZXJGYWN0b3J5LiQkZ2V0RGVmYXVsdFZhbHVlID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gICAgaWYgKCFpc0luamVjdGFibGUoY29uZmlnLnZhbHVlKSkgcmV0dXJuIGNvbmZpZy52YWx1ZTtcbiAgICBpZiAoIWluamVjdG9yKSB0aHJvdyBuZXcgRXJyb3IoXCJJbmplY3RhYmxlIGZ1bmN0aW9ucyBjYW5ub3QgYmUgY2FsbGVkIGF0IGNvbmZpZ3VyYXRpb24gdGltZVwiKTtcbiAgICByZXR1cm4gaW5qZWN0b3IuaW52b2tlKGNvbmZpZy52YWx1ZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnkjY2FzZUluc2Vuc2l0aXZlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIERlZmluZXMgd2hldGhlciBVUkwgbWF0Y2hpbmcgc2hvdWxkIGJlIGNhc2Ugc2Vuc2l0aXZlICh0aGUgZGVmYXVsdCBiZWhhdmlvciksIG9yIG5vdC5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSB2YWx1ZSBgZmFsc2VgIHRvIG1hdGNoIFVSTCBpbiBhIGNhc2Ugc2Vuc2l0aXZlIG1hbm5lcjsgb3RoZXJ3aXNlIGB0cnVlYDtcbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRoZSBjdXJyZW50IHZhbHVlIG9mIGNhc2VJbnNlbnNpdGl2ZVxuICAgKi9cbiAgdGhpcy5jYXNlSW5zZW5zaXRpdmUgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmIChpc0RlZmluZWQodmFsdWUpKVxuICAgICAgaXNDYXNlSW5zZW5zaXRpdmUgPSB2YWx1ZTtcbiAgICByZXR1cm4gaXNDYXNlSW5zZW5zaXRpdmU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3Rvcnkjc3RyaWN0TW9kZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBEZWZpbmVzIHdoZXRoZXIgVVJMcyBzaG91bGQgbWF0Y2ggdHJhaWxpbmcgc2xhc2hlcywgb3Igbm90ICh0aGUgZGVmYXVsdCBiZWhhdmlvcikuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHZhbHVlIGBmYWxzZWAgdG8gbWF0Y2ggdHJhaWxpbmcgc2xhc2hlcyBpbiBVUkxzLCBvdGhlcndpc2UgYHRydWVgLlxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdGhlIGN1cnJlbnQgdmFsdWUgb2Ygc3RyaWN0TW9kZVxuICAgKi9cbiAgdGhpcy5zdHJpY3RNb2RlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoaXNEZWZpbmVkKHZhbHVlKSlcbiAgICAgIGlzU3RyaWN0TW9kZSA9IHZhbHVlO1xuICAgIHJldHVybiBpc1N0cmljdE1vZGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnkjZGVmYXVsdFNxdWFzaFBvbGljeVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXRzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHdoZW4gZ2VuZXJhdGluZyBvciBtYXRjaGluZyBVUkxzIHdpdGggZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWVzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgQSBzdHJpbmcgdGhhdCBkZWZpbmVzIHRoZSBkZWZhdWx0IHBhcmFtZXRlciBVUkwgc3F1YXNoaW5nIGJlaGF2aW9yLlxuICAgKiAgICBgbm9zcXVhc2hgOiBXaGVuIGdlbmVyYXRpbmcgYW4gaHJlZiB3aXRoIGEgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUsIGRvIG5vdCBzcXVhc2ggdGhlIHBhcmFtZXRlciB2YWx1ZSBmcm9tIHRoZSBVUkxcbiAgICogICAgYHNsYXNoYDogV2hlbiBnZW5lcmF0aW5nIGFuIGhyZWYgd2l0aCBhIGRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlLCBzcXVhc2ggKHJlbW92ZSkgdGhlIHBhcmFtZXRlciB2YWx1ZSwgYW5kLCBpZiB0aGVcbiAgICogICAgICAgICAgICAgcGFyYW1ldGVyIGlzIHN1cnJvdW5kZWQgYnkgc2xhc2hlcywgc3F1YXNoIChyZW1vdmUpIG9uZSBzbGFzaCBmcm9tIHRoZSBVUkxcbiAgICogICAgYW55IG90aGVyIHN0cmluZywgZS5nLiBcIn5cIjogV2hlbiBnZW5lcmF0aW5nIGFuIGhyZWYgd2l0aCBhIGRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlLCBzcXVhc2ggKHJlbW92ZSlcbiAgICogICAgICAgICAgICAgdGhlIHBhcmFtZXRlciB2YWx1ZSBmcm9tIHRoZSBVUkwgYW5kIHJlcGxhY2UgaXQgd2l0aCB0aGlzIHN0cmluZy5cbiAgICovXG4gIHRoaXMuZGVmYXVsdFNxdWFzaFBvbGljeSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFpc0RlZmluZWQodmFsdWUpKSByZXR1cm4gZGVmYXVsdFNxdWFzaFBvbGljeTtcbiAgICBpZiAodmFsdWUgIT09IHRydWUgJiYgdmFsdWUgIT09IGZhbHNlICYmICFpc1N0cmluZyh2YWx1ZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHNxdWFzaCBwb2xpY3k6IFwiICsgdmFsdWUgKyBcIi4gVmFsaWQgcG9saWNpZXM6IGZhbHNlLCB0cnVlLCBhcmJpdHJhcnktc3RyaW5nXCIpO1xuICAgIGRlZmF1bHRTcXVhc2hQb2xpY3kgPSB2YWx1ZTtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnkjY29tcGlsZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBDcmVhdGVzIGEge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBgVXJsTWF0Y2hlcmB9IGZvciB0aGUgc3BlY2lmaWVkIHBhdHRlcm4uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuICBUaGUgVVJMIHBhdHRlcm4uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgIFRoZSBjb25maWcgb2JqZWN0IGhhc2guXG4gICAqIEByZXR1cm5zIHtVcmxNYXRjaGVyfSAgVGhlIFVybE1hdGNoZXIuXG4gICAqL1xuICB0aGlzLmNvbXBpbGUgPSBmdW5jdGlvbiAocGF0dGVybiwgY29uZmlnKSB7XG4gICAgcmV0dXJuIG5ldyBVcmxNYXRjaGVyKHBhdHRlcm4sIGV4dGVuZChnZXREZWZhdWx0Q29uZmlnKCksIGNvbmZpZykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I2lzTWF0Y2hlclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCBvYmplY3QgaXMgYSBgVXJsTWF0Y2hlcmAsIG9yIGZhbHNlIG90aGVyd2lzZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAgVGhlIG9iamVjdCB0byBwZXJmb3JtIHRoZSB0eXBlIGNoZWNrIGFnYWluc3QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAgUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdCBtYXRjaGVzIHRoZSBgVXJsTWF0Y2hlcmAgaW50ZXJmYWNlLCBieVxuICAgKiAgICAgICAgICBpbXBsZW1lbnRpbmcgYWxsIHRoZSBzYW1lIG1ldGhvZHMuXG4gICAqL1xuICB0aGlzLmlzTWF0Y2hlciA9IGZ1bmN0aW9uIChvKSB7XG4gICAgaWYgKCFpc09iamVjdChvKSkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciByZXN1bHQgPSB0cnVlO1xuXG4gICAgZm9yRWFjaChVcmxNYXRjaGVyLnByb3RvdHlwZSwgZnVuY3Rpb24odmFsLCBuYW1lKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbih2YWwpKSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiAoaXNEZWZpbmVkKG9bbmFtZV0pICYmIGlzRnVuY3Rpb24ob1tuYW1lXSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnkjdHlwZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZWdpc3RlcnMgYSBjdXN0b20ge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSBgVHlwZWB9IG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvXG4gICAqIGdlbmVyYXRlIFVSTHMgd2l0aCB0eXBlZCBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAgVGhlIHR5cGUgbmFtZS5cbiAgICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IGRlZmluaXRpb24gICBUaGUgdHlwZSBkZWZpbml0aW9uLiBTZWVcbiAgICogICAgICAgIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUgYFR5cGVgfSBmb3IgaW5mb3JtYXRpb24gb24gdGhlIHZhbHVlcyBhY2NlcHRlZC5cbiAgICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IGRlZmluaXRpb25GbiAob3B0aW9uYWwpIEEgZnVuY3Rpb24gdGhhdCBpcyBpbmplY3RlZCBiZWZvcmUgdGhlIGFwcFxuICAgKiAgICAgICAgcnVudGltZSBzdGFydHMuICBUaGUgcmVzdWx0IG9mIHRoaXMgZnVuY3Rpb24gaXMgbWVyZ2VkIGludG8gdGhlIGV4aXN0aW5nIGBkZWZpbml0aW9uYC5cbiAgICogICAgICAgIFNlZSB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlIGBUeXBlYH0gZm9yIGluZm9ybWF0aW9uIG9uIHRoZSB2YWx1ZXMgYWNjZXB0ZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9ICBSZXR1cm5zIGAkdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlcmAuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIFRoaXMgaXMgYSBzaW1wbGUgZXhhbXBsZSBvZiBhIGN1c3RvbSB0eXBlIHRoYXQgZW5jb2RlcyBhbmQgZGVjb2RlcyBpdGVtcyBmcm9tIGFuXG4gICAqIGFycmF5LCB1c2luZyB0aGUgYXJyYXkgaW5kZXggYXMgdGhlIFVSTC1lbmNvZGVkIHZhbHVlOlxuICAgKlxuICAgKiA8cHJlPlxuICAgKiB2YXIgbGlzdCA9IFsnSm9obicsICdQYXVsJywgJ0dlb3JnZScsICdSaW5nbyddO1xuICAgKlxuICAgKiAkdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlci50eXBlKCdsaXN0SXRlbScsIHtcbiAgICogICBlbmNvZGU6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICogICAgIC8vIFJlcHJlc2VudCB0aGUgbGlzdCBpdGVtIGluIHRoZSBVUkwgdXNpbmcgaXRzIGNvcnJlc3BvbmRpbmcgaW5kZXhcbiAgICogICAgIHJldHVybiBsaXN0LmluZGV4T2YoaXRlbSk7XG4gICAqICAgfSxcbiAgICogICBkZWNvZGU6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICogICAgIC8vIExvb2sgdXAgdGhlIGxpc3QgaXRlbSBieSBpbmRleFxuICAgKiAgICAgcmV0dXJuIGxpc3RbcGFyc2VJbnQoaXRlbSwgMTApXTtcbiAgICogICB9LFxuICAgKiAgIGlzOiBmdW5jdGlvbihpdGVtKSB7XG4gICAqICAgICAvLyBFbnN1cmUgdGhlIGl0ZW0gaXMgdmFsaWQgYnkgY2hlY2tpbmcgdG8gc2VlIHRoYXQgaXQgYXBwZWFyc1xuICAgKiAgICAgLy8gaW4gdGhlIGxpc3RcbiAgICogICAgIHJldHVybiBsaXN0LmluZGV4T2YoaXRlbSkgPiAtMTtcbiAgICogICB9XG4gICAqIH0pO1xuICAgKlxuICAgKiAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbGlzdCcsIHtcbiAgICogICB1cmw6IFwiL2xpc3Qve2l0ZW06bGlzdEl0ZW19XCIsXG4gICAqICAgY29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICogICAgIGNvbnNvbGUubG9nKCRzdGF0ZVBhcmFtcy5pdGVtKTtcbiAgICogICB9XG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyAuLi5cbiAgICpcbiAgICogLy8gQ2hhbmdlcyBVUkwgdG8gJy9saXN0LzMnLCBsb2dzIFwiUmluZ29cIiB0byB0aGUgY29uc29sZVxuICAgKiAkc3RhdGUuZ28oJ2xpc3QnLCB7IGl0ZW06IFwiUmluZ29cIiB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIFRoaXMgaXMgYSBtb3JlIGNvbXBsZXggZXhhbXBsZSBvZiBhIHR5cGUgdGhhdCByZWxpZXMgb24gZGVwZW5kZW5jeSBpbmplY3Rpb24gdG9cbiAgICogaW50ZXJhY3Qgd2l0aCBzZXJ2aWNlcywgYW5kIHVzZXMgdGhlIHBhcmFtZXRlciBuYW1lIGZyb20gdGhlIFVSTCB0byBpbmZlciBob3cgdG9cbiAgICogaGFuZGxlIGVuY29kaW5nIGFuZCBkZWNvZGluZyBwYXJhbWV0ZXIgdmFsdWVzOlxuICAgKlxuICAgKiA8cHJlPlxuICAgKiAvLyBEZWZpbmVzIGEgY3VzdG9tIHR5cGUgdGhhdCBnZXRzIGEgdmFsdWUgZnJvbSBhIHNlcnZpY2UsXG4gICAqIC8vIHdoZXJlIGVhY2ggc2VydmljZSBnZXRzIGRpZmZlcmVudCB0eXBlcyBvZiB2YWx1ZXMgZnJvbVxuICAgKiAvLyBhIGJhY2tlbmQgQVBJOlxuICAgKiAkdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlci50eXBlKCdkYk9iamVjdCcsIHt9LCBmdW5jdGlvbihVc2VycywgUG9zdHMpIHtcbiAgICpcbiAgICogICAvLyBNYXRjaGVzIHVwIHNlcnZpY2VzIHRvIFVSTCBwYXJhbWV0ZXIgbmFtZXNcbiAgICogICB2YXIgc2VydmljZXMgPSB7XG4gICAqICAgICB1c2VyOiBVc2VycyxcbiAgICogICAgIHBvc3Q6IFBvc3RzXG4gICAqICAgfTtcbiAgICpcbiAgICogICByZXR1cm4ge1xuICAgKiAgICAgZW5jb2RlOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgICogICAgICAgLy8gUmVwcmVzZW50IHRoZSBvYmplY3QgaW4gdGhlIFVSTCB1c2luZyBpdHMgdW5pcXVlIElEXG4gICAqICAgICAgIHJldHVybiBvYmplY3QuaWQ7XG4gICAqICAgICB9LFxuICAgKiAgICAgZGVjb2RlOiBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAqICAgICAgIC8vIExvb2sgdXAgdGhlIG9iamVjdCBieSBJRCwgdXNpbmcgdGhlIHBhcmFtZXRlclxuICAgKiAgICAgICAvLyBuYW1lIChrZXkpIHRvIGNhbGwgdGhlIGNvcnJlY3Qgc2VydmljZVxuICAgKiAgICAgICByZXR1cm4gc2VydmljZXNba2V5XS5maW5kQnlJZCh2YWx1ZSk7XG4gICAqICAgICB9LFxuICAgKiAgICAgaXM6IGZ1bmN0aW9uKG9iamVjdCwga2V5KSB7XG4gICAqICAgICAgIC8vIENoZWNrIHRoYXQgb2JqZWN0IGlzIGEgdmFsaWQgZGJPYmplY3RcbiAgICogICAgICAgcmV0dXJuIGFuZ3VsYXIuaXNPYmplY3Qob2JqZWN0KSAmJiBvYmplY3QuaWQgJiYgc2VydmljZXNba2V5XTtcbiAgICogICAgIH1cbiAgICogICAgIGVxdWFsczogZnVuY3Rpb24oYSwgYikge1xuICAgKiAgICAgICAvLyBDaGVjayB0aGUgZXF1YWxpdHkgb2YgZGVjb2RlZCBvYmplY3RzIGJ5IGNvbXBhcmluZ1xuICAgKiAgICAgICAvLyB0aGVpciB1bmlxdWUgSURzXG4gICAqICAgICAgIHJldHVybiBhLmlkID09PSBiLmlkO1xuICAgKiAgICAgfVxuICAgKiAgIH07XG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyBJbiBhIGNvbmZpZygpIGJsb2NrLCB5b3UgY2FuIHRoZW4gYXR0YWNoIFVSTHMgd2l0aFxuICAgKiAvLyB0eXBlLWFubm90YXRlZCBwYXJhbWV0ZXJzOlxuICAgKiAkc3RhdGVQcm92aWRlci5zdGF0ZSgndXNlcnMnLCB7XG4gICAqICAgdXJsOiBcIi91c2Vyc1wiLFxuICAgKiAgIC8vIC4uLlxuICAgKiB9KS5zdGF0ZSgndXNlcnMuaXRlbScsIHtcbiAgICogICB1cmw6IFwiL3t1c2VyOmRiT2JqZWN0fVwiLFxuICAgKiAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAqICAgICAvLyAkc3RhdGVQYXJhbXMudXNlciB3aWxsIG5vdyBiZSBhbiBvYmplY3QgcmV0dXJuZWQgZnJvbVxuICAgKiAgICAgLy8gdGhlIFVzZXJzIHNlcnZpY2VcbiAgICogICB9LFxuICAgKiAgIC8vIC4uLlxuICAgKiB9KTtcbiAgICogPC9wcmU+XG4gICAqL1xuICB0aGlzLnR5cGUgPSBmdW5jdGlvbiAobmFtZSwgZGVmaW5pdGlvbiwgZGVmaW5pdGlvbkZuKSB7XG4gICAgaWYgKCFpc0RlZmluZWQoZGVmaW5pdGlvbikpIHJldHVybiAkdHlwZXNbbmFtZV07XG4gICAgaWYgKCR0eXBlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkgdGhyb3cgbmV3IEVycm9yKFwiQSB0eXBlIG5hbWVkICdcIiArIG5hbWUgKyBcIicgaGFzIGFscmVhZHkgYmVlbiBkZWZpbmVkLlwiKTtcblxuICAgICR0eXBlc1tuYW1lXSA9IG5ldyBUeXBlKGV4dGVuZCh7IG5hbWU6IG5hbWUgfSwgZGVmaW5pdGlvbikpO1xuICAgIGlmIChkZWZpbml0aW9uRm4pIHtcbiAgICAgIHR5cGVRdWV1ZS5wdXNoKHsgbmFtZTogbmFtZSwgZGVmOiBkZWZpbml0aW9uRm4gfSk7XG4gICAgICBpZiAoIWVucXVldWUpIGZsdXNoVHlwZVF1ZXVlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIGBmbHVzaFR5cGVRdWV1ZSgpYCB3YWl0cyB1bnRpbCBgJHVybE1hdGNoZXJGYWN0b3J5YCBpcyBpbmplY3RlZCBiZWZvcmUgaW52b2tpbmcgdGhlIHF1ZXVlZCBgZGVmaW5pdGlvbkZuYHNcbiAgZnVuY3Rpb24gZmx1c2hUeXBlUXVldWUoKSB7XG4gICAgd2hpbGUodHlwZVF1ZXVlLmxlbmd0aCkge1xuICAgICAgdmFyIHR5cGUgPSB0eXBlUXVldWUuc2hpZnQoKTtcbiAgICAgIGlmICh0eXBlLnBhdHRlcm4pIHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3Qgb3ZlcnJpZGUgYSB0eXBlJ3MgLnBhdHRlcm4gYXQgcnVudGltZS5cIik7XG4gICAgICBhbmd1bGFyLmV4dGVuZCgkdHlwZXNbdHlwZS5uYW1lXSwgaW5qZWN0b3IuaW52b2tlKHR5cGUuZGVmKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVnaXN0ZXIgZGVmYXVsdCB0eXBlcy4gU3RvcmUgdGhlbSBpbiB0aGUgcHJvdG90eXBlIG9mICR0eXBlcy5cbiAgZm9yRWFjaChkZWZhdWx0VHlwZXMsIGZ1bmN0aW9uKHR5cGUsIG5hbWUpIHsgJHR5cGVzW25hbWVdID0gbmV3IFR5cGUoZXh0ZW5kKHtuYW1lOiBuYW1lfSwgdHlwZSkpOyB9KTtcbiAgJHR5cGVzID0gaW5oZXJpdCgkdHlwZXMsIHt9KTtcblxuICAvKiBObyBuZWVkIHRvIGRvY3VtZW50ICRnZXQsIHNpbmNlIGl0IHJldHVybnMgdGhpcyAqL1xuICB0aGlzLiRnZXQgPSBbJyRpbmplY3RvcicsIGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcbiAgICBpbmplY3RvciA9ICRpbmplY3RvcjtcbiAgICBlbnF1ZXVlID0gZmFsc2U7XG4gICAgZmx1c2hUeXBlUXVldWUoKTtcblxuICAgIGZvckVhY2goZGVmYXVsdFR5cGVzLCBmdW5jdGlvbih0eXBlLCBuYW1lKSB7XG4gICAgICBpZiAoISR0eXBlc1tuYW1lXSkgJHR5cGVzW25hbWVdID0gbmV3IFR5cGUodHlwZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1dO1xuXG4gIHRoaXMuUGFyYW0gPSBmdW5jdGlvbiBQYXJhbShpZCwgdHlwZSwgY29uZmlnLCBsb2NhdGlvbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBjb25maWcgPSB1bndyYXBTaG9ydGhhbmQoY29uZmlnKTtcbiAgICB0eXBlID0gZ2V0VHlwZShjb25maWcsIHR5cGUsIGxvY2F0aW9uKTtcbiAgICB2YXIgYXJyYXlNb2RlID0gZ2V0QXJyYXlNb2RlKCk7XG4gICAgdHlwZSA9IGFycmF5TW9kZSA/IHR5cGUuJGFzQXJyYXkoYXJyYXlNb2RlLCBsb2NhdGlvbiA9PT0gXCJzZWFyY2hcIikgOiB0eXBlO1xuICAgIGlmICh0eXBlLm5hbWUgPT09IFwic3RyaW5nXCIgJiYgIWFycmF5TW9kZSAmJiBsb2NhdGlvbiA9PT0gXCJwYXRoXCIgJiYgY29uZmlnLnZhbHVlID09PSB1bmRlZmluZWQpXG4gICAgICBjb25maWcudmFsdWUgPSBcIlwiOyAvLyBmb3IgMC4yLng7IGluIDAuMy4wKyBkbyBub3QgYXV0b21hdGljYWxseSBkZWZhdWx0IHRvIFwiXCJcbiAgICB2YXIgaXNPcHRpb25hbCA9IGNvbmZpZy52YWx1ZSAhPT0gdW5kZWZpbmVkO1xuICAgIHZhciBzcXVhc2ggPSBnZXRTcXVhc2hQb2xpY3koY29uZmlnLCBpc09wdGlvbmFsKTtcbiAgICB2YXIgcmVwbGFjZSA9IGdldFJlcGxhY2UoY29uZmlnLCBhcnJheU1vZGUsIGlzT3B0aW9uYWwsIHNxdWFzaCk7XG5cbiAgICBmdW5jdGlvbiB1bndyYXBTaG9ydGhhbmQoY29uZmlnKSB7XG4gICAgICB2YXIga2V5cyA9IGlzT2JqZWN0KGNvbmZpZykgPyBvYmplY3RLZXlzKGNvbmZpZykgOiBbXTtcbiAgICAgIHZhciBpc1Nob3J0aGFuZCA9IGluZGV4T2Yoa2V5cywgXCJ2YWx1ZVwiKSA9PT0gLTEgJiYgaW5kZXhPZihrZXlzLCBcInR5cGVcIikgPT09IC0xICYmXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleE9mKGtleXMsIFwic3F1YXNoXCIpID09PSAtMSAmJiBpbmRleE9mKGtleXMsIFwiYXJyYXlcIikgPT09IC0xO1xuICAgICAgaWYgKGlzU2hvcnRoYW5kKSBjb25maWcgPSB7IHZhbHVlOiBjb25maWcgfTtcbiAgICAgIGNvbmZpZy4kJGZuID0gaXNJbmplY3RhYmxlKGNvbmZpZy52YWx1ZSkgPyBjb25maWcudmFsdWUgOiBmdW5jdGlvbiAoKSB7IHJldHVybiBjb25maWcudmFsdWU7IH07XG4gICAgICByZXR1cm4gY29uZmlnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFR5cGUoY29uZmlnLCB1cmxUeXBlLCBsb2NhdGlvbikge1xuICAgICAgaWYgKGNvbmZpZy50eXBlICYmIHVybFR5cGUpIHRocm93IG5ldyBFcnJvcihcIlBhcmFtICdcIitpZCtcIicgaGFzIHR3byB0eXBlIGNvbmZpZ3VyYXRpb25zLlwiKTtcbiAgICAgIGlmICh1cmxUeXBlKSByZXR1cm4gdXJsVHlwZTtcbiAgICAgIGlmICghY29uZmlnLnR5cGUpIHJldHVybiAobG9jYXRpb24gPT09IFwiY29uZmlnXCIgPyAkdHlwZXMuYW55IDogJHR5cGVzLnN0cmluZyk7XG5cbiAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGNvbmZpZy50eXBlKSlcbiAgICAgICAgcmV0dXJuICR0eXBlc1tjb25maWcudHlwZV07XG4gICAgICBpZiAoY29uZmlnLnR5cGUgaW5zdGFuY2VvZiBUeXBlKVxuICAgICAgICByZXR1cm4gY29uZmlnLnR5cGU7XG4gICAgICByZXR1cm4gbmV3IFR5cGUoY29uZmlnLnR5cGUpO1xuICAgIH1cblxuICAgIC8vIGFycmF5IGNvbmZpZzogcGFyYW0gbmFtZSAocGFyYW1bXSkgb3ZlcnJpZGVzIGRlZmF1bHQgc2V0dGluZ3MuICBleHBsaWNpdCBjb25maWcgb3ZlcnJpZGVzIHBhcmFtIG5hbWUuXG4gICAgZnVuY3Rpb24gZ2V0QXJyYXlNb2RlKCkge1xuICAgICAgdmFyIGFycmF5RGVmYXVsdHMgPSB7IGFycmF5OiAobG9jYXRpb24gPT09IFwic2VhcmNoXCIgPyBcImF1dG9cIiA6IGZhbHNlKSB9O1xuICAgICAgdmFyIGFycmF5UGFyYW1Ob21lbmNsYXR1cmUgPSBpZC5tYXRjaCgvXFxbXFxdJC8pID8geyBhcnJheTogdHJ1ZSB9IDoge307XG4gICAgICByZXR1cm4gZXh0ZW5kKGFycmF5RGVmYXVsdHMsIGFycmF5UGFyYW1Ob21lbmNsYXR1cmUsIGNvbmZpZykuYXJyYXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyBmYWxzZSwgdHJ1ZSwgb3IgdGhlIHNxdWFzaCB2YWx1ZSB0byBpbmRpY2F0ZSB0aGUgXCJkZWZhdWx0IHBhcmFtZXRlciB1cmwgc3F1YXNoIHBvbGljeVwiLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldFNxdWFzaFBvbGljeShjb25maWcsIGlzT3B0aW9uYWwpIHtcbiAgICAgIHZhciBzcXVhc2ggPSBjb25maWcuc3F1YXNoO1xuICAgICAgaWYgKCFpc09wdGlvbmFsIHx8IHNxdWFzaCA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcbiAgICAgIGlmICghaXNEZWZpbmVkKHNxdWFzaCkgfHwgc3F1YXNoID09IG51bGwpIHJldHVybiBkZWZhdWx0U3F1YXNoUG9saWN5O1xuICAgICAgaWYgKHNxdWFzaCA9PT0gdHJ1ZSB8fCBpc1N0cmluZyhzcXVhc2gpKSByZXR1cm4gc3F1YXNoO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzcXVhc2ggcG9saWN5OiAnXCIgKyBzcXVhc2ggKyBcIicuIFZhbGlkIHBvbGljaWVzOiBmYWxzZSwgdHJ1ZSwgb3IgYXJiaXRyYXJ5IHN0cmluZ1wiKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZXBsYWNlKGNvbmZpZywgYXJyYXlNb2RlLCBpc09wdGlvbmFsLCBzcXVhc2gpIHtcbiAgICAgIHZhciByZXBsYWNlLCBjb25maWd1cmVkS2V5cywgZGVmYXVsdFBvbGljeSA9IFtcbiAgICAgICAgeyBmcm9tOiBcIlwiLCAgIHRvOiAoaXNPcHRpb25hbCB8fCBhcnJheU1vZGUgPyB1bmRlZmluZWQgOiBcIlwiKSB9LFxuICAgICAgICB7IGZyb206IG51bGwsIHRvOiAoaXNPcHRpb25hbCB8fCBhcnJheU1vZGUgPyB1bmRlZmluZWQgOiBcIlwiKSB9XG4gICAgICBdO1xuICAgICAgcmVwbGFjZSA9IGlzQXJyYXkoY29uZmlnLnJlcGxhY2UpID8gY29uZmlnLnJlcGxhY2UgOiBbXTtcbiAgICAgIGlmIChpc1N0cmluZyhzcXVhc2gpKVxuICAgICAgICByZXBsYWNlLnB1c2goeyBmcm9tOiBzcXVhc2gsIHRvOiB1bmRlZmluZWQgfSk7XG4gICAgICBjb25maWd1cmVkS2V5cyA9IG1hcChyZXBsYWNlLCBmdW5jdGlvbihpdGVtKSB7IHJldHVybiBpdGVtLmZyb207IH0gKTtcbiAgICAgIHJldHVybiBmaWx0ZXIoZGVmYXVsdFBvbGljeSwgZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaW5kZXhPZihjb25maWd1cmVkS2V5cywgaXRlbS5mcm9tKSA9PT0gLTE7IH0pLmNvbmNhdChyZXBsYWNlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBbSW50ZXJuYWxdIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBhIHBhcmFtZXRlciwgd2hpY2ggbWF5IGJlIGFuIGluamVjdGFibGUgZnVuY3Rpb24uXG4gICAgICovXG4gICAgZnVuY3Rpb24gJCRnZXREZWZhdWx0VmFsdWUoKSB7XG4gICAgICBpZiAoIWluamVjdG9yKSB0aHJvdyBuZXcgRXJyb3IoXCJJbmplY3RhYmxlIGZ1bmN0aW9ucyBjYW5ub3QgYmUgY2FsbGVkIGF0IGNvbmZpZ3VyYXRpb24gdGltZVwiKTtcbiAgICAgIHZhciBkZWZhdWx0VmFsdWUgPSBpbmplY3Rvci5pbnZva2UoY29uZmlnLiQkZm4pO1xuICAgICAgaWYgKGRlZmF1bHRWYWx1ZSAhPT0gbnVsbCAmJiBkZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCAmJiAhc2VsZi50eXBlLmlzKGRlZmF1bHRWYWx1ZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRlZmF1bHQgdmFsdWUgKFwiICsgZGVmYXVsdFZhbHVlICsgXCIpIGZvciBwYXJhbWV0ZXIgJ1wiICsgc2VsZi5pZCArIFwiJyBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgVHlwZSAoXCIgKyBzZWxmLnR5cGUubmFtZSArIFwiKVwiKTtcbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogW0ludGVybmFsXSBHZXRzIHRoZSBkZWNvZGVkIHJlcHJlc2VudGF0aW9uIG9mIGEgdmFsdWUgaWYgdGhlIHZhbHVlIGlzIGRlZmluZWQsIG90aGVyd2lzZSwgcmV0dXJucyB0aGVcbiAgICAgKiBkZWZhdWx0IHZhbHVlLCB3aGljaCBtYXkgYmUgdGhlIHJlc3VsdCBvZiBhbiBpbmplY3RhYmxlIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uICR2YWx1ZSh2YWx1ZSkge1xuICAgICAgZnVuY3Rpb24gaGFzUmVwbGFjZVZhbCh2YWwpIHsgcmV0dXJuIGZ1bmN0aW9uKG9iaikgeyByZXR1cm4gb2JqLmZyb20gPT09IHZhbDsgfTsgfVxuICAgICAgZnVuY3Rpb24gJHJlcGxhY2UodmFsdWUpIHtcbiAgICAgICAgdmFyIHJlcGxhY2VtZW50ID0gbWFwKGZpbHRlcihzZWxmLnJlcGxhY2UsIGhhc1JlcGxhY2VWYWwodmFsdWUpKSwgZnVuY3Rpb24ob2JqKSB7IHJldHVybiBvYmoudG87IH0pO1xuICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnQubGVuZ3RoID8gcmVwbGFjZW1lbnRbMF0gOiB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIHZhbHVlID0gJHJlcGxhY2UodmFsdWUpO1xuICAgICAgcmV0dXJuICFpc0RlZmluZWQodmFsdWUpID8gJCRnZXREZWZhdWx0VmFsdWUoKSA6IHNlbGYudHlwZS4kbm9ybWFsaXplKHZhbHVlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0b1N0cmluZygpIHsgcmV0dXJuIFwie1BhcmFtOlwiICsgaWQgKyBcIiBcIiArIHR5cGUgKyBcIiBzcXVhc2g6ICdcIiArIHNxdWFzaCArIFwiJyBvcHRpb25hbDogXCIgKyBpc09wdGlvbmFsICsgXCJ9XCI7IH1cblxuICAgIGV4dGVuZCh0aGlzLCB7XG4gICAgICBpZDogaWQsXG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgbG9jYXRpb246IGxvY2F0aW9uLFxuICAgICAgYXJyYXk6IGFycmF5TW9kZSxcbiAgICAgIHNxdWFzaDogc3F1YXNoLFxuICAgICAgcmVwbGFjZTogcmVwbGFjZSxcbiAgICAgIGlzT3B0aW9uYWw6IGlzT3B0aW9uYWwsXG4gICAgICB2YWx1ZTogJHZhbHVlLFxuICAgICAgZHluYW1pYzogdW5kZWZpbmVkLFxuICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICB0b1N0cmluZzogdG9TdHJpbmdcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBQYXJhbVNldChwYXJhbXMpIHtcbiAgICBleHRlbmQodGhpcywgcGFyYW1zIHx8IHt9KTtcbiAgfVxuXG4gIFBhcmFtU2V0LnByb3RvdHlwZSA9IHtcbiAgICAkJG5ldzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gaW5oZXJpdCh0aGlzLCBleHRlbmQobmV3IFBhcmFtU2V0KCksIHsgJCRwYXJlbnQ6IHRoaXN9KSk7XG4gICAgfSxcbiAgICAkJGtleXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBrZXlzID0gW10sIGNoYWluID0gW10sIHBhcmVudCA9IHRoaXMsXG4gICAgICAgIGlnbm9yZSA9IG9iamVjdEtleXMoUGFyYW1TZXQucHJvdG90eXBlKTtcbiAgICAgIHdoaWxlIChwYXJlbnQpIHsgY2hhaW4ucHVzaChwYXJlbnQpOyBwYXJlbnQgPSBwYXJlbnQuJCRwYXJlbnQ7IH1cbiAgICAgIGNoYWluLnJldmVyc2UoKTtcbiAgICAgIGZvckVhY2goY2hhaW4sIGZ1bmN0aW9uKHBhcmFtc2V0KSB7XG4gICAgICAgIGZvckVhY2gob2JqZWN0S2V5cyhwYXJhbXNldCksIGZ1bmN0aW9uKGtleSkge1xuICAgICAgICAgICAgaWYgKGluZGV4T2Yoa2V5cywga2V5KSA9PT0gLTEgJiYgaW5kZXhPZihpZ25vcmUsIGtleSkgPT09IC0xKSBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBrZXlzO1xuICAgIH0sXG4gICAgJCR2YWx1ZXM6IGZ1bmN0aW9uKHBhcmFtVmFsdWVzKSB7XG4gICAgICB2YXIgdmFsdWVzID0ge30sIHNlbGYgPSB0aGlzO1xuICAgICAgZm9yRWFjaChzZWxmLiQka2V5cygpLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgdmFsdWVzW2tleV0gPSBzZWxmW2tleV0udmFsdWUocGFyYW1WYWx1ZXMgJiYgcGFyYW1WYWx1ZXNba2V5XSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfSxcbiAgICAkJGVxdWFsczogZnVuY3Rpb24ocGFyYW1WYWx1ZXMxLCBwYXJhbVZhbHVlczIpIHtcbiAgICAgIHZhciBlcXVhbCA9IHRydWUsIHNlbGYgPSB0aGlzO1xuICAgICAgZm9yRWFjaChzZWxmLiQka2V5cygpLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgdmFyIGxlZnQgPSBwYXJhbVZhbHVlczEgJiYgcGFyYW1WYWx1ZXMxW2tleV0sIHJpZ2h0ID0gcGFyYW1WYWx1ZXMyICYmIHBhcmFtVmFsdWVzMltrZXldO1xuICAgICAgICBpZiAoIXNlbGZba2V5XS50eXBlLmVxdWFscyhsZWZ0LCByaWdodCkpIGVxdWFsID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBlcXVhbDtcbiAgICB9LFxuICAgICQkdmFsaWRhdGVzOiBmdW5jdGlvbiAkJHZhbGlkYXRlKHBhcmFtVmFsdWVzKSB7XG4gICAgICB2YXIga2V5cyA9IHRoaXMuJCRrZXlzKCksIGksIHBhcmFtLCByYXdWYWwsIG5vcm1hbGl6ZWQsIGVuY29kZWQ7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYXJhbSA9IHRoaXNba2V5c1tpXV07XG4gICAgICAgIHJhd1ZhbCA9IHBhcmFtVmFsdWVzW2tleXNbaV1dO1xuICAgICAgICBpZiAoKHJhd1ZhbCA9PT0gdW5kZWZpbmVkIHx8IHJhd1ZhbCA9PT0gbnVsbCkgJiYgcGFyYW0uaXNPcHRpb25hbClcbiAgICAgICAgICBicmVhazsgLy8gVGhlcmUgd2FzIG5vIHBhcmFtZXRlciB2YWx1ZSwgYnV0IHRoZSBwYXJhbSBpcyBvcHRpb25hbFxuICAgICAgICBub3JtYWxpemVkID0gcGFyYW0udHlwZS4kbm9ybWFsaXplKHJhd1ZhbCk7XG4gICAgICAgIGlmICghcGFyYW0udHlwZS5pcyhub3JtYWxpemVkKSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFRoZSB2YWx1ZSB3YXMgbm90IG9mIHRoZSBjb3JyZWN0IFR5cGUsIGFuZCBjb3VsZCBub3QgYmUgZGVjb2RlZCB0byB0aGUgY29ycmVjdCBUeXBlXG4gICAgICAgIGVuY29kZWQgPSBwYXJhbS50eXBlLmVuY29kZShub3JtYWxpemVkKTtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZW5jb2RlZCkgJiYgIXBhcmFtLnR5cGUucGF0dGVybi5leGVjKGVuY29kZWQpKVxuICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gVGhlIHZhbHVlIHdhcyBvZiB0aGUgY29ycmVjdCB0eXBlLCBidXQgd2hlbiBlbmNvZGVkLCBkaWQgbm90IG1hdGNoIHRoZSBUeXBlJ3MgcmVnZXhwXG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgICQkcGFyZW50OiB1bmRlZmluZWRcbiAgfTtcblxuICB0aGlzLlBhcmFtU2V0ID0gUGFyYW1TZXQ7XG59XG5cbi8vIFJlZ2lzdGVyIGFzIGEgcHJvdmlkZXIgc28gaXQncyBhdmFpbGFibGUgdG8gb3RoZXIgcHJvdmlkZXJzXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnV0aWwnKS5wcm92aWRlcignJHVybE1hdGNoZXJGYWN0b3J5JywgJFVybE1hdGNoZXJGYWN0b3J5KTtcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIudXRpbCcpLnJ1bihbJyR1cmxNYXRjaGVyRmFjdG9yeScsIGZ1bmN0aW9uKCR1cmxNYXRjaGVyRmFjdG9yeSkgeyB9XSk7XG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXJcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJcbiAqIEByZXF1aXJlcyAkbG9jYXRpb25Qcm92aWRlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogYCR1cmxSb3V0ZXJQcm92aWRlcmAgaGFzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB3YXRjaGluZyBgJGxvY2F0aW9uYC4gXG4gKiBXaGVuIGAkbG9jYXRpb25gIGNoYW5nZXMgaXQgcnVucyB0aHJvdWdoIGEgbGlzdCBvZiBydWxlcyBvbmUgYnkgb25lIHVudGlsIGEgXG4gKiBtYXRjaCBpcyBmb3VuZC4gYCR1cmxSb3V0ZXJQcm92aWRlcmAgaXMgdXNlZCBiZWhpbmQgdGhlIHNjZW5lcyBhbnl0aW1lIHlvdSBzcGVjaWZ5IFxuICogYSB1cmwgaW4gYSBzdGF0ZSBjb25maWd1cmF0aW9uLiBBbGwgdXJscyBhcmUgY29tcGlsZWQgaW50byBhIFVybE1hdGNoZXIgb2JqZWN0LlxuICpcbiAqIFRoZXJlIGFyZSBzZXZlcmFsIG1ldGhvZHMgb24gYCR1cmxSb3V0ZXJQcm92aWRlcmAgdGhhdCBtYWtlIGl0IHVzZWZ1bCB0byB1c2UgZGlyZWN0bHlcbiAqIGluIHlvdXIgbW9kdWxlIGNvbmZpZy5cbiAqL1xuJFVybFJvdXRlclByb3ZpZGVyLiRpbmplY3QgPSBbJyRsb2NhdGlvblByb3ZpZGVyJywgJyR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyJ107XG5mdW5jdGlvbiAkVXJsUm91dGVyUHJvdmlkZXIoICAgJGxvY2F0aW9uUHJvdmlkZXIsICAgJHVybE1hdGNoZXJGYWN0b3J5KSB7XG4gIHZhciBydWxlcyA9IFtdLCBvdGhlcndpc2UgPSBudWxsLCBpbnRlcmNlcHREZWZlcnJlZCA9IGZhbHNlLCBsaXN0ZW5lcjtcblxuICAvLyBSZXR1cm5zIGEgc3RyaW5nIHRoYXQgaXMgYSBwcmVmaXggb2YgYWxsIHN0cmluZ3MgbWF0Y2hpbmcgdGhlIFJlZ0V4cFxuICBmdW5jdGlvbiByZWdFeHBQcmVmaXgocmUpIHtcbiAgICB2YXIgcHJlZml4ID0gL15cXF4oKD86XFxcXFteYS16QS1aMC05XXxbXlxcXFxcXFtcXF1cXF4kKis/LigpfHt9XSspKikvLmV4ZWMocmUuc291cmNlKTtcbiAgICByZXR1cm4gKHByZWZpeCAhPSBudWxsKSA/IHByZWZpeFsxXS5yZXBsYWNlKC9cXFxcKC4pL2csIFwiJDFcIikgOiAnJztcbiAgfVxuXG4gIC8vIEludGVycG9sYXRlcyBtYXRjaGVkIHZhbHVlcyBpbnRvIGEgU3RyaW5nLnJlcGxhY2UoKS1zdHlsZSBwYXR0ZXJuXG4gIGZ1bmN0aW9uIGludGVycG9sYXRlKHBhdHRlcm4sIG1hdGNoKSB7XG4gICAgcmV0dXJuIHBhdHRlcm4ucmVwbGFjZSgvXFwkKFxcJHxcXGR7MSwyfSkvLCBmdW5jdGlvbiAobSwgd2hhdCkge1xuICAgICAgcmV0dXJuIG1hdGNoW3doYXQgPT09ICckJyA/IDAgOiBOdW1iZXIod2hhdCldO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlciNydWxlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogRGVmaW5lcyBydWxlcyB0aGF0IGFyZSB1c2VkIGJ5IGAkdXJsUm91dGVyUHJvdmlkZXJgIHRvIGZpbmQgbWF0Y2hlcyBmb3JcbiAgICogc3BlY2lmaWMgVVJMcy5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogPHByZT5cbiAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlci5yb3V0ZXInXSk7XG4gICAqXG4gICAqIGFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgKiAgIC8vIEhlcmUncyBhbiBleGFtcGxlIG9mIGhvdyB5b3UgbWlnaHQgYWxsb3cgY2FzZSBpbnNlbnNpdGl2ZSB1cmxzXG4gICAqICAgJHVybFJvdXRlclByb3ZpZGVyLnJ1bGUoZnVuY3Rpb24gKCRpbmplY3RvciwgJGxvY2F0aW9uKSB7XG4gICAqICAgICB2YXIgcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCksXG4gICAqICAgICAgICAgbm9ybWFsaXplZCA9IHBhdGgudG9Mb3dlckNhc2UoKTtcbiAgICpcbiAgICogICAgIGlmIChwYXRoICE9PSBub3JtYWxpemVkKSB7XG4gICAqICAgICAgIHJldHVybiBub3JtYWxpemVkO1xuICAgKiAgICAgfVxuICAgKiAgIH0pO1xuICAgKiB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHJ1bGUgSGFuZGxlciBmdW5jdGlvbiB0aGF0IHRha2VzIGAkaW5qZWN0b3JgIGFuZCBgJGxvY2F0aW9uYFxuICAgKiBzZXJ2aWNlcyBhcyBhcmd1bWVudHMuIFlvdSBjYW4gdXNlIHRoZW0gdG8gcmV0dXJuIGEgdmFsaWQgcGF0aCBhcyBhIHN0cmluZy5cbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSBgJHVybFJvdXRlclByb3ZpZGVyYCAtIGAkdXJsUm91dGVyUHJvdmlkZXJgIGluc3RhbmNlXG4gICAqL1xuICB0aGlzLnJ1bGUgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgIGlmICghaXNGdW5jdGlvbihydWxlKSkgdGhyb3cgbmV3IEVycm9yKFwiJ3J1bGUnIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICBydWxlcy5wdXNoKHJ1bGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2Mgb2JqZWN0XG4gICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyI290aGVyd2lzZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIERlZmluZXMgYSBwYXRoIHRoYXQgaXMgdXNlZCB3aGVuIGFuIGludmFsaWQgcm91dGUgaXMgcmVxdWVzdGVkLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiA8cHJlPlxuICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyLnJvdXRlciddKTtcbiAgICpcbiAgICogYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAqICAgLy8gaWYgdGhlIHBhdGggZG9lc24ndCBtYXRjaCBhbnkgb2YgdGhlIHVybHMgeW91IGNvbmZpZ3VyZWRcbiAgICogICAvLyBvdGhlcndpc2Ugd2lsbCB0YWtlIGNhcmUgb2Ygcm91dGluZyB0aGUgdXNlciB0byB0aGVcbiAgICogICAvLyBzcGVjaWZpZWQgdXJsXG4gICAqICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2luZGV4Jyk7XG4gICAqXG4gICAqICAgLy8gRXhhbXBsZSBvZiB1c2luZyBmdW5jdGlvbiBydWxlIGFzIHBhcmFtXG4gICAqICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZShmdW5jdGlvbiAoJGluamVjdG9yLCAkbG9jYXRpb24pIHtcbiAgICogICAgIHJldHVybiAnL2EvdmFsaWQvdXJsJztcbiAgICogICB9KTtcbiAgICogfSk7XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbn0gcnVsZSBUaGUgdXJsIHBhdGggeW91IHdhbnQgdG8gcmVkaXJlY3QgdG8gb3IgYSBmdW5jdGlvbiBcbiAgICogcnVsZSB0aGF0IHJldHVybnMgdGhlIHVybCBwYXRoLiBUaGUgZnVuY3Rpb24gdmVyc2lvbiBpcyBwYXNzZWQgdHdvIHBhcmFtczogXG4gICAqIGAkaW5qZWN0b3JgIGFuZCBgJGxvY2F0aW9uYCBzZXJ2aWNlcywgYW5kIG11c3QgcmV0dXJuIGEgdXJsIHN0cmluZy5cbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSBgJHVybFJvdXRlclByb3ZpZGVyYCAtIGAkdXJsUm91dGVyUHJvdmlkZXJgIGluc3RhbmNlXG4gICAqL1xuICB0aGlzLm90aGVyd2lzZSA9IGZ1bmN0aW9uIChydWxlKSB7XG4gICAgaWYgKGlzU3RyaW5nKHJ1bGUpKSB7XG4gICAgICB2YXIgcmVkaXJlY3QgPSBydWxlO1xuICAgICAgcnVsZSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHJlZGlyZWN0OyB9O1xuICAgIH1cbiAgICBlbHNlIGlmICghaXNGdW5jdGlvbihydWxlKSkgdGhyb3cgbmV3IEVycm9yKFwiJ3J1bGUnIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICBvdGhlcndpc2UgPSBydWxlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG5cbiAgZnVuY3Rpb24gaGFuZGxlSWZNYXRjaCgkaW5qZWN0b3IsIGhhbmRsZXIsIG1hdGNoKSB7XG4gICAgaWYgKCFtYXRjaCkgcmV0dXJuIGZhbHNlO1xuICAgIHZhciByZXN1bHQgPSAkaW5qZWN0b3IuaW52b2tlKGhhbmRsZXIsIGhhbmRsZXIsIHsgJG1hdGNoOiBtYXRjaCB9KTtcbiAgICByZXR1cm4gaXNEZWZpbmVkKHJlc3VsdCkgPyByZXN1bHQgOiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlciN3aGVuXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVnaXN0ZXJzIGEgaGFuZGxlciBmb3IgYSBnaXZlbiB1cmwgbWF0Y2hpbmcuIFxuICAgKiBcbiAgICogSWYgdGhlIGhhbmRsZXIgaXMgYSBzdHJpbmcsIGl0IGlzXG4gICAqIHRyZWF0ZWQgYXMgYSByZWRpcmVjdCwgYW5kIGlzIGludGVycG9sYXRlZCBhY2NvcmRpbmcgdG8gdGhlIHN5bnRheCBvZiBtYXRjaFxuICAgKiAoaS5lLiBsaWtlIGBTdHJpbmcucmVwbGFjZSgpYCBmb3IgYFJlZ0V4cGAsIG9yIGxpa2UgYSBgVXJsTWF0Y2hlcmAgcGF0dGVybiBvdGhlcndpc2UpLlxuICAgKlxuICAgKiBJZiB0aGUgaGFuZGxlciBpcyBhIGZ1bmN0aW9uLCBpdCBpcyBpbmplY3RhYmxlLiBJdCBnZXRzIGludm9rZWQgaWYgYCRsb2NhdGlvbmBcbiAgICogbWF0Y2hlcy4gWW91IGhhdmUgdGhlIG9wdGlvbiBvZiBpbmplY3QgdGhlIG1hdGNoIG9iamVjdCBhcyBgJG1hdGNoYC5cbiAgICpcbiAgICogVGhlIGhhbmRsZXIgY2FuIHJldHVyblxuICAgKlxuICAgKiAtICoqZmFsc3kqKiB0byBpbmRpY2F0ZSB0aGF0IHRoZSBydWxlIGRpZG4ndCBtYXRjaCBhZnRlciBhbGwsIHRoZW4gYCR1cmxSb3V0ZXJgXG4gICAqICAgd2lsbCBjb250aW51ZSB0cnlpbmcgdG8gZmluZCBhbm90aGVyIG9uZSB0aGF0IG1hdGNoZXMuXG4gICAqIC0gKipzdHJpbmcqKiB3aGljaCBpcyB0cmVhdGVkIGFzIGEgcmVkaXJlY3QgYW5kIHBhc3NlZCB0byBgJGxvY2F0aW9uLnVybCgpYFxuICAgKiAtICoqdm9pZCoqIG9yIGFueSAqKnRydXRoeSoqIHZhbHVlIHRlbGxzIGAkdXJsUm91dGVyYCB0aGF0IHRoZSB1cmwgd2FzIGhhbmRsZWQuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIDxwcmU+XG4gICAqIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXIucm91dGVyJ10pO1xuICAgKlxuICAgKiBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICogICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbigkc3RhdGUudXJsLCBmdW5jdGlvbiAoJG1hdGNoLCAkc3RhdGVQYXJhbXMpIHtcbiAgICogICAgIGlmICgkc3RhdGUuJGN1cnJlbnQubmF2aWdhYmxlICE9PSBzdGF0ZSB8fFxuICAgKiAgICAgICAgICFlcXVhbEZvcktleXMoJG1hdGNoLCAkc3RhdGVQYXJhbXMpIHtcbiAgICogICAgICAkc3RhdGUudHJhbnNpdGlvblRvKHN0YXRlLCAkbWF0Y2gsIGZhbHNlKTtcbiAgICogICAgIH1cbiAgICogICB9KTtcbiAgICogfSk7XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHdoYXQgVGhlIGluY29taW5nIHBhdGggdGhhdCB5b3Ugd2FudCB0byByZWRpcmVjdC5cbiAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IGhhbmRsZXIgVGhlIHBhdGggeW91IHdhbnQgdG8gcmVkaXJlY3QgeW91ciB1c2VyIHRvLlxuICAgKi9cbiAgdGhpcy53aGVuID0gZnVuY3Rpb24gKHdoYXQsIGhhbmRsZXIpIHtcbiAgICB2YXIgcmVkaXJlY3QsIGhhbmRsZXJJc1N0cmluZyA9IGlzU3RyaW5nKGhhbmRsZXIpO1xuICAgIGlmIChpc1N0cmluZyh3aGF0KSkgd2hhdCA9ICR1cmxNYXRjaGVyRmFjdG9yeS5jb21waWxlKHdoYXQpO1xuXG4gICAgaWYgKCFoYW5kbGVySXNTdHJpbmcgJiYgIWlzRnVuY3Rpb24oaGFuZGxlcikgJiYgIWlzQXJyYXkoaGFuZGxlcikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkICdoYW5kbGVyJyBpbiB3aGVuKClcIik7XG5cbiAgICB2YXIgc3RyYXRlZ2llcyA9IHtcbiAgICAgIG1hdGNoZXI6IGZ1bmN0aW9uICh3aGF0LCBoYW5kbGVyKSB7XG4gICAgICAgIGlmIChoYW5kbGVySXNTdHJpbmcpIHtcbiAgICAgICAgICByZWRpcmVjdCA9ICR1cmxNYXRjaGVyRmFjdG9yeS5jb21waWxlKGhhbmRsZXIpO1xuICAgICAgICAgIGhhbmRsZXIgPSBbJyRtYXRjaCcsIGZ1bmN0aW9uICgkbWF0Y2gpIHsgcmV0dXJuIHJlZGlyZWN0LmZvcm1hdCgkbWF0Y2gpOyB9XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXh0ZW5kKGZ1bmN0aW9uICgkaW5qZWN0b3IsICRsb2NhdGlvbikge1xuICAgICAgICAgIHJldHVybiBoYW5kbGVJZk1hdGNoKCRpbmplY3RvciwgaGFuZGxlciwgd2hhdC5leGVjKCRsb2NhdGlvbi5wYXRoKCksICRsb2NhdGlvbi5zZWFyY2goKSkpO1xuICAgICAgICB9LCB7XG4gICAgICAgICAgcHJlZml4OiBpc1N0cmluZyh3aGF0LnByZWZpeCkgPyB3aGF0LnByZWZpeCA6ICcnXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIHJlZ2V4OiBmdW5jdGlvbiAod2hhdCwgaGFuZGxlcikge1xuICAgICAgICBpZiAod2hhdC5nbG9iYWwgfHwgd2hhdC5zdGlja3kpIHRocm93IG5ldyBFcnJvcihcIndoZW4oKSBSZWdFeHAgbXVzdCBub3QgYmUgZ2xvYmFsIG9yIHN0aWNreVwiKTtcblxuICAgICAgICBpZiAoaGFuZGxlcklzU3RyaW5nKSB7XG4gICAgICAgICAgcmVkaXJlY3QgPSBoYW5kbGVyO1xuICAgICAgICAgIGhhbmRsZXIgPSBbJyRtYXRjaCcsIGZ1bmN0aW9uICgkbWF0Y2gpIHsgcmV0dXJuIGludGVycG9sYXRlKHJlZGlyZWN0LCAkbWF0Y2gpOyB9XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXh0ZW5kKGZ1bmN0aW9uICgkaW5qZWN0b3IsICRsb2NhdGlvbikge1xuICAgICAgICAgIHJldHVybiBoYW5kbGVJZk1hdGNoKCRpbmplY3RvciwgaGFuZGxlciwgd2hhdC5leGVjKCRsb2NhdGlvbi5wYXRoKCkpKTtcbiAgICAgICAgfSwge1xuICAgICAgICAgIHByZWZpeDogcmVnRXhwUHJlZml4KHdoYXQpXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgY2hlY2sgPSB7IG1hdGNoZXI6ICR1cmxNYXRjaGVyRmFjdG9yeS5pc01hdGNoZXIod2hhdCksIHJlZ2V4OiB3aGF0IGluc3RhbmNlb2YgUmVnRXhwIH07XG5cbiAgICBmb3IgKHZhciBuIGluIGNoZWNrKSB7XG4gICAgICBpZiAoY2hlY2tbbl0pIHJldHVybiB0aGlzLnJ1bGUoc3RyYXRlZ2llc1tuXSh3aGF0LCBoYW5kbGVyKSk7XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCAnd2hhdCcgaW4gd2hlbigpXCIpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXIjZGVmZXJJbnRlcmNlcHRcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBEaXNhYmxlcyAob3IgZW5hYmxlcykgZGVmZXJyaW5nIGxvY2F0aW9uIGNoYW5nZSBpbnRlcmNlcHRpb24uXG4gICAqXG4gICAqIElmIHlvdSB3aXNoIHRvIGN1c3RvbWl6ZSB0aGUgYmVoYXZpb3Igb2Ygc3luY2luZyB0aGUgVVJMIChmb3IgZXhhbXBsZSwgaWYgeW91IHdpc2ggdG9cbiAgICogZGVmZXIgYSB0cmFuc2l0aW9uIGJ1dCBtYWludGFpbiB0aGUgY3VycmVudCBVUkwpLCBjYWxsIHRoaXMgbWV0aG9kIGF0IGNvbmZpZ3VyYXRpb24gdGltZS5cbiAgICogVGhlbiwgYXQgcnVuIHRpbWUsIGNhbGwgYCR1cmxSb3V0ZXIubGlzdGVuKClgIGFmdGVyIHlvdSBoYXZlIGNvbmZpZ3VyZWQgeW91ciBvd25cbiAgICogYCRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3NgIGV2ZW50IGhhbmRsZXIuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIDxwcmU+XG4gICAqIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXIucm91dGVyJ10pO1xuICAgKlxuICAgKiBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICpcbiAgICogICAvLyBQcmV2ZW50ICR1cmxSb3V0ZXIgZnJvbSBhdXRvbWF0aWNhbGx5IGludGVyY2VwdGluZyBVUkwgY2hhbmdlcztcbiAgICogICAvLyB0aGlzIGFsbG93cyB5b3UgdG8gY29uZmlndXJlIGN1c3RvbSBiZWhhdmlvciBpbiBiZXR3ZWVuXG4gICAqICAgLy8gbG9jYXRpb24gY2hhbmdlcyBhbmQgcm91dGUgc3luY2hyb25pemF0aW9uOlxuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci5kZWZlckludGVyY2VwdCgpO1xuICAgKlxuICAgKiB9KS5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsICR1cmxSb3V0ZXIsIFVzZXJTZXJ2aWNlKSB7XG4gICAqXG4gICAqICAgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihlKSB7XG4gICAqICAgICAvLyBVc2VyU2VydmljZSBpcyBhbiBleGFtcGxlIHNlcnZpY2UgZm9yIG1hbmFnaW5nIHVzZXIgc3RhdGVcbiAgICogICAgIGlmIChVc2VyU2VydmljZS5pc0xvZ2dlZEluKCkpIHJldHVybjtcbiAgICpcbiAgICogICAgIC8vIFByZXZlbnQgJHVybFJvdXRlcidzIGRlZmF1bHQgaGFuZGxlciBmcm9tIGZpcmluZ1xuICAgKiAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgKlxuICAgKiAgICAgVXNlclNlcnZpY2UuaGFuZGxlTG9naW4oKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgKiAgICAgICAvLyBPbmNlIHRoZSB1c2VyIGhhcyBsb2dnZWQgaW4sIHN5bmMgdGhlIGN1cnJlbnQgVVJMXG4gICAqICAgICAgIC8vIHRvIHRoZSByb3V0ZXI6XG4gICAqICAgICAgICR1cmxSb3V0ZXIuc3luYygpO1xuICAgKiAgICAgfSk7XG4gICAqICAgfSk7XG4gICAqXG4gICAqICAgLy8gQ29uZmlndXJlcyAkdXJsUm91dGVyJ3MgbGlzdGVuZXIgKmFmdGVyKiB5b3VyIGN1c3RvbSBsaXN0ZW5lclxuICAgKiAgICR1cmxSb3V0ZXIubGlzdGVuKCk7XG4gICAqIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFufSBkZWZlciBJbmRpY2F0ZXMgd2hldGhlciB0byBkZWZlciBsb2NhdGlvbiBjaGFuZ2UgaW50ZXJjZXB0aW9uLiBQYXNzaW5nXG4gICAgICAgICAgICBubyBwYXJhbWV0ZXIgaXMgZXF1aXZhbGVudCB0byBgdHJ1ZWAuXG4gICAqL1xuICB0aGlzLmRlZmVySW50ZXJjZXB0ID0gZnVuY3Rpb24gKGRlZmVyKSB7XG4gICAgaWYgKGRlZmVyID09PSB1bmRlZmluZWQpIGRlZmVyID0gdHJ1ZTtcbiAgICBpbnRlcmNlcHREZWZlcnJlZCA9IGRlZmVyO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2Mgb2JqZWN0XG4gICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclxuICAgKlxuICAgKiBAcmVxdWlyZXMgJGxvY2F0aW9uXG4gICAqIEByZXF1aXJlcyAkcm9vdFNjb3BlXG4gICAqIEByZXF1aXJlcyAkaW5qZWN0b3JcbiAgICogQHJlcXVpcmVzICRicm93c2VyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKlxuICAgKi9cbiAgdGhpcy4kZ2V0ID0gJGdldDtcbiAgJGdldC4kaW5qZWN0ID0gWyckbG9jYXRpb24nLCAnJHJvb3RTY29wZScsICckaW5qZWN0b3InLCAnJGJyb3dzZXInLCAnJHNuaWZmZXInXTtcbiAgZnVuY3Rpb24gJGdldCggICAkbG9jYXRpb24sICAgJHJvb3RTY29wZSwgICAkaW5qZWN0b3IsICAgJGJyb3dzZXIsICAgJHNuaWZmZXIpIHtcblxuICAgIHZhciBiYXNlSHJlZiA9ICRicm93c2VyLmJhc2VIcmVmKCksIGxvY2F0aW9uID0gJGxvY2F0aW9uLnVybCgpLCBsYXN0UHVzaGVkVXJsO1xuXG4gICAgZnVuY3Rpb24gYXBwZW5kQmFzZVBhdGgodXJsLCBpc0h0bWw1LCBhYnNvbHV0ZSkge1xuICAgICAgaWYgKGJhc2VIcmVmID09PSAnLycpIHJldHVybiB1cmw7XG4gICAgICBpZiAoaXNIdG1sNSkgcmV0dXJuIGJhc2VIcmVmLnNsaWNlKDAsIC0xKSArIHVybDtcbiAgICAgIGlmIChhYnNvbHV0ZSkgcmV0dXJuIGJhc2VIcmVmLnNsaWNlKDEpICsgdXJsO1xuICAgICAgcmV0dXJuIHVybDtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBPcHRpbWl6ZSBncm91cHMgb2YgcnVsZXMgd2l0aCBub24tZW1wdHkgcHJlZml4IGludG8gc29tZSBzb3J0IG9mIGRlY2lzaW9uIHRyZWVcbiAgICBmdW5jdGlvbiB1cGRhdGUoZXZ0KSB7XG4gICAgICBpZiAoZXZ0ICYmIGV2dC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG4gICAgICB2YXIgaWdub3JlVXBkYXRlID0gbGFzdFB1c2hlZFVybCAmJiAkbG9jYXRpb24udXJsKCkgPT09IGxhc3RQdXNoZWRVcmw7XG4gICAgICBsYXN0UHVzaGVkVXJsID0gdW5kZWZpbmVkO1xuICAgICAgLy8gVE9ETzogUmUtaW1wbGVtZW50IHRoaXMgaW4gMS4wIGZvciBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci11aS91aS1yb3V0ZXIvaXNzdWVzLzE1NzNcbiAgICAgIC8vaWYgKGlnbm9yZVVwZGF0ZSkgcmV0dXJuIHRydWU7XG5cbiAgICAgIGZ1bmN0aW9uIGNoZWNrKHJ1bGUpIHtcbiAgICAgICAgdmFyIGhhbmRsZWQgPSBydWxlKCRpbmplY3RvciwgJGxvY2F0aW9uKTtcblxuICAgICAgICBpZiAoIWhhbmRsZWQpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGlzU3RyaW5nKGhhbmRsZWQpKSAkbG9jYXRpb24ucmVwbGFjZSgpLnVybChoYW5kbGVkKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICB2YXIgbiA9IHJ1bGVzLmxlbmd0aCwgaTtcblxuICAgICAgZm9yIChpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICBpZiAoY2hlY2socnVsZXNbaV0pKSByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBhbHdheXMgY2hlY2sgb3RoZXJ3aXNlIGxhc3QgdG8gYWxsb3cgZHluYW1pYyB1cGRhdGVzIHRvIHRoZSBzZXQgb2YgcnVsZXNcbiAgICAgIGlmIChvdGhlcndpc2UpIGNoZWNrKG90aGVyd2lzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGlzdGVuKCkge1xuICAgICAgbGlzdGVuZXIgPSBsaXN0ZW5lciB8fCAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIHVwZGF0ZSk7XG4gICAgICByZXR1cm4gbGlzdGVuZXI7XG4gICAgfVxuXG4gICAgaWYgKCFpbnRlcmNlcHREZWZlcnJlZCkgbGlzdGVuKCk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlciNzeW5jXG4gICAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBUcmlnZ2VycyBhbiB1cGRhdGU7IHRoZSBzYW1lIHVwZGF0ZSB0aGF0IGhhcHBlbnMgd2hlbiB0aGUgYWRkcmVzcyBiYXIgdXJsIGNoYW5nZXMsIGFrYSBgJGxvY2F0aW9uQ2hhbmdlU3VjY2Vzc2AuXG4gICAgICAgKiBUaGlzIG1ldGhvZCBpcyB1c2VmdWwgd2hlbiB5b3UgbmVlZCB0byB1c2UgYHByZXZlbnREZWZhdWx0KClgIG9uIHRoZSBgJGxvY2F0aW9uQ2hhbmdlU3VjY2Vzc2AgZXZlbnQsXG4gICAgICAgKiBwZXJmb3JtIHNvbWUgY3VzdG9tIGxvZ2ljIChyb3V0ZSBwcm90ZWN0aW9uLCBhdXRoLCBjb25maWcsIHJlZGlyZWN0aW9uLCBldGMpIGFuZCB0aGVuIGZpbmFsbHkgcHJvY2VlZFxuICAgICAgICogd2l0aCB0aGUgdHJhbnNpdGlvbiBieSBjYWxsaW5nIGAkdXJsUm91dGVyLnN5bmMoKWAuXG4gICAgICAgKlxuICAgICAgICogQGV4YW1wbGVcbiAgICAgICAqIDxwcmU+XG4gICAgICAgKiBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXInXSlcbiAgICAgICAqICAgLnJ1bihmdW5jdGlvbigkcm9vdFNjb3BlLCAkdXJsUm91dGVyKSB7XG4gICAgICAgKiAgICAgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldnQpIHtcbiAgICAgICAqICAgICAgIC8vIEhhbHQgc3RhdGUgY2hhbmdlIGZyb20gZXZlbiBzdGFydGluZ1xuICAgICAgICogICAgICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgKiAgICAgICAvLyBQZXJmb3JtIGN1c3RvbSBsb2dpY1xuICAgICAgICogICAgICAgdmFyIG1lZXRzUmVxdWlyZW1lbnQgPSAuLi5cbiAgICAgICAqICAgICAgIC8vIENvbnRpbnVlIHdpdGggdGhlIHVwZGF0ZSBhbmQgc3RhdGUgdHJhbnNpdGlvbiBpZiBsb2dpYyBhbGxvd3NcbiAgICAgICAqICAgICAgIGlmIChtZWV0c1JlcXVpcmVtZW50KSAkdXJsUm91dGVyLnN5bmMoKTtcbiAgICAgICAqICAgICB9KTtcbiAgICAgICAqIH0pO1xuICAgICAgICogPC9wcmU+XG4gICAgICAgKi9cbiAgICAgIHN5bmM6IGZ1bmN0aW9uKCkge1xuICAgICAgICB1cGRhdGUoKTtcbiAgICAgIH0sXG5cbiAgICAgIGxpc3RlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW4oKTtcbiAgICAgIH0sXG5cbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24ocmVhZCkge1xuICAgICAgICBpZiAocmVhZCkge1xuICAgICAgICAgIGxvY2F0aW9uID0gJGxvY2F0aW9uLnVybCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJGxvY2F0aW9uLnVybCgpID09PSBsb2NhdGlvbikgcmV0dXJuO1xuXG4gICAgICAgICRsb2NhdGlvbi51cmwobG9jYXRpb24pO1xuICAgICAgICAkbG9jYXRpb24ucmVwbGFjZSgpO1xuICAgICAgfSxcblxuICAgICAgcHVzaDogZnVuY3Rpb24odXJsTWF0Y2hlciwgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgICB2YXIgdXJsID0gdXJsTWF0Y2hlci5mb3JtYXQocGFyYW1zIHx8IHt9KTtcblxuICAgICAgICAvLyBIYW5kbGUgdGhlIHNwZWNpYWwgaGFzaCBwYXJhbSwgaWYgbmVlZGVkXG4gICAgICAgIGlmICh1cmwgIT09IG51bGwgJiYgcGFyYW1zICYmIHBhcmFtc1snIyddKSB7XG4gICAgICAgICAgICB1cmwgKz0gJyMnICsgcGFyYW1zWycjJ107XG4gICAgICAgIH1cblxuICAgICAgICAkbG9jYXRpb24udXJsKHVybCk7XG4gICAgICAgIGxhc3RQdXNoZWRVcmwgPSBvcHRpb25zICYmIG9wdGlvbnMuJCRhdm9pZFJlc3luYyA/ICRsb2NhdGlvbi51cmwoKSA6IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5yZXBsYWNlKSAkbG9jYXRpb24ucmVwbGFjZSgpO1xuICAgICAgfSxcblxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlciNocmVmXG4gICAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyXG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBBIFVSTCBnZW5lcmF0aW9uIG1ldGhvZCB0aGF0IHJldHVybnMgdGhlIGNvbXBpbGVkIFVSTCBmb3IgYSBnaXZlblxuICAgICAgICoge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBgVXJsTWF0Y2hlcmB9LCBwb3B1bGF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgcGFyYW1ldGVycy5cbiAgICAgICAqXG4gICAgICAgKiBAZXhhbXBsZVxuICAgICAgICogPHByZT5cbiAgICAgICAqICRib2IgPSAkdXJsUm91dGVyLmhyZWYobmV3IFVybE1hdGNoZXIoXCIvYWJvdXQvOnBlcnNvblwiKSwge1xuICAgICAgICogICBwZXJzb246IFwiYm9iXCJcbiAgICAgICAqIH0pO1xuICAgICAgICogLy8gJGJvYiA9PSBcIi9hYm91dC9ib2JcIjtcbiAgICAgICAqIDwvcHJlPlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7VXJsTWF0Y2hlcn0gdXJsTWF0Y2hlciBUaGUgYFVybE1hdGNoZXJgIG9iamVjdCB3aGljaCBpcyB1c2VkIGFzIHRoZSB0ZW1wbGF0ZSBvZiB0aGUgVVJMIHRvIGdlbmVyYXRlLlxuICAgICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQW4gb2JqZWN0IG9mIHBhcmFtZXRlciB2YWx1ZXMgdG8gZmlsbCB0aGUgbWF0Y2hlcidzIHJlcXVpcmVkIHBhcmFtZXRlcnMuXG4gICAgICAgKiBAcGFyYW0ge29iamVjdD19IG9wdGlvbnMgT3B0aW9ucyBvYmplY3QuIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgICAqXG4gICAgICAgKiAtICoqYGFic29sdXRlYCoqIC0ge2Jvb2xlYW49ZmFsc2V9LCAgSWYgdHJ1ZSB3aWxsIGdlbmVyYXRlIGFuIGFic29sdXRlIHVybCwgZS5nLiBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vZnVsbHVybFwiLlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGZ1bGx5IGNvbXBpbGVkIFVSTCwgb3IgYG51bGxgIGlmIGBwYXJhbXNgIGZhaWwgdmFsaWRhdGlvbiBhZ2FpbnN0IGB1cmxNYXRjaGVyYFxuICAgICAgICovXG4gICAgICBocmVmOiBmdW5jdGlvbih1cmxNYXRjaGVyLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCF1cmxNYXRjaGVyLnZhbGlkYXRlcyhwYXJhbXMpKSByZXR1cm4gbnVsbDtcblxuICAgICAgICB2YXIgaXNIdG1sNSA9ICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSgpO1xuICAgICAgICBpZiAoYW5ndWxhci5pc09iamVjdChpc0h0bWw1KSkge1xuICAgICAgICAgIGlzSHRtbDUgPSBpc0h0bWw1LmVuYWJsZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBpc0h0bWw1ID0gaXNIdG1sNSAmJiAkc25pZmZlci5oaXN0b3J5O1xuICAgICAgICBcbiAgICAgICAgdmFyIHVybCA9IHVybE1hdGNoZXIuZm9ybWF0KHBhcmFtcyk7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgICAgIGlmICghaXNIdG1sNSAmJiB1cmwgIT09IG51bGwpIHtcbiAgICAgICAgICB1cmwgPSBcIiNcIiArICRsb2NhdGlvblByb3ZpZGVyLmhhc2hQcmVmaXgoKSArIHVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBzcGVjaWFsIGhhc2ggcGFyYW0sIGlmIG5lZWRlZFxuICAgICAgICBpZiAodXJsICE9PSBudWxsICYmIHBhcmFtcyAmJiBwYXJhbXNbJyMnXSkge1xuICAgICAgICAgIHVybCArPSAnIycgKyBwYXJhbXNbJyMnXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVybCA9IGFwcGVuZEJhc2VQYXRoKHVybCwgaXNIdG1sNSwgb3B0aW9ucy5hYnNvbHV0ZSk7XG5cbiAgICAgICAgaWYgKCFvcHRpb25zLmFic29sdXRlIHx8ICF1cmwpIHtcbiAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNsYXNoID0gKCFpc0h0bWw1ICYmIHVybCA/ICcvJyA6ICcnKSwgcG9ydCA9ICRsb2NhdGlvbi5wb3J0KCk7XG4gICAgICAgIHBvcnQgPSAocG9ydCA9PT0gODAgfHwgcG9ydCA9PT0gNDQzID8gJycgOiAnOicgKyBwb3J0KTtcblxuICAgICAgICByZXR1cm4gWyRsb2NhdGlvbi5wcm90b2NvbCgpLCAnOi8vJywgJGxvY2F0aW9uLmhvc3QoKSwgcG9ydCwgc2xhc2gsIHVybF0uam9pbignJyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnJvdXRlcicpLnByb3ZpZGVyKCckdXJsUm91dGVyJywgJFVybFJvdXRlclByb3ZpZGVyKTtcblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXJcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXJcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIG5ldyBgJHN0YXRlUHJvdmlkZXJgIHdvcmtzIHNpbWlsYXIgdG8gQW5ndWxhcidzIHYxIHJvdXRlciwgYnV0IGl0IGZvY3VzZXMgcHVyZWx5XG4gKiBvbiBzdGF0ZS5cbiAqXG4gKiBBIHN0YXRlIGNvcnJlc3BvbmRzIHRvIGEgXCJwbGFjZVwiIGluIHRoZSBhcHBsaWNhdGlvbiBpbiB0ZXJtcyBvZiB0aGUgb3ZlcmFsbCBVSSBhbmRcbiAqIG5hdmlnYXRpb24uIEEgc3RhdGUgZGVzY3JpYmVzICh2aWEgdGhlIGNvbnRyb2xsZXIgLyB0ZW1wbGF0ZSAvIHZpZXcgcHJvcGVydGllcykgd2hhdFxuICogdGhlIFVJIGxvb2tzIGxpa2UgYW5kIGRvZXMgYXQgdGhhdCBwbGFjZS5cbiAqXG4gKiBTdGF0ZXMgb2Z0ZW4gaGF2ZSB0aGluZ3MgaW4gY29tbW9uLCBhbmQgdGhlIHByaW1hcnkgd2F5IG9mIGZhY3RvcmluZyBvdXQgdGhlc2VcbiAqIGNvbW1vbmFsaXRpZXMgaW4gdGhpcyBtb2RlbCBpcyB2aWEgdGhlIHN0YXRlIGhpZXJhcmNoeSwgaS5lLiBwYXJlbnQvY2hpbGQgc3RhdGVzIGFrYVxuICogbmVzdGVkIHN0YXRlcy5cbiAqXG4gKiBUaGUgYCRzdGF0ZVByb3ZpZGVyYCBwcm92aWRlcyBpbnRlcmZhY2VzIHRvIGRlY2xhcmUgdGhlc2Ugc3RhdGVzIGZvciB5b3VyIGFwcC5cbiAqL1xuJFN0YXRlUHJvdmlkZXIuJGluamVjdCA9IFsnJHVybFJvdXRlclByb3ZpZGVyJywgJyR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyJ107XG5mdW5jdGlvbiAkU3RhdGVQcm92aWRlciggICAkdXJsUm91dGVyUHJvdmlkZXIsICAgJHVybE1hdGNoZXJGYWN0b3J5KSB7XG5cbiAgdmFyIHJvb3QsIHN0YXRlcyA9IHt9LCAkc3RhdGUsIHF1ZXVlID0ge30sIGFic3RyYWN0S2V5ID0gJ2Fic3RyYWN0JztcblxuICAvLyBCdWlsZHMgc3RhdGUgcHJvcGVydGllcyBmcm9tIGRlZmluaXRpb24gcGFzc2VkIHRvIHJlZ2lzdGVyU3RhdGUoKVxuICB2YXIgc3RhdGVCdWlsZGVyID0ge1xuXG4gICAgLy8gRGVyaXZlIHBhcmVudCBzdGF0ZSBmcm9tIGEgaGllcmFyY2hpY2FsIG5hbWUgb25seSBpZiAncGFyZW50JyBpcyBub3QgZXhwbGljaXRseSBkZWZpbmVkLlxuICAgIC8vIHN0YXRlLmNoaWxkcmVuID0gW107XG4gICAgLy8gaWYgKHBhcmVudCkgcGFyZW50LmNoaWxkcmVuLnB1c2goc3RhdGUpO1xuICAgIHBhcmVudDogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIGlmIChpc0RlZmluZWQoc3RhdGUucGFyZW50KSAmJiBzdGF0ZS5wYXJlbnQpIHJldHVybiBmaW5kU3RhdGUoc3RhdGUucGFyZW50KTtcbiAgICAgIC8vIHJlZ2V4IG1hdGNoZXMgYW55IHZhbGlkIGNvbXBvc2l0ZSBzdGF0ZSBuYW1lXG4gICAgICAvLyB3b3VsZCBtYXRjaCBcImNvbnRhY3QubGlzdFwiIGJ1dCBub3QgXCJjb250YWN0c1wiXG4gICAgICB2YXIgY29tcG9zaXRlTmFtZSA9IC9eKC4rKVxcLlteLl0rJC8uZXhlYyhzdGF0ZS5uYW1lKTtcbiAgICAgIHJldHVybiBjb21wb3NpdGVOYW1lID8gZmluZFN0YXRlKGNvbXBvc2l0ZU5hbWVbMV0pIDogcm9vdDtcbiAgICB9LFxuXG4gICAgLy8gaW5oZXJpdCAnZGF0YScgZnJvbSBwYXJlbnQgYW5kIG92ZXJyaWRlIGJ5IG93biB2YWx1ZXMgKGlmIGFueSlcbiAgICBkYXRhOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgaWYgKHN0YXRlLnBhcmVudCAmJiBzdGF0ZS5wYXJlbnQuZGF0YSkge1xuICAgICAgICBzdGF0ZS5kYXRhID0gc3RhdGUuc2VsZi5kYXRhID0gaW5oZXJpdChzdGF0ZS5wYXJlbnQuZGF0YSwgc3RhdGUuZGF0YSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RhdGUuZGF0YTtcbiAgICB9LFxuXG4gICAgLy8gQnVpbGQgYSBVUkxNYXRjaGVyIGlmIG5lY2Vzc2FyeSwgZWl0aGVyIHZpYSBhIHJlbGF0aXZlIG9yIGFic29sdXRlIFVSTFxuICAgIHVybDogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHZhciB1cmwgPSBzdGF0ZS51cmwsIGNvbmZpZyA9IHsgcGFyYW1zOiBzdGF0ZS5wYXJhbXMgfHwge30gfTtcblxuICAgICAgaWYgKGlzU3RyaW5nKHVybCkpIHtcbiAgICAgICAgaWYgKHVybC5jaGFyQXQoMCkgPT0gJ14nKSByZXR1cm4gJHVybE1hdGNoZXJGYWN0b3J5LmNvbXBpbGUodXJsLnN1YnN0cmluZygxKSwgY29uZmlnKTtcbiAgICAgICAgcmV0dXJuIChzdGF0ZS5wYXJlbnQubmF2aWdhYmxlIHx8IHJvb3QpLnVybC5jb25jYXQodXJsLCBjb25maWcpO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXVybCB8fCAkdXJsTWF0Y2hlckZhY3RvcnkuaXNNYXRjaGVyKHVybCkpIHJldHVybiB1cmw7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHVybCAnXCIgKyB1cmwgKyBcIicgaW4gc3RhdGUgJ1wiICsgc3RhdGUgKyBcIidcIik7XG4gICAgfSxcblxuICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGNsb3Nlc3QgYW5jZXN0b3Igc3RhdGUgdGhhdCBoYXMgYSBVUkwgKGkuZS4gaXMgbmF2aWdhYmxlKVxuICAgIG5hdmlnYWJsZTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHJldHVybiBzdGF0ZS51cmwgPyBzdGF0ZSA6IChzdGF0ZS5wYXJlbnQgPyBzdGF0ZS5wYXJlbnQubmF2aWdhYmxlIDogbnVsbCk7XG4gICAgfSxcblxuICAgIC8vIE93biBwYXJhbWV0ZXJzIGZvciB0aGlzIHN0YXRlLiBzdGF0ZS51cmwucGFyYW1zIGlzIGFscmVhZHkgYnVpbHQgYXQgdGhpcyBwb2ludC4gQ3JlYXRlIGFuZCBhZGQgbm9uLXVybCBwYXJhbXNcbiAgICBvd25QYXJhbXM6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICB2YXIgcGFyYW1zID0gc3RhdGUudXJsICYmIHN0YXRlLnVybC5wYXJhbXMgfHwgbmV3ICQkVU1GUC5QYXJhbVNldCgpO1xuICAgICAgZm9yRWFjaChzdGF0ZS5wYXJhbXMgfHwge30sIGZ1bmN0aW9uKGNvbmZpZywgaWQpIHtcbiAgICAgICAgaWYgKCFwYXJhbXNbaWRdKSBwYXJhbXNbaWRdID0gbmV3ICQkVU1GUC5QYXJhbShpZCwgbnVsbCwgY29uZmlnLCBcImNvbmZpZ1wiKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9LFxuXG4gICAgLy8gRGVyaXZlIHBhcmFtZXRlcnMgZm9yIHRoaXMgc3RhdGUgYW5kIGVuc3VyZSB0aGV5J3JlIGEgc3VwZXItc2V0IG9mIHBhcmVudCdzIHBhcmFtZXRlcnNcbiAgICBwYXJhbXM6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICB2YXIgb3duUGFyYW1zID0gcGljayhzdGF0ZS5vd25QYXJhbXMsIHN0YXRlLm93blBhcmFtcy4kJGtleXMoKSk7XG4gICAgICByZXR1cm4gc3RhdGUucGFyZW50ICYmIHN0YXRlLnBhcmVudC5wYXJhbXMgPyBleHRlbmQoc3RhdGUucGFyZW50LnBhcmFtcy4kJG5ldygpLCBvd25QYXJhbXMpIDogbmV3ICQkVU1GUC5QYXJhbVNldCgpO1xuICAgIH0sXG5cbiAgICAvLyBJZiB0aGVyZSBpcyBubyBleHBsaWNpdCBtdWx0aS12aWV3IGNvbmZpZ3VyYXRpb24sIG1ha2Ugb25lIHVwIHNvIHdlIGRvbid0IGhhdmVcbiAgICAvLyB0byBoYW5kbGUgYm90aCBjYXNlcyBpbiB0aGUgdmlldyBkaXJlY3RpdmUgbGF0ZXIuIE5vdGUgdGhhdCBoYXZpbmcgYW4gZXhwbGljaXRcbiAgICAvLyAndmlld3MnIHByb3BlcnR5IHdpbGwgbWVhbiB0aGUgZGVmYXVsdCB1bm5hbWVkIHZpZXcgcHJvcGVydGllcyBhcmUgaWdub3JlZC4gVGhpc1xuICAgIC8vIGlzIGFsc28gYSBnb29kIHRpbWUgdG8gcmVzb2x2ZSB2aWV3IG5hbWVzIHRvIGFic29sdXRlIG5hbWVzLCBzbyBldmVyeXRoaW5nIGlzIGFcbiAgICAvLyBzdHJhaWdodCBsb29rdXAgYXQgbGluayB0aW1lLlxuICAgIHZpZXdzOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdmFyIHZpZXdzID0ge307XG5cbiAgICAgIGZvckVhY2goaXNEZWZpbmVkKHN0YXRlLnZpZXdzKSA/IHN0YXRlLnZpZXdzIDogeyAnJzogc3RhdGUgfSwgZnVuY3Rpb24gKHZpZXcsIG5hbWUpIHtcbiAgICAgICAgaWYgKG5hbWUuaW5kZXhPZignQCcpIDwgMCkgbmFtZSArPSAnQCcgKyBzdGF0ZS5wYXJlbnQubmFtZTtcbiAgICAgICAgdmlldy5yZXNvbHZlQXMgPSB2aWV3LnJlc29sdmVBcyB8fCBzdGF0ZS5yZXNvbHZlQXMgfHwgJyRyZXNvbHZlJztcbiAgICAgICAgdmlld3NbbmFtZV0gPSB2aWV3O1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdmlld3M7XG4gICAgfSxcblxuICAgIC8vIEtlZXAgYSBmdWxsIHBhdGggZnJvbSB0aGUgcm9vdCBkb3duIHRvIHRoaXMgc3RhdGUgYXMgdGhpcyBpcyBuZWVkZWQgZm9yIHN0YXRlIGFjdGl2YXRpb24uXG4gICAgcGF0aDogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHJldHVybiBzdGF0ZS5wYXJlbnQgPyBzdGF0ZS5wYXJlbnQucGF0aC5jb25jYXQoc3RhdGUpIDogW107IC8vIGV4Y2x1ZGUgcm9vdCBmcm9tIHBhdGhcbiAgICB9LFxuXG4gICAgLy8gU3BlZWQgdXAgJHN0YXRlLmNvbnRhaW5zKCkgYXMgaXQncyB1c2VkIGEgbG90XG4gICAgaW5jbHVkZXM6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICB2YXIgaW5jbHVkZXMgPSBzdGF0ZS5wYXJlbnQgPyBleHRlbmQoe30sIHN0YXRlLnBhcmVudC5pbmNsdWRlcykgOiB7fTtcbiAgICAgIGluY2x1ZGVzW3N0YXRlLm5hbWVdID0gdHJ1ZTtcbiAgICAgIHJldHVybiBpbmNsdWRlcztcbiAgICB9LFxuXG4gICAgJGRlbGVnYXRlczoge31cbiAgfTtcblxuICBmdW5jdGlvbiBpc1JlbGF0aXZlKHN0YXRlTmFtZSkge1xuICAgIHJldHVybiBzdGF0ZU5hbWUuaW5kZXhPZihcIi5cIikgPT09IDAgfHwgc3RhdGVOYW1lLmluZGV4T2YoXCJeXCIpID09PSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluZFN0YXRlKHN0YXRlT3JOYW1lLCBiYXNlKSB7XG4gICAgaWYgKCFzdGF0ZU9yTmFtZSkgcmV0dXJuIHVuZGVmaW5lZDtcblxuICAgIHZhciBpc1N0ciA9IGlzU3RyaW5nKHN0YXRlT3JOYW1lKSxcbiAgICAgICAgbmFtZSAgPSBpc1N0ciA/IHN0YXRlT3JOYW1lIDogc3RhdGVPck5hbWUubmFtZSxcbiAgICAgICAgcGF0aCAgPSBpc1JlbGF0aXZlKG5hbWUpO1xuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIGlmICghYmFzZSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gcmVmZXJlbmNlIHBvaW50IGdpdmVuIGZvciBwYXRoICdcIiAgKyBuYW1lICsgXCInXCIpO1xuICAgICAgYmFzZSA9IGZpbmRTdGF0ZShiYXNlKTtcbiAgICAgIFxuICAgICAgdmFyIHJlbCA9IG5hbWUuc3BsaXQoXCIuXCIpLCBpID0gMCwgcGF0aExlbmd0aCA9IHJlbC5sZW5ndGgsIGN1cnJlbnQgPSBiYXNlO1xuXG4gICAgICBmb3IgKDsgaSA8IHBhdGhMZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocmVsW2ldID09PSBcIlwiICYmIGkgPT09IDApIHtcbiAgICAgICAgICBjdXJyZW50ID0gYmFzZTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVsW2ldID09PSBcIl5cIikge1xuICAgICAgICAgIGlmICghY3VycmVudC5wYXJlbnQpIHRocm93IG5ldyBFcnJvcihcIlBhdGggJ1wiICsgbmFtZSArIFwiJyBub3QgdmFsaWQgZm9yIHN0YXRlICdcIiArIGJhc2UubmFtZSArIFwiJ1wiKTtcbiAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5wYXJlbnQ7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICByZWwgPSByZWwuc2xpY2UoaSkuam9pbihcIi5cIik7XG4gICAgICBuYW1lID0gY3VycmVudC5uYW1lICsgKGN1cnJlbnQubmFtZSAmJiByZWwgPyBcIi5cIiA6IFwiXCIpICsgcmVsO1xuICAgIH1cbiAgICB2YXIgc3RhdGUgPSBzdGF0ZXNbbmFtZV07XG5cbiAgICBpZiAoc3RhdGUgJiYgKGlzU3RyIHx8ICghaXNTdHIgJiYgKHN0YXRlID09PSBzdGF0ZU9yTmFtZSB8fCBzdGF0ZS5zZWxmID09PSBzdGF0ZU9yTmFtZSkpKSkge1xuICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgZnVuY3Rpb24gcXVldWVTdGF0ZShwYXJlbnROYW1lLCBzdGF0ZSkge1xuICAgIGlmICghcXVldWVbcGFyZW50TmFtZV0pIHtcbiAgICAgIHF1ZXVlW3BhcmVudE5hbWVdID0gW107XG4gICAgfVxuICAgIHF1ZXVlW3BhcmVudE5hbWVdLnB1c2goc3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmx1c2hRdWV1ZWRDaGlsZHJlbihwYXJlbnROYW1lKSB7XG4gICAgdmFyIHF1ZXVlZCA9IHF1ZXVlW3BhcmVudE5hbWVdIHx8IFtdO1xuICAgIHdoaWxlKHF1ZXVlZC5sZW5ndGgpIHtcbiAgICAgIHJlZ2lzdGVyU3RhdGUocXVldWVkLnNoaWZ0KCkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZ2lzdGVyU3RhdGUoc3RhdGUpIHtcbiAgICAvLyBXcmFwIGEgbmV3IG9iamVjdCBhcm91bmQgdGhlIHN0YXRlIHNvIHdlIGNhbiBzdG9yZSBvdXIgcHJpdmF0ZSBkZXRhaWxzIGVhc2lseS5cbiAgICBzdGF0ZSA9IGluaGVyaXQoc3RhdGUsIHtcbiAgICAgIHNlbGY6IHN0YXRlLFxuICAgICAgcmVzb2x2ZTogc3RhdGUucmVzb2x2ZSB8fCB7fSxcbiAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMubmFtZTsgfVxuICAgIH0pO1xuXG4gICAgdmFyIG5hbWUgPSBzdGF0ZS5uYW1lO1xuICAgIGlmICghaXNTdHJpbmcobmFtZSkgfHwgbmFtZS5pbmRleE9mKCdAJykgPj0gMCkgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgbXVzdCBoYXZlIGEgdmFsaWQgbmFtZVwiKTtcbiAgICBpZiAoc3RhdGVzLmhhc093blByb3BlcnR5KG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSAnXCIgKyBuYW1lICsgXCInIGlzIGFscmVhZHkgZGVmaW5lZFwiKTtcblxuICAgIC8vIEdldCBwYXJlbnQgbmFtZVxuICAgIHZhciBwYXJlbnROYW1lID0gKG5hbWUuaW5kZXhPZignLicpICE9PSAtMSkgPyBuYW1lLnN1YnN0cmluZygwLCBuYW1lLmxhc3RJbmRleE9mKCcuJykpXG4gICAgICAgIDogKGlzU3RyaW5nKHN0YXRlLnBhcmVudCkpID8gc3RhdGUucGFyZW50XG4gICAgICAgIDogKGlzT2JqZWN0KHN0YXRlLnBhcmVudCkgJiYgaXNTdHJpbmcoc3RhdGUucGFyZW50Lm5hbWUpKSA/IHN0YXRlLnBhcmVudC5uYW1lXG4gICAgICAgIDogJyc7XG5cbiAgICAvLyBJZiBwYXJlbnQgaXMgbm90IHJlZ2lzdGVyZWQgeWV0LCBhZGQgc3RhdGUgdG8gcXVldWUgYW5kIHJlZ2lzdGVyIGxhdGVyXG4gICAgaWYgKHBhcmVudE5hbWUgJiYgIXN0YXRlc1twYXJlbnROYW1lXSkge1xuICAgICAgcmV0dXJuIHF1ZXVlU3RhdGUocGFyZW50TmFtZSwgc3RhdGUuc2VsZik7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIHN0YXRlQnVpbGRlcikge1xuICAgICAgaWYgKGlzRnVuY3Rpb24oc3RhdGVCdWlsZGVyW2tleV0pKSBzdGF0ZVtrZXldID0gc3RhdGVCdWlsZGVyW2tleV0oc3RhdGUsIHN0YXRlQnVpbGRlci4kZGVsZWdhdGVzW2tleV0pO1xuICAgIH1cbiAgICBzdGF0ZXNbbmFtZV0gPSBzdGF0ZTtcblxuICAgIC8vIFJlZ2lzdGVyIHRoZSBzdGF0ZSBpbiB0aGUgZ2xvYmFsIHN0YXRlIGxpc3QgYW5kIHdpdGggJHVybFJvdXRlciBpZiBuZWNlc3NhcnkuXG4gICAgaWYgKCFzdGF0ZVthYnN0cmFjdEtleV0gJiYgc3RhdGUudXJsKSB7XG4gICAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbihzdGF0ZS51cmwsIFsnJG1hdGNoJywgJyRzdGF0ZVBhcmFtcycsIGZ1bmN0aW9uICgkbWF0Y2gsICRzdGF0ZVBhcmFtcykge1xuICAgICAgICBpZiAoJHN0YXRlLiRjdXJyZW50Lm5hdmlnYWJsZSAhPSBzdGF0ZSB8fCAhZXF1YWxGb3JLZXlzKCRtYXRjaCwgJHN0YXRlUGFyYW1zKSkge1xuICAgICAgICAgICRzdGF0ZS50cmFuc2l0aW9uVG8oc3RhdGUsICRtYXRjaCwgeyBpbmhlcml0OiB0cnVlLCBsb2NhdGlvbjogZmFsc2UgfSk7XG4gICAgICAgIH1cbiAgICAgIH1dKTtcbiAgICB9XG5cbiAgICAvLyBSZWdpc3RlciBhbnkgcXVldWVkIGNoaWxkcmVuXG4gICAgZmx1c2hRdWV1ZWRDaGlsZHJlbihuYW1lKTtcblxuICAgIHJldHVybiBzdGF0ZTtcbiAgfVxuXG4gIC8vIENoZWNrcyB0ZXh0IHRvIHNlZSBpZiBpdCBsb29rcyBsaWtlIGEgZ2xvYi5cbiAgZnVuY3Rpb24gaXNHbG9iICh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQuaW5kZXhPZignKicpID4gLTE7XG4gIH1cblxuICAvLyBSZXR1cm5zIHRydWUgaWYgZ2xvYiBtYXRjaGVzIGN1cnJlbnQgJHN0YXRlIG5hbWUuXG4gIGZ1bmN0aW9uIGRvZXNTdGF0ZU1hdGNoR2xvYiAoZ2xvYikge1xuICAgIHZhciBnbG9iU2VnbWVudHMgPSBnbG9iLnNwbGl0KCcuJyksXG4gICAgICAgIHNlZ21lbnRzID0gJHN0YXRlLiRjdXJyZW50Lm5hbWUuc3BsaXQoJy4nKTtcblxuICAgIC8vbWF0Y2ggc2luZ2xlIHN0YXJzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBnbG9iU2VnbWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoZ2xvYlNlZ21lbnRzW2ldID09PSAnKicpIHtcbiAgICAgICAgc2VnbWVudHNbaV0gPSAnKic7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy9tYXRjaCBncmVlZHkgc3RhcnRzXG4gICAgaWYgKGdsb2JTZWdtZW50c1swXSA9PT0gJyoqJykge1xuICAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMuc2xpY2UoaW5kZXhPZihzZWdtZW50cywgZ2xvYlNlZ21lbnRzWzFdKSk7XG4gICAgICAgc2VnbWVudHMudW5zaGlmdCgnKionKTtcbiAgICB9XG4gICAgLy9tYXRjaCBncmVlZHkgZW5kc1xuICAgIGlmIChnbG9iU2VnbWVudHNbZ2xvYlNlZ21lbnRzLmxlbmd0aCAtIDFdID09PSAnKionKSB7XG4gICAgICAgc2VnbWVudHMuc3BsaWNlKGluZGV4T2Yoc2VnbWVudHMsIGdsb2JTZWdtZW50c1tnbG9iU2VnbWVudHMubGVuZ3RoIC0gMl0pICsgMSwgTnVtYmVyLk1BWF9WQUxVRSk7XG4gICAgICAgc2VnbWVudHMucHVzaCgnKionKTtcbiAgICB9XG5cbiAgICBpZiAoZ2xvYlNlZ21lbnRzLmxlbmd0aCAhPSBzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VnbWVudHMuam9pbignJykgPT09IGdsb2JTZWdtZW50cy5qb2luKCcnKTtcbiAgfVxuXG5cbiAgLy8gSW1wbGljaXQgcm9vdCBzdGF0ZSB0aGF0IGlzIGFsd2F5cyBhY3RpdmVcbiAgcm9vdCA9IHJlZ2lzdGVyU3RhdGUoe1xuICAgIG5hbWU6ICcnLFxuICAgIHVybDogJ14nLFxuICAgIHZpZXdzOiBudWxsLFxuICAgICdhYnN0cmFjdCc6IHRydWVcbiAgfSk7XG4gIHJvb3QubmF2aWdhYmxlID0gbnVsbDtcblxuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyI2RlY29yYXRvclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBBbGxvd3MgeW91IHRvIGV4dGVuZCAoY2FyZWZ1bGx5KSBvciBvdmVycmlkZSAoYXQgeW91ciBvd24gcGVyaWwpIHRoZSBcbiAgICogYHN0YXRlQnVpbGRlcmAgb2JqZWN0IHVzZWQgaW50ZXJuYWxseSBieSBgJHN0YXRlUHJvdmlkZXJgLiBUaGlzIGNhbiBiZSB1c2VkIFxuICAgKiB0byBhZGQgY3VzdG9tIGZ1bmN0aW9uYWxpdHkgdG8gdWktcm91dGVyLCBmb3IgZXhhbXBsZSBpbmZlcnJpbmcgdGVtcGxhdGVVcmwgXG4gICAqIGJhc2VkIG9uIHRoZSBzdGF0ZSBuYW1lLlxuICAgKlxuICAgKiBXaGVuIHBhc3Npbmcgb25seSBhIG5hbWUsIGl0IHJldHVybnMgdGhlIGN1cnJlbnQgKG9yaWdpbmFsIG9yIGRlY29yYXRlZCkgYnVpbGRlclxuICAgKiBmdW5jdGlvbiB0aGF0IG1hdGNoZXMgYG5hbWVgLlxuICAgKlxuICAgKiBUaGUgYnVpbGRlciBmdW5jdGlvbnMgdGhhdCBjYW4gYmUgZGVjb3JhdGVkIGFyZSBsaXN0ZWQgYmVsb3cuIFRob3VnaCBub3QgYWxsXG4gICAqIG5lY2Vzc2FyaWx5IGhhdmUgYSBnb29kIHVzZSBjYXNlIGZvciBkZWNvcmF0aW9uLCB0aGF0IGlzIHVwIHRvIHlvdSB0byBkZWNpZGUuXG4gICAqXG4gICAqIEluIGFkZGl0aW9uLCB1c2VycyBjYW4gYXR0YWNoIGN1c3RvbSBkZWNvcmF0b3JzLCB3aGljaCB3aWxsIGdlbmVyYXRlIG5ldyBcbiAgICogcHJvcGVydGllcyB3aXRoaW4gdGhlIHN0YXRlJ3MgaW50ZXJuYWwgZGVmaW5pdGlvbi4gVGhlcmUgaXMgY3VycmVudGx5IG5vIGNsZWFyIFxuICAgKiB1c2UtY2FzZSBmb3IgdGhpcyBiZXlvbmQgYWNjZXNzaW5nIGludGVybmFsIHN0YXRlcyAoaS5lLiAkc3RhdGUuJGN1cnJlbnQpLCBcbiAgICogaG93ZXZlciwgZXhwZWN0IHRoaXMgdG8gYmVjb21lIGluY3JlYXNpbmdseSByZWxldmFudCBhcyB3ZSBpbnRyb2R1Y2UgYWRkaXRpb25hbCBcbiAgICogbWV0YS1wcm9ncmFtbWluZyBmZWF0dXJlcy5cbiAgICpcbiAgICogKipXYXJuaW5nKio6IERlY29yYXRvcnMgc2hvdWxkIG5vdCBiZSBpbnRlcmRlcGVuZGVudCBiZWNhdXNlIHRoZSBvcmRlciBvZiBcbiAgICogZXhlY3V0aW9uIG9mIHRoZSBidWlsZGVyIGZ1bmN0aW9ucyBpbiBub24tZGV0ZXJtaW5pc3RpYy4gQnVpbGRlciBmdW5jdGlvbnMgXG4gICAqIHNob3VsZCBvbmx5IGJlIGRlcGVuZGVudCBvbiB0aGUgc3RhdGUgZGVmaW5pdGlvbiBvYmplY3QgYW5kIHN1cGVyIGZ1bmN0aW9uLlxuICAgKlxuICAgKlxuICAgKiBFeGlzdGluZyBidWlsZGVyIGZ1bmN0aW9ucyBhbmQgY3VycmVudCByZXR1cm4gdmFsdWVzOlxuICAgKlxuICAgKiAtICoqcGFyZW50KiogYHtvYmplY3R9YCAtIHJldHVybnMgdGhlIHBhcmVudCBzdGF0ZSBvYmplY3QuXG4gICAqIC0gKipkYXRhKiogYHtvYmplY3R9YCAtIHJldHVybnMgc3RhdGUgZGF0YSwgaW5jbHVkaW5nIGFueSBpbmhlcml0ZWQgZGF0YSB0aGF0IGlzIG5vdFxuICAgKiAgIG92ZXJyaWRkZW4gYnkgb3duIHZhbHVlcyAoaWYgYW55KS5cbiAgICogLSAqKnVybCoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGEge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBVcmxNYXRjaGVyfVxuICAgKiAgIG9yIGBudWxsYC5cbiAgICogLSAqKm5hdmlnYWJsZSoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGNsb3Nlc3QgYW5jZXN0b3Igc3RhdGUgdGhhdCBoYXMgYSBVUkwgKGFrYSBpcyBcbiAgICogICBuYXZpZ2FibGUpLlxuICAgKiAtICoqcGFyYW1zKiogYHtvYmplY3R9YCAtIHJldHVybnMgYW4gYXJyYXkgb2Ygc3RhdGUgcGFyYW1zIHRoYXQgYXJlIGVuc3VyZWQgdG8gXG4gICAqICAgYmUgYSBzdXBlci1zZXQgb2YgcGFyZW50J3MgcGFyYW1zLlxuICAgKiAtICoqdmlld3MqKiBge29iamVjdH1gIC0gcmV0dXJucyBhIHZpZXdzIG9iamVjdCB3aGVyZSBlYWNoIGtleSBpcyBhbiBhYnNvbHV0ZSB2aWV3IFxuICAgKiAgIG5hbWUgKGkuZS4gXCJ2aWV3TmFtZUBzdGF0ZU5hbWVcIikgYW5kIGVhY2ggdmFsdWUgaXMgdGhlIGNvbmZpZyBvYmplY3QgXG4gICAqICAgKHRlbXBsYXRlLCBjb250cm9sbGVyKSBmb3IgdGhlIHZpZXcuIEV2ZW4gd2hlbiB5b3UgZG9uJ3QgdXNlIHRoZSB2aWV3cyBvYmplY3QgXG4gICAqICAgZXhwbGljaXRseSBvbiBhIHN0YXRlIGNvbmZpZywgb25lIGlzIHN0aWxsIGNyZWF0ZWQgZm9yIHlvdSBpbnRlcm5hbGx5LlxuICAgKiAgIFNvIGJ5IGRlY29yYXRpbmcgdGhpcyBidWlsZGVyIGZ1bmN0aW9uIHlvdSBoYXZlIGFjY2VzcyB0byBkZWNvcmF0aW5nIHRlbXBsYXRlIFxuICAgKiAgIGFuZCBjb250cm9sbGVyIHByb3BlcnRpZXMuXG4gICAqIC0gKipvd25QYXJhbXMqKiBge29iamVjdH1gIC0gcmV0dXJucyBhbiBhcnJheSBvZiBwYXJhbXMgdGhhdCBiZWxvbmcgdG8gdGhlIHN0YXRlLCBcbiAgICogICBub3QgaW5jbHVkaW5nIGFueSBwYXJhbXMgZGVmaW5lZCBieSBhbmNlc3RvciBzdGF0ZXMuXG4gICAqIC0gKipwYXRoKiogYHtzdHJpbmd9YCAtIHJldHVybnMgdGhlIGZ1bGwgcGF0aCBmcm9tIHRoZSByb290IGRvd24gdG8gdGhpcyBzdGF0ZS4gXG4gICAqICAgTmVlZGVkIGZvciBzdGF0ZSBhY3RpdmF0aW9uLlxuICAgKiAtICoqaW5jbHVkZXMqKiBge29iamVjdH1gIC0gcmV0dXJucyBhbiBvYmplY3QgdGhhdCBpbmNsdWRlcyBldmVyeSBzdGF0ZSB0aGF0IFxuICAgKiAgIHdvdWxkIHBhc3MgYSBgJHN0YXRlLmluY2x1ZGVzKClgIHRlc3QuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIDxwcmU+XG4gICAqIC8vIE92ZXJyaWRlIHRoZSBpbnRlcm5hbCAndmlld3MnIGJ1aWxkZXIgd2l0aCBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIHN0YXRlXG4gICAqIC8vIGRlZmluaXRpb24sIGFuZCBhIHJlZmVyZW5jZSB0byB0aGUgaW50ZXJuYWwgZnVuY3Rpb24gYmVpbmcgb3ZlcnJpZGRlbjpcbiAgICogJHN0YXRlUHJvdmlkZXIuZGVjb3JhdG9yKCd2aWV3cycsIGZ1bmN0aW9uIChzdGF0ZSwgcGFyZW50KSB7XG4gICAqICAgdmFyIHJlc3VsdCA9IHt9LFxuICAgKiAgICAgICB2aWV3cyA9IHBhcmVudChzdGF0ZSk7XG4gICAqXG4gICAqICAgYW5ndWxhci5mb3JFYWNoKHZpZXdzLCBmdW5jdGlvbiAoY29uZmlnLCBuYW1lKSB7XG4gICAqICAgICB2YXIgYXV0b05hbWUgPSAoc3RhdGUubmFtZSArICcuJyArIG5hbWUpLnJlcGxhY2UoJy4nLCAnLycpO1xuICAgKiAgICAgY29uZmlnLnRlbXBsYXRlVXJsID0gY29uZmlnLnRlbXBsYXRlVXJsIHx8ICcvcGFydGlhbHMvJyArIGF1dG9OYW1lICsgJy5odG1sJztcbiAgICogICAgIHJlc3VsdFtuYW1lXSA9IGNvbmZpZztcbiAgICogICB9KTtcbiAgICogICByZXR1cm4gcmVzdWx0O1xuICAgKiB9KTtcbiAgICpcbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAqICAgdmlld3M6IHtcbiAgICogICAgICdjb250YWN0Lmxpc3QnOiB7IGNvbnRyb2xsZXI6ICdMaXN0Q29udHJvbGxlcicgfSxcbiAgICogICAgICdjb250YWN0Lml0ZW0nOiB7IGNvbnRyb2xsZXI6ICdJdGVtQ29udHJvbGxlcicgfVxuICAgKiAgIH1cbiAgICogfSk7XG4gICAqXG4gICAqIC8vIC4uLlxuICAgKlxuICAgKiAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICogLy8gQXV0by1wb3B1bGF0ZXMgbGlzdCBhbmQgaXRlbSB2aWV3cyB3aXRoIC9wYXJ0aWFscy9ob21lL2NvbnRhY3QvbGlzdC5odG1sLFxuICAgKiAvLyBhbmQgL3BhcnRpYWxzL2hvbWUvY29udGFjdC9pdGVtLmh0bWwsIHJlc3BlY3RpdmVseS5cbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIFRoZSBuYW1lIG9mIHRoZSBidWlsZGVyIGZ1bmN0aW9uIHRvIGRlY29yYXRlLiBcbiAgICogQHBhcmFtIHtvYmplY3R9IGZ1bmMgQSBmdW5jdGlvbiB0aGF0IGlzIHJlc3BvbnNpYmxlIGZvciBkZWNvcmF0aW5nIHRoZSBvcmlnaW5hbCBcbiAgICogYnVpbGRlciBmdW5jdGlvbi4gVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIHR3byBwYXJhbWV0ZXJzOlxuICAgKlxuICAgKiAgIC0gYHtvYmplY3R9YCAtIHN0YXRlIC0gVGhlIHN0YXRlIGNvbmZpZyBvYmplY3QuXG4gICAqICAgLSBge29iamVjdH1gIC0gc3VwZXIgLSBUaGUgb3JpZ2luYWwgYnVpbGRlciBmdW5jdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7b2JqZWN0fSAkc3RhdGVQcm92aWRlciAtICRzdGF0ZVByb3ZpZGVyIGluc3RhbmNlXG4gICAqL1xuICB0aGlzLmRlY29yYXRvciA9IGRlY29yYXRvcjtcbiAgZnVuY3Rpb24gZGVjb3JhdG9yKG5hbWUsIGZ1bmMpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUgKi9cbiAgICBpZiAoaXNTdHJpbmcobmFtZSkgJiYgIWlzRGVmaW5lZChmdW5jKSkge1xuICAgICAgcmV0dXJuIHN0YXRlQnVpbGRlcltuYW1lXTtcbiAgICB9XG4gICAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpIHx8ICFpc1N0cmluZyhuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmIChzdGF0ZUJ1aWxkZXJbbmFtZV0gJiYgIXN0YXRlQnVpbGRlci4kZGVsZWdhdGVzW25hbWVdKSB7XG4gICAgICBzdGF0ZUJ1aWxkZXIuJGRlbGVnYXRlc1tuYW1lXSA9IHN0YXRlQnVpbGRlcltuYW1lXTtcbiAgICB9XG4gICAgc3RhdGVCdWlsZGVyW25hbWVdID0gZnVuYztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyI3N0YXRlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlZ2lzdGVycyBhIHN0YXRlIGNvbmZpZ3VyYXRpb24gdW5kZXIgYSBnaXZlbiBzdGF0ZSBuYW1lLiBUaGUgc3RhdGVDb25maWcgb2JqZWN0XG4gICAqIGhhcyB0aGUgZm9sbG93aW5nIGFjY2VwdGFibGUgcHJvcGVydGllcy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgQSB1bmlxdWUgc3RhdGUgbmFtZSwgZS5nLiBcImhvbWVcIiwgXCJhYm91dFwiLCBcImNvbnRhY3RzXCIuXG4gICAqIFRvIGNyZWF0ZSBhIHBhcmVudC9jaGlsZCBzdGF0ZSB1c2UgYSBkb3QsIGUuZy4gXCJhYm91dC5zYWxlc1wiLCBcImhvbWUubmV3ZXN0XCIuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzdGF0ZUNvbmZpZyBTdGF0ZSBjb25maWd1cmF0aW9uIG9iamVjdC5cbiAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy50ZW1wbGF0ZVxuICAgKiA8YSBpZD0ndGVtcGxhdGUnPjwvYT5cbiAgICogICBodG1sIHRlbXBsYXRlIGFzIGEgc3RyaW5nIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zXG4gICAqICAgYW4gaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZyB3aGljaCBzaG91bGQgYmUgdXNlZCBieSB0aGUgdWlWaWV3IGRpcmVjdGl2ZXMuIFRoaXMgcHJvcGVydHkgXG4gICAqICAgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIHRlbXBsYXRlVXJsLlxuICAgKiAgIFxuICAgKiAgIElmIGB0ZW1wbGF0ZWAgaXMgYSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAqXG4gICAqICAgLSB7YXJyYXkuJmx0O29iamVjdCZndDt9IC0gc3RhdGUgcGFyYW1ldGVycyBleHRyYWN0ZWQgZnJvbSB0aGUgY3VycmVudCAkbG9jYXRpb24ucGF0aCgpIGJ5XG4gICAqICAgICBhcHBseWluZyB0aGUgY3VycmVudCBzdGF0ZVxuICAgKlxuICAgKiA8cHJlPnRlbXBsYXRlOlxuICAgKiAgIFwiPGgxPmlubGluZSB0ZW1wbGF0ZSBkZWZpbml0aW9uPC9oMT5cIiArXG4gICAqICAgXCI8ZGl2IHVpLXZpZXc+PC9kaXY+XCI8L3ByZT5cbiAgICogPHByZT50ZW1wbGF0ZTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAqICAgICAgIHJldHVybiBcIjxoMT5nZW5lcmF0ZWQgdGVtcGxhdGU8L2gxPlwiOyB9PC9wcmU+XG4gICAqIDwvZGl2PlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbj19IHN0YXRlQ29uZmlnLnRlbXBsYXRlVXJsXG4gICAqIDxhIGlkPSd0ZW1wbGF0ZVVybCc+PC9hPlxuICAgKlxuICAgKiAgIHBhdGggb3IgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgcGF0aCB0byBhbiBodG1sXG4gICAqICAgdGVtcGxhdGUgdGhhdCBzaG91bGQgYmUgdXNlZCBieSB1aVZpZXcuXG4gICAqICAgXG4gICAqICAgSWYgYHRlbXBsYXRlVXJsYCBpcyBhIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICpcbiAgICogICAtIHthcnJheS4mbHQ7b2JqZWN0Jmd0O30gLSBzdGF0ZSBwYXJhbWV0ZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBjdXJyZW50ICRsb2NhdGlvbi5wYXRoKCkgYnkgXG4gICAqICAgICBhcHBseWluZyB0aGUgY3VycmVudCBzdGF0ZVxuICAgKlxuICAgKiA8cHJlPnRlbXBsYXRlVXJsOiBcImhvbWUuaHRtbFwiPC9wcmU+XG4gICAqIDxwcmU+dGVtcGxhdGVVcmw6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgKiAgICAgcmV0dXJuIG15VGVtcGxhdGVzW3BhcmFtcy5wYWdlSWRdOyB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy50ZW1wbGF0ZVByb3ZpZGVyXG4gICAqIDxhIGlkPSd0ZW1wbGF0ZVByb3ZpZGVyJz48L2E+XG4gICAqICAgIFByb3ZpZGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBIVE1MIGNvbnRlbnQgc3RyaW5nLlxuICAgKiA8cHJlPiB0ZW1wbGF0ZVByb3ZpZGVyOlxuICAgKiAgICAgICBmdW5jdGlvbihNeVRlbXBsYXRlU2VydmljZSwgcGFyYW1zKSB7XG4gICAqICAgICAgICAgcmV0dXJuIE15VGVtcGxhdGVTZXJ2aWNlLmdldFRlbXBsYXRlKHBhcmFtcy5wYWdlSWQpO1xuICAgKiAgICAgICB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9uPX0gc3RhdGVDb25maWcuY29udHJvbGxlclxuICAgKiA8YSBpZD0nY29udHJvbGxlcic+PC9hPlxuICAgKlxuICAgKiAgQ29udHJvbGxlciBmbiB0aGF0IHNob3VsZCBiZSBhc3NvY2lhdGVkIHdpdGggbmV3bHlcbiAgICogICByZWxhdGVkIHNjb3BlIG9yIHRoZSBuYW1lIG9mIGEgcmVnaXN0ZXJlZCBjb250cm9sbGVyIGlmIHBhc3NlZCBhcyBhIHN0cmluZy5cbiAgICogICBPcHRpb25hbGx5LCB0aGUgQ29udHJvbGxlckFzIG1heSBiZSBkZWNsYXJlZCBoZXJlLlxuICAgKiA8cHJlPmNvbnRyb2xsZXI6IFwiTXlSZWdpc3RlcmVkQ29udHJvbGxlclwiPC9wcmU+XG4gICAqIDxwcmU+Y29udHJvbGxlcjpcbiAgICogICAgIFwiTXlSZWdpc3RlcmVkQ29udHJvbGxlciBhcyBmb29DdHJsXCJ9PC9wcmU+XG4gICAqIDxwcmU+Y29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBNeVNlcnZpY2UpIHtcbiAgICogICAgICRzY29wZS5kYXRhID0gTXlTZXJ2aWNlLmdldERhdGEoKTsgfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3RhdGVDb25maWcuY29udHJvbGxlclByb3ZpZGVyXG4gICAqIDxhIGlkPSdjb250cm9sbGVyUHJvdmlkZXInPjwvYT5cbiAgICpcbiAgICogSW5qZWN0YWJsZSBwcm92aWRlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGFjdHVhbCBjb250cm9sbGVyIG9yIHN0cmluZy5cbiAgICogPHByZT5jb250cm9sbGVyUHJvdmlkZXI6XG4gICAqICAgZnVuY3Rpb24oTXlSZXNvbHZlRGF0YSkge1xuICAgKiAgICAgaWYgKE15UmVzb2x2ZURhdGEuZm9vKVxuICAgKiAgICAgICByZXR1cm4gXCJGb29DdHJsXCJcbiAgICogICAgIGVsc2UgaWYgKE15UmVzb2x2ZURhdGEuYmFyKVxuICAgKiAgICAgICByZXR1cm4gXCJCYXJDdHJsXCI7XG4gICAqICAgICBlbHNlIHJldHVybiBmdW5jdGlvbigkc2NvcGUpIHtcbiAgICogICAgICAgJHNjb3BlLmJheiA9IFwiUXV4XCI7XG4gICAqICAgICB9XG4gICAqICAgfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZz19IHN0YXRlQ29uZmlnLmNvbnRyb2xsZXJBc1xuICAgKiA8YSBpZD0nY29udHJvbGxlckFzJz48L2E+XG4gICAqIFxuICAgKiBBIGNvbnRyb2xsZXIgYWxpYXMgbmFtZS4gSWYgcHJlc2VudCB0aGUgY29udHJvbGxlciB3aWxsIGJlXG4gICAqICAgcHVibGlzaGVkIHRvIHNjb3BlIHVuZGVyIHRoZSBjb250cm9sbGVyQXMgbmFtZS5cbiAgICogPHByZT5jb250cm9sbGVyQXM6IFwibXlDdHJsXCI8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0PX0gc3RhdGVDb25maWcucGFyZW50XG4gICAqIDxhIGlkPSdwYXJlbnQnPjwvYT5cbiAgICogT3B0aW9uYWxseSBzcGVjaWZpZXMgdGhlIHBhcmVudCBzdGF0ZSBvZiB0aGlzIHN0YXRlLlxuICAgKlxuICAgKiA8cHJlPnBhcmVudDogJ3BhcmVudFN0YXRlJzwvcHJlPlxuICAgKiA8cHJlPnBhcmVudDogcGFyZW50U3RhdGUgLy8gSlMgdmFyaWFibGU8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3Q9fSBzdGF0ZUNvbmZpZy5yZXNvbHZlXG4gICAqIDxhIGlkPSdyZXNvbHZlJz48L2E+XG4gICAqXG4gICAqIEFuIG9wdGlvbmFsIG1hcCZsdDtzdHJpbmcsIGZ1bmN0aW9uJmd0OyBvZiBkZXBlbmRlbmNpZXMgd2hpY2hcbiAgICogICBzaG91bGQgYmUgaW5qZWN0ZWQgaW50byB0aGUgY29udHJvbGxlci4gSWYgYW55IG9mIHRoZXNlIGRlcGVuZGVuY2llcyBhcmUgcHJvbWlzZXMsIFxuICAgKiAgIHRoZSByb3V0ZXIgd2lsbCB3YWl0IGZvciB0aGVtIGFsbCB0byBiZSByZXNvbHZlZCBiZWZvcmUgdGhlIGNvbnRyb2xsZXIgaXMgaW5zdGFudGlhdGVkLlxuICAgKiAgIElmIGFsbCB0aGUgcHJvbWlzZXMgYXJlIHJlc29sdmVkIHN1Y2Nlc3NmdWxseSwgdGhlICRzdGF0ZUNoYW5nZVN1Y2Nlc3MgZXZlbnQgaXMgZmlyZWRcbiAgICogICBhbmQgdGhlIHZhbHVlcyBvZiB0aGUgcmVzb2x2ZWQgcHJvbWlzZXMgYXJlIGluamVjdGVkIGludG8gYW55IGNvbnRyb2xsZXJzIHRoYXQgcmVmZXJlbmNlIHRoZW0uXG4gICAqICAgSWYgYW55ICBvZiB0aGUgcHJvbWlzZXMgYXJlIHJlamVjdGVkIHRoZSAkc3RhdGVDaGFuZ2VFcnJvciBldmVudCBpcyBmaXJlZC5cbiAgICpcbiAgICogICBUaGUgbWFwIG9iamVjdCBpczpcbiAgICogICBcbiAgICogICAtIGtleSAtIHtzdHJpbmd9OiBuYW1lIG9mIGRlcGVuZGVuY3kgdG8gYmUgaW5qZWN0ZWQgaW50byBjb250cm9sbGVyXG4gICAqICAgLSBmYWN0b3J5IC0ge3N0cmluZ3xmdW5jdGlvbn06IElmIHN0cmluZyB0aGVuIGl0IGlzIGFsaWFzIGZvciBzZXJ2aWNlLiBPdGhlcndpc2UgaWYgZnVuY3Rpb24sIFxuICAgKiAgICAgaXQgaXMgaW5qZWN0ZWQgYW5kIHJldHVybiB2YWx1ZSBpdCB0cmVhdGVkIGFzIGRlcGVuZGVuY3kuIElmIHJlc3VsdCBpcyBhIHByb21pc2UsIGl0IGlzIFxuICAgKiAgICAgcmVzb2x2ZWQgYmVmb3JlIGl0cyB2YWx1ZSBpcyBpbmplY3RlZCBpbnRvIGNvbnRyb2xsZXIuXG4gICAqXG4gICAqIDxwcmU+cmVzb2x2ZToge1xuICAgKiAgICAgbXlSZXNvbHZlMTpcbiAgICogICAgICAgZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcykge1xuICAgKiAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2Zvb3MvXCIrc3RhdGVQYXJhbXMuZm9vSUQpO1xuICAgKiAgICAgICB9XG4gICAqICAgICB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc3RhdGVDb25maWcudXJsXG4gICAqIDxhIGlkPSd1cmwnPjwvYT5cbiAgICpcbiAgICogICBBIHVybCBmcmFnbWVudCB3aXRoIG9wdGlvbmFsIHBhcmFtZXRlcnMuIFdoZW4gYSBzdGF0ZSBpcyBuYXZpZ2F0ZWQgb3JcbiAgICogICB0cmFuc2l0aW9uZWQgdG8sIHRoZSBgJHN0YXRlUGFyYW1zYCBzZXJ2aWNlIHdpbGwgYmUgcG9wdWxhdGVkIHdpdGggYW55IFxuICAgKiAgIHBhcmFtZXRlcnMgdGhhdCB3ZXJlIHBhc3NlZC5cbiAgICpcbiAgICogICAoU2VlIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgVXJsTWF0Y2hlcn0gYFVybE1hdGNoZXJgfSBmb3JcbiAgICogICBtb3JlIGRldGFpbHMgb24gYWNjZXB0YWJsZSBwYXR0ZXJucyApXG4gICAqXG4gICAqIGV4YW1wbGVzOlxuICAgKiA8cHJlPnVybDogXCIvaG9tZVwiXG4gICAqIHVybDogXCIvdXNlcnMvOnVzZXJpZFwiXG4gICAqIHVybDogXCIvYm9va3Mve2Jvb2tpZDpbYS16QS1aXy1dfVwiXG4gICAqIHVybDogXCIvYm9va3Mve2NhdGVnb3J5aWQ6aW50fVwiXG4gICAqIHVybDogXCIvYm9va3Mve3B1Ymxpc2hlcm5hbWU6c3RyaW5nfS97Y2F0ZWdvcnlpZDppbnR9XCJcbiAgICogdXJsOiBcIi9tZXNzYWdlcz9iZWZvcmUmYWZ0ZXJcIlxuICAgKiB1cmw6IFwiL21lc3NhZ2VzP3tiZWZvcmU6ZGF0ZX0me2FmdGVyOmRhdGV9XCJcbiAgICogdXJsOiBcIi9tZXNzYWdlcy86bWFpbGJveGlkP3tiZWZvcmU6ZGF0ZX0me2FmdGVyOmRhdGV9XCJcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0PX0gc3RhdGVDb25maWcudmlld3NcbiAgICogPGEgaWQ9J3ZpZXdzJz48L2E+XG4gICAqIGFuIG9wdGlvbmFsIG1hcCZsdDtzdHJpbmcsIG9iamVjdCZndDsgd2hpY2ggZGVmaW5lZCBtdWx0aXBsZSB2aWV3cywgb3IgdGFyZ2V0cyB2aWV3c1xuICAgKiBtYW51YWxseS9leHBsaWNpdGx5LlxuICAgKlxuICAgKiBFeGFtcGxlczpcbiAgICpcbiAgICogVGFyZ2V0cyB0aHJlZSBuYW1lZCBgdWktdmlld2BzIGluIHRoZSBwYXJlbnQgc3RhdGUncyB0ZW1wbGF0ZVxuICAgKiA8cHJlPnZpZXdzOiB7XG4gICAqICAgICBoZWFkZXI6IHtcbiAgICogICAgICAgY29udHJvbGxlcjogXCJoZWFkZXJDdHJsXCIsXG4gICAqICAgICAgIHRlbXBsYXRlVXJsOiBcImhlYWRlci5odG1sXCJcbiAgICogICAgIH0sIGJvZHk6IHtcbiAgICogICAgICAgY29udHJvbGxlcjogXCJib2R5Q3RybFwiLFxuICAgKiAgICAgICB0ZW1wbGF0ZVVybDogXCJib2R5Lmh0bWxcIlxuICAgKiAgICAgfSwgZm9vdGVyOiB7XG4gICAqICAgICAgIGNvbnRyb2xsZXI6IFwiZm9vdEN0cmxcIixcbiAgICogICAgICAgdGVtcGxhdGVVcmw6IFwiZm9vdGVyLmh0bWxcIlxuICAgKiAgICAgfVxuICAgKiAgIH08L3ByZT5cbiAgICpcbiAgICogVGFyZ2V0cyBuYW1lZCBgdWktdmlldz1cImhlYWRlclwiYCBmcm9tIGdyYW5kcGFyZW50IHN0YXRlICd0b3AnJ3MgdGVtcGxhdGUsIGFuZCBuYW1lZCBgdWktdmlldz1cImJvZHlcIiBmcm9tIHBhcmVudCBzdGF0ZSdzIHRlbXBsYXRlLlxuICAgKiA8cHJlPnZpZXdzOiB7XG4gICAqICAgICAnaGVhZGVyQHRvcCc6IHtcbiAgICogICAgICAgY29udHJvbGxlcjogXCJtc2dIZWFkZXJDdHJsXCIsXG4gICAqICAgICAgIHRlbXBsYXRlVXJsOiBcIm1zZ0hlYWRlci5odG1sXCJcbiAgICogICAgIH0sICdib2R5Jzoge1xuICAgKiAgICAgICBjb250cm9sbGVyOiBcIm1lc3NhZ2VzQ3RybFwiLFxuICAgKiAgICAgICB0ZW1wbGF0ZVVybDogXCJtZXNzYWdlcy5odG1sXCJcbiAgICogICAgIH1cbiAgICogICB9PC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtzdGF0ZUNvbmZpZy5hYnN0cmFjdD1mYWxzZV1cbiAgICogPGEgaWQ9J2Fic3RyYWN0Jz48L2E+XG4gICAqIEFuIGFic3RyYWN0IHN0YXRlIHdpbGwgbmV2ZXIgYmUgZGlyZWN0bHkgYWN0aXZhdGVkLFxuICAgKiAgIGJ1dCBjYW4gcHJvdmlkZSBpbmhlcml0ZWQgcHJvcGVydGllcyB0byBpdHMgY29tbW9uIGNoaWxkcmVuIHN0YXRlcy5cbiAgICogPHByZT5hYnN0cmFjdDogdHJ1ZTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3RhdGVDb25maWcub25FbnRlclxuICAgKiA8YSBpZD0nb25FbnRlcic+PC9hPlxuICAgKlxuICAgKiBDYWxsYmFjayBmdW5jdGlvbiBmb3Igd2hlbiBhIHN0YXRlIGlzIGVudGVyZWQuIEdvb2Qgd2F5XG4gICAqICAgdG8gdHJpZ2dlciBhbiBhY3Rpb24gb3IgZGlzcGF0Y2ggYW4gZXZlbnQsIHN1Y2ggYXMgb3BlbmluZyBhIGRpYWxvZy5cbiAgICogSWYgbWluaWZ5aW5nIHlvdXIgc2NyaXB0cywgbWFrZSBzdXJlIHRvIGV4cGxpY2l0bHkgYW5ub3RhdGUgdGhpcyBmdW5jdGlvbixcbiAgICogYmVjYXVzZSBpdCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IGFubm90YXRlZCBieSB5b3VyIGJ1aWxkIHRvb2xzLlxuICAgKlxuICAgKiA8cHJlPm9uRW50ZXI6IGZ1bmN0aW9uKE15U2VydmljZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAqICAgICBNeVNlcnZpY2UuZm9vKCRzdGF0ZVBhcmFtcy5teVBhcmFtKTtcbiAgICogfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3RhdGVDb25maWcub25FeGl0XG4gICAqIDxhIGlkPSdvbkV4aXQnPjwvYT5cbiAgICpcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb24gZm9yIHdoZW4gYSBzdGF0ZSBpcyBleGl0ZWQuIEdvb2Qgd2F5IHRvXG4gICAqICAgdHJpZ2dlciBhbiBhY3Rpb24gb3IgZGlzcGF0Y2ggYW4gZXZlbnQsIHN1Y2ggYXMgb3BlbmluZyBhIGRpYWxvZy5cbiAgICogSWYgbWluaWZ5aW5nIHlvdXIgc2NyaXB0cywgbWFrZSBzdXJlIHRvIGV4cGxpY2l0bHkgYW5ub3RhdGUgdGhpcyBmdW5jdGlvbixcbiAgICogYmVjYXVzZSBpdCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IGFubm90YXRlZCBieSB5b3VyIGJ1aWxkIHRvb2xzLlxuICAgKlxuICAgKiA8cHJlPm9uRXhpdDogZnVuY3Rpb24oTXlTZXJ2aWNlLCAkc3RhdGVQYXJhbXMpIHtcbiAgICogICAgIE15U2VydmljZS5jbGVhbnVwKCRzdGF0ZVBhcmFtcy5teVBhcmFtKTtcbiAgICogfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbc3RhdGVDb25maWcucmVsb2FkT25TZWFyY2g9dHJ1ZV1cbiAgICogPGEgaWQ9J3JlbG9hZE9uU2VhcmNoJz48L2E+XG4gICAqXG4gICAqIElmIGBmYWxzZWAsIHdpbGwgbm90IHJldHJpZ2dlciB0aGUgc2FtZSBzdGF0ZVxuICAgKiAgIGp1c3QgYmVjYXVzZSBhIHNlYXJjaC9xdWVyeSBwYXJhbWV0ZXIgaGFzIGNoYW5nZWQgKHZpYSAkbG9jYXRpb24uc2VhcmNoKCkgb3IgJGxvY2F0aW9uLmhhc2goKSkuIFxuICAgKiAgIFVzZWZ1bCBmb3Igd2hlbiB5b3UnZCBsaWtlIHRvIG1vZGlmeSAkbG9jYXRpb24uc2VhcmNoKCkgd2l0aG91dCB0cmlnZ2VyaW5nIGEgcmVsb2FkLlxuICAgKiA8cHJlPnJlbG9hZE9uU2VhcmNoOiBmYWxzZTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdD19IHN0YXRlQ29uZmlnLmRhdGFcbiAgICogPGEgaWQ9J2RhdGEnPjwvYT5cbiAgICpcbiAgICogQXJiaXRyYXJ5IGRhdGEgb2JqZWN0LCB1c2VmdWwgZm9yIGN1c3RvbSBjb25maWd1cmF0aW9uLiAgVGhlIHBhcmVudCBzdGF0ZSdzIGBkYXRhYCBpc1xuICAgKiAgIHByb3RvdHlwYWxseSBpbmhlcml0ZWQuICBJbiBvdGhlciB3b3JkcywgYWRkaW5nIGEgZGF0YSBwcm9wZXJ0eSB0byBhIHN0YXRlIGFkZHMgaXQgdG9cbiAgICogICB0aGUgZW50aXJlIHN1YnRyZWUgdmlhIHByb3RvdHlwYWwgaW5oZXJpdGFuY2UuXG4gICAqXG4gICAqIDxwcmU+ZGF0YToge1xuICAgKiAgICAgcmVxdWlyZWRSb2xlOiAnZm9vJ1xuICAgKiB9IDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdD19IHN0YXRlQ29uZmlnLnBhcmFtc1xuICAgKiA8YSBpZD0ncGFyYW1zJz48L2E+XG4gICAqXG4gICAqIEEgbWFwIHdoaWNoIG9wdGlvbmFsbHkgY29uZmlndXJlcyBwYXJhbWV0ZXJzIGRlY2xhcmVkIGluIHRoZSBgdXJsYCwgb3JcbiAgICogICBkZWZpbmVzIGFkZGl0aW9uYWwgbm9uLXVybCBwYXJhbWV0ZXJzLiAgRm9yIGVhY2ggcGFyYW1ldGVyIGJlaW5nXG4gICAqICAgY29uZmlndXJlZCwgYWRkIGEgY29uZmlndXJhdGlvbiBvYmplY3Qga2V5ZWQgdG8gdGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlci5cbiAgICpcbiAgICogICBFYWNoIHBhcmFtZXRlciBjb25maWd1cmF0aW9uIG9iamVjdCBtYXkgY29udGFpbiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqXG4gICAqICAgLSAqKiB2YWx1ZSAqKiAtIHtvYmplY3R8ZnVuY3Rpb249fTogc3BlY2lmaWVzIHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGlzXG4gICAqICAgICBwYXJhbWV0ZXIuICBUaGlzIGltcGxpY2l0bHkgc2V0cyB0aGlzIHBhcmFtZXRlciBhcyBvcHRpb25hbC5cbiAgICpcbiAgICogICAgIFdoZW4gVUktUm91dGVyIHJvdXRlcyB0byBhIHN0YXRlIGFuZCBubyB2YWx1ZSBpc1xuICAgKiAgICAgc3BlY2lmaWVkIGZvciB0aGlzIHBhcmFtZXRlciBpbiB0aGUgVVJMIG9yIHRyYW5zaXRpb24sIHRoZVxuICAgKiAgICAgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQgaW5zdGVhZC4gIElmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbixcbiAgICogICAgIGl0IHdpbGwgYmUgaW5qZWN0ZWQgYW5kIGludm9rZWQsIGFuZCB0aGUgcmV0dXJuIHZhbHVlIHVzZWQuXG4gICAqXG4gICAqICAgICAqTm90ZSo6IGB1bmRlZmluZWRgIGlzIHRyZWF0ZWQgYXMgXCJubyBkZWZhdWx0IHZhbHVlXCIgd2hpbGUgYG51bGxgXG4gICAqICAgICBpcyB0cmVhdGVkIGFzIFwidGhlIGRlZmF1bHQgdmFsdWUgaXMgYG51bGxgXCIuXG4gICAqXG4gICAqICAgICAqU2hvcnRoYW5kKjogSWYgeW91IG9ubHkgbmVlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHQgdmFsdWUgb2YgdGhlXG4gICAqICAgICBwYXJhbWV0ZXIsIHlvdSBtYXkgdXNlIGEgc2hvcnRoYW5kIHN5bnRheC4gICBJbiB0aGUgKipgcGFyYW1zYCoqXG4gICAqICAgICBtYXAsIGluc3RlYWQgbWFwcGluZyB0aGUgcGFyYW0gbmFtZSB0byBhIGZ1bGwgcGFyYW1ldGVyIGNvbmZpZ3VyYXRpb25cbiAgICogICAgIG9iamVjdCwgc2ltcGx5IHNldCBtYXAgaXQgdG8gdGhlIGRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlLCBlLmcuOlxuICAgKlxuICAgKiA8cHJlPi8vIGRlZmluZSBhIHBhcmFtZXRlcidzIGRlZmF1bHQgdmFsdWVcbiAgICogcGFyYW1zOiB7XG4gICAqICAgICBwYXJhbTE6IHsgdmFsdWU6IFwiZGVmYXVsdFZhbHVlXCIgfVxuICAgKiB9XG4gICAqIC8vIHNob3J0aGFuZCBkZWZhdWx0IHZhbHVlc1xuICAgKiBwYXJhbXM6IHtcbiAgICogICAgIHBhcmFtMTogXCJkZWZhdWx0VmFsdWVcIixcbiAgICogICAgIHBhcmFtMjogXCJwYXJhbTJEZWZhdWx0XCJcbiAgICogfTwvcHJlPlxuICAgKlxuICAgKiAgIC0gKiogYXJyYXkgKiogLSB7Ym9vbGVhbj19OiAqKGRlZmF1bHQ6IGZhbHNlKSogSWYgdHJ1ZSwgdGhlIHBhcmFtIHZhbHVlIHdpbGwgYmVcbiAgICogICAgIHRyZWF0ZWQgYXMgYW4gYXJyYXkgb2YgdmFsdWVzLiAgSWYgeW91IHNwZWNpZmllZCBhIFR5cGUsIHRoZSB2YWx1ZSB3aWxsIGJlXG4gICAqICAgICB0cmVhdGVkIGFzIGFuIGFycmF5IG9mIHRoZSBzcGVjaWZpZWQgVHlwZS4gIE5vdGU6IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZXNcbiAgICogICAgIGRlZmF1bHQgdG8gYSBzcGVjaWFsIGBcImF1dG9cImAgbW9kZS5cbiAgICpcbiAgICogICAgIEZvciBxdWVyeSBwYXJhbWV0ZXJzIGluIGBcImF1dG9cImAgbW9kZSwgaWYgbXVsdGlwbGUgIHZhbHVlcyBmb3IgYSBzaW5nbGUgcGFyYW1ldGVyXG4gICAqICAgICBhcmUgcHJlc2VudCBpbiB0aGUgVVJMIChlLmcuOiBgL2Zvbz9iYXI9MSZiYXI9MiZiYXI9M2ApIHRoZW4gdGhlIHZhbHVlc1xuICAgKiAgICAgYXJlIG1hcHBlZCB0byBhbiBhcnJheSAoZS5nLjogYHsgZm9vOiBbICcxJywgJzInLCAnMycgXSB9YCkuICBIb3dldmVyLCBpZlxuICAgKiAgICAgb25seSBvbmUgdmFsdWUgaXMgcHJlc2VudCAoZS5nLjogYC9mb28/YmFyPTFgKSB0aGVuIHRoZSB2YWx1ZSBpcyB0cmVhdGVkIGFzIHNpbmdsZVxuICAgKiAgICAgdmFsdWUgKGUuZy46IGB7IGZvbzogJzEnIH1gKS5cbiAgICpcbiAgICogPHByZT5wYXJhbXM6IHtcbiAgICogICAgIHBhcmFtMTogeyBhcnJheTogdHJ1ZSB9XG4gICAqIH08L3ByZT5cbiAgICpcbiAgICogICAtICoqIHNxdWFzaCAqKiAtIHtib29sfHN0cmluZz19OiBgc3F1YXNoYCBjb25maWd1cmVzIGhvdyBhIGRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlIGlzIHJlcHJlc2VudGVkIGluIHRoZSBVUkwgd2hlblxuICAgKiAgICAgdGhlIGN1cnJlbnQgcGFyYW1ldGVyIHZhbHVlIGlzIHRoZSBzYW1lIGFzIHRoZSBkZWZhdWx0IHZhbHVlLiBJZiBgc3F1YXNoYCBpcyBub3Qgc2V0LCBpdCB1c2VzIHRoZVxuICAgKiAgICAgY29uZmlndXJlZCBkZWZhdWx0IHNxdWFzaCBwb2xpY3kuXG4gICAqICAgICAoU2VlIHtAbGluayB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnkjbWV0aG9kc19kZWZhdWx0U3F1YXNoUG9saWN5IGBkZWZhdWx0U3F1YXNoUG9saWN5KClgfSlcbiAgICpcbiAgICogICBUaGVyZSBhcmUgdGhyZWUgc3F1YXNoIHNldHRpbmdzOlxuICAgKlxuICAgKiAgICAgLSBmYWxzZTogVGhlIHBhcmFtZXRlcidzIGRlZmF1bHQgdmFsdWUgaXMgbm90IHNxdWFzaGVkLiAgSXQgaXMgZW5jb2RlZCBhbmQgaW5jbHVkZWQgaW4gdGhlIFVSTFxuICAgKiAgICAgLSB0cnVlOiBUaGUgcGFyYW1ldGVyJ3MgZGVmYXVsdCB2YWx1ZSBpcyBvbWl0dGVkIGZyb20gdGhlIFVSTC4gIElmIHRoZSBwYXJhbWV0ZXIgaXMgcHJlY2VlZGVkIGFuZCBmb2xsb3dlZFxuICAgKiAgICAgICBieSBzbGFzaGVzIGluIHRoZSBzdGF0ZSdzIGB1cmxgIGRlY2xhcmF0aW9uLCB0aGVuIG9uZSBvZiB0aG9zZSBzbGFzaGVzIGFyZSBvbWl0dGVkLlxuICAgKiAgICAgICBUaGlzIGNhbiBhbGxvdyBmb3IgY2xlYW5lciBsb29raW5nIFVSTHMuXG4gICAqICAgICAtIGBcIjxhcmJpdHJhcnkgc3RyaW5nPlwiYDogVGhlIHBhcmFtZXRlcidzIGRlZmF1bHQgdmFsdWUgaXMgcmVwbGFjZWQgd2l0aCBhbiBhcmJpdHJhcnkgcGxhY2Vob2xkZXIgb2YgIHlvdXIgY2hvaWNlLlxuICAgKlxuICAgKiA8cHJlPnBhcmFtczoge1xuICAgKiAgICAgcGFyYW0xOiB7XG4gICAqICAgICAgIHZhbHVlOiBcImRlZmF1bHRJZFwiLFxuICAgKiAgICAgICBzcXVhc2g6IHRydWVcbiAgICogfSB9XG4gICAqIC8vIHNxdWFzaCBcImRlZmF1bHRWYWx1ZVwiIHRvIFwiflwiXG4gICAqIHBhcmFtczoge1xuICAgKiAgICAgcGFyYW0xOiB7XG4gICAqICAgICAgIHZhbHVlOiBcImRlZmF1bHRWYWx1ZVwiLFxuICAgKiAgICAgICBzcXVhc2g6IFwiflwiXG4gICAqIH0gfVxuICAgKiA8L3ByZT5cbiAgICpcbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogPHByZT5cbiAgICogLy8gU29tZSBzdGF0ZSBuYW1lIGV4YW1wbGVzXG4gICAqXG4gICAqIC8vIHN0YXRlTmFtZSBjYW4gYmUgYSBzaW5nbGUgdG9wLWxldmVsIG5hbWUgKG11c3QgYmUgdW5pcXVlKS5cbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHt9KTtcbiAgICpcbiAgICogLy8gT3IgaXQgY2FuIGJlIGEgbmVzdGVkIHN0YXRlIG5hbWUuIFRoaXMgc3RhdGUgaXMgYSBjaGlsZCBvZiB0aGVcbiAgICogLy8gYWJvdmUgXCJob21lXCIgc3RhdGUuXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZS5uZXdlc3RcIiwge30pO1xuICAgKlxuICAgKiAvLyBOZXN0IHN0YXRlcyBhcyBkZWVwbHkgYXMgbmVlZGVkLlxuICAgKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWUubmV3ZXN0LmFiYy54eXouaW5jZXB0aW9uXCIsIHt9KTtcbiAgICpcbiAgICogLy8gc3RhdGUoKSByZXR1cm5zICRzdGF0ZVByb3ZpZGVyLCBzbyB5b3UgY2FuIGNoYWluIHN0YXRlIGRlY2xhcmF0aW9ucy5cbiAgICogJHN0YXRlUHJvdmlkZXJcbiAgICogICAuc3RhdGUoXCJob21lXCIsIHt9KVxuICAgKiAgIC5zdGF0ZShcImFib3V0XCIsIHt9KVxuICAgKiAgIC5zdGF0ZShcImNvbnRhY3RzXCIsIHt9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqL1xuICB0aGlzLnN0YXRlID0gc3RhdGU7XG4gIGZ1bmN0aW9uIHN0YXRlKG5hbWUsIGRlZmluaXRpb24pIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUgKi9cbiAgICBpZiAoaXNPYmplY3QobmFtZSkpIGRlZmluaXRpb24gPSBuYW1lO1xuICAgIGVsc2UgZGVmaW5pdGlvbi5uYW1lID0gbmFtZTtcbiAgICByZWdpc3RlclN0YXRlKGRlZmluaXRpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBvYmplY3RcbiAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgKlxuICAgKiBAcmVxdWlyZXMgJHJvb3RTY29wZVxuICAgKiBAcmVxdWlyZXMgJHFcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kdmlld1xuICAgKiBAcmVxdWlyZXMgJGluamVjdG9yXG4gICAqIEByZXF1aXJlcyB1aS5yb3V0ZXIudXRpbC4kcmVzb2x2ZVxuICAgKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVBhcmFtc1xuICAgKiBAcmVxdWlyZXMgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyXG4gICAqXG4gICAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBwYXJhbXMgQSBwYXJhbSBvYmplY3QsIGUuZy4ge3NlY3Rpb25JZDogc2VjdGlvbi5pZCl9LCB0aGF0IFxuICAgKiB5b3UnZCBsaWtlIHRvIHRlc3QgYWdhaW5zdCB0aGUgY3VycmVudCBhY3RpdmUgc3RhdGUuXG4gICAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBjdXJyZW50IEEgcmVmZXJlbmNlIHRvIHRoZSBzdGF0ZSdzIGNvbmZpZyBvYmplY3QuIEhvd2V2ZXIgXG4gICAqIHlvdSBwYXNzZWQgaXQgaW4uIFVzZWZ1bCBmb3IgYWNjZXNzaW5nIGN1c3RvbSBkYXRhLlxuICAgKiBAcHJvcGVydHkge29iamVjdH0gdHJhbnNpdGlvbiBDdXJyZW50bHkgcGVuZGluZyB0cmFuc2l0aW9uLiBBIHByb21pc2UgdGhhdCdsbCBcbiAgICogcmVzb2x2ZSBvciByZWplY3QuXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBgJHN0YXRlYCBzZXJ2aWNlIGlzIHJlc3BvbnNpYmxlIGZvciByZXByZXNlbnRpbmcgc3RhdGVzIGFzIHdlbGwgYXMgdHJhbnNpdGlvbmluZ1xuICAgKiBiZXR3ZWVuIHRoZW0uIEl0IGFsc28gcHJvdmlkZXMgaW50ZXJmYWNlcyB0byBhc2sgZm9yIGN1cnJlbnQgc3RhdGUgb3IgZXZlbiBzdGF0ZXNcbiAgICogeW91J3JlIGNvbWluZyBmcm9tLlxuICAgKi9cbiAgdGhpcy4kZ2V0ID0gJGdldDtcbiAgJGdldC4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRxJywgJyR2aWV3JywgJyRpbmplY3RvcicsICckcmVzb2x2ZScsICckc3RhdGVQYXJhbXMnLCAnJHVybFJvdXRlcicsICckbG9jYXRpb24nLCAnJHVybE1hdGNoZXJGYWN0b3J5J107XG4gIGZ1bmN0aW9uICRnZXQoICAgJHJvb3RTY29wZSwgICAkcSwgICAkdmlldywgICAkaW5qZWN0b3IsICAgJHJlc29sdmUsICAgJHN0YXRlUGFyYW1zLCAgICR1cmxSb3V0ZXIsICAgJGxvY2F0aW9uLCAgICR1cmxNYXRjaGVyRmFjdG9yeSkge1xuXG4gICAgdmFyIFRyYW5zaXRpb25TdXBlcnNlZGVkID0gJHEucmVqZWN0KG5ldyBFcnJvcigndHJhbnNpdGlvbiBzdXBlcnNlZGVkJykpO1xuICAgIHZhciBUcmFuc2l0aW9uUHJldmVudGVkID0gJHEucmVqZWN0KG5ldyBFcnJvcigndHJhbnNpdGlvbiBwcmV2ZW50ZWQnKSk7XG4gICAgdmFyIFRyYW5zaXRpb25BYm9ydGVkID0gJHEucmVqZWN0KG5ldyBFcnJvcigndHJhbnNpdGlvbiBhYm9ydGVkJykpO1xuICAgIHZhciBUcmFuc2l0aW9uRmFpbGVkID0gJHEucmVqZWN0KG5ldyBFcnJvcigndHJhbnNpdGlvbiBmYWlsZWQnKSk7XG5cbiAgICAvLyBIYW5kbGVzIHRoZSBjYXNlIHdoZXJlIGEgc3RhdGUgd2hpY2ggaXMgdGhlIHRhcmdldCBvZiBhIHRyYW5zaXRpb24gaXMgbm90IGZvdW5kLCBhbmQgdGhlIHVzZXJcbiAgICAvLyBjYW4gb3B0aW9uYWxseSByZXRyeSBvciBkZWZlciB0aGUgdHJhbnNpdGlvblxuICAgIGZ1bmN0aW9uIGhhbmRsZVJlZGlyZWN0KHJlZGlyZWN0LCBzdGF0ZSwgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSMkc3RhdGVOb3RGb3VuZFxuICAgICAgICogQGV2ZW50T2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKiBGaXJlZCB3aGVuIGEgcmVxdWVzdGVkIHN0YXRlICoqY2Fubm90IGJlIGZvdW5kKiogdXNpbmcgdGhlIHByb3ZpZGVkIHN0YXRlIG5hbWUgZHVyaW5nIHRyYW5zaXRpb24uXG4gICAgICAgKiBUaGUgZXZlbnQgaXMgYnJvYWRjYXN0IGFsbG93aW5nIGFueSBoYW5kbGVycyBhIHNpbmdsZSBjaGFuY2UgdG8gZGVhbCB3aXRoIHRoZSBlcnJvciAodXN1YWxseSBieVxuICAgICAgICogbGF6eS1sb2FkaW5nIHRoZSB1bmZvdW5kIHN0YXRlKS4gQSBzcGVjaWFsIGB1bmZvdW5kU3RhdGVgIG9iamVjdCBpcyBwYXNzZWQgdG8gdGhlIGxpc3RlbmVyIGhhbmRsZXIsXG4gICAgICAgKiB5b3UgY2FuIHNlZSBpdHMgdGhyZWUgcHJvcGVydGllcyBpbiB0aGUgZXhhbXBsZS4gWW91IGNhbiB1c2UgYGV2ZW50LnByZXZlbnREZWZhdWx0KClgIHRvIGFib3J0IHRoZVxuICAgICAgICogdHJhbnNpdGlvbiBhbmQgdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSBgZ29gIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCBhIGAndHJhbnNpdGlvbiBhYm9ydGVkJ2AgdmFsdWUuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IG9iamVjdC5cbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB1bmZvdW5kU3RhdGUgVW5mb3VuZCBTdGF0ZSBpbmZvcm1hdGlvbi4gQ29udGFpbnM6IGB0bywgdG9QYXJhbXMsIG9wdGlvbnNgIHByb3BlcnRpZXMuXG4gICAgICAgKiBAcGFyYW0ge1N0YXRlfSBmcm9tU3RhdGUgQ3VycmVudCBzdGF0ZSBvYmplY3QuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gZnJvbVBhcmFtcyBDdXJyZW50IHN0YXRlIHBhcmFtcy5cbiAgICAgICAqXG4gICAgICAgKiBAZXhhbXBsZVxuICAgICAgICpcbiAgICAgICAqIDxwcmU+XG4gICAgICAgKiAvLyBzb21ld2hlcmUsIGFzc3VtZSBsYXp5LnN0YXRlIGhhcyBub3QgYmVlbiBkZWZpbmVkXG4gICAgICAgKiAkc3RhdGUuZ28oXCJsYXp5LnN0YXRlXCIsIHthOjEsIGI6Mn0sIHtpbmhlcml0OmZhbHNlfSk7XG4gICAgICAgKlxuICAgICAgICogLy8gc29tZXdoZXJlIGVsc2VcbiAgICAgICAqICRzY29wZS4kb24oJyRzdGF0ZU5vdEZvdW5kJyxcbiAgICAgICAqIGZ1bmN0aW9uKGV2ZW50LCB1bmZvdW5kU3RhdGUsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyl7XG4gICAgICAgKiAgICAgY29uc29sZS5sb2codW5mb3VuZFN0YXRlLnRvKTsgLy8gXCJsYXp5LnN0YXRlXCJcbiAgICAgICAqICAgICBjb25zb2xlLmxvZyh1bmZvdW5kU3RhdGUudG9QYXJhbXMpOyAvLyB7YToxLCBiOjJ9XG4gICAgICAgKiAgICAgY29uc29sZS5sb2codW5mb3VuZFN0YXRlLm9wdGlvbnMpOyAvLyB7aW5oZXJpdDpmYWxzZX0gKyBkZWZhdWx0IG9wdGlvbnNcbiAgICAgICAqIH0pXG4gICAgICAgKiA8L3ByZT5cbiAgICAgICAqL1xuICAgICAgdmFyIGV2dCA9ICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHN0YXRlTm90Rm91bmQnLCByZWRpcmVjdCwgc3RhdGUsIHBhcmFtcyk7XG5cbiAgICAgIGlmIChldnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gVHJhbnNpdGlvbkFib3J0ZWQ7XG4gICAgICB9XG5cbiAgICAgIGlmICghZXZ0LnJldHJ5KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICAvLyBBbGxvdyB0aGUgaGFuZGxlciB0byByZXR1cm4gYSBwcm9taXNlIHRvIGRlZmVyIHN0YXRlIGxvb2t1cCByZXRyeVxuICAgICAgaWYgKG9wdGlvbnMuJHJldHJ5KSB7XG4gICAgICAgICR1cmxSb3V0ZXIudXBkYXRlKCk7XG4gICAgICAgIHJldHVybiBUcmFuc2l0aW9uRmFpbGVkO1xuICAgICAgfVxuICAgICAgdmFyIHJldHJ5VHJhbnNpdGlvbiA9ICRzdGF0ZS50cmFuc2l0aW9uID0gJHEud2hlbihldnQucmV0cnkpO1xuXG4gICAgICByZXRyeVRyYW5zaXRpb24udGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJldHJ5VHJhbnNpdGlvbiAhPT0gJHN0YXRlLnRyYW5zaXRpb24pIHJldHVybiBUcmFuc2l0aW9uU3VwZXJzZWRlZDtcbiAgICAgICAgcmVkaXJlY3Qub3B0aW9ucy4kcmV0cnkgPSB0cnVlO1xuICAgICAgICByZXR1cm4gJHN0YXRlLnRyYW5zaXRpb25UbyhyZWRpcmVjdC50bywgcmVkaXJlY3QudG9QYXJhbXMsIHJlZGlyZWN0Lm9wdGlvbnMpO1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBUcmFuc2l0aW9uQWJvcnRlZDtcbiAgICAgIH0pO1xuICAgICAgJHVybFJvdXRlci51cGRhdGUoKTtcblxuICAgICAgcmV0dXJuIHJldHJ5VHJhbnNpdGlvbjtcbiAgICB9XG5cbiAgICByb290LmxvY2FscyA9IHsgcmVzb2x2ZTogbnVsbCwgZ2xvYmFsczogeyAkc3RhdGVQYXJhbXM6IHt9IH0gfTtcblxuICAgICRzdGF0ZSA9IHtcbiAgICAgIHBhcmFtczoge30sXG4gICAgICBjdXJyZW50OiByb290LnNlbGYsXG4gICAgICAkY3VycmVudDogcm9vdCxcbiAgICAgIHRyYW5zaXRpb246IG51bGxcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNyZWxvYWRcbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogQSBtZXRob2QgdGhhdCBmb3JjZSByZWxvYWRzIHRoZSBjdXJyZW50IHN0YXRlLiBBbGwgcmVzb2x2ZXMgYXJlIHJlLXJlc29sdmVkLFxuICAgICAqIGNvbnRyb2xsZXJzIHJlaW5zdGFudGlhdGVkLCBhbmQgZXZlbnRzIHJlLWZpcmVkLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiA8cHJlPlxuICAgICAqIHZhciBhcHAgYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJ10pO1xuICAgICAqXG4gICAgICogYXBwLmNvbnRyb2xsZXIoJ2N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUpIHtcbiAgICAgKiAgICRzY29wZS5yZWxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAqICAgICAkc3RhdGUucmVsb2FkKCk7XG4gICAgICogICB9XG4gICAgICogfSk7XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBgcmVsb2FkKClgIGlzIGp1c3QgYW4gYWxpYXMgZm9yOlxuICAgICAqIDxwcmU+XG4gICAgICogJHN0YXRlLnRyYW5zaXRpb25Ubygkc3RhdGUuY3VycmVudCwgJHN0YXRlUGFyYW1zLCB7IFxuICAgICAqICAgcmVsb2FkOiB0cnVlLCBpbmhlcml0OiBmYWxzZSwgbm90aWZ5OiB0cnVlXG4gICAgICogfSk7XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZz18b2JqZWN0PX0gc3RhdGUgLSBBIHN0YXRlIG5hbWUgb3IgYSBzdGF0ZSBvYmplY3QsIHdoaWNoIGlzIHRoZSByb290IG9mIHRoZSByZXNvbHZlcyB0byBiZSByZS1yZXNvbHZlZC5cbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIDxwcmU+XG4gICAgICogLy9hc3N1bWluZyBhcHAgYXBwbGljYXRpb24gY29uc2lzdHMgb2YgMyBzdGF0ZXM6ICdjb250YWN0cycsICdjb250YWN0cy5kZXRhaWwnLCAnY29udGFjdHMuZGV0YWlsLml0ZW0nIFxuICAgICAqIC8vYW5kIGN1cnJlbnQgc3RhdGUgaXMgJ2NvbnRhY3RzLmRldGFpbC5pdGVtJ1xuICAgICAqIHZhciBhcHAgYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJ10pO1xuICAgICAqXG4gICAgICogYXBwLmNvbnRyb2xsZXIoJ2N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUpIHtcbiAgICAgKiAgICRzY29wZS5yZWxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAqICAgICAvL3dpbGwgcmVsb2FkICdjb250YWN0LmRldGFpbCcgYW5kICdjb250YWN0LmRldGFpbC5pdGVtJyBzdGF0ZXNcbiAgICAgKiAgICAgJHN0YXRlLnJlbG9hZCgnY29udGFjdC5kZXRhaWwnKTtcbiAgICAgKiAgIH1cbiAgICAgKiB9KTtcbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIGByZWxvYWQoKWAgaXMganVzdCBhbiBhbGlhcyBmb3I6XG4gICAgICogPHByZT5cbiAgICAgKiAkc3RhdGUudHJhbnNpdGlvblRvKCRzdGF0ZS5jdXJyZW50LCAkc3RhdGVQYXJhbXMsIHsgXG4gICAgICogICByZWxvYWQ6IHRydWUsIGluaGVyaXQ6IGZhbHNlLCBub3RpZnk6IHRydWVcbiAgICAgKiB9KTtcbiAgICAgKiA8L3ByZT5cblxuICAgICAqIEByZXR1cm5zIHtwcm9taXNlfSBBIHByb21pc2UgcmVwcmVzZW50aW5nIHRoZSBzdGF0ZSBvZiB0aGUgbmV3IHRyYW5zaXRpb24uIFNlZVxuICAgICAqIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfZ28gJHN0YXRlLmdvfS5cbiAgICAgKi9cbiAgICAkc3RhdGUucmVsb2FkID0gZnVuY3Rpb24gcmVsb2FkKHN0YXRlKSB7XG4gICAgICByZXR1cm4gJHN0YXRlLnRyYW5zaXRpb25Ubygkc3RhdGUuY3VycmVudCwgJHN0YXRlUGFyYW1zLCB7IHJlbG9hZDogc3RhdGUgfHwgdHJ1ZSwgaW5oZXJpdDogZmFsc2UsIG5vdGlmeTogdHJ1ZX0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI2dvXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIENvbnZlbmllbmNlIG1ldGhvZCBmb3IgdHJhbnNpdGlvbmluZyB0byBhIG5ldyBzdGF0ZS4gYCRzdGF0ZS5nb2AgY2FsbHMgXG4gICAgICogYCRzdGF0ZS50cmFuc2l0aW9uVG9gIGludGVybmFsbHkgYnV0IGF1dG9tYXRpY2FsbHkgc2V0cyBvcHRpb25zIHRvIFxuICAgICAqIGB7IGxvY2F0aW9uOiB0cnVlLCBpbmhlcml0OiB0cnVlLCByZWxhdGl2ZTogJHN0YXRlLiRjdXJyZW50LCBub3RpZnk6IHRydWUgfWAuIFxuICAgICAqIFRoaXMgYWxsb3dzIHlvdSB0byBlYXNpbHkgdXNlIGFuIGFic29sdXRlIG9yIHJlbGF0aXZlIHRvIHBhdGggYW5kIHNwZWNpZnkgXG4gICAgICogb25seSB0aGUgcGFyYW1ldGVycyB5b3UnZCBsaWtlIHRvIHVwZGF0ZSAod2hpbGUgbGV0dGluZyB1bnNwZWNpZmllZCBwYXJhbWV0ZXJzIFxuICAgICAqIGluaGVyaXQgZnJvbSB0aGUgY3VycmVudGx5IGFjdGl2ZSBhbmNlc3RvciBzdGF0ZXMpLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiA8cHJlPlxuICAgICAqIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXInXSk7XG4gICAgICpcbiAgICAgKiBhcHAuY29udHJvbGxlcignY3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSkge1xuICAgICAqICAgJHNjb3BlLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAqICAgICAkc3RhdGUuZ28oJ2NvbnRhY3QuZGV0YWlsJyk7XG4gICAgICogICB9O1xuICAgICAqIH0pO1xuICAgICAqIDwvcHJlPlxuICAgICAqIDxpbWcgc3JjPScuLi9uZ2RvY19hc3NldHMvU3RhdGVHb0V4YW1wbGVzLnBuZycvPlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRvIEFic29sdXRlIHN0YXRlIG5hbWUgb3IgcmVsYXRpdmUgc3RhdGUgcGF0aC4gU29tZSBleGFtcGxlczpcbiAgICAgKlxuICAgICAqIC0gYCRzdGF0ZS5nbygnY29udGFjdC5kZXRhaWwnKWAgLSB3aWxsIGdvIHRvIHRoZSBgY29udGFjdC5kZXRhaWxgIHN0YXRlXG4gICAgICogLSBgJHN0YXRlLmdvKCdeJylgIC0gd2lsbCBnbyB0byBhIHBhcmVudCBzdGF0ZVxuICAgICAqIC0gYCRzdGF0ZS5nbygnXi5zaWJsaW5nJylgIC0gd2lsbCBnbyB0byBhIHNpYmxpbmcgc3RhdGVcbiAgICAgKiAtIGAkc3RhdGUuZ28oJy5jaGlsZC5ncmFuZGNoaWxkJylgIC0gd2lsbCBnbyB0byBncmFuZGNoaWxkIHN0YXRlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdD19IHBhcmFtcyBBIG1hcCBvZiB0aGUgcGFyYW1ldGVycyB0aGF0IHdpbGwgYmUgc2VudCB0byB0aGUgc3RhdGUsIFxuICAgICAqIHdpbGwgcG9wdWxhdGUgJHN0YXRlUGFyYW1zLiBBbnkgcGFyYW1ldGVycyB0aGF0IGFyZSBub3Qgc3BlY2lmaWVkIHdpbGwgYmUgaW5oZXJpdGVkIGZyb20gY3VycmVudGx5IFxuICAgICAqIGRlZmluZWQgcGFyYW1ldGVycy4gT25seSBwYXJhbWV0ZXJzIHNwZWNpZmllZCBpbiB0aGUgc3RhdGUgZGVmaW5pdGlvbiBjYW4gYmUgb3ZlcnJpZGRlbiwgbmV3IFxuICAgICAqIHBhcmFtZXRlcnMgd2lsbCBiZSBpZ25vcmVkLiBUaGlzIGFsbG93cywgZm9yIGV4YW1wbGUsIGdvaW5nIHRvIGEgc2libGluZyBzdGF0ZSB0aGF0IHNoYXJlcyBwYXJhbWV0ZXJzXG4gICAgICogc3BlY2lmaWVkIGluIGEgcGFyZW50IHN0YXRlLiBQYXJhbWV0ZXIgaW5oZXJpdGFuY2Ugb25seSB3b3JrcyBiZXR3ZWVuIGNvbW1vbiBhbmNlc3RvciBzdGF0ZXMsIEkuZS5cbiAgICAgKiB0cmFuc2l0aW9uaW5nIHRvIGEgc2libGluZyB3aWxsIGdldCB5b3UgdGhlIHBhcmFtZXRlcnMgZm9yIGFsbCBwYXJlbnRzLCB0cmFuc2l0aW9uaW5nIHRvIGEgY2hpbGRcbiAgICAgKiB3aWxsIGdldCB5b3UgYWxsIGN1cnJlbnQgcGFyYW1ldGVycywgZXRjLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0aW9ucyBPcHRpb25zIG9iamVjdC4gVGhlIG9wdGlvbnMgYXJlOlxuICAgICAqXG4gICAgICogLSAqKmBsb2NhdGlvbmAqKiAtIHtib29sZWFuPXRydWV8c3RyaW5nPX0gLSBJZiBgdHJ1ZWAgd2lsbCB1cGRhdGUgdGhlIHVybCBpbiB0aGUgbG9jYXRpb24gYmFyLCBpZiBgZmFsc2VgXG4gICAgICogICAgd2lsbCBub3QuIElmIHN0cmluZywgbXVzdCBiZSBgXCJyZXBsYWNlXCJgLCB3aGljaCB3aWxsIHVwZGF0ZSB1cmwgYW5kIGFsc28gcmVwbGFjZSBsYXN0IGhpc3RvcnkgcmVjb3JkLlxuICAgICAqIC0gKipgaW5oZXJpdGAqKiAtIHtib29sZWFuPXRydWV9LCBJZiBgdHJ1ZWAgd2lsbCBpbmhlcml0IHVybCBwYXJhbWV0ZXJzIGZyb20gY3VycmVudCB1cmwuXG4gICAgICogLSAqKmByZWxhdGl2ZWAqKiAtIHtvYmplY3Q9JHN0YXRlLiRjdXJyZW50fSwgV2hlbiB0cmFuc2l0aW9uaW5nIHdpdGggcmVsYXRpdmUgcGF0aCAoZS5nICdeJyksIFxuICAgICAqICAgIGRlZmluZXMgd2hpY2ggc3RhdGUgdG8gYmUgcmVsYXRpdmUgZnJvbS5cbiAgICAgKiAtICoqYG5vdGlmeWAqKiAtIHtib29sZWFuPXRydWV9LCBJZiBgdHJ1ZWAgd2lsbCBicm9hZGNhc3QgJHN0YXRlQ2hhbmdlU3RhcnQgYW5kICRzdGF0ZUNoYW5nZVN1Y2Nlc3MgZXZlbnRzLlxuICAgICAqIC0gKipgcmVsb2FkYCoqICh2MC4yLjUpIC0ge2Jvb2xlYW49ZmFsc2V8c3RyaW5nfG9iamVjdH0sIElmIGB0cnVlYCB3aWxsIGZvcmNlIHRyYW5zaXRpb24gZXZlbiBpZiBubyBzdGF0ZSBvciBwYXJhbXNcbiAgICAgKiAgICBoYXZlIGNoYW5nZWQuICBJdCB3aWxsIHJlbG9hZCB0aGUgcmVzb2x2ZXMgYW5kIHZpZXdzIG9mIHRoZSBjdXJyZW50IHN0YXRlIGFuZCBwYXJlbnQgc3RhdGVzLlxuICAgICAqICAgIElmIGByZWxvYWRgIGlzIGEgc3RyaW5nIChvciBzdGF0ZSBvYmplY3QpLCB0aGUgc3RhdGUgb2JqZWN0IGlzIGZldGNoZWQgKGJ5IG5hbWUsIG9yIG9iamVjdCByZWZlcmVuY2UpOyBhbmQgXFxcbiAgICAgKiAgICB0aGUgdHJhbnNpdGlvbiByZWxvYWRzIHRoZSByZXNvbHZlcyBhbmQgdmlld3MgZm9yIHRoYXQgbWF0Y2hlZCBzdGF0ZSwgYW5kIGFsbCBpdHMgY2hpbGRyZW4gc3RhdGVzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge3Byb21pc2V9IEEgcHJvbWlzZSByZXByZXNlbnRpbmcgdGhlIHN0YXRlIG9mIHRoZSBuZXcgdHJhbnNpdGlvbi5cbiAgICAgKlxuICAgICAqIFBvc3NpYmxlIHN1Y2Nlc3MgdmFsdWVzOlxuICAgICAqXG4gICAgICogLSAkc3RhdGUuY3VycmVudFxuICAgICAqXG4gICAgICogPGJyLz5Qb3NzaWJsZSByZWplY3Rpb24gdmFsdWVzOlxuICAgICAqXG4gICAgICogLSAndHJhbnNpdGlvbiBzdXBlcnNlZGVkJyAtIHdoZW4gYSBuZXdlciB0cmFuc2l0aW9uIGhhcyBiZWVuIHN0YXJ0ZWQgYWZ0ZXIgdGhpcyBvbmVcbiAgICAgKiAtICd0cmFuc2l0aW9uIHByZXZlbnRlZCcgLSB3aGVuIGBldmVudC5wcmV2ZW50RGVmYXVsdCgpYCBoYXMgYmVlbiBjYWxsZWQgaW4gYSBgJHN0YXRlQ2hhbmdlU3RhcnRgIGxpc3RlbmVyXG4gICAgICogLSAndHJhbnNpdGlvbiBhYm9ydGVkJyAtIHdoZW4gYGV2ZW50LnByZXZlbnREZWZhdWx0KClgIGhhcyBiZWVuIGNhbGxlZCBpbiBhIGAkc3RhdGVOb3RGb3VuZGAgbGlzdGVuZXIgb3JcbiAgICAgKiAgIHdoZW4gYSBgJHN0YXRlTm90Rm91bmRgIGBldmVudC5yZXRyeWAgcHJvbWlzZSBlcnJvcnMuXG4gICAgICogLSAndHJhbnNpdGlvbiBmYWlsZWQnIC0gd2hlbiBhIHN0YXRlIGhhcyBiZWVuIHVuc3VjY2Vzc2Z1bGx5IGZvdW5kIGFmdGVyIDIgdHJpZXMuXG4gICAgICogLSAqcmVzb2x2ZSBlcnJvciogLSB3aGVuIGFuIGVycm9yIGhhcyBvY2N1cnJlZCB3aXRoIGEgYHJlc29sdmVgXG4gICAgICpcbiAgICAgKi9cbiAgICAkc3RhdGUuZ28gPSBmdW5jdGlvbiBnbyh0bywgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICByZXR1cm4gJHN0YXRlLnRyYW5zaXRpb25Ubyh0bywgcGFyYW1zLCBleHRlbmQoeyBpbmhlcml0OiB0cnVlLCByZWxhdGl2ZTogJHN0YXRlLiRjdXJyZW50IH0sIG9wdGlvbnMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSN0cmFuc2l0aW9uVG9cbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogTG93LWxldmVsIG1ldGhvZCBmb3IgdHJhbnNpdGlvbmluZyB0byBhIG5ldyBzdGF0ZS4ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19nbyAkc3RhdGUuZ299XG4gICAgICogdXNlcyBgdHJhbnNpdGlvblRvYCBpbnRlcm5hbGx5LiBgJHN0YXRlLmdvYCBpcyByZWNvbW1lbmRlZCBpbiBtb3N0IHNpdHVhdGlvbnMuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIDxwcmU+XG4gICAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlciddKTtcbiAgICAgKlxuICAgICAqIGFwcC5jb250cm9sbGVyKCdjdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XG4gICAgICogICAkc2NvcGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICogICAgICRzdGF0ZS50cmFuc2l0aW9uVG8oJ2NvbnRhY3QuZGV0YWlsJyk7XG4gICAgICogICB9O1xuICAgICAqIH0pO1xuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRvIFN0YXRlIG5hbWUuXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSB0b1BhcmFtcyBBIG1hcCBvZiB0aGUgcGFyYW1ldGVycyB0aGF0IHdpbGwgYmUgc2VudCB0byB0aGUgc3RhdGUsXG4gICAgICogd2lsbCBwb3B1bGF0ZSAkc3RhdGVQYXJhbXMuXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICpcbiAgICAgKiAtICoqYGxvY2F0aW9uYCoqIC0ge2Jvb2xlYW49dHJ1ZXxzdHJpbmc9fSAtIElmIGB0cnVlYCB3aWxsIHVwZGF0ZSB0aGUgdXJsIGluIHRoZSBsb2NhdGlvbiBiYXIsIGlmIGBmYWxzZWBcbiAgICAgKiAgICB3aWxsIG5vdC4gSWYgc3RyaW5nLCBtdXN0IGJlIGBcInJlcGxhY2VcImAsIHdoaWNoIHdpbGwgdXBkYXRlIHVybCBhbmQgYWxzbyByZXBsYWNlIGxhc3QgaGlzdG9yeSByZWNvcmQuXG4gICAgICogLSAqKmBpbmhlcml0YCoqIC0ge2Jvb2xlYW49ZmFsc2V9LCBJZiBgdHJ1ZWAgd2lsbCBpbmhlcml0IHVybCBwYXJhbWV0ZXJzIGZyb20gY3VycmVudCB1cmwuXG4gICAgICogLSAqKmByZWxhdGl2ZWAqKiAtIHtvYmplY3Q9fSwgV2hlbiB0cmFuc2l0aW9uaW5nIHdpdGggcmVsYXRpdmUgcGF0aCAoZS5nICdeJyksIFxuICAgICAqICAgIGRlZmluZXMgd2hpY2ggc3RhdGUgdG8gYmUgcmVsYXRpdmUgZnJvbS5cbiAgICAgKiAtICoqYG5vdGlmeWAqKiAtIHtib29sZWFuPXRydWV9LCBJZiBgdHJ1ZWAgd2lsbCBicm9hZGNhc3QgJHN0YXRlQ2hhbmdlU3RhcnQgYW5kICRzdGF0ZUNoYW5nZVN1Y2Nlc3MgZXZlbnRzLlxuICAgICAqIC0gKipgcmVsb2FkYCoqICh2MC4yLjUpIC0ge2Jvb2xlYW49ZmFsc2V8c3RyaW5nPXxvYmplY3Q9fSwgSWYgYHRydWVgIHdpbGwgZm9yY2UgdHJhbnNpdGlvbiBldmVuIGlmIHRoZSBzdGF0ZSBvciBwYXJhbXMgXG4gICAgICogICAgaGF2ZSBub3QgY2hhbmdlZCwgYWthIGEgcmVsb2FkIG9mIHRoZSBzYW1lIHN0YXRlLiBJdCBkaWZmZXJzIGZyb20gcmVsb2FkT25TZWFyY2ggYmVjYXVzZSB5b3UnZFxuICAgICAqICAgIHVzZSB0aGlzIHdoZW4geW91IHdhbnQgdG8gZm9yY2UgYSByZWxvYWQgd2hlbiAqZXZlcnl0aGluZyogaXMgdGhlIHNhbWUsIGluY2x1ZGluZyBzZWFyY2ggcGFyYW1zLlxuICAgICAqICAgIGlmIFN0cmluZywgdGhlbiB3aWxsIHJlbG9hZCB0aGUgc3RhdGUgd2l0aCB0aGUgbmFtZSBnaXZlbiBpbiByZWxvYWQsIGFuZCBhbnkgY2hpbGRyZW4uXG4gICAgICogICAgaWYgT2JqZWN0LCB0aGVuIGEgc3RhdGVPYmogaXMgZXhwZWN0ZWQsIHdpbGwgcmVsb2FkIHRoZSBzdGF0ZSBmb3VuZCBpbiBzdGF0ZU9iaiwgYW5kIGFueSBjaGlsZHJlbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtwcm9taXNlfSBBIHByb21pc2UgcmVwcmVzZW50aW5nIHRoZSBzdGF0ZSBvZiB0aGUgbmV3IHRyYW5zaXRpb24uIFNlZVxuICAgICAqIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfZ28gJHN0YXRlLmdvfS5cbiAgICAgKi9cbiAgICAkc3RhdGUudHJhbnNpdGlvblRvID0gZnVuY3Rpb24gdHJhbnNpdGlvblRvKHRvLCB0b1BhcmFtcywgb3B0aW9ucykge1xuICAgICAgdG9QYXJhbXMgPSB0b1BhcmFtcyB8fCB7fTtcbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoe1xuICAgICAgICBsb2NhdGlvbjogdHJ1ZSwgaW5oZXJpdDogZmFsc2UsIHJlbGF0aXZlOiBudWxsLCBub3RpZnk6IHRydWUsIHJlbG9hZDogZmFsc2UsICRyZXRyeTogZmFsc2VcbiAgICAgIH0sIG9wdGlvbnMgfHwge30pO1xuXG4gICAgICB2YXIgZnJvbSA9ICRzdGF0ZS4kY3VycmVudCwgZnJvbVBhcmFtcyA9ICRzdGF0ZS5wYXJhbXMsIGZyb21QYXRoID0gZnJvbS5wYXRoO1xuICAgICAgdmFyIGV2dCwgdG9TdGF0ZSA9IGZpbmRTdGF0ZSh0bywgb3B0aW9ucy5yZWxhdGl2ZSk7XG5cbiAgICAgIC8vIFN0b3JlIHRoZSBoYXNoIHBhcmFtIGZvciBsYXRlciAoc2luY2UgaXQgd2lsbCBiZSBzdHJpcHBlZCBvdXQgYnkgdmFyaW91cyBtZXRob2RzKVxuICAgICAgdmFyIGhhc2ggPSB0b1BhcmFtc1snIyddO1xuXG4gICAgICBpZiAoIWlzRGVmaW5lZCh0b1N0YXRlKSkge1xuICAgICAgICB2YXIgcmVkaXJlY3QgPSB7IHRvOiB0bywgdG9QYXJhbXM6IHRvUGFyYW1zLCBvcHRpb25zOiBvcHRpb25zIH07XG4gICAgICAgIHZhciByZWRpcmVjdFJlc3VsdCA9IGhhbmRsZVJlZGlyZWN0KHJlZGlyZWN0LCBmcm9tLnNlbGYsIGZyb21QYXJhbXMsIG9wdGlvbnMpO1xuXG4gICAgICAgIGlmIChyZWRpcmVjdFJlc3VsdCkge1xuICAgICAgICAgIHJldHVybiByZWRpcmVjdFJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFsd2F5cyByZXRyeSBvbmNlIGlmIHRoZSAkc3RhdGVOb3RGb3VuZCB3YXMgbm90IHByZXZlbnRlZFxuICAgICAgICAvLyAoaGFuZGxlcyBlaXRoZXIgcmVkaXJlY3QgY2hhbmdlZCBvciBzdGF0ZSBsYXp5LWRlZmluaXRpb24pXG4gICAgICAgIHRvID0gcmVkaXJlY3QudG87XG4gICAgICAgIHRvUGFyYW1zID0gcmVkaXJlY3QudG9QYXJhbXM7XG4gICAgICAgIG9wdGlvbnMgPSByZWRpcmVjdC5vcHRpb25zO1xuICAgICAgICB0b1N0YXRlID0gZmluZFN0YXRlKHRvLCBvcHRpb25zLnJlbGF0aXZlKTtcblxuICAgICAgICBpZiAoIWlzRGVmaW5lZCh0b1N0YXRlKSkge1xuICAgICAgICAgIGlmICghb3B0aW9ucy5yZWxhdGl2ZSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gc3VjaCBzdGF0ZSAnXCIgKyB0byArIFwiJ1wiKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgcmVzb2x2ZSAnXCIgKyB0byArIFwiJyBmcm9tIHN0YXRlICdcIiArIG9wdGlvbnMucmVsYXRpdmUgKyBcIidcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0b1N0YXRlW2Fic3RyYWN0S2V5XSkgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IHRyYW5zaXRpb24gdG8gYWJzdHJhY3Qgc3RhdGUgJ1wiICsgdG8gKyBcIidcIik7XG4gICAgICBpZiAob3B0aW9ucy5pbmhlcml0KSB0b1BhcmFtcyA9IGluaGVyaXRQYXJhbXMoJHN0YXRlUGFyYW1zLCB0b1BhcmFtcyB8fCB7fSwgJHN0YXRlLiRjdXJyZW50LCB0b1N0YXRlKTtcbiAgICAgIGlmICghdG9TdGF0ZS5wYXJhbXMuJCR2YWxpZGF0ZXModG9QYXJhbXMpKSByZXR1cm4gVHJhbnNpdGlvbkZhaWxlZDtcblxuICAgICAgdG9QYXJhbXMgPSB0b1N0YXRlLnBhcmFtcy4kJHZhbHVlcyh0b1BhcmFtcyk7XG4gICAgICB0byA9IHRvU3RhdGU7XG5cbiAgICAgIHZhciB0b1BhdGggPSB0by5wYXRoO1xuXG4gICAgICAvLyBTdGFydGluZyBmcm9tIHRoZSByb290IG9mIHRoZSBwYXRoLCBrZWVwIGFsbCBsZXZlbHMgdGhhdCBoYXZlbid0IGNoYW5nZWRcbiAgICAgIHZhciBrZWVwID0gMCwgc3RhdGUgPSB0b1BhdGhba2VlcF0sIGxvY2FscyA9IHJvb3QubG9jYWxzLCB0b0xvY2FscyA9IFtdO1xuXG4gICAgICBpZiAoIW9wdGlvbnMucmVsb2FkKSB7XG4gICAgICAgIHdoaWxlIChzdGF0ZSAmJiBzdGF0ZSA9PT0gZnJvbVBhdGhba2VlcF0gJiYgc3RhdGUub3duUGFyYW1zLiQkZXF1YWxzKHRvUGFyYW1zLCBmcm9tUGFyYW1zKSkge1xuICAgICAgICAgIGxvY2FscyA9IHRvTG9jYWxzW2tlZXBdID0gc3RhdGUubG9jYWxzO1xuICAgICAgICAgIGtlZXArKztcbiAgICAgICAgICBzdGF0ZSA9IHRvUGF0aFtrZWVwXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZyhvcHRpb25zLnJlbG9hZCkgfHwgaXNPYmplY3Qob3B0aW9ucy5yZWxvYWQpKSB7XG4gICAgICAgIGlmIChpc09iamVjdChvcHRpb25zLnJlbG9hZCkgJiYgIW9wdGlvbnMucmVsb2FkLm5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVsb2FkIHN0YXRlIG9iamVjdCcpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcmVsb2FkU3RhdGUgPSBvcHRpb25zLnJlbG9hZCA9PT0gdHJ1ZSA/IGZyb21QYXRoWzBdIDogZmluZFN0YXRlKG9wdGlvbnMucmVsb2FkKTtcbiAgICAgICAgaWYgKG9wdGlvbnMucmVsb2FkICYmICFyZWxvYWRTdGF0ZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHN1Y2ggcmVsb2FkIHN0YXRlICdcIiArIChpc1N0cmluZyhvcHRpb25zLnJlbG9hZCkgPyBvcHRpb25zLnJlbG9hZCA6IG9wdGlvbnMucmVsb2FkLm5hbWUpICsgXCInXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHN0YXRlICYmIHN0YXRlID09PSBmcm9tUGF0aFtrZWVwXSAmJiBzdGF0ZSAhPT0gcmVsb2FkU3RhdGUpIHtcbiAgICAgICAgICBsb2NhbHMgPSB0b0xvY2Fsc1trZWVwXSA9IHN0YXRlLmxvY2FscztcbiAgICAgICAgICBrZWVwKys7XG4gICAgICAgICAgc3RhdGUgPSB0b1BhdGhba2VlcF07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgd2UncmUgZ29pbmcgdG8gdGhlIHNhbWUgc3RhdGUgYW5kIGFsbCBsb2NhbHMgYXJlIGtlcHQsIHdlJ3ZlIGdvdCBub3RoaW5nIHRvIGRvLlxuICAgICAgLy8gQnV0IGNsZWFyICd0cmFuc2l0aW9uJywgYXMgd2Ugc3RpbGwgd2FudCB0byBjYW5jZWwgYW55IG90aGVyIHBlbmRpbmcgdHJhbnNpdGlvbnMuXG4gICAgICAvLyBUT0RPOiBXZSBtYXkgbm90IHdhbnQgdG8gYnVtcCAndHJhbnNpdGlvbicgaWYgd2UncmUgY2FsbGVkIGZyb20gYSBsb2NhdGlvbiBjaGFuZ2VcbiAgICAgIC8vIHRoYXQgd2UndmUgaW5pdGlhdGVkIG91cnNlbHZlcywgYmVjYXVzZSB3ZSBtaWdodCBhY2NpZGVudGFsbHkgYWJvcnQgYSBsZWdpdGltYXRlXG4gICAgICAvLyB0cmFuc2l0aW9uIGluaXRpYXRlZCBmcm9tIGNvZGU/XG4gICAgICBpZiAoc2hvdWxkU2tpcFJlbG9hZCh0bywgdG9QYXJhbXMsIGZyb20sIGZyb21QYXJhbXMsIGxvY2Fscywgb3B0aW9ucykpIHtcbiAgICAgICAgaWYgKGhhc2gpIHRvUGFyYW1zWycjJ10gPSBoYXNoO1xuICAgICAgICAkc3RhdGUucGFyYW1zID0gdG9QYXJhbXM7XG4gICAgICAgIGNvcHkoJHN0YXRlLnBhcmFtcywgJHN0YXRlUGFyYW1zKTtcbiAgICAgICAgY29weShmaWx0ZXJCeUtleXModG8ucGFyYW1zLiQka2V5cygpLCAkc3RhdGVQYXJhbXMpLCB0by5sb2NhbHMuZ2xvYmFscy4kc3RhdGVQYXJhbXMpO1xuICAgICAgICBpZiAob3B0aW9ucy5sb2NhdGlvbiAmJiB0by5uYXZpZ2FibGUgJiYgdG8ubmF2aWdhYmxlLnVybCkge1xuICAgICAgICAgICR1cmxSb3V0ZXIucHVzaCh0by5uYXZpZ2FibGUudXJsLCB0b1BhcmFtcywge1xuICAgICAgICAgICAgJCRhdm9pZFJlc3luYzogdHJ1ZSwgcmVwbGFjZTogb3B0aW9ucy5sb2NhdGlvbiA9PT0gJ3JlcGxhY2UnXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHVybFJvdXRlci51cGRhdGUodHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgJHN0YXRlLnRyYW5zaXRpb24gPSBudWxsO1xuICAgICAgICByZXR1cm4gJHEud2hlbigkc3RhdGUuY3VycmVudCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpbHRlciBwYXJhbWV0ZXJzIGJlZm9yZSB3ZSBwYXNzIHRoZW0gdG8gZXZlbnQgaGFuZGxlcnMgZXRjLlxuICAgICAgdG9QYXJhbXMgPSBmaWx0ZXJCeUtleXModG8ucGFyYW1zLiQka2V5cygpLCB0b1BhcmFtcyB8fCB7fSk7XG4gICAgICBcbiAgICAgIC8vIFJlLWFkZCB0aGUgc2F2ZWQgaGFzaCBiZWZvcmUgd2Ugc3RhcnQgcmV0dXJuaW5nIHRoaW5ncyBvciBicm9hZGNhc3RpbmcgJHN0YXRlQ2hhbmdlU3RhcnRcbiAgICAgIGlmIChoYXNoKSB0b1BhcmFtc1snIyddID0gaGFzaDtcbiAgICAgIFxuICAgICAgLy8gQnJvYWRjYXN0IHN0YXJ0IGV2ZW50IGFuZCBjYW5jZWwgdGhlIHRyYW5zaXRpb24gaWYgcmVxdWVzdGVkXG4gICAgICBpZiAob3B0aW9ucy5ub3RpZnkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlIyRzdGF0ZUNoYW5nZVN0YXJ0XG4gICAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxuICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICogRmlyZWQgd2hlbiB0aGUgc3RhdGUgdHJhbnNpdGlvbiAqKmJlZ2lucyoqLiBZb3UgY2FuIHVzZSBgZXZlbnQucHJldmVudERlZmF1bHQoKWBcbiAgICAgICAgICogdG8gcHJldmVudCB0aGUgdHJhbnNpdGlvbiBmcm9tIGhhcHBlbmluZyBhbmQgdGhlbiB0aGUgdHJhbnNpdGlvbiBwcm9taXNlIHdpbGwgYmVcbiAgICAgICAgICogcmVqZWN0ZWQgd2l0aCBhIGAndHJhbnNpdGlvbiBwcmV2ZW50ZWQnYCB2YWx1ZS5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gdG9TdGF0ZSBUaGUgc3RhdGUgYmVpbmcgdHJhbnNpdGlvbmVkIHRvLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdG9QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYHRvU3RhdGVgLlxuICAgICAgICAgKiBAcGFyYW0ge1N0YXRlfSBmcm9tU3RhdGUgVGhlIGN1cnJlbnQgc3RhdGUsIHByZS10cmFuc2l0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZnJvbVBhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgZnJvbVN0YXRlYC5cbiAgICAgICAgICpcbiAgICAgICAgICogQGV4YW1wbGVcbiAgICAgICAgICpcbiAgICAgICAgICogPHByZT5cbiAgICAgICAgICogJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JyxcbiAgICAgICAgICogZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMpe1xuICAgICAgICAgKiAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICogICAgIC8vIHRyYW5zaXRpb25UbygpIHByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoXG4gICAgICAgICAqICAgICAvLyBhICd0cmFuc2l0aW9uIHByZXZlbnRlZCcgZXJyb3JcbiAgICAgICAgICogfSlcbiAgICAgICAgICogPC9wcmU+XG4gICAgICAgICAqL1xuICAgICAgICBpZiAoJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVDaGFuZ2VTdGFydCcsIHRvLnNlbGYsIHRvUGFyYW1zLCBmcm9tLnNlbGYsIGZyb21QYXJhbXMsIG9wdGlvbnMpLmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRzdGF0ZUNoYW5nZUNhbmNlbCcsIHRvLnNlbGYsIHRvUGFyYW1zLCBmcm9tLnNlbGYsIGZyb21QYXJhbXMpO1xuICAgICAgICAgIC8vRG9uJ3QgdXBkYXRlIGFuZCByZXN5bmMgdXJsIGlmIHRoZXJlJ3MgYmVlbiBhIG5ldyB0cmFuc2l0aW9uIHN0YXJ0ZWQuIHNlZSBpc3N1ZSAjMjIzOCwgIzYwMFxuICAgICAgICAgIGlmICgkc3RhdGUudHJhbnNpdGlvbiA9PSBudWxsKSAkdXJsUm91dGVyLnVwZGF0ZSgpO1xuICAgICAgICAgIHJldHVybiBUcmFuc2l0aW9uUHJldmVudGVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlc29sdmUgbG9jYWxzIGZvciB0aGUgcmVtYWluaW5nIHN0YXRlcywgYnV0IGRvbid0IHVwZGF0ZSBhbnkgZ2xvYmFsIHN0YXRlIGp1c3RcbiAgICAgIC8vIHlldCAtLSBpZiBhbnl0aGluZyBmYWlscyB0byByZXNvbHZlIHRoZSBjdXJyZW50IHN0YXRlIG5lZWRzIHRvIHJlbWFpbiB1bnRvdWNoZWQuXG4gICAgICAvLyBXZSBhbHNvIHNldCB1cCBhbiBpbmhlcml0YW5jZSBjaGFpbiBmb3IgdGhlIGxvY2FscyBoZXJlLiBUaGlzIGFsbG93cyB0aGUgdmlldyBkaXJlY3RpdmVcbiAgICAgIC8vIHRvIHF1aWNrbHkgbG9vayB1cCB0aGUgY29ycmVjdCBkZWZpbml0aW9uIGZvciBlYWNoIHZpZXcgaW4gdGhlIGN1cnJlbnQgc3RhdGUuIEV2ZW5cbiAgICAgIC8vIHRob3VnaCB3ZSBjcmVhdGUgdGhlIGxvY2FscyBvYmplY3QgaXRzZWxmIG91dHNpZGUgcmVzb2x2ZVN0YXRlKCksIGl0IGlzIGluaXRpYWxseVxuICAgICAgLy8gZW1wdHkgYW5kIGdldHMgZmlsbGVkIGFzeW5jaHJvbm91c2x5LiBXZSBuZWVkIHRvIGtlZXAgdHJhY2sgb2YgdGhlIHByb21pc2UgZm9yIHRoZVxuICAgICAgLy8gKGZ1bGx5IHJlc29sdmVkKSBjdXJyZW50IGxvY2FscywgYW5kIHBhc3MgdGhpcyBkb3duIHRoZSBjaGFpbi5cbiAgICAgIHZhciByZXNvbHZlZCA9ICRxLndoZW4obG9jYWxzKTtcblxuICAgICAgZm9yICh2YXIgbCA9IGtlZXA7IGwgPCB0b1BhdGgubGVuZ3RoOyBsKyssIHN0YXRlID0gdG9QYXRoW2xdKSB7XG4gICAgICAgIGxvY2FscyA9IHRvTG9jYWxzW2xdID0gaW5oZXJpdChsb2NhbHMpO1xuICAgICAgICByZXNvbHZlZCA9IHJlc29sdmVTdGF0ZShzdGF0ZSwgdG9QYXJhbXMsIHN0YXRlID09PSB0bywgcmVzb2x2ZWQsIGxvY2Fscywgb3B0aW9ucyk7XG4gICAgICB9XG5cbiAgICAgIC8vIE9uY2UgZXZlcnl0aGluZyBpcyByZXNvbHZlZCwgd2UgYXJlIHJlYWR5IHRvIHBlcmZvcm0gdGhlIGFjdHVhbCB0cmFuc2l0aW9uXG4gICAgICAvLyBhbmQgcmV0dXJuIGEgcHJvbWlzZSBmb3IgdGhlIG5ldyBzdGF0ZS4gV2UgYWxzbyBrZWVwIHRyYWNrIG9mIHdoYXQgdGhlXG4gICAgICAvLyBjdXJyZW50IHByb21pc2UgaXMsIHNvIHRoYXQgd2UgY2FuIGRldGVjdCBvdmVybGFwcGluZyB0cmFuc2l0aW9ucyBhbmRcbiAgICAgIC8vIGtlZXAgb25seSB0aGUgb3V0Y29tZSBvZiB0aGUgbGFzdCB0cmFuc2l0aW9uLlxuICAgICAgdmFyIHRyYW5zaXRpb24gPSAkc3RhdGUudHJhbnNpdGlvbiA9IHJlc29sdmVkLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbCwgZW50ZXJpbmcsIGV4aXRpbmc7XG5cbiAgICAgICAgaWYgKCRzdGF0ZS50cmFuc2l0aW9uICE9PSB0cmFuc2l0aW9uKSByZXR1cm4gVHJhbnNpdGlvblN1cGVyc2VkZWQ7XG5cbiAgICAgICAgLy8gRXhpdCAnZnJvbScgc3RhdGVzIG5vdCBrZXB0XG4gICAgICAgIGZvciAobCA9IGZyb21QYXRoLmxlbmd0aCAtIDE7IGwgPj0ga2VlcDsgbC0tKSB7XG4gICAgICAgICAgZXhpdGluZyA9IGZyb21QYXRoW2xdO1xuICAgICAgICAgIGlmIChleGl0aW5nLnNlbGYub25FeGl0KSB7XG4gICAgICAgICAgICAkaW5qZWN0b3IuaW52b2tlKGV4aXRpbmcuc2VsZi5vbkV4aXQsIGV4aXRpbmcuc2VsZiwgZXhpdGluZy5sb2NhbHMuZ2xvYmFscyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV4aXRpbmcubG9jYWxzID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEVudGVyICd0bycgc3RhdGVzIG5vdCBrZXB0XG4gICAgICAgIGZvciAobCA9IGtlZXA7IGwgPCB0b1BhdGgubGVuZ3RoOyBsKyspIHtcbiAgICAgICAgICBlbnRlcmluZyA9IHRvUGF0aFtsXTtcbiAgICAgICAgICBlbnRlcmluZy5sb2NhbHMgPSB0b0xvY2Fsc1tsXTtcbiAgICAgICAgICBpZiAoZW50ZXJpbmcuc2VsZi5vbkVudGVyKSB7XG4gICAgICAgICAgICAkaW5qZWN0b3IuaW52b2tlKGVudGVyaW5nLnNlbGYub25FbnRlciwgZW50ZXJpbmcuc2VsZiwgZW50ZXJpbmcubG9jYWxzLmdsb2JhbHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJ1biBpdCBhZ2FpbiwgdG8gY2F0Y2ggYW55IHRyYW5zaXRpb25zIGluIGNhbGxiYWNrc1xuICAgICAgICBpZiAoJHN0YXRlLnRyYW5zaXRpb24gIT09IHRyYW5zaXRpb24pIHJldHVybiBUcmFuc2l0aW9uU3VwZXJzZWRlZDtcblxuICAgICAgICAvLyBVcGRhdGUgZ2xvYmFscyBpbiAkc3RhdGVcbiAgICAgICAgJHN0YXRlLiRjdXJyZW50ID0gdG87XG4gICAgICAgICRzdGF0ZS5jdXJyZW50ID0gdG8uc2VsZjtcbiAgICAgICAgJHN0YXRlLnBhcmFtcyA9IHRvUGFyYW1zO1xuICAgICAgICBjb3B5KCRzdGF0ZS5wYXJhbXMsICRzdGF0ZVBhcmFtcyk7XG4gICAgICAgICRzdGF0ZS50cmFuc2l0aW9uID0gbnVsbDtcblxuICAgICAgICBpZiAob3B0aW9ucy5sb2NhdGlvbiAmJiB0by5uYXZpZ2FibGUpIHtcbiAgICAgICAgICAkdXJsUm91dGVyLnB1c2godG8ubmF2aWdhYmxlLnVybCwgdG8ubmF2aWdhYmxlLmxvY2Fscy5nbG9iYWxzLiRzdGF0ZVBhcmFtcywge1xuICAgICAgICAgICAgJCRhdm9pZFJlc3luYzogdHJ1ZSwgcmVwbGFjZTogb3B0aW9ucy5sb2NhdGlvbiA9PT0gJ3JlcGxhY2UnXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob3B0aW9ucy5ub3RpZnkpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlIyRzdGF0ZUNoYW5nZVN1Y2Nlc3NcbiAgICAgICAgICogQGV2ZW50T2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXG4gICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgKiBGaXJlZCBvbmNlIHRoZSBzdGF0ZSB0cmFuc2l0aW9uIGlzICoqY29tcGxldGUqKi5cbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IG9iamVjdC5cbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gdG9TdGF0ZSBUaGUgc3RhdGUgYmVpbmcgdHJhbnNpdGlvbmVkIHRvLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdG9QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYHRvU3RhdGVgLlxuICAgICAgICAgKiBAcGFyYW0ge1N0YXRlfSBmcm9tU3RhdGUgVGhlIGN1cnJlbnQgc3RhdGUsIHByZS10cmFuc2l0aW9uLlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZnJvbVBhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgZnJvbVN0YXRlYC5cbiAgICAgICAgICovXG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgdG8uc2VsZiwgdG9QYXJhbXMsIGZyb20uc2VsZiwgZnJvbVBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgJHVybFJvdXRlci51cGRhdGUodHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuICRzdGF0ZS5jdXJyZW50O1xuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgaWYgKCRzdGF0ZS50cmFuc2l0aW9uICE9PSB0cmFuc2l0aW9uKSByZXR1cm4gVHJhbnNpdGlvblN1cGVyc2VkZWQ7XG5cbiAgICAgICAgJHN0YXRlLnRyYW5zaXRpb24gPSBudWxsO1xuICAgICAgICAvKipcbiAgICAgICAgICogQG5nZG9jIGV2ZW50XG4gICAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjJHN0YXRlQ2hhbmdlRXJyb3JcbiAgICAgICAgICogQGV2ZW50T2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXG4gICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgKiBGaXJlZCB3aGVuIGFuICoqZXJyb3Igb2NjdXJzKiogZHVyaW5nIHRyYW5zaXRpb24uIEl0J3MgaW1wb3J0YW50IHRvIG5vdGUgdGhhdCBpZiB5b3VcbiAgICAgICAgICogaGF2ZSBhbnkgZXJyb3JzIGluIHlvdXIgcmVzb2x2ZSBmdW5jdGlvbnMgKGphdmFzY3JpcHQgZXJyb3JzLCBub24tZXhpc3RlbnQgc2VydmljZXMsIGV0YylcbiAgICAgICAgICogdGhleSB3aWxsIG5vdCB0aHJvdyB0cmFkaXRpb25hbGx5LiBZb3UgbXVzdCBsaXN0ZW4gZm9yIHRoaXMgJHN0YXRlQ2hhbmdlRXJyb3IgZXZlbnQgdG9cbiAgICAgICAgICogY2F0Y2ggKipBTEwqKiBlcnJvcnMuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IHRvU3RhdGUgVGhlIHN0YXRlIGJlaW5nIHRyYW5zaXRpb25lZCB0by5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHRvUGFyYW1zIFRoZSBwYXJhbXMgc3VwcGxpZWQgdG8gdGhlIGB0b1N0YXRlYC5cbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gZnJvbVN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLCBwcmUtdHJhbnNpdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGZyb21QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYGZyb21TdGF0ZWAuXG4gICAgICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIFRoZSByZXNvbHZlIGVycm9yIG9iamVjdC5cbiAgICAgICAgICovXG4gICAgICAgIGV2dCA9ICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHN0YXRlQ2hhbmdlRXJyb3InLCB0by5zZWxmLCB0b1BhcmFtcywgZnJvbS5zZWxmLCBmcm9tUGFyYW1zLCBlcnJvcik7XG5cbiAgICAgICAgaWYgKCFldnQuZGVmYXVsdFByZXZlbnRlZCkge1xuICAgICAgICAgICAgJHVybFJvdXRlci51cGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAkcS5yZWplY3QoZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB0cmFuc2l0aW9uO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI2lzXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFNpbWlsYXIgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19pbmNsdWRlcyAkc3RhdGUuaW5jbHVkZXN9LFxuICAgICAqIGJ1dCBvbmx5IGNoZWNrcyBmb3IgdGhlIGZ1bGwgc3RhdGUgbmFtZS4gSWYgcGFyYW1zIGlzIHN1cHBsaWVkIHRoZW4gaXQgd2lsbCBiZVxuICAgICAqIHRlc3RlZCBmb3Igc3RyaWN0IGVxdWFsaXR5IGFnYWluc3QgdGhlIGN1cnJlbnQgYWN0aXZlIHBhcmFtcyBvYmplY3QsIHNvIGFsbCBwYXJhbXNcbiAgICAgKiBtdXN0IG1hdGNoIHdpdGggbm9uZSBtaXNzaW5nIGFuZCBubyBleHRyYXMuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIDxwcmU+XG4gICAgICogJHN0YXRlLiRjdXJyZW50Lm5hbWUgPSAnY29udGFjdHMuZGV0YWlscy5pdGVtJztcbiAgICAgKlxuICAgICAqIC8vIGFic29sdXRlIG5hbWVcbiAgICAgKiAkc3RhdGUuaXMoJ2NvbnRhY3QuZGV0YWlscy5pdGVtJyk7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pcyhjb250YWN0RGV0YWlsSXRlbVN0YXRlT2JqZWN0KTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICpcbiAgICAgKiAvLyByZWxhdGl2ZSBuYW1lICguIGFuZCBeKSwgdHlwaWNhbGx5IGZyb20gYSB0ZW1wbGF0ZVxuICAgICAqIC8vIEUuZy4gZnJvbSB0aGUgJ2NvbnRhY3RzLmRldGFpbHMnIHRlbXBsYXRlXG4gICAgICogPGRpdiBuZy1jbGFzcz1cIntoaWdobGlnaHRlZDogJHN0YXRlLmlzKCcuaXRlbScpfVwiPkl0ZW08L2Rpdj5cbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gc3RhdGVPck5hbWUgVGhlIHN0YXRlIG5hbWUgKGFic29sdXRlIG9yIHJlbGF0aXZlKSBvciBzdGF0ZSBvYmplY3QgeW91J2QgbGlrZSB0byBjaGVjay5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IHBhcmFtcyBBIHBhcmFtIG9iamVjdCwgZS5nLiBge3NlY3Rpb25JZDogc2VjdGlvbi5pZH1gLCB0aGF0IHlvdSdkIGxpa2VcbiAgICAgKiB0byB0ZXN0IGFnYWluc3QgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdC4gIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgKlxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7c3RyaW5nfG9iamVjdH0gLSAgSWYgYHN0YXRlT3JOYW1lYCBpcyBhIHJlbGF0aXZlIHN0YXRlIG5hbWUgYW5kIGBvcHRpb25zLnJlbGF0aXZlYCBpcyBzZXQsIC5pcyB3aWxsXG4gICAgICogdGVzdCByZWxhdGl2ZSB0byBgb3B0aW9ucy5yZWxhdGl2ZWAgc3RhdGUgKG9yIG5hbWUpLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBpdCBpcyB0aGUgc3RhdGUuXG4gICAgICovXG4gICAgJHN0YXRlLmlzID0gZnVuY3Rpb24gaXMoc3RhdGVPck5hbWUsIHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7IHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnQgfSwgb3B0aW9ucyB8fCB7fSk7XG4gICAgICB2YXIgc3RhdGUgPSBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIG9wdGlvbnMucmVsYXRpdmUpO1xuXG4gICAgICBpZiAoIWlzRGVmaW5lZChzdGF0ZSkpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgICAgaWYgKCRzdGF0ZS4kY3VycmVudCAhPT0gc3RhdGUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICByZXR1cm4gcGFyYW1zID8gZXF1YWxGb3JLZXlzKHN0YXRlLnBhcmFtcy4kJHZhbHVlcyhwYXJhbXMpLCAkc3RhdGVQYXJhbXMpIDogdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNpbmNsdWRlc1xuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBBIG1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlIGlzIGVxdWFsIHRvIG9yIGlzIHRoZSBjaGlsZCBvZiB0aGVcbiAgICAgKiBzdGF0ZSBzdGF0ZU5hbWUuIElmIGFueSBwYXJhbXMgYXJlIHBhc3NlZCB0aGVuIHRoZXkgd2lsbCBiZSB0ZXN0ZWQgZm9yIGEgbWF0Y2ggYXMgd2VsbC5cbiAgICAgKiBOb3QgYWxsIHRoZSBwYXJhbWV0ZXJzIG5lZWQgdG8gYmUgcGFzc2VkLCBqdXN0IHRoZSBvbmVzIHlvdSdkIGxpa2UgdG8gdGVzdCBmb3IgZXF1YWxpdHkuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIFBhcnRpYWwgYW5kIHJlbGF0aXZlIG5hbWVzXG4gICAgICogPHByZT5cbiAgICAgKiAkc3RhdGUuJGN1cnJlbnQubmFtZSA9ICdjb250YWN0cy5kZXRhaWxzLml0ZW0nO1xuICAgICAqXG4gICAgICogLy8gVXNpbmcgcGFydGlhbCBuYW1lc1xuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImNvbnRhY3RzXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCJjb250YWN0cy5kZXRhaWxzXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCJjb250YWN0cy5kZXRhaWxzLml0ZW1cIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImNvbnRhY3RzLmxpc3RcIik7IC8vIHJldHVybnMgZmFsc2VcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCJhYm91dFwiKTsgLy8gcmV0dXJucyBmYWxzZVxuICAgICAqXG4gICAgICogLy8gVXNpbmcgcmVsYXRpdmUgbmFtZXMgKC4gYW5kIF4pLCB0eXBpY2FsbHkgZnJvbSBhIHRlbXBsYXRlXG4gICAgICogLy8gRS5nLiBmcm9tIHRoZSAnY29udGFjdHMuZGV0YWlscycgdGVtcGxhdGVcbiAgICAgKiA8ZGl2IG5nLWNsYXNzPVwie2hpZ2hsaWdodGVkOiAkc3RhdGUuaW5jbHVkZXMoJy5pdGVtJyl9XCI+SXRlbTwvZGl2PlxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQmFzaWMgZ2xvYmJpbmcgcGF0dGVybnNcbiAgICAgKiA8cHJlPlxuICAgICAqICRzdGF0ZS4kY3VycmVudC5uYW1lID0gJ2NvbnRhY3RzLmRldGFpbHMuaXRlbS51cmwnO1xuICAgICAqXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKi5kZXRhaWxzLiouKlwiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKi5kZXRhaWxzLioqXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqKi5pdGVtLioqXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqLmRldGFpbHMuaXRlbS51cmxcIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIiouZGV0YWlscy4qLnVybFwiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKi5kZXRhaWxzLipcIik7IC8vIHJldHVybnMgZmFsc2VcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCJpdGVtLioqXCIpOyAvLyByZXR1cm5zIGZhbHNlXG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVPck5hbWUgQSBwYXJ0aWFsIG5hbWUsIHJlbGF0aXZlIG5hbWUsIG9yIGdsb2IgcGF0dGVyblxuICAgICAqIHRvIGJlIHNlYXJjaGVkIGZvciB3aXRoaW4gdGhlIGN1cnJlbnQgc3RhdGUgbmFtZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IHBhcmFtcyBBIHBhcmFtIG9iamVjdCwgZS5nLiBge3NlY3Rpb25JZDogc2VjdGlvbi5pZH1gLFxuICAgICAqIHRoYXQgeW91J2QgbGlrZSB0byB0ZXN0IGFnYWluc3QgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0aW9ucyBBbiBvcHRpb25zIG9iamVjdC4gIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgKlxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7c3RyaW5nfG9iamVjdD19IC0gIElmIGBzdGF0ZU9yTmFtZWAgaXMgYSByZWxhdGl2ZSBzdGF0ZSByZWZlcmVuY2UgYW5kIGBvcHRpb25zLnJlbGF0aXZlYCBpcyBzZXQsXG4gICAgICogLmluY2x1ZGVzIHdpbGwgdGVzdCByZWxhdGl2ZSB0byBgb3B0aW9ucy5yZWxhdGl2ZWAgc3RhdGUgKG9yIG5hbWUpLlxuICAgICAqXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBpdCBkb2VzIGluY2x1ZGUgdGhlIHN0YXRlXG4gICAgICovXG4gICAgJHN0YXRlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMoc3RhdGVPck5hbWUsIHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7IHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnQgfSwgb3B0aW9ucyB8fCB7fSk7XG4gICAgICBpZiAoaXNTdHJpbmcoc3RhdGVPck5hbWUpICYmIGlzR2xvYihzdGF0ZU9yTmFtZSkpIHtcbiAgICAgICAgaWYgKCFkb2VzU3RhdGVNYXRjaEdsb2Ioc3RhdGVPck5hbWUpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHN0YXRlT3JOYW1lID0gJHN0YXRlLiRjdXJyZW50Lm5hbWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBzdGF0ZSA9IGZpbmRTdGF0ZShzdGF0ZU9yTmFtZSwgb3B0aW9ucy5yZWxhdGl2ZSk7XG4gICAgICBpZiAoIWlzRGVmaW5lZChzdGF0ZSkpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxuICAgICAgaWYgKCFpc0RlZmluZWQoJHN0YXRlLiRjdXJyZW50LmluY2x1ZGVzW3N0YXRlLm5hbWVdKSkgeyByZXR1cm4gZmFsc2U7IH1cbiAgICAgIHJldHVybiBwYXJhbXMgPyBlcXVhbEZvcktleXMoc3RhdGUucGFyYW1zLiQkdmFsdWVzKHBhcmFtcyksICRzdGF0ZVBhcmFtcywgb2JqZWN0S2V5cyhwYXJhbXMpKSA6IHRydWU7XG4gICAgfTtcblxuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNocmVmXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIEEgdXJsIGdlbmVyYXRpb24gbWV0aG9kIHRoYXQgcmV0dXJucyB0aGUgY29tcGlsZWQgdXJsIGZvciB0aGUgZ2l2ZW4gc3RhdGUgcG9wdWxhdGVkIHdpdGggdGhlIGdpdmVuIHBhcmFtcy5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogPHByZT5cbiAgICAgKiBleHBlY3QoJHN0YXRlLmhyZWYoXCJhYm91dC5wZXJzb25cIiwgeyBwZXJzb246IFwiYm9iXCIgfSkpLnRvRXF1YWwoXCIvYWJvdXQvYm9iXCIpO1xuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBzdGF0ZU9yTmFtZSBUaGUgc3RhdGUgbmFtZSBvciBzdGF0ZSBvYmplY3QgeW91J2QgbGlrZSB0byBnZW5lcmF0ZSBhIHVybCBmcm9tLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gcGFyYW1zIEFuIG9iamVjdCBvZiBwYXJhbWV0ZXIgdmFsdWVzIHRvIGZpbGwgdGhlIHN0YXRlJ3MgcmVxdWlyZWQgcGFyYW1ldGVycy5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IG9wdGlvbnMgT3B0aW9ucyBvYmplY3QuIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgKlxuICAgICAqIC0gKipgbG9zc3lgKiogLSB7Ym9vbGVhbj10cnVlfSAtICBJZiB0cnVlLCBhbmQgaWYgdGhlcmUgaXMgbm8gdXJsIGFzc29jaWF0ZWQgd2l0aCB0aGUgc3RhdGUgcHJvdmlkZWQgaW4gdGhlXG4gICAgICogICAgZmlyc3QgcGFyYW1ldGVyLCB0aGVuIHRoZSBjb25zdHJ1Y3RlZCBocmVmIHVybCB3aWxsIGJlIGJ1aWx0IGZyb20gdGhlIGZpcnN0IG5hdmlnYWJsZSBhbmNlc3RvciAoYWthXG4gICAgICogICAgYW5jZXN0b3Igd2l0aCBhIHZhbGlkIHVybCkuXG4gICAgICogLSAqKmBpbmhlcml0YCoqIC0ge2Jvb2xlYW49dHJ1ZX0sIElmIGB0cnVlYCB3aWxsIGluaGVyaXQgdXJsIHBhcmFtZXRlcnMgZnJvbSBjdXJyZW50IHVybC5cbiAgICAgKiAtICoqYHJlbGF0aXZlYCoqIC0ge29iamVjdD0kc3RhdGUuJGN1cnJlbnR9LCBXaGVuIHRyYW5zaXRpb25pbmcgd2l0aCByZWxhdGl2ZSBwYXRoIChlLmcgJ14nKSwgXG4gICAgICogICAgZGVmaW5lcyB3aGljaCBzdGF0ZSB0byBiZSByZWxhdGl2ZSBmcm9tLlxuICAgICAqIC0gKipgYWJzb2x1dGVgKiogLSB7Ym9vbGVhbj1mYWxzZX0sICBJZiB0cnVlIHdpbGwgZ2VuZXJhdGUgYW4gYWJzb2x1dGUgdXJsLCBlLmcuIFwiaHR0cDovL3d3dy5leGFtcGxlLmNvbS9mdWxsdXJsXCIuXG4gICAgICogXG4gICAgICogQHJldHVybnMge3N0cmluZ30gY29tcGlsZWQgc3RhdGUgdXJsXG4gICAgICovXG4gICAgJHN0YXRlLmhyZWYgPSBmdW5jdGlvbiBocmVmKHN0YXRlT3JOYW1lLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoe1xuICAgICAgICBsb3NzeTogICAgdHJ1ZSxcbiAgICAgICAgaW5oZXJpdDogIHRydWUsXG4gICAgICAgIGFic29sdXRlOiBmYWxzZSxcbiAgICAgICAgcmVsYXRpdmU6ICRzdGF0ZS4kY3VycmVudFxuICAgICAgfSwgb3B0aW9ucyB8fCB7fSk7XG5cbiAgICAgIHZhciBzdGF0ZSA9IGZpbmRTdGF0ZShzdGF0ZU9yTmFtZSwgb3B0aW9ucy5yZWxhdGl2ZSk7XG5cbiAgICAgIGlmICghaXNEZWZpbmVkKHN0YXRlKSkgcmV0dXJuIG51bGw7XG4gICAgICBpZiAob3B0aW9ucy5pbmhlcml0KSBwYXJhbXMgPSBpbmhlcml0UGFyYW1zKCRzdGF0ZVBhcmFtcywgcGFyYW1zIHx8IHt9LCAkc3RhdGUuJGN1cnJlbnQsIHN0YXRlKTtcbiAgICAgIFxuICAgICAgdmFyIG5hdiA9IChzdGF0ZSAmJiBvcHRpb25zLmxvc3N5KSA/IHN0YXRlLm5hdmlnYWJsZSA6IHN0YXRlO1xuXG4gICAgICBpZiAoIW5hdiB8fCBuYXYudXJsID09PSB1bmRlZmluZWQgfHwgbmF2LnVybCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAkdXJsUm91dGVyLmhyZWYobmF2LnVybCwgZmlsdGVyQnlLZXlzKHN0YXRlLnBhcmFtcy4kJGtleXMoKS5jb25jYXQoJyMnKSwgcGFyYW1zIHx8IHt9KSwge1xuICAgICAgICBhYnNvbHV0ZTogb3B0aW9ucy5hYnNvbHV0ZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjZ2V0XG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIFJldHVybnMgdGhlIHN0YXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGZvciBhbnkgc3BlY2lmaWMgc3RhdGUgb3IgYWxsIHN0YXRlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdD19IHN0YXRlT3JOYW1lIChhYnNvbHV0ZSBvciByZWxhdGl2ZSkgSWYgcHJvdmlkZWQsIHdpbGwgb25seSBnZXQgdGhlIGNvbmZpZyBmb3JcbiAgICAgKiB0aGUgcmVxdWVzdGVkIHN0YXRlLiBJZiBub3QgcHJvdmlkZWQsIHJldHVybnMgYW4gYXJyYXkgb2YgQUxMIHN0YXRlIGNvbmZpZ3MuXG4gICAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0PX0gY29udGV4dCBXaGVuIHN0YXRlT3JOYW1lIGlzIGEgcmVsYXRpdmUgc3RhdGUgcmVmZXJlbmNlLCB0aGUgc3RhdGUgd2lsbCBiZSByZXRyaWV2ZWQgcmVsYXRpdmUgdG8gY29udGV4dC5cbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fEFycmF5fSBTdGF0ZSBjb25maWd1cmF0aW9uIG9iamVjdCBvciBhcnJheSBvZiBhbGwgb2JqZWN0cy5cbiAgICAgKi9cbiAgICAkc3RhdGUuZ2V0ID0gZnVuY3Rpb24gKHN0YXRlT3JOYW1lLCBjb250ZXh0KSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG1hcChvYmplY3RLZXlzKHN0YXRlcyksIGZ1bmN0aW9uKG5hbWUpIHsgcmV0dXJuIHN0YXRlc1tuYW1lXS5zZWxmOyB9KTtcbiAgICAgIHZhciBzdGF0ZSA9IGZpbmRTdGF0ZShzdGF0ZU9yTmFtZSwgY29udGV4dCB8fCAkc3RhdGUuJGN1cnJlbnQpO1xuICAgICAgcmV0dXJuIChzdGF0ZSAmJiBzdGF0ZS5zZWxmKSA/IHN0YXRlLnNlbGYgOiBudWxsO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlU3RhdGUoc3RhdGUsIHBhcmFtcywgcGFyYW1zQXJlRmlsdGVyZWQsIGluaGVyaXRlZCwgZHN0LCBvcHRpb25zKSB7XG4gICAgICAvLyBNYWtlIGEgcmVzdHJpY3RlZCAkc3RhdGVQYXJhbXMgd2l0aCBvbmx5IHRoZSBwYXJhbWV0ZXJzIHRoYXQgYXBwbHkgdG8gdGhpcyBzdGF0ZSBpZlxuICAgICAgLy8gbmVjZXNzYXJ5LiBJbiBhZGRpdGlvbiB0byBiZWluZyBhdmFpbGFibGUgdG8gdGhlIGNvbnRyb2xsZXIgYW5kIG9uRW50ZXIvb25FeGl0IGNhbGxiYWNrcyxcbiAgICAgIC8vIHdlIGFsc28gbmVlZCAkc3RhdGVQYXJhbXMgdG8gYmUgYXZhaWxhYmxlIGZvciBhbnkgJGluamVjdG9yIGNhbGxzIHdlIG1ha2UgZHVyaW5nIHRoZVxuICAgICAgLy8gZGVwZW5kZW5jeSByZXNvbHV0aW9uIHByb2Nlc3MuXG4gICAgICB2YXIgJHN0YXRlUGFyYW1zID0gKHBhcmFtc0FyZUZpbHRlcmVkKSA/IHBhcmFtcyA6IGZpbHRlckJ5S2V5cyhzdGF0ZS5wYXJhbXMuJCRrZXlzKCksIHBhcmFtcyk7XG4gICAgICB2YXIgbG9jYWxzID0geyAkc3RhdGVQYXJhbXM6ICRzdGF0ZVBhcmFtcyB9O1xuXG4gICAgICAvLyBSZXNvbHZlICdnbG9iYWwnIGRlcGVuZGVuY2llcyBmb3IgdGhlIHN0YXRlLCBpLmUuIHRob3NlIG5vdCBzcGVjaWZpYyB0byBhIHZpZXcuXG4gICAgICAvLyBXZSdyZSBhbHNvIGluY2x1ZGluZyAkc3RhdGVQYXJhbXMgaW4gdGhpczsgdGhhdCB3YXkgdGhlIHBhcmFtZXRlcnMgYXJlIHJlc3RyaWN0ZWRcbiAgICAgIC8vIHRvIHRoZSBzZXQgdGhhdCBzaG91bGQgYmUgdmlzaWJsZSB0byB0aGUgc3RhdGUsIGFuZCBhcmUgaW5kZXBlbmRlbnQgb2Ygd2hlbiB3ZSB1cGRhdGVcbiAgICAgIC8vIHRoZSBnbG9iYWwgJHN0YXRlIGFuZCAkc3RhdGVQYXJhbXMgdmFsdWVzLlxuICAgICAgZHN0LnJlc29sdmUgPSAkcmVzb2x2ZS5yZXNvbHZlKHN0YXRlLnJlc29sdmUsIGxvY2FscywgZHN0LnJlc29sdmUsIHN0YXRlKTtcbiAgICAgIHZhciBwcm9taXNlcyA9IFtkc3QucmVzb2x2ZS50aGVuKGZ1bmN0aW9uIChnbG9iYWxzKSB7XG4gICAgICAgIGRzdC5nbG9iYWxzID0gZ2xvYmFscztcbiAgICAgIH0pXTtcbiAgICAgIGlmIChpbmhlcml0ZWQpIHByb21pc2VzLnB1c2goaW5oZXJpdGVkKTtcblxuICAgICAgZnVuY3Rpb24gcmVzb2x2ZVZpZXdzKCkge1xuICAgICAgICB2YXIgdmlld3NQcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIC8vIFJlc29sdmUgdGVtcGxhdGUgYW5kIGRlcGVuZGVuY2llcyBmb3IgYWxsIHZpZXdzLlxuICAgICAgICBmb3JFYWNoKHN0YXRlLnZpZXdzLCBmdW5jdGlvbiAodmlldywgbmFtZSkge1xuICAgICAgICAgIHZhciBpbmplY3RhYmxlcyA9ICh2aWV3LnJlc29sdmUgJiYgdmlldy5yZXNvbHZlICE9PSBzdGF0ZS5yZXNvbHZlID8gdmlldy5yZXNvbHZlIDoge30pO1xuICAgICAgICAgIGluamVjdGFibGVzLiR0ZW1wbGF0ZSA9IFsgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICR2aWV3LmxvYWQobmFtZSwgeyB2aWV3OiB2aWV3LCBsb2NhbHM6IGRzdC5nbG9iYWxzLCBwYXJhbXM6ICRzdGF0ZVBhcmFtcywgbm90aWZ5OiBvcHRpb25zLm5vdGlmeSB9KSB8fCAnJztcbiAgICAgICAgICB9XTtcblxuICAgICAgICAgIHZpZXdzUHJvbWlzZXMucHVzaCgkcmVzb2x2ZS5yZXNvbHZlKGluamVjdGFibGVzLCBkc3QuZ2xvYmFscywgZHN0LnJlc29sdmUsIHN0YXRlKS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgIC8vIFJlZmVyZW5jZXMgdG8gdGhlIGNvbnRyb2xsZXIgKG9ubHkgaW5zdGFudGlhdGVkIGF0IGxpbmsgdGltZSlcbiAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKHZpZXcuY29udHJvbGxlclByb3ZpZGVyKSB8fCBpc0FycmF5KHZpZXcuY29udHJvbGxlclByb3ZpZGVyKSkge1xuICAgICAgICAgICAgICB2YXIgaW5qZWN0TG9jYWxzID0gYW5ndWxhci5leHRlbmQoe30sIGluamVjdGFibGVzLCBkc3QuZ2xvYmFscyk7XG4gICAgICAgICAgICAgIHJlc3VsdC4kJGNvbnRyb2xsZXIgPSAkaW5qZWN0b3IuaW52b2tlKHZpZXcuY29udHJvbGxlclByb3ZpZGVyLCBudWxsLCBpbmplY3RMb2NhbHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzdWx0LiQkY29udHJvbGxlciA9IHZpZXcuY29udHJvbGxlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFByb3ZpZGUgYWNjZXNzIHRvIHRoZSBzdGF0ZSBpdHNlbGYgZm9yIGludGVybmFsIHVzZVxuICAgICAgICAgICAgcmVzdWx0LiQkc3RhdGUgPSBzdGF0ZTtcbiAgICAgICAgICAgIHJlc3VsdC4kJGNvbnRyb2xsZXJBcyA9IHZpZXcuY29udHJvbGxlckFzO1xuICAgICAgICAgICAgcmVzdWx0LiQkcmVzb2x2ZUFzID0gdmlldy5yZXNvbHZlQXM7XG4gICAgICAgICAgICBkc3RbbmFtZV0gPSByZXN1bHQ7XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gJHEuYWxsKHZpZXdzUHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICByZXR1cm4gZHN0Lmdsb2JhbHM7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBXYWl0IGZvciBhbGwgdGhlIHByb21pc2VzIGFuZCB0aGVuIHJldHVybiB0aGUgYWN0aXZhdGlvbiBvYmplY3RcbiAgICAgIHJldHVybiAkcS5hbGwocHJvbWlzZXMpLnRoZW4ocmVzb2x2ZVZpZXdzKS50aGVuKGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiAkc3RhdGU7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRTa2lwUmVsb2FkKHRvLCB0b1BhcmFtcywgZnJvbSwgZnJvbVBhcmFtcywgbG9jYWxzLCBvcHRpb25zKSB7XG4gICAgLy8gUmV0dXJuIHRydWUgaWYgdGhlcmUgYXJlIG5vIGRpZmZlcmVuY2VzIGluIG5vbi1zZWFyY2ggKHBhdGgvb2JqZWN0KSBwYXJhbXMsIGZhbHNlIGlmIHRoZXJlIGFyZSBkaWZmZXJlbmNlc1xuICAgIGZ1bmN0aW9uIG5vblNlYXJjaFBhcmFtc0VxdWFsKGZyb21BbmRUb1N0YXRlLCBmcm9tUGFyYW1zLCB0b1BhcmFtcykge1xuICAgICAgLy8gSWRlbnRpZnkgd2hldGhlciBhbGwgdGhlIHBhcmFtZXRlcnMgdGhhdCBkaWZmZXIgYmV0d2VlbiBgZnJvbVBhcmFtc2AgYW5kIGB0b1BhcmFtc2Agd2VyZSBzZWFyY2ggcGFyYW1zLlxuICAgICAgZnVuY3Rpb24gbm90U2VhcmNoUGFyYW0oa2V5KSB7XG4gICAgICAgIHJldHVybiBmcm9tQW5kVG9TdGF0ZS5wYXJhbXNba2V5XS5sb2NhdGlvbiAhPSBcInNlYXJjaFwiO1xuICAgICAgfVxuICAgICAgdmFyIG5vblF1ZXJ5UGFyYW1LZXlzID0gZnJvbUFuZFRvU3RhdGUucGFyYW1zLiQka2V5cygpLmZpbHRlcihub3RTZWFyY2hQYXJhbSk7XG4gICAgICB2YXIgbm9uUXVlcnlQYXJhbXMgPSBwaWNrLmFwcGx5KHt9LCBbZnJvbUFuZFRvU3RhdGUucGFyYW1zXS5jb25jYXQobm9uUXVlcnlQYXJhbUtleXMpKTtcbiAgICAgIHZhciBub25RdWVyeVBhcmFtU2V0ID0gbmV3ICQkVU1GUC5QYXJhbVNldChub25RdWVyeVBhcmFtcyk7XG4gICAgICByZXR1cm4gbm9uUXVlcnlQYXJhbVNldC4kJGVxdWFscyhmcm9tUGFyYW1zLCB0b1BhcmFtcyk7XG4gICAgfVxuXG4gICAgLy8gSWYgcmVsb2FkIHdhcyBub3QgZXhwbGljaXRseSByZXF1ZXN0ZWRcbiAgICAvLyBhbmQgd2UncmUgdHJhbnNpdGlvbmluZyB0byB0aGUgc2FtZSBzdGF0ZSB3ZSdyZSBhbHJlYWR5IGluXG4gICAgLy8gYW5kICAgIHRoZSBsb2NhbHMgZGlkbid0IGNoYW5nZVxuICAgIC8vICAgICBvciB0aGV5IGNoYW5nZWQgaW4gYSB3YXkgdGhhdCBkb2Vzbid0IG1lcml0IHJlbG9hZGluZ1xuICAgIC8vICAgICAgICAocmVsb2FkT25QYXJhbXM6ZmFsc2UsIG9yIHJlbG9hZE9uU2VhcmNoLmZhbHNlIGFuZCBvbmx5IHNlYXJjaCBwYXJhbXMgY2hhbmdlZClcbiAgICAvLyBUaGVuIHJldHVybiB0cnVlLlxuICAgIGlmICghb3B0aW9ucy5yZWxvYWQgJiYgdG8gPT09IGZyb20gJiZcbiAgICAgIChsb2NhbHMgPT09IGZyb20ubG9jYWxzIHx8ICh0by5zZWxmLnJlbG9hZE9uU2VhcmNoID09PSBmYWxzZSAmJiBub25TZWFyY2hQYXJhbXNFcXVhbChmcm9tLCBmcm9tUGFyYW1zLCB0b1BhcmFtcykpKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKVxuICAuZmFjdG9yeSgnJHN0YXRlUGFyYW1zJywgZnVuY3Rpb24gKCkgeyByZXR1cm4ge307IH0pXG4gIC5jb25zdGFudChcIiRzdGF0ZS5ydW50aW1lXCIsIHsgYXV0b2luamVjdDogdHJ1ZSB9KVxuICAucHJvdmlkZXIoJyRzdGF0ZScsICRTdGF0ZVByb3ZpZGVyKVxuICAvLyBJbmplY3QgJHN0YXRlIHRvIGluaXRpYWxpemUgd2hlbiBlbnRlcmluZyBydW50aW1lLiAjMjU3NFxuICAucnVuKFsnJGluamVjdG9yJywgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgIC8vIEFsbG93IHRlc3RzIChzdGF0ZVNwZWMuanMpIHRvIHR1cm4gdGhpcyBvZmYgYnkgZGVmaW5pbmcgdGhpcyBjb25zdGFudFxuICAgIGlmICgkaW5qZWN0b3IuZ2V0KFwiJHN0YXRlLnJ1bnRpbWVcIikuYXV0b2luamVjdCkge1xuICAgICAgJGluamVjdG9yLmdldCgnJHN0YXRlJyk7XG4gICAgfVxuICB9XSk7XG5cblxuJFZpZXdQcm92aWRlci4kaW5qZWN0ID0gW107XG5mdW5jdGlvbiAkVmlld1Byb3ZpZGVyKCkge1xuXG4gIHRoaXMuJGdldCA9ICRnZXQ7XG4gIC8qKlxuICAgKiBAbmdkb2Mgb2JqZWN0XG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdmlld1xuICAgKlxuICAgKiBAcmVxdWlyZXMgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeVxuICAgKiBAcmVxdWlyZXMgJHJvb3RTY29wZVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICpcbiAgICovXG4gICRnZXQuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckdGVtcGxhdGVGYWN0b3J5J107XG4gIGZ1bmN0aW9uICRnZXQoICAgJHJvb3RTY29wZSwgICAkdGVtcGxhdGVGYWN0b3J5KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC8vICR2aWV3LmxvYWQoJ2Z1bGwudmlld05hbWUnLCB7IHRlbXBsYXRlOiAuLi4sIGNvbnRyb2xsZXI6IC4uLiwgcmVzb2x2ZTogLi4uLCBhc3luYzogZmFsc2UsIHBhcmFtczogLi4uIH0pXG4gICAgICAvKipcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiR2aWV3I2xvYWRcbiAgICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHZpZXdcbiAgICAgICAqXG4gICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lXG4gICAgICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBvcHRpb24gb2JqZWN0LlxuICAgICAgICovXG4gICAgICBsb2FkOiBmdW5jdGlvbiBsb2FkKG5hbWUsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCwgZGVmYXVsdHMgPSB7XG4gICAgICAgICAgdGVtcGxhdGU6IG51bGwsIGNvbnRyb2xsZXI6IG51bGwsIHZpZXc6IG51bGwsIGxvY2FsczogbnVsbCwgbm90aWZ5OiB0cnVlLCBhc3luYzogdHJ1ZSwgcGFyYW1zOiB7fVxuICAgICAgICB9O1xuICAgICAgICBvcHRpb25zID0gZXh0ZW5kKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAob3B0aW9ucy52aWV3KSB7XG4gICAgICAgICAgcmVzdWx0ID0gJHRlbXBsYXRlRmFjdG9yeS5mcm9tQ29uZmlnKG9wdGlvbnMudmlldywgb3B0aW9ucy5wYXJhbXMsIG9wdGlvbnMubG9jYWxzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScpLnByb3ZpZGVyKCckdmlldycsICRWaWV3UHJvdmlkZXIpO1xuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsUHJvdmlkZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFByb3ZpZGVyIHRoYXQgcmV0dXJucyB0aGUge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsfSBzZXJ2aWNlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiAkVmlld1Njcm9sbFByb3ZpZGVyKCkge1xuXG4gIHZhciB1c2VBbmNob3JTY3JvbGwgPSBmYWxzZTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsUHJvdmlkZXIjdXNlQW5jaG9yU2Nyb2xsXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZXZlcnRzIGJhY2sgdG8gdXNpbmcgdGhlIGNvcmUgW2AkYW5jaG9yU2Nyb2xsYF0oaHR0cDovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcuJGFuY2hvclNjcm9sbCkgc2VydmljZSBmb3JcbiAgICogc2Nyb2xsaW5nIGJhc2VkIG9uIHRoZSB1cmwgYW5jaG9yLlxuICAgKi9cbiAgdGhpcy51c2VBbmNob3JTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdXNlQW5jaG9yU2Nyb2xsID0gdHJ1ZTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIG9iamVjdFxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFxuICAgKlxuICAgKiBAcmVxdWlyZXMgJGFuY2hvclNjcm9sbFxuICAgKiBAcmVxdWlyZXMgJHRpbWVvdXRcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFdoZW4gY2FsbGVkIHdpdGggYSBqcUxpdGUgZWxlbWVudCwgaXQgc2Nyb2xscyB0aGUgZWxlbWVudCBpbnRvIHZpZXcgKGFmdGVyIGFcbiAgICogYCR0aW1lb3V0YCBzbyB0aGUgRE9NIGhhcyB0aW1lIHRvIHJlZnJlc2gpLlxuICAgKlxuICAgKiBJZiB5b3UgcHJlZmVyIHRvIHJlbHkgb24gYCRhbmNob3JTY3JvbGxgIHRvIHNjcm9sbCB0aGUgdmlldyB0byB0aGUgYW5jaG9yLFxuICAgKiB0aGlzIGNhbiBiZSBlbmFibGVkIGJ5IGNhbGxpbmcge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsUHJvdmlkZXIjbWV0aG9kc191c2VBbmNob3JTY3JvbGwgYCR1aVZpZXdTY3JvbGxQcm92aWRlci51c2VBbmNob3JTY3JvbGwoKWB9LlxuICAgKi9cbiAgdGhpcy4kZ2V0ID0gWyckYW5jaG9yU2Nyb2xsJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCRhbmNob3JTY3JvbGwsICR0aW1lb3V0KSB7XG4gICAgaWYgKHVzZUFuY2hvclNjcm9sbCkge1xuICAgICAgcmV0dXJuICRhbmNob3JTY3JvbGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgkZWxlbWVudCkge1xuICAgICAgcmV0dXJuICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJGVsZW1lbnRbMF0uc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICAgIH0sIDAsIGZhbHNlKTtcbiAgICB9O1xuICB9XTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScpLnByb3ZpZGVyKCckdWlWaWV3U2Nyb2xsJywgJFZpZXdTY3JvbGxQcm92aWRlcik7XG5cbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS12aWV3XG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAqIEByZXF1aXJlcyAkY29tcGlsZVxuICogQHJlcXVpcmVzICRjb250cm9sbGVyXG4gKiBAcmVxdWlyZXMgJGluamVjdG9yXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGxcbiAqIEByZXF1aXJlcyAkZG9jdW1lbnRcbiAqXG4gKiBAcmVzdHJpY3QgRUNBXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgdWktdmlldyBkaXJlY3RpdmUgdGVsbHMgJHN0YXRlIHdoZXJlIHRvIHBsYWNlIHlvdXIgdGVtcGxhdGVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nPX0gbmFtZSBBIHZpZXcgbmFtZS4gVGhlIG5hbWUgc2hvdWxkIGJlIHVuaXF1ZSBhbW9uZ3N0IHRoZSBvdGhlciB2aWV3cyBpbiB0aGVcbiAqIHNhbWUgc3RhdGUuIFlvdSBjYW4gaGF2ZSB2aWV3cyBvZiB0aGUgc2FtZSBuYW1lIHRoYXQgbGl2ZSBpbiBkaWZmZXJlbnQgc3RhdGVzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nPX0gYXV0b3Njcm9sbCBJdCBhbGxvd3MgeW91IHRvIHNldCB0aGUgc2Nyb2xsIGJlaGF2aW9yIG9mIHRoZSBicm93c2VyIHdpbmRvd1xuICogd2hlbiBhIHZpZXcgaXMgcG9wdWxhdGVkLiBCeSBkZWZhdWx0LCAkYW5jaG9yU2Nyb2xsIGlzIG92ZXJyaWRkZW4gYnkgdWktcm91dGVyJ3MgY3VzdG9tIHNjcm9sbFxuICogc2VydmljZSwge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsfS4gVGhpcyBjdXN0b20gc2VydmljZSBsZXQncyB5b3VcbiAqIHNjcm9sbCB1aS12aWV3IGVsZW1lbnRzIGludG8gdmlldyB3aGVuIHRoZXkgYXJlIHBvcHVsYXRlZCBkdXJpbmcgYSBzdGF0ZSBhY3RpdmF0aW9uLlxuICpcbiAqICpOb3RlOiBUbyByZXZlcnQgYmFjayB0byBvbGQgW2AkYW5jaG9yU2Nyb2xsYF0oaHR0cDovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcuJGFuY2hvclNjcm9sbClcbiAqIGZ1bmN0aW9uYWxpdHksIGNhbGwgYCR1aVZpZXdTY3JvbGxQcm92aWRlci51c2VBbmNob3JTY3JvbGwoKWAuKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb25sb2FkIEV4cHJlc3Npb24gdG8gZXZhbHVhdGUgd2hlbmV2ZXIgdGhlIHZpZXcgdXBkYXRlcy5cbiAqXG4gKiBAZXhhbXBsZVxuICogQSB2aWV3IGNhbiBiZSB1bm5hbWVkIG9yIG5hbWVkLlxuICogPHByZT5cbiAqIDwhLS0gVW5uYW1lZCAtLT5cbiAqIDxkaXYgdWktdmlldz48L2Rpdj5cbiAqXG4gKiA8IS0tIE5hbWVkIC0tPlxuICogPGRpdiB1aS12aWV3PVwidmlld05hbWVcIj48L2Rpdj5cbiAqIDwvcHJlPlxuICpcbiAqIFlvdSBjYW4gb25seSBoYXZlIG9uZSB1bm5hbWVkIHZpZXcgd2l0aGluIGFueSB0ZW1wbGF0ZSAob3Igcm9vdCBodG1sKS4gSWYgeW91IGFyZSBvbmx5IHVzaW5nIGFcbiAqIHNpbmdsZSB2aWV3IGFuZCBpdCBpcyB1bm5hbWVkIHRoZW4geW91IGNhbiBwb3B1bGF0ZSBpdCBsaWtlIHNvOlxuICogPHByZT5cbiAqIDxkaXYgdWktdmlldz48L2Rpdj5cbiAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZVwiLCB7XG4gKiAgIHRlbXBsYXRlOiBcIjxoMT5IRUxMTyE8L2gxPlwiXG4gKiB9KVxuICogPC9wcmU+XG4gKlxuICogVGhlIGFib3ZlIGlzIGEgY29udmVuaWVudCBzaG9ydGN1dCBlcXVpdmFsZW50IHRvIHNwZWNpZnlpbmcgeW91ciB2aWV3IGV4cGxpY2l0bHkgd2l0aCB0aGUge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQcm92aWRlciNtZXRob2RzX3N0YXRlIGB2aWV3c2B9XG4gKiBjb25maWcgcHJvcGVydHksIGJ5IG5hbWUsIGluIHRoaXMgY2FzZSBhbiBlbXB0eSBuYW1lOlxuICogPHByZT5cbiAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZVwiLCB7XG4gKiAgIHZpZXdzOiB7XG4gKiAgICAgXCJcIjoge1xuICogICAgICAgdGVtcGxhdGU6IFwiPGgxPkhFTExPITwvaDE+XCJcbiAqICAgICB9XG4gKiAgIH0gICAgXG4gKiB9KVxuICogPC9wcmU+XG4gKlxuICogQnV0IHR5cGljYWxseSB5b3UnbGwgb25seSB1c2UgdGhlIHZpZXdzIHByb3BlcnR5IGlmIHlvdSBuYW1lIHlvdXIgdmlldyBvciBoYXZlIG1vcmUgdGhhbiBvbmUgdmlld1xuICogaW4gdGhlIHNhbWUgdGVtcGxhdGUuIFRoZXJlJ3Mgbm90IHJlYWxseSBhIGNvbXBlbGxpbmcgcmVhc29uIHRvIG5hbWUgYSB2aWV3IGlmIGl0cyB0aGUgb25seSBvbmUsXG4gKiBidXQgeW91IGNvdWxkIGlmIHlvdSB3YW50ZWQsIGxpa2Ugc286XG4gKiA8cHJlPlxuICogPGRpdiB1aS12aWV3PVwibWFpblwiPjwvZGl2PlxuICogPC9wcmU+XG4gKiA8cHJlPlxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcbiAqICAgdmlld3M6IHtcbiAqICAgICBcIm1haW5cIjoge1xuICogICAgICAgdGVtcGxhdGU6IFwiPGgxPkhFTExPITwvaDE+XCJcbiAqICAgICB9XG4gKiAgIH0gICAgXG4gKiB9KVxuICogPC9wcmU+XG4gKlxuICogUmVhbGx5IHRob3VnaCwgeW91J2xsIHVzZSB2aWV3cyB0byBzZXQgdXAgbXVsdGlwbGUgdmlld3M6XG4gKiA8cHJlPlxuICogPGRpdiB1aS12aWV3PjwvZGl2PlxuICogPGRpdiB1aS12aWV3PVwiY2hhcnRcIj48L2Rpdj5cbiAqIDxkaXYgdWktdmlldz1cImRhdGFcIj48L2Rpdj5cbiAqIDwvcHJlPlxuICpcbiAqIDxwcmU+XG4gKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge1xuICogICB2aWV3czoge1xuICogICAgIFwiXCI6IHtcbiAqICAgICAgIHRlbXBsYXRlOiBcIjxoMT5IRUxMTyE8L2gxPlwiXG4gKiAgICAgfSxcbiAqICAgICBcImNoYXJ0XCI6IHtcbiAqICAgICAgIHRlbXBsYXRlOiBcIjxjaGFydF90aGluZy8+XCJcbiAqICAgICB9LFxuICogICAgIFwiZGF0YVwiOiB7XG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8ZGF0YV90aGluZy8+XCJcbiAqICAgICB9XG4gKiAgIH0gICAgXG4gKiB9KVxuICogPC9wcmU+XG4gKlxuICogRXhhbXBsZXMgZm9yIGBhdXRvc2Nyb2xsYDpcbiAqXG4gKiA8cHJlPlxuICogPCEtLSBJZiBhdXRvc2Nyb2xsIHByZXNlbnQgd2l0aCBubyBleHByZXNzaW9uLFxuICogICAgICB0aGVuIHNjcm9sbCB1aS12aWV3IGludG8gdmlldyAtLT5cbiAqIDx1aS12aWV3IGF1dG9zY3JvbGwvPlxuICpcbiAqIDwhLS0gSWYgYXV0b3Njcm9sbCBwcmVzZW50IHdpdGggdmFsaWQgZXhwcmVzc2lvbixcbiAqICAgICAgdGhlbiBzY3JvbGwgdWktdmlldyBpbnRvIHZpZXcgaWYgZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gdHJ1ZSAtLT5cbiAqIDx1aS12aWV3IGF1dG9zY3JvbGw9J3RydWUnLz5cbiAqIDx1aS12aWV3IGF1dG9zY3JvbGw9J2ZhbHNlJy8+XG4gKiA8dWktdmlldyBhdXRvc2Nyb2xsPSdzY29wZVZhcmlhYmxlJy8+XG4gKiA8L3ByZT5cbiAqXG4gKiBSZXNvbHZlIGRhdGE6XG4gKlxuICogVGhlIHJlc29sdmVkIGRhdGEgZnJvbSB0aGUgc3RhdGUncyBgcmVzb2x2ZWAgYmxvY2sgaXMgcGxhY2VkIG9uIHRoZSBzY29wZSBhcyBgJHJlc29sdmVgICh0aGlzXG4gKiBjYW4gYmUgY3VzdG9taXplZCB1c2luZyBbW1ZpZXdEZWNsYXJhdGlvbi5yZXNvbHZlQXNdXSkuICBUaGlzIGNhbiBiZSB0aGVuIGFjY2Vzc2VkIGZyb20gdGhlIHRlbXBsYXRlLlxuICpcbiAqIE5vdGUgdGhhdCB3aGVuIGBjb250cm9sbGVyQXNgIGlzIGJlaW5nIHVzZWQsIGAkcmVzb2x2ZWAgaXMgc2V0IG9uIHRoZSBjb250cm9sbGVyIGluc3RhbmNlICphZnRlciogdGhlXG4gKiBjb250cm9sbGVyIGlzIGluc3RhbnRpYXRlZC4gIFRoZSBgJG9uSW5pdCgpYCBob29rIGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gaW5pdGlhbGl6YXRpb24gY29kZSB3aGljaFxuICogZGVwZW5kcyBvbiBgJHJlc29sdmVgIGRhdGEuXG4gKlxuICogRXhhbXBsZSB1c2FnZSBvZiAkcmVzb2x2ZSBpbiBhIHZpZXcgdGVtcGxhdGVcbiAqIDxwcmU+XG4gKiAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAqICAgdGVtcGxhdGU6ICc8bXktY29tcG9uZW50IHVzZXI9XCIkcmVzb2x2ZS51c2VyXCI+PC9teS1jb21wb25lbnQ+JyxcbiAqICAgcmVzb2x2ZToge1xuICogICAgIHVzZXI6IGZ1bmN0aW9uKFVzZXJTZXJ2aWNlKSB7IHJldHVybiBVc2VyU2VydmljZS5mZXRjaFVzZXIoKTsgfVxuICogICB9XG4gKiB9KTtcbiAqIDwvcHJlPlxuICovXG4kVmlld0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc3RhdGUnLCAnJGluamVjdG9yJywgJyR1aVZpZXdTY3JvbGwnLCAnJGludGVycG9sYXRlJywgJyRxJ107XG5mdW5jdGlvbiAkVmlld0RpcmVjdGl2ZSggICAkc3RhdGUsICAgJGluamVjdG9yLCAgICR1aVZpZXdTY3JvbGwsICAgJGludGVycG9sYXRlLCAgICRxKSB7XG5cbiAgZnVuY3Rpb24gZ2V0U2VydmljZSgpIHtcbiAgICByZXR1cm4gKCRpbmplY3Rvci5oYXMpID8gZnVuY3Rpb24oc2VydmljZSkge1xuICAgICAgcmV0dXJuICRpbmplY3Rvci5oYXMoc2VydmljZSkgPyAkaW5qZWN0b3IuZ2V0KHNlcnZpY2UpIDogbnVsbDtcbiAgICB9IDogZnVuY3Rpb24oc2VydmljZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoc2VydmljZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICB2YXIgc2VydmljZSA9IGdldFNlcnZpY2UoKSxcbiAgICAgICRhbmltYXRvciA9IHNlcnZpY2UoJyRhbmltYXRvcicpLFxuICAgICAgJGFuaW1hdGUgPSBzZXJ2aWNlKCckYW5pbWF0ZScpO1xuXG4gIC8vIFJldHVybnMgYSBzZXQgb2YgRE9NIG1hbmlwdWxhdGlvbiBmdW5jdGlvbnMgYmFzZWQgb24gd2hpY2ggQW5ndWxhciB2ZXJzaW9uXG4gIC8vIGl0IHNob3VsZCB1c2VcbiAgZnVuY3Rpb24gZ2V0UmVuZGVyZXIoYXR0cnMsIHNjb3BlKSB7XG4gICAgdmFyIHN0YXRpY3MgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVudGVyOiBmdW5jdGlvbiAoZWxlbWVudCwgdGFyZ2V0LCBjYikgeyB0YXJnZXQuYWZ0ZXIoZWxlbWVudCk7IGNiKCk7IH0sXG4gICAgICAgIGxlYXZlOiBmdW5jdGlvbiAoZWxlbWVudCwgY2IpIHsgZWxlbWVudC5yZW1vdmUoKTsgY2IoKTsgfVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgaWYgKCRhbmltYXRlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbnRlcjogZnVuY3Rpb24oZWxlbWVudCwgdGFyZ2V0LCBjYikge1xuICAgICAgICAgIGlmIChhbmd1bGFyLnZlcnNpb24ubWlub3IgPiAyKSB7XG4gICAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihlbGVtZW50LCBudWxsLCB0YXJnZXQpLnRoZW4oY2IpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihlbGVtZW50LCBudWxsLCB0YXJnZXQsIGNiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxlYXZlOiBmdW5jdGlvbihlbGVtZW50LCBjYikge1xuICAgICAgICAgIGlmIChhbmd1bGFyLnZlcnNpb24ubWlub3IgPiAyKSB7XG4gICAgICAgICAgICAkYW5pbWF0ZS5sZWF2ZShlbGVtZW50KS50aGVuKGNiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGFuaW1hdGUubGVhdmUoZWxlbWVudCwgY2IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoJGFuaW1hdG9yKSB7XG4gICAgICB2YXIgYW5pbWF0ZSA9ICRhbmltYXRvciAmJiAkYW5pbWF0b3Ioc2NvcGUsIGF0dHJzKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIHRhcmdldCwgY2IpIHthbmltYXRlLmVudGVyKGVsZW1lbnQsIG51bGwsIHRhcmdldCk7IGNiKCk7IH0sXG4gICAgICAgIGxlYXZlOiBmdW5jdGlvbihlbGVtZW50LCBjYikgeyBhbmltYXRlLmxlYXZlKGVsZW1lbnQpOyBjYigpOyB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBzdGF0aWNzKCk7XG4gIH1cblxuICB2YXIgZGlyZWN0aXZlID0ge1xuICAgIHJlc3RyaWN0OiAnRUNBJyxcbiAgICB0ZXJtaW5hbDogdHJ1ZSxcbiAgICBwcmlvcml0eTogNDAwLFxuICAgIHRyYW5zY2x1ZGU6ICdlbGVtZW50JyxcbiAgICBjb21waWxlOiBmdW5jdGlvbiAodEVsZW1lbnQsIHRBdHRycywgJHRyYW5zY2x1ZGUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoc2NvcGUsICRlbGVtZW50LCBhdHRycykge1xuICAgICAgICB2YXIgcHJldmlvdXNFbCwgY3VycmVudEVsLCBjdXJyZW50U2NvcGUsIGxhdGVzdExvY2FscyxcbiAgICAgICAgICAgIG9ubG9hZEV4cCAgICAgPSBhdHRycy5vbmxvYWQgfHwgJycsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRXhwID0gYXR0cnMuYXV0b3Njcm9sbCxcbiAgICAgICAgICAgIHJlbmRlcmVyICAgICAgPSBnZXRSZW5kZXJlcihhdHRycywgc2NvcGUpLFxuICAgICAgICAgICAgaW5oZXJpdGVkICAgICA9ICRlbGVtZW50LmluaGVyaXRlZERhdGEoJyR1aVZpZXcnKTtcblxuICAgICAgICBzY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICB1cGRhdGVWaWV3KGZhbHNlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdXBkYXRlVmlldyh0cnVlKTtcblxuICAgICAgICBmdW5jdGlvbiBjbGVhbnVwTGFzdFZpZXcoKSB7XG4gICAgICAgICAgaWYgKHByZXZpb3VzRWwpIHtcbiAgICAgICAgICAgIHByZXZpb3VzRWwucmVtb3ZlKCk7XG4gICAgICAgICAgICBwcmV2aW91c0VsID0gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY3VycmVudFNjb3BlKSB7XG4gICAgICAgICAgICBjdXJyZW50U2NvcGUuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZSA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGN1cnJlbnRFbCkge1xuICAgICAgICAgICAgdmFyICR1aVZpZXdEYXRhID0gY3VycmVudEVsLmRhdGEoJyR1aVZpZXdBbmltJyk7XG4gICAgICAgICAgICByZW5kZXJlci5sZWF2ZShjdXJyZW50RWwsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkdWlWaWV3RGF0YS4kJGFuaW1MZWF2ZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgIHByZXZpb3VzRWwgPSBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHByZXZpb3VzRWwgPSBjdXJyZW50RWw7XG4gICAgICAgICAgICBjdXJyZW50RWwgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVZpZXcoZmlyc3RUaW1lKSB7XG4gICAgICAgICAgdmFyIG5ld1Njb3BlLFxuICAgICAgICAgICAgICBuYW1lICAgICAgICAgICAgPSBnZXRVaVZpZXdOYW1lKHNjb3BlLCBhdHRycywgJGVsZW1lbnQsICRpbnRlcnBvbGF0ZSksXG4gICAgICAgICAgICAgIHByZXZpb3VzTG9jYWxzICA9IG5hbWUgJiYgJHN0YXRlLiRjdXJyZW50ICYmICRzdGF0ZS4kY3VycmVudC5sb2NhbHNbbmFtZV07XG5cbiAgICAgICAgICBpZiAoIWZpcnN0VGltZSAmJiBwcmV2aW91c0xvY2FscyA9PT0gbGF0ZXN0TG9jYWxzKSByZXR1cm47IC8vIG5vdGhpbmcgdG8gZG9cbiAgICAgICAgICBuZXdTY29wZSA9IHNjb3BlLiRuZXcoKTtcbiAgICAgICAgICBsYXRlc3RMb2NhbHMgPSAkc3RhdGUuJGN1cnJlbnQubG9jYWxzW25hbWVdO1xuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQG5nZG9jIGV2ZW50XG4gICAgICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS12aWV3IyR2aWV3Q29udGVudExvYWRpbmdcbiAgICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXZpZXdcbiAgICAgICAgICAgKiBAZXZlbnRUeXBlIGVtaXRzIG9uIHVpLXZpZXcgZGlyZWN0aXZlIHNjb3BlXG4gICAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBGaXJlZCBvbmNlIHRoZSB2aWV3ICoqYmVnaW5zIGxvYWRpbmcqKiwgKmJlZm9yZSogdGhlIERPTSBpcyByZW5kZXJlZC5cbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXG4gICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHZpZXdOYW1lIE5hbWUgb2YgdGhlIHZpZXcuXG4gICAgICAgICAgICovXG4gICAgICAgICAgbmV3U2NvcGUuJGVtaXQoJyR2aWV3Q29udGVudExvYWRpbmcnLCBuYW1lKTtcblxuICAgICAgICAgIHZhciBjbG9uZSA9ICR0cmFuc2NsdWRlKG5ld1Njb3BlLCBmdW5jdGlvbihjbG9uZSkge1xuICAgICAgICAgICAgdmFyIGFuaW1FbnRlciA9ICRxLmRlZmVyKCksIGFuaW1MZWF2ZSA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgICB2YXIgdmlld0FuaW1EYXRhID0ge1xuICAgICAgICAgICAgICAkYW5pbUVudGVyOiBhbmltRW50ZXIucHJvbWlzZSxcbiAgICAgICAgICAgICAgJGFuaW1MZWF2ZTogYW5pbUxlYXZlLnByb21pc2UsXG4gICAgICAgICAgICAgICQkYW5pbUxlYXZlOiBhbmltTGVhdmVcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNsb25lLmRhdGEoJyR1aVZpZXdBbmltJywgdmlld0FuaW1EYXRhKTtcbiAgICAgICAgICAgIHJlbmRlcmVyLmVudGVyKGNsb25lLCAkZWxlbWVudCwgZnVuY3Rpb24gb25VaVZpZXdFbnRlcigpIHtcbiAgICAgICAgICAgICAgYW5pbUVudGVyLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgaWYoY3VycmVudFNjb3BlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFNjb3BlLiRlbWl0KCckdmlld0NvbnRlbnRBbmltYXRpb25FbmRlZCcpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKGF1dG9TY3JvbGxFeHApICYmICFhdXRvU2Nyb2xsRXhwIHx8IHNjb3BlLiRldmFsKGF1dG9TY3JvbGxFeHApKSB7XG4gICAgICAgICAgICAgICAgJHVpVmlld1Njcm9sbChjbG9uZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2xlYW51cExhc3RWaWV3KCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjdXJyZW50RWwgPSBjbG9uZTtcbiAgICAgICAgICBjdXJyZW50U2NvcGUgPSBuZXdTY29wZTtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBAbmdkb2MgZXZlbnRcbiAgICAgICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXZpZXcjJHZpZXdDb250ZW50TG9hZGVkXG4gICAgICAgICAgICogQGV2ZW50T2YgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS12aWV3XG4gICAgICAgICAgICogQGV2ZW50VHlwZSBlbWl0cyBvbiB1aS12aWV3IGRpcmVjdGl2ZSBzY29wZVxuICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAqIEZpcmVkIG9uY2UgdGhlIHZpZXcgaXMgKipsb2FkZWQqKiwgKmFmdGVyKiB0aGUgRE9NIGlzIHJlbmRlcmVkLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IG9iamVjdC5cbiAgICAgICAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmlld05hbWUgTmFtZSBvZiB0aGUgdmlldy5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBjdXJyZW50U2NvcGUuJGVtaXQoJyR2aWV3Q29udGVudExvYWRlZCcsIG5hbWUpO1xuICAgICAgICAgIGN1cnJlbnRTY29wZS4kZXZhbChvbmxvYWRFeHApO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gZGlyZWN0aXZlO1xufVxuXG4kVmlld0RpcmVjdGl2ZUZpbGwuJGluamVjdCA9IFsnJGNvbXBpbGUnLCAnJGNvbnRyb2xsZXInLCAnJHN0YXRlJywgJyRpbnRlcnBvbGF0ZSddO1xuZnVuY3Rpb24gJFZpZXdEaXJlY3RpdmVGaWxsICggICRjb21waWxlLCAgICRjb250cm9sbGVyLCAgICRzdGF0ZSwgICAkaW50ZXJwb2xhdGUpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0VDQScsXG4gICAgcHJpb3JpdHk6IC00MDAsXG4gICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50KSB7XG4gICAgICB2YXIgaW5pdGlhbCA9IHRFbGVtZW50Lmh0bWwoKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoc2NvcGUsICRlbGVtZW50LCBhdHRycykge1xuICAgICAgICB2YXIgY3VycmVudCA9ICRzdGF0ZS4kY3VycmVudCxcbiAgICAgICAgICAgIG5hbWUgPSBnZXRVaVZpZXdOYW1lKHNjb3BlLCBhdHRycywgJGVsZW1lbnQsICRpbnRlcnBvbGF0ZSksXG4gICAgICAgICAgICBsb2NhbHMgID0gY3VycmVudCAmJiBjdXJyZW50LmxvY2Fsc1tuYW1lXTtcblxuICAgICAgICBpZiAoISBsb2NhbHMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkZWxlbWVudC5kYXRhKCckdWlWaWV3JywgeyBuYW1lOiBuYW1lLCBzdGF0ZTogbG9jYWxzLiQkc3RhdGUgfSk7XG4gICAgICAgICRlbGVtZW50Lmh0bWwobG9jYWxzLiR0ZW1wbGF0ZSA/IGxvY2Fscy4kdGVtcGxhdGUgOiBpbml0aWFsKTtcblxuICAgICAgICB2YXIgcmVzb2x2ZURhdGEgPSBhbmd1bGFyLmV4dGVuZCh7fSwgbG9jYWxzKTtcbiAgICAgICAgc2NvcGVbbG9jYWxzLiQkcmVzb2x2ZUFzXSA9IHJlc29sdmVEYXRhO1xuXG4gICAgICAgIHZhciBsaW5rID0gJGNvbXBpbGUoJGVsZW1lbnQuY29udGVudHMoKSk7XG5cbiAgICAgICAgaWYgKGxvY2Fscy4kJGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICBsb2NhbHMuJHNjb3BlID0gc2NvcGU7XG4gICAgICAgICAgbG9jYWxzLiRlbGVtZW50ID0gJGVsZW1lbnQ7XG4gICAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSAkY29udHJvbGxlcihsb2NhbHMuJCRjb250cm9sbGVyLCBsb2NhbHMpO1xuICAgICAgICAgIGlmIChsb2NhbHMuJCRjb250cm9sbGVyQXMpIHtcbiAgICAgICAgICAgIHNjb3BlW2xvY2Fscy4kJGNvbnRyb2xsZXJBc10gPSBjb250cm9sbGVyO1xuICAgICAgICAgICAgc2NvcGVbbG9jYWxzLiQkY29udHJvbGxlckFzXVtsb2NhbHMuJCRyZXNvbHZlQXNdID0gcmVzb2x2ZURhdGE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKGNvbnRyb2xsZXIuJG9uSW5pdCkpIGNvbnRyb2xsZXIuJG9uSW5pdCgpO1xuICAgICAgICAgICRlbGVtZW50LmRhdGEoJyRuZ0NvbnRyb2xsZXJDb250cm9sbGVyJywgY29udHJvbGxlcik7XG4gICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5kYXRhKCckbmdDb250cm9sbGVyQ29udHJvbGxlcicsIGNvbnRyb2xsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGluayhzY29wZSk7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBTaGFyZWQgdWktdmlldyBjb2RlIGZvciBib3RoIGRpcmVjdGl2ZXM6XG4gKiBHaXZlbiBzY29wZSwgZWxlbWVudCwgYW5kIGl0cyBhdHRyaWJ1dGVzLCByZXR1cm4gdGhlIHZpZXcncyBuYW1lXG4gKi9cbmZ1bmN0aW9uIGdldFVpVmlld05hbWUoc2NvcGUsIGF0dHJzLCBlbGVtZW50LCAkaW50ZXJwb2xhdGUpIHtcbiAgdmFyIG5hbWUgPSAkaW50ZXJwb2xhdGUoYXR0cnMudWlWaWV3IHx8IGF0dHJzLm5hbWUgfHwgJycpKHNjb3BlKTtcbiAgdmFyIHVpVmlld0NyZWF0ZWRCeSA9IGVsZW1lbnQuaW5oZXJpdGVkRGF0YSgnJHVpVmlldycpO1xuICByZXR1cm4gbmFtZS5pbmRleE9mKCdAJykgPj0gMCA/ICBuYW1lIDogIChuYW1lICsgJ0AnICsgKHVpVmlld0NyZWF0ZWRCeSA/IHVpVmlld0NyZWF0ZWRCeS5zdGF0ZS5uYW1lIDogJycpKTtcbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScpLmRpcmVjdGl2ZSgndWlWaWV3JywgJFZpZXdEaXJlY3RpdmUpO1xuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScpLmRpcmVjdGl2ZSgndWlWaWV3JywgJFZpZXdEaXJlY3RpdmVGaWxsKTtcblxuZnVuY3Rpb24gcGFyc2VTdGF0ZVJlZihyZWYsIGN1cnJlbnQpIHtcbiAgdmFyIHByZXBhcnNlZCA9IHJlZi5tYXRjaCgvXlxccyooe1tefV0qfSlcXHMqJC8pLCBwYXJzZWQ7XG4gIGlmIChwcmVwYXJzZWQpIHJlZiA9IGN1cnJlbnQgKyAnKCcgKyBwcmVwYXJzZWRbMV0gKyAnKSc7XG4gIHBhcnNlZCA9IHJlZi5yZXBsYWNlKC9cXG4vZywgXCIgXCIpLm1hdGNoKC9eKFteKF0rPylcXHMqKFxcKCguKilcXCkpPyQvKTtcbiAgaWYgKCFwYXJzZWQgfHwgcGFyc2VkLmxlbmd0aCAhPT0gNCkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzdGF0ZSByZWYgJ1wiICsgcmVmICsgXCInXCIpO1xuICByZXR1cm4geyBzdGF0ZTogcGFyc2VkWzFdLCBwYXJhbUV4cHI6IHBhcnNlZFszXSB8fCBudWxsIH07XG59XG5cbmZ1bmN0aW9uIHN0YXRlQ29udGV4dChlbCkge1xuICB2YXIgc3RhdGVEYXRhID0gZWwucGFyZW50KCkuaW5oZXJpdGVkRGF0YSgnJHVpVmlldycpO1xuXG4gIGlmIChzdGF0ZURhdGEgJiYgc3RhdGVEYXRhLnN0YXRlICYmIHN0YXRlRGF0YS5zdGF0ZS5uYW1lKSB7XG4gICAgcmV0dXJuIHN0YXRlRGF0YS5zdGF0ZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRUeXBlSW5mbyhlbCkge1xuICAvLyBTVkdBRWxlbWVudCBkb2VzIG5vdCB1c2UgdGhlIGhyZWYgYXR0cmlidXRlLCBidXQgcmF0aGVyIHRoZSAneGxpbmtIcmVmJyBhdHRyaWJ1dGUuXG4gIHZhciBpc1N2ZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChlbC5wcm9wKCdocmVmJykpID09PSAnW29iamVjdCBTVkdBbmltYXRlZFN0cmluZ10nO1xuICB2YXIgaXNGb3JtID0gZWxbMF0ubm9kZU5hbWUgPT09IFwiRk9STVwiO1xuXG4gIHJldHVybiB7XG4gICAgYXR0cjogaXNGb3JtID8gXCJhY3Rpb25cIiA6IChpc1N2ZyA/ICd4bGluazpocmVmJyA6ICdocmVmJyksXG4gICAgaXNBbmNob3I6IGVsLnByb3AoXCJ0YWdOYW1lXCIpLnRvVXBwZXJDYXNlKCkgPT09IFwiQVwiLFxuICAgIGNsaWNrYWJsZTogIWlzRm9ybVxuICB9O1xufVxuXG5mdW5jdGlvbiBjbGlja0hvb2soZWwsICRzdGF0ZSwgJHRpbWVvdXQsIHR5cGUsIGN1cnJlbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgYnV0dG9uID0gZS53aGljaCB8fCBlLmJ1dHRvbiwgdGFyZ2V0ID0gY3VycmVudCgpO1xuXG4gICAgaWYgKCEoYnV0dG9uID4gMSB8fCBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5IHx8IGUuc2hpZnRLZXkgfHwgZWwuYXR0cigndGFyZ2V0JykpKSB7XG4gICAgICAvLyBIQUNLOiBUaGlzIGlzIHRvIGFsbG93IG5nLWNsaWNrcyB0byBiZSBwcm9jZXNzZWQgYmVmb3JlIHRoZSB0cmFuc2l0aW9uIGlzIGluaXRpYXRlZDpcbiAgICAgIHZhciB0cmFuc2l0aW9uID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzdGF0ZS5nbyh0YXJnZXQuc3RhdGUsIHRhcmdldC5wYXJhbXMsIHRhcmdldC5vcHRpb25zKTtcbiAgICAgIH0pO1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAvLyBpZiB0aGUgc3RhdGUgaGFzIG5vIFVSTCwgaWdub3JlIG9uZSBwcmV2ZW50RGVmYXVsdCBmcm9tIHRoZSA8YT4gZGlyZWN0aXZlLlxuICAgICAgdmFyIGlnbm9yZVByZXZlbnREZWZhdWx0Q291bnQgPSB0eXBlLmlzQW5jaG9yICYmICF0YXJnZXQuaHJlZiA/IDE6IDA7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGlnbm9yZVByZXZlbnREZWZhdWx0Q291bnQtLSA8PSAwKSAkdGltZW91dC5jYW5jZWwodHJhbnNpdGlvbik7XG4gICAgICB9O1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVmYXVsdE9wdHMoZWwsICRzdGF0ZSkge1xuICByZXR1cm4geyByZWxhdGl2ZTogc3RhdGVDb250ZXh0KGVsKSB8fCAkc3RhdGUuJGN1cnJlbnQsIGluaGVyaXQ6IHRydWUgfTtcbn1cblxuLyoqXG4gKiBAbmdkb2MgZGlyZWN0aXZlXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXNyZWZcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICogQHJlcXVpcmVzICR0aW1lb3V0XG4gKlxuICogQHJlc3RyaWN0IEFcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgZGlyZWN0aXZlIHRoYXQgYmluZHMgYSBsaW5rIChgPGE+YCB0YWcpIHRvIGEgc3RhdGUuIElmIHRoZSBzdGF0ZSBoYXMgYW4gYXNzb2NpYXRlZFxuICogVVJMLCB0aGUgZGlyZWN0aXZlIHdpbGwgYXV0b21hdGljYWxseSBnZW5lcmF0ZSAmIHVwZGF0ZSB0aGUgYGhyZWZgIGF0dHJpYnV0ZSB2aWFcbiAqIHRoZSB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2hyZWYgJHN0YXRlLmhyZWYoKX0gbWV0aG9kLiBDbGlja2luZ1xuICogdGhlIGxpbmsgd2lsbCB0cmlnZ2VyIGEgc3RhdGUgdHJhbnNpdGlvbiB3aXRoIG9wdGlvbmFsIHBhcmFtZXRlcnMuXG4gKlxuICogQWxzbyBtaWRkbGUtY2xpY2tpbmcsIHJpZ2h0LWNsaWNraW5nLCBhbmQgY3RybC1jbGlja2luZyBvbiB0aGUgbGluayB3aWxsIGJlXG4gKiBoYW5kbGVkIG5hdGl2ZWx5IGJ5IHRoZSBicm93c2VyLlxuICpcbiAqIFlvdSBjYW4gYWxzbyB1c2UgcmVsYXRpdmUgc3RhdGUgcGF0aHMgd2l0aGluIHVpLXNyZWYsIGp1c3QgbGlrZSB0aGUgcmVsYXRpdmVcbiAqIHBhdGhzIHBhc3NlZCB0byBgJHN0YXRlLmdvKClgLiBZb3UganVzdCBuZWVkIHRvIGJlIGF3YXJlIHRoYXQgdGhlIHBhdGggaXMgcmVsYXRpdmVcbiAqIHRvIHRoZSBzdGF0ZSB0aGF0IHRoZSBsaW5rIGxpdmVzIGluLCBpbiBvdGhlciB3b3JkcyB0aGUgc3RhdGUgdGhhdCBsb2FkZWQgdGhlXG4gKiB0ZW1wbGF0ZSBjb250YWluaW5nIHRoZSBsaW5rLlxuICpcbiAqIFlvdSBjYW4gc3BlY2lmeSBvcHRpb25zIHRvIHBhc3MgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19nbyAkc3RhdGUuZ28oKX1cbiAqIHVzaW5nIHRoZSBgdWktc3JlZi1vcHRzYCBhdHRyaWJ1dGUuIE9wdGlvbnMgYXJlIHJlc3RyaWN0ZWQgdG8gYGxvY2F0aW9uYCwgYGluaGVyaXRgLFxuICogYW5kIGByZWxvYWRgLlxuICpcbiAqIEBleGFtcGxlXG4gKiBIZXJlJ3MgYW4gZXhhbXBsZSBvZiBob3cgeW91J2QgdXNlIHVpLXNyZWYgYW5kIGhvdyBpdCB3b3VsZCBjb21waWxlLiBJZiB5b3UgaGF2ZSB0aGVcbiAqIGZvbGxvd2luZyB0ZW1wbGF0ZTpcbiAqIDxwcmU+XG4gKiA8YSB1aS1zcmVmPVwiaG9tZVwiPkhvbWU8L2E+IHwgPGEgdWktc3JlZj1cImFib3V0XCI+QWJvdXQ8L2E+IHwgPGEgdWktc3JlZj1cIntwYWdlOiAyfVwiPk5leHQgcGFnZTwvYT5cbiAqXG4gKiA8dWw+XG4gKiAgICAgPGxpIG5nLXJlcGVhdD1cImNvbnRhY3QgaW4gY29udGFjdHNcIj5cbiAqICAgICAgICAgPGEgdWktc3JlZj1cImNvbnRhY3RzLmRldGFpbCh7IGlkOiBjb250YWN0LmlkIH0pXCI+e3sgY29udGFjdC5uYW1lIH19PC9hPlxuICogICAgIDwvbGk+XG4gKiA8L3VsPlxuICogPC9wcmU+XG4gKlxuICogVGhlbiB0aGUgY29tcGlsZWQgaHRtbCB3b3VsZCBiZSAoYXNzdW1pbmcgSHRtbDVNb2RlIGlzIG9mZiBhbmQgY3VycmVudCBzdGF0ZSBpcyBjb250YWN0cyk6XG4gKiA8cHJlPlxuICogPGEgaHJlZj1cIiMvaG9tZVwiIHVpLXNyZWY9XCJob21lXCI+SG9tZTwvYT4gfCA8YSBocmVmPVwiIy9hYm91dFwiIHVpLXNyZWY9XCJhYm91dFwiPkFib3V0PC9hPiB8IDxhIGhyZWY9XCIjL2NvbnRhY3RzP3BhZ2U9MlwiIHVpLXNyZWY9XCJ7cGFnZTogMn1cIj5OZXh0IHBhZ2U8L2E+XG4gKlxuICogPHVsPlxuICogICAgIDxsaSBuZy1yZXBlYXQ9XCJjb250YWN0IGluIGNvbnRhY3RzXCI+XG4gKiAgICAgICAgIDxhIGhyZWY9XCIjL2NvbnRhY3RzLzFcIiB1aS1zcmVmPVwiY29udGFjdHMuZGV0YWlsKHsgaWQ6IGNvbnRhY3QuaWQgfSlcIj5Kb2U8L2E+XG4gKiAgICAgPC9saT5cbiAqICAgICA8bGkgbmctcmVwZWF0PVwiY29udGFjdCBpbiBjb250YWN0c1wiPlxuICogICAgICAgICA8YSBocmVmPVwiIy9jb250YWN0cy8yXCIgdWktc3JlZj1cImNvbnRhY3RzLmRldGFpbCh7IGlkOiBjb250YWN0LmlkIH0pXCI+QWxpY2U8L2E+XG4gKiAgICAgPC9saT5cbiAqICAgICA8bGkgbmctcmVwZWF0PVwiY29udGFjdCBpbiBjb250YWN0c1wiPlxuICogICAgICAgICA8YSBocmVmPVwiIy9jb250YWN0cy8zXCIgdWktc3JlZj1cImNvbnRhY3RzLmRldGFpbCh7IGlkOiBjb250YWN0LmlkIH0pXCI+Qm9iPC9hPlxuICogICAgIDwvbGk+XG4gKiA8L3VsPlxuICpcbiAqIDxhIHVpLXNyZWY9XCJob21lXCIgdWktc3JlZi1vcHRzPVwie3JlbG9hZDogdHJ1ZX1cIj5Ib21lPC9hPlxuICogPC9wcmU+XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVpLXNyZWYgJ3N0YXRlTmFtZScgY2FuIGJlIGFueSB2YWxpZCBhYnNvbHV0ZSBvciByZWxhdGl2ZSBzdGF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHVpLXNyZWYtb3B0cyBvcHRpb25zIHRvIHBhc3MgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19nbyAkc3RhdGUuZ28oKX1cbiAqL1xuJFN0YXRlUmVmRGlyZWN0aXZlLiRpbmplY3QgPSBbJyRzdGF0ZScsICckdGltZW91dCddO1xuZnVuY3Rpb24gJFN0YXRlUmVmRGlyZWN0aXZlKCRzdGF0ZSwgJHRpbWVvdXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHJlcXVpcmU6IFsnP151aVNyZWZBY3RpdmUnLCAnP151aVNyZWZBY3RpdmVFcSddLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgdWlTcmVmQWN0aXZlKSB7XG4gICAgICB2YXIgcmVmICAgID0gcGFyc2VTdGF0ZVJlZihhdHRycy51aVNyZWYsICRzdGF0ZS5jdXJyZW50Lm5hbWUpO1xuICAgICAgdmFyIGRlZiAgICA9IHsgc3RhdGU6IHJlZi5zdGF0ZSwgaHJlZjogbnVsbCwgcGFyYW1zOiBudWxsIH07XG4gICAgICB2YXIgdHlwZSAgID0gZ2V0VHlwZUluZm8oZWxlbWVudCk7XG4gICAgICB2YXIgYWN0aXZlID0gdWlTcmVmQWN0aXZlWzFdIHx8IHVpU3JlZkFjdGl2ZVswXTtcbiAgICAgIHZhciB1bmxpbmtJbmZvRm4gPSBudWxsO1xuICAgICAgdmFyIGhvb2tGbjtcblxuICAgICAgZGVmLm9wdGlvbnMgPSBleHRlbmQoZGVmYXVsdE9wdHMoZWxlbWVudCwgJHN0YXRlKSwgYXR0cnMudWlTcmVmT3B0cyA/IHNjb3BlLiRldmFsKGF0dHJzLnVpU3JlZk9wdHMpIDoge30pO1xuXG4gICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgICAgIGlmICh2YWwpIGRlZi5wYXJhbXMgPSBhbmd1bGFyLmNvcHkodmFsKTtcbiAgICAgICAgZGVmLmhyZWYgPSAkc3RhdGUuaHJlZihyZWYuc3RhdGUsIGRlZi5wYXJhbXMsIGRlZi5vcHRpb25zKTtcblxuICAgICAgICBpZiAodW5saW5rSW5mb0ZuKSB1bmxpbmtJbmZvRm4oKTtcbiAgICAgICAgaWYgKGFjdGl2ZSkgdW5saW5rSW5mb0ZuID0gYWN0aXZlLiQkYWRkU3RhdGVJbmZvKHJlZi5zdGF0ZSwgZGVmLnBhcmFtcyk7XG4gICAgICAgIGlmIChkZWYuaHJlZiAhPT0gbnVsbCkgYXR0cnMuJHNldCh0eXBlLmF0dHIsIGRlZi5ocmVmKTtcbiAgICAgIH07XG5cbiAgICAgIGlmIChyZWYucGFyYW1FeHByKSB7XG4gICAgICAgIHNjb3BlLiR3YXRjaChyZWYucGFyYW1FeHByLCBmdW5jdGlvbih2YWwpIHsgaWYgKHZhbCAhPT0gZGVmLnBhcmFtcykgdXBkYXRlKHZhbCk7IH0sIHRydWUpO1xuICAgICAgICBkZWYucGFyYW1zID0gYW5ndWxhci5jb3B5KHNjb3BlLiRldmFsKHJlZi5wYXJhbUV4cHIpKTtcbiAgICAgIH1cbiAgICAgIHVwZGF0ZSgpO1xuXG4gICAgICBpZiAoIXR5cGUuY2xpY2thYmxlKSByZXR1cm47XG4gICAgICBob29rRm4gPSBjbGlja0hvb2soZWxlbWVudCwgJHN0YXRlLCAkdGltZW91dCwgdHlwZSwgZnVuY3Rpb24oKSB7IHJldHVybiBkZWY7IH0pO1xuICAgICAgZWxlbWVudC5iaW5kKFwiY2xpY2tcIiwgaG9va0ZuKTtcbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZWxlbWVudC51bmJpbmQoXCJjbGlja1wiLCBob29rRm4pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3RhdGVcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLnVpU3JlZlxuICpcbiAqIEByZXN0cmljdCBBXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBNdWNoIGxpa2UgdWktc3JlZiwgYnV0IHdpbGwgYWNjZXB0IG5hbWVkICRzY29wZSBwcm9wZXJ0aWVzIHRvIGV2YWx1YXRlIGZvciBhIHN0YXRlIGRlZmluaXRpb24sXG4gKiBwYXJhbXMgYW5kIG92ZXJyaWRlIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVpLXN0YXRlICdzdGF0ZU5hbWUnIGNhbiBiZSBhbnkgdmFsaWQgYWJzb2x1dGUgb3IgcmVsYXRpdmUgc3RhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSB1aS1zdGF0ZS1wYXJhbXMgcGFyYW1zIHRvIHBhc3MgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19ocmVmICRzdGF0ZS5ocmVmKCl9XG4gKiBAcGFyYW0ge09iamVjdH0gdWktc3RhdGUtb3B0cyBvcHRpb25zIHRvIHBhc3MgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19nbyAkc3RhdGUuZ28oKX1cbiAqL1xuJFN0YXRlUmVmRHluYW1pY0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc3RhdGUnLCAnJHRpbWVvdXQnXTtcbmZ1bmN0aW9uICRTdGF0ZVJlZkR5bmFtaWNEaXJlY3RpdmUoJHN0YXRlLCAkdGltZW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQScsXG4gICAgcmVxdWlyZTogWyc/XnVpU3JlZkFjdGl2ZScsICc/XnVpU3JlZkFjdGl2ZUVxJ10sXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCB1aVNyZWZBY3RpdmUpIHtcbiAgICAgIHZhciB0eXBlICAgPSBnZXRUeXBlSW5mbyhlbGVtZW50KTtcbiAgICAgIHZhciBhY3RpdmUgPSB1aVNyZWZBY3RpdmVbMV0gfHwgdWlTcmVmQWN0aXZlWzBdO1xuICAgICAgdmFyIGdyb3VwICA9IFthdHRycy51aVN0YXRlLCBhdHRycy51aVN0YXRlUGFyYW1zIHx8IG51bGwsIGF0dHJzLnVpU3RhdGVPcHRzIHx8IG51bGxdO1xuICAgICAgdmFyIHdhdGNoICA9ICdbJyArIGdyb3VwLm1hcChmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCB8fCAnbnVsbCc7IH0pLmpvaW4oJywgJykgKyAnXSc7XG4gICAgICB2YXIgZGVmICAgID0geyBzdGF0ZTogbnVsbCwgcGFyYW1zOiBudWxsLCBvcHRpb25zOiBudWxsLCBocmVmOiBudWxsIH07XG4gICAgICB2YXIgdW5saW5rSW5mb0ZuID0gbnVsbDtcbiAgICAgIHZhciBob29rRm47XG5cbiAgICAgIGZ1bmN0aW9uIHJ1blN0YXRlUmVmTGluayAoZ3JvdXApIHtcbiAgICAgICAgZGVmLnN0YXRlID0gZ3JvdXBbMF07IGRlZi5wYXJhbXMgPSBncm91cFsxXTsgZGVmLm9wdGlvbnMgPSBncm91cFsyXTtcbiAgICAgICAgZGVmLmhyZWYgPSAkc3RhdGUuaHJlZihkZWYuc3RhdGUsIGRlZi5wYXJhbXMsIGRlZi5vcHRpb25zKTtcblxuICAgICAgICBpZiAodW5saW5rSW5mb0ZuKSB1bmxpbmtJbmZvRm4oKTtcbiAgICAgICAgaWYgKGFjdGl2ZSkgdW5saW5rSW5mb0ZuID0gYWN0aXZlLiQkYWRkU3RhdGVJbmZvKGRlZi5zdGF0ZSwgZGVmLnBhcmFtcyk7XG4gICAgICAgIGlmIChkZWYuaHJlZikgYXR0cnMuJHNldCh0eXBlLmF0dHIsIGRlZi5ocmVmKTtcbiAgICAgIH1cblxuICAgICAgc2NvcGUuJHdhdGNoKHdhdGNoLCBydW5TdGF0ZVJlZkxpbmssIHRydWUpO1xuICAgICAgcnVuU3RhdGVSZWZMaW5rKHNjb3BlLiRldmFsKHdhdGNoKSk7XG5cbiAgICAgIGlmICghdHlwZS5jbGlja2FibGUpIHJldHVybjtcbiAgICAgIGhvb2tGbiA9IGNsaWNrSG9vayhlbGVtZW50LCAkc3RhdGUsICR0aW1lb3V0LCB0eXBlLCBmdW5jdGlvbigpIHsgcmV0dXJuIGRlZjsgfSk7XG4gICAgICBlbGVtZW50LmJpbmQoXCJjbGlja1wiLCBob29rRm4pO1xuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBlbGVtZW50LnVuYmluZChcImNsaWNrXCIsIGhvb2tGbik7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cblxuLyoqXG4gKiBAbmdkb2MgZGlyZWN0aXZlXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXNyZWYtYWN0aXZlXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUGFyYW1zXG4gKiBAcmVxdWlyZXMgJGludGVycG9sYXRlXG4gKlxuICogQHJlc3RyaWN0IEFcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgZGlyZWN0aXZlIHdvcmtpbmcgYWxvbmdzaWRlIHVpLXNyZWYgdG8gYWRkIGNsYXNzZXMgdG8gYW4gZWxlbWVudCB3aGVuIHRoZVxuICogcmVsYXRlZCB1aS1zcmVmIGRpcmVjdGl2ZSdzIHN0YXRlIGlzIGFjdGl2ZSwgYW5kIHJlbW92aW5nIHRoZW0gd2hlbiBpdCBpcyBpbmFjdGl2ZS5cbiAqIFRoZSBwcmltYXJ5IHVzZS1jYXNlIGlzIHRvIHNpbXBsaWZ5IHRoZSBzcGVjaWFsIGFwcGVhcmFuY2Ugb2YgbmF2aWdhdGlvbiBtZW51c1xuICogcmVseWluZyBvbiBgdWktc3JlZmAsIGJ5IGhhdmluZyB0aGUgXCJhY3RpdmVcIiBzdGF0ZSdzIG1lbnUgYnV0dG9uIGFwcGVhciBkaWZmZXJlbnQsXG4gKiBkaXN0aW5ndWlzaGluZyBpdCBmcm9tIHRoZSBpbmFjdGl2ZSBtZW51IGl0ZW1zLlxuICpcbiAqIHVpLXNyZWYtYWN0aXZlIGNhbiBsaXZlIG9uIHRoZSBzYW1lIGVsZW1lbnQgYXMgdWktc3JlZiBvciBvbiBhIHBhcmVudCBlbGVtZW50LiBUaGUgZmlyc3RcbiAqIHVpLXNyZWYtYWN0aXZlIGZvdW5kIGF0IHRoZSBzYW1lIGxldmVsIG9yIGFib3ZlIHRoZSB1aS1zcmVmIHdpbGwgYmUgdXNlZC5cbiAqXG4gKiBXaWxsIGFjdGl2YXRlIHdoZW4gdGhlIHVpLXNyZWYncyB0YXJnZXQgc3RhdGUgb3IgYW55IGNoaWxkIHN0YXRlIGlzIGFjdGl2ZS4gSWYgeW91XG4gKiBuZWVkIHRvIGFjdGl2YXRlIG9ubHkgd2hlbiB0aGUgdWktc3JlZiB0YXJnZXQgc3RhdGUgaXMgYWN0aXZlIGFuZCAqbm90KiBhbnkgb2ZcbiAqIGl0J3MgY2hpbGRyZW4sIHRoZW4geW91IHdpbGwgdXNlXG4gKiB7QGxpbmsgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zcmVmLWFjdGl2ZS1lcSB1aS1zcmVmLWFjdGl2ZS1lcX1cbiAqXG4gKiBAZXhhbXBsZVxuICogR2l2ZW4gdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZTpcbiAqIDxwcmU+XG4gKiA8dWw+XG4gKiAgIDxsaSB1aS1zcmVmLWFjdGl2ZT1cImFjdGl2ZVwiIGNsYXNzPVwiaXRlbVwiPlxuICogICAgIDxhIGhyZWYgdWktc3JlZj1cImFwcC51c2VyKHt1c2VyOiAnYmlsYm9iYWdnaW5zJ30pXCI+QGJpbGJvYmFnZ2luczwvYT5cbiAqICAgPC9saT5cbiAqIDwvdWw+XG4gKiA8L3ByZT5cbiAqXG4gKlxuICogV2hlbiB0aGUgYXBwIHN0YXRlIGlzIFwiYXBwLnVzZXJcIiAob3IgYW55IGNoaWxkcmVuIHN0YXRlcyksIGFuZCBjb250YWlucyB0aGUgc3RhdGUgcGFyYW1ldGVyIFwidXNlclwiIHdpdGggdmFsdWUgXCJiaWxib2JhZ2dpbnNcIixcbiAqIHRoZSByZXN1bHRpbmcgSFRNTCB3aWxsIGFwcGVhciBhcyAobm90ZSB0aGUgJ2FjdGl2ZScgY2xhc3MpOlxuICogPHByZT5cbiAqIDx1bD5cbiAqICAgPGxpIHVpLXNyZWYtYWN0aXZlPVwiYWN0aXZlXCIgY2xhc3M9XCJpdGVtIGFjdGl2ZVwiPlxuICogICAgIDxhIHVpLXNyZWY9XCJhcHAudXNlcih7dXNlcjogJ2JpbGJvYmFnZ2lucyd9KVwiIGhyZWY9XCIvdXNlcnMvYmlsYm9iYWdnaW5zXCI+QGJpbGJvYmFnZ2luczwvYT5cbiAqICAgPC9saT5cbiAqIDwvdWw+XG4gKiA8L3ByZT5cbiAqXG4gKiBUaGUgY2xhc3MgbmFtZSBpcyBpbnRlcnBvbGF0ZWQgKipvbmNlKiogZHVyaW5nIHRoZSBkaXJlY3RpdmVzIGxpbmsgdGltZSAoYW55IGZ1cnRoZXIgY2hhbmdlcyB0byB0aGVcbiAqIGludGVycG9sYXRlZCB2YWx1ZSBhcmUgaWdub3JlZCkuXG4gKlxuICogTXVsdGlwbGUgY2xhc3NlcyBtYXkgYmUgc3BlY2lmaWVkIGluIGEgc3BhY2Utc2VwYXJhdGVkIGZvcm1hdDpcbiAqIDxwcmU+XG4gKiA8dWw+XG4gKiAgIDxsaSB1aS1zcmVmLWFjdGl2ZT0nY2xhc3MxIGNsYXNzMiBjbGFzczMnPlxuICogICAgIDxhIHVpLXNyZWY9XCJhcHAudXNlclwiPmxpbms8L2E+XG4gKiAgIDwvbGk+XG4gKiA8L3VsPlxuICogPC9wcmU+XG4gKlxuICogSXQgaXMgYWxzbyBwb3NzaWJsZSB0byBwYXNzIHVpLXNyZWYtYWN0aXZlIGFuIGV4cHJlc3Npb24gdGhhdCBldmFsdWF0ZXNcbiAqIHRvIGFuIG9iamVjdCBoYXNoLCB3aG9zZSBrZXlzIHJlcHJlc2VudCBhY3RpdmUgY2xhc3MgbmFtZXMgYW5kIHdob3NlXG4gKiB2YWx1ZXMgcmVwcmVzZW50IHRoZSByZXNwZWN0aXZlIHN0YXRlIG5hbWVzL2dsb2JzLlxuICogdWktc3JlZi1hY3RpdmUgd2lsbCBtYXRjaCBpZiB0aGUgY3VycmVudCBhY3RpdmUgc3RhdGUgKippbmNsdWRlcyoqIGFueSBvZlxuICogdGhlIHNwZWNpZmllZCBzdGF0ZSBuYW1lcy9nbG9icywgZXZlbiB0aGUgYWJzdHJhY3Qgb25lcy5cbiAqXG4gKiBARXhhbXBsZVxuICogR2l2ZW4gdGhlIGZvbGxvd2luZyB0ZW1wbGF0ZSwgd2l0aCBcImFkbWluXCIgYmVpbmcgYW4gYWJzdHJhY3Qgc3RhdGU6XG4gKiA8cHJlPlxuICogPGRpdiB1aS1zcmVmLWFjdGl2ZT1cInsnYWN0aXZlJzogJ2FkbWluLionfVwiPlxuICogICA8YSB1aS1zcmVmLWFjdGl2ZT1cImFjdGl2ZVwiIHVpLXNyZWY9XCJhZG1pbi5yb2xlc1wiPlJvbGVzPC9hPlxuICogPC9kaXY+XG4gKiA8L3ByZT5cbiAqXG4gKiBXaGVuIHRoZSBjdXJyZW50IHN0YXRlIGlzIFwiYWRtaW4ucm9sZXNcIiB0aGUgXCJhY3RpdmVcIiBjbGFzcyB3aWxsIGJlIGFwcGxpZWRcbiAqIHRvIGJvdGggdGhlIDxkaXY+IGFuZCA8YT4gZWxlbWVudHMuIEl0IGlzIGltcG9ydGFudCB0byBub3RlIHRoYXQgdGhlIHN0YXRlXG4gKiBuYW1lcy9nbG9icyBwYXNzZWQgdG8gdWktc3JlZi1hY3RpdmUgc2hhZG93IHRoZSBzdGF0ZSBwcm92aWRlZCBieSB1aS1zcmVmLlxuICovXG5cbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zcmVmLWFjdGl2ZS1lcVxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVBhcmFtc1xuICogQHJlcXVpcmVzICRpbnRlcnBvbGF0ZVxuICpcbiAqIEByZXN0cmljdCBBXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUaGUgc2FtZSBhcyB7QGxpbmsgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zcmVmLWFjdGl2ZSB1aS1zcmVmLWFjdGl2ZX0gYnV0IHdpbGwgb25seSBhY3RpdmF0ZVxuICogd2hlbiB0aGUgZXhhY3QgdGFyZ2V0IHN0YXRlIHVzZWQgaW4gdGhlIGB1aS1zcmVmYCBpcyBhY3RpdmU7IG5vIGNoaWxkIHN0YXRlcy5cbiAqXG4gKi9cbiRTdGF0ZVJlZkFjdGl2ZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc3RhdGUnLCAnJHN0YXRlUGFyYW1zJywgJyRpbnRlcnBvbGF0ZSddO1xuZnVuY3Rpb24gJFN0YXRlUmVmQWN0aXZlRGlyZWN0aXZlKCRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkaW50ZXJwb2xhdGUpIHtcbiAgcmV0dXJuICB7XG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxuICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgJyRlbGVtZW50JywgJyRhdHRycycsICckdGltZW91dCcsIGZ1bmN0aW9uICgkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsICR0aW1lb3V0KSB7XG4gICAgICB2YXIgc3RhdGVzID0gW10sIGFjdGl2ZUNsYXNzZXMgPSB7fSwgYWN0aXZlRXFDbGFzcywgdWlTcmVmQWN0aXZlO1xuXG4gICAgICAvLyBUaGVyZSBwcm9iYWJseSBpc24ndCBtdWNoIHBvaW50IGluICRvYnNlcnZpbmcgdGhpc1xuICAgICAgLy8gdWlTcmVmQWN0aXZlIGFuZCB1aVNyZWZBY3RpdmVFcSBzaGFyZSB0aGUgc2FtZSBkaXJlY3RpdmUgb2JqZWN0IHdpdGggc29tZVxuICAgICAgLy8gc2xpZ2h0IGRpZmZlcmVuY2UgaW4gbG9naWMgcm91dGluZ1xuICAgICAgYWN0aXZlRXFDbGFzcyA9ICRpbnRlcnBvbGF0ZSgkYXR0cnMudWlTcmVmQWN0aXZlRXEgfHwgJycsIGZhbHNlKSgkc2NvcGUpO1xuXG4gICAgICB0cnkge1xuICAgICAgICB1aVNyZWZBY3RpdmUgPSAkc2NvcGUuJGV2YWwoJGF0dHJzLnVpU3JlZkFjdGl2ZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIERvIG5vdGhpbmcuIHVpU3JlZkFjdGl2ZSBpcyBub3QgYSB2YWxpZCBleHByZXNzaW9uLlxuICAgICAgICAvLyBGYWxsIGJhY2sgdG8gdXNpbmcgJGludGVycG9sYXRlIGJlbG93XG4gICAgICB9XG4gICAgICB1aVNyZWZBY3RpdmUgPSB1aVNyZWZBY3RpdmUgfHwgJGludGVycG9sYXRlKCRhdHRycy51aVNyZWZBY3RpdmUgfHwgJycsIGZhbHNlKSgkc2NvcGUpO1xuICAgICAgaWYgKGlzT2JqZWN0KHVpU3JlZkFjdGl2ZSkpIHtcbiAgICAgICAgZm9yRWFjaCh1aVNyZWZBY3RpdmUsIGZ1bmN0aW9uKHN0YXRlT3JOYW1lLCBhY3RpdmVDbGFzcykge1xuICAgICAgICAgIGlmIChpc1N0cmluZyhzdGF0ZU9yTmFtZSkpIHtcbiAgICAgICAgICAgIHZhciByZWYgPSBwYXJzZVN0YXRlUmVmKHN0YXRlT3JOYW1lLCAkc3RhdGUuY3VycmVudC5uYW1lKTtcbiAgICAgICAgICAgIGFkZFN0YXRlKHJlZi5zdGF0ZSwgJHNjb3BlLiRldmFsKHJlZi5wYXJhbUV4cHIpLCBhY3RpdmVDbGFzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gQWxsb3cgdWlTcmVmIHRvIGNvbW11bmljYXRlIHdpdGggdWlTcmVmQWN0aXZlW0VxdWFsc11cbiAgICAgIHRoaXMuJCRhZGRTdGF0ZUluZm8gPSBmdW5jdGlvbiAobmV3U3RhdGUsIG5ld1BhcmFtcykge1xuICAgICAgICAvLyB3ZSBhbHJlYWR5IGdvdCBhbiBleHBsaWNpdCBzdGF0ZSBwcm92aWRlZCBieSB1aS1zcmVmLWFjdGl2ZSwgc28gd2VcbiAgICAgICAgLy8gc2hhZG93IHRoZSBvbmUgdGhhdCBjb21lcyBmcm9tIHVpLXNyZWZcbiAgICAgICAgaWYgKGlzT2JqZWN0KHVpU3JlZkFjdGl2ZSkgJiYgc3RhdGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRlcmVnaXN0ZXIgPSBhZGRTdGF0ZShuZXdTdGF0ZSwgbmV3UGFyYW1zLCB1aVNyZWZBY3RpdmUpO1xuICAgICAgICB1cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIGRlcmVnaXN0ZXI7XG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgdXBkYXRlKTtcblxuICAgICAgZnVuY3Rpb24gYWRkU3RhdGUoc3RhdGVOYW1lLCBzdGF0ZVBhcmFtcywgYWN0aXZlQ2xhc3MpIHtcbiAgICAgICAgdmFyIHN0YXRlID0gJHN0YXRlLmdldChzdGF0ZU5hbWUsIHN0YXRlQ29udGV4dCgkZWxlbWVudCkpO1xuICAgICAgICB2YXIgc3RhdGVIYXNoID0gY3JlYXRlU3RhdGVIYXNoKHN0YXRlTmFtZSwgc3RhdGVQYXJhbXMpO1xuXG4gICAgICAgIHZhciBzdGF0ZUluZm8gPSB7XG4gICAgICAgICAgc3RhdGU6IHN0YXRlIHx8IHsgbmFtZTogc3RhdGVOYW1lIH0sXG4gICAgICAgICAgcGFyYW1zOiBzdGF0ZVBhcmFtcyxcbiAgICAgICAgICBoYXNoOiBzdGF0ZUhhc2hcbiAgICAgICAgfTtcblxuICAgICAgICBzdGF0ZXMucHVzaChzdGF0ZUluZm8pO1xuICAgICAgICBhY3RpdmVDbGFzc2VzW3N0YXRlSGFzaF0gPSBhY3RpdmVDbGFzcztcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gcmVtb3ZlU3RhdGUoKSB7XG4gICAgICAgICAgdmFyIGlkeCA9IHN0YXRlcy5pbmRleE9mKHN0YXRlSW5mbyk7XG4gICAgICAgICAgaWYgKGlkeCAhPT0gLTEpIHN0YXRlcy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fHN0cmluZ30gW3BhcmFtc11cbiAgICAgICAqIEByZXR1cm4ge3N0cmluZ31cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gY3JlYXRlU3RhdGVIYXNoKHN0YXRlLCBwYXJhbXMpIHtcbiAgICAgICAgaWYgKCFpc1N0cmluZyhzdGF0ZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3N0YXRlIHNob3VsZCBiZSBhIHN0cmluZycpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpc09iamVjdChwYXJhbXMpKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlICsgdG9Kc29uKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcGFyYW1zID0gJHNjb3BlLiRldmFsKHBhcmFtcyk7XG4gICAgICAgIGlmIChpc09iamVjdChwYXJhbXMpKSB7XG4gICAgICAgICAgcmV0dXJuIHN0YXRlICsgdG9Kc29uKHBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgICAgfVxuXG4gICAgICAvLyBVcGRhdGUgcm91dGUgc3RhdGVcbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdGF0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoYW55TWF0Y2goc3RhdGVzW2ldLnN0YXRlLCBzdGF0ZXNbaV0ucGFyYW1zKSkge1xuICAgICAgICAgICAgYWRkQ2xhc3MoJGVsZW1lbnQsIGFjdGl2ZUNsYXNzZXNbc3RhdGVzW2ldLmhhc2hdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3MoJGVsZW1lbnQsIGFjdGl2ZUNsYXNzZXNbc3RhdGVzW2ldLmhhc2hdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZXhhY3RNYXRjaChzdGF0ZXNbaV0uc3RhdGUsIHN0YXRlc1tpXS5wYXJhbXMpKSB7XG4gICAgICAgICAgICBhZGRDbGFzcygkZWxlbWVudCwgYWN0aXZlRXFDbGFzcyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKCRlbGVtZW50LCBhY3RpdmVFcUNsYXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYWRkQ2xhc3MoZWwsIGNsYXNzTmFtZSkgeyAkdGltZW91dChmdW5jdGlvbiAoKSB7IGVsLmFkZENsYXNzKGNsYXNzTmFtZSk7IH0pOyB9XG4gICAgICBmdW5jdGlvbiByZW1vdmVDbGFzcyhlbCwgY2xhc3NOYW1lKSB7IGVsLnJlbW92ZUNsYXNzKGNsYXNzTmFtZSk7IH1cbiAgICAgIGZ1bmN0aW9uIGFueU1hdGNoKHN0YXRlLCBwYXJhbXMpIHsgcmV0dXJuICRzdGF0ZS5pbmNsdWRlcyhzdGF0ZS5uYW1lLCBwYXJhbXMpOyB9XG4gICAgICBmdW5jdGlvbiBleGFjdE1hdGNoKHN0YXRlLCBwYXJhbXMpIHsgcmV0dXJuICRzdGF0ZS5pcyhzdGF0ZS5uYW1lLCBwYXJhbXMpOyB9XG5cbiAgICAgIHVwZGF0ZSgpO1xuICAgIH1dXG4gIH07XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKVxuICAuZGlyZWN0aXZlKCd1aVNyZWYnLCAkU3RhdGVSZWZEaXJlY3RpdmUpXG4gIC5kaXJlY3RpdmUoJ3VpU3JlZkFjdGl2ZScsICRTdGF0ZVJlZkFjdGl2ZURpcmVjdGl2ZSlcbiAgLmRpcmVjdGl2ZSgndWlTcmVmQWN0aXZlRXEnLCAkU3RhdGVSZWZBY3RpdmVEaXJlY3RpdmUpXG4gIC5kaXJlY3RpdmUoJ3VpU3RhdGUnLCAkU3RhdGVSZWZEeW5hbWljRGlyZWN0aXZlKTtcblxuLyoqXG4gKiBAbmdkb2MgZmlsdGVyXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZmlsdGVyOmlzU3RhdGVcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVHJhbnNsYXRlcyB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2lzICRzdGF0ZS5pcyhcInN0YXRlTmFtZVwiKX0uXG4gKi9cbiRJc1N0YXRlRmlsdGVyLiRpbmplY3QgPSBbJyRzdGF0ZSddO1xuZnVuY3Rpb24gJElzU3RhdGVGaWx0ZXIoJHN0YXRlKSB7XG4gIHZhciBpc0ZpbHRlciA9IGZ1bmN0aW9uIChzdGF0ZSwgcGFyYW1zKSB7XG4gICAgcmV0dXJuICRzdGF0ZS5pcyhzdGF0ZSwgcGFyYW1zKTtcbiAgfTtcbiAgaXNGaWx0ZXIuJHN0YXRlZnVsID0gdHJ1ZTtcbiAgcmV0dXJuIGlzRmlsdGVyO1xufVxuXG4vKipcbiAqIEBuZ2RvYyBmaWx0ZXJcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5maWx0ZXI6aW5jbHVkZWRCeVN0YXRlXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRyYW5zbGF0ZXMgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19pbmNsdWRlcyAkc3RhdGUuaW5jbHVkZXMoJ2Z1bGxPclBhcnRpYWxTdGF0ZU5hbWUnKX0uXG4gKi9cbiRJbmNsdWRlZEJ5U3RhdGVGaWx0ZXIuJGluamVjdCA9IFsnJHN0YXRlJ107XG5mdW5jdGlvbiAkSW5jbHVkZWRCeVN0YXRlRmlsdGVyKCRzdGF0ZSkge1xuICB2YXIgaW5jbHVkZXNGaWx0ZXIgPSBmdW5jdGlvbiAoc3RhdGUsIHBhcmFtcywgb3B0aW9ucykge1xuICAgIHJldHVybiAkc3RhdGUuaW5jbHVkZXMoc3RhdGUsIHBhcmFtcywgb3B0aW9ucyk7XG4gIH07XG4gIGluY2x1ZGVzRmlsdGVyLiRzdGF0ZWZ1bCA9IHRydWU7XG4gIHJldHVybiAgaW5jbHVkZXNGaWx0ZXI7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKVxuICAuZmlsdGVyKCdpc1N0YXRlJywgJElzU3RhdGVGaWx0ZXIpXG4gIC5maWx0ZXIoJ2luY2x1ZGVkQnlTdGF0ZScsICRJbmNsdWRlZEJ5U3RhdGVGaWx0ZXIpO1xufSkod2luZG93LCB3aW5kb3cuYW5ndWxhcik7IiwiaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG5pbXBvcnQgcm91dGluZyBmcm9tICcuL2NvbmZpZy9yb3V0aW5nJztcblxuaW1wb3J0IEhvbWVNb2R1bGUgZnJvbSAnLi9tb2R1bGVzL2hvbWUvJztcbmltcG9ydCBHYWxsZXJ5TW9kdWxlIGZyb20gJy4vbW9kdWxlcy9nYWxsZXJ5LydcblxudmFyIG1vZHVsZXMgPSBbSG9tZU1vZHVsZSwgR2FsbGVyeU1vZHVsZV07XG5cbnZhciBhcHAgPSBhbmd1bGFyXG4gICAgLm1vZHVsZSgnYXBwJywgbW9kdWxlcylcbiAgICAuY29uZmlnKHJvdXRpbmcpO1xuXG4iLCJyb3V0aW5nLiRpbmplY3QgPSBbJyR1cmxSb3V0ZXJQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByb3V0aW5nKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FsbGVyeUNyZWF0ZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoJHNjb3BlKSB7XG4gICAgICAgICRzY29wZS5tZXNzYWdlID0gJ2NyZWF0ZSBuZXcgZ2FsbGVyeSc7XG4gICAgfVxuXG59XG4iLCIvLyBpbXBvcnQgQVBJIGZyb20gJy4uLy4uLy4uL3NlcnZpY2VzL0FQSSc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbGxlcnlMaXN0Q29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3RvcihBUEkpIHtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gJ2hlbGxvb29vJztcblxuICAgICAgICBBUEkuZ2FsbGVyeS5xdWVyeSgpLiRwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn1cblxuR2FsbGVyeUxpc3RDb250cm9sbGVyLiRpbmplY3QgPSBbJ0FQSSddO1xuIiwiaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG5pbXBvcnQgdWlyb3V0ZXIgZnJvbSAnYW5ndWxhci11aS1yb3V0ZXInO1xuaW1wb3J0IEFQSSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9BUEknO1xuXG5pbXBvcnQgcm91dGluZyBmcm9tICcuL3JvdXRlcyc7XG5cbmltcG9ydCBHYWxsZXJ5TGlzdENvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9nYWxsZXJ5Lmxpc3QuY29udHJvbGxlcic7XG5pbXBvcnQgR2FsbGVyeUNyZWF0ZUNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9nYWxsZXJ5LmNyZWF0ZS5jb250cm9sbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgYW5ndWxhci5tb2R1bGUoJ2FwcC5nYWxsZXJ5JywgW3Vpcm91dGVyLCBBUEldKVxuICAuY29uZmlnKHJvdXRpbmcpXG4gIC5jb250cm9sbGVyKCdHYWxsZXJ5TGlzdENvbnRyb2xsZXInLCBHYWxsZXJ5TGlzdENvbnRyb2xsZXIpXG4gIC5jb250cm9sbGVyKCdHYWxsZXJ5Q3JlYXRlQ29udHJvbGxlcicsIEdhbGxlcnlDcmVhdGVDb250cm9sbGVyKVxuICAubmFtZTsiLCJyb3V0ZXMuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGVzKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdGNvbnN0IGdhbGxlcnlBYnN0cmFjdFN0YXRlID0ge1xuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdG5hbWU6ICdnYWxsZXJ5Jyxcblx0XHR1cmw6ICcvZ2FsbGVyeScsXG5cdFx0J3RlbXBsYXRlJzogJzx1aS12aWV3PjwvdWktdmlldz4nXG5cdH07XG5cblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoZ2FsbGVyeUFic3RyYWN0U3RhdGUpO1xuICBcdFxuICBcdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKHtcbiAgICBcdG5hbWU6ICdnYWxsZXJ5Lmxpc3QnLFxuICAgIFx0cGFyZW50OiBnYWxsZXJ5QWJzdHJhY3RTdGF0ZSxcbiAgICAgIFx0dXJsOiAnL2xpc3QnLFxuICAgICAgXHR0ZW1wbGF0ZTogcmVxdWlyZSgnLi92aWV3cy9nYWxsZXJ5Lmxpc3QuaHRtbCcpLFxuICAgICAgXHRjb250cm9sbGVyOiAnR2FsbGVyeUxpc3RDb250cm9sbGVyJyxcbiAgICAgIFx0Y29udHJvbGxlckFzOiAnJGNvbnRyb2xsZXInXG5cdH0pO1xuXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKHtcbiAgICBcdG5hbWU6ICdnYWxsZXJ5LmNyZWF0ZScsXG4gICAgXHRwYXJlbnQ6IGdhbGxlcnlBYnN0cmFjdFN0YXRlLFxuICAgICAgXHR1cmw6ICcvY3JlYXRlJyxcbiAgICAgIFx0dGVtcGxhdGU6IHJlcXVpcmUoJy4vdmlld3MvZ2FsbGVyeS5jcmVhdGUuaHRtbCcpLFxuICAgICAgXHRjb250cm9sbGVyOiAnR2FsbGVyeUNyZWF0ZUNvbnRyb2xsZXInLFxuICAgICAgXHRjb250cm9sbGVyQXM6ICckY29udHJvbGxlcidcblx0fSk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSBcIjxoMT57eyRjb250cm9sbGVyLm1lc3NhZ2V9fTwvaDE+c3R3w7NyeiBub3fEhVwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxoMT57eyRjb250cm9sbGVyLm1lc3NhZ2V9fTwvaDE+bGlzdGEgZ2FsZXJpaVwiO1xuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgSG9tZUNvbnRyb2xsZXIge1xuXG4gICAgY29uc3RydWN0b3IoJHNjb3BlKSB7XG4gICAgICAgICRzY29wZS5tZXNzYWdlID0gJ3dlbGNvbWUgaG9tZSc7XG4gICAgfVxuXG59XG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbmltcG9ydCB1aXJvdXRlciBmcm9tICdhbmd1bGFyLXVpLXJvdXRlcic7XG5cbmltcG9ydCByb3V0aW5nIGZyb20gJy4vcm91dGVzJztcbmltcG9ydCBIb21lQ29udHJvbGxlciBmcm9tICcuL2NvbnRyb2xsZXJzL2hvbWUuY29udHJvbGxlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGFuZ3VsYXIubW9kdWxlKCdhcHAuaG9tZScsIFt1aXJvdXRlcl0pXG4gIC5jb25maWcocm91dGluZylcbiAgLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgSG9tZUNvbnRyb2xsZXIpXG4gIC5uYW1lOyIsInJvdXRlcy4kaW5qZWN0ID0gWyckc3RhdGVQcm92aWRlciddO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByb3V0ZXMoJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICB1cmw6ICcvJyxcbiAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3ZpZXdzL2hvbWUuaHRtbCcpLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJyxcbiAgICAgIGNvbnRyb2xsZXJBczogJ2hvbWUnXG4gICAgfSk7XG59IiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzZWN0aW9uIGNsYXNzPWNvbnRlbnQtaGVhZGVyPjxoMT5EYXNoYm9hcmQgPHNtYWxsPkNvbnRyb2wgcGFuZWw8L3NtYWxsPjwvaDE+PG9sIGNsYXNzPWJyZWFkY3J1bWI+PGxpPjxhIGhyZWY9Iz48aSBjbGFzcz1cXFwiZmEgZmEtZGFzaGJvYXJkXFxcIj48L2k+IEhvbWU8L2E+PC9saT48bGkgY2xhc3M9YWN0aXZlPkRhc2hib2FyZDwvbGk+PC9vbD48L3NlY3Rpb24+PHNlY3Rpb24gY2xhc3M9Y29udGVudD48ZGl2IGNsYXNzPXJvdz48ZGl2IGNsYXNzPVxcXCJjb2wtbGctMyBjb2wteHMtNlxcXCI+PGRpdiBjbGFzcz1cXFwic21hbGwtYm94IGJnLWFxdWFcXFwiPjxkaXYgY2xhc3M9aW5uZXI+PGgzPjE1MDwvaDM+PHA+TmV3IE9yZGVyczwvcD48L2Rpdj48ZGl2IGNsYXNzPWljb24+PGkgY2xhc3M9XFxcImlvbiBpb24tYmFnXFxcIj48L2k+PC9kaXY+PGEgaHJlZj0jIGNsYXNzPXNtYWxsLWJveC1mb290ZXI+TW9yZSBpbmZvIDxpIGNsYXNzPVxcXCJmYSBmYS1hcnJvdy1jaXJjbGUtcmlnaHRcXFwiPjwvaT48L2E+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY29sLWxnLTMgY29sLXhzLTZcXFwiPjxkaXYgY2xhc3M9XFxcInNtYWxsLWJveCBiZy1ncmVlblxcXCI+PGRpdiBjbGFzcz1pbm5lcj48aDM+NTM8c3VwIHN0eWxlPVxcXCJmb250LXNpemU6IDIwcHhcXFwiPiU8L3N1cD48L2gzPjxwPkJvdW5jZSBSYXRlPC9wPjwvZGl2PjxkaXYgY2xhc3M9aWNvbj48aSBjbGFzcz1cXFwiaW9uIGlvbi1zdGF0cy1iYXJzXFxcIj48L2k+PC9kaXY+PGEgaHJlZj0jIGNsYXNzPXNtYWxsLWJveC1mb290ZXI+TW9yZSBpbmZvIDxpIGNsYXNzPVxcXCJmYSBmYS1hcnJvdy1jaXJjbGUtcmlnaHRcXFwiPjwvaT48L2E+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY29sLWxnLTMgY29sLXhzLTZcXFwiPjxkaXYgY2xhc3M9XFxcInNtYWxsLWJveCBiZy15ZWxsb3dcXFwiPjxkaXYgY2xhc3M9aW5uZXI+PGgzPjQ0PC9oMz48cD5Vc2VyIFJlZ2lzdHJhdGlvbnM8L3A+PC9kaXY+PGRpdiBjbGFzcz1pY29uPjxpIGNsYXNzPVxcXCJpb24gaW9uLXBlcnNvbi1hZGRcXFwiPjwvaT48L2Rpdj48YSBocmVmPSMgY2xhc3M9c21hbGwtYm94LWZvb3Rlcj5Nb3JlIGluZm8gPGkgY2xhc3M9XFxcImZhIGZhLWFycm93LWNpcmNsZS1yaWdodFxcXCI+PC9pPjwvYT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjb2wtbGctMyBjb2wteHMtNlxcXCI+PGRpdiBjbGFzcz1cXFwic21hbGwtYm94IGJnLXJlZFxcXCI+PGRpdiBjbGFzcz1pbm5lcj48aDM+NjU8L2gzPjxwPlVuaXF1ZSBWaXNpdG9yczwvcD48L2Rpdj48ZGl2IGNsYXNzPWljb24+PGkgY2xhc3M9XFxcImlvbiBpb24tcGllLWdyYXBoXFxcIj48L2k+PC9kaXY+PGEgaHJlZj0jIGNsYXNzPXNtYWxsLWJveC1mb290ZXI+TW9yZSBpbmZvIDxpIGNsYXNzPVxcXCJmYSBmYS1hcnJvdy1jaXJjbGUtcmlnaHRcXFwiPjwvaT48L2E+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1yb3c+PHNlY3Rpb24gY2xhc3M9XFxcImNvbC1sZy03IGNvbm5lY3RlZFNvcnRhYmxlXFxcIj48ZGl2IGNsYXNzPW5hdi10YWJzLWN1c3RvbT48dWwgY2xhc3M9XFxcIm5hdiBuYXYtdGFicyBwdWxsLXJpZ2h0XFxcIj48bGkgY2xhc3M9YWN0aXZlPjxhIGhyZWY9I3JldmVudWUtY2hhcnQgZGF0YS10b2dnbGU9dGFiPkFyZWE8L2E+PC9saT48bGk+PGEgaHJlZj0jc2FsZXMtY2hhcnQgZGF0YS10b2dnbGU9dGFiPkRvbnV0PC9hPjwvbGk+PGxpIGNsYXNzPVxcXCJwdWxsLWxlZnQgaGVhZGVyXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtaW5ib3hcXFwiPjwvaT4gU2FsZXM8L2xpPjwvdWw+PGRpdiBjbGFzcz1cXFwidGFiLWNvbnRlbnQgbm8tcGFkZGluZ1xcXCI+PGRpdiBjbGFzcz1cXFwiY2hhcnQgdGFiLXBhbmUgYWN0aXZlXFxcIiBpZD1yZXZlbnVlLWNoYXJ0IHN0eWxlPVxcXCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDogMzAwcHhcXFwiPjwvZGl2PjxkaXYgY2xhc3M9XFxcImNoYXJ0IHRhYi1wYW5lXFxcIiBpZD1zYWxlcy1jaGFydCBzdHlsZT1cXFwicG9zaXRpb246IHJlbGF0aXZlOyBoZWlnaHQ6IDMwMHB4XFxcIj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3ggYm94LXN1Y2Nlc3NcXFwiPjxkaXYgY2xhc3M9Ym94LWhlYWRlcj48aSBjbGFzcz1cXFwiZmEgZmEtY29tbWVudHMtb1xcXCI+PC9pPjxoMyBjbGFzcz1ib3gtdGl0bGU+Q2hhdDwvaDM+PGRpdiBjbGFzcz1cXFwiYm94LXRvb2xzIHB1bGwtcmlnaHRcXFwiIGRhdGEtdG9nZ2xlPXRvb2x0aXAgdGl0bGU9U3RhdHVzPjxkaXYgY2xhc3M9YnRuLWdyb3VwIGRhdGEtdG9nZ2xlPWJ0bi10b2dnbGU+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IGJ0bi1zbSBhY3RpdmVcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1zcXVhcmUgdGV4dC1ncmVlblxcXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtc3F1YXJlIHRleHQtcmVkXFxcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWJvZHkgY2hhdFxcXCIgaWQ9Y2hhdC1ib3g+PGRpdiBjbGFzcz1pdGVtPjxpbWcgc3JjPWRpc3QvaW1nL3VzZXI0LTEyOHgxMjguanBnIGFsdD1cXFwidXNlciBpbWFnZVxcXCIgY2xhc3M9b25saW5lPjxwIGNsYXNzPW1lc3NhZ2U+PGEgaHJlZj0jIGNsYXNzPW5hbWU+PHNtYWxsIGNsYXNzPVxcXCJ0ZXh0LW11dGVkIHB1bGwtcmlnaHRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDI6MTU8L3NtYWxsPiBNaWtlIERvZTwvYT4gSSB3b3VsZCBsaWtlIHRvIG1lZXQgeW91IHRvIGRpc2N1c3MgdGhlIGxhdGVzdCBuZXdzIGFib3V0IHRoZSBhcnJpdmFsIG9mIHRoZSBuZXcgdGhlbWUuIFRoZXkgc2F5IGl0IGlzIGdvaW5nIHRvIGJlIG9uZSB0aGUgYmVzdCB0aGVtZXMgb24gdGhlIG1hcmtldDwvcD48ZGl2IGNsYXNzPWF0dGFjaG1lbnQ+PGg0PkF0dGFjaG1lbnRzOjwvaDQ+PHAgY2xhc3M9ZmlsZW5hbWU+VGhlbWUtdGh1bWJuYWlsLWltYWdlLmpwZzwvcD48ZGl2IGNsYXNzPXB1bGwtcmlnaHQ+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBidG4tZmxhdFxcXCI+T3BlbjwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9aXRlbT48aW1nIHNyYz1kaXN0L2ltZy91c2VyMy0xMjh4MTI4LmpwZyBhbHQ9XFxcInVzZXIgaW1hZ2VcXFwiIGNsYXNzPW9mZmxpbmU+PHAgY2xhc3M9bWVzc2FnZT48YSBocmVmPSMgY2xhc3M9bmFtZT48c21hbGwgY2xhc3M9XFxcInRleHQtbXV0ZWQgcHVsbC1yaWdodFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gNToxNTwvc21hbGw+IEFsZXhhbmRlciBQaWVyY2U8L2E+IEkgd291bGQgbGlrZSB0byBtZWV0IHlvdSB0byBkaXNjdXNzIHRoZSBsYXRlc3QgbmV3cyBhYm91dCB0aGUgYXJyaXZhbCBvZiB0aGUgbmV3IHRoZW1lLiBUaGV5IHNheSBpdCBpcyBnb2luZyB0byBiZSBvbmUgdGhlIGJlc3QgdGhlbWVzIG9uIHRoZSBtYXJrZXQ8L3A+PC9kaXY+PGRpdiBjbGFzcz1pdGVtPjxpbWcgc3JjPWRpc3QvaW1nL3VzZXIyLTE2MHgxNjAuanBnIGFsdD1cXFwidXNlciBpbWFnZVxcXCIgY2xhc3M9b2ZmbGluZT48cCBjbGFzcz1tZXNzYWdlPjxhIGhyZWY9IyBjbGFzcz1uYW1lPjxzbWFsbCBjbGFzcz1cXFwidGV4dC1tdXRlZCBwdWxsLXJpZ2h0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiA1OjMwPC9zbWFsbD4gU3VzYW4gRG9lPC9hPiBJIHdvdWxkIGxpa2UgdG8gbWVldCB5b3UgdG8gZGlzY3VzcyB0aGUgbGF0ZXN0IG5ld3MgYWJvdXQgdGhlIGFycml2YWwgb2YgdGhlIG5ldyB0aGVtZS4gVGhleSBzYXkgaXQgaXMgZ29pbmcgdG8gYmUgb25lIHRoZSBiZXN0IHRoZW1lcyBvbiB0aGUgbWFya2V0PC9wPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9Ym94LWZvb3Rlcj48ZGl2IGNsYXNzPWlucHV0LWdyb3VwPjxpbnB1dCBjbGFzcz1mb3JtLWNvbnRyb2wgcGxhY2Vob2xkZXI9XFxcIlR5cGUgbWVzc2FnZS4uLlxcXCI+PGRpdiBjbGFzcz1pbnB1dC1ncm91cC1idG4+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtcGx1c1xcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveCBib3gtcHJpbWFyeVxcXCI+PGRpdiBjbGFzcz1ib3gtaGVhZGVyPjxpIGNsYXNzPVxcXCJpb24gaW9uLWNsaXBib2FyZFxcXCI+PC9pPjxoMyBjbGFzcz1ib3gtdGl0bGU+VG8gRG8gTGlzdDwvaDM+PGRpdiBjbGFzcz1cXFwiYm94LXRvb2xzIHB1bGwtcmlnaHRcXFwiPjx1bCBjbGFzcz1cXFwicGFnaW5hdGlvbiBwYWdpbmF0aW9uLXNtIGlubGluZVxcXCI+PGxpPjxhIGhyZWY9Iz4mbGFxdW87PC9hPjwvbGk+PGxpPjxhIGhyZWY9Iz4xPC9hPjwvbGk+PGxpPjxhIGhyZWY9Iz4yPC9hPjwvbGk+PGxpPjxhIGhyZWY9Iz4zPC9hPjwvbGk+PGxpPjxhIGhyZWY9Iz4mcmFxdW87PC9hPjwvbGk+PC91bD48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWJveC1ib2R5Pjx1bCBjbGFzcz10b2RvLWxpc3Q+PGxpPjxzcGFuIGNsYXNzPWhhbmRsZT48aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPjwvc3Bhbj4gPGlucHV0IHR5cGU9Y2hlY2tib3ggdmFsdWU9XFxcIlxcXCI+IDxzcGFuIGNsYXNzPXRleHQ+RGVzaWduIGEgbmljZSB0aGVtZTwvc3Bhbj4gPHNtYWxsIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1kYW5nZXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDIgbWluczwvc21hbGw+PGRpdiBjbGFzcz10b29scz48aSBjbGFzcz1cXFwiZmEgZmEtZWRpdFxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtdHJhc2gtb1xcXCI+PC9pPjwvZGl2PjwvbGk+PGxpPjxzcGFuIGNsYXNzPWhhbmRsZT48aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPjwvc3Bhbj4gPGlucHV0IHR5cGU9Y2hlY2tib3ggdmFsdWU9XFxcIlxcXCI+IDxzcGFuIGNsYXNzPXRleHQ+TWFrZSB0aGUgdGhlbWUgcmVzcG9uc2l2ZTwvc3Bhbj4gPHNtYWxsIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1pbmZvXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiA0IGhvdXJzPC9zbWFsbD48ZGl2IGNsYXNzPXRvb2xzPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS10cmFzaC1vXFxcIj48L2k+PC9kaXY+PC9saT48bGk+PHNwYW4gY2xhc3M9aGFuZGxlPjxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+PC9zcGFuPiA8aW5wdXQgdHlwZT1jaGVja2JveCB2YWx1ZT1cXFwiXFxcIj4gPHNwYW4gY2xhc3M9dGV4dD5MZXQgdGhlbWUgc2hpbmUgbGlrZSBhIHN0YXI8L3NwYW4+IDxzbWFsbCBjbGFzcz1cXFwibGFiZWwgbGFiZWwtd2FybmluZ1xcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gMSBkYXk8L3NtYWxsPjxkaXYgY2xhc3M9dG9vbHM+PGkgY2xhc3M9XFxcImZhIGZhLWVkaXRcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLXRyYXNoLW9cXFwiPjwvaT48L2Rpdj48L2xpPjxsaT48c3BhbiBjbGFzcz1oYW5kbGU+PGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT48L3NwYW4+IDxpbnB1dCB0eXBlPWNoZWNrYm94IHZhbHVlPVxcXCJcXFwiPiA8c3BhbiBjbGFzcz10ZXh0PkxldCB0aGVtZSBzaGluZSBsaWtlIGEgc3Rhcjwvc3Bhbj4gPHNtYWxsIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1zdWNjZXNzXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiAzIGRheXM8L3NtYWxsPjxkaXYgY2xhc3M9dG9vbHM+PGkgY2xhc3M9XFxcImZhIGZhLWVkaXRcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLXRyYXNoLW9cXFwiPjwvaT48L2Rpdj48L2xpPjxsaT48c3BhbiBjbGFzcz1oYW5kbGU+PGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT48L3NwYW4+IDxpbnB1dCB0eXBlPWNoZWNrYm94IHZhbHVlPVxcXCJcXFwiPiA8c3BhbiBjbGFzcz10ZXh0PkNoZWNrIHlvdXIgbWVzc2FnZXMgYW5kIG5vdGlmaWNhdGlvbnM8L3NwYW4+IDxzbWFsbCBjbGFzcz1cXFwibGFiZWwgbGFiZWwtcHJpbWFyeVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gMSB3ZWVrPC9zbWFsbD48ZGl2IGNsYXNzPXRvb2xzPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS10cmFzaC1vXFxcIj48L2k+PC9kaXY+PC9saT48bGk+PHNwYW4gY2xhc3M9aGFuZGxlPjxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+PC9zcGFuPiA8aW5wdXQgdHlwZT1jaGVja2JveCB2YWx1ZT1cXFwiXFxcIj4gPHNwYW4gY2xhc3M9dGV4dD5MZXQgdGhlbWUgc2hpbmUgbGlrZSBhIHN0YXI8L3NwYW4+IDxzbWFsbCBjbGFzcz1cXFwibGFiZWwgbGFiZWwtZGVmYXVsdFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gMSBtb250aDwvc21hbGw+PGRpdiBjbGFzcz10b29scz48aSBjbGFzcz1cXFwiZmEgZmEtZWRpdFxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtdHJhc2gtb1xcXCI+PC9pPjwvZGl2PjwvbGk+PC91bD48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtZm9vdGVyIGNsZWFyZml4IG5vLWJvcmRlclxcXCI+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1kZWZhdWx0IHB1bGwtcmlnaHRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1wbHVzXFxcIj48L2k+IEFkZCBpdGVtPC9idXR0b24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94IGJveC1pbmZvXFxcIj48ZGl2IGNsYXNzPWJveC1oZWFkZXI+PGkgY2xhc3M9XFxcImZhIGZhLWVudmVsb3BlXFxcIj48L2k+PGgzIGNsYXNzPWJveC10aXRsZT5RdWljayBFbWFpbDwvaDM+PGRpdiBjbGFzcz1cXFwicHVsbC1yaWdodCBib3gtdG9vbHNcXFwiPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4taW5mbyBidG4tc21cXFwiIGRhdGEtd2lkZ2V0PXJlbW92ZSBkYXRhLXRvZ2dsZT10b29sdGlwIHRpdGxlPVJlbW92ZT48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXNcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWJveC1ib2R5Pjxmb3JtIGFjdGlvbj0jIG1ldGhvZD1wb3N0PjxkaXYgY2xhc3M9Zm9ybS1ncm91cD48aW5wdXQgdHlwZT1lbWFpbCBjbGFzcz1mb3JtLWNvbnRyb2wgbmFtZT1lbWFpbHRvIHBsYWNlaG9sZGVyPVxcXCJFbWFpbCB0bzpcXFwiPjwvZGl2PjxkaXYgY2xhc3M9Zm9ybS1ncm91cD48aW5wdXQgdHlwZT10ZXh0IGNsYXNzPWZvcm0tY29udHJvbCBuYW1lPXN1YmplY3QgcGxhY2Vob2xkZXI9U3ViamVjdD48L2Rpdj48ZGl2Pjx0ZXh0YXJlYSBjbGFzcz10ZXh0YXJlYSBwbGFjZWhvbGRlcj1NZXNzYWdlIHN0eWxlPVxcXCJ3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMjVweDsgZm9udC1zaXplOiAxNHB4OyBsaW5lLWhlaWdodDogMThweDsgYm9yZGVyOiAxcHggc29saWQgI2RkZGRkZDsgcGFkZGluZzogMTBweFxcXCI+PC90ZXh0YXJlYT48L2Rpdj48L2Zvcm0+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWZvb3RlciBjbGVhcmZpeFxcXCI+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwicHVsbC1yaWdodCBidG4gYnRuLWRlZmF1bHRcXFwiIGlkPXNlbmRFbWFpbD5TZW5kIDxpIGNsYXNzPVxcXCJmYSBmYS1hcnJvdy1jaXJjbGUtcmlnaHRcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48L3NlY3Rpb24+PHNlY3Rpb24gY2xhc3M9XFxcImNvbC1sZy01IGNvbm5lY3RlZFNvcnRhYmxlXFxcIj48ZGl2IGNsYXNzPVxcXCJib3ggYm94LXNvbGlkIGJnLWxpZ2h0LWJsdWUtZ3JhZGllbnRcXFwiPjxkaXYgY2xhc3M9Ym94LWhlYWRlcj48ZGl2IGNsYXNzPVxcXCJwdWxsLXJpZ2h0IGJveC10b29sc1xcXCI+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBkYXRlcmFuZ2UgcHVsbC1yaWdodFxcXCIgZGF0YS10b2dnbGU9dG9vbHRpcCB0aXRsZT1cXFwiRGF0ZSByYW5nZVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNhbGVuZGFyXFxcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeSBidG4tc20gcHVsbC1yaWdodFxcXCIgZGF0YS13aWRnZXQ9Y29sbGFwc2UgZGF0YS10b2dnbGU9dG9vbHRpcCB0aXRsZT1Db2xsYXBzZSBzdHlsZT1cXFwibWFyZ2luLXJpZ2h0OiA1cHhcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1taW51c1xcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjxpIGNsYXNzPVxcXCJmYSBmYS1tYXAtbWFya2VyXFxcIj48L2k+PGgzIGNsYXNzPWJveC10aXRsZT5WaXNpdG9yczwvaDM+PC9kaXY+PGRpdiBjbGFzcz1ib3gtYm9keT48ZGl2IGlkPXdvcmxkLW1hcCBzdHlsZT1cXFwiaGVpZ2h0OiAyNTBweDsgd2lkdGg6IDEwMCVcXFwiPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1mb290ZXIgbm8tYm9yZGVyXFxcIj48ZGl2IGNsYXNzPXJvdz48ZGl2IGNsYXNzPVxcXCJjb2wteHMtNCB0ZXh0LWNlbnRlclxcXCIgc3R5bGU9XFxcImJvcmRlci1yaWdodDogMXB4IHNvbGlkICNmNGY0ZjRcXFwiPjxkaXYgaWQ9c3BhcmtsaW5lLTE+PC9kaXY+PGRpdiBjbGFzcz1rbm9iLWxhYmVsPlZpc2l0b3JzPC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY29sLXhzLTQgdGV4dC1jZW50ZXJcXFwiIHN0eWxlPVxcXCJib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZjRmNGY0XFxcIj48ZGl2IGlkPXNwYXJrbGluZS0yPjwvZGl2PjxkaXYgY2xhc3M9a25vYi1sYWJlbD5PbmxpbmU8L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjb2wteHMtNCB0ZXh0LWNlbnRlclxcXCI+PGRpdiBpZD1zcGFya2xpbmUtMz48L2Rpdj48ZGl2IGNsYXNzPWtub2ItbGFiZWw+RXhpc3RzPC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94IGJveC1zb2xpZCBiZy10ZWFsLWdyYWRpZW50XFxcIj48ZGl2IGNsYXNzPWJveC1oZWFkZXI+PGkgY2xhc3M9XFxcImZhIGZhLXRoXFxcIj48L2k+PGgzIGNsYXNzPWJveC10aXRsZT5TYWxlcyBHcmFwaDwvaDM+PGRpdiBjbGFzcz1cXFwiYm94LXRvb2xzIHB1bGwtcmlnaHRcXFwiPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBiZy10ZWFsIGJ0bi1zbVxcXCIgZGF0YS13aWRnZXQ9Y29sbGFwc2U+PGkgY2xhc3M9XFxcImZhIGZhLW1pbnVzXFxcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBiZy10ZWFsIGJ0bi1zbVxcXCIgZGF0YS13aWRnZXQ9cmVtb3ZlPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lc1xcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1ib2R5IGJvcmRlci1yYWRpdXMtbm9uZVxcXCI+PGRpdiBjbGFzcz1jaGFydCBpZD1saW5lLWNoYXJ0IHN0eWxlPVxcXCJoZWlnaHQ6IDI1MHB4XFxcIj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtZm9vdGVyIG5vLWJvcmRlclxcXCI+PGRpdiBjbGFzcz1yb3c+PGRpdiBjbGFzcz1cXFwiY29sLXhzLTQgdGV4dC1jZW50ZXJcXFwiIHN0eWxlPVxcXCJib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZjRmNGY0XFxcIj48aW5wdXQgdHlwZT10ZXh0IGNsYXNzPWtub2IgZGF0YS1yZWFkb25seT10cnVlIHZhbHVlPTIwIGRhdGEtd2lkdGg9NjAgZGF0YS1oZWlnaHQ9NjAgZGF0YS1mZ2NvbG9yPSMzOUNDQ0M+PGRpdiBjbGFzcz1rbm9iLWxhYmVsPk1haWwtT3JkZXJzPC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY29sLXhzLTQgdGV4dC1jZW50ZXJcXFwiIHN0eWxlPVxcXCJib3JkZXItcmlnaHQ6IDFweCBzb2xpZCAjZjRmNGY0XFxcIj48aW5wdXQgdHlwZT10ZXh0IGNsYXNzPWtub2IgZGF0YS1yZWFkb25seT10cnVlIHZhbHVlPTUwIGRhdGEtd2lkdGg9NjAgZGF0YS1oZWlnaHQ9NjAgZGF0YS1mZ2NvbG9yPSMzOUNDQ0M+PGRpdiBjbGFzcz1rbm9iLWxhYmVsPk9ubGluZTwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImNvbC14cy00IHRleHQtY2VudGVyXFxcIj48aW5wdXQgdHlwZT10ZXh0IGNsYXNzPWtub2IgZGF0YS1yZWFkb25seT10cnVlIHZhbHVlPTMwIGRhdGEtd2lkdGg9NjAgZGF0YS1oZWlnaHQ9NjAgZGF0YS1mZ2NvbG9yPSMzOUNDQ0M+PGRpdiBjbGFzcz1rbm9iLWxhYmVsPkluLVN0b3JlPC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94IGJveC1zb2xpZCBiZy1ncmVlbi1ncmFkaWVudFxcXCI+PGRpdiBjbGFzcz1ib3gtaGVhZGVyPjxpIGNsYXNzPVxcXCJmYSBmYS1jYWxlbmRhclxcXCI+PC9pPjxoMyBjbGFzcz1ib3gtdGl0bGU+Q2FsZW5kYXI8L2gzPjxkaXYgY2xhc3M9XFxcInB1bGwtcmlnaHQgYm94LXRvb2xzXFxcIj48ZGl2IGNsYXNzPWJ0bi1ncm91cD48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3MgYnRuLXNtIGRyb3Bkb3duLXRvZ2dsZVxcXCIgZGF0YS10b2dnbGU9ZHJvcGRvd24+PGkgY2xhc3M9XFxcImZhIGZhLWJhcnNcXFwiPjwvaT48L2J1dHRvbj48dWwgY2xhc3M9XFxcImRyb3Bkb3duLW1lbnUgcHVsbC1yaWdodFxcXCIgcm9sZT1tZW51PjxsaT48YSBocmVmPSM+QWRkIG5ldyBldmVudDwvYT48L2xpPjxsaT48YSBocmVmPSM+Q2xlYXIgZXZlbnRzPC9hPjwvbGk+PGxpIGNsYXNzPWRpdmlkZXI+PC9saT48bGk+PGEgaHJlZj0jPlZpZXcgY2FsZW5kYXI8L2E+PC9saT48L3VsPjwvZGl2PjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tc3VjY2VzcyBidG4tc21cXFwiIGRhdGEtd2lkZ2V0PWNvbGxhcHNlPjxpIGNsYXNzPVxcXCJmYSBmYS1taW51c1xcXCI+PC9pPjwvYnV0dG9uPiA8YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3MgYnRuLXNtXFxcIiBkYXRhLXdpZGdldD1yZW1vdmU+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzXFxcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWJvZHkgbm8tcGFkZGluZ1xcXCI+PGRpdiBpZD1jYWxlbmRhciBzdHlsZT1cXFwid2lkdGg6IDEwMCVcXFwiPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1mb290ZXIgdGV4dC1ibGFja1xcXCI+PGRpdiBjbGFzcz1yb3c+PGRpdiBjbGFzcz1jb2wtc20tNj48ZGl2IGNsYXNzPWNsZWFyZml4PjxzcGFuIGNsYXNzPXB1bGwtbGVmdD5UYXNrICMxPC9zcGFuPiA8c21hbGwgY2xhc3M9cHVsbC1yaWdodD45MCU8L3NtYWxsPjwvZGl2PjxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHhzXFxcIj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLWdyZWVuXFxcIiBzdHlsZT1cXFwid2lkdGg6IDkwJVxcXCI+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1jbGVhcmZpeD48c3BhbiBjbGFzcz1wdWxsLWxlZnQ+VGFzayAjMjwvc3Bhbj4gPHNtYWxsIGNsYXNzPXB1bGwtcmlnaHQ+NzAlPC9zbWFsbD48L2Rpdj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyB4c1xcXCI+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1ncmVlblxcXCIgc3R5bGU9XFxcIndpZHRoOiA3MCVcXFwiPjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9Y29sLXNtLTY+PGRpdiBjbGFzcz1jbGVhcmZpeD48c3BhbiBjbGFzcz1wdWxsLWxlZnQ+VGFzayAjMzwvc3Bhbj4gPHNtYWxsIGNsYXNzPXB1bGwtcmlnaHQ+NjAlPC9zbWFsbD48L2Rpdj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyB4c1xcXCI+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1ncmVlblxcXCIgc3R5bGU9XFxcIndpZHRoOiA2MCVcXFwiPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9Y2xlYXJmaXg+PHNwYW4gY2xhc3M9cHVsbC1sZWZ0PlRhc2sgIzQ8L3NwYW4+IDxzbWFsbCBjbGFzcz1wdWxsLXJpZ2h0PjQwJTwvc21hbGw+PC9kaXY+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgeHNcXFwiPjxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItZ3JlZW5cXFwiIHN0eWxlPVxcXCJ3aWR0aDogNDAlXFxcIj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L3NlY3Rpb24+PC9kaXY+PC9zZWN0aW9uPlwiO1xuIiwiaW1wb3J0IGFuZ3VsYXIgZnJvbSAnYW5ndWxhcic7XG5pbXBvcnQgbmdSZXNvdXJjZSBmcm9tICdhbmd1bGFyLXJlc291cmNlJztcblxuY2xhc3MgQVBJIHtcblxuXHRjb25zdHJ1Y3RvcigkcmVzb3VyY2UpIHtcblxuXHRcdGNvbnN0IHJlc291cmNlcyA9IHt9O1xuXHRcdGNvbnN0IHVybCA9ICdodHRwOi8vb2dyb2R6ZW5pYS5kZXYvYXBpJ1xuXG5cblx0XHRyZXNvdXJjZXMuZ2FsbGVyeSA9ICRyZXNvdXJjZSh1cmwgKyAnL2dhbGxlcnkvOmlkJyk7XG5cblx0XHRyZXR1cm4gcmVzb3VyY2VzO1xuICBcdH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBhbmd1bGFyLm1vZHVsZSgnc2VydmljZXMuQVBJJywgW25nUmVzb3VyY2VdKVxuICAuc2VydmljZSgnQVBJJywgQVBJKVxuICAubmFtZTsiXX0=

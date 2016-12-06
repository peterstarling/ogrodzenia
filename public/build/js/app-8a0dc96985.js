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
'use strict';

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
        key: 'loadGallery',
        value: function loadGallery() {
            var _this = this;

            this.API.gallery.get().$promise.then(function (response) {
                _this.galleries = response.data;
            });
        }
    }, {
        key: 'onSubmitNew',
        value: function onSubmitNew() {
            var _this2 = this;

            console.log('yo');
            this.API.gallery.save({}, this.newGallery).$promise.then(function (response) {
                _this2.loadGallery();
                _this2.newGallery = {};
            });
        }
    }, {
        key: 'onDeleteGallery',
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
module.exports = "<section class=content-header><h1>Realizacje <small>Panel zarządzania</small></h1><ol class=breadcrumb><li><a href=\"/\"><i class=\"fa fa-dashboard\"></i> Strona główna</a></li><li class=active>Realizacje</li></ol></section><section class=content><div class=row><ul class=timeline><li ng-repeat=\"gallery in $controller.galleries track by gallery.id\"><i class=\"fa fa-camera bg-purple\"></i><div class=timeline-item><span class=time><i class=\"fa fa-clock-o\"></i> {{ gallery.created_at }}</span><h3 class=timeline-header><a ui-sref=\"gallery.manage({gallery_id: gallery.id})\" ng-bind=gallery.name></a> {{ gallery.description | limitTo: 40 }}{{gallery.description.length > 40 ? '...' : ''}} <a ui-sref=\"gallery.manage({gallery_id: gallery.id})\"><i class=\"fa fa-edit\"></i></a> <a ng-click=$controller.onDeleteGallery(gallery.id)><i class=\"fa fa-remove red\"></i></a></h3><div><img ng-repeat=\"photo in gallery.photos track by photo.id\" ng-src={{photo.path.mini}} class=margin></div></div></li></ul></div><div class=row><div class=col-md-6><div class=\"box box-primary\"><form role=form ng-submit=$controller.onSubmitNew()><div class=\"box-header with-border\"><h3 class=box-title>Stwórz nową realizację</h3></div><div class=box-body><div class=form-group><label for=title>Tytuł galerii</label><input class=form-control id=title placeholder=\"Wpisz tytuł\" ng-model=$controller.newGallery.name></div><div class=form-group><textarea class=form-control ng-model=$controller.newGallery.description placeholder=\"Podaj opis realizacji\">\n                                \n                            </textarea></div></div><div class=box-footer><button type=submit class=\"btn btn-primary\">Dodaj</button></div></form></div></div></div></section>";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci1yZXNvdXJjZS9hbmd1bGFyLXJlc291cmNlLmpzIiwibm9kZV9tb2R1bGVzL2FuZ3VsYXItcmVzb3VyY2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvYW5ndWxhci11aS1yb3V0ZXIvcmVsZWFzZS9hbmd1bGFyLXVpLXJvdXRlci5qcyIsIm5vZGVfbW9kdWxlcy9uZy1maWxlLXVwbG9hZC9kaXN0L25nLWZpbGUtdXBsb2FkLWFsbC5qcyIsIm5vZGVfbW9kdWxlcy9uZy1maWxlLXVwbG9hZC9pbmRleC5qcyIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vYXBwLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9jb25maWcvaHR0cC5qcyIsInJlc291cmNlcy9hc3NldHMvanMvYWRtaW4vY29uZmlnL3JvdXRpbmcuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS9jb250cm9sbGVycy9nYWxsZXJ5LmNyZWF0ZS5jb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvY29udHJvbGxlcnMvZ2FsbGVyeS5saXN0LmNvbnRyb2xsZXIuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS9jb250cm9sbGVycy9nYWxsZXJ5Lm1hbmFnZS5jb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvaW5kZXguanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS9yb3V0ZXMuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS92aWV3cy9nYWxsZXJ5LmNyZWF0ZS5odG1sIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2dhbGxlcnkvdmlld3MvZ2FsbGVyeS5saXN0Lmh0bWwiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvZ2FsbGVyeS92aWV3cy9nYWxsZXJ5Lm1hbmFnZS5odG1sIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2hvbWUvY29udHJvbGxlcnMvaG9tZS5jb250cm9sbGVyLmpzIiwicmVzb3VyY2VzL2Fzc2V0cy9qcy9hZG1pbi9tb2R1bGVzL2hvbWUvaW5kZXguanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvaG9tZS9yb3V0ZXMuanMiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL21vZHVsZXMvaG9tZS92aWV3cy9ob21lLmh0bWwiLCJyZXNvdXJjZXMvYXNzZXRzL2pzL2FkbWluL3NlcnZpY2VzL0FQSS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvMUJBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3gxRkE7QUFDQTs7Ozs7QUNEQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFJLFVBQVUsbUNBQWQ7O0FBRUEsSUFBSSxNQUFNLGtCQUNMLE1BREssQ0FDRSxLQURGLEVBQ1MsT0FEVCxFQUVMLE1BRkssb0JBR0wsTUFISyxnQkFBVjs7Ozs7Ozs7OztrQkNQd0IsSTtBQUZ4QixLQUFLLE9BQUwsR0FBZSxDQUFDLGVBQUQsQ0FBZjs7QUFFZSxTQUFTLElBQVQsQ0FBYyxhQUFkLEVBQTZCO0FBQzNDLGVBQWMsWUFBZCxDQUEyQixJQUEzQixDQUFnQyxZQUFNO0FBQ3JDLFNBQU87QUFDTixjQUFXLGlCQUFTLE1BQVQsRUFBaUI7QUFDeEIsV0FBTyxPQUFQLENBQWUsYUFBZixHQUErQixhQUFhLE9BQU8sWUFBbkQ7O0FBRUEsV0FBTyxNQUFQO0FBQ0E7QUFMRSxHQUFQO0FBT0EsRUFSRDtBQVNBOzs7Ozs7OztrQkNWdUIsTztBQUZ4QixRQUFRLE9BQVIsR0FBa0IsQ0FBQyxvQkFBRCxFQUF1QixtQkFBdkIsQ0FBbEI7O0FBRWUsU0FBUyxPQUFULENBQWlCLGtCQUFqQixFQUFxQyxpQkFBckMsRUFBd0Q7QUFDckUsb0JBQWtCLFNBQWxCLENBQTRCLElBQTVCO0FBQ0EscUJBQW1CLFNBQW5CLENBQTZCLEdBQTdCO0FBQ0Q7Ozs7Ozs7Ozs7O0lDTG9CLHVCLEdBRWpCLGlDQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFDaEIsV0FBTyxPQUFQLEdBQWlCLG9CQUFqQjtBQUNILEM7O2tCQUpnQix1Qjs7Ozs7Ozs7Ozs7OztJQ0FBLHFCO0FBTWpCLG1DQUFZLEdBQVosRUFBaUI7QUFBQTs7QUFBQSxhQUpwQixTQUlvQixHQUpSLEVBSVE7QUFBQSxhQUZqQixVQUVpQixHQUZKLEVBRUk7O0FBQ2hCLGFBQUssR0FBTCxHQUFXLEdBQVg7O0FBRUEsYUFBSyxXQUFMO0FBQ0E7Ozs7c0NBRWE7QUFBQTs7QUFDYixpQkFBSyxHQUFMLENBQVMsT0FBVCxDQUFpQixHQUFqQixHQUF1QixRQUF2QixDQUFnQyxJQUFoQyxDQUFxQyxVQUFDLFFBQUQsRUFBYztBQUMvQyxzQkFBSyxTQUFMLEdBQWlCLFNBQVMsSUFBMUI7QUFDQSxhQUZKO0FBR0E7OztzQ0FFYTtBQUFBOztBQUNWLG9CQUFRLEdBQVIsQ0FBWSxJQUFaO0FBQ0EsaUJBQUssR0FBTCxDQUFTLE9BQVQsQ0FBaUIsSUFBakIsQ0FBc0IsRUFBdEIsRUFBMEIsS0FBSyxVQUEvQixFQUEyQyxRQUEzQyxDQUFvRCxJQUFwRCxDQUF5RCxVQUFDLFFBQUQsRUFBYztBQUNuRSx1QkFBSyxXQUFMO0FBQ0EsdUJBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNILGFBSEQ7QUFJSDs7O3dDQUVlLFMsRUFDaEI7QUFBQTs7QUFDSSxpQkFBSyxHQUFMLENBQVMsT0FBVCxDQUFpQixNQUFqQixDQUF3QixFQUFDLElBQUksU0FBTCxFQUF4QixFQUF5QyxRQUF6QyxDQUFrRCxJQUFsRCxDQUF1RCxVQUFDLFFBQUQsRUFBYztBQUNqRSx1QkFBSyxXQUFMO0FBQ0gsYUFGRDtBQUdIOzs7Ozs7a0JBL0JnQixxQjs7Ozs7Ozs7Ozs7OztJQ0FBLHVCO0FBTWpCLHFDQUFZLEdBQVosRUFBaUIsTUFBakIsRUFBeUIsWUFBekIsRUFBdUM7QUFBQTs7QUFBQSxhQUwxQyxPQUswQyxHQUxoQyxFQUtnQztBQUFBLGFBSjFDLEtBSTBDLEdBSmxDLEVBSWtDO0FBQUEsYUFIMUMsS0FHMEMsR0FIbEMsRUFHa0M7QUFBQSxhQUYxQyxRQUUwQyxHQUYvQixJQUUrQjs7QUFDdEMsYUFBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLGFBQUssV0FBTCxDQUFpQixhQUFhLFVBQTlCO0FBQ0EsYUFBSyxNQUFMLEdBQWMsTUFBZDtBQUNBOzs7O29DQUVXLFMsRUFBVztBQUFBOztBQUN0QixpQkFBSyxHQUFMLENBQVMsT0FBVCxDQUFpQixHQUFqQixDQUFxQixFQUFDLElBQUksU0FBTCxFQUFyQixFQUFzQyxRQUF0QyxDQUErQyxJQUEvQyxDQUFvRCxVQUFDLFFBQUQsRUFBYztBQUNqRSxzQkFBSyxPQUFMLEdBQWUsU0FBUyxJQUF4QjtBQUNBLGFBRkQ7QUFHQTs7O3dDQUVlO0FBQUE7O0FBQ2YsaUJBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUI7QUFDWixxQkFBUSxPQUFPLE9BQWYsaUJBQWtDLEtBQUssT0FBTCxDQUFhLEVBQS9DLFlBRFk7QUFFWixzQkFBTSxFQUFDLE9BQU8sS0FBSyxJQUFiLEVBQW1CLFNBQVMsS0FBSyxLQUFqQyxFQUZNO0FBR1oseUJBQVMsRUFBQyw0QkFBMEIsT0FBTyxZQUFsQztBQUhHLGFBQW5CLEVBSU0sSUFKTixDQUlXLFVBQUMsSUFBRCxFQUFVO0FBQ2Qsd0JBQVEsR0FBUixDQUFZLGFBQWEsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFqQixDQUF1QixJQUFwQyxHQUEyQyxzQkFBM0MsR0FBb0UsS0FBSyxJQUFyRjtBQUNBLHVCQUFLLElBQUwsR0FBWSxJQUFaO0FBQ0EsdUJBQUssUUFBTCxHQUFnQixJQUFoQjtBQUNBLHVCQUFLLEtBQUwsR0FBYSxJQUFiO0FBQ0EsdUJBQUssV0FBTCxDQUFpQixPQUFLLE9BQUwsQ0FBYSxFQUE5QjtBQUNILGFBVkosRUFVTSxVQUFVLElBQVYsRUFBZ0I7QUFDZix3QkFBUSxHQUFSLENBQVksbUJBQW1CLEtBQUssTUFBcEM7QUFDSCxhQVpKLEVBWU0sVUFBQyxHQUFELEVBQVM7QUFDUix1QkFBSyxRQUFMLEdBQWdCLFNBQVMsUUFBUSxJQUFJLE1BQVosR0FBcUIsSUFBSSxLQUFsQyxDQUFoQjtBQUNILGFBZEo7QUFlQTs7OzBDQUVpQixPLEVBQVM7QUFBQTs7QUFDMUIsaUJBQUssR0FBTCxDQUFTLE9BQVQsQ0FBaUIsTUFBakIsQ0FBd0IsRUFBQyxJQUFHLEtBQUssT0FBTCxDQUFhLEVBQWpCLEVBQXhCLEVBQThDLEVBQUMsZUFBYyxPQUFmLEVBQTlDLEVBQXVFLFFBQXZFLENBQ0MsSUFERCxDQUNNLFVBQUMsUUFBRCxFQUFjO0FBQ25CLHVCQUFLLFdBQUwsQ0FBaUIsT0FBSyxPQUFMLENBQWEsRUFBOUI7QUFDQSxhQUhEO0FBSUE7OztzQ0FFYSxPLEVBQVM7QUFBQTs7QUFDdEIsaUJBQUssR0FBTCxDQUFTLE1BQVQsQ0FBZ0IsTUFBaEIsQ0FBdUIsRUFBQyxXQUFVLEtBQUssT0FBTCxDQUFhLEVBQXhCLEVBQTRCLFNBQVEsT0FBcEMsRUFBdkIsRUFBcUUsUUFBckUsQ0FDQyxJQURELENBQ00sVUFBQyxRQUFELEVBQWM7QUFDbkIsdUJBQUssV0FBTCxDQUFpQixPQUFLLE9BQUwsQ0FBYSxFQUE5QjtBQUNBLGFBSEQ7QUFJQTs7Ozs7O2tCQWhEZ0IsdUI7Ozs7Ozs7Ozs7QUNBckI7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUdBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O2tCQUVlLGtCQUFRLE1BQVIsQ0FBZSxhQUFmLEVBQThCLGtFQUE5QixFQUNiLE1BRGEsbUJBRWIsVUFGYSxDQUVGLHVCQUZFLHlCQUdiLFVBSGEsQ0FHRix5QkFIRSwyQkFJYixVQUphLENBSUYseUJBSkUsMkJBS2IsSTs7Ozs7Ozs7OztrQkNkc0IsTTtBQUZ4QixPQUFPLE9BQVAsR0FBaUIsQ0FBQyxnQkFBRCxDQUFqQjs7QUFFZSxTQUFTLE1BQVQsQ0FBZ0IsY0FBaEIsRUFBZ0M7QUFDOUMsTUFBTSx1QkFBdUI7QUFDNUIsY0FBVSxJQURrQjtBQUU1QixVQUFNLFNBRnNCO0FBRzVCLFNBQUssVUFIdUI7QUFJNUIsZ0JBQVk7QUFKZ0IsR0FBN0I7O0FBT0EsaUJBQWUsS0FBZixDQUFxQixvQkFBckI7O0FBRUMsaUJBQWUsS0FBZixDQUFxQjtBQUNwQixVQUFNLGNBRGM7QUFFcEIsWUFBUSxvQkFGWTtBQUdwQixTQUFLLE9BSGU7QUFJcEIsY0FBVSxRQUFRLDJCQUFSLENBSlU7QUFLcEIsZ0JBQVksdUJBTFE7QUFNcEIsa0JBQWM7QUFOTSxHQUFyQjs7QUFTRCxpQkFBZSxLQUFmLENBQXFCO0FBQ25CLFVBQU0sZ0JBRGE7QUFFbkIsWUFBUSxvQkFGVztBQUduQixTQUFLLFNBSGM7QUFJbkIsY0FBVSxRQUFRLDZCQUFSLENBSlM7QUFLbkIsZ0JBQVkseUJBTE87QUFNbkIsa0JBQWM7QUFOSyxHQUFyQjs7QUFTQyxpQkFBZSxLQUFmLENBQXFCO0FBQ25CLFVBQU0sZ0JBRGE7QUFFbkIsWUFBUSxvQkFGVztBQUduQixTQUFLLHNCQUhjO0FBSW5CLGNBQVUsUUFBUSw2QkFBUixDQUpTO0FBS25CLGdCQUFZLHlCQUxPO0FBTW5CLGtCQUFjO0FBTkssR0FBckI7QUFRRDs7O0FDdENEO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBOzs7Ozs7Ozs7O0lDRHFCLGMsR0FFakIsd0JBQVksTUFBWixFQUFvQjtBQUFBOztBQUNoQixXQUFPLE9BQVAsR0FBaUIsY0FBakI7QUFDSCxDOztrQkFKZ0IsYzs7Ozs7Ozs7OztBQ0FyQjs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7Ozs7O2tCQUVlLGtCQUFRLE1BQVIsQ0FBZSxVQUFmLEVBQTJCLDJCQUEzQixFQUNaLE1BRFksbUJBRVosVUFGWSxDQUVELGdCQUZDLGtCQUdaLEk7Ozs7Ozs7Ozs7a0JDUHFCLE07QUFGeEIsT0FBTyxPQUFQLEdBQWlCLENBQUMsZ0JBQUQsQ0FBakI7O0FBRWUsU0FBUyxNQUFULENBQWdCLGNBQWhCLEVBQWdDO0FBQzdDLGlCQUNHLEtBREgsQ0FDUyxNQURULEVBQ2lCO0FBQ2IsU0FBSyxHQURRO0FBRWIsY0FBVSxRQUFRLG1CQUFSLENBRkc7QUFHYixnQkFBWSxnQkFIQztBQUliLGtCQUFjO0FBSkQsR0FEakI7QUFPRDs7O0FDVkQ7QUFDQTs7Ozs7Ozs7O0FDREE7Ozs7QUFDQTs7Ozs7Ozs7SUFFTSxHLEdBRUwsYUFBWSxTQUFaLEVBQXVCO0FBQUE7O0FBRXRCLEtBQU0sWUFBWSxFQUFsQjtBQUNBLEtBQU0sTUFBTSxPQUFPLE9BQW5COztBQUdBLFdBQVUsT0FBVixHQUFvQixVQUFVLE1BQU0sY0FBaEIsRUFBZ0MsSUFBaEMsRUFBc0M7QUFDbkQsWUFBVSxFQUFFLFFBQU8sS0FBVDtBQUR5QyxFQUF0QyxDQUFwQjs7QUFJQSxXQUFVLE1BQVYsR0FBbUIsVUFBVSxNQUFNLHFDQUFoQixDQUFuQjs7QUFFQSxRQUFPLFNBQVA7QUFDRSxDOztrQkFJVyxrQkFBUSxNQUFSLENBQWUsY0FBZixFQUErQiwyQkFBL0IsRUFDWixPQURZLENBQ0osS0FESSxFQUNHLEdBREgsRUFFWixJIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogQGxpY2Vuc2UgQW5ndWxhckpTIHYxLjUuOFxuICogKGMpIDIwMTAtMjAxNiBHb29nbGUsIEluYy4gaHR0cDovL2FuZ3VsYXJqcy5vcmdcbiAqIExpY2Vuc2U6IE1JVFxuICovXG4oZnVuY3Rpb24od2luZG93LCBhbmd1bGFyKSB7J3VzZSBzdHJpY3QnO1xuXG52YXIgJHJlc291cmNlTWluRXJyID0gYW5ndWxhci4kJG1pbkVycignJHJlc291cmNlJyk7XG5cbi8vIEhlbHBlciBmdW5jdGlvbnMgYW5kIHJlZ2V4IHRvIGxvb2t1cCBhIGRvdHRlZCBwYXRoIG9uIGFuIG9iamVjdFxuLy8gc3RvcHBpbmcgYXQgdW5kZWZpbmVkL251bGwuICBUaGUgcGF0aCBtdXN0IGJlIGNvbXBvc2VkIG9mIEFTQ0lJXG4vLyBpZGVudGlmaWVycyAoanVzdCBsaWtlICRwYXJzZSlcbnZhciBNRU1CRVJfTkFNRV9SRUdFWCA9IC9eKFxcLlthLXpBLVpfJEBdWzAtOWEtekEtWl8kQF0qKSskLztcblxuZnVuY3Rpb24gaXNWYWxpZERvdHRlZFBhdGgocGF0aCkge1xuICByZXR1cm4gKHBhdGggIT0gbnVsbCAmJiBwYXRoICE9PSAnJyAmJiBwYXRoICE9PSAnaGFzT3duUHJvcGVydHknICYmXG4gICAgICBNRU1CRVJfTkFNRV9SRUdFWC50ZXN0KCcuJyArIHBhdGgpKTtcbn1cblxuZnVuY3Rpb24gbG9va3VwRG90dGVkUGF0aChvYmosIHBhdGgpIHtcbiAgaWYgKCFpc1ZhbGlkRG90dGVkUGF0aChwYXRoKSkge1xuICAgIHRocm93ICRyZXNvdXJjZU1pbkVycignYmFkbWVtYmVyJywgJ0RvdHRlZCBtZW1iZXIgcGF0aCBcIkB7MH1cIiBpcyBpbnZhbGlkLicsIHBhdGgpO1xuICB9XG4gIHZhciBrZXlzID0gcGF0aC5zcGxpdCgnLicpO1xuICBmb3IgKHZhciBpID0gMCwgaWkgPSBrZXlzLmxlbmd0aDsgaSA8IGlpICYmIGFuZ3VsYXIuaXNEZWZpbmVkKG9iaik7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIG9iaiA9IChvYmogIT09IG51bGwpID8gb2JqW2tleV0gOiB1bmRlZmluZWQ7XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBzaGFsbG93IGNvcHkgb2YgYW4gb2JqZWN0IGFuZCBjbGVhciBvdGhlciBmaWVsZHMgZnJvbSB0aGUgZGVzdGluYXRpb25cbiAqL1xuZnVuY3Rpb24gc2hhbGxvd0NsZWFyQW5kQ29weShzcmMsIGRzdCkge1xuICBkc3QgPSBkc3QgfHwge307XG5cbiAgYW5ndWxhci5mb3JFYWNoKGRzdCwgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIGRlbGV0ZSBkc3Rba2V5XTtcbiAgfSk7XG5cbiAgZm9yICh2YXIga2V5IGluIHNyYykge1xuICAgIGlmIChzcmMuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAhKGtleS5jaGFyQXQoMCkgPT09ICckJyAmJiBrZXkuY2hhckF0KDEpID09PSAnJCcpKSB7XG4gICAgICBkc3Rba2V5XSA9IHNyY1trZXldO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkc3Q7XG59XG5cbi8qKlxuICogQG5nZG9jIG1vZHVsZVxuICogQG5hbWUgbmdSZXNvdXJjZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogIyBuZ1Jlc291cmNlXG4gKlxuICogVGhlIGBuZ1Jlc291cmNlYCBtb2R1bGUgcHJvdmlkZXMgaW50ZXJhY3Rpb24gc3VwcG9ydCB3aXRoIFJFU1RmdWwgc2VydmljZXNcbiAqIHZpYSB0aGUgJHJlc291cmNlIHNlcnZpY2UuXG4gKlxuICpcbiAqIDxkaXYgZG9jLW1vZHVsZS1jb21wb25lbnRzPVwibmdSZXNvdXJjZVwiPjwvZGl2PlxuICpcbiAqIFNlZSB7QGxpbmsgbmdSZXNvdXJjZS4kcmVzb3VyY2VQcm92aWRlcn0gYW5kIHtAbGluayBuZ1Jlc291cmNlLiRyZXNvdXJjZX0gZm9yIHVzYWdlLlxuICovXG5cbi8qKlxuICogQG5nZG9jIHByb3ZpZGVyXG4gKiBAbmFtZSAkcmVzb3VyY2VQcm92aWRlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIFVzZSBgJHJlc291cmNlUHJvdmlkZXJgIHRvIGNoYW5nZSB0aGUgZGVmYXVsdCBiZWhhdmlvciBvZiB0aGUge0BsaW5rIG5nUmVzb3VyY2UuJHJlc291cmNlfVxuICogc2VydmljZS5cbiAqXG4gKiAjIyBEZXBlbmRlbmNpZXNcbiAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdSZXNvdXJjZSB9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXG4gKlxuICovXG5cbi8qKlxuICogQG5nZG9jIHNlcnZpY2VcbiAqIEBuYW1lICRyZXNvdXJjZVxuICogQHJlcXVpcmVzICRodHRwXG4gKiBAcmVxdWlyZXMgbmcuJGxvZ1xuICogQHJlcXVpcmVzICRxXG4gKiBAcmVxdWlyZXMgbmcuJHRpbWVvdXRcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgZmFjdG9yeSB3aGljaCBjcmVhdGVzIGEgcmVzb3VyY2Ugb2JqZWN0IHRoYXQgbGV0cyB5b3UgaW50ZXJhY3Qgd2l0aFxuICogW1JFU1RmdWxdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvUmVwcmVzZW50YXRpb25hbF9TdGF0ZV9UcmFuc2Zlcikgc2VydmVyLXNpZGUgZGF0YSBzb3VyY2VzLlxuICpcbiAqIFRoZSByZXR1cm5lZCByZXNvdXJjZSBvYmplY3QgaGFzIGFjdGlvbiBtZXRob2RzIHdoaWNoIHByb3ZpZGUgaGlnaC1sZXZlbCBiZWhhdmlvcnMgd2l0aG91dFxuICogdGhlIG5lZWQgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgbG93IGxldmVsIHtAbGluayBuZy4kaHR0cCAkaHR0cH0gc2VydmljZS5cbiAqXG4gKiBSZXF1aXJlcyB0aGUge0BsaW5rIG5nUmVzb3VyY2UgYG5nUmVzb3VyY2VgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxuICpcbiAqIEJ5IGRlZmF1bHQsIHRyYWlsaW5nIHNsYXNoZXMgd2lsbCBiZSBzdHJpcHBlZCBmcm9tIHRoZSBjYWxjdWxhdGVkIFVSTHMsXG4gKiB3aGljaCBjYW4gcG9zZSBwcm9ibGVtcyB3aXRoIHNlcnZlciBiYWNrZW5kcyB0aGF0IGRvIG5vdCBleHBlY3QgdGhhdFxuICogYmVoYXZpb3IuICBUaGlzIGNhbiBiZSBkaXNhYmxlZCBieSBjb25maWd1cmluZyB0aGUgYCRyZXNvdXJjZVByb3ZpZGVyYCBsaWtlXG4gKiB0aGlzOlxuICpcbiAqIGBgYGpzXG4gICAgIGFwcC5jb25maWcoWyckcmVzb3VyY2VQcm92aWRlcicsIGZ1bmN0aW9uKCRyZXNvdXJjZVByb3ZpZGVyKSB7XG4gICAgICAgLy8gRG9uJ3Qgc3RyaXAgdHJhaWxpbmcgc2xhc2hlcyBmcm9tIGNhbGN1bGF0ZWQgVVJMc1xuICAgICAgICRyZXNvdXJjZVByb3ZpZGVyLmRlZmF1bHRzLnN0cmlwVHJhaWxpbmdTbGFzaGVzID0gZmFsc2U7XG4gICAgIH1dKTtcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgQSBwYXJhbWV0ZXJpemVkIFVSTCB0ZW1wbGF0ZSB3aXRoIHBhcmFtZXRlcnMgcHJlZml4ZWQgYnkgYDpgIGFzIGluXG4gKiAgIGAvdXNlci86dXNlcm5hbWVgLiBJZiB5b3UgYXJlIHVzaW5nIGEgVVJMIHdpdGggYSBwb3J0IG51bWJlciAoZS5nLlxuICogICBgaHR0cDovL2V4YW1wbGUuY29tOjgwODAvYXBpYCksIGl0IHdpbGwgYmUgcmVzcGVjdGVkLlxuICpcbiAqICAgSWYgeW91IGFyZSB1c2luZyBhIHVybCB3aXRoIGEgc3VmZml4LCBqdXN0IGFkZCB0aGUgc3VmZml4LCBsaWtlIHRoaXM6XG4gKiAgIGAkcmVzb3VyY2UoJ2h0dHA6Ly9leGFtcGxlLmNvbS9yZXNvdXJjZS5qc29uJylgIG9yIGAkcmVzb3VyY2UoJ2h0dHA6Ly9leGFtcGxlLmNvbS86aWQuanNvbicpYFxuICogICBvciBldmVuIGAkcmVzb3VyY2UoJ2h0dHA6Ly9leGFtcGxlLmNvbS9yZXNvdXJjZS86cmVzb3VyY2VfaWQuOmZvcm1hdCcpYFxuICogICBJZiB0aGUgcGFyYW1ldGVyIGJlZm9yZSB0aGUgc3VmZml4IGlzIGVtcHR5LCA6cmVzb3VyY2VfaWQgaW4gdGhpcyBjYXNlLCB0aGVuIHRoZSBgLy5gIHdpbGwgYmVcbiAqICAgY29sbGFwc2VkIGRvd24gdG8gYSBzaW5nbGUgYC5gLiAgSWYgeW91IG5lZWQgdGhpcyBzZXF1ZW5jZSB0byBhcHBlYXIgYW5kIG5vdCBjb2xsYXBzZSB0aGVuIHlvdVxuICogICBjYW4gZXNjYXBlIGl0IHdpdGggYC9cXC5gLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0PX0gcGFyYW1EZWZhdWx0cyBEZWZhdWx0IHZhbHVlcyBmb3IgYHVybGAgcGFyYW1ldGVycy4gVGhlc2UgY2FuIGJlIG92ZXJyaWRkZW4gaW5cbiAqICAgYGFjdGlvbnNgIG1ldGhvZHMuIElmIGEgcGFyYW1ldGVyIHZhbHVlIGlzIGEgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIGV2ZXJ5IHRpbWVcbiAqICAgYSBwYXJhbSB2YWx1ZSBuZWVkcyB0byBiZSBvYnRhaW5lZCBmb3IgYSByZXF1ZXN0ICh1bmxlc3MgdGhlIHBhcmFtIHdhcyBvdmVycmlkZGVuKS4gVGhlIGZ1bmN0aW9uXG4gKiAgIHdpbGwgYmUgcGFzc2VkIHRoZSBjdXJyZW50IGRhdGEgdmFsdWUgYXMgYW4gYXJndW1lbnQuXG4gKlxuICogICBFYWNoIGtleSB2YWx1ZSBpbiB0aGUgcGFyYW1ldGVyIG9iamVjdCBpcyBmaXJzdCBib3VuZCB0byB1cmwgdGVtcGxhdGUgaWYgcHJlc2VudCBhbmQgdGhlbiBhbnlcbiAqICAgZXhjZXNzIGtleXMgYXJlIGFwcGVuZGVkIHRvIHRoZSB1cmwgc2VhcmNoIHF1ZXJ5IGFmdGVyIHRoZSBgP2AuXG4gKlxuICogICBHaXZlbiBhIHRlbXBsYXRlIGAvcGF0aC86dmVyYmAgYW5kIHBhcmFtZXRlciBge3ZlcmI6J2dyZWV0Jywgc2FsdXRhdGlvbjonSGVsbG8nfWAgcmVzdWx0cyBpblxuICogICBVUkwgYC9wYXRoL2dyZWV0P3NhbHV0YXRpb249SGVsbG9gLlxuICpcbiAqICAgSWYgdGhlIHBhcmFtZXRlciB2YWx1ZSBpcyBwcmVmaXhlZCB3aXRoIGBAYCwgdGhlbiB0aGUgdmFsdWUgZm9yIHRoYXQgcGFyYW1ldGVyIHdpbGwgYmVcbiAqICAgZXh0cmFjdGVkIGZyb20gdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgb24gdGhlIGBkYXRhYCBvYmplY3QgKHByb3ZpZGVkIHdoZW4gY2FsbGluZyBhXG4gKiAgIFwibm9uLUdFVFwiIGFjdGlvbiBtZXRob2QpLlxuICogICBGb3IgZXhhbXBsZSwgaWYgdGhlIGBkZWZhdWx0UGFyYW1gIG9iamVjdCBpcyBge3NvbWVQYXJhbTogJ0Bzb21lUHJvcCd9YCB0aGVuIHRoZSB2YWx1ZSBvZlxuICogICBgc29tZVBhcmFtYCB3aWxsIGJlIGBkYXRhLnNvbWVQcm9wYC5cbiAqICAgTm90ZSB0aGF0IHRoZSBwYXJhbWV0ZXIgd2lsbCBiZSBpZ25vcmVkLCB3aGVuIGNhbGxpbmcgYSBcIkdFVFwiIGFjdGlvbiBtZXRob2QgKGkuZS4gYW4gYWN0aW9uXG4gKiAgIG1ldGhvZCB0aGF0IGRvZXMgbm90IGFjY2VwdCBhIHJlcXVlc3QgYm9keSlcbiAqXG4gKiBAcGFyYW0ge09iamVjdC48T2JqZWN0Pj19IGFjdGlvbnMgSGFzaCB3aXRoIGRlY2xhcmF0aW9uIG9mIGN1c3RvbSBhY3Rpb25zIHRoYXQgc2hvdWxkIGV4dGVuZFxuICogICB0aGUgZGVmYXVsdCBzZXQgb2YgcmVzb3VyY2UgYWN0aW9ucy4gVGhlIGRlY2xhcmF0aW9uIHNob3VsZCBiZSBjcmVhdGVkIGluIHRoZSBmb3JtYXQgb2Yge0BsaW5rXG4gKiAgIG5nLiRodHRwI3VzYWdlICRodHRwLmNvbmZpZ306XG4gKlxuICogICAgICAge2FjdGlvbjE6IHttZXRob2Q6PywgcGFyYW1zOj8sIGlzQXJyYXk6PywgaGVhZGVyczo/LCAuLi59LFxuICogICAgICAgIGFjdGlvbjI6IHttZXRob2Q6PywgcGFyYW1zOj8sIGlzQXJyYXk6PywgaGVhZGVyczo/LCAuLi59LFxuICogICAgICAgIC4uLn1cbiAqXG4gKiAgIFdoZXJlOlxuICpcbiAqICAgLSAqKmBhY3Rpb25gKiog4oCTIHtzdHJpbmd9IOKAkyBUaGUgbmFtZSBvZiBhY3Rpb24uIFRoaXMgbmFtZSBiZWNvbWVzIHRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgb25cbiAqICAgICB5b3VyIHJlc291cmNlIG9iamVjdC5cbiAqICAgLSAqKmBtZXRob2RgKiog4oCTIHtzdHJpbmd9IOKAkyBDYXNlIGluc2Vuc2l0aXZlIEhUVFAgbWV0aG9kIChlLmcuIGBHRVRgLCBgUE9TVGAsIGBQVVRgLFxuICogICAgIGBERUxFVEVgLCBgSlNPTlBgLCBldGMpLlxuICogICAtICoqYHBhcmFtc2AqKiDigJMge09iamVjdD19IOKAkyBPcHRpb25hbCBzZXQgb2YgcHJlLWJvdW5kIHBhcmFtZXRlcnMgZm9yIHRoaXMgYWN0aW9uLiBJZiBhbnkgb2ZcbiAqICAgICB0aGUgcGFyYW1ldGVyIHZhbHVlIGlzIGEgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIGV2ZXJ5IHRpbWUgd2hlbiBhIHBhcmFtIHZhbHVlIG5lZWRzIHRvXG4gKiAgICAgYmUgb2J0YWluZWQgZm9yIGEgcmVxdWVzdCAodW5sZXNzIHRoZSBwYXJhbSB3YXMgb3ZlcnJpZGRlbikuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIHBhc3NlZCB0aGVcbiAqICAgICBjdXJyZW50IGRhdGEgdmFsdWUgYXMgYW4gYXJndW1lbnQuXG4gKiAgIC0gKipgdXJsYCoqIOKAkyB7c3RyaW5nfSDigJMgYWN0aW9uIHNwZWNpZmljIGB1cmxgIG92ZXJyaWRlLiBUaGUgdXJsIHRlbXBsYXRpbmcgaXMgc3VwcG9ydGVkIGp1c3RcbiAqICAgICBsaWtlIGZvciB0aGUgcmVzb3VyY2UtbGV2ZWwgdXJscy5cbiAqICAgLSAqKmBpc0FycmF5YCoqIOKAkyB7Ym9vbGVhbj19IOKAkyBJZiB0cnVlIHRoZW4gdGhlIHJldHVybmVkIG9iamVjdCBmb3IgdGhpcyBhY3Rpb24gaXMgYW4gYXJyYXksXG4gKiAgICAgc2VlIGByZXR1cm5zYCBzZWN0aW9uLlxuICogICAtICoqYHRyYW5zZm9ybVJlcXVlc3RgKiog4oCTXG4gKiAgICAgYHtmdW5jdGlvbihkYXRhLCBoZWFkZXJzR2V0dGVyKXxBcnJheS48ZnVuY3Rpb24oZGF0YSwgaGVhZGVyc0dldHRlcik+fWAg4oCTXG4gKiAgICAgdHJhbnNmb3JtIGZ1bmN0aW9uIG9yIGFuIGFycmF5IG9mIHN1Y2ggZnVuY3Rpb25zLiBUaGUgdHJhbnNmb3JtIGZ1bmN0aW9uIHRha2VzIHRoZSBodHRwXG4gKiAgICAgcmVxdWVzdCBib2R5IGFuZCBoZWFkZXJzIGFuZCByZXR1cm5zIGl0cyB0cmFuc2Zvcm1lZCAodHlwaWNhbGx5IHNlcmlhbGl6ZWQpIHZlcnNpb24uXG4gKiAgICAgQnkgZGVmYXVsdCwgdHJhbnNmb3JtUmVxdWVzdCB3aWxsIGNvbnRhaW4gb25lIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGlmIHRoZSByZXF1ZXN0IGRhdGEgaXNcbiAqICAgICBhbiBvYmplY3QgYW5kIHNlcmlhbGl6ZXMgdG8gdXNpbmcgYGFuZ3VsYXIudG9Kc29uYC4gVG8gcHJldmVudCB0aGlzIGJlaGF2aW9yLCBzZXRcbiAqICAgICBgdHJhbnNmb3JtUmVxdWVzdGAgdG8gYW4gZW1wdHkgYXJyYXk6IGB0cmFuc2Zvcm1SZXF1ZXN0OiBbXWBcbiAqICAgLSAqKmB0cmFuc2Zvcm1SZXNwb25zZWAqKiDigJNcbiAqICAgICBge2Z1bmN0aW9uKGRhdGEsIGhlYWRlcnNHZXR0ZXIpfEFycmF5LjxmdW5jdGlvbihkYXRhLCBoZWFkZXJzR2V0dGVyKT59YCDigJNcbiAqICAgICB0cmFuc2Zvcm0gZnVuY3Rpb24gb3IgYW4gYXJyYXkgb2Ygc3VjaCBmdW5jdGlvbnMuIFRoZSB0cmFuc2Zvcm0gZnVuY3Rpb24gdGFrZXMgdGhlIGh0dHBcbiAqICAgICByZXNwb25zZSBib2R5IGFuZCBoZWFkZXJzIGFuZCByZXR1cm5zIGl0cyB0cmFuc2Zvcm1lZCAodHlwaWNhbGx5IGRlc2VyaWFsaXplZCkgdmVyc2lvbi5cbiAqICAgICBCeSBkZWZhdWx0LCB0cmFuc2Zvcm1SZXNwb25zZSB3aWxsIGNvbnRhaW4gb25lIGZ1bmN0aW9uIHRoYXQgY2hlY2tzIGlmIHRoZSByZXNwb25zZSBsb29rc1xuICogICAgIGxpa2UgYSBKU09OIHN0cmluZyBhbmQgZGVzZXJpYWxpemVzIGl0IHVzaW5nIGBhbmd1bGFyLmZyb21Kc29uYC4gVG8gcHJldmVudCB0aGlzIGJlaGF2aW9yLFxuICogICAgIHNldCBgdHJhbnNmb3JtUmVzcG9uc2VgIHRvIGFuIGVtcHR5IGFycmF5OiBgdHJhbnNmb3JtUmVzcG9uc2U6IFtdYFxuICogICAtICoqYGNhY2hlYCoqIOKAkyBge2Jvb2xlYW58Q2FjaGV9YCDigJMgSWYgdHJ1ZSwgYSBkZWZhdWx0ICRodHRwIGNhY2hlIHdpbGwgYmUgdXNlZCB0byBjYWNoZSB0aGVcbiAqICAgICBHRVQgcmVxdWVzdCwgb3RoZXJ3aXNlIGlmIGEgY2FjaGUgaW5zdGFuY2UgYnVpbHQgd2l0aFxuICogICAgIHtAbGluayBuZy4kY2FjaGVGYWN0b3J5ICRjYWNoZUZhY3Rvcnl9LCB0aGlzIGNhY2hlIHdpbGwgYmUgdXNlZCBmb3JcbiAqICAgICBjYWNoaW5nLlxuICogICAtICoqYHRpbWVvdXRgKiog4oCTIGB7bnVtYmVyfWAg4oCTIHRpbWVvdXQgaW4gbWlsbGlzZWNvbmRzLjxiciAvPlxuICogICAgICoqTm90ZToqKiBJbiBjb250cmFzdCB0byB7QGxpbmsgbmcuJGh0dHAjdXNhZ2UgJGh0dHAuY29uZmlnfSwge0BsaW5rIG5nLiRxIHByb21pc2VzfSBhcmVcbiAqICAgICAqKm5vdCoqIHN1cHBvcnRlZCBpbiAkcmVzb3VyY2UsIGJlY2F1c2UgdGhlIHNhbWUgdmFsdWUgd291bGQgYmUgdXNlZCBmb3IgbXVsdGlwbGUgcmVxdWVzdHMuXG4gKiAgICAgSWYgeW91IGFyZSBsb29raW5nIGZvciBhIHdheSB0byBjYW5jZWwgcmVxdWVzdHMsIHlvdSBzaG91bGQgdXNlIHRoZSBgY2FuY2VsbGFibGVgIG9wdGlvbi5cbiAqICAgLSAqKmBjYW5jZWxsYWJsZWAqKiDigJMgYHtib29sZWFufWAg4oCTIGlmIHNldCB0byB0cnVlLCB0aGUgcmVxdWVzdCBtYWRlIGJ5IGEgXCJub24taW5zdGFuY2VcIiBjYWxsXG4gKiAgICAgd2lsbCBiZSBjYW5jZWxsZWQgKGlmIG5vdCBhbHJlYWR5IGNvbXBsZXRlZCkgYnkgY2FsbGluZyBgJGNhbmNlbFJlcXVlc3QoKWAgb24gdGhlIGNhbGwnc1xuICogICAgIHJldHVybiB2YWx1ZS4gQ2FsbGluZyBgJGNhbmNlbFJlcXVlc3QoKWAgZm9yIGEgbm9uLWNhbmNlbGxhYmxlIG9yIGFuIGFscmVhZHlcbiAqICAgICBjb21wbGV0ZWQvY2FuY2VsbGVkIHJlcXVlc3Qgd2lsbCBoYXZlIG5vIGVmZmVjdC48YnIgLz5cbiAqICAgLSAqKmB3aXRoQ3JlZGVudGlhbHNgKiogLSBge2Jvb2xlYW59YCAtIHdoZXRoZXIgdG8gc2V0IHRoZSBgd2l0aENyZWRlbnRpYWxzYCBmbGFnIG9uIHRoZVxuICogICAgIFhIUiBvYmplY3QuIFNlZVxuICogICAgIFtyZXF1ZXN0cyB3aXRoIGNyZWRlbnRpYWxzXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9odHRwX2FjY2Vzc19jb250cm9sI3NlY3Rpb25fNSlcbiAqICAgICBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cbiAqICAgLSAqKmByZXNwb25zZVR5cGVgKiogLSBge3N0cmluZ31gIC0gc2VlXG4gKiAgICAgW3JlcXVlc3RUeXBlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0RPTS9YTUxIdHRwUmVxdWVzdCNyZXNwb25zZVR5cGUpLlxuICogICAtICoqYGludGVyY2VwdG9yYCoqIC0gYHtPYmplY3Q9fWAgLSBUaGUgaW50ZXJjZXB0b3Igb2JqZWN0IGhhcyB0d28gb3B0aW9uYWwgbWV0aG9kcyAtXG4gKiAgICAgYHJlc3BvbnNlYCBhbmQgYHJlc3BvbnNlRXJyb3JgLiBCb3RoIGByZXNwb25zZWAgYW5kIGByZXNwb25zZUVycm9yYCBpbnRlcmNlcHRvcnMgZ2V0IGNhbGxlZFxuICogICAgIHdpdGggYGh0dHAgcmVzcG9uc2VgIG9iamVjdC4gU2VlIHtAbGluayBuZy4kaHR0cCAkaHR0cCBpbnRlcmNlcHRvcnN9LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIEhhc2ggd2l0aCBjdXN0b20gc2V0dGluZ3MgdGhhdCBzaG91bGQgZXh0ZW5kIHRoZVxuICogICBkZWZhdWx0IGAkcmVzb3VyY2VQcm92aWRlcmAgYmVoYXZpb3IuICBUaGUgc3VwcG9ydGVkIG9wdGlvbnMgYXJlOlxuICpcbiAqICAgLSAqKmBzdHJpcFRyYWlsaW5nU2xhc2hlc2AqKiDigJMge2Jvb2xlYW59IOKAkyBJZiB0cnVlIHRoZW4gdGhlIHRyYWlsaW5nXG4gKiAgIHNsYXNoZXMgZnJvbSBhbnkgY2FsY3VsYXRlZCBVUkwgd2lsbCBiZSBzdHJpcHBlZC4gKERlZmF1bHRzIHRvIHRydWUuKVxuICogICAtICoqYGNhbmNlbGxhYmxlYCoqIOKAkyB7Ym9vbGVhbn0g4oCTIElmIHRydWUsIHRoZSByZXF1ZXN0IG1hZGUgYnkgYSBcIm5vbi1pbnN0YW5jZVwiIGNhbGwgd2lsbCBiZVxuICogICBjYW5jZWxsZWQgKGlmIG5vdCBhbHJlYWR5IGNvbXBsZXRlZCkgYnkgY2FsbGluZyBgJGNhbmNlbFJlcXVlc3QoKWAgb24gdGhlIGNhbGwncyByZXR1cm4gdmFsdWUuXG4gKiAgIFRoaXMgY2FuIGJlIG92ZXJ3cml0dGVuIHBlciBhY3Rpb24uIChEZWZhdWx0cyB0byBmYWxzZS4pXG4gKlxuICogQHJldHVybnMge09iamVjdH0gQSByZXNvdXJjZSBcImNsYXNzXCIgb2JqZWN0IHdpdGggbWV0aG9kcyBmb3IgdGhlIGRlZmF1bHQgc2V0IG9mIHJlc291cmNlIGFjdGlvbnNcbiAqICAgb3B0aW9uYWxseSBleHRlbmRlZCB3aXRoIGN1c3RvbSBgYWN0aW9uc2AuIFRoZSBkZWZhdWx0IHNldCBjb250YWlucyB0aGVzZSBhY3Rpb25zOlxuICogICBgYGBqc1xuICogICB7ICdnZXQnOiAgICB7bWV0aG9kOidHRVQnfSxcbiAqICAgICAnc2F2ZSc6ICAge21ldGhvZDonUE9TVCd9LFxuICogICAgICdxdWVyeSc6ICB7bWV0aG9kOidHRVQnLCBpc0FycmF5OnRydWV9LFxuICogICAgICdyZW1vdmUnOiB7bWV0aG9kOidERUxFVEUnfSxcbiAqICAgICAnZGVsZXRlJzoge21ldGhvZDonREVMRVRFJ30gfTtcbiAqICAgYGBgXG4gKlxuICogICBDYWxsaW5nIHRoZXNlIG1ldGhvZHMgaW52b2tlIGFuIHtAbGluayBuZy4kaHR0cH0gd2l0aCB0aGUgc3BlY2lmaWVkIGh0dHAgbWV0aG9kLFxuICogICBkZXN0aW5hdGlvbiBhbmQgcGFyYW1ldGVycy4gV2hlbiB0aGUgZGF0YSBpcyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgdGhlbiB0aGUgb2JqZWN0IGlzIGFuXG4gKiAgIGluc3RhbmNlIG9mIHRoZSByZXNvdXJjZSBjbGFzcy4gVGhlIGFjdGlvbnMgYHNhdmVgLCBgcmVtb3ZlYCBhbmQgYGRlbGV0ZWAgYXJlIGF2YWlsYWJsZSBvbiBpdFxuICogICBhcyAgbWV0aG9kcyB3aXRoIHRoZSBgJGAgcHJlZml4LiBUaGlzIGFsbG93cyB5b3UgdG8gZWFzaWx5IHBlcmZvcm0gQ1JVRCBvcGVyYXRpb25zIChjcmVhdGUsXG4gKiAgIHJlYWQsIHVwZGF0ZSwgZGVsZXRlKSBvbiBzZXJ2ZXItc2lkZSBkYXRhIGxpa2UgdGhpczpcbiAqICAgYGBganNcbiAqICAgdmFyIFVzZXIgPSAkcmVzb3VyY2UoJy91c2VyLzp1c2VySWQnLCB7dXNlcklkOidAaWQnfSk7XG4gKiAgIHZhciB1c2VyID0gVXNlci5nZXQoe3VzZXJJZDoxMjN9LCBmdW5jdGlvbigpIHtcbiAqICAgICB1c2VyLmFiYyA9IHRydWU7XG4gKiAgICAgdXNlci4kc2F2ZSgpO1xuICogICB9KTtcbiAqICAgYGBgXG4gKlxuICogICBJdCBpcyBpbXBvcnRhbnQgdG8gcmVhbGl6ZSB0aGF0IGludm9raW5nIGEgJHJlc291cmNlIG9iamVjdCBtZXRob2QgaW1tZWRpYXRlbHkgcmV0dXJucyBhblxuICogICBlbXB0eSByZWZlcmVuY2UgKG9iamVjdCBvciBhcnJheSBkZXBlbmRpbmcgb24gYGlzQXJyYXlgKS4gT25jZSB0aGUgZGF0YSBpcyByZXR1cm5lZCBmcm9tIHRoZVxuICogICBzZXJ2ZXIgdGhlIGV4aXN0aW5nIHJlZmVyZW5jZSBpcyBwb3B1bGF0ZWQgd2l0aCB0aGUgYWN0dWFsIGRhdGEuIFRoaXMgaXMgYSB1c2VmdWwgdHJpY2sgc2luY2VcbiAqICAgdXN1YWxseSB0aGUgcmVzb3VyY2UgaXMgYXNzaWduZWQgdG8gYSBtb2RlbCB3aGljaCBpcyB0aGVuIHJlbmRlcmVkIGJ5IHRoZSB2aWV3LiBIYXZpbmcgYW4gZW1wdHlcbiAqICAgb2JqZWN0IHJlc3VsdHMgaW4gbm8gcmVuZGVyaW5nLCBvbmNlIHRoZSBkYXRhIGFycml2ZXMgZnJvbSB0aGUgc2VydmVyIHRoZW4gdGhlIG9iamVjdCBpc1xuICogICBwb3B1bGF0ZWQgd2l0aCB0aGUgZGF0YSBhbmQgdGhlIHZpZXcgYXV0b21hdGljYWxseSByZS1yZW5kZXJzIGl0c2VsZiBzaG93aW5nIHRoZSBuZXcgZGF0YS4gVGhpc1xuICogICBtZWFucyB0aGF0IGluIG1vc3QgY2FzZXMgb25lIG5ldmVyIGhhcyB0byB3cml0ZSBhIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciB0aGUgYWN0aW9uIG1ldGhvZHMuXG4gKlxuICogICBUaGUgYWN0aW9uIG1ldGhvZHMgb24gdGhlIGNsYXNzIG9iamVjdCBvciBpbnN0YW5jZSBvYmplY3QgY2FuIGJlIGludm9rZWQgd2l0aCB0aGUgZm9sbG93aW5nXG4gKiAgIHBhcmFtZXRlcnM6XG4gKlxuICogICAtIEhUVFAgR0VUIFwiY2xhc3NcIiBhY3Rpb25zOiBgUmVzb3VyY2UuYWN0aW9uKFtwYXJhbWV0ZXJzXSwgW3N1Y2Nlc3NdLCBbZXJyb3JdKWBcbiAqICAgLSBub24tR0VUIFwiY2xhc3NcIiBhY3Rpb25zOiBgUmVzb3VyY2UuYWN0aW9uKFtwYXJhbWV0ZXJzXSwgcG9zdERhdGEsIFtzdWNjZXNzXSwgW2Vycm9yXSlgXG4gKiAgIC0gbm9uLUdFVCBpbnN0YW5jZSBhY3Rpb25zOiAgYGluc3RhbmNlLiRhY3Rpb24oW3BhcmFtZXRlcnNdLCBbc3VjY2Vzc10sIFtlcnJvcl0pYFxuICpcbiAqXG4gKiAgIFN1Y2Nlc3MgY2FsbGJhY2sgaXMgY2FsbGVkIHdpdGggKHZhbHVlLCByZXNwb25zZUhlYWRlcnMpIGFyZ3VtZW50cywgd2hlcmUgdGhlIHZhbHVlIGlzXG4gKiAgIHRoZSBwb3B1bGF0ZWQgcmVzb3VyY2UgaW5zdGFuY2Ugb3IgY29sbGVjdGlvbiBvYmplY3QuIFRoZSBlcnJvciBjYWxsYmFjayBpcyBjYWxsZWRcbiAqICAgd2l0aCAoaHR0cFJlc3BvbnNlKSBhcmd1bWVudC5cbiAqXG4gKiAgIENsYXNzIGFjdGlvbnMgcmV0dXJuIGVtcHR5IGluc3RhbmNlICh3aXRoIGFkZGl0aW9uYWwgcHJvcGVydGllcyBiZWxvdykuXG4gKiAgIEluc3RhbmNlIGFjdGlvbnMgcmV0dXJuIHByb21pc2Ugb2YgdGhlIGFjdGlvbi5cbiAqXG4gKiAgIFRoZSBSZXNvdXJjZSBpbnN0YW5jZXMgYW5kIGNvbGxlY3Rpb25zIGhhdmUgdGhlc2UgYWRkaXRpb25hbCBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBgJHByb21pc2VgOiB0aGUge0BsaW5rIG5nLiRxIHByb21pc2V9IG9mIHRoZSBvcmlnaW5hbCBzZXJ2ZXIgaW50ZXJhY3Rpb24gdGhhdCBjcmVhdGVkIHRoaXNcbiAqICAgICBpbnN0YW5jZSBvciBjb2xsZWN0aW9uLlxuICpcbiAqICAgICBPbiBzdWNjZXNzLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSBzYW1lIHJlc291cmNlIGluc3RhbmNlIG9yIGNvbGxlY3Rpb24gb2JqZWN0LFxuICogICAgIHVwZGF0ZWQgd2l0aCBkYXRhIGZyb20gc2VydmVyLiBUaGlzIG1ha2VzIGl0IGVhc3kgdG8gdXNlIGluXG4gKiAgICAge0BsaW5rIG5nUm91dGUuJHJvdXRlUHJvdmlkZXIgcmVzb2x2ZSBzZWN0aW9uIG9mICRyb3V0ZVByb3ZpZGVyLndoZW4oKX0gdG8gZGVmZXIgdmlld1xuICogICAgIHJlbmRlcmluZyB1bnRpbCB0aGUgcmVzb3VyY2UocykgYXJlIGxvYWRlZC5cbiAqXG4gKiAgICAgT24gZmFpbHVyZSwgdGhlIHByb21pc2UgaXMgcmVqZWN0ZWQgd2l0aCB0aGUge0BsaW5rIG5nLiRodHRwIGh0dHAgcmVzcG9uc2V9IG9iamVjdCwgd2l0aG91dFxuICogICAgIHRoZSBgcmVzb3VyY2VgIHByb3BlcnR5LlxuICpcbiAqICAgICBJZiBhbiBpbnRlcmNlcHRvciBvYmplY3Qgd2FzIHByb3ZpZGVkLCB0aGUgcHJvbWlzZSB3aWxsIGluc3RlYWQgYmUgcmVzb2x2ZWQgd2l0aCB0aGUgdmFsdWVcbiAqICAgICByZXR1cm5lZCBieSB0aGUgaW50ZXJjZXB0b3IuXG4gKlxuICogICAtIGAkcmVzb2x2ZWRgOiBgdHJ1ZWAgYWZ0ZXIgZmlyc3Qgc2VydmVyIGludGVyYWN0aW9uIGlzIGNvbXBsZXRlZCAoZWl0aGVyIHdpdGggc3VjY2VzcyBvclxuICogICAgICByZWplY3Rpb24pLCBgZmFsc2VgIGJlZm9yZSB0aGF0LiBLbm93aW5nIGlmIHRoZSBSZXNvdXJjZSBoYXMgYmVlbiByZXNvbHZlZCBpcyB1c2VmdWwgaW5cbiAqICAgICAgZGF0YS1iaW5kaW5nLlxuICpcbiAqICAgVGhlIFJlc291cmNlIGluc3RhbmNlcyBhbmQgY29sbGVjdGlvbnMgaGF2ZSB0aGVzZSBhZGRpdGlvbmFsIG1ldGhvZHM6XG4gKlxuICogICAtIGAkY2FuY2VsUmVxdWVzdGA6IElmIHRoZXJlIGlzIGEgY2FuY2VsbGFibGUsIHBlbmRpbmcgcmVxdWVzdCByZWxhdGVkIHRvIHRoZSBpbnN0YW5jZSBvclxuICogICAgICBjb2xsZWN0aW9uLCBjYWxsaW5nIHRoaXMgbWV0aG9kIHdpbGwgYWJvcnQgdGhlIHJlcXVlc3QuXG4gKlxuICogICBUaGUgUmVzb3VyY2UgaW5zdGFuY2VzIGhhdmUgdGhlc2UgYWRkaXRpb25hbCBtZXRob2RzOlxuICpcbiAqICAgLSBgdG9KU09OYDogSXQgcmV0dXJucyBhIHNpbXBsZSBvYmplY3Qgd2l0aG91dCBhbnkgb2YgdGhlIGV4dHJhIHByb3BlcnRpZXMgYWRkZWQgYXMgcGFydCBvZlxuICogICAgIHRoZSBSZXNvdXJjZSBBUEkuIFRoaXMgb2JqZWN0IGNhbiBiZSBzZXJpYWxpemVkIHRocm91Z2gge0BsaW5rIGFuZ3VsYXIudG9Kc29ufSBzYWZlbHlcbiAqICAgICB3aXRob3V0IGF0dGFjaGluZyBBbmd1bGFyLXNwZWNpZmljIGZpZWxkcy4gTm90aWNlIHRoYXQgYEpTT04uc3RyaW5naWZ5YCAoYW5kXG4gKiAgICAgYGFuZ3VsYXIudG9Kc29uYCkgYXV0b21hdGljYWxseSB1c2UgdGhpcyBtZXRob2Qgd2hlbiBzZXJpYWxpemluZyBhIFJlc291cmNlIGluc3RhbmNlXG4gKiAgICAgKHNlZSBbTUROXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSN0b0pTT04oKV9iZWhhdmlvcikpLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogIyBDcmVkaXQgY2FyZCByZXNvdXJjZVxuICpcbiAqIGBgYGpzXG4gICAgIC8vIERlZmluZSBDcmVkaXRDYXJkIGNsYXNzXG4gICAgIHZhciBDcmVkaXRDYXJkID0gJHJlc291cmNlKCcvdXNlci86dXNlcklkL2NhcmQvOmNhcmRJZCcsXG4gICAgICB7dXNlcklkOjEyMywgY2FyZElkOidAaWQnfSwge1xuICAgICAgIGNoYXJnZToge21ldGhvZDonUE9TVCcsIHBhcmFtczp7Y2hhcmdlOnRydWV9fVxuICAgICAgfSk7XG5cbiAgICAgLy8gV2UgY2FuIHJldHJpZXZlIGEgY29sbGVjdGlvbiBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAgdmFyIGNhcmRzID0gQ3JlZGl0Q2FyZC5xdWVyeShmdW5jdGlvbigpIHtcbiAgICAgICAvLyBHRVQ6IC91c2VyLzEyMy9jYXJkXG4gICAgICAgLy8gc2VydmVyIHJldHVybnM6IFsge2lkOjQ1NiwgbnVtYmVyOicxMjM0JywgbmFtZTonU21pdGgnfSBdO1xuXG4gICAgICAgdmFyIGNhcmQgPSBjYXJkc1swXTtcbiAgICAgICAvLyBlYWNoIGl0ZW0gaXMgYW4gaW5zdGFuY2Ugb2YgQ3JlZGl0Q2FyZFxuICAgICAgIGV4cGVjdChjYXJkIGluc3RhbmNlb2YgQ3JlZGl0Q2FyZCkudG9FcXVhbCh0cnVlKTtcbiAgICAgICBjYXJkLm5hbWUgPSBcIkouIFNtaXRoXCI7XG4gICAgICAgLy8gbm9uIEdFVCBtZXRob2RzIGFyZSBtYXBwZWQgb250byB0aGUgaW5zdGFuY2VzXG4gICAgICAgY2FyZC4kc2F2ZSgpO1xuICAgICAgIC8vIFBPU1Q6IC91c2VyLzEyMy9jYXJkLzQ1NiB7aWQ6NDU2LCBudW1iZXI6JzEyMzQnLCBuYW1lOidKLiBTbWl0aCd9XG4gICAgICAgLy8gc2VydmVyIHJldHVybnM6IHtpZDo0NTYsIG51bWJlcjonMTIzNCcsIG5hbWU6ICdKLiBTbWl0aCd9O1xuXG4gICAgICAgLy8gb3VyIGN1c3RvbSBtZXRob2QgaXMgbWFwcGVkIGFzIHdlbGwuXG4gICAgICAgY2FyZC4kY2hhcmdlKHthbW91bnQ6OS45OX0pO1xuICAgICAgIC8vIFBPU1Q6IC91c2VyLzEyMy9jYXJkLzQ1Nj9hbW91bnQ9OS45OSZjaGFyZ2U9dHJ1ZSB7aWQ6NDU2LCBudW1iZXI6JzEyMzQnLCBuYW1lOidKLiBTbWl0aCd9XG4gICAgIH0pO1xuXG4gICAgIC8vIHdlIGNhbiBjcmVhdGUgYW4gaW5zdGFuY2UgYXMgd2VsbFxuICAgICB2YXIgbmV3Q2FyZCA9IG5ldyBDcmVkaXRDYXJkKHtudW1iZXI6JzAxMjMnfSk7XG4gICAgIG5ld0NhcmQubmFtZSA9IFwiTWlrZSBTbWl0aFwiO1xuICAgICBuZXdDYXJkLiRzYXZlKCk7XG4gICAgIC8vIFBPU1Q6IC91c2VyLzEyMy9jYXJkIHtudW1iZXI6JzAxMjMnLCBuYW1lOidNaWtlIFNtaXRoJ31cbiAgICAgLy8gc2VydmVyIHJldHVybnM6IHtpZDo3ODksIG51bWJlcjonMDEyMycsIG5hbWU6ICdNaWtlIFNtaXRoJ307XG4gICAgIGV4cGVjdChuZXdDYXJkLmlkKS50b0VxdWFsKDc4OSk7XG4gKiBgYGBcbiAqXG4gKiBUaGUgb2JqZWN0IHJldHVybmVkIGZyb20gdGhpcyBmdW5jdGlvbiBleGVjdXRpb24gaXMgYSByZXNvdXJjZSBcImNsYXNzXCIgd2hpY2ggaGFzIFwic3RhdGljXCIgbWV0aG9kXG4gKiBmb3IgZWFjaCBhY3Rpb24gaW4gdGhlIGRlZmluaXRpb24uXG4gKlxuICogQ2FsbGluZyB0aGVzZSBtZXRob2RzIGludm9rZSBgJGh0dHBgIG9uIHRoZSBgdXJsYCB0ZW1wbGF0ZSB3aXRoIHRoZSBnaXZlbiBgbWV0aG9kYCwgYHBhcmFtc2AgYW5kXG4gKiBgaGVhZGVyc2AuXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiAjIFVzZXIgcmVzb3VyY2VcbiAqXG4gKiBXaGVuIHRoZSBkYXRhIGlzIHJldHVybmVkIGZyb20gdGhlIHNlcnZlciB0aGVuIHRoZSBvYmplY3QgaXMgYW4gaW5zdGFuY2Ugb2YgdGhlIHJlc291cmNlIHR5cGUgYW5kXG4gKiBhbGwgb2YgdGhlIG5vbi1HRVQgbWV0aG9kcyBhcmUgYXZhaWxhYmxlIHdpdGggYCRgIHByZWZpeC4gVGhpcyBhbGxvd3MgeW91IHRvIGVhc2lseSBzdXBwb3J0IENSVURcbiAqIG9wZXJhdGlvbnMgKGNyZWF0ZSwgcmVhZCwgdXBkYXRlLCBkZWxldGUpIG9uIHNlcnZlci1zaWRlIGRhdGEuXG5cbiAgIGBgYGpzXG4gICAgIHZhciBVc2VyID0gJHJlc291cmNlKCcvdXNlci86dXNlcklkJywge3VzZXJJZDonQGlkJ30pO1xuICAgICBVc2VyLmdldCh7dXNlcklkOjEyM30sIGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICB1c2VyLmFiYyA9IHRydWU7XG4gICAgICAgdXNlci4kc2F2ZSgpO1xuICAgICB9KTtcbiAgIGBgYFxuICpcbiAqIEl0J3Mgd29ydGggbm90aW5nIHRoYXQgdGhlIHN1Y2Nlc3MgY2FsbGJhY2sgZm9yIGBnZXRgLCBgcXVlcnlgIGFuZCBvdGhlciBtZXRob2RzIGdldHMgcGFzc2VkXG4gKiBpbiB0aGUgcmVzcG9uc2UgdGhhdCBjYW1lIGZyb20gdGhlIHNlcnZlciBhcyB3ZWxsIGFzICRodHRwIGhlYWRlciBnZXR0ZXIgZnVuY3Rpb24sIHNvIG9uZVxuICogY291bGQgcmV3cml0ZSB0aGUgYWJvdmUgZXhhbXBsZSBhbmQgZ2V0IGFjY2VzcyB0byBodHRwIGhlYWRlcnMgYXM6XG4gKlxuICAgYGBganNcbiAgICAgdmFyIFVzZXIgPSAkcmVzb3VyY2UoJy91c2VyLzp1c2VySWQnLCB7dXNlcklkOidAaWQnfSk7XG4gICAgIFVzZXIuZ2V0KHt1c2VySWQ6MTIzfSwgZnVuY3Rpb24odXNlciwgZ2V0UmVzcG9uc2VIZWFkZXJzKXtcbiAgICAgICB1c2VyLmFiYyA9IHRydWU7XG4gICAgICAgdXNlci4kc2F2ZShmdW5jdGlvbih1c2VyLCBwdXRSZXNwb25zZUhlYWRlcnMpIHtcbiAgICAgICAgIC8vdXNlciA9PiBzYXZlZCB1c2VyIG9iamVjdFxuICAgICAgICAgLy9wdXRSZXNwb25zZUhlYWRlcnMgPT4gJGh0dHAgaGVhZGVyIGdldHRlclxuICAgICAgIH0pO1xuICAgICB9KTtcbiAgIGBgYFxuICpcbiAqIFlvdSBjYW4gYWxzbyBhY2Nlc3MgdGhlIHJhdyBgJGh0dHBgIHByb21pc2UgdmlhIHRoZSBgJHByb21pc2VgIHByb3BlcnR5IG9uIHRoZSBvYmplY3QgcmV0dXJuZWRcbiAqXG4gICBgYGBcbiAgICAgdmFyIFVzZXIgPSAkcmVzb3VyY2UoJy91c2VyLzp1c2VySWQnLCB7dXNlcklkOidAaWQnfSk7XG4gICAgIFVzZXIuZ2V0KHt1c2VySWQ6MTIzfSlcbiAgICAgICAgIC4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgJHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgfSk7XG4gICBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqICMgQ3JlYXRpbmcgYSBjdXN0b20gJ1BVVCcgcmVxdWVzdFxuICpcbiAqIEluIHRoaXMgZXhhbXBsZSB3ZSBjcmVhdGUgYSBjdXN0b20gbWV0aG9kIG9uIG91ciByZXNvdXJjZSB0byBtYWtlIGEgUFVUIHJlcXVlc3RcbiAqIGBgYGpzXG4gKiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsnbmdSZXNvdXJjZScsICduZ1JvdXRlJ10pO1xuICpcbiAqICAgIC8vIFNvbWUgQVBJcyBleHBlY3QgYSBQVVQgcmVxdWVzdCBpbiB0aGUgZm9ybWF0IFVSTC9vYmplY3QvSURcbiAqICAgIC8vIEhlcmUgd2UgYXJlIGNyZWF0aW5nIGFuICd1cGRhdGUnIG1ldGhvZFxuICogICAgYXBwLmZhY3RvcnkoJ05vdGVzJywgWyckcmVzb3VyY2UnLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAqICAgIHJldHVybiAkcmVzb3VyY2UoJy9ub3Rlcy86aWQnLCBudWxsLFxuICogICAgICAgIHtcbiAqICAgICAgICAgICAgJ3VwZGF0ZSc6IHsgbWV0aG9kOidQVVQnIH1cbiAqICAgICAgICB9KTtcbiAqICAgIH1dKTtcbiAqXG4gKiAgICAvLyBJbiBvdXIgY29udHJvbGxlciB3ZSBnZXQgdGhlIElEIGZyb20gdGhlIFVSTCB1c2luZyBuZ1JvdXRlIGFuZCAkcm91dGVQYXJhbXNcbiAqICAgIC8vIFdlIHBhc3MgaW4gJHJvdXRlUGFyYW1zIGFuZCBvdXIgTm90ZXMgZmFjdG9yeSBhbG9uZyB3aXRoICRzY29wZVxuICogICAgYXBwLmNvbnRyb2xsZXIoJ05vdGVzQ3RybCcsIFsnJHNjb3BlJywgJyRyb3V0ZVBhcmFtcycsICdOb3RlcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlUGFyYW1zLCBOb3Rlcykge1xuICogICAgLy8gRmlyc3QgZ2V0IGEgbm90ZSBvYmplY3QgZnJvbSB0aGUgZmFjdG9yeVxuICogICAgdmFyIG5vdGUgPSBOb3Rlcy5nZXQoeyBpZDokcm91dGVQYXJhbXMuaWQgfSk7XG4gKiAgICAkaWQgPSBub3RlLmlkO1xuICpcbiAqICAgIC8vIE5vdyBjYWxsIHVwZGF0ZSBwYXNzaW5nIGluIHRoZSBJRCBmaXJzdCB0aGVuIHRoZSBvYmplY3QgeW91IGFyZSB1cGRhdGluZ1xuICogICAgTm90ZXMudXBkYXRlKHsgaWQ6JGlkIH0sIG5vdGUpO1xuICpcbiAqICAgIC8vIFRoaXMgd2lsbCBQVVQgL25vdGVzL0lEIHdpdGggdGhlIG5vdGUgb2JqZWN0IGluIHRoZSByZXF1ZXN0IHBheWxvYWRcbiAqICAgIH1dKTtcbiAqIGBgYFxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogIyBDYW5jZWxsaW5nIHJlcXVlc3RzXG4gKlxuICogSWYgYW4gYWN0aW9uJ3MgY29uZmlndXJhdGlvbiBzcGVjaWZpZXMgdGhhdCBpdCBpcyBjYW5jZWxsYWJsZSwgeW91IGNhbiBjYW5jZWwgdGhlIHJlcXVlc3QgcmVsYXRlZFxuICogdG8gYW4gaW5zdGFuY2Ugb3IgY29sbGVjdGlvbiAoYXMgbG9uZyBhcyBpdCBpcyBhIHJlc3VsdCBvZiBhIFwibm9uLWluc3RhbmNlXCIgY2FsbCk6XG4gKlxuICAgYGBganNcbiAgICAgLy8gLi4uZGVmaW5pbmcgdGhlIGBIb3RlbGAgcmVzb3VyY2UuLi5cbiAgICAgdmFyIEhvdGVsID0gJHJlc291cmNlKCcvYXBpL2hvdGVsLzppZCcsIHtpZDogJ0BpZCd9LCB7XG4gICAgICAgLy8gTGV0J3MgbWFrZSB0aGUgYHF1ZXJ5KClgIG1ldGhvZCBjYW5jZWxsYWJsZVxuICAgICAgIHF1ZXJ5OiB7bWV0aG9kOiAnZ2V0JywgaXNBcnJheTogdHJ1ZSwgY2FuY2VsbGFibGU6IHRydWV9XG4gICAgIH0pO1xuXG4gICAgIC8vIC4uLnNvbWV3aGVyZSBpbiB0aGUgUGxhblZhY2F0aW9uQ29udHJvbGxlci4uLlxuICAgICAuLi5cbiAgICAgdGhpcy5vbkRlc3RpbmF0aW9uQ2hhbmdlZCA9IGZ1bmN0aW9uIG9uRGVzdGluYXRpb25DaGFuZ2VkKGRlc3RpbmF0aW9uKSB7XG4gICAgICAgLy8gV2UgZG9uJ3QgY2FyZSBhYm91dCBhbnkgcGVuZGluZyByZXF1ZXN0IGZvciBob3RlbHNcbiAgICAgICAvLyBpbiBhIGRpZmZlcmVudCBkZXN0aW5hdGlvbiBhbnkgbW9yZVxuICAgICAgIHRoaXMuYXZhaWxhYmxlSG90ZWxzLiRjYW5jZWxSZXF1ZXN0KCk7XG5cbiAgICAgICAvLyBMZXQncyBxdWVyeSBmb3IgaG90ZWxzIGluICc8ZGVzdGluYXRpb24+J1xuICAgICAgIC8vIChjYWxsczogL2FwaS9ob3RlbD9sb2NhdGlvbj08ZGVzdGluYXRpb24+KVxuICAgICAgIHRoaXMuYXZhaWxhYmxlSG90ZWxzID0gSG90ZWwucXVlcnkoe2xvY2F0aW9uOiBkZXN0aW5hdGlvbn0pO1xuICAgICB9O1xuICAgYGBgXG4gKlxuICovXG5hbmd1bGFyLm1vZHVsZSgnbmdSZXNvdXJjZScsIFsnbmcnXSkuXG4gIHByb3ZpZGVyKCckcmVzb3VyY2UnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgUFJPVE9DT0xfQU5EX0RPTUFJTl9SRUdFWCA9IC9eaHR0cHM/OlxcL1xcL1teXFwvXSovO1xuICAgIHZhciBwcm92aWRlciA9IHRoaXM7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgcHJvcGVydHlcbiAgICAgKiBAbmFtZSAkcmVzb3VyY2VQcm92aWRlciNkZWZhdWx0c1xuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIE9iamVjdCBjb250YWluaW5nIGRlZmF1bHQgb3B0aW9ucyB1c2VkIHdoZW4gY3JlYXRpbmcgYCRyZXNvdXJjZWAgaW5zdGFuY2VzLlxuICAgICAqXG4gICAgICogVGhlIGRlZmF1bHQgdmFsdWVzIHNhdGlzZnkgYSB3aWRlIHJhbmdlIG9mIHVzZWNhc2VzLCBidXQgeW91IG1heSBjaG9vc2UgdG8gb3ZlcndyaXRlIGFueSBvZlxuICAgICAqIHRoZW0gdG8gZnVydGhlciBjdXN0b21pemUgeW91ciBpbnN0YW5jZXMuIFRoZSBhdmFpbGFibGUgcHJvcGVydGllcyBhcmU6XG4gICAgICpcbiAgICAgKiAtICoqc3RyaXBUcmFpbGluZ1NsYXNoZXMqKiDigJMgYHtib29sZWFufWAg4oCTIElmIHRydWUsIHRoZW4gdGhlIHRyYWlsaW5nIHNsYXNoZXMgZnJvbSBhbnlcbiAgICAgKiAgIGNhbGN1bGF0ZWQgVVJMIHdpbGwgYmUgc3RyaXBwZWQuPGJyIC8+XG4gICAgICogICAoRGVmYXVsdHMgdG8gdHJ1ZS4pXG4gICAgICogLSAqKmNhbmNlbGxhYmxlKiog4oCTIGB7Ym9vbGVhbn1gIOKAkyBJZiB0cnVlLCB0aGUgcmVxdWVzdCBtYWRlIGJ5IGEgXCJub24taW5zdGFuY2VcIiBjYWxsIHdpbGwgYmVcbiAgICAgKiAgIGNhbmNlbGxlZCAoaWYgbm90IGFscmVhZHkgY29tcGxldGVkKSBieSBjYWxsaW5nIGAkY2FuY2VsUmVxdWVzdCgpYCBvbiB0aGUgY2FsbCdzIHJldHVyblxuICAgICAqICAgdmFsdWUuIEZvciBtb3JlIGRldGFpbHMsIHNlZSB7QGxpbmsgbmdSZXNvdXJjZS4kcmVzb3VyY2V9LiBUaGlzIGNhbiBiZSBvdmVyd3JpdHRlbiBwZXJcbiAgICAgKiAgIHJlc291cmNlIGNsYXNzIG9yIGFjdGlvbi48YnIgLz5cbiAgICAgKiAgIChEZWZhdWx0cyB0byBmYWxzZS4pXG4gICAgICogLSAqKmFjdGlvbnMqKiAtIGB7T2JqZWN0LjxPYmplY3Q+fWAgLSBBIGhhc2ggd2l0aCBkZWZhdWx0IGFjdGlvbnMgZGVjbGFyYXRpb25zLiBBY3Rpb25zIGFyZVxuICAgICAqICAgaGlnaC1sZXZlbCBtZXRob2RzIGNvcnJlc3BvbmRpbmcgdG8gUkVTVGZ1bCBhY3Rpb25zL21ldGhvZHMgb24gcmVzb3VyY2VzLiBBbiBhY3Rpb24gbWF5XG4gICAgICogICBzcGVjaWZ5IHdoYXQgSFRUUCBtZXRob2QgdG8gdXNlLCB3aGF0IFVSTCB0byBoaXQsIGlmIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBiZSBhIHNpbmdsZVxuICAgICAqICAgb2JqZWN0IG9yIGEgY29sbGVjdGlvbiAoYXJyYXkpIG9mIG9iamVjdHMgZXRjLiBGb3IgbW9yZSBkZXRhaWxzLCBzZWVcbiAgICAgKiAgIHtAbGluayBuZ1Jlc291cmNlLiRyZXNvdXJjZX0uIFRoZSBhY3Rpb25zIGNhbiBhbHNvIGJlIGVuaGFuY2VkIG9yIG92ZXJ3cml0dGVuIHBlciByZXNvdXJjZVxuICAgICAqICAgY2xhc3MuPGJyIC8+XG4gICAgICogICBUaGUgZGVmYXVsdCBhY3Rpb25zIGFyZTpcbiAgICAgKiAgIGBgYGpzXG4gICAgICogICB7XG4gICAgICogICAgIGdldDoge21ldGhvZDogJ0dFVCd9LFxuICAgICAqICAgICBzYXZlOiB7bWV0aG9kOiAnUE9TVCd9LFxuICAgICAqICAgICBxdWVyeToge21ldGhvZDogJ0dFVCcsIGlzQXJyYXk6IHRydWV9LFxuICAgICAqICAgICByZW1vdmU6IHttZXRob2Q6ICdERUxFVEUnfSxcbiAgICAgKiAgICAgZGVsZXRlOiB7bWV0aG9kOiAnREVMRVRFJ31cbiAgICAgKiAgIH1cbiAgICAgKiAgIGBgYFxuICAgICAqXG4gICAgICogIyMjIyBFeGFtcGxlXG4gICAgICpcbiAgICAgKiBGb3IgZXhhbXBsZSwgeW91IGNhbiBzcGVjaWZ5IGEgbmV3IGB1cGRhdGVgIGFjdGlvbiB0aGF0IHVzZXMgdGhlIGBQVVRgIEhUVFAgdmVyYjpcbiAgICAgKlxuICAgICAqIGBgYGpzXG4gICAgICogICBhbmd1bGFyLlxuICAgICAqICAgICBtb2R1bGUoJ215QXBwJykuXG4gICAgICogICAgIGNvbmZpZyhbJ3Jlc291cmNlUHJvdmlkZXInLCBmdW5jdGlvbiAoJHJlc291cmNlUHJvdmlkZXIpIHtcbiAgICAgKiAgICAgICAkcmVzb3VyY2VQcm92aWRlci5kZWZhdWx0cy5hY3Rpb25zLnVwZGF0ZSA9IHtcbiAgICAgKiAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgKiAgICAgICB9O1xuICAgICAqICAgICB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqIE9yIHlvdSBjYW4gZXZlbiBvdmVyd3JpdGUgdGhlIHdob2xlIGBhY3Rpb25zYCBsaXN0IGFuZCBzcGVjaWZ5IHlvdXIgb3duOlxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiAgIGFuZ3VsYXIuXG4gICAgICogICAgIG1vZHVsZSgnbXlBcHAnKS5cbiAgICAgKiAgICAgY29uZmlnKFsncmVzb3VyY2VQcm92aWRlcicsIGZ1bmN0aW9uICgkcmVzb3VyY2VQcm92aWRlcikge1xuICAgICAqICAgICAgICRyZXNvdXJjZVByb3ZpZGVyLmRlZmF1bHRzLmFjdGlvbnMgPSB7XG4gICAgICogICAgICAgICBjcmVhdGU6IHttZXRob2Q6ICdQT1NUJ31cbiAgICAgKiAgICAgICAgIGdldDogICAge21ldGhvZDogJ0dFVCd9LFxuICAgICAqICAgICAgICAgZ2V0QWxsOiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTp0cnVlfSxcbiAgICAgKiAgICAgICAgIHVwZGF0ZToge21ldGhvZDogJ1BVVCd9LFxuICAgICAqICAgICAgICAgZGVsZXRlOiB7bWV0aG9kOiAnREVMRVRFJ31cbiAgICAgKiAgICAgICB9O1xuICAgICAqICAgICB9KTtcbiAgICAgKiBgYGBcbiAgICAgKlxuICAgICAqL1xuICAgIHRoaXMuZGVmYXVsdHMgPSB7XG4gICAgICAvLyBTdHJpcCBzbGFzaGVzIGJ5IGRlZmF1bHRcbiAgICAgIHN0cmlwVHJhaWxpbmdTbGFzaGVzOiB0cnVlLFxuXG4gICAgICAvLyBNYWtlIG5vbi1pbnN0YW5jZSByZXF1ZXN0cyBjYW5jZWxsYWJsZSAodmlhIGAkY2FuY2VsUmVxdWVzdCgpYClcbiAgICAgIGNhbmNlbGxhYmxlOiBmYWxzZSxcblxuICAgICAgLy8gRGVmYXVsdCBhY3Rpb25zIGNvbmZpZ3VyYXRpb25cbiAgICAgIGFjdGlvbnM6IHtcbiAgICAgICAgJ2dldCc6IHttZXRob2Q6ICdHRVQnfSxcbiAgICAgICAgJ3NhdmUnOiB7bWV0aG9kOiAnUE9TVCd9LFxuICAgICAgICAncXVlcnknOiB7bWV0aG9kOiAnR0VUJywgaXNBcnJheTogdHJ1ZX0sXG4gICAgICAgICdyZW1vdmUnOiB7bWV0aG9kOiAnREVMRVRFJ30sXG4gICAgICAgICdkZWxldGUnOiB7bWV0aG9kOiAnREVMRVRFJ31cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy4kZ2V0ID0gWyckaHR0cCcsICckbG9nJywgJyRxJywgJyR0aW1lb3V0JywgZnVuY3Rpb24oJGh0dHAsICRsb2csICRxLCAkdGltZW91dCkge1xuXG4gICAgICB2YXIgbm9vcCA9IGFuZ3VsYXIubm9vcCxcbiAgICAgICAgZm9yRWFjaCA9IGFuZ3VsYXIuZm9yRWFjaCxcbiAgICAgICAgZXh0ZW5kID0gYW5ndWxhci5leHRlbmQsXG4gICAgICAgIGNvcHkgPSBhbmd1bGFyLmNvcHksXG4gICAgICAgIGlzRnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb247XG5cbiAgICAgIC8qKlxuICAgICAgICogV2UgbmVlZCBvdXIgY3VzdG9tIG1ldGhvZCBiZWNhdXNlIGVuY29kZVVSSUNvbXBvbmVudCBpcyB0b28gYWdncmVzc2l2ZSBhbmQgZG9lc24ndCBmb2xsb3dcbiAgICAgICAqIGh0dHA6Ly93d3cuaWV0Zi5vcmcvcmZjL3JmYzM5ODYudHh0IHdpdGggcmVnYXJkcyB0byB0aGUgY2hhcmFjdGVyIHNldFxuICAgICAgICogKHBjaGFyKSBhbGxvd2VkIGluIHBhdGggc2VnbWVudHM6XG4gICAgICAgKiAgICBzZWdtZW50ICAgICAgID0gKnBjaGFyXG4gICAgICAgKiAgICBwY2hhciAgICAgICAgID0gdW5yZXNlcnZlZCAvIHBjdC1lbmNvZGVkIC8gc3ViLWRlbGltcyAvIFwiOlwiIC8gXCJAXCJcbiAgICAgICAqICAgIHBjdC1lbmNvZGVkICAgPSBcIiVcIiBIRVhESUcgSEVYRElHXG4gICAgICAgKiAgICB1bnJlc2VydmVkICAgID0gQUxQSEEgLyBESUdJVCAvIFwiLVwiIC8gXCIuXCIgLyBcIl9cIiAvIFwiflwiXG4gICAgICAgKiAgICBzdWItZGVsaW1zICAgID0gXCIhXCIgLyBcIiRcIiAvIFwiJlwiIC8gXCInXCIgLyBcIihcIiAvIFwiKVwiXG4gICAgICAgKiAgICAgICAgICAgICAgICAgICAgIC8gXCIqXCIgLyBcIitcIiAvIFwiLFwiIC8gXCI7XCIgLyBcIj1cIlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBlbmNvZGVVcmlTZWdtZW50KHZhbCkge1xuICAgICAgICByZXR1cm4gZW5jb2RlVXJpUXVlcnkodmFsLCB0cnVlKS5cbiAgICAgICAgICByZXBsYWNlKC8lMjYvZ2ksICcmJykuXG4gICAgICAgICAgcmVwbGFjZSgvJTNEL2dpLCAnPScpLlxuICAgICAgICAgIHJlcGxhY2UoLyUyQi9naSwgJysnKTtcbiAgICAgIH1cblxuXG4gICAgICAvKipcbiAgICAgICAqIFRoaXMgbWV0aG9kIGlzIGludGVuZGVkIGZvciBlbmNvZGluZyAqa2V5KiBvciAqdmFsdWUqIHBhcnRzIG9mIHF1ZXJ5IGNvbXBvbmVudC4gV2UgbmVlZCBhXG4gICAgICAgKiBjdXN0b20gbWV0aG9kIGJlY2F1c2UgZW5jb2RlVVJJQ29tcG9uZW50IGlzIHRvbyBhZ2dyZXNzaXZlIGFuZCBlbmNvZGVzIHN0dWZmIHRoYXQgZG9lc24ndFxuICAgICAgICogaGF2ZSB0byBiZSBlbmNvZGVkIHBlciBodHRwOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2OlxuICAgICAgICogICAgcXVlcnkgICAgICAgPSAqKCBwY2hhciAvIFwiL1wiIC8gXCI/XCIgKVxuICAgICAgICogICAgcGNoYXIgICAgICAgICA9IHVucmVzZXJ2ZWQgLyBwY3QtZW5jb2RlZCAvIHN1Yi1kZWxpbXMgLyBcIjpcIiAvIFwiQFwiXG4gICAgICAgKiAgICB1bnJlc2VydmVkICAgID0gQUxQSEEgLyBESUdJVCAvIFwiLVwiIC8gXCIuXCIgLyBcIl9cIiAvIFwiflwiXG4gICAgICAgKiAgICBwY3QtZW5jb2RlZCAgID0gXCIlXCIgSEVYRElHIEhFWERJR1xuICAgICAgICogICAgc3ViLWRlbGltcyAgICA9IFwiIVwiIC8gXCIkXCIgLyBcIiZcIiAvIFwiJ1wiIC8gXCIoXCIgLyBcIilcIlxuICAgICAgICogICAgICAgICAgICAgICAgICAgICAvIFwiKlwiIC8gXCIrXCIgLyBcIixcIiAvIFwiO1wiIC8gXCI9XCJcbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gZW5jb2RlVXJpUXVlcnkodmFsLCBwY3RFbmNvZGVTcGFjZXMpIHtcbiAgICAgICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpLlxuICAgICAgICAgIHJlcGxhY2UoLyU0MC9naSwgJ0AnKS5cbiAgICAgICAgICByZXBsYWNlKC8lM0EvZ2ksICc6JykuXG4gICAgICAgICAgcmVwbGFjZSgvJTI0L2csICckJykuXG4gICAgICAgICAgcmVwbGFjZSgvJTJDL2dpLCAnLCcpLlxuICAgICAgICAgIHJlcGxhY2UoLyUyMC9nLCAocGN0RW5jb2RlU3BhY2VzID8gJyUyMCcgOiAnKycpKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gUm91dGUodGVtcGxhdGUsIGRlZmF1bHRzKSB7XG4gICAgICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0cyA9IGV4dGVuZCh7fSwgcHJvdmlkZXIuZGVmYXVsdHMsIGRlZmF1bHRzKTtcbiAgICAgICAgdGhpcy51cmxQYXJhbXMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgUm91dGUucHJvdG90eXBlID0ge1xuICAgICAgICBzZXRVcmxQYXJhbXM6IGZ1bmN0aW9uKGNvbmZpZywgcGFyYW1zLCBhY3Rpb25VcmwpIHtcbiAgICAgICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgICAgICB1cmwgPSBhY3Rpb25VcmwgfHwgc2VsZi50ZW1wbGF0ZSxcbiAgICAgICAgICAgIHZhbCxcbiAgICAgICAgICAgIGVuY29kZWRWYWwsXG4gICAgICAgICAgICBwcm90b2NvbEFuZERvbWFpbiA9ICcnO1xuXG4gICAgICAgICAgdmFyIHVybFBhcmFtcyA9IHNlbGYudXJsUGFyYW1zID0ge307XG4gICAgICAgICAgZm9yRWFjaCh1cmwuc3BsaXQoL1xcVy8pLCBmdW5jdGlvbihwYXJhbSkge1xuICAgICAgICAgICAgaWYgKHBhcmFtID09PSAnaGFzT3duUHJvcGVydHknKSB7XG4gICAgICAgICAgICAgIHRocm93ICRyZXNvdXJjZU1pbkVycignYmFkbmFtZScsIFwiaGFzT3duUHJvcGVydHkgaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyIG5hbWUuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCEobmV3IFJlZ0V4cChcIl5cXFxcZCskXCIpLnRlc3QocGFyYW0pKSAmJiBwYXJhbSAmJlxuICAgICAgICAgICAgICAobmV3IFJlZ0V4cChcIihefFteXFxcXFxcXFxdKTpcIiArIHBhcmFtICsgXCIoXFxcXFd8JClcIikudGVzdCh1cmwpKSkge1xuICAgICAgICAgICAgICB1cmxQYXJhbXNbcGFyYW1dID0ge1xuICAgICAgICAgICAgICAgIGlzUXVlcnlQYXJhbVZhbHVlOiAobmV3IFJlZ0V4cChcIlxcXFw/Lio9OlwiICsgcGFyYW0gKyBcIig/OlxcXFxXfCQpXCIpKS50ZXN0KHVybClcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgvXFxcXDovZywgJzonKTtcbiAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShQUk9UT0NPTF9BTkRfRE9NQUlOX1JFR0VYLCBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgICAgICAgcHJvdG9jb2xBbmREb21haW4gPSBtYXRjaDtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHBhcmFtcyA9IHBhcmFtcyB8fCB7fTtcbiAgICAgICAgICBmb3JFYWNoKHNlbGYudXJsUGFyYW1zLCBmdW5jdGlvbihwYXJhbUluZm8sIHVybFBhcmFtKSB7XG4gICAgICAgICAgICB2YWwgPSBwYXJhbXMuaGFzT3duUHJvcGVydHkodXJsUGFyYW0pID8gcGFyYW1zW3VybFBhcmFtXSA6IHNlbGYuZGVmYXVsdHNbdXJsUGFyYW1dO1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHZhbCkgJiYgdmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgIGlmIChwYXJhbUluZm8uaXNRdWVyeVBhcmFtVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBlbmNvZGVkVmFsID0gZW5jb2RlVXJpUXVlcnkodmFsLCB0cnVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbmNvZGVkVmFsID0gZW5jb2RlVXJpU2VnbWVudCh2YWwpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKG5ldyBSZWdFeHAoXCI6XCIgKyB1cmxQYXJhbSArIFwiKFxcXFxXfCQpXCIsIFwiZ1wiKSwgZnVuY3Rpb24obWF0Y2gsIHAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZWRWYWwgKyBwMTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShuZXcgUmVnRXhwKFwiKFxcLz8pOlwiICsgdXJsUGFyYW0gKyBcIihcXFxcV3wkKVwiLCBcImdcIiksIGZ1bmN0aW9uKG1hdGNoLFxuICAgICAgICAgICAgICAgICAgbGVhZGluZ1NsYXNoZXMsIHRhaWwpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFpbC5jaGFyQXQoMCkgPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdGFpbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGxlYWRpbmdTbGFzaGVzICsgdGFpbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8gc3RyaXAgdHJhaWxpbmcgc2xhc2hlcyBhbmQgc2V0IHRoZSB1cmwgKHVubGVzcyB0aGlzIGJlaGF2aW9yIGlzIHNwZWNpZmljYWxseSBkaXNhYmxlZClcbiAgICAgICAgICBpZiAoc2VsZi5kZWZhdWx0cy5zdHJpcFRyYWlsaW5nU2xhc2hlcykge1xuICAgICAgICAgICAgdXJsID0gdXJsLnJlcGxhY2UoL1xcLyskLywgJycpIHx8ICcvJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyB0aGVuIHJlcGxhY2UgY29sbGFwc2UgYC8uYCBpZiBmb3VuZCBpbiB0aGUgbGFzdCBVUkwgcGF0aCBzZWdtZW50IGJlZm9yZSB0aGUgcXVlcnlcbiAgICAgICAgICAvLyBFLmcuIGBodHRwOi8vdXJsLmNvbS9pZC4vZm9ybWF0P3E9eGAgYmVjb21lcyBgaHR0cDovL3VybC5jb20vaWQuZm9ybWF0P3E9eGBcbiAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZSgvXFwvXFwuKD89XFx3KygkfFxcPykpLywgJy4nKTtcbiAgICAgICAgICAvLyByZXBsYWNlIGVzY2FwZWQgYC9cXC5gIHdpdGggYC8uYFxuICAgICAgICAgIGNvbmZpZy51cmwgPSBwcm90b2NvbEFuZERvbWFpbiArIHVybC5yZXBsYWNlKC9cXC9cXFxcXFwuLywgJy8uJyk7XG5cblxuICAgICAgICAgIC8vIHNldCBwYXJhbXMgLSBkZWxlZ2F0ZSBwYXJhbSBlbmNvZGluZyB0byAkaHR0cFxuICAgICAgICAgIGZvckVhY2gocGFyYW1zLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYudXJsUGFyYW1zW2tleV0pIHtcbiAgICAgICAgICAgICAgY29uZmlnLnBhcmFtcyA9IGNvbmZpZy5wYXJhbXMgfHwge307XG4gICAgICAgICAgICAgIGNvbmZpZy5wYXJhbXNba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuXG5cbiAgICAgIGZ1bmN0aW9uIHJlc291cmNlRmFjdG9yeSh1cmwsIHBhcmFtRGVmYXVsdHMsIGFjdGlvbnMsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIHJvdXRlID0gbmV3IFJvdXRlKHVybCwgb3B0aW9ucyk7XG5cbiAgICAgICAgYWN0aW9ucyA9IGV4dGVuZCh7fSwgcHJvdmlkZXIuZGVmYXVsdHMuYWN0aW9ucywgYWN0aW9ucyk7XG5cbiAgICAgICAgZnVuY3Rpb24gZXh0cmFjdFBhcmFtcyhkYXRhLCBhY3Rpb25QYXJhbXMpIHtcbiAgICAgICAgICB2YXIgaWRzID0ge307XG4gICAgICAgICAgYWN0aW9uUGFyYW1zID0gZXh0ZW5kKHt9LCBwYXJhbURlZmF1bHRzLCBhY3Rpb25QYXJhbXMpO1xuICAgICAgICAgIGZvckVhY2goYWN0aW9uUGFyYW1zLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHsgdmFsdWUgPSB2YWx1ZShkYXRhKTsgfVxuICAgICAgICAgICAgaWRzW2tleV0gPSB2YWx1ZSAmJiB2YWx1ZS5jaGFyQXQgJiYgdmFsdWUuY2hhckF0KDApID09ICdAJyA/XG4gICAgICAgICAgICAgIGxvb2t1cERvdHRlZFBhdGgoZGF0YSwgdmFsdWUuc3Vic3RyKDEpKSA6IHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBpZHM7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBkZWZhdWx0UmVzcG9uc2VJbnRlcmNlcHRvcihyZXNwb25zZSkge1xuICAgICAgICAgIHJldHVybiByZXNwb25zZS5yZXNvdXJjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIFJlc291cmNlKHZhbHVlKSB7XG4gICAgICAgICAgc2hhbGxvd0NsZWFyQW5kQ29weSh2YWx1ZSB8fCB7fSwgdGhpcyk7XG4gICAgICAgIH1cblxuICAgICAgICBSZXNvdXJjZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGRhdGEgPSBleHRlbmQoe30sIHRoaXMpO1xuICAgICAgICAgIGRlbGV0ZSBkYXRhLiRwcm9taXNlO1xuICAgICAgICAgIGRlbGV0ZSBkYXRhLiRyZXNvbHZlZDtcbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfTtcblxuICAgICAgICBmb3JFYWNoKGFjdGlvbnMsIGZ1bmN0aW9uKGFjdGlvbiwgbmFtZSkge1xuICAgICAgICAgIHZhciBoYXNCb2R5ID0gL14oUE9TVHxQVVR8UEFUQ0gpJC9pLnRlc3QoYWN0aW9uLm1ldGhvZCk7XG4gICAgICAgICAgdmFyIG51bWVyaWNUaW1lb3V0ID0gYWN0aW9uLnRpbWVvdXQ7XG4gICAgICAgICAgdmFyIGNhbmNlbGxhYmxlID0gYW5ndWxhci5pc0RlZmluZWQoYWN0aW9uLmNhbmNlbGxhYmxlKSA/IGFjdGlvbi5jYW5jZWxsYWJsZSA6XG4gICAgICAgICAgICAgIChvcHRpb25zICYmIGFuZ3VsYXIuaXNEZWZpbmVkKG9wdGlvbnMuY2FuY2VsbGFibGUpKSA/IG9wdGlvbnMuY2FuY2VsbGFibGUgOlxuICAgICAgICAgICAgICBwcm92aWRlci5kZWZhdWx0cy5jYW5jZWxsYWJsZTtcblxuICAgICAgICAgIGlmIChudW1lcmljVGltZW91dCAmJiAhYW5ndWxhci5pc051bWJlcihudW1lcmljVGltZW91dCkpIHtcbiAgICAgICAgICAgICRsb2cuZGVidWcoJ25nUmVzb3VyY2U6XFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICcgIE9ubHkgbnVtZXJpYyB2YWx1ZXMgYXJlIGFsbG93ZWQgYXMgYHRpbWVvdXRgLlxcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAnICBQcm9taXNlcyBhcmUgbm90IHN1cHBvcnRlZCBpbiAkcmVzb3VyY2UsIGJlY2F1c2UgdGhlIHNhbWUgdmFsdWUgd291bGQgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdiZSB1c2VkIGZvciBtdWx0aXBsZSByZXF1ZXN0cy4gSWYgeW91IGFyZSBsb29raW5nIGZvciBhIHdheSB0byBjYW5jZWwgJyArXG4gICAgICAgICAgICAgICAgICAgICAgICdyZXF1ZXN0cywgeW91IHNob3VsZCB1c2UgdGhlIGBjYW5jZWxsYWJsZWAgb3B0aW9uLicpO1xuICAgICAgICAgICAgZGVsZXRlIGFjdGlvbi50aW1lb3V0O1xuICAgICAgICAgICAgbnVtZXJpY1RpbWVvdXQgPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIFJlc291cmNlW25hbWVdID0gZnVuY3Rpb24oYTEsIGEyLCBhMywgYTQpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7fSwgZGF0YSwgc3VjY2VzcywgZXJyb3I7XG5cbiAgICAgICAgICAgIC8qIGpzaGludCAtVzA4NiAqLyAvKiAocHVycG9zZWZ1bGx5IGZhbGwgdGhyb3VnaCBjYXNlIHN0YXRlbWVudHMpICovXG4gICAgICAgICAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIGVycm9yID0gYTQ7XG4gICAgICAgICAgICAgICAgc3VjY2VzcyA9IGEzO1xuICAgICAgICAgICAgICAvL2ZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKGEyKSkge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oYTEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBhMTtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IgPSBhMjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3MgPSBhMjtcbiAgICAgICAgICAgICAgICAgIGVycm9yID0gYTM7XG4gICAgICAgICAgICAgICAgICAvL2ZhbGx0aHJvdWdoXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHBhcmFtcyA9IGExO1xuICAgICAgICAgICAgICAgICAgZGF0YSA9IGEyO1xuICAgICAgICAgICAgICAgICAgc3VjY2VzcyA9IGEzO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24oYTEpKSBzdWNjZXNzID0gYTE7XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaGFzQm9keSkgZGF0YSA9IGExO1xuICAgICAgICAgICAgICAgIGVsc2UgcGFyYW1zID0gYTE7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgMDogYnJlYWs7XG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgJHJlc291cmNlTWluRXJyKCdiYWRhcmdzJyxcbiAgICAgICAgICAgICAgICAgIFwiRXhwZWN0ZWQgdXAgdG8gNCBhcmd1bWVudHMgW3BhcmFtcywgZGF0YSwgc3VjY2VzcywgZXJyb3JdLCBnb3QgezB9IGFyZ3VtZW50c1wiLFxuICAgICAgICAgICAgICAgICAgYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBqc2hpbnQgK1cwODYgKi8gLyogKHB1cnBvc2VmdWxseSBmYWxsIHRocm91Z2ggY2FzZSBzdGF0ZW1lbnRzKSAqL1xuXG4gICAgICAgICAgICB2YXIgaXNJbnN0YW5jZUNhbGwgPSB0aGlzIGluc3RhbmNlb2YgUmVzb3VyY2U7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBpc0luc3RhbmNlQ2FsbCA/IGRhdGEgOiAoYWN0aW9uLmlzQXJyYXkgPyBbXSA6IG5ldyBSZXNvdXJjZShkYXRhKSk7XG4gICAgICAgICAgICB2YXIgaHR0cENvbmZpZyA9IHt9O1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlSW50ZXJjZXB0b3IgPSBhY3Rpb24uaW50ZXJjZXB0b3IgJiYgYWN0aW9uLmludGVyY2VwdG9yLnJlc3BvbnNlIHx8XG4gICAgICAgICAgICAgIGRlZmF1bHRSZXNwb25zZUludGVyY2VwdG9yO1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlRXJyb3JJbnRlcmNlcHRvciA9IGFjdGlvbi5pbnRlcmNlcHRvciAmJiBhY3Rpb24uaW50ZXJjZXB0b3IucmVzcG9uc2VFcnJvciB8fFxuICAgICAgICAgICAgICB1bmRlZmluZWQ7XG4gICAgICAgICAgICB2YXIgdGltZW91dERlZmVycmVkO1xuICAgICAgICAgICAgdmFyIG51bWVyaWNUaW1lb3V0UHJvbWlzZTtcblxuICAgICAgICAgICAgZm9yRWFjaChhY3Rpb24sIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgaHR0cENvbmZpZ1trZXldID0gY29weSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdwYXJhbXMnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2lzQXJyYXknOlxuICAgICAgICAgICAgICAgIGNhc2UgJ2ludGVyY2VwdG9yJzpcbiAgICAgICAgICAgICAgICBjYXNlICdjYW5jZWxsYWJsZSc6XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmICghaXNJbnN0YW5jZUNhbGwgJiYgY2FuY2VsbGFibGUpIHtcbiAgICAgICAgICAgICAgdGltZW91dERlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICAgICAgaHR0cENvbmZpZy50aW1lb3V0ID0gdGltZW91dERlZmVycmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICAgaWYgKG51bWVyaWNUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgbnVtZXJpY1RpbWVvdXRQcm9taXNlID0gJHRpbWVvdXQodGltZW91dERlZmVycmVkLnJlc29sdmUsIG51bWVyaWNUaW1lb3V0KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGFzQm9keSkgaHR0cENvbmZpZy5kYXRhID0gZGF0YTtcbiAgICAgICAgICAgIHJvdXRlLnNldFVybFBhcmFtcyhodHRwQ29uZmlnLFxuICAgICAgICAgICAgICBleHRlbmQoe30sIGV4dHJhY3RQYXJhbXMoZGF0YSwgYWN0aW9uLnBhcmFtcyB8fCB7fSksIHBhcmFtcyksXG4gICAgICAgICAgICAgIGFjdGlvbi51cmwpO1xuXG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRodHRwKGh0dHBDb25maWcpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuXG4gICAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgLy8gTmVlZCB0byBjb252ZXJ0IGFjdGlvbi5pc0FycmF5IHRvIGJvb2xlYW4gaW4gY2FzZSBpdCBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAvLyBqc2hpbnQgLVcwMThcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGRhdGEpICE9PSAoISFhY3Rpb24uaXNBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93ICRyZXNvdXJjZU1pbkVycignYmFkY2ZnJyxcbiAgICAgICAgICAgICAgICAgICAgICAnRXJyb3IgaW4gcmVzb3VyY2UgY29uZmlndXJhdGlvbiBmb3IgYWN0aW9uIGB7MH1gLiBFeHBlY3RlZCByZXNwb25zZSB0byAnICtcbiAgICAgICAgICAgICAgICAgICAgICAnY29udGFpbiBhbiB7MX0gYnV0IGdvdCBhbiB7Mn0gKFJlcXVlc3Q6IHszfSB7NH0pJywgbmFtZSwgYWN0aW9uLmlzQXJyYXkgPyAnYXJyYXknIDogJ29iamVjdCcsXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuaXNBcnJheShkYXRhKSA/ICdhcnJheScgOiAnb2JqZWN0JywgaHR0cENvbmZpZy5tZXRob2QsIGh0dHBDb25maWcudXJsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8ganNoaW50ICtXMDE4XG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbi5pc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICB2YWx1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgZm9yRWFjaChkYXRhLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgaXRlbSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnB1c2gobmV3IFJlc291cmNlKGl0ZW0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyBWYWxpZCBKU09OIHZhbHVlcyBtYXkgYmUgc3RyaW5nIGxpdGVyYWxzLCBhbmQgdGhlc2Ugc2hvdWxkIG5vdCBiZSBjb252ZXJ0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRvIG9iamVjdHMuIFRoZXNlIGl0ZW1zIHdpbGwgbm90IGhhdmUgYWNjZXNzIHRvIHRoZSBSZXNvdXJjZSBwcm90b3R5cGVcbiAgICAgICAgICAgICAgICAgICAgICAvLyBtZXRob2RzLCBidXQgdW5mb3J0dW5hdGVseSB0aGVyZVxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICB2YXIgcHJvbWlzZSA9IHZhbHVlLiRwcm9taXNlOyAgICAgLy8gU2F2ZSB0aGUgcHJvbWlzZVxuICAgICAgICAgICAgICAgICAgc2hhbGxvd0NsZWFyQW5kQ29weShkYXRhLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICB2YWx1ZS4kcHJvbWlzZSA9IHByb21pc2U7ICAgICAgICAgLy8gUmVzdG9yZSB0aGUgcHJvbWlzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXNwb25zZS5yZXNvdXJjZSA9IHZhbHVlO1xuXG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgIChlcnJvciB8fCBub29wKShyZXNwb25zZSk7XG4gICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHByb21pc2VbJ2ZpbmFsbHknXShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFsdWUuJHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKCFpc0luc3RhbmNlQ2FsbCAmJiBjYW5jZWxsYWJsZSkge1xuICAgICAgICAgICAgICAgIHZhbHVlLiRjYW5jZWxSZXF1ZXN0ID0gYW5ndWxhci5ub29wO1xuICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbChudW1lcmljVGltZW91dFByb21pc2UpO1xuICAgICAgICAgICAgICAgIHRpbWVvdXREZWZlcnJlZCA9IG51bWVyaWNUaW1lb3V0UHJvbWlzZSA9IGh0dHBDb25maWcudGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKFxuICAgICAgICAgICAgICBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJlc3BvbnNlSW50ZXJjZXB0b3IocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIChzdWNjZXNzIHx8IG5vb3ApKHZhbHVlLCByZXNwb25zZS5oZWFkZXJzKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHJlc3BvbnNlRXJyb3JJbnRlcmNlcHRvcik7XG5cbiAgICAgICAgICAgIGlmICghaXNJbnN0YW5jZUNhbGwpIHtcbiAgICAgICAgICAgICAgLy8gd2UgYXJlIGNyZWF0aW5nIGluc3RhbmNlIC8gY29sbGVjdGlvblxuICAgICAgICAgICAgICAvLyAtIHNldCB0aGUgaW5pdGlhbCBwcm9taXNlXG4gICAgICAgICAgICAgIC8vIC0gcmV0dXJuIHRoZSBpbnN0YW5jZSAvIGNvbGxlY3Rpb25cbiAgICAgICAgICAgICAgdmFsdWUuJHByb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgICB2YWx1ZS4kcmVzb2x2ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgaWYgKGNhbmNlbGxhYmxlKSB2YWx1ZS4kY2FuY2VsUmVxdWVzdCA9IHRpbWVvdXREZWZlcnJlZC5yZXNvbHZlO1xuXG4gICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaW5zdGFuY2UgY2FsbFxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgICAgfTtcblxuXG4gICAgICAgICAgUmVzb3VyY2UucHJvdG90eXBlWyckJyArIG5hbWVdID0gZnVuY3Rpb24ocGFyYW1zLCBzdWNjZXNzLCBlcnJvcikge1xuICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24ocGFyYW1zKSkge1xuICAgICAgICAgICAgICBlcnJvciA9IHN1Y2Nlc3M7IHN1Y2Nlc3MgPSBwYXJhbXM7IHBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFJlc291cmNlW25hbWVdLmNhbGwodGhpcywgcGFyYW1zLCB0aGlzLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LiRwcm9taXNlIHx8IHJlc3VsdDtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICBSZXNvdXJjZS5iaW5kID0gZnVuY3Rpb24oYWRkaXRpb25hbFBhcmFtRGVmYXVsdHMpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb3VyY2VGYWN0b3J5KHVybCwgZXh0ZW5kKHt9LCBwYXJhbURlZmF1bHRzLCBhZGRpdGlvbmFsUGFyYW1EZWZhdWx0cyksIGFjdGlvbnMpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBSZXNvdXJjZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc291cmNlRmFjdG9yeTtcbiAgICB9XTtcbiAgfSk7XG5cblxufSkod2luZG93LCB3aW5kb3cuYW5ndWxhcik7XG4iLCJyZXF1aXJlKCcuL2FuZ3VsYXItcmVzb3VyY2UnKTtcbm1vZHVsZS5leHBvcnRzID0gJ25nUmVzb3VyY2UnO1xuIiwiLyoqXG4gKiBTdGF0ZS1iYXNlZCByb3V0aW5nIGZvciBBbmd1bGFySlNcbiAqIEB2ZXJzaW9uIHYwLjMuMVxuICogQGxpbmsgaHR0cDovL2FuZ3VsYXItdWkuZ2l0aHViLmNvbS9cbiAqIEBsaWNlbnNlIE1JVCBMaWNlbnNlLCBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL01JVFxuICovXG5cbi8qIGNvbW1vbmpzIHBhY2thZ2UgbWFuYWdlciBzdXBwb3J0IChlZyBjb21wb25lbnRqcykgKi9cbmlmICh0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBleHBvcnRzICE9PSBcInVuZGVmaW5lZFwiICYmIG1vZHVsZS5leHBvcnRzID09PSBleHBvcnRzKXtcbiAgbW9kdWxlLmV4cG9ydHMgPSAndWkucm91dGVyJztcbn1cblxuKGZ1bmN0aW9uICh3aW5kb3csIGFuZ3VsYXIsIHVuZGVmaW5lZCkge1xuLypqc2hpbnQgZ2xvYmFsc3RyaWN0OnRydWUqL1xuLypnbG9iYWwgYW5ndWxhcjpmYWxzZSovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBpc0RlZmluZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCxcbiAgICBpc0Z1bmN0aW9uID0gYW5ndWxhci5pc0Z1bmN0aW9uLFxuICAgIGlzU3RyaW5nID0gYW5ndWxhci5pc1N0cmluZyxcbiAgICBpc09iamVjdCA9IGFuZ3VsYXIuaXNPYmplY3QsXG4gICAgaXNBcnJheSA9IGFuZ3VsYXIuaXNBcnJheSxcbiAgICBmb3JFYWNoID0gYW5ndWxhci5mb3JFYWNoLFxuICAgIGV4dGVuZCA9IGFuZ3VsYXIuZXh0ZW5kLFxuICAgIGNvcHkgPSBhbmd1bGFyLmNvcHksXG4gICAgdG9Kc29uID0gYW5ndWxhci50b0pzb247XG5cbmZ1bmN0aW9uIGluaGVyaXQocGFyZW50LCBleHRyYSkge1xuICByZXR1cm4gZXh0ZW5kKG5ldyAoZXh0ZW5kKGZ1bmN0aW9uKCkge30sIHsgcHJvdG90eXBlOiBwYXJlbnQgfSkpKCksIGV4dHJhKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2UoZHN0KSB7XG4gIGZvckVhY2goYXJndW1lbnRzLCBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqICE9PSBkc3QpIHtcbiAgICAgIGZvckVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIGlmICghZHN0Lmhhc093blByb3BlcnR5KGtleSkpIGRzdFtrZXldID0gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZHN0O1xufVxuXG4vKipcbiAqIEZpbmRzIHRoZSBjb21tb24gYW5jZXN0b3IgcGF0aCBiZXR3ZWVuIHR3byBzdGF0ZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGZpcnN0IFRoZSBmaXJzdCBzdGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzZWNvbmQgVGhlIHNlY29uZCBzdGF0ZS5cbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIGFuIGFycmF5IG9mIHN0YXRlIG5hbWVzIGluIGRlc2NlbmRpbmcgb3JkZXIsIG5vdCBpbmNsdWRpbmcgdGhlIHJvb3QuXG4gKi9cbmZ1bmN0aW9uIGFuY2VzdG9ycyhmaXJzdCwgc2Vjb25kKSB7XG4gIHZhciBwYXRoID0gW107XG5cbiAgZm9yICh2YXIgbiBpbiBmaXJzdC5wYXRoKSB7XG4gICAgaWYgKGZpcnN0LnBhdGhbbl0gIT09IHNlY29uZC5wYXRoW25dKSBicmVhaztcbiAgICBwYXRoLnB1c2goZmlyc3QucGF0aFtuXSk7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59XG5cbi8qKlxuICogSUU4LXNhZmUgd3JhcHBlciBmb3IgYE9iamVjdC5rZXlzKClgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgQSBKYXZhU2NyaXB0IG9iamVjdC5cbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QgYXMgYW4gYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdEtleXMob2JqZWN0KSB7XG4gIGlmIChPYmplY3Qua2V5cykge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcblxuICBmb3JFYWNoKG9iamVjdCwgZnVuY3Rpb24odmFsLCBrZXkpIHtcbiAgICByZXN1bHQucHVzaChrZXkpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBJRTgtc2FmZSB3cmFwcGVyIGZvciBgQXJyYXkucHJvdG90eXBlLmluZGV4T2YoKWAuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgQSBKYXZhU2NyaXB0IGFycmF5LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBBIHZhbHVlIHRvIHNlYXJjaCB0aGUgYXJyYXkgZm9yLlxuICogQHJldHVybiB7TnVtYmVyfSBSZXR1cm5zIHRoZSBhcnJheSBpbmRleCB2YWx1ZSBvZiBgdmFsdWVgLCBvciBgLTFgIGlmIG5vdCBwcmVzZW50LlxuICovXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xuICBpZiAoQXJyYXkucHJvdG90eXBlLmluZGV4T2YpIHtcbiAgICByZXR1cm4gYXJyYXkuaW5kZXhPZih2YWx1ZSwgTnVtYmVyKGFyZ3VtZW50c1syXSkgfHwgMCk7XG4gIH1cbiAgdmFyIGxlbiA9IGFycmF5Lmxlbmd0aCA+Pj4gMCwgZnJvbSA9IE51bWJlcihhcmd1bWVudHNbMl0pIHx8IDA7XG4gIGZyb20gPSAoZnJvbSA8IDApID8gTWF0aC5jZWlsKGZyb20pIDogTWF0aC5mbG9vcihmcm9tKTtcblxuICBpZiAoZnJvbSA8IDApIGZyb20gKz0gbGVuO1xuXG4gIGZvciAoOyBmcm9tIDwgbGVuOyBmcm9tKyspIHtcbiAgICBpZiAoZnJvbSBpbiBhcnJheSAmJiBhcnJheVtmcm9tXSA9PT0gdmFsdWUpIHJldHVybiBmcm9tO1xuICB9XG4gIHJldHVybiAtMTtcbn1cblxuLyoqXG4gKiBNZXJnZXMgYSBzZXQgb2YgcGFyYW1ldGVycyB3aXRoIGFsbCBwYXJhbWV0ZXJzIGluaGVyaXRlZCBiZXR3ZWVuIHRoZSBjb21tb24gcGFyZW50cyBvZiB0aGVcbiAqIGN1cnJlbnQgc3RhdGUgYW5kIGEgZ2l2ZW4gZGVzdGluYXRpb24gc3RhdGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGN1cnJlbnRQYXJhbXMgVGhlIHZhbHVlIG9mIHRoZSBjdXJyZW50IHN0YXRlIHBhcmFtZXRlcnMgKCRzdGF0ZVBhcmFtcykuXG4gKiBAcGFyYW0ge09iamVjdH0gbmV3UGFyYW1zIFRoZSBzZXQgb2YgcGFyYW1ldGVycyB3aGljaCB3aWxsIGJlIGNvbXBvc2l0ZWQgd2l0aCBpbmhlcml0ZWQgcGFyYW1zLlxuICogQHBhcmFtIHtPYmplY3R9ICRjdXJyZW50IEludGVybmFsIGRlZmluaXRpb24gb2Ygb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBzdGF0ZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSAkdG8gSW50ZXJuYWwgZGVmaW5pdGlvbiBvZiBvYmplY3QgcmVwcmVzZW50aW5nIHN0YXRlIHRvIHRyYW5zaXRpb24gdG8uXG4gKi9cbmZ1bmN0aW9uIGluaGVyaXRQYXJhbXMoY3VycmVudFBhcmFtcywgbmV3UGFyYW1zLCAkY3VycmVudCwgJHRvKSB7XG4gIHZhciBwYXJlbnRzID0gYW5jZXN0b3JzKCRjdXJyZW50LCAkdG8pLCBwYXJlbnRQYXJhbXMsIGluaGVyaXRlZCA9IHt9LCBpbmhlcml0TGlzdCA9IFtdO1xuXG4gIGZvciAodmFyIGkgaW4gcGFyZW50cykge1xuICAgIGlmICghcGFyZW50c1tpXSB8fCAhcGFyZW50c1tpXS5wYXJhbXMpIGNvbnRpbnVlO1xuICAgIHBhcmVudFBhcmFtcyA9IG9iamVjdEtleXMocGFyZW50c1tpXS5wYXJhbXMpO1xuICAgIGlmICghcGFyZW50UGFyYW1zLmxlbmd0aCkgY29udGludWU7XG5cbiAgICBmb3IgKHZhciBqIGluIHBhcmVudFBhcmFtcykge1xuICAgICAgaWYgKGluZGV4T2YoaW5oZXJpdExpc3QsIHBhcmVudFBhcmFtc1tqXSkgPj0gMCkgY29udGludWU7XG4gICAgICBpbmhlcml0TGlzdC5wdXNoKHBhcmVudFBhcmFtc1tqXSk7XG4gICAgICBpbmhlcml0ZWRbcGFyZW50UGFyYW1zW2pdXSA9IGN1cnJlbnRQYXJhbXNbcGFyZW50UGFyYW1zW2pdXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGV4dGVuZCh7fSwgaW5oZXJpdGVkLCBuZXdQYXJhbXMpO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbm9uLXN0cmljdCBjb21wYXJpc29uIG9mIHRoZSBzdWJzZXQgb2YgdHdvIG9iamVjdHMsIGRlZmluZWQgYnkgYSBsaXN0IG9mIGtleXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGEgVGhlIGZpcnN0IG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBzZWNvbmQgb2JqZWN0LlxuICogQHBhcmFtIHtBcnJheX0ga2V5cyBUaGUgbGlzdCBvZiBrZXlzIHdpdGhpbiBlYWNoIG9iamVjdCB0byBjb21wYXJlLiBJZiB0aGUgbGlzdCBpcyBlbXB0eSBvciBub3Qgc3BlY2lmaWVkLFxuICogICAgICAgICAgICAgICAgICAgICBpdCBkZWZhdWx0cyB0byB0aGUgbGlzdCBvZiBrZXlzIGluIGBhYC5cbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBrZXlzIG1hdGNoLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gZXF1YWxGb3JLZXlzKGEsIGIsIGtleXMpIHtcbiAgaWYgKCFrZXlzKSB7XG4gICAga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIG4gaW4gYSkga2V5cy5wdXNoKG4pOyAvLyBVc2VkIGluc3RlYWQgb2YgT2JqZWN0LmtleXMoKSBmb3IgSUU4IGNvbXBhdGliaWxpdHlcbiAgfVxuXG4gIGZvciAodmFyIGk9MDsgaTxrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGsgPSBrZXlzW2ldO1xuICAgIGlmIChhW2tdICE9IGJba10pIHJldHVybiBmYWxzZTsgLy8gTm90ICc9PT0nLCB2YWx1ZXMgYXJlbid0IG5lY2Vzc2FyaWx5IG5vcm1hbGl6ZWRcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBzdWJzZXQgb2YgYW4gb2JqZWN0LCBiYXNlZCBvbiBhIGxpc3Qgb2Yga2V5cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBrZXlzXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVzXG4gKiBAcmV0dXJuIHtCb29sZWFufSBSZXR1cm5zIGEgc3Vic2V0IG9mIGB2YWx1ZXNgLlxuICovXG5mdW5jdGlvbiBmaWx0ZXJCeUtleXMoa2V5cywgdmFsdWVzKSB7XG4gIHZhciBmaWx0ZXJlZCA9IHt9O1xuXG4gIGZvckVhY2goa2V5cywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBmaWx0ZXJlZFtuYW1lXSA9IHZhbHVlc1tuYW1lXTtcbiAgfSk7XG4gIHJldHVybiBmaWx0ZXJlZDtcbn1cblxuLy8gbGlrZSBfLmluZGV4Qnlcbi8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZSwgb3IgeW91IHdhbnQgbGFzdC1vbmUtaW4gdG8gd2luXG5mdW5jdGlvbiBpbmRleEJ5KGFycmF5LCBwcm9wTmFtZSkge1xuICB2YXIgcmVzdWx0ID0ge307XG4gIGZvckVhY2goYXJyYXksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICByZXN1bHRbaXRlbVtwcm9wTmFtZV1dID0gaXRlbTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIGV4dHJhY3RlZCBmcm9tIHVuZGVyc2NvcmUuanNcbi8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG5mdW5jdGlvbiBwaWNrKG9iaikge1xuICB2YXIgY29weSA9IHt9O1xuICB2YXIga2V5cyA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoQXJyYXkucHJvdG90eXBlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgZm9yRWFjaChrZXlzLCBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAoa2V5IGluIG9iaikgY29weVtrZXldID0gb2JqW2tleV07XG4gIH0pO1xuICByZXR1cm4gY29weTtcbn1cblxuLy8gZXh0cmFjdGVkIGZyb20gdW5kZXJzY29yZS5qc1xuLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9taXR0aW5nIHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuZnVuY3Rpb24gb21pdChvYmopIHtcbiAgdmFyIGNvcHkgPSB7fTtcbiAgdmFyIGtleXMgPSBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KEFycmF5LnByb3RvdHlwZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICBpZiAoaW5kZXhPZihrZXlzLCBrZXkpID09IC0xKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgfVxuICByZXR1cm4gY29weTtcbn1cblxuZnVuY3Rpb24gcGx1Y2soY29sbGVjdGlvbiwga2V5KSB7XG4gIHZhciByZXN1bHQgPSBpc0FycmF5KGNvbGxlY3Rpb24pID8gW10gOiB7fTtcblxuICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbCwgaSkge1xuICAgIHJlc3VsdFtpXSA9IGlzRnVuY3Rpb24oa2V5KSA/IGtleSh2YWwpIDogdmFsW2tleV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBmaWx0ZXIoY29sbGVjdGlvbiwgY2FsbGJhY2spIHtcbiAgdmFyIGFycmF5ID0gaXNBcnJheShjb2xsZWN0aW9uKTtcbiAgdmFyIHJlc3VsdCA9IGFycmF5ID8gW10gOiB7fTtcbiAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWwsIGkpIHtcbiAgICBpZiAoY2FsbGJhY2sodmFsLCBpKSkge1xuICAgICAgcmVzdWx0W2FycmF5ID8gcmVzdWx0Lmxlbmd0aCA6IGldID0gdmFsO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1hcChjb2xsZWN0aW9uLCBjYWxsYmFjaykge1xuICB2YXIgcmVzdWx0ID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IFtdIDoge307XG5cbiAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWwsIGkpIHtcbiAgICByZXN1bHRbaV0gPSBjYWxsYmFjayh2YWwsIGkpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiAjIHVpLnJvdXRlci51dGlsIHN1Yi1tb2R1bGVcbiAqXG4gKiBUaGlzIG1vZHVsZSBpcyBhIGRlcGVuZGVuY3kgb2Ygb3RoZXIgc3ViLW1vZHVsZXMuIERvIG5vdCBpbmNsdWRlIHRoaXMgbW9kdWxlIGFzIGEgZGVwZW5kZW5jeVxuICogaW4geW91ciBhbmd1bGFyIGFwcCAodXNlIHtAbGluayB1aS5yb3V0ZXJ9IG1vZHVsZSBpbnN0ZWFkKS5cbiAqXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIudXRpbCcsIFsnbmcnXSk7XG5cbi8qKlxuICogQG5nZG9jIG92ZXJ2aWV3XG4gKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyXG4gKiBcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIudXRpbFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogIyB1aS5yb3V0ZXIucm91dGVyIHN1Yi1tb2R1bGVcbiAqXG4gKiBUaGlzIG1vZHVsZSBpcyBhIGRlcGVuZGVuY3kgb2Ygb3RoZXIgc3ViLW1vZHVsZXMuIERvIG5vdCBpbmNsdWRlIHRoaXMgbW9kdWxlIGFzIGEgZGVwZW5kZW5jeVxuICogaW4geW91ciBhbmd1bGFyIGFwcCAodXNlIHtAbGluayB1aS5yb3V0ZXJ9IG1vZHVsZSBpbnN0ZWFkKS5cbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5yb3V0ZXInLCBbJ3VpLnJvdXRlci51dGlsJ10pO1xuXG4vKipcbiAqIEBuZ2RvYyBvdmVydmlld1xuICogQG5hbWUgdWkucm91dGVyLnN0YXRlXG4gKiBcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIucm91dGVyXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnV0aWxcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqICMgdWkucm91dGVyLnN0YXRlIHN1Yi1tb2R1bGVcbiAqXG4gKiBUaGlzIG1vZHVsZSBpcyBhIGRlcGVuZGVuY3kgb2YgdGhlIG1haW4gdWkucm91dGVyIG1vZHVsZS4gRG8gbm90IGluY2x1ZGUgdGhpcyBtb2R1bGUgYXMgYSBkZXBlbmRlbmN5XG4gKiBpbiB5b3VyIGFuZ3VsYXIgYXBwICh1c2Uge0BsaW5rIHVpLnJvdXRlcn0gbW9kdWxlIGluc3RlYWQpLlxuICogXG4gKi9cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnLCBbJ3VpLnJvdXRlci5yb3V0ZXInLCAndWkucm91dGVyLnV0aWwnXSk7XG5cbi8qKlxuICogQG5nZG9jIG92ZXJ2aWV3XG4gKiBAbmFtZSB1aS5yb3V0ZXJcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiAjIHVpLnJvdXRlclxuICogXG4gKiAjIyBUaGUgbWFpbiBtb2R1bGUgZm9yIHVpLnJvdXRlciBcbiAqIFRoZXJlIGFyZSBzZXZlcmFsIHN1Yi1tb2R1bGVzIGluY2x1ZGVkIHdpdGggdGhlIHVpLnJvdXRlciBtb2R1bGUsIGhvd2V2ZXIgb25seSB0aGlzIG1vZHVsZSBpcyBuZWVkZWRcbiAqIGFzIGEgZGVwZW5kZW5jeSB3aXRoaW4geW91ciBhbmd1bGFyIGFwcC4gVGhlIG90aGVyIG1vZHVsZXMgYXJlIGZvciBvcmdhbml6YXRpb24gcHVycG9zZXMuIFxuICpcbiAqIFRoZSBtb2R1bGVzIGFyZTpcbiAqICogdWkucm91dGVyIC0gdGhlIG1haW4gXCJ1bWJyZWxsYVwiIG1vZHVsZVxuICogKiB1aS5yb3V0ZXIucm91dGVyIC0gXG4gKiBcbiAqICpZb3UnbGwgbmVlZCB0byBpbmNsdWRlICoqb25seSoqIHRoaXMgbW9kdWxlIGFzIHRoZSBkZXBlbmRlbmN5IHdpdGhpbiB5b3VyIGFuZ3VsYXIgYXBwLipcbiAqIFxuICogPHByZT5cbiAqIDwhZG9jdHlwZSBodG1sPlxuICogPGh0bWwgbmctYXBwPVwibXlBcHBcIj5cbiAqIDxoZWFkPlxuICogICA8c2NyaXB0IHNyYz1cImpzL2FuZ3VsYXIuanNcIj48L3NjcmlwdD5cbiAqICAgPCEtLSBJbmNsdWRlIHRoZSB1aS1yb3V0ZXIgc2NyaXB0IC0tPlxuICogICA8c2NyaXB0IHNyYz1cImpzL2FuZ3VsYXItdWktcm91dGVyLm1pbi5qc1wiPjwvc2NyaXB0PlxuICogICA8c2NyaXB0PlxuICogICAgIC8vIC4uLmFuZCBhZGQgJ3VpLnJvdXRlcicgYXMgYSBkZXBlbmRlbmN5XG4gKiAgICAgdmFyIG15QXBwID0gYW5ndWxhci5tb2R1bGUoJ215QXBwJywgWyd1aS5yb3V0ZXInXSk7XG4gKiAgIDwvc2NyaXB0PlxuICogPC9oZWFkPlxuICogPGJvZHk+XG4gKiA8L2JvZHk+XG4gKiA8L2h0bWw+XG4gKiA8L3ByZT5cbiAqL1xuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlcicsIFsndWkucm91dGVyLnN0YXRlJ10pO1xuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLmNvbXBhdCcsIFsndWkucm91dGVyJ10pO1xuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiRyZXNvbHZlXG4gKlxuICogQHJlcXVpcmVzICRxXG4gKiBAcmVxdWlyZXMgJGluamVjdG9yXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBNYW5hZ2VzIHJlc29sdXRpb24gb2YgKGFjeWNsaWMpIGdyYXBocyBvZiBwcm9taXNlcy5cbiAqL1xuJFJlc29sdmUuJGluamVjdCA9IFsnJHEnLCAnJGluamVjdG9yJ107XG5mdW5jdGlvbiAkUmVzb2x2ZSggICRxLCAgICAkaW5qZWN0b3IpIHtcbiAgXG4gIHZhciBWSVNJVF9JTl9QUk9HUkVTUyA9IDEsXG4gICAgICBWSVNJVF9ET05FID0gMixcbiAgICAgIE5PVEhJTkcgPSB7fSxcbiAgICAgIE5PX0RFUEVOREVOQ0lFUyA9IFtdLFxuICAgICAgTk9fTE9DQUxTID0gTk9USElORyxcbiAgICAgIE5PX1BBUkVOVCA9IGV4dGVuZCgkcS53aGVuKE5PVEhJTkcpLCB7ICQkcHJvbWlzZXM6IE5PVEhJTkcsICQkdmFsdWVzOiBOT1RISU5HIH0pO1xuICBcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiRyZXNvbHZlI3N0dWR5XG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kcmVzb2x2ZVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU3R1ZGllcyBhIHNldCBvZiBpbnZvY2FibGVzIHRoYXQgYXJlIGxpa2VseSB0byBiZSB1c2VkIG11bHRpcGxlIHRpbWVzLlxuICAgKiA8cHJlPlxuICAgKiAkcmVzb2x2ZS5zdHVkeShpbnZvY2FibGVzKShsb2NhbHMsIHBhcmVudCwgc2VsZilcbiAgICogPC9wcmU+XG4gICAqIGlzIGVxdWl2YWxlbnQgdG9cbiAgICogPHByZT5cbiAgICogJHJlc29sdmUucmVzb2x2ZShpbnZvY2FibGVzLCBsb2NhbHMsIHBhcmVudCwgc2VsZilcbiAgICogPC9wcmU+XG4gICAqIGJ1dCB0aGUgZm9ybWVyIGlzIG1vcmUgZWZmaWNpZW50IChpbiBmYWN0IGByZXNvbHZlYCBqdXN0IGNhbGxzIGBzdHVkeWAgXG4gICAqIGludGVybmFsbHkpLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gaW52b2NhYmxlcyBJbnZvY2FibGUgb2JqZWN0c1xuICAgKiBAcmV0dXJuIHtmdW5jdGlvbn0gYSBmdW5jdGlvbiB0byBwYXNzIGluIGxvY2FscywgcGFyZW50IGFuZCBzZWxmXG4gICAqL1xuICB0aGlzLnN0dWR5ID0gZnVuY3Rpb24gKGludm9jYWJsZXMpIHtcbiAgICBpZiAoIWlzT2JqZWN0KGludm9jYWJsZXMpKSB0aHJvdyBuZXcgRXJyb3IoXCInaW52b2NhYmxlcycgbXVzdCBiZSBhbiBvYmplY3RcIik7XG4gICAgdmFyIGludm9jYWJsZUtleXMgPSBvYmplY3RLZXlzKGludm9jYWJsZXMgfHwge30pO1xuICAgIFxuICAgIC8vIFBlcmZvcm0gYSB0b3BvbG9naWNhbCBzb3J0IG9mIGludm9jYWJsZXMgdG8gYnVpbGQgYW4gb3JkZXJlZCBwbGFuXG4gICAgdmFyIHBsYW4gPSBbXSwgY3ljbGUgPSBbXSwgdmlzaXRlZCA9IHt9O1xuICAgIGZ1bmN0aW9uIHZpc2l0KHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICh2aXNpdGVkW2tleV0gPT09IFZJU0lUX0RPTkUpIHJldHVybjtcbiAgICAgIFxuICAgICAgY3ljbGUucHVzaChrZXkpO1xuICAgICAgaWYgKHZpc2l0ZWRba2V5XSA9PT0gVklTSVRfSU5fUFJPR1JFU1MpIHtcbiAgICAgICAgY3ljbGUuc3BsaWNlKDAsIGluZGV4T2YoY3ljbGUsIGtleSkpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDeWNsaWMgZGVwZW5kZW5jeTogXCIgKyBjeWNsZS5qb2luKFwiIC0+IFwiKSk7XG4gICAgICB9XG4gICAgICB2aXNpdGVkW2tleV0gPSBWSVNJVF9JTl9QUk9HUkVTUztcbiAgICAgIFxuICAgICAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgICAgICBwbGFuLnB1c2goa2V5LCBbIGZ1bmN0aW9uKCkgeyByZXR1cm4gJGluamVjdG9yLmdldCh2YWx1ZSk7IH1dLCBOT19ERVBFTkRFTkNJRVMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHBhcmFtcyA9ICRpbmplY3Rvci5hbm5vdGF0ZSh2YWx1ZSk7XG4gICAgICAgIGZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiAocGFyYW0pIHtcbiAgICAgICAgICBpZiAocGFyYW0gIT09IGtleSAmJiBpbnZvY2FibGVzLmhhc093blByb3BlcnR5KHBhcmFtKSkgdmlzaXQoaW52b2NhYmxlc1twYXJhbV0sIHBhcmFtKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHBsYW4ucHVzaChrZXksIHZhbHVlLCBwYXJhbXMpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBjeWNsZS5wb3AoKTtcbiAgICAgIHZpc2l0ZWRba2V5XSA9IFZJU0lUX0RPTkU7XG4gICAgfVxuICAgIGZvckVhY2goaW52b2NhYmxlcywgdmlzaXQpO1xuICAgIGludm9jYWJsZXMgPSBjeWNsZSA9IHZpc2l0ZWQgPSBudWxsOyAvLyBwbGFuIGlzIGFsbCB0aGF0J3MgcmVxdWlyZWRcbiAgICBcbiAgICBmdW5jdGlvbiBpc1Jlc29sdmUodmFsdWUpIHtcbiAgICAgIHJldHVybiBpc09iamVjdCh2YWx1ZSkgJiYgdmFsdWUudGhlbiAmJiB2YWx1ZS4kJHByb21pc2VzO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gZnVuY3Rpb24gKGxvY2FscywgcGFyZW50LCBzZWxmKSB7XG4gICAgICBpZiAoaXNSZXNvbHZlKGxvY2FscykgJiYgc2VsZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNlbGYgPSBwYXJlbnQ7IHBhcmVudCA9IGxvY2FsczsgbG9jYWxzID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIGlmICghbG9jYWxzKSBsb2NhbHMgPSBOT19MT0NBTFM7XG4gICAgICBlbHNlIGlmICghaXNPYmplY3QobG9jYWxzKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCInbG9jYWxzJyBtdXN0IGJlIGFuIG9iamVjdFwiKTtcbiAgICAgIH0gICAgICAgXG4gICAgICBpZiAoIXBhcmVudCkgcGFyZW50ID0gTk9fUEFSRU5UO1xuICAgICAgZWxzZSBpZiAoIWlzUmVzb2x2ZShwYXJlbnQpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIidwYXJlbnQnIG11c3QgYmUgYSBwcm9taXNlIHJldHVybmVkIGJ5ICRyZXNvbHZlLnJlc29sdmUoKVwiKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVG8gY29tcGxldGUgdGhlIG92ZXJhbGwgcmVzb2x1dGlvbiwgd2UgaGF2ZSB0byB3YWl0IGZvciB0aGUgcGFyZW50XG4gICAgICAvLyBwcm9taXNlIGFuZCBmb3IgdGhlIHByb21pc2UgZm9yIGVhY2ggaW52b2thYmxlIGluIG91ciBwbGFuLlxuICAgICAgdmFyIHJlc29sdXRpb24gPSAkcS5kZWZlcigpLFxuICAgICAgICAgIHJlc3VsdCA9IHJlc29sdXRpb24ucHJvbWlzZSxcbiAgICAgICAgICBwcm9taXNlcyA9IHJlc3VsdC4kJHByb21pc2VzID0ge30sXG4gICAgICAgICAgdmFsdWVzID0gZXh0ZW5kKHt9LCBsb2NhbHMpLFxuICAgICAgICAgIHdhaXQgPSAxICsgcGxhbi5sZW5ndGgvMyxcbiAgICAgICAgICBtZXJnZWQgPSBmYWxzZTtcbiAgICAgICAgICBcbiAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgIC8vIE1lcmdlIHBhcmVudCB2YWx1ZXMgd2UgaGF2ZW4ndCBnb3QgeWV0IGFuZCBwdWJsaXNoIG91ciBvd24gJCR2YWx1ZXNcbiAgICAgICAgaWYgKCEtLXdhaXQpIHtcbiAgICAgICAgICBpZiAoIW1lcmdlZCkgbWVyZ2UodmFsdWVzLCBwYXJlbnQuJCR2YWx1ZXMpOyBcbiAgICAgICAgICByZXN1bHQuJCR2YWx1ZXMgPSB2YWx1ZXM7XG4gICAgICAgICAgcmVzdWx0LiQkcHJvbWlzZXMgPSByZXN1bHQuJCRwcm9taXNlcyB8fCB0cnVlOyAvLyBrZWVwIGZvciBpc1Jlc29sdmUoKVxuICAgICAgICAgIGRlbGV0ZSByZXN1bHQuJCRpbmhlcml0ZWRWYWx1ZXM7XG4gICAgICAgICAgcmVzb2x1dGlvbi5yZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgZnVuY3Rpb24gZmFpbChyZWFzb24pIHtcbiAgICAgICAgcmVzdWx0LiQkZmFpbHVyZSA9IHJlYXNvbjtcbiAgICAgICAgcmVzb2x1dGlvbi5yZWplY3QocmVhc29uKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2hvcnQtY2lyY3VpdCBpZiBwYXJlbnQgaGFzIGFscmVhZHkgZmFpbGVkXG4gICAgICBpZiAoaXNEZWZpbmVkKHBhcmVudC4kJGZhaWx1cmUpKSB7XG4gICAgICAgIGZhaWwocGFyZW50LiQkZmFpbHVyZSk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChwYXJlbnQuJCRpbmhlcml0ZWRWYWx1ZXMpIHtcbiAgICAgICAgbWVyZ2UodmFsdWVzLCBvbWl0KHBhcmVudC4kJGluaGVyaXRlZFZhbHVlcywgaW52b2NhYmxlS2V5cykpO1xuICAgICAgfVxuXG4gICAgICAvLyBNZXJnZSBwYXJlbnQgdmFsdWVzIGlmIHRoZSBwYXJlbnQgaGFzIGFscmVhZHkgcmVzb2x2ZWQsIG9yIG1lcmdlXG4gICAgICAvLyBwYXJlbnQgcHJvbWlzZXMgYW5kIHdhaXQgaWYgdGhlIHBhcmVudCByZXNvbHZlIGlzIHN0aWxsIGluIHByb2dyZXNzLlxuICAgICAgZXh0ZW5kKHByb21pc2VzLCBwYXJlbnQuJCRwcm9taXNlcyk7XG4gICAgICBpZiAocGFyZW50LiQkdmFsdWVzKSB7XG4gICAgICAgIG1lcmdlZCA9IG1lcmdlKHZhbHVlcywgb21pdChwYXJlbnQuJCR2YWx1ZXMsIGludm9jYWJsZUtleXMpKTtcbiAgICAgICAgcmVzdWx0LiQkaW5oZXJpdGVkVmFsdWVzID0gb21pdChwYXJlbnQuJCR2YWx1ZXMsIGludm9jYWJsZUtleXMpO1xuICAgICAgICBkb25lKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocGFyZW50LiQkaW5oZXJpdGVkVmFsdWVzKSB7XG4gICAgICAgICAgcmVzdWx0LiQkaW5oZXJpdGVkVmFsdWVzID0gb21pdChwYXJlbnQuJCRpbmhlcml0ZWRWYWx1ZXMsIGludm9jYWJsZUtleXMpO1xuICAgICAgICB9ICAgICAgICBcbiAgICAgICAgcGFyZW50LnRoZW4oZG9uZSwgZmFpbCk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vIFByb2Nlc3MgZWFjaCBpbnZvY2FibGUgaW4gdGhlIHBsYW4sIGJ1dCBpZ25vcmUgYW55IHdoZXJlIGEgbG9jYWwgb2YgdGhlIHNhbWUgbmFtZSBleGlzdHMuXG4gICAgICBmb3IgKHZhciBpPTAsIGlpPXBsYW4ubGVuZ3RoOyBpPGlpOyBpKz0zKSB7XG4gICAgICAgIGlmIChsb2NhbHMuaGFzT3duUHJvcGVydHkocGxhbltpXSkpIGRvbmUoKTtcbiAgICAgICAgZWxzZSBpbnZva2UocGxhbltpXSwgcGxhbltpKzFdLCBwbGFuW2krMl0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICBmdW5jdGlvbiBpbnZva2Uoa2V5LCBpbnZvY2FibGUsIHBhcmFtcykge1xuICAgICAgICAvLyBDcmVhdGUgYSBkZWZlcnJlZCBmb3IgdGhpcyBpbnZvY2F0aW9uLiBGYWlsdXJlcyB3aWxsIHByb3BhZ2F0ZSB0byB0aGUgcmVzb2x1dGlvbiBhcyB3ZWxsLlxuICAgICAgICB2YXIgaW52b2NhdGlvbiA9ICRxLmRlZmVyKCksIHdhaXRQYXJhbXMgPSAwO1xuICAgICAgICBmdW5jdGlvbiBvbmZhaWx1cmUocmVhc29uKSB7XG4gICAgICAgICAgaW52b2NhdGlvbi5yZWplY3QocmVhc29uKTtcbiAgICAgICAgICBmYWlsKHJlYXNvbik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gV2FpdCBmb3IgYW55IHBhcmFtZXRlciB0aGF0IHdlIGhhdmUgYSBwcm9taXNlIGZvciAoZWl0aGVyIGZyb20gcGFyZW50IG9yIGZyb20gdGhpc1xuICAgICAgICAvLyByZXNvbHZlOyBpbiB0aGF0IGNhc2Ugc3R1ZHkoKSB3aWxsIGhhdmUgbWFkZSBzdXJlIGl0J3Mgb3JkZXJlZCBiZWZvcmUgdXMgaW4gdGhlIHBsYW4pLlxuICAgICAgICBmb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gKGRlcCkge1xuICAgICAgICAgIGlmIChwcm9taXNlcy5oYXNPd25Qcm9wZXJ0eShkZXApICYmICFsb2NhbHMuaGFzT3duUHJvcGVydHkoZGVwKSkge1xuICAgICAgICAgICAgd2FpdFBhcmFtcysrO1xuICAgICAgICAgICAgcHJvbWlzZXNbZGVwXS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgdmFsdWVzW2RlcF0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgIGlmICghKC0td2FpdFBhcmFtcykpIHByb2NlZWQoKTtcbiAgICAgICAgICAgIH0sIG9uZmFpbHVyZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF3YWl0UGFyYW1zKSBwcm9jZWVkKCk7XG4gICAgICAgIGZ1bmN0aW9uIHByb2NlZWQoKSB7XG4gICAgICAgICAgaWYgKGlzRGVmaW5lZChyZXN1bHQuJCRmYWlsdXJlKSkgcmV0dXJuO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpbnZvY2F0aW9uLnJlc29sdmUoJGluamVjdG9yLmludm9rZShpbnZvY2FibGUsIHNlbGYsIHZhbHVlcykpO1xuICAgICAgICAgICAgaW52b2NhdGlvbi5wcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgICB2YWx1ZXNba2V5XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgfSwgb25mYWlsdXJlKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBvbmZhaWx1cmUoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFB1Ymxpc2ggcHJvbWlzZSBzeW5jaHJvbm91c2x5OyBpbnZvY2F0aW9ucyBmdXJ0aGVyIGRvd24gaW4gdGhlIHBsYW4gbWF5IGRlcGVuZCBvbiBpdC5cbiAgICAgICAgcHJvbWlzZXNba2V5XSA9IGludm9jYXRpb24ucHJvbWlzZTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuICBcbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kcmVzb2x2ZSNyZXNvbHZlXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kcmVzb2x2ZVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVzb2x2ZXMgYSBzZXQgb2YgaW52b2NhYmxlcy4gQW4gaW52b2NhYmxlIGlzIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB2aWEgXG4gICAqIGAkaW5qZWN0b3IuaW52b2tlKClgLCBhbmQgY2FuIGhhdmUgYW4gYXJiaXRyYXJ5IG51bWJlciBvZiBkZXBlbmRlbmNpZXMuIFxuICAgKiBBbiBpbnZvY2FibGUgY2FuIGVpdGhlciByZXR1cm4gYSB2YWx1ZSBkaXJlY3RseSxcbiAgICogb3IgYSBgJHFgIHByb21pc2UuIElmIGEgcHJvbWlzZSBpcyByZXR1cm5lZCBpdCB3aWxsIGJlIHJlc29sdmVkIGFuZCB0aGUgXG4gICAqIHJlc3VsdGluZyB2YWx1ZSB3aWxsIGJlIHVzZWQgaW5zdGVhZC4gRGVwZW5kZW5jaWVzIG9mIGludm9jYWJsZXMgYXJlIHJlc29sdmVkIFxuICAgKiAoaW4gdGhpcyBvcmRlciBvZiBwcmVjZWRlbmNlKVxuICAgKlxuICAgKiAtIGZyb20gdGhlIHNwZWNpZmllZCBgbG9jYWxzYFxuICAgKiAtIGZyb20gYW5vdGhlciBpbnZvY2FibGUgdGhhdCBpcyBwYXJ0IG9mIHRoaXMgYCRyZXNvbHZlYCBjYWxsXG4gICAqIC0gZnJvbSBhbiBpbnZvY2FibGUgdGhhdCBpcyBpbmhlcml0ZWQgZnJvbSBhIGBwYXJlbnRgIGNhbGwgdG8gYCRyZXNvbHZlYCBcbiAgICogICAob3IgcmVjdXJzaXZlbHlcbiAgICogLSBmcm9tIGFueSBhbmNlc3RvciBgJHJlc29sdmVgIG9mIHRoYXQgcGFyZW50KS5cbiAgICpcbiAgICogVGhlIHJldHVybiB2YWx1ZSBvZiBgJHJlc29sdmVgIGlzIGEgcHJvbWlzZSBmb3IgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgXG4gICAqIChpbiB0aGlzIG9yZGVyIG9mIHByZWNlZGVuY2UpXG4gICAqXG4gICAqIC0gYW55IGBsb2NhbHNgIChpZiBzcGVjaWZpZWQpXG4gICAqIC0gdGhlIHJlc29sdmVkIHJldHVybiB2YWx1ZXMgb2YgYWxsIGluamVjdGFibGVzXG4gICAqIC0gYW55IHZhbHVlcyBpbmhlcml0ZWQgZnJvbSBhIGBwYXJlbnRgIGNhbGwgdG8gYCRyZXNvbHZlYCAoaWYgc3BlY2lmaWVkKVxuICAgKlxuICAgKiBUaGUgcHJvbWlzZSB3aWxsIHJlc29sdmUgYWZ0ZXIgdGhlIGBwYXJlbnRgIHByb21pc2UgKGlmIGFueSkgYW5kIGFsbCBwcm9taXNlcyBcbiAgICogcmV0dXJuZWQgYnkgaW5qZWN0YWJsZXMgaGF2ZSBiZWVuIHJlc29sdmVkLiBJZiBhbnkgaW52b2NhYmxlIFxuICAgKiAob3IgYCRpbmplY3Rvci5pbnZva2VgKSB0aHJvd3MgYW4gZXhjZXB0aW9uLCBvciBpZiBhIHByb21pc2UgcmV0dXJuZWQgYnkgYW4gXG4gICAqIGludm9jYWJsZSBpcyByZWplY3RlZCwgdGhlIGAkcmVzb2x2ZWAgcHJvbWlzZSBpcyBpbW1lZGlhdGVseSByZWplY3RlZCB3aXRoIHRoZSBcbiAgICogc2FtZSBlcnJvci4gQSByZWplY3Rpb24gb2YgYSBgcGFyZW50YCBwcm9taXNlIChpZiBzcGVjaWZpZWQpIHdpbGwgbGlrZXdpc2UgYmUgXG4gICAqIHByb3BhZ2F0ZWQgaW1tZWRpYXRlbHkuIE9uY2UgdGhlIGAkcmVzb2x2ZWAgcHJvbWlzZSBoYXMgYmVlbiByZWplY3RlZCwgbm8gXG4gICAqIGZ1cnRoZXIgaW52b2NhYmxlcyB3aWxsIGJlIGNhbGxlZC5cbiAgICogXG4gICAqIEN5Y2xpYyBkZXBlbmRlbmNpZXMgYmV0d2VlbiBpbnZvY2FibGVzIGFyZSBub3QgcGVybWl0dGVkIGFuZCB3aWxsIGNhdXNlIGAkcmVzb2x2ZWBcbiAgICogdG8gdGhyb3cgYW4gZXJyb3IuIEFzIGEgc3BlY2lhbCBjYXNlLCBhbiBpbmplY3RhYmxlIGNhbiBkZXBlbmQgb24gYSBwYXJhbWV0ZXIgXG4gICAqIHdpdGggdGhlIHNhbWUgbmFtZSBhcyB0aGUgaW5qZWN0YWJsZSwgd2hpY2ggd2lsbCBiZSBmdWxmaWxsZWQgZnJvbSB0aGUgYHBhcmVudGAgXG4gICAqIGluamVjdGFibGUgb2YgdGhlIHNhbWUgbmFtZS4gVGhpcyBhbGxvd3MgaW5oZXJpdGVkIHZhbHVlcyB0byBiZSBkZWNvcmF0ZWQuIFxuICAgKiBOb3RlIHRoYXQgaW4gdGhpcyBjYXNlIGFueSBvdGhlciBpbmplY3RhYmxlIGluIHRoZSBzYW1lIGAkcmVzb2x2ZWAgd2l0aCB0aGUgc2FtZVxuICAgKiBkZXBlbmRlbmN5IHdvdWxkIHNlZSB0aGUgZGVjb3JhdGVkIHZhbHVlLCBub3QgdGhlIGluaGVyaXRlZCB2YWx1ZS5cbiAgICpcbiAgICogTm90ZSB0aGF0IG1pc3NpbmcgZGVwZW5kZW5jaWVzIC0tIHVubGlrZSBjeWNsaWMgZGVwZW5kZW5jaWVzIC0tIHdpbGwgY2F1c2UgYW4gXG4gICAqIChhc3luY2hyb25vdXMpIHJlamVjdGlvbiBvZiB0aGUgYCRyZXNvbHZlYCBwcm9taXNlIHJhdGhlciB0aGFuIGEgKHN5bmNocm9ub3VzKSBcbiAgICogZXhjZXB0aW9uLlxuICAgKlxuICAgKiBJbnZvY2FibGVzIGFyZSBpbnZva2VkIGVhZ2VybHkgYXMgc29vbiBhcyBhbGwgZGVwZW5kZW5jaWVzIGFyZSBhdmFpbGFibGUuIFxuICAgKiBUaGlzIGlzIHRydWUgZXZlbiBmb3IgZGVwZW5kZW5jaWVzIGluaGVyaXRlZCBmcm9tIGEgYHBhcmVudGAgY2FsbCB0byBgJHJlc29sdmVgLlxuICAgKlxuICAgKiBBcyBhIHNwZWNpYWwgY2FzZSwgYW4gaW52b2NhYmxlIGNhbiBiZSBhIHN0cmluZywgaW4gd2hpY2ggY2FzZSBpdCBpcyB0YWtlbiB0byBcbiAgICogYmUgYSBzZXJ2aWNlIG5hbWUgdG8gYmUgcGFzc2VkIHRvIGAkaW5qZWN0b3IuZ2V0KClgLiBUaGlzIGlzIHN1cHBvcnRlZCBwcmltYXJpbHkgXG4gICAqIGZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSB3aXRoIHRoZSBgcmVzb2x2ZWAgcHJvcGVydHkgb2YgYCRyb3V0ZVByb3ZpZGVyYCBcbiAgICogcm91dGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gaW52b2NhYmxlcyBmdW5jdGlvbnMgdG8gaW52b2tlIG9yIFxuICAgKiBgJGluamVjdG9yYCBzZXJ2aWNlcyB0byBmZXRjaC5cbiAgICogQHBhcmFtIHtvYmplY3R9IGxvY2FscyAgdmFsdWVzIHRvIG1ha2UgYXZhaWxhYmxlIHRvIHRoZSBpbmplY3RhYmxlc1xuICAgKiBAcGFyYW0ge29iamVjdH0gcGFyZW50ICBhIHByb21pc2UgcmV0dXJuZWQgYnkgYW5vdGhlciBjYWxsIHRvIGAkcmVzb2x2ZWAuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWxmICB0aGUgYHRoaXNgIGZvciB0aGUgaW52b2tlZCBtZXRob2RzXG4gICAqIEByZXR1cm4ge29iamVjdH0gUHJvbWlzZSBmb3IgYW4gb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHJlc29sdmVkIHJldHVybiB2YWx1ZVxuICAgKiBvZiBhbGwgaW52b2NhYmxlcywgYXMgd2VsbCBhcyBhbnkgaW5oZXJpdGVkIGFuZCBsb2NhbCB2YWx1ZXMuXG4gICAqL1xuICB0aGlzLnJlc29sdmUgPSBmdW5jdGlvbiAoaW52b2NhYmxlcywgbG9jYWxzLCBwYXJlbnQsIHNlbGYpIHtcbiAgICByZXR1cm4gdGhpcy5zdHVkeShpbnZvY2FibGVzKShsb2NhbHMsIHBhcmVudCwgc2VsZik7XG4gIH07XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIudXRpbCcpLnNlcnZpY2UoJyRyZXNvbHZlJywgJFJlc29sdmUpO1xuXG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeVxuICpcbiAqIEByZXF1aXJlcyAkaHR0cFxuICogQHJlcXVpcmVzICR0ZW1wbGF0ZUNhY2hlXG4gKiBAcmVxdWlyZXMgJGluamVjdG9yXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBTZXJ2aWNlLiBNYW5hZ2VzIGxvYWRpbmcgb2YgdGVtcGxhdGVzLlxuICovXG4kVGVtcGxhdGVGYWN0b3J5LiRpbmplY3QgPSBbJyRodHRwJywgJyR0ZW1wbGF0ZUNhY2hlJywgJyRpbmplY3RvciddO1xuZnVuY3Rpb24gJFRlbXBsYXRlRmFjdG9yeSggICRodHRwLCAgICR0ZW1wbGF0ZUNhY2hlLCAgICRpbmplY3Rvcikge1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tQ29uZmlnXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBDcmVhdGVzIGEgdGVtcGxhdGUgZnJvbSBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0LiBcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyBDb25maWd1cmF0aW9uIG9iamVjdCBmb3Igd2hpY2ggdG8gbG9hZCBhIHRlbXBsYXRlLiBcbiAgICogVGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzIGFyZSBzZWFyY2ggaW4gdGhlIHNwZWNpZmllZCBvcmRlciwgYW5kIHRoZSBmaXJzdCBvbmUgXG4gICAqIHRoYXQgaXMgZGVmaW5lZCBpcyB1c2VkIHRvIGNyZWF0ZSB0aGUgdGVtcGxhdGU6XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gY29uZmlnLnRlbXBsYXRlIGh0bWwgc3RyaW5nIHRlbXBsYXRlIG9yIGZ1bmN0aW9uIHRvIFxuICAgKiBsb2FkIHZpYSB7QGxpbmsgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tU3RyaW5nIGZyb21TdHJpbmd9LlxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IGNvbmZpZy50ZW1wbGF0ZVVybCB1cmwgdG8gbG9hZCBvciBhIGZ1bmN0aW9uIHJldHVybmluZyBcbiAgICogdGhlIHVybCB0byBsb2FkIHZpYSB7QGxpbmsgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tVXJsIGZyb21Vcmx9LlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjb25maWcudGVtcGxhdGVQcm92aWRlciBmdW5jdGlvbiB0byBpbnZva2UgdmlhIFxuICAgKiB7QGxpbmsgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tUHJvdmlkZXIgZnJvbVByb3ZpZGVyfS5cbiAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyAgUGFyYW1ldGVycyB0byBwYXNzIHRvIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbi5cbiAgICogQHBhcmFtIHtvYmplY3R9IGxvY2FscyBMb2NhbHMgdG8gcGFzcyB0byBgaW52b2tlYCBpZiB0aGUgdGVtcGxhdGUgaXMgbG9hZGVkIFxuICAgKiB2aWEgYSBgdGVtcGxhdGVQcm92aWRlcmAuIERlZmF1bHRzIHRvIGB7IHBhcmFtczogcGFyYW1zIH1gLlxuICAgKlxuICAgKiBAcmV0dXJuIHtzdHJpbmd8b2JqZWN0fSAgVGhlIHRlbXBsYXRlIGh0bWwgYXMgYSBzdHJpbmcsIG9yIGEgcHJvbWlzZSBmb3IgXG4gICAqIHRoYXQgc3RyaW5nLG9yIGBudWxsYCBpZiBubyB0ZW1wbGF0ZSBpcyBjb25maWd1cmVkLlxuICAgKi9cbiAgdGhpcy5mcm9tQ29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZywgcGFyYW1zLCBsb2NhbHMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgaXNEZWZpbmVkKGNvbmZpZy50ZW1wbGF0ZSkgPyB0aGlzLmZyb21TdHJpbmcoY29uZmlnLnRlbXBsYXRlLCBwYXJhbXMpIDpcbiAgICAgIGlzRGVmaW5lZChjb25maWcudGVtcGxhdGVVcmwpID8gdGhpcy5mcm9tVXJsKGNvbmZpZy50ZW1wbGF0ZVVybCwgcGFyYW1zKSA6XG4gICAgICBpc0RlZmluZWQoY29uZmlnLnRlbXBsYXRlUHJvdmlkZXIpID8gdGhpcy5mcm9tUHJvdmlkZXIoY29uZmlnLnRlbXBsYXRlUHJvdmlkZXIsIHBhcmFtcywgbG9jYWxzKSA6XG4gICAgICBudWxsXG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVN0cmluZ1xuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ3JlYXRlcyBhIHRlbXBsYXRlIGZyb20gYSBzdHJpbmcgb3IgYSBmdW5jdGlvbiByZXR1cm5pbmcgYSBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gdGVtcGxhdGUgaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZyBvciBmdW5jdGlvbiB0aGF0IFxuICAgKiByZXR1cm5zIGFuIGh0bWwgdGVtcGxhdGUgYXMgYSBzdHJpbmcuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXMgUGFyYW1ldGVycyB0byBwYXNzIHRvIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7c3RyaW5nfG9iamVjdH0gVGhlIHRlbXBsYXRlIGh0bWwgYXMgYSBzdHJpbmcsIG9yIGEgcHJvbWlzZSBmb3IgdGhhdCBcbiAgICogc3RyaW5nLlxuICAgKi9cbiAgdGhpcy5mcm9tU3RyaW5nID0gZnVuY3Rpb24gKHRlbXBsYXRlLCBwYXJhbXMpIHtcbiAgICByZXR1cm4gaXNGdW5jdGlvbih0ZW1wbGF0ZSkgPyB0ZW1wbGF0ZShwYXJhbXMpIDogdGVtcGxhdGU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21VcmxcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcbiAgICogXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBMb2FkcyBhIHRlbXBsYXRlIGZyb20gdGhlIGEgVVJMIHZpYSBgJGh0dHBgIGFuZCBgJHRlbXBsYXRlQ2FjaGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xGdW5jdGlvbn0gdXJsIHVybCBvZiB0aGUgdGVtcGxhdGUgdG8gbG9hZCwgb3IgYSBmdW5jdGlvbiBcbiAgICogdGhhdCByZXR1cm5zIGEgdXJsLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIFBhcmFtZXRlcnMgdG8gcGFzcyB0byB0aGUgdXJsIGZ1bmN0aW9uLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd8UHJvbWlzZS48c3RyaW5nPn0gVGhlIHRlbXBsYXRlIGh0bWwgYXMgYSBzdHJpbmcsIG9yIGEgcHJvbWlzZSBcbiAgICogZm9yIHRoYXQgc3RyaW5nLlxuICAgKi9cbiAgdGhpcy5mcm9tVXJsID0gZnVuY3Rpb24gKHVybCwgcGFyYW1zKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odXJsKSkgdXJsID0gdXJsKHBhcmFtcyk7XG4gICAgaWYgKHVybCA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICBlbHNlIHJldHVybiAkaHR0cFxuICAgICAgICAuZ2V0KHVybCwgeyBjYWNoZTogJHRlbXBsYXRlQ2FjaGUsIGhlYWRlcnM6IHsgQWNjZXB0OiAndGV4dC9odG1sJyB9fSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmRhdGE7IH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tUHJvdmlkZXJcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIENyZWF0ZXMgYSB0ZW1wbGF0ZSBieSBpbnZva2luZyBhbiBpbmplY3RhYmxlIHByb3ZpZGVyIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcm92aWRlciBGdW5jdGlvbiB0byBpbnZva2UgdmlhIGAkaW5qZWN0b3IuaW52b2tlYFxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIFBhcmFtZXRlcnMgZm9yIHRoZSB0ZW1wbGF0ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IGxvY2FscyBMb2NhbHMgdG8gcGFzcyB0byBgaW52b2tlYC4gRGVmYXVsdHMgdG8gXG4gICAqIGB7IHBhcmFtczogcGFyYW1zIH1gLlxuICAgKiBAcmV0dXJuIHtzdHJpbmd8UHJvbWlzZS48c3RyaW5nPn0gVGhlIHRlbXBsYXRlIGh0bWwgYXMgYSBzdHJpbmcsIG9yIGEgcHJvbWlzZSBcbiAgICogZm9yIHRoYXQgc3RyaW5nLlxuICAgKi9cbiAgdGhpcy5mcm9tUHJvdmlkZXIgPSBmdW5jdGlvbiAocHJvdmlkZXIsIHBhcmFtcywgbG9jYWxzKSB7XG4gICAgcmV0dXJuICRpbmplY3Rvci5pbnZva2UocHJvdmlkZXIsIG51bGwsIGxvY2FscyB8fCB7IHBhcmFtczogcGFyYW1zIH0pO1xuICB9O1xufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnV0aWwnKS5zZXJ2aWNlKCckdGVtcGxhdGVGYWN0b3J5JywgJFRlbXBsYXRlRmFjdG9yeSk7XG5cbnZhciAkJFVNRlA7IC8vIHJlZmVyZW5jZSB0byAkVXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlclxuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogTWF0Y2hlcyBVUkxzIGFnYWluc3QgcGF0dGVybnMgYW5kIGV4dHJhY3RzIG5hbWVkIHBhcmFtZXRlcnMgZnJvbSB0aGUgcGF0aCBvciB0aGUgc2VhcmNoXG4gKiBwYXJ0IG9mIHRoZSBVUkwuIEEgVVJMIHBhdHRlcm4gY29uc2lzdHMgb2YgYSBwYXRoIHBhdHRlcm4sIG9wdGlvbmFsbHkgZm9sbG93ZWQgYnkgJz8nIGFuZCBhIGxpc3RcbiAqIG9mIHNlYXJjaCBwYXJhbWV0ZXJzLiBNdWx0aXBsZSBzZWFyY2ggcGFyYW1ldGVyIG5hbWVzIGFyZSBzZXBhcmF0ZWQgYnkgJyYnLiBTZWFyY2ggcGFyYW1ldGVyc1xuICogZG8gbm90IGluZmx1ZW5jZSB3aGV0aGVyIG9yIG5vdCBhIFVSTCBpcyBtYXRjaGVkLCBidXQgdGhlaXIgdmFsdWVzIGFyZSBwYXNzZWQgdGhyb3VnaCBpbnRvXG4gKiB0aGUgbWF0Y2hlZCBwYXJhbWV0ZXJzIHJldHVybmVkIGJ5IHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIjbWV0aG9kc19leGVjIGV4ZWN9LlxuICpcbiAqIFBhdGggcGFyYW1ldGVyIHBsYWNlaG9sZGVycyBjYW4gYmUgc3BlY2lmaWVkIHVzaW5nIHNpbXBsZSBjb2xvbi9jYXRjaC1hbGwgc3ludGF4IG9yIGN1cmx5IGJyYWNlXG4gKiBzeW50YXgsIHdoaWNoIG9wdGlvbmFsbHkgYWxsb3dzIGEgcmVndWxhciBleHByZXNzaW9uIGZvciB0aGUgcGFyYW1ldGVyIHRvIGJlIHNwZWNpZmllZDpcbiAqXG4gKiAqIGAnOidgIG5hbWUgLSBjb2xvbiBwbGFjZWhvbGRlclxuICogKiBgJyonYCBuYW1lIC0gY2F0Y2gtYWxsIHBsYWNlaG9sZGVyXG4gKiAqIGAneycgbmFtZSAnfSdgIC0gY3VybHkgcGxhY2Vob2xkZXJcbiAqICogYCd7JyBuYW1lICc6JyByZWdleHB8dHlwZSAnfSdgIC0gY3VybHkgcGxhY2Vob2xkZXIgd2l0aCByZWdleHAgb3IgdHlwZSBuYW1lLiBTaG91bGQgdGhlXG4gKiAgIHJlZ2V4cCBpdHNlbGYgY29udGFpbiBjdXJseSBicmFjZXMsIHRoZXkgbXVzdCBiZSBpbiBtYXRjaGVkIHBhaXJzIG9yIGVzY2FwZWQgd2l0aCBhIGJhY2tzbGFzaC5cbiAqXG4gKiBQYXJhbWV0ZXIgbmFtZXMgbWF5IGNvbnRhaW4gb25seSB3b3JkIGNoYXJhY3RlcnMgKGxhdGluIGxldHRlcnMsIGRpZ2l0cywgYW5kIHVuZGVyc2NvcmUpIGFuZFxuICogbXVzdCBiZSB1bmlxdWUgd2l0aGluIHRoZSBwYXR0ZXJuIChhY3Jvc3MgYm90aCBwYXRoIGFuZCBzZWFyY2ggcGFyYW1ldGVycykuIEZvciBjb2xvblxuICogcGxhY2Vob2xkZXJzIG9yIGN1cmx5IHBsYWNlaG9sZGVycyB3aXRob3V0IGFuIGV4cGxpY2l0IHJlZ2V4cCwgYSBwYXRoIHBhcmFtZXRlciBtYXRjaGVzIGFueVxuICogbnVtYmVyIG9mIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiAnLycuIEZvciBjYXRjaC1hbGwgcGxhY2Vob2xkZXJzIHRoZSBwYXRoIHBhcmFtZXRlciBtYXRjaGVzXG4gKiBhbnkgbnVtYmVyIG9mIGNoYXJhY3RlcnMuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogKiBgJy9oZWxsby8nYCAtIE1hdGNoZXMgb25seSBpZiB0aGUgcGF0aCBpcyBleGFjdGx5ICcvaGVsbG8vJy4gVGhlcmUgaXMgbm8gc3BlY2lhbCB0cmVhdG1lbnQgZm9yXG4gKiAgIHRyYWlsaW5nIHNsYXNoZXMsIGFuZCBwYXR0ZXJucyBoYXZlIHRvIG1hdGNoIHRoZSBlbnRpcmUgcGF0aCwgbm90IGp1c3QgYSBwcmVmaXguXG4gKiAqIGAnL3VzZXIvOmlkJ2AgLSBNYXRjaGVzICcvdXNlci9ib2InIG9yICcvdXNlci8xMjM0ISEhJyBvciBldmVuICcvdXNlci8nIGJ1dCBub3QgJy91c2VyJyBvclxuICogICAnL3VzZXIvYm9iL2RldGFpbHMnLiBUaGUgc2Vjb25kIHBhdGggc2VnbWVudCB3aWxsIGJlIGNhcHR1cmVkIGFzIHRoZSBwYXJhbWV0ZXIgJ2lkJy5cbiAqICogYCcvdXNlci97aWR9J2AgLSBTYW1lIGFzIHRoZSBwcmV2aW91cyBleGFtcGxlLCBidXQgdXNpbmcgY3VybHkgYnJhY2Ugc3ludGF4LlxuICogKiBgJy91c2VyL3tpZDpbXi9dKn0nYCAtIFNhbWUgYXMgdGhlIHByZXZpb3VzIGV4YW1wbGUuXG4gKiAqIGAnL3VzZXIve2lkOlswLTlhLWZBLUZdezEsOH19J2AgLSBTaW1pbGFyIHRvIHRoZSBwcmV2aW91cyBleGFtcGxlLCBidXQgb25seSBtYXRjaGVzIGlmIHRoZSBpZFxuICogICBwYXJhbWV0ZXIgY29uc2lzdHMgb2YgMSB0byA4IGhleCBkaWdpdHMuXG4gKiAqIGAnL2ZpbGVzL3twYXRoOi4qfSdgIC0gTWF0Y2hlcyBhbnkgVVJMIHN0YXJ0aW5nIHdpdGggJy9maWxlcy8nIGFuZCBjYXB0dXJlcyB0aGUgcmVzdCBvZiB0aGVcbiAqICAgcGF0aCBpbnRvIHRoZSBwYXJhbWV0ZXIgJ3BhdGgnLlxuICogKiBgJy9maWxlcy8qcGF0aCdgIC0gZGl0dG8uXG4gKiAqIGAnL2NhbGVuZGFyL3tzdGFydDpkYXRlfSdgIC0gTWF0Y2hlcyBcIi9jYWxlbmRhci8yMDE0LTExLTEyXCIgKGJlY2F1c2UgdGhlIHBhdHRlcm4gZGVmaW5lZFxuICogICBpbiB0aGUgYnVpbHQtaW4gIGBkYXRlYCBUeXBlIG1hdGNoZXMgYDIwMTQtMTEtMTJgKSBhbmQgcHJvdmlkZXMgYSBEYXRlIG9iamVjdCBpbiAkc3RhdGVQYXJhbXMuc3RhcnRcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiAgVGhlIHBhdHRlcm4gdG8gY29tcGlsZSBpbnRvIGEgbWF0Y2hlci5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgIEEgY29uZmlndXJhdGlvbiBvYmplY3QgaGFzaDpcbiAqIEBwYXJhbSB7T2JqZWN0PX0gcGFyZW50TWF0Y2hlciBVc2VkIHRvIGNvbmNhdGVuYXRlIHRoZSBwYXR0ZXJuL2NvbmZpZyBvbnRvXG4gKiAgIGFuIGV4aXN0aW5nIFVybE1hdGNoZXJcbiAqXG4gKiAqIGBjYXNlSW5zZW5zaXRpdmVgIC0gYHRydWVgIGlmIFVSTCBtYXRjaGluZyBzaG91bGQgYmUgY2FzZSBpbnNlbnNpdGl2ZSwgb3RoZXJ3aXNlIGBmYWxzZWAsIHRoZSBkZWZhdWx0IHZhbHVlIChmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSkgaXMgYGZhbHNlYC5cbiAqICogYHN0cmljdGAgLSBgZmFsc2VgIGlmIG1hdGNoaW5nIGFnYWluc3QgYSBVUkwgd2l0aCBhIHRyYWlsaW5nIHNsYXNoIHNob3VsZCBiZSB0cmVhdGVkIGFzIGVxdWl2YWxlbnQgdG8gYSBVUkwgd2l0aG91dCBhIHRyYWlsaW5nIHNsYXNoLCB0aGUgZGVmYXVsdCB2YWx1ZSBpcyBgdHJ1ZWAuXG4gKlxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByZWZpeCAgQSBzdGF0aWMgcHJlZml4IG9mIHRoaXMgcGF0dGVybi4gVGhlIG1hdGNoZXIgZ3VhcmFudGVlcyB0aGF0IGFueVxuICogICBVUkwgbWF0Y2hpbmcgdGhpcyBtYXRjaGVyIChpLmUuIGFueSBzdHJpbmcgZm9yIHdoaWNoIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIjbWV0aG9kc19leGVjIGV4ZWMoKX0gcmV0dXJuc1xuICogICBub24tbnVsbCkgd2lsbCBzdGFydCB3aXRoIHRoaXMgcHJlZml4LlxuICpcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzb3VyY2UgIFRoZSBwYXR0ZXJuIHRoYXQgd2FzIHBhc3NlZCBpbnRvIHRoZSBjb25zdHJ1Y3RvclxuICpcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzb3VyY2VQYXRoICBUaGUgcGF0aCBwb3J0aW9uIG9mIHRoZSBzb3VyY2UgcHJvcGVydHlcbiAqXG4gKiBAcHJvcGVydHkge3N0cmluZ30gc291cmNlU2VhcmNoICBUaGUgc2VhcmNoIHBvcnRpb24gb2YgdGhlIHNvdXJjZSBwcm9wZXJ0eVxuICpcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSByZWdleCAgVGhlIGNvbnN0cnVjdGVkIHJlZ2V4IHRoYXQgd2lsbCBiZSB1c2VkIHRvIG1hdGNoIGFnYWluc3QgdGhlIHVybCB3aGVuXG4gKiAgIGl0IGlzIHRpbWUgdG8gZGV0ZXJtaW5lIHdoaWNoIHVybCB3aWxsIG1hdGNoLlxuICpcbiAqIEByZXR1cm5zIHtPYmplY3R9ICBOZXcgYFVybE1hdGNoZXJgIG9iamVjdFxuICovXG5mdW5jdGlvbiBVcmxNYXRjaGVyKHBhdHRlcm4sIGNvbmZpZywgcGFyZW50TWF0Y2hlcikge1xuICBjb25maWcgPSBleHRlbmQoeyBwYXJhbXM6IHt9IH0sIGlzT2JqZWN0KGNvbmZpZykgPyBjb25maWcgOiB7fSk7XG5cbiAgLy8gRmluZCBhbGwgcGxhY2Vob2xkZXJzIGFuZCBjcmVhdGUgYSBjb21waWxlZCBwYXR0ZXJuLCB1c2luZyBlaXRoZXIgY2xhc3NpYyBvciBjdXJseSBzeW50YXg6XG4gIC8vICAgJyonIG5hbWVcbiAgLy8gICAnOicgbmFtZVxuICAvLyAgICd7JyBuYW1lICd9J1xuICAvLyAgICd7JyBuYW1lICc6JyByZWdleHAgJ30nXG4gIC8vIFRoZSByZWd1bGFyIGV4cHJlc3Npb24gaXMgc29tZXdoYXQgY29tcGxpY2F0ZWQgZHVlIHRvIHRoZSBuZWVkIHRvIGFsbG93IGN1cmx5IGJyYWNlc1xuICAvLyBpbnNpZGUgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbi4gVGhlIHBsYWNlaG9sZGVyIHJlZ2V4cCBicmVha3MgZG93biBhcyBmb2xsb3dzOlxuICAvLyAgICAoWzoqXSkoW1xcd1xcW1xcXV0rKSAgICAgICAgICAgICAgLSBjbGFzc2ljIHBsYWNlaG9sZGVyICgkMSAvICQyKSAoc2VhcmNoIHZlcnNpb24gaGFzIC0gZm9yIHNuYWtlLWNhc2UpXG4gIC8vICAgIFxceyhbXFx3XFxbXFxdXSspKD86XFw6XFxzKiggLi4uICkpP1xcfSAgLSBjdXJseSBicmFjZSBwbGFjZWhvbGRlciAoJDMpIHdpdGggb3B0aW9uYWwgcmVnZXhwL3R5cGUgLi4uICgkNCkgKHNlYXJjaCB2ZXJzaW9uIGhhcyAtIGZvciBzbmFrZS1jYXNlXG4gIC8vICAgICg/OiAuLi4gfCAuLi4gfCAuLi4gKSsgICAgICAgICAtIHRoZSByZWdleHAgY29uc2lzdHMgb2YgYW55IG51bWJlciBvZiBhdG9tcywgYW4gYXRvbSBiZWluZyBlaXRoZXJcbiAgLy8gICAgW157fVxcXFxdKyAgICAgICAgICAgICAgICAgICAgICAgLSBhbnl0aGluZyBvdGhlciB0aGFuIGN1cmx5IGJyYWNlcyBvciBiYWNrc2xhc2hcbiAgLy8gICAgXFxcXC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBhIGJhY2tzbGFzaCBlc2NhcGVcbiAgLy8gICAgXFx7KD86W157fVxcXFxdK3xcXFxcLikqXFx9ICAgICAgICAgIC0gYSBtYXRjaGVkIHNldCBvZiBjdXJseSBicmFjZXMgY29udGFpbmluZyBvdGhlciBhdG9tc1xuICB2YXIgcGxhY2Vob2xkZXIgICAgICAgPSAvKFs6Kl0pKFtcXHdcXFtcXF1dKyl8XFx7KFtcXHdcXFtcXF1dKykoPzpcXDpcXHMqKCg/Oltee31cXFxcXSt8XFxcXC58XFx7KD86W157fVxcXFxdK3xcXFxcLikqXFx9KSspKT9cXH0vZyxcbiAgICAgIHNlYXJjaFBsYWNlaG9sZGVyID0gLyhbOl0/KShbXFx3XFxbXFxdLi1dKyl8XFx7KFtcXHdcXFtcXF0uLV0rKSg/OlxcOlxccyooKD86W157fVxcXFxdK3xcXFxcLnxcXHsoPzpbXnt9XFxcXF0rfFxcXFwuKSpcXH0pKykpP1xcfS9nLFxuICAgICAgY29tcGlsZWQgPSAnXicsIGxhc3QgPSAwLCBtLFxuICAgICAgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzID0gW10sXG4gICAgICBwYXJlbnRQYXJhbXMgPSBwYXJlbnRNYXRjaGVyID8gcGFyZW50TWF0Y2hlci5wYXJhbXMgOiB7fSxcbiAgICAgIHBhcmFtcyA9IHRoaXMucGFyYW1zID0gcGFyZW50TWF0Y2hlciA/IHBhcmVudE1hdGNoZXIucGFyYW1zLiQkbmV3KCkgOiBuZXcgJCRVTUZQLlBhcmFtU2V0KCksXG4gICAgICBwYXJhbU5hbWVzID0gW107XG5cbiAgZnVuY3Rpb24gYWRkUGFyYW1ldGVyKGlkLCB0eXBlLCBjb25maWcsIGxvY2F0aW9uKSB7XG4gICAgcGFyYW1OYW1lcy5wdXNoKGlkKTtcbiAgICBpZiAocGFyZW50UGFyYW1zW2lkXSkgcmV0dXJuIHBhcmVudFBhcmFtc1tpZF07XG4gICAgaWYgKCEvXlxcdysoWy0uXStcXHcrKSooPzpcXFtcXF0pPyQvLnRlc3QoaWQpKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHBhcmFtZXRlciBuYW1lICdcIiArIGlkICsgXCInIGluIHBhdHRlcm4gJ1wiICsgcGF0dGVybiArIFwiJ1wiKTtcbiAgICBpZiAocGFyYW1zW2lkXSkgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlIHBhcmFtZXRlciBuYW1lICdcIiArIGlkICsgXCInIGluIHBhdHRlcm4gJ1wiICsgcGF0dGVybiArIFwiJ1wiKTtcbiAgICBwYXJhbXNbaWRdID0gbmV3ICQkVU1GUC5QYXJhbShpZCwgdHlwZSwgY29uZmlnLCBsb2NhdGlvbik7XG4gICAgcmV0dXJuIHBhcmFtc1tpZF07XG4gIH1cblxuICBmdW5jdGlvbiBxdW90ZVJlZ0V4cChzdHJpbmcsIHBhdHRlcm4sIHNxdWFzaCwgb3B0aW9uYWwpIHtcbiAgICB2YXIgc3Vycm91bmRQYXR0ZXJuID0gWycnLCcnXSwgcmVzdWx0ID0gc3RyaW5nLnJlcGxhY2UoL1tcXFxcXFxbXFxdXFxeJCorPy4oKXx7fV0vZywgXCJcXFxcJCZcIik7XG4gICAgaWYgKCFwYXR0ZXJuKSByZXR1cm4gcmVzdWx0O1xuICAgIHN3aXRjaChzcXVhc2gpIHtcbiAgICAgIGNhc2UgZmFsc2U6IHN1cnJvdW5kUGF0dGVybiA9IFsnKCcsICcpJyArIChvcHRpb25hbCA/IFwiP1wiIDogXCJcIildOyBicmVhaztcbiAgICAgIGNhc2UgdHJ1ZTpcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1xcLyQvLCAnJyk7XG4gICAgICAgIHN1cnJvdW5kUGF0dGVybiA9IFsnKD86XFwvKCcsICcpfFxcLyk/J107XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6ICAgIHN1cnJvdW5kUGF0dGVybiA9IFsnKCcgKyBzcXVhc2ggKyBcInxcIiwgJyk/J107IGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0ICsgc3Vycm91bmRQYXR0ZXJuWzBdICsgcGF0dGVybiArIHN1cnJvdW5kUGF0dGVyblsxXTtcbiAgfVxuXG4gIHRoaXMuc291cmNlID0gcGF0dGVybjtcblxuICAvLyBTcGxpdCBpbnRvIHN0YXRpYyBzZWdtZW50cyBzZXBhcmF0ZWQgYnkgcGF0aCBwYXJhbWV0ZXIgcGxhY2Vob2xkZXJzLlxuICAvLyBUaGUgbnVtYmVyIG9mIHNlZ21lbnRzIGlzIGFsd2F5cyAxIG1vcmUgdGhhbiB0aGUgbnVtYmVyIG9mIHBhcmFtZXRlcnMuXG4gIGZ1bmN0aW9uIG1hdGNoRGV0YWlscyhtLCBpc1NlYXJjaCkge1xuICAgIHZhciBpZCwgcmVnZXhwLCBzZWdtZW50LCB0eXBlLCBjZmcsIGFycmF5TW9kZTtcbiAgICBpZCAgICAgICAgICA9IG1bMl0gfHwgbVszXTsgLy8gSUVbNzhdIHJldHVybnMgJycgZm9yIHVubWF0Y2hlZCBncm91cHMgaW5zdGVhZCBvZiBudWxsXG4gICAgY2ZnICAgICAgICAgPSBjb25maWcucGFyYW1zW2lkXTtcbiAgICBzZWdtZW50ICAgICA9IHBhdHRlcm4uc3Vic3RyaW5nKGxhc3QsIG0uaW5kZXgpO1xuICAgIHJlZ2V4cCAgICAgID0gaXNTZWFyY2ggPyBtWzRdIDogbVs0XSB8fCAobVsxXSA9PSAnKicgPyAnLionIDogbnVsbCk7XG5cbiAgICBpZiAocmVnZXhwKSB7XG4gICAgICB0eXBlICAgICAgPSAkJFVNRlAudHlwZShyZWdleHApIHx8IGluaGVyaXQoJCRVTUZQLnR5cGUoXCJzdHJpbmdcIiksIHsgcGF0dGVybjogbmV3IFJlZ0V4cChyZWdleHAsIGNvbmZpZy5jYXNlSW5zZW5zaXRpdmUgPyAnaScgOiB1bmRlZmluZWQpIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBpZDogaWQsIHJlZ2V4cDogcmVnZXhwLCBzZWdtZW50OiBzZWdtZW50LCB0eXBlOiB0eXBlLCBjZmc6IGNmZ1xuICAgIH07XG4gIH1cblxuICB2YXIgcCwgcGFyYW0sIHNlZ21lbnQ7XG4gIHdoaWxlICgobSA9IHBsYWNlaG9sZGVyLmV4ZWMocGF0dGVybikpKSB7XG4gICAgcCA9IG1hdGNoRGV0YWlscyhtLCBmYWxzZSk7XG4gICAgaWYgKHAuc2VnbWVudC5pbmRleE9mKCc/JykgPj0gMCkgYnJlYWs7IC8vIHdlJ3JlIGludG8gdGhlIHNlYXJjaCBwYXJ0XG5cbiAgICBwYXJhbSA9IGFkZFBhcmFtZXRlcihwLmlkLCBwLnR5cGUsIHAuY2ZnLCBcInBhdGhcIik7XG4gICAgY29tcGlsZWQgKz0gcXVvdGVSZWdFeHAocC5zZWdtZW50LCBwYXJhbS50eXBlLnBhdHRlcm4uc291cmNlLCBwYXJhbS5zcXVhc2gsIHBhcmFtLmlzT3B0aW9uYWwpO1xuICAgIHNlZ21lbnRzLnB1c2gocC5zZWdtZW50KTtcbiAgICBsYXN0ID0gcGxhY2Vob2xkZXIubGFzdEluZGV4O1xuICB9XG4gIHNlZ21lbnQgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0KTtcblxuICAvLyBGaW5kIGFueSBzZWFyY2ggcGFyYW1ldGVyIG5hbWVzIGFuZCByZW1vdmUgdGhlbSBmcm9tIHRoZSBsYXN0IHNlZ21lbnRcbiAgdmFyIGkgPSBzZWdtZW50LmluZGV4T2YoJz8nKTtcblxuICBpZiAoaSA+PSAwKSB7XG4gICAgdmFyIHNlYXJjaCA9IHRoaXMuc291cmNlU2VhcmNoID0gc2VnbWVudC5zdWJzdHJpbmcoaSk7XG4gICAgc2VnbWVudCA9IHNlZ21lbnQuc3Vic3RyaW5nKDAsIGkpO1xuICAgIHRoaXMuc291cmNlUGF0aCA9IHBhdHRlcm4uc3Vic3RyaW5nKDAsIGxhc3QgKyBpKTtcblxuICAgIGlmIChzZWFyY2gubGVuZ3RoID4gMCkge1xuICAgICAgbGFzdCA9IDA7XG4gICAgICB3aGlsZSAoKG0gPSBzZWFyY2hQbGFjZWhvbGRlci5leGVjKHNlYXJjaCkpKSB7XG4gICAgICAgIHAgPSBtYXRjaERldGFpbHMobSwgdHJ1ZSk7XG4gICAgICAgIHBhcmFtID0gYWRkUGFyYW1ldGVyKHAuaWQsIHAudHlwZSwgcC5jZmcsIFwic2VhcmNoXCIpO1xuICAgICAgICBsYXN0ID0gcGxhY2Vob2xkZXIubGFzdEluZGV4O1xuICAgICAgICAvLyBjaGVjayBpZiA/JlxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLnNvdXJjZVBhdGggPSBwYXR0ZXJuO1xuICAgIHRoaXMuc291cmNlU2VhcmNoID0gJyc7XG4gIH1cblxuICBjb21waWxlZCArPSBxdW90ZVJlZ0V4cChzZWdtZW50KSArIChjb25maWcuc3RyaWN0ID09PSBmYWxzZSA/ICdcXC8/JyA6ICcnKSArICckJztcbiAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcblxuICB0aGlzLnJlZ2V4cCA9IG5ldyBSZWdFeHAoY29tcGlsZWQsIGNvbmZpZy5jYXNlSW5zZW5zaXRpdmUgPyAnaScgOiB1bmRlZmluZWQpO1xuICB0aGlzLnByZWZpeCA9IHNlZ21lbnRzWzBdO1xuICB0aGlzLiQkcGFyYW1OYW1lcyA9IHBhcmFtTmFtZXM7XG59XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIjY29uY2F0XG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBSZXR1cm5zIGEgbmV3IG1hdGNoZXIgZm9yIGEgcGF0dGVybiBjb25zdHJ1Y3RlZCBieSBhcHBlbmRpbmcgdGhlIHBhdGggcGFydCBhbmQgYWRkaW5nIHRoZVxuICogc2VhcmNoIHBhcmFtZXRlcnMgb2YgdGhlIHNwZWNpZmllZCBwYXR0ZXJuIHRvIHRoaXMgcGF0dGVybi4gVGhlIGN1cnJlbnQgcGF0dGVybiBpcyBub3RcbiAqIG1vZGlmaWVkLiBUaGlzIGNhbiBiZSB1bmRlcnN0b29kIGFzIGNyZWF0aW5nIGEgcGF0dGVybiBmb3IgVVJMcyB0aGF0IGFyZSByZWxhdGl2ZSB0byAob3JcbiAqIHN1ZmZpeGVzIG9mKSB0aGUgY3VycmVudCBwYXR0ZXJuLlxuICpcbiAqIEBleGFtcGxlXG4gKiBUaGUgZm9sbG93aW5nIHR3byBtYXRjaGVycyBhcmUgZXF1aXZhbGVudDpcbiAqIDxwcmU+XG4gKiBuZXcgVXJsTWF0Y2hlcignL3VzZXIve2lkfT9xJykuY29uY2F0KCcvZGV0YWlscz9kYXRlJyk7XG4gKiBuZXcgVXJsTWF0Y2hlcignL3VzZXIve2lkfS9kZXRhaWxzP3EmZGF0ZScpO1xuICogPC9wcmU+XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm4gIFRoZSBwYXR0ZXJuIHRvIGFwcGVuZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgIEFuIG9iamVjdCBoYXNoIG9mIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgbWF0Y2hlci5cbiAqIEByZXR1cm5zIHtVcmxNYXRjaGVyfSAgQSBtYXRjaGVyIGZvciB0aGUgY29uY2F0ZW5hdGVkIHBhdHRlcm4uXG4gKi9cblVybE1hdGNoZXIucHJvdG90eXBlLmNvbmNhdCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBjb25maWcpIHtcbiAgLy8gQmVjYXVzZSBvcmRlciBvZiBzZWFyY2ggcGFyYW1ldGVycyBpcyBpcnJlbGV2YW50LCB3ZSBjYW4gYWRkIG91ciBvd24gc2VhcmNoXG4gIC8vIHBhcmFtZXRlcnMgdG8gdGhlIGVuZCBvZiB0aGUgbmV3IHBhdHRlcm4uIFBhcnNlIHRoZSBuZXcgcGF0dGVybiBieSBpdHNlbGZcbiAgLy8gYW5kIHRoZW4gam9pbiB0aGUgYml0cyB0b2dldGhlciwgYnV0IGl0J3MgbXVjaCBlYXNpZXIgdG8gZG8gdGhpcyBvbiBhIHN0cmluZyBsZXZlbC5cbiAgdmFyIGRlZmF1bHRDb25maWcgPSB7XG4gICAgY2FzZUluc2Vuc2l0aXZlOiAkJFVNRlAuY2FzZUluc2Vuc2l0aXZlKCksXG4gICAgc3RyaWN0OiAkJFVNRlAuc3RyaWN0TW9kZSgpLFxuICAgIHNxdWFzaDogJCRVTUZQLmRlZmF1bHRTcXVhc2hQb2xpY3koKVxuICB9O1xuICByZXR1cm4gbmV3IFVybE1hdGNoZXIodGhpcy5zb3VyY2VQYXRoICsgcGF0dGVybiArIHRoaXMuc291cmNlU2VhcmNoLCBleHRlbmQoZGVmYXVsdENvbmZpZywgY29uZmlnKSwgdGhpcyk7XG59O1xuXG5VcmxNYXRjaGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuc291cmNlO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNleGVjXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUZXN0cyB0aGUgc3BlY2lmaWVkIHBhdGggYWdhaW5zdCB0aGlzIG1hdGNoZXIsIGFuZCByZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBjYXB0dXJlZFxuICogcGFyYW1ldGVyIHZhbHVlcywgb3IgbnVsbCBpZiB0aGUgcGF0aCBkb2VzIG5vdCBtYXRjaC4gVGhlIHJldHVybmVkIG9iamVjdCBjb250YWlucyB0aGUgdmFsdWVzXG4gKiBvZiBhbnkgc2VhcmNoIHBhcmFtZXRlcnMgdGhhdCBhcmUgbWVudGlvbmVkIGluIHRoZSBwYXR0ZXJuLCBidXQgdGhlaXIgdmFsdWUgbWF5IGJlIG51bGwgaWZcbiAqIHRoZXkgYXJlIG5vdCBwcmVzZW50IGluIGBzZWFyY2hQYXJhbXNgLiBUaGlzIG1lYW5zIHRoYXQgc2VhcmNoIHBhcmFtZXRlcnMgYXJlIGFsd2F5cyB0cmVhdGVkXG4gKiBhcyBvcHRpb25hbC5cbiAqXG4gKiBAZXhhbXBsZVxuICogPHByZT5cbiAqIG5ldyBVcmxNYXRjaGVyKCcvdXNlci97aWR9P3EmcicpLmV4ZWMoJy91c2VyL2JvYicsIHtcbiAqICAgeDogJzEnLCBxOiAnaGVsbG8nXG4gKiB9KTtcbiAqIC8vIHJldHVybnMgeyBpZDogJ2JvYicsIHE6ICdoZWxsbycsIHI6IG51bGwgfVxuICogPC9wcmU+XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggIFRoZSBVUkwgcGF0aCB0byBtYXRjaCwgZS5nLiBgJGxvY2F0aW9uLnBhdGgoKWAuXG4gKiBAcGFyYW0ge09iamVjdH0gc2VhcmNoUGFyYW1zICBVUkwgc2VhcmNoIHBhcmFtZXRlcnMsIGUuZy4gYCRsb2NhdGlvbi5zZWFyY2goKWAuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAgVGhlIGNhcHR1cmVkIHBhcmFtZXRlciB2YWx1ZXMuXG4gKi9cblVybE1hdGNoZXIucHJvdG90eXBlLmV4ZWMgPSBmdW5jdGlvbiAocGF0aCwgc2VhcmNoUGFyYW1zKSB7XG4gIHZhciBtID0gdGhpcy5yZWdleHAuZXhlYyhwYXRoKTtcbiAgaWYgKCFtKSByZXR1cm4gbnVsbDtcbiAgc2VhcmNoUGFyYW1zID0gc2VhcmNoUGFyYW1zIHx8IHt9O1xuXG4gIHZhciBwYXJhbU5hbWVzID0gdGhpcy5wYXJhbWV0ZXJzKCksIG5Ub3RhbCA9IHBhcmFtTmFtZXMubGVuZ3RoLFxuICAgIG5QYXRoID0gdGhpcy5zZWdtZW50cy5sZW5ndGggLSAxLFxuICAgIHZhbHVlcyA9IHt9LCBpLCBqLCBjZmcsIHBhcmFtTmFtZTtcblxuICBpZiAoblBhdGggIT09IG0ubGVuZ3RoIC0gMSkgdGhyb3cgbmV3IEVycm9yKFwiVW5iYWxhbmNlZCBjYXB0dXJlIGdyb3VwIGluIHJvdXRlICdcIiArIHRoaXMuc291cmNlICsgXCInXCIpO1xuXG4gIGZ1bmN0aW9uIGRlY29kZVBhdGhBcnJheShzdHJpbmcpIHtcbiAgICBmdW5jdGlvbiByZXZlcnNlU3RyaW5nKHN0cikgeyByZXR1cm4gc3RyLnNwbGl0KFwiXCIpLnJldmVyc2UoKS5qb2luKFwiXCIpOyB9XG4gICAgZnVuY3Rpb24gdW5xdW90ZURhc2hlcyhzdHIpIHsgcmV0dXJuIHN0ci5yZXBsYWNlKC9cXFxcLS9nLCBcIi1cIik7IH1cblxuICAgIHZhciBzcGxpdCA9IHJldmVyc2VTdHJpbmcoc3RyaW5nKS5zcGxpdCgvLSg/IVxcXFwpLyk7XG4gICAgdmFyIGFsbFJldmVyc2VkID0gbWFwKHNwbGl0LCByZXZlcnNlU3RyaW5nKTtcbiAgICByZXR1cm4gbWFwKGFsbFJldmVyc2VkLCB1bnF1b3RlRGFzaGVzKS5yZXZlcnNlKCk7XG4gIH1cblxuICB2YXIgcGFyYW0sIHBhcmFtVmFsO1xuICBmb3IgKGkgPSAwOyBpIDwgblBhdGg7IGkrKykge1xuICAgIHBhcmFtTmFtZSA9IHBhcmFtTmFtZXNbaV07XG4gICAgcGFyYW0gPSB0aGlzLnBhcmFtc1twYXJhbU5hbWVdO1xuICAgIHBhcmFtVmFsID0gbVtpKzFdO1xuICAgIC8vIGlmIHRoZSBwYXJhbSB2YWx1ZSBtYXRjaGVzIGEgcHJlLXJlcGxhY2UgcGFpciwgcmVwbGFjZSB0aGUgdmFsdWUgYmVmb3JlIGRlY29kaW5nLlxuICAgIGZvciAoaiA9IDA7IGogPCBwYXJhbS5yZXBsYWNlLmxlbmd0aDsgaisrKSB7XG4gICAgICBpZiAocGFyYW0ucmVwbGFjZVtqXS5mcm9tID09PSBwYXJhbVZhbCkgcGFyYW1WYWwgPSBwYXJhbS5yZXBsYWNlW2pdLnRvO1xuICAgIH1cbiAgICBpZiAocGFyYW1WYWwgJiYgcGFyYW0uYXJyYXkgPT09IHRydWUpIHBhcmFtVmFsID0gZGVjb2RlUGF0aEFycmF5KHBhcmFtVmFsKTtcbiAgICBpZiAoaXNEZWZpbmVkKHBhcmFtVmFsKSkgcGFyYW1WYWwgPSBwYXJhbS50eXBlLmRlY29kZShwYXJhbVZhbCk7XG4gICAgdmFsdWVzW3BhcmFtTmFtZV0gPSBwYXJhbS52YWx1ZShwYXJhbVZhbCk7XG4gIH1cbiAgZm9yICgvKiovOyBpIDwgblRvdGFsOyBpKyspIHtcbiAgICBwYXJhbU5hbWUgPSBwYXJhbU5hbWVzW2ldO1xuICAgIHZhbHVlc1twYXJhbU5hbWVdID0gdGhpcy5wYXJhbXNbcGFyYW1OYW1lXS52YWx1ZShzZWFyY2hQYXJhbXNbcGFyYW1OYW1lXSk7XG4gICAgcGFyYW0gPSB0aGlzLnBhcmFtc1twYXJhbU5hbWVdO1xuICAgIHBhcmFtVmFsID0gc2VhcmNoUGFyYW1zW3BhcmFtTmFtZV07XG4gICAgZm9yIChqID0gMDsgaiA8IHBhcmFtLnJlcGxhY2UubGVuZ3RoOyBqKyspIHtcbiAgICAgIGlmIChwYXJhbS5yZXBsYWNlW2pdLmZyb20gPT09IHBhcmFtVmFsKSBwYXJhbVZhbCA9IHBhcmFtLnJlcGxhY2Vbal0udG87XG4gICAgfVxuICAgIGlmIChpc0RlZmluZWQocGFyYW1WYWwpKSBwYXJhbVZhbCA9IHBhcmFtLnR5cGUuZGVjb2RlKHBhcmFtVmFsKTtcbiAgICB2YWx1ZXNbcGFyYW1OYW1lXSA9IHBhcmFtLnZhbHVlKHBhcmFtVmFsKTtcbiAgfVxuXG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI3BhcmFtZXRlcnNcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFJldHVybnMgdGhlIG5hbWVzIG9mIGFsbCBwYXRoIGFuZCBzZWFyY2ggcGFyYW1ldGVycyBvZiB0aGlzIHBhdHRlcm4gaW4gYW4gdW5zcGVjaWZpZWQgb3JkZXIuXG4gKlxuICogQHJldHVybnMge0FycmF5LjxzdHJpbmc+fSAgQW4gYXJyYXkgb2YgcGFyYW1ldGVyIG5hbWVzLiBNdXN0IGJlIHRyZWF0ZWQgYXMgcmVhZC1vbmx5LiBJZiB0aGVcbiAqICAgIHBhdHRlcm4gaGFzIG5vIHBhcmFtZXRlcnMsIGFuIGVtcHR5IGFycmF5IGlzIHJldHVybmVkLlxuICovXG5VcmxNYXRjaGVyLnByb3RvdHlwZS5wYXJhbWV0ZXJzID0gZnVuY3Rpb24gKHBhcmFtKSB7XG4gIGlmICghaXNEZWZpbmVkKHBhcmFtKSkgcmV0dXJuIHRoaXMuJCRwYXJhbU5hbWVzO1xuICByZXR1cm4gdGhpcy5wYXJhbXNbcGFyYW1dIHx8IG51bGw7XG59O1xuXG4vKipcbiAqIEBuZ2RvYyBmdW5jdGlvblxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI3ZhbGlkYXRlc1xuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogQ2hlY2tzIGFuIG9iamVjdCBoYXNoIG9mIHBhcmFtZXRlcnMgdG8gdmFsaWRhdGUgdGhlaXIgY29ycmVjdG5lc3MgYWNjb3JkaW5nIHRvIHRoZSBwYXJhbWV0ZXJcbiAqIHR5cGVzIG9mIHRoaXMgYFVybE1hdGNoZXJgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbXMgVGhlIG9iamVjdCBoYXNoIG9mIHBhcmFtZXRlcnMgdG8gdmFsaWRhdGUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHBhcmFtc2AgdmFsaWRhdGVzLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAqL1xuVXJsTWF0Y2hlci5wcm90b3R5cGUudmFsaWRhdGVzID0gZnVuY3Rpb24gKHBhcmFtcykge1xuICByZXR1cm4gdGhpcy5wYXJhbXMuJCR2YWxpZGF0ZXMocGFyYW1zKTtcbn07XG5cbi8qKlxuICogQG5nZG9jIGZ1bmN0aW9uXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIjZm9ybWF0XG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBDcmVhdGVzIGEgVVJMIHRoYXQgbWF0Y2hlcyB0aGlzIHBhdHRlcm4gYnkgc3Vic3RpdHV0aW5nIHRoZSBzcGVjaWZpZWQgdmFsdWVzXG4gKiBmb3IgdGhlIHBhdGggYW5kIHNlYXJjaCBwYXJhbWV0ZXJzLiBOdWxsIHZhbHVlcyBmb3IgcGF0aCBwYXJhbWV0ZXJzIGFyZVxuICogdHJlYXRlZCBhcyBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBleGFtcGxlXG4gKiA8cHJlPlxuICogbmV3IFVybE1hdGNoZXIoJy91c2VyL3tpZH0/cScpLmZvcm1hdCh7IGlkOidib2InLCBxOid5ZXMnIH0pO1xuICogLy8gcmV0dXJucyAnL3VzZXIvYm9iP3E9eWVzJ1xuICogPC9wcmU+XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHZhbHVlcyAgdGhlIHZhbHVlcyB0byBzdWJzdGl0dXRlIGZvciB0aGUgcGFyYW1ldGVycyBpbiB0aGlzIHBhdHRlcm4uXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgdGhlIGZvcm1hdHRlZCBVUkwgKHBhdGggYW5kIG9wdGlvbmFsbHkgc2VhcmNoIHBhcnQpLlxuICovXG5VcmxNYXRjaGVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gIHZhbHVlcyA9IHZhbHVlcyB8fCB7fTtcbiAgdmFyIHNlZ21lbnRzID0gdGhpcy5zZWdtZW50cywgcGFyYW1zID0gdGhpcy5wYXJhbWV0ZXJzKCksIHBhcmFtc2V0ID0gdGhpcy5wYXJhbXM7XG4gIGlmICghdGhpcy52YWxpZGF0ZXModmFsdWVzKSkgcmV0dXJuIG51bGw7XG5cbiAgdmFyIGksIHNlYXJjaCA9IGZhbHNlLCBuUGF0aCA9IHNlZ21lbnRzLmxlbmd0aCAtIDEsIG5Ub3RhbCA9IHBhcmFtcy5sZW5ndGgsIHJlc3VsdCA9IHNlZ21lbnRzWzBdO1xuXG4gIGZ1bmN0aW9uIGVuY29kZURhc2hlcyhzdHIpIHsgLy8gUmVwbGFjZSBkYXNoZXMgd2l0aCBlbmNvZGVkIFwiXFwtXCJcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvLS9nLCBmdW5jdGlvbihjKSB7IHJldHVybiAnJTVDJScgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7IH0pO1xuICB9XG5cbiAgZm9yIChpID0gMDsgaSA8IG5Ub3RhbDsgaSsrKSB7XG4gICAgdmFyIGlzUGF0aFBhcmFtID0gaSA8IG5QYXRoO1xuICAgIHZhciBuYW1lID0gcGFyYW1zW2ldLCBwYXJhbSA9IHBhcmFtc2V0W25hbWVdLCB2YWx1ZSA9IHBhcmFtLnZhbHVlKHZhbHVlc1tuYW1lXSk7XG4gICAgdmFyIGlzRGVmYXVsdFZhbHVlID0gcGFyYW0uaXNPcHRpb25hbCAmJiBwYXJhbS50eXBlLmVxdWFscyhwYXJhbS52YWx1ZSgpLCB2YWx1ZSk7XG4gICAgdmFyIHNxdWFzaCA9IGlzRGVmYXVsdFZhbHVlID8gcGFyYW0uc3F1YXNoIDogZmFsc2U7XG4gICAgdmFyIGVuY29kZWQgPSBwYXJhbS50eXBlLmVuY29kZSh2YWx1ZSk7XG5cbiAgICBpZiAoaXNQYXRoUGFyYW0pIHtcbiAgICAgIHZhciBuZXh0U2VnbWVudCA9IHNlZ21lbnRzW2kgKyAxXTtcbiAgICAgIHZhciBpc0ZpbmFsUGF0aFBhcmFtID0gaSArIDEgPT09IG5QYXRoO1xuXG4gICAgICBpZiAoc3F1YXNoID09PSBmYWxzZSkge1xuICAgICAgICBpZiAoZW5jb2RlZCAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGlzQXJyYXkoZW5jb2RlZCkpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBtYXAoZW5jb2RlZCwgZW5jb2RlRGFzaGVzKS5qb2luKFwiLVwiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGVuY29kZVVSSUNvbXBvbmVudChlbmNvZGVkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ICs9IG5leHRTZWdtZW50O1xuICAgICAgfSBlbHNlIGlmIChzcXVhc2ggPT09IHRydWUpIHtcbiAgICAgICAgdmFyIGNhcHR1cmUgPSByZXN1bHQubWF0Y2goL1xcLyQvKSA/IC9cXC8/KC4qKS8gOiAvKC4qKS87XG4gICAgICAgIHJlc3VsdCArPSBuZXh0U2VnbWVudC5tYXRjaChjYXB0dXJlKVsxXTtcbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcoc3F1YXNoKSkge1xuICAgICAgICByZXN1bHQgKz0gc3F1YXNoICsgbmV4dFNlZ21lbnQ7XG4gICAgICB9XG5cbiAgICAgIGlmIChpc0ZpbmFsUGF0aFBhcmFtICYmIHBhcmFtLnNxdWFzaCA9PT0gdHJ1ZSAmJiByZXN1bHQuc2xpY2UoLTEpID09PSAnLycpIHJlc3VsdCA9IHJlc3VsdC5zbGljZSgwLCAtMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChlbmNvZGVkID09IG51bGwgfHwgKGlzRGVmYXVsdFZhbHVlICYmIHNxdWFzaCAhPT0gZmFsc2UpKSBjb250aW51ZTtcbiAgICAgIGlmICghaXNBcnJheShlbmNvZGVkKSkgZW5jb2RlZCA9IFsgZW5jb2RlZCBdO1xuICAgICAgaWYgKGVuY29kZWQubGVuZ3RoID09PSAwKSBjb250aW51ZTtcbiAgICAgIGVuY29kZWQgPSBtYXAoZW5jb2RlZCwgZW5jb2RlVVJJQ29tcG9uZW50KS5qb2luKCcmJyArIG5hbWUgKyAnPScpO1xuICAgICAgcmVzdWx0ICs9IChzZWFyY2ggPyAnJicgOiAnPycpICsgKG5hbWUgKyAnPScgKyBlbmNvZGVkKTtcbiAgICAgIHNlYXJjaCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBJbXBsZW1lbnRzIGFuIGludGVyZmFjZSB0byBkZWZpbmUgY3VzdG9tIHBhcmFtZXRlciB0eXBlcyB0aGF0IGNhbiBiZSBkZWNvZGVkIGZyb20gYW5kIGVuY29kZWQgdG9cbiAqIHN0cmluZyBwYXJhbWV0ZXJzIG1hdGNoZWQgaW4gYSBVUkwuIFVzZWQgYnkge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBgVXJsTWF0Y2hlcmB9XG4gKiBvYmplY3RzIHdoZW4gbWF0Y2hpbmcgb3IgZm9ybWF0dGluZyBVUkxzLCBvciBjb21wYXJpbmcgb3IgdmFsaWRhdGluZyBwYXJhbWV0ZXIgdmFsdWVzLlxuICpcbiAqIFNlZSB7QGxpbmsgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I21ldGhvZHNfdHlwZSBgJHVybE1hdGNoZXJGYWN0b3J5I3R5cGUoKWB9IGZvciBtb3JlXG4gKiBpbmZvcm1hdGlvbiBvbiByZWdpc3RlcmluZyBjdXN0b20gdHlwZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAgQSBjb25maWd1cmF0aW9uIG9iamVjdCB3aGljaCBjb250YWlucyB0aGUgY3VzdG9tIHR5cGUgZGVmaW5pdGlvbi4gIFRoZSBvYmplY3Qnc1xuICogICAgICAgIHByb3BlcnRpZXMgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCBtZXRob2RzIGFuZC9vciBwYXR0ZXJuIGluIGBUeXBlYCdzIHB1YmxpYyBpbnRlcmZhY2UuXG4gKiBAZXhhbXBsZVxuICogPHByZT5cbiAqIHtcbiAqICAgZGVjb2RlOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApOyB9LFxuICogICBlbmNvZGU6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gdmFsICYmIHZhbC50b1N0cmluZygpOyB9LFxuICogICBlcXVhbHM6IGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIHRoaXMuaXMoYSkgJiYgYSA9PT0gYjsgfSxcbiAqICAgaXM6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gYW5ndWxhci5pc051bWJlcih2YWwpIGlzRmluaXRlKHZhbCkgJiYgdmFsICUgMSA9PT0gMDsgfSxcbiAqICAgcGF0dGVybjogL1xcZCsvXG4gKiB9XG4gKiA8L3ByZT5cbiAqXG4gKiBAcHJvcGVydHkge1JlZ0V4cH0gcGF0dGVybiBUaGUgcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm4gdXNlZCB0byBtYXRjaCB2YWx1ZXMgb2YgdGhpcyB0eXBlIHdoZW5cbiAqICAgICAgICAgICBjb21pbmcgZnJvbSBhIHN1YnN0cmluZyBvZiBhIFVSTC5cbiAqXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAgUmV0dXJucyBhIG5ldyBgVHlwZWAgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBUeXBlKGNvbmZpZykge1xuICBleHRlbmQodGhpcywgY29uZmlnKTtcbn1cblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSNpc1xuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogRGV0ZWN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgb2YgYSBwYXJ0aWN1bGFyIHR5cGUuIEFjY2VwdHMgYSBuYXRpdmUgKGRlY29kZWQpIHZhbHVlXG4gKiBhbmQgZGV0ZXJtaW5lcyB3aGV0aGVyIGl0IG1hdGNoZXMgdGhlIGN1cnJlbnQgYFR5cGVgIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbCAgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSAgT3B0aW9uYWwuIElmIHRoZSB0eXBlIGNoZWNrIGlzIGhhcHBlbmluZyBpbiB0aGUgY29udGV4dCBvZiBhIHNwZWNpZmljXG4gKiAgICAgICAge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBgVXJsTWF0Y2hlcmB9IG9iamVjdCwgdGhpcyBpcyB0aGUgbmFtZSBvZiB0aGVcbiAqICAgICAgICBwYXJhbWV0ZXIgaW4gd2hpY2ggYHZhbGAgaXMgc3RvcmVkLiBDYW4gYmUgdXNlZCBmb3IgbWV0YS1wcm9ncmFtbWluZyBvZiBgVHlwZWAgb2JqZWN0cy5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAgUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlIG1hdGNoZXMgdGhlIHR5cGUsIG90aGVyd2lzZSBgZmFsc2VgLlxuICovXG5UeXBlLnByb3RvdHlwZS5pcyA9IGZ1bmN0aW9uKHZhbCwga2V5KSB7XG4gIHJldHVybiB0cnVlO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSNlbmNvZGVcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEVuY29kZXMgYSBjdXN0b20vbmF0aXZlIHR5cGUgdmFsdWUgdG8gYSBzdHJpbmcgdGhhdCBjYW4gYmUgZW1iZWRkZWQgaW4gYSBVUkwuIE5vdGUgdGhhdCB0aGVcbiAqIHJldHVybiB2YWx1ZSBkb2VzICpub3QqIG5lZWQgdG8gYmUgVVJMLXNhZmUgKGkuZS4gcGFzc2VkIHRocm91Z2ggYGVuY29kZVVSSUNvbXBvbmVudCgpYCksIGl0XG4gKiBvbmx5IG5lZWRzIHRvIGJlIGEgcmVwcmVzZW50YXRpb24gb2YgYHZhbGAgdGhhdCBoYXMgYmVlbiBjb2VyY2VkIHRvIGEgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsICBUaGUgdmFsdWUgdG8gZW5jb2RlLlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSAgVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciBpbiB3aGljaCBgdmFsYCBpcyBzdG9yZWQuIENhbiBiZSB1c2VkIGZvclxuICogICAgICAgIG1ldGEtcHJvZ3JhbW1pbmcgb2YgYFR5cGVgIG9iamVjdHMuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAgUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBgdmFsYCB0aGF0IGNhbiBiZSBlbmNvZGVkIGluIGEgVVJMLlxuICovXG5UeXBlLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbih2YWwsIGtleSkge1xuICByZXR1cm4gdmFsO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSNkZWNvZGVcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIENvbnZlcnRzIGEgcGFyYW1ldGVyIHZhbHVlIChmcm9tIFVSTCBzdHJpbmcgb3IgdHJhbnNpdGlvbiBwYXJhbSkgdG8gYSBjdXN0b20vbmF0aXZlIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB2YWwgIFRoZSBVUkwgcGFyYW1ldGVyIHZhbHVlIHRvIGRlY29kZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgIFRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIgaW4gd2hpY2ggYHZhbGAgaXMgc3RvcmVkLiBDYW4gYmUgdXNlZCBmb3JcbiAqICAgICAgICBtZXRhLXByb2dyYW1taW5nIG9mIGBUeXBlYCBvYmplY3RzLlxuICogQHJldHVybnMgeyp9ICBSZXR1cm5zIGEgY3VzdG9tIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBVUkwgcGFyYW1ldGVyIHZhbHVlLlxuICovXG5UeXBlLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbih2YWwsIGtleSkge1xuICByZXR1cm4gdmFsO1xufTtcblxuLyoqXG4gKiBAbmdkb2MgZnVuY3Rpb25cbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSNlcXVhbHNcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIERldGVybWluZXMgd2hldGhlciB0d28gZGVjb2RlZCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHBhcmFtIHsqfSBhICBBIHZhbHVlIHRvIGNvbXBhcmUgYWdhaW5zdC5cbiAqIEBwYXJhbSB7Kn0gYiAgQSB2YWx1ZSB0byBjb21wYXJlIGFnYWluc3QuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gIFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQvZXF1YWwsIG90aGVyd2lzZSBgZmFsc2VgLlxuICovXG5UeXBlLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhID09IGI7XG59O1xuXG5UeXBlLnByb3RvdHlwZS4kc3ViUGF0dGVybiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3ViID0gdGhpcy5wYXR0ZXJuLnRvU3RyaW5nKCk7XG4gIHJldHVybiBzdWIuc3Vic3RyKDEsIHN1Yi5sZW5ndGggLSAyKTtcbn07XG5cblR5cGUucHJvdG90eXBlLnBhdHRlcm4gPSAvLiovO1xuXG5UeXBlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJ7VHlwZTpcIiArIHRoaXMubmFtZSArIFwifVwiOyB9O1xuXG4vKiogR2l2ZW4gYW4gZW5jb2RlZCBzdHJpbmcsIG9yIGEgZGVjb2RlZCBvYmplY3QsIHJldHVybnMgYSBkZWNvZGVkIG9iamVjdCAqL1xuVHlwZS5wcm90b3R5cGUuJG5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICByZXR1cm4gdGhpcy5pcyh2YWwpID8gdmFsIDogdGhpcy5kZWNvZGUodmFsKTtcbn07XG5cbi8qXG4gKiBXcmFwcyBhbiBleGlzdGluZyBjdXN0b20gVHlwZSBhcyBhbiBhcnJheSBvZiBUeXBlLCBkZXBlbmRpbmcgb24gJ21vZGUnLlxuICogZS5nLjpcbiAqIC0gdXJsbWF0Y2hlciBwYXR0ZXJuIFwiL3BhdGg/e3F1ZXJ5UGFyYW1bXTppbnR9XCJcbiAqIC0gdXJsOiBcIi9wYXRoP3F1ZXJ5UGFyYW09MSZxdWVyeVBhcmFtPTJcbiAqIC0gJHN0YXRlUGFyYW1zLnF1ZXJ5UGFyYW0gd2lsbCBiZSBbMSwgMl1cbiAqIGlmIGBtb2RlYCBpcyBcImF1dG9cIiwgdGhlblxuICogLSB1cmw6IFwiL3BhdGg/cXVlcnlQYXJhbT0xIHdpbGwgY3JlYXRlICRzdGF0ZVBhcmFtcy5xdWVyeVBhcmFtOiAxXG4gKiAtIHVybDogXCIvcGF0aD9xdWVyeVBhcmFtPTEmcXVlcnlQYXJhbT0yIHdpbGwgY3JlYXRlICRzdGF0ZVBhcmFtcy5xdWVyeVBhcmFtOiBbMSwgMl1cbiAqL1xuVHlwZS5wcm90b3R5cGUuJGFzQXJyYXkgPSBmdW5jdGlvbihtb2RlLCBpc1NlYXJjaCkge1xuICBpZiAoIW1vZGUpIHJldHVybiB0aGlzO1xuICBpZiAobW9kZSA9PT0gXCJhdXRvXCIgJiYgIWlzU2VhcmNoKSB0aHJvdyBuZXcgRXJyb3IoXCInYXV0bycgYXJyYXkgbW9kZSBpcyBmb3IgcXVlcnkgcGFyYW1ldGVycyBvbmx5XCIpO1xuXG4gIGZ1bmN0aW9uIEFycmF5VHlwZSh0eXBlLCBtb2RlKSB7XG4gICAgZnVuY3Rpb24gYmluZFRvKHR5cGUsIGNhbGxiYWNrTmFtZSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHlwZVtjYWxsYmFja05hbWVdLmFwcGx5KHR5cGUsIGFyZ3VtZW50cyk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFdyYXAgbm9uLWFycmF5IHZhbHVlIGFzIGFycmF5XG4gICAgZnVuY3Rpb24gYXJyYXlXcmFwKHZhbCkgeyByZXR1cm4gaXNBcnJheSh2YWwpID8gdmFsIDogKGlzRGVmaW5lZCh2YWwpID8gWyB2YWwgXSA6IFtdKTsgfVxuICAgIC8vIFVud3JhcCBhcnJheSB2YWx1ZSBmb3IgXCJhdXRvXCIgbW9kZS4gUmV0dXJuIHVuZGVmaW5lZCBmb3IgZW1wdHkgYXJyYXkuXG4gICAgZnVuY3Rpb24gYXJyYXlVbndyYXAodmFsKSB7XG4gICAgICBzd2l0Y2godmFsLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDA6IHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIGNhc2UgMTogcmV0dXJuIG1vZGUgPT09IFwiYXV0b1wiID8gdmFsWzBdIDogdmFsO1xuICAgICAgICBkZWZhdWx0OiByZXR1cm4gdmFsO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBmYWxzZXkodmFsKSB7IHJldHVybiAhdmFsOyB9XG5cbiAgICAvLyBXcmFwcyB0eXBlICguaXMvLmVuY29kZS8uZGVjb2RlKSBmdW5jdGlvbnMgdG8gb3BlcmF0ZSBvbiBlYWNoIHZhbHVlIG9mIGFuIGFycmF5XG4gICAgZnVuY3Rpb24gYXJyYXlIYW5kbGVyKGNhbGxiYWNrLCBhbGxUcnV0aHlNb2RlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gaGFuZGxlQXJyYXkodmFsKSB7XG4gICAgICAgIGlmIChpc0FycmF5KHZhbCkgJiYgdmFsLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHZhbDtcbiAgICAgICAgdmFsID0gYXJyYXlXcmFwKHZhbCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBtYXAodmFsLCBjYWxsYmFjayk7XG4gICAgICAgIGlmIChhbGxUcnV0aHlNb2RlID09PSB0cnVlKVxuICAgICAgICAgIHJldHVybiBmaWx0ZXIocmVzdWx0LCBmYWxzZXkpLmxlbmd0aCA9PT0gMDtcbiAgICAgICAgcmV0dXJuIGFycmF5VW53cmFwKHJlc3VsdCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIFdyYXBzIHR5cGUgKC5lcXVhbHMpIGZ1bmN0aW9ucyB0byBvcGVyYXRlIG9uIGVhY2ggdmFsdWUgb2YgYW4gYXJyYXlcbiAgICBmdW5jdGlvbiBhcnJheUVxdWFsc0hhbmRsZXIoY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiBoYW5kbGVBcnJheSh2YWwxLCB2YWwyKSB7XG4gICAgICAgIHZhciBsZWZ0ID0gYXJyYXlXcmFwKHZhbDEpLCByaWdodCA9IGFycmF5V3JhcCh2YWwyKTtcbiAgICAgICAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZWZ0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFjYWxsYmFjayhsZWZ0W2ldLCByaWdodFtpXSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5lbmNvZGUgPSBhcnJheUhhbmRsZXIoYmluZFRvKHR5cGUsICdlbmNvZGUnKSk7XG4gICAgdGhpcy5kZWNvZGUgPSBhcnJheUhhbmRsZXIoYmluZFRvKHR5cGUsICdkZWNvZGUnKSk7XG4gICAgdGhpcy5pcyAgICAgPSBhcnJheUhhbmRsZXIoYmluZFRvKHR5cGUsICdpcycpLCB0cnVlKTtcbiAgICB0aGlzLmVxdWFscyA9IGFycmF5RXF1YWxzSGFuZGxlcihiaW5kVG8odHlwZSwgJ2VxdWFscycpKTtcbiAgICB0aGlzLnBhdHRlcm4gPSB0eXBlLnBhdHRlcm47XG4gICAgdGhpcy4kbm9ybWFsaXplID0gYXJyYXlIYW5kbGVyKGJpbmRUbyh0eXBlLCAnJG5vcm1hbGl6ZScpKTtcbiAgICB0aGlzLm5hbWUgPSB0eXBlLm5hbWU7XG4gICAgdGhpcy4kYXJyYXlNb2RlID0gbW9kZTtcbiAgfVxuXG4gIHJldHVybiBuZXcgQXJyYXlUeXBlKHRoaXMsIG1vZGUpO1xufTtcblxuXG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIGBVcmxNYXRjaGVyYH0gaW5zdGFuY2VzLiBUaGUgZmFjdG9yeVxuICogaXMgYWxzbyBhdmFpbGFibGUgdG8gcHJvdmlkZXJzIHVuZGVyIHRoZSBuYW1lIGAkdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlcmAuXG4gKi9cbmZ1bmN0aW9uICRVcmxNYXRjaGVyRmFjdG9yeSgpIHtcbiAgJCRVTUZQID0gdGhpcztcblxuICB2YXIgaXNDYXNlSW5zZW5zaXRpdmUgPSBmYWxzZSwgaXNTdHJpY3RNb2RlID0gdHJ1ZSwgZGVmYXVsdFNxdWFzaFBvbGljeSA9IGZhbHNlO1xuXG4gIC8vIFVzZSB0aWxkZXMgdG8gcHJlLWVuY29kZSBzbGFzaGVzLlxuICAvLyBJZiB0aGUgc2xhc2hlcyBhcmUgc2ltcGx5IFVSTEVuY29kZWQsIHRoZSBicm93c2VyIGNhbiBjaG9vc2UgdG8gcHJlLWRlY29kZSB0aGVtLFxuICAvLyBhbmQgYmlkaXJlY3Rpb25hbCBlbmNvZGluZy9kZWNvZGluZyBmYWlscy5cbiAgLy8gVGlsZGUgd2FzIGNob3NlbiBiZWNhdXNlIGl0J3Mgbm90IGEgUkZDIDM5ODYgc2VjdGlvbiAyLjIgUmVzZXJ2ZWQgQ2hhcmFjdGVyXG4gIGZ1bmN0aW9uIHZhbFRvU3RyaW5nKHZhbCkgeyByZXR1cm4gdmFsICE9IG51bGwgPyB2YWwudG9TdHJpbmcoKS5yZXBsYWNlKC9+L2csIFwifn5cIikucmVwbGFjZSgvXFwvL2csIFwifjJGXCIpIDogdmFsOyB9XG4gIGZ1bmN0aW9uIHZhbEZyb21TdHJpbmcodmFsKSB7IHJldHVybiB2YWwgIT0gbnVsbCA/IHZhbC50b1N0cmluZygpLnJlcGxhY2UoL34yRi9nLCBcIi9cIikucmVwbGFjZSgvfn4vZywgXCJ+XCIpIDogdmFsOyB9XG5cbiAgdmFyICR0eXBlcyA9IHt9LCBlbnF1ZXVlID0gdHJ1ZSwgdHlwZVF1ZXVlID0gW10sIGluamVjdG9yLCBkZWZhdWx0VHlwZXMgPSB7XG4gICAgXCJzdHJpbmdcIjoge1xuICAgICAgZW5jb2RlOiB2YWxUb1N0cmluZyxcbiAgICAgIGRlY29kZTogdmFsRnJvbVN0cmluZyxcbiAgICAgIC8vIFRPRE86IGluIDEuMCwgbWFrZSBzdHJpbmcgLmlzKCkgcmV0dXJuIGZhbHNlIGlmIHZhbHVlIGlzIHVuZGVmaW5lZC9udWxsIGJ5IGRlZmF1bHQuXG4gICAgICAvLyBJbiAwLjIueCwgc3RyaW5nIHBhcmFtcyBhcmUgb3B0aW9uYWwgYnkgZGVmYXVsdCBmb3IgYmFja3dhcmRzIGNvbXBhdFxuICAgICAgaXM6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gdmFsID09IG51bGwgfHwgIWlzRGVmaW5lZCh2YWwpIHx8IHR5cGVvZiB2YWwgPT09IFwic3RyaW5nXCI7IH0sXG4gICAgICBwYXR0ZXJuOiAvW14vXSovXG4gICAgfSxcbiAgICBcImludFwiOiB7XG4gICAgICBlbmNvZGU6IHZhbFRvU3RyaW5nLFxuICAgICAgZGVjb2RlOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApOyB9LFxuICAgICAgaXM6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gaXNEZWZpbmVkKHZhbCkgJiYgdGhpcy5kZWNvZGUodmFsLnRvU3RyaW5nKCkpID09PSB2YWw7IH0sXG4gICAgICBwYXR0ZXJuOiAvXFxkKy9cbiAgICB9LFxuICAgIFwiYm9vbFwiOiB7XG4gICAgICBlbmNvZGU6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gdmFsID8gMSA6IDA7IH0sXG4gICAgICBkZWNvZGU6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCkgIT09IDA7IH0sXG4gICAgICBpczogZnVuY3Rpb24odmFsKSB7IHJldHVybiB2YWwgPT09IHRydWUgfHwgdmFsID09PSBmYWxzZTsgfSxcbiAgICAgIHBhdHRlcm46IC8wfDEvXG4gICAgfSxcbiAgICBcImRhdGVcIjoge1xuICAgICAgZW5jb2RlOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIGlmICghdGhpcy5pcyh2YWwpKVxuICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBbIHZhbC5nZXRGdWxsWWVhcigpLFxuICAgICAgICAgICgnMCcgKyAodmFsLmdldE1vbnRoKCkgKyAxKSkuc2xpY2UoLTIpLFxuICAgICAgICAgICgnMCcgKyB2YWwuZ2V0RGF0ZSgpKS5zbGljZSgtMilcbiAgICAgICAgXS5qb2luKFwiLVwiKTtcbiAgICAgIH0sXG4gICAgICBkZWNvZGU6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgaWYgKHRoaXMuaXModmFsKSkgcmV0dXJuIHZhbDtcbiAgICAgICAgdmFyIG1hdGNoID0gdGhpcy5jYXB0dXJlLmV4ZWModmFsKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoID8gbmV3IERhdGUobWF0Y2hbMV0sIG1hdGNoWzJdIC0gMSwgbWF0Y2hbM10pIDogdW5kZWZpbmVkO1xuICAgICAgfSxcbiAgICAgIGlzOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCBpbnN0YW5jZW9mIERhdGUgJiYgIWlzTmFOKHZhbC52YWx1ZU9mKCkpOyB9LFxuICAgICAgZXF1YWxzOiBmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gdGhpcy5pcyhhKSAmJiB0aGlzLmlzKGIpICYmIGEudG9JU09TdHJpbmcoKSA9PT0gYi50b0lTT1N0cmluZygpOyB9LFxuICAgICAgcGF0dGVybjogL1swLTldezR9LSg/OjBbMS05XXwxWzAtMl0pLSg/OjBbMS05XXxbMS0yXVswLTldfDNbMC0xXSkvLFxuICAgICAgY2FwdHVyZTogLyhbMC05XXs0fSktKDBbMS05XXwxWzAtMl0pLSgwWzEtOV18WzEtMl1bMC05XXwzWzAtMV0pL1xuICAgIH0sXG4gICAgXCJqc29uXCI6IHtcbiAgICAgIGVuY29kZTogYW5ndWxhci50b0pzb24sXG4gICAgICBkZWNvZGU6IGFuZ3VsYXIuZnJvbUpzb24sXG4gICAgICBpczogYW5ndWxhci5pc09iamVjdCxcbiAgICAgIGVxdWFsczogYW5ndWxhci5lcXVhbHMsXG4gICAgICBwYXR0ZXJuOiAvW14vXSovXG4gICAgfSxcbiAgICBcImFueVwiOiB7IC8vIGRvZXMgbm90IGVuY29kZS9kZWNvZGVcbiAgICAgIGVuY29kZTogYW5ndWxhci5pZGVudGl0eSxcbiAgICAgIGRlY29kZTogYW5ndWxhci5pZGVudGl0eSxcbiAgICAgIGVxdWFsczogYW5ndWxhci5lcXVhbHMsXG4gICAgICBwYXR0ZXJuOiAvLiovXG4gICAgfVxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldERlZmF1bHRDb25maWcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0cmljdDogaXNTdHJpY3RNb2RlLFxuICAgICAgY2FzZUluc2Vuc2l0aXZlOiBpc0Nhc2VJbnNlbnNpdGl2ZVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBpc0luamVjdGFibGUodmFsdWUpIHtcbiAgICByZXR1cm4gKGlzRnVuY3Rpb24odmFsdWUpIHx8IChpc0FycmF5KHZhbHVlKSAmJiBpc0Z1bmN0aW9uKHZhbHVlW3ZhbHVlLmxlbmd0aCAtIDFdKSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFtJbnRlcm5hbF0gR2V0IHRoZSBkZWZhdWx0IHZhbHVlIG9mIGEgcGFyYW1ldGVyLCB3aGljaCBtYXkgYmUgYW4gaW5qZWN0YWJsZSBmdW5jdGlvbi5cbiAgICovXG4gICRVcmxNYXRjaGVyRmFjdG9yeS4kJGdldERlZmF1bHRWYWx1ZSA9IGZ1bmN0aW9uKGNvbmZpZykge1xuICAgIGlmICghaXNJbmplY3RhYmxlKGNvbmZpZy52YWx1ZSkpIHJldHVybiBjb25maWcudmFsdWU7XG4gICAgaWYgKCFpbmplY3RvcikgdGhyb3cgbmV3IEVycm9yKFwiSW5qZWN0YWJsZSBmdW5jdGlvbnMgY2Fubm90IGJlIGNhbGxlZCBhdCBjb25maWd1cmF0aW9uIHRpbWVcIik7XG4gICAgcmV0dXJuIGluamVjdG9yLmludm9rZShjb25maWcudmFsdWUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I2Nhc2VJbnNlbnNpdGl2ZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBEZWZpbmVzIHdoZXRoZXIgVVJMIG1hdGNoaW5nIHNob3VsZCBiZSBjYXNlIHNlbnNpdGl2ZSAodGhlIGRlZmF1bHQgYmVoYXZpb3IpLCBvciBub3QuXG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gdmFsdWUgYGZhbHNlYCB0byBtYXRjaCBVUkwgaW4gYSBjYXNlIHNlbnNpdGl2ZSBtYW5uZXI7IG90aGVyd2lzZSBgdHJ1ZWA7XG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0aGUgY3VycmVudCB2YWx1ZSBvZiBjYXNlSW5zZW5zaXRpdmVcbiAgICovXG4gIHRoaXMuY2FzZUluc2Vuc2l0aXZlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoaXNEZWZpbmVkKHZhbHVlKSlcbiAgICAgIGlzQ2FzZUluc2Vuc2l0aXZlID0gdmFsdWU7XG4gICAgcmV0dXJuIGlzQ2FzZUluc2Vuc2l0aXZlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I3N0cmljdE1vZGVcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogRGVmaW5lcyB3aGV0aGVyIFVSTHMgc2hvdWxkIG1hdGNoIHRyYWlsaW5nIHNsYXNoZXMsIG9yIG5vdCAodGhlIGRlZmF1bHQgYmVoYXZpb3IpLlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB2YWx1ZSBgZmFsc2VgIHRvIG1hdGNoIHRyYWlsaW5nIHNsYXNoZXMgaW4gVVJMcywgb3RoZXJ3aXNlIGB0cnVlYC5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IHRoZSBjdXJyZW50IHZhbHVlIG9mIHN0cmljdE1vZGVcbiAgICovXG4gIHRoaXMuc3RyaWN0TW9kZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKGlzRGVmaW5lZCh2YWx1ZSkpXG4gICAgICBpc1N0cmljdE1vZGUgPSB2YWx1ZTtcbiAgICByZXR1cm4gaXNTdHJpY3RNb2RlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I2RlZmF1bHRTcXVhc2hQb2xpY3lcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogU2V0cyB0aGUgZGVmYXVsdCBiZWhhdmlvciB3aGVuIGdlbmVyYXRpbmcgb3IgbWF0Y2hpbmcgVVJMcyB3aXRoIGRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIEEgc3RyaW5nIHRoYXQgZGVmaW5lcyB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgVVJMIHNxdWFzaGluZyBiZWhhdmlvci5cbiAgICogICAgYG5vc3F1YXNoYDogV2hlbiBnZW5lcmF0aW5nIGFuIGhyZWYgd2l0aCBhIGRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlLCBkbyBub3Qgc3F1YXNoIHRoZSBwYXJhbWV0ZXIgdmFsdWUgZnJvbSB0aGUgVVJMXG4gICAqICAgIGBzbGFzaGA6IFdoZW4gZ2VuZXJhdGluZyBhbiBocmVmIHdpdGggYSBkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZSwgc3F1YXNoIChyZW1vdmUpIHRoZSBwYXJhbWV0ZXIgdmFsdWUsIGFuZCwgaWYgdGhlXG4gICAqICAgICAgICAgICAgIHBhcmFtZXRlciBpcyBzdXJyb3VuZGVkIGJ5IHNsYXNoZXMsIHNxdWFzaCAocmVtb3ZlKSBvbmUgc2xhc2ggZnJvbSB0aGUgVVJMXG4gICAqICAgIGFueSBvdGhlciBzdHJpbmcsIGUuZy4gXCJ+XCI6IFdoZW4gZ2VuZXJhdGluZyBhbiBocmVmIHdpdGggYSBkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZSwgc3F1YXNoIChyZW1vdmUpXG4gICAqICAgICAgICAgICAgIHRoZSBwYXJhbWV0ZXIgdmFsdWUgZnJvbSB0aGUgVVJMIGFuZCByZXBsYWNlIGl0IHdpdGggdGhpcyBzdHJpbmcuXG4gICAqL1xuICB0aGlzLmRlZmF1bHRTcXVhc2hQb2xpY3kgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghaXNEZWZpbmVkKHZhbHVlKSkgcmV0dXJuIGRlZmF1bHRTcXVhc2hQb2xpY3k7XG4gICAgaWYgKHZhbHVlICE9PSB0cnVlICYmIHZhbHVlICE9PSBmYWxzZSAmJiAhaXNTdHJpbmcodmFsdWUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBzcXVhc2ggcG9saWN5OiBcIiArIHZhbHVlICsgXCIuIFZhbGlkIHBvbGljaWVzOiBmYWxzZSwgdHJ1ZSwgYXJiaXRyYXJ5LXN0cmluZ1wiKTtcbiAgICBkZWZhdWx0U3F1YXNoUG9saWN5ID0gdmFsdWU7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I2NvbXBpbGVcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQ3JlYXRlcyBhIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfSBmb3IgdGhlIHNwZWNpZmllZCBwYXR0ZXJuLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVybiAgVGhlIFVSTCBwYXR0ZXJuLlxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnICBUaGUgY29uZmlnIG9iamVjdCBoYXNoLlxuICAgKiBAcmV0dXJucyB7VXJsTWF0Y2hlcn0gIFRoZSBVcmxNYXRjaGVyLlxuICAgKi9cbiAgdGhpcy5jb21waWxlID0gZnVuY3Rpb24gKHBhdHRlcm4sIGNvbmZpZykge1xuICAgIHJldHVybiBuZXcgVXJsTWF0Y2hlcihwYXR0ZXJuLCBleHRlbmQoZ2V0RGVmYXVsdENvbmZpZygpLCBjb25maWcpKTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNpc01hdGNoZXJcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgb2JqZWN0IGlzIGEgYFVybE1hdGNoZXJgLCBvciBmYWxzZSBvdGhlcndpc2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgIFRoZSBvYmplY3QgdG8gcGVyZm9ybSB0aGUgdHlwZSBjaGVjayBhZ2FpbnN0LlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gIFJldHVybnMgYHRydWVgIGlmIHRoZSBvYmplY3QgbWF0Y2hlcyB0aGUgYFVybE1hdGNoZXJgIGludGVyZmFjZSwgYnlcbiAgICogICAgICAgICAgaW1wbGVtZW50aW5nIGFsbCB0aGUgc2FtZSBtZXRob2RzLlxuICAgKi9cbiAgdGhpcy5pc01hdGNoZXIgPSBmdW5jdGlvbiAobykge1xuICAgIGlmICghaXNPYmplY3QobykpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuICAgIGZvckVhY2goVXJsTWF0Y2hlci5wcm90b3R5cGUsIGZ1bmN0aW9uKHZhbCwgbmFtZSkge1xuICAgICAgaWYgKGlzRnVuY3Rpb24odmFsKSkge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQgJiYgKGlzRGVmaW5lZChvW25hbWVdKSAmJiBpc0Z1bmN0aW9uKG9bbmFtZV0pKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I3R5cGVcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmVnaXN0ZXJzIGEgY3VzdG9tIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUgYFR5cGVgfSBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0b1xuICAgKiBnZW5lcmF0ZSBVUkxzIHdpdGggdHlwZWQgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgIFRoZSB0eXBlIG5hbWUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBkZWZpbml0aW9uICAgVGhlIHR5cGUgZGVmaW5pdGlvbi4gU2VlXG4gICAqICAgICAgICB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlIGBUeXBlYH0gZm9yIGluZm9ybWF0aW9uIG9uIHRoZSB2YWx1ZXMgYWNjZXB0ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBkZWZpbml0aW9uRm4gKG9wdGlvbmFsKSBBIGZ1bmN0aW9uIHRoYXQgaXMgaW5qZWN0ZWQgYmVmb3JlIHRoZSBhcHBcbiAgICogICAgICAgIHJ1bnRpbWUgc3RhcnRzLiAgVGhlIHJlc3VsdCBvZiB0aGlzIGZ1bmN0aW9uIGlzIG1lcmdlZCBpbnRvIHRoZSBleGlzdGluZyBgZGVmaW5pdGlvbmAuXG4gICAqICAgICAgICBTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSBgVHlwZWB9IGZvciBpbmZvcm1hdGlvbiBvbiB0aGUgdmFsdWVzIGFjY2VwdGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSAgUmV0dXJucyBgJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJgLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiBUaGlzIGlzIGEgc2ltcGxlIGV4YW1wbGUgb2YgYSBjdXN0b20gdHlwZSB0aGF0IGVuY29kZXMgYW5kIGRlY29kZXMgaXRlbXMgZnJvbSBhblxuICAgKiBhcnJheSwgdXNpbmcgdGhlIGFycmF5IGluZGV4IGFzIHRoZSBVUkwtZW5jb2RlZCB2YWx1ZTpcbiAgICpcbiAgICogPHByZT5cbiAgICogdmFyIGxpc3QgPSBbJ0pvaG4nLCAnUGF1bCcsICdHZW9yZ2UnLCAnUmluZ28nXTtcbiAgICpcbiAgICogJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXIudHlwZSgnbGlzdEl0ZW0nLCB7XG4gICAqICAgZW5jb2RlOiBmdW5jdGlvbihpdGVtKSB7XG4gICAqICAgICAvLyBSZXByZXNlbnQgdGhlIGxpc3QgaXRlbSBpbiB0aGUgVVJMIHVzaW5nIGl0cyBjb3JyZXNwb25kaW5nIGluZGV4XG4gICAqICAgICByZXR1cm4gbGlzdC5pbmRleE9mKGl0ZW0pO1xuICAgKiAgIH0sXG4gICAqICAgZGVjb2RlOiBmdW5jdGlvbihpdGVtKSB7XG4gICAqICAgICAvLyBMb29rIHVwIHRoZSBsaXN0IGl0ZW0gYnkgaW5kZXhcbiAgICogICAgIHJldHVybiBsaXN0W3BhcnNlSW50KGl0ZW0sIDEwKV07XG4gICAqICAgfSxcbiAgICogICBpczogZnVuY3Rpb24oaXRlbSkge1xuICAgKiAgICAgLy8gRW5zdXJlIHRoZSBpdGVtIGlzIHZhbGlkIGJ5IGNoZWNraW5nIHRvIHNlZSB0aGF0IGl0IGFwcGVhcnNcbiAgICogICAgIC8vIGluIHRoZSBsaXN0XG4gICAqICAgICByZXR1cm4gbGlzdC5pbmRleE9mKGl0ZW0pID4gLTE7XG4gICAqICAgfVxuICAgKiB9KTtcbiAgICpcbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3QnLCB7XG4gICAqICAgdXJsOiBcIi9saXN0L3tpdGVtOmxpc3RJdGVtfVwiLFxuICAgKiAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAqICAgICBjb25zb2xlLmxvZygkc3RhdGVQYXJhbXMuaXRlbSk7XG4gICAqICAgfVxuICAgKiB9KTtcbiAgICpcbiAgICogLy8gLi4uXG4gICAqXG4gICAqIC8vIENoYW5nZXMgVVJMIHRvICcvbGlzdC8zJywgbG9ncyBcIlJpbmdvXCIgdG8gdGhlIGNvbnNvbGVcbiAgICogJHN0YXRlLmdvKCdsaXN0JywgeyBpdGVtOiBcIlJpbmdvXCIgfSk7XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBUaGlzIGlzIGEgbW9yZSBjb21wbGV4IGV4YW1wbGUgb2YgYSB0eXBlIHRoYXQgcmVsaWVzIG9uIGRlcGVuZGVuY3kgaW5qZWN0aW9uIHRvXG4gICAqIGludGVyYWN0IHdpdGggc2VydmljZXMsIGFuZCB1c2VzIHRoZSBwYXJhbWV0ZXIgbmFtZSBmcm9tIHRoZSBVUkwgdG8gaW5mZXIgaG93IHRvXG4gICAqIGhhbmRsZSBlbmNvZGluZyBhbmQgZGVjb2RpbmcgcGFyYW1ldGVyIHZhbHVlczpcbiAgICpcbiAgICogPHByZT5cbiAgICogLy8gRGVmaW5lcyBhIGN1c3RvbSB0eXBlIHRoYXQgZ2V0cyBhIHZhbHVlIGZyb20gYSBzZXJ2aWNlLFxuICAgKiAvLyB3aGVyZSBlYWNoIHNlcnZpY2UgZ2V0cyBkaWZmZXJlbnQgdHlwZXMgb2YgdmFsdWVzIGZyb21cbiAgICogLy8gYSBiYWNrZW5kIEFQSTpcbiAgICogJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXIudHlwZSgnZGJPYmplY3QnLCB7fSwgZnVuY3Rpb24oVXNlcnMsIFBvc3RzKSB7XG4gICAqXG4gICAqICAgLy8gTWF0Y2hlcyB1cCBzZXJ2aWNlcyB0byBVUkwgcGFyYW1ldGVyIG5hbWVzXG4gICAqICAgdmFyIHNlcnZpY2VzID0ge1xuICAgKiAgICAgdXNlcjogVXNlcnMsXG4gICAqICAgICBwb3N0OiBQb3N0c1xuICAgKiAgIH07XG4gICAqXG4gICAqICAgcmV0dXJuIHtcbiAgICogICAgIGVuY29kZTogZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAqICAgICAgIC8vIFJlcHJlc2VudCB0aGUgb2JqZWN0IGluIHRoZSBVUkwgdXNpbmcgaXRzIHVuaXF1ZSBJRFxuICAgKiAgICAgICByZXR1cm4gb2JqZWN0LmlkO1xuICAgKiAgICAgfSxcbiAgICogICAgIGRlY29kZTogZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgKiAgICAgICAvLyBMb29rIHVwIHRoZSBvYmplY3QgYnkgSUQsIHVzaW5nIHRoZSBwYXJhbWV0ZXJcbiAgICogICAgICAgLy8gbmFtZSAoa2V5KSB0byBjYWxsIHRoZSBjb3JyZWN0IHNlcnZpY2VcbiAgICogICAgICAgcmV0dXJuIHNlcnZpY2VzW2tleV0uZmluZEJ5SWQodmFsdWUpO1xuICAgKiAgICAgfSxcbiAgICogICAgIGlzOiBmdW5jdGlvbihvYmplY3QsIGtleSkge1xuICAgKiAgICAgICAvLyBDaGVjayB0aGF0IG9iamVjdCBpcyBhIHZhbGlkIGRiT2JqZWN0XG4gICAqICAgICAgIHJldHVybiBhbmd1bGFyLmlzT2JqZWN0KG9iamVjdCkgJiYgb2JqZWN0LmlkICYmIHNlcnZpY2VzW2tleV07XG4gICAqICAgICB9XG4gICAqICAgICBlcXVhbHM6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICogICAgICAgLy8gQ2hlY2sgdGhlIGVxdWFsaXR5IG9mIGRlY29kZWQgb2JqZWN0cyBieSBjb21wYXJpbmdcbiAgICogICAgICAgLy8gdGhlaXIgdW5pcXVlIElEc1xuICAgKiAgICAgICByZXR1cm4gYS5pZCA9PT0gYi5pZDtcbiAgICogICAgIH1cbiAgICogICB9O1xuICAgKiB9KTtcbiAgICpcbiAgICogLy8gSW4gYSBjb25maWcoKSBibG9jaywgeW91IGNhbiB0aGVuIGF0dGFjaCBVUkxzIHdpdGhcbiAgICogLy8gdHlwZS1hbm5vdGF0ZWQgcGFyYW1ldGVyczpcbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3VzZXJzJywge1xuICAgKiAgIHVybDogXCIvdXNlcnNcIixcbiAgICogICAvLyAuLi5cbiAgICogfSkuc3RhdGUoJ3VzZXJzLml0ZW0nLCB7XG4gICAqICAgdXJsOiBcIi97dXNlcjpkYk9iamVjdH1cIixcbiAgICogICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcykge1xuICAgKiAgICAgLy8gJHN0YXRlUGFyYW1zLnVzZXIgd2lsbCBub3cgYmUgYW4gb2JqZWN0IHJldHVybmVkIGZyb21cbiAgICogICAgIC8vIHRoZSBVc2VycyBzZXJ2aWNlXG4gICAqICAgfSxcbiAgICogICAvLyAuLi5cbiAgICogfSk7XG4gICAqIDwvcHJlPlxuICAgKi9cbiAgdGhpcy50eXBlID0gZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24sIGRlZmluaXRpb25Gbikge1xuICAgIGlmICghaXNEZWZpbmVkKGRlZmluaXRpb24pKSByZXR1cm4gJHR5cGVzW25hbWVdO1xuICAgIGlmICgkdHlwZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHRocm93IG5ldyBFcnJvcihcIkEgdHlwZSBuYW1lZCAnXCIgKyBuYW1lICsgXCInIGhhcyBhbHJlYWR5IGJlZW4gZGVmaW5lZC5cIik7XG5cbiAgICAkdHlwZXNbbmFtZV0gPSBuZXcgVHlwZShleHRlbmQoeyBuYW1lOiBuYW1lIH0sIGRlZmluaXRpb24pKTtcbiAgICBpZiAoZGVmaW5pdGlvbkZuKSB7XG4gICAgICB0eXBlUXVldWUucHVzaCh7IG5hbWU6IG5hbWUsIGRlZjogZGVmaW5pdGlvbkZuIH0pO1xuICAgICAgaWYgKCFlbnF1ZXVlKSBmbHVzaFR5cGVRdWV1ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBgZmx1c2hUeXBlUXVldWUoKWAgd2FpdHMgdW50aWwgYCR1cmxNYXRjaGVyRmFjdG9yeWAgaXMgaW5qZWN0ZWQgYmVmb3JlIGludm9raW5nIHRoZSBxdWV1ZWQgYGRlZmluaXRpb25GbmBzXG4gIGZ1bmN0aW9uIGZsdXNoVHlwZVF1ZXVlKCkge1xuICAgIHdoaWxlKHR5cGVRdWV1ZS5sZW5ndGgpIHtcbiAgICAgIHZhciB0eXBlID0gdHlwZVF1ZXVlLnNoaWZ0KCk7XG4gICAgICBpZiAodHlwZS5wYXR0ZXJuKSB0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2Fubm90IG92ZXJyaWRlIGEgdHlwZSdzIC5wYXR0ZXJuIGF0IHJ1bnRpbWUuXCIpO1xuICAgICAgYW5ndWxhci5leHRlbmQoJHR5cGVzW3R5cGUubmFtZV0sIGluamVjdG9yLmludm9rZSh0eXBlLmRlZikpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlZ2lzdGVyIGRlZmF1bHQgdHlwZXMuIFN0b3JlIHRoZW0gaW4gdGhlIHByb3RvdHlwZSBvZiAkdHlwZXMuXG4gIGZvckVhY2goZGVmYXVsdFR5cGVzLCBmdW5jdGlvbih0eXBlLCBuYW1lKSB7ICR0eXBlc1tuYW1lXSA9IG5ldyBUeXBlKGV4dGVuZCh7bmFtZTogbmFtZX0sIHR5cGUpKTsgfSk7XG4gICR0eXBlcyA9IGluaGVyaXQoJHR5cGVzLCB7fSk7XG5cbiAgLyogTm8gbmVlZCB0byBkb2N1bWVudCAkZ2V0LCBzaW5jZSBpdCByZXR1cm5zIHRoaXMgKi9cbiAgdGhpcy4kZ2V0ID0gWyckaW5qZWN0b3InLCBmdW5jdGlvbiAoJGluamVjdG9yKSB7XG4gICAgaW5qZWN0b3IgPSAkaW5qZWN0b3I7XG4gICAgZW5xdWV1ZSA9IGZhbHNlO1xuICAgIGZsdXNoVHlwZVF1ZXVlKCk7XG5cbiAgICBmb3JFYWNoKGRlZmF1bHRUeXBlcywgZnVuY3Rpb24odHlwZSwgbmFtZSkge1xuICAgICAgaWYgKCEkdHlwZXNbbmFtZV0pICR0eXBlc1tuYW1lXSA9IG5ldyBUeXBlKHR5cGUpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XTtcblxuICB0aGlzLlBhcmFtID0gZnVuY3Rpb24gUGFyYW0oaWQsIHR5cGUsIGNvbmZpZywgbG9jYXRpb24pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY29uZmlnID0gdW53cmFwU2hvcnRoYW5kKGNvbmZpZyk7XG4gICAgdHlwZSA9IGdldFR5cGUoY29uZmlnLCB0eXBlLCBsb2NhdGlvbik7XG4gICAgdmFyIGFycmF5TW9kZSA9IGdldEFycmF5TW9kZSgpO1xuICAgIHR5cGUgPSBhcnJheU1vZGUgPyB0eXBlLiRhc0FycmF5KGFycmF5TW9kZSwgbG9jYXRpb24gPT09IFwic2VhcmNoXCIpIDogdHlwZTtcbiAgICBpZiAodHlwZS5uYW1lID09PSBcInN0cmluZ1wiICYmICFhcnJheU1vZGUgJiYgbG9jYXRpb24gPT09IFwicGF0aFwiICYmIGNvbmZpZy52YWx1ZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgY29uZmlnLnZhbHVlID0gXCJcIjsgLy8gZm9yIDAuMi54OyBpbiAwLjMuMCsgZG8gbm90IGF1dG9tYXRpY2FsbHkgZGVmYXVsdCB0byBcIlwiXG4gICAgdmFyIGlzT3B0aW9uYWwgPSBjb25maWcudmFsdWUgIT09IHVuZGVmaW5lZDtcbiAgICB2YXIgc3F1YXNoID0gZ2V0U3F1YXNoUG9saWN5KGNvbmZpZywgaXNPcHRpb25hbCk7XG4gICAgdmFyIHJlcGxhY2UgPSBnZXRSZXBsYWNlKGNvbmZpZywgYXJyYXlNb2RlLCBpc09wdGlvbmFsLCBzcXVhc2gpO1xuXG4gICAgZnVuY3Rpb24gdW53cmFwU2hvcnRoYW5kKGNvbmZpZykge1xuICAgICAgdmFyIGtleXMgPSBpc09iamVjdChjb25maWcpID8gb2JqZWN0S2V5cyhjb25maWcpIDogW107XG4gICAgICB2YXIgaXNTaG9ydGhhbmQgPSBpbmRleE9mKGtleXMsIFwidmFsdWVcIikgPT09IC0xICYmIGluZGV4T2Yoa2V5cywgXCJ0eXBlXCIpID09PSAtMSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXhPZihrZXlzLCBcInNxdWFzaFwiKSA9PT0gLTEgJiYgaW5kZXhPZihrZXlzLCBcImFycmF5XCIpID09PSAtMTtcbiAgICAgIGlmIChpc1Nob3J0aGFuZCkgY29uZmlnID0geyB2YWx1ZTogY29uZmlnIH07XG4gICAgICBjb25maWcuJCRmbiA9IGlzSW5qZWN0YWJsZShjb25maWcudmFsdWUpID8gY29uZmlnLnZhbHVlIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gY29uZmlnLnZhbHVlOyB9O1xuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRUeXBlKGNvbmZpZywgdXJsVHlwZSwgbG9jYXRpb24pIHtcbiAgICAgIGlmIChjb25maWcudHlwZSAmJiB1cmxUeXBlKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXJhbSAnXCIraWQrXCInIGhhcyB0d28gdHlwZSBjb25maWd1cmF0aW9ucy5cIik7XG4gICAgICBpZiAodXJsVHlwZSkgcmV0dXJuIHVybFR5cGU7XG4gICAgICBpZiAoIWNvbmZpZy50eXBlKSByZXR1cm4gKGxvY2F0aW9uID09PSBcImNvbmZpZ1wiID8gJHR5cGVzLmFueSA6ICR0eXBlcy5zdHJpbmcpO1xuXG4gICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyhjb25maWcudHlwZSkpXG4gICAgICAgIHJldHVybiAkdHlwZXNbY29uZmlnLnR5cGVdO1xuICAgICAgaWYgKGNvbmZpZy50eXBlIGluc3RhbmNlb2YgVHlwZSlcbiAgICAgICAgcmV0dXJuIGNvbmZpZy50eXBlO1xuICAgICAgcmV0dXJuIG5ldyBUeXBlKGNvbmZpZy50eXBlKTtcbiAgICB9XG5cbiAgICAvLyBhcnJheSBjb25maWc6IHBhcmFtIG5hbWUgKHBhcmFtW10pIG92ZXJyaWRlcyBkZWZhdWx0IHNldHRpbmdzLiAgZXhwbGljaXQgY29uZmlnIG92ZXJyaWRlcyBwYXJhbSBuYW1lLlxuICAgIGZ1bmN0aW9uIGdldEFycmF5TW9kZSgpIHtcbiAgICAgIHZhciBhcnJheURlZmF1bHRzID0geyBhcnJheTogKGxvY2F0aW9uID09PSBcInNlYXJjaFwiID8gXCJhdXRvXCIgOiBmYWxzZSkgfTtcbiAgICAgIHZhciBhcnJheVBhcmFtTm9tZW5jbGF0dXJlID0gaWQubWF0Y2goL1xcW1xcXSQvKSA/IHsgYXJyYXk6IHRydWUgfSA6IHt9O1xuICAgICAgcmV0dXJuIGV4dGVuZChhcnJheURlZmF1bHRzLCBhcnJheVBhcmFtTm9tZW5jbGF0dXJlLCBjb25maWcpLmFycmF5O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgZmFsc2UsIHRydWUsIG9yIHRoZSBzcXVhc2ggdmFsdWUgdG8gaW5kaWNhdGUgdGhlIFwiZGVmYXVsdCBwYXJhbWV0ZXIgdXJsIHNxdWFzaCBwb2xpY3lcIi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRTcXVhc2hQb2xpY3koY29uZmlnLCBpc09wdGlvbmFsKSB7XG4gICAgICB2YXIgc3F1YXNoID0gY29uZmlnLnNxdWFzaDtcbiAgICAgIGlmICghaXNPcHRpb25hbCB8fCBzcXVhc2ggPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgICBpZiAoIWlzRGVmaW5lZChzcXVhc2gpIHx8IHNxdWFzaCA9PSBudWxsKSByZXR1cm4gZGVmYXVsdFNxdWFzaFBvbGljeTtcbiAgICAgIGlmIChzcXVhc2ggPT09IHRydWUgfHwgaXNTdHJpbmcoc3F1YXNoKSkgcmV0dXJuIHNxdWFzaDtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3F1YXNoIHBvbGljeTogJ1wiICsgc3F1YXNoICsgXCInLiBWYWxpZCBwb2xpY2llczogZmFsc2UsIHRydWUsIG9yIGFyYml0cmFyeSBzdHJpbmdcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVwbGFjZShjb25maWcsIGFycmF5TW9kZSwgaXNPcHRpb25hbCwgc3F1YXNoKSB7XG4gICAgICB2YXIgcmVwbGFjZSwgY29uZmlndXJlZEtleXMsIGRlZmF1bHRQb2xpY3kgPSBbXG4gICAgICAgIHsgZnJvbTogXCJcIiwgICB0bzogKGlzT3B0aW9uYWwgfHwgYXJyYXlNb2RlID8gdW5kZWZpbmVkIDogXCJcIikgfSxcbiAgICAgICAgeyBmcm9tOiBudWxsLCB0bzogKGlzT3B0aW9uYWwgfHwgYXJyYXlNb2RlID8gdW5kZWZpbmVkIDogXCJcIikgfVxuICAgICAgXTtcbiAgICAgIHJlcGxhY2UgPSBpc0FycmF5KGNvbmZpZy5yZXBsYWNlKSA/IGNvbmZpZy5yZXBsYWNlIDogW107XG4gICAgICBpZiAoaXNTdHJpbmcoc3F1YXNoKSlcbiAgICAgICAgcmVwbGFjZS5wdXNoKHsgZnJvbTogc3F1YXNoLCB0bzogdW5kZWZpbmVkIH0pO1xuICAgICAgY29uZmlndXJlZEtleXMgPSBtYXAocmVwbGFjZSwgZnVuY3Rpb24oaXRlbSkgeyByZXR1cm4gaXRlbS5mcm9tOyB9ICk7XG4gICAgICByZXR1cm4gZmlsdGVyKGRlZmF1bHRQb2xpY3ksIGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGluZGV4T2YoY29uZmlndXJlZEtleXMsIGl0ZW0uZnJvbSkgPT09IC0xOyB9KS5jb25jYXQocmVwbGFjZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogW0ludGVybmFsXSBHZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgYSBwYXJhbWV0ZXIsIHdoaWNoIG1heSBiZSBhbiBpbmplY3RhYmxlIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uICQkZ2V0RGVmYXVsdFZhbHVlKCkge1xuICAgICAgaWYgKCFpbmplY3RvcikgdGhyb3cgbmV3IEVycm9yKFwiSW5qZWN0YWJsZSBmdW5jdGlvbnMgY2Fubm90IGJlIGNhbGxlZCBhdCBjb25maWd1cmF0aW9uIHRpbWVcIik7XG4gICAgICB2YXIgZGVmYXVsdFZhbHVlID0gaW5qZWN0b3IuaW52b2tlKGNvbmZpZy4kJGZuKTtcbiAgICAgIGlmIChkZWZhdWx0VmFsdWUgIT09IG51bGwgJiYgZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQgJiYgIXNlbGYudHlwZS5pcyhkZWZhdWx0VmFsdWUpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJEZWZhdWx0IHZhbHVlIChcIiArIGRlZmF1bHRWYWx1ZSArIFwiKSBmb3IgcGFyYW1ldGVyICdcIiArIHNlbGYuaWQgKyBcIicgaXMgbm90IGFuIGluc3RhbmNlIG9mIFR5cGUgKFwiICsgc2VsZi50eXBlLm5hbWUgKyBcIilcIik7XG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFtJbnRlcm5hbF0gR2V0cyB0aGUgZGVjb2RlZCByZXByZXNlbnRhdGlvbiBvZiBhIHZhbHVlIGlmIHRoZSB2YWx1ZSBpcyBkZWZpbmVkLCBvdGhlcndpc2UsIHJldHVybnMgdGhlXG4gICAgICogZGVmYXVsdCB2YWx1ZSwgd2hpY2ggbWF5IGJlIHRoZSByZXN1bHQgb2YgYW4gaW5qZWN0YWJsZSBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiAkdmFsdWUodmFsdWUpIHtcbiAgICAgIGZ1bmN0aW9uIGhhc1JlcGxhY2VWYWwodmFsKSB7IHJldHVybiBmdW5jdGlvbihvYmopIHsgcmV0dXJuIG9iai5mcm9tID09PSB2YWw7IH07IH1cbiAgICAgIGZ1bmN0aW9uICRyZXBsYWNlKHZhbHVlKSB7XG4gICAgICAgIHZhciByZXBsYWNlbWVudCA9IG1hcChmaWx0ZXIoc2VsZi5yZXBsYWNlLCBoYXNSZXBsYWNlVmFsKHZhbHVlKSksIGZ1bmN0aW9uKG9iaikgeyByZXR1cm4gb2JqLnRvOyB9KTtcbiAgICAgICAgcmV0dXJuIHJlcGxhY2VtZW50Lmxlbmd0aCA/IHJlcGxhY2VtZW50WzBdIDogdmFsdWU7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9ICRyZXBsYWNlKHZhbHVlKTtcbiAgICAgIHJldHVybiAhaXNEZWZpbmVkKHZhbHVlKSA/ICQkZ2V0RGVmYXVsdFZhbHVlKCkgOiBzZWxmLnR5cGUuJG5vcm1hbGl6ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdG9TdHJpbmcoKSB7IHJldHVybiBcIntQYXJhbTpcIiArIGlkICsgXCIgXCIgKyB0eXBlICsgXCIgc3F1YXNoOiAnXCIgKyBzcXVhc2ggKyBcIicgb3B0aW9uYWw6IFwiICsgaXNPcHRpb25hbCArIFwifVwiOyB9XG5cbiAgICBleHRlbmQodGhpcywge1xuICAgICAgaWQ6IGlkLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcbiAgICAgIGFycmF5OiBhcnJheU1vZGUsXG4gICAgICBzcXVhc2g6IHNxdWFzaCxcbiAgICAgIHJlcGxhY2U6IHJlcGxhY2UsXG4gICAgICBpc09wdGlvbmFsOiBpc09wdGlvbmFsLFxuICAgICAgdmFsdWU6ICR2YWx1ZSxcbiAgICAgIGR5bmFtaWM6IHVuZGVmaW5lZCxcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgdG9TdHJpbmc6IHRvU3RyaW5nXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gUGFyYW1TZXQocGFyYW1zKSB7XG4gICAgZXh0ZW5kKHRoaXMsIHBhcmFtcyB8fCB7fSk7XG4gIH1cblxuICBQYXJhbVNldC5wcm90b3R5cGUgPSB7XG4gICAgJCRuZXc6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGluaGVyaXQodGhpcywgZXh0ZW5kKG5ldyBQYXJhbVNldCgpLCB7ICQkcGFyZW50OiB0aGlzfSkpO1xuICAgIH0sXG4gICAgJCRrZXlzOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIga2V5cyA9IFtdLCBjaGFpbiA9IFtdLCBwYXJlbnQgPSB0aGlzLFxuICAgICAgICBpZ25vcmUgPSBvYmplY3RLZXlzKFBhcmFtU2V0LnByb3RvdHlwZSk7XG4gICAgICB3aGlsZSAocGFyZW50KSB7IGNoYWluLnB1c2gocGFyZW50KTsgcGFyZW50ID0gcGFyZW50LiQkcGFyZW50OyB9XG4gICAgICBjaGFpbi5yZXZlcnNlKCk7XG4gICAgICBmb3JFYWNoKGNoYWluLCBmdW5jdGlvbihwYXJhbXNldCkge1xuICAgICAgICBmb3JFYWNoKG9iamVjdEtleXMocGFyYW1zZXQpLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgICAgIGlmIChpbmRleE9mKGtleXMsIGtleSkgPT09IC0xICYmIGluZGV4T2YoaWdub3JlLCBrZXkpID09PSAtMSkga2V5cy5wdXNoKGtleSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4ga2V5cztcbiAgICB9LFxuICAgICQkdmFsdWVzOiBmdW5jdGlvbihwYXJhbVZhbHVlcykge1xuICAgICAgdmFyIHZhbHVlcyA9IHt9LCBzZWxmID0gdGhpcztcbiAgICAgIGZvckVhY2goc2VsZi4kJGtleXMoKSwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHZhbHVlc1trZXldID0gc2VsZltrZXldLnZhbHVlKHBhcmFtVmFsdWVzICYmIHBhcmFtVmFsdWVzW2tleV0pO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdmFsdWVzO1xuICAgIH0sXG4gICAgJCRlcXVhbHM6IGZ1bmN0aW9uKHBhcmFtVmFsdWVzMSwgcGFyYW1WYWx1ZXMyKSB7XG4gICAgICB2YXIgZXF1YWwgPSB0cnVlLCBzZWxmID0gdGhpcztcbiAgICAgIGZvckVhY2goc2VsZi4kJGtleXMoKSwgZnVuY3Rpb24oa2V5KSB7XG4gICAgICAgIHZhciBsZWZ0ID0gcGFyYW1WYWx1ZXMxICYmIHBhcmFtVmFsdWVzMVtrZXldLCByaWdodCA9IHBhcmFtVmFsdWVzMiAmJiBwYXJhbVZhbHVlczJba2V5XTtcbiAgICAgICAgaWYgKCFzZWxmW2tleV0udHlwZS5lcXVhbHMobGVmdCwgcmlnaHQpKSBlcXVhbCA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZXF1YWw7XG4gICAgfSxcbiAgICAkJHZhbGlkYXRlczogZnVuY3Rpb24gJCR2YWxpZGF0ZShwYXJhbVZhbHVlcykge1xuICAgICAgdmFyIGtleXMgPSB0aGlzLiQka2V5cygpLCBpLCBwYXJhbSwgcmF3VmFsLCBub3JtYWxpemVkLCBlbmNvZGVkO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFyYW0gPSB0aGlzW2tleXNbaV1dO1xuICAgICAgICByYXdWYWwgPSBwYXJhbVZhbHVlc1trZXlzW2ldXTtcbiAgICAgICAgaWYgKChyYXdWYWwgPT09IHVuZGVmaW5lZCB8fCByYXdWYWwgPT09IG51bGwpICYmIHBhcmFtLmlzT3B0aW9uYWwpXG4gICAgICAgICAgYnJlYWs7IC8vIFRoZXJlIHdhcyBubyBwYXJhbWV0ZXIgdmFsdWUsIGJ1dCB0aGUgcGFyYW0gaXMgb3B0aW9uYWxcbiAgICAgICAgbm9ybWFsaXplZCA9IHBhcmFtLnR5cGUuJG5vcm1hbGl6ZShyYXdWYWwpO1xuICAgICAgICBpZiAoIXBhcmFtLnR5cGUuaXMobm9ybWFsaXplZCkpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUaGUgdmFsdWUgd2FzIG5vdCBvZiB0aGUgY29ycmVjdCBUeXBlLCBhbmQgY291bGQgbm90IGJlIGRlY29kZWQgdG8gdGhlIGNvcnJlY3QgVHlwZVxuICAgICAgICBlbmNvZGVkID0gcGFyYW0udHlwZS5lbmNvZGUobm9ybWFsaXplZCk7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKGVuY29kZWQpICYmICFwYXJhbS50eXBlLnBhdHRlcm4uZXhlYyhlbmNvZGVkKSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIFRoZSB2YWx1ZSB3YXMgb2YgdGhlIGNvcnJlY3QgdHlwZSwgYnV0IHdoZW4gZW5jb2RlZCwgZGlkIG5vdCBtYXRjaCB0aGUgVHlwZSdzIHJlZ2V4cFxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICAkJHBhcmVudDogdW5kZWZpbmVkXG4gIH07XG5cbiAgdGhpcy5QYXJhbVNldCA9IFBhcmFtU2V0O1xufVxuXG4vLyBSZWdpc3RlciBhcyBhIHByb3ZpZGVyIHNvIGl0J3MgYXZhaWxhYmxlIHRvIG90aGVyIHByb3ZpZGVyc1xuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJykucHJvdmlkZXIoJyR1cmxNYXRjaGVyRmFjdG9yeScsICRVcmxNYXRjaGVyRmFjdG9yeSk7XG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnV0aWwnKS5ydW4oWyckdXJsTWF0Y2hlckZhY3RvcnknLCBmdW5jdGlvbigkdXJsTWF0Y2hlckZhY3RvcnkpIHsgfV0pO1xuXG4vKipcbiAqIEBuZ2RvYyBvYmplY3RcbiAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyXG4gKiBAcmVxdWlyZXMgJGxvY2F0aW9uUHJvdmlkZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIGAkdXJsUm91dGVyUHJvdmlkZXJgIGhhcyB0aGUgcmVzcG9uc2liaWxpdHkgb2Ygd2F0Y2hpbmcgYCRsb2NhdGlvbmAuIFxuICogV2hlbiBgJGxvY2F0aW9uYCBjaGFuZ2VzIGl0IHJ1bnMgdGhyb3VnaCBhIGxpc3Qgb2YgcnVsZXMgb25lIGJ5IG9uZSB1bnRpbCBhIFxuICogbWF0Y2ggaXMgZm91bmQuIGAkdXJsUm91dGVyUHJvdmlkZXJgIGlzIHVzZWQgYmVoaW5kIHRoZSBzY2VuZXMgYW55dGltZSB5b3Ugc3BlY2lmeSBcbiAqIGEgdXJsIGluIGEgc3RhdGUgY29uZmlndXJhdGlvbi4gQWxsIHVybHMgYXJlIGNvbXBpbGVkIGludG8gYSBVcmxNYXRjaGVyIG9iamVjdC5cbiAqXG4gKiBUaGVyZSBhcmUgc2V2ZXJhbCBtZXRob2RzIG9uIGAkdXJsUm91dGVyUHJvdmlkZXJgIHRoYXQgbWFrZSBpdCB1c2VmdWwgdG8gdXNlIGRpcmVjdGx5XG4gKiBpbiB5b3VyIG1vZHVsZSBjb25maWcuXG4gKi9cbiRVcmxSb3V0ZXJQcm92aWRlci4kaW5qZWN0ID0gWyckbG9jYXRpb25Qcm92aWRlcicsICckdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlciddO1xuZnVuY3Rpb24gJFVybFJvdXRlclByb3ZpZGVyKCAgICRsb2NhdGlvblByb3ZpZGVyLCAgICR1cmxNYXRjaGVyRmFjdG9yeSkge1xuICB2YXIgcnVsZXMgPSBbXSwgb3RoZXJ3aXNlID0gbnVsbCwgaW50ZXJjZXB0RGVmZXJyZWQgPSBmYWxzZSwgbGlzdGVuZXI7XG5cbiAgLy8gUmV0dXJucyBhIHN0cmluZyB0aGF0IGlzIGEgcHJlZml4IG9mIGFsbCBzdHJpbmdzIG1hdGNoaW5nIHRoZSBSZWdFeHBcbiAgZnVuY3Rpb24gcmVnRXhwUHJlZml4KHJlKSB7XG4gICAgdmFyIHByZWZpeCA9IC9eXFxeKCg/OlxcXFxbXmEtekEtWjAtOV18W15cXFxcXFxbXFxdXFxeJCorPy4oKXx7fV0rKSopLy5leGVjKHJlLnNvdXJjZSk7XG4gICAgcmV0dXJuIChwcmVmaXggIT0gbnVsbCkgPyBwcmVmaXhbMV0ucmVwbGFjZSgvXFxcXCguKS9nLCBcIiQxXCIpIDogJyc7XG4gIH1cblxuICAvLyBJbnRlcnBvbGF0ZXMgbWF0Y2hlZCB2YWx1ZXMgaW50byBhIFN0cmluZy5yZXBsYWNlKCktc3R5bGUgcGF0dGVyblxuICBmdW5jdGlvbiBpbnRlcnBvbGF0ZShwYXR0ZXJuLCBtYXRjaCkge1xuICAgIHJldHVybiBwYXR0ZXJuLnJlcGxhY2UoL1xcJChcXCR8XFxkezEsMn0pLywgZnVuY3Rpb24gKG0sIHdoYXQpIHtcbiAgICAgIHJldHVybiBtYXRjaFt3aGF0ID09PSAnJCcgPyAwIDogTnVtYmVyKHdoYXQpXTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXIjcnVsZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIERlZmluZXMgcnVsZXMgdGhhdCBhcmUgdXNlZCBieSBgJHVybFJvdXRlclByb3ZpZGVyYCB0byBmaW5kIG1hdGNoZXMgZm9yXG4gICAqIHNwZWNpZmljIFVSTHMuXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIDxwcmU+XG4gICAqIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXIucm91dGVyJ10pO1xuICAgKlxuICAgKiBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgICogICAvLyBIZXJlJ3MgYW4gZXhhbXBsZSBvZiBob3cgeW91IG1pZ2h0IGFsbG93IGNhc2UgaW5zZW5zaXRpdmUgdXJsc1xuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci5ydWxlKGZ1bmN0aW9uICgkaW5qZWN0b3IsICRsb2NhdGlvbikge1xuICAgKiAgICAgdmFyIHBhdGggPSAkbG9jYXRpb24ucGF0aCgpLFxuICAgKiAgICAgICAgIG5vcm1hbGl6ZWQgPSBwYXRoLnRvTG93ZXJDYXNlKCk7XG4gICAqXG4gICAqICAgICBpZiAocGF0aCAhPT0gbm9ybWFsaXplZCkge1xuICAgKiAgICAgICByZXR1cm4gbm9ybWFsaXplZDtcbiAgICogICAgIH1cbiAgICogICB9KTtcbiAgICogfSk7XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBydWxlIEhhbmRsZXIgZnVuY3Rpb24gdGhhdCB0YWtlcyBgJGluamVjdG9yYCBhbmQgYCRsb2NhdGlvbmBcbiAgICogc2VydmljZXMgYXMgYXJndW1lbnRzLiBZb3UgY2FuIHVzZSB0aGVtIHRvIHJldHVybiBhIHZhbGlkIHBhdGggYXMgYSBzdHJpbmcuXG4gICAqXG4gICAqIEByZXR1cm4ge29iamVjdH0gYCR1cmxSb3V0ZXJQcm92aWRlcmAgLSBgJHVybFJvdXRlclByb3ZpZGVyYCBpbnN0YW5jZVxuICAgKi9cbiAgdGhpcy5ydWxlID0gZnVuY3Rpb24gKHJ1bGUpIHtcbiAgICBpZiAoIWlzRnVuY3Rpb24ocnVsZSkpIHRocm93IG5ldyBFcnJvcihcIidydWxlJyBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgcnVsZXMucHVzaChydWxlKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIG9iamVjdFxuICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlciNvdGhlcndpc2VcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBEZWZpbmVzIGEgcGF0aCB0aGF0IGlzIHVzZWQgd2hlbiBhbiBpbnZhbGlkIHJvdXRlIGlzIHJlcXVlc3RlZC5cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogPHByZT5cbiAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlci5yb3V0ZXInXSk7XG4gICAqXG4gICAqIGFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAgKiAgIC8vIGlmIHRoZSBwYXRoIGRvZXNuJ3QgbWF0Y2ggYW55IG9mIHRoZSB1cmxzIHlvdSBjb25maWd1cmVkXG4gICAqICAgLy8gb3RoZXJ3aXNlIHdpbGwgdGFrZSBjYXJlIG9mIHJvdXRpbmcgdGhlIHVzZXIgdG8gdGhlXG4gICAqICAgLy8gc3BlY2lmaWVkIHVybFxuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9pbmRleCcpO1xuICAgKlxuICAgKiAgIC8vIEV4YW1wbGUgb2YgdXNpbmcgZnVuY3Rpb24gcnVsZSBhcyBwYXJhbVxuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoZnVuY3Rpb24gKCRpbmplY3RvciwgJGxvY2F0aW9uKSB7XG4gICAqICAgICByZXR1cm4gJy9hL3ZhbGlkL3VybCc7XG4gICAqICAgfSk7XG4gICAqIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb259IHJ1bGUgVGhlIHVybCBwYXRoIHlvdSB3YW50IHRvIHJlZGlyZWN0IHRvIG9yIGEgZnVuY3Rpb24gXG4gICAqIHJ1bGUgdGhhdCByZXR1cm5zIHRoZSB1cmwgcGF0aC4gVGhlIGZ1bmN0aW9uIHZlcnNpb24gaXMgcGFzc2VkIHR3byBwYXJhbXM6IFxuICAgKiBgJGluamVjdG9yYCBhbmQgYCRsb2NhdGlvbmAgc2VydmljZXMsIGFuZCBtdXN0IHJldHVybiBhIHVybCBzdHJpbmcuXG4gICAqXG4gICAqIEByZXR1cm4ge29iamVjdH0gYCR1cmxSb3V0ZXJQcm92aWRlcmAgLSBgJHVybFJvdXRlclByb3ZpZGVyYCBpbnN0YW5jZVxuICAgKi9cbiAgdGhpcy5vdGhlcndpc2UgPSBmdW5jdGlvbiAocnVsZSkge1xuICAgIGlmIChpc1N0cmluZyhydWxlKSkge1xuICAgICAgdmFyIHJlZGlyZWN0ID0gcnVsZTtcbiAgICAgIHJ1bGUgPSBmdW5jdGlvbiAoKSB7IHJldHVybiByZWRpcmVjdDsgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoIWlzRnVuY3Rpb24ocnVsZSkpIHRocm93IG5ldyBFcnJvcihcIidydWxlJyBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgb3RoZXJ3aXNlID0gcnVsZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGhhbmRsZUlmTWF0Y2goJGluamVjdG9yLCBoYW5kbGVyLCBtYXRjaCkge1xuICAgIGlmICghbWF0Y2gpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgcmVzdWx0ID0gJGluamVjdG9yLmludm9rZShoYW5kbGVyLCBoYW5kbGVyLCB7ICRtYXRjaDogbWF0Y2ggfSk7XG4gICAgcmV0dXJuIGlzRGVmaW5lZChyZXN1bHQpID8gcmVzdWx0IDogdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXIjd2hlblxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXJcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIFJlZ2lzdGVycyBhIGhhbmRsZXIgZm9yIGEgZ2l2ZW4gdXJsIG1hdGNoaW5nLiBcbiAgICogXG4gICAqIElmIHRoZSBoYW5kbGVyIGlzIGEgc3RyaW5nLCBpdCBpc1xuICAgKiB0cmVhdGVkIGFzIGEgcmVkaXJlY3QsIGFuZCBpcyBpbnRlcnBvbGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBzeW50YXggb2YgbWF0Y2hcbiAgICogKGkuZS4gbGlrZSBgU3RyaW5nLnJlcGxhY2UoKWAgZm9yIGBSZWdFeHBgLCBvciBsaWtlIGEgYFVybE1hdGNoZXJgIHBhdHRlcm4gb3RoZXJ3aXNlKS5cbiAgICpcbiAgICogSWYgdGhlIGhhbmRsZXIgaXMgYSBmdW5jdGlvbiwgaXQgaXMgaW5qZWN0YWJsZS4gSXQgZ2V0cyBpbnZva2VkIGlmIGAkbG9jYXRpb25gXG4gICAqIG1hdGNoZXMuIFlvdSBoYXZlIHRoZSBvcHRpb24gb2YgaW5qZWN0IHRoZSBtYXRjaCBvYmplY3QgYXMgYCRtYXRjaGAuXG4gICAqXG4gICAqIFRoZSBoYW5kbGVyIGNhbiByZXR1cm5cbiAgICpcbiAgICogLSAqKmZhbHN5KiogdG8gaW5kaWNhdGUgdGhhdCB0aGUgcnVsZSBkaWRuJ3QgbWF0Y2ggYWZ0ZXIgYWxsLCB0aGVuIGAkdXJsUm91dGVyYFxuICAgKiAgIHdpbGwgY29udGludWUgdHJ5aW5nIHRvIGZpbmQgYW5vdGhlciBvbmUgdGhhdCBtYXRjaGVzLlxuICAgKiAtICoqc3RyaW5nKiogd2hpY2ggaXMgdHJlYXRlZCBhcyBhIHJlZGlyZWN0IGFuZCBwYXNzZWQgdG8gYCRsb2NhdGlvbi51cmwoKWBcbiAgICogLSAqKnZvaWQqKiBvciBhbnkgKip0cnV0aHkqKiB2YWx1ZSB0ZWxscyBgJHVybFJvdXRlcmAgdGhhdCB0aGUgdXJsIHdhcyBoYW5kbGVkLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiA8cHJlPlxuICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyLnJvdXRlciddKTtcbiAgICpcbiAgICogYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAqICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oJHN0YXRlLnVybCwgZnVuY3Rpb24gKCRtYXRjaCwgJHN0YXRlUGFyYW1zKSB7XG4gICAqICAgICBpZiAoJHN0YXRlLiRjdXJyZW50Lm5hdmlnYWJsZSAhPT0gc3RhdGUgfHxcbiAgICogICAgICAgICAhZXF1YWxGb3JLZXlzKCRtYXRjaCwgJHN0YXRlUGFyYW1zKSB7XG4gICAqICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbyhzdGF0ZSwgJG1hdGNoLCBmYWxzZSk7XG4gICAqICAgICB9XG4gICAqICAgfSk7XG4gICAqIH0pO1xuICAgKiA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSB3aGF0IFRoZSBpbmNvbWluZyBwYXRoIHRoYXQgeW91IHdhbnQgdG8gcmVkaXJlY3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9ufSBoYW5kbGVyIFRoZSBwYXRoIHlvdSB3YW50IHRvIHJlZGlyZWN0IHlvdXIgdXNlciB0by5cbiAgICovXG4gIHRoaXMud2hlbiA9IGZ1bmN0aW9uICh3aGF0LCBoYW5kbGVyKSB7XG4gICAgdmFyIHJlZGlyZWN0LCBoYW5kbGVySXNTdHJpbmcgPSBpc1N0cmluZyhoYW5kbGVyKTtcbiAgICBpZiAoaXNTdHJpbmcod2hhdCkpIHdoYXQgPSAkdXJsTWF0Y2hlckZhY3RvcnkuY29tcGlsZSh3aGF0KTtcblxuICAgIGlmICghaGFuZGxlcklzU3RyaW5nICYmICFpc0Z1bmN0aW9uKGhhbmRsZXIpICYmICFpc0FycmF5KGhhbmRsZXIpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCAnaGFuZGxlcicgaW4gd2hlbigpXCIpO1xuXG4gICAgdmFyIHN0cmF0ZWdpZXMgPSB7XG4gICAgICBtYXRjaGVyOiBmdW5jdGlvbiAod2hhdCwgaGFuZGxlcikge1xuICAgICAgICBpZiAoaGFuZGxlcklzU3RyaW5nKSB7XG4gICAgICAgICAgcmVkaXJlY3QgPSAkdXJsTWF0Y2hlckZhY3RvcnkuY29tcGlsZShoYW5kbGVyKTtcbiAgICAgICAgICBoYW5kbGVyID0gWyckbWF0Y2gnLCBmdW5jdGlvbiAoJG1hdGNoKSB7IHJldHVybiByZWRpcmVjdC5mb3JtYXQoJG1hdGNoKTsgfV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4dGVuZChmdW5jdGlvbiAoJGluamVjdG9yLCAkbG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gaGFuZGxlSWZNYXRjaCgkaW5qZWN0b3IsIGhhbmRsZXIsIHdoYXQuZXhlYygkbG9jYXRpb24ucGF0aCgpLCAkbG9jYXRpb24uc2VhcmNoKCkpKTtcbiAgICAgICAgfSwge1xuICAgICAgICAgIHByZWZpeDogaXNTdHJpbmcod2hhdC5wcmVmaXgpID8gd2hhdC5wcmVmaXggOiAnJ1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICByZWdleDogZnVuY3Rpb24gKHdoYXQsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKHdoYXQuZ2xvYmFsIHx8IHdoYXQuc3RpY2t5KSB0aHJvdyBuZXcgRXJyb3IoXCJ3aGVuKCkgUmVnRXhwIG11c3Qgbm90IGJlIGdsb2JhbCBvciBzdGlja3lcIik7XG5cbiAgICAgICAgaWYgKGhhbmRsZXJJc1N0cmluZykge1xuICAgICAgICAgIHJlZGlyZWN0ID0gaGFuZGxlcjtcbiAgICAgICAgICBoYW5kbGVyID0gWyckbWF0Y2gnLCBmdW5jdGlvbiAoJG1hdGNoKSB7IHJldHVybiBpbnRlcnBvbGF0ZShyZWRpcmVjdCwgJG1hdGNoKTsgfV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV4dGVuZChmdW5jdGlvbiAoJGluamVjdG9yLCAkbG9jYXRpb24pIHtcbiAgICAgICAgICByZXR1cm4gaGFuZGxlSWZNYXRjaCgkaW5qZWN0b3IsIGhhbmRsZXIsIHdoYXQuZXhlYygkbG9jYXRpb24ucGF0aCgpKSk7XG4gICAgICAgIH0sIHtcbiAgICAgICAgICBwcmVmaXg6IHJlZ0V4cFByZWZpeCh3aGF0KVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNoZWNrID0geyBtYXRjaGVyOiAkdXJsTWF0Y2hlckZhY3RvcnkuaXNNYXRjaGVyKHdoYXQpLCByZWdleDogd2hhdCBpbnN0YW5jZW9mIFJlZ0V4cCB9O1xuXG4gICAgZm9yICh2YXIgbiBpbiBjaGVjaykge1xuICAgICAgaWYgKGNoZWNrW25dKSByZXR1cm4gdGhpcy5ydWxlKHN0cmF0ZWdpZXNbbl0od2hhdCwgaGFuZGxlcikpO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgJ3doYXQnIGluIHdoZW4oKVwiKTtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyI2RlZmVySW50ZXJjZXB0XG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogRGlzYWJsZXMgKG9yIGVuYWJsZXMpIGRlZmVycmluZyBsb2NhdGlvbiBjaGFuZ2UgaW50ZXJjZXB0aW9uLlxuICAgKlxuICAgKiBJZiB5b3Ugd2lzaCB0byBjdXN0b21pemUgdGhlIGJlaGF2aW9yIG9mIHN5bmNpbmcgdGhlIFVSTCAoZm9yIGV4YW1wbGUsIGlmIHlvdSB3aXNoIHRvXG4gICAqIGRlZmVyIGEgdHJhbnNpdGlvbiBidXQgbWFpbnRhaW4gdGhlIGN1cnJlbnQgVVJMKSwgY2FsbCB0aGlzIG1ldGhvZCBhdCBjb25maWd1cmF0aW9uIHRpbWUuXG4gICAqIFRoZW4sIGF0IHJ1biB0aW1lLCBjYWxsIGAkdXJsUm91dGVyLmxpc3RlbigpYCBhZnRlciB5b3UgaGF2ZSBjb25maWd1cmVkIHlvdXIgb3duXG4gICAqIGAkbG9jYXRpb25DaGFuZ2VTdWNjZXNzYCBldmVudCBoYW5kbGVyLlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiA8cHJlPlxuICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyLnJvdXRlciddKTtcbiAgICpcbiAgICogYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gICAqXG4gICAqICAgLy8gUHJldmVudCAkdXJsUm91dGVyIGZyb20gYXV0b21hdGljYWxseSBpbnRlcmNlcHRpbmcgVVJMIGNoYW5nZXM7XG4gICAqICAgLy8gdGhpcyBhbGxvd3MgeW91IHRvIGNvbmZpZ3VyZSBjdXN0b20gYmVoYXZpb3IgaW4gYmV0d2VlblxuICAgKiAgIC8vIGxvY2F0aW9uIGNoYW5nZXMgYW5kIHJvdXRlIHN5bmNocm9uaXphdGlvbjpcbiAgICogICAkdXJsUm91dGVyUHJvdmlkZXIuZGVmZXJJbnRlcmNlcHQoKTtcbiAgICpcbiAgICogfSkucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkdXJsUm91dGVyLCBVc2VyU2VydmljZSkge1xuICAgKlxuICAgKiAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24oZSkge1xuICAgKiAgICAgLy8gVXNlclNlcnZpY2UgaXMgYW4gZXhhbXBsZSBzZXJ2aWNlIGZvciBtYW5hZ2luZyB1c2VyIHN0YXRlXG4gICAqICAgICBpZiAoVXNlclNlcnZpY2UuaXNMb2dnZWRJbigpKSByZXR1cm47XG4gICAqXG4gICAqICAgICAvLyBQcmV2ZW50ICR1cmxSb3V0ZXIncyBkZWZhdWx0IGhhbmRsZXIgZnJvbSBmaXJpbmdcbiAgICogICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICpcbiAgICogICAgIFVzZXJTZXJ2aWNlLmhhbmRsZUxvZ2luKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICogICAgICAgLy8gT25jZSB0aGUgdXNlciBoYXMgbG9nZ2VkIGluLCBzeW5jIHRoZSBjdXJyZW50IFVSTFxuICAgKiAgICAgICAvLyB0byB0aGUgcm91dGVyOlxuICAgKiAgICAgICAkdXJsUm91dGVyLnN5bmMoKTtcbiAgICogICAgIH0pO1xuICAgKiAgIH0pO1xuICAgKlxuICAgKiAgIC8vIENvbmZpZ3VyZXMgJHVybFJvdXRlcidzIGxpc3RlbmVyICphZnRlciogeW91ciBjdXN0b20gbGlzdGVuZXJcbiAgICogICAkdXJsUm91dGVyLmxpc3RlbigpO1xuICAgKiB9KTtcbiAgICogPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVmZXIgSW5kaWNhdGVzIHdoZXRoZXIgdG8gZGVmZXIgbG9jYXRpb24gY2hhbmdlIGludGVyY2VwdGlvbi4gUGFzc2luZ1xuICAgICAgICAgICAgbm8gcGFyYW1ldGVyIGlzIGVxdWl2YWxlbnQgdG8gYHRydWVgLlxuICAgKi9cbiAgdGhpcy5kZWZlckludGVyY2VwdCA9IGZ1bmN0aW9uIChkZWZlcikge1xuICAgIGlmIChkZWZlciA9PT0gdW5kZWZpbmVkKSBkZWZlciA9IHRydWU7XG4gICAgaW50ZXJjZXB0RGVmZXJyZWQgPSBkZWZlcjtcbiAgfTtcblxuICAvKipcbiAgICogQG5nZG9jIG9iamVjdFxuICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJcbiAgICpcbiAgICogQHJlcXVpcmVzICRsb2NhdGlvblxuICAgKiBAcmVxdWlyZXMgJHJvb3RTY29wZVxuICAgKiBAcmVxdWlyZXMgJGluamVjdG9yXG4gICAqIEByZXF1aXJlcyAkYnJvd3NlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICpcbiAgICovXG4gIHRoaXMuJGdldCA9ICRnZXQ7XG4gICRnZXQuJGluamVjdCA9IFsnJGxvY2F0aW9uJywgJyRyb290U2NvcGUnLCAnJGluamVjdG9yJywgJyRicm93c2VyJywgJyRzbmlmZmVyJ107XG4gIGZ1bmN0aW9uICRnZXQoICAgJGxvY2F0aW9uLCAgICRyb290U2NvcGUsICAgJGluamVjdG9yLCAgICRicm93c2VyLCAgICRzbmlmZmVyKSB7XG5cbiAgICB2YXIgYmFzZUhyZWYgPSAkYnJvd3Nlci5iYXNlSHJlZigpLCBsb2NhdGlvbiA9ICRsb2NhdGlvbi51cmwoKSwgbGFzdFB1c2hlZFVybDtcblxuICAgIGZ1bmN0aW9uIGFwcGVuZEJhc2VQYXRoKHVybCwgaXNIdG1sNSwgYWJzb2x1dGUpIHtcbiAgICAgIGlmIChiYXNlSHJlZiA9PT0gJy8nKSByZXR1cm4gdXJsO1xuICAgICAgaWYgKGlzSHRtbDUpIHJldHVybiBiYXNlSHJlZi5zbGljZSgwLCAtMSkgKyB1cmw7XG4gICAgICBpZiAoYWJzb2x1dGUpIHJldHVybiBiYXNlSHJlZi5zbGljZSgxKSArIHVybDtcbiAgICAgIHJldHVybiB1cmw7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogT3B0aW1pemUgZ3JvdXBzIG9mIHJ1bGVzIHdpdGggbm9uLWVtcHR5IHByZWZpeCBpbnRvIHNvbWUgc29ydCBvZiBkZWNpc2lvbiB0cmVlXG4gICAgZnVuY3Rpb24gdXBkYXRlKGV2dCkge1xuICAgICAgaWYgKGV2dCAmJiBldnQuZGVmYXVsdFByZXZlbnRlZCkgcmV0dXJuO1xuICAgICAgdmFyIGlnbm9yZVVwZGF0ZSA9IGxhc3RQdXNoZWRVcmwgJiYgJGxvY2F0aW9uLnVybCgpID09PSBsYXN0UHVzaGVkVXJsO1xuICAgICAgbGFzdFB1c2hlZFVybCA9IHVuZGVmaW5lZDtcbiAgICAgIC8vIFRPRE86IFJlLWltcGxlbWVudCB0aGlzIGluIDEuMCBmb3IgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXItdWkvdWktcm91dGVyL2lzc3Vlcy8xNTczXG4gICAgICAvL2lmIChpZ25vcmVVcGRhdGUpIHJldHVybiB0cnVlO1xuXG4gICAgICBmdW5jdGlvbiBjaGVjayhydWxlKSB7XG4gICAgICAgIHZhciBoYW5kbGVkID0gcnVsZSgkaW5qZWN0b3IsICRsb2NhdGlvbik7XG5cbiAgICAgICAgaWYgKCFoYW5kbGVkKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChpc1N0cmluZyhoYW5kbGVkKSkgJGxvY2F0aW9uLnJlcGxhY2UoKS51cmwoaGFuZGxlZCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgdmFyIG4gPSBydWxlcy5sZW5ndGgsIGk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaWYgKGNoZWNrKHJ1bGVzW2ldKSkgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gYWx3YXlzIGNoZWNrIG90aGVyd2lzZSBsYXN0IHRvIGFsbG93IGR5bmFtaWMgdXBkYXRlcyB0byB0aGUgc2V0IG9mIHJ1bGVzXG4gICAgICBpZiAob3RoZXJ3aXNlKSBjaGVjayhvdGhlcndpc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpc3RlbigpIHtcbiAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXIgfHwgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCB1cGRhdGUpO1xuICAgICAgcmV0dXJuIGxpc3RlbmVyO1xuICAgIH1cblxuICAgIGlmICghaW50ZXJjZXB0RGVmZXJyZWQpIGxpc3RlbigpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXIjc3luY1xuICAgICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogVHJpZ2dlcnMgYW4gdXBkYXRlOyB0aGUgc2FtZSB1cGRhdGUgdGhhdCBoYXBwZW5zIHdoZW4gdGhlIGFkZHJlc3MgYmFyIHVybCBjaGFuZ2VzLCBha2EgYCRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3NgLlxuICAgICAgICogVGhpcyBtZXRob2QgaXMgdXNlZnVsIHdoZW4geW91IG5lZWQgdG8gdXNlIGBwcmV2ZW50RGVmYXVsdCgpYCBvbiB0aGUgYCRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3NgIGV2ZW50LFxuICAgICAgICogcGVyZm9ybSBzb21lIGN1c3RvbSBsb2dpYyAocm91dGUgcHJvdGVjdGlvbiwgYXV0aCwgY29uZmlnLCByZWRpcmVjdGlvbiwgZXRjKSBhbmQgdGhlbiBmaW5hbGx5IHByb2NlZWRcbiAgICAgICAqIHdpdGggdGhlIHRyYW5zaXRpb24gYnkgY2FsbGluZyBgJHVybFJvdXRlci5zeW5jKClgLlxuICAgICAgICpcbiAgICAgICAqIEBleGFtcGxlXG4gICAgICAgKiA8cHJlPlxuICAgICAgICogYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJ10pXG4gICAgICAgKiAgIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSwgJHVybFJvdXRlcikge1xuICAgICAgICogICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgICAgKiAgICAgICAvLyBIYWx0IHN0YXRlIGNoYW5nZSBmcm9tIGV2ZW4gc3RhcnRpbmdcbiAgICAgICAqICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICogICAgICAgLy8gUGVyZm9ybSBjdXN0b20gbG9naWNcbiAgICAgICAqICAgICAgIHZhciBtZWV0c1JlcXVpcmVtZW50ID0gLi4uXG4gICAgICAgKiAgICAgICAvLyBDb250aW51ZSB3aXRoIHRoZSB1cGRhdGUgYW5kIHN0YXRlIHRyYW5zaXRpb24gaWYgbG9naWMgYWxsb3dzXG4gICAgICAgKiAgICAgICBpZiAobWVldHNSZXF1aXJlbWVudCkgJHVybFJvdXRlci5zeW5jKCk7XG4gICAgICAgKiAgICAgfSk7XG4gICAgICAgKiB9KTtcbiAgICAgICAqIDwvcHJlPlxuICAgICAgICovXG4gICAgICBzeW5jOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICB9LFxuXG4gICAgICBsaXN0ZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gbGlzdGVuKCk7XG4gICAgICB9LFxuXG4gICAgICB1cGRhdGU6IGZ1bmN0aW9uKHJlYWQpIHtcbiAgICAgICAgaWYgKHJlYWQpIHtcbiAgICAgICAgICBsb2NhdGlvbiA9ICRsb2NhdGlvbi51cmwoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRsb2NhdGlvbi51cmwoKSA9PT0gbG9jYXRpb24pIHJldHVybjtcblxuICAgICAgICAkbG9jYXRpb24udXJsKGxvY2F0aW9uKTtcbiAgICAgICAgJGxvY2F0aW9uLnJlcGxhY2UoKTtcbiAgICAgIH0sXG5cbiAgICAgIHB1c2g6IGZ1bmN0aW9uKHVybE1hdGNoZXIsIHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgICAgdmFyIHVybCA9IHVybE1hdGNoZXIuZm9ybWF0KHBhcmFtcyB8fCB7fSk7XG5cbiAgICAgICAgLy8gSGFuZGxlIHRoZSBzcGVjaWFsIGhhc2ggcGFyYW0sIGlmIG5lZWRlZFxuICAgICAgICBpZiAodXJsICE9PSBudWxsICYmIHBhcmFtcyAmJiBwYXJhbXNbJyMnXSkge1xuICAgICAgICAgICAgdXJsICs9ICcjJyArIHBhcmFtc1snIyddO1xuICAgICAgICB9XG5cbiAgICAgICAgJGxvY2F0aW9uLnVybCh1cmwpO1xuICAgICAgICBsYXN0UHVzaGVkVXJsID0gb3B0aW9ucyAmJiBvcHRpb25zLiQkYXZvaWRSZXN5bmMgPyAkbG9jYXRpb24udXJsKCkgOiB1bmRlZmluZWQ7XG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMucmVwbGFjZSkgJGxvY2F0aW9uLnJlcGxhY2UoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXIjaHJlZlxuICAgICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclxuICAgICAgICpcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogQSBVUkwgZ2VuZXJhdGlvbiBtZXRob2QgdGhhdCByZXR1cm5zIHRoZSBjb21waWxlZCBVUkwgZm9yIGEgZ2l2ZW5cbiAgICAgICAqIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfSwgcG9wdWxhdGVkIHdpdGggdGhlIHByb3ZpZGVkIHBhcmFtZXRlcnMuXG4gICAgICAgKlxuICAgICAgICogQGV4YW1wbGVcbiAgICAgICAqIDxwcmU+XG4gICAgICAgKiAkYm9iID0gJHVybFJvdXRlci5ocmVmKG5ldyBVcmxNYXRjaGVyKFwiL2Fib3V0LzpwZXJzb25cIiksIHtcbiAgICAgICAqICAgcGVyc29uOiBcImJvYlwiXG4gICAgICAgKiB9KTtcbiAgICAgICAqIC8vICRib2IgPT0gXCIvYWJvdXQvYm9iXCI7XG4gICAgICAgKiA8L3ByZT5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ge1VybE1hdGNoZXJ9IHVybE1hdGNoZXIgVGhlIGBVcmxNYXRjaGVyYCBvYmplY3Qgd2hpY2ggaXMgdXNlZCBhcyB0aGUgdGVtcGxhdGUgb2YgdGhlIFVSTCB0byBnZW5lcmF0ZS5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gcGFyYW1zIEFuIG9iamVjdCBvZiBwYXJhbWV0ZXIgdmFsdWVzIHRvIGZpbGwgdGhlIG1hdGNoZXIncyByZXF1aXJlZCBwYXJhbWV0ZXJzLlxuICAgICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICAgKlxuICAgICAgICogLSAqKmBhYnNvbHV0ZWAqKiAtIHtib29sZWFuPWZhbHNlfSwgIElmIHRydWUgd2lsbCBnZW5lcmF0ZSBhbiBhYnNvbHV0ZSB1cmwsIGUuZy4gXCJodHRwOi8vd3d3LmV4YW1wbGUuY29tL2Z1bGx1cmxcIi5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBmdWxseSBjb21waWxlZCBVUkwsIG9yIGBudWxsYCBpZiBgcGFyYW1zYCBmYWlsIHZhbGlkYXRpb24gYWdhaW5zdCBgdXJsTWF0Y2hlcmBcbiAgICAgICAqL1xuICAgICAgaHJlZjogZnVuY3Rpb24odXJsTWF0Y2hlciwgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICAgIGlmICghdXJsTWF0Y2hlci52YWxpZGF0ZXMocGFyYW1zKSkgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgdmFyIGlzSHRtbDUgPSAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoKTtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoaXNIdG1sNSkpIHtcbiAgICAgICAgICBpc0h0bWw1ID0gaXNIdG1sNS5lbmFibGVkO1xuICAgICAgICB9XG5cbiAgICAgICAgaXNIdG1sNSA9IGlzSHRtbDUgJiYgJHNuaWZmZXIuaGlzdG9yeTtcbiAgICAgICAgXG4gICAgICAgIHZhciB1cmwgPSB1cmxNYXRjaGVyLmZvcm1hdChwYXJhbXMpO1xuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgICAgICBpZiAoIWlzSHRtbDUgJiYgdXJsICE9PSBudWxsKSB7XG4gICAgICAgICAgdXJsID0gXCIjXCIgKyAkbG9jYXRpb25Qcm92aWRlci5oYXNoUHJlZml4KCkgKyB1cmw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBIYW5kbGUgc3BlY2lhbCBoYXNoIHBhcmFtLCBpZiBuZWVkZWRcbiAgICAgICAgaWYgKHVybCAhPT0gbnVsbCAmJiBwYXJhbXMgJiYgcGFyYW1zWycjJ10pIHtcbiAgICAgICAgICB1cmwgKz0gJyMnICsgcGFyYW1zWycjJ107XG4gICAgICAgIH1cblxuICAgICAgICB1cmwgPSBhcHBlbmRCYXNlUGF0aCh1cmwsIGlzSHRtbDUsIG9wdGlvbnMuYWJzb2x1dGUpO1xuXG4gICAgICAgIGlmICghb3B0aW9ucy5hYnNvbHV0ZSB8fCAhdXJsKSB7XG4gICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzbGFzaCA9ICghaXNIdG1sNSAmJiB1cmwgPyAnLycgOiAnJyksIHBvcnQgPSAkbG9jYXRpb24ucG9ydCgpO1xuICAgICAgICBwb3J0ID0gKHBvcnQgPT09IDgwIHx8IHBvcnQgPT09IDQ0MyA/ICcnIDogJzonICsgcG9ydCk7XG5cbiAgICAgICAgcmV0dXJuIFskbG9jYXRpb24ucHJvdG9jb2woKSwgJzovLycsICRsb2NhdGlvbi5ob3N0KCksIHBvcnQsIHNsYXNoLCB1cmxdLmpvaW4oJycpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbn1cblxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5yb3V0ZXInKS5wcm92aWRlcignJHVybFJvdXRlcicsICRVcmxSb3V0ZXJQcm92aWRlcik7XG5cbi8qKlxuICogQG5nZG9jIG9iamVjdFxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBuZXcgYCRzdGF0ZVByb3ZpZGVyYCB3b3JrcyBzaW1pbGFyIHRvIEFuZ3VsYXIncyB2MSByb3V0ZXIsIGJ1dCBpdCBmb2N1c2VzIHB1cmVseVxuICogb24gc3RhdGUuXG4gKlxuICogQSBzdGF0ZSBjb3JyZXNwb25kcyB0byBhIFwicGxhY2VcIiBpbiB0aGUgYXBwbGljYXRpb24gaW4gdGVybXMgb2YgdGhlIG92ZXJhbGwgVUkgYW5kXG4gKiBuYXZpZ2F0aW9uLiBBIHN0YXRlIGRlc2NyaWJlcyAodmlhIHRoZSBjb250cm9sbGVyIC8gdGVtcGxhdGUgLyB2aWV3IHByb3BlcnRpZXMpIHdoYXRcbiAqIHRoZSBVSSBsb29rcyBsaWtlIGFuZCBkb2VzIGF0IHRoYXQgcGxhY2UuXG4gKlxuICogU3RhdGVzIG9mdGVuIGhhdmUgdGhpbmdzIGluIGNvbW1vbiwgYW5kIHRoZSBwcmltYXJ5IHdheSBvZiBmYWN0b3Jpbmcgb3V0IHRoZXNlXG4gKiBjb21tb25hbGl0aWVzIGluIHRoaXMgbW9kZWwgaXMgdmlhIHRoZSBzdGF0ZSBoaWVyYXJjaHksIGkuZS4gcGFyZW50L2NoaWxkIHN0YXRlcyBha2FcbiAqIG5lc3RlZCBzdGF0ZXMuXG4gKlxuICogVGhlIGAkc3RhdGVQcm92aWRlcmAgcHJvdmlkZXMgaW50ZXJmYWNlcyB0byBkZWNsYXJlIHRoZXNlIHN0YXRlcyBmb3IgeW91ciBhcHAuXG4gKi9cbiRTdGF0ZVByb3ZpZGVyLiRpbmplY3QgPSBbJyR1cmxSb3V0ZXJQcm92aWRlcicsICckdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlciddO1xuZnVuY3Rpb24gJFN0YXRlUHJvdmlkZXIoICAgJHVybFJvdXRlclByb3ZpZGVyLCAgICR1cmxNYXRjaGVyRmFjdG9yeSkge1xuXG4gIHZhciByb290LCBzdGF0ZXMgPSB7fSwgJHN0YXRlLCBxdWV1ZSA9IHt9LCBhYnN0cmFjdEtleSA9ICdhYnN0cmFjdCc7XG5cbiAgLy8gQnVpbGRzIHN0YXRlIHByb3BlcnRpZXMgZnJvbSBkZWZpbml0aW9uIHBhc3NlZCB0byByZWdpc3RlclN0YXRlKClcbiAgdmFyIHN0YXRlQnVpbGRlciA9IHtcblxuICAgIC8vIERlcml2ZSBwYXJlbnQgc3RhdGUgZnJvbSBhIGhpZXJhcmNoaWNhbCBuYW1lIG9ubHkgaWYgJ3BhcmVudCcgaXMgbm90IGV4cGxpY2l0bHkgZGVmaW5lZC5cbiAgICAvLyBzdGF0ZS5jaGlsZHJlbiA9IFtdO1xuICAgIC8vIGlmIChwYXJlbnQpIHBhcmVudC5jaGlsZHJlbi5wdXNoKHN0YXRlKTtcbiAgICBwYXJlbnQ6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICBpZiAoaXNEZWZpbmVkKHN0YXRlLnBhcmVudCkgJiYgc3RhdGUucGFyZW50KSByZXR1cm4gZmluZFN0YXRlKHN0YXRlLnBhcmVudCk7XG4gICAgICAvLyByZWdleCBtYXRjaGVzIGFueSB2YWxpZCBjb21wb3NpdGUgc3RhdGUgbmFtZVxuICAgICAgLy8gd291bGQgbWF0Y2ggXCJjb250YWN0Lmxpc3RcIiBidXQgbm90IFwiY29udGFjdHNcIlxuICAgICAgdmFyIGNvbXBvc2l0ZU5hbWUgPSAvXiguKylcXC5bXi5dKyQvLmV4ZWMoc3RhdGUubmFtZSk7XG4gICAgICByZXR1cm4gY29tcG9zaXRlTmFtZSA/IGZpbmRTdGF0ZShjb21wb3NpdGVOYW1lWzFdKSA6IHJvb3Q7XG4gICAgfSxcblxuICAgIC8vIGluaGVyaXQgJ2RhdGEnIGZyb20gcGFyZW50IGFuZCBvdmVycmlkZSBieSBvd24gdmFsdWVzIChpZiBhbnkpXG4gICAgZGF0YTogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIGlmIChzdGF0ZS5wYXJlbnQgJiYgc3RhdGUucGFyZW50LmRhdGEpIHtcbiAgICAgICAgc3RhdGUuZGF0YSA9IHN0YXRlLnNlbGYuZGF0YSA9IGluaGVyaXQoc3RhdGUucGFyZW50LmRhdGEsIHN0YXRlLmRhdGEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0YXRlLmRhdGE7XG4gICAgfSxcblxuICAgIC8vIEJ1aWxkIGEgVVJMTWF0Y2hlciBpZiBuZWNlc3NhcnksIGVpdGhlciB2aWEgYSByZWxhdGl2ZSBvciBhYnNvbHV0ZSBVUkxcbiAgICB1cmw6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICB2YXIgdXJsID0gc3RhdGUudXJsLCBjb25maWcgPSB7IHBhcmFtczogc3RhdGUucGFyYW1zIHx8IHt9IH07XG5cbiAgICAgIGlmIChpc1N0cmluZyh1cmwpKSB7XG4gICAgICAgIGlmICh1cmwuY2hhckF0KDApID09ICdeJykgcmV0dXJuICR1cmxNYXRjaGVyRmFjdG9yeS5jb21waWxlKHVybC5zdWJzdHJpbmcoMSksIGNvbmZpZyk7XG4gICAgICAgIHJldHVybiAoc3RhdGUucGFyZW50Lm5hdmlnYWJsZSB8fCByb290KS51cmwuY29uY2F0KHVybCwgY29uZmlnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCF1cmwgfHwgJHVybE1hdGNoZXJGYWN0b3J5LmlzTWF0Y2hlcih1cmwpKSByZXR1cm4gdXJsO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCB1cmwgJ1wiICsgdXJsICsgXCInIGluIHN0YXRlICdcIiArIHN0YXRlICsgXCInXCIpO1xuICAgIH0sXG5cbiAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBjbG9zZXN0IGFuY2VzdG9yIHN0YXRlIHRoYXQgaGFzIGEgVVJMIChpLmUuIGlzIG5hdmlnYWJsZSlcbiAgICBuYXZpZ2FibGU6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUudXJsID8gc3RhdGUgOiAoc3RhdGUucGFyZW50ID8gc3RhdGUucGFyZW50Lm5hdmlnYWJsZSA6IG51bGwpO1xuICAgIH0sXG5cbiAgICAvLyBPd24gcGFyYW1ldGVycyBmb3IgdGhpcyBzdGF0ZS4gc3RhdGUudXJsLnBhcmFtcyBpcyBhbHJlYWR5IGJ1aWx0IGF0IHRoaXMgcG9pbnQuIENyZWF0ZSBhbmQgYWRkIG5vbi11cmwgcGFyYW1zXG4gICAgb3duUGFyYW1zOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdmFyIHBhcmFtcyA9IHN0YXRlLnVybCAmJiBzdGF0ZS51cmwucGFyYW1zIHx8IG5ldyAkJFVNRlAuUGFyYW1TZXQoKTtcbiAgICAgIGZvckVhY2goc3RhdGUucGFyYW1zIHx8IHt9LCBmdW5jdGlvbihjb25maWcsIGlkKSB7XG4gICAgICAgIGlmICghcGFyYW1zW2lkXSkgcGFyYW1zW2lkXSA9IG5ldyAkJFVNRlAuUGFyYW0oaWQsIG51bGwsIGNvbmZpZywgXCJjb25maWdcIik7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfSxcblxuICAgIC8vIERlcml2ZSBwYXJhbWV0ZXJzIGZvciB0aGlzIHN0YXRlIGFuZCBlbnN1cmUgdGhleSdyZSBhIHN1cGVyLXNldCBvZiBwYXJlbnQncyBwYXJhbWV0ZXJzXG4gICAgcGFyYW1zOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdmFyIG93blBhcmFtcyA9IHBpY2soc3RhdGUub3duUGFyYW1zLCBzdGF0ZS5vd25QYXJhbXMuJCRrZXlzKCkpO1xuICAgICAgcmV0dXJuIHN0YXRlLnBhcmVudCAmJiBzdGF0ZS5wYXJlbnQucGFyYW1zID8gZXh0ZW5kKHN0YXRlLnBhcmVudC5wYXJhbXMuJCRuZXcoKSwgb3duUGFyYW1zKSA6IG5ldyAkJFVNRlAuUGFyYW1TZXQoKTtcbiAgICB9LFxuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gZXhwbGljaXQgbXVsdGktdmlldyBjb25maWd1cmF0aW9uLCBtYWtlIG9uZSB1cCBzbyB3ZSBkb24ndCBoYXZlXG4gICAgLy8gdG8gaGFuZGxlIGJvdGggY2FzZXMgaW4gdGhlIHZpZXcgZGlyZWN0aXZlIGxhdGVyLiBOb3RlIHRoYXQgaGF2aW5nIGFuIGV4cGxpY2l0XG4gICAgLy8gJ3ZpZXdzJyBwcm9wZXJ0eSB3aWxsIG1lYW4gdGhlIGRlZmF1bHQgdW5uYW1lZCB2aWV3IHByb3BlcnRpZXMgYXJlIGlnbm9yZWQuIFRoaXNcbiAgICAvLyBpcyBhbHNvIGEgZ29vZCB0aW1lIHRvIHJlc29sdmUgdmlldyBuYW1lcyB0byBhYnNvbHV0ZSBuYW1lcywgc28gZXZlcnl0aGluZyBpcyBhXG4gICAgLy8gc3RyYWlnaHQgbG9va3VwIGF0IGxpbmsgdGltZS5cbiAgICB2aWV3czogZnVuY3Rpb24oc3RhdGUpIHtcbiAgICAgIHZhciB2aWV3cyA9IHt9O1xuXG4gICAgICBmb3JFYWNoKGlzRGVmaW5lZChzdGF0ZS52aWV3cykgPyBzdGF0ZS52aWV3cyA6IHsgJyc6IHN0YXRlIH0sIGZ1bmN0aW9uICh2aWV3LCBuYW1lKSB7XG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJ0AnKSA8IDApIG5hbWUgKz0gJ0AnICsgc3RhdGUucGFyZW50Lm5hbWU7XG4gICAgICAgIHZpZXcucmVzb2x2ZUFzID0gdmlldy5yZXNvbHZlQXMgfHwgc3RhdGUucmVzb2x2ZUFzIHx8ICckcmVzb2x2ZSc7XG4gICAgICAgIHZpZXdzW25hbWVdID0gdmlldztcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHZpZXdzO1xuICAgIH0sXG5cbiAgICAvLyBLZWVwIGEgZnVsbCBwYXRoIGZyb20gdGhlIHJvb3QgZG93biB0byB0aGlzIHN0YXRlIGFzIHRoaXMgaXMgbmVlZGVkIGZvciBzdGF0ZSBhY3RpdmF0aW9uLlxuICAgIHBhdGg6IGZ1bmN0aW9uKHN0YXRlKSB7XG4gICAgICByZXR1cm4gc3RhdGUucGFyZW50ID8gc3RhdGUucGFyZW50LnBhdGguY29uY2F0KHN0YXRlKSA6IFtdOyAvLyBleGNsdWRlIHJvb3QgZnJvbSBwYXRoXG4gICAgfSxcblxuICAgIC8vIFNwZWVkIHVwICRzdGF0ZS5jb250YWlucygpIGFzIGl0J3MgdXNlZCBhIGxvdFxuICAgIGluY2x1ZGVzOiBmdW5jdGlvbihzdGF0ZSkge1xuICAgICAgdmFyIGluY2x1ZGVzID0gc3RhdGUucGFyZW50ID8gZXh0ZW5kKHt9LCBzdGF0ZS5wYXJlbnQuaW5jbHVkZXMpIDoge307XG4gICAgICBpbmNsdWRlc1tzdGF0ZS5uYW1lXSA9IHRydWU7XG4gICAgICByZXR1cm4gaW5jbHVkZXM7XG4gICAgfSxcblxuICAgICRkZWxlZ2F0ZXM6IHt9XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNSZWxhdGl2ZShzdGF0ZU5hbWUpIHtcbiAgICByZXR1cm4gc3RhdGVOYW1lLmluZGV4T2YoXCIuXCIpID09PSAwIHx8IHN0YXRlTmFtZS5pbmRleE9mKFwiXlwiKSA9PT0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmRTdGF0ZShzdGF0ZU9yTmFtZSwgYmFzZSkge1xuICAgIGlmICghc3RhdGVPck5hbWUpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICB2YXIgaXNTdHIgPSBpc1N0cmluZyhzdGF0ZU9yTmFtZSksXG4gICAgICAgIG5hbWUgID0gaXNTdHIgPyBzdGF0ZU9yTmFtZSA6IHN0YXRlT3JOYW1lLm5hbWUsXG4gICAgICAgIHBhdGggID0gaXNSZWxhdGl2ZShuYW1lKTtcblxuICAgIGlmIChwYXRoKSB7XG4gICAgICBpZiAoIWJhc2UpIHRocm93IG5ldyBFcnJvcihcIk5vIHJlZmVyZW5jZSBwb2ludCBnaXZlbiBmb3IgcGF0aCAnXCIgICsgbmFtZSArIFwiJ1wiKTtcbiAgICAgIGJhc2UgPSBmaW5kU3RhdGUoYmFzZSk7XG4gICAgICBcbiAgICAgIHZhciByZWwgPSBuYW1lLnNwbGl0KFwiLlwiKSwgaSA9IDAsIHBhdGhMZW5ndGggPSByZWwubGVuZ3RoLCBjdXJyZW50ID0gYmFzZTtcblxuICAgICAgZm9yICg7IGkgPCBwYXRoTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHJlbFtpXSA9PT0gXCJcIiAmJiBpID09PSAwKSB7XG4gICAgICAgICAgY3VycmVudCA9IGJhc2U7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlbFtpXSA9PT0gXCJeXCIpIHtcbiAgICAgICAgICBpZiAoIWN1cnJlbnQucGFyZW50KSB0aHJvdyBuZXcgRXJyb3IoXCJQYXRoICdcIiArIG5hbWUgKyBcIicgbm90IHZhbGlkIGZvciBzdGF0ZSAnXCIgKyBiYXNlLm5hbWUgKyBcIidcIik7XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgcmVsID0gcmVsLnNsaWNlKGkpLmpvaW4oXCIuXCIpO1xuICAgICAgbmFtZSA9IGN1cnJlbnQubmFtZSArIChjdXJyZW50Lm5hbWUgJiYgcmVsID8gXCIuXCIgOiBcIlwiKSArIHJlbDtcbiAgICB9XG4gICAgdmFyIHN0YXRlID0gc3RhdGVzW25hbWVdO1xuXG4gICAgaWYgKHN0YXRlICYmIChpc1N0ciB8fCAoIWlzU3RyICYmIChzdGF0ZSA9PT0gc3RhdGVPck5hbWUgfHwgc3RhdGUuc2VsZiA9PT0gc3RhdGVPck5hbWUpKSkpIHtcbiAgICAgIHJldHVybiBzdGF0ZTtcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHF1ZXVlU3RhdGUocGFyZW50TmFtZSwgc3RhdGUpIHtcbiAgICBpZiAoIXF1ZXVlW3BhcmVudE5hbWVdKSB7XG4gICAgICBxdWV1ZVtwYXJlbnROYW1lXSA9IFtdO1xuICAgIH1cbiAgICBxdWV1ZVtwYXJlbnROYW1lXS5wdXNoKHN0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsdXNoUXVldWVkQ2hpbGRyZW4ocGFyZW50TmFtZSkge1xuICAgIHZhciBxdWV1ZWQgPSBxdWV1ZVtwYXJlbnROYW1lXSB8fCBbXTtcbiAgICB3aGlsZShxdWV1ZWQubGVuZ3RoKSB7XG4gICAgICByZWdpc3RlclN0YXRlKHF1ZXVlZC5zaGlmdCgpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWdpc3RlclN0YXRlKHN0YXRlKSB7XG4gICAgLy8gV3JhcCBhIG5ldyBvYmplY3QgYXJvdW5kIHRoZSBzdGF0ZSBzbyB3ZSBjYW4gc3RvcmUgb3VyIHByaXZhdGUgZGV0YWlscyBlYXNpbHkuXG4gICAgc3RhdGUgPSBpbmhlcml0KHN0YXRlLCB7XG4gICAgICBzZWxmOiBzdGF0ZSxcbiAgICAgIHJlc29sdmU6IHN0YXRlLnJlc29sdmUgfHwge30sXG4gICAgICB0b1N0cmluZzogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLm5hbWU7IH1cbiAgICB9KTtcblxuICAgIHZhciBuYW1lID0gc3RhdGUubmFtZTtcbiAgICBpZiAoIWlzU3RyaW5nKG5hbWUpIHx8IG5hbWUuaW5kZXhPZignQCcpID49IDApIHRocm93IG5ldyBFcnJvcihcIlN0YXRlIG11c3QgaGF2ZSBhIHZhbGlkIG5hbWVcIik7XG4gICAgaWYgKHN0YXRlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkgdGhyb3cgbmV3IEVycm9yKFwiU3RhdGUgJ1wiICsgbmFtZSArIFwiJyBpcyBhbHJlYWR5IGRlZmluZWRcIik7XG5cbiAgICAvLyBHZXQgcGFyZW50IG5hbWVcbiAgICB2YXIgcGFyZW50TmFtZSA9IChuYW1lLmluZGV4T2YoJy4nKSAhPT0gLTEpID8gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5sYXN0SW5kZXhPZignLicpKVxuICAgICAgICA6IChpc1N0cmluZyhzdGF0ZS5wYXJlbnQpKSA/IHN0YXRlLnBhcmVudFxuICAgICAgICA6IChpc09iamVjdChzdGF0ZS5wYXJlbnQpICYmIGlzU3RyaW5nKHN0YXRlLnBhcmVudC5uYW1lKSkgPyBzdGF0ZS5wYXJlbnQubmFtZVxuICAgICAgICA6ICcnO1xuXG4gICAgLy8gSWYgcGFyZW50IGlzIG5vdCByZWdpc3RlcmVkIHlldCwgYWRkIHN0YXRlIHRvIHF1ZXVlIGFuZCByZWdpc3RlciBsYXRlclxuICAgIGlmIChwYXJlbnROYW1lICYmICFzdGF0ZXNbcGFyZW50TmFtZV0pIHtcbiAgICAgIHJldHVybiBxdWV1ZVN0YXRlKHBhcmVudE5hbWUsIHN0YXRlLnNlbGYpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBzdGF0ZUJ1aWxkZXIpIHtcbiAgICAgIGlmIChpc0Z1bmN0aW9uKHN0YXRlQnVpbGRlcltrZXldKSkgc3RhdGVba2V5XSA9IHN0YXRlQnVpbGRlcltrZXldKHN0YXRlLCBzdGF0ZUJ1aWxkZXIuJGRlbGVnYXRlc1trZXldKTtcbiAgICB9XG4gICAgc3RhdGVzW25hbWVdID0gc3RhdGU7XG5cbiAgICAvLyBSZWdpc3RlciB0aGUgc3RhdGUgaW4gdGhlIGdsb2JhbCBzdGF0ZSBsaXN0IGFuZCB3aXRoICR1cmxSb3V0ZXIgaWYgbmVjZXNzYXJ5LlxuICAgIGlmICghc3RhdGVbYWJzdHJhY3RLZXldICYmIHN0YXRlLnVybCkge1xuICAgICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oc3RhdGUudXJsLCBbJyRtYXRjaCcsICckc3RhdGVQYXJhbXMnLCBmdW5jdGlvbiAoJG1hdGNoLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgaWYgKCRzdGF0ZS4kY3VycmVudC5uYXZpZ2FibGUgIT0gc3RhdGUgfHwgIWVxdWFsRm9yS2V5cygkbWF0Y2gsICRzdGF0ZVBhcmFtcykpIHtcbiAgICAgICAgICAkc3RhdGUudHJhbnNpdGlvblRvKHN0YXRlLCAkbWF0Y2gsIHsgaW5oZXJpdDogdHJ1ZSwgbG9jYXRpb246IGZhbHNlIH0pO1xuICAgICAgICB9XG4gICAgICB9XSk7XG4gICAgfVxuXG4gICAgLy8gUmVnaXN0ZXIgYW55IHF1ZXVlZCBjaGlsZHJlblxuICAgIGZsdXNoUXVldWVkQ2hpbGRyZW4obmFtZSk7XG5cbiAgICByZXR1cm4gc3RhdGU7XG4gIH1cblxuICAvLyBDaGVja3MgdGV4dCB0byBzZWUgaWYgaXQgbG9va3MgbGlrZSBhIGdsb2IuXG4gIGZ1bmN0aW9uIGlzR2xvYiAodGV4dCkge1xuICAgIHJldHVybiB0ZXh0LmluZGV4T2YoJyonKSA+IC0xO1xuICB9XG5cbiAgLy8gUmV0dXJucyB0cnVlIGlmIGdsb2IgbWF0Y2hlcyBjdXJyZW50ICRzdGF0ZSBuYW1lLlxuICBmdW5jdGlvbiBkb2VzU3RhdGVNYXRjaEdsb2IgKGdsb2IpIHtcbiAgICB2YXIgZ2xvYlNlZ21lbnRzID0gZ2xvYi5zcGxpdCgnLicpLFxuICAgICAgICBzZWdtZW50cyA9ICRzdGF0ZS4kY3VycmVudC5uYW1lLnNwbGl0KCcuJyk7XG5cbiAgICAvL21hdGNoIHNpbmdsZSBzdGFyc1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gZ2xvYlNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKGdsb2JTZWdtZW50c1tpXSA9PT0gJyonKSB7XG4gICAgICAgIHNlZ21lbnRzW2ldID0gJyonO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vbWF0Y2ggZ3JlZWR5IHN0YXJ0c1xuICAgIGlmIChnbG9iU2VnbWVudHNbMF0gPT09ICcqKicpIHtcbiAgICAgICBzZWdtZW50cyA9IHNlZ21lbnRzLnNsaWNlKGluZGV4T2Yoc2VnbWVudHMsIGdsb2JTZWdtZW50c1sxXSkpO1xuICAgICAgIHNlZ21lbnRzLnVuc2hpZnQoJyoqJyk7XG4gICAgfVxuICAgIC8vbWF0Y2ggZ3JlZWR5IGVuZHNcbiAgICBpZiAoZ2xvYlNlZ21lbnRzW2dsb2JTZWdtZW50cy5sZW5ndGggLSAxXSA9PT0gJyoqJykge1xuICAgICAgIHNlZ21lbnRzLnNwbGljZShpbmRleE9mKHNlZ21lbnRzLCBnbG9iU2VnbWVudHNbZ2xvYlNlZ21lbnRzLmxlbmd0aCAtIDJdKSArIDEsIE51bWJlci5NQVhfVkFMVUUpO1xuICAgICAgIHNlZ21lbnRzLnB1c2goJyoqJyk7XG4gICAgfVxuXG4gICAgaWYgKGdsb2JTZWdtZW50cy5sZW5ndGggIT0gc2VnbWVudHMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlZ21lbnRzLmpvaW4oJycpID09PSBnbG9iU2VnbWVudHMuam9pbignJyk7XG4gIH1cblxuXG4gIC8vIEltcGxpY2l0IHJvb3Qgc3RhdGUgdGhhdCBpcyBhbHdheXMgYWN0aXZlXG4gIHJvb3QgPSByZWdpc3RlclN0YXRlKHtcbiAgICBuYW1lOiAnJyxcbiAgICB1cmw6ICdeJyxcbiAgICB2aWV3czogbnVsbCxcbiAgICAnYWJzdHJhY3QnOiB0cnVlXG4gIH0pO1xuICByb290Lm5hdmlnYWJsZSA9IG51bGw7XG5cblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQcm92aWRlciNkZWNvcmF0b3JcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQWxsb3dzIHlvdSB0byBleHRlbmQgKGNhcmVmdWxseSkgb3Igb3ZlcnJpZGUgKGF0IHlvdXIgb3duIHBlcmlsKSB0aGUgXG4gICAqIGBzdGF0ZUJ1aWxkZXJgIG9iamVjdCB1c2VkIGludGVybmFsbHkgYnkgYCRzdGF0ZVByb3ZpZGVyYC4gVGhpcyBjYW4gYmUgdXNlZCBcbiAgICogdG8gYWRkIGN1c3RvbSBmdW5jdGlvbmFsaXR5IHRvIHVpLXJvdXRlciwgZm9yIGV4YW1wbGUgaW5mZXJyaW5nIHRlbXBsYXRlVXJsIFxuICAgKiBiYXNlZCBvbiB0aGUgc3RhdGUgbmFtZS5cbiAgICpcbiAgICogV2hlbiBwYXNzaW5nIG9ubHkgYSBuYW1lLCBpdCByZXR1cm5zIHRoZSBjdXJyZW50IChvcmlnaW5hbCBvciBkZWNvcmF0ZWQpIGJ1aWxkZXJcbiAgICogZnVuY3Rpb24gdGhhdCBtYXRjaGVzIGBuYW1lYC5cbiAgICpcbiAgICogVGhlIGJ1aWxkZXIgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIGRlY29yYXRlZCBhcmUgbGlzdGVkIGJlbG93LiBUaG91Z2ggbm90IGFsbFxuICAgKiBuZWNlc3NhcmlseSBoYXZlIGEgZ29vZCB1c2UgY2FzZSBmb3IgZGVjb3JhdGlvbiwgdGhhdCBpcyB1cCB0byB5b3UgdG8gZGVjaWRlLlxuICAgKlxuICAgKiBJbiBhZGRpdGlvbiwgdXNlcnMgY2FuIGF0dGFjaCBjdXN0b20gZGVjb3JhdG9ycywgd2hpY2ggd2lsbCBnZW5lcmF0ZSBuZXcgXG4gICAqIHByb3BlcnRpZXMgd2l0aGluIHRoZSBzdGF0ZSdzIGludGVybmFsIGRlZmluaXRpb24uIFRoZXJlIGlzIGN1cnJlbnRseSBubyBjbGVhciBcbiAgICogdXNlLWNhc2UgZm9yIHRoaXMgYmV5b25kIGFjY2Vzc2luZyBpbnRlcm5hbCBzdGF0ZXMgKGkuZS4gJHN0YXRlLiRjdXJyZW50KSwgXG4gICAqIGhvd2V2ZXIsIGV4cGVjdCB0aGlzIHRvIGJlY29tZSBpbmNyZWFzaW5nbHkgcmVsZXZhbnQgYXMgd2UgaW50cm9kdWNlIGFkZGl0aW9uYWwgXG4gICAqIG1ldGEtcHJvZ3JhbW1pbmcgZmVhdHVyZXMuXG4gICAqXG4gICAqICoqV2FybmluZyoqOiBEZWNvcmF0b3JzIHNob3VsZCBub3QgYmUgaW50ZXJkZXBlbmRlbnQgYmVjYXVzZSB0aGUgb3JkZXIgb2YgXG4gICAqIGV4ZWN1dGlvbiBvZiB0aGUgYnVpbGRlciBmdW5jdGlvbnMgaW4gbm9uLWRldGVybWluaXN0aWMuIEJ1aWxkZXIgZnVuY3Rpb25zIFxuICAgKiBzaG91bGQgb25seSBiZSBkZXBlbmRlbnQgb24gdGhlIHN0YXRlIGRlZmluaXRpb24gb2JqZWN0IGFuZCBzdXBlciBmdW5jdGlvbi5cbiAgICpcbiAgICpcbiAgICogRXhpc3RpbmcgYnVpbGRlciBmdW5jdGlvbnMgYW5kIGN1cnJlbnQgcmV0dXJuIHZhbHVlczpcbiAgICpcbiAgICogLSAqKnBhcmVudCoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIHRoZSBwYXJlbnQgc3RhdGUgb2JqZWN0LlxuICAgKiAtICoqZGF0YSoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIHN0YXRlIGRhdGEsIGluY2x1ZGluZyBhbnkgaW5oZXJpdGVkIGRhdGEgdGhhdCBpcyBub3RcbiAgICogICBvdmVycmlkZGVuIGJ5IG93biB2YWx1ZXMgKGlmIGFueSkuXG4gICAqIC0gKip1cmwqKiBge29iamVjdH1gIC0gcmV0dXJucyBhIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgVXJsTWF0Y2hlcn1cbiAgICogICBvciBgbnVsbGAuXG4gICAqIC0gKipuYXZpZ2FibGUqKiBge29iamVjdH1gIC0gcmV0dXJucyBjbG9zZXN0IGFuY2VzdG9yIHN0YXRlIHRoYXQgaGFzIGEgVVJMIChha2EgaXMgXG4gICAqICAgbmF2aWdhYmxlKS5cbiAgICogLSAqKnBhcmFtcyoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGFuIGFycmF5IG9mIHN0YXRlIHBhcmFtcyB0aGF0IGFyZSBlbnN1cmVkIHRvIFxuICAgKiAgIGJlIGEgc3VwZXItc2V0IG9mIHBhcmVudCdzIHBhcmFtcy5cbiAgICogLSAqKnZpZXdzKiogYHtvYmplY3R9YCAtIHJldHVybnMgYSB2aWV3cyBvYmplY3Qgd2hlcmUgZWFjaCBrZXkgaXMgYW4gYWJzb2x1dGUgdmlldyBcbiAgICogICBuYW1lIChpLmUuIFwidmlld05hbWVAc3RhdGVOYW1lXCIpIGFuZCBlYWNoIHZhbHVlIGlzIHRoZSBjb25maWcgb2JqZWN0IFxuICAgKiAgICh0ZW1wbGF0ZSwgY29udHJvbGxlcikgZm9yIHRoZSB2aWV3LiBFdmVuIHdoZW4geW91IGRvbid0IHVzZSB0aGUgdmlld3Mgb2JqZWN0IFxuICAgKiAgIGV4cGxpY2l0bHkgb24gYSBzdGF0ZSBjb25maWcsIG9uZSBpcyBzdGlsbCBjcmVhdGVkIGZvciB5b3UgaW50ZXJuYWxseS5cbiAgICogICBTbyBieSBkZWNvcmF0aW5nIHRoaXMgYnVpbGRlciBmdW5jdGlvbiB5b3UgaGF2ZSBhY2Nlc3MgdG8gZGVjb3JhdGluZyB0ZW1wbGF0ZSBcbiAgICogICBhbmQgY29udHJvbGxlciBwcm9wZXJ0aWVzLlxuICAgKiAtICoqb3duUGFyYW1zKiogYHtvYmplY3R9YCAtIHJldHVybnMgYW4gYXJyYXkgb2YgcGFyYW1zIHRoYXQgYmVsb25nIHRvIHRoZSBzdGF0ZSwgXG4gICAqICAgbm90IGluY2x1ZGluZyBhbnkgcGFyYW1zIGRlZmluZWQgYnkgYW5jZXN0b3Igc3RhdGVzLlxuICAgKiAtICoqcGF0aCoqIGB7c3RyaW5nfWAgLSByZXR1cm5zIHRoZSBmdWxsIHBhdGggZnJvbSB0aGUgcm9vdCBkb3duIHRvIHRoaXMgc3RhdGUuIFxuICAgKiAgIE5lZWRlZCBmb3Igc3RhdGUgYWN0aXZhdGlvbi5cbiAgICogLSAqKmluY2x1ZGVzKiogYHtvYmplY3R9YCAtIHJldHVybnMgYW4gb2JqZWN0IHRoYXQgaW5jbHVkZXMgZXZlcnkgc3RhdGUgdGhhdCBcbiAgICogICB3b3VsZCBwYXNzIGEgYCRzdGF0ZS5pbmNsdWRlcygpYCB0ZXN0LlxuICAgKlxuICAgKiBAZXhhbXBsZVxuICAgKiA8cHJlPlxuICAgKiAvLyBPdmVycmlkZSB0aGUgaW50ZXJuYWwgJ3ZpZXdzJyBidWlsZGVyIHdpdGggYSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBzdGF0ZVxuICAgKiAvLyBkZWZpbml0aW9uLCBhbmQgYSByZWZlcmVuY2UgdG8gdGhlIGludGVybmFsIGZ1bmN0aW9uIGJlaW5nIG92ZXJyaWRkZW46XG4gICAqICRzdGF0ZVByb3ZpZGVyLmRlY29yYXRvcigndmlld3MnLCBmdW5jdGlvbiAoc3RhdGUsIHBhcmVudCkge1xuICAgKiAgIHZhciByZXN1bHQgPSB7fSxcbiAgICogICAgICAgdmlld3MgPSBwYXJlbnQoc3RhdGUpO1xuICAgKlxuICAgKiAgIGFuZ3VsYXIuZm9yRWFjaCh2aWV3cywgZnVuY3Rpb24gKGNvbmZpZywgbmFtZSkge1xuICAgKiAgICAgdmFyIGF1dG9OYW1lID0gKHN0YXRlLm5hbWUgKyAnLicgKyBuYW1lKS5yZXBsYWNlKCcuJywgJy8nKTtcbiAgICogICAgIGNvbmZpZy50ZW1wbGF0ZVVybCA9IGNvbmZpZy50ZW1wbGF0ZVVybCB8fCAnL3BhcnRpYWxzLycgKyBhdXRvTmFtZSArICcuaHRtbCc7XG4gICAqICAgICByZXN1bHRbbmFtZV0gPSBjb25maWc7XG4gICAqICAgfSk7XG4gICAqICAgcmV0dXJuIHJlc3VsdDtcbiAgICogfSk7XG4gICAqXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xuICAgKiAgIHZpZXdzOiB7XG4gICAqICAgICAnY29udGFjdC5saXN0JzogeyBjb250cm9sbGVyOiAnTGlzdENvbnRyb2xsZXInIH0sXG4gICAqICAgICAnY29udGFjdC5pdGVtJzogeyBjb250cm9sbGVyOiAnSXRlbUNvbnRyb2xsZXInIH1cbiAgICogICB9XG4gICAqIH0pO1xuICAgKlxuICAgKiAvLyAuLi5cbiAgICpcbiAgICogJHN0YXRlLmdvKCdob21lJyk7XG4gICAqIC8vIEF1dG8tcG9wdWxhdGVzIGxpc3QgYW5kIGl0ZW0gdmlld3Mgd2l0aCAvcGFydGlhbHMvaG9tZS9jb250YWN0L2xpc3QuaHRtbCxcbiAgICogLy8gYW5kIC9wYXJ0aWFscy9ob21lL2NvbnRhY3QvaXRlbS5odG1sLCByZXNwZWN0aXZlbHkuXG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiB0aGUgYnVpbGRlciBmdW5jdGlvbiB0byBkZWNvcmF0ZS4gXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmdW5jIEEgZnVuY3Rpb24gdGhhdCBpcyByZXNwb25zaWJsZSBmb3IgZGVjb3JhdGluZyB0aGUgb3JpZ2luYWwgXG4gICAqIGJ1aWxkZXIgZnVuY3Rpb24uIFRoZSBmdW5jdGlvbiByZWNlaXZlcyB0d28gcGFyYW1ldGVyczpcbiAgICpcbiAgICogICAtIGB7b2JqZWN0fWAgLSBzdGF0ZSAtIFRoZSBzdGF0ZSBjb25maWcgb2JqZWN0LlxuICAgKiAgIC0gYHtvYmplY3R9YCAtIHN1cGVyIC0gVGhlIG9yaWdpbmFsIGJ1aWxkZXIgZnVuY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge29iamVjdH0gJHN0YXRlUHJvdmlkZXIgLSAkc3RhdGVQcm92aWRlciBpbnN0YW5jZVxuICAgKi9cbiAgdGhpcy5kZWNvcmF0b3IgPSBkZWNvcmF0b3I7XG4gIGZ1bmN0aW9uIGRlY29yYXRvcihuYW1lLCBmdW5jKSB7XG4gICAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlICovXG4gICAgaWYgKGlzU3RyaW5nKG5hbWUpICYmICFpc0RlZmluZWQoZnVuYykpIHtcbiAgICAgIHJldHVybiBzdGF0ZUJ1aWxkZXJbbmFtZV07XG4gICAgfVxuICAgIGlmICghaXNGdW5jdGlvbihmdW5jKSB8fCAhaXNTdHJpbmcobmFtZSkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAoc3RhdGVCdWlsZGVyW25hbWVdICYmICFzdGF0ZUJ1aWxkZXIuJGRlbGVnYXRlc1tuYW1lXSkge1xuICAgICAgc3RhdGVCdWlsZGVyLiRkZWxlZ2F0ZXNbbmFtZV0gPSBzdGF0ZUJ1aWxkZXJbbmFtZV07XG4gICAgfVxuICAgIHN0YXRlQnVpbGRlcltuYW1lXSA9IGZ1bmM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQcm92aWRlciNzdGF0ZVxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBSZWdpc3RlcnMgYSBzdGF0ZSBjb25maWd1cmF0aW9uIHVuZGVyIGEgZ2l2ZW4gc3RhdGUgbmFtZS4gVGhlIHN0YXRlQ29uZmlnIG9iamVjdFxuICAgKiBoYXMgdGhlIGZvbGxvd2luZyBhY2NlcHRhYmxlIHByb3BlcnRpZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEEgdW5pcXVlIHN0YXRlIG5hbWUsIGUuZy4gXCJob21lXCIsIFwiYWJvdXRcIiwgXCJjb250YWN0c1wiLlxuICAgKiBUbyBjcmVhdGUgYSBwYXJlbnQvY2hpbGQgc3RhdGUgdXNlIGEgZG90LCBlLmcuIFwiYWJvdXQuc2FsZXNcIiwgXCJob21lLm5ld2VzdFwiLlxuICAgKiBAcGFyYW0ge29iamVjdH0gc3RhdGVDb25maWcgU3RhdGUgY29uZmlndXJhdGlvbiBvYmplY3QuXG4gICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9uPX0gc3RhdGVDb25maWcudGVtcGxhdGVcbiAgICogPGEgaWQ9J3RlbXBsYXRlJz48L2E+XG4gICAqICAgaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZyBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJuc1xuICAgKiAgIGFuIGh0bWwgdGVtcGxhdGUgYXMgYSBzdHJpbmcgd2hpY2ggc2hvdWxkIGJlIHVzZWQgYnkgdGhlIHVpVmlldyBkaXJlY3RpdmVzLiBUaGlzIHByb3BlcnR5IFxuICAgKiAgIHRha2VzIHByZWNlZGVuY2Ugb3ZlciB0ZW1wbGF0ZVVybC5cbiAgICogICBcbiAgICogICBJZiBgdGVtcGxhdGVgIGlzIGEgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgKlxuICAgKiAgIC0ge2FycmF5LiZsdDtvYmplY3QmZ3Q7fSAtIHN0YXRlIHBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIGN1cnJlbnQgJGxvY2F0aW9uLnBhdGgoKSBieVxuICAgKiAgICAgYXBwbHlpbmcgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICpcbiAgICogPHByZT50ZW1wbGF0ZTpcbiAgICogICBcIjxoMT5pbmxpbmUgdGVtcGxhdGUgZGVmaW5pdGlvbjwvaDE+XCIgK1xuICAgKiAgIFwiPGRpdiB1aS12aWV3PjwvZGl2PlwiPC9wcmU+XG4gICAqIDxwcmU+dGVtcGxhdGU6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgKiAgICAgICByZXR1cm4gXCI8aDE+Z2VuZXJhdGVkIHRlbXBsYXRlPC9oMT5cIjsgfTwvcHJlPlxuICAgKiA8L2Rpdj5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy50ZW1wbGF0ZVVybFxuICAgKiA8YSBpZD0ndGVtcGxhdGVVcmwnPjwvYT5cbiAgICpcbiAgICogICBwYXRoIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHBhdGggdG8gYW4gaHRtbFxuICAgKiAgIHRlbXBsYXRlIHRoYXQgc2hvdWxkIGJlIHVzZWQgYnkgdWlWaWV3LlxuICAgKiAgIFxuICAgKiAgIElmIGB0ZW1wbGF0ZVVybGAgaXMgYSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAqXG4gICAqICAgLSB7YXJyYXkuJmx0O29iamVjdCZndDt9IC0gc3RhdGUgcGFyYW1ldGVycyBleHRyYWN0ZWQgZnJvbSB0aGUgY3VycmVudCAkbG9jYXRpb24ucGF0aCgpIGJ5IFxuICAgKiAgICAgYXBwbHlpbmcgdGhlIGN1cnJlbnQgc3RhdGVcbiAgICpcbiAgICogPHByZT50ZW1wbGF0ZVVybDogXCJob21lLmh0bWxcIjwvcHJlPlxuICAgKiA8cHJlPnRlbXBsYXRlVXJsOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICogICAgIHJldHVybiBteVRlbXBsYXRlc1twYXJhbXMucGFnZUlkXTsgfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3RhdGVDb25maWcudGVtcGxhdGVQcm92aWRlclxuICAgKiA8YSBpZD0ndGVtcGxhdGVQcm92aWRlcic+PC9hPlxuICAgKiAgICBQcm92aWRlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgSFRNTCBjb250ZW50IHN0cmluZy5cbiAgICogPHByZT4gdGVtcGxhdGVQcm92aWRlcjpcbiAgICogICAgICAgZnVuY3Rpb24oTXlUZW1wbGF0ZVNlcnZpY2UsIHBhcmFtcykge1xuICAgKiAgICAgICAgIHJldHVybiBNeVRlbXBsYXRlU2VydmljZS5nZXRUZW1wbGF0ZShwYXJhbXMucGFnZUlkKTtcbiAgICogICAgICAgfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ3xmdW5jdGlvbj19IHN0YXRlQ29uZmlnLmNvbnRyb2xsZXJcbiAgICogPGEgaWQ9J2NvbnRyb2xsZXInPjwvYT5cbiAgICpcbiAgICogIENvbnRyb2xsZXIgZm4gdGhhdCBzaG91bGQgYmUgYXNzb2NpYXRlZCB3aXRoIG5ld2x5XG4gICAqICAgcmVsYXRlZCBzY29wZSBvciB0aGUgbmFtZSBvZiBhIHJlZ2lzdGVyZWQgY29udHJvbGxlciBpZiBwYXNzZWQgYXMgYSBzdHJpbmcuXG4gICAqICAgT3B0aW9uYWxseSwgdGhlIENvbnRyb2xsZXJBcyBtYXkgYmUgZGVjbGFyZWQgaGVyZS5cbiAgICogPHByZT5jb250cm9sbGVyOiBcIk15UmVnaXN0ZXJlZENvbnRyb2xsZXJcIjwvcHJlPlxuICAgKiA8cHJlPmNvbnRyb2xsZXI6XG4gICAqICAgICBcIk15UmVnaXN0ZXJlZENvbnRyb2xsZXIgYXMgZm9vQ3RybFwifTwvcHJlPlxuICAgKiA8cHJlPmNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgTXlTZXJ2aWNlKSB7XG4gICAqICAgICAkc2NvcGUuZGF0YSA9IE15U2VydmljZS5nZXREYXRhKCk7IH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbj19IHN0YXRlQ29uZmlnLmNvbnRyb2xsZXJQcm92aWRlclxuICAgKiA8YSBpZD0nY29udHJvbGxlclByb3ZpZGVyJz48L2E+XG4gICAqXG4gICAqIEluamVjdGFibGUgcHJvdmlkZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBhY3R1YWwgY29udHJvbGxlciBvciBzdHJpbmcuXG4gICAqIDxwcmU+Y29udHJvbGxlclByb3ZpZGVyOlxuICAgKiAgIGZ1bmN0aW9uKE15UmVzb2x2ZURhdGEpIHtcbiAgICogICAgIGlmIChNeVJlc29sdmVEYXRhLmZvbylcbiAgICogICAgICAgcmV0dXJuIFwiRm9vQ3RybFwiXG4gICAqICAgICBlbHNlIGlmIChNeVJlc29sdmVEYXRhLmJhcilcbiAgICogICAgICAgcmV0dXJuIFwiQmFyQ3RybFwiO1xuICAgKiAgICAgZWxzZSByZXR1cm4gZnVuY3Rpb24oJHNjb3BlKSB7XG4gICAqICAgICAgICRzY29wZS5iYXogPSBcIlF1eFwiO1xuICAgKiAgICAgfVxuICAgKiAgIH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmc9fSBzdGF0ZUNvbmZpZy5jb250cm9sbGVyQXNcbiAgICogPGEgaWQ9J2NvbnRyb2xsZXJBcyc+PC9hPlxuICAgKiBcbiAgICogQSBjb250cm9sbGVyIGFsaWFzIG5hbWUuIElmIHByZXNlbnQgdGhlIGNvbnRyb2xsZXIgd2lsbCBiZVxuICAgKiAgIHB1Ymxpc2hlZCB0byBzY29wZSB1bmRlciB0aGUgY29udHJvbGxlckFzIG5hbWUuXG4gICAqIDxwcmU+Y29udHJvbGxlckFzOiBcIm15Q3RybFwiPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdD19IHN0YXRlQ29uZmlnLnBhcmVudFxuICAgKiA8YSBpZD0ncGFyZW50Jz48L2E+XG4gICAqIE9wdGlvbmFsbHkgc3BlY2lmaWVzIHRoZSBwYXJlbnQgc3RhdGUgb2YgdGhpcyBzdGF0ZS5cbiAgICpcbiAgICogPHByZT5wYXJlbnQ6ICdwYXJlbnRTdGF0ZSc8L3ByZT5cbiAgICogPHByZT5wYXJlbnQ6IHBhcmVudFN0YXRlIC8vIEpTIHZhcmlhYmxlPC9wcmU+XG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0PX0gc3RhdGVDb25maWcucmVzb2x2ZVxuICAgKiA8YSBpZD0ncmVzb2x2ZSc+PC9hPlxuICAgKlxuICAgKiBBbiBvcHRpb25hbCBtYXAmbHQ7c3RyaW5nLCBmdW5jdGlvbiZndDsgb2YgZGVwZW5kZW5jaWVzIHdoaWNoXG4gICAqICAgc2hvdWxkIGJlIGluamVjdGVkIGludG8gdGhlIGNvbnRyb2xsZXIuIElmIGFueSBvZiB0aGVzZSBkZXBlbmRlbmNpZXMgYXJlIHByb21pc2VzLCBcbiAgICogICB0aGUgcm91dGVyIHdpbGwgd2FpdCBmb3IgdGhlbSBhbGwgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIHRoZSBjb250cm9sbGVyIGlzIGluc3RhbnRpYXRlZC5cbiAgICogICBJZiBhbGwgdGhlIHByb21pc2VzIGFyZSByZXNvbHZlZCBzdWNjZXNzZnVsbHksIHRoZSAkc3RhdGVDaGFuZ2VTdWNjZXNzIGV2ZW50IGlzIGZpcmVkXG4gICAqICAgYW5kIHRoZSB2YWx1ZXMgb2YgdGhlIHJlc29sdmVkIHByb21pc2VzIGFyZSBpbmplY3RlZCBpbnRvIGFueSBjb250cm9sbGVycyB0aGF0IHJlZmVyZW5jZSB0aGVtLlxuICAgKiAgIElmIGFueSAgb2YgdGhlIHByb21pc2VzIGFyZSByZWplY3RlZCB0aGUgJHN0YXRlQ2hhbmdlRXJyb3IgZXZlbnQgaXMgZmlyZWQuXG4gICAqXG4gICAqICAgVGhlIG1hcCBvYmplY3QgaXM6XG4gICAqICAgXG4gICAqICAgLSBrZXkgLSB7c3RyaW5nfTogbmFtZSBvZiBkZXBlbmRlbmN5IHRvIGJlIGluamVjdGVkIGludG8gY29udHJvbGxlclxuICAgKiAgIC0gZmFjdG9yeSAtIHtzdHJpbmd8ZnVuY3Rpb259OiBJZiBzdHJpbmcgdGhlbiBpdCBpcyBhbGlhcyBmb3Igc2VydmljZS4gT3RoZXJ3aXNlIGlmIGZ1bmN0aW9uLCBcbiAgICogICAgIGl0IGlzIGluamVjdGVkIGFuZCByZXR1cm4gdmFsdWUgaXQgdHJlYXRlZCBhcyBkZXBlbmRlbmN5LiBJZiByZXN1bHQgaXMgYSBwcm9taXNlLCBpdCBpcyBcbiAgICogICAgIHJlc29sdmVkIGJlZm9yZSBpdHMgdmFsdWUgaXMgaW5qZWN0ZWQgaW50byBjb250cm9sbGVyLlxuICAgKlxuICAgKiA8cHJlPnJlc29sdmU6IHtcbiAgICogICAgIG15UmVzb2x2ZTE6XG4gICAqICAgICAgIGZ1bmN0aW9uKCRodHRwLCAkc3RhdGVQYXJhbXMpIHtcbiAgICogICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9mb29zL1wiK3N0YXRlUGFyYW1zLmZvb0lEKTtcbiAgICogICAgICAgfVxuICAgKiAgICAgfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZz19IHN0YXRlQ29uZmlnLnVybFxuICAgKiA8YSBpZD0ndXJsJz48L2E+XG4gICAqXG4gICAqICAgQSB1cmwgZnJhZ21lbnQgd2l0aCBvcHRpb25hbCBwYXJhbWV0ZXJzLiBXaGVuIGEgc3RhdGUgaXMgbmF2aWdhdGVkIG9yXG4gICAqICAgdHJhbnNpdGlvbmVkIHRvLCB0aGUgYCRzdGF0ZVBhcmFtc2Agc2VydmljZSB3aWxsIGJlIHBvcHVsYXRlZCB3aXRoIGFueSBcbiAgICogICBwYXJhbWV0ZXJzIHRoYXQgd2VyZSBwYXNzZWQuXG4gICAqXG4gICAqICAgKFNlZSB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIFVybE1hdGNoZXJ9IGBVcmxNYXRjaGVyYH0gZm9yXG4gICAqICAgbW9yZSBkZXRhaWxzIG9uIGFjY2VwdGFibGUgcGF0dGVybnMgKVxuICAgKlxuICAgKiBleGFtcGxlczpcbiAgICogPHByZT51cmw6IFwiL2hvbWVcIlxuICAgKiB1cmw6IFwiL3VzZXJzLzp1c2VyaWRcIlxuICAgKiB1cmw6IFwiL2Jvb2tzL3tib29raWQ6W2EtekEtWl8tXX1cIlxuICAgKiB1cmw6IFwiL2Jvb2tzL3tjYXRlZ29yeWlkOmludH1cIlxuICAgKiB1cmw6IFwiL2Jvb2tzL3twdWJsaXNoZXJuYW1lOnN0cmluZ30ve2NhdGVnb3J5aWQ6aW50fVwiXG4gICAqIHVybDogXCIvbWVzc2FnZXM/YmVmb3JlJmFmdGVyXCJcbiAgICogdXJsOiBcIi9tZXNzYWdlcz97YmVmb3JlOmRhdGV9JnthZnRlcjpkYXRlfVwiXG4gICAqIHVybDogXCIvbWVzc2FnZXMvOm1haWxib3hpZD97YmVmb3JlOmRhdGV9JnthZnRlcjpkYXRlfVwiXG4gICAqIDwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdD19IHN0YXRlQ29uZmlnLnZpZXdzXG4gICAqIDxhIGlkPSd2aWV3cyc+PC9hPlxuICAgKiBhbiBvcHRpb25hbCBtYXAmbHQ7c3RyaW5nLCBvYmplY3QmZ3Q7IHdoaWNoIGRlZmluZWQgbXVsdGlwbGUgdmlld3MsIG9yIHRhcmdldHMgdmlld3NcbiAgICogbWFudWFsbHkvZXhwbGljaXRseS5cbiAgICpcbiAgICogRXhhbXBsZXM6XG4gICAqXG4gICAqIFRhcmdldHMgdGhyZWUgbmFtZWQgYHVpLXZpZXdgcyBpbiB0aGUgcGFyZW50IHN0YXRlJ3MgdGVtcGxhdGVcbiAgICogPHByZT52aWV3czoge1xuICAgKiAgICAgaGVhZGVyOiB7XG4gICAqICAgICAgIGNvbnRyb2xsZXI6IFwiaGVhZGVyQ3RybFwiLFxuICAgKiAgICAgICB0ZW1wbGF0ZVVybDogXCJoZWFkZXIuaHRtbFwiXG4gICAqICAgICB9LCBib2R5OiB7XG4gICAqICAgICAgIGNvbnRyb2xsZXI6IFwiYm9keUN0cmxcIixcbiAgICogICAgICAgdGVtcGxhdGVVcmw6IFwiYm9keS5odG1sXCJcbiAgICogICAgIH0sIGZvb3Rlcjoge1xuICAgKiAgICAgICBjb250cm9sbGVyOiBcImZvb3RDdHJsXCIsXG4gICAqICAgICAgIHRlbXBsYXRlVXJsOiBcImZvb3Rlci5odG1sXCJcbiAgICogICAgIH1cbiAgICogICB9PC9wcmU+XG4gICAqXG4gICAqIFRhcmdldHMgbmFtZWQgYHVpLXZpZXc9XCJoZWFkZXJcImAgZnJvbSBncmFuZHBhcmVudCBzdGF0ZSAndG9wJydzIHRlbXBsYXRlLCBhbmQgbmFtZWQgYHVpLXZpZXc9XCJib2R5XCIgZnJvbSBwYXJlbnQgc3RhdGUncyB0ZW1wbGF0ZS5cbiAgICogPHByZT52aWV3czoge1xuICAgKiAgICAgJ2hlYWRlckB0b3AnOiB7XG4gICAqICAgICAgIGNvbnRyb2xsZXI6IFwibXNnSGVhZGVyQ3RybFwiLFxuICAgKiAgICAgICB0ZW1wbGF0ZVVybDogXCJtc2dIZWFkZXIuaHRtbFwiXG4gICAqICAgICB9LCAnYm9keSc6IHtcbiAgICogICAgICAgY29udHJvbGxlcjogXCJtZXNzYWdlc0N0cmxcIixcbiAgICogICAgICAgdGVtcGxhdGVVcmw6IFwibWVzc2FnZXMuaHRtbFwiXG4gICAqICAgICB9XG4gICAqICAgfTwvcHJlPlxuICAgKlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbc3RhdGVDb25maWcuYWJzdHJhY3Q9ZmFsc2VdXG4gICAqIDxhIGlkPSdhYnN0cmFjdCc+PC9hPlxuICAgKiBBbiBhYnN0cmFjdCBzdGF0ZSB3aWxsIG5ldmVyIGJlIGRpcmVjdGx5IGFjdGl2YXRlZCxcbiAgICogICBidXQgY2FuIHByb3ZpZGUgaW5oZXJpdGVkIHByb3BlcnRpZXMgdG8gaXRzIGNvbW1vbiBjaGlsZHJlbiBzdGF0ZXMuXG4gICAqIDxwcmU+YWJzdHJhY3Q6IHRydWU8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbj19IHN0YXRlQ29uZmlnLm9uRW50ZXJcbiAgICogPGEgaWQ9J29uRW50ZXInPjwvYT5cbiAgICpcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb24gZm9yIHdoZW4gYSBzdGF0ZSBpcyBlbnRlcmVkLiBHb29kIHdheVxuICAgKiAgIHRvIHRyaWdnZXIgYW4gYWN0aW9uIG9yIGRpc3BhdGNoIGFuIGV2ZW50LCBzdWNoIGFzIG9wZW5pbmcgYSBkaWFsb2cuXG4gICAqIElmIG1pbmlmeWluZyB5b3VyIHNjcmlwdHMsIG1ha2Ugc3VyZSB0byBleHBsaWNpdGx5IGFubm90YXRlIHRoaXMgZnVuY3Rpb24sXG4gICAqIGJlY2F1c2UgaXQgd29uJ3QgYmUgYXV0b21hdGljYWxseSBhbm5vdGF0ZWQgYnkgeW91ciBidWlsZCB0b29scy5cbiAgICpcbiAgICogPHByZT5vbkVudGVyOiBmdW5jdGlvbihNeVNlcnZpY2UsICRzdGF0ZVBhcmFtcykge1xuICAgKiAgICAgTXlTZXJ2aWNlLmZvbygkc3RhdGVQYXJhbXMubXlQYXJhbSk7XG4gICAqIH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbj19IHN0YXRlQ29uZmlnLm9uRXhpdFxuICAgKiA8YSBpZD0nb25FeGl0Jz48L2E+XG4gICAqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9uIGZvciB3aGVuIGEgc3RhdGUgaXMgZXhpdGVkLiBHb29kIHdheSB0b1xuICAgKiAgIHRyaWdnZXIgYW4gYWN0aW9uIG9yIGRpc3BhdGNoIGFuIGV2ZW50LCBzdWNoIGFzIG9wZW5pbmcgYSBkaWFsb2cuXG4gICAqIElmIG1pbmlmeWluZyB5b3VyIHNjcmlwdHMsIG1ha2Ugc3VyZSB0byBleHBsaWNpdGx5IGFubm90YXRlIHRoaXMgZnVuY3Rpb24sXG4gICAqIGJlY2F1c2UgaXQgd29uJ3QgYmUgYXV0b21hdGljYWxseSBhbm5vdGF0ZWQgYnkgeW91ciBidWlsZCB0b29scy5cbiAgICpcbiAgICogPHByZT5vbkV4aXQ6IGZ1bmN0aW9uKE15U2VydmljZSwgJHN0YXRlUGFyYW1zKSB7XG4gICAqICAgICBNeVNlcnZpY2UuY2xlYW51cCgkc3RhdGVQYXJhbXMubXlQYXJhbSk7XG4gICAqIH08L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtib29sZWFuPX0gW3N0YXRlQ29uZmlnLnJlbG9hZE9uU2VhcmNoPXRydWVdXG4gICAqIDxhIGlkPSdyZWxvYWRPblNlYXJjaCc+PC9hPlxuICAgKlxuICAgKiBJZiBgZmFsc2VgLCB3aWxsIG5vdCByZXRyaWdnZXIgdGhlIHNhbWUgc3RhdGVcbiAgICogICBqdXN0IGJlY2F1c2UgYSBzZWFyY2gvcXVlcnkgcGFyYW1ldGVyIGhhcyBjaGFuZ2VkICh2aWEgJGxvY2F0aW9uLnNlYXJjaCgpIG9yICRsb2NhdGlvbi5oYXNoKCkpLiBcbiAgICogICBVc2VmdWwgZm9yIHdoZW4geW91J2QgbGlrZSB0byBtb2RpZnkgJGxvY2F0aW9uLnNlYXJjaCgpIHdpdGhvdXQgdHJpZ2dlcmluZyBhIHJlbG9hZC5cbiAgICogPHByZT5yZWxvYWRPblNlYXJjaDogZmFsc2U8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3Q9fSBzdGF0ZUNvbmZpZy5kYXRhXG4gICAqIDxhIGlkPSdkYXRhJz48L2E+XG4gICAqXG4gICAqIEFyYml0cmFyeSBkYXRhIG9iamVjdCwgdXNlZnVsIGZvciBjdXN0b20gY29uZmlndXJhdGlvbi4gIFRoZSBwYXJlbnQgc3RhdGUncyBgZGF0YWAgaXNcbiAgICogICBwcm90b3R5cGFsbHkgaW5oZXJpdGVkLiAgSW4gb3RoZXIgd29yZHMsIGFkZGluZyBhIGRhdGEgcHJvcGVydHkgdG8gYSBzdGF0ZSBhZGRzIGl0IHRvXG4gICAqICAgdGhlIGVudGlyZSBzdWJ0cmVlIHZpYSBwcm90b3R5cGFsIGluaGVyaXRhbmNlLlxuICAgKlxuICAgKiA8cHJlPmRhdGE6IHtcbiAgICogICAgIHJlcXVpcmVkUm9sZTogJ2ZvbydcbiAgICogfSA8L3ByZT5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3Q9fSBzdGF0ZUNvbmZpZy5wYXJhbXNcbiAgICogPGEgaWQ9J3BhcmFtcyc+PC9hPlxuICAgKlxuICAgKiBBIG1hcCB3aGljaCBvcHRpb25hbGx5IGNvbmZpZ3VyZXMgcGFyYW1ldGVycyBkZWNsYXJlZCBpbiB0aGUgYHVybGAsIG9yXG4gICAqICAgZGVmaW5lcyBhZGRpdGlvbmFsIG5vbi11cmwgcGFyYW1ldGVycy4gIEZvciBlYWNoIHBhcmFtZXRlciBiZWluZ1xuICAgKiAgIGNvbmZpZ3VyZWQsIGFkZCBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGtleWVkIHRvIHRoZSBuYW1lIG9mIHRoZSBwYXJhbWV0ZXIuXG4gICAqXG4gICAqICAgRWFjaCBwYXJhbWV0ZXIgY29uZmlndXJhdGlvbiBvYmplY3QgbWF5IGNvbnRhaW4gdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKlxuICAgKiAgIC0gKiogdmFsdWUgKiogLSB7b2JqZWN0fGZ1bmN0aW9uPX06IHNwZWNpZmllcyB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpc1xuICAgKiAgICAgcGFyYW1ldGVyLiAgVGhpcyBpbXBsaWNpdGx5IHNldHMgdGhpcyBwYXJhbWV0ZXIgYXMgb3B0aW9uYWwuXG4gICAqXG4gICAqICAgICBXaGVuIFVJLVJvdXRlciByb3V0ZXMgdG8gYSBzdGF0ZSBhbmQgbm8gdmFsdWUgaXNcbiAgICogICAgIHNwZWNpZmllZCBmb3IgdGhpcyBwYXJhbWV0ZXIgaW4gdGhlIFVSTCBvciB0cmFuc2l0aW9uLCB0aGVcbiAgICogICAgIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkIGluc3RlYWQuICBJZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sXG4gICAqICAgICBpdCB3aWxsIGJlIGluamVjdGVkIGFuZCBpbnZva2VkLCBhbmQgdGhlIHJldHVybiB2YWx1ZSB1c2VkLlxuICAgKlxuICAgKiAgICAgKk5vdGUqOiBgdW5kZWZpbmVkYCBpcyB0cmVhdGVkIGFzIFwibm8gZGVmYXVsdCB2YWx1ZVwiIHdoaWxlIGBudWxsYFxuICAgKiAgICAgaXMgdHJlYXRlZCBhcyBcInRoZSBkZWZhdWx0IHZhbHVlIGlzIGBudWxsYFwiLlxuICAgKlxuICAgKiAgICAgKlNob3J0aGFuZCo6IElmIHlvdSBvbmx5IG5lZWQgdG8gY29uZmlndXJlIHRoZSBkZWZhdWx0IHZhbHVlIG9mIHRoZVxuICAgKiAgICAgcGFyYW1ldGVyLCB5b3UgbWF5IHVzZSBhIHNob3J0aGFuZCBzeW50YXguICAgSW4gdGhlICoqYHBhcmFtc2AqKlxuICAgKiAgICAgbWFwLCBpbnN0ZWFkIG1hcHBpbmcgdGhlIHBhcmFtIG5hbWUgdG8gYSBmdWxsIHBhcmFtZXRlciBjb25maWd1cmF0aW9uXG4gICAqICAgICBvYmplY3QsIHNpbXBseSBzZXQgbWFwIGl0IHRvIHRoZSBkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZSwgZS5nLjpcbiAgICpcbiAgICogPHByZT4vLyBkZWZpbmUgYSBwYXJhbWV0ZXIncyBkZWZhdWx0IHZhbHVlXG4gICAqIHBhcmFtczoge1xuICAgKiAgICAgcGFyYW0xOiB7IHZhbHVlOiBcImRlZmF1bHRWYWx1ZVwiIH1cbiAgICogfVxuICAgKiAvLyBzaG9ydGhhbmQgZGVmYXVsdCB2YWx1ZXNcbiAgICogcGFyYW1zOiB7XG4gICAqICAgICBwYXJhbTE6IFwiZGVmYXVsdFZhbHVlXCIsXG4gICAqICAgICBwYXJhbTI6IFwicGFyYW0yRGVmYXVsdFwiXG4gICAqIH08L3ByZT5cbiAgICpcbiAgICogICAtICoqIGFycmF5ICoqIC0ge2Jvb2xlYW49fTogKihkZWZhdWx0OiBmYWxzZSkqIElmIHRydWUsIHRoZSBwYXJhbSB2YWx1ZSB3aWxsIGJlXG4gICAqICAgICB0cmVhdGVkIGFzIGFuIGFycmF5IG9mIHZhbHVlcy4gIElmIHlvdSBzcGVjaWZpZWQgYSBUeXBlLCB0aGUgdmFsdWUgd2lsbCBiZVxuICAgKiAgICAgdHJlYXRlZCBhcyBhbiBhcnJheSBvZiB0aGUgc3BlY2lmaWVkIFR5cGUuICBOb3RlOiBxdWVyeSBwYXJhbWV0ZXIgdmFsdWVzXG4gICAqICAgICBkZWZhdWx0IHRvIGEgc3BlY2lhbCBgXCJhdXRvXCJgIG1vZGUuXG4gICAqXG4gICAqICAgICBGb3IgcXVlcnkgcGFyYW1ldGVycyBpbiBgXCJhdXRvXCJgIG1vZGUsIGlmIG11bHRpcGxlICB2YWx1ZXMgZm9yIGEgc2luZ2xlIHBhcmFtZXRlclxuICAgKiAgICAgYXJlIHByZXNlbnQgaW4gdGhlIFVSTCAoZS5nLjogYC9mb28/YmFyPTEmYmFyPTImYmFyPTNgKSB0aGVuIHRoZSB2YWx1ZXNcbiAgICogICAgIGFyZSBtYXBwZWQgdG8gYW4gYXJyYXkgKGUuZy46IGB7IGZvbzogWyAnMScsICcyJywgJzMnIF0gfWApLiAgSG93ZXZlciwgaWZcbiAgICogICAgIG9ubHkgb25lIHZhbHVlIGlzIHByZXNlbnQgKGUuZy46IGAvZm9vP2Jhcj0xYCkgdGhlbiB0aGUgdmFsdWUgaXMgdHJlYXRlZCBhcyBzaW5nbGVcbiAgICogICAgIHZhbHVlIChlLmcuOiBgeyBmb286ICcxJyB9YCkuXG4gICAqXG4gICAqIDxwcmU+cGFyYW1zOiB7XG4gICAqICAgICBwYXJhbTE6IHsgYXJyYXk6IHRydWUgfVxuICAgKiB9PC9wcmU+XG4gICAqXG4gICAqICAgLSAqKiBzcXVhc2ggKiogLSB7Ym9vbHxzdHJpbmc9fTogYHNxdWFzaGAgY29uZmlndXJlcyBob3cgYSBkZWZhdWx0IHBhcmFtZXRlciB2YWx1ZSBpcyByZXByZXNlbnRlZCBpbiB0aGUgVVJMIHdoZW5cbiAgICogICAgIHRoZSBjdXJyZW50IHBhcmFtZXRlciB2YWx1ZSBpcyB0aGUgc2FtZSBhcyB0aGUgZGVmYXVsdCB2YWx1ZS4gSWYgYHNxdWFzaGAgaXMgbm90IHNldCwgaXQgdXNlcyB0aGVcbiAgICogICAgIGNvbmZpZ3VyZWQgZGVmYXVsdCBzcXVhc2ggcG9saWN5LlxuICAgKiAgICAgKFNlZSB7QGxpbmsgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I21ldGhvZHNfZGVmYXVsdFNxdWFzaFBvbGljeSBgZGVmYXVsdFNxdWFzaFBvbGljeSgpYH0pXG4gICAqXG4gICAqICAgVGhlcmUgYXJlIHRocmVlIHNxdWFzaCBzZXR0aW5nczpcbiAgICpcbiAgICogICAgIC0gZmFsc2U6IFRoZSBwYXJhbWV0ZXIncyBkZWZhdWx0IHZhbHVlIGlzIG5vdCBzcXVhc2hlZC4gIEl0IGlzIGVuY29kZWQgYW5kIGluY2x1ZGVkIGluIHRoZSBVUkxcbiAgICogICAgIC0gdHJ1ZTogVGhlIHBhcmFtZXRlcidzIGRlZmF1bHQgdmFsdWUgaXMgb21pdHRlZCBmcm9tIHRoZSBVUkwuICBJZiB0aGUgcGFyYW1ldGVyIGlzIHByZWNlZWRlZCBhbmQgZm9sbG93ZWRcbiAgICogICAgICAgYnkgc2xhc2hlcyBpbiB0aGUgc3RhdGUncyBgdXJsYCBkZWNsYXJhdGlvbiwgdGhlbiBvbmUgb2YgdGhvc2Ugc2xhc2hlcyBhcmUgb21pdHRlZC5cbiAgICogICAgICAgVGhpcyBjYW4gYWxsb3cgZm9yIGNsZWFuZXIgbG9va2luZyBVUkxzLlxuICAgKiAgICAgLSBgXCI8YXJiaXRyYXJ5IHN0cmluZz5cImA6IFRoZSBwYXJhbWV0ZXIncyBkZWZhdWx0IHZhbHVlIGlzIHJlcGxhY2VkIHdpdGggYW4gYXJiaXRyYXJ5IHBsYWNlaG9sZGVyIG9mICB5b3VyIGNob2ljZS5cbiAgICpcbiAgICogPHByZT5wYXJhbXM6IHtcbiAgICogICAgIHBhcmFtMToge1xuICAgKiAgICAgICB2YWx1ZTogXCJkZWZhdWx0SWRcIixcbiAgICogICAgICAgc3F1YXNoOiB0cnVlXG4gICAqIH0gfVxuICAgKiAvLyBzcXVhc2ggXCJkZWZhdWx0VmFsdWVcIiB0byBcIn5cIlxuICAgKiBwYXJhbXM6IHtcbiAgICogICAgIHBhcmFtMToge1xuICAgKiAgICAgICB2YWx1ZTogXCJkZWZhdWx0VmFsdWVcIixcbiAgICogICAgICAgc3F1YXNoOiBcIn5cIlxuICAgKiB9IH1cbiAgICogPC9wcmU+XG4gICAqXG4gICAqXG4gICAqIEBleGFtcGxlXG4gICAqIDxwcmU+XG4gICAqIC8vIFNvbWUgc3RhdGUgbmFtZSBleGFtcGxlc1xuICAgKlxuICAgKiAvLyBzdGF0ZU5hbWUgY2FuIGJlIGEgc2luZ2xlIHRvcC1sZXZlbCBuYW1lIChtdXN0IGJlIHVuaXF1ZSkuXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZVwiLCB7fSk7XG4gICAqXG4gICAqIC8vIE9yIGl0IGNhbiBiZSBhIG5lc3RlZCBzdGF0ZSBuYW1lLiBUaGlzIHN0YXRlIGlzIGEgY2hpbGQgb2YgdGhlXG4gICAqIC8vIGFib3ZlIFwiaG9tZVwiIHN0YXRlLlxuICAgKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWUubmV3ZXN0XCIsIHt9KTtcbiAgICpcbiAgICogLy8gTmVzdCBzdGF0ZXMgYXMgZGVlcGx5IGFzIG5lZWRlZC5cbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lLm5ld2VzdC5hYmMueHl6LmluY2VwdGlvblwiLCB7fSk7XG4gICAqXG4gICAqIC8vIHN0YXRlKCkgcmV0dXJucyAkc3RhdGVQcm92aWRlciwgc28geW91IGNhbiBjaGFpbiBzdGF0ZSBkZWNsYXJhdGlvbnMuXG4gICAqICRzdGF0ZVByb3ZpZGVyXG4gICAqICAgLnN0YXRlKFwiaG9tZVwiLCB7fSlcbiAgICogICAuc3RhdGUoXCJhYm91dFwiLCB7fSlcbiAgICogICAuc3RhdGUoXCJjb250YWN0c1wiLCB7fSk7XG4gICAqIDwvcHJlPlxuICAgKlxuICAgKi9cbiAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xuICBmdW5jdGlvbiBzdGF0ZShuYW1lLCBkZWZpbml0aW9uKSB7XG4gICAgLypqc2hpbnQgdmFsaWR0aGlzOiB0cnVlICovXG4gICAgaWYgKGlzT2JqZWN0KG5hbWUpKSBkZWZpbml0aW9uID0gbmFtZTtcbiAgICBlbHNlIGRlZmluaXRpb24ubmFtZSA9IG5hbWU7XG4gICAgcmVnaXN0ZXJTdGF0ZShkZWZpbml0aW9uKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmdkb2Mgb2JqZWN0XG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICpcbiAgICogQHJlcXVpcmVzICRyb290U2NvcGVcbiAgICogQHJlcXVpcmVzICRxXG4gICAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHZpZXdcbiAgICogQHJlcXVpcmVzICRpbmplY3RvclxuICAgKiBAcmVxdWlyZXMgdWkucm91dGVyLnV0aWwuJHJlc29sdmVcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQYXJhbXNcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclxuICAgKlxuICAgKiBAcHJvcGVydHkge29iamVjdH0gcGFyYW1zIEEgcGFyYW0gb2JqZWN0LCBlLmcuIHtzZWN0aW9uSWQ6IHNlY3Rpb24uaWQpfSwgdGhhdCBcbiAgICogeW91J2QgbGlrZSB0byB0ZXN0IGFnYWluc3QgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlLlxuICAgKiBAcHJvcGVydHkge29iamVjdH0gY3VycmVudCBBIHJlZmVyZW5jZSB0byB0aGUgc3RhdGUncyBjb25maWcgb2JqZWN0LiBIb3dldmVyIFxuICAgKiB5b3UgcGFzc2VkIGl0IGluLiBVc2VmdWwgZm9yIGFjY2Vzc2luZyBjdXN0b20gZGF0YS5cbiAgICogQHByb3BlcnR5IHtvYmplY3R9IHRyYW5zaXRpb24gQ3VycmVudGx5IHBlbmRpbmcgdHJhbnNpdGlvbi4gQSBwcm9taXNlIHRoYXQnbGwgXG4gICAqIHJlc29sdmUgb3IgcmVqZWN0LlxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogYCRzdGF0ZWAgc2VydmljZSBpcyByZXNwb25zaWJsZSBmb3IgcmVwcmVzZW50aW5nIHN0YXRlcyBhcyB3ZWxsIGFzIHRyYW5zaXRpb25pbmdcbiAgICogYmV0d2VlbiB0aGVtLiBJdCBhbHNvIHByb3ZpZGVzIGludGVyZmFjZXMgdG8gYXNrIGZvciBjdXJyZW50IHN0YXRlIG9yIGV2ZW4gc3RhdGVzXG4gICAqIHlvdSdyZSBjb21pbmcgZnJvbS5cbiAgICovXG4gIHRoaXMuJGdldCA9ICRnZXQ7XG4gICRnZXQuJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckcScsICckdmlldycsICckaW5qZWN0b3InLCAnJHJlc29sdmUnLCAnJHN0YXRlUGFyYW1zJywgJyR1cmxSb3V0ZXInLCAnJGxvY2F0aW9uJywgJyR1cmxNYXRjaGVyRmFjdG9yeSddO1xuICBmdW5jdGlvbiAkZ2V0KCAgICRyb290U2NvcGUsICAgJHEsICAgJHZpZXcsICAgJGluamVjdG9yLCAgICRyZXNvbHZlLCAgICRzdGF0ZVBhcmFtcywgICAkdXJsUm91dGVyLCAgICRsb2NhdGlvbiwgICAkdXJsTWF0Y2hlckZhY3RvcnkpIHtcblxuICAgIHZhciBUcmFuc2l0aW9uU3VwZXJzZWRlZCA9ICRxLnJlamVjdChuZXcgRXJyb3IoJ3RyYW5zaXRpb24gc3VwZXJzZWRlZCcpKTtcbiAgICB2YXIgVHJhbnNpdGlvblByZXZlbnRlZCA9ICRxLnJlamVjdChuZXcgRXJyb3IoJ3RyYW5zaXRpb24gcHJldmVudGVkJykpO1xuICAgIHZhciBUcmFuc2l0aW9uQWJvcnRlZCA9ICRxLnJlamVjdChuZXcgRXJyb3IoJ3RyYW5zaXRpb24gYWJvcnRlZCcpKTtcbiAgICB2YXIgVHJhbnNpdGlvbkZhaWxlZCA9ICRxLnJlamVjdChuZXcgRXJyb3IoJ3RyYW5zaXRpb24gZmFpbGVkJykpO1xuXG4gICAgLy8gSGFuZGxlcyB0aGUgY2FzZSB3aGVyZSBhIHN0YXRlIHdoaWNoIGlzIHRoZSB0YXJnZXQgb2YgYSB0cmFuc2l0aW9uIGlzIG5vdCBmb3VuZCwgYW5kIHRoZSB1c2VyXG4gICAgLy8gY2FuIG9wdGlvbmFsbHkgcmV0cnkgb3IgZGVmZXIgdGhlIHRyYW5zaXRpb25cbiAgICBmdW5jdGlvbiBoYW5kbGVSZWRpcmVjdChyZWRpcmVjdCwgc3RhdGUsIHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZXZlbnRcbiAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjJHN0YXRlTm90Rm91bmRcbiAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgICAqIEBldmVudFR5cGUgYnJvYWRjYXN0IG9uIHJvb3Qgc2NvcGVcbiAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICogRmlyZWQgd2hlbiBhIHJlcXVlc3RlZCBzdGF0ZSAqKmNhbm5vdCBiZSBmb3VuZCoqIHVzaW5nIHRoZSBwcm92aWRlZCBzdGF0ZSBuYW1lIGR1cmluZyB0cmFuc2l0aW9uLlxuICAgICAgICogVGhlIGV2ZW50IGlzIGJyb2FkY2FzdCBhbGxvd2luZyBhbnkgaGFuZGxlcnMgYSBzaW5nbGUgY2hhbmNlIHRvIGRlYWwgd2l0aCB0aGUgZXJyb3IgKHVzdWFsbHkgYnlcbiAgICAgICAqIGxhenktbG9hZGluZyB0aGUgdW5mb3VuZCBzdGF0ZSkuIEEgc3BlY2lhbCBgdW5mb3VuZFN0YXRlYCBvYmplY3QgaXMgcGFzc2VkIHRvIHRoZSBsaXN0ZW5lciBoYW5kbGVyLFxuICAgICAgICogeW91IGNhbiBzZWUgaXRzIHRocmVlIHByb3BlcnRpZXMgaW4gdGhlIGV4YW1wbGUuIFlvdSBjYW4gdXNlIGBldmVudC5wcmV2ZW50RGVmYXVsdCgpYCB0byBhYm9ydCB0aGVcbiAgICAgICAqIHRyYW5zaXRpb24gYW5kIHRoZSBwcm9taXNlIHJldHVybmVkIGZyb20gYGdvYCB3aWxsIGJlIHJlamVjdGVkIHdpdGggYSBgJ3RyYW5zaXRpb24gYWJvcnRlZCdgIHZhbHVlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXG4gICAgICAgKiBAcGFyYW0ge09iamVjdH0gdW5mb3VuZFN0YXRlIFVuZm91bmQgU3RhdGUgaW5mb3JtYXRpb24uIENvbnRhaW5zOiBgdG8sIHRvUGFyYW1zLCBvcHRpb25zYCBwcm9wZXJ0aWVzLlxuICAgICAgICogQHBhcmFtIHtTdGF0ZX0gZnJvbVN0YXRlIEN1cnJlbnQgc3RhdGUgb2JqZWN0LlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGZyb21QYXJhbXMgQ3VycmVudCBzdGF0ZSBwYXJhbXMuXG4gICAgICAgKlxuICAgICAgICogQGV4YW1wbGVcbiAgICAgICAqXG4gICAgICAgKiA8cHJlPlxuICAgICAgICogLy8gc29tZXdoZXJlLCBhc3N1bWUgbGF6eS5zdGF0ZSBoYXMgbm90IGJlZW4gZGVmaW5lZFxuICAgICAgICogJHN0YXRlLmdvKFwibGF6eS5zdGF0ZVwiLCB7YToxLCBiOjJ9LCB7aW5oZXJpdDpmYWxzZX0pO1xuICAgICAgICpcbiAgICAgICAqIC8vIHNvbWV3aGVyZSBlbHNlXG4gICAgICAgKiAkc2NvcGUuJG9uKCckc3RhdGVOb3RGb3VuZCcsXG4gICAgICAgKiBmdW5jdGlvbihldmVudCwgdW5mb3VuZFN0YXRlLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMpe1xuICAgICAgICogICAgIGNvbnNvbGUubG9nKHVuZm91bmRTdGF0ZS50byk7IC8vIFwibGF6eS5zdGF0ZVwiXG4gICAgICAgKiAgICAgY29uc29sZS5sb2codW5mb3VuZFN0YXRlLnRvUGFyYW1zKTsgLy8ge2E6MSwgYjoyfVxuICAgICAgICogICAgIGNvbnNvbGUubG9nKHVuZm91bmRTdGF0ZS5vcHRpb25zKTsgLy8ge2luaGVyaXQ6ZmFsc2V9ICsgZGVmYXVsdCBvcHRpb25zXG4gICAgICAgKiB9KVxuICAgICAgICogPC9wcmU+XG4gICAgICAgKi9cbiAgICAgIHZhciBldnQgPSAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRzdGF0ZU5vdEZvdW5kJywgcmVkaXJlY3QsIHN0YXRlLCBwYXJhbXMpO1xuXG4gICAgICBpZiAoZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgJHVybFJvdXRlci51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25BYm9ydGVkO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWV2dC5yZXRyeSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gQWxsb3cgdGhlIGhhbmRsZXIgdG8gcmV0dXJuIGEgcHJvbWlzZSB0byBkZWZlciBzdGF0ZSBsb29rdXAgcmV0cnlcbiAgICAgIGlmIChvcHRpb25zLiRyZXRyeSkge1xuICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gVHJhbnNpdGlvbkZhaWxlZDtcbiAgICAgIH1cbiAgICAgIHZhciByZXRyeVRyYW5zaXRpb24gPSAkc3RhdGUudHJhbnNpdGlvbiA9ICRxLndoZW4oZXZ0LnJldHJ5KTtcblxuICAgICAgcmV0cnlUcmFuc2l0aW9uLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChyZXRyeVRyYW5zaXRpb24gIT09ICRzdGF0ZS50cmFuc2l0aW9uKSByZXR1cm4gVHJhbnNpdGlvblN1cGVyc2VkZWQ7XG4gICAgICAgIHJlZGlyZWN0Lm9wdGlvbnMuJHJldHJ5ID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuICRzdGF0ZS50cmFuc2l0aW9uVG8ocmVkaXJlY3QudG8sIHJlZGlyZWN0LnRvUGFyYW1zLCByZWRpcmVjdC5vcHRpb25zKTtcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gVHJhbnNpdGlvbkFib3J0ZWQ7XG4gICAgICB9KTtcbiAgICAgICR1cmxSb3V0ZXIudXBkYXRlKCk7XG5cbiAgICAgIHJldHVybiByZXRyeVRyYW5zaXRpb247XG4gICAgfVxuXG4gICAgcm9vdC5sb2NhbHMgPSB7IHJlc29sdmU6IG51bGwsIGdsb2JhbHM6IHsgJHN0YXRlUGFyYW1zOiB7fSB9IH07XG5cbiAgICAkc3RhdGUgPSB7XG4gICAgICBwYXJhbXM6IHt9LFxuICAgICAgY3VycmVudDogcm9vdC5zZWxmLFxuICAgICAgJGN1cnJlbnQ6IHJvb3QsXG4gICAgICB0cmFuc2l0aW9uOiBudWxsXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjcmVsb2FkXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIEEgbWV0aG9kIHRoYXQgZm9yY2UgcmVsb2FkcyB0aGUgY3VycmVudCBzdGF0ZS4gQWxsIHJlc29sdmVzIGFyZSByZS1yZXNvbHZlZCxcbiAgICAgKiBjb250cm9sbGVycyByZWluc3RhbnRpYXRlZCwgYW5kIGV2ZW50cyByZS1maXJlZC5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogPHByZT5cbiAgICAgKiB2YXIgYXBwIGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlciddKTtcbiAgICAgKlxuICAgICAqIGFwcC5jb250cm9sbGVyKCdjdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XG4gICAgICogICAkc2NvcGUucmVsb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgKiAgICAgJHN0YXRlLnJlbG9hZCgpO1xuICAgICAqICAgfVxuICAgICAqIH0pO1xuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogYHJlbG9hZCgpYCBpcyBqdXN0IGFuIGFsaWFzIGZvcjpcbiAgICAgKiA8cHJlPlxuICAgICAqICRzdGF0ZS50cmFuc2l0aW9uVG8oJHN0YXRlLmN1cnJlbnQsICRzdGF0ZVBhcmFtcywgeyBcbiAgICAgKiAgIHJlbG9hZDogdHJ1ZSwgaW5oZXJpdDogZmFsc2UsIG5vdGlmeTogdHJ1ZVxuICAgICAqIH0pO1xuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmc9fG9iamVjdD19IHN0YXRlIC0gQSBzdGF0ZSBuYW1lIG9yIGEgc3RhdGUgb2JqZWN0LCB3aGljaCBpcyB0aGUgcm9vdCBvZiB0aGUgcmVzb2x2ZXMgdG8gYmUgcmUtcmVzb2x2ZWQuXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiA8cHJlPlxuICAgICAqIC8vYXNzdW1pbmcgYXBwIGFwcGxpY2F0aW9uIGNvbnNpc3RzIG9mIDMgc3RhdGVzOiAnY29udGFjdHMnLCAnY29udGFjdHMuZGV0YWlsJywgJ2NvbnRhY3RzLmRldGFpbC5pdGVtJyBcbiAgICAgKiAvL2FuZCBjdXJyZW50IHN0YXRlIGlzICdjb250YWN0cy5kZXRhaWwuaXRlbSdcbiAgICAgKiB2YXIgYXBwIGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlciddKTtcbiAgICAgKlxuICAgICAqIGFwcC5jb250cm9sbGVyKCdjdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XG4gICAgICogICAkc2NvcGUucmVsb2FkID0gZnVuY3Rpb24oKXtcbiAgICAgKiAgICAgLy93aWxsIHJlbG9hZCAnY29udGFjdC5kZXRhaWwnIGFuZCAnY29udGFjdC5kZXRhaWwuaXRlbScgc3RhdGVzXG4gICAgICogICAgICRzdGF0ZS5yZWxvYWQoJ2NvbnRhY3QuZGV0YWlsJyk7XG4gICAgICogICB9XG4gICAgICogfSk7XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBgcmVsb2FkKClgIGlzIGp1c3QgYW4gYWxpYXMgZm9yOlxuICAgICAqIDxwcmU+XG4gICAgICogJHN0YXRlLnRyYW5zaXRpb25Ubygkc3RhdGUuY3VycmVudCwgJHN0YXRlUGFyYW1zLCB7IFxuICAgICAqICAgcmVsb2FkOiB0cnVlLCBpbmhlcml0OiBmYWxzZSwgbm90aWZ5OiB0cnVlXG4gICAgICogfSk7XG4gICAgICogPC9wcmU+XG5cbiAgICAgKiBAcmV0dXJucyB7cHJvbWlzZX0gQSBwcm9taXNlIHJlcHJlc2VudGluZyB0aGUgc3RhdGUgb2YgdGhlIG5ldyB0cmFuc2l0aW9uLiBTZWVcbiAgICAgKiB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nb30uXG4gICAgICovXG4gICAgJHN0YXRlLnJlbG9hZCA9IGZ1bmN0aW9uIHJlbG9hZChzdGF0ZSkge1xuICAgICAgcmV0dXJuICRzdGF0ZS50cmFuc2l0aW9uVG8oJHN0YXRlLmN1cnJlbnQsICRzdGF0ZVBhcmFtcywgeyByZWxvYWQ6IHN0YXRlIHx8IHRydWUsIGluaGVyaXQ6IGZhbHNlLCBub3RpZnk6IHRydWV9KTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNnb1xuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBDb252ZW5pZW5jZSBtZXRob2QgZm9yIHRyYW5zaXRpb25pbmcgdG8gYSBuZXcgc3RhdGUuIGAkc3RhdGUuZ29gIGNhbGxzIFxuICAgICAqIGAkc3RhdGUudHJhbnNpdGlvblRvYCBpbnRlcm5hbGx5IGJ1dCBhdXRvbWF0aWNhbGx5IHNldHMgb3B0aW9ucyB0byBcbiAgICAgKiBgeyBsb2NhdGlvbjogdHJ1ZSwgaW5oZXJpdDogdHJ1ZSwgcmVsYXRpdmU6ICRzdGF0ZS4kY3VycmVudCwgbm90aWZ5OiB0cnVlIH1gLiBcbiAgICAgKiBUaGlzIGFsbG93cyB5b3UgdG8gZWFzaWx5IHVzZSBhbiBhYnNvbHV0ZSBvciByZWxhdGl2ZSB0byBwYXRoIGFuZCBzcGVjaWZ5IFxuICAgICAqIG9ubHkgdGhlIHBhcmFtZXRlcnMgeW91J2QgbGlrZSB0byB1cGRhdGUgKHdoaWxlIGxldHRpbmcgdW5zcGVjaWZpZWQgcGFyYW1ldGVycyBcbiAgICAgKiBpbmhlcml0IGZyb20gdGhlIGN1cnJlbnRseSBhY3RpdmUgYW5jZXN0b3Igc3RhdGVzKS5cbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogPHByZT5cbiAgICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJ10pO1xuICAgICAqXG4gICAgICogYXBwLmNvbnRyb2xsZXIoJ2N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUpIHtcbiAgICAgKiAgICRzY29wZS5jaGFuZ2VTdGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgKiAgICAgJHN0YXRlLmdvKCdjb250YWN0LmRldGFpbCcpO1xuICAgICAqICAgfTtcbiAgICAgKiB9KTtcbiAgICAgKiA8L3ByZT5cbiAgICAgKiA8aW1nIHNyYz0nLi4vbmdkb2NfYXNzZXRzL1N0YXRlR29FeGFtcGxlcy5wbmcnLz5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0byBBYnNvbHV0ZSBzdGF0ZSBuYW1lIG9yIHJlbGF0aXZlIHN0YXRlIHBhdGguIFNvbWUgZXhhbXBsZXM6XG4gICAgICpcbiAgICAgKiAtIGAkc3RhdGUuZ28oJ2NvbnRhY3QuZGV0YWlsJylgIC0gd2lsbCBnbyB0byB0aGUgYGNvbnRhY3QuZGV0YWlsYCBzdGF0ZVxuICAgICAqIC0gYCRzdGF0ZS5nbygnXicpYCAtIHdpbGwgZ28gdG8gYSBwYXJlbnQgc3RhdGVcbiAgICAgKiAtIGAkc3RhdGUuZ28oJ14uc2libGluZycpYCAtIHdpbGwgZ28gdG8gYSBzaWJsaW5nIHN0YXRlXG4gICAgICogLSBgJHN0YXRlLmdvKCcuY2hpbGQuZ3JhbmRjaGlsZCcpYCAtIHdpbGwgZ28gdG8gZ3JhbmRjaGlsZCBzdGF0ZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQSBtYXAgb2YgdGhlIHBhcmFtZXRlcnMgdGhhdCB3aWxsIGJlIHNlbnQgdG8gdGhlIHN0YXRlLCBcbiAgICAgKiB3aWxsIHBvcHVsYXRlICRzdGF0ZVBhcmFtcy4gQW55IHBhcmFtZXRlcnMgdGhhdCBhcmUgbm90IHNwZWNpZmllZCB3aWxsIGJlIGluaGVyaXRlZCBmcm9tIGN1cnJlbnRseSBcbiAgICAgKiBkZWZpbmVkIHBhcmFtZXRlcnMuIE9ubHkgcGFyYW1ldGVycyBzcGVjaWZpZWQgaW4gdGhlIHN0YXRlIGRlZmluaXRpb24gY2FuIGJlIG92ZXJyaWRkZW4sIG5ldyBcbiAgICAgKiBwYXJhbWV0ZXJzIHdpbGwgYmUgaWdub3JlZC4gVGhpcyBhbGxvd3MsIGZvciBleGFtcGxlLCBnb2luZyB0byBhIHNpYmxpbmcgc3RhdGUgdGhhdCBzaGFyZXMgcGFyYW1ldGVyc1xuICAgICAqIHNwZWNpZmllZCBpbiBhIHBhcmVudCBzdGF0ZS4gUGFyYW1ldGVyIGluaGVyaXRhbmNlIG9ubHkgd29ya3MgYmV0d2VlbiBjb21tb24gYW5jZXN0b3Igc3RhdGVzLCBJLmUuXG4gICAgICogdHJhbnNpdGlvbmluZyB0byBhIHNpYmxpbmcgd2lsbCBnZXQgeW91IHRoZSBwYXJhbWV0ZXJzIGZvciBhbGwgcGFyZW50cywgdHJhbnNpdGlvbmluZyB0byBhIGNoaWxkXG4gICAgICogd2lsbCBnZXQgeW91IGFsbCBjdXJyZW50IHBhcmFtZXRlcnMsIGV0Yy5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IG9wdGlvbnMgT3B0aW9ucyBvYmplY3QuIFRoZSBvcHRpb25zIGFyZTpcbiAgICAgKlxuICAgICAqIC0gKipgbG9jYXRpb25gKiogLSB7Ym9vbGVhbj10cnVlfHN0cmluZz19IC0gSWYgYHRydWVgIHdpbGwgdXBkYXRlIHRoZSB1cmwgaW4gdGhlIGxvY2F0aW9uIGJhciwgaWYgYGZhbHNlYFxuICAgICAqICAgIHdpbGwgbm90LiBJZiBzdHJpbmcsIG11c3QgYmUgYFwicmVwbGFjZVwiYCwgd2hpY2ggd2lsbCB1cGRhdGUgdXJsIGFuZCBhbHNvIHJlcGxhY2UgbGFzdCBoaXN0b3J5IHJlY29yZC5cbiAgICAgKiAtICoqYGluaGVyaXRgKiogLSB7Ym9vbGVhbj10cnVlfSwgSWYgYHRydWVgIHdpbGwgaW5oZXJpdCB1cmwgcGFyYW1ldGVycyBmcm9tIGN1cnJlbnQgdXJsLlxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7b2JqZWN0PSRzdGF0ZS4kY3VycmVudH0sIFdoZW4gdHJhbnNpdGlvbmluZyB3aXRoIHJlbGF0aXZlIHBhdGggKGUuZyAnXicpLCBcbiAgICAgKiAgICBkZWZpbmVzIHdoaWNoIHN0YXRlIHRvIGJlIHJlbGF0aXZlIGZyb20uXG4gICAgICogLSAqKmBub3RpZnlgKiogLSB7Ym9vbGVhbj10cnVlfSwgSWYgYHRydWVgIHdpbGwgYnJvYWRjYXN0ICRzdGF0ZUNoYW5nZVN0YXJ0IGFuZCAkc3RhdGVDaGFuZ2VTdWNjZXNzIGV2ZW50cy5cbiAgICAgKiAtICoqYHJlbG9hZGAqKiAodjAuMi41KSAtIHtib29sZWFuPWZhbHNlfHN0cmluZ3xvYmplY3R9LCBJZiBgdHJ1ZWAgd2lsbCBmb3JjZSB0cmFuc2l0aW9uIGV2ZW4gaWYgbm8gc3RhdGUgb3IgcGFyYW1zXG4gICAgICogICAgaGF2ZSBjaGFuZ2VkLiAgSXQgd2lsbCByZWxvYWQgdGhlIHJlc29sdmVzIGFuZCB2aWV3cyBvZiB0aGUgY3VycmVudCBzdGF0ZSBhbmQgcGFyZW50IHN0YXRlcy5cbiAgICAgKiAgICBJZiBgcmVsb2FkYCBpcyBhIHN0cmluZyAob3Igc3RhdGUgb2JqZWN0KSwgdGhlIHN0YXRlIG9iamVjdCBpcyBmZXRjaGVkIChieSBuYW1lLCBvciBvYmplY3QgcmVmZXJlbmNlKTsgYW5kIFxcXG4gICAgICogICAgdGhlIHRyYW5zaXRpb24gcmVsb2FkcyB0aGUgcmVzb2x2ZXMgYW5kIHZpZXdzIGZvciB0aGF0IG1hdGNoZWQgc3RhdGUsIGFuZCBhbGwgaXRzIGNoaWxkcmVuIHN0YXRlcy5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtwcm9taXNlfSBBIHByb21pc2UgcmVwcmVzZW50aW5nIHRoZSBzdGF0ZSBvZiB0aGUgbmV3IHRyYW5zaXRpb24uXG4gICAgICpcbiAgICAgKiBQb3NzaWJsZSBzdWNjZXNzIHZhbHVlczpcbiAgICAgKlxuICAgICAqIC0gJHN0YXRlLmN1cnJlbnRcbiAgICAgKlxuICAgICAqIDxici8+UG9zc2libGUgcmVqZWN0aW9uIHZhbHVlczpcbiAgICAgKlxuICAgICAqIC0gJ3RyYW5zaXRpb24gc3VwZXJzZWRlZCcgLSB3aGVuIGEgbmV3ZXIgdHJhbnNpdGlvbiBoYXMgYmVlbiBzdGFydGVkIGFmdGVyIHRoaXMgb25lXG4gICAgICogLSAndHJhbnNpdGlvbiBwcmV2ZW50ZWQnIC0gd2hlbiBgZXZlbnQucHJldmVudERlZmF1bHQoKWAgaGFzIGJlZW4gY2FsbGVkIGluIGEgYCRzdGF0ZUNoYW5nZVN0YXJ0YCBsaXN0ZW5lclxuICAgICAqIC0gJ3RyYW5zaXRpb24gYWJvcnRlZCcgLSB3aGVuIGBldmVudC5wcmV2ZW50RGVmYXVsdCgpYCBoYXMgYmVlbiBjYWxsZWQgaW4gYSBgJHN0YXRlTm90Rm91bmRgIGxpc3RlbmVyIG9yXG4gICAgICogICB3aGVuIGEgYCRzdGF0ZU5vdEZvdW5kYCBgZXZlbnQucmV0cnlgIHByb21pc2UgZXJyb3JzLlxuICAgICAqIC0gJ3RyYW5zaXRpb24gZmFpbGVkJyAtIHdoZW4gYSBzdGF0ZSBoYXMgYmVlbiB1bnN1Y2Nlc3NmdWxseSBmb3VuZCBhZnRlciAyIHRyaWVzLlxuICAgICAqIC0gKnJlc29sdmUgZXJyb3IqIC0gd2hlbiBhbiBlcnJvciBoYXMgb2NjdXJyZWQgd2l0aCBhIGByZXNvbHZlYFxuICAgICAqXG4gICAgICovXG4gICAgJHN0YXRlLmdvID0gZnVuY3Rpb24gZ28odG8sIHBhcmFtcywgb3B0aW9ucykge1xuICAgICAgcmV0dXJuICRzdGF0ZS50cmFuc2l0aW9uVG8odG8sIHBhcmFtcywgZXh0ZW5kKHsgaW5oZXJpdDogdHJ1ZSwgcmVsYXRpdmU6ICRzdGF0ZS4kY3VycmVudCB9LCBvcHRpb25zKSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjdHJhbnNpdGlvblRvXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIExvdy1sZXZlbCBtZXRob2QgZm9yIHRyYW5zaXRpb25pbmcgdG8gYSBuZXcgc3RhdGUuIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfZ28gJHN0YXRlLmdvfVxuICAgICAqIHVzZXMgYHRyYW5zaXRpb25Ub2AgaW50ZXJuYWxseS4gYCRzdGF0ZS5nb2AgaXMgcmVjb21tZW5kZWQgaW4gbW9zdCBzaXR1YXRpb25zLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiA8cHJlPlxuICAgICAqIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXInXSk7XG4gICAgICpcbiAgICAgKiBhcHAuY29udHJvbGxlcignY3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSkge1xuICAgICAqICAgJHNjb3BlLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAqICAgICAkc3RhdGUudHJhbnNpdGlvblRvKCdjb250YWN0LmRldGFpbCcpO1xuICAgICAqICAgfTtcbiAgICAgKiB9KTtcbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0byBTdGF0ZSBuYW1lLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gdG9QYXJhbXMgQSBtYXAgb2YgdGhlIHBhcmFtZXRlcnMgdGhhdCB3aWxsIGJlIHNlbnQgdG8gdGhlIHN0YXRlLFxuICAgICAqIHdpbGwgcG9wdWxhdGUgJHN0YXRlUGFyYW1zLlxuICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0aW9ucyBPcHRpb25zIG9iamVjdC4gVGhlIG9wdGlvbnMgYXJlOlxuICAgICAqXG4gICAgICogLSAqKmBsb2NhdGlvbmAqKiAtIHtib29sZWFuPXRydWV8c3RyaW5nPX0gLSBJZiBgdHJ1ZWAgd2lsbCB1cGRhdGUgdGhlIHVybCBpbiB0aGUgbG9jYXRpb24gYmFyLCBpZiBgZmFsc2VgXG4gICAgICogICAgd2lsbCBub3QuIElmIHN0cmluZywgbXVzdCBiZSBgXCJyZXBsYWNlXCJgLCB3aGljaCB3aWxsIHVwZGF0ZSB1cmwgYW5kIGFsc28gcmVwbGFjZSBsYXN0IGhpc3RvcnkgcmVjb3JkLlxuICAgICAqIC0gKipgaW5oZXJpdGAqKiAtIHtib29sZWFuPWZhbHNlfSwgSWYgYHRydWVgIHdpbGwgaW5oZXJpdCB1cmwgcGFyYW1ldGVycyBmcm9tIGN1cnJlbnQgdXJsLlxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7b2JqZWN0PX0sIFdoZW4gdHJhbnNpdGlvbmluZyB3aXRoIHJlbGF0aXZlIHBhdGggKGUuZyAnXicpLCBcbiAgICAgKiAgICBkZWZpbmVzIHdoaWNoIHN0YXRlIHRvIGJlIHJlbGF0aXZlIGZyb20uXG4gICAgICogLSAqKmBub3RpZnlgKiogLSB7Ym9vbGVhbj10cnVlfSwgSWYgYHRydWVgIHdpbGwgYnJvYWRjYXN0ICRzdGF0ZUNoYW5nZVN0YXJ0IGFuZCAkc3RhdGVDaGFuZ2VTdWNjZXNzIGV2ZW50cy5cbiAgICAgKiAtICoqYHJlbG9hZGAqKiAodjAuMi41KSAtIHtib29sZWFuPWZhbHNlfHN0cmluZz18b2JqZWN0PX0sIElmIGB0cnVlYCB3aWxsIGZvcmNlIHRyYW5zaXRpb24gZXZlbiBpZiB0aGUgc3RhdGUgb3IgcGFyYW1zIFxuICAgICAqICAgIGhhdmUgbm90IGNoYW5nZWQsIGFrYSBhIHJlbG9hZCBvZiB0aGUgc2FtZSBzdGF0ZS4gSXQgZGlmZmVycyBmcm9tIHJlbG9hZE9uU2VhcmNoIGJlY2F1c2UgeW91J2RcbiAgICAgKiAgICB1c2UgdGhpcyB3aGVuIHlvdSB3YW50IHRvIGZvcmNlIGEgcmVsb2FkIHdoZW4gKmV2ZXJ5dGhpbmcqIGlzIHRoZSBzYW1lLCBpbmNsdWRpbmcgc2VhcmNoIHBhcmFtcy5cbiAgICAgKiAgICBpZiBTdHJpbmcsIHRoZW4gd2lsbCByZWxvYWQgdGhlIHN0YXRlIHdpdGggdGhlIG5hbWUgZ2l2ZW4gaW4gcmVsb2FkLCBhbmQgYW55IGNoaWxkcmVuLlxuICAgICAqICAgIGlmIE9iamVjdCwgdGhlbiBhIHN0YXRlT2JqIGlzIGV4cGVjdGVkLCB3aWxsIHJlbG9hZCB0aGUgc3RhdGUgZm91bmQgaW4gc3RhdGVPYmosIGFuZCBhbnkgY2hpbGRyZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7cHJvbWlzZX0gQSBwcm9taXNlIHJlcHJlc2VudGluZyB0aGUgc3RhdGUgb2YgdGhlIG5ldyB0cmFuc2l0aW9uLiBTZWVcbiAgICAgKiB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nb30uXG4gICAgICovXG4gICAgJHN0YXRlLnRyYW5zaXRpb25UbyA9IGZ1bmN0aW9uIHRyYW5zaXRpb25Ubyh0bywgdG9QYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgIHRvUGFyYW1zID0gdG9QYXJhbXMgfHwge307XG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHtcbiAgICAgICAgbG9jYXRpb246IHRydWUsIGluaGVyaXQ6IGZhbHNlLCByZWxhdGl2ZTogbnVsbCwgbm90aWZ5OiB0cnVlLCByZWxvYWQ6IGZhbHNlLCAkcmV0cnk6IGZhbHNlXG4gICAgICB9LCBvcHRpb25zIHx8IHt9KTtcblxuICAgICAgdmFyIGZyb20gPSAkc3RhdGUuJGN1cnJlbnQsIGZyb21QYXJhbXMgPSAkc3RhdGUucGFyYW1zLCBmcm9tUGF0aCA9IGZyb20ucGF0aDtcbiAgICAgIHZhciBldnQsIHRvU3RhdGUgPSBmaW5kU3RhdGUodG8sIG9wdGlvbnMucmVsYXRpdmUpO1xuXG4gICAgICAvLyBTdG9yZSB0aGUgaGFzaCBwYXJhbSBmb3IgbGF0ZXIgKHNpbmNlIGl0IHdpbGwgYmUgc3RyaXBwZWQgb3V0IGJ5IHZhcmlvdXMgbWV0aG9kcylcbiAgICAgIHZhciBoYXNoID0gdG9QYXJhbXNbJyMnXTtcblxuICAgICAgaWYgKCFpc0RlZmluZWQodG9TdGF0ZSkpIHtcbiAgICAgICAgdmFyIHJlZGlyZWN0ID0geyB0bzogdG8sIHRvUGFyYW1zOiB0b1BhcmFtcywgb3B0aW9uczogb3B0aW9ucyB9O1xuICAgICAgICB2YXIgcmVkaXJlY3RSZXN1bHQgPSBoYW5kbGVSZWRpcmVjdChyZWRpcmVjdCwgZnJvbS5zZWxmLCBmcm9tUGFyYW1zLCBvcHRpb25zKTtcblxuICAgICAgICBpZiAocmVkaXJlY3RSZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVkaXJlY3RSZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBbHdheXMgcmV0cnkgb25jZSBpZiB0aGUgJHN0YXRlTm90Rm91bmQgd2FzIG5vdCBwcmV2ZW50ZWRcbiAgICAgICAgLy8gKGhhbmRsZXMgZWl0aGVyIHJlZGlyZWN0IGNoYW5nZWQgb3Igc3RhdGUgbGF6eS1kZWZpbml0aW9uKVxuICAgICAgICB0byA9IHJlZGlyZWN0LnRvO1xuICAgICAgICB0b1BhcmFtcyA9IHJlZGlyZWN0LnRvUGFyYW1zO1xuICAgICAgICBvcHRpb25zID0gcmVkaXJlY3Qub3B0aW9ucztcbiAgICAgICAgdG9TdGF0ZSA9IGZpbmRTdGF0ZSh0bywgb3B0aW9ucy5yZWxhdGl2ZSk7XG5cbiAgICAgICAgaWYgKCFpc0RlZmluZWQodG9TdGF0ZSkpIHtcbiAgICAgICAgICBpZiAoIW9wdGlvbnMucmVsYXRpdmUpIHRocm93IG5ldyBFcnJvcihcIk5vIHN1Y2ggc3RhdGUgJ1wiICsgdG8gKyBcIidcIik7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IHJlc29sdmUgJ1wiICsgdG8gKyBcIicgZnJvbSBzdGF0ZSAnXCIgKyBvcHRpb25zLnJlbGF0aXZlICsgXCInXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodG9TdGF0ZVthYnN0cmFjdEtleV0pIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCB0cmFuc2l0aW9uIHRvIGFic3RyYWN0IHN0YXRlICdcIiArIHRvICsgXCInXCIpO1xuICAgICAgaWYgKG9wdGlvbnMuaW5oZXJpdCkgdG9QYXJhbXMgPSBpbmhlcml0UGFyYW1zKCRzdGF0ZVBhcmFtcywgdG9QYXJhbXMgfHwge30sICRzdGF0ZS4kY3VycmVudCwgdG9TdGF0ZSk7XG4gICAgICBpZiAoIXRvU3RhdGUucGFyYW1zLiQkdmFsaWRhdGVzKHRvUGFyYW1zKSkgcmV0dXJuIFRyYW5zaXRpb25GYWlsZWQ7XG5cbiAgICAgIHRvUGFyYW1zID0gdG9TdGF0ZS5wYXJhbXMuJCR2YWx1ZXModG9QYXJhbXMpO1xuICAgICAgdG8gPSB0b1N0YXRlO1xuXG4gICAgICB2YXIgdG9QYXRoID0gdG8ucGF0aDtcblxuICAgICAgLy8gU3RhcnRpbmcgZnJvbSB0aGUgcm9vdCBvZiB0aGUgcGF0aCwga2VlcCBhbGwgbGV2ZWxzIHRoYXQgaGF2ZW4ndCBjaGFuZ2VkXG4gICAgICB2YXIga2VlcCA9IDAsIHN0YXRlID0gdG9QYXRoW2tlZXBdLCBsb2NhbHMgPSByb290LmxvY2FscywgdG9Mb2NhbHMgPSBbXTtcblxuICAgICAgaWYgKCFvcHRpb25zLnJlbG9hZCkge1xuICAgICAgICB3aGlsZSAoc3RhdGUgJiYgc3RhdGUgPT09IGZyb21QYXRoW2tlZXBdICYmIHN0YXRlLm93blBhcmFtcy4kJGVxdWFscyh0b1BhcmFtcywgZnJvbVBhcmFtcykpIHtcbiAgICAgICAgICBsb2NhbHMgPSB0b0xvY2Fsc1trZWVwXSA9IHN0YXRlLmxvY2FscztcbiAgICAgICAgICBrZWVwKys7XG4gICAgICAgICAgc3RhdGUgPSB0b1BhdGhba2VlcF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXNTdHJpbmcob3B0aW9ucy5yZWxvYWQpIHx8IGlzT2JqZWN0KG9wdGlvbnMucmVsb2FkKSkge1xuICAgICAgICBpZiAoaXNPYmplY3Qob3B0aW9ucy5yZWxvYWQpICYmICFvcHRpb25zLnJlbG9hZC5uYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHJlbG9hZCBzdGF0ZSBvYmplY3QnKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHJlbG9hZFN0YXRlID0gb3B0aW9ucy5yZWxvYWQgPT09IHRydWUgPyBmcm9tUGF0aFswXSA6IGZpbmRTdGF0ZShvcHRpb25zLnJlbG9hZCk7XG4gICAgICAgIGlmIChvcHRpb25zLnJlbG9hZCAmJiAhcmVsb2FkU3RhdGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWNoIHJlbG9hZCBzdGF0ZSAnXCIgKyAoaXNTdHJpbmcob3B0aW9ucy5yZWxvYWQpID8gb3B0aW9ucy5yZWxvYWQgOiBvcHRpb25zLnJlbG9hZC5uYW1lKSArIFwiJ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChzdGF0ZSAmJiBzdGF0ZSA9PT0gZnJvbVBhdGhba2VlcF0gJiYgc3RhdGUgIT09IHJlbG9hZFN0YXRlKSB7XG4gICAgICAgICAgbG9jYWxzID0gdG9Mb2NhbHNba2VlcF0gPSBzdGF0ZS5sb2NhbHM7XG4gICAgICAgICAga2VlcCsrO1xuICAgICAgICAgIHN0YXRlID0gdG9QYXRoW2tlZXBdO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlJ3JlIGdvaW5nIHRvIHRoZSBzYW1lIHN0YXRlIGFuZCBhbGwgbG9jYWxzIGFyZSBrZXB0LCB3ZSd2ZSBnb3Qgbm90aGluZyB0byBkby5cbiAgICAgIC8vIEJ1dCBjbGVhciAndHJhbnNpdGlvbicsIGFzIHdlIHN0aWxsIHdhbnQgdG8gY2FuY2VsIGFueSBvdGhlciBwZW5kaW5nIHRyYW5zaXRpb25zLlxuICAgICAgLy8gVE9ETzogV2UgbWF5IG5vdCB3YW50IHRvIGJ1bXAgJ3RyYW5zaXRpb24nIGlmIHdlJ3JlIGNhbGxlZCBmcm9tIGEgbG9jYXRpb24gY2hhbmdlXG4gICAgICAvLyB0aGF0IHdlJ3ZlIGluaXRpYXRlZCBvdXJzZWx2ZXMsIGJlY2F1c2Ugd2UgbWlnaHQgYWNjaWRlbnRhbGx5IGFib3J0IGEgbGVnaXRpbWF0ZVxuICAgICAgLy8gdHJhbnNpdGlvbiBpbml0aWF0ZWQgZnJvbSBjb2RlP1xuICAgICAgaWYgKHNob3VsZFNraXBSZWxvYWQodG8sIHRvUGFyYW1zLCBmcm9tLCBmcm9tUGFyYW1zLCBsb2NhbHMsIG9wdGlvbnMpKSB7XG4gICAgICAgIGlmIChoYXNoKSB0b1BhcmFtc1snIyddID0gaGFzaDtcbiAgICAgICAgJHN0YXRlLnBhcmFtcyA9IHRvUGFyYW1zO1xuICAgICAgICBjb3B5KCRzdGF0ZS5wYXJhbXMsICRzdGF0ZVBhcmFtcyk7XG4gICAgICAgIGNvcHkoZmlsdGVyQnlLZXlzKHRvLnBhcmFtcy4kJGtleXMoKSwgJHN0YXRlUGFyYW1zKSwgdG8ubG9jYWxzLmdsb2JhbHMuJHN0YXRlUGFyYW1zKTtcbiAgICAgICAgaWYgKG9wdGlvbnMubG9jYXRpb24gJiYgdG8ubmF2aWdhYmxlICYmIHRvLm5hdmlnYWJsZS51cmwpIHtcbiAgICAgICAgICAkdXJsUm91dGVyLnB1c2godG8ubmF2aWdhYmxlLnVybCwgdG9QYXJhbXMsIHtcbiAgICAgICAgICAgICQkYXZvaWRSZXN5bmM6IHRydWUsIHJlcGxhY2U6IG9wdGlvbnMubG9jYXRpb24gPT09ICdyZXBsYWNlJ1xuICAgICAgICAgIH0pO1xuICAgICAgICAgICR1cmxSb3V0ZXIudXBkYXRlKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgICRzdGF0ZS50cmFuc2l0aW9uID0gbnVsbDtcbiAgICAgICAgcmV0dXJuICRxLndoZW4oJHN0YXRlLmN1cnJlbnQpO1xuICAgICAgfVxuXG4gICAgICAvLyBGaWx0ZXIgcGFyYW1ldGVycyBiZWZvcmUgd2UgcGFzcyB0aGVtIHRvIGV2ZW50IGhhbmRsZXJzIGV0Yy5cbiAgICAgIHRvUGFyYW1zID0gZmlsdGVyQnlLZXlzKHRvLnBhcmFtcy4kJGtleXMoKSwgdG9QYXJhbXMgfHwge30pO1xuICAgICAgXG4gICAgICAvLyBSZS1hZGQgdGhlIHNhdmVkIGhhc2ggYmVmb3JlIHdlIHN0YXJ0IHJldHVybmluZyB0aGluZ3Mgb3IgYnJvYWRjYXN0aW5nICRzdGF0ZUNoYW5nZVN0YXJ0XG4gICAgICBpZiAoaGFzaCkgdG9QYXJhbXNbJyMnXSA9IGhhc2g7XG4gICAgICBcbiAgICAgIC8vIEJyb2FkY2FzdCBzdGFydCBldmVudCBhbmQgY2FuY2VsIHRoZSB0cmFuc2l0aW9uIGlmIHJlcXVlc3RlZFxuICAgICAgaWYgKG9wdGlvbnMubm90aWZ5KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbmdkb2MgZXZlbnRcbiAgICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSMkc3RhdGVDaGFuZ2VTdGFydFxuICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICAgICAqIEBldmVudFR5cGUgYnJvYWRjYXN0IG9uIHJvb3Qgc2NvcGVcbiAgICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgICAqIEZpcmVkIHdoZW4gdGhlIHN0YXRlIHRyYW5zaXRpb24gKipiZWdpbnMqKi4gWW91IGNhbiB1c2UgYGV2ZW50LnByZXZlbnREZWZhdWx0KClgXG4gICAgICAgICAqIHRvIHByZXZlbnQgdGhlIHRyYW5zaXRpb24gZnJvbSBoYXBwZW5pbmcgYW5kIHRoZW4gdGhlIHRyYW5zaXRpb24gcHJvbWlzZSB3aWxsIGJlXG4gICAgICAgICAqIHJlamVjdGVkIHdpdGggYSBgJ3RyYW5zaXRpb24gcHJldmVudGVkJ2AgdmFsdWUuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IHRvU3RhdGUgVGhlIHN0YXRlIGJlaW5nIHRyYW5zaXRpb25lZCB0by5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHRvUGFyYW1zIFRoZSBwYXJhbXMgc3VwcGxpZWQgdG8gdGhlIGB0b1N0YXRlYC5cbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gZnJvbVN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLCBwcmUtdHJhbnNpdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGZyb21QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYGZyb21TdGF0ZWAuXG4gICAgICAgICAqXG4gICAgICAgICAqIEBleGFtcGxlXG4gICAgICAgICAqXG4gICAgICAgICAqIDxwcmU+XG4gICAgICAgICAqICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsXG4gICAgICAgICAqIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKXtcbiAgICAgICAgICogICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAqICAgICAvLyB0cmFuc2l0aW9uVG8oKSBwcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aFxuICAgICAgICAgKiAgICAgLy8gYSAndHJhbnNpdGlvbiBwcmV2ZW50ZWQnIGVycm9yXG4gICAgICAgICAqIH0pXG4gICAgICAgICAqIDwvcHJlPlxuICAgICAgICAgKi9cbiAgICAgICAgaWYgKCRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHN0YXRlQ2hhbmdlU3RhcnQnLCB0by5zZWxmLCB0b1BhcmFtcywgZnJvbS5zZWxmLCBmcm9tUGFyYW1zLCBvcHRpb25zKS5kZWZhdWx0UHJldmVudGVkKSB7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVDaGFuZ2VDYW5jZWwnLCB0by5zZWxmLCB0b1BhcmFtcywgZnJvbS5zZWxmLCBmcm9tUGFyYW1zKTtcbiAgICAgICAgICAvL0Rvbid0IHVwZGF0ZSBhbmQgcmVzeW5jIHVybCBpZiB0aGVyZSdzIGJlZW4gYSBuZXcgdHJhbnNpdGlvbiBzdGFydGVkLiBzZWUgaXNzdWUgIzIyMzgsICM2MDBcbiAgICAgICAgICBpZiAoJHN0YXRlLnRyYW5zaXRpb24gPT0gbnVsbCkgJHVybFJvdXRlci51cGRhdGUoKTtcbiAgICAgICAgICByZXR1cm4gVHJhbnNpdGlvblByZXZlbnRlZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBSZXNvbHZlIGxvY2FscyBmb3IgdGhlIHJlbWFpbmluZyBzdGF0ZXMsIGJ1dCBkb24ndCB1cGRhdGUgYW55IGdsb2JhbCBzdGF0ZSBqdXN0XG4gICAgICAvLyB5ZXQgLS0gaWYgYW55dGhpbmcgZmFpbHMgdG8gcmVzb2x2ZSB0aGUgY3VycmVudCBzdGF0ZSBuZWVkcyB0byByZW1haW4gdW50b3VjaGVkLlxuICAgICAgLy8gV2UgYWxzbyBzZXQgdXAgYW4gaW5oZXJpdGFuY2UgY2hhaW4gZm9yIHRoZSBsb2NhbHMgaGVyZS4gVGhpcyBhbGxvd3MgdGhlIHZpZXcgZGlyZWN0aXZlXG4gICAgICAvLyB0byBxdWlja2x5IGxvb2sgdXAgdGhlIGNvcnJlY3QgZGVmaW5pdGlvbiBmb3IgZWFjaCB2aWV3IGluIHRoZSBjdXJyZW50IHN0YXRlLiBFdmVuXG4gICAgICAvLyB0aG91Z2ggd2UgY3JlYXRlIHRoZSBsb2NhbHMgb2JqZWN0IGl0c2VsZiBvdXRzaWRlIHJlc29sdmVTdGF0ZSgpLCBpdCBpcyBpbml0aWFsbHlcbiAgICAgIC8vIGVtcHR5IGFuZCBnZXRzIGZpbGxlZCBhc3luY2hyb25vdXNseS4gV2UgbmVlZCB0byBrZWVwIHRyYWNrIG9mIHRoZSBwcm9taXNlIGZvciB0aGVcbiAgICAgIC8vIChmdWxseSByZXNvbHZlZCkgY3VycmVudCBsb2NhbHMsIGFuZCBwYXNzIHRoaXMgZG93biB0aGUgY2hhaW4uXG4gICAgICB2YXIgcmVzb2x2ZWQgPSAkcS53aGVuKGxvY2Fscyk7XG5cbiAgICAgIGZvciAodmFyIGwgPSBrZWVwOyBsIDwgdG9QYXRoLmxlbmd0aDsgbCsrLCBzdGF0ZSA9IHRvUGF0aFtsXSkge1xuICAgICAgICBsb2NhbHMgPSB0b0xvY2Fsc1tsXSA9IGluaGVyaXQobG9jYWxzKTtcbiAgICAgICAgcmVzb2x2ZWQgPSByZXNvbHZlU3RhdGUoc3RhdGUsIHRvUGFyYW1zLCBzdGF0ZSA9PT0gdG8sIHJlc29sdmVkLCBsb2NhbHMsIG9wdGlvbnMpO1xuICAgICAgfVxuXG4gICAgICAvLyBPbmNlIGV2ZXJ5dGhpbmcgaXMgcmVzb2x2ZWQsIHdlIGFyZSByZWFkeSB0byBwZXJmb3JtIHRoZSBhY3R1YWwgdHJhbnNpdGlvblxuICAgICAgLy8gYW5kIHJldHVybiBhIHByb21pc2UgZm9yIHRoZSBuZXcgc3RhdGUuIFdlIGFsc28ga2VlcCB0cmFjayBvZiB3aGF0IHRoZVxuICAgICAgLy8gY3VycmVudCBwcm9taXNlIGlzLCBzbyB0aGF0IHdlIGNhbiBkZXRlY3Qgb3ZlcmxhcHBpbmcgdHJhbnNpdGlvbnMgYW5kXG4gICAgICAvLyBrZWVwIG9ubHkgdGhlIG91dGNvbWUgb2YgdGhlIGxhc3QgdHJhbnNpdGlvbi5cbiAgICAgIHZhciB0cmFuc2l0aW9uID0gJHN0YXRlLnRyYW5zaXRpb24gPSByZXNvbHZlZC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGwsIGVudGVyaW5nLCBleGl0aW5nO1xuXG4gICAgICAgIGlmICgkc3RhdGUudHJhbnNpdGlvbiAhPT0gdHJhbnNpdGlvbikgcmV0dXJuIFRyYW5zaXRpb25TdXBlcnNlZGVkO1xuXG4gICAgICAgIC8vIEV4aXQgJ2Zyb20nIHN0YXRlcyBub3Qga2VwdFxuICAgICAgICBmb3IgKGwgPSBmcm9tUGF0aC5sZW5ndGggLSAxOyBsID49IGtlZXA7IGwtLSkge1xuICAgICAgICAgIGV4aXRpbmcgPSBmcm9tUGF0aFtsXTtcbiAgICAgICAgICBpZiAoZXhpdGluZy5zZWxmLm9uRXhpdCkge1xuICAgICAgICAgICAgJGluamVjdG9yLmludm9rZShleGl0aW5nLnNlbGYub25FeGl0LCBleGl0aW5nLnNlbGYsIGV4aXRpbmcubG9jYWxzLmdsb2JhbHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBleGl0aW5nLmxvY2FscyA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnRlciAndG8nIHN0YXRlcyBub3Qga2VwdFxuICAgICAgICBmb3IgKGwgPSBrZWVwOyBsIDwgdG9QYXRoLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgICAgZW50ZXJpbmcgPSB0b1BhdGhbbF07XG4gICAgICAgICAgZW50ZXJpbmcubG9jYWxzID0gdG9Mb2NhbHNbbF07XG4gICAgICAgICAgaWYgKGVudGVyaW5nLnNlbGYub25FbnRlcikge1xuICAgICAgICAgICAgJGluamVjdG9yLmludm9rZShlbnRlcmluZy5zZWxmLm9uRW50ZXIsIGVudGVyaW5nLnNlbGYsIGVudGVyaW5nLmxvY2Fscy5nbG9iYWxzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSdW4gaXQgYWdhaW4sIHRvIGNhdGNoIGFueSB0cmFuc2l0aW9ucyBpbiBjYWxsYmFja3NcbiAgICAgICAgaWYgKCRzdGF0ZS50cmFuc2l0aW9uICE9PSB0cmFuc2l0aW9uKSByZXR1cm4gVHJhbnNpdGlvblN1cGVyc2VkZWQ7XG5cbiAgICAgICAgLy8gVXBkYXRlIGdsb2JhbHMgaW4gJHN0YXRlXG4gICAgICAgICRzdGF0ZS4kY3VycmVudCA9IHRvO1xuICAgICAgICAkc3RhdGUuY3VycmVudCA9IHRvLnNlbGY7XG4gICAgICAgICRzdGF0ZS5wYXJhbXMgPSB0b1BhcmFtcztcbiAgICAgICAgY29weSgkc3RhdGUucGFyYW1zLCAkc3RhdGVQYXJhbXMpO1xuICAgICAgICAkc3RhdGUudHJhbnNpdGlvbiA9IG51bGw7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubG9jYXRpb24gJiYgdG8ubmF2aWdhYmxlKSB7XG4gICAgICAgICAgJHVybFJvdXRlci5wdXNoKHRvLm5hdmlnYWJsZS51cmwsIHRvLm5hdmlnYWJsZS5sb2NhbHMuZ2xvYmFscy4kc3RhdGVQYXJhbXMsIHtcbiAgICAgICAgICAgICQkYXZvaWRSZXN5bmM6IHRydWUsIHJlcGxhY2U6IG9wdGlvbnMubG9jYXRpb24gPT09ICdyZXBsYWNlJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdGlvbnMubm90aWZ5KSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAbmdkb2MgZXZlbnRcbiAgICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSMkc3RhdGVDaGFuZ2VTdWNjZXNzXG4gICAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxuICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICogRmlyZWQgb25jZSB0aGUgc3RhdGUgdHJhbnNpdGlvbiBpcyAqKmNvbXBsZXRlKiouXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IHRvU3RhdGUgVGhlIHN0YXRlIGJlaW5nIHRyYW5zaXRpb25lZCB0by5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHRvUGFyYW1zIFRoZSBwYXJhbXMgc3VwcGxpZWQgdG8gdGhlIGB0b1N0YXRlYC5cbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gZnJvbVN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLCBwcmUtdHJhbnNpdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGZyb21QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYGZyb21TdGF0ZWAuXG4gICAgICAgICAqL1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHN0YXRlQ2hhbmdlU3VjY2VzcycsIHRvLnNlbGYsIHRvUGFyYW1zLCBmcm9tLnNlbGYsIGZyb21QYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgICR1cmxSb3V0ZXIudXBkYXRlKHRydWUpO1xuXG4gICAgICAgIHJldHVybiAkc3RhdGUuY3VycmVudDtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIGlmICgkc3RhdGUudHJhbnNpdGlvbiAhPT0gdHJhbnNpdGlvbikgcmV0dXJuIFRyYW5zaXRpb25TdXBlcnNlZGVkO1xuXG4gICAgICAgICRzdGF0ZS50cmFuc2l0aW9uID0gbnVsbDtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlIyRzdGF0ZUNoYW5nZUVycm9yXG4gICAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAgICAgICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxuICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICogRmlyZWQgd2hlbiBhbiAqKmVycm9yIG9jY3VycyoqIGR1cmluZyB0cmFuc2l0aW9uLiBJdCdzIGltcG9ydGFudCB0byBub3RlIHRoYXQgaWYgeW91XG4gICAgICAgICAqIGhhdmUgYW55IGVycm9ycyBpbiB5b3VyIHJlc29sdmUgZnVuY3Rpb25zIChqYXZhc2NyaXB0IGVycm9ycywgbm9uLWV4aXN0ZW50IHNlcnZpY2VzLCBldGMpXG4gICAgICAgICAqIHRoZXkgd2lsbCBub3QgdGhyb3cgdHJhZGl0aW9uYWxseS4gWW91IG11c3QgbGlzdGVuIGZvciB0aGlzICRzdGF0ZUNoYW5nZUVycm9yIGV2ZW50IHRvXG4gICAgICAgICAqIGNhdGNoICoqQUxMKiogZXJyb3JzLlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0ge1N0YXRlfSB0b1N0YXRlIFRoZSBzdGF0ZSBiZWluZyB0cmFuc2l0aW9uZWQgdG8uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b1BhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgdG9TdGF0ZWAuXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IGZyb21TdGF0ZSBUaGUgY3VycmVudCBzdGF0ZSwgcHJlLXRyYW5zaXRpb24uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBmcm9tUGFyYW1zIFRoZSBwYXJhbXMgc3VwcGxpZWQgdG8gdGhlIGBmcm9tU3RhdGVgLlxuICAgICAgICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgcmVzb2x2ZSBlcnJvciBvYmplY3QuXG4gICAgICAgICAqL1xuICAgICAgICBldnQgPSAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRzdGF0ZUNoYW5nZUVycm9yJywgdG8uc2VsZiwgdG9QYXJhbXMsIGZyb20uc2VsZiwgZnJvbVBhcmFtcywgZXJyb3IpO1xuXG4gICAgICAgIGlmICghZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICAgICR1cmxSb3V0ZXIudXBkYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gJHEucmVqZWN0KGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gdHJhbnNpdGlvbjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNpc1xuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBTaW1pbGFyIHRvIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfaW5jbHVkZXMgJHN0YXRlLmluY2x1ZGVzfSxcbiAgICAgKiBidXQgb25seSBjaGVja3MgZm9yIHRoZSBmdWxsIHN0YXRlIG5hbWUuIElmIHBhcmFtcyBpcyBzdXBwbGllZCB0aGVuIGl0IHdpbGwgYmVcbiAgICAgKiB0ZXN0ZWQgZm9yIHN0cmljdCBlcXVhbGl0eSBhZ2FpbnN0IHRoZSBjdXJyZW50IGFjdGl2ZSBwYXJhbXMgb2JqZWN0LCBzbyBhbGwgcGFyYW1zXG4gICAgICogbXVzdCBtYXRjaCB3aXRoIG5vbmUgbWlzc2luZyBhbmQgbm8gZXh0cmFzLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiA8cHJlPlxuICAgICAqICRzdGF0ZS4kY3VycmVudC5uYW1lID0gJ2NvbnRhY3RzLmRldGFpbHMuaXRlbSc7XG4gICAgICpcbiAgICAgKiAvLyBhYnNvbHV0ZSBuYW1lXG4gICAgICogJHN0YXRlLmlzKCdjb250YWN0LmRldGFpbHMuaXRlbScpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaXMoY29udGFjdERldGFpbEl0ZW1TdGF0ZU9iamVjdCk7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqXG4gICAgICogLy8gcmVsYXRpdmUgbmFtZSAoLiBhbmQgXiksIHR5cGljYWxseSBmcm9tIGEgdGVtcGxhdGVcbiAgICAgKiAvLyBFLmcuIGZyb20gdGhlICdjb250YWN0cy5kZXRhaWxzJyB0ZW1wbGF0ZVxuICAgICAqIDxkaXYgbmctY2xhc3M9XCJ7aGlnaGxpZ2h0ZWQ6ICRzdGF0ZS5pcygnLml0ZW0nKX1cIj5JdGVtPC9kaXY+XG4gICAgICogPC9wcmU+XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHN0YXRlT3JOYW1lIFRoZSBzdGF0ZSBuYW1lIChhYnNvbHV0ZSBvciByZWxhdGl2ZSkgb3Igc3RhdGUgb2JqZWN0IHlvdSdkIGxpa2UgdG8gY2hlY2suXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQSBwYXJhbSBvYmplY3QsIGUuZy4gYHtzZWN0aW9uSWQ6IHNlY3Rpb24uaWR9YCwgdGhhdCB5b3UnZCBsaWtlXG4gICAgICogdG8gdGVzdCBhZ2FpbnN0IHRoZSBjdXJyZW50IGFjdGl2ZSBzdGF0ZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QuICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICpcbiAgICAgKiAtICoqYHJlbGF0aXZlYCoqIC0ge3N0cmluZ3xvYmplY3R9IC0gIElmIGBzdGF0ZU9yTmFtZWAgaXMgYSByZWxhdGl2ZSBzdGF0ZSBuYW1lIGFuZCBgb3B0aW9ucy5yZWxhdGl2ZWAgaXMgc2V0LCAuaXMgd2lsbFxuICAgICAqIHRlc3QgcmVsYXRpdmUgdG8gYG9wdGlvbnMucmVsYXRpdmVgIHN0YXRlIChvciBuYW1lKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgaXQgaXMgdGhlIHN0YXRlLlxuICAgICAqL1xuICAgICRzdGF0ZS5pcyA9IGZ1bmN0aW9uIGlzKHN0YXRlT3JOYW1lLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoeyByZWxhdGl2ZTogJHN0YXRlLiRjdXJyZW50IH0sIG9wdGlvbnMgfHwge30pO1xuICAgICAgdmFyIHN0YXRlID0gZmluZFN0YXRlKHN0YXRlT3JOYW1lLCBvcHRpb25zLnJlbGF0aXZlKTtcblxuICAgICAgaWYgKCFpc0RlZmluZWQoc3RhdGUpKSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICAgIGlmICgkc3RhdGUuJGN1cnJlbnQgIT09IHN0YXRlKSB7IHJldHVybiBmYWxzZTsgfVxuICAgICAgcmV0dXJuIHBhcmFtcyA/IGVxdWFsRm9yS2V5cyhzdGF0ZS5wYXJhbXMuJCR2YWx1ZXMocGFyYW1zKSwgJHN0YXRlUGFyYW1zKSA6IHRydWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjaW5jbHVkZXNcbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogQSBtZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBzdGF0ZSBpcyBlcXVhbCB0byBvciBpcyB0aGUgY2hpbGQgb2YgdGhlXG4gICAgICogc3RhdGUgc3RhdGVOYW1lLiBJZiBhbnkgcGFyYW1zIGFyZSBwYXNzZWQgdGhlbiB0aGV5IHdpbGwgYmUgdGVzdGVkIGZvciBhIG1hdGNoIGFzIHdlbGwuXG4gICAgICogTm90IGFsbCB0aGUgcGFyYW1ldGVycyBuZWVkIHRvIGJlIHBhc3NlZCwganVzdCB0aGUgb25lcyB5b3UnZCBsaWtlIHRvIHRlc3QgZm9yIGVxdWFsaXR5LlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBQYXJ0aWFsIGFuZCByZWxhdGl2ZSBuYW1lc1xuICAgICAqIDxwcmU+XG4gICAgICogJHN0YXRlLiRjdXJyZW50Lm5hbWUgPSAnY29udGFjdHMuZGV0YWlscy5pdGVtJztcbiAgICAgKlxuICAgICAqIC8vIFVzaW5nIHBhcnRpYWwgbmFtZXNcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCJjb250YWN0c1wiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiY29udGFjdHMuZGV0YWlsc1wiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiY29udGFjdHMuZGV0YWlscy5pdGVtXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCJjb250YWN0cy5saXN0XCIpOyAvLyByZXR1cm5zIGZhbHNlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiYWJvdXRcIik7IC8vIHJldHVybnMgZmFsc2VcbiAgICAgKlxuICAgICAqIC8vIFVzaW5nIHJlbGF0aXZlIG5hbWVzICguIGFuZCBeKSwgdHlwaWNhbGx5IGZyb20gYSB0ZW1wbGF0ZVxuICAgICAqIC8vIEUuZy4gZnJvbSB0aGUgJ2NvbnRhY3RzLmRldGFpbHMnIHRlbXBsYXRlXG4gICAgICogPGRpdiBuZy1jbGFzcz1cIntoaWdobGlnaHRlZDogJHN0YXRlLmluY2x1ZGVzKCcuaXRlbScpfVwiPkl0ZW08L2Rpdj5cbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIEJhc2ljIGdsb2JiaW5nIHBhdHRlcm5zXG4gICAgICogPHByZT5cbiAgICAgKiAkc3RhdGUuJGN1cnJlbnQubmFtZSA9ICdjb250YWN0cy5kZXRhaWxzLml0ZW0udXJsJztcbiAgICAgKlxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIiouZGV0YWlscy4qLipcIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIiouZGV0YWlscy4qKlwiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKiouaXRlbS4qKlwiKTsgLy8gcmV0dXJucyB0cnVlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKi5kZXRhaWxzLml0ZW0udXJsXCIpOyAvLyByZXR1cm5zIHRydWVcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqLmRldGFpbHMuKi51cmxcIik7IC8vIHJldHVybnMgdHJ1ZVxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIiouZGV0YWlscy4qXCIpOyAvLyByZXR1cm5zIGZhbHNlXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiaXRlbS4qKlwiKTsgLy8gcmV0dXJucyBmYWxzZVxuICAgICAqIDwvcHJlPlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlT3JOYW1lIEEgcGFydGlhbCBuYW1lLCByZWxhdGl2ZSBuYW1lLCBvciBnbG9iIHBhdHRlcm5cbiAgICAgKiB0byBiZSBzZWFyY2hlZCBmb3Igd2l0aGluIHRoZSBjdXJyZW50IHN0YXRlIG5hbWUuXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQSBwYXJhbSBvYmplY3QsIGUuZy4gYHtzZWN0aW9uSWQ6IHNlY3Rpb24uaWR9YCxcbiAgICAgKiB0aGF0IHlvdSdkIGxpa2UgdG8gdGVzdCBhZ2FpbnN0IHRoZSBjdXJyZW50IGFjdGl2ZSBzdGF0ZS5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IG9wdGlvbnMgQW4gb3B0aW9ucyBvYmplY3QuICBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICpcbiAgICAgKiAtICoqYHJlbGF0aXZlYCoqIC0ge3N0cmluZ3xvYmplY3Q9fSAtICBJZiBgc3RhdGVPck5hbWVgIGlzIGEgcmVsYXRpdmUgc3RhdGUgcmVmZXJlbmNlIGFuZCBgb3B0aW9ucy5yZWxhdGl2ZWAgaXMgc2V0LFxuICAgICAqIC5pbmNsdWRlcyB3aWxsIHRlc3QgcmVsYXRpdmUgdG8gYG9wdGlvbnMucmVsYXRpdmVgIHN0YXRlIChvciBuYW1lKS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgaXQgZG9lcyBpbmNsdWRlIHRoZSBzdGF0ZVxuICAgICAqL1xuICAgICRzdGF0ZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzKHN0YXRlT3JOYW1lLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoeyByZWxhdGl2ZTogJHN0YXRlLiRjdXJyZW50IH0sIG9wdGlvbnMgfHwge30pO1xuICAgICAgaWYgKGlzU3RyaW5nKHN0YXRlT3JOYW1lKSAmJiBpc0dsb2Ioc3RhdGVPck5hbWUpKSB7XG4gICAgICAgIGlmICghZG9lc1N0YXRlTWF0Y2hHbG9iKHN0YXRlT3JOYW1lKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBzdGF0ZU9yTmFtZSA9ICRzdGF0ZS4kY3VycmVudC5uYW1lO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhdGUgPSBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIG9wdGlvbnMucmVsYXRpdmUpO1xuICAgICAgaWYgKCFpc0RlZmluZWQoc3RhdGUpKSB7IHJldHVybiB1bmRlZmluZWQ7IH1cbiAgICAgIGlmICghaXNEZWZpbmVkKCRzdGF0ZS4kY3VycmVudC5pbmNsdWRlc1tzdGF0ZS5uYW1lXSkpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICByZXR1cm4gcGFyYW1zID8gZXF1YWxGb3JLZXlzKHN0YXRlLnBhcmFtcy4kJHZhbHVlcyhwYXJhbXMpLCAkc3RhdGVQYXJhbXMsIG9iamVjdEtleXMocGFyYW1zKSkgOiB0cnVlO1xuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjaHJlZlxuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBBIHVybCBnZW5lcmF0aW9uIG1ldGhvZCB0aGF0IHJldHVybnMgdGhlIGNvbXBpbGVkIHVybCBmb3IgdGhlIGdpdmVuIHN0YXRlIHBvcHVsYXRlZCB3aXRoIHRoZSBnaXZlbiBwYXJhbXMuXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIDxwcmU+XG4gICAgICogZXhwZWN0KCRzdGF0ZS5ocmVmKFwiYWJvdXQucGVyc29uXCIsIHsgcGVyc29uOiBcImJvYlwiIH0pKS50b0VxdWFsKFwiL2Fib3V0L2JvYlwiKTtcbiAgICAgKiA8L3ByZT5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gc3RhdGVPck5hbWUgVGhlIHN0YXRlIG5hbWUgb3Igc3RhdGUgb2JqZWN0IHlvdSdkIGxpa2UgdG8gZ2VuZXJhdGUgYSB1cmwgZnJvbS5cbiAgICAgKiBAcGFyYW0ge29iamVjdD19IHBhcmFtcyBBbiBvYmplY3Qgb2YgcGFyYW1ldGVyIHZhbHVlcyB0byBmaWxsIHRoZSBzdGF0ZSdzIHJlcXVpcmVkIHBhcmFtZXRlcnMuXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBUaGUgb3B0aW9ucyBhcmU6XG4gICAgICpcbiAgICAgKiAtICoqYGxvc3N5YCoqIC0ge2Jvb2xlYW49dHJ1ZX0gLSAgSWYgdHJ1ZSwgYW5kIGlmIHRoZXJlIGlzIG5vIHVybCBhc3NvY2lhdGVkIHdpdGggdGhlIHN0YXRlIHByb3ZpZGVkIGluIHRoZVxuICAgICAqICAgIGZpcnN0IHBhcmFtZXRlciwgdGhlbiB0aGUgY29uc3RydWN0ZWQgaHJlZiB1cmwgd2lsbCBiZSBidWlsdCBmcm9tIHRoZSBmaXJzdCBuYXZpZ2FibGUgYW5jZXN0b3IgKGFrYVxuICAgICAqICAgIGFuY2VzdG9yIHdpdGggYSB2YWxpZCB1cmwpLlxuICAgICAqIC0gKipgaW5oZXJpdGAqKiAtIHtib29sZWFuPXRydWV9LCBJZiBgdHJ1ZWAgd2lsbCBpbmhlcml0IHVybCBwYXJhbWV0ZXJzIGZyb20gY3VycmVudCB1cmwuXG4gICAgICogLSAqKmByZWxhdGl2ZWAqKiAtIHtvYmplY3Q9JHN0YXRlLiRjdXJyZW50fSwgV2hlbiB0cmFuc2l0aW9uaW5nIHdpdGggcmVsYXRpdmUgcGF0aCAoZS5nICdeJyksIFxuICAgICAqICAgIGRlZmluZXMgd2hpY2ggc3RhdGUgdG8gYmUgcmVsYXRpdmUgZnJvbS5cbiAgICAgKiAtICoqYGFic29sdXRlYCoqIC0ge2Jvb2xlYW49ZmFsc2V9LCAgSWYgdHJ1ZSB3aWxsIGdlbmVyYXRlIGFuIGFic29sdXRlIHVybCwgZS5nLiBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vZnVsbHVybFwiLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IGNvbXBpbGVkIHN0YXRlIHVybFxuICAgICAqL1xuICAgICRzdGF0ZS5ocmVmID0gZnVuY3Rpb24gaHJlZihzdGF0ZU9yTmFtZSwgcGFyYW1zLCBvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gZXh0ZW5kKHtcbiAgICAgICAgbG9zc3k6ICAgIHRydWUsXG4gICAgICAgIGluaGVyaXQ6ICB0cnVlLFxuICAgICAgICBhYnNvbHV0ZTogZmFsc2UsXG4gICAgICAgIHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnRcbiAgICAgIH0sIG9wdGlvbnMgfHwge30pO1xuXG4gICAgICB2YXIgc3RhdGUgPSBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIG9wdGlvbnMucmVsYXRpdmUpO1xuXG4gICAgICBpZiAoIWlzRGVmaW5lZChzdGF0ZSkpIHJldHVybiBudWxsO1xuICAgICAgaWYgKG9wdGlvbnMuaW5oZXJpdCkgcGFyYW1zID0gaW5oZXJpdFBhcmFtcygkc3RhdGVQYXJhbXMsIHBhcmFtcyB8fCB7fSwgJHN0YXRlLiRjdXJyZW50LCBzdGF0ZSk7XG4gICAgICBcbiAgICAgIHZhciBuYXYgPSAoc3RhdGUgJiYgb3B0aW9ucy5sb3NzeSkgPyBzdGF0ZS5uYXZpZ2FibGUgOiBzdGF0ZTtcblxuICAgICAgaWYgKCFuYXYgfHwgbmF2LnVybCA9PT0gdW5kZWZpbmVkIHx8IG5hdi51cmwgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gJHVybFJvdXRlci5ocmVmKG5hdi51cmwsIGZpbHRlckJ5S2V5cyhzdGF0ZS5wYXJhbXMuJCRrZXlzKCkuY29uY2F0KCcjJyksIHBhcmFtcyB8fCB7fSksIHtcbiAgICAgICAgYWJzb2x1dGU6IG9wdGlvbnMuYWJzb2x1dGVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI2dldFxuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gICAgICpcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBSZXR1cm5zIHRoZSBzdGF0ZSBjb25maWd1cmF0aW9uIG9iamVjdCBmb3IgYW55IHNwZWNpZmljIHN0YXRlIG9yIGFsbCBzdGF0ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3Q9fSBzdGF0ZU9yTmFtZSAoYWJzb2x1dGUgb3IgcmVsYXRpdmUpIElmIHByb3ZpZGVkLCB3aWxsIG9ubHkgZ2V0IHRoZSBjb25maWcgZm9yXG4gICAgICogdGhlIHJlcXVlc3RlZCBzdGF0ZS4gSWYgbm90IHByb3ZpZGVkLCByZXR1cm5zIGFuIGFycmF5IG9mIEFMTCBzdGF0ZSBjb25maWdzLlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdD19IGNvbnRleHQgV2hlbiBzdGF0ZU9yTmFtZSBpcyBhIHJlbGF0aXZlIHN0YXRlIHJlZmVyZW5jZSwgdGhlIHN0YXRlIHdpbGwgYmUgcmV0cmlldmVkIHJlbGF0aXZlIHRvIGNvbnRleHQuXG4gICAgICogQHJldHVybnMge09iamVjdHxBcnJheX0gU3RhdGUgY29uZmlndXJhdGlvbiBvYmplY3Qgb3IgYXJyYXkgb2YgYWxsIG9iamVjdHMuXG4gICAgICovXG4gICAgJHN0YXRlLmdldCA9IGZ1bmN0aW9uIChzdGF0ZU9yTmFtZSwgY29udGV4dCkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiBtYXAob2JqZWN0S2V5cyhzdGF0ZXMpLCBmdW5jdGlvbihuYW1lKSB7IHJldHVybiBzdGF0ZXNbbmFtZV0uc2VsZjsgfSk7XG4gICAgICB2YXIgc3RhdGUgPSBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIGNvbnRleHQgfHwgJHN0YXRlLiRjdXJyZW50KTtcbiAgICAgIHJldHVybiAoc3RhdGUgJiYgc3RhdGUuc2VsZikgPyBzdGF0ZS5zZWxmIDogbnVsbDtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gcmVzb2x2ZVN0YXRlKHN0YXRlLCBwYXJhbXMsIHBhcmFtc0FyZUZpbHRlcmVkLCBpbmhlcml0ZWQsIGRzdCwgb3B0aW9ucykge1xuICAgICAgLy8gTWFrZSBhIHJlc3RyaWN0ZWQgJHN0YXRlUGFyYW1zIHdpdGggb25seSB0aGUgcGFyYW1ldGVycyB0aGF0IGFwcGx5IHRvIHRoaXMgc3RhdGUgaWZcbiAgICAgIC8vIG5lY2Vzc2FyeS4gSW4gYWRkaXRpb24gdG8gYmVpbmcgYXZhaWxhYmxlIHRvIHRoZSBjb250cm9sbGVyIGFuZCBvbkVudGVyL29uRXhpdCBjYWxsYmFja3MsXG4gICAgICAvLyB3ZSBhbHNvIG5lZWQgJHN0YXRlUGFyYW1zIHRvIGJlIGF2YWlsYWJsZSBmb3IgYW55ICRpbmplY3RvciBjYWxscyB3ZSBtYWtlIGR1cmluZyB0aGVcbiAgICAgIC8vIGRlcGVuZGVuY3kgcmVzb2x1dGlvbiBwcm9jZXNzLlxuICAgICAgdmFyICRzdGF0ZVBhcmFtcyA9IChwYXJhbXNBcmVGaWx0ZXJlZCkgPyBwYXJhbXMgOiBmaWx0ZXJCeUtleXMoc3RhdGUucGFyYW1zLiQka2V5cygpLCBwYXJhbXMpO1xuICAgICAgdmFyIGxvY2FscyA9IHsgJHN0YXRlUGFyYW1zOiAkc3RhdGVQYXJhbXMgfTtcblxuICAgICAgLy8gUmVzb2x2ZSAnZ2xvYmFsJyBkZXBlbmRlbmNpZXMgZm9yIHRoZSBzdGF0ZSwgaS5lLiB0aG9zZSBub3Qgc3BlY2lmaWMgdG8gYSB2aWV3LlxuICAgICAgLy8gV2UncmUgYWxzbyBpbmNsdWRpbmcgJHN0YXRlUGFyYW1zIGluIHRoaXM7IHRoYXQgd2F5IHRoZSBwYXJhbWV0ZXJzIGFyZSByZXN0cmljdGVkXG4gICAgICAvLyB0byB0aGUgc2V0IHRoYXQgc2hvdWxkIGJlIHZpc2libGUgdG8gdGhlIHN0YXRlLCBhbmQgYXJlIGluZGVwZW5kZW50IG9mIHdoZW4gd2UgdXBkYXRlXG4gICAgICAvLyB0aGUgZ2xvYmFsICRzdGF0ZSBhbmQgJHN0YXRlUGFyYW1zIHZhbHVlcy5cbiAgICAgIGRzdC5yZXNvbHZlID0gJHJlc29sdmUucmVzb2x2ZShzdGF0ZS5yZXNvbHZlLCBsb2NhbHMsIGRzdC5yZXNvbHZlLCBzdGF0ZSk7XG4gICAgICB2YXIgcHJvbWlzZXMgPSBbZHN0LnJlc29sdmUudGhlbihmdW5jdGlvbiAoZ2xvYmFscykge1xuICAgICAgICBkc3QuZ2xvYmFscyA9IGdsb2JhbHM7XG4gICAgICB9KV07XG4gICAgICBpZiAoaW5oZXJpdGVkKSBwcm9taXNlcy5wdXNoKGluaGVyaXRlZCk7XG5cbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVWaWV3cygpIHtcbiAgICAgICAgdmFyIHZpZXdzUHJvbWlzZXMgPSBbXTtcblxuICAgICAgICAvLyBSZXNvbHZlIHRlbXBsYXRlIGFuZCBkZXBlbmRlbmNpZXMgZm9yIGFsbCB2aWV3cy5cbiAgICAgICAgZm9yRWFjaChzdGF0ZS52aWV3cywgZnVuY3Rpb24gKHZpZXcsIG5hbWUpIHtcbiAgICAgICAgICB2YXIgaW5qZWN0YWJsZXMgPSAodmlldy5yZXNvbHZlICYmIHZpZXcucmVzb2x2ZSAhPT0gc3RhdGUucmVzb2x2ZSA/IHZpZXcucmVzb2x2ZSA6IHt9KTtcbiAgICAgICAgICBpbmplY3RhYmxlcy4kdGVtcGxhdGUgPSBbIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkdmlldy5sb2FkKG5hbWUsIHsgdmlldzogdmlldywgbG9jYWxzOiBkc3QuZ2xvYmFscywgcGFyYW1zOiAkc3RhdGVQYXJhbXMsIG5vdGlmeTogb3B0aW9ucy5ub3RpZnkgfSkgfHwgJyc7XG4gICAgICAgICAgfV07XG5cbiAgICAgICAgICB2aWV3c1Byb21pc2VzLnB1c2goJHJlc29sdmUucmVzb2x2ZShpbmplY3RhYmxlcywgZHN0Lmdsb2JhbHMsIGRzdC5yZXNvbHZlLCBzdGF0ZSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAvLyBSZWZlcmVuY2VzIHRvIHRoZSBjb250cm9sbGVyIChvbmx5IGluc3RhbnRpYXRlZCBhdCBsaW5rIHRpbWUpXG4gICAgICAgICAgICBpZiAoaXNGdW5jdGlvbih2aWV3LmNvbnRyb2xsZXJQcm92aWRlcikgfHwgaXNBcnJheSh2aWV3LmNvbnRyb2xsZXJQcm92aWRlcikpIHtcbiAgICAgICAgICAgICAgdmFyIGluamVjdExvY2FscyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBpbmplY3RhYmxlcywgZHN0Lmdsb2JhbHMpO1xuICAgICAgICAgICAgICByZXN1bHQuJCRjb250cm9sbGVyID0gJGluamVjdG9yLmludm9rZSh2aWV3LmNvbnRyb2xsZXJQcm92aWRlciwgbnVsbCwgaW5qZWN0TG9jYWxzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlc3VsdC4kJGNvbnRyb2xsZXIgPSB2aWV3LmNvbnRyb2xsZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBQcm92aWRlIGFjY2VzcyB0byB0aGUgc3RhdGUgaXRzZWxmIGZvciBpbnRlcm5hbCB1c2VcbiAgICAgICAgICAgIHJlc3VsdC4kJHN0YXRlID0gc3RhdGU7XG4gICAgICAgICAgICByZXN1bHQuJCRjb250cm9sbGVyQXMgPSB2aWV3LmNvbnRyb2xsZXJBcztcbiAgICAgICAgICAgIHJlc3VsdC4kJHJlc29sdmVBcyA9IHZpZXcucmVzb2x2ZUFzO1xuICAgICAgICAgICAgZHN0W25hbWVdID0gcmVzdWx0O1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuICRxLmFsbCh2aWV3c1Byb21pc2VzKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIGRzdC5nbG9iYWxzO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gV2FpdCBmb3IgYWxsIHRoZSBwcm9taXNlcyBhbmQgdGhlbiByZXR1cm4gdGhlIGFjdGl2YXRpb24gb2JqZWN0XG4gICAgICByZXR1cm4gJHEuYWxsKHByb21pc2VzKS50aGVuKHJlc29sdmVWaWV3cykudGhlbihmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgIHJldHVybiBkc3Q7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gJHN0YXRlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvdWxkU2tpcFJlbG9hZCh0bywgdG9QYXJhbXMsIGZyb20sIGZyb21QYXJhbXMsIGxvY2Fscywgb3B0aW9ucykge1xuICAgIC8vIFJldHVybiB0cnVlIGlmIHRoZXJlIGFyZSBubyBkaWZmZXJlbmNlcyBpbiBub24tc2VhcmNoIChwYXRoL29iamVjdCkgcGFyYW1zLCBmYWxzZSBpZiB0aGVyZSBhcmUgZGlmZmVyZW5jZXNcbiAgICBmdW5jdGlvbiBub25TZWFyY2hQYXJhbXNFcXVhbChmcm9tQW5kVG9TdGF0ZSwgZnJvbVBhcmFtcywgdG9QYXJhbXMpIHtcbiAgICAgIC8vIElkZW50aWZ5IHdoZXRoZXIgYWxsIHRoZSBwYXJhbWV0ZXJzIHRoYXQgZGlmZmVyIGJldHdlZW4gYGZyb21QYXJhbXNgIGFuZCBgdG9QYXJhbXNgIHdlcmUgc2VhcmNoIHBhcmFtcy5cbiAgICAgIGZ1bmN0aW9uIG5vdFNlYXJjaFBhcmFtKGtleSkge1xuICAgICAgICByZXR1cm4gZnJvbUFuZFRvU3RhdGUucGFyYW1zW2tleV0ubG9jYXRpb24gIT0gXCJzZWFyY2hcIjtcbiAgICAgIH1cbiAgICAgIHZhciBub25RdWVyeVBhcmFtS2V5cyA9IGZyb21BbmRUb1N0YXRlLnBhcmFtcy4kJGtleXMoKS5maWx0ZXIobm90U2VhcmNoUGFyYW0pO1xuICAgICAgdmFyIG5vblF1ZXJ5UGFyYW1zID0gcGljay5hcHBseSh7fSwgW2Zyb21BbmRUb1N0YXRlLnBhcmFtc10uY29uY2F0KG5vblF1ZXJ5UGFyYW1LZXlzKSk7XG4gICAgICB2YXIgbm9uUXVlcnlQYXJhbVNldCA9IG5ldyAkJFVNRlAuUGFyYW1TZXQobm9uUXVlcnlQYXJhbXMpO1xuICAgICAgcmV0dXJuIG5vblF1ZXJ5UGFyYW1TZXQuJCRlcXVhbHMoZnJvbVBhcmFtcywgdG9QYXJhbXMpO1xuICAgIH1cblxuICAgIC8vIElmIHJlbG9hZCB3YXMgbm90IGV4cGxpY2l0bHkgcmVxdWVzdGVkXG4gICAgLy8gYW5kIHdlJ3JlIHRyYW5zaXRpb25pbmcgdG8gdGhlIHNhbWUgc3RhdGUgd2UncmUgYWxyZWFkeSBpblxuICAgIC8vIGFuZCAgICB0aGUgbG9jYWxzIGRpZG4ndCBjaGFuZ2VcbiAgICAvLyAgICAgb3IgdGhleSBjaGFuZ2VkIGluIGEgd2F5IHRoYXQgZG9lc24ndCBtZXJpdCByZWxvYWRpbmdcbiAgICAvLyAgICAgICAgKHJlbG9hZE9uUGFyYW1zOmZhbHNlLCBvciByZWxvYWRPblNlYXJjaC5mYWxzZSBhbmQgb25seSBzZWFyY2ggcGFyYW1zIGNoYW5nZWQpXG4gICAgLy8gVGhlbiByZXR1cm4gdHJ1ZS5cbiAgICBpZiAoIW9wdGlvbnMucmVsb2FkICYmIHRvID09PSBmcm9tICYmXG4gICAgICAobG9jYWxzID09PSBmcm9tLmxvY2FscyB8fCAodG8uc2VsZi5yZWxvYWRPblNlYXJjaCA9PT0gZmFsc2UgJiYgbm9uU2VhcmNoUGFyYW1zRXF1YWwoZnJvbSwgZnJvbVBhcmFtcywgdG9QYXJhbXMpKSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJylcbiAgLmZhY3RvcnkoJyRzdGF0ZVBhcmFtcycsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIHt9OyB9KVxuICAuY29uc3RhbnQoXCIkc3RhdGUucnVudGltZVwiLCB7IGF1dG9pbmplY3Q6IHRydWUgfSlcbiAgLnByb3ZpZGVyKCckc3RhdGUnLCAkU3RhdGVQcm92aWRlcilcbiAgLy8gSW5qZWN0ICRzdGF0ZSB0byBpbml0aWFsaXplIHdoZW4gZW50ZXJpbmcgcnVudGltZS4gIzI1NzRcbiAgLnJ1bihbJyRpbmplY3RvcicsIGZ1bmN0aW9uICgkaW5qZWN0b3IpIHtcbiAgICAvLyBBbGxvdyB0ZXN0cyAoc3RhdGVTcGVjLmpzKSB0byB0dXJuIHRoaXMgb2ZmIGJ5IGRlZmluaW5nIHRoaXMgY29uc3RhbnRcbiAgICBpZiAoJGluamVjdG9yLmdldChcIiRzdGF0ZS5ydW50aW1lXCIpLmF1dG9pbmplY3QpIHtcbiAgICAgICRpbmplY3Rvci5nZXQoJyRzdGF0ZScpO1xuICAgIH1cbiAgfV0pO1xuXG5cbiRWaWV3UHJvdmlkZXIuJGluamVjdCA9IFtdO1xuZnVuY3Rpb24gJFZpZXdQcm92aWRlcigpIHtcblxuICB0aGlzLiRnZXQgPSAkZ2V0O1xuICAvKipcbiAgICogQG5nZG9jIG9iamVjdFxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHZpZXdcbiAgICpcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcbiAgICogQHJlcXVpcmVzICRyb290U2NvcGVcbiAgICpcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqXG4gICAqL1xuICAkZ2V0LiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHRlbXBsYXRlRmFjdG9yeSddO1xuICBmdW5jdGlvbiAkZ2V0KCAgICRyb290U2NvcGUsICAgJHRlbXBsYXRlRmFjdG9yeSkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyAkdmlldy5sb2FkKCdmdWxsLnZpZXdOYW1lJywgeyB0ZW1wbGF0ZTogLi4uLCBjb250cm9sbGVyOiAuLi4sIHJlc29sdmU6IC4uLiwgYXN5bmM6IGZhbHNlLCBwYXJhbXM6IC4uLiB9KVxuICAgICAgLyoqXG4gICAgICAgKiBAbmdkb2MgZnVuY3Rpb25cbiAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdmlldyNsb2FkXG4gICAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiR2aWV3XG4gICAgICAgKlxuICAgICAgICogQGRlc2NyaXB0aW9uXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgbmFtZVxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgb3B0aW9uIG9iamVjdC5cbiAgICAgICAqL1xuICAgICAgbG9hZDogZnVuY3Rpb24gbG9hZChuYW1lLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciByZXN1bHQsIGRlZmF1bHRzID0ge1xuICAgICAgICAgIHRlbXBsYXRlOiBudWxsLCBjb250cm9sbGVyOiBudWxsLCB2aWV3OiBudWxsLCBsb2NhbHM6IG51bGwsIG5vdGlmeTogdHJ1ZSwgYXN5bmM6IHRydWUsIHBhcmFtczoge31cbiAgICAgICAgfTtcbiAgICAgICAgb3B0aW9ucyA9IGV4dGVuZChkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKG9wdGlvbnMudmlldykge1xuICAgICAgICAgIHJlc3VsdCA9ICR0ZW1wbGF0ZUZhY3RvcnkuZnJvbUNvbmZpZyhvcHRpb25zLnZpZXcsIG9wdGlvbnMucGFyYW1zLCBvcHRpb25zLmxvY2Fscyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKS5wcm92aWRlcignJHZpZXcnLCAkVmlld1Byb3ZpZGVyKTtcblxuLyoqXG4gKiBAbmdkb2Mgb2JqZWN0XG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFByb3ZpZGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBQcm92aWRlciB0aGF0IHJldHVybnMgdGhlIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbH0gc2VydmljZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gJFZpZXdTY3JvbGxQcm92aWRlcigpIHtcblxuICB2YXIgdXNlQW5jaG9yU2Nyb2xsID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFByb3ZpZGVyI3VzZUFuY2hvclNjcm9sbFxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGxQcm92aWRlclxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUmV2ZXJ0cyBiYWNrIHRvIHVzaW5nIHRoZSBjb3JlIFtgJGFuY2hvclNjcm9sbGBdKGh0dHA6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nLiRhbmNob3JTY3JvbGwpIHNlcnZpY2UgZm9yXG4gICAqIHNjcm9sbGluZyBiYXNlZCBvbiB0aGUgdXJsIGFuY2hvci5cbiAgICovXG4gIHRoaXMudXNlQW5jaG9yU2Nyb2xsID0gZnVuY3Rpb24gKCkge1xuICAgIHVzZUFuY2hvclNjcm9sbCA9IHRydWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBvYmplY3RcbiAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGxcbiAgICpcbiAgICogQHJlcXVpcmVzICRhbmNob3JTY3JvbGxcbiAgICogQHJlcXVpcmVzICR0aW1lb3V0XG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBXaGVuIGNhbGxlZCB3aXRoIGEganFMaXRlIGVsZW1lbnQsIGl0IHNjcm9sbHMgdGhlIGVsZW1lbnQgaW50byB2aWV3IChhZnRlciBhXG4gICAqIGAkdGltZW91dGAgc28gdGhlIERPTSBoYXMgdGltZSB0byByZWZyZXNoKS5cbiAgICpcbiAgICogSWYgeW91IHByZWZlciB0byByZWx5IG9uIGAkYW5jaG9yU2Nyb2xsYCB0byBzY3JvbGwgdGhlIHZpZXcgdG8gdGhlIGFuY2hvcixcbiAgICogdGhpcyBjYW4gYmUgZW5hYmxlZCBieSBjYWxsaW5nIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFByb3ZpZGVyI21ldGhvZHNfdXNlQW5jaG9yU2Nyb2xsIGAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIudXNlQW5jaG9yU2Nyb2xsKClgfS5cbiAgICovXG4gIHRoaXMuJGdldCA9IFsnJGFuY2hvclNjcm9sbCcsICckdGltZW91dCcsIGZ1bmN0aW9uICgkYW5jaG9yU2Nyb2xsLCAkdGltZW91dCkge1xuICAgIGlmICh1c2VBbmNob3JTY3JvbGwpIHtcbiAgICAgIHJldHVybiAkYW5jaG9yU2Nyb2xsO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICRlbGVtZW50WzBdLnNjcm9sbEludG9WaWV3KCk7XG4gICAgICB9LCAwLCBmYWxzZSk7XG4gICAgfTtcbiAgfV07XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKS5wcm92aWRlcignJHVpVmlld1Njcm9sbCcsICRWaWV3U2Nyb2xsUHJvdmlkZXIpO1xuXG4vKipcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktdmlld1xuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gKiBAcmVxdWlyZXMgJGNvbXBpbGVcbiAqIEByZXF1aXJlcyAkY29udHJvbGxlclxuICogQHJlcXVpcmVzICRpbmplY3RvclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsXG4gKiBAcmVxdWlyZXMgJGRvY3VtZW50XG4gKlxuICogQHJlc3RyaWN0IEVDQVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIHVpLXZpZXcgZGlyZWN0aXZlIHRlbGxzICRzdGF0ZSB3aGVyZSB0byBwbGFjZSB5b3VyIHRlbXBsYXRlcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZz19IG5hbWUgQSB2aWV3IG5hbWUuIFRoZSBuYW1lIHNob3VsZCBiZSB1bmlxdWUgYW1vbmdzdCB0aGUgb3RoZXIgdmlld3MgaW4gdGhlXG4gKiBzYW1lIHN0YXRlLiBZb3UgY2FuIGhhdmUgdmlld3Mgb2YgdGhlIHNhbWUgbmFtZSB0aGF0IGxpdmUgaW4gZGlmZmVyZW50IHN0YXRlcy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZz19IGF1dG9zY3JvbGwgSXQgYWxsb3dzIHlvdSB0byBzZXQgdGhlIHNjcm9sbCBiZWhhdmlvciBvZiB0aGUgYnJvd3NlciB3aW5kb3dcbiAqIHdoZW4gYSB2aWV3IGlzIHBvcHVsYXRlZC4gQnkgZGVmYXVsdCwgJGFuY2hvclNjcm9sbCBpcyBvdmVycmlkZGVuIGJ5IHVpLXJvdXRlcidzIGN1c3RvbSBzY3JvbGxcbiAqIHNlcnZpY2UsIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbH0uIFRoaXMgY3VzdG9tIHNlcnZpY2UgbGV0J3MgeW91XG4gKiBzY3JvbGwgdWktdmlldyBlbGVtZW50cyBpbnRvIHZpZXcgd2hlbiB0aGV5IGFyZSBwb3B1bGF0ZWQgZHVyaW5nIGEgc3RhdGUgYWN0aXZhdGlvbi5cbiAqXG4gKiAqTm90ZTogVG8gcmV2ZXJ0IGJhY2sgdG8gb2xkIFtgJGFuY2hvclNjcm9sbGBdKGh0dHA6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nLiRhbmNob3JTY3JvbGwpXG4gKiBmdW5jdGlvbmFsaXR5LCBjYWxsIGAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIudXNlQW5jaG9yU2Nyb2xsKClgLipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZz19IG9ubG9hZCBFeHByZXNzaW9uIHRvIGV2YWx1YXRlIHdoZW5ldmVyIHRoZSB2aWV3IHVwZGF0ZXMuXG4gKlxuICogQGV4YW1wbGVcbiAqIEEgdmlldyBjYW4gYmUgdW5uYW1lZCBvciBuYW1lZC5cbiAqIDxwcmU+XG4gKiA8IS0tIFVubmFtZWQgLS0+XG4gKiA8ZGl2IHVpLXZpZXc+PC9kaXY+XG4gKlxuICogPCEtLSBOYW1lZCAtLT5cbiAqIDxkaXYgdWktdmlldz1cInZpZXdOYW1lXCI+PC9kaXY+XG4gKiA8L3ByZT5cbiAqXG4gKiBZb3UgY2FuIG9ubHkgaGF2ZSBvbmUgdW5uYW1lZCB2aWV3IHdpdGhpbiBhbnkgdGVtcGxhdGUgKG9yIHJvb3QgaHRtbCkuIElmIHlvdSBhcmUgb25seSB1c2luZyBhXG4gKiBzaW5nbGUgdmlldyBhbmQgaXQgaXMgdW5uYW1lZCB0aGVuIHlvdSBjYW4gcG9wdWxhdGUgaXQgbGlrZSBzbzpcbiAqIDxwcmU+XG4gKiA8ZGl2IHVpLXZpZXc+PC9kaXY+XG4gKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge1xuICogICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxuICogfSlcbiAqIDwvcHJlPlxuICpcbiAqIFRoZSBhYm92ZSBpcyBhIGNvbnZlbmllbnQgc2hvcnRjdXQgZXF1aXZhbGVudCB0byBzcGVjaWZ5aW5nIHlvdXIgdmlldyBleHBsaWNpdGx5IHdpdGggdGhlIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXIjbWV0aG9kc19zdGF0ZSBgdmlld3NgfVxuICogY29uZmlnIHByb3BlcnR5LCBieSBuYW1lLCBpbiB0aGlzIGNhc2UgYW4gZW1wdHkgbmFtZTpcbiAqIDxwcmU+XG4gKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge1xuICogICB2aWV3czoge1xuICogICAgIFwiXCI6IHtcbiAqICAgICAgIHRlbXBsYXRlOiBcIjxoMT5IRUxMTyE8L2gxPlwiXG4gKiAgICAgfVxuICogICB9ICAgIFxuICogfSlcbiAqIDwvcHJlPlxuICpcbiAqIEJ1dCB0eXBpY2FsbHkgeW91J2xsIG9ubHkgdXNlIHRoZSB2aWV3cyBwcm9wZXJ0eSBpZiB5b3UgbmFtZSB5b3VyIHZpZXcgb3IgaGF2ZSBtb3JlIHRoYW4gb25lIHZpZXdcbiAqIGluIHRoZSBzYW1lIHRlbXBsYXRlLiBUaGVyZSdzIG5vdCByZWFsbHkgYSBjb21wZWxsaW5nIHJlYXNvbiB0byBuYW1lIGEgdmlldyBpZiBpdHMgdGhlIG9ubHkgb25lLFxuICogYnV0IHlvdSBjb3VsZCBpZiB5b3Ugd2FudGVkLCBsaWtlIHNvOlxuICogPHByZT5cbiAqIDxkaXYgdWktdmlldz1cIm1haW5cIj48L2Rpdj5cbiAqIDwvcHJlPlxuICogPHByZT5cbiAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZVwiLCB7XG4gKiAgIHZpZXdzOiB7XG4gKiAgICAgXCJtYWluXCI6IHtcbiAqICAgICAgIHRlbXBsYXRlOiBcIjxoMT5IRUxMTyE8L2gxPlwiXG4gKiAgICAgfVxuICogICB9ICAgIFxuICogfSlcbiAqIDwvcHJlPlxuICpcbiAqIFJlYWxseSB0aG91Z2gsIHlvdSdsbCB1c2Ugdmlld3MgdG8gc2V0IHVwIG11bHRpcGxlIHZpZXdzOlxuICogPHByZT5cbiAqIDxkaXYgdWktdmlldz48L2Rpdj5cbiAqIDxkaXYgdWktdmlldz1cImNoYXJ0XCI+PC9kaXY+XG4gKiA8ZGl2IHVpLXZpZXc9XCJkYXRhXCI+PC9kaXY+XG4gKiA8L3ByZT5cbiAqXG4gKiA8cHJlPlxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcbiAqICAgdmlld3M6IHtcbiAqICAgICBcIlwiOiB7XG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxuICogICAgIH0sXG4gKiAgICAgXCJjaGFydFwiOiB7XG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8Y2hhcnRfdGhpbmcvPlwiXG4gKiAgICAgfSxcbiAqICAgICBcImRhdGFcIjoge1xuICogICAgICAgdGVtcGxhdGU6IFwiPGRhdGFfdGhpbmcvPlwiXG4gKiAgICAgfVxuICogICB9ICAgIFxuICogfSlcbiAqIDwvcHJlPlxuICpcbiAqIEV4YW1wbGVzIGZvciBgYXV0b3Njcm9sbGA6XG4gKlxuICogPHByZT5cbiAqIDwhLS0gSWYgYXV0b3Njcm9sbCBwcmVzZW50IHdpdGggbm8gZXhwcmVzc2lvbixcbiAqICAgICAgdGhlbiBzY3JvbGwgdWktdmlldyBpbnRvIHZpZXcgLS0+XG4gKiA8dWktdmlldyBhdXRvc2Nyb2xsLz5cbiAqXG4gKiA8IS0tIElmIGF1dG9zY3JvbGwgcHJlc2VudCB3aXRoIHZhbGlkIGV4cHJlc3Npb24sXG4gKiAgICAgIHRoZW4gc2Nyb2xsIHVpLXZpZXcgaW50byB2aWV3IGlmIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIHRydWUgLS0+XG4gKiA8dWktdmlldyBhdXRvc2Nyb2xsPSd0cnVlJy8+XG4gKiA8dWktdmlldyBhdXRvc2Nyb2xsPSdmYWxzZScvPlxuICogPHVpLXZpZXcgYXV0b3Njcm9sbD0nc2NvcGVWYXJpYWJsZScvPlxuICogPC9wcmU+XG4gKlxuICogUmVzb2x2ZSBkYXRhOlxuICpcbiAqIFRoZSByZXNvbHZlZCBkYXRhIGZyb20gdGhlIHN0YXRlJ3MgYHJlc29sdmVgIGJsb2NrIGlzIHBsYWNlZCBvbiB0aGUgc2NvcGUgYXMgYCRyZXNvbHZlYCAodGhpc1xuICogY2FuIGJlIGN1c3RvbWl6ZWQgdXNpbmcgW1tWaWV3RGVjbGFyYXRpb24ucmVzb2x2ZUFzXV0pLiAgVGhpcyBjYW4gYmUgdGhlbiBhY2Nlc3NlZCBmcm9tIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBOb3RlIHRoYXQgd2hlbiBgY29udHJvbGxlckFzYCBpcyBiZWluZyB1c2VkLCBgJHJlc29sdmVgIGlzIHNldCBvbiB0aGUgY29udHJvbGxlciBpbnN0YW5jZSAqYWZ0ZXIqIHRoZVxuICogY29udHJvbGxlciBpcyBpbnN0YW50aWF0ZWQuICBUaGUgYCRvbkluaXQoKWAgaG9vayBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGluaXRpYWxpemF0aW9uIGNvZGUgd2hpY2hcbiAqIGRlcGVuZHMgb24gYCRyZXNvbHZlYCBkYXRhLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2Ugb2YgJHJlc29sdmUgaW4gYSB2aWV3IHRlbXBsYXRlXG4gKiA8cHJlPlxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gKiAgIHRlbXBsYXRlOiAnPG15LWNvbXBvbmVudCB1c2VyPVwiJHJlc29sdmUudXNlclwiPjwvbXktY29tcG9uZW50PicsXG4gKiAgIHJlc29sdmU6IHtcbiAqICAgICB1c2VyOiBmdW5jdGlvbihVc2VyU2VydmljZSkgeyByZXR1cm4gVXNlclNlcnZpY2UuZmV0Y2hVc2VyKCk7IH1cbiAqICAgfVxuICogfSk7XG4gKiA8L3ByZT5cbiAqL1xuJFZpZXdEaXJlY3RpdmUuJGluamVjdCA9IFsnJHN0YXRlJywgJyRpbmplY3RvcicsICckdWlWaWV3U2Nyb2xsJywgJyRpbnRlcnBvbGF0ZScsICckcSddO1xuZnVuY3Rpb24gJFZpZXdEaXJlY3RpdmUoICAgJHN0YXRlLCAgICRpbmplY3RvciwgICAkdWlWaWV3U2Nyb2xsLCAgICRpbnRlcnBvbGF0ZSwgICAkcSkge1xuXG4gIGZ1bmN0aW9uIGdldFNlcnZpY2UoKSB7XG4gICAgcmV0dXJuICgkaW5qZWN0b3IuaGFzKSA/IGZ1bmN0aW9uKHNlcnZpY2UpIHtcbiAgICAgIHJldHVybiAkaW5qZWN0b3IuaGFzKHNlcnZpY2UpID8gJGluamVjdG9yLmdldChzZXJ2aWNlKSA6IG51bGw7XG4gICAgfSA6IGZ1bmN0aW9uKHNlcnZpY2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KHNlcnZpY2UpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgdmFyIHNlcnZpY2UgPSBnZXRTZXJ2aWNlKCksXG4gICAgICAkYW5pbWF0b3IgPSBzZXJ2aWNlKCckYW5pbWF0b3InKSxcbiAgICAgICRhbmltYXRlID0gc2VydmljZSgnJGFuaW1hdGUnKTtcblxuICAvLyBSZXR1cm5zIGEgc2V0IG9mIERPTSBtYW5pcHVsYXRpb24gZnVuY3Rpb25zIGJhc2VkIG9uIHdoaWNoIEFuZ3VsYXIgdmVyc2lvblxuICAvLyBpdCBzaG91bGQgdXNlXG4gIGZ1bmN0aW9uIGdldFJlbmRlcmVyKGF0dHJzLCBzY29wZSkge1xuICAgIHZhciBzdGF0aWNzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBlbnRlcjogZnVuY3Rpb24gKGVsZW1lbnQsIHRhcmdldCwgY2IpIHsgdGFyZ2V0LmFmdGVyKGVsZW1lbnQpOyBjYigpOyB9LFxuICAgICAgICBsZWF2ZTogZnVuY3Rpb24gKGVsZW1lbnQsIGNiKSB7IGVsZW1lbnQucmVtb3ZlKCk7IGNiKCk7IH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIGlmICgkYW5pbWF0ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIHRhcmdldCwgY2IpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci52ZXJzaW9uLm1pbm9yID4gMikge1xuICAgICAgICAgICAgJGFuaW1hdGUuZW50ZXIoZWxlbWVudCwgbnVsbCwgdGFyZ2V0KS50aGVuKGNiKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJGFuaW1hdGUuZW50ZXIoZWxlbWVudCwgbnVsbCwgdGFyZ2V0LCBjYik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBsZWF2ZTogZnVuY3Rpb24oZWxlbWVudCwgY2IpIHtcbiAgICAgICAgICBpZiAoYW5ndWxhci52ZXJzaW9uLm1pbm9yID4gMikge1xuICAgICAgICAgICAgJGFuaW1hdGUubGVhdmUoZWxlbWVudCkudGhlbihjYik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRhbmltYXRlLmxlYXZlKGVsZW1lbnQsIGNiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKCRhbmltYXRvcikge1xuICAgICAgdmFyIGFuaW1hdGUgPSAkYW5pbWF0b3IgJiYgJGFuaW1hdG9yKHNjb3BlLCBhdHRycyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGVudGVyOiBmdW5jdGlvbihlbGVtZW50LCB0YXJnZXQsIGNiKSB7YW5pbWF0ZS5lbnRlcihlbGVtZW50LCBudWxsLCB0YXJnZXQpOyBjYigpOyB9LFxuICAgICAgICBsZWF2ZTogZnVuY3Rpb24oZWxlbWVudCwgY2IpIHsgYW5pbWF0ZS5sZWF2ZShlbGVtZW50KTsgY2IoKTsgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RhdGljcygpO1xuICB9XG5cbiAgdmFyIGRpcmVjdGl2ZSA9IHtcbiAgICByZXN0cmljdDogJ0VDQScsXG4gICAgdGVybWluYWw6IHRydWUsXG4gICAgcHJpb3JpdHk6IDQwMCxcbiAgICB0cmFuc2NsdWRlOiAnZWxlbWVudCcsXG4gICAgY29tcGlsZTogZnVuY3Rpb24gKHRFbGVtZW50LCB0QXR0cnMsICR0cmFuc2NsdWRlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCAkZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgdmFyIHByZXZpb3VzRWwsIGN1cnJlbnRFbCwgY3VycmVudFNjb3BlLCBsYXRlc3RMb2NhbHMsXG4gICAgICAgICAgICBvbmxvYWRFeHAgICAgID0gYXR0cnMub25sb2FkIHx8ICcnLFxuICAgICAgICAgICAgYXV0b1Njcm9sbEV4cCA9IGF0dHJzLmF1dG9zY3JvbGwsXG4gICAgICAgICAgICByZW5kZXJlciAgICAgID0gZ2V0UmVuZGVyZXIoYXR0cnMsIHNjb3BlKSxcbiAgICAgICAgICAgIGluaGVyaXRlZCAgICAgPSAkZWxlbWVudC5pbmhlcml0ZWREYXRhKCckdWlWaWV3Jyk7XG5cbiAgICAgICAgc2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdXBkYXRlVmlldyhmYWxzZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHVwZGF0ZVZpZXcodHJ1ZSk7XG5cbiAgICAgICAgZnVuY3Rpb24gY2xlYW51cExhc3RWaWV3KCkge1xuICAgICAgICAgIGlmIChwcmV2aW91c0VsKSB7XG4gICAgICAgICAgICBwcmV2aW91c0VsLnJlbW92ZSgpO1xuICAgICAgICAgICAgcHJldmlvdXNFbCA9IG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGN1cnJlbnRTY29wZSkge1xuICAgICAgICAgICAgY3VycmVudFNjb3BlLiRkZXN0cm95KCk7XG4gICAgICAgICAgICBjdXJyZW50U2NvcGUgPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjdXJyZW50RWwpIHtcbiAgICAgICAgICAgIHZhciAkdWlWaWV3RGF0YSA9IGN1cnJlbnRFbC5kYXRhKCckdWlWaWV3QW5pbScpO1xuICAgICAgICAgICAgcmVuZGVyZXIubGVhdmUoY3VycmVudEVsLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgJHVpVmlld0RhdGEuJCRhbmltTGVhdmUucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICBwcmV2aW91c0VsID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwcmV2aW91c0VsID0gY3VycmVudEVsO1xuICAgICAgICAgICAgY3VycmVudEVsID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVWaWV3KGZpcnN0VGltZSkge1xuICAgICAgICAgIHZhciBuZXdTY29wZSxcbiAgICAgICAgICAgICAgbmFtZSAgICAgICAgICAgID0gZ2V0VWlWaWV3TmFtZShzY29wZSwgYXR0cnMsICRlbGVtZW50LCAkaW50ZXJwb2xhdGUpLFxuICAgICAgICAgICAgICBwcmV2aW91c0xvY2FscyAgPSBuYW1lICYmICRzdGF0ZS4kY3VycmVudCAmJiAkc3RhdGUuJGN1cnJlbnQubG9jYWxzW25hbWVdO1xuXG4gICAgICAgICAgaWYgKCFmaXJzdFRpbWUgJiYgcHJldmlvdXNMb2NhbHMgPT09IGxhdGVzdExvY2FscykgcmV0dXJuOyAvLyBub3RoaW5nIHRvIGRvXG4gICAgICAgICAgbmV3U2NvcGUgPSBzY29wZS4kbmV3KCk7XG4gICAgICAgICAgbGF0ZXN0TG9jYWxzID0gJHN0YXRlLiRjdXJyZW50LmxvY2Fsc1tuYW1lXTtcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktdmlldyMkdmlld0NvbnRlbnRMb2FkaW5nXG4gICAgICAgICAgICogQGV2ZW50T2YgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS12aWV3XG4gICAgICAgICAgICogQGV2ZW50VHlwZSBlbWl0cyBvbiB1aS12aWV3IGRpcmVjdGl2ZSBzY29wZVxuICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAqXG4gICAgICAgICAgICogRmlyZWQgb25jZSB0aGUgdmlldyAqKmJlZ2lucyBsb2FkaW5nKiosICpiZWZvcmUqIHRoZSBET00gaXMgcmVuZGVyZWQuXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgb2JqZWN0LlxuICAgICAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2aWV3TmFtZSBOYW1lIG9mIHRoZSB2aWV3LlxuICAgICAgICAgICAqL1xuICAgICAgICAgIG5ld1Njb3BlLiRlbWl0KCckdmlld0NvbnRlbnRMb2FkaW5nJywgbmFtZSk7XG5cbiAgICAgICAgICB2YXIgY2xvbmUgPSAkdHJhbnNjbHVkZShuZXdTY29wZSwgZnVuY3Rpb24oY2xvbmUpIHtcbiAgICAgICAgICAgIHZhciBhbmltRW50ZXIgPSAkcS5kZWZlcigpLCBhbmltTGVhdmUgPSAkcS5kZWZlcigpO1xuICAgICAgICAgICAgdmFyIHZpZXdBbmltRGF0YSA9IHtcbiAgICAgICAgICAgICAgJGFuaW1FbnRlcjogYW5pbUVudGVyLnByb21pc2UsXG4gICAgICAgICAgICAgICRhbmltTGVhdmU6IGFuaW1MZWF2ZS5wcm9taXNlLFxuICAgICAgICAgICAgICAkJGFuaW1MZWF2ZTogYW5pbUxlYXZlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjbG9uZS5kYXRhKCckdWlWaWV3QW5pbScsIHZpZXdBbmltRGF0YSk7XG4gICAgICAgICAgICByZW5kZXJlci5lbnRlcihjbG9uZSwgJGVsZW1lbnQsIGZ1bmN0aW9uIG9uVWlWaWV3RW50ZXIoKSB7XG4gICAgICAgICAgICAgIGFuaW1FbnRlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgIGlmKGN1cnJlbnRTY29wZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRTY29wZS4kZW1pdCgnJHZpZXdDb250ZW50QW5pbWF0aW9uRW5kZWQnKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZChhdXRvU2Nyb2xsRXhwKSAmJiAhYXV0b1Njcm9sbEV4cCB8fCBzY29wZS4kZXZhbChhdXRvU2Nyb2xsRXhwKSkge1xuICAgICAgICAgICAgICAgICR1aVZpZXdTY3JvbGwoY2xvbmUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNsZWFudXBMYXN0VmlldygpO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY3VycmVudEVsID0gY2xvbmU7XG4gICAgICAgICAgY3VycmVudFNjb3BlID0gbmV3U2NvcGU7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQG5nZG9jIGV2ZW50XG4gICAgICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS12aWV3IyR2aWV3Q29udGVudExvYWRlZFxuICAgICAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktdmlld1xuICAgICAgICAgICAqIEBldmVudFR5cGUgZW1pdHMgb24gdWktdmlldyBkaXJlY3RpdmUgc2NvcGVcbiAgICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICAgKiBGaXJlZCBvbmNlIHRoZSB2aWV3IGlzICoqbG9hZGVkKiosICphZnRlciogdGhlIERPTSBpcyByZW5kZXJlZC5cbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXG4gICAgICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHZpZXdOYW1lIE5hbWUgb2YgdGhlIHZpZXcuXG4gICAgICAgICAgICovXG4gICAgICAgICAgY3VycmVudFNjb3BlLiRlbWl0KCckdmlld0NvbnRlbnRMb2FkZWQnLCBuYW1lKTtcbiAgICAgICAgICBjdXJyZW50U2NvcGUuJGV2YWwob25sb2FkRXhwKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGRpcmVjdGl2ZTtcbn1cblxuJFZpZXdEaXJlY3RpdmVGaWxsLiRpbmplY3QgPSBbJyRjb21waWxlJywgJyRjb250cm9sbGVyJywgJyRzdGF0ZScsICckaW50ZXJwb2xhdGUnXTtcbmZ1bmN0aW9uICRWaWV3RGlyZWN0aXZlRmlsbCAoICAkY29tcGlsZSwgICAkY29udHJvbGxlciwgICAkc3RhdGUsICAgJGludGVycG9sYXRlKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQ0EnLFxuICAgIHByaW9yaXR5OiAtNDAwLFxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCkge1xuICAgICAgdmFyIGluaXRpYWwgPSB0RWxlbWVudC5odG1sKCk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCAkZWxlbWVudCwgYXR0cnMpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSAkc3RhdGUuJGN1cnJlbnQsXG4gICAgICAgICAgICBuYW1lID0gZ2V0VWlWaWV3TmFtZShzY29wZSwgYXR0cnMsICRlbGVtZW50LCAkaW50ZXJwb2xhdGUpLFxuICAgICAgICAgICAgbG9jYWxzICA9IGN1cnJlbnQgJiYgY3VycmVudC5sb2NhbHNbbmFtZV07XG5cbiAgICAgICAgaWYgKCEgbG9jYWxzKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJGVsZW1lbnQuZGF0YSgnJHVpVmlldycsIHsgbmFtZTogbmFtZSwgc3RhdGU6IGxvY2Fscy4kJHN0YXRlIH0pO1xuICAgICAgICAkZWxlbWVudC5odG1sKGxvY2Fscy4kdGVtcGxhdGUgPyBsb2NhbHMuJHRlbXBsYXRlIDogaW5pdGlhbCk7XG5cbiAgICAgICAgdmFyIHJlc29sdmVEYXRhID0gYW5ndWxhci5leHRlbmQoe30sIGxvY2Fscyk7XG4gICAgICAgIHNjb3BlW2xvY2Fscy4kJHJlc29sdmVBc10gPSByZXNvbHZlRGF0YTtcblxuICAgICAgICB2YXIgbGluayA9ICRjb21waWxlKCRlbGVtZW50LmNvbnRlbnRzKCkpO1xuXG4gICAgICAgIGlmIChsb2NhbHMuJCRjb250cm9sbGVyKSB7XG4gICAgICAgICAgbG9jYWxzLiRzY29wZSA9IHNjb3BlO1xuICAgICAgICAgIGxvY2Fscy4kZWxlbWVudCA9ICRlbGVtZW50O1xuICAgICAgICAgIHZhciBjb250cm9sbGVyID0gJGNvbnRyb2xsZXIobG9jYWxzLiQkY29udHJvbGxlciwgbG9jYWxzKTtcbiAgICAgICAgICBpZiAobG9jYWxzLiQkY29udHJvbGxlckFzKSB7XG4gICAgICAgICAgICBzY29wZVtsb2NhbHMuJCRjb250cm9sbGVyQXNdID0gY29udHJvbGxlcjtcbiAgICAgICAgICAgIHNjb3BlW2xvY2Fscy4kJGNvbnRyb2xsZXJBc11bbG9jYWxzLiQkcmVzb2x2ZUFzXSA9IHJlc29sdmVEYXRhO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaXNGdW5jdGlvbihjb250cm9sbGVyLiRvbkluaXQpKSBjb250cm9sbGVyLiRvbkluaXQoKTtcbiAgICAgICAgICAkZWxlbWVudC5kYXRhKCckbmdDb250cm9sbGVyQ29udHJvbGxlcicsIGNvbnRyb2xsZXIpO1xuICAgICAgICAgICRlbGVtZW50LmNoaWxkcmVuKCkuZGF0YSgnJG5nQ29udHJvbGxlckNvbnRyb2xsZXInLCBjb250cm9sbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpbmsoc2NvcGUpO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogU2hhcmVkIHVpLXZpZXcgY29kZSBmb3IgYm90aCBkaXJlY3RpdmVzOlxuICogR2l2ZW4gc2NvcGUsIGVsZW1lbnQsIGFuZCBpdHMgYXR0cmlidXRlcywgcmV0dXJuIHRoZSB2aWV3J3MgbmFtZVxuICovXG5mdW5jdGlvbiBnZXRVaVZpZXdOYW1lKHNjb3BlLCBhdHRycywgZWxlbWVudCwgJGludGVycG9sYXRlKSB7XG4gIHZhciBuYW1lID0gJGludGVycG9sYXRlKGF0dHJzLnVpVmlldyB8fCBhdHRycy5uYW1lIHx8ICcnKShzY29wZSk7XG4gIHZhciB1aVZpZXdDcmVhdGVkQnkgPSBlbGVtZW50LmluaGVyaXRlZERhdGEoJyR1aVZpZXcnKTtcbiAgcmV0dXJuIG5hbWUuaW5kZXhPZignQCcpID49IDAgPyAgbmFtZSA6ICAobmFtZSArICdAJyArICh1aVZpZXdDcmVhdGVkQnkgPyB1aVZpZXdDcmVhdGVkQnkuc3RhdGUubmFtZSA6ICcnKSk7XG59XG5cbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKS5kaXJlY3RpdmUoJ3VpVmlldycsICRWaWV3RGlyZWN0aXZlKTtcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKS5kaXJlY3RpdmUoJ3VpVmlldycsICRWaWV3RGlyZWN0aXZlRmlsbCk7XG5cbmZ1bmN0aW9uIHBhcnNlU3RhdGVSZWYocmVmLCBjdXJyZW50KSB7XG4gIHZhciBwcmVwYXJzZWQgPSByZWYubWF0Y2goL15cXHMqKHtbXn1dKn0pXFxzKiQvKSwgcGFyc2VkO1xuICBpZiAocHJlcGFyc2VkKSByZWYgPSBjdXJyZW50ICsgJygnICsgcHJlcGFyc2VkWzFdICsgJyknO1xuICBwYXJzZWQgPSByZWYucmVwbGFjZSgvXFxuL2csIFwiIFwiKS5tYXRjaCgvXihbXihdKz8pXFxzKihcXCgoLiopXFwpKT8kLyk7XG4gIGlmICghcGFyc2VkIHx8IHBhcnNlZC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RhdGUgcmVmICdcIiArIHJlZiArIFwiJ1wiKTtcbiAgcmV0dXJuIHsgc3RhdGU6IHBhcnNlZFsxXSwgcGFyYW1FeHByOiBwYXJzZWRbM10gfHwgbnVsbCB9O1xufVxuXG5mdW5jdGlvbiBzdGF0ZUNvbnRleHQoZWwpIHtcbiAgdmFyIHN0YXRlRGF0YSA9IGVsLnBhcmVudCgpLmluaGVyaXRlZERhdGEoJyR1aVZpZXcnKTtcblxuICBpZiAoc3RhdGVEYXRhICYmIHN0YXRlRGF0YS5zdGF0ZSAmJiBzdGF0ZURhdGEuc3RhdGUubmFtZSkge1xuICAgIHJldHVybiBzdGF0ZURhdGEuc3RhdGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0VHlwZUluZm8oZWwpIHtcbiAgLy8gU1ZHQUVsZW1lbnQgZG9lcyBub3QgdXNlIHRoZSBocmVmIGF0dHJpYnV0ZSwgYnV0IHJhdGhlciB0aGUgJ3hsaW5rSHJlZicgYXR0cmlidXRlLlxuICB2YXIgaXNTdmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZWwucHJvcCgnaHJlZicpKSA9PT0gJ1tvYmplY3QgU1ZHQW5pbWF0ZWRTdHJpbmddJztcbiAgdmFyIGlzRm9ybSA9IGVsWzBdLm5vZGVOYW1lID09PSBcIkZPUk1cIjtcblxuICByZXR1cm4ge1xuICAgIGF0dHI6IGlzRm9ybSA/IFwiYWN0aW9uXCIgOiAoaXNTdmcgPyAneGxpbms6aHJlZicgOiAnaHJlZicpLFxuICAgIGlzQW5jaG9yOiBlbC5wcm9wKFwidGFnTmFtZVwiKS50b1VwcGVyQ2FzZSgpID09PSBcIkFcIixcbiAgICBjbGlja2FibGU6ICFpc0Zvcm1cbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xpY2tIb29rKGVsLCAkc3RhdGUsICR0aW1lb3V0LCB0eXBlLCBjdXJyZW50KSB7XG4gIHJldHVybiBmdW5jdGlvbihlKSB7XG4gICAgdmFyIGJ1dHRvbiA9IGUud2hpY2ggfHwgZS5idXR0b24sIHRhcmdldCA9IGN1cnJlbnQoKTtcblxuICAgIGlmICghKGJ1dHRvbiA+IDEgfHwgZS5jdHJsS2V5IHx8IGUubWV0YUtleSB8fCBlLnNoaWZ0S2V5IHx8IGVsLmF0dHIoJ3RhcmdldCcpKSkge1xuICAgICAgLy8gSEFDSzogVGhpcyBpcyB0byBhbGxvdyBuZy1jbGlja3MgdG8gYmUgcHJvY2Vzc2VkIGJlZm9yZSB0aGUgdHJhbnNpdGlvbiBpcyBpbml0aWF0ZWQ6XG4gICAgICB2YXIgdHJhbnNpdGlvbiA9ICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAkc3RhdGUuZ28odGFyZ2V0LnN0YXRlLCB0YXJnZXQucGFyYW1zLCB0YXJnZXQub3B0aW9ucyk7XG4gICAgICB9KTtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgLy8gaWYgdGhlIHN0YXRlIGhhcyBubyBVUkwsIGlnbm9yZSBvbmUgcHJldmVudERlZmF1bHQgZnJvbSB0aGUgPGE+IGRpcmVjdGl2ZS5cbiAgICAgIHZhciBpZ25vcmVQcmV2ZW50RGVmYXVsdENvdW50ID0gdHlwZS5pc0FuY2hvciAmJiAhdGFyZ2V0LmhyZWYgPyAxOiAwO1xuXG4gICAgICBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChpZ25vcmVQcmV2ZW50RGVmYXVsdENvdW50LS0gPD0gMCkgJHRpbWVvdXQuY2FuY2VsKHRyYW5zaXRpb24pO1xuICAgICAgfTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRPcHRzKGVsLCAkc3RhdGUpIHtcbiAgcmV0dXJuIHsgcmVsYXRpdmU6IHN0YXRlQ29udGV4dChlbCkgfHwgJHN0YXRlLiRjdXJyZW50LCBpbmhlcml0OiB0cnVlIH07XG59XG5cbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zcmVmXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAqIEByZXF1aXJlcyAkdGltZW91dFxuICpcbiAqIEByZXN0cmljdCBBXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIGRpcmVjdGl2ZSB0aGF0IGJpbmRzIGEgbGluayAoYDxhPmAgdGFnKSB0byBhIHN0YXRlLiBJZiB0aGUgc3RhdGUgaGFzIGFuIGFzc29jaWF0ZWRcbiAqIFVSTCwgdGhlIGRpcmVjdGl2ZSB3aWxsIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGUgJiB1cGRhdGUgdGhlIGBocmVmYCBhdHRyaWJ1dGUgdmlhXG4gKiB0aGUge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19ocmVmICRzdGF0ZS5ocmVmKCl9IG1ldGhvZC4gQ2xpY2tpbmdcbiAqIHRoZSBsaW5rIHdpbGwgdHJpZ2dlciBhIHN0YXRlIHRyYW5zaXRpb24gd2l0aCBvcHRpb25hbCBwYXJhbWV0ZXJzLlxuICpcbiAqIEFsc28gbWlkZGxlLWNsaWNraW5nLCByaWdodC1jbGlja2luZywgYW5kIGN0cmwtY2xpY2tpbmcgb24gdGhlIGxpbmsgd2lsbCBiZVxuICogaGFuZGxlZCBuYXRpdmVseSBieSB0aGUgYnJvd3Nlci5cbiAqXG4gKiBZb3UgY2FuIGFsc28gdXNlIHJlbGF0aXZlIHN0YXRlIHBhdGhzIHdpdGhpbiB1aS1zcmVmLCBqdXN0IGxpa2UgdGhlIHJlbGF0aXZlXG4gKiBwYXRocyBwYXNzZWQgdG8gYCRzdGF0ZS5nbygpYC4gWW91IGp1c3QgbmVlZCB0byBiZSBhd2FyZSB0aGF0IHRoZSBwYXRoIGlzIHJlbGF0aXZlXG4gKiB0byB0aGUgc3RhdGUgdGhhdCB0aGUgbGluayBsaXZlcyBpbiwgaW4gb3RoZXIgd29yZHMgdGhlIHN0YXRlIHRoYXQgbG9hZGVkIHRoZVxuICogdGVtcGxhdGUgY29udGFpbmluZyB0aGUgbGluay5cbiAqXG4gKiBZb3UgY2FuIHNwZWNpZnkgb3B0aW9ucyB0byBwYXNzIHRvIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfZ28gJHN0YXRlLmdvKCl9XG4gKiB1c2luZyB0aGUgYHVpLXNyZWYtb3B0c2AgYXR0cmlidXRlLiBPcHRpb25zIGFyZSByZXN0cmljdGVkIHRvIGBsb2NhdGlvbmAsIGBpbmhlcml0YCxcbiAqIGFuZCBgcmVsb2FkYC5cbiAqXG4gKiBAZXhhbXBsZVxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgaG93IHlvdSdkIHVzZSB1aS1zcmVmIGFuZCBob3cgaXQgd291bGQgY29tcGlsZS4gSWYgeW91IGhhdmUgdGhlXG4gKiBmb2xsb3dpbmcgdGVtcGxhdGU6XG4gKiA8cHJlPlxuICogPGEgdWktc3JlZj1cImhvbWVcIj5Ib21lPC9hPiB8IDxhIHVpLXNyZWY9XCJhYm91dFwiPkFib3V0PC9hPiB8IDxhIHVpLXNyZWY9XCJ7cGFnZTogMn1cIj5OZXh0IHBhZ2U8L2E+XG4gKlxuICogPHVsPlxuICogICAgIDxsaSBuZy1yZXBlYXQ9XCJjb250YWN0IGluIGNvbnRhY3RzXCI+XG4gKiAgICAgICAgIDxhIHVpLXNyZWY9XCJjb250YWN0cy5kZXRhaWwoeyBpZDogY29udGFjdC5pZCB9KVwiPnt7IGNvbnRhY3QubmFtZSB9fTwvYT5cbiAqICAgICA8L2xpPlxuICogPC91bD5cbiAqIDwvcHJlPlxuICpcbiAqIFRoZW4gdGhlIGNvbXBpbGVkIGh0bWwgd291bGQgYmUgKGFzc3VtaW5nIEh0bWw1TW9kZSBpcyBvZmYgYW5kIGN1cnJlbnQgc3RhdGUgaXMgY29udGFjdHMpOlxuICogPHByZT5cbiAqIDxhIGhyZWY9XCIjL2hvbWVcIiB1aS1zcmVmPVwiaG9tZVwiPkhvbWU8L2E+IHwgPGEgaHJlZj1cIiMvYWJvdXRcIiB1aS1zcmVmPVwiYWJvdXRcIj5BYm91dDwvYT4gfCA8YSBocmVmPVwiIy9jb250YWN0cz9wYWdlPTJcIiB1aS1zcmVmPVwie3BhZ2U6IDJ9XCI+TmV4dCBwYWdlPC9hPlxuICpcbiAqIDx1bD5cbiAqICAgICA8bGkgbmctcmVwZWF0PVwiY29udGFjdCBpbiBjb250YWN0c1wiPlxuICogICAgICAgICA8YSBocmVmPVwiIy9jb250YWN0cy8xXCIgdWktc3JlZj1cImNvbnRhY3RzLmRldGFpbCh7IGlkOiBjb250YWN0LmlkIH0pXCI+Sm9lPC9hPlxuICogICAgIDwvbGk+XG4gKiAgICAgPGxpIG5nLXJlcGVhdD1cImNvbnRhY3QgaW4gY29udGFjdHNcIj5cbiAqICAgICAgICAgPGEgaHJlZj1cIiMvY29udGFjdHMvMlwiIHVpLXNyZWY9XCJjb250YWN0cy5kZXRhaWwoeyBpZDogY29udGFjdC5pZCB9KVwiPkFsaWNlPC9hPlxuICogICAgIDwvbGk+XG4gKiAgICAgPGxpIG5nLXJlcGVhdD1cImNvbnRhY3QgaW4gY29udGFjdHNcIj5cbiAqICAgICAgICAgPGEgaHJlZj1cIiMvY29udGFjdHMvM1wiIHVpLXNyZWY9XCJjb250YWN0cy5kZXRhaWwoeyBpZDogY29udGFjdC5pZCB9KVwiPkJvYjwvYT5cbiAqICAgICA8L2xpPlxuICogPC91bD5cbiAqXG4gKiA8YSB1aS1zcmVmPVwiaG9tZVwiIHVpLXNyZWYtb3B0cz1cIntyZWxvYWQ6IHRydWV9XCI+SG9tZTwvYT5cbiAqIDwvcHJlPlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1aS1zcmVmICdzdGF0ZU5hbWUnIGNhbiBiZSBhbnkgdmFsaWQgYWJzb2x1dGUgb3IgcmVsYXRpdmUgc3RhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSB1aS1zcmVmLW9wdHMgb3B0aW9ucyB0byBwYXNzIHRvIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfZ28gJHN0YXRlLmdvKCl9XG4gKi9cbiRTdGF0ZVJlZkRpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc3RhdGUnLCAnJHRpbWVvdXQnXTtcbmZ1bmN0aW9uICRTdGF0ZVJlZkRpcmVjdGl2ZSgkc3RhdGUsICR0aW1lb3V0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICByZXF1aXJlOiBbJz9edWlTcmVmQWN0aXZlJywgJz9edWlTcmVmQWN0aXZlRXEnXSxcbiAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMsIHVpU3JlZkFjdGl2ZSkge1xuICAgICAgdmFyIHJlZiAgICA9IHBhcnNlU3RhdGVSZWYoYXR0cnMudWlTcmVmLCAkc3RhdGUuY3VycmVudC5uYW1lKTtcbiAgICAgIHZhciBkZWYgICAgPSB7IHN0YXRlOiByZWYuc3RhdGUsIGhyZWY6IG51bGwsIHBhcmFtczogbnVsbCB9O1xuICAgICAgdmFyIHR5cGUgICA9IGdldFR5cGVJbmZvKGVsZW1lbnQpO1xuICAgICAgdmFyIGFjdGl2ZSA9IHVpU3JlZkFjdGl2ZVsxXSB8fCB1aVNyZWZBY3RpdmVbMF07XG4gICAgICB2YXIgdW5saW5rSW5mb0ZuID0gbnVsbDtcbiAgICAgIHZhciBob29rRm47XG5cbiAgICAgIGRlZi5vcHRpb25zID0gZXh0ZW5kKGRlZmF1bHRPcHRzKGVsZW1lbnQsICRzdGF0ZSksIGF0dHJzLnVpU3JlZk9wdHMgPyBzY29wZS4kZXZhbChhdHRycy51aVNyZWZPcHRzKSA6IHt9KTtcblxuICAgICAgdmFyIHVwZGF0ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICBpZiAodmFsKSBkZWYucGFyYW1zID0gYW5ndWxhci5jb3B5KHZhbCk7XG4gICAgICAgIGRlZi5ocmVmID0gJHN0YXRlLmhyZWYocmVmLnN0YXRlLCBkZWYucGFyYW1zLCBkZWYub3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHVubGlua0luZm9GbikgdW5saW5rSW5mb0ZuKCk7XG4gICAgICAgIGlmIChhY3RpdmUpIHVubGlua0luZm9GbiA9IGFjdGl2ZS4kJGFkZFN0YXRlSW5mbyhyZWYuc3RhdGUsIGRlZi5wYXJhbXMpO1xuICAgICAgICBpZiAoZGVmLmhyZWYgIT09IG51bGwpIGF0dHJzLiRzZXQodHlwZS5hdHRyLCBkZWYuaHJlZik7XG4gICAgICB9O1xuXG4gICAgICBpZiAocmVmLnBhcmFtRXhwcikge1xuICAgICAgICBzY29wZS4kd2F0Y2gocmVmLnBhcmFtRXhwciwgZnVuY3Rpb24odmFsKSB7IGlmICh2YWwgIT09IGRlZi5wYXJhbXMpIHVwZGF0ZSh2YWwpOyB9LCB0cnVlKTtcbiAgICAgICAgZGVmLnBhcmFtcyA9IGFuZ3VsYXIuY29weShzY29wZS4kZXZhbChyZWYucGFyYW1FeHByKSk7XG4gICAgICB9XG4gICAgICB1cGRhdGUoKTtcblxuICAgICAgaWYgKCF0eXBlLmNsaWNrYWJsZSkgcmV0dXJuO1xuICAgICAgaG9va0ZuID0gY2xpY2tIb29rKGVsZW1lbnQsICRzdGF0ZSwgJHRpbWVvdXQsIHR5cGUsIGZ1bmN0aW9uKCkgeyByZXR1cm4gZGVmOyB9KTtcbiAgICAgIGVsZW1lbnQuYmluZChcImNsaWNrXCIsIGhvb2tGbik7XG4gICAgICBzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGVsZW1lbnQudW5iaW5kKFwiY2xpY2tcIiwgaG9va0ZuKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBAbmdkb2MgZGlyZWN0aXZlXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXN0YXRlXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS51aVNyZWZcbiAqXG4gKiBAcmVzdHJpY3QgQVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogTXVjaCBsaWtlIHVpLXNyZWYsIGJ1dCB3aWxsIGFjY2VwdCBuYW1lZCAkc2NvcGUgcHJvcGVydGllcyB0byBldmFsdWF0ZSBmb3IgYSBzdGF0ZSBkZWZpbml0aW9uLFxuICogcGFyYW1zIGFuZCBvdmVycmlkZSBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSB1aS1zdGF0ZSAnc3RhdGVOYW1lJyBjYW4gYmUgYW55IHZhbGlkIGFic29sdXRlIG9yIHJlbGF0aXZlIHN0YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gdWktc3RhdGUtcGFyYW1zIHBhcmFtcyB0byBwYXNzIHRvIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfaHJlZiAkc3RhdGUuaHJlZigpfVxuICogQHBhcmFtIHtPYmplY3R9IHVpLXN0YXRlLW9wdHMgb3B0aW9ucyB0byBwYXNzIHRvIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfZ28gJHN0YXRlLmdvKCl9XG4gKi9cbiRTdGF0ZVJlZkR5bmFtaWNEaXJlY3RpdmUuJGluamVjdCA9IFsnJHN0YXRlJywgJyR0aW1lb3V0J107XG5mdW5jdGlvbiAkU3RhdGVSZWZEeW5hbWljRGlyZWN0aXZlKCRzdGF0ZSwgJHRpbWVvdXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0EnLFxuICAgIHJlcXVpcmU6IFsnP151aVNyZWZBY3RpdmUnLCAnP151aVNyZWZBY3RpdmVFcSddLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycywgdWlTcmVmQWN0aXZlKSB7XG4gICAgICB2YXIgdHlwZSAgID0gZ2V0VHlwZUluZm8oZWxlbWVudCk7XG4gICAgICB2YXIgYWN0aXZlID0gdWlTcmVmQWN0aXZlWzFdIHx8IHVpU3JlZkFjdGl2ZVswXTtcbiAgICAgIHZhciBncm91cCAgPSBbYXR0cnMudWlTdGF0ZSwgYXR0cnMudWlTdGF0ZVBhcmFtcyB8fCBudWxsLCBhdHRycy51aVN0YXRlT3B0cyB8fCBudWxsXTtcbiAgICAgIHZhciB3YXRjaCAgPSAnWycgKyBncm91cC5tYXAoZnVuY3Rpb24odmFsKSB7IHJldHVybiB2YWwgfHwgJ251bGwnOyB9KS5qb2luKCcsICcpICsgJ10nO1xuICAgICAgdmFyIGRlZiAgICA9IHsgc3RhdGU6IG51bGwsIHBhcmFtczogbnVsbCwgb3B0aW9uczogbnVsbCwgaHJlZjogbnVsbCB9O1xuICAgICAgdmFyIHVubGlua0luZm9GbiA9IG51bGw7XG4gICAgICB2YXIgaG9va0ZuO1xuXG4gICAgICBmdW5jdGlvbiBydW5TdGF0ZVJlZkxpbmsgKGdyb3VwKSB7XG4gICAgICAgIGRlZi5zdGF0ZSA9IGdyb3VwWzBdOyBkZWYucGFyYW1zID0gZ3JvdXBbMV07IGRlZi5vcHRpb25zID0gZ3JvdXBbMl07XG4gICAgICAgIGRlZi5ocmVmID0gJHN0YXRlLmhyZWYoZGVmLnN0YXRlLCBkZWYucGFyYW1zLCBkZWYub3B0aW9ucyk7XG5cbiAgICAgICAgaWYgKHVubGlua0luZm9GbikgdW5saW5rSW5mb0ZuKCk7XG4gICAgICAgIGlmIChhY3RpdmUpIHVubGlua0luZm9GbiA9IGFjdGl2ZS4kJGFkZFN0YXRlSW5mbyhkZWYuc3RhdGUsIGRlZi5wYXJhbXMpO1xuICAgICAgICBpZiAoZGVmLmhyZWYpIGF0dHJzLiRzZXQodHlwZS5hdHRyLCBkZWYuaHJlZik7XG4gICAgICB9XG5cbiAgICAgIHNjb3BlLiR3YXRjaCh3YXRjaCwgcnVuU3RhdGVSZWZMaW5rLCB0cnVlKTtcbiAgICAgIHJ1blN0YXRlUmVmTGluayhzY29wZS4kZXZhbCh3YXRjaCkpO1xuXG4gICAgICBpZiAoIXR5cGUuY2xpY2thYmxlKSByZXR1cm47XG4gICAgICBob29rRm4gPSBjbGlja0hvb2soZWxlbWVudCwgJHN0YXRlLCAkdGltZW91dCwgdHlwZSwgZnVuY3Rpb24oKSB7IHJldHVybiBkZWY7IH0pO1xuICAgICAgZWxlbWVudC5iaW5kKFwiY2xpY2tcIiwgaG9va0ZuKTtcbiAgICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZWxlbWVudC51bmJpbmQoXCJjbGlja1wiLCBob29rRm4pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG5cbi8qKlxuICogQG5nZG9jIGRpcmVjdGl2ZVxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zcmVmLWFjdGl2ZVxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVBhcmFtc1xuICogQHJlcXVpcmVzICRpbnRlcnBvbGF0ZVxuICpcbiAqIEByZXN0cmljdCBBXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBBIGRpcmVjdGl2ZSB3b3JraW5nIGFsb25nc2lkZSB1aS1zcmVmIHRvIGFkZCBjbGFzc2VzIHRvIGFuIGVsZW1lbnQgd2hlbiB0aGVcbiAqIHJlbGF0ZWQgdWktc3JlZiBkaXJlY3RpdmUncyBzdGF0ZSBpcyBhY3RpdmUsIGFuZCByZW1vdmluZyB0aGVtIHdoZW4gaXQgaXMgaW5hY3RpdmUuXG4gKiBUaGUgcHJpbWFyeSB1c2UtY2FzZSBpcyB0byBzaW1wbGlmeSB0aGUgc3BlY2lhbCBhcHBlYXJhbmNlIG9mIG5hdmlnYXRpb24gbWVudXNcbiAqIHJlbHlpbmcgb24gYHVpLXNyZWZgLCBieSBoYXZpbmcgdGhlIFwiYWN0aXZlXCIgc3RhdGUncyBtZW51IGJ1dHRvbiBhcHBlYXIgZGlmZmVyZW50LFxuICogZGlzdGluZ3Vpc2hpbmcgaXQgZnJvbSB0aGUgaW5hY3RpdmUgbWVudSBpdGVtcy5cbiAqXG4gKiB1aS1zcmVmLWFjdGl2ZSBjYW4gbGl2ZSBvbiB0aGUgc2FtZSBlbGVtZW50IGFzIHVpLXNyZWYgb3Igb24gYSBwYXJlbnQgZWxlbWVudC4gVGhlIGZpcnN0XG4gKiB1aS1zcmVmLWFjdGl2ZSBmb3VuZCBhdCB0aGUgc2FtZSBsZXZlbCBvciBhYm92ZSB0aGUgdWktc3JlZiB3aWxsIGJlIHVzZWQuXG4gKlxuICogV2lsbCBhY3RpdmF0ZSB3aGVuIHRoZSB1aS1zcmVmJ3MgdGFyZ2V0IHN0YXRlIG9yIGFueSBjaGlsZCBzdGF0ZSBpcyBhY3RpdmUuIElmIHlvdVxuICogbmVlZCB0byBhY3RpdmF0ZSBvbmx5IHdoZW4gdGhlIHVpLXNyZWYgdGFyZ2V0IHN0YXRlIGlzIGFjdGl2ZSBhbmQgKm5vdCogYW55IG9mXG4gKiBpdCdzIGNoaWxkcmVuLCB0aGVuIHlvdSB3aWxsIHVzZVxuICoge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZi1hY3RpdmUtZXEgdWktc3JlZi1hY3RpdmUtZXF9XG4gKlxuICogQGV4YW1wbGVcbiAqIEdpdmVuIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGU6XG4gKiA8cHJlPlxuICogPHVsPlxuICogICA8bGkgdWktc3JlZi1hY3RpdmU9XCJhY3RpdmVcIiBjbGFzcz1cIml0ZW1cIj5cbiAqICAgICA8YSBocmVmIHVpLXNyZWY9XCJhcHAudXNlcih7dXNlcjogJ2JpbGJvYmFnZ2lucyd9KVwiPkBiaWxib2JhZ2dpbnM8L2E+XG4gKiAgIDwvbGk+XG4gKiA8L3VsPlxuICogPC9wcmU+XG4gKlxuICpcbiAqIFdoZW4gdGhlIGFwcCBzdGF0ZSBpcyBcImFwcC51c2VyXCIgKG9yIGFueSBjaGlsZHJlbiBzdGF0ZXMpLCBhbmQgY29udGFpbnMgdGhlIHN0YXRlIHBhcmFtZXRlciBcInVzZXJcIiB3aXRoIHZhbHVlIFwiYmlsYm9iYWdnaW5zXCIsXG4gKiB0aGUgcmVzdWx0aW5nIEhUTUwgd2lsbCBhcHBlYXIgYXMgKG5vdGUgdGhlICdhY3RpdmUnIGNsYXNzKTpcbiAqIDxwcmU+XG4gKiA8dWw+XG4gKiAgIDxsaSB1aS1zcmVmLWFjdGl2ZT1cImFjdGl2ZVwiIGNsYXNzPVwiaXRlbSBhY3RpdmVcIj5cbiAqICAgICA8YSB1aS1zcmVmPVwiYXBwLnVzZXIoe3VzZXI6ICdiaWxib2JhZ2dpbnMnfSlcIiBocmVmPVwiL3VzZXJzL2JpbGJvYmFnZ2luc1wiPkBiaWxib2JhZ2dpbnM8L2E+XG4gKiAgIDwvbGk+XG4gKiA8L3VsPlxuICogPC9wcmU+XG4gKlxuICogVGhlIGNsYXNzIG5hbWUgaXMgaW50ZXJwb2xhdGVkICoqb25jZSoqIGR1cmluZyB0aGUgZGlyZWN0aXZlcyBsaW5rIHRpbWUgKGFueSBmdXJ0aGVyIGNoYW5nZXMgdG8gdGhlXG4gKiBpbnRlcnBvbGF0ZWQgdmFsdWUgYXJlIGlnbm9yZWQpLlxuICpcbiAqIE11bHRpcGxlIGNsYXNzZXMgbWF5IGJlIHNwZWNpZmllZCBpbiBhIHNwYWNlLXNlcGFyYXRlZCBmb3JtYXQ6XG4gKiA8cHJlPlxuICogPHVsPlxuICogICA8bGkgdWktc3JlZi1hY3RpdmU9J2NsYXNzMSBjbGFzczIgY2xhc3MzJz5cbiAqICAgICA8YSB1aS1zcmVmPVwiYXBwLnVzZXJcIj5saW5rPC9hPlxuICogICA8L2xpPlxuICogPC91bD5cbiAqIDwvcHJlPlxuICpcbiAqIEl0IGlzIGFsc28gcG9zc2libGUgdG8gcGFzcyB1aS1zcmVmLWFjdGl2ZSBhbiBleHByZXNzaW9uIHRoYXQgZXZhbHVhdGVzXG4gKiB0byBhbiBvYmplY3QgaGFzaCwgd2hvc2Uga2V5cyByZXByZXNlbnQgYWN0aXZlIGNsYXNzIG5hbWVzIGFuZCB3aG9zZVxuICogdmFsdWVzIHJlcHJlc2VudCB0aGUgcmVzcGVjdGl2ZSBzdGF0ZSBuYW1lcy9nbG9icy5cbiAqIHVpLXNyZWYtYWN0aXZlIHdpbGwgbWF0Y2ggaWYgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlICoqaW5jbHVkZXMqKiBhbnkgb2ZcbiAqIHRoZSBzcGVjaWZpZWQgc3RhdGUgbmFtZXMvZ2xvYnMsIGV2ZW4gdGhlIGFic3RyYWN0IG9uZXMuXG4gKlxuICogQEV4YW1wbGVcbiAqIEdpdmVuIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGUsIHdpdGggXCJhZG1pblwiIGJlaW5nIGFuIGFic3RyYWN0IHN0YXRlOlxuICogPHByZT5cbiAqIDxkaXYgdWktc3JlZi1hY3RpdmU9XCJ7J2FjdGl2ZSc6ICdhZG1pbi4qJ31cIj5cbiAqICAgPGEgdWktc3JlZi1hY3RpdmU9XCJhY3RpdmVcIiB1aS1zcmVmPVwiYWRtaW4ucm9sZXNcIj5Sb2xlczwvYT5cbiAqIDwvZGl2PlxuICogPC9wcmU+XG4gKlxuICogV2hlbiB0aGUgY3VycmVudCBzdGF0ZSBpcyBcImFkbWluLnJvbGVzXCIgdGhlIFwiYWN0aXZlXCIgY2xhc3Mgd2lsbCBiZSBhcHBsaWVkXG4gKiB0byBib3RoIHRoZSA8ZGl2PiBhbmQgPGE+IGVsZW1lbnRzLiBJdCBpcyBpbXBvcnRhbnQgdG8gbm90ZSB0aGF0IHRoZSBzdGF0ZVxuICogbmFtZXMvZ2xvYnMgcGFzc2VkIHRvIHVpLXNyZWYtYWN0aXZlIHNoYWRvdyB0aGUgc3RhdGUgcHJvdmlkZWQgYnkgdWktc3JlZi5cbiAqL1xuXG4vKipcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZi1hY3RpdmUtZXFcbiAqXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQYXJhbXNcbiAqIEByZXF1aXJlcyAkaW50ZXJwb2xhdGVcbiAqXG4gKiBAcmVzdHJpY3QgQVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIHNhbWUgYXMge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZi1hY3RpdmUgdWktc3JlZi1hY3RpdmV9IGJ1dCB3aWxsIG9ubHkgYWN0aXZhdGVcbiAqIHdoZW4gdGhlIGV4YWN0IHRhcmdldCBzdGF0ZSB1c2VkIGluIHRoZSBgdWktc3JlZmAgaXMgYWN0aXZlOyBubyBjaGlsZCBzdGF0ZXMuXG4gKlxuICovXG4kU3RhdGVSZWZBY3RpdmVEaXJlY3RpdmUuJGluamVjdCA9IFsnJHN0YXRlJywgJyRzdGF0ZVBhcmFtcycsICckaW50ZXJwb2xhdGUnXTtcbmZ1bmN0aW9uICRTdGF0ZVJlZkFjdGl2ZURpcmVjdGl2ZSgkc3RhdGUsICRzdGF0ZVBhcmFtcywgJGludGVycG9sYXRlKSB7XG4gIHJldHVybiAge1xuICAgIHJlc3RyaWN0OiBcIkFcIixcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsICckZWxlbWVudCcsICckYXR0cnMnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJHNjb3BlLCAkZWxlbWVudCwgJGF0dHJzLCAkdGltZW91dCkge1xuICAgICAgdmFyIHN0YXRlcyA9IFtdLCBhY3RpdmVDbGFzc2VzID0ge30sIGFjdGl2ZUVxQ2xhc3MsIHVpU3JlZkFjdGl2ZTtcblxuICAgICAgLy8gVGhlcmUgcHJvYmFibHkgaXNuJ3QgbXVjaCBwb2ludCBpbiAkb2JzZXJ2aW5nIHRoaXNcbiAgICAgIC8vIHVpU3JlZkFjdGl2ZSBhbmQgdWlTcmVmQWN0aXZlRXEgc2hhcmUgdGhlIHNhbWUgZGlyZWN0aXZlIG9iamVjdCB3aXRoIHNvbWVcbiAgICAgIC8vIHNsaWdodCBkaWZmZXJlbmNlIGluIGxvZ2ljIHJvdXRpbmdcbiAgICAgIGFjdGl2ZUVxQ2xhc3MgPSAkaW50ZXJwb2xhdGUoJGF0dHJzLnVpU3JlZkFjdGl2ZUVxIHx8ICcnLCBmYWxzZSkoJHNjb3BlKTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgdWlTcmVmQWN0aXZlID0gJHNjb3BlLiRldmFsKCRhdHRycy51aVNyZWZBY3RpdmUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBEbyBub3RoaW5nLiB1aVNyZWZBY3RpdmUgaXMgbm90IGEgdmFsaWQgZXhwcmVzc2lvbi5cbiAgICAgICAgLy8gRmFsbCBiYWNrIHRvIHVzaW5nICRpbnRlcnBvbGF0ZSBiZWxvd1xuICAgICAgfVxuICAgICAgdWlTcmVmQWN0aXZlID0gdWlTcmVmQWN0aXZlIHx8ICRpbnRlcnBvbGF0ZSgkYXR0cnMudWlTcmVmQWN0aXZlIHx8ICcnLCBmYWxzZSkoJHNjb3BlKTtcbiAgICAgIGlmIChpc09iamVjdCh1aVNyZWZBY3RpdmUpKSB7XG4gICAgICAgIGZvckVhY2godWlTcmVmQWN0aXZlLCBmdW5jdGlvbihzdGF0ZU9yTmFtZSwgYWN0aXZlQ2xhc3MpIHtcbiAgICAgICAgICBpZiAoaXNTdHJpbmcoc3RhdGVPck5hbWUpKSB7XG4gICAgICAgICAgICB2YXIgcmVmID0gcGFyc2VTdGF0ZVJlZihzdGF0ZU9yTmFtZSwgJHN0YXRlLmN1cnJlbnQubmFtZSk7XG4gICAgICAgICAgICBhZGRTdGF0ZShyZWYuc3RhdGUsICRzY29wZS4kZXZhbChyZWYucGFyYW1FeHByKSwgYWN0aXZlQ2xhc3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFsbG93IHVpU3JlZiB0byBjb21tdW5pY2F0ZSB3aXRoIHVpU3JlZkFjdGl2ZVtFcXVhbHNdXG4gICAgICB0aGlzLiQkYWRkU3RhdGVJbmZvID0gZnVuY3Rpb24gKG5ld1N0YXRlLCBuZXdQYXJhbXMpIHtcbiAgICAgICAgLy8gd2UgYWxyZWFkeSBnb3QgYW4gZXhwbGljaXQgc3RhdGUgcHJvdmlkZWQgYnkgdWktc3JlZi1hY3RpdmUsIHNvIHdlXG4gICAgICAgIC8vIHNoYWRvdyB0aGUgb25lIHRoYXQgY29tZXMgZnJvbSB1aS1zcmVmXG4gICAgICAgIGlmIChpc09iamVjdCh1aVNyZWZBY3RpdmUpICYmIHN0YXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkZXJlZ2lzdGVyID0gYWRkU3RhdGUobmV3U3RhdGUsIG5ld1BhcmFtcywgdWlTcmVmQWN0aXZlKTtcbiAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgIHJldHVybiBkZXJlZ2lzdGVyO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3VjY2VzcycsIHVwZGF0ZSk7XG5cbiAgICAgIGZ1bmN0aW9uIGFkZFN0YXRlKHN0YXRlTmFtZSwgc3RhdGVQYXJhbXMsIGFjdGl2ZUNsYXNzKSB7XG4gICAgICAgIHZhciBzdGF0ZSA9ICRzdGF0ZS5nZXQoc3RhdGVOYW1lLCBzdGF0ZUNvbnRleHQoJGVsZW1lbnQpKTtcbiAgICAgICAgdmFyIHN0YXRlSGFzaCA9IGNyZWF0ZVN0YXRlSGFzaChzdGF0ZU5hbWUsIHN0YXRlUGFyYW1zKTtcblxuICAgICAgICB2YXIgc3RhdGVJbmZvID0ge1xuICAgICAgICAgIHN0YXRlOiBzdGF0ZSB8fCB7IG5hbWU6IHN0YXRlTmFtZSB9LFxuICAgICAgICAgIHBhcmFtczogc3RhdGVQYXJhbXMsXG4gICAgICAgICAgaGFzaDogc3RhdGVIYXNoXG4gICAgICAgIH07XG5cbiAgICAgICAgc3RhdGVzLnB1c2goc3RhdGVJbmZvKTtcbiAgICAgICAgYWN0aXZlQ2xhc3Nlc1tzdGF0ZUhhc2hdID0gYWN0aXZlQ2xhc3M7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHJlbW92ZVN0YXRlKCkge1xuICAgICAgICAgIHZhciBpZHggPSBzdGF0ZXMuaW5kZXhPZihzdGF0ZUluZm8pO1xuICAgICAgICAgIGlmIChpZHggIT09IC0xKSBzdGF0ZXMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHN0YXRlXG4gICAgICAgKiBAcGFyYW0ge09iamVjdHxzdHJpbmd9IFtwYXJhbXNdXG4gICAgICAgKiBAcmV0dXJuIHtzdHJpbmd9XG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZVN0YXRlSGFzaChzdGF0ZSwgcGFyYW1zKSB7XG4gICAgICAgIGlmICghaXNTdHJpbmcoc3RhdGUpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzdGF0ZSBzaG91bGQgYmUgYSBzdHJpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXNPYmplY3QocGFyYW1zKSkge1xuICAgICAgICAgIHJldHVybiBzdGF0ZSArIHRvSnNvbihwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHBhcmFtcyA9ICRzY29wZS4kZXZhbChwYXJhbXMpO1xuICAgICAgICBpZiAoaXNPYmplY3QocGFyYW1zKSkge1xuICAgICAgICAgIHJldHVybiBzdGF0ZSArIHRvSnNvbihwYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdGF0ZTtcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHJvdXRlIHN0YXRlXG4gICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RhdGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGFueU1hdGNoKHN0YXRlc1tpXS5zdGF0ZSwgc3RhdGVzW2ldLnBhcmFtcykpIHtcbiAgICAgICAgICAgIGFkZENsYXNzKCRlbGVtZW50LCBhY3RpdmVDbGFzc2VzW3N0YXRlc1tpXS5oYXNoXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKCRlbGVtZW50LCBhY3RpdmVDbGFzc2VzW3N0YXRlc1tpXS5oYXNoXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGV4YWN0TWF0Y2goc3RhdGVzW2ldLnN0YXRlLCBzdGF0ZXNbaV0ucGFyYW1zKSkge1xuICAgICAgICAgICAgYWRkQ2xhc3MoJGVsZW1lbnQsIGFjdGl2ZUVxQ2xhc3MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW1vdmVDbGFzcygkZWxlbWVudCwgYWN0aXZlRXFDbGFzcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFkZENsYXNzKGVsLCBjbGFzc05hbWUpIHsgJHRpbWVvdXQoZnVuY3Rpb24gKCkgeyBlbC5hZGRDbGFzcyhjbGFzc05hbWUpOyB9KTsgfVxuICAgICAgZnVuY3Rpb24gcmVtb3ZlQ2xhc3MoZWwsIGNsYXNzTmFtZSkgeyBlbC5yZW1vdmVDbGFzcyhjbGFzc05hbWUpOyB9XG4gICAgICBmdW5jdGlvbiBhbnlNYXRjaChzdGF0ZSwgcGFyYW1zKSB7IHJldHVybiAkc3RhdGUuaW5jbHVkZXMoc3RhdGUubmFtZSwgcGFyYW1zKTsgfVxuICAgICAgZnVuY3Rpb24gZXhhY3RNYXRjaChzdGF0ZSwgcGFyYW1zKSB7IHJldHVybiAkc3RhdGUuaXMoc3RhdGUubmFtZSwgcGFyYW1zKTsgfVxuXG4gICAgICB1cGRhdGUoKTtcbiAgICB9XVxuICB9O1xufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJylcbiAgLmRpcmVjdGl2ZSgndWlTcmVmJywgJFN0YXRlUmVmRGlyZWN0aXZlKVxuICAuZGlyZWN0aXZlKCd1aVNyZWZBY3RpdmUnLCAkU3RhdGVSZWZBY3RpdmVEaXJlY3RpdmUpXG4gIC5kaXJlY3RpdmUoJ3VpU3JlZkFjdGl2ZUVxJywgJFN0YXRlUmVmQWN0aXZlRGlyZWN0aXZlKVxuICAuZGlyZWN0aXZlKCd1aVN0YXRlJywgJFN0YXRlUmVmRHluYW1pY0RpcmVjdGl2ZSk7XG5cbi8qKlxuICogQG5nZG9jIGZpbHRlclxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmZpbHRlcjppc1N0YXRlXG4gKlxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqIFRyYW5zbGF0ZXMgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19pcyAkc3RhdGUuaXMoXCJzdGF0ZU5hbWVcIil9LlxuICovXG4kSXNTdGF0ZUZpbHRlci4kaW5qZWN0ID0gWyckc3RhdGUnXTtcbmZ1bmN0aW9uICRJc1N0YXRlRmlsdGVyKCRzdGF0ZSkge1xuICB2YXIgaXNGaWx0ZXIgPSBmdW5jdGlvbiAoc3RhdGUsIHBhcmFtcykge1xuICAgIHJldHVybiAkc3RhdGUuaXMoc3RhdGUsIHBhcmFtcyk7XG4gIH07XG4gIGlzRmlsdGVyLiRzdGF0ZWZ1bCA9IHRydWU7XG4gIHJldHVybiBpc0ZpbHRlcjtcbn1cblxuLyoqXG4gKiBAbmdkb2MgZmlsdGVyXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZmlsdGVyOmluY2x1ZGVkQnlTdGF0ZVxuICpcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKiBUcmFuc2xhdGVzIHRvIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfaW5jbHVkZXMgJHN0YXRlLmluY2x1ZGVzKCdmdWxsT3JQYXJ0aWFsU3RhdGVOYW1lJyl9LlxuICovXG4kSW5jbHVkZWRCeVN0YXRlRmlsdGVyLiRpbmplY3QgPSBbJyRzdGF0ZSddO1xuZnVuY3Rpb24gJEluY2x1ZGVkQnlTdGF0ZUZpbHRlcigkc3RhdGUpIHtcbiAgdmFyIGluY2x1ZGVzRmlsdGVyID0gZnVuY3Rpb24gKHN0YXRlLCBwYXJhbXMsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gJHN0YXRlLmluY2x1ZGVzKHN0YXRlLCBwYXJhbXMsIG9wdGlvbnMpO1xuICB9O1xuICBpbmNsdWRlc0ZpbHRlci4kc3RhdGVmdWwgPSB0cnVlO1xuICByZXR1cm4gIGluY2x1ZGVzRmlsdGVyO1xufVxuXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJylcbiAgLmZpbHRlcignaXNTdGF0ZScsICRJc1N0YXRlRmlsdGVyKVxuICAuZmlsdGVyKCdpbmNsdWRlZEJ5U3RhdGUnLCAkSW5jbHVkZWRCeVN0YXRlRmlsdGVyKTtcbn0pKHdpbmRvdywgd2luZG93LmFuZ3VsYXIpOyIsIi8qKiFcbiAqIEFuZ3VsYXJKUyBmaWxlIHVwbG9hZCBkaXJlY3RpdmVzIGFuZCBzZXJ2aWNlcy4gU3VwcG9ydHM6IGZpbGUgdXBsb2FkL2Ryb3AvcGFzdGUsIHJlc3VtZSwgY2FuY2VsL2Fib3J0LFxuICogcHJvZ3Jlc3MsIHJlc2l6ZSwgdGh1bWJuYWlsLCBwcmV2aWV3LCB2YWxpZGF0aW9uIGFuZCBDT1JTXG4gKiBGaWxlQVBJIEZsYXNoIHNoaW0gZm9yIG9sZCBicm93c2VycyBub3Qgc3VwcG9ydGluZyBGb3JtRGF0YVxuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEyLjIuMTJcbiAqL1xuXG4oZnVuY3Rpb24gKCkge1xuICAvKiogQG5hbWVzcGFjZSBGaWxlQVBJLm5vQ29udGVudFRpbWVvdXQgKi9cblxuICBmdW5jdGlvbiBwYXRjaFhIUihmbk5hbWUsIG5ld0ZuKSB7XG4gICAgd2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdID0gbmV3Rm4od2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZVtmbk5hbWVdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlZGVmaW5lUHJvcCh4aHIsIHByb3AsIGZuKSB7XG4gICAgdHJ5IHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh4aHIsIHByb3AsIHtnZXQ6IGZufSk7XG4gICAgfSBjYXRjaCAoZSkgey8qaWdub3JlKi9cbiAgICB9XG4gIH1cblxuICBpZiAoIXdpbmRvdy5GaWxlQVBJKSB7XG4gICAgd2luZG93LkZpbGVBUEkgPSB7fTtcbiAgfVxuXG4gIGlmICghd2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG4gICAgdGhyb3cgJ0FKQVggaXMgbm90IHN1cHBvcnRlZC4gWE1MSHR0cFJlcXVlc3QgaXMgbm90IGRlZmluZWQuJztcbiAgfVxuXG4gIEZpbGVBUEkuc2hvdWxkTG9hZCA9ICF3aW5kb3cuRm9ybURhdGEgfHwgRmlsZUFQSS5mb3JjZUxvYWQ7XG4gIGlmIChGaWxlQVBJLnNob3VsZExvYWQpIHtcbiAgICB2YXIgaW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyID0gZnVuY3Rpb24gKHhocikge1xuICAgICAgaWYgKCF4aHIuX19saXN0ZW5lcnMpIHtcbiAgICAgICAgaWYgKCF4aHIudXBsb2FkKSB4aHIudXBsb2FkID0ge307XG4gICAgICAgIHhoci5fX2xpc3RlbmVycyA9IFtdO1xuICAgICAgICB2YXIgb3JpZ0FkZEV2ZW50TGlzdGVuZXIgPSB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXI7XG4gICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uICh0LCBmbikge1xuICAgICAgICAgIHhoci5fX2xpc3RlbmVyc1t0XSA9IGZuO1xuICAgICAgICAgIGlmIChvcmlnQWRkRXZlbnRMaXN0ZW5lcikgb3JpZ0FkZEV2ZW50TGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcGF0Y2hYSFIoJ29wZW4nLCBmdW5jdGlvbiAob3JpZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChtLCB1cmwsIGIpIHtcbiAgICAgICAgaW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuICAgICAgICB0aGlzLl9fdXJsID0gdXJsO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIG9yaWcuYXBwbHkodGhpcywgW20sIHVybCwgYl0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUubWVzc2FnZS5pbmRleE9mKCdBY2Nlc3MgaXMgZGVuaWVkJykgPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5fX29yaWdFcnJvciA9IGU7XG4gICAgICAgICAgICBvcmlnLmFwcGx5KHRoaXMsIFttLCAnX2ZpeF9mb3JfaWVfY3Jvc3Nkb21haW5fXycsIGJdKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBwYXRjaFhIUignZ2V0UmVzcG9uc2VIZWFkZXInLCBmdW5jdGlvbiAob3JpZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fZmlsZUFwaVhIUiAmJiB0aGlzLl9fZmlsZUFwaVhIUi5nZXRSZXNwb25zZUhlYWRlciA/IHRoaXMuX19maWxlQXBpWEhSLmdldFJlc3BvbnNlSGVhZGVyKGgpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMsIFtoXSkpO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHBhdGNoWEhSKCdnZXRBbGxSZXNwb25zZUhlYWRlcnMnLCBmdW5jdGlvbiAob3JpZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycyA/IHRoaXMuX19maWxlQXBpWEhSLmdldEFsbFJlc3BvbnNlSGVhZGVycygpIDogKG9yaWcgPT0gbnVsbCA/IG51bGwgOiBvcmlnLmFwcGx5KHRoaXMpKTtcbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBwYXRjaFhIUignYWJvcnQnLCBmdW5jdGlvbiAob3JpZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX19maWxlQXBpWEhSICYmIHRoaXMuX19maWxlQXBpWEhSLmFib3J0ID8gdGhpcy5fX2ZpbGVBcGlYSFIuYWJvcnQoKSA6IChvcmlnID09IG51bGwgPyBudWxsIDogb3JpZy5hcHBseSh0aGlzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuXG4gICAgcGF0Y2hYSFIoJ3NldFJlcXVlc3RIZWFkZXInLCBmdW5jdGlvbiAob3JpZykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChoZWFkZXIsIHZhbHVlKSB7XG4gICAgICAgIGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG4gICAgICAgICAgaW5pdGlhbGl6ZVVwbG9hZExpc3RlbmVyKHRoaXMpO1xuICAgICAgICAgIHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcbiAgICAgICAgICAvLyBmaXggZm9yIGFuZ3VsYXIgPCAxLjIuMFxuICAgICAgICAgIGlmICh2YWwgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgICAgICAgdmFsKHRoaXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9fcmVxdWVzdEhlYWRlcnMgPSB0aGlzLl9fcmVxdWVzdEhlYWRlcnMgfHwge307XG4gICAgICAgICAgdGhpcy5fX3JlcXVlc3RIZWFkZXJzW2hlYWRlcl0gPSB2YWx1ZTtcbiAgICAgICAgICBvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICBwYXRjaFhIUignc2VuZCcsIGZ1bmN0aW9uIChvcmlnKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgeGhyID0gdGhpcztcbiAgICAgICAgaWYgKGFyZ3VtZW50c1swXSAmJiBhcmd1bWVudHNbMF0uX19pc0ZpbGVBUElTaGltKSB7XG4gICAgICAgICAgdmFyIGZvcm1EYXRhID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgICAgICB1cmw6IHhoci5fX3VybCxcbiAgICAgICAgICAgIGpzb25wOiBmYWxzZSwgLy9yZW1vdmVzIHRoZSBjYWxsYmFjayBmb3JtIHBhcmFtXG4gICAgICAgICAgICBjYWNoZTogdHJ1ZSwgLy9yZW1vdmVzIHRoZSA/ZmlsZWFwaVhYWCBpbiB0aGUgdXJsXG4gICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24gKGVyciwgZmlsZUFwaVhIUikge1xuICAgICAgICAgICAgICBpZiAoZXJyICYmIGFuZ3VsYXIuaXNTdHJpbmcoZXJyKSAmJiBlcnIuaW5kZXhPZignIzIxNzQnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIGVycm9yIHNlZW1zIHRvIGJlIGZpbmUgdGhlIGZpbGUgaXMgYmVpbmcgdXBsb2FkZWQgcHJvcGVybHkuXG4gICAgICAgICAgICAgICAgZXJyID0gbnVsbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB4aHIuX19jb21wbGV0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICBpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnMubG9hZClcbiAgICAgICAgICAgICAgICB4aHIuX19saXN0ZW5lcnMubG9hZCh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZCcsXG4gICAgICAgICAgICAgICAgICBsb2FkZWQ6IHhoci5fX2xvYWRlZCxcbiAgICAgICAgICAgICAgICAgIHRvdGFsOiB4aHIuX190b3RhbCxcbiAgICAgICAgICAgICAgICAgIHRhcmdldDogeGhyLFxuICAgICAgICAgICAgICAgICAgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoIWVyciAmJiB4aHIuX19saXN0ZW5lcnMubG9hZGVuZClcbiAgICAgICAgICAgICAgICB4aHIuX19saXN0ZW5lcnMubG9hZGVuZCh7XG4gICAgICAgICAgICAgICAgICB0eXBlOiAnbG9hZGVuZCcsXG4gICAgICAgICAgICAgICAgICBsb2FkZWQ6IHhoci5fX2xvYWRlZCxcbiAgICAgICAgICAgICAgICAgIHRvdGFsOiB4aHIuX190b3RhbCxcbiAgICAgICAgICAgICAgICAgIHRhcmdldDogeGhyLFxuICAgICAgICAgICAgICAgICAgbGVuZ3RoQ29tcHV0YWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoZXJyID09PSAnYWJvcnQnICYmIHhoci5fX2xpc3RlbmVycy5hYm9ydClcbiAgICAgICAgICAgICAgICB4aHIuX19saXN0ZW5lcnMuYWJvcnQoe1xuICAgICAgICAgICAgICAgICAgdHlwZTogJ2Fib3J0JyxcbiAgICAgICAgICAgICAgICAgIGxvYWRlZDogeGhyLl9fbG9hZGVkLFxuICAgICAgICAgICAgICAgICAgdG90YWw6IHhoci5fX3RvdGFsLFxuICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB4aHIsXG4gICAgICAgICAgICAgICAgICBsZW5ndGhDb21wdXRhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChmaWxlQXBpWEhSLnN0YXR1cyAhPT0gdW5kZWZpbmVkKSByZWRlZmluZVByb3AoeGhyLCAnc3RhdHVzJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoZmlsZUFwaVhIUi5zdGF0dXMgPT09IDAgJiYgZXJyICYmIGVyciAhPT0gJ2Fib3J0JykgPyA1MDAgOiBmaWxlQXBpWEhSLnN0YXR1cztcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGlmIChmaWxlQXBpWEhSLnN0YXR1c1RleHQgIT09IHVuZGVmaW5lZCkgcmVkZWZpbmVQcm9wKHhociwgJ3N0YXR1c1RleHQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGVBcGlYSFIuc3RhdHVzVGV4dDtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJlZGVmaW5lUHJvcCh4aHIsICdyZWFkeVN0YXRlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaWYgKGZpbGVBcGlYSFIucmVzcG9uc2UgIT09IHVuZGVmaW5lZCkgcmVkZWZpbmVQcm9wKHhociwgJ3Jlc3BvbnNlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWxlQXBpWEhSLnJlc3BvbnNlO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgdmFyIHJlc3AgPSBmaWxlQXBpWEhSLnJlc3BvbnNlVGV4dCB8fCAoZXJyICYmIGZpbGVBcGlYSFIuc3RhdHVzID09PSAwICYmIGVyciAhPT0gJ2Fib3J0JyA/IGVyciA6IHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgIHJlZGVmaW5lUHJvcCh4aHIsICdyZXNwb25zZVRleHQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICByZWRlZmluZVByb3AoeGhyLCAncmVzcG9uc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3A7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBpZiAoZXJyKSByZWRlZmluZVByb3AoeGhyLCAnZXJyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlcnI7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB4aHIuX19maWxlQXBpWEhSID0gZmlsZUFwaVhIUjtcbiAgICAgICAgICAgICAgaWYgKHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UpIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UoKTtcbiAgICAgICAgICAgICAgaWYgKHhoci5vbmxvYWQpIHhoci5vbmxvYWQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9ncmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgZS50YXJnZXQgPSB4aHI7XG4gICAgICAgICAgICAgIGlmICh4aHIuX19saXN0ZW5lcnMucHJvZ3Jlc3MpIHhoci5fX2xpc3RlbmVycy5wcm9ncmVzcyhlKTtcbiAgICAgICAgICAgICAgeGhyLl9fdG90YWwgPSBlLnRvdGFsO1xuICAgICAgICAgICAgICB4aHIuX19sb2FkZWQgPSBlLmxvYWRlZDtcbiAgICAgICAgICAgICAgaWYgKGUudG90YWwgPT09IGUubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gZml4IGZsYXNoIGlzc3VlIHRoYXQgZG9lc24ndCBjYWxsIGNvbXBsZXRlIGlmIHRoZXJlIGlzIG5vIHJlc3BvbnNlIHRleHQgZnJvbSB0aGUgc2VydmVyXG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgIGlmICgheGhyLl9fY29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmNvbXBsZXRlKG51bGwsIHtzdGF0dXM6IDIwNCwgc3RhdHVzVGV4dDogJ05vIENvbnRlbnQnfSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgRmlsZUFQSS5ub0NvbnRlbnRUaW1lb3V0IHx8IDEwMDAwKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHhoci5fX3JlcXVlc3RIZWFkZXJzXG4gICAgICAgICAgfTtcbiAgICAgICAgICBjb25maWcuZGF0YSA9IHt9O1xuICAgICAgICAgIGNvbmZpZy5maWxlcyA9IHt9O1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm9ybURhdGEuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBmb3JtRGF0YS5kYXRhW2ldO1xuICAgICAgICAgICAgaWYgKGl0ZW0udmFsICE9IG51bGwgJiYgaXRlbS52YWwubmFtZSAhPSBudWxsICYmIGl0ZW0udmFsLnNpemUgIT0gbnVsbCAmJiBpdGVtLnZhbC50eXBlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgY29uZmlnLmZpbGVzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY29uZmlnLmRhdGFbaXRlbS5rZXldID0gaXRlbS52YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIUZpbGVBUEkuaGFzRmxhc2gpIHtcbiAgICAgICAgICAgICAgdGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhoci5fX2ZpbGVBcGlYSFIgPSBGaWxlQVBJLnVwbG9hZChjb25maWcpO1xuICAgICAgICAgIH0sIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLl9fb3JpZ0Vycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyB0aGlzLl9fb3JpZ0Vycm9yO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvcmlnLmFwcGx5KHhociwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KTtcbiAgICB3aW5kb3cuWE1MSHR0cFJlcXVlc3QuX19pc0ZpbGVBUElTaGltID0gdHJ1ZTtcbiAgICB3aW5kb3cuRm9ybURhdGEgPSBGb3JtRGF0YSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFwcGVuZDogZnVuY3Rpb24gKGtleSwgdmFsLCBuYW1lKSB7XG4gICAgICAgICAgaWYgKHZhbC5fX2lzRmlsZUFQSUJsb2JTaGltKSB7XG4gICAgICAgICAgICB2YWwgPSB2YWwuZGF0YVswXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5kYXRhLnB1c2goe1xuICAgICAgICAgICAga2V5OiBrZXksXG4gICAgICAgICAgICB2YWw6IHZhbCxcbiAgICAgICAgICAgIG5hbWU6IG5hbWVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZGF0YTogW10sXG4gICAgICAgIF9faXNGaWxlQVBJU2hpbTogdHJ1ZVxuICAgICAgfTtcbiAgICB9O1xuXG4gICAgd2luZG93LkJsb2IgPSBCbG9iID0gZnVuY3Rpb24gKGIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRhdGE6IGIsXG4gICAgICAgIF9faXNGaWxlQVBJQmxvYlNoaW06IHRydWVcbiAgICAgIH07XG4gICAgfTtcbiAgfVxuXG59KSgpO1xuXG4oZnVuY3Rpb24gKCkge1xuICAvKiogQG5hbWVzcGFjZSBGaWxlQVBJLmZvcmNlTG9hZCAqL1xuICAvKiogQG5hbWVzcGFjZSB3aW5kb3cuRmlsZUFQSS5qc1VybCAqL1xuICAvKiogQG5hbWVzcGFjZSB3aW5kb3cuRmlsZUFQSS5qc1BhdGggKi9cblxuICBmdW5jdGlvbiBpc0lucHV0VHlwZUZpbGUoZWxlbSkge1xuICAgIHJldHVybiBlbGVtWzBdLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lucHV0JyAmJiBlbGVtLmF0dHIoJ3R5cGUnKSAmJiBlbGVtLmF0dHIoJ3R5cGUnKS50b0xvd2VyQ2FzZSgpID09PSAnZmlsZSc7XG4gIH1cblxuICBmdW5jdGlvbiBoYXNGbGFzaCgpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIGZvID0gbmV3IEFjdGl2ZVhPYmplY3QoJ1Nob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoJyk7XG4gICAgICBpZiAoZm8pIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChuYXZpZ2F0b3IubWltZVR5cGVzWydhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCddICE9PSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRPZmZzZXQob2JqKSB7XG4gICAgdmFyIGxlZnQgPSAwLCB0b3AgPSAwO1xuXG4gICAgaWYgKHdpbmRvdy5qUXVlcnkpIHtcbiAgICAgIHJldHVybiBqUXVlcnkob2JqKS5vZmZzZXQoKTtcbiAgICB9XG5cbiAgICBpZiAob2JqLm9mZnNldFBhcmVudCkge1xuICAgICAgZG8ge1xuICAgICAgICBsZWZ0ICs9IChvYmoub2Zmc2V0TGVmdCAtIG9iai5zY3JvbGxMZWZ0KTtcbiAgICAgICAgdG9wICs9IChvYmoub2Zmc2V0VG9wIC0gb2JqLnNjcm9sbFRvcCk7XG4gICAgICAgIG9iaiA9IG9iai5vZmZzZXRQYXJlbnQ7XG4gICAgICB9IHdoaWxlIChvYmopO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogbGVmdCxcbiAgICAgIHRvcDogdG9wXG4gICAgfTtcbiAgfVxuXG4gIGlmIChGaWxlQVBJLnNob3VsZExvYWQpIHtcbiAgICBGaWxlQVBJLmhhc0ZsYXNoID0gaGFzRmxhc2goKTtcblxuICAgIC8vbG9hZCBGaWxlQVBJXG4gICAgaWYgKEZpbGVBUEkuZm9yY2VMb2FkKSB7XG4gICAgICBGaWxlQVBJLmh0bWw1ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFGaWxlQVBJLnVwbG9hZCkge1xuICAgICAgdmFyIGpzVXJsLCBiYXNlUGF0aCwgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JyksIGFsbFNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JyksIGksIGluZGV4LCBzcmM7XG4gICAgICBpZiAod2luZG93LkZpbGVBUEkuanNVcmwpIHtcbiAgICAgICAganNVcmwgPSB3aW5kb3cuRmlsZUFQSS5qc1VybDtcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LkZpbGVBUEkuanNQYXRoKSB7XG4gICAgICAgIGJhc2VQYXRoID0gd2luZG93LkZpbGVBUEkuanNQYXRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGFsbFNjcmlwdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBzcmMgPSBhbGxTY3JpcHRzW2ldLnNyYztcbiAgICAgICAgICBpbmRleCA9IHNyYy5zZWFyY2goL1xcL25nXFwtZmlsZVxcLXVwbG9hZFtcXC1hLXpBLXowLTlcXC5dKlxcLmpzLyk7XG4gICAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIGJhc2VQYXRoID0gc3JjLnN1YnN0cmluZygwLCBpbmRleCArIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChGaWxlQVBJLnN0YXRpY1BhdGggPT0gbnVsbCkgRmlsZUFQSS5zdGF0aWNQYXRoID0gYmFzZVBhdGg7XG4gICAgICBzY3JpcHQuc2V0QXR0cmlidXRlKCdzcmMnLCBqc1VybCB8fCBiYXNlUGF0aCArICdGaWxlQVBJLm1pbi5qcycpO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICAgIH1cblxuICAgIEZpbGVBUEkubmdmRml4SUUgPSBmdW5jdGlvbiAoZWxlbSwgZmlsZUVsZW0sIGNoYW5nZUZuKSB7XG4gICAgICBpZiAoIWhhc0ZsYXNoKCkpIHtcbiAgICAgICAgdGhyb3cgJ0Fkb2RlIEZsYXNoIFBsYXllciBuZWVkIHRvIGJlIGluc3RhbGxlZC4gVG8gY2hlY2sgYWhlYWQgdXNlIFwiRmlsZUFQSS5oYXNGbGFzaFwiJztcbiAgICAgIH1cbiAgICAgIHZhciBmaXhJbnB1dFN0eWxlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGFiZWwgPSBmaWxlRWxlbS5wYXJlbnQoKTtcbiAgICAgICAgaWYgKGVsZW0uYXR0cignZGlzYWJsZWQnKSkge1xuICAgICAgICAgIGlmIChsYWJlbCkgbGFiZWwucmVtb3ZlQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghZmlsZUVsZW0uYXR0cignX19uZ2ZfZmxhc2hfJykpIHtcbiAgICAgICAgICAgIGZpbGVFbGVtLnVuYmluZCgnY2hhbmdlJyk7XG4gICAgICAgICAgICBmaWxlRWxlbS51bmJpbmQoJ2NsaWNrJyk7XG4gICAgICAgICAgICBmaWxlRWxlbS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgIGZpbGVBcGlDaGFuZ2VGbi5hcHBseSh0aGlzLCBbZXZ0XSk7XG4gICAgICAgICAgICAgIGNoYW5nZUZuLmFwcGx5KHRoaXMsIFtldnRdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZmlsZUVsZW0uYXR0cignX19uZ2ZfZmxhc2hfJywgJ3RydWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGFiZWwuYWRkQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuICAgICAgICAgIGlmICghaXNJbnB1dFR5cGVGaWxlKGVsZW0pKSB7XG4gICAgICAgICAgICBsYWJlbC5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJylcbiAgICAgICAgICAgICAgLmNzcygndG9wJywgZ2V0T2Zmc2V0KGVsZW1bMF0pLnRvcCArICdweCcpLmNzcygnbGVmdCcsIGdldE9mZnNldChlbGVtWzBdKS5sZWZ0ICsgJ3B4JylcbiAgICAgICAgICAgICAgLmNzcygnd2lkdGgnLCBlbGVtWzBdLm9mZnNldFdpZHRoICsgJ3B4JykuY3NzKCdoZWlnaHQnLCBlbGVtWzBdLm9mZnNldEhlaWdodCArICdweCcpXG4gICAgICAgICAgICAgIC5jc3MoJ2ZpbHRlcicsICdhbHBoYShvcGFjaXR5PTApJykuY3NzKCdkaXNwbGF5JywgZWxlbS5jc3MoJ2Rpc3BsYXknKSlcbiAgICAgICAgICAgICAgLmNzcygnb3ZlcmZsb3cnLCAnaGlkZGVuJykuY3NzKCd6LWluZGV4JywgJzkwMDAwMCcpXG4gICAgICAgICAgICAgIC5jc3MoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgICAgICAgICAgZmlsZUVsZW0uY3NzKCd3aWR0aCcsIGVsZW1bMF0ub2Zmc2V0V2lkdGggKyAncHgnKS5jc3MoJ2hlaWdodCcsIGVsZW1bMF0ub2Zmc2V0SGVpZ2h0ICsgJ3B4JylcbiAgICAgICAgICAgICAgLmNzcygncG9zaXRpb24nLCAnYWJzb2x1dGUnKS5jc3MoJ3RvcCcsICcwcHgnKS5jc3MoJ2xlZnQnLCAnMHB4Jyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBlbGVtLmJpbmQoJ21vdXNlZW50ZXInLCBmaXhJbnB1dFN0eWxlKTtcblxuICAgICAgdmFyIGZpbGVBcGlDaGFuZ2VGbiA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgdmFyIGZpbGVzID0gRmlsZUFQSS5nZXRGaWxlcyhldnQpO1xuICAgICAgICAvL2p1c3QgYSBkb3VibGUgY2hlY2sgZm9yICMyMzNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChmaWxlc1tpXS5zaXplID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLnNpemUgPSAwO1xuICAgICAgICAgIGlmIChmaWxlc1tpXS5uYW1lID09PSB1bmRlZmluZWQpIGZpbGVzW2ldLm5hbWUgPSAnZmlsZSc7XG4gICAgICAgICAgaWYgKGZpbGVzW2ldLnR5cGUgPT09IHVuZGVmaW5lZCkgZmlsZXNbaV0udHlwZSA9ICd1bmRlZmluZWQnO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZXZ0LnRhcmdldCkge1xuICAgICAgICAgIGV2dC50YXJnZXQgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBldnQudGFyZ2V0LmZpbGVzID0gZmlsZXM7XG4gICAgICAgIC8vIGlmIGV2dC50YXJnZXQuZmlsZXMgaXMgbm90IHdyaXRhYmxlIHVzZSBoZWxwZXIgZmllbGRcbiAgICAgICAgaWYgKGV2dC50YXJnZXQuZmlsZXMgIT09IGZpbGVzKSB7XG4gICAgICAgICAgZXZ0Ll9fZmlsZXNfID0gZmlsZXM7XG4gICAgICAgIH1cbiAgICAgICAgKGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKS5pdGVtID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICByZXR1cm4gKGV2dC5fX2ZpbGVzXyB8fCBldnQudGFyZ2V0LmZpbGVzKVtpXSB8fCBudWxsO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9O1xuXG4gICAgRmlsZUFQSS5kaXNhYmxlRmlsZUlucHV0ID0gZnVuY3Rpb24gKGVsZW0sIGRpc2FibGUpIHtcbiAgICAgIGlmIChkaXNhYmxlKSB7XG4gICAgICAgIGVsZW0ucmVtb3ZlQ2xhc3MoJ2pzLWZpbGVhcGktd3JhcHBlcicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZWxlbS5hZGRDbGFzcygnanMtZmlsZWFwaS13cmFwcGVyJyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufSkoKTtcblxuaWYgKCF3aW5kb3cuRmlsZVJlYWRlcikge1xuICB3aW5kb3cuRmlsZVJlYWRlciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLCBsb2FkU3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHR5cGUsIGZuKSB7XG4gICAgICBfdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBfdGhpcy5saXN0ZW5lcnNbdHlwZV0gfHwgW107XG4gICAgICBfdGhpcy5saXN0ZW5lcnNbdHlwZV0ucHVzaChmbik7XG4gICAgfTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAodHlwZSwgZm4pIHtcbiAgICAgIGlmIChfdGhpcy5saXN0ZW5lcnNbdHlwZV0pIF90aGlzLmxpc3RlbmVyc1t0eXBlXS5zcGxpY2UoX3RoaXMubGlzdGVuZXJzW3R5cGVdLmluZGV4T2YoZm4pLCAxKTtcbiAgICB9O1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgIHZhciBsaXN0ID0gX3RoaXMubGlzdGVuZXJzW2V2dC50eXBlXTtcbiAgICAgIGlmIChsaXN0KSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxpc3RbaV0uY2FsbChfdGhpcywgZXZ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5vbmFib3J0ID0gdGhpcy5vbmVycm9yID0gdGhpcy5vbmxvYWQgPSB0aGlzLm9ubG9hZHN0YXJ0ID0gdGhpcy5vbmxvYWRlbmQgPSB0aGlzLm9ucHJvZ3Jlc3MgPSBudWxsO1xuXG4gICAgdmFyIGNvbnN0cnVjdEV2ZW50ID0gZnVuY3Rpb24gKHR5cGUsIGV2dCkge1xuICAgICAgdmFyIGUgPSB7dHlwZTogdHlwZSwgdGFyZ2V0OiBfdGhpcywgbG9hZGVkOiBldnQubG9hZGVkLCB0b3RhbDogZXZ0LnRvdGFsLCBlcnJvcjogZXZ0LmVycm9yfTtcbiAgICAgIGlmIChldnQucmVzdWx0ICE9IG51bGwpIGUudGFyZ2V0LnJlc3VsdCA9IGV2dC5yZXN1bHQ7XG4gICAgICByZXR1cm4gZTtcbiAgICB9O1xuICAgIHZhciBsaXN0ZW5lciA9IGZ1bmN0aW9uIChldnQpIHtcbiAgICAgIGlmICghbG9hZFN0YXJ0ZWQpIHtcbiAgICAgICAgbG9hZFN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAoX3RoaXMub25sb2Fkc3RhcnQpIF90aGlzLm9ubG9hZHN0YXJ0KGNvbnN0cnVjdEV2ZW50KCdsb2Fkc3RhcnQnLCBldnQpKTtcbiAgICAgIH1cbiAgICAgIHZhciBlO1xuICAgICAgaWYgKGV2dC50eXBlID09PSAnbG9hZCcpIHtcbiAgICAgICAgaWYgKF90aGlzLm9ubG9hZGVuZCkgX3RoaXMub25sb2FkZW5kKGNvbnN0cnVjdEV2ZW50KCdsb2FkZW5kJywgZXZ0KSk7XG4gICAgICAgIGUgPSBjb25zdHJ1Y3RFdmVudCgnbG9hZCcsIGV2dCk7XG4gICAgICAgIGlmIChfdGhpcy5vbmxvYWQpIF90aGlzLm9ubG9hZChlKTtcbiAgICAgICAgX3RoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgIH0gZWxzZSBpZiAoZXZ0LnR5cGUgPT09ICdwcm9ncmVzcycpIHtcbiAgICAgICAgZSA9IGNvbnN0cnVjdEV2ZW50KCdwcm9ncmVzcycsIGV2dCk7XG4gICAgICAgIGlmIChfdGhpcy5vbnByb2dyZXNzKSBfdGhpcy5vbnByb2dyZXNzKGUpO1xuICAgICAgICBfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZSA9IGNvbnN0cnVjdEV2ZW50KCdlcnJvcicsIGV2dCk7XG4gICAgICAgIGlmIChfdGhpcy5vbmVycm9yKSBfdGhpcy5vbmVycm9yKGUpO1xuICAgICAgICBfdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5yZWFkQXNEYXRhVVJMID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgIEZpbGVBUEkucmVhZEFzRGF0YVVSTChmaWxlLCBsaXN0ZW5lcik7XG4gICAgfTtcbiAgICB0aGlzLnJlYWRBc1RleHQgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgRmlsZUFQSS5yZWFkQXNUZXh0KGZpbGUsIGxpc3RlbmVyKTtcbiAgICB9O1xuICB9O1xufVxuXG4vKiohXG4gKiBBbmd1bGFySlMgZmlsZSB1cGxvYWQgZGlyZWN0aXZlcyBhbmQgc2VydmljZXMuIFN1cG9vcnRzOiBmaWxlIHVwbG9hZC9kcm9wL3Bhc3RlLCByZXN1bWUsIGNhbmNlbC9hYm9ydCxcbiAqIHByb2dyZXNzLCByZXNpemUsIHRodW1ibmFpbCwgcHJldmlldywgdmFsaWRhdGlvbiBhbmQgQ09SU1xuICogQGF1dGhvciAgRGFuaWFsICA8ZGFuaWFsLmZhcmlkQGdtYWlsLmNvbT5cbiAqIEB2ZXJzaW9uIDEyLjIuMTJcbiAqL1xuXG5pZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0ICYmICEod2luZG93LkZpbGVBUEkgJiYgRmlsZUFQSS5zaG91bGRMb2FkKSkge1xuICB3aW5kb3cuWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLnNldFJlcXVlc3RIZWFkZXIgPSAoZnVuY3Rpb24gKG9yaWcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGhlYWRlciwgdmFsdWUpIHtcbiAgICAgIGlmIChoZWFkZXIgPT09ICdfX3NldFhIUl8nKSB7XG4gICAgICAgIHZhciB2YWwgPSB2YWx1ZSh0aGlzKTtcbiAgICAgICAgLy8gZml4IGZvciBhbmd1bGFyIDwgMS4yLjBcbiAgICAgICAgaWYgKHZhbCBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICAgICAgdmFsKHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvcmlnLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkod2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZS5zZXRSZXF1ZXN0SGVhZGVyKTtcbn1cblxudmFyIG5nRmlsZVVwbG9hZCA9IGFuZ3VsYXIubW9kdWxlKCduZ0ZpbGVVcGxvYWQnLCBbXSk7XG5cbm5nRmlsZVVwbG9hZC52ZXJzaW9uID0gJzEyLjIuMTInO1xuXG5uZ0ZpbGVVcGxvYWQuc2VydmljZSgnVXBsb2FkQmFzZScsIFsnJGh0dHAnLCAnJHEnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoJGh0dHAsICRxLCAkdGltZW91dCkge1xuICB2YXIgdXBsb2FkID0gdGhpcztcbiAgdXBsb2FkLnByb21pc2VzQ291bnQgPSAwO1xuXG4gIHRoaXMuaXNSZXN1bWVTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5CbG9iICYmIHdpbmRvdy5CbG9iLnByb3RvdHlwZS5zbGljZTtcbiAgfTtcblxuICB2YXIgcmVzdW1lU3VwcG9ydGVkID0gdGhpcy5pc1Jlc3VtZVN1cHBvcnRlZCgpO1xuXG4gIGZ1bmN0aW9uIHNlbmRIdHRwKGNvbmZpZykge1xuICAgIGNvbmZpZy5tZXRob2QgPSBjb25maWcubWV0aG9kIHx8ICdQT1NUJztcbiAgICBjb25maWcuaGVhZGVycyA9IGNvbmZpZy5oZWFkZXJzIHx8IHt9O1xuXG4gICAgdmFyIGRlZmVycmVkID0gY29uZmlnLl9kZWZlcnJlZCA9IGNvbmZpZy5fZGVmZXJyZWQgfHwgJHEuZGVmZXIoKTtcbiAgICB2YXIgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG5cbiAgICBmdW5jdGlvbiBub3RpZnlQcm9ncmVzcyhlKSB7XG4gICAgICBpZiAoZGVmZXJyZWQubm90aWZ5KSB7XG4gICAgICAgIGRlZmVycmVkLm5vdGlmeShlKTtcbiAgICAgIH1cbiAgICAgIGlmIChwcm9taXNlLnByb2dyZXNzRnVuYykge1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcHJvbWlzZS5wcm9ncmVzc0Z1bmMoZSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE5vdGlmeUV2ZW50KG4pIHtcbiAgICAgIGlmIChjb25maWcuX3N0YXJ0ICE9IG51bGwgJiYgcmVzdW1lU3VwcG9ydGVkKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9hZGVkOiBuLmxvYWRlZCArIGNvbmZpZy5fc3RhcnQsXG4gICAgICAgICAgdG90YWw6IChjb25maWcuX2ZpbGUgJiYgY29uZmlnLl9maWxlLnNpemUpIHx8IG4udG90YWwsXG4gICAgICAgICAgdHlwZTogbi50eXBlLCBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgICBsZW5ndGhDb21wdXRhYmxlOiB0cnVlLCB0YXJnZXQ6IG4udGFyZ2V0XG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWNvbmZpZy5kaXNhYmxlUHJvZ3Jlc3MpIHtcbiAgICAgIGNvbmZpZy5oZWFkZXJzLl9fc2V0WEhSXyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICBpZiAoIXhociB8fCAheGhyLnVwbG9hZCB8fCAheGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKSByZXR1cm47XG4gICAgICAgICAgY29uZmlnLl9fWEhSID0geGhyO1xuICAgICAgICAgIGlmIChjb25maWcueGhyRm4pIGNvbmZpZy54aHJGbih4aHIpO1xuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5jb25maWcgPSBjb25maWc7XG4gICAgICAgICAgICBub3RpZnlQcm9ncmVzcyhnZXROb3RpZnlFdmVudChlKSk7XG4gICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICAgIC8vZml4IGZvciBmaXJlZm94IG5vdCBmaXJpbmcgdXBsb2FkIHByb2dyZXNzIGVuZCwgYWxzbyBJRTgtOVxuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5sZW5ndGhDb21wdXRhYmxlKSB7XG4gICAgICAgICAgICAgIGUuY29uZmlnID0gY29uZmlnO1xuICAgICAgICAgICAgICBub3RpZnlQcm9ncmVzcyhnZXROb3RpZnlFdmVudChlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1cGxvYWRXaXRoQW5ndWxhcigpIHtcbiAgICAgICRodHRwKGNvbmZpZykudGhlbihmdW5jdGlvbiAocikge1xuICAgICAgICAgIGlmIChyZXN1bWVTdXBwb3J0ZWQgJiYgY29uZmlnLl9jaHVua1NpemUgJiYgIWNvbmZpZy5fZmluaXNoZWQgJiYgY29uZmlnLl9maWxlKSB7XG4gICAgICAgICAgICB2YXIgZmlsZVNpemUgPSBjb25maWcuX2ZpbGUgJiYgY29uZmlnLl9maWxlLnNpemUgfHwgMDtcbiAgICAgICAgICAgIG5vdGlmeVByb2dyZXNzKHtcbiAgICAgICAgICAgICAgICBsb2FkZWQ6IE1hdGgubWluKGNvbmZpZy5fZW5kLCBmaWxlU2l6ZSksXG4gICAgICAgICAgICAgICAgdG90YWw6IGZpbGVTaXplLFxuICAgICAgICAgICAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdwcm9ncmVzcydcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHVwbG9hZC51cGxvYWQoY29uZmlnLCB0cnVlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5fZmluaXNoZWQpIGRlbGV0ZSBjb25maWcuX2ZpbmlzaGVkO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgICB9LCBmdW5jdGlvbiAobikge1xuICAgICAgICAgIGRlZmVycmVkLm5vdGlmeShuKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIXJlc3VtZVN1cHBvcnRlZCkge1xuICAgICAgdXBsb2FkV2l0aEFuZ3VsYXIoKTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5fY2h1bmtTaXplICYmIGNvbmZpZy5fZW5kICYmICFjb25maWcuX2ZpbmlzaGVkKSB7XG4gICAgICBjb25maWcuX3N0YXJ0ID0gY29uZmlnLl9lbmQ7XG4gICAgICBjb25maWcuX2VuZCArPSBjb25maWcuX2NodW5rU2l6ZTtcbiAgICAgIHVwbG9hZFdpdGhBbmd1bGFyKCk7XG4gICAgfSBlbHNlIGlmIChjb25maWcucmVzdW1lU2l6ZVVybCkge1xuICAgICAgJGh0dHAuZ2V0KGNvbmZpZy5yZXN1bWVTaXplVXJsKS50aGVuKGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgIGlmIChjb25maWcucmVzdW1lU2l6ZVJlc3BvbnNlUmVhZGVyKSB7XG4gICAgICAgICAgY29uZmlnLl9zdGFydCA9IGNvbmZpZy5yZXN1bWVTaXplUmVzcG9uc2VSZWFkZXIocmVzcC5kYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25maWcuX3N0YXJ0ID0gcGFyc2VJbnQoKHJlc3AuZGF0YS5zaXplID09IG51bGwgPyByZXNwLmRhdGEgOiByZXNwLmRhdGEuc2l6ZSkudG9TdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbmZpZy5fY2h1bmtTaXplKSB7XG4gICAgICAgICAgY29uZmlnLl9lbmQgPSBjb25maWcuX3N0YXJ0ICsgY29uZmlnLl9jaHVua1NpemU7XG4gICAgICAgIH1cbiAgICAgICAgdXBsb2FkV2l0aEFuZ3VsYXIoKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZy5yZXN1bWVTaXplKSB7XG4gICAgICBjb25maWcucmVzdW1lU2l6ZSgpLnRoZW4oZnVuY3Rpb24gKHNpemUpIHtcbiAgICAgICAgY29uZmlnLl9zdGFydCA9IHNpemU7XG4gICAgICAgIGlmIChjb25maWcuX2NodW5rU2l6ZSkge1xuICAgICAgICAgIGNvbmZpZy5fZW5kID0gY29uZmlnLl9zdGFydCArIGNvbmZpZy5fY2h1bmtTaXplO1xuICAgICAgICB9XG4gICAgICAgIHVwbG9hZFdpdGhBbmd1bGFyKCk7XG4gICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjb25maWcuX2NodW5rU2l6ZSkge1xuICAgICAgICBjb25maWcuX3N0YXJ0ID0gMDtcbiAgICAgICAgY29uZmlnLl9lbmQgPSBjb25maWcuX3N0YXJ0ICsgY29uZmlnLl9jaHVua1NpemU7XG4gICAgICB9XG4gICAgICB1cGxvYWRXaXRoQW5ndWxhcigpO1xuICAgIH1cblxuXG4gICAgcHJvbWlzZS5zdWNjZXNzID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIGZuKHJlc3BvbnNlLmRhdGEsIHJlc3BvbnNlLnN0YXR1cywgcmVzcG9uc2UuaGVhZGVycywgY29uZmlnKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcblxuICAgIHByb21pc2UuZXJyb3IgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHByb21pc2UudGhlbihudWxsLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgZm4ocmVzcG9uc2UuZGF0YSwgcmVzcG9uc2Uuc3RhdHVzLCByZXNwb25zZS5oZWFkZXJzLCBjb25maWcpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgcHJvbWlzZS5wcm9ncmVzcyA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgcHJvbWlzZS5wcm9ncmVzc0Z1bmMgPSBmbjtcbiAgICAgIHByb21pc2UudGhlbihudWxsLCBudWxsLCBmdW5jdGlvbiAobikge1xuICAgICAgICBmbihuKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfTtcbiAgICBwcm9taXNlLmFib3J0ID0gcHJvbWlzZS5wYXVzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChjb25maWcuX19YSFIpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNvbmZpZy5fX1hIUi5hYm9ydCgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH07XG4gICAgcHJvbWlzZS54aHIgPSBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIGNvbmZpZy54aHJGbiA9IChmdW5jdGlvbiAob3JpZ1hockZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKG9yaWdYaHJGbikgb3JpZ1hockZuLmFwcGx5KHByb21pc2UsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgZm4uYXBwbHkocHJvbWlzZSwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKGNvbmZpZy54aHJGbik7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9O1xuXG4gICAgdXBsb2FkLnByb21pc2VzQ291bnQrKztcbiAgICBpZiAocHJvbWlzZVsnZmluYWxseSddICYmIHByb21pc2VbJ2ZpbmFsbHknXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICBwcm9taXNlWydmaW5hbGx5J10oZnVuY3Rpb24gKCkge1xuICAgICAgICB1cGxvYWQucHJvbWlzZXNDb3VudC0tO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xuICB9XG5cbiAgdGhpcy5pc1VwbG9hZEluUHJvZ3Jlc3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHVwbG9hZC5wcm9taXNlc0NvdW50ID4gMDtcbiAgfTtcblxuICB0aGlzLnJlbmFtZSA9IGZ1bmN0aW9uIChmaWxlLCBuYW1lKSB7XG4gICAgZmlsZS5uZ2ZOYW1lID0gbmFtZTtcbiAgICByZXR1cm4gZmlsZTtcbiAgfTtcblxuICB0aGlzLmpzb25CbG9iID0gZnVuY3Rpb24gKHZhbCkge1xuICAgIGlmICh2YWwgIT0gbnVsbCAmJiAhYW5ndWxhci5pc1N0cmluZyh2YWwpKSB7XG4gICAgICB2YWwgPSBKU09OLnN0cmluZ2lmeSh2YWwpO1xuICAgIH1cbiAgICB2YXIgYmxvYiA9IG5ldyB3aW5kb3cuQmxvYihbdmFsXSwge3R5cGU6ICdhcHBsaWNhdGlvbi9qc29uJ30pO1xuICAgIGJsb2IuX25nZkJsb2IgPSB0cnVlO1xuICAgIHJldHVybiBibG9iO1xuICB9O1xuXG4gIHRoaXMuanNvbiA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICByZXR1cm4gYW5ndWxhci50b0pzb24odmFsKTtcbiAgfTtcblxuICBmdW5jdGlvbiBjb3B5KG9iaikge1xuICAgIHZhciBjbG9uZSA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBjbG9uZVtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIHRoaXMuaXNGaWxlID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICByZXR1cm4gZmlsZSAhPSBudWxsICYmIChmaWxlIGluc3RhbmNlb2Ygd2luZG93LkJsb2IgfHwgKGZpbGUuZmxhc2hJZCAmJiBmaWxlLm5hbWUgJiYgZmlsZS5zaXplKSk7XG4gIH07XG5cbiAgdGhpcy51cGxvYWQgPSBmdW5jdGlvbiAoY29uZmlnLCBpbnRlcm5hbCkge1xuICAgIGZ1bmN0aW9uIHRvUmVzdW1lRmlsZShmaWxlLCBmb3JtRGF0YSkge1xuICAgICAgaWYgKGZpbGUuX25nZkJsb2IpIHJldHVybiBmaWxlO1xuICAgICAgY29uZmlnLl9maWxlID0gY29uZmlnLl9maWxlIHx8IGZpbGU7XG4gICAgICBpZiAoY29uZmlnLl9zdGFydCAhPSBudWxsICYmIHJlc3VtZVN1cHBvcnRlZCkge1xuICAgICAgICBpZiAoY29uZmlnLl9lbmQgJiYgY29uZmlnLl9lbmQgPj0gZmlsZS5zaXplKSB7XG4gICAgICAgICAgY29uZmlnLl9maW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgY29uZmlnLl9lbmQgPSBmaWxlLnNpemU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNsaWNlID0gZmlsZS5zbGljZShjb25maWcuX3N0YXJ0LCBjb25maWcuX2VuZCB8fCBmaWxlLnNpemUpO1xuICAgICAgICBzbGljZS5uYW1lID0gZmlsZS5uYW1lO1xuICAgICAgICBzbGljZS5uZ2ZOYW1lID0gZmlsZS5uZ2ZOYW1lO1xuICAgICAgICBpZiAoY29uZmlnLl9jaHVua1NpemUpIHtcbiAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoJ19jaHVua1NpemUnLCBjb25maWcuX2NodW5rU2l6ZSk7XG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdfY3VycmVudENodW5rU2l6ZScsIGNvbmZpZy5fZW5kIC0gY29uZmlnLl9zdGFydCk7XG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKCdfY2h1bmtOdW1iZXInLCBNYXRoLmZsb29yKGNvbmZpZy5fc3RhcnQgLyBjb25maWcuX2NodW5rU2l6ZSkpO1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZCgnX3RvdGFsU2l6ZScsIGNvbmZpZy5fZmlsZS5zaXplKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc2xpY2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmlsZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRGaWVsZFRvRm9ybURhdGEoZm9ybURhdGEsIHZhbCwga2V5KSB7XG4gICAgICBpZiAodmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEYXRlKHZhbCkpIHtcbiAgICAgICAgICB2YWwgPSB2YWwudG9JU09TdHJpbmcoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYW5ndWxhci5pc1N0cmluZyh2YWwpKSB7XG4gICAgICAgICAgZm9ybURhdGEuYXBwZW5kKGtleSwgdmFsKTtcbiAgICAgICAgfSBlbHNlIGlmICh1cGxvYWQuaXNGaWxlKHZhbCkpIHtcbiAgICAgICAgICB2YXIgZmlsZSA9IHRvUmVzdW1lRmlsZSh2YWwsIGZvcm1EYXRhKTtcbiAgICAgICAgICB2YXIgc3BsaXQgPSBrZXkuc3BsaXQoJywnKTtcbiAgICAgICAgICBpZiAoc3BsaXRbMV0pIHtcbiAgICAgICAgICAgIGZpbGUubmdmTmFtZSA9IHNwbGl0WzFdLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbiAgICAgICAgICAgIGtleSA9IHNwbGl0WzBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25maWcuX2ZpbGVLZXkgPSBjb25maWcuX2ZpbGVLZXkgfHwga2V5O1xuICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChrZXksIGZpbGUsIGZpbGUubmdmTmFtZSB8fCBmaWxlLm5hbWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChhbmd1bGFyLmlzT2JqZWN0KHZhbCkpIHtcbiAgICAgICAgICAgIGlmICh2YWwuJCRuZ2ZDaXJjdWxhckRldGVjdGlvbikgdGhyb3cgJ25nRmlsZVVwbG9hZDogQ2lyY3VsYXIgcmVmZXJlbmNlIGluIGNvbmZpZy5kYXRhLiBNYWtlIHN1cmUgc3BlY2lmaWVkIGRhdGEgZm9yIFVwbG9hZC51cGxvYWQoKSBoYXMgbm8gY2lyY3VsYXIgcmVmZXJlbmNlOiAnICsga2V5O1xuXG4gICAgICAgICAgICB2YWwuJCRuZ2ZDaXJjdWxhckRldGVjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmb3IgKHZhciBrIGluIHZhbCkge1xuICAgICAgICAgICAgICAgIGlmICh2YWwuaGFzT3duUHJvcGVydHkoaykgJiYgayAhPT0gJyQkbmdmQ2lyY3VsYXJEZXRlY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICB2YXIgb2JqZWN0S2V5ID0gY29uZmlnLm9iamVjdEtleSA9PSBudWxsID8gJ1tpXScgOiBjb25maWcub2JqZWN0S2V5O1xuICAgICAgICAgICAgICAgICAgaWYgKHZhbC5sZW5ndGggJiYgcGFyc2VJbnQoaykgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBvYmplY3RLZXkgPSBjb25maWcuYXJyYXlLZXkgPT0gbnVsbCA/IG9iamVjdEtleSA6IGNvbmZpZy5hcnJheUtleTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGFkZEZpZWxkVG9Gb3JtRGF0YShmb3JtRGF0YSwgdmFsW2tdLCBrZXkgKyBvYmplY3RLZXkucmVwbGFjZSgvW2lrXS9nLCBrKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICBkZWxldGUgdmFsLiQkbmdmQ2lyY3VsYXJEZXRlY3Rpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvcm1EYXRhLmFwcGVuZChrZXksIHZhbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGlnZXN0Q29uZmlnKCkge1xuICAgICAgY29uZmlnLl9jaHVua1NpemUgPSB1cGxvYWQudHJhbnNsYXRlU2NhbGFycyhjb25maWcucmVzdW1lQ2h1bmtTaXplKTtcbiAgICAgIGNvbmZpZy5fY2h1bmtTaXplID0gY29uZmlnLl9jaHVua1NpemUgPyBwYXJzZUludChjb25maWcuX2NodW5rU2l6ZS50b1N0cmluZygpKSA6IG51bGw7XG5cbiAgICAgIGNvbmZpZy5oZWFkZXJzID0gY29uZmlnLmhlYWRlcnMgfHwge307XG4gICAgICBjb25maWcuaGVhZGVyc1snQ29udGVudC1UeXBlJ10gPSB1bmRlZmluZWQ7XG4gICAgICBjb25maWcudHJhbnNmb3JtUmVxdWVzdCA9IGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID9cbiAgICAgICAgKGFuZ3VsYXIuaXNBcnJheShjb25maWcudHJhbnNmb3JtUmVxdWVzdCkgP1xuICAgICAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0IDogW2NvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0XSkgOiBbXTtcbiAgICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0LnB1c2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgdmFyIGZvcm1EYXRhID0gbmV3IHdpbmRvdy5Gb3JtRGF0YSgpLCBrZXk7XG4gICAgICAgIGRhdGEgPSBkYXRhIHx8IGNvbmZpZy5maWVsZHMgfHwge307XG4gICAgICAgIGlmIChjb25maWcuZmlsZSkge1xuICAgICAgICAgIGRhdGEuZmlsZSA9IGNvbmZpZy5maWxlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gZGF0YVtrZXldO1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKSB7XG4gICAgICAgICAgICAgIGNvbmZpZy5mb3JtRGF0YUFwcGVuZGVyKGZvcm1EYXRhLCBrZXksIHZhbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBhZGRGaWVsZFRvRm9ybURhdGEoZm9ybURhdGEsIHZhbCwga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybURhdGE7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWludGVybmFsKSBjb25maWcgPSBjb3B5KGNvbmZpZyk7XG4gICAgaWYgKCFjb25maWcuX2lzRGlnZXN0ZWQpIHtcbiAgICAgIGNvbmZpZy5faXNEaWdlc3RlZCA9IHRydWU7XG4gICAgICBkaWdlc3RDb25maWcoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VuZEh0dHAoY29uZmlnKTtcbiAgfTtcblxuICB0aGlzLmh0dHAgPSBmdW5jdGlvbiAoY29uZmlnKSB7XG4gICAgY29uZmlnID0gY29weShjb25maWcpO1xuICAgIGNvbmZpZy50cmFuc2Zvcm1SZXF1ZXN0ID0gY29uZmlnLnRyYW5zZm9ybVJlcXVlc3QgfHwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgaWYgKCh3aW5kb3cuQXJyYXlCdWZmZXIgJiYgZGF0YSBpbnN0YW5jZW9mIHdpbmRvdy5BcnJheUJ1ZmZlcikgfHwgZGF0YSBpbnN0YW5jZW9mIHdpbmRvdy5CbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRodHRwLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3RbMF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgY29uZmlnLl9jaHVua1NpemUgPSB1cGxvYWQudHJhbnNsYXRlU2NhbGFycyhjb25maWcucmVzdW1lQ2h1bmtTaXplKTtcbiAgICBjb25maWcuX2NodW5rU2l6ZSA9IGNvbmZpZy5fY2h1bmtTaXplID8gcGFyc2VJbnQoY29uZmlnLl9jaHVua1NpemUudG9TdHJpbmcoKSkgOiBudWxsO1xuXG4gICAgcmV0dXJuIHNlbmRIdHRwKGNvbmZpZyk7XG4gIH07XG5cbiAgdGhpcy50cmFuc2xhdGVTY2FsYXJzID0gZnVuY3Rpb24gKHN0cikge1xuICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKHN0cikpIHtcbiAgICAgIGlmIChzdHIuc2VhcmNoKC9rYi9pKSA9PT0gc3RyLmxlbmd0aCAtIDIpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyLnN1YnN0cmluZygwLCBzdHIubGVuZ3RoIC0gMikgKiAxMDI0KTtcbiAgICAgIH0gZWxzZSBpZiAoc3RyLnNlYXJjaCgvbWIvaSkgPT09IHN0ci5sZW5ndGggLSAyKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDIpICogMTA0ODU3Nik7XG4gICAgICB9IGVsc2UgaWYgKHN0ci5zZWFyY2goL2diL2kpID09PSBzdHIubGVuZ3RoIC0gMikge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGggLSAyKSAqIDEwNzM3NDE4MjQpO1xuICAgICAgfSBlbHNlIGlmIChzdHIuc2VhcmNoKC9iL2kpID09PSBzdHIubGVuZ3RoIC0gMSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHIuc3Vic3RyaW5nKDAsIHN0ci5sZW5ndGggLSAxKSk7XG4gICAgICB9IGVsc2UgaWYgKHN0ci5zZWFyY2goL3MvaSkgPT09IHN0ci5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDEpKTtcbiAgICAgIH0gZWxzZSBpZiAoc3RyLnNlYXJjaCgvbS9pKSA9PT0gc3RyLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyLnN1YnN0cmluZygwLCBzdHIubGVuZ3RoIC0gMSkgKiA2MCk7XG4gICAgICB9IGVsc2UgaWYgKHN0ci5zZWFyY2goL2gvaSkgPT09IHN0ci5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDEpICogMzYwMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG4gIH07XG5cbiAgdGhpcy51cmxUb0Jsb2IgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgICRodHRwKHt1cmw6IHVybCwgbWV0aG9kOiAnZ2V0JywgcmVzcG9uc2VUeXBlOiAnYXJyYXlidWZmZXInfSkudGhlbihmdW5jdGlvbiAocmVzcCkge1xuICAgICAgdmFyIGFycmF5QnVmZmVyVmlldyA9IG5ldyBVaW50OEFycmF5KHJlc3AuZGF0YSk7XG4gICAgICB2YXIgdHlwZSA9IHJlc3AuaGVhZGVycygnY29udGVudC10eXBlJykgfHwgJ2ltYWdlL1dlYlAnO1xuICAgICAgdmFyIGJsb2IgPSBuZXcgd2luZG93LkJsb2IoW2FycmF5QnVmZmVyVmlld10sIHt0eXBlOiB0eXBlfSk7XG4gICAgICB2YXIgbWF0Y2hlcyA9IHVybC5tYXRjaCgvLipcXC8oLis/KShcXD8uKik/JC8pO1xuICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoID4gMSkge1xuICAgICAgICBibG9iLm5hbWUgPSBtYXRjaGVzWzFdO1xuICAgICAgfVxuICAgICAgZGVmZXIucmVzb2x2ZShibG9iKTtcbiAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9O1xuXG4gIHRoaXMuc2V0RGVmYXVsdHMgPSBmdW5jdGlvbiAoZGVmYXVsdHMpIHtcbiAgICB0aGlzLmRlZmF1bHRzID0gZGVmYXVsdHMgfHwge307XG4gIH07XG5cbiAgdGhpcy5kZWZhdWx0cyA9IHt9O1xuICB0aGlzLnZlcnNpb24gPSBuZ0ZpbGVVcGxvYWQudmVyc2lvbjtcbn1cblxuXSk7XG5cbm5nRmlsZVVwbG9hZC5zZXJ2aWNlKCdVcGxvYWQnLCBbJyRwYXJzZScsICckdGltZW91dCcsICckY29tcGlsZScsICckcScsICdVcGxvYWRFeGlmJywgZnVuY3Rpb24gKCRwYXJzZSwgJHRpbWVvdXQsICRjb21waWxlLCAkcSwgVXBsb2FkRXhpZikge1xuICB2YXIgdXBsb2FkID0gVXBsb2FkRXhpZjtcbiAgdXBsb2FkLmdldEF0dHJXaXRoRGVmYXVsdHMgPSBmdW5jdGlvbiAoYXR0ciwgbmFtZSkge1xuICAgIGlmIChhdHRyW25hbWVdICE9IG51bGwpIHJldHVybiBhdHRyW25hbWVdO1xuICAgIHZhciBkZWYgPSB1cGxvYWQuZGVmYXVsdHNbbmFtZV07XG4gICAgcmV0dXJuIChkZWYgPT0gbnVsbCA/IGRlZiA6IChhbmd1bGFyLmlzU3RyaW5nKGRlZikgPyBkZWYgOiBKU09OLnN0cmluZ2lmeShkZWYpKSk7XG4gIH07XG5cbiAgdXBsb2FkLmF0dHJHZXR0ZXIgPSBmdW5jdGlvbiAobmFtZSwgYXR0ciwgc2NvcGUsIHBhcmFtcykge1xuICAgIHZhciBhdHRyVmFsID0gdGhpcy5nZXRBdHRyV2l0aERlZmF1bHRzKGF0dHIsIG5hbWUpO1xuICAgIGlmIChzY29wZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKHBhcmFtcykge1xuICAgICAgICAgIHJldHVybiAkcGFyc2UoYXR0clZhbCkoc2NvcGUsIHBhcmFtcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuICRwYXJzZShhdHRyVmFsKShzY29wZSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gaGFuZ2xlIHN0cmluZyB2YWx1ZSB3aXRob3V0IHNpbmdsZSBxb3V0ZVxuICAgICAgICBpZiAobmFtZS5zZWFyY2goL21pbnxtYXh8cGF0dGVybi9pKSkge1xuICAgICAgICAgIHJldHVybiBhdHRyVmFsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF0dHJWYWw7XG4gICAgfVxuICB9O1xuXG4gIHVwbG9hZC5zaG91bGRVcGRhdGVPbiA9IGZ1bmN0aW9uICh0eXBlLCBhdHRyLCBzY29wZSkge1xuICAgIHZhciBtb2RlbE9wdGlvbnMgPSB1cGxvYWQuYXR0ckdldHRlcignbmdmTW9kZWxPcHRpb25zJywgYXR0ciwgc2NvcGUpO1xuICAgIGlmIChtb2RlbE9wdGlvbnMgJiYgbW9kZWxPcHRpb25zLnVwZGF0ZU9uKSB7XG4gICAgICByZXR1cm4gbW9kZWxPcHRpb25zLnVwZGF0ZU9uLnNwbGl0KCcgJykuaW5kZXhPZih0eXBlKSA+IC0xO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICB1cGxvYWQuZW1wdHlQcm9taXNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBkID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBkLnJlc29sdmUuYXBwbHkoZCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGQucHJvbWlzZTtcbiAgfTtcblxuICB1cGxvYWQucmVqZWN0UHJvbWlzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZCA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgZC5yZWplY3QuYXBwbHkoZCwgYXJncyk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGQucHJvbWlzZTtcbiAgfTtcblxuICB1cGxvYWQuaGFwcHlQcm9taXNlID0gZnVuY3Rpb24gKHByb21pc2UsIGRhdGEpIHtcbiAgICB2YXIgZCA9ICRxLmRlZmVyKCk7XG4gICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgIGQucmVzb2x2ZShyZXN1bHQpO1xuICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH0pO1xuICAgICAgZC5yZXNvbHZlKGRhdGEpO1xuICAgIH0pO1xuICAgIHJldHVybiBkLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gYXBwbHlFeGlmUm90YXRpb25zKGZpbGVzLCBhdHRyLCBzY29wZSkge1xuICAgIHZhciBwcm9taXNlcyA9IFt1cGxvYWQuZW1wdHlQcm9taXNlKCldO1xuICAgIGFuZ3VsYXIuZm9yRWFjaChmaWxlcywgZnVuY3Rpb24gKGYsIGkpIHtcbiAgICAgIGlmIChmLnR5cGUuaW5kZXhPZignaW1hZ2UvanBlZycpID09PSAwICYmIHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZGaXhPcmllbnRhdGlvbicsIGF0dHIsIHNjb3BlLCB7JGZpbGU6IGZ9KSkge1xuICAgICAgICBwcm9taXNlcy5wdXNoKHVwbG9hZC5oYXBweVByb21pc2UodXBsb2FkLmFwcGx5RXhpZlJvdGF0aW9uKGYpLCBmKS50aGVuKGZ1bmN0aW9uIChmaXhlZEZpbGUpIHtcbiAgICAgICAgICBmaWxlcy5zcGxpY2UoaSwgMSwgZml4ZWRGaWxlKTtcbiAgICAgICAgfSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiAkcS5hbGwocHJvbWlzZXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gcmVzaXplRmlsZShmaWxlcywgYXR0ciwgc2NvcGUsIG5nTW9kZWwpIHtcbiAgICB2YXIgcmVzaXplVmFsID0gdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZlJlc2l6ZScsIGF0dHIsIHNjb3BlKTtcbiAgICBpZiAoIXJlc2l6ZVZhbCB8fCAhdXBsb2FkLmlzUmVzaXplU3VwcG9ydGVkKCkgfHwgIWZpbGVzLmxlbmd0aCkgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2UoKTtcbiAgICBpZiAocmVzaXplVmFsIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XG4gICAgICByZXR1cm4gcmVzaXplVmFsKGZpbGVzKS50aGVuKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHJlc2l6ZVdpdGhQYXJhbXMocCwgZmlsZXMsIGF0dHIsIHNjb3BlLCBuZ01vZGVsKS50aGVuKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgZGVmZXIucmVzb2x2ZShyKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICBkZWZlci5yZWplY3QoZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXNpemVXaXRoUGFyYW1zKHJlc2l6ZVZhbCwgZmlsZXMsIGF0dHIsIHNjb3BlLCBuZ01vZGVsKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZXNpemVXaXRoUGFyYW1zKHBhcmFtcywgZmlsZXMsIGF0dHIsIHNjb3BlLCBuZ01vZGVsKSB7XG4gICAgdmFyIHByb21pc2VzID0gW3VwbG9hZC5lbXB0eVByb21pc2UoKV07XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVGaWxlKGYsIGkpIHtcbiAgICAgIGlmIChmLnR5cGUuaW5kZXhPZignaW1hZ2UnKSA9PT0gMCkge1xuICAgICAgICBpZiAocGFyYW1zLnBhdHRlcm4gJiYgIXVwbG9hZC52YWxpZGF0ZVBhdHRlcm4oZiwgcGFyYW1zLnBhdHRlcm4pKSByZXR1cm47XG4gICAgICAgIHBhcmFtcy5yZXNpemVJZiA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgICAgcmV0dXJuIHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZSZXNpemVJZicsIGF0dHIsIHNjb3BlLFxuICAgICAgICAgICAgeyR3aWR0aDogd2lkdGgsICRoZWlnaHQ6IGhlaWdodCwgJGZpbGU6IGZ9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHByb21pc2UgPSB1cGxvYWQucmVzaXplKGYsIHBhcmFtcyk7XG4gICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzaXplZEZpbGUpIHtcbiAgICAgICAgICBmaWxlcy5zcGxpY2UoaSwgMSwgcmVzaXplZEZpbGUpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGYuJGVycm9yID0gJ3Jlc2l6ZSc7XG4gICAgICAgICAgKGYuJGVycm9yTWVzc2FnZXMgPSAoZi4kZXJyb3JNZXNzYWdlcyB8fCB7fSkpLnJlc2l6ZSA9IHRydWU7XG4gICAgICAgICAgZi4kZXJyb3JQYXJhbSA9IChlID8gKGUubWVzc2FnZSA/IGUubWVzc2FnZSA6IGUpICsgJzogJyA6ICcnKSArIChmICYmIGYubmFtZSk7XG4gICAgICAgICAgbmdNb2RlbC4kbmdmVmFsaWRhdGlvbnMucHVzaCh7bmFtZTogJ3Jlc2l6ZScsIHZhbGlkOiBmYWxzZX0pO1xuICAgICAgICAgIHVwbG9hZC5hcHBseU1vZGVsVmFsaWRhdGlvbihuZ01vZGVsLCBmaWxlcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGhhbmRsZUZpbGUoZmlsZXNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gJHEuYWxsKHByb21pc2VzKTtcbiAgfVxuXG4gIHVwbG9hZC51cGRhdGVNb2RlbCA9IGZ1bmN0aW9uIChuZ01vZGVsLCBhdHRyLCBzY29wZSwgZmlsZUNoYW5nZSwgZmlsZXMsIGV2dCwgbm9EZWxheSkge1xuICAgIGZ1bmN0aW9uIHVwZGF0ZShmaWxlcywgaW52YWxpZEZpbGVzLCBuZXdGaWxlcywgZHVwRmlsZXMsIGlzU2luZ2xlTW9kZWwpIHtcbiAgICAgIGF0dHIuJCRuZ2ZQcmV2VmFsaWRGaWxlcyA9IGZpbGVzO1xuICAgICAgYXR0ci4kJG5nZlByZXZJbnZhbGlkRmlsZXMgPSBpbnZhbGlkRmlsZXM7XG4gICAgICB2YXIgZmlsZSA9IGZpbGVzICYmIGZpbGVzLmxlbmd0aCA/IGZpbGVzWzBdIDogbnVsbDtcbiAgICAgIHZhciBpbnZhbGlkRmlsZSA9IGludmFsaWRGaWxlcyAmJiBpbnZhbGlkRmlsZXMubGVuZ3RoID8gaW52YWxpZEZpbGVzWzBdIDogbnVsbDtcblxuICAgICAgaWYgKG5nTW9kZWwpIHtcbiAgICAgICAgdXBsb2FkLmFwcGx5TW9kZWxWYWxpZGF0aW9uKG5nTW9kZWwsIGZpbGVzKTtcbiAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKGlzU2luZ2xlTW9kZWwgPyBmaWxlIDogZmlsZXMpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZUNoYW5nZSkge1xuICAgICAgICAkcGFyc2UoZmlsZUNoYW5nZSkoc2NvcGUsIHtcbiAgICAgICAgICAkZmlsZXM6IGZpbGVzLFxuICAgICAgICAgICRmaWxlOiBmaWxlLFxuICAgICAgICAgICRuZXdGaWxlczogbmV3RmlsZXMsXG4gICAgICAgICAgJGR1cGxpY2F0ZUZpbGVzOiBkdXBGaWxlcyxcbiAgICAgICAgICAkaW52YWxpZEZpbGVzOiBpbnZhbGlkRmlsZXMsXG4gICAgICAgICAgJGludmFsaWRGaWxlOiBpbnZhbGlkRmlsZSxcbiAgICAgICAgICAkZXZlbnQ6IGV2dFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgdmFyIGludmFsaWRNb2RlbCA9IHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZNb2RlbEludmFsaWQnLCBhdHRyKTtcbiAgICAgIGlmIChpbnZhbGlkTW9kZWwpIHtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRwYXJzZShpbnZhbGlkTW9kZWwpLmFzc2lnbihzY29wZSwgaXNTaW5nbGVNb2RlbCA/IGludmFsaWRGaWxlIDogaW52YWxpZEZpbGVzKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIHNjb3BlIGFwcGx5IGNoYW5nZXNcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBhbGxOZXdGaWxlcywgZHVwRmlsZXMgPSBbXSwgcHJldlZhbGlkRmlsZXMsIHByZXZJbnZhbGlkRmlsZXMsXG4gICAgICBpbnZhbGlkcyA9IFtdLCB2YWxpZHMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIHJlbW92ZUR1cGxpY2F0ZXMoKSB7XG4gICAgICBmdW5jdGlvbiBlcXVhbHMoZjEsIGYyKSB7XG4gICAgICAgIHJldHVybiBmMS5uYW1lID09PSBmMi5uYW1lICYmIChmMS4kbmdmT3JpZ1NpemUgfHwgZjEuc2l6ZSkgPT09IChmMi4kbmdmT3JpZ1NpemUgfHwgZjIuc2l6ZSkgJiZcbiAgICAgICAgICBmMS50eXBlID09PSBmMi50eXBlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpc0luUHJldkZpbGVzKGYpIHtcbiAgICAgICAgdmFyIGo7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBwcmV2VmFsaWRGaWxlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChlcXVhbHMoZiwgcHJldlZhbGlkRmlsZXNbal0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHByZXZJbnZhbGlkRmlsZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICBpZiAoZXF1YWxzKGYsIHByZXZJbnZhbGlkRmlsZXNbal0pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpZiAoZmlsZXMpIHtcbiAgICAgICAgYWxsTmV3RmlsZXMgPSBbXTtcbiAgICAgICAgZHVwRmlsZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChpc0luUHJldkZpbGVzKGZpbGVzW2ldKSkge1xuICAgICAgICAgICAgZHVwRmlsZXMucHVzaChmaWxlc1tpXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFsbE5ld0ZpbGVzLnB1c2goZmlsZXNbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRvQXJyYXkodikge1xuICAgICAgcmV0dXJuIGFuZ3VsYXIuaXNBcnJheSh2KSA/IHYgOiBbdl07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzaXplQW5kVXBkYXRlKCkge1xuICAgICAgZnVuY3Rpb24gdXBkYXRlTW9kZWwoKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB1cGRhdGUoa2VlcCA/IHByZXZWYWxpZEZpbGVzLmNvbmNhdCh2YWxpZHMpIDogdmFsaWRzLFxuICAgICAgICAgICAga2VlcCA/IHByZXZJbnZhbGlkRmlsZXMuY29uY2F0KGludmFsaWRzKSA6IGludmFsaWRzLFxuICAgICAgICAgICAgZmlsZXMsIGR1cEZpbGVzLCBpc1NpbmdsZU1vZGVsKTtcbiAgICAgICAgfSwgb3B0aW9ucyAmJiBvcHRpb25zLmRlYm91bmNlID8gb3B0aW9ucy5kZWJvdW5jZS5jaGFuZ2UgfHwgb3B0aW9ucy5kZWJvdW5jZSA6IDApO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVzaXppbmdGaWxlcyA9IHZhbGlkYXRlQWZ0ZXJSZXNpemUgPyBhbGxOZXdGaWxlcyA6IHZhbGlkcztcbiAgICAgIHJlc2l6ZUZpbGUocmVzaXppbmdGaWxlcywgYXR0ciwgc2NvcGUsIG5nTW9kZWwpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodmFsaWRhdGVBZnRlclJlc2l6ZSkge1xuICAgICAgICAgIHVwbG9hZC52YWxpZGF0ZShhbGxOZXdGaWxlcywga2VlcCA/IHByZXZWYWxpZEZpbGVzLmxlbmd0aCA6IDAsIG5nTW9kZWwsIGF0dHIsIHNjb3BlKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHZhbGlkYXRpb25SZXN1bHQpIHtcbiAgICAgICAgICAgICAgdmFsaWRzID0gdmFsaWRhdGlvblJlc3VsdC52YWxpZHNGaWxlcztcbiAgICAgICAgICAgICAgaW52YWxpZHMgPSB2YWxpZGF0aW9uUmVzdWx0LmludmFsaWRzRmlsZXM7XG4gICAgICAgICAgICAgIHVwZGF0ZU1vZGVsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB1cGRhdGVNb2RlbCgpO1xuICAgICAgICB9XG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzaXppbmdGaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBmID0gcmVzaXppbmdGaWxlc1tpXTtcbiAgICAgICAgICBpZiAoZi4kZXJyb3IgPT09ICdyZXNpemUnKSB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSB2YWxpZHMuaW5kZXhPZihmKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgIHZhbGlkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICBpbnZhbGlkcy5wdXNoKGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXBkYXRlTW9kZWwoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHByZXZWYWxpZEZpbGVzID0gYXR0ci4kJG5nZlByZXZWYWxpZEZpbGVzIHx8IFtdO1xuICAgIHByZXZJbnZhbGlkRmlsZXMgPSBhdHRyLiQkbmdmUHJldkludmFsaWRGaWxlcyB8fCBbXTtcbiAgICBpZiAobmdNb2RlbCAmJiBuZ01vZGVsLiRtb2RlbFZhbHVlKSB7XG4gICAgICBwcmV2VmFsaWRGaWxlcyA9IHRvQXJyYXkobmdNb2RlbC4kbW9kZWxWYWx1ZSk7XG4gICAgfVxuXG4gICAgdmFyIGtlZXAgPSB1cGxvYWQuYXR0ckdldHRlcignbmdmS2VlcCcsIGF0dHIsIHNjb3BlKTtcbiAgICBhbGxOZXdGaWxlcyA9IChmaWxlcyB8fCBbXSkuc2xpY2UoMCk7XG4gICAgaWYgKGtlZXAgPT09ICdkaXN0aW5jdCcgfHwgdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZktlZXBEaXN0aW5jdCcsIGF0dHIsIHNjb3BlKSA9PT0gdHJ1ZSkge1xuICAgICAgcmVtb3ZlRHVwbGljYXRlcyhhdHRyLCBzY29wZSk7XG4gICAgfVxuXG4gICAgdmFyIGlzU2luZ2xlTW9kZWwgPSAha2VlcCAmJiAhdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZk11bHRpcGxlJywgYXR0ciwgc2NvcGUpICYmICF1cGxvYWQuYXR0ckdldHRlcignbXVsdGlwbGUnLCBhdHRyKTtcblxuICAgIGlmIChrZWVwICYmICFhbGxOZXdGaWxlcy5sZW5ndGgpIHJldHVybjtcblxuICAgIHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZCZWZvcmVNb2RlbENoYW5nZScsIGF0dHIsIHNjb3BlLCB7XG4gICAgICAkZmlsZXM6IGZpbGVzLFxuICAgICAgJGZpbGU6IGZpbGVzICYmIGZpbGVzLmxlbmd0aCA/IGZpbGVzWzBdIDogbnVsbCxcbiAgICAgICRuZXdGaWxlczogYWxsTmV3RmlsZXMsXG4gICAgICAkZHVwbGljYXRlRmlsZXM6IGR1cEZpbGVzLFxuICAgICAgJGV2ZW50OiBldnRcbiAgICB9KTtcblxuICAgIHZhciB2YWxpZGF0ZUFmdGVyUmVzaXplID0gdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZlZhbGlkYXRlQWZ0ZXJSZXNpemUnLCBhdHRyLCBzY29wZSk7XG5cbiAgICB2YXIgb3B0aW9ucyA9IHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZNb2RlbE9wdGlvbnMnLCBhdHRyLCBzY29wZSk7XG4gICAgdXBsb2FkLnZhbGlkYXRlKGFsbE5ld0ZpbGVzLCBrZWVwID8gcHJldlZhbGlkRmlsZXMubGVuZ3RoIDogMCwgbmdNb2RlbCwgYXR0ciwgc2NvcGUpXG4gICAgICAudGhlbihmdW5jdGlvbiAodmFsaWRhdGlvblJlc3VsdCkge1xuICAgICAgaWYgKG5vRGVsYXkpIHtcbiAgICAgICAgdXBkYXRlKGFsbE5ld0ZpbGVzLCBbXSwgZmlsZXMsIGR1cEZpbGVzLCBpc1NpbmdsZU1vZGVsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICgoIW9wdGlvbnMgfHwgIW9wdGlvbnMuYWxsb3dJbnZhbGlkKSAmJiAhdmFsaWRhdGVBZnRlclJlc2l6ZSkge1xuICAgICAgICAgIHZhbGlkcyA9IHZhbGlkYXRpb25SZXN1bHQudmFsaWRGaWxlcztcbiAgICAgICAgICBpbnZhbGlkcyA9IHZhbGlkYXRpb25SZXN1bHQuaW52YWxpZEZpbGVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbGlkcyA9IGFsbE5ld0ZpbGVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1cGxvYWQuYXR0ckdldHRlcignbmdmRml4T3JpZW50YXRpb24nLCBhdHRyLCBzY29wZSkgJiYgdXBsb2FkLmlzRXhpZlN1cHBvcnRlZCgpKSB7XG4gICAgICAgICAgYXBwbHlFeGlmUm90YXRpb25zKHZhbGlkcywgYXR0ciwgc2NvcGUpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVzaXplQW5kVXBkYXRlKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzaXplQW5kVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gdXBsb2FkO1xufV0pO1xuXG5uZ0ZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ2ZTZWxlY3QnLCBbJyRwYXJzZScsICckdGltZW91dCcsICckY29tcGlsZScsICdVcGxvYWQnLCBmdW5jdGlvbiAoJHBhcnNlLCAkdGltZW91dCwgJGNvbXBpbGUsIFVwbG9hZCkge1xuICB2YXIgZ2VuZXJhdGVkRWxlbXMgPSBbXTtcblxuICBmdW5jdGlvbiBpc0RlbGF5ZWRDbGlja1N1cHBvcnRlZCh1YSkge1xuICAgIC8vIGZpeCBmb3IgYW5kcm9pZCBuYXRpdmUgYnJvd3NlciA8IDQuNCBhbmQgc2FmYXJpIHdpbmRvd3NcbiAgICB2YXIgbSA9IHVhLm1hdGNoKC9BbmRyb2lkW15cXGRdKihcXGQrKVxcLihcXGQrKS8pO1xuICAgIGlmIChtICYmIG0ubGVuZ3RoID4gMikge1xuICAgICAgdmFyIHYgPSBVcGxvYWQuZGVmYXVsdHMuYW5kcm9pZEZpeE1pbm9yVmVyc2lvbiB8fCA0O1xuICAgICAgcmV0dXJuIHBhcnNlSW50KG1bMV0pIDwgNCB8fCAocGFyc2VJbnQobVsxXSkgPT09IHYgJiYgcGFyc2VJbnQobVsyXSkgPCB2KTtcbiAgICB9XG5cbiAgICAvLyBzYWZhcmkgb24gd2luZG93c1xuICAgIHJldHVybiB1YS5pbmRleE9mKCdDaHJvbWUnKSA9PT0gLTEgJiYgLy4qV2luZG93cy4qU2FmYXJpLiovLnRlc3QodWEpO1xuICB9XG5cbiAgZnVuY3Rpb24gbGlua0ZpbGVTZWxlY3Qoc2NvcGUsIGVsZW0sIGF0dHIsIG5nTW9kZWwsICRwYXJzZSwgJHRpbWVvdXQsICRjb21waWxlLCB1cGxvYWQpIHtcbiAgICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZlNlbGVjdCAqL1xuICAgIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmQ2hhbmdlICovXG4gICAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ01vZGVsICovXG4gICAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZNb2RlbE9wdGlvbnMgKi9cbiAgICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZk11bHRpcGxlICovXG4gICAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZDYXB0dXJlICovXG4gICAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZWYWxpZGF0ZSAqL1xuICAgIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmS2VlcCAqL1xuICAgIHZhciBhdHRyR2V0dGVyID0gZnVuY3Rpb24gKG5hbWUsIHNjb3BlKSB7XG4gICAgICByZXR1cm4gdXBsb2FkLmF0dHJHZXR0ZXIobmFtZSwgYXR0ciwgc2NvcGUpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBpc0lucHV0VHlwZUZpbGUoKSB7XG4gICAgICByZXR1cm4gZWxlbVswXS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpbnB1dCcgJiYgYXR0ci50eXBlICYmIGF0dHIudHlwZS50b0xvd2VyQ2FzZSgpID09PSAnZmlsZSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmlsZUNoYW5nZUF0dHIoKSB7XG4gICAgICByZXR1cm4gYXR0ckdldHRlcignbmdmQ2hhbmdlJykgfHwgYXR0ckdldHRlcignbmdmU2VsZWN0Jyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hhbmdlRm4oZXZ0KSB7XG4gICAgICBpZiAodXBsb2FkLnNob3VsZFVwZGF0ZU9uKCdjaGFuZ2UnLCBhdHRyLCBzY29wZSkpIHtcbiAgICAgICAgdmFyIGZpbGVMaXN0ID0gZXZ0Ll9fZmlsZXNfIHx8IChldnQudGFyZ2V0ICYmIGV2dC50YXJnZXQuZmlsZXMpLCBmaWxlcyA9IFtdO1xuICAgICAgICAvKiBIYW5kbGUgZHVwbGljYXRlIGNhbGwgaW4gIElFMTEgKi9cbiAgICAgICAgaWYgKCFmaWxlTGlzdCkgcmV0dXJuO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZmlsZXMucHVzaChmaWxlTGlzdFtpXSk7XG4gICAgICAgIH1cbiAgICAgICAgdXBsb2FkLnVwZGF0ZU1vZGVsKG5nTW9kZWwsIGF0dHIsIHNjb3BlLCBmaWxlQ2hhbmdlQXR0cigpLFxuICAgICAgICAgIGZpbGVzLmxlbmd0aCA/IGZpbGVzIDogbnVsbCwgZXZ0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB1cGxvYWQucmVnaXN0ZXJNb2RlbENoYW5nZVZhbGlkYXRvcihuZ01vZGVsLCBhdHRyLCBzY29wZSk7XG5cbiAgICB2YXIgdW53YXRjaGVzID0gW107XG4gICAgaWYgKGF0dHJHZXR0ZXIoJ25nZk11bHRpcGxlJykpIHtcbiAgICAgIHVud2F0Y2hlcy5wdXNoKHNjb3BlLiR3YXRjaChhdHRyR2V0dGVyKCduZ2ZNdWx0aXBsZScpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZpbGVFbGVtLmF0dHIoJ211bHRpcGxlJywgYXR0ckdldHRlcignbmdmTXVsdGlwbGUnLCBzY29wZSkpO1xuICAgICAgfSkpO1xuICAgIH1cbiAgICBpZiAoYXR0ckdldHRlcignbmdmQ2FwdHVyZScpKSB7XG4gICAgICB1bndhdGNoZXMucHVzaChzY29wZS4kd2F0Y2goYXR0ckdldHRlcignbmdmQ2FwdHVyZScpLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZpbGVFbGVtLmF0dHIoJ2NhcHR1cmUnLCBhdHRyR2V0dGVyKCduZ2ZDYXB0dXJlJywgc2NvcGUpKTtcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgaWYgKGF0dHJHZXR0ZXIoJ25nZkFjY2VwdCcpKSB7XG4gICAgICB1bndhdGNoZXMucHVzaChzY29wZS4kd2F0Y2goYXR0ckdldHRlcignbmdmQWNjZXB0JyksIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZmlsZUVsZW0uYXR0cignYWNjZXB0JywgYXR0ckdldHRlcignbmdmQWNjZXB0Jywgc2NvcGUpKTtcbiAgICAgIH0pKTtcbiAgICB9XG4gICAgdW53YXRjaGVzLnB1c2goYXR0ci4kb2JzZXJ2ZSgnYWNjZXB0JywgZnVuY3Rpb24gKCkge1xuICAgICAgZmlsZUVsZW0uYXR0cignYWNjZXB0JywgYXR0ckdldHRlcignYWNjZXB0JykpO1xuICAgIH0pKTtcbiAgICBmdW5jdGlvbiBiaW5kQXR0clRvRmlsZUlucHV0KGZpbGVFbGVtLCBsYWJlbCkge1xuICAgICAgZnVuY3Rpb24gdXBkYXRlSWQodmFsKSB7XG4gICAgICAgIGZpbGVFbGVtLmF0dHIoJ2lkJywgJ25nZi0nICsgdmFsKTtcbiAgICAgICAgbGFiZWwuYXR0cignaWQnLCAnbmdmLWxhYmVsLScgKyB2YWwpO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1bMF0uYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYXR0cmlidXRlID0gZWxlbVswXS5hdHRyaWJ1dGVzW2ldO1xuICAgICAgICBpZiAoYXR0cmlidXRlLm5hbWUgIT09ICd0eXBlJyAmJiBhdHRyaWJ1dGUubmFtZSAhPT0gJ2NsYXNzJyAmJiBhdHRyaWJ1dGUubmFtZSAhPT0gJ3N0eWxlJykge1xuICAgICAgICAgIGlmIChhdHRyaWJ1dGUubmFtZSA9PT0gJ2lkJykge1xuICAgICAgICAgICAgdXBkYXRlSWQoYXR0cmlidXRlLnZhbHVlKTtcbiAgICAgICAgICAgIHVud2F0Y2hlcy5wdXNoKGF0dHIuJG9ic2VydmUoJ2lkJywgdXBkYXRlSWQpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsZUVsZW0uYXR0cihhdHRyaWJ1dGUubmFtZSwgKCFhdHRyaWJ1dGUudmFsdWUgJiYgKGF0dHJpYnV0ZS5uYW1lID09PSAncmVxdWlyZWQnIHx8XG4gICAgICAgICAgICBhdHRyaWJ1dGUubmFtZSA9PT0gJ211bHRpcGxlJykpID8gYXR0cmlidXRlLm5hbWUgOiBhdHRyaWJ1dGUudmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUZpbGVJbnB1dCgpIHtcbiAgICAgIGlmIChpc0lucHV0VHlwZUZpbGUoKSkge1xuICAgICAgICByZXR1cm4gZWxlbTtcbiAgICAgIH1cblxuICAgICAgdmFyIGZpbGVFbGVtID0gYW5ndWxhci5lbGVtZW50KCc8aW5wdXQgdHlwZT1cImZpbGVcIj4nKTtcblxuICAgICAgdmFyIGxhYmVsID0gYW5ndWxhci5lbGVtZW50KCc8bGFiZWw+dXBsb2FkPC9sYWJlbD4nKTtcbiAgICAgIGxhYmVsLmNzcygndmlzaWJpbGl0eScsICdoaWRkZW4nKS5jc3MoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJykuY3NzKCdvdmVyZmxvdycsICdoaWRkZW4nKVxuICAgICAgICAuY3NzKCd3aWR0aCcsICcwcHgnKS5jc3MoJ2hlaWdodCcsICcwcHgnKS5jc3MoJ2JvcmRlcicsICdub25lJylcbiAgICAgICAgLmNzcygnbWFyZ2luJywgJzBweCcpLmNzcygncGFkZGluZycsICcwcHgnKS5hdHRyKCd0YWJpbmRleCcsICctMScpO1xuICAgICAgYmluZEF0dHJUb0ZpbGVJbnB1dChmaWxlRWxlbSwgbGFiZWwpO1xuXG4gICAgICBnZW5lcmF0ZWRFbGVtcy5wdXNoKHtlbDogZWxlbSwgcmVmOiBsYWJlbH0pO1xuXG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxhYmVsLmFwcGVuZChmaWxlRWxlbSlbMF0pO1xuXG4gICAgICByZXR1cm4gZmlsZUVsZW07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xpY2tIYW5kbGVyKGV2dCkge1xuICAgICAgaWYgKGVsZW0uYXR0cignZGlzYWJsZWQnKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgaWYgKGF0dHJHZXR0ZXIoJ25nZlNlbGVjdERpc2FibGVkJywgc2NvcGUpKSByZXR1cm47XG5cbiAgICAgIHZhciByID0gZGV0ZWN0U3dpcGUoZXZ0KTtcbiAgICAgIC8vIHByZXZlbnQgdGhlIGNsaWNrIGlmIGl0IGlzIGEgc3dpcGVcbiAgICAgIGlmIChyICE9IG51bGwpIHJldHVybiByO1xuXG4gICAgICByZXNldE1vZGVsKGV2dCk7XG5cbiAgICAgIC8vIGZpeCBmb3IgbWQgd2hlbiB0aGUgZWxlbWVudCBpcyByZW1vdmVkIGZyb20gdGhlIERPTSBhbmQgYWRkZWQgYmFjayAjNDYwXG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIWlzSW5wdXRUeXBlRmlsZSgpICYmICFkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGZpbGVFbGVtWzBdKSkge1xuICAgICAgICAgIGdlbmVyYXRlZEVsZW1zLnB1c2goe2VsOiBlbGVtLCByZWY6IGZpbGVFbGVtLnBhcmVudCgpfSk7XG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmaWxlRWxlbS5wYXJlbnQoKVswXSk7XG4gICAgICAgICAgZmlsZUVsZW0uYmluZCgnY2hhbmdlJywgY2hhbmdlRm4pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7LyppZ25vcmUqL1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNEZWxheWVkQ2xpY2tTdXBwb3J0ZWQobmF2aWdhdG9yLnVzZXJBZ2VudCkpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZmlsZUVsZW1bMF0uY2xpY2soKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmaWxlRWxlbVswXS5jbGljaygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG5cbiAgICB2YXIgaW5pdGlhbFRvdWNoU3RhcnRZID0gMDtcbiAgICB2YXIgaW5pdGlhbFRvdWNoU3RhcnRYID0gMDtcblxuICAgIGZ1bmN0aW9uIGRldGVjdFN3aXBlKGV2dCkge1xuICAgICAgdmFyIHRvdWNoZXMgPSBldnQuY2hhbmdlZFRvdWNoZXMgfHwgKGV2dC5vcmlnaW5hbEV2ZW50ICYmIGV2dC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzKTtcbiAgICAgIGlmICh0b3VjaGVzKSB7XG4gICAgICAgIGlmIChldnQudHlwZSA9PT0gJ3RvdWNoc3RhcnQnKSB7XG4gICAgICAgICAgaW5pdGlhbFRvdWNoU3RhcnRYID0gdG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgIGluaXRpYWxUb3VjaFN0YXJ0WSA9IHRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTsgLy8gZG9uJ3QgYmxvY2sgZXZlbnQgZGVmYXVsdFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHByZXZlbnQgc2Nyb2xsIGZyb20gdHJpZ2dlcmluZyBldmVudFxuICAgICAgICAgIGlmIChldnQudHlwZSA9PT0gJ3RvdWNoZW5kJykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRYID0gdG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRZID0gdG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICAgICAgaWYgKChNYXRoLmFicyhjdXJyZW50WCAtIGluaXRpYWxUb3VjaFN0YXJ0WCkgPiAyMCkgfHxcbiAgICAgICAgICAgICAgKE1hdGguYWJzKGN1cnJlbnRZIC0gaW5pdGlhbFRvdWNoU3RhcnRZKSA+IDIwKSkge1xuICAgICAgICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGZpbGVFbGVtID0gZWxlbTtcblxuICAgIGZ1bmN0aW9uIHJlc2V0TW9kZWwoZXZ0KSB7XG4gICAgICBpZiAodXBsb2FkLnNob3VsZFVwZGF0ZU9uKCdjbGljaycsIGF0dHIsIHNjb3BlKSAmJiBmaWxlRWxlbS52YWwoKSkge1xuICAgICAgICBmaWxlRWxlbS52YWwobnVsbCk7XG4gICAgICAgIHVwbG9hZC51cGRhdGVNb2RlbChuZ01vZGVsLCBhdHRyLCBzY29wZSwgZmlsZUNoYW5nZUF0dHIoKSwgbnVsbCwgZXZ0LCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWlzSW5wdXRUeXBlRmlsZSgpKSB7XG4gICAgICBmaWxlRWxlbSA9IGNyZWF0ZUZpbGVJbnB1dCgpO1xuICAgIH1cbiAgICBmaWxlRWxlbS5iaW5kKCdjaGFuZ2UnLCBjaGFuZ2VGbik7XG5cbiAgICBpZiAoIWlzSW5wdXRUeXBlRmlsZSgpKSB7XG4gICAgICBlbGVtLmJpbmQoJ2NsaWNrIHRvdWNoc3RhcnQgdG91Y2hlbmQnLCBjbGlja0hhbmRsZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtLmJpbmQoJ2NsaWNrJywgcmVzZXRNb2RlbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaWUxMFNhbWVGaWxlU2VsZWN0Rml4KGV2dCkge1xuICAgICAgaWYgKGZpbGVFbGVtICYmICFmaWxlRWxlbS5hdHRyKCdfX25nZl9pZTEwX0ZpeF8nKSkge1xuICAgICAgICBpZiAoIWZpbGVFbGVtWzBdLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICBmaWxlRWxlbSA9IG51bGw7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGZpbGVFbGVtLnVuYmluZCgnY2xpY2snKTtcbiAgICAgICAgdmFyIGNsb25lID0gZmlsZUVsZW0uY2xvbmUoKTtcbiAgICAgICAgZmlsZUVsZW0ucmVwbGFjZVdpdGgoY2xvbmUpO1xuICAgICAgICBmaWxlRWxlbSA9IGNsb25lO1xuICAgICAgICBmaWxlRWxlbS5hdHRyKCdfX25nZl9pZTEwX0ZpeF8nLCAndHJ1ZScpO1xuICAgICAgICBmaWxlRWxlbS5iaW5kKCdjaGFuZ2UnLCBjaGFuZ2VGbik7XG4gICAgICAgIGZpbGVFbGVtLmJpbmQoJ2NsaWNrJywgaWUxMFNhbWVGaWxlU2VsZWN0Rml4KTtcbiAgICAgICAgZmlsZUVsZW1bMF0uY2xpY2soKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZmlsZUVsZW0ucmVtb3ZlQXR0cignX19uZ2ZfaWUxMF9GaXhfJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ01TSUUgMTAnKSAhPT0gLTEpIHtcbiAgICAgIGZpbGVFbGVtLmJpbmQoJ2NsaWNrJywgaWUxMFNhbWVGaWxlU2VsZWN0Rml4KTtcbiAgICB9XG5cbiAgICBpZiAobmdNb2RlbCkgbmdNb2RlbC4kZm9ybWF0dGVycy5wdXNoKGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIGlmICh2YWwgPT0gbnVsbCB8fCB2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGlmIChmaWxlRWxlbS52YWwoKSkge1xuICAgICAgICAgIGZpbGVFbGVtLnZhbChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9KTtcblxuICAgIHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoIWlzSW5wdXRUeXBlRmlsZSgpKSBmaWxlRWxlbS5wYXJlbnQoKS5yZW1vdmUoKTtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaCh1bndhdGNoZXMsIGZ1bmN0aW9uICh1bndhdGNoKSB7XG4gICAgICAgIHVud2F0Y2goKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnZW5lcmF0ZWRFbGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZyA9IGdlbmVyYXRlZEVsZW1zW2ldO1xuICAgICAgICBpZiAoIWRvY3VtZW50LmJvZHkuY29udGFpbnMoZy5lbFswXSkpIHtcbiAgICAgICAgICBnZW5lcmF0ZWRFbGVtcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgZy5yZWYucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh3aW5kb3cuRmlsZUFQSSAmJiB3aW5kb3cuRmlsZUFQSS5uZ2ZGaXhJRSkge1xuICAgICAgd2luZG93LkZpbGVBUEkubmdmRml4SUUoZWxlbSwgZmlsZUVsZW0sIGNoYW5nZUZuKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnQUVDJyxcbiAgICByZXF1aXJlOiAnP25nTW9kZWwnLFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCkge1xuICAgICAgbGlua0ZpbGVTZWxlY3Qoc2NvcGUsIGVsZW0sIGF0dHIsIG5nTW9kZWwsICRwYXJzZSwgJHRpbWVvdXQsICRjb21waWxlLCBVcGxvYWQpO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuKGZ1bmN0aW9uICgpIHtcblxuICBuZ0ZpbGVVcGxvYWQuc2VydmljZSgnVXBsb2FkRGF0YVVybCcsIFsnVXBsb2FkQmFzZScsICckdGltZW91dCcsICckcScsIGZ1bmN0aW9uIChVcGxvYWRCYXNlLCAkdGltZW91dCwgJHEpIHtcbiAgICB2YXIgdXBsb2FkID0gVXBsb2FkQmFzZTtcbiAgICB1cGxvYWQuYmFzZTY0RGF0YVVybCA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICBpZiAoYW5ndWxhci5pc0FycmF5KGZpbGUpKSB7XG4gICAgICAgIHZhciBkID0gJHEuZGVmZXIoKSwgY291bnQgPSAwO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlsZSwgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICB1cGxvYWQuZGF0YVVybChmLCB0cnVlKVsnZmluYWxseSddKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvdW50Kys7XG4gICAgICAgICAgICBpZiAoY291bnQgPT09IGZpbGUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHZhciB1cmxzID0gW107XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChmaWxlLCBmdW5jdGlvbiAoZmYpIHtcbiAgICAgICAgICAgICAgICB1cmxzLnB1c2goZmYuJG5nZkRhdGFVcmwpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgZC5yZXNvbHZlKHVybHMsIGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGQucHJvbWlzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB1cGxvYWQuZGF0YVVybChmaWxlLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHVwbG9hZC5kYXRhVXJsID0gZnVuY3Rpb24gKGZpbGUsIGRpc2FsbG93T2JqZWN0VXJsKSB7XG4gICAgICBpZiAoIWZpbGUpIHJldHVybiB1cGxvYWQuZW1wdHlQcm9taXNlKGZpbGUsIGZpbGUpO1xuICAgICAgaWYgKChkaXNhbGxvd09iamVjdFVybCAmJiBmaWxlLiRuZ2ZEYXRhVXJsICE9IG51bGwpIHx8ICghZGlzYWxsb3dPYmplY3RVcmwgJiYgZmlsZS4kbmdmQmxvYlVybCAhPSBudWxsKSkge1xuICAgICAgICByZXR1cm4gdXBsb2FkLmVtcHR5UHJvbWlzZShkaXNhbGxvd09iamVjdFVybCA/IGZpbGUuJG5nZkRhdGFVcmwgOiBmaWxlLiRuZ2ZCbG9iVXJsLCBmaWxlKTtcbiAgICAgIH1cbiAgICAgIHZhciBwID0gZGlzYWxsb3dPYmplY3RVcmwgPyBmaWxlLiQkbmdmRGF0YVVybFByb21pc2UgOiBmaWxlLiQkbmdmQmxvYlVybFByb21pc2U7XG4gICAgICBpZiAocCkgcmV0dXJuIHA7XG5cbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh3aW5kb3cuRmlsZVJlYWRlciAmJiBmaWxlICYmXG4gICAgICAgICAgKCF3aW5kb3cuRmlsZUFQSSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUgOCcpID09PSAtMSB8fCBmaWxlLnNpemUgPCAyMDAwMCkgJiZcbiAgICAgICAgICAoIXdpbmRvdy5GaWxlQVBJIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRSA5JykgPT09IC0xIHx8IGZpbGUuc2l6ZSA8IDQwMDAwMDApKSB7XG4gICAgICAgICAgLy9wcmVmZXIgVVJMLmNyZWF0ZU9iamVjdFVSTCBmb3IgaGFuZGxpbmcgcmVmcmVuY2VzIHRvIGZpbGVzIG9mIGFsbCBzaXplc1xuICAgICAgICAgIC8vc2luY2UgaXQgZG9lc27CtHQgYnVpbGQgYSBsYXJnZSBzdHJpbmcgaW4gbWVtb3J5XG4gICAgICAgICAgdmFyIFVSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTDtcbiAgICAgICAgICBpZiAoVVJMICYmIFVSTC5jcmVhdGVPYmplY3RVUkwgJiYgIWRpc2FsbG93T2JqZWN0VXJsKSB7XG4gICAgICAgICAgICB2YXIgdXJsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGZpbGUuJG5nZkJsb2JVcmwgPSAnJztcbiAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZmlsZS4kbmdmQmxvYlVybCA9IHVybDtcbiAgICAgICAgICAgICAgaWYgKHVybCkge1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUodXJsLCBmaWxlKTtcbiAgICAgICAgICAgICAgICB1cGxvYWQuYmxvYlVybHMgPSB1cGxvYWQuYmxvYlVybHMgfHwgW107XG4gICAgICAgICAgICAgICAgdXBsb2FkLmJsb2JVcmxzVG90YWxTaXplID0gdXBsb2FkLmJsb2JVcmxzVG90YWxTaXplIHx8IDA7XG4gICAgICAgICAgICAgICAgdXBsb2FkLmJsb2JVcmxzLnB1c2goe3VybDogdXJsLCBzaXplOiBmaWxlLnNpemV9KTtcbiAgICAgICAgICAgICAgICB1cGxvYWQuYmxvYlVybHNUb3RhbFNpemUgKz0gZmlsZS5zaXplIHx8IDA7XG4gICAgICAgICAgICAgICAgdmFyIG1heE1lbW9yeSA9IHVwbG9hZC5kZWZhdWx0cy5ibG9iVXJsc01heE1lbW9yeSB8fCAyNjg0MzU0NTY7XG4gICAgICAgICAgICAgICAgdmFyIG1heExlbmd0aCA9IHVwbG9hZC5kZWZhdWx0cy5ibG9iVXJsc01heFF1ZXVlU2l6ZSB8fCAyMDA7XG4gICAgICAgICAgICAgICAgd2hpbGUgKCh1cGxvYWQuYmxvYlVybHNUb3RhbFNpemUgPiBtYXhNZW1vcnkgfHwgdXBsb2FkLmJsb2JVcmxzLmxlbmd0aCA+IG1heExlbmd0aCkgJiYgdXBsb2FkLmJsb2JVcmxzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBvYmogPSB1cGxvYWQuYmxvYlVybHMuc3BsaWNlKDAsIDEpWzBdO1xuICAgICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChvYmoudXJsKTtcbiAgICAgICAgICAgICAgICAgIHVwbG9hZC5ibG9iVXJsc1RvdGFsU2l6ZSAtPSBvYmouc2l6ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBmaWxlLiRuZ2ZEYXRhVXJsID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZS50YXJnZXQucmVzdWx0LCBmaWxlKTtcbiAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICBkZWxldGUgZmlsZS4kbmdmRGF0YVVybDtcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZmlsZVJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgZmlsZS4kbmdmRGF0YVVybCA9ICcnO1xuICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmaWxlUmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGZpbGVbZGlzYWxsb3dPYmplY3RVcmwgPyAnJG5nZkRhdGFVcmwnIDogJyRuZ2ZCbG9iVXJsJ10gPSAnJztcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKGRpc2FsbG93T2JqZWN0VXJsKSB7XG4gICAgICAgIHAgPSBmaWxlLiQkbmdmRGF0YVVybFByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcCA9IGZpbGUuJCRuZ2ZCbG9iVXJsUHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9XG4gICAgICBwWydmaW5hbGx5J10oZnVuY3Rpb24gKCkge1xuICAgICAgICBkZWxldGUgZmlsZVtkaXNhbGxvd09iamVjdFVybCA/ICckJG5nZkRhdGFVcmxQcm9taXNlJyA6ICckJG5nZkJsb2JVcmxQcm9taXNlJ107XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBwO1xuICAgIH07XG4gICAgcmV0dXJuIHVwbG9hZDtcbiAgfV0pO1xuXG4gIGZ1bmN0aW9uIGdldFRhZ1R5cGUoZWwpIHtcbiAgICBpZiAoZWwudGFnTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnaW1nJykgcmV0dXJuICdpbWFnZSc7XG4gICAgaWYgKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2F1ZGlvJykgcmV0dXJuICdhdWRpbyc7XG4gICAgaWYgKGVsLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3ZpZGVvJykgcmV0dXJuICd2aWRlbyc7XG4gICAgcmV0dXJuIC8uLztcbiAgfVxuXG4gIGZ1bmN0aW9uIGxpbmtGaWxlRGlyZWN0aXZlKFVwbG9hZCwgJHRpbWVvdXQsIHNjb3BlLCBlbGVtLCBhdHRyLCBkaXJlY3RpdmVOYW1lLCByZXNpemVQYXJhbXMsIGlzQmFja2dyb3VuZCkge1xuICAgIGZ1bmN0aW9uIGNvbnN0cnVjdERhdGFVcmwoZmlsZSkge1xuICAgICAgdmFyIGRpc2FsbG93T2JqZWN0VXJsID0gVXBsb2FkLmF0dHJHZXR0ZXIoJ25nZk5vT2JqZWN0VXJsJywgYXR0ciwgc2NvcGUpO1xuICAgICAgVXBsb2FkLmRhdGFVcmwoZmlsZSwgZGlzYWxsb3dPYmplY3RVcmwpWydmaW5hbGx5J10oZnVuY3Rpb24gKCkge1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHNyYyA9IChkaXNhbGxvd09iamVjdFVybCA/IGZpbGUuJG5nZkRhdGFVcmwgOiBmaWxlLiRuZ2ZCbG9iVXJsKSB8fCBmaWxlLiRuZ2ZEYXRhVXJsO1xuICAgICAgICAgIGlmIChpc0JhY2tncm91bmQpIHtcbiAgICAgICAgICAgIGVsZW0uY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybChcXCcnICsgKHNyYyB8fCAnJykgKyAnXFwnKScpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtLmF0dHIoJ3NyYycsIHNyYyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgICAgIGVsZW0ucmVtb3ZlQ2xhc3MoJ25nLWhpZGUnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbS5hZGRDbGFzcygnbmctaGlkZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdW53YXRjaCA9IHNjb3BlLiR3YXRjaChhdHRyW2RpcmVjdGl2ZU5hbWVdLCBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICB2YXIgc2l6ZSA9IHJlc2l6ZVBhcmFtcztcbiAgICAgICAgaWYgKGRpcmVjdGl2ZU5hbWUgPT09ICduZ2ZUaHVtYm5haWwnKSB7XG4gICAgICAgICAgaWYgKCFzaXplKSB7XG4gICAgICAgICAgICBzaXplID0ge3dpZHRoOiBlbGVtWzBdLm5hdHVyYWxXaWR0aCB8fCBlbGVtWzBdLmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgICBoZWlnaHQ6IGVsZW1bMF0ubmF0dXJhbEhlaWdodCB8fCBlbGVtWzBdLmNsaWVudEhlaWdodH07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzaXplLndpZHRoID09PSAwICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKSB7XG4gICAgICAgICAgICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsZW1bMF0pO1xuICAgICAgICAgICAgc2l6ZSA9IHtcbiAgICAgICAgICAgICAgd2lkdGg6IHBhcnNlSW50KHN0eWxlLndpZHRoLnNsaWNlKDAsIC0yKSksXG4gICAgICAgICAgICAgIGhlaWdodDogcGFyc2VJbnQoc3R5bGUuaGVpZ2h0LnNsaWNlKDAsIC0yKSlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZmlsZSkpIHtcbiAgICAgICAgICBlbGVtLnJlbW92ZUNsYXNzKCduZy1oaWRlJyk7XG4gICAgICAgICAgaWYgKGlzQmFja2dyb3VuZCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW0uY3NzKCdiYWNrZ3JvdW5kLWltYWdlJywgJ3VybChcXCcnICsgZmlsZSArICdcXCcpJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmF0dHIoJ3NyYycsIGZpbGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZmlsZSAmJiBmaWxlLnR5cGUgJiYgZmlsZS50eXBlLnNlYXJjaChnZXRUYWdUeXBlKGVsZW1bMF0pKSA9PT0gMCAmJlxuICAgICAgICAgICghaXNCYWNrZ3JvdW5kIHx8IGZpbGUudHlwZS5pbmRleE9mKCdpbWFnZScpID09PSAwKSkge1xuICAgICAgICAgIGlmIChzaXplICYmIFVwbG9hZC5pc1Jlc2l6ZVN1cHBvcnRlZCgpKSB7XG4gICAgICAgICAgICBzaXplLnJlc2l6ZUlmID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZSZXNpemVJZicsIGF0dHIsIHNjb3BlLFxuICAgICAgICAgICAgICAgIHskd2lkdGg6IHdpZHRoLCAkaGVpZ2h0OiBoZWlnaHQsICRmaWxlOiBmaWxlfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgVXBsb2FkLnJlc2l6ZShmaWxlLCBzaXplKS50aGVuKFxuICAgICAgICAgICAgICBmdW5jdGlvbiAoZikge1xuICAgICAgICAgICAgICAgIGNvbnN0cnVjdERhdGFVcmwoZik7XG4gICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3RydWN0RGF0YVVybChmaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbS5hZGRDbGFzcygnbmctaGlkZScpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdW53YXRjaCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuXG4gIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmU3JjICovXG4gIC8qKiBAbmFtZXNwYWNlIGF0dHIubmdmTm9PYmplY3RVcmwgKi9cbiAgbmdGaWxlVXBsb2FkLmRpcmVjdGl2ZSgnbmdmU3JjJywgWydVcGxvYWQnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoVXBsb2FkLCAkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICBsaW5rRmlsZURpcmVjdGl2ZShVcGxvYWQsICR0aW1lb3V0LCBzY29wZSwgZWxlbSwgYXR0ciwgJ25nZlNyYycsXG4gICAgICAgICAgVXBsb2FkLmF0dHJHZXR0ZXIoJ25nZlJlc2l6ZScsIGF0dHIsIHNjb3BlKSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG4gIH1dKTtcblxuICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZkJhY2tncm91bmQgKi9cbiAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZOb09iamVjdFVybCAqL1xuICBuZ0ZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ2ZCYWNrZ3JvdW5kJywgWydVcGxvYWQnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoVXBsb2FkLCAkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICBsaW5rRmlsZURpcmVjdGl2ZShVcGxvYWQsICR0aW1lb3V0LCBzY29wZSwgZWxlbSwgYXR0ciwgJ25nZkJhY2tncm91bmQnLFxuICAgICAgICAgIFVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZSZXNpemUnLCBhdHRyLCBzY29wZSksIHRydWUpO1xuICAgICAgfVxuICAgIH07XG4gIH1dKTtcblxuICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZlRodW1ibmFpbCAqL1xuICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZkFzQmFja2dyb3VuZCAqL1xuICAvKiogQG5hbWVzcGFjZSBhdHRyLm5nZlNpemUgKi9cbiAgLyoqIEBuYW1lc3BhY2UgYXR0ci5uZ2ZOb09iamVjdFVybCAqL1xuICBuZ0ZpbGVVcGxvYWQuZGlyZWN0aXZlKCduZ2ZUaHVtYm5haWwnLCBbJ1VwbG9hZCcsICckdGltZW91dCcsIGZ1bmN0aW9uIChVcGxvYWQsICR0aW1lb3V0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtLCBhdHRyKSB7XG4gICAgICAgIHZhciBzaXplID0gVXBsb2FkLmF0dHJHZXR0ZXIoJ25nZlNpemUnLCBhdHRyLCBzY29wZSk7XG4gICAgICAgIGxpbmtGaWxlRGlyZWN0aXZlKFVwbG9hZCwgJHRpbWVvdXQsIHNjb3BlLCBlbGVtLCBhdHRyLCAnbmdmVGh1bWJuYWlsJywgc2l6ZSxcbiAgICAgICAgICBVcGxvYWQuYXR0ckdldHRlcignbmdmQXNCYWNrZ3JvdW5kJywgYXR0ciwgc2NvcGUpKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XSk7XG5cbiAgbmdGaWxlVXBsb2FkLmNvbmZpZyhbJyRjb21waWxlUHJvdmlkZXInLCBmdW5jdGlvbiAoJGNvbXBpbGVQcm92aWRlcikge1xuICAgIGlmICgkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCkgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfHRlbHx3ZWJjYWx8bG9jYWx8ZmlsZXxkYXRhfGJsb2IpOi8pO1xuICAgIGlmICgkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KSAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3x0ZWx8d2ViY2FsfGxvY2FsfGZpbGV8ZGF0YXxibG9iKTovKTtcbiAgfV0pO1xuXG4gIG5nRmlsZVVwbG9hZC5maWx0ZXIoJ25nZkRhdGFVcmwnLCBbJ1VwbG9hZERhdGFVcmwnLCAnJHNjZScsIGZ1bmN0aW9uIChVcGxvYWREYXRhVXJsLCAkc2NlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChmaWxlLCBkaXNhbGxvd09iamVjdFVybCwgdHJ1c3RlZFVybCkge1xuICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZmlsZSkpIHtcbiAgICAgICAgcmV0dXJuICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGZpbGUpO1xuICAgICAgfVxuICAgICAgdmFyIHNyYyA9IGZpbGUgJiYgKChkaXNhbGxvd09iamVjdFVybCA/IGZpbGUuJG5nZkRhdGFVcmwgOiBmaWxlLiRuZ2ZCbG9iVXJsKSB8fCBmaWxlLiRuZ2ZEYXRhVXJsKTtcbiAgICAgIGlmIChmaWxlICYmICFzcmMpIHtcbiAgICAgICAgaWYgKCFmaWxlLiRuZ2ZEYXRhVXJsRmlsdGVySW5Qcm9ncmVzcyAmJiBhbmd1bGFyLmlzT2JqZWN0KGZpbGUpKSB7XG4gICAgICAgICAgZmlsZS4kbmdmRGF0YVVybEZpbHRlckluUHJvZ3Jlc3MgPSB0cnVlO1xuICAgICAgICAgIFVwbG9hZERhdGFVcmwuZGF0YVVybChmaWxlLCBkaXNhbGxvd09iamVjdFVybCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuICAgICAgaWYgKGZpbGUpIGRlbGV0ZSBmaWxlLiRuZ2ZEYXRhVXJsRmlsdGVySW5Qcm9ncmVzcztcbiAgICAgIHJldHVybiAoZmlsZSAmJiBzcmMgPyAodHJ1c3RlZFVybCA/ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKHNyYykgOiBzcmMpIDogZmlsZSkgfHwgJyc7XG4gICAgfTtcbiAgfV0pO1xuXG59KSgpO1xuXG5uZ0ZpbGVVcGxvYWQuc2VydmljZSgnVXBsb2FkVmFsaWRhdGUnLCBbJ1VwbG9hZERhdGFVcmwnLCAnJHEnLCAnJHRpbWVvdXQnLCBmdW5jdGlvbiAoVXBsb2FkRGF0YVVybCwgJHEsICR0aW1lb3V0KSB7XG4gIHZhciB1cGxvYWQgPSBVcGxvYWREYXRhVXJsO1xuXG4gIGZ1bmN0aW9uIGdsb2JTdHJpbmdUb1JlZ2V4KHN0cikge1xuICAgIHZhciByZWdleHAgPSAnJywgZXhjbHVkZXMgPSBbXTtcbiAgICBpZiAoc3RyLmxlbmd0aCA+IDIgJiYgc3RyWzBdID09PSAnLycgJiYgc3RyW3N0ci5sZW5ndGggLSAxXSA9PT0gJy8nKSB7XG4gICAgICByZWdleHAgPSBzdHIuc3Vic3RyaW5nKDEsIHN0ci5sZW5ndGggLSAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHNwbGl0ID0gc3RyLnNwbGl0KCcsJyk7XG4gICAgICBpZiAoc3BsaXQubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwbGl0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHIgPSBnbG9iU3RyaW5nVG9SZWdleChzcGxpdFtpXSk7XG4gICAgICAgICAgaWYgKHIucmVnZXhwKSB7XG4gICAgICAgICAgICByZWdleHAgKz0gJygnICsgci5yZWdleHAgKyAnKSc7XG4gICAgICAgICAgICBpZiAoaSA8IHNwbGl0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgcmVnZXhwICs9ICd8JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXhjbHVkZXMgPSBleGNsdWRlcy5jb25jYXQoci5leGNsdWRlcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc3RyLmluZGV4T2YoJyEnKSA9PT0gMCkge1xuICAgICAgICAgIGV4Y2x1ZGVzLnB1c2goJ14oKD8hJyArIGdsb2JTdHJpbmdUb1JlZ2V4KHN0ci5zdWJzdHJpbmcoMSkpLnJlZ2V4cCArICcpLikqJCcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzdHIuaW5kZXhPZignLicpID09PSAwKSB7XG4gICAgICAgICAgICBzdHIgPSAnKicgKyBzdHI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlZ2V4cCA9ICdeJyArIHN0ci5yZXBsYWNlKG5ldyBSZWdFeHAoJ1suXFxcXFxcXFwrKj9cXFxcW1xcXFxeXFxcXF0kKCl7fT0hPD58OlxcXFwtXScsICdnJyksICdcXFxcJCYnKSArICckJztcbiAgICAgICAgICByZWdleHAgPSByZWdleHAucmVwbGFjZSgvXFxcXFxcKi9nLCAnLionKS5yZXBsYWNlKC9cXFxcXFw/L2csICcuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtyZWdleHA6IHJlZ2V4cCwgZXhjbHVkZXM6IGV4Y2x1ZGVzfTtcbiAgfVxuXG4gIHVwbG9hZC52YWxpZGF0ZVBhdHRlcm4gPSBmdW5jdGlvbiAoZmlsZSwgdmFsKSB7XG4gICAgaWYgKCF2YWwpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgcGF0dGVybiA9IGdsb2JTdHJpbmdUb1JlZ2V4KHZhbCksIHZhbGlkID0gdHJ1ZTtcbiAgICBpZiAocGF0dGVybi5yZWdleHAgJiYgcGF0dGVybi5yZWdleHAubGVuZ3RoKSB7XG4gICAgICB2YXIgcmVnZXhwID0gbmV3IFJlZ0V4cChwYXR0ZXJuLnJlZ2V4cCwgJ2knKTtcbiAgICAgIHZhbGlkID0gKGZpbGUudHlwZSAhPSBudWxsICYmIHJlZ2V4cC50ZXN0KGZpbGUudHlwZSkpIHx8XG4gICAgICAgIChmaWxlLm5hbWUgIT0gbnVsbCAmJiByZWdleHAudGVzdChmaWxlLm5hbWUpKTtcbiAgICB9XG4gICAgdmFyIGxlbiA9IHBhdHRlcm4uZXhjbHVkZXMubGVuZ3RoO1xuICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgdmFyIGV4Y2x1ZGUgPSBuZXcgUmVnRXhwKHBhdHRlcm4uZXhjbHVkZXNbbGVuXSwgJ2knKTtcbiAgICAgIHZhbGlkID0gdmFsaWQgJiYgKGZpbGUudHlwZSA9PSBudWxsIHx8IGV4Y2x1ZGUudGVzdChmaWxlLnR5cGUpKSAmJlxuICAgICAgICAoZmlsZS5uYW1lID09IG51bGwgfHwgZXhjbHVkZS50ZXN0KGZpbGUubmFtZSkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH07XG5cbiAgdXBsb2FkLnJhdGlvVG9GbG9hdCA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICB2YXIgciA9IHZhbC50b1N0cmluZygpLCB4SW5kZXggPSByLnNlYXJjaCgvW3g6XS9pKTtcbiAgICBpZiAoeEluZGV4ID4gLTEpIHtcbiAgICAgIHIgPSBwYXJzZUZsb2F0KHIuc3Vic3RyaW5nKDAsIHhJbmRleCkpIC8gcGFyc2VGbG9hdChyLnN1YnN0cmluZyh4SW5kZXggKyAxKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHIgPSBwYXJzZUZsb2F0KHIpO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfTtcblxuICB1cGxvYWQucmVnaXN0ZXJNb2RlbENoYW5nZVZhbGlkYXRvciA9IGZ1bmN0aW9uIChuZ01vZGVsLCBhdHRyLCBzY29wZSkge1xuICAgIGlmIChuZ01vZGVsKSB7XG4gICAgICBuZ01vZGVsLiRmb3JtYXR0ZXJzLnB1c2goZnVuY3Rpb24gKGZpbGVzKSB7XG4gICAgICAgIGlmIChuZ01vZGVsLiRkaXJ0eSkge1xuICAgICAgICAgIHZhciBmaWxlc0FycmF5ID0gZmlsZXM7XG4gICAgICAgICAgaWYgKGZpbGVzICYmICFhbmd1bGFyLmlzQXJyYXkoZmlsZXMpKSB7XG4gICAgICAgICAgICBmaWxlc0FycmF5ID0gW2ZpbGVzXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdXBsb2FkLnZhbGlkYXRlKGZpbGVzQXJyYXksIDAsIG5nTW9kZWwsIGF0dHIsIHNjb3BlKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHVwbG9hZC5hcHBseU1vZGVsVmFsaWRhdGlvbihuZ01vZGVsLCBmaWxlc0FycmF5KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZXM7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gbWFya01vZGVsQXNEaXJ0eShuZ01vZGVsLCBmaWxlcykge1xuICAgIGlmIChmaWxlcyAhPSBudWxsICYmICFuZ01vZGVsLiRkaXJ0eSkge1xuICAgICAgaWYgKG5nTW9kZWwuJHNldERpcnR5KSB7XG4gICAgICAgIG5nTW9kZWwuJHNldERpcnR5KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZ01vZGVsLiRkaXJ0eSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBsb2FkLmFwcGx5TW9kZWxWYWxpZGF0aW9uID0gZnVuY3Rpb24gKG5nTW9kZWwsIGZpbGVzKSB7XG4gICAgbWFya01vZGVsQXNEaXJ0eShuZ01vZGVsLCBmaWxlcyk7XG4gICAgYW5ndWxhci5mb3JFYWNoKG5nTW9kZWwuJG5nZlZhbGlkYXRpb25zLCBmdW5jdGlvbiAodmFsaWRhdGlvbikge1xuICAgICAgbmdNb2RlbC4kc2V0VmFsaWRpdHkodmFsaWRhdGlvbi5uYW1lLCB2YWxpZGF0aW9uLnZhbGlkKTtcbiAgICB9KTtcbiAgfTtcblxuICB1cGxvYWQuZ2V0VmFsaWRhdGlvbkF0dHIgPSBmdW5jdGlvbiAoYXR0ciwgc2NvcGUsIG5hbWUsIHZhbGlkYXRpb25OYW1lLCBmaWxlKSB7XG4gICAgdmFyIGROYW1lID0gJ25nZicgKyBuYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cigxKTtcbiAgICB2YXIgdmFsID0gdXBsb2FkLmF0dHJHZXR0ZXIoZE5hbWUsIGF0dHIsIHNjb3BlLCB7JGZpbGU6IGZpbGV9KTtcbiAgICBpZiAodmFsID09IG51bGwpIHtcbiAgICAgIHZhbCA9IHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZWYWxpZGF0ZScsIGF0dHIsIHNjb3BlLCB7JGZpbGU6IGZpbGV9KTtcbiAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gKHZhbGlkYXRpb25OYW1lIHx8IG5hbWUpLnNwbGl0KCcuJyk7XG4gICAgICAgIHZhbCA9IHZhbFtzcGxpdFswXV07XG4gICAgICAgIGlmIChzcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgdmFsID0gdmFsICYmIHZhbFtzcGxpdFsxXV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbiAgfTtcblxuICB1cGxvYWQudmFsaWRhdGUgPSBmdW5jdGlvbiAoZmlsZXMsIHByZXZMZW5ndGgsIG5nTW9kZWwsIGF0dHIsIHNjb3BlKSB7XG4gICAgbmdNb2RlbCA9IG5nTW9kZWwgfHwge307XG4gICAgbmdNb2RlbC4kbmdmVmFsaWRhdGlvbnMgPSBuZ01vZGVsLiRuZ2ZWYWxpZGF0aW9ucyB8fCBbXTtcblxuICAgIGFuZ3VsYXIuZm9yRWFjaChuZ01vZGVsLiRuZ2ZWYWxpZGF0aW9ucywgZnVuY3Rpb24gKHYpIHtcbiAgICAgIHYudmFsaWQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgdmFyIGF0dHJHZXR0ZXIgPSBmdW5jdGlvbiAobmFtZSwgcGFyYW1zKSB7XG4gICAgICByZXR1cm4gdXBsb2FkLmF0dHJHZXR0ZXIobmFtZSwgYXR0ciwgc2NvcGUsIHBhcmFtcyk7XG4gICAgfTtcblxuICAgIHZhciBpZ25vcmVkRXJyb3JzID0gKHVwbG9hZC5hdHRyR2V0dGVyKCduZ2ZJZ25vcmVJbnZhbGlkJywgYXR0ciwgc2NvcGUpIHx8ICcnKS5zcGxpdCgnICcpO1xuICAgIHZhciBydW5BbGxWYWxpZGF0aW9uID0gdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZlJ1bkFsbFZhbGlkYXRpb25zJywgYXR0ciwgc2NvcGUpO1xuXG4gICAgaWYgKGZpbGVzID09IG51bGwgfHwgZmlsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdXBsb2FkLmVtcHR5UHJvbWlzZSh7J3ZhbGlkRmlsZXMnOiBmaWxlcywgJ2ludmFsaWRGaWxlcyc6IFtdfSk7XG4gICAgfVxuXG4gICAgZmlsZXMgPSBmaWxlcy5sZW5ndGggPT09IHVuZGVmaW5lZCA/IFtmaWxlc10gOiBmaWxlcy5zbGljZSgwKTtcbiAgICB2YXIgaW52YWxpZEZpbGVzID0gW107XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZVN5bmMobmFtZSwgdmFsaWRhdGlvbk5hbWUsIGZuKSB7XG4gICAgICBpZiAoZmlsZXMpIHtcbiAgICAgICAgdmFyIGkgPSBmaWxlcy5sZW5ndGgsIHZhbGlkID0gbnVsbDtcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgIHZhciBmaWxlID0gZmlsZXNbaV07XG4gICAgICAgICAgaWYgKGZpbGUpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSB1cGxvYWQuZ2V0VmFsaWRhdGlvbkF0dHIoYXR0ciwgc2NvcGUsIG5hbWUsIHZhbGlkYXRpb25OYW1lLCBmaWxlKTtcbiAgICAgICAgICAgIGlmICh2YWwgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBpZiAoIWZuKGZpbGUsIHZhbCwgaSkpIHtcbiAgICAgICAgICAgICAgICBpZiAoaWdub3JlZEVycm9ycy5pbmRleE9mKG5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgZmlsZS4kZXJyb3IgPSBuYW1lO1xuICAgICAgICAgICAgICAgICAgKGZpbGUuJGVycm9yTWVzc2FnZXMgPSAoZmlsZS4kZXJyb3JNZXNzYWdlcyB8fCB7fSkpW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgIGZpbGUuJGVycm9yUGFyYW0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICBpZiAoaW52YWxpZEZpbGVzLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGludmFsaWRGaWxlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKCFydW5BbGxWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGZpbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbGlkICE9PSBudWxsKSB7XG4gICAgICAgICAgbmdNb2RlbC4kbmdmVmFsaWRhdGlvbnMucHVzaCh7bmFtZTogbmFtZSwgdmFsaWQ6IHZhbGlkfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxpZGF0ZVN5bmMoJ3BhdHRlcm4nLCBudWxsLCB1cGxvYWQudmFsaWRhdGVQYXR0ZXJuKTtcbiAgICB2YWxpZGF0ZVN5bmMoJ21pblNpemUnLCAnc2l6ZS5taW4nLCBmdW5jdGlvbiAoZmlsZSwgdmFsKSB7XG4gICAgICByZXR1cm4gZmlsZS5zaXplICsgMC4xID49IHVwbG9hZC50cmFuc2xhdGVTY2FsYXJzKHZhbCk7XG4gICAgfSk7XG4gICAgdmFsaWRhdGVTeW5jKCdtYXhTaXplJywgJ3NpemUubWF4JywgZnVuY3Rpb24gKGZpbGUsIHZhbCkge1xuICAgICAgcmV0dXJuIGZpbGUuc2l6ZSAtIDAuMSA8PSB1cGxvYWQudHJhbnNsYXRlU2NhbGFycyh2YWwpO1xuICAgIH0pO1xuICAgIHZhciB0b3RhbFNpemUgPSAwO1xuICAgIHZhbGlkYXRlU3luYygnbWF4VG90YWxTaXplJywgbnVsbCwgZnVuY3Rpb24gKGZpbGUsIHZhbCkge1xuICAgICAgdG90YWxTaXplICs9IGZpbGUuc2l6ZTtcbiAgICAgIGlmICh0b3RhbFNpemUgPiB1cGxvYWQudHJhbnNsYXRlU2NhbGFycyh2YWwpKSB7XG4gICAgICAgIGZpbGVzLnNwbGljZSgwLCBmaWxlcy5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcblxuICAgIHZhbGlkYXRlU3luYygndmFsaWRhdGVGbicsIG51bGwsIGZ1bmN0aW9uIChmaWxlLCByKSB7XG4gICAgICByZXR1cm4gciA9PT0gdHJ1ZSB8fCByID09PSBudWxsIHx8IHIgPT09ICcnO1xuICAgIH0pO1xuXG4gICAgaWYgKCFmaWxlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiB1cGxvYWQuZW1wdHlQcm9taXNlKHsndmFsaWRGaWxlcyc6IFtdLCAnaW52YWxpZEZpbGVzJzogaW52YWxpZEZpbGVzfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVBc3luYyhuYW1lLCB2YWxpZGF0aW9uTmFtZSwgdHlwZSwgYXN5bmNGbiwgZm4pIHtcbiAgICAgIGZ1bmN0aW9uIHJlc29sdmVSZXN1bHQoZGVmZXIsIGZpbGUsIHZhbCkge1xuICAgICAgICBmdW5jdGlvbiByZXNvbHZlSW50ZXJuYWwoZm4pIHtcbiAgICAgICAgICBpZiAoZm4oKSkge1xuICAgICAgICAgICAgaWYgKGlnbm9yZWRFcnJvcnMuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgZmlsZS4kZXJyb3IgPSBuYW1lO1xuICAgICAgICAgICAgICAoZmlsZS4kZXJyb3JNZXNzYWdlcyA9IChmaWxlLiRlcnJvck1lc3NhZ2VzIHx8IHt9KSlbbmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICBmaWxlLiRlcnJvclBhcmFtID0gdmFsO1xuICAgICAgICAgICAgICBpZiAoaW52YWxpZEZpbGVzLmluZGV4T2YoZmlsZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgaW52YWxpZEZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKCFydW5BbGxWYWxpZGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSBmaWxlcy5pbmRleE9mKGZpbGUpO1xuICAgICAgICAgICAgICAgIGlmIChpID4gLTEpIGZpbGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHZhciBqID0gZmlsZXMuaW5kZXhPZihmaWxlKTtcbiAgICAgICAgICAgICAgaWYgKGogPiAtMSkgZmlsZXMuc3BsaWNlKGosIDEpO1xuICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZlci5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YWwgIT0gbnVsbCkge1xuICAgICAgICAgIGFzeW5jRm4oZmlsZSwgdmFsKS50aGVuKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICByZXNvbHZlSW50ZXJuYWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXR1cm4gIWZuKGQsIHZhbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXNvbHZlSW50ZXJuYWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYXR0ckdldHRlcignbmdmVmFsaWRhdGVGb3JjZScsIHskZmlsZTogZmlsZX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGVmZXIucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZXMgPSBbdXBsb2FkLmVtcHR5UHJvbWlzZSh0cnVlKV07XG4gICAgICBpZiAoZmlsZXMpIHtcbiAgICAgICAgZmlsZXMgPSBmaWxlcy5sZW5ndGggPT09IHVuZGVmaW5lZCA/IFtmaWxlc10gOiBmaWxlcztcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGZpbGVzLCBmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChkZWZlci5wcm9taXNlKTtcbiAgICAgICAgICBpZiAodHlwZSAmJiAoZmlsZS50eXBlID09IG51bGwgfHwgZmlsZS50eXBlLnNlYXJjaCh0eXBlKSAhPT0gMCkpIHtcbiAgICAgICAgICAgIGRlZmVyLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChuYW1lID09PSAnZGltZW5zaW9ucycgJiYgdXBsb2FkLmF0dHJHZXR0ZXIoJ25nZkRpbWVuc2lvbnMnLCBhdHRyKSAhPSBudWxsKSB7XG4gICAgICAgICAgICB1cGxvYWQuaW1hZ2VEaW1lbnNpb25zKGZpbGUpLnRoZW4oZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgcmVzb2x2ZVJlc3VsdChkZWZlciwgZmlsZSxcbiAgICAgICAgICAgICAgICBhdHRyR2V0dGVyKCduZ2ZEaW1lbnNpb25zJywgeyRmaWxlOiBmaWxlLCAkd2lkdGg6IGQud2lkdGgsICRoZWlnaHQ6IGQuaGVpZ2h0fSkpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSBpZiAobmFtZSA9PT0gJ2R1cmF0aW9uJyAmJiB1cGxvYWQuYXR0ckdldHRlcignbmdmRHVyYXRpb24nLCBhdHRyKSAhPSBudWxsKSB7XG4gICAgICAgICAgICB1cGxvYWQubWVkaWFEdXJhdGlvbihmaWxlKS50aGVuKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgIHJlc29sdmVSZXN1bHQoZGVmZXIsIGZpbGUsXG4gICAgICAgICAgICAgICAgYXR0ckdldHRlcignbmdmRHVyYXRpb24nLCB7JGZpbGU6IGZpbGUsICRkdXJhdGlvbjogZH0pKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZGVmZXIucmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZVJlc3VsdChkZWZlciwgZmlsZSxcbiAgICAgICAgICAgICAgdXBsb2FkLmdldFZhbGlkYXRpb25BdHRyKGF0dHIsIHNjb3BlLCBuYW1lLCB2YWxpZGF0aW9uTmFtZSwgZmlsZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICB2YXIgZGVmZmVyID0gJHEuZGVmZXIoKTtcbiAgICAgICRxLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoIXZhbHVlc1tpXSkge1xuICAgICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5nTW9kZWwuJG5nZlZhbGlkYXRpb25zLnB1c2goe25hbWU6IG5hbWUsIHZhbGlkOiBpc1ZhbGlkfSk7XG4gICAgICAgIGRlZmZlci5yZXNvbHZlKGlzVmFsaWQpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gZGVmZmVyLnByb21pc2U7XG4gICAgfVxuXG4gICAgdmFyIGRlZmZlciA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHByb21pc2VzID0gW107XG5cbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ21heEhlaWdodCcsICdoZWlnaHQubWF4JywgL2ltYWdlLyxcbiAgICAgIHRoaXMuaW1hZ2VEaW1lbnNpb25zLCBmdW5jdGlvbiAoZCwgdmFsKSB7XG4gICAgICAgIHJldHVybiBkLmhlaWdodCA8PSB2YWw7XG4gICAgICB9KSk7XG4gICAgcHJvbWlzZXMucHVzaCh2YWxpZGF0ZUFzeW5jKCdtaW5IZWlnaHQnLCAnaGVpZ2h0Lm1pbicsIC9pbWFnZS8sXG4gICAgICB0aGlzLmltYWdlRGltZW5zaW9ucywgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gZC5oZWlnaHQgPj0gdmFsO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygnbWF4V2lkdGgnLCAnd2lkdGgubWF4JywgL2ltYWdlLyxcbiAgICAgIHRoaXMuaW1hZ2VEaW1lbnNpb25zLCBmdW5jdGlvbiAoZCwgdmFsKSB7XG4gICAgICAgIHJldHVybiBkLndpZHRoIDw9IHZhbDtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ21pbldpZHRoJywgJ3dpZHRoLm1pbicsIC9pbWFnZS8sXG4gICAgICB0aGlzLmltYWdlRGltZW5zaW9ucywgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gZC53aWR0aCA+PSB2YWw7XG4gICAgICB9KSk7XG4gICAgcHJvbWlzZXMucHVzaCh2YWxpZGF0ZUFzeW5jKCdkaW1lbnNpb25zJywgbnVsbCwgL2ltYWdlLyxcbiAgICAgIGZ1bmN0aW9uIChmaWxlLCB2YWwpIHtcbiAgICAgICAgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2UodmFsKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyKSB7XG4gICAgICAgIHJldHVybiByO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygncmF0aW8nLCBudWxsLCAvaW1hZ2UvLFxuICAgICAgdGhpcy5pbWFnZURpbWVuc2lvbnMsIGZ1bmN0aW9uIChkLCB2YWwpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gdmFsLnRvU3RyaW5nKCkuc3BsaXQoJywnKSwgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGxpdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChNYXRoLmFicygoZC53aWR0aCAvIGQuaGVpZ2h0KSAtIHVwbG9hZC5yYXRpb1RvRmxvYXQoc3BsaXRbaV0pKSA8IDAuMDEpIHtcbiAgICAgICAgICAgIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygnbWF4UmF0aW8nLCAncmF0aW8ubWF4JywgL2ltYWdlLyxcbiAgICAgIHRoaXMuaW1hZ2VEaW1lbnNpb25zLCBmdW5jdGlvbiAoZCwgdmFsKSB7XG4gICAgICAgIHJldHVybiAoZC53aWR0aCAvIGQuaGVpZ2h0KSAtIHVwbG9hZC5yYXRpb1RvRmxvYXQodmFsKSA8IDAuMDAwMTtcbiAgICAgIH0pKTtcbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ21pblJhdGlvJywgJ3JhdGlvLm1pbicsIC9pbWFnZS8sXG4gICAgICB0aGlzLmltYWdlRGltZW5zaW9ucywgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gKGQud2lkdGggLyBkLmhlaWdodCkgLSB1cGxvYWQucmF0aW9Ub0Zsb2F0KHZhbCkgPiAtMC4wMDAxO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygnbWF4RHVyYXRpb24nLCAnZHVyYXRpb24ubWF4JywgL2F1ZGlvfHZpZGVvLyxcbiAgICAgIHRoaXMubWVkaWFEdXJhdGlvbiwgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gZCA8PSB1cGxvYWQudHJhbnNsYXRlU2NhbGFycyh2YWwpO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygnbWluRHVyYXRpb24nLCAnZHVyYXRpb24ubWluJywgL2F1ZGlvfHZpZGVvLyxcbiAgICAgIHRoaXMubWVkaWFEdXJhdGlvbiwgZnVuY3Rpb24gKGQsIHZhbCkge1xuICAgICAgICByZXR1cm4gZCA+PSB1cGxvYWQudHJhbnNsYXRlU2NhbGFycyh2YWwpO1xuICAgICAgfSkpO1xuICAgIHByb21pc2VzLnB1c2godmFsaWRhdGVBc3luYygnZHVyYXRpb24nLCBudWxsLCAvYXVkaW98dmlkZW8vLFxuICAgICAgZnVuY3Rpb24gKGZpbGUsIHZhbCkge1xuICAgICAgICByZXR1cm4gdXBsb2FkLmVtcHR5UHJvbWlzZSh2YWwpO1xuICAgICAgfSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgcmV0dXJuIHI7XG4gICAgICB9KSk7XG5cbiAgICBwcm9taXNlcy5wdXNoKHZhbGlkYXRlQXN5bmMoJ3ZhbGlkYXRlQXN5bmNGbicsIG51bGwsIG51bGwsXG4gICAgICBmdW5jdGlvbiAoZmlsZSwgdmFsKSB7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgICB9LCBmdW5jdGlvbiAocikge1xuICAgICAgICByZXR1cm4gciA9PT0gdHJ1ZSB8fCByID09PSBudWxsIHx8IHIgPT09ICcnO1xuICAgICAgfSkpO1xuXG4gICAgJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKHJ1bkFsbFZhbGlkYXRpb24pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBmaWxlID0gZmlsZXNbaV07XG4gICAgICAgICAgaWYgKGZpbGUuJGVycm9yKSB7XG4gICAgICAgICAgICBmaWxlcy5zcGxpY2UoaS0tLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcnVuQWxsVmFsaWRhdGlvbiA9IGZhbHNlO1xuICAgICAgdmFsaWRhdGVTeW5jKCdtYXhGaWxlcycsIG51bGwsIGZ1bmN0aW9uIChmaWxlLCB2YWwsIGkpIHtcbiAgICAgICAgcmV0dXJuIHByZXZMZW5ndGggKyBpIDwgdmFsO1xuICAgICAgfSk7XG5cbiAgICAgIGRlZmZlci5yZXNvbHZlKHsndmFsaWRGaWxlcyc6IGZpbGVzLCAnaW52YWxpZEZpbGVzJzogaW52YWxpZEZpbGVzfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmZlci5wcm9taXNlO1xuICB9O1xuXG4gIHVwbG9hZC5pbWFnZURpbWVuc2lvbnMgPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgIGlmIChmaWxlLiRuZ2ZXaWR0aCAmJiBmaWxlLiRuZ2ZIZWlnaHQpIHtcbiAgICAgIHZhciBkID0gJHEuZGVmZXIoKTtcbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZC5yZXNvbHZlKHt3aWR0aDogZmlsZS4kbmdmV2lkdGgsIGhlaWdodDogZmlsZS4kbmdmSGVpZ2h0fSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBkLnByb21pc2U7XG4gICAgfVxuICAgIGlmIChmaWxlLiRuZ2ZEaW1lbnNpb25Qcm9taXNlKSByZXR1cm4gZmlsZS4kbmdmRGltZW5zaW9uUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGZpbGUudHlwZS5pbmRleE9mKCdpbWFnZScpICE9PSAwKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgnbm90IGltYWdlJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHVwbG9hZC5kYXRhVXJsKGZpbGUpLnRoZW4oZnVuY3Rpb24gKGRhdGFVcmwpIHtcbiAgICAgICAgdmFyIGltZyA9IGFuZ3VsYXIuZWxlbWVudCgnPGltZz4nKS5hdHRyKCdzcmMnLCBkYXRhVXJsKVxuICAgICAgICAgIC5jc3MoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJykuY3NzKCdwb3NpdGlvbicsICdmaXhlZCcpXG4gICAgICAgICAgLmNzcygnbWF4LXdpZHRoJywgJ25vbmUgIWltcG9ydGFudCcpLmNzcygnbWF4LWhlaWdodCcsICdub25lICFpbXBvcnRhbnQnKTtcblxuICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xuICAgICAgICAgIHZhciB3aWR0aCA9IGltZ1swXS5uYXR1cmFsV2lkdGggfHwgaW1nWzBdLmNsaWVudFdpZHRoO1xuICAgICAgICAgIHZhciBoZWlnaHQgPSBpbWdbMF0ubmF0dXJhbEhlaWdodCB8fCBpbWdbMF0uY2xpZW50SGVpZ2h0O1xuICAgICAgICAgIGltZy5yZW1vdmUoKTtcbiAgICAgICAgICBmaWxlLiRuZ2ZXaWR0aCA9IHdpZHRoO1xuICAgICAgICAgIGZpbGUuJG5nZkhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHt3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBlcnJvcigpIHtcbiAgICAgICAgICBpbWcucmVtb3ZlKCk7XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdsb2FkIGVycm9yJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpbWcub24oJ2xvYWQnLCBzdWNjZXNzKTtcbiAgICAgICAgaW1nLm9uKCdlcnJvcicsIGVycm9yKTtcblxuICAgICAgICB2YXIgc2Vjb25kc0NvdW50ZXIgPSAwO1xuICAgICAgICBmdW5jdGlvbiBjaGVja0xvYWRFcnJvckluQ2FzZU9mTm9DYWxsYmFjaygpIHtcbiAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoaW1nWzBdLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgaWYgKGltZ1swXS5jbGllbnRXaWR0aCkge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3MoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWNvbmRzQ291bnRlcisrID4gMTApIHtcbiAgICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoZWNrTG9hZEVycm9ySW5DYXNlT2ZOb0NhbGxiYWNrKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoZWNrTG9hZEVycm9ySW5DYXNlT2ZOb0NhbGxiYWNrKCk7XG5cbiAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0pLmFwcGVuZChpbWcpO1xuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2xvYWQgZXJyb3InKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZmlsZS4kbmdmRGltZW5zaW9uUHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgZmlsZS4kbmdmRGltZW5zaW9uUHJvbWlzZVsnZmluYWxseSddKGZ1bmN0aW9uICgpIHtcbiAgICAgIGRlbGV0ZSBmaWxlLiRuZ2ZEaW1lbnNpb25Qcm9taXNlO1xuICAgIH0pO1xuICAgIHJldHVybiBmaWxlLiRuZ2ZEaW1lbnNpb25Qcm9taXNlO1xuICB9O1xuXG4gIHVwbG9hZC5tZWRpYUR1cmF0aW9uID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICBpZiAoZmlsZS4kbmdmRHVyYXRpb24pIHtcbiAgICAgIHZhciBkID0gJHEuZGVmZXIoKTtcbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZC5yZXNvbHZlKGZpbGUuJG5nZkR1cmF0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGQucHJvbWlzZTtcbiAgICB9XG4gICAgaWYgKGZpbGUuJG5nZkR1cmF0aW9uUHJvbWlzZSkgcmV0dXJuIGZpbGUuJG5nZkR1cmF0aW9uUHJvbWlzZTtcblxuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGZpbGUudHlwZS5pbmRleE9mKCdhdWRpbycpICE9PSAwICYmIGZpbGUudHlwZS5pbmRleE9mKCd2aWRlbycpICE9PSAwKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgnbm90IG1lZGlhJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHVwbG9hZC5kYXRhVXJsKGZpbGUpLnRoZW4oZnVuY3Rpb24gKGRhdGFVcmwpIHtcbiAgICAgICAgdmFyIGVsID0gYW5ndWxhci5lbGVtZW50KGZpbGUudHlwZS5pbmRleE9mKCdhdWRpbycpID09PSAwID8gJzxhdWRpbz4nIDogJzx2aWRlbz4nKVxuICAgICAgICAgIC5hdHRyKCdzcmMnLCBkYXRhVXJsKS5jc3MoJ3Zpc2liaWxpdHknLCAnbm9uZScpLmNzcygncG9zaXRpb24nLCAnZml4ZWQnKTtcblxuICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKCkge1xuICAgICAgICAgIHZhciBkdXJhdGlvbiA9IGVsWzBdLmR1cmF0aW9uO1xuICAgICAgICAgIGZpbGUuJG5nZkR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgICAgICAgZWwucmVtb3ZlKCk7XG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkdXJhdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBlcnJvcigpIHtcbiAgICAgICAgICBlbC5yZW1vdmUoKTtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ2xvYWQgZXJyb3InKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsLm9uKCdsb2FkZWRtZXRhZGF0YScsIHN1Y2Nlc3MpO1xuICAgICAgICBlbC5vbignZXJyb3InLCBlcnJvcik7XG4gICAgICAgIHZhciBjb3VudCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gY2hlY2tMb2FkRXJyb3IoKSB7XG4gICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGVsWzBdLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgaWYgKGVsWzBdLmR1cmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgc3VjY2VzcygpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvdW50ID4gMTApIHtcbiAgICAgICAgICAgICAgICBlcnJvcigpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoZWNrTG9hZEVycm9yKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoZWNrTG9hZEVycm9yKCk7XG5cbiAgICAgICAgYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LmJvZHkpLmFwcGVuZChlbCk7XG4gICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdCgnbG9hZCBlcnJvcicpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmaWxlLiRuZ2ZEdXJhdGlvblByb21pc2UgPSBkZWZlcnJlZC5wcm9taXNlO1xuICAgIGZpbGUuJG5nZkR1cmF0aW9uUHJvbWlzZVsnZmluYWxseSddKGZ1bmN0aW9uICgpIHtcbiAgICAgIGRlbGV0ZSBmaWxlLiRuZ2ZEdXJhdGlvblByb21pc2U7XG4gICAgfSk7XG4gICAgcmV0dXJuIGZpbGUuJG5nZkR1cmF0aW9uUHJvbWlzZTtcbiAgfTtcbiAgcmV0dXJuIHVwbG9hZDtcbn1cbl0pO1xuXG5uZ0ZpbGVVcGxvYWQuc2VydmljZSgnVXBsb2FkUmVzaXplJywgWydVcGxvYWRWYWxpZGF0ZScsICckcScsIGZ1bmN0aW9uIChVcGxvYWRWYWxpZGF0ZSwgJHEpIHtcbiAgdmFyIHVwbG9hZCA9IFVwbG9hZFZhbGlkYXRlO1xuXG4gIC8qKlxuICAgKiBDb25zZXJ2ZSBhc3BlY3QgcmF0aW8gb2YgdGhlIG9yaWdpbmFsIHJlZ2lvbi4gVXNlZnVsIHdoZW4gc2hyaW5raW5nL2VubGFyZ2luZ1xuICAgKiBpbWFnZXMgdG8gZml0IGludG8gYSBjZXJ0YWluIGFyZWEuXG4gICAqIFNvdXJjZTogIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0NzMxOTIyXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBzcmNXaWR0aCBTb3VyY2UgYXJlYSB3aWR0aFxuICAgKiBAcGFyYW0ge051bWJlcn0gc3JjSGVpZ2h0IFNvdXJjZSBhcmVhIGhlaWdodFxuICAgKiBAcGFyYW0ge051bWJlcn0gbWF4V2lkdGggTmVzdGFibGUgYXJlYSBtYXhpbXVtIGF2YWlsYWJsZSB3aWR0aFxuICAgKiBAcGFyYW0ge051bWJlcn0gbWF4SGVpZ2h0IE5lc3RhYmxlIGFyZWEgbWF4aW11bSBhdmFpbGFibGUgaGVpZ2h0XG4gICAqIEByZXR1cm4ge09iamVjdH0geyB3aWR0aCwgaGVpZ2h0IH1cbiAgICovXG4gIHZhciBjYWxjdWxhdGVBc3BlY3RSYXRpb0ZpdCA9IGZ1bmN0aW9uIChzcmNXaWR0aCwgc3JjSGVpZ2h0LCBtYXhXaWR0aCwgbWF4SGVpZ2h0LCBjZW50ZXJDcm9wKSB7XG4gICAgdmFyIHJhdGlvID0gY2VudGVyQ3JvcCA/IE1hdGgubWF4KG1heFdpZHRoIC8gc3JjV2lkdGgsIG1heEhlaWdodCAvIHNyY0hlaWdodCkgOlxuICAgICAgTWF0aC5taW4obWF4V2lkdGggLyBzcmNXaWR0aCwgbWF4SGVpZ2h0IC8gc3JjSGVpZ2h0KTtcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IHNyY1dpZHRoICogcmF0aW8sIGhlaWdodDogc3JjSGVpZ2h0ICogcmF0aW8sXG4gICAgICBtYXJnaW5YOiBzcmNXaWR0aCAqIHJhdGlvIC0gbWF4V2lkdGgsIG1hcmdpblk6IHNyY0hlaWdodCAqIHJhdGlvIC0gbWF4SGVpZ2h0XG4gICAgfTtcbiAgfTtcblxuICAvLyBFeHRyYWN0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcm9tZWxnb21lei9hbmd1bGFyLWZpcmViYXNlLWltYWdlLXVwbG9hZC9ibG9iL21hc3Rlci9hcHAvc2NyaXB0cy9maWxlVXBsb2FkLmpzI0w4OVxuICB2YXIgcmVzaXplID0gZnVuY3Rpb24gKGltYWdlbiwgd2lkdGgsIGhlaWdodCwgcXVhbGl0eSwgdHlwZSwgcmF0aW8sIGNlbnRlckNyb3AsIHJlc2l6ZUlmKSB7XG4gICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgY2FudmFzRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHZhciBpbWFnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcbiAgICBpbWFnZUVsZW1lbnQuc2V0QXR0cmlidXRlKCdzdHlsZScsICd2aXNpYmlsaXR5OmhpZGRlbjtwb3NpdGlvbjpmaXhlZDt6LWluZGV4Oi0xMDAwMDAnKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGltYWdlRWxlbWVudCk7XG5cbiAgICBpbWFnZUVsZW1lbnQub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGltZ1dpZHRoID0gaW1hZ2VFbGVtZW50LndpZHRoLCBpbWdIZWlnaHQgPSBpbWFnZUVsZW1lbnQuaGVpZ2h0O1xuICAgICAgaW1hZ2VFbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoaW1hZ2VFbGVtZW50KTtcbiAgICAgIGlmIChyZXNpemVJZiAhPSBudWxsICYmIHJlc2l6ZUlmKGltZ1dpZHRoLCBpbWdIZWlnaHQpID09PSBmYWxzZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ3Jlc2l6ZUlmJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChyYXRpbykge1xuICAgICAgICAgIHZhciByYXRpb0Zsb2F0ID0gdXBsb2FkLnJhdGlvVG9GbG9hdChyYXRpbyk7XG4gICAgICAgICAgdmFyIGltZ1JhdGlvID0gaW1nV2lkdGggLyBpbWdIZWlnaHQ7XG4gICAgICAgICAgaWYgKGltZ1JhdGlvIDwgcmF0aW9GbG9hdCkge1xuICAgICAgICAgICAgd2lkdGggPSBpbWdXaWR0aDtcbiAgICAgICAgICAgIGhlaWdodCA9IHdpZHRoIC8gcmF0aW9GbG9hdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGVpZ2h0ID0gaW1nSGVpZ2h0O1xuICAgICAgICAgICAgd2lkdGggPSBoZWlnaHQgKiByYXRpb0Zsb2F0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIXdpZHRoKSB7XG4gICAgICAgICAgd2lkdGggPSBpbWdXaWR0aDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWhlaWdodCkge1xuICAgICAgICAgIGhlaWdodCA9IGltZ0hlaWdodDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGltZW5zaW9ucyA9IGNhbGN1bGF0ZUFzcGVjdFJhdGlvRml0KGltZ1dpZHRoLCBpbWdIZWlnaHQsIHdpZHRoLCBoZWlnaHQsIGNlbnRlckNyb3ApO1xuICAgICAgICBjYW52YXNFbGVtZW50LndpZHRoID0gTWF0aC5taW4oZGltZW5zaW9ucy53aWR0aCwgd2lkdGgpO1xuICAgICAgICBjYW52YXNFbGVtZW50LmhlaWdodCA9IE1hdGgubWluKGRpbWVuc2lvbnMuaGVpZ2h0LCBoZWlnaHQpO1xuICAgICAgICB2YXIgY29udGV4dCA9IGNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2VFbGVtZW50LFxuICAgICAgICAgIE1hdGgubWluKDAsIC1kaW1lbnNpb25zLm1hcmdpblggLyAyKSwgTWF0aC5taW4oMCwgLWRpbWVuc2lvbnMubWFyZ2luWSAvIDIpLFxuICAgICAgICAgIGRpbWVuc2lvbnMud2lkdGgsIGRpbWVuc2lvbnMuaGVpZ2h0KTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShjYW52YXNFbGVtZW50LnRvRGF0YVVSTCh0eXBlIHx8ICdpbWFnZS9XZWJQJywgcXVhbGl0eSB8fCAwLjkzNCkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBpbWFnZUVsZW1lbnQub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGltYWdlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGltYWdlRWxlbWVudCk7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICB9O1xuICAgIGltYWdlRWxlbWVudC5zcmMgPSBpbWFnZW47XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG5cbiAgdXBsb2FkLmRhdGFVcmx0b0Jsb2IgPSBmdW5jdGlvbiAoZGF0YXVybCwgbmFtZSwgb3JpZ1NpemUpIHtcbiAgICB2YXIgYXJyID0gZGF0YXVybC5zcGxpdCgnLCcpLCBtaW1lID0gYXJyWzBdLm1hdGNoKC86KC4qPyk7LylbMV0sXG4gICAgICBic3RyID0gYXRvYihhcnJbMV0pLCBuID0gYnN0ci5sZW5ndGgsIHU4YXJyID0gbmV3IFVpbnQ4QXJyYXkobik7XG4gICAgd2hpbGUgKG4tLSkge1xuICAgICAgdThhcnJbbl0gPSBic3RyLmNoYXJDb2RlQXQobik7XG4gICAgfVxuICAgIHZhciBibG9iID0gbmV3IHdpbmRvdy5CbG9iKFt1OGFycl0sIHt0eXBlOiBtaW1lfSk7XG4gICAgYmxvYi5uYW1lID0gbmFtZTtcbiAgICBibG9iLiRuZ2ZPcmlnU2l6ZSA9IG9yaWdTaXplO1xuICAgIHJldHVybiBibG9iO1xuICB9O1xuXG4gIHVwbG9hZC5pc1Jlc2l6ZVN1cHBvcnRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHJldHVybiB3aW5kb3cuYXRvYiAmJiBlbGVtLmdldENvbnRleHQgJiYgZWxlbS5nZXRDb250ZXh0KCcyZCcpICYmIHdpbmRvdy5CbG9iO1xuICB9O1xuXG4gIGlmICh1cGxvYWQuaXNSZXNpemVTdXBwb3J0ZWQoKSkge1xuICAgIC8vIGFkZCBuYW1lIGdldHRlciB0byB0aGUgYmxvYiBjb25zdHJ1Y3RvciBwcm90b3R5cGVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2luZG93LkJsb2IucHJvdG90eXBlLCAnbmFtZScsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kbmdmTmFtZTtcbiAgICAgIH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIHRoaXMuJG5nZk5hbWUgPSB2O1xuICAgICAgfSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgdXBsb2FkLnJlc2l6ZSA9IGZ1bmN0aW9uIChmaWxlLCBvcHRpb25zKSB7XG4gICAgaWYgKGZpbGUudHlwZS5pbmRleE9mKCdpbWFnZScpICE9PSAwKSByZXR1cm4gdXBsb2FkLmVtcHR5UHJvbWlzZShmaWxlKTtcblxuICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgdXBsb2FkLmRhdGFVcmwoZmlsZSwgdHJ1ZSkudGhlbihmdW5jdGlvbiAodXJsKSB7XG4gICAgICByZXNpemUodXJsLCBvcHRpb25zLndpZHRoLCBvcHRpb25zLmhlaWdodCwgb3B0aW9ucy5xdWFsaXR5LCBvcHRpb25zLnR5cGUgfHwgZmlsZS50eXBlLFxuICAgICAgICBvcHRpb25zLnJhdGlvLCBvcHRpb25zLmNlbnRlckNyb3AsIG9wdGlvbnMucmVzaXplSWYpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhVXJsKSB7XG4gICAgICAgICAgaWYgKGZpbGUudHlwZSA9PT0gJ2ltYWdlL2pwZWcnICYmIG9wdGlvbnMucmVzdG9yZUV4aWYgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBkYXRhVXJsID0gdXBsb2FkLnJlc3RvcmVFeGlmKHVybCwgZGF0YVVybCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge3Rocm93IGU7fSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgYmxvYiA9IHVwbG9hZC5kYXRhVXJsdG9CbG9iKGRhdGFVcmwsIGZpbGUubmFtZSwgZmlsZS5zaXplKTtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoYmxvYik7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICBpZiAociA9PT0gJ3Jlc2l6ZUlmJykge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShmaWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KHIpO1xuICAgICAgICB9KTtcbiAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgZGVmZXJyZWQucmVqZWN0KGUpO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9O1xuXG4gIHJldHVybiB1cGxvYWQ7XG59XSk7XG5cbihmdW5jdGlvbiAoKSB7XG4gIG5nRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nZkRyb3AnLCBbJyRwYXJzZScsICckdGltZW91dCcsICckd2luZG93JywgJ1VwbG9hZCcsICckaHR0cCcsICckcScsXG4gICAgZnVuY3Rpb24gKCRwYXJzZSwgJHRpbWVvdXQsICR3aW5kb3csIFVwbG9hZCwgJGh0dHAsICRxKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFQycsXG4gICAgICAgIHJlcXVpcmU6ICc/bmdNb2RlbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCkge1xuICAgICAgICAgIGxpbmtEcm9wKHNjb3BlLCBlbGVtLCBhdHRyLCBuZ01vZGVsLCAkcGFyc2UsICR0aW1lb3V0LCAkd2luZG93LCBVcGxvYWQsICRodHRwLCAkcSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfV0pO1xuXG4gIG5nRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nZk5vRmlsZURyb3AnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgZWxlbSkge1xuICAgICAgaWYgKGRyb3BBdmFpbGFibGUoKSkgZWxlbS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgIH07XG4gIH0pO1xuXG4gIG5nRmlsZVVwbG9hZC5kaXJlY3RpdmUoJ25nZkRyb3BBdmFpbGFibGUnLCBbJyRwYXJzZScsICckdGltZW91dCcsICdVcGxvYWQnLCBmdW5jdGlvbiAoJHBhcnNlLCAkdGltZW91dCwgVXBsb2FkKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgaWYgKGRyb3BBdmFpbGFibGUoKSkge1xuICAgICAgICB2YXIgbW9kZWwgPSAkcGFyc2UoVXBsb2FkLmF0dHJHZXR0ZXIoJ25nZkRyb3BBdmFpbGFibGUnLCBhdHRyKSk7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBtb2RlbChzY29wZSk7XG4gICAgICAgICAgaWYgKG1vZGVsLmFzc2lnbikge1xuICAgICAgICAgICAgbW9kZWwuYXNzaWduKHNjb3BlLCB0cnVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1dKTtcblxuICBmdW5jdGlvbiBsaW5rRHJvcChzY29wZSwgZWxlbSwgYXR0ciwgbmdNb2RlbCwgJHBhcnNlLCAkdGltZW91dCwgJHdpbmRvdywgdXBsb2FkLCAkaHR0cCwgJHEpIHtcbiAgICB2YXIgYXZhaWxhYmxlID0gZHJvcEF2YWlsYWJsZSgpO1xuXG4gICAgdmFyIGF0dHJHZXR0ZXIgPSBmdW5jdGlvbiAobmFtZSwgc2NvcGUsIHBhcmFtcykge1xuICAgICAgcmV0dXJuIHVwbG9hZC5hdHRyR2V0dGVyKG5hbWUsIGF0dHIsIHNjb3BlLCBwYXJhbXMpO1xuICAgIH07XG5cbiAgICBpZiAoYXR0ckdldHRlcignZHJvcEF2YWlsYWJsZScpKSB7XG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzY29wZVthdHRyR2V0dGVyKCdkcm9wQXZhaWxhYmxlJyldKSB7XG4gICAgICAgICAgc2NvcGVbYXR0ckdldHRlcignZHJvcEF2YWlsYWJsZScpXS52YWx1ZSA9IGF2YWlsYWJsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzY29wZVthdHRyR2V0dGVyKCdkcm9wQXZhaWxhYmxlJyldID0gYXZhaWxhYmxlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCFhdmFpbGFibGUpIHtcbiAgICAgIGlmIChhdHRyR2V0dGVyKCduZ2ZIaWRlT25Ecm9wTm90QXZhaWxhYmxlJywgc2NvcGUpID09PSB0cnVlKSB7XG4gICAgICAgIGVsZW0uY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0Rpc2FibGVkKCkge1xuICAgICAgcmV0dXJuIGVsZW0uYXR0cignZGlzYWJsZWQnKSB8fCBhdHRyR2V0dGVyKCduZ2ZEcm9wRGlzYWJsZWQnLCBzY29wZSk7XG4gICAgfVxuXG4gICAgaWYgKGF0dHJHZXR0ZXIoJ25nZlNlbGVjdCcpID09IG51bGwpIHtcbiAgICAgIHVwbG9hZC5yZWdpc3Rlck1vZGVsQ2hhbmdlVmFsaWRhdG9yKG5nTW9kZWwsIGF0dHIsIHNjb3BlKTtcbiAgICB9XG5cbiAgICB2YXIgbGVhdmVUaW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgc3RvcFByb3BhZ2F0aW9uID0gJHBhcnNlKGF0dHJHZXR0ZXIoJ25nZlN0b3BQcm9wYWdhdGlvbicpKTtcbiAgICB2YXIgZHJhZ092ZXJEZWxheSA9IDE7XG4gICAgdmFyIGFjdHVhbERyYWdPdmVyQ2xhc3M7XG5cbiAgICBlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2RyYWdvdmVyJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgaWYgKGlzRGlzYWJsZWQoKSB8fCAhdXBsb2FkLnNob3VsZFVwZGF0ZU9uKCdkcm9wJywgYXR0ciwgc2NvcGUpKSByZXR1cm47XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChzdG9wUHJvcGFnYXRpb24oc2NvcGUpKSBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAvLyBoYW5kbGluZyBkcmFnb3ZlciBldmVudHMgZnJvbSB0aGUgQ2hyb21lIGRvd25sb2FkIGJhclxuICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPiAtMSkge1xuICAgICAgICB2YXIgYiA9IGV2dC5kYXRhVHJhbnNmZXIuZWZmZWN0QWxsb3dlZDtcbiAgICAgICAgZXZ0LmRhdGFUcmFuc2Zlci5kcm9wRWZmZWN0ID0gKCdtb3ZlJyA9PT0gYiB8fCAnbGlua01vdmUnID09PSBiKSA/ICdtb3ZlJyA6ICdjb3B5JztcbiAgICAgIH1cbiAgICAgICR0aW1lb3V0LmNhbmNlbChsZWF2ZVRpbWVvdXQpO1xuICAgICAgaWYgKCFhY3R1YWxEcmFnT3ZlckNsYXNzKSB7XG4gICAgICAgIGFjdHVhbERyYWdPdmVyQ2xhc3MgPSAnQyc7XG4gICAgICAgIGNhbGN1bGF0ZURyYWdPdmVyQ2xhc3Moc2NvcGUsIGF0dHIsIGV2dCwgZnVuY3Rpb24gKGNsYXp6KSB7XG4gICAgICAgICAgYWN0dWFsRHJhZ092ZXJDbGFzcyA9IGNsYXp6O1xuICAgICAgICAgIGVsZW0uYWRkQ2xhc3MoYWN0dWFsRHJhZ092ZXJDbGFzcyk7XG4gICAgICAgICAgYXR0ckdldHRlcignbmdmRHJhZycsIHNjb3BlLCB7JGlzRHJhZ2dpbmc6IHRydWUsICRjbGFzczogYWN0dWFsRHJhZ092ZXJDbGFzcywgJGV2ZW50OiBldnR9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgZmFsc2UpO1xuICAgIGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2VudGVyJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgaWYgKGlzRGlzYWJsZWQoKSB8fCAhdXBsb2FkLnNob3VsZFVwZGF0ZU9uKCdkcm9wJywgYXR0ciwgc2NvcGUpKSByZXR1cm47XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChzdG9wUHJvcGFnYXRpb24oc2NvcGUpKSBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfSwgZmFsc2UpO1xuICAgIGVsZW1bMF0uYWRkRXZlbnRMaXN0ZW5lcignZHJhZ2xlYXZlJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgaWYgKGlzRGlzYWJsZWQoKSB8fCAhdXBsb2FkLnNob3VsZFVwZGF0ZU9uKCdkcm9wJywgYXR0ciwgc2NvcGUpKSByZXR1cm47XG4gICAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChzdG9wUHJvcGFnYXRpb24oc2NvcGUpKSBldnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICBsZWF2ZVRpbWVvdXQgPSAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChhY3R1YWxEcmFnT3ZlckNsYXNzKSBlbGVtLnJlbW92ZUNsYXNzKGFjdHVhbERyYWdPdmVyQ2xhc3MpO1xuICAgICAgICBhY3R1YWxEcmFnT3ZlckNsYXNzID0gbnVsbDtcbiAgICAgICAgYXR0ckdldHRlcignbmdmRHJhZycsIHNjb3BlLCB7JGlzRHJhZ2dpbmc6IGZhbHNlLCAkZXZlbnQ6IGV2dH0pO1xuICAgICAgfSwgZHJhZ092ZXJEZWxheSB8fCAxMDApO1xuICAgIH0sIGZhbHNlKTtcbiAgICBlbGVtWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2Ryb3AnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICBpZiAoaXNEaXNhYmxlZCgpIHx8ICF1cGxvYWQuc2hvdWxkVXBkYXRlT24oJ2Ryb3AnLCBhdHRyLCBzY29wZSkpIHJldHVybjtcbiAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKHN0b3BQcm9wYWdhdGlvbihzY29wZSkpIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIGlmIChhY3R1YWxEcmFnT3ZlckNsYXNzKSBlbGVtLnJlbW92ZUNsYXNzKGFjdHVhbERyYWdPdmVyQ2xhc3MpO1xuICAgICAgYWN0dWFsRHJhZ092ZXJDbGFzcyA9IG51bGw7XG4gICAgICB2YXIgaXRlbXMgPSBldnQuZGF0YVRyYW5zZmVyLml0ZW1zO1xuICAgICAgdmFyIGh0bWw7XG4gICAgICB0cnkge1xuICAgICAgICBodG1sID0gZXZ0LmRhdGFUcmFuc2ZlciAmJiBldnQuZGF0YVRyYW5zZmVyLmdldERhdGEgJiYgZXZ0LmRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXh0L2h0bWwnKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHsvKiBGaXggSUUxMSB0aGF0IHRocm93IGVycm9yIGNhbGxpbmcgZ2V0RGF0YSAqL1xuICAgICAgfVxuXG4gICAgICBleHRyYWN0RmlsZXMoaXRlbXMsIGV2dC5kYXRhVHJhbnNmZXIuZmlsZXMsIGF0dHJHZXR0ZXIoJ25nZkFsbG93RGlyJywgc2NvcGUpICE9PSBmYWxzZSxcbiAgICAgICAgYXR0ckdldHRlcignbXVsdGlwbGUnKSB8fCBhdHRyR2V0dGVyKCduZ2ZNdWx0aXBsZScsIHNjb3BlKSkudGhlbihmdW5jdGlvbiAoZmlsZXMpIHtcbiAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgIHVwZGF0ZU1vZGVsKGZpbGVzLCBldnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV4dHJhY3RGaWxlc0Zyb21IdG1sKCdkcm9wVXJsJywgaHRtbCkudGhlbihmdW5jdGlvbiAoZmlsZXMpIHtcbiAgICAgICAgICAgIHVwZGF0ZU1vZGVsKGZpbGVzLCBldnQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCBmYWxzZSk7XG4gICAgZWxlbVswXS5hZGRFdmVudExpc3RlbmVyKCdwYXN0ZScsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZignZmlyZWZveCcpID4gLTEgJiZcbiAgICAgICAgYXR0ckdldHRlcignbmdmRW5hYmxlRmlyZWZveFBhc3RlJywgc2NvcGUpKSB7XG4gICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfVxuICAgICAgaWYgKGlzRGlzYWJsZWQoKSB8fCAhdXBsb2FkLnNob3VsZFVwZGF0ZU9uKCdwYXN0ZScsIGF0dHIsIHNjb3BlKSkgcmV0dXJuO1xuICAgICAgdmFyIGZpbGVzID0gW107XG4gICAgICB2YXIgY2xpcGJvYXJkID0gZXZ0LmNsaXBib2FyZERhdGEgfHwgZXZ0Lm9yaWdpbmFsRXZlbnQuY2xpcGJvYXJkRGF0YTtcbiAgICAgIGlmIChjbGlwYm9hcmQgJiYgY2xpcGJvYXJkLml0ZW1zKSB7XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgY2xpcGJvYXJkLml0ZW1zLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgaWYgKGNsaXBib2FyZC5pdGVtc1trXS50eXBlLmluZGV4T2YoJ2ltYWdlJykgIT09IC0xKSB7XG4gICAgICAgICAgICBmaWxlcy5wdXNoKGNsaXBib2FyZC5pdGVtc1trXS5nZXRBc0ZpbGUoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZmlsZXMubGVuZ3RoKSB7XG4gICAgICAgIHVwZGF0ZU1vZGVsKGZpbGVzLCBldnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXh0cmFjdEZpbGVzRnJvbUh0bWwoJ3Bhc3RlVXJsJywgY2xpcGJvYXJkKS50aGVuKGZ1bmN0aW9uIChmaWxlcykge1xuICAgICAgICAgIHVwZGF0ZU1vZGVsKGZpbGVzLCBldnQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCBmYWxzZSk7XG5cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoJ2ZpcmVmb3gnKSA+IC0xICYmXG4gICAgICBhdHRyR2V0dGVyKCduZ2ZFbmFibGVGaXJlZm94UGFzdGUnLCBzY29wZSkpIHtcbiAgICAgIGVsZW0uYXR0cignY29udGVudGVkaXRhYmxlJywgdHJ1ZSk7XG4gICAgICBlbGVtLm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmICghZS5tZXRhS2V5ICYmICFlLmN0cmxLZXkpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU1vZGVsKGZpbGVzLCBldnQpIHtcbiAgICAgIHVwbG9hZC51cGRhdGVNb2RlbChuZ01vZGVsLCBhdHRyLCBzY29wZSwgYXR0ckdldHRlcignbmdmQ2hhbmdlJykgfHwgYXR0ckdldHRlcignbmdmRHJvcCcpLCBmaWxlcywgZXZ0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHRyYWN0RmlsZXNGcm9tSHRtbCh1cGRhdGVPbiwgaHRtbCkge1xuICAgICAgaWYgKCF1cGxvYWQuc2hvdWxkVXBkYXRlT24odXBkYXRlT24sIGF0dHIsIHNjb3BlKSB8fCB0eXBlb2YgaHRtbCAhPT0gJ3N0cmluZycpIHJldHVybiB1cGxvYWQucmVqZWN0UHJvbWlzZShbXSk7XG4gICAgICB2YXIgdXJscyA9IFtdO1xuICAgICAgaHRtbC5yZXBsYWNlKC88KGltZyBzcmN8aW1nIFtePl0qIHNyYykgKj1cXFwiKFteXFxcIl0qKVxcXCIvZ2ksIGZ1bmN0aW9uIChtLCBuLCBzcmMpIHtcbiAgICAgICAgdXJscy5wdXNoKHNyYyk7XG4gICAgICB9KTtcbiAgICAgIHZhciBwcm9taXNlcyA9IFtdLCBmaWxlcyA9IFtdO1xuICAgICAgaWYgKHVybHMubGVuZ3RoKSB7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh1cmxzLCBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaCh1cGxvYWQudXJsVG9CbG9iKHVybCkudGhlbihmdW5jdGlvbiAoYmxvYikge1xuICAgICAgICAgICAgZmlsZXMucHVzaChibG9iKTtcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgICAgICAkcS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGRlZmVyLnJlc29sdmUoZmlsZXMpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIGRlZmVyLnJlamVjdChlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHVwbG9hZC5lbXB0eVByb21pc2UoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjYWxjdWxhdGVEcmFnT3ZlckNsYXNzKHNjb3BlLCBhdHRyLCBldnQsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgb2JqID0gYXR0ckdldHRlcignbmdmRHJhZ092ZXJDbGFzcycsIHNjb3BlLCB7JGV2ZW50OiBldnR9KSwgZENsYXNzID0gJ2RyYWdvdmVyJztcbiAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKG9iaikpIHtcbiAgICAgICAgZENsYXNzID0gb2JqO1xuICAgICAgfSBlbHNlIGlmIChvYmopIHtcbiAgICAgICAgaWYgKG9iai5kZWxheSkgZHJhZ092ZXJEZWxheSA9IG9iai5kZWxheTtcbiAgICAgICAgaWYgKG9iai5hY2NlcHQgfHwgb2JqLnJlamVjdCkge1xuICAgICAgICAgIHZhciBpdGVtcyA9IGV2dC5kYXRhVHJhbnNmZXIuaXRlbXM7XG4gICAgICAgICAgaWYgKGl0ZW1zID09IG51bGwgfHwgIWl0ZW1zLmxlbmd0aCkge1xuICAgICAgICAgICAgZENsYXNzID0gb2JqLmFjY2VwdDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHBhdHRlcm4gPSBvYmoucGF0dGVybiB8fCBhdHRyR2V0dGVyKCduZ2ZQYXR0ZXJuJywgc2NvcGUsIHskZXZlbnQ6IGV2dH0pO1xuICAgICAgICAgICAgdmFyIGxlbiA9IGl0ZW1zLmxlbmd0aDtcbiAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICBpZiAoIXVwbG9hZC52YWxpZGF0ZVBhdHRlcm4oaXRlbXNbbGVuXSwgcGF0dGVybikpIHtcbiAgICAgICAgICAgICAgICBkQ2xhc3MgPSBvYmoucmVqZWN0O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRDbGFzcyA9IG9iai5hY2NlcHQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrKGRDbGFzcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZXh0cmFjdEZpbGVzKGl0ZW1zLCBmaWxlTGlzdCwgYWxsb3dEaXIsIG11bHRpcGxlKSB7XG4gICAgICB2YXIgbWF4RmlsZXMgPSB1cGxvYWQuZ2V0VmFsaWRhdGlvbkF0dHIoYXR0ciwgc2NvcGUsICdtYXhGaWxlcycpO1xuICAgICAgaWYgKG1heEZpbGVzID09IG51bGwpIHtcbiAgICAgICAgbWF4RmlsZXMgPSBOdW1iZXIuTUFYX1ZBTFVFO1xuICAgICAgfVxuICAgICAgdmFyIG1heFRvdGFsU2l6ZSA9IHVwbG9hZC5nZXRWYWxpZGF0aW9uQXR0cihhdHRyLCBzY29wZSwgJ21heFRvdGFsU2l6ZScpO1xuICAgICAgaWYgKG1heFRvdGFsU2l6ZSA9PSBudWxsKSB7XG4gICAgICAgIG1heFRvdGFsU2l6ZSA9IE51bWJlci5NQVhfVkFMVUU7XG4gICAgICB9XG4gICAgICB2YXIgaW5jbHVkZURpciA9IGF0dHJHZXR0ZXIoJ25nZkluY2x1ZGVEaXInLCBzY29wZSk7XG4gICAgICB2YXIgZmlsZXMgPSBbXSwgdG90YWxTaXplID0gMDtcblxuICAgICAgZnVuY3Rpb24gdHJhdmVyc2VGaWxlVHJlZShlbnRyeSwgcGF0aCkge1xuICAgICAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgICAgICBpZiAoZW50cnkgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSkge1xuICAgICAgICAgICAgdmFyIHByb21pc2VzID0gW3VwbG9hZC5lbXB0eVByb21pc2UoKV07XG4gICAgICAgICAgICBpZiAoaW5jbHVkZURpcikge1xuICAgICAgICAgICAgICB2YXIgZmlsZSA9IHt0eXBlOiAnZGlyZWN0b3J5J307XG4gICAgICAgICAgICAgIGZpbGUubmFtZSA9IGZpbGUucGF0aCA9IChwYXRoIHx8ICcnKSArIGVudHJ5Lm5hbWU7XG4gICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZGlyUmVhZGVyID0gZW50cnkuY3JlYXRlUmVhZGVyKCk7XG4gICAgICAgICAgICB2YXIgZW50cmllcyA9IFtdO1xuICAgICAgICAgICAgdmFyIHJlYWRFbnRyaWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICBkaXJSZWFkZXIucmVhZEVudHJpZXMoZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgaWYgKCFyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZW50cmllcy5zbGljZSgwKSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoIDw9IG1heEZpbGVzICYmIHRvdGFsU2l6ZSA8PSBtYXhUb3RhbFNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb21pc2VzLnB1c2godHJhdmVyc2VGaWxlVHJlZShlLCAocGF0aCA/IHBhdGggOiAnJykgKyBlbnRyeS5uYW1lICsgJy8nKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVudHJpZXMgPSBlbnRyaWVzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChyZXN1bHRzIHx8IFtdLCAwKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICBkZWZlci5yZWplY3QoZSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlYWRFbnRyaWVzKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudHJ5LmZpbGUoZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmaWxlLnBhdGggPSAocGF0aCA/IHBhdGggOiAnJykgKyBmaWxlLm5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVEaXIpIHtcbiAgICAgICAgICAgICAgICAgIGZpbGUgPSB1cGxvYWQucmVuYW1lKGZpbGUsIGZpbGUucGF0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgICAgdG90YWxTaXplICs9IGZpbGUuc2l6ZTtcbiAgICAgICAgICAgICAgICBkZWZlci5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBkZWZlci5yZWplY3QoZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgIGRlZmVyLnJlamVjdChlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2VzID0gW3VwbG9hZC5lbXB0eVByb21pc2UoKV07XG5cbiAgICAgIGlmIChpdGVtcyAmJiBpdGVtcy5sZW5ndGggPiAwICYmICR3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgIT09ICdmaWxlOicpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5ICYmIGl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKSAmJiBpdGVtc1tpXS53ZWJraXRHZXRBc0VudHJ5KCkuaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgICAgIHZhciBlbnRyeSA9IGl0ZW1zW2ldLndlYmtpdEdldEFzRW50cnkoKTtcbiAgICAgICAgICAgIGlmIChlbnRyeS5pc0RpcmVjdG9yeSAmJiAhYWxsb3dEaXIpIHtcbiAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW50cnkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKHRyYXZlcnNlRmlsZVRyZWUoZW50cnkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGYgPSBpdGVtc1tpXS5nZXRBc0ZpbGUoKTtcbiAgICAgICAgICAgIGlmIChmICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgZmlsZXMucHVzaChmKTtcbiAgICAgICAgICAgICAgdG90YWxTaXplICs9IGYuc2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCA+IG1heEZpbGVzIHx8IHRvdGFsU2l6ZSA+IG1heFRvdGFsU2l6ZSB8fFxuICAgICAgICAgICAgKCFtdWx0aXBsZSAmJiBmaWxlcy5sZW5ndGggPiAwKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmaWxlTGlzdCAhPSBudWxsKSB7XG4gICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBmaWxlTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIGZpbGUgPSBmaWxlTGlzdC5pdGVtKGopO1xuICAgICAgICAgICAgaWYgKGZpbGUudHlwZSB8fCBmaWxlLnNpemUgPiAwKSB7XG4gICAgICAgICAgICAgIGZpbGVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICAgIHRvdGFsU2l6ZSArPSBmaWxlLnNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsZXMubGVuZ3RoID4gbWF4RmlsZXMgfHwgdG90YWxTaXplID4gbWF4VG90YWxTaXplIHx8XG4gICAgICAgICAgICAgICghbXVsdGlwbGUgJiYgZmlsZXMubGVuZ3RoID4gMCkpIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgICAgJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFtdWx0aXBsZSAmJiAhaW5jbHVkZURpciAmJiBmaWxlcy5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgd2hpbGUgKGZpbGVzW2ldICYmIGZpbGVzW2ldLnR5cGUgPT09ICdkaXJlY3RvcnknKSBpKys7XG4gICAgICAgICAgZGVmZXIucmVzb2x2ZShbZmlsZXNbaV1dKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkZWZlci5yZXNvbHZlKGZpbGVzKTtcbiAgICAgICAgfVxuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZGVmZXIucmVqZWN0KGUpO1xuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRyb3BBdmFpbGFibGUoKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJldHVybiAoJ2RyYWdnYWJsZScgaW4gZGl2KSAmJiAoJ29uZHJvcCcgaW4gZGl2KSAmJiAhL0VkZ2VcXC8xMi4vaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICB9XG5cbn0pKCk7XG5cbi8vIGN1c3RvbWl6ZWQgdmVyc2lvbiBvZiBodHRwczovL2dpdGh1Yi5jb20vZXhpZi1qcy9leGlmLWpzXG5uZ0ZpbGVVcGxvYWQuc2VydmljZSgnVXBsb2FkRXhpZicsIFsnVXBsb2FkUmVzaXplJywgJyRxJywgZnVuY3Rpb24gKFVwbG9hZFJlc2l6ZSwgJHEpIHtcbiAgdmFyIHVwbG9hZCA9IFVwbG9hZFJlc2l6ZTtcblxuICB1cGxvYWQuaXNFeGlmU3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB3aW5kb3cuRmlsZVJlYWRlciAmJiBuZXcgRmlsZVJlYWRlcigpLnJlYWRBc0FycmF5QnVmZmVyICYmIHVwbG9hZC5pc1Jlc2l6ZVN1cHBvcnRlZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGFwcGx5VHJhbnNmb3JtKGN0eCwgb3JpZW50YXRpb24sIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBzd2l0Y2ggKG9yaWVudGF0aW9uKSB7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIHJldHVybiBjdHgudHJhbnNmb3JtKC0xLCAwLCAwLCAxLCB3aWR0aCwgMCk7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIHJldHVybiBjdHgudHJhbnNmb3JtKC0xLCAwLCAwLCAtMSwgd2lkdGgsIGhlaWdodCk7XG4gICAgICBjYXNlIDQ6XG4gICAgICAgIHJldHVybiBjdHgudHJhbnNmb3JtKDEsIDAsIDAsIC0xLCAwLCBoZWlnaHQpO1xuICAgICAgY2FzZSA1OlxuICAgICAgICByZXR1cm4gY3R4LnRyYW5zZm9ybSgwLCAxLCAxLCAwLCAwLCAwKTtcbiAgICAgIGNhc2UgNjpcbiAgICAgICAgcmV0dXJuIGN0eC50cmFuc2Zvcm0oMCwgMSwgLTEsIDAsIGhlaWdodCwgMCk7XG4gICAgICBjYXNlIDc6XG4gICAgICAgIHJldHVybiBjdHgudHJhbnNmb3JtKDAsIC0xLCAtMSwgMCwgaGVpZ2h0LCB3aWR0aCk7XG4gICAgICBjYXNlIDg6XG4gICAgICAgIHJldHVybiBjdHgudHJhbnNmb3JtKDAsIC0xLCAxLCAwLCAwLCB3aWR0aCk7XG4gICAgfVxuICB9XG5cbiAgdXBsb2FkLnJlYWRPcmllbnRhdGlvbiA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICB2YXIgc2xpY2VkRmlsZSA9IGZpbGUuc2xpY2UgPyBmaWxlLnNsaWNlKDAsIDY0ICogMTAyNCkgOiBmaWxlO1xuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihzbGljZWRGaWxlKTtcbiAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICByZXR1cm4gZGVmZXIucmVqZWN0KGUpO1xuICAgIH07XG4gICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge29yaWVudGF0aW9uOiAxfTtcbiAgICAgIHZhciB2aWV3ID0gbmV3IERhdGFWaWV3KHRoaXMucmVzdWx0KTtcbiAgICAgIGlmICh2aWV3LmdldFVpbnQxNigwLCBmYWxzZSkgIT09IDB4RkZEOCkgcmV0dXJuIGRlZmVyLnJlc29sdmUocmVzdWx0KTtcblxuICAgICAgdmFyIGxlbmd0aCA9IHZpZXcuYnl0ZUxlbmd0aCxcbiAgICAgICAgb2Zmc2V0ID0gMjtcbiAgICAgIHdoaWxlIChvZmZzZXQgPCBsZW5ndGgpIHtcbiAgICAgICAgdmFyIG1hcmtlciA9IHZpZXcuZ2V0VWludDE2KG9mZnNldCwgZmFsc2UpO1xuICAgICAgICBvZmZzZXQgKz0gMjtcbiAgICAgICAgaWYgKG1hcmtlciA9PT0gMHhGRkUxKSB7XG4gICAgICAgICAgaWYgKHZpZXcuZ2V0VWludDMyKG9mZnNldCArPSAyLCBmYWxzZSkgIT09IDB4NDU3ODY5NjYpIHJldHVybiBkZWZlci5yZXNvbHZlKHJlc3VsdCk7XG5cbiAgICAgICAgICB2YXIgbGl0dGxlID0gdmlldy5nZXRVaW50MTYob2Zmc2V0ICs9IDYsIGZhbHNlKSA9PT0gMHg0OTQ5O1xuICAgICAgICAgIG9mZnNldCArPSB2aWV3LmdldFVpbnQzMihvZmZzZXQgKyA0LCBsaXR0bGUpO1xuICAgICAgICAgIHZhciB0YWdzID0gdmlldy5nZXRVaW50MTYob2Zmc2V0LCBsaXR0bGUpO1xuICAgICAgICAgIG9mZnNldCArPSAyO1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGFnczsgaSsrKVxuICAgICAgICAgICAgaWYgKHZpZXcuZ2V0VWludDE2KG9mZnNldCArIChpICogMTIpLCBsaXR0bGUpID09PSAweDAxMTIpIHtcbiAgICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdmlldy5nZXRVaW50MTYob2Zmc2V0ICsgKGkgKiAxMikgKyA4LCBsaXR0bGUpO1xuICAgICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPj0gMiAmJiBvcmllbnRhdGlvbiA8PSA4KSB7XG4gICAgICAgICAgICAgICAgdmlldy5zZXRVaW50MTYob2Zmc2V0ICsgKGkgKiAxMikgKyA4LCAxLCBsaXR0bGUpO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5maXhlZEFycmF5QnVmZmVyID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlc3VsdC5vcmllbnRhdGlvbiA9IG9yaWVudGF0aW9uO1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXIucmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKChtYXJrZXIgJiAweEZGMDApICE9PSAweEZGMDApIGJyZWFrO1xuICAgICAgICBlbHNlIG9mZnNldCArPSB2aWV3LmdldFVpbnQxNihvZmZzZXQsIGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkZWZlci5yZXNvbHZlKHJlc3VsdCk7XG4gICAgfTtcbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgfTtcblxuICBmdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIHZhciBiaW5hcnkgPSAnJztcbiAgICB2YXIgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIHZhciBsZW4gPSBieXRlcy5ieXRlTGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGJpbmFyeSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICB9XG4gICAgcmV0dXJuIHdpbmRvdy5idG9hKGJpbmFyeSk7XG4gIH1cblxuICB1cGxvYWQuYXBwbHlFeGlmUm90YXRpb24gPSBmdW5jdGlvbiAoZmlsZSkge1xuICAgIGlmIChmaWxlLnR5cGUuaW5kZXhPZignaW1hZ2UvanBlZycpICE9PSAwKSB7XG4gICAgICByZXR1cm4gdXBsb2FkLmVtcHR5UHJvbWlzZShmaWxlKTtcbiAgICB9XG5cbiAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuICAgIHVwbG9hZC5yZWFkT3JpZW50YXRpb24oZmlsZSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICBpZiAocmVzdWx0Lm9yaWVudGF0aW9uIDwgMiB8fCByZXN1bHQub3JpZW50YXRpb24gPiA4KSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZC5yZXNvbHZlKGZpbGUpO1xuICAgICAgfVxuICAgICAgdXBsb2FkLmRhdGFVcmwoZmlsZSwgdHJ1ZSkudGhlbihmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgdmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXG4gICAgICAgIGltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHJlc3VsdC5vcmllbnRhdGlvbiA+IDQgPyBpbWcuaGVpZ2h0IDogaW1nLndpZHRoO1xuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IHJlc3VsdC5vcmllbnRhdGlvbiA+IDQgPyBpbWcud2lkdGggOiBpbWcuaGVpZ2h0O1xuICAgICAgICAgICAgdmFyIGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgYXBwbHlUcmFuc2Zvcm0oY3R4LCByZXN1bHQub3JpZW50YXRpb24sIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XG4gICAgICAgICAgICBjdHguZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gICAgICAgICAgICB2YXIgZGF0YVVybCA9IGNhbnZhcy50b0RhdGFVUkwoZmlsZS50eXBlIHx8ICdpbWFnZS9XZWJQJywgMC45MzQpO1xuICAgICAgICAgICAgZGF0YVVybCA9IHVwbG9hZC5yZXN0b3JlRXhpZihhcnJheUJ1ZmZlclRvQmFzZTY0KHJlc3VsdC5maXhlZEFycmF5QnVmZmVyKSwgZGF0YVVybCk7XG4gICAgICAgICAgICB2YXIgYmxvYiA9IHVwbG9hZC5kYXRhVXJsdG9CbG9iKGRhdGFVcmwsIGZpbGUubmFtZSk7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGJsb2IpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBpbWcub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1nLnNyYyA9IHVybDtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGRlZmVycmVkLnJlamVjdChlKTtcbiAgICAgIH0pO1xuICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICBkZWZlcnJlZC5yZWplY3QoZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gIH07XG5cbiAgdXBsb2FkLnJlc3RvcmVFeGlmID0gZnVuY3Rpb24gKG9yaWcsIHJlc2l6ZWQpIHtcbiAgICB2YXIgRXhpZlJlc3RvcmVyID0ge307XG5cbiAgICBFeGlmUmVzdG9yZXIuS0VZX1NUUiA9ICdBQkNERUZHSElKS0xNTk9QJyArXG4gICAgICAnUVJTVFVWV1hZWmFiY2RlZicgK1xuICAgICAgJ2doaWprbG1ub3BxcnN0dXYnICtcbiAgICAgICd3eHl6MDEyMzQ1Njc4OSsvJyArXG4gICAgICAnPSc7XG5cbiAgICBFeGlmUmVzdG9yZXIuZW5jb2RlNjQgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgIHZhciBvdXRwdXQgPSAnJyxcbiAgICAgICAgY2hyMSwgY2hyMiwgY2hyMyA9ICcnLFxuICAgICAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0ID0gJycsXG4gICAgICAgIGkgPSAwO1xuXG4gICAgICBkbyB7XG4gICAgICAgIGNocjEgPSBpbnB1dFtpKytdO1xuICAgICAgICBjaHIyID0gaW5wdXRbaSsrXTtcbiAgICAgICAgY2hyMyA9IGlucHV0W2krK107XG5cbiAgICAgICAgZW5jMSA9IGNocjEgPj4gMjtcbiAgICAgICAgZW5jMiA9ICgoY2hyMSAmIDMpIDw8IDQpIHwgKGNocjIgPj4gNCk7XG4gICAgICAgIGVuYzMgPSAoKGNocjIgJiAxNSkgPDwgMikgfCAoY2hyMyA+PiA2KTtcbiAgICAgICAgZW5jNCA9IGNocjMgJiA2MztcblxuICAgICAgICBpZiAoaXNOYU4oY2hyMikpIHtcbiAgICAgICAgICBlbmMzID0gZW5jNCA9IDY0O1xuICAgICAgICB9IGVsc2UgaWYgKGlzTmFOKGNocjMpKSB7XG4gICAgICAgICAgZW5jNCA9IDY0O1xuICAgICAgICB9XG5cbiAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICtcbiAgICAgICAgICB0aGlzLktFWV9TVFIuY2hhckF0KGVuYzEpICtcbiAgICAgICAgICB0aGlzLktFWV9TVFIuY2hhckF0KGVuYzIpICtcbiAgICAgICAgICB0aGlzLktFWV9TVFIuY2hhckF0KGVuYzMpICtcbiAgICAgICAgICB0aGlzLktFWV9TVFIuY2hhckF0KGVuYzQpO1xuICAgICAgICBjaHIxID0gY2hyMiA9IGNocjMgPSAnJztcbiAgICAgICAgZW5jMSA9IGVuYzIgPSBlbmMzID0gZW5jNCA9ICcnO1xuICAgICAgfSB3aGlsZSAoaSA8IGlucHV0Lmxlbmd0aCk7XG5cbiAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcblxuICAgIEV4aWZSZXN0b3Jlci5yZXN0b3JlID0gZnVuY3Rpb24gKG9yaWdGaWxlQmFzZTY0LCByZXNpemVkRmlsZUJhc2U2NCkge1xuICAgICAgaWYgKG9yaWdGaWxlQmFzZTY0Lm1hdGNoKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcpKSB7XG4gICAgICAgIG9yaWdGaWxlQmFzZTY0ID0gb3JpZ0ZpbGVCYXNlNjQucmVwbGFjZSgnZGF0YTppbWFnZS9qcGVnO2Jhc2U2NCwnLCAnJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciByYXdJbWFnZSA9IHRoaXMuZGVjb2RlNjQob3JpZ0ZpbGVCYXNlNjQpO1xuICAgICAgdmFyIHNlZ21lbnRzID0gdGhpcy5zbGljZTJTZWdtZW50cyhyYXdJbWFnZSk7XG5cbiAgICAgIHZhciBpbWFnZSA9IHRoaXMuZXhpZk1hbmlwdWxhdGlvbihyZXNpemVkRmlsZUJhc2U2NCwgc2VnbWVudHMpO1xuXG4gICAgICByZXR1cm4gJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJyArIHRoaXMuZW5jb2RlNjQoaW1hZ2UpO1xuICAgIH07XG5cblxuICAgIEV4aWZSZXN0b3Jlci5leGlmTWFuaXB1bGF0aW9uID0gZnVuY3Rpb24gKHJlc2l6ZWRGaWxlQmFzZTY0LCBzZWdtZW50cykge1xuICAgICAgdmFyIGV4aWZBcnJheSA9IHRoaXMuZ2V0RXhpZkFycmF5KHNlZ21lbnRzKSxcbiAgICAgICAgbmV3SW1hZ2VBcnJheSA9IHRoaXMuaW5zZXJ0RXhpZihyZXNpemVkRmlsZUJhc2U2NCwgZXhpZkFycmF5KTtcbiAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShuZXdJbWFnZUFycmF5KTtcbiAgICB9O1xuXG5cbiAgICBFeGlmUmVzdG9yZXIuZ2V0RXhpZkFycmF5ID0gZnVuY3Rpb24gKHNlZ21lbnRzKSB7XG4gICAgICB2YXIgc2VnO1xuICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCBzZWdtZW50cy5sZW5ndGg7IHgrKykge1xuICAgICAgICBzZWcgPSBzZWdtZW50c1t4XTtcbiAgICAgICAgaWYgKHNlZ1swXSA9PT0gMjU1ICYgc2VnWzFdID09PSAyMjUpIC8vKGZmIGUxKVxuICAgICAgICB7XG4gICAgICAgICAgcmV0dXJuIHNlZztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIFtdO1xuICAgIH07XG5cblxuICAgIEV4aWZSZXN0b3Jlci5pbnNlcnRFeGlmID0gZnVuY3Rpb24gKHJlc2l6ZWRGaWxlQmFzZTY0LCBleGlmQXJyYXkpIHtcbiAgICAgIHZhciBpbWFnZURhdGEgPSByZXNpemVkRmlsZUJhc2U2NC5yZXBsYWNlKCdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LCcsICcnKSxcbiAgICAgICAgYnVmID0gdGhpcy5kZWNvZGU2NChpbWFnZURhdGEpLFxuICAgICAgICBzZXBhcmF0ZVBvaW50ID0gYnVmLmluZGV4T2YoMjU1LCAzKSxcbiAgICAgICAgbWFlID0gYnVmLnNsaWNlKDAsIHNlcGFyYXRlUG9pbnQpLFxuICAgICAgICBhdG8gPSBidWYuc2xpY2Uoc2VwYXJhdGVQb2ludCksXG4gICAgICAgIGFycmF5ID0gbWFlO1xuXG4gICAgICBhcnJheSA9IGFycmF5LmNvbmNhdChleGlmQXJyYXkpO1xuICAgICAgYXJyYXkgPSBhcnJheS5jb25jYXQoYXRvKTtcbiAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuXG5cbiAgICBFeGlmUmVzdG9yZXIuc2xpY2UyU2VnbWVudHMgPSBmdW5jdGlvbiAocmF3SW1hZ2VBcnJheSkge1xuICAgICAgdmFyIGhlYWQgPSAwLFxuICAgICAgICBzZWdtZW50cyA9IFtdO1xuXG4gICAgICB3aGlsZSAoMSkge1xuICAgICAgICBpZiAocmF3SW1hZ2VBcnJheVtoZWFkXSA9PT0gMjU1ICYgcmF3SW1hZ2VBcnJheVtoZWFkICsgMV0gPT09IDIxOCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyYXdJbWFnZUFycmF5W2hlYWRdID09PSAyNTUgJiByYXdJbWFnZUFycmF5W2hlYWQgKyAxXSA9PT0gMjE2KSB7XG4gICAgICAgICAgaGVhZCArPSAyO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBsZW5ndGggPSByYXdJbWFnZUFycmF5W2hlYWQgKyAyXSAqIDI1NiArIHJhd0ltYWdlQXJyYXlbaGVhZCArIDNdLFxuICAgICAgICAgICAgZW5kUG9pbnQgPSBoZWFkICsgbGVuZ3RoICsgMixcbiAgICAgICAgICAgIHNlZyA9IHJhd0ltYWdlQXJyYXkuc2xpY2UoaGVhZCwgZW5kUG9pbnQpO1xuICAgICAgICAgIHNlZ21lbnRzLnB1c2goc2VnKTtcbiAgICAgICAgICBoZWFkID0gZW5kUG9pbnQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhlYWQgPiByYXdJbWFnZUFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cztcbiAgICB9O1xuXG5cbiAgICBFeGlmUmVzdG9yZXIuZGVjb2RlNjQgPSBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgIHZhciBjaHIxLCBjaHIyLCBjaHIzID0gJycsXG4gICAgICAgIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQgPSAnJyxcbiAgICAgICAgaSA9IDAsXG4gICAgICAgIGJ1ZiA9IFtdO1xuXG4gICAgICAvLyByZW1vdmUgYWxsIGNoYXJhY3RlcnMgdGhhdCBhcmUgbm90IEEtWiwgYS16LCAwLTksICssIC8sIG9yID1cbiAgICAgIHZhciBiYXNlNjR0ZXN0ID0gL1teQS1aYS16MC05XFwrXFwvXFw9XS9nO1xuICAgICAgaWYgKGJhc2U2NHRlc3QuZXhlYyhpbnB1dCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1RoZXJlIHdlcmUgaW52YWxpZCBiYXNlNjQgY2hhcmFjdGVycyBpbiB0aGUgaW5wdXQgdGV4dC5cXG4nICtcbiAgICAgICAgICAnVmFsaWQgYmFzZTY0IGNoYXJhY3RlcnMgYXJlIEEtWiwgYS16LCAwLTksICcgKyAnLCAnIC8gJyxhbmQgXCI9XCJcXG4nICtcbiAgICAgICAgICAnRXhwZWN0IGVycm9ycyBpbiBkZWNvZGluZy4nKTtcbiAgICAgIH1cbiAgICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICAgICAgZG8ge1xuICAgICAgICBlbmMxID0gdGhpcy5LRVlfU1RSLmluZGV4T2YoaW5wdXQuY2hhckF0KGkrKykpO1xuICAgICAgICBlbmMyID0gdGhpcy5LRVlfU1RSLmluZGV4T2YoaW5wdXQuY2hhckF0KGkrKykpO1xuICAgICAgICBlbmMzID0gdGhpcy5LRVlfU1RSLmluZGV4T2YoaW5wdXQuY2hhckF0KGkrKykpO1xuICAgICAgICBlbmM0ID0gdGhpcy5LRVlfU1RSLmluZGV4T2YoaW5wdXQuY2hhckF0KGkrKykpO1xuXG4gICAgICAgIGNocjEgPSAoZW5jMSA8PCAyKSB8IChlbmMyID4+IDQpO1xuICAgICAgICBjaHIyID0gKChlbmMyICYgMTUpIDw8IDQpIHwgKGVuYzMgPj4gMik7XG4gICAgICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG5cbiAgICAgICAgYnVmLnB1c2goY2hyMSk7XG5cbiAgICAgICAgaWYgKGVuYzMgIT09IDY0KSB7XG4gICAgICAgICAgYnVmLnB1c2goY2hyMik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuYzQgIT09IDY0KSB7XG4gICAgICAgICAgYnVmLnB1c2goY2hyMyk7XG4gICAgICAgIH1cblxuICAgICAgICBjaHIxID0gY2hyMiA9IGNocjMgPSAnJztcbiAgICAgICAgZW5jMSA9IGVuYzIgPSBlbmMzID0gZW5jNCA9ICcnO1xuXG4gICAgICB9IHdoaWxlIChpIDwgaW5wdXQubGVuZ3RoKTtcblxuICAgICAgcmV0dXJuIGJ1ZjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEV4aWZSZXN0b3Jlci5yZXN0b3JlKG9yaWcsIHJlc2l6ZWQpOyAgLy88PSBFWElGXG4gIH07XG5cbiAgcmV0dXJuIHVwbG9hZDtcbn1dKTtcblxuIiwicmVxdWlyZSgnLi9kaXN0L25nLWZpbGUtdXBsb2FkLWFsbCcpO1xubW9kdWxlLmV4cG9ydHMgPSAnbmdGaWxlVXBsb2FkJzsiLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbmltcG9ydCByb3V0aW5nIGZyb20gJy4vY29uZmlnL3JvdXRpbmcnO1xuaW1wb3J0IGh0dHAgZnJvbSAnLi9jb25maWcvaHR0cCc7XG5cbmltcG9ydCBIb21lTW9kdWxlIGZyb20gJy4vbW9kdWxlcy9ob21lLyc7XG5pbXBvcnQgR2FsbGVyeU1vZHVsZSBmcm9tICcuL21vZHVsZXMvZ2FsbGVyeS8nXG5cbnZhciBtb2R1bGVzID0gW0hvbWVNb2R1bGUsIEdhbGxlcnlNb2R1bGVdO1xuXG52YXIgYXBwID0gYW5ndWxhclxuICAgIC5tb2R1bGUoJ2FwcCcsIG1vZHVsZXMpXG4gICAgLmNvbmZpZyhyb3V0aW5nKVxuICAgIC5jb25maWcoaHR0cCk7XG5cbiIsImh0dHAuJGluamVjdCA9IFsnJGh0dHBQcm92aWRlciddO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBodHRwKCRodHRwUHJvdmlkZXIpIHtcblx0JGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaCgoKSA9PiB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdCdyZXF1ZXN0JzogZnVuY3Rpb24oY29uZmlnKSB7XG5cdFx0ICAgIFx0Y29uZmlnLmhlYWRlcnMuQXV0aG9yaXphdGlvbiA9ICdCZWFyZXI6ICcgKyB3aW5kb3cuYWNjZXNzX3Rva2VuO1xuXG5cdFx0ICAgIFx0cmV0dXJuIGNvbmZpZztcblx0XHQgICAgfVxuXHRcdH1cblx0fSk7XG59Iiwicm91dGluZy4kaW5qZWN0ID0gWyckdXJsUm91dGVyUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGluZygkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbGxlcnlDcmVhdGVDb250cm9sbGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKCRzY29wZSkge1xuICAgICAgICAkc2NvcGUubWVzc2FnZSA9ICdjcmVhdGUgbmV3IGdhbGxlcnknO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FsbGVyeUxpc3RDb250cm9sbGVyIHtcblxuXHRnYWxsZXJpZXMgPSBbXTtcblxuICAgIG5ld0dhbGxlcnkgPSB7fTtcblxuICAgIGNvbnN0cnVjdG9yKEFQSSkge1xuICAgIFx0dGhpcy5BUEkgPSBBUEk7XG5cbiAgICBcdHRoaXMubG9hZEdhbGxlcnkoKTtcbiAgICB9XG5cbiAgICBsb2FkR2FsbGVyeSgpIHtcbiAgICBcdHRoaXMuQVBJLmdhbGxlcnkuZ2V0KCkuJHByb21pc2UudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgXHR0aGlzLmdhbGxlcmllcyA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uU3VibWl0TmV3KCkge1xuICAgICAgICBjb25zb2xlLmxvZygneW8nKTtcbiAgICAgICAgdGhpcy5BUEkuZ2FsbGVyeS5zYXZlKHt9LCB0aGlzLm5ld0dhbGxlcnkpLiRwcm9taXNlLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxvYWRHYWxsZXJ5KCk7XG4gICAgICAgICAgICB0aGlzLm5ld0dhbGxlcnkgPSB7fTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25EZWxldGVHYWxsZXJ5KGdhbGxlcnlJZClcbiAgICB7XG4gICAgICAgIHRoaXMuQVBJLmdhbGxlcnkuZGVsZXRlKHtpZDogZ2FsbGVyeUlkfSkuJHByb21pc2UudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIHRoaXMubG9hZEdhbGxlcnkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIEdhbGxlcnlNYW5hZ2VDb250cm9sbGVyIHtcblx0Z2FsbGVyeSA9IHt9XG5cdGZpbGVzID0gW11cblx0dGl0bGUgPSAnJ1xuXHRwcm9ncmVzcyA9IG51bGxcblx0XG4gICAgY29uc3RydWN0b3IoQVBJLCBVcGxvYWQsICRzdGF0ZVBhcmFtcykge1xuICAgIFx0dGhpcy5BUEkgPSBBUEk7XG4gICAgXHR0aGlzLmxvYWRHYWxsZXJ5KCRzdGF0ZVBhcmFtcy5nYWxsZXJ5X2lkKTtcbiAgICBcdHRoaXMuVXBsb2FkID0gVXBsb2FkO1xuICAgIH1cblxuICAgIGxvYWRHYWxsZXJ5KGdhbGxlcnlJZCkge1xuICAgIFx0dGhpcy5BUEkuZ2FsbGVyeS5nZXQoe2lkOiBnYWxsZXJ5SWR9KS4kcHJvbWlzZS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgIFx0XHR0aGlzLmdhbGxlcnkgPSByZXNwb25zZS5kYXRhO1xuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgb25TdWJtaXRQaG90bygpIHtcbiAgICBcdHRoaXMuVXBsb2FkLnVwbG9hZCh7XG4gICAgICAgICAgICB1cmw6IGAke3dpbmRvdy5hcGlfdXJsfS9nYWxsZXJ5LyR7dGhpcy5nYWxsZXJ5LmlkfS9waG90b3NgICxcbiAgICAgICAgICAgIGRhdGE6IHtwaG90bzogdGhpcy5maWxlLCAndGl0bGUnOiB0aGlzLnRpdGxlfSxcbiAgICAgICAgICAgIGhlYWRlcnM6IHtBdXRob3JpemF0aW9uOiBgQmVhcmVyOiAke3dpbmRvdy5hY2Nlc3NfdG9rZW59YH1cbiAgICAgICAgfSkudGhlbigocmVzcCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1N1Y2Nlc3MgJyArIHJlc3AuY29uZmlnLmRhdGEucGhvdG8ubmFtZSArICd1cGxvYWRlZC4gUmVzcG9uc2U6ICcgKyByZXNwLmRhdGEpO1xuICAgICAgICAgICAgdGhpcy5maWxlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMucHJvZ3Jlc3MgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy50aXRsZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmxvYWRHYWxsZXJ5KHRoaXMuZ2FsbGVyeS5pZCk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igc3RhdHVzOiAnICsgcmVzcC5zdGF0dXMpO1xuICAgICAgICB9LCAoZXZ0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnByb2dyZXNzID0gcGFyc2VJbnQoMTAwLjAgKiBldnQubG9hZGVkIC8gZXZ0LnRvdGFsKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25TZXREZWZhdWx0UGhvdG8ocGhvdG9JZCkge1xuICAgIFx0dGhpcy5BUEkuZ2FsbGVyeS51cGRhdGUoe2lkOnRoaXMuZ2FsbGVyeS5pZH0sIHtkZWZhdWx0X3Bob3RvOnBob3RvSWR9KS4kcHJvbWlzZVxuICAgIFx0LnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgXHRcdHRoaXMubG9hZEdhbGxlcnkodGhpcy5nYWxsZXJ5LmlkKTtcbiAgICBcdH0pO1xuICAgIH1cblxuICAgIG9uRGVsZXRlUGhvdG8ocGhvdG9JZCkge1xuICAgIFx0dGhpcy5BUEkucGhvdG9zLmRlbGV0ZSh7Z2FsbGVyeUlkOnRoaXMuZ2FsbGVyeS5pZCwgcGhvdG9JZDpwaG90b0lkfSkuJHByb21pc2VcbiAgICBcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgIFx0XHR0aGlzLmxvYWRHYWxsZXJ5KHRoaXMuZ2FsbGVyeS5pZCk7XG4gICAgXHR9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbmltcG9ydCB1aXJvdXRlciBmcm9tICdhbmd1bGFyLXVpLXJvdXRlcic7XG5pbXBvcnQgQVBJIGZyb20gJy4uLy4uL3NlcnZpY2VzL0FQSSc7XG5pbXBvcnQgcm91dGluZyBmcm9tICcuL3JvdXRlcyc7XG5pbXBvcnQgbmdGaWxlVXBsb2FkIGZyb20gJ25nLWZpbGUtdXBsb2FkJztcblxuXG5pbXBvcnQgR2FsbGVyeUxpc3RDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvZ2FsbGVyeS5saXN0LmNvbnRyb2xsZXInO1xuaW1wb3J0IEdhbGxlcnlDcmVhdGVDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvZ2FsbGVyeS5jcmVhdGUuY29udHJvbGxlcic7XG5pbXBvcnQgR2FsbGVyeU1hbmFnZUNvbnRyb2xsZXIgZnJvbSAnLi9jb250cm9sbGVycy9nYWxsZXJ5Lm1hbmFnZS5jb250cm9sbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgYW5ndWxhci5tb2R1bGUoJ2FwcC5nYWxsZXJ5JywgW3Vpcm91dGVyLCBBUEksIG5nRmlsZVVwbG9hZF0pXG5cdC5jb25maWcocm91dGluZylcblx0LmNvbnRyb2xsZXIoJ0dhbGxlcnlMaXN0Q29udHJvbGxlcicsIEdhbGxlcnlMaXN0Q29udHJvbGxlcilcblx0LmNvbnRyb2xsZXIoJ0dhbGxlcnlDcmVhdGVDb250cm9sbGVyJywgR2FsbGVyeUNyZWF0ZUNvbnRyb2xsZXIpXG5cdC5jb250cm9sbGVyKCdHYWxsZXJ5TWFuYWdlQ29udHJvbGxlcicsIEdhbGxlcnlNYW5hZ2VDb250cm9sbGVyKVxuXHQubmFtZTsiLCJyb3V0ZXMuJGluamVjdCA9IFsnJHN0YXRlUHJvdmlkZXInXTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcm91dGVzKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdGNvbnN0IGdhbGxlcnlBYnN0cmFjdFN0YXRlID0ge1xuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdG5hbWU6ICdnYWxsZXJ5Jyxcblx0XHR1cmw6ICcvZ2FsbGVyeScsXG5cdFx0J3RlbXBsYXRlJzogJzx1aS12aWV3PjwvdWktdmlldz4nXG5cdH07XG5cblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoZ2FsbGVyeUFic3RyYWN0U3RhdGUpO1xuICBcdFxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSh7XG4gIFx0bmFtZTogJ2dhbGxlcnkubGlzdCcsXG4gIFx0cGFyZW50OiBnYWxsZXJ5QWJzdHJhY3RTdGF0ZSxcbiAgXHR1cmw6ICcvbGlzdCcsXG4gIFx0dGVtcGxhdGU6IHJlcXVpcmUoJy4vdmlld3MvZ2FsbGVyeS5saXN0Lmh0bWwnKSxcbiAgXHRjb250cm9sbGVyOiAnR2FsbGVyeUxpc3RDb250cm9sbGVyJyxcbiAgXHRjb250cm9sbGVyQXM6ICckY29udHJvbGxlcidcblx0fSk7XG5cblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoe1xuICBcdG5hbWU6ICdnYWxsZXJ5LmNyZWF0ZScsXG4gIFx0cGFyZW50OiBnYWxsZXJ5QWJzdHJhY3RTdGF0ZSxcbiAgXHR1cmw6ICcvY3JlYXRlJyxcbiAgXHR0ZW1wbGF0ZTogcmVxdWlyZSgnLi92aWV3cy9nYWxsZXJ5LmNyZWF0ZS5odG1sJyksXG4gIFx0Y29udHJvbGxlcjogJ0dhbGxlcnlDcmVhdGVDb250cm9sbGVyJyxcbiAgXHRjb250cm9sbGVyQXM6ICckY29udHJvbGxlcidcblx0fSk7XG5cbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoe1xuICAgIG5hbWU6ICdnYWxsZXJ5Lm1hbmFnZScsXG4gICAgcGFyZW50OiBnYWxsZXJ5QWJzdHJhY3RTdGF0ZSxcbiAgICB1cmw6ICcvbWFuYWdlL3tnYWxsZXJ5X2lkfScsXG4gICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdmlld3MvZ2FsbGVyeS5tYW5hZ2UuaHRtbCcpLFxuICAgIGNvbnRyb2xsZXI6ICdHYWxsZXJ5TWFuYWdlQ29udHJvbGxlcicsXG4gICAgY29udHJvbGxlckFzOiAnJGNvbnRyb2xsZXInXG4gIH0pXG59IiwibW9kdWxlLmV4cG9ydHMgPSBcIjxoMT57eyRjb250cm9sbGVyLm1lc3NhZ2V9fTwvaDE+c3R3w7NyeiBub3fEhVwiO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBcIjxzZWN0aW9uIGNsYXNzPWNvbnRlbnQtaGVhZGVyPjxoMT5SZWFsaXphY2plIDxzbWFsbD5QYW5lbCB6YXJ6xIVkemFuaWE8L3NtYWxsPjwvaDE+PG9sIGNsYXNzPWJyZWFkY3J1bWI+PGxpPjxhIGhyZWY9XFxcIi9cXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1kYXNoYm9hcmRcXFwiPjwvaT4gU3Ryb25hIGfFgsOzd25hPC9hPjwvbGk+PGxpIGNsYXNzPWFjdGl2ZT5SZWFsaXphY2plPC9saT48L29sPjwvc2VjdGlvbj48c2VjdGlvbiBjbGFzcz1jb250ZW50PjxkaXYgY2xhc3M9cm93Pjx1bCBjbGFzcz10aW1lbGluZT48bGkgbmctcmVwZWF0PVxcXCJnYWxsZXJ5IGluICRjb250cm9sbGVyLmdhbGxlcmllcyB0cmFjayBieSBnYWxsZXJ5LmlkXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2FtZXJhIGJnLXB1cnBsZVxcXCI+PC9pPjxkaXYgY2xhc3M9dGltZWxpbmUtaXRlbT48c3BhbiBjbGFzcz10aW1lPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IHt7IGdhbGxlcnkuY3JlYXRlZF9hdCB9fTwvc3Bhbj48aDMgY2xhc3M9dGltZWxpbmUtaGVhZGVyPjxhIHVpLXNyZWY9XFxcImdhbGxlcnkubWFuYWdlKHtnYWxsZXJ5X2lkOiBnYWxsZXJ5LmlkfSlcXFwiIG5nLWJpbmQ9Z2FsbGVyeS5uYW1lPjwvYT4ge3sgZ2FsbGVyeS5kZXNjcmlwdGlvbiB8IGxpbWl0VG86IDQwIH19e3tnYWxsZXJ5LmRlc2NyaXB0aW9uLmxlbmd0aCA+IDQwID8gJy4uLicgOiAnJ319IDxhIHVpLXNyZWY9XFxcImdhbGxlcnkubWFuYWdlKHtnYWxsZXJ5X2lkOiBnYWxsZXJ5LmlkfSlcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+PC9hPiA8YSBuZy1jbGljaz0kY29udHJvbGxlci5vbkRlbGV0ZUdhbGxlcnkoZ2FsbGVyeS5pZCk+PGkgY2xhc3M9XFxcImZhIGZhLXJlbW92ZSByZWRcXFwiPjwvaT48L2E+PC9oMz48ZGl2PjxpbWcgbmctcmVwZWF0PVxcXCJwaG90byBpbiBnYWxsZXJ5LnBob3RvcyB0cmFjayBieSBwaG90by5pZFxcXCIgbmctc3JjPXt7cGhvdG8ucGF0aC5taW5pfX0gY2xhc3M9bWFyZ2luPjwvZGl2PjwvZGl2PjwvbGk+PC91bD48L2Rpdj48ZGl2IGNsYXNzPXJvdz48ZGl2IGNsYXNzPWNvbC1tZC02PjxkaXYgY2xhc3M9XFxcImJveCBib3gtcHJpbWFyeVxcXCI+PGZvcm0gcm9sZT1mb3JtIG5nLXN1Ym1pdD0kY29udHJvbGxlci5vblN1Ym1pdE5ldygpPjxkaXYgY2xhc3M9XFxcImJveC1oZWFkZXIgd2l0aC1ib3JkZXJcXFwiPjxoMyBjbGFzcz1ib3gtdGl0bGU+U3R3w7NyeiBub3fEhSByZWFsaXphY2rEmTwvaDM+PC9kaXY+PGRpdiBjbGFzcz1ib3gtYm9keT48ZGl2IGNsYXNzPWZvcm0tZ3JvdXA+PGxhYmVsIGZvcj10aXRsZT5UeXR1xYIgZ2FsZXJpaTwvbGFiZWw+PGlucHV0IGNsYXNzPWZvcm0tY29udHJvbCBpZD10aXRsZSBwbGFjZWhvbGRlcj1cXFwiV3Bpc3ogdHl0dcWCXFxcIiBuZy1tb2RlbD0kY29udHJvbGxlci5uZXdHYWxsZXJ5Lm5hbWU+PC9kaXY+PGRpdiBjbGFzcz1mb3JtLWdyb3VwPjx0ZXh0YXJlYSBjbGFzcz1mb3JtLWNvbnRyb2wgbmctbW9kZWw9JGNvbnRyb2xsZXIubmV3R2FsbGVyeS5kZXNjcmlwdGlvbiBwbGFjZWhvbGRlcj1cXFwiUG9kYWogb3BpcyByZWFsaXphY2ppXFxcIj5cXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RleHRhcmVhPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9Ym94LWZvb3Rlcj48YnV0dG9uIHR5cGU9c3VibWl0IGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnlcXFwiPkRvZGFqPC9idXR0b24+PC9kaXY+PC9mb3JtPjwvZGl2PjwvZGl2PjwvZGl2Pjwvc2VjdGlvbj5cIjtcbiIsIm1vZHVsZS5leHBvcnRzID0gXCI8c2VjdGlvbiBjbGFzcz1jb250ZW50LWhlYWRlcj48aDEgbmctYmluZD0kY29udHJvbGxlci5nYWxsZXJ5Lm5hbWU+PC9oMT48b2wgY2xhc3M9YnJlYWRjcnVtYj48bGk+PGEgdWktc3JlZj1ob21lPjxpIGNsYXNzPVxcXCJmYSBmYS1kYXNoYm9hcmRcXFwiPjwvaT4gU3Ryb25hIGfFgsOzd25hPC9hPjwvbGk+PGxpPjxhIHVpLXNyZWY9Z2FsbGVyeS5saXN0PlJlYWxpemFjamU8L2E+PC9saT48bGkgY2xhc3M9YWN0aXZlPnt7ICRjb250cm9sbGVyLmdhbGxlcnkubmFtZSB9fTwvbGk+PC9vbD48L3NlY3Rpb24+PHNlY3Rpb24gY2xhc3M9Y29udGVudD48ZGl2IGNsYXNzPWJveD48ZGl2IGNsYXNzPVxcXCJib3gtaGVhZGVyIHdpdGgtYm9yZGVyXFxcIj48aDMgY2xhc3M9Ym94LXRpdGxlPlphcnrEhWR6YWogZ2FsZXJpxIU8L2gzPjwvZGl2PjxkaXYgY2xhc3M9Ym94LWJvZHk+PGRpdiBjbGFzcz1cXFwiYm94LXRvb2xzIHB1bGwtcmlnaHRcXFwiPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tYm94LXRvb2xcXFwiIGRhdGEtd2lkZ2V0PWNvbGxhcHNlIGRhdGEtdG9nZ2xlPXRvb2x0aXAgdGl0bGU9ZWR5dHVqPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+PC9idXR0b24+PC9kaXY+PGRpdiBpZD1kZXNjcmlwdGlvbiBuZy1iaW5kPSRjb250cm9sbGVyLmdhbGxlcnkuZGVzY3JpcHRpb24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1ib3gtZm9vdGVyPjxkaXYgaWQ9cGhvdG9zIGNsYXNzPXJvdz48ZGl2IG5nLXJlcGVhdD1cXFwicGhvdG8gaW4gJGNvbnRyb2xsZXIuZ2FsbGVyeS5waG90b3MgdHJhY2sgYnkgcGhvdG8uaWRcXFwiIGNsYXNzPVxcXCJjb2wtbGctNCBjb2wtbWQtNiBjb2wteHMtNiB0aHVtYiB0ZXh0LWNlbnRlclxcXCIgc3R5bGU9XFxcImhlaWdodDogMjUwcHhcXFwiIG5nLWNsYXNzPVxcXCIkY29udHJvbGxlci5nYWxsZXJ5LmRlZmF1bHRfcGhvdG8gPT09IHBob3RvLmlkID8gJ2RlZmF1bHQnIDogJydcXFwiPjxkaXYgY2xhc3M9cGhvdG8tZWxlbWVudD48aW1nIG5nLXNyYz17e3Bob3RvLnBhdGgubWluaX19Pjxicj48YSBuZy1jbGljaz0kY29udHJvbGxlci5vbkRlbGV0ZVBob3RvKHBob3RvLmlkKSBocmVmPSM+PGkgY2xhc3M9XFxcImZhIGZhLXJlbW92ZVxcXCIgdGl0bGU9dXN1xYQ+PC9pPjwvYT4gPGEgbmctY2xpY2s9JGNvbnRyb2xsZXIub25TZXREZWZhdWx0UGhvdG8ocGhvdG8uaWQpIGhyZWY9IyBuZy1zaG93PVxcXCIkY29udHJvbGxlci5nYWxsZXJ5LmRlZmF1bHRfcGhvdG8gIT09IHBob3RvLmlkXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2hlY2stc3F1YXJlLW9cXFwiIHRpdGxlPVxcXCJ1c3RhdyBqYWtvIGRvbXnFm2xuZVxcXCI+PC9pPjwvYT48L2Rpdj48YnI+PHNwYW4gbmctYmluZD1waG90by50aXRsZT48L3NwYW4+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1yb3c+PGRpdiBjbGFzcz1jb2wtbWQtNj48Zm9ybSByb2xlPWZvcm0gbmctc3VibWl0PSRjb250cm9sbGVyLm9uU3VibWl0UGhvdG8oKT48ZGl2IGNsYXNzPVxcXCJib3ggYm94LXByaW1hcnlcXFwiPjxkaXYgY2xhc3M9XFxcImJveC1oZWFkZXIgd2l0aC1ib3JkZXJcXFwiPjxoMyBjbGFzcz1ib3gtdGl0bGU+RG9kYWogemRqxJljaWU8L2gzPjwvZGl2PjxkaXYgY2xhc3M9Ym94LWJvZHk+PGRpdiBjbGFzcz1mb3JtLWdyb3VwPjxsYWJlbCBmb3I9dGl0bGU+VHl0dcWCIHpkasSZY2lhPC9sYWJlbD48aW5wdXQgY2xhc3M9Zm9ybS1jb250cm9sIGlkPXRpdGxlIHBsYWNlaG9sZGVyPVxcXCJXcGlzeiB0eXR1xYJcXFwiIG5nLW1vZGVsPSRjb250cm9sbGVyLnRpdGxlPjwvZGl2PjxkaXYgY2xhc3M9Zm9ybS1ncm91cCBpZD1maWxlLXVwbG9hZGVyIG5nZi1kcm9wIG5nLW1vZGVsPSRjb250cm9sbGVyLmZpbGUgbmdmLWRyYWctb3Zlci1jbGFzcz1cXFwiJ2ZpbGUtb3ZlcidcXFwiIG5nZi1tdWx0aXBsZT1mYWxzZSBuZ2YtcGF0dGVybj1cXFwiJ2ltYWdlLyonXFxcIiBuZ2YtbWF4LXNpemU9MzBNQiBuZ2YtYWNjZXB0PVxcXCInaW1hZ2UvKidcXFwiPjxsYWJlbCBmb3I9cGhvdG8+RmlsZSBpbnB1dDwvbGFiZWw+PGlucHV0IHR5cGU9ZmlsZSBjbGFzcz1idXR0b24gbmdmLXNlbGVjdCBuZy1tb2RlbD0kY29udHJvbGxlci5maWxlIG5hbWU9ZmlsZSBuZ2YtcGF0dGVybj1cXFwiJ2ltYWdlLyonXFxcIiBuZ2YtYWNjZXB0PVxcXCInaW1hZ2UvKidcXFwiIG5nZi1tYXgtc2l6ZT0zME1CIG5nZi1taW4taGVpZ2h0PTEwMD4gU2VsZWN0PC9kaXY+PHAgY2xhc3M9aGVscC1ibG9jaz5XeWJpZXJ6IHpkasSZY2llIChtYXggMyBNYikuPC9wPjxpbWcgY2xhc3M9dGh1bWIgc3R5bGU9XFxcIm1heC13aWR0aDogMzUwcHhcXFwiIG5nZi10aHVtYm5haWw9JGNvbnRyb2xsZXIuZmlsZT48L2Rpdj48ZGl2IGNsYXNzPWJveC1mb290ZXI+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgcHJvZ3Jlc3Mtc21cXFwiIG5nLXNob3c9JGNvbnRyb2xsZXIucHJvZ3Jlc3M+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1kYW5nZXIgcHJvZ3Jlc3MtYmFyLXN0cmlwZWRcXFwiIHJvbGU9cHJvZ3Jlc3NiYXIgYXJpYS12YWx1ZW5vdz17eyRjb250cm9sbGVyLnByb2dyZXNzfX0gYXJpYS12YWx1ZW1pbj0wIGFyaWEtdmFsdWVtYXg9MTAwIHN0eWxlPVxcXCJ3aWR0aDoge3skY29udHJvbGxlci5wcm9ncmVzc319JVxcXCI+PHNwYW4gY2xhc3M9c3Itb25seT57eyRjb250cm9sbGVyLnByb2dyZXNzfX0lPC9zcGFuPjwvZGl2PjwvZGl2PjxidXR0b24gdHlwZT1zdWJtaXQgY2xhc3M9XFxcImJ0biBidG4tcHJpbWFyeVxcXCI+RG9kYWo8L2J1dHRvbj48L2Rpdj48L2Rpdj48L2Zvcm0+PC9kaXY+PC9kaXY+PC9zZWN0aW9uPjxzdHlsZT4jZmlsZS11cGxvYWRlciB7XFxufVxcbiNmaWxlLXVwbG9hZGVyLmZpbGUtb3ZlciB7XFxuXFx0Ym9yZGVyOiAxcHggZGFzaGVkIGdyYXk7XFxufVxcbiNmaWxlLXVwbG9hZGVyIGltZyB7XFxuXFx0bWF4LXdpZHRoOiAzNTBweDtcXG5cXHRtYXgtaGVpZ2h0OiAyNTBweDtcXG59XFxuXFxuZGl2I3Bob3RvcyBkaXYuZGVmYXVsdCBpbWcge1xcblxcdGJvcmRlcjogMnB4IHNvbGlkIGdyZWVuO1xcbn1cXG5cXG5kaXYucGhvdG8tZWxlbWVudCB7XFxuXFx0cG9zaXRpb246IHJlbGF0aXZlO1xcblxcdGRpc3BsYXk6IGlubGluZS1ibG9jaztcXG59XFxuZGl2LnBob3RvLWVsZW1lbnQgaSB7XFxuXFx0Y29sb3I6ICMwMDA7XFxufVxcblxcbmRpdi5waG90by1lbGVtZW50IGkuZmEtcmVtb3ZlIHtcXG5cXHRwb3NpdGlvbjogYWJzb2x1dGU7XFxuXFx0dG9wOiA1cHg7XFxuXFx0cmlnaHQ6IDVweDtcXG59XFxuXFxuZGl2LnBob3RvLWVsZW1lbnQgaS5mYS1jaGVjay1zcXVhcmUtbyB7XFxuXFx0cG9zaXRpb246IGFic29sdXRlO1xcblxcdHRvcDogNXB4O1xcblxcdHJpZ2h0OiAyNXB4O1xcbn1cXG5cXG5kaXYucGhvdG8tZWxlbWVudCBpLmZhLXJlbW92ZTpob3ZlciB7XFxuXFx0Y29sb3I6IHJlZDtcXG59XFxuXFxuZGl2LnBob3RvLWVsZW1lbnQgaS5mYS1jaGVjay1zcXVhcmUtbzpob3ZlciB7XFxuXFx0Y29sb3I6ICM0YWFkM2I7XFxufTwvc3R5bGU+XCI7XG4iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyBIb21lQ29udHJvbGxlciB7XG5cbiAgICBjb25zdHJ1Y3Rvcigkc2NvcGUpIHtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSAnd2VsY29tZSBob21lJztcbiAgICB9XG5cbn1cbiIsImltcG9ydCBhbmd1bGFyIGZyb20gJ2FuZ3VsYXInO1xuaW1wb3J0IHVpcm91dGVyIGZyb20gJ2FuZ3VsYXItdWktcm91dGVyJztcblxuaW1wb3J0IHJvdXRpbmcgZnJvbSAnLi9yb3V0ZXMnO1xuaW1wb3J0IEhvbWVDb250cm9sbGVyIGZyb20gJy4vY29udHJvbGxlcnMvaG9tZS5jb250cm9sbGVyJztcblxuZXhwb3J0IGRlZmF1bHQgYW5ndWxhci5tb2R1bGUoJ2FwcC5ob21lJywgW3Vpcm91dGVyXSlcbiAgLmNvbmZpZyhyb3V0aW5nKVxuICAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBIb21lQ29udHJvbGxlcilcbiAgLm5hbWU7Iiwicm91dGVzLiRpbmplY3QgPSBbJyRzdGF0ZVByb3ZpZGVyJ107XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJvdXRlcygkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgIHVybDogJy8nLFxuICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdmlld3MvaG9tZS5odG1sJyksXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInLFxuICAgICAgY29udHJvbGxlckFzOiAnaG9tZSdcbiAgICB9KTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IFwiPHNlY3Rpb24gY2xhc3M9Y29udGVudC1oZWFkZXI+PGgxPkRhc2hib2FyZCA8c21hbGw+Q29udHJvbCBwYW5lbDwvc21hbGw+PC9oMT48b2wgY2xhc3M9YnJlYWRjcnVtYj48bGk+PGEgaHJlZj0jPjxpIGNsYXNzPVxcXCJmYSBmYS1kYXNoYm9hcmRcXFwiPjwvaT4gSG9tZTwvYT48L2xpPjxsaSBjbGFzcz1hY3RpdmU+RGFzaGJvYXJkPC9saT48L29sPjwvc2VjdGlvbj48c2VjdGlvbiBjbGFzcz1jb250ZW50PjxkaXYgY2xhc3M9cm93PjxkaXYgY2xhc3M9XFxcImNvbC1sZy0zIGNvbC14cy02XFxcIj48ZGl2IGNsYXNzPVxcXCJzbWFsbC1ib3ggYmctYXF1YVxcXCI+PGRpdiBjbGFzcz1pbm5lcj48aDM+MTUwPC9oMz48cD5OZXcgT3JkZXJzPC9wPjwvZGl2PjxkaXYgY2xhc3M9aWNvbj48aSBjbGFzcz1cXFwiaW9uIGlvbi1iYWdcXFwiPjwvaT48L2Rpdj48YSBocmVmPSMgY2xhc3M9c21hbGwtYm94LWZvb3Rlcj5Nb3JlIGluZm8gPGkgY2xhc3M9XFxcImZhIGZhLWFycm93LWNpcmNsZS1yaWdodFxcXCI+PC9pPjwvYT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjb2wtbGctMyBjb2wteHMtNlxcXCI+PGRpdiBjbGFzcz1cXFwic21hbGwtYm94IGJnLWdyZWVuXFxcIj48ZGl2IGNsYXNzPWlubmVyPjxoMz41MzxzdXAgc3R5bGU9XFxcImZvbnQtc2l6ZTogMjBweFxcXCI+JTwvc3VwPjwvaDM+PHA+Qm91bmNlIFJhdGU8L3A+PC9kaXY+PGRpdiBjbGFzcz1pY29uPjxpIGNsYXNzPVxcXCJpb24gaW9uLXN0YXRzLWJhcnNcXFwiPjwvaT48L2Rpdj48YSBocmVmPSMgY2xhc3M9c21hbGwtYm94LWZvb3Rlcj5Nb3JlIGluZm8gPGkgY2xhc3M9XFxcImZhIGZhLWFycm93LWNpcmNsZS1yaWdodFxcXCI+PC9pPjwvYT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjb2wtbGctMyBjb2wteHMtNlxcXCI+PGRpdiBjbGFzcz1cXFwic21hbGwtYm94IGJnLXllbGxvd1xcXCI+PGRpdiBjbGFzcz1pbm5lcj48aDM+NDQ8L2gzPjxwPlVzZXIgUmVnaXN0cmF0aW9uczwvcD48L2Rpdj48ZGl2IGNsYXNzPWljb24+PGkgY2xhc3M9XFxcImlvbiBpb24tcGVyc29uLWFkZFxcXCI+PC9pPjwvZGl2PjxhIGhyZWY9IyBjbGFzcz1zbWFsbC1ib3gtZm9vdGVyPk1vcmUgaW5mbyA8aSBjbGFzcz1cXFwiZmEgZmEtYXJyb3ctY2lyY2xlLXJpZ2h0XFxcIj48L2k+PC9hPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImNvbC1sZy0zIGNvbC14cy02XFxcIj48ZGl2IGNsYXNzPVxcXCJzbWFsbC1ib3ggYmctcmVkXFxcIj48ZGl2IGNsYXNzPWlubmVyPjxoMz42NTwvaDM+PHA+VW5pcXVlIFZpc2l0b3JzPC9wPjwvZGl2PjxkaXYgY2xhc3M9aWNvbj48aSBjbGFzcz1cXFwiaW9uIGlvbi1waWUtZ3JhcGhcXFwiPjwvaT48L2Rpdj48YSBocmVmPSMgY2xhc3M9c21hbGwtYm94LWZvb3Rlcj5Nb3JlIGluZm8gPGkgY2xhc3M9XFxcImZhIGZhLWFycm93LWNpcmNsZS1yaWdodFxcXCI+PC9pPjwvYT48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPXJvdz48c2VjdGlvbiBjbGFzcz1cXFwiY29sLWxnLTcgY29ubmVjdGVkU29ydGFibGVcXFwiPjxkaXYgY2xhc3M9bmF2LXRhYnMtY3VzdG9tPjx1bCBjbGFzcz1cXFwibmF2IG5hdi10YWJzIHB1bGwtcmlnaHRcXFwiPjxsaSBjbGFzcz1hY3RpdmU+PGEgaHJlZj0jcmV2ZW51ZS1jaGFydCBkYXRhLXRvZ2dsZT10YWI+QXJlYTwvYT48L2xpPjxsaT48YSBocmVmPSNzYWxlcy1jaGFydCBkYXRhLXRvZ2dsZT10YWI+RG9udXQ8L2E+PC9saT48bGkgY2xhc3M9XFxcInB1bGwtbGVmdCBoZWFkZXJcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1pbmJveFxcXCI+PC9pPiBTYWxlczwvbGk+PC91bD48ZGl2IGNsYXNzPVxcXCJ0YWItY29udGVudCBuby1wYWRkaW5nXFxcIj48ZGl2IGNsYXNzPVxcXCJjaGFydCB0YWItcGFuZSBhY3RpdmVcXFwiIGlkPXJldmVudWUtY2hhcnQgc3R5bGU9XFxcInBvc2l0aW9uOiByZWxhdGl2ZTsgaGVpZ2h0OiAzMDBweFxcXCI+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY2hhcnQgdGFiLXBhbmVcXFwiIGlkPXNhbGVzLWNoYXJ0IHN0eWxlPVxcXCJwb3NpdGlvbjogcmVsYXRpdmU7IGhlaWdodDogMzAwcHhcXFwiPjwvZGl2PjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveCBib3gtc3VjY2Vzc1xcXCI+PGRpdiBjbGFzcz1ib3gtaGVhZGVyPjxpIGNsYXNzPVxcXCJmYSBmYS1jb21tZW50cy1vXFxcIj48L2k+PGgzIGNsYXNzPWJveC10aXRsZT5DaGF0PC9oMz48ZGl2IGNsYXNzPVxcXCJib3gtdG9vbHMgcHVsbC1yaWdodFxcXCIgZGF0YS10b2dnbGU9dG9vbHRpcCB0aXRsZT1TdGF0dXM+PGRpdiBjbGFzcz1idG4tZ3JvdXAgZGF0YS10b2dnbGU9YnRuLXRvZ2dsZT48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgYnRuLXNtIGFjdGl2ZVxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXNxdWFyZSB0ZXh0LWdyZWVuXFxcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tZGVmYXVsdCBidG4tc21cXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1zcXVhcmUgdGV4dC1yZWRcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtYm9keSBjaGF0XFxcIiBpZD1jaGF0LWJveD48ZGl2IGNsYXNzPWl0ZW0+PGltZyBzcmM9ZGlzdC9pbWcvdXNlcjQtMTI4eDEyOC5qcGcgYWx0PVxcXCJ1c2VyIGltYWdlXFxcIiBjbGFzcz1vbmxpbmU+PHAgY2xhc3M9bWVzc2FnZT48YSBocmVmPSMgY2xhc3M9bmFtZT48c21hbGwgY2xhc3M9XFxcInRleHQtbXV0ZWQgcHVsbC1yaWdodFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gMjoxNTwvc21hbGw+IE1pa2UgRG9lPC9hPiBJIHdvdWxkIGxpa2UgdG8gbWVldCB5b3UgdG8gZGlzY3VzcyB0aGUgbGF0ZXN0IG5ld3MgYWJvdXQgdGhlIGFycml2YWwgb2YgdGhlIG5ldyB0aGVtZS4gVGhleSBzYXkgaXQgaXMgZ29pbmcgdG8gYmUgb25lIHRoZSBiZXN0IHRoZW1lcyBvbiB0aGUgbWFya2V0PC9wPjxkaXYgY2xhc3M9YXR0YWNobWVudD48aDQ+QXR0YWNobWVudHM6PC9oND48cCBjbGFzcz1maWxlbmFtZT5UaGVtZS10aHVtYm5haWwtaW1hZ2UuanBnPC9wPjxkaXYgY2xhc3M9cHVsbC1yaWdodD48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGJ0bi1mbGF0XFxcIj5PcGVuPC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1pdGVtPjxpbWcgc3JjPWRpc3QvaW1nL3VzZXIzLTEyOHgxMjguanBnIGFsdD1cXFwidXNlciBpbWFnZVxcXCIgY2xhc3M9b2ZmbGluZT48cCBjbGFzcz1tZXNzYWdlPjxhIGhyZWY9IyBjbGFzcz1uYW1lPjxzbWFsbCBjbGFzcz1cXFwidGV4dC1tdXRlZCBwdWxsLXJpZ2h0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiA1OjE1PC9zbWFsbD4gQWxleGFuZGVyIFBpZXJjZTwvYT4gSSB3b3VsZCBsaWtlIHRvIG1lZXQgeW91IHRvIGRpc2N1c3MgdGhlIGxhdGVzdCBuZXdzIGFib3V0IHRoZSBhcnJpdmFsIG9mIHRoZSBuZXcgdGhlbWUuIFRoZXkgc2F5IGl0IGlzIGdvaW5nIHRvIGJlIG9uZSB0aGUgYmVzdCB0aGVtZXMgb24gdGhlIG1hcmtldDwvcD48L2Rpdj48ZGl2IGNsYXNzPWl0ZW0+PGltZyBzcmM9ZGlzdC9pbWcvdXNlcjItMTYweDE2MC5qcGcgYWx0PVxcXCJ1c2VyIGltYWdlXFxcIiBjbGFzcz1vZmZsaW5lPjxwIGNsYXNzPW1lc3NhZ2U+PGEgaHJlZj0jIGNsYXNzPW5hbWU+PHNtYWxsIGNsYXNzPVxcXCJ0ZXh0LW11dGVkIHB1bGwtcmlnaHRcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDU6MzA8L3NtYWxsPiBTdXNhbiBEb2U8L2E+IEkgd291bGQgbGlrZSB0byBtZWV0IHlvdSB0byBkaXNjdXNzIHRoZSBsYXRlc3QgbmV3cyBhYm91dCB0aGUgYXJyaXZhbCBvZiB0aGUgbmV3IHRoZW1lLiBUaGV5IHNheSBpdCBpcyBnb2luZyB0byBiZSBvbmUgdGhlIGJlc3QgdGhlbWVzIG9uIHRoZSBtYXJrZXQ8L3A+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1ib3gtZm9vdGVyPjxkaXYgY2xhc3M9aW5wdXQtZ3JvdXA+PGlucHV0IGNsYXNzPWZvcm0tY29udHJvbCBwbGFjZWhvbGRlcj1cXFwiVHlwZSBtZXNzYWdlLi4uXFxcIj48ZGl2IGNsYXNzPWlucHV0LWdyb3VwLWJ0bj48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLXN1Y2Nlc3NcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1wbHVzXFxcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94IGJveC1wcmltYXJ5XFxcIj48ZGl2IGNsYXNzPWJveC1oZWFkZXI+PGkgY2xhc3M9XFxcImlvbiBpb24tY2xpcGJvYXJkXFxcIj48L2k+PGgzIGNsYXNzPWJveC10aXRsZT5UbyBEbyBMaXN0PC9oMz48ZGl2IGNsYXNzPVxcXCJib3gtdG9vbHMgcHVsbC1yaWdodFxcXCI+PHVsIGNsYXNzPVxcXCJwYWdpbmF0aW9uIHBhZ2luYXRpb24tc20gaW5saW5lXFxcIj48bGk+PGEgaHJlZj0jPiZsYXF1bzs8L2E+PC9saT48bGk+PGEgaHJlZj0jPjE8L2E+PC9saT48bGk+PGEgaHJlZj0jPjI8L2E+PC9saT48bGk+PGEgaHJlZj0jPjM8L2E+PC9saT48bGk+PGEgaHJlZj0jPiZyYXF1bzs8L2E+PC9saT48L3VsPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9Ym94LWJvZHk+PHVsIGNsYXNzPXRvZG8tbGlzdD48bGk+PHNwYW4gY2xhc3M9aGFuZGxlPjxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+PC9zcGFuPiA8aW5wdXQgdHlwZT1jaGVja2JveCB2YWx1ZT1cXFwiXFxcIj4gPHNwYW4gY2xhc3M9dGV4dD5EZXNpZ24gYSBuaWNlIHRoZW1lPC9zcGFuPiA8c21hbGwgY2xhc3M9XFxcImxhYmVsIGxhYmVsLWRhbmdlclxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiPjwvaT4gMiBtaW5zPC9zbWFsbD48ZGl2IGNsYXNzPXRvb2xzPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS10cmFzaC1vXFxcIj48L2k+PC9kaXY+PC9saT48bGk+PHNwYW4gY2xhc3M9aGFuZGxlPjxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS1lbGxpcHNpcy12XFxcIj48L2k+PC9zcGFuPiA8aW5wdXQgdHlwZT1jaGVja2JveCB2YWx1ZT1cXFwiXFxcIj4gPHNwYW4gY2xhc3M9dGV4dD5NYWtlIHRoZSB0aGVtZSByZXNwb25zaXZlPC9zcGFuPiA8c21hbGwgY2xhc3M9XFxcImxhYmVsIGxhYmVsLWluZm9cXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDQgaG91cnM8L3NtYWxsPjxkaXYgY2xhc3M9dG9vbHM+PGkgY2xhc3M9XFxcImZhIGZhLWVkaXRcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLXRyYXNoLW9cXFwiPjwvaT48L2Rpdj48L2xpPjxsaT48c3BhbiBjbGFzcz1oYW5kbGU+PGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT48L3NwYW4+IDxpbnB1dCB0eXBlPWNoZWNrYm94IHZhbHVlPVxcXCJcXFwiPiA8c3BhbiBjbGFzcz10ZXh0PkxldCB0aGVtZSBzaGluZSBsaWtlIGEgc3Rhcjwvc3Bhbj4gPHNtYWxsIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC13YXJuaW5nXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiAxIGRheTwvc21hbGw+PGRpdiBjbGFzcz10b29scz48aSBjbGFzcz1cXFwiZmEgZmEtZWRpdFxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtdHJhc2gtb1xcXCI+PC9pPjwvZGl2PjwvbGk+PGxpPjxzcGFuIGNsYXNzPWhhbmRsZT48aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPjwvc3Bhbj4gPGlucHV0IHR5cGU9Y2hlY2tib3ggdmFsdWU9XFxcIlxcXCI+IDxzcGFuIGNsYXNzPXRleHQ+TGV0IHRoZW1lIHNoaW5lIGxpa2UgYSBzdGFyPC9zcGFuPiA8c21hbGwgY2xhc3M9XFxcImxhYmVsIGxhYmVsLXN1Y2Nlc3NcXFwiPjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIj48L2k+IDMgZGF5czwvc21hbGw+PGRpdiBjbGFzcz10b29scz48aSBjbGFzcz1cXFwiZmEgZmEtZWRpdFxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtdHJhc2gtb1xcXCI+PC9pPjwvZGl2PjwvbGk+PGxpPjxzcGFuIGNsYXNzPWhhbmRsZT48aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPiA8aSBjbGFzcz1cXFwiZmEgZmEtZWxsaXBzaXMtdlxcXCI+PC9pPjwvc3Bhbj4gPGlucHV0IHR5cGU9Y2hlY2tib3ggdmFsdWU9XFxcIlxcXCI+IDxzcGFuIGNsYXNzPXRleHQ+Q2hlY2sgeW91ciBtZXNzYWdlcyBhbmQgbm90aWZpY2F0aW9uczwvc3Bhbj4gPHNtYWxsIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1wcmltYXJ5XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiAxIHdlZWs8L3NtYWxsPjxkaXYgY2xhc3M9dG9vbHM+PGkgY2xhc3M9XFxcImZhIGZhLWVkaXRcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLXRyYXNoLW9cXFwiPjwvaT48L2Rpdj48L2xpPjxsaT48c3BhbiBjbGFzcz1oYW5kbGU+PGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT4gPGkgY2xhc3M9XFxcImZhIGZhLWVsbGlwc2lzLXZcXFwiPjwvaT48L3NwYW4+IDxpbnB1dCB0eXBlPWNoZWNrYm94IHZhbHVlPVxcXCJcXFwiPiA8c3BhbiBjbGFzcz10ZXh0PkxldCB0aGVtZSBzaGluZSBsaWtlIGEgc3Rhcjwvc3Bhbj4gPHNtYWxsIGNsYXNzPVxcXCJsYWJlbCBsYWJlbC1kZWZhdWx0XFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCI+PC9pPiAxIG1vbnRoPC9zbWFsbD48ZGl2IGNsYXNzPXRvb2xzPjxpIGNsYXNzPVxcXCJmYSBmYS1lZGl0XFxcIj48L2k+IDxpIGNsYXNzPVxcXCJmYSBmYS10cmFzaC1vXFxcIj48L2k+PC9kaXY+PC9saT48L3VsPjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1mb290ZXIgY2xlYXJmaXggbm8tYm9yZGVyXFxcIj48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLWRlZmF1bHQgcHVsbC1yaWdodFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLXBsdXNcXFwiPjwvaT4gQWRkIGl0ZW08L2J1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3ggYm94LWluZm9cXFwiPjxkaXYgY2xhc3M9Ym94LWhlYWRlcj48aSBjbGFzcz1cXFwiZmEgZmEtZW52ZWxvcGVcXFwiPjwvaT48aDMgY2xhc3M9Ym94LXRpdGxlPlF1aWNrIEVtYWlsPC9oMz48ZGl2IGNsYXNzPVxcXCJwdWxsLXJpZ2h0IGJveC10b29sc1xcXCI+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1pbmZvIGJ0bi1zbVxcXCIgZGF0YS13aWRnZXQ9cmVtb3ZlIGRhdGEtdG9nZ2xlPXRvb2x0aXAgdGl0bGU9UmVtb3ZlPjxpIGNsYXNzPVxcXCJmYSBmYS10aW1lc1xcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9Ym94LWJvZHk+PGZvcm0gYWN0aW9uPSMgbWV0aG9kPXBvc3Q+PGRpdiBjbGFzcz1mb3JtLWdyb3VwPjxpbnB1dCB0eXBlPWVtYWlsIGNsYXNzPWZvcm0tY29udHJvbCBuYW1lPWVtYWlsdG8gcGxhY2Vob2xkZXI9XFxcIkVtYWlsIHRvOlxcXCI+PC9kaXY+PGRpdiBjbGFzcz1mb3JtLWdyb3VwPjxpbnB1dCB0eXBlPXRleHQgY2xhc3M9Zm9ybS1jb250cm9sIG5hbWU9c3ViamVjdCBwbGFjZWhvbGRlcj1TdWJqZWN0PjwvZGl2PjxkaXY+PHRleHRhcmVhIGNsYXNzPXRleHRhcmVhIHBsYWNlaG9sZGVyPU1lc3NhZ2Ugc3R5bGU9XFxcIndpZHRoOiAxMDAlOyBoZWlnaHQ6IDEyNXB4OyBmb250LXNpemU6IDE0cHg7IGxpbmUtaGVpZ2h0OiAxOHB4OyBib3JkZXI6IDFweCBzb2xpZCAjZGRkZGRkOyBwYWRkaW5nOiAxMHB4XFxcIj48L3RleHRhcmVhPjwvZGl2PjwvZm9ybT48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtZm9vdGVyIGNsZWFyZml4XFxcIj48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJwdWxsLXJpZ2h0IGJ0biBidG4tZGVmYXVsdFxcXCIgaWQ9c2VuZEVtYWlsPlNlbmQgPGkgY2xhc3M9XFxcImZhIGZhLWFycm93LWNpcmNsZS1yaWdodFxcXCI+PC9pPjwvYnV0dG9uPjwvZGl2PjwvZGl2Pjwvc2VjdGlvbj48c2VjdGlvbiBjbGFzcz1cXFwiY29sLWxnLTUgY29ubmVjdGVkU29ydGFibGVcXFwiPjxkaXYgY2xhc3M9XFxcImJveCBib3gtc29saWQgYmctbGlnaHQtYmx1ZS1ncmFkaWVudFxcXCI+PGRpdiBjbGFzcz1ib3gtaGVhZGVyPjxkaXYgY2xhc3M9XFxcInB1bGwtcmlnaHQgYm94LXRvb2xzXFxcIj48YnV0dG9uIHR5cGU9YnV0dG9uIGNsYXNzPVxcXCJidG4gYnRuLXByaW1hcnkgYnRuLXNtIGRhdGVyYW5nZSBwdWxsLXJpZ2h0XFxcIiBkYXRhLXRvZ2dsZT10b29sdGlwIHRpdGxlPVxcXCJEYXRlIHJhbmdlXFxcIj48aSBjbGFzcz1cXFwiZmEgZmEtY2FsZW5kYXJcXFwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1wcmltYXJ5IGJ0bi1zbSBwdWxsLXJpZ2h0XFxcIiBkYXRhLXdpZGdldD1jb2xsYXBzZSBkYXRhLXRvZ2dsZT10b29sdGlwIHRpdGxlPUNvbGxhcHNlIHN0eWxlPVxcXCJtYXJnaW4tcmlnaHQ6IDVweFxcXCI+PGkgY2xhc3M9XFxcImZhIGZhLW1pbnVzXFxcIj48L2k+PC9idXR0b24+PC9kaXY+PGkgY2xhc3M9XFxcImZhIGZhLW1hcC1tYXJrZXJcXFwiPjwvaT48aDMgY2xhc3M9Ym94LXRpdGxlPlZpc2l0b3JzPC9oMz48L2Rpdj48ZGl2IGNsYXNzPWJveC1ib2R5PjxkaXYgaWQ9d29ybGQtbWFwIHN0eWxlPVxcXCJoZWlnaHQ6IDI1MHB4OyB3aWR0aDogMTAwJVxcXCI+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWZvb3RlciBuby1ib3JkZXJcXFwiPjxkaXYgY2xhc3M9cm93PjxkaXYgY2xhc3M9XFxcImNvbC14cy00IHRleHQtY2VudGVyXFxcIiBzdHlsZT1cXFwiYm9yZGVyLXJpZ2h0OiAxcHggc29saWQgI2Y0ZjRmNFxcXCI+PGRpdiBpZD1zcGFya2xpbmUtMT48L2Rpdj48ZGl2IGNsYXNzPWtub2ItbGFiZWw+VmlzaXRvcnM8L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjb2wteHMtNCB0ZXh0LWNlbnRlclxcXCIgc3R5bGU9XFxcImJvcmRlci1yaWdodDogMXB4IHNvbGlkICNmNGY0ZjRcXFwiPjxkaXYgaWQ9c3BhcmtsaW5lLTI+PC9kaXY+PGRpdiBjbGFzcz1rbm9iLWxhYmVsPk9ubGluZTwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImNvbC14cy00IHRleHQtY2VudGVyXFxcIj48ZGl2IGlkPXNwYXJrbGluZS0zPjwvZGl2PjxkaXYgY2xhc3M9a25vYi1sYWJlbD5FeGlzdHM8L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3ggYm94LXNvbGlkIGJnLXRlYWwtZ3JhZGllbnRcXFwiPjxkaXYgY2xhc3M9Ym94LWhlYWRlcj48aSBjbGFzcz1cXFwiZmEgZmEtdGhcXFwiPjwvaT48aDMgY2xhc3M9Ym94LXRpdGxlPlNhbGVzIEdyYXBoPC9oMz48ZGl2IGNsYXNzPVxcXCJib3gtdG9vbHMgcHVsbC1yaWdodFxcXCI+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJnLXRlYWwgYnRuLXNtXFxcIiBkYXRhLXdpZGdldD1jb2xsYXBzZT48aSBjbGFzcz1cXFwiZmEgZmEtbWludXNcXFwiPjwvaT48L2J1dHRvbj4gPGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJnLXRlYWwgYnRuLXNtXFxcIiBkYXRhLXdpZGdldD1yZW1vdmU+PGkgY2xhc3M9XFxcImZhIGZhLXRpbWVzXFxcIj48L2k+PC9idXR0b24+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWJvZHkgYm9yZGVyLXJhZGl1cy1ub25lXFxcIj48ZGl2IGNsYXNzPWNoYXJ0IGlkPWxpbmUtY2hhcnQgc3R5bGU9XFxcImhlaWdodDogMjUwcHhcXFwiPjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XFxcImJveC1mb290ZXIgbm8tYm9yZGVyXFxcIj48ZGl2IGNsYXNzPXJvdz48ZGl2IGNsYXNzPVxcXCJjb2wteHMtNCB0ZXh0LWNlbnRlclxcXCIgc3R5bGU9XFxcImJvcmRlci1yaWdodDogMXB4IHNvbGlkICNmNGY0ZjRcXFwiPjxpbnB1dCB0eXBlPXRleHQgY2xhc3M9a25vYiBkYXRhLXJlYWRvbmx5PXRydWUgdmFsdWU9MjAgZGF0YS13aWR0aD02MCBkYXRhLWhlaWdodD02MCBkYXRhLWZnY29sb3I9IzM5Q0NDQz48ZGl2IGNsYXNzPWtub2ItbGFiZWw+TWFpbC1PcmRlcnM8L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJjb2wteHMtNCB0ZXh0LWNlbnRlclxcXCIgc3R5bGU9XFxcImJvcmRlci1yaWdodDogMXB4IHNvbGlkICNmNGY0ZjRcXFwiPjxpbnB1dCB0eXBlPXRleHQgY2xhc3M9a25vYiBkYXRhLXJlYWRvbmx5PXRydWUgdmFsdWU9NTAgZGF0YS13aWR0aD02MCBkYXRhLWhlaWdodD02MCBkYXRhLWZnY29sb3I9IzM5Q0NDQz48ZGl2IGNsYXNzPWtub2ItbGFiZWw+T25saW5lPC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiY29sLXhzLTQgdGV4dC1jZW50ZXJcXFwiPjxpbnB1dCB0eXBlPXRleHQgY2xhc3M9a25vYiBkYXRhLXJlYWRvbmx5PXRydWUgdmFsdWU9MzAgZGF0YS13aWR0aD02MCBkYXRhLWhlaWdodD02MCBkYXRhLWZnY29sb3I9IzM5Q0NDQz48ZGl2IGNsYXNzPWtub2ItbGFiZWw+SW4tU3RvcmU8L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3ggYm94LXNvbGlkIGJnLWdyZWVuLWdyYWRpZW50XFxcIj48ZGl2IGNsYXNzPWJveC1oZWFkZXI+PGkgY2xhc3M9XFxcImZhIGZhLWNhbGVuZGFyXFxcIj48L2k+PGgzIGNsYXNzPWJveC10aXRsZT5DYWxlbmRhcjwvaDM+PGRpdiBjbGFzcz1cXFwicHVsbC1yaWdodCBib3gtdG9vbHNcXFwiPjxkaXYgY2xhc3M9YnRuLWdyb3VwPjxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tc3VjY2VzcyBidG4tc20gZHJvcGRvd24tdG9nZ2xlXFxcIiBkYXRhLXRvZ2dsZT1kcm9wZG93bj48aSBjbGFzcz1cXFwiZmEgZmEtYmFyc1xcXCI+PC9pPjwvYnV0dG9uPjx1bCBjbGFzcz1cXFwiZHJvcGRvd24tbWVudSBwdWxsLXJpZ2h0XFxcIiByb2xlPW1lbnU+PGxpPjxhIGhyZWY9Iz5BZGQgbmV3IGV2ZW50PC9hPjwvbGk+PGxpPjxhIGhyZWY9Iz5DbGVhciBldmVudHM8L2E+PC9saT48bGkgY2xhc3M9ZGl2aWRlcj48L2xpPjxsaT48YSBocmVmPSM+VmlldyBjYWxlbmRhcjwvYT48L2xpPjwvdWw+PC9kaXY+PGJ1dHRvbiB0eXBlPWJ1dHRvbiBjbGFzcz1cXFwiYnRuIGJ0bi1zdWNjZXNzIGJ0bi1zbVxcXCIgZGF0YS13aWRnZXQ9Y29sbGFwc2U+PGkgY2xhc3M9XFxcImZhIGZhLW1pbnVzXFxcIj48L2k+PC9idXR0b24+IDxidXR0b24gdHlwZT1idXR0b24gY2xhc3M9XFxcImJ0biBidG4tc3VjY2VzcyBidG4tc21cXFwiIGRhdGEtd2lkZ2V0PXJlbW92ZT48aSBjbGFzcz1cXFwiZmEgZmEtdGltZXNcXFwiPjwvaT48L2J1dHRvbj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVxcXCJib3gtYm9keSBuby1wYWRkaW5nXFxcIj48ZGl2IGlkPWNhbGVuZGFyIHN0eWxlPVxcXCJ3aWR0aDogMTAwJVxcXCI+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1cXFwiYm94LWZvb3RlciB0ZXh0LWJsYWNrXFxcIj48ZGl2IGNsYXNzPXJvdz48ZGl2IGNsYXNzPWNvbC1zbS02PjxkaXYgY2xhc3M9Y2xlYXJmaXg+PHNwYW4gY2xhc3M9cHVsbC1sZWZ0PlRhc2sgIzE8L3NwYW4+IDxzbWFsbCBjbGFzcz1wdWxsLXJpZ2h0PjkwJTwvc21hbGw+PC9kaXY+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MgeHNcXFwiPjxkaXYgY2xhc3M9XFxcInByb2dyZXNzLWJhciBwcm9ncmVzcy1iYXItZ3JlZW5cXFwiIHN0eWxlPVxcXCJ3aWR0aDogOTAlXFxcIj48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPWNsZWFyZml4PjxzcGFuIGNsYXNzPXB1bGwtbGVmdD5UYXNrICMyPC9zcGFuPiA8c21hbGwgY2xhc3M9cHVsbC1yaWdodD43MCU8L3NtYWxsPjwvZGl2PjxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHhzXFxcIj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLWdyZWVuXFxcIiBzdHlsZT1cXFwid2lkdGg6IDcwJVxcXCI+PC9kaXY+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1jb2wtc20tNj48ZGl2IGNsYXNzPWNsZWFyZml4PjxzcGFuIGNsYXNzPXB1bGwtbGVmdD5UYXNrICMzPC9zcGFuPiA8c21hbGwgY2xhc3M9cHVsbC1yaWdodD42MCU8L3NtYWxsPjwvZGl2PjxkaXYgY2xhc3M9XFxcInByb2dyZXNzIHhzXFxcIj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcy1iYXIgcHJvZ3Jlc3MtYmFyLWdyZWVuXFxcIiBzdHlsZT1cXFwid2lkdGg6IDYwJVxcXCI+PC9kaXY+PC9kaXY+PGRpdiBjbGFzcz1jbGVhcmZpeD48c3BhbiBjbGFzcz1wdWxsLWxlZnQ+VGFzayAjNDwvc3Bhbj4gPHNtYWxsIGNsYXNzPXB1bGwtcmlnaHQ+NDAlPC9zbWFsbD48L2Rpdj48ZGl2IGNsYXNzPVxcXCJwcm9ncmVzcyB4c1xcXCI+PGRpdiBjbGFzcz1cXFwicHJvZ3Jlc3MtYmFyIHByb2dyZXNzLWJhci1ncmVlblxcXCIgc3R5bGU9XFxcIndpZHRoOiA0MCVcXFwiPjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2PjwvZGl2Pjwvc2VjdGlvbj48L2Rpdj48L3NlY3Rpb24+XCI7XG4iLCJpbXBvcnQgYW5ndWxhciBmcm9tICdhbmd1bGFyJztcbmltcG9ydCBuZ1Jlc291cmNlIGZyb20gJ2FuZ3VsYXItcmVzb3VyY2UnO1xuXG5jbGFzcyBBUEkge1xuXG5cdGNvbnN0cnVjdG9yKCRyZXNvdXJjZSkge1xuXG5cdFx0Y29uc3QgcmVzb3VyY2VzID0ge307XG5cdFx0Y29uc3QgdXJsID0gd2luZG93LmFwaV91cmw7XG5cblxuXHRcdHJlc291cmNlcy5nYWxsZXJ5ID0gJHJlc291cmNlKHVybCArICcvZ2FsbGVyeS86aWQnLCBudWxsLCB7XG5cdCAgICAgICAgJ3VwZGF0ZSc6IHsgbWV0aG9kOidQVVQnIH1cblx0ICAgIH0pO1xuXG5cdFx0cmVzb3VyY2VzLnBob3RvcyA9ICRyZXNvdXJjZSh1cmwgKyAnL2dhbGxlcnkvOmdhbGxlcnlJZC9waG90b3MvOnBob3RvSWQnKTtcblxuXHRcdHJldHVybiByZXNvdXJjZXM7XG4gIFx0fVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGFuZ3VsYXIubW9kdWxlKCdzZXJ2aWNlcy5BUEknLCBbbmdSZXNvdXJjZV0pXG4gIC5zZXJ2aWNlKCdBUEknLCBBUEkpXG4gIC5uYW1lOyJdfQ==

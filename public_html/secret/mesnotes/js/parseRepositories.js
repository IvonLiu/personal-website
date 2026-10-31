'use strict';

angular.module('parse', [])
.provider("parseRepositories", function() {
  var provider = {};
  var Parse = {};

  provider.init = function(Parseobj, applicationKey, javascriptKey, userId) {
    // This line handles any object renaming during minification.
    Parse = Parseobj;

    Parse.initialize(applicationKey, javascriptKey);

    if(userId) {
      Parse.User.become(userSession);
    }
  };

  provider.$get = ['$q', function($q) {
    return {

      GettersAndSetters: function(classObject, attributesArray) {
        for(var i = 0; i<attributesArray.length; i++) {
          eval(
            'Object.defineProperty(classObject.prototype, "' + attributesArray[i].angular + '", {' +
            'get: function() {' +
            'return this.get("' + attributesArray[i].parse + '");' +
            '},' +
            'set: function(aValue) {' +
            'this.set("' + attributesArray[i].parse + '", aValue);' +
            '}' +
            '});'
          );
        }
      },

      CreateRepository: function(className, options) {
        var objectClass = Parse.Object.extend(className, {}, {

          all: function() {
            var defer = $q.defer();

            var query = new Parse.Query(objectClass);

            if(options.hasOwnProperty('all') && options.all.hasOwnProperty('queries')) {
              for(var i = 0; i < options.all.queries.length; i ++) {
                eval(options.all.queries[i]);
              }
            }else {
              query.limit(1000);
            }

            query.find({
              success: function(results){
                defer.resolve(results);
              },
              error: function(arError) {
                defer.reject(arError);
              }
            });

            return defer.promise;
          },

          count: function() {
            var defer = $q.defer();

            var query = new Parse.Query(objectClass);
            query.ascending('objectId');

            if(options.hasOwnProperty('delete') && options.delete.hasOwnProperty('softDeleteColumn')) {
              query.doesNotExist(options.delete.softDeleteColumn);
            }

            query.count({
              success: function(result) {
                defer.resolve(result);
              },
              error: function(e) {
                defer.reject(e);
              }
            });

            return defer.promise;
          },

          get: function(id) {
            var defer = $q.defer();

            var query = new Parse.Query(objectClass);

            if(options.hasOwnProperty('get') && options.get.hasOwnProperty('queries')) {
              for(var i = 0; i < options.get.queries.length; i ++) {
                eval(options.get.queries[i]);
              }
            }

            query.get(id, {
              success: function(result) {
                defer.resolve(result);
              },
              error: function(error) {
                defer.reject(error);
              }
            });


            return defer.promise;
          },

          save: function(obj) {
            var defer = $q.defer();

            if(options.hasOwnProperty('save') && options.save.hasOwnProperty('beforeSave')) {
              options.save.beforeSave(obj);
            }

            obj.save(null, {
              success: function(result) {
                defer.resolve(result);

                if(options.hasOwnProperty('save') && options.save.hasOwnProperty('afterSave')) {
                  options.save.afterSave(result);
                }
              },

              error: function(object, error) {
                defer.reject(error);
              }
            });

            return defer.promise;
          },

          delete: function(obj) {
            var defer = $q.defer();

            if(options.hasOwnProperty('delete') && options.delete.hasOwnProperty('beforeDelete')) {
              options.delete.beforeDelete(obj);
            }

            if(options.hasOwnProperty('delete') && options.delete.hasOwnProperty('soft') && options.delete.soft === true) {
              if(!options.delete.hasOwnProperty('softDeleteColumn')) {
                console.log('No soft delete column defined for the ' + className + ' class.');
              }

              obj.set(options.delete.softDeleteColumn, new Date());

              obj.save(null, {
                success: function(result) {
                  defer.resolve(result);

                  if(options.delete.hasOwnProperty('afterDelete')) {
                    options.delete.afterDelete(result);
                  }
                },

                error: function(error) {
                  defer.reject(error);
                }
              });
            }else{
              obj.destroy(null, {
                success: function(result) {
                  defer.resolve();

                  if(options.hasOwnProperty('delete') && options.delete.hasOwnProperty('afterDelete')) {
                    options.delete.afterDelete(result);
                  }
                },

                error: function(error) {
                  defer.reject(error);
                }
              });
            }

            return defer.promise;
          },

          create: function() {
            return new objectClass();
          }, 

          create: function(attributes) {
            return new objectClass(attributes);
          }
        });

        return objectClass;
      }
    };
  }];

  return provider;
});
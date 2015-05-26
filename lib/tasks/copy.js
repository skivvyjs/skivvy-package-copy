'use strict';

var copy = require('recursive-copy');
var Promise = require('promise');

module.exports = function(config) {
	var src = config.source;
	var dest = config.destination;
	var options = config.options;
	var api = this;
	if (!src) {
		return Promise.reject(new api.errors.TaskError('No source path specified'));
	}
	if (!dest) {
		return Promise.reject(new api.errors.TaskError('No destination path specified'));
	}
	var srcs = Array.isArray(src) ? src : [src];
	return Promise.all(srcs.map(function(src) {
		return copy(src, dest, options);
	})).then(function(resultSets) {
		return resultSets.reduce(function(resultSet, results) {
			return resultSet.concat(results);
		}, []);
	});
};

module.exports.defaults = {
	source: null,
	destination: null,
	options: null
};

module.exports.description = 'Copy files and folders';

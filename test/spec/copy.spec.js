'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('promise');
var rewire = require('rewire');

chai.use(chaiAsPromised);
chai.use(sinonChai);


describe('task:copy', function() {
	var mockApi;
	var mockCopy;
	var task;
	before(function() {
		mockApi = createMockApi();
		mockCopy = createMockCopy();
		task = rewire('../../lib/tasks/copy');
		task.__set__('copy', mockCopy);
	});

	afterEach(function() {
		mockCopy.reset();
	});

	function createMockApi() {
		return {
			errors: {
				TaskError: createCustomError('TaskError')
			}
		};

		function createCustomError(type) {
			function CustomError(message) {
				this.message = message;
			}

			CustomError.prototype = Object.create(Error.prototype);
			CustomError.prototype.name = type;

			return CustomError;
		}
	}

	function createMockCopy() {
		return sinon.spy(function(src, dest, callback) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					if (src === 'error') {
						reject(new Error('Test error'));
					} else {
						var results = [
							{
								src: src,
								dest: dest,
								stats: {}
							}
						];
						resolve(results);
					}
				});
			}).nodeify(callback);
		});
	}

	afterEach(function() {
		mockCopy.reset();
	});

	it('should specify a description', function() {
		expect(task.description).to.be.a('string');
	});

	it('should specify default configuration', function() {
		expect(task.defaults.source).to.equal(null);
		expect(task.defaults.destination).to.equal(null);
		expect(task.defaults.options).to.equal(null);
	});

	it('should throw an error if no source path is specified', function() {
		var promises = [
			task.call(mockApi, {}),
			task.call(mockApi, { source: undefined }),
			task.call(mockApi, { source: null }),
			task.call(mockApi, { source: false })
		];
		return Promise.all(promises.map(function(promise) {
			return Promise.all([
				expect(promise).to.be.rejectedWith(mockApi.errors.TaskError),
				expect(promise).to.be.rejectedWith('No source')
			]);
		}));
	});

	it('should throw an error if no destination path is specified', function() {
		var promises = [
			task.call(mockApi, { source: 'hello-world' }),
			task.call(mockApi, { source: 'hello-world', destination: undefined }),
			task.call(mockApi, { source: 'hello-world', destination: null }),
			task.call(mockApi, { source: 'hello-world', destination: false })
		];
		return Promise.all(promises.map(function(promise) {
			return Promise.all([
				expect(promise).to.be.rejectedWith(mockApi.errors.TaskError),
				expect(promise).to.be.rejectedWith('No destination')
			]);
		}));
	});

	it('should copy files and return result (single source)', function() {
		return task.call(mockApi, {
			source: 'hello-world',
			destination: 'goodbye-world'
		})
			.then(function(results) {
				expect(mockCopy).to.have.been.calledWith(
					'hello-world',
					'goodbye-world'
				);
				expect(results).to.eql([
					{
						src: 'hello-world',
						dest: 'goodbye-world',
						stats: {}
					}
				]);
			});
	});

	it('should copy files and return result (multiple sources)', function() {
		return task.call(mockApi, {
			source: [
				'hello-world',
				'hello-user'
			],
			destination: 'goodbye-world'
		})
			.then(function(results) {
				expect(mockCopy).to.have.been.calledTwice;
				expect(mockCopy).to.have.been.calledWith(
					'hello-world',
					'goodbye-world'
				);
				expect(mockCopy).to.have.been.calledWith(
					'hello-user',
					'goodbye-world'
				);
				expect(results).to.eql([
					{
						src: 'hello-world',
						dest: 'goodbye-world',
						stats: {}
					},
					{
						src: 'hello-user',
						dest: 'goodbye-world',
						stats: {}
					}
				]);
			});
	});

	it('should pass options to the copy library', function() {
		return task.call(mockApi, {
			source: 'hello-world',
			destination: 'goodbye-world',
			options: {
				force: true,
				dot: true
			}
		})
			.then(function(results) {
				expect(mockCopy).to.have.been.calledWith(
					'hello-world',
					'goodbye-world',
					{
						force: true,
						dot: true
					}
				);
				expect(results).to.eql([
					{
						src: 'hello-world',
						dest: 'goodbye-world',
						stats: {}
					}
				]);
			});
	});

	it('should throw error on library error', function() {
		return expect(
			task.call(mockApi, {
				source: 'error',
				destination: 'hello-world'
			})
		).to.be.rejectedWith('Test error');
	});
});

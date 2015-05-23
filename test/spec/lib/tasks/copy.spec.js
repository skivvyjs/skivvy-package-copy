'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('promise');
var rewire = require('rewire');

var task = rewire('../../../../lib/tasks/copy');
var copy = createMockDel();
task.__set__('copy', copy);

chai.use(chaiAsPromised);
chai.use(sinonChai);

function createMockDel() {
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

describe('copy', function() {
	afterEach(function() {
		copy.reset();
	});

	it('should specify a description', function() {
		expect(task.description).to.be.a('string');
	});

	it('should specify defaults', function() {
		expect(task.defaults.source).to.equal(null);
		expect(task.defaults.destination).to.equal(null);
		expect(task.defaults.options).to.equal(null);
	});

	it('should throw an error if no source path is specified', function() {
		var promises = [
			task({}),
			task({ path: undefined }),
			task({ path: null }),
			task({ path: false })
		];
		return Promise.all(promises.map(function(promise) {
			expect(promise).to.be.rejectedWith('No source');
		}));
	});

	it('should throw an error if no destination path is specified', function() {
		var promises = [
			task({}),
			task({ path: undefined }),
			task({ path: null }),
			task({ path: false })
		];
		return Promise.all(promises.map(function(promise) {
			expect(promise).to.be.rejectedWith('No destination');
		}));
	});

	it('should copy files and return result (single source)', function() {
		return task({
			source: 'hello-world',
			destination: 'goodbye-world'
		})
			.then(function(results) {
				expect(copy).to.have.been.calledWith(
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
		return task({
			source: [
				'hello-world',
				'hello-user'
			],
			destination: 'goodbye-world'
		})
			.then(function(results) {
				expect(copy).to.have.been.calledTwice;
				expect(copy).to.have.been.calledWith(
					'hello-world',
					'goodbye-world'
				);
				expect(copy).to.have.been.calledWith(
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
		return task({
			source: 'hello-world',
			destination: 'goodbye-world',
			options: {
				force: true,
				dot: true
			}
		})
			.then(function(results) {
				expect(copy).to.have.been.calledWith(
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
			task({
				source: 'error',
				destination: 'hello-world'
			})
		).to.be.rejectedWith('Test error');
	});
});

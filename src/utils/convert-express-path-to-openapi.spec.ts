// test/pathConverter.test.ts
import {expect} from 'chai';
import {convertExpressPathToOpenAPI} from './convert-express-path-to-openapi.js';

describe('convertExpressPathToOpenAPI', function () {
  describe('basic conversions', function () {
    it('should convert a single parameter', function () {
      expect(convertExpressPathToOpenAPI('/users/:id')).to.equal('/users/{id}');
    });

    it('should convert multiple parameters', function () {
      expect(
        convertExpressPathToOpenAPI('/users/:userId/posts/:postId'),
      ).to.equal('/users/{userId}/posts/{postId}');
    });

    it('should convert a parameter at the beginning of the path', function () {
      expect(convertExpressPathToOpenAPI('/:token/validate')).to.equal(
        '/{token}/validate',
      );
    });

    it('should handle paths with no parameters', function () {
      expect(convertExpressPathToOpenAPI('/config/settings')).to.equal(
        '/config/settings',
      );
    });
  });

  describe('express specific syntax', function () {
    it('should convert optional parameters (dropping the ?)', function () {
      expect(convertExpressPathToOpenAPI('/files/:filename?')).to.equal(
        '/files/{filename}',
      );
    });

    it('should convert parameters with inline regex (dropping the regex)', function () {
      expect(
        convertExpressPathToOpenAPI('/products/:productId(\\d+)'),
      ).to.equal('/products/{productId}');
    });

    it('should convert optional parameters with inline regex', function () {
      expect(
        convertExpressPathToOpenAPI('/articles/:slug([a-z0-9-]+)?'),
      ).to.equal('/articles/{slug}');
    });

    it('should handle parameters with hyphens in their names', function () {
      expect(
        convertExpressPathToOpenAPI('/api/v1/user-profiles/:user-id'),
      ).to.equal('/api/v1/user-profiles/{user-id}');
    });

    it('should handle parameters with dots in their names (common for file extensions)', function () {
      // This specific case tests how the regex repeatedly applies.
      // :filename will be converted, then :ext
      expect(convertExpressPathToOpenAPI('/download/:filename.:ext')).to.equal(
        '/download/{filename}.{ext}',
      );
    });

    it('should handle complex paths with mixed parameter types', function () {
      expect(
        convertExpressPathToOpenAPI(
          '/api/:version(v[1-2])/items/:itemId(\\d+)?/details',
        ),
      ).to.equal('/api/{version}/items/{itemId}/details');
    });
  });

  describe('edge cases', function () {
    it('should return "/" for root path "/"', function () {
      expect(convertExpressPathToOpenAPI('/')).to.equal('/');
    });

    it('should return an empty string for an empty input string', function () {
      expect(convertExpressPathToOpenAPI('')).to.equal('');
    });

    it('should handle paths with trailing slashes correctly', function () {
      // The current regex doesn't specifically alter trailing slashes, which is fine.
      expect(convertExpressPathToOpenAPI('/users/:id/')).to.equal(
        '/users/{id}/',
      );
    });

    it('should handle paths with multiple consecutive slashes (passed through)', function () {
      expect(convertExpressPathToOpenAPI('/foo//:bar///baz')).to.equal(
        '/foo//{bar}///baz',
      );
    });
  });

  describe('non-convertible paths', function () {
    it('should not convert wildcard "*"', function () {
      expect(convertExpressPathToOpenAPI('/files/*')).to.equal('/files/*');
    });

    it('should not convert wildcard "*" when mixed with parameters', function () {
      expect(convertExpressPathToOpenAPI('/api/v1/*/:resource/data')).to.equal(
        '/api/v1/*/{resource}/data',
      );
    });

    it('should not convert anonymous regex groups', function () {
      expect(convertExpressPathToOpenAPI('/user/(\\d+)/profile')).to.equal(
        '/user/(\\d+)/profile',
      );
    });

    // it('should not convert segments that look like parameters but are not (e.g. double colon)', function () {
    //   expect(convertExpressPathToOpenAPI('/path/::internal')).to.equal(
    //     '/path/::internal',
    //   );
    // });

    it('should not convert segments that are just a colon', function () {
      expect(convertExpressPathToOpenAPI('/path/:/details')).to.equal(
        '/path/:/details',
      );
    });
  });
});

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  getAction,
  postAction,
  putAction,
  requestBody,
  requestCookie,
  requestCookies,
  requestHeader,
  requestHeaders,
  requestParams,
  requestQueries,
  requestQuery,
  responseBody,
  restController,
  RestRouter,
  REST_CONTROLLER_METADATA_KEY,
} from '@e22m4u/ts-rest-router';
import {
  OADataType,
  OAMediaType,
  OAParameterLocation,
  oaRequestBody,
  oaResponse,
} from '@e22m4u/ts-openapi';

import {expect} from 'chai';
import {Reflector} from '@e22m4u/ts-reflector';
import {DataType} from '@e22m4u/ts-data-schema';
import {oaHiddenOperation} from './decorators/index.js';
import {oaVisibleOperation} from './decorators/index.js';
import {OPENAPI_VERSION} from './rest-router-openapi.js';
import {RestRouterOpenAPI} from './rest-router-openapi.js';

const DUMMY_DOC = {
  info: {
    title: 'Title',
  },
};

describe('RestRouterOpenAPI', function () {
  describe('genOpenAPIDocument', function () {
    it('throws Error if RestRouter is not registered', function () {
      const s = new RestRouterOpenAPI();
      const throwable = () => s.genOpenAPIDocument(DUMMY_DOC);
      expect(throwable).to.throw(
        Error,
        /RestRouter instance must be registered/,
      );
    });

    it('throws Error if controller class does not have metadata', function () {
      @restController()
      class TestController {}
      const s = new RestRouterOpenAPI();
      const r = new RestRouter();
      r.addController(TestController);
      s.setService(RestRouter, r);
      Reflector.defineMetadata(
        REST_CONTROLLER_METADATA_KEY,
        undefined,
        TestController,
      );
      const throwable = () => s.genOpenAPIDocument(DUMMY_DOC);
      expect(throwable).to.throw(
        Error,
        'Controller class TestController does not have metadata.',
      );
    });

    describe('tags', function () {
      it('creates tag name from controller class name', function () {
        @restController()
        class TestController {}
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(TestController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'Test'}],
        });
      });
    });

    describe('paths', function () {
      it('adds paths from actions metadata', function () {
        @restController()
        class TestController {
          @getAction()
          firstAction() {}
          @postAction('foo')
          secondAction() {}
          @putAction('/foo/bar')
          thirdAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(TestController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'Test'}],
          paths: {
            '/': {
              get: {
                tags: ['Test'],
              },
            },
            '/foo': {
              post: {
                tags: ['Test'],
              },
            },
            '/foo/bar': {
              put: {
                tags: ['Test'],
              },
            },
          },
        });
      });

      it('uses controller path as path prefix', function () {
        @restController('test')
        class TestController {
          @getAction()
          firstAction() {}
          @postAction('foo')
          secondAction() {}
          @putAction('/foo/bar')
          thirdAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(TestController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'Test'}],
          paths: {
            '/test': {
              get: {
                tags: ['Test'],
              },
            },
            '/test/foo': {
              post: {
                tags: ['Test'],
              },
            },
            '/test/foo/bar': {
              put: {
                tags: ['Test'],
              },
            },
          },
        });
      });

      it('uses path prefix from controller root options', function () {
        @restController()
        class FooController {
          @getAction()
          firstAction() {}
          @getAction('second')
          secondAction() {}
        }
        @restController('bar')
        class BarController {
          @getAction()
          firstAction() {}
          @getAction('second')
          secondAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(FooController, {pathPrefix: 'token1'});
        r.addController(BarController, {pathPrefix: 'token2'});
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        console.log(res);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'Foo'}, {name: 'Bar'}],
          paths: {
            '/token1': {
              get: {
                tags: ['Foo'],
              },
            },
            '/token1/second': {
              get: {
                tags: ['Foo'],
              },
            },
            '/token2/bar': {
              get: {
                tags: ['Bar'],
              },
            },
            '/token2/bar/second': {
              get: {
                tags: ['Bar'],
              },
            },
          },
        });
      });

      it('adds same paths with different methods', function () {
        @restController()
        class TestController {
          @getAction('foo')
          firstAction() {}
          @postAction('foo')
          secondAction() {}
          @putAction('foo')
          thirdAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(TestController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'Test'}],
          paths: {
            '/foo': {
              get: {
                tags: ['Test'],
              },
              post: {
                tags: ['Test'],
              },
              put: {
                tags: ['Test'],
              },
            },
          },
        });
      });

      it('adds same paths with different methods with specified controller path', function () {
        @restController('foo')
        class TestController {
          @getAction('bar')
          firstAction() {}
          @postAction('bar')
          secondAction() {}
          @putAction('bar')
          thirdAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(TestController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'Test'}],
          paths: {
            '/foo/bar': {
              get: {
                tags: ['Test'],
              },
              post: {
                tags: ['Test'],
              },
              put: {
                tags: ['Test'],
              },
            },
          },
        });
      });

      it('adds paths with same methods from multiple controllers', function () {
        @restController()
        class FirstController {
          @getAction('foo')
          fooAction() {}
        }
        @restController()
        class SecondController {
          @getAction('bar')
          barAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(FirstController);
        r.addController(SecondController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'First'}, {name: 'Second'}],
          paths: {
            '/foo': {
              get: {
                tags: ['First'],
              },
            },
            '/bar': {
              get: {
                tags: ['Second'],
              },
            },
          },
        });
      });

      it('adds paths with same methods from multiple controllers with specified path', function () {
        @restController('prefix')
        class FirstController {
          @getAction('foo')
          fooAction() {}
        }
        @restController('prefix')
        class SecondController {
          @getAction('bar')
          barAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(FirstController);
        r.addController(SecondController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'First'}, {name: 'Second'}],
          paths: {
            '/prefix/foo': {
              get: {
                tags: ['First'],
              },
            },
            '/prefix/bar': {
              get: {
                tags: ['Second'],
              },
            },
          },
        });
      });

      it('adds same paths with different methods from multiple controllers', function () {
        @restController()
        class FirstController {
          @getAction('foo')
          fooAction() {}
        }
        @restController()
        class SecondController {
          @postAction('foo')
          barAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(FirstController);
        r.addController(SecondController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'First'}, {name: 'Second'}],
          paths: {
            '/foo': {
              get: {
                tags: ['First'],
              },
              post: {
                tags: ['Second'],
              },
            },
          },
        });
      });

      it('adds same paths with different methods from multiple controllers with specified path', function () {
        @restController('prefix')
        class FirstController {
          @getAction('foo')
          fooAction() {}
        }
        @restController('prefix')
        class SecondController {
          @postAction('foo')
          barAction() {}
        }
        const s = new RestRouterOpenAPI();
        const r = new RestRouter();
        r.addController(FirstController);
        r.addController(SecondController);
        s.setService(RestRouter, r);
        const res = s.genOpenAPIDocument(DUMMY_DOC);
        expect(res).to.be.eql({
          openapi: OPENAPI_VERSION,
          info: {title: 'Title'},
          tags: [{name: 'First'}, {name: 'Second'}],
          paths: {
            '/prefix/foo': {
              get: {
                tags: ['First'],
              },
              post: {
                tags: ['Second'],
              },
            },
          },
        });
      });

      describe('parameters', function () {
        describe('PATH', function () {
          it('adds nothing if no path parameters specified', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz')
              fooAction(
                @requestParams()
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}': {
                  get: {
                    tags: ['Test'],
                  },
                },
              },
            });
          });

          it('adds path parameters as required and converts ANY type to STRING', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz')
              fooAction(
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.ANY},
                    baz: {type: DataType.ANY},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds path parameters as required with STRING type', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz')
              fooAction(
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.STRING},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('merges multiple schemas', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz/:qux')
              fooAction(
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.NUMBER},
                  },
                })
                params1: object,
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    baz: {type: DataType.BOOLEAN},
                    qux: {type: DataType.ARRAY},
                  },
                })
                params2: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}/{qux}': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.BOOLEAN,
                            },
                          },
                        },
                      },
                      {
                        name: 'qux',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.ARRAY,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('skips schemas with non-OBJECT type', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz')
              fooAction(
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.NUMBER},
                  },
                })
                params1: object,
                @requestParams(DataType.STRING)
                params2: string,
                @requestParams(DataType.NUMBER)
                params3: number,
                @requestParams(DataType.BOOLEAN)
                params4: boolean,
                @requestParams(DataType.ARRAY)
                params5: unknown[],
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('overrides required option as true', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz')
              fooAction(
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      required: true,
                    },
                    baz: {
                      type: DataType.STRING,
                      required: false,
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz')
              fooAction(
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value from factory', function () {
            @restController()
            class TestController {
              @getAction('/foo/:bar/:baz')
              fooAction(
                @requestParams({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: () => 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: () => 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo/{bar}/{baz}': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.PATH,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });
        });

        describe('QUERY', function () {
          it('adds nothing if no query parameters specified', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQueries()
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                  },
                },
              },
            });
          });

          it('adds query parameters and converts ANY type to STRING', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQueries({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.ANY},
                    baz: {type: DataType.ANY},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds query parameters with STRING type', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQueries({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.STRING},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds query parameters with required option', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQueries({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      required: true,
                    },
                    baz: {
                      type: DataType.STRING,
                      required: false,
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        required: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('merges multiple schemas', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQuery('bar', {
                  type: DataType.STRING,
                })
                bar: string,
                @requestQueries({
                  type: DataType.OBJECT,
                  properties: {
                    baz: {
                      type: DataType.NUMBER,
                    },
                  },
                })
                params: Record<string, string>,
                @requestQuery('qux', {
                  type: DataType.BOOLEAN,
                })
                qux: number,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                      {
                        name: 'qux',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.BOOLEAN,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('skips schemas with non-OBJECT type', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQueries({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.NUMBER},
                  },
                })
                params1: object,
                @requestQueries(DataType.STRING)
                params2: string,
                @requestQueries(DataType.NUMBER)
                params3: number,
                @requestQueries(DataType.BOOLEAN)
                params4: boolean,
                @requestQueries(DataType.ARRAY)
                params5: unknown[],
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQueries({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value from factory', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestQueries({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: () => 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: () => 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.QUERY,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });
        });

        describe('HEADER', function () {
          it('adds nothing if no header parameters specified', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeaders()
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                  },
                },
              },
            });
          });

          it('adds header parameters and converts ANY type to STRING', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeaders({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.ANY},
                    baz: {type: DataType.ANY},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds header parameters with STRING type', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeaders({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.STRING},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds header parameters with required option', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeaders({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      required: true,
                    },
                    baz: {
                      type: DataType.STRING,
                      required: false,
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        required: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('merges multiple schemas', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeader('bar', {
                  type: DataType.STRING,
                })
                bar: string,
                @requestHeaders({
                  type: DataType.OBJECT,
                  properties: {
                    baz: {
                      type: DataType.NUMBER,
                    },
                  },
                })
                params: Record<string, string>,
                @requestHeader('qux', {
                  type: DataType.BOOLEAN,
                })
                qux: number,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                      {
                        name: 'qux',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.BOOLEAN,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('skips schemas with non-OBJECT type', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeaders({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.NUMBER},
                  },
                })
                params1: object,
                @requestHeaders(DataType.STRING)
                params2: string,
                @requestHeaders(DataType.NUMBER)
                params3: number,
                @requestHeaders(DataType.BOOLEAN)
                params4: boolean,
                @requestHeaders(DataType.ARRAY)
                params5: unknown[],
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeaders({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value from factory', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestHeaders({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: () => 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: () => 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.HEADER,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });
        });

        describe('COOKIE', function () {
          it('adds nothing if no cookie parameters specified', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookies()
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                  },
                },
              },
            });
          });

          it('adds cookie parameters and converts ANY type to STRING', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookies({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.ANY},
                    baz: {type: DataType.ANY},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds cookie parameters with STRING type', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookies({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.STRING},
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds cookie parameters with required option', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookies({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      required: true,
                    },
                    baz: {
                      type: DataType.STRING,
                      required: false,
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        required: true,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        required: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('merges multiple schemas', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookie('bar', {
                  type: DataType.STRING,
                })
                bar: string,
                @requestCookies({
                  type: DataType.OBJECT,
                  properties: {
                    baz: {
                      type: DataType.NUMBER,
                    },
                  },
                })
                params: Record<string, string>,
                @requestCookie('qux', {
                  type: DataType.BOOLEAN,
                })
                qux: number,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                      {
                        name: 'qux',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.BOOLEAN,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('skips schemas with non-OBJECT type', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookies({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {type: DataType.STRING},
                    baz: {type: DataType.NUMBER},
                  },
                })
                params1: object,
                @requestCookies(DataType.STRING)
                params2: string,
                @requestCookies(DataType.NUMBER)
                params3: number,
                @requestCookies(DataType.BOOLEAN)
                params4: boolean,
                @requestCookies(DataType.ARRAY)
                params5: unknown[],
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookies({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });

          it('adds default value from factory', function () {
            @restController()
            class TestController {
              @getAction('/foo')
              fooAction(
                @requestCookies({
                  type: DataType.OBJECT,
                  properties: {
                    bar: {
                      type: DataType.STRING,
                      default: () => 'value1',
                    },
                    baz: {
                      type: DataType.STRING,
                      default: () => 'value2',
                    },
                  },
                })
                params: object,
              ) {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  get: {
                    tags: ['Test'],
                    parameters: [
                      {
                        name: 'bar',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value1',
                            },
                          },
                        },
                      },
                      {
                        name: 'baz',
                        in: OAParameterLocation.COOKIE,
                        explode: false,
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {
                              type: DataType.STRING,
                              default: 'value2',
                            },
                          },
                        },
                      },
                    ],
                  },
                },
              },
            });
          });
        });
      });

      describe('requestBody', function () {
        it('adds text/plain with STRING type if ANY type specified', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody(DataType.ANY)
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      'text/plain': {
                        schema: {
                          type: DataType.STRING,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds text/plain with STRING type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody(DataType.STRING)
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      'text/plain': {
                        schema: {
                          type: DataType.STRING,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with NUMBER type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody(DataType.NUMBER)
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.NUMBER,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with BOOLEAN type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody(DataType.BOOLEAN)
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.BOOLEAN,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with ARRAY type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody(DataType.ARRAY)
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.ARRAY,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with OBJECT type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody(DataType.OBJECT)
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.OBJECT,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds object schema even no properties specified', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody(DataType.OBJECT)
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.OBJECT,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds properties schema with STRING type instead of ANY type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody({
                type: DataType.OBJECT,
                properties: {
                  bar: {type: DataType.ANY},
                  baz: {type: DataType.ANY},
                },
              })
              body: unknown,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.OBJECT,
                          properties: {
                            bar: {type: DataType.STRING},
                            baz: {type: DataType.STRING},
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds object schema with properties', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody({
                type: DataType.OBJECT,
                properties: {
                  bar: {type: DataType.STRING},
                  baz: {type: DataType.NUMBER},
                },
              })
              body: object,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.OBJECT,
                          properties: {
                            bar: {
                              type: DataType.STRING,
                            },
                            baz: {
                              type: DataType.NUMBER,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('merges multiple schemas', function () {
          @restController()
          class TestController {
            @getAction('/foo')
            fooAction(
              @requestBody({
                type: DataType.OBJECT,
                properties: {
                  bar: {type: DataType.STRING},
                  baz: {type: DataType.NUMBER},
                },
              })
              body1: object,
              @requestBody({
                type: DataType.OBJECT,
                properties: {
                  baz: {type: DataType.BOOLEAN},
                  qux: {type: DataType.ARRAY},
                },
              })
              body2: object,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                get: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.OBJECT,
                          properties: {
                            bar: {
                              type: DataType.STRING,
                            },
                            baz: {
                              type: DataType.BOOLEAN,
                            },
                            qux: {
                              type: DataType.ARRAY,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('uses required option', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody({
                type: DataType.OBJECT,
                required: true,
              })
              body: object,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    required: true,
                    content: {
                      [OAMediaType.APPLICATION_JSON]: {
                        schema: {
                          type: DataType.OBJECT,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds default value', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody({
                type: DataType.STRING,
                default: 'Hello',
              })
              body: object,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.TEXT_PLAIN]: {
                        schema: {
                          type: DataType.STRING,
                          default: 'Hello',
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds default value from factory', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            fooAction(
              @requestBody({
                type: DataType.STRING,
                default: () => 'Hello',
              })
              body: object,
            ) {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  requestBody: {
                    content: {
                      [OAMediaType.TEXT_PLAIN]: {
                        schema: {
                          type: DataType.STRING,
                          default: 'Hello',
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        describe('OARequestBodiesMetadata', function () {
          it('adds multiple OARequestBodyObject', function () {
            @restController()
            class TestController {
              @postAction('/foo')
              @oaRequestBody({
                mediaType: OAMediaType.APPLICATION_JSON,
                description: 'Request body description',
                schema: {type: OADataType.OBJECT},
                example: {foo: 'bar'},
                required: true,
              })
              @oaRequestBody({
                mediaType: OAMediaType.APPLICATION_XML,
                description: 'Request body description',
                schema: {type: OADataType.OBJECT},
                example: {bar: 'baz'},
                required: true,
              })
              fooAction() {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  post: {
                    tags: ['Test'],
                    requestBody: {
                      description: 'Request body description',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {type: OADataType.OBJECT},
                          example: {foo: 'bar'},
                        },
                        [OAMediaType.APPLICATION_XML]: {
                          schema: {type: OADataType.OBJECT},
                          example: {bar: 'baz'},
                        },
                      },
                      required: true,
                    },
                  },
                },
              },
            });
          });
        });
      });

      describe('responseBody', function () {
        it('adds text/plain with STRING type if ANY type specified', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody(DataType.ANY)
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.TEXT_PLAIN]: {
                          schema: {
                            type: OADataType.STRING,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds text/plain with STRING type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody(DataType.STRING)
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.TEXT_PLAIN]: {
                          schema: {
                            type: OADataType.STRING,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with NUMBER type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody(DataType.NUMBER)
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: OADataType.NUMBER,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with BOOLEAN type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody(DataType.BOOLEAN)
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: OADataType.BOOLEAN,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with ARRAY type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody(DataType.ARRAY)
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: OADataType.ARRAY,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds application/json with OBJECT type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody(DataType.OBJECT)
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: OADataType.OBJECT,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds object schema even no properties specified', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody(DataType.OBJECT)
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: DataType.OBJECT,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds properties schema with STRING type instead of ANY type', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody({
              type: DataType.OBJECT,
              properties: {
                bar: {type: DataType.ANY},
                baz: {type: DataType.ANY},
              },
            })
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: DataType.OBJECT,
                            properties: {
                              bar: {type: DataType.STRING},
                              baz: {type: DataType.STRING},
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds object schema with properties', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody({
              type: DataType.OBJECT,
              properties: {
                bar: {type: DataType.STRING},
                baz: {type: DataType.NUMBER},
              },
            })
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: DataType.OBJECT,
                            properties: {
                              bar: {
                                type: DataType.STRING,
                              },
                              baz: {
                                type: DataType.NUMBER,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('overrides schema', function () {
          @restController()
          class TestController {
            @getAction('/foo')
            @responseBody({
              type: DataType.OBJECT,
              properties: {
                bar: {type: DataType.STRING},
                baz: {type: DataType.NUMBER},
              },
            })
            @responseBody({
              type: DataType.OBJECT,
              properties: {
                baz: {type: DataType.BOOLEAN},
                qux: {type: DataType.ARRAY},
              },
            })
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                get: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.APPLICATION_JSON]: {
                          schema: {
                            type: DataType.OBJECT,
                            properties: {
                              bar: {
                                type: DataType.STRING,
                              },
                              baz: {
                                type: DataType.NUMBER,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds default value', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody({
              type: DataType.STRING,
              default: 'Hello',
            })
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.TEXT_PLAIN]: {
                          schema: {
                            type: DataType.STRING,
                            default: 'Hello',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        it('adds default value from factory', function () {
          @restController()
          class TestController {
            @postAction('/foo')
            @responseBody({
              type: DataType.STRING,
              default: () => 'Hello',
            })
            fooAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/foo': {
                post: {
                  tags: ['Test'],
                  responses: {
                    default: {
                      description: 'Example',
                      content: {
                        [OAMediaType.TEXT_PLAIN]: {
                          schema: {
                            type: DataType.STRING,
                            default: 'Hello',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          });
        });

        describe('OAResponseMetadata', function () {
          it('adds multiple OAResponseObject', function () {
            @restController()
            class TestController {
              @postAction('/foo')
              @oaResponse({
                statusCode: 200,
                mediaType: OAMediaType.APPLICATION_JSON,
                description: 'Response description',
                schema: {type: OADataType.OBJECT},
                example: {foo: 'bar'},
              })
              @oaResponse({
                statusCode: 200,
                mediaType: OAMediaType.APPLICATION_XML,
                description: 'Response description',
                schema: {type: OADataType.OBJECT},
                example: {bar: 'baz'},
              })
              fooAction() {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  post: {
                    tags: ['Test'],
                    responses: {
                      '200': {
                        description: 'Response description',
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {type: OADataType.OBJECT},
                            example: {foo: 'bar'},
                          },
                          [OAMediaType.APPLICATION_XML]: {
                            schema: {type: OADataType.OBJECT},
                            example: {bar: 'baz'},
                          },
                        },
                      },
                    },
                  },
                },
              },
            });
          });

          it('uses default status code if not specified', function () {
            @restController()
            class TestController {
              @postAction('/foo')
              @oaResponse({
                mediaType: OAMediaType.APPLICATION_JSON,
                description: 'Response description',
                schema: {type: OADataType.OBJECT},
                example: {foo: 'bar'},
              })
              fooAction() {}
            }
            const s = new RestRouterOpenAPI();
            const r = new RestRouter();
            r.addController(TestController);
            s.setService(RestRouter, r);
            const res = s.genOpenAPIDocument(DUMMY_DOC);
            expect(res).to.be.eql({
              openapi: OPENAPI_VERSION,
              info: {title: 'Title'},
              tags: [{name: 'Test'}],
              paths: {
                '/foo': {
                  post: {
                    tags: ['Test'],
                    responses: {
                      default: {
                        description: 'Response description',
                        content: {
                          [OAMediaType.APPLICATION_JSON]: {
                            schema: {type: OADataType.OBJECT},
                            example: {foo: 'bar'},
                          },
                        },
                      },
                    },
                  },
                },
              },
            });
          });
        });
      });

      describe('@oaOperationVisibility', function () {
        it('uses operation visibility metadata', function () {
          @restController()
          class TestController {
            @oaVisibleOperation()
            @getAction('first')
            firstAction() {}
            @oaHiddenOperation()
            @getAction('second')
            secondAction() {}
            @getAction('third')
            thirdAction() {}
          }
          const s = new RestRouterOpenAPI();
          const r = new RestRouter();
          r.addController(TestController);
          s.setService(RestRouter, r);
          const res = s.genOpenAPIDocument(DUMMY_DOC);
          expect(res).to.be.eql({
            openapi: OPENAPI_VERSION,
            info: {title: 'Title'},
            tags: [{name: 'Test'}],
            paths: {
              '/first': {
                get: {
                  tags: ['Test'],
                },
              },
              '/third': {
                get: {
                  tags: ['Test'],
                },
              },
            },
          });
        });
      });
    });
  });
});

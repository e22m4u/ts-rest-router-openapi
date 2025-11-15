import 'mocha';
import {expect} from 'chai';
import {OADataType} from '@e22m4u/ts-openapi';
import {DataType} from '@e22m4u/ts-data-schema';
import {DataSchema} from '@e22m4u/ts-data-schema';

import {
  DataSchemaWithOaOptions,
  dataSchemaToOASchemaObject,
} from './data-schema-to-oa-schema-object.js';

describe('dataSchemaToOASchemaObject', function () {
  it('should convert a DataType.ANY schema to an empty OASchemaObject', function () {
    const ds: DataSchema = {type: DataType.ANY};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({});
  });

  it('should convert a DataType.STRING schema', function () {
    const ds: DataSchema = {type: DataType.STRING};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({type: OADataType.STRING});
  });

  it('should convert a DataType.NUMBER schema', function () {
    const ds: DataSchema = {type: DataType.NUMBER};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({type: OADataType.NUMBER});
  });

  it('should convert a DataType.BOOLEAN schema', function () {
    const ds: DataSchema = {type: DataType.BOOLEAN};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({type: OADataType.BOOLEAN});
  });

  it('should convert a DataType.ARRAY schema', function () {
    const ds: DataSchema = {type: DataType.ARRAY};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({type: OADataType.ARRAY});
  });

  it('should convert a DataType.ARRAY schema with an "items" definition', function () {
    const ds: DataSchema = {
      type: DataType.ARRAY,
      items: {type: DataType.STRING},
    };
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({
      type: OADataType.ARRAY,
      items: {type: OADataType.STRING},
    });
  });

  it('should convert a DataType.OBJECT schema', function () {
    const ds: DataSchema = {type: DataType.OBJECT};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({type: OADataType.OBJECT});
  });

  it('should convert a DataType.OBJECT schema with a "properties" definition', function () {
    const ds: DataSchema = {
      type: DataType.OBJECT,
      properties: {
        name: {type: DataType.STRING},
        age: {type: DataType.NUMBER, default: () => 30},
      },
    };
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({
      type: OADataType.OBJECT,
      properties: {
        name: {type: OADataType.STRING},
        age: {type: OADataType.NUMBER, default: 30},
      },
    });
  });

  it('should recursively convert nested DataType.OBJECT schemas', function () {
    const ds: DataSchema = {
      type: DataType.OBJECT,
      properties: {
        user: {
          type: DataType.OBJECT,
          properties: {
            id: {type: DataType.NUMBER},
            profile: {
              type: DataType.OBJECT,
              properties: {
                avatar: {type: DataType.STRING, default: 'default.png'},
              },
            },
          },
        },
      },
    };
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({
      type: OADataType.OBJECT,
      properties: {
        user: {
          type: OADataType.OBJECT,
          properties: {
            id: {type: OADataType.NUMBER},
            profile: {
              type: OADataType.OBJECT,
              properties: {
                avatar: {type: OADataType.STRING, default: 'default.png'},
              },
            },
          },
        },
      },
    });
  });

  it('should convert a complex schema with mixed types, arrays, and defaults', function () {
    const ds: DataSchema = {
      type: DataType.OBJECT,
      properties: {
        id: {type: DataType.NUMBER, default: 1},
        tags: {
          type: DataType.ARRAY,
          items: {type: DataType.STRING, default: 'tag'},
          default: () => ['a', 'b'],
        },
        metadata: {type: DataType.ANY},
        config: {
          type: DataType.OBJECT,
          default: () => ({setting: true}),
          properties: {
            theme: {type: DataType.STRING, default: 'dark'},
            features: {
              type: DataType.ARRAY,
              items: {type: DataType.ANY},
            },
          },
        },
      },
    };
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.be.eql({
      type: OADataType.OBJECT,
      properties: {
        id: {type: OADataType.NUMBER, default: 1},
        tags: {
          type: OADataType.ARRAY,
          items: {type: OADataType.STRING, default: 'tag'},
          default: ['a', 'b'],
        },
        metadata: {},
        config: {
          type: OADataType.OBJECT,
          default: {setting: true},
          properties: {
            theme: {type: OADataType.STRING, default: 'dark'},
            features: {
              type: OADataType.ARRAY,
            },
          },
        },
      },
    });
  });

  it('should re-throw an error from a default value factory', function () {
    const errorMessage = 'Factory Error!';
    const ds: DataSchema = {
      type: DataType.STRING,
      default: function () {
        throw new Error(errorMessage);
      },
    };
    expect(() => dataSchemaToOASchemaObject(ds)).to.throw(Error, errorMessage);
  });

  describe('when the data schema has the "default" option', function () {
    it('should convert with a static value', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.STRING,
        default: 'hello',
      });
      expect(result).to.be.eql({type: OADataType.STRING, default: 'hello'});
    });

    it('should convert with a factory function', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.NUMBER,
        default: () => 123,
      });
      expect(result).to.be.eql({type: OADataType.NUMBER, default: 123});
    });

    it('should omit the option when a factory returns undefined', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.STRING,
        default: () => undefined,
      });
      expect(result).to.be.eql({type: OADataType.STRING});
    });

    it('should omit the option when its value is explicitly undefined', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.STRING,
        default: undefined,
      });
      expect(result).to.be.eql({type: OADataType.STRING});
    });

    it('should convert with a null value', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.ANY,
        default: null,
      });
      expect(result).to.be.eql({default: null});
    });
  });

  describe('when the data schema has the "oaDefault" option', function () {
    it('should convert with a static value', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.STRING,
        oaDefault: 'hello',
      });
      expect(result).to.be.eql({type: OADataType.STRING, default: 'hello'});
    });

    it('should convert with a factory function', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.NUMBER,
        oaDefault: () => 123,
      });
      expect(result).to.be.eql({type: OADataType.NUMBER, default: 123});
    });

    it('should omit the option when a factory returns undefined', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.STRING,
        oaDefault: () => undefined,
      });
      expect(result).to.be.eql({type: OADataType.STRING});
    });

    it('should omit the option when its value is explicitly undefined', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.STRING,
        oaDefault: undefined,
      });
      expect(result).to.be.eql({type: OADataType.STRING});
    });

    it('should convert with a null value', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.ANY,
        oaDefault: null,
      });
      expect(result).to.be.eql({default: null});
    });

    it('should prioritize the "oaDefault" option over the "default" option', function () {
      const result = dataSchemaToOASchemaObject({
        type: DataType.STRING,
        default: 'foo',
        oaDefault: 'bar',
      });
      expect(result).to.be.eql({type: OADataType.STRING, default: 'bar'});
    });
  });

  describe('when the "defaultType" parameter is provided', function () {
    it('should apply the default type when the schema type is DataType.ANY', function () {
      const ds: DataSchema = {type: DataType.ANY};
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.be.eql({type: OADataType.STRING});
    });

    it('should apply the default type and use the "default" option when the schema type is DataType.ANY', function () {
      const ds: DataSchema = {type: DataType.ANY, default: 'test'};
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.be.eql({type: OADataType.STRING, default: 'test'});
    });

    it('should apply the default type and use the "oaDefault" option when the schema type is DataType.ANY', function () {
      const ds: DataSchemaWithOaOptions = {
        type: DataType.ANY,
        oaDefault: 'test',
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.be.eql({type: OADataType.STRING, default: 'test'});
    });

    it('should ignore the default type when the schema type is already defined', function () {
      const ds: DataSchema = {type: DataType.NUMBER};
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.be.eql({type: OADataType.NUMBER});
    });

    it('should not apply the default type if it is undefined and the schema is DataType.ANY', function () {
      const ds: DataSchema = {type: DataType.ANY};
      const result = dataSchemaToOASchemaObject(ds, undefined);
      expect(result).to.be.eql({});
    });

    it('should apply the default type to array items when their schema type is DataType.ANY', function () {
      const ds: DataSchema = {
        type: DataType.ARRAY,
        items: {type: DataType.ANY},
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.BOOLEAN);
      expect(result).to.be.eql({
        type: OADataType.ARRAY,
        items: {type: OADataType.BOOLEAN},
      });
    });

    it('should ignore the default type for array items when their schema type is already defined', function () {
      const ds: DataSchema = {
        type: DataType.ARRAY,
        items: {type: DataType.STRING},
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.NUMBER);
      expect(result).to.be.eql({
        type: OADataType.ARRAY,
        items: {type: OADataType.STRING},
      });
    });

    it('should apply the default type to object properties when their schema type is DataType.ANY', function () {
      const ds: DataSchema = {
        type: DataType.OBJECT,
        properties: {
          anyProp: {type: DataType.ANY},
          stringProp: {type: DataType.STRING},
        },
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.NUMBER);
      expect(result).to.be.eql({
        type: OADataType.OBJECT,
        properties: {
          anyProp: {type: OADataType.NUMBER},
          stringProp: {type: OADataType.STRING},
        },
      });
    });

    it('should ignore the default type for object properties when their schema type is already defined', function () {
      const ds: DataSchema = {
        type: DataType.OBJECT,
        properties: {
          numProp: {type: DataType.NUMBER},
        },
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.be.eql({
        type: OADataType.OBJECT,
        properties: {
          numProp: {type: OADataType.NUMBER},
        },
      });
    });

    it('should recursively apply the default type in a complex nested schema', function () {
      const ds: DataSchema = {
        type: DataType.OBJECT,
        properties: {
          field1: {type: DataType.ANY},
          field2: {
            type: DataType.ARRAY,
            items: {type: DataType.ANY},
          },
          field3: {
            type: DataType.OBJECT,
            properties: {
              nestedAny: {type: DataType.ANY},
              nestedString: {type: DataType.STRING},
            },
          },
          field4: {type: DataType.NUMBER},
        },
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.be.eql({
        type: OADataType.OBJECT,
        properties: {
          field1: {type: OADataType.STRING},
          field2: {
            type: OADataType.ARRAY,
            items: {type: OADataType.STRING},
          },
          field3: {
            type: OADataType.OBJECT,
            properties: {
              nestedAny: {type: OADataType.STRING},
              nestedString: {type: OADataType.STRING},
            },
          },
          field4: {type: OADataType.NUMBER},
        },
      });
    });
  });
});

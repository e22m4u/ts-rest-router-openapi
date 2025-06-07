import 'mocha';
import {expect} from 'chai';
import {OADataType} from '@e22m4u/ts-openapi';
import {DataType} from '@e22m4u/ts-data-schema';
import {DataSchema} from '@e22m4u/ts-data-schema';
import {dataSchemaToOASchemaObject} from './data-schema-to-oa-schema-object.js';

describe('dataSchemaToOASchemaObject', function () {
  it('should convert DataType.STRING to OADataType.STRING', function () {
    const ds: DataSchema = {type: DataType.STRING};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.STRING});
  });

  it('should convert DataType.NUMBER to OADataType.NUMBER', function () {
    const ds: DataSchema = {type: DataType.NUMBER};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.NUMBER});
  });

  it('should convert DataType.BOOLEAN to OADataType.BOOLEAN', function () {
    const ds: DataSchema = {type: DataType.BOOLEAN};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.BOOLEAN});
  });

  it('should convert DataType.ANY to an OASchemaObject without a type field', function () {
    const ds: DataSchema = {type: DataType.ANY};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({});
  });

  it('should convert a static default value', function () {
    const ds: DataSchema = {type: DataType.STRING, default: 'hello'};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.STRING, default: 'hello'});
  });

  it('should convert a factory function default value', function () {
    const ds: DataSchema = {type: DataType.NUMBER, default: () => 123};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.NUMBER, default: 123});
  });

  it('should not set default if factory returns undefined', function () {
    const ds: DataSchema = {type: DataType.STRING, default: () => undefined};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.STRING});
  });

  it('should not set default if dataSchema.default is explicitly undefined', function () {
    const ds: DataSchema = {type: DataType.STRING, default: undefined};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.STRING});
  });

  it('should set default if value is null', function () {
    const ds: DataSchema = {type: DataType.ANY, default: null};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({default: null});
  });

  it('should convert DataType.ARRAY with items schema', function () {
    const ds: DataSchema = {
      type: DataType.ARRAY,
      items: {type: DataType.STRING},
    };
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({
      type: OADataType.ARRAY,
      items: {type: OADataType.STRING},
    });
  });

  // it('should convert DataType.ARRAY without items schema', function() {
  //   const ds: DataSchema = { type: DataType.ARRAY };
  //   const result = dataSchemaToOASchemaObject(ds);
  //   expect(result).to.deep.equal({ type: OADataType.ARRAY });
  // });

  it('should convert DataType.OBJECT with properties', function () {
    const ds: DataSchema = {
      type: DataType.OBJECT,
      properties: {
        name: {type: DataType.STRING},
        age: {type: DataType.NUMBER, default: () => 30},
      },
    };
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({
      type: OADataType.OBJECT,
      properties: {
        name: {type: OADataType.STRING},
        age: {type: OADataType.NUMBER, default: 30},
      },
    });
  });

  it('should convert DataType.OBJECT without properties', function () {
    const ds: DataSchema = {type: DataType.OBJECT};
    const result = dataSchemaToOASchemaObject(ds);
    expect(result).to.deep.equal({type: OADataType.OBJECT});
  });

  it('should convert a nested DataType.OBJECT', function () {
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
    expect(result).to.deep.equal({
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

  it('should convert a complex structure', function () {
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
    expect(result).to.deep.equal({
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

  it('should propagate an error if a default factory throws an error', function () {
    const errorMessage = 'Factory Error!';
    const ds: DataSchema = {
      type: DataType.STRING,
      default: function () {
        throw new Error(errorMessage);
      },
    };
    expect(() => dataSchemaToOASchemaObject(ds)).to.throw(Error, errorMessage);
  });

  describe('defaultType', function () {
    it('should use defaultType when dataSchema.type is DataType.ANY', function () {
      const ds: DataSchema = {type: DataType.ANY};
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.deep.equal({type: OADataType.STRING});
    });

    it('should use defaultType with a default value when dataSchema.type is DataType.ANY', function () {
      const ds: DataSchema = {type: DataType.ANY, default: 'test'};
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.deep.equal({type: OADataType.STRING, default: 'test'});
    });

    it('should ignore defaultType when dataSchema.type is already defined (e.g., DataType.NUMBER)', function () {
      const ds: DataSchema = {type: DataType.NUMBER};
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING); // Пытаемся переопределить на STRING
      expect(result).to.deep.equal({type: OADataType.NUMBER}); // Должен остаться NUMBER
    });

    it('should not apply defaultType if defaultType is undefined and dataSchema.type is DataType.ANY', function () {
      const ds: DataSchema = {type: DataType.ANY};
      const result = dataSchemaToOASchemaObject(ds, undefined);
      expect(result).to.deep.equal({});
    });

    it('should apply defaultType to array items if item schema is DataType.ANY', function () {
      const ds: DataSchema = {
        type: DataType.ARRAY,
        items: {type: DataType.ANY},
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.BOOLEAN);
      expect(result).to.deep.equal({
        type: OADataType.ARRAY,
        items: {type: OADataType.BOOLEAN},
      });
    });

    it('should NOT apply defaultType to array items if item schema type is defined', function () {
      const ds: DataSchema = {
        type: DataType.ARRAY,
        items: {type: DataType.STRING},
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.NUMBER);
      expect(result).to.deep.equal({
        type: OADataType.ARRAY,
        items: {type: OADataType.STRING},
      });
    });

    it('should apply defaultType to object properties if property schema is DataType.ANY', function () {
      const ds: DataSchema = {
        type: DataType.OBJECT,
        properties: {
          anyProp: {type: DataType.ANY},
          stringProp: {type: DataType.STRING},
        },
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.NUMBER);
      expect(result).to.deep.equal({
        type: OADataType.OBJECT,
        properties: {
          anyProp: {type: OADataType.NUMBER},
          stringProp: {type: OADataType.STRING},
        },
      });
    });

    it('should NOT apply defaultType to object properties if property schema type is defined', function () {
      const ds: DataSchema = {
        type: DataType.OBJECT,
        properties: {
          numProp: {type: DataType.NUMBER},
        },
      };
      const result = dataSchemaToOASchemaObject(ds, OADataType.STRING);
      expect(result).to.deep.equal({
        type: OADataType.OBJECT,
        properties: {
          numProp: {type: OADataType.NUMBER},
        },
      });
    });

    it('should handle defaultType in complex nested structures with DataType.ANY', function () {
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
      expect(result).to.deep.equal({
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

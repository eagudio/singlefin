import { expect } from 'chai';
import Runtime from '../../core/src/runtime';

describe('Runtime', () => {
    it('get parent instance with one item', () => {
        var obj = {
            item: "test"
        };

        const expected = obj.item;

        const result = Runtime.getParentInstance(obj, "item");

        expect(result).to.equal(expected);
    });

    it('get parent instance with subitem', () => {
        var obj = {
            item: {
                subitem: "test"
            }
        };

        const expected = obj.item;

        const result = Runtime.getParentInstance(obj, "item.subitem");

        expect(result).to.equal(expected);
    });

    it('get parent instance with subsubitem', () => {
        var obj = {
            item: {
                subitem: {
                    subsubitem: "test"
                }
            }
        };

        const expected = obj.item.subitem;

        const result = Runtime.getParentInstance(obj, "item.subitem.subsubitem");

        expect(result).to.equal(expected);
    });

    it('get parent instance with array', () => {
        var obj = {
            array: ["a", "b"]
        };

        const expected = obj.array;

        const result = Runtime.getParentInstance(obj, "array");

        expect(result).to.equal(expected);
    });

    it('get parent instance with array item', () => {
        var obj = {
            array: ["a", "b"]
        };

        const expected = obj.array;

        const result = Runtime.getParentInstance(obj, "array[0]");

        expect(result).to.equal(expected);
    });

    it('get parent instance with array item and value', () => {
        var obj = {
            array: ["a", {
                value: "hello"
            }]
        };

        const expected = obj.array[1];

        const result = Runtime.getParentInstance(obj, "array[1].value");

        expect(result).to.equal(expected);
    });

    it('get parent instance with object and array item and value', () => {
        var obj = {
            item: {
                array: ["a", {
                    value: "hello"
                }]
            }
        };

        const expected = obj.item.array[1];

        const result = Runtime.getParentInstance(obj, "item.array[1].value");

        expect(result).to.equal(expected);
    });

    it('get parent instance with object and array', () => {
        var models = {
            product: {
                items: [{
                    value: "bye"
                }, {
                    value: "hello"
                }]
            }
        };

        const expected = models.product.items;

        const result = Runtime.getParentInstance(models, "product.items[0]");

        expect(result).to.equal(expected);
    });

    it('get property', () => {
        var obj = {
            item: "test"
        };

        const expected = obj.item;

        const result = Runtime.getProperty(obj, "item");

        expect(result).to.equal(expected);
    });

    it('get property with subitem', () => {
        var obj = {
            item: {
                subitem: "test"
            }
        };

        const expected = obj.item.subitem;

        const result = Runtime.getProperty(obj, "item.subitem");

        expect(result).to.equal(expected);
    });

    it('get property with subsubitem', () => {
        var obj = {
            item: {
                subitem: {
                    subsubitem: "test"
                }
            }
        };

        const expected = obj.item.subitem.subsubitem;

        const result = Runtime.getProperty(obj, "item.subitem.subsubitem");

        expect(result).to.equal(expected);
    });

    it('get property with array', () => {
        var obj = {
            array: ["a", "b"]
        };

        const expected = obj.array;

        const result = Runtime.getProperty(obj, "array");

        expect(result).to.equal(expected);
    });

    it('get parent instance with array item', () => {
        var obj = {
            array: ["a", "b"]
        };

        const expected = obj.array[0];

        const result = Runtime.getProperty(obj, "array[0]");

        expect(result).to.equal(expected);
    });

    it('get parent instance with array item and value', () => {
        var obj = {
            array: [{}, {
                value: "hello"
            }]
        };

        const expected = obj.array[1].value;

        const result = Runtime.getProperty(obj, "array[1].value");

        expect(result).to.equal(expected);
    });

    it('get parent instance with object and array item and value', () => {
        var obj = {
            item: {
                array: [{}, {
                    value: "hello"
                }]
            }
        };

        const expected = obj.item.array[1].value;

        const result = Runtime.getProperty(obj, "item.array[1].value");

        expect(result).to.equal(expected);
    });

    it('set property', () => {
        var obj = {
            item: "hello"
        };

        const expected = "hi";

        Runtime.setProperty("item", obj, expected);

        const result = obj.item;

        expect(result).to.equal(expected);
    });

    it('set property with subitem', () => {
        var obj = {
            item: {
                text: "hello"
            }
        };

        const expected = "hi";

        Runtime.setProperty("item.text", obj, expected);

        const result = obj.item.text;

        expect(result).to.equal(expected);
    });

    it('set property with subsubitem', () => {
        var obj = {
            item: {
                subitem: {
                    text: "hello"
                }
            }
        };

        const expected = "hi";

        Runtime.setProperty("item.subitem.text", obj, expected);

        const result = obj.item.subitem.text;

        expect(result).to.equal(expected);
    });

    it('set property with array', () => {
        var obj = {
            array: ["a", "b"]
        };

        const expected = ["c", "d", "e"];

        Runtime.setProperty("array", obj, expected);

        const result = obj.array;

        expect(result).to.equal(expected);
    });

    it('set property with item and array', () => {
        var obj = {
            item: {
                array: ["a", "b"]
            }
        };

        const expected = ["c", "d", "e"];

        Runtime.setProperty("item.array", obj, expected);

        const result = obj.item.array;

        expect(result).to.equal(expected);
    });

    it('set property with array item', () => {
        var obj = {
            array: ["a", "b"]
        };

        const expected = "c";

        Runtime.setProperty("array[1]", obj, expected);

        const result = obj.array[1];

        expect(result).to.equal(expected);
    });

    it('set property with array item and value', () => {
        var obj = {
            array: [{}, {
                value: "hello"
            }]
        };

        const expected = "hi";

        Runtime.setProperty("array[1].value", obj, expected);

        const result = obj.array[1].value;

        expect(result).to.equal(expected);
    });

    it('get parent instance with object and array item and value', () => {
        var obj = {
            item: {
                array: [{}, {
                    value: "hello"
                }]
            }
        };

        const expected = "hi";

        Runtime.setProperty("item.array[1].value", obj, expected);

        const result = obj.item.array[1].value;

        expect(result).to.equal(expected);
    });
});
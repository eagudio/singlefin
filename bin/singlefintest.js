define("core/runtimetest", ["require", "exports", "chai", "../../bin/singlefin"], function (require, exports, chai_1, singlefin_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe('Stack', () => {
        it('can be initialized without an initializer', () => {
            singlefin_1.Runtime.getProperty({}, "obj");
            //const s = new Stack<number>();
            chai_1.expect(0).to.equal(0);
        });
    });
});
//# sourceMappingURL=singlefintest.js.map
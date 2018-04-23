import DS from 'ember-data';

export default DS.RESTSerializer.extend({
    /*
    serialize() {
        debugger;
        let result = this._super(...arguments);

        return result;
    },
    */

    /*
    serializeIntoHash(hash, typeClass, snapshot, options) {
        
        //var normalizedRootKey = this.payloadKeyFromModelName(typeClass.modelName);
        Object.assign(hash, this.serialize(snapshot, options));
    }
    */
});

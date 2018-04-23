import DS from "ember-data";

import {inject as service} from '@ember/service';

import config from '../config/environment';
export default DS.RESTAdapter.extend({
    host: config.APP.apiHost,

    store: service(),

    buildURL(modelName, id, snapshot, requestType) {
        let appstate = this.get('store').peekRecord('appstate', 1);
        
        let result = this.get('host') + '/spending/api/workspace/' + appstate.get('wspid') + '/' + modelName;

        if (requestType == "updateRecord" || requestType == "deleteRecord") {
            result += '/' + id;
        }

        return result;
    }
    
});
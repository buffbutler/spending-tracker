import Route from '@ember/routing/route';
import { next, run} from '@ember/runloop';
import { Promise } from 'rsvp';
import $ from 'jquery';


export default Route.extend({
    actions: {
        didTransition() {
            next(this, 'initDropzone');
        }
    },

    initDropzone() {
        var my = this;
        
        try{
            /*eslint-disable */
            // we're disabling because we define this on the server side
            createDropzone(function() {
                next(this, function() {
                    my.refresh();
                });
            });
            /*eslint-enable */
        } catch (c) {
            //do nothing, just swallow the erorr
        }

    },

    model(params, transition) {
        var wspid = transition.params["workspace"]["wspid"];

        var my = this;

        return $.ajax({
            url: 'http://localhost:8000/spending/api/workspace/' + wspid
        }).then((data) => {
            return new Promise(function (resolve) {
                run(function() {
                    var transposed_data = [
                        {
                            id: 1,
                            type: "appstate",
                            attributes: {
                                wspid: wspid
                            },
                            relationships: {}
                        }
                    ];
        
                    for (let index = 0; index < data.journal.length; index++) {
                        let current = data.journal[index].Journal;
        
                        //parse the amount
                        current.amount = parseFloat(current.amount);
        
                        transposed_data.push({
                            id: current.id,
                            type: "journal",
                            attributes: current,
                            relationships: {}
                        });
                    }
        
        
                    for (let index = 0; index < data.rules.length; index++) {
                        let current = data.rules[index].Rule;
        
                        transposed_data.push({
                            id: current.id,
                            type: "rule",
                            attributes: current,
                            relationships: {}
                        });
                    }
        
                    my.get('store').push({
                        data: transposed_data
                    });
        
                    let journal = my.get('store').peekAll('journal');
                    let rules = my.get('store').peekAll('rules');
                    
                    let result = {
                        ruleSearchList: [],
                        searchFilterMode: "",
                        rules: rules,
                        journalDisplay: [],
                        journal: journal,
                        activeRuleMode: "Create",
                        activeRule: null
                    };
        
                    resolve(result);
                });
            });
        });
    }
});

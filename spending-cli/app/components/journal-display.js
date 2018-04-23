import Component from '@ember/component';
import $ from 'jquery'
import {observer} from '@ember/object';
import {inject as service} from '@ember/service';
import Constants from '../constants';
export default Component.extend({
    /**
     * This is a required ember input, the journal we are displaying
     */
    journal: null,

    /**
     * More for output, if we select a rule these two are set
     */
    activeRule: null,
    activeRuleMode: null,

    /**
     * The selected journal row
     */
    selected: null,

    /**
     * The path for the selected item editor
     */
    path: null,

    store: service(),

    init() {
        this._super(...arguments);
    },

    /**
     * When a journal display changes we unselect the selcted row
     */
    unselectOnChange: observer('journal.[]', function() {
        this.doUnselectItem();
    }),

    /**
     * Unselect a selected record
     */
    doUnselectItem() {
        if (this.selected) {
            this.selected.set('selected', false);
            this.set('selected',null);
        }
    },

    actions: {
        /**
         * Select a journal record
         * @param {models.journal} row The row we are targeting
         */
        selectItem(row) {
            if (this.selected) {
                this.selected.set('selected', false);
            }
            
            //local state
            this.set('selected',row);
            this.selected.set('selected', true);

            let path = this.selected.get('path_classification') || "";

            if (path) {
                this.set('path', path);
            }

            //align the editor with the selected row
            if (event && event.path) {
                for (let index= 0; index < event.path.length; index++) {
                    if ($(event.path[index]).hasClass("journal-row")) {
                        var offset = $(event.path[index]).offset();

                        $(".journal-edit").offset({left: 15, top: offset.top + 65});
                    }
                }
            }
        },

        /**
         * Unselect an item
         */
        unselectItem() {
            this.doUnselectItem();
        },

        /**
         * Given a current selected item, assign a path and set the applied rule to "manual"
         */
        setSelectedPath() {
            if (!this.selected) {
                return;
            }

            this.selected.set('path_classification', this.path);
            this.selected.set('applied_rule', (!this.path || this.path.length == 0) ? null : Constants.JOURNAL_RULE_MANUAL);

            this.set('selected', null);
        },

        /**
         * Given a journal record we will "open" a rule for editing
         * @param {*} row The journal record we are extracting the selected rule from
         */
        openRule(row) {
            var rulekey = row.get('applied_rule');
            var match = null;

            //todo: design issue, tight coupling
            this.get('store').peekAll('rule').forEach((current) => {
                if (current.get('public_key') == rulekey) {
                    match = current;
                }
            });

            if (match) {
                this.set('activeRule', match);
                this.set('activeRuleMode', "Update");
            }
        },

        /**
         * Given a rule set the path to "removed" so it isn't included in the path
         */
        setRemoved() {
            if (!this.selected) {
                return;
            }

            this.selected.set('path_classification', Constants.JOURNAL_REMOVED_PATH);
            this.set('selected', null);
        }
    }
});

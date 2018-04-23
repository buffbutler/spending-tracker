import Component from '@ember/component';
import {inject as service} from '@ember/service';
import Constants from '../constants';
import Object, {computed, observer} from '@ember/object';

export default Component.extend({
    /**
     * Required Ember input.  The journal we are targeting for a rule we are creating/editing.
     */
    journal: null,

    /**
     * Should the rule be applied to previously categorized journal records (excluding manual)
     */
    assignPrevious: false,

    /**
     * Should the rule be applied to previously manual categorized jouranl records
     */
    assignManual: false,

    /**
     * state management Create or Update
     */
    mode: null,

    //editor field modes
    expression: "",
    path: "",
    amount_from: null,
    amount_to: null,
    
    /**
     * A link to the filter control if we want to view rules
     */
    searchFilterMode: "",

    //the active editor record from ember data
    /**
     * The rule we are editing
     */
    record: null,
    /**
     * The previous rule we were editing if we want to re edit it
     */
    previous: null,

    store: service(),

    /**
     * If a record for editign is set from an external source then
     * we configure the UI to be in edit mode.
     */
    triggerUpdate: observer('record', 'mode', function() {
        if (this.get('mode') == "Update" && this.get('record')) {
            //get everything from teh reocrd
            this.set('expression', this.record.get('expression'));
            this.set('path', this.record.get('path'));
            this.set('amount_from', this.record.get('amount_from'));
            this.set('amount_to', this.record.get('amount_to'));
        }
    }),

    /**
     * If teh edit mode is enabeld, then modify the ui to display certain buttons
     */
    isedit: computed('mode', function() {
        return (this.get('mode') == "Update");
    }),

    /**
     * If the editor is incomplete we turn off the create button
     */
    cannotcreate: computed('path', function() {
        let path = this.get('path');
        
        if (!path || path.length == 0) {
            return "true";
        }

        return "";
    }),

    /**
     * A watch on what matches the current rules that will match this rule we are creating
     */
    matchset: computed('expression', 'amount_from', 'amount_to', 'mode', function() {
        var result = [];

        let activeRule = Object.create(this.ruleFromEditor(false));
        
        let matchHandler = function(activeRule, currentJournalRecord) {
            result.push(currentJournalRecord);
        }

        this.matchRuleToJournal(activeRule, matchHandler);

        return result;
    }),

    /**
     * Given the local journal, apply the current rule to any records that match.
     */
    matchRuleToJournal(activeRule, matchHandler) {
        let journal_data = this.get('journal');
        var my = this;

        //itterate the journal, testing the ability to apply then apply
        journal_data.forEach((currentJournalRecord) => {
            if (my.canApplyRuleToJournalRecord(activeRule, currentJournalRecord)) {
                matchHandler(activeRule, currentJournalRecord);
            }
        });
    },

    applyRuleToJournalRecord(activeRule, currentJournalRecord) {
        currentJournalRecord.set('path_classification', activeRule.get('path'));
        currentJournalRecord.set('applied_rule', activeRule.get('public_key'));
    },

    /**
     * Given a rule and a journal record - if the rule matches the journal record then
     * assign the path from the rule to the journal record.
     * @param {models.rule} activeRule 
     * @param {models.journal} currentJournalRecord 
     */
    canApplyRuleToJournalRecord(activeRule, currentJournalRecord) {
        let path = currentJournalRecord.get('path_classification');
        let applied_rule = currentJournalRecord.get('applied_rule');
        let public_key = activeRule.get('public_key');

        if (!this.assignPrevious && path && applied_rule != public_key) {
            return false;
        }

        if (applied_rule == Constants.JOURNAL_RULE_MANUAL && !this.assignManual) {
            return false;
        }

        return this.isJournalMatch(activeRule, currentJournalRecord);
    },

    /**
     * Given the local journal, un-apply the current rule to any records that were previousy applied.
     */
    unApplyRuleToJournal() {
        let journal_data = this.get('journal');
        var activeRule = this.get('record');
        var my = this;

        journal_data.forEach((currentJournalRecord) => {
            my.unApplyRuleToJournalRecord(activeRule, currentJournalRecord);
        });
    },

    /**
     * Given a rule and journal record - if the rule was previousy assigned by this rule
     * then unwind that assignment.
     * @param {models.rule} activeRule 
     * @param {models.journal} currentJournalRecord 
     */
    unApplyRuleToJournalRecord(activeRule, currentJournalRecord) {
        if (currentJournalRecord.get('applied_rule') == activeRule.get('public_key')) {
            currentJournalRecord.set('path_classification', null);
            currentJournalRecord.set('applied_rule', null);
        }
    },

    ruleFromEditor(applyKey) {
        let result = {
            expression: this.expression,
            path: this.path,
            amount_from: (!this.amount_from || this.amount_from.length == 0) ? null : parseFloat(this.amount_from),
            amount_to: (!this.amount_to || this.amount_to.length == 0) ? null : parseFloat(this.amount_to)
        }

        if (applyKey) {
            result.public_key = this.generateUUID();
        }

        return result;
    },


    /**
     * Test to see if the rule can match this journal record.
     * @param {models.journal} journalRecord The record we are testing
     */
    isJournalMatch(activeRule, journalRecord) {
        let journal_name = journalRecord.get('name').toLowerCase();
        let amount = journalRecord.get('amount');

        let rule_expression = activeRule.get('expression');
        let rule_amount_from = activeRule.get('amount_from');
        let rule_amount_to = activeRule.get('amount_to');

        //if the rule has atleast one condition to test against
        let hascondition = false;

        //test the expression
        if (rule_expression && rule_expression.length > 0) {
            hascondition = true;

            if (journal_name.indexOf(rule_expression.toLowerCase()) < 0) {
                return false;
            }
        }

        //test the amount_from
        if (rule_amount_from) {
            hascondition = true;

            if (amount < rule_amount_from) {
                return false;
            }
        }
        
        //test the amount_to
        if (rule_amount_to) {
            hascondition = true;

            if (amount > rule_amount_to) {
                return false;
            }
        }

        if (!hascondition) {
            return false;
        }

        //everything is ok
        return true;
    },

    /**
     * From:
     * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     */
    generateUUID() { // Public Domain/MIT
        var d = new Date().getTime();
        if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
            d += performance.now(); //use high-precision timer if available
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    },

    doResetEditor() {
        this.set('mode', "Create");
            this.set('record', null);
            this.set('expression', '');
    },

    actions: {
        resetEditor() {
            this.doResetEditor();
        },

        saveRule() {
            let store = this.get('store');

            if (this.mode == "Create") {
                //create
                let createdrecord = store.createRecord('rule', this.ruleFromEditor(true));

                this.set('record', createdrecord);
                this.set('previous', createdrecord);
            } else {
                //update
                this.record.set('expression', this.expression);
                this.record.set('path', this.path);
                this.record.set('amount_from', this.amount_from);
                this.record.set('amount_to', this.amount_to);

                this.unApplyRuleToJournal();
            }

            //the actual work against the jouranl
            this.matchRuleToJournal(this.get('record'), this.applyRuleToJournalRecord);

            if (this.mode == "Create") {
                this.doResetEditor();
            }
        },

        undoRule() {
            this.unApplyRuleToJournal();

            this.set('mode', "Create");
            this.record.deleteRecord();
            this.set('record', null);
        },

        showMatches() {
            this.set('ruleSearchList', this.get('matchset'));
            this.set('searchFilterMode', "rule");
        },

        modifyPrevious() {
            this.set('mode', "Update");
            this.set('record', this.get('previous'));
        }
    }
});

import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default Component.extend({
    /**
     * Required Ember input.  The journal we are filtering against.
     */
    journal: null,
    /**
     * Required Ember input. The mode for the filter we are setting.
     */
    filterMode: null,
    /**
     * Ember input.  A search filter we are applying to the name field
     */
    search: "",
    /**
     * Ember input. If the mode is set to rule then the journal result set is pulled 
     * from here instead of journal
     */
    ruleSearchList: null,

    /**
     * Ember input.  What should happen when the save is clicked.
     */
    saveChangesHandler: null,

    store: service(),

    init() {
        this._super(...arguments);
    },

    /**
     * The following 4 are for the filter category tabs to decide if we should highlight
     */
    filterModeUnCategorized: computed('filterMode', function() {
        return (this.get('filterMode') == "uncategorized");
    }),

    filterModeCategorized: computed('filterMode', function() {
        return (this.get('filterMode') == "categorized");
    }),

    filterModeAll: computed('filterMode', function() {
        return (this.get('filterMode') == "");
    }),

    filterModeRule: computed('filterMode', function() {
        return (this.get('filterMode') == "rule");
    }),
    
    /**
     * The output result set
     */
    journal_display: computed('filterMode', 'search', 'journal.[]', function() {
        return this.filterSet(this.journal);
    }),

    /**
     * Itterate the journal and filter all records that don't match the applied filter
     * @param {*} data A collection of journal records
     */
    filterSet(data) {
        if (this.get('filterMode') == "rule") {
            return this.get('ruleSearchList');
        }

        var result = [];

        if (!data) {
            return result; //--->
        }

        //itterate the assigned journal testing each for a filter
        data.forEach((current) => {
            let accept = true;

            //the current record
            let path = current.get('path_classification');
            let name = current.get('name').toLowerCase();
            let pathcomplete = !(!path || path.length == 0);

            //assignment mode
            if (this.get('filterMode') == "categorized" && !pathcomplete) {
                accept = false;
            } else if (this.get('filterMode') == "uncategorized" && pathcomplete) {
                accept = false;
            }

            //string search
            if (this.search && this.search.length > 0 && name.indexOf(this.search.toLowerCase()) == -1) {
                accept = false;
            }

            //done, push onto result set
            if (accept) {
                result.push(current);
            }
        });

        //done!
        return result;
    },

    actions: {
        /**
         * 
         * @param {*} filterMode The mode
         */
        setFilterMode(filterMode) {
            this.set('filterMode', filterMode);
            this.notifyPropertyChange('filterMode');
        },

        refreshSearch() {
            //do nothign?
        },

        saveChanges() {
            //if defined then run it
            if (this.saveChangesHandler) {
                this.saveChangesHandler();
            }
        }
    }
});

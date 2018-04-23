import DS from 'ember-data';

/**
 * Represents a transaction
 */
export default DS.Model.extend({
    /**
     * The transaction text
     */
    name: DS.attr(),
    /**
     * The transaction amount
     */
    amount: DS.attr(),
    /**
     * The date the transaction occured (for sorting)
     */
    transaction_date: DS.attr(),
    /**
     * The category that the rule was assigned
     */
    path_classification: DS.attr(),
    /**
     * This will be unset(null), "manual" or a guid of a public_key of a rule
     */
    applied_rule: DS.attr(),
    /**
     * The file public_key
     */
    source: DS.attr(),
    /**
     * The date the record was created
     */
    create_date: DS.attr(),
    /**
     * For the UI, if the record is selected
     */
    selected: DS.attr("boolean", {default:false})
});

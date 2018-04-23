import DS from 'ember-data';

/**
 * Represents an applied rule to a set of transactions
 */
export default DS.Model.extend({

    init() {
        this._super(...arguments);
    },

    //////// ATTRIBUTES ////////

    /**
     * The search expression for matching the journal
     */
    expression: DS.attr(),
    /**
     * The category we are assigning from this rule
     */
    path: DS.attr(),
    /**
     * The ammount minimum for the rule or null
     */
    amount_from: DS.attr(),
    /**
     * The amount max for the rule or null
     */
    amount_to: DS.attr(),
    /**
     * The date the rule was created
     */
    create_date: DS.attr(),
    /**
     * A generated client side public key for tracking purposes
     */
    public_key: DS.attr()
});

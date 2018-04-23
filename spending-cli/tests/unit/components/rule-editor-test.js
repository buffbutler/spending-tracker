import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import Object from '@ember/object';

module('Unit | Component | rule-editor', function(hooks) {
  setupTest(hooks);

  /*
  function createSampleData() {
    var result = [];

    result.push(Object.create({id: 1, name: 'Sample Food Expense', amount: 1, path_classification: "zzz", applied_rule: "abc" }));
    result.push(Object.create({id: 2, name: 'Sample Car Expense', amount: 3, path_classification: "zzz", applied_rule: "manual"}));
    result.push(Object.create({id: 3, name: 'Sample Food Expense', amount: 7, path_classification: "zzz", applied_rule: "abc"}));
    result.push(Object.create({id: 4, name: 'Sample Food Expense', amount: 23}));
    result.push(Object.create({id: 5, name: 'Sample Car Expense', amount: 31}));
    result.push(Object.create({id: 6, name: 'Sample Hockey Expense', amount: 31}));

    return result;
  }
  */

  test('rule can be applied to an unassigned journal name with text contained', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 1 });
    let ruleRecord = Object.create({public_key: "yyy", expression: "food"});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.ok(result, "rule could NOT be assigned when it should be");
  });

  test('rule can NOT be applied to an unassigned journal name with INCORERCT text contained', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 1 });
    let ruleRecord = Object.create({public_key: "yyy", expression: "bacon"});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.notOk(result, "rule could be assigned when it should NOT be");
  });


  test('rule can be applied to an unassigned journal within min ', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 7 });
    let ruleRecord = Object.create({public_key: "yyy", amount_from: 4});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.ok(result, "rule could NOT be assigned when it should be");
  });


  test('rule can NOT be applied to an unassigned journal NOT within min', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 7 });
    let ruleRecord = Object.create({public_key: "yyy", amount_from: 10});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.notOk(result, "rule could be assigned when it should NOT be");
  });


  test('rule can be applied to an unassigned journal within max ', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 7 });
    let ruleRecord = Object.create({public_key: "yyy", amount_to: 10});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.ok(result, "rule could NOT be assigned when it should be");
  });


  test('rule can NOT be applied to an unassigned journal NOT within max', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 7 });
    let ruleRecord = Object.create({public_key: "yyy", amount_to: 3});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.notOk(result, "rule could be assigned when it should NOT be");
  });


  test('rule can NOT be applied to an unassigned journal NOT within max', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 7 });
    let ruleRecord = Object.create({public_key: "yyy", amount_from: 3, amount_to: 10});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.ok(result, "rule could NOT be assigned when it should be");
  });



  test('rule can NOT be applied to an unassigned journal NOT within max', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 17 });
    let ruleRecord = Object.create({public_key: "yyy", amount_from: 3, amount_to: 10});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.notOk(result, "rule could be assigned when it should NOT be");
  });


  test('rule can not be applied to an ASSIGNED journal name with text contained', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 1, path_classification: "zzz", applied_rule: "abc" });
    let ruleRecord = Object.create({public_key: "yyy", expression: "food"});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.notOk(result, "rule could be assigned when it should NOT be");
  });

  /*
  NOT RELIVANT

  test('rule can be applied to an ASSIGNED journal name with the SAME rule text contained', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 1, path_classification: "zzz", applied_rule: "abc" });
    let ruleRecord = Object.create({public_key: "zzz", expression: "food"});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: false,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.ok(result, "rule could NOT be assigned when it should be");
  });
  */

  //"Removed"

  test('rule CAN be applied to an ASSIGNED journal name with text contained if override is set', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 1, path_classification: "zzz", applied_rule: "abc" });
    let ruleRecord = Object.create({public_key: "yyy", expression: "food"});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: true,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.ok(result, "rule could NOT be assigned when it should be");
  });

  test('rule CAN NOT be applied to a MANUAL journal name with text contained if only basic override is set', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 1, path_classification: "zzz", applied_rule: "manual" });
    let ruleRecord = Object.create({public_key: "yyy", expression: "food"});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: true,
      assignManual: false
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.notOk(result, "rule could be assigned when it should NOT be");
  });


  test('rule CAN be applied to a MANUAL journal name with text contained if full override is set', function(assert) {
    let journalRecord = Object.create({id: 1, name: 'Sample Food Expense', amount: 1, path_classification: "zzz", applied_rule: "manual" });
    let ruleRecord = Object.create({public_key: "yyy", expression: "food"});

    let component = this.owner.factoryFor('component:rule-editor').create({
      assignPrevious: true,
      assignManual: true
    });

    let result = component.canApplyRuleToJournalRecord(ruleRecord, journalRecord);

    assert.ok(result, "rule could NOT be assigned when it should be");
  });
});

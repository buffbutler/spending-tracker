import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Object from '@ember/object';

module('Unit | Component | journal-display', function(hooks) {
  setupTest(hooks);

  function createSampleData() {
    var result = [];

    result.push(Object.create({id: 1, name: 'Sample Food Expense', amount: 1}));
    result.push(Object.create({id: 1, name: 'Sample Car Expense', amount: 3}));
    result.push(Object.create({id: 3, name: 'Sample Food Expense', amount: 7}));

    return result;
  }

  test('can select an item', function(assert) {
    //configure
    var sampleData = createSampleData();

    let component = this.owner.factoryFor('component:journal-display').create({
      journal: sampleData
    });

    //run
    component.actions.selectItem.call(component, sampleData[0]);

    //assert
    let selectedRowId = component.get('selected').get('id');
    assert.equal(selectedRowId, 1, "The journal row was selected");
  });


  test('can auto un select an item', function(assert) {
    //configure
    var sampleData = createSampleData();

    let component = this.owner.factoryFor('component:journal-display').create({
      journal: sampleData
    });

    component.actions.selectItem.call(component, sampleData[0]);

    //run
    component.doUnselectItem();
    
    //assert
    let selectedRow = component.get('selected');
    assert.notOk(selectedRow, "The journal row was unselected");
  });

});

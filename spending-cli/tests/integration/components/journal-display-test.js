import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import sampleData from './sample-data';
import $ from 'jquery'

module('Integration | Component | journal-display', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('journal', sampleData.createSampleData());
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{journal-display journal=journal}}`);

    // Template block usage:
    await render(hbs`
      {{#journal-display}}
        template block text
      {{/journal-display}}
    `);

    assert.ok('render success');
  });

  
  test('it shows the list of items unfiltered', async function(assert) {
    this.set('journal', sampleData.createSampleData());

    await render(hbs`{{journal-display journal=journal}}`);

    let val = this.$(".journal-row div");

    assert.equal(val.length, 9, "The journal displays 3 items");
    assert.equal($(val[0]).html().trim(), "Name: Sample Food Expense", "The journal shows the name");
  });

 /*  
  test('You can select a row', async function(assert) {
    //configure
    this.set('journal', sampleData.createSampleData());

    await render(hbs`{{journal-display journal=journal selected=selected}}`);

    //run
    let firstRow = this.$(".journal-row")[0];
    click(firstRow);

    //assert
    let selectedRowId = this.owner.get('selected').get('id');
    assert.equal(selectedRowId, 1, "The journal row was selected");
  });
 
  test('un select an item on journal model change', function(hooks) {

  });
  */
});

/*
module('Unit | Component | journal-display', function(hooks) {

  setupTest(hooks);

  test('You can select a row', function(assert) {
    const component = this.subject({'journal': sampleData.createSampleData()});
    assert.equal(component.get('foo'), 'foo2');
  });

});
*/


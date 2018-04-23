import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import sampleData from './sample-data';

module('Integration | Component | journal-report', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('journal', sampleData.createSampleData());
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{journal-report journal=journal}}`);

    assert.ok('render success');
  });
});

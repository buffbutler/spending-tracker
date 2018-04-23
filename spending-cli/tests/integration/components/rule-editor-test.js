import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

import sampleData from './sample-data';

module('Integration | Component | rule-editor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('journal', sampleData.createSampleData());
    this.set('rules', []);
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{rule-editor journal=journal rules=rules}}`);

    assert.ok('render success');
  });
});

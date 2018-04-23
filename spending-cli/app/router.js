import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('workspace', {path: 'spending/workspace/:wspid'}, function() {
      this.route('journal');
  });
});

export default Router;

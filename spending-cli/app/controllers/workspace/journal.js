import Controller from '@ember/controller';

export default Controller.extend({

    saveChanges() {
        this.get('store').peekAll('rule').forEach((current) => {
            if (current.get('hasDirtyAttributes')) {
                current.save();
            }
        });

        this.get('store').peekAll('journal').forEach((current) => {
            if (current.get('hasDirtyAttributes')) {
                let changes = current.changedAttributes();
                let path = current.get('path_classification');

                if (changes.path_classification && path && path.length > 0) {
                    current.save();
                }
            }
        });
    }
});

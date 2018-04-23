import Object from '@ember/object';

export default {    
  createSampleData() {
    var result = [];

    result.push(Object.create({id: 1, name: 'Sample Food Expense', amount: 1}));
    result.push(Object.create({id: 1, name: 'Sample Car Expense', amount: 3}));
    result.push(Object.create({id: 3, name: 'Sample Food Expense', amount: 7}));

    return result;
  }
};
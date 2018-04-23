import { helper } from '@ember/component/helper';

export function formatCurrency([value, ...rest]) {
  /**
   * https://guides.emberjs.com/v3.1.0/templates/writing-helpers/
   * From the ember demo... the sauce had some fail in it.  The original function
   * assumed numbers were in cents.  Not very..... helpful ;)
   */
  let dollars = Math.floor(value);
  let cents = Math.floor((value * 100) % 100);
  let sign = '$';

  if (cents.toString().length === 1) { cents = '0' + cents; }
  
  let result = sign + dollars + '.' + cents;

  return result;
}

export default helper(formatCurrency);

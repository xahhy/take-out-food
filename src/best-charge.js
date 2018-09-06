const loadAllItems = require('./items');
const allItems = loadAllItems();
const HEADER = '============= 订餐明细 =============\n';
const SPLIT_LINE = '-----------------------------------\n';
const TAIL_LINE = '===================================';
const ITEM_TEMPLATE = '${name} x ${number} = ${subTotalAmount}元\n';
const TOTAL_TEMPLATE = '总计：${totalAmount}元\n';

function resolveTemplate(obj, template) {
  return [...Object.keys(obj)].reduce((tpl, key) => {
    return tpl.replace('${' + key + '}', obj[key]);
  }, template);
}

function getItemsMap(selectedItems) {
  let itemsMap = {};
  selectedItems.map(item => {
    if (item.indexOf('x') > -1) {
      let [_name, _number] = item.split('x');
      _name = _name.trim();
      _number = _number.trim();
      itemsMap[_name] = itemsMap[_name] ? itemsMap[_name] += _number : _number;
    }else {
      itemsMap[item] = itemsMap[item] ? itemsMap[item] += 1 : 1;
    }
  });
  return itemsMap;
}

function getItemsInfo(itemsMap) {
  return allItems.filter(item => itemsMap.hasOwnProperty(item.id)).map(item => Object.assign({...item}, {number: itemsMap[item.id]}));
}

function bestCharge(selectedItems) {
  let itemsMap = getItemsMap(selectedItems);//Parse input and generate item map like: {ITEM0:'1', ITEM2:'2'}
  getItemsInfo(itemsMap);

}
module.exports = {
  getItemsMap,bestCharge,getItemsInfo
}

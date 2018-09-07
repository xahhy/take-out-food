const loadAllItems = require('./items');
const loadPromotions = require('./promotions');
const sum = (sum, num) => sum += num;
const allItems = loadAllItems();
const allPromotions = loadPromotions();
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
    } else {
      itemsMap[item] = itemsMap[item] ? itemsMap[item] += 1 : 1;
    }
  });
  return itemsMap;
}

function getItemsInfo(itemsMap) {
  return allItems.filter(item => itemsMap.hasOwnProperty(item.id)).map(item => Object.assign({...item}, {number: itemsMap[item.id]}));
}
function getTotalAmount(itemsInfo){
  return   itemsInfo.map(item => item.price * item.number).reduce(sum, 0);
}
function getPromotion1Total(itemsInfo) {
  let totalAmount = getTotalAmount(itemsInfo);
  if (totalAmount >= 30)return 6;
  return 0;
}

function getPromotion2Total(itemsInfo, items) {
  return itemsInfo.filter(item=>items.includes(item.id))
    .map(item=> item.price * item.number / 2).reduce(sum, 0);
}

function getPromotion(itemsInfo) {
  let promotion1 = allPromotions.find(promotion => promotion.type === '满30减6元');
  let promotion2 = allPromotions.find(promotion => promotion.type === '指定菜品半价');
  let promotion1Amount = getPromotion1Total(itemsInfo);
  let promotion2Amount = getPromotion2Total(itemsInfo, promotion2.items);
  if(promotion1Amount >= promotion2Amount){
    return promotion1;
  }else {
    return Object.assign(promotion2,{promotionAmount: promotion2Amount.toFixed(2)})
  }
}

function bestCharge(selectedItems) {
  let itemsMap = getItemsMap(selectedItems);//Parse input and generate item map like: {ITEM0:'1', ITEM2:'2'}
  let itemsInfo = getItemsInfo(itemsMap);
  let promotion = getPromotion(itemsInfo);

}

module.exports = {
  getItemsMap, bestCharge, getItemsInfo, getPromotion
}

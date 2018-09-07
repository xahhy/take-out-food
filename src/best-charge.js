const loadAllItems = require('./items');
const loadPromotions = require('./promotions');
const sum = (sum, num) => sum += num;
const allItems = loadAllItems();
const allPromotions = loadPromotions();
const HEADER = '============= 订餐明细 =============\n';
const SPLIT_LINE = '-----------------------------------\n';
const TAIL_LINE = '===================================';
const ITEM_TEMPLATE = '${name} x ${number} = ${subTotalAmount}元';
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
      itemsMap[_name] = parseInt(itemsMap[_name] ? itemsMap[_name] += _number : _number);
    } else {
      itemsMap[item] = itemsMap[item] ? itemsMap[item] += 1 : 1;
    }
  });
  return itemsMap;
}

function getItemsInfo(itemsMap) {
  return allItems.filter(item => itemsMap.hasOwnProperty(item.id)).map(
    item => Object.assign({...item}, {number: itemsMap[item.id], subTotal: (itemsMap[item.id] * item.price)}
    ));
}

function getTotalAmount(itemsInfo) {
  return itemsInfo.map(item => item.price * item.number).reduce(sum, 0);
}

function getPromotion1Total(itemsInfo) {
  let totalAmount = getTotalAmount(itemsInfo);
  if (totalAmount >= 30) return 6;
  return 0;
}

function getPromotion2Total(itemsInfo, items) {
  return itemsInfo.filter(item => items.includes(item.id))
    .map(item => item.price * item.number / 2).reduce(sum, 0);
}

function getPromotion(itemsInfo) {
  let promotion1 = allPromotions.find(promotion => promotion.type === '满30减6元');
  let promotion2 = allPromotions.find(promotion => promotion.type === '指定菜品半价');
  let promotion1Amount = getPromotion1Total(itemsInfo);
  let promotion2Amount = getPromotion2Total(itemsInfo, promotion2.items);
  if (promotion1Amount === 0 && promotion2Amount === 0) {
    return {};
  }
  if (promotion1Amount >= promotion2Amount) {
    return promotion1;
  } else {
    return Object.assign(promotion2, {promotionAmount: promotion2Amount})
  }
}

function getTotal(itemsInfo, promotion) {
  let totalAmount = getTotalAmount(itemsInfo);
  if (promotion.type) {
    switch (promotion.type) {
      case '满30减6元':
        totalAmount -= 6;
        break;
      case '指定菜品半价':
        totalAmount -= promotion.promotionAmount;
        break;
      default:
        break;
    }
    return {total: totalAmount};
  } else {
    return {total: totalAmount}
  }
}

function renderOutput(itemsInfo, promotion, total) {
  let itemBody = itemsInfo.map(item => `${item.name} x ${item.number} = ${item.subTotal}元`).join('\n') + '\n';
  let promotionBody=null;
  switch (promotion.type) {
    case '满30减6元':
      promotionBody = `使用优惠:
满30减6元，省6元
`;
      break;
    case '指定菜品半价':
      promotionBody = `使用优惠:
指定菜品半价(${promotion.items.map(code => itemsInfo.find(item => item.id === code).name).join('，')})，省${promotion.promotionAmount}元
`;
      break;
    default:
      break;
  }
  if (promotionBody) promotionBody += SPLIT_LINE;
  let totalBody = `总计：${total.total}元
`;
  return [HEADER, itemBody, SPLIT_LINE, promotionBody, totalBody, TAIL_LINE].join('');
}

function bestCharge(selectedItems) {
  let itemsInfo = getItemsInfo(getItemsMap(selectedItems));
  let promotion = getPromotion(itemsInfo);
  let total = getTotal(itemsInfo, promotion);
  return renderOutput(itemsInfo, promotion, total);
}

module.exports = {
  getItemsMap, bestCharge, getItemsInfo, getPromotion, getTotal
}

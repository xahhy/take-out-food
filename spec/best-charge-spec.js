const {getItemsMap, bestCharge, getItemsInfo, getPromotion} = require('../src/best-charge');

describe('Take out food', function () {

  xit('should generate best charge when best is 指定菜品半价', function () {
    let inputs = ["ITEM0001 x 1", "ITEM0013 x 2", "ITEM0022 x 1"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
黄焖鸡 x 1 = 18元
肉夹馍 x 2 = 12元
凉皮 x 1 = 8元
-----------------------------------
使用优惠:
指定菜品半价(黄焖鸡，凉皮)，省13元
-----------------------------------
总计：25元
===================================`.trim()
    expect(summary).toEqual(expected)
  });

  xit('should generate best charge when best is 满30减6元', function () {
    let inputs = ["ITEM0013 x 4", "ITEM0022 x 1"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
肉夹馍 x 4 = 24元
凉皮 x 1 = 8元
-----------------------------------
使用优惠:
满30减6元，省6元
-----------------------------------
总计：26元
===================================`.trim()
    expect(summary).toEqual(expected)
  });

  xit('should generate best charge when no promotion can be used', function () {
    let inputs = ["ITEM0013 x 4"];
    let summary = bestCharge(inputs).trim();
    let expected = `
============= 订餐明细 =============
肉夹馍 x 4 = 24元
-----------------------------------
总计：24元
===================================`.trim();
    expect(summary).toEqual(expected)
  });

});
describe('Take out food Model', function () {
  it('should get one food code numbers model', function () {
    let items = ["ITEM0013 x 4"];
    let expectItems = {'ITEM0013': '4'};
    expect(getItemsMap(items)).toEqual(expectItems);
  });
  it('should get multiple food codes numbers model', function () {
    let items = ["ITEM0013 x 4", "ITEM0030 x 6"];
    let expectItems = {ITEM0013: '4', ITEM0030: '6'};
    expect(getItemsMap(items)).toEqual(expectItems);
  });
  it('should get food information model', function () {
    let items = ["ITEM0013 x 4"];
    let expectItems = [
      {
        id: 'ITEM0013',
        name: '肉夹馍',
        price: 6.00,
        number: '4'
      }
    ];
    expect(getItemsInfo(getItemsMap(items))).toEqual(expectItems);
  });
  it('should return promotion 1 model', function () {
    let items = ["ITEM0013 x 5"];
    let expectPromotion = {
      type: '满30减6元'
    };
    expect(getPromotion(getItemsInfo(getItemsMap(items)))).toEqual(expectPromotion);
  });
  it('should return promotion 2 model', function () {
    let items = ["ITEM0001 x 5"];
    let expectPromotion = {
      type: '指定菜品半价',
      items: ['ITEM0001', 'ITEM0022'],
      promotionAmount: '45.00'
    };
    let promotion = getPromotion(getItemsInfo(getItemsMap(items)));
    expect(promotion).toEqual(expectPromotion);
  });
});

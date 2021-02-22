var util = require('../../../../utils/api.js');
class GuKuList {
    constructor(url) {
        this.url = url;
    }
    getGukuData(cb) {
        this.cb = cb;
        util.requestGetApi(this.url,[],this.processGukuData.bind(this));
    }
    processGukuData(res) {
        //console.log(res)
    	var detailject = res.data.shop;
        var detailtype = res.data.package;
        if (!detailject) {
            return;
        }
        var guku_detail = {
            payment_method    : detailject.payment_method,//银联
            icon              : detailtype.icon,//相同商品不同节点状态
            picture_url       : detailtype.picture_url ? detailtype.picture_url : "",//默认图片地址
            dissipate_list    : detailtype.dissipate_list,//可消费时间
            dissipate		  : detailject.business_hours_list,//营业时间
            mealsList		  : detailtype.set_meals_include,//套餐包含
            introduction	  : detailtype.package_introduction,//套餐介绍
            shopIntroduction  : detailject.shop_introduction,//店铺介绍
            pictures		  : detailject.shop_pic,//店铺pic
            position		  : detailject.address,//位置
            businessHours	  : detailject.business_hours,//营业时间
            seat 			  : detailject.seat,//席位
            phoneCall		  : detailject.phone,//电话
            package_name	  : detailtype.package_name,//套餐name
            latitude		  : detailject.latitude,//经纬度
            longitude		  : detailject.longitude,
            full_category     : detailtype.full_category
        }
        var commod_list ={//shop List 单独 data 处理
            currency          : detailtype.currency,//价格
            cash_coupon       : detailject.cash_coupon,//代金券
            cash_coupon_status: 'no',//代金券
            name              : detailject.shop_name,//套餐name
            package_name      : detailtype.package_name,
            package_type      : detailtype.package_type.join("  |   "),//套餐类型x
            distance          : detailtype.distance===undefined?0+'m':detailtype.distance,//距离
            discount          : detailtype.discount,//折扣
            original_price    : detailtype.original_price,//原始价格
            discounted_price  : detailtype.discounted_price,//折后价格
            full_category     : detailtype.full_category,
            wifi              : detailject.wifi
            
        } 
        this.cb(guku_detail,commod_list);
    }
}
export {GuKuList}
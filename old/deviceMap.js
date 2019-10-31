//引入高德地图工具文件
var amapFile = require("../../../utils/amap-wx.js");
const apps = getApp();

var markersData = [];
Page({
  data: {
    myAmapFun: null,//高德地图对象
    //marker 设备位置信息
    markers: [{ id: "1", latitude: "30.50037", longitude:"114.34335",name:"香蕉测试1",mac:"11-22-33-44-55-66",imei:"201910291655001"}],
    latitude: '',
    longitude: '',
    //全局设备的icon图标路径
    iconPath:"../../../images/map/marker.png",
    //底部信息展示操作
    showInfo:false,
    //显示线路规划的线路(由各个经纬度的点构成)
    polyline: [],
    //线路规划详情
    detailSteps:{},
    //底部信息显示内容  
    textData: {}
  },
  onLoad: function () {
    var that = this;
    this.data.myAmapFun = new amapFile.AMapWX({ key: apps.gdMapProperties.key });
    //授权检测
    getPermission(this);
  },
  //地图上的marker的点击事件
  makertap: function (e) {
    console.log("marker点击事件");
    var id = e.markerId;
    console.log("marker  id = "+id);
    var that = this;
    //显示设备信息
    that.setData({
      showInfo:true
    });
    that.showMarkerInfo(that.data.markers, 0);
    //that.changeMarkerColor(markersData, id);

  },
  //点击驾车线路规划
  gotobyDriver:function(){
    console.log("驾车出行");
    //通过api  获取线路点数
    var that = this;
    this.data.myAmapFun.getDrivingRoute({
      origin:that.data.longitude+","+that.data.latitude,
      destination: that.data.markers[0].longitude + "," + that.data.markers[0].latitude,
      success:function(data){
        //获取当前经纬度信息到目标经纬度信息间无数个经纬度点位
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          //保存信息详情
          that.setData({
            detailSteps: steps
          });
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]
        });
      },
      fail: function (info) {

      }
    });
  },
  //步行出行
  gotobywalk:function(){
    console.log("步行出行");
    //通过api  获取线路点数
    var that = this;
    this.data.myAmapFun.getWalkingRoute({
      origin: that.data.longitude + "," + that.data.latitude,
      destination: that.data.markers[0].longitude + "," + that.data.markers[0].latitude,
      success: function (data) {
        //获取当前经纬度信息到目标经纬度信息间无数个经纬度点位
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          console.log(JSON.stringify(steps));
          //保存信息详情
          that.setData({
            detailSteps: steps
          });
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]
        });
      },
      fail: function (info) {

      }
    });
  },
  showMarkerInfo: function (data, i) {
    var that = this;
    that.setData({
      textData: {
        name: data[i].name,
        mac: data[i].mac,
        imei:data[i].imei
      }
    });
  },

  // changeMarkerColor: function (data, i) {
  //   var that = this;
  //   var markers = [];
  //   for (var j = 0; j < data.length; j++) {
  //     if (j == i) {
  //       data[j].iconPath = "选中 marker 图标的相对路径"; //如：..­/..­/img/marker_checked.png
  //     } else {
  //       data[j].iconPath = "未选中 marker 图标的相对路径"; //如：..­/..­/img/marker.png
  //     }
  //     markers.push(data[j]);
  //   }
  //   that.setData({
  //     markers: markers
  //   });
  // },
  //点击地图
  onclickMap:function(e){ 
    console.log("点击地图 "+JSON.stringify(e));
    //console.log(e.detail);
    //隐藏 信息显示
    this.setData({
      showInfo: false,
      //去掉线路显示
      polyline: [],
      //线路规划详情
      detailSteps: {},
    });
  }

})

//授权检测
function getPermission(obj) {
  obj.data.myAmapFun.getPoiAround({
    success: function (data) {
      console.log("获取poi数据成功回调：" + JSON.stringify(data));
      markersData = data.markers;
      //判断获取的位置信息数
      if(markersData.length > 0){
        //存在数据  取第一条数据作为当前用户的位置信息值
        obj.setData({
          latitude: markersData[0].latitude,
          longitude: markersData[0].longitude,
        });
      }else{
        //不存在位置信息时，采取微信自带地图实现定位效果
        wx.getLocation({
          type: 'gcj02',
          success: function(res) {
            //显示经纬度信息
            obj.setData({
              latitude: res.latitude,
              longitude: res.longitude
            });
          },
          fail: function () {
            //失败则采取中国北京作为地图显示
            obj.setData({
              latitude: 39.909729,
              longitude: 116.398419
            });
          }
        })
      }

    },
    fail: function (info) {
      console.log("获取poi数据失败回调:" + info);
      //如果失败 则先检测权限是否给予
      wx.getSetting({
        success: function (res) {
          var statu = res.authSetting;
          if (!statu['scope.userLocation']) {
            wx.showModal({
              title: '是否授权当前位置',
              content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
              success: function (tip) {
                if (tip.confirm) {
                  wx.openSetting({
                    success: function (data) {
                      if (data.authSetting["scope.userLocation"] === true) {
                        wx.showToast({
                          title: '授权成功',
                          icon: 'success',
                          duration: 1000
                        })
                        //授权成功之后，再调用定位进行位置获取
                        getPermission(obj);
                      } else {
                        wx.showToast({
                          title: '授权失败',
                          icon: 'success',
                          duration: 1000
                        })
                      }
                    }
                  })
                }
              }
            })
          }
        },
        fail: function (res) {
          wx.showToast({
            title: '调用授权窗口失败',
            icon: 'success',
            duration: 1000
          })
        }
      })

    }
  })
}
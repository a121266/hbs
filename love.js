/**
 * Created by Administrator on 2016/3/20.
 */
 


angular.module('kaifanla',['ng','ngRoute','ngAnimate']).
    controller('parentCtr',function($scope,$location){
        $scope.jump = function(routPath){
            $location.path(routPath);
        }
    }).controller('startCtr',function($scope){
		$scope.login = function(){
				 console.log("111");
				 //location.href="main.html"; 
				 jump('/main')
			  //获得用户的所有输入——表单序列化
			  var requestData = $('#login-form').serialize();
			  /**将用户输入异步提交给服务器，进行用户名和密码的验证**/
			  //$.post()  $.ajax()
			  $http.get('data/1_check_login.php?uname=qiangdong&upwd=123456', function(data){
				  console.log(data.code);
				  console.log(requestData);
				if(data.code!==1){ //登录失败
				  $('.modal .alert').html(data.msg);
				}else{ //登录成功
				  $('.modal').fadeOut(500);
				  location.href="main.html"; 
				 // var uname = $('[name="uname"]').val();
				  //$('#welcome').html('欢迎回来：'+uname);
				  //获取当前用户的订单(第1页)
				  getMyOrders(uname, 1);
				}
			  });
			  
			}
    }).controller('mainCtr',function($scope,$http){
        /*加载数据*/
        $scope.hasMore = true;  //是否还有更多数据可供加载
        //$scope.dishList = [];  //用于保存所有菜品数据的数组
        //控制器初始化/页面加载时，从服务器读取最前面的5条记录
        $http.get('data/dish_getbypage.php?start=0').
            success(function(data){
                $scope.dishList = data;//$scope.dishList.concat(data);
            });
        //“加载更多”按钮的单击事件处理函数：每点击一次，加载更多的5条数据
        $scope.loadMore = function(){
            $http.get('data/dish_getbypage.php?start='+$scope.dishList.length).
                success(function(data){
                    if(data.length<5){  //服务器返回的菜品数量不足5条
                        $scope.hasMore = false;
                    }
                    $scope.dishList = $scope.dishList.concat(data);
                });
        }

		//登录验证
			
        //监视搜索框中的内容是否改变——监视 kw Model变量
        $scope.$watch('kw', function(){

            if( $scope.kw ){
                $http.get('data/dish_getbykw.php?kw='+$scope.kw).
                    success(function(data){
                        $scope.dishList = data;
                    })
            }
        })
    }).controller('detailCtr',function($scope,$http, $routeParams){
        //读取路由URL中的参数
        //console.log($routeParams.dishid)
        $http.get('data/dish_getbyid.php?id='+$routeParams.dishid).
            success(function(data){
                //console.log('接收到服务器返回的房产详情：')
                //console.log(data);
                $scope.dish = data[0];
            })
    }).controller('orderCtr',function($scope,$http,$routeParams,$rootScope){
        //console.log($routeParams.dishid);
        //定义order对象，用于保存order数据
        $scope.order = {"did":$routeParams.dishid};
        $scope.submitOrder = function(){
            
            var str = jQuery.param($scope.order);
            $http.get('data/order_add.php?'+str).
                success(function(data){
                    //console.log(data[0].msg);

                    if(data[0].msg == 'succ'){
                        $scope.succMsg = '订房成功！您的订单编号为：'+data[0].did+'。您可以在用户中心查看订单状态。'
                        //记载用户手机号，用于查询订单
                        $rootScope.phone = $scope.order.phone;
                    }else {
                        $scope.errMsg = '订房失败！错误码为：'+data[0].reason;
                    }
                    //console.log($scope.succMsg);
                    //console.log($scope.errMsg);
                })
        }
    }).controller('myorderCtr',function($scope,$http,$rootScope){
        //console.log($rootScope.phone);
        $http.get('data/order_getbyphone.php?phone='+$rootScope.phone).
            success(function(data){
                 $scope.orderList = data;
                console.log(data);
        });
    }).config(function($routeProvider){
        $routeProvider.
            when('/start',{
                templateUrl: 'tpl/start.html',
                controller: 'startCtr'
            }).
            when('/main',{
                templateUrl:'tpl/main.html',
                controller:'mainCtr'
            }).
            when('/detail/:dishid',{
                templateUrl:'tpl/detail.html',
                controller:'detailCtr'
            }).
            when('/order/:dishid',{
                templateUrl:'tpl/order.html',
                controller:'orderCtr'
            }).
            when('/myorder',{
                templateUrl:'tpl/myorder.html',
                controller:'myorderCtr'
            }).
            otherwise({
                redirectTo:'/start'
            })
    })


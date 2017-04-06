'use strict'

let API = '23efde7c76319e9e6db40a16b776d2e1';
let currentURL = 'http://api.openweathermap.org/data/2.5/weather';
let hourlyURL = 'http://api.openweathermap.org/data/2.5/forecast';
let dailyURL = 'http://api.openweathermap.org/data/2.5/forecast/daily';
let colorArr = ['#F5BE25','#33B679','#565D80','#457AD1','#89929F','#2D566B','#227585','#861E6A','#572768'];

$(function(){

	// 首页
	let wrapper = $('.wrapper');
	let sidebar = $('.sidebar');
	let dropdown = $('.dropdown');
	let content = $('.content');
	let more =$('.more');
	let sideview = $('.sidebar-view');

	// 搜索页
	let searchwarpper =	$('.searchwarpper'); 

	// 输入框键盘事件和聚焦事件
    $('.search').keydown(function(data) {
        if (data.which === 13) {
            judged();
        } else {
            //不是enter键时，即当用户有输入时，提示消失
            $('.error').fadeOut('slow');
            $('.error-empty').fadeOut('slow');
        }
    }).focus(function() {
        // 输入框聚焦时提示消失
        $('.error').fadeOut('slow');
        $('.error-empty').fadeOut('slow');
        $('.search').val('');
    });
    // 按钮点击事件
    $('.search-btn').click(function() {
        judged();
    });

    // 从本地异步获取数据
	// let cityStorage = storage.fetch();
	// if(cityStorage.length !== 0 ){			
	// 	vapp.active = !vapp.active;
	// 	// asyncDataRequest(cityStorage);
	// }else{
	// 	vapp.active = vapp.active;			//本地没有则回到搜索页
	// }
})

// 封装判断搜索框是否为空和空格的函数
function judged() {
    //enter键时如果为空则提示                  
    if ($('.search').val() === '') {
        $('.error').fadeIn('slow');
        //enter键时如果为空格，一个或多个空格trim()后都为空;则提示
    } else if ($('.search').val().trim() === '') {
        // 提示框在1s后消失，并且输入框聚焦
        $('.error-empty').fadeIn(1000, function() {
            $('.search').focus();
        });
    } else {
        $('.search').val('');
    }
}

// 数据请求
// function getData(url,searchKey){
// 	let dynamicData = {
// 		'q':searchKey,
// 		'units':'metric',
// 		'appid':API,
// 	}
// 	return $.ajax({
// 		url: url,
// 		type: 'GET',
// 		data: dynamicData,
// 	})
// }

// 异步请求
// async function asyncDataRequest(cityList){

// 	await Promise.all(cityList.map(async item =>{
// 		let city = item.text;
// 		vapp.curData.push(changeCurData(await getData(currentURL,city)));
// 	}))
// }

// localstorage本地存储
const STORAGE_KEY = 'cityname';

let storage = {
	fetch:function(){
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	},
	save:function(cityList){
		localStorage.setItem(STORAGE_KEY,JSON.stringify(cityList));	
	}
}

let  vapp = new Vue({

	el:'.container',

	data:{
		// 页面跳转标识位
		active:false,	
		newCity:'',
		cityList:storage.fetch(),
		curData:[],
		curTime:null,
		// 侧边栏标识位
		sideBarFlag:false
	},

	watch:{
		cityList:{
			handler:function(cityList){
				storage.save(cityList);
			},
			deep:true
		}
	},
	created:function(){
		this.getLocalData();
	},
	methods:{
		//————首页—————//
		sideBarShow:function(e){
			if(e.target.className == 'sidebar'){
				this.sideBarFlag = this.sideBarFlag;
			}else{
				this.sideBarFlag = !this.sideBarFlag;
			}
		},

		//————搜索页—————//
		addCity:function(e){
			this.active = !this.active;
			this.sideBarFlag = !this.sideBarFlag;
		},
		goBack:function(){
			this.active = !this.active;
			this.sideBarFlag = !this.sideBarFlag;
		},

		// 搜索框
		addNew:function(){
			let text = this.newCity.trim();
			if(text){
				// 处理本地存储是否有重复项,即过滤城市名（text）
				let cityStorage = storage.fetch();
				let oLen = cityStorage.length;
				// 存放城市名的数组
				let arr = [];
				for(let i=0;i<oLen;i++){
						arr.push(cityStorage[i].text);
					}
				let index = arr.indexOf(text);
				// 将本地数组的text取出来，根据text数组的index判断是否已存在
				if(oLen === 0 || index === -1){
					this.cityList.push({
						text:text,
						color:colorArr[Math.floor(Math.random()*colorArr.length)]
					});
					this.getData(currentURL,text)
						.then(
							(data)=>{this.curData.push(changeCurData(data.body));},
							()=>{console.log('fail!')}
						)
				}
				this.newCity = '';
				this.active = !this.active;
				this.sideBarFlag = !this.sideBarFlag;
			}

		},
		// 获取数据
		getData:function(url,searchKey){
			let dynamicData = {
				'q':searchKey,
				'units':'metric',
				'appid':API,
			}
			return this.$http.get(url,{params:dynamicData});
		},
		// 获取本地数据
		getLocalData:function(){
			let cityStorage = storage.fetch();
				if(cityStorage.length !== 0 ){		
					// console.log(this.active);
					this.active = !this.active;
					cityStorage.map(item =>{
						let city = item.text;
						this.getData(currentURL,city)
							.then( 
									(data)=>{this.curData.push(changeCurData(data.body))},
									()=>{console.log('fail!')}
									)
					})
				}else{
					this.active = this.active;			//本地没有则回到搜索页
				}
		},
		// 删除
		removeCity:function(index){
			let cityStorage = storage.fetch();
			let city = this.curData[index].name.toLowerCase();
			let arr = [];
			for(let i=0;i<cityStorage.length;i++){
				arr.push(cityStorage[i].text);
			}
			// 待删除项的索引
			let id = arr.indexOf(city);
			this.cityList.splice(id, 1);
			this.curData.splice(index,1);
			if(this.cityList.length === 0){
				this.active = !this.active;
			}
			
		},
		// 刷新
		refresh:function(){
			window.location.reload();
		},
	},
	computed:{
		// 实时时间
		curTime:function(){
			let date = new Date();
			let hou = date.getHours()<10?`0${date.getHours()}`:date.getHours();
			let min = date.getMinutes()<10?`0${date.getMinutes()}`:date.getMinutes();
			return `${hou}:${min}`
		}
	}
})

// 数据处理
function changeCurData(data) {

    let currentDate = changeDate(data.dt);
    data.weather[0].imgSrc = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    data.main.temp = data.main.temp.toFixed(0);
    data.date = `${currentDate.oYear}/${currentDate.oMonth}/${currentDate.oDay} ${currentDate.oAMPM} ${currentDate.oHour<12?currentDate.oHour:(currentDate.oHour-12)}:${currentDate.oMinute}`;
    data.sys.sunrise = `${changeDate(data.sys.sunrise).oHour}:${changeDate(data.sys.sunrise).oMinute}`;
    data.sys.sunset = `${changeDate(data.sys.sunset).oHour}:${changeDate(data.sys.sunset).oMinute}`;
    data.deleteShow = false;
    return data;
}

function changeDate(data) {

    let curDate = new Date(data * 1000),
        curDateStr = curDate.toDateString(),
    	curYear = curDate.getFullYear(), //年
        curMonth = curDate.getMonth() + 1, //月
        curWeek = curDate.getDay(), //星期
        curDay = curDate.getDate(), //日
        curHour = curDate.getHours() < 10 ? `0${curDate.getHours()}` : curDate.getHours(), //小时，小于10的表示为0x
        curMinute = curDate.getMinutes() < 10 ? `0${curDate.getMinutes()}` : curDate.getMinutes(), //分钟
    	amorpm = curHour >= 12 ? '下午' : '上午'; //上、下午
    return {
        oDateStr: curDateStr,
        oYear: curYear,
        oMonth: curMonth,
        oDay: curDay,
        oAMPM: amorpm,
        oHour: curHour,
        oMinute: curMinute,
        oWeek: curWeek
    }
}

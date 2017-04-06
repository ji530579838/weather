// 数据请求
let wflag = true;
let hflag = true;
let dflag = true;

function dataRequest(xCity) {
    // let currentApi = `http://api.openweathermap.org/data/2.5/weather?q=${xCity}&units=metric&appid=23efde7c76319e9e6db40a16b776d2e1`;
    // let hourlyApi = `http://api.openweathermap.org/data/2.5/forecast?q=${xCity}&units=metric&appid=23efde7c76319e9e6db40a16b776d2e1`;
    // let dailyApi = `http://api.openweathermap.org/data/2.5/forecast/daily?q=${xCity}&units=metric&appid=23efde7c76319e9e6db40a16b776d2e1`;
    // 	$.get(currentApi)
    // 		.done(currentFun)
    // 		.fail(function(){console.log('error！')})
    // 		.always(function(){wflag = true;});
    // 	$.get(hourlyApi)
    // 		.done(hourlyFun)
    // 		.fail(function(){console.log('error！')})
    // 		.always(function(){hflag = true;});
    // 	$.get(dailyApi)
    // 		.done(dailyFun)
    // 		.fail(function(){console.log('error！')})
    // 		.always(function(){dflag = true;});

    let API = '23efde7c76319e9e6db40a16b776d2e1';
    let currentAPI = 'http://api.openweathermap.org/data/2.5/weather';
    let hourlyAPI = 'http://api.openweathermap.org/data/2.5/forecast';
    let dailyAPI = 'http://api.openweathermap.org/data/2.5/forecast/daily';
    let dynamicData = {
        'q': xCity,
        'units': 'metric',
        'appid': API
    }
    $.get(currentAPI, dynamicData)
        .done(currentFun)
        .fail(function() { console.log('error！') })
        .always(function() { wflag = true; });
    $.get(hourlyAPI, dynamicData)
        .done(hourlyFun)
        .fail(function() { console.log('error！') })
        .always(function() { hflag = true; });
    $.get(dailyAPI, dynamicData)
        .done(dailyFun)
        .fail(function() { console.log('error！') })
        .always(function() { dflag = true; });
}

// 实时天气
function currentFun(data) {
    let country = data.sys.country;
    let cityName = data.name;
    let temp = data.main.temp;
    let src = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    let description = data.weather[0].description;
    let currentDate = changeDate(data.dt);
    let speed = data.wind.speed,
        deg = data.wind.deg;
    let speedData = `${windSpeed(speed)} ${speed}m/s`;
    let degData = `${windDirection(deg)} (${deg})`; //beijing没有风向
    let cloud = data.clouds.all; //云量未转换
    let pres = data.main.pressure,
        humi = data.main.humidity;
    let sunrise = changeDate(data.sys.sunrise),
        sunset = changeDate(data.sys.sunset);
    let geo = data.coord;

    $('.city-name').text(`Weather in ${cityName},${country}`);
    $('.curtemp').text(`${temp}`);
    $('.city-temp img').attr('src', src);
    $('.current-sky').text(description);
    $('.current-data').text(`get at ${currentDate.oYear}/${currentDate.oMonth}/${currentDate.oDay} ${currentDate.oAMPM} ${currentDate.oHour<12?currentDate.oHour:(currentDate.oHour-12)}:${currentDate.oMinute}`);
    $('.speed').text(speedData);
    $('.deg').text(degData);
    $('.cloudiness').text(cloud);
    $('.pressure').text(`${pres} hpa`);
    $('.humidity').text(`${humi} %`);
    $('.sunrise').text(`${sunrise.oHour}:${sunrise.oMinute}`);
    $('.sunset').text(`${sunset.oHour}:${sunset.oMinute}`);
    $('.geo a').text(`[${geo.lat},${geo.lon}]`)
}

// hourly天气
function hourlyFun(data) {
    let hourlyList = data.list;
    let test = '';
    for (let i = 0; i < hourlyList.length; i++) {
        let hourlyDate = hourlyList[i].dt,
            hourlyYear = changeDate(hourlyDate).oYear,
            hourlyMonth = changeMonth(changeDate(hourlyDate).oMonth),
            hourlyWeek = changeWeek(changeDate(hourlyDate).oWeek),
            hourlyDay = changeDate(hourlyDate).oDay,
            hourlyCurHour = changeDate(hourlyDate).oHour,
            hourlyCurMinute = changeDate(hourlyDate).oMinute,
            hourlyTime = `${hourlyWeek} ${hourlyMonth} ${hourlyDay} ${hourlyYear} ${isToday(hourlyDay)}`;
        let hourlySrc = `"http://openweathermap.org/img/w/${hourlyList[i].weather[0].icon}.png"`
        let description = hourlyList[i].weather[0].description;
        let tempMin = numFix(hourlyList[i].main.temp_min),
            tempMax = numFix(hourlyList[i].main.temp_max),
            humi = hourlyList[i].main.humidity,
            pressure = hourlyList[i].main.pressure;
        let speed = hourlyList[i].wind.speed;
        // console.log(typeof(hourlyCurHour));
        // if(i===0){           
        // 	//第一个数据即添加日期行
        // 	test = test+'<tr class="hourly-day"><td colspan=2><b>'+hourlyTime+'</b></td></tr>';
        // }else if(hourlyCurHour==02){       
        // 	 // 若当前时间等于每一天的开始显示天气时间02:00，则添加日期行
        // 	test = test+'<tr class="hourly-day"><td colspan=2><b>'+hourlyTime+'</b></td></tr>';
        // }
        if (i === 0) {
            //第一个数据即添加日期行
            test = test + `<tr class="hourly-day"><td colspan=2><b>${hourlyTime}</b></td></tr>`;
        } else {
            let preDate = hourlyList[i - 1].dt;
            let nowDate = hourlyList[i].dt;
            // 对比当前日期与上一次数据日期大，则添加日期行
            preDay = changeDate(preDate).oDay;
            nowDay = changeDate(nowDate).oDay;
            if (preDay < nowDay) {
                test = test + `<tr class="hourly-day"><td colspan=2><b>${hourlyTime}</b></td></tr>'`;
            }
        }

        test = test + `<tr class="hourly-time"><td class="hourly-time-left"><span class="hourly-curtime">
					${hourlyCurHour}:${hourlyCurMinute}</span> <img src=${hourlySrc} alt=""></td><td class="hourly-time-right"><span class="temp">
					${numFix(hourlyList[i].main.temp)} °C</span><i class="hourly-description">
					${description}</i><p class="hourly-info"><span class="temp-min">
					${tempMin} </span> <span class="temp-max">
					${tempMax} °C</span> <span class="hourly-speed">
					${speed} m/s</span>, <span class="hourly-humi">
					${humi} %</span>, <span class="hourly-pressure">
					${pressure} hpa</span></p></td></tr>`;
    }
    // 在请求新数据成功后，在插入新数据之前，清空原来数据
    $('.weather-hourly tbody').empty();
    $('.weather-hourly tbody').append(test);
}

// daily天气
function dailyFun(data) {
    let dailyList = data.list;
    let test = '';
    let dayTempStr = '';
    for (let i = 0; i < dailyList.length; i++) {
        let dailyDate = dailyList[i].dt,
            dayilyMonth = changeMonth(changeDate(dailyDate).oMonth),
            dailyWeek = changeWeek(changeDate(dailyDate).oWeek),
            dailyDay = changeDate(dailyDate).oDay;
        let dailyTimeStr = `${dailyWeek} ${dailyDay} ${dayilyMonth}`;
        let dayTemp = numFix(dailyList[i].temp.day),
            nightTemp = numFix(dailyList[i].temp.night);
        let dailySrc = `"http://openweathermap.org/img/w/${dailyList[i].weather[0].icon}.png"`
        let description = dailyList[i].weather[0].description;
        let speed = dailyList[i].speed;
        let cloud = dailyList[i].clouds;
        let pressure = dailyList[i].pressure;

        if (dayTemp <= 0) {
            dayTempStr += `<span class="day-temp temp-warn">${dayTemp}°C</span>`;
        } else {

            dayTempStr += `<span class="day-temp">${dayTemp}°C</span>'`;
        }

        //拼接字符串，避免多次调用append操作dom导致性能低下
        test = test + `<tr><td class="weather-daily-left"><span class="weather-daily-date">${dailyTimeStr}
						</span><img src=${dailySrc}/></td><td class="weather-daily-right">${dayTempStr}<span class="night-temp">${nightTemp}°C</span><i class="daily-description">${description}
						</i><p class="daily-speed">${speed}m/s</p><p class="daily-pressure">${cloud}%,${pressure}pha</p></td></tr>`;
        dayTempStr = '';
    }
    // 在请求新数据成功后，在插入新数据之前，清空原来数据
    $('.weather-daily tbody').empty();
    $('.weather-daily tbody').append(test);

}

//判断是否Today  Date.now()返回的是当前时间的毫秒数
function isToday(data) {
    let nTime = new Date();
    return (data === (nTime.getDate())) ? 'Today' : '';
}
// 转换时间
function changeDate(data) {
    let curDate = new Date(data * 1000),
        curYear = curDate.getFullYear(), //年
        curMonth = curDate.getMonth() + 1, //月
        curWeek = curDate.getDay(), //星期
        curDay = curDate.getDate(), //日
        curHour = curDate.getHours() < 10 ? `0${curDate.getHours()}` : curDate.getHours(), //小时，小于10的表示为0x
        curMinute = curDate.getMinutes() < 10 ? `0${curDate.getMinutes()}` : curDate.getMinutes(); //分钟
    amorpm = curHour >= 12 ? '下午' : '上午'; //上、下午
    // return arrDate = [curYear,curMonth,curDay,amorpm,curHour,curMinute,curWeek];
    return objDate = {
        oYear: curYear,
        oMonth: curMonth,
        oDay: curDay,
        oAMPM: amorpm,
        oHour: curHour,
        oMinute: curMinute,
        oWeek: curWeek
    }
}
//转换月份 传入参数为转换时间后的curMonth
function changeMonth(data) {
    switch (data) {
        case 1:
            return 'Jan';
            break;
        case 2:
            return 'Feb';
            break;
        case 3:
            return 'Mar';
            break;
        case 4:
            return 'Apr';
            break;
        case 5:
            return 'May';
            break;
        case 6:
            return 'Jun';
            break;
        case 7:
            return 'Jul';
            break;
        case 8:
            return 'Aug';
            break;
        case 9:
            return 'Sep';
            break;
        case 10:
            return 'Otc';
            break;
        case 11:
            return 'Nov';
            break;
        case 12:
            return 'Dec';
            break;

    }
}
// 转换星期 传入参数为转换时间后的curWeek
function changeWeek(data) {
    switch (data) {
        case 1:
            return 'Mon';
            break;
        case 2:
            return 'Tue';
            break;
        case 3:
            return 'Wed';
            break;
        case 4:
            return 'Thu';
            break;
        case 5:
            return 'Fri';
            break;
        case 6:
            return 'Sat';
            break;
        case 0:
            return 'Sun';
            break;
    }
}
// 处理温度小数点为一位
function numFix(data) {
    return data.toFixed(1);
}
// 风速判断
function windSpeed(data) {
    let str = '';
    if (data >= 0 && data <= 0.2) {
        speedStr = 'Calm';
    } else if (data >= 0.3 && data <= 1.5) {
        speedStr = 'Light air';
    } else if (data >= 1.6 && data <= 3.3) {
        speedStr = 'Light breeze';
    } else if (data >= 3.4 && data <= 5.4) {
        speedStr = 'Gentle breeze';
    } else if (data >= 5.5 && data <= 7.9) {
        speedStr = 'Moderate breeze';
    } else if (data >= 8.0 && data <= 10.7) {
        speedStr = 'Fresh breeze';
    } else if (data >= 10.8 && data <= 13.8) {
        speedStr = 'Strong breeze';
    } else if (data >= 13.9 && data <= 17.1) {
        speedStr = 'Moderate gale';
    } else if (data >= 17.2 && data <= 20.7) {
        speedStr = 'Fresh gale';
    } else if (data >= 20.8 && data <= 24.4) {
        speedStr = 'Strong gale';
    } else if (data >= 24.5 && data <= 28.4) {
        speedStr = 'Whole gale';
    } else if (data >= 28.5 && data <= 32.6) {
        speedStr = 'Storm';
    }
    return speedStr;
}
// 风向判断
function windDirection(data) {
    let direct = '';

    if (data >= 11.26 && data <= 33.75) {
        direct = 'North-northeast';
    } else if (data >= 33.76 && data <= 56.25) {
        direct = 'NorthEast';
    } else if (data >= 56.26 && data <= 78.75) {
        direct = 'East-northeast';
    } else if (data >= 78.76 && data <= 101.25) {
        direct = 'East';
    } else if (data >= 101.26 && data <= 123.75) {
        direct = 'East-southeast';
    } else if (data >= 123.76 && data <= 146.25) {
        direct = 'SouthEast';
    } else if (data >= 146.26 && data <= 168.75) {
        direct = 'South-southeast';
    } else if (data >= 168.76 && data <= 191.25) {
        direct = 'South';
    } else if (data >= 191.26 && data <= 213.75) {
        direct = 'South-southwest';
    } else if (data >= 213.76 && data <= 236.25) {
        direct = 'SouthWest';
    } else if (data >= 236.26 && data <= 258.75) {
        direct = 'West-southwest';
    } else if (data >= 258.76 && data <= 281.25) {
        direct = 'West';
    } else if (data >= 281.26 && data <= 303.75) {
        direct = 'West-northwest';
    } else if (data >= 303.76 && data <= 326.25) {
        direct = 'NorthWest';
    } else if (data >= 326.26 && data <= 348.75) {
        direct = 'North-northwest';
    } else {
        direct = 'North';
    }
    return direct;
}
$(function() {
    // 默认城市
    dataRequest('changsha');
    // 搜索框获得焦点，清空文本 ,this.defaultValue指向当前文本框的默认值,
    // 注意区别jquery中的this与$(this),this表示当前上下文的html对象。
    // 或者使用css3的placeholder
    $('.search').focus(function() {
        if ($(this).val() == this.defaultValue) {
            $(this).val('');
        }
    });
    // 搜索框失去焦点，获得提示文本
    $('.search').blur(function() {
        if ($(this).val() == '') {
            $(this).val(this.defaultValue);
        }
    });
    // 切换hourly和daily
    $('.change-tab button').click(function() {
        let tabId = $(this).attr('id');
        $(this).addClass('active').siblings().removeClass('active');
        $(`.weather-${tabId}`).addClass('active-weather').siblings().removeClass('active-weather');
    });
    // 按钮点击事件
    $('.search-btn').click(function() {
        // 处理未输入城市名时点击按钮请求城市为Your的数据
        if ($('.search').val() === 'Your city name') {
            $('.search').val('');
            alert('请输入城市名。');
            //点击完后输入框获得焦点
            $('.search').focus();
        } else {
            let xCity = $('.search').val();
            if (wflag && hflag && dflag) {
                // 点击按钮，开关设为false，当数据请求完毕后再设为true
                wflag = false;
                hflag = false;
                dflag = false;
                dataRequest(xCity);

            }
        }
    });
    //输入框键盘事件
    $('.search').keydown(function(data) {
        let xCity = $('.search').val();
        if (data.which === 13) {
            dataRequest(xCity);
        }
    })
})

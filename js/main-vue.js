let wflag = true;
let hflag = true;
let dflag = true;
let API = '23efde7c76319e9e6db40a16b776d2e1';
let currentURL = 'http://api.openweathermap.org/data/2.5/weather';
let hourlyURL = 'http://api.openweathermap.org/data/2.5/forecast';
let dailyURL = 'http://api.openweathermap.org/data/2.5/forecast/daily';

$(function() {

    let myCookieCity = Cookies.get('name');
    if (myCookieCity !== '') {
        // 判断如果存在cookie，则从“=”后面分割即得到保存的用户输入的城市名，
        // 注意保留时间只是name=value这对cookie属性的属性，打印不出来      
        dataRequest(myCookieCity);
    } else {
        dataRequest('changsha');
    }
    // dataRequest('changsha');
    // 切换hourly和daily
    $('.change-tab button').click(function() {
        let tabId = $(this).attr('id');
        $(this).addClass('active').siblings().removeClass('active');
        $(`.content-${tabId}`).addClass('on').siblings().removeClass('on');
    });

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
})

// let cookie = {
//     // 创建cookie
//     createCookie: function(name, value, days) {
//         if (days) {
//             var date = new Date();
//             date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
//             var expires = "; expires=" + date.toGMTString();
//         } else var expires = "";
//         document.cookie = name + "=" + value + expires + "; path=/";
//     },
//     // 读取cookie
//     readCookie: function(name) {
//         var nameEQ = name + "=";
//         var ca = document.cookie.split(';');
//         for (var i = 0; i < ca.length; i++) {
//             var c = ca[i];
//             while (c.charAt(0) == ' ') c = c.substring(1, c.length);
//             if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
//         }
//         return null;
//     },
//     // 删除cookie
//     eraseCookie: function(name) {
//         createCookie(name, "", -1);
//     }
// }

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
        // enter键时如果不为空且不为空格则取数据
        let searchKey = $('.search').val();
        dataRequest(searchKey);
        // 设置cookie
        Cookies.set('name', searchKey, { expires: 1 });
        // 获取完数据后清空输入框
        $('.search').val('');
    }
}

function dataRequest(searchKey) {

    getData(currentURL, searchKey).done(function(data) {
        weatherInfo.curdata = changeCurData(data);
        // console.log(that.curdata);
    }).fail(function() {
        console.log('error~');
    });

    getData(hourlyURL, searchKey).done(function(data) {
        weatherInfo.weather = changeHourlyData(data);
        // console.log(that.weather);
    }).fail(function() {
        console.log('error~');
    });

    getData(dailyURL, searchKey).done(function(data) {
        weatherInfo.weatherdaily = changeDailyData(data);
        // console.log(that.weatherdaily);
    }).fail(function() {
        console.log('error~');
    });
}

function getData(url, searchKey) {
    let dynamicData = {
        'q': searchKey,
        'units': 'metric',
        'appid': API
    }
    return $.ajax({
        url: url,
        type: 'GET',
        data: dynamicData
    });
}


// 实时数据处理,在原有数据的基础上修改
function changeCurData(data) {

    // let date = new Date(data.dt * 1000);
    // let dateStr = date.toDateString();
    let currentDate = changeDate(data.dt);

    data.name = `${data.name},${data.sys.country}`;
    data.weather[0].imgSrc = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    data.main.temp = `${data.main.temp}°C`;
    data.date = `${currentDate.oYear}/${currentDate.oMonth}/${currentDate.oDay} ${currentDate.oAMPM} ${currentDate.oHour<12?currentDate.oHour:(currentDate.oHour-12)}:${currentDate.oMinute}`;
    data.sys.sunrise = `${changeDate(data.sys.sunrise).oHour}:${changeDate(data.sys.sunrise).oMinute}`;
    data.sys.sunset = `${changeDate(data.sys.sunset).oHour}:${changeDate(data.sys.sunset).oMinute}`;
    // data.coord = `[${data.coord.lat},${data.coord.lon}]`;
    data.wind.speed = `${windSpeed(data.wind.speed)} ${data.wind.speed}`;
    data.wind.deg = `${windDirection(data.wind.deg)} (${data.wind.deg})`;
    return data;
}

// hourly数据处理
function changeHourlyData(data) {
    let result = {
        'list': []
    };
    data.list.forEach(function(element) {
        let date = new Date(element.dt);
        let dateStr = changeDate(date).oDateStr;

        element.date = dateStr;
        element.time = `${changeDate(date).oHour}:${changeDate(date).oMinute}`;
        element.weather[0].imgSrc = `http://openweathermap.org/img/w/${element.weather[0].icon}.png`;
        element.main.temp = element.main.temp.toFixed(1);
        element.main.temp_min = element.main.temp_min.toFixed(1);
        element.main.temp_max = element.main.temp_max.toFixed(1);
        // 往空数组中添加数据的方法：先遍历这个数组是否有这项数据，如果有，则不往数组里添加这一项。
        // 同一天的数据推到value数组里，for……of遍历的是list数组下每项对象的date值是否与当前值相等，如果相等则把数据推进value数组里
        let isNotToday = true;
        for (let resultElement of result.list) {
            if (resultElement.date === dateStr) {
                resultElement.value.push(element);
                isNotToday = false;
                break;
            }
        }
        // 不同一天的数据推进list数组里。
        if (isNotToday) {
            result.list.push({
                'date': dateStr,
                'is_today': isToday(dateStr),
                'value': [element]
            })
        }
    })

    return result;
}

// daily天气数据处理
function changeDailyData(data) {
    let result = {
        'list': []
    };
    data.list.forEach(function(element) {
        let dailyDate = element.dt,
            dayilyMonth = changeMonth(changeDate(dailyDate).oMonth),
            dailyWeek = changeWeek(changeDate(dailyDate).oWeek),
            dailyDay = changeDate(dailyDate).oDay;
        let dailyTimeStr = `${dailyWeek} ${dailyDay} ${dayilyMonth}`;

        let date = dailyTimeStr;
        element.weather[0].imgSrc = `http://openweathermap.org/img/w/${element.weather[0].icon}.png`;
        element.temp.day = element.temp.day.toFixed(1);
        element.temp.night = element.temp.night.toFixed(1);

        result.list.push({
            'date': dailyTimeStr,
            // 'is_warn':{'temp-warn':isWarn(element.temp.day)},
            'is_warn': isWarn(element.temp.day), //v-bind：class="{'类名'：布尔值}" 操作class样式，或者class="对象"
            'element': element
        })

    })

    return result;
}

// vue填数据 
let weatherInfo = new Vue({
    el: '.wrapper',
    data: {
        curdata: {
            weather: [{}],
            main: {},
            wind: {},
            clouds: {},
            sys: {},
            coord: {}
        },
        weather: {
            list: []
        },
        weatherdaily: {
            list: [{
                date: null,
                'is_warn': null,
                element: {
                    speed: {},
                    pressure: {},
                    clouds: {},
                    weather: [{}],
                    temp: {}
                }
            }]
        }
    }
})


function isWarn(data) {
    return data < 0;
}

function isToday(data) {
    return data === new Date().toDateString();
}
// 转换时间
function changeDate(data) {
    let curDate = new Date(data * 1000),
        curDateStr = curDate.toDateString();
    curYear = curDate.getFullYear(), //年
        curMonth = curDate.getMonth() + 1, //月
        curWeek = curDate.getDay(), //星期
        curDay = curDate.getDate(), //日
        curHour = curDate.getHours() < 10 ? `0${curDate.getHours()}` : curDate.getHours(), //小时，小于10的表示为0x
        curMinute = curDate.getMinutes() < 10 ? `0${curDate.getMinutes()}` : curDate.getMinutes(); //分钟
    amorpm = curHour >= 12 ? '下午' : '上午'; //上、下午
    // return arrDate = [curYear,curMonth,curDay,amorpm,curHour,curMinute,curWeek];
    return objDate = {
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

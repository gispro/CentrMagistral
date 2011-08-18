<%@ Page Language="C#" AutoEventWireup="true"  CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
    <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
    <title>ЦентрМагистраль</title>
    <link href="http://code.google.com/apis/maps/documentation/javascript/examples/default.css" rel="stylesheet" type="text/css" />
    <link rel="stylesheet" href="Styles/sencha-touch.css" type="text/css" />
    <link rel="stylesheet" href="Styles/Site.css" type="text/css" />
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true&language=ru"></script>
    <script type="text/javascript" src="Scripts/sencha-touch.js" ></script>
    <script type="text/javascript" src="Scripts/index.js" ></script>
    <script type="text/javascript" src="Scripts/swipe.js" ></script>
    <script type="text/javascript" src="Scripts/arcgislink.js" ></script>
</head>
<body>
    <script type="text/javascript">
        var gkey = '<%=System.Configuration.ConfigurationManager.AppSettings["gkey"]%>';
        var url = '<%=System.Configuration.ConfigurationManager.AppSettings["url"]%>';
    </script>
    <div style="width:1in" id="dpi"></div>
    <div style="display:none">
        <div id="meteo">
            <table class="stTable">
                <tr>
                    <td colspan="2">
                        <center>
                            <table style="width:auto">
                                <tr>
                                    <td>
                                        <img id="meteo_img" />
                                    </td>
                                    <td style="vertical-align:middle">
                                        <span id="meteo_tmp" style="margin: 0 0 0 10px;" class="arial16 bold"></span>
                                    </td>
                                </tr>
                            </table>
                        </center>
                    </td>
                </tr>
                <tr>
                    <td style="width:40%;vertical-align:middle" class="arial10 bold topLine">
                        ПОКРЫТИЕ:
                    </td>
                    <td class="topLine">
                        <span id="meteo_road_state" class="arial14"></span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="arial10 bold">Ветер:</span><br />
                        <img id="meteo_wind_img" /><br/>
                    </td>
                    <td style="vertical-align:middle; text-align:center">
                            <span class="arial10 bold" >Направление</span><br />
                            <span id="meteo_wind_direct" class="arial16 bold" ></span><br />
                            <span class="arial10 bold">Скорость, м/с</span><br />
                            <span id="meteo_wind_speed" class="arial16 bold" ></span>
                    </td>
                </tr>
            </table>
        </div>
        <div id="common">
            <table class="stTable">
                <tr>
                    <td style="width:10%;text-align:center;vertical-align:middle" rowspan="2">
                        <span id="common_road" class="arial12 bold"></span>
                    </td>
                    <td class="arial11 bold" id="common_km1" style="text-align:center;vertical-align:middle">
                    </td>
                    <td class="arial10" id="common_dir1" style="text-align:center;vertical-align:middle">
                    </td>
                </tr>
                <tr>
                    <td class="arial11 bold" id="common_km2" style="text-align:center;vertical-align:middle">
                    </td>
                    <td class="arial10" id="common_dir2" style="text-align:center;vertical-align:middle">
                    </td>
                </tr>
                <tr>
                    <td colspan="3" class="topLine">
                        <table>
                            <tr>
                                <td class="arial10">
                                    Служба:
                                </td>
                                <td class="arial10 bold" id="common_service">
                                </td>
                            </tr>
                            <tr>
                                <td />
                                <td class="arial11" id="common_servicePhone">
                                </td>
                            </tr>
                            <tr>
                                <td class="arial10" style="width:20%">
                                    Участок<br/>обслуживания:
                                </td>
                                <td class="arial11 bold" style="vertical-align:middle" id="common_roadLenght">
                                </td>
                            </tr>
                            <tr>
                                <td class="arial10">
                                    Аварийность:
                                </td>
                                <td class="arial11 bold" id="common_dtp">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
        <div id="repair">
            <div class="arial12 bold center" style="padding:4px">РЕМОНТ</div>
            <div id="repair_content" style="padding:0 5px;text-align:center">
            </div>
        </div>
        <div id="services">
            <table>
                <tr>
                    <td style="text-align:center; padding: 2px">
                        <img src="Images/Sensors/left.png" 
                            ontouchstart="this.src='Images/Sensors/left_down.png'" 
                            ontouchend="this.src='Images/Sensors/left.png'" 
                            onmousedown="this.src='Images/Sensors/left_down.png'" 
                            onmouseup="this.src='Images/Sensors/left.png'" 
                            onclick="onServiceNext('left')" />
                    </td>                    
                    <td style="text-align:center;width:20px"><img id="services_left" style="width:32px;height:37px;margin:5px 10px" alt="" src="Images/Markers/poi_azs.png" /></td>
                    <td style="text-align:center;width:20px"><img id="services_center" style="width:42px;height:47px;margin:5px 10px" alt="" src="Images/Markers/poi_azs.png" /></td>
                    <td style="text-align:center;width:20px"><img id="services_right" style="width:32px;height:37px;margin:5px 10px" alt="" src="Images/Markers/poi_azs.png" /></td>
                    <td style="text-align:center; padding: 2px">
                        <img src="Images/Sensors/right.png" 
                            ontouchstart="this.src='Images/Sensors/right_down.png'" 
                            ontouchend="this.src='Images/Sensors/right.png'" 
                            onmousedown="this.src='Images/Sensors/right_down.png'" 
                            onmouseup="this.src='Images/Sensors/right.png'" 
                            onclick="onServiceNext('right')" />
                    </td>
                </tr>
                <tr>
                    <td colspan="6" id="services_layer_name" class="arial12 bold center"></td>
                </tr>
                <tr>
                    <td colspan="6" id="services_list" class="center"></td>
                </tr>
            </table>
        </div>
        <div id="speed">
            <div>
                <table class="stTable">
                    <tr>
                        <td style="vertical-align:middle" class="arial12 bold">
                            СЕЙЧАС:
                        </td>
                        <td id="speed_now_l" class="arial14 bold" style="text-align:center">
                        </td>
                        <td id="speed_km_l" class="arial12 bold" style="text-align:center">
                        </td>
                        <td id="speed_now_r" class="arial14 bold" style="text-align:center">
                        </td>
                        <td id="speed_km_r" class="arial12 bold" style="text-align:center">
                        </td>
                    </tr>
                    <tr>
                        <td />
                        <td class="arial10" id="speed_name_l">
                        </td>
                        <td />
                        <td class="arial10" id="speed_name_r">
                        </td>
                        <td />
                    </tr>
                </table>
            </div>
            <div class="topLine">
                <table style="margin-top:3px">
                    <tr>
                        <td style="width:1px; padding:0 2px" class="arial10 bold">ОБЫЧНО:</td>
                        <td style="text-align:center">
                            <img src="Images/Sensors/left.png" 
                                ontouchstart="this.src='Images/Sensors/left_down.png'" 
                                ontouchend="this.src='Images/Sensors/left.png'" 
                                onmousedown="this.src='Images/Sensors/left_down.png'" 
                                onmouseup="this.src='Images/Sensors/left.png'" 
                                onclick="prevSpeedDay()" />
                        </td>
                        <td style="width:100pt;text-align:center" id="speed_day" class="arial10">ПОНЕДЕЛЬНИК</td>
                        <td style="text-align:center">
                            <img src="Images/Sensors/right.png" 
                                ontouchstart="this.src='Images/Sensors/right_down.png'" 
                                ontouchend="this.src='Images/Sensors/right.png'" 
                                onmousedown="this.src='Images/Sensors/right_down.png'" 
                                onmouseup="this.src='Images/Sensors/right.png'" 
                                onclick="nextSpeedDay()" />
                        </td>
                    </tr>
                </table>
                <div class="arial12" style="padding:3px" id="speed_name2_l">
                </div>
                <center>
                    <div style="padding:5px">
                        <img id="speed_usualy_l" />
                    </div>
                </center>
                <div class="arial12" style="padding:3px" id="speed_name2_r">
                </div>
                <center>
                    <div style="padding:5px">
                        <img id="speed_usualy_r" />
                    </div>
                </center>
                <table>
                    <tr>
                        <td class="arial10" style="width:50%; text-align:center">медленно</td>
                        <td style="width:156px"><img src="Images/Sensors/legend.png" style="width:100px" /></td>
                        <td class="arial10" style="width:50%; text-align:center">быстро</td>
                    </tr>
                </table>
            </div>
        </div>
        <div id="video">
            <table
                ontouchstart="touchStart(event,'video_img');"  
                ontouchend="touchEnd(event);" 
                ontouchmove="touchMove(event);" 
                ontouchcancel="touchCancel(event);"                            
            >
                <tr>
                    <td id="video_road" class="arial10 bold" style="text-align:center; padding: 10px 5px" colspan="3"></td>
                </tr>
                <tr>
                    <td style="text-align:center; padding: 2px">
                        <img src="Images/Sensors/left.png" 
                            ontouchstart="this.src='Images/Sensors/left_down.png'" 
                            ontouchend="this.src='Images/Sensors/left.png'" 
                            onmousedown="this.src='Images/Sensors/left_down.png'" 
                            onmouseup="this.src='Images/Sensors/left.png'" 
                            onclick="onSwipe('', 'left')" />
                    </td>                    
                    <td id="video_time" class="arial10" style="text-align:center; padding: 10px 5px"></td>
                    <td style="text-align:center; padding: 2px">
                        <img src="Images/Sensors/right.png" 
                            ontouchstart="this.src='Images/Sensors/right_down.png'" 
                            ontouchend="this.src='Images/Sensors/right.png'" 
                            onmousedown="this.src='Images/Sensors/right_down.png'" 
                            onmouseup="this.src='Images/Sensors/right.png'" 
                            onclick="onSwipe('', 'right')" />
                    </td>
                </tr>
                <tr>
                    <td style="text-align:center; vertical-align:middle" colspan="3" >
                            <img id="video_img" style="width:200px;height:150px" alt="" />
                    </td>
                </tr>
            </table>            
        </div>
        <div id="search">
            <input type="text" style="width:145pt; margin: 5px" id="search_text" onkeydown="onSearchKeyDown(event)" />
            <img src="Images/search.png" onclick="onSearch()" style="margin-top: -2px" />
        </div>
        <div id="about">
            <div class="arial10" style="padding:5px">
                <p>
                Оперативные данные по федеральным дорогам Московской области: ФГУ «Центральная Россия».
                </p>
                <br />
                <p>
                Разработка ЗАО «ГИСпроект» (www.gispro.ru). 2011 г.
                </p>
            </div>
        </div>
        <div id="no_info">
            <div class="arial12" style="padding:5px; text-align:center">нет информации</div>
        </div>
    </div>
    <div id="request_progress" class="requestProgeress">ожидание ответа сервера...</div>
</body>
</html>

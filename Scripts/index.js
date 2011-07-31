var gkey = 'ABQIAAAAv0A5P5E2zR_A7rv2vBK69xRi7uqIlwICDi4n4C7QVazgifWIWBThnk91ohacrrWASrsU4tSqotNTow';
var map = null;
var dpi = 96;
var geoLocationProovider = null;
var moscow = new google.maps.LatLng(55.748758, 37.6174);
var url = 'http://89.221.201.176:8080/fedroads';
var settingsPanel = null;
var settingsButton = null;
var layers = [];
var dialogPanel = null;
var inRequest = false;
var startMouseDown = new Date();
var identityMarker = null;
var locationMarker = null;
var searchMarker = null;
var videoData = null;

Ext.setup({
    tabletStartupScreen: 'Images/tablet_startup.png',
    phoneStartupScreen: 'Images/phone_startup.png',
    icon: 'Images/icon.png',
    glossOnIcon: false,
    onReady: function () {
        
        dpi = document.getElementById('dpi').offsetWidth;
        if (Ext.supports.GeoLocation) {
            geoLocationProovider = (navigator.geolocation ? navigator.geolocation :
                (window.google || {}).gears ? google.gears.factory.create('beta.geolocation') : null);
        }

        var options = {
            zoom: 8,
            center: moscow,
            streetViewControl: false,
            mapTypeControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                mapTypeIds: [google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.TERRAIN],
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            }
        }

        settingsButton = new Ext.Button({
            iconCls: 'settings',
            handler: function (btn, event) { getTopSettings().showBy(btn); }
        });

        toolbar = new Ext.Toolbar({
            dock: 'top',
            xtype: 'toolbar',
            ui: 'light',
            defaults: {
                iconMask: true
            },
            items: [
                {
                    iconCls: 'locate',
                    handler: function () {
                        if (geoLocationProovider != null)
                            geoLocationProovider.getCurrentPosition(function (position) {
                                if (locationMarker != null)
                                    locationMarker.setMap(null);
                                locationMarker = new google.maps.Marker({
                                    icon: 'Images/location.png',
                                    position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                                    map: map.map,
                                });
                                map.map.panTo(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
                                map.map.setZoom(17);
                            });
                    }
                },
                {
                    iconCls: 'search',
                    handler: function (btn, event) { getSearch().showBy(btn); }
                },
                { xtype: 'spacer' },
                settingsButton
            ]
        });

        map = new Ext.Map({ mapOptions: options });

        new Ext.Panel({
            fullscreen: true,
            dockedItems: [toolbar],
            items: [map]
        });

        layers['video'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=video&icon=video&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['meteo'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=meteo&icon=meteo&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['poi_sto'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=poi_sto&icon=poi_sto&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['poi_azs'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=poi_azs&icon=poi_azs&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['poi_bus'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=poi_bus&icon=poi_bus&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['poi_food'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=poi_food&icon=poi_food&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['poi_otdyh'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=poi_otdyh&icon=poi_otdyh&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['poi_shop'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=poi_shop&icon=poi_shop&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['poi_wash'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=poi_wash&icon=poi_wash&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['sensors'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=sensors&icon=sensors&t=11', { suppressInfoWindows: true, preserveViewport: true, clickable: false });

        layers['dtp'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=dtp&t=13', { suppressInfoWindows: true, preserveViewport: true, clickable: false });
        layers['remont'] = new google.maps.KmlLayer(url + '/kml.ashx?kml=remont&t=111', { suppressInfoWindows: true, preserveViewport: true, clickable: false });

        google.maps.event.addListener(map.map, 'mousedown', function (event) {
            startMouseDown = new Date();
        });
        google.maps.event.addListener(map.map, 'mouseup', function (event) {
            if (inRequest || (new Date()).getTime() - startMouseDown.getTime() > 500)
                return;
            videoData = null;
            identityMarker = new google.maps.Marker({
                icon: 'Images/tapping.png',
                position: event.latLng,
                map: map.map,
            });
            inRequest = true;
            showProgress();
            var display = screen.width + ',' + screen.height + ',' + dpi;
            Ext.util.JSONP.request({
                url: 'http://maps.gispro.ru/ArcGIS/rest/services/Rosavtodor/points_dd/MapServer/identify',
                callbackKey: 'callback',
                params: {
                    geometryType: 'esriGeometryPoint',
                    geometry: event.latLng.lng() + ',' + event.latLng.lat(),
                    layers: 'all',
                    tolerance: 30,
                    mapExtent: map.map.getBounds().toUrlValue(),
                    imageDisplay: display,
                    returnGeometry: false,
                    f: 'pjson'
                },
                callback: onIdentity
            });
        });

        map.map.mapTypes.set("ArcGIS", new gmaps.ags.MapType("http://maps.gispro.ru/ArcGIS/rest/services/Rosavtodor/mosobl_osn/MapServer", {name: 'ArcGIS'}) );
    }
});

function onIdentity(result) {
    hideProgress();
    identityMarker.setMap(null);
    inRequest = false;
    var objects = {};
    var roadName = null;
    var roadId = null;
    for (var i = 0; i < result.results.length; i++) {
        if (roadId == null)
            roadId = result.results[i].attributes.Kroad;
        switch(result.results[i].layerId){
            case 0: //Метеостанции
                if (objects.meteo == null && roadId == result.results[i].attributes.Kroad) 
                    objects.meteo = { id: result.results[i].attributes.KStation };
                break;
            case 1: //Видеокамеры
                if (objects.video == null && roadId == result.results[i].attributes.Kroad)
                    objects.video = { id: result.results[i].attributes.KSource, road: result.results[i].value };
                break;
            case 2: //Сенсоры скорости
                if (objects.speed == null && roadId == result.results[i].attributes.Kroad)
                    objects.speed = { id: result.results[i].attributes.Ksensor };
                break;
            case 3: //АЗС
            case 4: //Автобусные остановки
            case 5: //Общественное питание
            case 6: //Площадки отдыха 
            case 7: //Магазины
            case 8://СТО
            case 9: //Автомойки
                break;
            case 10: // Дороги 
                objects.common = objects.common != null ? objects.common : {};
                if (objects.common.road == null && roadId == result.results[i].attributes.Kroad) {
                    roadName = result.results[i].attributes.Shifr;
                    objects.common.roadId = result.results[i].attributes.Kroad;
                    objects.common.road = result.results[i].attributes.Titul_full;
                    objects.common.roadShifr = result.results[i].attributes.Shifr;
                    objects.common.roadLength = result.results[i].attributes.km;
                    objects.common.service = result.results[i].attributes.FGU;
                    objects.common.servicePhone = result.results[i].attributes.phone;
                }
                break;
            case 11: // Км отметки
                objects.common = objects.common != null ? objects.common : {};
                if (objects.common.km == null && roadId == result.results[i].attributes.Kroad) {
                    objects.common.km = result.results[i].attributes.km;
                }
                break;
            case 12: // Ремонт
                break;
            case 13: // Ремонт точки
                break;
            case 14: // ДТП статистика
                objects.common = objects.common != null ? objects.common : {};
                if ((objects.common.dtp == null || objects.common.dtp < result.results[i].attributes.dtp_danger) && roadId == result.results[i].attributes.Kroad) {
                    objects.common.dtp = result.results[i].attributes.dtp_danger;
                    objects.common.dtpName = result.results[i].attributes.danger_t;
                }
                break;
        }
    }
    if (objects.meteo != null || objects.video != null
        || objects.speed != null || objects.common != null) {
        showInfoWindow(objects, roadName);
    } else {
        getNoInfo().show();
    }
}

function getDialogOptions() {
    var panelOptions = {
        floating: true,
        centered: true,
        modal: true,
        hideOnMaskTap: false
    };
    panelOptions.width = Math.min(screen.width, 300);
    panelOptions.height = Math.min(screen.height, 380);

    return panelOptions;
}

function showInfoWindow(objects, roadName) {
    var buttons = [];
    if (objects.common != null)
        buttons.push({ text: 'Общее', pressed: true, handler: Ext.util.Functions.createDelegate(onCommonClick, objects.common) });
    if (objects.meteo != null)
        buttons.push({ text: 'Метео', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(onMeteoClick, objects.meteo) });
    if (objects.video != null) 
        buttons.push({ text: 'Видео', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(onVideoClick, objects.video) });
    if (objects.speed != null)
        buttons.push({ text: 'Скорость', pressed: buttons.length == 0, handler: Ext.util.Functions.createDelegate(onSpeedClick, objects.speed) });

    var panelOptions = getDialogOptions();
    var segment = [{
        xtype: 'segmentedbutton',
        allowDepress: true,
        items: buttons
    }];
    var toolbar = new Ext.Toolbar({
        ui: 'light',
        dock: 'top',
        items: [ segment ]
    })
    panelOptions.dockedItems = [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: roadName,
                        height: 40,
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide(); dlg.destroy();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
                    ,toolbar
                    ];
    dialogPanel = new Ext.Panel();
    panelOptions.items = [ dialogPanel ];
    var dialog = new Ext.Panel(panelOptions).show();
    
    buttons[0].handler();
}

function onMeteoClick() {
    lastVideoPanel = null;
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'meteodata', id: this.id },
        callback: Ext.util.Functions.createDelegate(onGetMeteoData, { maker: this })
    });
}

function onGetMeteoData(result) {
    var tColor = 'blue';
    if (result.Temp > 0)
        tColor = "red";
    var windName = "S";
    switch (result.WindDirection) {
        case 'СВ': windName = 'SV'; break;
        case 'В': windName = 'V'; break;
        case 'ЮВ': windName = 'UV'; break;
        case 'Ю': windName = 'U'; break;
        case 'ЮЗ': windName = 'UZ'; break;
        case 'З': windName = 'Z'; break;
        case 'СЗ': windName = 'SZ'; break;
    }
    Ext.getDom('meteo_img').src = 'Images/Meteo/' + result.ImageName;
    Ext.getDom('meteo_tmp').style.color = tColor;
    Ext.getDom('meteo_tmp').innerHTML = result.TempName;
    Ext.getDom('meteo_road_state').innerHTML = result.Surface;
    Ext.getDom('meteo_wind_img').src = 'Images/Meteo/' + windName + '.png';
    Ext.getDom('meteo_wind_direct').innerHTML = result.WindDirection;
    Ext.getDom('meteo_wind_speed').innerHTML = result.WindSpeed;
    dialogPanel.removeAll();
    dialogPanel.add(new Ext.Panel({ html: Ext.getDom('meteo').innerHTML }));
    dialogPanel.doLayout();
}

var currVideoIndex = 0;
function onVideoClick() {
    lastVideoPanel = null;
    var ddd = (new Date());
    if (videoData == null) {    
        Ext.util.JSONP.request({
            url: 'Data.ashx',
            callbackKey: 'callback',
            params: { source: 'image', id: this.id, from: (new Date()).getTime(), offset: (new Date()).getTimezoneOffset() },
            callback: Ext.util.Functions.createDelegate(onGetVideoData, { id: this.id })
        });
    } 
    {
        dialogPanel.removeAll();
        Ext.getDom('video_road').innerHTML = this.road;
        dialogPanel.add(new Ext.Panel({ html: Ext.getDom('video').innerHTML }));
        dialogPanel.doLayout();
    }
}

function onGetVideoData(result) {
    if (videoData == null) {
        videoData = [];
        currVideoIndex = 0;
    }
    for(var i = 0; i < result.length; i++)
        videoData.push(result[i]);
    if (currVideoIndex >= videoData.length)
        currVideoIndex = videoData.length - 1;
    showVideoImage();
}

function onSwipe(targetId, direction) {
    switch(direction) {
        case 'left':
            currVideoIndex++;
            showVideoImage(direction);
            break;
        case 'right':
            currVideoIndex--;
            showVideoImage(direction);
            break;
    }
}

var lastVideoPanel = null;
function showVideoImage(dir) {
    if (currVideoIndex < 0)
        currVideoIndex = 0;
    if (currVideoIndex >= videoData.length && videoData.length > 0) {
        Ext.util.JSONP.request({
            url: 'Data.ashx',
            callbackKey: 'callback',
            params: { source: 'image', id: videoData[videoData.length - 1].kcamera, from: videoData[videoData.length - 1].load_time.getTime() },
            callback: Ext.util.Functions.createDelegate(onGetVideoData, { id: videoData[videoData.length - 1].kcamera, dir: dir })
        });
    } else {
        if (lastVideoPanel != null) {
            Ext.Anim.run(lastVideoPanel, 'fade',
            {
                scope: lastVideoPanel,
                after: function () {
                    this.hide();
                    setVideoImage();
                }
            });
        } else 
            setVideoImage();        
    }
}

function setVideoImage() {
    dialogPanel.removeAll();
    Ext.getDom('video_img').src = videoData[currVideoIndex].image;
    lastVideoPanel = new Ext.Panel({ html: Ext.getDom('video').innerHTML, listeners : { swipe : function(c) { alert(c.direction); } } });
    dialogPanel.add(lastVideoPanel);
    dialogPanel.doLayout();
}

function onSpeedClick() {
    lastVideoPanel = null;
    dialogPanel.removeAll();
    dialogPanel.doLayout();
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'speed', id: this.id },
        callback: Ext.util.Functions.createDelegate(onGetSpeedData, { id: this.id })
    });
}

var currSensor = 0;
var currDay = 1;
var haveR = false;
var haveL = false;

function onGetSpeedData(result) {
    currDay = (new Date()).getDay();
    currDay = currDay == 0 ? 7 : currDay;
    currSensor = this.id;
    haveR = false;
    haveL = false;

    Ext.getDom('speed_now_l').innerHTML = '';
    Ext.getDom('speed_name_l').innerHTML = '';
    Ext.getDom('speed_name2_l').innerHTML = '';
    Ext.getDom('speed_km_l').innerHTML = '';
    Ext.getDom('speed_now_r').innerHTML = '';
    Ext.getDom('speed_name_r').innerHTML = '';
    Ext.getDom('speed_name2_r').innerHTML = '';
    Ext.getDom('speed_km_r').innerHTML = '';
    if (result != null && result.speedName_L != null && result.speedName_L != '') {
        Ext.getDom('speed_now_l').innerHTML = result.speed_L;
        Ext.getDom('speed_now_l').style.color = getSpeedColor(result.speed_L);
        Ext.getDom('speed_name_l').innerHTML = result.speedName_L;
        Ext.getDom('speed_name2_l').innerHTML = result.speedName_L;
        Ext.getDom('speed_km_l').innerHTML = ' км/ч';
        haveL = true;
    } 
    if (result != null && result.speedName_R != null && result.speedName_R != '') {
        Ext.getDom('speed_now_r').innerHTML = result.speed_R;
        Ext.getDom('speed_now_r').style.color = getSpeedColor(result.speed_R);
        Ext.getDom('speed_name_r').innerHTML = result.speedName_R;
        Ext.getDom('speed_name2_r').innerHTML = result.speedName_R;
        Ext.getDom('speed_km_r').innerHTML = (haveL ? '' : ' км/ч');
        haveR = true;
    } 
    updateDay();
}

function getSpeedColor(speed) {
    if (speed <= 50)
        return '#FF0000';
    else if (speed <= 60)
        return '#FFAA00';
    else if (speed <= 70)
        return '#FFFF00';
    else if (speed <= 90)
        return '#AAFF00';
    else 
        return '#4CE600';
}

function updateDay() {
    switch (currDay) {
        case 1:
            Ext.getDom('speed_day').innerHTML = 'ПОНЕДЕЛЬНИК';
            break;
        case 2:
            Ext.getDom('speed_day').innerHTML = 'ВТОРНИК';
            break;
        case 3:
            Ext.getDom('speed_day').innerHTML = 'СРЕДА';
            break;
        case 4:
            Ext.getDom('speed_day').innerHTML = 'ЧЕТВЕРГ';
            break;
        case 5:
            Ext.getDom('speed_day').innerHTML = 'ПЯТНИЦА';
            break;
        case 6:
            Ext.getDom('speed_day').innerHTML = 'СУББОТА';
            break;
        case 7:
            Ext.getDom('speed_day').innerHTML = 'ВОСКРЕСЕНЬЕ';
            break;
    }
    if (haveL)
        Ext.getDom('speed_usualy_l').src = 'Images/Sensors/b/' + currSensor + '_' + currDay + '_b.png';
    else
        Ext.getDom('speed_usualy_l').src = 'Images/empty.png';
    if (haveR)
        Ext.getDom('speed_usualy_r').src = 'Images/Sensors/a/' + currSensor + '_' + currDay + '_a.png';
    else
        Ext.getDom('speed_usualy_r').src = 'Images/empty.png';
    dialogPanel.removeAll();
    dialogPanel.add(new Ext.Panel({ html: Ext.getDom('speed').innerHTML }));
    dialogPanel.doLayout();
}

function nextSpeedDay() {
    currDay = currDay == 7 ? 1 : (currDay + 1);
    updateDay();
}

function prevSpeedDay() {
    currDay = currDay == 1 ? 7 : (currDay - 1);
    updateDay();
}

function onCommonClick() {
    lastVideoPanel = null;
    Ext.getDom('common_road').innerHTML = this.road;
    Ext.getDom('common_km').innerHTML = this.km == null ? ('') : (this.km + '-й км');
    Ext.getDom('common_roadLenght').innerHTML = this.roadLength + ' км';
    Ext.getDom('common_service').innerHTML = this.service;
    Ext.getDom('common_servicePhone').innerHTML = this.servicePhone;
    Ext.getDom('common_dtp').innerHTML = this.dtpName != null ? this.dtpName : "Н/Д";
    dialogPanel.removeAll();
    dialogPanel.add(new Ext.Panel({ html: Ext.getDom('common').innerHTML }));
    dialogPanel.doLayout();
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'repair', id: this.roadId },
        callback: Ext.util.Functions.createDelegate(onGetRepairData, { })
    });
    Ext.util.JSONP.request({
        url: 'Data.ashx',
        callbackKey: 'callback',
        params: { source: 'frepair', id: this.roadId },
        callback: Ext.util.Functions.createDelegate(onGetFutureRepairData, { })
    });
}

function onGetRepairData(result) {
    var str = "";
    for (var i = 0; i < result.length; i++) {
        if (i > 0)
            str += ', ';
        str += (result[i].Start + ' - ' + result[i].End + ' км');
    }
    if (str == "")
        str = "нет ремонта";
    Ext.getDom('common_repair').innerHTML = str;
    dialogPanel.removeAll();
    dialogPanel.add(new Ext.Panel({ html: Ext.getDom('common').innerHTML }));
    dialogPanel.doLayout();
}

function onGetFutureRepairData(result) {
    var str = "";
    for (var i = 0; i < result.length; i++) {
        if (i > 0)
            str += ', ';
        str += (result[i].Start + ' - ' + result[i].End + ' км ');
        str += ('<span class="reg">(с ' + result[i].StartDateStr + ')</span>');
    }
    if (str == "")
        str = "нет ремонта";
    Ext.getDom('common_future_repair').innerHTML = str;
    dialogPanel.removeAll();
    dialogPanel.add(new Ext.Panel({ html: Ext.getDom('common').innerHTML }));
    dialogPanel.doLayout();
}

var search = null;
function getSearch() {
    if (search != null)
        return search;

    search = new Ext.Panel({
        floating: true,
        modal: true,
        width: 260,
        height: 90,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'ПОИСК',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ { xtype: 'panel', contentEl: 'search' } ]
    });

    return search;
}

var settingsPanel = null;
function getTopSettings() {
    if (settingsPanel != null)
        return settingsPanel;

    Ext.regModel('topSettings', {
        fields: ['name']
    });

    var store = new Ext.data.JsonStore({
        model  : 'topSettings',
        data: [
            {name: 'Картооснова'},
            {name: 'Объекты на карте'},
            {name: 'О программе'}
        ]
    });

    var list = new Ext.List({ 
        itemTpl : '{name} <img style="float:right" src="Images/next.png" />',
        selectedItemCls: '',
        grouped : false,
        indexBar: false,   
        store: store,
        listeners:{ 
            itemtap: function(cmp,index,element,e) {
                getTopSettings().hide();
                switch(index){
                    case 0:
                        getMapSettings().showBy(settingsButton);
                        break;
                    case 1:
                        getObjectsSettings().showBy(settingsButton);
                        break;
                    case 2:
                        getAbout().show();
                        break;
                }
            }
        }
    });

    settingsPanel = new Ext.Panel({
        floating: true,
        modal: true,
        width: 220,
        height: 200,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'НАСТРОЙКИ',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ list ]
    });

    return settingsPanel;
}

var aboutPanel = null;
function getAbout() {
    if (aboutPanel != null)
        return aboutPanel;

    aboutPanel = new Ext.Panel({
        floating: true,
        modal: true,
        centered: true,
        width: 220,
        height: 180,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'О ПРОГРАММЕ',
                        titleCls: 'x-toolbar-title aboutTitle',
                        height: 40,
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        html: Ext.getDom('about').innerHTML
    });

    return aboutPanel;

}

var noInfoPanel = null;
function getNoInfo() {
    if (noInfoPanel != null)
        return noInfoPanel;

    noInfoPanel = new Ext.Panel({
        floating: true,
        modal: true,
        centered: true,
        width: 220,
        height: 80,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        height: 40,
                        items: [
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        html: Ext.getDom('no_info').innerHTML
    });

    return noInfoPanel;

}

var mapPanel = null;
var mapList = null;
function getMapSettings(){
    if (mapPanel != null)
        return mapPanel;

    Ext.regModel('mapSettings', {
        fields: ['name', 'image']
    });

    var store = new Ext.data.JsonStore({
        model  : 'mapSettings',
        data: [
            { name: 'Карта', image: 'map.png' },
            { name: 'Дорога', image: 'road.png' },
            { name: 'Спутник', image: 'stallite.png' },
            { name: 'Гибрид', image: 'hybrid.png' }
        ]
    });

    mapList = new Ext.List({ 
        itemTpl : '<div img="img"></div> {name} <img style="float:right" src="Images/{image}" />',
        itemCls: 'deSelectedItem',
        disableSelection: true,
        grouped : false,
        indexBar: false,   
        store: store,
        listeners:{ 
            itemtap: function(cmp, index, element, e) {
                var nodes = cmp.getNodes(0, 3);
                for (var i in nodes) {
                    try {
                        Ext.get(nodes[i]).removeCls('selectedItem');
                    } catch (err) {}
                }
                Ext.get(element).addCls('selectedItem');
                switch(index){
                    case 0:
                        map.map.setMapTypeId("ArcGIS");
                        break;
                    case 1:
                        map.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                        break;
                    case 2:
                        map.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                        break;
                    case 3:
                        map.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
                        break;
                }
            }
        }
    });

    window.setTimeout(function () {
        try {
            Ext.get(mapList.getNode(1)).addCls('selectedItem');
        } catch (err) {}
    }, 0);

    mapPanel = new Ext.Panel({
        floating: true,
        modal: true,
        width: 220,
        height: 270,
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'ОСНОВА',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { 
                                ui: 'back', 
                                text: 'Назад',
                                handler: function(){
                                    getMapSettings().hide();
                                    getTopSettings().showBy(settingsButton);
                                }
                            },
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ mapList ]
    });

    return mapPanel;
}

var objectsPanel = null;
var objectsStore = null;
function getObjectsSettings(){
    if (objectsPanel != null)
        return objectsPanel;

    Ext.regModel('objSettings', {
        fields: ['name', 'id', 'state']
    });

    var objectsStore = new Ext.data.JsonStore({
        model  : 'objSettings',
        data: [
            { name: 'Видеокамеры', id: 'video', img: 'video', state: false, zindex: 1 },
            { name: 'Метеостанции', id: 'meteo', img: 'meteo', state: false, zindex: 1 },
            { name: 'Скорость', id: 'sensors', img: 'sensors', state: false, zindex: 1 },
            { name: 'АЗС', id: 'poi_azs', img: 'poi_azs', state: false, zindex: 1 },
            { name: 'Автомойки', id: 'poi_wash', img: 'poi_wash', state: false, zindex: 1 },
            { name: 'СТО', id: 'poi_sto', img: 'poi_sto', state: false, zindex: 1 },
            { name: 'Пункты питания', id: 'poi_food', img: 'poi_food', state: false, zindex: 1 },
            { name: 'Остановки', id: 'poi_bus', img: 'poi_bus', state: false, zindex: 1 },
            { name: 'Места отдыха', id: 'poi_otdyh', img: 'poi_otdyh', state: false, zindex: 1 },
            { name: 'Магазины', id: 'poi_shop', img: 'poi_shop', state: false, zindex: 1 },
            { name: 'Аварийность', id: 'dtp', img: 'dtp', state: false, zindex: 0 },
            { name: 'Ремонт', id: 'remont', img: 'remont', state: false, zindex: 0 },
            { name: 'Ремонт план', id: 'remont_plan', img: 'remont_plan', state: false, zindex: 0 }
        ]
    });

    var list = new Ext.List({
        itemTpl: '<div img="img"></div> {name} <img style="float:right" class="markerInList" src="Images/Markers/{img}.png" />',
        itemCls: 'deSelectedItem',
        disableSelection: true,
        grouped: false,
        scroll: 'vertical',
        height: (Ext.is.Phone ? 240 : 440),
        store: objectsStore,
        listeners: {
            itemtap: function (cmp, index, element, e) {
                cmp.getStore().getAt(index).data.state = !cmp.getStore().getAt(index).data.state;
                if (cmp.getStore().getAt(index).data.state)
                    Ext.get(element).addCls('selectedItem');
                else
                    Ext.get(element).removeCls('selectedItem');
                var wasDifferentZIndex = false;
                var lastZIndex = null;
                for(var i = 0; i < cmp.getStore().getCount(); i++) {
                    if (lastZIndex != null && cmp.getStore().getAt(i).data.state && lastZIndex != cmp.getStore().getAt(i).data.zindex) {
                        wasDifferentZIndex = true;
                        break;
                    }
                    if (cmp.getStore().getAt(i).data.state) 
                        lastZIndex = cmp.getStore().getAt(i).data.zindex;
                }
                if (!wasDifferentZIndex) {
                    if (cmp.getStore().getAt(index).data.state)
                        showLayer(cmp.getStore().getAt(index).data.id);
                    else
                        hideLayer(cmp.getStore().getAt(index).data.id);
                }
                else
                {
                    for(var i = 0; i < cmp.getStore().getCount(); i++) {
                        if (cmp.getStore().getAt(i).data.state && layers[cmp.getStore().getAt(i).data.id].getMap() != null) 
                            hideLayer(cmp.getStore().getAt(i).data.id);
                    }
                    window.setTimeout(function(){
                        for(var i = 0; i < objectsStore.getCount(); i++) {
                            if (objectsStore.getAt(i).data.state && objectsStore.getAt(i).data.zindex == 0) 
                                showLayer(objectsStore.getAt(i).data.id);
                        }
                        for(var i = 0; i < objectsStore.getCount(); i++) {
                            if (objectsStore.getAt(i).data.state && objectsStore.getAt(i).data.zindex == 1) 
                                showLayer(objectsStore.getAt(i).data.id);
                        }
                    }, 0);
                }
            }
        }
    });

    objectsPanel = new Ext.Panel({
        floating: true,
        modal: true,
        width: 220,
        height: (Ext.is.Phone ? 300 : 500),
        dockedItems: [
                    {
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'ОБЪЕКТЫ',
                        height: 40,
                        style: { fontSize: '10pt', fontWeight: 'bold' },
                        items: [
                            { 
                                ui: 'back', 
                                text: 'Назад',
                                handler: function(){
                                    getObjectsSettings().hide();
                                    getTopSettings().showBy(settingsButton);
                                }
                            },
                            { xtype: 'spacer' },
                            { text: 'X', handler: function () {
                                var dlg = this.ownerCt.ownerCt;
                                dlg.hide();
                            },
                            style: { fontSize: '14pt', fontWeight: 'bold' },
                            ui: 'round'
                            }]
                    }
            ],
        items: [ list ]
    });

    return objectsPanel;
}

function showLayer(id) {
    if (id == 'remont') 
        layers[id] = new google.maps.KmlLayer(url + '/kml.ashx?kml=remont&t=' + (new Date()).getTime(), { suppressInfoWindows: true, preserveViewport: true, clickable: false });
    if (id == 'remont_plan') 
        layers[id] = new google.maps.KmlLayer(url + '/kml.ashx?kml=remont_plan&t=' + (new Date()).getTime(), { suppressInfoWindows: true, preserveViewport: true, clickable: false });
    layers[id].setMap(map.map);
}

function hideLayer(id) {
    layers[id].setMap(null);
}

function onSearch() {
    if (Ext.getDom('search_text').value.length > 0){
        showProgress();
        Ext.util.JSONP.request({
            url: 'http://maps.google.com/maps/geo',
            callbackKey: 'callback',
            params: {
                q: Ext.getDom('search_text').value,
                sensor: true,
                output: 'json',
                oe: 'utf8',
                gl: 'ru',
                ll: '55.607,37.68',
                spn: '1.363,2.538',
                key: gkey
            },
            callback: onGetSearch
        });
    }
}

function onGetSearch(result) {
    hideProgress();
    if (result != null && result.Placemark != null && result.Placemark.length > 0) {
        if (searchMarker != null)
            searchMarker.setMap(null);
        var coord = new google.maps.LatLng(result.Placemark[0].Point.coordinates[1], result.Placemark[0].Point.coordinates[0]);
        searchMarker = new google.maps.Marker({
            position: coord,
            map: map.map,
        });
        map.map.panTo(coord);
        map.map.setZoom(10);      
    }
}

function showProgress() {
    Ext.getDom('request_progress').style.top = (document.documentElement.clientHeight - 20) + 'px';
    Ext.getDom('request_progress').style.left = (document.documentElement.clientWidth - 200) + 'px';

    Ext.getDom('request_progress').style.display = 'block';
}

function hideProgress() {
    Ext.getDom('request_progress').style.display = 'none';
}

function onSearchKeyDown(e) {
    if (e.keyCode == 13)
        onSearch();
}
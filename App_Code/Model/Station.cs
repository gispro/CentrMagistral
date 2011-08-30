using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BLToolkit.Mapping;

public class Station
{
    public int Kstation { get; set; }
    [MapField("station_pos")]
    public double Position { get; set; }
    [MapField("station_name")]
	public string Name { get; set; }
    [MapField("road_name")]
    public string RoadName { get; set; }
    [MapIgnore]
    public double[] Location { get; set; }
}

public class MeteoData
{
    public int KData { get; set; }
    public int Kstation { get; set; }
    public DateTime? Data_Time { get; set; }
    public double? C01_T { get; set; }
    public int? C02_RH { get; set; }
    public double? C03_TD { get; set; }
    public double? C05_P { get; set; }
    public double? C10_WS { get; set; }
    public double? C12_WSmax { get; set; }
    public int? C11_WD { get; set; }
    public double? C21_RI { get; set; }
    public string C22_RS_name { get; set; }
    public double? R01_TS { get; set; }
    public string R10_surf_name { get; set; }
    public double? L01_TS { get; set; }
    public string L10_surf_name { get; set; }
    public string rain_name { get; set; }

    [MapIgnore]
    public string Surface1
    {
        get
        {
            if (L10_surf_name == null)
                return "Н/Д";

            return L10_surf_name;
        }
    }

    [MapIgnore]
    public string Surface2
    {
        get
        {
            if (R10_surf_name == null)
                return "Н/Д";

            return R10_surf_name;
        }
    }

    [MapIgnore]
    public string TempName
    {
        get
        {
            if (C01_T == null)
                return "Н/Д";

            return C01_T.Value > 0 ? string.Format("+{0}° C", C01_T.Value) : (C01_T.Value < 0 ? string.Format("-{0}° C", C01_T.Value) : "0° C");
        }
    }

    [MapIgnore]
    public double Temp
    {
        get
        {
            if (C01_T == null)
                return 0;

            return C01_T.Value;
        }
    }

    [MapIgnore]
    public string WindDirection
    {
        get
        {
            if (23 <= C11_WD && C11_WD <= 67)
                return "СВ";
            else if (68 <= C11_WD && C11_WD <= 112)
                return "В";
            else if (113 <= C11_WD && C11_WD <= 157)
                return "ЮВ";
            else if (158 <= C11_WD && C11_WD <= 202)
                return "Ю";
            else if (203 <= C11_WD && C11_WD <= 247)
                return "ЮЗ";
            else if (248 <= C11_WD && C11_WD <= 292)
                return "З";
            else if (293 <= C11_WD && C11_WD <= 337)
                return "СЗ";
            else
                return "С";
        }
    }

    [MapIgnore]
    public string WindSpeed
    {
        get
        {
            if (C10_WS == null)
                return "Н/Д";

            return C10_WS.Value.ToString();
        }
    }

    [MapIgnore]
    public string WindSpeedMax
    {
        get
        {
            if (C12_WSmax == null)
                return "Н/Д";

            return C12_WSmax.Value.ToString();
        }
    }

    [MapIgnore]
    public string Time
    {
        get
        {
            if (this.Data_Time == null)
                return "Н/Д";

            return this.Data_Time.ToString();
        }
    }

    [MapIgnore]
    public string ImageName
    {
        get 
        {
            if (rain_name == null && C21_RI < -1)
                return "2.png";

            var result = "1.png";
            switch (rain_name)
            {
                case "Осадки":
                    if (C01_T > 2)
                    {
                        if (C22_RS_name == null)
                            result = "12.png";
                        else if (C22_RS_name == "сильный")
                            result = "11.png";
                        else if (C22_RS_name == "умеренный")
                            result = "12.png";
                        else if (C22_RS_name == "слабый")
                            result = "7.png";
                    }
                    else if (C01_T < -2)
                    {
                        if (C22_RS_name == null)
                            result = "14a.png";
                        else if (C22_RS_name == "сильный")
                            result = "14.png";
                        else if (C22_RS_name == "умеренный")
                            result = "14a.png";
                        else if (C22_RS_name == "слабый")
                            result = "9a.png";
                    }
                    else if (-2 <= C01_T && C01_T <= 2)
                        result = "16.png";
                    break;
                case "Облачно":
                    result = "4.png";
                    if (C01_T > 2)
                    {
                        if (C22_RS_name == "слабый")
                            result = "6.png";
                    }
                    else if (C01_T < -2)
                    {
                        if (C22_RS_name == "слабый")
                            result = "9.png";
                    }
                    break;                
            }

            return result;
        }
    }
}
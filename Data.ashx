<%@ WebHandler Language="C#" Class="Data" %>

using System;
using System.Web;
using System.Linq;

public class Data : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        var source = context.Request.QueryString["source"];
        var fromTime = context.Request.QueryString["from"];
        var id = context.Request.QueryString["id"];
        context.Response.Clear();
        context.Response.ContentType = "application/json";
        context.Response.Cache.SetNoStore();
        var builder = new System.Text.StringBuilder();
        if (HttpContext.Current.Request.QueryString["callback"] != null)
            builder.AppendFormat("{0}(", HttpContext.Current.Request.QueryString["callback"]);
        if (source != null)
        {
            switch (source)
            {
                case "image":
                    BuildImagesResponse(builder, source, fromTime, id);
                    break;
                case "cam":
                    BuildCamsMarkers(builder);
                    break;
                case "meteo":
                    BuildStationsMarkers(builder);
                    break;
                case "meteodata":
                    BuildStationsData(builder, id);
                    break;
                case "speed":
                    BuildSpeedData(builder, id);
                    break;
                case "repair":
                    BuildRepairData(builder, id);
                    break;
                case "common":
                    BuildCommonData(builder, id, context.Request.QueryString["km"]);
                    break;
            }
        }
        if (HttpContext.Current.Request.QueryString["callback"] != null)
            builder.Append(")");
        context.Response.Write(builder.ToString());
        context.Response.End();
    }

    private void BuildCommonData(System.Text.StringBuilder builder, string id, string km)
    {
        var data = DataBase.DataAccessLayer.GetCommon(int.Parse(id), double.Parse(km, System.Globalization.CultureInfo.InvariantCulture));
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();

        builder.Append(serializer.Serialize(data));
    }

    private void BuildRepairData(System.Text.StringBuilder builder, string id)
    {
        var data = DataBase.DataAccessLayer.GetRepairs(int.Parse(id));
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();

        builder.Append(serializer.Serialize(data));
    }

    private void BuildSpeedData(System.Text.StringBuilder builder, string id)
    {
        var data = DataBase.DataAccessLayer.GetSpeedData(int.Parse(id));
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();

        builder.Append(serializer.Serialize(data));
    }

    private void BuildStationsData(System.Text.StringBuilder builder, string id)
    {
        var data = DataBase.DataAccessLayer.GetStationData(int.Parse(id));
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        
        builder.Append(serializer.Serialize(data));
    }

    private void BuildStationsMarkers(System.Text.StringBuilder builder)
    {
        var stations = DataBase.DataAccessLayer.GetStations();
        var coordinatesXml = System.Xml.Linq.XDocument.Load(HttpContext.Current.Server.MapPath("~/Xml/meteo.xml"));
        foreach (var station in stations)
        {
            var coordinates = coordinatesXml.Document.Element("kml").Element("Document").Element("Folder").Elements("Placemark")
                .Where(e => int.Parse(e.Element("name").Value) == station.Kstation)
                .Select(e => e.Element("Point") != null ? e.Element("Point").Element("coordinates").Value : null)
                .FirstOrDefault();
            if (coordinates == null)
                continue;
            var parts = coordinates.Trim().Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            station.Location = new double[] { 
                double.Parse(parts[0], System.Globalization.CultureInfo.InvariantCulture), 
                double.Parse(parts[1], System.Globalization.CultureInfo.InvariantCulture) 
            };
        }
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        builder.Append(serializer.Serialize(stations.Where(s => s.Location != null).ToList()));
    }

    private void BuildCamsMarkers(System.Text.StringBuilder builder)
    {
        var cameras = DataBase.DataAccessLayer.GetCameras();
        var coordinatesXml = System.Xml.Linq.XDocument.Load(HttpContext.Current.Server.MapPath("~/Xml/camers.xml"));
        foreach (var camera in cameras)
        {
            var coordinates = coordinatesXml.Document.Element("kml").Element("Folder").Elements("Placemark")
                .Where(e => int.Parse(e.Element("name").Value) == camera.Kcamera)
                .Select(e => e.Element("Point") != null ? e.Element("Point").Element("coordinates").Value : null)
                .FirstOrDefault();
            if (coordinates == null)
                continue;
            var parts = coordinates.Trim().Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            camera.Location = new double[] { 
                double.Parse(parts[0], System.Globalization.CultureInfo.InvariantCulture), 
                double.Parse(parts[1], System.Globalization.CultureInfo.InvariantCulture) 
            };
        }
        var serializer = new System.Web.Script.Serialization.JavaScriptSerializer();
        builder.Append(serializer.Serialize(cameras.Where(c => c.Location != null).ToList()));
    }

    private static void BuildImagesResponse(System.Text.StringBuilder builder, string source, string fromTime, string id)
    {
        builder.Append("[");
        int camId = 0;
        int.TryParse(id, out camId);
        DateTime? from = null;
        var offsetStr = HttpContext.Current.Request.QueryString["offset"];
        var offset = 0;
        if (offsetStr != null)
            offset = int.Parse(offsetStr);
        if (fromTime != null)
        {
            var fromTimeAsLong = long.Parse(fromTime);
            from = new DateTime(1970, 1, 1).AddMilliseconds(fromTimeAsLong).AddMinutes(-offset);            
        }
        var table = DataBase.DataAccessLayer.GetData(source, from, camId);
        foreach (System.Data.DataRow row in table.Rows)
        {
            builder.Append("{");
            foreach (System.Data.DataColumn field in table.Columns)
            {
                builder.AppendFormat("\"{0}\":", field.ColumnName);
                if (field.DataType == typeof(string))
                    builder.AppendFormat("'{0}'", row[field].ToString().Replace(@"\", @"\\").Replace("'", @"\'"));
                else if (field.DataType == typeof(int))
                {
                    var value = DataBase.DataConverter.ToInt32(row[field], 0);
                    builder.AppendFormat("{0}", value.ToString(System.Globalization.CultureInfo.InvariantCulture));
                }
                else if (field.DataType == typeof(float))
                {
                    var value = DataBase.DataConverter.ToDouble(row[field], 0);
                    builder.AppendFormat("{0}", value.ToString(System.Globalization.CultureInfo.InvariantCulture));
                }
                else if (field.DataType == typeof(DateTime))
                {
                    var date = DataBase.DataConverter.ToDateTime(row[field], DateTime.MinValue);
                    if (date != DateTime.MinValue)
                    {
                        builder.AppendFormat("new Date({0}, {1}, {2}, {3}, {4}, {5})", date.Year, (date.Month - 1), date.Day, date.Hour, date.Minute, date.Second);
                        builder.AppendFormat(",{0}Str: \"{1}\"", field.ColumnName, date.ToString("dd.MM.yyyy HH:mm:ss"));
                    }
                    else
                        builder.AppendFormat("null");
                }
                else
                    builder.AppendFormat("null");
                builder.Append(",");
            }
            if (source == "image")
            {
                builder.AppendFormat("\"image\":\"{0}\"", string.Format("Image.ashx?id={0}", row["kimage"]));
                builder.Append(",");
            }
            builder.Remove(builder.Length - 1, 1);
            builder.Append("},");
        }
        builder.Remove(builder.Length - 1, 1);
        builder.Append("]");
    }

    public bool IsReusable 
    {
        get 
        {
            return true;
        }
    }

}
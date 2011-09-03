<%@ WebHandler Language="C#" Class="GeoData" %>

using System;
using System.Web;

public class GeoData : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) 
    {
        var timeStr = System.Configuration.ConfigurationManager.AppSettings["makersCacheTime"];
        var time = 172800;
        if (!string.IsNullOrEmpty(timeStr))
            time = int.Parse(timeStr, System.Globalization.CultureInfo.InvariantCulture);
        context.Response.Clear();
        context.Response.ContentType = "application/json";
        context.Response.Cache.SetMaxAge(new TimeSpan(0, 0, time));

        var source = context.Request.QueryString["source"];
        var id = GetPOIIndex(source);

        string response = context.Cache[source] as string;
        if (response == null)
        {
            var request = System.Net.WebRequest.Create("http://maps.gispro.ru/ArcGIS/rest/services/Rosavtodor/points_dd_events/MapServer/" +
                id + "/query?text=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&where=1%3D1&returnGeometry=true&outSR=&outFields=&f=pjson");
            request.Method = "GET";
            var reader = new System.IO.StreamReader(request.GetResponse().GetResponseStream());
            response = reader.ReadToEnd();
            if (HttpContext.Current.Request.QueryString["callback"] != null)
                response = string.Format("{0}(", HttpContext.Current.Request.QueryString["callback"]) + response + ")";
            context.Cache.Add(source, response, null, DateTime.MaxValue, new TimeSpan(0, 0, time), System.Web.Caching.CacheItemPriority.Default, null);
        }
        context.Response.Write(response);
    }
 
    private int GetPOIIndex(string poiName) 
    {
        switch(poiName) 
        {
            default:
            case "meteo": return 0;
            case "video": return 1;
            case "sensors": return 2;
            case "poi_azs": return 3;
            case "poi_bus": return 4;
            case "poi_food": return 5;
            case "poi_otdyh": return 6;
            case "poi_shop": return 7;
            case "poi_sto": return 8;
            case "poi_wash": return 9;
       }
    }

    public bool IsReusable  { get { return false; } }
}
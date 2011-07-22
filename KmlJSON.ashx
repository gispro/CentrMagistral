<%@ WebHandler Language="C#" Class="Kml" %>

using System;
using System.Collections.Generic;
using System.Web;
using System.Linq;
using System.Xml.Linq;

public class Kml : IHttpHandler {

    string url = "http://89.221.201.176:8080/fedroads";
    XNamespace ns = "http://earth.google.com/kml/2.2";
    
    public void ProcessRequest (HttpContext context) 
    {
        var idNames = new Dictionary<string, string>() { 
            { "meteo", "name" },
            { "poi_azs", "Kazs" },
            { "poi_bus", "Kbus" },
            { "poi_food", "Kfood" },
            { "poi_otdyh", "Kotdyh" },
            { "poi_shop", "Kshop" },
            { "poi_sto", "Ksto" },
            { "poi_wash", "Kwash" },
            { "sensors", "name" },
            { "video", "name" }
        };
        var kmlName = context.Request.QueryString["kml"];
        context.Response.Cache.SetNoStore();
        context.Response.ContentType = "application/json";
        var builder = new System.Text.StringBuilder();
        if (HttpContext.Current.Request.QueryString["callback"] != null)
            builder.AppendFormat("{0}(", HttpContext.Current.Request.QueryString["callback"]);

        builder.Append("[");
        
        var sourceKml = XDocument.Load(context.Server.MapPath("~/kml/" + kmlName + ".kml"));
        var docElement = sourceKml.Element(ns + "kml").Element(ns + "Document");
        var placemarks = docElement.Element(ns + "Folder").Elements(ns + "Placemark");
        foreach (var place in placemarks)
        {
            var idName = idNames[kmlName.ToLower()];
            var id = 0;
            if (idName == "name")
                int.TryParse(place.Element(ns + "name").Value, out id);
            else
                int.TryParse(place.Element(ns + "ExtendedData").Element(ns + "SchemaData").Elements(ns + "SimpleData")
                    .Where(e => e.Attribute("name").Value == idName).First().Value, out id);

            if (place.Element(ns + "Point") == null)
                continue;
            
            var coords = place.Element(ns + "Point").Element(ns + "coordinates").Value.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            builder.AppendFormat("\"type\":\"{0}\"", kmlName);
            builder.AppendFormat(",\"id\":{0}", id);
            builder.AppendFormat(",\"coords\":[{0}, {1}],", coords[0], coords[1]);
        }
        builder.Remove(builder.Length - 1, 1);
        builder.Append("]");

        if (HttpContext.Current.Request.QueryString["callback"] != null)
            builder.Append(")");
        context.Response.Write(builder.ToString());
        context.Response.End();
    }
 
    public bool IsReusable 
    {
        get 
        {
            return false;
        }
    }

}
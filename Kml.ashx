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
        var kmlName = context.Request.QueryString["kml"];
        var iconName = context.Request.QueryString["icon"];
        context.Response.Cache.SetNoStore();
        context.Response.ContentType = "text/xml";
        var sourceKml = XDocument.Load(context.Server.MapPath("~/kml/" + kmlName + ".kml"));
        var docElement = sourceKml.Element(ns + "kml").Element(ns + "Document");
        if (!string.IsNullOrEmpty(iconName))
        {
            docElement.AddFirst(new XElement(ns + "Style", new XAttribute("id", "style"),
                new XElement(ns + "IconStyle",
                    new XElement(ns + "Icon",
                        new XElement(ns + "href", url + "/images/markers/" + iconName + ".png")
                    )
                )
            ));
            var placemarks = docElement.Element(ns + "Folder").Elements(ns + "Placemark");
            foreach (var place in placemarks)
                place.AddFirst(new XElement(ns + "styleUrl", "#style"));
        }
        if (kmlName == "remont")
        {
            var repairs = DataBase.DataAccessLayer.GetActualRepairs();
            var placemarks = docElement.Element(ns + "Folder").Elements(ns + "Placemark")
                .Where(p => p.Element(ns + "name") != null && repairs.Count(r => r.Kremont.ToString() == p.Element(ns + "name").Value) == 0).ToList();
            foreach (var place in placemarks)
                place.Remove();
        }
        if (kmlName == "remont_plan")
        {
            var repairs = DataBase.DataAccessLayer.GetFutureRepairs();
            var placemarks = docElement.Element(ns + "Folder").Elements(ns + "Placemark")
                .Where(p => p.Element(ns + "name") != null && repairs.Count(r => r.Kremont.ToString() == p.Element(ns + "name").Value) == 0).ToList();
            foreach (var place in placemarks)
                place.Remove();
        }
        sourceKml.Save(new System.IO.StreamWriter(context.Response.OutputStream));
    }
 
    public bool IsReusable 
    {
        get 
        {
            return false;
        }
    }

}
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
            var placemarks = sourceKml.Document.Element(ns + "kml").Element(ns + "Document").Element(ns + "Folder").Elements(ns + "Placemark");
            foreach (var place in placemarks)
                place.AddFirst(new XElement(ns + "styleUrl", "#style"));
        }
        sourceKml.Save(context.Response.OutputStream);
    }
 
    public bool IsReusable 
    {
        get 
        {
            return false;
        }
    }

}
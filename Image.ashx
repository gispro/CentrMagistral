<%@ WebHandler Language="C#" Class="Image" %>

using System;
using System.Web;

public class Image : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) 
    {
        context.Response.ContentType = "image/jpeg";
        var id = context.Request.QueryString["id"];
        var camera = context.Request.QueryString["camera"];

        byte[] data = null;
        if (id != null)
        {
            data = DataBase.DataAccessLayer.GetImageData(int.Parse(id));
        }
        else if (camera != null)
        {
            data = DataBase.DataAccessLayer.GetLastImageData(int.Parse(camera));            
        }
        if (data != null)
            context.Response.OutputStream.Write(data, 0, data.Length);
    }
 
    public bool IsReusable 
    {
        get 
        {
            return true;
        }
    }

}
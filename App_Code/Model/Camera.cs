using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BLToolkit.Mapping;

public class Camera
{
	public int Kcamera { get; set; }
    //[MapField("camera_pos")]
    //public double Position { get; set; }
    [MapField("camera_name")]
	public string Name { get; set; }
    [MapField("road_name")]
    public string RoadName { get; set; }
    [MapIgnore]
    public double[] Location { get; set; }
}
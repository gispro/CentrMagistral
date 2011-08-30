using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BLToolkit.Mapping;

public class Bus
{
    public int Kbus { get; set; }
    [MapField("bus_name")]
	public string Name { get; set; }
    [MapField("axis_name")]
    public string Dir { get; set; }
}

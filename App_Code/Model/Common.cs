using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BLToolkit.Mapping;

public class Common
{
    public int Kroad { get; set; }
	public string GIBDDName { get; set; }
    public string GIBDDPhone { get; set; }
    public string GIBDDAddress { get; set; }
    public string ServiceName { get; set; }
    public string ServicePhone { get; set; }
    public double? ServiceKmBeg { get; set; }
    public double? ServiceKmEnd { get; set; }
    [MapIgnore]
    public string ServiceKm 
    { 
        get
        {
            if (ServiceKmBeg != null && ServiceKmEnd != null)
                return string.Format("с {0} по {1} км", ServiceKmBeg, ServiceKmEnd);
            return string.Empty;
        }
    }

    public string RoadName { get; set; }
}

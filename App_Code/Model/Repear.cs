using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BLToolkit.Mapping;

public class Repear
{
    [MapField("remont_pos_beg")]
	public double? Start { get; set; }
    [MapField("remont_pos_end")]
    public double? End { get; set; }
}
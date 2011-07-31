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

    public int Kremont { get; set; }

    [MapField("remont_date_beg")]
    public DateTime? StartDate { get; set; }
    [MapField("remont_date_end")]
    public DateTime? EndDate { get; set; }

    [MapIgnore]
    public string StartDateStr { get { return StartDate != null ? StartDate.Value.ToShortDateString() : string.Empty; } }
    [MapIgnore]
    public string EndDateStr { get { return EndDate != null ? EndDate.Value.ToShortDateString() : string.Empty; } }
}
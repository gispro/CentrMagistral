using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.Common;
using System.Text.RegularExpressions;
using System.Configuration;

using System.Web.Security;
using System.Globalization;
using System.Data.SqlClient;

namespace DataBase
{
    public static class DataConverter
    {
        public static int ToInt32(object value)
        {
            return ToInt32(value, 0);
        }

        public static int ToInt32(object value, int defaultValue)
        {
            if (value == null || value == DBNull.Value)
                return defaultValue;
            else
            {
                int result = 0;
                if (int.TryParse(ToString(value, string.Empty), out result))
                    return result;
                else
                    return defaultValue;
            }
        }

        public static string ToString(object value)
        {
            return ToString(value, null);
        }

        public static double ToDouble(object value)
        {
            return ToDouble(value, 0);
        }

        public static double ToDouble(object value, double defaultValue)
        {
            return (value == null || value == DBNull.Value) ? defaultValue : Convert.ToDouble(value);
        }

        public static string ToString(object value, string defaultValue)
        {
            return (value == null || value == DBNull.Value) ? defaultValue : value.ToString();
        }

        public static bool ToBoolean(object value)
        {
            return ToBoolean(value, false);
        }

        public static bool ToBoolean(object value, bool defaultValue)
        {
            return (value == null || value == DBNull.Value) ? defaultValue : Convert.ToBoolean(value);
        }

        public static DateTime ToDateTime(object value)
        {
            return ToDateTime(value, DateTime.Now);
        }

        public static DateTime ToDateTime(object value, DateTime defaultValue)
        {
            return (value == null || value == DBNull.Value) ? defaultValue : Convert.ToDateTime(value);
        }

        public static DateTime? ToDateTime(object value, DateTime? defaultValue)
        {
            return (value == null || value == DBNull.Value) ? defaultValue : Convert.ToDateTime(value);
        }
    }
}
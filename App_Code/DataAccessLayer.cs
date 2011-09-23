using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using BLToolkit.Data;

namespace DataBase
{
    public static class DataAccessLayer
    {
        public static byte[] GetImageData(int id)
        {
            byte[] data = null;
            using (DbManager db = new DbManager())
            {
                var reader = db.SetCommand("SELECT image_body FROM gp_image WHERE kimage=@id",
                    db.Parameter("@id", id)).ExecuteReader();
                if (reader.Read())
                    data = (byte[])reader["image_body"];
            }

            return data;
        }

        public static byte[] GetLastImageData(int cameraid)
        {
            byte[] data = null;
            using (DbManager db = new DbManager())
            {
                var reader = db.SetCommand("SELECT top 1 image_body FROM gp_image WHERE kcamera=@id order by load_time desc",
                    db.Parameter("@id", cameraid)).ExecuteReader();
                if (reader.Read())
                    data = (byte[])reader["image_body"];
            }

            return data;
        }

        public static DataTable GetData(string source, DateTime? from, int id)
        {
            var dataTable = new DataTable();

            switch (source)
            {
                case "image":
                    if (from == null)
                    {
                        if (id == 0)
                        {
                            var sql = "SELECT TOP 10 kimage, kcamera, load_time FROM gp_image order by load_time desc";
                            using (DbManager db = new DbManager())
                                return db.SetCommand(sql).ExecuteDataTable();
                        }
                        else
                        {
                            var sql = "SELECT TOP 10 kimage, kcamera, load_time FROM gp_image where kcamera=@id order by load_time desc";
                            using (DbManager db = new DbManager())
                                return db.SetCommand(sql, db.Parameter("@id", id)).ExecuteDataTable();
                        }
                    }
                    else
                    {
                        if (id == 0)
                        {
                            var sql = "SELECT TOP 10 kimage, kcamera, load_time FROM gp_image where load_time <= @from order by load_time desc";
                            using (DbManager db = new DbManager())
                                return db.SetCommand(sql, db.Parameter("@from", from)).ExecuteDataTable();
                        }
                        else
                        {
                            var sql = "SELECT TOP 10 kimage, kcamera, load_time FROM gp_image where load_time <= @from and kcamera=@id order by load_time desc";
                            using (DbManager db = new DbManager())
                                return db.SetCommand(sql, db.Parameter("@from", from), db.Parameter("@id", id))
                                    .ExecuteDataTable();
                        }
                    }
            }

            return dataTable;
        }

        public static List<Camera> GetCameras()
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"SELECT c.Kcamera, c.camera_name, c.camera_pos, r.road_name FROM gp_camera c JOIN gp_Road r ON c.Kroad=r.Kroad").ExecuteList<Camera>();
        }

        public static List<Station> GetStations()
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"SELECT s.Kstation, s.station_name, s.station_pos, r.road_name FROM GP_station s JOIN gp_Road r ON s.Kroad=r.Kroad").ExecuteList<Station>();
        }

        public static MeteoData GetStationData(int station)
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"SELECT TOP 1 * FROM GP_data WHERE KStation=@Station ORDER BY Data_Time DESC", 
                    db.Parameter("@Station", station)).ExecuteObject<MeteoData>();
        }

        public static Speed GetSpeedData(int sensor)
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"select top 1 sp.speed_R, sp.speed_L, sn.L_direction as speedName_L, sn.R_direction as speedName_R " 
                    + "from gp_speed sp join gp_sensor sn on sp.ksensor=sn.ksensor WHERE sp.Ksensor=@Sensor ORDER BY sp.Speed_Data_Time DESC",
                    db.Parameter("@Sensor", sensor)).ExecuteObject<Speed>();
        }

        public static List<Repair> GetRepairs(int id)
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"SELECT * FROM GP_remont WHERE remont_date_end >= @CurrDate AND Kroad=@Id", 
                    db.Parameter("@CurrDate", DateTime.Today),
                    db.Parameter("@Id", id)).ExecuteList<Repair>();
        }

        public static List<Repair> GetFutureRepairs()
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"SELECT * FROM GP_remont WHERE remont_date_beg < @CurrDate ",
                    db.Parameter("@CurrDate", DateTime.Now)).ExecuteList<Repair>();
        }

        public static List<Repair> GetActualRepairs()
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"SELECT * FROM GP_remont WHERE remont_date_end >= @CurrDate",
                    db.Parameter("@CurrDate", DateTime.Today)).ExecuteList<Repair>();
        }

        public static Common GetCommon(int roadId, double km)
        {
            using (DbManager db = new DbManager())
                return db.SetCommand(@"SELECT TOP 1 r.road_titul as RoadName, r.Kroad, " +
                    "o.org_name as ServiceName, o.org_phone as ServicePhone, o.road_pos_beg as ServiceKmBeg, o.road_pos_end as ServiceKmEnd, " +
                    "g.org_name as GIBDDName, g.org_phone as GIBDDPhone, g.org_address as GIBDDAddress " +
                    "FROM Sys_road r LEFT JOIN GP_org_road o ON (r.Kroad=o.Kroad AND o.road_pos_beg <= @km AND o.road_pos_end >= @km)" +
                    "LEFT JOIN GP_gibdd_road g ON (r.Kroad=g.Kroad AND g.road_pos_beg <= @km AND @km <= g.road_pos_end)  WHERE r.Kroad=@Kroad",
                    db.Parameter("@Kroad", roadId), db.Parameter("@km", km)).ExecuteObject<Common>();
        }
    }
}
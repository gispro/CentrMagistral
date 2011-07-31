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

    public static class DataAccessHelper
    {
        [ThreadStatic]
        private static string _currentConnectionString = null;
        [ThreadStatic]
        private static SqlConnection _currentConnection = null;
        [ThreadStatic]
        private static SqlTransaction _currentTransaction = null;
        [ThreadStatic]
        private static int _dataAccessCount = 0;
        [ThreadStatic]
        private static bool _wasRollBack = false;

        public delegate bool ExecuteReaderHandler(IDataReader reader);
        public delegate void DoCommandHandler(SqlCommand comm);

        private static void CheckAndAddParameters(string sql, SqlCommand cmd, object[] parameters)
        {
            var paramRegEx = new Regex(@"@.+?\b");
            MatchCollection matches = paramRegEx.Matches(sql);
            List<string> matchesList = new List<string>(matches.Count);
            foreach (Match m in matches)
                if (!matchesList.Contains(m.ToString()))
                    matchesList.Add(m.ToString());
            if (matchesList.Count * 2 == parameters.Length && parameters.Length > 0 
                && parameters.Count(p => p != null && p.ToString().StartsWith("@")) == parameters.Length / 2)
            {
                for (int i = 0; i < parameters.Length; i+=2)
                    cmd.Parameters.AddWithValue(parameters[i].ToString(), parameters[i + 1] ?? DBNull.Value);
            }
            else if (matchesList.Count != parameters.Length && parameters.Length > 0)
                throw new ArgumentException("Not enough parameters.");
            for (int i = 0; i < parameters.Length; i++)
                cmd.Parameters.AddWithValue(matchesList[i], parameters[i] ?? DBNull.Value);
        }

        private static void DoCommand(DoCommandHandler doHandler, string sql, params object[] parameters)
        {
            SqlConnection conn = null;
            SqlTransaction trans = null;
            try
            {
                if (_currentConnection != null)
                    conn = _currentConnection;
                else
                    conn = new SqlConnection(CurrentConnectionSettings.ConnectionString);
                if (conn.State != ConnectionState.Open)
                    conn.Open();
                if (_currentTransaction != null)
                    trans = _currentTransaction;
                using (var comm = new SqlCommand(sql, conn, trans))
                {
                    int timeOut = 60;
                    if (ConfigurationManager.AppSettings["CommandTimeout"] != null)
                        timeOut = int.Parse(ConfigurationManager.AppSettings["CommandTimeout"], CultureInfo.InvariantCulture);
                    comm.CommandTimeout = timeOut;
                    CheckAndAddParameters(sql, comm, parameters);
                    if (doHandler != null)
                        doHandler(comm);
                }
            }
            catch(Exception ex)
            {
                if (_currentConnection == null && _currentTransaction == null && trans != null)
                {
                    trans.Rollback();
                    trans = null;
                }
                throw;
            }
            finally
            {
                if (_currentConnection == null && _currentTransaction == null)
                {
                    if (trans != null)
                        trans.Commit();
                    conn.Dispose();
                }
            }
        }

        public static void BeginTransaction()
        {
            if (_currentConnection == null)
            {
                _wasRollBack = false;
                _currentConnection = new SqlConnection(CurrentConnectionSettings.ConnectionString);
                _currentConnection.Open();
                _currentTransaction = _currentConnection.BeginTransaction(IsolationLevel.ReadCommitted);
                _dataAccessCount = 0;
            }
            else
            {
                _dataAccessCount++;
            }
        }

        private static bool DecreaseAndCheckCount()
        {
            if (_dataAccessCount > 0)
            {
                _dataAccessCount--;
                return false;
            }

            return true;
        }

        public static void CommitTransaction()
        {
            if (_currentConnection != null && _currentTransaction != null)
            {
                if (!DecreaseAndCheckCount())
                    return;
                if (_wasRollBack)
                    _currentTransaction.Rollback();
                else
                    _currentTransaction.Commit();
                _currentConnection.Close();
                _currentConnection = null;
                _currentTransaction = null;
                _wasRollBack = false;
            }
        }

        public static void RollbackTransaction()
        {
            RollbackTransaction(false);
        }

        public static void RollbackTransaction(bool force)
        {
            if (_currentConnection != null && _currentTransaction != null)
            {
                if (!DecreaseAndCheckCount() && !force)
                {
                    _wasRollBack = true;
                    return;
                }
                _currentTransaction.Rollback();
                _currentConnection.Close();
                _currentConnection = null;
                _currentTransaction = null;
            }
        }

        public static void ExecuteReader(ExecuteReaderHandler handler, string sql, params object[] parameters)
        {
            DoCommand((comm) => {
                using (IDataReader reader = comm.ExecuteReader())
                {
                    bool doMore = true;
                    while (doMore && reader.Read())
                    {
                        if (handler != null)
                            doMore = handler(reader);
                    }
                }
            }, sql, parameters);
        }

        public static object ExecuteScalar(string sql, params object[] parameters)
        {
            object result = null;
            DoCommand((comm) =>
            {
                result = comm.ExecuteScalar();
            }, sql, parameters);

            return result;
        }

        public static int Execute(string sql, params object[] parameters)
        {
            int result = 0;
            DoCommand((comm) =>
            {
                result = comm.ExecuteNonQuery();
            }, sql, parameters);

            return result;
        }

        public static bool DropTable(string tableName)
        {
            try
            {
                Execute(string.Format("DROP TABLE [{0}]", tableName));
            }
            catch (DbException)
            {
                return false;
            }

            return true;
        }

        public static void FillFromDataAdapter(DataTable table, string sql, params object[] parameters)
        {
            DoCommand((comm) =>
            {
                using (var sda = new SqlDataAdapter(comm))
                    sda.Fill(table);
            }, sql, parameters);
        }

        public static ConnectionStringSettings CurrentConnectionSettings
        {
            get
            {
                return ConfigurationManager.ConnectionStrings["Connection"];
            }
        }
    }
}
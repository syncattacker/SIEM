import win32evtlog  # Windows Event Log API
import win32evtlogutil
import sqlite3
import csv
import json
import re

# Define log categories to extract
LOG_CATEGORIES = {
    "Application": "Application",
    "System": "System",
    "Security": "Security",
    "Firewall": "Microsoft-Windows-Windows Firewall With Advanced Security/Firewall",
    "Network": "Microsoft-Windows-NetworkProfile/Operational",
    "Defender": "Microsoft-Windows-Windows Defender/Operational"
}

# Define a standard structure for all logs
LOG_HEADERS = [
    "EventID", "LogName", "SourceName", "TimeGenerated", "Category",
    "EventType", "User", "ComputerName", "Message",
    "ProcessID", "SessionID", "IPAddress", "AdditionalData"
]

def initialize_db():
    """Initialize the SQLite database and create tables for each log category."""
    conn = sqlite3.connect("database/logs.db")
    cursor = conn.cursor()
    for category in LOG_CATEGORIES.keys():
        table_name = category.replace("-", "_").replace("/", "_")
        cursor.execute(f'''
            CREATE TABLE IF NOT EXISTS {table_name} (
                EventID INTEGER,
                LogName TEXT,
                SourceName TEXT,
                TimeGenerated TEXT,
                Category TEXT,
                EventType TEXT,
                User TEXT,
                ComputerName TEXT,
                Message TEXT,
                ProcessID TEXT,
                SessionID TEXT,
                IPAddress TEXT,
                AdditionalData TEXT
            )
        ''')
    conn.commit()
    conn.close()

def extract_logs(log_type, max_events=100):
    """Extract logs from the specified Windows event log category."""
    logs = []
    try:
        hand = win32evtlog.OpenEventLog(None, log_type)
        flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
        
        while True:
            events = win32evtlog.ReadEventLog(hand, flags, 0)
            if not events:
                break
            
            for event in events[:max_events]:
                try:
                    evt_data = {
                        "EventID": event.EventID & 0x1FFFFFFF,
                        "LogName": log_type,
                        "SourceName": event.SourceName,
                        "TimeGenerated": event.TimeGenerated.Format(),
                        "Category": event.EventCategory,
                        "EventType": event.EventType,
                        "User": getattr(event, 'UserName', "N/A"),
                        "ComputerName": getattr(event, 'ComputerName', "N/A"),
                        "Message": win32evtlogutil.SafeFormatMessage(event, log_type),
                        "ProcessID": getattr(event, 'ProcessID', "N/A"),
                        "SessionID": getattr(event, 'SessionID', "N/A"),
                        "IPAddress": extract_ip_from_message(win32evtlogutil.SafeFormatMessage(event, log_type)),
                        "AdditionalData": json.dumps(extract_additional_data(event), default=str)
                    }
                    logs.append(evt_data)
                except Exception as e:
                    print(f"❌ Error processing event in {log_type}: {e}")
    except Exception as e:
        print(f"Error reading {log_type} logs: {e}")
    finally:
        win32evtlog.CloseEventLog(hand)
    return logs

def extract_ip_from_message(message):
    """Extract IP address if available in the log message."""
    ip_match = re.search(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', message)
    return ip_match.group() if ip_match else "N/A"

def extract_additional_data(event):
    """Extract additional event-specific attributes."""
    additional_fields = {}
    for attr in dir(event):
        if not attr.startswith('_') and attr not in LOG_HEADERS:
            additional_fields[attr] = getattr(event, attr, "N/A")
    return additional_fields if additional_fields else "N/A"

def save_logs_to_db(logs, table_name):
    """Save logs into the SQLite database under the appropriate table."""
    conn = sqlite3.connect("database/logs.db")
    cursor = conn.cursor()
    
    for log in logs:
        cursor.execute(f'''
            INSERT INTO {table_name} (
                EventID, LogName, SourceName, TimeGenerated, Category,
                EventType, User, ComputerName, Message,
                ProcessID, SessionID, IPAddress, AdditionalData
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', tuple(log.values()))
    
    conn.commit()
    conn.close()

def save_logs_to_csv(logs, filename="logs/Unified_Logs.csv"):
    """Save the extracted logs to a CSV file."""
    try:
        with open(filename, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=LOG_HEADERS)
            writer.writeheader()
            writer.writerows(logs)
        print(f"✅ Logs saved successfully to {filename}")
    except Exception as e:
        print(f"❌ Error saving logs to CSV: {e}")

def save_logs_to_json(logs, filename="logs/Unified_Logs.json"):
    """Save the extracted logs to a JSON file."""
    try:
        with open(filename, mode="w", encoding="utf-8") as file:
            json.dump(logs, file, indent=4, default=str)
        print(f"✅ Logs saved successfully to {filename}")
    except Exception as e:
        print(f"❌ Error saving logs to JSON: {e}")

if __name__ == "__main__":
    initialize_db()
    all_logs = []
    
    for category_name, event_log in LOG_CATEGORIES.items():
        print(f"🔍 Extracting logs from: {category_name}")
        logs = extract_logs(event_log)
        table_name = category_name.replace("-", "_").replace("/", "_")
        save_logs_to_db(logs, table_name)
        all_logs.extend(logs)
    
    save_logs_to_csv(all_logs)
    save_logs_to_json(all_logs)

import os
import csv
import win32evtlog  # Windows Event Log API
import win32evtlogutil
import sqlite3

# Database path
db_path = 'Logs.db'

# Ensure output directory for CSV logs exists
output_dir = "logs"
os.makedirs(output_dir, exist_ok=True)

# Log categories mapping
log_categories = {
    "Application": "Application",
    "System": "System",
    "Security": "Security",
    "Firewall": "Microsoft-Windows-Windows Firewall With Advanced Security/Firewall",
    "FirewallVerbose": "Microsoft-Windows-Windows Firewall With Advanced Security/FirewallVerbose",
    "Network": "Microsoft-Windows-NetworkProfile/Operational",
    "NetworkSecurity": "Microsoft-Windows-NetworkSecurity/Debug",
    "Defender": "Microsoft-Windows-Windows Defender/Operational"
}

# CSV file paths for all log categories
csv_files = {category: os.path.join(output_dir, f"{category}_logs.csv") for category in log_categories}

def create_table_if_not_exists(table_name):
    """Creates an SQLite table if it does not exist."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS "{table_name}" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            source_name TEXT,
            time_generated TEXT,
            category INTEGER,
            type INTEGER,
            message TEXT
        )
    ''')
    conn.commit()
    conn.close()

def insert_logs_to_db(logs, table_name):
    """Inserts extracted logs into the SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.executemany(f'''
        INSERT INTO "{table_name}" (event_id, source_name, time_generated, category, type, message)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', [
        (
            log['EventID'],
            log['SourceName'],
            log['TimeGenerated'],
            log['Category'],
            log['Type'],
            log['Message']
        ) for log in logs
    ])
    conn.commit()
    conn.close()

def save_logs_to_csv(logs, csv_path):
    """Saves extracted logs into a CSV file."""
    if not logs:
        return

    with open(csv_path, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["EventID", "SourceName", "TimeGenerated", "Category", "Type", "Message"])
        for log in logs:
            writer.writerow([
                log['EventID'],
                log['SourceName'],
                log['TimeGenerated'],
                log['Category'],
                log['Type'],
                log['Message']
            ])

    print(f"✅ Logs saved in {csv_path}")

def extract_logs(log_type, table_name, csv_path, max_events=100):
    """Extracts Windows Event Logs, saves them in the database, and writes to CSV."""
    logs = []
    try:
        hand = win32evtlog.OpenEventLog(None, log_type)
        flags = win32evtlog.EVENTLOG_BACKWARDS_READ | win32evtlog.EVENTLOG_SEQUENTIAL_READ
        
        total_events = win32evtlog.GetNumberOfEventLogRecords(hand)
        print(f"Extracting {log_type} logs... Total Events Found: {total_events}")

        while True:
            events = win32evtlog.ReadEventLog(hand, flags, 0)
            if not events:
                break

            for event in events[:max_events]:
                evt_data = {
                    "EventID": event.EventID & 0x1FFFFFFF,
                    "SourceName": event.SourceName,
                    "TimeGenerated": event.TimeGenerated.Format(),
                    "Category": event.EventCategory,
                    "Type": event.EventType,
                    "Message": win32evtlogutil.SafeFormatMessage(event, log_type)
                }
                logs.append(evt_data)

    except Exception as e:
        print(f"Error reading {log_type} logs: {e}")

    finally:
        win32evtlog.CloseEventLog(hand)

    if logs:
        insert_logs_to_db(logs, table_name)
        save_logs_to_csv(logs, csv_path)
        print(f"✅ Logs for {log_type} saved in Logs.db under '{table_name}' table.")

if __name__ == "__main__":
    for table_name, log_type in log_categories.items():
        create_table_if_not_exists(table_name)
        extract_logs(log_type, table_name, csv_files[table_name])

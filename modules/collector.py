import win32evtlog  # Windows Event Log API
import win32evtlogutil
import json
import re
import time
from categorizer import categorize_log  # Make sure you have a categorize_log function in your categorizer module
from correlation import initialize_db, enrich_and_store_logs  # Import the function from your second script

# Define log categories to extract
LOG_CATEGORIES = {
    "Application": "Application",
    "System": "System",
    "Security": "Security",
}

# Define log headers for structured log data
LOG_HEADERS = [
    "EventID", "LogName", "SourceName", "TimeGenerated", "Category",
    "EventType", "User", "ComputerName", "Message",
    "ProcessID", "SessionID", "IPAddress", "AdditionalData"
]

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

def monitor_logs():
    flags = win32evtlog.EVENTLOG_SEQUENTIAL_READ | win32evtlog.EVENTLOG_FORWARDS_READ
    handles = {}
    record_numbers = {log: 0 for log in LOG_CATEGORIES.values()}

    # Open event logs only if they exist
    for log_type, event_log in LOG_CATEGORIES.items():
        try:
            handles[log_type] = win32evtlog.OpenEventLog(None, event_log)
        except Exception as e:
            print(f"⚠️ Error opening {event_log}: {e}")
            handles[log_type] = None

    print("🚀 Real-time log collection started...")
    try:
        while True:
            for log_type, event_log in LOG_CATEGORIES.items():
                if handles[log_type] is None:  # Skip logs with no handle
                    continue

                events = win32evtlog.ReadEventLog(handles[log_type], flags, record_numbers[log_type])
                if not events:
                    continue

                categorized_logs = []  # Collect categorized logs

                for event in events:
                    try:
                        event_id = event.EventID & 0x1FFFFFFF
                        message = win32evtlogutil.SafeFormatMessage(event, event_log)
                        log_data = {
                            "EventID": event_id,
                            "LogName": event_log,
                            "SourceName": event.SourceName,
                            "TimeGenerated": event.TimeGenerated.Format(),
                            "Category": event.EventCategory,
                            "EventType": event.EventType,
                            "User": getattr(event, 'UserName', "N/A"),
                            "ComputerName": getattr(event, 'ComputerName', "N/A"),
                            "Message": message,
                            "ProcessID": getattr(event, 'ProcessID', "N/A"),
                            "SessionID": getattr(event, 'SessionID', "N/A"),
                            "IPAddress": extract_ip_from_message(message),
                            "AdditionalData": json.dumps(extract_additional_data(event), default=str),
                        }

                        # Pass the log data to categorize_log function
                        categorized = categorize_log(event_id, log_data)
                        categorized_logs.append(categorized)  # Add to the categorized logs list

                    except Exception as err:
                        print(f"⚠️ Error processing log in {event_log}: {err}")
                
                # Once all logs are processed, enrich and store them in the database
                if categorized_logs:
                    initialize_db()
                    enrich_and_store_logs(categorized_logs)  # Pass categorized logs to the database function

                record_numbers[log_type] += len(events)

            time.sleep(2)
    except KeyboardInterrupt:
        print("\n⛔ Stopped log monitoring.")
    finally:
        for handle in handles.values():
            if handle:
                win32evtlog.CloseEventLog(handle)

if __name__ == "__main__":
    monitor_logs()

import sqlite3
import json
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Directory where current script is
DATABASE_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "database"))
ENRICHED_DB_PATH = os.path.join(DATABASE_DIR, "enriched.db")
INCIDENT_DB_PATH = os.path.join(DATABASE_DIR, "incident.db")

# Criticality mappings
criticality_mapping = {
    "Authentication & Access Control": {"Asset": "High", "Alert": "High", "SLA": "Critical", "Data": "Restricted"},
    "Account & User Management": {"Asset": "Medium", "Alert": "Medium", "SLA": "High", "Data": "Internal"},
    "Logon & Logoff Events": {"Asset": "Low", "Alert": "Low", "SLA": "Low", "Data": "Internal"},
    "System Events": {"Asset": "High", "Alert": "High", "SLA": "Critical", "Data": "Restricted"},
    "Firewall & Network Security": {"Asset": "High", "Alert": "High", "SLA": "Critical", "Data": "Restricted"},
    "Cryptographic Operations": {"Asset": "High", "Alert": "High", "SLA": "Critical", "Data": "Restricted"},
    "Security & Threat Detection": {"Asset": "High", "Alert": "High", "SLA": "Critical", "Data": "Restricted"}
}

# Event IDs considered incidents
incident_event_ids = {"4625", "4672", "4696", "1100", "1101", "4902", "4907", "5058", "5382"}

def initialize_db():
    """Create the database and tables if they don't exist."""
    os.makedirs(DATABASE_DIR, exist_ok=True)

    print(f"Initializing databases at:\n → {ENRICHED_DB_PATH}\n → {INCIDENT_DB_PATH}")

    # Enriched DB
    conn_enriched = sqlite3.connect(ENRICHED_DB_PATH)
    conn_enriched.execute('''
        CREATE TABLE IF NOT EXISTS enriched_logs (
            EventID TEXT,
            Category TEXT,
            Subcategory TEXT,
            "Specific Category" TEXT,
            Log TEXT,
            Asset_Criticality TEXT,
            Alert_Criticality TEXT,
            SLA_Classification TEXT,
            Data_Classification TEXT
        )
    ''')
    conn_enriched.commit()
    conn_enriched.close()

    # Incident DB
    conn_incident = sqlite3.connect(INCIDENT_DB_PATH)
    conn_incident.execute('''
        CREATE TABLE IF NOT EXISTS incident_logs (
            EventID TEXT,
            Category TEXT,
            Subcategory TEXT,
            "Specific Category" TEXT,
            Log TEXT,
            Asset_Criticality TEXT,
            Alert_Criticality TEXT,
            SLA_Classification TEXT,
            Data_Classification TEXT,
            Incident INTEGER
        )
    ''')
    conn_incident.commit()
    conn_incident.close()

def enrich_and_store_logs(logs):
    """Enrich and store logs in appropriate databases."""
    print(f"Using enriched DB path: {ENRICHED_DB_PATH}")
    print(f"Using incident DB path: {INCIDENT_DB_PATH}")

    conn_enriched = sqlite3.connect(ENRICHED_DB_PATH)
    cursor_enriched = conn_enriched.cursor()

    conn_incident = sqlite3.connect(INCIDENT_DB_PATH)
    cursor_incident = conn_incident.cursor()

    for log in logs:
        category = log.get("Category", "Uncategorized")
        event_id = str(log.get("EventID", ""))
        crit = criticality_mapping.get(category, {"Asset": "Low", "Alert": "Low", "SLA": "Low", "Data": "Public"})

        cursor_enriched.execute('''
            INSERT INTO enriched_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            event_id,
            category,
            log.get("Subcategory"),
            log.get("Specific Category"),
            json.dumps(log.get("Log", {})),  # Safe fallback
            crit["Asset"],
            crit["Alert"],
            crit["SLA"],
            crit["Data"]
        ))

        if event_id in incident_event_ids:
            cursor_incident.execute('''
                INSERT INTO incident_logs VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                event_id,
                category,
                log.get("Subcategory"),
                log.get("Specific Category"),
                json.dumps(log.get("Log", {})),
                crit["Asset"],
                crit["Alert"],
                crit["SLA"],
                crit["Data"],
                1
            ))

    conn_enriched.commit()
    conn_incident.commit()
    conn_enriched.close()
    conn_incident.close()
    print("✅ Logs enriched and stored.")

# Optional standalone use
if __name__ == "__main__":
    with open("categorized_logs.json", "r") as file:
        categorized_logs = json.load(file)
    enrich_and_store_logs(categorized_logs)

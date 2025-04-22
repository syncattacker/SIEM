event_index = {
    "4624": ("Authentication & Access Control", "User Logon", "Successful Authentication"),
    "4625": ("Authentication & Access Control", "Failed Logon Attempt", "Authentication Failure"),
    "4797": ("Authentication & Access Control", "Credential Security", "Blank Password Enumeration"),
    "4648": ("Authentication & Access Control", "Explicit Credential Logon", "Explicit Credential Usage"),
    "4672": ("Authentication & Access Control", "Special Privilege Logon", "Privilege Assignment"),
    "4798": ("Account & User Management", "Account Enumeration", "Local Group Enumeration"),
    "4799": ("Account & User Management", "Account Enumeration", "Privileged Group Enumeration"),
    "4738": ("Account & User Management", "Account Management", "User Account Changes"),
    "4696": ("Account & User Management", "Process Token Assignment", "Token Assignment"),
    "4634": ("Logon & Logoff Events", "Logoff Event", "User Logoff"),
    "4647": ("Logon & Logoff Events", "User Logoff Initiation", "User-Initiated Logoff"),
    "4608": ("System Events", "System Startup", "Windows Initialization"),
    "4616": ("System Events", "System Time Modification", "Time Change"),
    "1100": ("System Events", "Event Logging Service", "Service Shutdown"),
    "1101": ("System Events", "Audit Events", "Transport Drop"),
    "4826": ("System Events", "System Boot", "Boot Configuration Changes"),
    "5024": ("Firewall & Network Security", "Firewall", "Firewall Service"),
    "5033": ("Firewall & Network Security", "Firewall", "Firewall Driver"),
    "4902": ("Firewall & Network Security", "Audit Policy", "Audit Policy Changes"),
    "4907": ("Firewall & Network Security", "Audit Policy", "Object Audit Settings Modified"),
    "5058": ("Cryptographic Operations", "Cryptographic Operations", "Key File Usage"),
    "5059": ("Cryptographic Operations", "Cryptographic Operations", "Key Migration"),
    "5061": ("Cryptographic Operations", "Cryptographic Operations", "Key Usage"),
    "5382": ("Security & Threat Detection", "Credential Access", "Windows Vault Access"),
    "5379": ("Security & Threat Detection", "Credential Access", "Credential Manager Read Access"),
    "6416": ("Security & Threat Detection", "Hardware Events", "USB Device Connection")
}


def categorize_log(event_id, log):
    event_id_str = str(event_id)
    if event_id_str in event_index:
        main_cat, sub_cat, spec_cat = event_index[event_id_str]
        return {
            "EventID": event_id_str,
            "Category": main_cat,
            "Subcategory": sub_cat,
            "Specific Category": spec_cat,
            "Log": log
        }
    else:
        return {
            "EventID": event_id_str,
            "Category": "Uncategorized",
            "Subcategory": None,
            "Specific Category": None,
            "Log": log
        }

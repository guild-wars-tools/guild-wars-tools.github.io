import requests
from bs4 import BeautifulSoup
import json

# The master list of IDs
ID_LIST_URL = "https://wiki.guildwars.com/wiki/Skill_template_format/Skill_list"

def scrape_names():
    print(f"Fetching ID list from {ID_LIST_URL}...")
    headers = {'User-Agent': 'GW1SimpleScraper/1.0'}
    
    try:
        r = requests.get(ID_LIST_URL, headers=headers)
        r.raise_for_status()
    except Exception as e:
        print(f"Error fetching wiki: {e}")
        return {}

    soup = BeautifulSoup(r.text, 'html.parser')
    skill_map = {}
    
    # The wiki page contains multiple tables side-by-side
    tables = soup.find_all('table')
    
    count = 0
    for table in tables:
        rows = table.find_all('tr')
        for row in rows:
            cols = row.find_all(['td', 'th'])
            # We need at least 2 columns: [ID] and [Name]
            if len(cols) >= 2:
                id_text = cols[0].get_text(strip=True)
                name_text = cols[1].get_text(strip=True)
                
                # Check if the first column is actually a number
                if id_text.isdigit():
                    # Save as "ID": "Name"
                    skill_map[id_text] = name_text
                    count += 1
                    
    print(f"Found {count} skills.")
    return skill_map

if __name__ == "__main__":
    db = scrape_names()
    
    with open("skills.json", "w", encoding="utf-8") as f:
        # sort_keys=True ensures the IDs are listed in order (0, 1, 2...)
        json.dump(db, f, indent=2, sort_keys=True)
        
    print("Success! 'skills.json' created with format: {\"id\": \"Skill Name\"}")
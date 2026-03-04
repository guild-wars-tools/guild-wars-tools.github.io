import json

def generate_equipment_db():
    runes_db = {
        "None": {
            "Vitae": "+10 Health", 
            "Attunement": "+2 Energy", 
            "Clarity": "-20% Blind/Weakness duration", 
            "Purity": "-20% Disease/Poison duration", 
            "Recovery": "-20% Daze/Deep Wound duration", 
            "Restoration": "-20% Bleeding/Cripple duration"
        },
        "Warrior": {"Strength": "Attr +1/2/3", "Axe Mastery": "Attr +1/2/3", "Swordsmanship": "Attr +1/2/3", "Hammer Mastery": "Attr +1/2/3", "Tactics": "Attr +1/2/3", "Absorption": "Reduces physical damage by 1/2/3"},
        "Ranger": {"Expertise": "Attr +1/2/3", "Beast Mastery": "Attr +1/2/3", "Marksmanship": "Attr +1/2/3", "Wilderness Survival": "Attr +1/2/3"},
        "Monk": {"Divine Favor": "Attr +1/2/3", "Healing Prayers": "Attr +1/2/3", "Protection Prayers": "Attr +1/2/3", "Smiting Prayers": "Attr +1/2/3"},
        "Necromancer": {"Soul Reaping": "Attr +1/2/3", "Blood Magic": "Attr +1/2/3", "Curses": "Attr +1/2/3", "Death Magic": "Attr +1/2/3"},
        "Mesmer": {"Fast Casting": "Attr +1/2/3", "Domination Magic": "Attr +1/2/3", "Illusion Magic": "Attr +1/2/3", "Inspiration Magic": "Attr +1/2/3"},
        "Elementalist": {"Energy Storage": "Attr +1/2/3", "Air Magic": "Attr +1/2/3", "Earth Magic": "Attr +1/2/3", "Fire Magic": "Attr +1/2/3", "Water Magic": "Attr +1/2/3"},
        "Assassin": {"Critical Strikes": "Attr +1/2/3", "Dagger Mastery": "Attr +1/2/3", "Deadly Arts": "Attr +1/2/3", "Shadow Arts": "Attr +1/2/3"},
        "Ritualist": {"Spawning Power": "Attr +1/2/3", "Channeling Magic": "Attr +1/2/3", "Communing": "Attr +1/2/3", "Restoration Magic": "Attr +1/2/3"},
        "Paragon": {"Leadership": "Attr +1/2/3", "Command": "Attr +1/2/3", "Motivation": "Attr +1/2/3", "Spear Mastery": "Attr +1/2/3"},
        "Dervish": {"Mysticism": "Attr +1/2/3", "Earth Prayers": "Attr +1/2/3", "Scythe Mastery": "Attr +1/2/3", "Wind Prayers": "Attr +1/2/3"}
    }

    insignias_db = {
        "None": {"Blessed": "+10 armor while enchanted", "Radiant": "+3/2/1 Energy", "Survivor": "+15/10/5 Health", "Stalwart": "+10 armor vs physical", "Brawler's": "+10 armor while attacking", "Herald's": "+10 armor while holding an item", "Sentry's": "+10 armor in stance"},
        "Warrior": {"Knight's": "-3 phys dmg taken", "Lieutenant's": "-20% Hex duration, -5% dmg dealt, -20 Armor", "Sentinel's": "+20 armor vs elemental (Req 13 Str)", "Dreadnought": "+10 armor vs elemental", "Stonefist": "+1 sec knockdown"},
        "Ranger": {"Beastmaster's": "+10 armor if pet alive", "Scout's": "+10 armor while using a Preparation", "Earthbound": "+15 armor vs earth", "Pyrebound": "+15 armor vs fire", "Frostbound": "+15 armor vs cold", "Stormbound": "+15 armor vs lightning"},
        "Monk": {"Wanderer's": "+10 armor vs elemental", "Disciple's": "+15 armor while affected by a Condition", "Anchorite's": "+5 armor while recharging 1/3/5+ skills"},
        "Necromancer": {"Bloodstained": "-25% corpse spell cast time", "Tormentor's": "+10 armor, +6/4/2 Holy dmg received", "Bonelace": "+15 armor vs piercing", "Minion Master's": "+5 armor while you control 1/3/5+ minions", "Blighter's": "+20 armor while hexed", "Undertaker's": "+5 armor while Health is below 80/60/40/20%"},
        "Mesmer": {"Virtuoso's": "+15 armor while activating skills", "Artificer's": "+3 armor for each equipped Signet", "Prodigy's": "+5 armor while recharging 1/3/5+ skills"},
        "Elementalist": {"Hydromancer": "+10 armor vs elemental/cold", "Geomancer": "+10 armor vs elemental/earth", "Pyromancer": "+10 armor vs elemental/fire", "Aeromancer": "+10 armor vs elemental/lightning", "Prismatic": "+5 armor per Ele attr at 9+"},
        "Assassin": {"Vanguard's": "+10 armor vs physical/blunt", "Infiltrator's": "+10 armor vs physical/piercing", "Saboteur's": "+10 armor vs physical/slashing", "Nightstalker's": "+15 armor while attacking"},
        "Ritualist": {"Ghost Forge": "+15 armor while affected by Weapon Spell", "Mystic's": "+15 armor while activating skills", "Shaman's": "+5 armor while you control 1/2/3+ Spirits"},
        "Paragon": {"Centurion's": "+10 armor while affected by Shout, Echo, or Chant"},
        "Dervish": {"Forsaken": "+10 armor while not Enchanted", "Windwalker": "+5 armor while affected by 1/2/3/4+ Enchantments"}
    }

    caster_attributes = ["Divine Favor", "Healing Prayers", "Protection Prayers", "Smiting Prayers", "Soul Reaping", "Blood Magic", "Curses", "Death Magic", "Fast Casting", "Domination Magic", "Illusion Magic", "Inspiration Magic", "Energy Storage", "Air Magic", "Earth Magic", "Fire Magic", "Water Magic", "Spawning Power", "Channeling Magic", "Communing", "Restoration Magic"]
    prof_suffixes = ["of the Warrior", "of the Ranger", "of the Monk", "of the Necromancer", "of the Mesmer", "of the Elementalist", "of the Assassin", "of the Ritualist", "of the Paragon", "of the Dervish"]

    martial_1h_prefixes = ["Vampiric (Lifesteal 3, Regen -1)", "Zealous (Energy 1, Regen -1)", "Sundering (Armor pen 20%)", "Shocking (Lightning dmg)", "Fiery (Fire dmg)", "Icy (Cold dmg)", "Crippling (Cripple +33%)", "Poisonous (Poison +33%)", "Furious (Double adrenaline 10%)", "Ebon (Earth dmg)", "Silencing (Daze +33%)", "Barbed (Bleeding +33%)", "Cruel (Deep Wound +33%)", "Heavy (Weakness +33%)"]
    martial_2h_prefixes = ["Vampiric (Lifesteal 5, Regen -1)", "Zealous (Energy 1, Regen -1)", "Sundering (Armor pen 20%)", "Shocking (Lightning dmg)", "Fiery (Fire dmg)", "Icy (Cold dmg)", "Crippling (Cripple +33%)", "Poisonous (Poison +33%)", "Furious (Double adrenaline 10%)", "Ebon (Earth dmg)", "Silencing (Daze +33%)", "Barbed (Bleeding +33%)", "Cruel (Deep Wound +33%)", "Heavy (Weakness +33%)"]
    martial_suffixes = ["of Fortitude (+30 Health)", "of Defense (+5 Armor)", "of Warding (+7 Armor vs Elemental)", "of Shelter (+7 Armor vs Physical)", "of Enchanting (Enchants +20%)"] + prof_suffixes
    martial_inscriptions = ["Strength and Honor (+15% dmg if Health > 50%)", "Guided by Fate (+15% dmg while Enchanted)", "Dance with Death (+15% dmg while in Stance)", "To the Pain! (+15% dmg, -10 Armor)", "Brawn over Brains (+15% dmg, -5 Energy)", "Too Much Information (+15% dmg vs Hexed)", "Vengeance is Mine (+20% dmg if Health < 50%)", "Don't Fear the Reaper (+20% dmg while Hexed)", "I Have the Power! (+5 Energy)"]

    caster_inscriptions = ["Aptitude not Attitude (20% cast time for item's attr spells)", "Don't Think Twice (10% cast time for any spell)", "Seize the Day (+15 Energy, -1 Regen)", "Hale and Hearty (+5 Energy if Health > 50%)", "Have Faith (+5 Energy while Enchanted)", "Don't call it a comeback! (+7 Energy if Health < 50%)", "I am Sorrow (+7 Energy while Hexed)"]

    focus_shield_shared_inscriptions = ["Luck of the Draw (-5 phys dmg 20%)", "Sheltered by Faith (-2 phys dmg while Enchanted)", "Nothing to Fear (-3 phys dmg while Hexed)", "Run For Your Life! (-2 phys dmg while in Stance)", "Master of My Domain! (Attr +1 20%)", "Not the Face! (+10 Armor vs Blunt)", "Leaf on the Wind (+10 Armor vs Cold)", "Like a Rolling Stone (+10 Armor vs Earth)", "Riders on the Storm (+10 Armor vs Lightning)", "Sleep Now in the Fire (+10 Armor vs Fire)", "Through Thick and Thin (+10 Armor vs Piercing)", "The Riddle of Steel (+10 Armor vs Slashing)", "Fear Cuts Deeper (-20% Bleeding)", "I Can See Clearly Now (-20% Blind)", "Swift as the Wind (-20% Cripple)", "Strength of Body (-20% Deep Wound)", "Cast Out the Unclean (-20% Disease)", "Pure of Heart (-20% Poison)", "Soundness of Mind (-20% Daze)", "Only the Strong Survive (-20% Weakness)"]

    weapons_db = {
        "categories": {
            "Martial_1H": ["Martial Weapon", "Axe", "Sword", "Spear", "Daggers"],
            "Martial_2H": ["Hammer", "Scythe", "Longbow", "Shortbow", "Flatbow", "Hornbow", "Recurve Bow"],
            "Staff": ["Staff"],
            "Wand": ["Wand"],
            "Focus": ["Focus"],
            "Shield": ["Shield"]
        },
        "attributes": {
            "Martial Weapon": [], "Axe": ["Axe Mastery"], "Sword": ["Swordsmanship"], "Spear": ["Spear Mastery"], "Daggers": ["Dagger Mastery"],
            "Hammer": ["Hammer Mastery"], "Scythe": ["Scythe Mastery"], "Longbow": ["Marksmanship"], "Shortbow": ["Marksmanship"], "Flatbow": ["Marksmanship"], "Hornbow": ["Marksmanship"], "Recurve Bow": ["Marksmanship"],
            "Staff": caster_attributes,
            "Wand": caster_attributes,
            "Focus": caster_attributes,
            "Shield": ["Strength", "Tactics", "Command", "Motivation", "Leadership"]
        },
        "upgrades": {
            "Martial_1H": {
                "prefixes": martial_1h_prefixes, "suffixes": martial_suffixes, "inscriptions": martial_inscriptions
            },
            "Martial_2H": {
                "prefixes": martial_2h_prefixes, "suffixes": martial_suffixes, "inscriptions": martial_inscriptions
            },
            "Staff": {
                "prefixes": ["Hale (+30 Health)", "Insightful (+5 Energy)", "Adept (20% Cast speed)", "Swift (10% Cast speed)", "Defensive (+5 Armor)"],
                "suffixes": ["of Fortitude (+30 Health)", "of Defense (+5 Armor)", "of Warding (+7 Armor vs Elemental)", "of Shelter (+7 Armor vs Physical)", "of Enchanting (Enchants +20%)", "of Devotion (+45 Health while Enchanted)", "of Endurance (+45 Health while in Stance)", "of Valor (+60 Health while Hexed)", "of Quickening (10% recharge for any spell)", "of Memory (20% recharge for item's attr spells)", "of Mastery (20% chance +1 attr)"] + prof_suffixes,
                "inscriptions": caster_inscriptions + ["Fear Cuts Deeper (-20% Bleeding)", "I Can See Clearly Now (-20% Blind)", "Swift as the Wind (-20% Cripple)", "Strength of Body (-20% Deep Wound)", "Cast Out the Unclean (-20% Disease)", "Pure of Heart (-20% Poison)", "Only the Strong Survive (-20% Weakness)"]
            },
            "Wand": {
                "prefixes": [],
                "suffixes": ["of Fortitude (+30 Health)", "of Memory (20% recharge for item's attr spells)"] + prof_suffixes,
                "inscriptions": caster_inscriptions
            },
            "Focus": {
                "prefixes": [],
                "suffixes": ["of Fortitude (+30 Health)", "of Devotion (+45 Health while Enchanted)", "of Endurance (+45 Health while in Stance)", "of Valor (+60 Health while Hexed)", "of Swiftness (10% cast time for any spell)", "of Aptitude (20% cast time for item's attr spells)"],
                "inscriptions": ["Forget Me Not (20% recharge for item's attr spells)", "Serenity Now (10% recharge for any spell)", "Live for Today (+15 Energy, -1 Regen)", "Faith is My Shield (+5 Armor while Enchanted)", "Ignorance is Bliss (+5 Armor, -5 Energy)", "Life is Pain (+5 Armor, -20 Health)", "Man for All Seasons (+5 Armor vs Elemental)", "Survival of the Fittest (+5 Armor vs Physical)", "Might Makes Right (+5 Armor attacking)", "Knowing is Half the Battle (+5 Armor casting)", "Down But Not Out (+10 Armor if Health < 50%)", "Hail to the King (+5 Armor if Health > 50%)", "Be Just and Fear Not (+10 Armor Hexed)"] + focus_shield_shared_inscriptions
            },
            "Shield": {
                "prefixes": [],
                "suffixes": ["of Fortitude (+30 Health)", "of Devotion (+45 Health while Enchanted)", "of Endurance (+45 Health while in Stance)", "of Valor (+60 Health while Hexed)"],
                "inscriptions": focus_shield_shared_inscriptions
            }
        }
    }

    expanded_runes = {"None": [
        {"name": "Rune of Vigor (minor, major, or superior)", "url": "https://wiki.guildwars.com/wiki/Rune_of_Vigor"},
        {"name": "Rune of Minor Vigor (+30 Health)", "url": "https://wiki.guildwars.com/wiki/Rune_of_Minor_Vigor"},
        {"name": "Rune of Major Vigor (+41 Health)", "url": "https://wiki.guildwars.com/wiki/Rune_of_Major_Vigor"},
        {"name": "Rune of Superior Vigor (+50 Health)", "url": "https://wiki.guildwars.com/wiki/Rune_of_Superior_Vigor"}
    ]}
    
    for r, desc in runes_db["None"].items():
        expanded_runes["None"].append({"name": f"Rune of {r} ({desc})", "url": f"https://wiki.guildwars.com/wiki/Rune_of_{r.replace(' ', '_')}"})
        
    for prof, attrs in runes_db.items():
        if prof == "None": continue
        expanded_runes[prof] = []
        for attr, desc in attrs.items():
            if "+1/2/3" in desc:
                for i, tier in enumerate(["Minor", "Major", "Superior"]):
                    bonus = desc.replace("+1/2/3", f"+{i+1}")
                    if tier == "Major": bonus += ", -35 Health"
                    if tier == "Superior": bonus += ", -75 Health"
                    name = f"Rune of {tier} {attr} ({bonus})"
                    url_name = f"Rune of {tier} {attr}"
                    expanded_runes[prof].append({"name": name, "url": f"https://wiki.guildwars.com/wiki/{url_name.replace(' ', '_')}"})
            elif "1/2/3" in desc:
                for i, tier in enumerate(["Minor", "Major", "Superior"]):
                    bonus = desc.replace("1/2/3", f"{i+1}")
                    name = f"Rune of {tier} {attr} ({bonus})"
                    url_name = f"Rune of {tier} {attr}"
                    expanded_runes[prof].append({"name": name, "url": f"https://wiki.guildwars.com/wiki/{url_name.replace(' ', '_')}"})
            else:
                name = f"Rune of {attr} ({desc})"
                url_name = f"Rune of {attr}"
                expanded_runes[prof].append({"name": name, "url": f"https://wiki.guildwars.com/wiki/{url_name.replace(' ', '_')}"})

    expanded_insignias = {p: [{"name": f"{b} Insignia ({d})", "url": f"https://wiki.guildwars.com/wiki/{b.replace(' ', '_')}_Insignia"} for b, d in v.items()] for p, v in insignias_db.items()}

    with open("equipment.json", "w", encoding="utf-8") as f:
        json.dump({"runes": expanded_runes, "insignias": expanded_insignias, "weapons": weapons_db}, f, indent=2)
    print("Success! 'equipment.json' created.")

if __name__ == "__main__":
    generate_equipment_db()
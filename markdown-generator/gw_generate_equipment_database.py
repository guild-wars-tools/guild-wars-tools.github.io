import json

def generate_equipment_db():
    runes_db = {
        "None": {"Vigor": "+30/40/50 Health", "Vitae": "+10 Health", "Attunement": "+2 Energy", "Clarity": "-20% condition duration", "Recovery": "-20% condition duration"},
        "Warrior": {"Strength": "Attr +1/2/3", "Axe Mastery": "Attr +1/2/3", "Swordsmanship": "Attr +1/2/3", "Hammer Mastery": "Attr +1/2/3", "Tactics": "Attr +1/2/3", "Absorption": "-3 physical damage taken"},
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
        "None": {"Blessed": "+10 armor while enchanted", "Radiant": "+15/10/5 Energy", "Survivor": "+15/10/5 Health", "Stalwart": "+10 armor vs physical", "Brawler's": "+10 armor while attacking", "Herald's": "+10 armor while holding an item", "Sentry's": "+10 armor in stance"},
        "Warrior": {"Knight's": "-3 phys dmg taken", "Lieutenant's": "-2 dmg taken while attacking", "Sentinel's": "+20 armor vs elemental", "Dreadnought": "+10 armor vs elemental", "Stonefist": "+1 sec knockdown"},
        "Ranger": {"Beastmaster's": "+10 armor if pet alive", "Scout's": "+10 armor vs elemental", "Trapper's": "+10 armor in stance", "Earthbound": "+10 armor vs earth", "Pyrebound": "+10 armor vs fire", "Frostbound": "+10 armor vs cold", "Stormbound": "+10 armor vs lightning"},
        "Monk": {"Acolyte's": "+10 max Energy", "Anchorite's": "+10 armor vs physical", "Disciple's": "+10 armor vs elemental"},
        "Necromancer": {"Bloodstained": "-25% corpse spell cast time", "Bonelace": "+15 armor vs piercing", "Ghostly": "-3 phys dmg taken", "Undead": "+10 armor vs elemental", "Blighter's": "+20 armor while hexed", "Minion Master's": "+5 armor per 1-5 minions", "Undertaker's": "+5 armor while health < 80%"},
        "Mesmer": {"Artificer's": "+10 armor vs physical", "Illusionist's": "+10 armor vs elemental", "Prodigy's": "-3 phys dmg taken", "Virtuoso's": "+10 max Energy"},
        "Elementalist": {"Aeromancer's": "+10 armor vs earth/cold", "Geomancer's": "+10 armor vs lightning/fire", "Hydromancer's": "+10 armor vs fire/lightning", "Pyromancer's": "+10 armor vs cold/earth", "Prismatic": "+10 armor vs elemental"},
        "Assassin": {"Infiltrator's": "+10 armor vs physical", "Saboteur's": "+10 armor vs elemental", "Vanguard's": "-3 phys dmg taken", "Nightstalker's": "+15 armor while attacking"},
        "Ritualist": {"Ghost Forge": "+10 armor vs physical", "Shaman's": "+10 armor vs elemental", "Spiritwalker's": "-3 phys dmg taken", "Mystic's": "+10 max Energy"},
        "Paragon": {"Centurion's": "+10 armor vs physical", "Legionnaire's": "+10 armor vs elemental"},
        "Dervish": {"Forsaken": "+10 armor vs physical", "Primeval": "+10 armor vs elemental", "Wanderer's": "-3 phys dmg taken", "Windwalker": "+15 armor while moving"}
    }

    caster_attributes = ["Divine Favor", "Healing Prayers", "Protection Prayers", "Smiting Prayers", "Soul Reaping", "Blood Magic", "Curses", "Death Magic", "Fast Casting", "Domination Magic", "Illusion Magic", "Inspiration Magic", "Energy Storage", "Air Magic", "Earth Magic", "Fire Magic", "Water Magic", "Spawning Power", "Channeling Magic", "Communing", "Restoration Magic"]
    prof_suffixes = ["of the Warrior", "of the Ranger", "of the Monk", "of the Necromancer", "of the Mesmer", "of the Elementalist", "of the Assassin", "of the Ritualist", "of the Paragon", "of the Dervish"]

    weapons_db = {
        "categories": {
            "Martial_1H": ["Axe", "Sword", "Spear", "Daggers", "Longbow", "Shortbow", "Flatbow", "Hornbow", "Recurve Bow"],
            "Martial_2H": ["Hammer", "Scythe"],
            "Staff": ["Staff"],
            "Wand": ["Wand"],
            "Focus": ["Focus"],
            "Shield": ["Shield"]
        },
        "attributes": {
            "Axe": ["Axe Mastery"], "Sword": ["Swordsmanship"], "Spear": ["Spear Mastery"], "Daggers": ["Dagger Mastery"],
            "Longbow": ["Marksmanship"], "Shortbow": ["Marksmanship"], "Flatbow": ["Marksmanship"], "Hornbow": ["Marksmanship"], "Recurve Bow": ["Marksmanship"],
            "Hammer": ["Hammer Mastery"], "Scythe": ["Scythe Mastery"],
            "Staff": caster_attributes,
            "Wand": caster_attributes,
            "Focus": caster_attributes,
            "Shield": ["Strength", "Tactics", "Command", "Motivation", "Leadership"]
        },
        "upgrades": {
            "Martial_1H": {
                "prefixes": ["Vampiric (Lifesteal 3, Regen -1)", "Zealous (Energy 1, Regen -1)", "Sundering (Armor pen 20%)", "Shocking (Lightning dmg)", "Fiery (Fire dmg)", "Icy (Cold dmg)", "Crippling (Cripple +33%)", "Poisonous (Poison +33%)", "Furious (Double adrenaline 10%)", "Ebon (Earth dmg)", "Silencing (Daze +33%)", "Barbed (Bleeding +33%)", "Cruel (Deep Wound +33%)", "Heavy (Weakness +33%)"],
                "suffixes": ["of Fortitude (+30 Health)", "of Defense (+5 Armor)", "of Warding (+16 Armor vs Elemental)", "of Shelter (+16 Armor vs Physical)", "of Enchanting (Enchants +20%)"] + prof_suffixes,
                "inscriptions": ["Strength and Honor (+15% dmg if Health > 50%)", "Guided by Fate (+15% dmg if Enchanted)", "Brawn over Brains (+15% dmg, -5 Energy)", "Too Much Information (+15% dmg vs Hexed)", "Vengeance is Mine (+20% dmg if Health < 50%)", "I Have the Power! (+5 Energy)"]
            },
            "Martial_2H": {
                "prefixes": ["Vampiric (Lifesteal 5, Regen -1)", "Zealous (Energy 1, Regen -1)", "Sundering (Armor pen 20%)", "Shocking (Lightning dmg)", "Fiery (Fire dmg)", "Icy (Cold dmg)", "Crippling (Cripple +33%)", "Poisonous (Poison +33%)", "Furious (Double adrenaline 10%)", "Ebon (Earth dmg)", "Silencing (Daze +33%)", "Barbed (Bleeding +33%)", "Cruel (Deep Wound +33%)", "Heavy (Weakness +33%)"],
                "suffixes": ["of Fortitude (+30 Health)", "of Defense (+5 Armor)", "of Warding (+16 Armor vs Elemental)", "of Shelter (+16 Armor vs Physical)", "of Enchanting (Enchants +20%)"] + prof_suffixes,
                "inscriptions": ["Strength and Honor (+15% dmg if Health > 50%)", "Guided by Fate (+15% dmg if Enchanted)", "Brawn over Brains (+15% dmg, -5 Energy)", "Too Much Information (+15% dmg vs Hexed)", "Vengeance is Mine (+20% dmg if Health < 50%)", "I Have the Power! (+5 Energy)"]
            },
            "Staff": {
                "prefixes": ["Hale (+30 Health)", "Insightful (+5 Energy)", "Adept (+20% Cast speed)", "Swift (+10% Cast speed)", "Defensive (+5 Armor)"],
                "suffixes": ["of Fortitude (+30 Health)", "of Defense (+5 Armor)", "of Enchanting (Enchants +20%)", "of Memory (20% recharge)", "of Quickening (20% cast time)", "of Mastery (20% chance +1 attr)"] + prof_suffixes,
                "inscriptions": ["Forget Me Not (20% energy refund)", "Seize the Day (+15 Energy, -1 Regen)", "Have Faith (+5 Energy while Enchanted)", "Serenity Now (+5 Energy while Hexed)", "Aptitude not Attitude (20% cast time)", "Hale and Hearty (+30 Health)"]
            },
            "Wand": {
                "prefixes": ["Hale (+30 Health)", "Insightful (+5 Energy)", "Adept (+20% Cast speed)", "Swift (+10% Cast speed)", "Defensive (+5 Armor)"],
                "suffixes": ["of Fortitude (+30 Health)", "of Defense (+5 Armor)", "of Enchanting (Enchants +20%)", "of Memory (20% recharge)", "of Quickening (20% cast time)", "of Mastery (20% chance +1 attr)"] + prof_suffixes,
                "inscriptions": ["Forget Me Not (20% energy refund)", "Seize the Day (+15 Energy, -1 Regen)", "Have Faith (+5 Energy while Enchanted)", "Serenity Now (+5 Energy while Hexed)", "Aptitude not Attitude (20% cast time)", "Hale and Hearty (+30 Health)"]
            },
            "Focus": {
                "prefixes": ["Hale (+30 Health)", "Insightful (+5 Energy)", "Adept (+20% Cast speed)", "Swift (+10% Cast speed)", "Defensive (+5 Armor)"],
                "suffixes": ["of Devotion (+45 Health)", "of Fortitude (+30 Health)", "of Aptitude (20% cast time)", "of Enchanting (Enchants +20%)", "of Memory (20% recharge)"] + prof_suffixes,
                "inscriptions": ["Live for Today (+15 Energy, -1 Regen)", "Luck of the Draw (-20% conditions)", "Survival of the Fittest (+5 Armor vs Physical)", "Might Makes Right (+5 Armor attacking)", "Knowing is Half the Battle (+5 Armor casting)", "Down But Not Out (+10 Armor if Health < 50%)", "Hail to the King (+5 Armor if Health > 50%)", "Be Just and Fear Not (+10 Armor Hexed)"]
            },
            "Shield": {
                "prefixes": [],
                "suffixes": ["of Devotion (+45 Health)", "of Fortitude (+30 Health)", "of Valor (+50 Health, -1 Regen)", "of Warding (+16 Armor vs Elemental)", "of Shelter (+16 Armor vs Physical)"] + prof_suffixes,
                "inscriptions": ["Luck of the Draw (-20% conditions)", "Survival of the Fittest (+5 Armor vs Physical)", "Might Makes Right (+5 Armor attacking)", "Knowing is Half the Battle (+5 Armor casting)", "Down But Not Out (+10 Armor if Health < 50%)", "Hail to the King (+5 Armor if Health > 50%)", "Be Just and Fear Not (+10 Armor Hexed)", "Cast Out the Unclean (-20% Disease)", "Pure of Heart (-20% Poison)", "Run for Your Life! (+10 Armor running)"]
            }
        }
    }

    expanded_runes = {"None": []}
    for r, desc in runes_db["None"].items():
        if "/" in desc:
            vals = desc.replace("Health", "").replace("+", "").split("/")
            expanded_runes["None"].extend([
                {"name": f"Rune of Minor {r} (+{vals[0].strip()} Health)", "url": f"https://wiki.guildwars.com/wiki/Rune_of_Minor_{r.replace(' ', '_')}"},
                {"name": f"Rune of Major {r} (+{vals[1].strip()} Health)", "url": f"https://wiki.guildwars.com/wiki/Rune_of_Major_{r.replace(' ', '_')}"},
                {"name": f"Rune of Superior {r} (+{vals[2].strip()} Health)", "url": f"https://wiki.guildwars.com/wiki/Rune_of_Superior_{r.replace(' ', '_')}"}
            ])
        else:
            expanded_runes["None"].append({"name": f"Rune of {r} ({desc})", "url": f"https://wiki.guildwars.com/wiki/Rune_of_{r.replace(' ', '_')}"})
        
    for prof, attrs in runes_db.items():
        if prof == "None": continue
        expanded_runes[prof] = []
        for attr, desc in attrs.items():
            if "+1/2/3" in desc:
                for i, tier in enumerate(["Minor", "Major", "Superior"]):
                    bonus = desc.replace("+1/2/3", f"+{i+1}")
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
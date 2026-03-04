class GW1TemplateDecoder {
    constructor(code, skillDb) {
        if (!code || typeof code !== 'string') {
            throw new Error("No template code provided.");
        }

        this.code = code;
        this.skillDb = skillDb || {};
        this.bitStream = [];
        this.cursor = 0;
        
        this.PROFESSIONS = {
            0: "None", 1: "Warrior", 2: "Ranger", 3: "Monk", 4: "Necromancer",
            5: "Mesmer", 6: "Elementalist", 7: "Assassin", 8: "Ritualist",
            9: "Paragon", 10: "Dervish"
        };

        this.ATTRIBUTES = {
            0: "Fast Casting", 1: "Illusion Magic", 2: "Domination Magic",
            3: "Inspiration Magic", 4: "Blood Magic", 5: "Death Magic",
            6: "Soul Reaping", 7: "Curses", 8: "Air Magic", 9: "Earth Magic",
            10: "Fire Magic", 11: "Water Magic", 12: "Energy Storage",
            13: "Healing Prayers", 14: "Smiting Prayers", 15: "Protection Prayers",
            16: "Divine Favor", 17: "Strength", 18: "Axe Mastery",
            19: "Hammer Mastery", 20: "Swordsmanship", 21: "Tactics",
            22: "Beast Mastery", 23: "Expertise", 24: "Wilderness Survival",
            25: "Marksmanship", 29: "Dagger Mastery", 30: "Deadly Arts",
            31: "Shadow Arts", 32: "Communing", 33: "Restoration Magic",
            34: "Channeling Magic", 35: "Critical Strikes", 36: "Spawning Power",
            37: "Spear Mastery", 38: "Command", 39: "Motivation",
            40: "Leadership", 41: "Scythe Mastery", 42: "Wind Prayers",
            43: "Earth Prayers", 44: "Mysticism"
        };
    }

    _decodeBase64ToBits() {
        this.bitStream = [];
        this.cursor = 0;
        const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for (let char of this.code) {
            let val = BASE64_MAP.indexOf(char);
            if (val === -1) continue;
            for (let i = 0; i < 6; i++) {
                this.bitStream.push((val >> i) & 1);
            }
        }
    }

    read(numBits) {
        if (this.cursor + numBits > this.bitStream.length) return 0;
        let value = 0;
        for (let i = 0; i < numBits; i++) {
            let bit = this.bitStream[this.cursor];
            value |= (bit << i);
            this.cursor++;
        }
        return value;
    }

    parse() {
        this._decodeBase64ToBits();
        if (this.bitStream.length < 8) {
            throw new Error("Template code is too short or contains invalid characters.");
        }

        let data = {
            profession: {},
            attributes: [],
            skills: []
        };
        
        let header = this.read(4); 
        if (header !== 14) {
            throw new Error("Not a valid Guild Wars 1 skill template code.");
        }
        
        this.read(4); 

        let profBitLen = (this.read(2) * 2) + 4;
        let primId = this.read(profBitLen);
        let secId = this.read(profBitLen);
        
        data.profession.primary = this.PROFESSIONS[primId] || "Unknown";
        data.profession.secondary = this.PROFESSIONS[secId] || "Unknown";

        let countAttrs = this.read(4);
        let attrBitLen = this.read(4) + 4;
        
        for (let i = 0; i < countAttrs; i++) {
            let attrId = this.read(attrBitLen);
            let points = this.read(4);
            data.attributes.push({
                attribute: this.ATTRIBUTES[attrId] || `Unknown Attribute ${attrId}`,
                points: points
            });
        }

        let skillBitLen = this.read(4) + 8;
        for (let i = 0; i < 8; i++) {
            let skillId = this.read(skillBitLen);
            let skillName = this.skillDb[skillId] || `Unknown Skill ID: ${skillId}`;
            data.skills.push(skillName);
        }

        return data;
    }

    // Scaffolding for Equipment decoding
    parseEquipment() {
        this._decodeBase64ToBits();
        if (this.bitStream.length < 8) return null;

        let header = this.read(4);
        if (header !== 15) throw new Error("Not a valid Equipment template code.");
        
        let version = this.read(4);
        let idBits = this.read(4);
        let modBits = this.read(4);
        let itemCount = this.read(3);
        
        let equipmentRaw = {};
        const SLOTS = {0: "Weapon", 1: "Offhand", 2: "Chest", 3: "Legs", 4: "Head", 5: "Feet", 6: "Hands"};
        
        for (let i = 0; i < itemCount; i++) {
            let slotId = this.read(3);
            let itemId = this.read(idBits);
            let modCount = this.read(2);
            let dye = this.read(4);
            
            let mods = [];
            for (let m = 0; m < modCount; m++) {
                mods.push(this.read(modBits));
            }
            
            equipmentRaw[SLOTS[slotId] || `UnknownSlot_${slotId}`] = {
                itemId: itemId,
                modifierIds: mods,
                dye: dye
            };
        }
        
        console.log("Decoded Equipment IDs (Requires ID mapping DB to load into UI):", equipmentRaw);
        return equipmentRaw;
    }
}
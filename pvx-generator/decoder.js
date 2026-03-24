class GW1TemplateDecoder {
    constructor(code, skillDb) {
        if (!code || typeof code !== 'string') throw new Error("No template code provided.");
        this.code = code;
        this.skillDb = skillDb || {};
        this.bitStream = [];
        this.cursor = 0;
        
        this.PROFESSIONS = { 0: "None", 1: "Warrior", 2: "Ranger", 3: "Monk", 4: "Necromancer", 5: "Mesmer", 6: "Elementalist", 7: "Assassin", 8: "Ritualist", 9: "Paragon", 10: "Dervish" };
        this.ATTRIBUTES = { 0: "Fast Casting", 1: "Illusion Magic", 2: "Domination Magic", 3: "Inspiration Magic", 4: "Blood Magic", 5: "Death Magic", 6: "Soul Reaping", 7: "Curses", 8: "Air Magic", 9: "Earth Magic", 10: "Fire Magic", 11: "Water Magic", 12: "Energy Storage", 13: "Healing Prayers", 14: "Smiting Prayers", 15: "Protection Prayers", 16: "Divine Favor", 17: "Strength", 18: "Axe Mastery", 19: "Hammer Mastery", 20: "Swordsmanship", 21: "Tactics", 22: "Beast Mastery", 23: "Expertise", 24: "Wilderness Survival", 25: "Marksmanship", 29: "Dagger Mastery", 30: "Deadly Arts", 31: "Shadow Arts", 32: "Communing", 33: "Restoration Magic", 34: "Channeling Magic", 35: "Critical Strikes", 36: "Spawning Power", 37: "Spear Mastery", 38: "Command", 39: "Motivation", 40: "Leadership", 41: "Scythe Mastery", 42: "Wind Prayers", 43: "Earth Prayers", 44: "Mysticism" };
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
        if (this.bitStream.length < 8) throw new Error("Template code is too short.");

        let data = { profession: {}, attributes: [], skills: [] };
        
        if (this.read(4) !== 14) throw new Error("Not a valid GW1 skill template code.");
        this.read(4); // version

        let profBitLen = (this.read(2) * 2) + 4;
        data.profession.primary = this.PROFESSIONS[this.read(profBitLen)] || "None";
        data.profession.secondary = this.PROFESSIONS[this.read(profBitLen)] || "None";

        let countAttrs = this.read(4);
        let attrBitLen = this.read(4) + 4;
        
        for (let i = 0; i < countAttrs; i++) {
            let attrId = this.read(attrBitLen);
            let points = this.read(4);
            data.attributes.push({ attribute: this.ATTRIBUTES[attrId] || `Unknown Attr`, points: points });
        }

        let skillBitLen = this.read(4) + 8;
        for (let i = 0; i < 8; i++) {
            let skillId = this.read(skillBitLen);
            data.skills.push(this.skillDb[skillId] || `Unknown Skill`);
        }
        return data;
    }
}

class GW1TemplateEncoder {
    constructor(primary, secondary, attributes, skills, skillDb) {
        this.primary = primary;
        this.secondary = secondary;
        this.attributes = attributes; 
        this.skills = skills; 
        this.skillDb = skillDb || {};
        this.bitStream = [];
        
        this.PROF_IDs = { "None":0, "Warrior":1, "Ranger":2, "Monk":3, "Necromancer":4, "Mesmer":5, "Elementalist":6, "Assassin":7, "Ritualist":8, "Paragon":9, "Dervish":10 };
        this.ATTR_IDs = { "Fast Casting":0, "Illusion Magic":1, "Domination Magic":2, "Inspiration Magic":3, "Blood Magic":4, "Death Magic":5, "Soul Reaping":6, "Curses":7, "Air Magic":8, "Earth Magic":9, "Fire Magic":10, "Water Magic":11, "Energy Storage":12, "Healing Prayers":13, "Smiting Prayers":14, "Protection Prayers":15, "Divine Favor":16, "Strength":17, "Axe Mastery":18, "Hammer Mastery":19, "Swordsmanship":20, "Tactics":21, "Beast Mastery":22, "Expertise":23, "Wilderness Survival":24, "Marksmanship":25, "Dagger Mastery":29, "Deadly Arts":30, "Shadow Arts":31, "Communing":32, "Restoration Magic":33, "Channeling Magic":34, "Critical Strikes":35, "Spawning Power":36, "Spear Mastery":37, "Command":38, "Motivation":39, "Leadership":40, "Scythe Mastery":41, "Wind Prayers":42, "Earth Prayers":43, "Mysticism":44 };
        
        this.REV_SKILLS = {};
        for(let id in this.skillDb) {
            this.REV_SKILLS[this.skillDb[id]] = parseInt(id);
        }
    }

    write(value, numBits) {
        for (let i = 0; i < numBits; i++) {
            this.bitStream.push((value >> i) & 1);
        }
    }

    encode() {
        this.write(14, 4); // Type
        this.write(0, 4);  // Version
        
        this.write(0, 2);  // Prof length (0*2+4 = 4 bits)
        this.write(this.PROF_IDs[this.primary] || 0, 4);
        this.write(this.PROF_IDs[this.secondary] || 0, 4);

        let validAttrs = this.attributes.filter(a => a.points > 0);
        this.write(validAttrs.length, 4);
        this.write(2, 4);  // Attr length (2+4 = 6 bits)
        
        for(let a of validAttrs) {
            this.write(this.ATTR_IDs[a.name] || 0, 6);
            this.write(a.points, 4);
        }

        this.write(4, 4);  // Skill length (4+8 = 12 bits)
        for(let i=0; i<8; i++) {
            let sName = this.skills[i];
            let sId = 0;
            if(sName && sName.toLowerCase() !== "optional" && this.REV_SKILLS[sName]) {
                sId = this.REV_SKILLS[sName];
            }
            this.write(sId, 12);
        }

        const BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let b64 = "";
        for(let i=0; i < this.bitStream.length; i+=6) {
            let val = 0;
            for(let j=0; j<6; j++) {
                if(i+j < this.bitStream.length) {
                    val |= (this.bitStream[i+j] << j);
                }
            }
            b64 += BASE64_MAP[val];
        }
        return b64;
    }
}
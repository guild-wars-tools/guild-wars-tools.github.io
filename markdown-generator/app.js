let skillsData = {};
let equipmentData = {};
let currentProfession = "None";
let currentSecondary = "None";
let decodedSkills = [];
let decodedAttributes = [];
let originalCode = "";

const TWO_HANDED_WEAPONS = ["Hammer", "Longbow", "Shortbow", "Flatbow", "Hornbow", "Recurve Bow", "Scythe", "Daggers", "Staff"];
const ANNIVERSARY_WEAPONS = {
    "Spear": ['Anniversary Spear "Arbalest"'],
    "Sword": ['Anniversary Sword "Prominence"'],
    "Hammer": ['Anniversary Hammer "Verdict"'],
    "Scythe": ['Anniversary Scythe "Sufferer"'],
    "Shield": ['Anniversary Shield "Curtain"'],
    "Axe": ['Anniversary Axe "Engrave"'],
    "Shortbow": ['Anniversary Shortbow "Whisper"'],
    "Flatbow": ['Anniversary Flatbow "Oracle"'],
    "Staff": ['Anniversary Staff "Unveil"'],
    "Daggers": ['Anniversary Daggers "Vengeance"']
};

const PROF_ATTRIBUTES = {
    "Warrior": ["Strength", "Axe Mastery", "Swordsmanship", "Hammer Mastery", "Tactics"],
    "Ranger": ["Expertise", "Beast Mastery", "Marksmanship", "Wilderness Survival"],
    "Monk": ["Divine Favor", "Healing Prayers", "Protection Prayers", "Smiting Prayers"],
    "Necromancer": ["Soul Reaping", "Blood Magic", "Curses", "Death Magic"],
    "Mesmer": ["Fast Casting", "Domination Magic", "Illusion Magic", "Inspiration Magic"],
    "Elementalist": ["Energy Storage", "Air Magic", "Earth Magic", "Fire Magic", "Water Magic"],
    "Assassin": ["Critical Strikes", "Dagger Mastery", "Deadly Arts", "Shadow Arts"],
    "Ritualist": ["Spawning Power", "Channeling Magic", "Communing", "Restoration Magic"],
    "Paragon": ["Leadership", "Command", "Motivation", "Spear Mastery"],
    "Dervish": ["Mysticism", "Earth Prayers", "Scythe Mastery", "Wind Prayers"]
};

const PRIMARY_ATTRIBUTES = {
    "Warrior": "Strength", "Ranger": "Expertise", "Monk": "Divine Favor",
    "Necromancer": "Soul Reaping", "Mesmer": "Fast Casting", "Elementalist": "Energy Storage",
    "Assassin": "Critical Strikes", "Ritualist": "Spawning Power", "Paragon": "Leadership",
    "Dervish": "Mysticism"
};

let generateBtn = document.getElementById('generate-btn');
let copyBtn = document.createElement('button');
copyBtn.id = 'copy-btn';
copyBtn.textContent = 'Copy to Clipboard';
copyBtn.style.backgroundColor = '#ff9800'; 
copyBtn.style.color = '#fff';
copyBtn.style.border = 'none';
copyBtn.style.borderRadius = '4px';
copyBtn.style.padding = '8px 16px';
copyBtn.style.fontWeight = 'bold';
copyBtn.style.cursor = 'pointer';
copyBtn.style.marginLeft = '10px';
copyBtn.style.display = 'none'; 

generateBtn.parentNode.insertBefore(copyBtn, generateBtn.nextSibling);

copyBtn.addEventListener('click', () => {
    const outputField = document.getElementById('output');
    outputField.select();
    navigator.clipboard.writeText(outputField.value).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
});

Promise.all([
    fetch('skills.json').then(res => res.json()),
    fetch('equipment.json').then(res => res.json())
]).then(([skills, eq]) => {
    skillsData = skills;
    equipmentData = eq;
}).catch(err => console.error("Error loading databases:", err));

document.getElementById('decode-btn').addEventListener('click', () => {
    const code = document.getElementById('template-code').value.trim();
    const eqCodeInput = document.getElementById('equipment-code');
    const eqCode = eqCodeInput ? eqCodeInput.value.trim() : '';

    if (!code) return alert("Please enter a skill template code.");
    
    try {
        const skillDecoder = new GW1TemplateDecoder(code, skillsData);
        const result = skillDecoder.parse();
        
        originalCode = code;
        currentProfession = result.profession.primary;
        currentSecondary = result.profession.secondary;
        decodedSkills = result.skills;
        decodedAttributes = result.attributes;

        if (eqCode) {
            try {
                const eqDecoder = new GW1TemplateDecoder(eqCode, skillsData);
                const rawEqData = eqDecoder.parseEquipment();
            } catch (err) {
                console.warn("Could not decode Equipment Code:", err.message);
            }
        }
        
        buildArmorForms();
        buildWeaponForms();
    } catch (error) {
        console.error("Decoding error:", error);
        alert("Oops! There was an issue decoding that template.\n\nDetails: " + error.message);
    }
});

function buildArmorForms() {
    const container = document.getElementById('armor-forms');
    container.innerHTML = ''; 
    
    const pieces = ['Head', 'Chest', 'Hands', 'Legs', 'Feet'];
    const runes = [...(equipmentData.runes["None"] || []), ...(equipmentData.runes[currentProfession] || [])];
    const insignias = [...(equipmentData.insignias["None"] || []), ...(equipmentData.insignias[currentProfession] || [])];
    
    pieces.forEach(piece => {
        const runeOptions = runes.map(r => {
            let label = r.name.replace(/^Rune of /, '');
            return `<option value="${r.name}">${label}</option>`;
        }).join('');
        
        const insigniaOptions = insignias.map(i => {
            let label = i.name.replace(/ Insignia/, '');
            return `<option value="${i.name}">${label}</option>`;
        }).join('');
        
        let headAttrSelect = '';
        if (piece === 'Head' && PROF_ATTRIBUTES[currentProfession]) {
            const attrOpts = PROF_ATTRIBUTES[currentProfession].map(a => `<option value="${a}">+1 ${a}</option>`).join('');
            headAttrSelect = `<select class="head-attr-select" style="margin-left:8px;"><option value="">-- Attr --</option>${attrOpts}</select>`;
        }
        
        container.innerHTML += `
            <div class="armor-piece">
                <strong>${piece}:</strong>
                <select class="rune-select"><option value="">-- Rune --</option>${runeOptions}</select>
                <select class="insignia-select"><option value="">-- Insignia --</option>${insigniaOptions}</select>
                ${headAttrSelect}
            </div>
        `;
    });
}

function buildWeaponForms() {
    const container = document.getElementById('weapon-forms');
    container.innerHTML = '';
    
    const mainTypes = [...(equipmentData.weapons.categories.Martial_1H || []), ...(equipmentData.weapons.categories.Martial_2H || []), ...(equipmentData.weapons.categories.Staff || []), ...(equipmentData.weapons.categories.Wand || [])]
        .map(t => `<option value="${t}">${t}</option>`).join('');
    const offTypes = [...(equipmentData.weapons.categories.Shield || []), ...(equipmentData.weapons.categories.Focus || [])]
        .map(t => `<option value="${t}">${t}</option>`).join('');

    for (let i = 1; i <= 4; i++) {
        container.innerHTML += `
            <div class="weapon-set">
                <strong>Set ${i}:</strong><br>
                Main: <select class="w-type"><option value="">Type</option>${mainTypes}</select>
                      <select class="w-attr" style="display:none;"><option value="">Attribute</option></select>
                      <select class="w-prefix"><option value="">Prefix</option></select>
                      <select class="w-suffix"><option value="">Suffix</option></select>
                      <select class="w-inscript"><option value="">Inscription</option></select><br>
                Offhand: <select class="o-type"><option value="">Type</option>${offTypes}</select>
                      <select class="o-attr" style="display:none;"><option value="">Attribute</option></select>
                      <select class="o-prefix"><option value="">Prefix</option></select>
                      <select class="o-suffix"><option value="">Suffix</option></select>
                      <select class="o-inscript"><option value="">Inscription</option></select>
            </div><br>
        `;
    }
}

function getWeaponCategory(type) {
    if (!type) return null;
    for (const cat in equipmentData.weapons.categories) {
        if (equipmentData.weapons.categories[cat].includes(type)) return cat;
    }
    return null;
}

document.getElementById('weapon-forms').addEventListener('change', (e) => {
    const setDiv = e.target.closest('.weapon-set');
    if (!setDiv) return;

    if (e.target.classList.contains('w-type')) {
        const wType = e.target.value;
        const is2H = TWO_HANDED_WEAPONS.includes(wType);
        
        const offhandSelects = setDiv.querySelectorAll('.o-type, .o-attr, .o-prefix, .o-suffix, .o-inscript');
        offhandSelects.forEach(select => {
            select.disabled = is2H;
            if (is2H) {
                select.value = "";
                if (select.classList.contains('o-attr')) select.style.display = 'none';
            }
        });

        const category = getWeaponCategory(wType);
        populateUpgrades(setDiv, 'w', category, wType);
    } else if (e.target.classList.contains('o-type')) {
        const oType = e.target.value;
        const category = getWeaponCategory(oType);
        populateUpgrades(setDiv, 'o', category, oType);
    }

    if (["w-prefix", "o-prefix", "w-attr", "o-attr"].some(cls => e.target.classList.contains(cls))) {
        const isW = e.target.classList.contains('w-prefix') || e.target.classList.contains('w-attr');
        const prefixStr = isW ? 'w' : 'o';
        const isAnniversary = e.target.value.includes('Anniversary');
        
        const preSelect = setDiv.querySelector(`.${prefixStr}-prefix`);
        const attrSelect = setDiv.querySelector(`.${prefixStr}-attr`);
        const sufSelect = setDiv.querySelector(`.${prefixStr}-suffix`);
        const inscSelect = setDiv.querySelector(`.${prefixStr}-inscript`);
        
        if (e.target.classList.contains(`${prefixStr}-prefix`)) {
            sufSelect.disabled = isAnniversary;
            inscSelect.disabled = isAnniversary;
            attrSelect.disabled = isAnniversary;
            if (isAnniversary) {
                sufSelect.value = "";
                inscSelect.value = "";
                if (attrSelect.style.display !== 'none') attrSelect.value = "";
            }
        } else if (e.target.classList.contains(`${prefixStr}-attr`)) {
            sufSelect.disabled = isAnniversary;
            inscSelect.disabled = isAnniversary;
            preSelect.disabled = isAnniversary;
            if (isAnniversary) {
                sufSelect.value = "";
                inscSelect.value = "";
                if (preSelect.style.display !== 'none') preSelect.value = "";
            }
        }
    }
});

function populateUpgrades(setDiv, prefix, category, wType) {
    const attrSelect = setDiv.querySelector(`.${prefix}-attr`);
    const preSelect = setDiv.querySelector(`.${prefix}-prefix`);
    const sufSelect = setDiv.querySelector(`.${prefix}-suffix`);
    const inscSelect = setDiv.querySelector(`.${prefix}-inscript`);

    sufSelect.disabled = false;
    inscSelect.disabled = false;
    attrSelect.disabled = false;
    preSelect.disabled = false;

    if (!category || !wType) {
        attrSelect.style.display = 'none';
        preSelect.style.display = 'inline-block';
        preSelect.innerHTML = '<option value="">Prefix</option>';
        sufSelect.innerHTML = '<option value="">Suffix</option>';
        inscSelect.innerHTML = '<option value="">Inscription</option>';
        return;
    }

    const attrs = equipmentData.weapons.attributes[wType] || [];
    let attrHtml = '<option value="">Attribute</option>';
    attrs.forEach(a => attrHtml += `<option value="${a}">${a}</option>`);

    if (ANNIVERSARY_WEAPONS[wType] && wType === "Shield") {
        ANNIVERSARY_WEAPONS[wType].forEach(ann => {
            attrHtml += `<option value='${ann}'>${ann}</option>`;
        });
    }

    attrSelect.innerHTML = attrHtml;
    
    if (attrs.length <= 1 && wType !== "Shield") {
        attrSelect.style.display = 'none';
        if (attrs.length === 1) attrSelect.innerHTML = `<option value="${attrs[0]}" selected>${attrs[0]}</option>`;
    } else {
        attrSelect.style.display = 'inline-block';
    }

    const upg = equipmentData.weapons.upgrades[category];
    
    let prefixHtml = '<option value="">Prefix</option>';
    if (ANNIVERSARY_WEAPONS[wType] && wType !== "Shield") {
        ANNIVERSARY_WEAPONS[wType].forEach(ann => {
            prefixHtml += `<option value='${ann}'>${ann}</option>`;
        });
    }
    
    if (upg.prefixes.length === 0 && !(ANNIVERSARY_WEAPONS[wType] && wType !== "Shield")) {
        preSelect.style.display = 'none';
        preSelect.innerHTML = prefixHtml;
    } else {
        preSelect.style.display = 'inline-block';
        prefixHtml += upg.prefixes.map(p => `<option value="${p}">${p}</option>`).join('');
        preSelect.innerHTML = prefixHtml;
    }
    
    sufSelect.innerHTML = '<option value="">Suffix</option>' + upg.suffixes.map(s => `<option value="${s}">${s}</option>`).join('');
    inscSelect.innerHTML = '<option value="">Inscription</option>' + upg.inscriptions.map(i => `<option value="${i}">${i}</option>`).join('');
}

document.getElementById('generate-btn').addEventListener('click', () => {
    const armorDivs = document.querySelectorAll('.armor-piece');
    let runeCount = 0;
    let insigniaCount = 0;
    let isValid = true;

    armorDivs.forEach(div => {
        if (div.querySelector('.rune-select').value) runeCount++;
        if (div.querySelector('.insignia-select').value) insigniaCount++;
    });

    if (runeCount > 0 && runeCount < 5) {
        armorDivs.forEach(div => {
            let rs = div.querySelector('.rune-select');
            rs.style.borderColor = rs.value ? '' : 'red';
        });
        isValid = false;
        alert("Please specify a Rune for all 5 armor pieces, or leave them all blank.");
    } else {
        armorDivs.forEach(div => div.querySelector('.rune-select').style.borderColor = '');
    }

    if (insigniaCount > 0 && insigniaCount < 5) {
        armorDivs.forEach(div => {
            let isel = div.querySelector('.insignia-select');
            isel.style.borderColor = isel.value ? '' : 'red';
        });
        isValid = false;
        if (runeCount === 0 || runeCount === 5) {
            alert("Please specify an Insignia for all 5 armor pieces, or leave them all blank.");
        }
    } else {
        armorDivs.forEach(div => div.querySelector('.insignia-select').style.borderColor = '');
    }

    if (!isValid) return;

    const buildName = document.getElementById('build-name').value.trim() || "Untitled Build";
    
    const makeLink = (str) => {
        if (!str) return '';
        let urlName = str.replace(/ /g, '_').replace(/"/g, '%22');
        return `[${str}](https://wiki.guildwars.com/wiki/${urlName})`;
    };

    const profLink = (p) => p && p !== "None" ? makeLink(p) : "";
    let profString = profLink(currentProfession);
    if (currentSecondary && currentSecondary !== "None") {
        profString += `/${profLink(currentSecondary)}`;
    }

    let md = `**${buildName}** - ${profString} (${originalCode})\n\n`;

    const buildDesc = document.getElementById('build-desc').value.trim();
    if (buildDesc) {
        md += `${buildDesc}\n\n`;
    }

    const stripDesc = (str) => str ? str.replace(/ \([^)]+\)/g, '') : '';

    const skillLinks = decodedSkills.map(s => s.startsWith("Unknown") ? s : makeLink(s));
    md += `**Skills**\n\n${skillLinks.join(' | ')}\n\n`;

    let finalAttributes = {};
    decodedAttributes.forEach(a => {
        if (a.points > 0) finalAttributes[a.attribute] = { base: a.points, rune: 0, head: 0, min5: false };
    });

    const sets = document.querySelectorAll('.weapon-set');
    sets.forEach(set => {
        const wSuf = stripDesc(set.querySelector('.w-suffix').value);
        const oSuf = stripDesc(set.querySelector('.o-suffix').value);
        
        [wSuf, oSuf].forEach(suf => {
            if (suf && suf.startsWith('of the ')) {
                let profMatch = suf.replace('of the ', '');
                let primAttr = PRIMARY_ATTRIBUTES[profMatch];
                if (primAttr) {
                    if (!finalAttributes[primAttr]) {
                        finalAttributes[primAttr] = { base: 0, rune: 0, head: 0, min5: false };
                    }
                    finalAttributes[primAttr].min5 = true;
                }
            }
        });
    });

    armorDivs.forEach(div => {
        const headSelect = div.querySelector('.head-attr-select');
        if (headSelect && headSelect.value) {
            let attr = headSelect.value;
            if (!finalAttributes[attr]) finalAttributes[attr] = { base: 0, rune: 0, head: 0, min5: false };
            finalAttributes[attr].head = 1;
        }

        const rawRune = stripDesc(div.querySelector('.rune-select').value);
        if (rawRune) {
            const match = rawRune.match(/Rune of (Minor|Major|Superior) (.+)/);
            if (match) {
                const rank = match[1];
                const attr = match[2];
                
                const isSkillAttribute = Object.values(PROF_ATTRIBUTES).some(attrList => attrList.includes(attr));
                
                if (isSkillAttribute) {
                    const val = rank === 'Superior' ? 3 : (rank === 'Major' ? 2 : 1);
                    if (!finalAttributes[attr]) finalAttributes[attr] = { base: 0, rune: 0, head: 0, min5: false };
                    finalAttributes[attr].rune = Math.max(finalAttributes[attr].rune, val);
                }
            }
        }
    });

    let attrLinks = [];
    for (let attr in finalAttributes) {
        let data = finalAttributes[attr];
        
        if (data.base > 0 || data.rune > 0 || data.head > 0 || data.min5) {
            let parts = [data.base];
            if (data.rune > 0) parts.push(data.rune);
            if (data.head > 0) parts.push(data.head);
            
            let valStr = parts.join('+');
            if (data.min5) {
                valStr += ' (minimum 5)';
            }
            attrLinks.push(`${makeLink(attr)}: ${valStr}`);
        }
    }

    if (attrLinks.length > 0) {
        md += `**Attributes**\n\n${attrLinks.join(' | ')}\n\n`;
    }

    let runes = [];
    let insignias = [];
    
    armorDivs.forEach(div => {
        let r = stripDesc(div.querySelector('.rune-select').value);
        let i = stripDesc(div.querySelector('.insignia-select').value);
        if (r) runes.push(makeLink(r));
        if (i) insignias.push(makeLink(i));
    });

    if (runes.length > 0) md += `**Runes**\n\n${runes.join(' | ')}\n\n`;
    if (insignias.length > 0) md += `**Insignias**\n\n${insignias.join(' | ')}\n\n`;

    const buildWeaponLinksStr = (prefixStr, set) => {
        const type = stripDesc(set.querySelector(`.${prefixStr}-type`).value);
        if (!type) return null;

        const pre = stripDesc(set.querySelector(`.${prefixStr}-prefix`).value);
        const attrSelect = set.querySelector(`.${prefixStr}-attr`);
        const attr = attrSelect.style.display !== 'none' ? stripDesc(attrSelect.value) : '';
        const suf = stripDesc(set.querySelector(`.${prefixStr}-suffix`).value);
        const insc = stripDesc(set.querySelector(`.${prefixStr}-inscript`).value);

        if (pre && pre.includes('Anniversary')) {
            return makeLink(pre);
        }
        if (attr && attr.includes('Anniversary')) {
            return makeLink(attr);
        }

        let parts = [];
        parts.push(makeLink(type));
        if (pre) parts.push(makeLink(pre));
        if (attr) parts.push(makeLink(attr));
        if (suf) parts.push(makeLink(suf));
        if (insc) parts.push(makeLink(insc));

        return parts.join(' | ');
    };

    let validWeaponSets = [];

    sets.forEach((set) => {
        const mLinksStr = buildWeaponLinksStr('w', set);
        const oLinksStr = buildWeaponLinksStr('o', set);
        
        let combined = [];
        if (mLinksStr) combined.push(mLinksStr);
        if (oLinksStr) combined.push(oLinksStr);
        
        if (combined.length > 0) {
            validWeaponSets.push(combined.join(' — '));
        }
    });

    if (validWeaponSets.length === 1) {
        md += `**Weapon set**\n\n${validWeaponSets[0]}\n\n`;
    } else if (validWeaponSets.length > 1) {
        md += `**Weapon sets**\n\n`;
        validWeaponSets.forEach((ws, idx) => {
            md += `${idx + 1}) ${ws}\n\n`;
        });
    }

    const buildNotes = document.getElementById('build-notes') ? document.getElementById('build-notes').value.trim() : '';
    if (buildNotes) {
        md += `**Notes**\n\n${buildNotes}\n\n`;
    }

    md += `---\nGenerated with [Build Markdown Generator](https://guild-wars-tools.github.io/markdown-generator/)`;

    const outputString = md.trim();
    document.getElementById('output').value = outputString;
    
    if (outputString.length > 0) {
        copyBtn.style.display = 'inline-block';
    } else {
        copyBtn.style.display = 'none';
    }
});
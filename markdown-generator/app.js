let skillsData = {};
let equipmentData = {};
let currentProfession = "None";
let currentSecondary = "None";
let decodedAttributes = [];
let originalCode = "";

const TWO_HANDED_WEAPONS = ["Hammer", "Longbow", "Shortbow", "Flatbow", "Hornbow", "Recurve Bow", "Scythe", "Daggers", "Staff"];
const ANNIVERSARY_WEAPONS = {
    "Spear": ['Anniversary Spear "Arbalest"'], "Sword": ['Anniversary Sword "Prominence"'], "Hammer": ['Anniversary Hammer "Verdict"'],
    "Scythe": ['Anniversary Scythe "Sufferer"'], "Shield": ['Anniversary Shield "Curtain"'], "Axe": ['Anniversary Axe "Engrave"'],
    "Shortbow": ['Anniversary Shortbow "Whisper"'], "Flatbow": ['Anniversary Flatbow "Oracle"'], "Staff": ['Anniversary Staff "Unveil"'], "Daggers": ['Anniversary Daggers "Vengeance"']
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
    "Warrior": "Strength", "Ranger": "Expertise", "Monk": "Divine Favor", "Necromancer": "Soul Reaping", 
    "Mesmer": "Fast Casting", "Elementalist": "Energy Storage", "Assassin": "Critical Strikes", 
    "Ritualist": "Spawning Power", "Paragon": "Leadership", "Dervish": "Mysticism"
};

const ALL_PROFESSIONS = ["None", "Warrior", "Ranger", "Monk", "Necromancer", "Mesmer", "Elementalist", "Assassin", "Ritualist", "Paragon", "Dervish"];

// CORRECTED GW1 Attribute Cost Curve
const ATTR_COST = [0, 1, 3, 6, 10, 15, 21, 28, 37, 48, 61, 77, 97]; 

let generateBtn = document.getElementById('generate-btn');
let copyBtn = document.createElement('button');
copyBtn.textContent = 'Copy to Clipboard';
copyBtn.style.backgroundColor = '#ff9800'; 
copyBtn.style.color = '#fff';
copyBtn.style.border = 'none';
copyBtn.style.borderRadius = '4px';
copyBtn.style.padding = '10px 20px';
copyBtn.style.fontWeight = 'bold';
copyBtn.style.cursor = 'pointer';
copyBtn.style.marginLeft = '10px';
copyBtn.style.display = 'none'; 

generateBtn.parentNode.insertBefore(copyBtn, document.getElementById('reset-btn').nextSibling);
copyBtn.addEventListener('click', () => {
    const outputField = document.getElementById('output');
    outputField.select();
    navigator.clipboard.writeText(outputField.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => copyBtn.textContent = 'Copy to Clipboard', 2000);
    });
});

Promise.all([
    fetch('skills.json').then(res => res.json()),
    fetch('equipment.json').then(res => res.json())
]).then(([skills, eq]) => {
    skillsData = skills;
    equipmentData = eq;
    
    const allSkillNames = Object.values(skillsData).filter(s => s && s !== "No Skill").sort();
    const uniqueSkills = [...new Set(allSkillNames)];
    const dataList = document.getElementById('all-skills-datalist');
    if (dataList) {
        dataList.innerHTML = uniqueSkills.map(s => `<option value="${s.replace(/"/g, '&quot;')}">`).join('');
    }

    buildManualCoreForms();
    buildArmorForms();
    buildWeaponForms();
}).catch(err => console.error("Error loading databases:", err));

// Hard Reset Function
document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Are you sure you want to clear the entire build?")) {
        document.getElementById('template-code').value = "";
        document.getElementById('build-name').value = "";
        document.getElementById('build-desc').value = "";
        document.getElementById('build-notes').value = "";
        document.getElementById('output').value = "";
        
        originalCode = "";
        currentProfession = "None";
        currentSecondary = "None";
        
        document.getElementById('primary-prof-select').value = "None";
        document.getElementById('secondary-prof-select').value = "None";
        
        document.getElementById('optional-skills-container').innerHTML = '';
        document.querySelectorAll('.manual-skill-input').forEach(inp => inp.value = "");
        
        const attrContainer = document.getElementById('attributes-inputs-container');
        if (attrContainer) attrContainer.innerHTML = '';
        updateAttributeTally();
        
        buildArmorForms();
        buildWeaponForms();
        
        copyBtn.style.display = 'none';
    }
});

function updateAttributeTally(changedInput = null) {
    let inputs = Array.from(document.querySelectorAll('.manual-attr-input'));
    let total = 0;
    
    inputs.forEach(inp => {
        let val = parseInt(inp.value) || 0;
        if (val < 0) { val = 0; inp.value = 0; }
        if (val > 12) { val = 12; inp.value = 12; }
        total += ATTR_COST[val];
    });

    if (total > 200 && changedInput) {
        let val = parseInt(changedInput.value) || 0;
        while (total > 200 && val > 0) {
            total -= ATTR_COST[val];
            val--;
            total += ATTR_COST[val];
        }
        changedInput.value = val;
    }

    const tallyDisplay = document.getElementById('attr-points-tally');
    if (tallyDisplay) {
        tallyDisplay.textContent = `(${total} / 200 Points)`;
        tallyDisplay.style.color = total === 200 ? '#ff9800' : (total > 200 ? 'red' : '#555');
    }
}

function autoGenerateTemplateCode() {
    const prim = document.getElementById('primary-prof-select').value;
    const sec = document.getElementById('secondary-prof-select').value;
    
    let attrs = [];
    document.querySelectorAll('.manual-attr-input').forEach(inp => {
        let pts = parseInt(inp.value) || 0;
        if(pts > 0) attrs.push({ name: inp.dataset.attr, points: pts });
    });

    let skills = [];
    document.querySelectorAll('.manual-skill-input').forEach(inp => {
        skills.push(inp.value.trim() || "Optional");
    });

    try {
        const encoder = new GW1TemplateEncoder(prim, sec, attrs, skills, skillsData);
        const code = encoder.encode();
        document.getElementById('template-code').value = code;
        originalCode = code;
    } catch(e) {
        console.warn("Could not auto-generate code", e);
    }
}

function buildManualCoreForms() {
    const primSel = document.getElementById('primary-prof-select');
    const secSel = document.getElementById('secondary-prof-select');
    
    if (primSel && secSel) {
        primSel.innerHTML = ALL_PROFESSIONS.map(p => `<option value="${p}">${p}</option>`).join('');
        secSel.innerHTML = ALL_PROFESSIONS.map(p => `<option value="${p}">${p}</option>`).join('');
        
        primSel.addEventListener('change', (e) => {
            let prim = e.target.value;
            let sec = secSel.value;
            if (sec !== "None" && sec === prim) {
                sec = "None";
                secSel.value = "None";
            }
            updateProfessionState(prim, sec);
        });
        
        secSel.addEventListener('change', (e) => {
            let sec = e.target.value;
            let prim = primSel.value;
            if (sec !== "None" && sec === prim) {
                alert("Secondary profession cannot be the same as the Primary profession.");
                sec = "None";
                secSel.value = "None";
            }
            updateProfessionState(prim, sec);
        });
    }
    
    const skillsContainer = document.getElementById('skills-inputs-container');
    if (skillsContainer) {
        skillsContainer.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.setAttribute('list', 'all-skills-datalist'); 
            inp.className = 'manual-skill-input';
            inp.placeholder = 'Optional';
            inp.style.width = '100%';
            inp.style.padding = '5px';
            inp.addEventListener('input', autoGenerateTemplateCode); 
            skillsContainer.appendChild(inp);
        }
    }
}

function updateProfessionState(primProf, secProf, decodedAttrs = []) {
    currentProfession = primProf;
    currentSecondary = secProf;

    const attrContainer = document.getElementById('attributes-inputs-container');
    if (attrContainer) {
        // 1. Save current attribute values before clearing
        let currentAttrState = {};
        document.querySelectorAll('.manual-attr-input').forEach(inp => {
            let pts = parseInt(inp.value) || 0;
            if (pts > 0) currentAttrState[inp.dataset.attr] = pts;
        });

        attrContainer.innerHTML = '';
        let availableAttrs = [];
        if (PROF_ATTRIBUTES[primProf]) availableAttrs.push(...PROF_ATTRIBUTES[primProf]);
        if (secProf !== "None" && PROF_ATTRIBUTES[secProf]) availableAttrs.push(...PROF_ATTRIBUTES[secProf]);

        availableAttrs.forEach(attr => {
            let defaultVal = 0;
            // First check if it came from a direct decode
            let decoded = decodedAttrs.find(a => a.attribute === attr);
            if (decoded) {
                defaultVal = decoded.points;
            } 
            // Second check if it was previously entered by the user manually
            else if (currentAttrState[attr]) {
                defaultVal = currentAttrState[attr];
            }

            attrContainer.innerHTML += `
                <div class="attr-box">
                    <label>${attr}</label>
                    <input type="number" min="0" max="12" value="${defaultVal}" class="manual-attr-input" data-attr="${attr}">
                </div>
            `;
        });

        document.querySelectorAll('.manual-attr-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                updateAttributeTally(e.target);
                autoGenerateTemplateCode();
            });
        });
        updateAttributeTally();
    }

    const prevArmorState = [];
    document.querySelectorAll('.armor-piece').forEach(div => {
        prevArmorState.push({
            headAttr: div.querySelector('.head-attr-select')?.value || '',
            rune: div.querySelector('.rune-select')?.value || '',
            insignia: div.querySelector('.insignia-select')?.value || ''
        });
    });

    const prevWeaponState = [];
    document.querySelectorAll('.weapon-set').forEach(set => {
        prevWeaponState.push({
            wType: set.querySelector('.w-type')?.value || '',
            wAttr: set.querySelector('.w-attr')?.value || '',
            wPre: set.querySelector('.w-prefix')?.value || '',
            wSuf: set.querySelector('.w-suffix')?.value || '',
            wInsc: set.querySelector('.w-inscript')?.value || '',
            oType: set.querySelector('.o-type')?.value || '',
            oAttr: set.querySelector('.o-attr')?.value || '',
            oPre: set.querySelector('.o-prefix')?.value || '',
            oSuf: set.querySelector('.o-suffix')?.value || '',
            oInsc: set.querySelector('.o-inscript')?.value || ''
        });
    });

    buildArmorForms();
    buildWeaponForms();

    document.querySelectorAll('.armor-piece').forEach((div, i) => {
        if (prevArmorState[i]) {
            const hSel = div.querySelector('.head-attr-select');
            if (hSel && prevArmorState[i].headAttr) hSel.value = prevArmorState[i].headAttr;
            const rSel = div.querySelector('.rune-select');
            if (rSel && Array.from(rSel.options).some(o => o.value === prevArmorState[i].rune)) rSel.value = prevArmorState[i].rune;
            const iSel = div.querySelector('.insignia-select');
            if (iSel && Array.from(iSel.options).some(o => o.value === prevArmorState[i].insignia)) iSel.value = prevArmorState[i].insignia;
        }
    });

    document.querySelectorAll('.weapon-set').forEach((set, i) => {
        const st = prevWeaponState[i];
        if (st && st.wType) {
            set.querySelector('.w-type').value = st.wType;
            populateUpgrades(set, 'w', getWeaponCategory(st.wType), st.wType);
            if (st.wAttr) set.querySelector('.w-attr').value = st.wAttr;
            if (st.wPre) set.querySelector('.w-prefix').value = st.wPre;
            if (st.wSuf) set.querySelector('.w-suffix').value = st.wSuf;
            if (st.wInsc) set.querySelector('.w-inscript').value = st.wInsc;
        }
        if (st && st.oType) {
            set.querySelector('.o-type').value = st.oType;
            populateUpgrades(set, 'o', getWeaponCategory(st.oType), st.oType);
            if (st.oAttr) set.querySelector('.o-attr').value = st.oAttr;
            if (st.oPre) set.querySelector('.o-prefix').value = st.oPre;
            if (st.oSuf) set.querySelector('.o-suffix').value = st.oSuf;
            if (st.oInsc) set.querySelector('.o-inscript').value = st.oInsc;
        }
        
        set.querySelectorAll('.w-prefix, .w-attr, .o-prefix, .o-attr').forEach(sel => {
            if(sel.value && sel.value.includes('Anniversary')) sel.dispatchEvent(new Event('change', { bubbles: true }));
        });
        
        if (st && TWO_HANDED_WEAPONS.includes(st.wType)) {
            set.querySelectorAll('.o-type, .o-attr, .o-prefix, .o-suffix, .o-inscript').forEach(s => s.disabled = true);
        }
    });

    autoGenerateTemplateCode();
}

document.getElementById('add-optional-skill-btn').addEventListener('click', () => {
    const container = document.getElementById('optional-skills-container');
    const row = document.createElement('div');
    row.style.marginBottom = '6px';
    row.innerHTML = `
        <input type="text" list="all-skills-datalist" class="opt-skill-name" placeholder="Skill Name" style="width: 200px; padding: 4px;">
        <input type="text" class="opt-skill-desc" placeholder="Description (optional)" style="width: 300px; padding: 4px;">
        <button class="remove-opt-skill" style="cursor: pointer; color: red;">X</button>
    `;
    row.querySelector('.remove-opt-skill').addEventListener('click', () => row.remove());
    container.appendChild(row);
});

document.getElementById('decode-btn').addEventListener('click', () => {
    const code = document.getElementById('template-code').value.trim();
    if (!code) return alert("Please enter a skill template code.");
    
    try {
        const skillDecoder = new GW1TemplateDecoder(code, skillsData);
        const result = skillDecoder.parse();
        
        originalCode = code;

        document.getElementById('primary-prof-select').value = result.profession.primary;
        document.getElementById('secondary-prof-select').value = result.profession.secondary;
        
        const skillInputs = document.querySelectorAll('.manual-skill-input');
        result.skills.forEach((skill, idx) => {
            if (skillInputs[idx]) {
                skillInputs[idx].value = (skill === "No Skill" || skill.startsWith("Unknown")) ? "" : skill;
            }
        });

        updateProfessionState(result.profession.primary, result.profession.secondary, result.attributes);

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
            <div class="armor-piece" style="margin-bottom: 5px;">
                <strong style="display:inline-block; width: 50px;">${piece}:</strong>
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
            <div class="weapon-set" style="margin-bottom: 10px;">
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
            </div>
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
    
    if (ANNIVERSARY_WEAPONS[wType] && wType === "Shield") {
        ANNIVERSARY_WEAPONS[wType].forEach(ann => {
            attrHtml += `<option value='${ann}'>${ann}</option>`;
        });
    }
    
    attrs.forEach(a => attrHtml += `<option value="${a}">${a}</option>`);
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
    const buildName = document.getElementById('build-name').value.trim() || "Untitled Build";
    
    const makeLink = (str) => {
        if (!str) return '';
        if (str === 'Martial Weapon') return `[Martial Weapon](https://wiki.guildwars.com/wiki/Martial_weapon)`;
        let urlName = str.replace(/ /g, '_').replace(/"/g, '%22');
        return `[${str}](https://wiki.guildwars.com/wiki/${urlName})`;
    };

    const profLink = (p) => p && p !== "None" ? makeLink(p) : "";
    let profString = profLink(currentProfession);
    if (currentSecondary && currentSecondary !== "None") {
        profString += `/${profLink(currentSecondary)}`;
    }

    let codeString = originalCode ? ` (${originalCode})` : "";
    let md = `**${buildName}** - ${profString}${codeString}\n\n`;

    const buildDesc = document.getElementById('build-desc').value.trim();
    if (buildDesc) {
        md += `${buildDesc}\n\n`;
    }

    const stripDesc = (str) => str ? str.replace(/ \([^)]+\)/g, '') : '';

    const manualSkills = Array.from(document.querySelectorAll('.manual-skill-input')).map(inp => inp.value.trim());
    const skillLinks = manualSkills.map(s => {
        if (!s || s.toLowerCase() === "optional") return `[Optional](https://wiki.guildwars.com/wiki/Optional)`;
        return makeLink(s);
    });
    md += `**Skills**\n\n${skillLinks.join(' | ')}\n\n`;

    const optRows = document.querySelectorAll('#optional-skills-container > div');
    let optSkillsMd = "";
    optRows.forEach(row => {
        const name = row.querySelector('.opt-skill-name').value.trim();
        const desc = row.querySelector('.opt-skill-desc').value.trim();
        if (name) {
            let line = `- ${makeLink(name)}`;
            if (desc) line += ` - ${desc}`;
            optSkillsMd += `${line}\n`;
        }
    });

    if (optSkillsMd) {
        md += `**Options**\n\n${optSkillsMd}\n`;
    }

    let finalAttributes = {};
    document.querySelectorAll('.manual-attr-input').forEach(inp => {
        let pts = parseInt(inp.value) || 0;
        if(pts > 0) finalAttributes[inp.dataset.attr] = { base: pts, rune: 0, head: 0, min5: false };
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
                    if (!finalAttributes[primAttr]) finalAttributes[primAttr] = { base: 0, rune: 0, head: 0, min5: false };
                    finalAttributes[primAttr].min5 = true;
                }
            }
        });
    });

    const armorDivs = document.querySelectorAll('.armor-piece');
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
            if (data.min5) valStr += ' (minimum 5)';
            attrLinks.push(`${makeLink(attr)}: ${valStr}`);
        }
    }

    if (attrLinks.length > 0) {
        md += `**Attributes**\n\n${attrLinks.join(' | ')}\n\n`;
    }

    let runes = [];
    let insignias = [];
    let runeCount = 0;
    let insigniaCount = 0;

    armorDivs.forEach(div => {
        if (div.querySelector('.rune-select').value) runeCount++;
        if (div.querySelector('.insignia-select').value) insigniaCount++;
    });

    armorDivs.forEach(div => {
        let r = stripDesc(div.querySelector('.rune-select').value);
        let i = stripDesc(div.querySelector('.insignia-select').value);
        
        if (runeCount > 0) {
            if (r) {
                if (r.startsWith("Rune of Vigor (minor, major, or superior)")) {
                    runes.push(`[Rune of Vigor](https://wiki.guildwars.com/wiki/Rune_of_Vigor)`);
                } else {
                    runes.push(makeLink(r));
                }
            } else {
                runes.push(`[Optional](https://wiki.guildwars.com/wiki/Optional)`);
            }
        }

        if (insigniaCount > 0) {
            if (i) insignias.push(makeLink(i));
            else insignias.push(`[Optional](https://wiki.guildwars.com/wiki/Optional)`);
        }
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

        if (pre && pre.includes('Anniversary')) return makeLink(pre);
        if (attr && attr.includes('Anniversary')) return makeLink(attr);

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
        if (combined.length > 0) validWeaponSets.push(combined.join(' — '));
    });

    if (validWeaponSets.length === 1) md += `**Weapon set**\n\n${validWeaponSets[0]}\n\n`;
    else if (validWeaponSets.length > 1) {
        md += `**Weapon sets**\n\n`;
        validWeaponSets.forEach((ws, idx) => md += `${idx + 1}) ${ws}\n\n`);
    }

    const buildNotes = document.getElementById('build-notes') ? document.getElementById('build-notes').value.trim() : '';
    if (buildNotes) md += `**Notes**\n\n${buildNotes}\n\n`;

    md += `---\n[Build Markdown Generator](https://guild-wars-tools.github.io/markdown-generator/)`;

    const outputString = md.trim();
    document.getElementById('output').value = outputString;
    copyBtn.style.display = outputString.length > 0 ? 'inline-block' : 'none';
});
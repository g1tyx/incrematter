"use strict"

var player = {
    currencies: {
        matter: new ExpantaNum("1544444440"),
        mattertotal: new ExpantaNum("0"), // All-time gained matter.
        highestmatter: new ExpantaNum("0"),  // Highest amount of matter you've ever gotten.
        spentmatter: new ExpantaNum("0")
    },

    generators: {
        normal: {
            1: {
                amnt: new ExpantaNum("0"),  // Amount.
                bght: new ExpantaNum("0"),  // Bought.
                mult: new ExpantaNum("1"),  // Multiplier.
                bost: new ExpantaNum("1"),  // Boost.
                cost: new ExpantaNum("10"), // Cost.
                icst: new ExpantaNum("10"), // Initial cost.
                visb: false,                // Visibility.
            },

            2: {
                amnt: new ExpantaNum("0"),
                bght: new ExpantaNum("0"),
                mult: new ExpantaNum("1"),
                bost: new ExpantaNum("1"),
                cost: new ExpantaNum("100"),
                icst: new ExpantaNum("100"),
                visb: false,
            },

            3: {
                amnt: new ExpantaNum("0"),
                bght: new ExpantaNum("0"),
                mult: new ExpantaNum("1"),
                bost: new ExpantaNum("1"),
                cost: new ExpantaNum("10000"),
                icst: new ExpantaNum("10000"),
                visb: false,
            },

            4: {
                amnt: new ExpantaNum("0"),
                bght: new ExpantaNum("0"),
                mult: new ExpantaNum("1"),
                bost: new ExpantaNum("1"),
                cost: new ExpantaNum("1e6"),
                icst: new ExpantaNum("1e6"),
                visb: false,
            },

            total: 4,                   // Number of generators.
            shown: [],                  // Array of all the shown generators.
            coloredgens: 0,             // Whether the generators are colored or not.
            boost: new ExpantaNum("1"), // A boost to all of the generators.
            cgbm: new ExpantaNum("1"),  // Current gen booster multiplier.
            pgbm: new ExpantaNum("1"),  // Pending gen booster multiplier.
            vgbm: false,                // Whether the gen booster multiplier button is visible or not.
        },
    },

    info: {
        sigdig: 3, // Significant digits (for scientific notation).
        lastUpdate: Date.now(), // Delta time related stuff.
        currentTab: {generators: true, options: false, statistics: false}, // For changing tabs.
    }
}

function init() { // This function only runs once when the page is loaded.
    for (let i = 1; i <= player.generators.normal.total; i++) { // This colors all the generators in a pastel-like color. The only thing that varies from generator to generator is the hue.
        if (player.generators.normal.coloredgens < player.generators.normal.total) {
            var gencol = "hsl(" + (45 * (i - 1) + 0) + ", 100%, 77%)"
            document.getElementById("ng" + i + "mu").style.color = gencol
            player.generators.normal.coloredgens += 1
        }
    }

    for (let i = 1; i < player.generators.normal.total; i++) {
        document.getElementById("ng" + i + "pps").style.display = "none"
    }
}

function buynormalgen(n) { // Function for buying normal generators
    if (ExpantaNum.gte(player.currencies.matter, player.generators.normal[n].cost)) {
        player.generators.normal[n].amnt = ExpantaNum.add(player.generators.normal[n].amnt, "1")
        player.generators.normal[n].bght = ExpantaNum.add(player.generators.normal[n].bght, "1")

        player.currencies.matter = ExpantaNum.sub(player.currencies.matter, player.generators.normal[n].cost)
        player.currencies.spentmatter = ExpantaNum.add(player.currencies.spentmatter, player.generators.normal[n].cost)
    }
}

function changeTab(tab) { // Changing tabs.
    for (const a in player.info.currentTab) {
        if (player.info.currentTab[a]) { // Make everything in the currentTab array false first.
            player.info.currentTab[a] = false
        }

        player.info.currentTab[tab] = true; // And then make the tab that you clicked true.
    }
}

function expimp(which) {
    if (which === 0) {
        var exp = btoa(JSON.stringify(player))
        navigator.clipboard.writeText(exp).then(() => {
            alert('Succesfully copied to clipboard.')
        })} else {
        var s = navigator.clipboard.readText().then(v => {
            player = JSON.parse(atob(v))
        })}
}

function multgen(factor, gen = null) {
    if (!gen) { 
        player.generators.normal.boost = ExpantaNum.mul(player.generators.normal.boost, factor)
    } else {
        console.log(gen)
        player.generators.normal[gen].bost = ExpantaNum.mul(player.generators.normal[gen].bost, factor)
    }
}

function genBooster() {
    multgen(ExpantaNum.div(player.generators.normal.pgbm, player.generators.normal.cgbm))
    player.generators.normal.cgbm = player.generators.normal.pgbm
    player.currencies.matter = new ExpantaNum("10")
    for (let i = 1; i <= player.generators.normal.total; i++) {
        player.generators.normal[i].bght = new ExpantaNum("0")
        player.generators.normal[i].amnt = new ExpantaNum("0")
    }
}

function format(a,  digits = player.info.sigdig - 1, b1kfixed = true) { // Formatting ExpantaNum numbers. "b1kfixed" means "below 1,000 fixed".
    if (!a.array[1]) {
        var a01 = a.array[0][1]
        if (a01 < 1e3) {
            if (b1kfixed == true) {
                return (a01.toFixed(digits)).toString()
            } else {
                return (a01.toString())
            }
        } else if (a01 < 1e9) {
            return (a01.toFixed(0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") // Formatting with commas.
        } else if (a01 < 1e15) {
            return (a01/Math.pow(10, Math.floor(Math.log10(a01)))).toFixed(player.info.sigdig).toString() + "e" + Math.floor(Math.log10(a01)).toString() 
        } else {
            return "> 1e15 or NaN"
        }
    }
}

function prodloop(diff) { //
    player.currencies.matter = ExpantaNum.add(player.currencies.matter, ExpantaNum.mul(player.generators.normal[1].amnt, player.generators.normal[1].mult).mul(diff))
    player.currencies.mattertotal = ExpantaNum.add(player.currencies.mattertotal, ExpantaNum.mul(player.generators.normal[1].amnt, player.generators.normal[1].mult).mul(diff))

    for (let i = 2; i <= player.generators.normal.total; i++) {
        player.generators.normal[i - 1].amnt = ExpantaNum.add(player.generators.normal[i - 1].amnt, ExpantaNum.mul(player.generators.normal[i].amnt, ExpantaNum.mul(player.generators.normal[i].mult, diff / 10)))
    }
}

function update() {
    for (let i = 1; i <= player.generators.normal.total; i++) {
        if (player.generators.normal[i].visb == false && ExpantaNum.gte(player.currencies.matter, ExpantaNum.div(player.generators.normal[i].icst, 2))) { // Generator visibility
            player.generators.normal[i].visb = true
            player.generators.normal.shown.push(i)
        }

        if (ExpantaNum.gte(player.currencies.matter, player.generators.normal[i].cost)) {
            document.getElementById("genBtn" + i).classList.remove("unbuyable")
        } else {
            document.getElementById("genBtn" + i).classList.add("unbuyable")
        }

        player.generators.normal[i].cost = ExpantaNum.pow(ExpantaNum.pow(100, i).mul(10), ExpantaNum.floor(ExpantaNum.div(player.generators.normal[i].bght, 10))).mul(player.generators.normal[i].icst)
        player.generators.normal[i].mult = (ExpantaNum.pow(2.25, ExpantaNum.floor(ExpantaNum.div(player.generators.normal[i].bght, 10)))).mul(ExpantaNum.mul(player.generators.normal.boost, player.generators.normal[i].bost))

        document.getElementById("ng" + i + "mu").style.transform = "skew(-5deg)"
        document.getElementById("ng" + i + "mu").style.display = "inline-block"
        document.getElementById("gen" + i).style.display = (player.generators.normal[i].visb) ? "revert" : "none"
        document.getElementById("ng" + i + "mu").innerHTML = format(player.generators.normal[i].mult, 3) + "x"
        document.getElementById("ng" + i + "am").innerHTML = format(player.generators.normal[i].amnt)
        document.getElementById("ng" + i + "bg").innerHTML = "[" + format(player.generators.normal[i].bght, false) + "]"
        document.getElementById("ng" + i + "pr").innerHTML = format(player.generators.normal[i].cost)
    }

    for (var i = 1; i < player.generators.normal.total; i++) {
        var shown2 = player.generators.normal.shown.slice(0)
        shown2.pop()
        var aps = ExpantaNum.mul(player.generators.normal[i+1].amnt, player.generators.normal[i+1].mult) // Amount per second.
        var genpercent = (ExpantaNum.gt(aps, 0)) ? ExpantaNum.div(aps, player.generators.normal[i].amnt).mul(10) : new ExpantaNum(0)

        document.getElementById("ng" + i + "pps").innerHTML = "(+" + format(genpercent) + "%/s)"
        
        if (shown2.length != 0) {
            for (const a in shown2) {
                document.getElementById("ng" + (shown2[a]) + "pps").style.display = "revert"
            }
        }
    }

    var ngen = player.generators.normal; // Just a little shortcut for line related to "nextgenmatter".
    player.generators.normal.vgbm ? document.getElementById('genboosterdiv').style.display = "revert" : document.getElementById('genboosterdiv').style.display = "none"

    if (ExpantaNum.gt(player.currencies.matter, player.currencies.highestmatter)) {
        player.currencies.highestmatter = player.currencies.matter
    }

    player.generators.normal.pgbm = ExpantaNum.max(ExpantaNum.div(player.currencies.matter, "1e4").pow(1/30), player.generators.normal.cgbm)

    if (ExpantaNum.gt(player.currencies.matter, "1e10")) {
        player.generators.normal.vgbm = true
    }

    document.getElementById("nextgenmatter").innerHTML = (player.generators.normal.shown.length < 4) ? "The next generator will show up when you get to " + format(ExpantaNum.div(ngen[ngen.shown[ngen.shown.length - 1] + 1].icst, 2), false) + " matter.": "All of the generators are visible."
    document.getElementById("matteramt").innerHTML = format(player.currencies.matter)
    document.getElementById("matterpersec").innerHTML = format((player.generators.normal[1].amnt).mul(player.generators.normal[1].mult))
    document.getElementById("allgainmatter").innerHTML = format(player.currencies.mattertotal)
    document.getElementById("highestmatter").innerHTML = format(player.currencies.highestmatter)
    document.getElementById("spentmatter").innerHTML = format(player.currencies.spentmatter, false)
    document.getElementById("currentgenbooster").innerHTML = format(player.generators.normal.cgbm, 3)
    document.getElementById("pendinggenbooster").innerHTML = format(player.generators.normal.pgbm, 3)
    document.getElementById("ratiogenbooster").innerHTML = format(ExpantaNum.div(player.generators.normal.pgbm, player.generators.normal.cgbm), 3)

    for (const a in player.info.currentTab) {
        document.getElementById(a + "Tab").style.display = (player.info.currentTab[a]) ? "revert" : "none"
    }
}

function mainloop() {
    let diff = (Date.now() - player.info.lastUpdate) / 1000
    
    prodloop(diff)
    update()

    player.info.lastUpdate = Date.now()
}

init()

window.setInterval(mainloop, 1000/60)

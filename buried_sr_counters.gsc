//https://github.com/Krule6/BO2-EE-Resources
#include maps\mp\_utility;
#include common_scripts\utility;
#include maps\mp\zombies\_zm_utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\gametypes_zm\_hud_message;

init()
{
    //dvars for counters
    set_dvar_int_if_unset("bofa_counter", 0);
    set_dvar_int_if_unset("vulture_counter", 0);
    set_dvar_int_if_unset("gsb_counter", 0);

    //dvars for perk counts
    set_dvar_int_if_unset("perk_count_0", 0);
    set_dvar_int_if_unset("perk_count_1", 0);
    set_dvar_int_if_unset("perk_count_2", 0);
    set_dvar_int_if_unset("perk_count_3", 0);
    set_dvar_int_if_unset("perk_count_4", 0);
    set_dvar_int_if_unset("perk_count_5", 0);

    //dvars to toggle hud
    set_dvar_int_if_unset("bofa_hud_enabled", 0);
    set_dvar_int_if_unset("vulture_hud_enabled", 0);
    set_dvar_int_if_unset("gsb_hud_enabled", 0);
    set_dvar_int_if_unset("perks_hud_enabled", 0);

    level waittill("connected", player);
    player thread buried_hud();
    player thread bofa_counter();
    player thread vulture_counter();
    player thread gsb_counter();
    player thread perk_counter();
    player thread chat_commands();
}

buried_hud()
{
    self endon("disconnect");

    self.bofa_visible    = getdvarint("bofa_hud_enabled");
    self.vulture_visible = getdvarint("vulture_hud_enabled");
    self.gsb_visible     = getdvarint("gsb_hud_enabled");
    self.perks_visible   = getdvarint("perks_hud_enabled");

    // Initialize perk tracking arrays
    self.perk_structs = [];
    self.perk_names   = [];
    self.perk_counts  = [];
    self.has_perk     = [];

    // Struct names
    self.perk_structs[self.perk_structs.size] = "specialty_armorvest";
    self.perk_structs[self.perk_structs.size] = "specialty_fastreload";
    self.perk_structs[self.perk_structs.size] = "specialty_rof";
    self.perk_structs[self.perk_structs.size] = "specialty_longersprint";
    self.perk_structs[self.perk_structs.size] = "specialty_additionalprimaryweapon";
    self.perk_structs[self.perk_structs.size] = "specialty_nomotionsensor";

    // Display names
    self.perk_names[self.perk_names.size] = "Juggernog";
    self.perk_names[self.perk_names.size] = "Speed Cola";
    self.perk_names[self.perk_names.size] = "Double Tap";
    self.perk_names[self.perk_names.size] = "Stamin-Up";
    self.perk_names[self.perk_names.size] = "Mule Kick";
    self.perk_names[self.perk_names.size] = "Vulture Aid";

    // Load saved counts from dvars
    for (i = 0; i < self.perk_structs.size; i++)
    {
        self.perk_counts[i] = getdvarint("perk_count_" + i);
        self.has_perk[i] = false;
    }

    self.bofa_hud = self createServerFontString("hudsmall", 1.20);
    self.bofa_counter_hud = self createServerFontString("hudsmall", 1.20);
    self.vulture_hud = self createServerFontString("hudsmall", 1.20);
    self.vulture_counter_hud = self createServerFontString("hudsmall", 1.20);
    self.gsb_hud = self createServerFontString("hudsmall", 1.20);
    self.gsb_counter_hud = self createServerFontString("hudsmall", 1.20);

    // bofa - adjust position based on vulture counter visibility
    bofa_y = self.vulture_visible ? 205 : 218;
    self.bofa_hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -406, bofa_y);
    self.bofa_hud.label = &"Bofa:";
    self.bofa_hud.color = (1, 0.8, 1);
    self.bofa_hud.hidewheninmenu = 1;

    self.bofa_counter_hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -390, bofa_y);
    self.bofa_counter_hud.color = (0.99, 0.91, 0.99);
    self.bofa_counter_hud.hidewheninmenu = 1;
    self.bofa_counter_hud SetValue(GetDvarInt("bofa_counter"));

    // vulture aid 
    self.vulture_hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -393, 218);
    self.vulture_hud.label = &"Vulture Aid:";
    self.vulture_hud.color = (1, 0.8, 1);
    self.vulture_hud.hidewheninmenu = 1;

    self.vulture_counter_hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -364, 218);
    self.vulture_counter_hud.color = (0.99, 0.91, 0.99);
    self.vulture_counter_hud.hidewheninmenu = 1;
    self.vulture_counter_hud SetValue(GetDvarInt("vulture_counter"));

    // game since bofa
    self.gsb_hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -381, 231);
    self.gsb_hud.label = &"Game Since Bofa:";
    self.gsb_hud.color = (1, 0.8, 1);
    self.gsb_hud.hidewheninmenu = 1;

    self.gsb_counter_hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -340, 231);
    self.gsb_counter_hud.color = (0.99, 0.91, 0.99);
    self.gsb_counter_hud.hidewheninmenu = 1;
    self.gsb_counter_hud SetValue(GetDvarInt("gsb_counter"));

    // Create perk HUD elements
    self.perk_hud = [];
    
    // Define colors for each perk
    perk_colors = [];
    perk_colors[0] = (1, 0.5, 0.5);    // Juggernog - Red/Pink
    perk_colors[1] = (0.5, 1, 0.6);    // Speed Cola - Green
    perk_colors[2] = (1, 0.6, 0.5);    // Double Tap - Golden Yellow
    perk_colors[3] = (1, 1, 0.5);      // Stamin-Up - Yellow
    perk_colors[4] = (0.5, 1, 0.5);    // Mule Kick - Lime Green
    perk_colors[5] = (1, 0.4, 0.5);    // Vulture Aid - Orange
    
    // Adjust perk HUD starting position based on vulture counter visibility
    perk_start_y = self.vulture_visible ? 122 : 130;
    
    for (i = 0; i < self.perk_names.size; i++)
    {
        hud = self createServerFontString("hudsmall", 1.20);
        hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -392, perk_start_y + (i * 14));
        hud.color = perk_colors[i];
        hud.alpha = 0;
        hud.hidewheninmenu = 1;
        hud.label = istring(self.perk_names[i] + ": ");

        self.perk_hud[i] = hud;
        self.perk_hud[i] SetValue(getdvarint("perk_count_" + i));
    }

    self set_all_hud_alpha(0);

    self thread hud_fade_function();
}

hud_fade_function()
{

    huds = [];

    if (self.bofa_visible)
    {
        huds[huds.size] = self.bofa_hud;
        huds[huds.size] = self.bofa_counter_hud;
    }

    if (self.vulture_visible)
    {
        huds[huds.size] = self.vulture_hud;
        huds[huds.size] = self.vulture_counter_hud;
    }

    if (self.gsb_visible)
    {
        huds[huds.size] = self.gsb_hud;
        huds[huds.size] = self.gsb_counter_hud;
    }

    if (self.perks_visible)
    {
        for (i = 0; i < self.perk_hud.size; i++)
        {
            // Skip Vulture Aid (index 5) if vulture counter is enabled
            if (i == 5 && self.vulture_visible)
                continue;
            
            huds[huds.size] = self.perk_hud[i];
        }
    }


    // fade in
    for (i = 0; i < huds.size; i++)
    {
        huds[i] FadeOverTime(0.3);
        huds[i].alpha = 1;
    }

    flag_wait("initial_blackscreen_passed");

    wait(5);

    // fade out
    for (i = 0; i < huds.size; i++)
    {
        huds[i] FadeOverTime(0.8);
        huds[i].alpha = 0;
    }
}

set_all_hud_alpha(value)
{
    self.bofa_hud.alpha = value;
    self.bofa_counter_hud.alpha = value;
    self.vulture_hud.alpha = value;
    self.vulture_counter_hud.alpha = value;
    self.gsb_hud.alpha = value;
    self.gsb_counter_hud.alpha = value;
    
    for (i = 0; i < self.perk_hud.size; i++)
    {
        self.perk_hud[i].alpha = value;
    }
}

chat_commands()
{
    flag_wait("initial_blackscreen_passed");

    while (true)
    {
        level waittill("say", message, player);

        switch (tolower(message))
        {
            case "bofa":
                self toggle_hud(self.bofa_hud, self.bofa_counter_hud, "bofa_hud_enabled", "bofa counter");
                break;

            case "vulture":
                self toggle_hud(self.vulture_hud, self.vulture_counter_hud, "vulture_hud_enabled", "vulture counter");
                break;

            case "gsb":
                self toggle_hud(self.gsb_hud, self.gsb_counter_hud, "gsb_hud_enabled", "game since bofa counter");
                break;

            case "perks":
                self toggle_perks_hud();
                break;
        }
    }
}

toggle_hud(hud, counter, dvar, name)
{
    enabled = !getdvarint(dvar);
    setdvar(dvar, enabled);

    if (enabled)
        self iprintln("^3" + name + " ^2ON ^7(run fast_restart to apply changes)");
    else
        self iprintln("^3" + name + " ^1OFF ^7(run fast_restart to apply changes)");
}

toggle_perks_hud()
{
    enabled = !getdvarint("perks_hud_enabled");
    setdvar("perks_hud_enabled", enabled);

    if (enabled)
        self iprintln("^3perk tracker ^2ON ^7(run fast_restart to apply changes)");
    else
        self iprintln("^3perk tracker ^1OFF ^7(run fast_restart to apply changes)");
}

bofa_counter()
{
    self endon("disconnect");
    flag_wait("initial_blackscreen_passed");
    wait(40);


    while (1)
    {
        has_paralyzer = self hasweapon("slowgun_zm");
        has_timebomb  = self hasweapon("time_bomb_zm");

        if (has_paralyzer && has_timebomb && !counter_increased)
        {
            setdvar("bofa_counter", getdvarint("bofa_counter") + 1);
            counter_increased = 1;
        }
        else if (!has_paralyzer || !has_timebomb)
        {
            counter_increased = 0;
        }

        wait(0.5);
    }
}

vulture_counter()
{
    self endon("disconnect");
    flag_wait("initial_blackscreen_passed");
    wait(40);


    while (1)
    {
        self waittill("perk_acquired");

        if (isdefined(self.perk_vulture) && self.perk_vulture.active && !self.has_vulture)
        {
            setdvar("vulture_counter", getdvarint("vulture_counter") + 1);
            self.has_vulture = true;
        }
        wait(0.5);
    }
}
gsb_counter()
{
    self endon("disconnect");
    flag_wait("initial_blackscreen_passed");
    wait(40);

    paralyzer = 0;
    timebomb = 0;
    counterincreased = 0;

    while (1)
    {
        if (self hasweapon("slowgun_zm"))
            paralyzer = 1;

        if (self hasweapon("time_bomb_zm"))
            timebomb = 1;

        if (paralyzer && timebomb)
        {
            setdvar("gsb_counter", 0);
            counterincreased = 0;
        }
        else if (!counterincreased)
        {
            setdvar("gsb_counter", getdvarint("gsb_counter") + 1);
            counterincreased = 1;
        }

        wait(0.5);
    }
}

perk_counter()
{
    self endon("disconnect");

    for (;;)
    {
        self waittill("perk_acquired");
        wait 0.05;

        for (i = 0; i < self.perk_structs.size; i++)
        {
            perk_struct = self.perk_structs[i];

            if (self hasPerk(perk_struct) && !self.has_perk[i])
            {
                self.perk_counts[i]++;
                self.has_perk[i] = true;
                setdvar("perk_count_" + i, self.perk_counts[i]);
                self.perk_hud[i] SetValue(getdvarint("perk_count_" + i));
            }
        }
    }
}



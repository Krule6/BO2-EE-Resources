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

    //dvars to toggle hud
    set_dvar_int_if_unset("bofa_hud_enabled", 0);
    set_dvar_int_if_unset("vulture_hud_enabled", 0);
    set_dvar_int_if_unset("gsb_hud_enabled", 0);

    level waittill("connected", player);
    player thread buried_hud();
    player thread bofa_counter();
    player thread vulture_counter();
    player thread gsb_counter();
    player thread chat_commands();
}

buried_hud()
{
    self endon("disconnect");

    self.bofa_visible    = getdvarint("bofa_hud_enabled");
    self.vulture_visible = getdvarint("vulture_hud_enabled");
    self.gsb_visible     = getdvarint("gsb_hud_enabled");

    self.bofa_hud = self createServerFontString("hudsmall", 1.20);
    self.bofa_counter_hud = self createServerFontString("hudsmall", 1.20);
    self.vulture_hud = self createServerFontString("hudsmall", 1.20);
    self.vulture_counter_hud = self createServerFontString("hudsmall", 1.20);
    self.gsb_hud = self createServerFontString("hudsmall", 1.20);
    self.gsb_counter_hud = self createServerFontString("hudsmall", 1.20);

    // bofa
    self.bofa_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -404.4, 199.5);
    self.bofa_hud.label = &"Bofa:";
    self.bofa_hud.color = (1, 0.8, 1);
    self.bofa_hud.hidewheninmenu = 1;

    self.bofa_counter_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -388.4, 199.5);
    self.bofa_counter_hud.color = (0.99, 0.91, 0.99);
    self.bofa_counter_hud.hidewheninmenu = 1;
    self.bofa_counter_hud SetValue(GetDvarInt("bofa_counter"));

    // vulture aid 
    self.vulture_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -390, 213.5);
    self.vulture_hud.label = &"Vulture Aid:";
    self.vulture_hud.color = (1, 0.8, 1);
    self.vulture_hud.hidewheninmenu = 1;

    self.vulture_counter_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -360, 213.5);
    self.vulture_counter_hud.color = (0.99, 0.91, 0.99);
    self.vulture_counter_hud.hidewheninmenu = 1;
    self.vulture_counter_hud SetValue(GetDvarInt("vulture_counter"));

    // game since bofa
    self.gsb_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -378, 227.5);
    self.gsb_hud.label = &"Game Since Bofa:";
    self.gsb_hud.color = (1, 0.8, 1);
    self.gsb_hud.hidewheninmenu = 1;

    self.gsb_counter_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -335, 227.5);
    self.gsb_counter_hud.color = (0.99, 0.91, 0.99);
    self.gsb_counter_hud.hidewheninmenu = 1;
    self.gsb_counter_hud SetValue(GetDvarInt("gsb_counter"));

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
                self toggle_hud(self.bofa_hud, self.bofa_counter_hud, "bofa_hud_enabled", "Bofa counter");
                break;

            case "vulture":
                self toggle_hud(self.vulture_hud, self.vulture_counter_hud, "vulture_hud_enabled", "Vulture Aid counter");
                break;

            case "gsb":
                self toggle_hud(self.gsb_hud, self.gsb_counter_hud, "gsb_hud_enabled", "Game since Bofa counter");
                break;
        }
    }
}

toggle_hud(hud, counter, dvar, name)
{
    enabled = !getdvarint(dvar);
    setdvar(dvar, enabled);

    if (enabled)
        self iprintln("^3" + name + " ^2ON ^7(Run fast_restart to apply changes)");
    else
        self iprintln("^3" + name + " ^1OFF ^7(Run fast_restart to apply changes)");
}

bofa_counter()
{
    self endon("disconnect");
    flag_wait("initial_blackscreen_passed");
    wait(40);
    counter_increased = 0;

    while(1)
    {
        has_paralyzer = self hasweapon("slowgun_zm"); 
        has_time_bomb = self hasweapon("time_bomb_zm");

        if (has_paralyzer && has_time_bomb && !counter_increased)
        {
            setdvar("bofa_counter", getdvarint("bofa_counter") + 1);

            counter_increased = 1;
        }
        else if (!has_paralyzer || !has_time_bomb)
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


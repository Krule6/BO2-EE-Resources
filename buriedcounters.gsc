//https://github.com/Krule6/BO2-EE-Resources
#include maps\mp\_utility;
#include common_scripts\utility;
#include maps\mp\zombies\_zm_utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\gametypes_zm\_hud_message;

init()
{
    set_dvar_int_if_unset("vulture_count", 0);
    set_dvar_int_if_unset("bofa_counter", 0);
    set_dvar_int_if_unset("gsb_counter", 0);

    level waittill("connected", player);

    player thread buried_hud();
    player thread vulture_counter();
    player thread bofa_counter();
    player thread gsb_counter();
}

buried_hud()
{
    self endon("disconnect");

    self.vulture_hud = self createServerFontString("hudsmall", 1.20);
    self.bofa_hud = self createServerFontString("hudsmall", 1.20);
    self.gsb_hud = self createServerFontString("hudsmall", 1.20);

    // vulture hud
    self.vulture_hud setpoint("BOTTOMLEFT", "BOTTOMLEFT", -300, 227.5); 
    self.vulture_hud.alpha = 1; 
    self.vulture_hud.color = (1, 0.8, 1); 
    self.vulture_hud.hidewheninmenu = 1;
    self.vulture_hud.label = &"Vulture Aid: ";
    self.vulture_hud SetValue(GetDvarInt("vulture_count"));

    // bofa hud
    self.bofa_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", 0, 227.5); 
    self.bofa_hud.alpha = 1;
    self.bofa_hud.color = (1, 0.8, 1); 
    self.bofa_hud.hidewheninmenu = 1;
    self.bofa_hud.label = &"Bofa: ";
    self.bofa_hud SetValue(GetDvarInt("bofa_counter"));

    // game since bofa hud
    self.gsb_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", 300, 227.5); 
    self.gsb_hud.alpha = 1;
    self.gsb_hud.color = (1, 0.8, 1); 
    self.gsb_hud.hidewheninmenu = 1;
    self.gsb_hud.label = &"Games Since Bofa: ";
    self.gsb_hud SetValue(GetDvarInt("gsb_counter"));
    
    flag_wait("initial_blackscreen_passed");
    wait(40);
    huds = [];
    huds[huds.size] = self.vulture_hud;
    huds[huds.size] = self.bofa_hud;
    huds[huds.size] = self.gsb_hud;

    for (i = 0; i < huds.size; i++)
    {
        if (isdefined(huds[i]))
            huds[i].alpha = 0;
    }
}

vulture_counter()
{
    self endon("disconnect");

    while (1)
    {
        self waittill("perk_acquired");

        if (isdefined(self.perk_vulture) && self.perk_vulture.active)
        {
            setdvar("vulture_count", getdvarint("vulture_count") + 1);
        }
    }
}

bofa_counter()
{
    self endon("disconnect");

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

gsb_counter()
{
    self endon("disconnect");
    flag_wait("initial_blackscreen_passed");
    wait(40);

    paralyzer = 0;
    timebomb = 0;
    counterincreased = 0;

    while(1)
    {
        if (self hasweapon("slowgun_zm"))
        {
            paralyzer = 1;
        }

        if (self hasweapon("time_bomb_zm"))
        {
            timebomb = 1;
        }

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

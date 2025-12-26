//https://github.com/Krule6/BO2-EE-Resources
#include maps\mp\_utility;
#include common_scripts\utility;
#include maps\mp\zombies\_zm_utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\gametypes_zm\_hud_message;

init()
{

    set_dvar_int_if_unset("bofa_counter", 0);
    set_dvar_int_if_unset("vulture_counter", 0);
    set_dvar_int_if_unset("gsb_counter", 0);

    level waittill("connected", player);

    player thread buried_hud();
    player thread bofa_counter();
    player thread vulture_counter();
    player thread gsb_counter();
}

buried_hud()
{
    self endon("disconnect");

    self.bofa_hud = self createServerFontString("hudsmall", 1.20);
    self.bofa_counter_hud = self createServerFontString("hudsmall", 1.20);
    self.vulture_hud = self createServerFontString("hudsmall", 1.20);
    self.vulture_counter_hud = self createServerFontString("hudsmall", 1.20);
    self.gsb_hud = self createServerFontString("hudsmall", 1.20);
    self.gsb_counter_hud = self createServerFontString("hudsmall", 1.20);

    // bofa hud
    self.bofa_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -404.4, 199.5);
    self.bofa_hud.alpha = 0;
    self.bofa_hud.color = (1, 0.8, 1); 
    self.bofa_hud.hidewheninmenu = 1;
    self.bofa_hud.label = &"Bofa:";
    // bofa counter hud
    self.bofa_counter_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -388.4, 199.5);
    self.bofa_counter_hud.alpha = 0;
    self.bofa_counter_hud.color = (0.99, 0.91, 0.99);
    self.bofa_counter_hud.hidewheninmenu = 1;
    self.bofa_counter_hud SetValue(GetDvarInt("bofa_counter"));

    // vulture hud
    self.vulture_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -390, 213.5);
    self.vulture_hud.alpha = 0;
    self.vulture_hud.color = (1, 0.8, 1);
    self.vulture_hud.hidewheninmenu = 1;
    self.vulture_hud.label = &"Vulture Aid:";
    // vulture counter hud
    self.vulture_counter_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -360, 213.5);
    self.vulture_counter_hud.alpha = 0;
    self.vulture_counter_hud.color = (0.99, 0.91, 0.99);
    self.vulture_counter_hud.hidewheninmenu = 1;
    self.vulture_counter_hud SetValue(GetDvarInt("vulture_counter"));

    // game since bofa hud
    self.gsb_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -378, 227.5);
    self.gsb_hud.alpha = 0;
    self.gsb_hud.color = (1, 0.8, 1);
    self.gsb_hud.hidewheninmenu = 1;
    self.gsb_hud.label = &"Game Since Bofa:";
    // game since bofa counter hud
    self.gsb_counter_hud setpoint("BOTTOMRIGHT", "BOTTOMRIGHT", -335, 227.5);
    self.gsb_counter_hud.alpha = 0;
    self.gsb_counter_hud.color = (0.99, 0.91, 0.99);
    self.gsb_counter_hud.hidewheninmenu = 1;
    self.gsb_counter_hud SetValue(GetDvarInt("gsb_counter"));

    //fade in/out
    huds = [];
    huds[huds.size] = self.bofa_hud;
    huds[huds.size] = self.bofa_counter_hud;
    huds[huds.size] = self.vulture_hud;
    huds[huds.size] = self.vulture_counter_hud;
    huds[huds.size] = self.gsb_hud;
    huds[huds.size] = self.gsb_counter_hud;

    for(i = 0; i < huds.size; i++)
    {
        if (isdefined(huds[i]))    
        huds[i] FadeOverTime(0.3);
        huds[i].alpha = 1;
    }

    flag_wait("initial_blackscreen_passed");
    //wait(40);
    wait (5);
    for (i = 0; i < huds.size; i++)
    {
        if (isdefined(huds[i]))       
            huds[i] FadeOverTime(0.8);
            huds[i].alpha = 0;
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

vulture_counter()
{
    self endon("disconnect");

    while (1)
    {
    self waittill("perk_acquired");

    if (isdefined(self.perk_vulture) && self.perk_vulture.active && !self.has_vulture)
    {
        setdvar("vulture_counter", getdvarint("vulture_counter") + 1);
        self.has_vulture = true;
    }
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
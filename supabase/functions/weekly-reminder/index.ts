import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEEKLY-REMINDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Weekly reminder function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Checking for weekly reminders");

    // Get all users who have weekly reminders enabled
    const { data: reminders, error: remindersError } = await supabaseClient
      .from('weekly_reminders')
      .select(`
        *,
        profiles!inner(user_id, display_name)
      `)
      .eq('enabled', true);

    if (remindersError) {
      logStep("Error fetching reminders", remindersError);
      throw remindersError;
    }

    logStep("Found reminders", { count: reminders?.length || 0 });

    if (!reminders || reminders.length === 0) {
      return new Response(JSON.stringify({ 
        message: "No weekly reminders scheduled for today",
        processed: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Process each user's weekly reminder
    const results = [];
    
    for (const reminder of reminders) {
      const userTimezone = reminder.timezone || 'Europe/Stockholm';
      
      // Get current time in user's timezone
      const now = new Date();
      const userDate = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
      const currentDay = userDate.getDay();
      const currentTime = userDate.toTimeString().slice(0, 8);
      
      // Check if it's the right day and time for this user
      const reminderTime = reminder.time_of_day;
      const isRightDay = currentDay === reminder.day_of_week;
      const isRightTime = currentTime >= reminderTime && currentTime < reminderTime.replace(/(\d{2}):(\d{2})/, (_: string, h: string, m: string) => {
        const hour = parseInt(h);
        const minute = parseInt(m) + 30; // 30 minute window
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      });

      if (!isRightDay || !isRightTime) {
        logStep("Skipping reminder - not the right time", { 
          userId: reminder.user_id, 
          userTimezone,
          currentDay,
          expectedDay: reminder.day_of_week,
          currentTime,
          expectedTime: reminderTime,
          isRightDay,
          isRightTime
        });
        continue;
      }

      logStep("Processing reminder for user", { 
        userId: reminder.user_id, 
        userTimezone,
        localTime: userDate.toLocaleString('sv-SE', { timeZone: userTimezone })
      });

      // Get upcoming birthdays for the next 7 days
      const { data: contacts, error: contactsError } = await supabaseClient
        .from('contacts')
        .select('*')
        .eq('user_id', reminder.user_id);

      if (contactsError) {
        logStep("Error fetching contacts", contactsError);
        continue;
      }

      // Filter contacts with birthdays in the next 7 days
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const upcomingBirthdays = contacts?.filter(contact => {
        const birthday = new Date(contact.birthday);
        const currentYear = today.getFullYear();
        birthday.setFullYear(currentYear);
        
        // If birthday has passed this year, check next year
        if (birthday < today) {
          birthday.setFullYear(currentYear + 1);
        }
        
        return birthday >= today && birthday <= nextWeek;
      }) || [];

      logStep("Found upcoming birthdays", { 
        userId: reminder.user_id, 
        count: upcomingBirthdays.length 
      });

      if (upcomingBirthdays.length > 0) {
        // Here we would normally send an email or push notification
        // For now, we'll just log the reminder
        
        const birthdayList = upcomingBirthdays.map(contact => {
          const birthday = new Date(contact.birthday);
          const currentYear = today.getFullYear();
          birthday.setFullYear(currentYear);
          if (birthday < today) {
            birthday.setFullYear(currentYear + 1);
          }
          
          // Get yearly message if available, fallback to custom_message
          const yearForBirthday = birthday.getFullYear();
          let message = "Grattis på födelsedagen! 🎉 Hoppas du får en fantastisk dag! 🎂";
          
          if (contact.yearly_messages && contact.yearly_messages[yearForBirthday.toString()]) {
            message = contact.yearly_messages[yearForBirthday.toString()];
          } else if (contact.custom_message) {
            message = contact.custom_message;
          }
          
          return {
            name: contact.name,
            date: birthday.toLocaleDateString('sv-SE'),
            phone: contact.phone,
            hasPhone: !!contact.phone,
            message: message
          };
        });

        results.push({
          userId: reminder.user_id,
          displayName: reminder.profiles?.display_name,
          upcomingCount: upcomingBirthdays.length,
          birthdays: birthdayList
        });

        logStep("Weekly reminder prepared", {
          userId: reminder.user_id,
          birthdayCount: upcomingBirthdays.length
        });
      }
    }

    return new Response(JSON.stringify({ 
      message: "Weekly reminders processed successfully",
      processed: results.length,
      reminders: results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in weekly-reminder", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
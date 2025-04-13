create or replace function get_number_of_feedback_messages() 
returns table (positive_feedback_mex integer, negative_feedback_mex integer, neutral_feedback_mex integer) as $$
begin
    return query
select 
    count(case when feedback_check::int = 0 and feedback_text is not null then 1 end)::int as negative_feedback_mex,
    count(case when feedback_check::int = 1 and feedback_text is not null then 1 end)::int as positive_feedback_mex,
    count(case when (feedback_check::int = 0 and feedback_text is null) or (feedback_check::int = 1 and feedback_text is null) then 1 end)::int as neutral_feedback_mex
 
from 
    messaggio;
end;
$$ language plpgsql;

create or replace function get_number_of_feedbacks() 
returns table(week_number integer, positive_feedback integer, negative_feedback integer) as $$
begin
    return query
    with FirstFeed as (
    select min(createdat) as FirstFeedback
    from messaggio
),
FeedbackWeek as (
    select 
        createdat,
        feedback_check,
        floor((extract(epoch from (createdat - (select FirstFeedback from FirstFeed))) / (7 * 86400)) + 1)::int as FeedNumber
    from 
        messaggio
)
select 
    FeedNumber as NumberOfWeek,
    count(case when feedback_check::int = 0 then 1 end)::int as negative_feedback,
    count(case when feedback_check::int = 1 then 1 end)::int as positive_feedback 
from 
    FeedbackWeek
group by 
    FeedNumber
order by 
    FeedNumber asc;
end;
$$ language plpgsql;

create or replace function get_messages_per_week()
returns table(numberofweek bigint, numberofmessages bigint) as $$
begin
    return query
    with FirstDate as (
    select min(createdat) as FirstDateMessage
    from messaggio
),
MessageWeek as (
    select 
        createdat,
        floor((extract(epoch from (createdat - (select FirstDateMessage from FirstDate))) / (7 * 86400)) + 1)::bigint as WeekNumber
    FROM 
        messaggio
)
select 
    WeekNumber as NumberOfWeek,
    count(*) as NumberOfMessages
from 
    MessageWeek
group by 
    WeekNumber
order by 
    WeekNumber;
end;
$$ language plpgsql;
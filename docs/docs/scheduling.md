# Task Scheduling
[[toc]]

## Introduction

In the past, you may have written a cron configuration entry for each task you needed to schedule on your server. However, this can quickly become a pain because your task schedule is no longer in source control and you must SSH into your server to view your existing cron entries or add additional entries.

Hypervel's command scheduler offers a fresh approach to managing scheduled tasks on your server. The scheduler allows you to fluently and expressively define your command schedule within your Hypervel application itself. When using the scheduler, only a single cron entry is needed on your server. Your task schedule is defined in the `app/Console/Kernel.php` file's `schedule` method. To help you get started, a simple example is defined within the method.

## Defining Schedules

You may define all of your scheduled tasks in the `schedule` method of your application's `App\Console\Kernel` class. To get started, let's take a look at an example. In this example, we will schedule a closure to be called every day at midnight. Within the closure we will execute a database query to clear a table:

```php
<?php

namespace App\Console;

use Hypervel\Console\Scheduling\Schedule;
use Hypervel\Foundation\Console\Kernel as ConsoleKernel;
use Hypervel\Support\Facades\DB;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $schedule->call(function () {
            DB::table('recent_users')->delete();
        })->daily();
    }
}
```

In addition to scheduling using closures, you may also schedule [invokable objects](https://secure.php.net/manual/en/language.oop5.magic.php#object.invoke). Invokable objects are simple PHP classes that contain an `__invoke` method:

```php
$schedule->call(new DeleteRecentUsers)->daily();
```

If you would like to view an overview of your scheduled tasks and the next time they are scheduled to run, you may use the `schedule:list` Artisan command:

```bash
php artisan schedule:list
```

### Scheduling Artisan Commands

In addition to scheduling closures, you may also schedule [Artisan commands](/docs/artisan) and system commands. For example, you may use the `command` method to schedule an Artisan command using either the command's name or class.

When scheduling Artisan commands using the command's class name, you may pass an array of additional command-line arguments that should be provided to the command when it is invoked:

```php
use App\Console\Commands\SendEmailsCommand;

$schedule->command('emails:send Taylor --force')->daily();

$schedule->command(SendEmailsCommand::class, ['Taylor', '--force'])->daily();
```

### Scheduling Queued Jobs

The `job` method may be used to schedule a [queued job](/docs/queues). This method provides a convenient way to schedule queued jobs without using the `call` method to define closures to queue the job:

```php
use App\Jobs\Heartbeat;

$schedule->job(new Heartbeat)->everyFiveMinutes();
```

Optional second and third arguments may be provided to the `job` method which specifies the queue name and queue connection that should be used to queue the job:

```php
use App\Jobs\Heartbeat;

// Dispatch the job to the "heartbeats" queue on the "sqs" connection...
$schedule->job(new Heartbeat, 'heartbeats', 'sqs')->everyFiveMinutes();
```

### Scheduling Shell Commands

The `exec` method may be used to issue a command to the operating system:

```php
$schedule->exec('node /home/forge/script.js')->daily();
```

### Schedule Frequency Options

We've already seen a few examples of how you may configure a task to run at specified intervals. However, there are many more task schedule frequencies that you may assign to a task:

<div class="overflow-auto">

Method  | Description
------------- | -------------
`->cron('* * * * *');`  |  Run the task on a custom cron schedule
`->everySecond();`  |  Run the task every second
`->everyTwoSeconds();`  |  Run the task every two seconds
`->everyFiveSeconds();`  |  Run the task every five seconds
`->everyTenSeconds();`  |  Run the task every ten seconds
`->everyFifteenSeconds();`  |  Run the task every fifteen seconds
`->everyTwentySeconds();`  |  Run the task every twenty seconds
`->everyThirtySeconds();`  |  Run the task every thirty seconds
`->everyMinute();`  |  Run the task every minute
`->everyTwoMinutes();`  |  Run the task every two minutes
`->everyThreeMinutes();`  |  Run the task every three minutes
`->everyFourMinutes();`  |  Run the task every four minutes
`->everyFiveMinutes();`  |  Run the task every five minutes
`->everyTenMinutes();`  |  Run the task every ten minutes
`->everyFifteenMinutes();`  |  Run the task every fifteen minutes
`->everyThirtyMinutes();`  |  Run the task every thirty minutes
`->hourly();`  |  Run the task every hour
`->hourlyAt(17);`  |  Run the task every hour at 17 minutes past the hour
`->everyOddHour($minutes = 0);`  |  Run the task every odd hour
`->everyTwoHours($minutes = 0);`  |  Run the task every two hours
`->everyThreeHours($minutes = 0);`  |  Run the task every three hours
`->everyFourHours($minutes = 0);`  |  Run the task every four hours
`->everySixHours($minutes = 0);`  |  Run the task every six hours
`->daily();`  |  Run the task every day at midnight
`->dailyAt('13:00');`  |  Run the task every day at 13:00
`->twiceDaily(1, 13);`  |  Run the task daily at 1:00 & 13:00
`->twiceDailyAt(1, 13, 15);`  |  Run the task daily at 1:15 & 13:15
`->weekly();`  |  Run the task every Sunday at 00:00
`->weeklyOn(1, '8:00');`  |  Run the task every week on Monday at 8:00
`->monthly();`  |  Run the task on the first day of every month at 00:00
`->monthlyOn(4, '15:00');`  |  Run the task every month on the 4th at 15:00
`->twiceMonthly(1, 16, '13:00');`  |  Run the task monthly on the 1st and 16th at 13:00
`->lastDayOfMonth('15:00');` | Run the task on the last day of the month at 15:00
`->quarterly();` |  Run the task on the first day of every quarter at 00:00
`->quarterlyOn(4, '14:00');` |  Run the task every quarter on the 4th at 14:00
`->yearly();`  |  Run the task on the first day of every year at 00:00
`->yearlyOn(6, 1, '17:00');`  |  Run the task every year on June 1st at 17:00
`->timezone('America/New_York');` | Set the timezone for the task

</div>

These methods may be combined with additional constraints to create even more finely tuned schedules that only run on certain days of the week. For example, you may schedule a command to run weekly on Monday:

```php
// Run once per week on Monday at 1 PM...
$schedule->call(function () {
    // ...
})->weekly()->mondays()->at('13:00');

// Run hourly from 8 AM to 5 PM on weekdays...
$schedule->command('foo')
    ->weekdays()
    ->hourly()
    ->timezone('America/Chicago')
    ->between('8:00', '17:00');
```

A list of additional schedule constraints may be found below:

<div class="overflow-auto">

Method  | Description
------------- | -------------
`->weekdays();`  |  Limit the task to weekdays
`->weekends();`  |  Limit the task to weekends
`->sundays();`  |  Limit the task to Sunday
`->mondays();`  |  Limit the task to Monday
`->tuesdays();`  |  Limit the task to Tuesday
`->wednesdays();`  |  Limit the task to Wednesday
`->thursdays();`  |  Limit the task to Thursday
`->fridays();`  |  Limit the task to Friday
`->saturdays();`  |  Limit the task to Saturday
`->days(array\|mixed);`  |  Limit the task to specific days
`->between($startTime, $endTime);`  |  Limit the task to run between start and end times
`->unlessBetween($startTime, $endTime);`  |  Limit the task to not run between start and end times
`->when(Closure);`  |  Limit the task based on a truth test
`->environments($env);`  |  Limit the task to specific environments

</div>

#### Day Constraints

The `days` method may be used to limit the execution of a task to specific days of the week. For example, you may schedule a command to run hourly on Sundays and Wednesdays:

```php
$schedule->command('emails:send')
    ->hourly()
    ->days([0, 3]);
```

Alternatively, you may use the constants available on the `Hypervel\Console\Scheduling\Schedule` class when defining the days on which a task should run:

```php
use Hypervel\Console\Scheduling\Schedule;

$schedule->command('emails:send')
    ->hourly()
    ->days([Schedule::SUNDAY, Schedule::WEDNESDAY]);
```

#### Between Time Constraints

The `between` method may be used to limit the execution of a task based on the time of day:

```php
$schedule->command('emails:send')
    ->hourly()
    ->between('7:00', '22:00');
```

Similarly, the `unlessBetween` method can be used to exclude the execution of a task for a period of time:

```php
$schedule->command('emails:send')
    ->hourly()
    ->unlessBetween('23:00', '4:00');
```

#### Truth Test Constraints

The `when` method may be used to limit the execution of a task based on the result of a given truth test. In other words, if the given closure returns `true`, the task will execute as long as no other constraining conditions prevent the task from running:

```php
$schedule->command('emails:send')->daily()->when(function () {
    return true;
});
```

The `skip` method may be seen as the inverse of `when`. If the `skip` method returns `true`, the scheduled task will not be executed:

```php
$schedule->command('emails:send')->daily()->skip(function () {
    return true;
});
```

When using chained `when` methods, the scheduled command will only execute if all `when` conditions return `true`.

#### Environment Constraints

The `environments` method may be used to execute tasks only on the given environments (as defined by the `APP_ENV` [environment variable](/docs/configuration#environment-configuration)):

```php
$schedule->command('emails:send')
    ->daily()
    ->environments(['staging', 'production']);
```

### Timezones

Using the `timezone` method, you may specify that a scheduled task's time should be interpreted within a given timezone:

```php
$schedule->command('report:generate')
    ->timezone('America/New_York')
    ->at('2:00')
```

If you are repeatedly assigning the same timezone to all of your scheduled tasks, you may wish to define a `scheduleTimezone` method in your `App\Console\Kernel` class. This method should return the default timezone that should be assigned to all scheduled tasks:

```php
use DateTimeZone;

/**
 * Get the timezone that should be used by default for scheduled events.
 */
protected function scheduleTimezone(): DateTimeZone|string|null
{
    return 'America/Chicago';
}
```

::: warning
Remember that some timezones utilize daylight savings time. When daylight saving time changes occur, your scheduled task may run twice or even not run at all. For this reason, we recommend avoiding timezone scheduling when possible.
:::

### Preventing Task Overlaps

By default, scheduled tasks will be run even if the previous instance of the task is still running. To prevent this, you may use the `withoutOverlapping` method:

```php
$schedule->command('emails:send')->withoutOverlapping();
```

In this example, the `emails:send` [Artisan command](/docs/artisan) will be run every minute if it is not already running. The `withoutOverlapping` method is especially useful if you have tasks that vary drastically in their execution time, preventing you from predicting exactly how long a given task will take.

If needed, you may specify how many minutes must pass before the "without overlapping" lock expires. By default, the lock will expire after 24 hours:

```php
$schedule->command('emails:send')->withoutOverlapping(10);
```

Behind the scenes, the `withoutOverlapping` method utilizes your application's [cache](/docs/cache) to obtain locks. If necessary, you can clear these cache locks using the `schedule:clear-cache` Artisan command. This is typically only necessary if a task becomes stuck due to an unexpected server problem.

### Running Tasks on One Server

::: warning
To utilize this feature, your application must be using the `database`, `memcached`, `dynamodb`, or `redis` cache driver as your application's default cache driver. In addition, all servers must be communicating with the same central cache server.
:::

If your application's scheduler is running on multiple servers, you may limit a scheduled job to only execute on a single server. For instance, assume you have a scheduled task that generates a new report every Friday night. If the task scheduler is running on three worker servers, the scheduled task will run on all three servers and generate the report three times. Not good!

To indicate that the task should run on only one server, use the `onOneServer` method when defining the scheduled task. The first server to obtain the task will secure an atomic lock on the job to prevent other servers from running the same task at the same time:

```php
$schedule->command('report:generate')
    ->fridays()
    ->at('17:00')
    ->onOneServer();
```

#### Naming Single Server Jobs

Sometimes you may need to schedule the same job to be dispatched with different parameters, while still instructing Hypervel to run each permutation of the job on a single server. To accomplish this, you may assign each schedule definition a unique name via the `name` method:

```php
$schedule->job(new CheckUptime('https://hypervel.org'))
    ->name('check_uptime:hypervel.org')
    ->everyFiveMinutes()
    ->onOneServer();

$schedule->job(new CheckUptime('https://hypervel.org'))
    ->name('check_uptime:hypervel.org')
    ->everyFiveMinutes()
    ->onOneServer();
```

Similarly, scheduled closures must be assigned a name if they are intended to be run on one server:

```php
$schedule->call(fn () => User::resetApiRequestCount())
    ->name('reset-api-request-count')
    ->daily()
    ->onOneServer();
```

### Background Tasks

By default, multiple tasks scheduled at the same time will execute sequentially based on the order they are defined in your `schedule` method. If you have long-running tasks, this may cause subsequent tasks to start much later than anticipated. If you would like to run tasks in the background so that they may all run simultaneously, you may use the `runInBackground` method:

```php
$schedule->command('analytics:report')
    ->daily()
    ->runInBackground();
```

::: warning
The `runInBackground` method may only be used when scheduling tasks via the `command` and `exec` methods.
:::

::: info
Unlike in Laravel, all the background tasks are executed in coroutines. It's much more efficient when you need to run many background tasks simultaneously in intensive I/O scenes.
:::

## Running the Scheduler

Now that we have learned how to define scheduled tasks, let's discuss how to actually run them on our server. The `schedule:run` Artisan command will evaluate all of your scheduled tasks and determine if they need to run based on the server's current time.

So, when using Hypervel's scheduler, we only need to run the `schedule:run` command and a scheduler will be running and waiting for the upcoming scheduling tasks constantly.

```shell
php artisan schedule:run
```

::: warning
In Laravel, `schedule:run` is designed for running in system's cron jobs. However, in Hypervel it's designed as a long-running process.
:::


If you prefer to run the scheduler in traditional system's scheduler, you can also add a single cron configuration entry to our server that runs the `schedule:run --once` command every minute.

```shell
* * * * * cd /path-to-your-project && php artisan schedule:run --once >> /dev/null 2>&1
```

#### Concurrent Processing in the Scheduler

Different from Laravel, all the background processes will be executed in coroutines instead of processes. The majority of background processing is I/O bound scenario. Running in tasks in coroutines is much more efficient than processes.

By default the concurrency number for coroutines is set to `60`, which means you can have 60 running coroutines at the same time. You can configure this number when you run the scheduling command:

```shell:no-line-numbers
php artisan schedule:run --concurrency=100
```

For CPU-bound queue jobs, coroutines offer limited performance benefits. You can run these tasks using system commands using `exec`, then the task will be executed in a new background process:

```php
$schedule->exec('php artisan calculate-command')
    ->runInBackground();
```

### Sub-Minute Scheduled Tasks

On most operating systems, cron jobs are limited to running a maximum of once per minute. However, Hypervel's scheduler allows you to schedule tasks to run at more frequent intervals, even as often as once per second:

```php
$schedule->call(function () {
    DB::table('recent_users')->delete();
})->everySecond();
```

### Stopping Tasks

As the `schedule:run` command runs constantly for handling upcoming tasks, you may sometimes need to stop the command when deploying your application.

To stop in-progress `schedule:run` invocations, you may add the `schedule:stop` command to your application's deployment script. This command should be invoked after your application is finished deploying:

```shell
php artisan schedule:stop
```

After receiving a stop signal, the scheduler will wait for unfinished tasks to complete before exiting.

## Task Output

The Hypervel scheduler provides several convenient methods for working with the output generated by scheduled tasks. First, using the `sendOutputTo` method, you may send the output to a file for later inspection:

```php
$schedule->command('emails:send')
    ->daily()
    ->sendOutputTo($filePath);
```

If you would like to append the output to a given file, you may use the `appendOutputTo` method:

```php
$schedule->command('emails:send')
    ->daily()
    ->appendOutputTo($filePath);
```

Using the `emailOutputTo` method, you may email the output to an email address of your choice. Before emailing the output of a task, you should configure Hypervel's [email services](/docs/mail):

```php
$schedule->command('report:generate')
    ->daily()
    ->sendOutputTo($filePath)
    ->emailOutputTo('taylor@example.com');
```

If you only want to email the output if the scheduled Artisan or system command terminates with a non-zero exit code, use the `emailOutputOnFailure` method:

```php
$schedule->command('report:generate')
    ->daily()
    ->emailOutputOnFailure('taylor@example.com');
```

::: warning
The `emailOutputTo`, `emailOutputOnFailure`, `sendOutputTo`, and `appendOutputTo` methods are exclusive to the `command` and `exec` methods.
:::

## Task Hooks

Using the `before` and `after` methods, you may specify code to be executed before and after the scheduled task is executed:

```php
$schedule->command('emails:send')
    ->daily()
    ->before(function () {
        // The task is about to execute...
    })
    ->after(function () {
        // The task has executed...
    });
```

The `onSuccess` and `onFailure` methods allow you to specify code to be executed if the scheduled task succeeds or fails. A failure indicates that the scheduled Artisan or system command terminated with a non-zero exit code:

```php
$schedule->command('emails:send')
    ->daily()
    ->onSuccess(function () {
        // The task succeeded...
    })
    ->onFailure(function () {
        // The task failed...
    });
```

If output is available from your command, you may access it in your `after`, `onSuccess` or `onFailure` hooks by type-hinting an `Hypervel\Support\Stringable` instance as the `$output` argument of your hook's closure definition:

```php
use Hypervel\Support\Stringable;

$schedule->command('emails:send')
    ->daily()
    ->onSuccess(function (Stringable $output) {
        // The task succeeded...
    })
    ->onFailure(function (Stringable $output) {
        // The task failed...
    });
```

#### Pinging URLs

Using the `pingBefore` and `thenPing` methods, the scheduler can automatically ping a given URL before or after a task is executed. This method is useful for notifying an external service, such as [Healthchecks](https://healthchecks.io/), that your scheduled task is beginning or has finished execution:

```php
$schedule->command('emails:send')
    ->daily()
    ->pingBefore($url)
    ->thenPing($url);
```

The `pingBeforeIf` and `thenPingIf` methods may be used to ping a given URL only if a given condition is `true`:

```php
$schedule->command('emails:send')
    ->daily()
    ->pingBeforeIf($condition, $url)
    ->thenPingIf($condition, $url);
```

The `pingOnSuccess` and `pingOnFailure` methods may be used to ping a given URL only if the task succeeds or fails. A failure indicates that the scheduled Artisan or system command terminated with a non-zero exit code:

```php
$schedule->command('emails:send')
    ->daily()
    ->pingOnSuccess($successUrl)
    ->pingOnFailure($failureUrl);
```

All of the ping methods require the Guzzle HTTP library. Guzzle is typically installed in all new Hypervel projects by default, but, you may manually install Guzzle into your project using the Composer package manager if it has been accidentally removed:

```shell
composer require guzzlehttp/guzzle
```

## Events

If needed, you may listen to [events](/docs/events) dispatched by the scheduler. Typically, event listener mappings will be defined within your application's `App\Providers\EventServiceProvider` class:

```php
/**
 * The event listener mappings for the application.
 */
protected array $listen = [
    'Hypervel\Console\Events\ScheduledTaskStarting' => [
        'App\Listeners\LogScheduledTaskStarting',
    ],

    'Hypervel\Console\Events\ScheduledTaskFinished' => [
        'App\Listeners\LogScheduledTaskFinished',
    ],

    'Hypervel\Console\Events\ScheduledTaskSkipped' => [
        'App\Listeners\LogScheduledTaskSkipped',
    ],

    'Hypervel\Console\Events\ScheduledTaskFailed' => [
        'App\Listeners\LogScheduledTaskFailed',
    ],
];
```
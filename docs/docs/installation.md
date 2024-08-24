## Creating a Laravel Hyperf Project

Before creating your first Laravel Hyperf project, make sure that your local machine has [Composer](https://getcomposer.org/) installed for dependencies management, and the Swoole PHP extension must be installed as well. Typically, this can be done via PECL:

```shell:no-line-numbers
pecl install swoole
```

::: info
You can also use [Box](https://hyperf.wiki/3.1/#/en/eco/box.md) as your runtime environment.
:::

After you have installed PHP, Composer and Swoole extension, you may create a new Laravel Hyperf project via Composer's `create-project` command:

```shell:no-line-numbers
composer create-project swooletw/laravel-hyperf example-app
```

Once the project has been created, start Laravel Hyperf's local development server using Artisan's serve command:

```shell:no-line-numbers
cd example-app

php hyperf serve
```

Because all the files will be kept in the memory after running, you need to restart server after you make file changes. In development, you can use hot reload command:

```shell:no-line-numbers
php hyperf server:watch
```
::: tip
Laravel Hyperf provides `artisan` as an alias for the command entry point. You can use `php artisan {command}` to execute your commands, just like in Laravel.

For example, to start the server, you can run:

```shell:no-line-numbers
php artisan serve
```
:::

Once you have started the HTTP server, your application will be accessible in your web browser at [http://localhost:9501](http://localhost:9501). Next, you're ready to start taking your next steps into Laravel Hyperf.

::: tip
You can customize your `host` and `port` and other server options in `config/server.php`.
:::

## Initial Configuration

All of the configuration files for the Laravel Hyperf are stored in the config directory. Each option is documented, so feel free to look through the files and get familiar with the options available to you.

You may wish to review the `config/app.php` file and its documentation. It contains several options such as `timezone` and `locale` that you may wish to change according to your application.

## Environment Based Configuration

Since many of Laravel Hyperf's configuration option values may vary depending on whether your application is running on your local machine or on a production web server, many important configuration values are defined using the `.env` file that exists at the root of your application.

Your `.env` file should not be committed to your application's source control, since each developer / server using your application could require a different environment configuration. Furthermore, this would be a security risk in the event an intruder gains access to your source control repository, since any sensitive credentials would be exposed.

::: note
For more information about the `.env` file and environment based configuration, check out the full [configuration documentation](/docs/configuration.html#environment-configuration).
:::

## Databases and Migrations

Now that you have created your Laravel Hyperf application, you probably want to store some data in a database. By default, your application's `.env` configuration file specifies that Laravel will be interacting with a SQLite database.

During the creation of the project, Laravel created a `database/database.sqlite` file for you, and ran the necessary migrations to create the application's database tables.

If you prefer to use another database driver such as MySQL, you can update your `.env` configuration file to use the appropriate database. For example, if you wish to use MySQL, update your `.env` configuration file's `DB_*` variables like so:

```shell:no-line-numbers
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_hyperf
DB_USERNAME=root
DB_PASSWORD=
```

If you choose to use a database other than SQLite, you will need to create the database and run your application's [database migrations](/docs/migrations.html):

```shell:no-line-numbers
php hyperf migrate
```

## Developing with Docker

If your environment doesn't meet Hyperf's requirements or you're unfamiliar with system configuration, you can develop your Hyperf project using Docker:

- Run Container

In the following example the host will be mapped to the local directory `/workspace/laravel-hyperf`:

::: note
If the `selinux-enabled` option is enabled when docker starts, access to host resources in the container will be restricted, so you should add the `--privileged -u root` option when starting the container.
:::

```shell:no-line-numbers
docker run --name hyperf \
-v /workspace/laravel-hyperf:/data/project \
-p 9501:9501 -it \
--privileged -u root \
--entrypoint /bin/sh \
hyperf/hyperf:8.3-alpine-v3.19-swoole-v5
```

::: note
If docker's selinux-enabled option is on, add `--privileged -u root` to the command.
:::

## Incompatible extensions

Because Hyperf is based on Swoole's unprecedented coroutine functionality many extensions are incompatible, the following (including but not limited to) extensions are currently incompatible:

- xhprof
- xdebug (It's available in PHP 8.1+ and Swoole >= 5.0.2)
- blackfire
- trace
- uopz
# Eloquent: Factories
[[toc]]

## Introduction

When testing your application or seeding your database, you may need to insert a few records into your database. Instead of manually specifying the value of each column, Laravel allows you to define a set of default attributes for each of your [Eloquent models](/docs/eloquent) using model factories.

To see an example of how to write a factory, take a look at the `database/factories/UserFactory.php` file in your application. This factory is included with all new Laravel applications and contains the following factory definition:

## Generating Factories

To create a factory, use the `make:factory` [Artisan command](/docs/artisan):

```shell:no-line-numbers
php artisan make:factory PostFactory
```

The new factory will be placed in your `database/factories` directory.

The `--model` option may be used to indicate the name of the model created by the factory. This option will pre-fill the generated factory file with the given model:

```php
php artisan make:factory PostFactory --model=Post
```

## Writing Factories

When testing, you may need to insert a few records into your database before executing your test. Instead of manually specifying the value of each column when you create this test data, Laravel allows you to define a default set of attributes for each of your [Eloquent models](/docs/eloquent) using model factories. To get started, take a look at the `database/factories/UserFactory.php` file in your application. Out of the box, this file contains one factory definition:

```php
use Faker\Generator as Faker;
use Hypervel\Support\Str;

$factory->define(App\User::class, function (Faker $faker) {
    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'email_verified_at' => now(),
        'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        'remember_token' => Str::random(10),
    ];
});
```

Within the Closure, which serves as the factory definition, you may return the default test values of all attributes on the model. The Closure will receive an instance of the [Faker](https://github.com/fzaninotto/Faker) PHP library, which allows you to conveniently generate various kinds of random data for testing.

You may also create additional factory files for each model for better organization. For example, you could create `UserFactory.php` and `CommentFactory.php` files within your `database/factories` directory. All of the files within the `factories` directory will automatically be loaded by Laravel.

::: tip
You can set the Faker locale by adding a `faker_locale` option to your `config/app.php` configuration file.
:::

### Extending Factories

If you have extended a model, you may wish to extend its factory as well in order to utilize the child model's factory attributes during testing and seeding. To accomplish this, you may call the factory builder's `raw` method to obtain the raw array of attributes from any given factory:

```php
$factory->define(App\Admin::class, function (Faker\Generator $faker) {
    return factory(App\User::class)->raw([
        // ...
    ]);
});
```

### Factory States

States allow you to define discrete modifications that can be applied to your model factories in any combination. For example, your `User` model might have a `delinquent` state that modifies one of its default attribute values. You may define your state transformations using the `state` method. For simple states, you may pass an array of attribute modifications:

```php
$factory->state(App\User::class, 'delinquent', [
    'account_status' => 'delinquent',
]);
```

If your state requires calculation or a `$faker` instance, you may use a Closure to calculate the state's attribute modifications:

```php
$factory->state(App\User::class, 'address', function ($faker) {
    return [
        'address' => $faker->address,
    ];
});
```

### Factory Callbacks

Factory callbacks are registered using the `afterMaking` and `afterCreating` methods, and allow you to perform additional tasks after making or creating a model. For example, you may use callbacks to relate additional models to the created model:

```php
$factory->afterMaking(App\User::class, function ($user, $faker) {
    // ...
});

$factory->afterCreating(App\User::class, function ($user, $faker) {
    $user->accounts()->save(factory(App\Account::class)->make());
});
```

You may also define callbacks for [factory states](#factory-states):

```php
$factory->afterMakingState(App\User::class, 'delinquent', function ($user, $faker) {
    // ...
});

$factory->afterCreatingState(App\User::class, 'delinquent', function ($user, $faker) {
    // ...
});
```

## Using Factories

### Creating Models

Once you have defined your factories, you may use the global `factory` function in your feature tests or seed files to generate model instances. So, let's take a look at a few examples of creating models. First, we'll use the `make` method to create models but not save them to the database:

```php
public function testDatabase()
{
    $user = factory(App\User::class)->make();

    // Use model in tests...
}
```

You may also create a Collection of many models or create models of a given type:

```php
// Create three App\User instances...
$users = factory(App\User::class, 3)->make();
```

#### Applying States

You may also apply any of your [states](#factory-states) to the models. If you would like to apply multiple state transformations to the models, you should specify the name of each state you would like to apply:

```php
$users = factory(App\User::class, 5)->states('delinquent')->make();

$users = factory(App\User::class, 5)->states('premium', 'delinquent')->make();
```

#### Overriding Attributes

If you would like to override some of the default values of your models, you may pass an array of values to the `make` method. Only the specified values will be replaced while the rest of the values remain set to their default values as specified by the factory:

```php
$user = factory(App\User::class)->make([
    'name' => 'Abigail',
]);
```

::: tip
[Mass assignment protection](/docs/eloquent#mass-assignment) is automatically disabled when creating models using factories.
:::

### Persisting Models

The `create` method not only creates the model instances but also saves them to the database using Eloquent's `save` method:

```php
public function testDatabase()
{
    // Create a single App\User instance...
    $user = factory(App\User::class)->create();

    // Create three App\User instances...
    $users = factory(App\User::class, 3)->create();

    // Use model in tests...
}
```

You may override attributes on the model by passing an array to the `create` method:

```php
$user = factory(App\User::class)->create([
    'name' => 'Abigail',
]);
```

### Relationships

In this example, we'll attach a relation to some created models. When using the `create` method to create multiple models, an Eloquent [collection instance](/docs/eloquent-collections) is returned, allowing you to use any of the convenient functions provided by the collection, such as `each`:

```php
$users = factory(App\User::class, 3)
    ->create()
    ->each(function ($user) {
    $user->posts()->save(factory(App\Post::class)->make());
    });
```

You may use the `createMany` method to create multiple related models:

```php
$user->posts()->createMany(
    factory(App\Post::class, 3)->make()->toArray()
);
```

#### Relations & Attribute Closures

You may also attach relationships to models in your factory definitions. For example, if you would like to create a new `User` instance when creating a `Post`, you may do the following:

```php
$factory->define(App\Post::class, function ($faker) {
    return [
        'title' => $faker->title,
        'content' => $faker->paragraph,
        'user_id' => factory(App\User::class),
    ];
});
```

If the relationship depends on the factory that defines it you may provide a callback which accepts the evaluated attribute array:

```php
$factory->define(App\Post::class, function ($faker) {
    return [
        'title' => $faker->title,
        'content' => $faker->paragraph,
        'user_id' => factory(App\User::class),
        'user_type' => function (array $post) {
            return App\User::find($post['user_id'])->type;
        },
    ];
});
```
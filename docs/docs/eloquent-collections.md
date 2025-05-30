# Eloquent: Collections
[[toc]]

## Introduction

All Eloquent methods that return more than one model result will return instances of the `Hypervel\Database\Eloquent` class, including results retrieved via the `get` method or accessed via a relationship. The Eloquent collection object extends Hypervel's [base collection](/docs/collections), so it naturally inherits dozens of methods used to fluently work with the underlying array of Eloquent models. Be sure to review the Hypervel collection documentation to learn all about these helpful methods!

All collections also serve as iterators, allowing you to loop over them as if they were simple PHP arrays:

```php
use App\Models\User;

$users = User::where('active', 1)->get();

foreach ($users as $user) {
    echo $user->name;
}
```

However, as previously mentioned, collections are much more powerful than arrays and expose a variety of map / reduce operations that may be chained using an intuitive interface. For example, we may remove all inactive models and then gather the first name for each remaining user:

```php
$names = User::all()->reject(function ($user) {
    return $user->active === false;
})->map(function ($user) {
    return $user->name;
});
```

#### Eloquent Collection Conversion

While most Eloquent collection methods return a new instance of an Eloquent collection, the `collapse`, `flatten`, `flip`, `keys`, `pluck`, and `zip` methods return a [base collection](/docs/collections) instance. Likewise, if a `map` operation returns a collection that does not contain any Eloquent models, it will be converted to a base collection instance.

## Available Methods

All Eloquent collections extend the base [Hypervel collection](/docs/collections#available-methods) object; therefore, they inherit all of the powerful methods provided by the base collection class.

In addition, the `Hypervel\Database\Eloquent` class provides a superset of methods to aid with managing your model collections. Most methods return `Hypervel\Database\Eloquent` instances; however, some methods, like `modelKeys`, return an `Hypervel\Support\Collection` instance.

<style>
    #collection-method-list > p {
        column-count: 1; -moz-column-count: 1; -webkit-column-count: 1;
        column-gap: 2em; -moz-column-gap: 2em; -webkit-column-gap: 2em;
    }

    #collection-method-list a {
        display: block;
    }

    .collection-method code {
        font-size: 14px;
    }

    .collection-method:not(.first-collection-method) {
        margin-top: 50px;
    }
</style>

<div id="collection-method-list" markdown="1">

[contains](#method-contains)
[diff](#method-diff)
[except](#method-except)
[find](#method-find)
[fresh](#method-fresh)
[intersect](#method-intersect)
[load](#method-load)
[loadMissing](#method-loadMissing)
[modelKeys](#method-modelKeys)
[makeVisible](#method-makeVisible)
[makeHidden](#method-makeHidden)
[only](#method-only)
[toQuery](#method-toquery)
[unique](#method-unique)

</div>

<a name="method-contains"></a>
#### contains($key, $operator = null, $value = null)

The `contains` method may be used to determine if a given model instance is contained by the collection. This method accepts a primary key or a model instance:

```php
$users->contains(1);

$users->contains(User::find(1));
```

<a name="method-diff"></a>
#### diff($items)

The `diff` method returns all of the models that are not present in the given collection:

```php
use App\Models\User;

$users = $users->diff(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-except"></a>
#### except($keys)

The `except` method returns all of the models that do not have the given primary keys:

```php
$users = $users->except([1, 2, 3]);
```

<a name="method-find"></a>
#### find($key)

The `find` method returns the model that has a primary key matching the given key. If `$key` is a model instance, `find` will attempt to return a model matching the primary key. If `$key` is an array of keys, `find` will return all models which have a primary key in the given array:

```php
$users = User::all();

$user = $users->find(1);
```

<a name="method-fresh"></a>
#### fresh($with = [])

The `fresh` method retrieves a fresh instance of each model in the collection from the database. In addition, any specified relationships will be eager loaded:

```php
$users = $users->fresh();

$users = $users->fresh('comments');
```

<a name="method-intersect"></a>
#### intersect($items)

The `intersect` method returns all of the models that are also present in the given collection:

```php
use App\Models\User;

$users = $users->intersect(User::whereIn('id', [1, 2, 3])->get());
```

<a name="method-load"></a>
#### load($relations)

The `load` method eager loads the given relationships for all models in the collection:

```php
$users->load(['comments', 'posts']);

$users->load('comments.author');
```

<a name="method-loadMissing"></a>
#### loadMissing($relations)

The `loadMissing` method eager loads the given relationships for all models in the collection if the relationships are not already loaded:

```php
$users->loadMissing(['comments', 'posts']);

$users->loadMissing('comments.author');
```

<a name="method-modelKeys"></a>
#### modelKeys()

The `modelKeys` method returns the primary keys for all models in the collection:

```php
$users->modelKeys();

// [1, 2, 3, 4, 5]
```

<a name="method-makeVisible"></a>
#### makeVisible($attributes)

The `makeVisible` method [makes attributes visible](/docs/eloquent-serialization#hiding-attributes-from-json) that are typically "hidden" on each model in the collection:

```php
$users = $users->makeVisible(['address', 'phone_number']);
```

<a name="method-makeHidden"></a>
#### makeHidden($attributes)

The `makeHidden` method [hides attributes](/docs/eloquent-serialization#hiding-attributes-from-json) that are typically "visible" on each model in the collection:

```php
$users = $users->makeHidden(['address', 'phone_number']);
```

<a name="method-only"></a>
#### only($keys)

The `only` method returns all of the models that have the given primary keys:

```php
$users = $users->only([1, 2, 3]);
```

<a name="method-toquery"></a>
#### toQuery()

The `toQuery` method returns an Eloquent query builder instance containing a `whereIn` constraint on the collection model's primary keys:

```php
use App\Models\User;

$users = User::where('status', 'VIP')->get();

$users->toQuery()->update([
    'status' => 'Administrator',
]);
```

<a name="method-unique"></a>
#### unique($key = null, $strict = false)

The `unique` method returns all of the unique models in the collection. Any models of the same type with the same primary key as another model in the collection are removed:

```php
$users = $users->unique();
```

<a name="custom-collections"></a>
## Custom Collections

If you would like to use a custom `Collection` object when interacting with a given model, you may define a `newCollection` method on your model:

```php
<?php

namespace App\Models;

use App\Support\UserCollection;
use Hypervel\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Create a new Eloquent Collection instance.
     */
    public function newCollection(array $models = [])
    {
        return new UserCollection($models);
    }
}
```

Once you have defined a `newCollection` method, you will receive an instance of your custom collection anytime Eloquent would normally return an `Hypervel\Database\Eloquent\Collection` instance. If you would like to use a custom collection for every model in your application, you should define the `newCollection` method on a base model class that is extended by all of your application's models.
# Eloquent: Serialization
[[toc]]

## Introduction

When building JSON APIs, you will often need to convert your models and relationships to arrays or JSON. Eloquent includes convenient methods for making these conversions, as well as controlling which attributes are included in your serializations.

## Serializing Models & Collections

### Serializing To Arrays

To convert a model and its loaded [relationships](/docs/eloquent-relationships) to an array, you should use the `toArray` method. This method is recursive, so all attributes and all relations (including the relations of relations) will be converted to arrays:

```php
$user = App\User::with('roles')->first();

return $user->toArray();
```

To convert only a model's attributes to an array, use the `attributesToArray` method:

```php
$user = App\User::first();

return $user->attributesToArray();
```

You may also convert entire [collections](/docs/eloquent-collections) of models to arrays:

```php
$users = App\User::all();

return $users->toArray();
```

### Serializing To JSON

To convert a model to JSON, you should use the `toJson` method. Like `toArray`, the `toJson` method is recursive, so all attributes and relations will be converted to JSON. You may also specify JSON encoding options [supported by PHP](https://secure.php.net/manual/en/function.json-encode.php):

```php
$user = App\User::find(1);

return $user->toJson();

return $user->toJson(JSON_PRETTY_PRINT);
```

Alternatively, you may cast a model or collection to a string, which will automatically call the `toJson` method on the model or collection:

```php
$user = App\User::find(1);

return (string) $user;
```

Since models and collections are converted to JSON when cast to a string, you can return Eloquent objects directly from your application's routes or controllers:

```php
Route::get('users', function () {
    return App\User::all();
});
```

#### Relationships

When an Eloquent model is converted to JSON, its loaded relationships will automatically be included as attributes on the JSON object. Also, though Eloquent relationship methods are defined using "camel case", a relationship's JSON attribute will be "snake case".

## Hiding Attributes From JSON

Sometimes you may wish to limit the attributes, such as passwords, that are included in your model's array or JSON representation. To do so, add a `$hidden` property to your model:

```php
<?php

namespace App;

use Hypervel\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The attributes that should be hidden for arrays.
     */
    protected array $hidden = ['password'];
}
```

::: note
When hiding relationships, use the relationship's method name.
:::

Alternatively, you may use the `visible` property to define a white-list of attributes that should be included in your model's array and JSON representation. All other attributes will be hidden when the model is converted to an array or JSON:

```php
<?php

namespace App;

use Hypervel\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The attributes that should be visible in arrays.
     */
    protected array $visible = ['first_name', 'last_name'];
}
```

#### Temporarily Modifying Attribute Visibility

If you would like to make some typically hidden attributes visible on a given model instance, you may use the `makeVisible` method. The `makeVisible` method returns the model instance for convenient method chaining:

```php
return $user->makeVisible('attribute')->toArray();
```

Likewise, if you would like to make some typically visible attributes hidden on a given model instance, you may use the `makeHidden` method.

```php
return $user->makeHidden('attribute')->toArray();
```

## Appending Values To JSON

Occasionally, when casting models to an array or JSON, you may wish to add attributes that do not have a corresponding column in your database. To do so, first define an [accessor](/docs/eloquent-mutators) for the value:

```php
<?php

namespace App;

use Hypervel\Database\Eloquent\Model;

class User extends Model
{
    /**
     * Get the administrator flag for the user.
     */
    public function getIsAdminAttribute()
    {
        return $this->attributes['admin'] === 'yes';
    }
}
```

After creating the accessor, add the attribute name to the `appends` property on the model. Note that attribute names are typically referenced in "snake case", even though the accessor is defined using "camel case":

```php
<?php

namespace App;

use Hypervel\Database\Eloquent\Model;

class User extends Model
{
    /**
     * The accessors to append to the model's array form.
     */
    protected array $appends = ['is_admin'];
}
```

Once the attribute has been added to the `appends` list, it will be included in both the model's array and JSON representations. Attributes in the `appends` array will also respect the `visible` and `hidden` settings configured on the model.

#### Appending At Run Time

You may instruct a single model instance to append attributes using the `append` method. Or, you may use the `setAppends` method to override the entire array of appended properties for a given model instance:

```php
return $user->append('is_admin')->toArray();

return $user->setAppends(['is_admin'])->toArray();
```

## Date Serialization

#### Customizing The Date Format Per Attribute

You may customize the serialization format of individual Eloquent date attributes by specifying the date format in the [cast declaration](/docs/eloquent-mutators#attribute-casting):

```php
protected array $casts = [
    'birthday' => 'date:Y-m-d',
    'joined_at' => 'datetime:Y-m-d H:00',
];
```